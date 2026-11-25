# DIA07: Measure flowchart fidelity, usefulness and browser cost

## META

`skytuhua-org/Gen-V1`; parent [#2230](https://github.com/skytuhua-org/Gen-V1/issues/2230) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R2/DIA07`, 2026-11-25. Kind: verification. Start: **BLOCKED**. Dependencies: [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-DIAGRAM-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-diagram-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

Revision history: [complete R1/DIA07](https://github.com/skytuhua-org/Gen-V1/blob/cdb703b94d73fd41abbe2d26aa5e88010700d976/docs/agent-plans/parallel-renderer-diagram-browser-cost-evidence.md), SHA-256 `032a2da70cc5f3580d4f9ca61590c8ec268a35110985868101b79dfeba0bb215`. R2 resolves [R-F02](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7174421781): DIA03/DIA09 supply isolated Worker and entry-only evidence; this task after DIA06 proves positive actual-App production graph/loading. Default-off, all thresholds and DIA08 packaged/offline/assistive gates are preserved.

## OBJECTIVE

Decide whether the exact flowchart candidate faithfully improves branch/cycle reading within browser cost limits, including positive emitted production Worker graph and local loading through the real assessed callers. Use the frozen corpus and source control; report failures without retuning the test set or treating a disabled/unreachable candidate as zero-cost success.

## REQUIREMENTS

All3 useful and>=16/20 held-out graphs must be admitted and faithful with no rewrites. Every admitted graph must match completely. On one named Windows machine/build collect10 cold and30 warm runs. No engine in initial entry; added lazy gzip<=750KiB; warm layout p95<=150ms; every accepted layout<=750ms; typing p95<=50ms AND<=baseline+16ms; no new attributable main-thread task>=50ms. Cache bounds/disposal are separate from gzip.

DIA06 must hand over the reviewed internal trial activation mechanism, exact candidate/gate identity and reachable main-assistant/assessed BoundMarkdown consumers. Production defaults remain off until DIA08 acceptance. This verifier cannot add a product flag, change the caller gate or silently enable production. If the accepted candidate only has an unreachable/compiled-out path, positive graph/loading rows are BLOCKED and return to the DIA06 owner. A default-off build is a negative control, not proof of a functional preview.

Require a nonempty actual-App emitted Worker/chunk graph, engine exclusion from initial loading, successful same-origin Worker startup/ready/job/reply and validated preview under the real existing server CSP. Entry-only builds, development fixtures, source inventory and missing-Worker/zero-request output cannot pass the positive row. Retain DIA09's exact artifact/closure/notices and DIA01's feasibility decisions; do not relax CSP or use UI-thread/CDN fallbacks. Native packaged Windows/offline proof remains DIA08.

Coverage: Diagram T06 browser/usefulness/performance; R01/R02/R05/R06/R09/R11/R12; A02/A03/A06/A07/A10/A11/A12 browser portions. Inherited requirements remain binding.

## REPO_MAP

Use DIA01 immutable corpus/expected certificates/build feasibility, DIA02 admission decisions, DIA03 isolated real Worker tests, DIA04 validator, DIA09 exact entry/package/notice inventory and DIA06 actual-App candidate plus literal-source baseline. This task owns report/test evidence only and proves the actual-App production graph/loading itself. ANC04 supplies actual-App detached-reading behavior; absence is a named adoption blocker. DIA08 owns packaged Windows/offline/assistive proof.

Read accepted [scripts/build.mjs](https://github.com/skytuhua-org/Gen-V1/blob/cdb703b94d73fd41abbe2d26aa5e88010700d976/scripts/build.mjs) and [vite.config.ts](https://github.com/skytuhua-org/Gen-V1/blob/cdb703b94d73fd41abbe2d26aa5e88010700d976/vite.config.ts): the normal `pnpm build` path emits `apps/web` to `dist/web`. Existing [tests/host-fixture.ts](https://github.com/skytuhua-org/Gen-V1/blob/cdb703b94d73fd41abbe2d26aa5e88010700d976/tests/host-fixture.ts) exports `test` and `HOST_URL`; its `host` fixture runs `buildServer(...,{dev:false})` on exclusive4337/4338 ports with owned teardown. Reuse that real production host and existing synthetic `taskFixture`/`serveTaskFixture` data in the allocated diagram-worker spec. No fixture implementation, new configuration/entry or product change is allocated.

Proposed outputs: `docs/review-evidence/parallel-renderers/diagram-browser.md`, `tests/e2e/diagram-worker.spec.ts`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Run the untouched3+20 corpus through full admission, engine graph and sanitized visible output equality. Record every rejected source/reason and any incorrect admitted diagram; one incorrect admitted diagram fails fidelity. Reproduce real busy-Worker termination, input progress, startup/crash/hidden owner/cancel/stale generation, queue/cache overflow/disposal and network interception, including encoded style/font payloads and repeated offline open. No mock substitutes for termination or network proof.

Before measurements, accept the DIA06 owner's documented internal gate setup and exact frozen enabled-trial candidate as well as the default-off/source control. Record their SHAs/build identities and gate values separately. Use only that already reviewed activation path; if unavailable, stop positive production verification as BLOCKED. A trial verification result neither changes the default-off production gate nor authorizes adoption. Keep unchanged corpus, caller identity and all safety checks in the trial build.

Trace each real pilot caller through Markdown/DiagramPreview/diagram-client's module Worker construction to emitted diagram-worker/engine chunks. Record the actual production files, URLs, hashes, complete local chunk graph and compressed costs against DIA09's source/package/notice inventory. Initial page/prose, default-off and ineligible/source-only controls must not start/load the engine. The positive admitted-trial case must load a same-origin Worker, complete the real ready/job/reply path and show the certificate-matched validated preview. Record actual CSP and request origins; no empty emission, missing consumer, source fallback screenshot or isolated fixture can count as positive production proof. Preserve local Inter/system-font checks and zero diagram-derived requests.

Add a `production diagram assets` group to the already allocated `tests/e2e/diagram-worker.spec.ts` using the existing host fixture's exported test and `host` parameter. Reuse DIA06's unchanged synthetic real-App data and navigate to absolute `HOST_URL`, rather than the micro-motion Vite baseURL or isolated diagram-worker.html. API routes remain synthetic via the existing helper; static application/Worker/chunk/font responses and server CSP remain actual production output. Observe requests before navigation, block external origins without blocking the owned local host and exercise both actual pilot callers. Keep host exclusive-port failure and teardown; do not edit the fixture or add a product test hook. Packaged Windows network/offline behavior remains DIA08 even when these browser local-origin checks pass.

Compare source and preview tasks on the same useful cases: identify Check->Retry's Plan destination in the agent flow; distinguish transient retry cycle from permanent Stop in the retry flow; trace the Approved path to Run and Result versus Denied in MCP approval. Use expected topology, record a named tester's correctness/errors/timing and concrete readability benefit, without invented study statistics. Source must be reachable unaided. Held-out examples keep their original expected graph and no post-result replacement.

Freeze control/candidate/trial-gate/toolchain/hardware/settings and collect10 cold/30 warm startup/layout/input/long-task/memory samples. Report distributions/failures and retained memory after all owners are disposed. Browser performance is measured on the named Windows machine; unsupported access is NOT_RUN, not a Linux substitute labelled Windows. Verify actual emitted initial/lazy compressed assets and local fonts through the reachable production trial, separately from entry-only build sizes. Measure actual-App delayed preview above detached reader on ANC04, preserving visible message offset<=2px, tail following, find/navigation and owner return.

Capture paired1920x1080 source/preview footage without inserted titles/overlays; captions outside identify SHAs/fixtures/settings. Light/dark/narrow/zoom/motion states have separate coverage. Gate failure is NO_ADOPT or a focused owner fix followed by affected rerun at a new frozen head.

## EXECUTION_DAG

**T01.** Pin exact corpus/control/candidate/package hashes, DIA09's entry/closure inventory, named Windows machine/browser/build and original thresholds. Accept DIA06's reviewed internal trial activation and real-consumer reachability, recording default-off versus enabled-trial identities; missing reachability blocks positive proof without a verifier-created flag. Freeze source/preview task answers before observing outcomes.

**T02.** Run full corpus equality and browser safety/lifecycle/network/real-Worker checks. Build and serve the actual trial application through the existing production host; inspect its emitted Worker/chunk graph, startup exclusion, real same-origin/CSP loading and positive validated preview in both pilot callers. Keep the disabled/ineligible source controls and separate DIA03 fixture proof. Record all rejected cases/errors; do not rewrite fixtures, broaden grammar or change product defaults.

**T03.** Perform the source-versus-preview branch/cycle tasks with a named tester, recording correctness and concrete benefit with source access preserved.

**T04.** Collect10 cold/30 warm cost samples, actual emitted production bytes/cache/teardown measurements and ANC04 detached-reader regression. Preserve raw distributions, exact trial gate/build identities and failures; entry-only or zero-emission sizes cannot pass application costs.

**T05.** Publish assigned original acceptance rows, actual-App import/Worker/chunk/notice inventory and exact remaining packaged/offline/AT evidence for [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300). Return defects and unreachable trial gates to their existing code owners; no implementation scope or implicit production enablement.

**Done when:** Finite report states complete graph fidelity/admission, positive actual-App production graph/loading, actual task benefit and measured cost or precise NO_ADOPT/blocker, retaining all rejected cases, raw samples and default-off/trial identities. An unreachable candidate or missing emitted Worker remains BLOCKED, not a zero-cost pass. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm build:widgets; diagram-policy/client and source unit suites; pnpm typecheck; pnpm build; micro-motion registered Markdown/diagram Worker/SVG/preview specs; workbench/workbench-app; conversation-scroll on ANC04; public-source.test.ts; pnpm check:docs-links. Require<=2px detached-anchor shift, no new scroll writer, full code/table/link/HTML/Files/find/source regressions and every resource/fidelity gate above. Planned counts are not runner results. Any unavailable native Windows cost environment is explicit BLOCKED for adoption.

For the frozen, reviewed enabled-trial candidate, run `pnpm build` then `pnpm exec playwright test --config tests/e2e/micro-motion.playwright.config.ts diagram-worker.spec.ts --grep 'production diagram assets'`. The named group explicitly consumes the existing host fixture and visits `HOST_URL` (`http://127.0.0.1:4337`), so the separately launched config Vite server is not production evidence. Preserve and compare the default-off/source control using its separately recorded build identity. Require nonempty emitted Worker/chunks, actual initial-entry exclusion, successful ready/job/reply/validated output, same-origin/local-font responses and unchanged CSP. Capture failed loading/blocked external-origin behavior without accepting fallback source as a successful preview. The existing scoped fixture tests continue proving real busy termination independently. No new test fixture, configuration, product flag or adoption enablement may be introduced to satisfy these rows; a changed host/gate contract is a specific coordinator blocker.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Needs the frozen DIA06 pilot and untouched corpus/control, reviewed internal trial activation with reachable actual callers, and DIA09's exact entry/package inventory. This task owns actual-App emitted graph/loading; isolated DIA03 proof cannot substitute. Production remains default-off pending DIA08, which retains packaged Windows/offline/assistive gates. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/issues/2218).
- [Reference 2](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/src/elk-instance.ts).
