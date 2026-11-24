import { describe, expect, it, vi, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { Store, digest } from "../packages/storage/store.ts";

// Fault-injection fixtures for issue #1955: a failed SQLite change must not
// leave caches and views disagreeing with committed rows, including after a
// second connection writes to the same database file.
const cleanups: (() => void)[] = [];
afterEach(() => { for (const cleanup of cleanups.splice(0)) cleanup(); });
function setup() {
  const dir = mkdtempSync(join(tmpdir(), "harness-store-txn-"));
  const store = new Store(dir);
  cleanups.push(() => { store.close(); rmSync(dir, { recursive: true, force: true }); });
  return { store, path: join(dir, "harness.sqlite") };
}
function secondConnection(path: string): DatabaseSync {
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=50;");
  cleanups.push(() => db.close());
  return db;
}
const entityInsert = (db: DatabaseSync) =>
  db.prepare("INSERT INTO entities(kind,id,thread_id,body) VALUES(?,?,?,?) ON CONFLICT(kind,id) DO UPDATE SET thread_id=excluded.thread_id,body=excluded.body");

describe("transaction consistency across rollback and writers", () => {
  it("keeps the original failure when a commit rolls back cleanly", () => {
    const { store } = setup();
    const realExec = store.db.exec.bind(store.db);
    vi.spyOn(store.db, "exec").mockImplementation((sql: string) => {
      if (sql === "COMMIT") throw new Error("injected commit failure");
      return realExec(sql);
    });
    expect(() => store.internal("fixture.fail", null, () => store.put("sample", "a", null, { v: 1 })))
      .toThrowError("injected commit failure");
    vi.mocked(store.db.exec).mockRestore();
    expect(store.db.isTransaction).toBe(false);
    expect(store.get("sample", "a")).toBeNull();
    store.internal("fixture.after", null, () => store.put("sample", "b", null, { v: 2 }));
    expect(store.get<{ v: number }>("sample", "b")?.v).toBe(2);
  });

  it("preserves the original error and recovers the orphaned transaction when rollback fails", () => {
    const { store } = setup();
    const realExec = store.db.exec.bind(store.db);
    // COMMIT throws with the transaction still open; the recovery ROLLBACK
    // fails too — on main this both masks the original error and wedges the
    // connection so every later command throws.
    vi.spyOn(store.db, "exec").mockImplementation((sql: string) => {
      if (sql === "COMMIT") throw new Error("injected commit failure");
      if (sql === "ROLLBACK") throw new Error("injected rollback failure");
      return realExec(sql);
    });
    expect(() => store.internal("fixture.fail", null, () => store.put("sample", "a", null, { v: 1 })))
      .toThrowError("injected commit failure");
    vi.mocked(store.db.exec).mockRestore();
    expect(store.db.isTransaction).toBe(true); // orphaned transaction left behind
    // The next command must clear the orphan instead of failing on BEGIN.
    store.internal("fixture.after", null, () => store.put("sample", "b", null, { v: 2 }));
    expect(store.get<{ v: number }>("sample", "b")?.v).toBe(2);
    expect(store.get("sample", "a")).toBeNull();
    expect(store.db.isTransaction).toBe(false);
  });

  it("gives snapshot() one consistent view while a second connection commits mid-read", () => {
    const { store, path } = setup();
    const other = secondConnection(path);
    store.internal("fixture.seed", null, () => {
      store.put("thread", "t1", null, { id: "t1", title: "T", status: "ready", runId: null });
      store.put("message", "m1", "t1", { id: "m1", threadId: "t1", content: "before" });
    });
    // snapshot() reads the archived set and the entity rows in separate
    // autocommit statements; inject conn2's archive+message commit between them.
    const realPrepare = store.db.prepare.bind(store.db);
    let calls = 0;
    vi.spyOn(store.db, "prepare").mockImplementation((sql: string) => {
      if (++calls === 2) {
        other.exec("BEGIN");
        entityInsert(other).run("archivedThread", "t1", null, "true");
        entityInsert(other).run("message", "m2", "t1", JSON.stringify({ id: "m2", threadId: "t1", content: "after" }));
        other.exec("COMMIT");
      }
      return realPrepare(sql);
    });
    const snapshot = store.snapshot();
    vi.mocked(store.db.prepare).mockRestore();
    const visibleThreads = snapshot.threads.map(t => t.id);
    const visibleMessages = snapshot.messages.map(m => m.id);
    // The only consistent views are the pre-commit {t1, m1} and post-commit
    // {t1 archived, m2 hidden}. A torn view (t1 visible with m2) never existed.
    const consistent = (visibleThreads.includes("t1") && visibleMessages.join() === "m1")
      || (!visibleThreads.includes("t1") && !visibleMessages.includes("m2"));
    expect(consistent, `torn snapshot: threads=${visibleThreads} messages=${visibleMessages}`).toBe(true);
  });

  it("returns the second connection's committed receipt instead of crashing on the same command id", () => {
    const { store, path } = setup();
    const other = secondConnection(path);
    const command = { id: "cmd-1", type: "runtime.sample", threadId: null, payload: {} };
    // Race: conn2 commits the same command between our receipt check and commit.
    const statements = (store as unknown as { statements: { receipt: { get: (id: string) => unknown } } }).statements;
    vi.spyOn(statements.receipt, "get").mockImplementationOnce(() => {
      other.exec("BEGIN");
      const eventRow = other.prepare("INSERT INTO events(id,type,thread_id,payload,occurred_at) VALUES(?,?,?,?,?)")
        .run("evt-1", command.type, null, JSON.stringify({ result: "other" }), new Date().toISOString());
      other.prepare("INSERT INTO receipts(id,hash,body) VALUES(?,?,?)")
        .run(command.id, digest(command), JSON.stringify({ commandId: command.id, eventSeq: Number(eventRow.lastInsertRowid), result: "other" }));
      other.exec("COMMIT");
      return undefined;
    });
    const receipt = store.command(command as never, () => { throw new Error("must not run"); }) as { commandId: string; result: unknown };
    expect(receipt.commandId).toBe(command.id);
    expect(receipt.result).toBe("other");
    // Disk and reopened state agree: a fresh reader sees exactly the committed row.
    expect(store.eventsAfter(0)).toHaveLength(1);
    expect((store.eventsAfter(0)[0].payload as { result: unknown }).result).toBe("other");
  });
});
