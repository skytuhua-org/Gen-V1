**Full current issue mirror:** [issue-1030.md](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1030.md). The publication checkpoint pins the exact commit.

Publication supplement under #1803, cleanup-2026-11-23-r2: preserve the concurrent #1992 plan below. Historical classification and real-host receipts remain evidence for their named source. #1421 remains the retained missing-check classification candidate, while integrated #699 does not restore retired interactive controls. The current plan's production-workflow and release gates remain open.

# M06: Connect approved verification execution, QA and durable visible bounded repair

## META

Repository: `skytuhua-org/Gen-V1` (ID 1442565952). Plan revision: `m0406-audit-r1-readability-r1`, 2026-11-24 UTC. Exact inspected baseline: `9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Parent audit: [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992). Planning reviewer: `codex-cloud-m0406-e3d038`. This reviewer holds no implementation ownership; existing claims remain authoritative. No branch, worktree, PR or activation was created by this audit. This document is an executable future plan, not permission to run a provider, alter the repository or activate a capability during the read-only audit.

Attachment limitation observed by the parent publisher: GitHub filechooser upload failed. The complete UTF-8 Markdown body is the publication fallback; these actual .md files remain separate review deliverables. No GitHub attachment success is claimed and no repository-docs write or commit is authorized.

The authoritative inputs are the user-supplied *Audited Execution-Controlled Prompts v6* (2026-11-16), its *Completion Followups* appendix (2026-11-18), and *Expanded Source Research UX Memory Performance v3* (2026-11-14). The complete relevant clauses are reproduced below. v6 controls acceptance; the appendix orders remaining work; research §§19-26 explains the experiment/evidence design. An existing helper, merged commit, valid evidence JSON or passing synthetic test is not production/native/live acceptance.

Read [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md) and [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md) before future implementation. Claim only this issue's task IDs, append and read back every checkpoint, retain one concern and one owner per edit set, and RELEASE OWNER=NONE before stopping. User authorization in this audit covers planning/publication only. Future implementation needs its own task scope; do not resurrect retired architecture without an explicit accepted product decision. M12 and M14 belong to other active owners.

Canonical routing: extend [#1030](https://github.com/skytuhua-org/Gen-V1/issues/1030) in place; do not create a duplicate.

## OBJECTIVE

Close the concrete missing production joins for the retained original verification workflow: exact-approved recipe execution, reduced-authority QA, fresh observations, durable bounded repair and visible Start/Continue/Stop/Rerun. Preserve the existing runner, artifact custody, source witnesses and completion read model. Separate structured security findings to the focused companion plan.

### Actual baseline finding

Whole-production-source search at the baseline finds only definitions of `registerRecipe`, `runRecipe`, `createVerificationExecutorFactory`, `admitQaSpawn` and `BoundedRepairLoop`. ProjectVerificationService is instantiated in code-intelligence-routes only for recordAdvisory. Server exposes GET panel/artifacts; current VerificationPanel is read-only and model contains label/summary/rows only. `BoundedRepairLoop` persists three attempts and repeated failure stopping but lacks deadline/token-budget/reservation fields. #1030 checkpoint 7060078285 documents old workflow/repair/QA/contracts/spec deletion by f8bb579f after earlier heads became ancestors. #635/#651/#652/#653 remain OPEN draft at d8b43cb0/ad56efaf/89a49ea8/c328a1de; compare current heads rather than restoring old modules blindly. #1421 is OPEN at `94105f9aefb6f83a9721bfaa169633ae7ce72687` and only corrects fresh failure evidence incorrectly also labeled missing. Its historical manual Linux host script and 64/114 tests do not establish production UI composition or Windows support.

## REQUIREMENTS

**M06-C01.** VerificationRecipeV1: id, version, workspaceIdentity, approvedDigest, phases[] with name BOOTSTRAP|BUILD|TEST|START|READINESS|BROWSER|TEARDOWN, executable identity, argv[], relativeCwd, environment references and timeoutMs. Executable strings are not arbitrary shell fragments. Registration and changes require M02 exact approval.

**M06-C02.** CheckObservationV1: checkId, executionId, owner, codeDigest, dependencyDigest, recipeDigest, environmentId, argv, cwdIdentity, start/end, exitCode|null, outcome PASS|FAIL|BLOCKED|CANCELLED|UNKNOWN, artifactRefs[] and observationKind. Store immutably. Derive freshness CURRENT|STALE|INDETERMINATE from current source/environment, never rewrite the historical outcome to STALE.

**M06-C03.** VisualObservationV1 additionally binds checklistItemId, actionTraceId, exact origin, viewport, assertion, observed behavior and screenshot digest. A screenshot or valid JSON schema alone cannot create PASS. Missing screenshot for a required visual assertion is BLOCKED.

**M06-C04.** DeliverableAssessmentV1: sourceCut, requirements[{id,checkRefs,assessment VERIFIED|FAILED|UNVERIFIED|BLOCKED}], unresolvedEffects[], verifierIdentity and provenance. Existing Thread.status is retained; completion evidence is a separate projection.

**M06-S02.** Implement approved project recipes with fixed phase order. Require workspace identity and executable/config digests; do not auto-run package scripts found in an untrusted repository. Resolve SecretRefs only inside M03's permitted execution environment.

**M06-S03.** Capture all relevant source/config/lockfile digests immediately before execution and compare again before accepting the observation for current completion. A file changed during the check makes the result stale for current code even when the process exited 0. Do not use commit SHA alone for dirty worktrees.

**M06-S04.** Run build/test sequentially; a failure prevents start/browser phases. Always perform cleanup for resources this recipe actually launched. Record cleanup failure separately and block clean-release claims. Do not kill unrelated processes to free a port.

**M06-S05.** For readiness, identify the actual launched process tree and expected listener plus the exact approved loopback endpoint. Where listener ownership cannot be established, return READINESS_OWNER_UNPROVEN. An HTTP 200 from a server left over from another run is insufficient.

**M06-S06.** Use a fresh browser profile under the verification owner. Parse a strict step union: NAVIGATE, CLICK, TYPE, ASSERT_TEXT, ASSERT_VISIBLE, ASSERT_URL, SCREENSHOT and COLLECT_ERRORS. Maximum 24 steps; 15 seconds per step and a 5-minute overall browser deadline. No arbitrary evaluate or inherited logged-in user profile.

**M06-S07.** Enforce approved origins for top-level navigation, popups and browser traffic according to the execution profile, not only the typed NAVIGATE input. Downloads, uploads and new external origins require separate scoped approval. Collect bounded console/network failures and attach immutable artifacts.

**M06-S08.** Create a QA role that invokes only the parent-owned verification service and read-only context. Do not give the existing read-only PlanningCoordinator ordinary shell/browser/write tools. Reject recursive QA spawn, missing approval and cancelled requests before creating a worker.

**M06-S09.** Produce model review as ADVISORY and observed runner outcomes as EXECUTED. Combine them only through explicit requirement/check bindings. A model-generated PASS, screenshot upload success or confidence score cannot become a verified result.

**M06-S10.** Implement bounded test-fix-retest using one approved recipe and the same requirement IDs. At most 3 repair attempts, stopping earlier on unchanged failure digest twice, budget/deadline exhaustion, revoked grants or source conflict. The developer may propose edits; a QA worker never silently commits them.

**M06-S11.** Integrate the completion projection with task_finish and run settlement. Verified means every required check has fresh trusted evidence for the current source/environment and no unresolved external effect. Allow completed but unverified only with that visible label and exact missing checks; do not falsify the existing native transcript.

**M06-S14.** Use exact expected-failure fixtures from M01 to prove a broken button or stale evidence actually fails for the intended reason, then demonstrate the repaired fixture passes. Record installed Windows and browser execution separately from unit mocks.

**M06-U01.** Verification panel columns: requirement, observed check, source revision, outcome, freshness, verifier and evidence. Use text labels as well as colors. Clicking a check opens command exit, bounded log, screenshot and environment.

**M06-U02.** Visual checks show Expected versus Observed and a captured image at the tested viewport. Stale results remain accessible with a Stale banner; they cannot be reused as a current green badge.

**M06-U03.** Completion summary states Verified, Completed unverified, Failed or Blocked in an additive read model. Rerun checks creates a new approved execution and retains earlier failures.

**M06-U04.** Repair progress shows attempt count, remaining budget and stop reason. Security findings display evidence quality and permitted scope rather than an unsupported severity-only verdict.

**M06-T01.** Zero exit with genuine current execution can pass; quoted “tests passed”, old logs, wrong cwd, changed lockfile or deleted artifacts cannot.

**M06-T02.** Build failure prevents browser startup; stale unrelated server is rejected; cleanup failure remains visible.

**M06-T03.** Broken button, wrong URL, console error, popup redirect and forbidden origin produce the expected recorded failure or denial.

**M06-T04.** QA policy cannot relax spawn permission or gain writes; missing approval, cancellation and invalid duplicate checklist IDs start no worker.

**M06-T05.** Repair loop stops at 3 attempts or repeated unchanged failure and never hides prior failed checks.

**M06-T06.** New source edit after a passing test changes derived freshness to STALE while preserving the historical PASS observation.

**M06-G01.** M02 authority precedes recipe execution, resolving the F03/F08 forward dependency. M03 proven execution profile is required for untrusted project commands; synthetic contract fixtures can run without claiming platform proof. Every verification claim names the actual tested platform.

**M06-G02.** Host-owned flags: verification.workflowV1. Register only these keys in the shared finite registry; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M06-G03.** Rollback: Disable completion gating and new recipes; preserve old thread compatibility and all observations. A rollback never deletes failures or relabels unverified work as verified. Stop only owned browser/server processes.

Completion follow-up step 2 explicitly names Start/Continue/Stop/Rerun carrying current owner, execution and plan revision; stale/concurrent/cancel/idempotent retries cannot replace an action or charge another slot. #1030 prior worker narrowed its result to service reexecution and excluded UI restoration pending product decision. That scope qualification is preserved; it does not satisfy the original user-facing requirement. Original U04 security portion is routed to the standalone structured findings plan.

## REPO_MAP

- [`packages/contracts/verification.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/verification.ts)
- [`packages/core/project-verification.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/project-verification.ts)
- [`packages/core/verification-executor.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/verification-executor.ts)
- [`packages/core/verification-executor-binding.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/verification-executor-binding.ts)
- [`packages/core/browser-verification.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/browser-verification.ts)
- [`packages/core/verification-gate.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/verification-gate.ts)
- [`packages/core/verification-read-models.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/verification-read-models.ts)
- [`packages/core/service.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts)
- [`apps/server/code-intelligence-routes.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/code-intelligence-routes.ts)
- [`apps/server/server.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/server.ts)
- [`apps/web/src/VerificationPanel.tsx`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/VerificationPanel.tsx)
- [`apps/web/src/App.tsx`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/App.tsx)
- [`tests/verification-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/verification-v3.test.ts)
- [`tests/qa-delegation-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/qa-delegation-v3.test.ts)
- [`tests/verification-executor-binding.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/verification-executor-binding.test.ts)

