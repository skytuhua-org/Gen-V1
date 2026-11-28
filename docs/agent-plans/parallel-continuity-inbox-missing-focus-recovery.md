# INB05: Recover missing Inbox focus without stealing newer intent

## META

| Field | Value |
| --- | --- |
| Task / revision / date | INB05; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/2155 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | implementation; BLOCKED |
| Prerequisites | [INB03 #2273](https://github.com/skytuhua-org/Gen-V1/issues/2273), [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274) |
| Original source | FRONTEND-INBOX-FOCUS-R1 at 0ccda0526baafe343bff33b72c7f103e600cc51e |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

Recover focus after a currently owned Inbox row/control disappears, or explicit Back refers to a missing row, without selecting another item or stealing focus from newer user intent.

## REQUIREMENTS

Own IF-R04/IF-R05/IF-R07 and recovery portions of IF-R06/IF-R08, A04-A06. Use INB03 exact requested/next/previous/first order, then named Search Inbox and visible enabled Refresh inbox. All destinations must belong to the current document/Inbox, connected, enabled, displayed and outside hidden/inert ancestry. Never focus section, reader section, scroll container or body.

Recovery alone must not call choose, markRead, markUnread or onOpenThread, change chosen/reader/filter/query or invent a live announcement. Focus with preventScroll; if row is out of view, reveal minimally and immediately within .inbox-tasks-scroll only. No smooth scroll, centering or document movement.

Preserve500ms coalescing, activeReads/dedup, explicit unread ordering, actionVersion/errors and canonical open. Rejection leaves present focus alone; a late result affects focus only through actual owned-source removal under unchanged intent.

#1712/#1752 policy stays external: requirements say clear/no-reselect; design/candidate retain chosen. Main derives selected from attention.items; PR1752 from visible. Record accepted policy; never alter chosen or hide a reader to manufacture recovery. Only its policy-dependent case awaits disposition.

## REPO_MAP

apps/web/src/InboxView.tsx is the sole focus coordinator; consume INB04 request/fence/order contract and INB03 resolver. No useAttention, column selector or vendored presentation mutation.

Own tests/e2e/inbox-controls.spec.ts and fixtures/inbox-controls.tsx. Five IDs are question/review/failed/completed/resolved, with calls ledger and held read/unread/refresh/open. Extend for membership/order, hidden/unmounted owner and external focus only. inbox-controls.playwright.config.ts runs on5802 with network/pageerror guard.

## DESIGN

Track last actual focused source and prior committed visible-ID order separately from chosen/actionVersion. Sources may be registered row, reader control or the reader section that narrow choose() already focuses; sections are sources only, never destinations. Automatic repair requires that exact previously owned source to become removed/hidden in the current membership commit with unchanged intent. Body alone proves nothing. A refresh with still-visible source does nothing.

For explicit return, resolve requested ID/current eligible rows using the captured last order. If chosen leaves visible list while focus remains in reader, retain its last order until return, new explicit choice or disposal. Do not mutate chosen. If list remains hidden by canonical narrow reader policy, do not force list; only after actual owned focus becomes unavailable may visible named Inbox back button be a fallback. Entire hidden/disposed Inbox cancels.

Extend INB04's one instance/intent-generation request with kind=membership. Invalidate on meaningful focus/pointer/key intent, blur, document hide, owner deactivation/replacement/unmount or newer request. Removal-induced blur/body is distinguished from user focus to a real destination. Consume recovery before its own focus event. Both old Back and choose-to-reader paths use this same fence.

Reconcile after refs/visibility commit in a layout effect, at most one pending frame. Revalidate target/owner before focus. For visibility changes outside React, observe only current root/ancestor hidden/inert/aria-hidden/class/style with cleanup, never whole document. No polling/retry loop. Measure only target/list viewport for nearest reveal.

Proposed fixture helpers order/remove synthetic IDs, hide/unmount owner and focus an outside named input via React state. No private product-ref mutation or host call. Rollback reverts recovery/helper/tests only.

## EXECUTION_DAG

1. T01: Read INB03/INB04 reviewed APIs, canonical #1712 disposition and current claims. Reserve exact recovery/effect/fixture/spec hunks; reproduce missing-row and owned-removal failures on unmodified pinned main before repair; retain SHA/red logs and revise scope if either is absent.
2. T02: Add committed order/focus-source tracking and resolver binding, including named-control eligibility and retained reader order. Preserve all chosen/action authority.
3. T03: Extend single intent fence/lifecycle cleanup, once-only postcommit recovery and local nearest reveal. Reject stale callbacks before focusing.
4. T04: Add synthetic membership/owner controls and owning tests for first/middle/last/only deletion, missing Back, hidden/disabled rows, current reader vs external focus, held outcomes and rapid choose/Back.
5. T05: Run focused checks, publish exact reviewed code/logs/films to INB06, retain unresolved policy row explicitly and release Inbox/fixture ownership.

## VALIDATION

Run pnpm exec vitest run tests/inbox-focus.test.ts tests/inbox-presentation.test.ts --maxWorkers=1; pnpm exec playwright test --config tests/e2e/inbox-controls.playwright.config.ts; pnpm typecheck; pnpm build. Use page.clock before read scheduling:499ms no read,500ms one settled read. Record request/pageerror ledgers and actual counts; planned only here.

V01 same/next/previous/first/Search/Refresh order and visible named target, including missing Back. V02 no chosen/reader/filter/query/read/unread/open mutation from recovery. V03 removed-owned-source recovers once; still-visible reader/search/filter/external focus never moves. V04 Tab/pointer/new key/owner hide/unmount/window blur/document hide/rapid return invalidate every stale callback. V05 rejected read leaves focus, held completion after departure never steals; dedup/unread/error generations remain. V06 no hidden target/document scroll and no endless frame/listener loop. V07 next explicit j follows focused fallback, while recovery itself emits no action.

Check narrow canonical reader behavior without changing policy. Record synthetic fixed-SHA1920x1080/30fps/H.264 before/after, no titles/overlays, external captions/hashes. Native/AT remains INB06.

## STATE

PLANNED; BLOCKED on INB03/INB04 exact handoffs and finite recovery allocation. The unresolved #1712 policy gates only its policy-dependent case; do not claim it accepted or silently change it. No checks run. Start T01; done requires reviewed current-policy coverage and durable native handoff. Merge/main/native stay separate.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/0ccda0526baafe343bff33b72c7f103e600cc51e/docs/agent-plans/frontend-inbox-focus-continuation.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- Inputs [INB03 #2273](https://github.com/skytuhua-org/Gen-V1/issues/2273), [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274), verifier [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276).
- [Policy owner](https://github.com/skytuhua-org/Gen-V1/issues/1712), [PR1752](https://github.com/skytuhua-org/Gen-V1/pull/1752), [timeout scope](https://github.com/skytuhua-org/Gen-V1/issues/1926), [error placement scope](https://github.com/skytuhua-org/Gen-V1/issues/2154).
