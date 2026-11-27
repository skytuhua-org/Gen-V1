# INB04: Dismiss Inbox reader and continue explicit row navigation

## META

| Field | Value |
| --- | --- |
| Task / revision / date | INB04; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/2155 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | implementation; READY |
| Prerequisites | none |
| Original source | FRONTEND-INBOX-FOCUS-R1 at 0ccda0526baafe343bff33b72c7f103e600cc51e |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

Make accepted Back/Escape close the Inbox reader and return to the same existing row in both column modes. Subsequent explicit j/k/Arrow navigation starts from the focused row without automatic reselection.

## REQUIREMENTS

Own IF-R03/IF-R06, explicit-return portion of IF-R05 and A03/A06/A07. Eligible Escape with chosen set prevents default/stops propagation and uses the same dismissal as Back in both modes. Without chosen it preserves propagation. Search Escape only clears query, with IME/isComposing/keyCode229 guarding. Respect defaultPrevented, editable, combobox/listbox and nested-control ownership.

Correct source facts: chosen is string|undefined, rows.current is a Map, and shownColumns(false,undefined) returns BOTH. Add a local explicit-dismissal flag, not a global shownColumns change. Dismissal clears chosen using undefined, unmounts reader and exposes full-width data-columns=list. Resize cannot reopen it. Next explicit choose clears that flag and restores normal measured-container hysteresis: enter below860px, leave at892px.

Initial mount and automatic filtering retain canonical #1712 policy. Its issue says clear/no-reselect while design/PR1752 retain chosen; that contradiction is not settled here. Keep selected derivation, filter/query/read/unread/open behavior unchanged.

Preserve500ms read coalescing, activeReads dedup/unread ordering, actionVersion/error ownership and current source errors. Focus recovery adds no delay/animation/network/storage. Missing-row fallback is INB05; this leaf completes same-row return and exports its finite intent fence.

## REPO_MAP

apps/web/src/InboxView.tsx contains choose(), back(), keyboard(), reader/root/rows refs and source-owned actions. Baseline choose-to-reader/back each schedules an unguarded frame, Escape is single&&chosen, and navigation uses chosen rather than event's focused row.

tests/e2e/inbox-controls.spec.ts and existing fixture on5802 supply five synthetic rows/calls ledger and held actions. No fixture rewrite is needed for same-row dismissal tests. third-party/vespin/inbox-columns.ts remains unchanged; INB02 owns the separate current-token assertion.

## DESIGN

Add explicitDismissed local presentation state set only by accepted Back/Escape. back() keeps current timer cancellation/actionVersion/error clearing, sets chosen undefined and requests a guarded same-row return. Render reader conditionally absent while explicitDismissed and force list columns only for that state. choose() clears it before unchanged normal column selection.

Keep one ephemeral focus request {instanceGeneration,intentGeneration,kind:'return'|'reader',requestedId,source}. Record prior committed visible IDs and requested row's last relevant order for INB05. Replace both old frames with one postcommit layout effect or at most one pending frame. Before focus require same active instance/intent, visible owner, connected eligible target and no newer actual focus/pointer/keyboard/blur/document-hide intent. Consume token before its own focus event. Originating accepted action must not cancel itself.

Same-row return uses focus({preventScroll:true}) on rows.current requested button only after list renders. If missing/ineligible, do not focus body/section/container or choose another row here; retain the request context for INB05's resolver. A late choose-to-reader callback cannot override newer Back. No polling.

For j/k/Arrow event originating on a registered row button, derive traversal from that focused row ID first; otherwise preserve chosen-based behavior. Keep Home/End boundaries and explicit choose action. Existing editable/menu/defaultPrevented/IME guards run before navigation or Escape. Recovery itself never simulates a navigation key.

This leaf reserves only dismissal/keyboard/focus-request hunks. INB05 follows with missing-member recovery, not a permanent Inbox owner. Rollback scoped presentation/fence changes without undoing policy/transport fixes.

## EXECUTION_DAG

1. T01: Refresh #1712/#1752 and current Inbox claims; record unchanged selected-policy baseline and reproduce same-row/wide Escape failures on unmodified pinned main before repair, retaining SHA/red logs. Reserve exact InboxView/spec hunks.
2. T02: Add explicit-dismissal state, both-mode eligible Escape and conditional reader omission. Preserve source action/timer behavior and unchanged860/892 selector.
3. T03: Implement bounded focus request/generation for current-row return and choose-to-reader; add focused-row traversal context and IME/search/nested guards.
4. T04: Extend browser tests for both modes, Escape propagation/search/menu/IME, same-row focus then j, resize persistence and rapid choose/Back/user departure. Keep original read/unread/error tests.
5. T05: Run checks, publish exact fence/order handoff to INB05 and native evidence to INB06; release InboxView/spec hunks.

## VALIDATION

Run pnpm exec vitest run tests/inbox-presentation.test.ts --maxWorkers=1; pnpm exec playwright test --config tests/e2e/inbox-controls.playwright.config.ts; pnpm typecheck; pnpm build. Install page.clock before scheduling a read, then assert no call at499ms and one settled read at500ms. No real host requests/page errors in fixture.

V01 wide/narrow Escape clears chosen, reader unmounts, full list and same row visible focus. V02 next j uses focused row and chooses next once; ordinary mappings unchanged. V03 chosen absent Escape propagates; search/menu/editable/defaultPrevented/IME229 retain ownership. V04 choose restores normal layout; measure .agent-inbox at859/860 and880/892 in both hysteresis directions, not viewport shorthand. V05 newer intent cancels old return/reader frame; no focus/body theft. V06 read coalescing/dedup/unread ordering/error versions remain.

Inspect dark/light,320/390px,short height,app zoom100/125/150%,Reduced/Off with no new motion. Synthetic fixed-SHA1080p30 H264 before/after has no embedded titles/overlays and external captions/hashes. Native/AT remains INB06; checks are planned only.

## STATE

PLANNED; READY for independent explicit-dismissal behavior after finite hunk ACK. Automatic selected policy remains owned by #1712/PR1752. No code/test result. First action T01. INB05 consumes reviewed request/fence/order contract; missing-row acceptance is explicitly deferred to that dependency, not silently declared solved here.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/0ccda0526baafe343bff33b72c7f103e600cc51e/docs/agent-plans/frontend-inbox-focus-continuation.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- Next [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275), native [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276), token [INB02 #2272](https://github.com/skytuhua-org/Gen-V1/issues/2272).
- [Selection contradiction](https://github.com/skytuhua-org/Gen-V1/issues/1712), [PR1752](https://github.com/skytuhua-org/Gen-V1/pull/1752), [unaccepted-main cleanup](https://github.com/skytuhua-org/Gen-V1/issues/1712#issuecomment-7122835450).
