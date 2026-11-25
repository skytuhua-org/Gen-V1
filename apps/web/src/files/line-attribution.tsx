import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { History } from "lucide-react";
import { ApiError, authenticated, csrfToken, read } from "../api";
import { CopyButton } from "../CopyButton";
import {
	lineAttributionResultSchema,
	type LineAttributionResult,
} from "../../../../packages/contracts/file-line-attribution.ts";

// Pick mode maps a pointer Y to a logical row of the unwrapped preview: rows
// above the text, past the last line and degenerate heights map to no pick.
export function previewLineFromPointer(
	clientY: number,
	preTop: number,
	paddingTop: number,
	lineHeight: number,
	lineCount: number,
): number | null {
	if (!Number.isFinite(lineHeight) || lineHeight <= 0 || lineCount < 1) return null;
	const row = Math.floor((clientY - preTop - paddingTop) / lineHeight) + 1;
	return row >= 1 && row <= lineCount ? row : null;
}

// Additive /file preview metadata; absent on older hosts.
export type FileLineAttribution =
	| { kind: "eligible"; previewProof: string; lineCount: number }
	| { kind: "unavailable"; reason: string };

const REASON_COPY: Record<string, string> = {
	stale: "This preview is out of date. Refresh it before looking up a line.",
	changed:
		"This file differs from HEAD. Attribution is only available for an exact checked-in version.",
	untracked: "This path is not tracked at HEAD.",
	binary: "Binary files do not have line attribution.",
	unsupported_text:
		"Attribution requires UTF-8 text with LF or CRLF line endings.",
	empty: "This file has no lines to look up.",
	preview_limit: "This preview is too large for line attribution.",
	history_unavailable: "This checkout does not have usable local Git history.",
	line_unavailable: "That line is not available in this preview.",
	busy: "Line attribution is busy.",
	timeout: "The line lookup timed out.",
	unavailable: "Could not look up this line.",
};
const REVOKED_COPY = "This project or working copy is no longer available.";
const retryable = (reason: string) =>
	reason === "busy" || reason === "timeout" || reason === "unavailable";

export async function lookupLineAttribution(
	base: string,
	threadId: string | null,
	input: { path: string; previewSha256: string; previewProof: string; line: number },
	signal: AbortSignal,
): Promise<LineAttributionResult> {
	const response = await authenticated(() =>
		fetch(base + "/file/line-attribution", {
			method: "POST",
			credentials: "same-origin",
			cache: "no-store",
			signal,
			headers: { "Content-Type": "application/json", "x-harness-csrf": csrfToken },
			body: JSON.stringify({
				...(threadId ? { threadId } : {}),
				path: input.path,
				previewSha256: input.previewSha256,
				previewProof: input.previewProof,
				line: input.line,
			}),
		}),
	).then(read<unknown>);
	const parsed = lineAttributionResultSchema.safeParse(response);
	if (!parsed.success)
		throw new ApiError("INVALID_RESPONSE", "The host returned an unexpected response.");
	return parsed.data;
}

type Outcome =
	| { state: "idle" }
	| { state: "pending"; line: number }
	| {
			state: "result";
			line: number;
			result: LineAttributionResult | { kind: "unavailable"; reason: string };
			revoked?: boolean;
	  };

