import { testEffectAuthenticator } from './fixtures/effect-authenticator.ts';
import { afterEach, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../packages/storage/store.ts';
import { buildToolRegistry, ToolAuthority } from '../packages/core/tool-authority.ts';
import { __setEffectFaultHookForTests, ToolEffectLedger, createToolEffectFlags } from '../packages/core/tool-effects.ts';
import { disableEffects, observationFreshness, reconcileEffect, recoverEffects, retryDecision } from '../packages/core/effect-recovery.ts';
import { ToolEffectReadModels } from '../packages/core/tool-effect-read-models.ts';
import type { Operation, Thread, ToolCall } from '../packages/contracts/index.ts';

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  __setEffectFaultHookForTests(null);
  vi.restoreAllMocks();
  for (const cleanup of cleanups.splice(0)) await cleanup();
});

const thread = (over: Partial<Thread> = {}): Thread => ({
  id: 'thread-1', title: 't', projectName: null, createdAt: '', updatedAt: '', status: 'working',
  epoch: 1, runId: 'run-1', modelId: 'test/model', sessionPath: null, accountId: 'acct-1', projectId: 'p1', workspaceId: 'w1', ...over,
} as Thread);
const ctx = { threadId: 'thread-1', runId: 'run-1', epoch: 1 };
const call = (commandId: string): ToolCall => ({ name: 'repository_read', args: { commandId, resourceId: 'r' } });

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'harness-effect-recovery-'));
  const store = new Store(join(root, 'state'));
  const authority = new ToolAuthority(buildToolRegistry());
  const ledger = new ToolEffectLedger(store, authority, createToolEffectFlags({ 'audit.effectsV1': true, 'security.authorityV1': true }), testEffectAuthenticator());
  cleanups.push(async () => { store.close(); await rm(root, { recursive: true, force: true }); });
  return { store, authority, ledger };
}

it('leaves nothing durable when the admission boundary faults', async () => {
  const { ledger } = await fixture();
  __setEffectFaultHookForTests(at => { if (at === 'admission') throw new Error('crash'); });
  await expect(ledger.invoke({ call: call('crash-admit'), ctx, thread: thread(), role: 'run' }, async () => 1)).rejects.toThrow('crash');
  expect(ledger.get('crash-admit')).toBeNull();
});

it('marks a dispatched-but-never-settled effect uncertain on recovery', async () => {
  const { store, ledger } = await fixture();
  __setEffectFaultHookForTests(at => { if (at === 'settlement') throw new Error('crash'); });
  await expect(ledger.invoke({ call: call('crash-settle'), ctx, thread: thread(), role: 'run' }, async () => ({ external: true }))).rejects.toThrow('crash');
  __setEffectFaultHookForTests(null);
  expect(ledger.get('crash-settle')?.state).toBe('DISPATCHED');
  const outcome = recoverEffects(store);
  expect(outcome.uncertain).toEqual(['crash-settle']);
  const effect = ledger.get('crash-settle');
  expect(effect?.state).toBe('UNKNOWN_EXTERNAL_OUTCOME');
  expect(effect?.transitions.at(-1)?.note).toBe('host_restart');
});

it('fails undispatched prepared effects as interrupted and keeps transitions', async () => {
  const { store, ledger } = await fixture();
  await expect(ledger.invoke(
    { call: { name: 'task_delegate', args: { commandId: 'pending-1', tasks: [] } }, ctx, thread: thread(), role: 'run' },
    async () => undefined)).rejects.toMatchObject({ code: 'APPROVAL_REQUIRED' });
  const outcome = recoverEffects(store);
  expect(outcome.interrupted).toEqual(['pending-1']);
  expect(ledger.get('pending-1')?.state).toBe('FAILED');
  expect(ledger.get('pending-1')?.transitions.map(t => t.to)).toEqual(['PREPARED', 'FAILED']);
});

