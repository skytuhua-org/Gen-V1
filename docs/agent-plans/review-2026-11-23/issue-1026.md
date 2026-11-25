**Full current issue mirror:** [issue-1026.md](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1026.md). The publication checkpoint pins the exact commit.

Publication supplement under #1803, cleanup-2026-11-23-r2: preserve the concurrent #1992 plan below. Installed recall, extraction, checkpoint and real elapsed retention acceptance remain open. This cleanup supplies the missing full versioned mirror; existing #737/#782 custody and all separate execution approvals remain in place.

# M05: Verify installed recall, extraction, checkpoint and elapsed physical purge

## META

Repository: `skytuhua-org/Gen-V1` (ID 1442565952). Plan revision: `m0406-audit-r1-readability-r1`, 2026-11-24 UTC. Exact inspected baseline: `9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Parent audit: [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992). Planning reviewer: `codex-cloud-m0406-e3d038`. This reviewer holds no implementation ownership; existing claims remain authoritative. No branch, worktree, PR or activation was created by this audit. This document is an executable future plan, not permission to run a provider, alter the repository or activate a capability during the read-only audit.

Attachment limitation observed by the parent publisher: GitHub filechooser upload failed. The complete UTF-8 Markdown body is the publication fallback; these actual .md files remain separate review deliverables. No GitHub attachment success is claimed and no repository-docs write or commit is authorized.

The authoritative inputs are the user-supplied *Audited Execution-Controlled Prompts v6* (2026-11-16), its *Completion Followups* appendix (2026-11-18), and *Expanded Source Research UX Memory Performance v3* (2026-11-14). The complete relevant clauses are reproduced below. v6 controls acceptance; the appendix orders remaining work; research §§19-26 explains the experiment/evidence design. An existing helper, merged commit, valid evidence JSON or passing synthetic test is not production/native/live acceptance.

Read [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md) and [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md) before future implementation. Claim only this issue's task IDs, append and read back every checkpoint, retain one concern and one owner per edit set, and RELEASE OWNER=NONE before stopping. User authorization in this audit covers planning/publication only. Future implementation needs its own task scope; do not resurrect retired architecture without an explicit accepted product decision. M12 and M14 belong to other active owners.

Canonical routing: extend [#1026](https://github.com/skytuhua-org/Gen-V1/issues/1026) in place; do not create a duplicate.

## OBJECTIVE

Complete the existing installed Windows acceptance issue using the landed host-owned memory lifecycle. Distinguish default-off retention/review from explicitly enabled actual foreground recall, extraction, native checkpoint and elapsed physical purge. Existing logic stays intact unless a named failing case proves a defect.

### Actual baseline finding

#782 remains OPEN draft at c937d590ceff044ac2234a136efc48b685e9325d on #737 d3363d3b. #1026 checkpoint 32 records named installed run 44640971671 artifact 14596634055, setup SHA bdaefc4a633d9267e4737fde73ba424635eda301ec2295d034c12747a898c949, Electron 45.2.0 and two default-off plus two separately owned enabled launches. That evidence covers seeded review, exact sources, deterministic consolidation, export, Forget and restart; it explicitly excludes actual foreground recall, automatic extraction, native checkpoint and live provider. #805 landed a single periodic route owner plus separately justified recovery. Current m05-purge-qualification.yml rejects all skipped/todo tests but proves synthetic elapsed cases, not real elapsed installed retention. #976 is separate targeted purge evidence.

## REQUIREMENTS

**M05-C04.** MemoryTombstoneV1: itemId, deletionRevision, projectIdentity, deletedAt, sourceExclusions[], affectedDerivedArtifacts[] and purgeStatus. Retrieval checks tombstones synchronously. Summary rebuilds, indexes and restored backups must not resurrect deleted content.

**M05-C05.** Pilot defaults: opt-in per project; at most 8 recalled items and 4 KiB of injected memory; lexical retrieval first; vector retrieval is a separate disabled experiment requiring an approved embedding provider and explicit data egress consent. Extraction proposes rather than auto-accepts new facts.

**M05-S05.** Capture recall at request preparation and bind it to that context generation. Late results are candidates for a later request, not mutations of an in-flight prompt. Use a 750 ms foreground wait budget for local retrieval; timeout returns an empty or already-complete bounded result plus status, not stale data from a previous project.

**M05-S07.** Extract proposals after a settled task from an authorized, bounded source cut. Distinguish decisions, facts, unresolved work and explicit reusable preferences. Require exact source references, reject unsupported references and secret-bearing payloads, and label model inference as proposed. No extraction tool can modify project files or invoke a privileged action.

**M05-S09.** Before native compaction, save a structured checkpoint of accepted task constraints and source pointers through the host boundary. A required checkpoint failure blocks that compaction operation without discarding history. Do not assume every Hermes provider implements the same checkpoint API version.

**M05-S10.** Implement Forget as an authenticated, revision-bound transaction that immediately excludes the item and invalidates derived summaries/index entries. Schedule physical purge of permitted local artifacts under a bounded retention policy and record completion. Do not promise deletion from an external provider without an actual documented deletion API.

**M05-U01.** Project Memory has tabs Accepted, Proposals, Conflicts and Deleted history. Each row shows type, project, source, age, expiry and last-used time. Detail opens the exact supporting message/file revision, not an unpinned search result.

**M05-U02.** Proposal actions are Accept, Edit and accept, Reject. Conflict resolution explicitly chooses a surviving revision or preserves both with a note. No silent last-write-wins overwrite.

**M05-U03.** Forget preview names derived summaries/indexes that will be invalidated and distinguishes immediate retrieval exclusion from pending physical purge. Export is explicit and redacted; no automatic cloud sync.

**M05-U04.** In ContextInspector show Why recalled with the matched scope and source. Allow Exclude from this request independently from permanently forgetting.

**M05-T03.** Forget immediately removes recall, invalidates summaries, survives restart and does not resurrect through reindex or old backup replay.

**M05-G01.** Local lexical memory can pass independently of an external vector service. External embeddings, auto-acceptance and user-wide sharing remain disabled unless separately approved and tested. Native pre-compaction checkpoints are adapter-gated.

**M05-G02.** Host-owned flags: memory.projectV1, memory.externalRecallExperimentV1. Register only these keys in the shared finite registry; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M05-G03.** Rollback: Disable injection and extraction; retain user-editable accepted records and tombstones. Revert to existing task notes without overwriting Hermes skill files or reintroducing deleted material.

Completion appendix requires separate successful receipts/ownership for recall/extraction/checkpoint, elapsed retention/Forget and foreground operation. It explicitly prohibits substituting scripted timing for installed elapsed proof. The new live quality study remains separately owned; this issue validates lifecycle and installation behavior.

## REPO_MAP

- [`scripts/installed-memory-retention.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/installed-memory-retention.ts)
- [`scripts/verify-installed-desktop.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/verify-installed-desktop.ts)
- [`packages/core/project-memory.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/project-memory.ts)
- [`packages/core/project-memory-host.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/project-memory-host.ts)
- [`packages/core/memory-extraction.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/memory-extraction.ts)
- [`packages/core/memory-consolidation.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/memory-consolidation.ts)
- [`packages/core/service.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts)
- [`apps/server/project-memory-routes.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/project-memory-routes.ts)
- [`.github/workflows/m05-purge-qualification.yml`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/.github/workflows/m05-purge-qualification.yml)
- [`tests/project-memory-maintenance-host.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/project-memory-maintenance-host.test.ts)
- [`tests/memory-native-checkpoint-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/memory-native-checkpoint-v3.test.ts)

## DESIGN

Preserve one ProjectMemory authority, attested physical profile/project/account, immutable captured source, synchronous tombstone exclusion and durable fence outside replayable Store data. Keep one 60 seconds route timer and one bounded startup recovery; do not add a second periodic owner. Test injection is process-local to the disposable installed profile; production flags remain false. The installed test must observe the actual request/callback/event, not only seeded rows or displayed chips. Source refs and checkpoint digest are receipts, never grants. Seven-day retention is real elapsed time for installed acceptance; advancing a test clock proves scheduler logic only.

## EXECUTION_DAG

### T01: Reconcile current installed workflow and exact inputs

Depends on: none. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Immutable source-built installer, setup digest, NSIS identity, supported Windows machine and real current native adapter; approved disposable profile/project/source and optional authorized provider fixture.

**Files and concrete edits:** Read #782/#737 bodies/comments and current ci.yml, scripts/verify-installed-desktop.ts and installed-memory-retention.ts. Coordinate #1028 workflow custody.

**Operation and output:** Compare exact #782 workflow to current installer job before deciding if any standalone workflow is still needed. Preserve owner.json and independent default-off/enabled process ownership. Name unavailable platform/provider as HOLD_INSTALLED_MEMORY_PROOF.

**Positive, negative, cancellation and recovery checks:** Positive install identity matches source manifest and executable. Negative wrong setup hash/reused profile/foreign PID/window refuses; cancellation cleans only owned installation/process.

**Done criterion:** No duplicated runner and exact scenario matrix plus approved fixture identity recorded.

### T02: Reproduce core host lifecycle and purge ownership

Depends on: T01. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Actual Service/HTTP/Store path; WAL reader; persisted tombstone; immutable source message; installed helper remains separate.

**Files and concrete edits:** Run existing project-memory-service-v3, memory-forget-v3, project-memory-maintenance-host, HTTP and native-checkpoint tests. Modify only a reproduced missing behavior in existing owner files.

**Operation and output:** Verify local opt-in, authorized source preparation, correction conflict, immediate Forget, one periodic bounded batch and separate recovery. Reader-blocked WAL remains PENDING; release reader then complete purge, restart and preserve original source messages and deletion fence.

**Positive, negative, cancellation and recovery checks:** Positive current recall/review sources; negative missing source, other account/project, stale revisions, unaccepted proposal, raw instruction and deliberate secret. Stop/restart cannot resurrect old backup or duplicate timer.

**Done criterion:** Named current core cases pass and no new duplicate purge authority is introduced.

### T03: Extend installed acceptance to actual admitted memory

Depends on: T01, T02. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Approved enabled disposable profile, ordinary App Send, accepted source policy, production HostOptions injection, real M04 RequestPreparationV1 identity and actual input.processing receipt.

**Files and concrete edits:** Extend scripts/installed-memory-retention.ts and its existing caller in verify-installed-desktop.ts; add assertions to tests/installed-desktop-verification.test.ts for new receipt/CLI validation. Do not create a parallel installed harness.

**Operation and output:** Keep current seeded review cases. Add separate foreground request that proves selected revision entered the actual model-visible prepared request under 8-item/4 KiB/750 ms limits; Exclude affects only that request. Settle actual task then observe automatic proposal extraction through authorized source cut, no tools. Run actual native required checkpoint and independently verify exact persisted digest before compaction.

**Positive, negative, cancellation and recovery checks:** Wrong account/refresh/source revision rejects; late extraction/recall after owner change cannot publish. Stop during preparation sends no stale source. Required checkpoint persistence failure leaves native history unchanged. Restart retains accepted state and historical receipts, not active authority.

**Done criterion:** Separate successful actual installed receipts for recall, extraction, checkpoint and foreground operation, each naming runtime/native/provider scope.

### T04: Prove elapsed installed Forget and physical retention

Depends on: T02, T03. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Recorded real deletedAt, installed/profile identity, exact local retained copy locations, seven-day retention policy, blocker WAL reader and restart ownership.

**Files and concrete edits:** Use existing bounded purge owner and installed profile. Extend receipt collection only; do not alter retention constant or substitute synthetic clock.

**Operation and output:** At Forget verify immediate no-recall and invalidated derived references. Preserve ongoing bounded timestamped receipts until actual retention passes. Show pending while reader holds old pages; release reader, observe scheduled completion; restart the installed app and replay permitted old backup data under the retained fence. Hash or inspect only disposable known test payload copies; never delete original messages/native history.

**Positive, negative, cancellation and recovery checks:** Positive completion after real retention and reader release. Negative early purge cannot claim completion; read lock/restart remains PENDING; delayed foreground action remains correct. Cancelled observation run resumes from durable timestamps without rewriting them.

**Done criterion:** Actual installed elapsed-time and byte-absence evidence plus preserved tombstones/source messages; otherwise explicit HOLD_ELAPSED_INSTALLED_RETENTION remains.

### T05: Retain evidence and separate activation decisions

Depends on: T03, T04. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Named Linux comparison and independent Windows installed receipts, setup owner/hash, all failed/cancelled attempts and current source.

**Files and concrete edits:** Existing M05 verification/evidence index under future authorized change; #1972 broader doc reconciliation and #1028 immutable current CI are dependencies.

**Operation and output:** Record each capability separately. Do not infer external embedding, user-wide sharing or auto-acceptance from lexical success. Roll back injection/extraction while retaining reviewable records, tombstones, original messages and task notes.

**Positive, negative, cancellation and recovery checks:** Disable injected flag with request in flight: no new current injection; reader remains usable, Forget fence persists. Missing one installed phase leaves that phase NOT_RUN.

**Done criterion:** Every required installed receipt exists or #1026 remains PARTIAL with precise missing inputs; no production enablement.

## VALIDATION

### Setup and command discipline

Observed audit environment: Node 24.22.3 satisfies `>=24.10.0`; provisioned pnpm 11.25.0 does not match required 10.30.3; there is no node_modules tree. `COREPACK_ENABLE_NETWORK=0 corepack pnpm --version` cannot resolve an already-provisioned 10.30.3. All current product test commands are NOT_RUN, reason HOLD_TOOLCHAIN. No package, toolchain or browser was downloaded and no repository file was modified. A missing dependency is an infrastructure hold, not an expected failing assertion.

Future executor must first record `git rev-parse --show-toplevel`, `git remote get-url origin`, `git status --porcelain=v1 --untracked-files=all`, `git branch --show-current`, `git worktree list --porcelain`, `git rev-parse HEAD`, `node --version` and `pnpm --version` separately. Read the then-current package.json, lockfile, consumed contracts and owner journal. Use installed matching pnpm or an already provisioned matching Corepack resolution. If neither exists, keep HOLD_TOOLCHAIN; no download is authorized by v6. Frozen existing-lockfile dependency setup is allowed only under the future implementation's setup authorization. Never substitute a different version or use --passWithNoTests.

Run required asset steps as separate observed commands before targeted tests: `pnpm build:credential-lease` and `pnpm build:widgets`. A platform incapable of the native build may execute a separately labeled pure targeted diagnostic but cannot substitute `test:no-lease` for the required `pnpm test` gate. After focused tests run, retain individual receipts for `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:browser`. Do not change timeout, skip, browser channel or expected assertion to hide a failure. Planned commands below were not executed in this audit.

Receipts name the immutable source SHA/tree, source and dependency blob hashes, Node/pnpm/OS/architecture/browser/native adapter, flag injection, exact command, start/end UTC, exit or cancellation, actual test case identities, passed/failed/skipped counts, and bounded artifact SHA-256. Preserve every baseline failure, cancellation, unknown settlement and unavailable cost. Platform-specific skips are declared individually and never fulfill required gates. Evidence integrity validation is separate from product acceptance.

### Focused commands

```sh
pnpm exec vitest run tests/project-memory-service-v3.test.ts tests/memory-forget-v3.test.ts tests/project-memory-maintenance-host.test.ts
pnpm exec vitest run tests/project-memory-http-v3.test.ts tests/memory-native-checkpoint-v3.test.ts tests/memory-consolidation-v3.test.ts tests/installed-desktop-verification.test.ts
pnpm build
pnpm test:browser --suite project-memory-host
# Existing Windows installed command: use reviewed workflow inputs and verify-installed-desktop CLI after T01, preserving --project-memory-retention and --project-memory-enabled as separate owned cases.
```

### Acceptance matrix

| Requirement | Tasks | Required observable result |
|---|---|---|
| C05, S05, U04 | T03 | Actual prepared/admitted input, scope and byte/time caps; per-request exclusion distinct from Forget. |
| S07, S09 | T03 | Actual settled extraction and required native checkpoint with exact digest; no synthetic replacement proof. |
| C04, S10, T03, U03 | T02, T04 | Immediate exclusion, bounded physical purge after real installed retention, reader-blocked pending and no resurrection. |
| U01, U02 | T02, T03 | Pinned source/revision review and explicit conflict resolution survive installed restart. |
| G01, G02, G03 | T05 | Default-off/embedding/sharing gates separate; rollback retains records/fences and no native history loss. |

### Release gates and rollback

HOLD_TOOLCHAIN now. HOLD_INSTALLED_MEMORY_PROOF for unavailable actual Windows installed runtime or approved inputs. HOLD_ELAPSED_INSTALLED_RETENTION remains until real elapsed retention is observed. No accelerated fixture, seeded UI, earlier #1004 closure or current purge-unit PASS can replace it. Model calls require separate approved account/model/corpus/budget; no credentials or entitlement is assumed. Preserve the original #1026 scope, its named evidence and Linux comparison.

## STATE

All T01 and later implementation tasks are NOT_STARTED. This audit performed source tracing, original-clause extraction, issue/PR body and discussion comparison, path/reference verification and clean-tree checks only. Product tests, Windows installed tests, live model calls and activation are NOT_RUN. Implementation scope and execution owners must be claimed in the canonical issue before future changes. Next step is T01 after coordinator publishes this complete plan and confirms current owner/source; blocked inputs are not guessed. Preserve ordinary working code, all native histories, accepted memory, tombstones and prior failed observations across rollback.

## REFERENCES

- [Pinned source](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b)
- [Parent audit and read-only scope](https://github.com/skytuhua-org/Gen-V1/issues/1992)
- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)

## PRESERVED PRIOR CANONICAL BODY

The following previous body is retained verbatim. The current-source findings and tasks above supplement its obligations; earlier append-only comments remain authoritative historical receipts with their original source limits. Stale branch states in the preserved text do not override the explicit current-state comparison above.

<!-- m-series-scope:m05-installed -->
## Outcome and scope

Source-bound Windows installed-memory outcomes, outside closed review-work issue #1004. Default-off retention and enabled recall/extraction/checkpoint are distinct results. No production flag or real provider execution without separate authorization.

## Completion criteria

- [ ] **T01** Verify installed Windows package identity, retained records, restart/export and cleanup on the exact named workflow cut.
- [ ] **T02** Record independent enabled recall/extraction/checkpoint observations or the limiting fixture/provider gap.
- [ ] **T03** Reconcile #782's stack base and review/merge state after #737 disposition. Preserve historical cancellation.

## Ownership and current state

Existing owner or dependency owner: Existing #782 installed verifier and qualification owner. #1004 completed its review work. #782 is still an open draft stacked on #737.



## References

- [PR #782](https://github.com/skytuhua-org/Gen-V1/pull/782)
- [PR #737](https://github.com/skytuhua-org/Gen-V1/pull/737)
- [docs/implementation/v3/M05-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/5cde22a7d48cc0a5f0f24884f862e64781575ebd/docs/implementation/v3/M05-verification.json)
- [Closed review scope #1004](https://github.com/skytuhua-org/Gen-V1/issues/1004)

Issue body revision `issue-body-r1`. Use append-only checkpoints for evidence and handoffs. Existing ownership, review requirements and release permissions apply.


### Prior journal preserved in GitHub

- [7026912774](https://github.com/skytuhua-org/Gen-V1/issues/1026#issuecomment-7026912774): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7033319101](https://github.com/skytuhua-org/Gen-V1/issues/1026#issuecomment-7033319101): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7036607945](https://github.com/skytuhua-org/Gen-V1/issues/1026#issuecomment-7036607945): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7045960679](https://github.com/skytuhua-org/Gen-V1/issues/1026#issuecomment-7045960679): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7051231193](https://github.com/skytuhua-org/Gen-V1/issues/1026#issuecomment-7051231193): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7057857233](https://github.com/skytuhua-org/Gen-V1/issues/1026#issuecomment-7057857233): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
