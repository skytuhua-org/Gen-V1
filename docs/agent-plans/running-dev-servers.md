# Plan: Running dev servers list with Open in Browser

> **Design ownership (batch 10).** There is no separate front end design team for this feature. This plan specifies its own visual design and animation (section VISUAL_DESIGN_AND_MOTION) and implementers build exactly that. **When implementation is finished, the implementing agent sends the finished work to the front end team for review** (task T09) and does not close this issue until that review is recorded on the issue.

## META

| Field | Value |
|---|---|
| Feature | A "Running" section in the Project context card lists local dev servers started from Gen terminals and project scripts (URL/port, command, thread, uptime) with **Open in browser**, **Copy URL** and **Stop**. Stop ends the owning terminal and its whole process tree, so no orphaned server keeps holding a port such as 3000 |
| Size | medium (labels `feature`, `medium`); one issue, no sub-issues |
| Repo | skytuhua-org/Gen-V1 |
| Canonical issue | this issue |
| Plan file | `docs/agent-plans/running-dev-servers.md` (identical to this body; SHA-pinned link at the top of the issue) |
| Plan revision | r1, 2026-11-21 |
| Baseline | `main` @ `8fa907f378127bcfc23d71b55c53625ffc43e8da` (verified by fresh clone, `git log -1`) |
| Existing work | No issue or PR lists listening ports or dev servers (searched open/closed issues and PRs for "dev server", "port", "running servers", "localhost"). Related, open: [#1536 Plan: Clickable links in terminal output](https://github.com/skytuhua-org/Gen-V1/issues/1536) and its implementation [PR #1553](https://github.com/skytuhua-org/Gen-V1/pull/1553) (adds `apps/web/src/open-web-link.ts` and the desktop `openExternal` bridge this plan reuses); [#1476 Find in terminal output](https://github.com/skytuhua-org/Gen-V1/issues/1476) / [PR #1490](https://github.com/skytuhua-org/Gen-V1/pull/1490) and [#1284 Pick the terminal shell](https://github.com/skytuhua-org/Gen-V1/issues/1284) (also touch terminal code); [#1474 Responsive width presets in the docked Browser](https://github.com/skytuhua-org/Gen-V1/issues/1474) (distinct: Browser viewport only) |
| Implementation status | NOT_STARTED. Planning only; no code written |
| Source provenance | Feature proposal batch 10, item 5 ("Running dev servers list with Open in Browser", medium), filed directly per the maintainer's standing instruction (no approval step); static repository research at the baseline SHA; public prior art listed in REFERENCES |

## OBJECTIVE

**Problem.** Users and agents start dev servers (`pnpm dev`, `next dev`, `vite`, `python -m http.server`) in Gen's workspace terminals (`TerminalHost` in `packages/workspace/terminal.ts`) and through project scripts (`run-script` in `apps/server/workspace-routes.ts`, which opens a terminal and types the script command). Nothing in Gen tracks which of those terminals is serving a port. To find a server again the user must find the right terminal panel, scroll its output for `Local: http://localhost:5173/`, and copy the URL. When the terminal panel is closed or belongs to another thread, the server keeps running unseen and keeps holding its port, so the next `pnpm dev` fails with `EADDRINUSE` or silently moves to 3001. In addition, the existing terminal **Stop** only calls `pty.kill()` on the shell; on Windows (ConPTY) and POSIX a server started by the shell can survive its shell, which is the "orphaned server holds port 3000" problem reported against Codex (#25772) and Claude Code (#78767).

**Intended behavior.**
1. When a Gen-owned terminal prints a local server address (for example `Local:   http://localhost:5173/` or `ready - started server on 0.0.0.0:3000, url: http://localhost:3000`) and a TCP connection to that port on the loopback interface succeeds, the project's Project context card shows a **Running** section with one row for that server.
2. Each row shows the URL (`localhost:5173`), the command that started the terminal (script name or first typed command), the thread it belongs to, and uptime ("Up 4m").
3. Row actions: **Open in browser** (system default browser in the desktop app, new tab in a browser-hosted Gen), **Copy URL**, and **Stop** (two-step inline confirm; ends the owning terminal and its whole process tree).
4. The row disappears when its terminal exits, or when the port stops accepting connections for two consecutive probes (server stopped but the shell is still open).
5. In the desktop app, quitting Gen while servers are listed asks "Stop N running servers and quit?" before quitting.

**Measurable success.**
- With the fixture server (VALIDATION F1) printing `http://localhost:<port>/` in a Gen terminal, a row appears within 2 s of the port accepting connections, and disappears within 1 s of Stop.
- After Stop, a new TCP connection to that port fails (the server child process is gone, not only the shell), on Windows and on Linux CI.
- No OS-wide port scan, no `netstat`/`lsof` call, and no network request other than a TCP connect to `127.0.0.1`/`::1` on ports printed by Gen-owned terminals.
- With no detected servers the Project context card renders exactly as at baseline (no empty section).

## REQUIREMENTS

### In scope (each maps to tasks and acceptance rows in VALIDATION)

- **R01 Process-tree Stop.** Terminal Stop (the existing `stop` command in `TerminalHost.command`, used by the terminal toolbar, this feature's Stop and `TerminalHost.dispose()` on host shutdown) terminates the pty's whole process tree, not only the shell: Windows `taskkill.exe /PID <pty.pid> /T /F` followed by `pty.kill()`; POSIX: collect descendants of `pty.pid` from `ps -A -o pid=,ppid=`, send `SIGTERM` to descendants then the shell, and `SIGKILL` survivors after 2 s. The existing 5 s confirmation (`TERMINAL_CANCEL_UNCONFIRMED`) stays. (Decision: one Stop semantics everywhere so the terminal toolbar no longer orphans servers either.)
- **R02 Detection source.** Only output of Gen-owned ptys (`TerminalHost` sessions) is scanned. No OS-wide port scan or process enumeration for discovery.
- **R03 Detection pattern.** After stripping ANSI escape sequences (CSI `ESC [ … letter`, OSC `ESC ] … BEL|ESC \`), match, case-insensitive:
  - `https?://(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|\[::\]):(\d{1,5})(/[^\s'"<>]*)?`
  - bare `(localhost|127\.0\.0\.1|0\.0\.0\.0):(\d{1,5})\b` when not part of a longer hostname (preceded by start, whitespace, `(`, `[`, `'`, `"` or `=`).
  Port must be an integer 1024–65535. Scheme defaults to `http` for bare matches; `https` kept when printed. `0.0.0.0`/`[::]` are displayed and opened as `localhost`. Path is kept only when printed with a scheme (e.g. Vite base `/app/`), max 512 chars; query/fragment dropped.
- **R04 Chunk boundaries.** The detector keeps the last 512 characters of the previous chunk without a newline, so an address split across two `onData` chunks is detected once.
- **R05 Confirmation probe.** A candidate becomes a row only after `net.connect({host,port})` succeeds within 750 ms against `127.0.0.1`, then `::1` if IPv4 fails. Unconfirmed candidates are re-probed at 0.5, 1, 2, 4 and 8 s after detection (servers often print before listening), then dropped. Confirmed rows are re-probed every 10 s; two consecutive failures remove the row. Probes are skipped while no client has read the list in the last 30 s (VALIDATION checks the timer stops).
- **R06 Limits.** Max 8 candidates per terminal and 32 rows total; extra candidates are ignored (newest first wins within a terminal). Duplicate port across terminals: the first confirmed terminal owns the row; a later terminal printing the same port does not create a second row.
- **R07 Row data.** `{id, projectId, threadId|null, threadTitle|null, terminalId, url, port, label, source:'script'|'terminal', scriptName|null, startedAt (terminal start), detectedAt (confirmation time)}`. `label` = script name for `run-script` terminals, otherwise the first submitted input line of that terminal (trimmed, max 120 chars), otherwise `"Terminal"`. No raw output is stored or returned.
- **R08 Listing scope.** The list is per project: rows from every thread of the project (and project-level terminals with no thread) are returned to a caller authorized for that project via the existing `projects.binding(projectId,threadId)` check. Rows are in-memory only (not persisted); after a host restart the list is empty, matching `TerminalHost`, which marks unfinished terminals ended on start.
- **R09 Open in browser.** Uses `openWebLink(url)` from `apps/web/src/open-web-link.ts` (introduced by PR #1553): desktop `harnessDesktop.openExternal` → main-process validated `shell.openExternal`; browser-hosted → `window.open(url,'_blank','noopener,noreferrer')`. Loopback hosts must pass that validation (the #1536 plan explicitly allows them). If `openExternal` rejects, the row shows `Could not open the browser` for 4 s.
- **R10 Docked Browser (decision, deviation from proposal wording).** The proposal said "Open in docked Browser". Verified at baseline: the docked/native Browser validates every address with `remoteBrowserUrl` in `apps/desktop/window-policy.ts`, which rejects `localhost`, private IPs and any port other than 80/443 ("Only public HTTP or HTTPS pages are available in the browser"). Changing that security policy is out of scope, so v1 opens the system browser. A follow-up may add a loopback-only exception to the docked Browser under its own issue.
- **R11 Copy URL.** Reuses `CopyButton` (`apps/web/src/CopyButton.tsx`) with `text=url`, `label="Copy URL"`.
- **R12 Stop.** First click turns the Stop button into `Stop?` (danger color) for 3 s; a second click within 3 s calls the existing `POST /api/terminals/:terminalId/commands` with `{projectId, threadId?, type:'stop'}` using the row's `threadId`. While pending the row is dimmed and the button shows a spinner; success removes the row; failure shows the error text (`Terminal termination was not confirmed.` etc.) under the row and restores the button. Escape or blur cancels the armed state.
- **R13 Refresh.** The web client polls `GET /api/projects/:projectId/dev-servers` every 3 s while the Project context card is mounted and `document.visibilityState==='visible'`; immediately after Stop and after `run-script`. No polling while hidden.
- **R14 Quit prompt (desktop).** In `closeApplication()` (`apps/desktop/main.ts`), before windows are asked to close, the main process asks the backend for the row count through a new allowlisted control message `harness.devServers.count` (`apps/server/desktop-controls.ts`). If count > 0, show `dialog.showMessageBox` with message `Stop N running server(s) and quit Gen?`, detail listing up to 5 `localhost:<port> — <label>` lines, buttons `Stop and quit` (default) and `Cancel` (cancelId). Cancel aborts the quit exactly like a window refusing close (`cancelClose`). "Stop and quit" continues the existing flow; host shutdown stops terminals via `TerminalHost.dispose()` (now tree-kill, R01). If the count request fails, quit proceeds without the prompt (no new way to block quitting). OS session end / update restart (`osSessionEnding`, `restartForUpdate`) skip the prompt.
- **R15 No new egress / privacy.** Probes connect only to loopback; nothing is logged with URLs or output; rows never leave the host except to the local web client.

### Out of scope (v1)

- OS-wide port listing, processes not started by Gen, ports opened by agent tool calls outside Gen terminals (agent shell tool runs, background jobs `jobs.backgroundV1`). Follow-up candidate.
- Opening servers inside the docked Browser (R10), port forwarding, LAN/remote URLs (`192.168.x.x`), public tunnels.
- Restarting servers, editing script commands, auto-starting servers.
- Keeping servers alive after Gen quits.
- Browser-hosted quit prompt (closing a browser tab does not stop the host).
- Settings toggles; the feature has no flag (it only reads Gen-owned output and the R01 Stop change fixes a defect).

### User flows

1. Add script `dev` = `pnpm dev`, click it → terminal opens; Vite prints `Local: http://localhost:5173/` → within ~1 s a **Running · 1** section appears with `localhost:5173`, `dev`, thread title, `Up <1m`.
2. Click **Open in browser** → system browser opens `http://localhost:5173/`.
3. Click **Copy URL** → clipboard holds `http://localhost:5173/`; button shows its existing copied state.
4. Click **Stop** → `Stop?`; click again → spinner, row fades out; the terminal panel (if open) shows `Ended`; `curl localhost:5173` fails.
5. Close the terminal panel without stopping → row stays (terminal is still running in the host); Stop from the row still works.
6. Server crashes but shell stays → row removed after two failed probes (~20 s).
7. Quit the desktop app with one row → dialog; Cancel keeps Gen open; Stop and quit exits and the port is free.

### Error and recovery

| Case | Behavior |
|---|---|
| Probe errors (ECONNREFUSED, timeout) | Treated as not listening; no user-facing error |
| Stop unconfirmed (5 s) | Row shows `Terminal termination was not confirmed.`; Stop button re-enabled; row stays until terminal exits or probes fail |
| Stop on a terminal that already ended (`TERMINAL_ENDED`) | Row removed silently |
| List request fails | Section keeps last rows greyed with `Server list unavailable` note; next poll retries |
| `taskkill` missing/fails on Windows | Fall back to `pty.kill()`; existing unconfirmed handling applies |
| openExternal rejects | R09 message for 4 s |

### Accessibility

- Section is `<section aria-labelledby>` with heading `Running`; list `<ul aria-label="Running dev servers">`.
- Buttons have names: `Open localhost:5173 in browser`, `Copy URL for localhost:5173`, `Stop server on localhost:5173` / armed `Confirm stop server on localhost:5173`.
- A visually hidden `role="status" aria-live="polite"` announces `Server localhost:5173 is running` on add and `Server localhost:5173 stopped` on removal.
- All actions keyboard reachable in row order; armed Stop cancels on Escape; focus moves to the next row's first button (or the section heading's next focusable element) when a row is removed after Stop (no focus drop to `body`).
- `prefers-reduced-motion: reduce` disables all motion in this section.

### Performance

- Detector cost: one regex pass per pty chunk over at most chunk + 512 chars; no work for terminals without matches beyond that pass.
- At most 32 sockets probed every 10 s, only while a client read the list within 30 s.
- List payload ≤ 32 rows.

## REPO_MAP (verified at baseline unless marked DISCOVERY)

| Path | Relevant fact |
|---|---|
| `packages/workspace/terminal.ts` | `TerminalHost`: `Session{id,projectId,threadId?,path,pty,output,offset,exited,exitCode,done}`; `open()` spawns via `node-pty` `spawn(...)`, writes `command+'\r'` when `command` given; `pty.onData` appends to a 512 KiB buffer; `pty.onExit` sets `exited`, persists, `evictExited`; `command(id,…,{type:'stop'})` calls `session.pty.kill()` and waits 5 s on `session.done` else `TERMINAL_CANCEL_UNCONFIRMED`; `dispose()` stops all; capacity 12 running terminals |
| `apps/server/workspace-routes.ts` | `run-script` action → `terminals.open({projectId,threadId,command:script.command})` (script name not passed today); routes `POST /api/terminals`, `GET /api/terminals/:terminalId`, `POST /api/terminals/:terminalId/commands` (`type: input|resize|stop`); `GET /api/projects/:projectId/context`; `onClose` hook disposes terminals |
| `apps/server/workspace-host.ts` | `workspaceHost(service)` creates `ProjectTools` and `TerminalHost` per service |
| `apps/server/hermes-service.ts` | Second construction site: `new TerminalHost(projects)` and `service.dispose` → `terminals.dispose()` |
| `apps/server/desktop-controls.ts` | Allowlisted backend control messages from the desktop main process (`harness.stopAll`, `harness.update.readiness`, …) each with strict key-count checks |
| `apps/desktop/main.ts` | `backendRequest(type: 'harness.stopAll'|…)` union; `closeApplication()` (requestClose per window → `cancelClose` on refusal → flush → stopBackend); `before-quit` handler |
| `apps/desktop/window-policy.ts` | `remoteBrowserUrl()` rejects localhost/private/non-80/443 (basis for R10) |
| `packages/desktop-contract/index.ts` | `DesktopBridge`, `DesktopBrowserCommand` (`open|close|navigate|back|forward|reload|stop|bounds`), `DESKTOP_CHANNELS` |
| `apps/web/src/ProjectContextCard.tsx` | "Project tools" `<details>`: Open in editor, Add script form, `context.scripts` rows (`run('run-script',{scriptId})`), Commit; styles in `apps/web/src/project-context.css` (`.project-context-row`, `.project-context-section`, `.project-plan-expansion` grid-rows motion) |
| `apps/web/src/ProjectContextSurface.tsx` | Mounts `ProjectContextCard` with `useProjectContext(projectId,threadId)` from `apps/web/src/project-api.ts` |
| `packages/contracts/workspace.ts` | `ProjectContext` interface (scripts, capabilities.terminal) |
| `packages/workspace/tools.ts` | `context()` returns `scripts` and `capabilities.terminal:!!project.rootPath` |
| `apps/web/src/TerminalBody.tsx` | Terminal panel; toolbar Stop posts `{type:'stop'}` and expects `exited:true` |
| `apps/web/src/BackgroundWork.tsx`, `background-work.css` | List/card styling to mirror (`.background-state[data-state="running"]` accent pill, `.background-meta`, `.background-command` mono 11px) |
| `apps/web/src/CopyButton.tsx` | `CopyButton({text,label})` |
| `packages/ui-shell/tokens.css` | Motion tokens `--ui-motion-insert:180ms`, `--ui-motion-remove:140ms`, `--ui-motion-status:160ms`, `--ui-ease-enter`, `--ui-ease-move` |
| `packages/runtime-pi/process-tree.ts`, `packages/capabilities/process.ts` | Existing tree-kill patterns (`taskkill /T /F`, process group kill) for `ChildProcess`; node-pty `IPty` is not a `ChildProcess`, so T01 adds a pid-based helper |
| `scripts/public-source-files.json` | CONTRIBUTING: every new source file must be listed (`source`, and `runtime` when packaged) |
| Tests | `tests/terminal-host-unit.test.ts` (mocks `node-pty`), `tests/terminal-host.test.ts`, `tests/terminal-opening-race.test.ts`, `tests/terminal-reopen-ended.test.ts`, `tests/project-context-committed-action.test.ts`, e2e `tests/e2e/terminal-read.*` (fixture + vite + playwright config pattern) |
| `apps/web/src/open-web-link.ts` | **DISCOVERY:** does not exist on main at baseline; added by open PR #1553 |

## DESIGN

### Architecture

```
node-pty onData ──► TerminalHost (session) ──observer.output(session,chunk)──► DevServerTracker
                                   └─observer.exit(session)──────────────────►   ├─ detect (pure, dev-server-detect.ts)
                                                                                  ├─ probe (net.connect loopback)
                                                                                  └─ rows Map<id,Row>
GET /api/projects/:projectId/dev-servers ──► tracker.list(projectId) (+ thread titles from store)
Stop: existing POST /api/terminals/:id/commands {type:'stop'} ──► tree kill (R01) ──► onExit ──► tracker removes rows
Desktop quit: main ─ harness.devServers.count ─► desktop-controls ─► tracker.count()
```

### Contracts

New `packages/contracts/dev-servers.ts`:

```ts
import {z} from 'zod';
export const devServerSchema=z.strictObject({
  id:z.string(), projectId:z.string(), threadId:z.string().nullable(), threadTitle:z.string().nullable(),
  terminalId:z.string(), url:z.string().url(), port:z.number().int().min(1024).max(65535),
  label:z.string().max(120), source:z.enum(['script','terminal']), scriptName:z.string().nullable(),
  startedAt:z.string(), detectedAt:z.string(),
});
export const devServerListSchema=z.strictObject({items:z.array(devServerSchema).max(32)});
export type DevServer=z.infer<typeof devServerSchema>;
```

Route: `GET /api/projects/:projectId/dev-servers?threadId=` → `Cache-Control: no-store`; validates with `identifier`; calls `projects.binding(projectId,threadId)` (authorization, throws as other routes do); returns `devServerListSchema`-shaped data. Row `id` = `terminalId + ':' + port`.

`TerminalHost` changes:
- `Session` gains `startedAt:string`, `label:string|null`, `scriptName:string|null`, `firstInput:string|null`.
- `open()` input gains optional `scriptName?:string` (validated `z.string().trim().min(1).max(100)`); `run-script` passes `script.name`.
- First `input` command whose data contains `\r` sets `firstInput` from the accumulated line (strip control chars, max 120) when not set.
- Constructor gains optional `observer?:{output(info:SessionInfo,chunk:string):void;exit(info:SessionInfo):void}` where `SessionInfo={id,projectId,threadId?,startedAt,label}`; called inside `onData`/`onExit` in `try/catch` so tracker failures never affect the pty.
- Both construction sites (`workspace-host.ts`, `hermes-service.ts`) create one `DevServerTracker` and pass it; `WorkspaceHost` gains `devServers:DevServerTracker`.
- Stop uses `terminateTerminalTree(pty)` (R01) from new `packages/workspace/terminal-tree.ts`.

### Detector (pure)

`packages/workspace/dev-server-detect.ts`:

```ts
export interface DetectedAddress{url:string;port:number}
export function stripAnsi(text:string):string;
export function detectAddresses(text:string):DetectedAddress[]; // R03, deduped by url, in order
export function createLineCarry(limit=512):{feed(chunk:string):string} // returns carry+chunk to scan, keeps tail after last '\n'
```

`url` normalization: `new URL(...)`; host `0.0.0.0`/`[::]` → `localhost`; `127.0.0.1` kept; `[::1]` kept; output `href` with trailing `/` when no path.

### Tracker state machine (per candidate)

`detected → probing(attempt n=0..5) → confirmed → (probe fail ×2 | terminal exit) → removed`; `probing` after attempt 5 failure → dropped. A terminal exit removes all its candidates and rows immediately and clears timers. `dispose()` clears all timers. Probe function injectable (`probe:(host,port)=>Promise<boolean>`) and clock injectable (`now`, `setTimeout`) for tests. `lastReadAt` updated by `list()`; the 10 s re-probe loop skips when `now-lastReadAt>30s`.

### Quit flow

`apps/desktop/main.ts`: extend `backendRequest` type union with `'harness.devServers.count'`; in `closeApplication()` before the `requestClose` loop, unless `osSessionEnding||restartForUpdate`:

```ts
let servers:{count:number;items:{url:string;label:string}[]}|undefined;
try{const r=await backendRequest('harness.devServers.count');servers={count:Number(r.count)||0,items:Array.isArray(r.items)?r.items.slice(0,5):[]};}catch{}
if(servers&&servers.count>0&&!await confirmStopServers(servers)){for(const entry of windows.values())cancelClose(entry);restartForUpdate=false;return;}
```

`confirmStopServers` is a small exported pure-ish function in a new `apps/desktop/dev-server-quit.ts` that builds the dialog options (`quitDialogOptions(count,items)`) so it is unit-testable; main calls `dialog.showMessageBox(mainWindow, options)` and returns `response===0`. `desktop-controls.ts` answers `harness.devServers.count` (key count 3) with `{count, items:[{url,label}]}` from `host.devServers`, or `{count:0,items:[]}` when unavailable.

### Security boundaries

- Detection only reads Gen-owned pty output already held in memory.
- Probe targets fixed to loopback addresses; port from regex, range-checked; no hostnames resolved.
- Stop reuses the existing ownership check in `TerminalHost.owned()` (project + thread must match the terminal).
- Open in browser goes through #1553's main-process validation; plugin surfaces cannot call `openExternal` (not in plugin channel allowlist, per #1536).
- `taskkill.exe` resolved from `%SystemRoot%\System32` (as in `packages/capabilities/process.ts`), `shell:false`, `windowsHide:true`; POSIX `ps` with fixed args.

### Migration / rollback

No persisted data; no schema migration. Rollback = revert the PR. R01 is the only behavior change to existing UI (toolbar Stop now also ends child processes).

## VISUAL_DESIGN_AND_MOTION

Placement: a new `<section className="project-context-section project-running">` in `ProjectContextCard`, rendered **directly above** the "Project tools" `<details>` and only when `items.length>0`. It is not inside the collapsible so running servers stay visible.

Layout (uses existing tokens only):
- Header row: 33px min height, padding `5px 8px`, `display:flex; gap:8px`. Lucide `Radio` icon 15px `var(--muted)`, heading `Running` (13px, weight 550), count pill reusing `.background-state` look (11px, weight 600, `padding:1px 8px`, radius 999px, `border:1px solid var(--accent)`, color `var(--accent)`) showing the number.
- Row (`li.project-running-row`): grid `grid-template-columns: 8px minmax(0,1fr) auto; column-gap:10px; align-items:center; padding:6px 8px; border-radius:7px; min-height:44px`. Hover background `var(--selection-bg)` with `transition: background-color var(--ui-motion-hover) var(--ui-ease-move)`.
  - Col 1: status dot 8×8px circle `background: var(--success)`.
  - Col 2: line 1 URL text `localhost:5173` (port shown, scheme hidden except `https://`), 13px, weight 550, `font-variant-numeric: tabular-nums`, ellipsis; `title` = full URL. Line 2 meta, 11px `var(--muted)`, ellipsis: `<label mono 11px (var(--font-mono))> · <thread title or "Project terminal"> · Up 4m`.
  - Col 3: three 28×28 icon buttons (`.icon-button`): `ExternalLink` 14px (Open in browser), `CopyButton` icon variant label "Copy URL" (if `CopyButton` has no icon variant, use its default rendering at 11px — DISCOVERY in T06, no new copy component), `Square` 13px (Stop). Armed Stop: button widens to text `Stop?` 11px weight 600, color/border `var(--danger)`; width transition `var(--ui-motion-tab) var(--ui-ease-move)`.
- Uptime text: `Up <1m`, `Up 4m`, `Up 2h 5m`, `Up 3d`; updated every 30 s by a single interval in the section (not per row).
- Errors under a row: `.error-text` 11px, `grid-column: 2 / 4`.
- Unavailable note: `.project-context-note` text `Server list unavailable` with rows at opacity .6.
- Width ≤ 320px (container query on `.project-context-card` if present, else media): meta line hides the thread segment; actions stay.
- Light and dark themes: only tokens above, no hard-coded colors.

Motion:
- Row insert: `@keyframes project-running-in { from {opacity:0; transform:translateY(4px)} to {opacity:1; transform:none} }` duration `var(--ui-motion-insert)` (180ms) easing `var(--ui-ease-enter)`; rows added in the same poll stagger by `var(--ui-motion-stagger)` (30ms) via `style={{animationDelay}}` index×30ms, max 5 steps.
- Section appear: wrap in the existing `.project-plan-expansion`-style grid-rows pattern (`grid-template-rows 0fr→1fr`, `var(--ui-motion-panel-enter)`, `var(--ui-ease-enter)`).
- Row removal: add `data-leaving="true"` → `opacity:0; transform:translateY(-2px)` over `var(--ui-motion-remove)` (140ms) `var(--ui-ease-move)`, then remove from DOM on `animationend`/`transitionend` (fallback timeout 200ms).
- Status dot: soft pulse `@keyframes project-running-pulse {0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--success) 45%,transparent)} 70%{box-shadow:0 0 0 5px transparent} 100%{box-shadow:0 0 0 0 transparent}}` 2.4s `ease-out` infinite; paused (`animation-play-state:paused`) when the row is stopping.
- Stopping: row opacity .6 over `var(--ui-motion-status)`; Stop icon swapped for `LoaderCircle` with existing `.spinning` class.
- `@media (prefers-reduced-motion: reduce)`: all animations and transitions in `.project-running` set to `none`; removal happens immediately.

New file `apps/web/src/running-servers.css`, imported by the new component.

## EXECUTION_DAG

Ownership boundaries: T01→T03 serialize on `packages/workspace/terminal.ts`; T02 and T04 are file-disjoint and can run in parallel with T01; T06 and T07 are disjoint (web vs desktop). Every new source file is added to `scripts/public-source-files.json` in the task that creates it.

### T01 Process-tree Stop for terminals (R01)
- Depends on: none.
- Edits: new `packages/workspace/terminal-tree.ts` exporting `terminateTerminalTree(pty:{pid:number;kill():void}, deps?)` (injectable `execFile`, `processKill`, `platform` for tests); `packages/workspace/terminal.ts` `command()` stop branch calls it instead of `session.pty.kill()`; keep the 5 s `session.done` race and error code.
- Windows: `execFile(join(SystemRoot,'System32','taskkill.exe'),['/PID',String(pid),'/T','/F'],{windowsHide:true,timeout:5000})`, then `pty.kill()` regardless of result (ignore errors from an already-dead tree).
- POSIX: `execFile('ps',['-A','-o','pid=,ppid='])` → build child map → descendants of pid (BFS) → `SIGTERM` descendants (ignore `ESRCH`) → `pty.kill()` → after 2 s `SIGKILL` any descendant still alive (`process.kill(p,0)` succeeds). If `ps` fails, just `pty.kill()`.
- Tests (`tests/terminal-tree.test.ts`): win32 path calls taskkill with exact args then kill; POSIX path signals descendants (fake ps output `"10 1\n11 10\n12 11\n13 1"` → signals 11,12, not 13); `ps` failure falls back to `pty.kill()`; existing `tests/terminal-host-unit.test.ts` updated so stop still resolves and `TERMINAL_CANCEL_UNCONFIRMED` still fires when exit never arrives. Real-process test (Linux CI): spawn a terminal that runs `node -e "require('http').createServer().listen(PORT)" &`-style child (or `sleep 60 &` then `wait`), Stop, assert the child pid no longer exists.
- Done when: all above pass; `pnpm exec vitest run tests/terminal-tree.test.ts tests/terminal-host-unit.test.ts tests/terminal-host.test.ts` green.
- Handoff: T03.

### T02 Pure address detector (R03, R04)
- Depends on: none.
- Edits: new `packages/workspace/dev-server-detect.ts` per DESIGN.
- Tests (`tests/dev-server-detect.test.ts`), positive: `  ➜  Local:   http://localhost:5173/` → `http://localhost:5173/`; `ready - started server on 0.0.0.0:3000, url: http://localhost:3000` → one result port 3000 (dedupe); `Serving HTTP on :: port 8000 (http://[::]:8000/)` → `http://localhost:8000/`; `https://127.0.0.1:8443/app/?x=1` → `https://127.0.0.1:8443/app/`; ANSI-colored `\x1b[36mhttp://localhost:\x1b[1m5173\x1b[22m/\x1b[39m` → detected; split chunks `"http://local"`+`"host:4321/\n"` via carry → detected once. Negative: `http://example.com:3000`, `mylocalhost:3000`, `localhost:80` (below 1024), `localhost:70000`, `file://localhost:3000/x`, `http://192.168.1.5:3000` → none.
- Done when: tests green.
- Handoff: T03.

### T03 DevServerTracker and TerminalHost metadata (R02, R05–R08)
- Depends on: T01 (same file), T02.
- Edits: new `packages/workspace/dev-servers.ts` (`DevServerTracker` with `output()`, `exit()`, `list(projectId)`, `count()`, `dispose()`, injectable `probe` and timers); `packages/workspace/terminal.ts` (Session fields, `scriptName` input, `firstInput` capture, observer calls in try/catch); `apps/server/workspace-host.ts` and `apps/server/hermes-service.ts` (construct tracker, pass as observer, expose `devServers` on `WorkspaceHost`, dispose with terminals); `apps/server/workspace-routes.ts` `run-script` passes `scriptName:script.name`.
- Default probe: `net.connect({host,port})`, resolve true on `connect` (then `destroy()`), false on `error`/750 ms timeout; try `127.0.0.1` then `::1`.
- Tests (`tests/dev-servers.test.ts`, fake timers + fake probe): candidate confirmed on 3rd probe → row with correct label/source/scriptName/startedAt/detectedAt; never-listening candidate dropped after 5 retries; confirmed row removed after 2 failed re-probes; terminal exit removes rows and timers; per-terminal cap 8 and global cap 32; duplicate port across terminals yields one row owned by the first; re-probe loop idle when `list()` not called for >30 s; observer throwing does not break `TerminalHost` output (unit with mocked node-pty); `firstInput` label from `input` commands `"pnpm d"`+`"ev\r"` → `pnpm dev`.
- Done when: tests green; `tests/terminal-*.test.ts` still green.
- Handoff: T04, T07.

### T04 Contract and list route (R07, R08)
- Depends on: T03 (tracker API); contract file can start in parallel.
- Edits: new `packages/contracts/dev-servers.ts`; export from `packages/contracts/index.ts` if that file re-exports siblings (DISCOVERY: follow existing pattern); `apps/server/workspace-routes.ts` new `GET /api/projects/:projectId/dev-servers` per DESIGN; `threadTitle` from `service.store.get('thread',threadId)?.title ?? null`.
- Tests (`tests/dev-servers-route.test.ts`, Fastify inject like other route tests): returns only rows for the requested project; rows from two threads both listed; unknown project → same error as `/context`; response validates with `devServerListSchema`; `Cache-Control: no-store`.
- Done when: tests green.
- Handoff: T06.

### T05 Reuse of `openWebLink` (R09)
- Depends on: PR #1553 merged.
- Steps: if #1553 is merged when T06 starts, import `openWebLink` from `apps/web/src/open-web-link.ts`. If not merged, post a checkpoint on this issue and on #1536 and **block T06's Open in browser button only** (ship nothing that duplicates the bridge); the rest of T06 proceeds. Verify `externalLinkUrl` in `apps/desktop/window-policy.ts` (from #1553) accepts `http://localhost:5173/` and `http://127.0.0.1:3000/`; if it does not, record the gap on #1536 and block.
- Done when: `openWebLink` importable on the feature branch base and loopback URLs pass its validation (unit test in `tests/dev-servers-ui.test.tsx` mocks it).
- Handoff: T06.

### T06 Running section UI (R09–R13, VISUAL_DESIGN_AND_MOTION, accessibility)
- Depends on: T04; T05 for the Open button.
- Edits: new `apps/web/src/RunningServers.tsx` (presentational `RunningServersView({items,unavailable,onOpen,onStop,stoppingId,errors})` + container `RunningServers({projectId,threadId})` with polling per R13 and `devServerListSchema` validation via the existing `read`/`authenticated` helpers in `apps/web/src/api`); new `apps/web/src/running-servers.css`; `apps/web/src/project-api.ts` add `useDevServers(projectId,threadId)` hook (poll, visibility, `refresh()`); `apps/web/src/ProjectContextCard.tsx` render `<RunningServers>` above Project tools when `context.capabilities.terminal`; trigger `refresh()` after `run-script` succeeds. Stop calls `POST /api/terminals/:terminalId/commands` with the row's `projectId`/`threadId`.
- Tests: `tests/dev-servers-ui.test.tsx` (React testing pattern used by other `*.test.tsx`; DISCOVERY: match existing renderer setup) — empty → no section; 2 items → heading count 2, accessible names per R-accessibility; Stop requires two clicks within 3 s, Escape disarms, timeout disarms; pending state disables buttons; error renders; Open calls `openWebLink` with row URL; uptime formatter cases (`<1m`, `4m`, `2h 5m`, `3d`). E2E `tests/e2e/running-servers.spec.ts` + fixture/vite/playwright config mirroring `tests/e2e/terminal-read.*`: insert/remove motion present, reduced-motion emulation removes animations, focus moves to next row after Stop, light/dark screenshots at 1280×900 and 390×844 attached to the PR.
- Done when: unit + e2e green; `pnpm test:ui-guard` green.
- Handoff: T08.

### T07 Desktop quit prompt (R14)
- Depends on: T03 (`count()`).
- Edits: `apps/server/desktop-controls.ts` handle `harness.devServers.count`; `apps/desktop/main.ts` union type + `closeApplication()` change per DESIGN; new `apps/desktop/dev-server-quit.ts` with `quitDialogOptions(count,items)`.
- Tests: `tests/dev-server-quit.test.ts` — options text for 1 and 3 servers, detail truncated to 5 lines, `defaultId:0`, `cancelId:1`; desktop-controls returns `{count:0,items:[]}` when host lacks `devServers`, rejects extra keys like neighbors; extend an existing desktop main test if one covers `closeApplication` (DISCOVERY: `tests/desktop-native.test.ts`), asserting cancel calls `cancelClose` and skips `stopBackend`.
- Done when: tests green.
- Handoff: T08.

### T08 Integration validation and docs
- Depends on: T06, T07.
- Steps: run VALIDATION commands; real-app check on Windows packaged build (VALIDATION M1–M4); add a short "Running servers" paragraph to the user docs section that documents project scripts (DISCOVERY: `grep -rn "Add script" docs README.md`); `pnpm check:docs-links`.
- Done when: acceptance matrix rows all PASS with evidence on the issue.
- Handoff: T09.

### T09 Front end team review handoff (last task)
- Depends on: T08.
- Steps: post a HANDOFF checkpoint on this issue addressed to the front end team with: PR link, SHA, light/dark and narrow screenshots, a short screen recording of add → open → copy → stop → removal and reduced-motion, and the VISUAL_DESIGN_AND_MOTION section quoted with any deviations. Request review of visual design and motion. Apply requested changes in the same PR.
- Done when: the front end team's review is recorded on the issue (ACK + approval or change list resolved). Do not close the issue before this.

## VALIDATION

### Setup

```
source ~/.nvm/nvm.sh   # if node/pnpm are not on PATH
pnpm install --frozen-lockfile
pnpm exec vitest run tests/terminal-tree.test.ts tests/dev-server-detect.test.ts tests/dev-servers.test.ts tests/dev-servers-route.test.ts tests/dev-servers-ui.test.tsx tests/dev-server-quit.test.ts
pnpm exec vitest run tests/terminal-host-unit.test.ts tests/terminal-host.test.ts tests/terminal-opening-race.test.ts tests/terminal-reopen-ended.test.ts tests/project-context-committed-action.test.ts
pnpm test:ui-guard
pnpm exec playwright test -c tests/e2e/running-servers.playwright.config.ts
pnpm exec vitest run tests/public-source.test.ts && pnpm check:docs-links
```

### Fixtures
- **F1 fixture server:** `node -e "const s=require('http').createServer((q,r)=>r.end('ok'));s.listen(0,'127.0.0.1',()=>console.log('Local: http://localhost:'+s.address().port+'/'))"` — prints its URL after listening.
- **F2 late listener:** prints the URL, waits 1.5 s, then listens (exercises retry probes).
- **F3 liar:** prints `http://localhost:59999/` and never listens (must not appear).
- **F4 child survivor:** shell runs F1 in background (`&` / `start /b`) so the server is a grandchild of the pty (exercises R01).

### Acceptance matrix

| Req | Check | Task |
|---|---|---|
| R01 | F4 Stop → server pid gone, port refuses connections (Linux CI + Windows manual M3) | T01, T08 |
| R02, R15 | Code review: tracker only fed by `TerminalHost` observer; probe hosts fixed to loopback; no `netstat`/`lsof` | T03 |
| R03, R04 | Detector positive/negative + split-chunk tests | T02 |
| R05 | F2 appears; F3 never appears; stopped server removed after 2 failed probes | T03 |
| R06 | Caps and duplicate-port tests | T03 |
| R07, R08 | Route tests (fields, per-project, two threads) | T04 |
| R09 | Open calls `openWebLink(url)`; packaged app opens system browser (M2) | T05, T06, T08 |
| R10 | Docked Browser unchanged (`remoteBrowserUrl` untouched in diff) | T08 |
| R11 | Copy writes exact URL | T06 |
| R12 | Two-step stop, pending, error, removal | T06 |
| R13 | Poll stops when `document.visibilityState` is `hidden` (e2e via `page.evaluate` override) | T06 |
| R14 | Quit dialog options + cancel path tests; packaged app manual M4 | T07, T08 |
| A11y | Names, live region, focus after removal, reduced motion | T06 |
| Visual | Screenshots light/dark, 1280 and 390 widths; front end review | T06, T09 |

### Manual (packaged Windows app)
- **M1** Add script `dev` = F1 command; run; row appears ≤2 s.
- **M2** Open in browser opens system browser at the URL.
- **M3** F4 via terminal; Stop from the row; `Test-NetConnection localhost -Port <port>` fails.
- **M4** With a row present, quit from tray/menu → dialog; Cancel keeps app; Stop and quit exits; port free.

### Release gate
All automated commands green in CI, M1–M4 PASS with evidence on the issue, front end review recorded (T09). Planned tests above are **not yet executed** (planning only).

## STATE

| Item | State |
|---|---|
| Research (repo + prior art) | Done at baseline `8fa907f` |
| Decisions | Recorded in REQUIREMENTS (R01 tree-kill for every Stop; R10 system browser instead of docked Browser; no capability flag; in-memory rows) |
| Implementation | NOT_STARTED; no branch |
| Verification | NOT_RUN |
| Owners | none (unclaimed) |
| Dependencies | PR #1553 (`openWebLink`/`openExternal`) for the Open button (T05) |
| Risks | (1) Detection is output-based: a server that never prints its URL is not listed (accepted; out of scope). (2) A port printed by one terminal but opened by another process would be attributed to the printing terminal; mitigated by probe + exit cleanup; Stop only ever ends the row's own terminal. (3) POSIX descendant walk races with forks; SIGKILL sweep after 2 s limits it. (4) Concurrent edits to `terminal.ts` by #1284 and `TerminalBody.tsx`/terminal e2e by #1490/#1553: rebase on current main before T01/T03, keep changes to the stop branch and session metadata only. |
| Next step | Implementer claims this issue per AGENTS.md, branches from current main, starts T01 and T02 in parallel |

## REFERENCES

- Gen baseline: https://github.com/skytuhua-org/Gen-V1/commit/8fa907f378127bcfc23d71b55c53625ffc43e8da
- Related Gen work: [#1536](https://github.com/skytuhua-org/Gen-V1/issues/1536), [PR #1553](https://github.com/skytuhua-org/Gen-V1/pull/1553), [#1476](https://github.com/skytuhua-org/Gen-V1/issues/1476), [PR #1490](https://github.com/skytuhua-org/Gen-V1/pull/1490), [#1284](https://github.com/skytuhua-org/Gen-V1/issues/1284), [#1474](https://github.com/skytuhua-org/Gen-V1/issues/1474)
- Prior art (user demand):
  - [Codex: show agent-started dev servers #42244](https://github.com/openai/codex/issues/42244) — users want to see servers the agent started.
  - [Codex: Ports panel #46643](https://github.com/openai/codex/issues/46643) — request for a ports list with open actions (VS Code-style Ports view).
  - [Codex: orphaned Next.js server holds port #25772](https://github.com/openai/codex/issues/25772) — server outlives its session and blocks port 3000.
  - [Claude Code: preview orphans dev server #78767](https://github.com/anthropics/claude-code/issues/78767) — same orphaning problem.
- Batch 10 scope note (verbatim intent): detect ports by parsing `localhost:<port>` / `http://127.0.0.1:<port>` from Gen-owned pty output and confirm with a local TCP probe (no OS-wide port scan); list per project with Open, Copy URL and Stop (kills the pty's process tree); entries vanish when the pty exits; on app quit, ask before stopping running servers.
