# UI: History menu lists actions that can never be enabled

## META

- **Feature**: Omit permanently-unsupported actions from the conversation History menu; keep contextually-disabled items visible with their reason.
- **Repo**: `skytuhua-org/Gen-V1` · **Plan revision**: 1 · **Date**: 2026-11-21
- **Baseline**: `main` at HEAD of the local clone at filing time (verify `git rev-parse main` before starting).
- **Issue**: #1613 · **Source provenance**: QA pass 5, real-user drive of the built fixture on `http://127.0.0.1:4317`.

## OBJECTIVE

The History menu currently renders `Fork conversation — unavailable (unsupported)` in every state where the connected engine lacks fork support. A permanently dead row reads as a defect and clutters a 4-item menu. Menus should show a disabled item only when the user can change the precondition; items the engine can never satisfy should not render.

## REQUIREMENTS

**In scope**
- The History (kebab/⋯ or History-labelled) menu on the conversation header: row list, copy, and the enabled/disabled logic for `Fork conversation`.

**Out of scope**
- Implementing conversation forking itself; other menus; the `Inspect point` / `Start new task with quoted context` / `Import ArchiveV1 JSON…` rows' behavior.

**UX requirements**
- When the engine reports no fork support, `Fork conversation` does not render at all — no row, no separator left behind.
- When the engine supports fork, the row reads `Fork conversation` (drop the `— unavailable (unsupported)` suffix), is enabled, and invokes the existing fork path unchanged.
- Rows that are contextually disabled (e.g. an `Inspect point` that needs a loaded checkpoint) stay visible, greyed at the existing disabled opacity, with a title/tooltip explaining the precondition — the pattern the codebase already uses.
- Menu a11y unchanged: `role="menu"`, rows keep `role="menuitem"`, keyboard arrow order has no dead row, trigger `aria-expanded` toggles.
- No motion/layout change: menu positions identically; it is one row shorter in the unsupported state.

## REPO_MAP

- Discovery: locate the History menu component (search `apps/web/src` for `"Fork conversation"` and `"Import ArchiveV1"`); the row is rendered from a list where each entry carries an `unavailable`/disabled reason. The exact file is the implementer's first verification target — mark it, do not guess.
- Menu primitives: the same menu component family used by `Layouts` and thread rows (discovery); reuse its existing conditional-render pattern for hiding unsupported variants.

## DESIGN

- Replace the binary "render row + disabled flag" for fork with a two-branch decision:
  1. `engineSupportsFork` (the flag already feeding the `unsupported` suffix) falsy → omit the row.
  2. truthy → render enabled.
- Copy table:
  | Row | Unsupported engine | Supported engine |
  |---|---|---|
  | Fork conversation | not rendered | `Fork conversation`, enabled |
  | Inspect point | `Inspect point` (unchanged) | `Inspect point` (unchanged) |
  | Start new task with quoted context | unchanged | unchanged |
  | Import ArchiveV1 JSON… | unchanged | unchanged |
- If other History rows carry the same `unsupported` suffix pattern, apply the same rule uniformly.

## EXECUTION_DAG

- **T01**: Grep `apps/web/src` for `Fork conversation` / `unsupported`; open the History menu source; confirm the support flag name and the row-list shape.
- **T02**: Change the row render to omit `Fork conversation` when the support flag is falsy; keep the disabled-reason path for contextually disabled rows.
- **T03**: Build + serve :4317; open History in a local fixture thread → `Fork conversation` absent, three rows present and functional; menu positions identically.
- **T04**: `pnpm typecheck`, `pnpm lint`, scoped Playwright config; commit + PR with before/after screenshots of the menu.

## VALIDATION

- Commands: `pnpm typecheck`, `pnpm lint`, `pnpm exec playwright test --config tests/e2e/redundant-ui.playwright.config.ts`.
- Real-user: :4317 fixture; History menu on a non-checkpointed thread shows 3 rows, no dead entry; keyboard arrow navigation skips nothing.

## STATE

Researched (symptom observed) / implemented: nothing yet / verified: nothing yet. Next step: T01 discovery.

## REFERENCES

- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1613
- Fixture review host: `openReviewHost` in `scripts/review-host.ts` (port 4317).
