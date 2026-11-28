# M04: Connect approved auxiliary shadow/precompute and qualify paired live measurements

## META

Repository: `skytuhua-org/Gen-V1` (ID 1442565952). Plan revision: `m0406-audit-r1-readability-r1`, 2026-11-24 UTC. Exact inspected baseline: `9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Parent audit: [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992). Planning reviewer: `codex-cloud-m0406-e3d038`. This reviewer holds no implementation ownership; existing claims remain authoritative. No branch, worktree, PR or activation was created by this audit. This document is an executable future plan, not permission to run a provider, alter the repository or activate a capability during the read-only audit.

Attachment limitation observed by the parent publisher: GitHub filechooser upload failed. The complete UTF-8 Markdown body is the publication fallback; these actual .md files remain separate review deliverables. No GitHub attachment success is claimed and no repository-docs write or commit is authorized.

The authoritative inputs are the user-supplied *Audited Execution-Controlled Prompts v6* (2026-11-16), its *Completion Followups* appendix (2026-11-18), and *Expanded Source Research UX Memory Performance v3* (2026-11-14). The complete relevant clauses are reproduced below. v6 controls acceptance; the appendix orders remaining work; research §§19-26 explains the experiment/evidence design. An existing helper, merged commit, valid evidence JSON or passing synthetic test is not production/native/live acceptance.

Read [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md) and [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md) before future implementation. Claim only this issue's task IDs, append and read back every checkpoint, retain one concern and one owner per edit set, and RELEASE OWNER=NONE before stopping. User authorization in this audit covers planning/publication only. Future implementation needs its own task scope; do not resurrect retired architecture without an explicit accepted product decision. M12 and M14 belong to other active owners.

Canonical routing: [2050](https://github.com/skytuhua-org/Gen-V1/issues/2050), published after source and duplicate review under #1992.

## OBJECTIVE

Complete the narrowly outstanding C5 host integration and evidence lane while preserving deterministic C1-C4. A real approved auxiliary request must have one immutable cut, one physical owner, measured or explicitly unknown cost, and no authority to alter the foreground request. This plan does not authorize pruning, precompute activation or a provider call.

### Actual baseline finding

`createShadowRelevancePhase` at context-relevance.ts:50 and `createPrecomputeExperiment` at context-compaction.ts:109 are defined and covered by injected tests but have no callers in apps/packages. The production context-relevance-host metadata observer is advisory byte bookkeeping, not the required approved model/account shadow execution. The v6 continuation handoff explicitly names the missing auxiliary route. #801 merged immutable snapshot and timed-out-call ownership fixes; preserve them. M04 verification records a future-dated auxiliary summary as unverified and NOT_RUN, not ten actual calls. No approved current account/model/call or monetary budget was supplied.

## REQUIREMENTS

**M04-S09.** Implement the relevance observer as an opt-in shadow phase. One observer may examine one eligible immutable source cut; it may not delete, reorder or alter the foreground request. The fixed timeout is 6 seconds. Without an explicit approved model/account and auxiliary-call budget, return OBSERVER_UNAVAILABLE and make no model call. Record this phase as blocked, while deterministic compiler and disclosure tests continue.

**M04-S12.** Experimental precomputation is OFF by default. Prepare one summary from a fixed prefix while newer messages accumulate; at use time reject changed start/instructions/model or an oversized retained tail. Account for every failed/discarded background call. Never race a second compaction or silently mutate active context.

**M04-S13.** Run the fixed paired fixtures and report every outcome. Deterministic fixtures must retain all seeded unresolved constraints and complete tool-call/result pairs. Live quality and cost require an explicitly authorized provider fixture; without it, leave those measurements NOT_RUN. This implementation prompt never authorizes activating pruning or precomputation, even when an offline fixture improves.

**M04-T06.** Precompute races with rewind, new instruction, cancellation and a long new tail discard the candidate. Failed background calls remain in cost accounting.

**M04-T07.** Shadow relevance scoring leaves model-visible input byte-for-byte unchanged.

**M04-D05.** Shadow and compaction. Observer failure leaves foreground request bytes unchanged; a stale native-compaction binding never calls the apply operation.

**M04-G01.** Pure projection and read-only discovery require M01/M02 core. Project-executing servers require M03 executable proof. Actual native compaction and background precompute require adapter-specific runtime tests; no requirement to build safe rename first.

**M04-G02.** Host-owned flags: context.compilerV1, tools.deferredV1, context.lossAwareCompactionV1, context.precomputeExperimentV1. Add only missing keys to the existing owner registry without replacing other registered keys; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M04-G03.** Rollback: Disable injections and experimental precompute, cancel observers and retain original native history. Keep referenced result artifacts until retention expiry; do not replace active sessions from a failed summary.

Fixed M04 decisions retained: no new donor/dependency; M04 owns private result custody; preview is first/last 8 KiB within 16 KiB UTF-8; provider tokens are never mixed with local estimates as measured; native apply and precompute are distinct. Completion appendix step 4 requires immutable auxiliary input, physical ownership through settlement and paired approved measurements. Research X01 rejects lost constraints/tool pairs, hidden staleness, worse quality or total auxiliary cost exceeding demonstrated latency benefit.

## REPO_MAP

- [`packages/core/context-relevance.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/context-relevance.ts)
- [`packages/core/context-relevance-host.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/context-relevance-host.ts)
- [`packages/core/context-compaction.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/context-compaction.ts)
- [`packages/core/service.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts)
- [`packages/contracts/model-request.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/model-request.ts)
- [`packages/core/compaction-model-requests.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/compaction-model-requests.ts)
- [`packages/runtime/model-capacity.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/runtime/model-capacity.ts)
- [`tests/compaction-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/compaction-v3.test.ts)
- [`tests/context-contract-preservation-v6.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/context-contract-preservation-v6.test.ts)
- [`tests/fixtures/m04-context-v3.json`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/fixtures/m04-context-v3.json)
- [`docs/implementation/v6/M04/continuation-handoff.md`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v6/M04/continuation-handoff.md)

