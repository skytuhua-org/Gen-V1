# Current complete handoff revision for #2104

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2104-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2104](https://github.com/skytuhua-org/Gen-V1/issues/2104). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `51a970aa18d4dd7f99d6f31ffd1e09d95b4d6cc14175d427b63b121b5ef54c31`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

minimumViewSize is imported from packages/core/split-workspace-layout.ts, not defined in WorkspaceSplitLayout. It already returns width 320 for thread views, width 360 for diff/pull-request surfaces, and width 240 for empty or other views. Preserve these existing per-kind floors while verifying the chat floor. rects is keyed by pane id, so compact layout must use the pane content measurement rather than viewport width. Discover the exact composer/History render owners before adding props. The statement no pane below 320 conflicts with existing 240px non-chat floors and needs a scope decision before broadening them.

Verified relevant source: `apps/web/src/WorkspaceSplitLayout.tsx`, `apps/web/src/workspace-split.css`, `packages/core/split-workspace-layout.ts`, `apps/web/src/App.tsx`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: T03 changes to non-chat minimums are BLOCKED on whether the 320px requirement applies only to chat content or to all pane kinds. Existing chat-floor verification and compact chat UI are independently executable.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | `is-compact` class derivation in `renderPane` + CSS block (`workspace-split.css`).  | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Derive compact state from the target pane content width, with two side-by-side panes of different widths proving independent behavior. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | composer compact placeholder + History icon-only collapse (composer component + prop). | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | At a 330px chat pane, Ask… is single-line, History is a 32px icon with retained accessible name, and metadata reduces to the status icon; at 481px the full layout returns. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T03 owner. |
| T03 | `minimumViewSize` floor 320px + clamp verification. | T02 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T03. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Verify the existing 320px thread floor through divider, split and restoration paths before changing core minimums. Keep 360px review floors and 240px unrelated/empty surfaces unless the owner explicitly expands scope. | AC-T03 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | In: composer behavior and header controls when pane content width < 480px; pane minimum content width enforcement. | Retained unchanged: In: composer behavior and header controls when pane content width < 480px; pane minimum content width enforcement. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R02 | Out: global composer redesign (#1132), sidebar collapse. | Retained unchanged: Out: global composer redesign (#1132), sidebar collapse. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R03 | At pane width < 480px the composer uses the short placeholder `Ask…` (no wrap problem); the `History` button collapses to icon-only 32×32px with `aria-label="History"` retained; the breadcrumb/meta row hides everything except the status icon. | Retained unchanged: At pane width < 480px the composer uses the short placeholder `Ask…` (no wrap problem); the `History` button collapses to icon-only 32×32px with `aria-label="History"` retained; the breadcrumb/meta row hides everything except the status icon. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R04 | No pane may shrink below 320px content width — enforce in the split minimum (`minimumViewSize`) so the divider clamps there. | SOURCE CORRECTED / DECISION HOLD: thread views already have a 320px floor in packages/core/split-workspace-layout.ts. Verify that floor. Broadening the separate 240px non-chat/empty floors needs the explicit scope decision recorded above; preserve 360px review floors. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

No implementation PR or executed feature test is established in the current issue journal. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2104#issuecomment-7126234388). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `51a970aa18d4dd7f99d6f31ffd1e09d95b4d6cc14175d427b63b121b5ef54c31`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2104)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2104#issuecomment-7126234388)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/WorkspaceSplitLayout.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/WorkspaceSplitLayout.tsx)
- [apps/web/src/workspace-split.css](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/workspace-split.css)
- [packages/core/split-workspace-layout.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/split-workspace-layout.ts)
- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/App.tsx)

## Retained complete original plan

# UX: Chat pane degrades at narrow split widths (~330px) — placeholder wraps mid-word, History pill oversized

## META
- Repo: skytuhua-org/Gen-V1 · baseline `main@9ddd536` · plan rev 2026-11-24-r1 · filed from live QA pass 33.
- Repro: fixture at `http://127.0.0.1:4317` (see repro command below) → scenario "Workspace & settings" → Area actions → Split columns → drag divider so the chat pane is ~330px wide.

## OBJECTIVE
A chat pane at ~330–400px stays compact and readable instead of broken. Observed at 330px: the composer placeholder text wraps mid-word across 3 lines, the `History` button renders as an oversized pill disproportionate to the pane, and the breadcrumb/toolbar row squeezes into clipped fragments. Scope is the split-pane width path specifically — global narrow-viewport composer work is #1132 (PR #1699); this issue covers only what happens *inside a narrow pane*, which #1132 does not address.

## REQUIREMENTS
- In: composer behavior and header controls when pane content width < 480px; pane minimum content width enforcement.
- Out: global composer redesign (#1132), sidebar collapse.
- At pane width < 480px the composer uses the short placeholder `Ask…` (no wrap problem); the `History` button collapses to icon-only 32×32px with `aria-label="History"` retained; the breadcrumb/meta row hides everything except the status icon.
- No pane may shrink below 320px content width — enforce in the split minimum (`minimumViewSize`) so the divider clamps there.

## REPO_MAP
- `apps/web/src/WorkspaceSplitLayout.tsx`: `minimumViewSize(view)`/`minimumSplitSize` (~L82–93) — sets per-pane floor used by `fitSplit` and divider clamping.
- `apps/web/src/App.tsx` + chat/composer components (discovery: composer textarea placeholder and `History` button location in the chat surface rendered inside `.split-pane-slot`).
- `apps/web/src/workspace-split.css` media `(max-width:700px)` tweaks exist (L19) — pane-width, not viewport-width, is the right trigger: pane width is already tracked per slot via `rects`/`size` in `WorkspaceSplitLayout`.
- #1132 covers viewport-width composer crowding.

## DESIGN
1. Pass `pane.width < 480` down as a `compact` class on the pane slot: `.split-pane.is-compact` (set in `renderPane` from `rects[pane.id].width < 480`).
2. `.is-compact` rules: composer placeholder string switches via a `compact` prop or CSS `data-compact` attr on a `span`-rendered placeholder — implementation: composer already knows its container width? Simplest complete spec: when `.is-compact`, set textarea `placeholder="Ask…"` through a prop threaded from `renderPane` (add `compact` to the view render context).
3. `History` button: `.is-compact .history-button {width:32px;height:32px;padding:0}` with label hidden via `.history-button .label{display:none}` — icon stays, `aria-label` already on the button.
4. Breadcrumb row: `.is-compact .breadcrumb > :not(:last-child){display:none}` (keep the trailing status).
5. Minimum pane width: raise `minimumViewSize(chat).width` to 320px content; `fitSplit`/`keyResize`/drag clamp already consume `minimumSplitSize`.
6. No motion changes; identical under reduced motion.

## EXECUTION_DAG
- T01: `is-compact` class derivation in `renderPane` + CSS block (`workspace-split.css`). 
- T02: composer compact placeholder + History icon-only collapse (composer component + prop).
- T03: `minimumViewSize` floor 320px + clamp verification.

## VALIDATION
Fixture: chat pane at 330px — placeholder `Ask…` single line, History 32px icon, breadcrumb = status only, no mid-word wraps, divider refuses <320px; pane at 481px renders the full layout unchanged.

## STATE
Filed by `devin-cloud-33f02a`; symptoms verified at 330px pane width.

## REFERENCES
- #1132 (viewport composer crowding — different scope), #2029 (sidebar clip).
