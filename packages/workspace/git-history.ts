import { randomUUID } from "node:crypto";
import {
	CODE_REVIEW_LIMITS,
	type CommitComparisonIdentity,
	type ComparisonFile,
	GIT_HISTORY_LIMITS,
	type GitHistoryCommitRead,
	type GitHistoryFilePatch,
	type GitHistoryPage,
	type GitHistoryRow,
	gitHistoryCursorSchema,
} from "../contracts/code-review.ts";
import { HarnessError } from "../contracts/index.ts";
import { reviewHash } from "./code-review.ts";

type Git = (args: string[]) => Promise<string>;
export interface GitHistoryContext {
	git: Git;
	owner: string;
	signal: AbortSignal;
}

const clean = (value: string, max = 512) => {
	let out = "";
	for (const char of value) {
		const code = char.codePointAt(0) ?? 0;
		if (code > 0x1f && code !== 0x7f) out += char;
	}
	return out.slice(0, max);
};
const gitPath = (value: string) =>
	value.length <= 1024 &&
	!/[\\:\0]/.test(value) &&
	!value.startsWith("/") &&
	!value
		.split("/")
		.some(
			(part) =>
				!part || part === "." || part === ".." || part.toLowerCase() === ".git",
		);
const stale = () =>
	new HarnessError(
		"HISTORY_STALE",
		"History changed. Refresh history to continue.",
	);

interface ServedDetail {
	comparisonId: string;
	oid: string;
	parentOid: string | null;
	basis: "first-parent" | "root";
	files: Map<string, { file: ComparisonFile; binary: boolean }>;
}
interface HistorySnapshot {
	owner: string;
	snapshotId: string;
	headOid: string;
	branch: string | null;
	upstreamRef: string | null;
	upstreamOid: string | null;
	/** Full bounded membership walk; null when the basis or the walk is unavailable. */
	unpushed: Set<string> | null;
	served: Set<string>;
	details: Map<string, ServedDetail>;
	touched: number;
}

interface ResolvedTip {
	headOid: string | null;
	branch: string | null;
	upstreamRef: string | null;
	upstreamOid: string | null;
}

/** Read HEAD, branch and the exact same-branch remote-tracking ref under the fixed Git boundary. */
async function resolveTip(context: GitHistoryContext): Promise<ResolvedTip> {
	const git = context.git;
	let headOid: string | null = null;
	try {
		const head = (await git(["rev-parse", "--verify", "HEAD"])).trim();
		if (/^[0-9a-f]{40}$/.test(head)) headOid = head;
	} catch {
		headOid = null;
	}
	let branch: string | null = null;
	try {
		const name = (await git(["branch", "--show-current"])).trim();
		branch = name ? name : null;
	} catch {
		branch = null;
	}
	if (!headOid) {
		// Unborn vs corrupt/missing repository: only a symbolic branch with no tip is empty history.
		let symbolic: string | null = null;
		try {
			const name = (
				await git(["symbolic-ref", "-q", "--short", "HEAD"])
			).trim();
			symbolic = name ? name : null;
		} catch {
			symbolic = null;
		}
		return {
			headOid: null,
			branch: symbolic,
			upstreamRef: null,
			upstreamOid: null,
		};
	}
	let upstreamRef: string | null = null,
		upstreamOid: string | null = null;
	if (branch) {
		const ref = `refs/remotes/origin/${branch}`;
		try {
			const oid = (await git(["rev-parse", "--verify", "--quiet", ref])).trim();
			if (/^[0-9a-f]{40}$/.test(oid)) {
				upstreamRef = `origin/${branch}`;
				upstreamOid = oid;
			}
		} catch {
			upstreamRef = null;
		}
	}
	return { headOid, branch, upstreamRef, upstreamOid };
}

