# M10: make external-task approval durable across crash, replay and rejection races

## META

Repository: skytuhua-org/Gen-V1. Plan revision: m01-m10-audit-r3-2026-11-24. Baseline: main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b. Parent review: https://github.com/skytuhua-org/Gen-V1/issues/1992. Author: codex-cloud-ca7d38. Status: SOURCE GAP VERIFIED; implementation and issue-specific reproduction pending. Date is 2026-11-23 Pacific time.

Source provenance: user-uploaded Expanded Source Research UX Memory Performance v3 dated 2026-11-14; Audited Execution Controlled Prompts v6 dated 2026-11-16; its Completion Follow-ups appendix. M10's authoritative clauses relevant to this issue are reproduced below so execution does not depend on the original chat or private attachment. Research v3 §17 P2-2/P2-3 supplies stable projection and persisted process-identity rationale. Audit source and exact repository paths are pinned in REFERENCES.

Attachment status: the actual GitHub file upload failed in the review environment. The complete Markdown source is published in this issue body. A separate .md file is provided with the review deliverables; it is not represented as a GitHub attachment. No repository-docs commit was permitted.

## OBJECTIVE

One explicit intake approval produces one durable task/input identity through the existing manual gates, even across interruption. Rejection or changed authority cannot be silently overwritten by an in-flight approval, and uncertain dispatch is reconciled before any retry.

### Verified current gap

`ExternalIntakeCoordinator.approve` protects concurrent approvals with an in-memory `approving` Set, then awaits `createTask` before committing the APPROVED decision/command receipt. Production `Service` generates new random IDs for thread.create and message.send for every call. A crash after a task is created but before the intake receipt commits leaves a replayable PROPOSED record and can produce another task on restart. A Set cannot prevent another host instance from entering the same approval.

While createTask is awaiting, `reject` can persist REJECTED. The final approval transaction returns early only for APPROVED; it otherwise overwrites the current record as APPROVED, including a concurrently rejected record. The existing concurrent test exercises only two calls to the same live coordinator, not the durable interruption window, second host or reject race. Existing Service integration proves manual-gate routing with a mock runtime, not authenticated live polling acceptance.

## REQUIREMENTS

Keep issue intake proposal-only until explicit approval. Poll only configured numeric repository ID, issue records and existing authenticated connection every 60 seconds. Preserve repository/node/updated_at dedupe, payload digest, source link, wrong-repository rejection, prompt-injection inertness and three classified transient read attempts with 1000/2000 ms delays. No webhooks, URL following, extra account request, automated push/merge/publish or elevated authority.

Use a durable approval intent and stable task/input command IDs allocated before side effects. Bind intent to proposal revision, payload digest, actor/host approval, selected project/model/account and current gates. Existing Intake disposition schema remains strict. If a private intermediate claim/uncertainty record is needed, define it explicitly without inserting illegal enum values. Use existing Store/outbox/receipts, not a second database. No await inside a transaction.

After dispatch begins, cancellation/rejection must truthfully represent what happened. Do not claim that a task already accepted by the runtime was never dispatched. On uncertain outcome retain the original identity and reconcile. Revalidate the host intake capability and accepted current owner/account/project/model authority at admission and before further effects/publication after await. Bind repository/config revision according to the reviewed T02 state table. The current config.enabled switch is documented as polling control; pausing polling is not automatically defined as revoking manual approval of an existing proposal. Preserve that distinction explicitly rather than inventing a new policy. Same approval replay returns original result; changed approval input conflicts. Store a stable created thread even if message.send fails, then resume only the undelivered input safely.

### Retained source clauses

**M10-C04.** IntakeV1: sourceInstallation, repositoryId, eventId, deliveryId, payloadDigest, receivedAt, proposedTask and disposition REJECTED|PROPOSED|APPROVED. External content is untrusted and cannot supply internal authority.

**M10-S09.** For initial GitHub intake use authenticated read-only polling through the existing configured GitHub connection, once per 60 seconds while explicitly enabled. Poll only the configured numeric repository ID and issue records. Deduplicate by repository ID, issue node ID and updated_at; retain the captured payload digest. Do not create a public webhook listener in v6. Untrusted issue text, URLs and claimed authors cannot authorize execution. A webhook implementation remains a separately gated requirement, not a silent substitute.

**M10-S10.** Route an approved external task through the same project, role and execution gates as a manual task. Unknown senders or inferred tasks remain proposals. Store source links and decisions. Do not auto-push, merge, publish or schedule arbitrary recurring work from external text.

