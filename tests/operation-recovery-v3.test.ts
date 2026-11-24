import { afterEach, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ApprovedWriteOrigin, Operation, RuntimeAdapter, RuntimeCallbacks, StartRun, Thread } from '../packages/contracts/index.ts';
import { Service } from '../packages/core/service.ts';
import { Store } from '../packages/storage/store.ts';

// Issue #1956 T01 baseline: freeze a temporary store between the prepared,
// dispatch, recorded-result and publication phases, reopen it through host
// boot recovery, and compare durable receipts with delivered state. The
// synthetic host executor supplies the local call counts.

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => { vi.restoreAllMocks(); for (const cleanup of cleanups.splice(0)) await cleanup(); });

function syntheticRuntime() {
  const runs: StartRun[] = [];
  let callbacks!: RuntimeCallbacks;
  const runtime: RuntimeAdapter = {
    configure: value => { callbacks = value; },
    models: async () => [{ id: 'test/model', provider: 'test', name: 'Synthetic model' }],
    start: async run => { runs.push(run); }, followUp: async run => { runs.push(run); },
    cancel: async () => {}, compact: async () => {}, history: async () => [], dispose: async () => {},
  };
  return { runtime, runs, events: () => callbacks };
}

async function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'operation-recovery-')), stateDir = join(dir, 'state');
  const calls: string[] = [];
  const executors: Record<string, (op: Operation, control: { signal: AbortSignal }) => Promise<unknown>> = { 'integration.synthetic': async (op: Operation) => { calls.push(op.id); return { ok: true }; } };
  const options = { approvedWriteHooks: true, hostOperationExecutors: executors };
  let store = new Store(stateDir), adapter = syntheticRuntime(), service = new Service(store, adapter.runtime, options);
  cleanups.push(async () => { try { await service.dispose(); } finally { store.close(); rmSync(dir, { recursive: true, force: true }); } });
  await service.recover();
  const send = (type: string, payload: Record<string, unknown> = {}, threadId?: string, id = crypto.randomUUID()) => service.command({ id, type, payload, threadId });
  const thread = (await send('thread.create', { title: 'Recovery audit' })).result as Thread;
  await send('message.send', { content: 'Bind the synthetic model', modelId: 'test/model' }, thread.id);
  await service.deliverOutbox(thread.id);
  return {
    get store() { return store; }, get service() { return service; }, get adapter() { return adapter; }, send, calls, executors, threadId: thread.id, dir,
    restart: async () => {
      await service.dispose(); store.close();
      store = new Store(stateDir); adapter = syntheticRuntime(); service = new Service(store, adapter.runtime, options);
      await service.recover();
    },
    resume: async () => { await send('run.resume', {}, thread.id); await vi.waitFor(() => expect(adapter.runs.length).toBeGreaterThan(0)); },
    seedOp: (over: Partial<Operation> = {}) => {
      const op: Operation = { id: crypto.randomUUID(), threadId: thread.id, revision: 1, kind: 'integration.synthetic', args: {}, resourceIds: [], preconditions: {}, status: 'prepared', approved: true, description: 'Synthetic operation', createdAt: new Date().toISOString(), ...over };
      store.internal('fixture.op', op.threadId, () => store.put('operation', op.id, op.threadId, op)); return op;
    },
    seedInput: (over: Record<string, unknown> = {}) => {
      const input = { id: 'input-' + crypto.randomUUID(), threadId: thread.id, content: 'queued input', status: 'persisted', runId: null, ...over };
      store.internal('fixture.input', input.threadId, () => store.put('outbox', input.id, input.threadId, input)); return input;
    },
    finish: (run: StartRun) => {
      adapter.events().onEvent({ ...run, type: 'input.processing', inputIds: run.inputIds });
      adapter.events().onEvent({ ...run, type: 'assistant.message', content: 'done', inputIds: run.inputIds });
      adapter.events().onEvent({ ...run, type: 'settled' });
    },
  };
}

