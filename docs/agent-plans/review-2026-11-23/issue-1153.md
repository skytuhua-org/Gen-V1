**Full current issue mirror:** [issue-1153.md](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1153.md). The publication checkpoint pins the exact commit.

## Current reconciliation, 2026-11-24

Revision: `2026-11-24-audit-r1`. Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1153. Source audit: `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Coordination: #1803, `cleanup-2026-11-23-r2`. State: **OPEN**.

canonical teardown repair #1428 remains open; #1155 is closed duplicate work. AggregateError/continue-cleanup behavior still needs main integration.



This revision corrects progress and evidence status. It preserves the accepted requirements below. Earlier “not started”, “open PR”, owner, and test statements are historical where this reconciliation gives a newer explicit result. Current ownership remains governed by the live append-only journal; this audit does not release another worker’s implementation claim.

### Verification and remaining work

The issue body, complete paged journal and referenced PR states were reconciled. Existing test receipts remain bound to their stated branch/platform. The source inspections explicitly named above were executed in this audit; no local application tests, native installed acceptance or visual capture are newly claimed. Required tests in the retained plan remain planned until a cited result discharges them. Resume the remaining gate named above through the existing candidate PR and owner, preserving its task IDs and review requirements.

### Evidence

- https://github.com/skytuhua-org/Gen-V1/issues/1153#issuecomment-7057860023
- https://github.com/skytuhua-org/Gen-V1/issues/1153#issuecomment-7060586058
- https://github.com/skytuhua-org/Gen-V1/issues/1153#issuecomment-7060648139
- https://github.com/skytuhua-org/Gen-V1/pull/1155
- https://github.com/skytuhua-org/Gen-V1/pull/1428

### Plan publication repair

The complete previously authored plan is restored below from [the immutable source](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/docs/agent-plans/1153-gen-v1-audit-continue-rc-session-teardown-when-brows.md); it had been published as a file while the issue body held only the intake. Its baseline and design remain as authored. Current progress, corrections and remaining gates are stated above. Paths labelled discovery still require source confirmation before edits.

---

# Gen V1 audit: continue RC session teardown when browser disconnect fails — execution plan

## META
- Repo: skytuhua-org/Gen-V1 · Plan revision: 1 (2026-11-21)
- Baseline: main @ e883ac0327c834120d89c3697dec7380a342ba4d
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1153
- Status: plan only — no implementation authorized by this document. Source provenance: issue body reproduced verbatim under REQUIREMENTS so nothing is lost.

## OBJECTIVE
Gen V1 audit: continue RC session teardown when browser disconnect fails. Success is the issue's own completion criteria met and verified on main.

## REQUIREMENTS
The installed RC harness closes the verified browser session before terminating a still-running child. A failed browser close skips the owned child cleanup. Confirm this with synthetic rejected close and termination callbacks, then ensure the second cleanup runs and errors remain observable. Preserve all ownership checks, installed verifier behavior and required merge gates; do not launch an installer or terminate a real process.

## REPO_MAP
Verified at baseline unless marked discovery:
- `scripts/rc-review/installed-session.ts` — browser close then child terminate ordering (verify)

## DESIGN
If browser-session close rejects, still run the owned child cleanup; keep errors observable, ownership checks and installed-verifier behavior.

## EXECUTION_DAG
| Task | Goal | Deps | Done when |
|------|------|------|-----------|
| T01 | Synthetic rejected-close test proving the second cleanup is skipped today | NONE | red test |
| T02 | Run child cleanup regardless of close failure; surface both errors | T01 | green; focused PR |

## VALIDATION
- `pnpm lint`, `pnpm typecheck` and `pnpm test` (or the focused suite named in the issue) green on each PR.
- Issue-specific acceptance reproduced and evidenced per the criteria above; browser/Windows-only checks run on a Windows worker or CI.
- Each PR linked to issue #1153; merge only through the normal gate (required CI + independent review).

## STATE
- Researched: issue scope + verified REPO_MAP entries. Not started: all tasks. Owner: unassigned (this plan's author released the claim).
- Exact next step: claim the issue per AGENTS.md, then execute T01.

## REFERENCES
- Issue #1153: https://github.com/skytuhua-org/Gen-V1/issues/1153
- AGENTS.md claim/checkpoint/handoff rules: https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md
