import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Popover } from "../../../../packages/ui-shell/Popover";
import {
	DEFAULT_PREFERENCES,
	type UiPreferences,
} from "../../../../packages/contracts/preferences";
import { shortcutKeys, shortcutPlatform } from "../keyboard-bindings";
import { matchesShortcut } from "../shell-layout";

/** One logical source line; `end` excludes its separator, which is text[start..end] never contains one. */
interface SourceLine {
	start: number;
	end: number;
}
/** Splits on LF, CRLF or bare CR; every separator delimits exactly one logical line and a trailing separator leaves one empty last line. */
export function parseSourceLines(text: string): SourceLine[] {
	const lines: SourceLine[] = [];
	let at = 0;
	for (const match of text.matchAll(/\r\n|\r|\n/g)) {
		lines.push({ start: at, end: match.index });
		at = match.index + match[0].length;
	}
	lines.push({ start: at, end: text.length });
	return lines;
}
function clamp(value: number, low: number, high: number) {
	return Math.max(low, Math.min(high, value));
}
/** Strict whole-number parse: optional whitespace, optional sign, base-10 digits only; null rejects fractions, exponents, letters and unsafe integers. */
export function parseGoToLine(raw: string): number | null {
	const trimmed = raw.trim();
	if (!/^[+-]?\d+$/.test(trimmed)) return null;
	const value = Number(trimmed);
	return Number.isSafeInteger(value) ? value : null;
}

interface ProjectTextPreviewProps {
	text: string;
	wrap: boolean;
	onToggleWrap: () => void;
	preferences?: UiPreferences;
	/** Fresh search target: line to reveal centrally and highlight. `targetSeq` must increase per new target so repeats re-reveal. */
	targetLine?: number;
	targetSeq?: number;
}

