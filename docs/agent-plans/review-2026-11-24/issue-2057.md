# Qualify exact authenticated M02 operation outcome recovery Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans for future assigned implementation, task by task. This review authorizes plan publication only.

**Goal:** Qualify exact authenticated M02 operation outcome recovery.

**Architecture:** Consume #1719's existing ToolEffectLedger protected verifier, not a second authority or new ledger.

**Tech Stack:** Existing TypeScript/Node host, synchronous Store and checked-in Vitest/browser tooling; declared native and live lanes require their own approved environments.

**Spec:** Complete relevant v6 clauses are reproduced in REQUIREMENTS below; the source baseline and prior issue context travel with this document.

## Global Constraints

- Declared Node >=24.10.0 and packageManager pnpm10.30.3. Resolve an installed matching executable; no unauthorized toolchain download.
- Preserve the existing lockfile, source ownership and required checks. Product flags default false and remain host-owned.
- Current review is read-only for the repository. Future edits require their assigned owner; current incomplete native/live lanes remain explicit holds.

## Review Focus

- T02/T03: changed account, epoch, action, target or definition must not inherit a historical outcome.
- T03: missing or revoked signing custody must preserve uncertainty without restoring authority.
- T04: abrupt process death at a durability boundary must not repeat an uncertain write.
- T03/T04: late settlement and parent archive must retain history without current publication.
- T01/T05: active Store/outbox owners and native proof gaps must remain separate dependencies.

## META

Repository: https://github.com/skytuhua-org/Gen-V1. Plan revision `recovery-acceptance-r2`. Date2026-11-23 America/Los_Angeles (audit UTC2026-11-24). Baseline `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`; no working branch or implementation claim created by this review. Audit parent [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992), T01/T02/T03. Publication: Create a focused acceptance child of [#1031](https://github.com/skytuhua-org/Gen-V1/issues/1031), preserving existing implementation ownership. Status `IMPLEMENTATION_PENDING_ACCEPTANCE`. Source provenance: all relevant v6 original C/S/U/T/G clauses, November18 completion follow-ups, and research v3 read; the archive is an acceptance ledger and does not authorize rebuilding merged milestones.

## OBJECTIVE

Current recoverEffects lines27-42 derives an Operation from an operation-looking invocation and inherits succeeded/failed/cancelled after checking tool, thread and revision. It does not establish the complete original run/epoch/account/project/workspace, exact private argument/definition commitments, grants or consumed authenticated approval. Service.recover lines2391-2403 also revokes the owner before this recovery check. Pending PR#1719 already supplies a focused candidate. Create a dedicated acceptance child linked to #1031/#1719, preserving its implementation custody; this is not a competing repair. Success is one exact signed positive recovery and conservative UNKNOWN_EXTERNAL_OUTCOME for every mismatched/legacy/custody-less case, with no external dispatch on restart.

## REQUIREMENTS

### Retained original acceptance requirements

The following substantive text is preserved from the supplied v6 archive. It defines acceptance, not permission to repeat its historical implementation sequence. Existing supported code/tests and original owner custody remain in place.

**M02-C02.** ToolEffectV1: effectId, invocationId, attemptId, parentInvocationId|null, owner{threadId,runId,epoch,projectId,workspaceId,accountBinding}, toolId, definitionDigest, privateArgumentCommitment, publicRedactedSummary, targetPreconditions[], approvalId|null, state PREPARED|DISPATCHED|SUCCEEDED|FAILED|CANCELLED|DENIED|UNKNOWN_EXTERNAL_OUTCOME, providerReceiptRef|null and timestamps. Retain each state transition; never rewrite a historical event.

**M02-C03.** ApprovalV1: approvalId, operationId, actionCommitment, owner, targetPreconditions, issuedAt, expiresAt, remainingUses=1, issuer=authenticated_user and host authenticator. Authorization returns ALLOW|REQUIRE_APPROVAL|DENY with a stable reason. Raw secrets do not enter commitments exposed to the UI; use private keyed commitments and SecretRef identity.

