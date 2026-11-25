# Resolve the saved-draft deletion and undo contract without inventing persistence

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-R1/CMP05, 2026-11-25. Parent: https://github.com/skytuhua-org/Gen-V1/issues/1188; coordination: https://github.com/skytuhua-org/Gen-V1/issues/2212. Verified baseline: main@defe9884530145e9c109b8ed98f80efac8beeb17. Planning branch: docs/frontend-parallel-work-packets. This leaf's implementation/runtime verification: NOT_STARTED/NOT_RUN; existing PR progress is recorded below. Provenance: complete published bluma-composer-supplement.md, current full parent journal, linked PR outcomes and baseline source. The parent is historical context; execute this leaf and its exact dependency outputs.

## OBJECTIVE

Give M5 a concrete, truthful disposition. Current code supports deletion and text restoration, but neither a verified deletion-undo API nor an agreed visible deletion/undo sequence exists. Do not implement decorative Undo that cannot restore the actual record.

## REQUIREMENTS

Preserve M5 delete140ms/ui-item-out and real undo insert180ms/ui-item-in, plus R04/R05/R07,A06/A07. Retain confirmation, errors/retry, exact owner/generation CAS, quotas/expiry, current composer/caret and text-only restore. Restoring saved text is not undoing deletion; authority-bearing resources/skills/excerpts/source identities must not be reauthorized or resurrected. Missing contracts remain explicit product blockers, not silently removed rows.

Preserve neutral themes, readable names, command/revision/grant owners, focus, selection, IME/keyCode229 and drafts. Motion never delays input or held controls. Effective tokens are consumed once; raw bases scale once. Reduced removes travel/stagger/shimmer with opacity<=80ms; Off/panels-disabled settle immediately, including live changes. No new dependencies, acquisition, schema, persistence, backend, telemetry, bounce, blur, permanent will-change or per-frame React geometry loop.

## REPO_MAP

Read full apps/web/src/SavedDrafts.tsx, saved-drafts.ts and saved-drafts.css; tests/saved-drafts.test.ts and tests/e2e/saved-drafts.spec.ts. Existing deleteSavedDraft(owner:SavedDraftOwner,id:string,generation:string|undefined) is asynchronous; planDraftRestore(owner,id) returns DraftRestorePlan; restoreSavedDraftText(owner,plan,mode:'replace'|'insert',caret) restores text. SavedDraftOwner keys profileId/accountId/threadId/projectId/workingCopyId. No product edits are authorized by this discovery.

## DESIGN

Output SavedDraftMotionDecision with baselineSha; exact APIs/implementations/tests; delete{request,acknowledgment,visibleSurface,focusOwner,failureRetention}; undo{available,approvedApi,authority,concurrency,expiryQuota,cancelRetry}|null; scopes[{path,symbol,owner,ack}]; acceptance{delete140,undo180,textRestore,cas,ime,policy}; nextLeafContract|null and blockers[{requirement,missingEvidence,recipient}]. Values are evidence, not invented signatures.

Current SavedDrafts closes its popover before showing the delete confirmation; deletion then invokes the existing API and closes the dialog after accepted completion. A140ms list-row exit cannot be assumed visible while that list is closed. Determine a minimal approved presentation sequence using the current flow before writing motion. Do not reopen a popup automatically or delay deletion merely to make an effect visible without an accepted decision.

Investigate whether a later canonical implementation supplies real reversible deletion. If yes, record exact immutable writer/reader/persistence/receipt and stale-owner behavior. If absent, preserve undo BLOCKED and identify required owner/contract without adding local storage or recreating records. A new persistence contract is outside this UI implementation authorization. A bounded follow-up leaf may be published only after exact inputs/outputs, file scope, tests and owner decision exist; parent M5 cannot be accepted on this discovery alone.

## EXECUTION_DAG

Dependencies: none. One owner per allocated file/hunk; retain adjacent owners.

1. T01 Refresh saved-draft issue/PR ownership using distinctive outcome searches and read exact current source/tests. Positive: identify real deletion acknowledgment and CAS checks. Negative: restoreSavedDraftText is never labelled Undo. Done with SHA/API map.
2. T02 Trace actual dialog/popover/focus flow on source and existing fixtures. Record whether delete exit can be observed without altering semantic timing. Positive: retained confirmation/error/focus. Negative: invisible motion is not acceptance. Done with explicit presentation decision need.
3. T03 Locate a real deletion-undo contract or prove absence within saved-drafts/journal APIs and linked current work. Record concurrency, expiry/quota, owner and authority requirements. Positive: exact approved contract if present. Negative: no local resurrection or guessed backend. Done with available or blocked disposition.
4. T04 Publish complete decision/row matrix and exact follow-up contract when sufficiently specified; otherwise name missing gate/recipient. Read back and RELEASE to CMP08/coordinator. Discovery done never marks M5 delete/undo accepted.

## VALIDATION

Read-only commands: rg -n 'deleteSavedDraft|restoreSavedDraftText|undo|generation|journalCompareAndSwap' apps/web/src/saved-drafts.ts apps/web/src/SavedDrafts.tsx tests/saved-drafts.test.ts tests/e2e/saved-drafts.spec.ts. Existing runtime commands, if separately executing the source repro: pnpm exec vitest run tests/saved-drafts.test.ts --maxWorkers=1; pnpm test:browser --suite saved-drafts. Label NOT_RUN unless actually executed. Future acceptance must include cancellation/rejection, stale generation/two windows, owner change, IME, current draft/caret, rich references remaining text-only,140/180 timings and Reduced/Off cleanup. No invented success permits closure.

Product setup/runtime checks are NOT_RUN; this discovery validates source/decision evidence only.

Discovery completion does not accept the blocked product requirement. Preserve its exact unfulfilled gate and responsible recipient.

## STATE

READY discovery; M5 implementation remains BLOCKED at verified baseline. No deletion-undo API was found in the complete source review. Exact delete animation presentation is also unresolved because confirmation closes the list. Next T01; hand a precise missing-contract disposition to coordinator, with no new product persistence scope.

Checkpoint each milestone or 20 minutes with key/SHA/tests/blockers/next owner. Stop requires read-back RELEASE OWNER=NONE and own-marker cleanup. Unmet gates remain BLOCKED/HANDOFF_PENDING; review, merge and main acceptance are distinct.

## REFERENCES

- Original complete source: https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-composer-supplement.md
- Parent/journal: https://github.com/skytuhua-org/Gen-V1/issues/1188
- Verified baseline/rules: https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17
- Current persistence behavior: https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/saved-drafts.ts
- Current UI: https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/SavedDrafts.tsx
