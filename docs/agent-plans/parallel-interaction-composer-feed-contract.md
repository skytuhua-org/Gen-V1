# Resolve per-owner feed arrival identity for the remaining M6 surfaces

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-R1/CMP06, 2026-11-25. Parent: https://github.com/skytuhua-org/Gen-V1/issues/1188; coordination: https://github.com/skytuhua-org/Gen-V1/issues/2212. Verified baseline: main@defe9884530145e9c109b8ed98f80efac8beeb17. Planning branch: docs/frontend-parallel-work-packets. This leaf's implementation/runtime verification: NOT_STARTED/NOT_RUN; existing PR progress is recorded below. Provenance: complete published bluma-composer-supplement.md, current full parent journal, linked PR outcomes and baseline source. The parent is historical context; execute this leaf and its exact dependency outputs.

## OBJECTIVE

Identify which existing M6 surfaces actually own stable feed items and authoritative fresh-versus-restored updates. WorkActivity has Message IDs; TaskHistory is a children/scroll wrapper and UpdateControl is a desktop updater. Those differences must become an exact execution boundary.

## REQUIREMENTS

M6 newly arriving items180ms only while mounted; restore/snapshot/first render quiet; no fabricated agent steps/status/durations or generic feed schema. Preserve D1/D9 and M11 terminal quietness. No motion from message count, inferred percent, arbitrary mount, theme or same-content snapshots. Retain per-thread/account/revision/activity ownership and source-workbench bounded output.

Preserve neutral themes, readable names, command/revision/grant owners, focus, selection, IME/keyCode229 and drafts. Motion never delays input or held controls. Effective tokens are consumed once; raw bases scale once. Reduced removes travel/stagger/shimmer with opacity<=80ms; Off/panels-disabled settle immediately, including live changes. No new dependencies, acquisition, schema, persistence, backend, telemetry, bounce, blur, permanent will-change or per-frame React geometry loop.

## REPO_MAP

Read WorkActivity.tsx, WorkbenchActivity.tsx, activity-output.ts, TaskHistory.tsx, UpdateControl.tsx, SourceWorkbench.tsx and App.tsx message arrival writers/readers; use rg for all actual callers. WorkActivity takes updates:Message[]; each Message has id/threadId/content. WorkbenchActivity switches at>60 updates or>300 lines and uses source revision/owner with windowed output. TaskHistory takes{children:ReactNode,label:string}; UpdateControl reads desktop.state.update and bridge.update('restart'|'check'). None is a verified step-progress API.

## DESIGN

Output FeedArrivalContract with baselineSha; surfaces[{component,callSites,itemId,logicalOwner,activitySource,arrivalCause,restoreCause,visibilitySource,nativePath,tests,decision}]; workActivity{propContract,allowedCallerHunks,staticFallback,ack}|null; blockedRows[{surface,missingContract,owner,unblockEvidence}]. Prop contract for the bounded candidate is proposed optional arrival?:{ownerKey:string;active:boolean;freshIds:ReadonlySet<string>}; undefined means static. It is presentation metadata only, not a new runtime field. Every supplied freshId must come from an already authoritative source event; exact caller proof is mandatory.

Trace both browser events and native snapshot invalidation. Verify old-history prepend, owner switch, restored mounted/hidden pane and snapshot replacement cannot be labelled fresh. A local ID-set difference may be evidence only when its owner/source contract proves no restoration/history ambiguity. Existing WorkActivity Message IDs permit stable keys but do not alone prove a live arrival.

Decide separately for ordinary WorkActivity, retained/windowed WorkbenchActivity, TaskHistory child owners and UpdateControl. Do not add fake items to wrapper/updater merely to fulfill the original name list. Missing TaskHistory/UpdateControl item contracts remain M6 BLOCKED until an explicit accepted plan correction or real existing owner/API is documented. CMP07 consumes only the verified WorkActivity subset; it does not waive other surfaces.

## EXECUTION_DAG

Dependencies: none. One owner per allocated file/hunk; retain adjacent owners.

1. T01 Read exact components/callers and latest linked owner/PR outcomes. Produce API/item/owner matrix. Positive: actual Message IDs and real updater state. Negative: no guessed generic feed or step schema. Done with exact current paths.
2. T02 Trace fresh/restore/activity source across browser/native, hidden pane, history load and owner switches. Positive: verifiable causal distinction. Negative: mounted new IDs alone insufficient. Done with authoritative metadata or blocked evidence per path.
3. T03 Freeze optional WorkActivity prop/caller contract and static fallback for only proven paths. Reserve finite App/hook/CSS/test hunks with1203/transcript owners. Positive: no runtime migration. Negative: source authority not established means null contract. Done with ACK or exact missing recipient.
4. T04 Publish every M6 surface's disposition and checks, exact contract to CMP07 and blocked rows to CMP08; read back and RELEASE. A discovery can finish while parent M6 remains unaccepted.

## VALIDATION

Read-only searches: rg -n 'WorkActivity|WorkbenchActivity|<TaskHistory|<UpdateControl|liveMessages|data-arrival' apps/web/src; rg -n 'onWorkspaceChanged|message|publish' apps/web/src/api.ts tests/e2e/task-interface-fixture.ts. Use complete source inspection, not title matching. Required future fixtures: initial restored list; one real new Message; repeated content/ID; earlier history; same-owner reorder; A-B-A; hidden->active; source-revision change;>60/>300 switch and desktop snapshot path. No application tests are claimed by discovery. If a path has no proven fresh cause, output static/BLOCKED explicitly.

Product setup/runtime checks are NOT_RUN; this discovery validates source/decision evidence only.

Discovery completion does not accept the blocked product requirement. Preserve its exact unfulfilled gate and responsible recipient.

## STATE

READY discovery, NOT_STARTED. Ordinary Message identity is verified; live-arrival authority and TaskHistory/UpdateControl item contracts remain unproven. CMP07 is blocked on this exact output, not on arbitrary prior motion work. Next T01.

Checkpoint each milestone or 20 minutes with key/SHA/tests/blockers/next owner. Stop requires read-back RELEASE OWNER=NONE and own-marker cleanup. Unmet gates remain BLOCKED/HANDOFF_PENDING; review, merge and main acceptance are distinct.

## REFERENCES

- Original complete source: https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-composer-supplement.md
- Parent/journal: https://github.com/skytuhua-org/Gen-V1/issues/1188
- Verified baseline/rules: https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17
- WorkActivity API: https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/WorkActivity.tsx
- Windowed owner: https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/WorkbenchActivity.tsx
- Snapshot metadata boundary: https://github.com/skytuhua-org/Gen-V1/issues/2212
