# Plan: Report true min/max bounds on split-workspace resize dividers

## META
- Feature: aria-valuemin/aria-valuemax on split dividers must reflect the real clamped range
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev1, 2026-11-23
- Baseline: origin/main @ 36fcc56d24cef7558059264a8540d7f0592d93cd
- Issue: (filled on publish)
- Implementation status: NOT STARTED — plan only
- Source: live QA of built fixture app + code inspection of WorkspaceSplitLayout.tsx

## OBJECTIVE
The `role="separator"` split divider between workspace panes hardcodes `aria-valuemin={5}` and `aria-valuemax={95}`. The actual keyboard/pointer range is computed per-node in `keyResize`/`beginResize` as `low=Math.max(.05, firstMin/span)` and `high=Math.min(.95, 1-secondMin/span)` (percent ×100). When a pane's minimum size exceeds 5% of its span — common, since pane minimums are fixed px (e.g. a 248 px sidebar pane in an 800 px span ⇒ low=31%) — assistive tech announces a range wider than the one the control accepts: `aria-valuenow` can sit below the announced `aria-valuemin`, and Home/End silently clamp to the real bounds. Screen reader users get a wrong mental model of how far the divider can move and what the current position means.

Success: the aria range announced equals the range the keyboard handler will actually accept, for every split node, at every pane size and collapse state.

## REQUIREMENTS
- In scope: the divider rendered by `renderNode` in `apps/web/src/WorkspaceSplitLayout.tsx` (single line, currently `aria-valuemin={5} aria-valuemax={95}`); share the bound computation between `keyResize`, `beginResize` and the aria attributes so they can never drift; unit coverage of the helper; unchanged visuals, pointer behavior, and keyboard step sizes.
- Out of scope: pane minimum-size values themselves, the collapse/`is-narrow` presentation, the separate `ResizeHandle` in `WorkspacePanel.tsx` (already receives real min/max props).
- UX/a11y: `aria-valuemin`/`aria-valuemax` report the same integer-percent bounds the keyboard clamps enforce. `aria-valuenow` always falls inside the announced range. Announcement text and orientation are unchanged.
- Compatibility: no API, persistence, or layout-format changes. No behavior change for pointer or keyboard users beyond correct AT values.
- Error/recovery: when `low>high` (span too small for both minimums — the same case where `keyResize` and `beginResize` already bail), render the divider non-focusable (`tabIndex={-1}`) and drop the `aria-value*` attributes, since no adjustment is possible; the divider keeps `role="separator"`/`aria-label`/`aria-orientation` for structural exposure.

## REPO_MAP
- `apps/web/src/WorkspaceSplitLayout.tsx` (verified):
  - `renderNode` (~line 165): renders the divider with `role="separator"`, `tabIndex={0}`, `aria-valuenow={Math.round(ratio*100)}`, hardcoded `aria-valuemin={5}`/`aria-valuemax={95}`.
  - `keyResize` (~line 135): computes `span=(horizontal?rect.width:rect.height)-6`, `first=minimumSplitSize(layout,node.first)`, `second=minimumSplitSize(layout,node.second)`, `low=Math.max(.05,min1/span)`, `high=Math.min(.95,1-min2/span)`; ArrowLeft/Right/Up/Down step ±.01 (Shift ×5); Home→low, End→high; returns early when `low>high`.
  - `beginResize` (~line 131): same formula with `.minimum`/`.maximum` for pointer drag; returns early when `low>high`.
  - `minimumSplitSize` is imported (verified: used at lines 131/135); it yields `{width,height}` minimums for a subtree.
- `apps/web/src/WorkspacePanel.tsx` `ResizeHandle`: reference implementation — caller passes real `aria-valuemin={minimum}`/`aria-valuemax={maximum}` and clamps (verified lines 15–28). Match this contract.
- Tests: existing vitest suite under `apps/web` (verify with `rg -l "WorkspaceSplitLayout" apps/web --glob '*.test.*'`); Playwright suite exists for browser checks.

## DESIGN
Single shared bound computation, used by all three consumers.

