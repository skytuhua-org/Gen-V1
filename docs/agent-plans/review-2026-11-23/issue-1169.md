**Full current issue mirror:** [issue-1169.md](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1169.md). The publication checkpoint pins the exact commit.

## Current reconciliation, 2026-11-24

Revision: `2026-11-24-audit-r1`. Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1169. Source audit: `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Coordination: #1803, `cleanup-2026-11-23-r2`. State: **OPEN**.

packaged probe split-UTF-8 repair #1170 remains open. #1821 is a closed duplicate and should not be described as the next implementation.



This revision corrects progress and evidence status. It preserves the accepted requirements below. Earlier “not started”, “open PR”, owner, and test statements are historical where this reconciliation gives a newer explicit result. Current ownership remains governed by the live append-only journal; this audit does not release another worker’s implementation claim.

### Verification and remaining work

The issue body, complete paged journal and referenced PR states were reconciled. Existing test receipts remain bound to their stated branch/platform. The source inspections explicitly named above were executed in this audit; no local application tests, native installed acceptance or visual capture are newly claimed. Required tests in the retained plan remain planned until a cited result discharges them. Resume the remaining gate named above through the existing candidate PR and owner, preserving its task IDs and review requirements.

### Evidence

- https://github.com/skytuhua-org/Gen-V1/issues/1169#issuecomment-7057861098
- https://github.com/skytuhua-org/Gen-V1/issues/1169#issuecomment-7088754187
- https://github.com/skytuhua-org/Gen-V1/issues/1169#issuecomment-7088820353
- https://github.com/skytuhua-org/Gen-V1/pull/1170
- https://github.com/skytuhua-org/Gen-V1/pull/1821

### Plan publication repair

The complete previously authored plan is restored below from [the immutable source](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/docs/agent-plans/1169-gen-v1-audit-preserve-utf-8-across-packaged-probe-re.md); it had been published as a file while the issue body held only the intake. Its baseline and design remain as authored. Current progress, corrections and remaining gates are stated above. Paths labelled discovery still require source confirmation before edits.

---

# Gen V1 audit: preserve UTF-8 across packaged probe report chunks — execution plan

## META
- Repo: skytuhua-org/Gen-V1 · Plan revision: 1 (2026-11-21)
- Baseline: main @ e883ac0327c834120d89c3697dec7380a342ba4d
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1169
- Status: plan only — no implementation authorized by this document. Source provenance: issue body reproduced verbatim under REQUIREMENTS so nothing is lost.

## OBJECTIVE
Gen V1 audit: preserve UTF-8 across packaged probe report chunks. Success is the issue's own completion criteria met and verified on main.

## REQUIREMENTS
## Scope
T01: the outer packaged-provider verifier independently converts each stdout Buffer to text before parsing the JSON report. A legitimate Unicode file path can be silently altered if a character spans two stdout chunks. Fix only the outer report capture in `scripts/verify-packaged-providers.ts` and add a deterministic synthetic child-output regression in `tests/packaged-providers.test.ts`. Distinct from #1161, which concerns malformed stdout from a version-only child in a different verifier. No provider login, real accounts, external API calls, installers, or scope changes.

## Acceptance
Repeatably split a legal UTF-8 character within a JSON report across Buffer chunks and prove the current verifier fails to preserve it; preserve exact report bytes without changing the existing combined byte limit, exit/timeout behavior, or report and path validation. Check relevant local tests and exact required CI/independent approval before compliant merge and push verification.

## REPO_MAP
Verified at baseline unless marked discovery:
- `scripts/verify-packaged-providers.ts` — outer verifier converts each chunk separately
- `tests/packaged-providers.test.ts` — regression test target

## DESIGN
Buffer full stdout before decoding so a UTF-8 character split across chunks is preserved; keep combined byte limit, exit/timeout behavior, report and path validation.

## EXECUTION_DAG
| Task | Goal | Deps | Done when |
|------|------|------|-----------|
| T01 | Regression test splitting a legal UTF-8 char across chunks | NONE | red test showing altered path/JSON |
| T02 | Concatenate chunks then decode | T01 | green; exact report bytes preserved |

## VALIDATION
- `pnpm lint`, `pnpm typecheck` and `pnpm test` (or the focused suite named in the issue) green on each PR.
- Issue-specific acceptance reproduced and evidenced per the criteria above; browser/Windows-only checks run on a Windows worker or CI.
- Each PR linked to issue #1169; merge only through the normal gate (required CI + independent review).

## STATE
- Researched: issue scope + verified REPO_MAP entries. Not started: all tasks. Owner: unassigned (this plan's author released the claim).
- Exact next step: claim the issue per AGENTS.md, then execute T01.

## REFERENCES
- Issue #1169: https://github.com/skytuhua-org/Gen-V1/issues/1169
- AGENTS.md claim/checkpoint/handoff rules: https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md
