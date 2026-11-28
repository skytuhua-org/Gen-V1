**Full current issue mirror:** [issue-576.md](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-576.md). The publication checkpoint pins the exact commit.

Publication supplement `cleanup-2026-11-23-r2` under #1803: the complete concurrent plan published under #1992 is preserved verbatim below. Its implementation and approval gates remain open.

# M10: integrate and qualify the pinned review fork with idle permit custody

## META

Repository: skytuhua-org/Gen-V1. Plan revision: m01-m10-audit-r2-2026-11-23. Baseline: main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b. Parent review: https://github.com/skytuhua-org/Gen-V1/issues/1992. Author: codex-cloud-ca7d38. Status: SOURCE GAP VERIFIED; implementation and issue-specific reproduction pending. Date is 2026-11-23 Pacific time.
Existing canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/576. This revision supplements the preserved original requirement, not its implementation ownership. Prior plan at the pinned path in REFERENCES remains historical; this entire issue body is the current executable plan.

Source provenance: user-uploaded Expanded Source Research UX Memory Performance v3 dated 2026-11-14; Audited Execution Controlled Prompts v6 dated 2026-11-16; its Completion Follow-ups appendix. M10's authoritative clauses relevant to this issue are reproduced below so execution does not depend on the original chat or private attachment. Research v3 §17 P2-2/P2-3 supplies stable projection and persisted process-identity rationale. Audit source and exact repository paths are pinned in REFERENCES.

Attachment status: the actual GitHub file upload failed in the review environment. The complete Markdown source is published in this issue body. A separate .md file is provided with the review deliverables; it is not represented as a GitHub attachment. No repository-docs commit was permitted.

## OBJECTIVE

Review/idle work uses a tested callable API on the pinned Hermes wrapper, a frozen admitted source/tool scope, explicit bounded model budget and M11 capacity custody until confirmed teardown. Unsupported environments remain honestly gated.

### Verified current gap

Current main `admitReviewFork` returns AUXILIARY_BUDGET_REQUIRED when the budget is absent and UNSUPPORTED_FORK otherwise. `BackgroundWorkOptions.forkApi` is not a callable production integration, and createHermesService supplies no idleExecutor/fork factory. The existing #576 request and versioned plan correctly identify the absent pinned callable API.

Open PR #1688 at a236ad13826dfd03e2705aeaaa2c4013cfa06163 proposes wrapper/ReviewForkApi wiring; it is unmerged. The latest metadata refresh reports mergeable=true; that does not establish review or product acceptance. Preserve that work and review it before writing another implementation. Its author-reported unit/API cases do not prove a native immutable-source fork, approved auxiliary model, installed target or foreground permit teardown. Earlier released ownership in #576 must be refreshed before a new claim.

## REQUIREMENTS

Preserve original #576 requirements: expose a callable pinned fork API, wire it through the coordinator auxiliary-budget check, and cover budget-required/unsupported paths. Retain every v6 restriction: immutable source cut, previously admitted read-only tools, deadline at most 60 seconds, at most four model calls and explicit max-token/max-call budget. A helper named fork that merely opens another generic engine is insufficient unless it proves the required snapshot and isolation semantics.

Idle opt-in persists per project/profile, interval at least 60000 ms and one active idle job per profile. New foreground admission cancels queued idle work; running cancellation retains the M11 permit/account lease until actual native teardown. A new parent turn invalidates actionable output; late results remain historical and cannot merge silently into foreground messages. No ambient Hermes plugins, copied runtime, secondary scheduler or unrestricted fallback. Production flags remain false, no model endpoint or budget purchase assumed.

Use a supplied approved auxiliary model and budget for live acceptance. Missing model/budget/API/native proof blocks only this phase. Do not declare the whole M10 complete from deterministic tests or silently retire this retained scope.

### Retained source clauses

**M10-S06.** Idle jobs require a persisted per-project/profile opt-in and interval of at least 60,000 ms. Permit one idle job per profile and only read-only verification or organization proposals. New foreground admission cancels queued idle work; running work receives cancellation but retains its permit until actual teardown. Already dispatched effects retain their M02 settlement or uncertainty record.

**M10-S07.** Review forks use an immutable source cut, the already admitted read-only tool list, a 60-second deadline and a maximum of 4 model calls. An explicit auxiliary token/call budget is required; its absence blocks this phase. Use only a callable, tested API in the currently pinned Hermes wrapper. An absent API produces UNSUPPORTED_FORK; do not enable ambient Hermes plugins or copy a new runtime. A new parent turn invalidates actionable output, while late results remain historical.

