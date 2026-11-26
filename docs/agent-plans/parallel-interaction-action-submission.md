# Show truthful artifact submission, captured choices and retry

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-R1/ACT04, 2026-11-25. Parent: https://github.com/skytuhua-org/Gen-V1/issues/2141; coordination: https://github.com/skytuhua-org/Gen-V1/issues/2212. Verified baseline: main@defe9884530145e9c109b8ed98f80efac8beeb17. Planning branch: docs/frontend-parallel-work-packets. This leaf's implementation/runtime verification: NOT_STARTED/NOT_RUN; existing PR progress is recorded below. Provenance: complete published bluma-action-feedback.md, current full parent journal, linked PR outcomes and baseline source. The parent is historical context; execute this leaf and its exact dependency outputs.

## OBJECTIVE

Give Button/Form a stable, truthful submission flow: immediate pending, one current Request submitted acknowledgment with captured choice labels, or one actionable error plus Retry. Preserve draft and authority.

## REQUIREMENTS

R1-R7/R9 and A1-A7/A9. Keep current Delivery/Save choice/inspect optional fixture optional; add separate required fixture. No gerund inference, Saved/Done/completion receipt or permanent read-only fields. Current action fulfillment may mean approval-required, not external completion. Exact statuses: Submitting request, Request submitted, Submitted choice: <captured label>; Retry; source error or The request failed. Try again.; Pick an option first. Status text appears instantly, acknowledgment dismisses after4s, never delays enabling.

Preserve neutral themes, readable names, command/revision/grant owners, focus, selection, IME/keyCode229 and drafts. Motion never delays input or held controls. Effective tokens are consumed once; raw bases scale once. Reduced removes travel/stagger/shimmer with opacity<=80ms; Off/panels-disabled settle immediately, including live changes. No new dependencies, acquisition, schema, persistence, backend, telemetry, bounce, blur, permanent will-change or per-frame React geometry loop.

## REPO_MAP

Own only registry.tsx Button/Form/imports preserving CRLF, and .widget-action-* / .surface-form submit styling in task-interface.css. Preserve native Form submit and29px compact direct button/full hidden form-submit-label. Read useSecureArtifact():artifactId/threadId/revision/active/editable, Artifact submit/approval flow and mapActionPayload; do not edit host/schema. ART02 owns Tabs, ART03 disclosure; serialize shared imports and final spec hunks, not entire independent tasks.

## DESIGN

Consume ACT01 ActionIndicator, ACT02 ChoiceValidation API and ACT03 useTaskAction(ownerIdentity). Scoped identity is JSON.stringify([threadId,artifactId,revision,actionId]); pass null for inactive or missing secure ownership. If a legitimate existing no-scope catalog caller exists, document it and keep its legacy useTaskAction(undefined) behavior rather than inventing authority. Instance isolation remains component-local; do not key/remount Form.

Valid activation: sync native participation before default validation using onClickCapture for submit buttons and onKeyDownCapture for non-IME implicit Enter; retain existing IME guards. Derive mappedKeys from string values of payloadFromState. Validate current associated choices, capture submitted values/labels/edit versions, clear previous status, dispatch once immediately. Form's onSubmit still owns native Input constraints. Busy disables action and exposes aria-busy; Submitting request is outside aria-busy suppression.

On current run true and current local generation, publish one neutral polite Request submitted and captured associated ChoiceList labels, never raw payload/credentials or current newer values. Keep form inputs editable unless source disables them. Compare-and-clear only keys whose current value===captured submitted value. That accepted store clear preserves captured acknowledgment; a later real registered user edit to a captured choice removes it. Four-second timer, new invocation, owner/revision/action/inactivity/unmount clear acknowledgment/listeners. Snapshots/theme/policy do not replay.

Failure shows one alert with source error and quiet Retry. Retry validates/captures current values, one new invocation, no cached replay. Status13px Inter400,margin-top6px, neutral muted acknowledgment/danger error. Only decorative icon may animate through ACT01. Preserve initiating input focus. If disabling initiating button drops focus to body, restore the same connected button only after re-enable and no intervening pointer/key/focus intent or host navigation; never focus Retry or success automatically. Outgoing icons are decorative only.

