<!-- gen-v1-audit-r1-r2:catalog-performance -->
# Page skill catalogs without rebuilding the full provider inventory per request

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
Large catalogs can be rescanned and rehashed on each page/reference lookup. Make work proportional to changed data and the response window.

## REQUIREMENTS
- Report scope: 03 B12; 15 catalog and provenance rows; 02 catalogue stability.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- `packages/skill-catalog` and related catalog/skill adapters, inventory consumers and project scope checks. Compare #1085 for existing metadata/paging fixes and #1010 for tests.

## DESIGN
Preserve stable cursors, invalidation and source provenance while reusing suitable snapshots. Keep provider failure isolated and allow refresh after recovery.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Seed multiple ordinary fixture providers and request sequential pages plus a reference lookup. Count provider traversals, hashes and store reads. Include an unavailable source and an update during paging. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Check empty provider, page boundaries, source updates, unavailable sources and exact references. Report before/after counts and latency. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Check empty provider, page boundaries, source updates, unavailable sources and exact references. Report before/after counts and latency.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

