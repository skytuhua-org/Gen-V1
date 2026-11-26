import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { parseAccessibilityAuditCommand, loopbackAuditUrl } from "../apps/desktop/window-policy.ts";
import { normalizeAudit } from "../packages/desktop-contract/accessibility-normalize.ts";
import type { AccessibilityAuditCommand, AccessibilityAuditOutcome } from "../packages/desktop-contract/index.ts";
import {
	AUDIT_RUNNER,
	AUDIT_WORLD_ID,
	type AuditHost,
	type AuditSession,
	type AuditWebContents,
	type AuditWindow,
	auditFailed,
	auditRequestAllowed,
	runAudit,
	runLocalAudit,
} from "../apps/desktop/accessibility-audit.ts";

const AXE = "/* axe */";

type AuditHandler = (record:{id:string}, command:AccessibilityAuditCommand) => Promise<AccessibilityAuditOutcome | {available:boolean}>;
function ipcFixture(options:{capability?:()=>Promise<boolean>; source?:()=>Promise<string>} = {}) {
	const source = ts.createSourceFile("main.ts", readFileSync(new URL("../apps/desktop/main.ts", import.meta.url), "utf8"), ts.ScriptTarget.Latest);
	let callback:ts.Node | undefined;
	const visit = (node:ts.Node) => {
		if(ts.isCallExpression(node) && node.expression.getText(source)==="handle" && node.arguments[0]?.getText(source)==="channels.accessibilityAudit") callback=node.arguments[1];
		ts.forEachChild(node,visit);
	};
	visit(source);
	if(!callback) throw Error("Accessibility IPC handler is missing");
	const active = new Map<string,AbortController>();
	const capability = vi.fn(options.capability ?? (async()=>true));
	const asset = vi.fn(options.source ?? (async()=>AXE));
	const local = vi.fn(async()=>({status:"cancelled" as const}));
	const bindings = {parseAccessibilityAuditCommand, auditRuns:active, auditCapability:capability, auditAxeSource:asset,
		auditFailed, loopbackAuditUrl, runLocalAudit:local, runAudit, normalizeAudit, auditHost:{}};
	const {outputText} = ts.transpileModule(`const callback = ${callback.getText(source)};`, {compilerOptions:{target:ts.ScriptTarget.ES2022}});
	// Execute the real registered callback; only asset/capability/native edges are synthetic.
	const handler = new Function(...Object.keys(bindings), outputText + "\nreturn callback;")(...Object.values(bindings)) as AuditHandler;
	return {handler,active,capability,asset,local};
}
function barrier() {
	let release!:()=>void;
	const promise = new Promise<void>(resolve=>{release=resolve;});
	return {promise,release};
}
const localCommand = {type:"run",target:{kind:"local",url:"http://localhost:5173/",viewport:"desktop"}} as const;

describe("accessibility IPC run ownership",()=>{
	it("reserves the window while the cold asset is loading",async()=>{
		const held=barrier(), f=ipcFixture({source:async()=>{await held.promise;return AXE;}}), record={id:"window-a"};
		const first=f.handler(record,localCommand);
		await vi.waitFor(()=>expect(f.asset).toHaveBeenCalledOnce());
		const second=f.handler(record,localCommand); held.release();
		const outcomes=await Promise.all([first,second]);
		expect(f.asset).toHaveBeenCalledOnce(); expect(f.local).toHaveBeenCalledOnce();
		expect(outcomes[1]).toMatchObject({status:"failed",code:"BUSY"}); expect(f.active.size).toBe(0);
	});
	for(const phase of ["capability","asset"] as const) it(`cancels ownership while ${phase} is pending`,async()=>{
		const held=barrier(), f=ipcFixture({capability:async()=>{if(phase==="capability")await held.promise;return true;},source:async()=>{if(phase==="asset")await held.promise;return AXE;}}), record={id:"window-a"};
		const pending=f.handler(record,localCommand);
		await vi.waitFor(()=>expect(phase==="capability"?f.capability:f.asset).toHaveBeenCalledOnce());
		expect(await f.handler(record,{type:"cancel"})).toEqual({status:"cancelled"}); held.release();
		expect(await pending).toEqual({status:"cancelled"}); expect(f.local).not.toHaveBeenCalled(); expect(f.active.size).toBe(0);
		await f.handler(record,localCommand); expect(f.local).toHaveBeenCalledOnce();
	});
	for(const failure of ["DISABLED","ASSET_MISSING"] as const) it(`releases a ${failure} reservation for a later retry`,async()=>{
		let fail=true;
		const f=ipcFixture({capability:async()=>failure!=="DISABLED"||!fail,source:async()=>{if(failure==="ASSET_MISSING"&&fail)throw Error("missing");return AXE;}}), record={id:"window-a"};
		expect(await f.handler(record,localCommand)).toMatchObject({status:"failed",code:failure}); expect(f.active.size).toBe(0);
		fail=false; await f.handler(record,localCommand); expect(f.local).toHaveBeenCalledOnce(); expect(f.active.size).toBe(0);
	});
});
const raw = {
	version: "4.14.1",
	url: "http://localhost:5173/",
	title: "App",
	width: 1280,
	height: 800,
	violations: [
		{
			id: "image-alt",
			impact: "critical",
			help: "h",
			description: "d",
			helpUrl: "https://dequeuniversity.com/x",
			tags: ["wcag2a", "wcag111"],
			nodes: [{ target: "img", html: "<img>", failureSummary: "s" }],
		},
	],
};

type FakeContents = AuditWebContents & {
	calls: { world: number; code: string }[];
};