/** One bounded positive-range membership walk per snapshot. */
async function unpushedSet(
	context: GitHistoryContext,
	tip: ResolvedTip,
): Promise<Set<string> | null> {
	if (!tip.headOid || !tip.upstreamOid) return null;
	try {
		const output = await context.git([
			"rev-list",
			`--max-count=${GIT_HISTORY_LIMITS.upstreamWalk}`,
			tip.headOid,
			`^${tip.upstreamOid}`,
			"--",
		]);
		const lines = output
			.split("\n")
			.filter((line) => /^[0-9a-f]{40}$/.test(line));
		// A capped or partial walk cannot prove absence for later commits.
		if (lines.length >= GIT_HISTORY_LIMITS.upstreamWalk) return null;
		return new Set(lines);
	} catch {
		return null;
	}
}

/** Parse `diff-tree --name-status -z -M` output into status/path entries (rename counts once). */
function statusEntries(
	output: string,
): { status: string; path: string; oldPath?: string }[] {
	const tokens = output.split("\0");
	const entries: { status: string; path: string; oldPath?: string }[] = [];
	for (let i = 0; i < tokens.length; i++) {
		const status = tokens[i];
		if (!/^[ABCDMRTUX][0-9]*$/.test(status)) continue;
		if (/^[RC]/.test(status)) {
			const oldPath = tokens[++i] ?? "";
			const path = tokens[++i] ?? "";
			if (!path) continue;
			entries.push({ status, path, ...(oldPath ? { oldPath } : {}) });
		} else {
			const path = tokens[++i] ?? "";
			if (!path) continue;
			entries.push({ status, path });
		}
	}
	return entries;
}

/** Parse `diff-tree --numstat -z` output keyed by path (binary rows report "-"). */
function numstat(output: string): Map<
	string,
	{
		added: number | null;
		removed: number | null;
		binary: boolean;
		oldPath?: string;
	}
> {
	const tokens = output.split("\0");
	const map = new Map<
		string,
		{
			added: number | null;
			removed: number | null;
			binary: boolean;
			oldPath?: string;
		}
	>();
	for (let i = 0; i < tokens.length; i++) {
		const match = /^(\d+|-)\t(\d+|-)\t(.*)$/.exec(tokens[i]);
		if (!match) continue;
		const binary = match[1] === "-";
		const added = binary ? null : Number(match[1]),
			removed = binary ? null : Number(match[2]);
		if (match[3]) {
			map.set(match[3], { added, removed, binary });
			continue;
		}
		// Rename numstat emits "add\tdel\t\0old\0new\0".
		const oldPath = tokens[i + 1],
			newPath = tokens[i + 2];
		if (!oldPath || !newPath) continue;
		map.set(newPath, { added, removed, binary, oldPath });
		i += 2;
	}
	return map;
}

/** First-parent diff spec: two-tree form for children, --root single-commit form for roots. */
const diffSpec = (oid: string, parentOid: string | null) =>
	parentOid ? [parentOid, oid] : ["--root", "--no-commit-id", oid];

async function changedFiles(
	git: Git,
	oid: string,
	parentOid: string | null,
): Promise<{
	files: ComparisonFile[];
	binary: Map<string, boolean>;
	truncated: boolean;
}> {
	const spec = diffSpec(oid, parentOid);
	const [names, counts] = await Promise.all([
		git(["diff-tree", "-r", "-z", "-M", "--name-status", ...spec, "--"]),
		git(["diff-tree", "-r", "-z", "-M", "--numstat", ...spec, "--"]),
	]);
	const stats = numstat(counts);
	const entries = statusEntries(names);
	const files: ComparisonFile[] = [],
		binary = new Map<string, boolean>();
	for (const entry of entries.slice(0, CODE_REVIEW_LIMITS.files)) {
		const count = stats.get(entry.path),
			unsupported =
				!gitPath(entry.path) ||
				(entry.oldPath ? !gitPath(entry.oldPath) : false);
		binary.set(entry.path, count?.binary === true);
		files.push({
			path: entry.path,
			...(entry.oldPath ? { oldPath: entry.oldPath } : {}),
			status: entry.status,
			untracked: false,
			additions: count?.added ?? null,
			deletions: count?.removed ?? null,
			...(unsupported ? { patchUnavailable: "unsupported-path" as const } : {}),
		});
	}
	return {
		files,
		binary,
		truncated: entries.length > CODE_REVIEW_LIMITS.files,
	};
}

