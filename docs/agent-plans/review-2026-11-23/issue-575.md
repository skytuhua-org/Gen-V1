**Full current issue mirror:** [issue-575.md](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-575.md). The publication checkpoint pins the exact commit.

Publication supplement `cleanup-2026-11-23-r2` under #1803: the complete concurrent plan published under #1992 is preserved verbatim below. Its implementation and approval gates remain open.

# M10: qualify the approved installed supervisor for service-lifetime work

## META

Repository: skytuhua-org/Gen-V1. Plan revision: m01-m10-audit-r2-2026-11-23. Baseline: main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b. Parent review: https://github.com/skytuhua-org/Gen-V1/issues/1992. Author: codex-cloud-ca7d38. Status: SOURCE GAP VERIFIED; implementation and issue-specific reproduction pending. Date is 2026-11-23 Pacific time.
Existing canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/575. This revision supplements the preserved original requirement, not its implementation ownership. Prior plan at the pinned path in REFERENCES remains historical; this entire issue body is the current executable plan.

Source provenance: user-uploaded Expanded Source Research UX Memory Performance v3 dated 2026-11-14; Audited Execution Controlled Prompts v6 dated 2026-11-16; its Completion Follow-ups appendix. M10's authoritative clauses relevant to this issue are reproduced below so execution does not depend on the original chat or private attachment. Research v3 §17 P2-2/P2-3 supplies stable projection and persisted process-identity rationale. Audit source and exact repository paths are pinned in REFERENCES.

Attachment status: the actual GitHub file upload failed in the review environment. The complete Markdown source is published in this issue body. A separate .md file is provided with the review deliverables; it is not represented as a GitHub attachment. No repository-docs commit was permitted.

## OBJECTIVE

Only an explicitly approved, installed, target-platform supervisor may admit APPROVED_SERVICE jobs. Its identity, authentication, reconnect, cancellation and restart behavior must be demonstrated and remain under exact host custody.

### Verified current gap

Existing #575 correctly records HOLD_SUPERVISOR. Its prior versioned plan at docs/agent-plans/575-approve-an-os-supervisor-for-service-lifetime-backgr.md is preserved as history. Current BackgroundWorkCoordinator keeps APPROVED_SERVICE blocked; closeSummary reports no proven supervisor. The merged #837 deterministic/installed-workflow evidence did not introduce or prove a real supervisor contract. RUN tests and a green installation workflow cannot establish service survival.

The old issue lists possible systemd user units or Windows service/Task Scheduler and asks for a choice/operator approval/restart-custody evidence. Those are candidate examples, not authorization to select/install one during this audit. The authoritative v6 S03 explicitly forbids choosing, installing or writing another supervisor merely to bypass the gate. This revision preserves the requested end state and makes operator-supplied approval a prerequisite.

## REQUIREMENTS

Preserve all original #575 completion criteria: a supervisor decision for each supported platform, an operator approval flow, and evidence that service work is supervised, restarts correctly and remains under host custody. Selection/installation requires an explicit accepted operator decision outside this read-only review. Until it exists, keep HOLD_SUPERVISOR and complete only independent design/negative checks.

Approval identifies supervisor product/version/binary or service identity, platform, installation provenance, operator account boundary, job identity, authentication channel, reconnect contract and stop/teardown acknowledgment. Do not silently choose any example product. Do not inherit authority from a running daemon or repository write access. Revalidate current owner, grants, backend proof and profile at service admission/reconnect. No success from a lost connection, timeout or missing PID. Record UNKNOWN for uncertain work and never auto-resubmit.

The close warning must state whether the exact work stops with the app or uses a proven supervisor. Laptop sleep execution is never promised. Keep jobs.serviceLifetimeV1 independently default false; qualified fixture evidence does not authorize product activation.

### Retained source clauses

**M10-C01.** Proposed BackgroundWorkV1: workId, owner: ToolOwner, kind COMMAND|REVIEW|MAINTENANCE|EXTERNAL_TASK, effectId|null, processIdentity|null, lifetime RUN|APPROVED_SERVICE, state QUEUED|RUNNING|WAITING_HUMAN|WAITING_EVENT|BLOCKED|SETTLED|UNKNOWN, outcome SUCCEEDED|FAILED|CANCELLED|null, blockedReason|null, leaseGeneration, leaseExpiresAtMs|null, deadlineMs and outputRef|null. Reuse ToolOwner from packages/contracts/tool-effects.ts. SETTLED requires an observed terminal outcome; UNKNOWN must have outcome=null. RUN is the default lifetime.

**M10-S03.** After host loss, RUN-lifetime commands become UNKNOWN until an exact owned-process exit/teardown receipt resolves them. Do not promise survival. APPROVED_SERVICE stays unavailable unless the recorded installed supervisor identity, authentication, reconnect and cancellation contract have target-platform PASS evidence. Do not select, install or write another supervisor in this task to bypass that gate.

**M10-S08.** Keep model capacity permits until confirmed native teardown. Account lease release is not inferred from a timeout or closed UI. Separate background advisory outputs from foreground messages until structured settlement.