const fakeContents = (
	overrides: Partial<AuditWebContents> = {},
): FakeContents => {
	const calls: FakeContents["calls"] = [];
	return {
		calls,
		isDestroyed: () => false,
		getURL: () => raw.url,
		loadURL: async () => ({}),
		on() {},
		removeListener() {},
		async executeJavaScriptInIsolatedWorld(
			world: number,
			scripts: { code: string }[],
		) {
			calls.push({ world, code: scripts.map((s) => s.code).join("|") });
			return raw;
		},
		...overrides,
	} as FakeContents;
};

function fakeHost(contents: AuditWebContents): AuditHost & {
	sessions: AuditSession[];
	windows: AuditWindow[];
	blocked: number;
} {
	const host = {
		sessions: [] as AuditSession[],
		windows: [] as AuditWindow[],
		blocked: 0,
		createSession(partition: string) {
			const session: AuditSession = {
				partition,
				setPermissionRequestHandler() {},
				setPermissionCheckHandler() {},
				setProxy: async () => ({}),
				clearStorageData: async () => ({ cleared: "storage" }),
				clearCache: async () => ({ cleared: "cache" }),
				on() {},
				webRequest: {
					onBeforeRequest(listener: unknown) {
						(
							session as unknown as { requestListener?: unknown }
						).requestListener = listener;
					},
					onCompleted() {},
					onErrorOccurred() {},
				},
			} as never;
			host.sessions.push(session);
			return session;
		},
		createWindow() {
			const w: AuditWindow = {
				webContents: contents,
				isDestroyed: () => false,
				destroy() {
					(w as { destroyed?: boolean }).destroyed = true;
				},
			};
			host.windows.push(w);
			return w;
		},
	};
	return host as never;
}

describe("runAudit", () => {
	it("injects only the axe bundle and RUNNER into world 1099", async () => {
		const contents = fakeContents();
		const result = await runAudit(contents, AXE, new AbortController().signal);
		expect(result).toEqual({ ok: true, raw });
		expect(contents.calls).toHaveLength(1);
		expect(contents.calls[0].world).toBe(AUDIT_WORLD_ID);
		expect(contents.calls[0].code).toBe(AXE + "|" + AUDIT_RUNNER);
	});
	it("times out slow runs and reports a destroyed page", async () => {
		const slow = fakeContents({
			async executeJavaScriptInIsolatedWorld() {
				return new Promise(() => {});
			},
		});
		expect(await runAudit(slow, AXE, new AbortController().signal, 30)).toEqual(
			auditFailed("RUN_TIMEOUT", "The checks took too long."),
		);
		const gone = fakeContents({ isDestroyed: () => true });
		expect(await runAudit(gone, AXE, new AbortController().signal)).toEqual(
			auditFailed("PAGE_GONE", "The page stopped while being checked."),
		);
	});
	it("cancels without waiting for the page", async () => {
		const controller = new AbortController();
		controller.abort();
		const contents = fakeContents();
		expect(await runAudit(contents, AXE, controller.signal)).toEqual({
			status: "cancelled",
		});
	});
});

describe("auditRequestAllowed (R04 filter)", () => {
	const origin = "http://localhost:5173";
	it("allows same origin, inline schemes and same-host websockets", () => {
		for (const url of [
			"http://localhost:5173/app.js",
			"http://localhost:5173:80/x".replace(":80", ""),
			"data:image/png;base64,x",
			"blob:http://localhost:5173/1",
			"about:blank",
			"ws://localhost:5173/hmr",
			"wss://localhost:5173/hmr",
		])
			expect(auditRequestAllowed(url, origin)).toBe(true);
	});
	it("blocks other origins and reports them for counting", () => {
		for (const url of [
			"http://evil.example/x",
			"https://localhost:5173/",
			"http://localhost:5174/",
			"ws://other.host:5173/",
			"file:///etc/passwd",
		])
			expect(auditRequestAllowed(url, origin)).toBe(false);
	});
});

describe("runLocalAudit", () => {
	it("runs the audit and cleans up window and session", async () => {
		const contents = fakeContents(),
			host = fakeHost(contents);
		const outcome = await runLocalAudit(
			new URL("http://localhost:5173/"),
			"desktop",
			AXE,
			new AbortController().signal,
			host,
		);
		expect(outcome.status).toBe("completed");
		expect((host.windows[0] as { destroyed?: boolean }).destroyed).toBe(true);
	});
	it("applies mobile viewport emulation", async () => {
		const emulated: unknown[] = [];
		const contents = fakeContents({
			enableDeviceEmulation(p) {
				emulated.push(p);
			},
		});
		await runLocalAudit(
			new URL("http://localhost:5173/"),
			"mobile",
			AXE,
			new AbortController().signal,
			fakeHost(contents),
		);
		expect(emulated).toHaveLength(1);
	});
	it("maps load failures and cancellation", async () => {
		const refused = fakeContents({
			async loadURL() {
				throw Error("ERR_CONNECTION_REFUSED");
			},
		});
		const outcome = await runLocalAudit(
			new URL("http://localhost:9/"),
			"desktop",
			AXE,
			new AbortController().signal,
			fakeHost(refused),
		);
		expect(outcome).toMatchObject({ status: "failed", code: "LOAD_FAILED" });
		expect((outcome as { message: string }).message).toContain(
			"Is the dev server running?",
		);
		const controller = new AbortController();
		controller.abort();
		expect(
			await runLocalAudit(
				new URL("http://localhost:5173/"),
				"desktop",
				AXE,
				controller.signal,
				fakeHost(fakeContents()),
			),
		).toEqual({ status: "cancelled" });
	});
});
