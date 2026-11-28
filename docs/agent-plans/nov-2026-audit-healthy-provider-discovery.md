<!-- gen-v1-audit-r1-r2:healthy-provider-discovery -->
# Keep healthy models available while a sibling provider signs in

## META
- Repository `skytuhua-org/Gen-V1`. Revision `coverage-r2`, 2026-11-23 Pacific time.
- Current GitHub main read at `50b35412812123f882ec12895585b2612c4d2352`. Source paths confirmed; runtime reproduction is pending.
- Evidence: Round-one stability B9 in report 02. Current main uses all-settled across adapters, so the older report's all-provider failure claim needs narrowing. #1963 covers the skill catalog, and #1085 covered different catalog metadata and paging.

## OBJECTIVE
Shared adapter probe setup can reject before listing any models for that adapter when one provider is signing in. That can exclude a healthy sibling even while the other adapter returns its models.

## REQUIREMENTS
Preserve the existing behavior for normal operations, supported persisted data, and access or ownership checks. Use synthetic or checked-in fixtures.

## REPO_MAP
- [`packages/runtime/index.ts` line 95](https://github.com/skytuhua-org/Gen-V1/blob/50b35412812123f882ec12895585b2612c4d2352/packages/runtime/index.ts#L95)
- [`packages/runtime/index.ts` line 105](https://github.com/skytuhua-org/Gen-V1/blob/50b35412812123f882ec12895585b2612c4d2352/packages/runtime/index.ts#L105)

## DESIGN
Keep provider-specific account restrictions and verified lease ownership. Isolate discovery so a busy provider does not suppress healthy siblings when safe, with distinct explicit-provider errors. Preserve current adapter lifecycle protections.

## EXECUTION_DAG
1. **T01 — Reproduce.** Use fake account and adapter objects with two providers sharing one adapter. Simulate a normal sign-in in progress for one and ensure the other has an ordinary readable catalog. Compare unscoped discovery, a healthy provider query and an explicit query for the provider that is signing in. Record the pinned failing result and hand off the fixture.
2. **T02 — Repair.** Depends on T01. Work in the mapped owner path after checking existing PRs and claims. Add the smallest behavior change that preserves the stated requirements. Attach the exact change and fixture results for review.
3. **T03 — Verify.** Depends on T02. Verify healthy results, busy provider stays unavailable, explicit query responds clearly, normal all-ready discovery remains intact, and permits are released at the right time without changing an active session.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Verify healthy results, busy provider stays unavailable, explicit query responds clearly, normal all-ready discovery remains intact, and permits are released at the right time without changing an active session.

## STATE
Source inspection complete. Implementation, RED/GREEN and independent review are pending. Refresh current main and start with T01.

## REFERENCES
Audit index #1946, prior remediation #1860. Use the reproduction and evidence conventions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

