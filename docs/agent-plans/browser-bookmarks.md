# Feature plan: Save bookmarks in the Gen Browser

## META

- **Feature title:** Save bookmarks in the Gen Browser
- **Repository:** `skytuhua-org/Gen-V1`
- **Size and labels:** medium; `feature` + `medium`
- **Plan revision:** r1, 2026-11-21
- **Baseline:** `main` at `8fa907f378127bcfc23d71b55c53625ffc43e8da` (`docs: add plan for real commit, push and PR from a thread (#1238)`), verified by `git rev-parse HEAD` on a fresh clone on 2026-11-21.
- **Existing issue/PR links:** none for Browser page bookmarks. Related but separate: [#1473 Bookmark individual messages in a thread](https://github.com/skytuhua-org/Gen-V1/issues/1473) and its PR [#1509](https://github.com/skytuhua-org/Gen-V1/pull/1509) (message bookmarks inside chat history, not Browser pages). [#1474 Responsive width presets in the docked Browser](https://github.com/skytuhua-org/Gen-V1/issues/1474) touches the same toolbar.
- **Implementation status:** NOT_STARTED. This document is a plan only; no product code, tests or behavior described here exist yet.
- **Source provenance:** feature research batch 11, row 6, written from a read of the baseline source and the external requests listed under REFERENCES.

## OBJECTIVE

**User problem.** The Gen Browser (the native `WebContentsView` that the desktop app shows docked beside a thread or in its own detached Browser window) only has back, forward, reload/stop and a typed address field. People who return to the same public pages (docs, dashboards, a staging site) must retype or paste the URL each time. The Codex requests in REFERENCES ask for exactly this ("website bookmarks", "Atlas-grade browser features"), and Chrome's bookmark flow (star to save, edit name, remove from the list) is the familiar model.

**Intended behavior.** From the Browser toolbar, in either the docked or the detached layout, the user can:

1. Save the current public page with one click on a star button, see the exact address that will be saved, and optionally edit its name.
2. Open a list of saved pages and open one in the current Browser.
3. Rename or remove a saved page from that list, with Undo for removal.

Both layouts read and write the same local list for the desktop profile.

**Measurable success.**

- S1: Saving the current page takes one click (star) plus an optional name edit; the saved row appears in the list in under 100 ms after the main process confirms the write (in-process state broadcast, no network).
- S2: A bookmark saved in the docked Browser appears in the detached Browser list without a restart, and the reverse.
- S3: Bookmarks survive an app restart.
- S4: No bookmark ever stores credentials, a non-HTTP(S) scheme, a local/private address, or (by default) a query string or fragment.
- S5: Opening a bookmark goes through the same `allowRemoteBrowserUrl` admission as a typed address; a blocked destination shows the normal Browser error and does not navigate.
- S6: Everything works with keyboard only and with a screen reader, and with motion set to reduced/off.

## REQUIREMENTS

### In scope (agreed)

- R1: Star button in the Browser toolbar that saves the current page, and shows a filled state when the current page (normalized) is already saved.
- R2: Save popover showing the normalized address that will be stored (read-only) and an editable name field prefilled from the page title (fallback: hostname). Save / Remove / Done actions.
- R3: "Bookmarks" list button in the toolbar that opens a popover listing saved pages, newest first.
- R4: Open a bookmark in the Browser that owns that toolbar (same Browser, same tab; there are no tabs).
- R5: Rename a bookmark inline in the list.
- R6: Remove a bookmark from the list or from the save popover, with a toast offering Undo for 5 s.
- R7: Same list, same behavior in the docked Browser (`DesktopBrowserDock`) and the detached Browser window (`DesktopBrowserSurface`).
- R8: Only public HTTP(S) destinations can be saved: the URL must pass `remoteBrowserUrl` (rejects embedded credentials, non-HTTP(S), loopback/private hosts) at save time and again at load and open time.
- R9: Query string and fragment are omitted by default. The save popover has one checkbox, "Keep query and #fragment", off by default; when on, they are stored as-is.
- R10: Local persistence in the desktop profile, owned by the Electron main process, mode `0o600`, surviving restart.
- R11: Limits: at most 200 bookmarks; name 1-120 characters after trim; stored URL at most 2048 characters. At the limit the star is disabled with the tooltip "Bookmark limit reached (200). Remove one to save another."
- R12: Accessibility: every control is a real `<button>`/`<input>` with an accessible name; popovers trap focus and return it to their trigger; list is navigable with arrow keys; state changes are announced in a polite live region.
- R13: Motion follows the shared tokens and the reduced/off motion rules in `apps/web/src/appearance.css`.

### Out of scope (agreed exclusions)

- X1: No automatic history or "recently visited" list; only explicit saves are stored.
- X2: No sync across devices or accounts, no upload to the backend or project.
- X3: No import/export (no Chrome/HTML bookmark import), no folders, no tags, no drag reordering.
- X4: No fetching of the page, favicon or metadata at save time. The name comes from the already-loaded `DesktopBrowserState.title`; the icon is a generic globe.
- X5: No agent access: bookmarks are not exposed to agents, tools, plugins, MCP, the backend, research sources or project memory.
- X6: Not the same thing as message bookmarks (#1473) and not `ResearchSourceIdentity` kind `bookmark` in `packages/contracts/research.ts`. Neither store is reused.
- X7: No new Browser permissions, cookies, profile or session changes; the `persist:harness-browser` session is untouched.
- X8: No web (non-desktop) build support; outside the desktop shell the toolbar controls are not rendered.

### User flows

- **F1 Save.** Page `https://docs.example.com/guide?tab=api#install` is loaded. User clicks the star (or presses Ctrl/Cmd+D while focus is in the Browser toolbar). Save popover opens: Address `https://docs.example.com/guide`, Name "Guide - Example Docs", checkbox "Keep query and #fragment" unchecked. The bookmark is created immediately on the star click (Chrome model); the popover lets the user rename, toggle the checkbox (which updates the stored URL), or Remove. Done or Escape closes it. Star becomes filled.
- **F2 Already saved.** Star is filled. Clicking it opens the same popover for the existing record (no duplicate created). Duplicate detection compares normalized URLs exactly.
- **F3 Open.** User clicks the list button, focuses a row and presses Enter (or clicks). Popover closes, the Browser navigates to the stored URL through normal admission; toolbar address updates from `DesktopBrowserState`.
- **F4 Rename.** In the list, the row's pencil button (or F2 on a focused row) swaps the name for an input. Enter saves, Escape cancels, blur saves. Empty after trim reverts to the previous name.
- **F5 Remove.** Row trash button (or Delete on a focused row) removes it; toast "Removed “Guide - Example Docs”" with Undo. Undo re-inserts the same record (same id and createdAt) if still under the limit.
- **F6 Not savable.** On `about:blank`, an error page, or any URL failing `remoteBrowserUrl`, the star is disabled with tooltip "Only public http or https pages can be bookmarked."
- **F7 Blocked at open.** If a stored destination now fails admission (for example DNS now resolves to a private address), navigation is refused and the Browser shows its existing error state; the bookmark is kept.
- **F8 Cross-layout.** A save in the docked Browser is visible in the detached Browser's list (and vice versa) via the state broadcast.

### Decisions vs proposed options

| Topic | Status | Decision |
|---|---|---|
| Storage owner | Agreed | Electron main process, one file per desktop profile. |
| Save trigger creates immediately | Proposed (Chrome model) | Star click creates; popover edits. Alternative "Save button in popover" rejected as an extra click. |
| Query/fragment | Agreed | Omitted by default; single opt-in checkbox. |
| Ordering | Proposed | Newest `createdAt` first; no manual ordering in v1. |
| Keyboard shortcut | Proposed | Ctrl/Cmd+D only while focus is inside the Browser toolbar (the native page keeps its own key handling). |
| List placement | Proposed | Popover anchored to the list button, not a sidebar. |

### Compatibility, performance, security, privacy, error/recovery

- Compatibility: additive optional field on `DesktopState`; additive variants on `DesktopBrowserCommand`. Older renderers ignore the field. Store file has `version: 1`.
- Performance: store read once at startup (cap 256 KiB), held in memory; each mutation is one serialized write through the existing `persistence.enqueue` style ordered queue; list rendering of 200 rows needs no virtualization.
- Security: the renderer never supplies the URL to save. `bookmark-add` saves the URL of the browser owned by the sending window, read in main from `webContents.getURL()`. `bookmark-open` sends only an id; main looks up the URL and runs the same admission as `navigate`. All commands go through strict `parseBrowserCommand` validation (unknown keys/types rejected, id must be a UUID, name length bounded). Plugin and thread windows that cannot already send browser commands gain nothing new.
- Privacy: data is local only, file mode `0o600`, never logged (log counts only), never sent to the backend, excluded from layout capture (`harness.layout.save`) and from diagnostics.
- Error/recovery: unreadable or invalid store file is renamed to `browser-bookmarks.invalid-<UTC timestamp>.json` (kept, not deleted), the app starts with an empty list and shows a one-time notice in the list popover: "Saved bookmarks could not be read. The old file was kept as a backup." Entries that fail validation on load are dropped individually and counted in the same notice. A failed write leaves the in-memory list at its previous value, rolls back the optimistic UI, and shows toast "Bookmark could not be saved." (tone error).

## REPO_MAP

Verified at the baseline SHA unless marked **discovery**.

| Path | Symbols | Relevance |
|---|---|---|
| `apps/web/src/DesktopBrowser.tsx` | `DesktopBrowserToolbar`, `DesktopBrowserSurface`, `DesktopBrowserSlot`, `DesktopBrowserDock` | Toolbar renders title/error, close, back/forward/reload/stop, address `<form>`, Go and loading indicator. Uses `useDesktop()` and `desktop.bridge.browser(command)`. `DesktopBrowserSlot` sends `{type:'bounds'}` and sends zero-size bounds while `document.querySelector('dialog[open],.artifact-expanded,[aria-modal="true"],.workspace-menu,.ui-popover')` matches, so a `.ui-popover` already hides the docked native view. |
| `apps/web/src/desktop-context.tsx` | `useDesktop` | Supplies `DesktopContext` (state + bridge) to the toolbar. |
| `apps/web/src/desktop.css` | `.desktop-browser-toolbar` (96 px: 44 px `header` + 52 px `form`), `.desktop-browser-dock` (`flex:0 0 min(520px,45vw)`, `min-width:280px`) | Toolbar layout; new buttons must fit the existing 52 px form row. |
| `apps/web/src/styles.css` | `.segmented` | Existing control styling reference. |
| `apps/web/src/appearance.css` | reduced/off motion rules | Motion must collapse here. |
| `packages/ui-shell/tokens.css` | `--ui-ease-enter`, `--ui-ease-move`, `--ui-ease-spring`, `--ui-motion-hover:120ms`, other `--ui-motion-*` durations | Motion tokens. |
| `packages/ui-shell/Popover.tsx` | `Popover` (`anchor`, `getAnchorRect`, `contentRef`, `initialFocus`, `open`, `present`, `width`, `height`, `preferredSide`, `align`, `layoutRevision`) | Popover for save and list. |
| `packages/ui-shell/Tooltip.tsx` | Tooltip | Disabled-star reasons. |
| `packages/ui-shell/Toast.tsx` | `toast(message,{tone,action,durationMs})`, `Toaster` | Undo remove, write errors. |
| `packages/ui-shell/ActionMenu.tsx` | `ActionMenu` | Not used (rows need inline rename); listed to avoid duplicating menu styles. |
| `packages/desktop-contract/index.ts` | `DesktopBrowserState` (`url`,`title`,`canGoBack`,`canGoForward`,`loading`,`error?`), `DesktopBrowserCommand` (`open`,`close`,`navigate`,`back`,`forward`,`reload`,`stop`,`bounds`), `DesktopState`, `DesktopContext`, `DesktopBridge` | Contract to extend. |
| `apps/desktop/preload.ts` | `DesktopBridge.browser` -> `ipcRenderer.invoke(channels.browser, command)` | Unchanged transport. |
| `apps/desktop/window-policy.ts` | `parseBrowserCommand(raw):DesktopBrowserCommand`, `remoteBrowserUrl`, `allowRemoteBrowserUrl` | Strict IPC parsing; public HTTP(S) and DNS admission. |
| `apps/desktop/main.ts` | `BrowserRecord`, `browserRecord()` (`session.fromPartition('persist:harness-browser')`, sandboxed `WebContentsView`), `browserState()`, `broadcast()`, browser IPC handler, `secureBrowserSession()`, `persist()` (`stateFile=join(app.getPath('userData'),'desktop-windows.json')`, `mode:0o600`), `profileRoot` (`HARNESS_DESKTOP_TEST_DATA_DIR` -> `desktop-profile`) | Native state, broadcast, persistence pattern. Detached Browser native view bounds are set in main to `{x:0,y:96,width,height:height-96}`; docked uses renderer `bounds`. |
| `apps/desktop/persistence.ts` | ordered persistence queue | Pattern for serialized writes. |
| `apps/desktop/docked-browser.ts` | `ensureMainDockedBrowser()` | Ownership of the single docked Browser. |
| `packages/contracts/research.ts` | `ResearchSourceIdentity` kind `bookmark` | Explicitly not reused (X6). |
| `tests/docked-browser-open.test.ts`, `tests/desktop-native.test.ts`, `tests/desktop-state-broadcast.test.ts`, `tests/browser-action.test.ts` | | Existing unit coverage to extend. |
| `tests/e2e/browser-action.spec.ts`, `tests/e2e/fixtures/browser-action.tsx` | Synthetic fixture rendering `DesktopBrowserDock`, `DesktopBrowserSurface`, `DesktopBrowserToolbar` with a fake bridge ("No native content or live navigation") | Browser-level UI test harness. |
| `tests/e2e/native-browser-bounds.spec.ts`, `tests/e2e/native-browser-bounds-fixture.tsx` | | Geometry/hidden-while-overlay checks. |
| `tests/public-source.test.ts`, `scripts/public-source-files.json` | | Public-source manifest. |
| `docs/progress.md` | M01-M17 ledger | M06 is verified build/browser QA; do not repurpose. **Discovery:** whether a ledger row is expected for this feature (ask maintainer in T08). |

Icons verified present in installed `lucide-react`: `Star`, `BookMarked`, `Pencil`, `Trash2`, `Globe`.

**Discovery items** (not facts): (D1) how `DesktopBrowserSurface` is mounted in the detached window and whether any existing code hides the detached native view under overlays (none found in `main.ts`; T03 must confirm); (D2) where the toolbar keyboard handler should live without conflicting with existing global shortcuts (grep `keydown` in `apps/web/src`); (D3) how the e2e fixture fakes `DesktopState` so it can be extended with bookmarks.

## DESIGN

### Data model (new, in `packages/desktop-contract/index.ts`)

```ts
export interface DesktopBrowserBookmark {
  id: string;          // crypto.randomUUID()
  url: string;         // normalized, passes remoteBrowserUrl
  title: string;       // 1..120 chars, trimmed
  createdAt: string;   // ISO 8601 UTC
  updatedAt: string;   // ISO 8601 UTC
}
export interface DesktopBrowserBookmarks {
  revision: number;    // increments on every committed mutation
  items: DesktopBrowserBookmark[]; // newest createdAt first
  limit: 200;
  notice?: string;     // one-time load/recovery notice
}
// DesktopState gains: browserBookmarks?: DesktopBrowserBookmarks
// DesktopBrowserCommand gains:
//  {type:'bookmark-add'; keepQuery?: boolean}
//  {type:'bookmark-update'; id: string; title?: string; keepQuery?: boolean}
//  {type:'bookmark-remove'; id: string}
//  {type:'bookmark-restore'; bookmark: DesktopBrowserBookmark}
//  {type:'bookmark-open'; id: string}
//  {type:'bookmark-notice-dismiss'}
//  {type:'overlay'; open: boolean}
```

Store file `browser-bookmarks.json` in `app.getPath('userData')` (same directory as `desktop-windows.json`, so `HARNESS_DESKTOP_TEST_DATA_DIR` isolates tests):

```json
{"version":1,"bookmarks":[{"id":"…","url":"https://docs.example.com/guide","title":"Guide","createdAt":"2026-11-21T22:00:00.000Z","updatedAt":"2026-11-21T22:00:00.000Z"}]}
```

### Pure module `apps/desktop/browser-bookmarks.ts` (new)

- `normalizeBookmarkUrl(raw:string, keepQuery:boolean): string | null` — `remoteBrowserUrl(raw)` must accept; strip `search` and `hash` unless `keepQuery`; reject if `username`/`password` non-empty; reject length > 2048. Returns `URL.href`.
- `parseBookmarkStore(text:string): {items, dropped:number} | {invalid:true}` — JSON parse, `version===1`, array, per-entry validation (UUID id, normalized URL re-check with `keepQuery:true` so stored queries survive, title bounds, ISO dates); duplicates by URL keep newest.
- `addBookmark(list, {url,title,now,id})`, `updateBookmark`, `removeBookmark`, `restoreBookmark` — pure, return new list or a typed error `'limit'|'duplicate'|'missing'|'invalid'`.
- `serializeBookmarkStore(items): string`.

### Main-process control flow (`apps/desktop/main.ts`)

1. Startup: read store (size cap 256 KiB) before first `broadcast()`; on invalid, rename to backup and set `notice`.
2. Browser IPC handler, after `parseBrowserCommand`, resolves the sender's owned `BrowserRecord` exactly as for `navigate` (owner + generation checks unchanged).
3. `bookmark-add`: read `record.view.webContents.getURL()` and current `title`; normalize; if duplicate, no-op and return; else add, enqueue write, then increment `revision` and `broadcast()`. Write failure: keep old list, `broadcast()` unchanged, reject the IPC promise with `Error('bookmark-write-failed')`.
4. `bookmark-update`: `keepQuery` re-derives URL from the record's current page only if the bookmark URL matches the current page's normalized URL; otherwise only title changes.
5. `bookmark-open`: look up id; run the same code path as `{type:'navigate',url}` (including `allowRemoteBrowserUrl`). Missing id rejects with `bookmark-missing`.
6. `overlay`: for the detached Browser window only, `open:true` sets the native view bounds to `{x:0,y:0,width:0,height:0}`; `open:false` restores `{x:0,y:96,width,height:height-96}`; window resize while open keeps it hidden. Docked Browser ignores it (it already hides via `.ui-popover` detection in `DesktopBrowserSlot`).
7. `broadcast()` includes `browserBookmarks` only in snapshots sent to the main window and Browser windows; thread/plugin windows do not receive it.
8. `harness.layout.save` / `captureLayout()` never include bookmarks.

### Renderer (`apps/web/src/DesktopBrowser.tsx` + new `apps/web/src/BrowserBookmarks.tsx`)

- `DesktopBrowserToolbar` adds, inside the 52 px form row after the address input and before Go: `BookmarkStarButton` and `BookmarkListButton`.
- `BookmarkStarButton` computes `saved` by normalizing `state.url` client-side with the same rule (shared helper exported from `packages/desktop-contract` or duplicated pure logic; main remains authoritative).
- `BrowserBookmarkSavePopover` and `BrowserBookmarkListPopover` use `Popover`. On open in the detached surface, send `{type:'overlay',open:true}`; on close (including unmount) send `{type:'overlay',open:false}`.
- Optimistic UI: rename/remove update locally, then reconcile on next `browserBookmarks.revision`; on rejection roll back and toast error.

### State transitions

`star: disabled(not savable | limit) -> idle(unsaved) -click-> saving -> saved(popover open) -Remove-> idle(unsaved)`; `row: view -pencil/F2-> editing -Enter/blur-> committing -> view | -Escape-> view`; `row: view -trash/Delete-> removed(toast 5 s) -Undo-> restoring -> view`.

### Visual design

- **Star button:** 32x32 px icon button, `Star` 16 px, stroke `var(--muted)`; hover background `var(--subtle)`, radius 6 px; saved state fill and stroke `var(--accent)` (discovery: confirm accent token name in `packages/ui-shell/tokens.css`; fall back to `var(--text)` fill). `aria-pressed` true when saved; accessible name "Bookmark this page" / "Edit bookmark".
- **List button:** 32x32 px, `BookMarked` 16 px, `aria-haspopup="dialog"`, `aria-expanded`; name "Bookmarks".
- Toolbar row keeps its 52 px height; the address input flexes to absorb the 2 x 32 px + 4 px gaps. At the dock's 280 px minimum width, Go hides behind Enter (address still submits) before the new buttons shrink. Discovery in T05: confirm the Go button can collapse without breaking existing tests.
- **Save popover:** 300 px wide, padding 12 px, radius 8 px, existing popover surface/shadow. Title row "Bookmark saved" (13 px, 600). Field "Name" (input 32 px). Read-only "Address" line, 12 px monospace, `var(--muted)`, single line with middle ellipsis and full value in `title`. Checkbox "Keep query and #fragment" (only rendered when the current page has a query or hash). Footer: Remove (ghost, danger text) left; Done (primary) right.
- **List popover:** 320 px wide, max height 360 px with internal scroll; header "Bookmarks" + count "12 of 200" muted. Rows 36 px: `Globe` 14 px muted, name 13 px single-line ellipsis, hostname 11 px muted on the right; pencil and trash 24 px icon buttons visible on row hover/focus-within and always visible under `(pointer: coarse)`. Focused row: 2 px focus ring inset. Empty state: "No bookmarks yet. Use the star to save this page." centered, 12 px muted, 72 px tall. Notice (if any): banner at top, `var(--subtle)` background, dismiss ×.
- Light and dark themes use existing tokens only; no new colors.

### Animation spec

| Element | Property | Duration | Easing | Reduced/off motion |
|---|---|---|---|---|
| Popover open | opacity 0->1, translateY(-4px)->0, scale .98->1 | `--ui-motion-popup-enter` | `--ui-ease-enter` | opacity only, 0 ms when off |
| Popover close | opacity 1->0, translateY(0)->(-4px) | `--ui-motion-popup-exit` | `--ui-ease-move` | 0 ms |
| Star save | fill/stroke color, scale 1->1.18->1 | 120 ms color (`--ui-motion-hover`), 220 ms scale | `--ui-ease-spring` | color only, no scale |
| Button hover | background | `--ui-motion-hover` (120 ms) | `--ui-ease-move` | unchanged (no motion) |
| Row insert (Undo) | height 0->36 px, opacity | `--ui-motion-insert` | `--ui-ease-enter` | instant |
| Row remove | opacity 1->0, height 36->0 | `--ui-motion-remove` | `--ui-ease-move` | instant |
| Rename swap | crossfade text/input | 120 ms | `--ui-ease-move` | instant |

The native Browser view cannot animate: it hides instantly (zero bounds) when a popover opens and reappears after the close animation ends (`onAnimationEnd`/`present=false`), so the page never draws over the popover.

### Accessibility

- Popovers are `role="dialog"` with `aria-label` ("Edit bookmark" / "Bookmarks"); focus moves to the Name input / first row; Escape closes and returns focus to the trigger; Tab is trapped.
- List is `role="listbox"` with roving `tabindex`; ArrowUp/Down/Home/End move; Enter opens; F2 renames; Delete removes. Row buttons have names "Rename <name>" and "Remove <name>".
- Live region (polite): "Bookmark saved", "Bookmark removed. Undo available.", "Bookmark renamed".
- Contrast of muted text meets WCAG 2.2 AA (4.5:1) in both themes; hit targets at least 24x24 px.

### Security boundaries

Renderer cannot write arbitrary URLs (only ids and flags); main re-validates on load, save and open; credentials never stored; no page fetch; no new IPC channel; `overlay` only changes bounds of the sender's own detached view.

### Migration and rollback

New file only; no migration. Rollback = revert the PR; the orphaned `browser-bookmarks.json` is ignored by older builds.

## EXECUTION_DAG

Parallel scopes are disjoint by file. T01 is the root.

### T01 Contract types and command parsing
- **Goal:** add `DesktopBrowserBookmark`, `DesktopBrowserBookmarks`, `DesktopState.browserBookmarks?`, and the seven command variants; strict parsing.
- **Depends on:** none.
- **Files:** `packages/desktop-contract/index.ts`, `apps/desktop/window-policy.ts` (`parseBrowserCommand`).
- **Inputs/outputs:** design above -> exported types; parser accepting exactly the documented shapes.
- **Tests:** extend `tests/desktop-native.test.ts` (or the existing `parseBrowserCommand` test file found by `grep -rn parseBrowserCommand tests`). Positive: each variant parses. Negative: extra keys, non-UUID id, title > 120 chars or empty, non-boolean `keepQuery`/`open`, `bookmark-add` with a `url` key, `bookmark-restore` with an invalid URL.
- **Done when:** `pnpm exec tsc -p . --noEmit` (or repo `pnpm typecheck`; discover in `package.json`) passes and new parser tests pass.
- **Handoff:** T02, T03, T05 owners.

### T02 Pure bookmark module
- **Goal:** implement `apps/desktop/browser-bookmarks.ts` (normalize, parse, mutate, serialize).
- **Depends on:** T01.
- **Files:** new `apps/desktop/browser-bookmarks.ts`, new `tests/browser-bookmarks.test.ts`.
- **Tests:** positive: `https://docs.example.com/guide?tab=api#install` -> `https://docs.example.com/guide`; with keepQuery keeps both; IDN host normalizes; duplicate detection; newest-first order; restore keeps id/createdAt. Negative: `https://user:pw@example.com/`, `http://127.0.0.1/`, `http://10.0.0.5/`, `file:///etc/hosts`, `javascript:alert(1)`, `about:blank`, 2049-char URL, 201st add -> `'limit'`, invalid JSON, `version:2`, mixed valid/invalid entries -> dropped count.
- **Done when:** `pnpm exec vitest run tests/browser-bookmarks.test.ts --maxWorkers=1` passes.
- **Handoff:** T03.

### T03 Main-process store, IPC and overlay
- **Goal:** load/save store, handle commands, scope broadcast, implement detached `overlay`.
- **Depends on:** T01, T02. First resolve D1 (read how the detached Browser window is created and where `{x:0,y:96,…}` bounds are applied in `apps/desktop/main.ts`).
- **Files:** `apps/desktop/main.ts` only (plus test helpers in `tests/`).
- **Tests:** extend `tests/desktop-state-broadcast.test.ts`: bookmarks present for main/Browser windows, absent for thread/plugin windows; revision increments once per mutation. Extend `tests/docked-browser-open.test.ts` (or the browser IPC test discovered there): `bookmark-add` uses the owned view's URL, ignores a foreign window, does not duplicate; `bookmark-open` routes through `allowRemoteBrowserUrl` (mock returns false -> no `loadURL`); write failure keeps list and rejects; invalid file renamed to `.invalid-…` with notice; `captureLayout()` output contains no bookmark data; `overlay` zeroes and restores detached bounds and is a no-op for docked.
- **Done when:** listed tests pass; manual check that store file has mode `0o600` in a test data dir.
- **Handoff:** T06.

### T04 Visual spec tokens check
- **Goal:** resolve the accent-color token (no `--accent*` token exists in `packages/ui-shell/tokens.css`; search `apps/web/src/styles.css` and `appearance.css`) and confirm the verified motion tokens `--ui-motion-popup-enter`, `--ui-motion-popup-exit`, `--ui-motion-insert`, `--ui-motion-remove`, `--ui-motion-hover`, `--ui-motion-spring` apply as specified; record exact names in the PR description.
- **Depends on:** none (parallel with T01-T03).
- **Files:** read-only: `packages/ui-shell/tokens.css`, `apps/web/src/appearance.css`, `packages/ui-shell/Popover.tsx`.
- **Done when:** each "discovery" token in the animation table is mapped to an existing token or the stated fallback.
- **Handoff:** T05.

### T05 Renderer UI
- **Goal:** star button, list button, save and list popovers, rename, remove with Undo, keyboard, live region, detached overlay messages.
- **Depends on:** T01, T04. (Can run against a fake bridge before T03 lands.)
- **Files:** `apps/web/src/DesktopBrowser.tsx`, new `apps/web/src/BrowserBookmarks.tsx`, `apps/web/src/desktop.css`. Resolve D2 by grepping `keydown` in `apps/web/src`.
- **Tests:** component tests if the repo has a React test setup (discover: `grep -rln "@testing-library" tests package.json`); otherwise covered in T06.
- **Done when:** UI matches DESIGN at 280 px, 520 px dock widths and detached window; no layout shift of the 96 px toolbar.
- **Handoff:** T06.

### T06 Browser-level tests
- **Goal:** e2e coverage in the synthetic fixture.
- **Depends on:** T03, T05. Resolve D3 in `tests/e2e/fixtures/browser-action.tsx`.
- **Files:** `tests/e2e/fixtures/browser-action.tsx`, `tests/e2e/browser-action.spec.ts` (or a new `tests/e2e/browser-bookmarks.spec.ts` using the same fixture), `tests/e2e/native-browser-bounds.spec.ts`.
- **Tests:** F1-F8 on docked and detached fixtures; keyboard-only path; `prefers-reduced-motion: reduce` emulation shows no transform animation; docked slot sends zero bounds while popover open; disabled star tooltip on `about:blank`; limit tooltip at 200.
- **Done when:** `pnpm exec playwright test tests/e2e/browser-action.spec.ts` (command discovered from `package.json` scripts) passes locally and in CI.
- **Handoff:** T07.

### T07 Real-app verification
- **Goal:** run the packaged/dev desktop app with `HARNESS_DESKTOP_TEST_DATA_DIR` set to a scratch directory and walk F1-F8 against a real public site (for example `https://example.com/`).
- **Depends on:** T06.
- **Evidence:** screen recording (light + dark, docked + detached), the store file contents (synthetic data only), restart persistence.
- **Done when:** acceptance matrix rows A1-A12 are PASS with evidence links.
- **Handoff:** T08.

### T08 Docs, PR and front end review handoff
- **Goal:** open the implementation PR with the template filled in, link this issue, attach recordings and screenshots, note whether a `docs/progress.md` row is needed (ask maintainer), and post a RELEASE checkpoint.
- **Depends on:** T07.
- **Done when:** PR open with green CI and evidence attached.
- **Handoff:** **Send the finished work to the front end team for review.** The implementing agent must request review from the front end team on the PR (UI, visual design and motion against this plan), post the review request link on this issue, and not merge until the front end team approves.

## VALIDATION

### Setup

```bash
pnpm install --frozen-lockfile
export HARNESS_DESKTOP_TEST_DATA_DIR="$(mktemp -d)"
```

### Planned commands (none executed for the feature yet)

- `pnpm exec vitest run tests/browser-bookmarks.test.ts tests/desktop-native.test.ts tests/desktop-state-broadcast.test.ts tests/docked-browser-open.test.ts --maxWorkers=1`
- `pnpm exec playwright test tests/e2e/browser-action.spec.ts tests/e2e/native-browser-bounds.spec.ts` (confirm exact script name in `package.json`)
- Repo typecheck and lint scripts from `package.json`.
- Regression: existing Browser navigation, ownership, bounds and popup-denial tests unchanged and passing.

### Acceptance matrix

| ID | Criterion | Requirement | Task | Check |
|---|---|---|---|---|
| A1 | Star saves current page in one click; star fills | R1, S1 | T03, T05 | T06 F1 |
| A2 | Popover shows normalized address and editable name | R2 | T05 | T06 F1 |
| A3 | No duplicate on second star click | R1 | T02, T03 | T02 unit, T06 F2 |
| A4 | List opens bookmark in owning Browser via admission | R4, S5 | T03 | T03 unit, T06 F3, T07 |
| A5 | Rename inline with Enter/Escape/blur rules | R5 | T05 | T06 F4 |
| A6 | Remove with 5 s Undo restoring same record | R6 | T02, T05 | T02 unit, T06 F5 |
| A7 | Docked and detached share the list live | R7, S2 | T03 | T03 broadcast test, T06 F8, T07 |
| A8 | Credentials/private/non-HTTP(S) never saved; query/hash omitted by default | R8, R9, S4 | T02, T03 | T02 negatives, T03 |
| A9 | Persists across restart; invalid file backed up with notice | R10, S3 | T03 | T03 unit, T07 |
| A10 | Limits 200 / 120 / 2048 enforced with messages | R11 | T01, T02, T05 | unit + T06 |
| A11 | Keyboard, screen reader names, live region, focus return | R12, S6 | T05 | T06 keyboard, T07 screen reader spot check |
| A12 | Motion per spec; reduced/off collapses; native view never over popover | R13 | T03, T05 | T06 reduced-motion + bounds, T07 recording |
| A13 | No bookmark data in layout save, backend, agents or other windows | X2, X5 | T03 | T03 tests |
| A14 | Front end team review requested and approved before merge | handoff | T08 | PR review state |

### Release gate

All A1-A14 PASS with linked evidence, CI green, front end team approval on the PR.

### Executed for this plan (publication only)

`pnpm check:docs-links` and `pnpm exec vitest run tests/public-source.test.ts --maxWorkers=1` on the docs PR branch. No feature tests were run because no feature code exists.

## STATE

- **Researched/decided:** scope, exclusions, storage owner, security model, UI and motion spec (this document, r1).
- **Implemented:** nothing.
- **Verified:** nothing for the feature.
- **Pending:** T01-T08.
- **Owners/branches:** none yet; the implementing worker claims on this issue per `AGENTS.md`.
- **Risks:** (1) toolbar crowding at the 280 px dock minimum (mitigated by collapsing Go); (2) detached overlay hiding needs a new main-side path (D1); (3) overlap with #1474 width presets editing the same toolbar file; rebase carefully.
- **Next step:** T01 — extend `DesktopBrowserCommand` and `parseBrowserCommand`, with parser tests.

## REFERENCES

- [openai/codex#34042 — Bring Atlas-grade browser features to Codex Desktop](https://github.com/openai/codex/issues/34042): open request for richer desktop browser features, including saving sites.
- [openai/codex#50622 — Add website bookmarks to a Codex project’s chat list](https://github.com/openai/codex/issues/50622): open request for saved website links inside the app.
- [Chrome Help — Create, find and edit bookmarks in Chrome](https://support.google.com/chrome/answer/188842?hl=en): star-to-save, edit name, remove model used for F1-F5.
- Gen-V1 [#1473](https://github.com/skytuhua-org/Gen-V1/issues/1473) / [#1509](https://github.com/skytuhua-org/Gen-V1/pull/1509): message bookmarks, separate feature.
- Gen-V1 [#1474](https://github.com/skytuhua-org/Gen-V1/issues/1474): docked Browser width presets, same toolbar.
- Source files at baseline: [`apps/web/src/DesktopBrowser.tsx`](https://github.com/skytuhua-org/Gen-V1/blob/8fa907f378127bcfc23d71b55c53625ffc43e8da/apps/web/src/DesktopBrowser.tsx), [`apps/desktop/main.ts`](https://github.com/skytuhua-org/Gen-V1/blob/8fa907f378127bcfc23d71b55c53625ffc43e8da/apps/desktop/main.ts), [`apps/desktop/window-policy.ts`](https://github.com/skytuhua-org/Gen-V1/blob/8fa907f378127bcfc23d71b55c53625ffc43e8da/apps/desktop/window-policy.ts), [`packages/desktop-contract/index.ts`](https://github.com/skytuhua-org/Gen-V1/blob/8fa907f378127bcfc23d71b55c53625ffc43e8da/packages/desktop-contract/index.ts).
