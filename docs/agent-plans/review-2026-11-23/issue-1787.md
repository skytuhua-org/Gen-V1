[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1787.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1787](https://github.com/skytuhua-org/Gen-V1/issues/1787). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Model-picker empty-state placement repair exists in open [#1808](https://github.com/skytuhua-org/Gen-V1/pull/1808). Results-list/footer state and landing remain required.

### Reviewed implementation references

- [PR #1808](https://github.com/skytuhua-org/Gen-V1/pull/1808): open; head `7e453d12a114257461e805a8a3af23b66f86fa30`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7113102977](https://github.com/skytuhua-org/Gen-V1/issues/1787#issuecomment-7113102977). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

# Plan: Model picker renders the empty state below the footer instead of in the results list

## META
- Title: Model picker empty state is pinned below the scope hint and "Start new task" CTA
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev1, 2026-11-23
- Baseline: `main` @ `36fcc56d`
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1787 (canonical body holds this full plan)
- Status: not implemented; plan published for maintainer assignment

## OBJECTIVE
When a model-picker search (or the Favorites rail with zero favorites) matches no models, the "No models found"/"No favorites yet" message renders BELOW the `.model-picker-scope` note and the `.model-picker-new-task` CTA at the bottom of the popover instead of inside the scrollable results area. Verified live at http://127.0.0.1:4317 (fixture). Success: the empty state occupies the same region the list rows occupy, between the search bar and the footer elements.

## REQUIREMENTS
- In scope: `apps/web/src/ModelPicker.tsx` JSX ordering for the empty state; `apps/web/src/model-picker.css` `.model-picker-empty` spacing so it reads correctly inside `.model-picker-list`.
- Copy is unchanged and exact: title line `No models found` with detail `Try another model or provider name.`; for an empty Favorites rail `No favorites yet` with detail `Star a model to keep it here.` `role="status"` is preserved on the `<p>`.
- The scope hint (`{scopeHint && ...}`) and the new-task CTA (`{onNewTask && ...}`) keep their position, styling, and behavior; they render after the list region exactly as today.
- Visual spec for the empty state inside the list: element stays `<p className="model-picker-empty" role="status">`; styles `margin:0; padding:12px 8px; font-size:14px; line-height:1.4; color:var(--text)`; the `<span>` detail line `display:block; margin-top:4px; font-size:12px; color:var(--muted)`; left-aligned, top of the empty list area. List keeps its existing `padding:12px`, so the effective inset is 12px+8px=20px left, matching the current 20px visual inset.
- The listbox (`role="listbox"`) keeps `aria-label="Available models"`; when empty it contains only the status message — no `role="option"` children — which is valid (an empty listbox). The `<p role="status">` sits inside the listbox without a role conflict.
- No changes to motion: the popover's existing `model-picker-in`/`model-picker-out` animations and `prefers-reduced-motion` handling cover the swap; the empty `<p>` has no animation of its own.
- Out of scope: behavior when `models` is empty entirely (covered by the "Connect a model to start" CTA issue #1636), keyboard shortcut hints, project picker.

## REPO_MAP
- `apps/web/src/ModelPicker.tsx` — component. Lines 109–125: `.model-picker-main` column; line 111–119 `.model-picker-list` listbox; lines 120–121 scope hint and CTA; lines 122–124 the misplaced `{!visible.length && ...}` empty `<p>` rendering AFTER the footer items.
- `apps/web/src/model-picker.css` — line 64 `.model-picker-empty{flex:1;margin:0;padding:12px 20px;font-size:14px;overflow:auto;min-height:0;box-sizing:border-box}`, line 65 `>span{display:block;margin-top:4px;font-size:12px;color:var(--muted)}`.
- `apps/web/src/ScopedConversationComposer.tsx` — hosts the picker; `scopeHint`/`onNewTask` props (verified owners: composer toolbar).
- Tests: `tests/e2e/` Playwright specs use the review host fixture; closest existing spec area `tests/model-*.test.ts` (vitest render specs pattern used across the repo).

## DESIGN
Single JSX reorder plus one padding adjustment:
1. Move the `{!visible.length && (…)}` block from after the CTA to inside `.model-picker-list`, as the list's last child after the `{groups.map(...)}` block.
2. Change `.model-picker-empty` padding from `12px 20px` to `12px 8px` and drop `flex:1` (it is no longer a flex sibling of the list; the list is already `flex:1` and scrollable, so a non-flex child renders at the top of the scroll area). Remove `overflow:auto` and `min-height:0` — the list provides scrolling. Keep `margin:0`, `font-size:14px`, `box-sizing:border-box`. Keep the `>span` rule unchanged.
3. No state, prop, or API changes. `role="status"` and both copy strings unchanged.

## EXECUTION_DAG
- T01 — Reorder the empty-state JSX and retune `.model-picker-empty`. Owner: single implementer. Deps: none. Edits: `apps/web/src/ModelPicker.tsx` (move block into `.model-picker-list`), `apps/web/src/model-picker.css` (padding/flex change). Done-when: searching a no-match string renders the message inside the results area above the scope hint/CTA. Handoff: reviewer verifies in fixture.
- T02 — Add regression coverage. Owner: same implementer. Deps: T01. Edits: extend or add a vitest render spec asserting `.model-picker-empty` is a descendant of `.model-picker-list` and precedes `.model-picker-scope` in DOM order. Done-when: `pnpm exec vitest run tests/model-picker*.test.ts` passes. Handoff: none.

## VALIDATION
- Fixture (reproduces the bug today): `pnpm build:widgets && ./node_modules/.bin/vite build`, then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` → open http://127.0.0.1:4317, open the model picker, type `zz` in the search field.
- Acceptance matrix: (a) `zz` search → "No models found / Try another model or provider name." inside the list region, above the scope hint and CTA; (b) Favorites rail with zero stars → "No favorites yet / Star a model to keep it here." in the same position; (c) non-empty results render unchanged; (d) scope hint + CTA unchanged in position and function; (e) Esc still closes and restores focus; (f) reduced-motion run shows no new animation.
- Planned checks: `npx tsc --noEmit`, `pnpm lint`, new vitest spec, one Playwright spec asserting DOM order inside the listbox.

## Historical STATE
- Researched: bug reproduced live on the fixture and confirmed in JSX order (lines 120–124).
- Decided: keep element/copy/a11y identical; move node only.
- Pending: implementation, review, merge.
- Risks: none structural; purely presentational reorder.
- Next step: assign to an implementer per the issue's plan.

## REFERENCES
- Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1787
- Component: apps/web/src/ModelPicker.tsx (lines 109–125)
- Styles: apps/web/src/model-picker.css (lines 33, 64–65, 109–112)
