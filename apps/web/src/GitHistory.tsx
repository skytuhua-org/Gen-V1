import { ChevronLeft, GitCommitHorizontal, RotateCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
	GitHistoryCommitRead,
	GitHistoryFilePatch,
	GitHistoryPage,
	GitHistoryRow,
} from "../../../packages/contracts/code-review.ts";
import type { UiPreferences } from "../../../packages/contracts/preferences.ts";
import { ErrorState } from "../../../packages/ui-shell/Feedback";
import { ApiError, authenticated, read } from "./api.ts";
import { CopyButton } from "./CopyButton";
import { displayFilePath } from "./files/FilesView";
import { UnifiedDiff } from "./UnifiedDiff";
import "./git-history.css";

const get = <T,>(url: string, signal?: AbortSignal) =>
	authenticated(() =>
		fetch(url, { credentials: "same-origin", cache: "no-store", signal }),
	).then(read<T>);
const message = (error: unknown) =>
	error instanceof Error ? error.message : "Commit history unavailable";
const stale = (error: unknown) =>
	error instanceof ApiError && error.code === "HISTORY_STALE";
const plural = (count: number, word: string) =>
	`${count} ${word}${count === 1 ? "" : "s"}`;

export const relativeTime = (iso: string, now: number) => {
	const then = Date.parse(iso);
	if (!Number.isFinite(then)) return "";
	const seconds = Math.max(0, Math.round((now - then) / 1000));
	if (seconds < 60) return "just now";
	const format = new Intl.RelativeTimeFormat(undefined, { numeric: "always" });
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return format.format(-minutes, "minute");
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return format.format(-hours, "hour");
	const days = Math.floor(hours / 24);
	if (days < 30) return format.format(-days, "day");
	const months = Math.floor(days / 30);
	if (months < 12) return format.format(-months, "month");
	return format.format(-Math.floor(months / 12), "year");
};

export const pageFrom = (value: unknown): GitHistoryPage => {
	const page = value as GitHistoryPage;
	if (
		!page ||
		typeof page.snapshotId !== "string" ||
		!Array.isArray(page.commits) ||
		(page.headOid !== null && typeof page.headOid !== "string")
	)
		throw new ApiError("INVALID_RESPONSE", "Commit history unavailable");
	return page;
};
const commitFrom = (value: unknown): GitHistoryCommitRead => {
	const detail = value as GitHistoryCommitRead;
	if (!detail || (detail.state !== "ready" && detail.state !== "unavailable"))
		throw new ApiError("INVALID_RESPONSE", "Commit history unavailable");
	return detail;
};
const patchFrom = (value: unknown): GitHistoryFilePatch => {
	const patch = value as GitHistoryFilePatch;
	if (!patch || typeof patch.state !== "string")
		throw new ApiError("INVALID_RESPONSE", "Commit history unavailable");
	return patch;
};

