Follow-on implementation work for #1848 (backend audit swarm findings).

<!-- gen-v1-audit-plan-revision:2026-11-23:1886 -->

## November audit plan revision
**Revision:** `audit-2026-11-23-r1`. **Repository baseline:** `main@a64e9e2d03ce09c843bff0480d81311f2012c812` (GitHub read during triage). **Canonical issue:** #1886.

### Objective and requirements
**Audit remediation and deletion sweep verification.** 02, 04, 12–15. The last published checkpoint releases the earlier implementation claim. Reconcile the sweep and liveness work with current main and #1860.
Keep the issue's existing scope, requirements and assigned implementation work. Refresh related PRs at the beginning of the reproduction.

### Reproduction gate
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

### Execution and validation
- **Sweep — Check behavior on both source lines.** Compare the audit branches with current main. For each proposed deletion check production imports, public exports, lazy entry points, persisted readers, package manifests, docs and open PRs. Keep restored or still-used code until its consumers are migrated.
- **Liveness — Confirm remaining settlement defects.** Use a fake child or provider to verify rejection and never-settling cleanup, late completion after reap and a second run. Keep attempts and unconfirmed native ownership observable. Cross-link #1860 for overlapping runtime PRs.
- **Compatibility — Prove preservation with older records.** Open a copy of a prior store or fixture through the normal reader. Verify historical status and malformed sibling handling without rewriting unrelated bytes.

### State and handoff
New audit checks are planned. This revision records source and issue triage only. The implementing agent records independent RED, the exact accepted fix or no-repro disposition, GREEN, and any installed or native gate on this issue. Follow the issue's existing dependency and review order.

### References
Audit trackers #1848 and #1946. Follow-up coordination #1860 and #1886.