**M10-S11.** Retry only host-classified transient read failures: 3 total attempts with delays of 1,000 ms and 2,000 ms before attempts 2 and 3. No retry after cancellation, authorization failure, validation failure, or uncertain nonreplayable dispatch. Persist every intended schedule occurrence. For missed interval firings record skipped occurrences and admit only the latest due occurrence; never burst-replay missed work.

**M10-U03.** External task inbox separates proposed from approved work and displays repository, authenticated source and duplicate/rejected state. Schedules expose next occurrence, timezone, pause and last actual run.

**M10-T05.** Forged webhook, wrong repository, duplicate delivery and prompt injection in issue text create no unauthorized execution.

**M10-D02.** Lease after uncertain dispatch. Expire a lease after external submission but before receipt; assert no second submit, and UNKNOWN until reconciliation.

**M10-D05.** Polling intake. Wrong repository, repeated issue revision and injected commands create no executor call; authorized new issue creates one proposal only.

**M10-G02.** Host-owned flags: jobs.backgroundV1, jobs.serviceLifetimeV1, jobs.idleReviewV1, integrations.intakeV1. Add only missing keys to the existing owner registry without replacing other registered keys; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M10-G03.** Rollback: Pause wakeups and intake, preserve occurrence/effect receipts and stop only owned jobs. Leave uncertain processes quarantined for inspection; do not erase the state needed for recovery.

### Cross-cutting constraints and exclusions

The review itself is read-only: no code, branch, commit, PR or flag changes were made or authorized in this audit. This execution plan records future work for the issue owner. Before implementation, read AGENTS.md, CONTRIBUTING.md, this entire issue, all comments, linked PRs and the latest checkpoint. Claim only an unowned exact scope and use an isolated current-main worktree. Preserve earlier implementation and review ownership. Post self-contained checkpoints at milestones and at most 20 minutes of uninterrupted work, and finish with RELEASE OWNER=NONE.

All user-supplied M10 requirements remain authoritative. This focused issue closes only its mapped gap; sister phases are neither deleted nor implicitly completed. Preserve host-owned flags jobs.backgroundV1, jobs.serviceLifetimeV1, jobs.idleReviewV1 and integrations.intakeV1, each default false. Do not add strict UI preferences or agent/plugin enablement. Preserve existing Store transactions and source-manifest/licensing rules. No dependency on completion of M12 or M14 is introduced.

Use the exact packageManager from current package.json and installed matching Node. At the audited baseline that is pnpm 10.30.3 and Node >=24.10.0. If no installed matching package manager or preprovisioned Corepack resolution exists, HOLD_TOOLCHAIN; do not download one under the source prompt. Build required assets before relevant tests. Tests must contain the required assertions, no passWithNoTests, skipped-required-case substitution, timeout inflation or different browser channel to force green.

### Dependencies and independent ownership

- #1956 has active operation/outbox recovery ownership; this is the intake-specific child scope, not a replacement.
- M09 accepted-input native delivery evidence remains a downstream dependency; a mock runtime cannot satisfy it.
- No webhook or M12/M14 expansion.

## REPO_MAP

All paths below were verified present at the pinned baseline. Any additional adapter, test or native integration path must be discovered in T01/T02 and recorded before edits; a proposed path is not evidence that an interface exists.

- `packages/core/external-intake.ts`
- `packages/core/service.ts`
- `packages/storage/store.ts`
- `packages/contracts/background-work.ts`
- `tests/external-intake-v3.test.ts`
- `tests/background-contract-decisions-v6.test.ts`
- `apps/web/src/BackgroundWork.tsx`
- `apps/server/hermes-service.ts`

## DESIGN

Transaction 1 checks the exact proposal revision and current authority, allocates stable thread.create/message.send identities and records a claim before any awaited creation. Outside the transaction the existing command/outbox path executes using those identities. Transaction 2 commits the observed result only if the same claim/revision still owns publication. Recovery first queries stored receipts and thread/input state. An in-flight rejection records cancellation intent or an explicit already-dispatched conflict according to the accepted state table, never silently loses the rejection.

Coordinate the generic outbox and operation reconciliation contract with active #1956. This issue owns intake-specific acceptance and state transitions. Prefer consuming the established replay-safe command API over rewriting its internals. Rollback pauses polling/approval admissions, preserves proposal, claim, receipt and created-task linkage, and reconciles uncertain work without duplicate delivery.

## EXECUTION_DAG

T01 -> T02 -> T03 -> T04. No overlapping implementation in shared files is parallelized without an explicit issue ownership split. Independent target-platform verification can run in parallel after the same immutable candidate is published.

### T01 Reproduce the interruption and concurrent rejection windows

