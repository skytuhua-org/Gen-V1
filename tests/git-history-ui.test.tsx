import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { FileCheckpoints } from "../apps/web/src/FileCheckpoints.tsx";
import { GitHistory, pageFrom, relativeTime } from "../apps/web/src/GitHistory.tsx";
import { UnifiedDiff } from "../apps/web/src/UnifiedDiff.tsx";
import type { UiPreferences } from "../packages/contracts/preferences.ts";

const preferences = {
	diffDefaultExpanded: false,
	timeFormat: "system",
} as UiPreferences;

it("keeps Current the default and lists Git history last after checkpoint History", () => {
	const html = renderToStaticMarkup(
		createElement(FileCheckpoints, {
			preferences,
			current: createElement("div"),
			recorded: createElement("div"),
			gitHistory: createElement("div"),
		}),
	);
	const tabs = [...html.matchAll(/role="tab"[^>]*>([^<]+)</g)].map(
		(match) => match[1],
	);
	expect(tabs).toEqual(["Current", "Recorded", "History", "Git history"]);
	expect(html).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>Current</);
});

it("mounts the supplied Git history surface under its own tab only", () => {
	const html = renderToStaticMarkup(
		createElement(FileCheckpoints, {
			preferences,
			initialSource: "Git history",
			current: createElement("div"),
			recorded: createElement("div"),
			gitHistory: createElement("mark", null, "history-slot"),
		}),
	);
	expect(html).toContain("history-slot");
});

it("shows the loading list, basis note and refresh control before data", () => {
	const html = renderToStaticMarkup(
		createElement(GitHistory, {
			base: "/api/projects/p1",
			query: new URLSearchParams(),
			active: true,
			preferences,
		}),
	);
	expect(html).toContain("Git history");
	expect(html).toContain("Push status unavailable");
	expect(html).toContain("Refresh history");
	expect(html).toContain("Loading commits…");
	expect(html).toContain('role="status"');
	expect(html).not.toContain("Stage");
});

it("formats relative author time across every documented bucket", () => {
	const now = Date.parse("2026-11-23T12:00:00Z");
	expect(relativeTime("2026-11-23T11:59:30Z", now)).toBe("just now");
	expect(relativeTime("2026-11-23T11:58:00Z", now)).toBe("2 minutes ago");
	expect(relativeTime("2026-11-23T11:59:00Z", now)).toBe("1 minute ago");
	expect(relativeTime("2026-11-23T09:00:00Z", now)).toBe("3 hours ago");
	expect(relativeTime("2026-11-20T12:00:00Z", now)).toBe("3 days ago");
	expect(relativeTime("2026-09-14T12:00:00Z", now)).toBe("2 months ago");
	expect(relativeTime("2024-11-23T12:00:00Z", now)).toBe("2 years ago");
	// A future timestamp must not read as past.
	expect(relativeTime("2026-11-24T12:00:00Z", now)).toBe("just now");
});

it("accepts the empty-repository page payload instead of failing", () => {
	const page = pageFrom({
		snapshotId: "",
		branch: "main",
		headOid: null,
		upstreamRef: null,
		commits: [],
		nextCursor: null,
	});
	expect(page.headOid).toBeNull();
	expect(page.commits).toEqual([]);
	expect(() => pageFrom({ commits: "nope" })).toThrowError();
});

it("trims checkpoint headers but renders committed patches verbatim", () => {
	const diff = "--- a/f.txt\n+++ b/f.txt\n@@ -1 +1 @@\n-old\n+new\n";
	const trimmed = renderToStaticMarkup(
		createElement(UnifiedDiff, { diff, trimHeaders: true }),
	);
	expect(trimmed).not.toContain("--- a/f.txt");
	expect(trimmed).not.toContain("+++ b/f.txt");
	expect(trimmed).toContain("+new");
	const verbatim = renderToStaticMarkup(createElement(UnifiedDiff, { diff }));
	expect(verbatim).toContain("--- a/f.txt");
	expect(verbatim).toContain("+++ b/f.txt");
});

it("keeps the planned user-facing copy verbatim", () => {
	const source = readFileSync("apps/web/src/GitHistory.tsx", "utf8");
	for (const copy of [
		"No commits yet",
		"No files changed in this commit",
		"Commit history unavailable",
		"History changed. Refresh history to continue.",
		"Binary file — no text diff",
		"Diff is too large to display.",
		"Copy SHA",
		"Back to commits",
		"may be out of date",
		"Push status unavailable",
	])
		expect(source).toContain(copy);
});

it("matches the recorded-row density and motion budget in styles", () => {
	const css = readFileSync("apps/web/src/git-history.css", "utf8");
	expect(css).toMatch(/git-history-row[^}]*min-height:\s*30px/s);
	expect(css).toMatch(/git-history-row[^}]*font-size:\s*12px/s);
	expect(css).toContain("var(--ui-motion-hover)");
	expect(css).toContain("prefers-reduced-motion");
	expect(css).toContain("min-width: 240px");
	expect(css).toContain("min-width: 720px");
});
