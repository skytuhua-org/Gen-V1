import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronRight, File, Search } from "lucide-react";
import { parseSearchPathFilter } from "../../../../packages/contracts/search-path-filter";
import {
	isComposing,
	useListNavigation,
} from "../../../../packages/ui-shell/list-navigation";
import { displayFilePath } from "./FilesView";
import { useFilesRead } from "./useFilesRead";
import {
	appendProjectSearch,
	projectSearchFilterError,
	projectSearchMatchKey,
	projectSearchQueryError,
	readProjectSearch,
	type ProjectSearchAdapter,
	type ProjectSearchMatch,
	type ProjectSearchOwner,
	type ProjectSearchPage,
} from "./project-search-api";

export interface ProjectSearchProps {
	adapter: ProjectSearchAdapter;
	owner: ProjectSearchOwner;
	active: boolean;
	refreshVersion: number;
	selected: ProjectSearchMatch | null;
	onSelect: (match: ProjectSearchMatch) => void;
}

// Canonical applied pair; a field is absent when its canonical form is blank.
type AppliedFilters = { include?: string; exclude?: string };
const canonicalFilter = (draft: string): string | null | undefined => {
	const parsed = parseSearchPathFilter(draft);
	return parsed.ok ? parsed.filter?.canonical : null;
};

