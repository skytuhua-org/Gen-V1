# Parallel execution for issue #2219

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-PARENT-2219-R1, 2026-11-25. Coordination parent: [#2219](https://github.com/skytuhua-org/Gen-V1/issues/2219). Program and consolidated journal: [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Verified planning base: main@defe9884530145e9c109b8ed98f80efac8beeb17. Previous complete body: 39729 UTF-8 bytes, SHA-256 8da75f3599dca39d369dc52ffd782175e93520f7f4dbf761cc53e6e6912df52d, reproduced unchanged below. The publication header supplies this revision's immutable file and reviewed documentation PR. Product implementation, review, merge and verified-on-main remain separate states.

## OBJECTIVE

Replace a broad single-worker assignment with 4 bounded, separately claimable tasks. Pure group/grace policy can proceed independently while Tooltip ARIA overlap is resolved; delegated binding, actual three-control pilot and native evidence remain narrow separate deliverables. Success means each worker can complete one explicit outcome from its own full issue, source and input commits, while unrelated workers proceed independently. This parent coordinates coverage and final acceptance; it does not reserve every child or shared file for one agent.

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
| [TIP02 #2268](https://github.com/skytuhua-org/Gen-V1/issues/2268) | packages/ui-shell/tooltip-transfer.ts; tests/tooltip-transfer.test.ts; scripts/public-source-files.json |
| [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269) | packages/ui-shell/Tooltip.tsx; packages/ui-shell/feedback.css; tests/tooltip-escape.test.ts; tests/e2e/ui-shell-overlays-fixture.tsx; tests/e2e/ui-shell-overlays.spec.ts |
| [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270) | apps/web/src/Artifact.tsx; DESIGN.md; tests/e2e/task-interface.spec.ts |
| [TIP05 #2271](https://github.com/skytuhua-org/Gen-V1/issues/2271) | Exact verified discovery procedure is in the child plan. |

Existing work and ownership inspected during planning:

| Existing issue / PR | Inspected head | Current scope and release evidence |
| --- | --- | --- |
| [#1976](https://github.com/skytuhua-org/Gen-V1/issues/1976) / [PR #2007](https://github.com/skytuhua-org/Gen-V1/pull/2007) | d5eb5f7f01a66f7eb1bdfa4f60f2d90c7363a44e | MERGED at273b3384d533ab9358abde8f4b22a5fc6bd013bb; freshness protected [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1976#issuecomment-7122013256) |
| [#1976](https://github.com/skytuhua-org/Gen-V1/issues/1976) / [PR #2011](https://github.com/skytuhua-org/Gen-V1/pull/2011) | f672b132e0d6420cdd50b4f9367b083b9ec95bf6 | OPEN_UNMERGED caller-ARIA candidate; author released; integration disposition still required [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1976#issuecomment-7122067794) |
| [#2219](https://github.com/skytuhua-org/Gen-V1/issues/2219) / [PR #2221](https://github.com/skytuhua-org/Gen-V1/pull/2221) | 0ccda0526baafe343bff33b72c7f103e600cc51e | OPEN_UNMERGED original docs; publication RELEASED [Journal](https://github.com/skytuhua-org/Gen-V1/issues/2219#issuecomment-7168577124) |

## DESIGN

Claim a single child key and its exact paths on this parent, link that claim from the child, and include the canonical program journal when coordinating across parents. Read the entire assigned child, its immutable source and comments, plus the current parent allocation and relevant ownership journals first. Each child embeds its executable contract; the full retained historical parent remains available for provenance, acceptance audit and conflict recovery. A coordinator assigned the parent reads that full parent scope. The child consumes only the dependency output SHA and interface named in its plan. A receiver ACKs that artifact before work; it does not need ownership of the upstream feature.

Pure helpers and their tests can be drafted in parallel. Integration workers reserve only the named shared hunk, refresh current main and owner journals, integrate one bounded commit, publish focused verification and release the reservation. Do not reserve a file for the life of an epic. Current owner ACK is required for overlapping unpublished product work. A failed or rejected optional renderer may release an unchanged baseline slot so other independent renderer work continues.

| Shared files or seam | Participants | Integration rule |
| --- | --- | --- |
| apps/web/src/task-interface.css, tests/e2e/task-interface.spec.ts | [ART02 #2259](https://github.com/skytuhua-org/Gen-V1/issues/2259), [ART03 #2260](https://github.com/skytuhua-org/Gen-V1/issues/2260), [ACT02 #2245](https://github.com/skytuhua-org/Gen-V1/issues/2245), [ACT04 #2247](https://github.com/skytuhua-org/Gen-V1/issues/2247), [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270) | Tabs selectors/tests, disclosure/progressive/nested blocks, ChoiceList validation, action status and Artifact-toolbar cases have distinct reservations. Serialize shared imports/fixture setup only while active. Tests stay with owning implementation. |
| packages/ui-shell/feedback.css | [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269), [ACT01 #2244](https://github.com/skytuhua-org/Gen-V1/issues/2244) | TIP03 owns only tooltip pointer-warm selector; ACT01 owns busy/indicator feedback hunks. Preserve global tokens/#2214 duration ownership; finite adjacent selector integration only. |
| scripts/public-source-files.json | [ANC02 #2263](https://github.com/skytuhua-org/Gen-V1/issues/2263), [TIP02 #2268](https://github.com/skytuhua-org/Gen-V1/issues/2268), [INB03 #2273](https://github.com/skytuhua-org/Gen-V1/issues/2273), [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [MTH02 #2279](https://github.com/skytuhua-org/Gen-V1/issues/2279), [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295) | Short exact new-helper source/test/runtime entry reservations only. Serialize with coordinator documentation inventory and other package/source additions. Never regenerate unrelated entries or create a feature adoption dependency. |

Unanticipated interface/schema changes return to the exact discovery owner for a reviewed full-plan revision. Required schema, writers, readers and decoders land atomically in one compatible PR. Rollback is per leaf and preserves other accepted children; no sweeping source resets or replacement of existing PRs.

## EXECUTION_DAG

The table contains functional dependencies and initial planning readiness. READY means the bounded task may be claimed after normal current-journal checks. It is not permission to bypass an existing owner, failed prerequisite or native release gate. The full executable T01... steps, tests and handoff are in each linked child.

| Task | Bounded deliverable | Kind | Required task outputs | Start state |
| --- | --- | --- | --- | --- |
| [TIP02 #2268](https://github.com/skytuhua-org/Gen-V1/issues/2268) | Implement pure tooltip group-transfer policy | implementation | None | READY: Pure proposed policy module requires no Tooltip.tsx or feedback.css ownership. |
| [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269) | Bind tooltip warm transfer, lifecycle and accessible freshness | implementation | [TIP02 #2268](https://github.com/skytuhua-org/Gen-V1/issues/2268) | BLOCKED: Needs TIP02 API and explicit #1976/#2011 Tooltip ARIA integration disposition; merged #2007 freshness must remain. |
| [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270) | Enable grouped help on the existing artifact toolbar | implementation | [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269) | BLOCKED: Needs accepted delegated Tooltip behavior and a finite Artifact toolbar/test/DESIGN paragraph reservation. |
| [TIP05 #2271](https://github.com/skytuhua-org/Gen-V1/issues/2271) | Verify artifact tooltip transfer on Windows and assistive technology | verification | [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270) | BLOCKED: Needs exact reviewed actual-Artifact candidate and reusable baseline/candidate footage. |

Parent coordination tasks:

1. T01, verify allocation: refresh all complete child bodies, current candidate heads and latest owner releases. Output one accepted input/version record per claimed leaf. Positive: exact SHA and scope; negative: no silent-owner takeover. Done when the first leaf can ACK its inputs.
2. T02, coordinate independent work: assign only ready leaf keys and exact paths. Keep functional dependencies separate from hunk reservations. Publish each bounded output and its focused checks. Done when ready receivers can consume concrete artifacts.
3. T03, review coverage and integration: use the map below to review every original requirement against actual evidence, including existing completed work. A document/fixture/mock does not prove native behavior. Done when every row has PASS, a permitted reasoned non-adoption disposition, or an explicit blocker.
4. T04, final handoff: publish full status, immutable artifacts, current CI/review/main state, remaining gates and RELEASE OWNER=NONE. Close this parent only after the original accepted closure conditions are met and closure is authorized. Otherwise leave open with the exact remaining owner/input.

## VALIDATION

Requirement-to-task coverage:

| Prior requirement, design, task or acceptance | Current child allocation | Preservation note |
| --- | --- | --- |
| R01 / A01 cold350 and pending does not warm | [TIP02 #2268](https://github.com/skytuhua-org/Gen-V1/issues/2268), [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269) | Token remains existing350; deterministic349/350. |
| R02-R03 / A02 direct peer and internal gap warmth | [TIP02 #2268](https://github.com/skytuhua-org/Gen-V1/issues/2268), [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269), [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270), [TIP05 #2271](https://github.com/skytuhua-org/Gen-V1/issues/2271) | Open required; gap bubble hidden;299warm/300cold; no warm animation. |
| R04 / A03 DOM/key/document/dialog/modal identity | [TIP02 #2268](https://github.com/skytuhua-org/Gen-V1/issues/2268), [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269), [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270) | Nested/different instances and changed keys reset. |
| R05 / A04 keyboard100 focus-visible isolation | [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269), [TIP05 #2271](https://github.com/skytuhua-org/Gen-V1/issues/2271) | Keyboard clears pointer warmth;99/100 boundary and focus preserved. |
| R06 / A05 hard resets, suppression and cleanup | [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269), [TIP05 #2271](https://github.com/skytuhua-org/Gen-V1/issues/2271) | New target generation; no descendant reopening after dismissal. |
| R07 / A04-A05 Escape/IME/229/drag/touch | [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269), [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270), [TIP05 #2271](https://github.com/skytuhua-org/Gen-V1/issues/2271) | Pending propagates,open consumes once,active drag priority untouched. |
| R08 / A06 title/data-tooltip/owned-ARIA freshness | [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269) | Deadline/opening kind preserved; caller ARIA not overwritten;empty clears. |
| R09 / A04,A06,A08 one bubble/portal/geometry/no focus/live | [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269), [TIP05 #2271](https://github.com/skytuhua-org/Gen-V1/issues/2271) | Native dialog root preserved; position content before paint. |
| R10 / A07 three-control real Artifact pilot | [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270), [TIP05 #2271](https://github.com/skytuhua-org/Gen-V1/issues/2271) | Rendered held artifact group identity; inert/permission/actions intact. |
| R11 / A05,A09 bounded local state/cost/exclusions | [TIP02 #2268](https://github.com/skytuhua-org/Gen-V1/issues/2268), [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269), [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270) | No deps/network/analytics/preferences/polling/per-control listeners/full scans. |
| R12 / A02,A08 motion policy/geometry/zoom | [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269), [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270), [TIP05 #2271](https://github.com/skytuhua-org/Gen-V1/issues/2271) | Warm selector defeats normal/closed/reduced animation; cold tokens untouched. |
| R13 / A06,A09 #2007 and #2011 integration | [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269) | Explicit #1976 allocation; no Toast/Composer scope takeover. |
| R14 / A10 factual tests/films/native/review/release | [TIP02 #2268](https://github.com/skytuhua-org/Gen-V1/issues/2268), [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269), [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270), [TIP05 #2271](https://github.com/skytuhua-org/Gen-V1/issues/2271) | Browser fixture/native/actual actions distinct; all future checks clearly NOT_RUN. |
| T01 baseline/overlap; T02 tests; T03 delegated binding; T04 pilot; T05 evidence; T06 review | [TIP02 #2268](https://github.com/skytuhua-org/Gen-V1/issues/2268), [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269), [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270), [TIP05 #2271](https://github.com/skytuhua-org/Gen-V1/issues/2271) | Baseline embedded in first deliverables; tests attached to owning code. |
| Design grouping marker, owner eligibility, opening kind/timers, fresh text, rollback and DESIGN paragraph | [TIP02 #2268](https://github.com/skytuhua-org/Gen-V1/issues/2268), [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269), [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270) | Opacity-zero revealed toolbar remains eligible if laid out; disabled existing help preserved; remove marker for rollback. |
| All validation commands and1920x1080/30fps/H264 no-overlay/theme/zoom evidence | [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269), [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270), [TIP05 #2271](https://github.com/skytuhua-org/Gen-V1/issues/2271) | Actual native portal/focus and real pin acceptance fixture, no fabricated archive click. |

Publication checks: A01 (R01/T03), every prior substantive row mapped and full prior body retained byte-for-byte; A02 (R02/T01-T02), every child has all nine mandatory plan sections, executable steps and meaningful positive/negative checks; A03 (R03-R04/T01-T02), DAG has no cycles or missing tasks, native GitHub parent/child link completion is verified against this table and any unavailable relationship mutation is explicitly reported in the publication journal, and only exact hunk reservations serialize integration; A04 (R05/T03), product-specific safety/native/motion/evidence gates remain explicit and unexecuted checks are not reported as passing; A05 (R06/T04), final source/body/continuation readback matches exact UTF-8 bytes and published claims are released.

Run git diff --check and node scripts/check-doc-links.mjs for the documentation publication. Product unit/integration/browser/Windows/assistive and capture commands are in the full child/prior plans and run only during their authorized execution. No application tests or footage are executed by this planning revision.

Recordings retain the user's existing requirements: synthetic comparable scenarios, 1920x1080, 30fps, H.264, real interaction speed, no added titles, labels or simulated cursor overlays. Record source SHAs, actual environment/settings, hashes, limitations and verdict outside the footage. Browser zoom and fixtures do not prove native DPI or packaged behavior.

## STATE

Allocation and detailed plans are prepared for publication; immutable body/file verification and native links are recorded in the latest publisher journal. Future leaf execution remains unclaimed unless a current explicit child scope says otherwise. Existing implementation evidence listed above remains valid only for its recorded SHA and acceptance rows.

Next: start with a READY child after full current-journal/input readback; claim that leaf's narrow scope, publish milestones and release before pausing. On each milestone or at most 20 minutes of active work, checkpoint the canonical parent with child key, source SHA, exact checks, gaps and next action. Coordinator consolidates cross-parent handoffs on #2212. No worker receives an exclusive parent-wide implementation assignment.

## REFERENCES

- [Program and full coordination journal](https://github.com/skytuhua-org/Gen-V1/issues/2212)
- [Current parent and complete history](https://github.com/skytuhua-org/Gen-V1/issues/2219)
- [Verified planning base and repository instructions](https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17)
- [Original documentation publication #2215](https://github.com/skytuhua-org/Gen-V1/pull/2215)
- [Continuity documentation publication #2221](https://github.com/skytuhua-org/Gen-V1/pull/2221)
- [Renderer documentation publication #2231](https://github.com/skytuhua-org/Gen-V1/pull/2231)

## Previous accepted canonical body, retained in full

This archive is the complete issue body read before this subdivision. Its product requirements, exclusions, evidence, examples and prior revision history remain binding. Its previous execution grouping is replaced by the child allocation above. Historical status is a snapshot, not a claim that a current PR is merged or that acceptance passed.

<!-- BEGIN PRIOR CANONICAL BODY -->
## Publication record

**Revision:** `FRONTEND-TOOLTIP-R1`  
**Complete Markdown:** [frontend-tooltip-warm-transfer.md](https://github.com/skytuhua-org/Gen-V1/blob/0ccda0526baafe343bff33b72c7f103e600cc51e/docs/agent-plans/frontend-tooltip-warm-transfer.md)  
**SHA-256:** `0702d9e164366db82703f89db48723d5eb5d9f0ca7d143d1546ea254fa7e9b02`  
**Documentation PR:** [#2221](https://github.com/skytuhua-org/Gen-V1/pull/2221)  
**Program and journal:** [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212)

**Previous revision/history:** Initial complete implementation plan. Initial extension commit `f9ad065f0d52f839236a527898776b5a99701443`; tooltip eligibility clarification `190da16adce4c30b659af892e445b36be7e41e01`; current source `0ccda0526baafe343bff33b72c7f103e600cc51e` uses commit-pinned child links that work in both Markdown files and issue bodies.

**Change record:** New explicit-group pointer transfer with retained keyboard behavior, hard cancellation and a three-control artifact pilot. Preserves current freshness and pending ARIA ownership.

This publication contains the complete canonical plan below and identical committed Markdown. It changes plans and their source inventory only. Product implementation, runtime reproduction and application/native acceptance remain **NOT_STARTED / NOT_RUN**. Existing implementation owners, candidate PRs and original requirements remain in force. The connector cannot upload a real Markdown issue attachment; the committed source and review PR provide the required separate-file fallback. Publication readback and ownership release are recorded in the issue journal.

<!-- BEGIN CANONICAL PLAN -->
# Tooltip transfer within an explicit control group

## META

| Field | Value |
| --- | --- |
| Repository | skytuhua-org/Gen-V1 |
| Plan revision / date | FRONTEND-TOOLTIP-R1 / 2026-11-25 |
| Baseline | main at `96ca4c3bd0664fca53775fbe31915c209641986c`, verified during planning |
| Parent | [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212), extension X04-tooltip |
| Canonical child issue | [#2219](https://github.com/skytuhua-org/Gen-V1/issues/2219); this document is the complete execution plan |
| Draft branch / file | `docs/frontend-continuity-plans`; `docs/agent-plans/frontend-tooltip-warm-transfer.md` |
| Current status | Source and primary-document review complete; product implementation and runtime validation NOT_STARTED |
| Planning claim | [codex-cloud-bluma-bd935d-tooltip-0580](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7167990819), delegated by [parent checkpoint 006](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7167827229) |
| Provenance | Current repository source, [Vercel interaction guidance](https://vercel.com/design/guidelines), [Radix Tooltip documentation](https://www.radix-ui.com/primitives/docs/components/tooltip); concepts only, no imported component code |

The issue owns one bounded interaction improvement: pointer tooltip transfer among explicitly grouped controls. It does not own a general tooltip rewrite or the separate lifecycle repairs under #1976. All numbers below are either existing repository contracts or explicit decisions in this proposal. Browser behavior has not been reproduced during planning.

## OBJECTIVE

A person inspecting adjacent artifact actions currently waits the full pointer dwell for every action. `TooltipLayer.schedule` calls `hide`, which clears `opened`, and each pointer owner receives the configured 350 ms dwell. The layer has no group or recently opened state.

Keep the deliberate delay for the first control. Once its tooltip actually opens, show the next tooltip in the same explicit group immediately, with current text at the next control and no transfer animation. Retain normal button activation, keyboard help, accessible names, native-title suppression, modal ownership and cancellation. Limit the first rollout to the three existing secondary artifact actions.

Success means deterministic 350 ms cold pointer timing, immediate eligible pointer transfer, unchanged 100 ms keyboard timing, and zero carryover across unrelated or inactive owners. An inspection pass must not send an artifact command.

## REQUIREMENTS

| ID | Required outcome and boundary |
| --- | --- |
| R01 | First pointer tooltip uses existing `--ui-tooltip-dwell`, currently 350 ms. Ungrouped controls remain cold. Pending hover alone never warms a group. |
| R02 | After a valid pointer tooltip opens, direct transfer to a different valid peer in the same group opens without another dwell. Replace the single bubble's content and position before paint; no leave/enter, crossfade, slide or position tween during the transfer. |
| R03 | Adopt the proposed 300 ms grace only while crossing whitespace inside that same group. Hide the previous bubble in the gap. Entry at less than 300 ms is warm; entry at or after 300 ms starts a full cold dwell. Leaving the group resets immediately. |
| R04 | Group identity includes its DOM boundary, explicit owner-key value, and modal/document ownership. Nested groups, separate artifact instances, changed owner keys and changed modal contexts cannot share warmth. |
| R05 | Preserve `FOCUS_DWELL_MS = 100`, the `:focus-visible` gate, focus placement and tab order. Keyboard focus neither primes nor consumes pointer warmth. This plan does not make keyboard tooltips instantaneous or change their animation policy. |
| R06 | Escape, pointer activation, focusout, scroll, window blur, document becoming hidden, group/target removal or inactivation cancel pending dwell, grace and stale callbacks. Keyboard help cannot outlive focus departure. A dismissed target cannot reopen from movement between its own descendants; genuine exit/reentry is cold. |
| R07 | Preserve Escape precedence: pending tooltip does not consume Escape; an open active tooltip consumes it once; IME Escape and legacy keyCode 229 remain untouched. Preserve the active drag owner's existing priority. Pointer drag and touch do not start warm transfer. |
| R08 | Preserve latest `title` / `data-tooltip` reads, suppression of native title while custom help is pending/open, generated accessible-name/description bookkeeping, and caller-owned ARIA. Text changes do not restart a pending dwell or replay transfer motion. Empty/removed help dismisses and clears warm state. |
| R09 | Keep one noninteractive `role="tooltip"` bubble, current viewport clamping, readable wrapping and the current native-dialog portal root. No focus movement, new tab stop, menu, live announcement, decorative sound or duplicate visual tooltip. |
| R10 | Pilot only `Artifact.tsx`'s existing `.artifact-secondary-tools`: View source, Pin/Unpin, Archive. Preserve its `inert={editorHeld || !ready}`, exact action callbacks, permission/dirty-state gates, labels and pressed/expanded states. |
| R11 | No new dependency, remote request, analytics, persisted preference, copied third-party source or mandatory account. Keep state local to the layer/window. No per-control listeners, intervals, polling or full-document geometry scans. |
| R12 | Warm transfer has no animation under normal, reduced or off motion. Existing cold entry/exit tokens and inherited motion policy remain in force. Dark/light geometry and readable labels remain unchanged. |
| R13 | Integrate without discarding merged #2007 freshness behavior or the pending #2011 caller-ARIA ownership repair. Serialize overlapping Tooltip.tsx edits with #1976's owner. |
| R14 | Prove timing/cancellation with deterministic tests, native event/portal behavior with browser fixtures, and usefulness with the real artifact toolbar. Capture before/after evidence and disclose unrun desktop or runtime gates. |

The 300 ms grace is a proposed product decision, chosen to tolerate movement across a compact toolbar gap without retaining app-wide hover history. Radix documents a configurable `skipDelayDuration` with a 300 ms default. That is precedent, not a required platform standard. Vercel specifies delayed first tooltips and immediate peers; it does not prescribe this plan's scope, cooldown or keyboard timing.

Out of scope: ContextMeter category warm transfer owned by [#1115](https://github.com/skytuhua-org/Gen-V1/issues/1115); ThreadHoverCard and its rich-card grace under [#1187](https://github.com/skytuhua-org/Gen-V1/issues/1187); ActionMenu/Select #1186; popover rewrites #1302; provenance/reference evidence #2213; duration resolver #2214; composer #1188; adding tooltip text to unlabeled product flows; changing the existing 160/120 ms cold tooltip tokens; changes to artifact Tabs, rendering, persistence or actions. Do not group the entire header, composer, window or document as a shortcut.

## REPO_MAP

All paths below exist at the stated baseline unless explicitly marked proposed.

| Path / symbol | Observed behavior and planned role |
| --- | --- |
| `packages/ui-shell/Tooltip.tsx`: `TooltipLayer`, `adopt`, `owner` | Singleton delegated layer; pointer dwell per owner; keyboard dwell 100 ms; title suppression and generated ARIA; latest text observer; native-dialog portal. Primary implementation boundary. |
| `packages/ui-shell/feedback.css`: `.ui-tooltip` | Fixed noninteractive bubble; 160/120 ms token-driven entry/exit; OS reduced-motion fade override. Add only a narrowly scoped warm-transfer motion exception. |
| `packages/ui-shell/tokens.css` | Existing `--ui-tooltip-dwell: 350ms` and tooltip motion tokens. Read dependency; no token change planned. |
| `apps/web/src/Artifact.tsx`: `.artifact-secondary-tools` | Existing three icon controls; group becomes inert while held/restoring. Add one proposed group marker with an owner key. |
| `tests/tooltip-escape.test.ts` | Fake timers and React harness cover pending/open Escape, IME and freshest title at original deadline. Extend for state decisions; do not claim these mocks prove browser layout. |
| `tests/shared-ui-lifecycle-v3.test.ts` | Current #2007 tests preserve `data-tooltip` freshness and suppression markers. Required regression; avoid unrelated Select/Composer changes. |
| `tests/feedback-primitives.test.ts` | Browser-backed title adoption/current accessible-description tests. Required regression; no broad feedback refactor. |
| `tests/e2e/ui-shell-overlays-fixture.tsx`, `ui-shell-overlays.spec.ts`, `ui-shell-overlays.playwright.config.ts` | Real TooltipLayer tooltip fixture and existing short-viewport bounds test. Extend fixture/spec for grouped owner, modal, focus and lifecycle cases. Config uses Edge on port 5393. |
| `tests/e2e/task-interface.spec.ts`, `task-interface-fixture.ts`, `task-interface.playwright.config.ts`, `app-ready.ts` | Real app with synthetic snapshot, `taskFixture`, `serveTaskFixture`, `openApp`; records commands and publishes snapshot revisions. Add real artifact toolbar scenario in existing spec; port 5188. |
| `tests/e2e/chat-view-escape.spec.ts`, `chat-view-modes.playwright.config.ts` | Active drag Escape wins before TooltipLayer capture; then normal tooltip dismissal resumes. Required regression when shared Escape/listener logic changes; port 5491. |
| `DESIGN.md`, `CONTRIBUTING.md`, `AGENTS.md` | Motion, 350 ms pointer dwell, modal ownership, evidence and issue coordination contracts. Document the explicit group exception in DESIGN with implementation. |
| `scripts/public-source-files.json` | Coordinator registers this new Markdown plan in source only during documentation publication, not runtime. Existing product/test files suffice for implementation. Any later new runtime/test module requires its own source entry and a runtime entry only when packaged. The Markdown checker separately discovers tracked documents from the Git index. |

[#2007](https://github.com/skytuhua-org/Gen-V1/pull/2007) is merged at `273b3384d533ab9358abde8f4b22a5fc6bd013bb`; baseline Tooltip.tsx includes its `data-tooltip` handling. [#2011](https://github.com/skytuhua-org/Gen-V1/pull/2011) remains open at `f672b132e0d6420cdd50b4f9367b083b9ec95bf6`, reported not mergeable when reviewed. Its Tooltip patch introduces `naming` / `describing` WeakSets and observation of caller-written `aria-label` / `aria-description`. Its older observer filter cannot simply replace the current filter because that would lose #2007's `data-tooltip` coverage. Refresh both PRs before implementation; reported prior PR checks are not checks performed by this planner.

## DESIGN

### Explicit groups and eligibility

Add a proposed `data-tooltip-group` attribute to the existing artifact-secondary-tools div. Its value is an owner key, for example `JSON.stringify([artifact.threadId, artifact.id, artifact.revision])`. All three fields are used by Artifact.tsx at the baseline. Use its rendered `artifact`, which may be `heldArtifact.current` while edits hold an older revision, rather than an unaccepted incoming revision. This is a proposed internal marker, not an existing API. Treat the actual group element and key together as identity; two DOM groups with the same value still remain independent. The nearest marked ancestor wins.

The identity also captures the target's owner document, closest open native dialog and closest modal region (`[role="dialog"][aria-modal="true"]`). Reparenting, replacing or closing that owner invalidates the record. Do not change the current portal algorithm, `closest('dialog[open]') ?? document.body`, as part of this change. Do not infer groups from CSS class, screen distance or the last tooltip anywhere in the app.

A target must be connected, belong to the captured group/owner, have nonempty current help distinct from its own visible text, and not sit within inert, hidden or aria-hidden content. Validate eligibility when scheduling, when the deadline runs, on transfer and on relevant lifecycle mutation. Check rendered visibility/geometry at these boundaries, not on every pointermove. Transitional opacity alone is not an inactive owner: the existing `.artifact-secondary-tools` starts at opacity zero and reveals on header hover or focus-within while remaining laid out. Preserve that first pointer/focus path using hidden/inert/aria-hidden, display/visibility and layout-rect checks; verify the real header reveal in T04. A disabled control may still provide existing explanatory hover text; do not globally remove that help.

### State and timing contract

Keep the current target, opening kind, pending generation and warm record separately. Proposed opening kinds are `pointer-cold`, `pointer-warm` and `keyboard`. The implementation may keep them inside Tooltip.tsx; no exported state framework or new provider is required.

| Event / starting state | Required result |
| --- | --- |
| Cold pointer enters A | Adopt/suppress native title; schedule A for configured dwell, default 350 ms. No warm record yet. |
| Pointer leaves A before deadline and enters B | Cancel A. B receives a fresh full dwell. A's stale callback cannot open or warm anything. |
| A's valid pointer deadline completes | Read latest help, position one bubble, open A and mark only A's explicit group warm. Ungrouped A cannot prime another target. |
| Open A to eligible B in same group | Cancel obsolete callbacks; adopt B's latest help; replace/measure one bubble and render B without dwell or animation. Do not display B's text at A's coordinates. |
| Open A to blank space within the same group | Remove the old bubble immediately; retain warmth for less than 300 ms. Do not keep A's tooltip visible in the gap. |
| Same-group peer entered before grace expires | Open immediately without animation; it becomes the active warm target. Cancel grace timer. |
| Grace reaches 300 ms | Clear warmth. A later peer starts a new full dwell. Wall-clock passage alone never opens a tooltip. |
| Pointer leaves group, enters another group or document | Hide/cancel and clear warmth immediately; a new group starts cold. |
| Keyboard focus-visible enters a target | Clear pointer warmth; schedule the existing 100 ms keyboard dwell even if a pointer tooltip was warm. Preserve existing keyboard presentation. |
| Focus leaves a pending or open keyboard target | Cancel its timer and dismiss its bubble immediately in the interaction state. Focus on a control without help must never permit the old target to open later. A new eligible focus target receives its own 100 ms dwell. |
| Target text changes before/after opening | Use latest text without restarting the deadline or altering opening kind. Empty/removed help clears pending/open/warm state. |
| Explicit dismissal or invalid owner | Hide/cancel, increment generation, clear group and grace. Old animation completion, timer, mutation or disconnected target cannot revive it. |

The grace expires only after leaving an open tooltip into internal whitespace. It is not a maximum duration for an open tooltip, and it does not allow warmth to survive outside the group. Moving among SVG/icon descendants of the same control is not a new owner entry and must not restart dwell or cooldown.

Use at most one pending dwell timer and one grace timer for the layer. Cancel both on cleanup. Each deferred callback compares a generation and its captured target/group identity before updating state. Avoid keeping removed targets alive in global registries. Observe only the current pending/open/warm owner's lifecycle where possible; if the existing observer is extended, filter relevant records and perform no descendant rescans or repeated state writes for the layer's own portal changes.

### Dismissal, modality and accessibility

Retain document delegation. Ordinary owner exit and explicit dismissal need distinct reset paths; the current single `hide` cannot encode both. Escape, pointerdown/activation, focusout, captured scroll, window blur and document hiding are hard resets. Resolve disconnected/inert/hidden/changed-owner records promptly even when no further pointer event occurs. Leaving the browser window also resets. Preserve document focusout cancellation even when focus moves programmatically to a control with no tooltip.

After explicit dismissal, remember the dismissed target only until genuine pointer exit so movement over its icon descendants cannot reopen it. A different peer may still open, but must use a cold dwell. Group removal or inactivation clears that temporary suppression. Touch does not start the pointer path; pointerover during held-button drag cannot warm or reopen a tooltip. Preserve the independent drag handler's existing Escape priority rather than adding a competing global priority layer.

Keep `adopt` and its freshness/ARIA ownership contracts. Changing timing must not overwrite a caller's `aria-label`, `aria-labelledby`, `aria-description` or `aria-describedby`. Preserve useful generated naming for icon-only title controls and descriptions for already named controls. Transfer restores the old owner's adopted-title lifecycle and suppresses the new native title; there must be one custom bubble and no native duplicate while it is pending/open. Never make tooltip text the sole visible error or action result.

The bubble stays noninteractive and does not move focus. Keyboard activation follows the original control callback immediately. Pointer activation clears help before the original action proceeds; no animation or timer awaits the action. Preserve IME Escape, pending-tooltip Escape passthrough and one-time open-tooltip consumption. Run the drag regression without rewriting its keyboard-focus fixture merely to make a new test pass.

### Motion, integration and rollback

Add a proposed `data-opening="pointer-warm"` flag to the bubble and a scoped CSS rule that suppresses its animation. It must win over normal, closed and reduced-motion animation declarations for a warm transfer. Do not interpolate top/left or scale text. Preserve the opening kind when title/data-tooltip changes refresh shown state, so a mutation cannot inadvertently replay a cold entrance. Cold entry and ordinary non-transfer dismissal keep existing token-driven motion. Internal-gap removal and invalid-owner removal are immediate; these are explicit exceptions. Off stays immediate and Reduced stays nonspatial. Any permitted exit animation is visual only and cannot retain keyboard/Escape ownership or delay a new opening.

Before editing Tooltip.tsx, coordinate a single integrator with #1976. Either consume its merged caller-ARIA repair, or agree a reviewed combined patch with that owner. Do not silently duplicate/cherry-pick the whole PR or take ownership of its Toast/Composer changes. The final observer must retain title, data-tooltip and caller-ARIA behavior together, including suppression guards. The new timing tests can be prepared while that integration is pending, but Tooltip implementation is blocked on an agreed overlap strategy.

Do not claim tokens or unrelated feedback selectors. #2213 owns provenance/reference evidence; #2214 owns the duration resolver, not this tooltip CSS selector. Refresh current claims before editing feedback.css and coordinate only an actual overlapping hunk. Artifact Tabs work must not reformat the shared Artifact.tsx header while this one-attribute pilot change lands. Add the explicit first-pointer/group-transfer exception to DESIGN's tooltip paragraph and retain the rich-card rule.

No data migration, permission or API change is required. Roll back by removing the pilot group marker; the layer then follows existing cold timing for those controls. A full code revert must preserve independently landed #1976 repairs. No telemetry is required for rollout.

## EXECUTION_DAG

Dependency order: T01 -> T02 -> T03 -> T04 -> T05 -> T06. Only T02 test preparation may proceed while T01's shared-file agreement is pending; product edits wait for that agreement. Each implementer claims a task on the canonical child issue and links the parent journal before editing.

### T01: Refresh baseline, ownership and reproduction

**Inputs/dependencies:** Entire canonical issue/plan/journal, current main, #1976, #2007, #2011, #1115 and actual shared-file ownership. #2213 and #2214 remain separate provenance/resolver tracks, not assumed CSS dependencies. No prerequisite task.

**Steps/files:** Reopen the listed source/test files and current PR patches. Record base/head SHAs and owner acknowledgement. Preserve both freshness and caller-ARIA contracts in the integration strategy. Use the real artifact fixture to record cold A-to-B behavior with the current code. Confirm the three-control pilot and group key are sufficient for inline, expanded and workspace ownership.

**Tests:** Positive: A opens after the existing dwell and has current text. Negative: B still incurs a fresh dwell at baseline; assert the absence of group warmth, not an assumed runtime defect. Confirm pending Escape and 100 ms keyboard behavior before changing it.

**Output/done:** Repro evidence, exact touched-file claim and overlap agreement are posted; source-only hypotheses are labeled. If another worker already implemented this outcome, compare acceptance and supplement that issue instead. **Handoff:** T02 author and Tooltip integrator. Independent boundary is discovery, no product edit.

### T02: Specify timing and owner boundaries with executable tests

**Depends:** T01 source confirmation; ownership agreement required before product edits.

**Steps/files:** Extend `tests/tooltip-escape.test.ts` with fake-timer cases for first dwell, canceled pending A, immediate warm B, internal gap at 299/300 ms, cross-group reset, keyboard 99/100 ms, generation cancellation and cleanup. Extend mocks to model real owner identity instead of their current unconditional `closest()` result. Prepare browser fixture scenarios in `tests/e2e/ui-shell-overlays-fixture.tsx` / spec for two groups, ungrouped peer, nested group, native dialog, ARIA modal and inert/removal controls.

**Tests:** Positive: a completed pointer opening alone establishes warmth. Negative: pending hover, keyboard opening, unrelated group and reused DOM with a changed key cannot do so. Existing latest-title deadline and IME cases remain unchanged.

**Output/done:** Tests express observable decisions and fail current baseline for the new behavior; existing compatibility tests remain meaningful. Record actual red results, or an honest environment blocker. **Handoff:** T03 integrator; test fixture ownership is separate from product CSS/header work.

### T03: Implement the delegated state and lifecycle contract

**Depends:** T01 overlap agreement and T02 tests.

**Steps/files:** In Tooltip.tsx add explicit group resolution, opening kind, generation, bounded warmth and distinct ordinary-exit/hard-reset paths. Preserve keyboard delay and current Escape ordering. Guard every delayed open and title refresh. Bind/clean up the required visibility and active-owner lifecycle observation. Integrate #2011's naming/description ownership without losing current data-tooltip handling. Add only the warm-motion selector in feedback.css.

**Tests:** Positive: A-to-B changes current text/anchor immediately; same-group gap transfer works; latest title remains visible. Negative: no stale open after Escape, click, focusout, scroll, blur, hidden document, owner key change, dialog close, inert toggle, unmount or cleanup; no pointer warmth from touch/drag/keyboard; no animation on warm swap. Test keyboard A pending for 99 ms then focus on a control without help: advancing time never opens A. An already-open A also dismisses on focus departure. Run existing tooltip and lifecycle regressions, including caller ARIA replacement.

**Output/done:** Timing/lifecycle tests pass; at most one bubble and bounded timers/listeners; current title/ARIA assertions pass together. Do not declare general #1976 completion. **Handoff:** T04 pilot author; Tooltip.tsx and feedback.css remain one integrator's scope.

### T04: Integrate the real artifact pilot without changing actions

**Depends:** T03.

**Steps/files:** Add only the explicit owner-key marker to Artifact.tsx's existing secondary-tools div. Extend task-interface.spec.ts using `taskFixture`, `serveTaskFixture` and `openApp`. The current fixture records artifact.pin but does not update pinned state: add a narrowly scoped test route that updates the synthetic artifact's pinned field for that command and then falls back to the existing receipt/command-recording route. Do not claim the default fixture already emulates this result. After readiness, record the artifact-command baseline. Inspect View source -> Pin -> Archive with real pointer movement, and traverse the same controls by keyboard. Publish an accepted artifact revision change and exercise the existing inert/restoring state to prove reset. Do not click Archive as a proxy for hover correctness.

**Tests:** Positive: pointer inspection transfers help immediately after the first open; clicking View source still opens source locally; keyboard Pin still executes exactly one artifact.pin command and reflects the synthetic accepted state. Negative: hover/focus adds zero artifact commands relative to the ready baseline; separate artifact/group and accepted revised owner cannot inherit warmth; inert controls show no help. A held unaccepted revision does not change the rendered owner key. Verify caller names, expanded/pressed states and focus remain stable.

**Output/done:** Real app integration passes with synthetic provenance stated. No changes to save-state, archive guards, actions, Tabs or editor ownership. **Handoff:** T05 verifier; exact header edit is coordinated with other Artifact.tsx owners.

### T05: Verify browser behavior, motion policies and visual contract

**Depends:** T03 and T04.

**Steps/files:** Complete overlays spec cases with native events and real DOM, including modal portal and narrow/short clamping. Run focused commands below and inspect the real artifact pilot at 1920x1080 under normal/reduced/off motion in dark/light. Update DESIGN.md with the explicit group timing exception. Record any necessary evidence under the existing ignored test output directories; commit only redacted captions/manifests when required by the review process.

**Tests:** Positive: immediate warm result is observable without advancing a dwell clock; bubble has no active transfer animation; real Tab preserves 100 ms and focus. Negative: keyboard focus departing before/after opening, touch, held drag, cross-modal transfer, stale mutated/removed owner and old animation completion cannot reopen; 100/125/150% actual app zoom and narrow/short view retain readable bounds. Preserve the existing drag Escape browser test.

**Output/done:** Acceptance matrix is filled with command results and source/versioned evidence. Static images alone do not establish timing. Missing supported Windows verification stays named and pending. **Handoff:** T06 reviewer with exact SHA and remaining gates.

### T06: Publish reviewed changes and release exact ownership

**Depends:** T05 and all required merge gates.

**Steps/files:** Review diff for scope and current main changes. Update the canonical complete plan/issue if a decision changed, keeping source file identical. Register any approved new runtime/test module in the source manifest as appropriate; retain the plan's source-only entry already added by documentation publication, without duplicating it. Open/update one focused implementation PR, link child/parent, preserve reviewed history and publish all required evidence. Receiver reads the complete plan and acknowledges the exact revision/commit.

**Tests:** Positive: plan requirements, tasks, assertions and evidence agree; focused CI and supported-platform checks pass. Negative: no missing section, unreported skipped gate, stale ownership claim, leaked private trace or false runtime/desktop assertion.

**Output/done:** Reviewed, merged and verified-on-main states are reported separately. Release scope with OWNER=NONE and clear only this worker's assignee/in-progress ownership. **Handoff:** Maintainer/desktop verifier where applicable; issue stays open until its acceptance is met and closure is authorized.

## VALIDATION

### Reproducible setup and commands

Use a fresh branch from current main and record its SHA. Package.json specifies Node >=24.10.0, pnpm 10.30.3 and Playwright 1.56.1. Install pinned dependencies with `pnpm install --frozen-lockfile` and Chromium with `pnpm exec playwright install chromium`. The overlays config explicitly requests the Microsoft Edge channel; install Edge on the supported Windows host. Bundled Chromium does not satisfy that channel. Do not silently alter a checked-in config to mask a missing browser.

Run from repository root after widget setup:

```text
pnpm build:widgets
pnpm exec vitest run tests/tooltip-escape.test.ts tests/shared-ui-lifecycle-v3.test.ts tests/feedback-primitives.test.ts --maxWorkers=1
pnpm exec playwright test --config tests/e2e/ui-shell-overlays.playwright.config.ts
pnpm exec playwright test --config tests/e2e/task-interface.playwright.config.ts tests/e2e/task-interface.spec.ts
pnpm exec playwright test --config tests/e2e/chat-view-modes.playwright.config.ts tests/e2e/chat-view-escape.spec.ts
pnpm typecheck
pnpm lint
pnpm build
pnpm check:docs-links
```

If #2011's `tests/shared-ui-lifecycle.test.ts` lands, add that exact file to the focused Vitest command and record its resolved SHA. It is not assumed to exist at this baseline. Run commands serially where their fixture servers or shared ports conflict. Failures in an unsupported environment are reported with the command/error, not converted to passes.

Use fake timers for exact 349/350, 99/100 and 299/300 ms decisions. Use Playwright clock control for the fixture timer boundary while sending real pointer/keyboard events; flush React/layout before asserting visible content. Warm transfer must be visible after event/render processing without advancing a tooltip dwell. Inspect computed animation and active animations as well as the state flag. Avoid fragile wall-clock performance thresholds and do not make production timing conditional on test mode.

### Acceptance matrix

| Check | Requirements | Tasks | Required evidence |
| --- | --- | --- | --- |
| A01 Cold and pending | R01, R03 | T02, T03 | No open at 349 ms; default open at 350; canceled A cannot open; B after incomplete A is cold; ungrouped controls unchanged. |
| A02 Warm transfer | R02, R03, R12 | T02-T05 | Direct peer and 299 ms internal gap open without dwell; one bubble at new anchor; no active animation; at 300 ms gap next peer is cold. |
| A03 Boundaries | R04, R06 | T02-T05 | Different/nested group, owner key, disconnected node, separate artifact and modal/document owner each reset. Same label/key on a different element never shares warmth. |
| A04 Keyboard and Escape | R05, R07, R09 | T02-T05 | Real Tab/focus-visible retains 100 ms and focus; pending Escape propagates; open Escape consumes once; IME and active drag priority pass. |
| A05 Hard cancellation | R06, R07, R11 | T02, T03, T05 | Escape/click/focusout/scroll/blur/visibility/inert/removal cancel all callbacks; focus to an unlabelled-help control cancels pending/open keyboard help; descendant motion after dismissal does not reopen; unmount releases timers/listeners. |
| A06 Current accessible help | R08, R09, R13 | T01-T03, T05 | Latest pending/open title/data-tooltip; caller ARIA survives replacement/removal; generated attributes track only owned values; native title suppressed while pending/open. |
| A07 Real actions | R10 | T04, T05 | Real artifact inspection adds no artifact command; source toggles locally; Pin activation issues exactly one expected command; focus, pressed/expanded and inert gates remain correct. |
| A08 Motion and geometry | R09, R12 | T03-T05 | 1920x1080 dark/light x normal/reduced/off before/after, plus narrow/short and actual app zoom 100/125/150%; wrapping and modal portal intact. |
| A09 Integration and cost | R11, R13 | T01, T03, T06 | Merged #2007 plus agreed #2011 integration tested; no dependency/network/persistence addition, polling, per-control listeners or whole-document measurements. |
| A10 Review completeness | R14 | T01-T06 | Executed commands/results, honest skips, exact source SHA, complete plan/file readback, ownership release and supported desktop gate. |

Capture a short pointer sequence and keyboard sequence with synthetic artifact content; include first delayed opening, warm peer, cooldown expiry and explicit dismissal. Before/after captures use the same viewport, theme, motion setting and artifact revision. Captions identify baseline/implementation SHAs, fixture data, browser/platform and what was actually verified. Store raw traces only in ignored local output; share redacted images/recordings and a concise timing/assertion report. Browser fixtures do not prove packaged Windows or physical-display behavior. A supported Windows actual-app check must verify tooltip placement and keyboard/dismissal behavior before claiming desktop acceptance.

Release gate: all new contract assertions and neighboring regressions pass, CSS policy and real toolbar evidence are reviewed, #1976 ownership integration is resolved, and any unavailable desktop acceptance remains explicitly pending. Do not close the issue on a document-only check or a screenshot.

## STATE

Research verified the per-owner cold scheduling, 100 ms keyboard delay, current freshness logic, exact pilot controls and the two primary references. Product behavior, tests, captures and performance have not been executed or changed by this planning work.

The proposed decisions are the explicit group marker, 300 ms internal-gap grace, immediate nonanimated warm transfer, group/owner reset boundaries and artifact-secondary-tools pilot. Existing 350/100 ms timing, accessibility, action and motion contracts are preserved except for the stated pointer group exception. Cooldown and group policy are proposal choices, not externally mandated facts.

Planning scope belongs to worker `codex-cloud-bluma-bd935d-tooltip-0580` under parent #2212 until its release checkpoint. The coordinator owns child issue creation, source-only plan manifest registration, full-body/file publication, exact readback and receiver handoff. Implementation T01-T06 remains NOT_STARTED. No product implementation claim is granted by this document.

Known risks: overlapping Tooltip observer edits in #2011; any newly claimed shared CSS/header hunks found at T01; stale callbacks after group removal; generated ARIA ownership being lost during a simplistic merge; synthetic fixture success being mistaken for supported Windows acceptance. The primary-source pages are live references, not pinned dependency source. No vendored source or additional licensing permission is needed for independently implemented interaction concepts.

Exact next implementation step: T01 refreshes the full canonical issue, current PRs and owner allocation. The canonical issue publication record supplies the immutable source and documentation review PR; the coordinator's readback and RELEASE establish publication completion. If #2011 remains uncoordinated, test preparation may continue but shared Tooltip implementation is blocked. Local-only bytes do not constitute HANDOFF_COMPLETE.

## REFERENCES

- [Repository coordination contract](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/AGENTS.md), [contribution guide](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/CONTRIBUTING.md), [visual contract](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/DESIGN.md).
- [Baseline Tooltip.tsx](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/packages/ui-shell/Tooltip.tsx), [feedback.css](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/packages/ui-shell/feedback.css), [Artifact.tsx](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/Artifact.tsx).
- [Tooltip Escape tests](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/tests/tooltip-escape.test.ts), [current lifecycle tests](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/tests/shared-ui-lifecycle-v3.test.ts), [overlay browser tests](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/tests/e2e/ui-shell-overlays.spec.ts), [real app task fixture](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/tests/e2e/task-interface-fixture.ts).
- [#1976](https://github.com/skytuhua-org/Gen-V1/issues/1976), [merged #2007](https://github.com/skytuhua-org/Gen-V1/pull/2007), [pending #2011](https://github.com/skytuhua-org/Gen-V1/pull/2011), [pinned #2011 Tooltip source](https://github.com/skytuhua-org/Gen-V1/blob/f672b132e0d6420cdd50b4f9367b083b9ec95bf6/packages/ui-shell/Tooltip.tsx). Preserve both independent title/data-tooltip freshness and caller-ARIA ownership contracts.
- [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines), read 2026-11-25: first tooltip in a group is delayed; subsequent peers have no delay. This plan applies that principle only to explicit groups.
- [Radix Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip), read 2026-11-25: Provider exposes configurable delay and skip-delay, documented defaults 700 and 300 ms; separate delayed-open/instant-open states support different presentation. No Radix package or source is adopted, and its 700 ms first delay is not substituted for the repository's 350 ms contract.
<!-- END CANONICAL PLAN -->
<!-- END PRIOR CANONICAL BODY -->