**M02-C04.** Observation freshness is separate from execution outcome. An old PASS or successful effect remains historical fact; its use for the current run is CURRENT|STALE|INDETERMINATE. Late settlement may be recorded under its original owner without reviving that owner or publishing a current success.

**M02-S03.** Implement a pure authorization decision using host-resolved actor, current run epoch, account binding, project/workspace identity, grants, target preconditions and approval. The caller supplies an opaque invocation request, not trusted authority fields. Recheck authorization immediately before dispatch after asynchronous preparation.

**M02-S05.** Persist admission and consume a single-use approval in one synchronous Store transaction. Store rejects asynchronous transaction callbacks; perform external work only after commit. Use a second synchronous transaction for settlement. If admission persistence fails, do not dispatch.

**M02-S06.** Persist DISPATCHED before invoking the executor. Treat a crash between that record and the actual external call conservatively: absence of a reply does not prove the action did not happen. Avoid a second database or independent JSONL authority.

**M02-S07.** Coalesce concurrent duplicate invocation IDs only when owner and exact arguments match. Different content under the same ID returns CONFLICT. Return the prior receipt when it exists; never repeat a mutation merely to reconstruct output.

**M02-S08.** Recovery may retry a read only with a fresh valid owner and unchanged authorization, retaining a link to the original attempt. A provider-idempotent operation additionally needs its documented idempotency contract and exact key. All ambiguous arbitrary shell, Git push, install or remote-write effects stay UNKNOWN_EXTERNAL_OUTCOME.

**M02-S09.** Implement read-only reconcilers that inspect an owned process identity or provider receipt. An authenticated operator resolution is a new record labeled as such, not a forged original executor response. Process disappearance does not prove success.

**M02-S10.** Keep cancellation and effect certainty distinct. Cancellation prevents new dispatch and publication, but already submitted effects can still settle historically. Record remaining uncertainty; never label a cancelled run as having made no changes without proof.

**M02-S12.** Add fault hooks at every durability boundary and count effects in the fake external system. Test hard process termination. Additive flags audit.effectsV1 and security.authorityV1 remain false until their adapter coverage and regression gates pass.

**M02-T01.** Same ID/same payload retry returns one receipt; same ID/changed payload is denied. Two simultaneous approval consumers cause at most one dispatch.

**M02-T02.** Change argument, cwd, account, workspace identity, schema, grant or epoch after approval. Each case denies before external dispatch.

**M02-T03.** Crash at prepare/dispatch/effect/settlement/commit. Count actual effects; uncertain writes are not automatically repeated.

**M02-T04.** Archive parent during a running child: retain historical result if observed, but no current result publication or revived grant.

**M02-G03.** Rollback: Disable new admissions, drain or mark outstanding effects uncertain, preserve the ledger and compatibility reads. Never erase consumed approvals or replay old pending writes as part of rollback.

**M01-S07.** Create deterministic crash/race test infrastructure with injectable pause points before admission, before dispatch, after external effect, before settlement and after commit. Keep fault injection in test factories, never a remotely reachable production flag. Include process termination/relaunch, not only thrown exceptions. Use fixed seeds 1, 2, 7, 42 and 99 and count observed external effects.

### Scope, user flow and compatibility

Exact observed pending #1719 head6837ddc1c89f3a42c28f2dcf5eeb9d67a4fa04df, basebffae7ff03a16dcc5b9c10abd25b956564059ec2. Its description contains older216ca09a evidence and queued jobs; neither proves current head success. Existing #1955 deliveries #1989/#1993 overlap and require canonical owner reconciliation before consuming Store changes. #1956 active outbox ownership is a gate, not permission for this child to fix outbox transactions.

This audit authorizes only review and plan publication. Future repository edits, dependency restoration, privileged test execution and live-account spending require the corresponding existing assignment/input. Existing canonical issues and PRs retain custody until explicit release; no concurrent writer is created by this document. Do not delete retained artifacts/tests or change strict UI preferences. Positive normal behavior, denial reasons, cancellation, restart, rollback and current/historical distinctions below are required; no all-tools, all-platforms or universal-redaction claim.

## REPO_MAP

