**Full current issue mirror:** [issue-1009.md](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1009.md). The publication checkpoint pins the exact commit.

## Current reconciliation, 2026-11-24

Revision: `2026-11-24-audit-r1`. Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1009. Source audit: `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Coordination: #1803, `cleanup-2026-11-23-r2`. State: **OPEN**.

named script suites partly landed, but residual helper coverage #1451 remains open with ten branch tests. The original complete-coverage target is not discharged by partial merges.



This revision corrects progress and evidence status. It preserves the accepted requirements below. Earlier “not started”, “open PR”, owner, and test statements are historical where this reconciliation gives a newer explicit result. Current ownership remains governed by the live append-only journal; this audit does not release another worker’s implementation claim.

### Verification and remaining work

The issue body, complete paged journal and referenced PR states were reconciled. Existing test receipts remain bound to their stated branch/platform. The source inspections explicitly named above were executed in this audit; no local application tests, native installed acceptance or visual capture are newly claimed. Required tests in the retained plan remain planned until a cited result discharges them. Resume the remaining gate named above through the existing candidate PR and owner, preserving its task IDs and review requirements.

### Evidence

- https://github.com/skytuhua-org/Gen-V1/issues/1009#issuecomment-7060849393
- https://github.com/skytuhua-org/Gen-V1/issues/1009#issuecomment-7060856186
- https://github.com/skytuhua-org/Gen-V1/issues/1009#issuecomment-7060866748
- https://github.com/skytuhua-org/Gen-V1/pull/1451

### Plan publication repair

The complete previously authored plan is restored below from [the immutable source](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/docs/agent-plans/1009-add-unit-tests-for-build-and-check-scripts-in-script.md); it had been published as a file while the issue body held only the intake. Its baseline and design remain as authored. Current progress, corrections and remaining gates are stated above. Paths labelled discovery still require source confirmation before edits.

---

# Add unit tests for build and check scripts in scripts/ — execution plan

## META
- Repo: skytuhua-org/Gen-V1 · Plan revision: 1 (2026-11-21)
- Baseline: main @ e883ac0327c834120d89c3697dec7380a342ba4d
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1009
- Status: plan only — no implementation authorized by this document. Source provenance: issue body reproduced verbatim under REQUIREMENTS so nothing is lost.

## OBJECTIVE
Add unit tests for build and check scripts in scripts/. Success is the issue's own completion criteria met and verified on main.

## REQUIREMENTS
## Outcome
Pure helper logic in `scripts/` (build, check, capture and lint helpers such as `check-doc-links.mjs`, `build-review-index.ts`, `browser-suites.ts`, `lint-ui.ts`, `capture-ui/helpers.ts`, `capture-ui/scope.ts`, `capture-ui/screen-map.ts`) is covered by vitest unit tests, and the bugs they find are fixed.

## Scope
- Write the tests, then fix what they find: bugs, missing error handling and invalid-input crashes in the source are in scope. Small refactors that make code testable are fine. Keep public behavior unless a fix needs it to change, and say so in the PR body.
- One concern per PR (tests for one module group, or one fix), each under 400 lines, linked to this issue.
- Skip any file changed by an open PR.

## Done when
- Every module in scope has tests, or the PR body says why it can't be unit tested.
- Every bug the tests found is fixed in its own PR or filed as a new issue linked here.
- `pnpm lint`, `pnpm typecheck` and `pnpm test` pass on each PR.
- Gen Reviewer reports CLEAN and the PRs merge through the normal gate.

Picked up by a standalone session. Coordinate on this issue per AGENTS.md.

[Written by Devin](https://app.devin.ai/sessions/3ec16cd8dc2e450da822fc30c43dd218)

## REPO_MAP
Verified at baseline unless marked discovery:
- `scripts/check-doc-links.mjs` — candidate module
- `scripts/build-review-index.ts` — candidate module
- `scripts/browser-suites.ts` — candidate module
- `scripts/lint-ui.ts` — candidate module
- `scripts/capture-ui/` — helpers.ts, scope.ts, screen-map.ts candidates

## DESIGN
Cover pure helper logic in scripts/ with vitest; fix bugs found. One concern per PR under 400 lines; skip files touched by open PRs.

## EXECUTION_DAG
| Task | Goal | Deps | Done when |
|------|------|------|-----------|
| T01 | List scripts modules and pick untested pure helpers | NONE | module inventory with test status |
| T02 | Add vitest tests per module group | T01 | each group has tests or a documented reason |
| T03 | Fix each bug found in its own PR or file a linked issue | T02 | bugs fixed/filed; lint, typecheck, test green |

## VALIDATION
- `pnpm lint`, `pnpm typecheck` and `pnpm test` (or the focused suite named in the issue) green on each PR.
- Issue-specific acceptance reproduced and evidenced per the criteria above; browser/Windows-only checks run on a Windows worker or CI.
- Each PR linked to issue #1009; merge only through the normal gate (required CI + independent review).

## STATE
- Researched: issue scope + verified REPO_MAP entries. Not started: all tasks. Owner: unassigned (this plan's author released the claim).
- Exact next step: claim the issue per AGENTS.md, then execute T01.

## REFERENCES
- Issue #1009: https://github.com/skytuhua-org/Gen-V1/issues/1009
- AGENTS.md claim/checkpoint/handoff rules: https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md
