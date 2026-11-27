# Guard local action results by presentation owner and invocation

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-R1/ACT03, 2026-11-25. Parent: https://github.com/skytuhua-org/Gen-V1/issues/2141; coordination: https://github.com/skytuhua-org/Gen-V1/issues/2212. Verified baseline: main@defe9884530145e9c109b8ed98f80efac8beeb17. Planning branch: docs/frontend-parallel-work-packets. This leaf's implementation/runtime verification: NOT_STARTED/NOT_RUN; existing PR progress is recorded below. Provenance: complete published bluma-action-feedback.md, current full parent journal, linked PR outcomes and baseline source. The parent is historical context; execute this leaf and its exact dependency outputs.

## OBJECTIVE

Prevent a late request from an old artifact presentation from publishing errors/success or clearing a new owner's busy state. Retain existing dispatch and default hook callers.

## REQUIREMENTS

Own R4/R5/R7 and A2/A3/A4/A6 invocation semantics. Owner is instance/thread/artifact/revision/action plus monotonic activity generation. Owner changes/inactivity/unmount invalidate local presentation; they never cancel host work. New owner can dispatch immediately. A same-owner pending request still suppresses duplicates even if captured choice edits. No keyed Form, callback-identity owner or replacement dispatch API.

Preserve neutral themes, readable names, command/revision/grant owners, focus, selection, IME/keyCode229 and drafts. Motion never delays input or held controls. Effective tokens are consumed once; raw bases scale once. Reduced removes travel/stagger/shimmer with opacity<=80ms; Off/panels-disabled settle immediately, including live changes. No new dependencies, acquisition, schema, persistence, backend, telemetry, bounce, blur, permanent will-change or per-frame React geometry loop.

## REPO_MAP

Only useTaskAction/import hunk of task-context.ts under the finite TASK_CONTEXT_ACTION queue. Existing ArtifactActions accepts(actionId,payload)=>Promise<void>; mapActionPayload/statePath remain unchanged. Existing useTaskAction returns{run,busy,error}, boolean run. New proposed tests/task-action-ownership.test.ts uses the same esbuild+real Chromium fixture pattern as feedback-primitives.test.ts, exercising actual React hook/ArtifactActions provider. Add only this test path to manifest.source, never runtime.

## DESIGN

Preserve return shape and run(actionId:string,payload:unknown):Promise<boolean>. Proposed signature useTaskAction(ownerIdentity?:string|null). Undefined preserves legacy no-argument behavior; stable string enables ownership guards; null is inactive and run returns false without dispatch. Scoped callers encode JSON.stringify([threadId,artifactId,revision,actionId]); component instance is the hook lifetime. Do not include state revision/field values/action callback identity.

On committed identity/activity change increment generation, invalidate current request token and reset only local pending/busy/error before new interaction. A-to-B-to-A is a new generation. Each run captures generation and unique request token; only both current may set error, return true or clear pending/busy in finally. Stale success and failure return false. Unmount invalidates; action promise continues unchanged. Return false on same-owner duplicate/null before setting UI. Preserve fallback error The request failed. Try again. and source Error.message. No timers, network/schema changes or automatic retry.

Choice edit versions belong to ACT02/ACT04; they clear acknowledgment separately and cannot reset same-owner duplicate guard. ACT04 repeats its own presentation generation check before acknowledging/compare-and-clear because a render can occur after promise resolution. Rollback removes optional mode while retaining original default semantics and any independently integrated validation exports.

## EXECUTION_DAG

Dependencies: none. Shared-hunk queue TASK_CONTEXT_ACTION serializes integration of ACT02 validation exports/imports and ACT03 useTaskAction/imports in task-context.ts. Both may draft and test independently; reserve exact hunks and merge one acknowledged commit at a time.

1. T01 Reserve only hook/import hunks in the finite TASK_CONTEXT_ACTION queue; draft against current main independently of ACT02. Read all useTaskAction callers with rg and keep default behavior. Positive: existing return shape. Negative: callback/store revisions are not ownership. Done with exact diff boundary.
2. T02 Add real hook fixture with deferred promises and request counts. HoldA, switch owner, startB; keep A reference. Verify current base failure, not missing-export only. Done with meaningful red case.
3. T03 Implement optional mode/generation/request checks and unmount cleanup. Positive: B dispatches whileAhost pending. Negative: resolve/rejectA cannot clear Bbusy/error/guard or returntrue; A-B-A/inactive-reactivate/unmount similarly guarded. Done with all adversarial orderings.
4. T04 Run focused tests plus existing task-interface checks; verify undefined callers unchanged, null zero calls and same-owner duplicate zero extra. Add manifest source entry atomically. Done at passing recorded commit.
5. T05 Publish frozen hook signature/behavior and test evidence to ACT04, then RELEASE. No claim of full form/native/provider acceptance.

## VALIDATION

pnpm exec vitest run tests/task-action-ownership.test.ts tests/task-interface.test.ts --maxWorkers=1; pnpm typecheck. Table: same-owner pending=>one call; current success=>true; current Error=>false+one message; non-Error=>fallback; null=>false/zero; owner changed=>old false/no UI; A-B-A=>firstA stale; old finally whileBpending=>Bremains busy; callback identity change withoutowner change=>same guard; edit whilepending=>same guard; unmount=>no local update. Use real hook/provider, no mirrored state-machine mock. Record host promise still resolves/rejects normally.

Planned, NOT_RUN: full checkout at frozen SHA; Node>=24.10, pnpm10.30.3, pinned Bun; pnpm install --frozen-lockfile and actual browser channels named by config. Never substitute another browser for msedge. Build widgets where required. Run focused commands plus pnpm lint, pnpm typecheck, pnpm build and pnpm check:docs-links for touched scope. Compare failures at the same baseline; required Windows CI/review gates remain.

Visible acceptance uses paired synthetic1920x1080/30fps/H.264 with no added titles/captions/overlays. External manifest: scenario, baseline/candidate SHAs, browser/Windows build, theme, actual zoom, policy/speed, commands/counts, limits and verdict. Close contexts, inspect/redact and publish immutable resolving media, not profiles/raw traces. Check dark/light,narrow/short,actual100/125/150% app zoom, keyboard and live System/Reduced/Off/OS/panels-disabled. Browser zoom is not physical DPI; fixtures do not prove native packaging/provider success.

## STATE

NOT_STARTED/READY with exact hunk acknowledgment; only integration into the shared module queues behind the currently reserved commit. ACT01 and ACT02 proceed independently. Existing W3 lifecycle code and host action authority are untouched. Next T01; deliver tests/source, then ACT04.

Checkpoint each milestone or 20 minutes with key/SHA/tests/blockers/next owner. Stop requires read-back RELEASE OWNER=NONE and own-marker cleanup. Unmet gates remain BLOCKED/HANDOFF_PENDING; review, merge and main acceptance are distinct.

## REFERENCES

- Original complete source: https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-action-feedback.md
- Parent/journal: https://github.com/skytuhua-org/Gen-V1/issues/2141
- Verified baseline/rules: https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17
- Existing host ownership boundary: https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/task-context.ts
- Retained W3 status: https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7122916244
