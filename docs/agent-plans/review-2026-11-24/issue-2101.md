# Source-current complete handoff for #2101

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2101-metadata-r3-2026-11-24`. Baseline: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Inventory cutoff: 2026-11-24T12:06:11Z. Candidate: [PR #2116](https://github.com/skytuhua-org/Gen-V1/pull/2116), head `d6fbdd560561838dd6d366bbc6fa67bfc77e9d86`, open and unmerged. Coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803).

This complete revision preserves the entire r2 source below, including the verbatim original r1 body. The r2 source was published at `78253df0c9e3b60a321377e315935104a8608adb` but withheld from canonical-body mutation when this candidate arrived. This r3 STATE supersedes the older statements that no implementation PR exists. It does not weaken any retained requirement, decide the held queue/admission policy, or infer acceptance from an author's completion claim.

## OBJECTIVE

Deliver continuous keyboard split resizing with optimistic accumulated feedback and reliable final delivery. The full original objective and effective r2 source corrections remain the task contract.

## REQUIREMENTS

Preserve all original in-scope keys, steps, bounds, tooltip, accessibility, focus and cancellation behavior, as well as the pointer-user exclusion and the r2 delayed-operation acceptance cases. Resolve only the already identified final-send admission contract with #2102. Source findings below explain unmet criteria; they are not additional product scope.

## REPO_MAP

The candidate changes `apps/web/src/WorkspaceSplitLayout.tsx` and `tests/split-workspace-renderer.test.ts`. Its current delayed commit, gesture cancellation and `run()` boundaries were independently compared with the accepted plan. Both #2116 and #2118 touch the component and renderer tests; a single explicitly claimed integration must preserve their unique changes.

## DESIGN

The producer adds `keyPreview`, a 150 ms timer, accumulated ratio feedback, optimistic `aria-valuenow`, and two renderer cases. The exact-source review identifies remaining defects:

1. The delayed key commit closes over the render's `layout.revision`. Waiting and re-arming while another operation is pending retains that stale value. If another command commits meanwhile, the resize can still be rejected. #2118's lazy `send()` wrapper does not automatically fix the keyboard path, which calls `run/onCommand` directly.
2. Home/End commits immediately while `pending.current` can be true. The unchanged `run()` returns without executing; the resolved continuation then clears the preview. This drops the requested bound change.
3. Cancellation listens for window blur, but the divider has no element `onBlur`. Focus transfer within the window does not invoke that cancellation. Effect cleanup does not clear the keyboard timer on unmount, and pointer-resize start leaves that timer alive. Delayed keyboard and pointer preview/commit custody can overlap.

The effective implementation must satisfy the retained cancellation, final-delivery and unchanged-pointer requirements. Preserve the explicit #2102 admission decision hold; do not replace it with silent dropping or equate a queued promise resolving with execution of its command.

## EXECUTION_DAG

The complete T01-T03 inputs, outputs, dependencies, ownership, acceptance checks and handoff contract remain below. Current status against the named candidate is:

| Task | Current status | Remaining evidence |
| --- | --- | --- |
| T01 | PARTIAL candidate | Accumulation/preview exists. Verify fresh revision at actual delayed dispatch and pending Home/End delivery; preserve both axes, Shift, bounds, focus and feedback criteria. |
| T02 | BLOCKED for final acceptance | Resolve #2102 admission integration and repair divider blur, unmount/layout-removal cleanup, pending cancellation and keyboard-to-pointer transfer; prove rejection rollback. |
| T03 | PARTIAL producer evidence | The two added renderer cases cover one rapid-arrow batch and Escape before dispatch. The retained delayed-operation, cancellation, pointer-regression and full keyboard fixture cases remain unproven. |

The implementation producer released T01-T03 to review. This metadata worker holds no feature source claim. A current owner must refresh both journals and shared-file claims before integration.

## VALIDATION

The producer [reports](https://github.com/skytuhua-org/Gen-V1/issues/2101#issuecomment-7130806608) typecheck and 13/13 renderer tests at this candidate, including ten rapid ArrowRight presses producing one resize to 0.6 and Escape cancel before dispatch. The full split-App browser and gesture-cleanup suites were explicitly NOT_RUN by the producer. These counts are attributed evidence.

The [independent review](https://github.com/skytuhua-org/Gen-V1/issues/1803#issuecomment-7131148702) executed source/plan/journal comparisons and control-flow analysis, with no new product/browser/native test run. It found the source defects above, and the two new cases do not discharge them. All original and r2 validation instructions remain required, including in-flight Home/End, retained delayed revision, divider blur, cleanup, both axes, Shift, error rollback and pointer-path preservation. Record exact integration head, commands, fixtures and actual results before a reviewer changes these statuses.

## STATE

KEEP OPEN. #2116 is a unique implementation candidate, not complete acceptance. The producer's statement that all done-when conditions are met is not adopted because the independent source review identifies failures at the retained boundaries. Integration with #2118 remains necessary and must preserve the held admission decision.

Producer handoff: [checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2101#issuecomment-7130806608), [release](https://github.com/skytuhua-org/Gen-V1/issues/2101#issuecomment-7130806988). Independent review: [exact-source findings](https://github.com/skytuhua-org/Gen-V1/issues/1803#issuecomment-7131148702), [recipient correction](https://github.com/skytuhua-org/Gen-V1/issues/1803#issuecomment-7131162805). Review and ordinary CI/merge/main acceptance remain pending. No feature ownership, assignee or in-progress label is changed by publication.

Publish the complete identical r3 file through #1994 before replacing the canonical body. Expected original canonical body SHA256: `2cf21544119d90dfa957583dc5e97fe8debace80f88badeebf0e40fc5945534a`. If that body changes concurrently, reconcile it before mutation. The previously published r2 bytes remain immutable history.

## REFERENCES

- [Current candidate component](https://github.com/skytuhua-org/Gen-V1/blob/d6fbdd560561838dd6d366bbc6fa67bfc77e9d86/apps/web/src/WorkspaceSplitLayout.tsx)
- [Current renderer tests](https://github.com/skytuhua-org/Gen-V1/blob/d6fbdd560561838dd6d366bbc6fa67bfc77e9d86/tests/split-workspace-renderer.test.ts)
- [Queue/admission coordination #2102](https://github.com/skytuhua-org/Gen-V1/issues/2102)
- [Immutable r2 full source](https://github.com/skytuhua-org/Gen-V1/blob/78253df0c9e3b60a321377e315935104a8608adb/docs/agent-plans/review-2026-11-24/issue-2101.md)
- [Independent source and acceptance review](https://github.com/skytuhua-org/Gen-V1/issues/1803#issuecomment-7131148702)

## Retained complete r2 source and original r1 plan

The text below is preserved verbatim. Its pre-arrival no-implementation STATE is historical and superseded by r3 above; the effective source corrections, decision holds and all other requirements remain active.

# Current complete handoff revision for #2101

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2101-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2101](https://github.com/skytuhua-org/Gen-V1/issues/2101). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `2cf21544119d90dfa957583dc5e97fe8debace80f88badeebf0e40fc5945534a`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

The actual previewRatio state is {id:string, ratio:number}; the original setPreviewRatio({splitId,...}) pseudocode does not match it. At this baseline run() returns immediately while pending, so a 150ms debounce alone cannot guarantee delivery if a previous request lasts longer than 150ms. Preserve optimistic accumulated ratios and cancellation; coordinate the final-send admission with #2102 instead of declaring run() unchanged sufficient.

Verified relevant source: `apps/web/src/WorkspaceSplitLayout.tsx`, `apps/web/src/workspace-split.css`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: T01/T02 final-send integration is BLOCKED on a documented #2102 queue/admission contract. Preview accumulation and isolated cancellation tests can proceed without deciding that contract.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | add `keyPreview`/`keyTimer`, rework `keyResize` + divider `aria-valuenow`/`previewRatio` wiring (file: `WorkspaceSplitLayout.tsx`). Done-when: code compiles, behavior verified manually. | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Ten rapid ArrowRight presses accumulate ten 1% steps, Shift uses 5%, Home/End clamp, aria-valuenow and the tooltip match preview on both axes, and focus remains on the divider. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | Escape/blur cancel path + error revert (same file). | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Escape or blur cancels unsent preview; rejection returns to the committed ratio; a request held longer than 150ms cannot silently lose the final intended resize. Unmount clears timers and does not issue a late command. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T03 owner. |
| T03 | add a component/unit test for accumulated presses if a harness exists for this component, else document manual verification steps in `VALIDATION` as executed in fixture. | T02 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T03. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Add an executable delayed-command fixture covering accumulated keys and pending-request overlap, plus pointer-path regression and keyboard/manual feedback evidence. Do not replace this known asynchronous risk with compile-only proof. | AC-T03 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | In: arrow keys (1% step, Shift 5%), Home/End to bounds, live % tooltip during key resize, aria-valuenow updated optimistically, commits debounced so rapid presses accumulate. | Retained unchanged: In: arrow keys (1% step, Shift 5%), Home/End to bounds, live % tooltip during key resize, aria-valuenow updated optimistically, commits debounced so rapid presses accumulate. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R02 | Out: pointer drag, aria-valuemin/max bounds fix (covered by #1833), narrow-width adaptive layout. | Retained unchanged: Out: pointer drag, aria-valuemin/max bounds fix (covered by #1833), narrow-width adaptive layout. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R03 | a11y: focus stays on the divider throughout; divider keeps `role="separator"`, `aria-valuenow` reflects the in-flight preview ratio. | Retained unchanged: a11y: focus stays on the divider throughout; divider keeps `role="separator"`, `aria-valuenow` reflects the in-flight preview ratio. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R04 | No layout change for pointer users. | Retained unchanged: No layout change for pointer users. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

No implementation PR or executed feature test is established in the current issue journal. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2101#issuecomment-7126231455). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `2cf21544119d90dfa957583dc5e97fe8debace80f88badeebf0e40fc5945534a`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2101)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2101#issuecomment-7126231455)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/WorkspaceSplitLayout.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/WorkspaceSplitLayout.tsx)
- [apps/web/src/workspace-split.css](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/workspace-split.css)

## Retained complete original plan

# UX/A11y: Split-area keyboard resize stalls after one arrow press and gives no feedback

## META
- Repo: skytuhua-org/Gen-V1 · baseline `main@9ddd536` · plan rev 2026-11-24-r1 · status: filed from live QA of built fixture.
- Repro: `pnpm build` then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; await openReviewHost('/tmp/genv1-fixture', 4317)"`, open `http://127.0.0.1:4317`, scenario "Workspace & settings" → split a pane → Tab to the divider → hold/repeat ArrowRight.