## DESIGN

The host remains sole Store writer and permission authority. Reuse ProjectVerificationService.`registerRecipe`(recipe,approvalId,owner), `runRecipe`(owner,request,launcher,probe,control), VerificationExecutorFactory.describe/assertCurrent/open and the current M02 exact-action model. ObservedVerificationBackend.launchObserved/probeListener/openBrowserDriver must be supplied by an existing approved M03 backend; no plain spawn or generic browser fallback may substitute. Separate immutable execution outcome from current freshness and completion. Extend a host-only workflow contract after accepted scope reconciliation: exact owner/execution/recipe/requirement IDs, plan ID/revision, source/config digest, absolute deadline, approved token/cost ceiling, charged and reserved budget, attempts<=3, pending operation ID and stop reason. These fields are proposed missing additions, not claimed current APIs. Reserve attempt/budget transactionally before dispatch without awaiting inside Store.command; preserve unknown work across restart and never issue duplicate replacement. QA receives only verification.run/observe and read-only context, no ordinary shell/write/browser or recursive spawn. UI commands revalidate exact current owner/plan/execution revision even if a stale button was visible.

## EXECUTION_DAG

### T01: Resolve retired-scope decision and compare exact chain

Depends on: none. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Accepted product decision whether original interactive recipe/QA/repair scope is retained; current M02 approval and M03 approved observed executor/browser proof; parent scope and owner.

