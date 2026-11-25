# M05: Execute source-bound paired memory study with complete auxiliary cost

## META

Repository: `skytuhua-org/Gen-V1` (ID 1442565952). Plan revision: `m0406-audit-r1-readability-r1`, 2026-11-24 UTC. Exact inspected baseline: `9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Parent audit: [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992). Planning reviewer: `codex-cloud-m0406-e3d038`. This reviewer holds no implementation ownership; existing claims remain authoritative. No branch, worktree, PR or activation was created by this audit. This document is an executable future plan, not permission to run a provider, alter the repository or activate a capability during the read-only audit.

Attachment limitation observed by the parent publisher: GitHub filechooser upload failed. The complete UTF-8 Markdown body is the publication fallback; these actual .md files remain separate review deliverables. No GitHub attachment success is claimed and no repository-docs write or commit is authorized.

The authoritative inputs are the user-supplied *Audited Execution-Controlled Prompts v6* (2026-11-16), its *Completion Followups* appendix (2026-11-18), and *Expanded Source Research UX Memory Performance v3* (2026-11-14). The complete relevant clauses are reproduced below. v6 controls acceptance; the appendix orders remaining work; research §§19-26 explains the experiment/evidence design. An existing helper, merged commit, valid evidence JSON or passing synthetic test is not production/native/live acceptance.

Read [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md) and [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md) before future implementation. Claim only this issue's task IDs, append and read back every checkpoint, retain one concern and one owner per edit set, and RELEASE OWNER=NONE before stopping. User authorization in this audit covers planning/publication only. Future implementation needs its own task scope; do not resurrect retired architecture without an explicit accepted product decision. M12 and M14 belong to other active owners.

Canonical routing: [2051](https://github.com/skytuhua-org/Gen-V1/issues/2051), published after source and duplicate review under #1992.

## OBJECTIVE

Produce actual repeated-task output quality and all auxiliary usage/cost evidence through the checked-in study and current approved host. Preserve the offline fixture corpus and do not rebuild memory. The outcome may remain INCOMPLETE_COST or fail; it must not be presented as measured benefit without actual evidence.

### Actual baseline finding

evals/project-memory-study.ts exports `runMemoryStudy`(options) and defaults to MANIFEST_ONLY without explicit host/model/project/source-thread. Its existing three fixed report-format tasks compare thread-note-only with opted-in project memory, use fresh native sessions and identical READY warmups, pin selected account/model/thinking level, and retain raw RuntimeUsage without inferring per-run charges. Checked-in m05-study-20261115/results.json has no executed live comparison and principal metrics null. evals/fixtures/project-memory-v3.json covers all required adversarial categories but is explicitly OFFLINE_FIXTURE_SET. No live model/account, corpus acceptance or spend budget was supplied.

## REQUIREMENTS

**M05-S11.** Add an evaluation set containing contradicted decisions, changed APIs, renamed projects, stale code references, malicious memory instructions, deliberate secrets, user corrections and repeated tasks. Compare recall usefulness and task correctness against thread-note-only control. Track memory injection bytes, retrieval latency and all extraction/consolidation spend.

**M05-T07.** Live repeated-task study reports quality and total auxiliary cost, not only retrieval similarity.

**M05-C05.** Pilot defaults: opt-in per project; at most 8 recalled items and 4 KiB of injected memory; lexical retrieval first; vector retrieval is a separate disabled experiment requiring an approved embedding provider and explicit data egress consent. Extraction proposes rather than auto-accepts new facts.

**M05-T01.** Wrong project, wrong account, expired item and missing source do not enter recall. Relevance cannot grant access.

**M05-T02.** User correction wins over older summaries. Two concurrent edits produce CONFLICT instead of losing either revision.

**M05-T03.** Forget immediately removes recall, invalidates summaries, survives restart and does not resurrect through reindex or old backup replay.

**M05-T06.** Prompt-injection text inside memory stays data. Seeded secrets and fabricated source IDs are rejected before publication.

**M05-G01.** Local lexical memory can pass independently of an external vector service. External embeddings, auto-acceptance and user-wide sharing remain disabled unless separately approved and tested. Native pre-compaction checkpoints are adapter-gated.

**M05-G02.** Host-owned flags: memory.projectV1, memory.externalRecallExperimentV1. Register only these keys in the shared finite registry; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

The completion appendix mandates the checked-in study under exact approved account/model/corpus/budget with unaffected controls and auxiliary usage/cost. Research X03 rejects rising auxiliary cost without measured repeated-task benefit and X07 keeps external vectors separately disabled. The offline source corpus is not represented as live execution.

## REPO_MAP

- [`evals/project-memory-study.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/evals/project-memory-study.ts)
- [`evals/fixtures/project-memory-v3.json`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/evals/fixtures/project-memory-v3.json)
- [`evals/README.md`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/evals/README.md)
- [`tests/memory-study-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/memory-study-v3.test.ts)
- [`tests/e2e/project-memory-host.spec.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/e2e/project-memory-host.spec.ts)
- [`packages/core/memory-extraction.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/memory-extraction.ts)
- [`packages/core/memory-consolidation.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/memory-consolidation.ts)
- [`packages/core/project-memory-host.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/project-memory-host.ts)
- [`docs/implementation/v3/m05-study-20261115/results.json`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/m05-study-20261115/results.json)

## DESIGN

Reuse `runMemoryStudy`({destination,host,modelId,projectId,sourceThreadId,timeoutMs,signal}). Destination is new/exclusive; never write over earlier evidence. Only supplied actual loopback host and available exact model/account are allowed. The source project has exactly the reviewed policy, one settled source thread and no unrelated private data. Control requests exclude every project-memory revision and use existing thread notes; treatment requests capture exact accepted revision. Preserve alternating arm order and identical memory-free warmups. Research §24 recommends at least five paired repetitions per fixture: current code has three distinct tasks once each, so either wrap repeated isolated invocations with an explicit approved repeated-trial manifest or add a bounded repetitions option after a focused failing test. Do not relabel three different tasks as five repeats. All auxiliary setup, failed, cancelled, retried and late settlements are counted; unknown cost stays null. Existing foreground counters are not defined as per-run, so preserve snapshots unless actual M11 request receipts supply a proven basis.

## EXECUTION_DAG

### T01: Freeze explicit approved study inputs and scoring

Depends on: none. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Approved actual host origin, model/provider/account and reasoning settings, disposable project/source-thread, corpus digest, per-call and total spend/deadline limits, repetitions/seed, operator acceptance thresholds.

**Files and concrete edits:** Read existing runner/options and README, exact memory usage schemas and M11 cost receipt ownership; add only a study manifest artifact before execution.

**Operation and output:** Record HOLD_LIVE_MEMORY_STUDY for absent values. Freeze expected output assertions before execution; separate recall usefulness operational proxy from task correctness and source preservation. Define labels for contradiction/current API/renamed project/stale source/malicious instruction/secrets/correction/forget using offline corpus.

**Positive, negative, cancellation and recovery checks:** Missing model/account/budget cannot submit; wrong origin rejects; reused output directory fails. Cancel before run submits zero messages.

**Done criterion:** Approved immutable manifest and budget owner exist; no implicit model/account switching.

### T02: Validate the unchanged runner and bounded repetition seam

Depends on: T01. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Existing `runMemoryStudy` API and six summary metrics; repeated-run identifier and maximum count agreed in T01.

**Files and concrete edits:** tests/memory-study-v3.test.ts and existing actual-host project-memory spec; if required, bounded wrapper/new option in evals/project-memory-study.ts with source manifest entry only for a new file.

**Operation and output:** Prove exact scoring and control/treatment capture. Add only missing repeated-trial orchestration, budgeting and persistence necessary for approved pilot; no new framework. Every pair starts isolated sessions/source ownership and retains fixture SHA and settings.

**Positive, negative, cancellation and recovery checks:** Positive correct JSON produces expected score, wrong timestamp/amount/extra field fails. Negative warmup containing memory, changed owner/policy, backward counters or writable operations rejects. Cancellation retains partial outputs and bounds cleanup; rerun uses new directory and does not resend uncertain prior command.

**Done criterion:** Current targeted tests pass, pilot count is explicit, and existing single-run semantics remain compatible.

### T03: Execute approved paired live trials

Depends on: T02. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** All T01 approved identities and actual HostOptions memory activation in disposable test host only; native session and M04 preparation receipts.

**Files and concrete edits:** Run the checked-in study via ordinary host API; no source edits during execution. Retain results.json and frozen-cases.json for each pair under a new evidence directory.

**Operation and output:** Run at least approved five pairs per fixture with order alternation and same settings. Preserve actual outputs, failures, null counters, warmups, context revisions, injected bytes and retrieval latency. Existing corpus negative fixtures must be run through appropriate actual owner-bound host path or remain separately unqualified; never claim inline formatting runner validates changed source files.

**Positive, negative, cancellation and recovery checks:** Check all forbidden selections remain zero, corrections beat old summary and Forget never returns. Infrastructure failure is BLOCKED, not failed intended task reproduction. Stop budget/deadline before next call; late auxiliary settlement still charged with original owner.

**Done criterion:** Raw actual model outputs and all-pair results available with no discarded failed run and no unsupported causal/significance claim.

### T04: Reconcile full cost and decision table

Depends on: T03. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Before/after cumulative auxiliary records including setup, per-call settlement IDs, provider-reported price/currency basis or explicit unknown.

**Files and concrete edits:** Use current memoryUsageReport/extraction/consolidation receipts and actual M11 model-request records if applicable; modify no pricing schema.

**Operation and output:** Verify each attempted auxiliary call counted exactly once; include timed-out orphan/failed/retry/discarded charges. Report quality by fixture/arm and per-trial bytes/latency/usage distribution. Unknown foreground convention remains raw snapshot; no subtraction or saved-money claim. If pending cleanup or missing cost remains, preserve INCOMPLETE_COST.

**Positive, negative, cancellation and recovery checks:** Known zero is zero; missing is null; failed call with cost remains charged; owner mismatch invalidates association. Restart reconciliation cannot count one request twice.

**Done criterion:** Complete evidence supports measured tradeoff or explicit incomplete/failure outcome; no automated activation.

### T05: Record gates and rollback test-only activation

Depends on: T04. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Actual pilot receipts, corpus coverage, previous manifest-only output, installed scope from #1026.

**Files and concrete edits:** Existing M05 evidence records, coordinated with #1972; no changes to production capability defaults.

**Operation and output:** Preserve all historical manifests and distinguish live study from installed acceptance. Turn off test injection/extraction after owned cleanup; retain accepted records/tombstones and task notes. Release owner and state exact missing metric/platform gate.

**Positive, negative, cancellation and recovery checks:** Disabled host produces no new injection/extraction; recorded results remain readable; embeddings/sharing/autoaccept flags remain false.

**Done criterion:** Reviewed evidence is source-bound, all unmeasured values explicit, and no production flag changed.

## VALIDATION

### Setup and command discipline

Observed audit environment: Node 24.22.3 satisfies `>=24.10.0`; provisioned pnpm 11.25.0 does not match required 10.30.3; there is no node_modules tree. `COREPACK_ENABLE_NETWORK=0 corepack pnpm --version` cannot resolve an already-provisioned 10.30.3. All current product test commands are NOT_RUN, reason HOLD_TOOLCHAIN. No package, toolchain or browser was downloaded and no repository file was modified. A missing dependency is an infrastructure hold, not an expected failing assertion.

Future executor must first record `git rev-parse --show-toplevel`, `git remote get-url origin`, `git status --porcelain=v1 --untracked-files=all`, `git branch --show-current`, `git worktree list --porcelain`, `git rev-parse HEAD`, `node --version` and `pnpm --version` separately. Read the then-current package.json, lockfile, consumed contracts and owner journal. Use installed matching pnpm or an already provisioned matching Corepack resolution. If neither exists, keep HOLD_TOOLCHAIN; no download is authorized by v6. Frozen existing-lockfile dependency setup is allowed only under the future implementation's setup authorization. Never substitute a different version or use --passWithNoTests.

Run required asset steps as separate observed commands before targeted tests: `pnpm build:credential-lease` and `pnpm build:widgets`. A platform incapable of the native build may execute a separately labeled pure targeted diagnostic but cannot substitute `test:no-lease` for the required `pnpm test` gate. After focused tests run, retain individual receipts for `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:browser`. Do not change timeout, skip, browser channel or expected assertion to hide a failure. Planned commands below were not executed in this audit.

Receipts name the immutable source SHA/tree, source and dependency blob hashes, Node/pnpm/OS/architecture/browser/native adapter, flag injection, exact command, start/end UTC, exit or cancellation, actual test case identities, passed/failed/skipped counts, and bounded artifact SHA-256. Preserve every baseline failure, cancellation, unknown settlement and unavailable cost. Platform-specific skips are declared individually and never fulfill required gates. Evidence integrity validation is separate from product acceptance.

### Focused commands

```sh
pnpm exec vitest run tests/memory-study-v3.test.ts tests/memory-retrieval-v3.test.ts tests/memory-consolidation-v3.test.ts
pnpm build
pnpm test:browser --suite project-memory-host
# Only after T01 approval, replace each named input with its exact recorded approved value:
pnpm exec tsx evals/project-memory-study.ts --out NEW_EXCLUSIVE_OUTPUT --host ACTUAL_LOOPBACK_ORIGIN --model APPROVED_MODEL_ID --project DISPOSABLE_PROJECT_ID --source-thread APPROVED_SETTLED_SOURCE_THREAD_ID
```

### Acceptance matrix

| Requirement | Tasks | Required observable result |
|---|---|---|
| S11, T07 | T01, T02, T03, T04 | Actual source-bound paired output quality, corpus coverage, bytes/latency and all auxiliary spend. |
| C05, T01, T02, T03, T06 | T02, T03 | Control isolation, exact accepted revisions, corrections/forget/secret/source denial and bounded injection. |
| G01, G02 | T05 | Study does not unlock embedding/autoaccept/sharing or installed platform; production defaults remain false. |

### Release gates and rollback

HOLD_LIVE_MEMORY_STUDY now: missing approved actual host/model/account/corpus/budget and exact cost basis. HOLD_TOOLCHAIN independently blocks current tests. Five paired repetitions are a pilot, not statistical proof; report sample sizes and all variance. #1026 separately owns installed lifecycle/retention. No external provider selection, credential entry, egress expansion or production activation is authorized.

## STATE

All T01 and later implementation tasks are NOT_STARTED. This audit performed source tracing, original-clause extraction, issue/PR body and discussion comparison, path/reference verification and clean-tree checks only. Product tests, Windows installed tests, live model calls and activation are NOT_RUN. Implementation scope and execution owners must be claimed in the canonical issue before future changes. Next step is T01 after coordinator publishes this complete plan and confirms current owner/source; blocked inputs are not guessed. Preserve ordinary working code, all native histories, accepted memory, tombstones and prior failed observations across rollback.

## REFERENCES

- [Pinned source](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b)
- [Parent audit and read-only scope](https://github.com/skytuhua-org/Gen-V1/issues/1992)
- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
