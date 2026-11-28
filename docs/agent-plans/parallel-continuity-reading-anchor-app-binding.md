# ANC04: Bind main transcript geometry and explicit navigation ownership

## META

| Field | Value |
| --- | --- |
| Task / revision / date | ANC04; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/2218 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | implementation; BLOCKED |
| Prerequisites | [ANC03 #2264](https://github.com/skytuhua-org/Gen-V1/issues/2264) |
| Original source | FRONTEND-ANCHOR-R1 at 0ccda0526baafe343bff33b72c7f103e600cc51e |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

Connect the accepted reading controller to the actual visible main transcript, persist its corrected position and make explicit Find or integrated navigation win before any automatic correction.

## REQUIREMENTS

Own App portions of R01-R04/R07-R10 and A01-A04/A07-A10. ANC02's dual actual-main baseline evidence is required before product adoption. Only the active visible main wrapper supplies rows; retained hidden threads, nested unrelated owners and inactive main/detached views must not participate. Preserve message/artifact keys, drafts, text selection, Find query/index/focus, source authority/history cache/errors and input/Send/Stop responsiveness.

Accepted corrections update the existing in-memory readingPositions map before switching owner. They must not call remember(), toggle latest-available, set announcements, dispatch actions or create persistent storage. Navigation invalidates pending correction before geometry/scroll. Restore/prepend apply their current delta once; no double compensation.

Refresh #1188/PR1203, prompt #1581/PR1649, bookmark #1473/PR1509 and Find #1969/PR2062. Use accepted APIs; unmerged candidates require disposition, not adoption. Reserve wrapper/controller/navigation seams only. MTH05/STR04/STR05/DIA06 own AssistantProse/CanvasThread flags.

No source renderer, layout model, history authority, host/schema/dependency/network or new scroll writer. Final-history focus is ANC05, not this leaf.

## REPO_MAP

apps/web/src/App.tsx holds readingPositions, conversationMotion, activeHistoryControl, history anchors, main .conversation-scroll and retained per-thread wrapper. At baseline controller construction takes no options; history commit and owner restore occur in its layout effect. MainConversationFind onNavigate clears latest-available.

apps/web/src/ConversationFind.tsx validates a match then reads rects/writes scrollTop and calls onNavigate. It needs an optional before-navigation hook only at that validated point. tests/e2e/conversation-find.spec.ts uses actual App/shell fixtures and count=125 history. Extend those real components.

## DESIGN

Supply readingRoot(owner) by direct reference or marker data-conversation-owner={historyId} on the active main wrapper. Compare ID values directly, never interpolate IDs into selectors. Resolver verifies connected/visible main ancestry, active owner and excludes nested transcript roots. Preserve existing wrapper/message keys.

Construct the ANC03 controller with onPositionChange(owner,position,'reading-compensation') that performs only readingPositions.current.set(owner,position). Check current owner before storing. Only controller validates/writes. App does not repeat geometry/remember(); restore/prepend completes before capture.

Add optional onBeforeNavigate to ConversationFind, invoked after a valid match/root is known but before rect reads/scroll. App begins a token there, then ends it in existing onNavigate, stores the accepted actual position and preserves current latest-clear behavior. Invalid matches call neither hook. Existing consumers without the prop stay unchanged.

When integrated PR1649 is present, reuse its actual before-navigation/cancel/settled seam and keep anchoring suspended through navigateTo completion. Coordinate bookmark seek similarly with PR1509. Do not add pretend APIs to an unmerged branch or delay unrelated ready work. New manual intent invalidates tokens; stale completion cannot restore old position.

Test renderer-driven geometry even without changed text/total height; renderers never write scroll. Rollback removes only this main opt-in/navigation wiring.

## EXECUTION_DAG

1. T01: Read ANC03 exact API, current App/Find owners and actual merged candidate seams. Reserve finite wrapper/layout-effect/Find-hook/test blocks and record unintegrated navigation dispositions.
2. T02: Add direct active-owner root delivery and map-only accepted-correction callback. Keep current restoration/prepend order and stable DOM keys.
3. T03: Add validated Find before/after hooks and adapt only actually integrated prompt/bookmark seams. Preserve Find scheduling/highlight/query behavior and no-op defaults.
4. T04: Extend actual App fixture with growth/shrink, delayed registry Image resource, width/equal-total changes, hidden retained owners and pending navigation/owner switch. Include draft/selection/Find state invariants.
5. T05: Run focused checks, publish reviewed candidate/test/geometry evidence and hand off ANC05/ANC06 plus renderer verifiers. Release shared hunks.

## VALIDATION

Run pnpm build:widgets; pnpm exec vitest run tests/conversation-scroll.test.ts tests/conversation-find.test.ts --maxWorkers=1; pnpm exec playwright test --config tests/e2e/conversation-find.playwright.config.ts; pnpm exec playwright test --config tests/e2e/conversation-scroll.playwright.config.ts; pnpm typecheck; pnpm build. Use scoped-conversation.playwright.config.ts when checking inactive/retained owner integration; it requires msedge, whose absence is an honest blocker.

V01 actual main message offset stays within1px for above growth/shrink/image/width/equal-total reflow, below append writes nothing. Use actual registry Image with delayed resource; Markdown image syntax is not an accepted substitute. V02 correction persists through switch/return without new announcement/latest state. V03 Find/accepted prompt/bookmark/Jump/manual/restore/prepend win a pending frame; prepend compensates once. V04 hidden/inert/foreign/nested owner changes cannot write. V05 drafts, exact control nodes, selection and Find query/index/focus survive.

Capture synthetic actual-App before/after at fixed SHAs, 1920x1080/30fps/H.264 without titles/overlays, external captions/hashes. Browser evidence is not Windows native scrollbar/AT/DPI evidence. All commands remain planned here.

## STATE

PLANNED; BLOCKED on ANC03 and current App/Find allocation. No code/tests verified. First action T01; pending candidate status is not permission to replace it. Done requires exact-head review and bounded handoff; native gates go to ANC06. Main geometry acceptance is the specific cross-feature dependency for math/diagram renderer verification.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/0ccda0526baafe343bff33b72c7f103e600cc51e/docs/agent-plans/frontend-transcript-reading-anchor.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- Input [ANC03 #2264](https://github.com/skytuhua-org/Gen-V1/issues/2264), focus [ANC05 #2266](https://github.com/skytuhua-org/Gen-V1/issues/2266), native [ANC06 #2267](https://github.com/skytuhua-org/Gen-V1/issues/2267).
- [Find PR2062](https://github.com/skytuhua-org/Gen-V1/pull/2062), [prompt PR1649](https://github.com/skytuhua-org/Gen-V1/pull/1649), [bookmark PR1509](https://github.com/skytuhua-org/Gen-V1/pull/1509), [protected App owner](https://github.com/skytuhua-org/Gen-V1/issues/1188#issuecomment-7058630319).
