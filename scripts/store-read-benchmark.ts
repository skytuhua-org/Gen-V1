import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { Store } from "../packages/storage/store.ts";

// T01 fixture for skytuhua-org/Gen-V1#1959: measure the host read entry points
// (snapshot, attentionProjection, messagesFor) against deterministic small and
// large seed stores. Reports median/p95 latency, prepared-statement count and
// EXPLAIN QUERY PLAN for the hot statements.
//
//   pnpm exec tsx scripts/store-read-benchmark.ts

interface Seed { threads: number; messagesPerThread: number; artifacts: number; usage: number; archived: number }
const SMALL: Seed = { threads: 5, messagesPerThread: 40, artifacts: 5, usage: 5, archived: 1 };
const LARGE: Seed = { threads: 60, messagesPerThread: 800, artifacts: 200, usage: 60, archived: 20 };

async function seed(scale: Seed) {
  const dataDir = await mkdtemp(join(tmpdir(), "store-read-bench-"));
  const store = new Store(dataDir);
  store.internal("bench.seed", null, () => {
    for (let t = 0; t < scale.threads; t++) {
      const threadId = `thread-${t}`;
      const archived = t < scale.archived;
      store.put("thread", threadId, threadId, { id: threadId, projectId: "project", title: `Thread ${t}`, status: "idle", runId: null, modelId: "model-1", accountId: "acct-1" });
      store.put("archivedThread", threadId, threadId, archived);
      for (let m = 0; m < scale.messagesPerThread; m++)
        store.put("message", `${threadId}-m${m}`, threadId, { id: `${threadId}-m${m}`, threadId, role: m % 2 ? "assistant" : "user", content: `message ${m} ` + "x".repeat(80), createdAt: new Date(m).toISOString() });
    }
    for (let a = 0; a < scale.artifacts; a++)
      store.put("artifact", `artifact-${a}`, "thread-1", { id: `artifact-${a}`, kind: "file", bindings: {} });
    for (let u = 0; u < scale.usage; u++)
      store.put("usage", `thread-${u}`, `thread-${u}`, { id: `thread-${u}`, value: { inputTokens: u, outputTokens: u } });
    for (let r = 0; r < 10; r++)
      store.put("request", `request-${r}`, `thread-${r}`, { id: `request-${r}`, threadId: `thread-${r}`, basis: [] });
  });
  return { dataDir, store };
}

function percentile(values: number[], p: number) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))]!;
}

function measure(label: string, runs: number, fn: () => unknown) {
  fn(); // warm
  const times: number[] = [];
  for (let i = 0; i < runs; i++) { const start = performance.now(); fn(); times.push(performance.now() - start); }
  console.log(`${label}: median=${percentile(times, 50).toFixed(1)}ms p95=${percentile(times, 95).toFixed(1)}ms min=${Math.min(...times).toFixed(1)}ms (${runs} runs)`);
}

function plan(store: Store, label: string, sql: string, ...params: (string | number)[]) {
  const rows = store.db.prepare(`EXPLAIN QUERY PLAN ${sql}`).all(...(params as never[])) as { detail: string }[];
  console.log(`  ${label}: ${rows.map((row) => row.detail).join(" | ")}`);
}

const sizes = process.argv.includes("--large-only") ? [LARGE] : [SMALL, LARGE];
for (const scale of sizes) {
  const name = scale === SMALL ? "small" : "large";
  const { dataDir, store } = await seed(scale);
  console.log(`\n=== ${name}: ${scale.threads} threads x ${scale.messagesPerThread} messages, ${scale.artifacts} artifacts, ${scale.usage} usage rows ===`);
  let prepares = 0;
  const original = store.db.prepare.bind(store.db);
  store.db.prepare = ((sql: string) => { prepares++; return original(sql); }) as typeof store.db.prepare;
  measure("snapshot()", 15, () => store.snapshot());
  measure("attentionProjection()", 15, () => store.attentionProjection());
  measure("messagesFor(thread-0)", 15, () => store.messagesFor("thread-0", undefined, 200));
  console.log(`dynamic prepare() calls during benchmark: ${prepares}`);
  plan(store, "snapshotMessages", `
    WITH groups AS (
      SELECT thread_id, COUNT(*) AS total, MIN(rowid) AS first_row
      FROM entities
      WHERE kind='message' AND (thread_id IS NULL OR thread_id NOT IN (SELECT value FROM json_each('[]')))
      GROUP BY thread_id
    ), tails AS MATERIALIZED (
      SELECT thread_id, total, CASE WHEN total <= 300 THEN first_row ELSE (
        SELECT rowid FROM entities WHERE kind='message' AND thread_id IS groups.thread_id ORDER BY rowid DESC LIMIT 1 OFFSET 299
      ) END AS first_retained
      FROM groups
    )
    SELECT entity.body, tails.total FROM tails CROSS JOIN entities AS entity
    WHERE entity.kind='message' AND entity.thread_id IS tails.thread_id AND entity.rowid >= tails.first_retained
    ORDER BY entity.rowid`);
  plan(store, "usage N+1 get", "SELECT body FROM entities WHERE kind=? AND id=?", "usage", "thread-1");
  store.close();
  await rm(dataDir, { recursive: true, force: true });
}
