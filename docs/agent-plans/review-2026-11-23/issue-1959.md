[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1959.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1959](https://github.com/skytuhua-org/Gen-V1/issues/1959). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Read-performance repair [#1991](https://github.com/skytuhua-org/Gen-V1/pull/1991) reports prepare-count reduction 736 to 96 and 95 local tests. It remains open; accepted performance/compatibility evidence and CI/review/merge remain distinct.

### Reviewed implementation references

- [PR #1991](https://github.com/skytuhua-org/Gen-V1/pull/1991): open; head `9bb6031b24a3db387768c34377fde03319e17a67`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7121783386](https://github.com/skytuhua-org/Gen-V1/issues/1959#issuecomment-7121783386). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

[Versioned Markdown plan](https://github.com/skytuhua-org/Gen-V1/blob/dad473f59b4c46dad12cf0357e448e090a403a2b/docs/agent-plans/nov-2026-audit-store-read-performance.md) · [Plan publication PR](https://github.com/skytuhua-org/Gen-V1/pull/1952)

<!-- gen-v1-audit-r1-r2:store-read-performance -->
# Reduce repeated full-store scans and query amplification on host reads

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
Large histories and many owners amplify read cost for snapshot, thread search, agent work, linked PRs and request custody. Re-measure current indexes and preserve paging and ordering.

## REQUIREMENTS
- Report scope: 03 high impact and late findings; 15 §§2–4; 02 B1–B2; 07 §§2 and 9.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- `packages/storage` and core read model implementations. Discover current route-specific query paths in `apps/server`; compare existing changes for paging #1114 and verification digest #1901.

## DESIGN
Eliminate redundant snapshot/basis work and move selective filtering and stable paging into existing indexed reader paths. Stage independent route fixes. Preserve scope, sequence, ordering, and partial-page semantics.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Benchmark the normal request and browse entry points with deterministic small and large seed stores. Record median, p95, query count, returned window, and EXPLAIN QUERY PLAN. Check the indexes already on main. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Compare query counts and latency under the same fixtures and load. Check empty, visible, archived and concurrent updates, plus unchanged response shape and missed-record absence. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Compare query counts and latency under the same fixtures and load. Check empty, visible, archived and concurrent updates, plus unchanged response shape and missed-record absence.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## Historical STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).