export function GitHistory({
	base,
	query,
	active,
	preferences,
}: {
	base: string;
	query: URLSearchParams;
	active: boolean;
	preferences: UiPreferences;
}) {
	const [commits, setCommits] = useState<GitHistoryRow[]>([]),
		[page, setPage] = useState<GitHistoryPage | null>(null),
		[nextCursor, setNextCursor] = useState<string | null>(null),
		[loading, setLoading] = useState(true),
		[error, setError] = useState(""),
		[attempt, setAttempt] = useState(0),
		[cursor, setCursor] = useState<string>(),
		[selected, setSelected] = useState<string>(),
		[status, setStatus] = useState(""),
		[now, setNow] = useState(() => Date.now()),
		[narrow, setNarrow] = useState(false);
	const host = useRef<HTMLDivElement>(null),
		opener = useRef<HTMLButtonElement | null>(null),
		lastAdded = useRef<HTMLButtonElement | null>(null),
		hadMore = useRef(false);

	useEffect(() => {
		if (!active) return;
		const tick = setInterval(() => setNow(Date.now()), 30_000);
		return () => clearInterval(tick);
	}, [active]);

	useEffect(() => {
		const element = host.current;
		if (!element) return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) setNarrow(entry.contentRect.width < 720);
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!active) return;
		const controller = new AbortController();
		setLoading(true);
		setError("");
		if (!cursor) {
			setCommits([]);
			setPage(null);
			setSelected(undefined);
		}
		const params = new URLSearchParams(query);
		if (cursor) params.set("cursor", cursor);
		hadMore.current = Boolean(cursor);
		void get<GitHistoryPage>(`${base}/git/history?${params}`, controller.signal)
			.then((value) => {
				if (controller.signal.aborted) return;
				const next = pageFrom(value);
				setPage(next);
				setCommits((previous) => {
					const known = new Set(previous.map((row) => row.oid)),
						added = next.commits.filter((row) => !known.has(row.oid));
					setStatus(
						cursor
							? `Showing ${plural(added.length, "more commit")}`
							: next.commits.length
								? `Loaded ${plural(next.commits.length, "commit")}`
								: "No commits yet",
					);
					return cursor ? [...previous, ...added] : next.commits;
				});
				setNextCursor(next.nextCursor);
			})
			.catch((cause) => {
				if (controller.signal.aborted) return;
				setError(
					stale(cause)
						? "History changed. Refresh history to continue."
						: message(cause),
				);
				setStatus("Commit history unavailable");
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});
		return () => controller.abort();
	}, [base, query, active, attempt, cursor]);

	const select = (oid: string, button: HTMLButtonElement) => {
		opener.current = button;
		setSelected(oid);
	};
	const refresh = useCallback(() => {
		setCursor(undefined);
		setAttempt((value) => value + 1);
	}, []);
	const more = () => {
		if (nextCursor) setCursor(nextCursor);
	};
	useEffect(() => {
		// When paging stops offering more, leave focus on the last added row.
		if (!loading && hadMore.current && !nextCursor && commits.length)
			lastAdded.current?.focus();
	}, [loading, nextCursor, commits.length]);

	return (
		<div
			className="git-history"
			data-view={selected ? "detail" : "list"}
			ref={host}
		>
			<div className="git-history-head">
				<strong>
					{page?.branch ??
						(page?.headOid
							? `Detached HEAD ${page.headOid.slice(0, 10)}`
							: "Git history")}
				</strong>
				<span className="git-history-basis">
					{page?.upstreamRef
						? `Compared with local ${page.upstreamRef}; may be out of date`
						: "Push status unavailable"}
				</span>
				<button
					type="button"
					className="git-history-quiet"
					disabled={loading}
					onClick={refresh}
				>
					<RotateCw size={13} aria-hidden="true" />
					Refresh history
				</button>
			</div>
			<p role="status" className="git-history-status">
				{status}
			</p>
			<div className="git-history-body">
				<div
					className="git-history-list-pane"
					hidden={narrow && Boolean(selected)}
				>
					{loading && commits.length === 0 && (
						<p role="status" className="git-history-note">
							Loading commits…
						</p>
					)}
					{error && <ErrorState message={error} onRetry={refresh} />}
					{!loading && !error && commits.length === 0 && page && (
						<p className="git-history-empty">No commits yet</p>
					)}
					{commits.length > 0 && (
						<ul className="git-history-list">
							{commits.map((row, index) => (
								<li key={row.oid}>
									<button
										type="button"
										className="git-history-row"
										data-selected={selected === row.oid || undefined}
										aria-current={selected === row.oid || undefined}
										ref={index === commits.length - 1 ? lastAdded : undefined}
										title={row.subject}
										onClick={(event) => select(row.oid, event.currentTarget)}
									>
										<GitCommitHorizontal size={14} aria-hidden="true" />
										<span className="git-history-row-main">
											<span className="git-history-subject">{row.subject}</span>
											<span className="git-history-meta">
												{row.author}
												{" · "}
												<time dateTime={row.authoredAt} title={row.authoredAt}>
													{relativeTime(row.authoredAt, now)}
												</time>
												{" · "}
												{row.filesChanged === null
													? "files unknown"
													: plural(row.filesChanged, "file")}
												{row.pushState === "unpushed" && (
													<span className="git-history-badge">Unpushed</span>
												)}
											</span>
										</span>
									</button>
								</li>
							))}
						</ul>
					)}
					{nextCursor && !error && (
						<button
							type="button"
							className="git-history-quiet git-history-more"
							disabled={loading}
							onClick={more}
						>
							{loading && commits.length > 0 ? "Loading…" : "Load more commits"}
						</button>
					)}
				</div>
				{selected && page && (
					<GitCommitDetail
						key={`${page.snapshotId}:${selected}`}
						base={base}
						query={query}
						snapshotId={page.snapshotId}
						oid={selected}
						preferences={preferences}
						onBack={() => {
							setSelected(undefined);
							queueMicrotask(() => opener.current?.focus());
						}}
					/>
				)}
			</div>
		</div>
	);
}

