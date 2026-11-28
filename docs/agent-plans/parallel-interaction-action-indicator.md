# Keep action buttons stable with a delayed decorative indicator

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-R1/ACT01, 2026-11-25. Parent: https://github.com/skytuhua-org/Gen-V1/issues/2141; coordination: https://github.com/skytuhua-org/Gen-V1/issues/2212. Verified baseline: main@defe9884530145e9c109b8ed98f80efac8beeb17. Planning branch: docs/frontend-parallel-work-packets. This leaf's implementation/runtime verification: NOT_STARTED/NOT_RUN; existing PR progress is recorded below. Provenance: complete published bluma-action-feedback.md, current full parent journal, linked PR outcomes and baseline source. The parent is historical context; execute this leaf and its exact dependency outputs.

## OBJECTIVE

Make BusyButton keep its complete label and bounding box while idle, busy and acknowledged. Preserve native button behavior and delay only the spinner, never dispatch or disabled state.

## REQUIREMENTS

Original #2141 label-swapping/Saved assumptions are explicitly amended: visible and accessible labels stay static; acknowledgment is independently supplied, not inferred from busy becoming false. Own R1/R2/R8/A1/A2/A8 minimum shared support. Fixed decorative16px slot;<=1CSS px bounds variation. Busy/disabled/aria-busy immediate. Spinner appears only after150ms uninterrupted busy; no fast-request flash/minimum dwell. Full motion icon opacity160ms status/ease-move, effective speed once; Reduced/Off static. Preserve standalone Spinner/ErrorState/retry refs.

Preserve neutral themes, readable names, command/revision/grant owners, focus, selection, IME/keyCode229 and drafts. Motion never delays input or held controls. Effective tokens are consumed once; raw bases scale once. Reduced removes travel/stagger/shimmer with opacity<=80ms; Off/panels-disabled settle immediately, including live changes. No new dependencies, acquisition, schema, persistence, backend, telemetry, bounce, blur, permanent will-change or per-frame React geometry loop.

## REPO_MAP

Own Feedback.tsx ActionIndicator/BusyButton exports and feedback.css .ui-action-indicator/.ui-busy-button rules only; tests/feedback-primitives.test.ts local browser fixture blocks. Existing Feedback.tsx conditionally inserts Spinner. #1204 owns empty/status CSS; CTL04 reviews ui-toast-out. No edits to those selectors, registry, task-context or catalog contracts.

## DESIGN

Proposed export ActionIndicator({state,idleIcon,className}:{state:'idle'|'busy'|'acknowledged';idleIcon?:ReactNode;className?:string}). Render a16x16 aria-hidden decorative container with positioned layers, no handler/live region. Keep idle space even without icon. A component-local150ms pending timer reveals the spinner only if the same busy epoch remains current; settle/unmount cancels. A visible pending spinner alone may rotate. No idle/per-frame activity.

BusyButton retains ButtonHTMLAttributes<HTMLButtonElement>, ref, type default'button', disabled reasons, tones/classes and children. Add acknowledged?:boolean defaultfalse; state priority busy then acknowledged then idle. It always reserves the slot and keeps full text. Never infer success from promise resolution here. App Form may reuse ActionIndicator with CornerDownLeft idle icon in a29px native submit, zero gap, and its existing full hidden label; this leaf supplies presentation only.

Use opacity transitions on state changes, not remount keyframes. Reuse existing160ms status/ease-move tokens; app/OS reduced and app off remove transitions/rotation, including in-flight toggles. Shared package must honor root policy without importing app code. No width/scale/translation/shimmer/split-letter effects. Rollback only new indicator/busy styling.

## EXECUTION_DAG

Dependencies: none. One owner per allocated file/hunk; retain adjacent owners.

1. T01 Refresh #2141/#1191/#1204 claims and reserve exact BusyButton/CSS/test hunks. Add baseline geometry/name/fast-held fixture cases to existing feedback suite. Positive: actual measured width. Negative: no source-only claim of browser regression. Done with reproducible baseline.
2. T02 Implement export and epoch-cleaned150ms spinner, immediate native busy/disable and static label. Positive: held spinner, preserved refs/type. Negative: settle149ms/unmount/restart never leaks old spinner. Done with state and command-independent tests.
3. T03 Add policy-aware160ms opacity with static Reduced/Off and no idle animation. Positive: one full-motion transition. Negative: toggle cannot replay mount effects or leave rotation. Done with getAnimations/computed timing checks.
4. T04 Run focused browser/unit gates; publish exact API, selector contract, bounds and cleanup evidence to ACT04/ACT05; RELEASE. Done with<=1px geometry, complete names and no unrelated diff.

## VALIDATION

pnpm exec vitest run tests/feedback-primitives.test.ts --maxWorkers=1; pnpm test:ui-guard. The test already builds a real Chromium fixture. Cover idle/busy/ack/error/reset, short/long labels, pointer/Enter/Space, refs/type/disabled reasons and ErrorState retry. Verify<150ms no spinner and>=150ms held reveal without extending request duration. Measure both themes and560px/actual200% zoom; static reduced/off including OS override. Errors/status texts are owned by ACT04 and must remain instant.

Planned, NOT_RUN: full checkout at frozen SHA; Node>=24.10, pnpm10.30.3, pinned Bun; pnpm install --frozen-lockfile and actual browser channels named by config. Never substitute another browser for msedge. Build widgets where required. Run focused commands plus pnpm lint, pnpm typecheck, pnpm build and pnpm check:docs-links for touched scope. Compare failures at the same baseline; required Windows CI/review gates remain.

Visible acceptance uses paired synthetic1920x1080/30fps/H.264 with no added titles/captions/overlays. External manifest: scenario, baseline/candidate SHAs, browser/Windows build, theme, actual zoom, policy/speed, commands/counts, limits and verdict. Close contexts, inspect/redact and publish immutable resolving media, not profiles/raw traces. Check dark/light,narrow/short,actual100/125/150% app zoom, keyboard and live System/Reduced/Off/OS/panels-disabled. Browser zoom is not physical DPI; fixtures do not prove native packaging/provider success.

## STATE

READY for scoped implementation after claim refresh, NOT_STARTED. No pending #2141 product PR was found. This leaf can run concurrently with ACT02 because production paths differ. ACT04 consumes the exact export above; it must not invent success semantics. Next T01.

Checkpoint each milestone or 20 minutes with key/SHA/tests/blockers/next owner. Stop requires read-back RELEASE OWNER=NONE and own-marker cleanup. Unmet gates remain BLOCKED/HANDOFF_PENDING; review, merge and main acceptance are distinct.

## REFERENCES

- Original complete source: https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-action-feedback.md
- Parent/journal: https://github.com/skytuhua-org/Gen-V1/issues/2141
- Verified baseline/rules: https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17
- #2141 owner release: https://github.com/skytuhua-org/Gen-V1/issues/2141#issuecomment-7134447512
- Adjacent feedback work: https://github.com/skytuhua-org/Gen-V1/pull/1204
- Copy stays separate: https://github.com/skytuhua-org/Gen-V1/pull/1693
