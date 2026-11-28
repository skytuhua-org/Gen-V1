<!-- gen-v1-audit-r1-r2:store-transactions -->
# Keep SQLite projection and in-memory state consistent across rollback and writers

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
A failed SQLite change can leave caches and views disagreeing with committed rows, especially after a second connection writes. Keep reads and recovery aligned with the durable transaction.

## REQUIREMENTS
- Report scope: 14/A2–A3, A5–A10; 13 §3.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- Store transaction, archive projection and command cache in `packages/storage` and relevant core callers. #1056 owns versioned migrations and backups.

## DESIGN
Move observable in-memory mutation after commit or provide an explicit rollback path. Align archive predicates and error mapping. Preserve original failures and keep transaction ownership consistent.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Use two local connections and a fault-injection fixture to observe external commits, rollback after state mutation and busy handling. Include archived-thread and reparented-record cases only if live on main. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. After injected rollback, verify disk, active cache, a second reader and reopened state agree. Verify busy retry semantics, old schema fixtures and no cross-thread projection drift. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

After injected rollback, verify disk, active cache, a second reader and reopened state agree. Verify busy retry semantics, old schema fixtures and no cross-thread projection drift.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

