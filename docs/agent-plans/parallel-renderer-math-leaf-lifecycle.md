# MTH03: Own formula leaf visibility, selection and source presentation

## META

`skytuhua-org/Gen-V1`; parent [#2229](https://github.com/skytuhua-org/Gen-V1/issues/2229) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/MTH03`, 2026-11-25. Kind: implementation. Start: **BLOCKED**. Dependencies: [MTH01 #2278](https://github.com/skytuhua-org/Gen-V1/issues/2278), [MTH02 #2279](https://github.com/skytuhua-org/Gen-V1/issues/2279), [MTH08 #2301](https://github.com/skytuhua-org/Gen-V1/issues/2301).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-MATH-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-math-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Bind admitted formulas to a reviewed owner-scoped queue, committing output only to a still-current visible leaf with no intersecting selection. Own the React/CSS/source presentation; MTH08 independently owns scheduling and budget decisions.

## REQUIREMENTS

Consume MTH08's one queue per Markdown instance, one render/frame and8,192-element instance bound. Do not reimplement its scheduler. Only the module-loading promise is shared. No global text/output/macros cache, automatic retry, focus/scroll, modal, animation, live token status or extra inline tab stops. Source is immediately visible and Send/Stop never await the queue.

Coverage: Math T03 lifecycle and T04 presentation; R04/R06/R07/R08/R09; A04/A06/A07/A08/A09. Inherited requirements remain binding.

## REPO_MAP

MarkdownMath.tsx, markdown-math.css and focused browser fixtures/tests are new. MTH08 owns math-render-queue.ts and its unit tests. Existing CopyButton is reused. Node Vitest has no assumed jsdom; lifecycle/selection/network checks use a registered scoped browser harness with fixture files allocated to this task, not invented Node DOM support. [MTH04 #2281](https://github.com/skytuhua-org/Gen-V1/issues/2281) will supply queue ownership and markers to actual Markdown.

Existing narrow hunks: `tests/e2e/micro-motion.playwright.config.ts`, `scripts/browser-suites.ts`.

Proposed outputs: `apps/web/src/MarkdownMath.tsx`, `apps/web/src/markdown-math.css`, `tests/e2e/markdown-math-leaf.spec.ts`, `tests/e2e/markdown-math-leaf-fixture.tsx`, `tests/e2e/markdown-math-leaf.html`.

Refresh claims and reserve only these hunks. Keep unrelated feature adoption independent.

## DESIGN

Each pending job captures owner, revision, leafKey/position, mode, raw source, effect generation and connected target. Commit only while all match and visibility/selection allows. Cancel queued/import continuations before cleanup. Keep accepted output and its handle across source-revision changes only when owner, leafKey, mode, raw and target are unchanged. Revision cleanup cancels pending work, never releases retained output. Owner change, disable or unmount removes old generated islands and releases their handles before reset/disposal.

Check connected, hidden/inert ancestors and document visibility before starting and committing. Deferred work keeps raw source; one bounded owner listener/observer resumes pending leaves on eligibility and disconnects when idle/unmounted. A selection intersecting the leaf defers replacement until collapse/movement outside, using one owner-scoped selection listener. Never collapse the user's selection or synthesize offsets. invalidate cancels pending work but preserves accepted token counts until output removal and handle.release; late cleanup cannot release a replacement token.

The whole leaf carries data-markdown-math; accepted generated output additionally has data-source-transformed="true". Wrap display controls/duplicate source in data-source-selection-ui. Display uses native details with summary Formula source and existing CopyButton labelled Copy formula source, copying span.raw including delimiters/CRLF. Inline adds no repeated controls. Fixed display failure text: Math display unavailable. Source shown. No raw exception is rendered.

Use htmlAndMathml; preserve MathML and hide the visual duplicate from assistive output as the engine intends, with later real-screen-reader verification. Normal inline size/baseline, display flow and labelled horizontal overflow are allowed; no transform-to-fit or nested vertical scroller. Neutral light/dark/forced colors and all motion modes are static.

Freeze useMathRenderOwner(ownerKey:string,sourceRevision:number,enabled:boolean):MathRenderOwner and MarkdownMathProps={span:MathSpan,leafKey:string,ownerKey:string,sourceRevision:number,owner:MathRenderOwner}. MathRenderOwner={queue:MathRenderQueue,registerPending:(leafKey:string,target:HTMLElement)=>()=>void}. It keeps the pending leaf set for one owner observer/listener group; leaves unregister on settle/cleanup. Consume MTH08 enqueue's {cancel,release} token-bound handle plus invalidate/resume/dispose. The queue owns no DOM; never reset its budget while retained generated nodes remain. The isolated /tests/e2e/markdown-math-leaf.html imports markdown-math-leaf-fixture.tsx using the verified generated-selects.html Vite React preamble pattern.

## EXECUTION_DAG

**T01.** Consume reviewed MTH01 span, MTH02 renderMath and MTH08 queue contracts. Create the isolated browser fixture and leaf props; do not edit the queue implementation.

**T02.** Implement MarkdownMath plus useMathRenderOwner in the same module. The latter creates/disposes one MTH08 queue and one bounded owner listener/observer set for pending visibility/selection deferral.

**T03.** Build exact source disclosure/CopyButton, fixed failure text, scoped CSS and markers. Prepare detached output through renderMath; queue guards run current identity/eligibility checks before connected commit.

**T04.** Test delayed import, replacement/removal, unmount, hidden/inert restore and selection deferral. Repeated source revisions retain accepted siblings and their node budget; old release cannot clear a same-key replacement. Verify100-cycle cleanup.

**T05.** Run the focused browser/engine/queue checks, hand useMathRenderOwner and MarkdownMath props to MTH04, and release only leaf/CSS/fixture hunks.

**Done when:** React leaf/CSS and owner visibility-selection lifecycle pass real-browser checks using MTH08's independently tested queue. Production caller and platform gates remain downstream. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm build:widgets; pnpm exec vitest run tests/markdown-math-queue.test.ts tests/markdown-math-renderer.test.ts --maxWorkers=1; pnpm typecheck; pnpm build. Register markdown-math-leaf.spec.ts in the existing micro-motion config and scripts/browser-suites.ts using a brief reservation, then run it with that config. Assert one engine call per frame, zero stale commits, source preserved on all errors/bounds, zero listener/observer/queue growth after100 lifecycle cycles, selection in unrelated prose unchanged and no newly generated DOM in hidden owners. DOM accessibility checks are preparatory, not manual AT acceptance.

Planned. Use Node>=24.10.0/pnpm10.30.3 and repository widget/browser setup. Browser tests do not establish native or assistive acceptance.

## STATE

**BLOCKED:** Needs reviewed span and detached-engine contracts; neither exists on current main. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/CopyButton.tsx).
