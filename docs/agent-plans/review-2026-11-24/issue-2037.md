# Plan: Complete user save points and truthful checkpoint coverage and retention

## META

| Field | Value |
|---|---|
| Audit finding | M08-05 |
| Repository | skytuhua-org/Gen-V1 |
| Canonical target | [2037](https://github.com/skytuhua-org/Gen-V1/issues/2037) |
| Parent review | [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992), T07–T09 |
| Plan revision/date | original-plan-audit-r1, 2026-11-24 UTC |
| Verified baseline | main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b |
| Status | Planning only. Retained implementation exists; the specific gaps below are not verified complete. No code, tests, configuration, branches or PRs changed by this audit. |
| Source precedence | User v6 ledger is authoritative; completion appendix supplies follow-up sequence; research v3 supplies rationale only. Exact relevant original clauses are reproduced below. |
| Ownership | Audit owner codex-cloud-m0709-b197ad releases to codex-cloud-ca7d38 for publication. Existing implementation/review owners retain custody. Future implementing owner must claim this focused scope before editing. |

## OBJECTIVE

Structured edits take a best-effort preimage checkpoint, but there is no explicit user save-point command or UI. The internal contract records exclusions, sourceCut and retention while the frozen frontend summary only exposes count/revision/expiry and its provenance enum is guarded_write|restore_backup. History copy implies all files/changes are covered. list accepts a numeric offset cursor without an explicit snapshot binding. collectGarbage scans checkpoint refs only and has no production policy caller. Current source cap of 100 in the frozen read seam is valid under the original at-most-200 ceiling; it must not be silently widened.

Deliver complete user save points and truthful checkpoint coverage and retention through the retained implementation. Success means the exact original requirements mapped below are observable from the supported host path, the named failure cases have deterministic regression evidence, and unsupported capabilities remain unavailable. Contract definitions, test-only injection and historical merged PRs are evidence of retained work, not current live acceptance.

## REQUIREMENTS

### Authoritative original requirements for this focused gap

**M08-C02.** CheckpointV1: id, scope matching the existing checkpoint adapter, sourceCut, createdAt, files[{path,identity,digest,blobRef}], exclusions[] and retention AVAILABLE|EXPIRED|MISSING. First version covers approved text/code files, at most 200 files, 8 MiB per file and 64 MiB per checkpoint. Secret/config exclusions remain explicit.

**M08-S01.** Reuse current project/worktree binding and private Git family checks. Map all writes to their true owner. Before/after blobs are captured only through approved file access; exclude secrets and mark oversized/binary data unsupported instead of storing it silently.

**M08-S02.** Append proven structured-edit receipts after a confirmed write, with a prepared record before it where needed for recovery. Mark arbitrary shell changes as process-window evidence unless the actual write can be attributed. Preserve two agents' conflicting receipts independently.

**M08-S09.** Implement the read-only checkpoint provider behind the existing frozen adapter, preserving its owner/revision/cursor validation. Add the restore command protocol separately rather than silently widening a read interface. Wire provider availability into the existing screen only when the backend is ready.

**M08-S10.** Create checkpoints at confirmed edit boundaries and explicitly user-requested save points. Before restore, stop or safely pause owners that can write the selected paths and resolve unsaved editor state. Create a pre-restore checkpoint and an exact path/diff approval. Excluded files and shell-only changes are visibly outside coverage.

**M08-S13.** Document retention and storage caps, garbage collecting only blobs not referenced by checkpoints, recovery journals or audit policy. Missing retained bytes must make Restore unavailable with a precise reason, not a partial silent restore.

**M08-U01.** Use existing Current, Recorded and History checkpoint tabs. Show coverage count, excluded files, source cut and retention availability. Restore opens a side-by-side exact diff and requires selected paths plus confirmation; it never shares a button with conversation rewind.

**M08-T03.** Checkpoint provider responds only for the matching scope/cursor. Missing, expired or excluded blobs cannot be restored.

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

## REPO_MAP

All links below are pinned to the audited source. A listed helper is not claimed to have a production caller unless explicitly stated. T01 refreshes these paths against the latest accepted main and active PRs before implementation.

| File | Verified function, component or evidence |
|---|---|
| [packages/core/service.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts) | captureEditPreimage/createFromBytes before a structured edit |
| [packages/workspace/checkpoints.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/workspace/checkpoints.ts) | create, createFromBytes, list, detail, review, collectGarbage |
| [apps/server/workspace-routes.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/workspace-routes.ts) | capability/list/detail/review; no save point route |
| [apps/web/src/FileCheckpoints.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/FileCheckpoints.tsx) | History copy, list/detail |
| [apps/web/src/file-checkpoint-api.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/file-checkpoint-api.ts) | frozen owner/revision/cursor interface |
| [tests/file-checkpoints.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/file-checkpoints.test.ts) | frozen 100-file cap |

Historical bundle evidence: [M08-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M08-verification.json). It belongs to the historical base recorded inside that document. It is not current main proof. M07 records live LSP/DAP and worker feed gates open; M08/M09 record pending independent review and platform/integration gates. Current [progress ledger](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/progress.md) does not establish these milestones complete.

Dependencies and adjacent owners:

- #1954 blob integrity
- #1953 unresolved recovery references
- M08-01 retained proof references
- #1943 Changes owner binding
- #1344 manual editor: open PR1499@35d3ee06284c2d1445db6cd4fe49cd367705bc0c adds saveFile/preimage capture; open PR1500@b004cfa6b1243b8677bf2f2b2b8db2ad45642bf8 adds manual_edit reader/label. Coordinate these owners; explicit independent user save points remain separate.

## DESIGN

Preserve the frozen adapter and its 100-file contract. Add an explicitly reviewed separate capture command and a versioned supplemental coverage read only if required fields cannot be expressed without breaking the seam. Save points capture only selected approved text/code paths, with exact owner/source cut and explicit excluded/unattributed coverage. Document effective caps, expiry and audit/recovery retention. Define and store a cursor tied to the exact owner and snapshot, rejecting changed scope/revision instead of inventing pages. GC traverses every durable reference class and removes only unreferenced, inactive bytes.

### Concrete implementation and integration boundary

Add capture boundary via current workspace action ownership, schema validation and approved bound reads. Distinguish successful confirmed edits from prepared/failed writes in checkpoint provenance. Add explicit retention/ref tracing and bounded GC invocation with protected live staging. Keep read schema compatibility and label any new route/schema discovery before coding.

History shows coverage count, excluded reasons, source cut and retention status, with Save checkpoint distinct from Restore and conversation rewind. Save failures explain zero/partial coverage; no automatic secret or shell-write attribution. A selected restore target unavailable by retention is disabled with the exact reason. Coordinate #1943 and any live editor owner.

### Failure, persistence, migration and rollback

Validate owner/source/epoch/revision immediately before authority-bearing effects and again when accepting asynchronous results. Preserve uncertain outcomes as explicit unknown/conflict/partial states; retry only after authoritative reconciliation. Writes must be either idempotently replayable from their durable receipt or require a new exact preview/approval. A UI acknowledgment is not an effect receipt. Missing proof remains unavailable, with the successful read-only path preserved.

New records require an explicit schema version, compatibility test against the retained format, and an owner-approved migration plan before T03. Rollback disables new admission at the existing host flag/capability boundary, retains all receipts, journals, blobs and dirty workspaces, and closes only confirmed-owned resources. It never rewrites user bytes or replays an unresolved input automatically. Do not remove historical evidence; label its source and acceptance limit.

## EXECUTION_DAG

Tasks are sequential unless T01 records a narrower nonoverlapping file allocation. Each handoff requires an issue checkpoint and receiver ACK. No task may take another worker's claimed implementation files.

### T01: Refresh custody and baseline

Owner: integration reviewer. Dependencies: complete canonical issue, this full plan, all comments and active related PRs. Inputs: pinned baseline and REPO_MAP. Read AGENTS.md/CONTRIBUTING.md and current issue journal; inspect latest main, related branches and full PR patches. Record which exact fixes are merged, open, withdrawn or owned. For reuse targets, preserve every original issue requirement above and resolve overlapping deliveries with the existing owner. Output: refreshed source map, exact interface owner and nonoverlapping task assignment. Positive check: every path/function and current production caller exists as stated. Negative check: no test-only seam, historical PASS or unmerged PR is called current. Done when this map and claim are read back from GitHub. Handoff: core owner for T02. If accepted API/scope is missing, mark only the affected task BLOCKED and preserve independent read-only work.

### T02: Reproduce and freeze the boundary

Owner: core reviewer, depends T01. Inputs: current source and requirements. Create save point from a supported app with included text, binary, .env, oversized file and shell-only change; show exact included/excluded coverage. Paginate while new checkpoints arrive and across owner changes. Expire/delete a blob and verify precise unavailability. Hold a blob by a restore journal and edit receipt while removing checkpoint reference; GC must retain it. Use owned temporary roots/fixtures and explicit barriers; do not alter the working user's data. Inspect the exact API, error taxonomy and versioning owner before proposing changes. Output: a failing focused product regression or a precise unavailable-acceptance gate, plus accepted input/output contracts and current behavior evidence. Positive/negative tests: the named baseline behavior and counterexample must both be asserted. Recovery/cancel: add the deterministic failure points named in VALIDATION. Done when the test fails for the stated cause or a missing proof is explicitly recorded without fabricating a runtime failure. Handoff: T03 implementing owner.

### T03: Repair the core contract and lifecycle

Owner: one host/domain implementer, depends T02 and named upstream proof/API decisions. Inputs: the accepted contract and failing regression. Add capture boundary via current workspace action ownership, schema validation and approved bound reads. Distinguish successful confirmed edits from prepared/failed writes in checkpoint provenance. Add explicit retention/ref tracing and bounded GC invocation with protected live staging. Keep read schema compatibility and label any new route/schema discovery before coding. Edit only the verified owning files in REPO_MAP and necessary versioned interfaces; any additional path must be discovered and recorded, not guessed. Output: minimal reviewed implementation with persistent identity/recovery semantics and a green focused regression. Positive check: intended current path works. Negative check: denied/stale inputs have zero unauthorized effects. Recovery/cancel check: durable state stays truthful under the exact failure barriers. Done when the branch records commit SHA, changed paths, test outputs and unresolved platform gates. Handoff: T04 surface/adapter owner after interface commit and ACK.

### T04: Connect the real caller and supported UI

Owner: adapter/UI implementer, depends T03. Inputs: accepted service interface, current supported app surface and source-bound fixtures. History shows coverage count, excluded reasons, source cut and retention status, with Save checkpoint distinct from Restore and conversation rewind. Save failures explain zero/partial coverage; no automatic secret or shell-write attribution. A selected restore target unavailable by retention is disabled with the exact reason. Coordinate #1943 and any live editor owner. Trace the real start-to-result path and attach owner/revision to every request and response. Do not claim a fixture-only component or a mounted but empty reader is a production integration. Output: working supported entry point and visible blocked/error/recovery states. Positive check: user action reaches exactly one owned operation. Negative check: missing proof, changed context or stale response cannot display success or dispatch. Recovery/cancel check: reload/stop/switch-owner retains authoritative history and does not retry uncertain mutations. Done when a browser trace and exact request/response assertions cover the real caller. Handoff: T05 verifier. If this plan has no UI change, verify the existing affected caller and state instead of introducing a new screen.

### T05: Execute requirement acceptance at the proper level

Owner: independent verifier, depends T04 and the exact approved toolchain/platform. Inputs: pinned implementation head, complete requirement matrix, owned fixtures and approved native inputs. Run the focused commands in VALIDATION, then the specific supported App and native cases. Do not install missing prerequisites or substitute the provisioned wrong pnpm version. Output: source-pinned results with expected/actual outcomes, counts, logs, environment identity and explicit NOT_RUN gates. Positive/negative/recovery/cancel outcomes are all required. Preserve earlier failing attempts and do not call synthetic adapter or guard stubs native proof. Done when every owned matrix row is passed or precisely held with owner and next executable step. Handoff: T06 integration owner, with actionable defects returned to T03/T04.

### T06: Review, evidence and release

Owner: integration owner, depends T05. Inputs: reviewed exact head, test evidence and latest upstream PR state. Rebase only after agreed owner coordination; rerun affected checks after any source change. Update the current qualification record with source identity, actual adapter/backend version, test scope, unavailable phases and independent review outcome. A documentation change follows #1972 ownership. Preserve rollback/recovery records and prepare the focused PR under existing review rules. Positive check: all accepted requirements have evidence. Negative check: no pending CI, mock PASS, historical artifact or unpublished local file is presented as complete. Done when review/CI and actual-on-main acceptance are separately recorded. Final checkpoint releases OWNER=NONE, clears only own assignment/labels and gives the next operator exact source and remaining gates. Publication or merge alone does not close unmet acceptance.

## VALIDATION

### Reproducible setup and planned commands

Run from the repository root with Node meeting package.json (audited runtime 24.22.3) and the pinned pnpm 10.30.3 plus already provisioned locked dependencies. Current audit has pnpm 11.25.0 and no node_modules; offline Corepack cannot supply the pin. Product suites are NOT_RUN/HOLD_TOOLCHAIN. Obtain an approved provisioned environment through the owner; do not download or rewrite the lockfile. Browser fixtures require the already provisioned browser. Real Windows/native proof uses the exact approved backend/profile, not Linux guard stubs.

```sh
pnpm exec vitest run tests/checkpoint-restore-v3.test.ts tests/file-checkpoints.test.ts tests/workspace-journal-v3.test.ts --maxWorkers=1
pnpm exec playwright test --config tests/e2e/file-checkpoints.playwright.config.ts
pnpm exec playwright test --config tests/e2e/workspace-host.playwright.config.ts
pnpm typecheck
pnpm exec vitest run tests/public-source.test.ts --maxWorkers=1
pnpm check:docs-links
```

Existing commands above must exist at the refreshed head; proposed PR-only paths are explicitly identified in this plan and run only after their reviewed introduction. New tests added by T02 are registered in scripts/public-source-files.json and named in the implementation checkpoint. A route-mocked browser proves rendering/request behavior only; the same user flow must be repeated through the current actual app for the integration gate. Native process/filesystem tests record exact platform, executable/profile identity and pre/post state.

### Fixtures and expected behavior

Positive: explicit save and confirmed-edit boundary records show exact scope and included file count. Negative: excluded secrets/binary/oversize, malformed/stale cursor and wrong owner fail conservatively. Recovery: restart retains coverage and expiry; missing blobs remain unavailable. Cancel: capture cancellation creates no false complete checkpoint and never removes referenced recovery bytes.

For all cases, record the input owner/source/revision, expected effect count, actual state/bytes, log or trace path and final outcome. Retry tests must prove at-most-once user/effect semantics rather than merely returning a success response. Screenshots use synthetic data and include unavailable/stale/partial states where the plan owns UI. Keyboard and focus tests verify the existing shared surface at narrow width and reduced motion.

### Acceptance mapping

| Original requirement | Tasks | Acceptance |
|---|---|---|
| M08-C02 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-S01 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-S02 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-S09 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-S10 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-S13 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-U01 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-T03 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-G01 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-G02 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-G03 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |

### Executed versus pending

This audit executed source reads, repository-wide caller searches and GitHub issue/PR inspections. It did not run product tests, enable features, exercise a live provider, or mutate repository files. The only executed behavioral fixture for M08-01/M08-02 is the dependency-free owned Git/source-predicate reproduction reproduced below; all other runtime acceptance remains NOT_RUN. Historical test results remain attributed to their original PR/base. New protocol/surface fields need explicit accepted versioning before implementation. Read-only history can qualify independently; save/restore activation remains separate. Current app and retention acceptance NOT_RUN.

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

T01–T06 are NOT_STARTED for implementation. Audit drafts are ready for coordinator duplicate/quality review. Existing issue/PR owners and their release checkpoints remain authoritative; do not infer release from silence. Risks: current main can move, pending fixes overlap, APIs may be intentionally unavailable, and mocks cannot prove confinement. Exact next action: root validates this full plan and its duplicate target; the future implementation owner then reads the whole issue/journal, claims the smallest scope, refreshes current source/PR state and executes T01. New protocol/surface fields need explicit accepted versioning before implementation. Read-only history can qualify independently; save/restore activation remains separate. Current app and retention acceptance NOT_RUN.

## REFERENCES

- [Pinned source tree](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b); [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md); [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md).
- [Canonical audit #1992](https://github.com/skytuhua-org/Gen-V1/issues/1992); [audit checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/1992#issuecomment-7121928309).
- Original supplied v6: M07 archive lines 1092–1130, M08 1131–1172, M09 1173–1214; global rules 1–132. Relevant substantive clauses are reproduced in REQUIREMENTS so execution does not depend on private chat.
- Supplied completion followups: common lines 1397–1413 and M08 lines 1470–1477; relevant steps are reproduced above. Global policy: compare base/current source, retain facts, execute only explicit accepted gaps, record precise HOLD inputs, keep unrun phases unrun.
- Supplied research-v3: sections 19–26 and feature rationale M07 F13/F14/F59; M08 F20/F21/F22/F23/F24/F45; M09 F32–F39. These motivate exact edit provenance, independent worktree authority, reversible file recovery, native acknowledgment and evidence-bound progress; they do not override v6 or mandate copying donor implementations.
- Merged source history: [M07 PR335](https://github.com/skytuhua-org/Gen-V1/pull/335), [accepted retirement PR394](https://github.com/skytuhua-org/Gen-V1/pull/394), [M08 PR331](https://github.com/skytuhua-org/Gen-V1/pull/331), [frontend PR336](https://github.com/skytuhua-org/Gen-V1/pull/336), [M09 PR350](https://github.com/skytuhua-org/Gen-V1/pull/350). M07 old dedicated review surface is intentionally retired; acceptance is through a supported current surface only.
