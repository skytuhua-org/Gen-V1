# Bluma supplement: shared control continuity

## META

| Field | Value |
| --- | --- |
| Repo/revision/date | `skytuhua-org/Gen-V1`; `bluma-shared-controls-r1`; 2026-11-25 UTC |
| Canonical/parent | [#1186](https://github.com/skytuhua-org/Gen-V1/issues/1186) / [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212) |
| Baseline/plan branch | `main@96ca4c3bd0664fca53775fbe31915c209641986c`; `docs/bluma-component-adoption-plans` |
| Status/provenance | Planning only; repository, full issue/comments, exact PR source and coordinator's live Bluma observations |

Prepend this supplement to the preserved #1186 body. Prefix tasks BSC-T01..T05. Publish combined body/identical versioned Markdown; increment revision, preserve history and read both back. Only explicit amendments supersede original requirements.

## OBJECTIVE

Refine ActionMenu/Select origin and selected-value continuity while preserving semantic/form/callback/focus owners. Compare #1186 candidates; implement only missing refinements with measured and visual acceptance.

## REQUIREMENTS

| ID | Required outcome | Tasks / acceptance |
| --- | --- | --- |
| R01 | Reuse #1186, compare candidates/current main, ACK canonical ownership, preserve PRs and original remaining scope. | T01,T05 / A01,A11 |
| R02 | Reference-only local adaptation: no package, copied source/asset, account access, licensing assumption, schema or preference. | T01,T02 / A02 |
| R03 | Measured trigger origin after flip/clamp/zoom; existing 180/140ms tokens, .95 visual surface, unscaled text. No bounce, blur or semantic-owner morph. | T02 / A03 |
| R04 | Stable committed label/trigger; navigation does not commit; genuine selection commits once, cancel zero times. No flying label or delayed callback. | T02,T03 / A04 |
| R05 | Open-only 140ms/<=2px rows, 30ms spacing capped 150ms, immediate focused/selected row; no scroll/typing/rerender replay; restrained real-change marker. | T02,T03 / A05 |
| R06 | Coordinated keyboard fade <=80ms; Reduced removes spatial/stagger effects; Off/panel=false removes all motion through portals and in-flight changes. Honor speed once. | T02,T03 / A06 |
| R07 | Preserve ARIA/roles, form/reset/required, disabled fields, Tab/typeahead/IME/229/Escape/focus, ownerDocument/modal portals and current-main fixes. | T01-T03 / A07 |
| R08 | Interruptions retarget current state, with no stale presence, repeated action, permanent will-change, per-frame React geometry loop or data transfer. | T02,T03 / A08 |
| R09 | Dark/light, narrow/short, actual app zoom, long/many choices, forced colors, both inputs and motion modes; synthetic 1920x1080 paired videos without embedded titles; durable handoff. | T03-T05 / A09-A11 |

### Reference behavior and bounded amendments

[Bluma Popover Menu](https://bluma.design/c/popover), labelled Free, expands its three-dot trigger into a menu, followed by items, with sample edit/duplicate/share actions. [Bluma Select](https://bluma.design/c/select), also Free, anchors the current value during tray expansion and returns the picked value into the trigger. Both expose motion configuration and dark/light. These are preview observations, not measured timings or license evidence. Code is account gated; usable license terms were unavailable. No gated code/assets are required and sample actions must not be added to product menus.

For **ActionMenu/Select only**, explicitly amend the existing plan:

1. DESIGN.md mandates .95, while main/#1195/#1199 use .98 and one old review mentions .96. Use .95 on the nonsemantic surface, with unscaled content. Leave unrelated popover values to their existing scope.
2. Original #1186 A7 requests a 200ms overshooting spring check. Replace it here with the monotonic fade in DESIGN. Model-picker/planning A7 remains pending under its existing owner.
3. Focused/selected rows and keyboard opening are exempt from broad stagger rules, preventing hidden focused targets.

Surface lead means the existing stagger, not a 180ms usability delay. Existing press feedback and modal backdrop blur are outside the amendment; no new control/content blur is allowed.

## REPO_MAP

Baseline paths were read; candidate-only source is marked.

| Verified location | Responsibility |
| --- | --- |
| `AGENTS.md`, `DESIGN.md`, `CONTRIBUTING.md`, `.github/pull_request_template.md` | Ownership, design, publication/evidence gates. |
| `packages/ui-shell/Popover.tsx` | PopoverProps, zoomed placement/owner portal, geometry events, focus/Escape, inert exit/getAnimations wait. |
| `packages/ui-shell/overlay-position.ts` | OverlayAnchor/PopoverPlacement/placePopover; gap/gutter, flip/clamp; no origin yet. |
| `packages/ui-shell/ActionMenu.tsx`, `Select.tsx`, `list-navigation.ts` | Same directory: triggers/callbacks/form/reset/disabled/keyed rows/navigation. Main resets against current form owner. |
| `packages/ui-shell/tokens.css`, `packages/ui-shell/controls.css` | Tokens/keyframes; surfaces, scroll, padding, states. |
| `packages/ui-shell/popover-motion.css` | **#1199 only**; #1195 uses tokens.css. Extend one location. |
| `apps/web/src/model-picker.css` | Original #1186 consolidation scope; shared-consumer regression boundary. |
| `apps/web/src/useAppearance.ts`, `appearance.css`, `motion-policy.ts`, `shell.css` | Same app directory: speed tokens, motion/panel policy; portal ancestry risk. |
| `tests/ui-shell-overlay.test.ts`, `tests/action-menu-tab.test.ts`, `tests/motion-policy.test.ts` | Geometry, natural Tab/Shift+Tab and policy regressions. |
| `tests/e2e/ui-shell-controls-fixture.tsx`, `tests/e2e/ui-shell-controls.spec.ts` | Real controls; synthetic form/reset/disabled/draft/modal/100 options. |
| `tests/e2e/ui-shell-overlays-fixture.tsx`, `tests/e2e/ui-shell-overlays.spec.ts` | Owner/geometry/zoom/IME/focus/narrow/Reduced. |
| `tests/e2e/ui-shell-controls.playwright.config.ts`, `tests/e2e/ui-shell-overlays.playwright.config.ts` | Vite 5394/5393, actual msedge, one worker. |
| `tests/e2e/model-picker.spec.ts`, `tests/e2e/model-picker.playwright.config.ts` | Shared-consumer smoke; select this spec explicitly. |
| `scripts/public-source-files.json` | Register introduced production source. |

### Existing work ledger

| Work | State and boundary |
| --- | --- |
| [#1186](https://github.com/skytuhua-org/Gen-V1/issues/1186), [#1182](https://github.com/skytuhua-org/Gen-V1/issues/1182) | Open canonical consolidation/stagger/check/reduced/exit-vector work. Original owner and reviewers released; refresh for later claims. |
| [#1199](https://github.com/skytuhua-org/Gen-V1/pull/1199) | Open/unmerged, `devin/1763699660-popover-motion-contract@f8cb8c797c75ec963d04bf0027cc2ec33ebc74d9`. Separate CSS/explicit opt-in, broader migration. Review favors it but authorizes no merge. Model-picker stagger/check differences remain; old form-reset code must not overwrite main. |
| [#1195](https://github.com/skytuhua-org/Gen-V1/pull/1195) | Open/unmerged, `devin/1795199768-popover-motion-contract@bf6fdc26ef3d7f5552cad301ae45014a3ffd7e9f`. Tokens.css contract with global Popover opt-in. Compare and preserve pending disposition. |
| [#1302](https://github.com/skytuhua-org/Gen-V1/issues/1302), [#1420](https://github.com/skytuhua-org/Gen-V1/pull/1420) | #1420 open at `cd8ea7d55d4d4b89f88675f4d5e888686754371a`; ownerDocument modality tracking/data-motion-origin. Coordinate/reuse this overlapping Popover change. |
| [#1976](https://github.com/skytuhua-org/Gen-V1/issues/1976), [#2007](https://github.com/skytuhua-org/Gen-V1/pull/2007), [#1948](https://github.com/skytuhua-org/Gen-V1/issues/1948) | #2007 merged current-form reset is on baseline; baseline tests guard #1948 natural Tab/Shift+Tab. Preserve on rebase. |
| [#2085](https://github.com/skytuhua-org/Gen-V1/issues/2085), [#2094](https://github.com/skytuhua-org/Gen-V1/pull/2094) | Separate model-picker presence timing, outside this supplement. |

## DESIGN

### Geometry and visual lifecycle

Keep `ActionMenu/Select -> Popover -> placePopover`, existing callbacks and one trigger/portal owner. In existing place(), derive private CSS origins from anchor center relative to final clamped popup, in the same zoom-normalized coordinates. Clamp within bounds; above/below uses bottom/top edge, left/right right/left edge. Recompute on existing geometry events, not per frame. A pure tested helper may live in overlay-position.ts.

In the selected canonical stylesheet, scope `.ui-control-popup` to a pointer-transparent background/border pseudo-element. Preserve border-box dimensions/reservation, padding/radius, scrolling/scrollbars, contrast and stacking. Only this surface scales .95->1; content remains unscaled. Wrapper opacity/travel is <=4px toward anchor. No extra focus/ARIA/hit target, portal or label.

Reuse speed-adjusted tokens once. Override pilot wrapper scale keyframes with interruptible CSS transitions and @starting-style: open=opacity1/neutral travel/surface1; closed=opacity0/anchor travel/surface.95. Enter uses popup-enter/ease-enter, exit popup-exit/ease-move. Existing wrapper's 140ms exit owns getAnimations presence waiting; surface cannot outlive it. Verify transition enumeration/cancellation, not fixed timeouts. Other consumers remain unchanged.

State:closed -> open/mounted -> closed/inert/leaving -> unmounted. Close immediately removes interaction/accessibility exposure. Reopen cancels stale completion and retargets current visual state. Geometry updates never replay entry; Off settles/releases presence. Animation completion never invokes actions. Existing owners retain action errors and disabled recovery.

### Input, rows and policy

Coordinate/reuse #1420 opening-origin contract: classify once per open cycle; keyboard/assistive activation cannot inherit stale pointer cause. Keyboard fade <=80ms, all rows together, existing focus assignment immediate.

Pointer ordinary rows reuse 140ms/<=2px and min(index*30ms,150ms), first index 1; focused/selected row delay 0. Keep stable keys; no remount/replay on highlight, scroll, typeahead or refresh. Existing selected marks never animate on remount. Real false-to-true visible markers may fade .2->1 with popup-exit/ease-move, keyboard/Reduced <=80ms, Off none. Committing selections close immediately instead of extending presence for the mark.

The original Select trigger retains the committed label through navigation. Existing onValueChange commits once and immediately renders the new label there. Cancel/disabled/IME cannot create intermediate values. Preserve native form/reset and ActionMenu callbacks. No flying clone, text/font-size scaling or extra selection state.

Root policy applies through portals. Derive panel=false from trigger's owning .app-shell and carry it to portal/profile; observe relevant owner changes only while needed and clean up. Do not rely on shell-descendant selectors or import app policy into shared primitives. Fixtures use real appearance policy/owner shell. Existing stricter Reduced rules may remove all animation; never weaken them to force fades.

### Integration/rollback

Extend/rebase only the ACKed candidate; preserve reviews and main's newer reset/focus behavior. Coordinate shared files with #1420. Keep original model-picker/planning/toast/item/other-consumer work separate. Roll back only pilot profile/origin plumbing, retaining accepted canonical/lifecycle fixes; no state/dependency migration.

## EXECUTION_DAG

`T01 -> T02 -> T03 -> T04 -> T05`. Test fixture preparation may start after T01 in disjoint files. One owner edits shared production files. Checkpoints use BSC-Txx and this revision.

### T01: Compare and coordinate

Dependencies: none. Inputs: complete current #1186/#1182 plans/journals, candidates, #1302/#1420 and main. Read exact diffs/reviews; map accepted criteria to satisfied/missing/regressed; refresh claims and obtain authorized canonical branch selection/owner ACK. Claim this supplement only, recording its explicit amendments. Files: source read-only, canonical plan/checkpoint. Positive: complete SHA/criterion/owner map. Negative: silence/review preference grants no release or merge permission. Output/done: durable comparison, nonoverlapping ownership, original work retained. Handoff: production owner, T02.

### T02: Implement missing refinements

Dependencies: T01 and acknowledged keyboard-origin coordination. Inputs: R02-R08/candidate comparison. One production owner edits needed Popover.tsx, ActionMenu.tsx, Select.tsx, controls.css and selected canonical motion stylesheet; overlay-position.ts only for tested origin helper. Implement DESIGN, reuse satisfied candidate work, preserve current-main APIs/keys/reset/focus. Positive: measured origin, stable commitment, keyboard/portal policy. Negative: cancellation/repeat callback/remount replay/stale exit/old reset regression. Output: bounded diff, original tasks separate. Done: component-level A02-A08 pass. Handoff: T03 with exact selector/state contract.

### T03: Verify behavior

Dependencies: T02; fixture preparation may follow T01. Test owner edits existing controls/overlay fixtures/specs and geometry test if needed, reusing Tab/policy suites. Add synthetic long labels, edge anchors, icon-only menu, action counters and real policy/owner-shell controls only to fixtures. Assert browser origin/transform/opacity/animation and callbacks, not CSS strings. Positive: A03-A09. Negative: reversal, replay, stale presence, disabled/required/reset/IME/nested Escape/Tab. Execute commands below and compare failures on exact main baseline. Output: tests and redacted results. Done: passing criteria or explicit blocked gate with failure/owner, never waived assertions. Handoff: T04 visual reviewer.

### T04: Record visual acceptance

Dependencies: T03. Reviewer owns recording/test files only. Inputs: verified candidate and same baseline synthetic scenario. Use existing fixture/config; locate actual-app consumers with `rg -n 'ActionMenu|<Select' apps/web/src` without adding product actions. Capture paired 1920x1080 pointer/keyboard, commit/cancel, interruption/policy sequences; exercise A09 separately, including actual app zoom, and representative narrow captures. Positive: legible origin/value continuity. Negative: ghost label, overshoot, text scale, blur, hidden focus, clipped entry or stale overlay rejects result. Output/done: immutable evidence, external manifest, A09/A10 verdict and explicit Windows limits. Tests alone do not approve appearance. Handoff: T05.

### T05: Publish and release

Dependencies: T04. Coordinator updates full canonical body and identical source with actual task/acceptance/PR/CI states, immutable evidence, original remaining work and next owner. Read both back; publish/re-read final checkpoint plus RELEASE OWNER=NONE, clear own ownership markers. Positive: independently reproducible source/tests/decisions/gates. Negative: missing artifact, fixture-as-Windows claim, deleted scope or automatic PR closure/merge. Output/done: reviewed PR, A01/A11 and durable handoff. Recipients: #1186 maintainer/#2212 coordinator. Existing merge and closure authorization remains required.

## VALIDATION

### Planned setup and commands

Repository root; selected current branch; pinned pnpm 10.30.3, Node >=24.10 and required Bun. Install actual browser channels, never silently substitute another browser as msedge. Record versions/OS.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium msedge
pnpm lint
pnpm typecheck
pnpm build
pnpm exec vitest run tests/ui-shell-overlay.test.ts tests/action-menu-tab.test.ts tests/motion-policy.test.ts --maxWorkers=1
pnpm exec playwright test --config tests/e2e/ui-shell-controls.playwright.config.ts
pnpm exec playwright test --config tests/e2e/ui-shell-overlays.playwright.config.ts
pnpm exec playwright test --config tests/e2e/model-picker.playwright.config.ts tests/e2e/model-picker.spec.ts
pnpm check:docs-links
```

All commands: planned/NOT_RUN by this worker. Historic PR passes do not verify rebases. Separate baseline/new failures, unsupported checks and skips. Broaden only for touched scope/risk; Windows CI/review still applies.

### Acceptance

| ID | Observable pass condition |
| --- | --- |
| A01 | #1186 reused, original scope plus explicit amendments preserved; canonical owner/branch/ACK recorded; no inferred PR closure/merge. |
| A02 | No package/source/asset copying, transfer, public schema or preference; provenance/access limits recorded. |
| A03 | DESIGN's 180/140ms, .95 surface-only contract at speed 1; correct measured origin after flip/side/clamp/zoom; unscaled content. |
| A04 | Same trigger node; old committed label during navigation; commit once/cancel zero; no ghost/deferred callback/lost draft. |
| A05 | R05 timings and zero-delay exception observed; selected marks do not pop on remount; navigation/typeahead/scroll/rerender do not restart. |
| A06 | Keyboard <=80ms fade; Reduced no spatial/stagger; Off/panel=false none through portals. Policy changes settle; speed applied once. |
| A07 | Existing form/reset/required/stale value/fieldset, Tab/Shift+Tab, disabled rows, navigation/typeahead, IME/229, nested Escape, modal/ownerDocument and focus recovery pass; current-form reset retained. |
| A08 | Reverse at 40/90/130ms; reopen during exit; change value/options/disabled/policy; resize/unmount. No start-frame jump, stale/inert portal, doubled action, leaked observer or console error. |
| A09 | Dark/light; 1920x1080, 390x420, 320x320; actual app zoom 100/125/150%; long/multiline labels; 100 options, last selected; forced colors, modal, both inputs and motion modes. Preserve 8px gap/gutter where feasible, 42px chrome, first-visible selected row, target sizes and distinct selected/hover/focus. CSS zoom supplements actual zoom. |
| A10 | Paired synthetic 1920x1080 videos, no embedded title/caption/banner. External manifest: scenario, baseline/candidate SHA, browser/Windows build, theme/zoom, policy/speed, limitations, verdict; durable links resolve. |
| A11 | Full body/versioned source match; actual task/acceptance/original remaining states explicit; RELEASE/recipient recorded; no fixture-as-Windows claim. |

Recording: existing config/test context, viewport/video 1920x1080, per-commit harness output. Close context before publishing. Put synthetic labels/captions outside pixels. Redact profiles/traces/paths/user data; rerun failed captures.

Release requires applicable checks/A01-A11 on exact candidate, visual verdict, original pending work visible, accessible artifacts/readback, required Windows and merge protections. Browser-only execution hands off Windows verification instead of marking it done.

## STATE

Researched: source/tests, candidate/origin diffs, ledger, previews. Decided: canonical reuse and bounded surface/fade profile.

T01-T05 NOT_STARTED; implementation/runtime/video/zoom/Windows NOT_RUN. Risks: stale reset/focus, #1420 overlap, zoom origin, surface scroll/contrast/stacking, portal policy/canceled presence. Recovery: bounded rollback. Next: #1186 owner compares latest journal/branches, records selection/ACK before T02.

## REFERENCES

- [Pinned repository baseline](https://github.com/skytuhua-org/Gen-V1/tree/96ca4c3bd0664fca53775fbe31915c209641986c): AGENTS.md, DESIGN.md and exact REPO_MAP paths.
- [Original owner release](https://github.com/skytuhua-org/Gen-V1/issues/1186#issuecomment-7048828684), [comparison review](https://github.com/skytuhua-org/Gen-V1/issues/1186#issuecomment-7056791542), [later review release](https://github.com/skytuhua-org/Gen-V1/issues/1186#issuecomment-7058857438). No merge/closure authorization.
- [#1420 inspected Popover](https://github.com/skytuhua-org/Gen-V1/blob/cd8ea7d55d4d4b89f88675f4d5e888686754371a/packages/ui-shell/Popover.tsx), [#1302 release](https://github.com/skytuhua-org/Gen-V1/issues/1302#issuecomment-7091717379), [merged #2007](https://github.com/skytuhua-org/Gen-V1/pull/2007), [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212).


---

## Preserved earlier issue body

The complete earlier body follows verbatim. Its historical source/status statements describe their named snapshots. The dated supplement above changes only its explicit boundaries; other original requirements and linked continuation plans remain.

<!-- BEGIN PRESERVED ISSUE 1186 -->
Part of the workspace animation coverage plan.
Parent issue: https://github.com/skytuhua-org/Gen-V1/issues/1182
Plan file (full spec, all sections): `docs/agent-plans/1182-workspace-animation-coverage.md` on branch `devin/1795198505-workspace-animation-plan` (PR #1183).

**Normative values.** Every animation below is fully specified: trigger, properties, duration token, easing, delay/stagger, states, reduced-motion (RM) fallback. The implementer makes zero design choices. Global rules that apply to every row:

(applies to every row below)

| Rule | Value |
| --- | --- |
| Entrance easing | `var(--ui-ease-enter)` = cubic-bezier(.16,1,.3,1) |
| Move/exit easing | `var(--ui-ease-move)` = cubic-bezier(.4,0,.2,1) |
| Exits | ~20% shorter than the matching enter; return toward the trigger |
| Interruptibility | Every transition/animation must be interruptible: retarget from current geometry (CSS transitions do this natively; WAAPI calls must `cancel()` cleanly — see `animateTask`). Never tween a control while held or dragged. |
| Keyboard-driven changes | Selection/highlight moves still animate; *content* entrances triggered purely by typing do not replay. |
| `prefers-reduced-motion` / `data-motion=reduced` | No spatial transforms, stagger, or shimmer. Opacity-only fallback at `var(--ui-motion-press)` (80ms) or less. The global reduce block in `styles.css:351` covers any missed case but each component must also declare its own. |
| `data-motion=off` / `data-panel-animations=false` | No animation at all (`appearance.css:17` already enforces). |
| Motion speed scalar | WAAPI durations divide by `--motion-speed` exactly as `animateTask` does; CSS animations honor it via the existing speed hook (settings already exposes it). |
| Compositing | Animate only `opacity` and `transform` for anything that moves per-frame or staggers; `height`/`width`/`grid-template-rows` only for measured layout handoffs (artifact, attachment row, disclosure) where a transform cannot express the change. No `will-change` except on `task-answer-reveal` (already present). |
| Delayed feedback | Loading indicators appear only after 150ms of pending time (existing rule, kept). |


**Repository conventions to reuse:** `animateTask` in `apps/web/src/task-motion.tsx` for any WAAPI/FLIP work (it already honors `readMotionPolicy`, `--motion-speed`, and interruptibility); `Popover.tsx:34-42`'s `getAnimations()`-wait pattern for any deferred unmount; `::details-content` opt-in pattern at `styles.css:361-364` for height tweens.

**Validation for this slice:** `pnpm lint && pnpm typecheck`; browser walkthrough of every spec row below in slow motion (fixture host on :4317, see plan VALIDATION); reduced-motion re-check per row's RM column; interrupt check by spamming the trigger mid-animation.

---
## Scope
Rev-2 corrected premise: the shared popover contract **already exists** (`tokens.css:61-73` — `ui-popover-in/out` + `data-side` shift + RM fade, applied to every `Popover` consumer via `Popover.tsx:116`). This issue is polish + fixes only, tasks T01+T02:

1. Delete `model-picker.css` private `model-picker-in/out` + `model-picker-fade-*` keyframes; adopt the shared contract (A5). Keep the `transform-origin` declarations.
2. Option-row open stagger (A6): rows inside `.composer-command-popover`, `.saved-drafts-popover`, `.saved-layout-popup`, `.model-picker-popover` play `ui-item-in` 140ms, `nth-child × 30ms`, cap 150ms, gated to `[data-state="open"]` so it plays once per open, never on scroll/keyboard.
3. Shared `ui-check-in` keyframe in `styles.css` (A7): opacity .2→1 + scale(.8)→1, `--ui-motion-spring` 200ms `--ui-ease-spring`; applied to `.model-picker-check`, select/option checkmarks, planning choice check.
4. `model-picker.css:101` `model-picker-fade-out` banned `ease-in` → `--ui-ease-move` (A8).
5. Exit-vector fixes (T02): `feedback.css` `ui-toast-out` to-frame → `translateY(8px) scale(.98)`; `styles.css` `ui-item-out` to-frame → `translateY(4px)`; add `button:not(:disabled):active { transform: scale(.97) }` in `styles.css` (transition already lists transform at `--ui-motion-press`).

<!-- END PRESERVED ISSUE 1186 -->
