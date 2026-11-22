# Plan: Keep project file previews open

## META

| Field | Value |
| --- | --- |
| Feature / size | Keep project file previews open / medium |
| Repository | skytuhua-org/Gen-V1 |
| Revision / date | r1 / 2026-11-22 |
| Verified baseline | `main` at `2640b897a42739eba3785fc934af882996c07097` |
| Plan source | Maintainer feature row: “Pin a few Files previews so you can switch back to the same files while browsing other folders or opening search results.” Binding v1 scope and VS Code references supplied with the assignment; source inspection at the baseline above. |
| Issue / PR | No exact feature issue found by title search; broader pinned-preview search returned related features, not this scope. No issue or PR created: this assignment explicitly requires local-only planning and a local commit. |
| Related work | [#1344](https://github.com/skytuhua-org/Gen-V1/issues/1344), [#1583](https://github.com/skytuhua-org/Gen-V1/issues/1583), [#1585](https://github.com/skytuhua-org/Gen-V1/issues/1585); integration details below. |
| Implementation | NOT_STARTED. This document proposes implementation, never claims feature tests have run. |
| Publication | Deferred by instruction. This local file is the complete plan source, not a published issue body or attachment. HANDOFF_INCOMPLETE for remote retrieval until publication is authorized. |

`docs/agent-plans/changes-viewed-files.md` is absent at this baseline. The most recent plan-changing commit is the baseline merge (#1150); inspected `ux-linked-prs-dead-end.md` and `1235-t11-model-draft.md` as fallback examples. This plan retains the former's objective/requirements/map/design/DAG/validation/state structure and expands task contracts to the current AGENTS.md requirements.

## OBJECTIVE

Project Files has one `selected` entry. `ProjectFilesReader.onDirectory` clears that selection, and clicking a different file or Project Search result replaces it. A user comparing a handful of source files must repeatedly navigate back to reopen them. Keep up to six explicitly pinned **paths**, plus one replaceable preview slot, with one visible file body at a time. Pins survive folder browsing within the mounted owning Files view, not view destruction or checkout rebinding.

Success means a user can pin `src/config.ts`, browse another folder, preview a search result, and return to the pinned path using mouse or keyboard without a second pane, saved tab session, broader file authority, or background reads for inactive pins. Current working-copy content is read again on activation; a pin is a shortcut, not a snapshot.

## REQUIREMENTS

All decisions below are proposed implementation decisions within the binding scope, not implemented behavior. No further visual-design team is needed to design v1.

| ID | Binding requirement / flow | Task | Acceptance |
| --- | --- | --- | --- |
| R01 | Project Files only: ordered, unique raw project-relative pinned paths (maximum six), at most one replaceable preview path, one active path or none. Opening an already pinned path activates it without duplicating it. | T02,T03 | V01 |
| R02 | Explicit Pin/Unpin and Close controls. Pin appends in insertion order and removes the same path from the replaceable slot. At six, reject another pin without evicting anything; ordinary preview browsing remains available. | T02,T04 | V02 |
| R03 | Folder navigation still clears active selection, search match and replaceable slot; pins remain accessible even with “Choose a file” displayed. Selecting a pin does not change the folder breadcrumb/filter/search scope. | T03,T04 | V03 |
| R04 | File-list and search-result opens share one path-activation transition. Search carries its existing line/checksum context only for the current search open; ordinary pin activation clears that context. Same-file search selection refreshes content and keeps one pin/slot identity. | T03 | V04 |
| R05 | Pins belong only to the mounted Files reader and its project/thread/checkout binding. Unmount, project/thread change, or changed checkout binding discards all slots and aborts stale reads. Inactive-but-mounted views retain path metadata but do not read. | T01,T03 | V05 |
| R06 | Keep existing authenticated, authorized, on-demand reads, independent directory/file pending states, retry and refresh. No prefetch of pinned files, content cache per pin, new grants, or weakening of path guards. Late success/error cannot replace the active owner. | T01,T03,T05 | V06 |
| R07 | Keyboard-operable pin/unpin/select/close; deterministic focus after removal; unique visible labels for duplicate basenames; raw names remain read identities and `displayFilePath` is used for presentation. | T02,T04,T05 | V07 |
| R08 | Empty, loading, refreshing, stale-search and failed reads retain truthful feedback. A missing/denied pinned path is not silently removed or renamed: Retry or Close remains possible. No filesystem watch or automatic rename following. | T03,T04,T05 | V08 |
| R09 | Full visual and motion design below, light/dark, forced colors, narrow panels, reduced motion; six pins plus preview remain reachable without a popup. | T04,T05 | V09 |
| R10 | If #1344 lands first, every activation, close, folder switch and binding handoff must preserve its unsaved-change guard. No pin controls in edit mode. No per-pin editor/draft/session state. | T01,T03,T05 | V10 |
| R11 | No persisted tabs (local/session storage, journals, workspace layout), simultaneous previews, editor sessions, layout pinning, new Markdown/image rendering, or changes to GrantedFiles behavior. | T03,T05 | V11 |
| R12 | Finished implementation must be sent to the front end team for review, with evidence, not for missing design decisions. | T06 | V12 |

Flows: open A → Pin A → open B → Pin B → browse folder (selection clears) → select A (folder unchanged); open C from search → only transient slot replaced; close inactive B → A unaffected; close active A → successor rule below; unpin active A → A becomes the sole replaceable preview, replacing any previous transient path. Closing the final item returns to “Choose a file.” No automatic pinning by double click or edit is introduced.

## REPO_MAP

Verified by reading these files; future paths/symbols are explicitly marked proposed:

| Existing path / symbol | Role / change boundary |
| --- | --- |
| `apps/web/src/files/ProjectFiles.tsx`: `ProjectFiles`, `ProjectFilesReader`, `ProjectFile`, `readFolder`, `readFile` | Keyed reader currently uses `base + "?" + query`; owns path/selected/selectedMatch. Search onSelect updates match and selected; onDirectory clears both; preview checksum controls matching-line highlight. Primary orchestration target. |
| `apps/web/src/files/FilesView.tsx`: `FilesView`, `FilesEntry`, `displayFilePath` | Shared project/granted renderer; preview `<header>`, File content region, focus-request/openPreview mechanism, folder filter, breadcrumb, responsive tree, optional projectSearch. Add optional project-only strip/actions contract, not generic persistence. |
| `apps/web/src/files/useFilesRead.ts`: `useFilesRead`, `FilesRead` | AbortController plus generation and committed `owner` protect reads; same-key refresh keeps accepted content; key changes hide old content. Reuse rather than a hook per pin. |
| `apps/web/src/files/files.css` | `.files-preview`, direct-child header, `.files-preview-content`, `.files-unselected`, focus styles, container breakpoints 560px/400px. Existing `--files-inset` is 16px, reduced to 12px in narrow panels. |
| `apps/web/src/WorkspaceSurfaceBody.tsx`: `FilesBody`, `WorkspaceSurfaceBody` | FilesBody keys on base/query; query contains threadId. These keys alone do NOT detect same-project/thread checkout replacement. No existing binding token reaches ProjectFiles. |
| `packages/workspace/tools.ts`: `binding`, `files`, `file` | Host resolves root/workspace and checks canonical path/identity; directory and file operations check `.git` and worktree containment; file read uses `withPathGuard`, `readBoundFile` capped at 1 MiB. Need a small additive binding identity on these existing reads; no new endpoint or permission. |
| `apps/server/workspace-routes.ts`: `registerWorkspaceRoutes` | Existing GET project `/files` and `/file` directly delegate to host under host/origin/cookie/CSRF hooks. No preview-tab endpoint. |
| `packages/workspace/edit-journal.ts`: `checkpointScope`, `workspaceOwnerScope` | Existing SHA-256 binding-hash precedent. Not a pin store; do not use journal receipts to persist pins. Root fallback needs special care: inspect digest material before reuse. |
| `packages/ui-shell/tokens.css`, `apps/web/src/styles.css` | Space/row/motion tokens and global reduced-motion treatment. Use scoped Files styles; no design-system token changes required. |
| `tests/e2e/files-reading.spec.ts`, `files-reading-fixture.tsx`, `files-reading.playwright.config.ts` | Actual WorkspaceSurfaceBody fixture, project/thread/active controls; existing empty/binary/limit, retry, inactive cancellation, narrow-focus and granted ownership cases. Extend fixture for same-owner rebind and mount/unmount controls. |
| `tests/e2e/shared-panels.spec.ts` | Existing “directory navigation rejects a file response from the previous selection” must remain valid; browsing a folder still clears active content. |
| `tests/e2e/project-search.spec.ts`, `project-search-fixture.tsx`, `project-search.playwright.config.ts` | Search adapter fixture; tests cover matching-line preview, stale checksum, denied/late file reads, control-character paths and keyboard navigation. Extend for pin handoff. |
| `tests/files-read-commit-owner.test.ts` | Real Chromium/esbuild hook test: A's success/error still accepted when B renders but never commits. Preserve committed-owner semantics. |
| `tests/agents-workspace.test.ts` | Existing workspace test location; T01 discovers exact host fixtures/assertions before adding binding-identity coverage. No invented existing test symbol is assumed. |
| `scripts/public-source-files.json`, `tests/public-source.test.ts` | Register new source/test files when implemented. Current docs change registers only this plan. |

**Integration status checked on 2026-11-22:** #1344 is OPEN, not landed. PRs #1345 (plan), #1488, #1494, #1496, #1499, #1500, #1503, #1512 (client), #1520 (design), #1521 (browser) are OPEN with null mergedAt. Baseline ProjectFiles/FilesView contain no editor integration. Issue comments describe implementation in that unmerged stack, not shipped main behavior. T01 must recheck before implementation and read the resulting actual guard code rather than assume pending symbols exist.

[#1583](https://github.com/skytuhua-org/Gen-V1/issues/1583) is OPEN: rendered `.md` by default, Source switch, authorized text reuse and safe local references/search-line behavior. [#1585](https://github.com/skytuhua-org/Gen-V1/issues/1585) is OPEN: PNG/JPEG/GIF/WebP/SVG image view, Fit/100%, size, SVG Source and on-demand image reads. Neither is pinned-path management; both touch the same preview body. Do not copy their rendering implementation or claim either has shipped from issue status alone. Coordinate sequential edits to ProjectFiles and preserve whichever renderers actually land first. Layout panel pinning is a separate ownership/lifecycle layer and is unchanged.

## DESIGN

### State and ownership

Proposed pure state module `apps/web/src/files/pinned-previews.ts` owns `{ pins: FilesEntry[], transient: FilesEntry | null, activePath: string | null }`, maximum six unique pins. Store raw paths unchanged; no case folding, slash replacement, display-string keys, file contents, scroll offsets, editor instances or per-pin search matches. `selected` becomes derived from activePath and the slot entries, not a second independent state. selectedMatch remains current-open context in ProjectFilesReader.

| Event | Deterministic transition |
| --- | --- |
| OPEN(entry) | If path pinned, activate it; otherwise replace transient and activate it. Never add a pin implicitly. Same active path explicitly calls preview.refresh once. |
| PIN(active) | If already pinned no-op; if six pins return unchanged state and cap status; otherwise append active entry, clear matching transient, keep active path. Pinning does not reread content. |
| UNPIN(path) | Remove pin. If active, move it to transient (replace old transient); if inactive, forget it without changing active/transient. No read unless activation changes. |
| CLOSE(path) | Remove that pin or transient. If inactive, keep active. If active pin, choose next pin at the removed index, otherwise previous pin, otherwise transient, otherwise none. If active transient, choose last pin or none. Newly activated successor reads on demand. |
| DIRECTORY(next) | Clear transient, activePath and selectedMatch; preserve ordered pins; update path. No preview read while unselected. |
| OWNER_RESET / unmount | Empty all state and search context; old read cleanup aborts; no restoration on return. |

When selecting a pin from the strip, use the same narrow-layout openPreview focus handoff as file-list and search opens. Selecting a pin clears selectedMatch even if it was originally pinned while a search match was highlighted. Search selection retains its own sha256/line until the next ordinary activation/directory/reset. Do not resurrect old line highlights from pinned metadata.

### Checkout binding and reads

Base/query keys suffice for project/thread changes but not same-owner checkout replacement. **Required additive read metadata:** T01 adds an opaque `bindingId` string to the existing host `files()` and `file()` responses, computed from the admitted project/thread plus actual managed workspace identity or root identity. Use a deterministic SHA-256 digest of canonical binding identity material, including workspace id/path/filesystem identity and root fallback identity; exclude branch HEAD, content SHA and directory path so ordinary edits, commits and browsing do not reset pins. Do not return physical paths in this new field. Inspect `binding()` and stored `workspaceProjectRoot` / `workspaceBinding` data in T01; reuse hash helpers if appropriate, not a managed-only checkpoint scope with an empty root fallback. Extend local response types and fixtures; no new API route or new grant.

Capture/recheck binding around each asynchronous read; if it changed during a read, refuse that response rather than stamp old bytes with a new identity. Client adopts the first bindingId for this mounted reader. A later different bindingId from either accepted folder or preview read immediately hides old content, clears pins/transient/match, invalidates old generations and starts a fresh folder read; it must not apply the new response as the old selected file. Keep observed binding identity outside the resettable slot state so reset cannot loop. Missing/malformed metadata is an explicit load error with Retry, not permission to retain unscoped pins. Test mixed response ordering from old/new bindings, including error paths.

No watch or polling is added. A server-side rebind unknown to the UI is discovered on the next ordinary folder/file/refresh read; hide/reset before displaying that response. On resuming an inactive mounted view, revalidate folder binding before enabling preview. An explicit parent binding notification, if available when implementation starts, resets synchronously too. An authorization/binding failure leaves no readable old content; clear the slots on ownership-loss errors, while ordinary not-found file errors keep the pin for retry. T01 identifies actual host error codes/messages; do not treat every CAPABILITY_DENIED as a binding change since individual files can be denied.

Keep one `useFilesRead` for directory and one for active preview. Include adopted binding generation in their keys so a reset invalidates requests even when the raw active path is unchanged; preserve the hook's layout-effect committed-owner discipline. Selecting another pin cancels the previous read; disabling/unmounting aborts too. Retry rereads only active preview; Refresh retains folder refresh/searchRefresh behavior and refreshes active content, never all pins. Failed file activation keeps its header and strip, existing Retry and error text; content from a different path must never appear beneath it. Same-path refresh may retain accepted content with “Refreshing…” unless authority or binding is lost.

### Visual design and motion (implementation-ready)

**Placement/layout.** Inside `.files-preview`, render the strip **before** the existing direct-child header, independently of selected being nonnull. Do not hide it when Project Search has no active selection but pins exist: update the `data-selected=false` search layout rule to account for strip presence. No second pane or overlay. With no pins and no selected file, omit the strip; retain “Choose a file.” With one transient, show that item so Close is discoverable. Header keeps full active file name, plus Pin/Unpin; preview content/checksum/error remain below it.

- Strip is a horizontally scrollable single row, no wrapping, `flex-shrink:0`, `min-width:0`, surface background, 1px bottom `--border`. Padding `var(--ui-space-1)` vertically and `var(--files-inset)` horizontally; gap `var(--ui-space-1)` (4px). Height follows 32px controls plus 8px padding (40px total before border). Existing inset responds at 400px; preserve Files tree toggle at 560px.
- Item is a nonshrinking flex group, max-width 240px, min-width 112px; 6px radius matching Files buttons, 1px transparent border, no nested buttons. Main select button grows, 32px min-height (`--ui-row-compact`), 4px/8px padding (`--ui-space-1/2`), 6px icon/text gap, 12px type. Trailing Close is a sibling button, 32px square. A row's max-width includes Close. Focus scrolls the item into view with `block:nearest, inline:nearest`, never smooth scrolling.
- Pinned items precede transient. Use lucide-react `Pin` (14px) for pins, existing `File` (14px) for transient; `X` (14px) for Close; `PinOff` (14px) for header Unpin. These icon additions are proposed, not existing FilesView imports. Icons are decorative `aria-hidden`. All icons and Close stay visible, not hover-only. A 1px `--border` separator with 4px inline margin precedes transient when pins exist.
- Basename is primary, ellipsized. For duplicate raw basenames among visible slots, append ` · parent/path` using the full relative parent (root uses `.`), visually muted and ellipsized within the item; accessible names and title always expose the entire displayed relative path. Raw path remains identity. Apply `displayFilePath` to names, parents, titles and aria strings to expose control characters. Header title remains full displayed path.
- Below/alongside header actions show `N/6 pinned` in 12px `--muted`, not a badge implying content is cached. At six and an unpinned active path, Pin is `aria-disabled=true`, remains focusable with `aria-describedby` explaining “Six files are pinned. Unpin or close one to pin another.” Activation is a no-op except the same polite status, never eviction. Unpin stays enabled at six. Narrow header wraps actions with 8px gap; no menu or clipped actions.

**States.** Idle label `--text`, icon/suffix `--muted`, surface background. Hover uses `--hover` over 120ms. Active item uses `--accent-bg`, text `--text`, 2px inset bottom `--accent-fg` line and `aria-current=true`; preserve that line on hover, not color alone. Pin icon is a persistent shape distinction, independent of active. Keyboard focus uses existing 2px `--ui-focus-ring` inset outline on each button. In forced colors use Highlight outline for active and CanvasText borders, retain focus outline. Disabled cap action uses muted text plus explicit reason, not opacity alone.

Loading/refreshing show the existing status and skeleton in content, not six spinners. The active item can carry `aria-busy=true` while pending. Search checksum mismatch keeps the existing full “This file changed since the search…” status; no dirty dot on pins and no claim of cached freshness. Failed active read uses existing `files-error` and Retry; add visible `Unavailable` text adjacent to the active label, `--danger`, and the full error description via aria-describedby. Do not infer error on inactive pins or probe them in the background. No selected path: strip remains, header is absent, empty state remains below. At six plus transient, all seven items fit in the same scrolling row; no hidden overflow menu, pin count never exceeds six, active/focused item is scrolled into view.

**Semantics/keyboard.** Strip is `role=toolbar`, `aria-label="Open project file previews"`, with item groups and ordinary sibling select/close buttons, not ARIA tabs with missing panels. Select label: `Open <displayed relative path>, pinned` or `Open <displayed relative path>, preview`; Close label: `Close <displayed relative path>`; header action labels `Pin <path>` / `Unpin <path>`, with aria-pressed reflecting pin membership. One select button has roving tabIndex 0 (active, else last-focused surviving, else first); other select buttons -1. Close controls remain ordinary Tab stops for explicit keyboard access. This bounded maximum of seven Close stops favors discoverability over a hidden action menu.

| Key / context | Action |
| --- | --- |
| Tab / Shift+Tab | Enter/leave strip's roving select stop and reach each Close, header Pin and existing preview region; no trap. |
| Left / Right on select button | Move focus to previous/next select button, wrap; no file read until activation. |
| Home / End on select button | Focus first/last select without activation. |
| Enter / Space on select | Activate and focus preview through existing openPreview mechanism; on Close or Pin/Unpin activate that action. |
| Delete on select | Close focused item, prevent default; ignore composing events. Not bound inside preview text/editor/search/filter. |
| Escape | No new global binding; retain existing search and future editor Escape behavior. |

Closing via keyboard keeps focus in strip on successor select (same index then previous); closing final item focuses the preview region's “Choose a file” container, which must remain programmatically focusable. Closing inactive item never changes active content. Unpinning via header keeps focus on the action now labelled Pin; cap announcement does not steal focus. A single polite live status announces “Pinned <path>”, “Unpinned <path>”, “Closed <path>” or the cap reason; do not duplicate full file content announcements. Scope all handlers to the strip/control, ignoring composition and modified key chords; do not hijack Ctrl+Tab or Ctrl+1–9 thread switching.

**Motion.** Hover/background/color transitions use `var(--ui-motion-hover)` = 120ms, `var(--ui-ease-move)` = cubic-bezier(.4,0,.2,1). New pinned-item insertion fades opacity 0→1 only over `--ui-motion-insert` = 180ms with `--ui-ease-enter` = cubic-bezier(.16,1,.3,1). Active selection/underline updates immediately; do not animate content, horizontal position, strip height or width. Removal is immediate (focus and DOM ownership stay deterministic), no exit ghost or close delay. No spinner beyond existing loading feedback. Scope reduced-motion overrides to disable insertion and transitions for `prefers-reduced-motion:reduce`, root `data-motion=reduced/off`, and `.app-shell[data-panel-animations=false]`; scrolling is always instant. Verify these overrides in addition to the global stylesheet fallback.

### Integration, security and rollback

`FilesView` accepts a proposed optional `projectPreviews` controlled contract (items, active, pin count, cap state, status, handlers); only ProjectFiles supplies it. Shared GrantedFiles call sites remain unchanged. T04 can extract a strip component only if needed, registering any new file in the manifest. Names here describe proposed contracts, not existing APIs.

If editing lands, rebase and read the actual unsaved-change transition API first. Hide the entire strip and Pin/Unpin/Close actions in edit mode; pins remain metadata and return on Done. Do not bypass the existing guard via search, breadcrumb, close-successor selection or binding remount. Binding loss cannot keep old readable content, but draft recovery/guard behavior must remain the editor's responsibility, not a second pin-owned draft store. Test cancel/save/discard and rejected save before changing slot state. If the guard cannot represent binding-loss handoff safely, block integration and amend the complete plan rather than silently discard edits.

No persistent migration, schema version, new grant, external network load, analytics containing paths, or editor-session serialization. Additive bindingId metadata is the only host-facing extension. Rollback removes the strip/slot state and optional prop, restoring existing single-selection semantics; leave no stored records to migrate. Coordinate overlapping Files edits serially with #1344/#1583/#1585 owners and preserve their read-mode selection behavior if merged.

## EXECUTION_DAG

Common contract: implementing agent claims the canonical issue before work once publication is authorized, reads the entire current revision/journal, starts from current main and records exact SHA. Tasks are sequential to avoid overlapping Files edits: `T01 → T02 → T03 → T04 → T05 → T06`. Each task has one owner; no parallel worker edits the same source/test. All tasks must checkpoint and release per AGENTS.md. New names below are proposed files unless listed as existing in REPO_MAP.

### T01 — Rebase integration facts and establish checkout identity
- Prerequisites/input: baseline, R05/R06/R10, current main and related issue/PR states; no feature code assumed present.
- Edits: inspect merged #1344 guard and #1583/#1585 renderers if present; record actual symbols/rebase decisions in this plan. In `packages/workspace/tools.ts` add bindingId to `files`/`file`, with before/after binding validation and opaque digest as specified. In `ProjectFiles.tsx` extend response types; use existing route delegation unchanged unless a response schema requires the additive field. Inspect `tests/agents-workspace.test.ts` fixture structure and route-test locations before adding tests there or a focused new registered test file.
- Output/boundary: stable host binding contract and ownership-loss classification, not UI slots or permissions. Do not expose root paths or use HEAD as binding identity.
- Tests: stable digest for file edits/folder reads; changed workspace/root identity for same project/thread changes digest; rebind during held read refuses response; managed/root fallback both covered; existing containment/.git/size denial preserved. Empty directory still returns identity; unavailable binding fails closed.
- Done when: host cases pass, exact editor integration recorded, no hidden capability/new route. Handoff: contract and test evidence to T02/T03 implementing owner.

### T02 — Define deterministic slot transitions and labels
- Prerequisites/input: T01 binding contract, state table R01/R02/R07.
- Edits: proposed `apps/web/src/files/pinned-previews.ts` and `tests/pinned-previews.test.ts`; register paths in `scripts/public-source-files.json`. Implement pure slot transitions and label derivation; bound state at six pins plus transient; no read/UI side effects.
- Output/boundary: tested state and label helpers for T03/T04; do not modify hooks, renderer or CSS yet.
- Tests: normal open/pin/unpin/close order, empty state, duplicate opens, inactive close, every active successor case, seventh-pin rejection/no eviction, duplicate basenames/root label/control characters with raw identity intact; malformed/unknown transition targets no-op safely.
- Done when: state invariants hold for every transition and focused Vitest cases pass. Handoff: exports plus transition fixtures to T03.

### T03 — Integrate owner-scoped paths with directory/search/read lifecycle
- Prerequisites/input: T01/T02, R03–R06/R08/R10/R11; actual landed editing guard if any.
- Edits: `ProjectFiles.tsx` derive selected entry, unify list/search/pin activation, manage selectedMatch and binding-generation reset. Extend `FilesView.tsx` controlled optional prop only as needed for wiring. Keep `useFilesRead.ts` unchanged unless key/reset cannot be expressed externally; if changed, preserve committed-owner tests. Extend existing Files/search fixtures with bindingId and rebind/unmount controls. No persisted state.
- Output/boundary: working controlled strip model and one on-demand preview reader, no visual design shortcuts. Do not change GrantedFiles authority or search-adapter availability.
- Tests: held A → B; close active pending; directory clears selection with pins retained; same-file search refresh once; stale checksum no false highlight; active/inactive transitions; same owner new checkout clears state, late old success/error ignored, missing binding errors; folder and file retry independence. If editor exists, canceled/rejected guard leaves slot state unchanged.
- Done when: request counts show no inactive-pin prefetch, raw request path/owner unchanged, no old content under new header. Handoff: controlled props and integration evidence to T04.

### T04 — Build exact visual strip and keyboard behavior
- Prerequisites/input: T03 controlled contract and complete visual/motion design; R07/R09.
- Edits: `FilesView.tsx`, `files.css`; optional new strip component only if extraction is useful, register it in manifest. Keep strip outside selected-only branch, adjust Project Search unselected layout visibility only for pins. Add header actions, cap explanation, labels, live status, scoped keyboard handlers and deterministic focus restoration.
- Output/boundary: UI only; no permission, persistence, new renderer, or editor-state ownership. Follow sizes/tokens/states above without separate design delegation.
- Tests: browser assertions for unique names, roving select, all controls via Tab/Enter/Space/Delete, cap no-op, focus after active/inactive/final close, no global shortcut interception, no actions in edit mode. Empty strip omitted; error/stale statuses retain actions.
- Done when: controls work at 920/560/400/320px and all seven slots stay reachable; light/dark/forced colors/reduced motion match spec. Handoff: screenshots and keyboard recording to T05 verifier.

### T05 — Regression, visual evidence and acceptance audit
- Prerequisites/input: T01–T04 complete, acceptance matrix below; verifier owns tests/evidence, source fixes go back to current implementing owner serially.
- Edits: extend `tests/e2e/files-reading.spec.ts`, `project-search.spec.ts` and fixtures using existing route-hold patterns; update `tests/files-read-commit-owner.test.ts` only to add coverage if hook changes, never weaken its existing expectations. Register new tests/source files. No unrelated suite/CI/config changes.
- Output: exact commands, counts, screenshots, request logs with synthetic paths only and known gaps. Add keyboard-only recording of pin A, browse/search B, return A, close A. Exercise live authorized host in a disposable project, not only mocks; supported Windows desktop check by authorized verifier if unavailable locally.
- Tests: every V01–V11 below including empty and failures; run focused tests and existing relevant suites once after final edits. Recheck touched failing inputs only after fixes. No build-as-visual-evidence substitution.
- Done when: all matrix rows have evidence, guards preserved if editor merged, no unaddressed security or focus regression; if native/live verification unavailable mark blocked, not passed. Handoff: tested commit and evidence index to T06.

### T06 — Send finished implementation to the front end team for review
- Prerequisites/input: T05 tested implementation commit, complete visual/motion evidence, no unrecorded requirement changes; R12.
- Edits/output: update complete plan revision/STATE as needed, post issue checkpoint and reviewed-PR handoff with exact SHA, all T/V statuses, command results, screenshot/recording links and known platform limitations. Send the **finished work to the front end team for review** against this visual/animation spec, not for design creation.
- Tests: audit every R row maps to passing V evidence; verify source/evidence links resolve, no absent continuation content or private-only essential artifact. Negative: missing ACK, missing screenshot or failed check is HANDOFF_PENDING/BLOCKED, never completion.
- Done when: front end review and requested fixes are recorded, receiver ACK is present, owner released; maintainer review/merge and verified-on-main remain distinct later gates. Recipient: front end team, then repository maintainer; no unauthorized merge or issue closure.

## VALIDATION

### Reproducible commands and evidence

Repository root setup and **documentation-only checks for this plan**, not feature acceptance:

```sh
source ~/.nvm/nvm.sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm exec vitest run tests/public-source.test.ts
pnpm check:docs-links
```

Implementation-time checks (planned, NOT executed for a docs-only change):

```sh
pnpm exec playwright install chromium
pnpm exec vitest run tests/pinned-previews.test.ts tests/files-read-commit-owner.test.ts tests/public-source.test.ts
pnpm exec playwright test --config tests/e2e/files-reading.playwright.config.ts
pnpm exec playwright test --config tests/e2e/project-search.playwright.config.ts
pnpm typecheck
pnpm lint
pnpm test:ui-guard
pnpm check:docs-links
```

The existing Files config includes the shared-panels late-response regression and other relevant Files regressions; do not redundantly launch the full shared-panels suite. It uses `channel:chrome`; install/provision Google Chrome if needed for that existing configuration, do not silently rewrite shared config. Run T01's discovered host tests explicitly and record their exact filenames/commands after discovery. If #1344 has landed, run its actual editor browser/guard tests discovered in T01 as well. Proposed test path `tests/pinned-previews.test.ts` will exist only after T02.

Use synthetic fixtures: seven distinct files, two same-basename files in different parent paths, root name collision, empty text, binary, too-large, missing/denied, held A/B requests, checksum change, two checkout bindings under the same project/thread, and project/thread changes. Take screenshots at 920px and 320px container widths (plus boundary checks at 560/400), in both themes; include six pins plus transient scrolled to active, focus, cap reason, no selection with pins, stale-search and error states. Capture reduced-motion and forced-color outcomes. Request instrumentation must show no reads for simply pinning or focusing inactive items. Mocks validate UI decisions; only live-host checks validate authority/binding behavior.

### Acceptance matrix / release gate

| ID | Tasks / requirements | Positive, empty and negative acceptance |
| --- | --- | --- |
| V01 | T02,T03 / R01 | A/B stay pinned while C/D replace transient; opening pinned A produces no duplicate; initially no slots/content; seventh independent slot cannot become a seventh pin. |
| V02 | T02,T04 / R02 | Pin/unpin/close follow transition table; six rejects Pin with reason and retains all entries; closing last returns empty state; inactive close never switches content. |
| V03 | T03,T04 / R03 | Folder/breadcrumb clears active+transient but keeps strip; selecting pin returns its content without altering current breadcrumb/filter; late old folder/file completion cannot restore cleared selection. |
| V04 | T03,T05 / R04 | Search opens transient or existing pin, preserves valid line highlight/current SHA; same path refresh once; stale/absent line uses existing warnings; later ordinary pin activation has no search highlight. |
| V05 | T01,T03,T05 / R05 | Same-owner changed checkout, project/thread swap, unmount/remount clear pins; inactive mounted retains metadata but aborts read; resume revalidates before content; held old success/error cannot repopulate state. |
| V06 | T01,T03,T05 / R06 | One active preview read, no prefetch; Retry recovers current failure; .git/outside-worktree/size denials remain host-enforced; binding mismatch response never shown. |
| V07 | T02,T04,T05 / R07 | Raw control-character path still requested exactly; duplicate visible names gain parent labels; keyboard-only open/pin/unpin/close and focus-after-final-close work; composing/modified keys and other inputs unaffected. |
| V08 | T03,T04,T05 / R08 | Empty/binary/too-large remain distinct; deleted/denied active pin stays closable with error+Retry; successful retry clears Unavailable; inactive pins do not falsely show freshness/error. |
| V09 | T04,T05 / R09 | Screenshot/interaction evidence for all specified widths/themes/states, forced colors, reduced/off motion; overflow scroll reveals every pin/Close; no clipped cap text or invisible focus. |
| V10 | T01,T03,T05 / R10 | If editor landed, cancel/save/discard/failed save preserve existing guard semantics across every outgoing transition; controls absent in edit mode; otherwise explicitly N/A at tested SHA, not a fabricated guard pass. |
| V11 | T03,T05 / R11 | Reload/remount loses pins; no tab state in storage/journal/layout; GrantedFiles regression unchanged; one body, no new grants/renderer/editor sessions; branch/commit alone does not reset pins. |
| V12 | T06 / R12 | Complete finished-work review handoff acknowledged by front end team; review changes resolved, gates and remaining merge/main verification stated truthfully. |

Release gate: all applicable V rows pass with accessible evidence; no unverified host authority assumptions, no silent scope drift, front end review recorded. Publication audit checks all required plan sections, all R→T→V links, sequential ownership boundaries and no invented existing symbols. Do not treat a queued CI run, mock fixture, plan approval or local commit as implementation release.

## STATE

- Researched/decided: baseline single-selection/search/read/layout behavior, tests, design tokens, explicit six-pin lifecycle, visual/keyboard/motion spec and related issue states. #1344 has not landed at the checked baseline/GitHub state.
- Implemented: this Markdown plan and its public-source manifest entry only. No feature code, tests, editor, host metadata or UI has been implemented by this planning task.
- Verified: source inspection and read-only issue/PR queries. Documentation checks are to be executed after the final edit; their actual results belong in the local commit report. No browser/visual/feature verification claimed.
- Owner/branch: local planning worker on `devin/1795307133-plan-pinned-file-previews`, derived from main at the SHA in META. T01–T06 are NOT_STARTED and unclaimed for implementation.
- Publication: explicitly deferred; no claim/comments, issue changes, attachment, push or PR performed. Later authorized publisher must find/reuse or create the matching issue, place this **entire** plan in its body, also attach the actual Markdown where supported, or use a reviewed docs PR plus SHA-pinned identical source if attachments are unavailable. Read back every section and compare to the file; never call body Markdown an attachment. Until then remote HANDOFF_INCOMPLETE is intentional, not an accepted durable publication.
- Risks: same-owner rebinding is not exposed in current read responses; T01's additive metadata is required, not optional hardening. Concurrent manual editing and renderer stacks touch the same files; reconcile actual merged code before T03. Strictly distinguish per-file denial from lost binding. No polling means externally initiated changes are detected at the next read; never display that read under retained old slots.
- Pending checks: live host, supported Windows desktop, keyboard/visual/motion and editor-guard checks all remain implementation work. No false claim of passing runtime verification.
- Exact next step: finish requested local documentation checks and commit these two documentation-related files, without push. After explicit publication/implementation authorization, publish losslessly per AGENTS.md, have receiver ACK full plan/journal, then start T01 from current main and recheck #1344/#1583/#1585.

## REFERENCES

- [VS Code pinned tabs](https://code.visualstudio.com/docs/configure/custom-layout#_pinned-tabs): pinned editors remain available while browsing; v1 adopts explicit retention, not VS Code's whole editor model or automatic persistence.
- [VS Code editor tabs](https://code.visualstudio.com/docs/editing/getting-started/userinterface#_tabs): distinguish replaceable preview from intentionally retained files. This plan deliberately caps retention at six and keeps a single visible preview.
- [Baseline source tree](https://github.com/skytuhua-org/Gen-V1/tree/2640b897a42739eba3785fc934af882996c07097); local verified paths/symbols are in REPO_MAP, not guessed future APIs.
- [Repository agent contract](../../AGENTS.md), [contribution guide](../../CONTRIBUTING.md), [fallback UX plan](ux-linked-prs-dead-end.md), [fallback sub-plan](1235-t11-model-draft.md).
- [Manual editing #1344](https://github.com/skytuhua-org/Gen-V1/issues/1344), [client PR #1512](https://github.com/skytuhua-org/Gen-V1/pull/1512), [design PR #1520](https://github.com/skytuhua-org/Gen-V1/pull/1520), [browser PR #1521](https://github.com/skytuhua-org/Gen-V1/pull/1521): pending stack, unsaved-change protection must survive if merged first.
- [Markdown previews #1583](https://github.com/skytuhua-org/Gen-V1/issues/1583), [image previews #1585](https://github.com/skytuhua-org/Gen-V1/issues/1585): rendering features, not pin ownership/lifecycle. Essential overlap and behavior summarized above so implementation does not depend on private chat.
