import { randomUUID } from "node:crypto";
import { lstat, open, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { HarnessError } from "../contracts/index.ts";
import { readBoundFile } from "../core/file-access.ts";
import {
  selectiveCommitV1Schema,
  type CheckpointScope,
  type SelectiveCommitHunk,
  type SelectiveCommitV1,
} from "../contracts/workspace-checkpoints.ts";
import { sha256hex, type EditJournal } from "./edit-journal.ts";
import type { ProjectTools, WorkspaceBinding } from "./tools.ts";

// M08 hunk-exact selective commit. A preview builds candidate hunks from the
// proven pre/post images (git diff HEAD in the attested managed worktree) and
// labels each hunk with the journal's attribution. A commit reads HEAD into
// a private temporary index,
// applies only the approved hunk bodies, writes the tree and the commit
// object, verifies the commit, and only then advances the branch with a
// compare-and-swap update-ref while holding the caller index lock, then
// publishes the staged delta. If the commit object exists but the ref/index
// outcome is uncertain, the record carries observedCommit — never a blind
// retry, never `git add -A`/`commit -a`/`reset --hard`.

export type HunkAttribution = "proven" | "process-window" | "unattributed";

interface SelectiveCandidate {
  path: string;
  index: number;
  digest: string;
  patch: string;
  attribution: HunkAttribution;
  requiresExplicitSelection: boolean;
}

export interface SelectivePreview {
  repositoryIdentity: string;
  managedWorktreeId: string;
  branch: string;
  expectedHead: string;
  candidates: SelectiveCandidate[];
}

export interface SelectiveCommitResult {
  record: SelectiveCommitV1;
  applied: boolean;
  head: string;
}

const SELECTIVE_COMMIT_KIND = "workspaceSelectiveCommit" as const;
const SELECTIVE_PREVIEW_KIND = "workspaceSelectivePreview" as const;

// The preview a commit is approved against. Stored at preview time so a
// commit refuses to run when the reviewed branch has since been abandoned —
// an identical HEAD on a different branch is not the approval the user took.
interface SelectivePreviewBinding {
  version: 1;
  managedWorktreeId: string;
  branch: string;
  expectedHead: string;
  indexDigest: string;
  createdAt: string;
}

interface FileSection {
  path: string;
  header: string;
  hunks: string[];
  // Digest of the live worktree bytes, for journal attribution. Null when the
  // file is unreadable or exceeds the capture bound — never proven then.
  postDigest?: string | null;
}

// Split a single-file unified diff into its header (diff/index/---/+++ lines)
// and hunk bodies. Hunks are independent on the preimage, so any subset of a
// file's hunks applies cleanly to the same preimage.
const splitFileDiff = (patch: string, path: string): FileSection => {
  const hunks: string[] = [];
  let headerEnd = 0, cursor = -1;
  for (let at = patch.indexOf("@@"); at !== -1; at = patch.indexOf("@@", at + 1)) {
    if (at > 0 && patch[at - 1] !== "\n") continue;
    if (cursor === -1) {
      headerEnd = at;
    } else {
      hunks.push(patch.slice(cursor, at));
    }
    cursor = at;
  }
  if (cursor === -1) return { path, header: patch, hunks: [] };
  hunks.push(patch.slice(cursor));
  return { path, header: patch.slice(0, headerEnd), hunks };
};

const newFilePatch = (path: string, text: string): FileSection => {
  const lines = text.split("\n");
  const count = text === "" ? 0 : text.endsWith("\n") ? lines.length - 1 : lines.length;
  const body = lines.slice(0, count).map((line) => "+" + line);
  if (text && !text.endsWith("\n")) body.push("\\ No newline at end of file");
  // An empty file has no hunk; the patch is its header only.
  const hunks = count === 0 ? "" : `@@ -0,0 +1,${count} @@\n${body.join("\n")}\n`;
  return {
    path,
    header: `diff --git a/${path} b/${path}\nnew file mode 100644\nindex 0000000..0000000\n--- /dev/null\n+++ b/${path}\n`,
    hunks: [hunks],
  };
};

const repositoryIdentity = (binding: WorkspaceBinding) =>
  sha256hex(JSON.stringify(["repository", binding.commonDirectory, binding.commonDirectoryIdentity.dev, binding.commonDirectoryIdentity.ino]));

const indexLimit = 32 * 1024 * 1024;
const callerIndex = async (path: string) => {
  const info = await lstat(path, { bigint: true });
  if (!info.isFile() || info.nlink !== 1n) throw new HarnessError("CAPABILITY_DENIED", "The caller index is not an owned regular file.");
  return readBoundFile(path, indexLimit, { dev: String(info.dev), ino: String(info.ino), size: Number(info.size) });
};

const indexDelta = (diff: string, selectedPaths: Set<string>) => {
  const fields = diff.split("\0");
  const entries: string[] = [];
  for (let offset = 0; offset < fields.length - 1; offset += 2) {
    const entry = /^:[0-7]{6} ([0-7]{6}) [0-9a-f]{40} ([0-9a-f]{40}) [ADMT]$/.exec(fields[offset]);
    const path = fields[offset + 1];
    if (!entry || !path || path.includes("\uFFFD"))
      throw new HarnessError("CAPABILITY_DENIED", "Git returned an unsupported index change.");
    if (!selectedPaths.has(path))
      throw new HarnessError("REVISION_CHANGED", "The approved selection overlaps another staged path. Refresh the preview.");
    entries.push(`${entry[1]} ${entry[2]}\t${path}\0`);
  }
  return entries.join("");
};

type Publication = {
  branch: "not-updated" | "updated" | "unknown";
  index: "not-published" | "published" | "unknown";
};
type SelectiveRecord = SelectiveCommitV1 & { uncertain?: boolean; observedHead?: string; publication?: Publication };

export class SelectiveCommitService {
  constructor(private readonly projects: ProjectTools, private readonly journal?: EditJournal) {}

  private async candidates(
    git: (args: string[], environment?: NodeJS.ProcessEnv) => Promise<string>,
    worktree: string,
    scope: CheckpointScope | undefined,
  ): Promise<FileSection[]> {
    // Git status may refresh the caller index by default, even for review.
    const readOnlyGit = { GIT_OPTIONAL_LOCKS: "0" };
    const entries = (await git(["status", "--porcelain=v1", "-z", "--untracked-files=all"], readOnlyGit)).split("\0");
    const names: string[] = [];
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (!entry) continue;
      // In -z mode a rename/copy emits the new path then the old path as a
      // separate operand; consume it. Paths are never quoted or " -> "-joined.
      const name = entry.slice(3);
      if (/[RC]/.test(entry.slice(0, 2))) i++;
      if (name.split("/").at(-1) !== ".harness-directory-guard") names.push(name);
      if (names.length >= 200) break;
    }
    const sections: FileSection[] = [];
    for (const path of names) {
      const status = (await git(["status", "--porcelain=v1", "--", path], readOnlyGit)).slice(0, 2);
      if (status === "??") {
        const bytes = await readBoundFile(join(worktree, path), 8 * 1024 * 1024 + 1).catch(() => null);
        if (bytes === null || bytes.includes(0) || bytes.length > 8 * 1024 * 1024) continue;
        let text: string;
        try {
          // A synthesized patch must carry the file's exact bytes; lossy
          // decoding would commit replacement characters instead. ignoreBOM
          // keeps a leading BOM as U+FEFF so it survives the re-encode.
          text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
        } catch {
          continue;
        }
        sections.push({ ...newFilePatch(path, text), postDigest: sha256hex(bytes) });
        continue;
      }
      const patch = await git(["diff", "--full-index", "--no-ext-diff", "--no-textconv", "HEAD", "--", path], readOnlyGit);
      if (!patch) continue;
      const post = await readBoundFile(join(worktree, path), 8 * 1024 * 1024 + 1).catch(() => null);
      sections.push({ ...splitFileDiff(patch, path), postDigest: post && post.length <= 8 * 1024 * 1024 ? sha256hex(post) : null });
    }
    void scope;
    return sections;
  }

  private attributionFor(scope: CheckpointScope | undefined, path: string, postDigest: string | null): { attribution: HunkAttribution; requiresExplicitSelection: boolean } {
    const attribution = this.journal && scope ? this.journal.hunkAttribution(scope, path, postDigest) : "unattributed";
    return { attribution, requiresExplicitSelection: attribution !== "proven" };
  }

  async preview(projectId: string, threadId: string, scope?: CheckpointScope): Promise<SelectivePreview> {
    return this.projects.managedWorktree(projectId, threadId, async ({ git, binding }) => {
      const head = (await git(["rev-parse", "HEAD"])).trim();
      const branch = (await git(["branch", "--show-current"])).trim();
      if (!/^[0-9a-f]{40}$/.test(head) || !branch) throw new HarnessError("CAPABILITY_DENIED", "A managed working copy needs a branch and a commit head.");
      const indexPath = join(binding.gitDirectory, "index");
      const indexDigest = sha256hex(await callerIndex(indexPath));
      const sections = await this.candidates(git, binding.path, scope);
      if (sha256hex(await callerIndex(indexPath)) !== indexDigest)
        throw new HarnessError("REVISION_CHANGED", "The caller index changed while preparing the preview.");
      const candidates: SelectiveCandidate[] = [];
      for (const section of sections) {
        section.hunks.forEach((patch, index) => {
          candidates.push({ path: section.path, index, digest: sha256hex(section.header + patch), patch: section.header + patch, ...this.attributionFor(scope, section.path, section.postDigest ?? null) });
        });
      }
      // Bind any later approval to this exact branch, head and semantic
      // caller index: a checkout or index edit elsewhere is not the approval
      // the user took.
      this.storePreview(binding, {
        version: 1,
        managedWorktreeId: binding.id,
        branch,
        expectedHead: head,
        indexDigest,
        createdAt: new Date().toISOString(),
      });
      return { repositoryIdentity: repositoryIdentity(binding), managedWorktreeId: binding.id, branch, expectedHead: head, candidates };
    });
  }

  async commit(
    projectId: string,
    threadId: string,
    input: { expectedHead: string; selectedHunks: SelectiveCommitHunk[]; message: string; approvalId: string; author?: { name: string; email: string }; scope?: CheckpointScope },
  ): Promise<SelectiveCommitResult> {
    const selected = selectiveCommitV1Schema.shape.selectedHunks.parse(input.selectedHunks);
    if (!selected.length) throw new HarnessError("INVALID_INPUT", "Select at least one hunk.");
    const selectedPaths = new Set(selected.map(hunk => hunk.path));
    const message = input.message?.trim();
    if (!message || message.length > 4000) throw new HarnessError("INVALID_INPUT", "A commit message is required.");
    return this.projects.managedWorktree(projectId, threadId, async ({ git, binding, signal }) => {
      const head = (await git(["rev-parse", "HEAD"])).trim();
      const branch = (await git(["branch", "--show-current"])).trim();
      if (head !== input.expectedHead || !branch) throw new HarnessError("REVISION_CHANGED", "The reviewed head changed. Refresh the selection before committing.");
      const previewed = this.projects.store.get<SelectivePreviewBinding>(SELECTIVE_PREVIEW_KIND, binding.id);
      if (!previewed || previewed.expectedHead !== input.expectedHead || previewed.branch !== branch)
        throw new HarnessError("REVISION_CHANGED", "The approved selection is not bound to the current branch. Refresh the preview before committing.");
      if (this.records(binding.id).some(receipt => receipt.approvalId === input.approvalId && receipt.uncertain))
        throw new HarnessError("REVISION_CHANGED", "The previous selective commit may have been published. Inspect the branch and index before retrying.");
      const indexPath = join(binding.gitDirectory, "index");
      const snapshot = await callerIndex(indexPath);
      const indexDigest = sha256hex(snapshot);
      if (previewed.indexDigest !== indexDigest)
        throw new HarnessError("REVISION_CHANGED", "The approved selection is not bound to the current index. Refresh the preview before committing.");

      // Rebuild the candidate set from live proven images and match the approved selection exactly.
      const sections = await this.candidates(git, binding.path, input.scope);
      const sectionsByPath = new Map(sections.map((section) => [section.path, section]));
      const patchParts: string[] = [];
      for (const hunk of [...selected].sort((a, b) => (a.path === b.path ? a.index - b.index : a.path.localeCompare(b.path)))) {
        const section = sectionsByPath.get(hunk.path);
        if (!section || section.hunks[hunk.index] === undefined) throw new HarnessError("REVISION_CHANGED", `The change at ${hunk.path} is no longer available. Refresh before committing.`);
        const patch = section.header + section.hunks[hunk.index];
        if (sha256hex(patch) !== hunk.digest) throw new HarnessError("REVISION_CHANGED", `The hunk at ${hunk.path} changed. Refresh before committing.`);
        patchParts.push(patch);
      }

      const privateIndex = join(binding.gitDirectory, `gen-selective-${randomUUID()}.index`);
      const reconciledIndex = join(binding.gitDirectory, `gen-selective-${randomUUID()}.index`);
      const patchFile = join(binding.gitDirectory, `gen-selective-${randomUUID()}.patch`);
      const lockPath = indexPath + ".lock";
      const environment = { GIT_INDEX_FILE: privateIndex };
      const reconcileEnvironment = { GIT_INDEX_FILE: reconciledIndex };
      const publication: Publication = { branch: "not-updated", index: "not-published" };
      let record: SelectiveCommitV1 | undefined;
      let lockIdentity: { dev: bigint; ino: bigint } | undefined;
      const ownsLock = async () => {
        const current = await lstat(lockPath, { bigint: true }).catch(() => undefined);
        return !!current && current.isFile() && current.nlink === 1n && current.dev === lockIdentity?.dev && current.ino === lockIdentity.ino;
      };
      const active = () => {
        if (signal.aborted) throw new HarnessError("CANCELLED", "Selective commit was cancelled.");
      };
      try {
        const file = await open(patchFile, "wx", 0o600);
        try {
          await file.writeFile(patchParts.join(""));
        } finally {
          await file.close();
        }
        // Materialize the approved snapshot without refreshing the caller index.
        const snapshotFile = await open(reconciledIndex, "wx", 0o600);
        try { await snapshotFile.writeFile(snapshot); }
        finally { await snapshotFile.close(); }
        const callerTree = (await git(["write-tree"], reconcileEnvironment)).trim();
        await git(["read-tree", input.expectedHead], environment);
        // Recheck selected preimage blobs: the private index must contain the
        // exact expectedHead blob for every selected path.
        for (const path of selectedPaths) {
          const staged = await git(["ls-files", "-s", "--", path], environment);
          const expected = await git(["ls-tree", input.expectedHead, "--", path]);
          const stagedOid = /^[0-9]+ ([0-9a-f]{40}) /.exec(staged)?.[1] ?? null;
          const expectedOid = /^[0-9]+ [a-z]+ ([0-9a-f]{40})/.exec(expected)?.[1] ?? null;
          if (stagedOid !== expectedOid) throw new HarnessError("REVISION_CHANGED", `The preimage for ${path} changed. Refresh before committing.`);
        }
        await git(["apply", "--cached", "--whitespace=nowarn", "--verbose", patchFile], environment);
        const tree = (await git(["write-tree"], environment)).trim();
        // Merge the caller's staged tree with the approved commit tree before
        // publication. Git reports overlapping staged/selected edits as a
        // conflict here, before the branch or caller index is mutated.
        let mergedIndexTree: string;
        try {
          mergedIndexTree = (await git(["merge-tree", "--write-tree", "--merge-base", input.expectedHead, callerTree, tree])).split(/\r?\n/, 1)[0].trim();
        } catch (error) {
          const details = error instanceof HarnessError ? error.details as {exitCode?: number} | undefined : undefined;
          if (error instanceof HarnessError && error.code === "GIT_ERROR" && details?.exitCode === 1)
            throw new HarnessError("REVISION_CHANGED", "The approved hunks conflict with staged content. Refresh the selection before committing.");
          throw error;
        }
        if (!/^[0-9a-f]{40}$/.test(mergedIndexTree)) throw new HarnessError("CAPABILITY_DENIED", "Git could not reconcile the approved caller index.");
        const delta = indexDelta(await git(["diff-tree", "-r", "--raw", "--no-renames", "--no-abbrev", "-z", callerTree, mergedIndexTree]), selectedPaths);
        if (delta) await git(["update-index", "-z", "--index-info"], reconcileEnvironment, delta);
        if ((await git(["write-tree"], reconcileEnvironment)).trim() !== mergedIndexTree)
          throw new HarnessError("CAPABILITY_DENIED", "The reconciled index does not match the verified staged tree.");
        const reconciledBytes = await callerIndex(reconciledIndex);
        const author = input.author ?? { name: "Gen V1", email: "gen-v1@localhost" };
        const commitOid = (
          await git(
            ["-c", `user.name=${author.name}`, "-c", `user.email=${author.email}`, "commit-tree", tree, "-p", input.expectedHead, "-m", message],
            environment,
          )
        ).trim();
        // Verify the commit before touching the branch: its tree must be the
        // tree the private index produced and its changed-path set must equal
        // the approved selection.
        const verifyTree = (await git(["rev-parse", `${commitOid}^{tree}`])).trim();
        if (verifyTree !== tree) throw new HarnessError("CAPABILITY_DENIED", "The selective commit does not match its verified tree.");
        const touched = (await git(["diff-tree", "-r", "--name-only", "--no-commit-id", commitOid])).split("\n").filter(Boolean).sort();
        const approved = [...selectedPaths].sort();
        if (JSON.stringify(touched) !== JSON.stringify(approved))
          throw new HarnessError("CAPABILITY_DENIED", "The selective commit touched files outside the approved selection.");
        const privateIndexDigest = sha256hex(await readBoundFile(privateIndex, 64 * 1024 * 1024));
        record = selectiveCommitV1Schema.parse({
          version: 1,
          repositoryIdentity: repositoryIdentity(binding),
          managedWorktreeId: binding.id,
          expectedHead: input.expectedHead,
          privateIndexDigest,
          selectedHunks: selected,
          messageDigest: sha256hex(message),
          approvalId: input.approvalId,
          observedCommit: commitOid,
        });
        active();
        const lock = await open(lockPath, "wx", 0o600).catch(error => {
          if ((error as NodeJS.ErrnoException).code === "EEXIST")
            throw new HarnessError("REVISION_CHANGED", "The caller index is locked by another Git operation. Refresh the preview.");
          throw error;
        });
        try {
          lockIdentity = await lock.stat({ bigint: true });
          if (sha256hex(await callerIndex(indexPath)) !== indexDigest)
            throw new HarnessError("REVISION_CHANGED", "The caller index changed before publication. Refresh the preview.");
          await lock.writeFile(reconciledBytes);
          await lock.sync();
        } finally { await lock.close(); }

        const ref = `refs/heads/${branch}`;
        const currentRef = await git(["symbolic-ref", "-q", "HEAD"]).catch(error => {
          const details = error instanceof HarnessError ? error.details as {exitCode?: number} | undefined : undefined;
          if (error instanceof HarnessError && error.code === "GIT_ERROR" && details?.exitCode === 1) return "";
          throw error;
        });
        if (currentRef.trim() !== ref)
          throw new HarnessError("REVISION_CHANGED", "The branch changed before publication. Refresh the preview.");
        if (!(await ownsLock()))
          throw new HarnessError("REVISION_CHANGED", "Git no longer holds the caller index lock.");
        active();

        // The durable pending receipt precedes the first shared mutation.
        // Holding Git's index lock also prevents ordinary checkout and staging.
        this.storeRecord(binding, commitOid, { ...record, uncertain: true, publication: { ...publication, branch: "unknown" } });
        publication.branch = "unknown";
        await git(["update-ref", ref, commitOid, input.expectedHead]);
        publication.branch = "updated";
        if (!(await ownsLock())) throw new HarnessError("REVISION_CHANGED", "Git no longer holds the caller index lock.");
        active();
        this.storeRecord(binding, commitOid, { ...record, uncertain: true, observedHead: commitOid, publication: { ...publication, index: "unknown" } });
        publication.index = "unknown";
        // This callback holds the verified managed directory guard. Git
        // writers cannot publish a concurrent index while our lock exists.
        await rename(lockPath, indexPath);
        lockIdentity = undefined;
        publication.index = "published";
        this.storeRecord(binding, commitOid, { ...record, publication });
        return { record, applied: true, head: commitOid };
      } catch (error) {
        if (record?.observedCommit && publication.branch !== "not-updated") {
          const commitOid = record.observedCommit;
          const observedHead = publication.branch === "updated" ? commitOid :
            signal.aborted ? "" : (await git(["rev-parse", `refs/heads/${branch}`]).catch(() => "")).trim();
          this.storeRecord(binding, commitOid, { ...record, uncertain: true, observedHead, publication });
          throw new HarnessError("REVISION_CHANGED", `The selective commit ${commitOid} was created, but publication may be incomplete. Inspect the branch and index before retrying.`, { observedCommit: commitOid, publication });
        }
        throw error;
      } finally {
        if (lockIdentity && await ownsLock()) await rm(lockPath, { force: true }).catch(() => {});
        await rm(privateIndex, { force: true }).catch(() => {});
        await rm(reconciledIndex, { force: true }).catch(() => {});
        await rm(patchFile, { force: true }).catch(() => {});
      }
    });
  }

  records(bindingId: string): SelectiveRecord[] {
    return this.projects.store.all<SelectiveRecord>(SELECTIVE_COMMIT_KIND).filter((entry) => entry.managedWorktreeId === bindingId);
  }

  private storePreview(binding: WorkspaceBinding, record: SelectivePreviewBinding): void {
    this.projects.store.internal("workspace.selective-commit.previewed", binding.threadId, () => {
      this.projects.store.put(SELECTIVE_PREVIEW_KIND, binding.id, binding.threadId, record);
    });
  }

  private storeRecord(binding: WorkspaceBinding, commitOid: string, record: SelectiveRecord): void {
    this.projects.store.internal("workspace.selective-commit.recorded", binding.threadId, () => {
      this.projects.store.put(SELECTIVE_COMMIT_KIND, commitOid, binding.threadId, record);
    });
  }
}
