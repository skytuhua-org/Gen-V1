[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1748.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1748](https://github.com/skytuhua-org/Gen-V1/issues/1748). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Pinned-thread filtering repair exists in open [#1761](https://github.com/skytuhua-org/Gen-V1/pull/1761). Accepted filter/Pinned-section behavior is pending main integration.

### Reviewed implementation references

- [PR #1761](https://github.com/skytuhua-org/Gen-V1/pull/1761): open; head `453cc45015293fcbfbc112e5b3c5e07c5086b8ff`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7088513004](https://github.com/skytuhua-org/Gen-V1/issues/1748#issuecomment-7088513004). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

Plan file: https://github.com/skytuhua-org/Gen-V1/blob/ad3b04f542e9bbbbf956f3ddf4370b9ffc861c05/docs/agent-plans/ux-pinned-survives-filter.md

# Plan: Keep the Pinned section visible under the status filter

## META
- Feature: Pinned threads remain visible and grouped when the sidebar status filter is active
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-22 (design fully specified — implementer makes no design choices)
- Baseline: main @ 97efd9caf3201f2903780669c86ad6c83e746fcb
- Issue: this issue
- Status: plan only, not implemented
- Provenance: live QA of the built fixture app on :4317 (QA pass 16), verified against `apps/web/src/ShellSidebar.tsx`

## OBJECTIVE
The filter button cycles all → working → waiting (`apps/web/src/ShellSidebar.tsx:161,399–402`). Because `visibleMatching` is filtered before `pinned` is derived (lines 168–179), a pinned thread whose status does not match the filter disappears entirely, and the whole Pinned section header collapses. Verified live: with filter `working`, the nav renders only "No working threads right now." — the Pinned section is gone even though pinning exists precisely for always-on quick access. Success: pinned threads always render in the Pinned section, subject only to search text; the status filter applies to non-pinned groups.

## REQUIREMENTS
- In scope: `apps/web/src/ShellSidebar.tsx` only — the `pinned`/`working`/`settled`/`remaining` derivations (lines 179–186) and nothing else.
- Exact behavior:
  1. `pinned` is computed from `matching` (search-filtered), NOT `visibleMatching`: every pinned thread matching the current search text renders under the "Pinned" header regardless of `filter`.
  2. `working`, `settled`, `remaining` keep today's definitions but exclude pinned items exactly as now (they already filter `!pinned.includes(item)`; with the new `pinned` set this stays correct).
  3. The "Pinned" section header renders whenever `pinned.length > 0`, with the same header styling it has today: 12px / 500 weight / `color: var(--muted)` (computed `rgb(160,160,160)`), 0.5px letter-spacing, 10px top + 6px bottom + 9px horizontal padding — unchanged.
  4. Empty state (`ShellSidebar.tsx:474`) is unchanged and now covers the case where pinned is non-empty but no other section has rows: no extra copy is added — the sections simply render below Pinned as they do today.
  5. Under `working`/`waiting` filter with zero matching non-pinned threads and zero pinned threads, the current empty string is kept verbatim: filter `working` → "No working threads right now.", `waiting` → "No threads waiting for your input." (`styles.css:83`: 12px, `var(--muted)`, line-height 1.6, padding 12px 9px).
  6. Search still applies to pinned rows: typing in search narrows Pinned exactly like any other section (`locked` flag at line 191 already forces flat matching when searching — the new `pinned` derivation feeds that path the same way).
- Copy, spacing, colors, motion: no changes anywhere. Row height stays 52px; section spacing unchanged; filter button, its `aria-pressed` and `title` text unchanged.
- Out of scope: filter tri-state order/labels, search behavior (#1703), section customization (#1374).
- a11y: the `aria-pressed` filter button already announces state; no new announcements. Pinned rows keep `aria-label` and `aria-current` handling unchanged.

## REPO_MAP
- `apps/web/src/ShellSidebar.tsx:161–191` — `filter` state, `matching`, `visibleMatching`, `pinned`, `working`, `settled`, `remaining`, `locked`.
- `apps/web/src/ShellSidebar.tsx:429–474` — `<nav className="thread-list">`, `group('pinned', 'Pinned', pinned, …)`, empty-state line.
- `apps/web/src/styles.css:74,83` — `.thread-list` overflow, `.sidebar-empty` styling.
- `apps/web/src/sidebar-context.css:92–105,517` — `.thread-list` layout/focus styles (unchanged).
- Related: #1139 (row grouping/de-clutter — touches the same derivations; land in either order, the pinned rule above must survive), #1374 (user sections — pinned semantics preserved).

## DESIGN
Change the single derivation:

```
const pinned = matching.filter(item => item.presentation?.pinned);
```

`working`, `settled`, `remaining` continue to subtract `pinned.includes(item)`; with `pinned` now drawn from `matching` they exclude pinned threads that survived filtering, which is the intended behavior (a pinned thread never renders twice). No other line changes.

## EXECUTION_DAG
- T01 — Apply the one-line change in `apps/web/src/ShellSidebar.tsx`; verify no other derivation edit is needed. done-when: `pnpm typecheck` green.
- T02 — vitest: fixture state with a pinned `awaiting_input` thread and filter `working` asserts the pinned thread still renders under the Pinned header and the empty-state text still appears for the empty working group. done-when: test green.
- T03 — Fixture QA on :4317: pin a `Ready`/`settled` thread, cycle filter to `working` → pinned row + "Pinned" header still visible; cycle to `all` → unchanged. done-when: verified live.

## VALIDATION
- Fixture: `pnpm build`, then
  `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` → `http://127.0.0.1:4317/`.
- Manual steps: row ⋯ → "Pin"; filter button twice → `waiting`; confirm Pinned section remains; filter → `working` on a fixture with a working thread → Pinned + Working sections both render; unpin → filter view identical to today.
- `pnpm lint`, `pnpm typecheck`, vitest suite for ShellSidebar.
- Acceptance matrix:
  - Pinned + filter: pinned rows visible under "Pinned" — required
  - No duplication: a pinned thread never appears in a second group — required
  - Empty states: verbatim strings preserved — required
  - Search narrows Pinned identically — required
  - No visual/motion regression (row 52px, header 12px/500 muted) — required

## Historical STATE
Verified-by-inspection + live-reproduced defect on main @ 97efd9c; not implemented; next step T01.

## REFERENCES
- Live repro 2026-11-22: filter `working` → nav innerText "No working threads right now.", Pinned absent.
- Related: #1139, #1374.
