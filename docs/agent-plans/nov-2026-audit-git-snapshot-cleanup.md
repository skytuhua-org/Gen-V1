<!-- gen-v1-audit-r1-r2:git-snapshot-cleanup -->
# Preserve Git snapshot results when cleanup encounters a failed file removal

## META
- Repository `skytuhua-org/Gen-V1`. Revision `coverage-r2`, 2026-11-23 Pacific time.
- Current GitHub main read at `50b35412812123f882ec12895585b2612c4d2352`. Source paths confirmed; runtime reproduction is pending.
- Evidence: Round-one stability B10 in report 02. #1961 owns workspace read cost, #1873 owns comparison snapshot reuse, and current worktree cleanup is separate.

## OBJECTIVE
A cleanup error from the first temporary file removal can skip subsequent cleanup and replace the original operation result. Keep resource cleanup traceable and preserve the actual operation outcome.

## REQUIREMENTS
Preserve the existing behavior for normal operations, supported persisted data, and access or ownership checks. Use synthetic or checked-in fixtures.

## REPO_MAP
- [`packages/capabilities/git-access.ts` line 141](https://github.com/skytuhua-org/Gen-V1/blob/50b35412812123f882ec12895585b2612c4d2352/packages/capabilities/git-access.ts#L141)

## DESIGN
Attempt independent owned cleanup in deterministic order. Preserve the primary result and report any residual cleanup error through existing diagnostics or a safe recovery state. Preserve identity-based ownership checks and existing guard behavior.

## EXECUTION_DAG
1. **T01 — Reproduce.** Run a local Git snapshot through its normal fixture using a disposable repository. Inject a benign removal error for one app-created entry. Capture the normal operation result or original error and which remaining owned files received cleanup attempts. Record the pinned failing result and hand off the fixture.
2. **T02 — Repair.** Depends on T01. Work in the mapped owner path after checking existing PRs and claims. Add the smallest behavior change that preserves the stated requirements. Attach the exact change and fixture results for review.
3. **T03 — Verify.** Depends on T02. Verify original operation success and original error paths, attempts for unaffected entries, predictable ownership diagnostics, and normal cleanup with no residual files.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Verify original operation success and original error paths, attempts for unaffected entries, predictable ownership diagnostics, and normal cleanup with no residual files.

## STATE
Source inspection complete. Implementation, RED/GREEN and independent review are pending. Refresh current main and start with T01.

## REFERENCES
Audit index #1946, prior remediation #1860. Use the reproduction and evidence conventions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

