**Full current issue mirror:** [issue-1031.md](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1031.md). The publication checkpoint pins the exact commit.

Publication supplement under #1803, cleanup-2026-11-23-r2: preserve the concurrent #1992 plan below. Main runs [45318044111](https://github.com/skytuhua-org/Gen-V1/actions/runs/45318044111) and [45319348309](https://github.com/skytuhua-org/Gen-V1/actions/runs/45319348309) completed all seven mandatory jobs. Their Browser jobs 138189564451/138193832567 passed host-loop restart in 5.3s/5.7s and durable-effects restart in 7.3s/7.9s. Independent source review supports the bounded #993/#1227 shutdown completion; native lease/MCP/Hermes/plugin effects, cross-process cleanup, #1719 integration and #774 backend acceptance remain separate open gates.

# M01/M02 current-source qualification and M03 core evidence Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans for future assigned implementation, task by task. This review authorizes plan publication only.

**Goal:** M01/M02 current-source qualification and M03 core evidence.

**Architecture:** Use the existing baseline runner, immutable M01/M03 integration controller, Store/Service authority paths and evidence validators.

**Tech Stack:** Existing TypeScript/Node host, synchronous Store and checked-in Vitest/browser tooling; declared native and live lanes require their own approved environments.

**Spec:** Complete relevant v6 clauses are reproduced in REQUIREMENTS below; the source baseline and prior issue context travel with this document.

## Global Constraints

- Declared Node >=24.10.0 and packageManager pnpm10.30.3. Resolve an installed matching executable; no unauthorized toolchain download.
- Preserve the existing lockfile, source ownership and required checks. Product flags default false and remain host-owned.
- Current review is read-only for the repository. Future edits require their assigned owner; current incomplete native/live lanes remain explicit holds.

## Review Focus

- T03: changed source, output root or contract version must prevent a current PASS receipt.
- T04: a setup failure or early cancellation must not be relabeled as a successful negative fixture.
- T05: duplicate tool IDs, unknown versions, unsupported roles and unclassified effects must reject.
- T05: post-approval owner, argument, target or secret revocation must prevent a new dispatch.
- T06/T07: missing native, installed or live observations remain blocked despite successful core fixtures.

## META

Repository: https://github.com/skytuhua-org/Gen-V1. Plan revision `qual-acceptance-r2`. Date2026-11-23 America/Los_Angeles (audit UTC2026-11-24). Baseline `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`; no working branch or implementation claim created by this review. Audit parent [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992), T01/T02/T03. Publication: Reuse [#1031](https://github.com/skytuhua-org/Gen-V1/issues/1031). Status `BLOCKED`. Source provenance: all relevant v6 original C/S/U/T/G clauses, November18 completion follow-ups, and research v3 read; the archive is an acceptance ledger and does not authorize rebuilding merged milestones.

## OBJECTIVE

Retained M01/M02 evidence is tied to execution base055007ff9ab43fc24cfbc0af76b0b4cea3db473d. Exact inspection found15/19 M01 source-lock rows and9/9 M02 rows changed at the audited cut. The old M01 receipt retains six core PASS phases, a blocked platform phase,53/3135 unit failures,29/113 browser failures, missing native/Hermes prerequisites and manifest-only eval. M02 full runtime/native phases remain blocked. M03 has a historical PARTIAL legacy receipt, not a current strict V3 acceptance record. These are missing current proof, not permission to rebuild merged code. Success is source-bound current core/full-app and supported native effect evidence that preserves every historical failure and makes every unobserved path explicit.

## REQUIREMENTS

### Retained original acceptance requirements

The following substantive text is preserved from the supplied v6 archive. It defines acceptance, not permission to repeat its historical implementation sequence. Existing supported code/tests and original owner custody remain in place.

**M01-C01.** ImplementationEvidenceV3: schemaVersion=3, bundleId, baseSha, sourceLockDigest, platform, nodeVersion, packageManagerVersion, phases[], changedFiles[], dependencyContracts[], flags[], remainingGates[], reviewerApproval=false. Each phase stores id, status PASS|FAIL|BLOCKED|NOT_RUN, requiredCases[], commands[] and artifactRefs[]. Bundle status is PASS only when every required phase passes; otherwise FAIL if an observed required case fails, PARTIAL if some phases pass and another is blocked, or BLOCKED if no required phase can run. Release permission is separate and defaults false.

**M01-C02.** CommandEvidence: argv[], cwdIdentity, executableIdentity, startedAt, endedAt, exitCode (integer or null), termination NONE|TIMEOUT|CANCELLED|SPAWN_ERROR, status, boundedLogRef and logDigest. A successful expected-negative fixture is PASS only if its asserted failure was observed. A build that exits nonzero is FAIL, not an expected negative.

**M01-C03.** SourceLockV3: auditAncestorSha, executionBaseSha, inspectedPaths[{path,blobSha}], publicContracts[{name,version,testIds}], acceptedDependencyCommits[] and approvedDrift[]. A file merely named in a prior manifest does not authorize arbitrary subsequent changes.

**M01-G01.** Core infrastructure can pass on the actual development OS. Windows containment, installed-desktop and live-model claims remain explicitly NOT_RUN until tested on their required environments. No performance improvement is claimed from synthetic timings alone.

**M01-G02.** Host-owned flags: No product capability enabled by this bundle. Register only these keys in the shared finite registry; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M01-G03.** Rollback: Remove only the new scripts and registry wiring if necessary. Retain immutable baseline artifacts outside production data. Do not delete existing tests, fixtures or the user checkout.

**M01-S01.** Prepare a dedicated worktree using the execution protocol in this prompt. Confirm the declared package manager and Node range from package.json, rather than installing whichever versions happen to be newest. Resolve the actual package-manager executable. If Corepack is unavailable, an already installed matching pnpm is acceptable; do not download a new toolchain without authorization.

**M01-S02.** Restore only the existing lockfile dependencies with the repository-approved frozen-lockfile command when installation is authorized. Do not modify dependencies or the lockfile. If dependencies, native compiler, browser binaries or isolated Hermes Python dependencies are absent, record the missing prerequisite and stop the affected execution phase. Do not fabricate a clean baseline.