**Files and concrete edits:** Read #1030 full journal, #635/#651/#652/#653 current heads, #673/#687/#699 historical joins, deletion f8bb579f, #1421 and current sources. Publish interface/source decision in issue; no architecture restoration yet.

**Operation and output:** Original clauses remain UNMET until implemented or the user accepts an explicit requirement change. Obtain/record the actual decision as HOLD_PRODUCT_DECISION if absent. Preserve #1421 independent classification change and do not duplicate it. Map each old module to surviving interfaces before proposing edits.

**Positive, negative, cancellation and recovery checks:** Negative stale old head cannot substitute current source; ancestor check does not prove present behavior. No approved observed backend yields HOLD_VERIFICATION_PLATFORM and zero launch.

**Done criterion:** A concrete narrow join contract, accepted scope decision, exact owners and source dependency map exists.

### T02: Compose approved recipe runner into actual host

Depends on: T01. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Existing recipe approval, ToolOwner, RecipeExecutionRequest and VerificationExecutorHostConfig with observed backend/profile/executables/trust/secrets/explicit environment/flags.

**Files and concrete edits:** Extend existing Service and server host composition, contracts/index.ts command schema only with accepted versioned workflow shapes; reuse project-verification.ts and verification-executor*.ts. Add genuinely absent workflow module only after T01 approved map; inventory source/runtime manifests.

