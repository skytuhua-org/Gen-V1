# Current complete handoff revision for #2028

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2028-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2028](https://github.com/skytuhua-org/Gen-V1/issues/2028). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `be98901356e8a019b99bc4261d5635873894178a3e39fdfc4a38937371624cd1`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

The implementation component is apps/web/src/UpdateControl.tsx, which is rendered in the sidebar footer. The earlier guessed ShellSidebar-only implementation location is superseded. Preserve the existing updater flow and enabled-state action. A focusable aria-disabled control still needs an explicit activation guard for mouse and keyboard.

Verified relevant source: `apps/web/src/UpdateControl.tsx`, `apps/web/src/ShellSidebar.tsx`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: No new product decision is taken by this metadata revision. Execute only the retained accepted scope and the source-corrected contracts below; discoveries outside it return to the issue owner.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | Swap `disabled` for `aria-disabled="true"` + `cursor:not-allowed`, guard `onClick`. done-when: button is tabbable, visually unchanged, inert. | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | The unavailable Update control is reachable by Tab, visibly disabled and inert for click, Enter and Space; no updater request occurs. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | Add `span.sr-only` reason text + `aria-describedby`. done-when: focusing the button announces the explanation. | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | aria-describedby resolves to the actual reason text, which a screen reader announces on focus. Pointer hover keeps the same explanatory title. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T03 owner. |
| T03 | Test: keyboard Tab reaches the button; activation is a no-op; description present. done-when: test passes. | T02 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T03. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Cover unavailable and available-update branches, enabled activation exactly once and focus order. The producer reports two browser tests; manual assistive-technology verification remains pending. | AC-T03 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | In scope: the `Update` button in `.sidebar-footer` and its disabled-state affordance only. | Retained unchanged: In scope: the `Update` button in `.sidebar-footer` and its disabled-state affordance only. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R02 | Out of scope: the actual updater/installer flow, the footer's other contents, Settings > About equivalents. | Retained unchanged: Out of scope: the actual updater/installer flow, the footer's other contents, Settings > About equivalents. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R03 | Verified current state: `button disabled`, `title="Install Gen to receive automatic updates."`, no `aria-disabled`, no `aria-describedby`, not in Tab order. | Retained unchanged: Verified current state: `button disabled`, `title="Install Gen to receive automatic updates."`, no `aria-disabled`, no `aria-describedby`, not in Tab order. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R04 | Accessibility: reason must be reachable by keyboard focus and announced by screen readers. | Retained unchanged: Accessibility: reason must be reachable by keyboard focus and announced by screen readers. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R05 | No pointer-only affordances may carry required information. | Retained unchanged: No pointer-only affordances may carry required information. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

Implementation reported in [PR #2072](https://github.com/skytuhua-org/Gen-V1/pull/2072) at producer-reported `190afbca`; independent acceptance, merge and verification on main remain open. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2028#issuecomment-7128901883). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `be98901356e8a019b99bc4261d5635873894178a3e39fdfc4a38937371624cd1`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2028)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2028#issuecomment-7128901883)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/UpdateControl.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/UpdateControl.tsx)
- [apps/web/src/ShellSidebar.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/ShellSidebar.tsx)
- [Existing implementation PR #2072](https://github.com/skytuhua-org/Gen-V1/pull/2072)

## Retained complete original plan

# Fix: Disabled "Update" button's only explanation lives in a hover tooltip keyboard users cannot reach

## META
- Feature: Sidebar footer Update control — accessible disabled state
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-24
- Baseline: `main` @ `9ddd536cc84c0f327ddf6133d485f8ab8baf294b`
- Issue: this issue (canonical plan in body; identical copy posted as a comment)
- Status: plan only — no implementation in this pass
- Provenance: live QA of built fixture at `http://127.0.0.1:4317` on 2026-11-24 (pass 31, worker `devin-qa31-e71d2f`)

## OBJECTIVE
In the fixture the sidebar footer shows an `Update` button that is `disabled` with only `title="Install Gen to receive automatic updates."` as the explanation. A disabled button is removed from the Tab order, so keyboard and screen-reader users can never reach the tooltip or learn why the control exists but does nothing. Success: the disabled reason is reachable without a pointer, and activating the inert control gives feedback instead of silence.

## REQUIREMENTS
- In scope: the `Update` button in `.sidebar-footer` and its disabled-state affordance only.
- Out of scope: the actual updater/installer flow, the footer's other contents, Settings > About equivalents.
- Verified current state: `button disabled`, `title="Install Gen to receive automatic updates."`, no `aria-disabled`, no `aria-describedby`, not in Tab order.
- Accessibility: reason must be reachable by keyboard focus and announced by screen readers.
- No pointer-only affordances may carry required information.

## REPO_MAP
- `apps/web/src/ShellSidebar.tsx` — `.sidebar-footer` block; the Update button is rendered there (fixture DOM: `<button disabled title="Install Gen to receive automatic updates.">Update</button>` inside `.sidebar-footer`). Discovery: exact lines near the footer (~lines 484–506).
- Existing tooltip/focusable-disabled patterns in `apps/web/src/ui/` — discovery: check whether a `Tooltip` wrapper component already supports focusable disabled children (common pattern: wrap in a `span tabindex="0"`).

## DESIGN
Use the focusable-disabled pattern:

1. Replace the `disabled` attribute with `aria-disabled="true"` and keep the button in the Tab order. In its `onClick`, early-return when the disabled condition holds so it stays inert.
2. Keep the `title` text unchanged for pointer users, and add `aria-describedby` pointing to a `span.sr-only` with the same sentence `Install Gen to receive automatic updates.` so the reason is announced on focus.
3. Add `aria-keyshortcuts` — none needed.
4. Cursor: `cursor: not-allowed` on the aria-disabled button; visual styling identical to today (the disabled look must not change: same color, same opacity token already applied).
5. Keyboard: Tab reaches the button; focus ring identical to other footer/icon buttons (existing focus ring token, unchanged). Enter/Space on the inert button fires nothing but focus stays — acceptable since the reason is announced on focus; no extra toast.
6. Motion: none.

## EXECUTION_DAG
- T01 — Swap `disabled` for `aria-disabled="true"` + `cursor:not-allowed`, guard `onClick`. done-when: button is tabbable, visually unchanged, inert.
- T02 — Add `span.sr-only` reason text + `aria-describedby`. done-when: focusing the button announces the explanation.
- T03 — Test: keyboard Tab reaches the button; activation is a no-op; description present. done-when: test passes.

## VALIDATION
- Fixture repro (current broken state): serve the built fixture on :4317 (review-host command per repo docs), press Tab through the sidebar — the Update button is skipped entirely; its `title` is unreachable without a mouse.
- After fix: Tab reaches Update, the reason is announced/read; pointer hover still shows the same tooltip; click does nothing.
- Regression: when updates are available the same button must be enabled and activate normally (cover both branches in T03).

## STATE
- Verified live: `disabled` attribute + title-only explanation; skipped by Tab.
- Decided: `aria-disabled` focusable pattern.
- Implemented: nothing. Next step: T01 (locate the Update button markup in `ShellSidebar.tsx` footer).

## REFERENCES
- `apps/web/src/ShellSidebar.tsx` footer region.
- Related: #1618 ("Compact now" enabled with nothing to do, no feedback) — same affordance family, different control.
