[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1954.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`, concurrent-journal reconciliation on 2026-11-24. Source audit baseline `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`; later publication/source references remain attributed to their own pinned revisions. Canonical issue: [#1954](https://github.com/skytuhua-org/Gen-V1/issues/1954). This status supplement supersedes older progress statements only. The entire current canonical plan below, including all accepted requirements and gates, is preserved in full; trailing blank lines are normalized.

The complete expanded `original-plan-audit-r1` blob-integrity plan published under #1992 is preserved below with all substantive content intact and only trailing blank lines normalized. [Publication receipt 7122262879](https://github.com/skytuhua-org/Gen-V1/issues/1954#issuecomment-7122262879) releases only the plan publisher. The new durability, corrupt/short/hardlinked-byte, concurrency, recovery-reference, GC, prior-format and native acceptance requirements remain binding. The earlier session's toolchain/attachment limits are attributed to that session; this cleanup supplies the versioned full Markdown mirror.

Two implementations remain open. GitHub claim creation order makes `devin-linux-00d798`'s [7121554462](https://github.com/skytuhua-org/Gen-V1/issues/1954#issuecomment-7121554462) earlier than `devin-cloud-582f6a`'s [7121677098](https://github.com/skytuhua-org/Gen-V1/issues/1954#issuecomment-7121677098); both recorded implementation releases. #1990 and #1986 have distinct retry/durability choices and are not proven equivalent. #1986 has advanced beyond the head quoted in the preserved plan; the refreshed head is listed below. Compare both exact patches, retain all accepted cases, and record the chosen reviewed integration. Native guard and actual-on-main acceptance remain pending.

### Refreshed implementation references

- [PR #1986](https://github.com/skytuhua-org/Gen-V1/pull/1986): open; head `14cef8c2503bb75491a7c2d359eb0bcd6f46c5fb`; not merged.
- [PR #1990](https://github.com/skytuhua-org/Gen-V1/pull/1990): open; head `2322cee598559ac21705732efc77cb87e5552ddc`; not merged.

Latest journal read: [7122262879](https://github.com/skytuhua-org/Gen-V1/issues/1954#issuecomment-7122262879). Earlier claims, failed attempts, results and releases remain in the append-only journal.

---

# Plan: Complete atomic checkpoint blob publication and integrity acceptance

## META

| Field | Value |
|---|---|
| Audit finding | M08-04 |
| Repository | skytuhua-org/Gen-V1 |
| Canonical target | Reuse [#1954](https://github.com/skytuhua-org/Gen-V1/issues/1954) |
| Parent review | [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992), T07–T09 |
| Plan revision/date | original-plan-audit-r1, 2026-11-24 UTC |
| Verified baseline | main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b |
| Status | Planning only. Retained implementation exists; the specific gaps below are not verified complete. No code, tests, configuration, branches or PRs changed by this audit. |
| Source precedence | User v6 ledger is authoritative; completion appendix supplies follow-up sequence; research v3 supplies rationale only. Exact relevant original clauses are reproduced below. |
| Ownership | Audit owner codex-cloud-m0709-b197ad releases to codex-cloud-ca7d38 for publication. Existing implementation/review owners retain custody. Future implementing owner must claim this focused scope before editing. |

## OBJECTIVE

writeBlob opens the content-addressed target and writes into it directly, so an interrupted write can leave a poisoned digest path. Existing bytes are verified on reuse but are not repaired, while readBlob returns bytes without hash verification. Open PR1990 and PR1986 overlap this exact scope. PR1990 notes a remove+rename repair gap; PR1986 claims atomic replacement and fsync. No reviewed-on-main result exists. Historical checkpoint tests do not prove crash-safe blob publish.

Deliver complete atomic checkpoint blob publication and integrity acceptance through the retained implementation. Success means the exact original requirements mapped below are observable from the supported host path, the named failure cases have deterministic regression evidence, and unsupported capabilities remain unavailable. Contract definitions, test-only injection and historical merged PRs are evidence of retained work, not current live acceptance.

## REQUIREMENTS

### Authoritative original requirements for this focused gap

**M08-C02.** CheckpointV1: id, scope matching the existing checkpoint adapter, sourceCut, createdAt, files[{path,identity,digest,blobRef}], exclusions[] and retention AVAILABLE|EXPIRED|MISSING. First version covers approved text/code files, at most 200 files, 8 MiB per file and 64 MiB per checkpoint. Secret/config exclusions remain explicit.

**M08-S01.** Reuse current project/worktree binding and private Git family checks. Map all writes to their true owner. Before/after blobs are captured only through approved file access; exclude secrets and mark oversized/binary data unsupported instead of storing it silently.

**M08-S11.** Apply restore with per-file preimage checks, durable journal and postimage verification. A racing writer creates CONFLICT. Recovery only rolls back bytes still matching this operation's written image; otherwise preserve both versions and show PARTIAL_RECOVERY_REQUIRED. Do not modify Git refs, ignored files or remote systems as a side effect of file restore.

**M08-S13.** Document retention and storage caps, garbage collecting only blobs not referenced by checkpoints, recovery journals or audit policy. Missing retained bytes must make Restore unavailable with a precise reason, not a partial silent restore.

**M08-T03.** Checkpoint provider responds only for the matching scope/cursor. Missing, expired or excluded blobs cannot be restored.

**M08-T04.** Restore with unsaved edits, modified current file, cancellation after first write, process kill and external edit during rollback yields explicit safe per-path outcomes.

**M08-G01.** Checkpoint read/history and provenance can pass without write-capable delegates. Restore, selective commit and child execution require exact approval and real path/race tests. No cross-filesystem or cross-repository atomicity claim is allowed.

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

[Versioned Markdown plan](https://github.com/skytuhua-org/Gen-V1/blob/dad473f59b4c46dad12cf0357e448e090a403a2b/docs/agent-plans/nov-2026-audit-checkpoint-store.md) · [Plan publication PR](https://github.com/skytuhua-org/Gen-V1/pull/1952)

<!-- gen-v1-audit-r1-r2:checkpoint-store -->
# Make checkpoint blob writes atomic and verify stored content before reuse

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
A partially written or corrupt checkpoint blob can make old snapshots unreadable and leave unreferenced files. Make blob publication atomic and report integrity failure accurately.

## REQUIREMENTS
- Report scope: 14/B3, B5–B7, B18; 13 §3.4; 15 filesystem growth.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- Checkpoint content-addressed store and index implementation under `packages/workspace`. Use the tracked source and tests on current main to find exact paths. Separate the restore state machine and retention policy from blob integrity.

## DESIGN
Publish complete blobs atomically and verify digest before trust. Reconcile recoverable and missing state consistently across readers. Account for intermediate files and existing references without deleting referenced data.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Interrupt a blob write in a temporary store, then attempt a read and a second capture of the same binary. Alter a synthetic copy and observe the reader result. Include a failed capture and a hardlinked fixture subject to repository policy. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Assert good concurrent reads, rejection of corrupted bytes, recovery on retry, no leaked temp file after clean failure, and compatibility with a prior-format checkpoint. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Assert good concurrent reads, rejection of corrupted bytes, recovery on retry, no leaked temp file after clean failure, and compatibility with a prior-format checkpoint.

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
| [packages/workspace/checkpoints.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/workspace/checkpoints.ts) | writeBlob, readBlob, collectGarbage |
| [tests/checkpoint-restore-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/checkpoint-restore-v3.test.ts) | capture/read/restore baseline |
| [tests/file-checkpoints.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/file-checkpoints.test.ts) | frozen adapter validation |

Historical bundle evidence: [M08-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M08-verification.json). It belongs to the historical base recorded inside that document. It is not current main proof. M07 records live LSP/DAP and worker feed gates open; M08/M09 record pending independent review and platform/integration gates. Current [progress ledger](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/progress.md) does not establish these milestones complete.

Dependencies and adjacent owners:

- #1954 canonical existing issue
- #1953 recovery reference retention
- M08-05 central retention policy

## DESIGN

Reuse #1954 and retain its entire canonical original requirements. Publish validated staged bytes atomically under a digest name with explicit file and directory durability policy for the supported platform. Readers verify digest and approved file custody before exposing content. Repair a corrupt prior-format name without exposing untrusted bytes; concurrent same-digest publishers converge safely. Missing/corrupt bytes demote restore availability with precise reason. GC must not remove live staging or references held by checkpoints, restore journals, edit receipts or audit retention.

### Concrete implementation and integration boundary

Compare PR1990@2322cee598559ac21705732efc77cb87e5552ddc and PR1986@c094d39f09b5c2c191c7e184bf25e3b331d16253 against refreshed main and existing #1954 owner. Select one reviewed implementation or reconcile scoped differences on that owner's branch; no new duplicate fix. Add missing cross-platform publish/read and concurrent staging GC regression after integration.

Keep the current frozen checkpoint read schema and separate restore availability. Ensure missing/corrupt bytes render a specific unavailable reason and cannot be selected; do not silently resurrect historical MISSING records unless an explicit compatibility policy is accepted. M08-05 owns broader coverage/retention UX.

### Failure, persistence, migration and rollback

Validate owner/source/epoch/revision immediately before authority-bearing effects and again when accepting asynchronous results. Preserve uncertain outcomes as explicit unknown/conflict/partial states; retry only after authoritative reconciliation. Writes must be either idempotently replayable from their durable receipt or require a new exact preview/approval. A UI acknowledgment is not an effect receipt. Missing proof remains unavailable, with the successful read-only path preserved.

New records require an explicit schema version, compatibility test against the retained format, and an owner-approved migration plan before T03. Rollback disables new admission at the existing host flag/capability boundary, retains all receipts, journals, blobs and dirty workspaces, and closes only confirmed-owned resources. It never rewrites user bytes or replays an unresolved input automatically. Do not remove historical evidence; label its source and acceptance limit.

## EXECUTION_DAG

Tasks are sequential unless T01 records a narrower nonoverlapping file allocation. Each handoff requires an issue checkpoint and receiver ACK. No task may take another worker's claimed implementation files.

### T01: Refresh custody and baseline

Owner: integration reviewer. Dependencies: complete canonical issue, this full plan, all comments and active related PRs. Inputs: pinned baseline and REPO_MAP. Read AGENTS.md/CONTRIBUTING.md and current issue journal; inspect latest main, related branches and full PR patches. Record which exact fixes are merged, open, withdrawn or owned. For reuse targets, preserve every original issue requirement above and resolve overlapping deliveries with the existing owner. Output: refreshed source map, exact interface owner and nonoverlapping task assignment. Positive check: every path/function and current production caller exists as stated. Negative check: no test-only seam, historical PASS or unmerged PR is called current. Done when this map and claim are read back from GitHub. Handoff: core owner for T02. If accepted API/scope is missing, mark only the affected task BLOCKED and preserve independent read-only work.

### T02: Reproduce and freeze the boundary

Owner: core reviewer, depends T01. Inputs: current source and requirements. Kill during staging and before/after publish, race two publishers and a reader, inject short bytes/wrong digest/hardlink and repeat identical capture. A currently missing checkpoint must never return a partial diff as trusted. Verify old valid on-disk format remains readable. Distinguish safe ENOENT visibility from corrupt-byte exposure and document any approved behavior. Use owned temporary roots/fixtures and explicit barriers; do not alter the working user's data. Inspect the exact API, error taxonomy and versioning owner before proposing changes. Output: a failing focused product regression or a precise unavailable-acceptance gate, plus accepted input/output contracts and current behavior evidence. Positive/negative tests: the named baseline behavior and counterexample must both be asserted. Recovery/cancel: add the deterministic failure points named in VALIDATION. Done when the test fails for the stated cause or a missing proof is explicitly recorded without fabricating a runtime failure. Handoff: T03 implementing owner.

### T03: Repair the core contract and lifecycle

Owner: one host/domain implementer, depends T02 and named upstream proof/API decisions. Inputs: the accepted contract and failing regression. Compare PR1990@2322cee598559ac21705732efc77cb87e5552ddc and PR1986@c094d39f09b5c2c191c7e184bf25e3b331d16253 against refreshed main and existing #1954 owner. Select one reviewed implementation or reconcile scoped differences on that owner's branch; no new duplicate fix. Add missing cross-platform publish/read and concurrent staging GC regression after integration. Edit only the verified owning files in REPO_MAP and necessary versioned interfaces; any additional path must be discovered and recorded, not guessed. Output: minimal reviewed implementation with persistent identity/recovery semantics and a green focused regression. Positive check: intended current path works. Negative check: denied/stale inputs have zero unauthorized effects. Recovery/cancel check: durable state stays truthful under the exact failure barriers. Done when the branch records commit SHA, changed paths, test outputs and unresolved platform gates. Handoff: T04 surface/adapter owner after interface commit and ACK.

### T04: Connect the real caller and supported UI

Owner: adapter/UI implementer, depends T03. Inputs: accepted service interface, current supported app surface and source-bound fixtures. Keep the current frozen checkpoint read schema and separate restore availability. Ensure missing/corrupt bytes render a specific unavailable reason and cannot be selected; do not silently resurrect historical MISSING records unless an explicit compatibility policy is accepted. M08-05 owns broader coverage/retention UX. Trace the real start-to-result path and attach owner/revision to every request and response. Do not claim a fixture-only component or a mounted but empty reader is a production integration. Output: working supported entry point and visible blocked/error/recovery states. Positive check: user action reaches exactly one owned operation. Negative check: missing proof, changed context or stale response cannot display success or dispatch. Recovery/cancel check: reload/stop/switch-owner retains authoritative history and does not retry uncertain mutations. Done when a browser trace and exact request/response assertions cover the real caller. Handoff: T05 verifier. If this plan has no UI change, verify the existing affected caller and state instead of introducing a new screen.

### T05: Execute requirement acceptance at the proper level

Owner: independent verifier, depends T04 and the exact approved toolchain/platform. Inputs: pinned implementation head, complete requirement matrix, owned fixtures and approved native inputs. Run the focused commands in VALIDATION, then the specific supported App and native cases. Do not install missing prerequisites or substitute the provisioned wrong pnpm version. Output: source-pinned results with expected/actual outcomes, counts, logs, environment identity and explicit NOT_RUN gates. Positive/negative/recovery/cancel outcomes are all required. Preserve earlier failing attempts and do not call synthetic adapter or guard stubs native proof. Done when every owned matrix row is passed or precisely held with owner and next executable step. Handoff: T06 integration owner, with actionable defects returned to T03/T04.

### T06: Review, evidence and release

Owner: integration owner, depends T05. Inputs: reviewed exact head, test evidence and latest upstream PR state. Rebase only after agreed owner coordination; rerun affected checks after any source change. Update the current qualification record with source identity, actual adapter/backend version, test scope, unavailable phases and independent review outcome. A documentation change follows #1972 ownership. Preserve rollback/recovery records and prepare the focused PR under existing review rules. Positive check: all accepted requirements have evidence. Negative check: no pending CI, mock PASS, historical artifact or unpublished local file is presented as complete. Done when review/CI and actual-on-main acceptance are separately recorded. Final checkpoint releases OWNER=NONE, clears only own assignment/labels and gives the next operator exact source and remaining gates. Publication or merge alone does not close unmet acceptance.

## VALIDATION

### Reproducible setup and planned commands

Run from the repository root with Node meeting package.json (audited runtime 24.22.3) and the pinned pnpm 10.30.3 plus already provisioned locked dependencies. Current audit has pnpm 11.25.0 and no node_modules; offline Corepack cannot supply the pin. Product suites are NOT_RUN/HOLD_TOOLCHAIN. Obtain an approved provisioned environment through the owner; do not download or rewrite the lockfile. Browser fixtures require the already provisioned browser. Real Windows/native proof uses the exact approved backend/profile, not Linux guard stubs.

```sh
pnpm exec vitest run tests/checkpoint-restore-v3.test.ts tests/file-checkpoints.test.ts --maxWorkers=1
pnpm exec vitest run tests/checkpoint-store-atomic-v3.test.ts --maxWorkers=1
pnpm exec vitest run tests/checkpoint-blob-integrity.test.ts --maxWorkers=1
pnpm typecheck
pnpm exec vitest run tests/public-source.test.ts --maxWorkers=1
pnpm check:docs-links
```

Existing commands above must exist at the refreshed head; proposed PR-only paths are explicitly identified in this plan and run only after their reviewed introduction. New tests added by T02 are registered in scripts/public-source-files.json and named in the implementation checkpoint. A route-mocked browser proves rendering/request behavior only; the same user flow must be repeated through the current actual app for the integration gate. Native process/filesystem tests record exact platform, executable/profile identity and pre/post state.

### Fixtures and expected behavior

Positive: valid old/new blobs read identical bytes, repeated concurrent captures deduplicate. Negative: corrupt/truncated/hardlinked/oversize bytes never become a trusted diff or restore target. Recovery: killed stage and identical retry repair safely, preserving referenced backups. Cancel: failed capture cleans its own temp only; GC does not delete another live writer’s staging.

For all cases, record the input owner/source/revision, expected effect count, actual state/bytes, log or trace path and final outcome. Retry tests must prove at-most-once user/effect semantics rather than merely returning a success response. Screenshots use synthetic data and include unavailable/stale/partial states where the plan owns UI. Keyboard and focus tests verify the existing shared surface at narrow width and reduced motion.

### Acceptance mapping

| Original requirement | Tasks | Acceptance |
|---|---|---|
| M08-C02 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-S01 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-S11 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-S13 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-T03 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-T04 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-G01 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-G03 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |

### Executed versus pending

This audit executed source reads, repository-wide caller searches and GitHub issue/PR inspections. It did not run product tests, enable features, exercise a live provider, or mutate repository files. The only executed behavioral fixture for M08-01/M08-02 is the dependency-free owned Git/source-predicate reproduction reproduced below; all other runtime acceptance remains NOT_RUN. Historical test results remain attributed to their original PR/base. The latter two test paths are proposed on competing PRs, absent at the audited baseline; run only the accepted merged paths after T01. Current tests NOT_RUN. Real supported filesystem crash/concurrency evidence and review must precede closure.

## STATE

Researched: all relevant supplied v6 and completion clauses, research context, pinned source and adjacent issue scopes. Decided: preserve retained implementations, frozen interfaces, current supported surfaces, exact authority and independent gates; each concrete design above is a proposed repair of the named requirement, not a new activation decision. Implemented by this audit: no product code or tests. Verified: source existence/caller absence and the explicitly stated owned Git primitive fixture only. Runtime, browser, Windows/native, installed/live and independent acceptance: NOT_RUN unless separately recorded by a future owner at the exact head.

T01–T06 are NOT_STARTED for implementation. Audit drafts are ready for coordinator duplicate/quality review. Existing issue/PR owners and their release checkpoints remain authoritative; do not infer release from silence. Risks: current main can move, pending fixes overlap, APIs may be intentionally unavailable, and mocks cannot prove confinement. Exact next action: root validates this full plan and its duplicate target; the future implementation owner then reads the whole issue/journal, claims the smallest scope, refreshes current source/PR state and executes T01. The latter two test paths are proposed on competing PRs, absent at the audited baseline; run only the accepted merged paths after T01. Current tests NOT_RUN. Real supported filesystem crash/concurrency evidence and review must precede closure.

## REFERENCES

- [Pinned source tree](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b); [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md); [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md).
- [Canonical audit #1992](https://github.com/skytuhua-org/Gen-V1/issues/1992); [audit checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/1992#issuecomment-7121928309).
- Original supplied v6: M07 archive lines 1092–1130, M08 1131–1172, M09 1173–1214; global rules 1–132. Relevant substantive clauses are reproduced in REQUIREMENTS so execution does not depend on private chat.
- Supplied completion followups: common lines 1397–1413 and M08 lines 1470–1477; relevant steps are reproduced above. Global policy: compare base/current source, retain facts, execute only explicit accepted gaps, record precise HOLD inputs, keep unrun phases unrun.
- Supplied research-v3: sections 19–26 and feature rationale M07 F13/F14/F59; M08 F20/F21/F22/F23/F24/F45; M09 F32–F39. These motivate exact edit provenance, independent worktree authority, reversible file recovery, native acknowledgment and evidence-bound progress; they do not override v6 or mandate copying donor implementations.
- Merged source history: [M07 PR335](https://github.com/skytuhua-org/Gen-V1/pull/335), [accepted retirement PR394](https://github.com/skytuhua-org/Gen-V1/pull/394), [M08 PR331](https://github.com/skytuhua-org/Gen-V1/pull/331), [frontend PR336](https://github.com/skytuhua-org/Gen-V1/pull/336), [M09 PR350](https://github.com/skytuhua-org/Gen-V1/pull/350). M07 old dedicated review surface is intentionally retired; acceptance is through a supported current surface only.


## PRESERVED PRIOR CANONICAL BODY AT PUBLICATION

The following prior body is retained verbatim as historical scope. The focused plan above preserves existing implementation and review ownership.

[Versioned Markdown plan](https://github.com/skytuhua-org/Gen-V1/blob/dad473f59b4c46dad12cf0357e448e090a403a2b/docs/agent-plans/nov-2026-audit-checkpoint-store.md) · [Plan publication PR](https://github.com/skytuhua-org/Gen-V1/pull/1952)

<!-- gen-v1-audit-r1-r2:checkpoint-store -->
# Make checkpoint blob writes atomic and verify stored content before reuse

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
A partially written or corrupt checkpoint blob can make old snapshots unreadable and leave unreferenced files. Make blob publication atomic and report integrity failure accurately.

## REQUIREMENTS
- Report scope: 14/B3, B5–B7, B18; 13 §3.4; 15 filesystem growth.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- Checkpoint content-addressed store and index implementation under `packages/workspace`. Use the tracked source and tests on current main to find exact paths. Separate the restore state machine and retention policy from blob integrity.

## DESIGN
Publish complete blobs atomically and verify digest before trust. Reconcile recoverable and missing state consistently across readers. Account for intermediate files and existing references without deleting referenced data.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Interrupt a blob write in a temporary store, then attempt a read and a second capture of the same binary. Alter a synthetic copy and observe the reader result. Include a failed capture and a hardlinked fixture subject to repository policy. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Assert good concurrent reads, rejection of corrupted bytes, recovery on retry, no leaked temp file after clean failure, and compatibility with a prior-format checkpoint. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Assert good concurrent reads, rejection of corrupted bytes, recovery on retry, no leaked temp file after clean failure, and compatibility with a prior-format checkpoint.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).
