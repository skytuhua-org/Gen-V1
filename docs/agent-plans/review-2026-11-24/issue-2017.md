# M10: persist every missed occurrence without an unbounded scheduler transaction

## META

Repository: skytuhua-org/Gen-V1. Plan revision: m01-m10-audit-r2-2026-11-23. Baseline: main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b. Parent review: https://github.com/skytuhua-org/Gen-V1/issues/1992. Author: codex-cloud-ca7d38. Status: SOURCE GAP VERIFIED; implementation and issue-specific reproduction pending. Date is 2026-11-23 Pacific time.

Source provenance: user-uploaded Expanded Source Research UX Memory Performance v3 dated 2026-11-14; Audited Execution Controlled Prompts v6 dated 2026-11-16; its Completion Follow-ups appendix. M10's authoritative clauses relevant to this issue are reproduced below so execution does not depend on the original chat or private attachment. Research v3 §17 P2-2/P2-3 supplies stable projection and persisted process-identity rationale. Audit source and exact repository paths are pinned in REFERENCES.

Attachment status: the actual GitHub file upload failed in the review environment. The complete Markdown source is published in this issue body. A separate .md file is provided with the review deliverables; it is not represented as a GitHub attachment. No repository-docs commit was permitted.

## OBJECTIVE

Every intended interval occurrence remains durably represented and recoverable, including large clock jumps, while each scheduler transaction remains bounded and only the latest due occurrence is eligible for admission.

### Verified current gap

`DurableWakeupScheduler.claimOccurrence` computes the complete skippedTotal but persists `Math.min(missed, 100_000)` individual SKIPPED records. It then advances nextDueAtMs and lastProcessedDueAtMs beyond all missed instants, without a durable backfill cursor for the omitted records. More than 100,000 missed occurrences are therefore counted but not individually persisted. The existing test named "every missed occurrence is persisted" covers only 59 skips. The same synchronous transaction can write 100,000 rows despite the scheduler's intended bounded tick behavior. This is a concrete ledger/bounded-work gap, separate from generic event-retention policy #1958.

## REQUIREMENTS

Preserve the existing Store, one scheduler, tick=1000 ms, at most 50 due records per tick, lease=30000 ms and heartbeat=10000 ms. Keep JSON.stringify([wakeupId,scheduleRevision,scheduledDueAtMs]) identity and anchored UTC intervals. Timezone remains display metadata, no cron/DST recurrence policy.

Do not silently cap or discard intended occurrence records. Use a durable resumable accounting/backfill design if materializing all skipped occurrences requires multiple bounded batches. The intermediate durable range/cursor must commit the exact intended set and survive restart; completion requires every retained required occurrence, not only a count. A range-only alternative changes the original requirement and cannot be adopted without an explicit approved requirement revision. Do not revive skipped work or burst-replay. A backward jump, overlapping claim, cancelled schedule or old revision must not duplicate any admission.

Do not delete audit receipts under the pretext of bounding work. Coordinate retention decisions with #1958. Current task owns occurrence materialization and bounded scheduling, not global expiry policy.

### Retained source clauses

**M10-C02.** Proposed WakeupV1: wakeupId, taskId, scheduleRevision, trigger (one tagged variant AT_UTC, INTERVAL_UTC or HOST_EVENT), scheduleTimezone|null for display, occurrenceKey, state PENDING|CLAIMED|DELIVERED|CANCELLED|BLOCKED, claimGeneration, leaseExpiresAtMs and deadlineMs. AT_UTC stores one dueAtMs. INTERVAL_UTC stores anchorMs and positive intervalMs. HOST_EVENT stores an allowlisted host event kind and exact correlation key. The timestamp or event payload never supplies execution authority.

**M10-S01.** Implement one scheduler over the existing Store. Poll every 1,000 ms, inspect at most 50 due records per tick, claim each occurrence in a synchronous transaction, use a 30,000 ms lease and 10,000 ms heartbeat, and increment claimGeneration on reassignment. occurrenceKey is JSON.stringify([wakeupId,scheduleRevision,scheduledDueAtMs]) for time triggers, or JSON.stringify([wakeupId,scheduleRevision,hostEventId]) for event triggers. At restart, reconcile a claimed/dispatched occurrence before any replacement delivery. Do not create a second database.

**M10-S11.** Retry only host-classified transient read failures: 3 total attempts with delays of 1,000 ms and 2,000 ms before attempts 2 and 3. No retry after cancellation, authorization failure, validation failure, or uncertain nonreplayable dispatch. Persist every intended schedule occurrence. For missed interval firings record skipped occurrences and admit only the latest due occurrence; never burst-replay missed work.

