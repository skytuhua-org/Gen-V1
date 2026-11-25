# Compose approved advisory screening into real plugin activation Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans for future assigned implementation, task by task. This review authorizes plan publication only.

**Goal:** Compose approved advisory screening into real plugin activation.

**Architecture:** Preserve PackageScreeningV1, AdvisoryDatabase.query and ScreeningRecordCache.

**Tech Stack:** Existing TypeScript/Node host, synchronous Store and checked-in Vitest/browser tooling; declared native and live lanes require their own approved environments.

**Spec:** Complete relevant v6 clauses are reproduced in REQUIREMENTS below; the source baseline and prior issue context travel with this document.

## Global Constraints

- Declared Node >=24.10.0 and packageManager pnpm10.30.3. Resolve an installed matching executable; no unauthorized toolchain download.
- Preserve the existing lockfile, source ownership and required checks. Product flags default false and remain host-owned.
- Current review is read-only for the repository. Future edits require their assigned owner; current incomplete native/live lanes remain explicit holds.

## Review Focus

- T01: an absent or ambiguous approved provider must block production composition.
- T02/T03: stale, unavailable and known-bad screening must never become clean or trusted.
- T03: package bytes changed during advisory lookup must fail before activation.
- T04: forged, expired or replayed exception authority must cause zero activation.
- T05: cancellation or interruption must preserve the prior package/index and audit history.

## META

Repository: https://github.com/skytuhua-org/Gen-V1. Plan revision `screen-acceptance-r2`. Date2026-11-23 America/Los_Angeles (audit UTC2026-11-24). Baseline `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`; no working branch or implementation claim created by this review. Audit parent [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992), T01/T02/T03. Publication: Create one focused issue linked to #1031 and #774 after duplicate recheck. Status `BLOCKED_INPUT_CONTRACT`. Source provenance: all relevant v6 original C/S/U/T/G clauses, November18 completion follow-ups, and research v3 read; the archive is an acceptance ledger and does not authorize rebuilding merged milestones.

## OBJECTIVE

The pure screenPackage and installer preflight exist, but scripts/plugin.ts line8 calls installPluginPackage without screening options. With security.executionProfilesV1 enabled and no composed provider, installation refuses at installation.ts lines167-169. The installer also explicitly rejects EXCEPTION_RECORDED at lines173-176 because a caller-supplied actor/reason is not authenticated approval or durable audit evidence. This safe refusal is correct; the original required production preflight and documented trusted exception route remain incomplete. Existing #1368/#1493/#1541 concern dependency inventory/OSV scanning and do not by themselves compose exact plugin package/version/digest activation. No provider/backend is selected by this plan.

## REQUIREMENTS

### Retained original acceptance requirements

The following substantive text is preserved from the supplied v6 archive. It defines acceptance, not permission to repeat its historical implementation sequence. Existing supported code/tests and original owner custody remain in place.

**M03-C04.** PackageScreeningV1: exact package/version/digest, source, advisory database/time, status KNOWN_BAD|NO_KNOWN_MATCH|UNAVAILABLE and decision. NO_KNOWN_MATCH is not safe or trusted. Risk advice is ADVISORY only and cannot authorize.

**M03-S07.** Add a known-advisory preflight to package activation using exact version/digest and cached query age. Do not upload source or secrets to a scanner. Offline/unavailable screening blocks untrusted activation unless the operator explicitly chooses a documented trusted exception; record that exception separately.

**M03-S10.** Add an advisory risk classifier only after the deterministic authority decision. It can explain why approval is required but never convert DENY to ALLOW. Store its model/version and uncertainty as non-authoritative metadata.

**M03-T03.** Scanner unavailable, stale advisory cache, known-bad version and clean lookup are distinct statuses; clean lookup never grants trust.

**M03-G02.** Host-owned flags: security.projectTrustV1, security.secretRefsV1, security.executionProfilesV1. Register only these keys in the shared finite registry; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M03-G03.** Rollback: Revoke new execution profiles and stop owned children; keep original account stores and historical trust/audit records. Restore legacy credential read only after verified compatibility; never loosen an existing policy to recover availability.

### Scope, user flow and compatibility

