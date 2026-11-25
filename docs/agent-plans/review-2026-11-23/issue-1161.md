**Full current issue mirror:** [issue-1161.md](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1161.md). The publication checkpoint pins the exact commit.

## Current reconciliation, 2026-11-24

Revision: `2026-11-24-audit-r1`. Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1161. Source audit: `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Coordination: #1803, `cleanup-2026-11-23-r2`. State: **OPEN**.

canonical official-distribution UTF-8 repair #1165 remains open. Related #1442 targets a different packaged-provider verifier and does not complete this issue; valid Unicode, including a literal replacement character, must remain accepted.

Scope correction: #1165 targets `scripts/verify-official-distributions.ts` and `tests/official-runtime-storage.test.ts`, which match this issue’s official-version probe. #1442 concerns the packaged-provider verifier and cannot by itself discharge the official-distribution requirement. The earlier plan map to the packaged verifier is a historical discovery lead, not the canonical target.

This revision corrects progress and evidence status. It preserves the accepted requirements below. Earlier “not started”, “open PR”, owner, and test statements are historical where this reconciliation gives a newer explicit result. Current ownership remains governed by the live append-only journal; this audit does not release another worker’s implementation claim.

### Verification and remaining work

The issue body, complete paged journal and referenced PR states were reconciled. Existing test receipts remain bound to their stated branch/platform. The source inspections explicitly named above were executed in this audit; no local application tests, native installed acceptance or visual capture are newly claimed. Required tests in the retained plan remain planned until a cited result discharges them. Resume the remaining gate named above through the existing candidate PR and owner, preserving its task IDs and review requirements.

### Evidence

- https://github.com/skytuhua-org/Gen-V1/issues/1161#issuecomment-7057860844
- https://github.com/skytuhua-org/Gen-V1/issues/1161#issuecomment-7060726397
- https://github.com/skytuhua-org/Gen-V1/issues/1161#issuecomment-7060747476
- https://github.com/skytuhua-org/Gen-V1/pull/1165
- https://github.com/skytuhua-org/Gen-V1/pull/1442

### Plan publication repair

The complete previously authored plan is restored below from [the immutable source](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/docs/agent-plans/1161-gen-v1-audit-reject-malformed-utf-8-in-official-vers.md); it had been published as a file while the issue body held only the intake. Its baseline and design remain as authored. Current progress, corrections and remaining gates are stated above. Paths labelled discovery still require source confirmation before edits.

---

# Gen V1 audit: reject malformed UTF-8 in official version evidence — execution plan

## META
- Repo: skytuhua-org/Gen-V1 · Plan revision: 1 (2026-11-21)
- Baseline: main @ e883ac0327c834120d89c3697dec7380a342ba4d
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1161
- Status: plan only — no implementation authorized by this document. Source provenance: issue body reproduced verbatim under REQUIREMENTS so nothing is lost.

## OBJECTIVE
Gen V1 audit: reject malformed UTF-8 in official version evidence. Success is the issue's own completion criteria met and verified on main.

## REQUIREMENTS
A CLI can exit successfully while reporting invalid UTF-8; the version probe currently replaces those bytes and accepts the replacement character as evidence. Require actual well-formed nonempty stdout, preserve combined output/deadline behavior and valid Unicode, and test synthetic Node stdout only. Do not invoke any provider, authenticate, or run live inference. Separate from historical empty-output and runtime framing fixes.

## REPO_MAP
Verified at baseline unless marked discovery:
- `scripts/verify-packaged-providers.ts` — version probe accepts replacement char (verify)
- `tests/packaged-providers.test.ts` — existing tests

## DESIGN
Require well-formed nonempty stdout from the version probe — reject malformed UTF-8 rather than accepting the replacement character; preserve combined output/deadline behavior and valid Unicode. Synthetic Node stdout only.

## EXECUTION_DAG
| Task | Goal | Deps | Done when |
|------|------|------|-----------|
| T01 | Synthetic stdout with invalid UTF-8 proves silent acceptance | NONE | red test |
| T02 | Validate UTF-8 before accepting version evidence | T01 | green; valid Unicode still accepted |

## VALIDATION
- `pnpm lint`, `pnpm typecheck` and `pnpm test` (or the focused suite named in the issue) green on each PR.
- Issue-specific acceptance reproduced and evidenced per the criteria above; browser/Windows-only checks run on a Windows worker or CI.
- Each PR linked to issue #1161; merge only through the normal gate (required CI + independent review).

## STATE
- Researched: issue scope + verified REPO_MAP entries. Not started: all tasks. Owner: unassigned (this plan's author released the claim).
- Exact next step: claim the issue per AGENTS.md, then execute T01.

## REFERENCES
- Issue #1161: https://github.com/skytuhua-org/Gen-V1/issues/1161
- AGENTS.md claim/checkpoint/handoff rules: https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md