**M10-S12.** Add explicit stop/drain behavior during shutdown: no new admission, cancel eligible work, wait a bounded time for owned teardown and record uncertainty. Never mark SETTLED solely because a process vanished.

**M10-T01.** Two schedulers race for one occurrence; exactly one admission is created. Restart before/after claim does not duplicate input delivery.

**M10-T06.** Wall-clock jump and daylight-saving transitions preserve occurrence identity; shutdown prevents new admission.

**M10-D01.** Two claimers. Race two host scheduler instances at the same occurrence; exactly one successful admission receipt exists.

**M10-D02.** Lease after uncertain dispatch. Expire a lease after external submission but before receipt; assert no second submit, and UNKNOWN until reconciliation.

**M10-D03.** Clock movement. Jump forward across five intervals, then backward; assert one latest admission, four skipped occurrences and no duplicate consumed key.

**M10-G03.** Rollback: Pause wakeups and intake, preserve occurrence/effect receipts and stop only owned jobs. Leave uncertain processes quarantined for inspection; do not erase the state needed for recovery.

### Cross-cutting constraints and exclusions

The review itself is read-only: no code, branch, commit, PR or flag changes were made or authorized in this audit. This execution plan records future work for the issue owner. Before implementation, read AGENTS.md, CONTRIBUTING.md, this entire issue, all comments, linked PRs and the latest checkpoint. Claim only an unowned exact scope and use an isolated current-main worktree. Preserve earlier implementation and review ownership. Post self-contained checkpoints at milestones and at most 20 minutes of uninterrupted work, and finish with RELEASE OWNER=NONE.

All user-supplied M10 requirements remain authoritative. This focused issue closes only its mapped gap; sister phases are neither deleted nor implicitly completed. Preserve host-owned flags jobs.backgroundV1, jobs.serviceLifetimeV1, jobs.idleReviewV1 and integrations.intakeV1, each default false. Do not add strict UI preferences or agent/plugin enablement. Preserve existing Store transactions and source-manifest/licensing rules. No dependency on completion of M12 or M14 is introduced.

Use the exact packageManager from current package.json and installed matching Node. At the audited baseline that is pnpm 10.30.3 and Node >=24.10.0. If no installed matching package manager or preprovisioned Corepack resolution exists, HOLD_TOOLCHAIN; do not download one under the source prompt. Build required assets before relevant tests. Tests must contain the required assertions, no passWithNoTests, skipped-required-case substitution, timeout inflation or different browser channel to force green.

### Dependencies and independent ownership

- #1958 owns generic event/projection retention; coordinate durable receipt retention without merging the scopes.
- Other M10 work must not edit the scheduler claim transaction concurrently.

## REPO_MAP

All paths below were verified present at the pinned baseline. Any additional adapter, test or native integration path must be discovered in T01/T02 and recorded before edits; a proposed path is not evidence that an interface exists.

- `packages/core/durable-wakeups.ts`
- `packages/contracts/background-work.ts`
- `packages/storage/store.ts`
- `tests/background-work-v3.test.ts`
- `tests/background-contract-decisions-v6.test.ts`

## DESIGN

Persist an immutable pending backfill descriptor with exact schedule revision, first/last skipped due instants, interval, next cursor and committed accounting marker in the same transaction that selects the latest admission. Advance a bounded number of missing rows per normal scheduler tick using the existing owner; no separate database/timer. Commit cursor and row batch atomically. Interrupted batches replay idempotently by occurrence key. Establish a strict per-batch row budget and verify fairness so backfill cannot starve live admissions, lease heartbeats or shutdown. Count all transaction writes, including latest occurrence, wakeup, backfill descriptor and cursor, rather than counting only SKIPPED rows. Bound progress so the 10000 ms heartbeat and 30000 ms lease remain serviceable.

This is a proposed implementation to be checked against current Store invariants in T02. It preserves every intended identity without attempting one massive transaction. If an alternative is simpler and preserves the exact requirement, document and review it before coding. Legacy capped histories require a careful detect/reconcile policy, never fabricated historical dispatch success.

## EXECUTION_DAG

T01 -> T02 -> T03 -> T04. No overlapping implementation in shared files is parallelized without an explicit issue ownership split. Independent target-platform verification can run in parallel after the same immutable candidate is published.

### T01 Reproduce the cap and measure transaction work

