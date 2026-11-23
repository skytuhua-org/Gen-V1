import { afterEach, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Store } from "../packages/storage/store.ts";
import { ProjectTools } from "../packages/workspace/tools.ts";
import type { GitHistoryPage } from "../packages/contracts/code-review.ts";

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  for (const close of cleanup.splice(0).reverse()) await close();
});
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "gen-history-")),
    source = join(root, "source");
  await mkdir(source);
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", source, ...args], { encoding: "utf8", windowsHide: true }).trim();
  git("init", "-b", "main");
  git("config", "user.name", "Fixture");
  git("config", "user.email", "fixture@example.invalid");
  git("config", "core.autocrlf", "false");
  await writeFile(join(source, "one.txt"), "base\n");
  git("add", ".");
  git("commit", "-m", "Base");
  git("remote", "add", "origin", "https://github.com/example/fixture.git");
  const store = new Store(join(root, "data")),
    tools = new ProjectTools(store);
  cleanup.push(async () => {
    await tools.dispose();
    store.close();
    await rm(root, { recursive: true, force: true, maxRetries: 5 });
  });
  const receipt = await tools.connect({
    id: "connect",
    type: "workspace.project.connect",
    payload: { name: "Fixture", path: source },
  });
  const projectId = (receipt.result as { projects: { id: string }[] }).projects[0].id;
  const thread = {
    id: "main",
    title: "Main",
    projectId,
    projectName: "Fixture",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "ready" as const,
    epoch: 0,
    runId: null,
    modelId: null,
    sessionPath: null,
    kind: "main" as const,
  };
  store.internal("fixture", null, () => store.put("thread", thread.id, thread.id, thread));
  await tools.prepareWorkspace(thread);
  const path = (await tools.binding(projectId, "main")).path;
  const wgit = (...args: string[]) =>
    execFileSync("git", ["-C", path, ...args], { encoding: "utf8", windowsHide: true }).trim();
  return { tools, projectId, path, wgit };
}
const commit = async (path: string, wgit: (...a: string[]) => string, name: string, body: string, message: string) => {
  await writeFile(join(path, name), body);
  wgit("add", name);
  wgit("-c", "commit.gpgsign=false", "commit", "-m", message);
};
const page = async (tools: ProjectTools, projectId: string, cursor?: string) => {
  const read = await tools.gitHistory(projectId, "main", cursor ? { cursor } : {});
  if (read.state === "error") throw Error(`${read.error.code}: ${read.error.message}`);
  return read.value as GitHistoryPage;
};

it("serves newest-first pinned pages and refuses continuation after the tip moves", async () => {
  const { tools, projectId, path, wgit } = await fixture();
  const head = wgit("rev-parse", "HEAD").trim();
  for (let index = 1; index <= 55; index++) await commit(path, wgit, `f${index}.txt`, `${index}\n`, `Change ${index}`);
  const first = await page(tools, projectId);
  expect(first.snapshotId).toMatch(/^[a-f0-9]{64}$/);
  expect(first.headOid).toBe(wgit("rev-parse", "HEAD").trim());
  expect(first.branch).toBe(wgit("branch", "--show-current"));
  expect(first.commits).toHaveLength(50);
  expect(first.commits[0]!.oid).toBe(first.headOid);
  expect(first.nextCursor).toBe(first.snapshotId);
  const second = await page(tools, projectId, first.nextCursor!);
  expect(second.snapshotId).toBe(first.snapshotId);
  expect(second.commits).toHaveLength(6);
  expect(second.nextCursor).toBeNull();
  const oids = new Set([...first.commits, ...second.commits].map((row) => row.oid));
  expect(oids.size).toBe(56);
  expect(oids.has(head)).toBe(true);
  const row = first.commits.find((row) => row.subject === "Change 55");
  expect(row).toMatchObject({ author: "Fixture", filesChanged: 1 });
  expect(row!.pushState).toBe("unknown");

  const stale = await tools.gitHistory(projectId, "main", { cursor: first.snapshotId });
  expect(stale.state).toBe("empty");
  await commit(path, wgit, "moved.txt", "moved\n", "Move tip");
  const moved = await tools.gitHistory(projectId, "main", { cursor: first.snapshotId });
  expect(moved.state).toBe("error");
  if (moved.state !== "error") throw Error("Expected stale error");
  expect(moved.error.code).toBe("REVISION_CHANGED");
  expect(moved.error.message).toBe("History changed. Refresh history to continue.");
});

