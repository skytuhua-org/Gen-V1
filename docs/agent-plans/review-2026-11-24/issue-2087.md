# Current complete handoff revision for #2087

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2087-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2087](https://github.com/skytuhua-org/Gen-V1/issues/2087). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `74f0fde5940d822aae5bd7ca64e93c2d1fcee550fa5f6aa529c3551b578e70df`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

The display-name fallback is presentation only. Preserve provider identifiers used for routing and persistence; apply the same computed visible label to the trigger and group header without changing catalog identity or layout.

Verified relevant source: `apps/web/src/ModelPicker.tsx`, `apps/web/src/model-picker.css`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: No new product decision is taken by this metadata revision. Execute only the retained accepted scope and the source-corrected contracts below; discoveries outside it return to the issue owner.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | Add helper, wire it into `providerLabel` fallback and the group header; verify "Recording Fixture" style output in the fixture. | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Missing/empty displayName falls back to a title-cased id with hyphens/underscores replaced and whitespace collapsed; recording-fixture becomes Recording Fixture in both visible places. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | Regression: providers with real `displayName` unchanged. | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | A real nonempty displayName is retained exactly. A 40-character fallback ellipsizes within the existing rail; model selection still submits the unchanged provider id. Producer focused tests are reported; the manual ellipsis walkthrough remains pending. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | In `apps/web/src/ModelPicker.tsx`, `providerLabel` currently falls back to the raw `provider` string. Fallback order: provider's `displayName` when present, else title-case the id — replace `-` and `_` with spaces, capitalize each word, collapse whitespace (so `recording-fixture` renders "Recording Fixture"). | Retained unchanged: In `apps/web/src/ModelPicker.tsx`, `providerLabel` currently falls back to the raw `provider` string. Fallback order: provider's `displayName` when present, else title-case the id — replace `-` and `_` with spaces, capitalize each word, collapse whitespace (so `recording-fixture` renders "Recording Fixture"). | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R02 | Apply the same label in both places it appears: the trigger rail text (existing `providerLabel` usage, 12px, `--ui-muted`) and the popover group header (existing group label row, 11px uppercase letter-spaced 0.06em per model-picker.css — keep styles, only the text source changes). | Retained unchanged: Apply the same label in both places it appears: the trigger rail text (existing `providerLabel` usage, 12px, `--ui-muted`) and the popover group header (existing group label row, 11px uppercase letter-spaced 0.06em per model-picker.css — keep styles, only the text source changes). | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R03 | No layout change: trigger rail keeps its existing max-width and ellipsis truncation; a provider name longer than the rail truncates with `text-overflow: ellipsis` exactly as today. | Retained unchanged: No layout change: trigger rail keeps its existing max-width and ellipsis truncation; a provider name longer than the rail truncates with `text-overflow: ellipsis` exactly as today. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R04 | Empty-string `displayName` is treated as absent (falls back to the title-cased id). | Retained unchanged: Empty-string `displayName` is treated as absent (falls back to the title-cased id). | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

Implementation reported in [PR #2096](https://github.com/skytuhua-org/Gen-V1/pull/2096) at producer-reported `01709c14`; independent acceptance, merge and verification on main remain open. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2087#issuecomment-7128903958). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `74f0fde5940d822aae5bd7ca64e93c2d1fcee550fa5f6aa529c3551b578e70df`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2087)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2087#issuecomment-7128903958)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/ModelPicker.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/ModelPicker.tsx)
- [apps/web/src/model-picker.css](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/model-picker.css)
- [Existing implementation PR #2096](https://github.com/skytuhua-org/Gen-V1/pull/2096)

## Retained complete original plan

# META
- Feature: Human-readable provider labels in the model picker
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-24
- Baseline: main @ 9ddd536cc84c0f327ddf6133d485f8ab8baf294b
- Related: #1850 (raw model id in held state — same class of leak)
- Status: researched, not implemented

# OBJECTIVE
When a provider has no display name, the model picker renders the raw provider id (lowercase, e.g. `recording fixture` shows as a lowercase id in both the trigger rail label and the popover group header). Users see internal identifiers instead of readable names.

# REQUIREMENTS
- In `apps/web/src/ModelPicker.tsx`, `providerLabel` currently falls back to the raw `provider` string. Fallback order: provider's `displayName` when present, else title-case the id — replace `-` and `_` with spaces, capitalize each word, collapse whitespace (so `recording-fixture` renders "Recording Fixture").
- Apply the same label in both places it appears: the trigger rail text (existing `providerLabel` usage, 12px, `--ui-muted`) and the popover group header (existing group label row, 11px uppercase letter-spaced 0.06em per model-picker.css — keep styles, only the text source changes).
- No layout change: trigger rail keeps its existing max-width and ellipsis truncation; a provider name longer than the rail truncates with `text-overflow: ellipsis` exactly as today.
- Empty-string `displayName` is treated as absent (falls back to the title-cased id).

# REPO_MAP
- `apps/web/src/ModelPicker.tsx` — `providerLabel` computation; group header render.
- `apps/web/src/model-picker.css` — rail label and group header styles (no edits).

# DESIGN
Pure formatting helper `providerDisplayName(provider: string): string` (~4 lines) inside ModelPicker.tsx; unit-testable, no state, no CSS.

# EXECUTION_DAG
- T01 Add helper, wire it into `providerLabel` fallback and the group header; verify "Recording Fixture" style output in the fixture.
- T02 Regression: providers with real `displayName` unchanged.

# VALIDATION
Fixture: `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"`; open http://127.0.0.1:4317, open the model picker: the rail and group header show "Recording Fixture" (title-cased), never the raw lowercase id. Test a 40-character provider id for ellipsis truncation.

# STATE
Researched; raw-id fallback confirmed in source and visually in the fixture. Next step: T01.

# REFERENCES
- #1850 — raw-id leak precedent.