/** Bounded owner-scoped snapshot/detail store with LRU eviction and inactivity expiry. */
export class GitHistorySnapshots {
	private readonly entries = new Map<string, HistorySnapshot>();
	private readonly comparisons = new Map<string, string>(); // comparisonId -> snapshotId

	private evict(now: number) {
		for (const [id, entry] of [...this.entries]) {
			if (now - entry.touched > GIT_HISTORY_LIMITS.expiryMs) this.drop(id);
		}
		while (this.entries.size > GIT_HISTORY_LIMITS.snapshots) {
			const oldest = this.entries.keys().next().value;
			if (!oldest) break;
			this.drop(oldest);
		}
		const owners = new Map<string, number>();
		for (const entry of this.entries.values())
			owners.set(entry.owner, (owners.get(entry.owner) ?? 0) + 1);
		for (const [owner, count] of owners) {
			let excess = count - GIT_HISTORY_LIMITS.snapshotsPerOwner;
			for (const [id, entry] of [...this.entries]) {
				if (excess <= 0) break;
				if (entry.owner === owner) {
					this.drop(id);
					excess--;
				}
			}
		}
	}
	private drop(id: string) {
		const entry = this.entries.get(id);
		if (!entry) return;
		for (const detail of entry.details.values())
			this.comparisons.delete(detail.comparisonId);
		this.entries.delete(id);
	}

	private fresh(
		context: GitHistoryContext,
		tip: ResolvedTip,
		unpushed: Set<string> | null,
	): HistorySnapshot {
		const now = Date.now();
		this.evict(now);
		const snapshot: HistorySnapshot = {
			owner: context.owner,
			snapshotId: reviewHash([
				context.owner,
				tip.headOid,
				tip.branch,
				tip.upstreamRef,
				tip.upstreamOid,
				randomUUID(),
			]),
			headOid: tip.headOid!,
			branch: tip.branch,
			upstreamRef: tip.upstreamRef,
			upstreamOid: tip.upstreamOid,
			unpushed,
			served: new Set(),
			details: new Map(),
			touched: now,
		};
		this.entries.set(snapshot.snapshotId, snapshot);
		return snapshot;
	}

	private snapshot(
		context: GitHistoryContext,
		snapshotId: string,
	): HistorySnapshot {
		this.evict(Date.now());
		const entry = this.entries.get(snapshotId);
		if (!entry || entry.owner !== context.owner) throw stale();
		entry.touched = Date.now();
		// Refresh LRU order so an actively paged snapshot survives idle ones.
		this.entries.delete(snapshotId);
		this.entries.set(snapshotId, entry);
		return entry;
	}

