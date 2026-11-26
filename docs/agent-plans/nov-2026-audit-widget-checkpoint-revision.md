<!-- gen-v1-audit-r1-r2:widget-checkpoint-revision -->
# Keep widget checkpoint writes bound to the revision the editor saw

## META
- Repository `skytuhua-org/Gen-V1`. Revision `coverage-r2`, 2026-11-23 Pacific time.
- Current GitHub main read at `50b35412812123f882ec12895585b2612c4d2352`. Source paths confirmed; runtime reproduction is pending.
- Evidence: Round-two frontend §§6.1 and 6.4 in report 07. #1964 owns ordinary artifact editor recovery, #1962 owns widget performance, and #1872 covers admission-time schema version validation.

## OBJECTIVE
A widget draft can be based on an older state revision than the one sent to the host when a delayed lease resolves. A separate update path may also publish values rejected at initial load.

## REQUIREMENTS
Preserve the existing behavior for normal operations, supported persisted data, and access or ownership checks. Use synthetic or checked-in fixtures.

## REPO_MAP
- [`apps/web/src/Widget.tsx` line 128](https://github.com/skytuhua-org/Gen-V1/blob/50b35412812123f882ec12895585b2612c4d2352/apps/web/src/Widget.tsx#L128)
- [`apps/web/src/Widget.tsx` line 159](https://github.com/skytuhua-org/Gen-V1/blob/50b35412812123f882ec12895585b2612c4d2352/apps/web/src/Widget.tsx#L159)

## DESIGN
Carry the editor's observed state revision with its draft throughout checkpoint submission. Preserve accepted canonical state on stale results and validate update payloads through the same state schema used at startup. Keep mount identity and ownership checks intact.

## EXECUTION_DAG
1. **T01 — Reproduce.** Use a generated fixture widget with synthetic saved state. Delay the checkpoint lease, publish a newer accepted state through the existing fixture path, and resume the earlier checkpoint attempt. Observe expected conflict versus actual record and widget result. Exercise a malformed saved-state refresh separately. Record the pinned failing result and hand off the fixture.
2. **T02 — Repair.** Depends on T01. Work in the mapped owner path after checking existing PRs and claims. Add the smallest behavior change that preserves the stated requirements. Attach the exact change and fixture results for review.
3. **T03 — Verify.** Depends on T02. Verify ordinary checkpoint success, a delayed older request preserving newer content, schema-failure feedback and invalid updates retaining valid mounted state. Cover lease release and remount, and distinguish fixture evidence from installed desktop verification.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Verify ordinary checkpoint success, a delayed older request preserving newer content, schema-failure feedback and invalid updates retaining valid mounted state. Cover lease release and remount, and distinguish fixture evidence from installed desktop verification.

## STATE
Source inspection complete. Implementation, RED/GREEN and independent review are pending. Refresh current main and start with T01.

## REFERENCES
Audit index #1946, prior remediation #1860. Use the reproduction and evidence conventions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

