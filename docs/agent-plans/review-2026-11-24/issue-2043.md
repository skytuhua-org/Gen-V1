# Plan: Require trusted current evidence before verifying child work

## META

| Field | Value |
|---|---|
| Audit finding | M09-03 |
| Repository | skytuhua-org/Gen-V1 |
| Canonical target | [2043](https://github.com/skytuhua-org/Gen-V1/issues/2043) |
| Parent review | [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992), T07–T09 |
| Plan revision/date | original-plan-audit-r1, 2026-11-24 UTC |
| Verified baseline | main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b |
| Status | Planning only. Retained implementation exists; the specific gaps below are not verified complete. No code, tests, configuration, branches or PRs changed by this audit. |
| Source precedence | User v6 ledger is authoritative; completion appendix supplies follow-up sequence; research v3 supplies rationale only. Exact relevant original clauses are reproduced below. |
| Ownership | Audit owner codex-cloud-m0709-b197ad releases to codex-cloud-ca7d38 for publication. Existing implementation/review owners retain custody. Future implementing owner must claim this focused scope before editing. |

## OBJECTIVE

submitResult records every schema-valid output as COMPLETED_REPORTED, including incomplete/blocked outcomes. verify checks coordinator output provenance and whether referenced data exists under the parent at the same revision; it does not require trusted evidence provenance, actual check result or nonempty required evidence. Current tests expect empty evidence to verify and accept a generic test note. No production parent completion integration waits for required typed child evidence. This helper is currently unreachable from production, which limits exposure but does not satisfy the original verification requirement.

Deliver require trusted current evidence before verifying child work through the retained implementation. Success means the exact original requirements mapped below are observable from the supported host path, the named failure cases have deterministic regression evidence, and unsupported capabilities remain unavailable. Contract definitions, test-only injection and historical merged PRs are evidence of retained work, not current live acceptance.

## REQUIREMENTS

### Authoritative original requirements for this focused gap

**M09-C01.** AgentWorkV1: workId, parentOwner, childOwner, role PLAN_READ|CODE_WORKTREE|QA|RESEARCH_READ, inputContractDigest, expectedOutputSchema, grantSubset, budget, state QUEUED|RUNNING|WAITING_HUMAN|COMPLETED_REPORTED|VERIFIED|FAILED|CANCELLED|INTERRUPTED and outputRef, with optional failureReason OUTPUT_SCHEMA_INVALID|BUDGET_EXHAUSTED|PERMISSION_REVOKED|RUNTIME_FAILURE|UNKNOWN. QA and code roles require their own registered host capabilities, not automatic planner-tool widening.

**M09-S02.** Define strict result schemas for each role with bounded strings, evidence references and explicit incomplete/blocked outcomes. On invalid model output allow one repair request containing validation errors; after a second invalid result set state=FAILED and failureReason=OUTPUT_SCHEMA_INVALID and preserve the raw output only in a private bounded artifact.

**M09-S10.** Use positive integer weight units. Splitting a task divides its existing allocation so total parent weight is unchanged. Compute displayed percentages from rational sums and round only for presentation. Unknown work has an unknown portion, not a fabricated 0% or 100%. Reported completion remains distinct from accepted verification.

**M09-S12.** For CODE_WORKTREE require M08 managed-worktree and M03 profile proof; for QA require M06 typed verification capability. If absent, expose role unavailable while PLAN_READ continues. Parent completion waits for required child evidence, not every optional advisory child.

**M09-U01.** Agent list shows role, owner, worktree, state, blocked reason, budget and evidence freshness. Controls are Steer now only where supported, Queue next, Stop and Open evidence.

**M09-U03.** Task tree shows weighted known progress and unknown share. Opening a leaf shows requirements, assigned agents, outputs, blockers and verification. Reports collapse unchanged history.

**M09-T01.** Invalid output schema repairs at most once. Fabricated evidence cannot set VERIFIED.

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
| [packages/core/agent-work.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/agent-work.ts) | submitResult, verify, work output storage |
| [packages/core/project-verification.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/project-verification.ts) | typed verification observations |
| [packages/core/verification-gate.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/verification-gate.ts) | current evidence assessment |
| [apps/server/agent-work-routes.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/agent-work-routes.ts) | output freshness |
| [tests/agent-work-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/agent-work-v3.test.ts) | verification accepts empty evidence and test provenance |

Historical bundle evidence: [M09-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M09-verification.json). It belongs to the historical base recorded inside that document. It is not current main proof. M07 records live LSP/DAP and worker feed gates open; M08/M09 record pending independent review and platform/integration gates. Current [progress ledger](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/progress.md) does not establish these milestones complete.

Dependencies and adjacent owners:

- M06/#1030 typed verification integration
- M09-01 runtime result join
- M09-05 progress must distinguish reported/verified
- #1360 open PR1523@db0fe19977898a484f6ec4392fce07da1d55ade1 and PR1413@76282cb9e6a1686cd6737fdb1c790b542e773b5e own current panel/API tests. Coordinate new expectations; do not duplicate their tests or preserve the current hidden error behavior as desired acceptance.

## DESIGN

Keep reported output distinct from verification. Derive required evidence from the admitted role/output contract and current parent requirement; do not require tests for a purely read-only result unless its contract requires them. A host verifier validates the role-specific result, binding, source/environment fingerprint, check outcome and current revision. Generic model-authored data or existing record IDs do not constitute verification. BLOCKED/INCOMPLETE remain explicit reported outcomes. Required children gate parent completion; optional advisory children do not. Late results remain historical.

### Concrete implementation and integration boundary

Add a typed evidence-verifier hook using existing M06/current-data contracts, and make verify consume its authoritative result instead of record existence. Record rejection reasons and evidence binding. Keep output schemas and one repair logic; bound private raw UTF8 bytes. Integrate required-child evidence into existing completion assessment at the accepted owner seam, no duplicate task completion engine.

Rows and Open evidence distinguish Reported, Verified, Incomplete, Blocked and stale proof. Leaf details show the required evidence and why a ref is unavailable/stale. Never display 100% accepted progress just because the child returned valid JSON.

### Failure, persistence, migration and rollback

Validate owner/source/epoch/revision immediately before authority-bearing effects and again when accepting asynchronous results. Preserve uncertain outcomes as explicit unknown/conflict/partial states; retry only after authoritative reconciliation. Writes must be either idempotently replayable from their durable receipt or require a new exact preview/approval. A UI acknowledgment is not an effect receipt. Missing proof remains unavailable, with the successful read-only path preserved.

New records require an explicit schema version, compatibility test against the retained format, and an owner-approved migration plan before T03. Rollback disables new admission at the existing host flag/capability boundary, retains all receipts, journals, blobs and dirty workspaces, and closes only confirmed-owned resources. It never rewrites user bytes or replays an unresolved input automatically. Do not remove historical evidence; label its source and acceptance limit.

## EXECUTION_DAG

Tasks are sequential unless T01 records a narrower nonoverlapping file allocation. Each handoff requires an issue checkpoint and receiver ACK. No task may take another worker's claimed implementation files.

### T01: Refresh custody and baseline

Owner: integration reviewer. Dependencies: complete canonical issue, this full plan, all comments and active related PRs. Inputs: pinned baseline and REPO_MAP. Read AGENTS.md/CONTRIBUTING.md and current issue journal; inspect latest main, related branches and full PR patches. Record which exact fixes are merged, open, withdrawn or owned. For reuse targets, preserve every original issue requirement above and resolve overlapping deliveries with the existing owner. Output: refreshed source map, exact interface owner and nonoverlapping task assignment. Positive check: every path/function and current production caller exists as stated. Negative check: no test-only seam, historical PASS or unmerged PR is called current. Done when this map and claim are read back from GitHub. Handoff: core owner for T02. If accepted API/scope is missing, mark only the affected task BLOCKED and preserve independent read-only work.

### T02: Reproduce and freeze the boundary

Owner: core reviewer, depends T01. Inputs: current source and requirements. Submit valid output with an invented ref, a real model-authored record, empty required evidence, failed/stale M06 check and wrong source/account/epoch. None may become VERIFIED. Submit host-approved current evidence of the correct role and requirement and verify once. Revalidate after evidence revision or plan source changes. Test blocked/incomplete outputs and optional versus required child gating. Use owned temporary roots/fixtures and explicit barriers; do not alter the working user's data. Inspect the exact API, error taxonomy and versioning owner before proposing changes. Output: a failing focused product regression or a precise unavailable-acceptance gate, plus accepted input/output contracts and current behavior evidence. Positive/negative tests: the named baseline behavior and counterexample must both be asserted. Recovery/cancel: add the deterministic failure points named in VALIDATION. Done when the test fails for the stated cause or a missing proof is explicitly recorded without fabricating a runtime failure. Handoff: T03 implementing owner.

### T03: Repair the core contract and lifecycle

Owner: one host/domain implementer, depends T02 and named upstream proof/API decisions. Inputs: the accepted contract and failing regression. Add a typed evidence-verifier hook using existing M06/current-data contracts, and make verify consume its authoritative result instead of record existence. Record rejection reasons and evidence binding. Keep output schemas and one repair logic; bound private raw UTF8 bytes. Integrate required-child evidence into existing completion assessment at the accepted owner seam, no duplicate task completion engine. Edit only the verified owning files in REPO_MAP and necessary versioned interfaces; any additional path must be discovered and recorded, not guessed. Output: minimal reviewed implementation with persistent identity/recovery semantics and a green focused regression. Positive check: intended current path works. Negative check: denied/stale inputs have zero unauthorized effects. Recovery/cancel check: durable state stays truthful under the exact failure barriers. Done when the branch records commit SHA, changed paths, test outputs and unresolved platform gates. Handoff: T04 surface/adapter owner after interface commit and ACK.

### T04: Connect the real caller and supported UI

Owner: adapter/UI implementer, depends T03. Inputs: accepted service interface, current supported app surface and source-bound fixtures. Rows and Open evidence distinguish Reported, Verified, Incomplete, Blocked and stale proof. Leaf details show the required evidence and why a ref is unavailable/stale. Never display 100% accepted progress just because the child returned valid JSON. Trace the real start-to-result path and attach owner/revision to every request and response. Do not claim a fixture-only component or a mounted but empty reader is a production integration. Output: working supported entry point and visible blocked/error/recovery states. Positive check: user action reaches exactly one owned operation. Negative check: missing proof, changed context or stale response cannot display success or dispatch. Recovery/cancel check: reload/stop/switch-owner retains authoritative history and does not retry uncertain mutations. Done when a browser trace and exact request/response assertions cover the real caller. Handoff: T05 verifier. If this plan has no UI change, verify the existing affected caller and state instead of introducing a new screen.

### T05: Execute requirement acceptance at the proper level

Owner: independent verifier, depends T04 and the exact approved toolchain/platform. Inputs: pinned implementation head, complete requirement matrix, owned fixtures and approved native inputs. Run the focused commands in VALIDATION, then the specific supported App and native cases. Do not install missing prerequisites or substitute the provisioned wrong pnpm version. Output: source-pinned results with expected/actual outcomes, counts, logs, environment identity and explicit NOT_RUN gates. Positive/negative/recovery/cancel outcomes are all required. Preserve earlier failing attempts and do not call synthetic adapter or guard stubs native proof. Done when every owned matrix row is passed or precisely held with owner and next executable step. Handoff: T06 integration owner, with actionable defects returned to T03/T04.

### T06: Review, evidence and release

Owner: integration owner, depends T05. Inputs: reviewed exact head, test evidence and latest upstream PR state. Rebase only after agreed owner coordination; rerun affected checks after any source change. Update the current qualification record with source identity, actual adapter/backend version, test scope, unavailable phases and independent review outcome. A documentation change follows #1972 ownership. Preserve rollback/recovery records and prepare the focused PR under existing review rules. Positive check: all accepted requirements have evidence. Negative check: no pending CI, mock PASS, historical artifact or unpublished local file is presented as complete. Done when review/CI and actual-on-main acceptance are separately recorded. Final checkpoint releases OWNER=NONE, clears only own assignment/labels and gives the next operator exact source and remaining gates. Publication or merge alone does not close unmet acceptance.

## VALIDATION

### Reproducible setup and planned commands

Run from the repository root with Node meeting package.json (audited runtime 24.22.3) and the pinned pnpm 10.30.3 plus already provisioned locked dependencies. Current audit has pnpm 11.25.0 and no node_modules; offline Corepack cannot supply the pin. Product suites are NOT_RUN/HOLD_TOOLCHAIN. Obtain an approved provisioned environment through the owner; do not download or rewrite the lockfile. Browser fixtures require the already provisioned browser. Real Windows/native proof uses the exact approved backend/profile, not Linux guard stubs.

```sh
pnpm exec vitest run tests/agent-work-v3.test.ts tests/verification-v3.test.ts --maxWorkers=1
pnpm exec playwright test --config tests/e2e/agents-workspace.playwright.config.ts
pnpm typecheck
pnpm exec vitest run tests/public-source.test.ts --maxWorkers=1
pnpm check:docs-links
```

Existing commands above must exist at the refreshed head; proposed PR-only paths are explicitly identified in this plan and run only after their reviewed introduction. New tests added by T02 are registered in scripts/public-source-files.json and named in the implementation checkpoint. A route-mocked browser proves rendering/request behavior only; the same user flow must be repeated through the current actual app for the integration gate. Native process/filesystem tests record exact platform, executable/profile identity and pre/post state.

### Fixtures and expected behavior

Positive: trusted current role evidence verifies the intended required child only. Negative: empty required/fabricated/model-authored/stale/failed/wrong-owner evidence never verifies. Recovery: evidence or source revision change invalidates acceptance without deleting historical output. Cancel: late result from a cancelled epoch cannot revive child or parent completion.

For all cases, record the input owner/source/revision, expected effect count, actual state/bytes, log or trace path and final outcome. Retry tests must prove at-most-once user/effect semantics rather than merely returning a success response. Screenshots use synthetic data and include unavailable/stale/partial states where the plan owns UI. Keyboard and focus tests verify the existing shared surface at narrow width and reduced motion.

### Acceptance mapping

| Original requirement | Tasks | Acceptance |
|---|---|---|
| M09-C01 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M09-S02 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M09-S10 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M09-S12 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M09-U01 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M09-U03 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M09-T01 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M09-T06 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M09-G01 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M09-G03 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |

### Executed versus pending

This audit executed source reads, repository-wide caller searches and GitHub issue/PR inspections. It did not run product tests, enable features, exercise a live provider, or mutate repository files. The only executed behavioral fixture for M08-01/M08-02 is the dependency-free owned Git/source-predicate reproduction reproduced below; all other runtime acceptance remains NOT_RUN. Historical test results remain attributed to their original PR/base. HOLD_VERIFICATION_CONTRACT until role-specific accepted evidence rules and required-child completion join are agreed with M06 owner. Do not activate QA based on a generic data reference.

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

T01–T06 are NOT_STARTED for implementation. Audit drafts are ready for coordinator duplicate/quality review. Existing issue/PR owners and their release checkpoints remain authoritative; do not infer release from silence. Risks: current main can move, pending fixes overlap, APIs may be intentionally unavailable, and mocks cannot prove confinement. Exact next action: root validates this full plan and its duplicate target; the future implementation owner then reads the whole issue/journal, claims the smallest scope, refreshes current source/PR state and executes T01. HOLD_VERIFICATION_CONTRACT until role-specific accepted evidence rules and required-child completion join are agreed with M06 owner. Do not activate QA based on a generic data reference.

## REFERENCES

- [Pinned source tree](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b); [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md); [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md).
- [Canonical audit #1992](https://github.com/skytuhua-org/Gen-V1/issues/1992); [audit checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/1992#issuecomment-7121928309).
- Original supplied v6: M07 archive lines 1092–1130, M08 1131–1172, M09 1173–1214; global rules 1–132. Relevant substantive clauses are reproduced in REQUIREMENTS so execution does not depend on private chat.
- Supplied completion followups: common lines 1397–1413 and M09 lines 1478–1485; relevant steps are reproduced above. Global policy: compare base/current source, retain facts, execute only explicit accepted gaps, record precise HOLD inputs, keep unrun phases unrun.
- Supplied research-v3: sections 19–26 and feature rationale M07 F13/F14/F59; M08 F20/F21/F22/F23/F24/F45; M09 F32–F39. These motivate exact edit provenance, independent worktree authority, reversible file recovery, native acknowledgment and evidence-bound progress; they do not override v6 or mandate copying donor implementations.
- Merged source history: [M07 PR335](https://github.com/skytuhua-org/Gen-V1/pull/335), [accepted retirement PR394](https://github.com/skytuhua-org/Gen-V1/pull/394), [M08 PR331](https://github.com/skytuhua-org/Gen-V1/pull/331), [frontend PR336](https://github.com/skytuhua-org/Gen-V1/pull/336), [M09 PR350](https://github.com/skytuhua-org/Gen-V1/pull/350). M07 old dedicated review surface is intentionally retired; acceptance is through a supported current surface only.