**Dependencies:** NONE; read #1956 latest owner/PR. **Files / ownership boundary:** packages/core/external-intake.ts; packages/core/service.ts; tests/external-intake-v3.test.ts. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Create a real temporary Store. Pause createTask after thread creation and before intake decision. Simulate coordinator/host restart and reapprove. Also race two coordinator instances sharing the same Store and race reject against a pending createTask. Count thread.create, message.send, runtime starts, approval receipts and final dispositions. Avoid network or model execution in the reproduction.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Positive one approval and same-command replay; negative crash at each boundary, second host approval, changed model/project, reject during await and authorization revoked before send.

**Done when:** Tests expose the duplicate-task or overwritten-rejection gap using actual Store/Service boundaries and stable expected counts.

**Handoff recipient / prerequisite:** #1956 owner for shared receipt contract, then T02.

### T02 Define the durable intake claim and recovery table

**Dependencies:** T01. **Files / ownership boundary:** packages/contracts/background-work.ts; packages/core/external-intake.ts; packages/storage/store.ts read-only contract use. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Specify private claim fields, deterministic command identities, payload/revision commitment, accepted/rejected/uncertain states and old-record migration. Enumerate every interruption point: before claim, after claim, after thread, after input acceptance, before decision, after decision. Specify reject before vs after dispatch and how UI explains an already-started task. Agree boundary with #1956 without claiming its implementation files. Specify host capability revocation, account/project/model drift, configured repository or source-installation replacement, and polling-pause semantics separately. State whether a pending proposal remains manually approvable after polling pauses, and bind each decision to the existing accepted contract; unresolved policy is a named hold, not an implementation guess.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Review table proves no case regenerates a different thread/input identity to retry uncertain work; all conflicting replays reject and observed outcomes remain retained.

**Done when:** State and recovery contract is complete, strict-schema compatible and approved by shared outbox owner.

**Handoff recipient / prerequisite:** T03 intake implementer.

### T03 Implement stable dispatch and compare-before-publication

**Dependencies:** T02; accepted #1956 contract. **Files / ownership boundary:** packages/core/external-intake.ts; intake createTask closure in packages/core/service.ts; tests/external-intake-v3.test.ts. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Persist claim and stable IDs synchronously before awaiting. Pass those IDs through existing commands instead of randomizing per retry. Reconcile receipts before retry, resume only known undelivered work, and commit decision under the original claim/revision. Recheck host capability and accepted account/project/model authority after await. Apply the reviewed repository/config-revision binding and polling-pause semantics. If authority is revoked after thread creation, preserve the created-child link and original receipt/uncertainty, prohibit further input send or misleading APPROVED publication, and expose the observed partial state. Make reject and approve mutually consistent without falsely promising cancellation of already delivered work.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Run T01 cases across fresh process restart, not just a reused Set. Force failures of thread creation, message send and decision commit separately. Assert one thread and one accepted input for a successful approval; uncertain external/native delivery never resubmits blindly. Include host capability disabled before admission and during await, repository/config revision changed during approval, account/project/model drift, and polling paused while an existing proposal is manually approved according to the accepted T02 policy. Count no additional send after revoked authority; retain any already-created thread link.

**Done when:** Crash/replay/second-host/reject-race regressions pass with one durable identity and truthful UI state.

**Handoff recipient / prerequisite:** T04 integration/live verifier.

### T04 Verify actual inbox flow and controlled authenticated polling

**Dependencies:** T03; existing approved account/repository fixture. **Files / ownership boundary:** apps/web/src/BackgroundWork.tsx; tests/e2e/background-work.spec.ts; tests/external-intake-v3.test.ts; docs/implementation/v6/M10/. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Exercise actual proposed/approved/rejected/duplicate inbox states and Open child task. Use only the already approved account and numeric repository for a read-only polling acceptance lane; do not create external issues or execute issue content. Capture source revision/digest and prove one proposal, then explicit approval through manual gates in an authorized controlled fixture. Missing credentials make live polling NOT_RUN, not PASS.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Wrong repository, injection text, repeated revision, non-transient auth error, stop during retry, offline UI and stale approval. Verify secrets/tokens do not enter logs/artifacts.

**Done when:** Durable code behavior and live read-only connection evidence are separately recorded; required unrun live cases keep the phase partial.

**Handoff recipient / prerequisite:** Independent reviewer and #1992.

## VALIDATION

### Requirement-to-task-to-acceptance matrix

| Requirement | Tasks | Acceptance checks |
|---|---|---|
| M10-C04 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-S09 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-S10 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-S11 (intake transient-read retry and uncertain nonreplayable dispatch subclauses) | T01, T02, T03, T04 | A01, A02, A04; exact 3 attempts and 1000/2000 ms delays only for classified reads; no retry after cancellation/auth/validation/uncertain dispatch |
| M10-U03 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-T05 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-D02 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-D05 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-G02 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-G03 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |

