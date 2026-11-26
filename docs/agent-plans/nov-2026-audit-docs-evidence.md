<!-- gen-v1-audit-r1-r2:docs-evidence -->
# Reconcile milestone qualification claims with source and retired features

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
Historical milestone PASS text can be mistaken for current qualification after source and feature removals. Preserve historical records while surfacing the current verified state.

## REQUIREMENTS
- Report scope: 08 Themes A, C–D; 12 §8.3; 13 §6; 04 dormant features; 06 verification debt.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- `docs/implementation` milestone evidence and current index/acceptance entries; inspect pinned M03/M05/M08/M09/M11 records. #1060 owns live guide commands and #1028 owns its M04–M06 qualification stack.

## DESIGN
Use source-pinned references and current status notes to distinguish qualification scope. Update the active index or acceptance guidance and preserve earlier evidence. Get an owner decision on any release capability policy conflict.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** For each referenced claim, compare its original pinned commit, test/path and current main. Identify whether the gate is historical, superseded, retired, pending verification or still valid. Re-run the supported harmless check wherever the plan demands current evidence. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Every altered claim resolves to a source and scope, fresh statuses cite actually run evidence, and docs link checks pass. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Every altered claim resolves to a source and scope, fresh statuses cite actually run evidence, and docs link checks pass.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

