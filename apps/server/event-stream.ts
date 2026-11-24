import { once } from 'node:events';
import { setImmediate as yieldToHost } from 'node:timers/promises';
import type { ServerResponse } from 'node:http';
import type { Store } from '../../packages/storage/store.ts';
import type { WorkspaceEvent } from '../../packages/contracts/index.ts';

/** Release hijacked SSE responses during Fastify preClose without waiting for
 * a second 'close' event. The client's disconnect can race with shutdown,
 * and an already-destroyed response need not emit 'close' again. */
const closedRegistries = new WeakSet<Map<ServerResponse, () => void>>();

export function destroyEventStreams(streams: Map<ServerResponse, () => void>): void {
  // Fastify may still dispatch a hijacked route after preClose begins.
  closedRegistries.add(streams);
  const shutdowns = [...streams.values()];
  streams.clear();
  for (const shutdown of shutdowns) shutdown();
}

/** Register only a live reader. A socket may already be closed when a
 * hijacked route reaches its stream setup, in which case its cleanup happens
 * synchronously before insertion into the host's reader registry. */
export function registerEventStream(
  streams: Map<ServerResponse, () => void>,
  response: ServerResponse,
  store: Pick<Store, 'eventsAfter' | 'subscribe' | 'sequence'>,
  after: number,
): void {
  if (closedRegistries.has(streams)) { response.destroy(); return; }
  let closed = false;
  const shutdown = streamEvents(response, store, after, () => {
    closed = true;
    streams.delete(response);
  });
  // A synchronous store callback can initiate shutdown during registration.
  if (!closed) {
    if (closedRegistries.has(streams)) shutdown();
    else streams.set(response, shutdown);
  }
}

/** Serialize an event once per commit; every subscriber writes the same chunk. */
const chunkCache = new WeakMap<WorkspaceEvent, string>();
function chunkFor(event: WorkspaceEvent): string {
  let chunk = chunkCache.get(event);
  if (!chunk) { chunk = `id: ${event.seq}\nevent: workspace\ndata: ${JSON.stringify(event)}\n\n`; chunkCache.set(event, chunk); }
  return chunk;
}

/** The durable ledger is the queue. Retain only one event while a reader drains. */
export function streamEvents(response: ServerResponse, store: Pick<Store, 'eventsAfter' | 'subscribe' | 'sequence'>, after: number, onClose: () => void): () => void {
  if (response.destroyed || response.writableEnded) { onClose(); return () => {}; }
  const controller = new AbortController();
  let cursor = after, pumping = false, closed = false, comment = ': connected\n\n';
  // subscribe() already delivers each parsed commit once, in order, to every
  // listener. Buffer live pushes and reuse them once the backlog is drained so
  // a caught-up reader costs no store read or re-parse per event. The ledger
  // stays the durable queue: a stalled reader drops the buffer past the cap
  // and serves everything from the store instead of retaining every commit.
  const pending: WorkspaceEvent[] = [];
  // Fetched ledger pages: one store read serves up to 64 replayed events.
  const backlog: WorkspaceEvent[] = [];
  let liveCut = 0, dropped = false;
  const unsubscribe = store.subscribe((event) => {
    if (dropped) void pump(); // ledger-only mode: pushes are not buffered
    else if (pending.length >= 1024) { pending.length = 0; dropped = true; liveCut = Number.MAX_SAFE_INTEGER; }
    else { pending.push(event); void pump(); }
  });
  liveCut = store.sequence;
  async function pump() {
    if (pumping || closed) return;
    pumping = true;
    let written = 0;
    try {
      while (!closed) {
        // Every post-subscribe commit lands in pending (and only a pre-subscribe
        // backlog, seq <= liveCut, can precede it), so pending is the ordered
        // suffix once the store has been drained up to liveCut.
        if (cursor < liveCut && !backlog.length) backlog.push(...store.eventsAfter(cursor, 64));
        const event = cursor >= liveCut ? pending.shift() : backlog.shift();
        if (!event && !comment) break;
        if (event && event.seq <= cursor) continue; // already written via store replay
        const chunk = event ? chunkFor(event) : comment;
        if (event) cursor = event.seq; else comment = '';
        if (!response.write(chunk)) {
          await once(response, 'drain', { signal: controller.signal });
          written = 0;
        } else if (++written === 32) {
          // A fast reader might not exert backpressure during a long replay.
          // Give other requests and disconnects a turn without queuing events.
          await yieldToHost();
          written = 0;
        }
      }
    } catch { if (!closed) shutdown(); }
    finally { pumping = false; }
  }
  const heartbeat = setInterval(() => { comment = ': heartbeat\n\n'; void pump(); }, 15000);
  heartbeat.unref();
  const close = () => {
    if (closed) return;
    closed = true; controller.abort(); clearInterval(heartbeat); unsubscribe();
    response.off('close', close); response.off('error', fail); onClose();
  };
  // Close the subscription and abort any pending drain before socket teardown.
  // A fatal error, like host shutdown, cannot depend on a later close event.
  const shutdown = () => { close(); response.destroy(); };
  const fail = () => shutdown();
  response.once('close', close); response.once('error', fail);
  void pump();
  return shutdown;
}
