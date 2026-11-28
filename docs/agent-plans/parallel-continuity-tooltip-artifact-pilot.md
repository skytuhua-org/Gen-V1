# TIP04: Enable grouped help on the existing artifact toolbar

## META

| Field | Value |
| --- | --- |
| Task / revision / date | TIP04; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/2219 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | implementation; BLOCKED |
| Prerequisites | [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269) |
| Original source | FRONTEND-TOOLTIP-R1 at 0ccda0526baafe343bff33b72c7f103e600cc51e |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

Enable and prove grouped tooltip inspection on exactly the three existing Artifact secondary actions, with no change to their activation, permissions, held-editor behavior or accessible state.

## REQUIREMENTS

Own parent R10 plus real-pilot portions of R04/R09/R12/R14 and A03/A07/A08/A10. Only .artifact-secondary-tools containing View source, Pin/Unpin and Archive receives the explicit group marker. Preserve inert={editorHeld || !ready}, action callbacks, labels, aria-pressed/expanded, permissions and dirty-state/archive guard. Hover inspection sends no artifact command.

Group identity uses the rendered artifact's threadId/id/revision, including heldArtifact when edits hold an incoming revision. A new incoming revision not yet accepted by the rendered owner must not falsely change its key; releasing the held revision must invalidate the old group. Separate DOM instances remain separate even if keys match.

No other toolbar/group rollout, new route/host/schema/dependency, archive behavior, action timing or editor persistence change. Warm transfer is immediate/no animation under normal/reduced/off; cold350/keyboard100 behavior remains TIP03. Actual zero-opacity header reveal must still allow first pointer/focus help when laid out and not inert.

DESIGN.md receives only the first-pointer/group-transfer exception in its tooltip paragraph. Keep rich-card120ms transfer grace distinct from tooltip300ms internal whitespace grace; do not change general motion tokens.

## REPO_MAP

apps/web/src/Artifact.tsx baseline .artifact-secondary-tools has exactly three buttons. It uses rendered artifact for current content, incoming.pinned for accepted pin state, and act() performs command then refresh. Source toggles local sourceOpen. Do not reformat header or alter these functions.

tests/e2e/task-interface.spec.ts uses serveTaskFixture from task-interface-fixture.ts with actual App on5188. Its fixture records all /api/commands but only action.submit invokes the custom action callback; artifact.pin is recorded without changing pinned by default. Therefore a pin state assertion needs a narrow acceptance route in the owning test. No shared fixture rewrite is required.

DESIGN.md currently specifies pointer350ms, rich-card120ms and tooltip160/120ms entry/exit. TIP03 owns layer/CSS, ART02/ART03 own unrelated task UI.

## DESIGN

Add proposed data-tooltip-group={JSON.stringify([artifact.threadId,artifact.id,artifact.revision])} to the existing wrapper and nothing to action handlers. Tooltip layer derives modal/document and DOM-boundary identity; do not concatenate ambiguous IDs or use incoming revision while another artifact is held.

Create a named actual-toolbar test block. Snapshot command count after ready/restoration settles; inspect source/pin/archive by pointer without clicking and assert no delta. Click View source and assert local expanded/source content with no host command. Keyboard activate Pin exactly once and assert its existing command type, artifactId, thread and pinned=true plus accepted aria-pressed/Unpin text.

For truthful fixture acceptance, after serveTaskFixture install a narrower **/api/commands route. For the matching artifact.pin request only, apply its accepted pinned value to the same synthetic snapshot; then route.fallback() so the existing handler records/acknowledges the command and act() refreshes that snapshot. Forward all unrelated requests unchanged. Do not use unrouteAll or count unrelated ready-state commands as hover effects. Do not click Archive just to prove hover transfer.

Exercise inline, expanded ARIA-modal and workspace placements, two artifact instances, held revision, inert editor/not-ready and current revision replacement. Use existing fixture publication/snapshot mechanisms; retain callbacks/state. Rollback removes the marker so these controls use existing cold behavior; independent Tooltip ARIA repair remains.

## EXECUTION_DAG

1. T01: Read TIP03 exact reviewed candidate and current Artifact/test/DESIGN ownership. Reserve one wrapper attribute, one prose paragraph and named toolbar test block; reproduce cold A-to-B baseline on real App.
2. T02: Add rendered-owner group marker and precise DESIGN exception without changing rich cards, motion tokens or callbacks.
3. T03: Add real App inspection/source/pin tests with the narrow accepted-pin fixture route and command baseline. Cover owner/inert/held-revision/modal boundaries.
4. T04: Run focused checks and capture paired actual-toolbar films, then publish exact candidate/results to TIP05 and release the header/test/prose reservations.

## VALIDATION

Run pnpm build:widgets; pnpm exec playwright test --config tests/e2e/task-interface.playwright.config.ts; pnpm exec playwright test --config tests/e2e/ui-shell-overlays.playwright.config.ts; pnpm typecheck; pnpm build. Existing chat-view Escape/drag regression runs if TIP03 integration changed global ordering; preserve its original focus setup.

V01 first header reveal opens cold then three-control peer transfer is warm/no motion. V02 hover emits no command; View source remains local; Pin keyboard activation emits exactly one expected accepted command and correct pressed/name state. V03 same key on different instance, placement/modal owner, revision change and inert/removal reset. Held rendered revision stays correct. V04 keyboard100, focus/tab order, labels, dirty/archive/permission gates are unchanged. V05 wrapping/clamping works dark/light, narrow/short and app zoom100/125/150%.

Before/after films: synthetic fixed SHAs,1920x1080/30fps/H.264, no titles/overlays, external caption/hash manifest. They show actual App, not only overlay fixture. TIP05 supplies native/AT evidence. All commands are future work here.

## STATE

PLANNED; BLOCKED on TIP03 and finite pilot reservations. No product/test result. First action T01. This pilot is the full authorized rollout; additional groups need their own evidence/decision. Done requires exact-head review/checks and durable verifier handoff; merge/main/native remain separate.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/0ccda0526baafe343bff33b72c7f103e600cc51e/docs/agent-plans/frontend-tooltip-warm-transfer.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- Input [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269), independent verifier [TIP05 #2271](https://github.com/skytuhua-org/Gen-V1/issues/2271), policy [TIP02 #2268](https://github.com/skytuhua-org/Gen-V1/issues/2268).
- [Parent](https://github.com/skytuhua-org/Gen-V1/issues/2219), [Artifact continuity](https://github.com/skytuhua-org/Gen-V1/issues/1115), [existing Tooltip repair](https://github.com/skytuhua-org/Gen-V1/issues/1976).
