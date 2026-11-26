import { afterEach, expect, it, vi } from "vitest";
import { mkdir, mkdtemp, readFile, rm, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Store } from "../packages/storage/store.ts";
import { checkpointScope } from "../packages/workspace/edit-journal.ts";
import { CheckpointService, type StoredRestorePlan } from "../packages/workspace/checkpoints.ts";

// The Linux directory guard needs the host broker (fd 3/4); swap the boundary
// for plain fs so the restore logic — not the mount fence — is what is tested.
vi.mock("../packages/core/file-access.ts", async (importActual) => {
  const actual = await importActual<typeof import("../packages/core/file-access.ts")>();
  const { readFile: fsReadFile, rename } = await import("node:fs/promises");
  return {
    ...actual,
    withPathGuard: async (_paths: unknown, signal: AbortSignal, action: (manifest: readonly unknown[]) => Promise<unknown>) => {
      signal.throwIfAborted();
      return action([]);
    },
    readBoundFile: async (path: string, limit?: number) => {
      const data = await fsReadFile(path);
      if (limit !== undefined && data.length >= limit) {
        const error = new Error("File exceeds the bound size limit.") as Error & { code?: string };
        error.code = "RESOURCE_LIMIT";
        throw error;
      }
      return data;
    },
    replaceOwnedFile: async (source: string, destination: string) => rename(source, destination),
  };
});

// Reproduction fixtures for the checkpoint-restore audit cases: double-apply
// race, root binding, interrupted APPLYING reconcile, stale temp cleanup and
// the per-path outcome receipt.
const roots: string[] = [];
const stores: Store[] = [];
afterEach(async () => {
  for (const store of stores.splice(0)) store.close();
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true, maxRetries: 5 });
});

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "harness-restore-reconcile-"));
  roots.push(root);
  const store = new Store(join(root, "state"));
  stores.push(store);
  const project = join(root, "project");
  await mkdir(project, { recursive: true });
  const service = new CheckpointService(store);
  const owner = checkpointScope({ projectId: "project", threadId: "thread", workingCopyId: "wc-1", binding: { path: project } });
  return { root, store, project, service, owner };
}

const setPlanState = (store: Store, plan: StoredRestorePlan, state: StoredRestorePlan["state"]) => {
  store.internal("fixture.state", plan.scope.threadId, () => {
    const latest = store.get<StoredRestorePlan>("workspaceRestorePlan", plan.id)!;
    store.put("workspaceRestorePlan", plan.id, plan.scope.threadId, { ...latest, state });
  });
};

it("refuses a second concurrent apply instead of double-applying", async () => {
  const { project, service, owner } = await fixture();
  await writeFile(join(project, "a.txt"), "a-old\n");
  const checkpoint = await service.create({ owner, root: project, paths: ["a.txt"] });
  await writeFile(join(project, "a.txt"), "a-new\n");
  const plan = await service.planRestore(owner, { checkpointId: checkpoint.id, root: project, selectedPaths: ["a.txt"], approvalId: "approval-race" });
  // Both calls pass the PREVIEW check before either reaches the transition.
  const settled = await Promise.allSettled([
    service.applyRestore(owner, { planId: plan.id, approvalId: "approval-race", root: project }),
    service.applyRestore(owner, { planId: plan.id, approvalId: "approval-race", root: project }),
  ]);
  const fulfilled = settled.filter((entry) => entry.status === "fulfilled");
  const rejected = settled.filter((entry) => entry.status === "rejected");
  expect(fulfilled).toHaveLength(1);
  expect(rejected).toHaveLength(1);
  expect((rejected[0] as PromiseRejectedResult).reason).toMatchObject({ code: "REVISION_CHANGED" });
  // Exactly one writer landed: the file holds the checkpoint bytes once.
  expect(await readFile(join(project, "a.txt"), "utf8")).toBe("a-old\n");
  expect((fulfilled[0] as PromiseFulfilledResult<StoredRestorePlan>).value.state).toBe("APPLIED");
});

it("binds the plan to the previewed root and refuses a different one", async () => {
  const { root, project, service, owner } = await fixture();
  const other = join(root, "other-root");
  await mkdir(other, { recursive: true });
  await writeFile(join(project, "a.txt"), "a-old\n");
  const checkpoint = await service.create({ owner, root: project, paths: ["a.txt"] });
  await writeFile(join(project, "a.txt"), "a-new\n");
  const plan = await service.planRestore(owner, { checkpointId: checkpoint.id, root: project, selectedPaths: ["a.txt"], approvalId: "approval-root" });
  await expect(service.applyRestore(owner, { planId: plan.id, approvalId: "approval-root", root: other })).rejects.toMatchObject({ code: "CAPABILITY_DENIED" });
  await expect(service.reconcileRestore(owner, { planId: plan.id, root: other })).rejects.toMatchObject({ code: "REVISION_CHANGED" });
  expect((await service.applyRestore(owner, { planId: plan.id, approvalId: "approval-root", root: project })).state).toBe("APPLIED");
});

