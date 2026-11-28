import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { FileCheckpoints } from "../apps/web/src/FileCheckpoints.tsx";
import { GitHistory, relative } from "../apps/web/src/GitHistory.tsx";
import { DEFAULT_PREFERENCES } from "../packages/contracts/preferences.ts";

const preferences = DEFAULT_PREFERENCES;

it("keeps Current the default and lists Git history last after checkpoint History", () => {
	const html = renderToStaticMarkup(
		createElement(FileCheckpoints, {
			preferences,
			current: createElement("div"),
			recorded: createElement("div"),
		}),
	);
	const tabs = [...html.matchAll(/role="tab"[^>]*>([^<]+)</g)].map((match) => match[1]);
	expect(tabs).toEqual(["Current", "Recorded", "History", "Git history"]);
	expect(html).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>Current</);
});

it("mounts the supplied Git history surface under its own tab only", () => {
	const selected = renderToStaticMarkup(
		createElement(FileCheckpoints, {
			preferences,
			initialSource: "Git history",
			current: createElement("div"),
			recorded: createElement("div"),
			history: createElement("mark", null, "history-slot"),
		}),
	);
	expect(selected).toContain("history-slot");
	const unselected = renderToStaticMarkup(
		createElement(FileCheckpoints, {
			preferences,
			current: createElement("div"),
			recorded: createElement("div"),
			history: createElement("mark", null, "history-slot"),
		}),
	);
	expect(unselected).not.toContain("history-slot");
});

it("renders the loading list, refresh control and caption before data", () => {
	const html = renderToStaticMarkup(
		createElement(GitHistory, {
			base: "/api/projects/p1",
			query: new URLSearchParams(),
			preferences,
		}),
	);
	expect(html).toContain("Git history");
	expect(html).toContain("Refresh history");
	expect(html).toContain("Loading commits");
	expect(html).toContain("newest first");
});

it("ages commits with bounded relative buckets", () => {
	expect(relative(new Date(Date.now() - 30_000).toISOString())).toBe("just now");
	expect(relative(new Date(Date.now() - 5 * 60_000).toISOString())).toBe("5 minutes ago");
	expect(relative(new Date(Date.now() - 3 * 3_600_000).toISOString())).toBe("3 hours ago");
	expect(relative(new Date(Date.now() - 2 * 86_400_000).toISOString())).toBe("2 days ago");
	expect(relative("not-a-date")).toBe("");
});
