<!-- gen-v1-audit-r1-r2:completion-digest-transaction -->
# Keep verification source hashing out of the task completion write transaction

## META
Repository `skytuhua-org/Gen-V1` · revision audit-coverage-r4 · 2026-11-24 Pacific time. Source inspected at `main@20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645`. Runtime evidence pending.
02:L312, 03:L45, 03:L316 and 15:19. #1901’s current PR explicitly covers source hashing on verification-panel reads and the related helper. The task_finish write path on main still calls sourceDigestSync inside the transaction.

## OBJECTIVE
Keep declared source evidence bound to the accepted completion cut while avoiding long synchronous file work in the SQLite writer.

## REQUIREMENTS
Use the supported entry point with an owned fixture. Preserve current evidence or response semantics and existing ownership boundaries.

## REPO_MAP
[packages/core/service.ts line 2209](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/service.ts#L2209).

## DESIGN
Prepare evidence under the existing owner and preserve source and request identity through commit. Revalidate the accepted evidence cut before writing. Keep unreadable, changed, canceled, and invalid evidence explicit. Preserve the panel-read scope in #1901 and all current evidence checks.

## EXECUTION_DAG
1. **T01 — Reproduce.** Use the supported task completion fixture with a disposable declared source tree. Instrument time and file calls while the store write transaction is active. Include a concurrent ordinary edit and a small stable tree; record how the current cut and receipt are accepted. Record the pinned failing case before code edits.
2. **T02 — Fix.** Depends on T01. Prepare evidence under the existing owner and preserve source and request identity through commit. Revalidate the accepted evidence cut before writing. Keep unreadable, changed, canceled, and invalid evidence explicit. Preserve the panel-read scope in #1901 and all current evidence checks. Hand the precise change and regression to T03.
3. **T03 — Verify.** Depends on T02. Observe bounded transaction occupancy for a representative source tree, equivalent digests for unchanged files, correct changed-source disposition, a single completion receipt, and responsive independent store work.

## VALIDATION
The implementing agent must independently reproduce the issue before fixing it. Record baseline SHA, fixture, environment, exact expected and observed RED, and the same case GREEN. Record any non-reproduction with evidence before editing.
Observe bounded transaction occupancy for a representative source tree, equivalent digests for unchanged files, correct changed-source disposition, a single completion receipt, and responsive independent store work.

## STATE
Current source and overlapping issue scope checked. Implementation and runtime acceptance are pending. Begin with T01.

## REFERENCES
Audit #1946. [Repository instructions](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

