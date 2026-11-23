import { createHash } from "node:crypto";
import { HarnessError } from "../contracts/index.ts";
import {
  CODE_REVIEW_LIMITS,
  GIT_HISTORY_LIMITS,
  type ComparisonFile,
  type ComparisonPatch,
  type GitCommitComparison,
  type GitCommitIdentity,
  type GitCommitPatch,
  type GitHistoryCommitRow,
  type GitHistoryPage,
  type GitHistoryPushState,
  type GitHistoryRead,
} from "../contracts/code-review.ts";
import type { LocalReviewContext } from "./code-review.ts";

const oidRe = /^[0-9a-f]{40}$/;
const text = (value: string, max: number) => value.replace(/[-]/g, "").slice(0, max);
const localPath = (value: string) =>
  value.length <= 1024 &&
  !/[\\:\0]/.test(value) &&
  !value.startsWith("/") &&
  !value.split("/").some((part) => !part || part === "." || part === ".." || part.toLowerCase() === ".git");
const lit = (path: string) => ":(literal)" + path;

export const historyError = (error: unknown): GitHistoryRead => ({
  state: "error",
  error:
    error instanceof HarnessError
      ? { code: error.code, message: error.message }
      : {
          code: "HISTORY_UNAVAILABLE",
          message: "Commit history is unavailable. Refresh or reconnect and retry.",
        },
});
export const historyResult = (value: GitHistoryPage): GitHistoryRead => ({
  state: value.commits.length || value.nextCursor ? "ready" : "empty",
  value,
});

export interface HistorySnapshot {
  id: string;
  owner: string;
  createdAt: number;
  touchedAt: number;
  headOid: string;
  branch: string | null;
  upstreamRef: string | null;
  /** Null when membership could not be verified within the bounded walk. */
  unpushed: Set<string> | null;
  served: Set<string>;
  offset: number;
  exhausted: boolean;
  comparisons: Map<string, GitCommitComparison>;
}

/** Bounded, owner-scoped immutable history snapshots. Eviction requires an explicit refresh. */
export class GitHistorySnapshots {
  private readonly entries = new Map<string, HistorySnapshot>();
  private count(owner: string) {
    let total = 0;
    for (const entry of this.entries.values()) if (entry.owner === owner) total++;
    return total;
  }
  private evict() {
    const now = Date.now();
    for (const [id, entry] of this.entries)
      if (now - entry.touchedAt > GIT_HISTORY_LIMITS.snapshotIdleMs) this.entries.delete(id);
    while (this.entries.size > GIT_HISTORY_LIMITS.snapshotsGlobal) {
      const oldest = [...this.entries.values()].reduce((a, b) => (a.touchedAt < b.touchedAt ? a : b));
      this.entries.delete(oldest.id);
    }
  }
  save(owner: string, entry: Omit<HistorySnapshot, "id" | "owner" | "createdAt" | "touchedAt">) {
    while (this.count(owner) >= GIT_HISTORY_LIMITS.snapshotsPerOwner) {
      const stale = [...this.entries.values()].filter((value) => value.owner === owner);
      const oldest = stale.reduce((a, b) => (a.touchedAt < b.touchedAt ? a : b));
      this.entries.delete(oldest.id);
    }
    this.evict();
    const id = createHash("sha256")
      .update(JSON.stringify([owner, entry.headOid, entry.branch, entry.upstreamRef, Date.now(), Math.random()]))
      .digest("hex");
    this.entries.set(id, { ...entry, id, owner, createdAt: Date.now(), touchedAt: Date.now() });
    return this.entries.get(id)!;
  }
  get(owner: string, id: string) {
    this.evict();
    const entry = this.entries.get(id);
    if (!entry || entry.owner !== owner)
      throw new HarnessError("HISTORY_STALE", "History changed. Refresh history to continue.");
    entry.touchedAt = Date.now();
    return entry;
  }
  /** Locate the owner snapshot that served a committed comparison. */
  getByComparison(owner: string, comparisonId: string) {
    this.evict();
    for (const entry of this.entries.values())
      if (entry.owner === owner && entry.comparisons.has(comparisonId)) {
        entry.touchedAt = Date.now();
        return entry;
      }
    throw new HarnessError("COMPARISON_EXPIRED", "Refresh history before reading this file.");
  }
}

/** Branch, tip and unborn-state resolution inside the attested Git boundary. */
export async function resolveGitTip(context: LocalReviewContext): Promise<{
  branch: string | null;
  headOid: string | null;
}> {
  const branch = (await context.git(["branch", "--show-current"])).trim() || null;
  let headOid: string | null = null;
  try {
    headOid = (await context.git(["rev-parse", "--verify", "--end-of-options", "HEAD"])).trim();
  } catch {
    headOid = null;
  }
  if (headOid !== null && !oidRe.test(headOid))
    throw new HarnessError("GIT_ERROR", "Git operation did not complete.");
  return { branch, headOid };
}

