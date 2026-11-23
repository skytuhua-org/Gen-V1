import { afterEach, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Store } from "../packages/storage/store.ts";
import { ProjectTools } from "../packages/workspace/tools.ts";
import type { GitHistoryPage } from "../packages/contracts/code-review.ts";
import {
  GitHistorySnapshots,
  readHistoryCommit,
  readHistoryFile,
  readHistoryPage,
} from "../packages/workspace/git-history.ts";

async function plainRepo() {
  const root = await mkdtemp(join(tmpdir(), "gen-history-direct-")),
    source = join(root, "source");
  await mkdir(source);
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", source, ...args], { encoding: "utf8", windowsHide: true }).trim();
  git("init");
  git("config", "user.name", "Fixture");
  git("config", "user.email", "fixture@example.invalid");
  git("config", "core.autocrlf", "false");
  cleanup.push(async () => {
    await rm(root, { recursive: true, force: true, maxRetries: 5 });
  });
  const commit = async (name: string, content: string | Buffer, message: string) => {
    await writeFile(join(source, name), content);
    git("add", "--", name);
    git("commit", "-m", message);
  };
  const context = {
    git: async (args: string[]) =>
      execFileSync("git", ["-C", source, ...args], { encoding: "utf8", windowsHide: true, maxBuffer: 64 * 1024 * 1024 }),
    signal: new AbortController().signal,
    owner: "owner",
  };
  const snapshots = new GitHistorySnapshots();
  return { source, git, commit, context, snapshots };
}

it("reads pages, details and patches directly against a plain repository", async () => {
  const { git, commit, context, snapshots } = await plainRepo();
  await commit("one.txt", "base\n", "Base");
  git("mv", "one.txt", "renamed.txt");
  git("commit", "-m", "Rename");
  await commit("blob.bin", Buffer.from([0, 1, 2, 3]), "Binary");
  const page = await readHistoryPage(context, snapshots);
  expect(page.snapshotId).toMatch(/^[a-f0-9]{64}$/);
  expect(page.branch).toBe(git("branch", "--show-current"));
  expect(page.commits.map((row) => row.subject)).toEqual(["Binary", "Rename", "Base"]);
  expect(page.commits[0].filesChanged).toBe(1);
  expect(page.commits[0].pushState).toBe("unknown");
  const head = await readHistoryCommit(context, snapshots, page.snapshotId!, page.commits[0].oid);
  expect(head.basis).toBe("first-parent");
  expect(head.parentOid).toBe(page.commits[1].oid);
  const binaryPatch = await readHistoryFile(context, snapshots, head.comparisonId, "blob.bin");
  expect(binaryPatch.state).toBe("binary");
  const renameDetail = await readHistoryCommit(context, snapshots, page.snapshotId!, page.commits[1].oid);
  const renamed = renameDetail.files.find((file) => file.path === "renamed.txt");
  expect(renamed?.status.startsWith("R")).toBe(true);
  expect(renamed?.oldPath).toBe("one.txt");
  const rootDetail = await readHistoryCommit(context, snapshots, page.snapshotId!, page.commits[2].oid);
  expect(rootDetail.basis).toBe("root");
  expect(rootDetail.files.map((file) => file.path)).toContain("one.txt");
  const rootPatch = await readHistoryFile(context, snapshots, rootDetail.comparisonId, "one.txt");
  expect(rootPatch.state).toBe("text");
  expect(rootPatch.text).toContain("+base");
});

it("scopes a deleted file's patch away from same-named directory contents", async () => {
  const { git, context, snapshots, source } = await plainRepo();
  await writeFile(join(source, "gone.txt"), "a\n");
  git("add", "--", "gone.txt");
  git("commit", "-m", "File");
  git("rm", "gone.txt");
  await mkdir(join(source, "gone.txt"));
  await writeFile(join(source, "gone.txt", "x"), "b\n");
  git("add", "--", "gone.txt");
  git("commit", "-m", "File to directory");
  const page = await readHistoryPage(context, snapshots);
  const detail = await readHistoryCommit(context, snapshots, page.snapshotId!, page.commits[0].oid);
  const deleted = detail.files.find((file) => file.path === "gone.txt" && file.status === "D");
  expect(deleted).toBeDefined();
  const patch = await readHistoryFile(context, snapshots, detail.comparisonId, "gone.txt");
  expect(patch.state).toBe("text");
  expect(patch.text).toContain("gone.txt");
  expect(patch.text).not.toContain("gone.txt/x");
  expect(patch.text).not.toContain("+b");
});