**M01-S03.** Read the existing Store, Service, adapter and browser test entry points before recording public contract checks. Save the current base SHA and blob IDs for every integration path used later. Classify source changes since the audit pin as accepted dependency changes, independently reviewed changes, or unresolved drift. Unresolved changes block writing to the affected integration, not unrelated document analysis.

**M01-S04.** Run typecheck, the complete unit suite, production build and browser suites as separate recorded commands. Use the package.json script definitions. Keep ordinary platform tests separate from native Windows and installed-desktop checks. Preserve prior failures and identify which were baseline failures rather than caused by this branch.

**M01-S07.** Create deterministic crash/race test infrastructure with injectable pause points before admission, before dispatch, after external effect, before settlement and after commit. Keep fault injection in test factories, never a remotely reachable production flag. Include process termination/relaunch, not only thrown exceptions. Use fixed seeds 1, 2, 7, 42 and 99 and count observed external effects.

**M01-S08.** Create an explicit source-to-test mapping. Renames consider both old and new paths. An unknown production path selects the full suite and marks the mapping NEEDS_REVIEW. The quick selector may accelerate development but never replaces full release checks. Filenames are data, never shell fragments.

**M01-S10.** Implement a shared, host-injected capability registry with a finite key set added by the owning bundles. Unknown keys reject; defaults are false. Keep flags out of strict UI preferences and agent/plugin commands. Add only installed bundle keys, not 65 speculative booleans in the verification feature.

**M01-S11.** Adopt OpenHands' expected-failure distinction: a known-bug fixture passes its reproduction check only at the intended assertion with the intended bad value. Setup failure, timeouts and another error are separate failures. Then run the same fixture against the candidate and require the correct assertion to pass.

**M01-S12.** Write the evidence manifest and a dependency-contract checker that verifies accepted commit ancestry, contract version and current contract-test results. Do not embed the final commit SHA in a file belonging to that same commit. Leave application behavior unchanged.

**M01-T01.** Runner fixtures: exit 0, exit 7, missing executable, invalid cwd, timeout, cancellation, truncated output and Unicode/space-containing paths. Assert exact status and child cleanup.

**M01-T02.** Selection fixtures: renamed/deleted files, unmapped source, removed tests and malicious shell-like filenames. No case selects zero tests silently.

**M01-T03.** Manifest fixtures: skipped required suite, stale base SHA, incompatible dependency contract and self-reported PASS with no command evidence all fail validation.

**M01-T04.** Benchmark fixtures: unavailable cache counters remain null; setup failure cannot become a model-quality failure or an expected regression reproduction; fixture seeds reproduce the same control actions.

**M02-C01.** ToolDefinitionV1: id, version, schemaDigest, risk READ|WORKSPACE_WRITE|HOST_EXECUTE|NETWORK_WRITE, replayClass READ_RETRYABLE|PROVIDER_IDEMPOTENT|PROCESS_BOUND|NONREPLAYABLE, allowedRoles[], executorBinding. Definitions are host-owned. Neither a tool annotation nor model arguments can set its own risk or replay class.

**M02-C02.** ToolEffectV1: effectId, invocationId, attemptId, parentInvocationId|null, owner{threadId,runId,epoch,projectId,workspaceId,accountBinding}, toolId, definitionDigest, privateArgumentCommitment, publicRedactedSummary, targetPreconditions[], approvalId|null, state PREPARED|DISPATCHED|SUCCEEDED|FAILED|CANCELLED|DENIED|UNKNOWN_EXTERNAL_OUTCOME, providerReceiptRef|null and timestamps. Retain each state transition; never rewrite a historical event.

**M02-C03.** ApprovalV1: approvalId, operationId, actionCommitment, owner, targetPreconditions, issuedAt, expiresAt, remainingUses=1, issuer=authenticated_user and host authenticator. Authorization returns ALLOW|REQUIRE_APPROVAL|DENY with a stable reason. Raw secrets do not enter commitments exposed to the UI; use private keyed commitments and SecretRef identity.

**M02-C04.** Observation freshness is separate from execution outcome. An old PASS or successful effect remains historical fact; its use for the current run is CURRENT|STALE|INDETERMINATE. Late settlement may be recorded under its original owner without reviving that owner or publishing a current success.

**M02-G01.** M01 core evidence is required. Host-observed paths may be enabled only after coverage tests; unobservable native paths remain labeled and cannot use new verified-effect claims. OS confinement is not established by this bundle.

**M02-G02.** Host-owned flags: audit.effectsV1, security.authorityV1. Register only these keys in the shared finite registry; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M02-G03.** Rollback: Disable new admissions, drain or mark outstanding effects uncertain, preserve the ledger and compatibility reads. Never erase consumed approvals or replay old pending writes as part of rollback.

**M02-S01.** Inventory all tool entry points by runtime and actor. Include Service host tools, source-owned Hermes skill calls, planning children, official MCP and plugins. Write an explicit coverage table. Unobservable native calls are COVERAGE_GAP, not reconstructed from chat messages.

**M02-S02.** Create strict contracts and a registry of every executable host tool. Reject duplicate identifiers, unknown schema versions, unsupported roles and unclassified effect types. Keep current restrictive allowlists in force throughout migration.

**M02-S03.** Implement a pure authorization decision using host-resolved actor, current run epoch, account binding, project/workspace identity, grants, target preconditions and approval. The caller supplies an opaque invocation request, not trusted authority fields. Recheck authorization immediately before dispatch after asynchronous preparation.

**M02-S04.** Generate exact approval previews through the existing authenticated operation UI. Bind all effect-bearing arguments, executable identity, cwd, target revision and schema version. Changing any of these invalidates the approval. A human question response is not approval for a different operation.

**M02-S05.** Persist admission and consume a single-use approval in one synchronous Store transaction. Store rejects asynchronous transaction callbacks; perform external work only after commit. Use a second synchronous transaction for settlement. If admission persistence fails, do not dispatch.

**M02-S07.** Coalesce concurrent duplicate invocation IDs only when owner and exact arguments match. Different content under the same ID returns CONFLICT. Return the prior receipt when it exists; never repeat a mutation merely to reconstruct output.

**M02-S09.** Implement read-only reconcilers that inspect an owned process identity or provider receipt. An authenticated operator resolution is a new record labeled as such, not a forged original executor response. Process disappearance does not prove success.

**M02-S10.** Keep cancellation and effect certainty distinct. Cancellation prevents new dispatch and publication, but already submitted effects can still settle historically. Record remaining uncertainty; never label a cancelled run as having made no changes without proof.

