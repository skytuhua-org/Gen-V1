# Plan: Find text on the current Browser page

## META

- Feature: Browser Find in page; size **medium**; repository `skytuhua-org/Gen-V1`.
- Revision: 1, 2026-11-21. Baseline: `main@8fa907f378127bcfc23d71b55c53625ffc43e8da` (verified checkout).
- Status: researched execution plan only; feature NOT_IMPLEMENTED; runtime and visual verification NOT_RUN. This publication changes documentation and the source manifest only.
- Issue/PR: new publication; no matching Browser Find issue found across open/closed issue searches for Browser + find, title Find, and find-in-page. Publication links belong in the publishing PR and canonical issue journal, avoiding self-referential source edits.
- Provenance: batch 11 row 2 and scope note 2, reproduced substantively below; source inspection at the baseline; Electron 45.2.0 API documentation; existing plans `ux-chat-header-status.md`, `ux-composer-crowding.md` and issues #1138/#1629 as publication/structure examples.
- Related, not dependencies: terminal Find [#1476](https://github.com/skytuhua-org/Gen-V1/issues/1476); Browser responsive widths [#1474](https://github.com/skytuhua-org/Gen-V1/issues/1474), open PRs [#1501](https://github.com/skytuhua-org/Gen-V1/pull/1501) and [#1517](https://github.com/skytuhua-org/Gen-V1/pull/1517); network proxy [#1531](https://github.com/skytuhua-org/Gen-V1/issues/1531), open PR [#1558](https://github.com/skytuhua-org/Gen-V1/pull/1558). None is assumed merged. Recheck before implementation.

## OBJECTIVE

Users reading a long page in Gen's manual Browser cannot search its text through the navigation-only toolbar. Add a native Electron Find bar in both docked and detached Browser. A query highlights native page matches, displays “n of m”, and moves forward/backward without exporting page text to Gen. Success means native highlights, accurate current-request counts, scoped keyboard behavior and reliable reset/focus, not just a rendered toolbar or a mocked count.

## REQUIREMENTS

| ID | Agreed behavior / constraint |
| --- | --- |
| R01 | Provide an explicit “Find in page” toolbar button in both Browser layouts. Open focuses/selects the query. Reopen while open selects the current query rather than starting another session. |
| R02 | Search the owning BrowserRecord's WebContentsView with native `findInPage`; case-insensitive literal text, no regex/options panel. Nonempty input is searched after 120 ms debounce; preserve spaces and Unicode, never trim the user's search. Empty query clears highlights/count without calling Electron with empty text. Bound query to 1,024 UTF-16 code units, rejecting over-limit IPC instead of silent truncation. |
| R03 | Show current ordinal and total “n of m”, including “0 of 0” for a completed zero-hit query. Enter/Shift+Enter and accessible next/previous buttons move and wrap in the current query; immediate Enter flushes debounce. Never let Enter submit the address form or navigate. |
| R04 | Fence results by Electron request ID AND Browser identity, owner/custody epoch, document epoch and query revision. Old partial/final events and rejected stale promises cannot change a new query, owner or closed bar. |
| R05 | Escape anywhere in the active Find controls closes, invalidates pending work, calls `stopFindInPage('clearSelection')`, and returns focus to that owning native Browser view. Close button is equivalent. Never use activateSelection (would click a page link). |
| R06 | Ctrl+F on Windows/Linux and Cmd+F on macOS open Find only while native Browser page or its toolbar/Find controls have focus. No global shortcut and no interception in Conversation Find, terminal, editor, composer, another window or plug-in. Unrelated modifier combinations and IME composition are not consumed. |
| R07 | Reset query, count, errors, highlights and pending work on main-frame navigation (including history, reload and same-document navigation), view handoff, owner loss/close or renderer crash. No query persistence, logs, telemetry, layout storage or restoration across those boundaries. |
| R08 | Docked and detached behavior is identical. Find chrome must reserve real space above the native view, including animation, resize, zoom and narrow widths; native content cannot paint over controls. Preserve docked slot modal/occlusion shielding and divider hit targets. |
| R09 | States: empty, searching, matches, no matches, recoverable error; counts remain bounded integers and no stale ordinal flashes. No-match is informational, not a navigation error. Native failure offers retry by editing/re-submitting query and leaves address/back/forward usable. |
| R10 | No script injection, executeJavaScript, DOM traversal, page text extraction, selection text, network fetch, server endpoint or agent tool. Return count/ordinal metadata only, not Electron selectionArea. Preserve trusted-sender checks, plug-in denial, session sandbox, proxy, public-URL admission and permissions. |
| R11 | Accessible names, visible focus rings, polite result announcements, reduced motion and responsive layout as specified below. Finish with front end team review. |

### Non-goals and compatibility

This is manual current-page Find, distinct from Conversation Find, batch 6 terminal Find and M06/M16 automated browser lanes. No cross-tab/site search, replacement, saved queries, search history, bookmarks, reading page content into Gen, navigation-policy changes, agent access or new Browser permissions. Native Chromium matching semantics (frames, hidden text, PDF/viewer limitations, dynamic pages) are not reimplemented. Document unsupported native page behavior honestly. Browser-less web mode must not acquire an inert Find control; existing desktop capability gating remains.

## REPO_MAP

Verified at baseline:

| File / symbol | Present behavior and required integration |
| --- | --- |
| `apps/web/src/DesktopBrowser.tsx`: `DesktopBrowserToolbar` | Address/navigation form; actionSequence fences local errors. Add separate Find form and controls, not nested inside navigation form; fence its own commands. |
| Same file: `DesktopBrowserSurface`, `DesktopBrowserSlot`, `DesktopBrowserDock` | Detached native placeholder, docked measured slot, dock wrapper. Slot uses ResizeObserver, mutations, rAF, browserSlotRect, modal/occlusion checks and zero-bounds cleanup. Reuse rather than bypass these protections. |
| `apps/web/src/desktop-context.tsx`: `useDesktop`, DesktopValue | Exposes bridge, window context and owner-scoped browser state. Use existing state subscription rather than a second result transport. |
| `apps/desktop/main.ts`: `BrowserRecord`, `browserRecord`, `browserState` | Native view, owner, navigation generation and networkReady; navigation/crash listeners. Add separate ephemeral Find controller; never reuse navigation generation for queries. |
| Same file: `snapshot`, `broadcast` | Sends each window only its attached browser state. Publish Find metadata through this path, never a global browser-result bus. |
| Same file: `moveBrowser`, `loseBrowserOwner`, browser close branch | Ownership/reset/disposal boundaries. Reset before moving the native view; remove Find listeners when disposed. |
| Same file: `channels.browser` handler | Parses strict command; chooses record.browser or record.dockedBrowser. Bounds handled before networkReady and navigation generation increment. Find must also branch before those navigation-only operations. |
| Same file: `moveBrowser` and `openSurface` resize handler | Detached view has hard-coded y=96 and height-96; opening Find requires changing both, not only CSS. |
| `apps/desktop/window-policy.ts`: `parseBrowserCommand` | Strict plain objects and exact key counts; add Find variants with bounded text and strict identifiers/integers. `pluginDesktopChannelAllowed` currently denies browser IPC and must continue to do so. |
| `packages/desktop-contract/index.ts` | DesktopBrowserState, DesktopBrowserCommand, DesktopBridge.browser Promise<void>, DesktopState, DESKTOP_CHANNELS. Extend existing channel/state; no new page preload. |
| `apps/desktop/preload.ts` | Existing browser invoke bridge; preserve narrow surface. New command union uses the existing invoke path. |
| `apps/web/src/desktop.css`, `shell.css`, `native-chrome.css`, `workspace-canvas.css` | 96px toolbar, detached header drag region, dock minimum heights and native slot margins. Update only Browser-specific geometry needed for extra row. |
| `packages/ui-shell/tokens.css`, `controls.css` | Existing motion/easing/focus token conventions. Reuse, do not change shared token definitions for this feature. |
| `tests/desktop-native.test.ts`, `docked-browser-open.test.ts` | Parser, sender, URL/proxy and ownership regressions. Extend Find parser tests here. |
| `tests/browser-lifecycle-cleanup.test.ts`, `desktop-state-broadcast.test.ts` | Cleanup failures and actual publisher executed without Electron. Extend with Find reset and owner-scoped result coverage. |
| `tests/native-browser-bounds.test.ts`, `tests/e2e/native-browser-bounds.spec.ts` + config/fixture | Native geometry and DOM slot occlusion checks. Extend to opening/closing Find. Config currently uses msedge, so install/declare that channel or report unavailable, never silently claim a desktop check. |
| `tests/e2e/desktop-surfaces.spec.ts` + config, `tests/installed-desktop-verification.test.ts` | Existing surface fixtures and installed-desktop verification precedent; inspect harness before adding native Find checks. Browser fixtures are not proof of Chromium highlighting. |
| `scripts/public-source-files.json` | Register every new source/test/fixture per repository convention; runtime entries only where packaging requires them. |

New paths named below are proposed, not existing interfaces. No general native Find integration harness was verified; T01 must choose the smallest reusable installed-desktop path and publish the exact command before T05.

## DESIGN

### Native controller and state

Proposed new `apps/desktop/browser-find.ts` exports a small testable controller with injected native `findInPage`, `stopFindInPage`, focus and state-publish callbacks. It owns query text in memory, open flag, document/custody epoch, revision, current Electron request ID, phase and counts. BrowserRecord owns exactly one instance for its lifetime. Do not duplicate native sessions in each renderer. Keep query-bearing state scoped to the current owner through snapshot; do not write it into remembered layouts or backend state.

Proposed contract additions (final names should remain consistent across parser, writer and reader):

```ts
type BrowserFindPhase = 'empty' | 'searching' | 'matches' | 'no-matches' | 'error';
interface DesktopBrowserFindState {
  epoch: number; revision: number; open: boolean; query: string;
  phase: BrowserFindPhase; activeMatchOrdinal: number; matches: number;
  error?: string;
}
// DesktopBrowserState gains find: DesktopBrowserFindState.
// Extend DesktopBrowserCommand, keeping browser(command): Promise<void>:
type FindCommand =
  | {type:'find-open'}
  | {type:'find-query'; epoch:number; revision:number; text:string}
  | {type:'find-step'; epoch:number; revision:number; forward:boolean}
  | {type:'find-close'; epoch:number}
  | {type:'find-focus'; epoch:number};
```

Epoch is main-generated and monotonically advances on navigation, reset and handoff; initialize nonnegative safe integers. Revision is monotonically increasing within an epoch, allocated by the renderer per query edit, accepted only if greater for find-query, equal for step. Epoch mismatch fails closed without acting on the new owner. Query command empty text clears and publishes empty phase; over-limit/control input rejects safely (reject NUL and line breaks, allow normal spaces/Unicode). Exactly typed booleans, safe integer epoch/revision and exact keys are mandatory. Reopening is idempotent and focuses query through an owner-scoped open/focus sequence in state: add `focusSequence:number` to Find state, increment on explicit open, so repeated native Ctrl+F selects the input even when already open. Do not use a permanent focus effect on every result update.

Resolve sender and browser through existing trusted wrapper and current owner. Check `browser.owner === record`, registry identity, live native contents and epoch before acting; never accept renderer browserId/windowId/webContentsId. find-open must require current Browser focus for keyboard dispatch (button is explicit user intent). find-focus is used only after validated close: retain the post-close epoch returned in state and focus only if it still matches, preventing focus theft after navigation. Prefer native close operation that clears and focuses synchronously; find-focus is only needed for renderer close-animation completion and must not resurrect a session.

### Data/control flow and fencing

1. Toolbar button or scoped keyboard dispatch opens main-owned Find; main focuses owner shell webContents, increments focusSequence, broadcasts. Shell then focuses/selects input. Native page `before-input-event` is required because React never sees page keystrokes; install it on the Browser WebContents, not globally. On native page keyDown Ctrl/Cmd+F with no Alt/other modifiers and no composition, prevent default and open only that live owned Browser. Shell handler is attached to Browser toolbar subtree only; coordinate event defaultPrevented so Conversation Find does not also run.
2. Input changes clear displayed old count immediately, cancel pending debounce and schedule query after 120 ms. Submit cancels debounce, sends latest query and waits for acceptance before step; do not step the old revision. Serialize query/step commands; each rapid repeated step must wait for prior request acceptance/final result or be queued with a bounded queue (maximum 20, discard on reset). Ignore composition until compositionend. Clear input sends an immediate empty query.
3. Before a new native query, invalidate the previous request token, clear native selection, install searching state and call native Find on the record's view only. Store returned request ID against epoch/revision/owner before accepting asynchronous events. Wrap synchronous native throws and rejected bridge calls as recoverable Find errors with no page data in the message.
4. Electron `found-in-page` includes requestId, activeMatchOrdinal, matches, selectionArea, finalUpdate. Check current live registry, owner, epoch, revision and requestId on every event. Only matching finalUpdate publishes final counts; intermediate updates may keep searching but cannot announce a final count. Validate nonnegative safe integers and ordinal <= total; normalize zero matches to ordinal zero. Never send selectionArea or page snippets. Maintain native highlights after finalUpdate; do not copy the documentation example that stops on every final result.
5. Next/previous uses same query and native direction, replacing request token for each invocation; display searching while pending, then final “n of m”. Electron 45.2.0 docs say findNext true for initial and false for follow-up, despite the name being easy to misread. T01 must prove initial/continuation options against the installed Electron build with a three-match fixture (forward 1→2→3→1 and reverse) and inspect the installed API/type/source if behavior differs. Encode verified flags in the adapter and regression tests; do not ship unverified documentation assumptions or invert by intuition.
6. Close/reset invalidates pending debounce, steps, requestId and epoch before stopFindInPage('clearSelection'). Main reset closes bar, empties query/count/error, and publishes new epoch. Explicit close returns focus to native contents synchronously if still live/owned; navigation and handoff resets must NOT steal focus. Guard stop failures on destroyed contents and still clear local state. Crash shows existing Browser recovery error, not stale Find results.
7. Reset on admitted navigation commands before async navigation, main-frame did-start-navigation and did-navigate-in-page; filter main-frame event arguments so subresource loads do not reset Find. Do not reset on every did-start-loading (dynamic subframes could trigger it). Cover rejected navigation: clear Find conservatively but preserve existing URL denial. Reset before moveBrowser detach/reattach, close, loseBrowserOwner and disposal, and on renderer recovery. Listener registration is once per view; no accumulating per-query listeners.

### Geometry, integration and privacy

Use a real inline Find row below the address row, never a DOM overlay above native content. Docked slot ResizeObserver already measures layout changes; preserve shielding. For detached views, reuse measured DesktopBrowserSlot behavior by explicitly supporting detached bounds in main: permit bounds only from the authenticated window for its own attached Browser, clamp using nativeBrowserBounds and current zoom. Replace both fixed 96px resize paths with a stored owner-approved content rectangle and a safe initial hidden rectangle until the renderer supplies measured bounds. Do not leave a native y=96 fallback that overwrites an open Find row on resize. Generalize slot lifecycle to either Browser identity; keep zero bounds during missing/occluded layout. Validate on native-titlebar Windows as well as ordinary header layout. Update shell stacked minimum sizes from actual closed/open toolbar heights without broad CSS rework.

No database migration or feature flag is needed. All Find state is ephemeral. Rollback is the focused feature commit(s), including contracts/readers/writers together; no saved state requires conversion. Query and native result events must not appear in logging, diagnostics, agent context or crash reports. Count-only owner-scoped IPC and existing trusted sender checks remain the authority boundary, not renderer focus assertions.

## Visual design and animation spec

- Keep existing header 44px + address row 52px = 96px closed toolbar. Add Find button (Search icon, 15px, existing icon-button) adjacent to Go; title/aria-label “Find in page”, aria-expanded, aria-controls referencing unique owner-local row. Do not make it another Browser close icon.
- Expanded row: 44px high, border-bottom 1px var(--border), background var(--surface), horizontal padding 9px, gap 4px; toolbar becomes auto height with fixed base rows, flex-shrink 0, no overflow-hidden clipping of focus rings. Input flex:1/min-width:0, 12px text, padding 7px 9px, radius 6px, canvas background and control-border as existing address input. Buttons at least 28px square, 14px chevrons, X close, no text-only unlabeled icon.
- At toolbar width below 360px use two rows (input + close, then count + previous/next); Find region height 76px. Keep input at least 96px where panel minimum permits; no horizontal scroll or truncation of count. Address row may shrink input but retains existing navigation actions. Preserve window drag/no-drag regions; Find is not draggable.
- Tokens: var(--surface), var(--canvas), var(--text), var(--muted), var(--border), var(--control-border), var(--hover), var(--danger), var(--ui-focus-ring). No hard-coded highlight colors for page matches; Electron owns those. Match count uses tabular numerals, 11px muted text with a reserved 64px minimum; no count-width jumping.
- Empty: placeholder “Find on this page”, count “Type to find”; next/previous disabled. Searching: “Searching…” with no stale ordinal; close/edit always enabled. Matches: “2 of 7”, controls enabled. No matches: “0 of 0” and “No matches” accessible description, no red whole-bar error. Error: “Find unavailable. Try again.” in danger text, input and close retained; retry Enter/search edit enabled, step disabled. Error is separate from navigation error header.
- Open: reserve target row space immediately and update native bounds in rAF; animate inner content opacity 0→1 and translateY(-4px)→0 for var(--ui-motion-popup-enter) = 180ms, var(--ui-ease-enter) = cubic-bezier(.16,1,.3,1). Do not animate native bounds or row height frame-by-frame. Close: clear highlights/focus immediately, disable row interaction, inner opacity 1→0/translateY(-4px) for var(--ui-motion-popup-exit) = 140ms, var(--ui-ease-move) = cubic-bezier(.4,0,.2,1), then remove row/reserve and measure slot. Cancel old exit on reopen; reset/handoff removes immediately without exit animation or focus stealing.
- Reduced motion (prefers-reduced-motion: reduce and existing ui-shell reduced-motion convention): no translation, opacity-only 80ms var(--ui-motion-press); reset remains immediate. No spring, count pulse, continuous spinner or layout animation.
- Focus: 2px solid var(--ui-focus-ring), offset 2px, never clipped; keyboard order query → previous → next → close. Use a separate form with role=search and aria-label “Find on current Browser page”; query aria-label “Find on page”; buttons “Previous match (Shift+Enter)”, “Next match (Enter)”, “Close Find (Escape)”. A role=status aria-live=polite aria-atomic=true region announces only settled results for latest revision, at most once per settled request; empty state is quiet. Include “No matches” in zero-hit announcement. Do not announce every intermediate native update or move focus on counts. aria-keyshortcuts for platform-appropriate Find and navigation keys; disabled controls use native disabled.

## EXECUTION_DAG

One implementer owns shared contracts/native integration sequentially; T04 may have a separate UI owner only after T02 contracts are fixed, with no overlapping native files. Every task requires reading this plan and issue journal, a claim/ACK per AGENTS.md, and an issue checkpoint with exact source SHA, tests and next recipient. Newly named files must be registered in the source manifest by their owning task. No task is done merely because compilation passes.

### T01 — Rebase, native API proof and integration inventory
- Dependencies: none. Input: baseline and related PRs above. Re-read main AGENTS.md, current Browser code, Electron pinned version/types; check open claims and related PR merge status before branching from current main.
- Files: inspect main.ts, window-policy.ts, desktop-contract, DesktopBrowser.tsx, desktop CSS, native bounds and installed-desktop tests. Prepare a synthetic page with exactly three repeated words through the existing isolated test fixture mechanism (no production policy relaxation or public deployment); select harness for actual Electron check.
- Output: issue checkpoint with current baseline, verified findNext initial/continuation flags, exact desktop test command/fixture and keyboard/focus strategy. If native semantics or supported harness cannot be proven, mark native acceptance blocked rather than replacing it with DOM injection.
- Tests: new search advances/wraps both directions, empty is never sent; native stop clearSelection removes highlights without activating a link. Negative: unrelated WebContents is untouched.
- Done when: adapter flag behavior and harness are reproducible. Handoff: T02/T03 owner; no product-code changes beyond isolated fixture/probe here.

### T02 — Strict contract/parser and controller
- Dependencies: T01. Files: desktop-contract/index.ts, window-policy.ts, proposed browser-find.ts; tests/desktop-native.test.ts and proposed tests/browser-find.test.ts.
- Implement types/state/commands above, exact-key parser and controller with injected native edges. Inputs: trusted owner/session metadata and validated commands; outputs: owner-scoped Find state and native requests. Controller must reset without touching Browser navigation generation.
- Tests: normal query/results/next/prev; empty, spaces-only and Unicode; 1,024 boundary/over-limit, NUL/newline, invalid prototypes/arrays/keys/booleans/epochs; no match; native throw; partial/final ordering; old ID, old revision, old epoch, closed owner and stale query rejection. Prove clearSelection on clear/close/reset and no activateSelection.
- Done when: deterministic tests show late results cannot overwrite new/closed/handoff state; parser denies arbitrary target IDs and plug-in channel remains denied. Handoff: stable contract/controller to T03 and T04; T04 cannot edit these shared files independently.

### T03 — Wire native ownership, keyboard, reset and bounds
- Dependencies: T02. Files: main.ts BrowserRecord/browserRecord, snapshot/broadcast, channels.browser, moveBrowser/loseBrowserOwner, close/recovery/resize; preload.ts only if required by typed bridge; tests/browser-lifecycle-cleanup.test.ts, desktop-state-broadcast.test.ts, native-browser-bounds.test.ts and proposed tests/browser-find-native.test.ts.
- Instantiate controller per view, subscribe once to found-in-page and native before-input-event, route commands before networkReady/navigation generation, validate sender+custody and reset on every specified boundary. Send only current owner metadata. Generalize bounds to owned detached view and remove hard-coded resize overrides; keep nativeBrowserBounds clamping/zoom.
- Tests: two independent Browsers, late events after moving A to another owner, page and shell Ctrl/Cmd+F dispatch, close/crash/destroy even if stop throws, same-document vs subframe navigation, no request races with async URL admission. Negative: foreign window/plug-in cannot search or set bounds, Find doesn't increment navigation generation or modify proxy/admission behavior.
- Done when: actual dispatch sites call tested helpers and owner-isolated snapshots; both fixed detached geometry paths replaced safely. Handoff: T04 state/native edges and T05 native integration evidence.

### T04 — Toolbar UI, measured layout and accessibility
- Dependencies: T02 contract; T03 required for integrated completion. Files: DesktopBrowser.tsx, desktop.css, Browser-specific shell.css/native-chrome.css/workspace-canvas.css only if necessary, proposed tests/e2e/browser-find-fixture.tsx and tests/e2e/browser-find.spec.ts plus focused config modeled on desktop-surfaces config.
- Implement separate form, scoped shortcut, 120ms cancellable query debounce, serialized Enter/steps, close/reset and focusSequence effects. Generalize slot for docked/detached without losing overlay shielding. Apply complete visual spec; ensure query editing/reopening cannot receive stale promise error/count.
- Tests in fixture: open button and scoped key, repeated open selects, Enter/Shift+Enter, empty/no-hit/error, composition, rapid edit then Enter, stale response on close, Escape focus request, disabled navigation, narrow layout, reduced motion, modal occlusion, bounds after close/reopen/resize. Negative: composer and terminal Ctrl+F not intercepted; search Enter never submits navigation form.
- Done when: scoped Playwright test asserts UI behavior, screenshots show all four settled states in both layouts at 240/360/520px panel widths and light/dark themes, with focus rings and no clipping. Handoff: T05; browser fixture counts are explicitly synthetic, not native evidence.

### T05 — Native integration, regressions and evidence
- Dependencies: T03/T04. Files: extend selected installed-desktop harness from T01 or proposed tests/desktop-browser-find.integration.ts (discovery, not existing); extend tests/e2e/native-browser-bounds.spec.ts/fixture for row geometry. Add user documentation in the Browser section located via `rg -n 'Browser' docs` (verify actual path first).
- Run validation below, then actual desktop: three matches, wrap both ways, zero matches, rapid query replacement, Escape clear/focus, page-focus shortcut, unrelated focus shortcut, navigation/reset, resize/zoom, detach/handoff and two independent views. Record Electron/OS/version and evidence. Never weaken URL policy for a local fixture: use test-only native setup in an isolated test profile or an admitted public synthetic page; production URL parser unchanged.
- Negative cases: zero/invalid result metadata; destroyed view; renderer recovery; stale event after handoff; hidden/occluded slot; URL denial stays unchanged. Native highlight and focus must be observed in actual Electron, not inferred from mocked state.
- Done when: acceptance matrix all passes with exact command logs/screenshots/recording on issue, or explicit blocked gates with no completion claim. Supported Windows native-titlebar verification requires an authorized Windows verifier; macOS Cmd behavior requires macOS verifier, not Linux simulation described as native proof. Handoff: T06 with current PR/SHA and remaining platform gates, if any.

### T06 — Send finished work to the front end team for review (final task)
- Dependencies: T05 acceptance evidence. Recipient: front end team. Post full HANDOFF checkpoint on canonical issue with implementation PR, pushed SHA, plan revision, task/acceptance states, screenshots of empty/matches/no-match/error, docked/detached and narrow views, keyboard/focus recording and reduced-motion evidence, exact automated/native check outputs and any limitations.
- Request review of layout, tokens, animation, native content separation and a11y against this spec; send the finished work, not a request for the team to invent the design. Remain HANDOFF_PENDING until ACK; apply requested fixes and rerun affected checks. Done when ACK and review disposition are recorded and required changes resolved. Release ownership per AGENTS.md; never close or merge without authorization.

## VALIDATION

### Reproducible commands (planned implementation checks)

From repository root; source nvm on fresh Linux shell. Node 24 / pnpm 10 observed during research; Electron pinned 45.2.0. Install normally for native work (publication used --ignore-scripts because no native execution is needed).

```sh
source ~/.nvm/nvm.sh
pnpm install --frozen-lockfile
pnpm exec vitest run tests/browser-find.test.ts tests/browser-find-native.test.ts tests/desktop-native.test.ts tests/docked-browser-open.test.ts tests/browser-lifecycle-cleanup.test.ts tests/desktop-state-broadcast.test.ts tests/native-browser-bounds.test.ts
pnpm exec playwright test -c tests/e2e/browser-find.playwright.config.ts
pnpm exec playwright test -c tests/e2e/native-browser-bounds.playwright.config.ts
pnpm exec playwright test -c tests/e2e/desktop-surfaces.playwright.config.ts
pnpm typecheck
pnpm test:ui-guard
pnpm exec vitest run tests/public-source.test.ts
pnpm check:docs-links
```

browser-find tests/config above are new deliverables of T02–T04, not preexisting runnable checks. T01 records exact native integration command after inspecting harness; no invented packaged-app invocation is assumed. Keep fixture data synthetic: three visible repeated words, one nonmatching term, Unicode/space term, an ordinary link near a match, and a second page for reset. No real account/page data in evidence. Preserve tests for existing Browser open/navigation/proxy and native occlusion behavior. Collect test traces only from synthetic pages; never capture query-bearing user sessions.

### Acceptance matrix / prepublish requirement audit

| Check | Requirement | Tasks | Observable release gate |
| --- | --- | --- | --- |
| A01 | R01, R02 | T01–T04 | Both explicit buttons open/select; native three-hit search, Unicode/space term, empty clear and bound validation pass. |
| A02 | R03 | T01–T05 | Native n of m advances and wraps forward/back; immediate Enter uses latest query; form never navigates. |
| A03 | R04 | T02, T03, T05 | Deterministic late partial/final and promise tests prove old ID/revision/epoch/owner cannot publish. |
| A04 | R05 | T02–T05 | Escape/close clears highlights, doesn't activate link and restores focus to same live native page. |
| A05 | R06 | T03–T05 | Native page and Browser chrome shortcut work; conversation/editor/terminal/composer/other window/plugin retain their behavior. |
| A06 | R07 | T02–T05 | Navigate/back/forward/reload/same-document/handoff/crash clear query/highlights, no old events revive them; subframe loads don't clear. |
| A07 | R08 | T03–T05 | Actual native view below entire Find row at zoom/resize/narrow/titlebar; modal and dividers remain usable in both layouts. |
| A08 | R09 | T02, T04, T05 | Empty, searching, hit, zero-hit, error/retry states and destroyed native edge covered; navigation controls still function. |
| A09 | R10 | T02, T03, T05 | Diff/security review confirms count-only owner IPC, denied plug-ins, no injection/extraction/persistence/logging/navigation-policy changes. |
| A10 | R11 | T04–T06 | Visible focus, names/live region, reduced motion screenshots/recording pass; front end team receives finished work and ACKs review. |

All implementation commands and visual/native checks here are PLANNED, NOT_RUN in this docs-only publication. Publication-specific public-source/docs-links results belong in PR and issue checkpoint, not invented as feature acceptance. Release gate: automated checks, native supported-platform evidence and front end review; review-ready is not merged or verified on main.

## STATE

- Researched/decided: scope, proposed strict IPC, owner/request fencing, UI/motion, test split and execution DAG above. No matching Browser Find issue identified in open/closed searches on research date; terminal/conversation Find do not satisfy this task.
- Implemented: nothing. Verified: repository paths and present control flow by source inspection only; no native Find run, no UI render or platform claim. Implementation owner NONE; T01–T06 NOT_STARTED. Publication branch/PR/issue and actual doc checks recorded in canonical issue journal when published.
- Risks: Electron findNext documentation can be misread (T01 runtime proof required); native page and shell focus live in different WebContents (T03/T05); view z-order hides DOM overlays (inline row and measured bounds); late events across navigation/owner changes (epochs plus ID); unrelated Browser width/proxy PRs touch same files (rebase and coordinate, do not import their scope). Dynamic pages can alter native counts; no promise to track DOM mutations outside Electron's native result semantics.
- No data migration, backend dependency or navigation-policy change approved. Any requirement change must update full source and issue body together and retain immutable prior checkpoints.
- Exact next action: implementing agent reads canonical issue/journal and current AGENTS.md, claims T01, branches from current main, rechecks related PR states, then proves native request/continuation/clear behavior with the synthetic fixture. Do not start implementation merely because this plan PR exists. Final recipient is front end team at T06; no review ACK yet.

## REFERENCES

- [Baseline source](https://github.com/skytuhua-org/Gen-V1/tree/8fa907f378127bcfc23d71b55c53625ffc43e8da) and [publication contract](https://github.com/skytuhua-org/Gen-V1/blob/8fa907f378127bcfc23d71b55c53625ffc43e8da/AGENTS.md).
- [Electron 45.2.0 WebContents API](https://github.com/electron/electron/blob/v45.2.0/docs/api/web-contents.md): findInPage takes nonempty text and returns request ID; found-in-page emits ordinal/count/ID/finalUpdate; stopFindInPage clearSelection clears, keepSelection retains normal selection, activateSelection focuses/clicks. Only clearSelection is appropriate here; see T01 semantics gate.
- [Codex Browser feature request #34042](https://github.com/openai/codex/issues/34042): demand for richer manual Browser controls, not authority to expand this scope.
- [Chrome search help](https://support.google.com/chrome/answer/95440?hl=en): familiar current-page Find keyboard interaction.
- Batch 11 scope, reproduced so private proposal access is unnecessary: manual Browser currently supports navigation/back/forward/reload/stop/close/bounds; v1 uses Electron native Find on owning view, request-ID fencing, count, Enter/Shift+Enter, Escape clear/focus, Browser-focus-only Ctrl/Cmd+F, navigation/handoff reset, docked/detached parity; no script injection, content reads, policy change or automated-lane integration.