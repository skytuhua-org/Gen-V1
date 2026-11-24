import { afterEach, expect, it, vi } from "vitest";
import { link, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Store } from "../packages/storage/store.ts";
import { checkpointScope } from "../packages/workspace/edit-journal.ts";
import { CheckpointService } from "../packages/workspace/checkpoints.ts";

// The kernel directory guard has no broker under vitest on this host (same
// CAPABILITY_DENIED as the checkpoint suite on main). Bypass only the guard
// boundary; real bound reads, hashing and store logic still run.
vi.mock("../packages/core/file-access.ts", async (importActual) => {
  const actual = await importActual<typeof import("../packages/core/file-access.ts")>();
  return {
    ...actual,
    withPathGuard: async (_paths: unknown, signal: AbortSignal, action: (manifest: readonly unknown[]) => Promise<unknown>) => {
      signal.throwIfAborted();
      return action([]);
    },
    replaceOwnedFile: async (source: string, destination: string) => {
      const { rename } = await import("node:fs/promises");
      await rename(source, destination);
    },
  };
});

// Integrity of the content-addressed blob store (issue #1954): an interrupted
// or tampered write at blobs/<sha256> must not poison readers or make every
// retry of the same capture fail. Publication is atomic (staging name plus
// rename) and readers verify the digest before trusting bytes.

const roots: string[] = [];
const stores: Store[] = [];
afterEach(async () => {
  for (const store of stores.splice(0)) store.close();
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true, maxRetries: 5 });
});

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "harness-checkpoint-blob-"));
  roots.push(root);
  const store = new Store(join(root, "state"));
  stores.push(store);
  const project = join(root, "project");
  await mkdir(project);
  const service = new CheckpointService(store);
  const owner = checkpointScope({ projectId: "project", threadId: "thread", workingCopyId: "wc-1", binding: { path: project } });
  const blobRoot = join(root, "state", "checkpoint-store", "blobs");
  return { root, store, project, service, owner, blobRoot };
}

// Simulates a kill mid-write at the content-addressed name: the file exists
// but holds only a prefix of the intended bytes.
async function truncateBlob(blobRoot: string, ref: string, keep: number) {
  const target = join(blobRoot, ref);
  const bytes = await readFile(target);
  await writeFile(target, bytes.subarray(0, keep));
}

it("treats a short blob as missing and lets a retry of the same capture recover", async () => {
  const { store, project, service, owner, blobRoot } = await fixture();
  await writeFile(join(project, "a.txt"), "checkpoint-content-a\n");
  const checkpoint = await service.create({ owner, root: project, paths: ["a.txt"] });
  const ref = checkpoint.files[0]!.blobRef;
  await truncateBlob(blobRoot, ref, 3);
  // The truncated name must not serve corrupt bytes as if they were retained.
  const detail = await service.detail(owner, checkpoint.id);
  expect(detail.files[0]!.bytes).toBe(0);
  expect(store.get<{ retention: string }>("workspaceCheckpoint", checkpoint.id)!.retention).toBe("MISSING");
  // A second capture of the same bytes repairs the poisoned name instead of
  // failing forever on EEXIST + digest mismatch.
  const retry = await service.create({ owner, root: project, paths: ["a.txt"] });
  expect(retry.files[0]!.blobRef).toBe(ref);
  expect(Buffer.from(await readFile(join(blobRoot, ref)))).toEqual(Buffer.from("checkpoint-content-a\n"));
});

it("rejects corrupted bytes to restore and review callers, not as a silent diff", async () => {
  const { project, service, owner, blobRoot } = await fixture();
  await writeFile(join(project, "a.txt"), "a-old\n");
  const checkpoint = await service.create({ owner, root: project, paths: ["a.txt"] });
  const ref = checkpoint.files[0]!.blobRef;
  await writeFile(join(blobRoot, ref), "forged-not-the-checkpoint\n");
  const review = await service.review(owner, checkpoint.id, { paths: ["a.txt"], root: project });
  // The forged blob reads as missing (untrusted), never as a diffable target.
  expect(review.files[0]!.status).toBe("missing");
  expect(review.files[0]!.targetHash).toBeNull();
});

it("repairs a blob invalidated through a hardlink on the next identical capture", async () => {
  const { store, project, service, owner, blobRoot } = await fixture();
  await writeFile(join(project, "a.txt"), "linked-content\n");
  const checkpoint = await service.create({ owner, root: project, paths: ["a.txt"] });
  const ref = checkpoint.files[0]!.blobRef;
  // Repository policy: bound reads refuse multiply-linked files. Corrupt the
  // shared inode through a second link outside the store.
  const alias = join(store.dataDir, "outside-alias");
  await link(join(blobRoot, ref), alias);
  await writeFile(alias, "tampered-through-hardlink\n");
  const retry = await service.create({ owner, root: project, paths: ["a.txt"] });
  expect(retry.files[0]!.blobRef).toBe(ref);
  expect(Buffer.from(await readFile(join(blobRoot, ref)))).toEqual(Buffer.from("linked-content\n"));
  expect(await service.detail(owner, checkpoint.id).then((d) => d.files[0]!.bytes)).toBe("linked-content\n".length);
});

it("publishes concurrently without one writer reading the other's short file", async () => {
  const { project, service, owner, blobRoot } = await fixture();
  await writeFile(join(project, "a.txt"), "concurrent-content\n");
  const [a, b] = await Promise.all([
    service.create({ owner, root: project, paths: ["a.txt"] }),
    service.create({ owner, root: project, paths: ["a.txt"] }),
  ]);
  expect(a.files[0]!.blobRef).toBe(b.files[0]!.blobRef);
  expect(Buffer.from(await readFile(join(blobRoot, a.files[0]!.blobRef)))).toEqual(Buffer.from("concurrent-content\n"));
});

it("leaves no staging file behind when publication fails cleanly", async () => {
  const { project, service, owner, blobRoot } = await fixture();
  await writeFile(join(project, "a.txt"), "blocked-content\n");
  const probe = await service.create({ owner, root: project, paths: ["a.txt"] });
  const ref = probe.files[0]!.blobRef;
  // Occupy the target name with a directory: no blob publish may clobber it.
  await rm(join(blobRoot, ref));
  await mkdir(join(blobRoot, ref));
  await expect(service.create({ owner, root: project, paths: ["a.txt"] })).rejects.toThrow();
  expect(await readdir(blobRoot)).toEqual([ref]);
});

it("sweeps a crash-orphaned staging file during garbage collection", async () => {
  const { store, project, service, owner, blobRoot } = await fixture();
  await writeFile(join(project, "a.txt"), "a-old\n");
  const checkpoint = await service.create({ owner, root: project, paths: ["a.txt"] });
  const stale = join(blobRoot, ".gen-blob-deadbeef.tmp");
  await writeFile(stale, "partial-staged-bytes");
  const result = await service.collectGarbage();
  expect(result.removed).toBe(1);
  await expect(readFile(stale)).rejects.toThrow();
  await expect(readFile(join(blobRoot, checkpoint.files[0]!.blobRef))).resolves.toBeTruthy();
  void store;
});