export function ProjectTextPreview({
	text,
	wrap,
	onToggleWrap,
	preferences = DEFAULT_PREFERENCES,
	targetLine,
	targetSeq = 0,
}: ProjectTextPreviewProps) {
	const lines = useMemo(() => parseSourceLines(text), [text]);
	const scrollRef = useRef<HTMLDivElement>(null);
	const probeRef = useRef<HTMLSpanElement>(null);
	const goButtonRef = useRef<HTMLButtonElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [view, setView] = useState({ top: 0, height: 0, widthGuess: 400 });
	const [lineHeight, setLineHeight] = useState(20);
	const [charWidth, setCharWidth] = useState(8);
	const [measured, setMeasured] = useState<Map<number, number>>(new Map());
	const [selection, setSelection] = useState<{ a: number; b: number } | null>(
		null,
	);
	const [target, setTarget] = useState<number | null>(null);
	const [gotoOpen, setGotoOpen] = useState(false);
	const [gotoError, setGotoError] = useState("");
	const [status, setStatus] = useState("");
	const dragRef = useRef<{ active: boolean; anchor: number }>({
		active: false,
		anchor: 0,
	});
	const anchorRef = useRef<{ line: number; delta: number } | null>(null);
	const pendingReveal = useRef<number | null>(null);
	const measureQueue = useRef<Map<number, number>>(new Map());

	const total = lines.length;
	// Estimated height for an unmeasured row: one line no-wrap; in wrap guess by character count per row width.
	const estimate = useCallback(
		(index: number) => {
			if (!wrap) return lineHeight;
			const known = measured.get(index);
			if (known !== undefined) return known;
			const cols = Math.max(1, Math.floor((view.widthGuess ?? 1) / charWidth));
			return (
				lineHeight *
				Math.max(1, Math.ceil((lines[index]!.end - lines[index]!.start) / cols))
			);
		},
		[wrap, measured, lineHeight, charWidth, lines, view],
	);
	const { prefix, fullHeight } = useMemo(() => {
		const prefix = new Float64Array(total + 1);
		for (let i = 0; i < total; i++) prefix[i + 1] = prefix[i]! + estimate(i);
		return { prefix, fullHeight: prefix[total]! };
	}, [estimate, total]);
	const lower = useCallback(
		(offset: number) => {
			let low = 0,
				high = total;
			while (low < high) {
				const mid = (low + high) >> 1;
				if (prefix[mid + 1]! <= offset) low = mid + 1;
				else high = mid;
			}
			return low;
		},
		[prefix, total],
	);
	const overscan = Math.max(view.height, 200);
	const first = lower(Math.max(0, view.top - overscan));
	const last = Math.min(
		total - 1,
		lower(view.top + view.height + overscan - 1),
	);
	const digits = String(total).length;
	const gutterCh = Math.max(4, digits + 2);
	const reveal = useCallback(
		(line: number) => {
			const index = clamp(line, 1, total) - 1;
			const scroller = scrollRef.current;
			if (!scroller) return;
			const rowTop = prefix[index]!,
				rowHeight = Math.max(lineHeight, estimate(index)),
				top = clamp(
					rowTop + rowHeight / 2 - scroller.clientHeight / 2,
					0,
					Math.max(0, fullHeight - scroller.clientHeight),
				);
			scroller.scrollTop = top;
			setTarget(index);
			setStatus(`Line ${index + 1} of ${total}`);
			pendingReveal.current = index;
		},
		[clamp, estimate, fullHeight, lineHeight, prefix, total],
	);
	useEffect(() => {
		if (targetLine !== undefined && targetSeq) reveal(targetLine);
	}, [targetLine, targetSeq, reveal]);
	// Re-apply a pending reveal once the target row has a real measurement.
	useLayoutEffect(() => {
		const pending = pendingReveal.current;
		if (pending !== null && (!wrap || measured.has(pending))) {
			pendingReveal.current = null;
			if (wrap) reveal(pending + 1);
		}
	}, [measured, wrap, reveal]);
	// Restore the logical-line anchor after heights shift so the view does not jump.
	useLayoutEffect(() => {
		const anchor = anchorRef.current,
			scroller = scrollRef.current;
		if (anchor && scroller)
			scroller.scrollTop = prefix[anchor.line]! + anchor.delta;
	}, [prefix]);

	useEffect(() => {
		const probe = probeRef.current;
		if (probe) {
			setLineHeight(probe.offsetHeight || 20);
			setCharWidth(probe.offsetWidth / 10 || 8);
		}
	}, []);
	useEffect(() => {
		const scroller = scrollRef.current;
		if (!scroller) return;
		setView({
			top: scroller.scrollTop,
			height: scroller.clientHeight,
			widthGuess: scroller.clientWidth - gutterCh * charWidth - 20,
		});
		const observer = new ResizeObserver(() =>
			setView({
				top: scroller.scrollTop,
				height: scroller.clientHeight,
				widthGuess: scroller.clientWidth - gutterCh * charWidth - 20,
			}),
		);
		observer.observe(scroller);
		let frame = 0;
		const onScroll = () => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				anchorRef.current = {
					line: lower(scroller.scrollTop),
					delta: scroller.scrollTop - prefix[lower(scroller.scrollTop)]!,
				};
				setView({
					top: scroller.scrollTop,
					height: scroller.clientHeight,
					widthGuess: scroller.clientWidth - gutterCh * charWidth - 20,
				});
			});
		};
		scroller.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			observer.disconnect();
			scroller.removeEventListener("scroll", onScroll);
			if (frame) cancelAnimationFrame(frame);
		};
	}, [lower, prefix, gutterCh, charWidth]);
	const rowObserver = useRef<ResizeObserver | null>(null);
	useEffect(() => {
		rowObserver.current = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const element = entry.target as HTMLElement,
					index = Number(element.dataset.line);
				if (!Number.isNaN(index))
					measureQueue.current.set(index, entry.target.clientHeight);
			}
			if (measureQueue.current.size) {
				const batch = new Map(measureQueue.current);
				measureQueue.current.clear();
				setMeasured((current) => {
					const next = new Map(current);
					let changed = false;
					for (const [index, height] of batch)
						if (next.get(index) !== height) {
							next.set(index, height);
							changed = true;
						}
					return changed ? next : current;
				});
			}
		});
		return () => rowObserver.current?.disconnect();
	}, []);
	const observeRow = useCallback(
		(element: HTMLElement | null) => {
			if (!element || !rowObserver.current || !wrap) return;
			rowObserver.current.observe(element);
		},
		[wrap],
	);

	// Pointer -> source offset via the caret position inside a rendered row.
	const offsetAt = useCallback(
		(clientX: number, clientY: number): number | null => {
			const caret = (
				document as Document & {
					caretRangeFromPoint?: (
						x: number,
						y: number,
					) => Range | null;
				}
			).caretRangeFromPoint?.(clientX, clientY);
			if (!caret) return null;
			const cell = (
				caret.startContainer.nodeType === Node.ELEMENT_NODE
					? (caret.startContainer as HTMLElement)
					: caret.startContainer.parentElement
			)?.closest("[data-line]");
			if (!cell) return null;
			const index = Number((cell as HTMLElement).dataset.line),
				line = lines[index];
			if (!line) return null;
			const walker = document.createTreeWalker(
				cell,
				NodeFilter.SHOW_TEXT,
			);
			let offset = 0,
				node: Node | null;
			while ((node = walker.nextNode())) {
				if (node === caret.startContainer) {
					offset += caret.startOffset;
					break;
				}
				offset += node.textContent!.length;
			}
			return clamp(line.start + offset, line.start, line.end);
		},
		[lines],
	);
	const onPointerDown = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			const offset = offsetAt(event.clientX, event.clientY);
			if (offset === null) return;
			dragRef.current = { active: true, anchor: offset };
			setSelection({ a: offset, b: offset });
			event.currentTarget.setPointerCapture(event.pointerId);
		},
		[offsetAt],
	);
	const onPointerMove = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (!dragRef.current.active) return;
			const scroller = scrollRef.current;
			if (scroller) {
				const rect = scroller.getBoundingClientRect();
				if (event.clientY < rect.top + 24) scroller.scrollTop -= 24;
				else if (event.clientY > rect.bottom - 24) scroller.scrollTop += 24;
			}
			const offset = offsetAt(event.clientX, event.clientY);
			if (offset !== null)
				setSelection({ a: dragRef.current.anchor, b: offset });
		},
		[offsetAt],
	);
	const endDrag = useCallback(() => {
		dragRef.current.active = false;
		setSelection((current) =>
			current && current.a === current.b ? null : current,
		);
	}, []);
	const onCopy = useCallback(
		(event: React.ClipboardEvent<HTMLDivElement>) => {
			if (!selection) return;
			const [low, high] =
				selection.a <= selection.b
					? [selection.a, selection.b]
					: [selection.b, selection.a];
			event.clipboardData.setData("text/plain", text.slice(low, high));
			event.preventDefault();
		},
		[selection, text],
	);
	const selectedRange =
		selection &&
		(selection.a <= selection.b
			? ([selection.a, selection.b] as const)
			: ([selection.b, selection.a] as const));

	const goChord = preferences.keybindings.filesGoToLine;
	const onKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			if (event.nativeEvent.isComposing) return;
			if (matchesShortcut(event.nativeEvent, goChord)) {
				event.preventDefault();
				setGotoError("");
				setGotoOpen(true);
				return;
			}
			if (
				event.nativeEvent.key === "a" &&
				(event.nativeEvent.ctrlKey || event.nativeEvent.metaKey)
			) {
				event.preventDefault();
				setSelection({ a: 0, b: text.length });
			}
		},
		[goChord, text],
	);
	const submitGo = useCallback(
		(raw: string) => {
			const value = parseGoToLine(raw);
			if (value === null) {
				setGotoError("Enter a whole line number.");
				inputRef.current?.focus();
				return;
			}
			const line = clamp(value, 1, total);
			reveal(line);
			setGotoOpen(false);
			scrollRef.current?.focus();
		},
		[reveal, total],
	);

	const rows = [];
	for (let index = first; index <= last; index++) {
		const line = lines[index]!,
			content = text.slice(line.start, line.end),
			sel =
				selectedRange &&
				line.end >= selectedRange[0] &&
				line.start <= selectedRange[1]
					? ([
							Math.max(line.start, selectedRange[0]) - line.start,
							Math.min(line.end, selectedRange[1]) - line.start,
						] as const)
					: null;
		rows.push(
			<div
				key={index}
				ref={wrap ? observeRow : undefined}
				className="files-text-row"
				data-line={index}
				data-target={target === index ? "true" : undefined}
			>
				<span className="files-text-gutter" aria-hidden="true">
					{index + 1}
					{"\u00a0"}
				</span>
				<span
					className={
						target === index
							? "files-text-cell files-matching-line"
							: "files-text-cell"
					}
				>
					{sel ? (
						<>
							{content.slice(0, sel[0])}
							<mark className="files-text-selection">
								{content.slice(sel[0], sel[1])}
							</mark>
							{content.slice(sel[1])}
						</>
					) : (
						content
					)}
					{content === "" ? "\u00a0" : null}
				</span>
			</div>,
		);
	}
	return (
		<div
			className="files-text-preview"
			data-wrap={wrap ? "true" : "false"}
			onKeyDown={onKeyDown}
			onCopy={onCopy}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={endDrag}
		>
			<div className="files-text-toolbar">
				<button
					type="button"
					aria-label="Wrap lines"
					aria-pressed={wrap}
					onClick={onToggleWrap}
				>
					Wrap
				</button>
				<button
					type="button"
					ref={goButtonRef}
					aria-label="Go to line"
					aria-keyshortcuts={goChord}
					title={`Go to line (${shortcutKeys(goChord, shortcutPlatform())})`}
					onClick={() => {
						setGotoError("");
						setGotoOpen((open) => !open);
					}}
				>
					Go to line
				</button>
			</div>
			<div
				ref={scrollRef}
				className="files-text-lines"
				role="region"
				aria-label="Numbered file text"
				tabIndex={0}
				style={{ "--files-gutter-ch": `${gutterCh}ch` } as React.CSSProperties}
			>
				<span
					ref={probeRef}
					className="files-text-cell files-text-probe"
					aria-hidden="true"
				>
					0000000000
				</span>
				<div style={{ height: prefix[first]! }} aria-hidden="true" />
				{rows}
				<div
					style={{ height: Math.max(0, fullHeight - prefix[last + 1]!) }}
					aria-hidden="true"
				/>
			</div>
			<span className="sr-only" role="status" aria-live="polite">
				{status}
			</span>
			<Popover
				anchor={goButtonRef}
				initialFocus={inputRef}
				open={gotoOpen}
				width={240}
				height={gotoError ? 190 : 164}
				preferredSide="below"
				align="end"
				onDismiss={() => setGotoOpen(false)}
				className="ui-control-popup files-goto-popover"
			>
				<form
					key={`${gotoOpen ? "open" : "closed"}-${target ?? -1}-${first}`}
					onSubmit={(event) => {
						event.preventDefault();
						submitGo(inputRef.current?.value ?? "");
					}}
				>
					<strong>Go to line</strong>
					<label htmlFor="files-goto-input">Line number</label>
					<input
						id="files-goto-input"
						ref={inputRef}
						inputMode="numeric"
						autoComplete="off"
						defaultValue={target !== null ? String(target + 1) : String(first + 1)}
						aria-describedby="files-goto-helper files-goto-error"
					/>
					<small id="files-goto-helper">Line 1 to {total}</small>
					{gotoError && (
						<small id="files-goto-error" role="alert">
							{gotoError}
						</small>
					)}
					<footer>
						<button type="button" onClick={() => setGotoOpen(false)}>
							Cancel
						</button>
						<button type="submit">Go</button>
					</footer>
				</form>
			</Popover>
		</div>
	);
}
