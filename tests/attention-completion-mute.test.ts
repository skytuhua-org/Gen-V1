import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { Store } from '../packages/storage/store.ts';
import { Service } from '../packages/core/service.ts';
import { AttentionRepository } from '../packages/core/attention.ts';
import type { RuntimeAdapter, Thread } from '../packages/contracts/index.ts';

const cleanups: (() => Promise<void> | void)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); });

function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'gen-mute-'));
  const store = new Store(dir);
  const runtime: RuntimeAdapter = { configure() {}, models: async () => [], start: async () => {}, followUp: async () => {}, cancel: async () => {}, compact: async () => {}, history: async () => [], dispose: async () => {} };
  const service = new Service(store, runtime);
  const attention = new AttentionRepository(store);
  cleanups.push(async () => { await service.dispose(); store.close(); rmSync(dir, { recursive: true, force: true }); });
  const thread: Thread = { id: 'thread-a', title: 'Busy monitor', projectName: 'P', projectId: 'p1', status: 'working', epoch: 1, runId: 'run-a', modelId: null, sessionPath: null, createdAt: '2026-11-04T00:00:00.000Z', updatedAt: '2026-11-04T00:00:00.000Z' };
  store.internal('fixture.thread', thread.id, () => store.put('thread', thread.id, thread.id, thread));
  const send = (type: string, payload: Record<string, unknown> = {}, threadId = thread.id, id = randomUUID()) => service.command({ id, type, payload, threadId });
  const complete = (id: string) => store.internal('run.completed', id, () => { const t = store.get<Thread>('thread', id)!; store.put('thread', id, id, { ...t, status: 'completed', runId: null }); });
  return { store, service, attention, thread, send, complete };
}

describe('per-thread completion alert mute', () => {
  it('accepts a strict boolean and rejects malformed payloads without writes', async () => {
    const { store, send, thread } = setup();
    await send('thread.presentation', { completionAlertsMuted: true });
    expect(store.get<Thread>('thread', thread.id)?.presentation?.completionAlertsMuted).toBe(true);
    await expect(send('thread.presentation', { completionAlertsMuted: 'yes' })).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    await expect(send('thread.presentation', { completionAlertsMuted: null })).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    await expect(send('thread.presentation', { completionAlertsMuted: 1 })).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    await expect(send('thread.presentation', { unknownKey: true })).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });

  it('consumes a muted completion durably while the inbox row stays', async () => {
    const { store, attention, thread, send, complete } = setup();
    attention.read();
    await send('thread.presentation', { completionAlertsMuted: true });
    complete(thread.id);
    const items = attention.read().items;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ kind: 'thread-completed', state: 'completed', read: false, popupDismissed: false });
    expect(attention.claimDelivery().items).toEqual([]);
    expect(attention.claimDelivery().items).toEqual([]);
    expect(store.get<Thread>('thread', thread.id)?.presentation?.completionAlertsMuted).toBe(true);
  });

  it('delivers completions for other threads while one is muted', async () => {
    const { store, attention, thread, send, complete } = setup();
    const other: Thread = { ...thread, id: 'thread-b', title: 'Other' };
    store.internal('fixture.thread-b', other.id, () => store.put('thread', other.id, other.id, other));
    attention.read();
    await send('thread.presentation', { completionAlertsMuted: true }, thread.id);
    complete(thread.id); complete(other.id);
    const delivered = attention.claimDelivery().items;
    expect(delivered).toHaveLength(1);
    expect(delivered[0]!.threadId).toBe('thread-b');
  });

  it('fences a pending completion on mute and never replays it after unmute', async () => {
    const { attention, thread, send, complete } = setup();
    attention.read();
    complete(thread.id);
    expect(attention.read().items).toHaveLength(1); // pending, not yet claimed
    await send('thread.presentation', { completionAlertsMuted: true });
    expect(attention.claimDelivery().items).toEqual([]);
    await send('thread.presentation', { completionAlertsMuted: false });
    expect(attention.claimDelivery().items).toEqual([]); // no replay of the fenced completion
    expect(attention.read().items).toHaveLength(1); // inbox row retained
  });

  it('lets a new completion alert again after unmute', async () => {
    const { store, attention, thread, send } = setup();
    attention.read();
    await send('thread.presentation', { completionAlertsMuted: true });
    // epoch-1 completion while muted is consumed
    store.internal('run.completed', thread.id, () => { const t = store.get<Thread>('thread', thread.id)!; store.put('thread', thread.id, thread.id, { ...t, status: 'completed', runId: null }); });
    expect(attention.claimDelivery().items).toEqual([]);
    await send('thread.presentation', { completionAlertsMuted: false });
    // a later run on a new epoch completes -> eligible again
    store.internal('run.epoch2', thread.id, () => {
      store.put('thread', thread.id, thread.id, { ...thread, epoch: 2, status: 'working', runId: 'run-b' });
      store.put('thread', thread.id, thread.id, { ...store.get<Thread>('thread', thread.id)!, status: 'completed', runId: null });
    });
    const delivered = attention.claimDelivery().items;
    expect(delivered).toHaveLength(1);
    expect(delivered[0]).toMatchObject({ kind: 'thread-completed', threadId: thread.id });
  });

  it('does not consume failures or requests for a muted thread', async () => {
    const { store, attention, thread, send } = setup();
    attention.read();
    await send('thread.presentation', { completionAlertsMuted: true });
    store.internal('run.failed', thread.id, () => {
      store.put('runFailure', 'run-a', thread.id, { threadId: thread.id, runId: 'run-a', epoch: 1, projectId: thread.projectId, occurredAt: new Date().toISOString() });
      store.put('thread', thread.id, thread.id, { ...thread, status: 'failed', runId: null });
    });
    const delivered = attention.claimDelivery().items;
    expect(delivered).toHaveLength(1);
    expect(delivered[0]).toMatchObject({ kind: 'thread-failed', state: 'failed' });
  });

  it('rolls back the flag and the consumption together when the command fails late', async () => {
    const { store, attention, thread, send, complete } = setup();
    attention.read();
    complete(thread.id);
    // Force a failure after the fence by making the final put throw.
    const originalPut = store.put.bind(store);
    vi.spyOn(store, 'put').mockImplementation(((kind: string, id: string, threadId: string | null, value: unknown) => {
      if (kind === 'thread') throw new Error('injected write failure');
      return originalPut(kind as never, id, threadId, value);
    }) as typeof store.put);
    await expect(send('thread.presentation', { completionAlertsMuted: true })).rejects.toThrow('injected write failure');
    vi.restoreAllMocks();
    // Neither the flag nor the consumed state survived the rollback.
    expect(store.get<Thread>('thread', thread.id)?.presentation?.completionAlertsMuted).toBeUndefined();
    expect(attention.claimDelivery().items).toHaveLength(1); // still deliverable
  });
});
