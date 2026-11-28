**Full current issue mirror:** [issue-1179.md](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1179.md). The publication checkpoint pins the exact commit.

Publication supplement under #1803, cleanup-2026-11-23-r2: preserve the concurrent #1992 plan below. #1181 remains the canonical open diagnostic-stream candidate and #1824 is a closed duplicate. The actual candidate tests are tests/readiness-manifest.test.ts. This mirror publication does not certify the pending redaction/streaming acceptance or release another worker's ownership.

# Readiness log capture: bounded confidential independent stream records Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans for future assigned implementation, task by task. This review authorizes plan publication only.

**Goal:** Readiness log capture: bounded confidential independent stream records.

**Architecture:** Keep runCheck as the single public runner and CheckResult as the existing result shape.

**Tech Stack:** Existing TypeScript/Node host, synchronous Store and checked-in Vitest/browser tooling; declared native and live lanes require their own approved environments.

**Spec:** Complete relevant v6 clauses are reproduced in REQUIREMENTS below; the source baseline and prior issue context travel with this document.

## Global Constraints

- Declared Node >=24.10.0 and packageManager pnpm10.30.3. Resolve an installed matching executable; no unauthorized toolchain download.
- Preserve the existing lockfile, source ownership and required checks. Product flags default false and remain host-owned.
- Current review is read-only for the repository. Future edits require their assigned owner; current incomplete native/live lanes remain explicit holds.

## Review Focus

- T02/T03: interleaved partial pipe records must retain their separate boundaries and terminal tails.
- T02/T03: split, unclosed or opposite-pipe forged secret delimiters must never release protected bytes.
- T03: newline-free input and redaction expansion must enforce both byte ceilings.
- T04: timeout, cancellation or overflow must kill only owned children and settle once.
- T05: candidate review history and final-head CI must remain distinct from current acceptance.

## META

Repository: https://github.com/skytuhua-org/Gen-V1. Plan revision `log-acceptance-r2`. Date2026-11-23 America/Los_Angeles (audit UTC2026-11-24). Baseline `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`; no working branch or implementation claim created by this review. Audit parent [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992), T01/T02/T03. Publication: Reuse [#1179](https://github.com/skytuhua-org/Gen-V1/issues/1179). Status `IMPLEMENTATION_PENDING_ACCEPTANCE`. Source provenance: all relevant v6 original C/S/U/T/G clauses, November18 completion follow-ups, and research v3 read; the archive is an acceptance ledger and does not authorize rebuilding merged milestones.

## OBJECTIVE

At the reviewed source, scripts/verify-readiness.ts lines55-65 keeps one carry for both pipes, redacts completed lines and writes without a total byte budget. Lines126-128 feed both stdout and stderr into that sink. The PEM regex lines43-47 requires BEGIN and END in the same string, so line-by-line processing cannot contain ordinary multiline PEM. This is direct source evidence, not a production leak claim or an executed repository reproduction in this audit. Existing PR#1181 owns stream separation for #1179; #1172 owns confidentiality under #774; #1193 owns total capture limits under #1031. PR#1824 was closed unmerged and consolidated into #1181. Success requires their compatible tested behavior in one accepted final runner, without duplicate implementations or new issues for the existing candidates.

## REQUIREMENTS

### Retained original acceptance requirements

The following substantive text is preserved from the supplied v6 archive. It defines acceptance, not permission to repeat its historical implementation sequence. Existing supported code/tests and original owner custody remain in place.

**M01-C02.** CommandEvidence: argv[], cwdIdentity, executableIdentity, startedAt, endedAt, exitCode (integer or null), termination NONE|TIMEOUT|CANCELLED|SPAWN_ERROR, status, boundedLogRef and logDigest. A successful expected-negative fixture is PASS only if its asserted failure was observed. A build that exits nonzero is FAIL, not an expected negative.

**M01-S06.** Implement a child-process test runner with argv arrays, explicit working directory, inherited environment allowlist, bounded stdout/stderr and a hard deadline. Reuse the repository's Windows-capable process launcher. Do not invoke a .cmd shim with shell:false and assume it works; resolve a trusted Node entry point or the already-tested platform launcher. Kill only the owned process tree.

**M01-T01.** Runner fixtures: exit 0, exit 7, missing executable, invalid cwd, timeout, cancellation, truncated output and Unicode/space-containing paths. Assert exact status and child cleanup.