export function ProjectSearch(props: ProjectSearchProps) {
	const [draft, setDraft] = useState(""),
		[query, setQuery] = useState("");
	const input = useRef<HTMLInputElement>(null),
		results = useRef<HTMLDivElement>(null),
		composing = useRef(false),
		commitTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
	useEffect(() => () => clearTimeout(commitTimer.current), []);
	const commitQuery = useCallback((value: string) => {
		clearTimeout(commitTimer.current);
		commitTimer.current = setTimeout(() => setQuery(value), 300);
	}, []);
	const id = useId(),
		error = projectSearchQueryError(query);
	const [filtersOpen, setFiltersOpen] = useState(false),
		[includeDraft, setIncludeDraft] = useState(""),
		[excludeDraft, setExcludeDraft] = useState(""),
		[includeError, setIncludeError] = useState(""),
		[excludeError, setExcludeError] = useState(""),
		[applied, setApplied] = useState<AppliedFilters>({});
	const filtersButton = useRef<HTMLButtonElement>(null),
		includeInput = useRef<HTMLInputElement>(null),
		excludeInput = useRef<HTMLInputElement>(null);
	const applyFilters = useCallback(() => {
		const nextInclude = projectSearchFilterError(includeDraft),
			nextExclude = projectSearchFilterError(excludeDraft);
		setIncludeError(nextInclude);
		setExcludeError(nextExclude);
		if (nextInclude || nextExclude) {
			(nextInclude ? includeInput : excludeInput).current?.focus();
			return;
		}
		// Equivalent canonical reapply keeps the same object: no result restart.
		setApplied((previous) => {
			const include = canonicalFilter(includeDraft) || undefined,
				exclude = canonicalFilter(excludeDraft) || undefined;
			return previous.include === include && previous.exclude === exclude
				? previous
				: { include, exclude };
		});
	}, [includeDraft, excludeDraft]);
	const clearFilters = useCallback(() => {
		setIncludeDraft("");
		setExcludeDraft("");
		setIncludeError("");
		setExcludeError("");
		setApplied({});
		includeInput.current?.focus();
	}, []);
	// Owner change resets filter drafts, errors, applied pair and disclosure
	// (scope changes already remount this component through FilesView).
	const ownerKey = JSON.stringify([props.owner.projectId, props.owner.threadId]),
		ownerRef = useRef(ownerKey);
	if (ownerRef.current !== ownerKey) {
		ownerRef.current = ownerKey;
		setIncludeDraft("");
		setExcludeDraft("");
		setIncludeError("");
		setExcludeError("");
		setApplied({});
		setFiltersOpen(false);
	}
	// Canonical comparison: a whitespace-equivalent draft is not a change.
	const unapplied =
		canonicalFilter(includeDraft) !== (applied.include ?? undefined) ||
		canonicalFilter(excludeDraft) !== (applied.exclude ?? undefined);
	const activeCount = (applied.include ? 1 : 0) + (applied.exclude ? 1 : 0),
		panelId = `${id}-filters`;
	return (
		<>
			<label className="files-filter project-search-field" htmlFor={id}>
				<span>Search project</span>
				<div>
					<Search size={14} aria-hidden="true" />
					<input
						id={id}
						ref={input}
						type="search"
						value={draft}
						placeholder="File names and text"
						autoComplete="off"
						spellCheck={false}
						aria-invalid={!!error}
						aria-describedby={error ? `${id}-error` : undefined}
						onCompositionStart={() => {
							composing.current = true;
						}}
						onCompositionEnd={(event) => {
							composing.current = false;
							clearTimeout(commitTimer.current);
							setQuery(event.currentTarget.value.trim());
						}}
						onChange={(event) => {
							setDraft(event.target.value);
							if (!composing.current) commitQuery(event.target.value);
						}}
						onKeyDown={(event) => {
							if (isComposing(event)) return;
							if (event.key === "ArrowDown") {
								event.preventDefault();
								results.current
									?.querySelector<HTMLButtonElement>(".project-search-hit")
									?.focus();
							}
							if (event.key === "Escape") {
								event.preventDefault();
								clearTimeout(commitTimer.current);
								setDraft("");
								setQuery("");
							}
						}}
					/>
				</div>
			</label>
			<div className="project-search-filters">
				<button
					ref={filtersButton}
					type="button"
					className="project-search-filters-toggle"
					aria-expanded={filtersOpen}
					aria-controls={filtersOpen ? panelId : undefined}
					onClick={() => setFiltersOpen((open) => !open)}
				>
					<ChevronRight
						size={14}
						aria-hidden="true"
						data-open={filtersOpen}
					/>
					Filters
					{activeCount > 0 && (
						<span className="project-search-filters-count">
							{activeCount} active
						</span>
					)}
					{unapplied && (
						<span className="project-search-filters-unapplied">
							Unapplied changes
						</span>
					)}
				</button>
			</div>
			{filtersOpen && (
				<div
					id={panelId}
					className="project-search-filters-panel"
					onKeyDown={(event) => {
						if (isComposing(event)) return;
						if (event.key === "Escape") {
							event.preventDefault();
							setFiltersOpen(false);
							filtersButton.current?.focus();
						}
					}}
				>
					<div className="project-search-filters-body">
						<div className="project-search-filter-fields">
							<label htmlFor={`${id}-include`}>
								<span>Include paths</span>
								<input
									id={`${id}-include`}
									ref={includeInput}
									value={includeDraft}
									placeholder="src/**/*.ts"
									autoComplete="off"
									spellCheck={false}
									aria-invalid={!!includeError}
									aria-describedby={`${id}-filters-help${includeError ? ` ${id}-include-error` : ""}`}
									onChange={(event) => {
										setIncludeDraft(event.target.value);
										if (includeError) setIncludeError("");
									}}
									onKeyDown={(event) => {
										if (isComposing(event)) return;
										if (event.key === "Enter") {
											event.preventDefault();
											applyFilters();
										}
									}}
								/>
								{includeError && (
									<span id={`${id}-include-error`} className="files-error">
										{includeError}
									</span>
								)}
							</label>
							<label htmlFor={`${id}-exclude`}>
								<span>Exclude paths</span>
								<input
									id={`${id}-exclude`}
									ref={excludeInput}
									value={excludeDraft}
									placeholder="**/*.test.ts"
									autoComplete="off"
									spellCheck={false}
									aria-invalid={!!excludeError}
									aria-describedby={`${id}-filters-help${excludeError ? ` ${id}-exclude-error` : ""}`}
									onChange={(event) => {
										setExcludeDraft(event.target.value);
										if (excludeError) setExcludeError("");
									}}
									onKeyDown={(event) => {
										if (isComposing(event)) return;
										if (event.key === "Enter") {
											event.preventDefault();
											applyFilters();
										}
									}}
								/>
								{excludeError && (
									<span id={`${id}-exclude-error`} className="files-error">
										{excludeError}
									</span>
								)}
							</label>
						</div>
						<p id={`${id}-filters-help`} className="project-search-filter-help">
							One glob per field, relative to this project. Exclude wins. Use *
							within a segment, a whole ** segment for folders and ? for one
							character.
						</p>
						<div className="project-search-filter-actions">
							<button type="button" onClick={applyFilters}>
								Apply filters
							</button>
							<button type="button" onClick={clearFilters}>
								Clear filters
							</button>
						</div>
					</div>
				</div>
			)}
			<div
				className="files-list project-search-results"
				ref={results}
				onKeyDown={(event) => {
					if (event.key === "Escape" && !isComposing(event)) {
						event.preventDefault();
						event.stopPropagation();
						input.current?.focus();
					}
				}}
			>
				{error ? (
					<p
						id={`${id}-error`}
						className="files-message files-error"
						role="status"
					>
						{error}
					</p>
				) : !query.trim() ? (
					<p className="files-message">
						Search file names and text in this project.
					</p>
				) : (
					<SearchResults
						key={JSON.stringify([
							props.owner,
							query,
							applied.include,
							applied.exclude,
						])}
						{...props}
						query={query}
						filters={applied}
					/>
				)}
			</div>
		</>
	);
}