- A01 crash at every boundary keeps stable task/input identity
- A02 two hosts and duplicate commands create at most one admitted task/input
- A03 rejection and authority revocation cannot be overwritten silently
- A04 manual gates, proposal-only polling, dedupe and retry rules retained
- A05 actual inbox plus approved authenticated read-only polling evidence

The full M10-S11 text is retained above. Scheduler occurrence persistence/latest-only catch-up is owned by #2017 and is not closed by this intake plan. The matrix maps the original clauses to the issue's concrete checks. Requirements outside this focused issue retain their existing M10 gates; passing these rows alone does not close the whole milestone.

### Planned commands and evidence

Discover any changed script in current package.json and record the difference before comparing receipts. Execute each command separately and retain its actual exit code, test counts and bounded redacted log hash. Required asset builds include pnpm build:widgets and the native credential-lease build when the test lane requires it. Missing native tooling is a hold for its dependent lane, not an alternate test:no-lease release pass.

```text
node --version
pnpm --version
pnpm build:widgets
pnpm build:credential-lease
pnpm exec vitest run tests/background-work-v3.test.ts
pnpm exec vitest run tests/human-handoff-v3.test.ts
pnpm exec vitest run tests/external-intake-v3.test.ts
pnpm exec vitest run tests/background-contract-decisions-v6.test.ts
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:browser
```

Use the existing reviewed native/installed workflow with its exact test matrix. Discover the actual workflow and declared test projects before scheduling a run; do not invent a passing job name. Browser fixture tests supplement actual App/installed tests, not replace them. Native Windows/Linux, approved model, authenticated intake and supervisor lanes are separate receipts. Observe source-bound positive and negative results on the actual declared target. Do not use an injected fake as an end-to-end production receipt.

Update docs/implementation/v3/M10-verification.json using implementationEvidenceV3Schema, validateImplementationEvidence and bundleStatus from packages/contracts/implementation-evidence.ts. Keep strict persisted enum values, store HOLD_* as reasons and never persist computed bundleStatus into the strict object. Record requirement-to-code-to-test links, base and candidate source identities, exact commands, artifact hashes and remainingGates under docs/implementation/v6/M10/. Keep historical evidence separate. A schema validator PASS is evidence integrity only. Production flags and reviewerApproval remain false until separately authorized. Required unrun/failed/blocked phases prevent full completion.

### Actually executed during this review

Read-only source, test and issue/PR inspection at the baseline above. No product test suite or installed/native lane was executed for M10. The available pnpm is 11.25.0, while the required 10.30.3 Corepack resolution is absent with networking disabled; Node is 24.22.3. Product validation is NOT_RUN/HOLD_TOOLCHAIN. Existing historical author/CI test claims were read but are not relabeled as this review's results. No issue-specific reproducer has been executed in this audit; T01 must establish it before implementation.

## STATE

Researched: complete source clauses, relevant implementation/tests, current production composition, and existing issue/PR overlap. Decided: retain the approved architecture and close this specific gap; no scope deletion or activation. Implemented in this review: none. Verified product acceptance in this review: none. T01-T04: NOT_STARTED for implementation, with T01 source premise inspected. Planning owner releases after publication; implementation owner remains whoever holds the earliest authorized exact claim in the issue journal.

Next action: refresh this issue and related PR ownership, pin current main, reproduce T01 using the exact supported toolchain in an isolated worktree, and post START/ACK with source identity and scope. Stop only the dependent phase for a named missing prerequisite. Deliver the first failing regression or evidence discrepancy before editing. Retain a self-contained checkpoint and final RELEASE OWNER=NONE when stopping. No changes to M12 or M14 are included.

Publication gate: full issue body must compare byte-for-byte with the real UTF-8 .md source. The publisher records the source SHA256, issue URL, readback result and attachment limitation in an append-only comment. Do not claim HANDOFF_COMPLETE unless the full body is retrievable; file-upload success is a separate fact.

## REFERENCES

- Parent review and published issue index: https://github.com/skytuhua-org/Gen-V1/issues/1992
- Repository instructions: https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md
- Contribution guide: https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md
- M10 original implementation PR: https://github.com/skytuhua-org/Gen-V1/pull/501 (merged, historical source only)
- M10 v6 evidence PR: https://github.com/skytuhua-org/Gen-V1/pull/837 (merged, historical evidence only)
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/external-intake.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/storage/store.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/background-work.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/external-intake-v3.test.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/background-contract-decisions-v6.test.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/BackgroundWork.tsx
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/hermes-service.ts
