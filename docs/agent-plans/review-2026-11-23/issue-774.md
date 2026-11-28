**Full current issue mirror:** [issue-774.md](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-774.md). The publication checkpoint pins the exact commit.

Publication supplement under #1803, cleanup-2026-11-23-r2: preserve the concurrent #1992 plan below. The required approved installed backend, native Windows matrix and independent security acceptance remain open. Its earlier repository-publication limitation describes that separate audit; this cleanup supplies the full versioned mirror without claiming native execution.

# M03 exact approved backend and native platform acceptance Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans for future assigned implementation, task by task. This review authorizes plan publication only.

**Goal:** M03 exact approved backend and native platform acceptance.

**Architecture:** Use existing ExecutionBackend and evaluateExecution/selectBackend contracts.

**Tech Stack:** Existing TypeScript/Node host, synchronous Store and checked-in Vitest/browser tooling; declared native and live lanes require their own approved environments.

**Spec:** Complete relevant v6 clauses are reproduced in REQUIREMENTS below; the source baseline and prior issue context travel with this document.

## Global Constraints

- Declared Node >=24.10.0 and packageManager pnpm10.30.3. Resolve an installed matching executable; no unauthorized toolchain download.
- Preserve the existing lockfile, source ownership and required checks. Product flags default false and remain host-owned.
- Current review is read-only for the repository. Future edits require their assigned owner; current incomplete native/live lanes remain explicit holds.

## Review Focus

- T01/T02: missing backend, changed policy or proof mismatch must cause zero launch.
- T03/T04: outside-root, protected-state, junction and hardlink fixtures must observe the actual installed policy.
- T04: network, child, registry and second-user denials require a successful same-profile in-root control.
- T05: forced kill, revocation and restart must preserve uncertain history and clean up owned children.
- T06: source inspection, mocks and a different platform must never substitute for independent native proof.

## META

Repository: https://github.com/skytuhua-org/Gen-V1. Plan revision `platform-acceptance-r2`. Date2026-11-23 America/Los_Angeles (audit UTC2026-11-24). Baseline `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`; no working branch or implementation claim created by this review. Audit parent [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992), T01/T02/T03. Publication: Reuse [#774](https://github.com/skytuhua-org/Gen-V1/issues/774). Status `BLOCKED_PLATFORM_INPUTS`. Source provenance: all relevant v6 original C/S/U/T/G clauses, November18 completion follow-ups, and research v3 read; the archive is an acceptance ledger and does not authorize rebuilding merged milestones.

## OBJECTIVE

Current execution-policy exposes an explicit backend/proof contract and rejects missing or ambiguous selections; no concrete approved installed native backend, immutable approval identity, real packaged Windows negative/allow matrix or independent security acceptance has been supplied. Existing #774 owns this exact gate. Source presence, mocked backend and Job Object lifecycle controls do not prove Windows file/process/network confinement. Success requires an operator-approved exact installed backend and final packaged launcher under its actual policy, every mandated denial plus normal authorized control, and independent review. Keep core trust/SecretRef qualification separate.

## REQUIREMENTS

### Retained original acceptance requirements

The following substantive text is preserved from the supplied v6 archive. It defines acceptance, not permission to repeat its historical implementation sequence. Existing supported code/tests and original owner custody remain in place.

**M03-C01.** ProjectTrustV1 binds canonical physical root identity, approved executable/configuration digests, scope, user decision and revision. Reading ordinary granted text remains distinct from executing its configuration. Root aliases or changed executable bytes invalidate the applicable decision.

**M03-C02.** SecretRefV1 exposes only opaque ID, purpose, owner and permitted destination. Resolution occurs inside the authorized executor after approval. Secret values, raw environment dumps and low-entropy secret hashes never enter model context or public journals.

**M03-C03.** ExecutionProfileV1: profileId, version, backendId, capabilities, readRoots, writeRoots, networkPolicy, secretRefs, executableAllowlist and platformProofRef. First untrusted product profile is WORKSPACE_EXECUTE_NO_NETWORK. TRUSTED_HOST is explicitly labeled unrestricted and is never an automatic fallback.

**M03-S03.** Use canonical root plus existing path-identity guards, including Windows reparse/junction and hardlink cases. Reject unresolved aliases at execution time. A path string prefix is not an authority check.

