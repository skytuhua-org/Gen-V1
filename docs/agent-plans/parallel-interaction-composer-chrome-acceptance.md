# Verify banner stacking and scroll-indicator interruption in the retained PR

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-R1/CMP02, 2026-11-25. Parent: https://github.com/skytuhua-org/Gen-V1/issues/1188; coordination: https://github.com/skytuhua-org/Gen-V1/issues/2212. Verified baseline: main@defe9884530145e9c109b8ed98f80efac8beeb17. Planning branch: docs/frontend-parallel-work-packets. This leaf's implementation/runtime verification: NOT_STARTED/NOT_RUN; existing PR progress is recorded below. Provenance: complete published bluma-composer-supplement.md, current full parent journal, linked PR outcomes and baseline source. The parent is historical context; execute this leaf and its exact dependency outputs.

## OBJECTIVE

Prove existing PR1203 handles simultaneous workspace banners and scroll-indicator visibility without stale shells, focus loss, overlap or delayed held scrolling. Historical single-banner FLIP observation does not establish the simultaneous-error case.

## REQUIREMENTS

B1/D10; R01/R05-R08,A01/A04/A05/A08. Banner insert180/remove140ms, existing stacked banners move160ms status/ease-move. Indicator opacity+translateY4px enter160/exit120ms; pointer-events none while hidden and deferred visibility only through exit. Never animate held thumb geometry. Reduced opacity<=80/no travel; Off/panels-disabled immediate. Keep actual alert/status roles and recovery actions, no duplicate announcements.

Preserve neutral themes, readable names, command/revision/grant owners, focus, selection, IME/keyCode229 and drafts. Motion never delays input or held controls. Effective tokens are consumed once; raw bases scale once. Reduced removes travel/stagger/shimmer with opacity<=80ms; Off/panels-disabled settle immediately, including live changes. No new dependencies, acquisition, schema, persistence, backend, telemetry, bounce, blur, permanent will-change or per-frame React geometry loop.

## REPO_MAP

Read-only App.tsx DeferredUnmount/workspaceErrorTops/FLIP in PR1203, styles.css .workspace-error, ChatScrollIndicator.tsx/chat-scroll-indicator.css. Main may have evolved App factorization; record actual candidate symbols. PR1203's scripts/ui-overlay-legacy.json fingerprint change is retained evidence for exact indicator rule, not authorization to weaken UI guard. Tests: only CMP02 describe blocks, disjoint from CMP01. Existing shared-motion fixture mechanisms are reused.

## DESIGN

Output ComposerChromeAcceptance rows B1-insert,B1-remove,B1-stack,D10-enter,D10-exit,D10-held,policy,cleanup. Each stores commands/geometry/roles/timing/result and original-owner recipient. Banners remain source-error driven; closing makes leaving copies inert/aria-hidden, while existing visible rows translate from measured prior top to current top at160ms. Never dispatch Refresh/Dismiss twice from cloned content. A reappearing error during exit remains current, not removed by old completion. Reject overlap, lost error or duplicate live-region announcement.

The indicator's track/visibility may fade, but live thumb geometry follows pointer immediately. Hidden pointer events stop immediately; visibility resolves at exit completion or instantly under Off. Rapid scrollability changes retarget rather than restart at a fixed origin. Disable motion or unmount mid-transition without stale hit targets or unfinished shells. Keep native owner scroll/key/selection behavior unchanged. No new polling, frame loop or product error source is created.

Review against exact current1203 integration; a failure goes to unreleased devin-a-cloud-f4e3b6. This leaf does not replace App/chrome implementation. Narrow test commits are independent; production fixes only after explicit split/release, never because an old owner is silent.

## EXECUTION_DAG

Dependencies: none. One owner per allocated file/hunk; retain adjacent owners.

1. T01 Refresh1203 owner/head/CI and select immutable candidate/baseline; reserve CMP02 test blocks. Positive: roles/actions read from current source. Negative: no source-only claim that simultaneous stack works. Done with frozen target.
2. T02 Extend synthetic existing host to expose two real existing error channels concurrently, then dismiss/retry/re-add in opposite orders. Positive: prior banner160ms retarget and single alert. Negative: outgoing clone triggers action or stale completion deletes new error. Done with geometry/counts.
3. T03 Exercise indicator scrollability enter/exit, rapid reversal and held pointer/keyboard scrolling while effects paused. Positive: immediate thumb/user scroll, hidden no hit target. Negative: tweened held geometry or invisible interactive track. Done with scroll/timing checks.
4. T04 Apply actual speed/policy matrix and owner changes; verify cleanup after cancel/unmount and frozen baseline comparison. Positive: Reduced no travel, Off immediate. Negative: lingering shell/listener or effect replay. Done with native effect records.
5. T05 Publish row matrix and immutable evidence, route gaps to1203 owner; RELEASE to CMP08. Full acceptance remains pending unresolved failures and native/visual gates.

## VALIDATION

pnpm exec playwright test --config tests/e2e/frontend-refinement.playwright.config.ts tests/e2e/composer-app-refinement.spec.ts; pnpm exec playwright test --config tests/e2e/micro-motion.playwright.config.ts tests/e2e/shared-motion.spec.ts tests/e2e/composer-integration.spec.ts; pnpm test:ui-guard. Keep exact source-generated error semantics in synthetic fixture; do not invent a product action. Verify second-banner creation and simultaneous removal with actual rectangles, not only FLIP call count. Record100/125/150% actual zoom, dark/light,narrow/short and keyboard results for CMP08.

Planned, NOT_RUN: full checkout at frozen SHA; Node>=24.10, pnpm10.30.3, pinned Bun; pnpm install --frozen-lockfile and actual browser channels named by config. Never substitute another browser for msedge. Build widgets where required. Run focused commands plus pnpm lint, pnpm typecheck, pnpm build and pnpm check:docs-links for touched scope. Compare failures at the same baseline; required Windows CI/review gates remain.

Visible acceptance uses paired synthetic1920x1080/30fps/H.264 with no added titles/captions/overlays. External manifest: scenario, baseline/candidate SHAs, browser/Windows build, theme, actual zoom, policy/speed, commands/counts, limits and verdict. Close contexts, inspect/redact and publish immutable resolving media, not profiles/raw traces. Check dark/light,narrow/short,actual100/125/150% app zoom, keyboard and live System/Reduced/Off/OS/panels-disabled. Browser zoom is not physical DPI; fixtures do not prove native packaging/provider success.

## STATE

READY for read-only review, NOT_STARTED. Original implementation remains PR1203@c7428df080bef4d520c067a59aca28847d0dbb97, open/unmerged with current owner. Prior single-banner results and static assertions are historical only. Next T01; no blanket shared App writer is granted.

Checkpoint each milestone or 20 minutes with key/SHA/tests/blockers/next owner. Stop requires read-back RELEASE OWNER=NONE and own-marker cleanup. Unmet gates remain BLOCKED/HANDOFF_PENDING; review, merge and main acceptance are distinct.

## REFERENCES

- Original complete source: https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-composer-supplement.md
- Parent/journal: https://github.com/skytuhua-org/Gen-V1/issues/1188
- Verified baseline/rules: https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17
- Existing PR: https://github.com/skytuhua-org/Gen-V1/pull/1203
- Existing owner/current row fix: https://github.com/skytuhua-org/Gen-V1/issues/1188#issuecomment-7058630319
- Original incomplete verification: https://github.com/skytuhua-org/Gen-V1/issues/1188#issuecomment-7051612974
