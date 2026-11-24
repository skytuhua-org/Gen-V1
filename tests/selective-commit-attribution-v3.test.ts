import { afterEach, expect, it } from "vitest";
import { execFile, execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { Store } from "../packages/storage/store.ts";
import { SelectiveCommitService } from "../packages/workspace/selective-commit.ts";
import { checkpointScope, EditJournal, sha256hex } from "../packages/workspace/edit-journal.ts";
import type { ProjectTools, WorkspaceBinding } from "../packages/workspace/tools.ts";

// T02 regression for issue #2025: hunk attribution must be per-hunk, not
// per-path. A foreign (out-of-journal) hunk in the same file must not ride
// along as "proven" when the newest receipt only covers the owner's hunk.
// The current path-level predicate applies the newest receipt's outcome to
// every hunk of the path, so the foreign-hunk assertions below fail until
// T03 lands the per-hunk mapping.

const roots: string[] = [];
const stores: Store[] = [];
afterEach(async () => {
  for (const store of stores.splice(0)) store.close();
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true, maxRetries: 5 });
});

const gitSync = (cwd: string, ...args: string[]) =>
  execFileSync("git", ["-c", "core.hooksPath=NUL", "-c", "core.fsmonitor=false", "-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", ...args], {
    cwd,
    windowsHide: true,
    encoding: "utf8",
    env: { ...process.env, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: process.platform === "win32" ? "NUL" : "/dev/null", GIT_OPTIONAL_LOCKS: "0" },
  });

const gitAsync = promisify(execFile);

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "harness-attr-v3-"));
  roots.push(root);
  const worktree = join(root, "worktree");
  await mkdir(worktree);
  gitSync(worktree, "init", "-q", "-b", "main");
  await writeFile(
    join(worktree, "many.txt"),
    Array.from({ length: 40 }, (_, index) => `line-${index}`).join("\n") + "\n",
  );
  gitSync(worktree, "add", ".");
  gitSync(worktree, "commit", "-qm", "base");

  const store = new Store(join(root, "state"));
  stores.push(store);
  const journal = new EditJournal(store);
  const binding = {
    id: "wc-1",
    path: worktree,
    gitDirectory: join(worktree, ".git"),
    commonDirectory: join(worktree, ".git"),
    commonDirectoryIdentity: { dev: "0", ino: "0" },
    identity: { dev: "0", ino: "0" },
  } as unknown as WorkspaceBinding;
  const projects = {
    managedWorktree: async (_projectId: string, _threadId: string, run: (ctx: { git: (args: string[], env?: NodeJS.ProcessEnv) => Promise<string>; binding: WorkspaceBinding; signal: AbortSignal }) => Promise<unknown>) =>
      run({
        git: async (args, env) =>
          (await gitAsync("git", args, { cwd: worktree, encoding: "utf8", env: { ...process.env, ...env } })).stdout as string,
        binding,
        signal: new AbortController().signal,
      }),
  } as unknown as ProjectTools;
  const scope = checkpointScope({ projectId: "project", threadId: "thread", workingCopyId: binding.id, binding: { path: worktree, gitDirectory: binding.gitDirectory, identity: binding.identity } });
  const service = new SelectiveCommitService(projects, journal);
  return { root, worktree, store, journal, scope, service };
}

// Two separated hunks in one file: an out-of-journal foreign write edits the
// top region, then the journal's proven edit covers the bottom region and the
// receipt's post-image digest covers the final file. Only the proven hunk may
// be auto-selected.
async function provenPlusForeignHunks(f: Awaited<ReturnType<typeof fixture>>) {
  const path = join(f.worktree, "many.txt");
  const lines = Array.from({ length: 40 }, (_, index) => `line-${index}`);
  lines[1] = "foreign-1";
  lines[30] = "proven-30";
  lines[31] = "proven-31";
  await writeFile(path, lines.join("\n") + "\n");
  f.journal.recordProvenEdit({
    invocationId: "inv-proven",
    owner: f.scope,
    workspaceIdentity: sha256hex("workspace"),
    repositoryId: "repo",
    path: "many.txt",
    beforeIdentity: null,
    beforeDigest: null,
    afterDigest: sha256hex(await readFile(path)),
  });
}

it("attributes only the proven hunk to the journal owner; a foreign hunk in the same file stays unattributed", async () => {
  const f = await fixture();
  await provenPlusForeignHunks(f);
  const preview = await f.service.preview("project", "thread", f.scope);
  const hunks = preview.candidates.filter((candidate) => candidate.path === "many.txt");
  expect(hunks.length).toBeGreaterThanOrEqual(2);
  const foreign = hunks.find((hunk) => hunk.patch.includes("foreign-1"));
  const proven = hunks.find((hunk) => hunk.patch.includes("proven-30"));
  expect(foreign).toBeDefined();
  expect(proven).toBeDefined();
  expect(proven!.attribution).toBe("proven");
  expect(proven!.requiresExplicitSelection).toBe(false);
  // The foreign region has no receipt: it must never ride the path-level
  // proven label into an automatic selection.
  expect(foreign!.attribution).toBe("unattributed");
  expect(foreign!.requiresExplicitSelection).toBe(true);
});

it("keeps a wholly proven file auto-selectable and an out-of-journal-only file gated", async () => {
  const f = await fixture();
  // Positive control: every change journaled -> proven, auto-selectable.
  await writeFile(join(f.worktree, "many.txt"), Array.from({ length: 40 }, (_, i) => `owned-${i}`).join("\n") + "\n");
  f.journal.recordProvenEdit({
    invocationId: "inv-all",
    owner: f.scope,
    workspaceIdentity: sha256hex("workspace"),
    repositoryId: "repo",
    path: "many.txt",
    beforeIdentity: null,
    beforeDigest: null,
    afterDigest: sha256hex(await readFile(join(f.worktree, "many.txt"))),
  });
  // Negative control: a second file edited outside the journal entirely.
  await writeFile(join(f.worktree, "two.txt"), "foreign\n");
  const preview = await f.service.preview("project", "thread", f.scope);
  const owned = preview.candidates.filter((candidate) => candidate.path === "many.txt");
  const alien = preview.candidates.filter((candidate) => candidate.path === "two.txt");
  expect(owned.length).toBeGreaterThanOrEqual(1);
  expect(owned.every((hunk) => hunk.attribution === "proven" && !hunk.requiresExplicitSelection)).toBe(true);
  expect(alien.length).toBeGreaterThanOrEqual(1);
  expect(alien.every((hunk) => hunk.attribution === "unattributed" && hunk.requiresExplicitSelection)).toBe(true);
});