/** Exact local remote-tracking ref used for the unpushed basis; never a network ref. */
async function resolveUpstream(context: LocalReviewContext, branch: string | null) {
  if (!branch) return { upstreamRef: null, upstreamOid: null };
  const candidates = ["@{upstream}", "refs/remotes/origin/" + branch];
  for (const candidate of candidates) {
    try {
      const ref = (
        await context.git(["rev-parse", "--symbolic-full-name", "--verify", "--end-of-options", candidate])
      ).trim();
      if (!ref.startsWith("refs/")) continue;
      const upstreamOid = (await context.git(["rev-parse", "--verify", "--end-of-options", ref])).trim();
      if (oidRe.test(upstreamOid)) return { upstreamRef: ref, upstreamOid };
    } catch {
      /* No resolvable local upstream. */
    }
  }
  return { upstreamRef: null, upstreamOid: null };
}

/** Bounded membership walk; a capped or failed walk marks membership unknown. */
async function unpushedSet(
  context: LocalReviewContext,
  headOid: string,
  upstreamOid: string | null,
): Promise<Set<string> | null> {
  if (!upstreamOid) return null;
  try {
    const raw = await context.git([
      "rev-list",
      "--max-count=" + GIT_HISTORY_LIMITS.unpushedWalk,
      "--end-of-options",
      headOid,
      "^" + upstreamOid,
    ]);
    const rows = raw.split("\n").filter(Boolean);
    if (rows.length >= GIT_HISTORY_LIMITS.unpushedWalk || rows.some((row) => !oidRe.test(row))) return null;
    return new Set(rows);
  } catch {
    return null;
  }
}

/** Create a pinned history snapshot. Called only when no cursor is supplied. */
export async function createGitHistorySnapshot(
  context: LocalReviewContext,
): Promise<Omit<HistorySnapshot, "id" | "owner" | "createdAt" | "touchedAt">> {
  const { branch, headOid } = await resolveGitTip(context);
  if (!headOid) {
    return {
      headOid: "",
      branch,
      upstreamRef: null,
      unpushed: null,
      served: new Set(),
      offset: 0,
      exhausted: true,
      comparisons: new Map(),
    };
  }
  const { upstreamRef, upstreamOid } = await resolveUpstream(context, branch);
  return {
    headOid,
    branch,
    upstreamRef,
    unpushed: await unpushedSet(context, headOid, upstreamOid),
    served: new Set(),
    offset: 0,
    exhausted: false,
    comparisons: new Map(),
  };
}

/** Refuse continuation when the live tip no longer matches the pinned snapshot. */
export async function verifyGitTip(context: LocalReviewContext, snapshot: HistorySnapshot) {
  const current = await resolveGitTip(context);
  if (current.headOid !== (snapshot.headOid || null) || current.branch !== snapshot.branch)
    throw new HarnessError("REVISION_CHANGED", "History changed. Refresh history to continue.");
  if (snapshot.headOid) {
    const upstream = await resolveUpstream(context, snapshot.branch);
    if (upstream.upstreamRef !== snapshot.upstreamRef)
      throw new HarnessError("REVISION_CHANGED", "History changed. Refresh history to continue.");
  }
}

interface RawCommit {
  oid: string;
  parents: string[];
  subject: string;
  author: string;
  authoredAt: string;
}
const pushState = (snapshot: HistorySnapshot, oid: string): GitHistoryPushState =>
  snapshot.unpushed === null ? "unknown" : snapshot.unpushed.has(oid) ? "unpushed" : "notMarked";