**M10-S08.** Keep model capacity permits until confirmed native teardown. Account lease release is not inferred from a timeout or closed UI. Separate background advisory outputs from foreground messages until structured settlement.

**M10-T03.** New foreground work preempts eligible idle jobs without releasing a still-active account permit.

**M10-G01.** Contracts and ordinary owned background jobs can pass independently of an OS service. Persistent service lifetime and idle/source forks remain unavailable until their actual integrations are demonstrated. External task approval is not inferred from repository write access.

**M10-G02.** Host-owned flags: jobs.backgroundV1, jobs.serviceLifetimeV1, jobs.idleReviewV1, integrations.intakeV1. Add only missing keys to the existing owner registry without replacing other registered keys; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M10-G03.** Rollback: Pause wakeups and intake, preserve occurrence/effect receipts and stop only owned jobs. Leave uncertain processes quarantined for inspection; do not erase the state needed for recovery.

### Cross-cutting constraints and exclusions

The review itself is read-only: no code, branch, commit, PR or flag changes were made or authorized in this audit. This execution plan records future work for the issue owner. Before implementation, read AGENTS.md, CONTRIBUTING.md, this entire issue, all comments, linked PRs and the latest checkpoint. Claim only an unowned exact scope and use an isolated current-main worktree. Preserve earlier implementation and review ownership. Post self-contained checkpoints at milestones and at most 20 minutes of uninterrupted work, and finish with RELEASE OWNER=NONE.

All user-supplied M10 requirements remain authoritative. This focused issue closes only its mapped gap; sister phases are neither deleted nor implicitly completed. Preserve host-owned flags jobs.backgroundV1, jobs.serviceLifetimeV1, jobs.idleReviewV1 and integrations.intakeV1, each default false. Do not add strict UI preferences or agent/plugin enablement. Preserve existing Store transactions and source-manifest/licensing rules. No dependency on completion of M12 or M14 is introduced.

Use the exact packageManager from current package.json and installed matching Node. At the audited baseline that is pnpm 10.30.3 and Node >=24.10.0. If no installed matching package manager or preprovisioned Corepack resolution exists, HOLD_TOOLCHAIN; do not download one under the source prompt. Build required assets before relevant tests. Tests must contain the required assertions, no passWithNoTests, skipped-required-case substitution, timeout inflation or different browser channel to force green.

### Dependencies and independent ownership

- Reuse #576 and PR #1688, preserve prior scope and ownership.
- M11 capacity/scheduler interface must be supplied; do not expand this review into M11 implementation.
- No model endpoint, payment, credential or release enablement is authorized by this audit.

## REPO_MAP

All paths below were verified present at the pinned baseline. Any additional adapter, test or native integration path must be discovered in T01/T02 and recorded before edits; a proposed path is not evidence that an interface exists.

- `packages/core/background-work.ts`
- `packages/contracts/background-work.ts`
- `packages/runtime-hermes/index.ts`
- `packages/runtime-hermes/task-pool.ts`
- `packages/runtime-hermes/client.ts`
- `packages/runtime/model-capacity.ts`
- `packages/runtime/request-scheduler.ts`
- `apps/server/hermes-service.ts`
- `tests/background-work-v3.test.ts`
- `docs/agent-plans/576-provide-a-fork-api-on-the-pinned-hermes-wrapper-for.md`

## DESIGN

First review the existing PR against current main and its pinned runtime contract. Continue or supersede it only with an explicit owner handoff. Model a fork as an isolated runtime session bound to sourceCutDigest, exact immutable messages/checkpoint, read-only tool registry, parent owner revision and budget. Production composition passes the callable adapter; admission validates proof before acquiring capacity. Capacity acquisition/cancel/release uses the established M11 owner, not a new local semaphore.

Keep separate states for queued, running, cancel requested, teardown confirmed, settled and invalidated historical output as permitted by current contracts. Do not invent a terminal successful outcome from API Promise completion without native confirmation. Rollback cancels eligible idle work and retains permits/receipts for uncertain running work.

## EXECUTION_DAG

T01 -> T02 -> T03 -> T04. No overlapping implementation in shared files is parallelized without an explicit issue ownership split. Independent target-platform verification can run in parallel after the same immutable candidate is published.

### T01 Review the existing fork PR and pinned API contract

**Dependencies:** NONE. **Files / ownership boundary:** PR #1688; issue #576 comments; packages/runtime-hermes/index.ts; packages/core/background-work.ts. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Refresh PR head/state/reviews and exact owner. Compare proposed API with current pinned wrapper and real native worker. Trace what source data is frozen and what live parent state can still leak. Record tested versus claimed behavior, conflicts and dependency proof. Claim only the authorized remaining scope after earlier ownership release.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Baseline missing budget/unsupported API tests; candidate contract cases for mutable parent, tool list change, native unavailable and parent disposal. Do not treat unit mocks as callable native proof.

