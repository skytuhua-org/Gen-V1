# INB03: Implement deterministic Inbox row focus destination

## META

| Field | Value |
| --- | --- |
| Task / revision / date | INB03; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/2155 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | implementation; READY |
| Prerequisites | none |
| Original source | FRONTEND-INBOX-FOCUS-R1 at 0ccda0526baafe343bff33b72c7f103e600cc51e |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

Implement a pure, deterministic choice of row ID for focus recovery after the requested row disappears. The result changes focus destination only; it never selects an Inbox item or changes read state.

## REQUIREMENTS

Own the row-order portion of IF-R04/A04. Prefer requested same row if eligible, then first surviving following row in its prior visible order, nearest preceding row, and finally first eligible current row. Return null when none. Do not choose by new array index, sorted ID, geometry or selected state.

Create proposed apps/web/src/inbox-focus.ts and tests/inbox-focus.test.ts. The helper takes IDs already filtered for DOM eligibility by INB05. It has no DOM/focus call, selection/filter/query/read/unread/open callback, timer/network/storage/dependency or owner-policy decision. No #1712 policy interpretation is required.

Register exact source/test and module runtime entries in scripts/public-source-files.json under a brief inventory reservation. No other source manifest edits or InboxView changes belong to this leaf.

## REPO_MAP

Current apps/web/src/InboxView.tsx has rows.current Map<string,HTMLButtonElement>, visible order derived from attention/filter/query and chosen:string|undefined. Back currently looks up the same row; no reusable missing-row resolver exists.

New helper/test paths are proposed, not verified existing files. INB05 owns eligibility, order snapshots and invoking focus; INB04 supplies explicit-dismissal intent. tests/e2e/fixtures/inbox-controls.tsx supplies future actual membership cases but is read-only here.

## DESIGN

Export exactly this proposed internal function:

```ts
resolveInboxFocusId(
  requestedId: string | undefined,
  priorVisibleIds: readonly string[],
  eligibleCurrentIds: readonly string[],
): string | null;
```

Treat eligibleCurrentIds as current committed DOM order with disabled/hidden/foreign/disconnected targets already removed. Build membership without changing order; duplicate IDs use first occurrence. If requestedId exists there, return it.

Otherwise find requestedId's first occurrence in priorVisibleIds. Scan forward from the next prior slot for the first current eligible member; if none, scan backward for nearest prior eligible member. When requestedId was not in prior order or neither neighbor survives, return first eligibleCurrentIds entry. If empty return null. Do not treat another chosen ID as a substitute and do not mutate arrays.

INB05 adds named Search Inbox then enabled visible Refresh inbox fallbacks for null, or the canonical narrow reader's visible Inbox back button only when actual owned focus became unavailable and the list is hidden. Those are DOM decisions outside this helper. A section/body/scroll container is never a destination.

Saved order belongs to the focus operation, not global selection. When chosen leaves the list while focus is in its reader, binder retains that last order until return/new explicit choice/disposal; this helper merely consumes the provided snapshot. Output null does not authorize a tail/page/document jump or selection change.

## EXECUTION_DAG

1. T01: Read parent exact fallback order/current source and confirm proposed paths. Publish pure-module allocation and API for INB05.
2. T02: Implement side-effect-free resolver and exact source/runtime inventory additions. No UI import/dependency is needed.
3. T03: Add table-driven first/middle/last/only-row cases, absent requested ID, reordering, multiple removals, ineligible-filtered rows, duplicates and immutable inputs.
4. T04: Run focused tests/typecheck, publish reviewed SHA/API and handoff INB05. Release inventory reservation.

## VALIDATION

Run pnpm exec vitest run tests/inbox-focus.test.ts --maxWorkers=1; pnpm typecheck. Use current source-inventory validation from CONTRIBUTING.md if changed; no browser/native result is implied.

Required examples: requested b, prior[a,b,c,d], current[a,c,d] returns c; current[a,d] returns d; current[a] returns a; current[x] returns x; empty returns null. If b still eligible in current[c,b,a], return b. If requested is absent from prior, return first current. Ineligible rows omitted by caller cannot be returned. Duplicates preserve first occurrence and arrays stay unchanged.

V01 exact same/next/previous/first/null order. V02 newly reordered current list does not replace saved-neighbor precedence. V03 no mutation or action side effect. V04 API/source/runtime entries are reviewed and retrievable. Mounted visibility/scroll/focus/native checks belong to INB05/INB06. All planned checks NOT_RUN here.

## STATE

PLANNED; READY independent of #1712 selection choice. No code/tests yet. First action T01. INB05 is blocked until this exact helper is accepted. Rollback removes unused helper/test/entries, or its consumer first after integration. Do not hold an InboxView or whole-feature claim.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/0ccda0526baafe343bff33b72c7f103e600cc51e/docs/agent-plans/frontend-inbox-focus-continuation.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- Consumer [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275), dismissal [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274), native [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276).
- [Parent focus contract](https://github.com/skytuhua-org/Gen-V1/issues/2155), [retained selection policy owner](https://github.com/skytuhua-org/Gen-V1/issues/1712).
