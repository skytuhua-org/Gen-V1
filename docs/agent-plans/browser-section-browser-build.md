# Plan: Give the Browser settings section real content in the browser build

## META
- Feature: Browser settings section — useful content in the web build instead of a dead-end note
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev1, 2026-11-22
- Baseline: main @ bffae7ff
- Status: planned, not implemented
- Source: QA pass 13 (fixture :4317): Settings → Browser renders only the sentence "Open the manual browser from the Windows desktop workspace. Navigation, reload and stop stay in its toolbar." — a whole nav section for a note with no control, and the search row "Start page" leads to it.

## OBJECTIVE
In the browser (non-desktop) build, the Browser section either contains a working setting or does not appear. Decision: hide the section in the browser build and drop its search row, matching how `desktop ? 'desktop' : 'browser'` already filters supported settings. Success: browser build shows 11 sections; searching "browser"/"start page" returns nothing that leads to a dead end.

## REQUIREMENTS
- Scope: `apps/web/src/Settings.tsx` — `SETTINGS_SECTIONS` list (l.36 `['browser', 'Browser']`), `SUPPORTED_SETTINGS` row `browser-start-page` (l.73), the `browser-start-page` render block (l.211).
- Behavior:
  - When `desktop` is false, exclude `browser` from `SETTINGS_SECTIONS` (nav button and the `settings-section-select` options) and exclude the `browser-start-page` row from search.
  - When `desktop` is true, behavior unchanged: Manual browser card with Start page form (Save start page, Open browser).
  - If the user lands on section `browser` via a stored/last-visited section or URL state in a browser build, fall back to `general` on mount (no blank content).
  - Section-count assertion: browser build renders exactly 11 nav buttons + 11 select options.
- No motion added. Reduced motion unaffected.
- Out of scope: changing the desktop Manual browser card; adding a real start-page preference to the browser build (no browser surface exists there).
- The sentence "Open the manual browser from the Windows desktop workspace…" moves nowhere — it stays in the desktop card only.

## REPO_MAP
- `apps/web/src/Settings.tsx` — `SETTINGS_SECTIONS` l.33–38 (12 entries); `row('browser-start-page', …)` l.73; `customRows` l.158; render block l.211; `desktop` flag already in scope (`searchSettings(query, SUPPORTED_SETTINGS, desktop ? 'desktop' : 'browser')` l.153).
- Tests: vitest (Settings section filtering exists? verify in T01); Playwright fixture spec.

## DESIGN
- `const sections = SETTINGS_SECTIONS.filter(([id]) => desktop || id !== 'browser')` used by both nav render and select options; `SUPPORTED_SETTINGS` entries gain a surface filter consistent with `searchSettings`'s existing mechanism — the row for `browser-start-page` is filtered with the same predicate before search and before `matches()` gating.
- Mount effect: `if (!desktop && section === 'browser') setSection('general')`.
- States: browser build — 11 sections, no browser rows in search; desktop build — unchanged.

## EXECUTION_DAG
- T01 — Confirm `desktop` flag source and the `searchSettings` surface filter behavior; record on issue.
- T02 — Filter nav + select + search rows in browser build; mount fallback to `general`. Tests: vitest — browser build yields 11 sections; `browser-start-page` absent from search results; stored `browser` section falls back to general.
- T03 — Playwright on fixture: Settings nav has no Browser button; search "browser" and "start page" return no dead-end results; desktop path untouched (assert in unit test only — no desktop fixture).
- T04 — Final fixture verification; revision bump if scope changed.

## VALIDATION
- vitest + Playwright.
- Acceptance matrix: Browser section absent in browser build (T02/T03); search rows absent (T02/T03); fallback to general (T02); desktop unchanged (T02); 11 nav buttons + 11 select options (T03).
- Release gate: all rows verified.

## STATE
- Researched: stub content confirmed live (l.211 else-branch). Decided: hide section + row in browser build. Pending: `desktop` flag mechanics (T01). Next: T01.

## REFERENCES
- This issue; Settings.tsx; QA pass 13.


---
Plan file: https://github.com/skytuhua-org/Gen-V1/blob/55705782391c1497ace6f4433b9c54a78feabdb7/docs/agent-plans/browser-section-browser-build.md