**M02-S11.** Expose bounded read-only invocation and observation pages through the existing inspection/read-model boundary. Cursors bind owner, filters and an immutable upper event sequence. Unauthorized callers cannot probe another account's receipt existence.

**M02-S12.** Add fault hooks at every durability boundary and count effects in the fake external system. Test hard process termination. Additive flags audit.effectsV1 and security.authorityV1 remain false until their adapter coverage and regression gates pass.

**M02-T01.** Same ID/same payload retry returns one receipt; same ID/changed payload is denied. Two simultaneous approval consumers cause at most one dispatch.

**M02-T02.** Change argument, cwd, account, workspace identity, schema, grant or epoch after approval. Each case denies before external dispatch.

**M02-T03.** Crash at prepare/dispatch/effect/settlement/commit. Count actual effects; uncertain writes are not automatically repeated.

**M02-T04.** Archive parent during a running child: retain historical result if observed, but no current result publication or revived grant.

**M02-T05.** Append events while paginating and switch owner. No missing/duplicate entries within the declared snapshot and no cross-owner data.

**M02-U01.** Add an Action details drawer to the existing operation/review view: requested action, exact target, owner, approval expiry, dispatch state, result and uncertainty. Secret values are never shown.

**M02-U02.** For UNKNOWN_EXTERNAL_OUTCOME show Inspect outcome and View evidence. Do not show an enabled generic Retry action. Re-authorized retry is available only after the host establishes a retryable class and presents a new exact action.

**M02-U03.** Show a coverage note when native execution is not observed; do not use a green all-tools-audited badge.

**M03-C01.** ProjectTrustV1 binds canonical physical root identity, approved executable/configuration digests, scope, user decision and revision. Reading ordinary granted text remains distinct from executing its configuration. Root aliases or changed executable bytes invalidate the applicable decision.

**M03-C02.** SecretRefV1 exposes only opaque ID, purpose, owner and permitted destination. Resolution occurs inside the authorized executor after approval. Secret values, raw environment dumps and low-entropy secret hashes never enter model context or public journals.

**M03-G02.** Host-owned flags: security.projectTrustV1, security.secretRefsV1, security.executionProfilesV1. Register only these keys in the shared finite registry; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M03-G03.** Rollback: Revoke new execution profiles and stop owned children; keep original account stores and historical trust/audit records. Restore legacy credential read only after verified compatibility; never loosen an existing policy to recover availability.

**M03-S01.** Inventory current credential storage, environment inheritance, plugin import and process launch call sites. Record metadata only. Keep native account stores canonical; do not migrate or delete credentials merely to introduce SecretRef.

**M03-S02.** Implement trust records and pre-dispatch digest checks. Treat repository instructions as data until explicitly loaded under a scoped policy; never execute hooks, setup scripts or MCP launches just because an AGENTS.md or package file names them.

**M03-S03.** Use canonical root plus existing path-identity guards, including Windows reparse/junction and hardlink cases. Reject unresolved aliases at execution time. A path string prefix is not an authority check.

**M03-S04.** Implement exact executable/argv/cwd classification for shell launches. First version accepts already approved executable argv, not a newly written general shell parser. Arbitrary shell expressions remain a single effectful command requiring explicit approval and confinement. Unknown syntax cannot become read-only by a regex match.

**M03-S05.** Resolve SecretRefs only for the smallest authorized process or HTTP destination. Start children from an explicit environment allowlist rather than copying process.env. Revocation prevents subsequent use, while already delivered external secrets cannot be retroactively undisclosed.

**M03-S10.** Add an advisory risk classifier only after the deterministic authority decision. It can explain why approval is required but never convert DENY to ALLOW. Store its model/version and uncertainty as non-authoritative metadata.

**M03-T01.** Executable changes after approval, root retargets and unknown shell grammar deny before spawn. Reading an ordinary granted text file still works.

**M03-T02.** Credential revocation blocks the correct account without invalidating unrelated accounts. Children do not inherit host-wide secrets.

**M03-U01.** Trust dialog shows project root, executable/config digests, requested read/write/network scope and separate choices Decline and Trust these bytes. It must not imply trust authorizes every future write.

**M03-U02.** Execution status shows actual backend and policy, with Unrestricted host unmistakably separate from Isolated. Missing backend explains which stage is blocked.

**M03-U03.** Approval advice appears below the deterministic decision with an Advisory label. Secret settings show reference names and destinations, never a reveal-by-agent control.

### Scope, user flow and compatibility

Full application commands are separate, not chained into one success. Current typecheck/lint use bun; preflight must verify it rather than substitute tsc. Current pnpm test includes build:credential-lease and build:widgets; test:no-lease is not a silent substitute for full acceptance. Browser runner accepts a named registered suite, not arbitrary test filenames. Native command/installed package must be read from the exact existing workflow and backend/source lock; no invented privileged command appears here. Actual scope of this plan excludes implementation of missing native APIs and excludes live evaluation authority.

This audit authorizes only review and plan publication. Future repository edits, dependency restoration, privileged test execution and live-account spending require the corresponding existing assignment/input. Existing canonical issues and PRs retain custody until explicit release; no concurrent writer is created by this document. Do not delete retained artifacts/tests or change strict UI preferences. Positive normal behavior, denial reasons, cancellation, restart, rollback and current/historical distinctions below are required; no all-tools, all-platforms or universal-redaction claim.

## REPO_MAP

