[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1883.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1883](https://github.com/skytuhua-org/Gen-V1/issues/1883). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Active-mode command filtering has two open implementations ([#1895](https://github.com/skytuhua-org/Gen-V1/pull/1895) preferred in journal, [#1892](https://github.com/skytuhua-org/Gen-V1/pull/1892) overlapping); [#1896](https://github.com/skytuhua-org/Gen-V1/pull/1896) is closed. Preserve unique changes until PR consolidation establishes equivalence; the issue is not complete.

### Reviewed implementation references

- [PR #1895](https://github.com/skytuhua-org/Gen-V1/pull/1895): open; head `41e47392321c3c5f8c7a4a5ca86a64c342db1a4c`; base `main`; not recorded as merged into the audit baseline.
- [PR #1892](https://github.com/skytuhua-org/Gen-V1/pull/1892): open; head `cefb71b52aa69f32a8bdc772c79324d012fbada6`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7121481621](https://github.com/skytuhua-org/Gen-V1/issues/1883#issuecomment-7121481621). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

Plan file: https://github.com/skytuhua-org/Gen-V1/blob/d8ed3cc4a22de3547c08388bca64171b55bf33fc/docs/agent-plans/1883-palette-active-mode.md

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

## Historical STATE
Researched and decided; not implemented; not verified. Next step: T01 then T02.

## REFERENCES
- Component: apps/web/src/ComposerCommands.tsx; call site: apps/web/src/App.tsx