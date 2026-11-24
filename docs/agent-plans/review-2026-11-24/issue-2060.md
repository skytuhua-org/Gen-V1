# M01 authorized paired workload observations and complete cost accounting Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans for future assigned implementation, task by task. This review authorizes plan publication only.

**Goal:** M01 authorized paired workload observations and complete cost accounting.

**Architecture:** Retain current runEvals and baseline fixtures; do not invent a provider, borrow an account, enable product features or repurpose an unrelated held-out score as M01 paired evidence.

**Tech Stack:** Existing TypeScript/Node host, synchronous Store and checked-in Vitest/browser tooling; declared native and live lanes require their own approved environments.

**Spec:** Complete relevant v6 clauses are reproduced in REQUIREMENTS below; the source baseline and prior issue context travel with this document.

## Global Constraints

- Declared Node >=24.10.0 and packageManager pnpm10.30.3. Resolve an installed matching executable; no unauthorized toolchain download.
- Preserve the existing lockfile, source ownership and required checks. Product flags default false and remain host-owned.
- Current review is read-only for the repository. Future edits require their assigned owner; current incomplete native/live lanes remain explicit holds.

## Review Focus

- T01: missing host, model, account or budget must produce no live call.
- T02: absent token or monetary counters must remain null; byte metrics keep byte units.
- T03: readiness, cancellation and source/output custody failures must not become quality evidence.
- T04: failed, timed-out and cancelled attempts must remain in the recorded denominator.
- T05: unmatched arms, missing attempts or unrecorded background costs must prevent an improvement claim.

## META

Repository: https://github.com/skytuhua-org/Gen-V1. Plan revision `pair-acceptance-r2`. Date2026-11-23 America/Los_Angeles (audit UTC2026-11-24). Baseline `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`; no working branch or implementation claim created by this review. Audit parent [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992), T01/T02/T03. Publication: Create a focused acceptance child of [#1031](https://github.com/skytuhua-org/Gen-V1/issues/1031), preserving existing implementation ownership. Status `BLOCKED_LIVE_AUTHORIZATION`. Source provenance: all relevant v6 original C/S/U/T/G clauses, November18 completion follow-ups, and research v3 read; the archive is an acceptance ledger and does not authorize rebuilding merged milestones.

## OBJECTIVE

Existing offline workloads and cancellation/barrier fixtures provide core control observations. They explicitly do not establish provider quality, live latency or monetary costs. The existing eval runner runs its held-out cases1..3 repetitions and otherwise writes a pending manifest; it is not evidence that the original paired M01 long-session/100-and500-tool/oversized-output/memory-conflict/cancel/concurrent-edit/large-history matrix has been run. No exact authorized host/model/account/budget/fixture/arms/comparison protocol is supplied. New focused child of #1031 owns protocol qualification and observations, preserving existing runner owners. Success is actual source-bound paired results with unchanged fixture/settings, full failure denominator and provenance/nulls for every measurement.

## REQUIREMENTS

### Retained original acceptance requirements

The following substantive text is preserved from the supplied v6 archive. It defines acceptance, not permission to repeat its historical implementation sequence. Existing supported code/tests and original owner custody remain in place.

**M01-C01.** ImplementationEvidenceV3: schemaVersion=3, bundleId, baseSha, sourceLockDigest, platform, nodeVersion, packageManagerVersion, phases[], changedFiles[], dependencyContracts[], flags[], remainingGates[], reviewerApproval=false. Each phase stores id, status PASS|FAIL|BLOCKED|NOT_RUN, requiredCases[], commands[] and artifactRefs[]. Bundle status is PASS only when every required phase passes; otherwise FAIL if an observed required case fails, PARTIAL if some phases pass and another is blocked, or BLOCKED if no required phase can run. Release permission is separate and defaults false.

**M01-C02.** CommandEvidence: argv[], cwdIdentity, executableIdentity, startedAt, endedAt, exitCode (integer or null), termination NONE|TIMEOUT|CANCELLED|SPAWN_ERROR, status, boundedLogRef and logDigest. A successful expected-negative fixture is PASS only if its asserted failure was observed. A build that exits nonzero is FAIL, not an expected negative.