	async page(
		context: GitHistoryContext,
		cursor?: string,
	): Promise<GitHistoryPage> {
		const tip = await resolveTip(context);
		if (!tip.headOid)
			return {
				snapshotId: "",
				branch: tip.branch,
				headOid: null,
				upstreamRef: null,
				commits: [],
				nextCursor: null,
			};
		let snapshot: HistorySnapshot,
			offset = 0;
		if (cursor === undefined) {
			snapshot = this.fresh(context, tip, await unpushedSet(context, tip));
		} else {
			const parsed = gitHistoryCursorSchema.parse(cursor);
			const [, snapshotId, raw] = parsed.split(".");
			snapshot = this.snapshot(context, snapshotId);
			offset = Number(raw);
			if (
				!Number.isInteger(offset) ||
				offset < 0 ||
				offset >= GIT_HISTORY_LIMITS.rows
			)
				throw new HarnessError(
					"INVALID_INPUT",
					"The history cursor is out of range.",
				);
			await this.recheck(context, snapshot);
		}
		const output = await context.git([
			"log",
			"--topo-order",
			`--max-count=${GIT_HISTORY_LIMITS.pageSize + 1}`,
			`--skip=${offset}`,
			"-z",
			"--format=%H%x00%P%x00%an%x00%aI%x00%s",
			"--end-of-options",
			snapshot.headOid,
			"--",
		]);
		const fields = output.split("\0"),
			rows: GitHistoryRow[] = [],
			firstParents = new Map<string, string | null>();
		for (
			let i = 0;
			i + 4 < fields.length && rows.length < GIT_HISTORY_LIMITS.pageSize;
			i += 5
		) {
			const oid = fields[i];
			if (!/^[0-9a-f]{40}$/.test(oid)) break;
			const authoredAt = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T/.test(fields[i + 3])
				? fields[i + 3]
				: "";
			const pushState =
				snapshot.unpushed === null
					? "unknown"
					: snapshot.unpushed.has(oid)
						? "unpushed"
						: "notMarked";
			rows.push({
				oid,
				author: clean(fields[i + 2]),
				authoredAt,
				subject: clean(fields[i + 4]),
				filesChanged: null,
				pushState,
			});
			firstParents.set(
				oid,
				fields[i + 1].split(/\s+/).filter(Boolean)[0] ?? null,
			);
		}
		const lookahead =
			fields.length >= 5 * (GIT_HISTORY_LIMITS.pageSize + 1) &&
			rows.length === GIT_HISTORY_LIMITS.pageSize;
		// Exact per-row counts stay inside the existing byte/time cap; rows that
		// cannot be counted within the budget report unknown, not a guessed count.
		for (const row of rows) {
			try {
				row.filesChanged = statusEntries(
					await context.git([
						"diff-tree",
						"-r",
						"-z",
						"-M",
						"--name-status",
						...diffSpec(row.oid, firstParents.get(row.oid) ?? null),
						"--",
					]),
				).length;
			} catch {
				row.filesChanged = null;
			}
		}
		for (const row of rows) snapshot.served.add(row.oid);
		const next =
			lookahead &&
			offset + GIT_HISTORY_LIMITS.pageSize < GIT_HISTORY_LIMITS.rows
				? `h.${snapshot.snapshotId}.${offset + GIT_HISTORY_LIMITS.pageSize}`
				: null;
		return {
			snapshotId: snapshot.snapshotId,
			branch: snapshot.branch,
			headOid: snapshot.headOid,
			upstreamRef: snapshot.upstreamRef,
			commits: rows,
			nextCursor: next,
		};
	}

	private async recheck(context: GitHistoryContext, snapshot: HistorySnapshot) {
		const tip = await resolveTip(context);
		if (
			tip.headOid !== snapshot.headOid ||
			tip.branch !== snapshot.branch ||
			tip.upstreamRef !== snapshot.upstreamRef ||
			tip.upstreamOid !== snapshot.upstreamOid
		)
			throw stale();
	}