it('retries reads only under a fresh valid owner, never ambiguous effects', async () => {
  const { authority, ledger } = await fixture();
  await ledger.invoke({ call: call('retry-source'), ctx, thread: thread(), role: 'run' }, async () => 1);
  const unknown = { ...ledger.get('retry-source')!, state: 'UNKNOWN_EXTERNAL_OUTCOME' as const };
  const read = authority.require('repository_read');
  expect(retryDecision(unknown, read, true)).toEqual({ retry: true, reason: 'read_retryable' });
  expect(retryDecision(unknown, read, false).reason).toBe('owner_revoked');
  expect(retryDecision({ ...unknown, state: 'DISPATCHED' }, read, true).reason).toBe('not_retryable_state');
  const mutation = authority.require('operation_execute');
  expect(retryDecision({ ...unknown, toolId: mutation.id, definitionDigest: mutation.schemaDigest }, mutation, true)).toEqual({ retry: false, reason: 'not_replayable' });
  const provider = authority.require('integration_call');
  expect(retryDecision({ ...unknown, toolId: provider.id, definitionDigest: provider.schemaDigest }, provider, true)).toEqual({ retry: false, reason: 'provider_idempotency_unproven' });
});

it('settles an OPERATION_OUTCOME_UNKNOWN error as uncertain, not failed', async () => {
  const { store, ledger } = await fixture();
  const { HarnessError } = await import('../packages/contracts/index.ts');
  await expect(ledger.invoke({ call: call('u2'), ctx, thread: thread(), role: 'run' }, async () => { throw new HarnessError('OPERATION_OUTCOME_UNKNOWN', 'executor lost'); }))
    .rejects.toThrow('executor lost');
  expect(ledger.get('u2')?.state).toBe('UNKNOWN_EXTERNAL_OUTCOME');
  expect(reconcileEffect(store, 'u2').basis).toBe('unresolved');
  expect(reconcileEffect(store, 'u2').transitions.at(-1)?.to).toBe('UNKNOWN_EXTERNAL_OUTCOME');
});

it('pages invocations through a bounded cursor and fences other owners', async () => {
  const { store, ledger } = await fixture();
  for (const id of ['p1', 'p2', 'p3'])
    await ledger.invoke({ call: call(id), ctx, thread: thread(), role: 'run' }, async () => 1);
  await ledger.invoke({ call: call('other-thread'), ctx: { threadId: 'thread-2', runId: 'r', epoch: 1 }, thread: thread({ id: 'thread-2', runId: 'r' }), role: 'run' }, async () => 1);
  store.internal('fixture.thread', 'thread-1', () => store.put('thread', 'thread-1', 'thread-1', thread()));
  const reads = new ToolEffectReadModels(store);
  const context = reads.context({ threadId: 'thread-1' });
  expect(context.coverage.some(note => note.includes('COVERAGE_GAP'))).toBe(true);
  const page1 = reads.invocations({ threadId: 'thread-1', scopeKey: context.scopeKey, limit: 2 });
  expect(page1.effects).toHaveLength(2);
  expect(page1.freshness).toBe('CURRENT');
  const page2 = reads.invocations({ threadId: 'thread-1', scopeKey: context.scopeKey, limit: 2, cursor: page1.nextCursor! });
  expect(page1.effects.map(e => e.invocationId)).not.toContain('other-thread');
  expect([...page1.effects, ...page2.effects].map(e => e.invocationId)).not.toContain('other-thread');
  const observed = reads.observations({ threadId: 'thread-1', scopeKey: context.scopeKey, invocationId: 'p1' });
  expect(observed.effect.state).toBe('SUCCEEDED');
  expect(() => reads.observations({ threadId: 'thread-1', scopeKey: context.scopeKey, invocationId: 'other-thread' })).toThrowError(/unavailable/);
  expect(() => reads.invocations({ threadId: 'thread-1', scopeKey: context.scopeKey, cursor: 'bogus' })).toThrowError(/reopen/);
});

it('marks outstanding effects uncertain on rollback and preserves approvals', async () => {
  const { store, authority, ledger } = await fixture();
  const definition = authority.require('repository_read');
  const admitted = ledger.admit({ call: call('rb-1'), owner: { threadId: 'thread-1', runId: 'run-1', epoch: 1, projectId: 'p1', workspaceId: 'w1', accountBinding: 'acct-1' }, definition });
  expect(admitted.state).toBe('DISPATCHED');
  const operation = { id: 'op-rb', threadId: 'thread-1', revision: 1, kind: 'file.replace', description: '', args: {}, resourceIds: [], preconditions: {}, status: 'prepared' as const, approved: true, createdAt: '' };
  const approval = ledger.issueApproval(operation, thread());
  store.internal('fixture.approval', 'thread-1', () => store.put('approval', approval.approvalId, 'thread-1', { ...approval, remainingUses: 0 }));
  const result = disableEffects(store);
  expect(result.marked).toEqual(['rb-1']);
  expect(ledger.get('rb-1')?.state).toBe('UNKNOWN_EXTERNAL_OUTCOME');
  expect(store.get<{ remainingUses: number }>('approval', approval.approvalId)?.remainingUses).toBe(0);
});

