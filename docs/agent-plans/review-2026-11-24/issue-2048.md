# M10: connect approved RUN execution and prove native process custody

## META

Repository: skytuhua-org/Gen-V1. Plan revision: m01-m10-audit-r3-2026-11-24. Baseline: main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b. Parent review: https://github.com/skytuhua-org/Gen-V1/issues/1992. Author: codex-cloud-ca7d38. Status: SOURCE GAP VERIFIED; implementation and issue-specific reproduction pending. Date is 2026-11-23 Pacific time.

Source provenance: user-uploaded Expanded Source Research UX Memory Performance v3 dated 2026-11-14; Audited Execution Controlled Prompts v6 dated 2026-11-16; its Completion Follow-ups appendix. M10's authoritative clauses relevant to this issue are reproduced below so execution does not depend on the original chat or private attachment. Research v3 §17 P2-2/P2-3 supplies stable projection and persisted process-identity rationale. Audit source and exact repository paths are pinned in REFERENCES.

Attachment status: the actual GitHub file upload failed in the review environment. The complete Markdown source is published in this issue body. A separate .md file is provided with the review deliverables; it is not represented as a GitHub attachment. No repository-docs commit was permitted.

## OBJECTIVE

An approved ordinary background command must use the actual admitted M03 launch boundary and remain controllable by its exact owner on each declared platform. RUN support must be certified independently of service survival and idle model forks.

### Verified current gap

`apps/server/hermes-service.ts` constructs the production background execution gate with `backends: []` and no selected approved backend or project trust. A valid policy decision cannot reach an installed approved executor through that composition. `packages/core/execution-policy.ts` explicitly states that the policy decides and never launches; its ExecutionBackend exposes the reviewed `launch` contract. In contrast, `BackgroundWorkCoordinator.launch` directly calls Node `spawn` after receiving a boolean decision. The coordinator must consume the admitted launch capability, not reinterpret ALLOW as proof that raw spawn is confined.

`captureCreationToken` and `verifyProcessIdentity` in `packages/core/background-work.ts` implement Linux `/proc/<pid>/stat` identity only. Non-Linux returns null/UNPROVEN. `stopCommand` safely refuses to signal an unproven identity; `resolveProcessExit` requires a non-null matching token. The live child exit callback separately compares stored and session tokens and currently accepts matching null tokens. This is not equivalent to restart reconciliation: T03 must define and test reviewed live-handle evidence versus durable restart identity, without claiming every Windows live exit already remains UNKNOWN. Those honest read/stop/reconciliation denials do not demonstrate positive Windows RUN support. Existing tests prove some Linux/fixture behavior and explicitly accept missing platform proof. Current native acceptance has not been rerun.

Existing owner revalidation after the asynchronous gate is present and must be preserved. The missing proof is the binding to the concrete approved backend and platform identity, not absence of every owner check. Ordinary command RUN currently acquires no model capacity permit. M10-S08 applies to paths that actually acquire one; do not add arbitrary model permits to shell commands. Idle/model permit qualification remains with #576.

Human request schemas, revision checks, replay receipts, decline behavior and the outbox bridge are present. The human-flow work below is current App/native qualification of those preserved behaviors, not an asserted new implementation defect.

## REQUIREMENTS

Do not select, install, or emulate a confinement backend in this issue. Consume the approved backend decision and proof from #774 and the M03 owner. Preserve exact executable digest/argv/cwd, current project trust, grants, run/epoch/account/workspace and profile version through launch. A stale decision after an await denies launch. No TRUSTED_HOST fallback, copied runtime, shell-text substitution, or ambient-secret inheritance is permitted.

Store PID plus an OS-derived creation identity or an equivalent reviewed process handle identity. Never use PID alone, wall-clock guesses or a filename as proof. Validate identity before live output or stop. Orphans, reused PIDs, missing acknowledgments and vanished processes remain UNKNOWN with outcome=null. A native terminal receipt, not timeout/UI closure, controls settlement and capacity release. Preserve bounded shutdown, foreground priority and user-visible UNKNOWN state. Source contracts remain strict; new proof fields require contract review and migration tests.

