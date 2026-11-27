import { afterEach, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Store } from "../packages/storage/store.ts";
import { Service } from "../packages/core/service.ts";
import { AgentWorkCoordinator, type AgentWorkHooks } from "../packages/core/agent-work.ts";
import { __setCapabilityFlagForTests } from "../packages/core/capability-flags.ts";
import type { RunContext, RuntimeAdapter, Thread } from "../packages/contracts/index.ts";

// Issue #2038 requires distinct child allocation and exact M02/M03 proof.
// Enabling a flag or having a parent's managed binding supplies neither.
// These store-only checks assert the unavailable production state; they do
// not qualify native child isolation or platform execution.
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  try { for (const close of cleanups.splice(0).reverse()) await close(); }
  finally {
    __setCapabilityFlagForTests('agents.workV1', undefined);
    __setCapabilityFlagForTests('workspace.writeDelegateV1', undefined);
  }
});
const ctx: RunContext = {threadId: 'parent', runId: 'run', epoch: 1};
async function storeFixture() {
  const root = await mkdtemp(join(tmpdir(), 'agent-work-join-'));
  const store = new Store(join(root, 'state'));
  cleanups.push(async () => {store.close(); await rm(root, {recursive: true, force: true, maxRetries: 5});});
  const thread: Thread = {id: ctx.threadId, title: 'Parent', projectName: 'Project', createdAt: '2026-11-25T00:00:00Z', updatedAt: '2026-11-25T00:00:00Z', status: 'working', epoch: ctx.epoch, runId: ctx.runId, modelId: 'test/model', sessionPath: null, projectId: 'project', workspaceId: 'parent-worktree'};
  store.internal('fixture.parent', thread.id, () => store.put('thread', thread.id, thread.id, thread));
  return store;
}
async function setup(extra: Partial<AgentWorkHooks> = {}) {
  const store = await storeFixture();
  const coordinator = new AgentWorkCoordinator({store, assertRun: () => {}, isEnabled: () => true, resourceResolver: async () => ({}), ...extra});
  cleanups.push(() => coordinator.dispose());
  return {store, coordinator};
}
const admission = {commandId: 'admit', workId: 'work', role: 'CODE_WORKTREE', childThreadId: 'child', prompt: 'Stay within the approved child worktree.', expectedOutputSchema: {type: 'object'}, grantSubset: [], budget: {tokens: 100, ms: 5000}};

it('keeps CODE_WORKTREE unavailable without a registered proof even when its flags are on', async () => {
  const {coordinator} = await setup();
  expect(coordinator.roleAvailability(ctx, 'CODE_WORKTREE')).toEqual({available: false, reason: 'no managed-worktree profile proof'});
  expect(coordinator.roleAvailability(ctx, 'PLAN_READ')).toEqual({available: true});
  expect(coordinator.roleAvailability(ctx, 'RESEARCH_READ')).toEqual({available: true});
});
it('retains the trusted host proof extension without treating the fixture as native qualification', async () => {
  const {coordinator} = await setup({roleProofs: {codeWorktree: async () => ({worktreeId: 'child-worktree', path: '/synthetic-child', profileDigest: 'synthetic-proof'})}});
  expect(coordinator.roleAvailability(ctx, 'CODE_WORKTREE')).toEqual({available: true});
});
it.each([false, true])('refuses admission with missing proof (registered provider: %s) before recording child work', async registered => {
  const {store, coordinator} = await setup(registered ? {roleProofs: {codeWorktree: async () => null}} : {});
  const before = store.sequence;
  await expect(coordinator.admit(ctx, admission, new AbortController().signal)).rejects.toMatchObject({code: 'ROLE_UNAVAILABLE'});
  expect(store.sequence).toBe(before);
  expect(store.all('agentWork')).toEqual([]);
  expect(store.get('thread', 'child')).toBeNull();
});
it('the actual Service keeps write children unavailable while preserving read roles', async () => {
  __setCapabilityFlagForTests('agents.workV1', true as never);
  __setCapabilityFlagForTests('workspace.writeDelegateV1', true as never);
  const store = await storeFixture();
  const runtime: RuntimeAdapter = {configure: () => {}, models: async () => [], start: async () => {}, followUp: async () => {}, cancel: async () => {}, compact: async () => {}, history: async () => [], dispose: async () => {}};
  const service = new Service(store, runtime);
  cleanups.push(() => service.dispose());
  expect(service.agentWork.roleAvailability(ctx, 'CODE_WORKTREE')).toEqual({available: false, reason: 'no managed-worktree profile proof'});
  expect(service.agentWork.roleAvailability(ctx, 'PLAN_READ')).toEqual({available: true});
  expect(service.agentWork.roleAvailability(ctx, 'RESEARCH_READ')).toEqual({available: true});
});
