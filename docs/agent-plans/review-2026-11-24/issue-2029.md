# Current complete handoff revision for #2029

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2029-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2029](https://github.com/skytuhua-org/Gen-V1/issues/2029). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `6a523a84b9068a9f4e77bdf8e47a361634fee85c50ddf48b1e133e2223a53ae6`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

Both App and WorkspaceHost contain a sidebar resize boundary, and apps/web/src/shell-layout.ts owns persisted layout width reads. Apply the accepted 232px floor consistently without changing the 380px maximum or collapse/recovery semantics. Legibility measurements are acceptance work, not proven merely by a constant change.

Verified relevant source: `apps/web/src/App.tsx`, `apps/web/src/WorkspaceHost.tsx`, `apps/web/src/shell-layout.ts`, `apps/web/src/ShellSidebar.tsx`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: No new product decision is taken by this metadata revision. Execute only the retained accepted scope and the source-corrected contracts below; discoveries outside it return to the issue owner.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | `ResizeHandle` `min` 200 → 232 for the sidebar instance. done-when: drag stops at 232px. | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Dragging either host sidebar stops at 232px while widths above the minimum and the 380px maximum remain unchanged. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | Clamp stored widths `< 232` to `232` on read. done-when: a persisted 200px value restores as 232px, not 200px. | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | A stored 200px width restores to 232px; already valid widths retain their values and malformed storage follows the existing safe fallback. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T03 owner. |
| T03 | Test/manual check: at minimum width the search field shows its full placeholder and ≥18 title characters; collapse still reachable by dragging past the threshold. done-when: verified at 232px in fixture. | T02 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T03. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | At 232px, inspect the full Search threads placeholder, title readability and hover actions; collapse and recovery continue to work. The producer reports ten focused tests; the manual drag and legibility pass remains pending. | AC-T03 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | In scope: the sidebar `ResizeHandle` minimum (currently `min 200 max 380`) and behavior at that minimum only. | Retained unchanged: In scope: the sidebar `ResizeHandle` minimum (currently `min 200 max 380`) and behavior at that minimum only. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R02 | Out of scope: the collapse/recovery path (already exists and is the right answer below the minimum), responsive/mobile layout, the maximum width. | Retained unchanged: Out of scope: the collapse/recovery path (already exists and is the right answer below the minimum), responsive/mobile layout, the maximum width. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R03 | Verified at 200px (1440×900 viewport): search input ~50px wide with placeholder clipped to `Searc`; pinned section hint clipped; titles ellipsize at ~10 characters; hover action buttons overlay the text. | Retained unchanged: Verified at 200px (1440×900 viewport): search input ~50px wide with placeholder clipped to `Searc`; pinned section hint clipped; titles ellipsize at ~10 characters; hover action buttons overlay the text. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R04 | Functional floor chosen by measurement: the search row needs its 12px horizontal padding + a 14px icon + a usable field (≥120px); a title needs ≥~18 characters (~150px) to stay scannable. A 232px sidebar satisfies both; 200px satisfies neither. | Retained unchanged: Functional floor chosen by measurement: the search row needs its 12px horizontal padding + a 14px icon + a usable field (≥120px); a title needs ≥~18 characters (~150px) to stay scannable. A 232px sidebar satisfies both; 200px satisfies neither. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R05 | Below the new minimum the user collapses the sidebar entirely — the existing recovery control (`Open sidebar`/`Open navigation`) already covers that state, unchanged. | Retained unchanged: Below the new minimum the user collapses the sidebar entirely — the existing recovery control (`Open sidebar`/`Open navigation`) already covers that state, unchanged. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

Implementation reported in [PR #2074](https://github.com/skytuhua-org/Gen-V1/pull/2074) at producer-reported `c5577d18`; independent acceptance, merge and verification on main remain open. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2029#issuecomment-7126255110). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `6a523a84b9068a9f4e77bdf8e47a361634fee85c50ddf48b1e133e2223a53ae6`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2029)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2029#issuecomment-7126255110)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/App.tsx)
- [apps/web/src/WorkspaceHost.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/WorkspaceHost.tsx)
- [apps/web/src/shell-layout.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/shell-layout.ts)
- [apps/web/src/ShellSidebar.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/ShellSidebar.tsx)
- [Existing implementation PR #2074](https://github.com/skytuhua-org/Gen-V1/pull/2074)

## Retained complete original plan

# Fix: Sidebar collapses to 200px where search and rows degrade

## META
- Feature: Sidebar resize minimum width
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-24
- Baseline: `main` @ `9ddd536cc84c0f327ddf6133d485f8ab8baf294b`
- Issue: this issue (canonical plan in body; identical copy posted as a comment)
- Status: plan only — no implementation in this pass
- Provenance: live QA of built fixture at `http://127.0.0.1:4317` on 2026-11-24 (pass 31, worker `devin-qa31-e71d2f`)

## OBJECTIVE
The sidebar's `ResizeHandle` allows widths down to 200px. At 200px, verified in the fixture: the search field shrinks to ~50px and clips its placeholder to `Searc`; thread titles truncate to ~10 characters (`QA-renamedEx…`, `Account questi…`); the pinned-group hint `Drag a thread here to pin it.` is clipped; row hover actions overlap the truncated title. The collapse button already exists for users who want the sidebar gone, so the resizable range should never reach a state where every row is unreadable. Success: the narrowest resizable width keeps the search field usable and titles legible.

## REQUIREMENTS
- In scope: the sidebar `ResizeHandle` minimum (currently `min 200 max 380`) and behavior at that minimum only.
- Out of scope: the collapse/recovery path (already exists and is the right answer below the minimum), responsive/mobile layout, the maximum width.
- Verified at 200px (1440×900 viewport): search input ~50px wide with placeholder clipped to `Searc`; pinned section hint clipped; titles ellipsize at ~10 characters; hover action buttons overlay the text.
- Functional floor chosen by measurement: the search row needs its 12px horizontal padding + a 14px icon + a usable field (≥120px); a title needs ≥~18 characters (~150px) to stay scannable. A 232px sidebar satisfies both; 200px satisfies neither.
- Below the new minimum the user collapses the sidebar entirely — the existing recovery control (`Open sidebar`/`Open navigation`) already covers that state, unchanged.

## REPO_MAP
- `apps/web/src/WorkspaceHost.tsx` — `<ResizeHandle min={200} max={380} side="left">` for the sidebar (verified at line ~302 region; exact line discovery acceptable).
- `apps/web/src/ShellSidebar.tsx` — search row, `.sidebar-filter-chip`, row markup; no per-width breakpoints exist inside the sidebar today (verified — it simply truncates).

## DESIGN
1. Change the sidebar `ResizeHandle` `min` from `200` to `232`. No other constant changes (`max={380}` stays).
2. Persisted widths below 232 from existing users: on mount, clamp any stored sidebar width `< 232` to `232` at the same place the stored value is read (one `Math.max(232, stored)` in the existing width-restore path; do not write back to storage — clamped on read only).
3. No CSS changes: at 232px the existing layout already fits the search row and shows ~18 title characters; no new breakpoints, no reflow, no truncation-rule changes.
4. Dragging to or below the collapse threshold keeps the current collapse behavior — collapse is the sanctioned path below the minimum; only the *resizable-open* floor changes.
5. Motion: none.

## EXECUTION_DAG
- T01 — `ResizeHandle` `min` 200 → 232 for the sidebar instance. done-when: drag stops at 232px.
- T02 — Clamp stored widths `< 232` to `232` on read. done-when: a persisted 200px value restores as 232px, not 200px.
- T03 — Test/manual check: at minimum width the search field shows its full placeholder and ≥18 title characters; collapse still reachable by dragging past the threshold. done-when: verified at 232px in fixture.

## VALIDATION
- Fixture repro (current state): serve built fixture on :4317 (review-host command per repo docs), drag the sidebar edge to its minimum — 200px shows clipped search placeholder and ~10-character titles.
- After fix: minimum width is 232px; search placeholder `Search threads` is fully visible; titles show ≥18 characters before ellipsis; collapse/recovery unchanged.
- Regression: width above minimum unchanged; persisted-width migration covered by T02.

## STATE
- Verified live at 200px: clipped search (`Searc`), ~10-char titles, clipped pinned hint, hover actions overlapping text.
- Decided: raise resizable floor to 232px with read-time clamp.
- Implemented: nothing. Next step: T01.

## REFERENCES
- `apps/web/src/WorkspaceHost.tsx` (`ResizeHandle` for sidebar).
- `apps/web/src/ShellSidebar.tsx` (rows, search row).
- Related (context, not duplicates): #1133 (auxiliary surfaces at narrow widths), #589 (zoom/text scaling resilience).
