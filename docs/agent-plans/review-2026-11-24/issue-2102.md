# Current complete handoff revision for #2102

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2102-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2102](https://github.com/skytuhua-org/Gen-V1/issues/2102). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `1ca53c67a7b18882e2e76d5c1581941c7b5ee256aed53c77058fb800e37f7aac`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

Replace the unresolved #new issue reference with #2101. The proposed single queued structural operation with first-wins semantics conflicts with T01 requiring all 20 mixed commands to apply. Decide explicit admission/serialization behavior before implementation; dropped structural work must not be reported as success. Retry only an identified revision-conflict result after discovering its typed boundary, never an arbitrary message containing revision. Inspect the actual command reducer before asserting empty-title filtering or root normalization is the correct repair; render-time filtering cannot conceal lost data.

Verified relevant source: `apps/web/src/WorkspaceSplitLayout.tsx`, `apps/web/src/split-tool-placement.ts`, `apps/web/src/workspace-split.css`, `packages/core/split-workspace-layout.ts`, `packages/contracts/split-workspace.ts`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: T01/T02 are BLOCKED on queue capacity and structural-command admission semantics. T04 is discovery-gated until the reported view/root defects are reproduced in the authoritative reducer. These holds do not remove any recovery invariant.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | revision accessor + single retry-on-conflict inside `run`/`send` (`WorkspaceSplitLayout.tsx`). Done-when: rapid-fire 20 mixed commands → zero stale-revision errors, all applied. | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Discover the authoritative revision/error contract and pin an explicit queue policy. Verify revision acquisition after preparation and at actual send time, one retry only for confirmed conflict, and no replay for unrelated failures. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | op queue replacing the silent drop (same file). | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Hold one request in flight while issuing mixed resize and structural commands. Account for every admitted command, coalesce only policy-permitted resize updates and explicitly reject any nonadmitted request; never silently lose a view. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T03 owner. |
| T03 | error dedupe + Dismiss on every banner + friendly copy (same file + `.split-error` CSS if needed). | T02 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T03. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Duplicate failures render one friendly message; Dismiss works; retry-in-progress produces no raw engine banner; retry failure shows the agreed copy. | AC-T03 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T04 owner. |
| T04 | root normalization for single-pane case + empty-title tab render guard; unit tests on the layout reducer for both. | T03 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T04. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Reproduce the single-root/empty-title cases in the actual reducer, then preserve all view identities across success and failure. Verify a lone root fills the container without hiding malformed records as a substitute for repair. | AC-T04 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | In: optimistic concurrency fixed end-to-end — commands always carry the freshest `layout.revision`; a server revision conflict triggers one automatic `prepare` + retry before surfacing an error; identical error text deduped into a single banner; views/tabs never dropped or created empty; a pane left alone in the tree fills the container. | Retained unchanged: In: optimistic concurrency fixed end-to-end — commands always carry the freshest `layout.revision`; a server revision conflict triggers one automatic `prepare` + retry before surfacing an error; identical error text deduped into a single banner; views/tabs never dropped or created empty; a pane left alone in the tree fills the container. | T01, T02, T03, T04 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03, AC-T04 |
| R02 | Out: keyboard-resize fix (#new issue, filed same pass), aria bounds (#1833), detach/restore (#1721). | Retained unchanged: Out: keyboard-resize fix (#new issue, filed same pass), aria bounds (#1833), detach/restore (#1721). | T01, T02, T03, T04 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03, AC-T04 |
| R03 | Error copy, exact: while retrying show nothing; if the retry also fails show "Couldn't apply that change — the layout changed. Try again." with a working Dismiss. Never show the raw engine string "The layout revision changed. Refresh before applying this operation." to users. | Retained unchanged: Error copy, exact: while retrying show nothing; if the retry also fails show "Couldn't apply that change — the layout changed. Try again." with a working Dismiss. Never show the raw engine string "The layout revision changed. Refresh before applying this operation." to users. | T01, T02, T03, T04 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03, AC-T04 |
| R04 | Dedupe: the same message text never renders more than one banner; repeat occurrences keep one banner (optionally suffix "×N", muted 10px). | Retained unchanged: Dedupe: the same message text never renders more than one banner; repeat occurrences keep one banner (optionally suffix "×N", muted 10px). | T01, T02, T03, T04 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03, AC-T04 |
| R05 | Recovery invariant: after any failed or retried command, every pane still has its views, no `""` tabs exist, and a single root pane renders at 100% width/height of `.split-workspace`. | Retained unchanged: Recovery invariant: after any failed or retried command, every pane still has its views, no `""` tabs exist, and a single root pane renders at 100% width/height of `.split-workspace`. | T01, T02, T03, T04 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03, AC-T04 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

No implementation PR or executed feature test is established in the current issue journal. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2102#issuecomment-7126232411). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `1ca53c67a7b18882e2e76d5c1581941c7b5ee256aed53c77058fb800e37f7aac`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2102)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2102#issuecomment-7126232411)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/WorkspaceSplitLayout.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/WorkspaceSplitLayout.tsx)
- [apps/web/src/split-tool-placement.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/split-tool-placement.ts)
- [apps/web/src/workspace-split.css](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/workspace-split.css)
- [packages/core/split-workspace-layout.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/split-workspace-layout.ts)
- [packages/contracts/split-workspace.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/split-workspace.ts)

## Retained complete original plan

# UI: Split-area commands race the layout revision — "layout revision changed" banners, dropped views, lost panes

## META
- Repo: skytuhua-org/Gen-V1 · baseline `main@9ddd536` · plan rev 2026-11-24-r1 · filed from live QA pass 33 on built fixture `http://127.0.0.1:4317` (scenario "Workspace & settings").

## OBJECTIVE
Every split-workspace command (`pane.resize`, `pane.split`, `view.open`, `view.park`, `view.move`, `pane.join`, `pane.collapse`, `pane.focus`) is sent with `baseRevision: layout.revision` captured at the last render (`WorkspaceSplitLayout.tsx` ~L101 `send`). Any second command issued before the layout prop refreshes carries a stale revision. Observed symptoms in one 10-second burst of interactions: two stacked "The layout revision changed. Refresh before applying this operation." error banners, one banner missing a working Dismiss, an extra untitled `""` tab appearing in a pane, and the conversation pane disappearing entirely (both panes rendered "Empty area"), leaving a single pane pinned at 617px with ~400px of dead canvas.

## REQUIREMENTS
- In: optimistic concurrency fixed end-to-end — commands always carry the freshest `layout.revision`; a server revision conflict triggers one automatic `prepare` + retry before surfacing an error; identical error text deduped into a single banner; views/tabs never dropped or created empty; a pane left alone in the tree fills the container.
- Out: keyboard-resize fix (#new issue, filed same pass), aria bounds (#1833), detach/restore (#1721).
- Error copy, exact: while retrying show nothing; if the retry also fails show "Couldn't apply that change — the layout changed. Try again." with a working Dismiss. Never show the raw engine string "The layout revision changed. Refresh before applying this operation." to users.
- Dedupe: the same message text never renders more than one banner; repeat occurrences keep one banner (optionally suffix "×N", muted 10px).
- Recovery invariant: after any failed or retried command, every pane still has its views, no `""` tabs exist, and a single root pane renders at 100% width/height of `.split-workspace`.

## REPO_MAP
- `apps/web/src/WorkspaceSplitLayout.tsx`: `send` (~L101) freezes `layout.revision` per render; `run` (~L87) drops ops while `pending.current` is set; `setError` (one string) vs observed multiple stacked banners — error rendering code shows both an alert div and banner div; `splitPane`/`joinPane`/view ops all route through `send`.
- `apps/web/src/split-tool-placement.ts` `toolPlacementCommand`: computes `basis` from the layout passed in — same staleness window.
- `apps/web/src/workspace-split.css` `.split-error`/banner styles.
- Server/host side: `apps/web/src` layout store/`onCommand` handler (discovery: locate `pane.resize`/`view.open` handler that rejects on `baseRevision` mismatch).

## DESIGN
1. `send` reads revision lazily: pass a `getRevision()` accessor (latest committed revision from the layout store) rather than the render prop, so queued commands always send the freshest base.
2. Retry once on revision conflict: in `run`, catch a conflict-class error (status/code or message match `/revision/i` at the boundary that raised it), `await prepare?.()` then re-issue the command with the new revision before surfacing failure.
3. Queue instead of drop: while `pending.current`, hold at most one queued op (latest wins for `pane.resize`; first wins for structural ops); execute it when the current op settles.
4. Dedupe banners: `setError` keyed by message text; rendering a second identical error replaces/extends the existing banner; every banner gets a working `✕ Dismiss` button clearing exactly that entry.
5. Guard the lost-pane path: when a pane-remove leaves exactly one pane, normalize the root to a `pane` node (never a `split` with one child) so it fills the container; assert `Object.keys(layout.panes).length===1 → layout.root.kind==='pane'` after every applied command.
6. Tab integrity: a `view.open`/`view.move` commit must include a non-empty `title`; empty-title tabs are a bug at the data layer — filter `title:''` tabs at render as a belt-and-braces log, not a fix.

## EXECUTION_DAG
- T01: revision accessor + single retry-on-conflict inside `run`/`send` (`WorkspaceSplitLayout.tsx`). Done-when: rapid-fire 20 mixed commands → zero stale-revision errors, all applied.
- T02: op queue replacing the silent drop (same file).
- T03: error dedupe + Dismiss on every banner + friendly copy (same file + `.split-error` CSS if needed).
- T04: root normalization for single-pane case + empty-title tab render guard; unit tests on the layout reducer for both.

## VALIDATION
Fixture: open scenario, script rapid interactions (split, park, join, resize, editor open ×5 within 2s) — expect zero error banners, no lost views, no untitled tabs, single-pane fills width. Unit: reducer tests for revision-conflict retry and single-pane normalization. Manual Dismiss click on an injected error.

## STATE
Filed by `devin-cloud-33f02a`; verified symptom list in OBJECTIVE; root cause located at `send` L101. No code written.

## REFERENCES
- Related: #1966 (layout resilience/recovery — adjacent, not dup), #1833, #1721.
