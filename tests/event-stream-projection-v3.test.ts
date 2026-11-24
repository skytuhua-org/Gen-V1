import { EventEmitter } from "node:events";
import type { ServerResponse } from "node:http";
import { expect, it } from "vitest";
import { streamEvents } from "../apps/server/event-stream";
import type { WorkspaceEvent } from "../packages/contracts/index.ts";

// Cost audit for #1960: a live commit must not need a store read+parse per
// subscriber — subscribe() already delivers the parsed event.
function fixture(backlog: WorkspaceEvent[] = []) {
  const listeners = new Set<(event: WorkspaceEvent) => void>();
  const events = [...backlog];
  let queries = 0, parses = 0;
  const store = {
    sequence: events.length ? events[events.length - 1].seq : 0,
    eventsAfter(after: number, limit = events.length) {
      queries += 1;
      parses += Math.min(limit, Math.max(0, events.filter((event) => event.seq > after).length));
      return events.filter((event) => event.seq > after).slice(0, limit);
    },
    subscribe(listener: (event: WorkspaceEvent) => void) { listeners.add(listener); return () => listeners.delete(listener); },
    commit(event: WorkspaceEvent) { events.push(event); store.sequence = event.seq; for (const listener of [...listeners]) listener(event); },
  };
  const writes: number[] = [];
  const response = (own: number[] = writes) => Object.assign(new EventEmitter(), {
    write(chunk: string) { const id = /^id: (\d+)/.exec(chunk); if (id) own.push(Number(id[1])); return true; },
    destroy() {},
  });
  const event = (seq: number): WorkspaceEvent => ({ seq, id: String(seq), type: "assistant.delta", threadId: null, payload: { seq }, occurredAt: "2026-01-01T00:00:00.000Z" });
  const stream = (from = 0, own: number[] = writes) => streamEvents(response(own) as unknown as ServerResponse, store, from, () => {});
  return { store, writes, stream, counts: () => ({ queries, parses }), reset: () => { queries = 0; parses = 0; }, event };
}

it("delivers live commits to a caught-up subscriber without a store read per event", async () => {
  const f = fixture();
  f.stream(0);
  await expect.poll(() => f.writes.length).toBe(0);
  f.reset();
  for (const seq of [1, 2, 3, 4, 5]) f.store.commit(f.event(seq));
  await expect.poll(() => f.writes).toEqual([1, 2, 3, 4, 5]);
  // Pre-fix: one eventsAfter select + parse per event per subscriber.
  expect(f.counts().queries).toBeLessThanOrEqual(1);
});

it("reuses the parsed commit for a second subscriber instead of re-reading", async () => {
  const f = fixture();
  const a: number[] = [], b: number[] = [];
  f.stream(0, a);
  f.stream(0, b);
  f.reset();
  for (const seq of [1, 2, 3]) f.store.commit(f.event(seq));
  await expect.poll(() => a).toEqual([1, 2, 3]);
  expect(b).toEqual([1, 2, 3]);
  expect(f.counts().queries).toBeLessThanOrEqual(2);
});

it("replays backlog before live events and skips overlapped duplicates", async () => {
  const f = fixture([
    { seq: 1, id: "1", type: "x", threadId: null, payload: null, occurredAt: "2026-01-01T00:00:00.000Z" },
    { seq: 2, id: "2", type: "x", threadId: null, payload: null, occurredAt: "2026-01-01T00:00:00.000Z" },
  ]);
  f.stream(0);
  await expect.poll(() => f.writes).toEqual([1, 2]);
  for (const seq of [3, 4]) f.store.commit(f.event(seq));
  await expect.poll(() => f.writes).toEqual([1, 2, 3, 4]);
});

it("keeps writing in seq order when live pushes overlap a backlog drain", async () => {
  const f = fixture(Array.from({ length: 40 }, (_, i) => f0(i + 1)));
  f.stream(0);
  for (const seq of [41, 42]) f.store.commit(f.event(seq));
  await expect.poll(() => f.writes).toEqual(Array.from({ length: 42 }, (_, i) => i + 1));
});
function f0(seq: number): WorkspaceEvent {
  return { seq, id: String(seq), type: "x", threadId: null, payload: null, occurredAt: "2026-01-01T00:00:00.000Z" };
}