### Retained source clauses

**M10-C01.** Proposed BackgroundWorkV1: workId, owner: ToolOwner, kind COMMAND|REVIEW|MAINTENANCE|EXTERNAL_TASK, effectId|null, processIdentity|null, lifetime RUN|APPROVED_SERVICE, state QUEUED|RUNNING|WAITING_HUMAN|WAITING_EVENT|BLOCKED|SETTLED|UNKNOWN, outcome SUCCEEDED|FAILED|CANCELLED|null, blockedReason|null, leaseGeneration, leaseExpiresAtMs|null, deadlineMs and outputRef|null. Reuse ToolOwner from packages/contracts/tool-effects.ts. SETTLED requires an observed terminal outcome; UNKNOWN must have outcome=null. RUN is the default lifetime.

**M10-S02.** Add owned background command state without detaching ownership. Foreground timeout may offer Continue in background only for a permitted profile. Retain exact process identity including creation token, not PID alone, and preserve bounded output with cursor-based retrieval.

**M10-S03.** After host loss, RUN-lifetime commands become UNKNOWN until an exact owned-process exit/teardown receipt resolves them. Do not promise survival. APPROVED_SERVICE stays unavailable unless the recorded installed supervisor identity, authentication, reconnect and cancellation contract have target-platform PASS evidence. Do not select, install or write another supervisor in this task to bypass that gate.

**M10-S04.** Wake-ups revalidate current account, project, grants, budget and task state. A stale lease or changed epoch may trigger reconciliation but cannot revive prior authority. Missing provider or permission produces BLOCKED without a tight retry loop.

**M10-S08.** Keep model capacity permits until confirmed native teardown. Account lease release is not inferred from a timeout or closed UI. Separate background advisory outputs from foreground messages until structured settlement.

**M10-S12.** Add explicit stop/drain behavior during shutdown: no new admission, cancel eligible work, wait a bounded time for owned teardown and record uncertainty. Never mark SETTLED solely because a process vanished.

**M10-T02.** PID reuse, orphan process, broken supervisor connection and missing exit acknowledgment yield UNKNOWN rather than success.

**M10-G01.** Contracts and ordinary owned background jobs can pass independently of an OS service. Persistent service lifetime and idle/source forks remain unavailable until their actual integrations are demonstrated. External task approval is not inferred from repository write access.

**M10-G02.** Host-owned flags: jobs.backgroundV1, jobs.serviceLifetimeV1, jobs.idleReviewV1, integrations.intakeV1. Add only missing keys to the existing owner registry without replacing other registered keys; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M10-G03.** Rollback: Pause wakeups and intake, preserve occurrence/effect receipts and stop only owned jobs. Leave uncertain processes quarantined for inspection; do not erase the state needed for recovery.

### Preserved human-response qualification clauses

**M10-C03.** HumanStepV1: requestId, owner, questionRevision, responseSchema, requiredAction, deliveryState and resumeBinding. A response is correlated input; an action approval still requires its exact M02 envelope.

**M10-S05.** Human-step requests pause automatic retries. Correlate accepted response to exact request revision and owner, then enqueue one durable follow-up. Credential entry uses a secure host surface, never plaintext message content. A stale answer to a superseded request is rejected.

**M10-U02.** Human-action cards explain the exact blocked step and expose secure Respond or Decline actions. Dismiss notification is not completion or approval.

**M10-T04.** Stale human response, duplicate response and response for another thread do not resume the wrong work.

**M10-D04.** Human answer replay. Replay the same answer and a changed answer; assert one delivery for the former, CONFLICT for the latter, no new approval grant.

### Cross-cutting constraints and exclusions

