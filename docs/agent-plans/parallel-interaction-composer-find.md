# Animate ConversationFind presence while preserving scope and focus

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-R1/CMP04, 2026-11-25. Parent: https://github.com/skytuhua-org/Gen-V1/issues/1188; coordination: https://github.com/skytuhua-org/Gen-V1/issues/2212. Verified baseline: main@defe9884530145e9c109b8ed98f80efac8beeb17. Planning branch: docs/frontend-parallel-work-packets. This leaf's implementation/runtime verification: NOT_STARTED/NOT_RUN; existing PR progress is recorded below. Provenance: complete published bluma-composer-supplement.md, current full parent journal, linked PR outcomes and baseline source. The parent is historical context; execute this leaf and its exact dependency outputs.

## OBJECTIVE

Complete M1/M2 Find feedback with interruptible grid presence and restrained match-color changes, retaining exact search scope, range identity, reading position and focus return.

## REQUIREMENTS

M1 Find-bar grid0fr/1fr+opacity180ms enter/140ms exit with existing easing/no delay. M2 match background-color120ms, no spatial travel. Preserve literal cross-format ranges, unchanged copied markup/code, count/navigation, loaded-history controls/errors, owner isolation, composing Enter229, opener/draft-caret return and current selected-match/reading position on background changes. Reduced no spatial/grid movement, opacity<=80ms; Off/panels-disabled immediate.

Preserve neutral themes, readable names, command/revision/grant owners, focus, selection, IME/keyCode229 and drafts. Motion never delays input or held controls. Effective tokens are consumed once; raw bases scale once. Reduced removes travel/stagger/shimmer with opacity<=80ms; Off/panels-disabled settle immediately, including live changes. No new dependencies, acquisition, schema, persistence, backend, telemetry, bounce, blur, permanent will-change or per-frame React geometry loop.

## REPO_MAP

Own ConversationFind.tsx and conversation-find.css only. conversation-find.ts range/highlight helpers read-only unless a narrowly proven M2 capability change is allocated. Existing tests/e2e/conversation-find.spec.ts covers scope/IME/focus/history and current highlight ranges; tests/conversation-find.test.ts remains regression. No App, transcript anchoring or global motion helper edits.

## DESIGN

Preserve ConversationFindProps. Add private present state/generation to retain the same .conversation-find subtree through close and rapid reversal, wrapped by .conversation-find-presence. Open grid1fr/opacity1, closed0fr/opacity0; inner min-height0/overflow hidden. Close immediately removes interaction/accessibility exposure and restores the existing opener or rendered Find trigger before hiding focused contents. An always-available existing trigger node may remain mounted while hidden during open; no extra visible control or role.

Exit completion checks current wrapper,target,grid-template-rows property and generation. Reopen cancels stale exit and retargets current geometry. Policy Off/Reduced, zero-duration, cancel, inactive/owner change and unmount settle without waiting for missing CSS events. New owner resets query/matches through existing contract; snapshot/theme changes never replay presence. Preserve actual find scan/highlight API and onNavigate behavior.

For M2 add120ms background-color transition only if the shipped browser's CSS Highlight implementation supports that actual pseudo-element behavior. Probe it in the real suite. Current code uses ::highlight(conversation-find-all/current), so a stylesheet declaration alone is not evidence. If unsupported, retain exact M2 requirement BLOCKED and publish capability evidence for a bounded follow-up design; do not mutate transcript markup, animate geometry or silently mark M2 satisfied. No new rendering layer or library is authorized by this leaf.

## EXECUTION_DAG

Dependencies: none. One owner per allocated file/hunk; retain adjacent owners.

1. T01 Refresh Find/continuity claims and reserve exact two files/test blocks. Read complete current component/range tests; record real CSS Highlight transition capability. Positive: actual browser frames. Negative: computed property text alone does not prove120ms interpolation. Done with M1 allocation/M2 disposition.
2. T02 Implement retained grid presence and immediate semantic closure/focus using current props/owners. Positive: open/close/rapid reverse same input node; negative: child/stale events cannot unmount reopened search. Done with identity/focus assertions.
3. T03 Apply supported match-color transition without changing source/ranges, or publish M2 BLOCKED with exact capability prerequisite. Positive: current match text/reading position unchanged. Negative: no span wrapping or spatial match movement. Done with honest per-row state.
4. T04 Extend policy, owner-switch, IME, history, keyboard and interruption tests. Positive: scoped count/navigation and opener/draft caret survive; negative: inactive hidden focus or replay fails. Run focused suites.
5. T05 Publish M1/M2 evidence and exact unresolved gate to CMP08, then RELEASE. Parent cannot close with M2 blocked.

## VALIDATION

pnpm exec vitest run tests/conversation-find.test.ts --maxWorkers=1; pnpm test:browser --suite conversation-find. Cover opening while typing, Escape/Close, focused Previous/Close/history Enter, IME, partial history/error retry, old-message prepend, selected range retention, owner A-B-A and policy toggle mid-exit. Record grid/opacity timing from native animations. Real speeds.75/1/1.25 use existing appearance tokens; no new helper scaling. Dark/light,narrow/short and actual zoom remain final evidence.

Planned, NOT_RUN: full checkout at frozen SHA; Node>=24.10, pnpm10.30.3, pinned Bun; pnpm install --frozen-lockfile and actual browser channels named by config. Never substitute another browser for msedge. Build widgets where required. Run focused commands plus pnpm lint, pnpm typecheck, pnpm build and pnpm check:docs-links for touched scope. Compare failures at the same baseline; required Windows CI/review gates remain.

Visible acceptance uses paired synthetic1920x1080/30fps/H.264 with no added titles/captions/overlays. External manifest: scenario, baseline/candidate SHAs, browser/Windows build, theme, actual zoom, policy/speed, commands/counts, limits and verdict. Close contexts, inspect/redact and publish immutable resolving media, not profiles/raw traces. Check dark/light,narrow/short,actual100/125/150% app zoom, keyboard and live System/Reduced/Off/OS/panels-disabled. Browser zoom is not physical DPI; fixtures do not prove native packaging/provider success.

## STATE

READY scoped implementation after current ownership refresh, NOT_STARTED. M2 exact browser interpolation support is an explicit T01 capability gate. Existing Find behavior remains authoritative. No conceptual dependency on1203 or controls; shared recording integration is CMP08. Next T01.

Checkpoint each milestone or 20 minutes with key/SHA/tests/blockers/next owner. Stop requires read-back RELEASE OWNER=NONE and own-marker cleanup. Unmet gates remain BLOCKED/HANDOFF_PENDING; review, merge and main acceptance are distinct.

## REFERENCES

- Original complete source: https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-composer-supplement.md
- Parent/journal: https://github.com/skytuhua-org/Gen-V1/issues/1188
- Verified baseline/rules: https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17
- Existing component: https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/ConversationFind.tsx
- Existing tests: https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/tests/e2e/conversation-find.spec.ts