**Operation and output:** Register/change recipes only through exact M02 approval. Prepare immutable source/executable/profile witnesses. Dispatch ordered BOOTSTRAP/BUILD/TEST/START/READINESS/BROWSER/TEARDOWN through managed executor; persist intent/reservation before await, recheck current owner across every boundary, retain late historical settlement without current authority. Expose authenticated commands, never raw executable strings.

**Positive, negative, cancellation and recovery checks:** Matching exact approval launches once; wrong digest/owner/grant/flag/cwd and cancelled request launch zero processes. A build FAIL prevents start/browser; changed file during read blocks current evidence; stale unrelated server cannot pass readiness. Kill/restart after submission shows UNKNOWN until reconciled; no blind rerun.

**Done criterion:** Ordinary actual Service command path reaches managed runner with source-bound receipts and no unrestricted fallback.

### T03: Connect reduced-authority QA admission

Depends on: T02. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Parent exact approval/action commitment, current owner, non-QA parent, strict duplicate-free checklist, approved parent verification service.

**Files and concrete edits:** Reuse verification-gate.ts createQaWorkerRole/`admitQaSpawn` and actual child runtime admission discovered in T01. Do not extend PlanningCoordinator shell/write capability; coordinate existing M09/M10 owners.

**Operation and output:** Consume exact approval once and create QA worker only after validation/reservation. QA may invoke parent-owned checks and read permitted context. Deny recursive spawn and all mutation/tool bypass paths. Child cancellation revokes publication but retains already-submitted settlement.

**Positive, negative, cancellation and recovery checks:** Missing/expired approval, cancelled parent, recursive request, invalid duplicate checklist IDs and scope drift create zero workers. Direct shell/browser/write requests have zero external effects. Retry same command returns existing receipt; restart does not spawn a replacement.

**Done criterion:** Actual production child path has reduced role and deterministic zero-effect denials; no policy escalation.

### T04: Implement durable repair reservation and budgets

Depends on: T02, T03. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** One approved recipe/requirement set, baseline failure digest, captured owner/source, planId/revision, absolute deadline and approved token/cost budget.

