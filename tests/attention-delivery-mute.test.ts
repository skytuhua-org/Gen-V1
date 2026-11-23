import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { Store } from '../packages/storage/store.ts';
import { Service } from '../packages/core/service.ts';
import { AttentionRepository } from '../packages/core/attention.ts';
import { handleDesktopControl } from '../apps/server/desktop-controls.ts';
import type { AttentionDelivery } from '../packages/contracts/attention.ts';
import type { RuntimeAdapter, Thread } from '../packages/contracts/index.ts';

const cleanups: (() => Promise<void> | void)[] = [];
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); });

const runtime: RuntimeAdapter = { configure() {}, models: async () => [], start: async () => {}, followUp: async () => {}, cancel: async () => {}, compact: async () => {}, history: async () => [], dispose: async () => {} };

// Personal threads carry no projectId; that exercises the undefined-vs-absent ownership path.
const thread = (id: string): Thread => ({ id, title: `Thread ${id}`, projectName: null, status: 'working', epoch: 1, runId: `run-${id}`, modelId: null, sessionPath: null, createdAt: '2026-11-04T00:00:00.000Z', updatedAt: '2026-11-04T00:00:00.000Z' });

const complete = (store: Store, id: string) => store.internal('run.completed', id, () => {
  const t = store.get<Thread>('thread', id)!;
  store.put('thread', id, id, { ...t, status: 'completed', runId: null });
});

/** Drive the real desktop harness.attention.read boundary: whatever lands in delivery.items is what popups and sounds fire on. */
async function desktopDelivery(attention: AttentionRepository) {
  const send = vi.fn();
  const host = { stopAll: vi.fn(), saveNativeLayout: vi.fn(), attentionRead: () => Promise.resolve(attention.claimDelivery()) };
  const token = 'a'.repeat(64);
  expect(await handleDesktopControl({ type: 'harness.attention.read', requestId: 'read-1', token }, token, host, send)).toBe(true);
  const result = send.mock.calls[0]![0] as { type: string; delivery: AttentionDelivery };
  expect(result.type).toBe('harness.attention.read.result');
  return result.delivery;
}

describe('muted completions never reach the desktop notification delivery', () => {
  it('keeps a muted completion out of the mixed batch while siblings deliver', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'gen-delivery-mute-'));
    const store = new Store(dir), service = new Service(store, runtime), attention = new AttentionRepository(store);
    cleanups.push(async () => { await service.dispose(); store.close(); rmSync(dir, { recursive: true, force: true }); });
    store.internal('fixture', null, () => { store.put('thread', 'muted', 'muted', thread('muted')); store.put('thread', 'loud', 'loud', thread('loud')); });
    attention.read();
    await service.command({ id: randomUUID(), type: 'thread.presentation', threadId: 'muted', payload: { completionAlertsMuted: true } });
    complete(store, 'muted'); complete(store, 'loud');
    const delivery = await desktopDelivery(attention);
    expect(delivery.items).toHaveLength(1);
    expect(delivery.items[0]).toMatchObject({ threadId: 'loud', kind: 'thread-completed' });
    expect(attention.read().items).toHaveLength(2); // Inbox history unaffected
  });

  it('consumes the muted completion even when the claim overflow would drop it', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'gen-delivery-mute-'));
    const store = new Store(dir), service = new Service(store, runtime), attention = new AttentionRepository(store);
    cleanups.push(async () => { await service.dispose(); store.close(); rmSync(dir, { recursive: true, force: true }); });
    store.internal('fixture', null, () => {
      store.put('thread', 'muted', 'muted', thread('muted'));
      for (let i = 0; i < 35; i++) store.put('thread', `loud-${i}`, `loud-${i}`, thread(`loud-${i}`));
    });
    attention.read();
    await service.command({ id: randomUUID(), type: 'thread.presentation', threadId: 'muted', payload: { completionAlertsMuted: true } });
    store.internal('fixture.complete', null, () => {
      const m = store.get<Thread>('thread', 'muted')!; store.put('thread', 'muted', 'muted', { ...m, status: 'completed', runId: null });
      for (let i = 0; i < 35; i++) { const t = store.get<Thread>('thread', `loud-${i}`)!; store.put('thread', `loud-${i}`, `loud-${i}`, { ...t, status: 'completed', runId: null }); }
    });
    const delivery = await desktopDelivery(attention);
    expect(delivery.items).toHaveLength(30);
    expect(delivery.items.every(item => item.threadId !== 'muted')).toBe(true);
    // the remaining 5 loud completions requeue; the muted one was consumed, never delivered
    const rest = (await desktopDelivery(attention)).items;
    expect(rest).toHaveLength(5);
    expect(rest.every(item => item.threadId !== 'muted')).toBe(true);
  });

  it('serializes opposing writes from a second renderer against the same store', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'gen-delivery-mute-'));
    const store = new Store(dir), service = new Service(store, runtime);
    const rendererA = new AttentionRepository(store), rendererB = new AttentionRepository(store);
    cleanups.push(async () => { await service.dispose(); store.close(); rmSync(dir, { recursive: true, force: true }); });
    store.internal('fixture', 't1', () => store.put('thread', 't1', 't1', thread('t1')));
    rendererA.read(); rendererB.read();
    complete(store, 't1'); // pending completion, unclaimed
    // renderer B mutes while renderer A has not claimed yet
    await service.command({ id: randomUUID(), type: 'thread.presentation', threadId: 't1', payload: { completionAlertsMuted: true } });
    expect((await desktopDelivery(rendererA)).items).toEqual([]);
    // renderer B immediately unmutes: the fenced completion still cannot replay
    await service.command({ id: randomUUID(), type: 'thread.presentation', threadId: 't1', payload: { completionAlertsMuted: false } });
    expect((await desktopDelivery(rendererB)).items).toEqual([]);
    expect(rendererA.read().items).toHaveLength(1);
  });

  it('survives a store close and reopen with flag and consumed state intact', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'gen-delivery-mute-'));
    cleanups.push(() => rmSync(dir, { recursive: true, force: true }));
    let store = new Store(dir);
    const service = new Service(store, runtime), attention = new AttentionRepository(store);
    store.internal('fixture', 't1', () => store.put('thread', 't1', 't1', thread('t1')));
    attention.read();
    await service.command({ id: randomUUID(), type: 'thread.presentation', threadId: 't1', payload: { completionAlertsMuted: true } });
    complete(store, 't1');
    expect((await desktopDelivery(attention)).items).toEqual([]);
    await service.dispose(); store.close();
    // reopen: same SQLite file, fresh repository = a new renderer process
    store = new Store(dir); cleanups.push(() => store.close());
    const reopened = new AttentionRepository(store);
    expect((await desktopDelivery(reopened)).items).toEqual([]); // nothing replays
    expect(reopened.read().items).toHaveLength(1); // inbox row persisted
    expect(store.get<Thread>('thread', 't1')?.presentation?.completionAlertsMuted).toBe(true);
    complete(store, 't1'); // new completion on the muted thread stays silent too
    expect((await desktopDelivery(reopened)).items).toEqual([]);
  });
});