it("serves patches for filenames needing spaces, tabs or quoting", async () => {
  const { commit, context, snapshots } = await plainRepo();
  await commit("space name.txt", "one\n", "Spaced");
  await commit("üñïcode.txt", "two\n", "Unicode");
  const page = await readHistoryPage(context, snapshots);
  const spaced = await readHistoryCommit(context, snapshots, page.snapshotId!, page.commits[1].oid);
  const spacedPatch = await readHistoryFile(context, snapshots, spaced.comparisonId, "space name.txt");
  expect(spacedPatch.state).toBe("text");
  expect(spacedPatch.text).toContain("+one");
  const unicode = await readHistoryCommit(context, snapshots, page.snapshotId!, page.commits[0].oid);
  const unicodePatch = await readHistoryFile(context, snapshots, unicode.comparisonId, "üñïcode.txt");
  expect(unicodePatch.state).toBe("text");
  expect(unicodePatch.text).toContain("+two");
});

it("reports a shallow-boundary commit's parent as unavailable, not root", async () => {
  const { git, source, context, snapshots } = await plainRepo();
  await writeFile(join(source, "a.txt"), "1\n");
  git("add", "--", "a.txt");
  git("commit", "-m", "one");
  await writeFile(join(source, "a.txt"), "2\n");
  git("add", "--", "a.txt");
  git("commit", "-m", "two");
  const shallow = join(source, "..", "shallow");
  execFileSync("git", ["clone", "--depth", "1", "--no-tags", `file://${source}`, shallow], { windowsHide: true });
  const shallowContext = {
    git: async (args: string[]) =>
      execFileSync("git", ["-C", shallow, ...args], { encoding: "utf8", windowsHide: true, maxBuffer: 64 * 1024 * 1024 }),
    signal: context.signal,
    owner: context.owner,
  };
  const page = await readHistoryPage(shallowContext, snapshots);
  expect(page.commits).toHaveLength(1);
  await expect(readHistoryCommit(shallowContext, snapshots, page.snapshotId!, page.commits[0].oid)).rejects.toMatchObject({
    code: "HISTORY_GRAFTED",
  });
});

it("reports an unborn HEAD as an empty page", async () => {
  const { context, snapshots } = await plainRepo();
  const page = await readHistoryPage(context, snapshots);
  expect(page).toMatchObject({ snapshotId: null, headOid: null, commits: [], nextCursor: null });
});

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
  git("init");
  git("config", "user.name", "Fixture");
  git("config", "user.email", "fixture@example.invalid");
  git("config", "core.autocrlf", "false");
  await writeFile(join(source, "one.txt"), "base\n");
  git("add", ".");
  git("commit", "-m", "Base");
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
  return {
    tools,
    store,
    projectId,
    source,
    git,
    path: (await tools.binding(projectId, "main")).path,
  };
}

it("lists history for the managed working copy with subject, author and counts", async () => {
  const { tools, projectId, path, source } = await fixture();
  const sourceGit = (...args: string[]) =>
    execFileSync("git", ["-C", path, ...args], { encoding: "utf8", windowsHide: true }).trim();
  await writeFile(join(path, "two.txt"), "two\n");
  sourceGit("add", ".");
  sourceGit("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "-m", "Second commit");
  const page = await tools.gitHistory(projectId, "main", {});
  expect(page.snapshotId).toMatch(/^[a-f0-9]{64}$/);
  expect(page.headOid).toMatch(/^[0-9a-f]{40}$/);
  expect(page.commits.length).toBe(2);
  expect(page.commits[0].subject).toBe("Second commit");
  expect(page.commits[0].author).toBe("Fixture");
  expect(page.commits[0].author).not.toContain("@");
  expect(page.commits[0].filesChanged).toBe(1);
  expect(page.commits[1].subject).toBe("Base");
  expect(["unpushed", "notMarked", "unknown"]).toContain(page.commits[0].pushState);
  expect(page.nextCursor).toBeNull();
  void source;
});

it("pages without gaps or repeats and rejects a tampered cursor", async () => {
  const { tools, projectId, path } = await fixture();
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", path, ...args], { encoding: "utf8", windowsHide: true }).trim();
  for (let i = 0; i < 60; i++) {
    await writeFile(join(path, `file-${String(i).padStart(2, "0")}.txt`), `${i}\n`);
    git("add", ".");
    git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "-m", `Commit ${i}`);
  }
  const first = await tools.gitHistory(projectId, "main", {});
  expect(first.commits.length).toBe(50);
  expect(first.nextCursor).toBeTruthy();
  const second = await tools.gitHistory(projectId, "main", { cursor: first.nextCursor! });
  expect(second.commits.length).toBe(11);
  expect(second.nextCursor).toBeNull();
  const seen = new Set(first.commits.map((row) => row.oid));
  for (const row of second.commits) {
    expect(seen.has(row.oid)).toBe(false);
    seen.add(row.oid);
  }
  await expect(tools.gitHistory(projectId, "main", { cursor: "bogus" })).rejects.toMatchObject({
    code: "INVALID_INPUT",
  });
});

