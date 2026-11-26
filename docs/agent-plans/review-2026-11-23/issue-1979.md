[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1979.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1979](https://github.com/skytuhua-org/Gen-V1/issues/1979). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Interrupted plugin install recovery exists in open [#1984](https://github.com/skytuhua-org/Gen-V1/pull/1984); 31 plugin-host tests are reported. Current-main integration and full recovery acceptance remain pending.

### Reviewed implementation references

- [PR #1984](https://github.com/skytuhua-org/Gen-V1/pull/1984): open; head `adc481ba9d884e9d3f6c32ae973d23cb8265f63e`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7121594772](https://github.com/skytuhua-org/Gen-V1/issues/1979#issuecomment-7121594772). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

[Versioned Markdown plan](https://github.com/skytuhua-org/Gen-V1/blob/fc59c8aa4a1267067f6f815278b4198d6d381046/docs/agent-plans/nov-2026-audit-plugin-install-recovery.md) · [Plan publication PR](https://github.com/skytuhua-org/Gen-V1/pull/1952)

<!-- gen-v1-audit-r1-r2:plugin-install-recovery -->
# Recover plug-in installation after activation index write fails

## META
- Repository `skytuhua-org/Gen-V1`. Revision `coverage-r2`, 2026-11-23 Pacific time.
- Current GitHub main read at `50b35412812123f882ec12895585b2612c4d2352`. Source paths confirmed; runtime reproduction is pending.
- Evidence: Round-one stability B11 in report 02, and leftover installation staging in report 15. #1962 covers verification and rendering cost, #1032 covers native release qualification. Neither tests installation recovery.

## OBJECTIVE
An interrupted install can leave a verified version on disk with no corresponding active index entry. The next attempt reports that the version already exists, even though activation never completed.

## REQUIREMENTS
Preserve the existing behavior for normal operations, supported persisted data, and access or ownership checks. Use synthetic or checked-in fixtures.

## REPO_MAP
- [`packages/plugins/installation.ts` line 179](https://github.com/skytuhua-org/Gen-V1/blob/50b35412812123f882ec12895585b2612c4d2352/packages/plugins/installation.ts#L179)
- [`packages/plugins/installation.ts` line 144](https://github.com/skytuhua-org/Gen-V1/blob/50b35412812123f882ec12895585b2612c4d2352/packages/plugins/installation.ts#L144)

## DESIGN
Define explicit interrupted-install recovery under existing index ownership. Keep the last active version usable and verify the recovered package through all existing checks before activation. Clean only installation-owned staging. Preserve immutable versions and return a clear result for conflicting content.

## EXECUTION_DAG
1. **T01 — Reproduce.** Install a synthetic package into a disposable root with an installed prior version. Inject a normal I/O failure at index publication and retry the same version after reopening the registry. Record returned error, active version, staged files and retry outcome. Record the pinned failing result and hand off the fixture.
2. **T02 — Repair.** Depends on T01. Work in the mapped owner path after checking existing PRs and claims. Add the smallest behavior change that preserves the stated requirements. Attach the exact change and fixture results for review.
3. **T03 — Verify.** Depends on T02. Inject failure before and after final-directory promotion and at index publication. Assert earlier active version remains usable, exact retry can recover or gives an actionable reason, and already installed, conflicting and incomplete packages are handled safely. Compare bytes and index after restart.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Inject failure before and after final-directory promotion and at index publication. Assert earlier active version remains usable, exact retry can recover or gives an actionable reason, and already installed, conflicting and incomplete packages are handled safely. Compare bytes and index after restart.

## Historical STATE
Source inspection complete. Implementation, RED/GREEN and independent review are pending. Refresh current main and start with T01.

## REFERENCES
Audit index #1946, prior remediation #1860. Use the reproduction and evidence conventions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).
