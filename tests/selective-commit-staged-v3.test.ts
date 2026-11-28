import { afterEach, expect, it } from "vitest";
import { execFile, execFileSync } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, rm, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { Store } from "../packages/storage/store.ts";
import { SelectiveCommitService } from "../packages/workspace/selective-commit.ts";
import { checkpointScope, EditJournal } from "../packages/workspace/edit-journal.ts";
import type { ProjectTools, WorkspaceBinding } from "../packages/workspace/tools.ts";

// Use real Git in a disposable repository while controlling the boundary
// between the selective commit service and the Git subprocess.
const roots: string[] = [];
const stores: Store[] = [];
afterEach(async () => {
  for (const store of stores.splice(0)) store.close();
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true, maxRetries: 5 });
});

const git = (cwd: string, ...args: string[]) =>
  execFileSync("git", ["-c", "core.hooksPath=NUL", "-c", "core.fsmonitor=false", "-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", ...args], {
    cwd,
    windowsHide: true,
    encoding: "utf8",
    env: { ...process.env, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: process.platform === "win32" ? "NUL" : "/dev/null", GIT_OPTIONAL_LOCKS: "0" },
  });

const gitAsync = promisify(execFile);

async function fixture(beforeGit?: (worktree: string, args: string[]) => Promise<void>) {
  const root = await mkdtemp(join(tmpdir(), "harness-staged-v3-"));
  roots.push(root);
  const worktree = join(root, "worktree");
  await mkdir(worktree);
  git(worktree, "init", "-q", "-b", "main");
  await writeFile(join(worktree, "chosen.txt"), "chosen-0\n");
  await writeFile(join(worktree, "unrelated.txt"), "unrelated-0\n");
  git(worktree, "add", ".");
  git(worktree, "commit", "-qm", "base");

  const store = new Store(join(root, "state"));
  stores.push(store);
  const journal = new EditJournal(store);
  const binding = {
    id: "wc-1",
    threadId: "thread",
    path: worktree,
    gitDirectory: join(worktree, ".git"),
    commonDirectory: join(worktree, ".git"),
    commonDirectoryIdentity: { dev: "0", ino: "0" },
    identity: { dev: "0", ino: "0" },
  } as unknown as WorkspaceBinding;
  const projects = {
    store,
    managedWorktree: async (_projectId: string, _threadId: string, run: (ctx: { git: (args: string[], env?: NodeJS.ProcessEnv) => Promise<string>; binding: WorkspaceBinding; signal: AbortSignal }) => Promise<unknown>) =>
      run({
        git: async (args, env, stdin?: string) => {
          await beforeGit?.(worktree, args);
          const command = gitAsync("git", args, { cwd: worktree, encoding: "utf8", env: { ...process.env, ...env } });
          if (stdin !== undefined) command.child.stdin!.end(stdin);
          return (await command).stdout;
        },
        binding,
        signal: new AbortController().signal,
      }),
  } as unknown as ProjectTools;
  const scope = checkpointScope({ projectId: "project", threadId: "thread", workingCopyId: binding.id, binding: { path: worktree, gitDirectory: binding.gitDirectory, identity: binding.identity } });
  const service = new SelectiveCommitService(projects, journal);
  return { root, worktree, store, journal, scope, service };
}

const stagedStatus = (worktree: string, path: string) =>
  git(worktree, "status", "--porcelain=v1", "--", path).slice(0, 2);

