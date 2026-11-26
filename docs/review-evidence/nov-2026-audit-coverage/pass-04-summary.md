# T05 reconciliation of the 707 outstanding rows and 92 candidate matches

GitHub main sampled at `20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645`, 2026-11-24 Pacific time. The source hashes of all 16 reports matched the prior frozen ledger. The 799 exact requested locators are covered once in the four disposition tables. Existing issue bodies remain at their prior revisions. Scope was compared against 77 refreshed issue/PR bodies and the prior full public backlog, with additional targeted owner reads and exact-title/marker duplicate checks for each filed issue.

[Audit index #1946](https://github.com/skytuhua-org/Gen-V1/issues/1946).

## Finding-level dispositions

- [pass-04-stability-02.md](pass-04-stability-02.md).
- [pass-04-performance-and-cleanup-03-04.md](pass-04-performance-and-cleanup-03-04.md).
- [pass-04-coverage-frontend-and-docs-06-09.md](pass-04-coverage-frontend-and-docs-06-09.md).
- [pass-04-runtime-and-persistence-11-15.md](pass-04-runtime-and-persistence-11-15.md).
- [pass-04-candidate-checks.md](pass-04-candidate-checks.md).

| Disposition | Rows | Evidence or next owner |
| --- | ---: | --- |
| New issue verified | 23 | Labeled reproduction-first issue and full Markdown copy verified. |
| Private defensive review | 72 | Sensitive locator only. Private review remains due. |
| Existing tracking | 548 | Current accepted scope or route is recorded. Run the named case before implementation. |
| Changed or refuted on current evidence | 10 | Pinned source or a benign live comparison contradicts the historical mechanism. |
| Historical or repeated evidence | 37 | Intentional/staged behavior, repeated support row, report correction or different owner is recorded. |
| Owner decision or fixture gate | 65 | Confirm an intended production contract, supported reachability, or actual impact in the owner’s scope before opening a separate defect. |
| Existing PR scope | 44 | Historical in-diff observation remains in its linked PR or existing PR reconciliation work. Verify the exact current head. |

## Earlier candidate match verification

- Scope gap filed — 4 records.
- Restricted routing — 3 records.
- Refuted or changed — 1 records.
- Candidate limited to discovery — 10 records.
- Matched current owner — 74 records.

- The one-file GitHub comparison claim was disproved by an ordinary live comparison. `per_page=1` returned one commit and 55 changed files. The existing local snapshot repair serves a different operation. [GitHub API documentation](https://docs.github.com/en/rest/commits/commits#compare-two-commits).
- The open verification-panel digest PR covers the read path. Main still performs synchronous digest work in the completion write transaction, so the completion path now has a distinct plan.
- #1357 lists three other panels. Verification’s recurring read is tracked separately.
- The earlier generic runtime candidate did not name official Gemini headless cleanup. That driver now has its own scope.

## New verified issues

- [#2166](https://github.com/skytuhua-org/Gen-V1/issues/2166) — Resume desktop layout persistence after a transient save failure. [Pinned plan](https://github.com/skytuhua-org/Gen-V1/blob/1424ab519028eab03cbb154b1f6b9a557980e09e/docs/agent-plans/nov-2026-audit-desktop-layout-save-recovery.md).
- [#2167](https://github.com/skytuhua-org/Gen-V1/issues/2167) — Bound desktop quit time across multiple renderer close guards. [Pinned plan](https://github.com/skytuhua-org/Gen-V1/blob/1424ab519028eab03cbb154b1f6b9a557980e09e/docs/agent-plans/nov-2026-audit-desktop-window-close-drain.md).
- [#2168](https://github.com/skytuhua-org/Gen-V1/issues/2168) — Drain Gemini headless process resources and owned scratch files. [Pinned plan](https://github.com/skytuhua-org/Gen-V1/blob/1424ab519028eab03cbb154b1f6b9a557980e09e/docs/agent-plans/nov-2026-audit-gemini-headless-ownership-cleanup.md).
- [#2169](https://github.com/skytuhua-org/Gen-V1/issues/2169) — Keep integration host shutdown recoverable after one close fails. [Pinned plan](https://github.com/skytuhua-org/Gen-V1/blob/1424ab519028eab03cbb154b1f6b9a557980e09e/docs/agent-plans/nov-2026-audit-integration-host-teardown-liveness.md).
- [#2170](https://github.com/skytuhua-org/Gen-V1/issues/2170) — Recover plug-in registry closure after a transient host close failure. [Pinned plan](https://github.com/skytuhua-org/Gen-V1/blob/1424ab519028eab03cbb154b1f6b9a557980e09e/docs/agent-plans/nov-2026-audit-plugin-registry-close-recovery.md).
- [#2171](https://github.com/skytuhua-org/Gen-V1/issues/2171) — Reduce full-copy overhead in read-only SQLite inspection. [Pinned plan](https://github.com/skytuhua-org/Gen-V1/blob/1424ab519028eab03cbb154b1f6b9a557980e09e/docs/agent-plans/nov-2026-audit-sqlite-inspection-staging-cost.md).
- [#2172](https://github.com/skytuhua-org/Gen-V1/issues/2172) — Recover a managed repository after an interrupted Git metadata import. [Pinned plan](https://github.com/skytuhua-org/Gen-V1/blob/1424ab519028eab03cbb154b1f6b9a557980e09e/docs/agent-plans/nov-2026-audit-private-git-import-recovery.md).
- [#2173](https://github.com/skytuhua-org/Gen-V1/issues/2173) — Keep pending question actions consistent through detail retry. [Pinned plan](https://github.com/skytuhua-org/Gen-V1/blob/1424ab519028eab03cbb154b1f6b9a557980e09e/docs/agent-plans/nov-2026-audit-question-detail-action-revision.md).
- [#2174](https://github.com/skytuhua-org/Gen-V1/issues/2174) — Keep shell read models usable with older or malformed stored projections. [Pinned plan](https://github.com/skytuhua-org/Gen-V1/blob/c072e3010513d435d5fb9d0ec074cd1b697a3ae7/docs/agent-plans/nov-2026-audit-shell-projection-stale-records.md).
- [#2175](https://github.com/skytuhua-org/Gen-V1/issues/2175) — Use the vendored Impeccable engine from its documented launcher. [Pinned plan](https://github.com/skytuhua-org/Gen-V1/blob/c072e3010513d435d5fb9d0ec074cd1b697a3ae7/docs/agent-plans/nov-2026-audit-impeccable-vendored-launcher.md).
- [#2176](https://github.com/skytuhua-org/Gen-V1/issues/2176) — Keep verification source hashing out of the task completion write transaction. [Pinned plan](https://github.com/skytuhua-org/Gen-V1/blob/87b5d2d491439af2a7ff5986a9368a96494c5f33/docs/agent-plans/nov-2026-audit-completion-digest-transaction.md).
- [#2177](https://github.com/skytuhua-org/Gen-V1/issues/2177) — Pause verification panel polling while its document is hidden. [Pinned plan](https://github.com/skytuhua-org/Gen-V1/blob/87b5d2d491439af2a7ff5986a9368a96494c5f33/docs/agent-plans/nov-2026-audit-verification-panel-hidden-polling.md).

## Open acceptance and evidence boundaries

This pass gives a disposition to the 799 requested ledger rows. Some rows describe repeat sightings of the same mechanism or supporting inventories. No runtime test, fix merge, or native acceptance was performed. The private channel, owner decisions, fixture gates, and current-head acceptance of historical PR-only findings still require the listed authorities or tests. The earlier ledger also records evidence gaps from truncated historical worker output.

## Handoff

An implementing agent starts with the exact named tracker or PR, reads its current owner and plan, reproduces the benign failure on the applicable pinned source, and records RED and GREEN before reporting a fix. Ambiguous reachability and sensitive boundaries retain their recorded gate.

[Earlier audit evidence index](https://github.com/skytuhua-org/Gen-V1/blob/3fbda4c178fa27be9c375f2bbd956fda870cf2cd/docs/agent-plans/nov-2026-audit-follow-up-index.md).

