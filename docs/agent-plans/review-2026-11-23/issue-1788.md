[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1788.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1788](https://github.com/skytuhua-org/Gen-V1/issues/1788). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Browser model-picker shortcut repair exists in open [#1818](https://github.com/skytuhua-org/Gen-V1/pull/1818). The desktop evidence uses a stub rather than the real desktop, so platform parity remains an explicit verification distinction.

### Reviewed implementation references

- [PR #1818](https://github.com/skytuhua-org/Gen-V1/pull/1818): open; head `992160466fd344dcd70c3735ecb00253ba7f20c0`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7113103414](https://github.com/skytuhua-org/Gen-V1/issues/1788#issuecomment-7113103414). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

# Plan: Hide dead "Ctrl N" shortcuts in the model picker on the browser build

## META
- Title: Model picker advertises Ctrl+1–9 selection shortcuts that cannot fire in the browser build
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev1, 2026-11-23
- Baseline: `main` @ `36fcc56d`
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1788 (canonical body holds this full plan)
- Related: #1598 proposes Ctrl+1–9 for thread switching — same binding space; this plan does not implement #1598.
- Status: not implemented; plan published for maintainer assignment

## OBJECTIVE
`ModelPicker` renders a `Ctrl N` kbd hint on the first nine visible models and a `Ctrl+1..9` keydown branch that calls `choose(model)`. In the browser build (fixture verified at http://127.0.0.1:4317) Ctrl+1..8 switch browser tabs and Ctrl+9 jumps to the last tab, so the handler never runs — the UI advertises a shortcut that cannot work and risks hijacking the binding space reserved for thread switching in #1598. Success: on the browser build no `Ctrl N` hints render and the handler is not installed; on the desktop build behavior is unchanged (the desktop shell can own the keys).

## REQUIREMENTS
- In scope: `apps/web/src/ModelPicker.tsx` only — the `Ctrl+N` branch in `navigate` (lines 97–100) and the kbd hint render on each option (line 115).
- Detection: use the existing `useDesktop()` hook from `apps/web/src/desktop-context` (returns the desktop context object in the Windows app, `null`/`undefined` in the browser build — the same gate `Settings.tsx` uses for browser-only copy). `const desktop = useDesktop()`.
- Browser build (no `desktop`): render no `<kbd>Ctrl N</kbd>` on any option row; do not attach the Ctrl+N branch (the ArrowUp/ArrowDown/Enter/Escape branches stay exactly as today).
- Desktop build (`desktop` set): render hints and keep the handler byte-for-byte as today. The fixture host is a browser build, so the fixture shows no hints — this is the expected post-change fixture state.
- No copy, styling, or layout changes beyond removing the hint element in the browser build: `.model-picker-option` spacing already handles the absent `<kbd>` (it is `flex:none` between the name and the check icon; removing it leaves name + optional check). No new CSS.
- Keyboard/a11y: `aria-activedescendant`, arrow navigation, Enter-select, and favorite-button `tabIndex` management are untouched. No shortcut hint replaces the removed one; the footer of this popover shows no shortcut legend today, so no legend copy is added.
- Motion: none (no animation involved); `prefers-reduced-motion` unaffected.
- Out of scope: rebinding to a working web shortcut (e.g., Alt+N) — deliberately not added because #1598 owns the thread-switching binding space and a second global digit chord would collide; other kbd hints elsewhere in the app; the `Esc` hint chip in the search row (it works in the browser and stays).

## REPO_MAP
- `apps/web/src/ModelPicker.tsx` — `navigate` handler lines 97–100 (Ctrl+N branch), kbd hint at line 115 `{shortcut>=0&&shortcut<9&&<kbd aria-hidden="true">Ctrl {shortcut+1}</kbd>}`, `shortcut=visible.indexOf(model)` computed line 113.
- `apps/web/src/desktop-context.ts` — `useDesktop` (verified consumer: `apps/web/src/Settings.tsx` line ~100, `apps/web/src/Artifact.tsx`).
- `apps/web/src/model-picker.css` line 48 `.model-picker-option kbd{flex:none;padding:1px 5px;border:1px solid var(--border);border-radius:4px;font-size:10px;color:var(--muted)}` — kept for desktop.
- Tests: vitest render specs under `tests/` plus Playwright e2e via the fixture host.

## DESIGN
1. `const desktop = useDesktop()` at the top of `ModelPicker` (component already lives inside the provider tree the other hooks use).
2. In `navigate`, wrap the Ctrl+N branch: `if(desktop&&(event.ctrlKey||event.metaKey)&&!event.altKey&&!isComposing(event)&&/^[1-9]$/.test(event.key)){…}` — identical body.
3. In the row render, gate the hint on `desktop`: `desktop&&shortcut>=0&&shortcut<9&&<kbd …>`.
No new props, no API change, no effect on `choose`, favorites, or the effort radiogroup.

## EXECUTION_DAG
- T01 — Gate hint and handler on `useDesktop()`. Owner: single implementer. Deps: none. Edits: `apps/web/src/ModelPicker.tsx` (import `useDesktop`, two-line change). Done-when: browser build shows no `Ctrl N` kbd on option rows and pressing Ctrl+1 with the picker open does not select a model (browser tab switches as before); desktop build unchanged. Handoff: reviewer verifies in fixture.
- T02 — Regression coverage. Owner: same implementer. Deps: T01. Edits: vitest spec asserting no `Ctrl` kbd text renders when `useDesktop()` returns null (mock the hook, matching how existing specs mock desktop context) and that hints still render when it returns an object. Done-when: `pnpm exec vitest run tests/model-picker*.test.ts` passes both cases. Handoff: none.

## VALIDATION
- Fixture: `pnpm build:widgets && ./node_modules/.bin/vite build`, then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` → http://127.0.0.1:4317, open the model picker.
- Acceptance matrix: (a) no `Ctrl N` chip on any row in the browser fixture; (b) Ctrl+1 while the picker is open does NOT select the first model (browser owns the key); (c) ArrowUp/Down + Enter still select; (d) Favorites rail, provider rail, reasoning panel unchanged; (e) desktop build renders hints and Ctrl+N selects (code-review evidence + vitest mock); (f) no visual/layout regression on a 10-row list.
- Planned checks: `npx tsc --noEmit`, `pnpm lint`, vitest spec (T02), existing model-picker Playwright spec still green.

## Historical STATE
- Researched: Ctrl+1 during live fixture QA switched Chrome tabs instead of choosing the first model; `navigate` branch confirmed dead in browsers.
- Decided: remove the affordance in the browser build rather than rebind (collision with #1598).
- Pending: implementation, review, merge.
- Risks: desktop regression — mitigated by the T02 desktop-mock spec.
- Next step: assign to an implementer per the issue's plan.

## REFERENCES
- Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1788
- Related binding-space issue: https://github.com/skytuhua-org/Gen-V1/issues/1598
- Component: apps/web/src/ModelPicker.tsx (lines 97–100, 115); hook: apps/web/src/desktop-context.ts
