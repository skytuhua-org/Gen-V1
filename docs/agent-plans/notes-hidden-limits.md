# Plan: Notes hides its length limits and the 12-note cap

## META
- Feature: Thread memory (Notes) — visible limits
- Repo: github.com/skytuhua-org/Gen-V1
- Plan revision: 1 (2026-11-22)
- Baseline: `main` @ current HEAD
- Issue: this issue's body is the canonical plan
- Status: plan only — no implementation authorized
- Provenance: deep QA pass on fixture app; `maxlength` silently truncates at 64 (key) / 768 (content), the `n/12` counter only appears at ≥10 notes, and at 12 the + button goes disabled with no explanation

## OBJECTIVE
Users should see limits before hitting them: live character counters on the fields and a persistent, explanatory note count with a reason when adding is blocked.

Success: no silent truncation and no unexplained disabled control.

## REQUIREMENTS
- In scope: `apps/web/src/TaskMemory.tsx` create form + saved-note form + header counter; `apps/web/src/task-memory.css`.
- Out of scope: backend limits themselves (64/768/12 stay as-is).

## REPO_MAP (verified)
- `apps/web/src/TaskMemory.tsx`: `keyInput` has `maxLength={64}`, content textarea `maxLength={768}`; header shows `{notes.length}/12` only when `notes.length >= 10`; `+` icon-button disabled when `notes.length >= 12` or no `threadId`; hard cap drops extra notes server-side.
- `.task-memory>header>span` already styles the counter (12px, `var(--muted)`).

## DESIGN
1. Field counters (create form and saved-note form):
   - Key input: `<span>` positioned at the right end of the key `<label>` row showing `${key.length}/64` at all times the form is open. Style: font-size 11px, `var(--muted)`, `font-variant-numeric: tabular-nums`; turns `var(--danger)` at exactly 64.
   - Content textarea: same pattern `${content.length}/768`, `var(--danger)` at 768.
   - Implementation: place the counter inside the `<label>` grid row (after the field) or absolutely position bottom-right of the field wrapper with 6px inset — match whichever the codebase uses for inline hints; if neither pattern exists, append a right-aligned `<span>` inside the label grid so it does not overlap the resizable textarea.
   - Screen readers: give the counter `aria-hidden="true"` and instead set `aria-describedby` on the field to a visually-hidden hint `Maximum 64 characters` / `Maximum 768 characters`.
2. Header counter: change visibility from `>= 10` to always rendered once `threadId` exists — `0/12`, `3/12`, `12/12` (`.task-memory>header>span`, unchanged styling).
3. Cap explanation: when `notes.length >= 12`, render under the header (first row of `.task-memory`) a 12px `var(--muted)` line: `12 notes saved — remove a note to add another.` When `+` is disabled because there is no `threadId`, keep existing disabled state with `title="Choose a conversation first"` on the button so hover/focus explains it (add `aria-describedby` to a visually-hidden span with the same text, since `title` is not reliably announced).
4. Motion: none. `prefers-reduced-motion` unaffected.
5. No change to `maxlength` enforcement; counters reflect the same limits the inputs enforce.

## EXECUTION_DAG
- T01: Field counters + sr-only hints in create and saved forms. Deps: none. Done-when: counters tick live and turn danger at the cap.
- T02: Always-visible header counter + cap explanation + disabled-`+` title/describedby. Deps: none (independent of T01).
- T03: vitest for counters, cap text, describedby wiring. Deps: T01–T02.
- T04: Playwright on fixture host. Deps: T03.

## VALIDATION
- Fixture repro: `pnpm build`, then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; await openReviewHost('/tmp/review-limits', 4317)"` → Notes tab → + → type past 64 in key / 768 in content → today: silent cut-off, no counter; with 12 notes the `+` is disabled with no reason.
- Expected: live `n/64` and `n/768` counters, persistent `n/12`, cap message at 12, explained disabled `+`.
- Acceptance: counters accurate at boundaries (63/64, 767/768), danger color only at the cap, cap line only at 12, counter visible with threadId.
- Tests: vitest + Playwright only.

## STATE
- Implemented: nothing. Verified: silent truncation and unexplained disabled control reproduced.
- Next: T01 (T02 parallelizable).

## REFERENCES
- `apps/web/src/TaskMemory.tsx`, `apps/web/src/task-memory.css`; host `scripts/review-host.ts`.
