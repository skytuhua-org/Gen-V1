# M10: implement the foreground timeout Continue in background handoff

## META

Repository: skytuhua-org/Gen-V1. Plan revision: m01-m10-audit-r2-2026-11-23. Baseline: main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b. Parent review: https://github.com/skytuhua-org/Gen-V1/issues/1992. Author: codex-cloud-ca7d38. Status: SOURCE GAP VERIFIED; implementation and issue-specific reproduction pending. Date is 2026-11-23 Pacific time.

Source provenance: user-uploaded Expanded Source Research UX Memory Performance v3 dated 2026-11-14; Audited Execution Controlled Prompts v6 dated 2026-11-16; its Completion Follow-ups appendix. M10's authoritative clauses relevant to this issue are reproduced below so execution does not depend on the original chat or private attachment. Research v3 §17 P2-2/P2-3 supplies stable projection and persisted process-identity rationale. Audit source and exact repository paths are pinned in REFERENCES.

Attachment status: the actual GitHub file upload failed in the review environment. The complete Markdown source is published in this issue body. A separate .md file is provided with the review deliverables; it is not represented as a GitHub attachment. No repository-docs commit was permitted.

## OBJECTIVE

A user can transfer a still-owned, eligible foreground operation to RUN background custody exactly once at the accepted timeout boundary. Stale, settled, already killed, unapproved or unsupported operations cannot be continued.

### Verified current gap

The completion follow-up explicitly names the unwired foreground timeout continuation. A repository-wide read of apps, packages and tests finds no implementation for `Continue in background`, `continueInBackground` or `operation.background`. `packages/capabilities/process.ts::runProcess` currently kills the process tree on its timeout and resolves a timedOut result after close. `Service.executeOperation` turns timedOut/nonzero/cancelled executor results into a failed or uncertain operation. `OperationDecision` in `apps/web/src/App.tsx` displays approval/outcome/reconciliation, but exposes no continuation. Therefore an after-the-fact button that simply respawns the same command would be unsafe and would not implement continuation.

## REQUIREMENTS

This is the explicit M10 completion-follow-up path, not a new run command. Preserve the original operation/effect/invocation identity, approval envelope, executable/profile, run/epoch/account/workspace and native process. Do not rerun the command to simulate transfer. Preserve ordinary timeout termination when continuation is unavailable or declined. Distinguish a foreground waiting threshold from the hard admitted execution deadline: transfer may change observation ownership but must never extend the approved profile/runtime budget. Stop or authority revocation wins during an offer and after transfer. No service-survival promise.

The source follow-up requires an accepted M10 operation handoff and current M03 profile, but the current inspected source exposes no ready transfer ABI. Treat the exact host-runner transfer signature, race arbitration and timeout decision point as T02 discovery/design acceptance. If no approved transferable runner exists, keep that branch HOLD_EXECUTION_PROFILE or an explicitly mapped unavailable reason, document the exact missing contract, and complete independent UI denial/race tests. Do not add a synthetic API and claim it was already accepted.

Keep keyboard focus, current operation revision, loading/denied/stale/cancelled/unknown states and duplicate-click idempotency. Continue becomes unavailable immediately after settle/stop/revision change. Background drawer uses the same process identity and output cursor. A new run must never inherit authority from the old one.

### Retained source clauses

**M10-S02.** Add owned background command state without detaching ownership. Foreground timeout may offer Continue in background only for a permitted profile. Retain exact process identity including creation token, not PID alone, and preserve bounded output with cursor-based retrieval.

**M10-S03.** After host loss, RUN-lifetime commands become UNKNOWN until an exact owned-process exit/teardown receipt resolves them. Do not promise survival. APPROVED_SERVICE stays unavailable unless the recorded installed supervisor identity, authentication, reconnect and cancellation contract have target-platform PASS evidence. Do not select, install or write another supervisor in this task to bypass that gate.

**M10-S04.** Wake-ups revalidate current account, project, grants, budget and task state. A stale lease or changed epoch may trigger reconciliation but cannot revive prior authority. Missing provider or permission produces BLOCKED without a tight retry loop.

**M10-U01.** Background work drawer shows Waiting, Running, Waiting for you, Completed or Outcome unknown; command, owner, elapsed time, output and Open child task are visible.

**M10-T02.** PID reuse, orphan process, broken supervisor connection and missing exit acknowledgment yield UNKNOWN rather than success.