**M10-S12.** Add explicit stop/drain behavior during shutdown: no new admission, cancel eligible work, wait a bounded time for owned teardown and record uncertainty. Never mark SETTLED solely because a process vanished.

**M10-U04.** An application-close warning states whether work stops with the app or uses a proven service supervisor. Never promise laptop-sleep execution.

**M10-T02.** PID reuse, orphan process, broken supervisor connection and missing exit acknowledgment yield UNKNOWN rather than success.

**M10-G01.** Contracts and ordinary owned background jobs can pass independently of an OS service. Persistent service lifetime and idle/source forks remain unavailable until their actual integrations are demonstrated. External task approval is not inferred from repository write access.

**M10-G02.** Host-owned flags: jobs.backgroundV1, jobs.serviceLifetimeV1, jobs.idleReviewV1, integrations.intakeV1. Add only missing keys to the existing owner registry without replacing other registered keys; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M10-G03.** Rollback: Pause wakeups and intake, preserve occurrence/effect receipts and stop only owned jobs. Leave uncertain processes quarantined for inspection; do not erase the state needed for recovery.

### Cross-cutting constraints and exclusions

The review itself is read-only: no code, branch, commit, PR or flag changes were made or authorized in this audit. This execution plan records future work for the issue owner. Before implementation, read AGENTS.md, CONTRIBUTING.md, this entire issue, all comments, linked PRs and the latest checkpoint. Claim only an unowned exact scope and use an isolated current-main worktree. Preserve earlier implementation and review ownership. Post self-contained checkpoints at milestones and at most 20 minutes of uninterrupted work, and finish with RELEASE OWNER=NONE.

All user-supplied M10 requirements remain authoritative. This focused issue closes only its mapped gap; sister phases are neither deleted nor implicitly completed. Preserve host-owned flags jobs.backgroundV1, jobs.serviceLifetimeV1, jobs.idleReviewV1 and integrations.intakeV1, each default false. Do not add strict UI preferences or agent/plugin enablement. Preserve existing Store transactions and source-manifest/licensing rules. No dependency on completion of M12 or M14 is introduced.

Use the exact packageManager from current package.json and installed matching Node. At the audited baseline that is pnpm 10.30.3 and Node >=24.10.0. If no installed matching package manager or preprovisioned Corepack resolution exists, HOLD_TOOLCHAIN; do not download one under the source prompt. Build required assets before relevant tests. Tests must contain the required assertions, no passWithNoTests, skipped-required-case substitution, timeout inflation or different browser channel to force green.

### Dependencies and independent ownership

- Reuse #575; prior versioned plan and comments remain intact as history.
- #774 approved backend proof precedes service admission.
- PR #837 is merged historical evidence, not supervisor qualification.
- #576 fork/idle and ordinary RUN remain separately gated.

## REPO_MAP

All paths below were verified present at the pinned baseline. Any additional adapter, test or native integration path must be discovered in T01/T02 and recorded before edits; a proposed path is not evidence that an interface exists.

- `packages/core/background-work.ts`
- `packages/contracts/background-work.ts`
- `apps/server/hermes-service.ts`
- `packages/core/service.ts`
- `apps/web/src/BackgroundWork.tsx`
- `tests/background-work-v3.test.ts`
- `docs/implementation/v6/M10/`
- `docs/agent-plans/575-approve-an-os-supervisor-for-service-lifetime-backgr.md`

## DESIGN

A supervisor adapter consumes an approved immutable service proof, launches through the M03 boundary and returns durable job/process identity and authenticated observation/control handles. A Store service record binds that identity to original work/effect/owner and lease generation. On host restart, reconnect authenticates the same job, verifies creation identity and reconciles state before further actions. An ambiguous/mismatched/lost connection cannot create a replacement job. Bounded stop waits for a supervisor/native teardown acknowledgment and retains permits until confirmed.

Define the adapter only after the exact operator-supplied contract is accepted. Keep ordinary RUN independent. Rollback disables new service admissions, stops only proved owned jobs when authorized, and preserves uncertain service records for inspection. A supervisor upgrade invalidates old proof until the declared compatibility criteria pass.

## EXECUTION_DAG

T01 -> T02 -> T03 -> T04. No overlapping implementation in shared files is parallelized without an explicit issue ownership split. Independent target-platform verification can run in parallel after the same immutable candidate is published.

### T01 Preserve hold and collect the exact approved supervisor decision

**Dependencies:** NONE. **Files / ownership boundary:** existing issue #575; packages/core/background-work.ts; operator-provided installed target evidence. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Refresh the entire issue, comments, previous plan and M03 proof. Inventory supported platforms and available already-approved supervisors. Record exact version/identity/auth/reconnect/stop contract and who approved it. If absent, publish HOLD_SUPERVISOR with the missing fields and release the blocked implementation scope; do not install a candidate.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Missing, unapproved, wrong-version and wrong-platform supervisors all remain blocked. Existing RUN behavior remains independent.

