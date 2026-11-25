# Current complete handoff revision for #2086

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2086-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2086](https://github.com/skytuhua-org/Gen-V1/issues/2086). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `6deb7470af479d4b1b83b1e97ef8829bbbeea8a1e5269f6bcd75d8ea73368b97`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

Keep the explicit native-title-only scope and the active-run/empty-catalog/enabled precedence. A disabled button title is not by itself evidence that a keyboard user or screen reader can discover the reason. Record the planned manual check honestly; any change to focusability or a described tooltip requires an explicit scope decision rather than claiming the title proves it.

Verified relevant source: `apps/web/src/ModelPicker.tsx`, `apps/web/src/model-picker.css`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: No new product decision is taken by this metadata revision. Execute only the retained accepted scope and the source-corrected contracts below; discoveries outside it return to the issue owner.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | Add the `!models.length` title branch; verify fixture shows the new tooltip on the empty-provider state. | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Empty catalog with no active-run disablement shows the exact new provider-connection title and retains the disabled visual style; empty catalog plus an active run keeps active-run precedence. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | Regression: active-run tooltip and enabled tooltip unchanged. | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Active-run copy and enabled name/caption are unchanged. Test the title states and disabled behavior, then record actual hover and screen-reader results or a bounded accessibility gap. Producer focused tests are reported; manual checks are not yet verified. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | In `apps/web/src/ModelPicker.tsx`, `locked = disabled \|\| !models.length`. Compute the trigger `title` as: | Retained unchanged: In `apps/web/src/ModelPicker.tsx`, `locked = disabled \|\| !models.length`. Compute the trigger `title` as: | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R02 | Visuals unchanged: disabled chip keeps existing opacity and `cursor: not-allowed` styles; tooltip is the only change. | Retained unchanged: Visuals unchanged: disabled chip keeps existing opacity and `cursor: not-allowed` styles; tooltip is the only change. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R03 | A11y: add `aria-disabled="true"` on the disabled trigger (button is already `disabled`; aria attribute is belt-and-braces for the title-bearing disabled state) — no change if `disabled` attribute already announces. | Retained unchanged: A11y: add `aria-disabled="true"` on the disabled trigger (button is already `disabled`; aria attribute is belt-and-braces for the title-bearing disabled state) — no change if `disabled` attribute already announces. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R04 | Tooltip continues to use the native `title` attribute; the 160ms/120ms tooltip tokens are unaffected. | Retained unchanged: Tooltip continues to use the native `title` attribute; the 160ms/120ms tooltip tokens are unaffected. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

Implementation reported in [PR #2095](https://github.com/skytuhua-org/Gen-V1/pull/2095) at producer-reported `389bf1b3`; independent acceptance, merge and verification on main remain open. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2086#issuecomment-7128903513). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `6deb7470af479d4b1b83b1e97ef8829bbbeea8a1e5269f6bcd75d8ea73368b97`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2086)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2086#issuecomment-7128903513)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/ModelPicker.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/ModelPicker.tsx)
- [apps/web/src/model-picker.css](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/model-picker.css)
- [Existing implementation PR #2095](https://github.com/skytuhua-org/Gen-V1/pull/2095)

## Retained complete original plan

# META
- Feature: Explain why the model picker trigger is disabled
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-24
- Baseline: main @ 9ddd536cc84c0f327ddf6133d485f8ab8baf294b
- Related: #2028 (disabled controls need a stated reason), #1850
- Status: researched, not implemented

# OBJECTIVE
The composer model chip is disabled in two distinct situations — no models available and an active run — but its tooltip only explains the active-run case. When `models.length === 0` the chip reads "Select model" with the generic title and users get no explanation. Give each disabled state a specific reason, per the same rule applied in #2028.

# REQUIREMENTS
- In `apps/web/src/ModelPicker.tsx`, `locked = disabled || !models.length`. Compute the trigger `title` as:
  - `disabled` (active run): unchanged copy "Wait for the active run to finish to change models".
  - `!models.length` (empty catalog): "No models available — check the provider connection".
  - Enabled: unchanged `name + (caption ? ' · ' + caption : '')`.
- Visuals unchanged: disabled chip keeps existing opacity and `cursor: not-allowed` styles; tooltip is the only change.
- A11y: add `aria-disabled="true"` on the disabled trigger (button is already `disabled`; aria attribute is belt-and-braces for the title-bearing disabled state) — no change if `disabled` attribute already announces.
- Tooltip continues to use the native `title` attribute; the 160ms/120ms tooltip tokens are unaffected.

# REPO_MAP
- `apps/web/src/ModelPicker.tsx` — `locked`, trigger `title` expression.
- `apps/web/src/model-picker.css` — disabled styles already present.

# DESIGN
Two-line conditional, no new component. Exact copy fixed above: 61 characters, sentence case, em dash separator, no trailing period.

# EXECUTION_DAG
- T01 Add the `!models.length` title branch; verify fixture shows the new tooltip on the empty-provider state.
- T02 Regression: active-run tooltip and enabled tooltip unchanged.

# VALIDATION
Fixture: `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"`; on http://127.0.0.1:4317 start a run, hover the model chip — active-run copy; on a profile with no provider models, hover — new empty-catalog copy. Screen reader announces button disabled + accessible description.

# STATE
Researched; both lock causes confirmed in source, only one has copy. Next step: T01.

# REFERENCES
- #2028 — disabled-control reason rule.
