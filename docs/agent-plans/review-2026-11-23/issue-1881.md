[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1881.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1881](https://github.com/skytuhua-org/Gen-V1/issues/1881). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Command-list Home/End/Page key support exists in open [#1897](https://github.com/skytuhua-org/Gen-V1/pull/1897). Boundary, paging and selection behavior remain pending integration.

### Reviewed implementation references

- [PR #1897](https://github.com/skytuhua-org/Gen-V1/pull/1897): open; head `267ba806317fc9e81814be1eeb90f900a3511407`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7104422714](https://github.com/skytuhua-org/Gen-V1/issues/1881#issuecomment-7104422714). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

Plan file: https://github.com/skytuhua-org/Gen-V1/blob/d8ed3cc4a22de3547c08388bca64171b55bf33fc/docs/agent-plans/1881-palette-keyboard.md

# Plan: Add Home/End/PageUp/PageDown to the slash-command palette

## META
- Feature: Full list navigation keys for the composer slash-command palette
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-23
- Baseline: main @ 1cbd02cd78e93771ddca6f0f490c31133919e44a
- Status: planning complete, implementation NOT started
- Source provenance: QA pass 22 + code read — `ComposerCommands.keyDown` handles only `Escape`, `ArrowUp`, `ArrowDown`, `Enter`, `Tab`. Catalog pages return up to 50 skills per fetch, so reaching item 40 requires 39 ArrowDown presses; Home/End/PageUp/PageDown do nothing (they edit the textarea instead).

## OBJECTIVE
Standard list-navigation keys work while the palette is open. Success: Home selects the first option, End selects the last loaded option, PageDown/PageUp move the active option by one visible page, all without leaving the textarea.

## REQUIREMENTS
- Scope: `apps/web/src/ComposerCommands.tsx`, the `useImperativeHandle` `keyDown` implementation only.
- Guard identical to arrows: only when `open`, not `isComposing`, and not with `altKey`/`ctrlKey`/`metaKey`. `shiftKey` is allowed to pass through unhandled (Home/End with Shift are textarea selection keys and must keep working — return `false` when `event.shiftKey` is true for all four keys).
- `Home`: `event.preventDefault()`, select the first element of `options.filter(available)`.
- `End`: `event.preventDefault()`, select the last element of `options.filter(available)`. If `page?.nextCursor` exists, also call `loadMore()` once (End means "bottom"; loading the next page mirrors the existing ArrowDown-at-bottom behavior).
- `PageDown`/`PageUp`: `event.preventDefault()`, move `±N` within `options.filter(available)`, where `N = Math.max(1, Math.floor((content.current?.querySelector('.composer-command-list')?.clientHeight ?? 168) / 42))`. Clamp to the list bounds (no wrap). If PageDown lands on the last option and `page?.nextCursor` exists, call `loadMore()`.
- Selection state continues to use the existing `setActive(option.id)`; `scrollIntoView({block:'nearest'})` already follows `active`.
- Wrap-around on ArrowUp/ArrowDown stays as-is (unchanged).
- Hint footer is not changed here (a sibling issue updates its text); arrow keys remain the documented pair.
- Reduced motion: unaffected — selection is not animated.

## REPO_MAP
- `apps/web/src/ComposerCommands.tsx` — `keyDown` inside `useImperativeHandle` (~line 74).
- `packages/ui-shell/list-navigation` — `isComposing` helper, reused.

## DESIGN
Keys operate on the `selectable = options.filter(available)` list, same as arrows, so disabled skill rows can never be activated by any key. Page size derives from the rendered list height and the 38–42 px option row height, not a magic constant: fall back to `168 / 42 = 4` when unmeasured.

## EXECUTION_DAG
- T01: Add the four key branches to `keyDown` in `ComposerCommands.tsx`. Owner: one implementer. Done-when: `pnpm typecheck` passes.
- T02: Unit tests: with 12 fake options, Home→index 0, End→index 11, PageDown from 0→N, PageUp back, Shift+Home returns `false` (textarea selection preserved), End/PageDown at the last item with `nextCursor` triggers `loadMore`. Done-when: tests fail before T01 and pass after.

## VALIDATION
- Fixture repro: `pnpm build` + review-host on :4317. Type `/`, press End — `/default` selected; Home — `/model` selected.
- Acceptance matrix: (a) each key moves selection as specified; (b) Shift+key untouched; (c) modifiers (Ctrl/Alt/Meta) untouched; (d) IME composition untouched; (e) closed palette → all four keys are textarea defaults.

## Historical STATE
Researched and decided; not implemented; not verified. Next step: T01 then T02.

## REFERENCES
- Component: apps/web/src/ComposerCommands.tsx