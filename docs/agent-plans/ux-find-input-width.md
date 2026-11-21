# UI: Find-in-conversation input collapses to ~8px — typed phrase is invisible

## META

- **Feature**: Restore a usable width for the find-in-conversation input so the typed phrase is visible.
- **Repo**: `skytuhua-org/Gen-V1` · **Plan revision**: 1 · **Date**: 2026-11-21
- **Baseline**: `main` at HEAD of the local clone at filing time (verify `git rev-parse main` before starting).
- **Issue**: #1612 · **Source provenance**: QA pass 5, real-user drive of the built fixture on `http://127.0.0.1:4317` (review host serving `dist/web`).

## OBJECTIVE

A user pressing Ctrl+F (or the magnifier) in any conversation must see the phrase they type. Today the input renders ~8px wide (`getBoundingClientRect().width === 8` measured in the fixture), so typed text is invisible — only the icon, count label and ↑ ↓ ✕ controls show. Secondary symptom to verify under the same fix: with a matching query the count read `0 results` while `::highlight` marks were visibly painted on matching transcript text.

## REQUIREMENTS

**In scope**
- `.conversation-find-owner` / `.conversation-find` / `.conversation-find input` sizing in `apps/web/src/conversation-find.css`.
- Verify count label ↔ highlight marks ↔ ↑/↓ navigation stay in sync after the fix (no separate logic change unless inspection shows a second bug).

**Out of scope**
- New find features (regex, replace, filters), terminal/files find, styling of `::highlight` colors beyond what exists, other header controls.

**UX requirements**
- Input is at least **160px** wide in the normal layout; the pill's max footprint stays `380px` (`width:min(100%,380px)` retained as the outer bound).
- On narrow areas (< ~360px of available header width) the pill keeps shrinking below its max but the input never drops under `96px`; below that the pill may clip horizontally as today (header overflow behavior unchanged).
- Placeholder `Find a phrase` (when the input is empty and unfocused the count cell reads `Find a phrase`; while typing, that cell becomes the match counter — behavior unchanged).
- Count cell: `0 results` for no match, `N of M` (e.g. `2 of 5`) for matches, using existing 12px/`var(--muted)`/`tabular-nums` styling.
- Keyboard: Enter = next match, Shift+Enter = previous match (existing); Escape closes the bar and returns focus to the trigger (existing — keep).
- Closing the bar (✕ button or Escape) clears all `conversation-find-all` and `conversation-find-current` `::highlight` ranges and restores focus to the magnifier trigger.
- No motion change: the pill appears in place without animation today; keep that.
- The bar scopes to the visible conversation only; switching threads re-initializes empty (existing behavior — verify).

**Accessibility**
- `input` keeps `aria-label="Find phrase"`; buttons keep `aria-label="Previous match" / "Next match" / "Close find"`; trigger `aria-expanded` toggles correctly.
- `:focus-visible` outline (2px `var(--ui-focus-ring)`) applies to the widened input unchanged.

## REPO_MAP

- `apps/web/src/ConversationFind.tsx` — component: `value={query}` input, count cell shows `{query?count?`${index+1} of ${count}`:'0 results':'Find a phrase'}`; scan via `conversationRanges(root, query)` + `highlightConversation`. **No component change expected** unless the count-mismatch symptom reproduces with the fixed width (then debug `index`/`count` vs `ranges.length`).
- `apps/web/src/conversation-find.css` — target file. Current rules: `.conversation-find-owner {display:flex;justify-content:flex-end;flex:0 0 auto;min-width:0;…}`; `.conversation-find {width:min(100%,380px);…}`; `.conversation-find input {flex:1;min-width:0;width:0;…}`.
- `::highlight(conversation-find-all)` / `::highlight(conversation-find-current)` — existing highlight pseudo styles; untouched.
- Tests: `pnpm exec playwright test --config tests/e2e/redundant-ui.playwright.config.ts` runs scoped e2e; add/extend a case if a find spec exists there (check `tests/e2e/` for `find` — discovery).

## DESIGN

**Root cause (verified in fixture).** `.conversation-find-owner` is `flex:0 0 auto` with `justify-content:flex-end`, so it has no definite inline size; `.conversation-find`'s `width:min(100%,380px)` resolves `100%` against that fit-content width, collapsing toward min-content; inside, `input {flex:1;width:0;min-width:0}` then shrinks to its ~8px floor.

**Fix (one file, CSS only).** In `.conversation-find`:
1. `.conversation-find-owner` → add `flex:0 1 auto` (may shrink when header space is tight) — no other change.
2. `.conversation-find` → replace `width:min(100%,380px)` with `width:380px; max-width:100%` so the pill takes a definite 380px against a definite owner width, capped when the owner is narrower.
3. `.conversation-find input` → add `min-width:96px` (replaces `min-width:0`); keep `flex:1` and `width:0`.

Result: siblings (icon 28px + count ~64px + 3 icon buttons ~84px + padding/gaps ~24px ≈ 200px) leave ~180px for the input inside the 380px pill.

**If the count/highlight desync reproduces after the CSS fix** (type a phrase known to match loaded messages; count shows `0 results` while marks paint): inspect `conversationRanges` return vs `count` state in `ConversationFind.tsx`; the likely cause is a stale `query` value (uncontrolled-looking write path). Fix at the source in the component, not in CSS.

## EXECUTION_DAG

- **T01**: Confirm baseline (`git rev-parse main`), open `conversation-find.css`, apply the three rule edits above.
- **T02**: Build (`pnpm build:widgets` then `node node_modules/vite/bin/vite.js build`) and serve the review host on :4317; press Ctrl+F in a conversation; measure input `getBoundingClientRect().width` ≥ 160px; type a phrase and confirm visible text.
- **T03**: Type a phrase matching loaded transcript text → expect `N of M`, marks painted, ↑/↓ navigate and scroll; type a non-matching phrase → `0 results`, no marks. If the desync symptom reproduces, apply the component fix above and re-verify.
- **T04**: Close via ✕ and via Escape → all highlights cleared, focus back on trigger; repeat on a second area/thread.
- **T05**: Run `pnpm typecheck`, `pnpm lint`, and the scoped Playwright config; add/extend a find e2e case asserting `input.offsetWidth >= 96` when a find spec exists. Commit, push, PR with before/after screenshots.

## VALIDATION

- Commands: `pnpm typecheck`, `pnpm lint`, `pnpm exec playwright test --config tests/e2e/redundant-ui.playwright.config.ts`.
- Real-user: review host on :4317; Ctrl+F flow end-to-end per T02–T04; test at ~1280px viewport and a narrow split area.
- Acceptance matrix: the 5 acceptance bullets on the issue.

## STATE

Researched (symptom measured, root cause located in CSS) / implemented: nothing yet / verified: nothing yet. Next step: T01.

## REFERENCES

- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1612
- Fixture review host: `openReviewHost` in `scripts/review-host.ts` (port 4317).