## DESIGN

Reuse the existing observer and precompute coordinators. Their injected `observe(cut)` and `summarize({binding,prefixDigest})` callbacks are extension points, not production proof. Introduce only a host-owned composition around existing admitted M11 model-request/capacity and M02 owner/cancellation custody after discovering the exact accepted APIs. Keep model/account/budget approvals host supplied; never put them in preferences or let a model choose them. `costBytes` remains a byte counter and must not become currency. Actual provider input/output/cache/cost and unknown values belong to existing ModelRequestV1 observations and candidate association. Preserve one physical pending operation after public timeout/cancel until actual settlement. A prepared summary is only a private candidate and must traverse existing native apply/CAS if ever used under separately authorized testing.

## EXECUTION_DAG

### T01: Lock source, approved inputs and exact host APIs

Depends on: none. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Exact immutable baseline; approved model identifier, account binding, auxiliary call and spend/deadline budget; one disposable project and source corpus; M11 API version and owner.

**Files and concrete edits:** Read the listed production modules, v6 M04 requirements/handoff, #801 and current M11 owner. Write only this issue journal/source manifest until execution is authorized.

**Operation and output:** Record missing values as HOLD_AUXILIARY_MODEL. Trace M11 admitted request, cancellation, late settlement and cost APIs to concrete signatures before designing the composition; publish that narrow interface amendment in this issue. No alternate model, provider or dependency may be chosen.

**Positive, negative, cancellation and recovery checks:** Positive: exact approved profile matches captured owner. Negative: missing/expired/wrong-account approval produces OBSERVER_UNAVAILABLE with zero dispatch. Cancel before admission also produces zero dispatch; reopen must not restore authority from a summary.

**Done criterion:** Concrete reviewed interface and source locks exist; every absent approved input has a named hold.

### T02: Connect the existing shadow coordinator

Depends on: T01. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Existing `createShadowRelevancePhase`({approval,observe,schedule,unschedule}); immutable cut with exact IDs/byte metadata; M11 admitted profile; current ToolOwner and context generation.

**Files and concrete edits:** Extend packages/core/context-relevance-host.ts and the existing request-observation hook in packages/core/service.ts; reuse packages/core/context-relevance.ts unchanged unless a failing assertion requires repair. Add source/runtime manifest entries only if a genuinely new module is needed.