**Files and concrete edits:** Extend existing `BoundedRepairLoop` or accepted restored narrow module and shared workflow contract from T01; version persistence explicitly and preserve old attempt records.

**Operation and output:** Persist immutable attempt reservations and pending operation before dispatch. At most 3 attempts, stop after two unchanged failure digests, budget/deadline, revoked grant, conflict, cancellation or blocked verifier. Developer edits use ordinary separately approved path; QA never commits. Preserve all old failures and exact consumed resources. Unknown provider cost cannot unlock more budget automatically.

**Positive, negative, cancellation and recovery checks:** Concurrent Start/Continue and command retry charge once. Fourth attempt refused; duplicate unchanged failure stops second repeat. Source conflict/deadline/stop wins before new launch. Restart between reserve/launch/settle retains same pending operation, reconciles owned resources and does not replay uncertain effect.

**Done criterion:** Durable restart-safe attempt/token/time accounting proven; no hidden retry or replacement action.

### T05: Expose current workflow and visible actions

Depends on: T04. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Read-only exact ownerKey/executionId/recipeId/planId/revision, canRerun/canStart/canContinue/canStop, attempts/remaining budget/deadline/stop reason; these are proposed fields pending T01 contract.

**Files and concrete edits:** Extend verification-read-models.ts `VerificationPanelModel`, existing VerificationPanel.tsx, current command client and tests. No new workspace or UI framework.

**Operation and output:** Render Start/Continue/Stop/Rerun using authoritative capabilities; send identity tuple back on every command. Show loading/empty/denied/unavailable/blocked/cancelled/offline/stale states and prior failure evidence. Source refresh recomputes freshness without rewriting old PASS. Maintain keyboard focus, IME and drafts.

**Positive, negative, cancellation and recovery checks:** Actual App action creates one new approved execution. Owner/account/project switch during pending response cannot confirm stale action; double click/idempotent retry cannot charge twice; reconnect shows same durable plan. Stop affects owned runner only.

**Done criterion:** Current actual App controls and progress/budget/stop reason are reachable with bounded read model and stale-state refusal.

### T06: Prove intended failure, repair and fresh rerun through App

Depends on: T02, T03, T04, T05. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** M01 known broken button/build fixture, approved real executor/browser/profile, exact configured browser channel, source digests and artifact store.

**Files and concrete edits:** Use existing host fixture patterns and browser suite registry; a new dedicated verification-host spec/config is create-if-absent only and must contain these real assertions. Preserve host-loop generated-UI test.

**Operation and output:** Baseline must fail intended assertion, not setup. Drive actual UI approved repair, verify no automatic commit, rerun new execution, retain earlier failures, and show current verified only for every required fresh check plus no unresolved effect. Change source after PASS and show STALE. Bound screenshot/log artifact custody and actual listener tree.

**Positive, negative, cancellation and recovery checks:** A wrong URL, console error, popup redirect or forbidden origin produces the required denial or failure; missing screenshot for required visual is BLOCKED. Capture teardown failure separately. Kill verifier or native host and show unknown rather than green. Linux and actual installed Windows receipts remain separate; mocked backend cannot certify M03.

**Done criterion:** A complete actual-host UI trace and native platform lane with exact source exists, or precise HOLD_VERIFICATION_PLATFORM persists.

### T07: Reconcile evidence, classification PR and rollback

Depends on: T06. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** All exact-source raw receipts, previous failed suites and deleted-source history.

**Files and concrete edits:** Current M06 V3/requirement evidence and canonical issue journal; consume #1421 only after current owner/source review; #1028 owns common qualification and #1972 stale claims.

**Operation and output:** Preserve historical claims with their cuts, correct current disposition, and keep `verification.workflowV1` false. Rollback stops only owned processes, disables new recipes/completion gating and keeps all observations/repair receipts plus old-thread compatibility.

**Positive, negative, cancellation and recovery checks:** Fresh FAIL/BLOCKED/CANCELLED is recorded evidence without fabricated missing marker, using accepted #1421 logic. Rollback never deletes failure or relabels work verified.

