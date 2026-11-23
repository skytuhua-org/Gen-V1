import { HarnessError } from "../contracts/index.ts";
import {
  CODE_REVIEW_LIMITS,
  GIT_HISTORY_LIMITS,
  type ComparisonFile,
  type GitHistoryCommit,
  type GitHistoryCommitDetail,
  type GitHistoryPage,
  type GitHistoryPatch,
} from "../contracts/code-review.ts";
import { localPath, reviewHash } from "./code-review.ts";

type Git = (args: string[]) => Promise<string>;
export interface HistoryContext {
  git: Git;
  signal: AbortSignal;
  owner: string;
}
interface HistoryComparison {
  oid: string;
  parentOid: string | null;
  files: ComparisonFile[];
}
interface HistoryEntry {
  owner: string;
  id: string;
  headOid: string;
  branch: string | null;
  upstreamRef: string | null;
  upstreamOid: string | null;
  /** Null when push status could not be decided honestly. */
  unpushed: Set<string> | null;
  served: Set<string>;
  comparisons: Map<string, HistoryComparison>;
  touched: number;
}
const oidPattern = /^[0-9a-f]{40}$/;

/** Bounded, owner-scoped history snapshots. Eviction requires an explicit refresh. */
export class GitHistorySnapshots {
  private readonly entries = new Map<string, HistoryEntry>();
  save(entry: Omit<HistoryEntry, "touched">) {
    this.entries.set(entry.id, { ...entry, touched: Date.now() });
    const owned = [...this.entries.values()].filter((item) => item.owner === entry.owner);
    while (owned.length > GIT_HISTORY_LIMITS.snapshotsPerOwner) {
      const oldest = owned.shift();
      if (oldest) this.entries.delete(oldest.id);
    }
    while (this.entries.size > GIT_HISTORY_LIMITS.snapshotsGlobal) {
      const oldest = this.entries.keys().next().value;
      if (oldest) this.entries.delete(oldest);
    }
    return this.entries.get(entry.id)!;
  }
  get(owner: string, id: string): HistoryEntry {
    const entry = this.entries.get(id);
    if (!entry || entry.owner !== owner || Date.now() - entry.touched > GIT_HISTORY_LIMITS.idleMs) {
      if (entry) this.entries.delete(id);
      throw new HarnessError("HISTORY_EXPIRED", "Refresh history before continuing.");
    }
    entry.touched = Date.now();
    return entry;
  }
  comparison(owner: string, comparisonId: string) {
    for (const entry of this.entries.values()) {
      const comparison = entry.comparisons.get(comparisonId);
      if (comparison && entry.owner === owner) return { entry, comparison };
    }
    throw new HarnessError("HISTORY_EXPIRED", "Refresh history before reading this file.");
  }
}

const run = (context: HistoryContext, args: string[]) => context.git(args);
const parseOid = (value: string) => (oidPattern.test(value) ? value : null);

