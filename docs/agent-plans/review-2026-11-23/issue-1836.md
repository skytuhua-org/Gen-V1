[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1836.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1836](https://github.com/skytuhua-org/Gen-V1/issues/1836). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Duplicate-note-key recovery exists in open [#1842](https://github.com/skytuhua-org/Gen-V1/pull/1842). T04 browser verification remains pending; planning-only status is stale.

### Reviewed implementation references

- [PR #1842](https://github.com/skytuhua-org/Gen-V1/pull/1842): open; head `d4e13bd5557654a761641c93d1d05652d2b30744`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7110203393](https://github.com/skytuhua-org/Gen-V1/issues/1836#issuecomment-7110203393). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

# Plan: Notes create form duplicate-key conflict is a dead end

## META
- Feature: Thread memory (Notes) — duplicate key conflict recovery
- Repo: github.com/skytuhua-org/Gen-V1
- Plan revision: 1 (2026-11-22)
- Baseline: `main` @ current HEAD
- Issue: this issue's body is the canonical plan
- Status: plan only — no implementation authorized by this document
- Provenance: deep QA pass on the built fixture app (workspace panel → Notes tab)

## OBJECTIVE
When a user types a key that already exists into the "Note key" field of the create-note form and clicks "Add note", the form currently shows "This note changed. Inspect it before saving again." and re-enables "Add note", which fails identically on every retry. There is no way forward except canceling. The user should be told the key is already taken and offered a direct path to the existing note.

Success: a user who enters an existing key sees a clear message naming the problem and one action that resolves it, without retyping.

## REQUIREMENTS
- In scope: `apps/web/src/TaskMemory.tsx` create-note form conflict handling and error copy; its CSS hooks in `apps/web/src/task-memory.css`.
- Out of scope: saved-note conflict disclosure ("A newer saved note is available"), backend `memory.save` semantics, journal recovery.
- UX: error copy must name the actual problem (the key exists) and offer a recovery action (load the existing note for editing). Retry of the same rejected save must not be the only option.

## REPO_MAP (verified)
- `apps/web/src/TaskMemory.tsx`: create form `keyInput`/`contentInput`, `createError` state, `createConflict` path via `memory.save` command returning conflict; error `<p>` rendered above the form footer.
- `apps/web/src/task-memory.css`: `.memory-note`, `.memory-recovery` styles; error text inherits `.memory-note p`-like styling at 12px.
- Server: `memory.save` compares `baseRevision`; saving to an existing key with `baseRevision: 0` returns a conflict.

## DESIGN
1. In `TaskMemory`, distinguish a create-form conflict whose cause is "key already exists" from a generic revision conflict. The server response already carries the existing note; when the create save conflicts and a note with that exact key exists in `notes`, set a dedicated `createKeyTaken` state instead of the generic `createError`.
2. Render, in place of the generic error paragraph, a field-level message under the "Note key" input:
   - Copy: `A note named “${key}” already exists.`
   - Below it, a button (`.memory-note footer` secondary button styling) labeled `Edit existing note`.
3. `Edit existing note` click: clears the create form (`cancelCreate()` semantics), scrolls/focuses the matching saved note's textarea (`noteRefs`/focus the `contentInput` of that note form), so the user lands where the real content lives.
4. While `createKeyTaken` is set, "Add note" stays enabled (re-submitting after editing the key is valid); the message clears as soon as the key input changes to a value not in `notes`.
5. Generic conflicts that are not key-collisions keep the existing copy and behavior.
6. Styling: message color `var(--danger)`, font-size 12px, line-height 1.5, margin-top 6px under the key field; the "Edit existing note" button reuses the existing footer button style (padding 6px 12px, border-radius 8px, `var(--control-border)` border, `var(--surface)` background).
7. Keyboard/a11y: message gets `role="alert"`; key input gets `aria-invalid="true"` and `aria-describedby` pointing at the message id while it is shown. "Edit existing note" is a normal focusable button after the message in DOM order.
8. Motion: none added; if the codebase has a standard inline-error fade, reuse it, otherwise render statically. `prefers-reduced-motion` requires no special handling (no new animation).

## EXECUTION_DAG
- T01: Add `createKeyTaken` state + detection in `TaskMemory.tsx`; render new message + button; wire "Edit existing note" to cancel the create form and focus the existing note's textarea. Deps: none. Done-when: fixture repro shows the new message and button works.
- T02: Clear `createKeyTaken` on key change; add `role="alert"`, `aria-invalid`, `aria-describedby`. Deps: T01. Done-when: axe/screen-reader order verified.
- T03: Unit tests (vitest) for TaskMemory: duplicate key → new copy + button; button click focuses existing note; key change clears. Deps: T01–T02.
- T04: Playwright check on the fixture host for the full flow. Deps: T03.

## VALIDATION
- Fixture repro (current broken behavior): `pnpm build`, then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; await openReviewHost('/tmp/review-dup', 4317)"`, open http://127.0.0.1:4317, thread "Sign the service agreement" → Notes tab → + → key `date-format` (after saving one note with that key) → "Add note" → today: generic conflict text, retry fails forever.
- Expected after fix: key-specific message + working "Edit existing note".
- Acceptance matrix: (a) duplicate key → new copy; (b) button focuses existing note; (c) key edit clears message; (d) generic conflicts unchanged; (e) aria-invalid/describedby present while shown.
- Tests: vitest for T03; Playwright for T04. No other frameworks.

## Historical STATE
- Researched/decided: all of the above. Implemented: nothing. Verified: broken behavior reproduced on fixture host.
- Next step: implement T01.

## REFERENCES
- Component: `apps/web/src/TaskMemory.tsx`; styles: `apps/web/src/task-memory.css`.
- Fixture host: `scripts/review-host.ts` (`openReviewHost`).
