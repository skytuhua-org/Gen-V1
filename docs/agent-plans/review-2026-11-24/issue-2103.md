# Current complete handoff revision for #2103

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2103-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2103](https://github.com/skytuhua-org/Gen-V1/issues/2103). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `35ff987dceb2e8e7039abf64692b83514ebc2f58233681e3dd4b3b9c421ec182`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

Use the existing pane ActionMenu and menuPane state. The corner already has pointer drag behavior, so adding click/keyboard activation must suppress the click synthesized after an actual drag and preserve pointer capture/cancellation. Existing focused-pane ownership, focus return and reduced-motion semantics remain required.

Verified relevant source: `apps/web/src/WorkspaceSplitLayout.tsx`, `apps/web/src/workspace-split.css`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: No new product decision is taken by this metadata revision. Execute only the retained accepted scope and the source-corrected contracts below; discoveries outside it return to the issue owner.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | CSS change + reduced-motion guard (`workspace-split.css`). Done-when: visual diff verified in both themes. | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Distinct focused-pane border follows the actual focusedPaneId in light and dark themes at 1024px and 700px; reduced-motion changes the border without animation. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | `.split-corner` click/keyboard → `setMenuPane` + aria attrs (`WorkspaceSplitLayout.tsx`). Done-when: Enter opens menu, Escape closes (existing ActionMenu behavior), focus returns to corner. | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Enter/Space and a stationary click open Area actions; Escape closes and restores focus to the corner. A real corner drag still splits/joins as before and does not accidentally open the menu afterward. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | In: focused-pane visual indicator (both themes); `.split-corner` keyboard/click behavior; aria-haspopup on the corner. | Retained unchanged: In: focused-pane visual indicator (both themes); `.split-corner` keyboard/click behavior; aria-haspopup on the corner. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R02 | Out: focus-ring style on the divider (already `var(--ui-focus-ring)`), tab-strip affordances (separate issue), narrow-width behavior. | Retained unchanged: Out: focus-ring style on the divider (already `var(--ui-focus-ring)`), tab-strip affordances (separate issue), narrow-width behavior. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R03 | Compact styling per current design language; no colored side bars. | Retained unchanged: Compact styling per current design language; no colored side bars. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R04 | `prefers-reduced-motion`: no transition on the border color change. | Retained unchanged: `prefers-reduced-motion`: no transition on the border color change. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

No implementation PR or executed feature test is established in the current issue journal. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2103#issuecomment-7126233422). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `35ff987dceb2e8e7039abf64692b83514ebc2f58233681e3dd4b3b9c421ec182`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2103)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2103#issuecomment-7126233422)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/WorkspaceSplitLayout.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/WorkspaceSplitLayout.tsx)
- [apps/web/src/workspace-split.css](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/workspace-split.css)

## Retained complete original plan

# A11y/UX: Focused split pane is visually indistinguishable; split-corner button is keyboard-dead

## META
- Repo: skytuhua-org/Gen-V1 · baseline `main@9ddd536` · plan rev 2026-11-24-r1 · filed from live QA pass 33 + source read.
- Repro: `pnpm build` + `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; await openReviewHost('/tmp/genv1-fixture', 4317)"` → `http://127.0.0.1:4317` → scenario "Workspace & settings" → create a second pane, click back and forth between panes and try to spot the focused one; Tab to the corner glyph and press Enter — nothing happens.

## OBJECTIVE
1. The focused pane has a visible indicator so keyboard users know which area commands target.
2. The `.split-corner` control — a `<button>` that today only responds to pointer drag — does something on click/Enter/Space.

## REQUIREMENTS
- In: focused-pane visual indicator (both themes); `.split-corner` keyboard/click behavior; aria-haspopup on the corner.
- Out: focus-ring style on the divider (already `var(--ui-focus-ring)`), tab-strip affordances (separate issue), narrow-width behavior.
- Compact styling per current design language; no colored side bars.
- `prefers-reduced-motion`: no transition on the border color change.

## REPO_MAP
- `apps/web/src/workspace-split.css` `.split-pane.is-focused{border-color:var(--border,#252525)}` — identical to the unfocused `.split-pane` border, so `is-focused` produces zero visible difference.
- `apps/web/src/WorkspaceSplitLayout.tsx` renderPane ~L207: `<button class="split-corner" title="Drag to split. Use the area menu for keyboard actions.">` — button has no `onClick`/key handler; Enter/Space/click are no-ops.
- `ActionMenu` is already mounted per pane (`Area actions`, `setMenuPane`).
- Tokens: `--accent` `#3b5bdb` light / `#91a7ff` dark; `--border` `#e5e5e5`/`#282828`; focus ring `--ui-focus-ring`.

## DESIGN
1. `.split-pane.is-focused` → `border-color:var(--accent)` plus `box-shadow:inset 0 0 0 1px var(--accent)` for a 2px total accent frame (compact, distinct from hover). Transition `border-color 120ms ease-out, box-shadow 120ms ease-out`; under `@media (prefers-reduced-motion: reduce)` set `transition:none`.
2. `.split-corner` behavior: `onClick`/Enter/Space opens that pane's existing `Area actions` ActionMenu (`setMenuPane(pane.id)`); add `aria-haspopup="menu"` and `aria-label="Split or open area menu"`; keep drag-to-split on pointermove for mouse users; update `title` to `"Drag to split, or press Enter for area actions"`.
3. Focused pane also drives which pane menu opens from the top `.split-workspace-tools` bar — already keyed off `layout.focusedPaneId`; unchanged.

## EXECUTION_DAG
- T01: CSS change + reduced-motion guard (`workspace-split.css`). Done-when: visual diff verified in both themes.
- T02: `.split-corner` click/keyboard → `setMenuPane` + aria attrs (`WorkspaceSplitLayout.tsx`). Done-when: Enter opens menu, Escape closes (existing ActionMenu behavior), focus returns to corner.

## VALIDATION
Fixture: two panes, keyboard-only — Tab into pane 1 vs pane 2, confirm accent frame follows `layout.focusedPaneId`; Enter on corner opens Area actions with focus trapped in the menu; reduced-motion emulation shows instant border change; check dark + light themes at 1024px and 700px.

## STATE
Filed by `devin-cloud-33f02a`. Verified: `.is-focused` border color equals unfocused; corner button has no click path.

## REFERENCES
- Tokens `apps/web/src/styles.css` L3–6. Related: #583 (a11y pass), #1598 (pane switching).