/** Read the next page of pinned log rows and append it to the snapshot. */
export async function readGitHistoryPage(
  context: LocalReviewContext,
  snapshot: HistorySnapshot,
): Promise<GitHistoryPage> {
  if (!snapshot.headOid || snapshot.offset >= GIT_HISTORY_LIMITS.snapshotRows) {
    return {
      snapshotId: snapshot.id,
      branch: snapshot.branch,
      headOid: snapshot.headOid || null,
      upstreamRef: snapshot.upstreamRef,
      commits: [],
      nextCursor: null,
    };
  }
  const limit = Math.min(GIT_HISTORY_LIMITS.page + 1, GIT_HISTORY_LIMITS.snapshotRows - snapshot.offset + 1);
  const base = [
    "log",
    "--topo-order",
    "--max-count=" + limit,
    "--skip=" + snapshot.offset,
    "-z",
    "--end-of-options",
    snapshot.headOid,
  ];
  const raw = await context.git([...base.slice(0, 5), "--format=%H%x00%P%x00%s%x00%an%x00%aI", ...base.slice(5)]);
  // Both record and field separators are NUL/newline; %P is legitimately
  // empty for a root commit, so keep empty interior fields.
  const fields = raw.split(/[\0\n]/);
  if (fields.at(-1) === "") fields.pop();
  if (fields.length % 5 !== 0) throw new HarnessError("GIT_ERROR", "Git operation did not complete.");
  const commits: RawCommit[] = [];
  for (let index = 0; index + 5 <= fields.length && commits.length < limit; index += 5) {
    const oid = fields[index]!;
    if (!oidRe.test(oid)) throw new HarnessError("GIT_ERROR", "Git operation did not complete.");
    commits.push({
      oid,
      parents: fields[index + 1]!.split(" ").filter(oidRe.test.bind(oidRe)),
      subject: text(fields[index + 2]!, 512),
      author: text(fields[index + 3]!, 256),
      authoredAt: fields[index + 4]!.slice(0, 64),
    });
  }
  const page = commits.slice(0, GIT_HISTORY_LIMITS.page);
  const exhausted = commits.length <= GIT_HISTORY_LIMITS.page || snapshot.offset + page.length >= GIT_HISTORY_LIMITS.snapshotRows;

  // Batched changed-file counts for the served page; merge and oversized rows get a
  // bounded first-parent diff-tree fallback.
  const counts = new Map<string, number>();
  const merges: string[] = [];
  const stats = await context.git([
    ...base.slice(0, 5),
    "--numstat",
    "-M",
    "--format=%H%x00",
    ...base.slice(5),
  ]);
  const tokens = stats.split(/[\0\n]/).filter((token) => token !== "");
  const expected = page.map((commit) => commit.oid);
  let nextIndex = 0, current: string | null = null;
  for (const token of tokens) {
    if (nextIndex < expected.length && token === expected[nextIndex]) {
      current = token;
      counts.set(token, 0);
      nextIndex++;
      continue;
    }
    if (current && /^(?:\d+\t\d+\t|-\t-\t)/.test(token)) counts.set(current, (counts.get(current) ?? 0) + 1);
  }
  for (const commit of page) {
    if (!counts.has(commit.oid)) counts.set(commit.oid, 0);
    if (commit.parents.length > 1) merges.push(commit.oid);
  }
  for (const merge of merges) {
    const rows = await context.git([
      "diff-tree",
      "-m",
      "--first-parent",
      "--no-commit-id",
      "-r",
      "--numstat",
      "-z",
      "--end-of-options",
      merge,
      "--",
    ]);
    counts.set(merge, rows.split("\0").filter((token) => /^(?:\d+\t\d+\t|-\t-\t)/.test(token)).length);
  }

  const commitsOut: GitHistoryCommitRow[] = page.map((commit) => {
    snapshot.served.add(commit.oid);
    return {
      oid: commit.oid,
      subject: commit.subject,
      author: commit.author,
      authoredAt: commit.authoredAt,
      filesChanged: counts.get(commit.oid) ?? 0,
      pushState: pushState(snapshot, commit.oid),
    };
  });
  snapshot.offset += page.length;
  snapshot.exhausted = exhausted;
  return {
    snapshotId: snapshot.id,
    branch: snapshot.branch,
    headOid: snapshot.headOid,
    upstreamRef: snapshot.upstreamRef,
    commits: commitsOut,
    nextCursor: exhausted ? null : snapshot.id,
  };
}

const nameStatus = (raw: string, limit: number) => {
  const tokens = raw.split("\0").filter((token) => token !== "");
  const files: ComparisonFile[] = [];
  for (let index = 0; index < tokens.length; ) {
    const status = tokens[index++]!;
    if (!/^[ACDMRTUXB]\d*$/.test(status)) throw new HarnessError("GIT_ERROR", "Git operation did not complete.");
    const renamed = /^[RC]/.test(status);
    const path = renamed ? tokens[index + 1] : tokens[index];
    if (path === undefined) throw new HarnessError("GIT_ERROR", "Git operation did not complete.");
    files.push({
      path,
      ...(renamed ? { oldPath: tokens[index] } : {}),
      status: status[0]!,
      untracked: false,
      additions: null,
      deletions: null,
    });
    index += renamed ? 2 : 1;
    if (files.length > limit) return { files: files.slice(0, limit), truncated: true };
  }
  return { files, truncated: false };
};
/** Pair -z numstat records with the name-status listing. A plain record carries
 * its path in the header token; a rename record ends the header at the NUL and
 * then carries the old and new paths in the next two tokens. */
const applyNumstat = (raw: string, files: ComparisonFile[]) => {
  const tokens = raw.split(/[\0\n]/).filter((token) => token !== "");
  let index = 0;
  for (const file of files) {
    const header = tokens[index++];
    const match = header === undefined ? null : /^(\d+|-)\t(\d+|-)\t(.*)$/.exec(header);
    if (!match) return;
    if (match[3] === "") index += 2; // rename: old and new paths follow the header
    file.additions = match[1] === "-" ? null : Number(match[1]);
    file.deletions = match[2] === "-" ? null : Number(match[2]);
  }
};