Before executing a production install test, discover its exact existing fixture file with rg --files tests and inspect it. A proposed integration file above is not claimed to exist. No live provider query, account authorization, package activation, exception or flag enablement was performed in this audit. Missing provider and exception contract are deliverables to the named owners, not permission to improvise. A separately approved provider may support a no-exception first phase, but that must not silently remove the retained documented-exception requirement.

This audit authorizes only review and plan publication. Future repository edits, dependency restoration, privileged test execution and live-account spending require the corresponding existing assignment/input. Existing canonical issues and PRs retain custody until explicit release; no concurrent writer is created by this document. Do not delete retained artifacts/tests or change strict UI preferences. Positive normal behavior, denial reasons, cancellation, restart, rollback and current/historical distinctions below are required; no all-tools, all-platforms or universal-redaction claim.

## REPO_MAP

- [apps/web/src/IntegrationSecretReferences.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/IntegrationSecretReferences.tsx)
- [apps/web/src/OperationExecutionReview.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/OperationExecutionReview.tsx)
- [packages/contracts/execution-profile.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/execution-profile.ts)
- [packages/core/execution-policy.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/execution-policy.ts)
- [packages/core/host-flags.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/host-flags.ts)
- [packages/core/operation-execution-advice.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/operation-execution-advice.ts)
- [packages/core/package-screening.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/package-screening.ts)
- [packages/core/project-trust.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/project-trust.ts)
- [packages/core/secret-references.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/secret-references.ts)
- [packages/plugins/installation.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/plugins/installation.ts)
- [scripts/plugin.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/plugin.ts)

Existing mapped tests, definitions only until actually executed:

- [tests/e2e/integration-secret-references.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/e2e/integration-secret-references.spec.ts)
- [tests/e2e/operation-execution-advice.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/e2e/operation-execution-advice.spec.ts)
- [tests/execution-boundary-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/execution-boundary-v3.test.ts)
- [tests/operation-execution-advice-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/operation-execution-advice-v3.test.mjs)
- [tests/package-screening-cache-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/package-screening-cache-v3.test.ts)
- [tests/project-trust-verification-races-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/project-trust-verification-races-v3.test.mjs)
- [tests/secret-resolution-races-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/secret-resolution-races-v3.test.ts)

Exact finding anchors:

- [scripts/plugin.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/plugin.ts#L5-L12)
- [packages/plugins/installation.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/plugins/installation.ts#L146-L186)
- [packages/core/package-screening.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/package-screening.ts#L15-L27)

## DESIGN

Preserve PackageScreeningV1, AdvisoryDatabase.query and ScreeningRecordCache. Gate production wiring on an exact approved advisory source, version/query semantics, freshness policy, transport/custody and accepted response mapping supplied by the operator/security owner. The source must support the package ecosystem and exact inventory digest identity; an OSV dependency adapter is not automatically a plugin attestation provider. Missing input is HOLD_CONTRACT_SHAPE with provider owner named, while pure tests continue independently.

Installer verifies immutable package inventory before advisory query. Send only required public package identity; never source files, secrets or private payloads. Match database identity/time and exact package/version/digest on cache reads; stale/offline UNAVAILABLE cannot become clean. KNOWN_BAD always denies. NO_KNOWN_MATCH says only no match and never grants project trust, grants or execution profile authority. Perform every required check before stage/index publication, then revalidate immutable input identity at existing guarded write boundary.

The exception route is separately blocked until an existing authenticated host operation and durable audit authority are approved. Do not accept the current pure OperatorException.actor/reason as sufficient or relax the installer throw. The provider must define exact owner/action/package digest/revision binding, recorded reason, one-use/expiry/revocation semantics using existing M02 approval patterns, and a distinct durable exception record without forging the original screening outcome. Exact API/store key and CLI-to-host flow are discovery/approval inputs, not invented here. Once supplied, revise this full plan with those exact interfaces before implementing that join. Keep legacy flag-off behavior and existing package versions/data intact; rollback disables new screened admissions, not deletes history.

## EXECUTION_DAG

Stable task IDs are local to this plan. Every task inherits the fixed source, owner, no-activation and evidence rules above. Task-specific files marked proposed or discovery are not represented as existing repository facts. No blocked provider/backend/interface choice is delegated to an implementer.

### T01: Fix exact provider and authority inputs

**Dependencies:** None.

**Exact files or discovery scope:** packages/core/package-screening.ts; packages/plugins/installation.ts; scripts/plugin.ts; #1368/#1493/#1541 scope.

**Inputs:** Operator/security-approved advisory ID/version/query contract, permitted network destination, cache/freshness and authentication/durable exception owner.

**Executable steps:**

- [ ] Inventory actual install/activation callers with rg and read each.

- [ ] Compare existing dependency scan semantics without importing its network policy automatically.

- [ ] Record exact missing fields.

- [ ] Require approved immutable provider and existing authenticated operation/controller; absent inputs block T03/T04, do not select a service or create credentials.

**Outputs:** Decision record with approved interfaces or named HOLD_CONTRACT_SHAPE and responsible provider.

**Positive, negative and lifecycle validation:** Positive explicit unique approved provider accepted; missing/ambiguous/source-mismatched provider blocked; caller-supplied actor cannot authorize exception.

**Done when:** Implementer has no unspecified architecture/provider choice; blocked inputs exposed in full issue.

**Ownership and handoff:** Security/operator provider plus existing plugin/host owners; coordinator resolves only scope.

### T02: Qualify pure screening and safe refusal

**Dependencies:** T01 independent of live provider.

**Exact files or discovery scope:** packages/core/package-screening.ts; tests/package-screening-cache-v3.test.ts; packages/plugins/installation.ts.

**Inputs:** Owned deterministic advisory fixtures and immutable plugin fixture inventory.

**Executable steps:**

- [ ] Run exact known-bad/no-match/unavailable/stale/future/database-change/cache-identity matrix.

- [ ] Assert provider receives only declared package identity.

- [ ] Observe current CLI missing-provider refusal under scoped test injection, without globally enabling flags.

- [ ] Assert unauthenticated exception rejected before filesystem/index mutation.

**Outputs:** Source-bound pure/caller gap receipt and preserved fail-closed baseline.

**Positive, negative and lifecycle validation:** Allowed known no-match remains neutral; known-bad denies even with exception; stale/offline blocks; changed digest misses cache; no source/secret upload.

**Done when:** Pure states remain distinct; zero activation or stage/index mutation for every deny case.

**Ownership and handoff:** Plugin screening fixture owner, no external network.

### T03: Wire exact approved provider at real entry

**Dependencies:** T01 approved input, T02; assigned implementation owner.

**Exact files or discovery scope:** scripts/plugin.ts; packages/plugins/installation.ts; provider composition location discovered in T01.

**Inputs:** Accepted AdvisoryDatabase implementation and cache lifecycle; exact verified package identity.

**Executable steps:**

- [ ] Use current options.screening seam at supported production install entry.

- [ ] Register approved provider/cache through host-owned composition; do not let plugin/model arguments choose transport or authority.

- [ ] Recheck package/source digest after asynchronous lookup before guarded index publication.

- [ ] Bound timeout/cancel and map transport failures to UNAVAILABLE.

- [ ] If approved composition path is absent, revise plan with exact path before edits.

**Outputs:** Minimal existing-interface composition and actual CLI/host integration test.

**Positive, negative and lifecycle validation:** Approved fixture no-match reaches existing install checks; known-bad/offline/missing provider/digest swap denies; cancel before commit leaves no published active entry; no credential leakage.

**Done when:** Real supported caller executes preflight, not only unit helper; all failure paths preserve prior installed state.

**Ownership and handoff:** Approved plugin composition owner; host/network owner reviews boundary.

### T04: Integrate authenticated durable trusted exception

**Dependencies:** T01 exact exception API approved; T03.

**Exact files or discovery scope:** Existing M02 approval/Store APIs; packages/plugins/installation.ts; approved host command/controller discovered and pinned in T01.

**Inputs:** Exact signed action/package binding and separate durable audit contract.

**Executable steps:**

- [ ] Implement only approved controller.

- [ ] Present exact package/version/digest, unavailable reason, database time and explicit trusted exception decision.

- [ ] Authenticate operator through existing host facility, commit approval consumption and distinct exception admission before install, recheck source/owner/expiry/revocation after async work.

- [ ] Preserve original UNAVAILABLE screening record.

- [ ] Known-bad never bypasses.

- [ ] Do not remove current exceptional refusal until this complete proof path exists.

**Outputs:** Exact durable exception record and controlled installer input with reviewable provenance.

**Positive, negative and lifecycle validation:** Positive authorized unavailable exception once; forged actor/reason, expired/revoked/replayed grant, changed digest/account and persistence failure all zero activation; crash/restart preserves history and uncertainty.

**Done when:** No arbitrary JSON exception input can authorize activation; tests observe actual normal authenticated route.

**Ownership and handoff:** M02/host owner coordinates interface; #1956 outbox custody untouched; plugin owner consumes accepted proof.

### T05: Verify publish/rollback/cancel and current acceptance

**Dependencies:** T02-T04.

**Exact files or discovery scope:** Existing plugin install tests discovered by rg; proposed tests/plugin-screening-activation-v3.test.ts (new only if no exact test exists); package scripts.

**Inputs:** Final source and owned package/provider/host fixtures.

**Executable steps:**

- [ ] Exercise success, deny, cache refresh, cancellation before/after query, process crash around stage/index publication and repeat startup.

- [ ] Existing immutable package and index lock contract remains authoritative.

- [ ] Revoke exception/profile and ensure future activation denied while historical package data retained.

- [ ] Run complete required scripts, record proof separately from #774.

**Outputs:** Full acceptance record with source/runtime results and remaining holds.

**Positive, negative and lifecycle validation:** No partial index on failed admission, no unattended retry of uncertain mutation, prior version retained on rollback; no-match never marks trusted/isolated.

**Done when:** All production and exception flows proven, or precise unavailable inputs remain blocked; no flags enabled for release.

**Ownership and handoff:** Plugin acceptance owner to new canonical issue and #1031/#774 dependency ledgers.

## VALIDATION

### Reproducible setup and planned commands

The asset-build commands below are prerequisites for their consuming tests. Build widgets before App/widget-dependent focused tests. The native credential-lease build is required for its native/full-test lane; a missing compiler blocks that lane rather than authorizing test:no-lease as release evidence. Run from the exact assigned candidate repository root, with declared Node>=24.10.0 and actual pnpm10.30.3 resolved offline. Record executable identity, cwd physical identity, source/tree, UTC start/end, exit/termination, per-case totals and bounded redacted log digest for each command. Missing tools/dependencies/native compiler/browser/Hermes environment mean the consuming lane is BLOCKED/NOT_RUN. No new toolchain download, substitutions or changed lockfile. All following commands are **planned and NOT_RUN by this audit**, except the separately identified existing Node control suite.

```text
node --version
pnpm --version
pnpm build:widgets
pnpm build:credential-lease
pnpm exec vitest run tests/package-screening-cache-v3.test.ts tests/execution-boundary-v3.test.ts --maxWorkers=1
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:browser
```

Focused checks do not replace required full typecheck/lint/unit/build/browser or actual native/live lanes. Run only after prerequisites and exact implementation ownership permit. A real denied attack may pass its asserted expected-negative case; a red test process, setup exception or timeout remains a failed/blocked command. Preserve unsuccessful attempts and run the same fixture against baseline/candidate when classification is needed. Never change the required browser channel, fixture, budget or assertion to obtain green.

### Acceptance matrix

| Check | Subject | Task IDs | Required observable result |
|---|---|---|---|
| A01 | Provider/authority decision | T01 | Exact approved provider and authenticated exception contract; otherwise scoped BLOCKED |
| A02 | Screening/cache semantics | T02 | Known-bad/no-match/unavailable distinct; exact identity/freshness; no source/secret upload |
| A03 | Production integration | T03 | Real caller runs approved preflight and publishes nothing on deny/cancel/drift |
| A04 | Exception authority | T04 | Authenticated exact one-use durable exception separate from original screening result |
| A05 | Recovery/rollback | T05 | Immutable package/index/history preserved; no uncertain automatic activation |

### Requirement-to-task completeness

| Original requirement | Task coverage | Acceptance |
|---|---|---|
| M03-C04 | T02, T03, T04 | A02, A04 |
| M03-S07 | T01, T02, T03, T04 | A01, A02, A03, A04 |
| M03-S10 | T02, T04 | A02 |
| M03-T03 | T02, T03 | A02, A03 |
| M03-G02 | T01, T05 | A01, A05 |
| M03-G03 | T05 | A05 |


### Actually executed in this read-only audit

Source/issue/PR-body inspection and exact repository blob comparisons were performed. Existing dependency-free `node --test scripts/validate-m01-m03-integration.test.mjs` passed4/4 with0 fail/skip/cancel on the audited SHA; latest duration2451.852311ms and raw log are in the external audit evidence. This only tests the immutable control harness with owned synthetic fixtures. It does not prove this plan’s product behavior. Product Vitest/typecheck/lint/build/browser/native/live commands are NOT_RUN: required pnpm10.30.3 and node_modules are absent, available pnpm11.25.0 mismatches. Node24.22.3 is available. `HOLD_TOOLCHAIN` remains. No source-only or candidate-body historical result is reported as current acceptance.

### Release gate and rollback

All applicable required cases must pass on the final integrated source, and every unavailable platform/live/input lane remains explicitly blocked. Validate current V3 evidence with the existing owner and computed status; hold undefined legacy migration at HOLD_CONTRACT_SHAPE. `reviewerApproval=false` and all unproven host flags remain off. Passing a fixture, producing a source hash, or merging a PR is insufficient for deployment/activation. Rollback preserves account/trust/ledger/approval records and earlier evidence; disable only new admissions/wiring and stop owned children where supported, without deleting unrelated files or repeating uncertain effects.

## STATE

Researched and decided: exact reviewed source, original requirements, current production/caller gaps, ownership and safe blocked-input handling. Implemented by this audit: none. Verified by this audit: source inventory/metadata and four dependency-free control tests only. Pending: task-specific committed execution, candidate compatibility, exact-head CI, independent review, and any named operator/backend/provider/live inputs. Existing implementation PRs remain open until GitHub metadata proves otherwise; stale body heads or queued jobs are not acceptance. Latest publication owner is root coordinator `codex-cloud-ca7d38`; original source reviewer is `codex-cloud-m0103-ac1a13`; final artifact reviewer is `codex-cloud-m0103-finish-e71314`. No assignee or implementation custody transferred by this file.

First executable next step is T01. It is read-only scope/source/owner/input reconciliation. The actual GitHub filechooser upload failed in the coordinator environment. This plan is a real UTF-8 .md file for the deliverables, but it is not represented as a hosted GitHub attachment. No repository-docs commit is authorized. The complete canonical issue body is the required durable fallback. Current audit deliverable remains HANDOFF_INCOMPLETE until the coordinator publishes this complete body and reads it back, with actual file attachment if available or an honest attachment limitation. A local path alone is not durable issue handoff. Every future worker posts START/20-minute and milestone checkpoints and final RELEASE OWNER=NONE on its canonical issue/parent, preserving previous failed attempts.

## REFERENCES

- [#1031](https://github.com/skytuhua-org/Gen-V1/issues/1031)
- [#774](https://github.com/skytuhua-org/Gen-V1/issues/774)
- [#1368](https://github.com/skytuhua-org/Gen-V1/issues/1368)
- [#1493](https://github.com/skytuhua-org/Gen-V1/pull/1493)
- [#1541](https://github.com/skytuhua-org/Gen-V1/pull/1541)

- [Audit source tree](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b)
- [Repository coordination and full-plan contract](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [Contribution requirements](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)

The supplied v6 source clauses necessary to execute this plan are reproduced in REQUIREMENTS. Completion appendix substance is preserved in exact current source binding, complete owner/action checks, proper barriers/real cancellation, actual installed/live evidence, no invented backend/provider, and preservation of prior failures. Research rationale is summarized here: committed host authority and real external receipts outrank narratives; minimum destination-bound secret delivery is separate from process isolation; paired measured outcomes must retain denominators, costs and uncertainty. Research does not authorize a donor implementation or replace a platform proof.