**Done when:** Existing work is reconciled without duplicate implementation and exact missing native contract fields are identified.

**Handoff recipient / prerequisite:** Pinned Hermes API owner and T02.

### T02 Define immutable source, budget and M11 custody binding

**Dependencies:** T01; approved callable API and auxiliary budget. **Files / ownership boundary:** packages/core/background-work.ts; packages/runtime-hermes/task-pool.ts; packages/runtime/model-capacity.ts; packages/runtime/request-scheduler.ts. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Specify source cut/materialization, parent revision, admitted tool set, deadline and call/token accounting. Bind native session and permit to one owner. Define foreground preemption, slow cancel, parent-turn invalidation, host loss and late historical result handling. Confirm the accepted API supports these guarantees; absent API remains HOLD_FORK_API.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** State table covers zero budget, excessive requested limits, tool escalation, parent mutation during start, cancel timeout and delayed teardown acknowledgment.

**Done when:** Contract bounds 60 seconds/four calls/token budget and proves exactly when the M11 permit releases.

**Handoff recipient / prerequisite:** T03 integrator with exact approved API/source references.

### T03 Complete production fork/idle wiring using existing work

**Dependencies:** T02; owner handoff on #1688. **Files / ownership boundary:** packages/core/background-work.ts; apps/server/hermes-service.ts; approved wrapper/runtime files; existing tests. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Rebase or follow up the existing PR under normal review. Inject real callable fork/idle executor, persist opt-in, enforce one profile job and minimum interval. Acquire existing M11 permits; cancel queued and running work on foreground admission while awaiting native teardown for release. Reject over-budget/tool-widening calls, freeze original source and mark later parent-turn outputs historical.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Budget and call limits, 60-second cutoff, absent API, stale parent, repeated opt-in, two idle admissions, foreground preemption with delayed native exit, historical late output and shutdown.

**Done when:** Actual host composition uses the reviewed pinned API and does not leak permits or actionable stale results.

**Handoff recipient / prerequisite:** T04 native/live verifier.

### T04 Prove native fork and foreground coexistence

**Dependencies:** T03; approved model/account/budget and target platform. **Files / ownership boundary:** existing reviewed M10 installed/native workflow; tests/background-work-v3.test.ts; docs/implementation/v6/M10/. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Run the real pinned wrapper on the declared native target with the supplied bounded auxiliary budget. Capture immutable source identity, tool denials, call/token use, foreground start latency and native teardown/permit timestamps. Start a new parent turn while fork runs and verify result is historical only. Run all M10/repository gates and preserve default-off release state.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Live approved model path and installed native cancellation, not an injected fake runtime. Missing credentials/budget/API stays NOT_RUN/BLOCKED. Record PASS only for observed cases.

**Done when:** Original #576 scope and all retained S06-S08/T03 requirements have current native evidence or explicit remaining holds; no premature M10 completion.

**Handoff recipient / prerequisite:** Independent reviewer; #576 and #1992.

## VALIDATION

### Requirement-to-task-to-acceptance matrix

| Requirement | Tasks | Acceptance checks |
|---|---|---|
| M10-S06 | T01, T02, T03, T04 | A01; A02; A03; A04; A05; A06 |
| M10-S07 | T01, T02, T03, T04 | A01; A02; A03; A04; A05; A06 |
| M10-S08 | T01, T02, T03, T04 | A01; A02; A03; A04; A05; A06 |
| M10-T03 | T01, T02, T03, T04 | A01; A02; A03; A04; A05; A06 |
| M10-G01 | T01, T02, T03, T04 | A01; A02; A03; A04; A05; A06 |
| M10-G02 | T01, T02, T03, T04 | A01; A02; A03; A04; A05; A06 |
| M10-G03 | T01, T02, T03, T04 | A01; A02; A03; A04; A05; A06 |

- A01 real pinned callable fork API proven at exact source
- A02 immutable source/read-only tools and 60s/four-call/token limits enforced
- A03 persisted opt-in and one job per profile
- A04 foreground preemption retains permit until native teardown
- A05 new parent turn invalidates actionable result; late history preserved
- A06 actual approved native/live lane passes separately from unit tests

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
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/runtime-hermes/index.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/runtime-hermes/task-pool.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/runtime-hermes/client.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/runtime/model-capacity.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/runtime/request-scheduler.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/hermes-service.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/background-work-v3.test.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/agent-plans/576-provide-a-fork-api-on-the-pinned-hermes-wrapper-for.md
