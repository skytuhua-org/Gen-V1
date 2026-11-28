**Full current issue mirror:** [issue-1027.md](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1027.md). The publication checkpoint pins the exact commit.

Publication supplement under #1803, cleanup-2026-11-23-r2: preserve the concurrent #1992 plan below. Integrated #709/#733 heads do not establish installed compaction acceptance. The bounded #993/#1227 shutdown repair has subsequent main Browser passes in runs 45318044111 and 45319348309; this removes that blocker without certifying the remaining M04 gates.

# M04: Qualify retained compaction through the actual App and installed desktop

## META

Repository: `skytuhua-org/Gen-V1` (ID 1442565952). Plan revision: `m0406-audit-r1-readability-r1`, 2026-11-24 UTC. Exact inspected baseline: `9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Parent audit: [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992). Planning reviewer: `codex-cloud-m0406-e3d038`. This reviewer holds no implementation ownership; existing claims remain authoritative. No branch, worktree, PR or activation was created by this audit. This document is an executable future plan, not permission to run a provider, alter the repository or activate a capability during the read-only audit.

Attachment limitation observed by the parent publisher: GitHub filechooser upload failed. The complete UTF-8 Markdown body is the publication fallback; these actual .md files remain separate review deliverables. No GitHub attachment success is claimed and no repository-docs write or commit is authorized.

The authoritative inputs are the user-supplied *Audited Execution-Controlled Prompts v6* (2026-11-16), its *Completion Followups* appendix (2026-11-18), and *Expanded Source Research UX Memory Performance v3* (2026-11-14). The complete relevant clauses are reproduced below. v6 controls acceptance; the appendix orders remaining work; research §§19-26 explains the experiment/evidence design. An existing helper, merged commit, valid evidence JSON or passing synthetic test is not production/native/live acceptance.

Read [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md) and [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md) before future implementation. Claim only this issue's task IDs, append and read back every checkpoint, retain one concern and one owner per edit set, and RELEASE OWNER=NONE before stopping. User authorization in this audit covers planning/publication only. Future implementation needs its own task scope; do not resurrect retired architecture without an explicit accepted product decision. M12 and M14 belong to other active owners.

Canonical routing: extend [#1027](https://github.com/skytuhua-org/Gen-V1/issues/1027) in place; do not create a duplicate.

## OBJECTIVE

Close the existing #1027 product/installed acceptance gap without rebuilding the landed native CAS or importing entire stale branches. Preserve historical failure and later success receipts under their own exact source cuts.

### Actual baseline finding

Service.applyLossAwareCompaction at 584-770 and worker protected compact support actual native CAS, retained source refs and immutable receipt. The current project-memory-host fixture line 34 explicitly throws for compaction, and current App spec lacks retained-history/cost cases from #709/#733. Both PRs are now CLOSED with merged=false because their heads are ancestors of later main, not because all qualification passed. #709 discussions record a 3-pass/3-fail reopen result and a later 6/6 source-specific pass; #733 records reopen failure and later 7/7 source-specific pass. #839 records historical Windows native CAS at 7ac80d87/run 44367920580 and 89142de9/run 44393035599; it does not certify current installed App behavior. #993 diagnostic repair and #1095 do not themselves close the required installed scenario.

## REQUIREMENTS

**M04-C03.** CompactionBindingV1 and CompactionCandidateV1 already exist in packages/contracts/request-context.ts. Keep their current fields and status union. Proposed CompactionMetadataV1 is a strict sidecar with version:1, candidateId:string, binding:CompactionBindingV1, summaryRef:string|null, sourceInterval:{firstSeq:number,lastSeq:number}|null, usageObservationRef:string|null. The host mints candidateId once with its existing UUID generator, retains it across retries, and admits at most one nonterminal candidate per exact binding. Validate nonnegative integer sequence endpoints and firstSeq<=lastSeq. Referenced artifacts and observations still require their normal owner checks. Do not alter CompactionCandidateV1 or fill opaque native intervals with guessed host sequences. A candidate never becomes active context without a tested native apply operation and a successful exact-binding recheck.

**M04-S10.** For actual compaction keep unresolved user instructions, current decisions, pending approvals as references, active work, source evidence pointers and complete tool-call/result relationships. Do not carry grants as natural-language permissions. Keep recent user content verbatim within the explicit budget. Retain the original native history.

**M04-S11.** Apply compaction only through an adapter with an observed native API and tests. Before application verify exact source cut, workspace, model/account and generation; after application create a fresh generation and immutable before/after usage observation. Unsupported adapters report UNSUPPORTED_COMPACTION, not a fake host-only reset.

**M04-U01.** Extend ContextInspector, not a duplicate meter. Tabs: Last request, Sources, Tools, Compaction. Rows show source, revision, inclusion reason, bytes, measured/estimated tokens, and exclusion reason. Unknown native portions appear explicitly.

**M04-U03.** Compaction preview lists retained constraints and omitted categories, plus expected byte reduction labeled estimate. The result view shows measured before/after counts when available, cost including failed attempts, and stale/discarded candidates.

**M04-T05.** Compaction preserves seeded unresolved requirements, tool-result pairs and source pointers. Wrong generation, model, workspace or account refuses application.

**M04-G01.** Pure projection and read-only discovery require M01/M02 core. Project-executing servers require M03 executable proof. Actual native compaction and background precompute require adapter-specific runtime tests; no requirement to build safe rename first.

**M04-G03.** Rollback: Disable injections and experimental precompute, cancel observers and retain original native history. Keep referenced result artifacts until retention expiry; do not replace active sessions from a failed summary.

Follow-up C3/C4 requires real composer-host-adapter observation and moved-cut refusal before mutation. #709 review also requires archive-file hash assertion and a negative private-commit case; #733 review warns fixture failure counts are generation-specific and formatter expectations must not mirror the implementation. Current #709/#733 closure comments explicitly preserve unresolved #1027 acceptance.

## REPO_MAP

- [`packages/core/service.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts)
- [`packages/core/native-compaction-protection.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/native-compaction-protection.ts)
- [`packages/runtime-hermes/worker.py`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/runtime-hermes/worker.py)
- [`packages/storage/store.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/storage/store.ts)
- [`packages/core/compaction-model-requests.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/compaction-model-requests.ts)
- [`apps/web/src/ContextInspector.tsx`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/ContextInspector.tsx)
- [`tests/project-memory-host-fixture.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/project-memory-host-fixture.ts)
- [`tests/e2e/project-memory-host.spec.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/e2e/project-memory-host.spec.ts)
- [`tests/e2e/project-memory-host.playwright.config.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/e2e/project-memory-host.playwright.config.ts)
- [`scripts/verify-installed-desktop.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/verify-installed-desktop.ts)

## DESIGN

Use the existing App, authenticated commands, native private commit and retained compaction read model. Recover only the missing assertions from the exact historical heads after comparing their blobs with current main. Scripted native receipts qualify UI behavior only and must be labeled as such. Actual native-worker apply/custody and installed Windows process identity are separate evidence lanes. Preserve failed, reported-zero and unavailable provider cost; show byte estimates as estimates and native measured bytes only from actual receipts.

## EXECUTION_DAG

### T01: Compare historical tests and current ownership

Depends on: none. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Current main source lock; prior fixture/spec blobs; actual browser channel and parent App owner.

**Files and concrete edits:** Read exact #709 head `0470f4acebd0f44f0124def06a89a97039d75eac`, #733 head `98cd56fbfba1c13078954d14c07d2864098b9a3f`, #839 and current issue comments; compare tests/project-memory-host-fixture.ts and e2e spec.

**Operation and output:** Record behavior-level differences and determine whether current ContextInspector retains compaction when last request is unavailable. Do not merge or reopen those branches in this audit. Reuse current architecture; create a failing test only for a missing retained requirement.

**Positive, negative, cancellation and recovery checks:** Record all historical failure/pass contexts separately. Confirm missing test case by exact title and caller, not PR open/closed state. Cancelled CI runs 44209222586 and 44219162563 stay CANCELLED.

**Done criterion:** One scoped implementation delta and test inventory, no blanket branch replay.

### T02: Restore actual App retained history and cost assertions

Depends on: T01. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Existing fixture authenticated HTTP/CSRF and Service native gate; fixture-generated receipts explicitly marked scripted; failed/zero/null M11 attempt observations.

**Files and concrete edits:** Extend tests/project-memory-host-fixture.ts and tests/e2e/project-memory-host.spec.ts; change ContextInspector/store/read route only if reproduced failure points there.

**Operation and output:** Exercise manual compaction with compiler observation on and off, maintenance epoch, inspector close/reopen and SQLite restart. Assert retained candidate, original history digest/archive bytes, source refs and new generation. Pin one literal zero/currency-unreported formatting assertion independently of implementation formatter.

**Positive, negative, cancellation and recovery checks:** Positive applied panel remains after reopen/restart. Negative stale generation/owner/source rejects before native write with a counter of zero; archive SHA is independently read and compared. Failed first apply keeps native bytes/generation; retry produces distinct candidate and preserves zero, null and failed-attempt costs. Cancel during admission/commit records uncertainty and prevents duplicate apply.

**Done criterion:** All distinct historical retained-history and retained-cost assertions exist and pass on exact current App cut; mocked native scope remains labeled.

### T03: Qualify native apply and original-history recovery

Depends on: T02. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Pinned native adapter, exact accepted original-source profile, task-owned disposable native history, authorized fixture or separately approved provider.

**Files and concrete edits:** Use existing tests/hermes-original-integration.test.ts, context-request-observation and worker private-channel tests; extend only missing kill/recovery assertion.

**Operation and output:** Run real native history snapshot and compare-and-swap. Match current generation/workspace/model/account/source/native digest; verify one private commit and fresh after observation. Moved cut must be refused before any mutation. Reopen after interrupted apply and reconcile actual archive/receipt without automatic repeat.

**Positive, negative, cancellation and recovery checks:** Intended matching apply reduces actual bytes while all seeded unresolved instructions, recent user content and tool pairs survive; foreign owner and changed binding perform zero apply; failure before/after private commit remains distinguishable.

**Done criterion:** Native receipt, exact archive byte hash and raw runtime result are retained, or HOLD_NATIVE_COMPACTION remains.

### T04: Run the installed Windows compaction and result-custody lane

Depends on: T03. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Approved Windows host/install directory, setup SHA and NSIS GUID, same source-built installer and native/browser prerequisites; #993 current repair disposition; explicit test injection only.

**Files and concrete edits:** Extend the existing reviewed installed verifier only after its exact current CLI/fixture owner is inspected. Existing scripts/verify-installed-desktop.ts is the anchor; do not invent a replacement installer or parallel result store.

**Operation and output:** Bind installed executable/PID+creation identity/profile/window, exercise actual App compaction and retained history/cost after restart, plus a separate native result-handle custody scenario. Record runtime/browser/platform and full-result expiry, owner switch and read bounds separately. Retain default-off production settings.

**Positive, negative, cancellation and recovery checks:** Positive installed continuation uses actual native result; negative stale binding and foreign/expired result return no bytes; stop/restart affects only owned processes; ordinary foreground input works after rollback. Unavailable hardware/provider records the exact hold.

**Done criterion:** Named successful immutable installed receipts for each required scenario, independent of browser fixture or artifact validator.

### T05: Close requirement/evidence mapping without widening scope

Depends on: T02, T03, T04. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** All source-specific raw receipts, earlier failed/cancelled runs, exact owner journal.

**Files and concrete edits:** Existing M04 v6 requirements and V3 verification files under future implementation authorization; coordinate common platform results with #1028 and stale docs with #1972.

**Operation and output:** Preserve prior history, update only observed acceptance rows, record unsupported/native/live gates separately, and release ownership with exact remaining steps.

**Positive, negative, cancellation and recovery checks:** Schema validation plus independent case review. Missing installed or native cases cannot become PASS from App screenshot alone.

**Done criterion:** Every listed requirement has current passing evidence or issue remains explicit PARTIAL/BLOCKED.

## VALIDATION

### Setup and command discipline

Observed audit environment: Node 24.22.3 satisfies `>=24.10.0`; provisioned pnpm 11.25.0 does not match required 10.30.3; there is no node_modules tree. `COREPACK_ENABLE_NETWORK=0 corepack pnpm --version` cannot resolve an already-provisioned 10.30.3. All current product test commands are NOT_RUN, reason HOLD_TOOLCHAIN. No package, toolchain or browser was downloaded and no repository file was modified. A missing dependency is an infrastructure hold, not an expected failing assertion.

Future executor must first record `git rev-parse --show-toplevel`, `git remote get-url origin`, `git status --porcelain=v1 --untracked-files=all`, `git branch --show-current`, `git worktree list --porcelain`, `git rev-parse HEAD`, `node --version` and `pnpm --version` separately. Read the then-current package.json, lockfile, consumed contracts and owner journal. Use installed matching pnpm or an already provisioned matching Corepack resolution. If neither exists, keep HOLD_TOOLCHAIN; no download is authorized by v6. Frozen existing-lockfile dependency setup is allowed only under the future implementation's setup authorization. Never substitute a different version or use --passWithNoTests.

Run required asset steps as separate observed commands before targeted tests: `pnpm build:credential-lease` and `pnpm build:widgets`. A platform incapable of the native build may execute a separately labeled pure targeted diagnostic but cannot substitute `test:no-lease` for the required `pnpm test` gate. After focused tests run, retain individual receipts for `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:browser`. Do not change timeout, skip, browser channel or expected assertion to hide a failure. Planned commands below were not executed in this audit.

Receipts name the immutable source SHA/tree, source and dependency blob hashes, Node/pnpm/OS/architecture/browser/native adapter, flag injection, exact command, start/end UTC, exit or cancellation, actual test case identities, passed/failed/skipped counts, and bounded artifact SHA-256. Preserve every baseline failure, cancellation, unknown settlement and unavailable cost. Platform-specific skips are declared individually and never fulfill required gates. Evidence integrity validation is separate from product acceptance.

### Focused commands

```sh
pnpm exec vitest run tests/context-request-observation.test.ts tests/native-compaction-protection.test.ts tests/compaction-model-requests.test.ts tests/context-results-v3.test.ts
pnpm exec vitest run tests/hermes-original-integration.test.ts
pnpm build
pnpm test:browser --suite project-memory-host
pnpm test:browser --suite usage-context
# Installed command must use the then-current reviewed verify-installed-desktop CLI and exact owned installer inputs discovered in T04.
```

### Acceptance matrix

| Requirement | Tasks | Required observable result |
|---|---|---|
| C03, S10, S11, T05 | T03 | Exact native CAS succeeds only for matching cut; source/pairs/history retained. |
| U01, U03 | T02, T04 | Actual App reopen/restart retains history and failed/zero/unknown costs; installed proof independent. |
| G01, G03 | T03, T04, T05 | Actual supported adapter/platform; owned rollback, artifacts retained through expiry. |

### Release gates and rollback

HOLD_TOOLCHAIN now. HOLD_NATIVE_COMPACTION for unavailable actual native fixture; HOLD_INSTALLED_COMPACTION_PROOF for missing Windows installed receipt. A historical run or currently closed PR does not discharge the gate. Auxiliary live quality/cost is a separate C5 issue and must not block unrelated scripted UI checks. Preserve all original #1027 obligations and do not activate flags.

## STATE

All T01 and later implementation tasks are NOT_STARTED. This audit performed source tracing, original-clause extraction, issue/PR body and discussion comparison, path/reference verification and clean-tree checks only. Product tests, Windows installed tests, live model calls and activation are NOT_RUN. Implementation scope and execution owners must be claimed in the canonical issue before future changes. Next step is T01 after coordinator publishes this complete plan and confirms current owner/source; blocked inputs are not guessed. Preserve ordinary working code, all native histories, accepted memory, tombstones and prior failed observations across rollback.

## REFERENCES

- [Pinned source](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b)
- [Parent audit and read-only scope](https://github.com/skytuhua-org/Gen-V1/issues/1992)
- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)

## PRESERVED PRIOR CANONICAL BODY

The following previous body is retained verbatim. The current-source findings and tasks above supplement its obligations; earlier append-only comments remain authoritative historical receipts with their original source limits. Stale branch states in the preserved text do not override the explicit current-state comparison above.

<!-- m-series-scope:m04-compaction -->
## Outcome and scope

Retained compaction history/cost evidence through the real App and installed desktop. Windows context-result custody is a separate host verification case. Keep existing flags off and model/provider execution subject to separate authorization.

## Completion criteria

- [ ] **T01** Compare the two older actual-App drafts to main and retain only verified distinct work. Capture real App evidence for supported retained history and cost display.
- [ ] **T02** Identify a supported installed verifier scenario and an authorized provider or owned fixture. Qualify installed compaction apply/custody/rollback at an exact source cut.
- [ ] **T03** Record Windows context-result custody separately. If host restart is the blocker, use #993 for the existing CI failure investigation.

## Ownership and current state

Existing owner or dependency owner: M04 owner with installed and Windows verification owners. The component/body and installed gaps are separate from merged #839 and chronology #772. #709 and #733 are historical draft leads, with distinct downstream bases.



## References

- [PR #709](https://github.com/skytuhua-org/Gen-V1/pull/709)
- [PR #733](https://github.com/skytuhua-org/Gen-V1/pull/733)
- [PR #839](https://github.com/skytuhua-org/Gen-V1/pull/839)
- [docs/implementation/v6/M04/requirements.json](https://github.com/skytuhua-org/Gen-V1/blob/5cde22a7d48cc0a5f0f24884f862e64781575ebd/docs/implementation/v6/M04/requirements.json)
- [docs/implementation/v6/M04/continuation-handoff.md](https://github.com/skytuhua-org/Gen-V1/blob/5cde22a7d48cc0a5f0f24884f862e64781575ebd/docs/implementation/v6/M04/continuation-handoff.md)
- [Existing CI stall investigation #993](https://github.com/skytuhua-org/Gen-V1/issues/993)

Issue body revision `issue-body-r1`. Use append-only checkpoints for evidence and handoffs. Existing ownership, review requirements and release permissions apply.


### Prior journal preserved in GitHub

- [7026911475](https://github.com/skytuhua-org/Gen-V1/issues/1027#issuecomment-7026911475): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7036608592](https://github.com/skytuhua-org/Gen-V1/issues/1027#issuecomment-7036608592): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7045961148](https://github.com/skytuhua-org/Gen-V1/issues/1027#issuecomment-7045961148): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7051230887](https://github.com/skytuhua-org/Gen-V1/issues/1027#issuecomment-7051230887): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
- [7057857420](https://github.com/skytuhua-org/Gen-V1/issues/1027#issuecomment-7057857420): retained unchanged; historical receipt must be read before replacing or reclassifying any prior result.
