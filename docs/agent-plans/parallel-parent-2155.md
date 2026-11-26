# Parallel execution for issue #2155

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-PARENT-2155-R1, 2026-11-25. Coordination parent: [#2155](https://github.com/skytuhua-org/Gen-V1/issues/2155). Program and consolidated journal: [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Verified planning base: main@defe9884530145e9c109b8ed98f80efac8beeb17. Previous complete body: 32228 UTF-8 bytes, SHA-256 221c0a1e6fe94d94af1821ab004263fcfae912a2f9d5c77f5c61a9e11faeaca6, reproduced unchanged below. The publication header supplies this revision's immutable file and reviewed documentation PR. Product implementation, review, merge and verified-on-main remain separate states.

## OBJECTIVE

Replace a broad single-worker assignment with 5 bounded, separately claimable tasks. Token/provenance, pure destination policy, explicit dismissal, missing-focus fencing and actual assistive evidence have real boundaries. No focus leaf settles #1712's unresolved automatic selection policy. Success means each worker can complete one explicit outcome from its own full issue, source and input commits, while unrelated workers proceed independently. This parent coordinates coverage and final acceptance; it does not reserve every child or shared file for one agent.

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
| [INB02 #2272](https://github.com/skytuhua-org/Gen-V1/issues/2272) | third-party/vespin/inbox-presentation.tsx; third-party/vespin/provenance.json; third-party/vespin/README.md; tests/inbox-presentation.test.ts; tests/e2e/inbox-controls.spec.ts |
| [INB03 #2273](https://github.com/skytuhua-org/Gen-V1/issues/2273) | apps/web/src/inbox-focus.ts; tests/inbox-focus.test.ts; scripts/public-source-files.json |
| [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274) | apps/web/src/InboxView.tsx; tests/e2e/inbox-controls.spec.ts |
| [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275) | apps/web/src/InboxView.tsx; tests/e2e/inbox-controls.spec.ts; tests/e2e/fixtures/inbox-controls.tsx |
| [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276) | Exact verified discovery procedure is in the child plan. |

Existing work and ownership inspected during planning:

| Existing issue / PR | Inspected head | Current scope and release evidence |
| --- | --- | --- |
| [#1712](https://github.com/skytuhua-org/Gen-V1/issues/1712) / [PR #1752](https://github.com/skytuhua-org/Gen-V1/pull/1752) | d3e59ba0416c7a6006b6ff73e5adfdb5f54c41bc | OPEN_UNMERGED; implementation/review released, accepted main not verified; clear-vs-retain requirement/design contradiction unresolved [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1712#issuecomment-7122835450) |
| [#1926](https://github.com/skytuhua-org/Gen-V1/issues/1926) | See retained journal | Separate useAttention timeout/review scope; do not absorb [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1926#issuecomment-7159931607) |
| [#2154](https://github.com/skytuhua-org/Gen-V1/issues/2154) | See retained journal | Separate Inbox error placement/severity planning released [Journal](https://github.com/skytuhua-org/Gen-V1/issues/2154#issuecomment-7143525314) |
| [#2155](https://github.com/skytuhua-org/Gen-V1/issues/2155) / [PR #2221](https://github.com/skytuhua-org/Gen-V1/pull/2221) | 0ccda0526baafe343bff33b72c7f103e600cc51e | OPEN_UNMERGED original docs; publication RELEASED [Journal](https://github.com/skytuhua-org/Gen-V1/issues/2155#issuecomment-7168577883) |

## DESIGN

Claim a single child key and its exact paths on this parent, link that claim from the child, and include the canonical program journal when coordinating across parents. Read the entire assigned child, its immutable source and comments, plus the current parent allocation and relevant ownership journals first. Each child embeds its executable contract; the full retained historical parent remains available for provenance, acceptance audit and conflict recovery. A coordinator assigned the parent reads that full parent scope. The child consumes only the dependency output SHA and interface named in its plan. A receiver ACKs that artifact before work; it does not need ownership of the upstream feature.

Pure helpers and their tests can be drafted in parallel. Integration workers reserve only the named shared hunk, refresh current main and owner journals, integrate one bounded commit, publish focused verification and release the reservation. Do not reserve a file for the life of an epic. Current owner ACK is required for overlapping unpublished product work. A failed or rejected optional renderer may release an unchanged baseline slot so other independent renderer work continues.

| Shared files or seam | Participants | Integration rule |
| --- | --- | --- |
| apps/web/src/InboxView.tsx, tests/e2e/inbox-controls.spec.ts, tests/e2e/fixtures/inbox-controls.tsx | [INB02 #2272](https://github.com/skytuhua-org/Gen-V1/issues/2272), [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274), [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275) | INB02 owns only existing aria-current assertion; INB04 owns explicit-dismissal/same-row navigation and its initial focus fence; INB05 extends missing-member recovery and fixture controls after INB04. Preserve #1712/#1752 automatic selection policy and #1926/#2154 transport/error owners. Claims expire by explicit release, not silence; no blanket Inbox lock. |
| scripts/public-source-files.json | [ANC02 #2263](https://github.com/skytuhua-org/Gen-V1/issues/2263), [TIP02 #2268](https://github.com/skytuhua-org/Gen-V1/issues/2268), [INB03 #2273](https://github.com/skytuhua-org/Gen-V1/issues/2273), [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [MTH02 #2279](https://github.com/skytuhua-org/Gen-V1/issues/2279), [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295) | Short exact new-helper source/test/runtime entry reservations only. Serialize with coordinator documentation inventory and other package/source additions. Never regenerate unrelated entries or create a feature adoption dependency. |

Unanticipated interface/schema changes return to the exact discovery owner for a reviewed full-plan revision. Required schema, writers, readers and decoders land atomically in one compatible PR. Rollback is per leaf and preserves other accepted children; no sweeping source resets or replacement of existing PRs.

## EXECUTION_DAG

The table contains functional dependencies and initial planning readiness. READY means the bounded task may be claimed after normal current-journal checks. It is not permission to bypass an existing owner, failed prerequisite or native release gate. The full executable T01... steps, tests and handoff are in each linked child.

| Task | Bounded deliverable | Kind | Required task outputs | Start state |
| --- | --- | --- | --- | --- |
| [INB02 #2272](https://github.com/skytuhua-org/Gen-V1/issues/2272) | Correct Inbox current-row semantics and retained-source provenance | implementation | None | READY: Bounded aria-current token/provenance patch is independent of unresolved #1712 selection policy. |
| [INB03 #2273](https://github.com/skytuhua-org/Gen-V1/issues/2273) | Implement deterministic Inbox row focus destination | implementation | None | READY: Pure proposed destination resolver does not choose items or depend on #1712 selection policy. |
| [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274) | Dismiss Inbox reader and continue explicit row navigation | implementation | None | READY: Explicit dismissal/current-row return is independent of #1712 automatic selection policy; obtain short shared-hunk reservation before edits. |
| [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275) | Recover missing Inbox focus without stealing newer intent | implementation | [INB03 #2273](https://github.com/skytuhua-org/Gen-V1/issues/2273), [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274) | BLOCKED: Needs deterministic resolver and accepted explicit dismissal fence; actual narrow-reader hide case must follow canonical #1712 policy, never decide it. |
| [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276) | Verify Inbox current state and focus continuation with native input | verification | [INB02 #2272](https://github.com/skytuhua-org/Gen-V1/issues/2272), [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275) | BLOCKED: Needs exact token/dismissal/recovery candidate plus native Windows/NVDA and VoiceOver evidence access. |

Parent coordination tasks:

1. T01, verify allocation: refresh all complete child bodies, current candidate heads and latest owner releases. Output one accepted input/version record per claimed leaf. Positive: exact SHA and scope; negative: no silent-owner takeover. Done when the first leaf can ACK its inputs.
2. T02, coordinate independent work: assign only ready leaf keys and exact paths. Keep functional dependencies separate from hunk reservations. Publish each bounded output and its focused checks. Done when ready receivers can consume concrete artifacts.
3. T03, review coverage and integration: use the map below to review every original requirement against actual evidence, including existing completed work. A document/fixture/mock does not prove native behavior. Done when every row has PASS, a permitted reasoned non-adoption disposition, or an explicit blocker.
4. T04, final handoff: publish full status, immutable artifacts, current CI/review/main state, remaining gates and RELEASE OWNER=NONE. Close this parent only after the original accepted closure conditions are met and closure is authorized. Otherwise leave open with the exact remaining owner/input.

## VALIDATION

Requirement-to-task coverage:

| Prior requirement, design, task or acceptance | Current child allocation | Preservation note |
| --- | --- | --- |
| IF-R01 / A01,A09 ownership and #1712 boundary | [INB02 #2272](https://github.com/skytuhua-org/Gen-V1/issues/2272), [INB03 #2273](https://github.com/skytuhua-org/Gen-V1/issues/2273), [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274), [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275), [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276) | No selection policy decision, merge/closure/timeout takeover. |
| IF-R02 / A02 native current semantics/provenance | [INB02 #2272](https://github.com/skytuhua-org/Gen-V1/issues/2272), [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276) | aria-current=true only current, omit otherwise; native button/list and focus ring. |
| IF-R03 / A03,A07 explicit Back/Escape dismissal | [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274), [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276) | Clear undefined chosen; local explicit-dismiss flag; reader unmounted/full list, choose restores860/892hysteresis. |
| IF-R04 / A04,A05 ordered focus fallback | [INB03 #2273](https://github.com/skytuhua-org/Gen-V1/issues/2273), [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275), [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276) | Requested,next,previous,first,Search,Refresh; eligible same owner only. |
| IF-R05 / A05,A06 one generation-guarded recovery | [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274), [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275), [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276) | Prior actual focus evidence, no body inference/stale promise/hidden owner stealing. |
| IF-R06 / A03,A06 keyboard guards and row continuation | [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274), [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275), [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276) | Focused row origin before chosen; existing mappings; defaultPrevented/editable/menu/IME229 untouched. |
| IF-R07 / A05,A06 read/action authority | [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274), [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275), [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276) | 500ms coalescing/dedup/unread ordering/actionVersion/error and canonical open preserved. |
| IF-R08 / A05,A07,A08 no animation/dependency/authority expansion | [INB02 #2272](https://github.com/skytuhua-org/Gen-V1/issues/2272), [INB03 #2273](https://github.com/skytuhua-org/Gen-V1/issues/2273), [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274), [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275), [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276) | Focus immediate/nearest local reveal; no new API/storage/telemetry. |
| IF-R09 / A01,A07-A09 baseline/native/films/provenance/review | [INB02 #2272](https://github.com/skytuhua-org/Gen-V1/issues/2272), [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274), [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275), [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276) | Actual320/390/short/container thresholds/appzoom100125150 and screen readers, no-overlay1080p film. INB04/INB05 reproduce respective failures on unmodified pinned main before repair, with SHA/red logs. |
| IF-T01 baseline; IF-T02 semantics/dismissal; IF-T03 recovery/fence; IF-T04 validation; IF-T05 review | [INB02 #2272](https://github.com/skytuhua-org/Gen-V1/issues/2272), [INB03 #2273](https://github.com/skytuhua-org/Gen-V1/issues/2273), [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274), [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275), [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276) | No setup-only leaf; all code tests owned together. |
| Preserved original A11y defects1-2; original Plan1-4; all original Acceptance bullets | [INB02 #2272](https://github.com/skytuhua-org/Gen-V1/issues/2272), [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274), [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276) | Corrected source facts retained: undefined not null, rows.current not rowRefs, shownColumns(false,undefined)=BOTH not LIST; local dismissal produces requested full-width outcome. |
| Design prior-order snapshot, hidden reader/source vs destination, minimal scroll, rollback/source custody | [INB03 #2273](https://github.com/skytuhua-org/Gen-V1/issues/2273), [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274), [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275) | No choose/read/unread/open from recovery; retained chosen-order until return/newchoice/dispose; section may be source but not target. |
| Validation negative failures/retries/held actions/stale callbacks, full commands and evidence distinctions | [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274), [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275), [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276) | Real 499/500ms ledger and at-most-one recovery; browser success is not Windows/NVDA/VoiceOver success. |

Publication checks: A01 (R01/T03), every prior substantive row mapped and full prior body retained byte-for-byte; A02 (R02/T01-T02), every child has all nine mandatory plan sections, executable steps and meaningful positive/negative checks; A03 (R03-R04/T01-T02), DAG has no cycles or missing tasks, native GitHub parent/child link completion is verified against this table and any unavailable relationship mutation is explicitly reported in the publication journal, and only exact hunk reservations serialize integration; A04 (R05/T03), product-specific safety/native/motion/evidence gates remain explicit and unexecuted checks are not reported as passing; A05 (R06/T04), final source/body/continuation readback matches exact UTF-8 bytes and published claims are released.

Run git diff --check and node scripts/check-doc-links.mjs for the documentation publication. Product unit/integration/browser/Windows/assistive and capture commands are in the full child/prior plans and run only during their authorized execution. No application tests or footage are executed by this planning revision.

Recordings retain the user's existing requirements: synthetic comparable scenarios, 1920x1080, 30fps, H.264, real interaction speed, no added titles, labels or simulated cursor overlays. Record source SHAs, actual environment/settings, hashes, limitations and verdict outside the footage. Browser zoom and fixtures do not prove native DPI or packaged behavior.

## STATE

Allocation and detailed plans are prepared for publication; immutable body/file verification and native links are recorded in the latest publisher journal. Future leaf execution remains unclaimed unless a current explicit child scope says otherwise. Existing implementation evidence listed above remains valid only for its recorded SHA and acceptance rows.

Next: start with a READY child after full current-journal/input readback; claim that leaf's narrow scope, publish milestones and release before pausing. On each milestone or at most 20 minutes of active work, checkpoint the canonical parent with child key, source SHA, exact checks, gaps and next action. Coordinator consolidates cross-parent handoffs on #2212. No worker receives an exclusive parent-wide implementation assignment.

## REFERENCES

- [Program and full coordination journal](https://github.com/skytuhua-org/Gen-V1/issues/2212)
- [Current parent and complete history](https://github.com/skytuhua-org/Gen-V1/issues/2155)
- [Verified planning base and repository instructions](https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17)
- [Original documentation publication #2215](https://github.com/skytuhua-org/Gen-V1/pull/2215)
- [Continuity documentation publication #2221](https://github.com/skytuhua-org/Gen-V1/pull/2221)
- [Renderer documentation publication #2231](https://github.com/skytuhua-org/Gen-V1/pull/2231)

## Previous accepted canonical body, retained in full

This archive is the complete issue body read before this subdivision. Its product requirements, exclusions, evidence, examples and prior revision history remain binding. Its previous execution grouping is replaced by the child allocation above. Historical status is a snapshot, not a claim that a current PR is merged or that acceptance passed.

<!-- BEGIN PRIOR CANONICAL BODY -->
## Publication record

**Revision:** `FRONTEND-INBOX-FOCUS-R1`  
**Complete Markdown:** [frontend-inbox-focus-continuation.md](https://github.com/skytuhua-org/Gen-V1/blob/0ccda0526baafe343bff33b72c7f103e600cc51e/docs/agent-plans/frontend-inbox-focus-continuation.md)  
**SHA-256:** `353aa909fdae5852f54b7d1b1b1997ce0a940aab06e9b2ad66ae9ad0d556dc51`  
**Documentation PR:** [#2221](https://github.com/skytuhua-org/Gen-V1/pull/2221)  
**Program and journal:** [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212)

**Previous revision/history:** Original #2155 body retained verbatim inside this source. Initial extension commit `f9ad065f0d52f839236a527898776b5a99701443`; tooltip eligibility clarification `190da16adce4c30b659af892e445b36be7e41e01`; current source `0ccda0526baafe343bff33b72c7f103e600cc51e` uses commit-pinned child links that work in both Markdown files and issue bodies.

**Change record:** Preserves aria-current, Escape, full-width list and next-row continuation. Adds missing-row focus recovery and stale-intent guards, with explicit corrections to current-source layout assumptions. #1712 retains reader-selection policy.

This publication contains the complete canonical plan below and identical committed Markdown. It changes plans and their source inventory only. Product implementation, runtime reproduction and application/native acceptance remain **NOT_STARTED / NOT_RUN**. Existing implementation owners, candidate PRs and original requirements remain in force. The connector cannot upload a real Markdown issue attachment; the committed source and review PR provide the required separate-file fallback. Publication readback and ownership release are recorded in the issue journal.

<!-- BEGIN CANONICAL PLAN -->
# Inbox focus continuation: supplement to #2155

## META

| Field | Value |
| --- | --- |
| Repository / revision / date | skytuhua-org/Gen-V1; FRONTEND-INBOX-FOCUS-R1; 2026-11-25 UTC |
| Canonical issue / coordination | [#2155](https://github.com/skytuhua-org/Gen-V1/issues/2155) / [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212) |
| Verified source / documentation branch | main@96ca4c3bd0664fca53775fbe31915c209641986c; docs/frontend-continuity-plans |
| Status | Planning only. Source, tests, existing issue and PR inspected; runtime reproduction and implementation not performed. |
| Provenance / ownership | Source-derived focus gap; W3C APG focus persistence guidance; existing #2155 and #1712/#1752. Drafting claim [7167948281](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7167948281); coordinator owns publication. |

This is an additive complete plan for the existing issue, not a new Inbox redesign issue. Prefix its implementation tasks IF-T01..IF-T05. The complete original #2155 body follows verbatim. Preserve it and previous immutable publications when updating the canonical body and identical Markdown. Existing accepted aria-current, Escape, full-width list and keyboard continuation outcomes remain required.

## OBJECTIVE

Keep keyboard focus on a predictable real control when an Inbox row disappears, including the existing delayed automatic read removing a row from Unread. Back/Escape must still return to the selected row when it exists and to a deterministic neighboring control when it does not. Focus recovery must not select or mark another item, alter canonical reader-selection policy, or reclaim focus after the user moves elsewhere.

Complete the original #2155 outcomes at the same time: selected rows announce current rather than current page; Escape dismisses selection in both column modes, exposes the full list, and supports continuing with j/k from the returned row.

## REQUIREMENTS

| ID | Required outcome | Tasks / checks |
| --- | --- | --- |
| IF-R01 | Reuse #2155, refresh claims/PRs and preserve #1712/#1752 ownership. No merge, closure, timeout takeover or independent selection-policy decision. | IF-T01,IF-T05 / A01,A09 |
| IF-R02 | Selected row button uses aria-current=true, unselected row omits it. Preserve native list/button semantics, labels, focus ring and original keyboard dismissal in both modes. | IF-T02,IF-T04 / A02,A03 |
| IF-R03 | Explicit Back/Escape clears chosen, exposes a full-width list and closes/unmounts the reader; next explicit choose restores normal one/two-column presentation. Preserve measured-container 860/892 hysteresis. | IF-T02,IF-T04 / A03,A07 |
| IF-R04 | Removed focused row, or Back/Escape referring to a missing row, recovers to eligible next, previous, first or named real control in the same Inbox. Recovery alone never chooses, marks read/unread, opens a conversation or changes filter/query. | IF-T02,IF-T03,IF-T04 / A04,A05 |
| IF-R05 | Deferred focus belongs to a captured owner and user-intent generation. New focus/pointer/keyboard intent, blur, hidden/inactive owner, replacement or unmount cancels stale work. No focus theft, body/section fallback, perpetual retry or timer leak. | IF-T03,IF-T04 / A05,A06 |
| IF-R06 | Preserve ordinary j/k, ArrowUp/Down, Home/End mappings, search Escape, listbox/combobox/editable guards, defaultPrevented and IME/229 isolation. After a return, next row navigation starts from the focused row without independent reselection. | IF-T02,IF-T03,IF-T04 / A03,A06 |
| IF-R07 | Keep 500 ms read coalescing, read/unread ordering, request deduplication, actionVersion/error ownership, canonical open callbacks and existing failure/retry behavior. | IF-T03,IF-T04 / A05,A06 |
| IF-R08 | No new animation, delay, package, preference, API, storage or telemetry. Focus is immediate after commit; existing motion gates remain, and no private data enters fixtures/evidence. | IF-T02-T04 / A05,A07,A08 |
| IF-R09 | Reproduce on pinned main, then verify dark/light, narrow/short, actual app zoom, keyboard/assistive technology and reduced/off motion. Preserve vendored notices/provenance. Publish exact source/evidence and obtain frontend review. | IF-T01,IF-T04,IF-T05 / A01,A07-A09 |

### Explicit source corrections and preserved requirements

The original body describes wide Escape as an already-supported BOTH-to-LIST transition. The inspected selector does not do this: shownColumns(false, undefined) returns BOTH, and InboxPane remains mounted. The original full-width-list/reader-close acceptance is retained as work to implement, not claimed as current behavior. IF-T02 supplies a presentation-only explicit-dismissal state so this correction does not silently redefine initial empty selection or #1712's filter-driven policy.

The original 861/860 width shorthand also omits hysteresis. InboxView measures its own container: enter one column below 860 px when previously split; remain single until width reaches 892 px. Test the actual container in both directions, not viewport width alone.

The original example uses null and rowRefs; current source uses undefined and rows.current. Keep current types and equivalent behavior. The original post-Escape j-next-row acceptance also needs focused-row traversal context because current navigation derives its index from chosen, which dismissal clears. This plan preserves the key mappings and makes that context explicit.

## REPO_MAP

All paths below were read at the verified baseline, including sparse files through the repository connector.

| Verified path | Relevant responsibility |
| --- | --- |
| apps/web/src/InboxView.tsx | visible membership, selected from attention.items, rows map, chosen, choose/back/keyboard, 500 ms markTimer, actionVersion, activeReads, reader ref, ResizeObserver. |
| apps/web/src/agent-inbox.css | Full-list grid via data-columns=list, hidden subtree exclusion, existing focus styling, short/narrow layout and reduced-motion row treatment. |
| third-party/vespin/inbox-columns.ts | shownColumns, oneColumn, COLUMN_SPLIT ENTER=860/LEAVE=892 and LIST_SHARE=.35. Preserve the selector's default contract. |
| third-party/vespin/inbox-presentation.tsx | InboxItemRow aria-current=page; InboxList named nav/search slots; InboxPane focusable section. Section focus is not a recovery destination. |
| third-party/vespin/README.md and provenance.json | Retained adaptation, local hashes/modification records; preserve LICENSE/NOTICE and upstream identity when changing the row token. |
| tests/inbox-presentation.test.ts | Static row/reader semantics, canonical callback separation, container hysteresis, real-browser attention invalidation cases. |
| tests/e2e/inbox-controls.spec.ts | Filter and keyboard ownership, selected-reader expectations, narrow Escape, read delays/ordering, async failure-generation tests. Existing page-token assertion must change. |
| tests/e2e/fixtures/inbox-controls.tsx and inbox-controls.html | Five synthetic items; calls ledger; held read/unread/refresh/open promises; measured .fixture-inbox. Extend this fixture for membership removal, owner unmount and external focus targets. |
| tests/e2e/inbox-controls.playwright.config.ts and inbox-controls.vite.config.ts | Isolated Vite fixture on 127.0.0.1:5802, one worker, Chromium default, no reusable server; output override GEN_INBOX_CONTROLS_OUTPUT. |
| scripts/public-source-files.json and tests/public-source.test.ts | Existing source inventory. No new production module is required; register any justified new module before publication. |
| AGENTS.md, DESIGN.md, CONTRIBUTING.md, .github/pull_request_template.md | Coordination, native/visual acceptance, retained-source custody, focused checks and review. |

### Existing work and integration

[#2155](https://github.com/skytuhua-org/Gen-V1/issues/2155) is open. Its earlier planner released at [7143525836](https://github.com/skytuhua-org/Gen-V1/issues/2155#issuecomment-7143525836); current coordinator's docs claim is [7167924372](https://github.com/skytuhua-org/Gen-V1/issues/2155#issuecomment-7167924372). No implementation PR was found during this review; refresh before implementation.

[#1712](https://github.com/skytuhua-org/Gen-V1/issues/1712) owns filtered-out reader reconciliation. [PR #1752](https://github.com/skytuhua-org/Gen-V1/pull/1752) is open/unmerged at d3e59ba0416c7a6006b6ff73e5adfdb5f54c41bc and changes selected to visible.find while keeping chosen for restoration. It expressly leaves mark-read and Escape/back unchanged. Its reviewer released at [7088457213](https://github.com/skytuhua-org/Gen-V1/issues/1712#issuecomment-7088457213). The issue's requirements say clear/no automatic reselection, while DESIGN/tasks/PR restore selection on re-entry. That contradiction belongs to #1712; do not resolve it through this focus supplement or silently replace its tests.

[#1926](https://github.com/skytuhua-org/Gen-V1/issues/1926) owns hanging mark-read timeout/dedup recovery, and [#2154](https://github.com/skytuhua-org/Gen-V1/issues/2154) owns error overlay behavior. Preserve these scopes and current error-generation fixes. File overlap requires recorded allocation/ACK before implementation, even with a released earlier author.

## DESIGN

### State and control flow

Keep InboxView as the focus coordinator. Maintain ephemeral focus ownership separately from chosen/selected and actionVersion. One instance owns its pending focus request, prior committed visible-ID order and focused DOM identity. No focus state is persisted or sent to the host.

For the original explicit dismissal requirement, add a local presentation flag set only by accepted Back/Escape. Clear chosen using its current type, preserve existing timer/error cancellation, set explicit dismissal, and conditionally omit the reader while exposing data-columns=list. A later explicit choose clears dismissal before using the unchanged oneColumn/shownColumns contract. Initial mount and automatic filtering keep their existing canonical policy. Do not modify shownColumns globally to make every undefined selection list-only. Resize must not reopen an explicitly dismissed reader.

Eligible Escape: not defaultPrevented, composing or keyCode229; target not an editable, filter combobox/listbox or owned nested control. If chosen exists, preventDefault/stopPropagation and invoke the same dismissal operation in both modes. If chosen is absent, retain existing propagation. Search Escape remains owned by the search input and only clears its query; add composition guarding if absent without changing ordinary behavior.

### Deterministic focus destination

Snapshot the relevant row ID and prior committed visible order before an explicit return or membership loss. If chosen leaves the list while focus remains in the reader, retain that row's last order snapshot until return, a different explicit choice or owner disposal; do not mutate chosen. Resolve against current committed refs and current membership, not stored DOM coordinates:

1. The requested same row if it still exists and is eligible.
2. First surviving eligible row following its former position in the prior visible order.
3. Nearest surviving eligible preceding row, scanning backward.
4. First eligible row in current visible order when prior neighbors are unavailable.
5. Search Inbox input, then the visible enabled Refresh inbox button as a defensive named-control fallback.

Eligibility means same ownerDocument and Inbox instance, connected, enabled, displayed, and outside hidden/inert subtrees. Never focus the Inbox section, reader section, scroll container, body, or a hidden list row. If canonical reader policy leaves a narrow reader visible, do not force list presentation on an automatic update; only if its actual focus owner became unavailable, use its visible named Inbox back button. If the entire owner is hidden or gone, cancel and leave focus to the surrounding owner.

A successful recovery only calls focus, with preventScroll. If a recovered row is outside the visible list viewport, reveal it minimally with an immediate nearest adjustment confined to .inbox-tasks-scroll; no smooth scroll, document scrolling or centering. Do not call choose, markRead, markUnread or onOpenThread. A fallback row can be focused while another item remains selected under the canonical policy.

For an explicit j/k/Arrow navigation event originating on a row button, derive traversal from that focused row ID first; otherwise retain the existing chosen-based behavior. Home/End keep their existing boundaries. The resulting explicit navigation may call choose as it does today. Focus recovery itself must not simulate that navigation.

### Focus ownership and interruptions

Track the last actual focused source and committed visible order. A source may be a row button, a reader control, or the reader section itself, which the existing narrow choose() flow focuses. If #1712/#1752's accepted policy hides that section after an Unread update, its formerly owned focus is eligible for recovery. Source ownership is distinct from destination eligibility: sections may be captured sources but must never be recovery destinations. Automatic repair is allowed only if that exact owned focus was removed or became hidden during the current membership commit and no newer user intent occurred. A data refresh that leaves the focused element connected/visible does nothing. When focus is in Search Inbox, the filter, a surviving reader control/section, another pane or any unrelated control, row removal does nothing.

Each deferred return captures Inbox instance generation, relevant item ID, user-intent generation and the initiating focus owner. Invalidate pending work on newer meaningful focus/pointer/keyboard input, window blur, document hidden, owner deactivation/unmount, or replacement intent. A post-removal activeElement of body alone is insufficient proof of ownership; require the captured previously focused element and unchanged generation. Distinguish removal without a genuine destination from an actual user focus departure. A recovery's own focus event consumes its token once rather than scheduling a second recovery.

Reconcile in a layout effect after refs/visibility settle, with at most one bounded pending frame if required by React commit timing. Replace the unguarded Back focus frame and apply the same cancellation contract to the existing narrow choose-to-reader frame so an older focus callback cannot override the newer return. No MutationObserver over the entire document, polling, repeated focus loop or arbitrary wait. Clean up all listeners/frames. Measure only the chosen destination and list viewport when revealing it.

Do not tie focus completion to network promises. Read rejection leaves the row present and needs no fallback; late completion can only affect focus if it causes a currently owned element to disappear under the same captured intent. Keep activeReads, delayed-read coalescing and error generations unchanged.

### Compatibility, source custody and rollback

No new visual transition or animation: focus/ARIA changes and explicit dismissal are immediate. Preserve existing reduced/off policy, row styling and filter menu ownership. Do not add a live region merely to compensate for incorrect focus; the focused native control supplies its accessible name. Verify actual screen-reader announcements.

Change the vendored row token minimally, update its modification description and all affected localSha256 entries in provenance.json, retain upstream source hashes/ranges and LICENSE/NOTICE. No new upstream source is acquired. Rollback reverts the scoped focus/dismissal/token diff and corresponding provenance without undoing independent #1712 or transport/error fixes. No migration is required.

## EXECUTION_DAG

All tasks are serial where they edit InboxView or its tests. A receiver first reads this entire supplement, preserved body, complete journals, related PRs and source. No implementation starts from this summary alone.

### IF-T01: Reconcile ownership and reproduce

Dependencies: none. Inputs: pinned baseline, #2155/#1712 journals, #1752 diff, exact source/test map. Claim implementation on #2155 and mirror task allocation on #2212. Refresh main and candidates, record exact SHAs and existing decisions; obtain shared-file coordination. Keep #1712's conflicting selection policy outside this change and block only work that truly depends on resolving it.

Using existing inbox-controls fixture, capture baseline focus after Unread selection + 500 ms read, last-row removal, narrow Back to a missing row, and wide Escape. Record actual container widths/columns, focused element, chosen/reader observable state and calls ledger. Reproduce each relevant failure on unmodified pinned main before repair. Extend only fixture controls needed for deterministic membership and interruption reproduction.

Output/done: source/owner ledger and reproducible failing assertions, distinguishing canonical selection behavior from focus defects. Positive control: surviving row and current action/error behavior. Negative control: focus in search/outside survives unrelated removal. Handoff: exact test recipe and owner boundaries to IF-T02, recorded on #2155.

### IF-T02: Complete original semantics and dismissal

Depends on IF-T01. Edit InboxView.tsx and the minimal InboxItemRow aria-current line; preserve column selector defaults and add explicit-dismissal presentation state described above. Add real search/control refs, focused-row traversal context, and current-typed Back/Escape flow. Update tests/inbox-presentation.test.ts, relevant spec aria-current assertions and retained-source provenance.

Tests: current versus noncurrent tokens; wide/narrow Escape; full-width list and absent reader after explicit dismissal; next choose restores normal layout; j/k continues from returned row; search/filter/nested/IME Escape does not dismiss. Verify 860/892 hysteresis both directions without substituting viewport measurements.

Output/done: original accepted #2155 outcomes pass with no automatic-selection policy change. Handoff: exact diff and existing-preservation evidence to IF-T03. IF-T02 owns these files exclusively until release.

### IF-T03: Add missing-row focus continuation and fencing

Depends on IF-T02. Keep implementation local to InboxView unless a clearly justified pure resolver extraction is recorded. Implement destination order, prior visible membership, owned-focus snapshot, intent generations, one-shot post-commit restoration and cleanup. Guard both Back and existing choose focus frames. Do not alter transport, error state, read delay, chosen reconciliation or shared keyboard dispatch.

Tests: remove first/middle/last/only focused row; multiple removals/reorder; same-row Back; missing-row Back/Escape; list empty; delayed read failure/success; held completion after Tab/click/search/filter/pane change; rapid Back/choose and unmount; narrow reader hidden by the accepted canonical policy. Verify call counts show no fallback-triggered mutation/open.

Output/done: IF-R04/R05/R07 hold for positive and negative cases, no stale pending focus after ownership ends. Handoff: exact candidate and focused failure traces to IF-T04.

### IF-T04: Integrated keyboard, visual and native verification

Depends on IF-T03. Extend existing fixture/spec without replacing its privacy/network guards, held requests or old tests. Run the commands below; diagnose failures against pinned baseline, preserve failure records and rerun only affected checks. Review source provenance and public manifest. Capture visual and screen-reader evidence on exact frozen candidate and baseline.

Output/done: A01-A08 pass or specific platform/owner gates remain explicitly BLOCKED. Linux browser success does not complete Windows or assistive-technology acceptance. Handoff: exact head, commands/results, synthetic assets and remaining gates to IF-T05 frontend reviewer.

### IF-T05: Review, publish evidence and release

Depends on IF-T04. Submit one focused implementation PR linked to #2155, preserving #1752 and other candidates. Publish complete current plan revisions and immutable source/evidence pointers under AGENTS.md when decisions change. Reviewer compares the candidate against both original and new acceptance, including #1712 boundaries; receiver posts an explicit ACK.

Output/done: exact-head review and required CI/native evidence recorded; merged and verified-on-main are tracked separately. No self-merge/issue closure implied. Final checkpoint lists every task/check and unresolved gate, then RELEASE with OWNER=NONE. Coordinator may publish this documentation before product tasks begin; docs publication is not product completion.

## VALIDATION

### Reproducible setup and commands

Run from the repository root with dependencies and bundled Playwright Chromium installed per CONTRIBUTING.md. Use the existing isolated config, port 5802 and synthetic fixture. Preserve request/pageerror assertions; no live host or personal Inbox data.

Planned commands, not executed by this planner:

~~~sh
pnpm exec vitest run tests/inbox-presentation.test.ts tests/public-source.test.ts
pnpm exec playwright test --config tests/e2e/inbox-controls.playwright.config.ts
pnpm typecheck
pnpm lint
pnpm build
pnpm check:docs-links
~~~

Install page.clock before navigation or before creating the selection timer; freeze readiness safely. Assert no read before 500 ms, exactly one coalesced read at/after the boundary and a committed removal before checking focus. Use held promises for rejection/stale completion. Add fixture-only removal/reorder/empty/unmount controls, not production debug APIs. Existing five synthetic IDs and window.inboxControls.calls are sufficient identifiers.

Measure .agent-inbox width and assert data-columns. Exercise 859/860 while split and 880/892 after entering single. Test a narrow Inbox inside a wide viewport and a wide Inbox after returning from narrow. Set arbitrary fixture widths on its wrapper rather than assuming viewport pixels equal content width.

| Check | Observable acceptance | Requirements |
| --- | --- | --- |
| A01 | Baseline failures, exact source/candidate SHAs, related owner decisions and #1712 policy boundary recorded; no candidate silently replaced. | R01,R09 |
| A02 | Current row announces current without page in NVDA/VoiceOver; absent token when noncurrent; native semantics and visible keyboard ring remain. | R02 |
| A03 | In both modes, accepted Escape clears selection, unmounts reader and exposes full list; same-row focus succeeds; j selects next from it. Choose restores normal layout. With no chosen, Escape propagation unchanged. | R02,R03,R06 |
| A04 | First/middle/last/only row removal resolves next/previous/first/search deterministically; a missing Back/Escape target uses same order; focus lands on visible real control, never body/section. | R04 |
| A05 | Automatic fallback does not change reader/selection/filter/search or create read/unread/open calls. Rejected read leaves focus; held success after user departure never steals it. Current 500 ms coalescing, dedup and explicit unread ordering remain. | R04,R05,R07,R08 |
| A06 | Rapid choose/Back/Escape, Tab, pointer transfer, external focus, owner hide/unmount, window blur/document hide and stale callbacks produce at most one current recovery. Search/menu/editable/defaultPrevented/IME229 paths preserve ownership and old key mappings. | R05-R07 |
| A07 | Dark/light, 320/390 px narrow, short-height and measured 860/892 transitions, actual app zoom 100/125/150%, reduced and off: visible unclipped focus, no new animation or document scroll, no hidden destination. | R03,R08,R09 |
| A08 | Paired baseline/candidate synthetic 1920x1080 recordings show removed focused row, missing-row Back/Escape, recovery and subsequent navigation; no embedded titles or explanatory overlays. Captions outside videos identify SHA, fixture, input/motion/zoom and outcome. Retained source hashes/notices checked. | R08,R09 |
| A09 | Full original body retained; supplement requirements map to tasks/checks; exact-head frontend review, publication readback, receiver ACK and remaining Windows/assistive gates recorded separately from fixture success. | R01,R09 |

Record narrow/short and zoom evidence separately from the 1920x1080 comparison. Use forced colors to check the existing ring where available. Run Windows Electron keyboard verification and NVDA on the exact candidate; VoiceOver remains a separately recorded target, not inferred from Chromium accessibility attributes. Pending native access is a named handoff, not an invented pass.

## STATE

Researched: baseline source, actual container selector, existing fixture/tests, #2155 body/journal, #1712/#1752 body/diff and explicit releases, primary APG guidance. Decided: canonical supplement, original full-list dismissal preserved, deterministic real-control recovery, separate focus and selection state, user-intent fencing, no new animation.

IF-T01..IF-T05 implementation NOT_STARTED. Application tests/build/runtime reproduction/native/screenshots/videos NOT_RUN. Draft source inspection establishes a risk and executable reproduction, not a witnessed runtime failure.

Documentation contributor codex-cloud-inbox-16eb92 owns only X04-inbox until its parent release; coordinator codex-cloud-bluma-bd935d owns publication. Future implementation owner is unassigned until a valid claim. #1712 selection-policy contradiction is unresolved and must be decided on that issue before integrating any competing reader policy. No timeout takeover.

Risks: focus may disappear without a blur event; stale frame may override new input; narrow hidden rows are in the ref map; shared candidate can change selected membership; retained-source hashes must remain accurate. Recovery is the scoped rollback above. Next implementer action: IF-T01 complete journal/source/PR refresh, owner allocation and baseline fixture reproduction. Planning publisher first verifies this complete combined body against the source bytes.

## REFERENCES

- [Pinned baseline tree](https://github.com/skytuhua-org/Gen-V1/tree/96ca4c3bd0664fca53775fbe31915c209641986c).
- [InboxView source](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/InboxView.tsx), [container selector](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/third-party/vespin/inbox-columns.ts), [presentation](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/third-party/vespin/inbox-presentation.tsx), [fixture spec](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/tests/e2e/inbox-controls.spec.ts).
- [#2155 original scope](https://github.com/skytuhua-org/Gen-V1/issues/2155), [#1712 canonical selection work](https://github.com/skytuhua-org/Gen-V1/issues/1712), [#1752 candidate](https://github.com/skytuhua-org/Gen-V1/pull/1752), [parent extension allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7167934777).
- [W3C APG keyboard interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/): focus should remain visible and move logically when an active element is removed; keyboard focus and selected state are distinct. This motivates recovery, not automatic selection. Read 2026-11-25; no third-party code/package copied.

---

# Preserved original #2155 body

The following original body is preserved verbatim. Its accepted outcomes remain binding; the source corrections above explain work that the earlier prose incorrectly described as already implemented.

<!-- BEGIN PRESERVED ISSUE 2155 -->
## A11y / keyboard

Two related defects in the inbox list ↔ reader interaction (`apps/web/src/InboxView.tsx`, `third-party/vespin/inbox-presentation.tsx`):

1. **Wrong `aria-current` token.** The selected row renders `aria-current="page"`. `page` is for navigation links pointing at the current page; a list row that controls which detail is shown should use `aria-current="true"`. Screen readers announce "current page" for a non-navigation row.
2. **No keyboard path to clear a selection in two-column mode.** `Escape` is only handled when `single && chosen` (narrow, one-column). At desktop widths (columns `both`), once an item is selected the reader stays open forever — there is no key to clear selection or return focus to the list. Focus can be anywhere; j/k work globally on the section, but nothing lets a keyboard user "close" the open item or indicate none is open.

## Plan

1. `inbox-presentation.tsx`: row `button` — change `aria-current={current ? 'page' : undefined}` to `aria-current={current ? 'true' : undefined}`.
2. `InboxView.tsx` `onKeyDown`: remove the `single &&` gate on Escape. New behavior, both column modes: if `chosen` is set, `Escape` clears `chosen` (`setChosen(null)`), calls `event.preventDefault()`, `event.stopPropagation()` (so it does not bubble to the pane/split handlers), and moves focus to the previously-selected row button (`rowRefs.current[chosen]?.focus()`) — focus must land on a real control, not the section.
   - Single-column mode keeps today's result: clearing `chosen` flips `shownColumns` back to `LIST` and the row list is on screen, identical visual outcome to now.
   - Two-column mode new result: reader unmounts, the list stays expanded to full width (existing `BOTH → LIST` transition in `inbox-columns.ts`), focus on the row.
   - When `chosen` is `null`, `Escape` continues to do nothing (unchanged — pane-level handlers keep their behavior).
3. Focus ring: the row's `:focus-visible` outline already exists; confirm it shows on the focused row after Escape.
4. No changes to j/k/Home/End/Arrow keys or to `Escape` clearing the search field (search input handles its own Escape first, stops propagation — unchanged).

## Acceptance

- NVDA/VoiceOver announce the selected row as "current" without the word "page".
- At ≥861px (two-column): select a row → `Escape` → reader closes, list returns to full width, focus is on that row's button, and pressing `j` selects the next row from there.
- At <860px (single-column): unchanged from today.
- Escape inside the search input still only clears the query.
- `prefers-reduced-motion`: column transition already gated; no new animation added.

<!-- END PRESERVED ISSUE 2155 -->
<!-- END CANONICAL PLAN -->
<!-- END PRIOR CANONICAL BODY -->