**M03-S04.** Implement exact executable/argv/cwd classification for shell launches. First version accepts already approved executable argv, not a newly written general shell parser. Arbitrary shell expressions remain a single effectful command requiring explicit approval and confinement. Unknown syntax cannot become read-only by a regex match.

**M03-S05.** Resolve SecretRefs only for the smallest authorized process or HTTP destination. Start children from an explicit environment allowlist rather than copying process.env. Revocation prevents subsequent use, while already delivered external secrets cannot be retroactively undisclosed.

**M03-S08.** Build the execution backend adapter and negative-test contract first. Require one explicit approvedBackendId supplied by the operator/source lock, pointing to an installed, independently approved backend whose actual process launch enforces the declared file, process and network policy. If none or multiple ambiguous choices are supplied, return BLOCKED_BACKEND_SELECTION; do not choose a backend yourself. The document does not authorize writing an improvised restricted-token implementation or installing system services. Missing backend yields UNSUPPORTED_BACKEND and keeps executable stages disabled.

**M03-S09.** For native Windows enablement, test the actual packaged launcher under its real token and network policy: outside-root read/write, protected account/app state, DNS/TCP, child escape, registry writes, junction swaps, second-user access and cleanup after kill. Job Objects are lifetime controls only. A container profile is separately named and tested; it is not advertised as native-token proof.

**M03-S11.** Trust/SecretRef/screening pure contracts can be integrated while native proof is blocked. Every consumer that executes untrusted code must require a PASS platformProofRef at launch. Disable on policy or executable change; never silently degrade to trusted host execution.

**M03-U02.** Execution status shows actual backend and policy, with Unrestricted host unmistakably separate from Isolated. Missing backend explains which stage is blocked.

**M03-T01.** Executable changes after approval, root retargets and unknown shell grammar deny before spawn. Reading an ordinary granted text file still works.

**M03-T02.** Credential revocation blocks the correct account without invalidating unrelated accounts. Children do not inherit host-wide secrets.

**M03-T04.** Run the declared Windows negative matrix on actual target hardware/build. Unsupported OS cases remain BLOCKED, not silently skipped as pass.

**M03-T05.** Backend initialization failure, policy change and child breakout leave no unrestricted fallback. Allowed in-root operations still work.

**M03-G01.** Core trust/secret contract acceptance is separate from executable profile acceptance. Native platform proof and independent security review are mandatory for privileged stages. No backend is certified by source inspection alone.

**M03-G02.** Host-owned flags: security.projectTrustV1, security.secretRefsV1, security.executionProfilesV1. Register only these keys in the shared finite registry; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M03-G03.** Rollback: Revoke new execution profiles and stop owned children; keep original account stores and historical trust/audit records. Restore legacy credential read only after verified compatibility; never loosen an existing policy to recover availability.

**M01-G01.** Core infrastructure can pass on the actual development OS. Windows containment, installed-desktop and live-model claims remain explicitly NOT_RUN until tested on their required environments. No performance improvement is claimed from synthetic timings alone.

**M02-G01.** M01 core evidence is required. Host-observed paths may be enabled only after coverage tests; unobservable native paths remain labeled and cannot use new verified-effect claims. OS confinement is not established by this bundle.

### Scope, user flow and compatibility

Native executable commands are intentionally not invented. T03 must recover exact existing approved launcher/workflow from the canonical #774 source-lock decision and insert it into this full plan before native execution; absence blocks T03-T06. Windows denial categories count outside read/write separately, protected app/account collectively but must observe both, DNS/TCP separately, child escape, registry, junction and hardlink swaps, second user; kill cleanup is a separate lifecycle criterion. Existing implementation test mocks can only certify contract behavior. This plan does not require source code deletion or replacement of TRUSTED_HOST.

This audit authorizes only review and plan publication. Future repository edits, dependency restoration, privileged test execution and live-account spending require the corresponding existing assignment/input. Existing canonical issues and PRs retain custody until explicit release; no concurrent writer is created by this document. Do not delete retained artifacts/tests or change strict UI preferences. Positive normal behavior, denial reasons, cancellation, restart, rollback and current/historical distinctions below are required; no all-tools, all-platforms or universal-redaction claim.

## REPO_MAP

