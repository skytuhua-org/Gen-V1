# Qualify pre-launch rejection of untrackable GitHub credentials Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans for future assigned implementation, task by task. This review authorizes plan publication only.

**Goal:** Qualify pre-launch rejection of untrackable GitHub credentials.

**Architecture:** Reuse createSecretRedactor exactly; do not expand its tracking semantics or weaken the8-character rule.

**Tech Stack:** Existing TypeScript/Node host, synchronous Store and checked-in Vitest/browser tooling; declared native and live lanes require their own approved environments.

**Spec:** Complete relevant v6 clauses are reproduced in REQUIREMENTS below; the source baseline and prior issue context travel with this document.

## Global Constraints

- Declared Node >=24.10.0 and packageManager pnpm10.30.3. Resolve an installed matching executable; no unauthorized toolchain download.
- Preserve the existing lockfile, source ownership and required checks. Product flags default false and remain host-owned.
- Current review is read-only for the repository. Future edits require their assigned owner; current incomplete native/live lanes remain explicit holds.

## Review Focus

- T02/T03: every unsupported credential must be refused before setup or child creation.
- T02/T03: supported-token encoded, structured and ANSI output must preserve safe data while masking known values.
- T04: target account revocation must not invalidate an unrelated account.
- T04: child failure and timeout must not expose credentials or leak an owned child.
- T01/T05: surviving PR ownership and actual current tests must control acceptance.

## META

Repository: https://github.com/skytuhua-org/Gen-V1. Plan revision `secret-acceptance-r2`. Date2026-11-23 America/Los_Angeles (audit UTC2026-11-24). Baseline `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`; no working branch or implementation claim created by this review. Audit parent [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992), T01/T02/T03. Publication: Create a focused acceptance child of [#1031](https://github.com/skytuhua-org/Gen-V1/issues/1031), preserving existing implementation ownership. Status `IMPLEMENTATION_PENDING_ACCEPTANCE`. Source provenance: all relevant v6 original C/S/U/T/G clauses, November18 completion follow-ups, and research v3 read; the archive is an acceptance ledger and does not authorize rebuilding merged milestones.

## OBJECTIVE

GitHubTools.run currently retrieves token, creates its configuration directory and calls execFile with GH_TOKEN at lines30-33; createSecretRedactor runs only afterward at line35. The existing redactor deliberately ignores credentials shorter than8 characters. Thus an unsupported known token can reach a child before the adapter can sanitize its output. This source gap has pending PR#1634, so the new child owns exact acceptance linked to #1031/#1634, not a competing implementation. Context7 already has #802's pre-launch redactor acceptance check and must be preserved. Success is fixed nonsecret refusal and zero child creation for an untrackable token, with unchanged supported-token behavior.

## REQUIREMENTS

### Retained original acceptance requirements

The following substantive text is preserved from the supplied v6 archive. It defines acceptance, not permission to repeat its historical implementation sequence. Existing supported code/tests and original owner custody remain in place.

**M03-C02.** SecretRefV1 exposes only opaque ID, purpose, owner and permitted destination. Resolution occurs inside the authorized executor after approval. Secret values, raw environment dumps and low-entropy secret hashes never enter model context or public journals.

**M03-S01.** Inventory current credential storage, environment inheritance, plugin import and process launch call sites. Record metadata only. Keep native account stores canonical; do not migrate or delete credentials merely to introduce SecretRef.

**M03-S05.** Resolve SecretRefs only for the smallest authorized process or HTTP destination. Start children from an explicit environment allowlist rather than copying process.env. Revocation prevents subsequent use, while already delivered external secrets cannot be retroactively undisclosed.

**M03-S06.** Apply structured redaction before logs or model output. Test known token fields, ANSI-split output, multiline values and encoded text. Do not claim universal redaction; avoid logging unclassified secret-bearing content by default. Images require explicit capture consent, not an assumed perfect text scrubber.

**M03-T02.** Credential revocation blocks the correct account without invalidating unrelated accounts. Children do not inherit host-wide secrets.

**M03-G03.** Rollback: Revoke new execution profiles and stop owned children; keep original account stores and historical trust/audit records. Restore legacy credential read only after verified compatibility; never loosen an existing policy to recover availability.

### Scope, user flow and compatibility

Observed pending PR#1634 headf142fe7f7517d717f84fe140cb2ba74916667ea2, base8fa907f378127bcfc23d71b55c53625ffc43e8da. Its own evidence is source/readback, not executed current repository acceptance. Existing Context7 guard at packages/integrations/index.ts lines123-126 is retained. Public user flow is a fixed nonsecret actionable failure before launch; no reveal-by-agent control or new token-length telemetry.