## EXECUTION_DAG

Dependencies: [ACT01 #2244](https://github.com/skytuhua-org/Gen-V1/issues/2244), [ACT02 #2245](https://github.com/skytuhua-org/Gen-V1/issues/2245), [ACT03 #2246](https://github.com/skytuhua-org/Gen-V1/issues/2246). One owner per allocated file/hunk; retain adjacent owners.

1. T01 ACK dependency API commits and exact Button/Form/style/spec reservation. Reproduce existing optional catalog and approval-required response. Positive: known source path. Negative: label-driven special-case routing. Done with exact owner/fixture contract.
2. T02 Wire static labels/indicator, current native choice validation and immediate single dispatch. Positive: click/Enter/Space one exact payload; negative: required/IME/disabled/missing action zero. Done with browser counts and stable bounds.
3. T03 Add owner-scoped captured acknowledgment/timer/edit cleanup and unchanged compare-and-clear. Positive: captured labels survive accepted clear; negative: newer draft preserved, real user edit removes summary, lateA cannot affectB. Done with held request/owner tests.
4. T04 Add source-error/quiet Retry and guarded focus recovery. Positive: retry current values once; negative: no check after rejection, no focus theft or multiple announcements. Done with keyboard/screen-reader-name assertions.
5. T05 Run focused gates on frozen source, publish commit/contract and residuals to ACT05, RELEASE. Retain authoritative approval flow and adjacent code; no broad registry reformat.

## VALIDATION

pnpm exec playwright test --config tests/e2e/task-interface.playwright.config.ts task-interface.spec.ts; pnpm exec vitest run tests/task-interface.test.ts tests/task-action-ownership.test.ts tests/feedback-primitives.test.ts --maxWorkers=1; pnpm test:ui-guard. Use real App and existing captured commands/deferred callback. Error interception only action.submit HTTP500 with {error:{code:'ACTION_FAILED',message:'Synthetic request failed. Try again.'}}; fall back other routes, never throw and strand routing. Replace Submitting… name selector with original accessible name plus busy. Test4s cleanup, approved-request truth, captured-vs-new choice, user-edit-vs-clearOnSuccess, native constraints, input-origin focus, A-B-A and foreign owner isolation.

Planned, NOT_RUN: full checkout at frozen SHA; Node>=24.10, pnpm10.30.3, pinned Bun; pnpm install --frozen-lockfile and actual browser channels named by config. Never substitute another browser for msedge. Build widgets where required. Run focused commands plus pnpm lint, pnpm typecheck, pnpm build and pnpm check:docs-links for touched scope. Compare failures at the same baseline; required Windows CI/review gates remain.

Visible acceptance uses paired synthetic1920x1080/30fps/H.264 with no added titles/captions/overlays. External manifest: scenario, baseline/candidate SHAs, browser/Windows build, theme, actual zoom, policy/speed, commands/counts, limits and verdict. Close contexts, inspect/redact and publish immutable resolving media, not profiles/raw traces. Check dark/light,narrow/short,actual100/125/150% app zoom, keyboard and live System/Reduced/Off/OS/panels-disabled. Browser zoom is not physical DPI; fixtures do not prove native packaging/provider success.

## STATE

NOT_STARTED/BLOCKED on ACT01/ACT02/ACT03 outputs. No implementation PR existed for #2141 at read time; refresh before claim. Component styles/tests are isolated from Tabs/Steps and Copy. Next T01; source/template boundaries above are proposed private interfaces, not existing APIs.

Checkpoint each milestone or 20 minutes with key/SHA/tests/blockers/next owner. Stop requires read-back RELEASE OWNER=NONE and own-marker cleanup. Unmet gates remain BLOCKED/HANDOFF_PENDING; review, merge and main acceptance are distinct.

## REFERENCES

- Original complete source: https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-action-feedback.md
- Parent/journal: https://github.com/skytuhua-org/Gen-V1/issues/2141
- Verified baseline/rules: https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17
- Catalog submission semantics: https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/packages/ui-catalog/index.ts
- Current secure scope: https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/secure-artifact-context.tsx
- Copy remains #1604: https://github.com/skytuhua-org/Gen-V1/pull/1693
