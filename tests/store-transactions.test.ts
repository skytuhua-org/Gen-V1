import {afterEach, describe, expect, it, vi} from "vitest";
import {mkdtempSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {DatabaseSync} from "node:sqlite";
import {Store} from "../packages/storage/store.ts";

const cleanups: (() => void)[] = [];
afterEach(() => { for (const cleanup of cleanups.splice(0)) cleanup(); });
function setup() { const dir = mkdtempSync(join(tmpdir(), "harness-store-txn-")); const store = new Store(dir); cleanups.push(() => { try { store.close(); } catch { /* already closed by the test */ } rmSync(dir, { recursive: true, force: true }); }); return store; }

describe("store transaction consistency", () => {
  it("maps a second writer's lock to STORE_BUSY instead of a raw SQLite error", () => {
    const store = setup();
    const other = new DatabaseSync(join(store.dataDir, "harness.sqlite"));
    cleanups.push(() => other.close());
    other.exec("PRAGMA busy_timeout=50;");
    store.db.exec("PRAGMA busy_timeout=50;");
    other.exec("BEGIN IMMEDIATE");
    try {
      expect(() => store.internal("fixture.busy", null, () => store.put("sample", "busy", null, {v: 1})))
        .toThrowError(expect.objectContaining({name: "HarnessError", code: "STORE_BUSY"}));
    } finally {
      other.exec("ROLLBACK");
    }
    // Once the external writer releases, the store commits normally again.
    store.internal("fixture.busy.recovered", null, () => store.put("sample", "busy", null, {v: 2}));
    expect(store.get("sample", "busy")).toEqual({v: 2});
  });

  it("preserves the causal failure when rollback itself fails, then reconciles the orphaned transaction", () => {
    const store = setup();
    const originalExec = store.db.exec.bind(store.db);
    let failRollback = true;
    (store.db as { exec: typeof store.db.exec }).exec = (sql: string) => {
      if (failRollback && /ROLLBACK/i.test(sql)) throw new Error("injected: rollback device failed");
      return originalExec(sql);
    };
    try {
      expect(() => store.internal("fixture.fail", null, () => { store.put("sample", "x", null, {v: 1}); throw new Error("causal: apply blew up"); }))
        .toThrowError("causal: apply blew up");
      // The orphaned transaction is real but the flag is clear.
      expect(store.db.isTransaction).toBe(true);
      // Reads refuse the abandoned transaction's uncommitted view until reconciled:
      // callers must not persist state the next rollback will discard.
      const inconsistent = expect.objectContaining({name: "HarnessError", code: "STORE_INCONSISTENT"});
      expect(() => store.get("sample", "x")).toThrowError(inconsistent);
      expect(() => store.snapshot()).toThrowError(inconsistent);
      expect(() => store.eventsAfter(0)).toThrowError(inconsistent);
      failRollback = false;
      // The next commit reconciles the orphan instead of wedging on it.
      store.internal("fixture.after", null, () => store.put("sample", "after", null, {v: 2}));
      expect(store.get("sample", "after")).toEqual({v: 2});
      expect(store.db.isTransaction).toBe(false);
      // And no rows from the rolled-back transaction leaked through.
      expect(store.get("sample", "x")).toBeNull();
    } finally {
      store.db.exec = originalExec;
      if (store.db.isTransaction) store.db.exec("ROLLBACK");
    }
  });

  it("reports an unreconcilable transaction as STORE_INCONSISTENT", () => {
    const store = setup();
    const originalExec = store.db.exec.bind(store.db);
    (store.db as { exec: typeof store.db.exec }).exec = (sql: string) => {
      if (/ROLLBACK/i.test(sql)) throw new Error("injected: rollback always fails");
      return originalExec(sql);
    };
    try {
      store.db.exec("BEGIN IMMEDIATE");
      expect(() => store.internal("fixture.wedged", null, () => {})).toThrowError(expect.objectContaining({name: "HarnessError", code: "STORE_INCONSISTENT"}));
    } finally {
      store.db.exec = originalExec;
      if (store.db.isTransaction) store.db.exec("ROLLBACK");
    }
  });

  it("returns the raced durable receipt when a competing writer committed the same command", () => {
    const store = setup();
    const command = {id: "cmd-race", type: "fixture.race", payload: {n: 1}};
    // The identical command is durably committed through a second connection.
    const other = new Store(store.dataDir);
    cleanups.push(() => other.close());
    const seeded = other.command(command, () => ({v: 1}));
    // Our first dedupe check misses (as it would before the competing commit),
    // our commit then fails, and the durable receipt must win over the error.
    const spy = vi.spyOn(store, 'receipt').mockReturnValueOnce(null);
    try {
      const raced = store.command(command, () => { throw new Error("injected: our commit failed"); });
      expect(raced).toEqual(seeded);
    } finally {
      spy.mockRestore();
    }
  });

  it("does not report its own uncommitted receipt when commit and rollback both fail", () => {
    const store = setup();
    const command = {id: "cmd-phantom", type: "fixture.phantom", payload: {n: 1}};
    const originalExec = store.db.exec.bind(store.db);
    let failWrites = true;
    (store.db as { exec: typeof store.db.exec }).exec = (sql: string) => {
      if (failWrites && /COMMIT|ROLLBACK/i.test(sql)) throw new Error("injected: write device failed");
      return originalExec(sql);
    };
    try {
      // COMMIT fails after our receipt was inserted, and ROLLBACK fails too:
      // the open transaction still exposes our own row, which is no durable proof.
      expect(() => store.command(command, () => ({v: 1}))).toThrowError("injected: write device failed");
      expect(store.db.isTransaction).toBe(true);
      failWrites = false;
      store.internal("fixture.after", null, () => {});
      // Reconciliation discarded the uncommitted receipt with its transaction.
      expect(store.receipt(command)).toBeNull();
    } finally {
      store.db.exec = originalExec;
      if (store.db.isTransaction) store.db.exec("ROLLBACK");
    }
  });

  it("keeps disk, a second reader and reopened state agreeing after an injected rollback", () => {
    const store = setup();
    const other = new Store(store.dataDir + "-other");
    cleanups.push(() => other.close());
    store.internal("fixture.commit", null, () => store.put("sample", "kept", null, {v: 1}));
    expect(() => store.internal("fixture.fail", null, () => { store.put("sample", "lost", null, {v: 2}); throw new Error("causal"); })).toThrowError("causal");
    // Same-connection view.
    expect(store.get("sample", "kept")).toEqual({v: 1});
    expect(store.get("sample", "lost")).toBeNull();
    // Second reader on the same database sees the same state.
    const second = new Store(store.dataDir);
    cleanups.push(() => second.close());
    expect(second.get("sample", "kept")).toEqual({v: 1});
    expect(second.get("sample", "lost")).toBeNull();
    // Reopened store agrees and the event log contains only the committed event.
    store.close();
    const reopened = new Store(store.dataDir);
    cleanups.push(() => reopened.close());
    expect(reopened.get("sample", "kept")).toEqual({v: 1});
    expect(reopened.get("sample", "lost")).toBeNull();
    expect(reopened.eventsAfter(0).map(event => event.type)).toEqual(["fixture.commit"]);
  });
});
