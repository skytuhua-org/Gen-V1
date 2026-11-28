# TIP03: Bind tooltip warm transfer, lifecycle and accessible freshness

## META

| Field | Value |
| --- | --- |
| Task / revision / date | TIP03; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/2219 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | implementation; BLOCKED |
| Prerequisites | [TIP02 #2268](https://github.com/skytuhua-org/Gen-V1/issues/2268) |
| Original source | FRONTEND-TOOLTIP-R1 at 0ccda0526baafe343bff33b72c7f103e600cc51e |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

Bind the pure group policy to the existing delegated Tooltip layer, preserving current accessible help and cancellation. Direct peer transfer replaces one bubble's content/position before paint with no delay or animation.

## REQUIREMENTS

Own R01-R09/R11-R14 and A01-A06/A08-A10 at the layer boundary. Cold pointer uses existing --ui-tooltip-dwell, currently350ms; focus-visible keyboard uses100ms and clears pointer warmth. Pending hover never warms. Internal gap removes the bubble immediately;299ms remains warm,300ms is cold. Leave group/window, owner change, Escape, activation, focusout, captured scroll, blur, document hide, removal/inert/hidden state hard-reset all callbacks.

Preserve latest title/data-tooltip and native-title suppression while pending/open. Text updates keep the deadline and opening kind; empty help clears warmth. Caller-owned aria-label/labelledby/description/describedby must survive replacements/removal. One noninteractive role=tooltip bubble, current wrapping/clamping/native-dialog portal, no focus/tab stop/live announcement.

Pending Escape propagates; open active tooltip consumes once. IME/isComposing/keyCode229 untouched; active drag retains priority. Touch and held-button drag cannot prime/reopen. Explicit dismissal suppresses the same target until genuine exit; movement among icon descendants cannot reopen it. Another peer after dismissal is cold.

No provider/dependency/network/preference/telemetry, polling, per-control listeners or full-document geometry scan. Maximum one dwell and one grace timer. Warm transfer never animates; cold tokens remain.

BLOCKED until #1976 agrees Tooltip integration: #2007 merged at273b3384d533ab9358abde8f4b22a5fc6bd013bb preserves freshness; #2011 remains open atf672b132e0d6420cdd50b4f9367b083b9ec95bf6 for caller ARIA. Consume merged repair or a reviewed combined Tooltip-only patch; never take its Toast/Composer scope.

## REPO_MAP

Product: packages/ui-shell/Tooltip.tsx, only warm selector in packages/ui-shell/feedback.css. Existing Tooltip adopt/read/schedule/hide delegation and native closest dialog portal are retained. Use TIP02's proposed helper.

Own tests/tooltip-escape.test.ts and tests/e2e/ui-shell-overlays-fixture.tsx/ui-shell-overlays.spec.ts; config is ui-shell-overlays.playwright.config.ts (msedge). Mocks must model real owners. Lifecycle suites are regression inputs; TIP04 owns Artifact grouping.

## DESIGN

Track current target, opening kind, pending generation and warmth separately. Resolve nearest explicit data-tooltip-group; capture boundary/key/document/open-dialog/ARIA-modal identity. Validate connectedness, current nonempty help distinct from visible text, ownership, hidden/inert/aria-hidden, display/visibility and nonzero layout at schedule/deadline/transfer/relevant mutation. Opacity zero alone is eligible: actual Artifact tools reveal on hover/focus while laid out. Preserve disabled-control explanatory help.

Every delayed open/grace/animation callback checks generation and captured target/group before state update. Only successful pointer open calls openedTooltipGroup. Transfer cancels old timers, adopts current help and measures new bubble/anchor before paint, never displaying new text at old coordinates. Mark data-opening=pointer-warm and preserve it through text refresh. Its scoped CSS wins over normal/closed/reduced animation; no top/left tween or text scaling.

Separate ordinary internal-gap/target exit from hard reset. Gap hides immediately and starts one nonextending grace. Hard reset increments generation, clears both timers, warmth and active interaction ownership. Dismissed-target suppression ends only on genuine target exit or owner invalidation. A visual cold exit cannot retain Escape/focus ownership.

Preserve adopt bookkeeping: change/remove only generated values still owned by the layer, never caller updates. Observe title/data-tooltip/caller-ARIA and current owner lifecycle; ignore own portal noise and avoid descendant rescans. Hidden/disconnected owner resets without input. Clean timers/listeners/observers on unmount. Rollback preserves #1976 fixes.

## EXECUTION_DAG

1. T01: Read TIP02 and current #1976/PR patches; obtain exact Tooltip/CSS allocation and reviewed ARIA disposition. Reproduce existing cold/keyboard/freshness behavior before changes.
2. T02: Bind group/opening/generation/grace state to existing document delegation and adopt lifecycle. Add current-owner validation/reset/cleanup, without per-control listeners.
3. T03: Add scoped warm-motion CSS and prepaint fresh placement. Keep cold timing/motion and keyboard/IME/drag precedence.
4. T04: Add fake-timer and mounted fixture tests for all timing, reset, owner/portal and caller-ARIA cases; use real group identities in mocks.
5. T05: Run focused regressions, publish exact code/results and handoff TIP04/TIP05. Release Tooltip/CSS/fixture hunks.

## VALIDATION

Run pnpm exec vitest run tests/tooltip-transfer.test.ts tests/tooltip-escape.test.ts tests/shared-ui-lifecycle-v3.test.ts tests/feedback-primitives.test.ts --maxWorkers=1; include tests/shared-ui-lifecycle.test.ts if present in the integrated2011 candidate. Run pnpm exec playwright test --config tests/e2e/ui-shell-overlays.playwright.config.ts; pnpm typecheck; pnpm build. Record unavailable msedge, never silently substitute.

V01 fake349/350 cold, canceled A then cold B,99/100 keyboard,299/300 internal gap. V02 one immediate peer bubble/no animation/no old-coordinate frame. V03 different/nested/key/document/dialog/modal/removed/inert owners reset. V04 Escape pending/open/IME229 and active-drag regression retain precedence; do not rewrite drag fixture focus to force pass. V05 all hard resets cancel timers, no-help focus cancels keyboard, descendants after dismissal do not reopen. V06 latest title/data-tooltip and caller ARIA survive mutation; pending deadline/opening kind retained. V07 cleanup bounded, no polling or scan cost.

Geometry/policy actual-toolbar native evidence follows TIP04/TIP05. Product tests are planned, not executed here.

## STATE

PLANNED; BLOCKED on TIP02 and #1976 integration disposition. Existing merged freshness is protected. No product/check result. First action T01; missing ARIA agreement blocks Tooltip edits while pure policy proceeds. Review and durable ACK complete this leaf; native/main gates stay separate.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/0ccda0526baafe343bff33b72c7f103e600cc51e/docs/agent-plans/frontend-tooltip-warm-transfer.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- Input [TIP02 #2268](https://github.com/skytuhua-org/Gen-V1/issues/2268), pilot [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270), native [TIP05 #2271](https://github.com/skytuhua-org/Gen-V1/issues/2271).
- [Merged PR2007](https://github.com/skytuhua-org/Gen-V1/pull/2007), [PR2011](https://github.com/skytuhua-org/Gen-V1/pull/2011), [owner journal](https://github.com/skytuhua-org/Gen-V1/issues/1976#issuecomment-7122067794).
