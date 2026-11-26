[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1837.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1837](https://github.com/skytuhua-org/Gen-V1/issues/1837). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Note-delete confirmation/undo work exists in open [#1844](https://github.com/skytuhua-org/Gen-V1/pull/1844). T03 browser verification remains pending and the PR is unmerged.

### Reviewed implementation references

- [PR #1844](https://github.com/skytuhua-org/Gen-V1/pull/1844): open; head `30b5a4dd448efbdf4969f98d2d96d4c8687ab71b`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7115995430](https://github.com/skytuhua-org/Gen-V1/issues/1837#issuecomment-7115995430). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

# Plan: Notes delete is one click with no confirm or undo

## META
- Feature: Thread memory (Notes) — delete confirmation
- Repo: github.com/skytuhua-org/Gen-V1
- Plan revision: 1 (2026-11-22)
- Baseline: `main` @ current HEAD
- Issue: this issue's body is the canonical plan
- Status: plan only — no implementation authorized
- Provenance: deep QA pass on the built fixture app (Notes tab); clicking the trash icon removed a note instantly with no recovery path

## OBJECTIVE
`memory.delete` is destructive and currently fires on a single click of a small icon button. A misclick permanently loses a note. Add a two-step inline confirmation so one accidental click cannot destroy data.

Success: deleting a note requires two deliberate clicks in the same spot, is fully keyboard operable, and auto-resets if abandoned.

## REQUIREMENTS
- In scope: `apps/web/src/TaskMemory.tsx` per-note footer delete button; `apps/web/src/task-memory.css`.
- Out of scope: backend `memory.delete` command, journal, saved-note conflict UI.
- UX: no modal dialog (modal for a 2-word confirm is heavy); confirm happens inline where the icon was.

## REPO_MAP (verified)
- `apps/web/src/TaskMemory.tsx`: saved-note form footer has `icon-button` with `aria-label="Forget ${note.key}"` calling `memory.delete` with `baseRevision` on click.
- `apps/web/src/task-memory.css`: `.memory-note footer>.icon-button { margin-right:auto; color:var(--danger); }`.

## DESIGN
1. Add per-note `confirmingDeleteKey` state (`null` | note key) in `TaskMemory`.
2. First click on the trash icon-button sets `confirmingDeleteKey = note.key` and replaces the icon button with a text button in the same footer slot: `Forget “${note.key}”?` styled `var(--danger)` text on `var(--surface)` background, 1px `var(--danger)` border, border-radius 8px, padding 4px 10px, font-size 12px, `aria-label="Confirm forget ${note.key}"`. Focus moves to this confirm button.
3. Second click on the confirm button calls the existing `memory.delete` path unchanged.
4. Auto-reset: `confirmingDeleteKey` clears on (a) any click elsewhere in the panel (use `onBlur` of the confirm button with a `relatedTarget` check inside the same footer, or a `useEffect` document click listener — pick the existing codebase pattern), (b) Escape key while the confirm button is focused (return focus to the restored trash icon), (c) 5 seconds elapsed (`setTimeout` cleared on confirm/unmount), (d) starting a different note's confirm.
5. While confirming, the rest of the footer (Save note button) is unchanged.
6. Keyboard/a11y: trash button keeps `aria-label="Forget ${note.key}"`; confirm button is next in tab order; Escape returns focus. Screen reader announces the confirm via `role="alert"` is NOT needed — the focused button label itself conveys it.
7. Motion: swap icon→confirm instantly (no animation); `prefers-reduced-motion` unaffected.
8. Copy: `Forget “${key}”?` — use the existing "Forget" vocabulary already in the aria-label.

## EXECUTION_DAG
- T01: Add `confirmingDeleteKey` state, conditional confirm button, Escape/blur/timeout reset in `TaskMemory.tsx`. Deps: none. Done-when: two clicks required; single stray click leaves the note.
- T02: vitest: first click arms, second deletes, blur/Escape/timeout reset, focus behavior. Deps: T01.
- T03: Playwright on fixture host: delete flow end-to-end incl. misclick recovery. Deps: T02.

## VALIDATION
- Fixture repro: `pnpm build`, then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; await openReviewHost('/tmp/review-del', 4317)"`, http://127.0.0.1:4317 → "Sign the service agreement" → Notes tab → create a note → click trash once → today: note gone instantly.
- Expected: armed confirm; second click deletes; click-away/Escape/5s reverts.
- Acceptance: (a) single click never deletes; (b) confirm deletes; (c) all three resets work; (d) focus handled; (e) existing notes list/counter unchanged.
- Tests: vitest + Playwright only.

## Historical STATE
- Implemented: nothing. Verified: instant-delete reproduced.
- Next: T01.

## REFERENCES
- `apps/web/src/TaskMemory.tsx`, `apps/web/src/task-memory.css`; host `scripts/review-host.ts`.
