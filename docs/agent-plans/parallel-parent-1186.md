# Parallel execution for issue #1186

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-PARENT-1186-R1, 2026-11-25. Coordination parent: [#1186](https://github.com/skytuhua-org/Gen-V1/issues/1186). Program and consolidated journal: [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Verified planning base: main@defe9884530145e9c109b8ed98f80efac8beeb17. Previous complete body: 25525 UTF-8 bytes, SHA-256 84849e86cfc9869c89dfe2ea958b56286f77d818e249ce4eaba38aab6c5fba9d, reproduced unchanged below. The publication header supplies this revision's immutable file and reviewed documentation PR. Product implementation, review, merge and verified-on-main remain separate states.

## OBJECTIVE

Replace a broad single-worker assignment with 5 bounded, separately claimable tasks. Competing existing PR integration, geometry/policy, row/value continuity and original-consumer acceptance are independently reviewable. CTL02/CTL03 run concurrently after the concrete candidate record. No replacement of pending1199/1195 implementation or inferred closure. Success means each worker can complete one explicit outcome from its own full issue, source and input commits, while unrelated workers proceed independently. This parent coordinates coverage and final acceptance; it does not reserve every child or shared file for one agent.

## REQUIREMENTS

R01: Preserve all substantive prior product requirements, exclusions, accepted interfaces, examples, validation and closure criteria. The full prior body is retained below, and the coverage table maps it to the new allocation.

R02: Each child is one coherent outcome with code and its focused tests together, a bounded file scope, explicit input/output contracts, positive and negative checks, observable done-when and next recipient. A discovery child must deliver a reusable reviewed contract or concrete decision, not merely setup notes. If new evidence makes any child too broad for one worker, split it again before implementation and update this full plan.

R03: Existing authorized claims, PRs and completed evidence retain their ownership and meaning. Verify and reuse matching completed work. Do not reimplement it or infer abandonment from silence. A parent claim cannot take another worker's leaf or an entire shared module.

R04: Required task outputs are functional dependencies. Shared-file integration ordering is a separate finite hunk queue. Independent drafts/tests can proceed before another feature is adopted. BLOCKED identifies an exact unavailable input or owner allocation; it does not grant a worker ownership while waiting.

R05: Preserve runtime safety, focus/selection/input, source identity, cancellation/staleness, accessibility, motion policy and native acceptance from the complete prior specification. No new installation, schema, telemetry, source acquisition or feature expansion is authorized by a planning-only publication. Receiver execution follows the applicable accepted child scope and current repository rules.

R06: Full issue bodies and identical SHA-pinned Markdown must be retrievable. Parent closure requires all original required acceptance, not just all plan documents or child PRs being merged. A truthful blocked or rejected trial is not a passing product test.

## REPO_MAP

The exact proposed implementation/review boundaries are below. New paths are proposed until their child creates them. Read each child's full REPO_MAP and current main before changing a file. The source-manifest entry for a new source/test/document travels with that leaf; runtime entries change only when the original accepted runtime contract requires them.

| Child | Exact allowed paths or discovery |
| --- | --- |
| [CTL01 #2239](https://github.com/skytuhua-org/Gen-V1/issues/2239) | docs/agent-plans/parallel-interaction-controls-candidate.md |
| [CTL02 #2240](https://github.com/skytuhua-org/Gen-V1/issues/2240) | packages/ui-shell/Popover.tsx; packages/ui-shell/overlay-position.ts; packages/ui-shell/popover-motion.css or packages/ui-shell/tokens.css (CTL01 selects one); tests/ui-shell-overlay.test.ts; tests/e2e/ui-shell-overlays-fixture.tsx; tests/e2e/ui-shell-overlays.spec.ts |
| [CTL03 #2241](https://github.com/skytuhua-org/Gen-V1/issues/2241) | packages/ui-shell/ActionMenu.tsx; packages/ui-shell/Select.tsx; packages/ui-shell/controls.css; tests/e2e/ui-shell-controls-fixture.tsx; tests/e2e/ui-shell-controls.spec.ts; tests/action-menu-tab.test.ts |
| [CTL04 #2242](https://github.com/skytuhua-org/Gen-V1/issues/2242) | tests/e2e/model-picker.spec.ts; tests/e2e/ui-shell-controls.spec.ts; tests/e2e/ui-shell-overlays.spec.ts |
| [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | tests/e2e/ui-shell-controls.spec.ts; tests/e2e/ui-shell-overlays.spec.ts; tests/e2e/model-picker.spec.ts |

Existing work and ownership inspected during planning:

| Existing issue / PR | Inspected head | Current scope and release evidence |
| --- | --- | --- |
| [#1186](https://github.com/skytuhua-org/Gen-V1/issues/1186) / [PR #1199](https://github.com/skytuhua-org/Gen-V1/pull/1199) | f8cb8c797c75ec963d04bf0027cc2ec33ebc74d9 | OPEN_UNMERGED; retained candidate; original implementation released, candidate selection unresolved [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1186#issuecomment-7048828684) |
| [#1186](https://github.com/skytuhua-org/Gen-V1/issues/1186) / [PR #1195](https://github.com/skytuhua-org/Gen-V1/pull/1195) | bf6fdc26ef3d7f5552cad301ae45014a3ffd7e9f | OPEN_UNMERGED competing candidate; no authority inferred to close [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1186#issuecomment-7057687306) |
| [#1302](https://github.com/skytuhua-org/Gen-V1/issues/1302) / [PR #1420](https://github.com/skytuhua-org/Gen-V1/pull/1420) | cd8ea7d55d4d4b89f88675f4d5e888686754371a | OPEN_UNMERGED origin/chip/control overlap; exact hunk acknowledgment required [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1302#issuecomment-7091717379) |
| [#1976](https://github.com/skytuhua-org/Gen-V1/issues/1976) / [PR #2007](https://github.com/skytuhua-org/Gen-V1/pull/2007) | d5eb5f7f01a66f7eb1bdfa4f60f2d90c7363a44e | MERGED at 273b3384d533ab9358abde8f4b22a5fc6bd013bb; current-form reset and command Enter fixes present on baseline |
| [#2085](https://github.com/skytuhua-org/Gen-V1/issues/2085) / [PR #2094](https://github.com/skytuhua-org/Gen-V1/pull/2094) | 0ad58be5fdb5bf68f1c4ba2d1f810f8fe4690730 | OPEN_UNMERGED; independent model-picker presence outcome retained |
| [#1191](https://github.com/skytuhua-org/Gen-V1/issues/1191) / [PR #1204](https://github.com/skytuhua-org/Gen-V1/pull/1204) | 86fb73abb3909533cc6365826436aa488e5a622c | OPEN_UNMERGED; shared check/status/feedback CSS overlap remains separate |

## DESIGN

Claim a single child key and its exact paths on this parent, link that claim from the child, and include the canonical program journal when coordinating across parents. Read the entire assigned child, its immutable source and comments, plus the current parent allocation and relevant ownership journals first. Each child embeds its executable contract; the full retained historical parent remains available for provenance, acceptance audit and conflict recovery. A coordinator assigned the parent reads that full parent scope. The child consumes only the dependency output SHA and interface named in its plan. A receiver ACKs that artifact before work; it does not need ownership of the upstream feature.

Pure helpers and their tests can be drafted in parallel. Integration workers reserve only the named shared hunk, refresh current main and owner journals, integrate one bounded commit, publish focused verification and release the reservation. Do not reserve a file for the life of an epic. Current owner ACK is required for overlapping unpublished product work. A failed or rejected optional renderer may release an unchanged baseline slot so other independent renderer work continues.

| Shared files or seam | Participants | Integration rule |
| --- | --- | --- |
| apps/web/src/styles.css | [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP07 #2255](https://github.com/skytuhua-org/Gen-V1/issues/2255), [CTL04 #2242](https://github.com/skytuhua-org/Gen-V1/issues/2242) | Message-action,activity-arrival,original item/press verification hunks differ; no global owner. Existing candidate corrections remain original implementation owners. Adjacent retained scope: 1203 banner,1204 check/status. |
| packages/ui-shell/feedback.css | [ACT01 #2244](https://github.com/skytuhua-org/Gen-V1/issues/2244), [CTL04 #2242](https://github.com/skytuhua-org/Gen-V1/issues/2242) | ACT01 busy/indicator only; CTL04 verifies original toast keyframe and routes fix to retained owner. Distinct finite integration hunks. Adjacent retained scope: 1204 empty/status/toast. |

Unanticipated interface/schema changes return to the exact discovery owner for a reviewed full-plan revision. Required schema, writers, readers and decoders land atomically in one compatible PR. Rollback is per leaf and preserves other accepted children; no sweeping source resets or replacement of existing PRs.

## EXECUTION_DAG

The table contains functional dependencies and initial planning readiness. READY means the bounded task may be claimed after normal current-journal checks. It is not permission to bypass an existing owner, failed prerequisite or native release gate. The full executable T01... steps, tests and handoff are in each linked child.

| Task | Bounded deliverable | Kind | Required task outputs | Start state |
| --- | --- | --- | --- | --- |
| [CTL01 #2239](https://github.com/skytuhua-org/Gen-V1/issues/2239) | Resolve the shared-popover candidate and integration contract | discovery | None | READY: Read-only candidate and ownership disposition; no product takeover. |
| [CTL02 #2240](https://github.com/skytuhua-org/Gen-V1/issues/2240) | Anchor the shared-control surface without scaling its content | implementation | [CTL01 #2239](https://github.com/skytuhua-org/Gen-V1/issues/2239) | BLOCKED: Requires acknowledged canonical candidate/origin allocation from CTL01. |
| [CTL03 #2241](https://github.com/skytuhua-org/Gen-V1/issues/2241) | Preserve menu and Select values through row entrance and selection | implementation | [CTL01 #2239](https://github.com/skytuhua-org/Gen-V1/issues/2239) | BLOCKED: Needs canonical row/profile and current-owner ACK, but no conceptual dependency on CTL02. |
| [CTL04 #2242](https://github.com/skytuhua-org/Gen-V1/issues/2242) | Verify retained original popover consumers and residual motion rows | verification | [CTL01 #2239](https://github.com/skytuhua-org/Gen-V1/issues/2239) | BLOCKED: Requires selected existing candidate and exact residual-owner map; no replacement implementation. |
| [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | Accept shared controls across inputs, themes, zoom and interruption | verification | [CTL02 #2240](https://github.com/skytuhua-org/Gen-V1/issues/2240), [CTL03 #2241](https://github.com/skytuhua-org/Gen-V1/issues/2241), [CTL04 #2242](https://github.com/skytuhua-org/Gen-V1/issues/2242) | BLOCKED: Needs frozen compatible refinements and original-row evidence. |

Parent coordination tasks:

1. T01, verify allocation: refresh all complete child bodies, current candidate heads and latest owner releases. Output one accepted input/version record per claimed leaf. Positive: exact SHA and scope; negative: no silent-owner takeover. Done when the first leaf can ACK its inputs.
2. T02, coordinate independent work: assign only ready leaf keys and exact paths. Keep functional dependencies separate from hunk reservations. Publish each bounded output and its focused checks. Done when ready receivers can consume concrete artifacts.
3. T03, review coverage and integration: use the map below to review every original requirement against actual evidence, including existing completed work. A document/fixture/mock does not prove native behavior. Done when every row has PASS, a permitted reasoned non-adoption disposition, or an explicit blocker.
4. T04, final handoff: publish full status, immutable artifacts, current CI/review/main state, remaining gates and RELEASE OWNER=NONE. Close this parent only after the original accepted closure conditions are met and closure is authorized. Otherwise leave open with the exact remaining owner/input.

## VALIDATION

Requirement-to-task coverage:

| Prior requirement, design, task or acceptance | Current child allocation | Preservation note |
| --- | --- | --- |
| R01; BSC-T01; A01 | [CTL01 #2239](https://github.com/skytuhua-org/Gen-V1/issues/2239), [CTL04 #2242](https://github.com/skytuhua-org/Gen-V1/issues/2242), [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | Canonical candidate and owner selection, current-main comparison, preserved original scope, and no automatic merge or closure. |
| R02; A02; reference/licensing exclusions | [CTL02 #2240](https://github.com/skytuhua-org/Gen-V1/issues/2240), [CTL03 #2241](https://github.com/skytuhua-org/Gen-V1/issues/2241), [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | Independent local reference adaptation only. No Bluma package, source, assets, account, schema or preference. |
| R03; A03; explicit amendment1 | [CTL02 #2240](https://github.com/skytuhua-org/Gen-V1/issues/2240), [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | Measure final origin after flip, clamp and zoom. Preserve 180/140ms timing, .95 scale on the nonsemantic surface only, unscaled content, and no blur or bounce. |
| R04; A04 | [CTL03 #2241](https://github.com/skytuhua-org/Gen-V1/issues/2241), [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | Keep the same trigger and committed label. Navigation does not commit; a changed value dispatches once and cancel dispatches zero times. No clone or deferred action callback. |
| R05; A05; explicit amendments2/3 | [CTL03 #2241](https://github.com/skytuhua-org/Gen-V1/issues/2241), [CTL04 #2242](https://github.com/skytuhua-org/Gen-V1/issues/2242), [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | Pointer rows use 140ms and <=2px travel, 30ms spacing capped at 150ms, and zero delay for focused/selected rows. Keyboard rows appear together; no replay. True-change fade replaces the check spring only for ActionMenu/Select in the pilot. |
| R06; A06 | [CTL02 #2240](https://github.com/skytuhua-org/Gen-V1/issues/2240), [CTL03 #2241](https://github.com/skytuhua-org/Gen-V1/issues/2241), [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | Keyboard uses <=80ms opacity. Reduced has no travel or stagger. Off and the owning panel-disabled policy suppress motion through portals and during active effects. Consume speed once. |
| R07; A07 | [CTL01 #2239](https://github.com/skytuhua-org/Gen-V1/issues/2239), [CTL02 #2240](https://github.com/skytuhua-org/Gen-V1/issues/2240), [CTL03 #2241](https://github.com/skytuhua-org/Gen-V1/issues/2241), [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | Preserve current-form reset, required/fieldset behavior, Tab/Shift+Tab, navigation/typeahead, IME229, nested Escape, modal and owner-document focus. Retain merged PR2007. |
| R08; A08 | [CTL02 #2240](https://github.com/skytuhua-org/Gen-V1/issues/2240), [CTL03 #2241](https://github.com/skytuhua-org/Gen-V1/issues/2241), [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | Retarget at 40/90/130ms and cover reopening, value/options/disabled/policy/resize changes and unmount. No stale presence, double action, observer leak or frame loop. |
| R09; A09 | [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | Dark/light; 1920x1080,390x420,320x320; actual 100/125/150% zoom; 100 options with the last selected; long labels; forced colors; input/policy checks. Preserve 8px gap/gutter and 42px chrome. |
| A10; BSC-T04 | [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | Paired synthetic 1920x1080 videos without added titles or overlays; external immutable manifest and explicit native limits. |
| A11; BSC-T05 | [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | Complete source/body readback, actual remaining original states, release and recipient, and required normal review/native/main gates. |
| BSC-T02 | [CTL02 #2240](https://github.com/skytuhua-org/Gen-V1/issues/2240), [CTL03 #2241](https://github.com/skytuhua-org/Gen-V1/issues/2241) | Only missing bounded refinements on an acknowledged candidate; no duplicate original implementation. |
| BSC-T03 | [CTL02 #2240](https://github.com/skytuhua-org/Gen-V1/issues/2240), [CTL03 #2241](https://github.com/skytuhua-org/Gen-V1/issues/2241), [CTL04 #2242](https://github.com/skytuhua-org/Gen-V1/issues/2242), [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | Focused tests travel with implementation. Combined behavior/visual acceptance owns evidence across consumers. |
| Original T01/T02; A1-A4 shared contract and all consumers | [CTL01 #2239](https://github.com/skytuhua-org/Gen-V1/issues/2239), [CTL04 #2242](https://github.com/skytuhua-org/Gen-V1/issues/2242) | Retained PR1199/PR1195 candidates own original implementation. Verify one canonical keyframe contract, explicit/global opt-in disposition, 180ms enter/140ms exit, rows/checks and every listed consumer. |
| Original scope1/A5 model-picker consolidation | [CTL04 #2242](https://github.com/skytuhua-org/Gen-V1/issues/2242) | Remove private model-picker-in/out/fade keyframes in favor of the shared contract while retaining transform origins. PR2094 presence remains separately owned. |
| Original scope2/A6 four named row staggers | [CTL04 #2242](https://github.com/skytuhua-org/Gen-V1/issues/2242) | Composer command, saved drafts, saved layout and model picker retain 140ms rows with nth-child 30ms delay capped at 150ms, on open only. No scroll/keyboard replay. PR1199 model-picker omission remains an acceptance gate. |
| Original scope3/A7 nonpilot model-picker/planning checks | [CTL04 #2242](https://github.com/skytuhua-org/Gen-V1/issues/2242) | Retain the original 200ms spring, opacity .2->1 and scale .8->1, for nonpilot model-picker/planning checks under their existing owner. Only ActionMenu/Select changes to monotonic fade. Do not silently accept the candidate 140ms difference. |
| Original scope4/A8 banned ease-in | [CTL04 #2242](https://github.com/skytuhua-org/Gen-V1/issues/2242) | Retain the original model-picker exit ease-move contract. Review #1192/PR1546 CSS scope without takeover. |
| Original scope5/T02 exit vectors/press | [CTL04 #2242](https://github.com/skytuhua-org/Gen-V1/issues/2242) | Toast exit uses translateY(8px) scale(.98); ui-item-out uses translateY(4px); enabled active press uses scale(.97) with safe held/drag exceptions. A later reviewer calling these optional cannot weaken the accepted plan. |
| Original global rules and validation | [CTL02 #2240](https://github.com/skytuhua-org/Gen-V1/issues/2240), [CTL03 #2241](https://github.com/skytuhua-org/Gen-V1/issues/2241), [CTL04 #2242](https://github.com/skytuhua-org/Gen-V1/issues/2242), [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | Preserve ease-enter(.16,1,.3,1), ease-move(.4,0,.2,1), interruption, no held tween, quiet typing, Reduced/Off, speed once, compositor/limited measured layout, no permanent will-change, 150ms loading threshold, slow-motion and repeated-input checks. |
| Integration/rollback and current owners | [CTL01 #2239](https://github.com/skytuhua-org/Gen-V1/issues/2239), [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | Rebase the chosen branch only after ACK. Preserve PR2007/reset and #1948 Tab behavior; coordinate PR1420. Roll back only the pilot. Retain original model/planning/toast/item requirements. |

Publication checks: A01 (R01/T03), every prior substantive row mapped and full prior body retained byte-for-byte; A02 (R02/T01-T02), every child has all nine mandatory plan sections, executable steps and meaningful positive/negative checks; A03 (R03-R04/T01-T02), DAG has no cycles or missing tasks, native GitHub parent/child link completion is verified against this table and any unavailable relationship mutation is explicitly reported in the publication journal, and only exact hunk reservations serialize integration; A04 (R05/T03), product-specific safety/native/motion/evidence gates remain explicit and unexecuted checks are not reported as passing; A05 (R06/T04), final source/body/continuation readback matches exact UTF-8 bytes and published claims are released.

Run git diff --check and node scripts/check-doc-links.mjs for the documentation publication. Product unit/integration/browser/Windows/assistive and capture commands are in the full child/prior plans and run only during their authorized execution. No application tests or footage are executed by this planning revision.

Recordings retain the user's existing requirements: synthetic comparable scenarios, 1920x1080, 30fps, H.264, real interaction speed, no added titles, labels or simulated cursor overlays. Record source SHAs, actual environment/settings, hashes, limitations and verdict outside the footage. Browser zoom and fixtures do not prove native DPI or packaged behavior.

## STATE

Allocation and detailed plans are prepared for publication; immutable body/file verification and native links are recorded in the latest publisher journal. Future leaf execution remains unclaimed unless a current explicit child scope says otherwise. Existing implementation evidence listed above remains valid only for its recorded SHA and acceptance rows.

Next: start with a READY child after full current-journal/input readback; claim that leaf's narrow scope, publish milestones and release before pausing. On each milestone or at most 20 minutes of active work, checkpoint the canonical parent with child key, source SHA, exact checks, gaps and next action. Coordinator consolidates cross-parent handoffs on #2212. No worker receives an exclusive parent-wide implementation assignment.

## REFERENCES

- [Program and full coordination journal](https://github.com/skytuhua-org/Gen-V1/issues/2212)
- [Current parent and complete history](https://github.com/skytuhua-org/Gen-V1/issues/1186)
- [Verified planning base and repository instructions](https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17)
- [Original documentation publication #2215](https://github.com/skytuhua-org/Gen-V1/pull/2215)
- [Continuity documentation publication #2221](https://github.com/skytuhua-org/Gen-V1/pull/2221)
- [Renderer documentation publication #2231](https://github.com/skytuhua-org/Gen-V1/pull/2231)

## Previous accepted canonical body, retained in full

This archive is the complete issue body read before this subdivision. Its product requirements, exclusions, evidence, examples and prior revision history remain binding. Its previous execution grouping is replaced by the child allocation above. Historical status is a snapshot, not a claim that a current PR is merged or that acceptance passed.

<!-- BEGIN PRIOR CANONICAL BODY -->
## Publication record

**Revision:** `bluma-shared-controls-r1`  
**Complete Markdown:** [bluma-shared-controls-supplement.md](https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-shared-controls-supplement.md)  
**Documentation PR:** [#2215](https://github.com/skytuhua-org/Gen-V1/pull/2215)  
**Program and verification journal:** [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7167211508)

**Change record:** BSC-T01-T05 add anchored nonsemantic surface/selected-value continuity. Explicit ActionMenu/Select .95/no-bounce/keyboard amendments; preserve original scope, #1195/#1199 and current reset behavior.

This publication changes planning documents only. Product implementation and its acceptance remain pending. Existing implementation claims and PRs are preserved. The canonical plan below is reproduced completely and matches the committed Markdown; any earlier issue body is retained verbatim within that source.

<!-- BEGIN CANONICAL PLAN -->
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
<!-- END CANONICAL PLAN -->

<!-- END PRIOR CANONICAL BODY -->
