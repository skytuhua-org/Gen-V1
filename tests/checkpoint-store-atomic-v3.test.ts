import { afterEach, expect, it, vi } from "vitest";
import { link, mkdir, mkdtemp, readdir, readFile, rm, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Store } from "../packages/storage/store.ts";
import { checkpointScope } from "../packages/workspace/edit-journal.ts";
import { CheckpointService } from "../packages/workspace/checkpoints.ts";
import type { CheckpointOwner } from "../apps/web/src/file-checkpoint-api.ts";

// The path-guard supervisor is absent in unit tests; the blob bytes and digest
// checks under test live inside the guarded action, so admit it directly.
vi.mock("../packages/core/file-access.ts", async (importActual) => {
  const actual = await importActual<typeof import("../packages/core/file-access.ts")>();
  return {
    ...actual,
    withPathGuard: async (_paths: unknown, _signal: AbortSignal, action: (manifest: unknown) => Promise<unknown>) => action([]),
  };
});

const roots: string[] = [];
const stores: Store[] = [];
afterEach(async () => {
  for (const store of stores.splice(0)) store.close();
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true, maxRetries: 5 });
});

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "harness-checkpoint-store-v3-"));
  roots.push(root);
  const store = new Store(join(root, "state"));
  stores.push(store);
  const project = join(root, "project");
  await mkdir(project);
  const service = new CheckpointService(store);
  const owner = checkpointScope({ projectId: "project", threadId: "thread", workingCopyId: "wc-1", binding: { path: project } });
  return { root, store, project, service, owner };
}

const blobDir = (store: Store) => join(store.dataDir, "checkpoint-store", "blobs");
const blobPath = (store: Store, ref: string) => join(blobDir(store), ref);

const capture = async (project: string, service: CheckpointService, owner: CheckpointOwner, rel: string, bytes: Buffer) => {
  await writeFile(join(project, rel), bytes);
  const checkpoint = await service.create({ owner, root: project, paths: [rel] });
  const file = checkpoint.files.find((entry) => entry.path === rel);
  expect(file).toBeTruthy();
  return { checkpoint, ref: file!.blobRef };
};

it("survives an interrupted blob write: the torn file never reaches the digest name and a second capture republishes", async () => {
  const { project, service, owner, store } = await fixture();
  const payload = Buffer.from("blob-bytes-v1\nsecond-line\n");
  const { checkpoint, ref } = await capture(project, service, owner, "blob.txt", payload);

  // Simulate the torn write a crash leaves behind: partial bytes at the
  // content-addressed path, exactly what the non-atomic open("wx") produced.
  await writeFile(blobPath(store, ref), payload.subarray(0, 8));

  // The stored bytes fail their own digest, so the checkpoint must report
  // MISSING instead of handing corrupt bytes to a restore.
  await service.detail(owner, checkpoint.id);
  expect(store.get<{ retention: string }>("workspaceCheckpoint", checkpoint.id)!.retention).toBe("MISSING");

  // A second capture of the same bytes heals the slot instead of throwing
  // CAPABILITY_DENIED forever on the stale partial file.
  const again = await service.create({ owner, root: project, paths: ["blob.txt"] });
  expect(again.files[0]!.blobRef).toBe(ref);
  expect(await readFile(blobPath(store, ref))).toEqual(payload);
});

it("rejects corrupted stored bytes on read while keeping a hardlinked copy unusable", async () => {
  const { project, service, owner, store } = await fixture();
  const { checkpoint, ref } = await capture(project, service, owner, "a.txt", Buffer.from("payload\n"));
  const retention = () => store.get<{ retention: string }>("workspaceCheckpoint", checkpoint.id)!.retention;

  // Prior-format blobs at digest names remain readable while intact.
  expect(retention()).toBe("AVAILABLE");

  // A second hardlink violates single-custody reads: the blob is demoted, not trusted.
  const twin = join(store.dataDir, "checkpoint-store", "twin-copy");
  await link(blobPath(store, ref), twin);
  await service.detail(owner, checkpoint.id);
  expect(retention()).toBe("MISSING");
  await rm(twin);

  // Restoring from corrupted bytes is refused.
  await writeFile(blobPath(store, ref), "tampered");
  await service.detail(owner, checkpoint.id);
  expect(retention()).toBe("MISSING");
  await expect(
    service.planRestore(owner, { checkpointId: checkpoint.id, root: project, selectedPaths: ["a.txt"], approvalId: "approval-1" }),
  ).rejects.toMatchObject({ code: "CAPABILITY_DENIED" });
});

it("leaves no staging file after publication and concurrent captures share one blob", async () => {
  const { project, service, owner, store } = await fixture();
  const bytes = Buffer.from("shared-bytes");
  await writeFile(join(project, "shared.txt"), bytes);
  const [first, second] = await Promise.all([
    service.create({ owner, root: project, paths: ["shared.txt"] }),
    service.create({ owner, root: project, paths: ["shared.txt"] }),
  ]);
  expect(first.files[0]!.blobRef).toBe(second.files[0]!.blobRef);
  expect(await readFile(blobPath(store, first.files[0]!.blobRef))).toEqual(bytes);

  // Only complete digest-named blobs may remain: no *.tmp staging leftovers.
  const names = await readdir(blobDir(store));
  expect(names.every((name) => /^[a-f0-9]{64}$/.test(name))).toBe(true);

  // A staging file orphaned by a crash is swept once old enough, while a
  // fresh one may belong to a writer still in flight and is left alone.
  const orphan = join(blobDir(store), `.${"b".repeat(64)}.crash-orphan.tmp`);
  await writeFile(orphan, "torn");
  const past = new Date(Date.now() - 120_000);
  await utimes(orphan, past, past);
  const fresh = join(blobDir(store), `.${"c".repeat(64)}.live-writer.tmp`);
  await writeFile(fresh, "in-flight");
  const swept = await service.collectGarbage();
  expect(swept.removed).toBe(1);
  await rm(fresh);
  expect((await readdir(blobDir(store))).sort()).toEqual([first.files[0]!.blobRef]);
});

it("keeps prior-format digest blobs readable and publishes atomically over them", async () => {
  const { project, service, owner, store } = await fixture();
  const bytes = Buffer.from("prior-format\n");
  const ref = (await import("node:crypto")).createHash("sha256").update(bytes).digest("hex");
  await mkdir(blobDir(store), { recursive: true });
  // A blob written by the previous format stays valid: reads verify but do not reject it.
  await writeFile(blobPath(store, ref), bytes);

  await writeFile(join(project, "prior.txt"), bytes);
  const checkpoint = await service.create({ owner, root: project, paths: ["prior.txt"] });
  expect(checkpoint.files[0]!.blobRef).toBe(ref);
  const detail = await service.detail(owner, checkpoint.id);
  expect(detail.files.find((file) => file.path === "prior.txt")!.restorable).toBe(true);
  expect(store.get<{ retention: string }>("workspaceCheckpoint", checkpoint.id)!.retention).toBe("AVAILABLE");
  expect(await readFile(blobPath(store, ref))).toEqual(bytes);
});
