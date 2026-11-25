import {afterEach, describe, expect, it, vi} from 'vitest';
import {mkdtempSync, realpathSync, lstatSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve, sep} from 'node:path';
import {randomUUID} from 'node:crypto';
import {Store} from '../packages/storage/store.ts';
import type {ResourceGrant, RunContext, RuntimeAdapter, Thread} from '../packages/contracts/index.ts';
import {AgentWorkCoordinator, type AgentWorkChild} from '../packages/core/agent-work.ts';
import {capabilityEnabled, __setCapabilityFlagForTests} from '../packages/core/capability-flags.ts';
import {createHermesService} from '../apps/server/hermes-service.ts';
import * as hermes from '../packages/runtime-hermes/index.ts';
import type {HermesClient} from '../packages/runtime-hermes/client.ts';

// T02 reproduction for issue #2041: production wires AgentWorkCoordinator
// without a runtimeFactory (createHermesService never passes
// agentWorkRuntimeFactory), so dispatch falls back to a no-op child and
// still records the work RUNNING — a phantom running state with nothing
// behind it. An admission with no runtime must not become RUNNING; the
// failing spec below pins that boundary until T03 lands the repair.
// Positive control: an explicit runtime factory still reaches RUNNING.

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  __setCapabilityFlagForTests('agents.workV1', undefined);
  for (const close of cleanups.splice(0).reverse()) await close();
});

class FakeChild implements AgentWorkChild {
  sent: {inputId: string; kind: string; text: string}[] = [];
  async send(input: {inputId: string; kind: string; text: string}) { this.sent.push(input); }
  async cancel() {}
  async dispose() {}
  supportsLiveSteer = false;
}

const outputSchema = {
  type: 'object',
  required: ['outcome', 'summary', 'evidenceRefs', 'requirementIds'],
  properties: {
    outcome: {enum: ['COMPLETED', 'INCOMPLETE', 'BLOCKED']},
    summary: {type: 'string'},
    evidenceRefs: {type: 'array'},
    requirementIds: {type: 'array'},
  },
};

function fixture(withRuntime: boolean) {
  const base = realpathSync(tmpdir()), directory = mkdtempSync(join(base, 'agent-work-dispatch-')), store = new Store(directory);
  __setCapabilityFlagForTests('agents.workV1', true as never);
  const child = new FakeChild();
  const coordinator = new AgentWorkCoordinator({
    store,
    assertRun: () => {},
    isEnabled: capabilityEnabled,
    resourceResolver: async () => ({handled: true}) as never,
    ...(withRuntime ? {runtimeFactory: () => child} : {}),
  });
  const parentThread: Thread = {id: 'parent-1', title: 'Parent', projectName: 'proj', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: 'working', epoch: 1, runId: 'run-1', modelId: 'test/model', sessionPath: null, accountId: 'acct-1', projectId: 'proj-1', workspaceId: 'ws-1'};
  const grant: ResourceGrant = {id: 'grant-0', threadId: parentThread.id, kind: 'project', path: 'C:/work/wt-0', label: 'g0', writable: true, createdAt: new Date().toISOString()};
  store.internal('fixture', parentThread.id, () => {
    store.put('thread', parentThread.id, parentThread.id, parentThread);
    store.put('resource', grant.id, parentThread.id, grant);
  });
  cleanups.push(async () => {await coordinator.dispose(); store.close(); if (realpathSync(directory) !== resolve(directory) || !directory.startsWith(base + sep) || lstatSync(directory).isSymbolicLink()) throw Error('Unsafe fixture cleanup'); rmSync(directory, {recursive: true, force: true});});
  const ctx: RunContext = {threadId: parentThread.id, runId: 'run-1', epoch: 1};
  const admission = () => ({
    commandId: 'admit-' + randomUUID().slice(0, 8), workId: 'work-' + randomUUID().slice(0, 8),
    role: 'PLAN_READ', childThreadId: 'child-' + randomUUID().slice(0, 8), prompt: 'Read and report.',
    expectedOutputSchema: outputSchema, grantSubset: [grant.id], budget: {tokens: 100, ms: 5000},
  });
  return {store, coordinator, child, ctx, admission};
}

