<!-- gen-v1-audit-r1-r2:desktop-layout-save-recovery -->
# Resume desktop layout persistence after a transient save failure

## META
Plan revision `audit-coverage-r4` · 2026-11-24 Pacific time · `skytuhua-org/Gen-V1`.
Main inspected at `20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645`. Source evidence only. Reproduction and implementation remain pending.
02:L785. Desktop persist gates host writes on a shared layout error. An ordinary host-layout save failure records the error, which can suppress the next automatic save. #1966 covers racing layout recovery and dragging; #1860 covers navigation and backend restarts.

## OBJECTIVE
Keep accepted layout and local backup coherent when the host save temporarily fails.

## REQUIREMENTS
Use the supported product entry point and a local owned fixture. Preserve existing resource ownership, compatibility and user data. Leave neighboring work with its existing issue and PR owners.

## REPO_MAP
- [`apps/desktop/main.ts` line 88](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts#L88)
- [`apps/desktop/main.ts` line 212](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/main.ts#L212)

## DESIGN
Distinguish a recoverable write failure from an invalid restored layout. Retry through the existing layout owner and clear the write failure only after verified successful persistence. Preserve the local backup and reject stale updates. Keep updates and exit checks truthful while persistence is unresolved.

## EXECUTION_DAG
1. **T01 — Establish RED.** Use an Electron host fixture with app-owned temporary state. Inject one recoverable host layout-save failure during a normal move. Once the host is responsive, perform another normal layout change, then reopen the saved layout. Record host writes, local backup, visible errors, and actual restored layout. Save the pinned result and fixture for the scoped owner.
2. **T02 — Implement a bounded fix.** Depends on T01. Check current issue/PR ownership, then fix the reproduced cause in the scoped component. Preserve normal and recovery paths and hand off the exact patch with its regression.
3. **T03 — Verify and record.** Depends on T02. First save failure is visible, a later supported change persists and restores correctly, late older results cannot replace newer geometry, repeated failures remain visible, and invalid saved data does not get overwritten silently.

## VALIDATION
The implementing agent must independently reproduce the failure before fixing it. Record the baseline SHA, environment, fixture, exact commands, expected result and observed RED. Run the same test on the patch and record GREEN, adjacent checks and any acceptance still pending. If it does not reproduce, record that disposition before editing.

First save failure is visible, a later supported change persists and restores correctly, late older results cannot replace newer geometry, repeated failures remain visible, and invalid saved data does not get overwritten silently.

## STATE
Source-inspected tracking gap. Start with T01 on a refreshed applicable head. No runtime result is claimed.

## REFERENCES
Audit T05 #1946. [Repository instructions](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

