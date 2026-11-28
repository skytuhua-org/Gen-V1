**Full current issue mirror:** [issue-1081.md](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1081.md). The publication checkpoint pins the exact commit.

## Current reconciliation, 2026-11-24

Revision: `2026-11-24-audit-r1`. Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1081. Source audit: `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Coordination: #1803, `cleanup-2026-11-23-r2`. State: **OPEN**.

Pi fixes #1083/#1084 merged. Terminal-startup PR #1082 is now closed as semantically superseded by merged #1867. The coordinated audit ran its unchanged nine regression tests against current main (9/9 PASS), then the main terminal suites (24/24 PASS), and obtained an exact-main tree after resolving overlaps. [Closure receipt](https://github.com/skytuhua-org/Gen-V1/pull/1082#issuecomment-7122133874). Alternative #1431 and the empty Pi diagnostic #1432 remain separate open PRs at this inspection; retain their review/disposition and the issue’s remaining main-verification gates. This does not claim installed Windows or release approval.



This revision corrects progress and evidence status. It preserves the accepted requirements below. Earlier “not started”, “open PR”, owner, and test statements are historical where this reconciliation gives a newer explicit result. Current ownership remains governed by the live append-only journal; this audit does not release another worker’s implementation claim.

### Verification and remaining work

The issue body, complete paged journal and referenced PR states were reconciled. Existing test receipts remain bound to their stated branch/platform. The source inspections explicitly named above were executed in this audit; no local application tests, native installed acceptance or visual capture are newly claimed. Required tests in the retained plan remain planned until a cited result discharges them. Resume the remaining gate named above through the existing candidate PR and owner, preserving its task IDs and review requirements.

### Evidence

- https://github.com/skytuhua-org/Gen-V1/issues/1081#issuecomment-7060484395
- https://github.com/skytuhua-org/Gen-V1/issues/1081#issuecomment-7060657714
- https://github.com/skytuhua-org/Gen-V1/issues/1081#issuecomment-7060662756
- https://github.com/skytuhua-org/Gen-V1/pull/1082
- https://github.com/skytuhua-org/Gen-V1/pull/1083
- https://github.com/skytuhua-org/Gen-V1/pull/1084
- https://github.com/skytuhua-org/Gen-V1/pull/1431
- https://github.com/skytuhua-org/Gen-V1/pull/1432

### Plan publication repair

The complete previously authored plan is restored below from [the immutable source](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/docs/agent-plans/1081-gen-v1-audit-terminal-startup-rollback-and-pi-worker.md); it had been published as a file while the issue body held only the intake. Its baseline and design remain as authored. Current progress, corrections and remaining gates are stated above. Paths labelled discovery still require source confirmation before edits.

---

# Gen V1 audit: terminal startup rollback and Pi worker settlement — execution plan

## META
- Repo: skytuhua-org/Gen-V1 · Plan revision: 1 (2026-11-21)
- Baseline: main @ e883ac0327c834120d89c3697dec7380a342ba4d
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1081
- Status: plan only — no implementation authorized by this document. Source provenance: issue body reproduced verbatim under REQUIREMENTS so nothing is lost.

## OBJECTIVE
Gen V1 audit: terminal startup rollback and Pi worker settlement. Success is the issue's own completion criteria met and verified on main.

## REQUIREMENTS
Scope: backend terminal host startup and the Pi runtime’s tool-response and worker-exit paths. Audit terminal registration when durable status cannot be written, Pi tool replies with a present but empty diagnostic, and Pi worker exit cleanup if an event observer throws. One focused PR for each verified defect; synthetic fixtures only. Existing terminal exit retention/settlement PRs #1077 and #1079 own separate exit behavior, and #1068 is standalone coverage. Acceptance: reproduce each confirmed defect; local regression tests, typecheck/build, exact required CI, independent review, clean tested combined tree and compliant merge; verify on main before closing. No frontend, features or platform enforcement changes.

## REPO_MAP
Verified at baseline unless marked discovery:
- `packages/runtime-pi/index.ts` — Pi runtime tool-response and worker-exit paths
- `apps/server` — terminal host registration (exact file = discovery)
- `tests/` — synthetic fixtures only

## DESIGN
Audit three backend paths, one focused PR per verified defect: (a) terminal registration when durable status cannot be written, (b) Pi tool replies with present-but-empty diagnostic, (c) Pi worker exit cleanup when an event observer throws. #1077/#1079 own separate exit behavior; #1068 standalone coverage.

## EXECUTION_DAG
| Task | Goal | Deps | Done when |
|------|------|------|-----------|
| T01 | Reproduce defect (a): registration without durable status write | NONE | red test + focused PR |
| T02 | Reproduce defect (b): empty-diagnostic tool reply | NONE | red test + focused PR |
| T03 | Reproduce defect (c): exit cleanup when observer throws | NONE | red test + focused PR |
| T04 | Verify each fix on main before closing | T01,T02,T03 | merged + verified on main |

## VALIDATION
- `pnpm lint`, `pnpm typecheck` and `pnpm test` (or the focused suite named in the issue) green on each PR.
- Issue-specific acceptance reproduced and evidenced per the criteria above; browser/Windows-only checks run on a Windows worker or CI.
- Each PR linked to issue #1081; merge only through the normal gate (required CI + independent review).

## STATE
- Researched: issue scope + verified REPO_MAP entries. Not started: all tasks. Owner: unassigned (this plan's author released the claim).
- Exact next step: claim the issue per AGENTS.md, then execute T01.

## REFERENCES
- Issue #1081: https://github.com/skytuhua-org/Gen-V1/issues/1081
- AGENTS.md claim/checkpoint/handoff rules: https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md