**M01-S11.** Adopt OpenHands' expected-failure distinction: a known-bug fixture passes its reproduction check only at the intended assertion with the intended bad value. Setup failure, timeouts and another error are separate failures. Then run the same fixture against the candidate and require the correct assertion to pass.

**M03-S06.** Apply structured redaction before logs or model output. Test known token fields, ANSI-split output, multiline values and encoded text. Do not claim universal redaction; avoid logging unclassified secret-bearing content by default. Images require explicit capture consent, not an assumed perfect text scrubber.

**M01-C01.** ImplementationEvidenceV3: schemaVersion=3, bundleId, baseSha, sourceLockDigest, platform, nodeVersion, packageManagerVersion, phases[], changedFiles[], dependencyContracts[], flags[], remainingGates[], reviewerApproval=false. Each phase stores id, status PASS|FAIL|BLOCKED|NOT_RUN, requiredCases[], commands[] and artifactRefs[]. Bundle status is PASS only when every required phase passes; otherwise FAIL if an observed required case fails, PARTIAL if some phases pass and another is blocked, or BLOCKED if no required phase can run. Release permission is separate and defaults false.

### Scope, user flow and compatibility

Required fixture union includes ordinary interleaving, both unterminated tails, chunk-split multiline PEM, absent/mismatched END, same-line PEM, forged opposite-pipe END, opposite-pipe body and tail, partial opener1/2/3/4-byte cuts, split named credential and inline/multiword/multiline value, well-formed SGR/unsupported/incomplete control, no-newline input cap, combined flood, UTF-8 byte count and sanitized expansion. Keep all candidate regressions; review diagnostic loss explicitly. The output-limit proposal is a candidate decision from #1193 and needs owner/reviewer acceptance, not a new audit-imposed default.

This audit authorizes only review and plan publication. Future repository edits, dependency restoration, privileged test execution and live-account spending require the corresponding existing assignment/input. Existing canonical issues and PRs retain custody until explicit release; no concurrent writer is created by this document. Do not delete retained artifacts/tests or change strict UI preferences. Positive normal behavior, denial reasons, cancellation, restart, rollback and current/historical distinctions below are required; no all-tools, all-platforms or universal-redaction claim.

## REPO_MAP

- [packages/capabilities/process.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/capabilities/process.ts)
- [packages/contracts/implementation-evidence.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/implementation-evidence.ts)
- [packages/core/secret-references.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/secret-references.ts)
- [packages/integrations/index.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/integrations/index.ts)
- [packages/workspace/github.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/workspace/github.ts)
- [scripts/research-baseline.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/research-baseline.ts)
- [scripts/verify-readiness.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/verify-readiness.ts)

Existing mapped tests, definitions only until actually executed:

- [tests/baseline-command-timeout-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/baseline-command-timeout-v3.test.ts)
- [tests/evidence-aggregation-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/evidence-aggregation-v3.test.ts)
- [tests/github-output-redaction-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/github-output-redaction-v3.test.ts)
- [tests/integration-secret-output-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/integration-secret-output-v3.test.mjs)
- [tests/readiness-manifest.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/readiness-manifest.test.ts)
- [tests/research-baseline.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/research-baseline.test.ts)
- [tests/secret-redaction-json-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/secret-redaction-json-v3.test.ts)

Exact finding anchors:

