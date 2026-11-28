# TIP05: Verify artifact tooltip transfer on Windows and assistive technology

## META

| Field | Value |
| --- | --- |
| Task / revision / date | TIP05; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/2219 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | verification; BLOCKED |
| Prerequisites | [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270) |
| Original source | FRONTEND-TOOLTIP-R1 at 0ccda0526baafe343bff33b72c7f103e600cc51e |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

Verify that warm tooltip inspection is useful and accessible on the actual Artifact toolbar in the Windows app, without delaying controls or leaking help across owner/modal boundaries.

## REQUIREMENTS

Own native/visual parts of parent R09/R12/R14 and A02-A10. Inputs: reviewed TIP03/TIP04 candidate, baseline, policy/lifecycle tests, actual-App action ledger and valid component films. No Tooltip/Artifact/CSS/action implementation, merge or closure in this leaf.

Use real pointer, keyboard/focus-visible, IME and assistive technology. First pointer is existing350ms; keyboard remains100ms; warm peer is immediate without animation. Internal gap hides old help and is warm only before300ms. Actual window/dialog/ARIA-modal placement and reset must be inspected. Synthetic fake timers are exact timing evidence, not native usability proof.

One noninteractive bubble preserves focus/tab order, names/descriptions and current source/pin states. Hover sends no action; source local and pin explicit. Drag owner Escape, pending/open Escape and IME229 behavior remain unchanged. Inert/not-ready/held editor groups cannot revive stale help.

Primary films are synthetic fixed-SHA actual App at1920x1080/30fps/H.264, no embedded titles/explanatory overlays; external captions/hashes identify fixture/input/policy/zoom. Test dark/light x normal/reduced/off, narrow/short and actual app zoom100/125/150%. Browser scale/emulation is not native DPI or AT observation.

## REPO_MAP

Consume TIP03 fake-timer/overlay reports and TIP04 task-interface actual toolbar output. Existing overlays suite uses msedge and native dialog fixture; task-interface uses actual App. Record platform/channel rather than silently substituting a missing binary.

Proposed report directory docs/verification/tooltip-warm-transfer/ uses dated SHA-qualified files after current evidence-policy/source registration check. Product source is read-only. Required native platform Windows x64 with real keyboard/pointer and NVDA; label separate VoiceOver/platform comparison honestly.

## DESIGN

One matrix row per A01-A10 records exact SHA, OS/build/browser/AT/input, scene, expectation, observed PASS/FAIL/BLOCKED/NOT_RUN, clip/log and next owner. Policy tests establish349/350,99/100,299/300; native observation establishes usable placement/focus/dispatch and cancellation, not fabricated millisecond precision from footage.

Replay source-to-pin-to-archive inspection, internal gap, leaving group/window, two artifact instances and owner revision replacement. Test expanded modal and native-dialog fixture separately because their portal contexts differ. Actual artifact header opacity reveal must work without reclassifying a laid-out control as inactive.

Focus a no-help control from pending/open keyboard help and confirm cancellation. Escape pending propagates; open consumes once; a second Escape reaches current outer owner. IME/active drag retains precedence. Explicit dismissal plus icon-descendant movement stays closed until genuine exit. Blur/hide/inert/removal cancels even with no next pointer event.

Check latest help/ARIA after accepted pin/unpin and caller mutation, no stale placement frame, no warm animation under each policy, readable wrapping and no viewport overflow. Retrieve/hash rather than rerecord valid TIP04 films. Defects go back to TIP03 or TIP04, not a broad new tooltip rewrite.

## EXECUTION_DAG

1. T01: Retrieve exact candidate/baseline/tests/films; verify hashes, current ownership and actual source adoption. Record any unresolved2011 integration gate.
2. T02: Run real Windows/AT toolbar sequences and overlay native-dialog/drag/focus lifecycle checks; preserve exact environmental details.
3. T03: Inspect film format/no-overlays, themes/policies/zoom and command/ARIA observations; keep failures/skips explicit and minimal repros assigned to owner.
4. T04: Publish matrix and immutable evidence links, obtain frontend review/ACK and RELEASE. Keep native, browser, merge and main states distinct.

## VALIDATION

Re-run only relevant accepted integration checks: pnpm exec vitest run tests/tooltip-transfer.test.ts tests/tooltip-escape.test.ts --maxWorkers=1; pnpm exec playwright test --config tests/e2e/ui-shell-overlays.playwright.config.ts; pnpm exec playwright test --config tests/e2e/task-interface.playwright.config.ts. Preserve existing global Escape/drag regression rather than rewriting its fixture.

V01 exact fake timing remains reported correctly. V02 native peer transfer has one bubble/no animation and good placement. V03 owner/modal/hidden resets have no stale help. V04 native keyboard/IME/Escape/focus preserved. V05 current ARIA/title and source/pin actions remain truthful. V06 films/versioned evidence satisfy format and retrieval; unrun native/DPI/AT checks are explicit. V07 exact-head review, full readback and recipient ACK are durable. All checks NOT_RUN in this plan.

## STATE

PLANNED; BLOCKED on TIP04 plus native platform/evidence access. No implementation or observed test result. First action T01. Missing environment creates HANDOFF_PENDING with exact next owner, not a passing native gate. Verification owns only its finite evidence window; product fixes return to owners.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/0ccda0526baafe343bff33b72c7f103e600cc51e/docs/agent-plans/frontend-tooltip-warm-transfer.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- Inputs [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269), [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270), pure decisions [TIP02 #2268](https://github.com/skytuhua-org/Gen-V1/issues/2268).
- [Parent](https://github.com/skytuhua-org/Gen-V1/issues/2219), [ARIA integration owner](https://github.com/skytuhua-org/Gen-V1/issues/1976), [reference evidence index](https://github.com/skytuhua-org/Gen-V1/issues/2213).
