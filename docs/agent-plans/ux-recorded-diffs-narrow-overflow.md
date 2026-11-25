# Plan: Keep side-by-side recorded diffs readable at narrow widths

## META
- Feature: Changes (diff) surface — Recorded tab `diff-split` layout overflows in the right panel.
- Repo: skytuhua-org/Gen-V1
- Plan revision: 1, 2026-11-23
- Baseline branch: main @ 7ebe108dfa375ee018e64ba8b3dd6998088ae314
- Fixture repro: start the review host on :4317 (same command as the sibling plan), open http://127.0.0.1:4317, select "Explore the component catalog", open Changes → Recorded with `diffLayout` = "Side by side" (Settings → Diffs → Diff layout), and resize the panel under ~560px. `.workspace-diff-pair.diff-split` stays `grid-template-columns:1fr 1fr`; each `<pre>` keeps `white-space:pre` and overflows its column.
- Current status: verified in source (`apps/web/src/shell.css:173-180` has no media query / wrap / overflow handling).
- Source: deep QA pass 29 (diff view round 2).

## OBJECTIVE
A recorded before/after pair stays readable at every panel width. Success: at ≤560px content width the pair stacks vertically; at >560px it stays two columns; long lines scroll horizontally inside their own cell without pushing the panel.

## REQUIREMENTS
- In scope: `.workspace-diff-pair` (recorded before/after only), in both the right-panel and canvas placements.
- Out of scope: `.live-diff` (already `overflow:auto`), `.unified-diff` (monospace patch, already scrolls), diff color schemes.
- Agreed decisions (fully specified):
  1. Breakpoint: when the pair's container is <560px wide, render stacked (one column, Before above After). Implement with a container query (`container-type:inline-size` on `.workspace-diff`, `@container (max-width:560px)`) so panel width, not viewport, decides. Fallback for engines without container queries is not needed (all shipped targets support them); the media-query equivalent `@media (max-width:560px)` on the right panel is NOT used because canvas panels are narrower than the viewport.
  2. Long lines: each `section` in the pair gets `overflow-x:auto` on its `<pre>` (`.workspace-diff-pair>section>pre{overflow-x:auto}`), so a long line scrolls inside its cell instead of overflowing the column. Keep `white-space:pre`.
  3. Stacked order stays Before → After (source order unchanged).
  4. In stacked mode the section tint backgrounds stay exactly as in split mode (`--danger`/`--success` color-mix at 7%, or the blue-orange overrides).
  5. Between 560px and full width nothing else changes.
- Accessibility: `<section><h3>Before|After</h3>` structure unchanged; scrollable `<pre>` gets `tabindex="0"` only if not already focusable — verify: add `tabindex="0"` to both `<pre>`s in the pair so keyboard users can scroll them (role stays implicit; add `aria-label="Before"/"After"` is not needed because the preceding `<h3>` labels the section — instead wrap each cell's `<pre>` with no extra landmark).
- Keyboard: `<summary>` toggles the diff; focused `<pre>` scrolls with arrow keys.
- Motion: layout switch is instant (no transition on grid-template-columns); `prefers-reduced-motion` unaffected.
- Error/edge cases: zero-length before/after renders `(empty)` placeholder (existing); one-sided content keeps both cells aligned in split mode.

## REPO_MAP
- `apps/web/src/shell.css:170-180` — `.workspace-diff` details block, `.workspace-diff-pair` grid, `.diff-split` columns, tint backgrounds, `h3` header cell.
- `apps/web/src/WorkspacePanelBodies.tsx` — `RecordedDiffs` renders `<div className="workspace-diff-pair diff-${preferences.diffLayout}">` with two `<section><h3/><pre/></section>` children; `diffLayout` values: 'stacked' | 'split'.
- `apps/web/src/Settings.tsx:55` — `diffLayout` preference labels.
- Unverified: exact right-panel pixel width range where split becomes cramped (560px chosen from ~2×240px minimum readable code cell + 2×14px padding + borders).

## DESIGN
- `.workspace-diff{display:block;container-type:inline-size}` added in `shell.css`.
- `.workspace-diff-pair.diff-split{grid-template-columns:1fr 1fr}` unchanged for ≥561px.
- New rule: `@container (max-width:560px){.workspace-diff-pair.diff-split{grid-template-columns:1fr}}`.
- New rule: `.workspace-diff-pair>section>pre{overflow-x:auto;tabindex handled in JSX}`.
- JSX change in `RecordedDiffs`: add `tabIndex={0}` to both `<pre>` elements in the pair (and to the `.unified-diff` `<pre>` for parity).
- No token changes; no new components.

## EXECUTION_DAG
- T01: Add container-type + container query + per-cell `overflow-x:auto` in `shell.css`. Done when split collapses to stacked at <560px container width.
- T02: Add `tabIndex={0}` to the two pair `<pre>`s and the unified `<pre>` in `RecordedDiffs`. Independent of T01, same PR.
- Done-when: catalog diff at 340px panel shows Before full-width, After below it, no panel-level horizontal scrollbar; arrow keys scroll a focused wide `<pre>`.

## VALIDATION
- Fixture + Playwright: seed the catalog Diff (already in fixture); set `diffLayout='split'`; render panel at 340px and 720px; assert `getComputedStyle(pair).gridTemplateColumns` yields one column vs two; assert no horizontal overflow of `.workspace-diffs` (`scrollWidth===clientWidth` at 340px).
- Long line: include a >200-char line in the after side (fixture value `const value = 2;` → widen in a test override or a second seeded element) and verify the `<pre>` scrolls internally.
- Themes: light + dark; both `diffColors` schemes.
- `prefers-reduced-motion`: no transition introduced.
- Regression: `diffLayout='stacked'` unchanged at all widths.

## STATE
- Researched/decided: all above. Implemented: nothing. Verified: missing media/container query and fixed `1fr 1fr` in source.
- Next step: implement T01+T02 in one small PR.

## REFERENCES
- `apps/web/src/shell.css:173-180`, `apps/web/src/WorkspacePanelBodies.tsx` (`RecordedDiffs`), `apps/web/src/Settings.tsx:55`.
