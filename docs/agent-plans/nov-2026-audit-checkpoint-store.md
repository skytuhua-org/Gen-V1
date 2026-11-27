<!-- gen-v1-audit-r1-r2:checkpoint-store -->
# Make checkpoint blob writes atomic and verify stored content before reuse

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
A partially written or corrupt checkpoint blob can make old snapshots unreadable and leave unreferenced files. Make blob publication atomic and report integrity failure accurately.

## REQUIREMENTS
- Report scope: 14/B3, B5–B7, B18; 13 §3.4; 15 filesystem growth.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- Checkpoint content-addressed store and index implementation under `packages/workspace`. Use the tracked source and tests on current main to find exact paths. Separate the restore state machine and retention policy from blob integrity.

## DESIGN
Publish complete blobs atomically and verify digest before trust. Reconcile recoverable and missing state consistently across readers. Account for intermediate files and existing references without deleting referenced data.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Interrupt a blob write in a temporary store, then attempt a read and a second capture of the same binary. Alter a synthetic copy and observe the reader result. Include a failed capture and a hardlinked fixture subject to repository policy. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Assert good concurrent reads, rejection of corrupted bytes, recovery on retry, no leaked temp file after clean failure, and compatibility with a prior-format checkpoint. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Assert good concurrent reads, rejection of corrupted bytes, recovery on retry, no leaked temp file after clean failure, and compatibility with a prior-format checkpoint.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