1. Extract a pure helper in the same file (no new module): `splitBounds(layout, node, span)` → `{low:number, high:number}` returning the same numbers `keyResize` uses today: `low=Math.max(.05,(axis==='horizontal'?first.width:first.height)/span)`, `high=Math.min(.95,1-(axis==='horizontal'?second.width:second.height)/span)`. Inputs: the layout, the split node, and the measured `span` (region width/height minus the 6 px divider).
2. `keyResize` calls `splitBounds` instead of inlining the formula (behavior identical).
3. `beginResize` calls `splitBounds` for its `.minimum`/`.maximum` (behavior identical).
4. In `renderNode`, measure `span` for aria the same way `keyResize` does — but at render time there is no pointer event element; compute span from the parent split-node's rendered geometry via the existing `rects` map: the divider's parent element wraps both subtrees, so `span` equals the sum of the first subtree's used span + the second subtree's used span along the axis. Implementation detail the implementer must follow exactly: compute `span` as `(axis==='horizontal' ? regionWidth : regionHeight) - 6` where `regionWidth/regionHeight` come from the parent node's bounding rect obtained via `slots`/refs already established in the component; if the rect is not yet measured on first paint, omit `aria-valuemin`/`aria-valuemax` for that paint (they populate on the next layout pass — the divider already re-renders whenever `rects` updates because `viewPlacements` depends on them).
5. Aria values: `aria-valuemin={Math.round(low*100)}`, `aria-valuemax={Math.round(high*100)}`. When `low>high`: `tabIndex={-1}` and omit all three `aria-value*` attributes.
6. Keep `aria-valuenow={Math.round(ratio*100)}` as today, where `ratio` is the previewed-or-stored ratio already in scope.

No visual, motion, color, type, spacing, or copy changes: the divider's 6 px track, drag preview label (`{Math.round(ratio*100)}% width|height`), and all states are unchanged.

## EXECUTION_DAG
- T01 — Extract `splitBounds(layout, node, span)` and refactor `keyResize`+`beginResize` to use it. Deps: none. Owner: implementer. Done when: `pnpm vitest run` (existing suite) passes and `rg "Math.max\(.05" apps/web/src/WorkspaceSplitLayout.tsx` shows the formula only inside `splitBounds`. Handoff: T02.
- T02 — Render-time aria + focus guard in `renderNode`: real `aria-valuemin`/`aria-valuemax`, `tabIndex={-1}` + no `aria-value*` when `low>high`. Deps: T01. Owner: implementer. Done when: built fixture shows `aria-valuemin` equal to the pane-min-derived percent on the divider node in DevTools. Handoff: T03.
- T03 — Unit test `splitBounds`: min-below-5% → 0.05/0.95 floors; pane-min above 5% → raised low / lowered high; `low>high` → reported unsplittable. Plus one component-level assertion (vitest + Testing Library) that the divider exposes matching `aria-valuemin`. Deps: T02. Owner: implementer. Done when: new tests pass and fail against the pre-T02 code. Handoff: reviewer.

## VALIDATION
- Fixture command: `pnpm build && node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` → http://127.0.0.1:4317; open a thread, Area actions → Split left/right; inspect the divider (`.split-divider`) `aria-valuemin`/`aria-valuemax`; Tab to it, press Home/End and confirm `aria-valuenow` reaches the announced bounds exactly.
- Tests: `pnpm vitest run` (unit) and the Playwright layout spec if present (`rg -l "split" e2e tests`).
- Acceptance matrix: aria min/max equal clamped bounds (manual DevTools + T03 test); Home/End reach exactly those values; no-focus divider when unsplittable; zero visual diff.

## STATE
- Researched/verified: divider markup, `keyResize`, `beginResize` bound formulas, `minimumSplitSize` usage, `ResizeHandle` reference contract. Decided: helper + render-time span measurement via existing rects. Pending: T01–T03 implementation and verification. Risks: first-paint missing rect → handled by omitting aria bounds until measured. Next step: T01.

## REFERENCES
- Divider markup: apps/web/src/WorkspaceSplitLayout.tsx line 165 @ 36fcc56d24cef7558059264a8540d7f0592d93cd
- Bound formula: same file, `keyResize` ~line 135, `beginResize` ~line 131
- Reference pattern: apps/web/src/WorkspacePanel.tsx lines 15–28