it("reconciles an interrupted apply whose writes landed", async () => {
  const { project, service, owner, store } = await fixture();
  await writeFile(join(project, "a.txt"), "a-old\n");
  const checkpoint = await service.create({ owner, root: project, paths: ["a.txt"] });
  await writeFile(join(project, "a.txt"), "a-new\n");
  const plan = await service.planRestore(owner, { checkpointId: checkpoint.id, root: project, selectedPaths: ["a.txt"], approvalId: "approval-k1" });
  // The killed apply wrote the target then died before finalizing.
  await writeFile(join(project, "a.txt"), "a-old\n");
  setPlanState(store, plan, "APPLYING");
  const reconciled = await service.reconcileRestore(owner, { planId: plan.id, root: project });
  expect(reconciled.state).toBe("APPLIED");
  expect(reconciled.results).toEqual([{ path: "a.txt", status: "applied" }]);
  expect(store.get<StoredRestorePlan>("workspaceRestorePlan", plan.id)!.state).toBe("APPLIED");
});

it("reconciles an interrupted apply with mixed and uncertain outcomes", async () => {
  const { project, service, owner, store } = await fixture();
  await writeFile(join(project, "a.txt"), "a-old\n");
  await writeFile(join(project, "b.txt"), "b-old\n");
  await writeFile(join(project, "c.txt"), "c-old\n");
  const checkpoint = await service.create({ owner, root: project, paths: ["a.txt", "b.txt", "c.txt"] });
  await writeFile(join(project, "a.txt"), "a-new\n");
  await writeFile(join(project, "b.txt"), "b-new\n");
  await writeFile(join(project, "c.txt"), "c-new\n");
  const plan = await service.planRestore(owner, { checkpointId: checkpoint.id, root: project, selectedPaths: ["a.txt", "b.txt", "c.txt"], approvalId: "approval-k2" });
  // Killed mid-apply: a.txt restored, b.txt untouched, c.txt rewritten by a third party.
  await writeFile(join(project, "a.txt"), "a-old\n");
  await writeFile(join(project, "c.txt"), "c-other\n");
  setPlanState(store, plan, "APPLYING");
  const reconciled = await service.reconcileRestore(owner, { planId: plan.id, root: project });
  expect(reconciled.state).toBe("PARTIAL_RECOVERY_REQUIRED");
  expect(reconciled.results).toEqual([
    { path: "a.txt", status: "applied" },
    { path: "b.txt", status: "not_applied" },
    { path: "c.txt", status: "uncertain" },
  ]);
  expect(reconciled.conflicts).toEqual(["b.txt", "c.txt"]);
  // Reconcile writes nothing: every byte on disk is preserved.
  expect(await readFile(join(project, "a.txt"), "utf8")).toBe("a-old\n");
  expect(await readFile(join(project, "b.txt"), "utf8")).toBe("b-new\n");
  expect(await readFile(join(project, "c.txt"), "utf8")).toBe("c-other\n");
});

it("reconciles an interrupted apply that never wrote as CONFLICT", async () => {
  const { project, service, owner, store } = await fixture();
  await writeFile(join(project, "a.txt"), "a-old\n");
  const checkpoint = await service.create({ owner, root: project, paths: ["a.txt"] });
  await writeFile(join(project, "a.txt"), "a-new\n");
  const plan = await service.planRestore(owner, { checkpointId: checkpoint.id, root: project, selectedPaths: ["a.txt"], approvalId: "approval-k3" });
  setPlanState(store, plan, "APPLYING");
  const reconciled = await service.reconcileRestore(owner, { planId: plan.id, root: project });
  expect(reconciled.state).toBe("CONFLICT");
  expect(reconciled.results).toEqual([{ path: "a.txt", status: "not_applied" }]);
});

it("sweeps stale restore temp files a killed apply left behind", async () => {
  const { project, service, owner } = await fixture();
  await writeFile(join(project, "a.txt"), "a-old\n");
  const checkpoint = await service.create({ owner, root: project, paths: ["a.txt"] });
  await writeFile(join(project, "a.txt"), "a-new\n");
  const orphan = join(project, ".gen-restore-00000000-0000-0000-0000-000000000000.tmp");
  await writeFile(orphan, "half-written\n");
  const stale = new Date(Date.now() - 120_000);
  await utimes(orphan, stale, stale);
  const fresh = join(project, ".gen-restore-11111111-1111-1111-1111-111111111111.tmp");
  await writeFile(fresh, "concurrent-writer\n");
  const plan = await service.planRestore(owner, { checkpointId: checkpoint.id, root: project, selectedPaths: ["a.txt"], approvalId: "approval-sweep" });
  await service.applyRestore(owner, { planId: plan.id, approvalId: "approval-sweep", root: project });
  await expect(readFile(orphan)).rejects.toThrow();
  // A fresh temp may belong to a concurrent restore and is never touched.
  expect(await readFile(fresh, "utf8")).toBe("concurrent-writer\n");
});

it("records a per-path receipt on the finished plan", async () => {
  const { project, service, owner, store } = await fixture();
  await writeFile(join(project, "a.txt"), "a-old\n");
  await writeFile(join(project, "b.txt"), "b-old\n");
  const checkpoint = await service.create({ owner, root: project, paths: ["a.txt", "b.txt"] });
  const plan = await service.planRestore(owner, { checkpointId: checkpoint.id, root: project, selectedPaths: ["a.txt", "b.txt"], approvalId: "approval-receipt" });
  await writeFile(join(project, "b.txt"), "b-external\n");
  const applied = await service.applyRestore(owner, { planId: plan.id, approvalId: "approval-receipt", root: project });
  expect(applied.state).toBe("CONFLICT");
  expect(applied.results).toEqual([
    { path: "a.txt", status: "rolled_back" },
    { path: "b.txt", status: "conflict" },
  ]);
  expect(store.get<StoredRestorePlan>("workspaceRestorePlan", plan.id)!.results).toEqual(applied.results);
});
