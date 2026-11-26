# M10: route background output through canonical M04 custody and bounded UTF-8 ranges

## META

Repository: skytuhua-org/Gen-V1. Plan revision: m01-m10-audit-r2-2026-11-23. Baseline: main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b. Parent review: https://github.com/skytuhua-org/Gen-V1/issues/1992. Author: codex-cloud-ca7d38. Status: SOURCE GAP VERIFIED; implementation and issue-specific reproduction pending. Date is 2026-11-23 Pacific time.

Source provenance: user-uploaded Expanded Source Research UX Memory Performance v3 dated 2026-11-14; Audited Execution Controlled Prompts v6 dated 2026-11-16; its Completion Follow-ups appendix. M10's authoritative clauses relevant to this issue are reproduced below so execution does not depend on the original chat or private attachment. Research v3 §17 P2-2/P2-3 supplies stable projection and persisted process-identity rationale. Audit source and exact repository paths are pinned in REFERENCES.

Attachment status: the actual GitHub file upload failed in the review environment. The complete Markdown source is published in this issue body. A separate .md file is provided with the review deliverables; it is not represented as a GitHub attachment. No repository-docs commit was permitted.

## OBJECTIVE

Background output has one valid private-result custody path, byte-correct bounded capture and cursor semantics, and current authorization checks. Settled output cannot change after its digest-bearing handle is published.

### Verified current gap

`BackgroundWorkCoordinator.issueOutputHandle` writes `bw-result:<workId>` to a separate Store entity kind `backgroundResultHandle`. No consumer of that kind is present outside the producer/tests. The real `context_result_read` arguments in `packages/core/context-result-tool.ts` require a UUID; the service uses `createContextResults` with `openContextResultCustody`, a different storage and authority registry. The generated M10 handle therefore cannot be read through the existing M04 private-result path required by fixed decision D03.

The direct background HTTP read checks thread ID and archive state but not the full current owner/account/workspace/grant lineage or live creation-token proof. Its cursors and window trimming use JavaScript string length even though the constant is `outputWindowBytes`. Each chunk is independently decoded with `chunk.toString('utf8')`, which can replace a code point split across chunks. The handle/digest is issued on `exit`, while a later `close` callback may still persist additional tail bytes. This creates an observable gap between the purported final handle and final captured output.

## REQUIREMENTS

Consume the existing M04 UUID handle and private custody implementation. Do not relax its active-run/source-lineage checks, invent a second disk protocol, expose a raw path, or make handles into capabilities. Historical drawer inspection and model access have different admission contexts: retain inspectable history for an authorized current owner, and mint a fresh model-readable reference only through the existing current-run authority path. Explicitly specify this distinction in T02; never install a permanently true authorization callback.

Capture stdout/stderr with separate streaming UTF-8 decoders or byte buffers so interleaving does not join fragments from different streams. The retained window is bounded in bytes, every reported offset/cursor has one documented unit, and truncation does not split a scalar value or invent replacement characters. Account/workspace/root/grant changes revoke access before and after asynchronous reads. Live read and stop require exact native process identity; uncertain outcomes stay UNKNOWN. Terminal settlement and stream completion must not conflate process exit with complete output.

Preserve compatibility for existing stored background rows with an explicit migration/disposition. Legacy `bw-result:` values must be marked unavailable or reissued only from verified retained bytes and current authority. Never treat their unauthenticated metadata as a valid UUID record. Keep M12 parallel result work untouched.

### Retained source clauses

**M10-C01.** Proposed BackgroundWorkV1: workId, owner: ToolOwner, kind COMMAND|REVIEW|MAINTENANCE|EXTERNAL_TASK, effectId|null, processIdentity|null, lifetime RUN|APPROVED_SERVICE, state QUEUED|RUNNING|WAITING_HUMAN|WAITING_EVENT|BLOCKED|SETTLED|UNKNOWN, outcome SUCCEEDED|FAILED|CANCELLED|null, blockedReason|null, leaseGeneration, leaseExpiresAtMs|null, deadlineMs and outputRef|null. Reuse ToolOwner from packages/contracts/tool-effects.ts. SETTLED requires an observed terminal outcome; UNKNOWN must have outcome=null. RUN is the default lifetime.

**M10-S02.** Add owned background command state without detaching ownership. Foreground timeout may offer Continue in background only for a permitted profile. Retain exact process identity including creation token, not PID alone, and preserve bounded output with cursor-based retrieval.

