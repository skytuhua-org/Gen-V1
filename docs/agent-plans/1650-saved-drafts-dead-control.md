
# Plan: Composer "Saved drafts" is permanently disabled with contradictory tooltips

## META
- Feature: Saved drafts entry point in the composer
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-21 (design fully specified — implementer makes no design choices)
- Baseline: main @ 8cc970fd667fbefebb2a77df2a829f880a132e54
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1650
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
- `apps/web/src/App.tsx` (~line 446): renders `<SavedDrafts owner={savedDraftOwner} …>` only when `savedDraftOwner` is truthy; otherwise renders a permanently `disabled` fallback button with the "waiting for the owning project context" / "Start a conversation…" tooltips. Bug: `savedDraftOwner` stays null even when the thread has `projectId`/`workspaceId` set — derive it the same way the live path does (verify: `savedDraftOwnerKey` in `saved-drafts.ts`).
- `apps/web/src/SavedDrafts.tsx`, `apps/web/src/saved-drafts.ts`: `savedDraftOwnerKey`, `SavedDraftOwner` type — the owner is `{threadId, projectId, workspaceId}`; check whether the fallback can construct an owner from `thread.projectId ?? workspaceId`.
- `apps/web/src/saved-drafts.css`: styles for the popover; no changes expected.
- Discovery: confirm whether the backend/draft library requires a projectId-scoped owner or accepts a threadId-only owner; pick the cheapest correct owner derivation.

## DESIGN SPEC
- Disabled fallback tooltip (only string): "Select a project or open a conversation to save named drafts."
- Enabled path: construct `savedDraftOwner` whenever `thread` exists (use `thread.projectId ?? null`, `thread.workspaceId ?? null`, `threadId: thread.id`); render `<SavedDrafts>` instead of the fallback. Its own `disabled` prop already covers `busy || !ready || retry || predictionBlocked`.
- Tooltip on enabled button comes from SavedDrafts internals — leave unchanged.
- No visual changes; button remains `quiet` style, same position in the composer leading slot.

## EXECUTION_DAG
- T01 (owner: this task's implementer): In `App.tsx`, derive `savedDraftOwner` for the fallback case using `savedDraftOwnerKey`/`SavedDraftOwner` from `saved-drafts.ts`; render `<SavedDrafts>` when derivable, else the fallback button with the single new tooltip string. Done when: built app shows enabled Saved drafts in a project-connected thread and the new tooltip in the no-context state. Tests: vitest unit test for the owner-derivation helper; Playwright check that the button is enabled in a fixture thread.
- T02 (same owner): Update the tooltip string; verify no other copy of the old strings remains (rg "owning project context"). Done when: both states verified at :4317.

## VALIDATION
- `pnpm build` then serve review host on :4317; open a fixture thread with a project → Saved drafts enabled, popover opens; detached/no-project state → disabled with the new tooltip.
- vitest for derivation; Playwright smoke for button state.

## STATE
Researched + decided; nothing implemented. Next step: T01.