describe('AgentWorkV1 dispatch requires a real runtime', () => {
  it.each(['PLAN_READ', 'RESEARCH_READ'] as const)('production %s factory completes through the advertised Hermes result contract', async (role) => {
    const f = fixture(false);
    f.store.internal('fixture.model', f.ctx.threadId, () => {
      const parent = f.store.get<Thread>('thread', f.ctx.threadId)!;
      f.store.put('thread', parent.id, parent.id, {...parent, modelId: 'openai/model', accountId: null});
    });
    const sources: {options: ConstructorParameters<typeof HermesClient>[0]; start?: Record<string, unknown>}[] = [];
    const createRuntime = hermes.createHermesRuntime;
    // Only the external source process is synthetic. Production composition,
    // task runtime, captured tool gate, and coordinator result intake all run.
    vi.spyOn(hermes, 'createHermesRuntime').mockImplementationOnce(options => createRuntime(options, {
      createClient(sourceOptions) {
        const source: typeof sources[number] = {options: sourceOptions}; sources.push(source);
        return {
          async request<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
            if (method === 'hello') return {protocolVersion: 1, engineClass: 'run_agent.AIAgent', sourceCommit: 'c627ec84664d43e0b18b95d9d86d8963747d56c7'} as T;
            if (method === 'agent.start') source.start = params;
            return {accepted: true} as T;
          },
          async dispose() {},
        };
      },
    }));
    const native: RuntimeAdapter = {configure() {}, models: async () => [], start: async () => {}, followUp: async () => {}, cancel: async () => {}, compact: async () => {}, history: async () => [], dispose: async () => {}};
    const service = createHermesService(f.store, native);
    cleanups.push(() => service.dispose());
    const work = await service.agentWork.admit(f.ctx, {...f.admission(), role}, new AbortController().signal);
    const source = sources.find(item => item.start)!;
    const tools = source.start!.hostTools as {name: string; parameters: Record<string, unknown>}[];
    expect(tools.map(tool => tool.name)).toContain('agent_result');
    expect(tools.map(tool => tool.name)).not.toContain('task_finish');
    expect(source.start!.systemPrompt).toContain('agent_result');
    expect(tools.find(tool => tool.name === 'agent_result')?.parameters).toMatchObject({properties: {output: {allOf: [outputSchema, {required: expect.arrayContaining(['outcome', 'summary', 'evidenceRefs', 'requirementIds', ...(role === 'RESEARCH_READ' ? ['citationRefs'] : [])])}]}}, required: ['output']});
    const supplied = {...source.start!.ctx as Record<string, unknown>, phase: 'foreground'};
    await expect(source.options.onHostCall!({id: 'denied', name: 'task_finish', args: {}, ctx: supplied})).rejects.toMatchObject({code: 'HERMES_TOOL_DENIED'});
    const result = await source.options.onHostCall!({id: 'result', name: 'agent_result', args: {output: {outcome: 'COMPLETED', summary: 'Read complete', evidenceRefs: [], requirementIds: ['r1'], ...(role === 'RESEARCH_READ' ? {citationRefs: []} : {})}}, ctx: supplied});
    expect(result).toMatchObject({workId: work.workId, state: 'COMPLETED_REPORTED'});
    source.options.onEvent?.({event: 'settled', ctx: supplied, data: {}});
    expect(f.store.get<{state: string}>('agentWork', work.workId)?.state).toBe('COMPLETED_REPORTED');
    expect(service.agentWork.budgetLedger()).toMatchObject({reservedTokens: 0, completed: 1, failed: 0});
  });

  // Desired contract (issue #2041 OBJECTIVE): with no runtimeFactory there is
  // nothing to receive START; the work must never be recorded RUNNING. T03:
  // the coordinator refuses with RUNTIME_FAILURE and leaves a durable FAILED
  // record — honest terminal state, budget reservation released.
  it('rewrites root-local $refs when the output schema is embedded in the advertised tool', async () => {
    const f = fixture(false);
    f.store.internal('fixture.model', f.ctx.threadId, () => {
      const parent = f.store.get<Thread>('thread', f.ctx.threadId)!;
      f.store.put('thread', parent.id, parent.id, {...parent, modelId: 'openai/model', accountId: null});
    });
    const sources: {options: ConstructorParameters<typeof HermesClient>[0]; start?: Record<string, unknown>}[] = [];
    const createRuntime = hermes.createHermesRuntime;
    vi.spyOn(hermes, 'createHermesRuntime').mockImplementationOnce(options => createRuntime(options, {
      createClient(sourceOptions) {
        const source: typeof sources[number] = {options: sourceOptions}; sources.push(source);
        return {
          async request<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
            if (method === 'hello') return {protocolVersion: 1, engineClass: 'run_agent.AIAgent', sourceCommit: 'c627ec84664d43e0b18b95d9d86d8963747d56c7'} as T;
            if (method === 'agent.start') source.start = params;
            return {accepted: true} as T;
          },
          async dispose() {},
        };
      },
    }));
    const native: RuntimeAdapter = {configure() {}, models: async () => [], start: async () => {}, followUp: async () => {}, cancel: async () => {}, compact: async () => {}, history: async () => [], dispose: async () => {}};
    const service = createHermesService(f.store, native);
    cleanups.push(() => service.dispose());
    const refSchema = {type: 'object', properties: {outcome: {$ref: '#/$defs/outcome'}}, $defs: {outcome: {enum: ['COMPLETED']}}};
    await service.agentWork.admit(f.ctx, {...f.admission(), expectedOutputSchema: refSchema}, new AbortController().signal);
    const tools = sources.find(item => item.start)!.start!.hostTools as {name: string; parameters: Record<string, unknown>}[];
    const advertised = JSON.stringify(tools.find(tool => tool.name === 'agent_result')!.parameters);
    // Inside the composed document the ref must point at the embedded copy,
    // never at the outer document root, where it would dangle.
    expect(advertised).toContain('#/properties/output/allOf/0/$defs/outcome');
    expect(advertised).not.toContain('"$ref":"#/$defs/outcome"');
  });

  it('an admission without a runtime factory cannot record RUNNING', async () => {
    const f = fixture(false);
    const spec = f.admission();
    await expect(f.coordinator.admit(f.ctx, spec, new AbortController().signal)).rejects.toMatchObject({code: 'RUNTIME_FAILURE'});
    const work = f.store.get<{state: string; failureReason?: string}>('agentWork', spec.workId);
    expect(work?.state).toBe('FAILED');
    expect(work?.failureReason).toBe('RUNTIME_FAILURE');
  });

  // Positive control: an explicit runtime factory still reaches RUNNING.
  it('admits and reaches RUNNING when a real runtime factory is wired', async () => {
    const f = fixture(true);
    const work = await f.coordinator.admit(f.ctx, f.admission(), new AbortController().signal);
    expect(work.state).toBe('RUNNING');
    expect(f.child.sent[0]).toMatchObject({kind: 'START'});
  });
});
