# M04–M06: Reconcile current immutable Linux and Windows qualification evidence

## META

Repository: `skytuhua-org/Gen-V1` (ID 1442565952). Plan revision: `m0406-audit-r3-fixed-decisions`, 2026-11-24 UTC. Exact inspected baseline: `9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Parent audit: [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992). Planning reviewer: `codex-cloud-m0406-e3d038`. This reviewer holds no implementation ownership; existing claims remain authoritative. No branch, worktree, PR or activation was created by this audit. This document is an executable future plan, not permission to run a provider, alter the repository or activate a capability during the read-only audit.

Full current issue mirror: [issue-1028.md](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1028.md). The #1992 attachment attempt failed; #1803 supplies this versioned mirror under separate authorization. The publication checkpoint pins its exact commit.

The authoritative inputs are the user-supplied *Audited Execution-Controlled Prompts v6* (2026-11-16), its *Completion Followups* appendix (2026-11-18), and *Expanded Source Research UX Memory Performance v3* (2026-11-14). The complete relevant clauses are reproduced below. v6 controls acceptance; the appendix orders remaining work; research §§19-26 explains the experiment/evidence design. An existing helper, merged commit, valid evidence JSON or passing synthetic test is not production/native/live acceptance.

Read [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md) and [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md) before future implementation. Claim only this issue's task IDs, append and read back every checkpoint, retain one concern and one owner per edit set, and RELEASE OWNER=NONE before stopping. User authorization in this audit covers planning/publication only. Future implementation needs its own task scope; do not resurrect retired architecture without an explicit accepted product decision. M12 and M14 belong to other active owners.

Canonical routing: extend [#1028](https://github.com/skytuhua-org/Gen-V1/issues/1028) in place; do not create a duplicate.

Coverage revision history: `m0406-audit-r2-coverage` adds the exact 22 previously omitted qualification clauses, named Q01–Q22 checks and their T01–T05 evidence path. Previous complete plan SHA-256: `c77b749d16fc18b0e4c32977eac8880b564f8b091ea223320e4cb7fd41adce43` (`m0406-audit-r1-readability-r1`). No existing requirement, historical receipt, co-owner claim or prior canonical body was removed. This revision is a plan-completeness correction, not a claim of new implementation or executed tests.


## OBJECTIVE

Give the preserved M04–M06 implementation one exact-source qualification record with explicit required test identities on Linux and Windows. This issue owns evidence/runner reconciliation, not the missing product integrations assigned to #1027/#1026/#1030 and focused live/security plans.

### Actual baseline finding

#737 remains OPEN draft d3363d3bde1ea2af81a7eea145066173e4df1882 on acebd5cdd9f61caa41c5d36a1c546702f64995bb. Named run 44341345853 passed its exact cut; general run 44341345809 was CANCELLED. #782 installed run 44640971671 is separate. Current .github/workflows/m04-m06-qualification.yml is absent after documented deletion. The #737 review identifies skipped/pending/todo cases can silently count PASS in m02/m04/m05/m06/native_host/inventory groups, trigger scope omits later product PRs, and native protected cases skip on Linux. It also preserves 600-to-150 payload rationale needs and hash-pinned Python closure concern. Current M05 purge workflow already rejects all skipped/todo and preserves exact immutable source. #801/#804/#805 merged independently; old combined results do not certify their newer/current cut.

## REQUIREMENTS

**M04-T01.** Long session append reads only the eligible new tail; rewind or changed instructions invalidates the cache. Cross-account reuse is denied.

**M04-T02.** 100/500-tool fixture: initial disclosed schema bytes are lower than full-catalog baseline; correct tools remain discoverable, hidden tools cannot dispatch.

**M04-T03.** Large output fixture retains a retrievable exact full result, respects preview/range bounds and reports disk failure honestly. Expired handles leak no cross-scope data.

**M04-T04.** Provider usage followed by large tool results triggers correct next-request budgeting; missing tokenizer uses BYTE_ONLY.

**M04-T05.** Compaction preserves seeded unresolved requirements, tool-result pairs and source pointers. Wrong generation, model, workspace or account refuses application.

**M04-T06.** Precompute races with rewind, new instruction, cancellation and a long new tail discard the candidate. Failed background calls remain in cost accounting.

**M04-T07.** Shadow relevance scoring leaves model-visible input byte-for-byte unchanged.

**M04-D01.** Existing RequestPreparationV1 replay. Retry the identical prepared send twice; assert one admitted input and unchanged preparation identity. Alter prompt or owner; assert rejection before native dispatch.

**M04-D02.** Handle authority. Use an authorized, expired and foreign-owner handle; only the first returns bytes. Change ownership while the read awaits; no late bytes enter the new owner view.

**M04-D03.** UTF-8 preview. Split a multibyte character at each cap boundary; assert valid UTF-8, exact omitted bytes and total preview <=16 KiB.

**M04-D04.** No hidden tool bypass. Attempt a hidden tool by direct name, script and child dispatch; external-call counter remains zero.

**M04-D05.** Shadow and compaction. Observer failure leaves foreground request bytes unchanged; a stale native-compaction binding never calls the apply operation.

**M04-G01.** Pure projection and read-only discovery require M01/M02 core. Project-executing servers require M03 executable proof. Actual native compaction and background precompute require adapter-specific runtime tests; no requirement to build safe rename first.

**M05-T01.** Wrong project, wrong account, expired item and missing source do not enter recall. Relevance cannot grant access.

**M05-T02.** User correction wins over older summaries. Two concurrent edits produce CONFLICT instead of losing either revision.

**M05-T03.** Forget immediately removes recall, invalidates summaries, survives restart and does not resurrect through reindex or old backup replay.

**M05-T04.** Provider hang/cancellation does not leak another profile's result or grow unbounded threads. Late recall never alters an active request.

**M05-T05.** Unchanged consolidation inputs perform zero additional model calls; changed inputs update only after the correct lease/watermark check.

**M05-T06.** Prompt-injection text inside memory stays data. Seeded secrets and fabricated source IDs are rejected before publication.

**M05-G01.** Local lexical memory can pass independently of an external vector service. External embeddings, auto-acceptance and user-wide sharing remain disabled unless separately approved and tested. Native pre-compaction checkpoints are adapter-gated.

**M06-T01.** Zero exit with genuine current execution can pass; quoted “tests passed”, old logs, wrong cwd, changed lockfile or deleted artifacts cannot.

**M06-T02.** Build failure prevents browser startup; stale unrelated server is rejected; cleanup failure remains visible.

**M06-T03.** Broken button, wrong URL, console error, popup redirect and forbidden origin produce the expected recorded failure or denial.

**M06-T04.** QA policy cannot relax spawn permission or gain writes; missing approval, cancellation and invalid duplicate checklist IDs start no worker.

**M06-T05.** Repair loop stops at 3 attempts or repeated unchanged failure and never hides prior failed checks.

**M06-T06.** New source edit after a passing test changes derived freshness to STALE while preserving the historical PASS observation.

**M06-T07.** Generated UI reload/owner switch preserves authorized state and refuses stale callbacks; a forbidden script cannot run in the trusted renderer.

**M06-G01.** M02 authority precedes recipe execution, resolving the F03/F08 forward dependency. M03 proven execution profile is required for untrusted project commands; synthetic contract fixtures can run without claiming platform proof. Every verification claim names the actual tested platform.

### Preserved implementation clauses requiring current qualification

These 22 original clauses were present in the audit ledger but omitted from the first qualification plan. They are reproduced verbatim to make the handoff self-contained. Their inclusion does not assert a new defect or authorize rebuilding preserved behavior. Checks Q01–Q22 below qualify the existing implementation and retain the separate product owners.

**M04-C01.** RequestContextV1 is already defined in packages/contracts/request-context.ts. Reuse its existing exported type and field spelling, including utf8Bytes, ContextMeasurement and nullable accountId. Preserve RequestPreparationV1 and its issued-token admission. Do not replace these with a second request-context authority. Use only fields already present or a supplemental shape explicitly specified in this block. If a requested value has no specified representation, record HOLD_CONTRACT_SHAPE with the missing field and consuming requirement; do not invent a competing interface.

**M04-S01.** Inspect the actual model request boundary and native context ownership. Instrument the text/segments that can genuinely be observed. Where the current ACP adapter exposes only flattened text, publish OPAQUE_NATIVE_CONTEXT with total bytes and known sources rather than pretending to reconstruct all role messages.

**M04-S02.** Build the compiler as a deterministic pure projection over an immutable source cut. Preserve stable ordering: host system policy and approved static definitions first, then append-only changing context. Do not insert timestamps, random IDs or volatile UI state into stable prefix segments unless protocol semantics require them.

**M04-S03.** Cache compiled segments by owner, context generation, source revision, instruction digest, registry version and model binding. Append only new eligible tail segments. Rebuild after history rewind, compaction, instruction change or workspace movement. Never reuse across account boundaries or treat source existence as grant continuity.

**M04-S04.** Discover project instructions in explicit host-approved roots. Record filename, digest, scope and precedence; load each physical file once. Resolve conflicts visibly. Symlinks outside the granted project, executable includes and unapproved hooks are refused. Instructions cannot override host authorization.

**M04-S05.** Create the deterministic TypeScript/JavaScript repository map with the TypeScript compiler already pinned in package.json. Traverse authorized files in normalized-path order; record import/export relationships and proven symbol locations only. Rank by explicit requested-path match, then referenced-symbol count descending, then normalized path and symbol ascending. Other languages return FILE_LIST_ONLY. Exclude node_modules, .git, secret paths, native history and path escapes. Do not add a graph database or another parser dependency.

**M04-S06.** Implement host-owned exposure classes DIRECT, DEFERRED, SCRIPT_ONLY and HIDDEN. Always-visible discovery returns bounded names/descriptions; describe reveals the exact admitted schema for the next request. Freeze the per-request schema digest. Hidden or denied tools remain inaccessible by raw name, script, plugin or child. This does not depend on installing arbitrary third-party plugins.

**M04-S08.** Before the next inference calculate budget from the last measured request plus unreported new tool results and reserved output. Do not count a cached token as absent context. Preserve provider-specific usage conventions and use null for unavailable components. A completed assistant turn does not trigger an unnecessary next-request compaction.

**M04-U02.** Context chips show exact file/message/session revision and preview size. Removing a chip changes the next unsent draft only. A changed source requires Refresh source or Keep captured version; it never silently replaces what the user approved.

**M04-U04.** Cache attribution is labeled measured only after M11 carries provider fields end to end. Prefix changes can be explained from local fingerprints; a vendor cache miss cause remains unknown without provider evidence.

**M05-C01.** MemoryItemV1: id, projectIdentity, scope PROJECT|USER_APPROVED, kind DECISION|CONSTRAINT|PROCEDURE|FACT|PREFERENCE, text, revision, state PROPOSED|ACCEPTED|CONFLICT|EXPIRED|DELETED, sourceRefs[], assertedBy, observedAt, expiresAt|null, supersedes[], sensitivity and reviewDecision. Text is at most 2 KiB UTF-8; sourceRefs are immutable identifiers/digests, not invented URLs.

**M05-C02.** MemorySourceRefV1: ownerThreadId, sourceKind, sourceId, sourceRevision, capturedSeq, digest and observedStatus OBSERVED|PROPOSED|REPORTED|UNCERTAIN. An agent-created item is not independently verified merely because its origin is known.

**M05-C03.** MemoryRecallV1: requestId, projectIdentity, contextGeneration, queryDigest, candidateIds[], selectedRevisions[], scores, exclusions, budgetBytes, producedAt and status COMPLETE|PARTIAL|TIMEOUT|UNAVAILABLE. A recall result cannot broaden grants or change provider/account.

**M05-S01.** Keep existing task notes and Hermes skill packages unchanged. Introduce project memory as a separate host-owned entity family. Do not simply flip memory_enabled=true in the vendored worker; that would create an unreviewed second authority and uncontrolled prompt injection path.

**M05-S02.** Bind each memory to an attested project identity rather than a user-provided path label. Require an explicit opt-in action and source scope. Cross-project sharing is off; user-wide preferences require separate confirmation. A one-task instruction must not become a global preference.

**M05-S03.** Implement immutable revisions and optimistic compare-and-swap for edits. A user correction supersedes the specified revision; retain historical provenance without using it for active retrieval. Conflicting active claims remain CONFLICT until the operator resolves them.

**M05-S04.** Implement lexical search over accepted, nonexpired, authorized items. Rank exact project/symbol overlap before recency, then stable ID for ties. Return source references and exclusions. Do not infer semantic truth or certainty from similarity. Retrieval must fit the byte cap even without a tokenizer.

**M05-S06.** Add a bounded provider adapter only after local recall works. Key state and circuit breakers by profile/project/provider. Limit one pending recall per request and refuse new work when the configured in-flight cap is reached. Cancellation cannot kill arbitrary Python threads, so account for orphaned calls and open the circuit instead of spawning indefinitely.

**M05-S08.** Consolidate only accepted changed revisions under a per-project lease and source watermark. If the inputs and validated output digest are unchanged, skip the model call. Preserve recent corrections and distinct project scopes; never regenerate deleted claims from an older summary. Use a single derived index of references rather than concatenating every memory into every request.

**M05-S12.** Expose accept/reject/edit/expire/forget operations only to authenticated user actions. Agents may propose. Accepted memory remains contextual evidence and never an approval or executable instruction source. Keep the feature default off until the scoped retrieval, correction and deletion tests pass.

**M06-S01.** Create the shared evidence contracts and tests before changing task_finish. Preserve old persisted threads with UNVERIFIED defaults. Pure conversation tasks must remain completable without code tests.

**M06-S13.** Add generated-UI endurance tests to the existing trusted catalog/worker path: schema rejection, stale binding, reload, long output, focus, cancellation and broken interactions. Do not re-enable a globally disabled generated-code capability because a few visual fixtures pass.

The reviewed old workflow could allow unexpected skips. T02 closes that evidence-integrity defect before trusting a green summary, preserving all declared historical scope. The existing M05 purge workflow is already stricter and must not be replaced or duplicated. Old payload reduction from 600 to 150 assertion still forces real native compressor per review; any reuse records rationale rather than quietly increasing/shrinking stress inputs.

### Six fixed M04 design decisions

These FIX IDs are separate from numbered M04-D tests; FIX-D04 is the preview rule, not the hidden-tool test. Exact source text follows.

**M04-FIX-D01** No new external donor, package, parser, database or runtime is approved. Use the currently pinned Hermes spill helper only when it is already callable through the existing wrapper and passes its adapter tests; otherwise implement the bounded result service in Gen-V1, not an upstream subtree transplant.

**M04-FIX-D02** Instruction precedence is host policy > user-provided task instructions > approved project instruction files. Project files are loaded from granted physical roots only, in root-to-leaf path order and lexicographic filename order within a directory. A tie at the same precedence is recorded as a visible conflict; do not ask a model to choose policy. Never execute includes/hooks.

**M04-FIX-D03** Large result ownership belongs to M04 context-results and ToolResultHandleV1. M10, M12 and M15 consume that same service. Do not place another result store in a background scheduler or kernel module. If a consuming PR already carries a private-result subset, map its fields and migrate only with a compatibility test and no active-handle loss.

**M04-FIX-D04** Use at most 16 KiB preview: first 8 KiB plus last 8 KiB, clipped at UTF-8 boundaries without duplication when the result is shorter. Include the exact omitted byte count. Expiry comes from the host retention policy; no policy means no retained full-result handle and FULL_RESULT_UNAVAILABLE, not unbounded storage.

**M04-FIX-D05** Context token arithmetic must not combine provider prompt tokens with locally estimated values under a MEASURED label. Report components separately. Cache reads/writes already have an M11 path: reuse it; do not add a competing usage schema or treat cached input as absent context.

**M04-FIX-D06** Native compaction and precompute have separate phases. Unsupported apply is visible and stays disabled. Persisting a summary is not applying it. Preserve original native history and actual pending call/result pairs.

| Fixed ID suffix | Tasks | Required check and owner |
|---|---|---|
| D01 | T01-T03 | F01: inspect dependency/donor diff; only existing callable pinned spill adapter plus its adapter tests, otherwise existing Gen-V1 service. |
| D02 | T01-T03 | F02: Q05 asserts exact precedence, physical roots, path/filename order, ties and zero hook/include execution. |
| D03 | T03-T04 | F03: canonical result-custody suites reject foreign/expired handles; #2014 proves consumer compatibility without active-handle loss. M12/M15 ownership unchanged. |
| D04 | T01,T03,T04 | F04: consume #2055 T01-T04 exact ASCII/UTF-8/short-result/omission/retention checks; no policy yields FULL_RESULT_UNAVAILABLE. |
| D05 | T03-T04 | F05: Q08/Q10 keep measured and estimated components separate, M11 cache provenance and unknown values. |
| D06 | T03-T04 | F06: consume #1027/#2050 native/precompute receipts; unsupported apply stays disabled, history and pending call/result pairs remain intact. |

## REPO_MAP

- [`.github/workflows/ci.yml`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/.github/workflows/ci.yml)
- [`.github/workflows/m05-purge-qualification.yml`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/.github/workflows/m05-purge-qualification.yml)
- [`scripts/test-browser.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/test-browser.ts)
- [`scripts/public-source-files.json`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/public-source-files.json)
- [`packages/contracts/implementation-evidence.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/implementation-evidence.ts)
- [`tests/hermes-original-integration.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/hermes-original-integration.test.ts)
- [`tests/generated-ui-endurance-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/generated-ui-endurance-v3.test.ts)
- [`docs/implementation/v3/M04-verification.json`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M04-verification.json)
- [`docs/implementation/v3/M05-verification.json`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M05-verification.json)
- [`docs/implementation/v3/M06-verification.json`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M06-verification.json)

### Entry points for Q01–Q22

The following paths were verified at the audit baseline. They are starting points for exact-case discovery, not assertions that every new check has already been executed or that every listed test covers its entire row. T01 must open each relevant assertion and trace its actual caller; missing cases remain explicit coverage gaps. Existing product source files are read-only to this qualification scope unless a separately accepted implementation assignment says otherwise.

- [`packages/contracts/request-context.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/request-context.ts)
- [`packages/core/request-custody.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/request-custody.ts)
- [`packages/runtime-hermes/context.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/runtime-hermes/context.ts)
- [`packages/runtime-hermes/index.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/runtime-hermes/index.ts)
- [`packages/core/service.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts)
- [`tests/context-request-observation.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/context-request-observation.test.ts)
- [`tests/context-contract-preservation-v6.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/context-contract-preservation-v6.test.ts)
- [`packages/core/context-compiler.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/context-compiler.ts)
- [`packages/core/host-context-projection.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/host-context-projection.ts)
- [`tests/context-compiler-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/context-compiler-v3.test.ts)
- [`packages/core/approved-project-context.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/approved-project-context.ts)
- [`packages/core/instruction-manifest.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/instruction-manifest.ts)
- [`tests/context-discovery-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/context-discovery-v3.test.ts)
- [`packages/workspace/repo-map.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/workspace/repo-map.ts)
- [`packages/core/repository-map-host.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/repository-map-host.ts)
- [`tests/repo-map.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/repo-map.test.ts)
- [`tests/repository-map-host.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/repository-map-host.test.ts)
- [`packages/core/context-tool-discovery.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/context-tool-discovery.ts)
- [`packages/core/context-progressive-tools.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/context-progressive-tools.ts)
- [`tests/fixtures/m04-context-v3.json`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/fixtures/m04-context-v3.json)
- [`packages/runtime-hermes/context-budget.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/runtime-hermes/context-budget.ts)
- [`packages/contracts/model-request.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/model-request.ts)
- [`apps/web/src/ContextInspector.tsx`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/ContextInspector.tsx)
- [`tests/compaction-model-requests.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/compaction-model-requests.test.ts)
- [`tests/e2e/usage-context.spec.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/e2e/usage-context.spec.ts)
- [`apps/web/src/SourceWorkbench.tsx`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/SourceWorkbench.tsx)
- [`packages/core/source-workbench.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/source-workbench.ts)
- [`tests/source-workbench-host-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/source-workbench-host-v3.test.ts)
- [`packages/contracts/project-memory.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/project-memory.ts)
- [`packages/core/project-memory.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/project-memory.ts)
- [`apps/server/project-memory-routes.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/project-memory-routes.ts)
- [`tests/project-memory-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/project-memory-v3.test.ts)
- [`tests/project-memory-http-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/project-memory-http-v3.test.ts)
- [`tests/project-memory-file-sources-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/project-memory-file-sources-v3.test.ts)
- [`packages/core/memory-retrieval.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/memory-retrieval.ts)
- [`packages/core/project-memory-host.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/project-memory-host.ts)
- [`tests/memory-retrieval-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/memory-retrieval-v3.test.ts)
- [`tests/project-memory-service-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/project-memory-service-v3.test.ts)
- [`packages/core/capability-flags.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/capability-flags.ts)
- [`packages/core/memory-consolidation.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/memory-consolidation.ts)
- [`tests/memory-consolidation-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/memory-consolidation-v3.test.ts)
- [`packages/core/verification-gate.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/verification-gate.ts)
- [`packages/core/verification-read-models.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/verification-read-models.ts)
- [`apps/server/code-intelligence-routes.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/code-intelligence-routes.ts)
- [`tests/verification-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/verification-v3.test.ts)
- [`tests/verification-read-models-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/verification-read-models-v3.test.ts)
- [`tests/verification-evidence-owner-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/verification-evidence-owner-v3.test.ts)
- [`tests/verification-artifact-gate-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/verification-artifact-gate-v3.test.ts)
- [`packages/ui-shell`](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/ui-shell)
- [`tests/e2e/host-loop.spec.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/e2e/host-loop.spec.ts)

## DESIGN

First compare current existing CI matrix with exact #737 workflow and #782 installed lane. Reuse an existing compatible lane or restore only a missing standalone matrix after scope approval; no duplicate runner by title. Immutable checkout ref must equal declared source SHA; lockfile/dependency/source blobs and runtime/browser identities travel with artifacts. Enforce required case existence and outcome, not merely exit code 0 or nonzero total. Every pending/todo/skip is either forbidden or an explicit per-platform named allowlist whose required counterpart executes elsewhere. Artifact validators are integrity checks and cannot turn NOT_RUN or failed scenarios into product acceptance. Current source status and runtime/native/installed/live scopes are separate dimensions.

Q01–Q22 expand the qualification inventory without changing the product ownership boundary. Each check receives an exact source/case/platform receipt or a named missing-case or unavailable-proof hold. Do not use test titles, source existence, a schema validator or historical green CI as a substitute for the observed behavior. #1975 retains current source/context UI state work; #1972 retains stale evidence claims; #1026 retains installed memory; #1027 retains installed/native compaction; #1030 and PR #1421 retain production verification and classification. Optional external memory provider proof remains separately gated by HOLD_APPROVED_PROVIDER.

## EXECUTION_DAG

### T01: Compare old stack with current matrix and owners

Depends on: none. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Current immutable cut, old source d3363d3b/c937d590, merged #801/#804/#805 and #976, related product gap issues.

**Files and concrete edits:** Read #737/#782 current diff/comments; compare ci.yml, workflow definitions, public-source manifest and exact source profiles; read all #1028 historical checkpoints.

**Operation and output:** List each retained assertion and producing lane. Classify old changes as present, intentionally removed, missing or superseded; do not retarget stacked branches before comparison. Keep all named successful/cancelled runs with original cuts.

**Positive, negative, cancellation and recovery checks:** No missing suite path can count pass. A newer SHA without equivalent source blobs is a new qualification, not a reused result.

**Done criterion:** Exact test/command/source ownership matrix and minimal runner delta accepted.

**Q01–Q22 executable inventory:** For every named check in the acceptance table, open its exact baseline source and listed test assertions, then record requirement ID, production caller, actual case title, fixture, platform, expected positive/negative/cancel/recovery outcome and producing owner. Distinguish a complete existing assertion from a partially covered requirement; do not copy the ledger locator as proof without reading it. Recheck the current owner/PR state of #1026, #1027, #1030/#1421, #1972 and #1975. Missing actual-App or native cases stay pending with that owner. Deliver the complete 22-row inventory to T02; a missing case has an explicit next owner and cannot disappear from the matrix.


### T02: Make required-case qualification strict

Depends on: T01. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Target Linux/Windows case identities, configured browser channel, pinned Python/native dependencies and reviewed setup action.

**Files and concrete edits:** Existing chosen workflow and summary parser; scripts/public-source-files.json source/runtime as appropriate. Restore absent m04-m06 qualification file only if T01 establishes need.

**Operation and output:** Reject zero tests, failed suites, missing named cases and unexpected skipped/pending/todo in every required group. If a legitimate platform skip exists, serialize exact case, reason and required other-platform receipt. Scope triggers/manual dispatch so exact product source can be qualified without a YAML-only change. Preserve content-read-only permissions and immutable action/dependency pins; no unreviewed donor/toolchain.

**Positive, negative, cancellation and recovery checks:** Inject fixtures with one skipped/todo/missing/duplicate case and verify FAIL, not PASS_WITH_DECLARED_SCOPE. Cancelled job is CANCELLED. Wrong source SHA/hash stops before tests; absent Windows case blocks Windows, not unrelated pure Linux source checks.

**Done criterion:** Summary cannot report required PASS if any named required case was unexecuted or silently skipped.

**Q01–Q22 required-case enforcement:** Add the T01 case identities to the chosen qualification lane and its external acceptance index using existing approved evidence representations. Keep strict persisted evidence schemas unchanged unless a separately accepted contract change exists. Exercise the parser with a missing Q-row, missing named case, duplicate case, wrong source hash and unexpected skip; none may become a required PASS. Pure fixtures, current App, native, installed and live evidence retain separate statuses. A platform not exercised is NOT_RUN/BLOCKED and has a named responsible lane. If an assertion is missing, coordinate the smallest test-only delta with its existing owner before claiming it; product repair remains outside this issue.


### T03: Run the exact immutable targeted platform matrix

Depends on: T02. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Provisioned exact toolchain/native/browser prerequisites, approved test fixture flags, actual source manifest and expected-failure fixtures.

**Files and concrete edits:** Run existing suites named below and current registered browser suites without source mutation. Use actual supported Linux and Windows runners.

**Operation and output:** Retain separate output for each group and platform, including native protected compaction and generated UI. Record actual expected-failure assertion and repaired result. Do not replace native credential build with no-lease tests. Full commands each have independent receipt.

**Positive, negative, cancellation and recovery checks:** Wrong generation, account, model, grant, byte bound and stale source denials count actual dispatch/effect. Interrupt tests preserve status/artifact; rerun gets new run identity. Native Windows skips cannot be represented as a Linux PASS.

**Done criterion:** Each required test has actual exact-platform status and artifact hash; missing platform stays BLOCKED.

**Q01–Q22 execution and receipts:** After provisioned setup and T02, run the existing targeted suites below on their applicable exact platforms and record the actual cases observed for each Q-row. For each positive case retain the corresponding denial or stale/cancel case required by the table; record dispatch/mutation/call counts where the boundary is the assertion. Use the registered actual-App suites for usage/cache and trusted generated UI. Obtain current-App source-chip receipts from #1975 and installed/native receipts from #1026/#1027 rather than substituting a mock. A missing provider field stays null; an unavailable native or installed lane stays held. No external provider is contacted without the separate explicit authorization required by its owner.


### T04: Reconcile product and native/installed/live boundaries

Depends on: T03. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Current product receipts from their separate owners, legacy V3/older evidence formats and strict implementationEvidenceV3Schema.

**Files and concrete edits:** #1027 App/native compaction; #1026 installed memory; #1030 executor/repair; #774 confinement; new C5 and memory live plans; #1972 evidence docs.

**Operation and output:** Preserve historical receipts, write current source-bound coverage with exact observed status and remainingGates, and never embed computed bundleStatus into strict persisted evidence. Legacy M06 waived platform status cannot satisfy required current case. Keep cost null and outstanding live measurements NOT_RUN.

**Positive, negative, cancellation and recovery checks:** Integrity valid evidence with missing product cases must yield incomplete bundle. Claimed source file missing or mismatched hash is rejected. Deleted workflow/test does not become implemented because its commit is an ancestor.

**Done criterion:** All rows distinguish current implementation vs qualified scenario vs activation; no blanket complete from green workflow.

**Q01–Q22 owner reconciliation:** Join each check to its exact executed receipt or explicit hold, retaining original requirement text and the distinction between implemented source and accepted behavior. For Q08/Q10, coordinate stale M11/evidence statements with #1972 and do not manufacture cache or token measurements. For Q09, retain #1975 current-App custody. For Q13/Q17/Q20, #1026 must provide the independent installed-memory results; core success cannot close that lane. Q18 can qualify local/synthetic adapter bounds while external provider activation stays disabled. Q21 consumes the accepted #1030/#1421 source only after current ownership and merge state are verified, never duplicates the classification fix. Q22 never changes the global generated-code default. Hand the complete status/owner matrix to T05; unresolved product cases remain PARTIAL/BLOCKED.


### T05: Release evidence ownership and retain rollback posture

Depends on: T04. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Source manifest, all raw failed/cancelled/pass receipts, explicit unresolved owners/inputs and exact next steps.

**Files and concrete edits:** Canonical issue journal and then-authorized evidence index; no production code activation.

**Operation and output:** Append read-back-verified checkpoint, link each independent gap, release owner NONE. Keep flags false and historical artifacts; no concurrent branch cleanup or merge claimed by this issue.

**Positive, negative, cancellation and recovery checks:** Final source equality check; every planned command marked actual or NOT_RUN; stale/unavailable evidence remains visible.

**Done criterion:** Canonical issue contains reconstructable matrix and no hidden remaining platform/live gate. Q01–Q22 each has its exact requirement, named case, observed result or hold, source/artifact identity and remaining owner. The previous complete plan revision/hash remains in history; missing co-owner evidence prevents complete qualification.

## VALIDATION

### Setup and command discipline

Observed audit environment: Node 24.22.3 satisfies `>=24.10.0`; provisioned pnpm 11.25.0 does not match required 10.30.3; there is no node_modules tree. `COREPACK_ENABLE_NETWORK=0 corepack pnpm --version` cannot resolve an already-provisioned 10.30.3. All current product test commands are NOT_RUN, reason HOLD_TOOLCHAIN. No package, toolchain or browser was downloaded and no repository file was modified. A missing dependency is an infrastructure hold, not an expected failing assertion.

Future executor must first record `git rev-parse --show-toplevel`, `git remote get-url origin`, `git status --porcelain=v1 --untracked-files=all`, `git branch --show-current`, `git worktree list --porcelain`, `git rev-parse HEAD`, `node --version` and `pnpm --version` separately. Read the then-current package.json, lockfile, consumed contracts and owner journal. Use installed matching pnpm or an already provisioned matching Corepack resolution. If neither exists, keep HOLD_TOOLCHAIN; no download is authorized by v6. Frozen existing-lockfile dependency setup is allowed only under the future implementation's setup authorization. Never substitute a different version or use --passWithNoTests.

Run required asset steps as separate observed commands before targeted tests: `pnpm build:credential-lease` and `pnpm build:widgets`. A platform incapable of the native build may execute a separately labeled pure targeted diagnostic but cannot substitute `test:no-lease` for the required `pnpm test` gate. After focused tests run, retain individual receipts for `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:browser`. Do not change timeout, skip, browser channel or expected assertion to hide a failure. Planned commands below were not executed in this audit.

Receipts name the immutable source SHA/tree, source and dependency blob hashes, Node/pnpm/OS/architecture/browser/native adapter, flag injection, exact command, start/end UTC, exit or cancellation, actual test case identities, passed/failed/skipped counts, and bounded artifact SHA-256. Preserve every baseline failure, cancellation, unknown settlement and unavailable cost. Platform-specific skips are declared individually and never fulfill required gates. Evidence integrity validation is separate from product acceptance.

### Focused commands

```sh
pnpm exec vitest run tests/context-compiler-v3.test.ts tests/context-results-v3.test.ts tests/compaction-v3.test.ts tests/context-contract-preservation-v6.test.ts
pnpm exec vitest run tests/project-memory-service-v3.test.ts tests/memory-retrieval-v3.test.ts tests/memory-consolidation-v3.test.ts tests/memory-forget-v3.test.ts
pnpm exec vitest run tests/verification-v3.test.ts tests/verification-executor-binding.test.ts tests/verification-executor.test.ts tests/browser-verification-v3.test.ts tests/qa-delegation-v3.test.ts tests/generated-ui-endurance-v3.test.ts
pnpm exec vitest run tests/hermes-original-integration.test.ts
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:browser
# Use the existing reviewed target-platform workflow after T01/T02; do not launch a CI rerun from this read-only audit.
```

Additional existing suites required by the Q01–Q22 inventory, after T01 verifies current registration and T02 fixes case accounting:

```sh
pnpm exec vitest run tests/context-request-observation.test.ts tests/context-discovery-v3.test.ts tests/repo-map.test.ts tests/repository-map-host.test.ts tests/source-workbench-host-v3.test.ts tests/compaction-model-requests.test.ts
pnpm exec vitest run tests/project-memory-v3.test.ts tests/project-memory-http-v3.test.ts tests/project-memory-file-sources-v3.test.ts
pnpm exec vitest run tests/verification-read-models-v3.test.ts tests/verification-evidence-owner-v3.test.ts tests/verification-artifact-gate-v3.test.ts
```

The existing registered browser run must include `tests/e2e/usage-context.spec.ts` and `tests/e2e/host-loop.spec.ts`; inspect `scripts/test-browser.ts` and the current registry/config in T01 before choosing any targeted invocation. Do not invent a Playwright config or weaken the existing `pnpm test:browser` gate. Source-chip App coverage remains with #1975 unless its current owner explicitly delegates the exact assertion. These commands and browser cases are planned, not executed by this audit.

### Acceptance matrix

| Requirement | Tasks | Required observable result |
|---|---|---|
| All listed M04 T/D | T02, T03 | Every fixed compiler/disclosure/handle/UTF8/CAS/observer case executes on applicable exact source; native cases distinct. |
| All listed M05 T | T02, T03 | Scope/correction/Forget/provider hang/unchanged-input zero-call/secret-source negatives execute, not skipped. |
| All listed M06 T | T02, T03 | Observed evidence/browser/QA/repair/stale/generated UI cases execute; platform and production integration explicit. |
| M04/M05/M06 G01 | T03, T04 | Actual platform proof separate from pure fixture and installed/live gates, no waiver as PASS. |

### Q01–Q22 exact requirement-to-check mapping

Every row below is required for the current qualification handoff. The listed suite/fixture is a verified entry point; T01 records the actual assertion after reading it. Q-identifiers are plan acceptance IDs, not new persisted product-schema fields. All rows were NOT_RUN during this audit. T01 inventories, T02 enforces case accounting, T03 executes or consumes the named owner receipt, T04 reconciles scope, and T05 releases the complete matrix.

| Check | Original clause | Task IDs | Required positive, negative and recovery observations | Existing suite/fixture entry points | Ownership and proof boundary |
|---|---|---|---|---|---|
| Q01 | M04-C01 | T01, T02, T03 | Validate exact RequestContextV1 field spelling, nullable accountId and existing ContextMeasurement; the unchanged RequestPreparationV1 identity admits an identical retry only once. Altered prompt, owner or issued token is rejected before native dispatch. An unspecified field remains HOLD_CONTRACT_SHAPE, never a competing authority. | `tests/context-contract-preservation-v6.test.ts`; `tests/context-request-observation.test.ts` | #1028 qualifies existing custody; product fixes require a separately claimed scope. |
| Q02 | M04-S01 | T01, T03, T04 | Read the actual Service-to-runtime observation path. Assert observable bytes and known sources match the captured request; a flattened native context is labeled OPAQUE_NATIVE_CONTEXT and does not acquire invented role messages. Changed owner or stale observation cannot become the current view. A scripted adapter is not native proof. | `tests/context-request-observation.test.ts`; `tests/context-contract-preservation-v6.test.ts` | #1028 records the adapter/platform scope; #1027 retains native compaction and installed acceptance. |
| Q03 | M04-S02 | T01, T02, T03 | Compile the same immutable cut repeatedly and require byte-identical output and stable policy/static prefix ordering. Append changing context only after that prefix; vary timestamps, random values and unrelated UI state and confirm they do not contaminate stable segments. Mutating caller data after capture must not change the retained cut. | `tests/context-compiler-v3.test.ts`; `tests/context-request-observation.test.ts` | #1028 qualifies preserved compiler behavior; no replacement native history. |
| Q04 | M04-S03 | T01, T02, T03 | For an unchanged identity, assert only the eligible appended tail is read. Independently vary owner/account, generation, source revision, instruction digest, registry, model, grant continuity and workspace; require invalidation or refusal. Rewind and compaction rebuild from the new cut rather than reusing stale source. | `tests/context-compiler-v3.test.ts`; `tests/context-request-observation.test.ts` | #1028 owns the case matrix; #1027 owns actual native compaction acceptance. |
| Q05 | M04-S04 | T01, T02, T03 | An approved physical instruction file is read once with filename, digest and scope. Assert host policy > user task instructions > approved project files, root-to-leaf paths and lexicographic filenames within each directory; equal-precedence ties are visible conflicts, never model-selected policy. Symlink escape, unapproved root, executable include and hook inputs are refused with zero unauthorized reads/effects. Project instructions cannot expand a host grant. | `tests/context-discovery-v3.test.ts`; `tests/context-request-observation.test.ts` | #1028 qualifies existing discovery and authorization behavior. |
| Q06 | M04-S05 | T01, T02, T03 | Require stable normalized traversal and exact requested-path, referenced-symbol, path and symbol ordering. Verify reported TS/JS symbols and import/export locations against the fixture bytes; another language returns FILE_LIST_ONLY. node_modules, .git, secrets, native history and path escapes yield no authorized map entries. Record the existing pinned TypeScript version; no parser or graph dependency is added. | `tests/repo-map.test.ts`; `tests/repository-map-host.test.ts`; `tests/context-discovery-v3.test.ts` | #1028 qualifies existing map; observed failures are routed without widening this runner scope. |
| Q07 | M04-S06 | T01, T02, T03 | Check all four exposure classes, bounded search/description and exact next-request schema digest. A describe call affects only a fresh admitted request snapshot. Hidden or denied names invoked directly, by script, plugin or child cause zero external dispatch; changing a grant after describe still denies the call. Keep the 100/500-tool fixture and catalog-byte comparison. | `tests/context-discovery-v3.test.ts`; `tests/context-contract-preservation-v6.test.ts`; `tests/fixtures/m04-context-v3.json` | #1028 qualification consumes existing M02 authority; arbitrary plugin installation is excluded. |
| Q08 | M04-S08 | T01, T03, T04 | Use the last measured request, newly unreported tool results and reserved output for the next-inference budget. Cached input remains context. Exercise missing tokenizer and unavailable provider components: keep BYTE_ONLY/null rather than inventing normalized tokens or reserve. A completed turn alone starts no unnecessary compaction. Compare actual provider fields separately from byte accounting. | `tests/context-compiler-v3.test.ts`; `tests/context-request-observation.test.ts`; `tests/compaction-model-requests.test.ts`; `tests/e2e/usage-context.spec.ts` | #1972 owns stale M11/evidence claims; current incomplete measurements stay PARTIAL. #1028 records exact observed scope. |
| Q09 | M04-U02 | T01, T03, T04 | Record displayed captured file/message/session revision and preview byte size. Remove a chip and prove only the next unsent draft changes; admitted/historical bytes remain immutable. After source mutation, require explicit Refresh source or Keep captured version; stale callbacks and owner switches must not silently replace the approved cut. Host tests alone do not certify the current App interaction. | `tests/source-workbench-host-v3.test.ts`; `tests/context-request-observation.test.ts` | #1975 retains source/context UI state work; #1028 consumes source-bound current-App receipts or records that lane NOT_RUN. |
| Q10 | M04-U04 | T01, T03, T04 | For a real recorded request, show measured cache attribution only when M11 provider fields reach the read model and App. Missing cache components remain unknown, including across restart; known zero remains zero. A local prefix fingerprint can explain a local change but cannot invent a vendor cache-miss cause. | `tests/compaction-model-requests.test.ts`; `tests/e2e/usage-context.spec.ts`; `tests/context-request-observation.test.ts` | #1972 owns stale documentation reconciliation; #1028 qualifies actual field provenance without claiming unavailable provider evidence. |
| Q11 | M05-C01 | T01, T02, T03 | Validate every listed MemoryItemV1 field and enum, nullable expiry, immutable revision/source references and review state. Accept a valid 2 KiB UTF-8 boundary item; reject oversized text or fabricated source identifiers/digests. A proposed, expired, conflicting or deleted item cannot become active accepted recall by schema validity alone. | `tests/project-memory-v3.test.ts`; `tests/project-memory-http-v3.test.ts`; `tests/project-memory-file-sources-v3.test.ts` | #1028 qualifies the existing host-owned entity; no new memory authority. |
| Q12 | M05-C02 | T01, T02, T03 | Keep ownerThreadId, kind, source ID/revision, captured sequence, digest and observed status tied to the exact admitted source. Mutated, foreign, unselected or unhandled sources are refused. Preserve PROPOSED/REPORTED/UNCERTAIN provenance; an agent-created source does not become OBSERVED or independently verified merely because its origin is known. | `tests/project-memory-file-sources-v3.test.ts`; `tests/project-memory-v3.test.ts`; `tests/project-memory-http-v3.test.ts` | #1028 qualifies source custody; genuine current host capture is distinct from a seeded installed fixture. |
| Q13 | M05-C03 | T01, T02, T03, T04 | Validate the complete MemoryRecallV1 request/project/generation/query, candidates, selected revisions, scores, exclusions, byte budget, timestamp and status fields. COMPLETE/PARTIAL/TIMEOUT/UNAVAILABLE remain distinguishable. Wrong or changed provider/account/owner cannot enter the current prepared request or broaden grants; cancellation and a late result publish no stale current recall. | `tests/memory-retrieval-v3.test.ts`; `tests/project-memory-service-v3.test.ts` | #1026 retains enabled installed recall acceptance; #1028 qualifies core host behavior and records installed evidence separately. |
| Q14 | M05-S01 | T01, T02, T03 | Trace authenticated commands to the single host project-memory family. Confirm capability defaults remain off and vendored worker memory is not enabled. Existing task notes and Hermes skill packages retain their behavior and storage; disabling injection still permits authorized historical memory review. | `tests/project-memory-v3.test.ts`; `tests/project-memory-http-v3.test.ts`; `tests/project-memory-file-sources-v3.test.ts` | #1028 verifies separation and defaults; no vendored-worker configuration change. |
| Q15 | M05-S02 | T01, T02, T03 | An attested project identity plus explicit user opt-in and selected source scope admits the intended project. A path label, moved working copy, unselected conversation or another project/account does not. User-wide preference needs separate confirmation; a one-task instruction stays task-scoped. Cross-project sharing remains disabled. | `tests/project-memory-v3.test.ts`; `tests/project-memory-file-sources-v3.test.ts`; `tests/project-memory-http-v3.test.ts` | #1028 qualifies ownership/opt-in and denial cases; no sharing activation. |
| Q16 | M05-S03 | T01, T02, T03 | A correction supersedes only the specified immutable revision and retains historical provenance. Concurrent edits produce explicit CONFLICT with neither revision lost; old or unresolved conflicting claims are excluded from active retrieval. Repeat/restart cannot promote stale state or overwrite the correction. | `tests/project-memory-v3.test.ts`; `tests/project-memory-http-v3.test.ts` | #1028 owns qualification; #1026 retains installed lifecycle proof. |
| Q17 | M05-S04 | T01, T02, T03, T04 | Run accepted/nonexpired/current-source fixtures and require exact project/symbol overlap before recency, then stable ID ties. Preserve source references and exclusions within the complete UTF-8 byte cap without a tokenizer. Foreign, expired, unaccepted and missing-source items are absent. A similarity score is not truth, authority or certainty. | `tests/memory-retrieval-v3.test.ts`; `tests/project-memory-service-v3.test.ts` | #1026 retains enabled installed behavior; the separate live memory study owns measured usefulness/cost. |
| Q18 | M05-S06 | T01, T02, T03, T04 | Using the existing local/synthetic adapter fixtures, prove circuit and state isolation by profile/project/provider, one pending recall per request and the configured physical in-flight bound. A hung call remains accounted after cancellation; immediate retry cannot create an unbounded orphan. Cross-profile late results are discarded. Missing approved external provider/egress remains HOLD_APPROVED_PROVIDER. | `tests/memory-retrieval-v3.test.ts`; `tests/project-memory-service-v3.test.ts` | #1028 qualifies bounded adapter semantics only; optional external embeddings/provider activation remains disabled and is not required for lexical-memory PASS. |
| Q19 | M05-S08 | T01, T02, T03 | Unchanged accepted inputs and validated output digest produce zero additional model calls. Changed revisions publish only under the current per-project lease and source watermark. Cancellation, stale watermark, correction, deletion and cross-project changes cannot publish an old summary or revive deleted claims. Keep one derived reference index rather than full-memory concatenation. | `tests/memory-consolidation-v3.test.ts`; `tests/project-memory-v3.test.ts` | #1028 qualifies existing consolidation; live provider/cost study remains separately owned. |
| Q20 | M05-S12 | T01, T02, T03 | Accept/reject/edit/expire/forget require authenticated user origin/session/CSRF and exact current scope. Agent proposals cannot perform review mutation, create an approval or execute memory text. Unauthorized or replayed stale actions yield zero unauthorized mutation. Default-off flags remain false until separately approved gates are met. | `tests/project-memory-http-v3.test.ts`; `tests/project-memory-v3.test.ts`; `tests/project-memory-file-sources-v3.test.ts` | #1028 qualifies user-only authority; #1026 retains installed Forget/physical-retention acceptance. |
| Q21 | M06-S01 | T01, T02, T03, T04 | Read the existing shared evidence contracts and old-thread fixtures before any task_finish change. A persisted legacy thread defaults to UNVERIFIED; a pure conversation remains completable without code tests. Current-source/owner/artifact evidence is required for code verification, and stale/advisory/missing evidence cannot create PASS. Fresh FAIL/BLOCKED/CANCELLED observations stay distinct from missing evidence when the separate classification fix is accepted. | `tests/verification-v3.test.ts`; `tests/verification-read-models-v3.test.ts`; `tests/verification-evidence-owner-v3.test.ts`; `tests/verification-artifact-gate-v3.test.ts` | #1030 and open PR #1421 retain product/classification ownership. Record their then-current source/merge state; no duplicate computeAssessment repair here. |
| Q22 | M06-S13 | T01, T02, T03, T04 | On the existing trusted catalog/worker path, reject malformed schema and oversized/broken interaction updates; exercise stale binding, reload, owner switch, long output, focus and cancellation. Authorized repaired actions and retained state work; stale callbacks and forbidden script cannot execute in the trusted renderer. Collect current App browser evidence separately from pure catalog fixtures and leave globally disabled generated-code capability off. | `tests/generated-ui-endurance-v3.test.ts`; `tests/e2e/host-loop.spec.ts` | #1028 qualifies trusted-path endurance; it does not enable a global capability or restore retired UI architecture. |

### Release gates and rollback

HOLD_TOOLCHAIN now and any required missing native/browser/Windows prerequisite remains the named platform hold. #774 governs approved Windows untrusted-command confinement. Installed/live/user-visible join requirements remain with their focused owners and cannot be waived by this runner. No unsupported package upgrade, retry policy, increased timeout or test weakening. Preserve #1028 previous body and all named runs unchanged.

## STATE

All T01 and later implementation tasks are NOT_STARTED. This audit performed source tracing, original-clause extraction, issue/PR body and discussion comparison, path/reference verification and clean-tree checks only. Product tests, Windows installed tests, live model calls and activation are NOT_RUN. Implementation scope and execution owners must be claimed in the canonical issue before future changes. Next step is T01 after coordinator publishes this complete plan and confirms current owner/source; blocked inputs are not guessed. Preserve ordinary working code, all native histories, accepted memory, tombstones and prior failed observations across rollback.

## REFERENCES

- [Pinned source](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b)
- [Parent audit and read-only scope](https://github.com/skytuhua-org/Gen-V1/issues/1992)
- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)

## PRESERVED PRIOR CANONICAL BODY

The following previous body is retained verbatim. The current-source findings and tasks above supplement its obligations; earlier append-only comments remain authoritative historical receipts with their original source limits. Stale branch states in the preserved text do not override the explicit current-state comparison above.

<!-- m-series-scope:m04-m06-immutable -->
## Outcome and scope

Shared qualification of immutable M04–M06 sources on the existing #737 stack. Individual M04, M05 and M06 product changes and installed acceptance keep independent evidence.

## Completion criteria

- [ ] **T01** Map the pinned input stack and distinguish already merged or superseded changes from the remaining workflow/evidence scope.
- [ ] **T02** Review immutable Linux and Windows evidence against the exact retained source. Preserve cancelled runs and file any platform-specific blockers with the owning issue.
- [ ] **T03** Decide review/merge disposition for the verified scope, including #782's base dependency, without duplicating runner work.

## Ownership and current state

Existing owner or dependency owner: Existing qualification stack owner. #737 is still draft on its stacked base. #782 depends on it. Historical older component work is tracked as leads, without implied ownership change.



## References

- [PR #737](https://github.com/skytuhua-org/Gen-V1/pull/737)
- [PR #782](https://github.com/skytuhua-org/Gen-V1/pull/782)
- [docs/implementation/v6/M04/requirements.json](https://github.com/skytuhua-org/Gen-V1/blob/5cde22a7d48cc0a5f0f24884f862e64781575ebd/docs/implementation/v6/M04/requirements.json)

Issue body revision `issue-body-r1`. Use append-only checkpoints for evidence and handoffs. Existing ownership, review requirements and release permissions apply.


### Prior journal preserved in GitHub

- [7026913211](https://github.com/skytuhua-org/Gen-V1/issues/1028#issuecomment-7026913211): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7033319415](https://github.com/skytuhua-org/Gen-V1/issues/1028#issuecomment-7033319415): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7036608984](https://github.com/skytuhua-org/Gen-V1/issues/1028#issuecomment-7036608984): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7045961139](https://github.com/skytuhua-org/Gen-V1/issues/1028#issuecomment-7045961139): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7051230563](https://github.com/skytuhua-org/Gen-V1/issues/1028#issuecomment-7051230563): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7057857664](https://github.com/skytuhua-org/Gen-V1/issues/1028#issuecomment-7057857664): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