	async commit(
		context: GitHistoryContext,
		snapshotId: string,
		oid: string,
	): Promise<GitHistoryCommitRead> {
		const snapshot = this.snapshot(context, snapshotId);
		await this.recheck(context, snapshot);
		if (!snapshot.served.has(oid))
			throw new HarnessError(
				"CAPABILITY_DENIED",
				"Choose a commit shown in this history snapshot.",
			);
		// Raw commit object records shallow/detached parents that %P hides.
		const raw = await context.git(["cat-file", "-p", oid]),
			parents = [...raw.matchAll(/^parent ([0-9a-f]{40})$/gm)].map(
				(match) => match[1],
			);
		const parentOid = parents[0] ?? null,
			basis = parents.length ? ("first-parent" as const) : ("root" as const);
		if (parentOid) {
			try {
				if (
					(await context.git(["cat-file", "-t", parentOid])).trim() !== "commit"
				)
					return { state: "unavailable", reason: "missing-parent" };
			} catch {
				return { state: "unavailable", reason: "missing-parent" };
			}
		}
		let changed: Awaited<ReturnType<typeof changedFiles>>;
		try {
			changed = await changedFiles(context.git, oid, parentOid);
		} catch (error) {
			if (error instanceof HarnessError && error.code === "RESOURCE_LIMIT")
				return { state: "unavailable", reason: "resource-limit" };
			throw error;
		}
		const comparisonId = reviewHash([context.owner, snapshotId, oid, basis]);
		while (snapshot.details.size >= GIT_HISTORY_LIMITS.detailsPerSnapshot) {
			const oldest = snapshot.details.keys().next().value;
			if (oldest === undefined) break;
			const detail = snapshot.details.get(oldest);
			if (detail) this.comparisons.delete(detail.comparisonId);
			snapshot.details.delete(oldest);
		}
		const detail: ServedDetail = {
			comparisonId,
			oid,
			parentOid,
			basis,
			files: new Map(),
		};
		for (const file of changed.files)
			detail.files.set(file.path, {
				file,
				binary: changed.binary.get(file.path) === true,
			});
		snapshot.details.set(oid, detail);
		this.comparisons.set(comparisonId, snapshotId);
		return {
			state: "ready",
			comparisonId,
			oid,
			parentOid,
			basis,
			files: changed.files,
			filesTruncated: changed.truncated,
		};
	}

	async file(
		context: GitHistoryContext,
		comparisonId: string,
		path: string,
	): Promise<GitHistoryFilePatch> {
		const snapshotId = this.comparisons.get(comparisonId);
		const snapshot = snapshotId
			? this.snapshot(context, snapshotId)
			: undefined;
		if (!snapshot) throw stale();
		await this.recheck(context, snapshot);
		const detail = [...snapshot.details.values()].find(
			(value) => value.comparisonId === comparisonId,
		);
		if (!detail) throw stale();
		const served = detail.files.get(path);
		const identity: CommitComparisonIdentity = {
			kind: "commit",
			id: comparisonId,
			snapshotId: snapshot.snapshotId,
			oid: detail.oid,
			parentOid: detail.parentOid,
			basis: detail.basis,
		};
		const make = (
			state: GitHistoryFilePatch["state"],
			text: string | null = null,
			reason?: GitHistoryFilePatch["reason"],
		): GitHistoryFilePatch => ({
			identity,
			file: served?.file ?? {
				path,
				status: "?",
				untracked: false,
				additions: null,
				deletions: null,
			},
			state,
			text,
			...(reason ? { reason } : {}),
		});
		if (!served)
			throw new HarnessError(
				"NOT_FOUND",
				"The selected file is not in this commit.",
			);
		if (
			!gitPath(path) ||
			(served.file.oldPath ? !gitPath(served.file.oldPath) : false)
		)
			return make("unavailable", null, "unsupported-path");
		if (served.binary) return make("binary");
		try {
			const text = await context.git([
				"diff-tree",
				"-r",
				"-p",
				"--full-index",
				"--no-color",
				"--no-ext-diff",
				"--no-textconv",
				"-M",
				...diffSpec(detail.oid, detail.parentOid),
				"--",
				...[path, ...(served.file.oldPath ? [served.file.oldPath] : [])].map(
					(value) => `:(literal)${value}`,
				),
			]);
			if (Buffer.byteLength(text) > CODE_REVIEW_LIMITS.patchBytes)
				return make("truncated", null, "resource-limit");
			return make(text ? "text" : "empty", text);
		} catch (error) {
			if (error instanceof HarnessError && error.code === "RESOURCE_LIMIT")
				return make("truncated", null, "resource-limit");
			throw error;
		}
	}
}