**M10-S03.** After host loss, RUN-lifetime commands become UNKNOWN until an exact owned-process exit/teardown receipt resolves them. Do not promise survival. APPROVED_SERVICE stays unavailable unless the recorded installed supervisor identity, authentication, reconnect and cancellation contract have target-platform PASS evidence. Do not select, install or write another supervisor in this task to bypass that gate.

**M10-S04.** Wake-ups revalidate current account, project, grants, budget and task state. A stale lease or changed epoch may trigger reconciliation but cannot revive prior authority. Missing provider or permission produces BLOCKED without a tight retry loop.

**M10-U01.** Background work drawer shows Waiting, Running, Waiting for you, Completed or Outcome unknown; command, owner, elapsed time, output and Open child task are visible.

**M10-T02.** PID reuse, orphan process, broken supervisor connection and missing exit acknowledgment yield UNKNOWN rather than success.

**M10-G03.** Rollback: Pause wakeups and intake, preserve occurrence/effect receipts and stop only owned jobs. Leave uncertain processes quarantined for inspection; do not erase the state needed for recovery.

### Cross-cutting constraints and exclusions

The review itself is read-only: no code, branch, commit, PR or flag changes were made or authorized in this audit. This execution plan records future work for the issue owner. Before implementation, read AGENTS.md, CONTRIBUTING.md, this entire issue, all comments, linked PRs and the latest checkpoint. Claim only an unowned exact scope and use an isolated current-main worktree. Preserve earlier implementation and review ownership. Post self-contained checkpoints at milestones and at most 20 minutes of uninterrupted work, and finish with RELEASE OWNER=NONE.

All user-supplied M10 requirements remain authoritative. This focused issue closes only its mapped gap; sister phases are neither deleted nor implicitly completed. Preserve host-owned flags jobs.backgroundV1, jobs.serviceLifetimeV1, jobs.idleReviewV1 and integrations.intakeV1, each default false. Do not add strict UI preferences or agent/plugin enablement. Preserve existing Store transactions and source-manifest/licensing rules. No dependency on completion of M12 or M14 is introduced.

Use the exact packageManager from current package.json and installed matching Node. At the audited baseline that is pnpm 10.30.3 and Node >=24.10.0. If no installed matching package manager or preprovisioned Corepack resolution exists, HOLD_TOOLCHAIN; do not download one under the source prompt. Build required assets before relevant tests. Tests must contain the required assertions, no passWithNoTests, skipped-required-case substitution, timeout inflation or different browser channel to force green.

### Dependencies and independent ownership

- M04 canonical custody is the dependency; coordinate changes with its current owners and preserve their authority rules.
- The owned-RUN issue supplies actual approved process identity.
- Do not duplicate or modify M12 work. This is a missing M10-to-M04 join.

## REPO_MAP

All paths below were verified present at the pinned baseline. Any additional adapter, test or native integration path must be discovered in T01/T02 and recorded before edits; a proposed path is not evidence that an interface exists.

- `packages/core/background-work.ts`
- `packages/core/context-results.ts`
- `packages/core/context-result-custody.ts`
- `packages/core/context-result-tool.ts`
- `packages/core/service.ts`
- `apps/server/background-routes.ts`
- `apps/web/src/BackgroundWork.tsx`
- `tests/background-work-v3.test.ts`

## DESIGN

Introduce a narrow host-owned output publication seam between M10 and the existing M04 service vault. Its accepted contract contains captured bytes, immutable original owner/effect/source identity, byte count/digest, expiry and current authorization lineage. The service derives authority from existing owner/grants, never supplied client text. Finalize immutable output only when required streams are drained/closed or explicitly record a partial/unknown capture; late bytes cannot mutate an already published final digest. The retained payload is only the bounded trailing window, not the whole command history. Store and expose its original-stream byte start and omitted-byte count, and hash the exact retained bytes. Preserve the canonical M04 16 MiB total storage, 1 MiB fetched range, 128-record and host-expiry limits. Service.deliverContextResult currently returns small values directly and requires public/observed lineage for handle admission; do not call it blindly from terminal settlement. Use the approved narrow host custody seam, with historical UI inspection separate from fresh current-run model authorization.

Use byte cursors with bounded range retrieval, or retain an explicitly versioned legacy cursor adapter while migrating. The choice must be written and reviewed in T02, with old clients tested. No cross-account, expired or stale-run model reads. Rollback disables new publication without deleting retained receipts or widening legacy access.

## EXECUTION_DAG