**Operation and output:** Capture immutable allowed input once, invoke one observer per eligible cut, apply fixed 6000 ms public deadline, retain physical capacity until settlement, and store advisory result plus actual request observation reference. Observe must neither edit context nor install grants. Revalidate owner after every await before publication.

**Positive, negative, cancellation and recovery checks:** Capture foreground request bytes with observer off/on/failure/timeout; all identical. Mutate caller input after admission and prove observed cut unchanged. New foreground owner cancels publication but retains late usage. Reject repeated cut, recursive call and pending second call; shutdown cancels owned operation only.

**Done criterion:** Actual Service path reaches the approved injected production route in a host integration test and all denied paths have external-call count zero.

### T03: Connect one precompute candidate and real accounting

Depends on: T01, T02. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** `createPrecomputeExperiment`({enabled,maxRetainedTailBytes,summarize}); exact CompactionBindingV1; approved prefix; candidate ID; existing private summary custody and native apply gate.

**Files and concrete edits:** Extend packages/core/service.ts compaction composition and existing context-compaction.ts callback binding; use compaction-model-requests.ts and ModelRequestV1 for charges, not a second cost schema.

**Operation and output:** Keep off by default. Preserve one fixed prefix and one in-flight lease; map all failed/discarded/late calls to immutable actual auxiliary observations. Before candidate use compare generation, prefix/instructions/registry/model/account/workspace and retained-tail bytes; native application remains separate and unsupported stays disabled.

**Positive, negative, cancellation and recovery checks:** Positive: unchanged binding yields READY, not APPLIED. Negative: rewind, changed instruction/model/account/workspace, long tail, timeout, invalid summary ref and missing cost all remain honest. Cancel plus immediate retry cannot start a second physical call. Restart makes unresolved work UNKNOWN/blocked and retains charges; it never auto-applies.

**Done criterion:** No second result store, no summary mistaken for apply, and every actual attempted request has recorded settlement or visible unknown custody.

### T04: Freeze paired fixtures and execute only approved pilot

Depends on: T02, T03. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Same source cut, model/account/settings/grants and explicit seed if supported; baseline and candidate arms; at least five paired live repetitions per fixture as research pilot guidance, plus fixed deterministic 100/500 tool and head/middle/tail result fixtures.

**Files and concrete edits:** #1028 owns common platform runner. Extend existing tests/fixtures/m04-context-v3.json and scoped evaluation harness only if a required assertion cannot be expressed; preserve existing fixture IDs and all prior results.

**Operation and output:** Measure request bytes separately from provider tokens; unresolved seeded requirement recall; tool-pair preservation; decisive-line recovery; latency; stale candidate rate; every successful/failed/retried/discarded auxiliary charge. Include all output, failures and unavailable counters. No statistical-significance claim from a five-pair pilot.

**Positive, negative, cancellation and recovery checks:** Expected broken fixture fails for its intended omitted requirement/pair; valid fixed fixture passes. A setup/model entitlement failure is BLOCKED. Mid-study cancellation stops new admission, waits bounded cleanup, retains partial artifacts and unknown spend.

**Done criterion:** Paired raw artifacts and a decision table demonstrate no required state loss; no pruning or flag activation follows automatically.

### T05: Reconcile evidence and independent gates

Depends on: T04. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Actual source-bound command receipts and original source-locked historical evidence.

**Files and concrete edits:** Update only the then-authorized existing docs/implementation/v6/M04/requirements.json and v3 M04-verification.json with strict V3 phases/cases; #1972 handles broader stale evidence claims.

**Operation and output:** Map C5 rows to observed outcomes, preserve BLOCKED/NOT_RUN and reviewerApproval=false/flags=false. Retain original histories and result artifacts until host policy expiry; rollback cancels observers/precompute and removes injection without replacing active sessions.

**Positive, negative, cancellation and recovery checks:** Validate exact schema then independently inspect raw behavior receipts. Simulate missing provider counters and require null/INCOMPLETE_COST. Disable flag during await and prove no new current publication or native apply.

**Done criterion:** All required current evidence passes or the issue explicitly remains PARTIAL with exact holds; no integrity-only completion.

## VALIDATION

### Setup and command discipline

