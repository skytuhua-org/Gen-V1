import { afterEach, expect, it, vi } from "vitest";
import { link, lstat, mkdir, mkdtemp, readdir, readFile, rm, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Store } from "../packages/storage/store.ts";
import { checkpointScope } from "../packages/workspace/edit-journal.ts";
import { CheckpointService } from "../packages/workspace/checkpoints.ts";
import { withPathGuard } from "../packages/core/file-access.ts";
import type { CheckpointOwner } from "../apps/web/src/file-checkpoint-api.ts";

// Model the native deny-delete leaf pins as well as its custody checks. These
// are deterministic boundary tests, not native Windows qualification.
const custody = vi.hoisted(() => ({
  pins: new Map<string, number>(),
  beforePublish: undefined as undefined | ((source: string, destination: string) => Promise<void>),
}));
vi.mock("node:fs/promises", async (importActual) => {
  const actual = await importActual<typeof import("node:fs/promises")>();
  return {
    ...actual,
    rename: async (source: string, destination: string) => {
      if (custody.pins.has(destination)) throw Object.assign(new Error("Destination has a deny-delete pin"), { code: "EPERM" });
      return actual.rename(source, destination);
    },
  };
});
vi.mock("../packages/core/file-access.ts", async (importActual) => {
  const actual = await importActual<typeof import("../packages/core/file-access.ts")>();
  const fs = await vi.importActual<typeof import("node:fs/promises")>("node:fs/promises");
  const { HarnessError } = await import("../packages/contracts/index.ts");
  const { createHash } = await import("node:crypto");
  const digest = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
  return {
    ...actual,
    withPathGuard: async (paths: { path: string; leaf: boolean }[], signal: AbortSignal, action: (manifest: unknown) => Promise<unknown>) => {
      if (signal.aborted) throw new HarnessError("CANCELLED", "Fixture operation cancelled");
      const acquired: string[] = [];
      try {
        for (const entry of paths.filter((path) => path.leaf)) {
          const info = await fs.lstat(entry.path);
          if (!info.isFile() || info.isSymbolicLink() || info.nlink !== 1) throw new HarnessError("CAPABILITY_DENIED", "Fixture custody rejected");
          custody.pins.set(entry.path, (custody.pins.get(entry.path) ?? 0) + 1);
          acquired.push(entry.path);
        }
        return await action([]);
      } finally {
        for (const path of acquired) {
          const remaining = custody.pins.get(path)! - 1;
          if (remaining) custody.pins.set(path, remaining); else custody.pins.delete(path);
        }
      }
    },
    replaceOwnedFile: async (source: string, destination: string, identity: { dev: bigint; ino: bigint }, sha256: string, signal: AbortSignal, expectedDestinationHash?: string) => {
      await custody.beforePublish?.(source, destination);
      if (signal.aborted) throw new HarnessError("CANCELLED", "Fixture operation cancelled");
      if (custody.pins.has(destination)) throw Object.assign(new Error("Destination has a deny-delete pin"), { code: "EPERM" });
      const info = await fs.lstat(source, { bigint: true });
      if (info.dev !== identity.dev || info.ino !== identity.ino || digest(await actual.readBoundFile(source, 8 * 1024 * 1024)) !== sha256)
        throw new HarnessError("CAPABILITY_DENIED", "Fixture replacement source changed");
      if (expectedDestinationHash !== undefined && digest(await actual.readBoundFile(destination, 8 * 1024 * 1024)) !== expectedDestinationHash)
        throw new HarnessError("PRECONDITION_FAILED", "Fixture replacement destination changed");
      await fs.rename(source, destination);
    },
  };
});

const roots: string[] = [];
const stores: Store[] = [];
afterEach(async () => {
  custody.beforePublish = undefined;
  expect(custody.pins.size).toBe(0);
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

it("keeps prior-format digest blobs readable without replacing a valid file", async () => {
  const { project, service, owner, store } = await fixture();
  const bytes = Buffer.from("prior-format\n");
  const ref = (await import("node:crypto")).createHash("sha256").update(bytes).digest("hex");
  await mkdir(blobDir(store), { recursive: true });
  // A blob written by the previous format stays valid: reads verify but do not reject it.
  await writeFile(blobPath(store, ref), bytes);
  const original = await lstat(blobPath(store, ref), { bigint: true });

  await writeFile(join(project, "prior.txt"), bytes);
  const checkpoint = await service.create({ owner, root: project, paths: ["prior.txt"] });
  expect(checkpoint.files[0]!.blobRef).toBe(ref);
  const detail = await service.detail(owner, checkpoint.id);
  expect(detail.files.find((file) => file.path === "prior.txt")!.restorable).toBe(true);
  expect(store.get<{ retention: string }>("workspaceCheckpoint", checkpoint.id)!.retention).toBe("AVAILABLE");
  expect(await readFile(blobPath(store, ref))).toEqual(bytes);
  expect((await lstat(blobPath(store, ref), { bigint: true })).ino).toBe(original.ino);
});

it("reuses valid bytes while another reader holds a deny-delete leaf pin", async () => {
  const { project, service, owner, store } = await fixture();
  const bytes = Buffer.from("shared pinned bytes\n");
  const { ref } = await capture(project, service, owner, "pinned.txt", bytes);
  await withPathGuard([{ path: blobPath(store, ref), leaf: true, readOnly: true }], new AbortController().signal, async () => {
    const again = await service.create({ owner, root: project, paths: ["pinned.txt"] });
    expect(again.files[0]!.blobRef).toBe(ref);
    expect(await readFile(blobPath(store, ref))).toEqual(bytes);
  });
});

it("preserves the old blob and removes only its stage when publication fails", async () => {
  const { project, service, owner, store } = await fixture();
  const { ref } = await capture(project, service, owner, "retry.txt", Buffer.from("complete bytes\n"));
  await writeFile(blobPath(store, ref), "partial");
  const otherStage = join(blobDir(store), `.${ref}.other-writer.tmp`);
  await writeFile(otherStage, "other operation");
  custody.beforePublish = async () => { throw new Error("synthetic publish failure"); };
  await expect(service.create({ owner, root: project, paths: ["retry.txt"] })).rejects.toThrow("synthetic publish failure");
  expect(await readFile(blobPath(store, ref), "utf8")).toBe("partial");
  expect((await readdir(blobDir(store))).sort()).toEqual([`.${ref}.other-writer.tmp`, ref].sort());
});

it("refuses a changed corrupt preimage instead of overwriting a concurrent writer", async () => {
  const { project, service, owner, store } = await fixture();
  const { ref } = await capture(project, service, owner, "race.txt", Buffer.from("complete bytes\n"));
  await writeFile(blobPath(store, ref), "partial");
  custody.beforePublish = async (_source, destination) => { await writeFile(destination, "newer bytes"); };
  await expect(service.create({ owner, root: project, paths: ["race.txt"] })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  expect(await readFile(blobPath(store, ref), "utf8")).toBe("newer bytes");
  expect(await readdir(blobDir(store))).toEqual([ref]);
});

it("keeps cancellation distinct from missing or untrusted blob bytes", async () => {
  const { project, service, owner, store } = await fixture();
  const { checkpoint } = await capture(project, service, owner, "cancel.txt", Buffer.from("retained bytes\n"));
  const controller = new AbortController();
  controller.abort();
  await expect(service.detail(owner, checkpoint.id, { signal: controller.signal })).rejects.toMatchObject({ code: "CANCELLED" });
  expect(store.get<{ retention: string }>("workspaceCheckpoint", checkpoint.id)!.retention).toBe("AVAILABLE");
});
