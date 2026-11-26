# Parallel execution for issue #2228

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-PARENT-2228-R1, 2026-11-25. Coordination parent: [#2228](https://github.com/skytuhua-org/Gen-V1/issues/2228). Program and consolidated journal: [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Verified planning base: main@defe9884530145e9c109b8ed98f80efac8beeb17. Previous complete body: 35956 UTF-8 bytes, SHA-256 a7611e715ab3076631c79fb79d0ab2d4abc0777db1e62f4630a4edfc6a5f22c5, reproduced unchanged below. The publication header supplies this revision's immutable file and reviewed documentation PR. Product implementation, review, merge and verified-on-main remain separate states.

## OBJECTIVE

Replace a broad single-worker assignment with 8 bounded, separately claimable tasks. Separate pure contract/helper, lifecycle, narrow shared bindings and finite verification outcomes; no epic-wide implementation owner. Success means each worker can complete one explicit outcome from its own full issue, source and input commits, while unrelated workers proceed independently. This parent coordinates coverage and final acceptance; it does not reserve every child or shared file for one agent.

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
| [STR01 #2285](https://github.com/skytuhua-org/Gen-V1/issues/2285) | docs/agent-plans/streaming-phase-contract.md; docs/review-evidence/parallel-renderers/streaming-phase-baseline.md |
| [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286) | apps/web/src/streaming-markdown.ts; tests/streaming-markdown.test.ts; package.json; pnpm-lock.yaml; THIRD_PARTY_NOTICES.md; apps/web/src/dependency-notices.ts; scripts/public-source-files.json |
| [STR03 #2287](https://github.com/skytuhua-org/Gen-V1/issues/2287) | STR01 must freeze exact schema/writer/reader/decoder/test paths in accepted R2 and update this task before implementation. |
| [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288) | apps/web/src/streaming-markdown-state.ts; apps/web/src/App.tsx; tests/streaming-markdown-state.test.ts; tests/e2e/task-interface-fixture.ts; tests/e2e/runtime-presentation.spec.ts |
| [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289) | apps/web/src/Markdown.tsx; apps/web/src/app-panels.tsx; apps/web/src/App.tsx; tests/e2e/markdown.spec.ts |
| [STR06 #2290](https://github.com/skytuhua-org/Gen-V1/issues/2290) | apps/web/src/SentenceReveal.tsx; tests/e2e/micro-motion.spec.ts |
| [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291) | docs/review-evidence/parallel-renderers/streaming-browser.md; tests/e2e/markdown.spec.ts |
| [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | docs/review-evidence/parallel-renderers/streaming-windows.md |

Existing work and ownership inspected during planning:

| Existing issue / PR | Inspected head | Current scope and release evidence |
| --- | --- | --- |
| [#1530](https://github.com/skytuhua-org/Gen-V1/issues/1530) / [PR #1549](https://github.com/skytuhua-org/Gen-V1/pull/1549) | 796097030fa3c4dfeed65291c602d1268ef2e23d | OPEN_UNMERGED; devin-a-cloud-f1a91d unreleased; no takeover [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1530#issuecomment-7082885847) |
| [#1583](https://github.com/skytuhua-org/Gen-V1/issues/1583) / [PR #1632](https://github.com/skytuhua-org/Gen-V1/pull/1632) | ff9e1093ddba30bd20e2040d6b581856df082a59 | OPEN_UNMERGED; implementation/review RELEASED; Windows gate NOT_RUN [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1583#issuecomment-7069498493) |
| [#1969](https://github.com/skytuhua-org/Gen-V1/issues/1969) / [PR #2062](https://github.com/skytuhua-org/Gen-V1/pull/2062) | 9c11de3b8e112188adac228a551d83eac8459912 | OPEN_UNMERGED; released; queue comment is not merge proof [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1969#issuecomment-7129888162) |
| [#1655](https://github.com/skytuhua-org/Gen-V1/issues/1655) / [PR #1697](https://github.com/skytuhua-org/Gen-V1/pull/1697) | 6938a6625a6729a0603d40b99428384f38027a33 | OPEN_UNMERGED; released; preserve whole-run Contents eligibility [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1655#issuecomment-7130783370) |
| [#1811](https://github.com/skytuhua-org/Gen-V1/issues/1811) | dd9cf46b52ecc79b579a0a282948444ed6f7deaa | W3 RELEASED; integrated acceptance unmet;1811 is an issue [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7104926319) |
| [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212) / [PR #2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) | d03d7155e0dc93b790dad014becccfee4eedc1c0 | DOCS_OPEN_UNMERGED; original publication released [Journal](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7170181714) |
| [#1960](https://github.com/skytuhua-org/Gen-V1/issues/1960) / [PR #2030](https://github.com/skytuhua-org/Gen-V1/pull/2030) | 30b71cece9959c02c71fdca13ddae14c960d0de8 | OPEN_UNMERGED; RELEASED; SSE buffering only, not phase truth [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1960#issuecomment-7130798617) |

## DESIGN

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

Unanticipated interface/schema changes return to the exact discovery owner for a reviewed full-plan revision. Required schema, writers, readers and decoders land atomically in one compatible PR. Rollback is per leaf and preserves other accepted children; no sweeping source resets or replacement of existing PRs.

## EXECUTION_DAG

The table contains functional dependencies and initial planning readiness. READY means the bounded task may be claimed after normal current-journal checks. It is not permission to bypass an existing owner, failed prerequisite or native release gate. The full executable T01... steps, tests and handoff are in each linked child.

| Task | Bounded deliverable | Kind | Required task outputs | Start state |
| --- | --- | --- | --- | --- |
| [STR01 #2285](https://github.com/skytuhua-org/Gen-V1/issues/2285) | Resolve the authoritative browser and native message-phase contract | discovery | None | READY: The current native invalidation/snapshot path lacks established per-message phase truth; this is a bounded contract-or-DEFER decision. |
| [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286) | Implement the bounded remend paragraph projection | implementation | None | READY: Pure opt-in adapter research can proceed independently of native authority; adoption cannot. |
| [STR03 #2287](https://github.com/skytuhua-org/Gen-V1/issues/2287) | Implement the reviewed message-phase authority atomically | implementation | [STR01 #2285](https://github.com/skytuhua-org/Gen-V1/issues/2285) | BLOCKED: No accepted exact native authority contract exists. STR01 must publish/review complete R2 or this task remains blocked. |
| [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288) | Project accepted phase into each workspace instance | implementation | [STR01 #2285](https://github.com/skytuhua-org/Gen-V1/issues/2285), [STR03 #2287](https://github.com/skytuhua-org/Gen-V1/issues/2287) | BLOCKED: Consumes only the fully reviewed/valid R2 authority, never an invented host field. |
| [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289) | Bind streaming repair only to the terminal assistant paragraph | implementation | [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288), [STR06 #2290](https://github.com/skytuhua-org/Gen-V1/issues/2290), [SRC01 #2277](https://github.com/skytuhua-org/Gen-V1/issues/2277) | BLOCKED: Needs audited projection, valid browser/native authority, same-text reveal handling and shared source guards. |
| [STR06 #2290](https://github.com/skytuhua-org/Gen-V1/issues/2290) | Settle SentenceReveal after same-text presentation revisions | implementation | None | READY: Independent bounded reveal bookkeeping API; tested with synthetic same-text child replacement before streaming adoption. |
| [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291) | Compare streaming semantics and browser update cost | verification | [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289) | BLOCKED: Needs the frozen integrated candidate, authority contract and matching unmodified control. |
| [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Verify native streaming parity and publish adoption disposition | verification | [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291) | BLOCKED: Requires frozen browser candidate plus real supported Windows invalidation transport and screen-reader access. |

Parent coordination tasks:

1. T01, verify allocation: refresh all complete child bodies, current candidate heads and latest owner releases. Output one accepted input/version record per claimed leaf. Positive: exact SHA and scope; negative: no silent-owner takeover. Done when the first leaf can ACK its inputs.
2. T02, coordinate independent work: assign only ready leaf keys and exact paths. Keep functional dependencies separate from hunk reservations. Publish each bounded output and its focused checks. Done when ready receivers can consume concrete artifacts.
3. T03, review coverage and integration: use the map below to review every original requirement against actual evidence, including existing completed work. A document/fixture/mock does not prove native behavior. Done when every row has PASS, a permitted reasoned non-adoption disposition, or an explicit blocker.
4. T04, final handoff: publish full status, immutable artifacts, current CI/review/main state, remaining gates and RELEASE OWNER=NONE. Close this parent only after the original accepted closure conditions are met and closure is authorized. Otherwise leave open with the exact remaining owner/input.

## VALIDATION

Requirement-to-task coverage:

| Prior requirement, design, task or acceptance | Current child allocation | Preservation note |
| --- | --- | --- |
| T01 | [STR01 #2285](https://github.com/skytuhua-org/Gen-V1/issues/2285), [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| T02 | [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| T03 | [STR03 #2287](https://github.com/skytuhua-org/Gen-V1/issues/2287), [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| T04 | [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [STR06 #2290](https://github.com/skytuhua-org/Gen-V1/issues/2290), [SRC01 #2277](https://github.com/skytuhua-org/Gen-V1/issues/2277) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| T05 | [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291), [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| T06 | [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R01 | [STR01 #2285](https://github.com/skytuhua-org/Gen-V1/issues/2285), [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R02 | [STR01 #2285](https://github.com/skytuhua-org/Gen-V1/issues/2285), [STR03 #2287](https://github.com/skytuhua-org/Gen-V1/issues/2287), [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R03 | [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R04 | [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R05 | [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R06 | [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R07 | [SRC01 #2277](https://github.com/skytuhua-org/Gen-V1/issues/2277), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [STR06 #2290](https://github.com/skytuhua-org/Gen-V1/issues/2290), [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R08 | [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [STR06 #2290](https://github.com/skytuhua-org/Gen-V1/issues/2290), [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291), [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R09 | [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288), [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R10 | [STR01 #2285](https://github.com/skytuhua-org/Gen-V1/issues/2285), [STR03 #2287](https://github.com/skytuhua-org/Gen-V1/issues/2287), [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288), [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R11 | [STR01 #2285](https://github.com/skytuhua-org/Gen-V1/issues/2285), [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [STR06 #2290](https://github.com/skytuhua-org/Gen-V1/issues/2290), [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| R12 | [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291), [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A01 | [STR01 #2285](https://github.com/skytuhua-org/Gen-V1/issues/2285), [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A02 | [STR01 #2285](https://github.com/skytuhua-org/Gen-V1/issues/2285), [STR03 #2287](https://github.com/skytuhua-org/Gen-V1/issues/2287), [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A03 | [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291), [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A04 | [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A05 | [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A06 | [SRC01 #2277](https://github.com/skytuhua-org/Gen-V1/issues/2277), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [STR06 #2290](https://github.com/skytuhua-org/Gen-V1/issues/2290), [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A07 | [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [STR06 #2290](https://github.com/skytuhua-org/Gen-V1/issues/2290), [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291), [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A08 | [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288), [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A09 | [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A10 | [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A11 | [STR01 #2285](https://github.com/skytuhua-org/Gen-V1/issues/2285), [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| A12 | [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| DESIGN projection/flags/whitespace/cap | [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| DESIGN native authority/R2/DEFER | [STR01 #2285](https://github.com/skytuhua-org/Gen-V1/issues/2285), [STR03 #2287](https://github.com/skytuhua-org/Gen-V1/issues/2287), [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288), [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| DESIGN shared source/reveal same-text | [SRC01 #2277](https://github.com/skytuhua-org/Gen-V1/issues/2277), [STR06 #2290](https://github.com/skytuhua-org/Gen-V1/issues/2290), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| VALIDATION 20 adapter decisions | [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| VALIDATION 12 phase groups | [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288), [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| VALIDATION 10 mounted groups | [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| VALIDATION cost/captures/real Windows/AT | [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291), [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |
| STATE/REFERENCES alternatives/rollback/notices | [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) | Original requirement retained; relevant contract and acceptance are in the named complete leaf plans. No product success inferred. |

Publication checks: A01 (R01/T03), every prior substantive row mapped and full prior body retained byte-for-byte; A02 (R02/T01-T02), every child has all nine mandatory plan sections, executable steps and meaningful positive/negative checks; A03 (R03-R04/T01-T02), DAG has no cycles or missing tasks, native GitHub parent/child link completion is verified against this table and any unavailable relationship mutation is explicitly reported in the publication journal, and only exact hunk reservations serialize integration; A04 (R05/T03), product-specific safety/native/motion/evidence gates remain explicit and unexecuted checks are not reported as passing; A05 (R06/T04), final source/body/continuation readback matches exact UTF-8 bytes and published claims are released.

Run git diff --check and node scripts/check-doc-links.mjs for the documentation publication. Product unit/integration/browser/Windows/assistive and capture commands are in the full child/prior plans and run only during their authorized execution. No application tests or footage are executed by this planning revision.

Recordings retain the user's existing requirements: synthetic comparable scenarios, 1920x1080, 30fps, H.264, real interaction speed, no added titles, labels or simulated cursor overlays. Record source SHAs, actual environment/settings, hashes, limitations and verdict outside the footage. Browser zoom and fixtures do not prove native DPI or packaged behavior.

## STATE

Allocation and detailed plans are prepared for publication; immutable body/file verification and native links are recorded in the latest publisher journal. Future leaf execution remains unclaimed unless a current explicit child scope says otherwise. Existing implementation evidence listed above remains valid only for its recorded SHA and acceptance rows.

Next: start with a READY child after full current-journal/input readback; claim that leaf's narrow scope, publish milestones and release before pausing. On each milestone or at most 20 minutes of active work, checkpoint the canonical parent with child key, source SHA, exact checks, gaps and next action. Coordinator consolidates cross-parent handoffs on #2212. No worker receives an exclusive parent-wide implementation assignment.

## REFERENCES

- [Program and full coordination journal](https://github.com/skytuhua-org/Gen-V1/issues/2212)
- [Current parent and complete history](https://github.com/skytuhua-org/Gen-V1/issues/2228)
- [Verified planning base and repository instructions](https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17)
- [Original documentation publication #2215](https://github.com/skytuhua-org/Gen-V1/pull/2215)
- [Continuity documentation publication #2221](https://github.com/skytuhua-org/Gen-V1/pull/2221)
- [Renderer documentation publication #2231](https://github.com/skytuhua-org/Gen-V1/pull/2231)

## Previous accepted canonical body, retained in full

This archive is the complete issue body read before this subdivision. Its product requirements, exclusions, evidence, examples and prior revision history remain binding. Its previous execution grouping is replaced by the child allocation above. Historical status is a snapshot, not a claim that a current PR is merged or that acceptance passed.

<!-- BEGIN PRIOR CANONICAL BODY -->
## Publication record

**Revision:** `AI-STREAMING-MARKDOWN-R1`  
**Complete Markdown:** [ai-streaming-markdown-adoption.md](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-streaming-markdown-adoption.md)  
**SHA-256:** `4cd951a15cdbf85aa0a0c7dcc9ff78451e49543b50bf964762b6101b103f1b22`  
**Documentation PR:** [#2231](https://github.com/skytuhua-org/Gen-V1/pull/2231)

The identical committed UTF-8 file is the attachment fallback. The complete canonical plan is reproduced below. Publication verification and ownership releases are recorded in the issue journal. Product implementation and runtime acceptance remain NOT_STARTED/NOT_RUN.

<!-- BEGIN CANONICAL PLAN -->
# Streaming Markdown repair adoption plan

## META

| Field | Value |
| --- | --- |
| Feature / repository | Bounded streaming Markdown repair trial, `skytuhua-org/Gen-V1` |
| Revision / date | `AI-STREAMING-MARKDOWN-R1`, 2026-11-25 |
| Baseline | Verified `main@96ca4c3bd0664fca53775fbe31915c209641986c` |
| Parent / child | [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212); [#2228](https://github.com/skytuhua-org/Gen-V1/issues/2228) |
| Documentation | `docs/ai-harness-library-plans`; coordinator owns source registration, commit/PR, full issue body and readback |
| Status / provenance | NOT_STARTED. Primary docs, immutable source/tests and Gen source reviewed; coordinator exercised public playground. No product edits, installs, local tests or benchmarks. |

**Goal/architecture:** improve supported provisional prose using a guarded remend 1.5.1 leaf while retaining Gen's parser and canonical content. React 19.2.3/TypeScript remain; no Tailwind, AI SDK, Shiki or animation dependency. This complete specification defines an adopt/defer/reject assessment, not an approved renderer migration.

## OBJECTIVE

Current `Markdown.tsx` recognizes completed two-asterisk bold and single-backtick inline code. Their partial forms remain literal until a closer arrives. Open fenced code already renders; this issue does not solve that again.

The public playground showed a bounded potential benefit: terminal `An **unfinished emphasis` displayed markers in Static mode and hid them in Streaming mode. This observation did not establish a semantic `strong` element, local performance or Gen-V1 behavior. An unfinished paragraph before later content remained literal. Upstream source likewise scopes repair to the current inline block and avoids closing emphasis after its opener's line ends.

A material prerequisite is missing: browser events distinguish delta from final, but the current snapshot projection discards that distinction. Native `onWorkspaceChanged` delivers invalidations and full snapshots instead of invoking the renderer's event consumer. Animation, arrival, matching `runId` and running-thread status do not prove an individual message is provisional.

Success requires actual strong/code semantics on the two useful partial-tail cases, equivalent browser/Windows behavior, exact copy/source content and acceptable measured cost. If truthful native status requires broad changes, or safe adaptation requires another parser, record `DEFER`/`REJECT` and retain current rendering. Browser-only improvement does not pass adoption.

## REQUIREMENTS

| ID | Required behavior |
| --- | --- |
| R01 | Compare baseline/candidate using identical synthetic chunks in the actual app. Adopt only with semantic improvement on unfinished two-asterisk bold and single-backtick code and no failed negative controls. |
| R02 | Repair only a verified provisional assistant message for the accepted thread/run/message/epoch and revision. Final, stop/error, reconnect, unknown state, stale events and owner changes cannot retain speculative formatting. Never infer phase from animation, arrival, timeout, text growth or `runId` alone. |
| R03 | Preserve original `Message.content`, persistence, exports, Copy message, Copy code, source descriptors/canonical viewer and UTF-16 offsets. Restore exact trailing whitespace before accepting repair; upstream unconditionally trims one trailing space even with handlers disabled. |
| R04 | Parse canonical blocks first. Only the final ordinary paragraph can heal; headings, lists, tables, fences, earlier paragraphs, user/activity/history/static artifact/Files/canonical views retain the original path. No grammar expansion. |
| R05 | Pin and verify the selected package/artifact/license. Enable only bold and eligible inline code; explicitly disable all other handlers, including **both** links and images. No custom handlers or internal package imports. |
| R06 | Preserve 24-column/200-row/4096-total-derived-cell table limits, full fallback text, numeric alignment, list bounds, original code extraction and stable keys. No second highlighter, images/raw HTML, export controls or nested vertical scroll containers. |
| R07 | Preserve focus and pointer/keyboard selection. Same-text presentation changes invalidate source/reveal bookkeeping. Exact source mapping continues failing closed with canonical access; no synthetic offset mapping or substring shortcut. |
| R08 | No new animation, delay, loading indicator, character splitting, tab stop or live announcement. `SentenceReveal` and existing full/reduced/off/system policy remain authoritative. Every mode has identical formatting correctness. |
| R09 | Bound work before repair; no idle loop, per-message subscription or history cache. Measure app update cost and production bundle/startup delta. Oversize/unsupported input retains all original content. |
| R10 | Browser and desktop must consume equivalent authoritative semantics. A minimal new descriptive metadata seam requires a complete contract/writer/readers/test amendment before implementation. No second renderer SSE connection, generic event exposure, transport rewrite or persisted phase guess. |
| R11 | One integrator owns shared Markdown/App/source-wrapper/fixture/package/lockfile/manifest hunks. Preserve existing feature owners and separate math/diagram scope. Publish adopt/defer/reject evidence and rollback. |
| R12 | Durable full plan, source pins, real results, baseline/candidate captures, native/accessibility evidence, review state and RELEASE. Planning and upstream tests are not product acceptance. |

**Proposed trial decisions:** main conversation and `CanvasThread` assistant prose only; each embedded/native instance resolves its own state. A **32,768 UTF-16-unit paragraph cap**, checked before remend, is a proposed Gen budget, not an upstream fact or a content-display limit. Larger text stays literal. Reuse the existing block classifier; do not arbitrarily slice text and lose delimiter context.

Certify only a supported closer inserted immediately before the exact original whitespace suffix: one/two asterisks completing two-asterisk bold, or one backtick completing single-backtick code. Reject deletion, replacement, new escapes, mixed closers, added lines, unsupported nesting or unrecognized edits. For a paragraph containing any run of two or more backticks, disable inline-code repair while allowing the guarded bold trial. This intentionally conservative rule avoids importing upstream's N-backtick grammar. Rejection silently preserves original text. Expanding these rules requires a full amendment and evidence; do not implement a second Markdown parser to rescue the package.

**Excluded:** math/Mermaid, highlighting, citations/tool cards, parser-wide CommonMark/GFM parity, images/raw HTML, AI SDK conversion, composer/global motion changes, source storage and runtime scheduling. Only the precisely approved descriptive status seam may cross a contract boundary.

**Review focus:** unchanged-text final events; native refresh without phase; markers inside code/tables; selection across a render-mode change; stale owner/sequence after navigation. Each is tested below.

## REPO_MAP

Verified baseline or coordinated inspection; proposed additions are labelled. Retrieve omitted tracked files if checkout is sparse.

| Existing path | Integration fact |
| --- | --- |
| `apps/web/src/Markdown.tsx` | Completed bold/single-tick code and HTTP(S)/fragment links; canonical classifier/bounded tables/open fences. Final ordinary paragraph calls inline. Props text/animate/initialReveal; no streaming. |
| `apps/web/src/app-panels.tsx` | AssistantProse derives animation from active/arrival; custom memo comparator needs any new presentation prop. |
| `apps/web/src/App.tsx` | ConversationWorkspace owns snapshot/apply/refresh/subscription; older snapshots rejected. Main uses AssistantProse, CanvasThread direct Markdown. Instances have separate owners. |
| `apps/web/src/snapshot-events.ts`, `api.ts` | Delta/final upsert identically. Desktop onWorkspaceChanged invalidates/refetches without accept(event); browser EventSource supplies events. |
| `packages/contracts/index.ts`; host/desktop writers | Message lacks completion. Exact reducer/serialization/bridge paths and any new field are T01 discovery, not existing APIs. |
| `apps/web/src/SourceWorkbench.tsx`, `SourceSelectionActions.tsx` | Canonical SourceMessage, exact authored DOM/unique UTF-16/visibility checks. Current effect text/enabled misses same-text visual revisions. |
| `apps/web/src/SentenceReveal.tsx` | Non-textual masks, code/table exclusion, conservative selection restoration; same-text representation needs bookkeeping invalidation. |
| `apps/web/src/CopyButton.tsx`, `markdown.css`, `motion-policy.ts`, `conversation-scroll.ts` | Retain copy, layout, policy and existing scroll writer. |
| `tests/e2e/markdown.spec.ts`, `micro-motion.spec.ts` and micro-motion config | Existing real renderer semantics, budgets, hostile-input, selection/motion checks; config selects both. |
| `tests/e2e/task-interface-fixture.ts` | Synthetic EventSource; host.publish emits settings invalidation, not assistant delta. |
| `tests/e2e/runtime-presentation.spec.ts` and config | Native stub lacks onWorkspaceChanged and falls through to EventSource; add true invalidation-only coverage. |
| `tests/source-selection-dom-v3.test.ts`, `source-selection-v3.test.ts`, `conversation-scroll.test.ts` | Existing source/scroll regressions. |
| Root package/lockfile/notices; `scripts/public-source-files.json` | One integrator for dependencies and source/test registration; runtime entries only as packaging requires. Coordinator registers plan source. |

**Proposed:** `apps/web/src/streaming-markdown.ts`; `tests/streaming-markdown.test.ts`; `tests/streaming-markdown-state.test.ts`. Browser cases extend existing specs or proposed streaming-markdown.spec.ts/config; T01 fixes exact paths/commands.

**Protected owners:** [#1530](https://github.com/skytuhua-org/Gen-V1/issues/1530)/[#1549](https://github.com/skytuhua-org/Gen-V1/pull/1549) Lezer, explicitly no Shiki; [#1583](https://github.com/skytuhua-org/Gen-V1/issues/1583)/[#1632](https://github.com/skytuhua-org/Gen-V1/pull/1632) opt-in Files policy with unchanged default chat; [#2218](https://github.com/skytuhua-org/Gen-V1/issues/2218) reading anchor; [#1655](https://github.com/skytuhua-org/Gen-V1/issues/1655) Contents whole-run eligibility. Do not replace its eligibility with message phase. Refresh full plans/claims/heads and separate math/diagram integration.

**Source selection:** remend 1.5.1 at `4e86b0403b685e5eda142314bb2048a4646219db` has no declared runtime dependencies and selectable/current-block repair. Upstream CommonMark-oracle tests were inspected, not executed; registry tarball/integrity remains unverified. Trial that leaf. Streamdown 2.8.1 at the same pin has optional plugins and stable-prefix/tail reuse, but core adds marked/unified/remark/rehype/raw HTML/class utilities/controls. Default images/data images and 400/300 code/table max-heights conflict with Gen's boundaries. References/footnotes/rewrites/custom handlers can force larger reparses; no universal O(delta) or measured speedup. Export budgets are not render budgets.

Original AI Elements source `ca8be600bfd01b3131f9bf6134b51602a71f4374` advertises end-November deprecation. MessageResponse imports four plugins; ToolOutput drops falsy 0/false. No wrapper selected; shadcn successor is reference only. Both inspected repos are Apache-2.0; preserve exact notices. CLI 1.9.1 does not version private components 0.0.0.

## DESIGN

### Pure projection

Proposed, absent on baseline:

```ts
interface StreamingMarkdownProjection { text: string; changed: boolean }
function projectStreamingParagraph(
  canonicalParagraph: string,
  provisional: boolean,
): StreamingMarkdownProjection;
```

False/unknown phase, cap failure, unsupported edit, no change or library exception returns original text/changed=false. No DOM/storage/network/source actions. Every update starts from canonical input, never previous healed output. Frozen options:

```ts
{
  bold: true, inlineCode: true,
  italic: false, boldItalic: false, strikethrough: false,
  links: false, images: false,
  katex: false, inlineKatex: false,
  htmlTags: false, comparisonOperators: false,
  setextHeadings: false, singleTilde: false,
}
```

Use a stable inlineCode=false variant for the multi-backtick exclusion. Upstream bold means exactly two asterisks; underscore forms use italic. The shared link/image handler runs if either flag is enabled. No sentinel URLs.

Canonical blocks are classified first. An eligible paragraph must be the final nonempty block and still own the current trailing inline block; a later block or completed blank-line boundary ends eligibility. Carry that original-source boundary into the call instead of stripping it and accidentally repairing an earlier paragraph. Only this paragraph calls the function; other branches, Copy code extraction and keys remain unchanged. Restore exact original whitespace suffix and certify the specified closer-only edit. Existing inline renders React text/semantics, never HTML. Final/stop/error returns literal malformed content. Upstream property tests permit some tail rewrites, so they do not establish this stricter contract.

### Phase and native gate

Proposed `Markdown.streaming?:boolean=false`; AssistantProse gets a separate streaming prop included in memo equality. Animate/active/arrival never supply phase.

Browser trial may hold one transient map per ConversationWorkspace keyed by verified thread/run/message/epoch. Publish it with accepted snapshot state, after sequence/owner checks. Delta enables exactly its message; final clears it despite identical content. Duplicate/older/activity/wrong-owner input cannot enable repair. Full snapshot/reconnect/terminal/owner change clears uncertainty unless approved metadata supplies current truth. No completion timer.

T01 must trace current host reducer, schema, snapshot serialization and native bridge, then choose:

1. Bounded authoritative seam: record exact fields, identity/revision, producer, readers and default/replay/recovery/ordering. If metadata is new, publish full R2 **before implementation**, naming every changed schema/writer/reader/test; land them together. Use existing authorized snapshots, without changing text, permissions or transport.
2. Missing truth/broad scope: DEFER with prerequisite/owner. Isolated comparison can finish, but no browser-only ship, extra native SSE, text-growth/run heuristic or unused product dependency.

No Message.streaming field is claimed to exist. Reuse a verified current equivalent. Main/CanvasThread receive state explicitly; each embedded/native instance owns its state. Hidden/inert/held/inactive suppress repair; re-entry needs current authority or static fallback. No per-message subscriptions.

### Selection, reveal and integration

Keep keys/siblings. Repair never focuses, scrolls, selects or announces. Copy message remains canonical; fences never heal.

Reuse the **single math-owned T04 source-selection seam**: one bounded authored-root MutationObserver, local presentationEpoch advancing existing revision, and synchronous read/action revalidation. `data-source-selection-ui` marks Gen copy/source controls and duplicate raw disclosures excluded from authored text. `data-source-transformed="true"` on rendered math/diagram forces refusal; do not add it to ordinary repaired prose solely to bypass existing checks. Remend DOM changes use the same observer. No competing SourceMessage revision prop/observer. Preserve exact equality, unique UTF-16 mapping, visibility and canonical fallback; same-text changes clear stale candidates/late UI settlement.

Proposed SentenceReveal-only prop `renderRevision?:string` defaults to an empty string; Markdown passes `provisional` or `static` from verified streaming state. Include it in the layout-effect dependencies. On a revision change with identical canonical `text`, retire old masks, re-evaluate the existing conservative selection mapping and update the remembered DOM text, then return without scheduling a reveal. When canonical text also changes, retain the existing reveal policy. Do not add this prop to SourceMessage or compete with the shared source observer. `data-markdown-math` is the math owner's mask exclusion only. Pointer/focus/keyboard input retains existing cancellation. Preserve unchanged selected phrases; an intersecting edit cannot invent a different selection or source capture.

### Cost and rollback

Check 32,768-unit paragraph cap before invoking repair. No idle timer, worker, history cache, full-transcript walk or extra request. Measure package graph, compressed bundle/startup delta and app updates.

Proposed same-machine budget: candidate p95 per-update scripting/render no more than baseline + 2 ms, no new adapter-attributable task over 50 ms. Record cold/warm distributions, heap trend and noise; repeat noisy runs. These are trial gates, not measured results. Review concrete startup/bundle cost against benefit; static/oversize has zero repair calls.

Fallback is literal source without toast/delay. Rollback removes this opt-in and unused dependency/notice; preserve approved metadata shared by other features. No persisted content migration.

Full Streamdown comparison requires a specific recorded useful failure of the narrow path. Retain every R03-R10 boundary, sanitization with custom plugin arrays, Gen render budgets/controls, and no Shiki/images/raw HTML. Root memo ignores some config/security props, so fixed config/mode changes need tests. A general renderer migration requires a separate amended decision, never automatic escalation.

## EXECUTION_DAG

`T01 -> (T02 || T03) -> T04 -> T05 -> T06`. T03 waits for the exact accepted metadata contract; T02 can remain isolated. One shared integrator; reviews may run in parallel.

### T01: Source, ownership and native contract

**Inputs:** full plan/journals, current main, adjacent PRs/upstream pins. **Own:** discovery/amendment/fixture allocation. **Output:** exact seams/commands or DEFER.

- [ ] Refresh protected owners/heads and math/diagram; claim/read back exact hunks and shared integrator.
- [ ] Verify remend 1.5.1 tarball/version/integrity/license/dependency graph. Mismatch blocks adoption; no silent version change.
- [ ] Reproduce supported partial tails and final malformed forms in actual App; record semantic DOM, copy/source and baseline SHA.
- [ ] Trace `rg -n 'assistant.delta|assistant.message|onWorkspaceChanged' apps packages tests`, retrieving sparse omissions. Inspect reducer/schema/snapshot/bridge and final/stop/error/replay/epoch cases. Publish native decision; a new seam requires complete R2 fields/writer/readers/tests before T03.
- [ ] Fix exact test/config paths and shared source/reveal invalidation contract. Provide typed assistant event publisher and true invalidation-only native stub, not settings publish or the old fallback stub.

**Tests/done:** positive two baseline tails; negative static/fence/history; native fixture proves event gap. Done with durable artifact/ownership/transport decision. **Handoff:** fixtures to T02, complete accepted contract to T03; a missing seam explicitly blocks integration.

### T02: Bounded adapter

**Depends:** T01 source/fixtures. **Own:** proposed streaming-markdown.ts/test and dependency/notices through integrator. **Interface:** canonical paragraph + provisional -> projection.

- [ ] Add 20 planned cases; run identity baseline and record positive failures.
- [ ] Implement explicit options, cap, whitespace restoration and closer certification using public exports. No new parser/input mutation/cache.
- [ ] Run pure cases and semantic checks through actual inline rendering. Excluded blocks never call adapter; inspect cost/call counts and useful rejected inputs.

**Tests/done:** provisional strong/single-code semantics improve; static/unsupported/whitespace remain original. Done with all 20 decisions passing or reproducible REJECT. Excess adapter complexity is a stop condition. **Handoff:** tested function/options/bounds/package to T04; no app/native acceptance claim.

### T03: Authoritative state

**Depends:** T01 accepted metadata contract/R2 when needed. **Own:** only approved schema/producer/reader/state seam and tests, no parser/CSS/scroll. **Output:** current provisional boolean/revision; absent=static.

- [ ] Add 12 state cases plus exact host/desktop contract tests from T01, especially unchanged-text final.
- [ ] Implement existing-authority transitions, atomic browser snapshot/event acceptance and equivalent native truth; include all contract readers/writers together.
- [ ] Test uncertainty/inactive/owner/epoch/sequence cleanup and zero extra socket/event exposure/heuristic. Preserve text, sources, permissions and scheduling.

**Tests/done:** exact delta enables, final clears, native invalidation resolves same phase; stale/duplicate/wrong owner cannot revive. Done only after both transports/defaults pass. **Handoff:** tested API/paths to integrator; otherwise T04 blocked.

### T04: Surface and continuity integration

**Depends:** T02+T03 and shared allocation. **Own:** narrow Markdown/AssistantProse/App/CanvasThread wiring, agreed shared source/reveal integration, mounted tests. **Output:** frozen candidate.

- [ ] Add streaming=false default, include it in Markdown block useMemo dependencies and AssistantProse memo equality, and wire eligible assistants only. Same-text finalization must recompute blocks. Heal the terminal paragraph after canonical classification, preserving keys/code/table/link/HTML behavior.
- [ ] Reuse single source invalidation owner and same-text SentenceReveal signal; no duplicate observer, forged offsets or lost canonical access.
- [ ] Add 10 mounted groups below with actual pointer/keyboard/copy/finalization/owner actions; run existing Markdown/motion/source/scroll regressions. Preserve #2218 writer and #1655 eligibility.

**Tests/done:** actual main/CanvasThread benefit and exact source; static/held/foreign views unchanged, no stale fallback/mask. Done with passing mounted checks and shared-hunk review. **Handoff:** frozen SHA/remaining gates to T05.

### T05: Comparison and native verification

**Depends:** T04. **Own:** tests/evidence; failures return to code owners. **Inputs:** fixed baseline/candidate/machine/synthetic cadence. **Output:** acceptance evidence.

- [ ] Run commands; record actual counts, environment, artifact identity and failures/skips.
- [ ] Replay 20 updates/s: small, 8 Ki-unit, 32,768-unit/cap+1, 100 retained messages and adversarial markers. Measure cold/warm update distributions, calls, heap and production bundle; static has zero calls. No measurement hooks in product code.
- [ ] Verify real Windows invalidation transport plus browser: final unchanged text, stop/error/reconnect, native owner/window changes, held panes and copy. Old native stub cannot substitute.
- [ ] Capture matched 1920x1080 before/after, equal chunk cadence/policy, light/dark and full/reduced/off; narrow pane, actual app zoom 100/125/150%, System OS reduction. Use synthetic data and repository capture route, no private data/in-footage overlays.
- [ ] Check semantic accessibility, real selection/focus and supported Windows screen-reader smoke.

**Tests/done:** semantic benefit within cost on supported transports; zero traffic/mutation/focus-scroll takeover/hidden work. Every criterion gets evidence or named failure. **Handoff:** immutable results and decision recommendation to T06.

### T06: Decision and release

**Depends:** T05, or explicit T01/T02 stop. **Own:** review/handoff/scoped cleanup.

- [ ] ADOPT only with all gates; otherwise DEFER with prerequisite/owner or REJECT with fixture/cost. Remove unused trial dependency and retain product baseline.
- [ ] Audit mapping/full revisions; register approved source/test paths once, run docs/manifest gates. Coordinator owns plan registration.
- [ ] Open focused implementation PR if adopted; include evidence/cost/rollback and existing review route. Publish/read back full checkpoint/immutable artifacts and RELEASE OWNER=NONE; clear only own markers.

**Done:** retrievable complete decision/remaining gates, with review/merge/main verification distinct. Assessment may finish without shipping; no closure on planning or fixture-only proof.

## VALIDATION

Counts/outcomes are **planned, not run**. Use `docs/getting-started.md`, Node >=24.10.0, pnpm 10.30.3, lockfile and required Chromium/native dependencies. All fixtures are synthetic, without live model/account requests.

**20 adapter cases:** (1) provisional bold; (2) its character prefixes; (3) partial bold closer; (4) provisional single-backtick code; (5) its prefixes; (6) completed unchanged paragraph; (7) malformed but static; (8) single trailing space; (9) double-space/newline/CRLF suffix; (10) underscores/snake case; (11) italic/triple markers/nesting; (12) multiple backticks; (13) escape/trailing backslash; (14) incomplete link; (15) incomplete image; (16) HTML/comparison/setext-like text; (17) currency/math markers; (18) emoji/combining/ZWJ; (19) cap and cap+1; (20) delimiter-heavy/rejected mutation/thrown-library fallback. Real block tests separately exclude tables/lists/headings/fences.

**12 state cases:** current delta; final changed text; final unchanged text; duplicate sequence; older sequence; wrong message/thread/run; activity; stop/error/terminal; owner epoch switch; reconnect/unknown snapshot; hidden/inert/held owner; native invalidation with authoritative metadata. Parameterization can expand counts; record actual runner totals later.

**10 mounted groups:** main live/final semantics; CanvasThread/embedded isolation; original copy actions; pointer/keyboard selection across append/final; source fallback/no forged capture; static/history/user/artifact/Files exclusion; table/fence/list/heading/hostile regression; policy/theme/zoom/narrow layout; real event/native invalidation parity; performance/long transcript/detached reading. A custom component mount alone cannot pass an App transport scenario.

Verified existing scoped commands and explicitly proposed unit names:

```sh
pnpm install --frozen-lockfile
pnpm build:widgets
pnpm exec vitest run tests/streaming-markdown.test.ts tests/streaming-markdown-state.test.ts --maxWorkers=1
pnpm exec vitest run tests/source-selection-dom-v3.test.ts tests/source-selection-v3.test.ts tests/conversation-scroll.test.ts --maxWorkers=1
pnpm typecheck
pnpm build
pnpm exec playwright test --config tests/e2e/micro-motion.playwright.config.ts markdown.spec.ts micro-motion.spec.ts
pnpm exec playwright test --config tests/e2e/runtime-presentation.playwright.config.ts
pnpm exec playwright test --config tests/e2e/conversation-scroll.playwright.config.ts
pnpm exec playwright test --config tests/e2e/workbench.playwright.config.ts
pnpm exec playwright test --config tests/e2e/workbench-app.playwright.config.ts
pnpm check:docs-links
node --import tsx -e "import('./scripts/public-source.ts')"
pnpm exec vitest run tests/public-source.test.ts --maxWorkers=1
```

Frozen install establishes baseline. After artifact verification, update the exact dependency/lockfile through the normal package workflow, never fabricated integrity. T01 records the command for any new browser config. Any new host/desktop seam requires exact test commands in R2. The old runtime-presentation native stub is insufficient. Extend actual `workbench.spec.ts`/`workbench-app.spec.ts` fixtures for source-presentation invalidation; the dom-v3 unit file tests the pure mapper, not browser DOM.

| Check | Requirements / tasks | Observable pass |
| --- | --- | --- |
| A01 | R01,R04 / T01,T02,T04,T05 | Same-fixture semantic strong/code improvement in actual App; final malformed content literal. Public-demo appearance is insufficient. |
| A02 | R02,R10 / T01,T03,T04,T05 | Verified phase on browser/Windows; unchanged-text final, stale/duplicate/wrong owner, terminal/reconnect cases never leave repair. |
| A03 | R03 / T02,T04,T05 | Exact stored/exported/source/copy strings and whitespace; no healed text in commands/offsets. |
| A04 | R04,R05 / T02,T04 | Explicit flags and edit certification; excluded contexts original, links/images jointly disabled, N-backtick boundary retained. |
| A05 | R06 / T04,T05 | Table budgets/full fallback, code/list/link/HTML regressions pass; zero new traffic/image/HTML/highlighter path. |
| A06 | R07 / T04,T05 | Same-text projection invalidates shared source/reveal state; canonical fallback, unchanged selection and focus survive real input. |
| A07 | R08 / T04,T05 | Full/reduced/off/System have identical semantics, no added motion/status/delay/tab stop or stale mask. |
| A08 | R09 / T02,T05 | Preflight cap, zero static/oversize calls, no idle/hidden work; p95 budget and reviewed bundle/startup cost. |
| A09 | R07,R09,R11 / T04,T05 | Existing scroll/heading contracts, drafts and mounted siblings survive, with no new writer or remount-based repair. |
| A10 | R05,R11 / T01,T02,T06 | Exact artifact/license/notices, agreed owners, no blanket Streamdown/AI SDK/Tailwind/Shiki addition. |
| A11 | R10,R12 / T01,T05,T06 | Native gate resolved and amended before extension; actual Windows/accessibility evidence with honest pending/failure states. |
| A12 | R11,R12 / T06 | Durable decision, full body/source parity, immutable evidence, normal CI/review, ACK state and RELEASE. |

Adoption requires A01-A11 passing plus A12 complete. Unavailable native evidence blocks adoption, not a silent browser-only scope change. Defer/reject can finish research. Captions separate synthetic/browser/packaged/native/accessibility evidence; browser zoom does not prove physical DPI.

## STATE

Researched: parser/transport gaps, upstream subsets/current source versions, incompatible defaults and canonical boundaries. Decided: narrow candidate plus explicit native gate, conservative literal fallback and a measured decision. Product T01-T06 and acceptance A01-A12 remain NOT_STARTED/NOT_RUN. No package installation, local suite, benchmark or Gen before/after footage is claimed. Documentation checks are recorded separately.

Coordinator `codex-cloud-bluma-bd935d` owns publication; drafter `codex-cloud-bluma-bd935d-tooltip-0580` completed Y04-MD under [accepted claim](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7169486545). Latest accepted releases/ACKs in the parent journal control current ownership. Current docs branch is `docs/ai-harness-library-plans`; immutable source, PR and readback are recorded in #2228's publication header/journal. No implementation hunk is reserved by this drafting claim.

Unknowns/blockers: native per-message authority, registry artifact integrity, adapter compatibility and actual cost. Registry endpoint browsing failed; source version does not prove installed artifact identity. Next: claim T01, refresh sources/owners, verify artifact, reproduce baseline and publish exact native contract or DEFER. Do not implement from library screenshots or this title alone.

## REFERENCES

- [Baseline tree](https://github.com/skytuhua-org/Gen-V1/tree/96ca4c3bd0664fca53775fbe31915c209641986c), [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/CONTRIBUTING.md), [DESIGN](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/DESIGN.md). All REPO_MAP paths refer to this baseline.
- [Markdown](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/Markdown.tsx), [AssistantProse](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/app-panels.tsx), [App](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/App.tsx), [event projection](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/snapshot-events.ts), [native/browser subscription](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/api.ts).
- [Source selection](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/SourceSelectionActions.tsx), [SentenceReveal](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/SentenceReveal.tsx), [task fixture](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/tests/e2e/task-interface-fixture.ts).
- [remend package](https://github.com/vercel/streamdown/blob/4e86b0403b685e5eda142314bb2048a4646219db/packages/remend/package.json), [API/options](https://github.com/vercel/streamdown/blob/4e86b0403b685e5eda142314bb2048a4646219db/packages/remend/src/index.ts), [emphasis flags](https://github.com/vercel/streamdown/blob/4e86b0403b685e5eda142314bb2048a4646219db/packages/remend/src/emphasis-handlers.ts), [inline-code grammar](https://github.com/vercel/streamdown/blob/4e86b0403b685e5eda142314bb2048a4646219db/packages/remend/src/inline-code-handler.ts), [shared link/image handler](https://github.com/vercel/streamdown/blob/4e86b0403b685e5eda142314bb2048a4646219db/packages/remend/src/link-image-handler.ts).
- [Upstream property tests](https://github.com/vercel/streamdown/blob/4e86b0403b685e5eda142314bb2048a4646219db/packages/remend/__tests__/streaming-properties.test.ts), [changes](https://github.com/vercel/streamdown/blob/4e86b0403b685e5eda142314bb2048a4646219db/packages/remend/CHANGELOG.md), [Apache license](https://github.com/vercel/streamdown/blob/4e86b0403b685e5eda142314bb2048a4646219db/LICENSE).
- [Streamdown package](https://github.com/vercel/streamdown/blob/4e86b0403b685e5eda142314bb2048a4646219db/packages/streamdown/package.json), [renderer/defaults/memoization](https://github.com/vercel/streamdown/blob/4e86b0403b685e5eda142314bb2048a4646219db/packages/streamdown/index.tsx), [tail repair](https://github.com/vercel/streamdown/blob/4e86b0403b685e5eda142314bb2048a4646219db/packages/streamdown/lib/stream-repair.ts), [block reuse](https://github.com/vercel/streamdown/blob/4e86b0403b685e5eda142314bb2048a4646219db/packages/streamdown/lib/parse-blocks.tsx), [security](https://streamdown.ai/docs/security), [playground](https://streamdown.ai/playground).
- [AI Elements deprecation](https://elements.ai-sdk.dev/docs), [shadcn successor](https://ui.shadcn.com/docs/ai-elements), [original immutable source](https://github.com/vercel/ai-elements/tree/ca8be600bfd01b3131f9bf6134b51602a71f4374), [MessageResponse](https://github.com/vercel/ai-elements/blob/ca8be600bfd01b3131f9bf6134b51602a71f4374/packages/elements/src/message.tsx), [ToolOutput](https://github.com/vercel/ai-elements/blob/ca8be600bfd01b3131f9bf6134b51602a71f4374/packages/elements/src/tool.tsx), [Apache license](https://github.com/vercel/ai-elements/blob/ca8be600bfd01b3131f9bf6134b51602a71f4374/LICENSE).
<!-- END CANONICAL PLAN -->

<!-- END PRIOR CANONICAL BODY -->
