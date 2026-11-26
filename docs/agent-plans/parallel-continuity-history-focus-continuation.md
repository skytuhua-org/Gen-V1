# ANC05: Recover focus after the last earlier-history button disappears

## META

| Field | Value |
| --- | --- |
| Task / revision / date | ANC05; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/2218 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | implementation; BLOCKED |
| Prerequisites | [ANC04 #2265](https://github.com/skytuhua-org/Gen-V1/issues/2265) |
| Original source | FRONTEND-ANCHOR-R1 at 0ccda0526baafe343bff33b72c7f103e600cc51e |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

When keyboard or assistive activation loads the final earlier-history page and removes its button, move focus once to the existing conversation scrollport only if that button still owned focus immediately before commit.

## REQUIREMENTS

Own parent R06/A06 and focus portions of R09/R10. A nonfinal connected button keeps focus. Failure, pointer paging, Find-triggered paging, newer action/input/owner, window blur, hidden document or user departure must not trigger recovery. No new message tab stops, live region, animation or network authority.

Preserve existing synchronous cached reveal, asynchronous fetch, bounded history cache, anchors, errors and request behavior. Focus is immediate after commit and accepted scroll stabilization with preventScroll; do not create another scroll writer or wait for an animation/network promise as a focus policy.

Existing baseline messages have no approved programmatic focus target, so deterministic recovery is the named focusable .conversation-scroll. A row may be used only if already approved by integrated navigation and explicitly recorded at integration. Do not invent tabindex on every message.

Claim only history-button action/focus bookkeeping in App.tsx and the relevant actual-App test block after ANC04 releases it. No AssistantProse/CanvasThread/source renderer or shared controller changes.

## REPO_MAP

apps/web/src/App.tsx renders the earlier-history button, activeHistoryControl, sync historyStart reveal and async getThreadMessages commit. Conversation scrollport already has tabIndex=0 and accessible name Conversation. Main rows use stable data-message-id.

tests/e2e/conversation-find.spec.ts has actual App setup(count) and count=125 paging, initially showing100. Find may programmatically click the history button while its input owns focus; this must remain excluded. No new fixture or product route is needed.

## DESIGN

Hold one transient record {owner,control,messageId,generation,ownedBeforeCommit} for the current history action. Arm after accepted click only when detail===0 and activeElement===the main button. Capture controller primary message ID if available. Pointer activation does not arm; programmatic Find click fails the activeElement condition.

Immediately before synchronous reveal or async state commit, revalidate same action/owner and activeElement===control; set ownedBeforeCommit only then. New keydown/pointerdown, genuine focus departure, blur, document hide, owner/presentation replacement, newer action, failure or unmount invalidates. The accepted activation event and its trailing keyup must not invalidate themselves, including Enter/Space asynchronous activation.

After commit and immediate scroll stabilization, consume once. If button is connected, do nothing. If removed, require prior owned focus, current generation/owner/visible presentation, and activeElement body or the removed control. Body alone without captured ownership is never evidence. Distinguish removal-induced focus loss from an actual user focus destination.

Use focus({preventScroll:true}) on approved row target if one already exists, otherwise .conversation-scroll. Missing row uses scrollport. Do not alter source/draft/selection/Find state or selected message. At most one bounded postcommit frame if layout timing requires it; cancel on replacement/unmount and never poll/retry indefinitely. Rollback removes only focus bookkeeping.

## EXECUTION_DAG

1. T01: Read ANC04 exact candidate and current history ownership. Reserve App history action/effect and final-page test blocks. Consume ANC02's original pinned-main focus failure (or accepted scope revision), then reproduce count125 final-button and nonfinal behavior on the accepted candidate.
2. T02: Add one action/focus generation record with precommit revalidation for sync and async branches. Keep existing cache/request/error logic unchanged.
3. T03: Implement once-only postcommit recovery and all intent/owner/visibility cleanup. Ensure the initiating activation/trailing keyup does not self-cancel.
4. T04: Extend actual-App tests for final/nonfinal, held success, failure, Find paging, pointer activation, composer/Find/other owner departure and stale action ordering.
5. T05: Run focused checks and publish exact candidate/results to ANC06. Release history hunks after reviewed integration.

## VALIDATION

Run pnpm build:widgets; pnpm exec playwright test --config tests/e2e/conversation-find.playwright.config.ts; pnpm exec playwright test --config tests/e2e/shell.playwright.config.ts --grep "bounded history|work activity keeps the full ordered group"; pnpm typecheck. Run scoped-conversation.playwright.config.ts for owner/hide integration if necessary and report unavailable Edge honestly.

V01 keyboard/AT-style detail0 active-button activation of final125-message reveal focuses existing scrollport once without moving scroll. V02 still-connected nonfinal button retains focus. V03 held async success after composer/Find/other-control/owner/window departure never steals focus. V04 rejection retains existing error/focus; programmatic Find and pointer paging never arm. V05 newer action and trailing-key handling are correct; callback count is bounded and cleanup complete. V06 no added per-message tab stops or live announcements, no cache/authority changes.

Record keyboard before/after on fixed SHAs, synthetic 1920x1080/30fps/H.264 without titles/overlays and with external hash/caption. Browser synthetic activation is not actual screen-reader acceptance; ANC06 records native observation. Planned only here.

## STATE

PLANNED; BLOCKED on ANC04 plus finite history reservation. No implementation/test result. First action T01. A focus failure elsewhere in navigation is outside this leaf unless this action introduced it. Done requires review/checks/durable verifier handoff; native/main acceptance remains distinct.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/0ccda0526baafe343bff33b72c7f103e600cc51e/docs/agent-plans/frontend-transcript-reading-anchor.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- Input [ANC04 #2265](https://github.com/skytuhua-org/Gen-V1/issues/2265), native recipient [ANC06 #2267](https://github.com/skytuhua-org/Gen-V1/issues/2267).
- [Original reading-anchor issue](https://github.com/skytuhua-org/Gen-V1/issues/2218), [Find work](https://github.com/skytuhua-org/Gen-V1/issues/1969), [controller/App ownership](https://github.com/skytuhua-org/Gen-V1/issues/1188).
