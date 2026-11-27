# MTH08: Implement the pure owner-scoped math render queue

## META

`skytuhua-org/Gen-V1`; parent [#2229](https://github.com/skytuhua-org/Gen-V1/issues/2229) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/MTH08`, 2026-11-25. Kind: implementation. Start: **READY**. Dependencies: None.

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-MATH-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-math-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Enforce one expression render per frame, finite node budget and cancellation-safe ownership independently of React and KaTeX. The helper must not leave hidden polling work or let one leaf clear a newer owner's state.

## REQUIREMENTS

One queue per owner instance, at most64 admitted jobs and one synchronous render callback per animation-frame callback. Current accepted element total<=8,192 and per result<=2,048. No DOM/global observer, source cache, engine import, retry loop or shared macro state. Only MTH03 owns visibility/selection listeners and connected DOM.

Coverage: Math T03 scheduling; R06/R07/R09; A06/A07/A09. Inherited requirements remain binding.

## REPO_MAP

Both output files are proposed. MTH01 fixes admission64expressions/32,768source units and MTH02 fixes renderMath's result shape. This helper consumes opaque callbacks and strings, so it is independently executable before those modules exist. MTH03 owns React integration and actual DOM lifecycle proof.

Proposed outputs: `apps/web/src/math-render-queue.ts`, `tests/markdown-math-queue.test.ts`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Freeze createMathRenderQueue(ownerKey:string,sourceRevision:number,schedule?:{request:(cb:()=>void)=>number,cancel:(id:number)=>void}):MathRenderQueue. Default scheduler uses requestAnimationFrame/cancelAnimationFrame; tests inject a deterministic frame driver. MathRenderQueue={enqueue(job):MathRenderHandle,invalidate(ownerKey:string,sourceRevision:number):void,resume():void,dispose():void}; MathRenderHandle={cancel:()=>void,release:()=>void}. Both closures bind the exact owner/revision/job token, never just leafKey.

Job fields: ownerKey:string,sourceRevision:number,leafKey:string,raw:string,mode:'inline'|'display',tex:string,isCurrent:()=>boolean,eligible:()=>boolean,render:(remainingNodes:number)=>{kind:'rendered',elements:number}|{kind:'source',reason:'parse'|'budget'|'engine'},commit:()=>void,fail:(reason:'parse'|'budget'|'engine')=>void. The leaf captures detached/connected targets in closures; the queue never inspects DOM. Callback isCurrent includes mounted/current effect/target/source checks; eligible includes current visibility and nonintersecting selection. Reject mismatched owner/revision even if callbacks incorrectly report true.

Process pending jobs in source insertion order, skipping temporarily ineligible jobs without busy polling. Stop scheduling when all remaining jobs are deferred; MTH03 calls resume after owner visibility/selection changes. Before render and before commit recheck owner/revision/current/eligibility. Only one render callback per frame. Enforce integer nonnegative element counts and per-expression/remaining aggregate bounds before commit; failed results never consume accepted budget. Exceptions become fixed engine failure for that still-current job.

handle.cancel removes only its pending job; handle.release removes only that token's accepted count after the leaf removes its generated nodes. Old handles cannot release a replacement with the same leafKey. invalidate cancels pending frames/jobs and replaces active owner/revision, but preserves all accepted token counts until their handles release them. Retained unchanged siblings stay counted across revisions and need no enqueue. New work uses the remaining budget including those siblings. dispose permanently cancels; MTH03 removes generated islands and releases handles before disposing. No automatic retry. Failed/stale jobs consume no accepted count.

## EXECUTION_DAG

**T01.** Write decision tests with a controlled frame driver for the frozen API, owner/revision, job-token and node-accounting rules.

**T02.** Implement bounded insertion-order scheduling and deferred resume with one render/frame and zero frames when all pending work is ineligible.

**T03.** Implement identity checks, cancellation/release/invalidate/dispose and per-leaf/aggregate node accounting. Catch callback exceptions without clearing sibling/new-owner state.

**T04.** Run below/at/above2,048/8,192nodes and64jobs, stale-handle release after same-key replacement, repeated revisions retaining accepted siblings, deferred resume and100cleanup cycles. Publish the exact API to [MTH03 #2280](https://github.com/skytuhua-org/Gen-V1/issues/2280) and release this pure module.

**Done when:** Independently tested callback contract and finite queue implementation are ready for the leaf, with no engine or UI integration needed. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm build:widgets; pnpm exec vitest run tests/markdown-math-queue.test.ts --maxWorkers=1; pnpm typecheck. Positive: eligible jobs progress one/frame, deferred jobs resume, unchanged accepted siblings retain accounting. Negative: old owner/revision/token, duplicate cancel, dispose/resume, thrown render, oversized/nonfinite node counts and queue overflow cannot commit or clear newer work. After revisions retaining accepted nodes, new jobs still respect the remaining8,192 budget. After removal/release across100cycles, handles/jobs/budget return to zero. Fake frames prove policy only; MTH03/MTH06 prove real DOM and browser responsiveness.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**READY:** Pure new scheduler/budget helper has a frozen callback contract and no engine, DOM or caller dependency. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/SentenceReveal.tsx).