The review itself is read-only: no code, branch, commit, PR or flag changes were made or authorized in this audit. This execution plan records future work for the issue owner. Before implementation, read AGENTS.md, CONTRIBUTING.md, this entire issue, all comments, linked PRs and the latest checkpoint. Claim only an unowned exact scope and use an isolated current-main worktree. Preserve earlier implementation and review ownership. Post self-contained checkpoints at milestones and at most 20 minutes of uninterrupted work, and finish with RELEASE OWNER=NONE.

All user-supplied M10 requirements remain authoritative. This focused issue closes only its mapped gap; sister phases are neither deleted nor implicitly completed. Preserve host-owned flags jobs.backgroundV1, jobs.serviceLifetimeV1, jobs.idleReviewV1 and integrations.intakeV1, each default false. Do not add strict UI preferences or agent/plugin enablement. Preserve existing Store transactions and source-manifest/licensing rules. No dependency on completion of M12 or M14 is introduced.

Use the exact packageManager from current package.json and installed matching Node. At the audited baseline that is pnpm 10.30.3 and Node >=24.10.0. If no installed matching package manager or preprovisioned Corepack resolution exists, HOLD_TOOLCHAIN; do not download one under the source prompt. Build required assets before relevant tests. Tests must contain the required assertions, no passWithNoTests, skipped-required-case substitution, timeout inflation or different browser channel to force green.

### Dependencies and independent ownership

- #774 owns approved Windows confinement selection/proof; do not take its implementation scope.
- #1031 owns combined M01/M02 runtime acceptance.
- #2042 owns the M09 native accepted-input/acknowledgment dependency. T05 consumes its proven contract and does not take over that implementation.
- Human response is correlated input only; any actual action still requires its separate exact M02 approval envelope.
- #575 owns APPROVED_SERVICE; #576 owns fork/idle phases.
- Coordinate narrowly scoped edits to background-work.ts with the continuation and output plans through #1992.

## REPO_MAP

All paths below were verified present at the pinned baseline. Any additional adapter, test or native integration path must be discovered in T01/T02 and recorded before edits; a proposed path is not evidence that an interface exists.

- `apps/server/hermes-service.ts`
- `packages/core/background-work.ts`
- `packages/core/execution-policy.ts`
- `packages/contracts/background-work.ts`
- `packages/contracts/execution-profile.ts`
- `packages/core/service.ts`
- `packages/runtime/model-capacity.ts`
- `tests/background-work-v3.test.ts`
- `tests/background-contract-decisions-v6.test.ts`
- `tests/human-handoff-v3.test.ts`
- `tests/e2e/background-work.spec.ts`
- `apps/server/background-routes.ts`
- `apps/web/src/BackgroundWork.tsx`

## DESIGN

Change the composition so that execution admission returns or binds an immutable capability to the exact backend launch and owned process session. The existing ExecutionBackend interface is an anchor, not a claim that it already exposes stdout/creation-token/reconciliation primitives. T02 must reconcile the concrete approved backend interface with M10's needs and document the accepted extension before dependent implementation. If that interface or Windows backend proof is absent, record HOLD_EXECUTION_PROFILE for that phase and complete independent negative tests.

The durable Store record owns identity and lease. Live session objects hold native resources but cannot manufacture durable success. Reconnection observes an existing process using the pinned native identity; it never respawns uncertain work. On migration, records without adequate identity remain UNKNOWN and readable as historical metadata. Rollback pauses admissions, stops only provably owned processes, retains receipts and leaves unproven processes quarantined.

## EXECUTION_DAG

T01 -> T02 -> T03 -> T04. T05 begins after T01 source refresh and requires the proven M09 native accepted-input contract for its native phase; its deterministic human-contract cases can proceed independently of a blocked OS backend. No overlapping implementation in shared files is parallelized without an explicit issue ownership split. Independent target-platform verification can run in parallel after the same immutable candidate is published.

### T01 Reproduce the production admission and platform gap

