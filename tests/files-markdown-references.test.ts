import { expect, it } from "vitest";
import {
	classifyFilesImage,
	classifyFilesReference,
	createFilesHeadingIds,
	headingPlainText,
	isMarkdownFileName,
	slugifyHeading,
} from "../apps/web/src/files/markdown-references";

it("recognizes only .md filenames, case-insensitively", () => {
	expect(isMarkdownFileName("README.md")).toBe(true);
	expect(isMarkdownFileName("Guide.MD")).toBe(true);
	expect(isMarkdownFileName("docs/readme.Md")).toBe(true);
	expect(isMarkdownFileName("readme.mdx")).toBe(false);
	expect(isMarkdownFileName("markdown.txt")).toBe(false);
	expect(isMarkdownFileName("md")).toBe(false);
	expect(isMarkdownFileName("a.md.bak")).toBe(false);
});

it("classifies external HTTP(S) links and same-file fragments", () => {
	expect(classifyFilesReference("https://example.com/a?b=1", "")).toEqual({
		kind: "external",
		href: "https://example.com/a?b=1",
	});
	expect(classifyFilesReference("http://example.com", "docs")).toEqual({
		kind: "external",
		href: "http://example.com",
	});
	expect(classifyFilesReference("#Setup", "")).toEqual({
		kind: "fragment",
		fragment: "Setup",
	});
	expect(classifyFilesReference("#setup%20guide", "docs")).toEqual({
		kind: "fragment",
		fragment: "setup guide",
	});
	expect(classifyFilesReference("#", "")).toEqual({ kind: "denied" });
});

it("resolves safe relative paths against the document directory", () => {
	expect(classifyFilesReference("GUIDE.md", "docs")).toEqual({
		kind: "file",
		path: "docs/GUIDE.md",
		fragment: null,
	});
	expect(classifyFilesReference("./a/b.png", "docs/x")).toEqual({
		kind: "file",
		path: "docs/x/a/b.png",
		fragment: null,
	});
	expect(classifyFilesReference("../GUIDE.md#setup", "docs/guide")).toEqual({
		kind: "file",
		path: "docs/GUIDE.md",
		fragment: "setup",
	});
	expect(classifyFilesReference("../x.txt", "a")).toEqual({
		kind: "file",
		path: "x.txt",
		fragment: null,
	});
	expect(classifyFilesReference("media/sample%20diagram.png", "docs")).toEqual({
		kind: "file",
		path: "docs/media/sample diagram.png",
		fragment: null,
	});
});

it("denies traversal, absolute, scheme, query and malformed targets", () => {
	for (const target of [
		"../../etc/passwd",
		"/etc/passwd",
		"//share/x",
		"C:/Windows",
		"c:\\x",
		"a\\b",
		"file:///etc/passwd",
		"javascript:alert(1)",
		"data:image/png;base64,AA",
		"mailto:a@b.c",
		"a?b=1",
		"a%2Fb",
		"a%5Cb",
		"%252e%252e/x",
		"%zz",
		"a%2",
		".git/config",
		"docs/.GIT/x",
		".harness-directory-guard",
		"a//b",
		"a/",
		"./",
	]) {
		expect(
			classifyFilesReference(target, "docs"),
			target,
		).toEqual({ kind: "denied" });
	}
	expect(classifyFilesReference("../../etc/passwd", "docs")).toEqual({
		kind: "denied",
	});
	expect(classifyFilesReference("../../x.txt", "")).toEqual({
		kind: "denied",
	});
	expect(classifyFilesReference("a#%zz", "")).toEqual({ kind: "denied" });
	expect(classifyFilesReference(`a/${"x".repeat(1030)}`, "")).toEqual({
		kind: "denied",
	});
});

it("admits only relative PNG/JPEG image targets without fragments", () => {
	expect(classifyFilesImage("media/logo.png", "docs")).toEqual({
		kind: "image",
		path: "docs/media/logo.png",
	});
	expect(classifyFilesImage("../A.JPEG", "docs")).toEqual({
		kind: "image",
		path: "A.JPEG",
	});
	expect(classifyFilesImage("https://example.com/x.png", "")).toEqual({
		kind: "external",
	});
	expect(classifyFilesImage("logo.png#frag", "")).toEqual({ kind: "denied" });
	expect(classifyFilesImage("icon.svg", "")).toEqual({ kind: "unsupported" });
	expect(classifyFilesImage("anim.gif", "")).toEqual({ kind: "unsupported" });
	expect(classifyFilesImage("notes.md", "")).toEqual({ kind: "unsupported" });
	expect(classifyFilesImage("../../x.png", "docs")).toEqual({
		kind: "denied",
	});
});

it("slugs headings deterministically with duplicate suffixes", () => {
	expect(slugifyHeading("Setup Guide")).toBe("setup-guide");
	expect(slugifyHeading("  Spaces   and   Tabs ")).toBe("spaces-and-tabs");
	expect(slugifyHeading("C++: the Language!")).toBe("c-the-language");
	expect(slugifyHeading("Résumé")).toBe("résumé");
	expect(headingPlainText("**Bold** and `code` [link](x) ![alt](y)")).toBe(
		"Bold and code link alt",
	);
	const ids = createFilesHeadingIds("art");
	const one = ids.issue("Setup"),
		two = ids.issue("Setup"),
		three = ids.issue("Other");
	expect(one).toBe("art-setup");
	expect(two).toBe("art-setup-1");
	expect(three).toBe("art-other");
	expect(ids.lookup("#setup")).toBe("art-setup");
	expect(ids.lookup("Setup")).toBe("art-setup");
	expect(ids.lookup("setup-1")).toBe("art-setup-1");
	expect(ids.lookup("missing")).toBeUndefined();
});