**M01-C03.** SourceLockV3: auditAncestorSha, executionBaseSha, inspectedPaths[{path,blobSha}], publicContracts[{name,version,testIds}], acceptedDependencyCommits[] and approvedDrift[]. A file merely named in a prior manifest does not authorize arbitrary subsequent changes.

**M01-S05.** Run the existing eval runner with --out pointing to a new directory. Without both an explicitly authorized --host and --model, label the result MANIFEST_ONLY and all model outcomes NOT_RUN. Never invent a provider, use someone else's account or treat manifest creation as a successful agent task.

**M01-S09.** Add paired benchmark fixtures for long sessions, 100/500-tool catalogs, oversized output, memory conflicts, cancellation, concurrent edits and large UI histories. Record model/account/config, request count, input/output/cache usage where actually measured, elapsed time, cold start, first public response, completion quality and all background costs. Unknown measurements remain null.

**M01-S11.** Adopt OpenHands' expected-failure distinction: a known-bug fixture passes its reproduction check only at the intended assertion with the intended bad value. Setup failure, timeouts and another error are separate failures. Then run the same fixture against the candidate and require the correct assertion to pass.

**M01-U01.** No new product dashboard is required here. Produce an inspectable HTML or JSON benchmark report only as a local development artifact. It must distinguish baseline, candidate, unavailable measurement, failed check and expected-negative reproduction.

**M01-U02.** For paired results show the exact fixture/model/config and total cost including retries, compaction and background work. Display byte budgets as bytes, not mislabeled token counts.

**M01-T04.** Benchmark fixtures: unavailable cache counters remain null; setup failure cannot become a model-quality failure or an expected regression reproduction; fixture seeds reproduce the same control actions.

**M01-G01.** Core infrastructure can pass on the actual development OS. Windows containment, installed-desktop and live-model claims remain explicitly NOT_RUN until tested on their required environments. No performance improvement is claimed from synthetic timings alone.

**M01-G02.** Host-owned flags: No product capability enabled by this bundle. Register only these keys in the shared finite registry; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M01-G03.** Rollback: Remove only the new scripts and registry wiring if necessary. Retain immutable baseline artifacts outside production data. Do not delete existing tests, fixtures or the user checkout.

### Scope, user flow and compatibility

The manifest command above uses a named required input, not an executable literal path. Live invocation is withheld until T01/T02 supply the exact approved host/model and paired driver; existing syntax is pnpm eval --out NEW --host LOCAL_ORIGIN --model ACTUAL_ID --repetitions N with N in1..3, but this syntax alone does not provide the paired M01 protocol. Do not silently change the runner bounds to research pilot suggestions. The task scope includes production observation join only when approved contract/owner is supplied; no new model provider or optimization feature implementation is authorized.

This audit authorizes only review and plan publication. Future repository edits, dependency restoration, privileged test execution and live-account spending require the corresponding existing assignment/input. Existing canonical issues and PRs retain custody until explicit release; no concurrent writer is created by this document. Do not delete retained artifacts/tests or change strict UI preferences. Positive normal behavior, denial reasons, cancellation, restart, rollback and current/historical distinctions below are required; no all-tools, all-platforms or universal-redaction claim.

## REPO_MAP

- [apps/server/host.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/host.ts)
- [docs/implementation/v3/M01-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M01-verification.json)
- [docs/implementation/v3/source-lock.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/source-lock.json)
- [evals/README.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/evals/README.md)
- [evals/cases.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/evals/cases.ts)
- [evals/runner.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/evals/runner.ts)
- [packages/contracts/implementation-evidence.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/implementation-evidence.ts)
- [packages/core/capability-flags.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/capability-flags.ts)
- [packages/core/host-flags.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/host-flags.ts)
- [scripts/research-baseline.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/research-baseline.ts)
- [scripts/validate-m01-m03-integration.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/validate-m01-m03-integration.mjs)
- [scripts/verify-readiness.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/verify-readiness.ts)
- [tests/baseline-cancellation-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/baseline-cancellation-v3.test.ts)
- [tests/baseline-concurrent-edits-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/baseline-concurrent-edits-v3.test.ts)
- [tests/baseline-memory-conflict-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/baseline-memory-conflict-v3.test.ts)
- [tests/baseline-oversized-output-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/baseline-oversized-output-v3.test.ts)
- [tests/baseline-workloads-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/baseline-workloads-v3.test.ts)

