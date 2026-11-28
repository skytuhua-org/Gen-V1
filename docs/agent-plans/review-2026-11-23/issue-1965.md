[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1965.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`, concurrent-journal reconciliation on 2026-11-24. Source audit baseline `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`; later publication/source references remain attributed to their own pinned revisions. Canonical issue: [#1965](https://github.com/skytuhua-org/Gen-V1/issues/1965). This status supplement supersedes older progress statements only. The entire current canonical plan below, including all accepted requirements and gates, is preserved verbatim.

Two distinct open repairs now cover separate transcript failures. #1995 fixes stale-event sequence handling and ordered insertion. #1996 keeps the acknowledged transcript visible while replacement history is pending, then publishes the replacement atomically; its [release receipt 7121834119](https://github.com/skytuhua-org/Gen-V1/issues/1965#issuecomment-7121834119) records 30 passing reader tests, typecheck and lint, with the new regression failing on the pinned base. Those are producer-reported unit results, not browser acceptance.

The later reader worker has now released its scope. Preserve both implementation deltas. Real browser Find-across-paging, artifact identity, Mark unread versus delayed reads and the remaining accepted reconnect/ordering cases still require evidence or an explicit accepted disposition. The journal's unconfirmed cases do not silently remove original requirements. Review, CI, merge and actual-main acceptance remain pending.

### Refreshed implementation references

- [PR #1995](https://github.com/skytuhua-org/Gen-V1/pull/1995): open; head `69e6d6c6e2944d626941e805698b714cb0b09778`; not merged.
- [PR #1996](https://github.com/skytuhua-org/Gen-V1/pull/1996): open; head `3a21aaae4fe9b9176528199d7332dd378d283d1a`; not merged.

Latest journal read: [7121834119](https://github.com/skytuhua-org/Gen-V1/issues/1965#issuecomment-7121834119). Earlier claims, failed attempts, results and releases remain in the append-only journal.

---

[Versioned Markdown plan](https://github.com/skytuhua-org/Gen-V1/blob/dad473f59b4c46dad12cf0357e448e090a403a2b/docs/agent-plans/nov-2026-audit-transcript-reconcile.md) · [Plan publication PR](https://github.com/skytuhua-org/Gen-V1/pull/1952)

<!-- gen-v1-audit-r1-r2:transcript-reconcile -->
# Reconcile partial live updates with complete transcript history and Find

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
A partial live update can suppress a full snapshot or leave a permanent paging gap. Keep the visible transcript and Find results consistent across refresh and reconnect.

## REQUIREMENTS
- Report scope: 07 §§2.1–2.4,2.6,2.8–2.12,10.7; 02/03 thread search; 15 SSE replay.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- `apps/web` conversation/transcript owner, snapshot application and Find. #1615 retains interrupted Resume replay, #1114 owns server cursor validation, and #1703 owns sidebar search keyboard behavior.

## DESIGN
Order full and partial revisions correctly, dedupe artifact mounts, keep previous acknowledged state visible until replacement, and use bounded paging/highlight behavior consistently.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Send a partial workspace event, delay full snapshot, change the history window while loading an older page, and search across the loaded and unloaded ranges in a built-browser fixture. Check explicit Mark unread against delayed reads. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Confirm gap-free ordered messages, stale events ignored, stable artifact identity and focus, and visible Find behavior across page boundaries and reconnect. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Confirm gap-free ordered messages, stale events ignored, stable artifact identity and focus, and visible Find behavior across page boundaries and reconnect.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).
