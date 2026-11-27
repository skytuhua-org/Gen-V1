<!-- gen-v1-audit-r1-r2:question-detail-action-revision -->
# Keep pending question actions consistent through detail retry

## META
Plan revision `audit-coverage-r4` · 2026-11-24 Pacific time · `skytuhua-org/Gen-V1`.
Main inspected at `20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645`. Source evidence only. Reproduction and implementation remain pending.
02:L789. On current main the normal request-detail insertion leaves the request revision unchanged, while rearming a detail increments it. User action submission validates both the displayed artifact and pending request revisions. Existing artifact draft tickets focus on saved drafts, while #1956 focuses on durable outbox recovery.

## OBJECTIVE
Keep displayed actions and pending question state coherent during optional explanations, retries, and failures while preventing submission against a genuinely replaced question.

## REQUIREMENTS
Use the supported product entry point and a local owned fixture. Preserve existing resource ownership, compatibility and user data. Leave neighboring work with its existing issue and PR owners.

## REPO_MAP
- [`packages/core/service.ts` line 1419](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/service.ts#L1419)
- [`packages/core/service.ts` line 1456](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/service.ts#L1456)
- [`packages/core/service.ts` line 1472](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/service.ts#L1472)

## DESIGN
Match revision transitions to the visible question contract and use existing events to refresh affected action bindings. Keep actual supersessions invalid and protect in-flight route/owner identity. Preserve answer validation and prevent duplicate acceptance.

## EXECUTION_DAG
1. **T01 — Establish RED.** Use service and renderer fixtures with a pending question and a displayed action. Exercise normal explanation, failed detail retry, a late detail result, and a genuine question change. Record the exact action target and revision sequence, displayed state, and actual accepted or stale result. Save the pinned result and fixture for the scoped owner.
2. **T02 — Implement a bounded fix.** Depends on T01. Check current issue/PR ownership, then fix the reproduced cause in the scoped component. Preserve normal and recovery paths and hand off the exact patch with its regression.
3. **T03 — Verify and record.** Depends on T02. Verify action submission stays usable after a harmless detail retry, a superseded question remains rejected, time ordering and active selection stay correct, and the user receives actionable feedback where refresh is needed.

## VALIDATION
The implementing agent must independently reproduce the failure before fixing it. Record the baseline SHA, environment, fixture, exact commands, expected result and observed RED. Run the same test on the patch and record GREEN, adjacent checks and any acceptance still pending. If it does not reproduce, record that disposition before editing.

Verify action submission stays usable after a harmless detail retry, a superseded question remains rejected, time ordering and active selection stay correct, and the user receives actionable feedback where refresh is needed.

## STATE
Source-inspected tracking gap. Start with T01 on a refreshed applicable head. No runtime result is claimed.

## REFERENCES
Audit T05 #1946. [Repository instructions](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

