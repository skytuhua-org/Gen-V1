**Full current issue mirror:** [issue-1160.md](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1160.md). The publication checkpoint pins the exact commit.

## Current reconciliation, 2026-11-24

Revision: `2026-11-24-audit-r1`. Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1160. Source audit: `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Coordination: #1803, `cleanup-2026-11-23-r2`. State: **OPEN**.

canonical linear RC profile row scan #1438 remains open; #1162 is closed duplicate work. Operation-count evidence is on the candidate branch.

Current target correction: the retained lookup repair is in `scripts/rc-review/profile-manifest.ts`, covered by `tests/rc-review.test.ts`. The original map to `upgrade-check.ts` was only a discovery lead.

This revision corrects progress and evidence status. It preserves the accepted requirements below. Earlier “not started”, “open PR”, owner, and test statements are historical where this reconciliation gives a newer explicit result. Current ownership remains governed by the live append-only journal; this audit does not release another worker’s implementation claim.

### Verification and remaining work

The issue body, complete paged journal and referenced PR states were reconciled. Existing test receipts remain bound to their stated branch/platform. The source inspections explicitly named above were executed in this audit; no local application tests, native installed acceptance or visual capture are newly claimed. Required tests in the retained plan remain planned until a cited result discharges them. Resume the remaining gate named above through the existing candidate PR and owner, preserving its task IDs and review requirements.

### Evidence

- https://github.com/skytuhua-org/Gen-V1/issues/1160#issuecomment-7057860568
- https://github.com/skytuhua-org/Gen-V1/issues/1160#issuecomment-7060701335
- https://github.com/skytuhua-org/Gen-V1/issues/1160#issuecomment-7060714676
- https://github.com/skytuhua-org/Gen-V1/pull/1162
- https://github.com/skytuhua-org/Gen-V1/pull/1438

### Plan publication repair

The complete previously authored plan is restored below from [the immutable source](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/docs/agent-plans/1160-gen-v1-audit-avoid-quadratic-row-scans-in-rc-profile.md); it had been published as a file while the issue body held only the intake. Its baseline and design remain as authored. Current progress, corrections and remaining gates are stated above. Paths labelled discovery still require source confirmation before edits.

---

# Gen V1 audit: avoid quadratic row scans in RC profile comparisons — execution plan

## META
- Repo: skytuhua-org/Gen-V1 · Plan revision: 1 (2026-11-21)
- Baseline: main @ e883ac0327c834120d89c3697dec7380a342ba4d
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1160
- Status: plan only — no implementation authorized by this document. Source provenance: issue body reproduced verbatim under REQUIREMENTS so nothing is lost.

## OBJECTIVE
Gen V1 audit: avoid quadratic row scans in RC profile comparisons. Success is the issue's own completion criteria met and verified on main.

## REQUIREMENTS
RC upgrade comparison checks every prior SQLite row, and currently rescans all current rows from the start for each one. Prove the repeated work with a synthetic long-lived profile table and fix it with a per-table lookup, keeping existing missing/changed/multiset diagnostics and Chromium exclusions. No installer, live profile, release or schema change. Red/green operation-count regression, existing suite and mandatory GitHub gates.

## REPO_MAP
Verified at baseline unless marked discovery:
- `scripts/rc-review/upgrade-check.ts` — per-row rescan comparison (verify)
- `tests/rc-review.test.ts` — existing RC tests

## DESIGN
Replace per-prior-row full rescans in RC upgrade comparison with a per-table lookup; keep missing/changed/multiset diagnostics and Chromium behavior.

## EXECUTION_DAG
| Task | Goal | Deps | Done when |
|------|------|------|-----------|
| T01 | Prove the repeated work with a synthetic long-lived profile table | NONE | instrumented timing/count evidence |
| T02 | Refactor to per-table lookup; diagnostics unchanged | T01 | same outputs, linear scans; focused PR |

## VALIDATION
- `pnpm lint`, `pnpm typecheck` and `pnpm test` (or the focused suite named in the issue) green on each PR.
- Issue-specific acceptance reproduced and evidenced per the criteria above; browser/Windows-only checks run on a Windows worker or CI.
- Each PR linked to issue #1160; merge only through the normal gate (required CI + independent review).

## STATE
- Researched: issue scope + verified REPO_MAP entries. Not started: all tasks. Owner: unassigned (this plan's author released the claim).
- Exact next step: claim the issue per AGENTS.md, then execute T01.

## REFERENCES
- Issue #1160: https://github.com/skytuhua-org/Gen-V1/issues/1160
- AGENTS.md claim/checkpoint/handoff rules: https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md
