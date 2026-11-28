# Parallel execution for issue #2230

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-PARENT-2230-R2, 2026-11-25. Coordination parent: [#2230](https://github.com/skytuhua-org/Gen-V1/issues/2230). Program and consolidated journal: [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Verified planning base: main@defe9884530145e9c109b8ed98f80efac8beeb17. Previous complete body: 45151 UTF-8 bytes, SHA-256 350af6c0df8355f42505b7f78a35dba45cc3f40edee952f648e81805dad6eb65, reproduced unchanged below. The publication header supplies this revision's immutable file and reviewed documentation PR. Product implementation, review, merge and verified-on-main remain separate states.

Previous allocation revision: [FRONTEND-PARALLEL-PARENT-2230-R1](https://github.com/skytuhua-org/Gen-V1/blob/cdb703b94d73fd41abbe2d26aa5e88010700d976/docs/agent-plans/parallel-parent-2230.md), SHA-256 `9c5a166318284fa2d90f0332b31a077ee7c9ff17c70d34b433c6cbef03c75369`. R2 changes only proof ownership after the independent completion audit. All prior product requirements and archived body bytes remain retained. The child count, functional dependencies and integration queues are unchanged.

## OBJECTIVE

Replace a broad single-worker assignment with 9 bounded, separately claimable tasks. Separate pure contract/helper, lifecycle, narrow shared bindings and finite verification outcomes; no epic-wide implementation owner. Success means each worker can complete one explicit outcome from its own full issue, source and input commits, while unrelated workers proceed independently. This parent coordinates coverage and final acceptance; it does not reserve every child or shared file for one agent.

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
| [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293) | tests/fixtures/diagram-adoption-corpus.json; docs/implementation/diagram-adoption-contract.md |
| [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294) | apps/web/src/diagram-policy.ts; tests/diagram-policy.test.ts |
| [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295) | apps/web/src/diagram-client.ts; tests/diagram-client.test.ts; tests/e2e/diagram-worker.spec.ts; tests/e2e/diagram-worker-fixture.ts; tests/e2e/diagram-worker.html; tests/e2e/diagram-busy-worker.ts; tests/e2e/micro-motion.playwright.config.ts; scripts/browser-suites.ts |
| [DIA04 #2296](https://github.com/skytuhua-org/Gen-V1/issues/2296) | apps/web/src/diagram-svg.ts; tests/e2e/diagram-svg.spec.ts; tests/e2e/diagram-validation-fixture.tsx; tests/e2e/diagram-validation.html; tests/e2e/micro-motion.playwright.config.ts; scripts/browser-suites.ts |
| [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297) | apps/web/src/DiagramPreview.tsx; apps/web/src/diagram-preview.css; tests/e2e/diagram-preview.spec.ts; tests/e2e/diagram-preview-fixture.tsx; tests/e2e/diagram-preview.html; tests/e2e/micro-motion.playwright.config.ts; scripts/browser-suites.ts |
| [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298) | apps/web/src/Markdown.tsx; apps/web/src/app-panels.tsx; apps/web/src/App.tsx; apps/web/src/registry.tsx; apps/web/src/SentenceReveal.tsx; tests/e2e/markdown.spec.ts |
| [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299) | docs/review-evidence/parallel-renderers/diagram-browser.md; tests/e2e/diagram-worker.spec.ts |
| [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300) | docs/review-evidence/parallel-renderers/diagram-windows.md |
| [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | apps/web/src/diagram-engine.ts; apps/web/src/diagram-worker.ts; tests/diagram-engine.test.ts; package.json; pnpm-lock.yaml; THIRD_PARTY_NOTICES.md; apps/web/src/dependency-notices.ts; scripts/public-source-files.json |

Existing work and ownership inspected during planning:

| Existing issue / PR | Inspected head | Current scope and release evidence |
| --- | --- | --- |
| [#1530](https://github.com/skytuhua-org/Gen-V1/issues/1530) / [PR #1549](https://github.com/skytuhua-org/Gen-V1/pull/1549) | 796097030fa3c4dfeed65291c602d1268ef2e23d | OPEN_UNMERGED; devin-a-cloud-f1a91d unreleased; no takeover [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1530#issuecomment-7082885847) |
| [#1583](https://github.com/skytuhua-org/Gen-V1/issues/1583) / [PR #1632](https://github.com/skytuhua-org/Gen-V1/pull/1632) | ff9e1093ddba30bd20e2040d6b581856df082a59 | OPEN_UNMERGED; implementation/review RELEASED; Windows gate NOT_RUN [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1583#issuecomment-7069498493) |
| [#1969](https://github.com/skytuhua-org/Gen-V1/issues/1969) / [PR #2062](https://github.com/skytuhua-org/Gen-V1/pull/2062) | 9c11de3b8e112188adac228a551d83eac8459912 | OPEN_UNMERGED; released; queue comment is not merge proof [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1969#issuecomment-7129888162) |
| [#1655](https://github.com/skytuhua-org/Gen-V1/issues/1655) / [PR #1697](https://github.com/skytuhua-org/Gen-V1/pull/1697) | 6938a6625a6729a0603d40b99428384f38027a33 | OPEN_UNMERGED; released; preserve whole-run Contents eligibility [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1655#issuecomment-7130783370) |
| [#1811](https://github.com/skytuhua-org/Gen-V1/issues/1811) | dd9cf46b52ecc79b579a0a282948444ed6f7deaa | W3 RELEASED; integrated acceptance unmet;1811 is an issue [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7104926319) |
| [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212) / [PR #2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) | d03d7155e0dc93b790dad014becccfee4eedc1c0 | DOCS_OPEN_UNMERGED; original publication released [Journal](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7170181714) |

## DESIGN

### R2 proof ownership

[DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) and [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299) use their complete `PARALLEL-RENDERERS-R2` leaf plans. DIA09 proves the minimal certified Worker entry using DIA01's explicit entry-only build. DIA03 proves the client and real Worker startup, queue, stale-result rejection and actual busy termination through its allocated isolated fixture. Those are positive entry/fixture results. Before DIA06 binds actual application callers, they do not certify the application's initial or lazy production graph, CSP delivery or startup exclusion.

DIA07 after DIA06 owns the real application's positive emitted Worker/engine dependency graph, initial-entry exclusion and actual same-origin/CSP Worker loading, alongside the existing fidelity, usefulness and browser-cost gates. It uses the reviewed pilot route supplied by the upstream contract and the existing production build/host. Production remains default-off. An unavailable trial route, empty graph, development-only fixture or unreachable caller is BLOCKED evidence, not a passing build result; do not invent a query flag, global, build entry or shipped feature switch. Record exact candidate SHA, activation route, emitted assets and actual requests according to the complete DIA07 R2 plan. DIA08 retains packaged/offline/native and assistive-technology acceptance.

The correction retains DIA01 feasibility, unchanged corpus thresholds, certified semantics, real busy Worker termination, all input/output/time/node/cache limits and the original rejection/rollback rules. R-F02 is independently confirmed against the full original source and real build entry; [checkpoint 027](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7174435568) records the allocation.

Claim a single child key and its exact paths on this parent, link that claim from the child, and include the canonical program journal when coordinating across parents. Read the entire assigned child, its immutable source and comments, plus the current parent allocation and relevant ownership journals first. Each child embeds its executable contract; the full retained historical parent remains available for provenance, acceptance audit and conflict recovery. A coordinator assigned the parent reads that full parent scope. The child consumes only the dependency output SHA and interface named in its plan. A receiver ACKs that artifact before work; it does not need ownership of the upstream feature.

Pure helpers and their tests can be drafted in parallel. Integration workers reserve only the named shared hunk, refresh current main and owner journals, integrate one bounded commit, publish focused verification and release the reservation. Do not reserve a file for the life of an epic. Current owner ACK is required for overlapping unpublished product work. A failed or rejected optional renderer may release an unchanged baseline slot so other independent renderer work continues.

| Shared files or seam | Participants | Integration rule |
| --- | --- | --- |
| apps/web/src/registry.tsx | [ART02 #2259](https://github.com/skytuhua-org/Gen-V1/issues/2259), [ACT04 #2247](https://github.com/skytuhua-org/Gen-V1/issues/2247), [MTH05 #2282](https://github.com/skytuhua-org/Gen-V1/issues/2282), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298) | ART02 owns Tabs and required imports only; ACT04 owns Button/Form; renderer bindings own only their actual Markdown caller hunks. Reserve overlapping imports or adjacent edits briefly, commit/release, no whole-file lock or adoption dependency. |
| apps/web/src/App.tsx, apps/web/src/ConversationFind.tsx, tests/e2e/conversation-find.spec.ts | [ANC02 #2263](https://github.com/skytuhua-org/Gen-V1/issues/2263), [ANC04 #2265](https://github.com/skytuhua-org/Gen-V1/issues/2265), [ANC05 #2266](https://github.com/skytuhua-org/Gen-V1/issues/2266), [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP04 #2252](https://github.com/skytuhua-org/Gen-V1/issues/2252), [CMP07 #2255](https://github.com/skytuhua-org/Gen-V1/issues/2255), [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [MTH05 #2282](https://github.com/skytuhua-org/Gen-V1/issues/2282), [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298) | ANC02 reserves only temporary actual-main baseline reproduction cases, releases before code integration; ANC04 owns active main-wrapper/controller-options/validated navigation hooks; ANC05 owns history-action/precommit focus bookkeeping. Other participants reserve only actual composer or renderer caller/state hunks. Serialize common imports/test setup briefly; preserve #1188/#1581/#1473/#1969 accepted owners. No indefinite App ownership. |
| scripts/public-source-files.json | [ANC02 #2263](https://github.com/skytuhua-org/Gen-V1/issues/2263), [TIP02 #2268](https://github.com/skytuhua-org/Gen-V1/issues/2268), [INB03 #2273](https://github.com/skytuhua-org/Gen-V1/issues/2273), [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [MTH02 #2279](https://github.com/skytuhua-org/Gen-V1/issues/2279), [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295) | Short exact new-helper source/test/runtime entry reservations only. Serialize with coordinator documentation inventory and other package/source additions. Never regenerate unrelated entries or create a feature adoption dependency. |
| apps/web/src/Markdown.tsx | [MTH04 #2281](https://github.com/skytuhua-org/Gen-V1/issues/2281), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298) | Only one active overlapping hunk reservation at a time; commit/release each short integration. No functional cross-feature adoption order; an explicit no-change/released baseline slot permits the next ready task. |
| apps/web/src/App.tsx, apps/web/src/app-panels.tsx, apps/web/src/registry.tsx | [MTH05 #2282](https://github.com/skytuhua-org/Gen-V1/issues/2282), [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298), [ANC04 #2265](https://github.com/skytuhua-org/Gen-V1/issues/2265), [ANC05 #2266](https://github.com/skytuhua-org/Gen-V1/issues/2266) | Reserve exact caller/state hunks; ANC04 reading-root/onNavigate and ANC05 history-focus are separate. Registry BoundMarkdown differs from action Form hunks. No whole-file/epic lock. |
| apps/web/src/SentenceReveal.tsx | [STR06 #2290](https://github.com/skytuhua-org/Gen-V1/issues/2290), [MTH04 #2281](https://github.com/skytuhua-org/Gen-V1/issues/2281), [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298) | Serialize narrow revision and exclusion hunks, preserving #1115/#1811/#2214 allocation. No renderer adoption dependency. |
| package.json, pnpm-lock.yaml, THIRD_PARTY_NOTICES.md, apps/web/src/dependency-notices.ts, scripts/public-source-files.json | [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [MTH02 #2279](https://github.com/skytuhua-org/Gen-V1/issues/2279), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | Short exact package/notice/source-entry reservations; no overlapping lockfile generation; preserve #1530 active owner and root plan inventory. |
| tests/e2e/task-interface-fixture.ts, tests/e2e/micro-motion.playwright.config.ts, scripts/browser-suites.ts, tests/e2e/markdown.spec.ts | [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [MTH03 #2280](https://github.com/skytuhua-org/Gen-V1/issues/2280), [MTH04 #2281](https://github.com/skytuhua-org/Gen-V1/issues/2281), [MTH05 #2282](https://github.com/skytuhua-org/Gen-V1/issues/2282), [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA04 #2296](https://github.com/skytuhua-org/Gen-V1/issues/2296), [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297), [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | Own named helper/case/registration hunks; serialize common registration and fixture edits; independent new specs can proceed. |
| apps/web/src/diagram-policy.ts | [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | DIA02 owns recognizer/types; DIA09 adds only acknowledged readonly Worker job/reply types after certificate contract, then releases. No parser behavior edit. |

Unanticipated interface/schema changes return to the exact discovery owner for a reviewed full-plan revision. Required schema, writers, readers and decoders land atomically in one compatible PR. Rollback is per leaf and preserves other accepted children; no sweeping source resets or replacement of existing PRs.

## EXECUTION_DAG

The table contains functional dependencies and initial planning readiness. READY means the bounded task may be claimed after normal current-journal checks. It is not permission to bypass an existing owner, failed prerequisite or native release gate. The full executable T01... steps, tests and handoff are in each linked child.

| Task | Bounded deliverable | Kind | Required task outputs | Start state |
| --- | --- | --- | --- | --- |
| [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293) | Freeze useful flowcharts and the Worker feasibility contract | discovery | None | READY: Independent frozen corpus, owner/finality and Worker/CSP feasibility decision before engine installation. |
| [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294) | Certify completely consumed bounded flowchart syntax | implementation | [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293) | BLOCKED: Needs the frozen representative/held-out corpus and exact contract. |
| [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295) | Bound diagram client scheduling, cancellation and cache lifetime | implementation | [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293), [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | BLOCKED: Engine installation is gated by useful complete syntax admission and reviewed build/license feasibility. |
| [DIA04 #2296](https://github.com/skytuhua-org/Gen-V1/issues/2296) | Validate static SVG against the flowchart certificate | implementation | [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294) | BLOCKED: Needs the certificate contract; can run fixture validation in parallel with Worker work. |
| [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297) | Build the accessible source and flowchart preview leaf | implementation | [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA04 #2296](https://github.com/skytuhua-org/Gen-V1/issues/2296) | BLOCKED: Needs matched bounded Worker replies and a trusted detached SVG validator. |
| [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298) | Bind canonical fences and completion proof to eligible callers | implementation | [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293), [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297), [SRC01 #2277](https://github.com/skytuhua-org/Gen-V1/issues/2277) | BLOCKED: Needs reviewed owner/finality proof, leaf and shared source guards; remend/math adoption is not required. |
| [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299) | Measure flowchart fidelity, usefulness and browser cost | verification | [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298) | BLOCKED: Needs the frozen pilot candidate and untouched corpus/control. |
| [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300) | Verify packaged flowchart accessibility and adoption gates | verification | [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299) | BLOCKED: Needs browser-qualified frozen candidate and supported Windows/offline/assistive evidence. |
| [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | Audit the exact engine and build its certified Worker entry | implementation | [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293), [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294) | BLOCKED: Engine installation requires DIA01 feasibility and DIA02 unchanged-corpus admission before work. |

Parent coordination tasks:

1. T01, verify allocation: refresh all complete child bodies, current candidate heads and latest owner releases. Output one accepted input/version record per claimed leaf. Positive: exact SHA and scope; negative: no silent-owner takeover. Done when the first leaf can ACK its inputs.
2. T02, coordinate independent work: assign only ready leaf keys and exact paths. Keep functional dependencies separate from hunk reservations. Publish each bounded output and its focused checks. Done when ready receivers can consume concrete artifacts.
3. T03, review coverage and integration: use the map below to review every original requirement against actual evidence, including existing completed work. A document/fixture/mock does not prove native behavior. Done when every row has PASS, a permitted reasoned non-adoption disposition, or an explicit blocker.
4. T04, final handoff: publish full status, immutable artifacts, current CI/review/main state, remaining gates and RELEASE OWNER=NONE. Close this parent only after the original accepted closure conditions are met and closure is authorized. Otherwise leave open with the exact remaining owner/input.

## VALIDATION

Requirement-to-task coverage:

| Prior requirement, design, task or acceptance | Current child allocation | Preservation note |
| --- | --- | --- |
| T01 | [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293), [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| T02 | [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| T03 | [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302), [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| T04 | [DIA04 #2296](https://github.com/skytuhua-org/Gen-V1/issues/2296), [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| T05 | [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298), [SRC01 #2277](https://github.com/skytuhua-org/Gen-V1/issues/2277) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| T06 | [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299), [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| T07 | [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R01 | [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293), [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R02 | [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294), [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA04 #2296](https://github.com/skytuhua-org/Gen-V1/issues/2296), [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R03 | [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294), [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297), [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298), [SRC01 #2277](https://github.com/skytuhua-org/Gen-V1/issues/2277) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R04 | [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297), [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R05 | [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294), [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R06 | [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA04 #2296](https://github.com/skytuhua-org/Gen-V1/issues/2296), [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299), [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R07 | [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297), [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298), [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R08 | [DIA04 #2296](https://github.com/skytuhua-org/Gen-V1/issues/2296), [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297), [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298), [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R09 | [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293), [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298), [SRC01 #2277](https://github.com/skytuhua-org/Gen-V1/issues/2277), [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R10 | [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293), [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R11 | [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293), [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294), [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299), [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R12 | [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299), [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A01 | [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293), [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A02 | [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294), [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A03 | [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294), [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA04 #2296](https://github.com/skytuhua-org/Gen-V1/issues/2296), [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A04 | [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294), [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297), [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A05 | [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294), [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297), [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A06 | [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A07 | [DIA04 #2296](https://github.com/skytuhua-org/Gen-V1/issues/2296), [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299), [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A08 | [SRC01 #2277](https://github.com/skytuhua-org/Gen-V1/issues/2277), [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297), [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A09 | [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297), [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A10 | [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299), [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A11 | [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298), [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299), [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A12 | [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293), [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A13 | [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| DESIGN D1 candidate/alternatives/license closure | [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293), [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| DESIGN D2 grammar/completeness/3+20 usefulness | [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293), [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294), [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA04 #2296](https://github.com/skytuhua-org/Gen-V1/issues/2296), [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| DESIGN D3 exact interfaces/worker/queue/cache/limits | [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294), [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA04 #2296](https://github.com/skytuhua-org/Gen-V1/issues/2296), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302), [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| DESIGN D4 newline-vs-EOF/finality/source preference | [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294), [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297), [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| DESIGN D5 SVG/font stripping/keyboard/contrast | [DIA04 #2296](https://github.com/skytuhua-org/Gen-V1/issues/2296), [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297), [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| DESIGN D6 opt-in/no-adopt/rollback | [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298), [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| VALIDATION 10cold/30warm/actual Worker/native/AT | [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299), [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300), [DIA09 #2302](https://github.com/skytuhua-org/Gen-V1/issues/2302) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R2 production diagram graph evidence | [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299) | DIA09 entry-only and DIA03 fixture Worker evidence remain separate; DIA07 after DIA06 proves the actual-App emitted graph/startup exclusion/CSP local Worker requests; DIA08 keeps packaged/offline/native gates. |

Publication checks: A01 (R01/T03), every prior substantive row mapped and full prior body retained byte-for-byte; A02 (R02/T01-T02), every child has all nine mandatory plan sections, executable steps and meaningful positive/negative checks; A03 (R03-R04/T01-T02), DAG has no cycles or missing tasks, native GitHub parent/child link completion is verified against this table and any unavailable relationship mutation is explicitly reported in the publication journal, and only exact hunk reservations serialize integration; A04 (R05/T03), product-specific safety/native/motion/evidence gates remain explicit and unexecuted checks are not reported as passing; A05 (R06/T04), final source/body/continuation readback matches exact UTF-8 bytes and published claims are released.

Run git diff --check and node scripts/check-doc-links.mjs for the documentation publication. Product unit/integration/browser/Windows/assistive and capture commands are in the full child/prior plans and run only during their authorized execution. No application tests or footage are executed by this planning revision.

Recordings retain the user's existing requirements: synthetic comparable scenarios, 1920x1080, 30fps, H.264, real interaction speed, no added titles, labels or simulated cursor overlays. Record source SHAs, actual environment/settings, hashes, limitations and verdict outside the footage. Browser zoom and fixtures do not prove native DPI or packaged behavior.

## STATE

Allocation and detailed plans are prepared for publication; immutable body/file verification and native links are recorded in the latest publisher journal. Future leaf execution remains unclaimed unless a current explicit child scope says otherwise. Existing implementation evidence listed above remains valid only for its recorded SHA and acceptance rows.

Next: start with a READY child after full current-journal/input readback; claim that leaf's narrow scope, publish milestones and release before pausing. On each milestone or at most 20 minutes of active work, checkpoint the canonical parent with child key, source SHA, exact checks, gaps and next action. Coordinator consolidates cross-parent handoffs on #2212. No worker receives an exclusive parent-wide implementation assignment.

## REFERENCES

- [Program and full coordination journal](https://github.com/skytuhua-org/Gen-V1/issues/2212)
- [Current parent and complete history](https://github.com/skytuhua-org/Gen-V1/issues/2230)
- [Verified planning base and repository instructions](https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17)
- [Original documentation publication #2215](https://github.com/skytuhua-org/Gen-V1/pull/2215)
- [Continuity documentation publication #2221](https://github.com/skytuhua-org/Gen-V1/pull/2221)
- [Renderer documentation publication #2231](https://github.com/skytuhua-org/Gen-V1/pull/2231)

## Previous accepted canonical body, retained in full

This archive is the complete issue body read before this subdivision. Its product requirements, exclusions, evidence, examples and prior revision history remain binding. Its previous execution grouping is replaced by the child allocation above. Historical status is a snapshot, not a claim that a current PR is merged or that acceptance passed.

<!-- BEGIN PRIOR CANONICAL BODY -->
## Publication record

**Revision:** `AI-DIAGRAM-R1`  
**Complete Markdown:** [ai-diagram-rendering-adoption.md](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-diagram-rendering-adoption.md)  
**SHA-256:** `9226995b95863d660b4cdd845fc23f7071bb0fc2017c229134f96a12cdf2e460`  
**Documentation PR:** [#2231](https://github.com/skytuhua-org/Gen-V1/pull/2231)

The identical committed UTF-8 file is the attachment fallback. The complete canonical plan is reproduced below. Publication verification and ownership releases are recorded in the issue journal. Product implementation and runtime acceptance remain NOT_STARTED/NOT_RUN.

<!-- BEGIN CANONICAL PLAN -->
# Safe flowchart preview: conditional library adoption Implementation Plan

**Goal:** Make completed, useful flowcharts readable in existing Markdown while retaining exact source, responsive input and Gen's safety/accessibility contracts.

**Architecture:** Trial `beautiful-mermaid` 1.1.3 behind a Gen-owned recognizer, real Worker, SVG validator and presentation. Admit only fully understood flowcharts; otherwise show source. **Tech:** existing React/TypeScript/Vite, CopyButton, Modal, motion and source-selection infrastructure. No assistant-ui runtime or replacement Markdown engine. **Spec:** this complete plan under [parent #2212](https://github.com/skytuhua-org/Gen-V1/issues/2212); future workers read it and the full journal before claiming a task.

## META

| Field | Value |
| --- | --- |
| Repository / revision / date | `skytuhua-org/Gen-V1`; `AI-DIAGRAM-R1`; 2026-11-25 |
| Verified baseline / planning branch | `main@96ca4c3bd0664fca53775fbe31915c209641986c`; `docs/ai-harness-library-plans` |
| Complete source | `docs/agent-plans/ai-diagram-rendering-adoption.md` |
| Coordination / owner | [#2230](https://github.com/skytuhua-org/Gen-V1/issues/2230), child of #2212. Planning worker `codex-cloud-inbox-16eb92`, [Y04-DIAGRAM claim](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7169498955). Implementation unassigned. |
| Authorization | [Research/drafting allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7169351635). No product changes authorized by this planning claim. |
| Status / provenance | Pinned source, license and test inspection; official docs; coordinator's public assistant-ui preview observations. No install, implementation, benchmark or native acceptance. |
| Previous work | [PR #2215](https://github.com/skytuhua-org/Gen-V1/pull/2215), [PR #2221](https://github.com/skytuhua-org/Gen-V1/pull/2221) publish earlier plans, not product implementations. Overlapping candidates appear in REPO_MAP. |

The public assistant-ui demo visibly rendered Default and Sequence diagrams with expansion, displayed source/error for Incomplete, and a named skeleton for Streaming. Default labels appeared small within a large frame. Those observations establish reference states, not measured quality, accessibility or Gen behavior.

## OBJECTIVE

Current Markdown fences discard the language and render escaped source with Copy code. Branches and cycles in an agent control flow, retry tree or MCP approval path are difficult to scan in source alone. Add an optional faithful preview using an existing layout engine, with exact source always available.

Success requires useful real examples, correct topology, readable labels and bounded costs against the existing literal-source control. Rendering need not be faster than plain text; it must deliver a documented comprehension benefit while meeting input/startup budgets. **NO_ADOPT**, with unchanged production behavior, is a successful research outcome if the candidate is incomplete, too restrictive, inaccessible or too costly. There is no automatic production adoption.

## REQUIREMENTS

| ID | Binding outcome | Tasks / acceptance |
| --- | --- | --- |
| R01 | Refresh owners/heads; reproduce source baseline; freeze representative and held-out fixtures before tuning. | T01,T06 / A01,A10 |
| R02 | Fully consume admitted syntax and certify every node, edge, label and direction. Unknown or partly parsed source gets no preview. | T02,T03,T04 / A02,A03 |
| R03 | Preserve canonical UTF-16 text, CRLF, trailing newline, exact source/copy and persisted schemas. | T02,T05 / A04,A08 |
| R04 | Use actual completion, not motion, and layout once per unchanged eligible source. Reject stale owner/generation results. | T03,T05 / A05,A06 |
| R05 | Bound input, graph, queue, time, output and cache; terminate actual Worker work. No UI-thread fallback. | T02,T03,T06 / A02,A06,A10 |
| R06 | Only validated static SVG; no diagram-derived network, executable/HTML/config/style content or cross-instance IDs. | T03,T04 / A07 |
| R07 | Persistent source/copy, accessible meaning, Gen Modal, keyboard pan/zoom, safe focus and usable failure state. | T04,T05 / A08,A09 |
| R08 | Local fonts, readable light/dark/contrast/narrow/zoom; no sentence masks or decorative animation on diagrams. | T04,T05,T06 / A09,A10 |
| R09 | Preserve highlighting, Files policy, source capture, find and reading position; one shared integrator across math/streaming/diagram. | T01,T05,T06 / A01,A08,A11 |
| R10 | Audit exact tested packages, advisories, licenses, notices and distribution. Engine MIT does not make its closure all MIT. | T01,T03,T07 / A12 |
| R11 | Compare against source; broader engine adoption requires a separate decision. Stop if useful coverage or costs fail. | T01,T02,T06 / A03,A10,A12 |
| R12 | Complete durable source/body/evidence, truthful implementation/CI/merge state, rollback and ownership release. | T06,T07 / A13 |

**Pilot scope:** existing main-conversation assistant Markdown and existing Markdown artifacts with an unambiguous owner/revision. This does not enable every Markdown caller. Files preview, user prompts, WorkActivity, decision forms, canonical-source panels and unassessed consumers retain their existing path. No new catalog type, editor, export, endpoint, model prompt, host runtime, permissions, account or storage schema.

Do not copy assistant-ui's custom fullscreen trap, pulsing skeleton, trimmed-source fallback or unchecked SVG insertion. Preserve Gen Modal, SourceWorkbench, tables, highlighting and scroll controller. No forced focus, invisible retries, minimum loading delay, blur/bounce, whole-text scaling, automatic camera or per-token layout. Planning edits only this document; product work needs fresh claims.

## REPO_MAP

All existing paths below were verified at baseline; proposed files are explicitly marked. Sparse checkout omissions were recovered through pinned source reads.

| Existing path(s) | Contract / permitted integration |
| --- | --- |
| `apps/web/src/Markdown.tsx`, `markdown.css`, `CopyButton.tsx` | Safe parser, escaped code and copy; whole-text CRLF normalization, ignored fence info. Add only agreed eligible-language/original-body seam; retain other branches. |
| `apps/web/src/app-panels.tsx`, `App.tsx`, `registry.tsx` | AssistantProse and Markdown artifact callers. `animate` is not actual streaming completion. Discover eligible owner/revision delivery; no invented persistent Message field. |
| `apps/web/src/SentenceReveal.tsx`, `motion-policy.ts`, `main.tsx` | Walker excludes pre/code/tables/controls, not explicitly SVG. Add narrow diagram exclusion. Existing local Inter import and motion policy remain authoritative. |
| `apps/web/src/SourceWorkbench.tsx`, `SourceSelectionActions.tsx` | Canonical UTF-16 mapping rejects transformed text. Current exact-rendering effect depends on `[text,enabled]`; same-text lazy DOM changes need the shared invalidation seam below. |
| `packages/ui-shell/Modal.tsx` | Native dialog, focus retention, inert exit and Escape/IME handling. Reuse `{open,title,onClose,children,className?}`; do not invent an existing removed-owner fallback. |
| `apps/web/src/conversation-scroll.ts` | Follow/detached/history control. No diagram-owned scroll writer; coordinate #2218 or reserve geometry. |
| `tests/e2e/markdown.spec.ts`, `task-interface-fixture.ts` | Synthetic assistant/artifact, snapshot, hostile HTML, table, selection and stream coverage. Extend actual production paths. |
| `tests/e2e/micro-motion.playwright.config.ts`, `scripts/browser-suites.ts` | Registered Markdown suite, port 5476. No assumed top-level Playwright config. |
| `tests/source-selection-v3.test.ts`, `tests/source-selection-dom-v3.test.ts` | Pure canonical UTF-16 mapping checks; the dom-v3 filename does not establish browser DOM coverage. |
| `tests/e2e/workbench.spec.ts`, `tests/e2e/workbench-app.spec.ts` | Real transformed-selection refusal, keyboard actions and delayed owner settlement. Registered configs: `workbench.playwright.config.ts` (5591) and `workbench-app.playwright.config.ts` (5592), under `tests/e2e/`. |
| `tests/e2e/conversation-scroll.spec.ts`, `tests/e2e/conversation-scroll.playwright.config.ts` | Existing reading-position regressions and actual scoped config. |
| `package.json`, `pnpm-lock.yaml`, `THIRD_PARTY_NOTICES.md`, `scripts/public-source-files.json`, `vite.config.ts` | Integrator-owned exact dependency/notice/source inventory and Worker production build. T01 discovers actual CSP/desktop packaging paths; no policy relaxation. |

**Overlap ledger, recheck before edits:** [#1530](https://github.com/skytuhua-org/Gen-V1/issues/1530)/[PR1549](https://github.com/skytuhua-org/Gen-V1/pull/1549), open/unmerged head `796097030fa3c4dfeed65291c602d1268ef2e23d`, own CodeBlock/language, raw copy and lazy Lezer; preserve the no-Shiki choice. Source review found unreleased owner `devin-a-cloud-f1a91d`. [#1583](https://github.com/skytuhua-org/Gen-V1/issues/1583)/[PR1632](https://github.com/skytuhua-org/Gen-V1/pull/1632), open/unmerged `ff9e1093ddba30bd20e2040d6b581856df082a59`, own opt-in Files Markdown/granted local resources and explicitly exclude Mermaid/new engine. Recorded releases do not mean merged or permit scope changes.

[#1969](https://github.com/skytuhua-org/Gen-V1/issues/1969)/[PR2062](https://github.com/skytuhua-org/Gen-V1/pull/2062), open/unmerged `9c11de3b8e112188adac228a551d83eac8459912`, own existing find/terminal/table budgets; this trial bounds only its new workload. [#2218](https://github.com/skytuhua-org/Gen-V1/issues/2218) owns detached reading correction; [#2214](https://github.com/skytuhua-org/Gen-V1/issues/2214) duration resolution only. Existing #1115/#1186/#1188/#2141 are preserved.

Math/streaming/diagram share Markdown, callers, SentenceReveal, source selection, fixtures and manifests. T01 records one acknowledged integrator and commit order. Isolated new policy/Worker/presentation files can proceed in parallel within the DAG. Silence/age never releases an owner; refresh full bodies, comments and linked heads, with explicit coordination before shared edits.

## DESIGN

### D1. Candidate and alternative

`beautiful-mermaid@1.1.3`, commit `65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b`, exports synchronous `renderMermaidSVG(text,options):string` and flow/state `parseMermaid(text)`. Its async alias calls the synchronous renderer; it is not offloading. The DOM-free engine imports bundled ELK; its adapter intercepts `setTimeout` during initialization and bypasses FakeWorker scheduling. Upstream size comments are not Gen measurements.

Assistant-ui's standalone `{code,streaming?,className?}` leaf at `4797ce5da22845dfa0c0d2cbd115f8e6fe42d2a2` needs no chat provider. It catches rendering failures and adds a lightbox; its modern stylesheet path strips Google Fonts imports, while server/hydration/unsupported-browser paths retain original markup. Engine output uses static marker IDs and source-derived styles; XML escaping alone is not resource safety. Reuse the engine conditionally, not the complete leaf.

Full `mermaid@12.3.0` at `2086904e76c692331e34a45d7cc3bc30860d040e` offers broader documented families, `mermaid.parse` and strict mode that encodes HTML/disables click actions. Its renderer uses DOM operations and DOMPurify; dependencies include D3, ELK, parser/layout packages and KaTeX. Strict mode is not proof of complete semantics, zero network, worker compatibility or bundle size. It is a separately reviewable alternative, not an installed runtime fallback. A switch needs a revised full plan and equivalent measurements/gates.

### D2. Explicit initial support and completeness

| Input | Upstream beautiful-mermaid 1.1.3 | Initial Gen trial |
| --- | --- | --- |
| Flowchart/graph | Supported | Only the grammar below |
| State, sequence, class, ER, XY | Supported | Exact source |
| Gantt, pie, mindmap, git graph, C4, journey/other | Outside its documented six families | Exact source; no second engine |
| Directives/frontmatter, subgraphs, click/links, images/icons, style/class/linkStyle, chain/parallel shorthand, HTML/Markdown labels | Various handling, including skipped fragments | Reject whole preview, never strip and render a remainder |

**Proposed recognizer:** one `graph` or `flowchart` header with `TD|TB|LR|RL|BT`; explicit rectangle `ID[Plain label]`; one edge per line `ID --> ID` or `ID -->|Plain label| ID`; blank lines and whole-line `%% ` comments. IDs match `[A-Za-z][A-Za-z0-9_]{0,63}`, exclude reserved statements, and are declared exactly once before edges. Duplicate declarations/dangling endpoints/trailing content reject the block; repeated edges remain an ordered multiset.

Labels are nonempty plain Unicode, <=96 code points, with no controls, backticks or `[]{}()<>|\\"*~&`. No entity/escape/Markdown transformation may change labels. Anchored productions consume every non-comment character. Keep original offsets/source unchanged; only the private rendering copy is normalized.

A certificate records direction, ordered node IDs/labels and edge endpoints/labels/counts. T02 proves complete input consumption. T03 compares the engine's parsed graph with the certificate before layout. T04 checks output semantic `data-id/from/to/label` and visible text against it, including edge multiplicity. Missing/extra/renamed/dropped content rejects the entire preview. Nonempty SVG or no thrown error is insufficient. All accepted diagrams must pass; never accept a partly correct picture.

Freeze three useful scenarios and 20 held-out ordinary valid flowcharts before tuning. At least16/20 and all three useful scenarios must be admitted and faithfully rendered without rewriting their source. If a second broad parser is needed, ordinary diagrams fail this gate, or only contrived examples work, record **NO_ADOPT**. Do not loosen the recognizer or install a larger parser without a complete plan revision.

### D3. Proposed leaf contracts and budgets

New files, absent at baseline: `apps/web/src/diagram-policy.ts`, `diagram-worker.ts`, `diagram-client.ts`, `diagram-svg.ts`, `DiagramPreview.tsx`, `diagram-preview.css`; `tests/diagram-policy.test.ts`, `tests/diagram-client.test.ts`. Renaming requires updating this plan and ownership.

```ts
type DiagramInput = {
  scopeKey:string; generation:number; source:string;
  fenceClosure:'incomplete'|'closed-newline'|'closed-eof';
  finality:'known-final'|'known-static'|'unknown'; streaming:boolean;
};
type FlowCertificate = {
  direction:'TD'|'TB'|'LR'|'RL'|'BT';
  nodes:readonly {id:string;label:string}[];
  edges:readonly {from:string;to:string;label:string}[];
};
type DiagramDecision =
  | {kind:'eligible';certificate:FlowCertificate;renderSource:string}
  | {kind:'source';reason:'incomplete'|'unsupported'|'budget'|'invalid'};
declare function certifyFlowchart(input:DiagramInput):DiagramDecision;
type DiagramJob = DiagramInput & {
  requestId:number;certificate:FlowCertificate;renderSource:string;
};
type DiagramReply = {requestId:number;scopeKey:string;generation:number} &
  ({kind:'rendered';svg:string}|{kind:'source';reason:string});
// Client returns cancel; disposing a scope cancels its queued/active work.
declare function requestDiagram(job:DiagramJob,settle:(r:DiagramReply)=>void):()=>void;
declare function disposeDiagramScope(scopeKey:string):void;
```

Client matches request, scope, generation, exact current source and certificate; hashes only index caches. One scheduler per webview, one active Worker layout, <=4 queued, <=4 automatic previews per Markdown owner. Cache totals across all owners: <=8 entries and <=1MiB, with owner keys; disposing/replacing an owner removes its jobs/cache, not another mounted owner's work. Source revision invalidates old SVG immediately. Cancellation of an active job terminates that Worker; remaining valid queued work may start a fresh instance, without retrying the failed job.

**Proposed protective limits:** source 16,384 UTF-8 bytes/256 lines/64 nodes/128 edges; labels 96 code points. Output 256 KiB / 2,048 elements / depth 32; finite positive canvas dimensions <=4,096 CSS units each. Validate before corresponding expensive work. Worker import/startup deadline 2,000ms; layout 750ms from dispatch. Outer client terminates on deadline/crash/cancel. Hidden/inert/unmounted/changed owners schedule no work and cancel outstanding jobs. No retry loop, UI-thread fallback or misleading async wrapper. Verify actual production/packaged Worker loading; inability means source, never CSP relaxation.

Worker receives bounded source/trusted constants only, no host bridge/credentials/filesystem/tool authority. Bundled same-origin chunks are allowed, diagram-derived requests are forbidden. Every reply remains bounded and validated on the UI side. Tightening limits is allowed; relaxing them needs a full plan revision before measurement.

### D4. Completion and source lifecycle

Take the original canonical fence-body slice using original JavaScript UTF-16 offsets, preserving CRLF/trailing newline. Only an exact matching closing-delimiter line qualifies. `closed-newline` certifies that its terminating newline is present; it can qualify while later prose streams. `closed-eof` qualifies only when streaming is false AND independent authoritative proof sets finality to known-final or known-static. False/default streaming alone proves nothing: unknown/native EOF stays source until a newline or separately verified final/static proof. Incomplete fences and contradictory streaming/finality inputs stay source. These are proposed local adapter fields, not a new host schema. Surrounding prose, theme and scroll changes cause no new layout for unchanged eligible source.

The shared streaming plan proposes `Markdown.streaming?:boolean` defaultfalse and an AssistantProse signal distinct from `animate`/`initialReveal`, derived from accepted transient deltas. These APIs are absent at baseline, and false also covers unknown/default state. T01 separately verifies authoritative final/static evidence for each eligible owner; a persisted Message or absent live marker is not that evidence. If native completion is unresolved, retain unknown and the newline-only path, consistent with the streaming plan's authoritative-adapter-or-defer gate. This trial does not require remend adoption. Missing owner/completion proof means source, not an invented schema or finality inference.

State: source/incomplete -> eligible/waiting -> preview or source/unavailable. Explicit Source preference persists for that source revision; pending completion must not override it. Waiting retains readable/copyable source with a quiet status. Unsupported syntax: “Preview unavailable for this syntax”; other failures: “Preview unavailable. Source is shown.” No raw exception/source telemetry, trimming, inferred success, forced focus or decorative loading motion.

**Shared source-selection contract, proposed:** one integrator-owned MutationObserver on each authored `.source-selection-text` root observes childList/characterData/subtree and agreed app-owned transformation markers. Coalesce into local presentationEpoch, invalidate candidate/revision and stale UI settlements, then recompute exactRendering. Read/action guards also recompute synchronously, so observer delay never authorizes stale capture. Gen-only `data-source-selection-ui` wrappers exclude controls/duplicate raw disclosure from authored measurement; `data-source-transformed` forces canonical-source fallback. Model HTML never supplies these markers. Diagram lazy commit/removal/mode switch uses the shared helper, not new offset mapping. No alteration of already-dispatched host actions; late catch/finally cannot affect a new owner. Disconnect/cleanup on disable/unmount and retain bounded local scans, not a global repeated observer. Keep unique canonical UTF-16 mapping and Select canonical source; SVG labels are never fabricated source ranges.

### D5. SVG policy and presentation

Reject document-type/entity declarations and processing instructions before XML parsing; then parse bounded output inertly. Build validated static SVG using an explicit allowlist, never unchecked innerHTML or a regex-only sanitizer. Initial output elements: `svg,g,defs,marker,rect,polyline,polygon,text,tspan,title,desc`. Reject unknown meaningful output wholesale. Allow only fixed engine semantic classes and reviewed attribute/value forms. Forbid script/foreignObject/image/use/anchor/events/animation/external namespaces, arbitrary classes/CSS and resource URLs. Validate finite coordinates/list lengths and local references; reject duplicate IDs/cycles/missing targets.

Remove every engine style element/inline style before connection, including encoded URLs/imports; reconstruct from trusted Gen CSS/tokens/local Inter/system fonts. No Google Fonts/CDN/@font-face/remote image/telemetry. Permit only validated local references to IDs rewritten with a unique prefix for each inline and modal instance. Test parser/validation itself for zero requests. Recheck semantic certificate after sanitization; removal cannot make an incomplete picture look valid.

A quiet contained figure offers persistent Show source/Show preview, Copy code and Expand outside authored labels. Accessible name “Flowchart”, certificate-derived counts and ordered connection list provide meaning without invented LLM explanation or color dependence; hide decorative duplicate SVG from assistive output. Always keep exact source reachable. Reserve geometry or coordinate #2218 before transcript enablement; never add a scroll writer.

Expand uses existing Modal. Visible zoom/pan/reset controls and focused-viewport keys give equivalent outcomes: arrows 32px, Shift+arrows 128px, +/- factor 1.25, Home reset, scale 0.5..4. Consume only handled viewport keys; editable controls and Ctrl/Meta browser zoom retain defaults. Escape/IME stay with Modal. Pointer drag is optional with capture/cancel cleanup; wheel remains ordinary scrolling. Async publication never steals focus; existing Modal handles restoration, with explicit removed-owner fallback agreed at T01.

Labels remain >=12px effective, text contrast>=4.5:1 and meaningful graphics/controls>=3:1 in light/dark/high contrast. If fit would shrink labels, use readable contained overflow/expansion. Verify 320/390px and 200/400% zoom. Exclude SVG, summary and controls from SentenceReveal; normal prose remains unchanged. Publication/pan/zoom are immediate in Full/Reduced/Off; Modal follows its existing motion policy.

### D6. Integration and rollback

Single integrator reconciles #1549 CodeBlock and #1632 Files policy before minimal eligible-fence wiring. Preserve untagged/unknown/non-Mermaid code, copy, links/no-image defaults and table limits 24 columns / 200 rows / 4,096 derived cells. No competing CodeBlock/parser. Add original-body offset mapping only for this diagram branch; existing normalized ordinary-code behavior is not silently changed.

Keep engine outside initial entry. Internal trial gate defaults off until T06/T07 accepts; no new public settings project. Rollback disables preview and retains source, then removes this trial's Worker/cache/dependency by reviewed revert if appropriate. No data migration. Preserve adjacent math/streaming/highlighting/Files/anchor work.

## EXECUTION_DAG

**T01 -> T02 -> T03; T02 -> T04 fixture preparation; T03+T04 -> T05 -> T06 -> T07.** T04 cannot accept real output before T03. Early NO_ADOPT from T01-T06 goes directly to T07 decision publication; skipped production tasks remain NOT_RUN. One owner per file, including tests shared by T02/T04.

### T01: Freeze baseline, owners, corpus and build/license boundary

**Goal/deps:** prerequisite discovery before product work; no dependencies. **Owner/files:** diagram implementer and named shared integrator; read REPO_MAP/full journals, claim proposed `docs/review-evidence/ai-flowchart/` for records. **Input/output:** current main/candidate/upstream pins -> frozen baseline, corpus, interface/file allocation and exact production build/CSP map for T02-T04.

1. Refresh full related bodies/comments/PR heads; secure explicit allocations/integration order with highlighting, Files, math, streaming and anchor owners. Settle eligible owner/revision, independently authoritative final/static proof or explicit unknown, and presentation invalidation APIs, plus removed Expand-owner focus fallback to a verified surviving real control. Native unknown uses newline-certified closure only; streaming=false never supplies final proof.
2. Reproduce literal source/copy on eligible and excluded surfaces. Freeze agent control flow, retry/failure cycle and MCP approval/denial fixtures, plus 20 ordinary held-out valid flowcharts with explicit expected topology and provenance. Do not rewrite them after seeing rejection.
3. Discover actual Worker/CSP/desktop packaging files via `git ls-tree`/`rg` and pinned reads; baseline entry/chunk bytes. Audit pinned packages/advisories/license closure: engine MIT, elkjs 0.11.0 EPL-2.0, entities 7.0.1 BSD-2-Clause. Record notices/source-distribution handling, not an unsupported incompatibility claim.

**Tests/done/handoff:** positive source/copy and negative excluded/missing-owner fixtures reproducible; exact hardware/build/budgets/corpus/contracts frozen. T02 receives written allocation and inputs. Unresolved ownership/legal/build facts block affected integration, not unrelated pure recognition research.

### T02: Implement complete admission and test ordinary usefulness

**Deps:** T01. **Owner/files:** policy worker, proposed `diagram-policy.ts`, `tests/diagram-policy.test.ts`; no shared parser. **I/O:** DiagramInput -> decision/certificate/private render source for T03/T04.

1. Test every D2 production, full consumption, exact labels/offsets, CRLF/newline, Unicode and each limit at/over boundary. Include valid-prefix+junk, extra edge suffix, reserved/duplicate IDs, repeated edges, entities, dangling arrows and mixed syntax.
2. Implement bounded recognizer/certificate without repairing canonical text. Run frozen corpus admission before installing engine: all 3 scenarios and >=16/20 must qualify; record every rejection reason.
3. If syntax completeness needs a broad second parser or admission fails usefulness, stop with NO_ADOPT. Engine topology/render faithfulness is explicitly T03/T04/T06, avoiding a circular dependency here.

**Tests/done/handoff:** pure tests demonstrate meaningful decisions, no dropped text or fabricated parser success. T03 receives admitted immutable corpus/certificates; T04 gets certified fixtures. Either admission passes or T07 receives an exact no-adopt report, never a promised later exception.

### T03: Isolate engine execution, bound resources and reject stale replies

**Deps:** T01,T02. **Owner/files:** Worker/client worker creates `diagram-worker.ts`, `diagram-client.ts`, `tests/diagram-client.test.ts`; integrator alone updates exact package/lock/notices/manifest after admission. **I/O:** certified job -> matched bounded reply/cancel/dispose API for T04/T05.

1. Load engine only in real module Worker; compare parsed logical graph/certificate before layout. Implement scheduler, all D3 limits, cache identity and output caps. No async-name/main-thread shortcut.
2. Test startup/crash/timeout/active cancellation, hidden/unmounted/owner replacement, stale generation, digest collision with different source, duplicate replies, queue overflow and cache disposal. Drop failed jobs without automatic retry; preserve valid other owners.
3. Verify real production worker/chunk and packaged constraints. Actual busy-Worker browser test must prove termination and continuing input; mocks/fake timers alone cannot pass. Unsupported startup remains exact source.

**Done/handoff:** reviewed dependencies and real Worker behavior, topology cross-check, byte/time/queue/cache bounds and identity tests pass. T04 gets exact engine result/limit contract; T05 gets cancellation lifecycle. No production adoption yet.

### T04: Build validated accessible Gen presentation

**Deps:** T02 for fixture-only work, T03 for acceptance. **Owner/files:** presentation worker creates `diagram-svg.ts`, `DiagramPreview.tsx`, `diagram-preview.css`; uses agreed T02 test allocation. No Modal/global CSS rewrite. **I/O:** matched certificate/SVG plus original source -> validated figure/source/modal and shared transformation marker.

1. Implement D5 allowlists, style removal, local reference rewrite and certificate/visible-label equality. Reject hostile/unexpected nodes, encoded resources, malformed XML, unknown classes, duplicate/cross-instance IDs, nonfinite/excessive geometry and topology mismatch.
2. Implement pending/source/preview/failure with exact copy, persistent controls, accessible counts/connections and Gen Modal. Keyboard pan/zoom/reset, IME/browser zoom and pointer cancel work without page/focus theft.
3. Test multiple diagrams/modal copies/themes, all motion modes, source-first failure and unreadable-fit graphs. Validate no request even during parse/validation and no document CSS leakage.

**Done/handoff:** no unvalidated markup reaches connected DOM; every rejection preserves source. Certified figure API/marker/lifecycle and keyboard evidence go to T05. Fixture-only success is not product/browser/assistive acceptance.

### T05: Integrate the shared seam and preserve existing behaviors

**Deps:** T01,T03,T04 plus acknowledged shared claims. **Owner/files:** single integrator edits Markdown/callers/SentenceReveal/source boundary as agreed, existing Markdown/workbench browser specs and their fixtures, and inventories. **I/O:** isolated leaf + completion/owner contract -> feature-gated pilot SHA for T06.

1. Reconcile owner candidates and preserve ordinary CodeBlock/Files policy. Read original fence-body offsets, supply identity/generation and explicit eligibility only at assessed assistant/artifact callers.
2. Test unclosed/partial closing delimiters; false+unknown EOF remains source, newline-closed+unknown qualifies, false+authoritative-final/static EOF qualifies, and contradictory true+final/static refuses. Include final-proof arrival without changed text, later prose, native unknown, reconnect/owner replacement and edited source. Exactly one layout per unchanged certified block; source preference persists across late completion.
3. Apply shared authored-root observer/markers and synchronous source-action guard; test lazy same-text publish/remove/mode switch and stale UI settlement in the real workbench and workbench-app fixtures. Preserve UTF-16 mapping/canonical fallback; exclude diagram content from SentenceReveal. Pure mapper tests alone cannot verify DOM invalidation.
4. Regress code/copy/table/link/hostile HTML/Files/find/selection. Async publication above a detached reader must preserve visible-message offset<=2px through #2218 or proven reservation, never a second scroll writer.

**Done/handoff:** eligible real assistant/artifact and excluded callers pass; source capture reflects presentation changes; no conflicting shared claim. Hand frozen head and actual regression results to T06, with remaining platform gates explicit.

### T06: Compare usefulness, safety, performance and accessibility

**Deps:** frozen T05 candidate and T01 control/corpus. **Owner/files:** independent reviewer, claimed tests/evidence only; implementer fixes separately. **I/O:** paired fixtures/settings -> A01-A13 evidence and ADOPT/NO_ADOPT for T07.

1. Run VALIDATION, including real Worker kill/network/offline/multi-instance/source invalidation and hidden-owner cases. Every admitted graph must match; all 3 useful scenarios and >=16/20 held-out must pass, without fixture rewrites.
2. Compare source versus preview tasks: correctly trace expected branches/cycles and reach source unaided. Record errors/timing and a concrete readability benefit; do not invent study statistics.
3. On one named Windows machine/build record 10 cold / 30 warm runs: startup/layout, long tasks/input, initial/lazy gzip bytes and retained memory after teardown. Use identical synthetic fixtures, report distributions and failures, not marketing speed claims.
4. Paired 1920x1080 before/after videos have no inserted titles/overlays; adjacent text records SHAs/settings. Capture light/dark/narrow/zoom/Full/Reduced/Off/keyboard and actual Windows screen-reader/packaged behavior.

**Done/handoff:** matrix is PASS or specific blocker. Fidelity/safety/accessibility/usefulness/cost failure keeps production off. Fixes invalidate affected head evidence and require relevant reruns. T07 gets exact disposition/remaining gates, no implicit merge permission.

### T07: Publish decision, review and release

**Deps:** T06 or documented early no-adopt; **owner:** authorized coordinator/maintainer, license/build reviewer where needed. **Files/I/O:** complete canonical plan/body, focused implementation or decision-only PR, exact notices/evidence -> reproducible durable decision for next named worker.

1. ADOPT requires full acceptance; otherwise NO_ADOPT with unchanged source behavior and no production trial dependency. Preserve rejected cases/results. Publish full updated .md and issue body; read back exact bytes/sections and immutable links under AGENTS.
2. Report actual checks, PR/CI/review/merge/Windows states separately. After authorized merge verify current main and rollback; remove only this trial if rejected, preserving neighboring work.
3. Final RELEASE sets OWNER=NONE, identifies recipient/ACK and remaining next task, clears only own assignment/progress markers. Issue closure needs accepted criteria and maintainer authority.

**Done:** durable full source/evidence, truthful handoff and no stale claim; no essential local-only bytes masquerade as complete delivery.

## VALIDATION

All commands and product criteria below are **planned**, not executed in this research. Use supported Node >=24.10.0, pnpm 10.30.3 and reviewed lock/browser prerequisites. Dependency installation occurs only in the claimed implementation trial after T01/T02. Native Windows/credential checks cannot be replaced by Linux browser results.

```sh
pnpm build:widgets
pnpm exec vitest run tests/diagram-policy.test.ts tests/diagram-client.test.ts tests/source-selection-v3.test.ts tests/source-selection-dom-v3.test.ts --maxWorkers=1
pnpm typecheck
pnpm build
pnpm exec playwright test --config tests/e2e/micro-motion.playwright.config.ts tests/e2e/markdown.spec.ts
pnpm exec playwright test --config tests/e2e/workbench.playwright.config.ts
pnpm exec playwright test --config tests/e2e/workbench-app.playwright.config.ts
pnpm exec playwright test --config tests/e2e/conversation-scroll.playwright.config.ts
pnpm exec vitest run tests/public-source.test.ts --maxWorkers=1
pnpm check:docs-links
```

The two diagram test files are proposed T02/T03 outputs. Extend the registered Markdown spec; if a separate Worker suite becomes necessary, T01 records real config/spec/`scripts/browser-suites.ts` registration before invoking it. Run required lint/CI/packaged gates per CONTRIBUTING after focused checks. Never present suite discovery, queued CI or mocks as successful product acceptance.

| ID | Observable acceptance / evidence | Tasks |
| --- | --- | --- |
| A01 | Refreshed full journals/heads, actual baseline and acknowledged integrator/file allocation; no assumed merge or silent-owner takeover. | T01,T05 |
| A02 | Every syntax/count/byte limit tested at/over boundary before layout; unknown suffix/statement and incomplete fence reject whole preview, retaining exact source. | T02,T03 |
| A03 | Every admitted topology/label/direction equals input certificate and validated output; all 3 useful and >=16/20 frozen held-out pass without rewrites. | T02-T04,T06 |
| A04 | Copy equals original fence-body string including CRLF/trailing newline; no SVG/trimmed/summary copy; ordinary code behavior preserved. | T02,T05 |
| A05 | No premature/per-token layout; false+unknown EOF stays source; newline closure or independently authoritative final/static proof qualifies. Native unknown/contradiction/same-text proof arrival pass; one layout per unchanged source, zero theme/prose/scroll repeats, safe replacement/source preference. | T02,T03,T05 |
| A06 | Real busy Worker terminates by deadline; bounded queue/cache; responsive input; every old/hidden/disposed/mismatched reply ignored. | T03,T06 |
| A07 | Zero diagram-derived requests, including encoded styles/fonts/offline reopen; no forbidden connected nodes/attributes; inline/modal instance IDs disjoint and local. | T04,T06 |
| A08 | Same-text lazy DOM changes refresh source fallback and invalidate stale UI candidates; UTF-16 remains fail-closed; no selection/focus theft and source always reachable. | T05 |
| A09 | Named meaningful keyboard/screen-reader figure and Modal; pan/zoom/reset/source/close; >=12px labels and contrast goals in both themes/high contrast, 320/390px, 200/400%, Full/Reduced/Off. | T04,T06 |
| A10 | Clear task benefit; no engine in initial entry; added lazy gzip <=750 KiB; warm layout p95 <=150ms and accepted layout <=750ms; typing p95 <=50ms AND <=baseline+16ms; no new attributable main-thread task >=50ms. | T06 |
| A11 | Existing code/table/link/HTML/Files/find/source tests correct; detached visible anchor moves <=2px on preview publication; no new scroll writer/default consumer expansion. | T05,T06 |
| A12 | Exact tested dependency closure, advisory/license/notice/distribution review and production/packaged Worker path, without relaxed policy. | T01,T03,T07 |
| A13 | Full plan/body/file/evidence accessible, readback exact; actual CI/merge/main states distinguished; rollback/recipient/release recorded. | T07 |

Numerical budgets are proposed trial gates, not measured results. Freeze before measurements; a justified change requires complete plan revision and repeated comparison, not silently moving thresholds after failure. Cache memory and disposal are checked separately from gzip size.

Review focus: ignored suffixes; encoded resource/style payloads; worker completion after owner/source-choice change; unchanged-text DOM with stale capture status; graphs that fit only with unreadable labels. Include 65th node / 129th edge, huge labels/output, duplicate IDs, offline/startup/timeout, selected text, removed Expand trigger, hidden retained view, IME Escape and browser zoom. Use synthetic/redacted fixtures only, no provider/tool calls. Keep credentials, private paths/conversations and personal traces out of evidence. Native assistive/performance/network checks remain explicit independent gates.

## STATE

**Researched:** pinned Gen Markdown/Modal/source/motion/tests; standalone assistant-ui leaf; engine API/parser/renderer/theme/ELK adapter; alternative Mermaid docs/source; exact direct dependency licenses. These are source findings, not runtime exploit, performance or accessibility claims.

**Decided/proposed:** conditional engine trial, one flowchart grammar, completeness certificate, real bounded Worker, trusted static SVG/local fonts, accessible Gen wrapper, shared source invalidation and serialized integration; all other syntax source-only. Numerical thresholds are requirements to verify. No automatic larger parser/runtime/production adoption.

**Not implemented or verified:** every new interface/product task T01-T07, package change, benchmark/native test and A01-A13 product acceptance. Y04-DIAGRAM drafting is complete; coordinator owns parent/manifest/docs PR/full issue publication. #2230's header/journal records immutable source and exact readback; latest accepted releases/ACKs control documentation ownership. Planning release transfers no implementation scope.

**Risks/next:** narrow grammar may reject useful ordinary diagrams; private/synchronous ELK coupling may fail Worker/build/cost gates; engine styles/fonts and late DOM require strict validation/invalidation. Next implementation action is T01: read full latest parent/child journals and candidate heads, claim exact files, freeze corpus/contracts and inspect actual build/license closure before install. Unresolved fidelity, ownership, distribution or isolation blocks adoption. NO_ADOPT preserves current source view.

## REFERENCES

All pins below were inspected; source URLs retain required facts without depending on private conversation. Runtime claims still require the stated trial.

- Gen baseline [Markdown](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/Markdown.tsx), [source selection](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/SourceSelectionActions.tsx), [Modal](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/packages/ui-shell/Modal.tsx), [browser tests](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/tests/e2e/markdown.spec.ts), [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/CONTRIBUTING.md). Related work and exact heads appear in REPO_MAP.
- assistant-ui [standalone leaf](https://github.com/assistant-ui/assistant-ui/blob/4797ce5da22845dfa0c0d2cbd115f8e6fe42d2a2/packages/ui/src/components/react/assistant-ui/elements/mermaid-diagram.tsx), [tests](https://github.com/assistant-ui/assistant-ui/blob/4797ce5da22845dfa0c0d2cbd115f8e6fe42d2a2/packages/ui/src/components/react/assistant-ui/elements/mermaid-diagram.test.tsx), [MIT](https://github.com/assistant-ui/assistant-ui/blob/4797ce5da22845dfa0c0d2cbd115f8e6fe42d2a2/LICENSE), [demo/API](https://www.assistant-ui.com/elements/mermaid-diagram). Source registry private package 0.0.0 is pinned by commit, not the separate React runtime's version.
- beautiful-mermaid 1.1.3 [package](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/package.json), [MIT](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/LICENSE), [API](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/src/index.ts), [parser](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/src/parser.ts), [renderer](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/src/renderer.ts), [theme/fonts](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/src/theme.ts), [ELK adapter](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/src/elk-instance.ts). Tag 2026-02-26; inspected main `2ac8bbbb060ca0a65a6a21f3200bd99b1587b488` dated 2026-05-06. Maintenance timestamps/test sources are not support guarantees.
- Direct dependency evidence: [elkjs 0.11.0 package](https://github.com/kieler/elkjs/blob/37e798513db6e88b2e205b8239ed4e387d5f24d0/package.json), [EPL-2.0](https://github.com/kieler/elkjs/blob/37e798513db6e88b2e205b8239ed4e387d5f24d0/LICENSE.md); [entities 7.0.1 package](https://github.com/fb55/entities/blob/994259f32eba1c822c16da075656f745c493c560/package.json), [BSD-2-Clause](https://github.com/fb55/entities/blob/994259f32eba1c822c16da075656f745c493c560/LICENSE). Engine ranges are `^0.11.0`/`^7.0.1`; inspect actual future resolution/package contents, notices and distribution, do not claim the closure all MIT or inherently incompatible.
- Full Mermaid alternative: official [parse/render usage](https://mermaid.js.org/config/usage.html), [strict/secure/maxTextSize/maxEdges](https://mermaid.js.org/config/schema-docs/config.html), [syntax limits](https://mermaid.js.org/intro/syntax-reference.html); pinned 12.3.0 [package](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/package.json), [DOM/sanitization renderer](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/mermaidAPI.ts), [MIT](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/LICENSE). Observed 2026-11-25; broader syntax/strict mode do not guarantee every parameter or Gen policy. Its full closure/bundle/execution require separate measured selection.
<!-- END CANONICAL PLAN -->

<!-- END PRIOR CANONICAL BODY -->
