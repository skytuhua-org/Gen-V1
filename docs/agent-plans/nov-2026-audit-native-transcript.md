<!-- gen-v1-audit-r1-r2:native-transcript -->
# Preserve native session history and clear recovery state on failed resume

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
An interrupted save, malformed tail or upgrade can strand native continuation or destroy the only usable log. Retain the last valid bytes and show the correct recovery action.

## REQUIREMENTS
- Report scope: 14/D1–D7; 02 B8; 03 session reads; 11 §4; 15 Pi history.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- `packages/runtime-pi`, `packages/runtime-hermes` and core session binding. #1615 is specifically the renderer symptom on interrupted resume, and #1862 covers Pi settlement rather than transcript persistence.

## DESIGN
Order pointer publication after durable transcript publication, preserve source logs during upgrade, use consistent read/write limits and handle corrupt versus missing data explicitly. Bound history work and document supported rollback.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Create fixture session pointers and valid legacy logs, then fault the save/replacement or supply a torn fixture tail. Capture the normal history, resume and diagnostics behavior with no live provider. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Reopen old and new sessions after injected interruption, compare retained bytes, assert independent sessions still open and verify no false completion or duplicate message on supported resume. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Reopen old and new sessions after injected interruption, compare retained bytes, assert independent sessions still open and verify no false completion or duplicate message on supported resume.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

