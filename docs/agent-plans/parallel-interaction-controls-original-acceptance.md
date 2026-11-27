# Verify retained original popover consumers and residual motion rows

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-R1/CTL04, 2026-11-25. Parent: https://github.com/skytuhua-org/Gen-V1/issues/1186; coordination: https://github.com/skytuhua-org/Gen-V1/issues/2212. Verified baseline: main@defe9884530145e9c109b8ed98f80efac8beeb17. Planning branch: docs/frontend-parallel-work-packets. This leaf's implementation/runtime verification: NOT_STARTED/NOT_RUN; existing PR progress is recorded below. Provenance: complete published bluma-shared-controls-supplement.md, current full parent journal, linked PR outcomes and baseline source. The parent is historical context; execute this leaf and its exact dependency outputs.

## OBJECTIVE

Give the original #1186 work an exact acceptance ledger against the selected existing PR. Do not let the new ActionMenu/Select pilot silently remove model-picker, planning-choice, consumer migration or exit-vector requirements.

## REQUIREMENTS

Own original T01/T02 and A1-A8 acceptance outside the ActionMenu/Select amendments. Keep original model-picker private-keyframe removal while retaining transform origins; ordinary consumer rows140ms with30ms nth delay capped150ms, open-only; original model-picker/planning choice check .2 to1 opacity and .8 to1 scale,200ms spring token/easing; remove banned ease-in exit. Required exit endpoints remain toast translateY(8px) scale(.98), ui-item-out translateY(4px), enabled button active scale(.97). The prior reviewer called vector fixes optional, but the preserved accepted plan still requires them; only an explicit full-plan amendment can waive a row.

Preserve neutral themes, readable names, command/revision/grant owners, focus, selection, IME/keyCode229 and drafts. Motion never delays input or held controls. Effective tokens are consumed once; raw bases scale once. Reduced removes travel/stagger/shimmer with opacity<=80ms; Off/panels-disabled settle immediately, including live changes. No new dependencies, acquisition, schema, persistence, backend, telemetry, blur, permanent will-change or per-frame React geometry loop. The no-bounce amendment applies only to the ActionMenu/Select pilot; retain original A7's 200ms model-picker/planning check spring and its accepted easing outside that pilot.

## REPO_MAP

Read-only production: selected canonical stylesheet/Popover plus model-picker.css and its current component, styles.css keyframes/press selector, packages/ui-shell/feedback.css toast keyframe. Discover model-picker component with rg -n 'model-picker-popover' apps/web/src, then record exact file before any owner change. Existing candidate1199 migrates ComposerCommands, SavedDrafts, SavedLayoutChooser, ProjectPicker, SourceSelectionActions, TaskTableControls, WorkspaceSplitLayout, RelationshipGraph task-node, ContextMeter, ActionMenu and Select. Preserve SessionBranch/DesktopBrowser consumers through their actual primitives. Test ownership is only named new describe blocks; production corrections remain the acknowledged original candidate owner.

## DESIGN

Consume CTL01 ControlIntegrationRecord. Produce OriginalControlAcceptance[{id,selector,fixture,sourceSha,result,measurement,evidence,remainingOwner}] with a record for A1/A2 enter180/exit140, A3 rows, A4 historical check, A5 model consolidation, A6 four named consumer staggers, A7 model/planning checks and A8 model exit easing, plus T02 vector/press rows. Historical A1-A4 names and later A5-A8 names are aliases, not permission to omit scope.

The four named row surfaces are .composer-command-popover, .saved-drafts-popover, .saved-layout-popup and .model-picker-popover. Ordinary consumers retain their original shared profile; only ActionMenu/Select gets CTL02/CTL03 surface-only .95/monotonic-check amendments. Retain original Reduced opacity<=80/no travel/stagger and Off/panel=false none. Current keyboard-origin coordination must never hide a focused row.

A failed original row is handed to the existing selected PR owner with exact selector/expected/measured values and minimal proposed hunk. This verification leaf does not open a competing production implementation. #2094 owns separate model presence timing; #1204 owns overlapping shared check/status and empty/toast work. feedback.css toast keyframe and styles.css item/press hunks are finite reservations, independent of ACT01 busy-indicator and CMP03 message-action rules. No indefinite global CSS ownership.