it("preserves unrelated staged entries across a selective commit", async () => {
  const f = await fixture();
  // Stage an unrelated new file and leave an unstaged edit for selection.
  await writeFile(join(f.worktree, "unrelated.txt"), "unrelated-1\n");
  await writeFile(join(f.worktree, "staged-new.txt"), "staged-new\n");
  git(f.worktree, "add", "unrelated.txt", "staged-new.txt");
  await writeFile(join(f.worktree, "chosen.txt"), "chosen-1\n");
  expect(stagedStatus(f.worktree, "staged-new.txt")).toBe("A ");

  const preview = await f.service.preview("project", "thread", f.scope);
  const chosen = preview.candidates.filter((c) => c.path === "chosen.txt").map(({ path, index, digest }) => ({ path, index, digest }));
  expect(chosen.length).toBeGreaterThanOrEqual(1);
  await f.service.commit("project", "thread", {
    expectedHead: preview.expectedHead,
    selectedHunks: chosen,
    message: "commit only chosen.txt",
    approvalId: "approval-1",
  });

  // The selected hunk committed; unrelated staged entries must still be staged.
  expect(git(f.worktree, "log", "-1", "--format=%s")).toContain("commit only chosen.txt");
  expect(stagedStatus(f.worktree, "staged-new.txt")).toBe("A ");
  expect(stagedStatus(f.worktree, "unrelated.txt")).toBe("M ");
});

it("refuses a commit when the branch moved since the preview, even at equal HEAD", async () => {
  const f = await fixture();
  await writeFile(join(f.worktree, "chosen.txt"), "chosen-1\n");
  const preview = await f.service.preview("project", "thread", f.scope);
  const chosen = preview.candidates.filter((c) => c.path === "chosen.txt").map(({ path, index, digest }) => ({ path, index, digest }));
  // The approval was taken on main; the user switched to a sibling branch at
  // the same commit. Committing now must not silently retarget the approval.
  git(f.worktree, "checkout", "-qb", "feature");
  await expect(
    f.service.commit("project", "thread", {
      expectedHead: preview.expectedHead,
      selectedHunks: chosen,
      message: "redirected commit",
      approvalId: "approval-1",
    }),
  ).rejects.toMatchObject({ code: "REVISION_CHANGED" });
  expect(git(f.worktree, "log", "-1", "--format=%s", "feature")).toContain("base");
});

it("preserves an unrelated staged hunk inside a partly selected file", async () => {
  const f = await fixture();
  const baseLines = Array.from({ length: 30 }, (_, i) => `line-${i + 1}`);
  await writeFile(join(f.worktree, "chosen.txt"), `${baseLines.join("\n")}\n`);
  git(f.worktree, "add", "chosen.txt");
  git(f.worktree, "commit", "-qm", "chosen base");
  const stagedLines = [...baseLines];
  stagedLines[2] = "staged-top";
  await writeFile(join(f.worktree, "chosen.txt"), `${stagedLines.join("\n")}\n`);
  git(f.worktree, "add", "chosen.txt");
  const worktreeLines = [...stagedLines];
  worktreeLines[27] = "selected-bottom";
  await writeFile(join(f.worktree, "chosen.txt"), `${worktreeLines.join("\n")}\n`);

  const preview = await f.service.preview("project", "thread", f.scope);
  const hunks = preview.candidates.filter((c) => c.path === "chosen.txt");
  const selected = hunks.filter((c) => c.patch.includes("+selected-bottom")).map(({ path, index, digest }) => ({ path, index, digest }));
  expect(selected).toHaveLength(1);
  expect(hunks.some((c) => c.patch.includes("+staged-top"))).toBe(true);
  await f.service.commit("project", "thread", {
    expectedHead: preview.expectedHead,
    selectedHunks: selected,
    message: "commit only selected bottom hunk",
    approvalId: "approval-partial-file",
  });

  const committed = git(f.worktree, "show", "HEAD:chosen.txt");
  expect(committed).toContain("selected-bottom");
  expect(committed).not.toContain("staged-top");
  const cached = git(f.worktree, "diff", "--cached", "--", "chosen.txt");
  expect(cached).toContain("+staged-top");
  expect(cached).not.toContain("+selected-bottom");
  expect(git(f.worktree, "diff", "--", "chosen.txt")).toBe("");
  expect(git(f.worktree, "show", ":chosen.txt")).toContain("staged-top");
});