## OBJECTIVE
Keyboard users can continuously resize a split. Today the divider moves ~1% once then appears stuck: each keypress recomputes from the last committed `node.ratio` (see below), and presses arriving while a command is pending are silently dropped by `run()`. There is also no visual feedback — the "% width" tooltip only shows during pointer drag.

## REQUIREMENTS
- In: arrow keys (1% step, Shift 5%), Home/End to bounds, live % tooltip during key resize, aria-valuenow updated optimistically, commits debounced so rapid presses accumulate.
- Out: pointer drag, aria-valuemin/max bounds fix (covered by #1833), narrow-width adaptive layout.
- a11y: focus stays on the divider throughout; divider keeps `role="separator"`, `aria-valuenow` reflects the in-flight preview ratio.
- No layout change for pointer users.

## REPO_MAP
- `apps/web/src/WorkspaceSplitLayout.tsx`
  - `keyResize` (~L136–138): `const ratio=Math.min(high,Math.max(low,node.ratio+direction*(event.shiftKey?.05:.01)))` then `void send('pane.resize',{splitId:node.id,ratio},false)` — reads `node.ratio` from the frozen `layout` prop of the last render, so every press computes the same target until the server reply re-renders.
  - `run()` (~L87): `if(pending.current)return;` — silently drops ops while one is in flight.
  - `send()` (~L101): `onCommand(type,{...payload,baseRevision:layout.revision})`.
  - `previewRatio` state (used by drag, ~L48) + `.split-divider span` tooltip (renders `{Math.round(ratio*100)}% width|height` only when `previewRatio` set, ~L225).
  - Divider element ~L166: `role="separator" tabIndex={0} aria-valuenow={Math.round(ratio*100)}`.
- `apps/web/src/workspace-split.css` `.split-divider` rules (~L10): tooltip span styling already exists — reuse it.
- Related issues: #1833 (aria bounds — separate), #1598 (Ctrl+Tab switching).

## DESIGN
Add a `keyResizeRef`/`keyPreview` mirroring the drag path:
1. `const keyPreview = useRef<{splitId:string; ratio:number}|null>` + `keyTimer` debounce (150 ms, reset on each press).
2. In `keyResize`: `base = keyPreview.current?.splitId===node.id ? keyPreview.current.ratio : node.ratio`; compute `ratio` from `base`, clamp `[low, high]`; set `keyPreview` and `setPreviewRatio({splitId:node.id,ratio})` so the existing `.split-node` `--split-ratio` preview + `%` tooltip render immediately; update `aria-valuenow` from the same value.
3. Home/End and non-arrow keys: compute target, `setPreviewRatio` then `send` immediately (no debounce).
4. Arrow keys: debounce 150 ms; on fire, `send('pane.resize',{splitId,ratio},false)` and clear `keyPreview`/`previewRatio` when the reply commits (or on error, revert preview to committed `node.ratio`).
5. Escape or blur on the divider cancels `keyPreview` and clears `previewRatio` without sending.
6. `run()` unchanged; because sends are debounced, presses during a pending op update the preview instead of being dropped.
7. No animation on preview change; unchanged under `prefers-reduced-motion`.

## EXECUTION_DAG
- T01: add `keyPreview`/`keyTimer`, rework `keyResize` + divider `aria-valuenow`/`previewRatio` wiring (file: `WorkspaceSplitLayout.tsx`). Done-when: code compiles, behavior verified manually.
- T02: Escape/blur cancel path + error revert (same file).
- T03: add a component/unit test for accumulated presses if a harness exists for this component, else document manual verification steps in `VALIDATION` as executed in fixture.

## VALIDATION
Manual, built fixture: split → focus divider → 10 rapid ArrowRight presses → divider reaches ~60% and tooltip shows live %; Home → min bound; End → max bound; Shift+Arrow 5% steps; focus never leaves divider; Escape mid-press reverts preview; no error banners. Plus keyboard-only full pass on both axes.

## STATE
Filed by `devin-cloud-33f02a` (QA pass 33); no code written. Verified symptom: repeated ArrowRight = one ~1% step then no movement; no tooltip during key resize.

## REFERENCES
- Related: #1833, #1598. Fixture repro above (scenario "Workspace & settings" thread).
