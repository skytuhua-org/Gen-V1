<!-- gen-v1-audit-r1-r2:sqlite-inspection-staging-cost -->
# Reduce full-copy overhead in read-only SQLite inspection

## META
Plan revision `audit-coverage-r4` · 2026-11-24 Pacific time · `skytuhua-org/Gen-V1`.
Main inspected at `20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645`. Source evidence only. Reproduction and implementation remain pending.
02:L828 and 03:L107. The current capability reads a bounded source into a buffer, writes an inspection snapshot, and then reads the source again for consistency. #1348/#1440 concern the database gateway product surface; #1959 covers SQLite host read-model scans. This scope is capability-level local file staging.

## OBJECTIVE
Reduce peak allocation and redundant whole-file work for an ordinary inspection while preserving stable-source and read-only guarantees.

## REQUIREMENTS
Use the supported product entry point and a local owned fixture. Preserve existing resource ownership, compatibility and user data. Leave neighboring work with its existing issue and PR owners.

## REPO_MAP
- [`packages/capabilities/database.ts` line 39](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/capabilities/database.ts#L39)
- [`packages/capabilities/database.ts` line 49](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/capabilities/database.ts#L49)

## DESIGN
Choose a bounded streaming or equivalent snapshot approach with explicit source stability, worker ownership and cleanup semantics. Preserve the current version check, resource limits, error classification and durable bytes. Keep execution mode unchanged.

## EXECUTION_DAG
1. **T01 — Establish RED.** Build a temporary valid SQLite fixture at a small size and at a larger representative size under supported bounds. Run the real inspect capability on both sizes and measure peak bytes and source reads. Change an ordinary fixture record between acquisition and verification to confirm the expected stale result. Save the pinned result and fixture for the scoped owner.
2. **T02 — Implement a bounded fix.** Depends on T01. Check current issue/PR ownership, then fix the reproduced cause in the scoped component. Preserve normal and recovery paths and hand off the exact patch with its regression.
3. **T03 — Verify and record.** Depends on T02. Verify identical schema/inspect outputs, bounded source reads and allocation accounting, stale-result rejection without partial output, clean cancellation and unchanged owned-file protection. Record medians and sizes under comparable runs.

## VALIDATION
The implementing agent must independently reproduce the failure before fixing it. Record the baseline SHA, environment, fixture, exact commands, expected result and observed RED. Run the same test on the patch and record GREEN, adjacent checks and any acceptance still pending. If it does not reproduce, record that disposition before editing.

Verify identical schema/inspect outputs, bounded source reads and allocation accounting, stale-result rejection without partial output, clean cancellation and unchanged owned-file protection. Record medians and sizes under comparable runs.

## STATE
Source-inspected tracking gap. Start with T01 on a refreshed applicable head. No runtime result is claimed.

## REFERENCES
Audit T05 #1946. [Repository instructions](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

