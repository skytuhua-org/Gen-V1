<!-- gen-v1-audit-r1-r2:workspace-ui-performance -->
# Bound renderer work for previews, long transcripts and repeated panel updates

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
Large synthetic documents, transcripts and tables can drive excess renderer CPU, storage and network requests. Keep interactions responsive with measured workload limits.

## REQUIREMENTS
- Report scope: 07 §§1.7,1.9–1.10,2.3,2.6–2.7,2.12,3.1,4.9–4.10,7,8.4,8.10,9.5–9.7,11.3/11.5,13.13–13.14.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- PDF preview worker and signatures, terminal resize, transcript/find, task tables, split/canvas geometry and persistence in `apps/web`. #1357 owns visibility-aware polling, #1339 owns App decomposition.

## DESIGN
Reuse correct document generations, coalesce safe geometry/storage updates, and render bounded data while preserving search, resize, selection and accessibility outcomes. Split commits by surface.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Profile a fixture PDF during editing, fast terminal resize, long transcript/find and a large bound table. Count worker starts, requests, synchronous writes and rendering work at matched sizes. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Compare matched before/after traces, no stale document preview after switching, no dropped final resize/scroll, and no keyboard or reduced-motion regression. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Compare matched before/after traces, no stale document preview after switching, no dropped final resize/scroll, and no keyboard or reduced-motion regression.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

