<!-- gen-v1-audit-r1-r2:plugin-startup-handoff -->
# Allow workspace handoff after a plug-in fails before startup

## META
- Repository `skytuhua-org/Gen-V1`. Revision `coverage-r2`, 2026-11-23 Pacific time.
- Current GitHub main read at `50b35412812123f882ec12895585b2612c4d2352`. Source paths confirmed; runtime reproduction is pending.
- Evidence: Round-two frontend §6.2 in report 07. #1967 concerns settings writes, and #1962 covers costs rather than this failure.

## OBJECTIVE
A plug-in close guard can require a flush even when a failed frame never connected or accepted edits. A pre-start frame therefore may block unrelated workspace navigation.

## REQUIREMENTS
Preserve the existing behavior for normal operations, supported persisted data, and access or ownership checks. Use synthetic or checked-in fixtures.

## REPO_MAP
- [`apps/web/src/PluginFrame.tsx` line 28](https://github.com/skytuhua-org/Gen-V1/blob/50b35412812123f882ec12895585b2612c4d2352/apps/web/src/PluginFrame.tsx#L28)
- [`apps/web/src/PluginFrame.tsx` line 35](https://github.com/skytuhua-org/Gen-V1/blob/50b35412812123f882ec12895585b2612c4d2352/apps/web/src/PluginFrame.tsx#L35)

## DESIGN
Distinguish startup failure from connected work that may still contain unsaved state. Preserve the existing flush guard when the plug-in has accepted edits or cannot confirm a real write. Bound abandoned startup waiting and retain clear reload/retry feedback.

## EXECUTION_DAG
1. **T01 — Reproduce.** Mount a fixture plug-in that fails before any connection or accepted work and try the ordinary workspace switch or window close path. Compare a second fixture that connected and holds a synthetic pending save. Record the pinned failing result and hand off the fixture.
2. **T02 — Repair.** Depends on T01. Work in the mapped owner path after checking existing PRs and claims. Add the smallest behavior change that preserves the stated requirements. Attach the exact change and fixture results for review.
3. **T03 — Verify.** Depends on T02. Verify failed pre-start view can be dismissed, connected dirty view still prompts or blocks per policy, normal flush succeeds, and late callbacks from a disposed document cannot change a replacement view.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Verify failed pre-start view can be dismissed, connected dirty view still prompts or blocks per policy, normal flush succeeds, and late callbacks from a disposed document cannot change a replacement view.

## STATE
Source inspection complete. Implementation, RED/GREEN and independent review are pending. Refresh current main and start with T01.

## REFERENCES
Audit index #1946, prior remediation #1860. Use the reproduction and evidence conventions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

