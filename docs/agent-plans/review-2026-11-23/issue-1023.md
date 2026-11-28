**Full current issue mirror:** [issue-1023.md](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1023.md). The publication checkpoint pins the exact commit.

## Current reconciliation, 2026-11-24

Revision: `2026-11-24-audit-r1`. Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1023. Source audit: `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Coordination: #1803, `cleanup-2026-11-23-r2`. State: **OPEN**.

M16 #812 is draft. Recent hosted smoke and owned-browser capture/Stop receipts advance T01/T02, but selected-window, native picker/input, real-account write and T03 review/publication gates remain held.



This revision corrects progress and evidence status. It preserves the accepted requirements below. Earlier “not started”, “open PR”, owner, and test statements are historical where this reconciliation gives a newer explicit result. Current ownership remains governed by the live append-only journal; this audit does not release another worker’s implementation claim.

### Verification and remaining work

The issue body, complete paged journal and referenced PR states were reconciled. Existing test receipts remain bound to their stated branch/platform. The source inspections explicitly named above were executed in this audit; no local application tests, native installed acceptance or visual capture are newly claimed. Required tests in the retained plan remain planned until a cited result discharges them. Resume the remaining gate named above through the existing candidate PR and owner, preserving its task IDs and review requirements.

### Evidence

- https://github.com/skytuhua-org/Gen-V1/issues/1023#issuecomment-7121059369
- https://github.com/skytuhua-org/Gen-V1/issues/1023#issuecomment-7121331108
- https://github.com/skytuhua-org/Gen-V1/issues/1023#issuecomment-7121444817
- https://github.com/skytuhua-org/Gen-V1/pull/812

### Plan publication repair

The complete previously authored plan is restored below from [the immutable source](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/docs/agent-plans/1023-m16-verify-the-installed-windows-control-bridge-and.md); it had been published as a file while the issue body held only the intake. Its baseline and design remain as authored. Current progress, corrections and remaining gates are stated above. Paths labelled discovery still require source confirmation before edits.

---

# M16 — Verify the installed Windows control bridge and record interactive holds — execution plan

## META
- Repo: skytuhua-org/Gen-V1 · Plan revision: 1 (2026-11-21)
- Baseline: main @ e883ac0327c834120d89c3697dec7380a342ba4d
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1023
- Status: plan only — no implementation authorized by this document. Source provenance: issue body reproduced verbatim under REQUIREMENTS so nothing is lost.

## OBJECTIVE
M16 — Verify the installed Windows control bridge and record interactive holds. Success is the issue's own completion criteria met and verified on main.

## REQUIREMENTS
<!-- m-series-scope:m16-installed -->
## Outcome and scope

The existing default-off installed-memory job checks same-job installer, payload, executable and addon identity and one bounded direct addon load. Installed app registration, selected-target identity, consent, bounded capture and independent Stop require separate interactive acceptance. Keep flags and native input disabled.

## Completion criteria

- [x] **T01** Verify the existing Windows job at the exact #812 head. Review the redacted m16-identity-receipt.json with matching source and artifact digests, two owned launches, module-load runtime/exports and owned uninstall. [Verified exact-head installed receipt](https://github.com/skytuhua-org/Gen-V1/issues/1023#issuecomment-7032058832).
- [ ] **T02** Keep the bridge interactive gate separate. Once an authorized clean interactive Windows profile and approved artifact/backend are available, record authorized selected-target and bounded capture/Stop evidence using owned fixtures. Review remains independent.
- [ ] **T03** Review the exact final PR head and required checks before deciding the publication scope. Do not use addon load as production registration evidence.

## Ownership and current state

Existing owner or dependency owner: M16 implementation owner and Windows verifier. 7d1efaaaf46bc18836058161243939aa847b4723 adapts the existing installed job (no new job or second install). The prototype stays default-off. The previous green run belongs to the earlier 6b2c3815 cut.



## References

- [PR #812](https://github.com/skytuhua-org/Gen-V1/pull/812)
- [docs/implementation/v6/M16/requirements.json](https://github.com/skytuhua-org/Gen-V1/blob/5cde22a7d48cc0a5f0f24884f862e64781575ebd/docs/implementation/v6/M16/requirements.json)

Issue body revision `issue-body-r1`. Use append-only checkpoints for evidence and handoffs. Existing ownership, review requirements and release permissions apply.

## REPO_MAP
Verified at baseline unless marked discovery:
- `docs/implementation/v6/M16/` — M16 requirements/receipts
- `scripts/verify-installed-desktop.ts` — installed verification harness

## DESIGN
Finish M16: T01 verified at #812 head already. T02 is the remaining lane — keep the bridge interactive gate separate; once an authorized clean interactive Windows profile and approved artifact/backend exist, record interactive acceptance (registration, selected-target identity, consent, bounded capture, independent Stop). Flags and native input stay disabled.

## EXECUTION_DAG
New plan task IDs are R01.. so they never collide with the issue's own T01/T02/... checklist IDs.

| Task | Goal | Deps | Done when |
|------|------|------|-----------|
| R01 | Identify the authorized interactive fixture/backend or record the limiting gap | NONE | fixture path or gap recorded |
| R02 | Run and record the interactive holds acceptance at an exact cut | R01 | R02 evidence posted |
| R03 | Publish reviewed disposition | R02 | disposition posted |

## VALIDATION
- `pnpm lint`, `pnpm typecheck` and `pnpm test` (or the focused suite named in the issue) green on each PR.
- Issue-specific acceptance reproduced and evidenced per the criteria above; browser/Windows-only checks run on a Windows worker or CI.
- Each PR linked to issue #1023; merge only through the normal gate (required CI + independent review).

## STATE
- Researched: issue scope + verified REPO_MAP entries. Not started: all tasks. Owner: unassigned (this plan's author released the claim).
- Exact next step: claim the issue per AGENTS.md, then execute R01.

## REFERENCES
- Issue #1023: https://github.com/skytuhua-org/Gen-V1/issues/1023
- AGENTS.md claim/checkpoint/handoff rules: https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md
