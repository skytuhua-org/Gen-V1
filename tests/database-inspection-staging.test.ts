import { afterEach, expect, it, vi } from "vitest";

const sourceReads = vi.hoisted(() => [] as { path: string; bytes: number }[]);
vi.mock("../packages/core/file-access.ts", async importOriginal => {
  const actual = await importOriginal<typeof import("../packages/core/file-access.ts")>();
  return { ...actual, readBoundFile: async (...args: Parameters<typeof actual.readBoundFile>) => {
    const bytes = await actual.readBoundFile(...args);
    sourceReads.push({ path: String(args[0]), bytes: bytes.length });
    return bytes;
  } };
});

const { databaseJob } = await import("../packages/capabilities/database.ts");
const { createHash } = await import("node:crypto");
const { mkdtemp, readdir, readFile, rm, stat } = await import("node:fs/promises");
const { tmpdir } = await import("node:os");
const { join } = await import("node:path");
const { DatabaseSync } = await import("node:sqlite");

const roots: string[] = [];
afterEach(async () => { for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true, maxRetries: 5 }); });

async function fixture(bytes = 0) {
  const root = await mkdtemp(join(tmpdir(), "harness-db-stage-")); roots.push(root);
  const path = join(root, "data.sqlite");
  const db = new DatabaseSync(path);
  db.exec("CREATE TABLE items(id INTEGER PRIMARY KEY, payload BLOB); INSERT INTO items VALUES(1, zeroblob(16))");
  let count = 1;
  if (bytes) {
    db.exec("BEGIN");
    const insert = db.prepare("INSERT INTO items(payload) VALUES(zeroblob(4096))");
    for (let row = 0; row < Math.ceil(bytes / 4096); row++) insert.run();
    db.exec("COMMIT");
    count += Math.ceil(bytes / 4096);
  }
  db.close();
  return { root, path, count };
}

function context(signal = new AbortController().signal) {
  return { threadId: "test", signal, progress: () => {} } as never;
}

async function inspect(path: string, signal?: AbortSignal) {
  sourceReads.length = 0;
  const before = process.resourceUsage().maxRSS;
  const result = await databaseJob({ mode: "inspect", path, table: "items" }, context(signal));
  return { result, reads: sourceReads.map(read => ({ ...read })), maxRssBefore: before, maxRssAfter: process.resourceUsage().maxRSS };
}

async function sha256(path: string) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function snapshotCopyStarted(existing: Set<string>) {
  let stage = "";
  const deadline = Date.now() + 10000;
  while (!stage && Date.now() < deadline) {
    stage = (await readdir(tmpdir())).find(name => name.startsWith("harness-db-read-") && !existing.has(name)) ?? "";
    if (!stage) await new Promise(done => setImmediate(done));
  }
  if (!stage) throw new Error("Timed out waiting for snapshot staging");
  const snapshot = join(tmpdir(), stage, "snapshot.sqlite");
  while (Date.now() < deadline) {
    try { if ((await stat(snapshot)).size > 0) return; } catch {}
    await new Promise(done => setImmediate(done));
  }
  throw new Error("Timed out waiting for snapshot copy");
}

it("stages ordinary read-only inspections without whole-file source reads and preserves identical output shape", async () => {
  const small = await fixture();
  const large = await fixture(8 * 1024 * 1024);
  const smallRun = await inspect(small.path);
  const largeRun = await inspect(large.path);
  console.log(JSON.stringify({ small: { reads: smallRun.reads, maxRssBefore: smallRun.maxRssBefore, maxRssAfter: smallRun.maxRssAfter }, large: { reads: largeRun.reads, maxRssBefore: largeRun.maxRssBefore, maxRssAfter: largeRun.maxRssAfter } }));
  expect(smallRun.result.integrity).toBe("ok");
  expect(largeRun.result.integrity).toBe("ok");
  expect(smallRun.result.schema).toEqual(largeRun.result.schema);
  expect(smallRun.result.totalRows).toBe(1);
  expect(largeRun.result.totalRows).toBe(large.count);
  expect(smallRun.result.rowsTruncated).toBe(false);
  expect(largeRun.result.rowsTruncated).toBe(false);
  expect(smallRun.result.resourceVersion).toBe(await sha256(small.path));
  expect(largeRun.result.resourceVersion).toBe(await sha256(large.path));
  expect(smallRun.reads).toEqual([]);
  expect(largeRun.reads).toEqual([]);
});

it("rejects an ordinary fixture record mutation without returning partial inspection output", async () => {
  const large = await fixture();
  const setup = new DatabaseSync(large.path);
  setup.prepare("INSERT INTO items VALUES(2, zeroblob(?))").run(128 * 1024 * 1024);
  setup.close();
  const editor = new DatabaseSync(large.path);
  let closed = false;
  try {
    const existing = new Set((await readdir(tmpdir())).filter(name => name.startsWith("harness-db-read-")));
    const running = databaseJob({ mode: "inspect", path: large.path, table: "items", limit: 0 }, context());
    await snapshotCopyStarted(existing);
    editor.exec("UPDATE items SET payload=zeroblob(32) WHERE id=1");
    editor.close(); closed = true;
    await expect(running).rejects.toThrow(/changed|precondition/i);
  } finally { if (!closed) editor.close(); }
});

it("cancels cleanly without partial inspection output", async () => {
  const small = await fixture();
  const controller = new AbortController();
  controller.abort();
  await expect(databaseJob({ mode: "inspect", path: small.path, table: "items" }, context(controller.signal))).rejects.toThrow(/cancel|denied/i);
});
