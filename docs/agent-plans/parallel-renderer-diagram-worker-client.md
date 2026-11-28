# DIA03: Bound diagram client scheduling, cancellation and cache lifetime

## META

`skytuhua-org/Gen-V1`; parent [#2230](https://github.com/skytuhua-org/Gen-V1/issues/2230) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R2/DIA03`, 2026-11-25. Kind: implementation. Start: **BLOCKED**. Dependencies: [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293), [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-DIAGRAM-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-diagram-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

Revision history: [complete R1/DIA03](https://github.com/skytuhua-org/Gen-V1/blob/cdb703b94d73fd41abbe2d26aa5e88010700d976/docs/agent-plans/parallel-renderer-diagram-worker-client.md), SHA-256 `dfe0b203ba079ec11ae8e2a2b1c8291271e101c5da35a87a1f57985aa2981650`. R2 resolves [R-F02](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7174421781): this task proves the isolated Worker/client and entry-only build; [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299), after DIA06 supplies real consumers, proves the actual-App production graph/loading. All dependencies, budgets, default-off and adoption gates are retained.

## OBJECTIVE

Schedule reviewed Worker jobs with exact identity, finite queue/cache and real cancellation deadlines. Prove startup and real busy-Worker termination in the allocated isolated fixture, with DIA01's explicit entry-only build evidence. Worker-side engine/topology/package work belongs to DIA09; actual-App production loading belongs to DIA07 after caller integration.

## REQUIREMENTS

Consume DIA09's real Worker protocol; no engine import, main-thread fallback or async-name shortcut in this client. beautiful-mermaid1.1.3's async alias is synchronous; its ELK adapter bypasses FakeWorker scheduling and intercepts setTimeout during initialization. Actual Worker entry construction/startup and termination must be proven in this isolated scope. No host bridge, credential, filesystem or tool authority in the worker. Diagram-derived requests forbidden; bundled same-origin chunks only.

Do not certify the actual-App production graph from this fixture or from an ordinary build before consumers exist. DIA05 supplies the preview leaf and DIA06 binds actual callers; DIA07 then owns positive emitted application/Worker graph, initial-entry exclusion and same-origin/CSP loading evidence. Keep those rows NOT_RUN here. DIA08 retains packaged Windows/offline proof. No new entry, fixture, configuration or product scope is added by this correction.

Coverage: Diagram T03; R02/R04/R05/R06/R10; A02/A03/A05/A06/A10/A12. Inherited requirements remain binding.

## REPO_MAP

Create diagram-client.ts and focused unit/browser tests. DIA09 owns diagram-worker.ts, engine adapter, package/lock/notices and exact public protocol. DIA01 supplies actual production/packaged Worker/CSP paths; this task does not guess policy files or relax CSP. Browser fixture routing can substitute a real busy Worker without product test hooks.

The current allocated `diagram-worker.html` imports the client fixture, not actual App consumers. Use DIA01's reviewed entry-only Worker command and output path for built-entry evidence, and the existing scoped browser configuration for the already allocated fixture. The normal `pnpm build` remains a regression check at this stage; absent consumers can leave the engine out for the wrong reason. DIA07 receives this isolated evidence plus DIA09's source/package inventory, and independently inspects the later real application build.

Existing narrow hunks: `tests/e2e/micro-motion.playwright.config.ts`, `scripts/browser-suites.ts`.

Proposed outputs: `apps/web/src/diagram-client.ts`, `tests/diagram-client.test.ts`, `tests/e2e/diagram-worker.spec.ts`, `tests/e2e/diagram-worker-fixture.ts`, `tests/e2e/diagram-worker.html`, `tests/e2e/diagram-busy-worker.ts`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

DiagramJob=DiagramInput plus requestId:number,certificate:FlowCertificate,renderSource:string. DiagramReply carries requestId,scopeKey,generation and either {kind:'rendered',svg:string} or {kind:'source',reason:string}. Export requestDiagram(job,settle):()=>void and disposeDiagramScope(scopeKey):void. Client matches request/scope/generation plus exact current source and certificate; a digest only indexes cache, never proves equality.

Use one scheduler per webview: one active layout,<=4 queued jobs and<=4 automatic previews per Markdown owner. Cache totals across owners<=8 entries and<=1MiB; owner disposal/replacement removes only its jobs/cache. Changed source invalidates old SVG immediately. Active cancellation/crash/timeout terminates that Worker; remaining valid queued work may start a fresh instance without retrying the failed job. Hidden/inert/unmounted/changed owners schedule nothing and cancel current work.

DIA09 compares parseMermaid's complete logical graph/certificate before render. The client treats every returned SVG as untrusted until DIA04. Worker startup/import deadline2,000ms; layout deadline750ms from dispatch. Outer client terminates on deadline. Output<=256KiB; UI rechecks bounds before XML validation; DIA04 owns2,048elements/depth32/dimensions<=4,096. No unbounded queue/cache, idle retries or renderer-input cache shared across owners.

DIA09 supplies verified1.1.3 archive/closure/notices; this task does not change dependencies. Generated SVG is untrusted until DIA04 validates it; no connected DOM insertion from this task.

The isolated /tests/e2e/diagram-worker.html imports diagram-worker-fixture.ts. A test-only route can replace the engine-worker response with diagram-busy-worker.ts while retaining a real Worker: emit the ready handshake, then loop on a job to prove the outer750ms deadline terminates it. The production protocol is {kind:'ready'} after import plus DiagramReply for jobs; unknown/malformed messages fence the affected Worker. No product test hook or main-thread substitute is added.

Record the isolated fixture URL, the exact `new Worker(new URL(...,import.meta.url),{type:'module'})` edge, actual ready/job/reply observation and busy-Worker termination separately from the entry-only build command/files. Neither a fixture import nor an empty normal application build proves actual-App startup exclusion or successful production consumer loading. Hand those unrun acceptance rows explicitly to DIA07; do not add an application caller here to obtain them early.

## EXECUTION_DAG

**T01.** Consume DIA01's exact entry-only build/fixture paths and DIA09's complete ready/job/reply contract. Claim only client and the existing allocated focused test/fixture/config hunks; distinguish this isolated proof from later actual-App graph acceptance.

**T02.** Implement one-webview scheduler, exact request/scope/generation/source/certificate matching, queue/cache limits and owner disposal; hashes only index exact cache matches.

**T03.** Implement startup/layout deadlines, Worker termination on active cancel/crash/timeout, stale/duplicate/malformed reply handling and valid sibling continuation without failed-job retry.

**T04.** Add deterministic policy tests and real busy-Worker browser fixtures. Prove deadlines terminate actual work while input continues; fake timers alone cannot pass.

**T05.** Exercise the real new Worker(new URL(...,import.meta.url),{type:'module'}) edge in the allocated isolated browser fixture and inspect DIA01/DIA09's built entry and local chunk mapping. Record actual startup/ready/termination evidence and the exact build command. Hand the bounded request/cancel/dispose API to [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297), with actual-App production graph/loading and initial-entry exclusion explicitly pending [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299) after DIA06. Release client/fixture hunks; packaged/native path remains DIA08.

**Done when:** Finite client/scheduler/cache policy, isolated real-browser Worker startup/termination and reviewed entry-only build evidence pass. Worker engine implementation remains DIA09-owned; actual-App production graph and packaged acceptance remain named downstream gates. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm build:widgets; pnpm exec vitest run tests/diagram-policy.test.ts tests/diagram-client.test.ts --maxWorkers=1; pnpm typecheck; pnpm build; registered diagram-worker.spec.ts via micro-motion config; public-source.test.ts. Run DIA01's exact entry-only build separately and retain its output/command identity. Real Worker must be terminated by startup/layout deadlines and input continues under a deliberately busy fixture. Test mismatched topology even when parse/render succeeds, huge output, collision with different source, late/duplicate replies and preserved other owners. Mark actual-App production emitted graph, initial-entry exclusion and real-consumer CSP/loading NOT_RUN until DIA07; an ordinary successful no-consumer build cannot pass them. Actual packaged Windows/offline path is repeated by DIA08; isolated browser Worker evidence establishes neither actual-App nor native acceptance.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Engine installation is gated by useful complete syntax admission and reviewed build/license feasibility. This client task covers isolated Worker behavior and the reviewed entry-only build; DIA07 after DIA06 owns actual-App production graph/loading, and DIA08 owns packaged/offline acceptance. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/src/index.ts).
- [Reference 2](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/src/elk-instance.ts).
- [Reference 3](https://github.com/kieler/elkjs/blob/37e798513db6e88b2e205b8239ed4e387d5f24d0/LICENSE.md).
- [Reference 4](https://github.com/fb55/entities/blob/994259f32eba1c822c16da075656f745c493c560/LICENSE).