function GitCommitDetail({
	base,
	query,
	snapshotId,
	oid,
	preferences,
	onBack,
}: {
	base: string;
	query: URLSearchParams;
	snapshotId: string;
	oid: string;
	preferences: UiPreferences;
	onBack: () => void;
}) {
	const [detail, setDetail] = useState<GitHistoryCommitRead | null>(null),
		[error, setError] = useState(""),
		[errorCode, setErrorCode] = useState(""),
		[attempt, setAttempt] = useState(0),
		[path, setPath] = useState<string>(),
		back = useRef<HTMLButtonElement>(null),
		heading = useRef<HTMLHeadingElement>(null);
	useEffect(() => {
		back.current?.focus();
	}, []);
	useEffect(() => {
		const controller = new AbortController();
		setDetail(null);
		setError("");
		setErrorCode("");
		setPath(undefined);
		const params = new URLSearchParams(query);
		params.set("snapshotId", snapshotId);
		params.set("oid", oid);
		void get<GitHistoryCommitRead>(
			`${base}/git/history/commit?${params}`,
			controller.signal,
		)
			.then((value) => {
				if (controller.signal.aborted) return;
				const next = commitFrom(value);
				setDetail(next);
				if (
					next.state === "ready" &&
					next.files.length &&
					preferences.diffDefaultExpanded
				)
					setPath(next.files[0].path);
			})
			.catch((cause) => {
				if (controller.signal.aborted) return;
				setError(
					stale(cause)
						? "History changed. Refresh history to continue."
						: message(cause),
				);
				setErrorCode(cause instanceof ApiError ? cause.code : "");
			});
		return () => controller.abort();
	}, [base, query, snapshotId, oid, attempt, preferences.diffDefaultExpanded]);

	const unavailableNote = (
		readOut: Extract<GitHistoryCommitRead, { state: "unavailable" }>,
	) =>
		readOut.reason === "missing-parent"
			? "The parent commit is not available locally."
			: readOut.reason === "resource-limit"
				? "Diff is too large to display."
				: "Commit history unavailable";

	return (
		<section aria-label="Commit detail" className="git-history-detail">
			<button
				ref={back}
				type="button"
				className="git-history-back"
				onClick={onBack}
			>
				<ChevronLeft size={14} aria-hidden="true" />
				Back to commits
			</button>
			{error ? (
				<ErrorState
					message={error}
					onRetry={
						errorCode === "HISTORY_STALE"
							? undefined
							: () => setAttempt((value) => value + 1)
					}
				/>
			) : !detail ? (
				<p role="status" className="git-history-note">
					Loading commit…
				</p>
			) : detail.state === "unavailable" ? (
				<p className="git-history-note">{unavailableNote(detail)}</p>
			) : (
				<>
					<header className="git-history-detail-head">
						<h3 ref={heading} tabIndex={-1}>
							Commit detail
						</h3>
						<p className="git-history-sha">
							<code>{detail.oid}</code>
							<CopyButton text={detail.oid} label="Copy SHA" />
						</p>
						<p className="git-history-basis">
							{detail.basis === "root"
								? "Root commit"
								: "Compared with first parent"}
							{detail.filesTruncated ? " · File list truncated" : ""}
						</p>
					</header>
					{detail.files.length === 0 ? (
						<p className="git-history-empty">No files changed in this commit</p>
					) : (
						<>
							<ul className="git-history-files" aria-label="Files changed">
								{detail.files.map((file) => (
									<li key={file.path}>
										<button
											type="button"
											className="git-history-row git-history-file"
											data-selected={path === file.path || undefined}
											onClick={() => setPath(file.path)}
										>
											<span className="git-history-row-main">
												<span className="git-history-subject">
													{file.oldPath
														? `${displayFilePath(file.oldPath)} → ${displayFilePath(file.path)}`
														: displayFilePath(file.path)}
												</span>
												<span className="git-history-meta">
													{file.status}
													{file.additions !== null && ` +${file.additions}`}
													{file.deletions !== null && ` −${file.deletions}`}
												</span>
											</span>
										</button>
									</li>
								))}
							</ul>
							{path && (
								<GitCommitPatch
									key={`${detail.comparisonId}:${path}`}
									base={base}
									query={query}
									comparisonId={detail.comparisonId}
									path={path}
								/>
							)}
						</>
					)}
				</>
			)}
		</section>
	);
}

function GitCommitPatch({
	base,
	query,
	comparisonId,
	path,
}: {
	base: string;
	query: URLSearchParams;
	comparisonId: string;
	path: string;
}) {
	const [patch, setPatch] = useState<GitHistoryFilePatch | null>(null),
		[error, setError] = useState(""),
		[attempt, setAttempt] = useState(0);
	useEffect(() => {
		const controller = new AbortController();
		setPatch(null);
		setError("");
		const params = new URLSearchParams(query);
		params.set("comparisonId", comparisonId);
		params.set("path", path);
		void get<GitHistoryFilePatch>(
			`${base}/git/history/file?${params}`,
			controller.signal,
		)
			.then((value) => {
				if (!controller.signal.aborted) setPatch(patchFrom(value));
			})
			.catch((cause) => {
				if (!controller.signal.aborted)
					setError(
						stale(cause)
							? "History changed. Refresh history to continue."
							: message(cause),
					);
			});
		return () => controller.abort();
	}, [base, query, comparisonId, path, attempt]);

	if (error)
		return (
			<ErrorState
				message={error}
				onRetry={() => setAttempt((value) => value + 1)}
			/>
		);
	if (!patch)
		return (
			<p role="status" className="git-history-note">
				Loading diff…
			</p>
		);
	const note =
		patch.state === "binary"
			? "Binary file — no text diff"
			: patch.state === "truncated" || patch.reason === "resource-limit"
				? "Diff is too large to display."
				: patch.state === "unavailable"
					? patch.reason === "unsupported-path"
						? "Preview unavailable for this path."
						: "Commit history unavailable"
					: null;
	return (
		<div className="git-history-patch">
			{note ? (
				<p className="git-history-note">{note}</p>
			) : (
				<UnifiedDiff diff={patch.text ?? ""} />
			)}
		</div>
	);
}
