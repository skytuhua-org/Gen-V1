const diffLineKind = (line: string) =>
	line.startsWith("@@")
		? "hunk"
		: line.startsWith("+")
			? "add"
			: line.startsWith("-")
				? "remove"
				: "context";

/** Shared unified-patch presentation. `trimHeaders` drops ---/+++ file headers (checkpoint style); committed patches stay verbatim. */
export function UnifiedDiff({
	diff,
	trimHeaders = false,
}: {
	diff: string;
	trimHeaders?: boolean;
}) {
	const all = diff.split("\n"),
		firstHunk = all.findIndex((line) => line.startsWith("@@"));
	const headerEnd = firstHunk === -1 ? Math.min(2, all.length) : firstHunk;
	const lines = trimHeaders
		? all.filter(
				(line, index) =>
					index >= headerEnd ||
					!(line.startsWith("--- ") || line.startsWith("+++ ")),
			)
		: all;
	if (!lines.some((line) => line.trim()))
		return (
			<pre className="unified-diff">
				<span data-kind="context">No differences.</span>
			</pre>
		);
	return (
		<pre className="unified-diff">
			{lines.map((line, index) => (
				<span key={index} data-kind={diffLineKind(line)}>
					{line || " "}
					{"\n"}
				</span>
			))}
		</pre>
	);
}
