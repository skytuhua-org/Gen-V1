import {
	Fragment,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { ApiError, authenticated, read } from "../api";
import { FilesView, displayFilePath, type FilesEntry } from "./FilesView";
import { ProjectSearch } from "./ProjectSearch";
import {
	unavailableProjectSearch,
	type ProjectSearchAdapter,
	type ProjectSearchMatch,
} from "./project-search-api";
import { useFilesRead } from "./useFilesRead";
import {
	emptySlots,
	transitionSlots,
	PIN_LIMIT,
	type PreviewSlots,
} from "./pinned-previews";

interface ProjectFile {
	text: string | null;
	binary: boolean;
	sha256: string;
	bindingId?: string;
}
interface ProjectFolder {
	entries: FilesEntry[];
	bindingId?: string;
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
		[slots, setSlots] = useState<PreviewSlots>(emptySlots),
		[bindingId, setBindingId] = useState<string | undefined>(),
		[bindingReady, setBindingReady] = useState(false),
		[bindingError, setBindingError] = useState<ApiError | null>(null),
		[selectedMatch, setSelectedMatch] = useState<ProjectSearchMatch | null>(
			null,
		),
		[capReason, setCapReason] = useState(false),
		[slotStatus, setSlotStatus] = useState(""),
		[searchRefresh, setSearchRefresh] = useState(0);
	const activeEntry =
		slots.transient?.path === slots.activePath
			? slots.transient
			: (slots.pins.find((entry) => entry.path === slots.activePath) ?? null);
	const selected = activeEntry;
	useLayoutEffect(() => {
		if (!active) setBindingReady(false);
	}, [active]);
	const bindingRef = useRef(bindingId);
	const adoptBinding = useCallback(
		(observed: string | undefined, folderResponse: boolean) => {
			if (typeof observed !== "string" || !observed)
				throw new ApiError("FILES_BINDING_CHANGED", "Checkout binding is unavailable.");
			if (bindingRef.current === undefined) {
				bindingRef.current = observed;
				setBindingId(observed);
				return;
			}
			if (bindingRef.current !== observed) {
				bindingRef.current = observed;
				setBindingId(observed);
				setSlots(emptySlots());
				setSelectedMatch(null);
				if (!folderResponse)
					throw new ApiError("FILES_BINDING_CHANGED", "Checkout binding changed.");
			}
		},
			[],
	);
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
			).then(read<ProjectFolder>);
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
	const acceptFolder = useCallback((data: ProjectFolder) => {
		adoptBinding(data.bindingId, true);
		setBindingError(null);
		setBindingReady(true);
	}, [adoptBinding]);
	const acceptFile = useCallback((data: ProjectFile) => {
		adoptBinding(data.bindingId, false);
	}, [adoptBinding]);
	const rejectBinding = useCallback((cause: unknown) => {
		if (!(cause instanceof ApiError) || (cause.code !== "FILES_BINDING_CHANGED" && cause.code !== "PROJECT_NOT_CONNECTED")) return;
		setSlots(emptySlots());
		setSelectedMatch(null);
		setBindingReady(false);
		setBindingError(cause);
	}, []);
	const folder = useFilesRead(
			(bindingId ?? "") + "|" + path,
			active,
			readFolder,
			acceptFolder,
			rejectBinding,
		),
		preview = useFilesRead(
			(bindingId ?? "") + "|" + (selected?.path ?? ""),
			active && bindingReady && !!selected,
			readFile,
			acceptFile,
			rejectBinding,
		);
	const visiblePreview = active && bindingReady ? preview : {
		...preview, value: null, pending: active && !!selected, error: "", errorCode: "",
	};
	const apply = useCallback(
		(transition: Parameters<typeof transitionSlots>[1]) => {
			const result = transitionSlots(slots, transition);
			setSlots(result.state);
			setCapReason(result.capped);
			if (result.refresh && result.state.activePath === slots.activePath)
				preview.refresh();
			return result;
		},
		[slots, preview],
	);
	const announce = useCallback(
		(transition: Parameters<typeof transitionSlots>[1], verb: string, path: string) => {
			const result = apply(transition);
			setSlotStatus(
				result.capped
					? "Six files are pinned. Unpin or close one to pin another."
					: verb + " " + displayFilePath(path),
			);
			return result;
		},
		[apply],
	);
	const file = visiblePreview.value;
	const stale = !!(
		selectedMatch &&
		file &&
		file.sha256.toLowerCase() !== selectedMatch.sha256.toLowerCase()
	);
	useEffect(() => {
		if (!stale && !visiblePreview.pending)
			matchLine.current?.scrollIntoView({
				block: "center",
				behavior: "instant",
			});
	}, [file, selectedMatch, stale, visiblePreview.pending]);
	if (folder.errorCode === "PROJECT_NOT_CONNECTED" || bindingError?.code === "PROJECT_NOT_CONNECTED") return fallback;
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
			folder={bindingError ? { ...folder, value: null, error: bindingError.message, errorCode: bindingError.code } : folder}
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
							apply({
								kind: "open",
								entry: {
									name: match.path.split("/").at(-1)!,
									path: match.path,
									kind: "file",
								},
							});
							openPreview();
						}}
					/>
				),
			}}
			preview={{
				...visiblePreview,
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
			onDirectory={(next) => {
				setSelectedMatch(null);
				setPath(next);
				apply({ kind: "directory" });
			}}
			onSelect={(entry) => {
				setSelectedMatch(null);
				apply({ kind: "open", entry });
			}}
			projectPreviews={{
				slots,
				busy: visiblePreview.pending,
				failed: !!visiblePreview.error,
				status: slotStatus,
				capped: capReason,
				capLimit: PIN_LIMIT,
				onActivate: (entry) => {
					setSelectedMatch(null);
					apply({ kind: "open", entry });
				},
				onPinActive: (entry) => {
					announce({ kind: "pin", entry }, "Pinned", entry.path);
				},
				onUnpinActive: (entry) => {
					announce({ kind: "unpin", path: entry.path }, "Unpinned", entry.path);
				},
				onClose: (entry) =>
					announce({ kind: "close", path: entry.path }, "Closed", entry.path)
						.focus,
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
