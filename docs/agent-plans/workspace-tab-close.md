# Plan — Close affordance for workspace surface tabs (rev1)

## META
- Feature: Close button + middle-click close on workspace surface tabs
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev1, 2026-11-22
- Baseline: `main` @ `97efd9ca` (verified via `git fetch origin main`)
- Status: planned, not implemented
- Source: frontend QA pass on the fixture app (:4317) — tabs accumulate with no way to dismiss them

## OBJECTIVE
A user who opens surfaces via the "+" ("Add surface") menu can never remove them; the strip grows until it scrolls. Add a per-tab close affordance and middle-click close so the strip is a full lifecycle control. Success: every tab except a mandatory last one can be dismissed by mouse, keyboard, or middle-click, with focus and active-tab fallback behaving predictably.

## REQUIREMENTS
- In scope: the surface tab strip in `WorkspacePanel.tsx` header (`role="tablist"`, "Workspace views"). Behavior for standalone and docked panel modes.
- Out of scope: the "+" Add surface menu, inner sub-tab strips inside surfaces (Diff Current/History/Recorded etc.), reordering/dragging tabs.
- Each tab gets a trailing close control:
  - 14px `X` icon (lucide `X`, `strokeWidth` default, `aria-hidden`), inside an 18×18px `<button>`.
  - `aria-label="Close {tab label} tab"` (e.g. `Close Diff tab`).
  - Colors: icon `var(--muted)`; on hover/focus of the close button icon becomes `var(--text)` on `background: var(--hover)`, `border-radius: 4px`.
  - Visibility: opacity 0, shown at opacity 1 on tab hover, tab focus-within, and always on the selected tab (`aria-selected=true`). Transition `opacity 100ms var(--ui-ease-enter)`; under `prefers-reduced-motion` no transition (instant).
  - Focus-visible: `outline: 1px solid var(--accent); outline-offset: -1px`.
  - Closing the tab must not also activate it: stop propagation on the close button's click.
- Middle-click (`mousedown` button 1) on the tab body closes it; `event.preventDefault()` to stop autoscroll.
- Keyboard: when the tab button itself has focus, `Delete` closes the tab. When the close button has focus, `Enter`/`Space` activate it (native button behavior).
- After a close (existing `workspace.closeTab` semantics kept): the active tab becomes the last remaining open tab; if none remain, `activeTab` falls back to `'artifact'` and the strip MUST show a single `Artifact` tab (re-add `artifact` to `openTabs` when the list would empty — matches `readShellLayout` normalization that always keeps `activeTab` in `openTabs`). The `Artifact` tab is never closable: render no close button on it and ignore middle-click/Delete for it.
- If the closed tab was active and the fallback equals the already-active tab, no visual change beyond the tab removal.
- Focus after close: focus moves to the newly active tab button (the tab that took over), not left on a removed element.
- No confirmation, no undo, no toast on close.
- Labels come from the existing `tabLabels` record; no new copy is introduced.

## REPO_MAP
- `apps/web/src/WorkspacePanel.tsx` ~L61–L79: `tabStrip` ref, overflow markers, `tabLabels`, tablist markup (verified).
- `apps/web/src/App.tsx` ~L557: `workspaceContext.closeTab` already implemented — filters `openTabs`, sets `activeTab` to last remaining or `'artifact'` (verified; no UI calls it today).
- `apps/web/src/workspace-context.tsx` L15: `closeTab?: (tab) => void` on `WorkspaceContextValue` (verified).
- `apps/web/src/shell-layout.ts` L5, L14: `openTabs` persisted; normalization keeps `activeTab` inside `openTabs`.
- `apps/web/src/styles.css`: `.empty-state`, `var(--hover)`, `var(--muted)`, `var(--text)`, `var(--accent)`, `var(--ui-ease-enter)` (verified tokens exist).
- Tests: vitest unit tests + Playwright browser tests are the repo's test stack (no jsdom/Testing Library). Locate existing panel tests via `rg -l "WorkspacePanel|workspace-right" apps/web --glob '*.test.*' --glob '*.spec.*'` — discovery, treat as unverified until run.

## DESIGN
- Render, inside each closable tab `<button role="tab">`, a nested interactive element is invalid HTML; instead split each tab into a wrapper `<div role="presentation">` containing the tab `<button role="tab">` (label) and the close `<button>` sibling, both inside the same `role="tablist"` strip. Keyboard order: tab button, then its close button, then next tab.
- Call `workspace.closeTab(id)` on close activation; when `openTabs.filter(t => t !== id)` is empty, call `workspace.setActiveTab('artifact')` then `workspace.openTab('artifact')` so the strip keeps one tab. Implement in `WorkspacePanel.tsx`, not the context (context already correct).
- Middle-click: `onMouseDown` on the tab button, `event.button === 1` → `preventDefault` + `closeTab`.
- `Delete` key: `onKeyDown` on the tab button when `event.target === event.currentTarget`.
- Focus handoff: after `closeTab`, in a `requestAnimationFrame` call `.focus()` on `#workspace-tab-${newActive}`.

## EXECUTION_DAG
- T01 (owner: implementer): In `WorkspacePanel.tsx`, restructure the `openTabs.map` render into wrapper divs `{tab button, close button}`; add `onMouseDown` middle-click and `onKeyDown` Delete handlers; add empty-strip guard calling `setActiveTab`/`openTab('artifact')`; add focus handoff. Done-when: all behaviors above work in the fixture app; `Artifact` tab renders no close control.
- T02 (owner: implementer): Add CSS in `styles.css` near the existing `.workspace-right-header` rules: close button sizing/visibility/hover/focus/reduced-motion rules exactly as specified. Done-when: visual states verified at 280px min panel width and at overflow.
- T03 (owner: implementer): Tests — Playwright: open Diff + Files via Add surface, close Files via its close button (active stays Diff), close via middle-click, Delete-key close, strip with only Artifact shows no close button; vitest: `closeTab` fallback keeps `activeTab` in `openTabs`. Done-when: `pnpm vitest run` + Playwright spec pass.

## VALIDATION
- Fixture host: `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; ..."` on :4317 (as used by QA).
- Manual matrix: hover/focus visibility, active-tab persistence, middle-click, Delete key, close-all-then-Artifact-only, 280px min width, overflow scrolling, `prefers-reduced-motion` (no opacity fade), dark + light themes.
- Acceptance: each requirement line verifiable; no regression to tab activation, overflow markers, or Add surface menu.

## STATE
- Researched/decided: all of the above. Implemented: none. Risks: nested-button HTML validity is resolved by the wrapper structure; `Delete` keybinding conflicts none found (terminal tab input focus is inside the tabpanel, not the tab button).
- Next step: T01.

## REFERENCES
- Issue: (filled at publish). Fixture QA pass 15, workspace panel surface.