it("authorizes commit detail only for served rows and labels rename, binary and root diffs", async () => {
  const { tools, projectId, path } = await fixture();
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", path, ...args], { encoding: "utf8", windowsHide: true }).trim();
  git("mv", "one.txt", "renamed.txt");
  await writeFile(join(path, "image.bin"), Buffer.from([0, 1, 2, 3, 4]));
  git("add", ".");
  git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "-m", "Rename and binary");
  const page = (await tools.gitHistory(projectId, "main", {})) as GitHistoryPage;
  const head = page.commits[0],
    root = page.commits.at(-1)!;
  const detail = await tools.gitHistoryCommit(projectId, "main", { snapshotId: page.snapshotId!, oid: head.oid });
  expect(detail.basis).toBe("first-parent");
  expect(detail.parentOid).toBe(root.oid);
  const renamed = detail.files.find((file) => file.path === "renamed.txt");
  expect(renamed?.status.startsWith("R")).toBe(true);
  expect(renamed?.oldPath).toBe("one.txt");
  const binary = detail.files.find((file) => file.path === "image.bin");
  expect(binary).toBeTruthy();
  const binaryPatch = await tools.gitHistoryFile(projectId, "main", {
    comparisonId: detail.comparisonId,
    path: "image.bin",
  });
  expect(binaryPatch.state).toBe("binary");
  const renamedPatch = await tools.gitHistoryFile(projectId, "main", {
    comparisonId: detail.comparisonId,
    path: "renamed.txt",
  });
  expect(["text", "empty"]).toContain(renamedPatch.state);
  const rootDetail = await tools.gitHistoryCommit(projectId, "main", {
    snapshotId: page.snapshotId!,
    oid: root.oid,
  });
  expect(rootDetail.basis).toBe("root");
  expect(rootDetail.parentOid).toBeNull();
  await expect(
    tools.gitHistoryCommit(projectId, "main", {
      snapshotId: page.snapshotId!,
      oid: "0".repeat(40),
    }),
  ).rejects.toMatchObject({ code: "NOT_FOUND" });
  await expect(
    tools.gitHistoryFile(projectId, "main", { comparisonId: detail.comparisonId, path: "missing.txt" }),
  ).rejects.toMatchObject({ code: "NOT_FOUND" });
});

it("refuses continuation after the tip moves and expires served snapshots", async () => {
  const { tools, projectId, path } = await fixture();
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", path, ...args], { encoding: "utf8", windowsHide: true }).trim();
  for (let i = 0; i < 55; i++) {
    await writeFile(join(path, `f${i}.txt`), `${i}\n`);
    git("add", ".");
    git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "-m", `c${i}`);
  }
  const first = await tools.gitHistory(projectId, "main", {});
  await writeFile(join(path, "new.txt"), "new\n");
  git("add", ".");
  git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "-m", "tip moved");
  await expect(tools.gitHistory(projectId, "main", { cursor: first.nextCursor! })).rejects.toMatchObject({
    code: "HISTORY_CHANGED",
  });
  const fresh = await tools.gitHistory(projectId, "main", {});
  expect(fresh.commits[0].subject).toBe("tip moved");
  await expect(
    tools.gitHistoryCommit(projectId, "main", {
      snapshotId: first.snapshotId!,
      oid: first.commits[0].oid,
    }),
  ).rejects.toMatchObject({ code: "HISTORY_CHANGED" });
});

it("never marks commits unpushed without a locally known upstream", async () => {
  const { tools, projectId } = await fixture();
  const page = await tools.gitHistory(projectId, "main", {});
  expect(page.commits[0].pushState === "unpushed" || page.commits[0].pushState === "unknown").toBe(true);
});