- [apps/server/effect-service.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/effect-service.ts)
- [apps/server/hermes-service.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/hermes-service.ts)
- [apps/server/integration-host.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/integration-host.ts)
- [apps/web/src/OperationExecutionReview.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/OperationExecutionReview.tsx)
- [docs/implementation/v3/M01-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M01-verification.json)
- [docs/implementation/v3/M02-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M02-verification.json)
- [packages/capabilities/repository-test-binding.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/capabilities/repository-test-binding.ts)
- [packages/contracts/execution-profile.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/execution-profile.ts)
- [packages/core/execution-policy.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/execution-policy.ts)
- [packages/core/file-access.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/file-access.ts)
- [packages/core/host-flags.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/host-flags.ts)
- [packages/core/operation-execution-advice.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/operation-execution-advice.ts)
- [packages/core/operation-project-trust.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/operation-project-trust.ts)
- [packages/core/project-trust.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/project-trust.ts)
- [packages/core/secret-references.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/secret-references.ts)
- [packages/core/service.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts)
- [packages/core/tool-authority.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/tool-authority.ts)
- [packages/core/verification-executor.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/verification-executor.ts)
- [packages/integrations/context7-secret-reference.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/integrations/context7-secret-reference.ts)
- [packages/integrations/index.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/integrations/index.ts)
- [scripts/verify-readiness.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/scripts/verify-readiness.ts)

Existing mapped tests, definitions only until actually executed:

- [tests/e2e/operation-execution-advice.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/e2e/operation-execution-advice.spec.ts)
- [tests/e2e/tool-effects-host.spec.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/e2e/tool-effects-host.spec.ts)
- [tests/execution-boundary-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/execution-boundary-v3.test.ts)
- [tests/execution-platform-proof-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/execution-platform-proof-v3.test.ts)
- [tests/integration-secret-reference-http-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/integration-secret-reference-http-v3.test.ts)
- [tests/operation-project-trust-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/operation-project-trust-v3.test.ts)
- [tests/project-trust-custody-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/project-trust-custody-v3.test.ts)
- [tests/project-trust-hardlinks-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/project-trust-hardlinks-v3.test.ts)
- [tests/project-trust-persistence-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/project-trust-persistence-v3.test.ts)
- [tests/project-trust-verification-races-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/project-trust-verification-races-v3.test.mjs)
- [tests/readiness-manifest.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/readiness-manifest.test.ts)
- [tests/secret-approval-lifetime-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/secret-approval-lifetime-v3.test.ts)
- [tests/secret-custody-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/secret-custody-v3.test.ts)
- [tests/secret-resolution-races-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/secret-resolution-races-v3.test.ts)
- [tests/tool-effect-hard-crash-v3.test.mjs](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/tool-effect-hard-crash-v3.test.mjs)

Exact finding anchors:

