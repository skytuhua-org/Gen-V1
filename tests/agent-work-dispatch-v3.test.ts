import {afterEach, describe, expect, it} from 'vitest';
import {mkdtempSync, realpathSync, lstatSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve, sep} from 'node:path';
import {randomUUID} from 'node:crypto';
import {Store} from '../packages/storage/store.ts';
import type {ResourceGrant, RunContext, Thread} from '../packages/contracts/index.ts';
import {AgentWorkCoordinator, type AgentWorkChild} from '../packages/core/agent-work.ts';
import {capabilityEnabled, __setCapabilityFlagForTests} from '../packages/core/capability-flags.ts';

// T02 reproduction for issue #2041: production wires AgentWorkCoordinator
// without a runtimeFactory (createHermesService never passes
// agentWorkRuntimeFactory), so dispatch falls back to a no-op child and
// still records the work RUNNING — a phantom running state with nothing
// behind it. An admission with no runtime must not become RUNNING; the
// failing spec below pins that boundary until T03 lands the repair.
// Positive control: an explicit runtime factory still reaches RUNNING.

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
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
  // Desired contract (issue #2041 OBJECTIVE): with no runtimeFactory there is
  // nothing to receive START; the work must never be recorded RUNNING. T03:
  // the coordinator refuses with RUNTIME_FAILURE and leaves a durable FAILED
  // record — honest terminal state, budget reservation released.
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
