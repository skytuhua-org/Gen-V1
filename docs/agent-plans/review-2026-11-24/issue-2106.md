# Current complete handoff revision for #2106

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2106-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2106](https://github.com/skytuhua-org/Gen-V1/issues/2106). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `d53b803cf57e69c5fcaadf8bbe54de439af782a5e5409a7386a12abc1137bea2`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

The list and Add button ref exist in TaskMemory; Forget refs and onDeleted are proposed additions. Focus handoff follows a successful delete receipt and the matching list update, never a failed command or a stale callback after thread switch/disposal. Keep the accepted next/previous/Add ordering without taking over draft-journal behavior.

Verified relevant source: `apps/web/src/TaskMemory.tsx`, `apps/web/src/task-memory.css`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: No new product decision is taken by this metadata revision. Execute only the retained accepted scope and the source-corrected contracts below; discoveries outside it return to the issue owner.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | Owner: frontend implementer. Add `onDeleted` optional prop to `MemoryNote`; call it after successful `memory.delete` in `act`. Done-when: prop invoked with the deleted key; delete failure path never calls it. | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Successful memory.delete invokes onDeleted for that note key exactly once; command rejection and cancellation do not invoke it or move focus. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | Owner: frontend implementer (same commit). In `TaskMemory`, add `forgetButtons` map, wire `ref` onto each note's `Forget` button (via a forwarded ref prop on `MemoryNote` or by lifting the button — choose lifting the ref through `MemoryNote` prop `forgetRef`), compute fallback order (next, previous, add button), apply focus in a `useEffect` keyed on `notes` length. Done-when: all three target orders verified. | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | After the removed note disappears, focus goes to next Forget, previous Forget or Add in that order. A changed thread, disposed form or concurrent list update cannot focus a stale node. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T03 owner. |
| T03 | Owner: frontend implementer. Vitest + Playwright test per VALIDATION. Done-when: tests pass locally. | T02 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T03. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Cover first/middle/last/only-note deletion and rejected deletion with mouse and keyboard, recording activeElement after the actual snapshot update. No visual or animation change is introduced. | AC-T03 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | Focus moves after a *successful* `memory.delete` only — never before confirmation, never on failure. | Retained unchanged: Focus moves after a *successful* `memory.delete` only — never before confirmation, never on failure. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R02 | Target order: next note's `Forget` button → previous note's `Forget` button → the header "Add memory note" button. | Retained unchanged: Target order: next note's `Forget` button → previous note's `Forget` button → the header "Add memory note" button. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R03 | Mouse, touch and keyboard paths behave identically (focus always moves). | Retained unchanged: Mouse, touch and keyboard paths behave identically (focus always moves). | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R04 | No visual change, no animation. | Retained unchanged: No visual change, no animation. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R05 | Reduced-motion media query is unaffected (no motion is introduced). | Retained unchanged: Reduced-motion media query is unaffected (no motion is introduced). | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

No implementation PR or executed feature test is established in the current issue journal. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2106#issuecomment-7128864834). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `d53b803cf57e69c5fcaadf8bbe54de439af782a5e5409a7386a12abc1137bea2`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2106)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2106#issuecomment-7128864834)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/TaskMemory.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/TaskMemory.tsx)
- [apps/web/src/task-memory.css](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/task-memory.css)

## Retained complete original plan

# Plan: Restore keyboard focus when a thread-memory note is deleted

## META
- Feature: Focus recovery after deleting a note in the Thread memory (Notes) surface
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-24
- Baseline: main @ 9ddd536cc84c0f327ddf6133d485f8ab8baf294b
- Status: plan only, not implemented
- Source: interactive QA of the built fixture on http://127.0.0.1:4317 (Workspace panel → Add surface → Notes)

## OBJECTIVE
Clicking or pressing Enter on `Forget <key>` removes the whole `<form class="memory-note">` containing the focused button. The browser drops focus to `document.body`, so keyboard and screen-reader users lose their position and must Tab from the page top to continue. Focus must land on a predictable control inside the Notes panel.

**Measurable success:** after a delete completes, `document.activeElement` is the "Add memory note" (+) button when no notes remain, else the `Forget` button of the next remaining note (or the previous note when the deleted note was last in the list).

## REQUIREMENTS
1. Focus moves after a *successful* `memory.delete` only — never before confirmation, never on failure.
2. Target order: next note's `Forget` button → previous note's `Forget` button → the header "Add memory note" button.
3. Mouse, touch and keyboard paths behave identically (focus always moves).
4. No visual change, no animation.
5. Reduced-motion media query is unaffected (no motion is introduced).

## REPO_MAP
- `apps/web/src/TaskMemory.tsx` — `MemoryNote.act(true)` runs `memory.delete`; the form unmounts on the next snapshot without focus handling. `TaskMemory` renders the list and owns the `addButton` ref (line 73).
- `apps/web/src/task-memory.css` — styles; no focus-specific rules needed.
- `apps/web/src/journal.ts` — draft journal; unaffected.
- Verified on fixture: deleting `date-format` note left `activeElement === body`.

## DESIGN
`TaskMemory` gains a ref map `forgetButtons = Map<string, HTMLButtonElement>` keyed by `note.key`, populated via `ref` on each `Forget` button. `MemoryNote` accepts a new optional prop `onDeleted(noteKey: string)`. `TaskMemory` passes a callback that, given the deleted key, computes the next focus target from the *pre-delete* ordered list of rendered `MemoryNote` keys, then calls `.focus()` inside `requestAnimationFrame` after the post-delete snapshot renders. Implementation detail: `TaskMemory` keeps `pendingFocus` state; an effect runs when `notes` changes and `pendingFocus` is set, focuses the resolved target and clears it.

Because `MemoryNote` unmounts on delete, `act()` calls `onDeleted(note.key)` immediately after a successful `memory.delete` receipt, before unmount.

## EXECUTION_DAG
- T01 — Owner: frontend implementer. Add `onDeleted` optional prop to `MemoryNote`; call it after successful `memory.delete` in `act`. Done-when: prop invoked with the deleted key; delete failure path never calls it.
- T02 — Owner: frontend implementer (same commit). In `TaskMemory`, add `forgetButtons` map, wire `ref` onto each note's `Forget` button (via a forwarded ref prop on `MemoryNote` or by lifting the button — choose lifting the ref through `MemoryNote` prop `forgetRef`), compute fallback order (next, previous, add button), apply focus in a `useEffect` keyed on `notes` length. Done-when: all three target orders verified.
- T03 — Owner: frontend implementer. Vitest + Playwright test per VALIDATION. Done-when: tests pass locally.

## VALIDATION
- Fixture repro: `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; await openReviewHost('/tmp/genv1-x', 4317)"` then open http://127.0.0.1:4317, open a thread, workspace panel → Add surface → Notes.
- Playwright: Tab to `Forget date-format`, press Enter, assert `document.activeElement` is `button[aria-label="Add memory note"]`. With two saved notes, deleting the first asserts focus on the second note's `Forget` button.
- Negative: failing delete (force `memory.delete` error) leaves focus on the `Forget` button.
- Acceptance matrix: next-note focus ✓, previous-note fallback ✓, add-button fallback ✓, failure no-op ✓.

## STATE
Plan complete; no implementation started.

## REFERENCES
- Issue: this issue. Surface file: apps/web/src/TaskMemory.tsx. Prior notes pass: #1836–#1840, #1562.