- [apps/server/effect-service.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/effect-service.ts)
- [apps/server/host.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/host.ts)
- [apps/server/integration-host.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/integration-host.ts)
- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/App.tsx)
- [apps/web/src/IntegrationSecretReferences.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/IntegrationSecretReferences.tsx)
- [apps/web/src/OperationExecutionReview.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/OperationExecutionReview.tsx)
- [apps/web/src/OperationProjectTrust.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/OperationProjectTrust.tsx)
- [docs/implementation/v3/M01-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M01-verification.json)
- [docs/implementation/v3/M02-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M02-verification.json)
- [docs/implementation/v3/M03-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M03-verification.json)
- [docs/implementation/v3/source-lock.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/source-lock.json)
- [package.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/package.json)
- [packages/capabilities/index.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/capabilities/index.ts)
- [packages/capabilities/process.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/capabilities/process.ts)
- [packages/capabilities/repository-test-binding.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/capabilities/repository-test-binding.ts)
- [packages/contracts/execution-profile.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/execution-profile.ts)
- [packages/contracts/implementation-evidence.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/implementation-evidence.ts)
- [packages/contracts/tool-effects.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/tool-effects.ts)
- [packages/core/capability-flags.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/capability-flags.ts)
- [packages/core/effect-recovery.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/effect-recovery.ts)
- [packages/core/execution-policy.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/execution-policy.ts)
- [packages/core/file-access.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/file-access.ts)
- [packages/core/host-flags.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/host-flags.ts)
- [packages/core/operation-execution-advice.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/operation-execution-advice.ts)
- [packages/core/operation-project-trust.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/operation-project-trust.ts)
- [packages/core/project-trust.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/project-trust.ts)
- [packages/core/secret-references.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/secret-references.ts)
- [packages/core/service.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts)
- [packages/core/tool-authority.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/tool-authority.ts)
- [packages/core/tool-effect-read-models.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/tool-effect-read-models.ts)
- [packages/core/tool-effects.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/tool-effects.ts)
- [packages/integrations/context7-secret-reference.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/integrations/context7-secret-reference.ts)
- [packages/integrations/index.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/integrations/index.ts)
- [packages/storage/store.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/storage/store.ts)
- [packages/workspace/github.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/workspace/github.ts)
- [pnpm-lock.yaml](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/pnpm-lock.yaml)
- [scripts/research-baseline.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/research-baseline.ts)
- [scripts/select-regression-tests.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/select-regression-tests.ts)
- [scripts/test-browser.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/test-browser.ts)
- [scripts/validate-m01-m03-integration.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/validate-m01-m03-integration.mjs)
- [scripts/verify-readiness.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/verify-readiness.ts)
- [tests/fixtures/tool-effect-crash-worker.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/fixtures/tool-effect-crash-worker.mjs)
- [tests/research-baseline.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/research-baseline.test.ts)
- [tests/tool-effect-hard-crash-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-hard-crash-v3.test.mjs)

Existing mapped tests, definitions only until actually executed:

- [scripts/validate-m01-m03-integration.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/validate-m01-m03-integration.test.mjs)
- [tests/baseline-package-manager-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/baseline-package-manager-v3.test.ts)
- [tests/dependency-contract-execution-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/dependency-contract-execution-v3.test.ts)
- [tests/e2e/integration-secret-references.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/e2e/integration-secret-references.spec.ts)
- [tests/e2e/operation-execution-advice.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/e2e/operation-execution-advice.spec.ts)
- [tests/e2e/project-trust-review.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/e2e/project-trust-review.spec.ts)
- [tests/e2e/tool-effect-details.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/e2e/tool-effect-details.spec.ts)
- [tests/e2e/tool-effects-host.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/e2e/tool-effects-host.spec.ts)
- [tests/effect-recovery-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/effect-recovery-v3.test.ts)
- [tests/evidence-aggregation-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/evidence-aggregation-v3.test.ts)
- [tests/execution-boundary-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/execution-boundary-v3.test.ts)
- [tests/integration-secret-reference-contract-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/integration-secret-reference-contract-v3.test.ts)
- [tests/integration-secret-reference-http-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/integration-secret-reference-http-v3.test.ts)
- [tests/operation-evidence.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/operation-evidence.test.ts)
- [tests/operation-execution-advice-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/operation-execution-advice-v3.test.mjs)
- [tests/operation-project-trust-http-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/operation-project-trust-http-v3.test.ts)
- [tests/operation-project-trust-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/operation-project-trust-v3.test.ts)
- [tests/project-trust-custody-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/project-trust-custody-v3.test.ts)
- [tests/project-trust-hardlinks-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/project-trust-hardlinks-v3.test.ts)
- [tests/project-trust-persistence-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/project-trust-persistence-v3.test.ts)
- [tests/project-trust-verification-races-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/project-trust-verification-races-v3.test.mjs)
- [tests/readiness-manifest.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/readiness-manifest.test.ts)
- [tests/regression-selection-keys-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/regression-selection-keys-v3.test.ts)
- [tests/regression-selection.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/regression-selection.test.ts)
- [tests/research-baseline.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/research-baseline.test.ts)
- [tests/secret-approval-lifetime-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/secret-approval-lifetime-v3.test.ts)
- [tests/secret-custody-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/secret-custody-v3.test.ts)
- [tests/secret-resolution-races-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/secret-resolution-races-v3.test.ts)
- [tests/server-tool-effect-read.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/server-tool-effect-read.test.ts)
- [tests/source-lock-ancestry-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/source-lock-ancestry-v3.test.ts)
- [tests/source-lock-drift-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/source-lock-drift-v3.test.ts)
- [tests/tool-effect-admission-owner-race-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-admission-owner-race-v3.test.mjs)
- [tests/tool-effect-approval-review-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-approval-review-v3.test.mjs)
- [tests/tool-effect-authentication-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-authentication-v3.test.mjs)
- [tests/tool-effect-hard-crash-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-hard-crash-v3.test.mjs)
- [tests/tool-effect-late-progress-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-late-progress-v3.test.mjs)
- [tests/tool-effect-operation-owner-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-operation-owner-v3.test.ts)
- [tests/tool-effect-public-projection-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-public-projection-v3.test.mjs)
- [tests/tool-effect-read-owner-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-read-owner-v3.test.ts)
- [tests/tool-effect-replay-authority-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-replay-authority-v3.test.ts)
- [tests/tool-effect-replay-owner-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-replay-owner-v3.test.ts)
- [tests/tool-effect-rollback-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-rollback-v3.test.mjs)
- [tests/tool-effect-snapshot-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-snapshot-v3.test.ts)
- [tests/tool-effects-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effects-v3.test.ts)

Exact finding anchors:

