import {
	Fragment,
	useCallback,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { authenticated, read } from "../api";
import { FilesView, type FilesEntry } from "./FilesView";
import { FilesMarkdownPreview } from "./MarkdownPreview";
import { isMarkdownFileName } from "./markdown-references";
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
// Bound on rendered Markdown; larger documents stay in source view.
const MARKDOWN_RENDER_LIMIT = 256 * 1024;
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
		[searchRefresh, setSearchRefresh] = useState(0),
		[modeOverride, setModeOverride] = useState<"preview" | "source" | null>(
			null,
		),
		[pendingFragment, setPendingFragment] = useState<{
			path: string;
			fragment: string;
		} | null>(null);
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
	// A new file resets the default view mode; a pending heading target survives
	// only while it still names the selected document.
	useEffect(() => {
		setModeOverride(null);
		setPendingFragment((current) =>
			current && current.path !== selected?.path ? null : current,
		);
	}, [selected?.path]);
	const markdown = !!selected && isMarkdownFileName(selected.name),
		effectiveMode: "preview" | "source" =
			selectedMatch?.kind === "text"
				? "source"
				: (modeOverride ?? (markdown ? "preview" : "source"));
	const changeMode = (next: "preview" | "source") => {
		if (next === "preview") setSelectedMatch(null);
		setModeOverride(next);
	};
	const clearFragment = useCallback(() => setPendingFragment(null), []);
	// Markdown links navigate through the same Files selection path; the target
	// keeps the existing read authority, and a fragment resolves after render.
	const navigate = useCallback(
		(target: string, fragment: string | null) => {
			setSelectedMatch(null);
			setPendingFragment(fragment ? { path: target, fragment } : null);
			if (target !== selected?.path)
				setSelected({
					name: target.split("/").at(-1)!,
					path: target,
					kind: "file",
				});
		},
		[selected?.path],
	);
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
							setPendingFragment(null);
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
				controls:
					markdown && file && !file.binary && file.text !== null ? (
						<span
							className="files-mode"
							role="group"
							aria-label="Preview mode"
						>
							<button
								type="button"
								aria-pressed={effectiveMode === "preview"}
								onClick={() => changeMode("preview")}
							>
								Preview
							</button>
							<button
								type="button"
								aria-pressed={effectiveMode === "source"}
								onClick={() => changeMode("source")}
							>
								Source
							</button>
						</span>
					) : undefined,
				body: file ? (
					<div key={effectiveMode} className="files-mode-enter">
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
						{file.binary || file.text === null ? (
							<p className="files-message">
								Binary file; no text preview.
							</p>
						) : file.text === "" ? (
							<p className="files-message">Empty text file</p>
						) : effectiveMode === "preview" && markdown ? (
							file.text.length > MARKDOWN_RENDER_LIMIT ? (
								<>
									<p className="files-message" role="status">
										Too large to render. Showing source.
									</p>
									<pre>{file.text}</pre>
								</>
							) : (
								<FilesMarkdownPreview
									key={selected!.path}
									text={file.text}
									path={selected!.path}
									base={base}
									query={query}
									revision={file}
									pendingFragment={
										pendingFragment?.path === selected!.path
											? pendingFragment.fragment
											: null
									}
									onFragmentHandled={clearFragment}
									onNavigate={navigate}
								/>
							)
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
					</div>
				) : null,
			}}
			limitNote={
				(folder.value?.entries.length ?? 0) >= 500
					? "Showing up to 500 entries; more files may exist."
					: undefined
			}
			onDirectory={(next) => {
				setSelectedMatch(null);
				setPath(next);
				setSelected(null);
			}}
			onSelect={(entry) => {
				setSelectedMatch(null);
				setPendingFragment(null);
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
