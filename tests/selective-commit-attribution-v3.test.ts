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
    threadId: "thread",
    projectId: "project",
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
// top region, then the journal's proven edit covers the bottom region. The
// receipt preserves its bounded pre/post images: its preimage already
// contains the foreign line, so the proven delta is the bottom region only.
// Only the proven hunk may be auto-selected.
async function provenPlusForeignHunks(f: Awaited<ReturnType<typeof fixture>>) {
  const path = join(f.worktree, "many.txt");
  const beforeLines = Array.from({ length: 40 }, (_, index) => `line-${index}`);
  beforeLines[1] = "foreign-1";
  const lines = [...beforeLines];
  lines[30] = "proven-30";
  lines[31] = "proven-31";
  const before = Buffer.from(beforeLines.join("\n") + "\n");
  await writeFile(path, lines.join("\n") + "\n");
  const after = await readFile(path);
  f.journal.recordProvenEdit({
    invocationId: "inv-proven",
    owner: f.scope,
    workspaceIdentity: sha256hex("workspace"),
    repositoryId: "repo",
    path: "many.txt",
    beforeIdentity: null,
    beforeDigest: sha256hex(before),
    afterDigest: sha256hex(after),
    boundedBlobRefs: [
      { ref: f.journal.writeBlob(before), bytes: before.length, retention: "AVAILABLE" },
      { ref: f.journal.writeBlob(after), bytes: after.length, retention: "AVAILABLE" },
    ],
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
  const before = Buffer.from(Array.from({ length: 40 }, (_, i) => `line-${i}`).join("\n") + "\n");
  await writeFile(join(f.worktree, "many.txt"), Array.from({ length: 40 }, (_, i) => `owned-${i}`).join("\n") + "\n");
  const after = await readFile(join(f.worktree, "many.txt"));
  f.journal.recordProvenEdit({
    invocationId: "inv-all",
    owner: f.scope,
    workspaceIdentity: sha256hex("workspace"),
    repositoryId: "repo",
    path: "many.txt",
    beforeIdentity: null,
    beforeDigest: sha256hex(before),
    afterDigest: sha256hex(after),
    boundedBlobRefs: [
      { ref: f.journal.writeBlob(before), bytes: before.length, retention: "AVAILABLE" },
      { ref: f.journal.writeBlob(after), bytes: after.length, retention: "AVAILABLE" },
    ],
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

// A receipt that deleted one copy of a duplicated line must not cover a
// foreign hunk deleting the other copy: removed lines are matched by HEAD
// preimage position, mapped through the foreign delta — never by content.
it("does not credit a foreign deletion of identical content elsewhere in the file", async () => {
  const f = await fixture();
  const path = join(f.worktree, "many.txt");
  // HEAD: two identical "dup" lines, far enough apart to form two hunks.
  const headLines = ["lead", "dup", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "dup", "tail"];
  await writeFile(path, headLines.join("\n") + "\n");
  gitSync(f.worktree, "add", ".");
  gitSync(f.worktree, "commit", "-qm", "dup-baseline");
  // Foreign (unjournaled) write removes the second copy first, then the
  // proven receipt removes only the first copy.
  const preimageLines = [...headLines];
  preimageLines.splice(9, 1);
  const preimage = Buffer.from(preimageLines.join("\n") + "\n");
  const postimageLines = [...preimageLines];
  postimageLines.splice(1, 1);
  await writeFile(path, postimageLines.join("\n") + "\n");
  const after = await readFile(path);
  f.journal.recordProvenEdit({
    invocationId: "inv-dup",
    owner: f.scope,
    workspaceIdentity: sha256hex("workspace"),
    repositoryId: "repo",
    path: "many.txt",
    beforeIdentity: null,
    beforeDigest: sha256hex(preimage),
    afterDigest: sha256hex(after),
    boundedBlobRefs: [
      { ref: f.journal.writeBlob(preimage), bytes: preimage.length, retention: "AVAILABLE" },
      { ref: f.journal.writeBlob(after), bytes: after.length, retention: "AVAILABLE" },
    ],
  });
  const preview = await f.service.preview("project", "thread", f.scope);
  const hunks = preview.candidates.filter((candidate) => candidate.path === "many.txt");
  expect(hunks.length).toBeGreaterThanOrEqual(2);
  const proven = hunks.find((candidate) => candidate.patch.includes(" lead"))!;
  const foreign = hunks.find((candidate) => candidate.patch.includes(" tail"))!;
  expect(proven.attribution).toBe("proven");
  expect(foreign.attribution).toBe("unattributed");
});

// A foreign replacement of a duplicated line earlier in the file borrows the
// proven deletion's covered position by content, then fails on its own
// uncovered addition: the borrowed claim must be released, and the position
// the later proven hunk actually removes stays reserved to it.
it("does not let a foreign replacement consume the proven deletion's claim", async () => {
  const f = await fixture();
  const path = join(f.worktree, "many.txt");
  const headLines = ["lead", "dup", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "dup", "tail"];
  await writeFile(path, headLines.join("\n") + "\n");
  gitSync(f.worktree, "add", ".");
  gitSync(f.worktree, "commit", "-qm", "dup-replace-baseline");
  // Foreign (unjournaled) write replaces the first copy; the proven receipt
  // then removes only the second copy.
  const preimageLines = [...headLines];
  preimageLines[1] = "other";
  const preimage = Buffer.from(preimageLines.join("\n") + "\n");
  const postimageLines = [...preimageLines];
  postimageLines.splice(9, 1);
  await writeFile(path, postimageLines.join("\n") + "\n");
  const after = await readFile(path);
  f.journal.recordProvenEdit({
    invocationId: "inv-dup-replace",
    owner: f.scope,
    workspaceIdentity: sha256hex("workspace"),
    repositoryId: "repo",
    path: "many.txt",
    beforeIdentity: null,
    beforeDigest: sha256hex(preimage),
    afterDigest: sha256hex(after),
    boundedBlobRefs: [
      { ref: f.journal.writeBlob(preimage), bytes: preimage.length, retention: "AVAILABLE" },
      { ref: f.journal.writeBlob(after), bytes: after.length, retention: "AVAILABLE" },
    ],
  });
  const preview = await f.service.preview("project", "thread", f.scope);
  const hunks = preview.candidates.filter((candidate) => candidate.path === "many.txt");
  expect(hunks.length).toBeGreaterThanOrEqual(2);
  const foreign = hunks.find((candidate) => candidate.patch.includes("+other"))!;
  const proven = hunks.find((candidate) => candidate.patch.includes(" tail"))!;
  expect(foreign.attribution).toBe("unattributed");
  expect(proven.attribution).toBe("proven");
});

// An approved edit deleting one of two adjacent identical blocks is the same
// deletion whichever copy a diff engine names: the receipt's coverage sits on
// one copy and the staged hunk names the other, so every unmatched line
// borrows the covered position at one uniform shift — deleting either set
// leaves identical survivors.
it("attributes a proven deletion when the hunk names the other copy of a repeated block", async () => {
  const f = await fixture();
  const path = join(f.worktree, "many.txt");
  const headLines = ["lead", "A", "B", "C", "A", "B", "C", "tail"];
  await writeFile(path, headLines.join("\n") + "\n");
  gitSync(f.worktree, "add", ".");
  gitSync(f.worktree, "commit", "-qm", "block-baseline");
  const preimage = Buffer.from(headLines.join("\n") + "\n");
  const postimage = Buffer.from(["lead", "A", "B", "C", "tail"].join("\n") + "\n");
  await writeFile(path, postimage);
  const after = await readFile(path);
  f.journal.recordProvenEdit({
    invocationId: "inv-block",
    owner: f.scope,
    workspaceIdentity: sha256hex("workspace"),
    repositoryId: "repo",
    path: "many.txt",
    beforeIdentity: null,
    beforeDigest: sha256hex(preimage),
    afterDigest: sha256hex(after),
    boundedBlobRefs: [
      { ref: f.journal.writeBlob(preimage), bytes: preimage.length, retention: "AVAILABLE" },
      { ref: f.journal.writeBlob(after), bytes: after.length, retention: "AVAILABLE" },
    ],
  });
  // util.diff covers the receipt's removal at HEAD positions 5..7 (the
  // second copy); a patch engine may describe the same edit at 2..4.
  expect(
    f.journal.hunkAttribution(f.scope, "many.txt", after, preimage, {
      removed: new Map([[2, "A"], [3, "B"], [4, "C"]]),
      added: new Set(),
    }),
  ).toBe("proven");
  // Deleting positions 2 and 7 is not a copy swap — it leaves different
  // survivors and must stay unattributed.
  expect(
    f.journal.hunkAttribution(f.scope, "many.txt", after, preimage, {
      removed: new Map([[2, "A"], [7, "C"], [8, "tail"]]),
      added: new Set(),
    }),
  ).toBe("unattributed");
});

// A write that only flips one line's terminator credits that line alone: a
// foreign hunk changing the file's final newline must not ride along.
it("attributes a mid-file line-ending change without covering a foreign final-newline hunk", async () => {
  const f = await fixture();
  const path = join(f.worktree, "many.txt");
  const headLines = Array.from({ length: 10 }, (_, index) => `l${index + 1}`);
  await writeFile(path, headLines.join("\n") + "\n");
  gitSync(f.worktree, "add", ".");
  gitSync(f.worktree, "commit", "-qm", "eol-baseline");
  // Foreign write drops the final newline first; the proven receipt then
  // flips only line 2's terminator to CRLF.
  const preimage = Buffer.from(headLines.join("\n"));
  const postimage = Buffer.from("l1\nl2\r\n" + headLines.slice(2).join("\n"));
  await writeFile(path, postimage);
  const after = await readFile(path);
  f.journal.recordProvenEdit({
    invocationId: "inv-eol",
    owner: f.scope,
    workspaceIdentity: sha256hex("workspace"),
    repositoryId: "repo",
    path: "many.txt",
    beforeIdentity: null,
    beforeDigest: sha256hex(preimage),
    afterDigest: sha256hex(after),
    boundedBlobRefs: [
      { ref: f.journal.writeBlob(preimage), bytes: preimage.length, retention: "AVAILABLE" },
      { ref: f.journal.writeBlob(after), bytes: after.length, retention: "AVAILABLE" },
    ],
  });
  const preview = await f.service.preview("project", "thread", f.scope);
  const hunks = preview.candidates.filter((candidate) => candidate.path === "many.txt");
  expect(hunks.length).toBeGreaterThanOrEqual(2);
  const foreign = hunks.find((candidate) => candidate.patch.includes("No newline"))!;
  const proven = hunks.find((candidate) => !candidate.patch.includes("No newline"))!;
  expect(proven.attribution).toBe("proven");
  expect(foreign.attribution).toBe("unattributed");
});

// A foreign insertion above the proven region shifts HEAD preimage line
// numbers away from the receipt's preimage numbering: the proven
// replacement must still be attributed positionally, mapped through the
// foreign delta into the receipt's own preimage space.
it("attributes a proven replacement when an earlier insertion shifts preimage lines", async () => {
  const f = await fixture();
  const path = join(f.worktree, "many.txt");
  const lines = Array.from({ length: 40 }, (_, index) => `line-${index}`);
  const afterLines = [...lines];
  afterLines.splice(10, 0, "foreign-inserted");
  // The receipt's preimage already contains the foreign insertion: coverage
  // is the proven replacement only, whose HEAD preimage position (30) differs
  // from the receipt's preimage position (31).
  const preimageLines = [...afterLines];
  afterLines[31] = "proven-30";
  const preimage = Buffer.from(preimageLines.join("\n") + "\n");
  await writeFile(path, afterLines.join("\n") + "\n");
  const after = await readFile(path);
  f.journal.recordProvenEdit({
    invocationId: "inv-shifted",
    owner: f.scope,
    workspaceIdentity: sha256hex("workspace"),
    repositoryId: "repo",
    path: "many.txt",
    beforeIdentity: null,
    beforeDigest: sha256hex(preimage),
    afterDigest: sha256hex(after),
    boundedBlobRefs: [
      { ref: f.journal.writeBlob(preimage), bytes: preimage.length, retention: "AVAILABLE" },
      { ref: f.journal.writeBlob(after), bytes: after.length, retention: "AVAILABLE" },
    ],
  });
  const preview = await f.service.preview("project", "thread", f.scope);
  const proven = preview.candidates.find((candidate) => candidate.path === "many.txt" && candidate.patch.includes("proven-30"))!;
  const foreign = preview.candidates.find((candidate) => candidate.path === "many.txt" && candidate.patch.includes("foreign-inserted"))!;
  expect(proven.attribution).toBe("proven");
  expect(foreign.attribution).toBe("unattributed");
});

// An approved write that only removes the final newline must stay proven:
// the line-level delta is empty, so coverage is the authored last line.
it("keeps a trailing-newline-only proven write attributable", async () => {
  const f = await fixture();
  const path = join(f.worktree, "many.txt");
  const before = await readFile(path);
  await writeFile(path, before.toString("utf8").replace(/\n$/, ""));
  const after = await readFile(path);
  f.journal.recordProvenEdit({
    invocationId: "inv-eol",
    owner: f.scope,
    workspaceIdentity: sha256hex("workspace"),
    repositoryId: "repo",
    path: "many.txt",
    beforeIdentity: null,
    beforeDigest: sha256hex(before),
    afterDigest: sha256hex(after),
    boundedBlobRefs: [
      { ref: f.journal.writeBlob(before), bytes: before.length, retention: "AVAILABLE" },
      { ref: f.journal.writeBlob(after), bytes: after.length, retention: "AVAILABLE" },
    ],
  });
  const preview = await f.service.preview("project", "thread", f.scope);
  const hunk = preview.candidates.find((candidate) => candidate.path === "many.txt")!;
  expect(hunk.attribution).toBe("proven");
  expect(hunk.requiresExplicitSelection).toBe(false);
});
