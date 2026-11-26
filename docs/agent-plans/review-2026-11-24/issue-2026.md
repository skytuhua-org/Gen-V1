# Current complete handoff revision for #2026

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2026-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2026](https://github.com/skytuhua-org/Gen-V1/issues/2026). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `232f3d06c966a84a99c3aecbe070e1de0fd55df922b734055434cbb8421be10c`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

Preserve the three existing filter states and their visible strings. Current-state naming, status announcements and navigation aria-controls must be checked on the real filter path, including chip removal when returning to All; DOM attributes alone do not prove a screen reader announcement. Do not take over #1748, #1749 or #1703.

Verified relevant source: `apps/web/src/ShellSidebar.tsx`, `apps/web/src/WorkspaceHost.tsx`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: No new product decision is taken by this metadata revision. Execute only the retained accepted scope and the source-corrected contracts below; discoveries outside it return to the issue owner.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | Filter button: drop `aria-pressed`, set `aria-label="Thread filter: {Current}"`, retitle tooltip `Filter threads — currently {current}`. done-when: DOM shows no `aria-pressed`, label reflects the active state; cycling updates the label. | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | All, working and waiting each expose a distinct current-state name with no binary aria-pressed value. Keyboard cycling preserves focus and the existing thread partition behavior. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | `role="status"` + `aria-atomic="true"` on `.sidebar-filter-chip` and `.sidebar-empty`. done-when: switching filters produces a polite announcement of the chip text and of the empty-state copy when the list is empty. | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Filter changes and a resulting empty list produce one coherent polite announcement; returning to All announces the restored state even when the chip is removed. Repeated renders do not create duplicate live-region chatter. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T03 owner. |
| T03 | `aria-expanded="true"` + `aria-controls="threads-nav"` on the in-sidebar collapse button; `id="threads-nav"` on the `nav`. done-when: DOM attributes present; recovery button unchanged. | T02 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T03. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | The in-sidebar collapse button controls the actual threads navigation id and reports expanded=true; recovery control behavior remains unchanged. | AC-T03 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T04 owner. |
| T04 | Update/extend sidebar tests covering the new attributes and announcements. done-when: tests pass. | T03 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T04. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Verify the three-state cycle and empty/populated cases in the scoped fixture, then record an actual screen-reader pass. The producer reports two browser tests; a manual assistive-technology check remains pending. | AC-T04 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | In scope: the filter button (`.sidebar-filter`), the `.sidebar-filter-chip`, the `.sidebar-empty` text, and the sidebar collapse/restore control's `aria-expanded` wiring only where the same fix pattern applies. | Retained unchanged: In scope: the filter button (`.sidebar-filter`), the `.sidebar-filter-chip`, the `.sidebar-empty` text, and the sidebar collapse/restore control's `aria-expanded` wiring only where the same fix pattern applies. | T01, T02, T03, T04 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03, AC-T04 |
| R02 | Out of scope: which threads each filter shows (#1748 owns pinned-hiding), the chip's visual design (#1139 owns it), keyboard navigation of rows (#1749), search behavior (#1703). | Retained unchanged: Out of scope: which threads each filter shows (#1748 owns pinned-hiding), the chip's visual design (#1139 owns it), keyboard navigation of rows (#1749), search behavior (#1703). | T01, T02, T03, T04 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03, AC-T04 |
| R03 | Current values confirmed live: `title` = `Filter: {current}. Click for {next} threads`; `aria-pressed` = `true` for both `working` and `waiting`; chip text `Showing {filter} threads` with `Clear thread filter` button; empty copy `No working threads right now.` / `No threads waiting for your input.` / `Your threads will appear here.` / `No matching threads.`. | Retained unchanged: Current values confirmed live: `title` = `Filter: {current}. Click for {next} threads`; `aria-pressed` = `true` for both `working` and `waiting`; chip text `Showing {filter} threads` with `Clear thread filter` button; empty copy `No working threads right now.` / `No threads waiting for your input.` / `Your threads will appear here.` / `No matching threads.`. | T01, T02, T03, T04 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03, AC-T04 |
| R04 | Accessibility: the button must expose the current state; the state change must be announced; no focus loss. | Retained unchanged: Accessibility: the button must expose the current state; the state change must be announced; no focus loss. | T01, T02, T03, T04 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03, AC-T04 |
| R05 | Copy: keep the existing visible strings; only the control's accessible name and announcements change (below). | Retained unchanged: Copy: keep the existing visible strings; only the control's accessible name and announcements change (below). | T01, T02, T03, T04 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03, AC-T04 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

Implementation reported in [PR #2068](https://github.com/skytuhua-org/Gen-V1/pull/2068) at producer-reported `acf518fa`; independent acceptance, merge and verification on main remain open. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2026#issuecomment-7128901439). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `232f3d06c966a84a99c3aecbe070e1de0fd55df922b734055434cbb8421be10c`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2026)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2026#issuecomment-7128901439)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/ShellSidebar.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/ShellSidebar.tsx)
- [apps/web/src/WorkspaceHost.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/WorkspaceHost.tsx)
- [Existing implementation PR #2068](https://github.com/skytuhua-org/Gen-V1/pull/2068)

## Retained complete original plan

# Fix: Sidebar filter button exposes three states as a binary toggle, and filter changes are unannounced

## META
- Feature: Sidebar thread filter — correct semantics and announcements
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-24
- Baseline: `main` @ `9ddd536cc84c0f327ddf6133d485f8ab8baf294b`
- Issue: this issue (canonical plan in body; identical copy posted as a comment)
- Status: plan only — no implementation in this pass
- Provenance: live QA of built fixture at `http://127.0.0.1:4317` on 2026-11-24 (pass 31, worker `devin-qa31-e71d2f`)

## OBJECTIVE
The filter button cycles `all → working → waiting → all` but is marked up `aria-pressed={filter !== 'all'}`: a screen reader announces a two-state "toggle button, pressed" for both `working` and `waiting`, so the two filtered states are indistinguishable and `all` reads as "not pressed". Its `title`/`aria-label` compounds this by describing the *next* state ("Filter: all. Click for working threads") rather than the current one. Separately, the resulting changes — the "Showing working threads" chip and the swapped `.sidebar-empty` copy — mutate silently with no live region. Success: the control reports its current tri-state value, and each state change is announced.

## REQUIREMENTS
- In scope: the filter button (`.sidebar-filter`), the `.sidebar-filter-chip`, the `.sidebar-empty` text, and the sidebar collapse/restore control's `aria-expanded` wiring only where the same fix pattern applies.
- Out of scope: which threads each filter shows (#1748 owns pinned-hiding), the chip's visual design (#1139 owns it), keyboard navigation of rows (#1749), search behavior (#1703).
- Current values confirmed live: `title` = `Filter: {current}. Click for {next} threads`; `aria-pressed` = `true` for both `working` and `waiting`; chip text `Showing {filter} threads` with `Clear thread filter` button; empty copy `No working threads right now.` / `No threads waiting for your input.` / `Your threads will appear here.` / `No matching threads.`.
- Accessibility: the button must expose the current state; the state change must be announced; no focus loss.
- Copy: keep the existing visible strings; only the control's accessible name and announcements change (below).

## REPO_MAP
- `apps/web/src/ShellSidebar.tsx` — filter state and partitions lines 162–195; filter button line ~391 (`className="icon-button sidebar-action-btn sidebar-filter"`, `aria-pressed={filter !== 'all'}`); chip lines 421–424; `.sidebar-empty` copy line ~482. Verified.
- `apps/web/src/WorkspaceHost.tsx` — `sidebar-recovery` button already uses `aria-expanded`; the in-sidebar collapse control is the one to check for parity. Verified recovery side.
- No existing live region covers the sidebar; three `span.sr-only[role=status][aria-live=polite]` exist app-wide but none is fed by filter changes (verified via DOM).

## DESIGN
1. **Button semantics.** Replace `aria-pressed` with a cycle pattern: keep it a `<button>` but remove `aria-pressed`; set `aria-label="Thread filter: {current}"` where `{current}` is `All` / `Working` / `Waiting` (capitalized). Add `aria-keyshortcuts` unchanged (none today). The visible glyph and the blue "active" dot stay unchanged.
   - `title` tooltip becomes `Filter threads — currently {current}` (`currently all`, `currently working`, `currently waiting`). No "Click for …" next-state text: the action is discoverable by activating it, matching every other icon-button in the row.
2. **Live announcement.** Give the existing chip container `role="status"` so its insertion/removal is announced politely. For the `.sidebar-empty` state, add `role="status"` to the `.sidebar-empty` element as well — its copy is already state-specific, so no new strings are needed. Both must use `aria-live="polite"` (implied by `role="status"`), `aria-atomic="true"`.
3. **Collapse button parity.** Add `aria-expanded={false}` … — verified recovery button already carries `aria-expanded`; add the same attribute to the in-sidebar collapse control: `aria-expanded="true"` while the sidebar is open (the button only exists in the open state, so a constant `true` is correct), with `aria-controls` pointing at the `nav[aria-label="Threads"]` element's `id` (add `id="threads-nav"`).
4. No visual, spacing, color, or motion changes. `prefers-reduced-motion` untouched.

## EXECUTION_DAG
- T01 — Filter button: drop `aria-pressed`, set `aria-label="Thread filter: {Current}"`, retitle tooltip `Filter threads — currently {current}`. done-when: DOM shows no `aria-pressed`, label reflects the active state; cycling updates the label.
- T02 — `role="status"` + `aria-atomic="true"` on `.sidebar-filter-chip` and `.sidebar-empty`. done-when: switching filters produces a polite announcement of the chip text and of the empty-state copy when the list is empty.
- T03 — `aria-expanded="true"` + `aria-controls="threads-nav"` on the in-sidebar collapse button; `id="threads-nav"` on the `nav`. done-when: DOM attributes present; recovery button unchanged.
- T04 — Update/extend sidebar tests covering the new attributes and announcements. done-when: tests pass.

## VALIDATION
- Fixture repro (current broken state): serve fixture as in VALIDATION of the rename plan (review host on :4317), focus the funnel button in a screen reader — it announces "pressed" identically in `working` and `waiting`, and its tooltip promises the *next* state.
- After fix: each activation changes the accessible name to the new current state; chip appearance/disappearance is announced; empty-state copy is announced when a filter yields zero rows.
- Keyboard: Tab reaches the button, Enter/Space cycles — unchanged.

## STATE
- Verified live: `aria-pressed` binary across three states; `title` describes next state; no live region on chip or empty state; recovery button already has `aria-expanded`.
- Decided: labeled cycle button + `role="status"` announcements.
- Implemented: nothing. Next step: T01.

## REFERENCES
- `apps/web/src/ShellSidebar.tsx` lines 162–195, 391, 421–424, 482.
- `apps/web/src/WorkspaceHost.tsx` (recovery `aria-expanded` pattern).
- Related open issues (context, not duplicates): #1139 (chip visuals — implemented), #1748 (filter hides pinned), #1749 (row keyboard nav), #1931 (radiogroup semantics pattern).
