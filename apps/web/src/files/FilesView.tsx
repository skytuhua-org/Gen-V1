import {
	useId,
	useLayoutEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";
import {
	ArrowLeft,
	ChevronRight,
	File,
	Folder,
	PanelLeft,
	Pin,
	PinOff,
	RefreshCw,
	Search,
	X,
} from "lucide-react";
import { Select } from "../../../../packages/ui-shell/Select";
import { CopyButton } from "../CopyButton";
import type { FilesRead } from "./useFilesRead";
import {
	slotItems,
	slotLabels,
	type PreviewSlots,
	type SlotResult,
} from "./pinned-previews";
import "./files.css";

const byteCount = new Intl.NumberFormat();

// Keep file identity raw for reads; render invisible filename characters explicitly.
export function displayFilePath(path: string): string {
	return path.replace(/[\x01-\x1f\x7f]/g, (character) =>
		character === "\t"
			? "\\t"
			: character === "\n"
				? "\\n"
				: character === "\r"
					? "\\r"
					: `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`,
	);
}

export interface FilesEntry {
	name: string;
	path: string;
	kind: string;
	bytes?: number;
}
export interface ProjectPreviews {
	slots: PreviewSlots;
	busy: boolean;
	failed: boolean;
	status: string;
	capped: boolean;
	capLimit: number;
	onActivate: (entry: FilesEntry) => void;
	onPinActive: (entry: FilesEntry) => void;
	onUnpinActive: (entry: FilesEntry) => void;
	onClose: (entry: FilesEntry) => SlotResult["focus"];
}
export function FilesView({
	source,
	rootLabel,
	path,
	folder,
	selected,
	preview,
	selector,
	download,
	copyTarget,
	limitNote,
	projectSearch,
	projectPreviews,
	onDirectory,
	onSelect,
	onRefresh,
	onRetryFolder,
	onRetryFile,
}: {
	source: "project" | "granted";
	rootLabel: string;
	path: string;
	folder: FilesRead<{ entries: FilesEntry[] }>;
	selected: FilesEntry | null;
	preview: FilesRead<unknown> & { body: ReactNode };
	selector?: ReactNode;
	download?: string;
	copyTarget?: { text: string; label: string };
	limitNote?: string;
	projectSearch?: {
		available: boolean;
		body: (openPreview: () => void) => ReactNode;
	};
	projectPreviews?: ProjectPreviews;
	onDirectory: (path: string) => void;
	onSelect: (entry: FilesEntry) => void;
	onRefresh: () => void;
	onRetryFolder: () => void;
	onRetryFile: () => void;
}) {
	const previewElement = useRef<HTMLElement>(null),
		previewFocusRequested = useRef(false);
	useLayoutEffect(() => {
		if (previewFocusRequested.current) {
			previewElement.current?.focus({ preventScroll: true });
			previewFocusRequested.current = false;
		}
	});
	const [filter, setFilter] = useState(""),
		[treeOpen, setTreeOpen] = useState(true),
		[scope, setScope] = useState("folder"),
		listId = useId(),
		filterId = useId();
	const entries = folder.value?.entries ?? [],
		visible = entries.filter((entry) =>
			entry.name.toLowerCase().includes(filter.toLowerCase()),
		);
	const directory = (next: string) => {
		setFilter("");
		setTreeOpen(true);
		onDirectory(next);
	};
	const openPreview = () => {
		previewFocusRequested.current = true;
		setTreeOpen(false);
	};
	const slots = projectPreviews?.slots,
		stripItems = slots ? slotItems(slots) : [],
		stripLabels = slots ? slotLabels(slots) : new Map();
	const selectRefs = useRef<(HTMLButtonElement | null)[]>([]),
		lastFocusedPath = useRef<string | null>(null),
		pendingSlotFocus = useRef<SlotResult["focus"]>(null),
		stripRef = useRef<HTMLDivElement>(null),
		emptyFocusRef = useRef<HTMLDivElement>(null);
	const rovingIndex = (() => {
		const active = stripItems.findIndex(
			(item) => item.entry.path === slots?.activePath,
		);
		if (active >= 0) return active;
		const last = stripItems.findIndex(
			(item) => item.entry.path === lastFocusedPath.current,
		);
		return last >= 0 ? last : 0;
	})();
	useLayoutEffect(() => {
		const focus = pendingSlotFocus.current;
		pendingSlotFocus.current = null;
		if (!focus) return;
		if (focus.kind === "empty") {
			emptyFocusRef.current?.focus({ preventScroll: true });
			return;
		}
		const target = selectRefs.current[focus.index];
		target?.focus({ preventScroll: true });
		target?.scrollIntoView({ block: "nearest", inline: "nearest" });
	});
	const moveRoving = (from: number, delta: number | "first" | "last") => {
		const count = stripItems.length;
		if (!count) return;
		const index =
			delta === "first"
				? 0
				: delta === "last"
					? count - 1
					: (from + delta + count) % count;
		const target = selectRefs.current[index];
		target?.focus({ preventScroll: true });
		target?.scrollIntoView({ block: "nearest", inline: "nearest" });
	};
	const stripKeyDown = (index: number) => (event: React.KeyboardEvent) => {
		if (event.nativeEvent.isComposing || event.ctrlKey || event.metaKey || event.altKey)
			return;
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			moveRoving(index, -1);
		} else if (event.key === "ArrowRight") {
			event.preventDefault();
			moveRoving(index, 1);
		} else if (event.key === "Home") {
			event.preventDefault();
			moveRoving(index, "first");
		} else if (event.key === "End") {
			event.preventDefault();
			moveRoving(index, "last");
		} else if (event.key === "Delete") {
			event.preventDefault();
			const item = stripItems[index];
			if (item && projectPreviews)
				pendingSlotFocus.current = projectPreviews.onClose(item.entry);
		}
	};
	const activePinned = !!slots?.pins.some(
		(entry) => entry.path === slots.activePath,
	);
	const parts = path.split("/").filter(Boolean);
	return (
		<div
			className={`files-surface ${source === "project" ? "live-files" : "granted-files"}`}
		>
			<div className="files-toolbar panel-toolbar">
				{selector ?? <strong>Project files</strong>}
				<div className="files-actions">
					<button
						className="files-tree-toggle"
						type="button"
						aria-label="Toggle file list"
						aria-controls={listId}
						aria-expanded={treeOpen}
						onClick={() => setTreeOpen((value) => !value)}
					>
						<PanelLeft size={15} />
						<span>Files</span>
					</button>
					<button
						type="button"
						aria-label={
							source === "project" ? "Refresh" : "Refresh granted files"
						}
						onClick={onRefresh}
					>
						<RefreshCw size={14} />
						<span>Refresh</span>
					</button>
				</div>
				<nav className="files-breadcrumb" aria-label="Folder breadcrumb">
					<button
						type="button"
						aria-label="Parent directory"
						disabled={!path}
						onClick={() => directory(parts.slice(0, -1).join("/"))}
					>
						<ArrowLeft size={14} />
					</button>
					<button
						type="button"
						onClick={() => directory("")}
						aria-current={!path ? "location" : undefined}
					>
						{rootLabel}
					</button>
					{parts.map((part, index) => (
						<span key={parts.slice(0, index + 1).join("/")}>
							<ChevronRight size={12} />
							<button
								type="button"
								aria-current={
									index === parts.length - 1 ? "location" : undefined
								}
								onClick={() => directory(parts.slice(0, index + 1).join("/"))}
							>
								{displayFilePath(part)}
							</button>
						</span>
					))}
				</nav>
			</div>
			<div
				className="files-content"
				data-tree-open={treeOpen}
				data-project-search={scope === "project"}
				data-selected={!!selected}
				data-has-slots={stripItems.length > 0}
			>
				<nav
					className="files-directory"
					id={listId}
					aria-label={source === "project" ? "Project files" : "Granted files"}
					aria-busy={folder.pending}
				>
					{projectSearch && (
						<div className="files-search-scope">
							<Select
								aria-label="Search scope"
								value={scope}
								onValueChange={setScope}
								options={[
									{ value: "folder", label: "This folder" },
									{
										value: "project",
										label: projectSearch.available
											? "Project"
											: "Project (unavailable)",
										disabled: !projectSearch.available,
									},
								]}
							/>
							{!projectSearch.available && (
								<small>
									Project search is unavailable until the search service is
									connected.
								</small>
							)}
						</div>
					)}
					{projectSearch && scope === "project" ? (
						projectSearch.body(openPreview)
					) : (
						<>
							<label className="files-filter" htmlFor={filterId}>
								<span>Filter this folder</span>
								<div>
									<Search size={14} />
									<input
										id={filterId}
										type="search"
										value={filter}
										onChange={(event) => setFilter(event.target.value)}
										placeholder="File or folder name"
										title="Filters only entries returned for this folder"
									/>
								</div>
							</label>
							<div
								className="files-list"
								tabIndex={0}
								aria-label="Folder entries"
							>
								{folder.pending && (
									<p className="files-message" role="status">
										{folder.value ? "Refreshing…" : "Loading…"}
									</p>
								)}
								{folder.error && (
									<div className="files-message files-error" role="status">
										<p>{folder.error}</p>
										<button type="button" onClick={onRetryFolder}>
											Retry
										</button>
									</div>
								)}
								{!folder.value && folder.pending && (
									<div className="files-skeleton" aria-hidden="true">
										<i />
										<i />
										<i />
									</div>
								)}
								<ul>
									{visible.map((entry) => (
										<li key={entry.path}>
											<button
												type="button"
												title={displayFilePath(entry.path)}
												aria-label={displayFilePath(entry.name)}
												aria-current={
													selected?.path === entry.path ? "true" : undefined
												}
												onClick={() => {
													if (entry.kind === "directory") directory(entry.path);
													else {
														onSelect(entry);
														openPreview();
													}
												}}
											>
												{entry.kind === "directory" ? (
													<Folder size={15} />
												) : (
													<File size={15} />
												)}
												<span>{displayFilePath(entry.name)}</span>{entry.kind === "file" && /\.(ts|tsx|md|mdx)$/i.test(entry.name) && <span aria-hidden="true" className={`file-type file-type-${/\.mdx?$/i.test(entry.name) ? "md" : "ts"}`}>{/\.mdx?$/i.test(entry.name) ? "MD" : "TS"}</span>}
												{entry.kind === "directory" ? (
													<ChevronRight size={12} />
												) : entry.bytes !== undefined ? (
													<small>
														{byteCount.format(entry.bytes)} B
													</small>
												) : null}
											</button>
										</li>
									))}
								</ul>
								{folder.value &&
									!folder.pending &&
									!folder.error &&
									visible.length === 0 && (
										<p className="files-message">
											{filter
												? "No matches."
												: "Folder is empty."}
										</p>
									)}
								{limitNote && (
									<p className="files-message files-limit">{limitNote}</p>
								)}
							</div>
						</>
					)}
				</nav>
				<section
					className="files-preview"
					ref={previewElement}
					tabIndex={-1}
					aria-label="File content"
					aria-busy={preview.pending}
				>
					{projectPreviews && stripItems.length > 0 && (
						<div
							className="files-preview-strip"
							role="toolbar"
							aria-label="Open project file previews"
							ref={stripRef}
						>
							{stripItems.map((item, index) => {
								const label = stripLabels.get(item.entry.path),
									isActive = item.entry.path === slots?.activePath;
								return (
									<div
										key={item.entry.path}
										className={`files-preview-slot${item.pinned ? "" : " files-preview-slot-transient"}`}
										data-active={isActive || undefined}
									>
										{!item.pinned && !!slots?.pins.length && (
											<i
												className="files-preview-separator"
												aria-hidden="true"
											/>
										)}
										<button
											type="button"
											className="files-preview-slot-select"
											ref={(element) => {
												selectRefs.current[index] = element;
											}}
											tabIndex={rovingIndex === index ? 0 : -1}
											aria-current={isActive || undefined}
											aria-busy={
												isActive && projectPreviews.busy ? true : undefined
											}
											aria-label={
												"Open " +
												displayFilePath(item.entry.path) +
												(item.pinned ? ", pinned" : ", preview")
											}
											title={displayFilePath(item.entry.path)}
											onClick={() => {
												projectPreviews.onActivate(item.entry);
												openPreview();
											}}
											onKeyDown={stripKeyDown(index)}
											onFocus={() => {
												lastFocusedPath.current = item.entry.path;
											}}
										>
											{item.pinned ? (
												<Pin size={14} aria-hidden="true" />
											) : (
												<File size={14} aria-hidden="true" />
											)}
											<span className="files-preview-slot-name">
												{displayFilePath(label?.primary ?? item.entry.name)}
												{label?.parent !== null &&
													label?.parent !== undefined && (
														<small>
															{" · " + displayFilePath(label.parent)}
														</small>
													)}
											</span>
											{isActive && projectPreviews.failed && (
												<small className="files-slot-error">Unavailable</small>
											)}
										</button>
										<button
											type="button"
											className="files-preview-slot-close"
											aria-label={
												"Close " + displayFilePath(item.entry.path)
											}
											onClick={() => {
												pendingSlotFocus.current = projectPreviews.onClose(
													item.entry,
												);
											}}
										>
											<X size={14} aria-hidden="true" />
										</button>
									</div>
								);
							})}
							<p className="files-slot-status" role="status" aria-live="polite" aria-atomic="true">
								{projectPreviews.status}
							</p>
						</div>
					)}
					{selected ? (
						<>
							<header>
								<strong title={displayFilePath(selected.path)}>
									{displayFilePath(selected.name)}
								</strong>
								{projectPreviews && slots && (
									<>
										<button
											type="button"
											className="files-pin-toggle"
											aria-pressed={activePinned}
											aria-disabled={
												!activePinned &&
												slots.pins.length >= projectPreviews.capLimit
													? true
													: undefined
											}
											aria-label={
												(activePinned ? "Unpin " : "Pin ") +
												displayFilePath(selected.path)
											}
											aria-describedby={
												projectPreviews.capped ? "files-pin-cap" : undefined
											}
											onClick={() =>
												activePinned
													? projectPreviews.onUnpinActive(selected)
													: projectPreviews.onPinActive(selected)
											}
										>
											{activePinned ? (
												<PinOff size={14} aria-hidden="true" />
											) : (
												<Pin size={14} aria-hidden="true" />
											)}
											<span>{activePinned ? "Unpin" : "Pin"}</span>
										</button>
										<small className="files-pin-count">
											{slots.pins.length + "/" + projectPreviews.capLimit + " pinned"}
										</small>
										{projectPreviews.capped && (
											<small id="files-pin-cap" className="files-pin-cap">
												Six files are pinned. Unpin or close one to pin
												another.
											</small>
										)}
									</>
								)}
								<span className="files-preview-actions">
									{download && (
										<a href={download} download={selected.name}>
											Download
										</a>
									)}
									{source === "project" && copyTarget && (
										<CopyButton
											text={copyTarget.text}
											label={copyTarget.label}
											failureMessage="Copy failed. Try again."
										/>
									)}
								</span>
							</header>
							<div
								className="files-preview-content"
								tabIndex={0}
								aria-label="File preview"
							>
								{preview.pending && (
									<p className="files-message" role="status">
										{preview.value ? "Refreshing…" : "Loading…"}
									</p>
								)}
								{preview.error && (
									<div className="files-message files-error" role="status">
										<p>{preview.error}</p>
										<button type="button" onClick={onRetryFile}>
											Retry
										</button>
									</div>
								)}
								{!preview.value && preview.pending && (
									<div className="files-skeleton" aria-hidden="true">
										<i />
										<i />
										<i />
									</div>
								)}
								{preview.body}
							</div>
						</>
					) : (
						<div
							className="files-message files-unselected"
							ref={emptyFocusRef}
							tabIndex={-1}
						>
							<File size={22} />
							<strong>Choose a file</strong>
							{source === "project" && <p>Shows current working copy content.</p>}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
