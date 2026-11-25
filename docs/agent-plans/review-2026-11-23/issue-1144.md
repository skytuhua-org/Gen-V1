**Full current issue mirror:** [issue-1144.md](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1144.md). The publication checkpoint pins the exact commit.

## Current reconciliation, 2026-11-24

Revision: `2026-11-24-audit-r1`. Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1144. Source audit: `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Coordination: #1803, `cleanup-2026-11-23-r2`. State: **OPEN**.

canonical missing-root profile snapshot repair #1388 remains open. #1406 is a closed duplicate; the next step should follow #1388, not reopen the duplicate.



This revision corrects progress and evidence status. It preserves the accepted requirements below. Earlier “not started”, “open PR”, owner, and test statements are historical where this reconciliation gives a newer explicit result. Current ownership remains governed by the live append-only journal; this audit does not release another worker’s implementation claim.

### Verification and remaining work

The issue body, complete paged journal and referenced PR states were reconciled. Existing test receipts remain bound to their stated branch/platform. The source inspections explicitly named above were executed in this audit; no local application tests, native installed acceptance or visual capture are newly claimed. Required tests in the retained plan remain planned until a cited result discharges them. Resume the remaining gate named above through the existing candidate PR and owner, preserving its task IDs and review requirements.

### Evidence

- https://github.com/skytuhua-org/Gen-V1/issues/1144#issuecomment-7060363508
- https://github.com/skytuhua-org/Gen-V1/issues/1144#issuecomment-7060422896
- https://github.com/skytuhua-org/Gen-V1/issues/1144#issuecomment-7060423738
- https://github.com/skytuhua-org/Gen-V1/pull/1388
- https://github.com/skytuhua-org/Gen-V1/pull/1406

### Plan publication repair

The complete previously authored plan is restored below from [the immutable source](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/docs/agent-plans/1144-gen-v1-audit-reject-an-rc-profile-snapshot-when-eith.md); it had been published as a file while the issue body held only the intake. Its baseline and design remain as authored. Current progress, corrections and remaining gates are stated above. Paths labelled discovery still require source confirmation before edits.

---

# Gen V1 audit: reject an RC profile snapshot when either source root is missing — execution plan

## META
- Repo: skytuhua-org/Gen-V1 · Plan revision: 1 (2026-11-21)
- Baseline: main @ e883ac0327c834120d89c3697dec7380a342ba4d
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1144
- Status: plan only — no implementation authorized by this document. Source provenance: issue body reproduced verbatim under REQUIREMENTS so nothing is lost.

## OBJECTIVE
Gen V1 audit: reject an RC profile snapshot when either source root is missing. Success is the issue's own completion criteria met and verified on main.

## REQUIREMENTS
The RC snapshot inventories both profile and host roots as upgrade preservation evidence. Confirm that an absent or mistyped root is silently reported as empty. Fix only verified false-empty inventories: require both submitted roots to exist as directories, allow existing empty roots, and retain optional account-directory behavior. Test with synthetic temporary paths; no installer, profile migration, or release-gate changes. Open a focused PR only after red/green verification and preserve required CI and independent review.

## REPO_MAP
Verified at baseline unless marked discovery:
- `scripts/rc-review/profile-manifest.ts` — profile/host root inventory (verify)
- `scripts/rc-review/run-rc-review.ts` — snapshot entry point
- `tests/rc-review.test.ts` — existing RC tests

## DESIGN
Require both submitted roots to exist as directories before the RC snapshot; keep existing empty roots allowed and optional account-directory behavior. Synthetic temp paths only.

## EXECUTION_DAG
| Task | Goal | Deps | Done when |
|------|------|------|-----------|
| T01 | Reproduce false-empty inventory with a missing/mistyped root | NONE | red synthetic test |
| T02 | Validate roots as directories pre-inventory; preserve empty-root and account-dir behavior | T01 | green; focused PR |

## VALIDATION
- `pnpm lint`, `pnpm typecheck` and `pnpm test` (or the focused suite named in the issue) green on each PR.
- Issue-specific acceptance reproduced and evidenced per the criteria above; browser/Windows-only checks run on a Windows worker or CI.
- Each PR linked to issue #1144; merge only through the normal gate (required CI + independent review).

## STATE
- Researched: issue scope + verified REPO_MAP entries. Not started: all tasks. Owner: unassigned (this plan's author released the claim).
- Exact next step: claim the issue per AGENTS.md, then execute T01.

## REFERENCES
- Issue #1144: https://github.com/skytuhua-org/Gen-V1/issues/1144
- AGENTS.md claim/checkpoint/handoff rules: https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md
