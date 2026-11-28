<!-- gen-v1-audit-r1-r2:shell-projection-stale-records -->
# Keep shell read models usable with older or malformed stored projections

## META
Repository `skytuhua-org/Gen-V1` · audit-coverage-r4 · 2026-11-24 Pacific time. Source inspected at `main@20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645`. Runtime evidence pending.
02:L794, L799–800 and L806. The read-model projection trusts partial stored records and later sorts dates or maps usage arrays. #1955 covers transaction rollback and cross-writer cache consistency. #1968 covers transport failure and command response. This repair is the shape and recovery of already stored read-model records.

## OBJECTIVE
Keep shell read models usable with older or malformed stored projections. Confirm the stated failure through the supported entry point and preserve the normal flow.

## REQUIREMENTS
Use an owned disposable fixture and supported platform. Preserve original source, user data, and implementation ownership of neighboring work.

## REPO_MAP
- [packages/core/shell-read-models.ts line 24](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/shell-read-models.ts#L24)
- [packages/core/shell-read-models.ts line 72](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/shell-read-models.ts#L72)
- [packages/core/shell-read-models.ts line 121](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/shell-read-models.ts#L121)

## DESIGN
Validate and project only supported data at the read boundary. Keep stable ordering, caller scope and valid neighboring rows. Conservatively disclose omitted or unavailable data rather than emitting a partial success as complete. Preserve legacy data bytes for recovery.

## EXECUTION_DAG
1. **T01 — Reproduce.** Seed throwaway persisted shell rows from older and current schemas, including one incomplete row. Exercise normal thread-list, archive and usage reads. Compare valid neighboring rows, ordering, counts and returned diagnostics across reopen. Record the pinned fixture and failing result before selecting a design.
2. **T02 — Fix the reproduced cause.** Depends on T01. Validate and project only supported data at the read boundary. Keep stable ordering, caller scope and valid neighboring rows. Conservatively disclose omitted or unavailable data rather than emitting a partial success as complete. Preserve legacy data bytes for recovery. Hand the exact patch and test to T03.
3. **T03 — Confirm the final behavior.** Depends on T02. Verify the failing case, known-good control, retry or reopen behavior, and applicable focused checks. Record any hosted or installed gates still due.

## VALIDATION
The implementing agent must independently reproduce the bug before fixing it. Record baseline commit, environment, exact command, expected result and actual RED. Run the same case at the proposed head and record GREEN or a justified non-reproduction disposition.

## STATE
Scope and source reviewed. Runtime validation, implementation and exact-head review remain pending.

## REFERENCES
Audit #1946. [Repository instructions](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