it("refuses a commit when only the caller index changed after preview", async () => {
  const f = await fixture();
  await writeFile(join(f.worktree, "chosen.txt"), "chosen-1\n");
  const preview = await f.service.preview("project", "thread", f.scope);
  const chosen = preview.candidates.filter((c) => c.path === "chosen.txt").map(({ path, index, digest }) => ({ path, index, digest }));
  await writeFile(join(f.worktree, "index-only.txt"), "index mutation\n");
  git(f.worktree, "add", "index-only.txt");
  await expect(
    f.service.commit("project", "thread", {
      expectedHead: preview.expectedHead,
      selectedHunks: chosen,
      message: "index moved commit",
      approvalId: "approval-index-moved",
    }),
  ).rejects.toMatchObject({ code: "REVISION_CHANGED" });
  expect(git(f.worktree, "log", "-1", "--format=%s")).toContain("base");
});

it("still commits cleanly for the unambiguous single-branch flow (control)", async () => {
  const f = await fixture();
  await writeFile(join(f.worktree, "chosen.txt"), "chosen-1\n");
  const preview = await f.service.preview("project", "thread", f.scope);
  const chosen = preview.candidates.filter((c) => c.path === "chosen.txt").map(({ path, index, digest }) => ({ path, index, digest }));
  await f.service.commit("project", "thread", {
    expectedHead: preview.expectedHead,
    selectedHunks: chosen,
    message: "clean selective commit",
    approvalId: "approval-1",
  });
  expect(git(f.worktree, "log", "-1", "--format=%s")).toContain("clean selective commit");
  expect(git(f.worktree, "show", "--format=", "--name-only", "HEAD").trim()).toBe("chosen.txt");
});


it("rejects a caller index edit during Git preparation before moving the branch", async () => {
  let stagedEntry = "";
  const f = await fixture(async (worktree, args) => {
    if (args[0] !== "merge-tree") return;
    const path = join(worktree, "late.txt");
    await writeFile(path, "late staged bytes\n");
    git(worktree, "add", "late.txt");
    stagedEntry = git(worktree, "ls-files", "-s", "--", "late.txt");
    await writeFile(path, "different unstaged bytes\n");
  });
  await writeFile(join(f.worktree, "chosen.txt"), "chosen-1\n");
  const preview = await f.service.preview("project", "thread", f.scope);
  const selectedHunks = preview.candidates.filter(hunk => hunk.path === "chosen.txt").map(({ path, index, digest }) => ({ path, index, digest }));

  await expect(f.service.commit("project", "thread", {
    expectedHead: preview.expectedHead, selectedHunks, message: "stale caller index", approvalId: "approval-race",
  })).rejects.toMatchObject({ code: "REVISION_CHANGED" });
  expect(stagedEntry).not.toBe("");
  expect(git(f.worktree, "ls-files", "-s", "--", "late.txt")).toBe(stagedEntry);
  expect(git(f.worktree, "show", ":late.txt")).toBe("late staged bytes\n");
  expect(git(f.worktree, "rev-parse", "HEAD").trim()).toBe(preview.expectedHead);
});

it("blocks a standard Git writer while publishing the protected caller index", async () => {
  let writerError = "";
  const f = await fixture(async (worktree, args) => {
    if (args[0] !== "update-ref") return;
    try { git(worktree, "add", "late.txt"); }
    catch (error) { writerError = String(error); }
  });
  await writeFile(join(f.worktree, "chosen.txt"), "chosen-1\n");
  const preview = await f.service.preview("project", "thread", f.scope);
  const selectedHunks = preview.candidates.filter(hunk => hunk.path === "chosen.txt").map(({ path, index, digest }) => ({ path, index, digest }));
  // The unselected path appears after preview without changing the caller index.
  await writeFile(join(f.worktree, "late.txt"), "writer tried to stage this\n");

  const result = await f.service.commit("project", "thread", {
    expectedHead: preview.expectedHead, selectedHunks, message: "protected index", approvalId: "approval-lock",
  }).finally(() => expect(writerError).toMatch(/index\.lock/i));
  expect(result.applied).toBe(true);
  expect(git(f.worktree, "rev-parse", "HEAD").trim()).toBe(result.head);
  expect(git(f.worktree, "show", "HEAD:chosen.txt")).toBe("chosen-1\n");
  expect(git(f.worktree, "status", "--porcelain", "--", "late.txt")).toBe("?? late.txt\n");
  await expect(access(join(f.worktree, ".git", "index.lock"))).rejects.toMatchObject({ code: "ENOENT" });
});