Existing mapped tests, definitions only until actually executed:

- [scripts/validate-m01-m03-integration.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/validate-m01-m03-integration.test.mjs)
- [tests/baseline-cancellation-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/baseline-cancellation-v3.test.ts)
- [tests/baseline-concurrent-edits-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/baseline-concurrent-edits-v3.test.ts)
- [tests/baseline-memory-conflict-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/baseline-memory-conflict-v3.test.ts)
- [tests/baseline-oversized-output-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/baseline-oversized-output-v3.test.ts)
- [tests/baseline-workloads-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/baseline-workloads-v3.test.ts)
- [tests/dependency-contract-execution-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/dependency-contract-execution-v3.test.ts)
- [tests/evidence-aggregation-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/evidence-aggregation-v3.test.ts)
- [tests/readiness-manifest.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/readiness-manifest.test.ts)
- [tests/research-baseline.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/research-baseline.test.ts)
- [tests/source-lock-ancestry-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/source-lock-ancestry-v3.test.ts)
- [tests/source-lock-drift-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/source-lock-drift-v3.test.ts)

Exact finding anchors:

- [evals/runner.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/evals/runner.ts#L9-L27)
- [packages/contracts/implementation-evidence.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/implementation-evidence.ts#L131-L164)
- [tests/baseline-workloads-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/baseline-workloads-v3.test.ts#L1-L125)
- [tests/baseline-cancellation-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/baseline-cancellation-v3.test.ts#L1-L100)

## DESIGN

Retain current runEvals and baseline fixtures; do not invent a provider, borrow an account, enable product features or repurpose an unrelated held-out score as M01 paired evidence. Obtain explicit host/provider/model/test-account/budget and immutable fixture plus baseline/candidate source/config arm identities. Existing evaluator accepts only a local HTTP origin; do not bypass that guard for remote authorization. Required repetition/order/timeout/warmup/cancellation protocol must be the accepted comparison protocol. Research pilot suggestions are rationale and do not silently override current runner1..3 bounds or set a new sample count.

First map the accepted workload to existing production caller and observer. All eight required workload dimensions remain in scope: long sessions,100-tool catalog,500-tool catalog,oversized output,memory conflicts,cancellation,concurrent edits and large UI histories. Capture host readiness and first public/user-visible response as distinct observed events. Count foreground requests, retries, compaction and background work. Record model/account/config, input/output/cache usage where actually measured, elapsed/cold-start/first-public timing, task quality and all background costs. Unavailable values stay null with reason and provenance.

Existing BenchmarkMeasurement includes totalCostBytes/backgroundCostBytes; those are byte quantities and cannot be relabeled tokens or money. Monetary/provider usage mapping and total-cost definition must come from approved existing usage receipts or an explicitly accepted additive measurement contract. If missing, HOLD_CONTRACT_SHAPE for that metric, not synthetic zero. Do not mutate strict V3 schema ad hoc. Keep baseline/candidate/unavailable/fail/expected-negative labels separate in local HTML/JSON. Setup errors and timeouts stay in denominator and cannot become quality failure or successful expected regression. Execution artifacts are exclusive new directories and historical runs remain immutable.

## EXECUTION_DAG

Stable task IDs are local to this plan. Every task inherits the fixed source, owner, no-activation and evidence rules above. Task-specific files marked proposed or discovery are not represented as existing repository facts. No blocked provider/backend/interface choice is delegated to an implementer.

### T01: Obtain exact authorized comparison inputs

**Dependencies:** None.

**Exact files or discovery scope:** evals/runner.ts; evals/cases.ts; evals/README.md; package.json; existing #1031 source/eval history.

**Inputs:** Operator-provided authorized local host/provider/model/account/budget, source arms, fixture set and accepted protocol.

**Executable steps:**

- [ ] Read current evaluator and workload manifest.

- [ ] Record source/config/fixture digests, allowed test account and maximum budget without credentials.

- [ ] Require explicit repetition/order/time limits and owned resource boundaries.

- [ ] If inputs absent, generate only existing MANIFEST_ONLY form after prerequisites; model outcomes NOT_RUN.

- [ ] No assumed budget or provider.

**Outputs:** Immutable accepted run specification or HOLD_LIVE_EVAL_AUTHORIZATION with missing fields/provider.

**Positive, negative and lifecycle validation:** Missing host/model never makes a request; unknown/unauthorized account or different fixture/config blocks execution.

**Done when:** No unrecorded evaluation choice or account access remains for implementer.

**Ownership and handoff:** Operator/evaluation owner supplies inputs; child reviewer owns exact protocol record.

### T02: Map workload/measurement contracts and production observers

**Dependencies:** T01; independent source mapping may proceed.

**Exact files or discovery scope:** packages/contracts/implementation-evidence.ts; scripts/research-baseline.ts; evals/runner.ts; baseline workload/cancellation/concurrent-edit/memory/output tests; existing usage receipt paths discovered.

**Inputs:** Accepted workload IDs/arms/config and current typed metrics.

**Executable steps:**

- [ ] Locate current production observer for each required workload and metric.

- [ ] Bind real host readiness/public event to durable receipts, not synthetic timers.

- [ ] Inspect provider usage/cost provenance and retries/background/compaction attribution.

- [ ] Reuse existing schemas and reporters.

- [ ] If large-history production observer, monetary cost or paired driver contract missing, identify exact API/path and require approved plan revision before implementation; do not invent a driver.

**Outputs:** Complete eight-workload/metric mapping with observed/nullable/blocked states.

**Positive, negative and lifecycle validation:** Known measured metric preserves value/provenance; absent cache/cost null; byte budget label stays bytes; changed fixture/config detected.

**Done when:** Each required observation has exact supported source or named HOLD_CONTRACT_SHAPE; no dropped workload.

**Ownership and handoff:** Existing baseline/eval/usage owners approve joins; M04/M05 implementations not duplicated.

### T03: Run offline barrier, timeout and custody controls

**Dependencies:** T02 and matching installed prerequisites.

**Exact files or discovery scope:** Existing baseline-package-manager/command-timeout/workloads/oversized-output/concurrent-edits/memory-conflict/cancellation tests; source custody fixtures.

**Inputs:** Owned fixtures, approved source/output roots and seeds1,2,7,42,99.

**Executable steps:**

- [ ] Verify exact package manager/source/output identities first.

- [ ] Run barrier-ready cancellation and wait actual settlement; validate bounded retrieval, explicit conflict/retry and startup/first-visible timestamp separation.

- [ ] Exercise missing host/model manifest mode.

- [ ] Run same assertion on known bad baseline/candidate only when existing fixture defines it; no deliberate production break.

**Outputs:** Actual offline control and manifest-only receipts; frozen live run inputs.

**Positive, negative and lifecycle validation:** Cancel before/after readiness, timeout, failed setup, lost observation, unknown counters and changed source/output. All unavailable values remain null, never fake PASS.

**Done when:** Infrastructure does not misclassify setup/cancel/failure or contaminate output before live spend.

**Ownership and handoff:** Baseline verifier to authorized evaluator.

### T04: Execute exact paired protocol and retain all attempts

**Dependencies:** T01-T03 complete; explicit live spend authority.

**Exact files or discovery scope:** Existing approved evaluator/driver discovered and pinned by T02; exact local host production path.

**Inputs:** Frozen baseline/candidate arms, accepted repetitions/order, approved account/budget and owned resources.

**Executable steps:**

- [ ] Create exclusive output per arm/run.

- [ ] Record actual start/readiness/first-public/completion and stop actions.

- [ ] Hold fixture/model/config constant; log request/usage/background retries with provenance.

- [ ] Preserve failed/timeout/cancelled attempts in denominator.

- [ ] Stop on budget/owner/source drift; request run.stop through existing authenticated route, wait actual settlement and record historical late effects without attributing current success.

- [ ] Never auto-approve unrelated actions.

**Outputs:** Raw bounded redacted attempt receipts and complete paired result rows.

**Positive, negative and lifecycle validation:** Positive successful real task observation; failed quality, setup error, cancellation, timeout and interrupted run have distinct retained statuses; no cost0 imputation.

**Done when:** Every accepted attempt accounted for and all required workload observations present or explicitly failed/blocked.

**Ownership and handoff:** Authorized evaluation owner; task reviewer scores actual outputs independently when not machine-verifiable.

### T05: Produce reproducible local comparison and acceptance

**Dependencies:** T04.

**Exact files or discovery scope:** scripts/research-baseline.ts benchmark report; accepted evidence/measurement contract; proposed docs/implementation/v6/M01/paired-evaluation.json.

**Inputs:** Actual source/fixture/model/config/attempt receipts and observed costs.

**Executable steps:**

- [ ] Generate inspectable HTML/JSON with exact arm identities and success denominators, setup vs quality vs expected-negative distinction, foreground/background/retry/compaction totals and null reasons.

- [ ] Do not claim improvement from synthetic timings or unmatched configuration.

- [ ] Validate computed V3 status where applicable, preserve historical artifacts and reviewerApproval=false.

- [ ] Publish complete child plan/results for #1031 without enabling flags.

**Outputs:** Complete source-bound local report and independently reviewed acceptance matrix.

**Positive, negative and lifecycle validation:** Deliberate missing attempt/cost provenance/stale source or mislabeled bytes must reject validation; unavailable metric remains explicit.

**Done when:** All original paired requirements have actual passing evidence for completion, otherwise truthful PARTIAL/BLOCKED with precise remaining case.

**Ownership and handoff:** Evaluation owner releases child; #1031 coordinator consumes accepted evidence.

## VALIDATION

### Reproducible setup and planned commands

The asset-build commands below are prerequisites for their consuming tests. Build widgets before App/widget-dependent focused tests. The native credential-lease build is required for its native/full-test lane; a missing compiler blocks that lane rather than authorizing test:no-lease as release evidence. Run from the exact assigned candidate repository root, with declared Node>=24.10.0 and actual pnpm10.30.3 resolved offline. Record executable identity, cwd physical identity, source/tree, UTC start/end, exit/termination, per-case totals and bounded redacted log digest for each command. Missing tools/dependencies/native compiler/browser/Hermes environment mean the consuming lane is BLOCKED/NOT_RUN. No new toolchain download, substitutions or changed lockfile. All following commands are **planned and NOT_RUN by this audit**, except the separately identified existing Node control suite.

```text
node --version
pnpm --version
pnpm build:widgets
pnpm build:credential-lease
pnpm exec vitest run tests/baseline-package-manager-v3.test.ts tests/baseline-command-timeout-v3.test.ts tests/baseline-workloads-v3.test.ts tests/baseline-oversized-output-v3.test.ts tests/baseline-concurrent-edits-v3.test.ts tests/baseline-memory-conflict-v3.test.ts tests/baseline-cancellation-v3.test.ts tests/research-baseline.test.ts --maxWorkers=1
pnpm eval --out <EXPLICIT_NEW_MANIFEST_DIRECTORY>
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:browser
```

Focused checks do not replace required full typecheck/lint/unit/build/browser or actual native/live lanes. Run only after prerequisites and exact implementation ownership permit. A real denied attack may pass its asserted expected-negative case; a red test process, setup exception or timeout remains a failed/blocked command. Preserve unsuccessful attempts and run the same fixture against baseline/candidate when classification is needed. Never change the required browser channel, fixture, budget or assertion to obtain green.

### Acceptance matrix

| Check | Subject | Task IDs | Required observable result |
|---|---|---|---|
| A01 | Authorization and immutable arms | T01 | Exact supplied host/model/account/budget/protocol or MANIFEST_ONLY, no unauthorized call |
| A02 | All required workloads/metrics | T02 | Eight workload dimensions and complete per-metric provenance/null mapping, no invented driver |
| A03 | Reliable controls | T03 | Real readiness/cancel settlement, bounded output, conflicts and negative distinction |
| A04 | Actual paired observations | T04 | All attempts retained with same fixture/settings and real task outcomes |
| A05 | Report/cost integrity | T05 | Exact arms, denominator, total/background/retry attribution; bytes not tokens/money; no activation |

### Requirement-to-task completeness

| Original requirement | Task coverage | Acceptance |
|---|---|---|
| M01-C01 | T05 | A05 |
| M01-C02 | T03, T04, T05 | A03, A04, A05 |
| M01-C03 | T01, T03, T05 | A01, A03, A05 |
| M01-S05 | T01, T03, T04 | A01, A03, A04 |
| M01-S09 | T02, T04, T05 | A02, A04, A05 |
| M01-S11 | T03, T04, T05 | A03, A04, A05 |
| M01-U01 | T05 | A05 |
| M01-U02 | T02, T04, T05 | A02, A04, A05 |
| M01-T04 | T02, T03, T05 | A02, A03, A05 |
| M01-G01 | T03, T04, T05 | A03, A04, A05 |
| M01-G02 | T01, T05 | A01, A05 |
| M01-G03 | T05 | A05 |


### Actually executed in this read-only audit

Source/issue/PR-body inspection and exact repository blob comparisons were performed. Existing dependency-free `node --test scripts/validate-m01-m03-integration.test.mjs` passed4/4 with0 fail/skip/cancel on the audited SHA; latest duration2451.852311ms and raw log are in the external audit evidence. This only tests the immutable control harness with owned synthetic fixtures. It does not prove this plan’s product behavior. Product Vitest/typecheck/lint/build/browser/native/live commands are NOT_RUN: required pnpm10.30.3 and node_modules are absent, available pnpm11.25.0 mismatches. Node24.22.3 is available. `HOLD_TOOLCHAIN` remains. No source-only or candidate-body historical result is reported as current acceptance.

### Release gate and rollback

All applicable required cases must pass on the final integrated source, and every unavailable platform/live/input lane remains explicitly blocked. Validate current V3 evidence with the existing owner and computed status; hold undefined legacy migration at HOLD_CONTRACT_SHAPE. `reviewerApproval=false` and all unproven host flags remain off. Passing a fixture, producing a source hash, or merging a PR is insufficient for deployment/activation. Rollback preserves account/trust/ledger/approval records and earlier evidence; disable only new admissions/wiring and stop owned children where supported, without deleting unrelated files or repeating uncertain effects.

## STATE

Researched and decided: exact reviewed source, original requirements, current production/caller gaps, ownership and safe blocked-input handling. Implemented by this audit: none. Verified by this audit: source inventory/metadata and four dependency-free control tests only. Pending: task-specific committed execution, candidate compatibility, exact-head CI, independent review, and any named operator/backend/provider/live inputs. Existing implementation PRs remain open until GitHub metadata proves otherwise; stale body heads or queued jobs are not acceptance. Latest publication owner is root coordinator `codex-cloud-ca7d38`; original source reviewer is `codex-cloud-m0103-ac1a13`; final artifact reviewer is `codex-cloud-m0103-finish-e71314`. No assignee or implementation custody transferred by this file.

First executable next step is T01. It is read-only scope/source/owner/input reconciliation. The actual GitHub filechooser upload failed in the coordinator environment. This plan is a real UTF-8 .md file for the deliverables, but it is not represented as a hosted GitHub attachment. No repository-docs commit is authorized. The complete canonical issue body is the required durable fallback. Current audit deliverable remains HANDOFF_INCOMPLETE until the coordinator publishes this complete body and reads it back, with actual file attachment if available or an honest attachment limitation. A local path alone is not durable issue handoff. Every future worker posts START/20-minute and milestone checkpoints and final RELEASE OWNER=NONE on its canonical issue/parent, preserving previous failed attempts.

## REFERENCES

- [#1031](https://github.com/skytuhua-org/Gen-V1/issues/1031)
- [#299](https://github.com/skytuhua-org/Gen-V1/pull/299)
- [#779](https://github.com/skytuhua-org/Gen-V1/pull/779)

- [Audit source tree](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b)
- [Repository coordination and full-plan contract](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [Contribution requirements](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)

The supplied v6 source clauses necessary to execute this plan are reproduced in REQUIREMENTS. Completion appendix substance is preserved in exact current source binding, complete owner/action checks, proper barriers/real cancellation, actual installed/live evidence, no invented backend/provider, and preservation of prior failures. Research rationale is summarized here: committed host authority and real external receipts outrank narratives; minimum destination-bound secret delivery is separate from process isolation; paired measured outcomes must retain denominators, costs and uncertainty. Research does not authorize a donor implementation or replace a platform proof.
