# Plan: "Review after model iterations" input shows validation instead of silently committing wrong values

## META
- Feature: Inline validation for the Skills & Integrations "Review after model iterations" number input
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev1, 2026-11-23
- Baseline: main @ 65801227
- Canonical issue: this issue (rev1 body = this document)
- Plan-file PR: linked below after publication
- Status: planned, not implemented
- Source: QA pass 26 (fixture :4317): typing `999` into the field silently committed `9` — the field reverted mid-typing with no message while a "Saved" state appeared. Same defect class as #1729 (font-size inputs); #1729's plan explicitly defers this control because it does not use `size()` — it has its own onChange at `apps/web/src/SkillLibrary.tsx:59`.

## OBJECTIVE
Typing in the "Review after model iterations" field always shows exactly what was typed. Out-of-range or non-integer input is marked invalid with a visible hint naming the allowed range; the field never silently reverts, and only a valid value is ever saved.

## REQUIREMENTS
- Scope: `apps/web/src/SkillLibrary.tsx` l.59 input (`aria-label="Review after model iterations"`, `min={0} max={100}`); `apps/web/src/settings.css`.
- Behavior:
  - The input is controlled by local text state, not directly by `preferences.learningInterval`, so the user always sees what they typed.
  - On every `input` event: parse the text; if it is an integer in 0–100, commit via `update({ learningInterval: value })` and clear the invalid state; otherwise set the invalid state and keep the text.
  - An empty field is invalid (`Enter a whole number from 0 to 100.`) and commits nothing.
  - Escape restores the last committed value and clears the invalid state; focus stays in the field.
  - Blur keeps the typed text and the invalid state (no revert).
- Invalid visuals: `aria-invalid="true"`, `1px solid var(--danger)` border plus `box-shadow: 0 0 0 1px var(--danger)`; hint `<p className="settings-field-error" role="alert">Enter a whole number from 0 to 100.</p>` directly under the input, 12px, `var(--danger)`, margin-top 4px, reserved `min-height:18px` so no layout shift >2px when it appears; `aria-describedby` points at the hint only while invalid.
- States: valid (default); invalid (red border + hint + no commit); disabled keeps `disabled={locked}` behavior unchanged.
- Keyboard: Tab order unchanged; Escape revert above; Enter inside the field attempts no extra commit beyond the input validation.
- Reduced motion: no motion added; border/shadow change is instant.
- Out of scope: the three Appearance font-size inputs (issue #1729), any `size()` helper changes.

## REPO_MAP
- `apps/web/src/SkillLibrary.tsx` l.59: `<input type="number" ... value={preferences.learningInterval} onChange={event=>{const value=event.target.valueAsNumber;if(Number.isInteger(value)&&value>=0&&value<=100)void update({learningInterval:value});}}/>` — controlled by the saved preference, so every invalid keystroke is discarded and intermediate valid digits commit immediately.
- `apps/web/src/settings.css`: `.settings-row-control input` styling; `var(--danger)` token used by `.error-text`.
- Sibling pattern to mirror for tests: #1729's vitest + Playwright cases (paths confirmed in T01).

## DESIGN
- Add `const [iterationsText, setIterationsText] = useState(String(preferences.learningInterval));` and `const [iterationsInvalid, setIterationsInvalid] = useState(false);`; sync `iterationsText` from `preferences.learningInterval` when it changes externally while the field is not focused.
- `onChange`: set text; if `Number.isInteger(parsed) && parsed>=0 && parsed<=100` then `update({learningInterval:parsed})` + `setIterationsInvalid(false)`; else `setIterationsInvalid(true)`.
- `onKeyDown`: Escape → `setIterationsText(String(preferences.learningInterval)); setIterationsInvalid(false)`.
- Render hint only while `iterationsInvalid`: `<p id="learning-interval-error" className="settings-field-error" role="alert">Enter a whole number from 0 to 100.</p>`; input gets `aria-invalid={iterationsInvalid||undefined}` and `aria-describedby={iterationsInvalid?'learning-interval-error':undefined}`.
- CSS additions: `.settings-field-error { margin:4px 0 0; font-size:12px; line-height:1.5; color:var(--danger); }` and `.settings-row input[aria-invalid="true"], input.learning-interval-invalid { border-color:var(--danger); box-shadow:0 0 0 1px var(--danger); }`; wrap input+hint in a container with `min-height` reserved on the hint slot.
- Keep `min={0} max={100}` attributes for spinner clamping.

## EXECUTION_DAG
- T01 — Confirm `var(--danger)` token name and whether a shared `settings-field-error` style already exists elsewhere; record findings on the issue. Deps: none. Owner: implementer A. Done-when: facts posted.
- T02 — Implement the text+invalid state model, Escape revert, hint markup, aria wiring, CSS. Deps: T01. Owner: implementer A. vitest: out-of-range keeps text + sets invalid; valid commits; Escape reverts; empty invalid. Done-when: specs pass.
- T03 — Playwright: type `999` → field shows `999`, red border, exact hint, nothing saved; type `50` → hint clears, preference saved. Deps: T02. Owner: implementer A. Done-when: end-to-end pass on fixture.

## VALIDATION
- Reproduce: build fixture app (`pnpm build && pnpm build:widgets`), then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"`, open http://127.0.0.1:4317 → Settings → Skills & Integrations.
- vitest state-model specs; Playwright visible-behavior spec; axe assertion that the hint is announced.
- Acceptance matrix: typed text never hidden (T02); invalid never commits (T02); Escape reverts (T02); exact hint copy (T03); no layout shift >2px (T03).
- Release gate: all rows verified; no silent revert remains.

## STATE
- Researched: live silent-revert confirmed on fixture. Decided: keep-text + role=alert hint (same pattern as #1729). Pending: token/style reuse (T01). Next: T01.

## REFERENCES
- Issue #1729 (same defect class on font-size inputs; explicitly deferred this control). SkillLibrary.tsx:59. QA pass 26 fixture walkthrough.
