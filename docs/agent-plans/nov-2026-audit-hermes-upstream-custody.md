<!-- gen-v1-audit-r1-r2:hermes-upstream-custody -->
# Review reachable retained Hermes maintenance and gateway regressions

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
Default pins and flags hide some runtime behavior. Recheck reachable maintenance, gateway, cancellation and cleanup defects, then choose the correct owner for upstream or wrapper work.

## REQUIREMENTS
- Report scope: 02 D1–D12; 03 D-series; 04 vendored; 11 §6; 12 §7.1; 15 §5.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- Retained Hermes source, wrapper capability gates, source contract tests and manifest. #1860 R04/#1861 own the named session database module restoration.

## DESIGN
Preserve upstream provenance and keep any wrapper adjustment separate from a source vendor update. Record a retire, re-vendor, upstream report or verify-only disposition for each reachable behavior. Keep sensitive data and controls private.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Read pinned upstream revision and current source manifest. Recreate ordinary maintenance and gateway routing against a temporary SQLite store and fake runtime. Check Windows timeout/reaping with app-owned fixtures and default vs explicitly enabled configuration. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Show import and reachability receipts, deterministic RED/GREEN for selected fixes, source manifest/notice integrity, and platform limitations for deferred behavior. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Show import and reachability receipts, deterministic RED/GREEN for selected fixes, source manifest/notice integrity, and platform limitations for deferred behavior.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