**Dependencies:** NONE. **Files / ownership boundary:** apps/server/hermes-service.ts; packages/core/background-work.ts; tests/background-work-v3.test.ts. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Pin current main and refresh #774 ownership/proofs. Trace createHermesService -> Service.background -> executionGate -> startCommand -> launch. Build a production-composition fixture that supplies a valid profile/trust and records which concrete backend launch method is invoked. Capture Linux and Windows creation-token and stop behavior separately. Record absence of an approved backend as BLOCKED, not a product failure disguised as a fake backend.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Positive: approved fixture backend is the sole launch recorder. Negative: missing backend, wrong profile version, wrong platform proof, owner drift during await, null token and PID mismatch.

**Done when:** A reproducible baseline proves the missing composition and native matrix, with exact current paths and no launches to unapproved hosts.

**Handoff recipient / prerequisite:** M03 backend owner for accepted launch binding; T02 only after interface agreement.

### T02 Bind admission to the actual backend capability

**Dependencies:** T01; approved M03 interface/proof. **Files / ownership boundary:** packages/core/execution-policy.ts; packages/core/background-work.ts; apps/server/hermes-service.ts. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Document the exact immutable admission record and backend handle needed for output, cancellation, exit observation and creation identity. Reuse approved M03 contracts. Remove the boolean-to-raw-spawn ambiguity for this path. Revalidate owner and profile after asynchronous approval and immediately before the only launch. Carry approved environment and secret references through the backend; do not spread process.env as an authority shortcut.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Count exactly one backend launch for a valid request. Rejected, expired, ambiguous, reconfigured and cross-owner admissions launch zero times. Concurrent starts share one durable admission; no second process.

**Done when:** Production composition invokes the proven backend with exactly the admitted arguments and cannot reach raw unrestricted fallback.

**Handoff recipient / prerequisite:** T03 process-custody implementer; report precise interface and proof SHA.

### T03 Implement supported-platform identity and confirmed teardown

**Dependencies:** T02. **Files / ownership boundary:** packages/core/background-work.ts; packages/contracts/background-work.ts; approved native backend paths discovered in T02. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Capture OS-backed creation identity atomically with launch. Validate live identity for output/stop, including process-tree ownership. Persist terminal receipts under the original work/effect identity. Reconcile restart UNKNOWN only with an exact owned receipt. Preserve custody of resources actually acquired until confirmed native teardown, including stop timeout and delayed terminal acknowledgment. Distinguish in-process child-handle exit evidence from restart/PID reconciliation; specify which native identity is sufficient at each boundary. Add a live-exit case with null creationToken and prohibit treating null equality alone as OS identity proof. Do not introduce model permits for ordinary shell commands; consume #576 evidence for paths that acquire model permits. Keep unsupported platform behavior explicit.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Real Linux and Windows owned child+grandchild: normal success, failure, cancellation, timed drain, abrupt host loss, reused PID simulation, unproven token and delayed receipt. Verify no unrelated process is signaled. For model paths that acquire a permit, verify no release before teardown under #576 ownership; ordinary shell commands must not acquire invented model permits. Test a direct live-child exit with null tokens separately from restart reconciliation.

**Done when:** Declared native targets have source-bound positive and negative results; unsupported targets remain blocked without claiming completion.

**Handoff recipient / prerequisite:** T04 installed verifier with exact package/hash and process fixture.

### T04 Prove application and installed RUN lifecycle

**Dependencies:** T02,T03; output-custody plan when output handle is asserted. **Files / ownership boundary:** apps/web/src/BackgroundWork.tsx; apps/server/background-routes.ts; tests/e2e/background-work.spec.ts; docs/implementation/v6/M10/. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Use the actual application drawer and an installed approved profile. Start work, observe identity/output, stop, close/reopen host and inspect uncertainty. Verify Waiting/Running/Blocked/Completed outcome/Unknown labels and close warning. Exercise a scheduled approved RUN across changed account/project/grant/budget/epoch and missing-provider cases; stale leases must not revive old authority, and BLOCKED must not produce a tight retry loop. Run the four named M10 suites and every repository gate separately. Keep default flags false in persisted product configuration; a controlled acceptance fixture is not activation approval.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Actual production surface and installed Windows/Linux lanes. Verify no survival claim for RUN and no service or fork flag enabled by a RUN pass.

