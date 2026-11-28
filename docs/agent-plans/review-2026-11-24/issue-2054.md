# M06: Connect scoped structured security evidence to the verification panel

## META

Repository: `skytuhua-org/Gen-V1` (ID 1442565952). Plan revision: `m0406-audit-r1-readability-r1`, 2026-11-24 UTC. Exact inspected baseline: `9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Parent audit: [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992). Planning reviewer: `codex-cloud-m0406-e3d038`. This reviewer holds no implementation ownership; existing claims remain authoritative. No branch, worktree, PR or activation was created by this audit. This document is an executable future plan, not permission to run a provider, alter the repository or activate a capability during the read-only audit.

Attachment limitation observed by the parent publisher: GitHub filechooser upload failed. The complete UTF-8 Markdown body is the publication fallback; these actual .md files remain separate review deliverables. No GitHub attachment success is claimed and no repository-docs write or commit is authorized.

The authoritative inputs are the user-supplied *Audited Execution-Controlled Prompts v6* (2026-11-16), its *Completion Followups* appendix (2026-11-18), and *Expanded Source Research UX Memory Performance v3* (2026-11-14). The complete relevant clauses are reproduced below. v6 controls acceptance; the appendix orders remaining work; research §§19-26 explains the experiment/evidence design. An existing helper, merged commit, valid evidence JSON or passing synthetic test is not production/native/live acceptance.

Read [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md) and [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md) before future implementation. Claim only this issue's task IDs, append and read back every checkpoint, retain one concern and one owner per edit set, and RELEASE OWNER=NONE before stopping. User authorization in this audit covers planning/publication only. Future implementation needs its own task scope; do not resurrect retired architecture without an explicit accepted product decision. M12 and M14 belong to other active owners.

Canonical routing: [2054](https://github.com/skytuhua-org/Gen-V1/issues/2054), published after source and duplicate review under #1992.

## OBJECTIVE

Make the already-defined `SecurityFindingV1` usable through one authorized host recording/read path and the existing verification surface, with exact source identity, permitted scope and evidence quality. This is evidence handling, not authorization to scan or exploit any target.

### Actual baseline finding

`SecurityFindingV1` exists at contracts/verification.ts207-225. `SecurityFindingLedger` at verification-gate.ts193-207 validates/deduplicates but has only test callers. `VerificationPanelModel` has no findings field and VerificationPanel renders no structured security evidence. The current helper dedupe key uses source+findingId globally and Store keys entities by kind/id, while threadId is metadata; integrating that helper unchanged could collide across owners. This is a source-inspected latent integration risk, not a claim of a reachable production cross-owner exploit. No matching open issue title was found. #1376/PR1529 accessibility checks are separately owned and do not implement this original structured source/security evidence requirement.

## REQUIREMENTS

**M06-S12.** Add structured security findings as another evidence type: source location/digest, authorized test scope, observation, impact, status and reproduction. Deduplicate by source and finding identity. Do not add autonomous exploitation or test a third-party target without authorization.

**M06-U04.** Repair progress shows attempt count, remaining budget and stop reason. Security findings display evidence quality and permitted scope rather than an unsupported severity-only verdict.

**M06-C02.** CheckObservationV1: checkId, executionId, owner, codeDigest, dependencyDigest, recipeDigest, environmentId, argv, cwdIdentity, start/end, exitCode|null, outcome PASS|FAIL|BLOCKED|CANCELLED|UNKNOWN, artifactRefs[] and observationKind. Store immutably. Derive freshness CURRENT|STALE|INDETERMINATE from current source/environment, never rewrite the historical outcome to STALE.

**M06-S09.** Produce model review as ADVISORY and observed runner outcomes as EXECUTED. Combine them only through explicit requirement/check bindings. A model-generated PASS, screenshot upload success or confidence score cannot become a verified result.

**M06-G02.** Host-owned flags: verification.workflowV1. Register only these keys in the shared finite registry; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M06-G03.** Rollback: Disable completion gating and new recipes; preserve old thread compatibility and all observations. A rollback never deletes failures or relabels unverified work as verified. Stop only owned browser/server processes.

Original S12/U04 require the full evidence path and visible scope/quality, not just a schema or one unit dedupe assertion. Restore only this missing integration. Existing thread status and current verification outcome/freshness separation remain unchanged.

## REPO_MAP

- [`packages/contracts/verification.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/verification.ts)
- [`packages/core/verification-gate.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/verification-gate.ts)
- [`packages/core/verification-read-models.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/verification-read-models.ts)
- [`packages/storage/store.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/storage/store.ts)
- [`apps/server/server.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/server.ts)
- [`apps/web/src/VerificationPanel.tsx`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/VerificationPanel.tsx)
- [`tests/qa-delegation-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/qa-delegation-v3.test.ts)
- [`tests/verification-read-models-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/verification-read-models-v3.test.ts)
- [`tests/verification-evidence-owner-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/verification-evidence-owner-v3.test.ts)

## DESIGN

Keep `SecurityFindingV1` content fields and distinguish provenance from authority. Add a host-owned versioned envelope or storage sidecar only after inspecting current contracts: complete owner, exact authorized scope/action receipt reference, source witness, evidence/observation kind and retained artifact references. These are proposed missing custody fields, not current schema claims. A model advisory cannot assert executed testing or VERIFIED. Choose a bounded producer integration into the parent verification service from #1030 or an existing authenticated user evidence action; no public raw ledger mutation. Dedupe includes durable owner/source/finding identity and preserves first observation/history. Status changes require authenticated explicit user action with optimistic revision. All readers enforce current durable account/project/workspace ownership and retain source-stale historical evidence without green current authority.

## EXECUTION_DAG

### T01: Specify exact evidence owner and producer contract

Depends on: none. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Original source location/blob digest/scope/observation/impact/status/reproduction; actual M02 ToolOwner/receipt and current source witness.

**Files and concrete edits:** Read current verification contracts/gate, Store schema and authenticated command patterns; coordinate #1030 and #1376 owners. No edits to their execution/check scope.

**Operation and output:** Document the chosen existing producer and proposed versioned custody envelope with every field and bound. Determine legacy helper rows cannot prove owner/account: read as historical unavailable, never infer current authority. No new scanner, exploit executor or third-party target is admitted.

**Positive, negative, cancellation and recovery checks:** Negative missing authorization/source witness cannot record executed claim. Cancelled producer may retain historical already-observed facts under original owner, never revive current rights.

**Done criterion:** Approved narrow data contract and producer/caller map, no speculative hidden API.

### T02: Bind recording and dedupe to actual owner

Depends on: T01. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Exact source witness and canonical permitted scope; complete owner and idempotent command/observation identity.

**Files and concrete edits:** Extend `SecurityFindingLedger` in verification-gate.ts and chosen existing host command/service adapter; add only agreed strict envelope/sidecar and migration compatibility.

**Operation and output:** Validate fields/UTF-8 limits; key dedupe by complete durable owner plus source/finding. Keep statuses and prior observations without cross-thread overwrite. Store transaction is synchronous; revalidate any awaited evidence source before commit. Source content is data, never instructions or permission.

**Positive, negative, cancellation and recovery checks:** Same finding same owner dedupes; same relative path, blob and finding ID in two projects/accounts/threads stays isolated. Wrong source/owner/receipt denied with zero mutation. Command retry records once; restart preserves immutable evidence/history and no authority reconstruction.

**Done criterion:** Actual authorized caller exists, cross-owner collision test fails before patch and passes after, no global unrestricted ledger read exposed.

### T03: Add bounded current-owner read model and existing panel view

Depends on: T02. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Bounded finding page/cursor or explicit cap with omission indicator, source revision/freshness, advisory/executed evidence label, allowed scope, reproduction and status.

**Files and concrete edits:** Extend `VerificationPanelModel` and `verificationPanelModel`; extend existing VerificationPanel.tsx details; reuse scoped artifact reader.

**Operation and output:** Render source, observation, impact, status, permitted scope and evidence quality with textual labels. Link only exact authorized source/artifact; no executable reproduction button. Preserve stale historical findings and display unavailable for missing custody. Do not infer numeric severity or confidence as evidence.

**Positive, negative, cancellation and recovery checks:** Positive same-owner detail shows source/scope and quality. Negative account/project switch, stale response, missing artifact and malformed fields do not leak. Empty/loading/offline/denied states are explicit; keyboard focus and panel selection remain stable.

**Done criterion:** Actual CanvasThread verification surface displays scoped findings and data model remains bounded.

### T04: Prove recovery, rollback and evidence semantics

Depends on: T02, T03. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Disposable source with a known authorized evidence observation; no real third-party scan needed.

**Files and concrete edits:** Extend existing qa-delegation-v3, verification-evidence-owner, read-models and actual component/browser fixture for this panel; add source inventory for any new test only as required.

**Operation and output:** Test duplicated/replayed findings, source edits, artifact removal, rollback and restart. Keep advisory findings visible but unable to verify executable requirements. Status updates preserve prior evidence and exact actor receipt.

**Positive, negative, cancellation and recovery checks:** Owner switching during asynchronous read never returns new-owner bytes; stale source remains historical; rollback disables new recording but keeps authorized prior evidence; delete/removal never fabricates PASSED.

**Done criterion:** Named source-bound tests and actual UI evidence pass, otherwise record exact blocker; flags remain false.

## VALIDATION

### Setup and command discipline

Observed audit environment: Node 24.22.3 satisfies `>=24.10.0`; provisioned pnpm 11.25.0 does not match required 10.30.3; there is no node_modules tree. `COREPACK_ENABLE_NETWORK=0 corepack pnpm --version` cannot resolve an already-provisioned 10.30.3. All current product test commands are NOT_RUN, reason HOLD_TOOLCHAIN. No package, toolchain or browser was downloaded and no repository file was modified. A missing dependency is an infrastructure hold, not an expected failing assertion.

Future executor must first record `git rev-parse --show-toplevel`, `git remote get-url origin`, `git status --porcelain=v1 --untracked-files=all`, `git branch --show-current`, `git worktree list --porcelain`, `git rev-parse HEAD`, `node --version` and `pnpm --version` separately. Read the then-current package.json, lockfile, consumed contracts and owner journal. Use installed matching pnpm or an already provisioned matching Corepack resolution. If neither exists, keep HOLD_TOOLCHAIN; no download is authorized by v6. Frozen existing-lockfile dependency setup is allowed only under the future implementation's setup authorization. Never substitute a different version or use --passWithNoTests.

Run required asset steps as separate observed commands before targeted tests: `pnpm build:credential-lease` and `pnpm build:widgets`. A platform incapable of the native build may execute a separately labeled pure targeted diagnostic but cannot substitute `test:no-lease` for the required `pnpm test` gate. After focused tests run, retain individual receipts for `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:browser`. Do not change timeout, skip, browser channel or expected assertion to hide a failure. Planned commands below were not executed in this audit.

Receipts name the immutable source SHA/tree, source and dependency blob hashes, Node/pnpm/OS/architecture/browser/native adapter, flag injection, exact command, start/end UTC, exit or cancellation, actual test case identities, passed/failed/skipped counts, and bounded artifact SHA-256. Preserve every baseline failure, cancellation, unknown settlement and unavailable cost. Platform-specific skips are declared individually and never fulfill required gates. Evidence integrity validation is separate from product acceptance.

### Focused commands

```sh
pnpm exec vitest run tests/qa-delegation-v3.test.ts tests/verification-read-models-v3.test.ts tests/verification-evidence-owner-v3.test.ts tests/verification-artifact-routes.test.ts
pnpm build
# Run the exact existing component/browser suite extended in T03/T04 after confirming its registered name; no currently absent security-finding suite is claimed.
```

### Acceptance matrix

| Requirement | Tasks | Required observable result |
|---|---|---|
| S12 | T01, T02 | Reachable exact-authorized source/scope evidence recording, owner-isolated dedupe, no autonomous exploitation. |
| U04 security part | T03, T04 | Existing panel shows permitted scope and evidence quality with historical/stale states. |
| C02, S09 | T02, T04 | Immutable observations/provenance, advisory never an executed PASS, current source rechecked. |
| G02, G03 | T04 | Default-off and rollback retain evidence; no access granted by a finding. |

### Release gates and rollback

HOLD_TOOLCHAIN now. Producer depends on accepted #1030 workflow scope or another explicitly approved existing authenticated action; record HOLD_PRODUCER_CONTRACT until exact interface is accepted. This plan never authorizes exploit execution, target expansion, automated remediation/commit or enabling a capability. Evidence-quality display is independent of accessibility PR1529; do not edit that owned concern.

## STATE

All T01 and later implementation tasks are NOT_STARTED. This audit performed source tracing, original-clause extraction, issue/PR body and discussion comparison, path/reference verification and clean-tree checks only. Product tests, Windows installed tests, live model calls and activation are NOT_RUN. Implementation scope and execution owners must be claimed in the canonical issue before future changes. Next step is T01 after coordinator publishes this complete plan and confirms current owner/source; blocked inputs are not guessed. Preserve ordinary working code, all native histories, accepted memory, tombstones and prior failed observations across rollback.

## REFERENCES

- [Pinned source](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b)
- [Parent audit and read-only scope](https://github.com/skytuhua-org/Gen-V1/issues/1992)
- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
