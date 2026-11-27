<!-- gen-v1-audit-r1-r2:private-git-import-recovery -->
# Recover a managed repository after an interrupted Git metadata import

## META
Plan revision `audit-coverage-r4` · 2026-11-24 Pacific time · `skytuhua-org/Gen-V1`.
Main inspected at `20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645`. Source evidence only. Reproduction and implementation remain pending.
02:L830. Current import refuses a leftover owned directory and reports that it is retained for recovery. This protects existing files, but the audit found the next import cannot otherwise proceed. #1982 targets transient comparison-snapshot cleanup, a different temporary path.

## OBJECTIVE
Give users a safe retry or explicit recovery outcome after an interrupted managed workspace import.

## REQUIREMENTS
Use the supported product entry point and a local owned fixture. Preserve existing resource ownership, compatibility and user data. Leave neighboring work with its existing issue and PR owners.

## REPO_MAP
- [`packages/workspace/git-storage.ts` line 103](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/workspace/git-storage.ts#L103)
- [`packages/workspace/git-storage.ts` line 126](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/workspace/git-storage.ts#L126)

## DESIGN
Persist or recover an explicit stage state, and retain existing path/identity checks. Offer retry or quarantine only once application ownership and supported recovery are proved. Preserve the last known good import and never remove user-owned or ambiguous state.

## EXECUTION_DAG
1. **T01 — Establish RED.** In a disposable local repository, interrupt the application-owned import before its durable state is published using the test fixture. Restart through the normal workspace flow. Verify the incomplete-import error, current repository bytes, and any documented ordinary recovery path. Save the pinned result and fixture for the scoped owner.
2. **T02 — Implement a bounded fix.** Depends on T01. Check current issue/PR ownership, then fix the reproduced cause in the scoped component. Preserve normal and recovery paths and hand off the exact patch with its regression.
3. **T03 — Verify and record.** Depends on T02. Verify clean first import, interrupted import followed by safe retry, no use of stale or partial metadata, reattempt idempotence, and explicit hold for ambiguous ownership. Confirm ordinary inspection and workspace operations still work.

## VALIDATION
The implementing agent must independently reproduce the failure before fixing it. Record the baseline SHA, environment, fixture, exact commands, expected result and observed RED. Run the same test on the patch and record GREEN, adjacent checks and any acceptance still pending. If it does not reproduce, record that disposition before editing.

Verify clean first import, interrupted import followed by safe retry, no use of stale or partial metadata, reattempt idempotence, and explicit hold for ambiguous ownership. Confirm ordinary inspection and workspace operations still work.

## STATE
Source-inspected tracking gap. Start with T01 on a refreshed applicable head. No runtime result is claimed.

## REFERENCES
Audit T05 #1946. [Repository instructions](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

