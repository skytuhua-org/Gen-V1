# Parallel execution for issue #1188

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-PARENT-1188-R1, 2026-11-25. Coordination parent: [#1188](https://github.com/skytuhua-org/Gen-V1/issues/1188). Program and consolidated journal: [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Verified planning base: main@defe9884530145e9c109b8ed98f80efac8beeb17. Previous complete body: 23951 UTF-8 bytes, SHA-256 9417deac96f8a0dec89d62c055d71a202114753e37e9e762092694bbd580cbc5, reproduced unchanged below. The publication header supplies this revision's immutable file and reviewed documentation PR. Product implementation, review, merge and verified-on-main remain separate states.

## OBJECTIVE

Replace a broad single-worker assignment with 8 bounded, separately claimable tasks. Two substantive read-only1203 acceptance packets preserve its unreleased implementation scope. Missing rev2 message/Find work and two actual contract gaps are independent; WorkActivity is gated by authoritative metadata. Final matrix preserves every original row and does not treat discovery as implementation. Success means each worker can complete one explicit outcome from its own full issue, source and input commits, while unrelated workers proceed independently. This parent coordinates coverage and final acceptance; it does not reserve every child or shared file for one agent.

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
| [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249) | tests/e2e/composer-app-refinement.spec.ts; tests/e2e/composer-integration.spec.ts; tests/e2e/composer-motion.spec.ts |
| [CMP02 #2250](https://github.com/skytuhua-org/Gen-V1/issues/2250) | tests/e2e/composer-app-refinement.spec.ts; tests/e2e/shared-motion.spec.ts; tests/e2e/composer-integration.spec.ts |
| [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251) | apps/web/src/App.tsx (message action markup/arrival bookkeeping only); apps/web/src/styles.css (message action selectors only); tests/e2e/composer-integration.spec.ts; tests/e2e/composer-motion.spec.ts |
| [CMP04 #2252](https://github.com/skytuhua-org/Gen-V1/issues/2252) | apps/web/src/ConversationFind.tsx; apps/web/src/conversation-find.css; tests/e2e/conversation-find.spec.ts; tests/conversation-find.test.ts |
| [CMP05 #2253](https://github.com/skytuhua-org/Gen-V1/issues/2253) | docs/agent-plans/parallel-interaction-composer-saved-draft-contract.md |
| [CMP06 #2254](https://github.com/skytuhua-org/Gen-V1/issues/2254) | docs/agent-plans/parallel-interaction-composer-feed-contract.md |
| [CMP07 #2255](https://github.com/skytuhua-org/Gen-V1/issues/2255) | apps/web/src/WorkActivity.tsx; apps/web/src/styles.css (activity-arrival selectors); apps/web/src/App.tsx (exact verified WorkActivity prop seam only); tests/e2e/composer-integration.spec.ts |
| [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | tests/e2e/composer-app-refinement.spec.ts; tests/e2e/composer-integration.spec.ts; tests/e2e/composer-motion.spec.ts |

Existing work and ownership inspected during planning:

| Existing issue / PR | Inspected head | Current scope and release evidence |
| --- | --- | --- |
| [#1188](https://github.com/skytuhua-org/Gen-V1/issues/1188) / [PR #1203](https://github.com/skytuhua-org/Gen-V1/pull/1203) | c7428df080bef4d520c067a59aca28847d0dbb97 | OPEN_UNMERGED; devin-a-cloud-f4e3b6 unreleased; B1/D5/D6/D10 implemented with historical browser evidence, D7/rev2 incomplete [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1188#issuecomment-7058630319) |
| [#1302](https://github.com/skytuhua-org/Gen-V1/issues/1302) / [PR #1420](https://github.com/skytuhua-org/Gen-V1/pull/1420) | cd8ea7d55d4d4b89f88675f4d5e888686754371a | OPEN_UNMERGED; chip interruption/origin overlap retained [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1302#issuecomment-7091717379) |
| [#2214](https://github.com/skytuhua-org/Gen-V1/issues/2214) / [PR #2220](https://github.com/skytuhua-org/Gen-V1/pull/2220) | 595555e6ee93bd17279f4ce3320cbf3d0787ac1a | OPEN_UNMERGED timing implementation; author RELEASED; CI run45656913614 success; full/native/main gates remain [Journal](https://github.com/skytuhua-org/Gen-V1/issues/2214#issuecomment-7169585895) |
| [#1976](https://github.com/skytuhua-org/Gen-V1/issues/1976) / [PR #2007](https://github.com/skytuhua-org/Gen-V1/pull/2007) | d5eb5f7f01a66f7eb1bdfa4f60f2d90c7363a44e | MERGED command Enter passthrough retained |

## DESIGN

Claim a single child key and its exact paths on this parent, link that claim from the child, and include the canonical program journal when coordinating across parents. Read the entire assigned child, its immutable source and comments, plus the current parent allocation and relevant ownership journals first. Each child embeds its executable contract; the full retained historical parent remains available for provenance, acceptance audit and conflict recovery. A coordinator assigned the parent reads that full parent scope. The child consumes only the dependency output SHA and interface named in its plan. A receiver ACKs that artifact before work; it does not need ownership of the upstream feature.

Pure helpers and their tests can be drafted in parallel. Integration workers reserve only the named shared hunk, refresh current main and owner journals, integrate one bounded commit, publish focused verification and release the reservation. Do not reserve a file for the life of an epic. Current owner ACK is required for overlapping unpublished product work. A failed or rejected optional renderer may release an unchanged baseline slot so other independent renderer work continues.

| Shared files or seam | Participants | Integration rule |
| --- | --- | --- |
| apps/web/src/App.tsx | [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP07 #2255](https://github.com/skytuhua-org/Gen-V1/issues/2255) | 1203 retains production claim. CMP03 message action markup/bookkeeping and CMP07 WorkActivity prop seam need acknowledged finite hunks; verify leaves CMP01/02 do not edit App. Adjacent retained scope: retained PR1203; transcript continuity. |
| apps/web/src/styles.css | [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP07 #2255](https://github.com/skytuhua-org/Gen-V1/issues/2255), [CTL04 #2242](https://github.com/skytuhua-org/Gen-V1/issues/2242) | Message-action,activity-arrival,original item/press verification hunks differ; no global owner. Existing candidate corrections remain original implementation owners. Adjacent retained scope: 1203 banner,1204 check/status. |
| tests/e2e/composer-app-refinement.spec.ts, tests/e2e/composer-integration.spec.ts, tests/e2e/composer-motion.spec.ts | [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249), [CMP02 #2250](https://github.com/skytuhua-org/Gen-V1/issues/2250), [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP07 #2255](https://github.com/skytuhua-org/Gen-V1/issues/2255), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Separate named describe blocks; imports and final commits serialize. No false conceptual dependency between review cases. |
| apps/web/src/App.tsx, apps/web/src/ConversationFind.tsx, tests/e2e/conversation-find.spec.ts | [ANC02 #2263](https://github.com/skytuhua-org/Gen-V1/issues/2263), [ANC04 #2265](https://github.com/skytuhua-org/Gen-V1/issues/2265), [ANC05 #2266](https://github.com/skytuhua-org/Gen-V1/issues/2266), [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP04 #2252](https://github.com/skytuhua-org/Gen-V1/issues/2252), [CMP07 #2255](https://github.com/skytuhua-org/Gen-V1/issues/2255), [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), [MTH05 #2282](https://github.com/skytuhua-org/Gen-V1/issues/2282), [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298) | ANC02 reserves only temporary actual-main baseline reproduction cases, releases before code integration; ANC04 owns active main-wrapper/controller-options/validated navigation hooks; ANC05 owns history-action/precommit focus bookkeeping. Other participants reserve only actual composer or renderer caller/state hunks. Serialize common imports/test setup briefly; preserve #1188/#1581/#1473/#1969 accepted owners. No indefinite App ownership. |

Unanticipated interface/schema changes return to the exact discovery owner for a reviewed full-plan revision. Required schema, writers, readers and decoders land atomically in one compatible PR. Rollback is per leaf and preserves other accepted children; no sweeping source resets or replacement of existing PRs.

## EXECUTION_DAG

The table contains functional dependencies and initial planning readiness. READY means the bounded task may be claimed after normal current-journal checks. It is not permission to bypass an existing owner, failed prerequisite or native release gate. The full executable T01... steps, tests and handoff are in each linked child.

| Task | Bounded deliverable | Kind | Required task outputs | Start state |
| --- | --- | --- | --- | --- |
| [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249) | Verify composer identity through attachment exits and Send/Stop swaps | verification | None | READY: Independent read-only acceptance of retained PR1203; production corrections require its current owner. |
| [CMP02 #2250](https://github.com/skytuhua-org/Gen-V1/issues/2250) | Verify banner stacking and scroll-indicator interruption in the retained PR | verification | None | READY: Read-only chrome acceptance can run alongside CMP01; no takeover of App or candidate CSS. |
| [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251) | Reveal fresh message actions without replaying restored conversation content | implementation | None | BLOCKED: Needs narrow App/test hunk acknowledgment from retained1203 owner; independent of other composer outcomes. |
| [CMP04 #2252](https://github.com/skytuhua-org/Gen-V1/issues/2252) | Animate ConversationFind presence while preserving scope and focus | implementation | None | READY: Independent two-file Find presentation outcome; no wait for unrelated1203 motion. |
| [CMP05 #2253](https://github.com/skytuhua-org/Gen-V1/issues/2253) | Resolve the saved-draft deletion and undo contract without inventing persistence | discovery | None | READY: Bounded missing-contract investigation; original M5 stays blocked until an approved executable contract exists. |
| [CMP06 #2254](https://github.com/skytuhua-org/Gen-V1/issues/2254) | Resolve per-owner feed arrival identity for the remaining M6 surfaces | discovery | None | READY: Bounded source/owner proof is required before a feed can animate genuine arrivals. |
| [CMP07 #2255](https://github.com/skytuhua-org/Gen-V1/issues/2255) | Animate only proven fresh WorkActivity items within their presentation owner | implementation | [CMP06 #2254](https://github.com/skytuhua-org/Gen-V1/issues/2254) | BLOCKED: Consumes CMP06 authoritative arrival/owner contract; unsupported feed paths remain blocked/static. |
| [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Accept every composer row with integrated controls and native evidence | verification | [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249), [CMP02 #2250](https://github.com/skytuhua-org/Gen-V1/issues/2250), [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP04 #2252](https://github.com/skytuhua-org/Gen-V1/issues/2252), [CMP05 #2253](https://github.com/skytuhua-org/Gen-V1/issues/2253), [CMP06 #2254](https://github.com/skytuhua-org/Gen-V1/issues/2254), [CMP07 #2255](https://github.com/skytuhua-org/Gen-V1/issues/2255), [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | BLOCKED: Consumes all per-row ledgers and CTL05's accepted integrated composer-command A1-A4/D7 evidence. |

Parent coordination tasks:

1. T01, verify allocation: refresh all complete child bodies, current candidate heads and latest owner releases. Output one accepted input/version record per claimed leaf. Positive: exact SHA and scope; negative: no silent-owner takeover. Done when the first leaf can ACK its inputs.
2. T02, coordinate independent work: assign only ready leaf keys and exact paths. Keep functional dependencies separate from hunk reservations. Publish each bounded output and its focused checks. Done when ready receivers can consume concrete artifacts.
3. T03, review coverage and integration: use the map below to review every original requirement against actual evidence, including existing completed work. A document/fixture/mock does not prove native behavior. Done when every row has PASS, a permitted reasoned non-adoption disposition, or an explicit blocker.
4. T04, final handoff: publish full status, immutable artifacts, current CI/review/main state, remaining gates and RELEASE OWNER=NONE. Close this parent only after the original accepted closure conditions are met and closure is authorized. Otherwise leave open with the exact remaining owner/input.

## VALIDATION

Requirement-to-task coverage:

| Prior requirement, design, task or acceptance | Current child allocation | Preservation note |
| --- | --- | --- |
| R01; T01; A01 | [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249), [CMP02 #2250](https://github.com/skytuhua-org/Gen-V1/issues/2250), [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP04 #2252](https://github.com/skytuhua-org/Gen-V1/issues/2252), [CMP05 #2253](https://github.com/skytuhua-org/Gen-V1/issues/2253), [CMP06 #2254](https://github.com/skytuhua-org/Gen-V1/issues/2254), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Retain unreleased devin-a-cloud-f4e3b6/PR1203 ownership. Product edits require exact source-hunk ACK; coordinate PR1420/PR1199 and timing. Record every row as main, PR, missing or contract-gated. |
| R02; A02 | [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Attachment row retains 220/180ms grid 0fr/1fr plus opacity. Cover first/last, excerpt/project-only, re-add and restore, with the same row/textarea and no residual gap. |
| R03; A03 | [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Persistent Send/Stop keeps current label, action and disabled state. Only its icon uses 80ms and .9 scale in Full, opacity in Reduced. Commands remain immediate. |
| R04 | [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249), [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP04 #2252](https://github.com/skytuhua-org/Gen-V1/issues/2252), [CMP05 #2253](https://github.com/skytuhua-org/Gen-V1/issues/2253), [CMP06 #2254](https://github.com/skytuhua-org/Gen-V1/issues/2254), [CMP07 #2255](https://github.com/skytuhua-org/Gen-V1/issues/2255), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Preserve IME, caret, draft, retry, voice, prediction, references and owner acknowledgement. No moving textarea, fabricated upload percentages/completion, or delayed Stop. |
| R05; original row distinction | [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249), [CMP02 #2250](https://github.com/skytuhua-org/Gen-V1/issues/2250), [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP04 #2252](https://github.com/skytuhua-org/Gen-V1/issues/2252), [CMP05 #2253](https://github.com/skytuhua-org/Gen-V1/issues/2253), [CMP06 #2254](https://github.com/skytuhua-org/Gen-V1/issues/2254), [CMP07 #2255](https://github.com/skytuhua-org/Gen-V1/issues/2255), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | The full B/D/S/M matrix distinguishes main, PR, missing and API-gated behavior. Restore and ordinary snapshots remain quiet. |
| R06; A04 timing | [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249), [CMP02 #2250](https://github.com/skytuhua-org/Gen-V1/issues/2250), [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP04 #2252](https://github.com/skytuhua-org/Gen-V1/issues/2252), [CMP07 #2255](https://github.com/skytuhua-org/Gen-V1/issues/2255), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Use actual .75/1/1.25 preferences. Consume effective tokens once and scale raw bases once. Cover live System/Reduced/Off, OS reduction and panels-disabled. Retain #2214/PR2220; no duplicate helper fix. |
| R07; A04 input/accessibility | [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249), [CMP02 #2250](https://github.com/skytuhua-org/Gen-V1/issues/2250), [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP04 #2252](https://github.com/skytuhua-org/Gen-V1/issues/2252), [CMP05 #2253](https://github.com/skytuhua-org/Gen-V1/issues/2253), [CMP07 #2255](https://github.com/skytuhua-org/Gen-V1/issues/2255), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Preserve focus, names, single announcements, read-only labels, inert outgoing content, retry and cancel. Reduced uses <=80ms opacity without travel/stagger; Off settles immediately. |
| R08; A08; T04 | [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Paired synthetic 1920x1080/30fps/H.264 without added titles or overlays, timing JSON/manifests, actual zoom, dark/light, narrow and keyboard checks. Keep CI/review, Windows, main and release distinct. |
| T02; original T04 attachment/button work | [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249) | Read-only adoption review of retained PR1203 and focused regression evidence. Corrections remain with the original owner unless explicitly allocated. |
| T03; original T07 chrome work | [CMP02 #2250](https://github.com/skytuhua-org/Gen-V1/issues/2250), [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP04 #2252](https://github.com/skytuhua-org/Gen-V1/issues/2252), [CMP05 #2253](https://github.com/skytuhua-org/Gen-V1/issues/2253), [CMP06 #2254](https://github.com/skytuhua-org/Gen-V1/issues/2254), [CMP07 #2255](https://github.com/skytuhua-org/Gen-V1/issues/2255), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Review retained PR1203 banner/scroll work and execute missing rev2 leaves. App writers reserve distinct hunks. |
| B1; A05 banner | [CMP02 #2250](https://github.com/skytuhua-org/Gen-V1/issues/2250), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Banners retain 180ms insert, 140ms remove and 160ms stack movement. Exercise two simultaneous errors, repeat, dismiss, retry and interruption; one alert, inert outgoing content. |
| D1 | [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Fresh message body uses 180ms only for a genuine data-arrival cause; restored history stays quiet. |
| D2 | [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Hover actions retain 120ms opacity; keyboard focus is immediate. Preserve names, copy and selection. |
| D3,D4 | [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Chip insert is 180ms with 30ms stagger capped at 150ms; remove is 140ms. Preserve identity/read-only authority. Reduced fades without travel/stagger. |
| D5,D6 | [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Retain PR1203 row/same-button implementation and remount repair. Verify first/last, re-add/excerpt, IME, command and policy cases. |
| D7 | [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256), [CTL05 #2243](https://github.com/skytuhua-org/Gen-V1/issues/2243) | The concrete final dependency is accepted integrated #1186 composer-command A1-A4 evidence: above-caret placement, bottom origin, reference insertion without send, and merged PR2007 no-selection Enter behavior. |
| D8,D9,D11 | [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Prediction remains 120ms; SentenceReveal affects only new prose for 120ms and stays quiet on restore. Pending tail is 900ms alternate and static in Reduced. Never transform code, source or terminal output. |
| D10 | [CMP02 #2250](https://github.com/skytuhua-org/Gen-V1/issues/2250), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Scroll indicator retains 160/120ms opacity and 4px travel, hidden pointer exclusion, deferred exit visibility and cleanup. Held thumb geometry stays immediate. |
| S4 | [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Fresh body is 180ms; action cluster is 180ms with 30ms delay only for proven fresh arrival. Reduced fades without delay. Require an exact arrival cause; mounting alone never triggers replay. |
| M1,M2; A06 Find | [CMP04 #2252](https://github.com/skytuhua-org/Gen-V1/issues/2252), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Find grid uses 180/140ms; match color uses 120ms with no spatial motion. Preserve scope/ranges, reading position, focus and IME. Measure actual CSS Highlight transition support; unsupported M2 stays BLOCKED, never silently waived. |
| M5; A06 draft; A07 undo | [CMP05 #2253](https://github.com/skytuhua-org/Gen-V1/issues/2253), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Retain 140ms deletion and real 180ms undo. Current deletion closes the list before confirmation and no deletion-undo API exists. Discovery must yield an approved exact UI/API contract or explicit BLOCKED disposition and recipient. No local resurrection or text-restore-as-undo. Do not invent implementation before its contract; parent remains blocked. |
| M6; A07 feed | [CMP06 #2254](https://github.com/skytuhua-org/Gen-V1/issues/2254), [CMP07 #2255](https://github.com/skytuhua-org/Gen-V1/issues/2255), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Distinguish WorkActivity Message IDs from TaskHistory children and UpdateControl updater state. Prove browser/native arrival, owner and restore semantics. CMP07 implements only the proven subset. Unsupported generic item contracts remain BLOCKED without fabricated progress or dropped scope. |
| M11; A07 terminal | [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249), [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Terminal/TerminalExcerpt output never animates, including while its surrounding attachment row moves. |
| A05 complete B1/D1-D11 | [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249), [CMP02 #2250](https://github.com/skytuhua-org/Gen-V1/issues/2250), [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Provide separate evidence for every B1/D1-D11 row, including D7 after canonical controls integration. |
| A06 complete Find/saved drafts | [CMP04 #2252](https://github.com/skytuhua-org/Gen-V1/issues/2252), [CMP05 #2253](https://github.com/skytuhua-org/Gen-V1/issues/2253), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Preserve CAS, text-only restore and current authority. Missing deletion undo remains explicitly blocked. |
| A07 complete rev2 | [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP04 #2252](https://github.com/skytuhua-org/Gen-V1/issues/2252), [CMP05 #2253](https://github.com/skytuhua-org/Gen-V1/issues/2253), [CMP06 #2254](https://github.com/skytuhua-org/Gen-V1/issues/2254), [CMP07 #2255](https://github.com/skytuhua-org/Gen-V1/issues/2255), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | S4/M1/M2/M5/M6/M11 each has accepted evidence or an exact blocked gate. A partial review cannot close the full feature. |
| Reference mappings and original global rules | [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249), [CMP03 #2251](https://github.com/skytuhua-org/Gen-V1/issues/2251), [CMP04 #2252](https://github.com/skytuhua-org/Gen-V1/issues/2252), [CMP05 #2253](https://github.com/skytuhua-org/Gen-V1/issues/2253), [CMP06 #2254](https://github.com/skytuhua-org/Gen-V1/issues/2254), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Retain chat chrome, truthful FileDrop resource grants, real-contract Undo, Search scope and AgentRun without inferred steps. No Bluma source or new dependency. Preserve 150ms pending threshold, easing, compositor/limited row-and-Find layout, and no artificial wait, permanent will-change or per-frame measurement. |
| Original retained PR verification/history/rollback | [CMP01 #2249](https://github.com/skytuhua-org/Gen-V1/issues/2249), [CMP02 #2250](https://github.com/skytuhua-org/Gen-V1/issues/2250), [CMP08 #2256](https://github.com/skytuhua-org/Gen-V1/issues/2256) | Historical PR1203 B1/D5/D6/D10 passes remain distinct from fresh acceptance. Preserve remount fix c7428df. Require focused rollback, normal review, authorized merge and main checks. |

Publication checks: A01 (R01/T03), every prior substantive row mapped and full prior body retained byte-for-byte; A02 (R02/T01-T02), every child has all nine mandatory plan sections, executable steps and meaningful positive/negative checks; A03 (R03-R04/T01-T02), DAG has no cycles or missing tasks, native GitHub parent/child link completion is verified against this table and any unavailable relationship mutation is explicitly reported in the publication journal, and only exact hunk reservations serialize integration; A04 (R05/T03), product-specific safety/native/motion/evidence gates remain explicit and unexecuted checks are not reported as passing; A05 (R06/T04), final source/body/continuation readback matches exact UTF-8 bytes and published claims are released.

Run git diff --check and node scripts/check-doc-links.mjs for the documentation publication. Product unit/integration/browser/Windows/assistive and capture commands are in the full child/prior plans and run only during their authorized execution. No application tests or footage are executed by this planning revision.

Recordings retain the user's existing requirements: synthetic comparable scenarios, 1920x1080, 30fps, H.264, real interaction speed, no added titles, labels or simulated cursor overlays. Record source SHAs, actual environment/settings, hashes, limitations and verdict outside the footage. Browser zoom and fixtures do not prove native DPI or packaged behavior.

## STATE

Allocation and detailed plans are prepared for publication; immutable body/file verification and native links are recorded in the latest publisher journal. Future leaf execution remains unclaimed unless a current explicit child scope says otherwise. Existing implementation evidence listed above remains valid only for its recorded SHA and acceptance rows.

Next: start with a READY child after full current-journal/input readback; claim that leaf's narrow scope, publish milestones and release before pausing. On each milestone or at most 20 minutes of active work, checkpoint the canonical parent with child key, source SHA, exact checks, gaps and next action. Coordinator consolidates cross-parent handoffs on #2212. No worker receives an exclusive parent-wide implementation assignment.

## REFERENCES

- [Program and full coordination journal](https://github.com/skytuhua-org/Gen-V1/issues/2212)
- [Current parent and complete history](https://github.com/skytuhua-org/Gen-V1/issues/1188)
- [Verified planning base and repository instructions](https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17)
- [Original documentation publication #2215](https://github.com/skytuhua-org/Gen-V1/pull/2215)
- [Continuity documentation publication #2221](https://github.com/skytuhua-org/Gen-V1/pull/2221)
- [Renderer documentation publication #2231](https://github.com/skytuhua-org/Gen-V1/pull/2231)

## Previous accepted canonical body, retained in full

This archive is the complete issue body read before this subdivision. Its product requirements, exclusions, evidence, examples and prior revision history remain binding. Its previous execution grouping is replaced by the child allocation above. Historical status is a snapshot, not a claim that a current PR is merged or that acceptance passed.

<!-- BEGIN PRIOR CANONICAL BODY -->
## Publication record

**Revision:** `BLUMA-COMPOSER-R1`  
**Complete Markdown:** [bluma-composer-supplement.md](https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-composer-supplement.md)  
**Documentation PR:** [#2215](https://github.com/skytuhua-org/Gen-V1/pull/2215)  
**Program and verification journal:** [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7167211508)

**Change record:** T01-T04 add reference and validation detail; preserve all original B1/D1-D11/rev-2 rows, #1203 and retained owner. No fabricated upload progress, agent steps or deletion Undo.

This publication changes planning documents only. Product implementation and its acceptance remain pending. Existing implementation claims and PRs are preserved. The canonical plan below is reproduced completely and matches the committed Markdown; any earlier issue body is retained verbatim within that source.

<!-- BEGIN CANONICAL PLAN -->
# Bluma composer supplement to #1188

## META

| Field | Value |
| --- | --- |
| Repository / revision | `skytuhua-org/Gen-V1` / `BLUMA-COMPOSER-R1`, 2026-11-25 |
| Canonical issue / parents | [#1188][issue]; original [#1182][motion-parent]; adoption coordination [#2212][program] |
| Verified baseline | `main@96ca4c3bd0664fca53775fbe31915c209641986c` |
| Existing PR | [#1203][pr], open/unmerged; inspected head `c7428df080bef4d520c067a59aca28847d0dbb97` |
| Planning branch / implementation | `docs/bluma-component-adoption-plans` / supplement `NOT_STARTED`, runtime tests `NOT_RUN` |
| Provenance | Entire original body/journal, PR patch, pinned source/tests and repository rules; reference URLs from #2212 research |

Retain the complete original body after this supplement. Scope/PR/ownership remain; explicit timing/API clarifications govern conflicts. IDs use `BLUMA-COMPOSER-R1/T01` namespace, preserving original T04/T07.

## OBJECTIVE

Integrate #1203 with stable editing and truthful feedback. Success: original rows individually accepted, IME/drafts/focus retained, commands immediate and paired 1920x1080 clips. Keep incomplete rev-2 rows visible.

## REQUIREMENTS

| ID | Contract |
| --- | --- |
| R01 | Reuse #1188/#1203. Source edits need `devin-a-cloud-f4e3b6` release/reassignment or acknowledged split; coordinate #1420/#1199 overlaps. |
| R02 | Row base 220/180ms, grid 0fr/1fr+opacity, no delay. First/last/excerpt/re-add/restore preserve textarea/control identity without residual gap. |
| R03 | Same Send/Stop button; icon 80ms opacity/scale .9, Reduced opacity only. Current label/action/disabled state and dispatch never await motion. |
| R04 | Preserve IME/caret/draft/retry/voice/prediction/references and owner isolation/acknowledgment. No flying textarea, fake upload percentage/completion or delayed Stop. |
| R05 | Retain original rows and main/PR/missing/API-gated distinction. Restore/snapshots never replay entrances. |
| R06 | Effective tokens already include speed; consume as-is. Scale raw bases once. Test actual .75/1/1.25 preferences and live System/Reduced/Off/OS/panels-disabled changes. |
| R07 | Preserve keyboard/focus/names, single announcements, read-only labels, hidden inertness, retry/cancel. Reduced no travel/stagger, opacity <=80ms; Off/panels-disabled immediate. |
| R08 | Immutable evidence, normal review/CI, separate main/Windows acceptance. Synthetic data only; no new persistence, permission, runtime or dependency system. |

### Reference mapping

| Reference | Proposed adaptation, using existing owners |
| --- | --- |
| [Chat][chat] | Compact icon/chrome state transitions; retain draft/command authority. |
| [File Drop][filedrop] | Real resource-grant/chip continuity and actual request errors; inspected upload has no percentage API. |
| [Undo][undo] | Reversible feedback only after real deletion-undo contract exists; text restore is not deletion undo. |
| [Search][search] | Find-bar/result feedback with existing scope/match/focus behavior. |
| [Agent Run][agentrun] | Conditional: WorkActivity accepts `Message[]`, no verified step/duration/status API. Never infer progress from message count. |

Proposed mappings only; visual/source/license findings stay in #2212. No Bluma source copied.

### Original scope ledger

All values are base milliseconds; entrance/move easing remains existing `.16,1,.3,1` / `.4,0,.2,1` tokens.

| Rows | Retained behavior / status |
| --- | --- |
| B1 | Banner insert 180/remove 140; stacked existing banners move 160. #1203 implementation needs simultaneous-error/interruption tests. |
| D1/D2/S4 | Fresh message180; hover actions120, keyboard visible. S4 action cluster +30 only for fresh arrivals. Reduced fade/no delay; restored history quiet. S4 separately verified. |
| D3/D4 | Chip insert 180, stagger 30 capped150; remove 140. Reduced fade/no travel/stagger; preserve identity/read-only authority. |
| D5/D6 | Row220/180; icon 80. Integrate #1203 implementation. |
| D7 | Verify A1-A4 after #1186 integration; no duplicate overlay. Above caret, bottom origin. |
| D8/D9/D11 | Prediction fade 120; SentenceReveal chunk 120 for new prose only; retain existing pending tail 900 alternate, static Reduced fallback. |
| D10 | Scroll indicator enter 160/exit 120, opacity + translateY4; hidden pointer events off, deferred exit visibility. Never tween held thumb. |
| M1/M2 | Find-bar grid/opacity180/140; match-color 120 without spatial travel. |
| M5 | Saved-draft delete140/real undo insert 180 retained. No deletion-undo API at baseline: block undo until approved persistence contract; preserve confirmation/text restore. |
| M6 | Newly arriving items180 while mounted only. WorkActivity identifies messages; TaskHistory wraps children/scroll; UpdateControl is desktop updater. No generic feed schema. |
| M11 | Terminal/TerminalExcerpt output unanimated, including during surrounding attachment-row geometry changes. |

Keep delayed loading feedback 150ms. Only measured row/find handoffs animate layout, otherwise opacity/transform. No new waits, `will-change`, frame measurements, redesign, library, acquisition or command/persistence refactor.

## REPO_MAP

Production paths are under `apps/web/src/`. Baseline symbols verified; PR-only helpers marked.

| File / symbol | Verified boundary |
| --- | --- |
| `App.tsx`: `Composer`, `send`, `upload` | IME/draft guards; `message.send`, `resource.upload`, `run.stop`/shared owner. Upload validates 20MB then dispatches, no progress API. |
| `ComposerView.tsx`, `ComposerToolbar.tsx`, `composer-entry.css`, `composer-toolbar.css` | Main row block/Send-Stop branches; PR adds grid row/icon wrappers. |
| `ComposerAttachments.tsx` | Cache/leaving resources/excerpts, project excluded. PR `seenEmpty`/`rowClosing` retains band during exit. |
| PR `App.tsx`: `DeferredUnmount`, `SendStopButton` | PR-only APIs. Test policy/cancel/stale-event cleanup of banner/icon exits. |
| `styles.css`, `chat-scroll-indicator.css`, `ChatScrollIndicator.tsx` | Arrival selectors and indicator geometry/input. Preserve held scrolling. |
| `ConversationFind.tsx`, `conversation-find.ts`, `conversation-find.css` | Scoped ranges/matches/IME/focus; grid motion absent. |
| `SavedDrafts.tsx`, `saved-drafts.ts`, `saved-drafts.css` | `deleteSavedDraft`, `planDraftRestore`, `restoreSavedDraftText`: local CAS/text restore, no delete undo. |
| `WorkActivity.tsx`, `TaskHistory.tsx`, `UpdateControl.tsx`, `TerminalExcerpt.tsx` | Message disclosure (large content delegates WorkbenchActivity), scroll wrapper, updater, excerpt. No shared agent-step contract. |
| `useAppearance.ts`, `task-motion.tsx`, `motion-policy.ts` | Existing preference/policy ownership; shared double-speed correction belongs to #2212 timing prerequisite. |
| Existing test paths in VALIDATION | Composer attachment/IME/draft/commands; find scope/focus; saved-draft CAS/restore/quota/conflict/abort. Extend assertions. |

#1203 changes `scripts/ui-overlay-legacy.json`, adds no browser tests in inspected patch. Preserve legitimate guard updates. [Owner checkpoint][owner-checkpoint] retains scope; [review][rev2-review] notes rev-2 omissions. Prior passes are historical, not retested here.

## DESIGN

Keep state in current owners. Seed seen IDs at mount/restore; only new IDs while mounted animate. Snapshot/thread first render is not arrival.

Attachment: absent -> opening -> open -> chip exit -> row closing -> absent. Retain row through exit; re-add retargets current geometry/clears stale state. Excerpts use same flow. Completion checks target/property/generation, preventing old/child events removing re-added content. Cancel, policy disable, zero duration/unmount settle without waiting for disabled CSS events. Restore settled.

One button renders current action immediately, plus at most one outgoing `aria-hidden`, inert icon. Ignore stale completion. Stop dispatches existing route during held effects; preserve Enter/disabled semantics.

Outgoing copies are inert/accessibility-hidden; move focus before hiding and announce once. Failure retains content/error. Find preserves match/reading position/opener; draft restore remains text-only/CAS, never restores authority.

Follow #2212 `bluma-motion-timing-consistency.md`: effective tokens as-is, raw bases scaled once, overriding old unconditional-division wording. Set real `snapshot.settings.preferences`, publish/await appearance. Reduced row snaps/no travel or stagger/opacity <=80ms; Off/panels-disabled clean exits; System never replays.

T01 records approved M5/M6 API/owner or blocks subrow with contract/recipient. No guessed API, local record resurrection or fake fields. Independent allocated work proceeds; requirements stay visible. No migration; revert focused commits only.

## EXECUTION_DAG

### T01: Reconcile PR, contracts and ownership

**Inputs/prerequisites:** whole issue/journal/revision and current main/PRs; planning only.

**Steps/files:** Refresh heads/claims; secure current owner allocation. Map original rows to main/PR/missing/gated; coordinate #1420/#1199/timing. Inspect M5/M6 APIs, record blocked subrows/owners and revise complete plan.

**Owner/output:** read-only coordinator; acknowledged ledger. **Tests:** verified APIs/no duplicate claim/fix. **Done/handoff:** read-back allocation to T02 worker, otherwise block/release with unblock action.

### T02: Integrate composer lifecycle fixes

**Inputs/prerequisites:** T01, owner-integrated #1203 head, timing contract; shared-helper edits wait for its owner.

**Files/owner:** one worker, `App.tsx`, `ComposerAttachments.tsx`, entry/toolbar CSS and existing composer-app-refinement/integration specs.

**Steps:** Retain PR design, fix demonstrated failures. Test first/last/excerpt/project-only, rapid re-add, upload failure, restore/reload/snapshot. Hold effects; change preferences and exercise IME/selection/focus/draft/commands before finishing. No fake progress or moving textarea.

**Outputs/tests:** A02-A04 evidence; no gap/duplicate/stale completion/lost IME/delayed command. **Done/handoff:** passing commit and remaining row ledger to T03.

### T03: Verify chrome and rev-2 work

**Inputs/prerequisites:** T02; D7 after #1186; approved gated APIs.

**Files/owner:** same writer for App/banner/scroll CSS; separately allocated Find and SavedDrafts presentation; verified M6 item-owner paths. T01 must record exact paths before edits. Reuse existing tests, no overlapping App writer.

**Steps:** Test simultaneous banners/dismiss/retry, indicator/held drag, fresh/restored messages, prediction and terminal quietness. Add M1/M2 wrapper preserving scope/match/focus. M5 only uses approved delete/undo transitions; missing contracts stay blocked. Verify canonical D7, preserve adjacent work.

**Outputs/tests:** A05-A07; no duplicate alert/replay/restored authority/fake step/terminal motion. **Done/handoff:** passing rows and precise blocked prerequisites/owners to T04.

### T04: Capture, review and release

**Inputs/prerequisites:** frozen T02/T03 commits/row ledger.

**Steps:** Run scoped gates; capture identical synthetic before/after flows at 1920x1080/30fps/H.264 without added titles or overlays. Put source/theme/speed labels in an external manifest, never captions inside the video. Complete Windows keyboard/zoom checks, normal PR/CI review and authorized merge; rerun affected checks at exact main SHA. Update complete plan/body; post/read back RELEASE `OWNER=NONE`, clear claimed assignment/in-progress labels.

**Owner/output:** worker PR/evidence; reviewer read-only, maintainer merges. **Tests:** A08, no old/pending/mock acceptance. **Done/handoff:** all rows/main/Windows accepted or `HANDOFF_PENDING` with missing rows/role; no closure with D7/M5/M6 unresolved.

## VALIDATION

Full setup: Node >=24.10, pinned pnpm 10.30.3/Bun, Windows x64; Chromium plus Edge for frontend config on Windows. From repository root:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm build:widgets
pnpm exec vitest run tests/conversation-find.test.ts tests/saved-drafts.test.ts tests/update-control-a11y.test.ts --maxWorkers=1
pnpm lint
pnpm typecheck
pnpm build
pnpm exec playwright test --config tests/e2e/frontend-refinement.playwright.config.ts tests/e2e/composer-app-refinement.spec.ts
pnpm exec playwright test --config tests/e2e/micro-motion.playwright.config.ts tests/e2e/composer-integration.spec.ts tests/e2e/composer-motion.spec.ts tests/e2e/shared-motion.spec.ts
pnpm test:browser --suite composer-press
pnpm test:browser --suite composer-commands
pnpm test:browser --suite composer-prediction
pnpm test:browser --suite conversation-find
pnpm test:browser --suite saved-drafts
```

Run task subsets, listed set at T04. Register new files in source manifest; publication: `pnpm check:docs-links`. Missing checks: `BLOCKED`/`NOT_RUN`.

| Check | Requirements / tasks | Pass condition |
| --- | --- | --- |
| A01 | R01 / T01 | Current acknowledgment, exact file/row allocation, #1203 reuse, dependency SHAs. |
| A02 | R02,R04 / T02 | First/last/excerpt flows settle; project-only absent; same live row on re-add; no gap/duplicate/textarea remount. |
| A03 | R03,R04 / T02 | Same button, current accessible label, max two icons; send/stop commands dispatch during held effect; IME does not submit. |
| A04 | R04,R06,R07 / T02 | Actual .75/1/1.25 timing and live policy matrix; retained draft/caret/focus/selection; no orphan effect/listener/replay. |
| A05 | R05,R07 / T03 | B1/D1-D11 each evidenced, including simultaneous stack, hidden indicator, held drag, keyboard hover actions and D7 dependency. |
| A06 | R04,R05,R07 / T03 | Find scope/match/reading position/focus and draft CAS/text-only restore retained; absent undo blocked, no pretend success. |
| A07 | R05,R07 / T03 | S4/M1/M2/M5/M6/M11 pass or explicitly blocked; no restored feed replay, fabricated state or terminal text motion. |
| A08 | R08 / T04 | Paired clips/logs/row matrix at immutable commits; review/CI/main/Windows distinct; scope released. |

Clips: identical 1920x1080 synthetic fixture/actions: first/last/re-add, IME, Send/Stop/policy change; retain timing JSON. Check dark/light, narrow/short, actual 100/125/150% app zoom, keyboard/screen-reader names/statuses. Browser zoom is not physical DPI; mocks do not verify live provider/package.

**Executed:** inspection only, no application tests/clips. Runtime acceptance pending; prior reports are historical.

## STATE

Plan ready; T01-T04 `NOT_STARTED`, A01-A08 pending. Existing #1203 ownership retained. M5 undo/generic M6 APIs absent; D7 depends on #1186. Earlier B1/D5/D6/D10 reports do not complete rev-2.

Publication/source verification and planning release are recorded in #2212. Receiver acknowledges the whole journal/revision, then T01 before editing; missing-contract rows remain blocked.

## REFERENCES

[issue]: https://github.com/skytuhua-org/Gen-V1/issues/1188
[motion-parent]: https://github.com/skytuhua-org/Gen-V1/issues/1182
[program]: https://github.com/skytuhua-org/Gen-V1/issues/2212
[pr]: https://github.com/skytuhua-org/Gen-V1/pull/1203
[owner-checkpoint]: https://github.com/skytuhua-org/Gen-V1/issues/1188#issuecomment-7058630319
[rev2-review]: https://github.com/skytuhua-org/Gen-V1/issues/1188#issuecomment-7051612974
[chat]: https://bluma.design/c/chat
[filedrop]: https://bluma.design/c/filedrop
[undo]: https://bluma.design/c/undo
[search]: https://bluma.design/c/search
[agentrun]: https://bluma.design/c/agentrun

- [Pinned baseline](https://github.com/skytuhua-org/Gen-V1/tree/96ca4c3bd0664fca53775fbe31915c209641986c): exact REPO_MAP files and complete AGENTS/CONTRIBUTING/DESIGN rules.
- [PR commit](https://github.com/skytuhua-org/Gen-V1/commit/c7428df080bef4d520c067a59aca28847d0dbb97): existing row-remount correction.
- [#1186](https://github.com/skytuhua-org/Gen-V1/issues/1186)/[#1199](https://github.com/skytuhua-org/Gen-V1/pull/1199), [#1302](https://github.com/skytuhua-org/Gen-V1/issues/1302)/[#1420](https://github.com/skytuhua-org/Gen-V1/pull/1420): refresh integration/ownership before changes.


---

## Preserved earlier issue body

The complete earlier body follows verbatim. Its historical source/status statements describe their named snapshots. The dated supplement above changes only its explicit boundaries; other original requirements and linked continuation plans remain.

<!-- BEGIN PRESERVED ISSUE 1188 -->
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
Attachment row height tween, attachment chip insert/remove (exists — verify), send→stop swap, command menu (covered by A1–A4, verify only), prediction text, scroll indicator, typing indicator, `.workspace-error` banner insert/remove/stack. Files: `composer-entry.css`, `composer-toolbar.css`, `ComposerAttachments.tsx`, `chat-scroll-indicator.css`, `styles.css`, `App.tsx`. Execution DAG tasks T04+T07.

## Spec

Already specified and implemented (tokens correct). **Changes:** none, except B1.

| # | Element | Change | RM |
| --- | --- | --- | --- |
| B1 | `.workspace-error` banner(s) | Treat as list inserts: on mount `ui-item-in` (`--ui-motion-insert` 180ms, translateY(4px)+opacity); on dismiss `ui-item-out` (`--ui-motion-remove` 140ms). When a second error stacks, existing banners translate down with `--ui-motion-status` move easing — no overlap pop. | opacity only |

| # | Element | Trigger | Props | Duration | Delay | States | RM |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D1 | Message arrival | `data-arrival=true` | `ui-item-in` | 180ms | 0 | exists | fade |
| D2 | Message hover actions (copy, react) | pointer enter/leave | `opacity` 0→1 (exists `styles.css:375`) | `--ui-motion-hover` (120ms) | 0 | keep; keyboard focus also reveals | none |
| D3 | Attachment chip insert | file added | `ui-item-in` on `.resource-chip` | 180ms | nth×30ms cap 150ms | exists | fade |
| D4 | Attachment chip remove | remove click | `ui-item-out` (exists, `data-leaving`) | 140ms | 0 | exists | fade |
| D5 | Attachment **row** expand/collapse | first chip added / last removed | `grid-template-rows: 0fr→1fr` + `opacity` on a wrapper (row exists only with attachments per DESIGN) | `--ui-motion-panel-enter` 220ms in / `--ui-motion-panel-exit` 180ms out | 0 | **New.** Grid-wrapper, not `height:auto` tween | row snaps, chips fade |
| D6 | Send → Stop state swap | run starts/stops | crossfade: outgoing `opacity`→0 `scale(.9)`, incoming reverse | `--ui-motion-press` (80ms) | 0 | Same-button swap, not a size change; disabled state transitions `opacity`+`color` 120ms | opacity only |
| D7 | Composer command menu | see A1–A4 | — | — | — | opens above caret; origin = bottom edge | — |
| D8 | Prediction/ghost text | new suggestion | `composer-prediction-in` opacity (exists, `styles.css:135-141`) | `--ui-motion-hover` (120ms) | 0 | keep | none (already off) |
| D9 | Sentence reveal (streaming prose) | grapheme batches | existing `SentenceReveal` | per `task-motion` chunk 120ms | — | keep; restored history never re-reveals | shows immediately |
| D10 | Chat scroll indicator ("scroll to bottom") | becomes scrollable-away / reaches bottom | `opacity` + `translateY(4px)` | enter `--ui-motion-status` (160ms), exit `--ui-motion-hover` (120ms) | 0 | `pointer-events:none` while hidden (visibility flip after exit) | opacity only |
| D11 | Typing/queued indicator | pending | existing tail-fallback pulse 900ms alternate (task-motion.css) — keep as-is | — | — | — | static dot |

## Rev-2 additions
- S4 message arrival: message body `ui-item-in` 180ms; hover-action cluster `ui-item-in` at +30ms delay, on `data-arrival` only (restored history never replays). RM: opacity only, no delay.
- M1/M2: ConversationFind bar open/close `grid-template-rows 0fr→1fr` + opacity 180/140ms; match-highlight moves swap `background-color` at `--ui-motion-hover`, no spatial travel.
- M5: SavedDrafts delete plays `ui-item-out` 140ms; undo restores `ui-item-in`.
- M6: TaskHistory/UpdateControl/WorkActivity feed items `ui-item-in` only when arriving while mounted.
- M11: Terminal/TerminalExcerpt output — explicitly NO animation.

<!-- END PRESERVED ISSUE 1188 -->
<!-- END CANONICAL PLAN -->

<!-- END PRIOR CANONICAL BODY -->
