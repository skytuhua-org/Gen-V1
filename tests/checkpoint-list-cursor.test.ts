import { afterEach, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Store } from "../packages/storage/store.ts";
import { checkpointScope } from "../packages/workspace/edit-journal.ts";
import { CheckpointService } from "../packages/workspace/checkpoints.ts";

// Issue #2037 T02 (M08-T03/M08-S09): the checkpoint list cursor must be bound to
// the exact owner and the snapshot it paginates. A bare numeric offset invents
// pages and shifts under concurrent checkpoint creation, silently skipping or
// repeating entries. Blob writes go through the kernel path guard, which needs
// the real boundary; list() only reads stored metadata, so records are seeded
// directly.
const stores: Store[] = [];
const roots: string[] = [];
afterEach(async () => {
  for (const store of stores.splice(0)) store.close();
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
});

const setup = async () => {
  const root = await mkdtemp(join(tmpdir(), "chk-cursor-"));
  roots.push(root);
  const store = new Store(join(root, "state"));
  stores.push(store);
  const service = new CheckpointService(store);
  const owner = checkpointScope({ projectId: "project", threadId: "thread", workingCopyId: "wc-1", binding: { path: join(root, "project") } });
  let tick = 0;
  const seed = (label: string) =>
    store.internal("test.seed", owner.threadId, () => store.put("workspaceCheckpoint", `chk-${label}`, owner.threadId, {
      version: 1,
      id: `chk-${label}`,
      scope: owner,
      sourceCut: `cut-${label}`,
      createdAt: new Date(1_700_000_000_000 + tick++ * 1000).toISOString(),
      files: [{ path: `src/${label}.ts`, identity: null, digest: `digest-${label}`, blobRef: `blob-${label}` }],
      exclusions: [],
      retention: "AVAILABLE",
      label,
      provenance: { kind: "guarded_write", operationId: `op-${label}` },
      expiresAt: null,
    }));
  return { service, owner, seed };
};

it("rejects an invented cursor instead of serving an arbitrary offset", async () => {
  const { service, owner, seed } = await setup();
  for (let i = 0; i < 55; i++) seed(`f${i}`);
  const first = await service.list(owner);
  expect(first.items).toHaveLength(50);
  // A cursor the client never received must not yield a page.
  await expect(service.list(owner, { cursor: "50" })).rejects.toThrow();
});

it("rejects a stale cursor when the snapshot head changed between pages", async () => {
  const { service, owner, seed } = await setup();
  for (let i = 0; i < 55; i++) seed(`f${i}`);
  const first = await service.list(owner);
  // A new checkpoint lands between page 1 and page 2: the cursor must fail
  // closed instead of serving a shifted page.
  seed("newest");
  await expect(service.list(owner, { cursor: first.nextCursor! })).rejects.toThrow();
});

it("paginates deterministically while the snapshot is unchanged", async () => {
  const { service, owner, seed } = await setup();
  for (let i = 0; i < 55; i++) seed(`f${i}`);
  const first = await service.list(owner);
  const second = await service.list(owner, { cursor: first.nextCursor! });
  const seen = new Set([...first.items, ...second.items].map((item) => item.id));
  expect(seen.size).toBe(55);
  expect(second.nextCursor).toBeNull();
});

it("rejects a cursor issued for a different owner scope", async () => {
  const { service, owner, seed } = await setup();
  for (let i = 0; i < 55; i++) seed(`f${i}`);
  const first = await service.list(owner);
  const other = checkpointScope({ projectId: "project", threadId: "thread", workingCopyId: "wc-2", binding: { path: "/other" } });
  await expect(service.list(other, { cursor: first.nextCursor! })).rejects.toThrow();
});
