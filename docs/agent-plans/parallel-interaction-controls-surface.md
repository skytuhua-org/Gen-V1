# Anchor the shared-control surface without scaling its content

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-R1/CTL02, 2026-11-25. Parent: https://github.com/skytuhua-org/Gen-V1/issues/1186; coordination: https://github.com/skytuhua-org/Gen-V1/issues/2212. Verified baseline: main@defe9884530145e9c109b8ed98f80efac8beeb17. Planning branch: docs/frontend-parallel-work-packets. Product implementation and this leaf's runtime verification: NOT_STARTED/NOT_RUN. Provenance: complete published bluma-shared-controls-supplement.md, current full parent journal, linked PR outcomes and baseline source. This leaf is executable with its exact dependency outputs; the parent retains historical context.

## OBJECTIVE

Refine only ActionMenu/Select popup surfaces so expansion visually starts at the measured trigger while text, focus and semantic controls remain stable. Keep one Popover portal and its current presence owner.

## REQUIREMENTS

Own supplement R02,R03,R06-R08 and the surface part of A02,A03,A06-A09. Surface scale is .95 to1, replacing .98/.96 only for .ui-control-popup. Content never scales. Wrapper travel is at most4px toward the anchor; open180ms/ease-enter cubic-bezier(.16,1,.3,1), exit140ms/ease-move cubic-bezier(.4,0,.2,1), at speed1. Keyboard/assistive opening is opacity-only <=80ms with immediate focus. Do not change other popover profiles or add a label clone.

Preserve neutral themes, readable names, command/revision/grant owners, focus, selection, IME/keyCode229 and drafts. Motion never delays input or held controls. Effective tokens are consumed once; raw bases scale once. Reduced removes travel/stagger/shimmer with opacity<=80ms; Off/panels-disabled settle immediately, including live changes. No new dependencies, acquisition, schema, persistence, backend, telemetry, bounce, blur, permanent will-change or per-frame React geometry loop.

## REPO_MAP

