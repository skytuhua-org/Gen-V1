import {
	Fragment,
	useCallback,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { authenticated, read } from "../api";
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
// Copy uses the raw path; only ordinary single-line relative paths are eligible.
const copyablePath = (path: string) =>
	!!path &&
	!/[\\:\x00-\x1f\x7f\u2028\u2029]/.test(path) &&
	path
		.split("/")
		.every(
			(segment) => segment !== "" && segment !== "." && segment !== "..",
		);
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
	const bindingRef = useRef(bindingId);
	const adoptBinding = useCallback(
		(observed: string | undefined, folderResponse: boolean) => {
			if (typeof observed !== "string" || !observed)
				throw new Error("Checkout binding is unavailable.");
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
					throw new Error("Checkout binding changed.");
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
			)
				.then(read<ProjectFolder>)
				.then((data) => {
					adoptBinding(data.bindingId, true);
					return data;
				});
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
			)
				.then(read<ProjectFile>)
				.then((data) => {
					adoptBinding(data.bindingId, false);
					return data;
				});
		},
		[base, query, selected?.path],
	);
	const folder = useFilesRead(
			(bindingId ?? "") + "|" + path,
			active,
			readFolder,
		),
		preview = useFilesRead(
			(bindingId ?? "") + "|" + (selected?.path ?? ""),
			active && !!selected,
			readFile,
		);
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
	if (folder.errorCode === "PROJECT_NOT_CONNECTED") return fallback;
	const line =
		selectedMatch?.kind === "text" && !stale ? selectedMatch.line : undefined;
	const lines =
		line && file?.text ? file.text.split(/(\r\n|\r|\n)/) : undefined;
	const lineIndex = line ? (line - 1) * 2 : -1;
	const copyTarget =
		active &&
		selected &&
		file &&
		!preview.pending &&
		!preview.error &&
		copyablePath(selected.path)
			? selectedMatch?.kind === "text" &&
				selectedMatch.path === selected.path &&
				!stale &&
				!file.binary &&
				!!file.text &&
				line &&
				lines &&
				lineIndex >= 0 &&
				lineIndex < lines.length
				? {
						text: `${selected.path}:${line}`,
						label: "Copy file reference",
					}
				: { text: selected.path, label: "Copy relative path" }
			: undefined;
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
			copyTarget={copyTarget}
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
				busy: preview.pending,
				failed: !!preview.error,
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