- [packages/core/execution-policy.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/execution-policy.ts#L141-L237)
- [apps/server/hermes-service.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/hermes-service.ts#L38-L43)
- [packages/core/operation-project-trust.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/operation-project-trust.ts#L200-L205)

## DESIGN

Use existing ExecutionBackend and evaluateExecution/selectBackend contracts. Operator/source lock must provide one explicit approvedBackendId, backend version/installation digest and independently approved implementation, exact executable digest, declared profile and platformProofRef recognized by current policy. First untrusted product profile remains WORKSPACE_EXECUTE_NO_NETWORK; TRUSTED_HOST remains explicit unrestricted operation only and never fallback. The document authorizes neither improvised restricted-token code nor installing services/backends.

Missing, ambiguous or mismatched backend/proof returns existing fail-closed status and disables executable stages. Pure contracts/UI may continue without claiming isolation. Bind proof to backend/version/policy/executable and exact platform/build; if current schema cannot express required identity, preserve code and block HOLD_CONTRACT_SHAPE for approved contract decision. Never fabricate proof by writing PASS into a fixture. Revalidate trust/root/argv/cwd/secret destination and current owner immediately before approved backend.launch; any post-check policy/executable/root change denies.

Run native Windows tests on the actual installed packaged launcher with real token/network policy and owned synthetic resources. A separately named Linux/container environment needs its own exact approved profile, source and matrix. No proof transfers between them. Inspect actual child cleanup, second-user and protected-state boundaries without touching unrelated user data. Independent security reviewer must verify source, environment, actual negative receipts and positive controls. Rollback revokes profiles, prevents new launch and terminates only owned children, preserving account stores, trust decisions and audit history; never recover availability by loosening policy.

## EXECUTION_DAG

Stable task IDs are local to this plan. Every task inherits the fixed source, owner, no-activation and evidence rules above. Task-specific files marked proposed or discovery are not represented as existing repository facts. No blocked provider/backend/interface choice is delegated to an implementer.

### T01: Bind exact backend, environment and independent approval

**Dependencies:** None.

**Exact files or discovery scope:** Existing #774 full issue/journal; packages/core/execution-policy.ts; packages/contracts/execution-profile.ts.

**Inputs:** Operator-approved backend ID/version/install digest/security approval, Windows build/architecture/package, policy and proof authority.

**Executable steps:**

- [ ] Read current #774 and all active custody.

- [ ] Inventory source contract and actual installed components without installing anything.

- [ ] Require one exact approvedBackendId; record backend executable/policy/source/platform identities and separate Linux obligations.

- [ ] If none supplied, publish HOLD_PLATFORM_PROOF/BLOCKED_BACKEND_SELECTION with missing fields and provider role; do not choose a backend.

- [ ] Consume the distinct #1031 M01 core and M02 host-coverage acceptance records as dependencies; a platform matrix does not certify unobserved native tool coverage or live-model outcomes.

**Outputs:** Approved input manifest or exact named blocked-input ledger.

**Positive, negative and lifecycle validation:** Missing/ambiguous/uninstalled/unapproved/source-mismatched backend cannot launch; declared available backend identity compares exactly.

**Done when:** Every privileged input has explicit provenance and reviewer authority; no implementation starts on an unknown API.

**Ownership and handoff:** Operator and independent security owner supply inputs; #774 verifier owns observation only.

### T02: Qualify fail-closed contracts and current consumers

**Dependencies:** T01; independent pure lane may run while native input blocked.

**Exact files or discovery scope:** packages/core/execution-policy.ts; packages/core/verification-executor.ts; apps/server/hermes-service.ts; packages/core/operation-project-trust.ts; existing execution tests.

**Inputs:** Current source and owned fake backend for pure contract cases only.

**Executable steps:**

- [ ] Trace every untrusted-code consumer and require current platform proof at actual launch boundary.

- [ ] Exercise absent/multiple backend, stale proof, unsupported OS, policy/executable change, missing allowlisted argv/cwd, failed initialization and root identity changes.

- [ ] Test explicit trusted-host path remains labeled unrestricted and cannot be selected automatically.

- [ ] Do not turn pure backend injection into native proof.

**Outputs:** Caller/proof map and source-bound pure refusal results.

**Positive, negative and lifecycle validation:** Positive approved synthetic in-root control; negatives all zero backend.launch; no unknown shell regex/read-only classification; normal granted text unaffected.

**Done when:** No production consumer silently bypasses proof or falls back to host; unknown join separately blocked.

**Ownership and handoff:** M03 verifier; missing join owned by existing consumer owner.

### T03: Prepare owned real native fixtures and source-bound launcher

**Dependencies:** T01 approved backend/platform; T02.

**Exact files or discovery scope:** Existing native Windows/installed workflow and launcher discovered from #774 source lock; proposed docs/implementation/v6/M03/native-platform-matrix.json.

**Inputs:** Exact approved installed package/backend, owned test account, permitted second-user fixture and sandbox roots.

**Executable steps:**

- [ ] Resolve actual packaged launcher command and executable digest from approved existing workflow.

- [ ] Record real token/network configuration and baseline files.

- [ ] Prepare disposable in-root allowed files, outside-root canaries, protected synthetic app/account state, DNS/TCP listener, registry fixture, child chain and junction and hardlink swap controls.

- [ ] Record cleanup ownership.

- [ ] Do not use a general CI/container mock as substitute.

**Outputs:** Frozen native fixture manifest, launch identity and allowed/denied expectations.

**Positive, negative and lifecycle validation:** Preflight rejects wrong build/backend/digest/user/policy or missing owned resource; no privileged run before manifest approval.

**Done when:** Every attack resource owned and exact expected boundary observable; no unrecorded native command choice.

**Ownership and handoff:** Approved Windows verifier and backend owner; independent reviewer accepts fixture manifest.

### T04: Run full actual Windows denial and positive matrix

**Dependencies:** T03.

**Exact files or discovery scope:** Actual approved installed launcher; existing policy tests plus approved native fixture entry.

**Inputs:** Frozen manifest, current approved profile and exact source/package.

**Executable steps:**

- [ ] Run each row independently: outside-root read, outside-root write, protected account/app data, DNS, TCP, child escape, registry write, junction swap, hardlink swap, second-user access.

- [ ] Run normal in-root operation under same profile.

- [ ] Exercise argv/cwd executable digest changes after trust, secret revocation/account isolation and no ambient secrets.

- [ ] Capture actual refusal boundary and owned effect count; a harness failure cannot count as denial.

**Outputs:** Per-case argv/platform/policy/proof/result/log digest and side-effect receipts.

**Positive, negative and lifecycle validation:** Every forbidden effect count0 with intended refusal; allowed in-root positive succeeds; unsupported case BLOCKED not skipped PASS.

**Done when:** All mandatory rows have observed correct result on real packaged target, no unexplained omission.

**Ownership and handoff:** Approved native verifier; independent security reviewer consumes receipts.

### T05: Verify kill, restart, policy revocation and separate Linux lane

**Dependencies:** T04; Linux exact approved environment independently required.

**Exact files or discovery scope:** Approved backend lifecycle and existing Service recovery; separate Linux proof fixture if supplied.

**Inputs:** Owned child readiness marker, actual policy revocation and exact alternative environment manifest.

**Executable steps:**

- [ ] Start allowed owned child then kill/cancel parent and observe descendants terminated; restart and verify no revived profile/approval.

- [ ] Change policy/executable during preparation, fail backend initialization and verify no host fallback.

- [ ] Revoke profile while preserving original stores/trust/history.

- [ ] Execute separately declared Linux/container matrix only under supplied exact environment; otherwise record its own HOLD_PLATFORM_PROOF.

**Outputs:** Lifecycle/recovery receipt and separate platform qualification records.

**Positive, negative and lifecycle validation:** No owned child leak/new dispatch after revoke; cancellation does not assert zero prior effects; positive allowed next run requires current approved policy; no cross-platform proof reuse.

**Done when:** Cleanup/restoration verified and separate unsupported lane remains explicit.

**Ownership and handoff:** Native verifier and Service owner coordinate; M02 effect history remains its owner’s scope.

### T06: Independent review and exact consumer acceptance

**Dependencies:** T04,T05.

**Exact files or discovery scope:** #774 full plan; current evidence controller; proposed native matrix record; actual UI status.

**Inputs:** Immutable source/package/backend/policy/case receipt identities and independent reviewer.

**Executable steps:**

- [ ] Reviewer independently checks every required denial/allowed control and exact proof binding.

- [ ] Publish full case table and references, preserve failures/legacy receipts and reviewerApproval=false until separately authorized release process.

- [ ] Verify UI reports actual backend/policy, unsupported reason or unrestricted status.

- [ ] Flag activation requires separate explicit approval; no automatic enable on proof creation.

- [ ] The preserved #774 body requires a new accepted ImplementationEvidenceV3 bundle with actual results.

- [ ] Resolve its exact existing controller/schema before publication; preserve the legacy PARTIAL record as history rather than overwriting it or inventing a migration.

**Outputs:** Accepted native evidence or precise remaining matrix/input failures.

**Positive, negative and lifecycle validation:** Altered proof/backend/executable must fail consumption; stale status cannot display isolated. Read-back complete published evidence.

**Done when:** Current proof accepted by existing launch policy with independent review; all unproved profiles remain unavailable.

**Ownership and handoff:** Independent reviewer to #774 owner; owner releases and hands accepted proof to #1031 and consumers.

## VALIDATION

### Reproducible setup and planned commands

The asset-build commands below are prerequisites for their consuming tests. Build widgets before App/widget-dependent focused tests. The native credential-lease build is required for its native/full-test lane; a missing compiler blocks that lane rather than authorizing test:no-lease as release evidence. Run from the exact assigned candidate repository root, with declared Node>=24.10.0 and actual pnpm10.30.3 resolved offline. Record executable identity, cwd physical identity, source/tree, UTC start/end, exit/termination, per-case totals and bounded redacted log digest for each command. Missing tools/dependencies/native compiler/browser/Hermes environment mean the consuming lane is BLOCKED/NOT_RUN. No new toolchain download, substitutions or changed lockfile. All following commands are **planned and NOT_RUN by this audit**, except the separately identified existing Node control suite.

```text
node --version
pnpm --version
pnpm build:widgets
pnpm build:credential-lease
pnpm exec vitest run tests/execution-boundary-v3.test.ts tests/execution-platform-proof-v3.test.ts tests/project-trust-hardlinks-v3.test.ts tests/project-trust-custody-v3.test.ts tests/project-trust-verification-races-v3.test.mjs tests/operation-project-trust-v3.test.ts tests/secret-resolution-races-v3.test.ts --maxWorkers=1
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
| A01 | Approved immutable inputs | T01 | One approved installed backend and exact platform/policy/executable identity; no self-selection |
| A02 | Fail-closed launch | T02 | No proof/bad proof/policy or identity drift gives zero launch and no host fallback |
| A03 | Actual Windows mandatory matrix | T03,T04 | Every named denial category, including hardlink swaps and same-profile allowed in-root control observed on packaged target |
| A04 | Lifecycle and other platforms | T05 | Kill/revoke/restart correct; Linux/container separately qualified or blocked |
| A05 | Review/status/activation | T06 | Independent review and truthful UI; activation remains separate |

### Requirement-to-task completeness

| Original requirement | Task coverage | Acceptance |
|---|---|---|
| M03-C01 | T02, T04 | A02, A03 |
| M03-C02 | T02, T04 | A02, A03 |
| M03-C03 | T01, T02, T06 | A01, A02, A05 |
| M03-S03 | T02, T04 | A02, A03 |
| M03-S04 | T02, T04 | A02, A03 |
| M03-S05 | T02, T04 | A02, A03 |
| M03-S08 | T01, T02 | A01, A02 |
| M03-S09 | T03, T04, T05 | A03, A04 |
| M03-S11 | T02, T06 | A02, A05 |
| M03-U02 | T06 | A05 |
| M03-T01 | T02, T04 | A02, A03 |
| M03-T02 | T04 | A03 |
| M03-T04 | T03, T04 | A03 |
| M03-T05 | T02, T04, T05 | A02, A03, A04 |
| M03-G01 | T06 | A05 |
| M03-G02 | T06 | A05 |
| M03-G03 | T05, T06 | A04, A05 |
| M01-G01 | T01, T06 | A01, A05 |
| M02-G01 | T01, T06 | A01, A05 |


### Actually executed in this read-only audit

Source/issue/PR-body inspection and exact repository blob comparisons were performed. Existing dependency-free `node --test scripts/validate-m01-m03-integration.test.mjs` passed4/4 with0 fail/skip/cancel on the audited SHA; latest duration2451.852311ms and raw log are in the external audit evidence. This only tests the immutable control harness with owned synthetic fixtures. It does not prove this plan’s product behavior. Product Vitest/typecheck/lint/build/browser/native/live commands are NOT_RUN: required pnpm10.30.3 and node_modules are absent, available pnpm11.25.0 mismatches. Node24.22.3 is available. `HOLD_TOOLCHAIN` remains. No source-only or candidate-body historical result is reported as current acceptance.

### Release gate and rollback

All applicable required cases must pass on the final integrated source, and every unavailable platform/live/input lane remains explicitly blocked. Validate current V3 evidence with the existing owner and computed status; hold undefined legacy migration at HOLD_CONTRACT_SHAPE. `reviewerApproval=false` and all unproven host flags remain off. Passing a fixture, producing a source hash, or merging a PR is insufficient for deployment/activation. Rollback preserves account/trust/ledger/approval records and earlier evidence; disable only new admissions/wiring and stop owned children where supported, without deleting unrelated files or repeating uncertain effects.

## STATE

Researched and decided: exact reviewed source, original requirements, current production/caller gaps, ownership and safe blocked-input handling. Implemented by this audit: none. Verified by this audit: source inventory/metadata and four dependency-free control tests only. Pending: task-specific committed execution, candidate compatibility, exact-head CI, independent review, and any named operator/backend/provider/live inputs. Existing implementation PRs remain open until GitHub metadata proves otherwise; stale body heads or queued jobs are not acceptance. Latest publication owner is root coordinator `codex-cloud-ca7d38`; original source reviewer is `codex-cloud-m0103-ac1a13`; final artifact reviewer is `codex-cloud-m0103-finish-e71314`. No assignee or implementation custody transferred by this file.

First executable next step is T01. It is read-only scope/source/owner/input reconciliation. The actual GitHub filechooser upload failed in the coordinator environment. This plan is a real UTF-8 .md file for the deliverables, but it is not represented as a hosted GitHub attachment. No repository-docs commit is authorized. The complete canonical issue body is the required durable fallback. Current audit deliverable remains HANDOFF_INCOMPLETE until the coordinator publishes this complete body and reads it back, with actual file attachment if available or an honest attachment limitation. A local path alone is not durable issue handoff. Every future worker posts START/20-minute and milestone checkpoints and final RELEASE OWNER=NONE on its canonical issue/parent, preserving previous failed attempts.

## REFERENCES

- [#774](https://github.com/skytuhua-org/Gen-V1/issues/774)
- [#292](https://github.com/skytuhua-org/Gen-V1/pull/292)
- [#802](https://github.com/skytuhua-org/Gen-V1/pull/802)
- [#1031](https://github.com/skytuhua-org/Gen-V1/issues/1031)

- [Audit source tree](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b)
- [Repository coordination and full-plan contract](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [Contribution requirements](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)

The supplied v6 source clauses necessary to execute this plan are reproduced in REQUIREMENTS. Completion appendix substance is preserved in exact current source binding, complete owner/action checks, proper barriers/real cancellation, actual installed/live evidence, no invented backend/provider, and preservation of prior failures. Research rationale is summarized here: committed host authority and real external receipts outrank narratives; minimum destination-bound secret delivery is separate from process isolation; paired measured outcomes must retain denominators, costs and uncertainty. Research does not authorize a donor implementation or replace a platform proof.

## PRESERVED_ORIGINAL_ISSUE_BODY

The complete issue body read on 2026-11-24 is retained below verbatim. Its prior task IDs are historical; the current executable task IDs and source identities are above. Existing comments, claims, PR histories and release permissions remain authoritative. The prior checked-in plan remains available at [docs/agent-plans/774-m03-release-gate-approved-windows-confinement-backen.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/agent-plans/774-m03-release-gate-approved-windows-confinement-backen.md). This revision expands acceptance detail without deleting prior obligations.

## Exact remaining acceptance gap
The M03 implementation and focused security regressions exist, but `docs/implementation/v3/M03-verification.json` still records `outcome: PARTIAL`. There is no recorded `approvedBackendId` bound to an installed, independently approved Windows execution backend. The native platform-negative matrix and independent security review have not produced source-bound PASS evidence. Tool-level mocks and explicit `TRUSTED_HOST` operation approval do not certify confinement.

## Required source-bound acceptance
1. Record exactly one immutable operator/source-lock-approved backend identity, installed artifact digest and execution profile; ensure selected backend is neither ambiguous nor inferred from the model/project. Preserve existing `UNSUPPORTED_BACKEND` and `PLATFORM_PROOF_REQUIRED` fail-closed paths.
2. Run the **actual packaged Windows launcher** under `WORKSPACE_EXECUTE_NO_NETWORK` with a real token/network profile and verify: outside-granted-root read/write denial, protected account and app state denial, DNS/TCP denial, child/process escape denial, registry mutation denial, junction and hardlink swap resistance, second-user access denial, and process-tree cleanup after forced kill. Include an allowed in-root control. Bind every receipt to exact executable, profile, backend, platform, test source and package digests.
3. Demonstrate no automatic fallback to unrestricted host when backend initialization, proof, policy, child teardown or approval fails. Keep unknown external effects as uncertain.
4. Obtain an independent security review of the complete installed/runtime boundary. Publish its precise findings, exceptions and source hashes.
5. Only after all mandatory cases pass, prepare a separate explicit activation decision for `security.executionProfilesV1`; do not silently enable trust or SecretRef flags. Do not rewrite or erase historical failures.

## Current audit references
- Frozen 68-head integration validation: #749; offline test-toolchain repair: #770.
- Current-main storage protection/key regression: #773.
- Earlier M03 verification includes named blocking gates; only a new ImplementationEvidenceV3 acceptance bundle with actual results can discharge them.

**State:** BLOCKED for native confinement certification, not a report that all M03 product source is absent. No backend selection, driver installation, new privileged listener or production enablement is authorized by this issue.