function SearchResults({
	adapter,
	owner,
	query,
	filters,
	active,
	refreshVersion,
	selected,
	onSelect,
}: ProjectSearchProps & { query: string; filters: AppliedFilters }) {
	const accepted = useRef<ProjectSearchPage | null>(null);
	const request = useRef<{ cursor?: string }>({}),
		refresh = useRef(refreshVersion);
	if (refresh.current !== refreshVersion) {
		refresh.current = refreshVersion;
		request.current = {};
	}
	const read = useCallback(
		async (signal: AbortSignal) => {
			const cursor = request.current.cursor,
				previous = accepted.current;
			const next = await readProjectSearch(
				adapter,
				{
					owner,
					q: query,
					cursor,
					limit: 100,
					include: filters.include,
					exclude: filters.exclude,
				},
				signal,
				cursor ? (previous ?? undefined) : undefined,
			);
			return cursor && previous ? appendProjectSearch(previous, next) : next;
		},
		[
			adapter,
			owner.projectId,
			owner.threadId,
			query,
			filters.include,
			filters.exclude,
			refreshVersion,
		],
	);
	const page = useFilesRead(
		JSON.stringify([owner, query, filters.include, filters.exclude]),
		active,
		read,
	);
	accepted.current = page.value;
	const matches = active ? (page.value?.matches ?? []) : [];
	const navigation = useListNavigation(
		matches.map((match) => ({ label: match.path })),
		(index) => onSelect(matches[index]),
		() => {},
	);
	const incomplete = page.value && !page.value.complete;
	const filterCount = (filters.include ? 1 : 0) + (filters.exclude ? 1 : 0);
	return (
		<>
			<p className="project-search-summary" role="status" aria-live="polite">
				{!active
					? "Project search is paused."
					: page.pending
						? page.value
							? "Refreshing results…"
							: "Searching project…"
						: page.value
							? `${matches.length} ${matches.length === 1 ? "result" : "results"} · ${incomplete ? "Incomplete results" : page.value.nextCursor ? "More results available" : "Project files and text"}${filterCount ? ` · ${filterCount} path filter${filterCount === 1 ? "" : "s"} applied` : ""}`
							: ""}
			</p>
			{page.error && (
				<div className="files-message files-error" role="status">
					<p>{page.error}</p>
					<button type="button" onClick={page.refresh}>
						Retry search
					</button>
					{page.value && (
						<button
							type="button"
							onClick={() => {
								request.current = {};
								page.refresh();
							}}
						>
							Restart search
						</button>
					)}
				</div>
			)}
			{!page.value && page.pending && (
				<div className="files-skeleton" aria-hidden="true">
					<i />
					<i />
					<i />
				</div>
			)}
			<ul
				aria-label="Project search results"
				aria-busy={page.pending}
				onKeyDown={navigation.onKeyDown}
			>
				{matches.map((match, index) => (
					<li key={projectSearchMatchKey(match)}>
						<button
							className="project-search-hit"
							title={displayFilePath(match.path)}
							type="button"
							ref={(node) => {
								navigation.rows.current[index] = node;
							}}
							onFocus={() => navigation.onFocus(index)}
							aria-current={
								selected &&
								projectSearchMatchKey(selected) === projectSearchMatchKey(match)
									? "true"
									: undefined
							}
							onClick={() => onSelect(match)}
						>
							<File size={15} aria-hidden="true" />
							<span>
								<strong>
									{displayFilePath(match.path.split("/").at(-1)!)}
								</strong>
								<small>
									{displayFilePath(
										match.path.split("/").slice(0, -1).join("/"),
									) || "Project root"}
									{match.kind === "text"
										? ` · line ${match.line}`
										: " · File name"}
								</small>
								<span
									className={
										match.kind === "text" ? "project-search-snippet" : undefined
									}
								>
									{match.kind === "path"
										? displayFilePath(match.preview)
										: match.preview}
								</span>
							</span>
						</button>
					</li>
				))}
			</ul>
			{active &&
				page.value &&
				!page.pending &&
				!page.error &&
				!matches.length && (
					<p className="files-message">
						{incomplete
							? "No matches in the searched portion of this project."
							: filterCount
								? "No results match these path filters."
								: "No results in this project."}{" "}
						{filterCount && !incomplete
							? "Try a different search or clear the filters."
							: "Try a different file name or phrase."}
					</p>
				)}
			{active && page.value && (
				<>
					{incomplete && (
						<p className="files-message files-limit">
							Results are incomplete.{" "}
							{page.value.nextCursor && matches.length < 1000
								? "Load more to continue."
								: "Refine the query or refresh to search again."}
						</p>
					)}
					{page.value.nextCursor && matches.length < 1000 && (
						<button
							className="project-search-more"
							type="button"
							disabled={page.pending}
							onClick={() => {
								request.current = { cursor: page.value!.nextCursor! };
								page.refresh();
							}}
						>
							Load more results
						</button>
					)}
					{matches.length >= 1000 && (
						<p className="files-message">
							Showing 1,000 results. Refine your query to see fewer matches.
						</p>
					)}
					<details className="project-search-details">
						<summary>
							Search details
							{page.value.exclusions.length
								? ` · ${page.value.exclusions.length} exclusions`
								: ""}
						</summary>
						<p>Binding {page.value.owner.binding}</p>
						<p>
							Limits: {page.value.limits.files.toLocaleString()} files ·{" "}
							{page.value.limits.bytes.toLocaleString()} bytes ·{" "}
							{page.value.limits.matches} matches ·{" "}
							{page.value.limits.timeoutMs.toLocaleString()} ms ·{" "}
							{page.value.limits.fileBytes.toLocaleString()} bytes per file
						</p>
						{page.value.exclusions.map((item, index) => (
							<p key={index}>{item}</p>
						))}
						{page.value.issues.map((item, index) => (
							<p key={index}>
								{item.path ? `${displayFilePath(item.path)}: ` : ""}
								{item.reason.replaceAll("_", " ")}
							</p>
						))}
						{page.value.issuesTruncated && (
							<p>
								More issues were omitted. Refine the query or refresh to inspect
								fewer files.
							</p>
						)}
					</details>
				</>
			)}
		</>
	);
}