**M10-G02.** Host-owned flags: jobs.backgroundV1, jobs.serviceLifetimeV1, jobs.idleReviewV1, integrations.intakeV1. Add only missing keys to the existing owner registry without replacing other registered keys; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M10-G03.** Rollback: Pause wakeups and intake, preserve occurrence/effect receipts and stop only owned jobs. Leave uncertain processes quarantined for inspection; do not erase the state needed for recovery.

### Cross-cutting constraints and exclusions

The review itself is read-only: no code, branch, commit, PR or flag changes were made or authorized in this audit. This execution plan records future work for the issue owner. Before implementation, read AGENTS.md, CONTRIBUTING.md, this entire issue, all comments, linked PRs and the latest checkpoint. Claim only an unowned exact scope and use an isolated current-main worktree. Preserve earlier implementation and review ownership. Post self-contained checkpoints at milestones and at most 20 minutes of uninterrupted work, and finish with RELEASE OWNER=NONE.

All user-supplied M10 requirements remain authoritative. This focused issue closes only its mapped gap; sister phases are neither deleted nor implicitly completed. Preserve host-owned flags jobs.backgroundV1, jobs.serviceLifetimeV1, jobs.idleReviewV1 and integrations.intakeV1, each default false. Do not add strict UI preferences or agent/plugin enablement. Preserve existing Store transactions and source-manifest/licensing rules. No dependency on completion of M12 or M14 is introduced.

Use the exact packageManager from current package.json and installed matching Node. At the audited baseline that is pnpm 10.30.3 and Node >=24.10.0. If no installed matching package manager or preprovisioned Corepack resolution exists, HOLD_TOOLCHAIN; do not download one under the source prompt. Build required assets before relevant tests. Tests must contain the required assertions, no passWithNoTests, skipped-required-case substitution, timeout inflation or different browser channel to force green.

### Dependencies and independent ownership

- Depends on approved M03 launch/native custody, tracked by #774 and the M10 owned-RUN issue.
- #1956 owns general operation recovery; agree the extension boundary before editing Service.executeOperation.
- No dependency on full M12 or M14; do not alter their in-progress implementations.

## REPO_MAP

All paths below were verified present at the pinned baseline. Any additional adapter, test or native integration path must be discovered in T01/T02 and recorded before edits; a proposed path is not evidence that an interface exists.

- `packages/capabilities/index.ts` (the existing repository.test and Git process callers)
- `packages/capabilities/repository-test-binding.ts` (exact repository.test executionBinding)
- `packages/capabilities/process.ts`
- `packages/core/service.ts`
- `packages/contracts/index.ts`
- `packages/contracts/tool-effects.ts`
- `packages/core/background-work.ts`
- `apps/server/background-routes.ts`
- `apps/web/src/App.tsx`
- `apps/web/src/BackgroundWork.tsx`
- `tests/operation-queue.test.ts`
- `tests/tool-effect-operation-owner-v3.test.ts`
- `tests/background-work-v3.test.ts`

## DESIGN

Use a single durable compare-and-transition around the admitted operation revision to claim transfer. The host alone may offer a transfer-capable timeout state while it still holds the real runner/session. After claim, move observation/cancellation responsibility to M10 without creating another native process or duplicating effect settlement. Persist the operation-to-work mapping before publishing success. Reconcile host loss between claim and publication using the same operation/effect identity. A duplicate request returns the original mapping. Changed payload under the same command ID conflicts.

The UI consumes host eligibility, not command text or timing guesses. Keep present default timeout behavior until the approved handoff exists. Rollback removes new offers and pauses new transfers, but keeps already transferred receipts and permits under the same M10 owner until confirmed teardown.

## EXECUTION_DAG

T01 -> T02 -> T03 -> T04. No overlapping implementation in shared files is parallelized without an explicit issue ownership split. Independent target-platform verification can run in parallel after the same immutable candidate is published.

### T01 Locate and reproduce the real foreground timeout path

**Dependencies:** NONE. **Files / ownership boundary:** packages/capabilities/process.ts; packages/core/service.ts; apps/web/src/App.tsx. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Trace a supported operation from preparation/approval through the concrete executor to timeout and terminal result. Verify which operations expose a transferable owned child and which always terminate. Add a controlled long-running command fixture in a temporary project; record exactly when timeout kills it and what the UI sees. Read pending operation recovery work #1956 before touching shared execution code.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Baseline: no Continue control; timeout is a terminal/uncertain path, not an available live process. Unsupported operation must remain denied.

