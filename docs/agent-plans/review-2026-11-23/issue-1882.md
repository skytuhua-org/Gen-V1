[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1882.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1882](https://github.com/skytuhua-org/Gen-V1/issues/1882). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Palette-height calculation repair exists in open [#1894](https://github.com/skytuhua-org/Gen-V1/pull/1894). Formula/unit evidence exists, but visual last-option/footer verification remains pending.

### Reviewed implementation references

- [PR #1894](https://github.com/skytuhua-org/Gen-V1/pull/1894): open; head `016c18f58866111e810e52e27f9e347f2d146ab8`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7121565687](https://github.com/skytuhua-org/Gen-V1/issues/1882#issuecomment-7121565687). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

Plan file: https://github.com/skytuhua-org/Gen-V1/blob/d8ed3cc4a22de3547c08388bca64171b55bf33fc/docs/agent-plans/1882-palette-height.md

# Plan: Stop the slash-command palette height from clipping the last option

## META
- Feature: Correct popover height for the composer slash-command palette
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-23
- Baseline: main @ 1cbd02cd78e93771ddca6f0f490c31133919e44a
- Status: planning complete, implementation NOT started
- Source provenance: QA pass 22, fixture on http://127.0.0.1:4317 — with three options (`/model`, `/plan`, `/default`) the popover is `min(352, 3*42+44) = 170px`, but the unavailable-sources block (up to 76px), the hint footer (~24px) and popover padding (10px) consume over half of it, leaving ~44px for the list: `/default` renders half-clipped and the list scrolls for just 3 rows.

## OBJECTIVE
The popover is tall enough to show every loaded option plus its fixed footer rows, capped at 352px. Success: with any option count and any combination of status/unavailable/load-more/hint rows, no option is clipped before the 352px cap forces scrolling.

## REQUIREMENTS
- Scope: `apps/web/src/ComposerCommands.tsx`, the `height` prop passed to `Popover` only. No CSS changes.
- Current: `height={Math.min(352, Math.max(110, options.length * 42 + 44))}`.
- Required formula:
  - `ROW = 42` (option row min-height 38 + 4px gap; matches existing estimate)
  - `HINT = 26` (hint footer: padding 5+2, border-top 1, ~18px text)
  - `STATUS = 29` (one `.composer-command-status` row: padding 16 + 13px line)
  - `SOURCES = Math.min(76, unavailableSources.length * 17 + 6)` (row ≈17px incl. 3px vertical padding; block max-height 76, padding 3 top)
  - `MORE = 30` (`composer-command-more` button: ~20px text + 10px padding)
  - `PAD = 16` (popover padding 5 top + 5 bottom + 3 gaps + slack)
  - `chrome = HINT + (loading || error || (!loading && !options.length) ? STATUS : 0) + (page?.skills.length ? STATUS : 0) + SOURCES + (page?.nextCursor ? MORE : 0) + PAD`
  - `height = Math.min(352, Math.max(110, options.length * ROW + chrome))`
- The list keeps `flex:1; min-height:0; overflow:auto` — when the cap binds, the list scrolls exactly as today.
- Placement: height feeds `placePopover`, which already clamps to the viewport — no overflow risk on short viewports.
- Motion: the popover does not animate height; the size change is instant. Unchanged.
- The height recomputes per render from the same state the JSX uses, so it can never disagree with what is actually rendered.

## REPO_MAP
- `apps/web/src/ComposerCommands.tsx` — `Popover` call site (~line 99).
- `packages/ui-shell/Popover.tsx` + `overlay-position.ts` — consume the height; unchanged.
- `apps/web/src/composer-commands.css` — row/padding metrics the constants are derived from; unchanged.

## DESIGN
The popover height must equal list height + chrome height. Rather than measuring DOM, derive chrome from the same booleans that decide whether each footer block renders — single source of truth, no layout read.

## EXECUTION_DAG
- T01: Replace the `height` expression in `ComposerCommands.tsx` with the formula above. Owner: one implementer. Done-when: `pnpm typecheck` passes.
- T02: Unit test computing the prop for the four combinations (0/3 options × sources present/absent × nextCursor present/absent) asserting each block's allowance is included exactly once. Done-when: fails before, passes after.

## VALIDATION
- Fixture repro: `pnpm build` + review-host on :4317. Type `/` — all three options fully visible (no clipped `/default`), unavailable sources and hint fully visible. Type `/mod` — popover shrinks to fit one option plus chrome.
- Resize viewport to 700px height — popover clamps upward without covering the composer textarea.
- Acceptance matrix: (a) 3 options + sources → all visible; (b) 1 option + no sources → compact popover; (c) >6 options → 352px cap, list scrolls; (d) error/status row present → included in height.

## Historical STATE
Researched and decided; not implemented; not verified. Next step: T01 then T02.

## REFERENCES
- Component: apps/web/src/ComposerCommands.tsx
- Popover: packages/ui-shell/Popover.tsx