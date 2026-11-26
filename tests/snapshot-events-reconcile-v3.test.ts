import { expect, it } from "vitest";
import type { Message, Snapshot, WorkspaceEvent } from "../packages/contracts/index.ts";
import { applyRuntimeEvent } from "../apps/web/src/snapshot-events.ts";

// Reproduction fixtures for the transcript-reconcile audit: a partial live
// update must not regress a fresher snapshot nor break window ordering.
const message = (id: string, threadId: string, createdAt: string): Message => ({
  id,
  threadId,
  role: "assistant",
  content: `content-${id}`,
  createdAt,
} as Message);

const event = (seq: number, threadId: string, value: Message): WorkspaceEvent => ({
  seq,
  type: "runtime.assistant.message",
  threadId,
  payload: { result: { message: value } },
} as unknown as WorkspaceEvent);

const base = (seq: number, messages: Message[]): Snapshot =>
  ({ seq, messages, threads: [], artifacts: [], userStates: [], data: [], requests: [], operations: [], resources: [], usage: {}, settings: { theme: "system", modelId: null }, activeThreadId: null }) as Snapshot;

it("ignores a stale event instead of regressing the snapshot sequence", () => {
  // A refresh already advanced the snapshot to seq 10; a replayed event at
  // seq 6 must not move seq backwards — a full snapshot at seq 9 would then
  // wrongly be accepted as newer and clobber the seq-10 state.
  const snapshot = base(10, [message("m3", "t1", "2026-01-01T00:00:03Z")]);
  const result = applyRuntimeEvent(snapshot, event(6, "t1", message("m4", "t1", "2026-01-01T00:00:04Z")));
  expect(result === null || result.seq >= 10).toBe(true);
});

it("inserts a late message by createdAt instead of appending it at the tail", () => {
  const snapshot = base(5, [
    message("m1", "t1", "2026-01-01T00:00:01Z"),
    message("m3", "t1", "2026-01-01T00:00:03Z"),
  ]);
  const result = applyRuntimeEvent(snapshot, event(6, "t1", message("m2", "t1", "2026-01-01T00:00:02Z")));
  expect(result).not.toBeNull();
  // m2 belongs before m3: an unsorted tail append leaves the transcript
  // misordered and the paging anchor can never heal the gap.
  expect(result!.messages.map((item) => item.id)).toEqual(["m1", "m2", "m3"]);
});

it("keeps appending in-order messages and upserts by id", async () => {
  const snapshot = base(5, [
    message("m1", "t1", "2026-01-01T00:00:01Z"),
    message("m2", "t1", "2026-01-01T00:00:02Z"),
  ]);
  const appended = applyRuntimeEvent(snapshot, event(6, "t1", message("m3", "t1", "2026-01-01T00:00:03Z")));
  expect(appended!.messages.map((item) => item.id)).toEqual(["m1", "m2", "m3"]);
  expect(appended!.seq).toBe(6);
  const updated = applyRuntimeEvent(snapshot, event(6, "t1", { ...message("m2", "t1", "2026-01-01T00:00:02Z"), content: "revised" }));
  expect(updated!.messages.map((item) => item.id)).toEqual(["m1", "m2"]);
  expect(updated!.messages[1]!.content).toBe("revised");
});

it("appends after same-createdAt rows in stream order instead of tiebreaking by id", () => {
  // Regression: ids are random uuids; a tiebreak inverted same-timestamp
  // streaming appends (see web-events-recovery).
  const snapshot = base(10, [message("retained", "a", "")]);
  const result = applyRuntimeEvent(snapshot, event(11, "a", message("latest", "a", "")));
  expect(result!.messages.map((item) => item.id)).toEqual(["retained", "latest"]);
});