T01 -> T02 -> T03 -> T04. No overlapping implementation in shared files is parallelized without an explicit issue ownership split. Independent target-platform verification can run in parallel after the same immutable candidate is published.

### T01 Reproduce handle, byte window and final-tail mismatches

**Dependencies:** NONE. **Files / ownership boundary:** packages/core/background-work.ts; packages/core/context-result-tool.ts; tests/background-work-v3.test.ts; existing M04 custody tests located with rg. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Demonstrate that a generated bw-result handle fails the actual context_result_read schema and cannot be found in canonical custody. Use multibyte output split at every byte boundary, stdout/stderr interleaving and output beyond 512 KiB. Pause exit before final close/tail delivery and compare stored output digest to outputRef metadata. Exercise read after account/workspace/owner revision change.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Baseline assertions must fail for the specific mismatch, not import/toolchain errors. Include ASCII control, complete UTF-8 control, authorized same-owner read and stale/foreign/expired negative reads.

**Done when:** The baseline precisely identifies handle incompatibility, byte-bound violations, split decoding and final-tail publication order.

**Handoff recipient / prerequisite:** M04 custody owner and T02 contract designer.

### T02 Agree canonical publication and cursor compatibility

**Dependencies:** T01. **Files / ownership boundary:** packages/core/service.ts; packages/core/context-results.ts; packages/core/context-result-custody.ts; packages/contracts/background-work.ts. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Read existing owner binding, invocation digest, authority map, maximum range and expiry rules. Define a host internal publication seam and distinguish historical UI read from current-run model read. Specify byte cursor versioning, migration and partial-output behavior. Preserve current M04 authorization before/after awaited reads and its UUID shape. Coordinate with #1027/#1028 evidence owners only where tests overlap.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Contract table covers owner drift, root replacement, expiry, digest mismatch, missing bytes, old bw-result rows, new run, pending close and oversized ranges.

**Done when:** An independently reviewed seam reuses canonical storage/reader and documents every compatibility branch without bypassing authority.

**Handoff recipient / prerequisite:** T03 implementation owner; M04 reviewer retains custody review.

### T03 Implement bounded capture and immutable output finalization

**Dependencies:** T02. **Files / ownership boundary:** packages/core/background-work.ts; packages/core/service.ts; apps/server/background-routes.ts; apps/web/src/BackgroundWork.tsx if cursor adaptation needed. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Replace per-chunk lossy decoding and code-unit window trimming with the agreed byte-correct capture. Track independent stream decoder state and exact absolute byte offsets. Finalize only after output closure under the accepted partial/terminal rules. Publish via canonical vault, persist the returned valid handle and enforce current authority for reads. Preserve UNKNOWN and process identity validation.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Every UTF-8 split boundary, mixed stream fragments, boundary truncation, repeated polling, restart, exit-before-close, expiry, tampering, owner switch during awaited read, archive and legacy-row cases. Assert memory/window bytes remain bounded.

**Done when:** All new outputRefs are readable only through canonical authorized custody; final bytes and digest agree and cursors never duplicate or corrupt text.

**Handoff recipient / prerequisite:** T04 integration/native verifier.

### T04 Verify real drawer, model reader and native output flow

**Dependencies:** T03; approved RUN executor. **Files / ownership boundary:** tests/background-work-v3.test.ts; existing context-result integration suites discovered in T01; tests/e2e/background-work.spec.ts; docs/implementation/v6/M10/. Only this issue's mapped behavior is owned; coordinate shared-file changes before editing.

**Inputs and executable steps:** Run an approved real process producing multibyte output beyond the window, observe incremental drawer output, then consume an authorized captured range through context_result_read. Change account/workspace/run and verify denied model access while preserving authorized historical metadata. Run all standard M10 and host/browser/native gates and hash redacted artifacts.

**Outputs:** source-bound evidence, reviewed contract or focused code/test delta named by this task, plus a checkpoint with exact head and remaining gates.

**Positive and negative validation:** Actual service composition, not a hand-built fake handle. Include delayed process close, no terminal acknowledgment and Windows/Linux output behavior.

**Done when:** Code-to-requirement-to-test evidence proves D03 and output safety on declared targets; unresolved native cases remain explicit.

**Handoff recipient / prerequisite:** Independent M04/M10 reviewer and #1992.

## VALIDATION

### Requirement-to-task-to-acceptance matrix

| Requirement | Tasks | Acceptance checks |
|---|---|---|
| M10-C01 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-S02 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-S03 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-S04 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-U01 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-T02 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |
| M10-G03 | T01, T02, T03, T04 | A01; A02; A03; A04; A05 |

