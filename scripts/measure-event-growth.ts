/**
 * T01 baseline for issue #1958: deterministic local stores at multiple sizes.
 * Measures rows, bytes, runtime and query plans after equal event volumes so a
 * retention cutoff can be sized against the oldest consumer cursor.
 *
 * Usage: pnpm exec tsx scripts/measure-event-growth.ts [size ...]
 * Default sizes: 1000 10000 50000 100000
 */
import { createHash, randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { Store } from '../packages/storage/store.ts';

const sizes = process.argv.slice(2).map(Number).filter(n => Number.isSafeInteger(n) && n > 0);
const targets = sizes.length ? sizes : [1000, 10000, 50000, 100000];
const THREADS = 20;

const id = (prefix: string, n: number) => `${prefix}-${createHash('sha256').update(String(n)).digest('hex').slice(0, 24)}`;
const dirSize = (dir: string) => ['harness.sqlite', 'harness.sqlite-wal', 'harness.sqlite-shm'].reduce((sum, name) => { try { return sum + statSync(join(dir, name)).size; } catch { return sum; } }, 0);
const ms = (fn: () => unknown) => { const t = performance.now(); fn(); return +(performance.now() - t).toFixed(2); };

function seed(store: Store, events: number) {
  const db = store.db;
  db.exec('BEGIN');
  try {
    const putEntity = db.prepare("INSERT INTO entities(kind,id,thread_id,body) VALUES(?,?,?,?)");
    const putEvent = db.prepare("INSERT INTO events(id,type,thread_id,payload,occurred_at) VALUES(?,?,?,?,?)");
    const putReceipt = db.prepare("INSERT INTO receipts(id,hash,body) VALUES(?,?,?)");
    for (let t = 0; t < THREADS; t++)
      putEntity.run('thread', id('thread', t), null, JSON.stringify({ id: id('thread', t), title: `Thread ${t}`, status: 'working', epoch: 0, projectName: null, updatedAt: new Date(0).toISOString() }));
    // Entities ≈ 10% of event volume: mostly messages spread over threads.
    const entityCount = Math.max(THREADS, Math.floor(events / 10));
    for (let i = 0; i < entityCount; i++) {
      const thread = id('thread', i % THREADS);
      putEntity.run('message', id('message', i), thread, JSON.stringify({ id: id('message', i), threadId: thread, role: 'agent', content: `message body ${i}`, createdAt: new Date(0).toISOString() }));
    }
    for (let i = 0; i < events; i++) {
      const thread = i % 4 === 0 ? null : id('thread', i % THREADS);
      putEvent.run(randomUUID(), i % 3 === 0 ? 'runtime.progress' : i % 3 === 1 ? 'operation.started' : 'state.save', thread, JSON.stringify({ result: { index: i, note: `payload ${i}` } }), new Date(1_700_000_000_000 + i * 1000).toISOString());
      if (i % 4 === 0) putReceipt.run(id('command', i), 'a'.repeat(64), JSON.stringify({ commandId: id('command', i), eventSeq: i + 1, result: { ok: true } }));
    }
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
  db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
}

function plan(db: Store['db'], sql: string, ...args: (string | number)[]) {
  return (db.prepare(`EXPLAIN QUERY PLAN ${sql}`).all(...args) as { detail: string }[]).map(row => row.detail).join(' | ');
}

for (const events of targets) {
  const dir = mkdtempSync(join(tmpdir(), `gen-growth-${events}-`));
  try {
    const store = new Store(dir);
    const seededIn = ms(() => seed(store, events));
    const counts = {
      entities: (store.db.prepare('SELECT COUNT(*) c FROM entities').get() as { c: number }).c,
      events: (store.db.prepare('SELECT COUNT(*) c FROM events').get() as { c: number }).c,
      receipts: (store.db.prepare('SELECT COUNT(*) c FROM receipts').get() as { c: number }).c,
    };
    // Full scan as read-sync does: 500-row pages from seq 0.
    const scanAll = ms(() => { let scanned = 0; for (;;) { const batch = store.eventsAfter(scanned, 500); if (!batch.length) break; scanned = batch.at(-1)!.seq; } });
    const timings = {
      'eventsAfter(0,500)': ms(() => store.eventsAfter(0, 500)),
      'read-sync full scan': scanAll,
      'retentionFloor (MIN seq)': ms(() => store.db.prepare('SELECT MIN(seq) f FROM events').get()),
      'snapshot()': ms(() => store.snapshot()),
      'visibleEntities archived scan': ms(() => store.db.prepare('SELECT id,body FROM entities WHERE kind=?').all('archivedThread')),
      'messageTail': ms(() => store.messagesFor(id('thread', 0))),
    };
    const plans = {
      eventsAfter: plan(store.db, 'SELECT * FROM events WHERE seq>? ORDER BY seq LIMIT ?', 0, 500),
      entitiesKind: plan(store.db, 'SELECT body FROM entities WHERE kind=? ORDER BY rowid', 'message'),
      receiptLookup: plan(store.db, 'SELECT hash,body FROM receipts WHERE id=?', 'x'),
    };
    console.log(JSON.stringify({ events, seededInMs: seededIn, counts, bytes: dirSize(dir), timingsMs: timings, plans }));
    store.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
