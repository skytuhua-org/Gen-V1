[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1729.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1729](https://github.com/skytuhua-org/Gen-V1/issues/1729). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Font-input validation repair is retained in [#1784](https://github.com/skytuhua-org/Gen-V1/pull/1784); [#1797](https://github.com/skytuhua-org/Gen-V1/pull/1797) is a closed duplicate. Invalid/out-of-range feedback remains the accepted check.

### Reviewed implementation references

- [PR #1784](https://github.com/skytuhua-org/Gen-V1/pull/1784): open; head `60298f12419b926e62963bf66a29104a33644a67`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7091758907](https://github.com/skytuhua-org/Gen-V1/issues/1729#issuecomment-7091758907). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

# Plan: Font-size inputs show validation feedback instead of silently reverting

## META
- Feature: Inline validation for the three Appearance font-size number inputs
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev1, 2026-11-22
- Baseline: main @ bffae7ff
- Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1729 (rev1 body = this document)
- Plan-file PR: https://github.com/skytuhua-org/Gen-V1/pull/1727
- Status: planned, not implemented
- Source: QA pass 13 (fixture :4317): typing `99` into UI font size then blurring silently restores the previous value — no message, no red state, user cannot tell the entry was rejected.

## OBJECTIVE
Every out-of-range or non-integer entry in UI font size (13–16), Chat font size (14–20), and Code font size (12–18) gets immediate visible feedback: the field shows an invalid state and a hint naming the allowed range; the value is never silently reverted without explanation.

## REQUIREMENTS
- Scope: `apps/web/src/AppearanceSettings.tsx` `size()` number input (l.59) and the three `APPEARANCE_FIELDS` entries `uiFontSize`/`chatFontSize`/`codeFontSize` (bounds at l.70–72); `apps/web/src/settings.css`.
- Behavior:
  - Typing always reflects what the user typed (no onChange filtering of digits beyond `type="number"` native behavior).
  - On `blur` or Enter: if the parsed integer is within the field's min–max, commit to draft (existing behavior). If out of range, non-numeric, or empty: keep the typed text in the field, mark invalid, show hint. The field does NOT revert until the user fixes or presses Escape, which reverts to the last committed value.
  - Invalid state: input gets `aria-invalid="true"` + class `invalid`; border `1px solid var(--danger)`; box-shadow `0 0 0 1px var(--danger)`; text color unchanged.
  - Hint text directly under the input, 12px, `var(--danger)`, margin-top 4px: `Enter a whole number from 13 to 16.` / `14 to 20` / `12 to 18` per field — exact strings parameterized from the field's bounds.
  - The hint carries `role="alert"`; input gets `aria-describedby` pointing at it while invalid.
  - While any field is invalid, the Apply button stays enabled (other fields may still apply) but the invalid field's draft value keeps its last valid value — invalid text never enters the draft.
  - Invalid state clears the moment the input contains a valid value (validate on `input` event, not only blur).
- Keyboard: Escape in an invalid field reverts text to committed value and clears invalid state; focus stays in the field.
- Stepper buttons (native number input spinners) already clamp via min/max attributes — verify `min`/`max`/`step="1"` attributes are set on each input during T01.
- Reduced motion: no motion added; the border/shadow change is instant (no transition).
- Out of scope: the "Review iterations" number input (file separately if the same pattern applies — it uses the same `size()` helper only if listed in T01 findings; otherwise note as follow-up).

## REPO_MAP
- `apps/web/src/AppearanceSettings.tsx` — `size()` helper l.59 (silently ignores invalid; reverts on blur), field bounds l.70–72.
- `apps/web/src/settings.css` — `.settings-row-control input` l.26 (width 180px, padding 9px, font-size 14px); `.error-text` exists for the error strip — reuse its color token `var(--danger)` (verify token name in ui.css/theme tokens during T01).
- Tests: vitest + Playwright per repo convention (paths confirmed in T01).

## DESIGN
- `size()` gains per-field state `{text: string, invalid: boolean}` instead of the current silent-parse approach. Commit on valid input event; keep text on invalid.
- Hint element `<p className="settings-field-error" role="alert" id="appearance-{id}-error">` rendered under the input only while invalid. New CSS `.settings-row-control input.invalid { border-color: var(--danger); box-shadow: 0 0 0 1px var(--danger); } .settings-field-error { margin:4px 0 0; font-size:12px; line-height:1.4; color:var(--danger); }`.
- Copy: `Enter a whole number from {min} to {max}.` with actual bounds substituted.
- States: valid (default); invalid (red border + hint); reverting (Escape restores committed value, clears invalid).

## EXECUTION_DAG
- T01 — Verify `min`/`max`/`step` attributes on the three inputs; confirm `--danger` token name and whether Review iterations shares `size()`; record findings on the issue. Deps: none. Handoff: findings comment on issue #1729 for T02 owner. Done-when: facts posted.
- T02 — Rework `size()` to text+invalid state model; Escape revert; live validation on input event. Deps: T01. Owner: implementer A. Tests: vitest — out-of-range keeps text + sets invalid; valid commits; Escape reverts. Done-when: state model passes specs; handoff to T03.
- T03 — Render hint + `aria-invalid`/`aria-describedby`; CSS rules. Deps: T02. Owner: implementer A. Tests: Playwright — type 99 → blur → field keeps "99", shows exact hint text; type 14 → hint clears, Apply enabled. Done-when: all three fields verified end-to-end.
- T04 — Keyboard + a11y pass: Tab into invalid field announces hint (axe or Playwright a11y assertion); ensure no layout shift >2px when hint appears (hint reserves `min-height:18px` under the input to prevent jump). Deps: T03. Owner: implementer A. Done-when: a11y assertions pass.
- T05 — Update issue plan revision if needed; fixture-app verification. Deps: T04. Owner: implementer A. Done-when: issue #1729 body reflects shipped state; RELEASE posted.

## VALIDATION
- vitest for the state model; Playwright for visible behavior; axe check on hint wiring.
- Acceptance matrix: out-of-range keeps text + red border + exact hint (T03); valid clears instantly (T02); Escape reverts (T02); hint announced (T04); invalid never commits to draft (T02); spinner buttons clamp (T01/T03).
- Release gate: all rows verified; no silent revert remains.

## Historical STATE
- Researched: `size()` revert-on-blur confirmed live. Decided: keep-text + role=alert hint pattern. Pending: token name, Review-iterations input (T01). Next: T01.

## REFERENCES
- Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1729. Plan-file PR: https://github.com/skytuhua-org/Gen-V1/pull/1727. AppearanceSettings.tsx; QA pass 13 recording.


---
Plan file: https://github.com/skytuhua-org/Gen-V1/blob/55705782391c1497ace6f4433b9c54a78feabdb7/docs/agent-plans/font-size-input-feedback.md
