<!-- gen-v1-audit-r1-r2:browser-fixtures -->
# Make browser fixture isolation and protocol coverage deterministic

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
Some browser fixtures silently miss real event paths, use environment-dependent setup, or can talk to an unintended running host. Ensure tests fail clearly for missing fixture behavior.

## REQUIREMENTS
- Report scope: 02 C1–C7; 07 §§13.1,13.7–13.12,13.15–13.17; 12 §6; 13 test residue; 09 fixture overlap.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- `tests/e2e` fixtures, Playwright configs and related test harness. Reuse #1940/#993/#1227 for shutdown failures, #1869 for named events, #1920 for preconnected sockets, and #1676 for tracked runner timeouts.

## DESIGN
Require fixture ownership for every expected route, use condition-based synchronization and isolate ports/output. Add protocol assertions at the normal client entry point and retain a separate acceptance gate for installed/native flows.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Run the affected suite with a synthetic host and an unmatched ordinary request alongside a second fixture. Trace responders, config ports, transport named events and negative-check ordering. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Verify two parallel fixture runs, expected failure when a named event is omitted, no leaked request/state, Windows-compatible configuration, and scoped CI evidence. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Verify two parallel fixture runs, expected failure when a named event is omitted, no leaked request/state, Windows-compatible configuration, and scoped CI evidence.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