it("marks commits unpushed only against the exact local remote-tracking ref", async () => {
  const { tools, projectId, path, wgit } = await fixture();
  const base = wgit("rev-parse", "HEAD").trim();
  const branch = wgit("branch", "--show-current");
  await commit(path, wgit, "ahead.txt", "ahead\n", "Ahead");
  wgit("update-ref", `refs/remotes/origin/${branch}`, base);
  const read = await page(tools, projectId);
  expect(read.upstreamRef).toBe(`refs/remotes/origin/${branch}`);
  const ahead = read.commits.find((row) => row.oid === wgit("rev-parse", "HEAD").trim());
  const pushed = read.commits.find((row) => row.oid === base);
  expect(ahead!.pushState).toBe("unpushed");
  expect(pushed!.pushState).toBe("notMarked");
});

it("reads committed file lists and patches for first-parent and root commits", async () => {
  const { tools, projectId, path, wgit } = await fixture();
  await commit(path, wgit, "two.txt", "two\n", "Second");
  const read = await page(tools, projectId);
  const tip = read.commits[0]!;
  const detail = await tools.gitHistoryCommit(projectId, "main", { snapshotId: read.snapshotId, oid: tip.oid });
  expect(detail.oid).toBe(tip.oid);
  expect(detail.basis).toBe("first-parent");
  expect(detail.parentOid).toBe(read.commits[1]!.oid);
  expect(detail.files).toHaveLength(1);
  expect(detail.files[0]).toMatchObject({ path: "two.txt", status: "A", additions: 1, deletions: 0 });
  const patch = await tools.gitHistoryFile(projectId, "main", { comparisonId: detail.comparisonId, path: "two.txt" });
  expect(patch.state).toBe("text");
  expect(patch.text).toContain("+two");
  expect(patch.identity).toMatchObject({ kind: "commit", oid: tip.oid, basis: "first-parent" });

  const root = read.commits.at(-1)!;
  const rootDetail = await tools.gitHistoryCommit(projectId, "main", {
    snapshotId: read.snapshotId,
    oid: root.oid,
  });
  expect(rootDetail.basis).toBe("root");
  expect(rootDetail.parentOid).toBeNull();
  expect(rootDetail.files.some((file) => file.path === "one.txt")).toBe(true);
  const rootPatch = await tools.gitHistoryFile(projectId, "main", {
    comparisonId: rootDetail.comparisonId,
    path: "one.txt",
  });
  expect(rootPatch.state).toBe("text");
  expect(rootPatch.text).toContain("+base");
});

it("denies commits and comparisons that were never served to this owner", async () => {
  const { tools, projectId } = await fixture();
  const read = await page(tools, projectId);
  const alien = "0".repeat(39) + "1";
  await expect(
    tools.gitHistoryCommit(projectId, "main", { snapshotId: read.snapshotId, oid: alien }),
  ).rejects.toMatchObject({ code: "CAPABILITY_DENIED" });
  await expect(
    tools.gitHistoryFile(projectId, "main", { comparisonId: "f".repeat(64), path: "one.txt" }),
  ).rejects.toMatchObject({ code: "COMPARISON_EXPIRED" });
  const other = await tools.gitHistory(projectId, undefined, {});
  expect(other.state).not.toBe("error");
  await expect(
    tools.gitHistoryCommit(projectId, "main", { snapshotId: "e".repeat(64), oid: read.commits[0]!.oid }),
  ).rejects.toMatchObject({ code: "HISTORY_STALE" });
});

it("rejects malformed queries before touching the repository", async () => {
  const { tools, projectId } = await fixture();
  await expect(tools.gitHistory(projectId, "main", { cursor: "not-opaque!" })).rejects.toThrow();
  await expect(
    tools.gitHistoryCommit(projectId, "main", { snapshotId: "x".repeat(64), oid: "bogus" }),
  ).rejects.toThrow();
  await expect(
    tools.gitHistoryFile(projectId, "main", { comparisonId: "z".repeat(63), path: "one.txt" }),
  ).rejects.toThrow();
});