**Done when:** A verified operator-supplied contract is recorded or the exact unresolved gate remains explicit without changing flags.

**Handoff recipient / prerequisite:** Approved supervisor owner and T02 when available.

### T02 Design bound service admission and recovery

**Dependencies:** T01 approved contract; current M03 proof. **Files / ownership boundary:** packages/contracts/background-work.ts; packages/core/background-work.ts; concrete supervisor adapter paths discovered from approved integration. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Specify authentication, job identity, owner/profile/grant binding, lease generation, receipts, reconnect arbitration and cancellation acknowledgment. Write lifecycle table for app close, host crash, supervisor restart, OS restart, credential revocation and binary upgrade. Define migration/rollback and no-auto-replay uncertainty behavior.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Review every transition against S03/S08/S12/T02. No transition treats transport success or vanished PID as native terminal outcome.

**Done when:** Accepted adapter contract is executable with exact installed dependencies and proof requirements.

**Handoff recipient / prerequisite:** T03 adapter implementer; no speculative backend files.

### T03 Integrate the approved service adapter without broad activation

**Dependencies:** T02. **Files / ownership boundary:** packages/core/background-work.ts; apps/server/hermes-service.ts; approved adapter files; apps/web/src/BackgroundWork.tsx. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Bind service admission to approved identity/proof and current M03 policy. Persist job mapping before publication. Implement authenticated reconnect and exact owned stop, keeping UNKNOWN on ambiguity. Reflect service proof accurately in closeSummary/UI. Keep flags false by default and ordinary RUN unchanged.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Unit/host cases for wrong identity, broken auth/connection, duplicate admission, delayed stop receipt, stale owner, expired proof, restart and cancellation races.

**Done when:** The real composition reaches only the approved adapter and all negative cases stay blocked or unknown without a new job.

**Handoff recipient / prerequisite:** T04 installed native verifier.

### T04 Run installed supervisor acceptance on each declared target

**Dependencies:** T03; exact installed approved supervisor. **Files / ownership boundary:** reviewed existing M10 native/installed workflow and docs/implementation/v6/M10/. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Run an owned long-lived job; close/reopen Gen, restart supervisor and host as authorized, reconnect to the same job, then stop and verify native teardown. Record process/job identity and receipts across all boundaries. Test failed reconnect, revoked account and lost acknowledgment without signaling a foreign job. Run all M10 and repository gates separately.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Actual supervisor/native evidence on declared Windows/Linux targets. Controlled fault injection must not affect unrelated services. Missing target proof is BLOCKED.

**Done when:** Every S03 supervisor criterion passes with exact source/binary/platform evidence; reviewer approval and deployment activation remain separate.

**Handoff recipient / prerequisite:** Independent reviewer; canonical #575 and parent #1992.

## VALIDATION

### Requirement-to-task-to-acceptance matrix

| Requirement | Tasks | Acceptance checks |
|---|---|---|
| M10-C01 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-S03 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-S08 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-S12 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-U04 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-T02 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-G01 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-G02 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-G03 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |

- A01 explicit approved installed contract recorded for each supported target
- A02 exact authenticated service identity bound to owner/profile
- A03 reconnect after host/supervisor restart preserves same work
- A04 stop requires native acknowledgment; broken connection remains UNKNOWN
- A05 truthful close warning and independent default-off activation

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

Researched: complete source clauses, relevant implementation/tests, current production composition, and existing issue/PR overlap. Decided: retain the approved architecture and close this specific gap; no scope deletion or activation. Implemented in this review: none. Verified product acceptance in this review: none. T01-T04: NOT_STARTED for implementation, with T01 source premise inspected. Planning owner releases after publication; implementation owner remains whoever holds the earliest authorized exact claim in the issue journal.

Next action: refresh this issue and related PR ownership, pin current main, reproduce T01 using the exact supported toolchain in an isolated worktree, and post START/ACK with source identity and scope. Stop only the dependent phase for a named missing prerequisite. Deliver the first failing regression or evidence discrepancy before editing. Retain a self-contained checkpoint and final RELEASE OWNER=NONE when stopping. No changes to M12 or M14 are included.

Publication gate: full issue body must compare byte-for-byte with the real UTF-8 .md source. The publisher records the source SHA256, issue URL, readback result and attachment limitation in an append-only comment. Do not claim HANDOFF_COMPLETE unless the full body is retrievable; file-upload success is a separate fact.

## REFERENCES

- Parent review and published issue index: https://github.com/skytuhua-org/Gen-V1/issues/1992
- Repository instructions: https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md
- Contribution guide: https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md
- M10 original implementation PR: https://github.com/skytuhua-org/Gen-V1/pull/501 (merged, historical source only)
- M10 v6 evidence PR: https://github.com/skytuhua-org/Gen-V1/pull/837 (merged, historical evidence only)
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/background-work.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/background-work.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/hermes-service.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/BackgroundWork.tsx
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/background-work-v3.test.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v6/M10/
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/agent-plans/575-approve-an-os-supervisor-for-service-lifetime-backgr.md