Observed audit environment: Node 24.22.3 satisfies `>=24.10.0`; provisioned pnpm 11.25.0 does not match required 10.30.3; there is no node_modules tree. `COREPACK_ENABLE_NETWORK=0 corepack pnpm --version` cannot resolve an already-provisioned 10.30.3. All current product test commands are NOT_RUN, reason HOLD_TOOLCHAIN. No package, toolchain or browser was downloaded and no repository file was modified. A missing dependency is an infrastructure hold, not an expected failing assertion.

Future executor must first record `git rev-parse --show-toplevel`, `git remote get-url origin`, `git status --porcelain=v1 --untracked-files=all`, `git branch --show-current`, `git worktree list --porcelain`, `git rev-parse HEAD`, `node --version` and `pnpm --version` separately. Read the then-current package.json, lockfile, consumed contracts and owner journal. Use installed matching pnpm or an already provisioned matching Corepack resolution. If neither exists, keep HOLD_TOOLCHAIN; no download is authorized by v6. Frozen existing-lockfile dependency setup is allowed only under the future implementation's setup authorization. Never substitute a different version or use --passWithNoTests.

Run required asset steps as separate observed commands before targeted tests: `pnpm build:credential-lease` and `pnpm build:widgets`. A platform incapable of the native build may execute a separately labeled pure targeted diagnostic but cannot substitute `test:no-lease` for the required `pnpm test` gate. After focused tests run, retain individual receipts for `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:browser`. Do not change timeout, skip, browser channel or expected assertion to hide a failure. Planned commands below were not executed in this audit.

Receipts name the immutable source SHA/tree, source and dependency blob hashes, Node/pnpm/OS/architecture/browser/native adapter, flag injection, exact command, start/end UTC, exit or cancellation, actual test case identities, passed/failed/skipped counts, and bounded artifact SHA-256. Preserve every baseline failure, cancellation, unknown settlement and unavailable cost. Platform-specific skips are declared individually and never fulfill required gates. Evidence integrity validation is separate from product acceptance.

### Focused commands

```sh
pnpm exec vitest run tests/context-compiler-v3.test.ts tests/context-results-v3.test.ts tests/compaction-v3.test.ts tests/context-contract-preservation-v6.test.ts
pnpm exec vitest run tests/context-request-observation.test.ts tests/compaction-model-requests.test.ts
# The live evaluation command is fixed in T01/T04 after the approved actual host API is inspected. No current live runner is claimed.
```

### Acceptance matrix

| Requirement | Tasks | Required observable result |
|---|---|---|
| S09, T07, D05 | T01, T02 | 6 seconds shadow; byte-identical foreground; no approval means zero call; immutable input and late physical ownership. |
| S12, T06 | T03 | One candidate; every invalidation discards; all attempts and late costs retained; no automatic native apply. |
| S13 | T04 | Actual paired outputs and usage, seeded constraints/pairs intact; every failed run retained. |
| G01, G02, G03 | T01, T05 | Adapter/auxiliary gates independent, flags false, rollback keeps original history/artifact retention. |

### Release gates and rollback

HOLD_AUXILIARY_MODEL until explicit current model/account, caller/budget, corpus and entitlement exist. HOLD_NATIVE_COMPACTION applies only to native candidate use. HOLD_TOOLCHAIN blocks current commands. Missing complete cost or native/installed proof keeps the affected phase PARTIAL. No external donor, new package, endpoint, pricing guess or activation is authorized. Independent reviewer acceptance is required for a future release; this plan cannot grant it.

## STATE

All T01 and later implementation tasks are NOT_STARTED. This audit performed source tracing, original-clause extraction, issue/PR body and discussion comparison, path/reference verification and clean-tree checks only. Product tests, Windows installed tests, live model calls and activation are NOT_RUN. Implementation scope and execution owners must be claimed in the canonical issue before future changes. Next step is T01 after coordinator publishes this complete plan and confirms current owner/source; blocked inputs are not guessed. Preserve ordinary working code, all native histories, accepted memory, tombstones and prior failed observations across rollback.

## REFERENCES

- [Pinned source](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b)
- [Parent audit and read-only scope](https://github.com/skytuhua-org/Gen-V1/issues/1992)
- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