## EXECUTION_DAG

Dependencies: [CTL01 #2239](https://github.com/skytuhua-org/Gen-V1/issues/2239). One owner per allocated file/hunk; retain adjacent owners.

1. T01 Consume CTL01 chosen head and row-owner map; refresh claims/PR heads. Enumerate original rows and actual consumer paths in the output. Positive: every alias and consumer accounted. Negative:1199 historical PASS cannot erase known missing model stagger. Done with immutable test target.
2. T02 Extend model/control fixture describe blocks only as needed to expose actual original values/commands. Run ordinary pointer/keyboard opens, selected check, scroll/typeahead/rerender and cancel. Positive: token/timing/callback/geometry evidence. Negative: fresh open only, never replay from navigation.
3. T03 Verify toast/item/press endpoints and both themes/policies against the selected build. Assert computed animation frames, not text search alone. Preserve safe press carve-outs for held/dragged controls; a missing enable rule is reported with its exact owner. Done with all original rows PASS/FAIL/BLOCKED.
4. T04 Hand failures to retained candidate/adjacent owners; record ACK or pending recipient. Re-run only affected cases at owner-fixed commit. No edits to product code or automatic PR1195 closure/1199 merge.
5. T05 Publish OriginalControlAcceptance, exact commands and source/evidence links; RELEASE to CTL05. Done when the review ledger is complete; parent acceptance stays blocked for any failed row.

## VALIDATION

Commands: pnpm exec playwright test --config tests/e2e/model-picker.playwright.config.ts tests/e2e/model-picker.spec.ts; pnpm exec playwright test --config tests/e2e/ui-shell-controls.playwright.config.ts; pnpm exec playwright test --config tests/e2e/ui-shell-overlays.playwright.config.ts. Select the model-picker spec explicitly, not unrelated auth suites. Discover existing scoped configs for other actual consumers via rg --files tests/e2e and run only those required by unresolved risks. Negative cases include100 options,last selected,long labels,empty/disabled rows and reopen during exit. Record selected mark remount/replay differences without weakening either original or amended scope.

Planned, NOT_RUN: full checkout at frozen SHA; Node>=24.10, pnpm10.30.3, pinned Bun; pnpm install --frozen-lockfile and actual browser channels named by config. Never substitute another browser for msedge. Build widgets where required. Run focused commands plus pnpm lint, pnpm typecheck, pnpm build and pnpm check:docs-links for touched scope. Compare failures at the same baseline; required Windows CI/review gates remain.

Visible acceptance uses paired synthetic1920x1080/30fps/H.264 with no added titles/captions/overlays. External manifest: scenario, baseline/candidate SHAs, browser/Windows build, theme, actual zoom, policy/speed, commands/counts, limits and verdict. Close contexts, inspect/redact and publish immutable resolving media, not profiles/raw traces. Check dark/light,narrow/short,actual100/125/150% app zoom, keyboard and live System/Reduced/Off/OS/panels-disabled. Browser zoom is not physical DPI; fixtures do not prove native packaging/provider success.

## STATE

NOT_STARTED/BLOCKED on CTL01 exact selected candidate. Existing1199/1195 implementation remains open; this leaf is a read-only adoption/acceptance scope. No current original requirement is considered satisfied solely by previous reported tests. Next: T01, then route actual correction requests to the retained owner.

Checkpoint each milestone or 20 minutes with key/SHA/tests/blockers/next owner. Stop requires read-back RELEASE OWNER=NONE and own-marker cleanup. Unmet gates remain BLOCKED/HANDOFF_PENDING; review, merge and main acceptance are distinct.

## REFERENCES

- Original complete source: https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-shared-controls-supplement.md
- Parent/journal: https://github.com/skytuhua-org/Gen-V1/issues/1186
- Verified baseline/rules: https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17
- Original comparison and unresolved differences: https://github.com/skytuhua-org/Gen-V1/issues/1186#issuecomment-7056791542
- Retained PRs: https://github.com/skytuhua-org/Gen-V1/pull/1199 , https://github.com/skytuhua-org/Gen-V1/pull/1195 , https://github.com/skytuhua-org/Gen-V1/pull/1204 , https://github.com/skytuhua-org/Gen-V1/pull/2094
