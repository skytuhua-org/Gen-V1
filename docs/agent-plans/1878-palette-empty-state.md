# Plan: Show the slash-command palette empty state even when skill sources are unavailable

## META
- Feature: Restore the "No commands or skills found" empty state in the composer slash-command palette
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-23
- Baseline: main @ 1cbd02cd78e93771ddca6f0f490c31133919e44a
- Status: planning complete, implementation NOT started
- Source provenance: QA pass 22, built fixture on http://127.0.0.1:4317 — typing `/xyz` in the composer opens the palette with an empty blank region where the results list should be; the `No commands or skills found` status is suppressed because all six skill sources report `unavailable` in the fixture.

## OBJECTIVE
When the query matches no built-in command and the catalog returns no skills, the palette shows the existing empty-state row instead of a blank gap. Success: `/xyz` (or any no-match query) renders `No commands or skills found` with the search icon, regardless of how many skill sources are unavailable.

## REQUIREMENTS
- Scope: `apps/web/src/ComposerCommands.tsx` render block only. No API, store, or styling changes.
- Current code: `{error ? <ErrorState …/> : !loading && !options.length && !unavailableSources.length && <div role="status" className="composer-command-status"><Search size={14}/>No commands or skills found</div>}`.
- Required change: drop the `&& !unavailableSources.length` clause so the condition is `!loading && !options.length`.
- Render order stays: options list → error-or-empty status → `composer-command-unavailable` source block → "Load more skills" button → hint footer. The empty state renders above the unavailable-sources block; both may be visible at once.
- The unavailable-sources block is unchanged and still explains why skills are missing — the empty state and the source list are complementary, not duplicated.
- The `Skill selection is unavailable for this runtime.` status keeps its current condition (`Boolean(page?.skills.length)`); unchanged by this plan.
- No new copy, no new tokens, no motion changes. Empty-state reuse of `composer-command-status` already gives `display:flex; align-items:center; gap:7px; padding:8px; font-size:12px`.

## REPO_MAP
- `apps/web/src/ComposerCommands.tsx` — the palette; the status row in question is in the JSX tail of the component (~line 118).
- `apps/web/src/composer-commands.css` — `.composer-command-status` styles; unchanged.
- `apps/web/src/composer-commands.ts` — `commandToken`, `replaceCommandToken`; unchanged.
- `packages/contracts/skill-catalog` — `SkillCatalogPage.sources[].availability`; unchanged.

## DESIGN
Single-condition change. `options.length === 0` means "nothing to show": no builtins match the query and the page returned no skills. `unavailableSources.length > 0` explains absence but never substitutes for the empty state, because an all-unavailable catalog is exactly when the user most needs to see that nothing matched.

## EXECUTION_DAG
- T01: In `ComposerCommands.tsx`, change the empty-state condition to `!loading && !options.length`. Owner: one implementer. Done-when: JSX diff is a one-token removal; `pnpm typecheck` passes.
- T02: Add a vitest case in the existing `ComposerCommands` test file (or create `tests/composer-commands-empty.test.tsx` colocated with the suite's conventions): mount with a stubbed `getSkillCatalog` returning `{skills: [], sources: [{id:'s1', label:'Bundled', availability:{status:'unavailable', reason:'denied'}}], nextCursor: null}`, type `/xyz`, assert `No commands or skills found` is rendered and the unavailable row `Bundled` / `No access` is also rendered. Done-when: test fails before T01, passes after.

## VALIDATION
- Fixture repro: `pnpm build`, then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"`, open http://127.0.0.1:4317, click the composer, type `/xyz`. Expect the empty-state row plus the six unavailable source rows.
- Unit: `pnpm exec vitest run tests/composer-commands-empty.test.tsx`.
- Regression: `/` with matches still lists options; the loading spinner still shows during the 150 ms debounce; error state still wins over the empty state.
- Acceptance matrix: (a) no-match + all sources unavailable → empty state visible; (b) no-match + zero sources → empty state visible; (c) match → no empty state; (d) error → ErrorState only.

## STATE
Researched and decided; not implemented; not verified. Next step: T01 then T02.

## REFERENCES
- Component: apps/web/src/ComposerCommands.tsx
- Prior QA pass issues (same file family): https://github.com/skytuhua-org/Gen-V1/issues/1849
