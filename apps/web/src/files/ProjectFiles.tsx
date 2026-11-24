import {
	Fragment,
	useCallback,
	useEffect,
	useRef,
	useState,
	type MouseEvent,
	type ReactNode,
} from "react";
import { authenticated, read } from "../api";
import { FilesView, type FilesEntry } from "./FilesView";
import { ProjectSearch } from "./ProjectSearch";
import {
	unavailableProjectSearch,
	type ProjectSearchAdapter,
	type ProjectSearchMatch,
} from "./project-search-api";
import {
	lookupLineAttribution,
	useLineAttribution,
	type FileLineAttribution,
} from "./line-attribution";
import { useFilesRead } from "./useFilesRead";

interface ProjectFile {
	text: string | null;
	binary: boolean;
	sha256: string;
	lineAttribution?: FileLineAttribution;
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
		[searchRefresh, setSearchRefresh] = useState(0),
		[attributionLine, setAttributionLine] = useState<number | null>(null);
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
	const line =
		selectedMatch?.kind === "text" && !stale ? selectedMatch.line : undefined;
	const attribution = file?.lineAttribution;
	// Same LF source model as the host; a disagreement refuses the picker.
	const modelLines = file?.text != null ? file.text.split("\n").length - (file.text.endsWith("\n") ? 1 : 0) : 0;
	const attributionEligible = attribution?.kind === "eligible" && attribution.lineCount === modelLines;
	const attributionControl = useLineAttribution({
		eligible: attributionEligible,
		reason: attribution?.kind === "unavailable" ? attribution.reason : "unavailable",
		lineCount: attribution?.kind === "eligible" ? attribution.lineCount : 0,
		fence: `${selected?.path ?? ""}#${file?.sha256 ?? ""}#${preview.pending}#${active}`,
		preferredLine: line ?? undefined,
		lookup: (selectedLine, signal) =>
			lookupLineAttribution(
				base,
				owner.threadId,
				{
					path: selected!.path,
					previewSha256: file!.sha256,
					previewProof:
						attribution?.kind === "eligible" ? attribution.previewProof : "",
					line: selectedLine,
				},
				signal,
			),
		onLine: setAttributionLine,
		onRefreshPreview: preview.refresh,
	});
	useEffect(() => {
		if (!stale && !preview.pending)
			matchLine.current?.scrollIntoView({
				block: "center",
				behavior: "instant",
			});
	}, [file, selectedMatch, stale, preview.pending]);
	if (folder.errorCode === "PROJECT_NOT_CONNECTED") return fallback;
	const lines = file?.text ? file.text.split(/(\r\n|\r|\n)/) : undefined;
	const lineIndex = line ? (line - 1) * 2 : -1;
	const attributionIndex =
		attributionControl.open && attributionLine !== null
			? (attributionLine - 1) * 2
			: -1;
	const marks = new Map<number, { cls: string; ref?: typeof matchLine }>();
	if (line && lines && lineIndex < lines.length)
		marks.set(lineIndex, { cls: "files-matching-line", ref: matchLine });
	if (attributionIndex >= 0 && lines && attributionIndex < lines.length) {
		const overlap = marks.get(attributionIndex);
		marks.set(attributionIndex, {
			cls: `${overlap?.cls ?? ""} files-attribution-line`.trim(),
			ref: overlap?.ref,
		});
	}
	// Pick mode maps pointer Y to a logical row of the unwrapped pre; drags,
	// secondary buttons and rows outside the text area are ignored.
	const pickFromPreview = (event: MouseEvent<HTMLElement>) => {
		if (event.button !== 0 || !window.getSelection()?.isCollapsed) return;
		const pre = event.currentTarget,
			rect = pre.getBoundingClientRect(),
			style = getComputedStyle(pre);
		const paddingTop = parseFloat(style.paddingTop) || 0;
		let lineHeight = parseFloat(style.lineHeight);
		if (!Number.isFinite(lineHeight))
			lineHeight = (parseFloat(style.fontSize) || 13) * 1.4;
		const row = Math.floor((event.clientY - rect.top - paddingTop) / lineHeight) + 1;
		if (row >= 1 && row <= modelLines) attributionControl.pick(row);
	};
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
							<pre
								onClick={
									attributionControl.open && attributionEligible
										? pickFromPreview
										: undefined
								}
							>
								{marks.size
									? lines!.map((part, index) =>
											marks.has(index) ? (
												<mark
													key={index}
													className={marks.get(index)!.cls}
													ref={marks.get(index)!.ref}
												>
													{part}
												</mark>
											) : (
												<Fragment key={index}>
													{part === "\r" ? (
														<>
															{part}
															<br aria-hidden="true" />
														</>
													) : (
														part
													)}
												</Fragment>
											),
									  )
									: renderParts(lines ?? (file.text ? [file.text] : []))}
							</pre>
						)}
						<small className="files-checksum">SHA-256 {file.sha256}</small>
					</>
				) : null,
			}}
			lineAttribution={
				attribution && selected
					? {
							action: attributionControl.action,
							inspector: attributionControl.inspector,
						}
					: undefined
			}
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