- [apps/server/effect-service.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/effect-service.ts)
- [packages/capabilities/index.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/capabilities/index.ts)
- [packages/contracts/tool-effects.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/tool-effects.ts)
- [packages/core/effect-recovery.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/effect-recovery.ts)
- [packages/core/service.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts)
- [packages/core/tool-authority.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/tool-authority.ts)
- [packages/core/tool-effect-read-models.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/tool-effect-read-models.ts)
- [packages/core/tool-effects.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/tool-effects.ts)
- [packages/storage/store.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/storage/store.ts)
- [tests/fixtures/tool-effect-crash-worker.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/fixtures/tool-effect-crash-worker.mjs)
- [tests/research-baseline.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/research-baseline.test.ts)
- [tests/tool-effect-hard-crash-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-hard-crash-v3.test.mjs)

Existing mapped tests, definitions only until actually executed:

- [tests/effect-recovery-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/effect-recovery-v3.test.ts)
- [tests/operation-evidence.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/operation-evidence.test.ts)
- [tests/research-baseline.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/research-baseline.test.ts)
- [tests/tool-effect-admission-owner-race-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-admission-owner-race-v3.test.mjs)
- [tests/tool-effect-approval-review-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-approval-review-v3.test.mjs)
- [tests/tool-effect-authentication-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-authentication-v3.test.mjs)
- [tests/tool-effect-hard-crash-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-hard-crash-v3.test.mjs)
- [tests/tool-effect-late-progress-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-late-progress-v3.test.mjs)
- [tests/tool-effect-operation-owner-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-operation-owner-v3.test.ts)
- [tests/tool-effect-public-projection-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-public-projection-v3.test.mjs)
- [tests/tool-effect-replay-authority-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-replay-authority-v3.test.ts)
- [tests/tool-effect-replay-owner-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-replay-owner-v3.test.ts)
- [tests/tool-effect-rollback-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-rollback-v3.test.mjs)
- [tests/tool-effects-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effects-v3.test.ts)

Exact finding anchors:

