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
    this.touch({ ...entry, touched: 0 });
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
  private touch(entry: HistoryEntry) {
    entry.touched = Date.now();
    // Map iteration order is least to most recently used.
    this.entries.delete(entry.id);
    this.entries.set(entry.id, entry);
  }
  private active(entry: HistoryEntry, owner: string): boolean {
    if (entry.owner !== owner) return false;
    if (Date.now() - entry.touched <= GIT_HISTORY_LIMITS.idleMs) return true;
    this.entries.delete(entry.id);
    return false;
  }
  get(owner: string, id: string): HistoryEntry {
    const entry = this.entries.get(id);
    if (!entry || !this.active(entry, owner))
      throw new HarnessError("HISTORY_EXPIRED", "Refresh history before continuing.");
    this.touch(entry);
    return entry;
  }
  comparison(owner: string, comparisonId: string) {
    for (const entry of this.entries.values()) {
      if (!this.active(entry, owner)) continue;
      const comparison = entry.comparisons.get(comparisonId);
      if (!comparison) continue;
      this.touch(entry);
      return { entry, comparison };
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
    ? ["diff-tree", "-r", "-z", "--numstat", "-M", "--no-commit-id", "--end-of-options", parentOid, oid, "--"]
    : ["diff-tree", "-r", "-z", "--numstat", "-M", "--root", "--no-commit-id", "--end-of-options", oid, "--"];
  try {
    const raw = await run(context, args);
    return numstat(raw).size;
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
  if (!cursor) {
    const state = await headState(context);
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
    await assertPinned(context, entry);
  }
  const raw = await run(context, [
    "log",
    "--topo-order",
    `--max-count=${page + 1}`,
    `--skip=${offset}`,
    "-z",
    "--format=tformat:%H%x00%P%x00%an%x00%aI%x00%s",
    "--end-of-options",
    entry.headOid,
    "--",
  ]);
  // -z terminates each tformat record with NUL. Git author and subject
  // fields may contain other control bytes; keep empty fields (e.g. root parents).
  const fields = raw.split("\0");
  if (fields.pop() !== "" || fields.length % 5 !== 0)
    throw new HarnessError("UNSUPPORTED", "History enumeration returned malformed data.");
  const hasMore = fields.length > page * 5;
  const commits: GitHistoryCommit[] = [];
  for (let i = 0; i < Math.min(fields.length, page * 5); i += 5) {
    const [oid, parents, author, authoredAt, subject] = fields.slice(i, i + 5);
    if (!oid || !parseOid(oid)) throw new HarnessError("UNSUPPORTED", "History enumeration returned malformed data.");
    let parentOid = parseOid((parents ?? "").split(" ").filter(Boolean)[0] ?? "");
    // %P hides a shallow graft's parent; only a genuine root counts as root.
    let grafted = false;
    if (!parentOid) {
      const detail = await parentsOf(context, oid);
      parentOid = detail.first;
      grafted = detail.missing;
    }
    commits.push({
      oid,
      subject: (subject ?? "").slice(0, 1024),
      author: (author ?? "").slice(0, 512),
      authoredAt: /^\d{4}-\d{2}-\d{2}T/.test(authoredAt ?? "") ? authoredAt! : "",
      filesChanged: grafted ? null : await fileCount(context, oid, parentOid),
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
    const first = row.indexOf("\t"), second = row.indexOf("\t", first + 1);
    if (first === -1) continue;
    const added = row.slice(0, first),
      removed = second === -1 ? row.slice(first + 1) : row.slice(first + 1, second),
      path = second === -1 ? "" : row.slice(second + 1);
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
  const { upstreamRef, upstreamOid } = await upstreamState(context, current.branch);
  if (upstreamRef !== entry.upstreamRef || upstreamOid !== entry.upstreamOid)
    throw new HarnessError("HISTORY_CHANGED", "History changed. Refresh history to continue.");
}
// The raw commit object keeps the parent a shallow graft hides from rev-list.
async function parentsOf(context: HistoryContext, oid: string): Promise<{ first: string | null; missing: boolean }> {
  const raw = await run(context, ["cat-file", "-p", oid]);
  const first = [...raw.split("\n\n", 1)[0].matchAll(/^parent ([0-9a-f]{40})$/gm)][0]?.[1] ?? null;
  if (!first || !oidPattern.test(first)) return { first: null, missing: false };
  const type = await run(context, ["cat-file", "-t", first])
    .then((value) => value.trim())
    .catch(() => null);
  return { first, missing: type !== "commit" };
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
  const { first, missing } = await parentsOf(context, oid);
  if (missing)
    throw new HarnessError("HISTORY_GRAFTED", "This commit's parent is outside the local clone; its diff is unavailable.");
  const parentOid = first;
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
function gitUnquote(value: string): string {
  if (!value.startsWith('"') || !value.endsWith('"')) return value;
  const body = value.slice(1, -1),
    bytes: number[] = [],
    escapes: Record<string, number> = { a: 7, b: 8, f: 12, n: 10, r: 13, t: 9, v: 11, '"': 34, "\\": 92 };
  for (let i = 0; i < body.length; i++) {
    if (body[i] !== "\\") {
      bytes.push(body.charCodeAt(i));
      continue;
    }
    const next = body[++i];
    if (next >= "0" && next <= "7") {
      bytes.push(parseInt(body.slice(i, i + 3), 8));
      i += 2;
    } else bytes.push(escapes[next] ?? next.charCodeAt(0));
  }
  return Buffer.from(bytes).toString("utf8");
}
// `diff --git` headers quote each `a/…`/`b/…` side independently when it needs it.
function gitCQuote(value: string): string {
  return (
    '"' +
    Array.from(Buffer.from(value, "utf8"), (byte) =>
      byte === 34 ? '\\"' : byte === 92 ? "\\\\" : byte < 32 || byte > 126 ? "\\" + byte.toString(8).padStart(3, "0") : String.fromCharCode(byte),
    ).join("") +
    '"'
  );
}
// `--- `/`+++ ` lines carry the path raw, a trailing TAB when it contains spaces,
// or C-style quoting under core.quotepath.
function headerPath(line: string | undefined): string | undefined {
  if (line === undefined) return undefined;
  let value = line.slice(4);
  if (value.endsWith("\t")) value = value.slice(0, -1);
  value = gitUnquote(value);
  return value.startsWith("/") ? value : value.replace(/^[ab]\//, "");
}
function filterPatch(text: string, wanted: Set<string>): string {
  return text
    .split(/(?=^diff --git )/m)
    .filter((section) => {
      const lines = section.split("\n").slice(0, 20);
      const from = headerPath(lines.find((line) => line.startsWith("--- ")));
      const to = headerPath(lines.find((line) => line.startsWith("+++ ")));
      if (from === undefined && to === undefined) {
        const head = lines[0] ?? "";
        for (const a of wanted)
          for (const b of wanted) {
            const left = `a/${a}`,
              right = `b/${b}`;
            if (
              head === `diff --git ${left} ${right}` ||
              head === `diff --git ${gitCQuote(left)} ${gitCQuote(right)}` ||
              head === `diff --git ${gitCQuote(left)} ${right}` ||
              head === `diff --git ${left} ${gitCQuote(right)}`
            )
              return true;
          }
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
