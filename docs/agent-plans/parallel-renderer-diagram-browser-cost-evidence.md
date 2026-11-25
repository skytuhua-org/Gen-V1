# DIA07: Measure flowchart fidelity, usefulness and browser cost

## META

`skytuhua-org/Gen-V1`; parent [#2230](https://github.com/skytuhua-org/Gen-V1/issues/2230) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/DIA07`, 2026-11-25. Kind: verification. Start: **BLOCKED**. Dependencies: [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-DIAGRAM-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-diagram-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Decide whether the exact flowchart candidate faithfully improves branch/cycle reading within browser cost limits. Use the frozen corpus and source control; report failures without retuning the test set.

## REQUIREMENTS

All3 useful and>=16/20 held-out graphs must be admitted and faithful with no rewrites. Every admitted graph must match completely. On one named Windows machine/build collect10 cold and30 warm runs. No engine in initial entry; added lazy gzip<=750KiB; warm layout p95<=150ms; every accepted layout<=750ms; typing p95<=50ms AND<=baseline+16ms; no new attributable main-thread task>=50ms. Cache bounds/disposal are separate from gzip.

Coverage: Diagram T06 browser/usefulness/performance; R01/R02/R05/R06/R09/R11/R12; A02/A03/A06/A07/A10/A11/A12 browser portions. Inherited requirements remain binding.

## REPO_MAP

Use DIA01 immutable corpus and expected certificates, DIA02 admission decisions, DIA03 real Worker tests, DIA04 validator, DIA06 actual-App candidate and literal-source baseline. This task owns report/test evidence only. ANC04 supplies actual-App detached-reading behavior; absence is a named adoption blocker. Production/platform Worker and licensing inventory comes from DIA01/DIA03, not inferred from a demo.

Proposed outputs: `docs/review-evidence/parallel-renderers/diagram-browser.md`, `tests/e2e/diagram-worker.spec.ts`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Run the untouched3+20 corpus through full admission, engine graph and sanitized visible output equality. Record every rejected source/reason and any incorrect admitted diagram; one incorrect admitted diagram fails fidelity. Reproduce real busy-Worker termination, input progress, startup/crash/hidden owner/cancel/stale generation, queue/cache overflow/disposal and network interception, including encoded style/font payloads and repeated offline open. No mock substitutes for termination or network proof.

Compare source and preview tasks on the same useful cases: identify Check->Retry's Plan destination in the agent flow; distinguish transient retry cycle from permanent Stop in the retry flow; trace the Approved path to Run and Result versus Denied in MCP approval. Use expected topology, record a named tester's correctness/errors/timing and concrete readability benefit, without invented study statistics. Source must be reachable unaided. Held-out examples keep their original expected graph and no post-result replacement.

Freeze control/candidate/toolchain/hardware/settings and collect10 cold/30 warm startup/layout/input/long-task/memory samples. Report distributions/failures and retained memory after all owners are disposed. Browser performance is measured on the named Windows machine; unsupported access is NOT_RUN, not a Linux substitute labelled Windows. Verify initial/lazy compressed assets and local fonts. Measure actual-App delayed preview above detached reader on ANC04, preserving visible message offset<=2px, tail following, find/navigation and owner return.

Capture paired1920x1080 source/preview footage without inserted titles/overlays; captions outside identify SHAs/fixtures/settings. Light/dark/narrow/zoom/motion states have separate coverage. Gate failure is NO_ADOPT or a focused owner fix followed by affected rerun at a new frozen head.

## EXECUTION_DAG

**T01.** Pin exact corpus/control/candidate/package hashes, named Windows machine/browser/build and the original thresholds. Freeze source/preview task answers before observing outcomes.

**T02.** Run full corpus equality and browser safety/lifecycle/network/real-Worker checks. Record all rejected cases and errors; do not rewrite fixtures or broaden grammar.

**T03.** Perform the source-versus-preview branch/cycle tasks with a named tester, recording correctness and concrete benefit with source access preserved.

**T04.** Collect10 cold/30 warm cost samples, bytes/cache/teardown measurements and ANC04 detached-reader regression. Preserve raw distributions and failures.

**T05.** Publish assigned original acceptance rows and exact remaining packaged/AT evidence for [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300). Return defects to code owners; no implementation scope or implicit production enablement.

**Done when:** Finite report states complete graph fidelity/admission, actual task benefit and measured cost or precise NO_ADOPT/blocker, retaining all rejected cases and raw samples. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm build:widgets; diagram-policy/client and source unit suites; pnpm typecheck; pnpm build; micro-motion registered Markdown/diagram Worker/SVG/preview specs; workbench/workbench-app; conversation-scroll on ANC04; public-source.test.ts; pnpm check:docs-links. Require<=2px detached-anchor shift, no new scroll writer, full code/table/link/HTML/Files/find/source regressions and every resource/fidelity gate above. Planned counts are not runner results. Any unavailable native Windows cost environment is explicit BLOCKED for adoption.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Needs the frozen pilot candidate and untouched corpus/control. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/issues/2218).
- [Reference 2](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/src/elk-instance.ts).