- [packages/core/effect-recovery.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/effect-recovery.ts#L18-L57)
- [packages/core/service.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts#L2376-L2411)
- [packages/core/tool-effects.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/tool-effects.ts#L264-L301)

## DESIGN

Consume #1719's existing ToolEffectLedger protected verifier, not a second authority or new ledger. Recover a historical completed outcome only when the original persisted thread and every bound owner dimension match, invocation/tool/preconditions are canonical and unambiguous, authenticated definition and private action commitments recompute from exact args/resources/targets, and enabled authority mode has the exact signed consumed grant. Missing signer, rotated/revoked custody, forged record, changed scope or ambiguous legacy target stays unknown.

Historical recovery verification must occur before the existing workspace.recovered owner-revocation transaction, then clear runId and increment epoch exactly once as before. This ordering never revives a run, restores a grant or publishes current success. Current freshness remains independent of historical outcome. DISPATCHED must exist before any real effect; crash gaps stay conservative. Preserve read-only domain reconcilers and provider-receipt policy; process disappearance is not success, arbitrary writes are never replayed. Rollback disables admissions and retains consumed approvals/history.

Dependencies #1955 (transaction restoration), #1956 (outbox reconciliation, actively owned) and #1957 (native transcript recovery) remain with their owners. Only consume accepted compatible changes. Public contract change, missing signer interface or incompatible Store ordering stops the affected case at HOLD_CONTRACT_SHAPE/HOLD_SOURCE_DRIFT. No feature flags enabled by this acceptance plan.

## EXECUTION_DAG

Stable task IDs are local to this plan. Every task inherits the fixed source, owner, no-activation and evidence rules above. Task-specific files marked proposed or discovery are not represented as existing repository facts. No blocked provider/backend/interface choice is delegated to an implementer.

### T01: Read and bind the surviving recovery candidate

**Dependencies:** None.

**Exact files or discovery scope:** PR#1719 six-file diff; #1031/#1955/#1956 journals.

**Inputs:** Current head/base metadata and complete original candidate/owner history.

**Executable steps:**

- [ ] Refresh #1719 actual metadata head, not stale body SHA; read effect-recovery/tool-effects/service and three touched tests in full; compare current main, accepted Store repairs and outbox ownership.

- [ ] Claim verification child only; obtain explicit handoff before any candidate edit.

**Outputs:** Exact candidate/dependency/owner matrix.

**Positive, negative and lifecycle validation:** Negative incompatible shared Store change or active same-file owner yields scoped hold; positive known accepted candidate lineage.

**Done when:** Single implementation owner preserved and all consumed source identities recorded.

**Ownership and handoff:** Acceptance reviewer to existing #1719 owner and #1031 coordinator.

### T02: Establish unchanged baseline mismatch cases

**Dependencies:** T01 and exact toolchain.

**Exact files or discovery scope:** tests/effect-recovery-v3.test.ts; tests/tool-effect-rollback-v3.test.mjs.

**Inputs:** Owned Store fixture, synthetic host signer and one genuinely admitted consumed grant.

**Executable steps:**

- [ ] Create source-bound fixtures through real admission, then vary one field at a time: account/run/epoch/project/workspace/thread, args, resource IDs, target conditions, definition/schema, approval ID/signature/consumption and signer custody.

- [ ] Include noncanonical invocation suffix and ambiguous target encoding.

- [ ] On unpatched baseline record any incorrect inherited outcome at exact assertion; no real external effect or secret.

**Outputs:** Retained baseline failures and matching positive control.

**Positive, negative and lifecycle validation:** Exact signed original positive; every altered record must remain unknown, with external executor count0 during recovery. Setup failure remains blocked, not negative success.

**Done when:** Same fixtures can compare candidate without changing limits or definitions.

**Ownership and handoff:** Test owner with candidate custody; hand immutable fixtures to T03.

### T03: Verify protected binding and recovery ordering

**Dependencies:** T02; accepted #1719 implementation handoff.

**Exact files or discovery scope:** packages/core/effect-recovery.ts; packages/core/tool-effects.ts; packages/core/service.ts; same existing tests.

**Inputs:** Exact candidate, original owner fence, signer/definition/private commitment APIs.

**Executable steps:**

- [ ] Run #1719 verifier through direct recoverEffects and normal Service.recover.

- [ ] Inspect persisted successful operation after reopen before effect settlement.

- [ ] Verify historical owner/result retained; runId cleared and epoch advanced after recovery; consumed grant remains0.

- [ ] Changed account/missing custody/still-running effect stays unknown.

- [ ] No current success publication, repeated mutation or reconstructed executor reply.

- [ ] Repair only failed exact case on existing owner branch when separately authorized.

**Outputs:** Candidate outcome matrix and minimal owned corrections if necessary.

**Positive, negative and lifecycle validation:** Positive SUCCEEDED/FAILED/CANCELLED committed outcomes with exact binding; all drift negatives; repeated restart idempotent; late completion after cancellation historical only.

**Done when:** Binding never uses display-string equality as substitute for authenticated action; Service and direct paths agree.

**Ownership and handoff:** Existing recovery owner; independent reviewer receives source and case results.

### T04: Exercise actual process kill, transaction failure and cancellation

**Dependencies:** T03; accepted #1955/#1956 integration.

**Exact files or discovery scope:** tests/tool-effect-hard-crash-v3.test.mjs; tests/fixtures/tool-effect-crash-worker.mjs; tests/tool-effect-rollback-v3.test.mjs.

**Inputs:** Owned external-effect counter, readiness barriers, actual child supervisor and persistent Store.

**Executable steps:**

- [ ] Kill and reopen before admission, before dispatch, after effect, before settlement and after commit.

- [ ] Count effects outside the worker.

- [ ] Include real persistence failure, parent archive, cancel and key-custody unavailability.

- [ ] Never synthesize hard-kill acceptance with thrown exception alone.

- [ ] Distinguish admission failed/no dispatch from dispatched/unknown.

- [ ] Test rollback twice preserves consumed approval.

- [ ] Use fixed seeds 1, 2, 7, 42 and 99 for deterministic control schedules, keeping injected pause hooks in test factories only and recording actual external effect counts.

**Outputs:** Source-bound hard-termination counts and recovery/cancel traces.

**Positive, negative and lifecycle validation:** Expected0/1 counts per committed boundary; no repeated uncertain write; no late current result; repeated reopen retains same history; one exact successful dispatch only.

**Done when:** Every durability boundary has actual process observation and source-linked assertions.

**Ownership and handoff:** Runtime verifier; coordinate active outbox/Store owners without editing their paths.

### T05: Qualify integrated candidate and issue handoff

**Dependencies:** T04.

**Exact files or discovery scope:** Existing focused tests, package scripts and proposed child acceptance record.

**Inputs:** Final accepted head/tree and protected host/native environment when supplied.

**Executable steps:**

- [ ] Run focused commands then required full scripts on exact final cut; separate native host signer custody proof under #1031 from pure mocks.

- [ ] Recheck exact-head CI and independent review; preserve historical red attempts.

- [ ] Publish child body and case matrix linked to #1719; acceptance does not merge or enable.

**Outputs:** Complete recovery acceptance or explicit holds and recipient ACK.

**Positive, negative and lifecycle validation:** All changed-intent cases zero dispatch, exact signed positive passes, required missing native evidence remains blocked.

**Done when:** Pending PR implementation, tests passing, merged and verified-on-main states distinct.

**Ownership and handoff:** Child verifier releases; hand accepted dependency to #1031 and #1956 owner.

## VALIDATION

### Reproducible setup and planned commands

The asset-build commands below are prerequisites for their consuming tests. Build widgets before App/widget-dependent focused tests. The native credential-lease build is required for its native/full-test lane; a missing compiler blocks that lane rather than authorizing test:no-lease as release evidence. Run from the exact assigned candidate repository root, with declared Node>=24.10.0 and actual pnpm10.30.3 resolved offline. Record executable identity, cwd physical identity, source/tree, UTC start/end, exit/termination, per-case totals and bounded redacted log digest for each command. Missing tools/dependencies/native compiler/browser/Hermes environment mean the consuming lane is BLOCKED/NOT_RUN. No new toolchain download, substitutions or changed lockfile. All following commands are **planned and NOT_RUN by this audit**, except the separately identified existing Node control suite.

```text
node --version
pnpm --version
pnpm build:widgets
pnpm build:credential-lease
pnpm exec vitest run tests/effect-recovery-v3.test.ts tests/tool-effect-rollback-v3.test.mjs tests/tool-effect-hard-crash-v3.test.mjs tests/tool-effect-operation-owner-v3.test.ts tests/tool-effect-replay-owner-v3.test.ts tests/tool-effect-replay-authority-v3.test.ts tests/tool-effect-authentication-v3.test.mjs tests/tool-effect-public-projection-v3.test.mjs tests/tool-effect-late-progress-v3.test.mjs --maxWorkers=1
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
| A01 | Complete authority binding | T02,T03 | Exact signed original outcome only; every owner/action/definition/grant/custody drift remains unknown |
| A02 | Historical outcome and order | T03 | Recovery precedes owner revocation, preserves historical owner, then clears run; no current revival |
| A03 | Durability/cancel/rollback | T04 | Actual kill counts0/1, no uncertain replay, consumed grants retained |
| A04 | Integration evidence | T01,T05 | Current source/required suites and separate native custody proof |

### Requirement-to-task completeness

| Original requirement | Task coverage | Acceptance |
|---|---|---|
| M02-C02 | T02, T03 | A01, A02 |
| M02-C03 | T02, T03, T04 | A01, A03 |
| M02-C04 | T03, T04 | A02 |
| M02-S03 | T02, T03 | A01 |
| M02-S05 | T02, T03, T04 | A01, A03 |
| M02-S06 | T04 | A03 |
| M02-S07 | T02, T03, T04 | A01, A03 |
| M02-S08 | T03, T04 | A02, A03 |
| M02-S09 | T03, T04 | A02 |
| M02-S10 | T03, T04 | A02, A03 |
| M02-S12 | T04, T05 | A03, A04 |
| M02-T01 | T02, T03, T04 | A01, A03 |
| M02-T02 | T02, T03 | A01 |
| M02-T03 | T04 | A03 |
| M02-T04 | T03, T04 | A02, A03 |
| M02-G03 | T03, T04, T05 | A03, A04 |
| M01-S07 | T04 | A03 |


### Actually executed in this read-only audit

Source/issue/PR-body inspection and exact repository blob comparisons were performed. Existing dependency-free `node --test scripts/validate-m01-m03-integration.test.mjs` passed4/4 with0 fail/skip/cancel on the audited SHA; latest duration2451.852311ms and raw log are in the external audit evidence. This only tests the immutable control harness with owned synthetic fixtures. It does not prove this plan’s product behavior. Product Vitest/typecheck/lint/build/browser/native/live commands are NOT_RUN: required pnpm10.30.3 and node_modules are absent, available pnpm11.25.0 mismatches. Node24.22.3 is available. `HOLD_TOOLCHAIN` remains. No source-only or candidate-body historical result is reported as current acceptance.

### Release gate and rollback

All applicable required cases must pass on the final integrated source, and every unavailable platform/live/input lane remains explicitly blocked. Validate current V3 evidence with the existing owner and computed status; hold undefined legacy migration at HOLD_CONTRACT_SHAPE. `reviewerApproval=false` and all unproven host flags remain off. Passing a fixture, producing a source hash, or merging a PR is insufficient for deployment/activation. Rollback preserves account/trust/ledger/approval records and earlier evidence; disable only new admissions/wiring and stop owned children where supported, without deleting unrelated files or repeating uncertain effects.

## STATE

Researched and decided: exact reviewed source, original requirements, current production/caller gaps, ownership and safe blocked-input handling. Implemented by this audit: none. Verified by this audit: source inventory/metadata and four dependency-free control tests only. Pending: task-specific committed execution, candidate compatibility, exact-head CI, independent review, and any named operator/backend/provider/live inputs. Existing implementation PRs remain open until GitHub metadata proves otherwise; stale body heads or queued jobs are not acceptance. Latest publication owner is root coordinator `codex-cloud-ca7d38`; original source reviewer is `codex-cloud-m0103-ac1a13`; final artifact reviewer is `codex-cloud-m0103-finish-e71314`. No assignee or implementation custody transferred by this file.

First executable next step is T01. It is read-only scope/source/owner/input reconciliation. The actual GitHub filechooser upload failed in the coordinator environment. This plan is a real UTF-8 .md file for the deliverables, but it is not represented as a hosted GitHub attachment. No repository-docs commit is authorized. The complete canonical issue body is the required durable fallback. Current audit deliverable remains HANDOFF_INCOMPLETE until the coordinator publishes this complete body and reads it back, with actual file attachment if available or an honest attachment limitation. A local path alone is not durable issue handoff. Every future worker posts START/20-minute and milestone checkpoints and final RELEASE OWNER=NONE on its canonical issue/parent, preserving previous failed attempts.

## REFERENCES

- [#1031](https://github.com/skytuhua-org/Gen-V1/issues/1031)
- [#1719](https://github.com/skytuhua-org/Gen-V1/pull/1719)
- [#1955](https://github.com/skytuhua-org/Gen-V1/issues/1955)
- [#1956](https://github.com/skytuhua-org/Gen-V1/issues/1956)
- [#1957](https://github.com/skytuhua-org/Gen-V1/issues/1957)
- [#799](https://github.com/skytuhua-org/Gen-V1/pull/799)

- [Audit source tree](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b)
- [Repository coordination and full-plan contract](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [Contribution requirements](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)

The supplied v6 source clauses necessary to execute this plan are reproduced in REQUIREMENTS. Completion appendix substance is preserved in exact current source binding, complete owner/action checks, proper barriers/real cancellation, actual installed/live evidence, no invented backend/provider, and preservation of prior failures. Research rationale is summarized here: committed host authority and real external receipts outrank narratives; minimum destination-bound secret delivery is separate from process isolation; paired measured outcomes must retain denominators, costs and uncertainty. Research does not authorize a donor implementation or replace a platform proof.
