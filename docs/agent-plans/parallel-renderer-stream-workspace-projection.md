# STR04: Project accepted phase into each workspace instance

## META

`skytuhua-org/Gen-V1`; parent [#2228](https://github.com/skytuhua-org/Gen-V1/issues/2228) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/STR04`, 2026-11-25. Kind: implementation. Start: **BLOCKED**. Dependencies: [STR01 #2285](https://github.com/skytuhua-org/Gen-V1/issues/2285), [STR03 #2287](https://github.com/skytuhua-org/Gen-V1/issues/2287).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-STREAMING-MARKDOWN-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-streaming-markdown-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Publish a small owner-scoped UI projection from accepted authoritative state, so main/canvas/embedded renderers receive truthful provisional state without per-message subscriptions or stale reactivation.

## REQUIREMENTS

Do not edit schemas/producers/decoders outside STR03's atomic contract. Import exact accepted R2 types, not a locally guessed Message field. One transient projection per ConversationWorkspace instance; absent/unknown authority is static. Apply state atomically with accepted snapshots after sequence and owner checks. No parser/CSS/scroll changes, status timers, history cache or network subscription.

Coverage: Streaming T03 client state/T01 fixture gap; R02/R09/R10; A02/A08/A11. Inherited requirements remain binding.

## REPO_MAP

App ConversationWorkspace has snapshotRef/apply/refresh/subscribe and separate embedded/native instances. CanvasThread receives snapshot/visibility/held context. New streaming-markdown-state.ts isolates transition decisions. task-interface-fixture's existing publish emits settings.update; runtime-presentation's nativeBridge currently lacks onWorkspaceChanged. Their new helpers must match the real R2 event/snapshot contract.

Existing narrow hunks: `apps/web/src/App.tsx`, `tests/e2e/task-interface-fixture.ts`, `tests/e2e/runtime-presentation.spec.ts`.

Proposed outputs: `apps/web/src/streaming-markdown-state.ts`, `tests/streaming-markdown-state.test.ts`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

The UI helper consumes accepted snapshot/event authority plus the verified current thread/run/message/epoch and revision from R2. It returns a readonly provisional lookup for exactly that workspace. Delta can enable only its matching current message; final clears even for identical content. Older/duplicate/activity/wrong-owner input cannot enable. Full refresh/reconnect/terminal/owner switch clears uncertainty unless accepted descriptive metadata proves current phase. Hidden/inert/held/inactive suppress repair; re-entry requires current authority or static output.

Function/type names for the phase input are frozen by STR01; do not expose generic raw events. Exact output to STR05 is an app-private per-message boolean plus owner/revision identity, not finality proof. False includes unknown/default and must never be reused by diagrams as known-final. Derive no Contents eligibility from this output; #1655 keeps its whole-run rule.

Add typed assistant-event publishing to the existing task fixture and a true native invalidation-only stub with onWorkspaceChanged that causes snapshot refresh. Count/forbid renderer EventSource construction in that native scenario. A settings publish or old fallback stub cannot pass. These fixtures test real App transport wiring; mocked reducer success is only one layer.

## EXECUTION_DAG

**T01.** Verify STR01 R2 and STR03 atomic candidate. If a reader portion is inseparable, publish this narrow projection patch into that same integration PR before merge; do not land half the contract.

**T02.** Create the pure transition helper and all12 state-case groups. Keep its inputs/types exactly aligned with the reviewed contract and its output limited to app presentation truth.

**T03.** Bind the helper at ConversationWorkspace accepted apply/refresh/subscription boundaries, including cleanup/owner visibility transitions. Keep each embedded/native instance separate.

**T04.** Add typed delta/final fixture publishing and true onWorkspaceChanged-only native coverage. Test same-text final, stale/duplicate and reconnect without a fallback EventSource.

**T05.** Run focused state and runtime-presentation tests, then hand explicit provisional/owner/revision delivery to [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289). Release App/fixture hunks.

**Done when:** Accepted authority drives a tested per-workspace projection and realistic browser/native-stub fixtures. It is safe for STR05 to consume, without claiming real Windows verification. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm build:widgets; pnpm exec vitest run tests/streaming-markdown-state.test.ts --maxWorkers=1; pnpm typecheck; pnpm build; pnpm exec playwright test --config tests/e2e/runtime-presentation.playwright.config.ts. Twelve required groups: current delta; changed final; unchanged final; duplicate sequence; older sequence; wrong message/thread/run; activity; stop/error/terminal; owner epoch switch; reconnect/unknown snapshot; hidden/inert/held owner; native invalidation with authoritative metadata. Assert zero extra socket/subscription/timer and exact canonical content. Actual packaged Windows remains STR08.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Consumes only the fully reviewed/valid R2 authority, never an invented host field. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/App.tsx).
- [Reference 2](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/tests/e2e/task-interface-fixture.ts).
- [Reference 3](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/tests/e2e/runtime-presentation.spec.ts).