interface LineAttributionOptions {
	/** The host advertised eligibility AND the browser line model agrees. */
	eligible: boolean;
	/** Reason shown when the control opens to a read-only explanation. */
	reason: string;
	lineCount: number;
	/** Identity of the accepted read; any change closes and fences the inspector. */
	fence: string;
	preferredLine?: number;
	lookup: (line: number, signal: AbortSignal) => Promise<LineAttributionResult>;
	onLine: (line: number | null) => void;
	onRefreshPreview: () => void;
}
export function useLineAttribution({
	eligible,
	reason,
	lineCount,
	preferredLine,
	lookup,
	onLine,
	onRefreshPreview,
	fence,
}: LineAttributionOptions): {
	open: boolean;
	setOpen: (open: boolean) => void;
	pick: (line: number) => void;
	action: ReactNode;
	inspector: ReactNode;
} {
	const [open, setOpen] = useState(false),
		[entry, setEntry] = useState(String(preferredLine ?? 1)),
		[fieldError, setFieldError] = useState(""),
		[outcome, setOutcome] = useState<Outcome>({ state: "idle" });
	const generation = useRef(0),
		controller = useRef<AbortController | null>(null),
		buttonRef = useRef<HTMLButtonElement>(null),
		fieldRef = useRef<HTMLInputElement>(null),
		inspectorId = useId(),
		fieldId = useId(),
		liveId = useId();
	// Callers may pass a fresh callback each render; only the latest is invoked.
	const onLineRef = useRef(onLine);
	useEffect(() => {
		onLineRef.current = onLine;
	});
	const abort = useCallback(() => {
		generation.current++;
		controller.current?.abort();
		controller.current = null;
	}, []);
	const clearAttribution = useCallback(() => {
		abort();
		setOutcome({ state: "idle" });
		onLineRef.current(null);
	}, [abort]);
	const close = useCallback(
		(restoreFocus = true) => {
			clearAttribution();
			setOpen(false);
			if (restoreFocus) buttonRef.current?.focus();
		},
		[clearAttribution],
	);
	const submit = useCallback(
		(line: number) => {
			if (outcome.state === "pending" && outcome.line === line) return;
			const captured = ++generation.current;
			controller.current?.abort();
			const request = new AbortController();
			controller.current = request;
			setOutcome({ state: "pending", line });
			onLineRef.current(line);
			lookup(line, request.signal)
				.then((result) => {
					if (generation.current !== captured || request.signal.aborted) return;
					setOutcome({ state: "result", line, result });
				})
				.catch((cause: unknown) => {
					if (generation.current !== captured || request.signal.aborted) return;
					const code = cause instanceof ApiError ? cause.code : "";
					setOutcome(
						["UNAUTHORIZED", "CAPABILITY_DENIED", "PROJECT_NOT_CONNECTED"].includes(code)
							? { state: "result", line, result: { kind: "unavailable", reason: "unavailable" }, revoked: true }
							: { state: "result", line, result: { kind: "unavailable", reason: "unavailable" } },
					);
				});
		},
		[lookup, outcome],
	);
	const pick = useCallback(
		(line: number) => {
			setEntry(String(line));
			setFieldError("");
			submit(line);
		},
		[submit],
	);
	const submitEntry = () => {
		if (!/^\d+$/.test(entry) || +entry < 1 || +entry > lineCount) {
			setFieldError(`Enter a line from 1 to ${lineCount}.`);
			return;
		}
		setFieldError("");
		submit(+entry);
	};
	useEffect(() => {
		if (open) fieldRef.current?.select();
	}, [open]);
	useEffect(
		() => () => {
			abort();
			onLineRef.current(null);
		},
		[abort],
	);
	// Navigation, refresh start, selection loss and a new accepted read all
	// invalidate synchronously; nothing from a previous fence may commit.
	useEffect(() => {
		abort();
		setOutcome({ state: "idle" });
		setFieldError("");
		onLineRef.current(null);
		setOpen(false);
	}, [fence, abort]);
	const pending = outcome.state === "pending";
	const result = outcome.state === "result" ? outcome : null;
	const action = (
		<button
			ref={buttonRef}
			type="button"
			className="files-attribution-toggle"
			aria-expanded={open}
			aria-controls={inspectorId}
			onClick={() => (open ? close(false) : setOpen(true))}
		>
			<History size={14} aria-hidden="true" />
			<span>Line attribution</span>
		</button>
	);
	const inspector = !open ? null : (
		<div
			className="files-attribution"
			id={inspectorId}
			onKeyDown={(event) => {
				if (event.key === "Escape") {
					event.stopPropagation();
					close();
				}
			}}
		>
			{eligible ? (
				<>
					<div className="files-attribution-controls">
						<label htmlFor={fieldId}>Line</label>
						<input
							id={fieldId}
							ref={fieldRef}
							inputMode="numeric"
							autoComplete="off"
							value={entry}
							onChange={(event) => {
								setEntry(event.target.value);
								setFieldError("");
								if (outcome.state !== "idle") clearAttribution();
							}}
							onKeyDown={(event) => {
								if (event.key === "Enter") submitEntry();
							}}
						/>
						<button type="button" onClick={submitEntry}>
							Look up
						</button>
					</div>
					<p className="files-attribution-hint" id={`${inspectorId}-hint`}>
						{pending
							? `Looking up line ${outcome.line}…`
							: "Choose a line in the preview or enter its number."}
					</p>
					{fieldError && (
						<p className="files-attribution-error" role="alert">
							{fieldError}
						</p>
					)}
				</>
			) : (
				<p className="files-attribution-hint">
					{REASON_COPY[reason] ?? REASON_COPY.unavailable}
				</p>
			)}
			<div className="files-attribution-outcome" aria-busy={pending} aria-describedby={liveId}>
				{result?.result.kind === "attributed" && (
					<div className="files-attribution-result">
						<strong>Line {result.line}</strong>
						<code className="files-attribution-sha">{result.result.sha.slice(0, 8)}</code>
						<CopyButton text={result.result.sha} label="Copy SHA" />
						<bdi className="files-attribution-author">{result.result.author}</bdi>
						<time dateTime={result.result.authorDateUtc}>
							{result.result.authorDateUtc.slice(0, 10)} UTC
						</time>
						<p className="files-attribution-subject">
							<bdi>{result.result.subject}</bdi>
						</p>
					</div>
				)}
				{result?.result.kind === "unavailable" && (
					<div className="files-attribution-result">
						<strong>Line {result.line}</strong>
						<p className="files-attribution-hint">
							{result.revoked
								? REVOKED_COPY
								: (REASON_COPY[result.result.reason] ?? REASON_COPY.unavailable)}
						</p>
						{!result.revoked && result.result.reason === "stale" && (
							<button
								type="button"
								onClick={() => {
									onRefreshPreview();
									close(false);
								}}
							>
								Refresh preview
							</button>
						)}
						{!result.revoked && retryable(result.result.reason) && (
							<button type="button" onClick={() => submit(result.line)}>
								Retry
							</button>
						)}
					</div>
				)}
			</div>
			<span className="sr-only" role="status" id={liveId}>
				{pending
					? `Looking up line ${outcome.line}`
					: result?.result.kind === "attributed"
						? `Line ${result.line} last changed in commit ${result.result.sha}`
						: result?.result.kind === "unavailable"
							? (REASON_COPY[result.result.reason] ?? REASON_COPY.unavailable)
							: ""}
			</span>
		</div>
	);
	return { open, setOpen: (next) => (next ? setOpen(true) : close(false)), pick, action, inspector };
}