- A01 M10 outputRef accepted by canonical UUID reader and vault
- A02 retained bytes/cursors obey the bound with all UTF-8 split cases
- A03 final immutable digest includes tail or explicitly reports partial capture
- A04 full current authority and native identity enforced
- A05 migration and actual App/native/model-reader integration verified

The matrix maps the original clauses to the issue's concrete checks. Requirements outside this focused issue retain their existing M10 gates; passing these rows alone does not close the whole milestone.

### Planned commands and evidence

Discover any changed script in current package.json and record the difference before comparing receipts. Execute each command separately and retain its actual exit code, test counts and bounded redacted log hash. Required asset builds include pnpm build:widgets and the native credential-lease build when the test lane requires it. Missing native tooling is a hold for its dependent lane, not an alternate test:no-lease release pass.

```text
node --version
pnpm --version
pnpm build:widgets
pnpm build:credential-lease
pnpm exec vitest run tests/background-work-v3.test.ts
pnpm exec vitest run tests/human-handoff-v3.test.ts
pnpm exec vitest run tests/external-intake-v3.test.ts
pnpm exec vitest run tests/background-contract-decisions-v6.test.ts
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:browser
```

Use the existing reviewed native/installed workflow with its exact test matrix. Discover the actual workflow and declared test projects before scheduling a run; do not invent a passing job name. Browser fixture tests supplement actual App/installed tests, not replace them. Native Windows/Linux, approved model, authenticated intake and supervisor lanes are separate receipts. Observe source-bound positive and negative results on the actual declared target. Do not use an injected fake as an end-to-end production receipt.

Update docs/implementation/v3/M10-verification.json using implementationEvidenceV3Schema, validateImplementationEvidence and bundleStatus from packages/contracts/implementation-evidence.ts. Keep strict persisted enum values, store HOLD_* as reasons and never persist computed bundleStatus into the strict object. Record requirement-to-code-to-test links, base and candidate source identities, exact commands, artifact hashes and remainingGates under docs/implementation/v6/M10/. Keep historical evidence separate. A schema validator PASS is evidence integrity only. Production flags and reviewerApproval remain false until separately authorized. Required unrun/failed/blocked phases prevent full completion.

### Actually executed during this review

Read-only source, test and issue/PR inspection at the baseline above. No product test suite or installed/native lane was executed for M10. The available pnpm is 11.25.0, while the required 10.30.3 Corepack resolution is absent with networking disabled; Node is 24.22.3. Product validation is NOT_RUN/HOLD_TOOLCHAIN. Existing historical author/CI test claims were read but are not relabeled as this review's results. No issue-specific reproducer has been executed in this audit; T01 must establish it before implementation.

## STATE

Researched: complete source clauses, relevant implementation/tests, current production composition, and existing issue/PR overlap. Decided: retain the approved architecture and close this specific gap; no scope deletion or activation. Implemented in this review: none. Verified product acceptance in this review: none. T01-T04: NOT_STARTED for implementation, with T01 source premise inspected. Planning owner releases after publication; implementation owner remains whoever holds the earliest authorized exact claim in the issue journal.

Next action: refresh this issue and related PR ownership, pin current main, reproduce T01 using the exact supported toolchain in an isolated worktree, and post START/ACK with source identity and scope. Stop only the dependent phase for a named missing prerequisite. Deliver the first failing regression or evidence discrepancy before editing. Retain a self-contained checkpoint and final RELEASE OWNER=NONE when stopping. No changes to M12 or M14 are included.

Publication gate: full issue body must compare byte-for-byte with the real UTF-8 .md source. The publisher records the source SHA256, issue URL, readback result and attachment limitation in an append-only comment. Do not claim HANDOFF_COMPLETE unless the full body is retrievable; file-upload success is a separate fact.

## REFERENCES

- Parent review and published issue index: https://github.com/skytuhua-org/Gen-V1/issues/1992
- Repository instructions: https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md
- Contribution guide: https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md
- M10 original implementation PR: https://github.com/skytuhua-org/Gen-V1/pull/501 (merged, historical source only)
- M10 v6 evidence PR: https://github.com/skytuhua-org/Gen-V1/pull/837 (merged, historical evidence only)
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/background-work.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/context-results.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/context-result-custody.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/context-result-tool.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/background-routes.ts
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/BackgroundWork.tsx
- https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/background-work-v3.test.ts
