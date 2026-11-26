<!-- gen-v1-audit-r1-r2:event-retention -->
# Bound event and projection growth while preserving replay and audit receipts

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
The audit measured growth with every commit and scan costs on old databases. Define a retention policy that lets active clients recover, preserves required receipts and catches legacy rows safely.

## REQUIREMENTS
- Report scope: 03 growth inventory; 14/B4, F4 and C recovery dependencies; 15 §§1, 6; 02 projection retention.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- Core store event/entity tables, durable projections, retained research records and checkpoint blob references. Separate SQLite migrations (#1056), checkpoint blob integrity and request/query optimizations.

## DESIGN
Document per-kind retention and authority, compaction cutoff, retry, checkpoint safeguards and cursor reset behavior. Make retention transactional or resumable and require explicit owner approval for old data policy.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Generate deterministic local stores at multiple sizes. Measure rows, bytes, runtime and query plans after equal event volumes. Determine the oldest consumer cursor and every durable receipt dependency before proposing expiry. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Run mixed reconnect and offline consumers across cutoff, old store upgrades, cancellation, cursor reset and pinned record preservation. Report before/after size and time at equal cardinality. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Run mixed reconnect and offline consumers across cutoff, old store upgrades, cancellation, cursor reset and pinned record preservation. Report before/after size and time at equal cardinality.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

