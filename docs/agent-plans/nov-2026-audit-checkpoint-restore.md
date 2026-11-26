<!-- gen-v1-audit-r1-r2:checkpoint-restore -->
# Preserve pre-restore data and recover interrupted checkpoint restores

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
A restore can leave workspace edits without a complete undo or a usable recovery receipt. Preserve the live state before changing files and reconcile reported outcomes with disk.

## REQUIREMENTS
- Report scope: 14/B1–B2, B8–B12, B14–B16; 02 B5; 07 §13.3.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- Workspace checkpoint and restore code under `packages/workspace`, its store and host routes, and existing M08 restore fixture. Compare #578 (timing only) and #1860 (adjacent workspace work).
- Cases to track: incomplete preimage B1; interrupted APPLYING B2; temp cleanup B8; per-path PARTIAL and absence B9; double-apply B11; scope changes B12; persisted identity B14; size order and case normalization B15–B16. Delegate boundary-sensitive items through SECURITY.md.

## DESIGN
Define a durable restore state machine and receipt per path. Before first write, validate canonical plan and recoverable preimage. Fence ownership and reconcile after interruption. Preserve the old reader and require explicit disposition when undo cannot be guaranteed.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** From a disposable workspace reconcile the capture inventory with real paths. Add supported fixtures for a missing preimage, two simultaneous restores, and cancellation after one recorded write. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Verify both restored content and original bytes, recovery after host restart, truthful changed/unchanged/failed status, and at most one writer per plan. Exercise the real Browser → Changes → restore entry point using a fixture workspace. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Verify both restored content and original bytes, recovery after host restart, truthful changed/unchanged/failed status, and at most one writer per plan. Exercise the real Browser → Changes → restore entry point using a fixture workspace.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

