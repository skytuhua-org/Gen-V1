<!-- gen-v1-audit-r1-r2:desktop-window-close-drain -->
# Bound desktop quit time across multiple renderer close guards

## META
Plan revision `audit-coverage-r4` · 2026-11-24 Pacific time · `skytuhua-org/Gen-V1`.
Main inspected at `20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645`. Source evidence only. Reproduction and implementation remain pending.
02:L400 and 03:L155. Current closeApplication waits for each window close guard in sequence. The published #1885 repair fences backend restart during committed quit. #1863 addresses anchor recovery and sign-in. Neither names cumulative renderer guard latency.

## OBJECTIVE
Allow a normal multi-window quit to settle within a bounded interval while preserving each window’s save or veto decision.

## REQUIREMENTS
Use the supported product entry point and a local owned fixture. Preserve existing resource ownership, compatibility and user data. Leave neighboring work with its existing issue and PR owners.

## REPO_MAP
- [`apps/desktop/main.ts` line 198](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts#L198)
- [`apps/desktop/main.ts` line 376](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts#L376)
- [`apps/desktop/main.ts` line 379](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts#L379)

## DESIGN
Use a coordinated bounded deadline or mutually independent close preparation at the existing owner. On veto, timeout or save failure keep windows and pending edits protected. An affirmative current decision remains necessary for every relevant window. Preserve the committed quit and restart fences.

## EXECUTION_DAG
1. **T01 — Establish RED.** Exercise the production close coordinator with independent fake renderers and controlled timers. Compare one and several unresponsive windows, a prompt veto, and all windows ready. Measure total elapsed time and logs. If a native OS session-end event is involved, reproduce it separately before connecting it to this change. Save the pinned result and fixture for the scoped owner.
2. **T02 — Implement a bounded fix.** Depends on T01. Check current issue/PR ownership, then fix the reproduced cause in the scoped component. Preserve normal and recovery paths and hand off the exact patch with its regression.
3. **T03 — Verify and record.** Depends on T02. Verify one bounded close attempt across several windows, no forced close after veto or fault, normal successful quit preserves save and backend-stop order, and stale approvals do not carry into a later retry.

## VALIDATION
The implementing agent must independently reproduce the failure before fixing it. Record the baseline SHA, environment, fixture, exact commands, expected result and observed RED. Run the same test on the patch and record GREEN, adjacent checks and any acceptance still pending. If it does not reproduce, record that disposition before editing.

Verify one bounded close attempt across several windows, no forced close after veto or fault, normal successful quit preserves save and backend-stop order, and stale approvals do not carry into a later retry.

## STATE
Source-inspected tracking gap. Start with T01 on a refreshed applicable head. No runtime result is claimed.

## REFERENCES
Audit T05 #1946. [Repository instructions](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

