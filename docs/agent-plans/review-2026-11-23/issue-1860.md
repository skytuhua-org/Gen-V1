[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1860.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`, concurrent-journal reconciliation on 2026-11-24. Source audit baseline `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`; later publication/source references remain attributed to their own pinned revisions. Canonical issue: [#1860](https://github.com/skytuhua-org/Gen-V1/issues/1860). This status supplement supersedes older progress statements only. The entire current canonical plan below, including all accepted requirements and gates, is preserved verbatim.

The complete `original-plan-audit-r1` M09 R03.A5 acceptance supplement published by `codex-cloud-ca7d38` is preserved byte-for-byte below, together with the original remediation scope. Its publication/release receipt is [7122340587](https://github.com/skytuhua-org/Gen-V1/issues/1860#issuecomment-7122340587). Its quoted requirements, native teardown proof, full repository gates and existing ownership remain binding. The earlier publisher's toolchain and attachment limitations describe that publication session; this cleanup adds the versioned full Markdown mirror without claiming to have run those acceptance suites.

The original PR census is a dated observation. #1862 is merged at `c95eae5752a9e94bb1e0847fab4478faac674e50`; merged #1864/#1867/#1868/#1869/#1870/#1885/#1891/#1903 are retained as individual repair evidence. #1861/#1863/#1866/#1872/#1901/#1920 remain open in the refreshed snapshot. In particular, #1866 remains the retained AgentWork custody repair, with review/integration/native acceptance pending. This umbrella remains open for its per-repair reproduction, current-main regression, installed/native and residual lifecycle/capacity gates.

### Refreshed implementation references

- [PR #1861](https://github.com/skytuhua-org/Gen-V1/pull/1861): open; head `355e71a943ff531b53f1928c2181dda397b48a18`; not merged.
- [PR #1862](https://github.com/skytuhua-org/Gen-V1/pull/1862): merged at `c95eae5752a9e94bb1e0847fab4478faac674e50`.
- [PR #1863](https://github.com/skytuhua-org/Gen-V1/pull/1863): open; head `cc6061785a3dfc3a3289d8e0c215c2f13b7f25ff`; not merged.
- [PR #1864](https://github.com/skytuhua-org/Gen-V1/pull/1864): merged at `ea561dd4c0c818feb988244896260ad23ad7b340`.
- [PR #1866](https://github.com/skytuhua-org/Gen-V1/pull/1866): open; head `c906717b889b9a2ab13629b27338aa9b8f3ae7bb`; not merged.
- [PR #1867](https://github.com/skytuhua-org/Gen-V1/pull/1867): merged at `7ebe108dfa375ee018e64ba8b3dd6998088ae314`.
- [PR #1868](https://github.com/skytuhua-org/Gen-V1/pull/1868): merged at `4445d3ae79634c24c1974859b82e55127dc4560d`.
- [PR #1869](https://github.com/skytuhua-org/Gen-V1/pull/1869): merged at `c7cf6e60ac5291e7004482efa1bcd06d535b20bb`.
- [PR #1870](https://github.com/skytuhua-org/Gen-V1/pull/1870): merged at `2f4407f1316c3b3d79802f5771bea878a4b701e5`.
- [PR #1872](https://github.com/skytuhua-org/Gen-V1/pull/1872): open; head `25c946ec92e76b793e0917ef20c0f5c394c0ab9f`; not merged.
- [PR #1885](https://github.com/skytuhua-org/Gen-V1/pull/1885): merged at `19e6c7a789ae85f3314ee652d4dceefaff102999`.
- [PR #1891](https://github.com/skytuhua-org/Gen-V1/pull/1891): merged at `a64e9e2d03ce09c843bff0480d81311f2012c812`.
- [PR #1901](https://github.com/skytuhua-org/Gen-V1/pull/1901): open; head `6fd916b8093d554ef67a3bb66158d7f61eb22357`; not merged.
- [PR #1903](https://github.com/skytuhua-org/Gen-V1/pull/1903): merged at `f96a0401ca58ecf70692310e5e6311d3848f497a`.
- [PR #1920](https://github.com/skytuhua-org/Gen-V1/pull/1920): open; head `eec8d20229fc05d86ee01e5fe43d0f504952f464`; not merged.

Latest journal read: [7122340587](https://github.com/skytuhua-org/Gen-V1/issues/1860#issuecomment-7122340587). Earlier claims, failed attempts, results and releases remain in the append-only journal.

---

[Current versioned Markdown plan](https://github.com/skytuhua-org/Gen-V1/blob/dad473f59b4c46dad12cf0357e448e090a403a2b/docs/agent-plans/nov-2026-audit-1860-revision.md) · [Plan publication PR](https://github.com/skytuhua-org/Gen-V1/pull/1952)

﻿Follow-up to #1848 and the attached November backend audit reports. Revalidate findings against current main and fix confirmed defects in focused branches. The audit summary names a different checkout, and the PR audit includes unpublished changes, so each finding needs fresh evidence before any source edit.

- R01 — Desktop connection and window lifecycle behavior.
- R02 — Workspace terminal startup rollback and comparison correctness.
- R03 — Runtime and agent-work lifecycle settlement.
- R04 — Hermes source completeness, tooling portability, and remaining audit inventory.

Acceptance for each repair: reproduce on a pinned baseline, show the regression passing after the change, run relevant repository checks, and record the exact branch, ownership, and evidence. Track already covered findings and separate owner decisions and open-PR issues. Keep sensitive details in the repository's private security reporting channel.

<!-- gen-v1-audit-plan-revision:2026-11-23:1860 -->

## November audit plan revision
**Revision:** `audit-2026-11-23-r1`. **Repository baseline:** `main@a64e9e2d03ce09c843bff0480d81311f2012c812` (GitHub read during triage). **Canonical issue:** #1860.

### Objective and requirements
**Round-one backend remediation and matching round-two follow-ups.** 01–04, 11–15. Existing work R01–R18 is documented in the issue journal. Use the per-PR matrix and the later acceptance checkpoints rather than reassigning work from report headings.
At this review, #1867, #1870, #1873, #1885, #1891 and #1903 were merged. #1861, #1862, #1863, #1866, #1872, #1901 and #1920 were open. Treat this as a dated PR census and refresh at implementation.

### Reproduction gate
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

### Execution and validation
- **R01/R13 — Desktop same-document navigation, session renewal, sign-in and backend restart.** Read #1863 and #1885 at their current heads. Recreate a same-document navigation followed by renewal and close, a local fixture device sign-in, and one backend replacement with an existing window. Compare renderer, bridge and backend readiness. Retain native or installed verification as a separate gate.
- **R02/R11 — Terminal startup rollback and PR comparison correctness.** Read #1081 and #1867/#1873. Exercise child cleanup after a benign startup failure and inspect a mock multi-file comparison without trusting single-file fixtures. Require a durable ended state and complete file inventory or an explicit truncation state.
- **R03/R09 — Pi, agent-work and Hermes lifecycle.** Read #1862, #1866 and #1870. Exercise synthetic checkpoint timeout, teardown rejection and worker exit. Require deterministic settlement, late-event isolation, and continued ownership when native teardown is unconfirmed.
- **R04 — Hermes vendored source completeness.** Read #1861. Compare pinned upstream source and manifests. Audit the wider import callers in a disposable session database and separate default-disabled code from enabled behavior. Record import, transaction rollback, and recovery coverage if remaining gaps are confirmed.
- **R06–R08/R10 — Docs, event fixture, contracts, and widget admission.** Review #1865, #1868, #1869 and #1872. Recheck current source and the linked regression assertions before extending a change. Preserve compatibility for old records and distinguish the displayed widget contract from its release policy.
- **R12/R15/R17/R18 — Memory capacity, plug-in verification and browser fixture.** Read #1874, #1901, #1903 and #1920. Compare the retained changes with redacted fixtures covering timeout, stale completion, package replacement and baseline host lifecycle. Route possible security issues through SECURITY.md.
- **R03/R09 residual — Check post-remediation settlement.** Once #1862/#1866/#1870 scope is confirmed, Start from the latest existing patches. Use fake runtimes to cover manual compaction followed by completion, model-only exit, result without queue count, and rejection of one cleanup step. Native tree confirmation requires an app-owned process fixture. Keep the existing PRs as the source of truth for the first repair; scope only remaining regressions. Cover stale callbacks after new ownership, unconfirmed native termination, repeated stop, normal completion and next-run progress. Separate synthetic from native platform evidence.
- **R12/R15 residual — Confirm capacity recovery across late work and timer changes.** With fake time and fixtures exercise a provider promise that stays pending, one late success, a close during prediction, and a backward wall-clock step. Observe next foreground command and capacity counts. Compare closed #996 before repeating prediction deadline work. Assert bounded shutdown, progress on unrelated work, no stale writes after reap, correct behavior after clock shift and unchanged success for normal background work.

### State and handoff
New audit checks are planned. This revision records source and issue triage only. The implementing agent records independent RED, the exact accepted fix or no-repro disposition, GREEN, and any installed or native gate on this issue. Follow the issue's existing dependency and review order.

### References
Audit trackers #1848 and #1946. Follow-up coordination #1860 and #1886.

---

## M09 R03.A5 detailed acceptance supplement

The original remediation plan above remains canonical for all its existing scopes and owners. The complete focused plan below adds the M09 requirements and acceptance detail for R03.A5 only, preserving PR #1866 and all other existing ownership. Publication under #1992 does not assign or restart implementation.

# Plan: Integrate and qualify existing AgentWork teardown custody repair

## META

| Field | Value |
|---|---|
| Audit finding | M09-06 |
| Repository | skytuhua-org/Gen-V1 |
| Canonical target | Reuse [#1860](https://github.com/skytuhua-org/Gen-V1/issues/1860) |
| Parent review | [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992), T07–T09 |
| Plan revision/date | original-plan-audit-r1, 2026-11-24 UTC |
| Verified baseline | main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b |
| Status | Planning only. Retained implementation exists; the specific gaps below are not verified complete. No code, tests, configuration, branches or PRs changed by this audit. |
| Source precedence | User v6 ledger is authoritative; completion appendix supplies follow-up sequence; research v3 supplies rationale only. Exact relevant original clauses are reproduced below. |
| Ownership | Audit owner codex-cloud-m0709-b197ad releases to codex-cloud-ca7d38 for publication. Existing implementation/review owners retain custody. Future implementing owner must claim this focused scope before editing. |

## OBJECTIVE

Current main releaseLive deletes the live entry before asynchronously firing cancel/dispose without waiting or retaining rejected cleanup. Parent stop can report completion while native custody is unconfirmed. This exact root cause already belongs to #1860 R03.A5 and open PR1866@c906717b889b9a2ab13629b27338aa9b8f3ae7bb, whose body reports retained custody, startup draining and stale epoch fencing. It is not merged and must not be duplicated.

Deliver integrate and qualify existing agentwork teardown custody repair through the retained implementation. Success means the exact original requirements mapped below are observable from the supported host path, the named failure cases have deterministic regression evidence, and unsupported capabilities remain unavailable. Contract definitions, test-only injection and historical merged PRs are evidence of retained work, not current live acceptance.

## REQUIREMENTS

### Authoritative original requirements for this focused gap

**M09-S03.** Compute child authority as the intersection of parent grants, role policy and project/worktree binding. A child cannot gain rights by selecting another provider, calling a script broker or naming a different resource. Revalidate on dispatch and parent revocation.

**M09-S07.** Resume creates a new child run epoch and rechecks current parent, project, grants, model/account binding and output schema. Completed, failed or interrupted history is retained, but expired approvals and old runnable process handles are not inherited.

**M09-S13.** On parent stop/archive revoke dispatch first, cancel children and confirm teardown. Late results may remain historical under M02 but cannot revive the plan. Reconstruct the visible graph after restart from durable facts and explicit unknown states.

**M09-T04.** Resume after changed account, project or revoked parent refuses stale authority and keeps old history.

**M09-T06.** Restart graph reconstruction, out-of-order events and late cancelled child output never produce phantom completion.

**M09-G01.** Core read-only orchestration needs M01/M02/M04. Write roles additionally require M08 and native execution proof; QA needs M06. These capability-specific gates replace unnecessary universal prerequisite chains.

**M09-G03.** Rollback: Disable new roles and queue admissions; retain original read-only coordinator and all input/evidence receipts. Do not replay unresolved deliveries or delete dirty child workspaces.

### Scope and fixed boundaries

This is a repair or completion of the named gap, not a reimplementation of the milestone. Preserve the original main-thread/read-only paths, historical records and default-false host flag registry. Never place these flags in UI preferences or let an agent/plugin enable them. No dependency, language server, debugger, provider runtime or platform backend download is authorized. M12/M14 belong to other workers and receive no edits. Do not restore retired CodeReviewHost, Research QA or other removed workspaces. UI changes use supported current surfaces only after the explicit API/surface decisions named below.

The source document calls the original milestone MERGED / DO NOT REIMPLEMENT. Its historical instructions are a requirement ledger here, not blanket implementation authorization. Implement only the specific failing requirement shown in OBJECTIVE and DESIGN. A missing accepted API, exact owner or real backend proof blocks that dependent task with a named HOLD; it does not authorize inventing a parallel subsystem.

Compatibility requires old records to remain readable, versioned new metadata rather than changing frozen contracts silently, and explicit migrations when needed. Keep bounded UTF8 payloads, approved path access and existing account custody. Expose loading, unavailable, stale, conflict and partial states honestly. UI controls must have visible labels, keyboard access, focus recovery and an explanatory disabled reason; use current shared components and existing reduced-motion policy. Preserve source text and private data; no secrets in logs/screenshots.

### Follow-up instructions preserved from the supplied completion document

M09 | Typed multi-agent work and task control
START M09 COMPLETION FOLLOW-UP
Start from accepted main at #350 and current M09 evidence. Own typed task admission, delivery, control and projection. Research v3 §14.4 and §17 P1-4 cover durable task handoffs and projection consistency.
1. Trace typed create, queue/send, stop, resume and review through the existing coordinator and real app. Run agent-work-v3 and the declared task/control browser cases. Verify handoff and delivery dedupe, no redelivery after a committed receipt, owner/budget constraints, deterministic parent progress, and unchanged child workspace after rejection.
2. Exercise each declared role independently. For code work, require the real M08 worktree and M03 approved profile before dispatch. For QA, require current M06 verification proof. Retain exact role-proof and worktree identities in receipts. Do not build another task queue or relax empty-proof refusal.
3. Bind the existing app agent list, task tree and messaging controls where required by the archived U clauses. Trace existing command/read adapters before making a UI join. Record loading, blocked, ready, stale and stopped states on the real application. Preserve the task identity across reload and do not present a queued operation as running.
4. Missing code/QA-specific role proofs remain HOLD_ROLE_PROOF with role and producer named. Any uncovered production surface requires its current owner to confirm the API before editing. Keep task capability flags default-off.
END M09 COMPLETION FOLLOW-UP

Only the clauses owned by this plan are implemented here; related requirements in the same follow-up remain dependencies with their separate owners.

## REPO_MAP

All links below are pinned to the audited source. A listed helper is not claimed to have a production caller unless explicitly stated. T01 refreshes these paths against the latest accepted main and active PRs before implementation.

| File | Verified function, component or evidence |
|---|---|
| [packages/core/agent-work.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/agent-work.ts) | releaseLive, revokeForParent, stop, dispose, dispatch |
| [packages/core/service.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts) | parent stop/archive |
| [tests/agent-work-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/agent-work-v3.test.ts) | synthetic lifetime tests |

Historical bundle evidence: [M09-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M09-verification.json). It belongs to the historical base recorded inside that document. It is not current main proof. M07 records live LSP/DAP and worker feed gates open; M08/M09 record pending independent review and platform/integration gates. Current [progress ledger](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/progress.md) does not establish these milestones complete.

Dependencies and adjacent owners:

- #1860 R03.A5 existing canonical scope
- PR1866 open c906717b889b9a2ab13629b27338aa9b8f3ae7bb
- M09-01 real native adapter qualification

## DESIGN

Use the existing owner and PR. Revoke dispatch first, retain adapter/account/capacity ownership until native teardown is confirmed, expose UNKNOWN/unconfirmed failure and permit bounded explicit retry. A late-created adapter is immediately fenced and drained; a stale START result cannot modify a resumed epoch. Parent stop/archive awaits the required cleanup or returns an honest failure. Preserve dirty worktrees and durable history.

### Concrete implementation and integration boundary

Review the current PR1866 patch and latest #1860 R03.A5 journal; do not recreate changes or overwrite the owner. If requested, add only missing acceptance tests on an agreed branch after explicit handoff. Confirm Service stop/archive and resume consume the awaited custody result. Refresh related Pi/Hermes teardown integration without broad edits.

Expose blocked cleanup/UNKNOWN in the current agent row and keep capacity occupied while unresolved. Retry is explicit cleanup, never a duplicated work START. Resume stays disabled while old adapter startup or teardown is unconfirmed; history remains readable.

### Failure, persistence, migration and rollback

Validate owner/source/epoch/revision immediately before authority-bearing effects and again when accepting asynchronous results. Preserve uncertain outcomes as explicit unknown/conflict/partial states; retry only after authoritative reconciliation. Writes must be either idempotently replayable from their durable receipt or require a new exact preview/approval. A UI acknowledgment is not an effect receipt. Missing proof remains unavailable, with the successful read-only path preserved.

New records require an explicit schema version, compatibility test against the retained format, and an owner-approved migration plan before T03. Rollback disables new admission at the existing host flag/capability boundary, retains all receipts, journals, blobs and dirty workspaces, and closes only confirmed-owned resources. It never rewrites user bytes or replays an unresolved input automatically. Do not remove historical evidence; label its source and acceptance limit.

## EXECUTION_DAG

Tasks are sequential unless T01 records a narrower nonoverlapping file allocation. Each handoff requires an issue checkpoint and receiver ACK. No task may take another worker's claimed implementation files.

### T01: Refresh custody and baseline

Owner: integration reviewer. Dependencies: complete canonical issue, this full plan, all comments and active related PRs. Inputs: pinned baseline and REPO_MAP. Read AGENTS.md/CONTRIBUTING.md and current issue journal; inspect latest main, related branches and full PR patches. Record which exact fixes are merged, open, withdrawn or owned. For reuse targets, preserve every original issue requirement above and resolve overlapping deliveries with the existing owner. Output: refreshed source map, exact interface owner and nonoverlapping task assignment. Positive check: every path/function and current production caller exists as stated. Negative check: no test-only seam, historical PASS or unmerged PR is called current. Done when this map and claim are read back from GitHub. Handoff: core owner for T02. If accepted API/scope is missing, mark only the affected task BLOCKED and preserve independent read-only work.

### T02: Reproduce and freeze the boundary

Owner: core reviewer, depends T01. Inputs: current source and requirements. Rerun PR1866’s exact deferred startup, failed START, rejected cancel/dispose, old START acknowledgment and shutdown-arrival regressions against both audited baseline and accepted integrated head. Add a real owned native child acceptance case after the actual runtime join; synthetic cancellation is not proof of process closure. Use owned temporary roots/fixtures and explicit barriers; do not alter the working user's data. Inspect the exact API, error taxonomy and versioning owner before proposing changes. Output: a failing focused product regression or a precise unavailable-acceptance gate, plus accepted input/output contracts and current behavior evidence. Positive/negative tests: the named baseline behavior and counterexample must both be asserted. Recovery/cancel: add the deterministic failure points named in VALIDATION. Done when the test fails for the stated cause or a missing proof is explicitly recorded without fabricating a runtime failure. Handoff: T03 implementing owner.

### T03: Repair the core contract and lifecycle

Owner: one host/domain implementer, depends T02 and named upstream proof/API decisions. Inputs: the accepted contract and failing regression. Review the current PR1866 patch and latest #1860 R03.A5 journal; do not recreate changes or overwrite the owner. If requested, add only missing acceptance tests on an agreed branch after explicit handoff. Confirm Service stop/archive and resume consume the awaited custody result. Refresh related Pi/Hermes teardown integration without broad edits. Edit only the verified owning files in REPO_MAP and necessary versioned interfaces; any additional path must be discovered and recorded, not guessed. Output: minimal reviewed implementation with persistent identity/recovery semantics and a green focused regression. Positive check: intended current path works. Negative check: denied/stale inputs have zero unauthorized effects. Recovery/cancel check: durable state stays truthful under the exact failure barriers. Done when the branch records commit SHA, changed paths, test outputs and unresolved platform gates. Handoff: T04 surface/adapter owner after interface commit and ACK.

### T04: Connect the real caller and supported UI

Owner: adapter/UI implementer, depends T03. Inputs: accepted service interface, current supported app surface and source-bound fixtures. Expose blocked cleanup/UNKNOWN in the current agent row and keep capacity occupied while unresolved. Retry is explicit cleanup, never a duplicated work START. Resume stays disabled while old adapter startup or teardown is unconfirmed; history remains readable. Trace the real start-to-result path and attach owner/revision to every request and response. Do not claim a fixture-only component or a mounted but empty reader is a production integration. Output: working supported entry point and visible blocked/error/recovery states. Positive check: user action reaches exactly one owned operation. Negative check: missing proof, changed context or stale response cannot display success or dispatch. Recovery/cancel check: reload/stop/switch-owner retains authoritative history and does not retry uncertain mutations. Done when a browser trace and exact request/response assertions cover the real caller. Handoff: T05 verifier. If this plan has no UI change, verify the existing affected caller and state instead of introducing a new screen.

### T05: Execute requirement acceptance at the proper level

Owner: independent verifier, depends T04 and the exact approved toolchain/platform. Inputs: pinned implementation head, complete requirement matrix, owned fixtures and approved native inputs. Run the focused commands in VALIDATION, then the specific supported App and native cases. Do not install missing prerequisites or substitute the provisioned wrong pnpm version. Output: source-pinned results with expected/actual outcomes, counts, logs, environment identity and explicit NOT_RUN gates. Positive/negative/recovery/cancel outcomes are all required. Preserve earlier failing attempts and do not call synthetic adapter or guard stubs native proof. Done when every owned matrix row is passed or precisely held with owner and next executable step. Handoff: T06 integration owner, with actionable defects returned to T03/T04.

### T06: Review, evidence and release

Owner: integration owner, depends T05. Inputs: reviewed exact head, test evidence and latest upstream PR state. Rebase only after agreed owner coordination; rerun affected checks after any source change. Update the current qualification record with source identity, actual adapter/backend version, test scope, unavailable phases and independent review outcome. A documentation change follows #1972 ownership. Preserve rollback/recovery records and prepare the focused PR under existing review rules. Positive check: all accepted requirements have evidence. Negative check: no pending CI, mock PASS, historical artifact or unpublished local file is presented as complete. Done when review/CI and actual-on-main acceptance are separately recorded. Final checkpoint releases OWNER=NONE, clears only own assignment/labels and gives the next operator exact source and remaining gates. Publication or merge alone does not close unmet acceptance.

## VALIDATION

### Reproducible setup and planned commands

Run from the repository root with Node meeting package.json (audited runtime 24.22.3) and the pinned pnpm 10.30.3 plus already provisioned locked dependencies. Current audit has pnpm 11.25.0 and no node_modules; offline Corepack cannot supply the pin. Product suites are NOT_RUN/HOLD_TOOLCHAIN. Obtain an approved provisioned environment through the owner; do not download or rewrite the lockfile. Browser fixtures require the already provisioned browser. Real Windows/native proof uses the exact approved backend/profile, not Linux guard stubs.

```sh
pnpm exec vitest run tests/agent-work-v3.test.ts tests/agent-input-v3.test.ts tests/side-runtime-cleanup.test.ts --maxWorkers=1
pnpm typecheck
pnpm exec vitest run tests/public-source.test.ts --maxWorkers=1
pnpm check:docs-links
```

Existing commands above must exist at the refreshed head; proposed PR-only paths are explicitly identified in this plan and run only after their reviewed introduction. New tests added by T02 are registered in scripts/public-source-files.json and named in the implementation checkpoint. A route-mocked browser proves rendering/request behavior only; the same user flow must be repeated through the current actual app for the integration gate. Native process/filesystem tests record exact platform, executable/profile identity and pre/post state.

### Fixtures and expected behavior

Positive: confirmed cleanup releases only the owned adapter/slot once. Negative: rejected cancel/dispose never yields a false clean stop or unhandled rejection; stale ack cannot revive. Recovery: startup completion after shutdown is drained, interrupted state remains explicit on restart. Cancel: parent revoke prevents subsequent tool effects before waiting, and unrelated children remain untouched.

For all cases, record the input owner/source/revision, expected effect count, actual state/bytes, log or trace path and final outcome. Retry tests must prove at-most-once user/effect semantics rather than merely returning a success response. Screenshots use synthetic data and include unavailable/stale/partial states where the plan owns UI. Keyboard and focus tests verify the existing shared surface at narrow width and reduced motion.

### Acceptance mapping

| Original requirement | Tasks | Acceptance |
|---|---|---|
| M09-S03 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M09-S07 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M09-S13 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M09-T04 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M09-T06 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M09-G01 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M09-G03 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |

### Executed versus pending

This audit executed source reads, repository-wide caller searches and GitHub issue/PR inspections. It did not run product tests, enable features, exercise a live provider, or mutate repository files. The only executed behavioral fixture for M08-01/M08-02 is the dependency-free owned Git/source-predicate reproduction reproduced below; all other runtime acceptance remains NOT_RUN. Historical test results remain attributed to their original PR/base. Existing scope reuse only; PR1866 remains open. Canonical publication must contain the complete focused plan. Append it to the preserved full #1860 body only if the complete remediation matrix plus plan fits the issue limit. Otherwise root creates a narrow acceptance child linked to #1860 R03.A5/PR1866 and explicitly preserves the existing implementation owner. A comment-only synopsis is not a complete plan publication.

### Mandatory repository gates retained from v6

Before the relevant targeted suites, run the required asset builds in the provisioned matching toolchain. Execute each command separately and retain its real exit code and bounded log hash. A missing native build prerequisite blocks that dependent acceptance lane; test:no-lease is diagnostic only and cannot replace pnpm test. Do not download a toolchain, change browser channels, extend a timeout, skip required cases or use passWithNoTests to obtain green.

```text
pnpm build:credential-lease
pnpm build:widgets
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:browser
```

The focused commands already listed run after asset preparation and before the full gates. Record actual case identities, passed/failed/skipped counts, source SHA and environment for each receipt. Product, native, installed and live checks remain NOT_RUN/HOLD_TOOLCHAIN in this audit. These are prospective implementation acceptance commands, not review results.

### Plan artifact availability

The actual GitHub Markdown file upload failed in this review environment. The full execution plan is published in the canonical issue body, and its .md source is provided separately with the review deliverables. Issue-body text is not represented as an attachment. No repository-docs commit or PR was authorized or created. The publisher reads back the entire body and records its source SHA256 before releasing the publication scope.

## STATE

Researched: all relevant supplied v6 and completion clauses, research context, pinned source and adjacent issue scopes. Decided: preserve retained implementations, frozen interfaces, current supported surfaces, exact authority and independent gates; each concrete design above is a proposed repair of the named requirement, not a new activation decision. Implemented by this audit: no product code or tests. Verified: source existence/caller absence and the explicitly stated owned Git primitive fixture only. Runtime, browser, Windows/native, installed/live and independent acceptance: NOT_RUN unless separately recorded by a future owner at the exact head.

T01–T06 are NOT_STARTED for implementation. Audit drafts are ready for coordinator duplicate/quality review. Existing issue/PR owners and their release checkpoints remain authoritative; do not infer release from silence. Risks: current main can move, pending fixes overlap, APIs may be intentionally unavailable, and mocks cannot prove confinement. Exact next action: root validates this full plan and its duplicate target; the future implementation owner then reads the whole issue/journal, claims the smallest scope, refreshes current source/PR state and executes T01. Existing scope reuse only; PR1866 remains open. Canonical publication must contain the complete focused plan. Append it to the preserved full #1860 body only if the complete remediation matrix plus plan fits the issue limit. Otherwise root creates a narrow acceptance child linked to #1860 R03.A5/PR1866 and explicitly preserves the existing implementation owner. A comment-only synopsis is not a complete plan publication.

## REFERENCES

- [Pinned source tree](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b); [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md); [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md).
- [Canonical audit #1992](https://github.com/skytuhua-org/Gen-V1/issues/1992); [audit checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/1992#issuecomment-7121928309).
- Original supplied v6: M07 archive lines 1092–1130, M08 1131–1172, M09 1173–1214; global rules 1–132. Relevant substantive clauses are reproduced in REQUIREMENTS so execution does not depend on private chat.
- Supplied completion followups: common lines 1397–1413 and M09 lines 1478–1485; relevant steps are reproduced above. Global policy: compare base/current source, retain facts, execute only explicit accepted gaps, record precise HOLD inputs, keep unrun phases unrun.
- Supplied research-v3: sections 19–26 and feature rationale M07 F13/F14/F59; M08 F20/F21/F22/F23/F24/F45; M09 F32–F39. These motivate exact edit provenance, independent worktree authority, reversible file recovery, native acknowledgment and evidence-bound progress; they do not override v6 or mandate copying donor implementations.
- Merged source history: [M07 PR335](https://github.com/skytuhua-org/Gen-V1/pull/335), [accepted retirement PR394](https://github.com/skytuhua-org/Gen-V1/pull/394), [M08 PR331](https://github.com/skytuhua-org/Gen-V1/pull/331), [frontend PR336](https://github.com/skytuhua-org/Gen-V1/pull/336), [M09 PR350](https://github.com/skytuhua-org/Gen-V1/pull/350). M07 old dedicated review surface is intentionally retired; acceptance is through a supported current surface only.
