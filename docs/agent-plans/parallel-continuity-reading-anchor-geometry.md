# ANC02: Implement pure transcript reading-anchor geometry

## META

| Field | Value |
| --- | --- |
| Task / revision / date | ANC02; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/2218 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | implementation; READY |
| Prerequisites | none |
| Original source | FRONTEND-ANCHOR-R1 at 0ccda0526baafe343bff33b72c7f103e600cc51e |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

Implement a deterministic, DOM-free calculation for keeping a visible transcript message at its existing block-start offset. The module is independently testable and grants no ownership of the scroll controller or App.

## REQUIREMENTS

Own parent R01/R05 and the pure portion of A01/A05. Preserve primary, saved next, then saved previous fallback; never infer a tail jump. CSS pixels are the unit. No animation, time, DOM, network, persisted state, package or host contract.

Create the proposed internal apps/web/src/conversation-reading-anchor.ts and tests/conversation-reading-anchor.test.ts. This split changes only the location of the parent's proposed pure helpers, not their behavior. Register exact source entries and packaged runtime entry in scripts/public-source-files.json using a short manifest reservation. Do not touch unrelated inventory entries.

Before product edits, reproduce both original findings on pinned current main: detached message offset after earlier growth, and keyboard focus after final history-button removal. Use actual App's existing Find fixture; publish baseline SHA, expected/actual red output and a replayable temporary spec patch. If either does not reproduce, investigate and revise scope before adoption. Keep the temporary baseline patch as durable evidence; ANC04/ANC05 own final passing mounted regressions. Pure test drafting may proceed independently, but helper/controller adoption requires this baseline gate. Protected #1188/navigation hunks remain untouched.

## REPO_MAP

Existing apps/web/src/conversation-scroll.ts defines ConversationPosition={top:number;tail:boolean} and ConversationAnchor={height:number;top:number}. Those interfaces are unchanged. Existing tests/conversation-scroll.test.ts remains unchanged. Use tests/e2e/conversation-find.spec.ts only for the temporary baseline repro patch, with a finite test-hunk reservation.

New helper/test paths above are proposed, not present at the inspected baseline. ANC03 imports them into the existing controller. No App or renderer file is in scope.

## DESIGN

Export the exact proposed types/functions:

```ts
type ReadingMetric = { id: string; top: number; bottom: number };
type ReadingPoint = { id: string; offset: number };
type ReadingAnchor = {
  owner: string; primary: ReadingPoint;
  next?: ReadingPoint; previous?: ReadingPoint;
};
captureReadingAnchor(owner: string, rows: readonly ReadingMetric[], height: number): ReadingAnchor | null;
resolveReadingTop(anchor: ReadingAnchor, rows: readonly ReadingMetric[], top: number, maximum: number): number | null;
```

Rows are DOM ordered, with top/bottom relative to scrollport inner top (rect.top + clientTop), supplied by the future caller. Filter nonfinite/inverted geometry and later duplicate IDs without reordering. DOM visibility/zero-rect/owner filtering belongs to ANC03. Capture the first eligible row whose bottom>0 and top<height, with its possibly negative top offset; retain adjacent eligible next/previous IDs and offsets, even if neighbors lie outside the viewport. Invalid/nonpositive height or no intersection returns null.

Resolve using primary, then saved next, then saved previous, matching first valid current metric per ID. For the first surviving valid saved point return clamp(top + currentMetric.top - saved.offset, 0, maximum). Return null if none survives or numeric inputs are invalid (nonfinite top/maximum or negative maximum). Never sort by ID/position, substitute an unsaved neighbor or return zero merely because the primary vanished. Owner equality is the controller's responsibility. Do not mutate input arrays/anchor.

After a clamped result the caller must recapture reachable geometry to prevent drift; the pure function cannot read actual scrollTop. Equal total transcript height is irrelevant: changed candidate offsets still determine the correction.

## EXECUTION_DAG

1. T01: Confirm current main/source/claims and absent helper paths. In an isolated baseline checkout, record both actual-App red cases: +120px earlier growth must preserve detached offset;125 messages initially100 must recover focus after final-button removal. Publish replayable Find-spec patch/logs and scope disposition before product edits.
2. T02: Implement the two functions/types with no DOM or side effects. Add source/test and runtime inventory entries only for this module through a brief manifest hunk.
3. T03: Add table-driven tests for visible/tall/negative-offset capture, above/below growth, shrink, equal-total movement, duplicates/invalid rows, neighbor order, missing all and clamping. Assert input immutability.
4. T04: Run focused tests/typecheck, publish reviewed exact API/SHA and hand off ANC03. Release the manifest and helper reservation; do not claim the controller.

## VALIDATION

Run pnpm exec vitest run tests/conversation-reading-anchor.test.ts --maxWorkers=1 and pnpm typecheck. Run the existing source inventory checker named in CONTRIBUTING.md if inventory changed; discover its current command rather than inventing one. No browser/native check is needed to prove arithmetic and none is claimed here.

V00 both actual-main failures have pinned reproducible red evidence or an accepted scope revision before adoption. V01 tall first row preserves negative offset; next/previous are saved from eligible DOM order. V02 above changes produce exact delta; below append produces current top. V03 missing primary uses next then previous, no survivors gives null. V04 clamp at both bounds is exact; simulated recapture prevents repeated drift. V05 invalid numbers/duplicate IDs cannot yield NaN or wrong candidate. V06 owner is carried unchanged and inputs remain immutable. Positive/negative tests remain with this module, not a later testing ticket.

## STATE

PLANNED; READY for this pure module only. No implementation/test result yet. ANC03 is blocked until the exact reviewed API is available. Rollback removes only the unused module/test/inventory entries; once a consumer lands, revert its import first. First action T01; native/main geometry remains ANC04/ANC06 acceptance.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/0ccda0526baafe343bff33b72c7f103e600cc51e/docs/agent-plans/frontend-transcript-reading-anchor.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- Consumer [ANC03 #2264](https://github.com/skytuhua-org/Gen-V1/issues/2264), actual-App acceptance [ANC04 #2265](https://github.com/skytuhua-org/Gen-V1/issues/2265), native [ANC06 #2267](https://github.com/skytuhua-org/Gen-V1/issues/2267).
- [Protected scroll/App owner](https://github.com/skytuhua-org/Gen-V1/issues/1188#issuecomment-7058630319), [PR1203](https://github.com/skytuhua-org/Gen-V1/pull/1203).
