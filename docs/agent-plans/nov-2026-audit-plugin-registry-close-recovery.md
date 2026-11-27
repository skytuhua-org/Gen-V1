<!-- gen-v1-audit-r1-r2:plugin-registry-close-recovery -->
# Recover plug-in registry closure after a transient host close failure

## META
Plan revision `audit-coverage-r4` · 2026-11-24 Pacific time · `skytuhua-org/Gen-V1`.
Main inspected at `20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645`. Source evidence only. Reproduction and implementation remain pending.
02:L841. The registry caches a close promise and retains a closed-but-busy state on a host close rejection. #1981 tracks renderer startup failures; #1979 tracks interrupted install activation. Those paths have distinct owners and outcomes.

## OBJECTIVE
Allow safe close recovery or a clear retained failure after a transient plug-in host rejection.

## REQUIREMENTS
Use the supported product entry point and a local owned fixture. Preserve existing resource ownership, compatibility and user data. Leave neighboring work with its existing issue and PR owners.

## REPO_MAP
- [`packages/plugins/host.ts` line 89](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/plugins/host.ts#L89)
- [`packages/plugins/host.ts` line 91](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/plugins/host.ts#L91)

## DESIGN
Preserve the admission revocation fence. Distinguish confirmed close, retryable rejected close, and unresolved ownership. Retry only steps the existing host contract can safely repeat. Preserve verified completed work and clear the busy state only with a confirmed result.

## EXECUTION_DAG
1. **T01 — Establish RED.** Use a local plug-in host stub. Have one instance reject its first close in the ordinary fixture and another complete successfully. Observe the initial result, retry, active operations and busy status. Keep a control with a host whose ownership remains unconfirmed. Save the pinned result and fixture for the scoped owner.
2. **T02 — Implement a bounded fix.** Depends on T01. Check current issue/PR ownership, then fix the reproduced cause in the scoped component. Preserve normal and recovery paths and hand off the exact patch with its regression.
3. **T03 — Verify and record.** Depends on T02. Verify exactly-once finished-instance cleanup, bounded retry of eligible failures, no admissions after revocation, no silent readiness on uncertain ownership, and unchanged successful close behavior.

## VALIDATION
The implementing agent must independently reproduce the failure before fixing it. Record the baseline SHA, environment, fixture, exact commands, expected result and observed RED. Run the same test on the patch and record GREEN, adjacent checks and any acceptance still pending. If it does not reproduce, record that disposition before editing.

Verify exactly-once finished-instance cleanup, bounded retry of eligible failures, no admissions after revocation, no silent readiness on uncertain ownership, and unchanged successful close behavior.

## STATE
Source-inspected tracking gap. Start with T01 on a refreshed applicable head. No runtime result is claimed.

## REFERENCES
Audit T05 #1946. [Repository instructions](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

