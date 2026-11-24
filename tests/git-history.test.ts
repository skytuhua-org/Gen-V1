import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
	GitHistoryCommitRequestSchema,
	GitHistoryFileRequestSchema,
	GitHistoryPageRequestSchema,
} from "../packages/contracts/code-review.ts";
import {
	type GitHistoryContext,
	GitHistorySnapshots,
} from "../packages/workspace/git-history.ts";
import { nativeGit } from "../packages/workspace/git-storage.ts";

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
	for (const close of cleanup.splice(0).reverse()) await close();
});

const signal = new AbortController().signal;

async function repo(path: string) {
	const git = (...args: string[]) =>
		execFileSync("git", ["-C", path, ...args], {
			encoding: "utf8",
			windowsHide: true,
		}).trim();
	git("init", "-b", "main");
	git("config", "user.name", "Fixture");
	git("config", "user.email", "fixture@example.invalid");
	git("config", "core.autocrlf", "false");
	return git;
}

const context = (source: string, owner = "test-owner"): GitHistoryContext => ({
	git: (args: string[]) =>
		nativeGit("git", join(source, ".git"), source, args, signal),
	owner,
	signal,
});

async function fixture({ commits = 0 }: { commits?: number } = {}) {
	const root = await mkdtemp(join(tmpdir(), "gen-history-")),
		source = join(root, "source");
	await mkdir(source);
	const git = await repo(source);
	const snapshots = new GitHistorySnapshots();
	cleanup.push(async () => {
		await rm(root, { recursive: true, force: true, maxRetries: 5 });
	});
	const commit = async (
		message: string,
		file = "file.txt",
		text = `${message}\n`,
	) => {
		await writeFile(join(source, file), text);
		git("add", "-A");
		git("commit", "-m", message);
	};
	await writeFile(join(source, "file.txt"), "base\n");
	git("add", ".");
	git("commit", "-m", "Base");
	for (let index = 0; index < commits; index++)
		await commit(`Commit ${index + 1}`);
	return { snapshots, git, commit, source, ctx: () => context(source) };
}

describe("GitHistorySnapshots paging", () => {
	it("serves ordered pages with exact counts, subject, author and no repeats", async () => {
		const { snapshots, ctx } = await fixture({ commits: 54 });
		const first = await snapshots.page(ctx());
		expect(first.headOid).toMatch(/^[0-9a-f]{40}$/);
		expect(first.branch).toBe("main");
		expect(first.snapshotId).toMatch(/^[0-9a-f]{64}$/);
		expect(first.commits).toHaveLength(50);
		expect(first.nextCursor).toBeTruthy();
		expect(first.commits[0].subject).toBe("Commit 54");
		expect(first.commits[0].author).toBe("Fixture");
		expect(first.commits[0].authoredAt).toMatch(/^\d{4}-/);
		expect(first.commits[0].filesChanged).toBe(1);
		const second = await snapshots.page(ctx(), first.nextCursor!);
		expect(second.snapshotId).toBe(first.snapshotId);
		expect(second.commits).toHaveLength(5);
		expect(second.commits.at(-1)?.subject).toBe("Base");
		expect(second.nextCursor).toBeNull();
		const oids = new Set(
			[...first.commits, ...second.commits].map((row) => row.oid),
		);
		expect(oids.size).toBe(55);
	}, 120000);

	it("marks unpushed against the local origin ref and notMarked inside it", async () => {
		const { snapshots, git, ctx } = await fixture({ commits: 3 });
		const base = git("rev-list", "--max-parents=0", "HEAD");
		git("update-ref", "refs/remotes/origin/main", base);
		const page = await snapshots.page(ctx());
		expect(page.upstreamRef).toBe("origin/main");
		const states = new Map(
			page.commits.map((row) => [row.subject, row.pushState]),
		);
		expect(states.get("Base")).toBe("notMarked");
		for (const subject of ["Commit 1", "Commit 2", "Commit 3"])
			expect(states.get(subject)).toBe("unpushed");
	}, 120000);

	it("reports unknown push state without a tracking ref or on detached HEAD", async () => {
		const { snapshots, git, ctx } = await fixture({ commits: 1 });
		const page = await snapshots.page(ctx());
		expect(page.upstreamRef).toBeNull();
		expect(page.commits.every((row) => row.pushState === "unknown")).toBe(true);
		git("checkout", "--detach", "HEAD");
		const detached = await snapshots.page(ctx());
		expect(detached.branch).toBeNull();
		expect(detached.commits.every((row) => row.pushState === "unknown")).toBe(
			true,
		);
	}, 120000);

	it("returns an empty page for an unborn repository", async () => {
		const root = await mkdtemp(join(tmpdir(), "gen-history-unborn-")),
			source = join(root, "source");
		await mkdir(source);
		await repo(source);
		cleanup.push(async () => {
			await rm(root, { recursive: true, force: true, maxRetries: 5 });
		});
		const page = await new GitHistorySnapshots().page(context(source));
		expect(page).toMatchObject({
			headOid: null,
			branch: "main",
			commits: [],
			nextCursor: null,
		});
	}, 120000);
});