/** Read the committed first-parent (or root) comparison for one served commit. */
export async function readGitCommitComparison(
  context: LocalReviewContext,
  snapshot: HistorySnapshot,
  oid: string,
): Promise<GitCommitComparison> {
  if (!snapshot.served.has(oid))
    throw new HarnessError("CAPABILITY_DENIED", "The selected commit was not served by this history snapshot.");
  const parentsLine = (
    await context.git(["rev-list", "--parents", "--max-count=1", "--end-of-options", oid, "--"])
  ).trim();
  const parents = parentsLine.split(" ").filter((token) => oidRe.test(token));
  const parentOid = parents.length > 1 ? parents[1]! : null;
  const basis: GitCommitComparison["basis"] = parentOid ? "first-parent" : "root";
  const listArgs = (flag: string) =>
    parentOid
      ? ["diff", "--no-color", flag, "-z", "-M", "--end-of-options", parentOid, oid, "--"]
      : ["diff-tree", "--root", "--no-commit-id", "-r", "--no-color", flag, "-z", "-M", "--end-of-options", oid, "--"];
  const status = nameStatus(await context.git(listArgs("--name-status")), CODE_REVIEW_LIMITS.files);
  applyNumstat(await context.git(listArgs("--numstat")), status.files);
  const comparisonId = createHash("sha256")
    .update(JSON.stringify([snapshot.id, oid, parentOid, status.files.map((file) => [file.path, file.status])]))
    .digest("hex");
  const comparison: GitCommitComparison = {
    comparisonId,
    oid,
    parentOid,
    basis,
    files: status.files,
    filesTruncated: status.truncated,
  };
  snapshot.comparisons.set(comparisonId, comparison);
  return comparison;
}

const commitPatch = (
  identity: GitCommitIdentity,
  file: ComparisonFile,
  state: ComparisonPatch["state"],
  value: string | null = null,
  reason?: ComparisonPatch["reason"],
): GitCommitPatch => ({ identity, file, state, text: value, ...(reason ? { reason } : {}) });

/** Read one file's committed patch inside a served committed comparison. */
export async function readGitCommitFile(
  context: LocalReviewContext,
  snapshot: HistorySnapshot,
  comparisonId: string,
  name: string,
): Promise<GitCommitPatch> {
  const comparison = snapshot.comparisons.get(comparisonId);
  if (!comparison) throw new HarnessError("COMPARISON_EXPIRED", "Refresh history before reading this file.");
  const identity: GitCommitIdentity = {
    kind: "commit",
    id: comparison.comparisonId,
    oid: comparison.oid,
    parentOid: comparison.parentOid,
    basis: comparison.basis,
    snapshotId: snapshot.id,
  };
  const file = comparison.files.find((file) => file.path === name);
  if (!file) throw new HarnessError("NOT_FOUND", "The selected file is not in this commit.");
  if (!localPath(name) || (file.oldPath && !localPath(file.oldPath)))
    return commitPatch(identity, file, "unavailable", null, "unsupported-path");
  const paths = [name, ...(file.oldPath ? [file.oldPath] : [])].map(lit);
  const args = comparison.parentOid
    ? [
        "diff",
        "--full-index",
        "--no-color",
        "--no-ext-diff",
        "--no-textconv",
        "--find-renames",
        comparison.parentOid,
        comparison.oid,
        "--",
        ...paths,
      ]
    : [
        "diff-tree",
        "--root",
        "--no-commit-id",
        "-p",
        "--full-index",
        "--no-color",
        "--no-ext-diff",
        "--no-textconv",
        "--find-renames",
        comparison.oid,
        "--",
        ...paths,
      ];
  try {
    const output = await context.git(args);
    const stats = await context.git(
      comparison.parentOid
        ? ["diff", "--numstat", "-z", "--find-renames", comparison.parentOid, comparison.oid, "--", ...paths]
        : ["diff-tree", "--root", "--no-commit-id", "-r", "--numstat", "-z", comparison.oid, "--", ...paths],
    );
    if (stats.startsWith("-\t-\t")) return commitPatch(identity, file, "binary");
    if (Buffer.byteLength(output) > CODE_REVIEW_LIMITS.patchBytes)
      return commitPatch(identity, file, "truncated", null, "resource-limit");
    return commitPatch(identity, file, output ? "text" : "empty", output);
  } catch (error) {
    if (error instanceof HarnessError && error.code === "RESOURCE_LIMIT")
      return commitPatch(identity, file, "truncated", null, "resource-limit");
    throw error;
  }
}
