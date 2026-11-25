[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1880.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1880](https://github.com/skytuhua-org/Gen-V1/issues/1880). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Composer combobox work remains open in [#1890](https://github.com/skytuhua-org/Gen-V1/pull/1890). Review raises textarea-combobox validity and plan-owner decision; current hint fix does not settle that design gate.

### Reviewed implementation references

- [PR #1890](https://github.com/skytuhua-org/Gen-V1/pull/1890): open; head `1cee63290541110b9677e7630cc34faffba8d21c`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7121576776](https://github.com/skytuhua-org/Gen-V1/issues/1880#issuecomment-7121576776). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

Plan file: https://github.com/skytuhua-org/Gen-V1/blob/d8ed3cc4a22de3547c08388bca64171b55bf33fc/docs/agent-plans/1880-palette-a11y.md

# Plan: Give the slash-command palette proper combobox semantics and document Tab

## META
- Feature: ARIA combobox wiring for the composer slash-command palette
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-23
- Baseline: main @ 1cbd02cd78e93771ddca6f0f490c31133919e44a
- Status: planning complete, implementation NOT started
- Source provenance: QA pass 22, fixture on http://127.0.0.1:4317 — when the palette opens, the composer textarea gets `aria-controls`, `aria-autocomplete="list"`, and `aria-activedescendant`, but never `role="combobox"` or `aria-expanded`, so screen readers are not told a popup exists or whether it is open. The footer hint also omits Tab, which selects the active option.

## OBJECTIVE
The textarea announces itself as a combobox whose popup opens and closes, and the on-screen hint lists every working key. Success: DOM shows `role="combobox"`, `aria-haspopup="listbox"`, and `aria-expanded` toggling true/false with the palette, and the hint reads `↑ ↓ Navigate · Enter/Tab Select · Esc Close`.

## REQUIREMENTS
- Scope: `apps/web/src/ComposerCommands.tsx` (the `useEffect` that sets/removes textarea attributes, plus the hint JSX). No styling changes.
- In the attribute-wiring effect (the one that currently sets `aria-controls`, `aria-autocomplete`, `aria-activedescendant` when `open`), set on the textarea: `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded="true"` while open. In the cleanup (and when `open` is false), set `aria-expanded="false"` and remove `role` and `aria-haspopup` — the textarea must not claim combobox semantics when no popup can appear.
- `aria-expanded` must be present in both states (APCG combobox pattern), not only when open.
- Keep `aria-autocomplete="list"`, `aria-controls`, `aria-activedescendant` exactly as now (set only while open).
- Hint footer text becomes exactly: `↑ ↓ Navigate · Enter/Tab Select · Esc Close` (middle segment `Enter/Tab Select`). It stays `aria-hidden="true"`.
- No token, motion, or layout changes.

## REPO_MAP
- `apps/web/src/ComposerCommands.tsx` — attribute effect (~line 95) and `.composer-command-hint` JSX (~line 122).
- `apps/web/src/composer-commands.css` — `.composer-command-hint`; the longer middle segment still fits (font-size 11px, `justify-content:space-between`); verify at 360 px viewport — drop to font-size 10px only via the existing `max-width:480px` media query, unchanged.

## DESIGN
Follows the ARIA Authoring Practices editable-combobox-with-listbox pattern: `role="combobox"` + `aria-expanded` + `aria-controls` + `aria-activedescendant` on the text input, `role="listbox"`/`role="option"` on the popup (already present).

## EXECUTION_DAG
- T01: Update the attribute effect and the hint text in `ComposerCommands.tsx`. Owner: one implementer. Done-when: `pnpm typecheck` passes; DOM assertions below hold.
- T02: Unit test: open the palette, assert `role="combobox"`, `aria-expanded="true"`, `aria-haspopup="listbox"` on the textarea; press Escape, assert `aria-expanded="false"` and the role/`aria-haspopup` are removed; assert hint contains `Enter/Tab Select`. Done-when: fails before, passes after.

## VALIDATION
- Fixture repro: `pnpm build` + review-host on :4317. Type `/`, inspect the textarea in devtools — `aria-expanded="true"`; press Escape — `aria-expanded="false"`.
- Screen-reader sanity (NVDA or VoiceOver when available): opening the palette announces the listbox; arrowing announces the active option via `aria-activedescendant`.
- Acceptance matrix: (a) open → expanded true; (b) close via Esc/blur/select → expanded false; (c) hint text exact match; (d) no attributes leak after close.

## Historical STATE
Researched and decided; not implemented; not verified. Next step: T01 then T02.

## REFERENCES
- Component: apps/web/src/ComposerCommands.tsx
- ARIA pattern: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/