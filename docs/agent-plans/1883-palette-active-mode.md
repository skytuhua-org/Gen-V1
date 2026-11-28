# Plan: Hide the already-active mode from the slash-command palette

## META
- Feature: Suppress the current mode's no-op command in the composer slash-command palette
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-23
- Baseline: main @ 1cbd02cd78e93771ddca6f0f490c31133919e44a
- Status: planning complete, implementation NOT started
- Source provenance: QA pass 22, fixture on http://127.0.0.1:4317 — while the composer is in Build mode, `/` still lists `/default  Switch to Build`; selecting it is a no-op. Same for `/plan` while in Plan mode. Other surfaces (the mode toggle button) already hide the active direction.

## OBJECTIVE
The palette only offers commands that would do something. Success: in Build mode the builtins list is `/model`, `/plan`; in Plan mode it is `/model`, `/default`. `/model` is always offered.

## REQUIREMENTS
- Scope: `apps/web/src/ComposerCommands.tsx` props + builtin filter, and the `ComposerCommands` call site in `apps/web/src/App.tsx` (~line 428).
- Add prop `mode: 'plan' | 'build'` to `Props`; pass `mode={thread?.mode ?? draftMode}` at the App call site — identical to the expression the mode toggle already uses.
- Builtin filtering: the option list currently includes `builtins.filter(item => item.id.includes(query.toLowerCase()))` when the query does not start with `skill:`. Change to also exclude the active mode: `/plan` maps to `mode === 'plan'`, `/default` maps to `mode === 'build'`. Concretely: `builtins.filter(item => item.id.includes(query.toLowerCase()) && (item.id === 'model' || (item.id === 'plan') !== (mode === 'plan')))` — simpler readable equivalent is fine: exclude `plan` when `mode==='plan'`, exclude `default` when `mode==='build'`.
- A user who typed `/plan` while in Plan mode gets the existing empty state (or skills) — no special-cased copy.
- Selected-mode suppression applies only to the option list; if a stale draft still contains `/plan` text, behavior is unchanged (the token is plain text until selected).
- No visual, motion, or copy changes beyond the removed row.

## REPO_MAP
- `apps/web/src/ComposerCommands.tsx` — `Props`, `builtins`, `options` construction.
- `apps/web/src/App.tsx` line ~428 — call site; `thread?.mode ?? draftMode` already computed inline for the toggle at line ~447.

## DESIGN
Mode-conditional filtering matches the mode toggle's own logic (it shows only the opposite direction). `/default` is named for "switch to the default mode", i.e. Build.

## EXECUTION_DAG
- T01: Add the `mode` prop, wire it in `App.tsx`, and filter the active mode out of `options` in `ComposerCommands.tsx`. Owner: one implementer. Done-when: `pnpm typecheck` passes.
- T02: Unit test: render with `mode="build"` — `/default` absent for query `` and `def`; render with `mode="plan"` — `/plan` absent; `/model` present in both. Done-when: fails before, passes after.

## VALIDATION
- Fixture repro: `pnpm build` + review-host on :4317. With Build active, `/` lists `/model` and `/plan` only. Toggle to Plan, `/` lists `/model` and `/default` only.
- Acceptance matrix: (a) Build → no `/default`; (b) Plan → no `/plan`; (c) `/model` always listed; (d) query filtering still applies after the mode filter.

## STATE
Researched and decided; not implemented; not verified. Next step: T01 then T02.

## REFERENCES
- Component: apps/web/src/ComposerCommands.tsx; call site: apps/web/src/App.tsx
