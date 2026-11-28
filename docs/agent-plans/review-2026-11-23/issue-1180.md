**Full current issue mirror:** [issue-1180.md](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1180.md). The publication checkpoint pins the exact commit.

## Current reconciliation, 2026-11-24

Revision: `2026-11-24-audit-r1`. Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1180. Source audit: `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Coordination: #1803, `cleanup-2026-11-23-r2`. State: **OPEN**.

bounded streaming evidence hashing #1593 remains open and #1198 is closed duplicate work. Main still retains the whole-file path requiring repair.



This revision corrects progress and evidence status. It preserves the accepted requirements below. Earlier “not started”, “open PR”, owner, and test statements are historical where this reconciliation gives a newer explicit result. Current ownership remains governed by the live append-only journal; this audit does not release another worker’s implementation claim.

### Verification and remaining work

The issue body, complete paged journal and referenced PR states were reconciled. Existing test receipts remain bound to their stated branch/platform. The source inspections explicitly named above were executed in this audit; no local application tests, native installed acceptance or visual capture are newly claimed. Required tests in the retained plan remain planned until a cited result discharges them. Resume the remaining gate named above through the existing candidate PR and owner, preserving its task IDs and review requirements.

### Evidence

- https://github.com/skytuhua-org/Gen-V1/issues/1180#issuecomment-7057862148
- https://github.com/skytuhua-org/Gen-V1/issues/1180#issuecomment-7066683997
- https://github.com/skytuhua-org/Gen-V1/issues/1180#issuecomment-7066772797
- https://github.com/skytuhua-org/Gen-V1/pull/1198
- https://github.com/skytuhua-org/Gen-V1/pull/1593

### Plan publication repair

The complete previously authored plan is restored below from [the immutable source](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/docs/agent-plans/1180-gen-v1-audit-stream-hashes-of-large-rc-evidence-file.md); it had been published as a file while the issue body held only the intake. Its baseline and design remain as authored. Current progress, corrections and remaining gates are stated above. Paths labelled discovery still require source confirmation before edits.

---

# Gen V1 audit: stream hashes of large RC evidence files — execution plan

## META
- Repo: skytuhua-org/Gen-V1 · Plan revision: 1 (2026-11-21)
- Baseline: main @ e883ac0327c834120d89c3697dec7380a342ba4d
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1180
- Status: plan only — no implementation authorized by this document. Source provenance: issue body reproduced verbatim under REQUIREMENTS so nothing is lost.

## OBJECTIVE
Gen V1 audit: stream hashes of large RC evidence files. Success is the issue's own completion criteria met and verified on main.

## REQUIREMENTS
RC evidence hashes load a complete file via readFile. On current Linux Node 24.22.3, a 2 GiB sparse ordinary file fails immediately with ERR_FS_FILE_TOO_LARGE. Profiles, archives and installer receipts require SHA-256 independent of working-set-sized allocations. Change only the hash helper, preserve exact digest/errors, and validate empty and multi-chunk fixtures plus a local sparse-file check. No change to the subprocess helper, archive format, installer or release gate.

## REPO_MAP
Verified at baseline unless marked discovery:
- `scripts/rc-review/common.ts` — hash helper loads whole file via readFile (verify)

## DESIGN
Stream SHA-256 for RC evidence so multi-GiB files don't hit ERR_FS_FILE_TOO_LARGE on Node 24; identical digests and errors; only the hash helper changes.

## EXECUTION_DAG
| Task | Goal | Deps | Done when |
|------|------|------|-----------|
| T01 | Convert hash helper to stream reads; empty + multi-chunk fixture tests | NONE | digests identical to readFile version |
| T02 | Local sparse-file (>2 GiB) check | T01 | sparse file hashes without allocation error |

## VALIDATION
- `pnpm lint`, `pnpm typecheck` and `pnpm test` (or the focused suite named in the issue) green on each PR.
- Issue-specific acceptance reproduced and evidenced per the criteria above; browser/Windows-only checks run on a Windows worker or CI.
- Each PR linked to issue #1180; merge only through the normal gate (required CI + independent review).

## STATE
- Researched: issue scope + verified REPO_MAP entries. Not started: all tasks. Owner: unassigned (this plan's author released the claim).
- Exact next step: claim the issue per AGENTS.md, then execute T01.

## REFERENCES
- Issue #1180: https://github.com/skytuhua-org/Gen-V1/issues/1180
- AGENTS.md claim/checkpoint/handoff rules: https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md
