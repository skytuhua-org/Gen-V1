<!-- gen-v1-audit-r1-r2:plugin-widget-performance -->
# Bound widget rendering and repeated plug-in package verification work

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
Repeated inventory work and whole-tree widget updates can dominate time and memory. Measure remaining work after #1903 while preserving package verification and update semantics.

## REQUIREMENTS
- Report scope: 03 B11; 07 §§6, 11; 15 plug-in and widget rows; 12 current widget flag.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- `packages/plugins`, `packages/widgets`, and their web frame integration. Release qualification remains in #1032. Runtime and authorization boundary concerns belong to private security intake.

## DESIGN
Reuse consistent verified inputs within a request lifecycle and avoid redundant serialization. Preserve invalidation on package replacement and stop work on frame disposal.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Use large synthetic packages and widget trees with repeated ordinary RPCs, no-change ticks and one-node changes. Measure hashing bytes, retained buffers, message counts and render timing. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Verify distinct packages and revisions, changed content, idle trees, navigation/unmount and normal action receipt. Compare calls/memory using identical workloads. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Verify distinct packages and revisions, changed content, idle trees, navigation/unmount and normal action receipt. Compare calls/memory using identical workloads.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

