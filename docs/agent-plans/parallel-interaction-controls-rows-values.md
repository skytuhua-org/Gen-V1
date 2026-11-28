# Preserve menu and Select values through row entrance and selection

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-R1/CTL03, 2026-11-25. Parent: https://github.com/skytuhua-org/Gen-V1/issues/1186; coordination: https://github.com/skytuhua-org/Gen-V1/issues/2212. Verified baseline: main@defe9884530145e9c109b8ed98f80efac8beeb17. Planning branch: docs/frontend-parallel-work-packets. Product implementation and this leaf's runtime verification: NOT_STARTED/NOT_RUN. Provenance: complete published bluma-shared-controls-supplement.md, current full parent journal, linked PR outcomes and baseline source. This leaf is executable with its exact dependency outputs; the parent retains historical context.

## OBJECTIVE

Make row and selection feedback legible while the current ActionMenu/Select trigger, committed value, callbacks and native form owners remain authoritative. Focused rows must be usable immediately.

## REQUIREMENTS

Own supplement R04,R05,R07 and row-policy portions R06/R08, A04-A08. At speed1 pointer ordinary rows use140ms opacity and at most2px travel, delay min((index+1)*30ms,150ms). Focused or selected row delay0. Keyboard rows appear together with <=80ms fade. No replay from scroll, highlight, typeahead, rerender or refreshed options. Retain stable item.id/option.value keys. The ActionMenu/Select check amendment is monotonic opacity .2 to1, never the original200ms overshooting spring. Other consumers' original A7 remains in CTL04.

Preserve neutral themes, readable names, command/revision/grant owners, focus, selection, IME/keyCode229 and drafts. Motion never delays input or held controls. Effective tokens are consumed once; raw bases scale once. Reduced removes travel/stagger/shimmer with opacity<=80ms; Off/panels-disabled settle immediately, including live changes. No new dependencies, acquisition, schema, persistence, backend, telemetry, bounce, blur, permanent will-change or per-frame React geometry loop.

## REPO_MAP

Own only ActionMenu.tsx/Select.tsx and .ui-control-popup row/check selectors in controls.css. Popover/origin/surface are CTL02's scope. Baseline Select listens once on ownerDocument reset and checks native.current.form at dispatch time, preserving late association/reassociation. list-navigation.ts and current form/focus code are read-only unless a reproduced regression gets an explicit narrow allocation. Tests: existing controls fixture/spec and natural Tab unit suite.

## DESIGN

Preserve public ActionMenuProps/SelectProps and callback signatures. Existing .ui-control-popup is the shared profile seam; CTL01 supplies data-motion-origin once per opening and CTL02 will carry portal policy. Local row entry state may be keyed to a monotonically increasing open cycle, never highlighted value. Give each row a private --ui-control-row-delay CSS time in ms computed once for that cycle; selected/focused rows force0ms without restarting their animation. The selected state remains aria-selected/aria-checked; no parallel committed-value store.

Retain an existing selected mark without entry when a popup mounts or a row remounts. A mounted visible false-to-true mark may set a local data-control-check-change token for one opacity transition using popup-exit/ease-move. Keyboard/Reduced cap80ms; Off/panels-disabled static. Close a committing selection immediately; do not extend presence to show the mark. If the selected mark is invisible because the control closes, no decorative work is required.

Navigation keeps the old committed trigger label. Genuine changed-value selection calls onValueChange exactly once and renders the new label on that same node; cancel/disabled/IME dispatch none. Selecting an already committed value preserves existing no-change callback behavior. ActionMenu chooses once and closes immediately. Preserve native required/stale value/reset/fieldset state, names, form payloads, disabled rows, typeahead/Tab/Shift+Tab/nested Escape, ownerDocument/modal focus recovery. Rollback reverts row/check presentation only.

## EXECUTION_DAG

Dependencies: [CTL01 #2239](https://github.com/skytuhua-org/Gen-V1/issues/2239). One owner per allocated file/hunk; retain adjacent owners.

1. T01 Consume CTL01 record and current-main reset diff; claim the three exact files/hunks. Refresh1199/1195/1420 states and protect current reset behavior. Done with source/fixture hunk ACK; no source-owner claim from planning alone.
2. T02 Implement open-cycle row delay exceptions and stable keys. Positive: ordinary nth delays with focused/selected row0; keyboard all together. Negative: repeated highlight/typeahead/scroll/options refresh does not restart. Done with native browser animation records.
3. T03 Implement real-change-only monotonic marker feedback and retain same trigger/committed label. Positive: one changed-value commit/action; negative: cancel/IME229/disabled/stale event no callback and remount no check pop. Done with callback counts and node identity assertions.
4. T04 Add focused form/keyboard/owner tests to allocated controls describe block, preserving all existing cases. Assert real current-form reset, late form mount/reassociation, required/stale values and disabled fieldsets. Negative: new reset listener bound to old form is a regression.
5. T05 Run focused commands, hand exact commit/API/test evidence to CTL05 and RELEASE. Any unrelated issue is routed to its existing owner, not folded into this leaf.

## VALIDATION

Commands: pnpm exec vitest run tests/action-menu-tab.test.ts tests/ui-shell-overlay.test.ts tests/motion-policy.test.ts --maxWorkers=1; pnpm exec playwright test --config tests/e2e/ui-shell-controls.playwright.config.ts. Add icon-only menu, long/multiline labels,100 options with last selected, live options/value/disabled change, and reversals40/90/130ms. Test both inputs/dark/light/forced colors and all motion modes using real appearance policy and owner shell. Same trigger node, committed text, callback counts and immediate focused-row visibility are decisive.

Planned, NOT_RUN: full checkout at frozen SHA; Node>=24.10, pnpm10.30.3, pinned Bun; pnpm install --frozen-lockfile and actual browser channels named by config. Never substitute another browser for msedge. Build widgets where required. Run focused commands plus pnpm lint, pnpm typecheck, pnpm build and pnpm check:docs-links for touched scope. Compare failures at the same baseline; required Windows CI/review gates remain.

Visible acceptance uses paired synthetic1920x1080/30fps/H.264 with no added titles/captions/overlays. External manifest: scenario, baseline/candidate SHAs, browser/Windows build, theme, actual zoom, policy/speed, commands/counts, limits and verdict. Close contexts, inspect/redact and publish immutable resolving media, not profiles/raw traces. Check dark/light,narrow/short,actual100/125/150% app zoom, keyboard and live System/Reduced/Off/OS/panels-disabled. Browser zoom is not physical DPI; fixtures do not prove native packaging/provider success.

## STATE

NOT_STARTED/BLOCKED until CTL01 exact record and shared-owner ACK. CTL02 surface work and this leaf can run concurrently in different production files/hunks; joint acceptance is CTL05. Main's merged reset fix is preserved, not reimplemented. Next: T01.

Checkpoint each milestone or 20 minutes with key/SHA/tests/blockers/next owner. Stop requires read-back RELEASE OWNER=NONE and own-marker cleanup. Unmet gates remain BLOCKED/HANDOFF_PENDING; review, merge and main acceptance are distinct.

## REFERENCES

- Complete original: https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-shared-controls-supplement.md
- Current parent/journal: https://github.com/skytuhua-org/Gen-V1/issues/1186
- Rules/baseline: https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17
- Candidate PRs: https://github.com/skytuhua-org/Gen-V1/pull/1199 , https://github.com/skytuhua-org/Gen-V1/pull/1195 , https://github.com/skytuhua-org/Gen-V1/pull/1420
