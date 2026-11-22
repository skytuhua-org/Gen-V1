import { expect, test, type Page, type Route } from "@playwright/test";

const fixtureRoot = encodeURI("/@fs/" + process.cwd().replaceAll("\\", "/"));
const PNG = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAD0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
	"base64",
);
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>';
const sha = "a".repeat(64);
const svgSha = "b".repeat(64);
const entries = [
	{ name: "logo.png", path: "logo.png", kind: "file", bytes: PNG.length },
	{ name: "icon.svg", path: "icon.svg", kind: "file", bytes: SVG.length },
	{ name: "corrupt.png", path: "corrupt.png", kind: "file", bytes: 7 },
	{ name: "bad.png", path: "bad.png", kind: "file", bytes: 7 },
	{ name: "big.png", path: "big.png", kind: "file", bytes: 11000000 },
	{ name: "data.bin", path: "data.bin", kind: "file", bytes: 7 },
];
const fail = (route: Route, code: string, message: string) =>
	route.fulfill({
		status: 400,
		json: { error: { code, message } },
	});
async function fixture(page: Page, query = "") {
	await page.route("**/api/**", (route) =>
		route.fulfill({
			status: 404,
			json: { error: { message: "Unconfigured synthetic request" } },
		}),
	);
	await page.route("**/api/bootstrap", (route) =>
		route.fulfill({ json: { csrfToken: "synthetic-image" } }),
	);
	await page.route("**/api/projects/*/files?*", (route) =>
		route.fulfill({
			json: {
				entries: new URL(route.request().url()).searchParams.has("path")
					? []
					: entries,
			},
		}),
	);
	await page.route("**/api/projects/*/file?*", (route) => {
		const path = new URL(route.request().url()).searchParams.get("path");
		if (path === "icon.svg")
			return route.fulfill({
				json: { text: SVG, binary: false, sha256: svgSha },
			});
		return route.fulfill({
			json: { text: null, binary: true, sha256: sha },
		});
	});
	await page.route("**/files-image-check*", (route) =>
		route.fulfill({
			contentType: "text/html",
			body: `<html><body><div id="root"></div><script type="module">import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;await import('${fixtureRoot}/tests/e2e/project-files-image-fixture.tsx');</script></body></html>`,
		}),
	);
	return () => page.goto("/files-image-check" + query);
}
async function images(page: Page, held: Map<string, Route> = new Map()) {
	await page.route("**/api/projects/*/file/image?*", (route) => {
		const path = new URL(route.request().url()).searchParams.get("path") ?? "";
		if (held.has(path)) return;
		if (path === "logo.png")
			return route.fulfill({
				contentType: "image/png",
				body: PNG,
				headers: { "X-File-Sha256": sha },
			});
		if (path === "icon.svg")
			return route.fulfill({
				contentType: "image/svg+xml",
				body: SVG,
				headers: { "X-File-Sha256": svgSha },
			});
		if (path === "corrupt.png")
			return route.fulfill({
				contentType: "image/png",
				body: "not an image",
			});
		if (path === "bad.png")
			return fail(
				route,
				"UNSUPPORTED",
				"This file is not a valid PNG image.",
			);
		if (path === "big.png")
			return fail(route, "RESOURCE_LIMIT", "Image exceeds limit.");
		return fail(route, "INVALID_INPUT", "No image preview.");
	});
	if (held.size)
		await page.route("**/api/projects/*/file/image?*", (route) => {
			const path =
				new URL(route.request().url()).searchParams.get("path") ?? "";
			if (held.has(path)) held.set(path + ":seen", route);
			else route.fallback();
		});
}
const preview = (page: Page) =>
	page.getByRole("region", { name: "File content" });
const toggle = (page: Page) => page.locator(".files-mode-toggle");

test("raster file shows image preview with natural-size meta and zoom toggle", async ({
	page,
}) => {
	const go = await fixture(page);
	await images(page);
	await go();
	await page.getByRole("button", { name: "logo.png", exact: true }).click();
	const img = page.locator('.files-image-stage img[alt="logo.png"]');
	await expect(img).toBeVisible();
	await expect(page.locator(".files-image-meta")).toContainText(
		`2 × 2 px · ${PNG.length} B`,
	);
	await expect(toggle(page).getByRole("button", { name: "Fit" })).toHaveAttribute(
		"aria-pressed",
		"true",
	);
	await toggle(page).getByRole("button", { name: "100%" }).click();
	await expect(
		toggle(page).getByRole("button", { name: "100%" }),
	).toHaveAttribute("aria-pressed", "true");
	await expect(page.locator(".files-image-stage")).toHaveAttribute(
		"data-mode",
		"actual",
	);
	await expect(img).toHaveCSS("width", "2px");
	await expect(page.locator(".files-checksum")).toContainText(
		"SHA-256 " + sha,
	);
});

