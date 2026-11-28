# Plan: Notes validation errors render in the wrong place and lack field wiring

## META
- Feature: Thread memory (Notes) — field-level validation errors
- Repo: github.com/skytuhua-org/Gen-V1
- Plan revision: 1 (2026-11-22)
- Baseline: `main` @ current HEAD
- Issue: this issue's body is the canonical plan
- Status: plan only — no implementation authorized
- Provenance: deep QA pass on fixture app; an invalid "Note key" produced error text rendered under the content textarea, visually detached from the field it describes

## OBJECTIVE
Validation failures in the create-note form and in saved-note editing attach their message to the field that failed, and wire `aria-invalid`/`aria-describedby` so screen readers announce them on the field itself.

Success: a key error appears under the key input, a content error under the textarea, and each field announces its own error.

## REQUIREMENTS
- In scope: `apps/web/src/TaskMemory.tsx` error rendering for create form (key format error, generic save error) and saved-note form (save error); `apps/web/src/task-memory.css`.
- Out of scope: duplicate-key conflict UX (separate issue), journal recovery text.
- Copy changes only where a message currently misdescribes its location; existing copy text stays unless noted.

## REPO_MAP (verified)
- `apps/web/src/TaskMemory.tsx`: create form renders `createError`/`createConflict` as a single `<p>` between the content textarea label and the form footer — so key-format errors ("Choose a short note key using letters, digits, periods or dashes") appear under the textarea, far from the key input above it.
- Saved-note forms render their save error in a similar form-level `<p>`.
- `.memory-note label { display:grid; gap:6px }` — errors must slot into this grid.

## DESIGN
1. Split error state into per-field errors: `keyError` (format/duplicate-adjacent key problems) rendered directly under the key `<input>` inside its `<label>` grid; `contentError`/form-level error rendered under the textarea. A generic non-field save failure stays in the existing position above the footer.
2. Placement rules (DOM order inside each `<label>`):
   - Key input → `<p class="memory-field-error" id="memory-key-error">` immediately after the `<input>`.
   - Content textarea → `<p class="memory-field-error" id="memory-content-error">` immediately after the `<textarea>`.
3. `.memory-field-error { margin:0; font-size:11px; line-height:1.4; color:var(--danger); }` — one step smaller than the 12px label text, per `.memory-note small` precedent.
4. `aria-invalid="true"` on the offending input/textarea and `aria-describedby="<error-id>"` only while the error is visible; remove both attributes when it clears.
5. The error `<p>` does not need `role="alert"` when it is already referenced by `aria-describedby`; use `role="alert"` only for the form-level (footer) error which has no owning field.
6. When the key error is visible, move focus to the key input on submit failure (programmatic `.focus()`); same for content errors.
7. Identical placement rules in the saved-note editing form (content errors under its textarea).
8. Motion: none. `prefers-reduced-motion` unaffected.

## EXECUTION_DAG
- T01: Split error state + per-field rendering + aria wiring in create form of `TaskMemory.tsx`. Deps: none. Done-when: invalid key shows message under the key field.
- T02: Same wiring for saved-note form content errors. Deps: T01.
- T03: vitest: key error position/aria, content error position, focus target, clearing on input. Deps: T01–T02.
- T04: Playwright on fixture host. Deps: T03.

## VALIDATION
- Fixture repro: `pnpm build`, then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; await openReviewHost('/tmp/review-err', 4317)"` → Notes tab → + → type a key with a space (e.g. `bad key`) → Add note → today: the "Choose a short note key…" message shows under the textarea.
- Expected: message under the key input; `aria-invalid` + `aria-describedby` set; focus on key input.
- Acceptance: per-field placement, aria wiring, focus, clearing, unchanged footer-level error path.
- Tests: vitest + Playwright only.

## STATE
- Implemented: nothing. Verified: misplaced error reproduced.
- Next: T01.

## REFERENCES
- `apps/web/src/TaskMemory.tsx`, `apps/web/src/task-memory.css`; host `scripts/review-host.ts`.
