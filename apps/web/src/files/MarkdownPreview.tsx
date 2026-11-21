import {
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { authenticated, read } from "../api";
import { Markdown, type MarkdownPolicy } from "../Markdown";
import {
	classifyFilesImage,
	classifyFilesReference,
	createFilesHeadingIds,
} from "./markdown-references";

const MAX_IMAGES = 8,
	IMAGE_CONCURRENCY = 2;

/** Bounded in-flight image reads shared across one document render. */
interface ImagePool {
	inflight: number;
	queue: (() => void)[];
}
function acquireImageSlot(pool: ImagePool, task: () => Promise<void>) {
	let active = false,
		cancelled = false;
	const start = () => {
		if (cancelled) return;
		active = true;
		pool.inflight++;
		void task().finally(() => {
			pool.inflight--;
			pool.queue.shift()?.();
		});
	};
	if (pool.inflight < IMAGE_CONCURRENCY) start();
	else pool.queue.push(start);
	return () => {
		cancelled = true;
		if (!active) {
			const index = pool.queue.indexOf(start);
			if (index >= 0) pool.queue.splice(index, 1);
		}
	};
}

/** An admitted relative image renders only bytes from the bound image read;
 *  the blob URL lives exactly as long as this mounted node. */
function BoundImage({
	alt,
	path,
	pool,
	load,
}: {
	alt: string;
	path: string;
	pool: ImagePool;
	load: (path: string, signal: AbortSignal) => Promise<Blob>;
}) {
	const [state, setState] = useState<{ status: "loading" | "ready" | "failed"; url?: string }>({ status: "loading" });
	useEffect(() => {
		const controller = new AbortController();
		let url: string | undefined;
		const release = acquireImageSlot(pool, async () => {
			try {
				const blob = await load(path, controller.signal);
				if (controller.signal.aborted) return;
				url = URL.createObjectURL(blob);
				setState({ status: "ready", url });
			} catch {
				if (!controller.signal.aborted) setState({ status: "failed" });
			}
		});
		return () => {
			release();
			controller.abort();
			if (url) URL.revokeObjectURL(url);
		};
	}, [path, pool, load]);
	const label = alt || "image";
	if (state.status === "ready" && state.url)
		return <img className="files-md-image" src={state.url} alt={alt} />;
	if (state.status === "failed")
		return (
			<span className="files-image-note">
				[image: {label} — unavailable]
			</span>
		);
	return (
		<span className="files-image-note" role="status">
			[image: {label} — loading…]
		</span>
	);
}

function ImageNote({ alt, note }: { alt: string; note: string }) {
	return (
		<span className="files-image-note">
			[image: {alt || "image"} — {note}]
		</span>
	);
}

export interface FilesMarkdownPreviewProps {
	text: string;
	path: string;
	base: string;
	query: string;
	/** Identity of the accepted file payload; changes on every successful re-read. */
	revision: unknown;
	pendingFragment: string | null;
	onFragmentHandled: (found: boolean) => void;
	onNavigate: (path: string, fragment: string | null) => void;
}

/** The opt-in Files surface: local references navigate inside the active
 *  worktree, denied ones stay literal, and image bytes stay ephemeral. */
export function FilesMarkdownPreview({
	text,
	path,
	base,
	query,
	revision,
	pendingFragment,
	onFragmentHandled,
	onNavigate,
}: FilesMarkdownPreviewProps) {
	const article = useRef<HTMLDivElement>(null),
		prefix = useId().replace(/[^a-zA-Z0-9_-]/g, "") || "doc",
		[status, setStatus] = useState<string | null>(null);
	const baseDir = useMemo(() => {
		const slash = path.lastIndexOf("/");
		return slash === -1 ? "" : path.slice(0, slash);
	}, [path]);
	const ids = useMemo(() => createFilesHeadingIds("fm-" + prefix), [prefix]);
	const focusFragment = useCallback(
		(fragment: string): boolean => {
			const id = ids.lookup(fragment),
				heading = id
					? article.current?.querySelector<HTMLElement>(
							"#" + CSS.escape(id),
						)
					: undefined;
			if (!heading) {
				setStatus(`Heading “${fragment}” is not in this document.`);
				return false;
			}
			heading.focus();
			return true;
		},
		[ids],
	);
	// In-flight slots and the per-path response cache live exactly as long as
	// this accepted document revision; re-reads refetch through fresh state.
	const media = useMemo(() => {
		const pool: ImagePool = { inflight: 0, queue: [] },
			cache = new Map<string, Promise<Blob>>();
		const load = async (target: string, signal: AbortSignal) => {
			let pending = cache.get(target);
			if (!pending) {
				pending = (async () => {
					const params = new URLSearchParams(query);
					params.set("path", target);
					const response = await authenticated(() =>
						fetch(base + "/file/image?" + params, {
							credentials: "same-origin",
							cache: "no-store",
							redirect: "error",
							signal,
						}),
					);
					if (!response.ok) await read<never>(response);
					return response.blob();
				})();
				cache.set(target, pending);
			}
			return pending;
		};
		return { pool, load };
	}, [base, query, revision]);
	// Image admission is per document and first-come in render order; the sets
	// reset whenever the accepted text changes and refill as the parser runs.
	const admitted = useRef(new Set<string>()),
		excess = useRef(new Set<string>()),
		renderedText = useRef(text);
	if (renderedText.current !== text) {
		renderedText.current = text;
		admitted.current.clear();
		excess.current.clear();
	}
	const policy = useMemo<MarkdownPolicy>(
		() => ({
			headingId: (heading) => ids.issue(heading),
			link: (target, label) => {
				const reference = classifyFilesReference(target, baseDir);
				if (reference.kind === "fragment")
					return (
						<button
							type="button"
							className="files-md-reference"
							onClick={() => focusFragment(reference.fragment)}
						>
							{label}
						</button>
					);
				if (reference.kind === "file")
					return (
						<button
							type="button"
							className="files-md-reference"
							onClick={() => {
								setStatus(null);
								onNavigate(reference.path, reference.fragment);
							}}
						>
							{label}
						</button>
					);
				return <>{`[${label}](${target})`}</>;
			},
			image: (target, alt) => {
				const reference = classifyFilesImage(target, baseDir);
				if (reference.kind === "external")
					return <ImageNote alt={alt} note="external images are not fetched" />;
				if (reference.kind === "unsupported")
					return <ImageNote alt={alt} note="unsupported image type" />;
				if (reference.kind === "denied")
					return <ImageNote alt={alt} note="not allowed" />;
				const image = reference.path;
				if (!admitted.current.has(image) && !excess.current.has(image))
					(admitted.current.size < MAX_IMAGES ? admitted : excess).current.add(
						image,
					);
				if (excess.current.has(image))
					return <ImageNote alt={alt} note="too many images" />;
				return (
					<BoundImage
						alt={alt}
						path={image}
						pool={media.pool}
						load={media.load}
					/>
				);
			},
		}),
		[baseDir, ids, focusFragment, onNavigate, media],
	);
	// Cross-file heading navigation resolves once every heading id for this
	// render has been issued; a missing heading never takes focus.
	useEffect(() => {
		if (pendingFragment === null) return;
		onFragmentHandled(focusFragment(pendingFragment));
	}, [pendingFragment, focusFragment, onFragmentHandled]);
	return (
		<div className="files-preview-article" ref={article}>
			{status && (
				<p className="files-message" role="status">
					{status}
				</p>
			)}
			<Markdown text={text} policy={policy} />
		</div>
	);
}
