# Plan: Make rename apply and recovery durable against path races and crashes

## META

| Field | Value |
|---|---|
| Audit finding | M07-03 |
| Repository | skytuhua-org/Gen-V1 |
| Canonical target | [2022](https://github.com/skytuhua-org/Gen-V1/issues/2022) |
| Parent review | [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992), T07–T09 |
| Plan revision/date | original-plan-audit-r1, 2026-11-24 UTC |
| Verified baseline | main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b |
| Status | Planning only. Retained implementation exists; the specific gaps below are not verified complete. No code, tests, configuration, branches or PRs changed by this audit. |
| Source precedence | User v6 ledger is authoritative; completion appendix supplies follow-up sequence; research v3 supplies rationale only. Exact relevant original clauses are reproduced below. |
| Ownership | Audit owner codex-cloud-m0709-b197ad releases to codex-cloud-ca7d38 for publication. Existing implementation/review owners retain custody. Future implementing owner must claim this focused scope before editing. |

## OBJECTIVE

Planning rejects resource operations and binds preimages. Apply uses a service-local mutation lock, writes JSON journals directly without atomic replace/fsync, then checks a digest before a directory-guarded writeFile. Another writer can change the leaf between the check and write. Recovery likewise checks postimage before a later unconditioned writeFile, has no shared operation lock, and never persists recovery dispositions. The existing crash test manually fabricates journal state; it does not kill at every durable boundary. No production all-hunks confirmation view is mounted.

Deliver make rename apply and recovery durable against path races and crashes through the retained implementation. Success means the exact original requirements mapped below are observable from the supported host path, the named failure cases have deterministic regression evidence, and unsupported capabilities remain unavailable. Contract definitions, test-only injection and historical merged PRs are evidence of retained work, not current live acceptance.

## REQUIREMENTS

### Authoritative original requirements for this focused gap

**M07-C03.** RenamePlanV1: planId, workspaceIdentity, serverVersion, sourceVersions[], textEdits[], expectedBeforeDigests and exactApprovalId. First version supports text edits to existing files only; create/delete/move/resource operations and ungranted roots are rejected.

**M07-S08.** Rename is preview, exact approval, then guarded apply. Validate every target/preimage while holding the workspace mutation lock. Write a durable recovery journal and backup references before the first change. A multi-file filesystem operation is not a database transaction: after a crash, reconcile each path; never promise magical all-file atomicity.

**M07-S09.** Rollback may restore a path only when its current bytes match the bundle's written postimage. If an external editor changed it, stop and show PARTIAL_RECOVERY_REQUIRED; do not overwrite that edit. Preserve backups and a per-path disposition.

**M07-U03.** Rename review lists all files and before/after hunks with one confirmation. Recovery presents per-file Applied, Restored, Unchanged or Conflict, never a misleading single success after partial failure.

**M07-T02.** Unicode positions, external file URIs, malicious server edits, ambiguous anchors and unsupported resource operations are refused or normalized correctly.

**M07-T04.** Crash after each renamed file, external edit during rollback, changed preimage and revoked workspace produce no silent overwrite.

**M07-G01.** Navigation can ship without rename or debugger. Rename requires recovery-journal and path-race tests; debugger execution additionally requires real platform confinement proof. A missing LSP or debugger is UNSUPPORTED, not a reason for regex or unrestricted-shell fallback.

**M07-G02.** Host-owned flags: coding.intelligenceV1, coding.renameV1, coding.debuggerV1. Register only these keys in the shared finite registry; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M07-G03.** Rollback: Disable adapters, close owned servers and retain edit recovery journals. Do not revert user code automatically during feature rollback; resolve pending per-file recovery explicitly.

### Scope and fixed boundaries

This is a repair or completion of the named gap, not a reimplementation of the milestone. Preserve the original main-thread/read-only paths, historical records and default-false host flag registry. Never place these flags in UI preferences or let an agent/plugin enable them. No dependency, language server, debugger, provider runtime or platform backend download is authorized. M12/M14 belong to other workers and receive no edits. Do not restore retired CodeReviewHost, Research QA or other removed workspaces. UI changes use supported current surfaces only after the explicit API/surface decisions named below.

The source document calls the original milestone MERGED / DO NOT REIMPLEMENT. Its historical instructions are a requirement ledger here, not blanket implementation authorization. Implement only the specific failing requirement shown in OBJECTIVE and DESIGN. A missing accepted API, exact owner or real backend proof blocks that dependent task with a named HOLD; it does not authorize inventing a parallel subsystem.

Compatibility requires old records to remain readable, versioned new metadata rather than changing frozen contracts silently, and explicit migrations when needed. Keep bounded UTF8 payloads, approved path access and existing account custody. Expose loading, unavailable, stale, conflict and partial states honestly. UI controls must have visible labels, keyboard access, focus recovery and an explanatory disabled reason; use current shared components and existing reduced-motion policy. Preserve source text and private data; no secrets in logs/screenshots.

### Follow-up instructions preserved from the supplied completion document

M07 | Code intelligence, precise edits and debugger
START M07 COMPLETION FOLLOW-UP
Start from accepted main at the existing #335 delivery and read M07-verification.json. Own LSP/diff diagnostics, precise edit/rename and debug integration. Research v3 §6 items 7 and 16 and §17 P1-3 require exact revision attribution.
1. Preserve the existing advisory observation path into M06. Wire the documented eligible completed-write boundary from the Hermes worker to that existing host path if still absent and specified by current contracts. Feed only observed owner and version identities. Compare diagnostic baselines at matching source digests; missing/stale baselines must surface unavailable.
2. Run the repository code-intelligence, edit/rename, rename-recovery and debug-policy targeted cases. Require changed-input or replaced-source refusal, restart-safe recovery, no edit outside the owned workspace, and read-only debug inspection only for a paused authorized session. Reuse the current journal and exact digest guards.
3. Use only assigned language-server executable identities and the approved debug backend through M03 selection. On actual supported platform, record a live versioned diagnostics session and a real owned DAP lifecycle including stop and revocation. Keep evaluations gated as effects. Existing fake adapter fixtures remain unit evidence.
4. Missing language-server approval is HOLD_LSP_PROOF; missing approved backend is HOLD_DEBUG_PLATFORM_PROOF. Require the existing installed/browser caller and independent review evidence for release. No new runtime, server or debugger dependency selection.
END M07 COMPLETION FOLLOW-UP

Only the clauses owned by this plan are implemented here; related requirements in the same follow-up remain dependencies with their separate owners.

## REPO_MAP

All links below are pinned to the audited source. A listed helper is not claimed to have a production caller unless explicitly stated. T01 refreshes these paths against the latest accepted main and active PRs before implementation.

| File | Verified function, component or evidence |
|---|---|
| [packages/core/code-intelligence.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/code-intelligence.ts) | planRename, applyRename, recoverRename, underLock |
| [packages/core/file-access.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/file-access.ts) | withPathGuard, replaceOwnedFile and bound file access |
| [apps/server/code-intelligence-routes.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/code-intelligence-routes.ts) | rename plan/apply/recover and exact approval consumption |
| [apps/web/src/code-review-workspace/CodeIntelligencePanel.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/code-review-workspace/CodeIntelligencePanel.tsx) | RenameOutcome only |
| [tests/rename-recovery-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/rename-recovery-v3.test.ts) | preimage/recovery fixtures |

Historical bundle evidence: [M07-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M07-verification.json). It belongs to the historical base recorded inside that document. It is not current main proof. M07 records live LSP/DAP and worker feed gates open; M08/M09 record pending independent review and platform/integration gates. Current [progress ledger](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/progress.md) does not establish these milestones complete.

Dependencies and adjacent owners:

- M02 exact approval and shared mutation admission
- M07-01 approved LSP proof
- M07-02 supported review surface decision

## DESIGN

Reuse the managed workspace mutation coordinator and bound replace primitive so leaf identity plus expected digest are checked at the final mutation boundary. Validate server source versions and all target preimages before apply. Atomically publish and sync versioned journal records and backup references before first mutation; persist per-path intent, written digest, verified outcome and recovery disposition. Recover only a currently matching written postimage using the same conditional replace. Unknown/torn journals and partial rollback preserve backups and expose PARTIAL_RECOVERY_REQUIRED. Journal completion is an observed result, never proof that the disk has not changed afterward.

### Concrete implementation and integration boundary

Update only code-intelligence rename paths and necessary file-access/shared-lock interfaces. Use existing conditional file primitives rather than inventing atomic multi-file behavior. Strictly parse versioned journals; retain old readable journals behind explicit migration/read compatibility. Do not mark unresolved conflict journals as fully resolved; persist retry-safe recovery receipts.

Current shared Changes review must show every target and before/after hunk before one exact approval. Render the authoritative per-file Applied/Restored/Unchanged/Conflict result and explicit recovery action. Do not resurrect dedicated Code Review. Read-only journal review must remain available when rename admission is disabled.

### Failure, persistence, migration and rollback

Validate owner/source/epoch/revision immediately before authority-bearing effects and again when accepting asynchronous results. Preserve uncertain outcomes as explicit unknown/conflict/partial states; retry only after authoritative reconciliation. Writes must be either idempotently replayable from their durable receipt or require a new exact preview/approval. A UI acknowledgment is not an effect receipt. Missing proof remains unavailable, with the successful read-only path preserved.

New records require an explicit schema version, compatibility test against the retained format, and an owner-approved migration plan before T03. Rollback disables new admission at the existing host flag/capability boundary, retains all receipts, journals, blobs and dirty workspaces, and closes only confirmed-owned resources. It never rewrites user bytes or replays an unresolved input automatically. Do not remove historical evidence; label its source and acceptance limit.

## EXECUTION_DAG

Tasks are sequential unless T01 records a narrower nonoverlapping file allocation. Each handoff requires an issue checkpoint and receiver ACK. No task may take another worker's claimed implementation files.

### T01: Refresh custody and baseline

Owner: integration reviewer. Dependencies: complete canonical issue, this full plan, all comments and active related PRs. Inputs: pinned baseline and REPO_MAP. Read AGENTS.md/CONTRIBUTING.md and current issue journal; inspect latest main, related branches and full PR patches. Record which exact fixes are merged, open, withdrawn or owned. For reuse targets, preserve every original issue requirement above and resolve overlapping deliveries with the existing owner. Output: refreshed source map, exact interface owner and nonoverlapping task assignment. Positive check: every path/function and current production caller exists as stated. Negative check: no test-only seam, historical PASS or unmerged PR is called current. Done when this map and claim are read back from GitHub. Handoff: core owner for T02. If accepted API/scope is missing, mark only the affected task BLOCKED and preserve independent read-only work.

### T02: Reproduce and freeze the boundary

Owner: core reviewer, depends T01. Inputs: current source and requirements. Add deterministic barriers immediately after preimage/postimage reads and before leaf replacement; external writes or symlink replacement must survive untouched. Add subprocess crash fixtures before/after each journal publish and every file mutation; reopen and reconcile every file. Assert a second recovery is idempotent and reports persisted dispositions. Preserve the existing unsupported resource-operation and revoked-root tests. Use owned temporary roots/fixtures and explicit barriers; do not alter the working user's data. Inspect the exact API, error taxonomy and versioning owner before proposing changes. Output: a failing focused product regression or a precise unavailable-acceptance gate, plus accepted input/output contracts and current behavior evidence. Positive/negative tests: the named baseline behavior and counterexample must both be asserted. Recovery/cancel: add the deterministic failure points named in VALIDATION. Done when the test fails for the stated cause or a missing proof is explicitly recorded without fabricating a runtime failure. Handoff: T03 implementing owner.

### T03: Repair the core contract and lifecycle

Owner: one host/domain implementer, depends T02 and named upstream proof/API decisions. Inputs: the accepted contract and failing regression. Update only code-intelligence rename paths and necessary file-access/shared-lock interfaces. Use existing conditional file primitives rather than inventing atomic multi-file behavior. Strictly parse versioned journals; retain old readable journals behind explicit migration/read compatibility. Do not mark unresolved conflict journals as fully resolved; persist retry-safe recovery receipts. Edit only the verified owning files in REPO_MAP and necessary versioned interfaces; any additional path must be discovered and recorded, not guessed. Output: minimal reviewed implementation with persistent identity/recovery semantics and a green focused regression. Positive check: intended current path works. Negative check: denied/stale inputs have zero unauthorized effects. Recovery/cancel check: durable state stays truthful under the exact failure barriers. Done when the branch records commit SHA, changed paths, test outputs and unresolved platform gates. Handoff: T04 surface/adapter owner after interface commit and ACK.

### T04: Connect the real caller and supported UI

Owner: adapter/UI implementer, depends T03. Inputs: accepted service interface, current supported app surface and source-bound fixtures. Current shared Changes review must show every target and before/after hunk before one exact approval. Render the authoritative per-file Applied/Restored/Unchanged/Conflict result and explicit recovery action. Do not resurrect dedicated Code Review. Read-only journal review must remain available when rename admission is disabled. Trace the real start-to-result path and attach owner/revision to every request and response. Do not claim a fixture-only component or a mounted but empty reader is a production integration. Output: working supported entry point and visible blocked/error/recovery states. Positive check: user action reaches exactly one owned operation. Negative check: missing proof, changed context or stale response cannot display success or dispatch. Recovery/cancel check: reload/stop/switch-owner retains authoritative history and does not retry uncertain mutations. Done when a browser trace and exact request/response assertions cover the real caller. Handoff: T05 verifier. If this plan has no UI change, verify the existing affected caller and state instead of introducing a new screen.

### T05: Execute requirement acceptance at the proper level

Owner: independent verifier, depends T04 and the exact approved toolchain/platform. Inputs: pinned implementation head, complete requirement matrix, owned fixtures and approved native inputs. Run the focused commands in VALIDATION, then the specific supported App and native cases. Do not install missing prerequisites or substitute the provisioned wrong pnpm version. Output: source-pinned results with expected/actual outcomes, counts, logs, environment identity and explicit NOT_RUN gates. Positive/negative/recovery/cancel outcomes are all required. Preserve earlier failing attempts and do not call synthetic adapter or guard stubs native proof. Done when every owned matrix row is passed or precisely held with owner and next executable step. Handoff: T06 integration owner, with actionable defects returned to T03/T04.

### T06: Review, evidence and release

Owner: integration owner, depends T05. Inputs: reviewed exact head, test evidence and latest upstream PR state. Rebase only after agreed owner coordination; rerun affected checks after any source change. Update the current qualification record with source identity, actual adapter/backend version, test scope, unavailable phases and independent review outcome. A documentation change follows #1972 ownership. Preserve rollback/recovery records and prepare the focused PR under existing review rules. Positive check: all accepted requirements have evidence. Negative check: no pending CI, mock PASS, historical artifact or unpublished local file is presented as complete. Done when review/CI and actual-on-main acceptance are separately recorded. Final checkpoint releases OWNER=NONE, clears only own assignment/labels and gives the next operator exact source and remaining gates. Publication or merge alone does not close unmet acceptance.

## VALIDATION

### Reproducible setup and planned commands

Run from the repository root with Node meeting package.json (audited runtime 24.22.3) and the pinned pnpm 10.30.3 plus already provisioned locked dependencies. Current audit has pnpm 11.25.0 and no node_modules; offline Corepack cannot supply the pin. Product suites are NOT_RUN/HOLD_TOOLCHAIN. Obtain an approved provisioned environment through the owner; do not download or rewrite the lockfile. Browser fixtures require the already provisioned browser. Real Windows/native proof uses the exact approved backend/profile, not Linux guard stubs.

```sh
pnpm exec vitest run tests/rename-recovery-v3.test.ts tests/lsp-revisions-v3.test.ts --maxWorkers=1
pnpm exec playwright test --config tests/e2e/workspace-host.playwright.config.ts
pnpm typecheck
pnpm exec vitest run tests/public-source.test.ts --maxWorkers=1
pnpm check:docs-links
```

Existing commands above must exist at the refreshed head; proposed PR-only paths are explicitly identified in this plan and run only after their reviewed introduction. New tests added by T02 are registered in scripts/public-source-files.json and named in the implementation checkpoint. A route-mocked browser proves rendering/request behavior only; the same user flow must be repeated through the current actual app for the integration gate. Native process/filesystem tests record exact platform, executable/profile identity and pre/post state.

### Fixtures and expected behavior

Positive: approved two-file rename yields exact bytes, durable verified dispositions, and no unexpected targets. Negative: preimage/version/root changes, resource operations, duplicate/conflicting edits and path races refuse without overwriting. Recovery: crash at every file boundary, torn journal and missing/corrupt backup produce explicit safe per-path outcomes; a matching owned postimage can recover once. Cancel: cancellation after first file retains both journal and backup; external edits during recovery remain intact.

For all cases, record the input owner/source/revision, expected effect count, actual state/bytes, log or trace path and final outcome. Retry tests must prove at-most-once user/effect semantics rather than merely returning a success response. Screenshots use synthetic data and include unavailable/stale/partial states where the plan owns UI. Keyboard and focus tests verify the existing shared surface at narrow width and reduced motion.

### Acceptance mapping

| Original requirement | Tasks | Acceptance |
|---|---|---|
| M07-C03 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M07-S08 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M07-S09 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M07-U03 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M07-T02 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M07-T04 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M07-G01 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M07-G02 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M07-G03 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |

### Executed versus pending

This audit executed source reads, repository-wide caller searches and GitHub issue/PR inspections. It did not run product tests, enable features, exercise a live provider, or mutate repository files. The only executed behavioral fixture for M08-01/M08-02 is the dependency-free owned Git/source-predicate reproduction reproduced below; all other runtime acceptance remains NOT_RUN. Historical test results remain attributed to their original PR/base. Rename remains disabled until real guarded path-race and process-kill evidence plus supported UI confirmation/recovery pass. Stubbed path guards prove only protocol behavior.

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

T01–T06 are NOT_STARTED for implementation. Audit drafts are ready for coordinator duplicate/quality review. Existing issue/PR owners and their release checkpoints remain authoritative; do not infer release from silence. Risks: current main can move, pending fixes overlap, APIs may be intentionally unavailable, and mocks cannot prove confinement. Exact next action: root validates this full plan and its duplicate target; the future implementation owner then reads the whole issue/journal, claims the smallest scope, refreshes current source/PR state and executes T01. Rename remains disabled until real guarded path-race and process-kill evidence plus supported UI confirmation/recovery pass. Stubbed path guards prove only protocol behavior.

## REFERENCES

- [Pinned source tree](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b); [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md); [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md).
- [Canonical audit #1992](https://github.com/skytuhua-org/Gen-V1/issues/1992); [audit checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/1992#issuecomment-7121928309).
- Original supplied v6: M07 archive lines 1092–1130, M08 1131–1172, M09 1173–1214; global rules 1–132. Relevant substantive clauses are reproduced in REQUIREMENTS so execution does not depend on private chat.
- Supplied completion followups: common lines 1397–1413 and M07 lines 1462–1469; relevant steps are reproduced above. Global policy: compare base/current source, retain facts, execute only explicit accepted gaps, record precise HOLD inputs, keep unrun phases unrun.
- Supplied research-v3: sections 19–26 and feature rationale M07 F13/F14/F59; M08 F20/F21/F22/F23/F24/F45; M09 F32–F39. These motivate exact edit provenance, independent worktree authority, reversible file recovery, native acknowledgment and evidence-bound progress; they do not override v6 or mandate copying donor implementations.
- Merged source history: [M07 PR335](https://github.com/skytuhua-org/Gen-V1/pull/335), [accepted retirement PR394](https://github.com/skytuhua-org/Gen-V1/pull/394), [M08 PR331](https://github.com/skytuhua-org/Gen-V1/pull/331), [frontend PR336](https://github.com/skytuhua-org/Gen-V1/pull/336), [M09 PR350](https://github.com/skytuhua-org/Gen-V1/pull/350). M07 old dedicated review surface is intentionally retired; acceptance is through a supported current surface only.
