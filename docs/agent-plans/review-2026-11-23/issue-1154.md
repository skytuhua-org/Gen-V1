**Full current issue mirror:** [issue-1154.md](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1154.md). The publication checkpoint pins the exact commit.

## Current reconciliation, 2026-11-24

Revision: `2026-11-24-audit-r1`. Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1154. Source audit: `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Coordination: #1803, `cleanup-2026-11-23-r2`. State: **OPEN**.

native RC subprocess error preservation #1156 remains open. #1434 is a closed duplicate, so the latest next-step reference is stale.

Current target correction: #1156 changes the native receipt orchestration in `scripts/rc-review/run-rc-review.ts` with `tests/rc-review.test.ts`. The earlier map to `build-candidate.ts` is not the retained repair target.

This revision corrects progress and evidence status. It preserves the accepted requirements below. Earlier “not started”, “open PR”, owner, and test statements are historical where this reconciliation gives a newer explicit result. Current ownership remains governed by the live append-only journal; this audit does not release another worker’s implementation claim.

### Verification and remaining work

The issue body, complete paged journal and referenced PR states were reconciled. Existing test receipts remain bound to their stated branch/platform. The source inspections explicitly named above were executed in this audit; no local application tests, native installed acceptance or visual capture are newly claimed. Required tests in the retained plan remain planned until a cited result discharges them. Resume the remaining gate named above through the existing candidate PR and owner, preserving its task IDs and review requirements.

### Evidence

- https://github.com/skytuhua-org/Gen-V1/issues/1154#issuecomment-7057860317
- https://github.com/skytuhua-org/Gen-V1/issues/1154#issuecomment-7060662033
- https://github.com/skytuhua-org/Gen-V1/issues/1154#issuecomment-7060693780
- https://github.com/skytuhua-org/Gen-V1/pull/1156
- https://github.com/skytuhua-org/Gen-V1/pull/1434

### Plan publication repair

The complete previously authored plan is restored below from [the immutable source](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/docs/agent-plans/1154-gen-v1-audit-preserve-the-native-rc-subprocess-error.md); it had been published as a file while the issue body held only the intake. Its baseline and design remain as authored. Current progress, corrections and remaining gates are stated above. Paths labelled discovery still require source confirmation before edits.

---

# Gen V1 audit: preserve the native RC subprocess error when no usable receipt exists — execution plan

## META
- Repo: skytuhua-org/Gen-V1 · Plan revision: 1 (2026-11-21)
- Baseline: main @ e883ac0327c834120d89c3697dec7380a342ba4d
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1154
- Status: plan only — no implementation authorized by this document. Source provenance: issue body reproduced verbatim under REQUIREMENTS so nothing is lost.

## OBJECTIVE
Gen V1 audit: preserve the native RC subprocess error when no usable receipt exists. Success is the issue's own completion criteria met and verified on main.

## REQUIREMENTS
The RC native phase can lose its original subprocess failure while trying to collect a JSON receipt from incomplete stdout. The capture path already records exit error and stdout; a best-effort receipt must not overwrite that diagnostic log or replace its primary failure. Verify with synthetic callbacks and logs, preserve successful-path behavior and all release gates. No installer, live profile or release actions.

## REPO_MAP
Verified at baseline unless marked discovery:
- `scripts/rc-review/build-candidate.ts` — native phase subprocess + receipt capture (verify)

## DESIGN
A best-effort JSON receipt parse must not overwrite the recorded subprocess failure (exit error + stdout) in the RC native phase.

## EXECUTION_DAG
| Task | Goal | Deps | Done when |
|------|------|------|-----------|
| T01 | Synthetic callbacks/logs showing the original failure is lost | NONE | red test |
| T02 | Keep primary failure; attach receipt best-effort | T01 | green; success path unchanged |

## VALIDATION
- `pnpm lint`, `pnpm typecheck` and `pnpm test` (or the focused suite named in the issue) green on each PR.
- Issue-specific acceptance reproduced and evidenced per the criteria above; browser/Windows-only checks run on a Windows worker or CI.
- Each PR linked to issue #1154; merge only through the normal gate (required CI + independent review).

## STATE
- Researched: issue scope + verified REPO_MAP entries. Not started: all tasks. Owner: unassigned (this plan's author released the claim).
- Exact next step: claim the issue per AGENTS.md, then execute T01.

## REFERENCES
- Issue #1154: https://github.com/skytuhua-org/Gen-V1/issues/1154
- AGENTS.md claim/checkpoint/handoff rules: https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md
