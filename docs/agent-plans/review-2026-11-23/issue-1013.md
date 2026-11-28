**Full current issue mirror:** [issue-1013.md](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1013.md). The publication checkpoint pins the exact commit.

## Current reconciliation, 2026-11-24

Revision: `2026-11-24-audit-r1`. Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1013. Source audit: `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Coordination: #1803, `cleanup-2026-11-23-r2`. State: **OPEN**.

contract test work partly landed via #960/#964/#965/#1067/#1072. PDF parser tests #1069 and the balanced-parenthesis repair #1070 are still open, so the discovered bug and remaining coverage are not accepted on main.



This revision corrects progress and evidence status. It preserves the accepted requirements below. Earlier “not started”, “open PR”, owner, and test statements are historical where this reconciliation gives a newer explicit result. Current ownership remains governed by the live append-only journal; this audit does not release another worker’s implementation claim.

### Verification and remaining work

The issue body, complete paged journal and referenced PR states were reconciled. Existing test receipts remain bound to their stated branch/platform. The source inspections explicitly named above were executed in this audit; no local application tests, native installed acceptance or visual capture are newly claimed. Required tests in the retained plan remain planned until a cited result discharges them. Resume the remaining gate named above through the existing candidate PR and owner, preserving its task IDs and review requirements.

### Evidence

- https://github.com/skytuhua-org/Gen-V1/issues/1013#issuecomment-7057856072
- https://github.com/skytuhua-org/Gen-V1/issues/1013#issuecomment-7060699361
- https://github.com/skytuhua-org/Gen-V1/issues/1013#issuecomment-7060715151
- https://github.com/skytuhua-org/Gen-V1/pull/960
- https://github.com/skytuhua-org/Gen-V1/pull/964
- https://github.com/skytuhua-org/Gen-V1/pull/965
- https://github.com/skytuhua-org/Gen-V1/pull/1067
- https://github.com/skytuhua-org/Gen-V1/pull/1069
- https://github.com/skytuhua-org/Gen-V1/pull/1070
- https://github.com/skytuhua-org/Gen-V1/pull/1072

### Plan publication repair

The complete previously authored plan is restored below from [the immutable source](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/docs/agent-plans/1013-add-unit-tests-for-untested-modules-in-contract-pack.md); it had been published as a file while the issue body held only the intake. Its baseline and design remain as authored. Current progress, corrections and remaining gates are stated above. Paths labelled discovery still require source confirmation before edits.

---

# Add unit tests for untested modules in contract packages — execution plan

## META
- Repo: skytuhua-org/Gen-V1 · Plan revision: 1 (2026-11-21)
- Baseline: main @ e883ac0327c834120d89c3697dec7380a342ba4d
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1013
- Status: plan only — no implementation authorized by this document. Source provenance: issue body reproduced verbatim under REQUIREMENTS so nothing is lost.

## OBJECTIVE
Add unit tests for untested modules in contract packages. Success is the issue's own completion criteria met and verified on main.

## REQUIREMENTS
## Outcome
Modules in `packages/contracts`, `packages/desktop-contract` and `packages/capabilities` are covered by vitest unit tests, and the bugs they find are fixed.

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
- `packages/contracts` — target package
- `packages/desktop-contract` — target package
- `packages/capabilities` — target package

## DESIGN
Cover untested modules in contracts, desktop-contract and capabilities with vitest; fix bugs found.

## EXECUTION_DAG
| Task | Goal | Deps | Done when |
|------|------|------|-----------|
| T01 | Inventory modules and existing coverage | NONE | untested module list |
| T02 | Add tests per module group | T01 | coverage or documented gaps |
| T03 | Fix/file findings | T02 | gates green |

## VALIDATION
- `pnpm lint`, `pnpm typecheck` and `pnpm test` (or the focused suite named in the issue) green on each PR.
- Issue-specific acceptance reproduced and evidenced per the criteria above; browser/Windows-only checks run on a Windows worker or CI.
- Each PR linked to issue #1013; merge only through the normal gate (required CI + independent review).

## STATE
- Researched: issue scope + verified REPO_MAP entries. Not started: all tasks. Owner: unassigned (this plan's author released the claim).
- Exact next step: claim the issue per AGENTS.md, then execute T01.

## REFERENCES
- Issue #1013: https://github.com/skytuhua-org/Gen-V1/issues/1013
- AGENTS.md claim/checkpoint/handoff rules: https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md