**Dependencies:** NONE. **Files / ownership boundary:** packages/core/durable-wakeups.ts; tests/background-work-v3.test.ts. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Extend the deterministic fake-clock fixture across 100002 and 100005 intervals. Count every expected JSON occurrence key, skippedTotal, actual rows, latest admission and writes per synchronous transaction. Capture a smaller control and the existing five-interval decision case. Use temporary Stores only and record baseline timing/row counts without inventing a product latency target.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Expected failing assertion: skipped ledger cardinality/keys disagree with the complete intended set above 100000. Positive control: five intervals and backward clock no duplicate.

**Done when:** Exact missing-key and transaction-size baseline reproduced; generic event-retention scope kept separate.

**Handoff recipient / prerequisite:** T02 scheduler owner.

### T02 Specify atomic bounded backfill and migration

**Dependencies:** T01; consult #1958 retention owner. **Files / ownership boundary:** packages/core/durable-wakeups.ts; packages/contracts/background-work.ts; Store entity contract. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Define durable pending-range/cursor data and transaction budgets, accounting idempotency, live-admission fairness, revision/pause/cancel semantics and shutdown behavior. Decide how preexisting capped rows are detected and reported without claiming missing old dispatch receipts. Keep timestamps and arithmetic within safe validated integer limits. Review overflow and adversarial tiny intervals.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** State table covers restart before/after batch commit, two schedulers, forward/backward jumps during backfill, cancellation, reschedule and expired lease after uncertain dispatch.

**Done when:** Every intended occurrence has a recoverable durable identity and no intermediate transition can admit a skipped occurrence.

**Handoff recipient / prerequisite:** T03 implementer with schema/rollback note.

### T03 Implement resumable materialization in the existing scheduler

**Dependencies:** T02. **Files / ownership boundary:** packages/core/durable-wakeups.ts; packages/contracts/background-work.ts if a private record schema is needed. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Replace lossy cap with bounded idempotent batches under the same Store scheduler. Persist progress with each batch, separate accounting from actual dispatch, and preserve the one latest admission. Keep no-await transactions and existing claim/lease uncertainty reconciliation. Stop/drain prevents new admissions and preserves pending backfill state.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Full >100000-key equality after completion; crash/restart every batch; two scheduler instances; fairness with many schedules; backward clock; cancelled/rescheduled owner; no second submission after uncertainty.

**Done when:** All intended skipped rows materialize exactly once, latest due delivers once, and observed transaction writes never exceed the documented bound.

**Handoff recipient / prerequisite:** T04 reviewer/acceptance worker.

### T04 Verify scale, recovery and nonregression evidence

**Dependencies:** T03. **Files / ownership boundary:** tests/background-work-v3.test.ts; tests/background-contract-decisions-v6.test.ts; docs/implementation/v6/M10/. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Run targeted scheduler cases then all four M10 suites and required gates. Compare baseline and candidate transaction counts/latency at equal data sizes. Verify retained receipts and UI next/last/skipped projections remain truthful during incomplete backfill. Record exact source and no new runtime/feature activation.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Large jumps, tiny interval safety, 50 due records/tick, shutdown, no burst replay and legacy-store upgrade. Report required failures, not only aggregate pass count.

**Done when:** S01/S11/D01-D03 have current source-bound evidence and no omitted intended identities.

**Handoff recipient / prerequisite:** Independent reviewer and #1992.

## VALIDATION

### Requirement-to-task-to-acceptance matrix

| Requirement | Tasks | Acceptance checks |
|---|---|---|
| M10-C02 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-S01 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-S11 occurrence-persistence subclause only | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-S12 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-T01 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-T06 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-D01 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-D02 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-D03 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-G03 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |

- A01 all expected occurrence keys exist beyond the old 100000 cap
- A02 per-transaction writes are bounded and live work remains fair
- A03 restart/concurrency/reschedule preserves idempotent accounting
- A04 latest due admitted once, skipped work never replayed
- A05 historical missing rows honestly reconciled, receipts preserved

The matrix maps the original clauses to the issue's concrete checks. S11 transient-read retry semantics are preserved in the original clause but owned by the intake/current M10 regression scope; these occurrence-ledger checks alone do not certify retries. Requirements outside this focused issue retain their existing M10 gates; passing these rows alone does not close the whole milestone.

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
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/durable-wakeups.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/background-work.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/storage/store.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/background-work-v3.test.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/background-contract-decisions-v6.test.ts

- Existing query-amplification owner: https://github.com/skytuhua-org/Gen-V1/issues/1959