- [scripts/verify-readiness.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/verify-readiness.ts#L43-L65)
- [tests/readiness-manifest.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/readiness-manifest.test.ts#L1-L45)

## DESIGN

Keep runCheck as the single public runner and CheckResult as the existing result shape. Independent pipe record buffers must preserve benign line boundaries and both unterminated tails. Stateful confidential-region handling must work across chunks and both pipes without permitting a forged END from the other pipe to release protected bytes. Reuse #1172's reviewed state-machine intent, including incomplete markers, named multiword/multiline fields, ANSI handling and fail-closed suppression. Its16KiB ambiguous cross-pipe holdback is not the total output budget.

Consume #1193's existing proposed budget of1,048,576 combined decoded child-input bytes and1,048,576 persisted redacted-log bytes as separately counted limits, subject to its owner/reviewer acceptance. Overflow must stop capture, kill only the owned tree, settle once and report FAIL/errorKind output-limit. A process that later exits0 cannot overwrite overflow. A newline-free carry, redaction expansion, multibyte text or two-pipe flood cannot bypass limits. Preserve timeout/cancel/spawn-error/exit distinctions, environment allowlist, normal Unicode and argv behavior.

Confidentiality may deliberately omit unsafe ambiguous output; such loss must be labeled and cannot fabricate diagnostic lines. Preserve benign diagnostic separation under #1179. No universal scrubber claim, secret scanning upload, platform proof or product flag change. Future smallest edit scope remains scripts/verify-readiness.ts and tests/readiness-manifest.test.ts, with tests/verify-readiness-streams.test.ts only if accepted from surviving ownership. All repository edits are future assigned work, not authorized by this audit.

The preserved #1179 restriction on gate/status changes applies to its independent stream-buffer repair. Any separately accepted output-limit classification belongs to #1193 and must retain that owner and review. This acceptance plan does not authorize a new status policy or widen #1179 implementation custody.

## EXECUTION_DAG

Stable task IDs are local to this plan. Every task inherits the fixed source, owner, no-activation and evidence rules above. Task-specific files marked proposed or discovery are not represented as existing repository facts. No blocked provider/backend/interface choice is delegated to an implementer.

### T01: Reconcile exact overlapping candidate ownership

**Dependencies:** None.

**Exact files or discovery scope:** Existing #1179/#1031/#774 journals; #1181/#1172/#1193 heads and diffs.

**Inputs:** Full issue histories and exact current PR metadata; recorded reviewed source.

**Executable steps:**

- [ ] Refresh all three candidate heads and independent review/check states; read changed files and every retained regression; confirm #1824 supersession.

- [ ] Assign a single integration owner only after prior scopes released/ACKed.

- [ ] Preserve candidate histories and merge protections, no duplicate branch or speculative cherry-pick.

**Outputs:** Head/base/owner table and case-union manifest.

**Positive, negative and lifecycle validation:** Negative stale body head or active overlapping owner blocks integration; positive exact metadata readback.

**Done when:** One accepted owner controls composed sink; existing distinct PR ownership remains explicit.

**Ownership and handoff:** Read-only coordinator to assigned integration owner.

### T02: Reproduce source defects on unchanged baseline

**Dependencies:** T01 plus matching installed toolchain.

**Exact files or discovery scope:** scripts/verify-readiness.ts; tests/readiness-manifest.test.ts.

**Inputs:** Owned child scripts, synthetic canaries, bounded isolated evidence output.

**Executable steps:**

- [ ] Use existing real-child test style.

- [ ] Demonstrate partial stdout/full stderr/continued stdout and two tails.

- [ ] Demonstrate multiline/chunk-split PEM and unclosed header using synthetic data only.

- [ ] Reuse #1193 no-newline/flood/Unicode/expansion fixtures.

- [ ] Preserve failing assertion, output and baseline SHA; setup failure is not an intended negative.

**Outputs:** Source-bound failing baseline and fixture identities.

**Positive, negative and lifecycle validation:** Positive ordinary lines/end-of-stream; negative invented mixed record, exposed synthetic canary and over-cap capture.

**Done when:** Each exact retained defect has a reproducible failing assertion or explicit setup blocker, never invented PASS.

**Ownership and handoff:** Fixture owner; hand same fixtures to T03.

### T03: Compose existing stream, confidential-state and budget behavior

**Dependencies:** T01,T02; explicit future implementation custody.

**Exact files or discovery scope:** scripts/verify-readiness.ts; tests/readiness-manifest.test.ts.

**Inputs:** Accepted candidate code and union of regressions, existing CheckSpec/CheckResult contracts.

**Executable steps:**

- [ ] Integrate per-pipe carries with shared confidentiality coordinator and shared input/output budget.

- [ ] Maintain independent UTF-8 decoding/accounting; classify ambiguous terminal sequences per existing #1172 policy before persistence.

- [ ] Do not let opposite-pipe tail flush bypass active/incomplete secret suppression.

- [ ] End each pipe exactly once, then close shared log once.

- [ ] Overflow wins over later successful process exit and retains owned process-tree cleanup.

- [ ] No new parser/backend or weaker assertion.

**Outputs:** Minimal reviewed integration diff and unchanged public outcome contract.

**Positive, negative and lifecycle validation:** Run all baseline cases unchanged; staged chunk splits at1/2/3/4-byte prefixes, split labels, forged END, ANSI/multiline and no-newline bounds.

**Done when:** All three candidate behaviors coexist and no ordinary line concatenation/regression returns.

**Ownership and handoff:** Single integration owner; each original PR owner/reviewer receives compatibility diff.

### T04: Verify cancellation, timeout, IO failure and flush races

**Dependencies:** T03.

**Exact files or discovery scope:** tests/readiness-manifest.test.ts; scripts/verify-readiness.ts.

**Inputs:** Real child readiness barrier/owned descendant marker and synthetic log destination.

**Executable steps:**

- [ ] After child signals readiness, cancel/timeout/overflow and wait for actual close; assert no descendant remains and only one result settles.

- [ ] Exercise simultaneous pipe close, spawn error, final non-newline tails, unavailable log destination and redaction output expansion.

- [ ] Confirm late events cannot append after finalization or erase failure.

**Outputs:** Exact terminal-state and artifact bounds receipts.

**Positive, negative and lifecycle validation:** Allowed child exit0 PASS; exit7 FAIL; missing executable/cwd BLOCKED per contract; timeout/cancel distinct; overflow FAIL; secret markers absent from all logs.

**Done when:** No leak, over-budget artifact, forged mixed record or unowned process kill on every tested terminal path.

**Ownership and handoff:** Integration test owner to independent reviewer.

### T05: Run exact-head regression and publish qualified acceptance

**Dependencies:** T04.

**Exact files or discovery scope:** Existing readiness tests; package.json scripts; #1179 body and #1031/#774 linkage.

**Inputs:** Final head/tree, exact artifacts and completed candidate reviews.

**Executable steps:**

- [ ] Run focused suite and applicable full scripts separately on final cut, including Windows-owned child semantics in declared environment.

- [ ] Retain baseline and earlier candidate failures.

- [ ] Re-read current required CI/independent review; queued is not pass.

- [ ] Publish complete local plan/body and current result references; keep native confinement and live effects gates separate.

- [ ] Record this focused phase using the existing ImplementationEvidenceV3 schema and computed bundle status with reviewerApproval=false.

- [ ] Its PASS cannot discharge unrelated native or live phases, and their required cases remain in remainingGates.

**Outputs:** Focused repair acceptance and cross-issue dependency update.

**Positive, negative and lifecycle validation:** Evidence mutation/missing required cases reject; all retained tests pass on final integration head.

**Done when:** Source-bound bounded/confidential stream proof accepted; no native security certification inferred.

**Ownership and handoff:** #1179 owner releases scoped task and hands accepted sink dependency to #1031/#774.

## VALIDATION

### Reproducible setup and planned commands

The asset-build commands below are prerequisites for their consuming tests. Build widgets before App/widget-dependent focused tests. The native credential-lease build is required for its native/full-test lane; a missing compiler blocks that lane rather than authorizing test:no-lease as release evidence. Run from the exact assigned candidate repository root, with declared Node>=24.10.0 and actual pnpm10.30.3 resolved offline. Record executable identity, cwd physical identity, source/tree, UTC start/end, exit/termination, per-case totals and bounded redacted log digest for each command. Missing tools/dependencies/native compiler/browser/Hermes environment mean the consuming lane is BLOCKED/NOT_RUN. No new toolchain download, substitutions or changed lockfile. All following commands are **planned and NOT_RUN by this audit**, except the separately identified existing Node control suite.

```text
node --version
pnpm --version
pnpm build:widgets
pnpm build:credential-lease
pnpm exec vitest run tests/readiness-manifest.test.ts --maxWorkers=1
pnpm exec vitest run tests/research-baseline.test.ts tests/baseline-command-timeout-v3.test.ts --maxWorkers=1
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
| A01 | Stream integrity | T02-T04 | Both pipes preserve ordinary lines and each tail without invented mixed text |
| A02 | Confidentiality | T02-T04 | Synthetic PEM/label/ANSI/raw/encoded canaries absent across chunks, forged END and final flush |
| A03 | Bounds and lifecycle | T03,T04 | Both declared byte ceilings enforced; overflow FAIL; owned tree gone; one final settlement |
| A04 | Evidence semantics and integration | T01,T05 | Exact accepted candidates/current tests and CI; historical failures retained; separate platform gates |

### Requirement-to-task completeness

| Original requirement | Task coverage | Acceptance |
|---|---|---|
| M01-C02 | T02, T04, T05 | A03, A04 |
| M01-S06 | T02, T03, T04 | A01, A03 |
| M01-T01 | T02, T04 | A01, A03 |
| M01-S11 | T02, T05 | A04 |
| M03-S06 | T02, T03, T04 | A02 |
| M01-C01 | T05 | A04 |


### Actually executed in this read-only audit

Source/issue/PR-body inspection and exact repository blob comparisons were performed. Existing dependency-free `node --test scripts/validate-m01-m03-integration.test.mjs` passed4/4 with0 fail/skip/cancel on the audited SHA; latest duration2451.852311ms and raw log are in the external audit evidence. This only tests the immutable control harness with owned synthetic fixtures. It does not prove this plan’s product behavior. Product Vitest/typecheck/lint/build/browser/native/live commands are NOT_RUN: required pnpm10.30.3 and node_modules are absent, available pnpm11.25.0 mismatches. Node24.22.3 is available. `HOLD_TOOLCHAIN` remains. No source-only or candidate-body historical result is reported as current acceptance.

### Release gate and rollback

All applicable required cases must pass on the final integrated source, and every unavailable platform/live/input lane remains explicitly blocked. Validate current V3 evidence with the existing owner and computed status; hold undefined legacy migration at HOLD_CONTRACT_SHAPE. `reviewerApproval=false` and all unproven host flags remain off. Passing a fixture, producing a source hash, or merging a PR is insufficient for deployment/activation. Rollback preserves account/trust/ledger/approval records and earlier evidence; disable only new admissions/wiring and stop owned children where supported, without deleting unrelated files or repeating uncertain effects.

## STATE

Researched and decided: exact reviewed source, original requirements, current production/caller gaps, ownership and safe blocked-input handling. Implemented by this audit: none. Verified by this audit: source inventory/metadata and four dependency-free control tests only. Pending: task-specific committed execution, candidate compatibility, exact-head CI, independent review, and any named operator/backend/provider/live inputs. Existing implementation PRs remain open until GitHub metadata proves otherwise; stale body heads or queued jobs are not acceptance. Latest publication owner is root coordinator `codex-cloud-ca7d38`; original source reviewer is `codex-cloud-m0103-ac1a13`; final artifact reviewer is `codex-cloud-m0103-finish-e71314`. No assignee or implementation custody transferred by this file.

First executable next step is T01. It is read-only scope/source/owner/input reconciliation. The actual GitHub filechooser upload failed in the coordinator environment. This plan is a real UTF-8 .md file for the deliverables, but it is not represented as a hosted GitHub attachment. No repository-docs commit is authorized. The complete canonical issue body is the required durable fallback. Current audit deliverable remains HANDOFF_INCOMPLETE until the coordinator publishes this complete body and reads it back, with actual file attachment if available or an honest attachment limitation. A local path alone is not durable issue handoff. Every future worker posts START/20-minute and milestone checkpoints and final RELEASE OWNER=NONE on its canonical issue/parent, preserving previous failed attempts.

## REFERENCES

- [#1179](https://github.com/skytuhua-org/Gen-V1/issues/1179)
- [#1031](https://github.com/skytuhua-org/Gen-V1/issues/1031)
- [#774](https://github.com/skytuhua-org/Gen-V1/issues/774)
- [#1181](https://github.com/skytuhua-org/Gen-V1/pull/1181)
- [#1172](https://github.com/skytuhua-org/Gen-V1/pull/1172)
- [#1193](https://github.com/skytuhua-org/Gen-V1/pull/1193)
- [#1824](https://github.com/skytuhua-org/Gen-V1/pull/1824)

- [Audit source tree](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b)
- [Repository coordination and full-plan contract](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [Contribution requirements](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)

The supplied v6 source clauses necessary to execute this plan are reproduced in REQUIREMENTS. Completion appendix substance is preserved in exact current source binding, complete owner/action checks, proper barriers/real cancellation, actual installed/live evidence, no invented backend/provider, and preservation of prior failures. Research rationale is summarized here: committed host authority and real external receipts outrank narratives; minimum destination-bound secret delivery is separate from process isolation; paired measured outcomes must retain denominators, costs and uncertainty. Research does not authorize a donor implementation or replace a platform proof.

## PRESERVED_ORIGINAL_ISSUE_BODY

The complete issue body read on 2026-11-24 is retained below verbatim. Its prior task IDs are historical; the current executable task IDs and source identities are above. Existing comments, claims, PR histories and release permissions remain authoritative. The prior checked-in plan remains available at [docs/agent-plans/1179-gen-v1-audit-keep-readiness-diagnostic-lines-intact.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/agent-plans/1179-gen-v1-audit-keep-readiness-diagnostic-lines-intact.md). This revision expands acceptance detail without deleting prior obligations.

Readiness merges stdout and stderr fragments into a single line buffer. With a valid partial stdout line, a complete stderr line and the stdout remainder, its artifact invents a mixed line and loses the original two records. Keep independent partial lines until each has a newline, preserve single-stream bytes and safe log handling, and test a synthetic local child. No gate/status changes.