it('reports observation freshness independent of outcome', async () => {
  const { store } = await fixture();
  const fence = store.sequence;
  expect(observationFreshness(store, fence)).toBe('CURRENT');
  store.internal('fixture.tick', 'thread-1', () => ({ n: 1 }));
  expect(observationFreshness(store, fence)).toBe('STALE');
  expect(observationFreshness(store, null)).toBe('INDETERMINATE');
});

it('does not repeat an effect across an invocation page boundary', async () => {
  const { store, ledger } = await fixture();
  for (const id of ['b1', 'b2', 'b3'])
    await ledger.invoke({ call: call(id), ctx, thread: thread(), role: 'run' }, async () => 1);
  store.internal('fixture.thread', 'thread-1', () => store.put('thread', 'thread-1', 'thread-1', thread()));
  const reads = new ToolEffectReadModels(store);
  const context = reads.context({ threadId: 'thread-1' });
  const seen: string[] = [];
  let cursor: string | undefined;
  do {
    const page = reads.invocations({ threadId: 'thread-1', scopeKey: context.scopeKey, limit: 2, cursor });
    seen.push(...page.effects.map(e => e.invocationId));
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  expect(seen).toHaveLength(3);
  expect(new Set(seen).size).toBe(3);
});

const crashedOperation = { id: 'op-crash', threadId: 'thread-1', revision: 1, kind: 'file.replace', description: '', args: {}, resourceIds: [], preconditions: {}, status: 'succeeded' as const, approved: true, createdAt: '', result: { done: true } };

function commitAdmittedOperation(store: Store, ledger: ToolEffectLedger, preconditions: Record<string, string> = {}, recorded: Record<string, string> = preconditions) {
  const owner = thread();
  const prepared = { ...crashedOperation, status: 'prepared' as const, preconditions };
  const approval = ledger.issueApproval(prepared, owner);
  store.internal('fixture.initial', owner.id, () => {
    store.put('thread', owner.id, owner.id, owner);
    store.put('operation', prepared.id, owner.id, prepared);
    store.put('approval', approval.approvalId, owner.id, approval);
  });
  const admitted = ledger.admitOperationDispatch(prepared, owner, () =>
    store.put('operation', prepared.id, owner.id, { ...prepared, status: 'running' }));
  expect(admitted?.state).toBe('DISPATCHED');
  store.internal('fixture.completed', owner.id, () =>
    store.put('operation', prepared.id, owner.id, { ...prepared, status: 'succeeded', preconditions: recorded, result: { done: true } }));
  return approval;
}

it('settles a crashed operation dispatch only from signed, consumed and unchanged dispatch evidence', async () => {
  const { store, ledger } = await fixture();
  commitAdmittedOperation(store, ledger);
  const outcome = recoverEffects(store, ledger);
  expect(outcome.uncertain).toEqual([]);
  const effect = ledger.get('operation:op-crash@1');
  expect(effect?.state).toBe('SUCCEEDED');
  expect(effect?.transitions.at(-1)?.note).toBe('host_restart: recorded in operation ledger');
});

it('does not inherit an operation outcome onto a forged invocation identity', async () => {
  const { store, authority, ledger } = await fixture();
  // A caller-chosen invocationId that merely LOOKS like op-crash's dispatch:
  // the recorded tool and owner do not match the operation, so the effect
  // stays uncertain rather than inheriting the recorded success.
  const admitted = ledger.admit({
    call: { name: 'repository_read', args: { commandId: 'operation:op-crash@1', resourceId: 'r' } },
    owner: { threadId: 'thread-1', runId: 'run-1', epoch: 1, projectId: 'p1', workspaceId: 'w1', accountBinding: 'acct-1' },
    definition: authority.require('repository_read'),
  });
  expect(admitted.state).toBe('DISPATCHED');
  store.internal('fixture.operation', 'thread-1', () => store.put('operation', 'op-crash', 'thread-1', crashedOperation));
  const outcome = recoverEffects(store, ledger);
  expect(outcome.uncertain).toEqual(['operation:op-crash@1']);
  expect(ledger.get('operation:op-crash@1')?.state).toBe('UNKNOWN_EXTERNAL_OUTCOME');
});

it.each(['operation:op-crash@01', 'operation:op-crash@0001'] as const)('does not settle noncanonical operation receipt %s', async invocationId => {
  const { store, ledger } = await fixture();
  commitAdmittedOperation(store, ledger, { path: '/approved' });
  const canonical = ledger.get('operation:op-crash@1')!;
  store.internal('fixture.alias', 'thread-1', () => {
    store.put('toolEffect', canonical.invocationId, canonical.threadId, { ...canonical, state: 'UNKNOWN_EXTERNAL_OUTCOME' });
    store.put('toolEffect', invocationId, canonical.threadId, { ...canonical, invocationId, effectId: 'eff_' + invocationId, state: 'DISPATCHED' });
  });
  const result = recoverEffects(store, ledger);
  expect(result.uncertain).toContain(invocationId);
  expect(ledger.get(invocationId)?.state).toBe('UNKNOWN_EXTERNAL_OUTCOME');
});

const recoveryTargetCases: { admitted: Record<string, string>; recorded: Record<string, string>; expected: 'SUCCEEDED' | 'UNKNOWN_EXTERNAL_OUTCOME' }[] = [
  { admitted: { path: '/approved' }, recorded: { path: '/approved' }, expected: 'SUCCEEDED' },
  { admitted: { path: '/changed' }, recorded: { path: '/approved' }, expected: 'UNKNOWN_EXTERNAL_OUTCOME' },
  { admitted: { path: '/approved', revision: '2' }, recorded: { path: '/approved', revision: '1' }, expected: 'UNKNOWN_EXTERNAL_OUTCOME' },
  { admitted: { path: '/approved' }, recorded: { path: '/approved', revision: '1' }, expected: 'UNKNOWN_EXTERNAL_OUTCOME' },
  { admitted: { path: 'draft=approved' }, recorded: { path: 'draft=approved' }, expected: 'UNKNOWN_EXTERNAL_OUTCOME' },
  { admitted: { path: 'draft=approved' }, recorded: { 'path=draft': 'approved' }, expected: 'UNKNOWN_EXTERNAL_OUTCOME' },
];
it.each(recoveryTargetCases)('recovers only an exact authenticated target ($expected)', async ({ admitted, recorded, expected }) => {
  const { store, ledger } = await fixture();
  commitAdmittedOperation(store, ledger, admitted, recorded);
  const outcome = recoverEffects(store, ledger);
  expect(ledger.get('operation:op-crash@1')?.state).toBe(expected);
  expect(outcome.uncertain).toEqual(expected === 'SUCCEEDED' ? [] : ['operation:op-crash@1']);
});

it.each(['args', 'resourceIds', 'kind', 'run', 'epoch', 'account', 'project', 'workspace',
  'definitionDigest', 'privateArgumentCommitment', 'approvalId', 'spentGrant'] as const)
('quarantines recorded success after %s provenance drift', async field => {
  const { store, ledger } = await fixture();
  const approval = commitAdmittedOperation(store, ledger, { path: '/approved' });
  store.internal('fixture.provenance-drift', 'thread-1', () => {
    const operation = store.get<Operation>('operation', 'op-crash')!;
    const owner = store.get<Thread>('thread', 'thread-1')!;
    const effect = ledger.get('operation:op-crash@1')!;
    if (field === 'args') store.put('operation', operation.id, operation.threadId, { ...operation, args: { path: '/changed' } });
    else if (field === 'resourceIds') store.put('operation', operation.id, operation.threadId, { ...operation, resourceIds: ['new-resource'] });
    else if (field === 'kind') store.put('operation', operation.id, operation.threadId, { ...operation, kind: 'folder.delete' });
    else if (field === 'run') store.put('thread', owner.id, owner.id, { ...owner, runId: 'other-run' });
    else if (field === 'epoch') store.put('thread', owner.id, owner.id, { ...owner, epoch: 2 });
    else if (field === 'account') store.put('thread', owner.id, owner.id, { ...owner, accountId: 'other-account' });
    else if (field === 'project') store.put('thread', owner.id, owner.id, { ...owner, projectId: 'other-project' });
    else if (field === 'workspace') store.put('thread', owner.id, owner.id, { ...owner, workspaceId: 'other-workspace' });
    else if (field === 'definitionDigest') store.put('toolEffect', effect.invocationId, effect.threadId, { ...effect, definitionDigest: 'altered' });
    else if (field === 'privateArgumentCommitment') store.put('toolEffect', effect.invocationId, effect.threadId, { ...effect, privateArgumentCommitment: 'altered' });
    else if (field === 'approvalId') store.put('toolEffect', effect.invocationId, effect.threadId, { ...effect, approvalId: 'other-grant' });
    else if (field === 'spentGrant') {
      const grant = store.get('approval', approval.approvalId) as { remainingUses: number };
      store.put('approval', approval.approvalId, owner.id, { ...grant, remainingUses: 1 });
    }
  });
  const result = recoverEffects(store, ledger);
  expect(result.uncertain).toEqual(['operation:op-crash@1']);
  expect(ledger.get('operation:op-crash@1')?.state).toBe('UNKNOWN_EXTERNAL_OUTCOME');
});

it('quarantines malformed persisted recovery intent without terminating startup', async () => {
  const { store, ledger } = await fixture();
  commitAdmittedOperation(store, ledger);
  const operation = store.get<Operation>('operation', 'op-crash')!;
  store.internal('fixture.malformed', 'thread-1', () =>
    store.put('operation', operation.id, operation.threadId, { ...operation, args: null }));
  expect(() => recoverEffects(store, ledger)).not.toThrow();
  expect(ledger.get('operation:op-crash@1')?.state).toBe('UNKNOWN_EXTERNAL_OUTCOME');
});

it('requires host signing custody before inheriting an otherwise identical committed result', async () => {
  const { store, ledger } = await fixture();
  commitAdmittedOperation(store, ledger);
  const result = recoverEffects(store);
  expect(result.uncertain).toEqual(['operation:op-crash@1']);
  expect(ledger.get('operation:op-crash@1')?.state).toBe('UNKNOWN_EXTERNAL_OUTCOME');
});

it.each(['id', 'schemaDigest'] as const)('refuses retry after the registered %s changes', async field => {
  const { authority, ledger } = await fixture();
  await ledger.invoke({ call: call('retry-drift'), ctx, thread: thread(), role: 'run' }, async () => 1);
  const effect = { ...ledger.get('retry-drift')!, state: 'UNKNOWN_EXTERNAL_OUTCOME' as const };
  const before = structuredClone(effect);
  expect(retryDecision(effect, { ...authority.require('repository_read'), [field]: 'changed' }, true))
    .toEqual({ retry: false, reason: 'definition_changed' });
  expect(effect).toEqual(before);
});

it.each(['UNKNOWN_EXTERNAL_OUTCOME', 'FAILED'] as const)('quarantines %s provider effects without a proven contract and exact key', async state => {
  const { authority, ledger } = await fixture();
  const definition = authority.require('integration_call');
  const effect = ledger.admit({ call: { name: definition.id, args: { invocationId: 'provider-retry' } },
    owner: { threadId: 'thread-1', runId: 'run-1', epoch: 1, projectId: 'p1', workspaceId: 'w1', accountBinding: 'acct-1' }, definition });
  const before = structuredClone(effect);
  expect(retryDecision({ ...effect, state }, definition, true)).toEqual({ retry: false, reason: 'provider_idempotency_unproven' });
  expect(ledger.get(effect.invocationId)).toEqual(before);
});

it('does not admit a write merely because it is marked READ_RETRYABLE', async () => {
  const { authority, ledger } = await fixture();
  await ledger.invoke({ call: call('retry-write'), ctx, thread: thread(), role: 'run' }, async () => 1);
  const effect = { ...ledger.get('retry-write')!, state: 'FAILED' as const };
  expect(retryDecision(effect, { ...authority.require('repository_read'), risk: 'NETWORK_WRITE' }, true))
    .toEqual({ retry: false, reason: 'not_read_only' });
});

it('fails closed for an unclassified replay value', async () => {
  const { authority, ledger } = await fixture();
  await ledger.invoke({ call: call('retry-unknown'), ctx, thread: thread(), role: 'run' }, async () => 1);
  const definition = authority.require('repository_read');
  expect(retryDecision({ ...ledger.get('retry-unknown')!, state: 'FAILED' },
    { ...definition, replayClass: 'FUTURE' as typeof definition.replayClass }, true))
    .toEqual({ retry: false, reason: 'unclassified_replay' });
});
