[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1953.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`, concurrent-journal reconciliation on 2026-11-24. Source audit baseline `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`; later publication/source references remain attributed to their own pinned revisions. Canonical issue: [#1953](https://github.com/skytuhua-org/Gen-V1/issues/1953). This status supplement supersedes older progress statements only. The entire current canonical plan below, including all accepted requirements and gates, is preserved in full; trailing blank lines are normalized.

The full expanded `original-plan-audit-r1` restore plan published under #1992 is preserved below with all substantive content intact and only trailing blank lines normalized, including exact approval, selected-path writer pause, unsaved-editor disposition, complete pre-restore backup, per-path durable outcomes, interruption recovery and the full repository/native/App acceptance gates. [Publication receipt 7122207647](https://github.com/skytuhua-org/Gen-V1/issues/1953#issuecomment-7122207647) releases only plan publication. Its prior attachment/toolchain limits are historical to that session; this cleanup supplies the versioned identical Markdown mirror.

#1987 is the actual restore root/claim/reconciliation repair; #1985 is separate regression coverage. Both remain open. Preserve both scopes and compare their different sequential-plan, simultaneous-apply, identity and recovery cases before choosing an integration. Guard-backed restore, real Browser-to-Changes acceptance, writer/unsaved-state coordination and every expanded requirement remain open until evidenced. No third implementation or ownership reassignment is introduced by this status update.

### Refreshed implementation references

- [PR #1985](https://github.com/skytuhua-org/Gen-V1/pull/1985): open; head `8216dc92cba08fbc701ffdcc4e5db34ba58cc404`; not merged.
- [PR #1987](https://github.com/skytuhua-org/Gen-V1/pull/1987): open; head `a66f0bc34fc902ed46c82731bfe2ec85a6934a38`; not merged.

Latest journal read: [7122207647](https://github.com/skytuhua-org/Gen-V1/issues/1953#issuecomment-7122207647). Earlier claims, failed attempts, results and releases remain in the append-only journal.

---

# Plan: Complete checkpoint restore recovery and writer coordination acceptance

## META

| Field | Value |
|---|---|
| Audit finding | M08-03 |
| Repository | skytuhua-org/Gen-V1 |
| Canonical target | Reuse [#1953](https://github.com/skytuhua-org/Gen-V1/issues/1953) |
| Parent review | [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992), T07–T09 |
| Plan revision/date | original-plan-audit-r1, 2026-11-24 UTC |
| Verified baseline | main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b |
| Status | Planning only. Retained implementation exists; the specific gaps below are not verified complete. No code, tests, configuration, branches or PRs changed by this audit. |
| Source precedence | User v6 ledger is authoritative; completion appendix supplies follow-up sequence; research v3 supplies rationale only. Exact relevant original clauses are reproduced below. |
| Ownership | Audit owner codex-cloud-m0709-b197ad releases to codex-cloud-ca7d38 for publication. Existing implementation/review owners retain custody. Future implementing owner must claim this focused scope before editing. |

## OBJECTIVE

The current main plan stores only aggregate conflicts. PREVIEW claiming can silently fail while apply continues; a killed APPLYING has no reconcile path. Current restore does create a pre-restore checkpoint and uses conditional replace for each write, but does not stop/pause writers or resolve unsaved editor state. The browser generates an approval identifier and the route compares that identifier; it does not consume a stored exact M02 approval. Result UI synthesizes restored paths only for APPLIED and cannot report authoritative per-path partial outcomes. PR1987 proposes root pin, atomic claim, reconcile and per-path results; PR1985 tests different sequential-plan/scope cases. Neither is merged at audited main.

Deliver complete checkpoint restore recovery and writer coordination acceptance through the retained implementation. Success means the exact original requirements mapped below are observable from the supported host path, the named failure cases have deterministic regression evidence, and unsupported capabilities remain unavailable. Contract definitions, test-only injection and historical merged PRs are evidence of retained work, not current live acceptance.

## REQUIREMENTS

### Authoritative original requirements for this focused gap

**M08-C03.** RestorePlanV1: checkpointId, scope, currentRevision, selectedPaths[], beforeDigests[], targetDigests[], preRestoreCheckpointId, approvalId and state PREVIEW|APPLYING|APPLIED|CONFLICT|PARTIAL_RECOVERY_REQUIRED. Conversation rewind and external-action reversal are not part of this file restore.

**M08-S09.** Implement the read-only checkpoint provider behind the existing frozen adapter, preserving its owner/revision/cursor validation. Add the restore command protocol separately rather than silently widening a read interface. Wire provider availability into the existing screen only when the backend is ready.

**M08-S10.** Create checkpoints at confirmed edit boundaries and explicitly user-requested save points. Before restore, stop or safely pause owners that can write the selected paths and resolve unsaved editor state. Create a pre-restore checkpoint and an exact path/diff approval. Excluded files and shell-only changes are visibly outside coverage.

**M08-S11.** Apply restore with per-file preimage checks, durable journal and postimage verification. A racing writer creates CONFLICT. Recovery only rolls back bytes still matching this operation's written image; otherwise preserve both versions and show PARTIAL_RECOVERY_REQUIRED. Do not modify Git refs, ignored files or remote systems as a side effect of file restore.

**M08-U01.** Use existing Current, Recorded and History checkpoint tabs. Show coverage count, excluded files, source cut and retention availability. Restore opens a side-by-side exact diff and requires selected paths plus confirmation; it never shares a button with conversation rewind.

**M08-T03.** Checkpoint provider responds only for the matching scope/cursor. Missing, expired or excluded blobs cannot be restored.

**M08-T04.** Restore with unsaved edits, modified current file, cancellation after first write, process kill and external edit during rollback yields explicit safe per-path outcomes.

**M08-G01.** Checkpoint read/history and provenance can pass without write-capable delegates. Restore, selective commit and child execution require exact approval and real path/race tests. No cross-filesystem or cross-repository atomicity claim is allowed.

**M08-G02.** Host-owned flags: workspace.provenanceV1, workspace.checkpointsV1, workspace.restoreV1, workspace.writeDelegateV1. Register only these keys in the shared finite registry; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M08-G03.** Rollback: Disable new mutation commands while preserving journals, retained worktrees and checkpoint blobs. Never delete a pre-restore backup while recovery is unresolved. Existing code review remains usable in read-only mode.

### Scope and fixed boundaries

This is a repair or completion of the named gap, not a reimplementation of the milestone. Preserve the original main-thread/read-only paths, historical records and default-false host flag registry. Never place these flags in UI preferences or let an agent/plugin enable them. No dependency, language server, debugger, provider runtime or platform backend download is authorized. M12/M14 belong to other workers and receive no edits. Do not restore retired CodeReviewHost, Research QA or other removed workspaces. UI changes use supported current surfaces only after the explicit API/surface decisions named below.

The source document calls the original milestone MERGED / DO NOT REIMPLEMENT. Its historical instructions are a requirement ledger here, not blanket implementation authorization. Implement only the specific failing requirement shown in OBJECTIVE and DESIGN. A missing accepted API, exact owner or real backend proof blocks that dependent task with a named HOLD; it does not authorize inventing a parallel subsystem.

Compatibility requires old records to remain readable, versioned new metadata rather than changing frozen contracts silently, and explicit migrations when needed. Keep bounded UTF8 payloads, approved path access and existing account custody. Expose loading, unavailable, stale, conflict and partial states honestly. UI controls must have visible labels, keyboard access, focus recovery and an explanatory disabled reason; use current shared components and existing reduced-motion policy. Preserve source text and private data; no secrets in logs/screenshots.

### Follow-up instructions preserved from the supplied completion document

M08 | Managed workspaces, selective commits and checkpoints
START M08 COMPLETION FOLLOW-UP
Start from accepted main at #331 and inspect #336 and the current checkpoint evidence. Use existing workspace provisioning, change receipt, source ownership and checkpoint services. Research v3 §14.1 and §17 P1-1 specify private-index attribution and concurrent HEAD handling.
1. Run current Git/change attribution, file-checkpoints and checkpoint-restore tests. Use an owned scratch fixture with two agents, shared-file edits, untracked/binary paths and a changed HEAD. Select one owner’s allowed hunks only. Assert the other agent’s bytes and caller index are untouched and a moved HEAD refuses the commit.
2. Exercise the real Workspace Changes and checkpoint restore surfaces on the intended desktop/browser lanes. Restore the owned snapshot only under a current binding, preserving unsaved or newer edits through the existing conflict flow. Test deny/stale/missing states, cross-worktree identity and rollback recovery. Record full application results separately from component fixtures.
3. Verify real environment provisioning and cleanup under the current M03 profile on supported platforms. Preserve base-source and dependency receipts, including current M06 proof where consumed. Never clean a developer’s working copy or commit unrelated staging.
4. Without the required native Windows/worktree proof, record HOLD_WORKSPACE_PLATFORM and keep the affected acceptance lane open. Record independent review under the repository’s existing process.
END M08 COMPLETION FOLLOW-UP

Only the clauses owned by this plan are implemented here; related requirements in the same follow-up remain dependencies with their separate owners.

### Existing canonical issue retained verbatim

The following existing issue text is preserved in full as the prior accepted scope. Its earlier task labels remain historical; T01 below reconciles them against the new T01–T06 sequence without discarding any original case. This expansion does not transfer ownership or declare pending PRs merged.

[Versioned Markdown plan](https://github.com/skytuhua-org/Gen-V1/blob/dad473f59b4c46dad12cf0357e448e090a403a2b/docs/agent-plans/nov-2026-audit-checkpoint-restore.md) · [Plan publication PR](https://github.com/skytuhua-org/Gen-V1/pull/1952)

<!-- gen-v1-audit-r1-r2:checkpoint-restore -->
# Preserve pre-restore data and recover interrupted checkpoint restores

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
A restore can leave workspace edits without a complete undo or a usable recovery receipt. Preserve the live state before changing files and reconcile reported outcomes with disk.

## REQUIREMENTS
- Report scope: 14/B1–B2, B8–B12, B14–B16; 02 B5; 07 §13.3.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- Workspace checkpoint and restore code under `packages/workspace`, its store and host routes, and existing M08 restore fixture. Compare #578 (timing only) and #1860 (adjacent workspace work).
- Cases to track: incomplete preimage B1; interrupted APPLYING B2; temp cleanup B8; per-path PARTIAL and absence B9; double-apply B11; scope changes B12; persisted identity B14; size order and case normalization B15–B16. Delegate boundary-sensitive items through SECURITY.md.

## DESIGN
Define a durable restore state machine and receipt per path. Before first write, validate canonical plan and recoverable preimage. Fence ownership and reconcile after interruption. Preserve the old reader and require explicit disposition when undo cannot be guaranteed.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** From a disposable workspace reconcile the capture inventory with real paths. Add supported fixtures for a missing preimage, two simultaneous restores, and cancellation after one recorded write. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Verify both restored content and original bytes, recovery after host restart, truthful changed/unchanged/failed status, and at most one writer per plan. Exercise the real Browser → Changes → restore entry point using a fixture workspace. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Verify both restored content and original bytes, recovery after host restart, truthful changed/unchanged/failed status, and at most one writer per plan. Exercise the real Browser → Changes → restore entry point using a fixture workspace.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

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
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).


## REPO_MAP

All links below are pinned to the audited source. A listed helper is not claimed to have a production caller unless explicitly stated. T01 refreshes these paths against the latest accepted main and active PRs before implementation.

| File | Verified function, component or evidence |
|---|---|
| [packages/workspace/checkpoints.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/workspace/checkpoints.ts) | planRestore, applyRestore, writeRestored |
| [apps/server/workspace-routes.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/workspace-routes.ts) | checkpoint restore plan/apply |
| [apps/web/src/FileCheckpoints.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/FileCheckpoints.tsx) | CheckpointFiles, RestoreResult |
| [apps/web/src/file-checkpoint-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/file-checkpoint-api.ts) | restore plan/result validation |
| [tests/checkpoint-restore-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/checkpoint-restore-v3.test.ts) | restore/preimage/kill tests |
| [tests/e2e/file-checkpoints.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/e2e/file-checkpoints.spec.ts) | fixture UI |

Historical bundle evidence: [M08-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M08-verification.json). It belongs to the historical base recorded inside that document. It is not current main proof. M07 records live LSP/DAP and worker feed gates open; M08/M09 record pending independent review and platform/integration gates. Current [progress ledger](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/progress.md) does not establish these milestones complete.

Dependencies and adjacent owners:

- #1953 canonical existing issue; prior workers released to review
- #1954 trusted backup blobs
- M02 exact approval
- current editor owner and workspace writer coordinator
- #1344/PR1499/PR1500 pending manual-editor save/checkpoint boundary and unsaved-state owner; not on baseline main.

## DESIGN

Reuse #1953 and review both pending PRs instead of a third implementation. Keep all original issue requirements. First reconcile the exact overlapping diffs, then bind restore to the current root identity, selected paths, reviewed source cut and before/target digests. Quiesce only writers that can affect selected paths and obtain explicit unsaved-editor disposition. A complete pre-restore snapshot is a prerequisite to effects. Consume exact approval under the mutation fence. Persist per-path intent and verified outcome; restart reconciliation must not write or report all-success from aggregate flags. UI reads those durable receipts and gives recoverable conflict/partial states.

### Concrete implementation and integration boundary

Review PR1987@a66f0bc34fc902ed46c82731bfe2ec85a6934a38 and PR1985@8216dc92cba08fbc701ffdcc4e5db34ba58cc404 with #1953 owner. Adopt only reviewed changes once merged or explicitly transferred. Add missing writer/unsaved-state coordination and exact approval integration in current workspace service. Ensure complete durable backup coverage and journal/results compatibility; preserve old plans through explicit reconciliation.

Update frozen read adapter separately from versioned restore protocol. Expose authoritative per-path applied/rolled-back/conflict/uncertain results, pre-restore checkpoint link and explicit reconciliation action in Current/Recorded/History. Never tell a partial user that nothing changed. Existing read-only history remains usable with mutations disabled.

### Failure, persistence, migration and rollback

Validate owner/source/epoch/revision immediately before authority-bearing effects and again when accepting asynchronous results. Preserve uncertain outcomes as explicit unknown/conflict/partial states; retry only after authoritative reconciliation. Writes must be either idempotently replayable from their durable receipt or require a new exact preview/approval. A UI acknowledgment is not an effect receipt. Missing proof remains unavailable, with the successful read-only path preserved.

New records require an explicit schema version, compatibility test against the retained format, and an owner-approved migration plan before T03. Rollback disables new admission at the existing host flag/capability boundary, retains all receipts, journals, blobs and dirty workspaces, and closes only confirmed-owned resources. It never rewrites user bytes or replays an unresolved input automatically. Do not remove historical evidence; label its source and acceptance limit.

## EXECUTION_DAG

Tasks are sequential unless T01 records a narrower nonoverlapping file allocation. Each handoff requires an issue checkpoint and receiver ACK. No task may take another worker's claimed implementation files.

### T01: Refresh custody and baseline

Owner: integration reviewer. Dependencies: complete canonical issue, this full plan, all comments and active related PRs. Inputs: pinned baseline and REPO_MAP. Read AGENTS.md/CONTRIBUTING.md and current issue journal; inspect latest main, related branches and full PR patches. Record which exact fixes are merged, open, withdrawn or owned. For reuse targets, preserve every original issue requirement above and resolve overlapping deliveries with the existing owner. Output: refreshed source map, exact interface owner and nonoverlapping task assignment. Positive check: every path/function and current production caller exists as stated. Negative check: no test-only seam, historical PASS or unmerged PR is called current. Done when this map and claim are read back from GitHub. Handoff: core owner for T02. If accepted API/scope is missing, mark only the affected task BLOCKED and preserve independent read-only work.

### T02: Reproduce and freeze the boundary

Owner: core reviewer, depends T01. Inputs: current source and requirements. Distinguish two simultaneous apply calls for the same plan from two different sequential plans. Kill after each file write before outcome persistence, restart and read reconcile. Preserve missing-file absence, external editor bytes, binary/oversize preimages and stale root identity. Exercise an unsaved supported editor and a live writer; restore must not proceed without safe disposition. Test approval replay with changed paths/digests. Use owned temporary roots/fixtures and explicit barriers; do not alter the working user's data. Inspect the exact API, error taxonomy and versioning owner before proposing changes. Output: a failing focused product regression or a precise unavailable-acceptance gate, plus accepted input/output contracts and current behavior evidence. Positive/negative tests: the named baseline behavior and counterexample must both be asserted. Recovery/cancel: add the deterministic failure points named in VALIDATION. Done when the test fails for the stated cause or a missing proof is explicitly recorded without fabricating a runtime failure. Handoff: T03 implementing owner.

### T03: Repair the core contract and lifecycle

Owner: one host/domain implementer, depends T02 and named upstream proof/API decisions. Inputs: the accepted contract and failing regression. Review PR1987@a66f0bc34fc902ed46c82731bfe2ec85a6934a38 and PR1985@8216dc92cba08fbc701ffdcc4e5db34ba58cc404 with #1953 owner. Adopt only reviewed changes once merged or explicitly transferred. Add missing writer/unsaved-state coordination and exact approval integration in current workspace service. Ensure complete durable backup coverage and journal/results compatibility; preserve old plans through explicit reconciliation. Edit only the verified owning files in REPO_MAP and necessary versioned interfaces; any additional path must be discovered and recorded, not guessed. Output: minimal reviewed implementation with persistent identity/recovery semantics and a green focused regression. Positive check: intended current path works. Negative check: denied/stale inputs have zero unauthorized effects. Recovery/cancel check: durable state stays truthful under the exact failure barriers. Done when the branch records commit SHA, changed paths, test outputs and unresolved platform gates. Handoff: T04 surface/adapter owner after interface commit and ACK.

### T04: Connect the real caller and supported UI

Owner: adapter/UI implementer, depends T03. Inputs: accepted service interface, current supported app surface and source-bound fixtures. Update frozen read adapter separately from versioned restore protocol. Expose authoritative per-path applied/rolled-back/conflict/uncertain results, pre-restore checkpoint link and explicit reconciliation action in Current/Recorded/History. Never tell a partial user that nothing changed. Existing read-only history remains usable with mutations disabled. Trace the real start-to-result path and attach owner/revision to every request and response. Do not claim a fixture-only component or a mounted but empty reader is a production integration. Output: working supported entry point and visible blocked/error/recovery states. Positive check: user action reaches exactly one owned operation. Negative check: missing proof, changed context or stale response cannot display success or dispatch. Recovery/cancel check: reload/stop/switch-owner retains authoritative history and does not retry uncertain mutations. Done when a browser trace and exact request/response assertions cover the real caller. Handoff: T05 verifier. If this plan has no UI change, verify the existing affected caller and state instead of introducing a new screen.

### T05: Execute requirement acceptance at the proper level

Owner: independent verifier, depends T04 and the exact approved toolchain/platform. Inputs: pinned implementation head, complete requirement matrix, owned fixtures and approved native inputs. Run the focused commands in VALIDATION, then the specific supported App and native cases. Do not install missing prerequisites or substitute the provisioned wrong pnpm version. Output: source-pinned results with expected/actual outcomes, counts, logs, environment identity and explicit NOT_RUN gates. Positive/negative/recovery/cancel outcomes are all required. Preserve earlier failing attempts and do not call synthetic adapter or guard stubs native proof. Done when every owned matrix row is passed or precisely held with owner and next executable step. Handoff: T06 integration owner, with actionable defects returned to T03/T04.

### T06: Review, evidence and release

Owner: integration owner, depends T05. Inputs: reviewed exact head, test evidence and latest upstream PR state. Rebase only after agreed owner coordination; rerun affected checks after any source change. Update the current qualification record with source identity, actual adapter/backend version, test scope, unavailable phases and independent review outcome. A documentation change follows #1972 ownership. Preserve rollback/recovery records and prepare the focused PR under existing review rules. Positive check: all accepted requirements have evidence. Negative check: no pending CI, mock PASS, historical artifact or unpublished local file is presented as complete. Done when review/CI and actual-on-main acceptance are separately recorded. Final checkpoint releases OWNER=NONE, clears only own assignment/labels and gives the next operator exact source and remaining gates. Publication or merge alone does not close unmet acceptance.

## VALIDATION

### Reproducible setup and planned commands

Run from the repository root with Node meeting package.json (audited runtime 24.22.3) and the pinned pnpm 10.30.3 plus already provisioned locked dependencies. Current audit has pnpm 11.25.0 and no node_modules; offline Corepack cannot supply the pin. Product suites are NOT_RUN/HOLD_TOOLCHAIN. Obtain an approved provisioned environment through the owner; do not download or rewrite the lockfile. Browser fixtures require the already provisioned browser. Real Windows/native proof uses the exact approved backend/profile, not Linux guard stubs.

```sh
pnpm exec vitest run tests/checkpoint-restore-v3.test.ts tests/file-checkpoints.test.ts --maxWorkers=1
pnpm exec playwright test --config tests/e2e/file-checkpoints.playwright.config.ts
pnpm exec playwright test --config tests/e2e/workspace-host.playwright.config.ts
pnpm typecheck
pnpm exec vitest run tests/public-source.test.ts --maxWorkers=1
pnpm check:docs-links
```

Existing commands above must exist at the refreshed head; proposed PR-only paths are explicitly identified in this plan and run only after their reviewed introduction. New tests added by T02 are registered in scripts/public-source-files.json and named in the implementation checkpoint. A route-mocked browser proves rendering/request behavior only; the same user flow must be repeated through the current actual app for the integration gate. Native process/filesystem tests record exact platform, executable/profile identity and pre/post state.

### Fixtures and expected behavior

Positive: selected exact paths restore after confirmed writer pause and complete backup. Negative: wrong owner/root/revision/approval, missing/expired/excluded bytes, unsaved edits and duplicate same-plan claim yield zero inappropriate writes. Recovery: process kill at every boundary, lost response, external edit during rollback and orphan temps leave precise durable outcomes and backups. Cancel: after first write preserves safe rollback or explicit partial outcomes, with no Git refs or remote effects.

For all cases, record the input owner/source/revision, expected effect count, actual state/bytes, log or trace path and final outcome. Retry tests must prove at-most-once user/effect semantics rather than merely returning a success response. Screenshots use synthetic data and include unavailable/stale/partial states where the plan owns UI. Keyboard and focus tests verify the existing shared surface at narrow width and reduced motion.

### Acceptance mapping

| Original requirement | Tasks | Acceptance |
|---|---|---|
| M08-C03 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-S09 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-S10 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-S11 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-U01 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-T03 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-T04 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-G01 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-G02 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-G03 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |

### Executed versus pending

This audit executed source reads, repository-wide caller searches and GitHub issue/PR inspections. It did not run product tests, enable features, exercise a live provider, or mutate repository files. The only executed behavioral fixture for M08-01/M08-02 is the dependency-free owned Git/source-predicate reproduction reproduced below; all other runtime acceptance remains NOT_RUN. Historical test results remain attributed to their original PR/base. Reuse #1953. Current pending PR tests are protocol/stub evidence, not real guarded restore or Browser → Changes acceptance. Keep issue open until original and expanded per-clause matrix is met.

## STATE

Researched: all relevant supplied v6 and completion clauses, research context, pinned source and adjacent issue scopes. Decided: preserve retained implementations, frozen interfaces, current supported surfaces, exact authority and independent gates; each concrete design above is a proposed repair of the named requirement, not a new activation decision. Implemented by this audit: no product code or tests. Verified: source existence/caller absence and the explicitly stated owned Git primitive fixture only. Runtime, browser, Windows/native, installed/live and independent acceptance: NOT_RUN unless separately recorded by a future owner at the exact head.

T01–T06 are NOT_STARTED for implementation. Audit drafts are ready for coordinator duplicate/quality review. Existing issue/PR owners and their release checkpoints remain authoritative; do not infer release from silence. Risks: current main can move, pending fixes overlap, APIs may be intentionally unavailable, and mocks cannot prove confinement. Exact next action: root validates this full plan and its duplicate target; the future implementation owner then reads the whole issue/journal, claims the smallest scope, refreshes current source/PR state and executes T01. Reuse #1953. Current pending PR tests are protocol/stub evidence, not real guarded restore or Browser → Changes acceptance. Keep issue open until original and expanded per-clause matrix is met.

## REFERENCES

- [Pinned source tree](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b); [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md); [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md).
- [Canonical audit #1992](https://github.com/skytuhua-org/Gen-V1/issues/1992); [audit checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/1992#issuecomment-7121928309).
- Original supplied v6: M07 archive lines 1092–1130, M08 1131–1172, M09 1173–1214; global rules 1–132. Relevant substantive clauses are reproduced in REQUIREMENTS so execution does not depend on private chat.
- Supplied completion followups: common lines 1397–1413 and M08 lines 1470–1477; relevant steps are reproduced above. Global policy: compare base/current source, retain facts, execute only explicit accepted gaps, record precise HOLD inputs, keep unrun phases unrun.
- Supplied research-v3: sections 19–26 and feature rationale M07 F13/F14/F59; M08 F20/F21/F22/F23/F24/F45; M09 F32–F39. These motivate exact edit provenance, independent worktree authority, reversible file recovery, native acknowledgment and evidence-bound progress; they do not override v6 or mandate copying donor implementations.
- Merged source history: [M07 PR335](https://github.com/skytuhua-org/Gen-V1/pull/335), [accepted retirement PR394](https://github.com/skytuhua-org/Gen-V1/pull/394), [M08 PR331](https://github.com/skytuhua-org/Gen-V1/pull/331), [frontend PR336](https://github.com/skytuhua-org/Gen-V1/pull/336), [M09 PR350](https://github.com/skytuhua-org/Gen-V1/pull/350). M07 old dedicated review surface is intentionally retired; acceptance is through a supported current surface only.


## PRESERVED PRIOR CANONICAL BODY AT PUBLICATION

The following prior body is retained verbatim as historical scope. The new focused plan above adds the mapped acceptance work and preserves every existing implementation claim.

[Versioned Markdown plan](https://github.com/skytuhua-org/Gen-V1/blob/dad473f59b4c46dad12cf0357e448e090a403a2b/docs/agent-plans/nov-2026-audit-checkpoint-restore.md) · [Plan publication PR](https://github.com/skytuhua-org/Gen-V1/pull/1952)

<!-- gen-v1-audit-r1-r2:checkpoint-restore -->
# Preserve pre-restore data and recover interrupted checkpoint restores

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
A restore can leave workspace edits without a complete undo or a usable recovery receipt. Preserve the live state before changing files and reconcile reported outcomes with disk.

## REQUIREMENTS
- Report scope: 14/B1–B2, B8–B12, B14–B16; 02 B5; 07 §13.3.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- Workspace checkpoint and restore code under `packages/workspace`, its store and host routes, and existing M08 restore fixture. Compare #578 (timing only) and #1860 (adjacent workspace work).
- Cases to track: incomplete preimage B1; interrupted APPLYING B2; temp cleanup B8; per-path PARTIAL and absence B9; double-apply B11; scope changes B12; persisted identity B14; size order and case normalization B15–B16. Delegate boundary-sensitive items through SECURITY.md.

## DESIGN
Define a durable restore state machine and receipt per path. Before first write, validate canonical plan and recoverable preimage. Fence ownership and reconcile after interruption. Preserve the old reader and require explicit disposition when undo cannot be guaranteed.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** From a disposable workspace reconcile the capture inventory with real paths. Add supported fixtures for a missing preimage, two simultaneous restores, and cancellation after one recorded write. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Verify both restored content and original bytes, recovery after host restart, truthful changed/unchanged/failed status, and at most one writer per plan. Exercise the real Browser → Changes → restore entry point using a fixture workspace. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Verify both restored content and original bytes, recovery after host restart, truthful changed/unchanged/failed status, and at most one writer per plan. Exercise the real Browser → Changes → restore entry point using a fixture workspace.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).
