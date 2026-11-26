<!-- gen-v1-audit-r1-r2:settings-write -->
# Keep settings handoffs responsive and show accurate save results

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
A pending write or refresh can block navigation/close or make a saved value appear failed. Distinguish persisted settings, pending state and refresh recovery.

## REQUIREMENTS
- Report scope: 07 §§5.1,5.3,5.5–5.12; 07 §11 shell; 13 prediction closes.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- Settings write/reload orchestration, integration inventory, appearance motion and usage display in `apps/web`. #1728 owns unsaved-change guards and #1704/#1912 own shortcuts.

## DESIGN
Keep write acknowledgment independent of read refresh, expose a bounded retry or status on failure, and preserve latest selection and application lifecycle. Scope smaller changes by settings owner.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Control write and refresh responses while changing settings and switching/closing panels. Check integration fetch failure and empty success, delayed sound completion, and motion scaling by fixture. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Verify leaving and reopening while pending, recovery from refresh failure, one correct motion scale, useful empty/error UI, and ordinary setting success with keyboard focus intact. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Verify leaving and reopening while pending, recovery from refresh failure, one correct motion scale, useful empty/error UI, and ordinary setting success with keyboard focus intact.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

