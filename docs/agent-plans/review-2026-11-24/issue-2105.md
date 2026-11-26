# Current complete handoff revision for #2105

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2105-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2105](https://github.com/skytuhua-org/Gen-V1/issues/2105). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `8052f071372d7c2799a12ffe92a39b8e4ad6b6fc84dc8b5874968a2cbec9201b`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

This is the split-pane strip, distinct from #1741 workspace-surface tabs and #1740 closing behavior. Retain both proposed affordances: an all-tabs menu and directional scroll controls. Measure actual overflow and clean up observers. Keyboard focus and activation must reference existing view ids; do not reorder or recreate views to reveal them.

Verified relevant source: `apps/web/src/WorkspaceSplitLayout.tsx`, `apps/web/src/workspace-split.css`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: No new product decision is taken by this metadata revision. Execute only the retained accepted scope and the source-corrected contracts below; discoveries outside it return to the issue owner.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | overflow chevron menu + all-tabs list (`WorkspaceSplitLayout.tsx`).  | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Six tabs in a 240px strip appear in the all-tabs menu with the active tab indicated; choosing a clipped tab activates that same view and reveals it. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | scroll buttons + ResizeObserver visibility. | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Directional controls appear only when overflow exists, update on container/content resize and hide when all tabs fit. Detached/disposed strips disconnect ResizeObserver. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T03 owner. |
| T03 | roving tabindex + scrollIntoView-on-activate. | T02 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T03. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Roving tabindex permits keyboard access to every tab and scrolls the active one into view. Reduced motion uses instant scroll; pointer dragging and independent pane focus remain intact. | AC-T03 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | In: visible overflow affordance when `scrollWidth > clientWidth`; keyboard access to every tab; active tab always scrolled into view. | Retained unchanged: In: visible overflow affordance when `scrollWidth > clientWidth`; keyboard access to every tab; active tab always scrolled into view. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R02 | Out: closing tabs (#1740), workspace-surface tab strip arrow nav (#1741 — different strip; coordinate shared styling). | Retained unchanged: Out: closing tabs (#1740), workspace-surface tab strip arrow nav (#1741 — different strip; coordinate shared styling). | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R03 | Compact: 18px-tall controls, existing icon-button style. | Retained unchanged: Compact: 18px-tall controls, existing icon-button style. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

No implementation PR or executed feature test is established in the current issue journal. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2105#issuecomment-7126235370). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `8052f071372d7c2799a12ffe92a39b8e4ad6b6fc84dc8b5874968a2cbec9201b`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2105)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2105#issuecomment-7126235370)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/WorkspaceSplitLayout.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/WorkspaceSplitLayout.tsx)
- [apps/web/src/workspace-split.css](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/workspace-split.css)

## Retained complete original plan

# UX/A11y: Split-pane tab strip hides overflow tabs — invisible scroll, no affordance, unreachable by keyboard

## META
- Repo: skytuhua-org/Gen-V1 · baseline `main@9ddd536` · plan rev 2026-11-24-r1 · filed from live QA pass 33 + source read.
- Repro: fixture `http://127.0.0.1:4317` (command below) → scenario "Workspace & settings" → open Editor: Agents/Terminal/Tasks/Cost etc. into one pane until >3 tabs exist at ~240px strip width.

## OBJECTIVE
`.split-tab-strip` scrolls horizontally (`overflow:auto; scrollbar-width:none`, `workspace-split.css` L10) but exposes no affordance: no scroll arrows, no overflow menu, and the strip swallows focus — extra tabs are invisible and unreachable without a pointer that can scroll. Observed: strip ~238px wide held 4+ tabs, several completely clipped (screenshot qa-tabs.png).

## REQUIREMENTS
- In: visible overflow affordance when `scrollWidth > clientWidth`; keyboard access to every tab; active tab always scrolled into view.
- Out: closing tabs (#1740), workspace-surface tab strip arrow nav (#1741 — different strip; coordinate shared styling).
- Compact: 18px-tall controls, existing icon-button style.

## REPO_MAP
- `apps/web/src/workspace-split.css` L10: `.split-tab-strip{overflow:auto;scrollbar-width:none}` + `::-webkit-scrollbar{display:none}`; buttons `max-width:240px;min-width:70px`.
- `apps/web/src/WorkspaceSplitLayout.tsx` `renderPane` ~L207: `.split-tab-strip role="tablist"` rendering tab buttons (`draggable`, `view.activate` on click).
- #1741 covers the *workspace surface* tab strip's arrow-key nav — reuse its roving-tabindex approach here so both strips behave identically.

## DESIGN
1. Overflow indicator: wrap `.split-tab-strip`; when `scrollWidth > clientWidth` show a `‹`/`›` pair of 18×24px icon-buttons pinned at the strip's right edge (flat, `color:var(--muted)`, hover `var(--hover)`); each click scrolls `strip.scrollBy({left:±160,behavior:'smooth'})` — `behavior:'auto'` under reduced motion. Hide the pair when nothing overflows; observe via ResizeObserver on the strip.
2. Overflow menu: a `⌄` chevron button at strip end (same 18×24px) opens a menu listing all tabs with `✓` on the active; selecting calls `view.activate` — guarantees every tab is reachable even with zero scrolling.
3. Keyboard: roving tabindex — active tab `tabIndex=0`, others `-1`; ArrowLeft/Right move+activate focus across tabs; each activated tab calls `scrollIntoView({inline:'nearest',block:'nearest'})`. Matches #1741's pattern.
4. Active-tab guarantee: on `view.activate`/layout change, `activeButton.scrollIntoView` in the same effect that re-renders the pane.
5. No new animations beyond the 18px fade-in of the overflow pair (opacity .6→1, 100ms, suppressed under reduced motion).

## EXECUTION_DAG
- T01: overflow chevron menu + all-tabs list (`WorkspaceSplitLayout.tsx`). 
- T02: scroll buttons + ResizeObserver visibility.
- T03: roving tabindex + scrollIntoView-on-activate.

## VALIDATION
Fixture: open 6 tabs in a ~240px strip — chevrons appear, `›` scrolls, `⌄` lists all 6 with ✓ on active; keyboard-only ArrowRight cycles and activates; activating a clipped tab scrolls it into view; strip ≤ all-tabs-fit hides all controls.

## STATE
Filed by `devin-cloud-33f02a`; overflow verified in fixture.

## REFERENCES
- #1741 (surface tab strip), #1740 (tab close), #1598.