**Done criterion:** Every acceptance row observed or explicitly blocked; no bundle completion from helper/unit/schema-only proof.

## VALIDATION

### Setup and command discipline

Observed audit environment: Node 24.22.3 satisfies `>=24.10.0`; provisioned pnpm 11.25.0 does not match required 10.30.3; there is no node_modules tree. `COREPACK_ENABLE_NETWORK=0 corepack pnpm --version` cannot resolve an already-provisioned 10.30.3. All current product test commands are NOT_RUN, reason HOLD_TOOLCHAIN. No package, toolchain or browser was downloaded and no repository file was modified. A missing dependency is an infrastructure hold, not an expected failing assertion.

Future executor must first record `git rev-parse --show-toplevel`, `git remote get-url origin`, `git status --porcelain=v1 --untracked-files=all`, `git branch --show-current`, `git worktree list --porcelain`, `git rev-parse HEAD`, `node --version` and `pnpm --version` separately. Read the then-current package.json, lockfile, consumed contracts and owner journal. Use installed matching pnpm or an already provisioned matching Corepack resolution. If neither exists, keep HOLD_TOOLCHAIN; no download is authorized by v6. Frozen existing-lockfile dependency setup is allowed only under the future implementation's setup authorization. Never substitute a different version or use --passWithNoTests.

Run required asset steps as separate observed commands before targeted tests: `pnpm build:credential-lease` and `pnpm build:widgets`. A platform incapable of the native build may execute a separately labeled pure targeted diagnostic but cannot substitute `test:no-lease` for the required `pnpm test` gate. After focused tests run, retain individual receipts for `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:browser`. Do not change timeout, skip, browser channel or expected assertion to hide a failure. Planned commands below were not executed in this audit.

Receipts name the immutable source SHA/tree, source and dependency blob hashes, Node/pnpm/OS/architecture/browser/native adapter, flag injection, exact command, start/end UTC, exit or cancellation, actual test case identities, passed/failed/skipped counts, and bounded artifact SHA-256. Preserve every baseline failure, cancellation, unknown settlement and unavailable cost. Platform-specific skips are declared individually and never fulfill required gates. Evidence integrity validation is separate from product acceptance.

### Focused commands

```sh
pnpm exec vitest run tests/verification-v3.test.ts tests/qa-delegation-v3.test.ts tests/verification-executor.test.ts tests/verification-executor-binding.test.ts tests/verification-managed-recipe.test.ts
pnpm exec vitest run tests/browser-verification-v3.test.ts tests/verification-read-models-v3.test.ts tests/verification-artifact-gate-v3.test.ts tests/verification-artifact-routes.test.ts tests/verification-evidence-owner-v3.test.ts
pnpm exec vitest run tests/generated-ui-endurance-v3.test.ts
pnpm build
pnpm test:browser --suite root
# Add/run a dedicated verification-host suite only after T06 creates or verifies its real spec/config and scripts/browser-suites.ts registry entry.
```

### Acceptance matrix

| Requirement | Tasks | Required observable result |
|---|---|---|
| C01, C02, C03, S02-S07, T02, T03 | T02, T06 | Real approved managed runner/browser with immutable source/owner/artifacts and owned cleanup. |
| S08, T04 | T03 | Actual reduced QA admission, zero unauthorized/recursive worker/effect. |
| S10, T05, U04 repair part | T04, T05 | At most 3, repeated digest, time/cost budget, durable single reservation and visible stop/progress. |
| C04, S09, S11, U01-U03, T01, T06 | T02, T05, T06, T07 | Fresh executed evidence only; prior failures preserved; Rerun new exact-approved execution; stale after source edit. |
| S14, G01 | T06 | Intended failing assertion then a passing repair; actual installed Windows/platform separate from mocks. |
| G02, G03 | T07 | Default-off and rollback preserve records; stop owned resources only. |

### Release gates and rollback