- [docs/implementation/v3/source-lock.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/source-lock.json)
- [docs/implementation/v3/M02-source-lock.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M02-source-lock.json)
- [docs/implementation/v3/M01-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M01-verification.json)
- [docs/implementation/v3/M02-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M02-verification.json)
- [docs/implementation/v3/M03-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M03-verification.json)
- [scripts/validate-m01-m03-integration.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/validate-m01-m03-integration.mjs#L20-L80)

## DESIGN

Use the existing baseline runner, immutable M01/M03 integration controller, Store/Service authority paths and evidence validators. Qualify one accepted final source cut; do not assemble arbitrary historical PR heads into an undocumented candidate. Existing repairs must pass their independent review and ownership gates before they become inputs. Re-run affected consumers after integration, while preserving results from earlier cuts as history.

Keep four independent lanes: core contracts/fixtures on actual development OS; full application/browser scripts; installed/native effect authority; and M03 core trust/secret/UX. Paired live work and actual confinement have their own child/canonical plans and cannot be inferred here. Record HOLD_* strings in remainingGates, never invent schema enums. V3 bundle status is computed; reviewerApproval remains false. Preserve M03 legacy format unless its existing accepted controller/migration is identified; otherwise only that format lane holds at HOLD_CONTRACT_SHAPE.

No production source change is planned here. Evidence output is an exclusive new directory with bounded redacted command logs. Future reviewed evidence paths are docs/implementation/v6/M01/qualification-current.json, docs/implementation/v6/M02/qualification-current.json and docs/implementation/v6/M03/qualification-current.json (proposed, not existing files); do not overwrite retained v3 receipts. A failing case is reported to its existing exact owner, rather than repaired by broadening this qualification scope.

## EXECUTION_DAG

Stable task IDs are local to this plan. Every task inherits the fixed source, owner, no-activation and evidence rules above. Task-specific files marked proposed or discovery are not represented as existing repository facts. No blocked provider/backend/interface choice is delegated to an implementer.

### T01: Bind custody and final candidate

**Dependencies:** None.

**Exact files or discovery scope:** AGENTS.md; CONTRIBUTING.md; package.json; existing #1031 journal and candidate PRs.

**Inputs:** Exact assigned source cut/worktree, current issue journal, full plans and existing repair releases.

**Executable steps:**

- [ ] Read entire #1031 and latest #1955/#1956/#1957/#1972 journals; verify main/PR base/head ancestry and clean tree; assign verifier-only custody; record unresolved dependencies and do not overwrite active owners.

- [ ] Refresh #1172/#1181/#1193/#1634/#1719 metadata, not stale body heads.

**Outputs:** Source/owner matrix and immutable accepted candidate identity.

**Positive, negative and lifecycle validation:** Positive known source match; negative tree/head/PR-head mismatch blocks affected lane. No code or activation.

**Done when:** Every consumed dependency has exact source identity and accepted handoff; active #1956 remains untouched.

**Ownership and handoff:** Qualification owner; hand source matrix to T02/T03 and root coordinator.

### T02: Resolve exact installed prerequisites

**Dependencies:** T01.

**Exact files or discovery scope:** package.json; pnpm-lock.yaml; scripts/research-baseline.ts; scripts/verify-readiness.ts.

**Inputs:** Declared Node>=24.10.0, pnpm10.30.3; exact preinstalled tools/compiler/browser/native runtime.

**Executable steps:**

- [ ] Resolve actual package-manager executable offline and verify exact version; inventory bun used by current scripts, existing dependencies, credential-lease compiler, browsers and isolated Hermes runtime.

- [ ] Restore frozen lockfile dependencies only when separately authorized.

- [ ] Missing input stops only consuming lane.

- [ ] Never use provisioned11.25.0 or download a new toolchain to force execution.

**Outputs:** Prerequisite receipt with actual paths/versions and named holds.

**Positive, negative and lifecycle validation:** Missing/mismatched pnpm and invalid cwd/executable must stay BLOCKED; no successful command implied by setup.

**Done when:** All available lanes have verified prerequisites; unavailable lanes report explicit missing component/provider.

**Ownership and handoff:** Environment owner supplies tools; verifier owns receipt; hand available lanes to T03-T06.

### T03: Verify source/output custody and baseline semantics

**Dependencies:** T01,T02.

**Exact files or discovery scope:** scripts/validate-m01-m03-integration.mjs; scripts/validate-m01-m03-integration.test.mjs; scripts/research-baseline.ts; packages/contracts/implementation-evidence.ts; source-lock tests.

**Inputs:** Accepted source root and new evidence root, existing contract/test IDs.

**Executable steps:**

- [ ] Run existing custody fixtures first; compare each consumed lock row and classify accepted dependency/reviewed change/unresolved drift; exercise ancestry/contract versions/current results.

- [ ] Confirm stale base, incompatible contract, removed test, missing required command and self-reported PASS are rejected.

- [ ] Preserve exact launch/output identity through creation; do not weaken public-source checks.

- [ ] Verify the existing finite host capability registry rejects unknown keys, registers only installed owner keys and keeps defaults false; inspect actual host composition, strict UI preferences and agent/plugin command boundaries without consolidating M03 flag ownership.

**Outputs:** Current source map, command/case receipts and drift disposition.

**Positive, negative and lifecycle validation:** Positive unchanged tree/current contract; negative root retarget, changed HEAD, replaced output, incompatible version, required skipped suite and forged PASS. Node controller suite plus named source/evidence tests. Unknown flag keys reject, every retained risky key defaults false, and a successful core fixture cannot turn on another capability.

**Done when:** All consumed identities and output ownership verified; no manifest claims unsupported by command results.

**Ownership and handoff:** Verifier only; runtime sink failures to LOG owner; evidence handoff to T07.

### T04: Run mapped M01 offline workload and selection cases

**Dependencies:** T03.

**Exact files or discovery scope:** tests/research-baseline.test.ts; baseline-package-manager/command-timeout/workloads/oversized-output/concurrent-edits/memory-conflict/cancellation-v3 tests; scripts/select-regression-tests.ts.

**Inputs:** Existing fixture definitions, fixed seeds1,2,7,42,99, unchanged budgets.

**Executable steps:**

- [ ] Execute exact named fixtures.

- [ ] Require child readiness barrier before timing, actual abort settlement, no owned child leaks, bounded retrieved output and explicit edit/memory conflicts.

- [ ] Verify 100/500-tool and long-session fixture labels.

- [ ] Exercise old+new rename names, deleted/unknown paths and shell-like filenames; full fallback cannot select zero silently.

- [ ] Retain null unavailable measurements and OFFLINE_CORE_ONLY labels.

**Outputs:** Source-bound offline outcomes; command/case counts and bounded logs.

**Positive, negative and lifecycle validation:** Exit0/7, missing executable/cwd, timeout/cancel, truncation/Unicode; negative setup failure stays setup failure, expected regression passes only intended assertion; repeat seeded control actions.

**Done when:** Offline matrix passes or each failure is retained with exact case/source; no synthetic performance/model-quality claim.

**Ownership and handoff:** M01 verifier; hand live-only observations to PAIR scope, not this task.

### T05: Qualify M02 and M03 through actual Service boundaries

**Dependencies:** T03; accepted RECOVERY/SECRET repairs for affected cases.

**Exact files or discovery scope:** packages/core/service.ts; tool-effects/effect-recovery/tool-effect-read-models/project-trust/operation-project-trust/secret-references; apps/server/effect-service.ts; existing tests named below; packages/contracts/tool-effects.ts; packages/core/tool-authority.ts; tests/tool-effects-v3.test.ts.

**Inputs:** Protected synthetic host profile, exact same action/owner, grants and signer custody; existing authenticated test entry.

**Executable steps:**

- [ ] Inspect ToolDefinitionV1 and ToolRegistry at the current source.

- [ ] Run tests/tool-effects-v3.test.ts with one valid host definition and restrictive role allowlist as the positive control.

- [ ] Exercise duplicate tool IDs, unsupported schema versions, unsupported roles and unclassified effect types, asserting rejection before executor count can increase.

- [ ] Model/tool annotations must not alter host risk, replayClass, executorBinding or allowedRoles.

- [ ] Preserve existing definitions and allowlists; qualify their current behavior without creating a second registry.

- [ ] Run direct-ledger and Service operation admission, approval-review, replay-owner, admission race, authenticated issuance, immutable snapshot and public projection suites.

- [ ] Test one exact dispatch, zero mismatched dispatch and at-most-one grant consumer.

- [ ] Run trust/secret races through normal Service launch, account isolation, after-resolver revocation, actual supported-token redaction and no short-token spawn.

- [ ] UI tests must mount existing drawers and reject stale responses.

**Outputs:** Per-entry coverage table and actual observations; no all-tools badge.

**Positive, negative and lifecycle validation:** Change args/cwd/account/workspace/definition/grant/epoch; append while paging then owner switch; archive running parent and late child; root/executable swap/revoke after preparation; normal text/read and approved exact action positive controls. Valid host-owned definition reaches only its declared executor; duplicate IDs, unknown versions, unsupported roles, unclassified effects and caller-supplied authority metadata produce zero dispatch.

**Done when:** Every supported host entry has positive and deny/cancel/history proof; unobservable native calls stay COVERAGE_GAP.

**Ownership and handoff:** Verifier consumes owned fixes; #1955 transaction/#1956 outbox/#1957 native owners retain changes.

### T06: Run complete app and actual supported native lanes

**Dependencies:** T02-T05.

**Exact files or discovery scope:** package.json scripts; scripts/verify-readiness.ts; existing Windows workflow and installed launcher discovered from its exact source lock.

**Inputs:** Approved installed build/host account/signing custody/native runtime and supported platform.

**Executable steps:**

- [ ] Run exact package scripts as separate commands.

- [ ] Use declared browser channel and existing Windows/installed lane.

- [ ] For native effect paths prove original admitted owner, signed single-use approval, durable receipt and hard-kill/restart effect count through actual host.

- [ ] Missing hooks or signer custody yield HOLD_NATIVE_AUTHORITY_PROOF.

- [ ] Keep native containment #774 distinct.

- [ ] On failure compare unchanged baseline with identical environment once; never relabel setup failure as regression pass.

**Outputs:** Current full-app and native receipts, failures, missing-case inventory.

**Positive, negative and lifecycle validation:** Actual hard kill at five durability boundaries; positive observed owned call; stale/forged grant zero dispatch; cancel prevents new admission and late publication while retaining known historical outcome.

**Done when:** Every required supported lane ran and passed on final source, or truthful explicit blocker remains; no milestone100% claim while any required lane missing.

**Ownership and handoff:** Platform/native verifier after exact operator inputs; hand immutable evidence to T07.

### T07: Validate receipts and publish criterion matrix

**Dependencies:** T03-T06.

**Exact files or discovery scope:** packages/contracts/implementation-evidence.ts; existing v3 receipts; proposed docs/implementation/v6/M01,M02,M03 qualification records.

**Inputs:** Exact command results/log digests, source lock and original clause matrix.

**Executable steps:**

- [ ] Use accepted validator and bundleStatus for V3; preserve legacy M03 and identify controller.

- [ ] Link actual argv/cwd/executable/start/end/exit/termination/logDigest, exact test totals and hold reasons.

- [ ] Separate code presence, verification, activation and independent platform/live gates.

- [ ] Retain previous failures and null counters.

- [ ] Publish complete acceptance record through assigned normal review only; user audit does not itself authorize repo writes.

**Outputs:** Reviewable current-source qualification report and complete remaining-gate table.

**Positive, negative and lifecycle validation:** Negative evidence mutations: missing required suite, mismatched SHA/log digest, wrong contract or self-reported PASS all reject. Read back published body/artifacts.

**Done when:** No omitted clause and no status promoted by source hash alone; exact recipient ACK; separate activation false.

**Ownership and handoff:** Qualification owner to #1031 coordinator; independent reviewer decides acceptance, not this audit.

## VALIDATION

### Reproducible setup and planned commands

The asset-build commands below are prerequisites for their consuming tests. Build widgets before App/widget-dependent focused tests. The native credential-lease build is required for its native/full-test lane; a missing compiler blocks that lane rather than authorizing test:no-lease as release evidence. Run from the exact assigned candidate repository root, with declared Node>=24.10.0 and actual pnpm10.30.3 resolved offline. Record executable identity, cwd physical identity, source/tree, UTC start/end, exit/termination, per-case totals and bounded redacted log digest for each command. Missing tools/dependencies/native compiler/browser/Hermes environment mean the consuming lane is BLOCKED/NOT_RUN. No new toolchain download, substitutions or changed lockfile. All following commands are **planned and NOT_RUN by this audit**, except the separately identified existing Node control suite.

```text
node --version
pnpm --version
pnpm build:widgets
pnpm build:credential-lease
pnpm exec vitest run tests/tool-effects-v3.test.ts --maxWorkers=1
node --test scripts/validate-m01-m03-integration.test.mjs
pnpm exec vitest run tests/research-baseline.test.ts tests/baseline-package-manager-v3.test.ts tests/baseline-command-timeout-v3.test.ts tests/baseline-workloads-v3.test.ts tests/baseline-oversized-output-v3.test.ts tests/baseline-concurrent-edits-v3.test.ts tests/baseline-memory-conflict-v3.test.ts tests/baseline-cancellation-v3.test.ts tests/source-lock-drift-v3.test.ts tests/source-lock-ancestry-v3.test.ts tests/evidence-aggregation-v3.test.ts tests/dependency-contract-execution-v3.test.ts tests/regression-selection.test.ts tests/regression-selection-keys-v3.test.ts --maxWorkers=1
pnpm exec vitest run tests/tool-effect-operation-owner-v3.test.ts tests/tool-effect-replay-owner-v3.test.ts tests/tool-effect-replay-authority-v3.test.ts tests/tool-effect-authentication-v3.test.mjs tests/tool-effect-approval-review-v3.test.mjs tests/tool-effect-admission-owner-race-v3.test.mjs tests/tool-effect-hard-crash-v3.test.mjs tests/effect-recovery-v3.test.ts tests/tool-effect-public-projection-v3.test.mjs tests/tool-effect-read-owner-v3.test.ts tests/tool-effect-snapshot-v3.test.ts tests/tool-effect-late-progress-v3.test.mjs tests/tool-effect-rollback-v3.test.mjs --maxWorkers=1
pnpm exec vitest run tests/project-trust-verification-races-v3.test.mjs tests/operation-project-trust-v3.test.ts tests/operation-project-trust-http-v3.test.ts tests/project-trust-custody-v3.test.ts tests/project-trust-hardlinks-v3.test.ts tests/secret-custody-v3.test.ts tests/secret-resolution-races-v3.test.ts tests/secret-approval-lifetime-v3.test.ts tests/integration-secret-reference-contract-v3.test.ts tests/integration-secret-reference-http-v3.test.ts tests/integration-secret-output-v3.test.mjs tests/operation-execution-advice-v3.test.mjs --maxWorkers=1
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
| A01 | Source/toolchain/identity | T01-T03 | Exact source/output and matching installed tools or explicit lane hold; no drift silently accepted |
| A02 | M01 offline semantics | T03,T04 | All named positive/negative/barrier/timeout/cancel/selection cases source-bound |
| A03 | M02 current authority and history | T05,T06 | One admitted effect, zero denied effects; signed restart, snapshot owner and historical settlement correct |
| A04 | M03 core trust/secret/UI | T05 | Normal Service pre-spawn checks, revocation, redaction and visible statuses match actual source |
| A05 | Full app/native and honest evidence | T06,T07 | Distinct observed complete commands and native receipts; missing lanes blocked; no activation |
| A06 | Host definitions, finite flags and migration safety | T03,T05,T07 | ToolDefinitionV1 and registry strictness observed; invalid IDs/versions/roles/effects zero dispatch; host-only finite flags default false |

### Requirement-to-task completeness

| Original requirement | Task coverage | Acceptance |
|---|---|---|
| M01-C01 | T03, T07 | A01, A05 |
| M01-C02 | T03, T04, T06, T07 | A01, A02, A05 |
| M01-C03 | T01, T03, T07 | A01 |
| M01-G01 | T02, T06, T07 | A05 |
| M01-G02 | T03, T07 | A06 |
| M01-G03 | T07 | A05 |
| M01-S01 | T02 | A01 |
| M01-S02 | T02 | A01 |
| M01-S03 | T01, T03, T07 | A01 |
| M01-S04 | T06, T07 | A05 |
| M01-S07 | T04, T05, T06 | A02, A03 |
| M01-S08 | T04 | A02 |
| M01-S10 | T03 | A06 |
| M01-S11 | T04, T06, T07 | A02, A05 |
| M01-S12 | T03, T07 | A01, A05 |
| M01-T01 | T04 | A02 |
| M01-T02 | T04 | A02 |
| M01-T03 | T03, T07 | A01, A05 |
| M01-T04 | T04 | A02 |
| M02-C01 | T05 | A06 |
| M02-C02 | T05, T06 | A03 |
| M02-C03 | T05, T06 | A03 |
| M02-C04 | T05, T06 | A03 |
| M02-G01 | T06, T07 | A05 |
| M02-G02 | T03, T05, T07 | A06 |
| M02-G03 | T05, T06, T07 | A03, A05 |
| M02-S01 | T05, T06 | A03 |
| M02-S02 | T05 | A06 |
| M02-S03 | T05, T06 | A03 |
| M02-S04 | T05, T06 | A03 |
| M02-S05 | T05, T06 | A03 |
| M02-S07 | T05, T06 | A03 |
| M02-S09 | T05, T06 | A03 |
| M02-S10 | T05, T06 | A03 |
| M02-S11 | T05 | A03 |
| M02-S12 | T05, T06 | A03 |
| M02-T01 | T05, T06 | A03 |
| M02-T02 | T05, T06 | A03 |
| M02-T03 | T05, T06 | A03 |
| M02-T04 | T05, T06 | A03 |
| M02-T05 | T05 | A03 |
| M02-U01 | T05, T06 | A03 |
| M02-U02 | T05, T06 | A03 |
| M02-U03 | T05, T06 | A03 |
| M03-C01 | T05 | A04 |
| M03-C02 | T05 | A04 |
| M03-G02 | T03, T05, T07 | A06 |
| M03-G03 | T05, T07 | A04, A05 |
| M03-S01 | T05 | A04 |
| M03-S02 | T05 | A04 |
| M03-S03 | T05 | A04 |
| M03-S04 | T05 | A04 |
| M03-S05 | T05 | A04 |
| M03-S10 | T05 | A04 |
| M03-T01 | T05 | A04 |
| M03-T02 | T05 | A04 |
| M03-U01 | T05 | A04 |
| M03-U02 | T05 | A04 |
| M03-U03 | T05 | A04 |


### Actually executed in this read-only audit

Source/issue/PR-body inspection and exact repository blob comparisons were performed. Existing dependency-free `node --test scripts/validate-m01-m03-integration.test.mjs` passed4/4 with0 fail/skip/cancel on the audited SHA; latest duration2451.852311ms and raw log are in the external audit evidence. This only tests the immutable control harness with owned synthetic fixtures. It does not prove this plan’s product behavior. Product Vitest/typecheck/lint/build/browser/native/live commands are NOT_RUN: required pnpm10.30.3 and node_modules are absent, available pnpm11.25.0 mismatches. Node24.22.3 is available. `HOLD_TOOLCHAIN` remains. No source-only or candidate-body historical result is reported as current acceptance.

### Release gate and rollback

All applicable required cases must pass on the final integrated source, and every unavailable platform/live/input lane remains explicitly blocked. Validate current V3 evidence with the existing owner and computed status; hold undefined legacy migration at HOLD_CONTRACT_SHAPE. `reviewerApproval=false` and all unproven host flags remain off. Passing a fixture, producing a source hash, or merging a PR is insufficient for deployment/activation. Rollback preserves account/trust/ledger/approval records and earlier evidence; disable only new admissions/wiring and stop owned children where supported, without deleting unrelated files or repeating uncertain effects.

## STATE

Researched and decided: exact reviewed source, original requirements, current production/caller gaps, ownership and safe blocked-input handling. Implemented by this audit: none. Verified by this audit: source inventory/metadata and four dependency-free control tests only. Pending: task-specific committed execution, candidate compatibility, exact-head CI, independent review, and any named operator/backend/provider/live inputs. Existing implementation PRs remain open until GitHub metadata proves otherwise; stale body heads or queued jobs are not acceptance. Latest publication owner is root coordinator `codex-cloud-ca7d38`; original source reviewer is `codex-cloud-m0103-ac1a13`; final artifact reviewer is `codex-cloud-m0103-finish-e71314`. No assignee or implementation custody transferred by this file.

First executable next step is T01. It is read-only scope/source/owner/input reconciliation. The actual GitHub filechooser upload failed in the coordinator environment. This plan is a real UTF-8 .md file for the deliverables, but it is not represented as a hosted GitHub attachment. No repository-docs commit is authorized. The complete canonical issue body is the required durable fallback. Current audit deliverable remains HANDOFF_INCOMPLETE until the coordinator publishes this complete body and reads it back, with actual file attachment if available or an honest attachment limitation. A local path alone is not durable issue handoff. Every future worker posts START/20-minute and milestone checkpoints and final RELEASE OWNER=NONE on its canonical issue/parent, preserving previous failed attempts.

## REFERENCES

- [#1031](https://github.com/skytuhua-org/Gen-V1/issues/1031)
- [#1972](https://github.com/skytuhua-org/Gen-V1/issues/1972)
- [#1955](https://github.com/skytuhua-org/Gen-V1/issues/1955)
- [#1956](https://github.com/skytuhua-org/Gen-V1/issues/1956)
- [#1957](https://github.com/skytuhua-org/Gen-V1/issues/1957)
- [#299](https://github.com/skytuhua-org/Gen-V1/pull/299)
- [#293](https://github.com/skytuhua-org/Gen-V1/pull/293)
- [#303](https://github.com/skytuhua-org/Gen-V1/pull/303)
- [#292](https://github.com/skytuhua-org/Gen-V1/pull/292)
- [#779](https://github.com/skytuhua-org/Gen-V1/pull/779)
- [#799](https://github.com/skytuhua-org/Gen-V1/pull/799)
- [#802](https://github.com/skytuhua-org/Gen-V1/pull/802)

- [Audit source tree](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b)
- [Repository coordination and full-plan contract](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [Contribution requirements](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)

The supplied v6 source clauses necessary to execute this plan are reproduced in REQUIREMENTS. Completion appendix substance is preserved in exact current source binding, complete owner/action checks, proper barriers/real cancellation, actual installed/live evidence, no invented backend/provider, and preservation of prior failures. Research rationale is summarized here: committed host authority and real external receipts outrank narratives; minimum destination-bound secret delivery is separate from process isolation; paired measured outcomes must retain denominators, costs and uncertainty. Research does not authorize a donor implementation or replace a platform proof.

## PRESERVED_ORIGINAL_ISSUE_BODY

The complete issue body read on 2026-11-24 is retained below verbatim. Its prior task IDs are historical; the current executable task IDs and source identities are above. Existing comments, claims, PR histories and release permissions remain authoritative. The prior checked-in plan remains available at [docs/agent-plans/1031-m01-m02-reconcile-native-and-combined-runtime-accept.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/agent-plans/1031-m01-m02-reconcile-native-and-combined-runtime-accept.md). This revision expands acceptance detail without deleting prior obligations.

<!-- m-series-scope:m01-m02-current-evidence -->
## Outcome and scope

Current-source M01 evidence custody and M02 combined-runtime/Windows acceptance. Keep original manifests and historical failures. M03 production backend approval stays in #774.

## Completion criteria

- [ ] **T01** Map each M01 and M02 pending native/combined gate to the current source and latest applicable receipts. Preserve both historical manifest bases.
- [ ] **T02** Reconcile MSVC/native lease, combined full-app and authenticated operation evidence against their exact execution cuts. Explicitly record missing Hermes and integration sub-effects.
- [ ] **T03** Publish a reviewed current-source evidence disposition. Ordinary CI cannot substitute for unrun native cases or release approval.

## Ownership and current state

Existing owner or dependency owner: M01/M02 evidence owners. Existing #774 comments already reference both older manifests but do not own their acceptance work. This issue keeps shared evidence reconciliation apart from the M03 backend gate.



## References

- [PR #749](https://github.com/skytuhua-org/Gen-V1/pull/749)
- [PR #661](https://github.com/skytuhua-org/Gen-V1/pull/661)
- [PR #932](https://github.com/skytuhua-org/Gen-V1/pull/932)
- [PR #908](https://github.com/skytuhua-org/Gen-V1/pull/908)
- [docs/implementation/v3/M01-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/5cde22a7d48cc0a5f0f24884f862e64781575ebd/docs/implementation/v3/M01-verification.json)
- [docs/implementation/v3/M02-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/5cde22a7d48cc0a5f0f24884f862e64781575ebd/docs/implementation/v3/M02-verification.json)
- [M03 backend gate #774](https://github.com/skytuhua-org/Gen-V1/issues/774)

Issue body revision `issue-body-r1`. Use append-only checkpoints for evidence and handoffs. Existing ownership, review requirements and release permissions apply.