it('keeps an unapproved prepared operation available for decision across restart', async () => {
  const x = await setup(), op = x.seedOp({ approved: false });
  await x.restart();
  expect(x.store.get<Operation>('operation', op.id)).toMatchObject({ status: 'prepared', approved: false });
  await x.resume();
  await x.send('operation.reject', { operationId: op.id, revision: op.revision }, x.threadId);
  expect(x.store.get<Operation>('operation', op.id)!.status).toBe('cancelled');
});

it('restarts an approved-but-undispatched operation through resume', async () => {
  const x = await setup(), op = x.seedOp({ approved: true });
  // Freeze between operation.approve and the queued dispatch reaching
  // markStarted: approved but still 'prepared'.
  await x.restart();
  expect(x.store.get<Operation>('operation', op.id)).toMatchObject({ status: 'prepared', approved: true });
  expect(x.calls).toEqual([]);
  await x.resume();
  // The interrupted thread re-dispatches the approved operation once, through
  // the normal path, and the recorded receipt is queued for delivery.
  await vi.waitFor(() => expect(x.calls).toEqual([op.id]));
  expect(x.store.get<Operation>('operation', op.id)!.status).toBe('succeeded');
  // The recorded receipt is delivered once through the normal outbox path.
  await vi.waitFor(() => expect(x.adapter.runs.some(run => run.inputIds?.includes('operation-result:' + op.id))).toBe(true));
});

it('keeps a recovered in-flight operation under the run controller so Stop still cancels it', async () => {
  const x = await setup();
  // Park the executor mid-effect: exactly the in-flight work Stop must reach.
  // The run installs its controller after the recovered dispatch captured it,
  // so an orphaned controller would let this operation survive the Stop.
  x.executors['integration.synthetic'] = async (op, control) => { x.calls.push(op.id); await new Promise((_, reject) => control.signal.addEventListener('abort', () => reject(new Error('stopped')))); return { ok: true }; };
  const op = x.seedOp({ approved: true });
  await x.restart();
  await x.resume();
  await vi.waitFor(() => expect(x.calls).toEqual([op.id]));
  await vi.waitFor(() => expect(x.adapter.runs.length).toBeGreaterThan(0));
  await x.send('run.stop', {}, x.threadId);
  await vi.waitFor(() => expect(x.store.get<Operation>('operation', op.id)!.status).toBe('unknown'));
});

it('restarts an approved operation on an uninterrupted thread at recovery', async () => {
  const x = await setup();
  const second = (await x.send('thread.create', { title: 'No run' })).result as Thread;
  const op = x.seedOp({ threadId: second.id, approved: true });
  await x.restart();
  await vi.waitFor(() => expect(x.calls).toEqual([op.id]));
  expect(x.store.get<Operation>('operation', op.id)!.status).toBe('succeeded');
  // The recorded receipt is queued once; with no model bound it waits for the
  // thread's next delivery instead of repeating the effect.
  expect(x.store.get<Record<string, unknown>>('outbox', 'operation-result:' + op.id)).toMatchObject({ status: 'persisted' });
});

it('reconciles a dispatched operation to unknown and gates resume until dispositioned', async () => {
  const x = await setup(), op = x.seedOp({ status: 'running' });
  await x.restart();
  expect(x.store.get<Operation>('operation', op.id)).toMatchObject({ status: 'unknown' });
  await expect(x.send('run.resume', {}, x.threadId)).rejects.toMatchObject({ code: 'RECONCILIATION_REQUIRED' });
  await x.send('operation.reconcile', { operationId: op.id }, x.threadId);
  // integration.synthetic defines no read-only reconciliation: the outcome
  // stays visibly unknown and resume remains gated.
  expect(x.store.get<Operation>('operation', op.id)!.status).toBe('unknown');
  await expect(x.send('run.resume', {}, x.threadId)).rejects.toMatchObject({ code: 'RECONCILIATION_REQUIRED' });
  // The owner's explicit disposition settles the terminal state and un-gates
  // the thread; the observation stays recorded on the operation. Anything
  // other than a terminal disposition is rejected.
  await expect(x.send('operation.reconcile', { operationId: op.id, resolution: 'retry' }, x.threadId)).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  await x.send('operation.reconcile', { operationId: op.id, resolution: 'cancelled' }, x.threadId);
  expect(x.store.get<Operation>('operation', op.id)).toMatchObject({ status: 'cancelled', error: expect.stringContaining('No read-only reconciliation') });
  await x.resume();
});

