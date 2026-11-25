# Current complete handoff revision for #2110

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2110-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2110](https://github.com/skytuhua-org/Gen-V1/issues/2110). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `d3e283d67aa3b348aafc71b32ca8406163ce35ae63ae73b2d383bb52452b46ea`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

WorkspaceLauncher receives optional onOpenTool, uses useWorkspace, and dispatches through its existing openTool(kind) helper, falling back to workspace.setActiveTab while catching sync/async errors. There is no PanelContext/context.addSurface interface in this component. The notes and plan keys already exist in WorkspacePanelKind, WorkspaceTab and surface rendering. The eight current buttons have icons, labels and captions, not text-only secondary markup. Preserve those eight and the accepted text-only Notes/Plan additions unless the owner revises their presentation; dispatch both through openTool and preserve its error behavior. The section has an accessible Workspace launcher label, not an existing role=group.

Verified relevant source: `apps/web/src/WorkspacePanelBodies.tsx`, `apps/web/src/WorkspaceSurfaceBody.tsx`, `apps/web/src/workspace-context.tsx`, `packages/contracts/workspace.ts`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: No new product decision is taken by this metadata revision. Execute only the retained accepted scope and the source-corrected contracts below; discoveries outside it return to the issue owner.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | Owner: frontend implementer. Add the two buttons with exact keys used by the Add-surface menu (read from WorkspacePanel.tsx menu definition). Done-when: launcher renders 10 buttons; each opens the corresponding surface. | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Append Notes and Plan after the existing eight entries; each calls the existing helper with its verified key and opens the intended surface. Preserve Device disabled and all existing markup/dispatch. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | Owner: frontend implementer (same commit). Playwright check per VALIDATION. Done-when: pass. | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Keyboard Tab order matches visual order, Enter activates, 320px wraps without overflow, and both callback and context fallback paths work. A rejected opener exposes the existing error status and does not create a duplicate surface. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | Order: keep the current 8 buttons, then append "Notes" and "Plan" at the end of the grid, matching the Add-surface menu order. | Retained unchanged: Order: keep the current 8 buttons, then append "Notes" and "Plan" at the end of the grid, matching the Add-surface menu order. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R02 | `WorkspacePanelBodies` receives the same `PanelContext` as today; `addSurface('notes')` and `addSurface('plan')` use the existing `context.addSurface` API with the same string keys the menu uses. | SOURCE CORRECTED: append notes/plan actions through WorkspaceLauncher.openTool, using optional onOpenTool and the existing workspace.setActiveTab fallback with its sync/async error handling. No PanelContext/context.addSurface is introduced. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R03 | No icon changes; launcher buttons carry no icons today — text only. Decision: text-only labels "Notes" and "Plan", same `secondary` class. | SOURCE CORRECTED: preserve all eight existing icon/label/caption buttons. Retain the accepted text-only Notes/Plan additions unless the owner revises their presentation; the claim that current buttons have no icons is historical only. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R04 | Device button stays `disabled` as today; new buttons never disabled. | Retained unchanged: Device button stays `disabled` as today; new buttons never disabled. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R05 | Keyboard/screen reader: same `role="group"`/button semantics as existing buttons; Tab order = visual order. | SOURCE CORRECTED: retain the actual labelled Workspace launcher section and standard button semantics; Tab order follows visual order. An existing role=group must not be assumed or added as a source-fact repair. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R06 | Layout: buttons live in `.workspace-launcher` grid — verify at 320px panel width the grid wraps to one column without overflow (already wraps; assert no change needed beyond adding items). | Retained unchanged: Layout: buttons live in `.workspace-launcher` grid — verify at 320px panel width the grid wraps to one column without overflow (already wraps; assert no change needed beyond adding items). | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R07 | Reduced motion: no change; launcher has no animations. | Retained unchanged: Reduced motion: no change; launcher has no animations. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

No implementation PR or executed feature test is established in the current issue journal. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2110#issuecomment-7128867132). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `d3e283d67aa3b348aafc71b32ca8406163ce35ae63ae73b2d383bb52452b46ea`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2110)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2110#issuecomment-7128867132)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/WorkspacePanelBodies.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/WorkspacePanelBodies.tsx)
- [apps/web/src/WorkspaceSurfaceBody.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/WorkspaceSurfaceBody.tsx)
- [apps/web/src/workspace-context.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/workspace-context.tsx)
- [packages/contracts/workspace.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/workspace.ts)

## Retained complete original plan

# Plan: Add Notes and Plan entries to the "Open a surface" launcher

## META
- Feature: Launcher parity with the Add-surface menu in the workspace panel
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-24
- Baseline: main @ 9ddd536cc84c0f327ddf6133d485f8ab8baf294b
- Status: plan only, not implemented
- Source: code inspection of WorkspacePanelBodies.tsx lines 18–33 + fixture QA on http://127.0.0.1:4317

## OBJECTIVE
When the workspace panel has no surfaces open, the `WorkspaceLauncher` shows "Open a surface" with 8 hardcoded buttons (Terminal, Files, Diff, Pull request, Linked pull requests, Device — disabled, Executor output, Usage). The Add-surface dropdown menu offers additional surfaces including Notes and Plan, which the launcher omits — users landing on the empty panel cannot discover them without opening the dropdown.

**Measurable success:** the launcher lists every surface the Add-surface menu offers that is not environment-disabled: the existing 8 plus Notes and Plan, in the menu's own order.

## REQUIREMENTS
1. Order: keep the current 8 buttons, then append "Notes" and "Plan" at the end of the grid, matching the Add-surface menu order.
2. `WorkspacePanelBodies` receives the same `PanelContext` as today; `addSurface('notes')` and `addSurface('plan')` use the existing `context.addSurface` API with the same string keys the menu uses.
3. No icon changes; launcher buttons carry no icons today — text only. Decision: text-only labels "Notes" and "Plan", same `secondary` class.
4. Device button stays `disabled` as today; new buttons never disabled.
5. Keyboard/screen reader: same `role="group"`/button semantics as existing buttons; Tab order = visual order.
6. Layout: buttons live in `.workspace-launcher` grid — verify at 320px panel width the grid wraps to one column without overflow (already wraps; assert no change needed beyond adding items).
7. Reduced motion: no change; launcher has no animations.

## REPO_MAP
- `apps/web/src/WorkspacePanelBodies.tsx` lines 18–33 — `WorkspaceLauncher` hardcodes the 8 buttons.
- `apps/web/src/WorkspacePanel.tsx` (verify) — the Add-surface menu's surface list and the keys `'notes'`/`'plan'`; the receiver reads the menu's `addSurface` call to reuse the exact keys (menu verified live in fixture: "Notes" and "Plan" items present).
- `apps/web/src/task-memory.css` / workspace CSS — launcher grid styles.

## DESIGN
```tsx
<button type="button" className="secondary" onClick={() => context.addSurface('notes')}>Notes</button>
<button type="button" className="secondary" onClick={() => context.addSurface('plan')}>Plan</button>
```
appended after the Usage button inside the launcher group. If the launcher and the menu diverge again this is a defect; the follow-up (not this issue) is deriving the list from one source — out of scope here; this change only appends the two entries.

## EXECUTION_DAG
- T01 — Owner: frontend implementer. Add the two buttons with exact keys used by the Add-surface menu (read from WorkspacePanel.tsx menu definition). Done-when: launcher renders 10 buttons; each opens the corresponding surface.
- T02 — Owner: frontend implementer (same commit). Playwright check per VALIDATION. Done-when: pass.

## VALIDATION
- Fixture repro: `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; await openReviewHost('/tmp/genv1-x', 4317)"` → http://127.0.0.1:4317 → thread → workspace panel empty state.
- Playwright: assert "Notes" and "Plan" buttons exist; click "Notes" → Notes surface opens in panel; remove surface, click "Plan" → Plan surface opens.
- Keyboard: Tab through launcher reaches both new buttons; Enter activates.
- Negative: no duplicate entries vs the Add-surface menu.

## STATE
Plan complete; no implementation started.

## REFERENCES
- Issue: this issue. Files: apps/web/src/WorkspacePanelBodies.tsx, apps/web/src/WorkspacePanel.tsx.
