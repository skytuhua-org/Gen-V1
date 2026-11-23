import {
	Fragment,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { Link2 } from "lucide-react";
import { authenticated, read } from "../api";
import { CopyButton } from "../CopyButton";
import type { GitHubFileLink } from "../../../../packages/contracts/github-file-link.ts";
import { useGitHubFileLink } from "./useGitHubFileLink";
import { FilesView, type FilesEntry } from "./FilesView";
import { ProjectSearch } from "./ProjectSearch";
import {
	unavailableProjectSearch,
	type ProjectSearchAdapter,
	type ProjectSearchMatch,
} from "./project-search-api";
import { useFilesRead } from "./useFilesRead";

interface ProjectFile {
	text: string | null;
	binary: boolean;
	sha256: string;
}
interface ProjectFilesProps {
	base: string;
	query: string;
	active: boolean;
	fallback: ReactNode;
	searchAdapter?: ProjectSearchAdapter;
}
export function ProjectFiles(props: ProjectFilesProps) {
	return <ProjectFilesReader key={props.base + "?" + props.query} {...props} />;
}
function ProjectFilesReader({
	base,
	query,
	active,
	fallback,
	searchAdapter = unavailableProjectSearch,
}: ProjectFilesProps) {
	const [path, setPath] = useState(""),
		[selected, setSelected] = useState<FilesEntry | null>(null),
		[selectedMatch, setSelectedMatch] = useState<ProjectSearchMatch | null>(
			null,
		),
		[searchRefresh, setSearchRefresh] = useState(0);
	const matchLine = useRef<HTMLElement>(null);
	const owner = {
		projectId: decodeURIComponent(base.split("/").at(-1) ?? ""),
		threadId: new URLSearchParams(query).get("threadId") ?? null,
	};
	const readFolder = useCallback(
		(signal: AbortSignal) => {
			const params = new URLSearchParams(query);
			if (path) params.set("path", path);
			return authenticated(() =>
				fetch(base + "/files?" + params, {
					credentials: "same-origin",
					cache: "no-store",
					signal,
				}),
			).then(read<{ entries: FilesEntry[] }>);
		},
		[base, query, path],
	);
	const readFile = useCallback(
		(signal: AbortSignal) => {
			const params = new URLSearchParams(query);
			params.set("path", selected!.path);
			return authenticated(() =>
				fetch(base + "/file?" + params, {
					credentials: "same-origin",
					cache: "no-store",
					signal,
				}),
			).then(read<ProjectFile>);
		},
		[base, query, selected?.path],
	);
	const folder = useFilesRead(path, active, readFolder),
		preview = useFilesRead(
			selected?.path ?? "",
			active && !!selected,
			readFile,
		);
	const file = preview.value;
	const [note, setNote] = useState<
		| { kind: "success" | "unavailable" | "check-failed"; link: GitHubFileLink }
		| { kind: "copy-failed" }
		| null
	>(null);
	const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
		noteId = useId();
	// The note belongs to the selected file: a new selection replaces it.
	useEffect(() => {
		setNote(null);
		if (noteTimer.current) {
			clearTimeout(noteTimer.current);
			noteTimer.current = null;
		}
	}, [selected?.path, path]);
	const accepted = !!(
		selected &&
		file &&
		!file.binary &&
		!preview.pending &&
		!preview.error
	);
	const link = useGitHubFileLink(
		base,
		query,
		accepted && selected
			? {
					projectId: owner.projectId,
					threadId: owner.threadId,
					path: selected.path,
					sha256: file!.sha256,
				}
			: null,
	);
	const checking = accepted && link.pending,
		ready = link.value?.state === "ready" ? link.value : null,
		unavailable = link.value?.state === "unavailable" ? link.value : null,
		checkFailed = !!link.error;
	const reasonText = (
		data: Extract<GitHubFileLink, { state: "unavailable" }>,
	): string => {
		switch (data.reason) {
			case "detached-head":
				return "No GitHub link: HEAD is detached. Check out a branch.";
			case "unborn-head":
				return "No GitHub link: this branch has no commits yet.";
			case "no-upstream":
				return `No GitHub link: no fetched origin branch for ${data.detail?.branch ?? ""}.`;
			case "upstream-not-origin":
				return "No GitHub link: this branch tracks a remote other than origin.";
			case "not-on-upstream":
				return `No GitHub link: commit ${data.detail?.commit ?? ""} isn’t on ${data.detail?.upstream ?? ""} yet. Push, then fetch.`;
			case "untracked":
				return "No GitHub link: this file isn’t committed.";
			case "not-regular-file":
				return "No GitHub link: links are only available for regular files.";
			case "changed":
				return "No GitHub link: this file differs from the committed version.";
			case "binary":
			case "not-utf8":
				return "No GitHub link: only text files can be linked.";
			case "preview-stale":
			case "changed-during-check":
				return "No GitHub link: the file changed. Refresh and try again.";
			default:
				return "Couldn’t check the GitHub link.";
		}
	};
	const showSuccessNote = (data: GitHubFileLink) => {
		setNote({ kind: "success", link: data });
		if (noteTimer.current) clearTimeout(noteTimer.current);
		noteTimer.current = setTimeout(() => {
			noteTimer.current = null;
			setNote(null);
		}, 6000);
	};
	const reasonNote = (data: Extract<GitHubFileLink, { state: "unavailable" }>) => {
		switch (data.reason) {
			case "detached-head":
				return "No GitHub link: HEAD is detached. Check out a branch.";
			case "unborn-head":
				return "No GitHub link: this branch has no commits yet.";
			case "no-upstream":
				return (
					<>
						No GitHub link: no fetched origin branch for{" "}
						<code>{data.detail?.branch ?? ""}</code>.
					</>
				);
			case "upstream-not-origin":
				return "No GitHub link: this branch tracks a remote other than origin.";
			case "not-on-upstream":
				return (
					<>
						No GitHub link: commit{" "}
						<code>{data.detail?.commit ?? ""}</code> isn’t on{" "}
						<code>{data.detail?.upstream ?? ""}</code> yet. Push, then
						fetch.
					</>
				);
			case "untracked":
				return "No GitHub link: this file isn’t committed.";
			case "not-regular-file":
				return "No GitHub link: links are only available for regular files.";
			case "changed":
				return "No GitHub link: this file differs from the committed version.";
			case "binary":
			case "not-utf8":
				return "No GitHub link: only text files can be linked.";
			case "preview-stale":
			case "changed-during-check":
				return "No GitHub link: the file changed. Refresh and try again.";
			default:
				return "Couldn’t check the GitHub link.";
		}
	};
	const stale = !!(
		selectedMatch &&
		file &&
		file.sha256.toLowerCase() !== selectedMatch.sha256.toLowerCase()
	);
	useEffect(() => {
		if (!stale && !preview.pending)
			matchLine.current?.scrollIntoView({
				block: "center",
				behavior: "instant",
			});
	}, [file, selectedMatch, stale, preview.pending]);
	if (folder.errorCode === "PROJECT_NOT_CONNECTED") return fallback;
	const line =
		selectedMatch?.kind === "text" && !stale ? selectedMatch.line : undefined;
	const lines =
		line && file?.text ? file.text.split(/(\r\n|\r|\n)/) : undefined;
	const lineIndex = line ? (line - 1) * 2 : -1;
	// DOM carriage returns need an explicit visual break; retain the source text.
	const renderParts = (parts: string[]) =>
		parts.map((part, index) =>
			part === "\r" ? (
				<Fragment key={index}>
					{part}
					<br aria-hidden="true" />
				</Fragment>
			) : (
				part
			),
		);
	return (
		<FilesView
			source="project"
			rootLabel="Project files"
			path={path}
			folder={folder}
			selected={selected}
			projectSearch={{
				available: searchAdapter.available,
				body: (openPreview) => (
					<ProjectSearch
						adapter={searchAdapter}
						owner={owner}
						active={active}
						refreshVersion={searchRefresh}
						selected={selectedMatch}
						onSelect={(match) => {
							setSelectedMatch(match);
							if (selected?.path === match.path) preview.refresh();
							else
								setSelected({
									name: match.path.split("/").at(-1)!,
									path: match.path,
									kind: "file",
								});
							openPreview();
						}}
					/>
				),
			}}
			preview={{
				...preview,
				body: file ? (
					<>
						{stale && (
							<p className="files-message" role="status">
								This file changed since the search. Showing current content;
								refresh search results before using the matching line.
							</p>
						)}
						{line && lines && lineIndex >= lines.length && (
							<p className="files-message" role="status">
								The matching line is no longer available. Refresh the search.
							</p>
						)}
						{line && lines && lineIndex < lines.length && (
							<p className="files-message files-limit">Matching line {line}</p>
						)}
						{file.binary ? (
							<p className="files-message">
								Binary file; no text preview.
							</p>
						) : file.text === "" ? (
							<p className="files-message">Empty text file</p>
						) : (
							<pre>
								{lines && line && lineIndex < lines.length ? (
									<>
										{renderParts(lines.slice(0, lineIndex))}
										<mark className="files-matching-line" ref={matchLine}>
											{lines[lineIndex]}
										</mark>
										{renderParts(lines.slice(lineIndex + 1))}
									</>
								) : (
									file.text
								)}
							</pre>
						)}
						<small className="files-checksum">SHA-256 {file.sha256}</small>
					</>
				) : null,
			}}
			limitNote={
				(folder.value?.entries.length ?? 0) >= 500
					? "Showing up to 500 entries; more files may exist."
					: undefined
			}
			previewActions={
				accepted && !link.hidden ? (
					<CopyButton
						text={ready?.url ?? ""}
						label="Copy GitHub permalink"
						icon={Link2}
						copiedLabel="Copied GitHub link"
						srLabel=""
						failureMessage="Copy failed. Try again."
						disabled={!ready}
						busy={checking}
						tooltip={
							checking
								? "Checking GitHub link…"
								: unavailable
									? reasonText(unavailable)
									: checkFailed
										? "Couldn’t check the GitHub link."
										: undefined
						}
						describedBy={note ? noteId : undefined}
						onCopied={() => ready && showSuccessNote(ready)}
						onFailure={() => setNote({ kind: "copy-failed" })}
						onDisabledPress={() => {
							if (checking) return;
							if (checkFailed || unavailable?.reason === "check-failed")
								setNote({ kind: "check-failed", link: link.value! });
							else if (unavailable) setNote({ kind: "unavailable", link: unavailable });
						}}
					/>
				) : null
			}
			previewNote={
				note ? (
					<p
						id={noteId}
						className={`files-permalink-note${note.kind === "check-failed" || note.kind === "copy-failed" ? " files-permalink-danger" : ""}`}
						role="status"
					>
						{note.kind === "success" && note.link.state === "ready" ? (
							<>
								Copied link to <code>{note.link.commit.slice(0, 7)}</code>{" "}
								on <code>{note.link.upstream}</code> (last fetch). People
								need access to <code>{note.link.repository}</code> to open
								it.
							</>
						) : note.kind === "unavailable" && note.link.state === "unavailable" ? (
							reasonNote(note.link)
						) : note.kind === "check-failed" ? (
							<>
								Couldn’t check the GitHub link.{" "}
								<button
									type="button"
									className="files-permalink-retry"
									onClick={() => {
										setNote(null);
										link.refresh();
									}}
								>
									Retry
								</button>
							</>
						) : (
							"Copy failed. Try again."
						)}
					</p>
				) : null
			}
			onDirectory={(next) => {
				setSelectedMatch(null);
				setPath(next);
				setSelected(null);
			}}
			onSelect={(entry) => {
				setSelectedMatch(null);
				if (selected?.path === entry.path) preview.refresh();
				else setSelected(entry);
			}}
			onRefresh={() => {
				setSearchRefresh((value) => value + 1);
				folder.refresh();
				preview.refresh();
			}}
			onRetryFolder={folder.refresh}
			onRetryFile={preview.refresh}
		/>
	);
}
