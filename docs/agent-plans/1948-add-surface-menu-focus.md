# Plan: Close the Add-surface menu on Tab so focus cannot escape into the page behind it

## META
- Feature: Focus containment fix for the workspace "Add surface" ActionMenu
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-23 (design fully specified — implementer makes no design choices)
- Baseline: main @ 19e6c7a789ae85f3314ee652d4dceefaff102999
- Status: plan only, not implemented
- Source: interactive QA of the built fixture app on :4317 (workspace panel "+" Add surface menu)

## OBJECTIVE
The Add-surface menu in `apps/web/src/WorkspacePanel.tsx` (an `ActionMenu` from `packages/ui-shell/ActionMenu.tsx`) already has correct ARIA roles (`role="menu"`, `menuitem`, arrow-key navigation, `aria-haspopup`/`aria-expanded`). The remaining defect: with the menu open, pressing **Tab** moves focus out of the open popup into the page behind it — the menu stays open, visually focused on nothing, and screen-reader users lose the menu context. An open menu must not survive focus leaving it.

**Measurable success:** with the menu open, Tab (or Shift+Tab) closes the menu and focus continues naturally to the next/previous focusable element after/before the trigger. The menu can never remain open while its trigger and items are unfocused.

## REQUIREMENTS

### In scope
1. `ActionMenu` (the shared component in `packages/ui-shell/ActionMenu.tsx`) closes on Tab and Shift+Tab while open, letting the default focus move proceed.
2. Fix applies to every ActionMenu consumer (Add surface, SessionBranchMenu, SavedLayoutChooser, PlanStatus, ShellSidebar, WorkspaceControls, WorkspaceSplitLayout) — shared-component fix, no per-call-site changes.

### Out of scope
- Arrow-key navigation, Escape, click-outside dismissal (all already correct).
- Focus-trapping the menu (menus are not modals — Tab must leave, the menu just closes).

### Behavior (exact)
- `onKeyDown` on the Popover content: on `event.key === 'Tab'`, call `close()` and **do not** `preventDefault` — the browser moves focus normally out of the closing menu.
- On the trigger button: if menu is closed and user presses Tab — nothing (already default).
- After Tab-closing, `aria-expanded` returns to `false` and the popover unmounts via the existing `Popover open={...}` path; the next focus target is the natural tab order element after the trigger (this is what the browser does once the popover unmounts — verify no manual focus call is needed).
- Escape/ArrowUp/ArrowDown/Home/End/Enter/click behavior unchanged.

### Keyboard / a11y
- Verified target behavior matches APG menu-button pattern where menus are transient: Tab exits and dismisses.
- Screen-reader sequence after fix: focus on trigger → open menu (expanded announced) → Tab → menu closes (collapsed announced), focus lands on the next control.

### Motion / reduced motion
- Closing uses the existing Popover dismiss path; no new animation. `prefers-reduced-motion` unaffected.

## REPO_MAP (verified)
- `packages/ui-shell/ActionMenu.tsx:61-89` — trigger + `Popover ... onKeyDown={navigation.onKeyDown}`; `navigation = useListNavigation(items, choose, close)` from `./list-navigation`.
- `packages/ui-shell/list-navigation.ts` — shared hook; check whether it already swallows Tab (read before editing; if Tab handling belongs here, fix here so Select.tsx benefits too — Select has the same popup pattern at `packages/ui-shell/Select.tsx:38`).
- `apps/web/src/WorkspacePanel.tsx:77` — Add-surface usage.
- `packages/ui-shell/Modal.tsx:67` — existing Tab handling precedent (trap for dialogs; menus differ — close, don't trap).

## DESIGN
Minimal: in `useListNavigation`'s `onKeyDown` (or in `ActionMenu`'s Popover `onKeyDown` wrapper if the hook must stay unchanged for Select), add at the top: `if (event.key === 'Tab' && !event.altKey && !event.ctrlKey && !event.metaKey) { close(); return; }`. Prefer fixing in `useListNavigation` only if Select and ActionMenu should share the behavior (they should — the same defect exists there); implement in `list-navigation.ts` and cover both.

## EXECUTION_DAG
- **T01** — Read `packages/ui-shell/list-navigation.ts`; add the Tab-close branch. Done when: ActionMenu and Select popups close on Tab/Shift+Tab and all existing keyboard paths still work.
- **T02** — Tests (VALIDATION). Done when: new cases pass.

## VALIDATION
Fixture repro:
```
pnpm --filter @genv1/web build && node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"
```
http://127.0.0.1:4317 → open any thread → workspace panel → "+" Add surface → press Tab.

Planned tests:
- Keyboard (Playwright, the repo's browser-test convention): open menu → Tab → assert menu closed (`aria-expanded="false"`) and `document.activeElement` is the element after the trigger.
- Regression: ArrowDown/Up/Escape/Enter still work (existing tests if present, else a single Playwright pass).

## STATE
- Researched/decided: this plan. Implemented: nothing.
- Next step: T01.

## REFERENCES
- APG menu-button pattern; `packages/ui-shell/Modal.tsx:67` for the repo's Tab-handling precedent.