**Done when:** Named executor, operation schema, owner envelope and timeout timeline are documented at the pinned source; no guessed path.

**Handoff recipient / prerequisite:** T02 contract owner and #1956 reviewer.

### T02 Specify and approve the atomic transfer contract

**Dependencies:** T01; M03 approved RUN contract. **Files / ownership boundary:** packages/contracts/index.ts; packages/contracts/tool-effects.ts; packages/core/background-work.ts; concrete runner discovered in T01. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Define operation revision, effectId, owner, native identity, admission/profile proof, output cursor and transfer state; identify one component that wins races with exit/stop/timeout. Specify idempotency keys and durable resume/reconcile behavior. Confirm how a still-live process remains owned during the user decision interval and how existing timeout limits are preserved. Record a contract hold if required authority or native transfer support is missing.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** State table covers transfer vs exit, transfer vs stop, transfer vs new run, two transfers and host crash before/after acceptance. No state authorizes a second spawn.

**Done when:** Reviewed contract has concrete existing anchors, explicit rejection codes, bounded decision behavior and zero unresolved authority decisions.

**Handoff recipient / prerequisite:** T03 implementer; dependent work remains blocked until acceptance.

### T03 Implement host transfer with durable custody

**Dependencies:** T02. **Files / ownership boundary:** packages/core/service.ts; packages/core/background-work.ts; approved runner adapter and contracts from T02. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Implement one transactionally claimed operation-to-work mapping and attach the existing native session. Do not run asynchronous native calls inside Store transactions. Recheck owner/profile immediately before transfer and after awaited boundaries. Preserve the original effect settlement and output identity. Reconcile uncertain transfer without replaying the external action.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Pause precisely before/after durable claim and native attach; restart host; assert one process, one mapping, one final effect outcome. Stale/settled/cancelled/reused PID and changed account/workspace all deny.

**Done when:** Every race has one owner and no duplicate command execution; recovery is safe under interruption.

**Handoff recipient / prerequisite:** T04 frontend owner with typed eligibility/receipt contract.

### T04 Expose and verify the production continuation flow

**Dependencies:** T03. **Files / ownership boundary:** apps/web/src/App.tsx; apps/web/src/BackgroundWork.tsx; existing operation/background browser suites or a new mapped test found in T01. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Render Continue in background only for host-confirmed transferable operations. Show transfer progress and exact rejection without losing the operation receipt. Open the task-owned drawer on accepted transfer and retain its cursor/owner. Cover keyboard, repeated clicks and a result arriving while the button is focused. Run real process, host, browser and installed native acceptance.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** One eligible click continues the same PID+creation identity. Stale or already settled operation refuses. Decline keeps existing timeout policy. UI never promises service survival or laptop-sleep execution.

**Done when:** The documented completion follow-up is demonstrable from the actual App on declared native targets with all required gates and no activation changes.

**Handoff recipient / prerequisite:** Independent reviewer; update M10 requirement evidence and #1992.

## VALIDATION

### Requirement-to-task-to-acceptance matrix

| Requirement | Tasks | Acceptance checks |
|---|---|---|
| M10-S02 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-S03 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-S04 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-U01 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-T02 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-G02 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-G03 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |

- A01 real supported timeout runner traced
- A02 reviewed transfer contract preserves original identity
- A03 duplicate/race/restart gives one mapping and zero extra spawn
- A04 stale or settled operations refuse continuation
- A05 production UI and native acceptance prove the same process continues

The matrix maps the original clauses to the issue's concrete checks. Requirements outside this focused issue retain their existing M10 gates; passing these rows alone does not close the whole milestone.

### Planned commands and evidence

Discover any changed script in current package.json and record the difference before comparing receipts. Execute each command separately and retain its actual exit code, test counts and bounded redacted log hash. Required asset builds include pnpm build:widgets and the native credential-lease build when the test lane requires it. Missing native tooling is a hold for its dependent lane, not an alternate test:no-lease release pass.

```text
node --version
pnpm --version
pnpm build:widgets
pnpm build:credential-lease
pnpm exec vitest run tests/operation-queue.test.ts tests/tool-effect-operation-owner-v3.test.ts
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
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/capabilities/process.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/index.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/tool-effects.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/background-work.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/background-routes.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/App.tsx
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/BackgroundWork.tsx
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/operation-queue.test.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-operation-owner-v3.test.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/background-work-v3.test.ts

- Actual foreground callers: https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/capabilities/index.ts
- Approved operation binding: https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/capabilities/repository-test-binding.ts
