[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1749.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1749](https://github.com/skytuhua-org/Gen-V1/issues/1749). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Sidebar arrow navigation exists in [#1814](https://github.com/skytuhua-org/Gen-V1/pull/1814). T04 live Windows verification remains pending; open PR is not final acceptance.

### Reviewed implementation references

- [PR #1814](https://github.com/skytuhua-org/Gen-V1/pull/1814): open; head `06a8afa2de46d8c065194f752797d5b5573c6f15`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7113102414](https://github.com/skytuhua-org/Gen-V1/issues/1749#issuecomment-7113102414). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

Plan file: https://github.com/skytuhua-org/Gen-V1/blob/ad3b04f542e9bbbbf956f3ddf4370b9ffc861c05/docs/agent-plans/a11y-thread-list-arrow-nav.md

# Plan: Arrow-key navigation and roving tabindex for the thread list

## META
- Feature: Keyboard navigation model for the sidebar thread list (ArrowUp/Down/Home/End, roving tabindex)
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-22 (design fully specified — implementer makes no design choices)
- Baseline: main @ 97efd9caf3201f2903780669c86ad6c83e746fcb
- Issue: this issue
- Status: plan only, not implemented
- Provenance: live QA of the built fixture app on :4317 (QA pass 16), verified against `apps/web/src/ShellSidebar.tsx`

## OBJECTIVE
The thread list `<nav className="thread-list" aria-label="Threads" tabIndex={0}>` (`apps/web/src/ShellSidebar.tsx:429`) is a tab stop that does nothing with arrow keys — ArrowUp/ArrowDown/Home/End produce no focus movement (verified live: pressing ArrowDown on the focused nav container moves nothing). Each of the ~9 rows then costs three Tab presses (row → Archive → Options ≈ 27 stops) because every row and both hover action buttons stay in the tab order. Keyboard users walking the tab order hit a dead stop, then tab through every hidden action button. Success: a listbox-style model — one tab stop into the list, arrows move between rows, Tab leaves the list to the row's actions then onward.

## REQUIREMENTS
- In scope: `apps/web/src/ShellSidebar.tsx` (nav element, row button, action buttons), `apps/web/src/sidebar-context.css` only if the focus ring needs a rule for programmatic row focus.
- Exact interaction contract (listbox pattern, ARIA APG):
  1. The `<nav className="thread-list">` keeps `aria-label="Threads"` but loses `tabIndex={0}` (no longer a tab stop; scrollable region remains mouse-scrollable).
  2. Rows get `role="option"` inside a `role="listbox"` group wrapper per section, or the simpler equivalent: keep `button` semantics and manage roving `tabIndex` across all row buttons in all sections (pinned → working → settled → remaining order as rendered). Implementer MUST use the roving-tabindex-on-buttons approach to preserve existing `aria-current="page"` and click semantics.
  3. Roving tabindex: the currently selected thread's row has `tabIndex={0}`; every other row has `tabIndex={-1}`. When no row is selected, the first rendered row has `tabIndex={0}`.
  4. On a focused row: `ArrowDown` focuses the next rendered row (wrapping off the list is forbidden — focus stops at the last row); `ArrowUp` previous (stops at first); `Home` first row; `End` last row. Focus moves AND the row is scrolled into view (`scrollIntoView({block:'nearest'})`). Selection is NOT changed by arrows — focus only; `Enter`/`Space` opens as today.
  5. The two per-row action buttons (Archive `aria-label="Archive <title>"`, Options) keep `tabIndex={-1}` while the row is not focused/selected; on the focused row they become `tabIndex={0}` so Tab order stays row → Archive → Options → out of the list. (This preserves today's verified Tab reachability while removing ~24 dead stops.)
  6. `Alt+Enter` on a focused row keeps opening placement (`ShellSidebar.tsx:103–110` handler preserved); `Enter`/`Space` opens the thread; `Escape` on a row returns focus to the search input (`aria-label="Search threads"`, line ~391) — Escape already blurs menus; adding row-Escape-to-search matches the search-field shortcut loop used by #1703's fix. NO: Escape does NOT clear the filter.
  7. Focus ring: the focused row shows the same focus-visible style used today for buttons (`.sidebar .sidebar-row-action:focus-visible` and `thread-list:focus-visible` in `apps/web/src/sidebar-context.css:105,568`); apply the existing outline rule to `.sidebar-row:focus-visible` — no new color token; use `var(--accent)` outline 2px offset -2px as elsewhere.
  8. Reduced motion: no animation is introduced; `prefers-reduced-motion` needs no new rule.
  9. Narrow widths: identical behavior under the ≤700px overlay nav (scrim `rgba(0,0,0,0.4)`, z-index 59); Escape at overlay level still closes the nav — the row-level Escape focuses search only when the nav is open (it is, by definition, when a row has focus).
  10. Empty nav (no rows): the single tab stop on the nav container is acceptable ONLY when zero rows render; keep `tabIndex={0}` on the nav solely when `visibleMatching.length === 0` so the empty region is still focusable for screen-reader users.
- Copy/labels: unchanged except none added. No visible layout, spacing, color, or motion change; row height stays 52px.
- Out of scope: Ctrl+Tab thread switching (#1598), Ctrl+K command menu (#1371), search-field keyboard bugs (#1703), drag-and-drop keyboard reorder (sidebar-reorder has its own path — the existing `reorder` keyboard handler at `ShellSidebar.tsx:103–110` MUST be preserved: Alt+Enter placement and any arrow/drag keyboard handlers on the row `onKeyDown` chain stay working).

## REPO_MAP
- `apps/web/src/ShellSidebar.tsx:95–115` — row trigger button (`onKeyDown` chain incl. `trigger.onKeyDown`), `aria-current`.
- `apps/web/src/ShellSidebar.tsx:325` — Archive action button; Options menu trigger adjacent.
- `apps/web/src/ShellSidebar.tsx:369,429` — nav wrapper (`aria-label="Thread navigation"`) and `thread-list` nav.
- `apps/web/src/sidebar-context.css:92–105,517,548–573` — thread-list scroll/focus styles and action-button focus styles.
- `apps/web/src/sidebar-reorder.ts` — drag reorder (verify keyboard path intact).
- Related: #1703 (search keyboard), #1598 (Ctrl+Tab), #1139 (row markup rewrite — land in either order; the roving-tabindex rule must survive the rewrite).

## DESIGN
A small `useRovingTabindex` pattern local to ShellSidebar: track `focusedId` in state; derive `tabIndex` per row (`item.id === (focusedId ?? selectedId ?? firstId)` → 0 else -1); `onKeyDown` on the row handles the four keys, computes the flattened rendered order (pinned → working → settled → remaining) once per render, focuses the target row via ref map. Action buttons: `tabIndex={isFocusedRow ? 0 : -1}`.

## EXECUTION_DAG
- T01 — Add flattened-order derivation + `focusedId` state + ref map; wire row `tabIndex`, `onKeyDown`, focus-and-scroll. done-when: typecheck green.
- T02 — Remove `tabIndex={0}` from `.thread-list` except when empty; apply `tabIndex` gating to Archive/Options buttons. done-when: tab order measured = search → filter → new-thread → active row → its 2 actions → footer (≤6 stops before footer).
- T03 — vitest/jsdom-free browser test or Playwright spec: tab sequence assertion + ArrowDown/Up/Home/End focus movement + scroll-into-view. done-when: spec green.
- T04 — Fixture QA on :4317: full keyboard walk documented in VALIDATION. done-when: verified live on desktop + 400px overlay widths.

## VALIDATION
- Fixture: `pnpm build`, then
  `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` → `http://127.0.0.1:4317/`.
- Steps: Tab from page top → first/selected row focused (visible ring); ArrowDown×3 → focus on 4th row; End → last; ArrowDown again → stays last; Home → first; Tab → Archive focused (visible); Tab → Options; Tab → footer button. Enter on a row opens the thread. Alt+Enter opens placement. Escape on a row → search input focused. Reload → selected thread's row is the tab stop. Resize to 400px, open nav, repeat Escape + arrow checks.
- `pnpm lint`, `pnpm typecheck`, Playwright spec from T03.
- Acceptance matrix:
  - One tab stop into rows (roving) — required
  - Arrow/Home/End move focus without changing selection — required
  - Focused row scrolls into view — required
  - Action buttons tabbable only on focused row — required
  - Escape → search focus; Alt+Enter placement preserved — required
  - Empty nav keeps one tab stop — required
  - Zero visual diff except existing focus ring on focused row — required

## Historical STATE
Verified live on main @ 97efd9c (arrows dead on nav; ~27 tab stops); not implemented; next step T01.

## REFERENCES
- ARIA APG listbox pattern (roving tabindex on options).
- QA pass 16 probes: `afterArrows` — no focus movement on ArrowDown/Up/Home/End; tab chain enumerates row→Archive→Options per row.
- Related: #1703, #1598, #1371, #1139.
