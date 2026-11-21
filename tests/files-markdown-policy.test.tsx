import { expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown, type MarkdownPolicy } from "../apps/web/src/Markdown";

const render = (text: string, policy?: MarkdownPolicy) =>
	renderToStaticMarkup(createElement(Markdown, { text, policy }));

const SAMPLE = [
	"# Heading One",
	"",
	"A **bold** word and `code`, [site](https://example.com),",
	"[local](docs/GUIDE.md#setup) and ![pic](media/a.png).",
	"",
	"## Heading One",
	"",
	"- first",
	"- second",
	"",
	"```",
	"const x = 1;",
	"```",
].join("\n");

it("keeps the default reply surface unchanged without a policy", () => {
	const html = render(SAMPLE);
	// Headings carry no ids or focusability: assistant replies are unchanged.
	expect(html).toContain("<h1>Heading One</h1>");
	expect(html).toContain("<h2>Heading One</h2>");
	expect(html).not.toContain("tabindex");
	expect(html).not.toContain('id="');
	// HTTP links keep the established external anchor treatment.
	expect(html).toContain(
		'<a href="https://example.com" target="_blank" rel="noreferrer">site</a>',
	);
	// Local targets and images remain literal text, never parsed.
	expect(html).toContain("[local](docs/GUIDE.md#setup)");
	expect(html).toContain("![pic](media/a.png)");
});

it("invokes opt-in policy callbacks only for local references", () => {
	const links: Array<{ target: string; label: string }> = [];
	const images: Array<{ target: string; alt: string }> = [];
	const policy: MarkdownPolicy = {
		headingId: (text) => `art-${text.toLowerCase().replaceAll(" ", "-")}`,
		link: (target, label) => {
			links.push({ target, label });
			return createElement("button", { type: "button" }, `L:${target}`);
		},
		image: (target, alt) => {
			images.push({ target, alt });
			return createElement("span", {}, `I:${target}`);
		},
	};
	const html = render(SAMPLE, policy);
	expect(html).toContain('<h1 id="art-heading-one" tabindex="-1">');
	expect(html).toContain('<h2 id="art-heading-one" tabindex="-1">');
	expect(html).toContain('type="button">L:docs/GUIDE.md#setup</button>');
	expect(html).toContain("<span>I:media/a.png</span>");
	expect(html).toContain(
		'<a href="https://example.com" target="_blank" rel="noreferrer">site</a>',
	);
	expect(links).toEqual([{ target: "docs/GUIDE.md#setup", label: "local" }]);
	expect(images).toEqual([{ target: "media/a.png", alt: "pic" }]);
});

it("renders local references as text when their callback is absent", () => {
	const html = render("[a](x.md) and ![b](y.png)", {
		link: (target) => createElement("b", {}, target),
	});
	expect(html).toContain("<b>x.md</b>");
	expect(html).toContain("![b](y.png)");
});
