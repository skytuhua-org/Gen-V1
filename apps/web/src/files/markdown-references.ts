// Classification and scoped identifiers for document-authored references inside
// project Files Markdown previews. Pure helpers; the host still authorizes
// every file and image read, so classification never grants access by itself.

export type FilesReference =
	| { kind: "external"; href: string }
	| { kind: "fragment"; fragment: string }
	| { kind: "file"; path: string; fragment: string | null }
	| { kind: "denied" };

export type FilesImageReference =
	| { kind: "image"; path: string }
	| { kind: "external" }
	| { kind: "unsupported" }
	| { kind: "denied" };

const CONTROL = /[-\x7f]/;
const SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const INTERNAL_SEGMENT = /^(?:\.git|\.harness-directory-guard)$/i;
const PERCENT_ESCAPE = /%[0-9a-fA-F]{2}/;
const IMAGE_EXTENSION = /\.(?:png|jpe?g)$/i;

export function isMarkdownFileName(name: string): boolean {
	return /\.md$/i.test(name);
}

// Resolve a document-authored relative path against the Markdown file's
// directory. Dot segments canonicalize but can never pop above the worktree
// root; every surviving segment is decoded exactly once and must stay a plain
// path component.
function canonicalFilesPath(target: string, baseDir: string): string | null {
	if (
		CONTROL.test(target) ||
		target.includes("\\") ||
		target.includes("?") ||
		target.startsWith("/") ||
		SCHEME.test(target)
	)
		return null;
	const raw = target.split("/");
	if (raw.some((part) => !part)) return null;
	const segments = baseDir ? baseDir.split("/") : [];
	for (const part of raw) {
		if (part === ".") continue;
		if (part === "..") {
			if (!segments.length) return null;
			segments.pop();
			continue;
		}
		let decoded: string;
		try {
			decoded = decodeURIComponent(part);
		} catch {
			return null;
		}
		if (
			!decoded ||
			decoded === "." ||
			decoded === ".." ||
			/[/\\]/.test(decoded) ||
			CONTROL.test(decoded) ||
			PERCENT_ESCAPE.test(decoded) ||
			INTERNAL_SEGMENT.test(decoded)
		)
			return null;
		segments.push(decoded);
	}
	if (!segments.length) return null;
	const path = segments.join("/");
	return path.length <= 1024 ? path : null;
}

function decodeFragment(value: string): string | null {
	try {
		const decoded = decodeURIComponent(value);
		return decoded && !CONTROL.test(decoded) ? decoded : null;
	} catch {
		return null;
	}
}

// A fragment link addresses a heading inside the same document; a relative
// target addresses another file in the active worktree. Anything else is
// denied: absolute and scheme-relative targets, drive prefixes, backslashes,
// non-admitted schemes, queries on local targets, control characters, decoded
// separators, residual percent escapes, internal metadata segments and
// malformed encoding.
export function classifyFilesReference(
	target: string,
	baseDir: string,
): FilesReference {
	if (/^https?:\/\//i.test(target)) return { kind: "external", href: target };
	if (target.startsWith("#")) {
		const fragment = decodeFragment(target.slice(1));
		return fragment ? { kind: "fragment", fragment } : { kind: "denied" };
	}
	const hash = target.indexOf("#"),
		rawPath = hash === -1 ? target : target.slice(0, hash),
		rawFragment = hash === -1 ? null : target.slice(hash + 1),
		path = rawPath ? canonicalFilesPath(rawPath, baseDir) : null;
	if (!path) return { kind: "denied" };
	if (rawFragment === null) return { kind: "file", path, fragment: null };
	const fragment = decodeFragment(rawFragment);
	return fragment ? { kind: "file", path, fragment } : { kind: "denied" };
}

// v1 admits only relative PNG/JPEG image bytes; remote images, other file
// types and denied references are classified without producing traffic.
export function classifyFilesImage(
	target: string,
	baseDir: string,
): FilesImageReference {
	if (/^https?:\/\//i.test(target)) return { kind: "external" };
	const reference = classifyFilesReference(target, baseDir);
	if (reference.kind !== "file" || reference.fragment !== null)
		return { kind: "denied" };
	return IMAGE_EXTENSION.test(reference.path)
		? { kind: "image", path: reference.path }
		: { kind: "unsupported" };
}

// Plain text of a heading for slugging: inline markup collapses to its label.
export function headingPlainText(raw: string): string {
	return raw
		.replace(/!\[([^\]]*)\]\([^)\s]+\)/g, "$1")
		.replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
		.replace(/\*\*([^*]+)\*\*/g, "$1")
		.replace(/`([^`]+)`/g, "$1")
		.trim();
}

// Simple local heading convention: lower-case letters and numbers, hyphens for
// whitespace, punctuation stripped. No claim of GitHub anchor parity.
export function slugifyHeading(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s_-]/gu, "")
		.trim()
		.replace(/\s+/g, "-");
}

// Deterministic article-prefixed heading IDs with document-order duplicate
// suffixes. lookup() resolves a document-authored fragment against the slugs
// issued so far; issue() runs in render order, so a forward reference resolves
// once the heading has rendered.
export interface FilesHeadingIds {
	issue: (headingText: string) => string;
	lookup: (fragment: string) => string | undefined;
}
export function createFilesHeadingIds(prefix: string): FilesHeadingIds {
	const used = new Map<string, number>(),
		issued = new Map<string, string>();
	return {
		issue(headingText) {
			const base = slugifyHeading(headingPlainText(headingText)) || "heading",
				seen = used.get(base) ?? 0;
			used.set(base, seen + 1);
			const slug = seen ? `${base}-${seen}` : base,
				id = `${prefix}-${slug}`;
			issued.set(slug, id);
			return id;
		},
		lookup(fragment) {
			const slug = slugifyHeading(fragment);
			return slug ? issued.get(slug) : undefined;
		},
	};
}
