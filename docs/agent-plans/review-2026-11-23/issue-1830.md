[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1830.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1830](https://github.com/skytuhua-org/Gen-V1/issues/1830). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Calmer-shell branches remain open. Latest review defers the dedicated-build visual matrix and installed Windows verification; current body names old branch heads and an earlier scheduling checkpoint.

### Reviewed implementation references

- [PR #1831](https://github.com/skytuhua-org/Gen-V1/pull/1831): open; head `59723029319b9f3db428180ab59d983b2b1c0d2d`; base `main`; not recorded as merged into the audit baseline.
- [PR #1832](https://github.com/skytuhua-org/Gen-V1/pull/1832): open; head `bdb57091d3b0ed4d934155c26cd51132d4c640f8`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7110204301](https://github.com/skytuhua-org/Gen-V1/issues/1830#issuecomment-7110204301). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

# UX: calmer shell — quieter selection, on-demand Project overview, fewer dividers and rows

## META

- Repository: `skytuhua-org/Gen-V1`.
- Plan revision: `issue-body-r8`, 2026-11-23 UTC. Revisions r1-r7 remain recorded below; the r8 addendum at the end is the current authority for the Branch A panel-boundary regression.
- Baseline: `origin/main@8f54f406b80f2d7d8ac09cc2a46557c125d681fa` (fetched and verified for the A-vs-main regression comparison; the earlier approved baseline is retained in r1).
- PR A: https://github.com/skytuhua-org/Gen-V1/pull/1831, branch `devin/1795398302-quiet-shell-chrome`, verified head `fb2a5588be48c1b2d2da1115f8e6659a40a03c0d`.
- PR B: https://github.com/skytuhua-org/Gen-V1/pull/1832, branch `devin/1795398800-on-demand-overview`, verified head `d5c9eb468b08cb2b188745d6688b3d00bb1d57cd`.
- Both PRs are open and mergeable; preserve existing history and do not merge either PR.
- Current implementation status: T17 width fix and T18 local preview are verified. The user committed/pushed Branch B at `d5c9eb46`; Branch A remains at `fb2a5588`. The prior T19 CI loop was released blocked on Actions runner scheduling. The current user-authorized T20–T23 task targets Browser job `137485670648` on PR #1831; no product-code edits have been made yet.
- Source provenance: maintainer's follow-up request and explicit r4 decision in the issue #1830 handoff; inspected current A/B source, tests, `scripts/ui-guard.ts`, `scripts/ui-guard-policy.md`, and existing `Popover` callers.

## OBJECTIVE

The maintainer reviewed the combined after shots and requested a calmer shell: selected navigation should be a neutral fill with no white side marker; composer/control borders should be less distracting; the Project overview should open as a shared popover anchored below the top-bar toggle without changing content geometry; and a lone conversation should have one header row instead of the split-pane row stacked over the conversation row. The touch-drag preview should not appear before the existing 9px movement threshold.

Success means implementing the separately scoped A and B changes below, retaining keyboard focus and accessible controls, keeping the conversation/composer geometry stable while the overview opens, preserving multi-pane layouts, passing the specified checks, and pushing both feature branches. Do not monitor CI after push and do not make subjective visual judgments.

## REQUIREMENTS

### Original issue scope, preserved from r1

The maintainer reviewed the all-PR review build (11 screenshots at 1440x900) and current `main`, seeking “no distracting emphasis, no elements that do not help the work, fewer rows and divider lines, plain wording.”

| ID | Problem seen | Change |
|---|---|---|
| T01 | Selected sidebar thread had a near-white outline and heavier title. | A neutral selected fill only; no outline/marker and no selected-title weight change. Keep hover and keyboard focus distinct. |
| T02 | Collapsed Project overview reserved a full-width row below the composer. | Closed overview reserves no space; one top-bar toggle controls it; its contents and persistence remain. A plan arriving while closed marks the toggle instead of moving the composer. |
| T03 | Adjacent regions accumulated pane/header/divider/panel/sidebar hairlines. | At most one hairline between adjacent regions; no rule where spacing already separates headers. |
| T04 | Empty Area/artifact/Pinned rows, repeated project metadata and launcher jargon added noise. | Hide Area when only one area exists; hide an empty artifact select; show Pinned only when populated or dragging; remove repeated project metadata and use plain launcher wording. |

Original out of scope remains: unrelated composer layout, All Agents, Settings behavior, tool behavior, saved-layout data, and unrelated colors.

Original delivery split remains: PR #1831 is the navigation/chrome styling branch; PR #1832 is the overview/workspace structure and copy branch.

Original acceptance remains: T01 selected/hover/focus states remain distinct; T02 closed overview reserves no row and opens/closes by pointer/keyboard while persisting; T03 separator simplification; T04 empty/redundant rows removed; validate touched tests and report failures on unmodified `main` as preexisting.

### Preserved r2 branch-B follow-up

- Escape while focus is on the open overview toggle closes it and leaves focus on that toggle; honor `defaultPrevented` and IME composition guards.
- Hide the overview toggle while a plug-in is selected and the personal workarea is hidden.
- A touch long-press without more than 9px movement does not pin; continue swallowing the click for an active hold.
- These three product fixes were separate commits from behavior-dependent spec updates. Their already-pushed SHAs are retained: `acf047f5c2f945fda9c8feabed26dccae9407349`, `b262a6930015150bc63e9b5fc521b0ebef1ddf4c`, `9f7d3ba62dea77f4ee643cd24ee58fb7f208747b`, followed by spec commit `4aa6a380f2692180f74fee42eb08b2c8c57f97e5`.

### r4 Part A — branch A / PR #1831

1. **Selected state is a neutral fill only.**
   - Use `background:var(--hover)` on `.sidebar-thread-row.active` in `shell.css` and the paired sidebar-context rules, `.sidebar .sidebar-action-btn.selected` and its `.app-shell` variant, and `.settings-navigation nav button.selected`.
   - Remove `var(--text)` border-color and box-shadow markers; keep the border transparent. No selected title bolding.
   - A non-selected hover uses `var(--subtle)`; selected hover remains `var(--hover)`. Preserve existing `:focus-visible` rings.
   - In light theme, report `--hover`, `--sidebar`, and `--subtle` values and ensure `--hover` differs from both.
   - Inspection found five existing sidebar entries in the selected-control test map plus the separately required settings selector; cover all declarations rather than dropping one due to the request's “five selectors” count.
2. **Quieter borders.**
   - `.composer` rests on `var(--border)`. Define `--composer-focus-border` beside `--border` in both theme blocks: light `#b8b8b8`, dark `#3d3d3d`. Use it for focus-within and dragging in `styles.css` and `shell.css`.
   - The normal light `--border` is currently `#e5e5e5`, not darker than `#b8b8b8`; if it is darker when implementation begins, stop and report. Keep high-contrast focus on `--control-border`.
   - Apply matching resting/focus treatment to `.side-chat-composer`, `.agents-workspace .agents-composer.composer`, `.loading-composer`, and `.sidebar .search-field`.
   - Make the conversation-header History button, top-bar Layouts trigger, and workspace launcher “+” borderless ghost buttons: transparent border and `var(--hover)` on hover.
   - Composer Changes/Create PR pills use `var(--border)`. `.docked-summary` uses `var(--border)` instead of `--control-border`.
   - At 1440x900, programmatically inspect visible elements with nontransparent computed borders brighter than `--border` in a thread, workspace panel open/closed, and Settings open. Report every remaining selector/color; make no unrelated changes.
3. **Tests and documentation.**
   - In `tests/theme-contrast.test.ts`, remove composer-shell selectors and `.sidebar .search-field` from the `--control-border` boundary map. Add an assertion that those shells use `var(--border)` and both themes define `--composer-focus-border`.
   - Move the sidebar/settings selectors out of the current `var(--text)` selected-marker test into a separate assertion checking `background:var(--hover)` and no `var(--text)` border-color/box-shadow. Keep other selected-control assertions unchanged.
   - Run `tests/theme-contrast.test.ts` and tests located by `rg -n 'sidebar-thread-row\\.active|inset 2px|control-border' tests`, plus `pnpm test:ui-guard`, `pnpm lint`, and frontend-refinement.
   - Update `DESIGN.md` selected-state wording to “a neutral fill only.”

### r4 Part B — branch B / PR #1832

1. **Project overview uses the shared Popover primitive, not a dock column or ad-hoc overlay.**
   - When `DockedSummary` receives an external `disclosure`, do not render a `<section>` in the dock. Render the shared `<Popover>` anchored to `disclosure.toggle`, below the toggle and end-aligned, with width `320`. Its open state respects both the existing `open` prop and the disclosure (`open && !collapsed`); keep the external open/closed state contract.
   - Supply the numeric `height` required by `Popover` using measured content height capped to available viewport height, following an existing caller's measurement pattern (for example `SavedDrafts.tsx`). Re-measure when the content/viewport changes; do not guess an arbitrary fixed height.
   - Give the Popover root `data-presentation="popover"` and `data-summary-id`, and preserve the accessible region role/name `Project overview window` and the existing body actions/content. `Popover.onDismiss` calls `disclosure.change(true)` for Escape and outside pointerdown. The shared primitive also owns its standard outside-focus dismissal and Escape focus return to the toggle.
   - Existing `SummaryToggle` Escape behavior remains, including the `defaultPrevented` and IME guards. When the toggle is the anchor but is absent, the shared Popover must render no duplicate/unanchored surface.
   - `App.tsx` declares two overview `DockedSummary` instances with the same `overviewDisclosure`, but they are mounted in mutually exclusive branches: `contextSummaries` is rendered only by `renderSplitRoot()` in the `splitRoot ? renderSplitRoot() : ...` branch; the other summary is in the `else` branch. Preserve that exclusive ownership and add a spec that proves no more than one Project overview Popover is open/rendered in the split scenario. The overview toggle is only rendered by the main App when its existing eligibility condition applies.
   - The Popover is portaled, not a child of `.summary-dock`; existing dock/grid release rules therefore continue without an overview row/column. Remove or retarget overview-specific selectors that become dead. Opening/closing must not change the layout grid or composer/title center-x.
   - Add a browser spec asserting the composer and empty-state title bounding-box center x remain within ±1px between overview closed and open, and assert an outside pointerdown closes the region.
   - Do not add absolute positioning, an ad-hoc z-index layer, a UI-guard exception, or a second Popover implementation. Use the shared primitive and its existing popup layer.
2. **One header row for a lone conversation.**
   - In `WorkspaceSplitLayout.renderPane`, mark `data-inline-chrome="true"` only if there is exactly one pane, that pane contains one view, its active view is a thread, and it is not collapsed.
   - In that pane the split header is out of flow: `position:absolute; top:9px; right:12px; height:34px; background:transparent`, above the view placements. Clip-hide `.split-tab-strip` while retaining it in the DOM. Preserve the corner, grip, area menu, and minimize buttons. The pane slot fills the pane.
   - Reserve enough right padding in the conversation `.workspace-header` to keep History clear of the controls. Measure the action header or use a CSS variable whose value comes from that measurement; do not guess a fixed width.
   - Gate verified from the current source: `WorkspaceSplitLayout` returns `.split-workspace` containing `.split-surface` children that render `renderView`; `App.renderConversationView` returns a nested `App` for a thread; `packages/ui-shell/ChatView.tsx` renders `.workspace-header` in that subtree and does not portal it. The target header is therefore a descendant of `.split-workspace`. Keep an integration assertion for this relationship. If the runtime structure disproves this gate, stop rather than inventing a selector.
   - The target single row is 52px and reads project/thread, metadata, search, History, split controls and minimize. Multi-pane/multi-view layouts remain unchanged.
3. **Touch preview threshold.**
   - In `apps/web/src/sidebar-reorder.ts` `moveTouch`, while a hold is active and `Math.abs(event.clientY - held.startY) <= 9`, clear the target and skip `resolve`, matching the existing `up` threshold.
4. **Project-memory-host comparison.**
   - This comparison is settled and complete: on A@`67d170734cd00e07d1788766ef613bf2390caa13` all three failed at the same 10-second missing Message textbox visibility assertion as on B. Treat them as preexisting under the user's rule; do no additional work on these tests and do not alter their expectations.
5. **Documentation.**
   - Update `DESIGN.md` overview wording to “pop-up over the workspace; does not move content.”

### Resolved UI-guard decision

The maintainer explicitly rejected a guard exception and accepted the shared `Popover` primitive in place of the prior absolute-geometry requirement. `packages/ui-shell/Popover.tsx` is an approved shared primitive: it portals to the appropriate document root, uses `placePopover` for viewport placement, manages outside pointer/focus dismissal and Escape, and applies the existing `--ui-popup-layer` token through `.ui-popover`. Do not add an overlay inventory entry or new direct overlay geometry. The old r3 absolute-position/size/shadow requirements are superseded by this decision.

## REPO_MAP

- A theme and composer tokens: `apps/web/src/styles.css`; shell focus override: `apps/web/src/shell.css`.
- A composer/search/control declarations: `apps/web/src/side-chat.css`, `apps/web/src/agents-workspace/agents-workspace.css`, `apps/web/src/loading-state.css`, `apps/web/src/sidebar-context.css`, `apps/web/src/composer-toolbar.css`, `packages/ui-shell/summary-dock.css`.
- A theme tests: `tests/theme-contrast.test.ts`; design wording: `DESIGN.md`.
- B disclosure/state: `packages/ui-shell/SummaryDock.tsx`; summary layout: `packages/ui-shell/summary-dock.css`; top-bar toggle and project overview: `apps/web/src/App.tsx`.
- B shared popover API/height patterns: `packages/ui-shell/Popover.tsx`, `packages/ui-shell/tokens.css`, `apps/web/src/SavedDrafts.tsx`, `apps/web/src/SavedLayoutChooser.tsx`, and `apps/web/src/thread-hover/ThreadHoverCard.tsx`.
- B split pane/header: `apps/web/src/WorkspaceSplitLayout.tsx`, `apps/web/src/workspace-split.css`, `packages/ui-shell/ChatView.tsx`, `apps/web/src/App.tsx`.
- B touch preview: `apps/web/src/sidebar-reorder.ts`.
- B browser/Vitest coverage: `tests/split-app-browser.test.ts`, `tests/split-workspace-renderer.test.ts`, `tests/e2e/summary-dock.spec.ts`, `tests/e2e/floating-windows.spec.ts`; suite configurations live beside the e2e specs.
- Overlay policy: `packages/ui-shell/Popover.tsx`, `packages/ui-shell/tokens.css`, `scripts/ui-guard.ts`, `scripts/ui-guard-policy.md`, `scripts/ui-overlay-legacy.json`.
- Two same-disclosure Project overview definitions exist in `App.tsx`; source inspection confirms their mount sites are the mutually exclusive `splitRoot` and non-split JSX branches.

## DESIGN

- Keep A changes limited to the specified CSS shells, control states, tests and DESIGN copy. Existing focus-visible rings remain the keyboard affordance; fill, hover and focus are distinct.
- The external overview disclosure remains the state owner. `DockedSummary` uses the shared `Popover` primitive anchored to the toggle; the dock contains no overview child. Shared outside-pointer/focus dismissal and Escape call `disclosure.change(true)`, with Escape returning focus to the toggle. Its portal must not change the conversation/composer grid geometry.
- The two Project overview component definitions share a disclosure but are rendered in mutually exclusive App branches; keep that topology and assert one mounted/open overview Popover.
- Inline split chrome is opt-in for precisely one noncollapsed thread view. It overlays the header area without changing the multi-pane renderer. A measured width is propagated as a CSS custom property so the History action does not overlap the split controls.
- Existing state persistence, draft ownership, tool content and saved split data do not change.
- Do not add a UI-guard exception or direct absolute overlay. The agreed design uses the approved shared Popover primitive.

## EXECUTION_DAG

- **T05 — A selected state and borders.** Inputs: branch A at `67d1707`. Edit the specified theme/shell/sidebar/composer CSS, theme-contrast assertions and DESIGN wording. Keep high contrast on `--control-border`, focus rings unchanged, no bold title. Done when all specified selectors and shells use the requested declarations and tests pass. Handoff: branch A review.
- **T06 — B shared overview Popover.** Depends on r4's accepted shared-primitive decision (no guard exception). Edit `SummaryDock.tsx`, `summary-dock.css`, `App.tsx` only if needed to preserve the existing mutually exclusive split/non-split owner, and affected summary specs. Use `Popover` with the overview toggle anchor, below/end placement, width 320 and measured viewport-capped height. Preserve `Project overview window` name and body actions; dismissal changes disclosure to closed; assert one Popover, stable composer/title center-x, and outside-pointer dismissal. Done when the overview is only one open accessible Popover, does not participate in the grid, and `pnpm test:ui-guard` passes without a new exception. Handoff: branch B review.
- **T07 — B lone-thread inline chrome.** Depends on the verified descendant gate and T06. Edit `WorkspaceSplitLayout.tsx`, `workspace-split.css`, and measured header-width logic. Add an integration assertion for descendant and inline-only eligibility. Verify multi-pane/multi-view cases stay unchanged. Handoff: branch B review.
- **T08 — B touch preview and documentation.** Depends on branch B workspace being available. Edit `sidebar-reorder.ts` so active holds through 9px clear preview and skip target resolution; update overview wording in `DESIGN.md`. Preserve the existing >9px drop behavior.
- **T09 — A project-memory comparison.** Complete: three selected project-memory-host tests fail identically on A and B at missing Message textbox visibility. Per maintainer direction this is preexisting and requires no further work; do not fix these failures.
- **T10 — Validation and border scan.** Depends on T05–T08. Run the exact matrix below serially when suites share ports; run the requested programmatic computed-border scan in all specified UI states. Record every border result and all test failures without subjective screenshot judgments.
- **T11 — Commit and push.** Depends on passing requested checks (except the explicit preexisting project-memory-host failures and any other documented baseline issue). Keep A/B code isolated, use focused commit messages ending `(#1830)`, push both branches, report SHAs and diff stat, and do not monitor CI.

## VALIDATION

### Completed comparison

- `TAG=A1830-memory-baseline ~/work/pw.sh tests/e2e/project-memory-host.playwright.config.ts project-memory-host.spec.ts --grep 'enabled project memory uses real HTTP|real concurrent user corrections|repeated-task runner preserves control custody'`
- Result on A: 0 passed, 3 failed; each failure is the missing `getByRole('textbox', { name: 'Message', exact: true })` visibility assertion after 10 seconds. Same failure was previously observed on B; no cause is claimed.

### A checks to run

- `npx vitest run tests/theme-contrast.test.ts`
- Run every test returned by `rg -n 'sidebar-thread-row\\.active|inset 2px|control-border' tests`.
- `pnpm test:ui-guard`
- `pnpm lint`
- `TAG=A1830-r4 ~/work/pw.sh tests/e2e/frontend-refinement.playwright.config.ts composer-app-refinement.spec.ts floating-windows.spec.ts reserved-rail.spec.ts right-tools.spec.ts`
- Border scan at 1440x900, with thread open, workspace panel closed, workspace panel open, and Settings open. Use Playwright computed style to list visible elements whose border is nontransparent and brighter than computed `--border` (selector and exact color). No manual visual judgment.

### B checks to run

- `~/work/runall.sh` serially for:
  - `playwright.config.ts document-window.spec.ts shell-micro-motion.spec.ts`
  - `tests/e2e/redundant-ui.playwright.config.ts redundant-ui.spec.ts`
  - `tests/e2e/frontend-refinement.playwright.config.ts composer-app-refinement.spec.ts floating-windows.spec.ts reserved-rail.spec.ts right-tools.spec.ts`
  - `tests/e2e/desktop-surfaces.playwright.config.ts desktop-surfaces.spec.ts`
  - `tests/e2e/summary-dock.playwright.config.ts summary-dock.spec.ts`
  - `tests/e2e/plan-presentation.playwright.config.ts plan-presentation.spec.ts`
- `npx vitest run tests/split-app-browser.test.ts tests/split-workspace-renderer.test.ts`
- `npx tsc --noEmit -p .`
- `pnpm lint`
- `pnpm test:ui-guard`
- Preserve CRLF in files that already use CRLF.
- The summary-dock/split-app browser assertions must cover a single accessible overview region/popover in split mode, stable composer/empty-state title center-x (±1px) with the popover closed/open, outside-pointer dismissal, and region/body-action behavior after retargeting away from dock-child selectors.

### Runtime and release constraints

- Run test suites serially when they share ports. Do not run anything in `/home/ubuntu/work/main-wt`.
- Leave the Vite server on `127.0.0.1:5173` running.
- Do not do visual judgment or create/inspect screenshots. A programmatic geometry/border scan is required.
- Do not wait for or monitor CI after pushing. Report promptly after both pushes.
- Final report: A/B branch head SHAs and new commit SHAs, diff stat, per-suite test table, all remaining failures with first error line and classification, computed-border scan list, light-theme `--hover`/`--sidebar`/`--subtle` hex values, and any stop condition.

## Historical STATE

- r1/r2 product changes are pushed on the two existing PR branches; PRs were open and mergeable at r4 plan preparation.
- r4 code edits: not started.
- Verified: normal light `--border` is `#e5e5e5`; high-contrast block has a separate `--border` override and must retain its `--control-border` focus treatment.
- Verified: the thread `.workspace-header` is rendered below the `.split-workspace` root through the nested App/ChatView render path; no portal exists in that path.
- Verified/decided: the maintainer rejected a guard exception and authorized the shared `Popover` primitive instead of absolute geometry. Source inspection confirms the two same-disclosure overview definitions are in mutually exclusive split/non-split branches, so only one can mount.
- Verified runtime: the existing Vite server at `127.0.0.1:5173` responded HTTP 200 and remains running.
- Next action: implement T05/T06/T07/T08 on their designated existing branches, run T10, commit/push T11, update the issue with the SHA-pinned plan-source URL, and do not monitor CI.

## REFERENCES

- Issue #1830: https://github.com/skytuhua-org/Gen-V1/issues/1830
- PR #1831: https://github.com/skytuhua-org/Gen-V1/pull/1831
- PR #1832: https://github.com/skytuhua-org/Gen-V1/pull/1832
- Prior A/B baseline claim and release history: issue comments #017–#019, especially #018 (claim) and #019 (A project-memory comparison).
- Verified source policy: `scripts/ui-guard.ts` and `scripts/ui-guard-policy.md`; existing shared popover: `packages/ui-shell/Popover.tsx` and `packages/ui-shell/tokens.css`.

## Revision r5 — Branch B Project overview placement and design (2026-11-23)

This accepted revision applies only to PR #1832, `devin/1795398800-on-demand-overview`, starting at the user-reviewed `fb0250d4f836d62beb7415f75185e8a4415d4b04`. Branch A is out of scope and must remain unchanged. It supersedes the r4 instruction to place the overview directly below the disclosure toggle: keep the shared `Popover` primitive, but provide workspace-edge anchor geometry through its existing `getAnchorRect` API. Do not add absolute positioning, a z-index overlay, a UI-guard exception, or a second Popover. Do not monitor CI after the requested push; the lead will re-brief the CI loop.

### Accepted requirements and repository map

1. **Workspace-edge placement.** In `packages/ui-shell/SummaryDock.tsx`, add optional `DockedSummaryProps.popoverAnchorRect?: () => OverlayAnchor` and pass it to the external Popover's `getAnchorRect`. Preserve `preferredSide="below"` and `align="end"`. In `apps/web/src/App.tsx`, pass the callback to both mutually exclusive `DockedSummary id="plan"` declarations. Return a zero-width anchor whose right coordinate is `.workspace-layout-workarea`'s right edge minus 12px. Its top and bottom are the larger of the toggle's bottom and the bottom of the visible `.workspace-header` in that workarea, plus 4px. If the workarea is absent, return the toggle's bounding rect. Popover adds its 8px gap. Verify window-resize and sidebar-collapse repositioning; the existing Popover observes the anchor and its ancestors and listens to viewport/window resize.
2. **Overview appearance.** Scope all presentation rules to `.ui-popover.summary-overview`; leave `.project-context-floating` styles unchanged. The Popover has 16px radius, 1px `var(--border)`, `var(--surface)` background, `6px 0` padding, dark shadow `0 16px 40px rgb(0 0 0/.5)`, and light shadow approximately `0 12px 32px rgb(0 0 0/.12)`. Remove the visible external `<strong className="docked-summary-title">` only; retain the accessible region label `Project overview window`.
3. **Sections and separators.** Overview `.project-context-section`, `.project-context-plan-summary`, `.project-context-tools`, `.project-context-group`, and `.project-memory-launcher` use 4px 8px padding, except the plan summary's explicitly required 10px 18px padding. Separate consecutive groups with one full-width, 1px `var(--border)` hairline and 4px vertical spacing; do not put a line before the first group or create double lines. Remove the empty blank area before the bottom status/note.
4. **Rows.** `.project-context-row`, `.project-context-machine`, tools/group `<summary>` elements, and the Project memory button share min-height 36px, padding `0 10px`, gap 12px, radius 8px, 14px medium text, and `var(--text)` color. Left icons are 16px and muted; trailing chevrons are 14px, muted, and `margin-left:auto`. Interactive rows use `var(--hover)` on hover and retain visible `:focus-visible`. The project/machine name row is non-interactive and muted. Group counts (`summary>small`) are 12px regular muted text. Add a left Wrench icon to Project tools. Project memory has a left Brain icon and a trailing chevron.
5. **Disconnected error.** `ProjectTools.context` calls `binding`, which throws `HarnessError('PROJECT_NOT_CONNECTED', 'Connect this project to a local folder.')` at `packages/workspace/tools.ts:75`. `read` converts the failed response to an `ApiError`; `useProjectContext` catches it into its `error` field, so this expected case reaches `ProjectContextCard` through `error`, not a returned `context.error`. Suppress only that exact expected `error` when `!connected && onConnect`; preserve real `error`, `context.error`, and action errors.
6. **Project memory availability.** In `ProjectContextSurface.tsx`, render the launcher only when `localProject && !project.loading && !project.error`; do not render a disabled/centered/muted footer. Keep it a normal left-aligned Brain row. Update `tests/project-memory-ui.test.ts` to prove it is hidden for non-local, loading, errored and disconnected contexts and appears for a loaded local project. Keep `tests/e2e/project-memory*.spec.ts` passing.
7. **Regression coverage.** Update any summary-dock/App expectations that require the removed visible Popover title. Extend the existing app overview browser test in `tests/split-app-browser.test.ts`: after opening, assert the Popover's right edge is within 20px of `.workspace-layout-workarea`'s right edge, its top is no higher than the `.workspace-header` bottom, and the chat title/composer centers remain unchanged within ±1px; retain outside-dismissal coverage.
8. **Validation.** On Branch B, run TypeScript, lint, UI guard, summary-dock, the project-memory e2e specs and `project-memory-ui` test, redundant-ui, frontend refinement, and the app overview geometry spec; also run `git -c core.whitespace=cr-at-eol diff --check`. Record exact commands and counts. Do not wait for or monitor CI after push.
9. **Preview and handoff.** After the code push, the user requested a local-only combined A+B preview in `/home/ubuntu/repos/Gen-V1`, with the previously established `workspace-split.css` conflict resolution; never push the combined preview. Restart Vite from the repo root using `node node_modules/vite/bin/vite.js` and leave it on `127.0.0.1:5173`. Report commit SHA, full diff path/stat and test counts. Sidekick policy still prohibits committing/pushing ordinary implementation work, so if the lead has not taken over that step, leave the verified B diff for lead review and report that policy blocker. Do not perform visual judgment; the user will take screenshots.

### Execution DAG

- **T12 — B workspace-edge Popover and visual design.** Depends on the accepted r4 shared-Popover decision. Edit `SummaryDock.tsx`, `summary-dock.css`, and both App overview callsites. Remove only the external visible title. Preserve disclosure ownership, aria label and Popover behavior. Done when geometry follows the workarea/header calculation, resize/sidebar changes are handled, title is absent, design rules are scoped, and UI guard accepts the implementation.
- **T13 — B disconnected-error and memory-launcher rules.** Depends on tracing `PROJECT_NOT_CONNECTED` to the correct source. Edit `ProjectContextCard.tsx`, `ProjectContextSurface.tsx`, and scoped overview CSS; preserve floating-window CSS. Done when only the expected disconnected request error is hidden with a Connect callback, all other errors remain visible, and launcher visibility follows the exact loaded-local predicate.
- **T14 — B regressions.** Depends on T12/T13. Update `tests/project-memory-ui.test.ts` for local/non-local/loading/error cases; extend `tests/split-app-browser.test.ts` for right-edge, header-bottom and unchanged title/composer geometry; update only tests whose visible-title expectations are invalidated. Preserve existing file line endings. Done when added tests cover the behaviors and existing project-memory/summary-dock tests pass.
- **T15 — B verification and preview.** Depends on T12–T14. Run the exact validation matrix above and record counts; check CRLF-aware whitespace. Then prepare the local-only combined preview and leave Vite running as requested. Do not monitor CI.
- **T16 — B commit/push handoff.** User requests one Branch B commit and push to PR #1832 with no CI watch. Sidekick policy forbids ordinary implementation commits/pushes; the lead must perform this step unless ownership is explicitly reassigned under a higher-priority instruction. Do not touch A.

### State at revision publication

Source review confirms `Popover` already accepts `getAnchorRect`, observes the toggle and every ancestor with `ResizeObserver`, and listens to window/visualViewport resize and scroll. `.workspace-layout-workarea` contains the workspace toggle and chat. The two App overview callsites are in mutually exclusive split/non-split branches. `PROJECT_NOT_CONNECTED` flows from `ProjectTools.context`'s initial binding failure to `useProjectContext.error`; context status errors are separate and must remain. At revision publication, implementation is in progress: `packages/ui-shell/SummaryDock.tsx`, `packages/ui-shell/summary-dock.css`, `apps/web/src/App.tsx`, `apps/web/src/ProjectContextCard.tsx`, `apps/web/src/ProjectContextSurface.tsx`, `tests/split-app-browser.test.ts`, and `tests/project-memory-ui.test.ts` have uncommitted local edits on B; no r5 tests have been run, and no commit/push has occurred.
- Maintainer's r4 decision and current scope claim: https://github.com/skytuhua-org/Gen-V1/issues/1830#issuecomment-7090318540.

## Revision r6 — Correct the overview width regression and prepare preview before push (2026-11-23)

This user-directed revision applies only to PR #1832, Branch B `devin/1795398800-on-demand-overview` at reviewed committed HEAD `fb0250d4f836d62beb7415f75185e8a4415d4b04` plus its existing uncommitted seven-file diff. The user has reviewed that diff and will commit/push it; leave Branch B source changes uncommitted. Do not touch Branch A or monitor CI.

### T17 — Diagnose and correct the 320px overview regression

- `tests/e2e/reserved-rail.spec.ts`, test “the overview popover leaves the existing chat and usage geometry unchanged”, asserts the Project overview width is `320px ±1px`.
- The user reports that this test passed 32/32 at `fb0250d4` and that the current diff measures `321.765px`. Treat the width change as a regression from this diff until evidence disproves that attribution.
- Inspect the actual Popover and content geometry/computed styles to find the cause, including row/span intrinsic sizing, min-content constraints, padding/borders, and overflow. The current row rule `.ui-popover.summary-overview .project-context-row>span { flex:1 1 auto; }` is a candidate, not a verified cause. Keep the shared Popover width at 320px.
- Fix the cause in CSS with the smallest scoped change. Do not loosen or alter the 320px assertion, and do not change unrelated design behavior.
- Run the full `tests/e2e/frontend-refinement.playwright.config.ts` suite and `tests/e2e/summary-dock.playwright.config.ts` on Branch B after the fix. Report exact pass/fail/skip counts and any first failure details.
- Done when the measured overview stays within the existing 320px tolerance and both requested suites pass.

### T18 — Prepare the local-only combined A+B preview before Branch B push

- The user will commit and push the Branch B code themselves. Keep the Branch B worktree uncommitted and unchanged except for the targeted CSS width fix.
- In `/home/ubuntu/repos/Gen-V1`, create a throwaway local branch from Branch A current HEAD `fb2a5588be48c1b2d2da1115f8e6659a40a03c0d`; merge Branch B committed HEAD `fb0250d4f836d62beb7415f75185e8a4415d4b04`; resolve `apps/web/src/workspace-split.css` exactly as in the prior local combined merge at `ae5bed099760675cd1181c73d19003ddd537d17f`; then apply Branch B's tracked uncommitted diff from `/home/ubuntu/work/gen-v1-1830-b`. Do not include or commit the untracked plan source. Never push the preview branch.
- Preserve the existing untracked plan file and any unrelated local files in the canonical clone. Do not use destructive cleanup or overwrite unrelated edits.
- Restart Vite from `/home/ubuntu/repos/Gen-V1` using `node node_modules/vite/bin/vite.js`, bound to `127.0.0.1:5173`, and leave it running. Confirm the page responds successfully at `http://127.0.0.1:5173/`; no screenshot or visual judgment is requested.
- Done when the throwaway branch contains A's committed head, B's committed head, and B's current uncommitted tracked diff; the `workspace-split.css` resolution matches the prior combined merge; the preview branch is local-only; and Vite responds on the requested address.

### Updated state and ownership

- T12-T14 remain implemented on Branch B; the final split-app geometry regression passed 59/59, and prior checks are recorded in the r5 checkpoint history.
- T15's previous frontend-refinement failure is now an active regression investigation, not classified as preexisting. The project-memory-host failure remains a separately reported baseline issue and is outside this revision's fix scope.
- T16 commit/push is owned by the user; no source commit or push is authorized in this scope.
- T17 implementation: the accessible Popover root already has computed/offset width 320px and `box-sizing:border-box`; the pre-fix diagnostic found no overflowing descendants (`scrollWidth=318`, `clientWidth=318`) but did find an active transform matrix with scale 0.998509, making `getBoundingClientRect()` report 319.523px. The reserved-rail test closes and immediately reopens the Popover before measuring its bounding rect, so the assertion is sensitive to the shared scale-in/out animation rather than intrinsic row min-content width or padding. The exact 321.765px failing frame was not separately captured. The scoped CSS now replaces the overview enter/exit animations with opacity/vertical-translate-only keyframes and retains fade-only reduced motion, preventing the overview width from changing during animation.
- T17 verification: the focused reserved-rail geometry test passed 1/1 after the CSS fix; full frontend-refinement passed 113, skipped 1, failed 0; summary-dock passed 24/24. The 320px assertion is unchanged. The CRLF-aware Branch B diff check passed.
- T18 verified: local-only branch `devin/1795415056-combined-preview` starts from A@fb2a5588, merges B@fb0250d4 at local merge commit `5d170aa19ff45ba99739248ec7f1fecc3572d860`, resolves `workspace-split.css` byte-for-byte to `ae5bed0`, and has B's current uncommitted diff applied. Vite was restarted from `/home/ubuntu/repos/Gen-V1` with `node node_modules/vite/bin/vite.js`; it remains on 127.0.0.1:5173 (PID 203627), and the root page returned HTTP 200 with the Vite client and app root present. The preview branch is never to be pushed.
- Latest issue checkpoint before r6: https://github.com/skytuhua-org/Gen-V1/issues/1830#issuecomment-7093110513. Current claim: https://github.com/skytuhua-org/Gen-V1/issues/1830#issuecomment-7093149150.

## Revision r7 — Resume CI monitoring on PRs #1831 and #1832 (2026-11-23)

The user reports Branch B was committed and pushed as `d5c9eb468b08cb2b188745d6688b3d00bb1d57cd`; its App anchor now selects the first visible `.workspace-header`, and the split-app browser spec uses `.workspace-header:visible`. User reports `GEN_SPLIT_APP_BROWSER=1` passed 59/59. Branch A remains at `fb2a5588be48c1b2d2da1115f8e6659a40a03c0d`. The local preview and Vite process from T18 must remain running and untouched.

### T19 — Watch CI and fix only mechanical regressions

- Monitor PR #1831 at `fb2a5588...` and PR #1832 at `d5c9eb46...` using the CI check service. Do not merge either PR.
- For each failed job, fetch the job log and determine whether the failure is caused by this branch and is mechanical (lint, type, test expectation tied to the agreed behavior). Fix only those cases, preserve CRLF, verify locally with the narrowest relevant check, commit and push to that same PR branch without force-pushing, then resume monitoring.
- If a failure appears unrelated or main-preexisting, compare against recent `main` runs and provide the exact error/log evidence. Escalate design changes and anything recurring after two attempts. Ignore capy-ai comments.
- If jobs remain queued without an assigned runner, do not invent code fixes; report the queue state, job IDs, timestamps, and runner status.
- Leave the local preview/Vite server running on 127.0.0.1:5173.
- Done when both PRs are green, or CI is demonstrably blocked/unrelated and the evidence-based escalation is ready. Report per-check statuses, any fix commits/SHAs and summaries, or the exact blocking evidence.

### T19 validation and initial state

- Use `git_pr_checks(repo="skytuhua-org/Gen-V1", pull_number=1831|1832, wait_mode="all")`; for failures use `git_ci_job_logs` with the job ID. Do not repeat a successful check unless an applicable branch change makes its inputs different.
- Reproduce branch-caused mechanical failures from the corresponding worktree; after a fix, run only the narrow test/lint/type command for that failure, commit and push to the feature branch, and recheck the PR.
- Initial snapshot at 2026-11-23 06:34Z: PR #1831 had 1 passed, 0 failed, 8 pending, 1 skipped. Devin Review passed; Agents grid UI evidence was skipped. Its eight pending GitHub jobs were all `queued` with no `runner_name`: Windows `137485670761`; test shards 1–4 `137485670589`, `137485670523`, `137485670751`, `137485670662`; Browser tests `137485670648`; Markdown links `137485670310`; Installed desktop memory retention and opt-in `137485670282`. The queried jobs reported queued since `2026-11-23T04:26:05Z`.
- Initial snapshot at 2026-11-23 06:34Z: PR #1832 had 0 passed, 0 failed, 9 pending, 1 skipped. Devin Review was pending; Agents grid UI evidence was skipped. Its eight pending GitHub jobs were all `queued` with no `runner_name`: test shards 1–4 `137527036412`, `137527036092`, `137527036334`, `137527036178`; Installed desktop memory retention and opt-in `137527036264`; Browser tests `137527036129`; Windows checks `137527035918`; Markdown links `137527034675`. The queried jobs reported queued since `2026-11-23T06:33:54Z`.
- At the initial snapshot no failures or fix commits existed. The previous claim/release and local preview state are recorded in comments #067 and the new r7 CI checkpoints. Current claim comment: https://github.com/skytuhua-org/Gen-V1/issues/1830#issuecomment-7093465397.

## Revision r8 — Correct Branch A split-app workspace-panel boundary (2026-11-23)

This user-directed task applies to Branch A / PR #1831 at `fb2a5588be48c1b2d2da1115f8e6659a40a03c0d`; Branch B / PR #1832 remains at `d5c9eb468b08cb2b188745d6688b3d00bb1d57cd`. It supersedes the r7 blocked CI handoff for this task. The user explicitly authorizes one focused commit and push to Branch A, but no CI monitoring after that push. Do not modify Branch B or push the combined preview.

### T20 — Reproduce the boundary failure and compare with main

- CI Browser job `137485670648` failed in `tests/split-app-browser.test.ts`, test “a browser dock shares the tool width budget and preserves chat space”, at `tests/split-app-browser.test.ts:720:82`: `expected 920 to be less than or equal to 919.023681640625`. The checked boxes are `.split-root-workarea` and `.workspace-right`; their measured edges overlap by about 1px.
- Fetch the current `origin/main`, record its full SHA, and run `GEN_SPLIT_APP_BROWSER=1 npx vitest run tests/split-app-browser.test.ts` on Branch A and on a separate worktree at `origin/main`. Do not use `/home/ubuntu/work/main-wt`; preserve the existing Vite preview and worktrees.
- Inspect the actual layout/computed styles on the failing path, including border-box sizes, flex widths, margins, divider width, and any active transforms/animations. Compare effective CSS on Branch A with `origin/main`. Treat the user’s border/negative-margin/width idea as a hypothesis until the failing geometry is traced to a reachable declaration.
- Done when the failure reproduces on A, the same suite passes on current `origin/main`, and evidence identifies the CSS rule that causes the right-edge mismatch.

### T21 — Correct the Branch A CSS boundary

- Make the smallest CSS-only correction on Branch A so `.split-root-workarea` ends at or before `.workspace-right` begins while retaining one 1px hairline between them.
- Keep the existing test assertion unchanged; do not weaken its threshold or make test-only changes. Do not edit Branch B or unrelated UI.
- Done when the exact failing geometry test passes on A and effective dimensions show no overlap with the single separator preserved.

### T22 — Validate A and check B plus the combined preview

- On A run the full `GEN_SPLIT_APP_BROWSER=1 npx vitest run tests/split-app-browser.test.ts`, `npx vitest run tests/theme-contrast.test.ts`, `pnpm test:ui-guard`, `pnpm lint`, the frontend-refinement Playwright suite, and `git -c core.whitespace=cr-at-eol diff --check`. Report exact pass/fail/skip counts.
- Run the boundary test on Branch B at `d5c9eb468b08cb2b188745d6688b3d00bb1d57cd`; the user reports its full split-app-browser suite passed 59/59, but the current boundary still needs direct confirmation.
- Run the same boundary test on the local-only combined preview `devin/1795415056-combined-preview` in `/home/ubuntu/repos/Gen-V1`. If it fails, apply the same minimal CSS correction in that preview worktree only. Preserve its existing Branch B uncommitted diff and the `workspace-split.css` resolution; never commit or push the preview. Leave Vite running.
- Done when A’s requested matrix passes, B and the preview boundary are confirmed, the Branch A assertion is unchanged, and the CRLF-aware diff check is clean.

### T23 — Commit and push the Branch A fix

- After T22 passes, stage only the intended Branch A CSS file(s), commit with a focused `(#1830)` message, and push normally to `devin/1795398302-quiet-shell-chrome`. The user explicitly authorized this commit/push; do not force-push or merge.
- Verify the remote Branch A head equals the pushed SHA. Do not wait for or monitor CI after pushing; report immediately with root-cause evidence, diff, test counts, and SHA.

### State at r8 publication

- GitHub reports PR #1831 open/mergeable at A `fb2a5588be48c1b2d2da1115f8e6659a40a03c0d`; PR #1832 open/mergeable at B `d5c9eb468b08cb2b188745d6688b3d00bb1d57cd`.
- CI log evidence for job `137485670648` records `AssertionError: expected 920 to be less than or equal to 919.023681640625` at `tests/split-app-browser.test.ts:720:82`.
- The existing A and B worktrees are clean at their recorded heads. The combined preview is at local merge commit `5d170aa19ff45ba99739248ec7f1fecc3572d860` and has the expected seven-file uncommitted B diff plus this untracked plan source; preserve those changes.
- Current `origin/main` was fetched at `8f54f406b80f2d7d8ac09cc2a46557c125d681fa`. Both repository/worktree shallow checks returned false. The existing `/home/ubuntu/work/main-wt` is at older `36fcc56d` and is expressly not the comparison worktree.
- Current claim: https://github.com/skytuhua-org/Gen-V1/issues/1830#issuecomment-7095187627. Previous runner-queue RELEASE: https://github.com/skytuhua-org/Gen-V1/issues/1830#issuecomment-7094555098.
