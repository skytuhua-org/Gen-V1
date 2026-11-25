# DIA03: Bound diagram client scheduling, cancellation and cache lifetime

## META

`skytuhua-org/Gen-V1`; parent [#2230](https://github.com/skytuhua-org/Gen-V1/issues/2230) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/DIA03`, 2026-11-25. Kind: implementation. Start: **BLOCKED**. Dependencies: [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293), [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-DIAGRAM-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-diagram-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Schedule reviewed Worker jobs with exact identity, finite queue/cache and real cancellation deadlines. Worker-side engine/topology/package work belongs to DIA09, keeping this client deliverable independently reviewable.

## REQUIREMENTS

Consume DIA09's real Worker protocol; no engine import, main-thread fallback or async-name shortcut in this client. beautiful-mermaid1.1.3's async alias is synchronous; its ELK adapter bypasses FakeWorker scheduling and intercepts setTimeout during initialization. Actual Worker packaging/startup must be proven. No host bridge, credential, filesystem or tool authority in the worker. Diagram-derived requests forbidden; bundled same-origin chunks only.

Coverage: Diagram T03; R02/R04/R05/R06/R10; A02/A03/A05/A06/A10/A12. Inherited requirements remain binding.

## REPO_MAP

Create diagram-client.ts and focused unit/browser tests. DIA09 owns diagram-worker.ts, engine adapter, package/lock/notices and exact public protocol. DIA01 supplies actual production/packaged Worker/CSP paths; this task does not guess policy files or relax CSP. Browser fixture routing can substitute a real busy Worker without product test hooks.

Existing narrow hunks: `tests/e2e/micro-motion.playwright.config.ts`, `scripts/browser-suites.ts`.

Proposed outputs: `apps/web/src/diagram-client.ts`, `tests/diagram-client.test.ts`, `tests/e2e/diagram-worker.spec.ts`, `tests/e2e/diagram-worker-fixture.ts`, `tests/e2e/diagram-worker.html`, `tests/e2e/diagram-busy-worker.ts`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

DiagramJob=DiagramInput plus requestId:number,certificate:FlowCertificate,renderSource:string. DiagramReply carries requestId,scopeKey,generation and either {kind:'rendered',svg:string} or {kind:'source',reason:string}. Export requestDiagram(job,settle):()=>void and disposeDiagramScope(scopeKey):void. Client matches request/scope/generation plus exact current source and certificate; a digest only indexes cache, never proves equality.

Use one scheduler per webview: one active layout,<=4 queued jobs and<=4 automatic previews per Markdown owner. Cache totals across owners<=8 entries and<=1MiB; owner disposal/replacement removes only its jobs/cache. Changed source invalidates old SVG immediately. Active cancellation/crash/timeout terminates that Worker; remaining valid queued work may start a fresh instance without retrying the failed job. Hidden/inert/unmounted/changed owners schedule nothing and cancel current work.

DIA09 compares parseMermaid's complete logical graph/certificate before render. The client treats every returned SVG as untrusted until DIA04. Worker startup/import deadline2,000ms; layout deadline750ms from dispatch. Outer client terminates on deadline. Output<=256KiB; UI rechecks bounds before XML validation; DIA04 owns2,048elements/depth32/dimensions<=4,096. No unbounded queue/cache, idle retries or renderer-input cache shared across owners.

DIA09 supplies verified1.1.3 archive/closure/notices; this task does not change dependencies. Generated SVG is untrusted until DIA04 validates it; no connected DOM insertion from this task.

The isolated /tests/e2e/diagram-worker.html imports diagram-worker-fixture.ts. A test-only route can replace the engine-worker response with diagram-busy-worker.ts while retaining a real Worker: emit the ready handshake, then loop on a job to prove the outer750ms deadline terminates it. The production protocol is {kind:'ready'} after import plus DiagramReply for jobs; unknown/malformed messages fence the affected Worker. No product test hook or main-thread substitute is added.

## EXECUTION_DAG

**T01.** Consume DIA01 paths and DIA09's complete ready/job/reply contract. Claim only client and focused test/fixture/config hunks.

**T02.** Implement one-webview scheduler, exact request/scope/generation/source/certificate matching, queue/cache limits and owner disposal; hashes only index exact cache matches.

**T03.** Implement startup/layout deadlines, Worker termination on active cancel/crash/timeout, stale/duplicate/malformed reply handling and valid sibling continuation without failed-job retry.

**T04.** Add deterministic policy tests and real busy-Worker browser fixtures. Prove deadlines terminate actual work while input continues; fake timers alone cannot pass.

**T05.** Build the real new Worker(new URL(...,import.meta.url),{type:'module'}) edge and prove production-browser loading plus engine exclusion from the initial entry. Hand the bounded request/cancel/dispose API to [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297). Release client/fixture hunks; native path remains DIA08.

**Done when:** Finite client/scheduler/cache policy and real-browser Worker termination pass independently of Worker engine implementation, which remains DIA09-owned. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm build:widgets; pnpm exec vitest run tests/diagram-policy.test.ts tests/diagram-client.test.ts --maxWorkers=1; pnpm typecheck; pnpm build; registered diagram-worker.spec.ts via micro-motion config; public-source.test.ts. Real Worker must be terminated by startup/layout deadlines and input continues under a deliberately busy fixture. Test mismatched topology even when parse/render succeeds, huge output, collision with different source, late/duplicate replies and preserved other owners. Actual packaged Windows path is repeated by DIA08; a browser worker pass does not establish native acceptance.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Engine installation is gated by useful complete syntax admission and reviewed build/license feasibility. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/src/index.ts).
- [Reference 2](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/src/elk-instance.ts).
- [Reference 3](https://github.com/kieler/elkjs/blob/37e798513db6e88b2e205b8239ed4e387d5f24d0/LICENSE.md).
- [Reference 4](https://github.com/fb55/entities/blob/994259f32eba1c822c16da075656f745c493c560/LICENSE).
