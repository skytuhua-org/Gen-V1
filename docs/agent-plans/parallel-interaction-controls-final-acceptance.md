# Accept shared controls across inputs, themes, zoom and interruption

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-R1/CTL05, 2026-11-25. Parent: https://github.com/skytuhua-org/Gen-V1/issues/1186; coordination: https://github.com/skytuhua-org/Gen-V1/issues/2212. Verified baseline: main@defe9884530145e9c109b8ed98f80efac8beeb17. Planning branch: docs/frontend-parallel-work-packets. This leaf's implementation/runtime verification: NOT_STARTED/NOT_RUN; existing PR progress is recorded below. Provenance: complete published bluma-shared-controls-supplement.md, current full parent journal, linked PR outcomes and baseline source. The parent is historical context; execute this leaf and its exact dependency outputs.

## OBJECTIVE

Provide combined browser, visual and Windows acceptance of the integrated shared controls. A mechanical pass does not establish readable origin/value continuity.

## REQUIREMENTS

Supplement T03-T05/R09 and A01-A11 remain binding, together with original pending rows. Within the ActionMenu/Select pilot, reject ghost labels, text scale, bounce, blur and clipped entry. Across all consumers reject hidden focus, stale portals and duplicate actions. Preserve original A7's 200ms model-picker/planning check spring outside the pilot. Matrix: dark/light;1920x1080,390x420,320x320; actual app zoom100/125/150%; long/multiline labels;100 options,last selected; forced colors; modal/ownerDocument; pointer/keyboard; all motion modes.

Preserve neutral themes, readable names, command/revision/grant owners, focus, selection, IME/keyCode229 and drafts. Motion never delays input or held controls. Effective tokens are consumed once; raw bases scale once. Reduced removes travel/stagger/shimmer with opacity<=80ms; Off/panels-disabled settle immediately, including live changes. No new dependencies, acquisition, schema, persistence, backend, telemetry, blur, permanent will-change or per-frame React geometry loop.

## REPO_MAP

Use existing ui-shell-controls/ui-shell-overlays/model-picker specs/configs and fixtures. Controls Vite5394, overlays5393, actual Edge where configured. Product source is read-only. Find actual-app consumers via rg -n 'ActionMenu|<Select' apps/web/src without adding sample actions. Allocate only this leaf's acceptance/capture test blocks.

## DESIGN

Consume CTL02 origin/policy measurements, CTL03 row/value tests and CTL04 OriginalControlAcceptance at exact compatible SHAs. Output rows A01 owner/candidate; A02 no acquisition/schema; A03 origin/unscaled text; A04 stable trigger/commit; A05 rows/marks/no replay; A06 policy/speed; A07 form/IME/focus; A08 interruption/cleanup; A09 viewport/theme/zoom; A10 videos; A11 complete source/release. Each row stores PASS/FAIL/BLOCKED, command/build, evidence and remaining owner.

Reverse/reopen at40/90/130ms; change value/options/disabled/policy; resize/unmount. Closing immediately removes accessibility/interactivity; old completion cannot unmount a reopened cycle. Hold menus during System/Reduced/Off, OS reduction and owning-panel changes. Check first visible selected row before corrective resizing,8px gap/gutter where feasible,42px native chrome and distinct selected/hover/focus. The Bluma preview supplies a behavioral reference, not measured timings or licensed source. Our values are the accepted local design.

## EXECUTION_DAG

Dependencies: [CTL02 #2240](https://github.com/skytuhua-org/Gen-V1/issues/2240), [CTL03 #2241](https://github.com/skytuhua-org/Gen-V1/issues/2241), [CTL04 #2242](https://github.com/skytuhua-org/Gen-V1/issues/2242). One owner per allocated file/hunk; retain adjacent owners.

1. T01 ACK frozen candidate, dependency records and baseline. Refresh claims/PR states; freeze edits before tests. Positive: every source resolves. Negative: missing original row or incompatible commits blocks acceptance. Done with exact test target.
2. T02 Run focused unit/browser gates and full A07/A08 failure paths. Record native timing, geometry, callback counts and cleanup. Compare failures with baseline. Done with reproducible automated matrix.
3. T03 Perform real-app keyboard/pointer/zoom/forced-color/modal checks and paired1920x1080 videos without added titles. Positive: readable continuity/immediate action. Negative: CSS zoom alone cannot meet actual-zoom acceptance. Done with manifests and reviewer verdict.
4. T04 Complete Windows checks, required CI and normal review. Browser-only workers record exact missing cases/recipient as HANDOFF_PENDING. No automatic merge or closure. Done with honest per-platform state.
5. T05 Coordinator updates complete body/source and verifies equality; publish/read back RELEASE. After authorized merge rerun affected checks at exact main. Done only when every applicable row is accepted; otherwise retain explicit gates.

## VALIDATION

pnpm exec vitest run tests/ui-shell-overlay.test.ts tests/action-menu-tab.test.ts tests/motion-policy.test.ts --maxWorkers=1; pnpm exec playwright test --config tests/e2e/ui-shell-controls.playwright.config.ts; pnpm exec playwright test --config tests/e2e/ui-shell-overlays.playwright.config.ts; pnpm exec playwright test --config tests/e2e/model-picker.playwright.config.ts tests/e2e/model-picker.spec.ts. All11 categories plus original CTL04 rows need evidence. Record paused/reversed effects, no remaining inert portals/listeners/console errors and real form/reset/keyboard results. Release requires visual verdict, resolving artifacts, required Windows and review gates.

Planned, NOT_RUN: full checkout at frozen SHA; Node>=24.10, pnpm10.30.3, pinned Bun; pnpm install --frozen-lockfile and actual browser channels named by config. Never substitute another browser for msedge. Build widgets where required. Run focused commands plus pnpm lint, pnpm typecheck, pnpm build and pnpm check:docs-links for touched scope. Compare failures at the same baseline; required Windows CI/review gates remain.

Visible acceptance uses paired synthetic1920x1080/30fps/H.264 with no added titles/captions/overlays. External manifest: scenario, baseline/candidate SHAs, browser/Windows build, theme, actual zoom, policy/speed, commands/counts, limits and verdict. Close contexts, inspect/redact and publish immutable resolving media, not profiles/raw traces. Check dark/light,narrow/short,actual100/125/150% app zoom, keyboard and live System/Reduced/Off/OS/panels-disabled. Browser zoom is not physical DPI; fixtures do not prove native packaging/provider success.

## STATE

NOT_STARTED/BLOCKED on CTL02/CTL03 and compatible CTL04 evidence. Historical substituted browser channels are not Windows proof. This leaf owns evidence only. Next T01; hand missing original defects to retained owners.

Checkpoint each milestone or 20 minutes with key/SHA/tests/blockers/next owner. Stop requires read-back RELEASE OWNER=NONE and own-marker cleanup. Unmet gates remain BLOCKED/HANDOFF_PENDING; review, merge and main acceptance are distinct.

## REFERENCES

- Original complete source: https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-shared-controls-supplement.md
- Parent/journal: https://github.com/skytuhua-org/Gen-V1/issues/1186
- Verified baseline/rules: https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17
- Current-main reset preservation: https://github.com/skytuhua-org/Gen-V1/pull/2007
- Original unresolved comparison: https://github.com/skytuhua-org/Gen-V1/issues/1186#issuecomment-7056791542
