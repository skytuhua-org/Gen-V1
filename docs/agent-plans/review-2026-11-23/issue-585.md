**Full current issue mirror:** [issue-585.md](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-585.md). The publication checkpoint pins the exact commit.

## Current reconciliation, 2026-11-24

Revision: `2026-11-24-audit-r1`. Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/585. Source audit: `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Coordination: #1803, `cleanup-2026-11-23-r2`. State: **OPEN**.

#1185 proposes retirement and #1888 proposes automation of the skipped Agents grid lane. Neither alternative is integrated; the real Windows/Edge evidence lane or an approved retirement must be completed.



This revision corrects progress and evidence status. It preserves the accepted requirements below. Earlier “not started”, “open PR”, owner, and test statements are historical where this reconciliation gives a newer explicit result. Current ownership remains governed by the live append-only journal; this audit does not release another worker’s implementation claim.

### Verification and remaining work

The issue body, complete paged journal and referenced PR states were reconciled. Existing test receipts remain bound to their stated branch/platform. The source inspections explicitly named above were executed in this audit; no local application tests, native installed acceptance or visual capture are newly claimed. Required tests in the retained plan remain planned until a cited result discharges them. Resume the remaining gate named above through the existing candidate PR and owner, preserving its task IDs and review requirements.

### Evidence

- https://github.com/skytuhua-org/Gen-V1/issues/585#issuecomment-7057853756
- https://github.com/skytuhua-org/Gen-V1/issues/585#issuecomment-7098242744
- https://github.com/skytuhua-org/Gen-V1/issues/585#issuecomment-7098309546
- https://github.com/skytuhua-org/Gen-V1/pull/1185
- https://github.com/skytuhua-org/Gen-V1/pull/1888

### Plan publication repair

The complete previously authored plan is restored below from [the immutable source](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/docs/agent-plans/585-automate-or-retire-the-skipped-agents-grid-ui-eviden.md); it had been published as a file while the issue body held only the intake. Its baseline and design remain as authored. Current progress, corrections and remaining gates are stated above. Paths labelled discovery still require source confirmation before edits.

---

# Automate or retire the skipped agents-grid UI evidence check — execution plan

## META
- Repo: skytuhua-org/Gen-V1 · Plan revision: 1 (2026-11-21)
- Baseline: main @ e883ac0327c834120d89c3697dec7380a342ba4d
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/585
- Status: plan only — no implementation authorized by this document. Source provenance: issue body reproduced verbatim under REQUIREMENTS so nothing is lost.

## OBJECTIVE
Automate or retire the skipped agents-grid UI evidence check. Success is the issue's own completion criteria met and verified on main.

## REQUIREMENTS
The `Agents grid UI evidence (Windows, pinned Edge)` job reports `skipped` on every run — the evidence is not actually being produced in CI. Either wire `tests/e2e/agents-workspace-evidence.spec.ts` into the pipeline (pinned Edge, evidence upload) or remove the job and document the manual evidence path.

## REPO_MAP
Verified at baseline unless marked discovery:
- `tests/e2e/agents-workspace-evidence.spec.ts` — the spec the skipped job refers to
- `.github/workflows/` — workflow that defines the 'Agents grid UI evidence (Windows, pinned Edge)' job
- `.github/workflows/ci.yml` — main CI workflow for comparison

## DESIGN
Decide one of two paths: wire the spec into CI with pinned Edge and evidence upload, or remove the job and document the manual evidence path. Prefer automation only if the spec is already green.

## EXECUTION_DAG
| Task | Goal | Deps | Done when |
|------|------|------|-----------|
| T01 | Run the spec locally/in CI harness to learn whether it passes today | NONE | verdict: automatable or retire |
| T02a | If automatable: add a workflow job running the spec on pinned Edge with artifact upload | T01 | workflow diff, job produces non-skipped result |
| T02b | If not: delete the always-skipped job and document the manual evidence procedure | T01 | job removed; docs updated |

## VALIDATION
- `pnpm lint`, `pnpm typecheck` and `pnpm test` (or the focused suite named in the issue) green on each PR.
- Issue-specific acceptance reproduced and evidenced per the criteria above; browser/Windows-only checks run on a Windows worker or CI.
- Each PR linked to issue #585; merge only through the normal gate (required CI + independent review).

## STATE
- Researched: issue scope + verified REPO_MAP entries. Not started: all tasks. Owner: unassigned (this plan's author released the claim).
- Exact next step: claim the issue per AGENTS.md, then execute T01.

## REFERENCES
- Issue #585: https://github.com/skytuhua-org/Gen-V1/issues/585
- AGENTS.md claim/checkpoint/handoff rules: https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md
