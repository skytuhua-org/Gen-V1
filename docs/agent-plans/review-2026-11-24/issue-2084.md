# Current complete handoff revision for #2084

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2084-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2084](https://github.com/skytuhua-org/Gen-V1/issues/2084). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `1c213adb10f7f32326c1d128b930135a79be8befe823acfea7cc8bd7012e50d0`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

Home/End and PageUp/PageDown remain clamped as specified; preserve aria-activedescendant and instant scrolling. The earlier apps/web/src/SlashPalette path is an unverified discovery hint, not a required file. PR #2093 adds a caret-boundary condition for Home/End in editable inputs, while the original requirement describes unconditional option navigation. That implementation deviation is reported, not silently accepted.

Verified relevant source: `apps/web/src/ModelPicker.tsx`, `apps/web/src/ProjectPicker.tsx`, `apps/web/src/model-picker.css`, `apps/web/src/project-picker.css`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: T01/T02 Home/End acceptance is BLOCKED until the frontend owner records whether caret-boundary gating replaces the original unconditional behavior. Unaffected page-key and regression evidence can be reviewed independently.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | ModelPicker: add Home/End/PageUp/PageDown cases to `navigate`; verify wrap/clamp and scroll. Done when all four keys move active row and scroll into view at 320px popover width. | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | ModelPicker covers first/last/ten-row movement over filtered, empty and one-row lists, with active row visible at 320px. Explicitly test Home/End when the input caret is in the middle and at its boundary under the chosen policy. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | ProjectPicker: same four cases in its keydown handler. Done when same behavior verified in modal at 440px width and at 320px (hint hidden <360px height per project-picker.css). | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | ProjectPicker runs the same option navigation and caret cases at 440px and 320px, preserving text editing and active-descendant ownership. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T03 owner. |
| T03 | Regression: ArrowUp/ArrowDown/Enter/Escape behavior unchanged in both pickers. | T02 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T03. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Arrow keys, Enter, Escape, Tab, focus retention and reduced-motion behavior remain unchanged. The author reports 65 tests; independent exact-head review and the policy decision remain pending. | AC-T03 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | In `apps/web/src/ModelPicker.tsx` `navigate()`: Home moves active option to first row, End to last, PageUp moves up 10 rows clamped, PageDown down 10 rows clamped; each wraps identically to existing ArrowUp/ArrowDown wrap behavior (no wrap on Home/End — clamp to ends; PageUp/PageDown clamp, do not wrap). | DECISION HOLD: retain four-key clamped option navigation and existing arrow semantics; Home/End caret-boundary policy must be selected explicitly before T01 acceptance. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R02 | In `apps/web/src/ProjectPicker.tsx` keydown handler: same four keys, same semantics, applied to the filtered project list. | DECISION HOLD: ProjectPicker uses the same accepted four-key policy as ModelPicker; record the Home/End caret decision before T02 acceptance. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R03 | Both: moved focus scrolls the active row into view (`scrollIntoView({block:'nearest'})`), active row keeps existing `--ui-selection-bg` background and `--ui-focus-ring` outline; no new visual state. | Retained unchanged: Both: moved focus scrolls the active row into view (`scrollIntoView({block:'nearest'})`), active row keeps existing `--ui-selection-bg` background and `--ui-focus-ring` outline; no new visual state. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R04 | Announcement: no change to existing aria-activedescendant pattern; keys do not move focus, only the active descendant. | Retained unchanged: Announcement: no change to existing aria-activedescendant pattern; keys do not move focus, only the active descendant. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R05 | Reduced motion: instant scroll (no smooth scroll) when `prefers-reduced-motion` matches — `scrollIntoView` default behavior is already instant; do not pass `behavior:'smooth'`. | Retained unchanged: Reduced motion: instant scroll (no smooth scroll) when `prefers-reduced-motion` matches — `scrollIntoView` default behavior is already instant; do not pass `behavior:'smooth'`. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

Implementation reported in [PR #2093](https://github.com/skytuhua-org/Gen-V1/pull/2093) at producer-reported `0decb028`; independent acceptance, merge and verification on main remain open. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2084#issuecomment-7128902309). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `1c213adb10f7f32326c1d128b930135a79be8befe823acfea7cc8bd7012e50d0`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2084)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2084#issuecomment-7128902309)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/ModelPicker.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/ModelPicker.tsx)
- [apps/web/src/ProjectPicker.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/ProjectPicker.tsx)
- [apps/web/src/model-picker.css](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/model-picker.css)
- [apps/web/src/project-picker.css](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/project-picker.css)
- [Existing implementation PR #2093](https://github.com/skytuhua-org/Gen-V1/pull/2093)

## Retained complete original plan

# META
- Feature: Full listbox keyboard coverage in the model picker and project picker
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-24
- Baseline: main @ 9ddd536cc84c0f327ddf6133d485f8ab8baf294b
- Related: #1881 (same gap, slash palette), #1931 (settings pickers)
- Status: researched, not implemented

# OBJECTIVE
Keyboard-only users cannot jump within long model or project lists: only ArrowUp/ArrowDown/Enter/Escape work. Add Home, End, PageUp, PageDown to both pickers' listboxes so every item is reachable in at most two key presses, matching the WAI-ARIA listbox pattern and the fix already specified for the slash palette in #1881.

# REQUIREMENTS
- In `apps/web/src/ModelPicker.tsx` `navigate()`: Home moves active option to first row, End to last, PageUp moves up 10 rows clamped, PageDown down 10 rows clamped; each wraps identically to existing ArrowUp/ArrowDown wrap behavior (no wrap on Home/End — clamp to ends; PageUp/PageDown clamp, do not wrap).
- In `apps/web/src/ProjectPicker.tsx` keydown handler: same four keys, same semantics, applied to the filtered project list.
- Both: moved focus scrolls the active row into view (`scrollIntoView({block:'nearest'})`), active row keeps existing `--ui-selection-bg` background and `--ui-focus-ring` outline; no new visual state.
- Announcement: no change to existing aria-activedescendant pattern; keys do not move focus, only the active descendant.
- Reduced motion: instant scroll (no smooth scroll) when `prefers-reduced-motion` matches — `scrollIntoView` default behavior is already instant; do not pass `behavior:'smooth'`.

# REPO_MAP
- `apps/web/src/ModelPicker.tsx` — `navigate(e)` switch currently handles ArrowDown/ArrowUp/Enter/Escape/Tab only.
- `apps/web/src/ProjectPicker.tsx` — keydown on the combobox input handles ArrowDown/ArrowUp/Enter/Escape only.
- `apps/web/src/SlashPalette` (sibling pattern per #1881).
- CSS: `apps/web/src/model-picker.css`, `apps/web/src/project-picker.css` — no changes needed.

# DESIGN
Add cases to the existing keydown switches; extract a shared `clampIndex`/`moveActive(delta)` helper per file (6 lines) or reuse the existing index math. No new component, no new state, no CSS. Handle PageUp/PageDown before ArrowUp/ArrowDown cases to keep ordering readable.

# EXECUTION_DAG
- T01 ModelPicker: add Home/End/PageUp/PageDown cases to `navigate`; verify wrap/clamp and scroll. Done when all four keys move active row and scroll into view at 320px popover width.
- T02 ProjectPicker: same four cases in its keydown handler. Done when same behavior verified in modal at 440px width and at 320px (hint hidden <360px height per project-picker.css).
- T03 Regression: ArrowUp/ArrowDown/Enter/Escape behavior unchanged in both pickers.

# VALIDATION
Fixture repro: `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` then open http://127.0.0.1:4317, click the model chip in the composer rail, press End/PageUp; click "Select project", press End/Home. Expected: active row jumps and scrolls; Enter selects the focused item; Escape still closes. Check at 320px viewport and with OS reduced-motion enabled.

# STATE
Researched against main@9ddd536 (files read end-to-end); zero implementation. Next step: T01.

# REFERENCES
- #1881 — identical gap specified for slash palette.
- ARIA Authoring Practices listbox keyboard interaction.