This audit authorizes only review and plan publication. Future repository edits, dependency restoration, privileged test execution and live-account spending require the corresponding existing assignment/input. Existing canonical issues and PRs retain custody until explicit release; no concurrent writer is created by this document. Do not delete retained artifacts/tests or change strict UI preferences. Positive normal behavior, denial reasons, cancellation, restart, rollback and current/historical distinctions below are required; no all-tools, all-platforms or universal-redaction claim.

## REPO_MAP

- [apps/server/integration-host.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/integration-host.ts)
- [docs/implementation/v3/M03-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M03-verification.json)
- [packages/contracts/execution-profile.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/execution-profile.ts)
- [packages/core/execution-policy.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/execution-policy.ts)
- [packages/core/project-trust.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/project-trust.ts)
- [packages/core/secret-references.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/secret-references.ts)
- [packages/integrations/context7-secret-reference.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/integrations/context7-secret-reference.ts)
- [packages/integrations/index.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/integrations/index.ts)
- [packages/workspace/github.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/workspace/github.ts)
- [scripts/verify-readiness.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/verify-readiness.ts)

Existing mapped tests, definitions only until actually executed:

- [tests/execution-boundary-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/execution-boundary-v3.test.ts)
- [tests/github-output-redaction-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/github-output-redaction-v3.test.ts)
- [tests/integration-secret-output-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/integration-secret-output-v3.test.mjs)
- [tests/integration-secret-reference-contract-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/integration-secret-reference-contract-v3.test.ts)
- [tests/integration-secret-reference-http-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/integration-secret-reference-http-v3.test.ts)
- [tests/project-trust-verification-races-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/project-trust-verification-races-v3.test.mjs)
- [tests/readiness-manifest.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/readiness-manifest.test.ts)
- [tests/secret-approval-lifetime-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/secret-approval-lifetime-v3.test.ts)
- [tests/secret-custody-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/secret-custody-v3.test.ts)
- [tests/secret-redaction-json-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/secret-redaction-json-v3.test.ts)
- [tests/secret-resolution-races-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/secret-resolution-races-v3.test.ts)

Exact finding anchors:

