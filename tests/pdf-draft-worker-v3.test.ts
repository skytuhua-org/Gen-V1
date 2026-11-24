import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { PdfDraft } from "../apps/web/src/pdf-draft-protocol";

// Cost audit for #1969: one worker must serve every draft request in an
// editing session instead of one worker per generation.
class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: ((event: { preventDefault(): void; message?: string }) => void) | null = null;
  onmessageerror: (() => void) | null = null;
  terminated = false;
  posted: { message: { id?: string }; transfer?: unknown }[] = [];
  constructor() { FakeWorker.instances.push(this); }
  postMessage(message: { id?: string }, transfer?: unknown) { this.posted.push({ message, transfer }); }
  terminate() { this.terminated = true; }
  respond(id: string, data: Record<string, unknown>) { this.onmessage?.({ data: { id, ...data } }); }
}
const draft: PdfDraft = { bytes: new Uint8Array([1, 2, 3]), fields: [], edited: false };
const source = new Uint8Array([37, 80, 68, 70]);
let createPdfDraft: typeof import("../apps/web/src/pdf-draft")["createPdfDraft"];

beforeEach(async () => {
  vi.resetModules();
  FakeWorker.instances = [];
  vi.stubGlobal("Worker", FakeWorker);
  ({ createPdfDraft } = await import("../apps/web/src/pdf-draft"));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); FakeWorker.instances = []; });

const lastId = () => FakeWorker.instances[0].posted[FakeWorker.instances[0].posted.length - 1].message.id!;

it("reuses one worker across draft generations instead of starting one per request", async () => {
  // Baseline before the fix: each call constructed a new Worker — N edits = N workers.
  for (let call = 0; call < 4; call++) {
    const request = createPdfDraft(source, {});
    FakeWorker.instances[0].respond(lastId(), { draft });
    await request;
  }
  expect(FakeWorker.instances).toHaveLength(1);
});

it("keeps concurrent siblings alive when one request is aborted", async () => {
  const aborting = new AbortController();
  const first = createPdfDraft(source, {}, null, undefined, aborting.signal);
  const second = createPdfDraft(source, {});
  const firstId = FakeWorker.instances[0].posted[0].message.id!;
  aborting.abort();
  await expect(first).rejects.toThrowError(/aborted/i);
  FakeWorker.instances[0].respond(FakeWorker.instances[0].posted[1].message.id!, { draft });
  await expect(second).resolves.toEqual(draft);
  expect(FakeWorker.instances).toHaveLength(1);
  expect(FakeWorker.instances[0].terminated).toBe(false);
  void firstId;
});

it("rejects with the worker error but keeps the shared worker for the next request", async () => {
  const failing = createPdfDraft(source, {});
  FakeWorker.instances[0].respond(lastId(), { error: "bad pdf" });
  await expect(failing).rejects.toThrowError("bad pdf");
  const next = createPdfDraft(source, {});
  FakeWorker.instances[0].respond(lastId(), { draft });
  await expect(next).resolves.toEqual(draft);
  expect(FakeWorker.instances).toHaveLength(1);
});

it("terminates the shared worker after it has been idle", async () => {
  vi.useFakeTimers();
  const request = createPdfDraft(source, {});
  FakeWorker.instances[0].respond(lastId(), { draft });
  await request;
  expect(FakeWorker.instances[0].terminated).toBe(false);
  vi.advanceTimersByTime(31_000);
  expect(FakeWorker.instances[0].terminated).toBe(true);
});

it("rejects all pending and replaces the worker after an unidentifiable response", async () => {
  const failing = createPdfDraft(source, {});
  FakeWorker.instances[0].onmessage?.({ data: { id: "stray" } });
  await expect(failing).rejects.toThrowError("Invalid PDF draft worker response.");
  expect(FakeWorker.instances[0].terminated).toBe(true);
  const next = createPdfDraft(source, {});
  FakeWorker.instances[1].respond(FakeWorker.instances[1].posted[0].message.id!, { draft });
  await expect(next).resolves.toEqual(draft);
  expect(FakeWorker.instances).toHaveLength(2);
});
