**Full current issue mirror:** [issue-1058.md](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1058.md). The publication checkpoint pins the exact commit.

## Current reconciliation, 2026-11-24

Revision: `2026-11-24-audit-r1`. Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1058. Source audit: `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Coordination: #1803, `cleanup-2026-11-23-r2`. State: **OPEN**.

API documentation #951 remains open. Merged docs #952/#953 do not document all exported plugin APIs.



This revision corrects progress and evidence status. It preserves the accepted requirements below. Earlier “not started”, “open PR”, owner, and test statements are historical where this reconciliation gives a newer explicit result. Current ownership remains governed by the live append-only journal; this audit does not release another worker’s implementation claim.

### Verification and remaining work

The issue body, complete paged journal and referenced PR states were reconciled. Existing test receipts remain bound to their stated branch/platform. The source inspections explicitly named above were executed in this audit; no local application tests, native installed acceptance or visual capture are newly claimed. Required tests in the retained plan remain planned until a cited result discharges them. Resume the remaining gate named above through the existing candidate PR and owner, preserving its task IDs and review requirements.

### Evidence

- https://github.com/skytuhua-org/Gen-V1/issues/1058#issuecomment-7037112137
- https://github.com/skytuhua-org/Gen-V1/issues/1058#issuecomment-7037159312
- https://github.com/skytuhua-org/Gen-V1/issues/1058#issuecomment-7057858661
- https://github.com/skytuhua-org/Gen-V1/pull/951
- https://github.com/skytuhua-org/Gen-V1/pull/952
- https://github.com/skytuhua-org/Gen-V1/pull/953

### Plan publication repair

The complete previously authored plan is restored below from [the immutable source](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/docs/agent-plans/1058-add-jsdoc-to-the-exported-plugin-api.md); it had been published as a file while the issue body held only the intake. Its baseline and design remain as authored. Current progress, corrections and remaining gates are stated above. Paths labelled discovery still require source confirmation before edits.

---

# Add JSDoc to the exported plugin API — execution plan

## META
- Repo: skytuhua-org/Gen-V1 · Plan revision: 1 (2026-11-21)
- Baseline: main @ e883ac0327c834120d89c3697dec7380a342ba4d
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1058
- Status: plan only — no implementation authorized by this document. Source provenance: issue body reproduced verbatim under REQUIREMENTS so nothing is lost.

## OBJECTIVE
Add JSDoc to the exported plugin API. Success is the issue's own completion criteria met and verified on main.

## REQUIREMENTS
## Outcome
Every exported function and type in the plugin API (`packages/plugins` and `docs/plugin-api.md`) has accurate JSDoc.

## Scope
- Describe parameters, return values and thrown errors from what the code actually does, and fix `docs/plugin-api.md` where it disagrees with the code.
- Fix what you find in the source when it is a clear bug. Keep public behavior unless a fix needs it to change, and say so in the PR body.
- One concern per PR, each under 400 lines, linked to this issue. Skip any file changed by an open PR.

## Done when
- No exported plugin API symbol lacks JSDoc, and the doc matches the code.
- `pnpm lint`, `pnpm typecheck` and `pnpm test` pass on each PR, and the PRs merge through the normal gate.

Mechanical work for a free session or smaller model. Coordinate on this issue per AGENTS.md.

[Written by Devin](https://app.devin.ai/sessions/3ec16cd8dc2e450da822fc30c43dd218)

## REPO_MAP
Verified at baseline unless marked discovery:
- `packages/plugins` — exported plugin API
- `docs/plugin-api.md` — doc to keep in sync

## DESIGN
Add accurate JSDoc to every exported plugin API symbol: params, returns, throws from actual behavior; fix docs/plugin-api.md where it disagrees; fix clear bugs. One concern per PR under 400 lines.

## EXECUTION_DAG
| Task | Goal | Deps | Done when |
|------|------|------|-----------|
| T01 | List exported symbols lacking JSDoc | NONE | symbol inventory |
| T02 | Add JSDoc + fix doc disagreements per PR | T01 | no export lacks JSDoc; doc matches code |
| T03 | Fix/file bugs found | T02 | gates green |

## VALIDATION
- `pnpm lint`, `pnpm typecheck` and `pnpm test` (or the focused suite named in the issue) green on each PR.
- Issue-specific acceptance reproduced and evidenced per the criteria above; browser/Windows-only checks run on a Windows worker or CI.
- Each PR linked to issue #1058; merge only through the normal gate (required CI + independent review).

## STATE
- Researched: issue scope + verified REPO_MAP entries. Not started: all tasks. Owner: unassigned (this plan's author released the claim).
- Exact next step: claim the issue per AGENTS.md, then execute T01.

## REFERENCES
- Issue #1058: https://github.com/skytuhua-org/Gen-V1/issues/1058
- AGENTS.md claim/checkpoint/handoff rules: https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md