Production ownership is exactly Popover.tsx, overlay-position.ts and the canonical motion stylesheet selected by [CTL01 #2239](https://github.com/skytuhua-org/Gen-V1/issues/2239). Keep geometry/focus APIs and ActionMenu/Select source read-only. Tests belong with this change: ui-shell-overlay.test.ts and ui-shell-overlays fixture/spec. Reserve only origin/surface cases in those shared files; preserve existing geometry/IME/modal cases and current reset/tab tests.

## DESIGN

Proposed pure helper in overlay-position.ts: popoverTransformOrigin(anchor:OverlayAnchor, placement:PopoverPlacement):{x:number;y:number}. Inputs share viewport units. Above/below: x=clamp((anchor.left+anchor.right)/2-placement.left,0,placement.width), y=height/0 respectively. Left/right: x=width/0 respectively, y=clamp((anchor.top+anchor.bottom)/2-placement.top,0,placement.height). In Popover.place() calculate against final physical flipped/clamped placement and divide both returned lengths by the same portal CSS zoom used for geometry; native browser zoom remains in viewport coordinates. Emit --ui-control-origin-x/y on the existing portal. Recompute on existing geometry events only.

Use the already-selected #1420 data-motion-origin contract, improving stale pointer classification only within its ACKed hunk. Carry owning .app-shell data-panel-animations=false to the portal while mounted; observe relevant owner changes only while needed and clean up. Do not import app motion policy into the shared package. Parent root policy still applies through portals.

In the selected stylesheet, .ui-control-popup::before is pointer-transparent background/border only. Preserve border-box reservation, radius, padding, clipping, scrolling, scrollbar, contrast and stacking. Wrapper open=opacity1/neutral translation; closed=opacity0/anchor translation; pseudo surface .95/1 at measured origin. Use interruptible CSS transitions and @starting-style, overriding this profile's scale keyframes. Existing wrapper140ms exit owns getAnimations presence waiting; pseudo cannot outlive it. Close immediately inert/aria-hidden; reopen invalidates stale completion and retargets current values. Geometry updates never replay entry. No animation completion dispatches actions. Roll back only this profile/origin plumbing, retaining canonical and current-main lifecycle fixes.

## EXECUTION_DAG

Dependencies: [CTL01 #2239](https://github.com/skytuhua-org/Gen-V1/issues/2239). One owner per allocated file/hunk; retain adjacent owners.

1. T01 Consume CTL01's selected head/stylesheet/origin ACK; refresh claims. Rebase the acknowledged candidate without replacing current-main reset/focus behavior. Output frozen path/hunk allocation; no selection means BLOCKED.
2. T02 Add/test the pure final-placement origin helper and wire the two CSS lengths during existing placement. Positive: each side, flip, clamp and CSS zoom. Negative: near-edge origins stay within bounds; no extra frame loop. Done when unit geometry evidence passes.
3. T03 Implement surface-only transitions, owner panel propagation and interruption cleanup. Positive: measured .95 surface with text transform none. Negative: stale close promise, Off during exit, reopen at40/90/130ms cannot unmount current popup. Done when browser lifecycle assertions pass.
4. T04 Extend only allocated overlay fixture cases; exercise actual appearance/owner shell, modal/iframe ownerDocument, IME/Escape and forced colors. Output candidate SHA and measurements. Negative: body portal behind modal, lost focus or clipped content fails.
5. T05 Run focused gates, publish evidence and RELEASE to CTL05; preserve all pending original rows. Record reviewed versus merged/main status separately. Done only for this surface's criteria, not all #1186.

## VALIDATION

Commands: pnpm exec vitest run tests/ui-shell-overlay.test.ts tests/action-menu-tab.test.ts tests/motion-policy.test.ts --maxWorkers=1; pnpm exec playwright test --config tests/e2e/ui-shell-overlays.playwright.config.ts. Assert native animation timing/transforms rather than stylesheet strings. Check .75/1/1.25 effective tokens, live policy, 1920x1080,390x420,320x320, actual100/125/150% app zoom, 8px gap/gutter where feasible and42px native chrome. Observe cleanup after resize, policy, disable, option/value change and unmount. CTL05 captures the combined visual verdict.

Planned, NOT_RUN: full checkout at frozen SHA; Node>=24.10, pnpm10.30.3, pinned Bun; pnpm install --frozen-lockfile and actual browser channels named by config. Never substitute another browser for msedge. Build widgets where required. Run focused commands plus pnpm lint, pnpm typecheck, pnpm build and pnpm check:docs-links for touched scope. Compare failures at the same baseline; required Windows CI/review gates remain.

Visible acceptance uses paired synthetic1920x1080/30fps/H.264 with no added titles/captions/overlays. External manifest: scenario, baseline/candidate SHAs, browser/Windows build, theme, actual zoom, policy/speed, commands/counts, limits and verdict. Close contexts, inspect/redact and publish immutable resolving media, not profiles/raw traces. Check dark/light,narrow/short,actual100/125/150% app zoom, keyboard and live System/Reduced/Off/OS/panels-disabled. Browser zoom is not physical DPI; fixtures do not prove native packaging/provider success.

## STATE

Implementation NOT_STARTED; BLOCKED on CTL01's acknowledged selected integration record. CTL03 can implement row/value work concurrently after that record because its source and CSS hunks differ; combined tests wait for both. The prior source analysis is not runtime evidence. Next: T01 with exact dependency output.

Checkpoint each milestone or 20 minutes with key/SHA/tests/blockers/next owner. Stop requires read-back RELEASE OWNER=NONE and own-marker cleanup. Unmet gates remain BLOCKED/HANDOFF_PENDING; review, merge and main acceptance are distinct.

## REFERENCES

- Complete original: https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-shared-controls-supplement.md
- Current parent/journal: https://github.com/skytuhua-org/Gen-V1/issues/1186
- Rules/baseline: https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17
- Candidate PRs: https://github.com/skytuhua-org/Gen-V1/pull/1199 , https://github.com/skytuhua-org/Gen-V1/pull/1195 , https://github.com/skytuhua-org/Gen-V1/pull/1420
