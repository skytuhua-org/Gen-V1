<!-- gen-v1-audit-r1-r2:shared-ui-lifecycle -->
# Keep shared UI controls consistent through dismissal, form changes and buffered input

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
Tooltip, Select, Toast and composer primitives can retain stale handlers or interactive state after their owning control changes. Preserve keyboard and assistive feedback during transitions.

## REQUIREMENTS
- Report scope: 07 §§1.11–1.12,3.2–3.4,13.4–13.6; related QA tickets.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- Shared UI primitives under `packages/ui-shell` and their current callers. Compare #1948, #1921, #1878, #1881 and #1705; those tickets retain their already-defined outcomes.

## DESIGN
Remove listeners and interactive content when ownership ends, restore focus to the current control, and keep no-selection behavior equivalent to normal typing. Use existing primitives instead of replacing them.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Use fixture transitions with a new caller-provided tooltip attribute, form reassociation/reset, toast exit and canceled attachment removal. Check default Enter with no active command and a disclosure whose action finishes without a status refresh. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Assert form reset, accessible name, focus order, repeat/interrupt behavior, table/disclosure status, reduced motion and unchanged normal success. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Assert form reset, accessible name, focus order, repeat/interrupt behavior, table/disclosure status, reduced motion and unchanged normal success.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

