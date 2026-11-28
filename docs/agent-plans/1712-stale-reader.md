# Plan: Clear the inbox reader when the open item leaves the filtered list

## META
- Title: Agent inbox keeps showing an item the active filter or search excluded
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-22
- Baseline: main @ bffae7ff
- Status: researched, not implemented
- Source: manual QA of the built fixture app (Agent inbox)

## OBJECTIVE
Selecting an inbox row, then switching the filter or typing a search that excludes it, leaves the reader showing the stale item — in two-column mode beside an empty list ("Select an item"/"Nothing matches"), and in single-column mode as a full-screen item whose "← Inbox" back button returns to an empty list. The reader must never show an item that is not in the visible list.

## REQUIREMENTS
- In scope: `apps/web/src/InboxView.tsx` selection state only.
- Out of scope: attention projection (`packages/core/attention.ts`), markRead semantics, other panes.
- Behavior: when the `chosen` item is no longer in `visible`, clear the selection — two-column shows the "Select an item" empty state; single-column shows the list.
- When the filter/search later re-includes the item, it is NOT auto-reselected (selection stays cleared; user picks again).
- Mark-read is unaffected: a cleared item keeps its read state.
- Keyboard: Escape already returns from reader to list in single-column; unchanged.

## REPO_MAP
- `apps/web/src/InboxView.tsx`: `chosen` (line ~20) is persisted deliberately so a row keeps its selection through filtering; `visible` derives from `filter`+`query`; `selected = items.find(i => i.id === chosen)` (not `visible`), so the reader renders items filtered out of the list.
- Repro: select row → choose filter "Needs you" or search "zzz" → list empty, reader still shows the item.
- `agent-inbox.css` grid/container rules unchanged.

## DESIGN
In `InboxView`, derive `selected` from the visible list instead of all items: `const selected = visible.find(i => i.id === chosen)`. Keep `chosen` state as-is (it already persists across filter changes); deriving `selected` from `visible` makes the reader empty whenever the open item is filtered out, and restores it automatically if the item re-enters the visible list. No effect or extra state needed; `chosen` staying set means restoring the filter brings the same item back — acceptable and consistent with "selection persists" intent, since the reader now truthfully reflects the visible list.
- Single-column follows automatically (`columns==='item'` shows reader only when `selected` exists).
- Footer/toolbar already guard on `selected` — no other edits.

## EXECUTION_DAG
- T01 — InboxView selection derivation (owner: implementer). Change `selected` to look up `chosen` in `visible` (and stop clearing `chosen` on filter change if any explicit clear exists). Done-when: repro above yields the empty state.
- T02 — Vitest/Playwright spec (owner: implementer, depends on T01). Fixture with 2 items; select item A; switch filter to one excluding A; assert reader shows the empty state; restore filter; assert item A is re-opened (selection persists). Done-when: spec passes.

## VALIDATION
- Playwright: repro path above in two-column and emulated 400px single-column; assert back button path also consistent.
- Manual: fixture app, filter All→Needs-you→Unread→Completed and search "zzz"/"m" while an item is open.
- Acceptance matrix: reader never shows filtered-out item (T01); selection restored when item re-enters list (T01); single-column returns to list (T01); no behavior change to mark-read/unread (T01,T02).

## STATE
- Researched and decided; pending implementation. Next: T01.

## REFERENCES
- `apps/web/src/InboxView.tsx`, `apps/web/src/agent-inbox.css`, `third-party/vespin/inbox-columns.ts`
