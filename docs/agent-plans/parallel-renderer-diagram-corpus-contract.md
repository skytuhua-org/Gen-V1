# DIA01: Freeze useful flowcharts and the Worker feasibility contract

## META

`skytuhua-org/Gen-V1`; parent [#2230](https://github.com/skytuhua-org/Gen-V1/issues/2230) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/DIA01`, 2026-11-25. Kind: discovery. Start: **READY**. Dependencies: None.

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-DIAGRAM-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-diagram-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Freeze a fair usefulness corpus and the actual Worker/owner/completion contract before tuning or installing the engine. The deliverable settles independent build feasibility and source-admission decisions, not routine setup for another task.

## REQUIREMENTS

No engine installation or product enablement. Produce exactly a frozen corpus JSON plus a complete decision record. All3 useful scenarios and at least16/20 held-out examples must eventually be admitted and faithfully rendered unchanged; this task freezes inputs, not a success claim. Preserve exact source/provenance. Do not select held-out examples based on whether Gen's narrow grammar accepts them.

Coverage: Diagram T01; R01/R04/R09/R10/R11; A01/A03/A05/A12. Inherited requirements remain binding.

## REPO_MAP

Discover actual Worker/CSP/desktop packaging paths with git ls-tree/rg and pinned reads; vite.config.ts and scripts/build.mjs are starting points, not evidence of packaged Worker support. Existing main assistant and registry BoundMarkdown are the pilot callers; each needs a verified local owner/revision. Modal is packages/ui-shell/Modal.tsx. #2218 owns reflow; math/remend adoption is independent.

Proposed outputs: `tests/fixtures/diagram-adoption-corpus.json`, `docs/implementation/diagram-adoption-contract.md`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Corpus JSON records id,purpose,source,provenance and expected direction/ordered nodes/ordered edge multiset. Freeze these3 useful scenarios as exact LF text, with CRLF copies as fidelity variants:
```text
flowchart TD
Input[Receive request]
Plan[Plan work]
Tool[Run tool]
Check[Check result]
Done[Return result]
Input --> Plan
Plan --> Tool
Tool --> Check
Check -->|Pass| Done
Check -->|Retry| Plan
```
```text
flowchart LR
Start[Attempt request]
Result[Inspect result]
Retry[Retry request]
Stop[Report failure]
Done[Return success]
Start --> Result
Result -->|Success| Done
Result -->|Transient| Retry
Retry --> Result
Result -->|Permanent| Stop
```
```text
flowchart TD
Request[MCP tool requested]
Approval[Ask approval]
Run[Run approved tool]
Denied[Report denial]
Result[Return tool result]
Request --> Approval
Approval -->|Approved| Run
Approval -->|Denied| Denied
Run --> Result
```
For20 held-out ordinary examples, use the pinned Mermaid12.3.0 repository2086904e76c692331e34a45d7cc3bc30860d040e. Discover its actual flowchart docs/example paths; sort by path then opening line and take the first20 distinct, syntactically valid graph/flowchart examples with2-12 explicit node IDs, excluding only exact duplicates and empty/oversized examples. Do not filter on Gen grammar or rewrite unsupported syntax. Record every skipped candidate and reason plus immutable source/line provenance; annotate expected topology/labels independently. If20 cannot be obtained under that fixed procedure, record BLOCKED rather than manufacture fixtures. Freeze hashes before DIA02.

Decision record fixes actual production/packaged module-Worker/CSP loading path, entry-only build command/cost, tested dependency closure/licensing route, per-caller owner/revision and finality evidence, source-body slicing boundary and a removed-Expand-trigger focus fallback to a verified surviving control. Each must cite real paths/symbols or explicit unknown. Unknown finality means newline-only eligibility, never known-final from defaultfalse/runId. No remend prerequisite.

Trial pin: beautiful-mermaid1.1.3@65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b; actual closure screen includes elkjs0.11.0 EPL-2.0 and entities7.0.1 BSD-2-Clause, engine MIT. Source ranges are not proof of future installed closure. Record notices/distribution handling without claiming automatic incompatibility. Worker infeasibility or unavailable ownership/fidelity proof gives a precise NO_ADOPT/blocker, never CSP relaxation.

## EXECUTION_DAG

**T01.** Read full parent/candidate/owner journals; inspect actual eligible callers, Modal restoration, Worker/CSP/build/desktop paths and license closure. Reserve only the two documentation/fixture outputs.

**T02.** Record source-only baseline/copy for eligible and excluded surfaces; verify actual local owner/revision and final/static proof or explicit unknown. Fix the surviving-control focus fallback from real DOM ownership.

**T03.** Write the3 exact useful graphs and select20 held-out examples by the deterministic procedure. Independently annotate expected topology, provenance and rejected acquisition candidates; freeze corpus hashes before adaptation.

**T04.** Verify a real same-origin module Worker can load on the actual production/packaged route using the existing supported test/build mechanism. Record exact commands/path or a reproducible feasibility blocker; do not install the layout engine yet.

**T05.** Publish the complete contract/corpus and proceed, BLOCKED or NO_ADOPT disposition for [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294)/[DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295). Routine future claim/baseline refresh remains their own first step. Release this discovery scope.

**Done when:** The corpus and integration/build contracts are immutable and sufficiently exact for separate policy/Worker/presentation workers, or a precise early NO_ADOPT/BLOCKED record preserves source behavior. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Acceptance requires the two retrievable artifacts with exactly3 useful+20 held-out entries or an explicit acquisition blocker, independently checkable expected graphs, exact build/CSP/packaging paths/commands and owner/finality/focus decisions. Reproduce exact source/copy positive controls and excluded/missing-owner negative controls. Module Worker feasibility is a real build observation, not a mock or engine-runtime pass. Source-derived findings, browser results and packaged results must be labelled separately.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**READY:** Independent frozen corpus, owner/finality and Worker/CSP feasibility decision before engine installation. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/mermaid-js/mermaid/tree/2086904e76c692331e34a45d7cc3bc30860d040e).
- [Reference 2](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/package.json).
- [Reference 3](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/packages/ui-shell/Modal.tsx).
