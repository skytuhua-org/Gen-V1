# Plan: Notes "Save note" writes even when unchanged and gives no saved feedback

## META
- Feature: Thread memory (Notes) — save affordance + feedback
- Repo: github.com/skytuhua-org/Gen-V1
- Plan revision: 1 (2026-11-22)
- Baseline: `main` @ current HEAD
- Issue: this issue's body is the canonical plan
- Status: plan only — no implementation authorized
- Provenance: deep QA pass on fixture app; "Save note" is clickable on an untouched note and a successful save produces no visible confirmation — the user cannot tell anything happened

## OBJECTIVE
"Save note" is enabled only when the content differs from the saved revision, and a successful save shows a short-lived, announced "Saved" confirmation.

Success: no no-op writes; every successful save is acknowledged without stealing focus or moving layout.

## REQUIREMENTS
- In scope: `apps/web/src/TaskMemory.tsx` saved-note footer; `apps/web/src/task-memory.css`.
- Out of scope: create-form "Add note" (already disabled until both fields non-empty), conflict disclosure, delete flow.

## REPO_MAP (verified)
- `apps/web/src/TaskMemory.tsx`: saved-note textarea edits update local content state; "Save note" calls `memory.save` with `baseRevision`; save success clears nothing visible and leaves the form identical; button currently never disabled by dirtiness (only by busy state if any).
- `.memory-note footer` layout: delete icon left, Save right.

## DESIGN
1. Track `dirty` per note form: `content !== note.content` (the last-known saved content). Disable "Save note" while `!dirty` or a save is in flight; disabled button keeps the same footprint (footer height unchanged).
2. On successful save: replace the button label with `Saved` plus a check icon for 1.6s, then revert to `Save note`. Style the `Saved` state as text `var(--muted)` (not a success-green the app doesn't have; check for an existing `--success`/`--ok` token first and use it if present — if none, `var(--muted)` with the check icon).
3. Announce the save: add `aria-live="polite"` region (`role="status"`) inside the note form footer that receives the text `Note “${key}” saved` on success; clear it on next edit.
4. On save failure: keep existing error path; "Saved" state must not appear.
5. While `Saved` shows, the button is disabled (prevents double-submit); after 1.6s it returns to enabled-if-dirty.
6. Motion: the label swap is instant; if a fade exists for inline state changes elsewhere in the codebase, reuse its duration/easing, otherwise no animation. `prefers-reduced-motion`: no animation either way.
7. Editing after a save immediately clears `Saved` back to `Save note` (enabled, since content now differs).

## EXECUTION_DAG
- T01: dirty tracking + disabled-when-clean on "Save note" in `TaskMemory.tsx`. Deps: none. Done-when: untouched note has disabled Save; typing enables it.
- T02: `Saved` transient state + `role="status"` live region + edit-clears behavior. Deps: T01.
- T03: vitest: disabled state transitions, success→Saved→revert timing, failure path, live-region text. Deps: T01–T02.
- T04: Playwright on fixture host. Deps: T03.

## VALIDATION
- Fixture repro: `pnpm build`, then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; await openReviewHost('/tmp/review-save', 4317)"` → Notes tab → click "Save note" on an unedited note → today: enabled and produces a silent write; after a real save nothing confirms.
- Expected: disabled until dirty; `Saved` shown + announced for 1.6s.
- Acceptance: disabled↔dirty in both directions, transient label + live region on success only, no layout shift, no double-submit.
- Tests: vitest + Playwright only.

## STATE
- Implemented: nothing. Verified: enabled no-op Save and silent success reproduced.
- Next: T01.

## REFERENCES
- `apps/web/src/TaskMemory.tsx`, `apps/web/src/task-memory.css`; host `scripts/review-host.ts`.
