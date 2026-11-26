# Current implementation status for #1921

## META and STATE

Repository `skytuhua-org/Gen-V1`; revision `issue-1921-metadata-r2-2026-11-24`; reviewed baseline `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. This metadata supplement supersedes the earlier publication-time implementation status. The complete earlier plan is preserved verbatim below, SHA256 `13e1cedfcf9644675c9b4a0438c0e9d2d0337516e5e420343d871272247918d5`. Every original requirement, design choice, task, test, exclusion and acceptance check remains binding.

T01-T02 candidate implementation exists for toast Escape and focus retention.

Actual [PR #2064](https://github.com/skytuhua-org/Gen-V1/pull/2064) is open and unmerged at `b2d4d62a71400a1361f1955ad424dc083a4836a5`, branch `devin/a7f3ab-1921-toast-escape`. The [specific journal evidence](https://github.com/skytuhua-org/Gen-V1/issues/1921#issuecomment-7122478562) is preserved with its test and environment limits. The producer reports ten passing feedback-primitives cases and a clean TypeScript check at b2d4d62a. The manual review-host walkthrough was explicitly skipped. Preserve stack-only Escape, newest remaining focus, last-toast/body behavior, reduced-motion and unchanged timing/copy acceptance. Review the exact current candidate and required integration gates before closure.

## Acceptance and handoff

The current issue remains open. Producer-reported implementation and test results are distinct from independent review, required CI, merge and verification on main. This metadata worker ran no product, native or browser test. Existing implementation, review and native owners retain their scopes and releases.

The next authorized reviewer pins the latest PR head, reads the complete original plan and journal, reconciles each original task/acceptance row with the actual diff and evidence, and records any unresolved or unrun case without weakening its criterion. Use the existing PR for repair. The complete plan is mirrored through [documentation PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994); the append-only publication receipt supplies its immutable file URL and exact body readback. No application code or product requirement changes in this revision.

## Complete preserved original plan

# Plan: Toast keyboard dismissal and focus retention

## META
- Feature: Toast (notification stack) keyboard support
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-23 (design fully specified — implementer makes no design choices)
- Baseline: main @ fab1ec40
- Issue: (this issue — file lives at docs/agent-plans/a11y-toast-escape-focus.md)
- Status: planning complete, implementation NOT started
- Source: second-round deep QA pass on the built fixture host (see VALIDATION for the exact run command)

## OBJECTIVE
A toast that receives keyboard focus (Tab reaches `.ui-toast-close` in ~11 tabs) cannot be dismissed with Escape — Escape does nothing because the stack has no keydown handler. Separately, when the focused toast is dismissed (Enter on its close button, or programmatic dismissal), focus is dropped to `document.body`, so a keyboard user loses their place. Success: Escape inside the stack dismisses the focused toast, and removing a focused toast moves focus to a deterministic place instead of body.

## REQUIREMENTS
- Escape pressed while focus is inside `.ui-toaster` dismisses the toast that contains `document.activeElement` (the toast whose close or action button is focused). If focus is on the stack container itself rather than inside a toast item, dismiss the newest non-`leaving` entry.
- Escape must NOT dismiss toasts when focus is anywhere outside `.ui-toaster`. Do not add a global Escape listener — issue #1914 fixed Escape double-firing between transient cards and run stop; this change is scoped to the stack container only.
- When the toast containing focus is removed from the DOM (any cause: its own close button, Escape, auto-dismiss after focus leaves, or eviction), if at least one non-`leaving` toast remains, focus moves to that toast's `.ui-toast-close` button — specifically the newest remaining toast. If no toast remains, do nothing (browser default, focus on `body`).
- No visual, copy, timing, color, or role changes. `role="status"`/`role="alert"`, 6000ms visibility, hover/focus pause, dedupe, and `MAX_VISIBLE=3` all stay as they are.
- No new motion. Escape dismissal reuses the existing `dismissToast` → `data-state="closed"` → `ui-toast-out` path (160ms `var(--ui-ease-move)`), and the existing `prefers-reduced-motion`/`motion:off` instant-fade behavior.

## REPO_MAP
- `packages/ui-shell/Toast.tsx` — the entire component (67 lines): `toast()`, `dismissToast()`, `ToastItem`, `Toaster`. The stack `.ui-toaster` already wires `onFocus`/`onBlur` to a `focused` flag and `ToastItem` renders `.ui-toast-close`.
- `packages/ui-shell/feedback.css` — toast styles; no edits needed.
- `tests/feedback-primitives.test.ts` — existing vitest specs for the toast stack (extended by PRs #1802/#1804 for eviction); add the new specs here.
- `apps/web/src/App.tsx` (line ~1196) and `apps/web/src/WorkspaceHost.tsx` (line ~304) mount `<Toaster/>`; no edits needed.

## DESIGN
1. On the `.ui-toaster` container div, add `onKeyDown`: `if (event.key === 'Escape')` — find the toast element `event.target` is inside (`(event.target as HTMLElement).closest('.ui-toast')`), read its `data-toast-id`, and call `dismissToast(id)`. If the target is the container itself, dismiss the newest entry in `list` that is not `leaving`. Do not `preventDefault` or `stopPropagation`.
2. Give each `ToastItem`'s root `data-toast-id={entry.id}` so the container can map a focused element back to its entry.
3. Focus retention: in `Toaster`, extend the existing `useLayoutEffect` that already runs on every `list` change and resets `focused` when `activeElement` leaves the stack. In that same effect, when `root.ownerDocument.activeElement === root.ownerDocument.body` AND `root.dataset.prevHadFocus === 'true'` (i.e., focus was inside and the node vanished), focus the `.ui-toast-close` of the last non-`leaving` entry via `root.querySelectorAll('.ui-toast:not([data-state="closed"]) .ui-toast-close')` — pick the last match — with `focus({preventScroll:true})`. Track "focus was inside" by setting `root.dataset.prevHadFocus` in the existing `onFocus`/`onBlur` handlers (`'true'`/`'false'`).
4. Dismissal while a NEWER toast holds focus is unaffected: only a removed focused toast triggers step 3.

## EXECUTION_DAG
- T01 [owner: this implementer, deps: none]: `Toast.tsx` — add `data-toast-id` to `ToastItem` root; add `onKeyDown` Escape handler and `prevHadFocus` tracking to `Toaster`; extend the `useLayoutEffect` to refocus `.ui-toast-close` of the newest remaining toast. done-when: Escape with focus inside the stack closes the focused toast and focus lands on the next toast's close button (or body when none remain).
- T02 [owner: this implementer, deps: T01]: `tests/feedback-primitives.test.ts` — add specs: (a) Escape inside stack dismisses focused toast; (b) Escape removes newest toast when container holds focus; (c) removing the focused toast focuses the next toast's close button; (d) no spec for "global Escape" — assert no listener on `document`/`window`. done-when: `pnpm exec vitest run tests/feedback-primitives.test.ts` green.

## VALIDATION
Repro fixture (verified this session):
```
node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)" &
# requires pnpm build first so assets exist; then open http://127.0.0.1:4317/
```
Manual check: open a thread row's `⋯` menu → "Settle thread" fires a toast. Tab to its `×` (11 tabs from the composer), press Escape → toast exits via the standard close animation; repeat with two toasts → focus lands on the remaining toast's `×`. With no toast focused, Escape anywhere else in the app must not dismiss toasts.
Automated: vitest specs in T02. Acceptance matrix:

| Criterion | Check |
|---|---|
| Escape inside stack dismisses focused toast | T02 spec (a) + manual |
| No global Escape listener | T02 spec (d), code review |
| Focus lands on newest remaining toast's close | T02 spec (c) |
| Focus to body when last toast removed | manual |
| Reduced-motion close still instant | existing reduced-motion spec stays green |
| No visual/copy/timing changes | diff review |

## STATE
- Researched and verified live: Enter on `.ui-toast-close` dismisses and drops focus to `body`; Escape does nothing; dedupe, hover-pause, focus-pause, 6s auto-dismiss and reduced-motion fade all pass. 4th-toast eviction is handled by issues/PRs #1705/#1802/#1804 — out of scope here.
- Implemented: nothing. Verified: nothing. Next: T01.

## REFERENCES
- `packages/ui-shell/Toast.tsx`, `packages/ui-shell/feedback.css`, `tests/feedback-primitives.test.ts`
- Related: issue #1705 (toast eviction), PRs #1802/#1804; issue #1914 (Escape double-duty — this plan deliberately avoids a global Escape)
