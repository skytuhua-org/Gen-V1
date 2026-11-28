<!-- gen-v1-audit-r1-r2:audit-tooling -->
# Make audit and release tooling report failures accurately on supported platforms

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
Verification and capture utilities can report success with invalid inputs, use incompatible platform commands or lose evidence. Keep failure states and output locations truthful.

## REQUIREMENTS
- Report scope: 02 C1–C7; 03 growth tooling; 04 scripts/config; 12 §6; 08 live command drift.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- Repository scripts, eval configurations and qualification checks. Compare #1940, #1676, #1278 and earlier RC audit issues before changing a script. Browser fixture isolation has its own issue.

## DESIGN
Make parsing and exit status deterministic, account for child cleanup and evidence output, and use the documented supported platform only. Separate intentional unsupported status from success.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Run supported commands with good and malformed synthetic manifests, missing metadata and a failed child. Check CLI flag parsing and platform gates in a temporary directory with exact Node/Windows version. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Confirm valid entry points still work, malformed evidence fails clearly, platform boundaries and working-directory assumptions are explicit, and no evidence escapes the configured output directory. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Confirm valid entry points still work, malformed evidence fails clearly, platform boundaries and working-directory assumptions are explicit, and no evidence escapes the configured output directory.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