test("svg previews as image and Source shows the xml text", async ({
	page,
}) => {
	const go = await fixture(page);
	await images(page);
	await go();
	await page.getByRole("button", { name: "icon.svg", exact: true }).click();
	await expect(
		page.locator('.files-image-stage img[alt="icon.svg"]'),
	).toBeVisible();
	await expect(
		toggle(page).getByRole("button", { name: "Source" }),
	).toBeVisible();
	await toggle(page).getByRole("button", { name: "Source" }).click();
	await expect(preview(page).locator("pre")).toContainText(
		'<svg xmlns="http://www.w3.org/2000/svg"',
	);
	await expect(
		toggle(page).getByRole("button", { name: "Source" }),
	).toHaveAttribute("aria-pressed", "true");
	await toggle(page).getByRole("button", { name: "Fit" }).click();
	await expect(
		page.locator('.files-image-stage img[alt="icon.svg"]'),
	).toBeVisible();
});

test("search text match on an svg presets source mode", async ({ page }) => {
	const go = await fixture(page);
	await images(page);
	await go();
	await page.getByRole("combobox", { name: "Search scope" }).click();
	await page.getByRole("option", { name: "Project", exact: true }).click();
	await page
		.getByRole("searchbox", { name: "Search project" })
		.fill("icon");
	const hit = page.locator(".project-search-hit").first();
	await expect(hit).toBeVisible();
	await hit.click();
	await expect(preview(page).locator("pre")).toContainText("<svg");
	await expect(
		toggle(page).getByRole("button", { name: "Source" }),
	).toHaveAttribute("aria-pressed", "true");
});

test("RESOURCE_LIMIT error shows the image size limit message", async ({
	page,
}) => {
	const go = await fixture(page);
	await images(page);
	await go();
	await page.getByRole("button", { name: "big.png", exact: true }).click();
	await expect(page.locator(".files-error[role=status]")).toContainText(
		"Image preview is limited to 10 MiB.",
	);
});

test("UNSUPPORTED host error surfaces its message", async ({ page }) => {
	const go = await fixture(page);
	await images(page);
	await go();
	await page.getByRole("button", { name: "bad.png", exact: true }).click();
	await expect(page.locator(".files-error[role=status]")).toContainText(
		"not a valid PNG image",
	);
});

test("corrupt bytes show the decode failure message", async ({ page }) => {
	const go = await fixture(page);
	await images(page);
	await go();
	await page.getByRole("button", { name: "corrupt.png", exact: true }).click();
	await expect(
		page.locator(".files-image .files-error"),
	).toContainText("This image could not be decoded.");
});

test("non-image binary file keeps the text fallback", async ({ page }) => {
	const go = await fixture(page);
	await images(page);
	let imageRequests = 0;
	page.on("request", (request) => {
		if (request.url().includes("/file/image")) imageRequests += 1;
	});
	await go();
	await page.getByRole("button", { name: "data.bin", exact: true }).click();
	await expect(preview(page)).toContainText(
		"Binary file; no text preview.",
	);
	expect(imageRequests).toBe(0);
});

test("a late response from a deselected image is dropped", async ({
	page,
}) => {
	const go = await fixture(page);
	const held = new Map<string, Route>([["logo.png", undefined as never]]);
	await images(page, held);
	await go();
	await page.getByRole("button", { name: "logo.png", exact: true }).click();
	await expect.poll(() => held.has("logo.png:seen")).toBe(true);
	await page.getByRole("button", { name: "icon.svg", exact: true }).click();
	await expect(
		page.locator('.files-image-stage img[alt="icon.svg"]'),
	).toBeVisible();
	await held.get("logo.png:seen")!.fulfill({
		contentType: "image/png",
		body: PNG,
	});
	await page.waitForTimeout(100);
	await expect(
		page.locator('.files-image-stage img[alt="icon.svg"]'),
	).toBeVisible();
	await expect(
		page.locator('.files-image-stage img[alt="logo.png"]'),
	).toHaveCount(0);
});

test("reduced motion shows the image without transition or transform", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	const go = await fixture(page);
	await images(page);
	await go();
	await page.getByRole("button", { name: "logo.png", exact: true }).click();
	const img = page.locator('.files-image-stage img[alt="logo.png"]');
	await expect(img).toBeVisible();
	const style = await img.evaluate((element) => {
		const computed = getComputedStyle(element);
		return {
			transform: computed.transform,
			transition: computed.transitionProperty,
			opacity: computed.opacity,
		};
	});
	expect(style.transform).toBe("none");
	expect(style.transition).toBe("none");
	expect(style.opacity).toBe("1");
});