it('lets an unrelated thread proceed while another stays gated on unknown work', async () => {
  const x = await setup();
  x.seedOp({ status: 'running' });
  const second = (await x.send('thread.create', { title: 'Unblocked' })).result as Thread;
  await x.send('message.send', { content: 'independent work', modelId: 'test/model' }, second.id);
  await x.restart();
  await expect(x.send('run.resume', {}, x.threadId)).rejects.toMatchObject({ code: 'RECONCILIATION_REQUIRED' });
  await x.send('run.resume', {}, second.id);
  await vi.waitFor(() => expect(x.adapter.runs.some(run => run.threadId === second.id)).toBe(true));
});

it('re-delivers a recorded operation result once and never re-queues a handled input', async () => {
  const x = await setup(), op = x.seedOp({ status: 'succeeded', result: { ok: true } });
  const receipt = x.seedInput({ id: 'operation-result:' + op.id, content: 'Executor receipt: operation ' + op.id + ' (integration.synthetic) is succeeded.' });
  const done = x.seedInput({ status: 'handled' });
  await x.restart();
  await x.resume();
  const delivered = x.adapter.runs.at(-1)!;
  expect(delivered.inputIds).toContain(receipt.id);
  expect(delivered.inputIds).not.toContain(done.id);
  x.finish(delivered);
  await vi.waitFor(() => expect(x.store.get<Record<string, unknown>>('outbox', receipt.id)?.status).toBe('handled'));
});

it('retains a claimed write-hook receipt across restart without re-offering it', async () => {
  const x = await setup(), projectRoot = join(x.dir, 'proj');
  const thread = x.store.get<Thread>('thread', x.threadId)!;
  x.store.internal('fixture.project', x.threadId, () => {
    x.store.put('thread', x.threadId, x.threadId, { ...thread, projectId: 'project', workspaceId: 'workspace', sessionPath: '/tmp/session' });
    x.store.put('workspaceProject', 'project', null, { id: 'project', authority: { kind: 'local' } });
    x.store.put('workspaceBinding', 'workspace', x.threadId, { id: 'workspace', threadId: x.threadId, projectId: 'project', path: projectRoot });
  });
  const origin: ApprovedWriteOrigin = { threadId: x.threadId, runId: 'dead-run', epoch: thread.epoch, sessionPath: '/tmp/session', modelId: 'test/model', accountId: null, projectId: 'project', workspaceId: 'workspace', projectRoot };
  const op = x.seedOp({ kind: 'file.replace', status: 'succeeded', approved: true, revision: 3, result: { sha256: 'a'.repeat(64) } });
  // Freeze mid-delivery: the receipt was claimed under the dead run and its
  // hook diagnostic never arrived.
  const input = x.seedInput({
    id: 'operation-result:' + op.id, status: 'processing', runId: 'dead-run', enteredRuntime: true,
    completedWrite: { operationId: op.id, revision: 3, inputId: 'operation-result:' + op.id, origin, path: join(projectRoot, 'f.txt'), sha256: 'a'.repeat(64), bytes: 5 },
    hookClaimed: true,
    hookDiagnostic: { operationId: op.id, revision: 3, inputId: 'operation-result:' + op.id, status: 'unknown', message: 'Hook delivery claimed; completion is not yet known.' },
  });
  await x.restart();
  // Recovery bounds the wait: the claiming run is gone, so the unresolvable
  // diagnostic settles to terminal 'stale'. The retained claim still prevents
  // replaying a write whose hook may already have run.
  expect(x.store.get<Record<string, unknown>>('outbox', input.id)).toMatchObject({ status: 'persisted', hookClaimed: true, hookDiagnostic: { status: 'stale' } });
  await x.resume();
  const delivered = x.adapter.runs.at(-1)!;
  expect(delivered.inputIds).toContain(input.id);
  expect(delivered.completedWrites).toBeUndefined();
  expect(x.store.get<Record<string, unknown>>('outbox', input.id)).toMatchObject({ hookDiagnostic: { status: 'stale' } });
});
