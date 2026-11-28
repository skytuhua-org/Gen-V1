# ANC03: Add opt-in reading compensation to the existing scroll controller

## META

| Field | Value |
| --- | --- |
| Task / revision / date | ANC03; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/2218 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | implementation; BLOCKED |
| Prerequisites | [ANC02 #2263](https://github.com/skytuhua-org/Gen-V1/issues/2263) |
| Original source | FRONTEND-ANCHOR-R1 at 0ccda0526baafe343bff33b72c7f103e600cc51e |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

Add an opt-in reading-anchor mode to the existing single scroll writer. A detached idle reader remains at the same message offset after reflow; newer manual/navigation intent always wins.

## REQUIREMENTS

Own R01-R05/R07-R08 and controller portions of A01-A05/A07-A08. Consume ANC02's two actual-main baseline reproductions or accepted scope revision before controller edits. No behavior change for callers without readingRoot. Existing ConversationPosition/ConversationAnchor, tail spring, near-tail<80 behavior, pointer custody, restore/prepend and owned-scroll suppression remain compatible. Keep overflow-anchor:none; no application/native double compensation.

Only active visible main owner can compensate. Exclude disconnected/zero-rect roots/rows, hidden/inert/aria-hidden ancestry and unrelated nested transcript owners. Owner switch/hide/disposal cancels queued callbacks immediately. One pending callback per owner, batched reads then at most one immediate write; no recurring frame loop, per-row observer, deep rebinding or full row scan per streamed byte.

Compensation is immediate for Full/System/Reduced/Off and does not create a token/spring, change focus/selection, announce or dispatch an action. Manual wheel/touch/native/rail/key intent invalidates first; foreign pointer release cannot end another drag. Explicit navigation and Jump invalidate stale work before moving.

External gate: #1188 claim7058630319 remains unreleased and PR1203 open. Obtain exact hunk allocation and refresh #1649's navigation seam; disposition requires neither adoption nor overwrite.

## REPO_MAP

Edit only apps/web/src/conversation-scroll.ts and its tests/conversation-scroll.test.ts plus tests/e2e/conversation-scroll.spec.ts. Import ANC02's new pure helper. Existing observeConversationExtent observes element/immediate children and coalesces child/text changes; preserve its no-rebind-on-deep-mutation discipline.

No App/Find/renderer edit. ANC04 supplies active root/map callback; existing controller/manual APIs remain.

## DESIGN

Add optional options {readingRoot?:(owner:string)=>HTMLElement|null; onPositionChange?:(owner:string,position:{top:number;tail:false},reason:'reading-compensation')=>void}. Default disables anchoring. Retain only current anchor, three candidate element refs and intent generation. Capture may walk mounted message rows once; invalidation reads retained candidates first, rebuilding membership only on capture/disappearance.

Extend observeConversationExtent with optional third argument {geometryAttributes?:boolean}, default false. Opted-in controller observes open/hidden/class/style alongside child/text changes, covering equal-total-height movement. Filter own/noisy mutations and do not rebind on every deep edit. Observe only current owner's bounded ancestor chain for hidden/inert/aria-hidden/class/style/open or use verified synchronous owner notification; never scan the whole document.

On invalidation, validate generation/owner/idle presentation before reads, resolve ANC02 geometry and write only if delta exceeds 1px. Mark the write owned. Immediately call onPositionChange with actual clamped scrollTop while owner/generation is still valid. Re-capture after clamp/no survivors; preserve current clamped top if none survives.

Ordering: owner restore/prepend cancels pending, applies existing top/height delta once, then captures. Tail following never reading-compensates. Manual gesture cancels and suspends through drag/touch; normal accepted manual scroll/release recaptures. Only detached active idle owner compensates; below growth writes nothing.

Add beginNavigation():number, endNavigation(token):ConversationPosition|null and readingAnchor():ReadingAnchor|null. Begin invalidates correction/tail and returns current generation token. End accepts only matching owner/token, records actual top with tail:false, suppresses duplicate scroll and recaptures; stale end returns null. New input/owner/Jump/dispose invalidates. Getter returns a read-only snapshot, not mutable controller state.

## EXECUTION_DAG

1. T01: Read ANC02 reviewed API and current owner/candidate diff; obtain bounded controller/test allocation. Reproduce existing tail/manual/restore behavior before editing.
2. T02: Add optional anchor/callback/navigation methods and retained-candidate geometry. Preserve defaults and existing write/owned-scroll machinery.
3. T03: Add bounded observer opt-in/lifecycle invalidation and manual/navigation priority. Dispose every queued frame/observer/listener on replacement/hide/unmount.
4. T04: Extend unit and mounted-controller tests for offsets/equal-total mutations, callback persistence payload, stale owner/tokens, clamp and scheduling cost; retain all original manual/tail regressions.
5. T05: Run checks, publish exact API/candidate/results and hand off ANC04. Release controller ownership after integration.

## VALIDATION

Run pnpm exec vitest run tests/conversation-reading-anchor.test.ts tests/conversation-scroll.test.ts --maxWorkers=1; pnpm exec playwright test --config tests/e2e/conversation-scroll.playwright.config.ts; pnpm typecheck. Record actual results and baseline failures. No physical/native claims from this fixture.

V01 <=1px retained offset for growth/shrink/image-size/width/equal-total changes; below append zero writes. V02 next/previous/missing/clamp work. V03 callbacks carry actual top/owner/tail:false once; no duplicate user scroll event. V04 input/restore/prepend/navigation/Jump wins and prepend applies once. V05 hidden/inert/foreign/nested/stale owners do no work. V06 one queued callback, reads precede write, no idle loop/per-row observes/full scan per byte, the existing500-deep-mutation case and new geometry-attribute batches do not rebind. V07 all policies correct immediately and tail/near-tail/pointer identity regressions pass.

## STATE

PLANNED; BLOCKED on ANC02 and current protected-hunk allocation. No code/tests run. An unavailable owner ACK blocks controller edits, not pure work elsewhere. Rollback disables optional anchor mode and removes its observer/callback state without reverting unrelated navigation fixes. First action T01; ANC04 receives exact backward-compatible API and accepted test results.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/0ccda0526baafe343bff33b72c7f103e600cc51e/docs/agent-plans/frontend-transcript-reading-anchor.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- Input [ANC02 #2263](https://github.com/skytuhua-org/Gen-V1/issues/2263), consumer [ANC04 #2265](https://github.com/skytuhua-org/Gen-V1/issues/2265), native [ANC06 #2267](https://github.com/skytuhua-org/Gen-V1/issues/2267).
- [Controller claim](https://github.com/skytuhua-org/Gen-V1/issues/1188#issuecomment-7058630319), [PR1203](https://github.com/skytuhua-org/Gen-V1/pull/1203), [prompt navigation PR1649](https://github.com/skytuhua-org/Gen-V1/pull/1649).