async function headState(context: HistoryContext): Promise<{ headOid: string | null; branch: string | null }> {
  let headOid: string | null = null;
  try {
    headOid = parseOid(
      await run(context, ["rev-parse", "--verify", "--end-of-options", "HEAD"]).then((value) => value.trim()),
    );
  } catch (error) {
    // An unborn branch is an empty history, not an enumeration failure. Any
    // other refusal (corrupt or missing metadata) stays a typed error.
    const ref = await run(context, ["symbolic-ref", "--quiet", "--end-of-options", "HEAD"])
      .then((value) => value.trim())
      .catch(() => null);
    if (!ref) throw error;
    return { headOid: null, branch: ref.replace(/^refs\/heads\//, "") || null };
  }
  if (!headOid) throw new HarnessError("UNSUPPORTED", "History requires a committed HEAD.");
  const branch = (await run(context, ["branch", "--show-current"])).trim() || null;
  return { headOid, branch };
}
async function upstreamState(
  context: HistoryContext,
  branch: string | null,
): Promise<{ upstreamRef: string | null; upstreamOid: string | null }> {
  let upstreamRef: string | null = null;
  if (branch) {
    try {
      const configured = (
        await run(context, ["rev-parse", "--abbrev-ref", "--verify", "--end-of-options", `${branch}@{upstream}`])
      ).trim();
      upstreamRef = configured || null;
    } catch {
      upstreamRef = null;
    }
    // Tracking configuration is stripped from imported views, so only an
    // existing same-name remote-tracking branch can mark commits honestly.
    if (!upstreamRef) {
      try {
        await run(context, ["rev-parse", "--verify", "--end-of-options", `refs/remotes/origin/${branch}`]);
        upstreamRef = `origin/${branch}`;
      } catch {
        upstreamRef = null;
      }
    }
  }
  let upstreamOid: string | null = null;
  if (upstreamRef) {
    try {
      upstreamOid = parseOid(
        (await run(context, ["rev-parse", "--verify", "--end-of-options", upstreamRef])).trim(),
      );
      if (!upstreamOid) upstreamRef = null;
    } catch {
      upstreamRef = null;
    }
  }
  return { upstreamRef, upstreamOid };
}
async function unpushedSet(context: HistoryContext, headOid: string, upstreamOid: string): Promise<Set<string> | null> {
  try {
    const raw = await run(context, [
      "rev-list",
      `--max-count=${GIT_HISTORY_LIMITS.unpushedDepth}`,
      "--end-of-options",
      `${headOid}`,
      `^${upstreamOid}`,
      "--",
    ]);
    const oids = raw.split("\n").filter(Boolean);
    if (oids.length >= GIT_HISTORY_LIMITS.unpushedDepth) return null;
    return new Set(oids.filter((value) => oidPattern.test(value)));
  } catch {
    return null;
  }
}
async function fileCount(context: HistoryContext, oid: string, parentOid: string | null): Promise<number | null> {
  const args = parentOid
    ? ["diff-tree", "-r", "-z", "--numstat", "--no-commit-id", "--end-of-options", parentOid, oid, "--"]
    : ["diff-tree", "-r", "-z", "--numstat", "--root", "--no-commit-id", "--end-of-options", oid, "--"];
  try {
    const raw = await run(context, args);
    return raw.split("\0").filter((row) => row.length > 0).length;
  } catch {
    return null;
  }
}
const cursorPattern = /^([a-f0-9]{64}):(\d{1,7})$/;
export async function readHistoryPage(
  context: HistoryContext,
  snapshots: GitHistorySnapshots,
  cursor?: string,
): Promise<GitHistoryPage> {
  const page = GIT_HISTORY_LIMITS.page;
  let entry: HistoryEntry;
  let offset = 0;
  const state = await headState(context);
  if (!cursor) {
    if (!state.headOid)
      return {
        snapshotId: null,
        branch: state.branch,
        headOid: null,
        upstreamRef: null,
        commits: [],
        nextCursor: null,
      };
    const { upstreamRef, upstreamOid } = await upstreamState(context, state.branch);
    const unpushed = upstreamOid ? await unpushedSet(context, state.headOid, upstreamOid) : null;
    entry = snapshots.save({
      owner: context.owner,
      id: reviewHash([context.owner, "history", state.headOid, state.branch, upstreamRef, upstreamOid, Date.now()]),
      headOid: state.headOid,
      branch: state.branch,
      upstreamRef,
      upstreamOid,
      unpushed,
      served: new Set(),
      comparisons: new Map(),
    });
  } else {
    const parsed = cursorPattern.exec(cursor);
    if (!parsed) throw new HarnessError("INVALID_INPUT", "The history cursor is unavailable.");
    entry = snapshots.get(context.owner, parsed[1]);
    offset = Number(parsed[2]);
    const current = await headState(context).catch(() => null);
    if (!current || current.headOid !== entry.headOid || current.branch !== entry.branch)
      throw new HarnessError("HISTORY_CHANGED", "History changed. Refresh history to continue.");
    const { upstreamRef, upstreamOid } = await upstreamState(context, current.branch);
    if (upstreamRef !== entry.upstreamRef || upstreamOid !== entry.upstreamOid)
      throw new HarnessError("HISTORY_CHANGED", "History changed. Refresh history to continue.");
  }
  const raw = await run(context, [
    "log",
    "--topo-order",
    `--max-count=${page + 1}`,
    `--skip=${offset}`,
    "-z",
    "--format=%H%x1f%P%x1f%an%x1f%aI%x1f%s%x1f",
    "--end-of-options",
    entry.headOid,
    "--",
  ]);
  const rows = raw
    .split("\0")
    .filter((record) => record.length > 0)
    .map((record) => record.split("\x1f"));
  const hasMore = rows.length > page;
  const visible = rows.slice(0, page);
  const commits: GitHistoryCommit[] = [];
  for (const [oid, parents, author, authoredAt, subject] of visible) {
    if (!oid || !parseOid(oid)) throw new HarnessError("UNSUPPORTED", "History enumeration returned malformed data.");
    const parentOid = parseOid((parents ?? "").split(" ").filter(Boolean)[0] ?? "");
    commits.push({
      oid,
      subject: (subject ?? "").slice(0, 1024),
      author: (author ?? "").slice(0, 512),
      authoredAt: /^\d{4}-\d{2}-\d{2}T/.test(authoredAt ?? "") ? authoredAt! : "",
      filesChanged: await fileCount(context, oid, parentOid),
      pushState: entry.unpushed === null ? "unknown" : entry.unpushed.has(oid) ? "unpushed" : "notMarked",
    });
    entry.served.add(oid);
    if (entry.served.size > GIT_HISTORY_LIMITS.rowsPerSnapshot) break;
  }
  const nextCursor =
    hasMore && entry.served.size < GIT_HISTORY_LIMITS.rowsPerSnapshot
      ? `${entry.id}:${offset + commits.length}`
      : null;
  return {
    snapshotId: entry.id,
    branch: entry.branch,
    headOid: entry.headOid,
    upstreamRef: entry.upstreamRef,
    commits,
    nextCursor,
  };
}

const statuses = new Set(["A", "C", "D", "M", "R", "T", "U", "X"]);
function nameStatus(raw: string): { path: string; oldPath?: string; status: string }[] {
  const entries = raw.split("\0"),
    files: { path: string; oldPath?: string; status: string }[] = [];
  for (let i = 0; i < entries.length; i++) {
    const status = entries[i];
    if (!status) continue;
    const letter = status[0];
    if (!statuses.has(letter)) throw new HarnessError("UNSUPPORTED", "History returned an unsupported entry.");
    if (letter === "R" || letter === "C") {
      const oldPath = entries[++i],
        path = entries[++i];
      if (oldPath === undefined || path === undefined || !oldPath || !path)
        throw new HarnessError("UNSUPPORTED", "History returned an unsupported entry.");
      files.push({ path, oldPath, status });
    } else {
      const path = entries[++i];
      if (path === undefined || !path) throw new HarnessError("UNSUPPORTED", "History returned an unsupported entry.");
      files.push({ path, status });
    }
  }
  return files;
}
function numstat(raw: string): Map<string, { additions: number | null; deletions: number | null }> {
  const entries = raw.split("\0"),
    stats = new Map<string, { additions: number | null; deletions: number | null }>();
  for (let i = 0; i < entries.length; i++) {
    const row = entries[i];
    if (!row) continue;
    const [added, removed, path] = row.split("\t");
    const binary = added === "-" && removed === "-";
    if (path === "") {
      const oldPath = entries[++i],
        renamed = entries[++i];
      if (renamed !== undefined) stats.set(renamed, { additions: binary ? null : Number(added), deletions: binary ? null : Number(removed) });
      if (oldPath === undefined || renamed === undefined) break;
    } else if (path !== undefined) {
      stats.set(path, { additions: binary ? null : Number(added), deletions: binary ? null : Number(removed) });
    }
  }
  return stats;
}
async function assertPinned(context: HistoryContext, entry: HistoryEntry) {
  const current = await headState(context).catch(() => null);
  if (!current || current.headOid !== entry.headOid || current.branch !== entry.branch)
    throw new HarnessError("HISTORY_CHANGED", "History changed. Refresh history to continue.");
}
async function parentsOf(context: HistoryContext, oid: string): Promise<string[]> {
  const raw = await run(context, ["rev-list", "--parents", "--max-count=1", "--end-of-options", oid, "--"]);
  const parts = raw.trim().split(" ").filter(Boolean);
  if (parts[0] !== oid) throw new HarnessError("NOT_FOUND", "The selected commit is not in this history.");
  return parts.slice(1).filter((value) => oidPattern.test(value));
}
function diffArgs(parentOid: string | null, oid: string, kind: "--name-status" | "--numstat" | "-p") {
  return parentOid
    ? ["diff", "-r", "-z", "--no-color", "--no-ext-diff", "--no-textconv", "-M", kind, "--end-of-options", parentOid, oid, "--"]
    : [
        "diff-tree", "-r", "-z", "--no-color", "--no-ext-diff", "--no-textconv", "-M", kind, "--root",
        "--no-commit-id", "--end-of-options", oid, "--",
      ];
}
export async function readHistoryCommit(
  context: HistoryContext,
  snapshots: GitHistorySnapshots,
  snapshotId: string,
  oid: string,
): Promise<GitHistoryCommitDetail> {
  const entry = snapshots.get(context.owner, snapshotId);
  if (!entry.served.has(oid)) throw new HarnessError("NOT_FOUND", "The selected commit is not in this history.");
  await assertPinned(context, entry);
  const [firstParent] = await parentsOf(context, oid);
  const parentOid = firstParent ?? null;
  const [names, stats] = await Promise.all([
    run(context, diffArgs(parentOid, oid, "--name-status")),
    run(context, diffArgs(parentOid, oid, "--numstat")),
  ]);
  const listed = nameStatus(names),
    counted = numstat(stats),
    truncated = listed.length > CODE_REVIEW_LIMITS.files;
  const files: ComparisonFile[] = listed.slice(0, CODE_REVIEW_LIMITS.files).map((row) => {
    const stat = counted.get(row.path);
    const file: ComparisonFile = {
      path: row.path,
      ...(row.oldPath ? { oldPath: row.oldPath } : {}),
      status: row.status,
      untracked: false,
      additions: stat?.additions ?? null,
      deletions: stat?.deletions ?? null,
    };
    if (!localPath(row.path) || (row.oldPath && !localPath(row.oldPath))) file.patchUnavailable = "unsupported-path";
    return file;
  });
  const comparisonId = reviewHash([context.owner, snapshotId, oid, parentOid, files]);
  entry.comparisons.set(comparisonId, { oid, parentOid, files });
  return {
    comparisonId,
    oid,
    parentOid,
    basis: parentOid ? "first-parent" : "root",
    files,
    filesTruncated: truncated,
  };
}
const patch = (
  comparisonId: string,
  file: ComparisonFile,
  state: GitHistoryPatch["state"],
  text: string | null = null,
  reason?: GitHistoryPatch["reason"],
): GitHistoryPatch => ({ comparisonId, file, state, text, ...(reason ? { reason } : {}) });
// Keep only the file sections matching the served paths: a literal pathspec still
// matches descendants when a file was replaced by a same-named directory.
function filterPatch(text: string, wanted: Set<string>): string {
  return text
    .split(/(?=^diff --git )/m)
    .filter((section) => {
      const lines = section.split("\n").slice(0, 20);
      const from = lines.find((line) => line.startsWith("--- "))?.slice(4).replace(/^a\//, "");
      const to = lines.find((line) => line.startsWith("+++ "))?.slice(4).replace(/^b\//, "");
      if (from === undefined && to === undefined) {
        const head = lines[0] ?? "";
        for (const a of wanted) for (const b of wanted) if (head === `diff --git a/${a} b/${b}`) return true;
        return false;
      }
      return (from === undefined || from === "/dev/null" || wanted.has(from)) && (to === undefined || to === "/dev/null" || wanted.has(to));
    })
    .join("");
}
export async function readHistoryFile(
  context: HistoryContext,
  snapshots: GitHistorySnapshots,
  comparisonId: string,
  name: string,
): Promise<GitHistoryPatch> {
  const { entry, comparison } = snapshots.comparison(context.owner, comparisonId);
  await assertPinned(context, entry);
  const file = comparison.files.find((item) => item.path === name);
  if (!file) throw new HarnessError("NOT_FOUND", "The selected file is not in this comparison.");
  if (!localPath(name) || (file.oldPath && !localPath(file.oldPath)))
    return patch(comparisonId, file, "unavailable", null, "unsupported-path");
  if (file.patchUnavailable) return patch(comparisonId, file, "unavailable", null, file.patchUnavailable);
  if (file.status.includes("U")) return patch(comparisonId, file, "unavailable", null, "conflict");
  const paths = [name, ...(file.oldPath ? [file.oldPath] : [])].map((value) => ":(literal)" + value);
  const args = [...diffArgs(comparison.parentOid, comparison.oid, "-p"), ...paths];
  const statArgs = [...diffArgs(comparison.parentOid, comparison.oid, "--numstat"), ...paths];
  try {
    const [raw, stats] = await Promise.all([run(context, args), run(context, statArgs)]);
    const stat = numstat(stats).get(name) ?? (file.oldPath ? numstat(stats).get(file.oldPath) : undefined);
    if (stat && stat.additions === null) return patch(comparisonId, file, "binary");
    const text = filterPatch(raw, new Set([name, ...(file.oldPath ? [file.oldPath] : [])]));
    if (Buffer.byteLength(text) > CODE_REVIEW_LIMITS.patchBytes)
      return patch(comparisonId, file, "truncated", null, "resource-limit");
    return patch(comparisonId, file, text ? "text" : "empty", text);
  } catch (error) {
    if (error instanceof HarnessError && error.code === "RESOURCE_LIMIT")
      return patch(comparisonId, file, "truncated", null, "resource-limit");
    if (error instanceof HarnessError && error.code === "GIT_ERROR")
      return patch(comparisonId, file, "unavailable", null, "patch-omitted");
    throw error;
  }
}
