# Current complete handoff revision for #2085

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2085-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2085](https://github.com/skytuhua-org/Gen-V1/issues/2085). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `fce32d43a8041a7da58cc859277ed7b8a4a1819b52508638501ab93480d8a024`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

Verified CSS uses a 60ms model-picker-fade-out under prefers-reduced-motion, not a removed/0ms animation. Its animation fill mode is both, so after that fade the still-mounted element should be invisible. Preserve the accepted unconditional 140ms unmount and cleanup unless a later owner decision changes it. At 60fps, 140ms is approximately eight to nine frames, not fourteen. The old immediate-no-animation assertion is replaced by a 60ms reduced fade followed by no visible or interactive ghost.

Verified relevant source: `apps/web/src/ModelPicker.tsx`, `apps/web/src/model-picker.css`, `packages/ui-shell/tokens.css`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: No new product decision is taken by this metadata revision. Execute only the retained accepted scope and the source-corrected contracts below; discoveries outside it return to the issue owner.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | Change unmount delay 110 → 140 with named constant and comment; verify popover completes `model-picker-out` before unmount. | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Normal motion remains mounted through the 140ms exit token and then unmounts. Reduced motion uses the existing 60ms opacity fade, is visually gone afterward, and does not intercept pointer or keyboard interaction while awaiting removal. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | Regression: rapid open/close cycles (open, Escape within 100ms, reopen) leave no stuck hidden popover. | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Open, Escape before 100ms, then reopen before 140ms: the old timer is cancelled and the new popover remains visible. Repeat cycles and disposal leave no stuck content or leaked timer. A timing recording remains pending; producer unit checks are reported evidence only. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | In `apps/web/src/ModelPicker.tsx` the unmount effect currently schedules `setPresent(false)` after 110ms. Change the timeout to `140` so it matches `--ui-motion-popup-exit` (140ms), and define the value once via the token (`getComputedStyle` is unnecessary — use a named constant `POPUP_EXIT_MS = 140` colocated with the animation name). | Retained unchanged: In `apps/web/src/ModelPicker.tsx` the unmount effect currently schedules `setPresent(false)` after 110ms. Change the timeout to `140` so it matches `--ui-motion-popup-exit` (140ms), and define the value once via the token (`getComputedStyle` is unnecessary — use a named constant `POPUP_EXIT_MS = 140` colocated with the animation name). | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R02 | Behavior otherwise unchanged: popover content remains pointer-none during exit (existing rule), Escape/Tab/Enter still trigger the same close path, re-open during the 140ms window cancels the pending unmount (existing timer cleanup already clears it on re-show — keep that cleanup). | Retained unchanged: Behavior otherwise unchanged: popover content remains pointer-none during exit (existing rule), Escape/Tab/Enter still trigger the same close path, re-open during the 140ms window cancels the pending unmount (existing timer cleanup already clears it on re-show — keep that cleanup). | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R03 | Reduced motion: when `prefers-reduced-motion: reduce` matches, the CSS already removes the animation (model-picker.css reduced-motion block); unmount must still fire so the popover cannot linger — keep the timeout unconditional; the exit animation is 0ms under reduced motion but a 140ms delayed unmount is imperceptible and safe. | SOURCE CORRECTED: preserve the existing 60ms reduced-motion fade with fill mode both, followed by unconditional 140ms unmount; no visible or interactive ghost after the fade. The original 0ms/no-animation premise is historical only. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R04 | No change to enter animation (`model-picker-in`, `--ui-motion-popup-enter: 180ms`, `--ui-ease-enter: cubic-bezier(.16,1,.3,1)`). | Retained unchanged: No change to enter animation (`model-picker-in`, `--ui-motion-popup-enter: 180ms`, `--ui-ease-enter: cubic-bezier(.16,1,.3,1)`). | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

Implementation reported in [PR #2094](https://github.com/skytuhua-org/Gen-V1/pull/2094) at producer-reported `0ad58be5`; independent acceptance, merge and verification on main remain open. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2085#issuecomment-7128902875). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `fce32d43a8041a7da58cc859277ed7b8a4a1819b52508638501ab93480d8a024`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2085)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2085#issuecomment-7128902875)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/ModelPicker.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/ModelPicker.tsx)
- [apps/web/src/model-picker.css](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/model-picker.css)
- [packages/ui-shell/tokens.css](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/ui-shell/tokens.css)
- [Existing implementation PR #2094](https://github.com/skytuhua-org/Gen-V1/pull/2094)

## Retained complete original plan

# META
- Feature: Model picker close animation is clipped by early unmount
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-24
- Baseline: main @ 9ddd536cc84c0f327ddf6133d485f8ab8baf294b
- Related: #1186 (shared popover motion contract)
- Status: researched, not implemented

# OBJECTIVE
The model picker unmounts 30ms before its 140ms exit animation completes, so the popover vanishes abruptly instead of finishing `model-picker-out`. Unmount timing must equal or exceed the exit duration so the motion token `--ui-motion-popup-exit: 140ms` is honored.

# REQUIREMENTS
- In `apps/web/src/ModelPicker.tsx` the unmount effect currently schedules `setPresent(false)` after 110ms. Change the timeout to `140` so it matches `--ui-motion-popup-exit` (140ms), and define the value once via the token (`getComputedStyle` is unnecessary — use a named constant `POPUP_EXIT_MS = 140` colocated with the animation name).
- Behavior otherwise unchanged: popover content remains pointer-none during exit (existing rule), Escape/Tab/Enter still trigger the same close path, re-open during the 140ms window cancels the pending unmount (existing timer cleanup already clears it on re-show — keep that cleanup).
- Reduced motion: when `prefers-reduced-motion: reduce` matches, the CSS already removes the animation (model-picker.css reduced-motion block); unmount must still fire so the popover cannot linger — keep the timeout unconditional; the exit animation is 0ms under reduced motion but a 140ms delayed unmount is imperceptible and safe.
- No change to enter animation (`model-picker-in`, `--ui-motion-popup-enter: 180ms`, `--ui-ease-enter: cubic-bezier(.16,1,.3,1)`).

# REPO_MAP
- `apps/web/src/ModelPicker.tsx` — `useEffect` cleanup path sets `setTimeout(() => setPresent(false), 110)`.
- `apps/web/src/model-picker.css` — `@keyframes model-picker-out` and `animation: model-picker-out var(--ui-motion-popup-exit) var(--ui-ease-move)` on the closing state.
- Token: `packages/ui-shell/tokens.css:34` `--ui-motion-popup-exit: 140ms`.

# DESIGN
Single constant change. If the token name is ever renamed, both sides must move together; add a one-line comment `/* keep in sync with --ui-motion-popup-exit */` above the constant.

# EXECUTION_DAG
- T01 Change unmount delay 110 → 140 with named constant and comment; verify popover completes `model-picker-out` before unmount.
- T02 Regression: rapid open/close cycles (open, Escape within 100ms, reopen) leave no stuck hidden popover.

# VALIDATION
Fixture: `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"`; open http://127.0.0.1:4317, open the model picker, press Escape, record at 60fps: the popover must fade/translate out fully (14 frames) before disappearing rather than cutting off mid-motion. Repeat with reduced-motion enabled: popover disappears immediately with no animation and no 140ms ghost.

# STATE
Researched; 110 < 140 confirmed in source. Next step: T01.

# REFERENCES
- `packages/ui-shell/tokens.css` motion tokens; #1186 motion contract.