HOLD_PRODUCT_DECISION until restoring the deleted interactive scope is explicitly accepted or original requirements explicitly amended. HOLD_SOURCE_DRIFT for incompatible chain/API joins. HOLD_VERIFICATION_PLATFORM for absent approved installed observed executor/browser; #774 owns Windows confinement proof. HOLD_TOOLCHAIN now. No plain process/browser fallback, automatic old-stack merge, new dependency or production activation. #1421 is existing focused classification work; no second implementation of that patch.

## STATE

All T01 and later implementation tasks are NOT_STARTED. This audit performed source tracing, original-clause extraction, issue/PR body and discussion comparison, path/reference verification and clean-tree checks only. Product tests, Windows installed tests, live model calls and activation are NOT_RUN. Implementation scope and execution owners must be claimed in the canonical issue before future changes. Next step is T01 after coordinator publishes this complete plan and confirms current owner/source; blocked inputs are not guessed. Preserve ordinary working code, all native histories, accepted memory, tombstones and prior failed observations across rollback.

## REFERENCES

- [Pinned source](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b)
- [Parent audit and read-only scope](https://github.com/skytuhua-org/Gen-V1/issues/1992)
- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)

## PRESERVED PRIOR CANONICAL BODY

The following previous body is retained verbatim. The current-source findings and tasks above supplement its obligations; earlier append-only comments remain authoritative historical receipts with their original source limits. Stale branch states in the preserved text do not override the explicit current-state comparison above.

<!-- m-series-scope:m06-controls -->
## Outcome and scope

The open M06 user-facing verification and bounded repair stack, separate from #1006 byte-witness review. Older branches are leads until compared to current main.

## Completion criteria

- [ ] **T01** Read stacked PR requirements and compare source with current main to classify retained, merged or superseded changes.
- [ ] **T02** Verify visible rerun and bounded repair through the actual host, including durable source-drift failure and restart accounting, for the precise retained scope.
- [ ] **T03** Record passing focused and required platform checks and independent review before publication.

## Ownership and current state

Existing owner or dependency owner: Existing M06 stack owners. The open draft stack has multiple exact bases. It should not be replayed as a unit until overlap and current product behavior are known.



## References

- [PR #635](https://github.com/skytuhua-org/Gen-V1/pull/635)
- [PR #651](https://github.com/skytuhua-org/Gen-V1/pull/651)
- [PR #652](https://github.com/skytuhua-org/Gen-V1/pull/652)
- [PR #653](https://github.com/skytuhua-org/Gen-V1/pull/653)
- [PR #673](https://github.com/skytuhua-org/Gen-V1/pull/673)
- [PR #687](https://github.com/skytuhua-org/Gen-V1/pull/687)
- [PR #699](https://github.com/skytuhua-org/Gen-V1/pull/699)
- [docs/implementation/v3/M06-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/5cde22a7d48cc0a5f0f24884f862e64781575ebd/docs/implementation/v3/M06-verification.json)
- [Independent byte-witness review #1006](https://github.com/skytuhua-org/Gen-V1/issues/1006)

Issue body revision `issue-body-r1`. Use append-only checkpoints for evidence and handoffs. Existing ownership, review requirements and release permissions apply.


### Prior journal preserved in GitHub

- [7026913769](https://github.com/skytuhua-org/Gen-V1/issues/1030#issuecomment-7026913769): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7036609738](https://github.com/skytuhua-org/Gen-V1/issues/1030#issuecomment-7036609738): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7045961126](https://github.com/skytuhua-org/Gen-V1/issues/1030#issuecomment-7045961126): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7051230182](https://github.com/skytuhua-org/Gen-V1/issues/1030#issuecomment-7051230182): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7057857876](https://github.com/skytuhua-org/Gen-V1/issues/1030#issuecomment-7057857876): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7059995625](https://github.com/skytuhua-org/Gen-V1/issues/1030#issuecomment-7059995625): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7060078285](https://github.com/skytuhua-org/Gen-V1/issues/1030#issuecomment-7060078285): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7060569878](https://github.com/skytuhua-org/Gen-V1/issues/1030#issuecomment-7060569878): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7060781960](https://github.com/skytuhua-org/Gen-V1/issues/1030#issuecomment-7060781960): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
