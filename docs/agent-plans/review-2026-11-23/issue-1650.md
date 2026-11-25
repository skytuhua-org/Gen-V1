[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1650.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1650](https://github.com/skytuhua-org/Gen-V1/issues/1650). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Saved-drafts control repair exists in [#1678](https://github.com/skytuhua-org/Gen-V1/pull/1678), unmerged. The issue's implementation-not-started state is obsolete; completion awaits landing and accepted disabled/tooltip behavior.

### Reviewed implementation references

- [PR #1678](https://github.com/skytuhua-org/Gen-V1/pull/1678): open; head `b25fe792a7fbfec3059f3f84084b70422e598b98`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7088480190](https://github.com/skytuhua-org/Gen-V1/issues/1650#issuecomment-7088480190). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

Plan file: https://github.com/skytuhua-org/Gen-V1/blob/8545be56c246e52845fa10d5cd1dcdb9b66e1d7b/docs/agent-plans/1650-saved-drafts-dead-control.md

# Plan: Composer "Saved drafts" is permanently disabled with contradictory tooltips

## META
- Feature: Saved drafts entry point in the composer
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-21 (design fully specified — implementer makes no design choices)
- Baseline: main @ 8cc970fd667fbefebb2a77df2a829f880a132e54
- Issue: this issue
- Status: planning complete, implementation NOT started
- Source: manual UX audit of built app served by `scripts/review-host.ts` on :4317

## OBJECTIVE
In a thread with a project connected ("UI review recordings") and text typed in the composer, the "Saved drafts" button is always `disabled`. Its tooltip contradicts itself between states: one variant says "Start a conversation to save named drafts." and another says "Saved drafts are waiting for the owning project context." — yet a project is already selected. A real user cannot discover why the control is dead or what to do. Success: the button works whenever its prerequisites are met, and when it cannot work the tooltip states the real blocking reason.

## REQUIREMENTS
- In scope: enable `Saved drafts` whenever a draft-owner context exists (thread OR project); when no owner exists, keep it disabled with one accurate tooltip: "Select a project or open a conversation to save named drafts."
- Remove the contradictory second tooltip string; exactly one tooltip per disabled state.
- Out of scope: the SavedDrafts popover internals, keyboard shortcut changes.
- Compact density: no layout shift; button stays in its current slot.

## REPO_MAP (verified)
- `apps/web/src/App.tsx` (~line 261): `savedDraftOwner` = `{profileId: window.location.origin, accountId: thread.accountId ?? null, threadId: thread.id, projectId: thread.projectId ?? null, workingCopyId: thread.projectId ? draftProject.context?.workingCopy?.id ?? null : null}` — defined only when `thread` exists AND (`!thread.projectId` OR `draftProject` loaded without error and `context.project.id === thread.projectId` AND `context.threadId === thread.id` AND `context.workingCopy?.id ?? null === thread.workspaceId ?? null`).
- `apps/web/src/App.tsx` (~line 446): renders `<SavedDrafts>` only when `savedDraftOwner` is truthy; otherwise a permanently `disabled` fallback button with the "waiting for the owning project context" / "Start a conversation…" tooltips. Bug: while `draftProject` is loading, errors, or mismatches the thread, the control sits dead with a tooltip that does not name the cause or offer recovery.
- `apps/web/src/SavedDrafts.tsx`, `apps/web/src/saved-drafts.ts`: `savedDraftOwnerSchema` = `{profileId, accountId|null, threadId, projectId|null, workingCopyId|null}` (all required keys); `savedDraftOwnerKey` serializes it. For a thread with no `projectId` the owner already exists (`projectId: null, workingCopyId: null`) and the button is enabled today — no change needed on that path.
- `apps/web/src/saved-drafts.css`: styles for the popover; no changes expected.
- Discovery: confirm whether the backend/draft library requires a projectId-scoped owner or accepts a threadId-only owner; pick the cheapest correct owner derivation.

## DESIGN SPEC
Three states replace the single dead fallback (all keep the `quiet` style, same position in the composer leading slot, same 13px label):
- No thread → fallback stays `disabled`, tooltip: "Start a conversation to save named drafts." (unchanged).
- Thread + `draftProject` loading (`draftProject.loading`) → fallback `disabled`, tooltip: "Loading saved drafts…". If the codebase already renders a spinner affordance for pending composer controls, reuse it; otherwise text only.
- Thread + `draftProject.error` or context mismatch after load → render a `quiet` button labeled "Saved drafts" (not disabled), tooltip: "Saved drafts are unavailable — click to retry."; `onClick` calls the existing `draftProject` retry/refetch (discovery: find the refresh function next to the `draftProject` hook).
- Owner resolved → `<SavedDrafts>` as today; its own `disabled` prop covers `busy || !ready || retry || predictionBlocked`. Remove the "waiting for the owning project context" string entirely.
- No layout shift: max two visual variants of the slot (button or quiet button); height unchanged.

## EXECUTION_DAG
- T01 (owner: this task's implementer): In `App.tsx`, implement the three states from DESIGN SPEC keyed off `thread`, `draftProject.loading`, `draftProject.error`/context-mismatch; delete the "waiting for the owning project context" string (rg to confirm zero occurrences). Tests: vitest for the state-selection helper (extract a pure function `savedDraftSlotState(thread, draftProject)`); Playwright at :4317 for loading → enabled transition in a fixture thread. Done when all pass.
- T02 (same owner): Retry path — wire the error-state button to the existing `draftProject` refetch; Playwright: forced error → tooltip shows retry copy → click → button becomes enabled. Done when verified at :4317.

## VALIDATION
- `pnpm build` then serve review host on :4317; fixture thread: loading → "Loading saved drafts…" tooltip → enabled button; error injection → retry tooltip → click → enabled; no thread → "Start a conversation…" tooltip.
- vitest for `savedDraftSlotState`; Playwright for the three states.

## Historical STATE
Researched + decided; nothing implemented. Next step: T01.