- [packages/workspace/github.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/workspace/github.ts#L24-L41)
- [packages/core/secret-references.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/secret-references.ts#L152-L186)
- [packages/integrations/index.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/integrations/index.ts#L123-L126)

## DESIGN

Reuse createSecretRedactor exactly; do not expand its tracking semantics or weaken the8-character rule. In the existing GitHubTools.run, obtain the existing canonical token, construct the redactor once, require tracked>0 before filesystem setup or execFile, and reuse that same redactor for decoded structured and plain output. The existing #1634 candidate supplies this two-file change. Never expose token value, token-derived low-entropy hash or environment dump in rejection/evidence.

Keep destination-bound GH_TOKEN child delivery, explicit process environment, timeout/buffer limit, JSON-string decoding before redaction and fixed child failure error. Existing raw/percent/base64/ANSI/structured-output fixtures remain. Revocation after external delivery cannot erase already received data; tests and UI must not imply otherwise. No credential migration, new store, account switching, generic redactor rewrite, backend choice or flag enablement. Rollback of this repair may only restore an explicitly verified secure compatible behavior; unsupported values must remain denied, not regain launch availability.

## EXECUTION_DAG

Stable task IDs are local to this plan. Every task inherits the fixed source, owner, no-activation and evidence rules above. Task-specific files marked proposed or discovery are not represented as existing repository facts. No blocked provider/backend/interface choice is delegated to an implementer.

### T01: Bind existing candidate and credential destination

**Dependencies:** None.

**Exact files or discovery scope:** packages/workspace/github.ts; packages/core/secret-references.ts; packages/workspace/github-auth.ts; PR#1634.

**Inputs:** Exact candidate metadata, existing #1031/#774 owner journal.

**Executable steps:**

- [ ] Read full GitHubTools.run and token retrieval lifecycle; compare #1634 exact two-file diff; identify all public callers routed through run without retrieving real token values.

- [ ] Preserve current owner; claim verification only and no account access.

**Outputs:** Source/call graph and owner handoff.

**Positive, negative and lifecycle validation:** Positive all relevant GitHub child paths reach same guard; missing alternate caller mapped explicitly.

**Done when:** No alternate credential path or unrelated store migration invented.

**Ownership and handoff:** Acceptance reviewer to #1634 implementation owner.

### T02: Run synthetic baseline rejection and positive controls

**Dependencies:** T01, exact installed prerequisites.

**Exact files or discovery scope:** tests/github-output-redaction-v3.test.ts.

**Inputs:** Existing owned fake CLI, disposable test profile and synthetic5/7-character tokens plus supported long token.

**Executable steps:**

- [ ] Use normal public adapter with fake executable marker.

- [ ] For each short token assert fixed nonsecret error and no marker.

- [ ] Preserve baseline result if current source launches.

- [ ] For long token emit raw/percent/base64/ANSI/JSON escaped variants and assert all known values absent.

- [ ] Use no actual account or network.

**Outputs:** Source-bound baseline and unchanged fixture definitions.

**Positive, negative and lifecycle validation:** Short token negative no child/no public token; supported token positive valid output; failed child fixed nonsecret error.

**Done when:** Intended assertion observed; setup or fixture launch errors not called successful denial.

**Ownership and handoff:** Fixture owner within accepted candidate custody.

### T03: Verify candidate guard precedes all child setup

**Dependencies:** T02; existing #1634 handoff.

**Exact files or discovery scope:** packages/workspace/github.ts; tests/github-output-redaction-v3.test.ts.

**Inputs:** PR#1634 accepted code and exact fixtures.

**Executable steps:**

- [ ] Read or apply only existing two-file repair on its owned branch if authorized.

- [ ] Confirm one redactor constructed immediately after token retrieval and guard before mkdir/execFile.

- [ ] Reuse same instance for JSON/plain sanitization.

- [ ] Preserve normal environment and child lifecycle.

- [ ] Reject empty/untrackable without token text in error.

**Outputs:** Minimal candidate diff and output comparison.

**Positive, negative and lifecycle validation:** 5/7-character no-launch; length8 supported boundary using existing tracking definition; revoked/unavailable account error remains fixed; output controls unchanged.

**Done when:** Every unsupported credential refused before child creation; positive behavior retained.

**Ownership and handoff:** Existing #1634 owner; independent review by child verifier.

### T04: Verify cleanup and account/cancel boundaries

**Dependencies:** T03.

**Exact files or discovery scope:** tests/github-output-redaction-v3.test.ts; existing secret-resolution/account test suites.

**Inputs:** Owned child timeout marker, two synthetic account fixtures and existing lifecycle APIs.

**Executable steps:**

- [ ] Run supported-token child failure/timeout and repeat requests; verify no secret in failure path or evidence.

- [ ] Test revocation/unavailable correct account without altering unrelated account.

- [ ] If run has no AbortSignal contract, do not invent cancellation API; record existing timeout/host disposal behavior and verify its actual cleanup.

**Outputs:** Destination/account/cleanup receipt.

**Positive, negative and lifecycle validation:** Allowed account still works; revoked target refuses; timeout owned child gone; errors contain only fixed diagnostics.

**Done when:** No collateral account invalidation or secret propagation; any unsupported lifecycle join separately named.

**Ownership and handoff:** GitHub adapter owner; hand secret coverage to M03 verifier.

### T05: Record final accepted source and regression results

**Dependencies:** T04.

**Exact files or discovery scope:** Existing test commands and child issue body.

**Inputs:** Final PR head/CI/review/current-main compatibility.

**Executable steps:**

- [ ] Execute focused then relevant full gates on final source; keep missing Windows/native checks explicit.

- [ ] Re-read exact head and independent review.

- [ ] Publish current acceptance linked to original #1634 and #1031 without merge/activation.

**Outputs:** Read-back complete plan and acceptance record.

**Positive, negative and lifecycle validation:** No missing command/case can become PASS; source-only inspection and mocked host are labeled.

**Done when:** Short-token defect accepted only after actual committed tests; #774 remains separate blocked gate.

**Ownership and handoff:** Child verifier releases scope to #1031 coordinator.

## VALIDATION

### Reproducible setup and planned commands

The asset-build commands below are prerequisites for their consuming tests. Build widgets before App/widget-dependent focused tests. The native credential-lease build is required for its native/full-test lane; a missing compiler blocks that lane rather than authorizing test:no-lease as release evidence. Run from the exact assigned candidate repository root, with declared Node>=24.10.0 and actual pnpm10.30.3 resolved offline. Record executable identity, cwd physical identity, source/tree, UTC start/end, exit/termination, per-case totals and bounded redacted log digest for each command. Missing tools/dependencies/native compiler/browser/Hermes environment mean the consuming lane is BLOCKED/NOT_RUN. No new toolchain download, substitutions or changed lockfile. All following commands are **planned and NOT_RUN by this audit**, except the separately identified existing Node control suite.

```text
node --version
pnpm --version
pnpm build:widgets
pnpm build:credential-lease
pnpm exec vitest run tests/github-output-redaction-v3.test.ts tests/secret-custody-v3.test.ts tests/secret-resolution-races-v3.test.ts tests/secret-redaction-json-v3.test.ts tests/integration-secret-output-v3.test.mjs --maxWorkers=1
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
| A01 | No unsupported-token child | T02,T03 | 5/7-character and empty/untrackable values rejected before setup/execFile with fixed error |
| A02 | Supported output behavior | T02,T03 | Known long token variants sanitized while normal JSON/plain output preserved |
| A03 | Account/lifecycle | T04 | Correct account revocation, no unrelated impact, bounded child failure/timeout cleanup |
| A04 | Acceptance source | T01,T05 | Exact surviving PR/current tests/review; no activation inferred |

### Requirement-to-task completeness

| Original requirement | Task coverage | Acceptance |
|---|---|---|
| M03-C02 | T01, T03, T04 | A01, A02, A03 |
| M03-S01 | T01 | A04 |
| M03-S05 | T03, T04 | A03 |
| M03-S06 | T02, T03, T04 | A02 |
| M03-T02 | T03, T04 | A03 |
| M03-G03 | T04, T05 | A03, A04 |


### Actually executed in this read-only audit

Source/issue/PR-body inspection and exact repository blob comparisons were performed. Existing dependency-free `node --test scripts/validate-m01-m03-integration.test.mjs` passed4/4 with0 fail/skip/cancel on the audited SHA; latest duration2451.852311ms and raw log are in the external audit evidence. This only tests the immutable control harness with owned synthetic fixtures. It does not prove this plan’s product behavior. Product Vitest/typecheck/lint/build/browser/native/live commands are NOT_RUN: required pnpm10.30.3 and node_modules are absent, available pnpm11.25.0 mismatches. Node24.22.3 is available. `HOLD_TOOLCHAIN` remains. No source-only or candidate-body historical result is reported as current acceptance.

### Release gate and rollback

All applicable required cases must pass on the final integrated source, and every unavailable platform/live/input lane remains explicitly blocked. Validate current V3 evidence with the existing owner and computed status; hold undefined legacy migration at HOLD_CONTRACT_SHAPE. `reviewerApproval=false` and all unproven host flags remain off. Passing a fixture, producing a source hash, or merging a PR is insufficient for deployment/activation. Rollback preserves account/trust/ledger/approval records and earlier evidence; disable only new admissions/wiring and stop owned children where supported, without deleting unrelated files or repeating uncertain effects.

## STATE

Researched and decided: exact reviewed source, original requirements, current production/caller gaps, ownership and safe blocked-input handling. Implemented by this audit: none. Verified by this audit: source inventory/metadata and four dependency-free control tests only. Pending: task-specific committed execution, candidate compatibility, exact-head CI, independent review, and any named operator/backend/provider/live inputs. Existing implementation PRs remain open until GitHub metadata proves otherwise; stale body heads or queued jobs are not acceptance. Latest publication owner is root coordinator `codex-cloud-ca7d38`; original source reviewer is `codex-cloud-m0103-ac1a13`; final artifact reviewer is `codex-cloud-m0103-finish-e71314`. No assignee or implementation custody transferred by this file.

First executable next step is T01. It is read-only scope/source/owner/input reconciliation. The actual GitHub filechooser upload failed in the coordinator environment. This plan is a real UTF-8 .md file for the deliverables, but it is not represented as a hosted GitHub attachment. No repository-docs commit is authorized. The complete canonical issue body is the required durable fallback. Current audit deliverable remains HANDOFF_INCOMPLETE until the coordinator publishes this complete body and reads it back, with actual file attachment if available or an honest attachment limitation. A local path alone is not durable issue handoff. Every future worker posts START/20-minute and milestone checkpoints and final RELEASE OWNER=NONE on its canonical issue/parent, preserving previous failed attempts.

## REFERENCES

- [#1031](https://github.com/skytuhua-org/Gen-V1/issues/1031)
- [#1634](https://github.com/skytuhua-org/Gen-V1/pull/1634)
- [#774](https://github.com/skytuhua-org/Gen-V1/issues/774)
- [#802](https://github.com/skytuhua-org/Gen-V1/pull/802)

- [Audit source tree](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b)
- [Repository coordination and full-plan contract](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [Contribution requirements](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)

The supplied v6 source clauses necessary to execute this plan are reproduced in REQUIREMENTS. Completion appendix substance is preserved in exact current source binding, complete owner/action checks, proper barriers/real cancellation, actual installed/live evidence, no invented backend/provider, and preservation of prior failures. Research rationale is summarized here: committed host authority and real external receipts outrank narratives; minimum destination-bound secret delivery is separate from process isolation; paired measured outcomes must retain denominators, costs and uncertainty. Research does not authorize a donor implementation or replace a platform proof.
