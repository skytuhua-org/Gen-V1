# Current complete handoff revision for #2107

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2107-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2107](https://github.com/skytuhua-org/Gen-V1/issues/2107). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `26975fd7d4d947985bdf165a298edd54732f927b7913a66c5052af7477b1bd6f`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

The current inFlight ref is an admission guard as well as an action discriminator. Preserve its synchronous protection while adding renderable busyAction state. Keep recovery blocking and disabled expressions; only action-specific copy and the chosen aria-busy/label change. The accepted design keeps Trash2, with no new spinner.

Verified relevant source: `apps/web/src/TaskMemory.tsx`, `apps/web/src/task-memory.css`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: No new product decision is taken by this metadata revision. Execute only the retained accepted scope and the source-corrected contracts below; discoveries outside it return to the issue owner.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | Owner: frontend implementer. Replace `busy` boolean render selection with `busyAction` state in `MemoryNote`. Done-when: all three busy strings render per action; disabled logic unchanged. | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Delayed create, saved-note save and delete show Adding…, Saving… and Deleting… respectively. A second activation while pending cannot start another command. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | Owner: frontend implementer (same commit). Add `aria-busy={busyAction === 'delete' \|\| undefined}` and `aria-label={busyAction === 'delete' ? `Deleting ${note.key}` : `Forget ${note.key}`}` on the Forget button. Done-when: DOM verified in fixture. | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Only deletion exposes aria-busy and Deleting <key> on Forget; nondeleting labels and the icon remain unchanged. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T03 owner. |
| T03 | Owner: frontend implementer. Vitest/Playwright per VALIDATION. Done-when: pass. | T02 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T03. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Each rejected command restores the idle copy and existing recovery/error state. Verify no layout shift, draft loss or stale state update after unmount. | AC-T03 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | Busy text is selected by `inFlight.current` (`'save' \| 'delete'`), not the boolean `busy`. | Retained unchanged: Busy text is selected by `inFlight.current` (`'save' \| 'delete'`), not the boolean `busy`. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R02 | Fresh form save shows "Adding…"; saved-note save shows "Saving…"; delete shows "Deleting…". | Retained unchanged: Fresh form save shows "Adding…"; saved-note save shows "Saving…"; delete shows "Deleting…". | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R03 | The `Forget` icon button also reflects delete-in-flight: its icon is replaced by the existing spinner treatment used by `icon-button` busy states elsewhere; if none exists, the button stays visually unchanged but gets `aria-busy="true"` and `aria-label` "Deleting <key>". Decision: apply `aria-busy="true"` and keep the Trash2 icon (no spinner exists in this panel), while the footer button carries the "Deleting…" text. | Retained unchanged: The `Forget` icon button also reflects delete-in-flight: its icon is replaced by the existing spinner treatment used by `icon-button` busy states elsewhere; if none exists, the button stays visually unchanged but gets `aria-busy="true"` and `aria-label` "Deleting <key>". Decision: apply `aria-busy="true"` and keep the Trash2 icon (no spinner exists in this panel), while the footer button carries the "Deleting…" text. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R04 | Disabled states unchanged: `disabled={blocked \|\| busy \|\| !content.trim() \|\| !key.trim()}`. | Retained unchanged: Disabled states unchanged: `disabled={blocked \|\| busy \|\| !content.trim() \|\| !key.trim()}`. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R05 | No layout shift: "Deleting…" and "Adding…" are ≤ 9 characters, same 12px button style (`.secondary`), no width reservation needed. | Retained unchanged: No layout shift: "Deleting…" and "Adding…" are ≤ 9 characters, same 12px button style (`.secondary`), no width reservation needed. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R06 | Reduced motion unaffected; no new animation. | Retained unchanged: Reduced motion unaffected; no new animation. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

No implementation PR or executed feature test is established in the current issue journal. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2107#issuecomment-7128865433). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `26975fd7d4d947985bdf165a298edd54732f927b7913a66c5052af7477b1bd6f`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2107)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2107#issuecomment-7128865433)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/TaskMemory.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/TaskMemory.tsx)
- [apps/web/src/task-memory.css](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/task-memory.css)

## Retained complete original plan

# Plan: Correct busy-label copy for delete and add actions in Thread memory

## META
- Feature: Per-action busy text in the Notes (Thread memory) surface
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-24
- Baseline: main @ 9ddd536cc84c0f327ddf6133d485f8ab8baf294b
- Status: plan only, not implemented
- Source: code inspection + fixture QA on http://127.0.0.1:4317

## OBJECTIVE
`MemoryNote` renders `{busy ? 'Saving…' : fresh ? 'Add note' : 'Save note'}` (TaskMemory.tsx line 68). `busy` is true for *both* in-flight `memory.save` and `memory.delete`, so while a note is being deleted the footer button still reads "Saving…", and while a fresh note is being created it reads "Saving…" instead of "Adding…". Copy must name the action in flight.

**Measurable success:** during `memory.save` the button reads "Saving…"; during `memory.delete` the visible footer busy state reads "Deleting…"; during `memory.save` on the fresh form it reads "Adding…".

## REQUIREMENTS
1. Busy text is selected by `inFlight.current` (`'save' | 'delete'`), not the boolean `busy`.
2. Fresh form save shows "Adding…"; saved-note save shows "Saving…"; delete shows "Deleting…".
3. The `Forget` icon button also reflects delete-in-flight: its icon is replaced by the existing spinner treatment used by `icon-button` busy states elsewhere; if none exists, the button stays visually unchanged but gets `aria-busy="true"` and `aria-label` "Deleting <key>". Decision: apply `aria-busy="true"` and keep the Trash2 icon (no spinner exists in this panel), while the footer button carries the "Deleting…" text.
4. Disabled states unchanged: `disabled={blocked || busy || !content.trim() || !key.trim()}`.
5. No layout shift: "Deleting…" and "Adding…" are ≤ 9 characters, same 12px button style (`.secondary`), no width reservation needed.
6. Reduced motion unaffected; no new animation.

## REPO_MAP
- `apps/web/src/TaskMemory.tsx` lines 41–68: `inFlight` ref already records `'save' | 'delete'`; `busy` state mirrors it. Footer JSX on line 68 chooses text by `busy` only.
- Button class `secondary`, icon button `icon-button` — existing styles reused verbatim.

## DESIGN
Add `const busyLabel = inFlight.current === 'delete' ? 'Deleting…' : fresh ? 'Adding…' : 'Saving…'` — but `inFlight` is a ref and does not trigger render; `busy` state does. Store the action in state instead: `const [busyAction, setBusyAction] = useState<null | 'save' | 'delete'>(null)` set alongside `setBusy(true)` in `act` (and cleared in `finally`). Button text: `{busy ? (busyAction === 'delete' ? 'Deleting…' : fresh ? 'Adding…' : 'Saving…') : fresh ? 'Add note' : 'Save note'}`.

## EXECUTION_DAG
- T01 — Owner: frontend implementer. Replace `busy` boolean render selection with `busyAction` state in `MemoryNote`. Done-when: all three busy strings render per action; disabled logic unchanged.
- T02 — Owner: frontend implementer (same commit). Add `aria-busy={busyAction === 'delete' || undefined}` and `aria-label={busyAction === 'delete' ? `Deleting ${note.key}` : `Forget ${note.key}`}` on the Forget button. Done-when: DOM verified in fixture.
- T03 — Owner: frontend implementer. Vitest/Playwright per VALIDATION. Done-when: pass.

## VALIDATION
- Fixture repro: `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; await openReviewHost('/tmp/genv1-x', 4317)"` → http://127.0.0.1:4317 → thread → workspace panel → Add surface → Notes.
- Playwright: intercept `memory.delete` with 300 ms delay, click `Forget`, assert footer shows "Deleting…" and Forget button has `aria-busy="true"`. Intercept `memory.save` on create form, assert "Adding…".
- Negative: on command failure the label returns to "Save note"/"Add note".

## STATE
Plan complete; no implementation started.

## REFERENCES
- Issue: this issue. Surface file: apps/web/src/TaskMemory.tsx.
