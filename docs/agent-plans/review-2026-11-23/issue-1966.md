[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1966.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`, concurrent-journal reconciliation on 2026-11-24. Source audit baseline `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`; later publication/source references remain attributed to their own pinned revisions. Canonical issue: [#1966](https://github.com/skytuhua-org/Gen-V1/issues/1966). This status supplement supersedes older progress statements only. The entire current canonical plan below, including all accepted requirements and gates, is preserved verbatim.

The two earlier claims have produced different repairs. #1998 bounds host resize ratios by measured pane geometry and carries 15 producer-reported passing layout tests; `devin-cloud-582f6a` released that scope in [7121885300](https://github.com/skytuhua-org/Gen-V1/issues/1966#issuecomment-7121885300). #2046 preserves concurrent window changes during failed native recovery. `devin-linux-00d798` explicitly released the distinct native recovery scope at head `dcd07ef5549d19585fe852c4784d1ec0e76347a6` in [7122406050](https://github.com/skytuhua-org/Gen-V1/issues/1966#issuecomment-7122406050), also acknowledging the earlier claim. Both implementations are now released to review.

#2046's journal reports 17 focused passes and 55 passes/12 skips in its wider subset at the earlier `261233b4` implementation. Its live PR head has advanced to the head below; exact-new-head CI/review remains pending. These fixes are complementary, not title duplicates. The original claim order still makes 582f6a earlier, while both explicit releases and their separate repair scopes are preserved.

Two-window live Electron convergence and native recovery remain unverified. The duplicate-profile criterion is unresolved: same-command retry dedupe exists, while a new command id can intentionally create another same-name profile under the existing receipt test. The owner must reconcile that accepted contract with the plan's retry requirement before declaring it met. No requirement or active claim is removed by this audit.

### Refreshed implementation references

- [PR #1998](https://github.com/skytuhua-org/Gen-V1/pull/1998): open; head `c849be045e1dd836b6531a4755f71b73da740cf8`; not merged.
- [PR #2046](https://github.com/skytuhua-org/Gen-V1/pull/2046): open; head `dcd07ef5549d19585fe852c4784d1ec0e76347a6`; not merged.

Latest journal read: [7122406050](https://github.com/skytuhua-org/Gen-V1/issues/1966#issuecomment-7122406050). Earlier claims, failed attempts, results and releases remain in the append-only journal.

---

[Versioned Markdown plan](https://github.com/skytuhua-org/Gen-V1/blob/dad473f59b4c46dad12cf0357e448e090a403a2b/docs/agent-plans/nov-2026-audit-canvas-recovery.md) · [Plan publication PR](https://github.com/skytuhua-org/Gen-V1/pull/1952)

<!-- gen-v1-audit-r1-r2:canvas-recovery -->
# Preserve workspace layout and panel reachability across recovery and drag

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
A failed native recovery can apply an older layout over concurrent changes. Dragging, resizing or reopening panes can leave them out of reach. Keep layout generations and focus consistent.

## REQUIREMENTS
- Report scope: 07 §§2.5,4.1–4.12,11.3; 09 shared shell paths.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- `apps/web` split, canvas and saved-layout owners and their desktop bridge. #1741 owns tab semantics, #1833 owns truthful divider accessibility and #1720 owns its specific occlusion symptom.

## DESIGN
Keep generation identity on saves and recovery, bound ratios by the actual pane geometry, validate persisted coordinates, and preserve current drop/cancel identity and keyboard behavior.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Use two fixture windows and a delayed failing layout recovery, newer move or preference write, narrow viewport, and a canceled then repeated drag. Compare stored layout to rendered geometry and keyboard access. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Verify both windows converge, newer moves survive stale recovery, panels remain reachable after layout changes, and failed saves and retries do not create duplicate profiles. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Verify both windows converge, newer moves survive stale recovery, panels remain reachable after layout changes, and failed saves and retries do not create duplicate profiles.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).