it("preserves unrelated caller index flags", async () => {
  const f = await fixture();
  const flags = () => git(f.worktree, "ls-files", "-v", "--", "unrelated.txt");
  git(f.worktree, "update-index", "--assume-unchanged", "unrelated.txt");
  expect(flags()).toBe("h unrelated.txt\n");
  await writeFile(join(f.worktree, "chosen.txt"), "chosen-1\n");
  const preview = await f.service.preview("project", "thread", f.scope);
  const selectedHunks = preview.candidates.map(({ path, index, digest }) => ({ path, index, digest }));

  await f.service.commit("project", "thread", {
    expectedHead: preview.expectedHead, selectedHunks, message: "keep caller flags", approvalId: "approval-flags",
  });
  expect(flags()).toBe("h unrelated.txt\n");
});

it.each([
  { description: "updates the private index", alreadyStaged: false },
  { description: "reuses the prepared index bytes", alreadyStaged: true },
])("keeps a same-size unselected edit visible when it races the caller index and $description", async ({ alreadyStaged }) => {
  const f = await fixture();
  // Model coarse stat comparison without sleeps or platform-specific timing.
  git(f.worktree, "config", "core.trustctime", "false");
  git(f.worktree, "config", "core.checkStat", "minimal");
  const timestamp = Math.floor(Date.now() / 1000) - 8;
  const unrelated = join(f.worktree, "unrelated.txt");
  await utimes(unrelated, timestamp, timestamp);
  git(f.worktree, "add", "unrelated.txt");

  await writeFile(join(f.worktree, "staged.txt"), "ordinary staged content\n");
  await writeFile(join(f.worktree, "flagged.txt"), "tracked flagged content\n");
  git(f.worktree, "add", "staged.txt", "flagged.txt");
  git(f.worktree, "update-index", "--assume-unchanged", "flagged.txt");
  const carried = git(f.worktree, "ls-files", "-sv", "--", "staged.txt", "flagged.txt");

  await writeFile(join(f.worktree, "chosen.txt"), "chosen-1\n");
  if (alreadyStaged) {
    git(f.worktree, "add", "chosen.txt");
    git(f.worktree, "write-tree");
  }
  await writeFile(unrelated, "unrelated-1\n");
  await utimes(unrelated, timestamp, timestamp);
  await utimes(join(f.worktree, ".git", "index"), timestamp, timestamp);
  expect(stagedStatus(f.worktree, "unrelated.txt")).toBe(" M");

  const preview = await f.service.preview("project", "thread", f.scope);
  expect(preview.candidates.map(candidate => candidate.path)).toContain("unrelated.txt");
  const selectedHunks = preview.candidates.filter(candidate => candidate.path === "chosen.txt").map(({ path, index, digest }) => ({ path, index, digest }));
  const result = await f.service.commit("project", "thread", {
    expectedHead: preview.expectedHead,
    selectedHunks,
    message: "commit chosen only",
    approvalId: "racy-index-approval",
  });

  expect(result.applied).toBe(true);
  expect(await readFile(unrelated, "utf8")).toBe("unrelated-1\n");
  expect(git(f.worktree, "ls-files", "-sv", "--", "staged.txt", "flagged.txt")).toBe(carried);
  expect(stagedStatus(f.worktree, "unrelated.txt")).toBe(" M");
  expect(git(f.worktree, "diff", "HEAD", "--", "unrelated.txt")).toContain("+unrelated-1");
});