**Done when:** All RUN criteria have exact source, platform, binary and command evidence; unmet backend/native criteria remain listed.

**Handoff recipient / prerequisite:** Independent reviewer and #1992 status index.

### T05 Qualify the preserved human response flow through the actual App and native input boundary

**Dependencies:** T01 source/toolchain refresh; #2042 native accepted-input contract and approved native runtime fixture for native checks. Deterministic contract and App checks may proceed while native proof is blocked. **Files / ownership boundary:** packages/contracts/background-work.ts; packages/core/background-work.ts (requestHumanStep/respondHumanStep/declineHumanStep); packages/core/service.ts background human commands and outbox delivery; apps/web/src/BackgroundWork.tsx actual App path; apps/server/background-routes.ts; tests/human-handoff-v3.test.ts; tests/background-contract-decisions-v6.test.ts; tests/e2e/background-work.spec.ts. Qualification owns tests/evidence; any discovered code defect first gets an exact reproducible case and ownership agreement.

**Inputs and executable steps:** Pin one source cut and create owned work with a human request bound to its exact thread/run/epoch/account/project and question revision. Use the actual installed App to inspect the blocked step and submit a schema-valid response. Observe one stable human:<requestId>:<revision> accepted-input identity, one durable follow-up and the real native acknowledgment under the existing M09 contract. Restart before/after receipt persistence and before/after native acknowledgment; reconcile the same identity without blind resubmission. Retain redacted receipts and exact source/binary/runtime identities. The pure coordinator or demo fixture is supplemental evidence only.

Submit the identical response again and require the original receipt with no second delivery. Submit different content for the same request revision and require CONFLICT. Supersede the request and submit its old revision; attempt a foreign-thread response, owner/account/epoch drift, malformed schema and a response after Decline. Each must preserve current owner/state and produce no unintended resume. While WAITING_HUMAN, inspect scheduler/automatic-retry state and prove it remains paused until the correlated decision.

Use the actual card's Respond and Decline controls, keyboard focus, pending/error states and notification dismissal. Decline must record DECLINED and never approval. Dismissing a notification must not settle or resume work. Human answers must not mint M02 approvals or grants. For credential-required steps, prove plaintext answer submission is rejected and credentials are handled only by an existing approved host credential surface; discover that surface and mark its required evidence BLOCKED if absent. Never invent a secret-entry input or log secret content.

**Outputs:** per-clause qualification table, exact commands and redacted native receipt identities, App/browser artifacts, observed failures and remaining gates. Record product changes separately if later authorized and proven necessary.

**Positive and negative validation:** A07-A10 below; unit host integration and actual App/native lanes remain separate. A mock send promise is not a native accepted/handled receipt. Count Store outbox records, accepted input IDs, native deliveries, request revisions and approval grants before and after each case.

**Done when:** C03/S05/U02/T04/D04 each have a current source-bound result at their required level, the one-delivery/replay/conflict boundary is demonstrated, and all required native/credential cases are either PASS or explicitly prevent full completion. No activation follows from qualification.

**Handoff recipient / prerequisite:** #2042 accepted-input owner for missing native evidence; #1031 M02 owner for action-approval dependencies; independent reviewer and #1992 for final status.

## VALIDATION

### Requirement-to-task-to-acceptance matrix

