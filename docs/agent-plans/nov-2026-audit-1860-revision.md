Follow-up to #1848 and the attached November backend audit reports. Revalidate findings against current main and fix confirmed defects in focused branches. The audit summary names a different checkout, and the PR audit includes unpublished changes, so each finding needs fresh evidence before any source edit.

- R01 — Desktop connection and window lifecycle behavior.
- R02 — Workspace terminal startup rollback and comparison correctness.
- R03 — Runtime and agent-work lifecycle settlement.
- R04 — Hermes source completeness, tooling portability, and remaining audit inventory.

Acceptance for each repair: reproduce on a pinned baseline, show the regression passing after the change, run relevant repository checks, and record the exact branch, ownership, and evidence. Track already covered findings and separate owner decisions and open-PR issues. Keep sensitive details in the repository's private security reporting channel.

<!-- gen-v1-audit-plan-revision:2026-11-23:1860 -->

## November audit plan revision
**Revision:** `audit-2026-11-23-r1`. **Repository baseline:** `main@a64e9e2d03ce09c843bff0480d81311f2012c812` (GitHub read during triage). **Canonical issue:** #1860.

### Objective and requirements
**Round-one backend remediation and matching round-two follow-ups.** 01–04, 11–15. Existing work R01–R18 is documented in the issue journal. Use the per-PR matrix and the later acceptance checkpoints rather than reassigning work from report headings.
At this review, #1867, #1870, #1873, #1885, #1891 and #1903 were merged. #1861, #1862, #1863, #1866, #1872, #1901 and #1920 were open. Treat this as a dated PR census and refresh at implementation.

### Reproduction gate
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

### Execution and validation
- **R01/R13 — Desktop same-document navigation, session renewal, sign-in and backend restart.** Read #1863 and #1885 at their current heads. Recreate a same-document navigation followed by renewal and close, a local fixture device sign-in, and one backend replacement with an existing window. Compare renderer, bridge and backend readiness. Retain native or installed verification as a separate gate.
- **R02/R11 — Terminal startup rollback and PR comparison correctness.** Read #1081 and #1867/#1873. Exercise child cleanup after a benign startup failure and inspect a mock multi-file comparison without trusting single-file fixtures. Require a durable ended state and complete file inventory or an explicit truncation state.
- **R03/R09 — Pi, agent-work and Hermes lifecycle.** Read #1862, #1866 and #1870. Exercise synthetic checkpoint timeout, teardown rejection and worker exit. Require deterministic settlement, late-event isolation, and continued ownership when native teardown is unconfirmed.
- **R04 — Hermes vendored source completeness.** Read #1861. Compare pinned upstream source and manifests. Audit the wider import callers in a disposable session database and separate default-disabled code from enabled behavior. Record import, transaction rollback, and recovery coverage if remaining gaps are confirmed.
- **R06–R08/R10 — Docs, event fixture, contracts, and widget admission.** Review #1865, #1868, #1869 and #1872. Recheck current source and the linked regression assertions before extending a change. Preserve compatibility for old records and distinguish the displayed widget contract from its release policy.
- **R12/R15/R17/R18 — Memory capacity, plug-in verification and browser fixture.** Read #1874, #1901, #1903 and #1920. Compare the retained changes with redacted fixtures covering timeout, stale completion, package replacement and baseline host lifecycle. Route possible security issues through SECURITY.md.
- **R03/R09 residual — Check post-remediation settlement.** Once #1862/#1866/#1870 scope is confirmed, Start from the latest existing patches. Use fake runtimes to cover manual compaction followed by completion, model-only exit, result without queue count, and rejection of one cleanup step. Native tree confirmation requires an app-owned process fixture. Keep the existing PRs as the source of truth for the first repair; scope only remaining regressions. Cover stale callbacks after new ownership, unconfirmed native termination, repeated stop, normal completion and next-run progress. Separate synthetic from native platform evidence.
- **R12/R15 residual — Confirm capacity recovery across late work and timer changes.** With fake time and fixtures exercise a provider promise that stays pending, one late success, a close during prediction, and a backward wall-clock step. Observe next foreground command and capacity counts. Compare closed #996 before repeating prediction deadline work. Assert bounded shutdown, progress on unrelated work, no stale writes after reap, correct behavior after clock shift and unchanged success for normal background work.

### State and handoff
New audit checks are planned. This revision records source and issue triage only. The implementing agent records independent RED, the exact accepted fix or no-repro disposition, GREEN, and any installed or native gate on this issue. Follow the issue's existing dependency and review order.

### References
Audit trackers #1848 and #1946. Follow-up coordination #1860 and #1886.

