[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1747.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1747](https://github.com/skytuhua-org/Gen-V1/issues/1747). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Sidebar unread-dot accessibility repair exists in open [#1756](https://github.com/skytuhua-org/Gen-V1/pull/1756). The plan's not-implemented statement is stale; named unread state and landing remain required.

### Reviewed implementation references

- [PR #1756](https://github.com/skytuhua-org/Gen-V1/pull/1756): open; head `b3fdb1d40b797cc0fb1000fec9d3fba58c843ea5`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7088517002](https://github.com/skytuhua-org/Gen-V1/issues/1747#issuecomment-7088517002). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

Plan file: https://github.com/skytuhua-org/Gen-V1/blob/ad3b04f542e9bbbbf956f3ddf4370b9ffc861c05/docs/agent-plans/a11y-sidebar-unread-announce.md

# Plan: Announce unread state on sidebar thread rows to screen readers

## META
- Feature: Announce unread status in sidebar thread row accessible names
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-22 (design fully specified — implementer makes no design choices)
- Baseline: main @ 97efd9caf3201f2903780669c86ad6c83e746fcb
- Issue: this issue
- Status: plan only, not implemented
- Provenance: live QA of the built fixture app on :4317 (QA pass 16), verified against `apps/web/src/ShellSidebar.tsx`

## OBJECTIVE
A thread row marked unread renders a 5px accent dot (`<span className="unread-dot" />`, `apps/web/src/shell.css:109`) but the row's `aria-label` is only `` `${item.title} ${threadStatus(item)}` `` (`apps/web/src/ShellSidebar.tsx:261`). A screen-reader user hears e.g. "Workspace & settings Ready" with no indication the thread is unread — the single visual signal has no programmatic equivalent (WCAG 1.1.1 / 4.1.3-adjacent). Success: every unread row's accessible name announces "unread"; read rows are unchanged.

## REQUIREMENTS
- In scope:
  - `apps/web/src/ShellSidebar.tsx` — the `aria-label` on thread-row buttons (line ~261) and the `unread-dot` spans (lines ~274, ~306).
  - Both render sites of the row (pinned/working section and remaining/settled lists) — the row is a shared component; one change covers both.
- Out of scope: the "Mark as read / Mark as unread" menu item (already labelled, `ShellSidebar.tsx:215`), the agent-inbox unread badge (#1715), any visual change to the dot.
- Exact behavior:
  1. When `item.presentation?.unread` is true, the row `aria-label` becomes `` `${item.title} ${threadStatus(item)} Unread` `` — status word order preserved, "Unread" appended with a single space.
  2. When false, the label is exactly today's value — no trailing space, no word.
  3. The `unread-dot` span gets `aria-hidden="true"` so it cannot double-announce.
  4. No visible change of any kind: dot stays 5px circle, `background: var(--accent)`, `margin-right: 6px`, `vertical-align: middle` (`apps/web/src/shell.css:109`), no new token, no motion change.
- Copy: literal `Unread` (capital U), matching sentence-case labels used elsewhere in the file.
- i18n: the repo labels are English literals; this follows the same convention.
- Keyboard/focus: unchanged (row is already a `button` with `tabIndex`; focus ring `.sidebar .sidebar-row-action:focus-visible` / row focus styles in `apps/web/src/sidebar-context.css:105,568` are untouched).

## REPO_MAP
- `apps/web/src/ShellSidebar.tsx` — line 261 row `aria-label`; lines 274 & 306 the two `unread-dot` render sites; line 215 menu item (unchanged).
- `apps/web/src/shell.css:109` — `.unread-dot` rule (read-only reference; do not edit).
- Related: #1139 plans rewording of the same `aria-label` for project repetition — land either order; this change appends a trailing word and does not conflict semantically. Implementers touching the label must preserve the ` Unread` suffix rule.
- Verified state on fixture build: marking a row unread adds the dot; `getAttribute('aria-label')` returns "Workspace & settings Ready" — no unread token (measured 2026-11-22).

## DESIGN
One-line conditional in the existing label expression. No new component, state, or prop.

```
aria-label={`${item.title} ${threadStatus(item)}${item.presentation?.unread ? ' Unread' : ''}`}
```

`unread-dot` spans: add `aria-hidden="true"` at both render sites.

## EXECUTION_DAG
- T01 — Update row `aria-label` and mark both `unread-dot` spans `aria-hidden="true"` in `apps/web/src/ShellSidebar.tsx`. done-when: `pnpm typecheck` passes; no other lines changed.
- T02 — Unit test (vitest) asserting the aria-label string for unread vs read rows renders " Unread" suffix only when `presentation.unread` is true. done-when: new test passes.
- T03 — Fixture QA: mark a thread unread via the row ⋯ menu, inspect the row's `aria-label` in DevTools; mark read; verify label reverts exactly. done-when: both states verified on :4317 fixture.

## VALIDATION
- Repro fixture (run from repo root, after `pnpm build`):
  `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` → open `http://127.0.0.1:4317/`.
- Steps: open any thread's Options menu → "Mark as unread" → DevTools inspect row button → `aria-label` ends with ` Unread`; "Mark as read" → suffix gone. Repeat on a pinned row and a settled row.
- Tests: `pnpm typecheck`, `pnpm lint`, targeted vitest file for ShellSidebar if present, else the new test from T02.
- Acceptance matrix:
  - Unread pinned row label ends " Unread" — required
  - Unread normal row label ends " Unread" — required
  - Read row label identical to today — required
  - Dot spans carry `aria-hidden="true"` — required
  - Zero visual diff (dot size/color/spacing unchanged) — required

## Historical STATE
Verified-by-inspection defect on main @ 97efd9c; not implemented; next step T01.

## REFERENCES
- Fixture QA evidence: pass 16 probes (this session), `aria-label` read out as "Workspace & settings Ready" while dot present.
- Related issues: #1139 (row a11y name rework), #1715 (agent-inbox unread badge).