| Requirement | Tasks | Acceptance checks |
|---|---|---|
| M10-C01 | T02, T03, T04 | A01, A03, A04, A06 |
| M10-S02 | T02, T03, T04 | A01, A03, A06; continuation #2016 and output #2014 remain separate |
| M10-S03 | T03, T04 | A03, A04, A06; service #575 remains separate |
| M10-S04 | T01, T02, T04 | A02; scheduled current-authority and no tight retry checks |
| M10-S08 | T03, T04 | A05; only acquired model permits, coordinated with #576 |
| M10-S12 | T03, T04 | A03, A04, A06 |
| M10-T02 | T03, T04 | A03, A04; service-specific proof #575 |
| M10-G01 | T04, T05 | A06, A10; independent phase holds retained |
| M10-G02 | T01, T04, T05 | A02, A06, A10; default-off host flags unchanged |
| M10-G03 | T03, T04, T05 | A04, A06, A10; preserve uncertainty and receipts |
| M10-C03 | T05 | A07, A08, A10 |
| M10-S05 | T05 | A07, A09, A10 |
| M10-U02 | T05 | A09, A10 |
| M10-T04 | T05 | A07, A08 |
| M10-D04 | T05 | A07, A08, A10 |

- A01 production approved backend invoked once; no raw-spawn fallback
- A02 changed owner/profile/grants denied before launch
- A03 native PID+creation identity, read and stop verified on each target
- A04 crash/orphan/reused PID/no acknowledgment remains UNKNOWN
- A05 foreground and teardown custody demonstrated for acquired resources; model permit evidence only for actual model paths, with #576
- A06 actual drawer and installed lifecycle receipts; all named gates recorded
- A07 exact request revision/owner binds one durable follow-up and proven native delivery; restart keeps the same input identity
- A08 identical replay returns original receipt; changed replay is CONFLICT; stale/foreign/owner-drift/schema-invalid answers resume no work
- A09 real App blocked-step explanation, secure Respond/Decline, focus and error states; credential answers reject plaintext and require the approved host surface
- A10 human wait pauses automatic retries; Decline/dismissal/replay never grants action approval; native delivery uncertainty and separate phase holds remain explicit

The matrix maps the original clauses to the issue's concrete checks. Requirements outside this focused issue retain their existing M10 gates; passing these rows alone does not close the whole milestone.

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

Researched: complete source clauses, relevant implementation/tests, current production composition, and existing issue/PR overlap. Decided: retain the approved architecture and close this specific gap; no scope deletion or activation. Implemented in this review: none. Verified product acceptance in this review: none. T01-T05: NOT_STARTED for implementation, with T01 source premise inspected. Planning owner releases after publication; implementation owner remains whoever holds the earliest authorized exact claim in the issue journal.

Next action: refresh this issue and related PR ownership, pin current main, reproduce T01 using the exact supported toolchain in an isolated worktree, and post START/ACK with source identity and scope. Stop only the dependent phase for a named missing prerequisite. Deliver the first failing regression or evidence discrepancy before editing. Retain a self-contained checkpoint and final RELEASE OWNER=NONE when stopping. No changes to M12 or M14 are included.

Publication gate: full issue body must compare byte-for-byte with the real UTF-8 .md source. The publisher records the source SHA256, issue URL, readback result and attachment limitation in an append-only comment. Do not claim HANDOFF_COMPLETE unless the full body is retrievable; file-upload success is a separate fact.

## REFERENCES

- Parent review and published issue index: https://github.com/skytuhua-org/Gen-V1/issues/1992
- Repository instructions: https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md
- Contribution guide: https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md
- M10 original implementation PR: https://github.com/skytuhua-org/Gen-V1/pull/501 (merged, historical source only)
- M10 v6 evidence PR: https://github.com/skytuhua-org/Gen-V1/pull/837 (merged, historical evidence only)
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/hermes-service.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/background-work.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/execution-policy.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/background-work.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/execution-profile.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/runtime/model-capacity.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/background-work-v3.test.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/background-contract-decisions-v6.test.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/BackgroundWork.tsx

- https://github.com/skytuhua-org/Gen-V1/issues/2042
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/human-handoff-v3.test.ts