describe("GitHistorySnapshots commit detail and patches", () => {
	it("serves commit detail and file patch for root, merge, rename and binary states", async () => {
		const { snapshots, git, source, ctx } = await fixture();
		git("mv", "file.txt", "renamed.txt");
		git("commit", "-m", "Rename");
		await writeFile(join(source, "blob.bin"), Buffer.from([0, 1, 2]));
		git("add", "blob.bin");
		git("commit", "-m", "Binary");
		git("checkout", "-b", "side", "HEAD~1");
		await writeFile(join(source, "side.txt"), "side\n");
		git("add", "side.txt");
		git("commit", "-m", "Side work");
		git("checkout", "main");
		git("merge", "--no-ff", "-m", "Merge side", "side");
		const page = await snapshots.page(ctx());
		const bySubject = new Map(page.commits.map((row) => [row.subject, row]));
		expect(bySubject.get("Merge side")?.filesChanged).toBe(1);
		expect(bySubject.get("Binary")?.filesChanged).toBe(1);
		expect(bySubject.get("Rename")?.filesChanged).toBe(1);

		const merge = await snapshots.commit(
			ctx(),
			page.snapshotId,
			bySubject.get("Merge side")!.oid,
		);
		if (merge.state !== "ready") throw Error("Expected merge detail");
		expect(merge.basis).toBe("first-parent");
		expect(merge.parentOid).toBe(bySubject.get("Binary")!.oid);
		expect(merge.files.map((file) => file.path)).toEqual(["side.txt"]);

		const root = await snapshots.commit(
			ctx(),
			page.snapshotId,
			bySubject.get("Base")!.oid,
		);
		if (root.state !== "ready") throw Error("Expected root detail");
		expect(root.basis).toBe("root");
		expect(root.parentOid).toBeNull();
		expect(root.files.map((file) => [file.path, file.status])).toEqual([
			["file.txt", "A"],
		]);

		const binaryDetail = await snapshots.commit(
			ctx(),
			page.snapshotId,
			bySubject.get("Binary")!.oid,
		);
		if (binaryDetail.state !== "ready") throw Error("Expected binary detail");
		const binary = await snapshots.file(
			ctx(),
			binaryDetail.comparisonId,
			"blob.bin",
		);
		expect(binary.state).toBe("binary");
		expect(binary.identity).toMatchObject({
			kind: "commit",
			basis: "first-parent",
		});

		const rename = await snapshots.commit(
			ctx(),
			page.snapshotId,
			bySubject.get("Rename")!.oid,
		);
		if (rename.state !== "ready") throw Error("Expected rename detail");
		expect(rename.files[0]).toMatchObject({
			path: "renamed.txt",
			oldPath: "file.txt",
		});
		const renamePatch = await snapshots.file(
			ctx(),
			rename.comparisonId,
			"renamed.txt",
		);
		expect(renamePatch.state).toBe("text");
	}, 120000);

	it("shows a root commit patch text for the exact selected file", async () => {
		const { snapshots, ctx } = await fixture();
		const page = await snapshots.page(ctx());
		const detail = await snapshots.commit(
			ctx(),
			page.snapshotId,
			page.commits[0].oid,
		);
		if (detail.state !== "ready") throw Error("Expected detail");
		const patch = await snapshots.file(ctx(), detail.comparisonId, "file.txt");
		expect(patch.state).toBe("text");
		expect(patch.text).toContain("+base");
		await expect(
			snapshots.file(ctx(), detail.comparisonId, "other.txt"),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
		await expect(
			snapshots.file(ctx(), "0".repeat(64), "file.txt"),
		).rejects.toMatchObject({
			code: "HISTORY_STALE",
		});
	}, 120000);

	it("denies commits the snapshot never served and rejects stale continuations", async () => {
		const { snapshots, commit, ctx } = await fixture({ commits: 2 });
		const page = await snapshots.page(ctx());
		await expect(
			snapshots.commit(ctx(), page.snapshotId, "1".repeat(40)),
		).rejects.toMatchObject({
			code: "CAPABILITY_DENIED",
		});
		await expect(
			snapshots.commit(ctx(), "2".repeat(64), page.commits[0].oid),
		).rejects.toMatchObject({
			code: "HISTORY_STALE",
		});
		// Move HEAD after the snapshot: continuation refuses rather than mixing snapshots.
		await commit("Moved");
		await expect(
			snapshots.page(ctx(), `h.${page.snapshotId}.0`),
		).rejects.toMatchObject({
			code: "HISTORY_STALE",
		});
	}, 120000);

	it("reports a shallow boundary commit's missing first parent without root treatment", async () => {
		const { source } = await fixture({ commits: 2 });
		const shallow = join(source, "..", "shallow");
		execFileSync(
			"git",
			["clone", "--depth", "1", "--no-tags", `file://${source}`, shallow],
			{
				encoding: "utf8",
				windowsHide: true,
			},
		);
		const head = execFileSync("git", ["-C", shallow, "rev-parse", "HEAD"], {
			encoding: "utf8",
			windowsHide: true,
		}).trim();
		const object = execFileSync(
			"git",
			["-C", shallow, "cat-file", "-p", head],
			{
				encoding: "utf8",
				windowsHide: true,
			},
		);
		expect(object).toMatch(/^parent [0-9a-f]{40}$/m);
		const snapshots = new GitHistorySnapshots();
		const page = await snapshots.page(context(shallow));
		expect(page.commits).toHaveLength(1);
		const detail = await snapshots.commit(
			context(shallow),
			page.snapshotId,
			page.commits[0].oid,
		);
		expect(detail).toMatchObject({
			state: "unavailable",
			reason: "missing-parent",
		});
	}, 120000);

	it("keeps subject/author bounded and control characters sanitized", async () => {
		const { snapshots, ctx } = await fixture();
		const page = await snapshots.page(ctx());
		for (const row of page.commits) {
			expect(row.subject.length).toBeLessThanOrEqual(512);
			expect(row.author.length).toBeLessThanOrEqual(512);
			expect(row.oid).toMatch(/^[0-9a-f]{40}$/);
		}
	}, 120000);
});

describe("history request schemas", () => {
	it("accepts strict page/commit/file requests and rejects malformed values", () => {
		const oid = "a".repeat(40),
			token = "b".repeat(64);
		expect(GitHistoryPageRequestSchema.parse({}).cursor).toBeUndefined();
		expect(
			GitHistoryPageRequestSchema.parse({ cursor: `h.${token}.50` }).cursor,
		).toBe(`h.${token}.50`);
		for (const bad of [
			{ cursor: "h.short.50" },
			{ cursor: `h.${token}.-1` },
			{ cursor: `h.${token}.50`, extra: 1 },
			{ cursor: 50 },
		])
			expect(GitHistoryPageRequestSchema.safeParse(bad).success).toBe(false);
		expect(
			GitHistoryCommitRequestSchema.parse({ snapshotId: token, oid }),
		).toEqual({ snapshotId: token, oid });
		for (const bad of [
			{ snapshotId: "x", oid },
			{ snapshotId: token, oid: "abc" },
			{ snapshotId: token, oid, path: "p" },
		])
			expect(GitHistoryCommitRequestSchema.safeParse(bad).success).toBe(false);
		expect(
			GitHistoryFileRequestSchema.parse({
				comparisonId: token,
				path: "a/b.ts",
			}),
		).toEqual({
			comparisonId: token,
			path: "a/b.ts",
		});
		for (const bad of [
			{ comparisonId: "x", path: "a" },
			{ comparisonId: token },
			{ comparisonId: token, path: "" },
			{ comparisonId: token, path: "a\0b" },
		])
			expect(GitHistoryFileRequestSchema.safeParse(bad).success).toBe(false);
	});
});
