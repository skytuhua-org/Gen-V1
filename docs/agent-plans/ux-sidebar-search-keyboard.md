## UX: Sidebar thread search is mouse-only — no select-on-focus, Enter dead, Escape mis-fires

### META
- Repo: skytuhua-org/Gen-V1 — baseline `main` @2640b897 (docs-only plan, rev 1, 2026-11-22)
- Found during interactive QA of the built fixture app on :4317 (pass 10: command palette / shortcuts / toasts)
- Related: #1371 Command menu (Ctrl+K) in flight on PR #1437 — that plan migrates the search chord to Ctrl+Shift+F and adds a real menu; the sidebar search field itself remains and every defect below is independent of which chord focuses it.
- Status: plan only, not implemented

### OBJECTIVE
Ctrl+K (or, after #1371, Ctrl+Shift+F) focuses the sidebar thread-search input, but from there the keyboard is dead: the user cannot open a result, navigate results, or dismiss search without reaching for the mouse, and Escape leaks into global handlers with destructive side effects.

**Observed bugs (all repro'd live on :4317):**
1. Pressing Ctrl+K focuses the search input but does **not** select the existing query — typing appends to it (verified: `quiet` → `quietx`). Every palette-style search selects-all on focus.
2. `Enter` in the search field does nothing — the top matching thread cannot be opened from the keyboard.
3. `ArrowDown`/`ArrowUp` do nothing — the filtered thread list below the input is unreachable by keyboard (the `<nav>` has `tabindex="0"` but no roving focus or link activation path from the input).
4. `Escape` in the search field does not clear the query or blur the field. Instead it falls through to the global keydown chain in `App.tsx` (`search/newThread/toggleSidebar/toggleRightPanel/openSettings/stop`, then the unconditional `event.key === 'Escape' → setSidebarOpen(false)`): the `stop` binding (default Escape) can stop a running agent, and on narrow layouts the sidebar collapses — while the typed query stays. Verified live.
5. The input has no `aria-keyshortcuts`, no `kbd` hint, and no way to clear the query except selecting the text and deleting it.

### REQUIREMENTS
- In scope: the sidebar search input (`apps/web/src/ShellSidebar.tsx` ~:389-395), its result `<nav aria-label="Threads">`, and the global keydown handling in `apps/web/src/App.tsx` (:787-796) only as needed for Escape scoping.
- Out of scope: the #1371 CommandMenu component, filter-button behavior, thread-row layout (#1139 owns row polish).
- No new colors, type styles, or layout shifts. Compact UI per house style.
- Every new keyboard behavior must not fire while a `dialog[open]` exists, matching the existing global guard.

### REPO_MAP (verified)
- Input: `apps/web/src/ShellSidebar.tsx` ~:389 — `ref={searchRef} aria-label="Search threads" placeholder="Search"`, controlled `search` state, no `onKeyDown`.
- Filtered list: same file ~:440-480; rows are buttons; empty state ~:474 `'No matching threads.'`.
- Focus shortcut: `apps/web/src/App.tsx` `matchesShortcut` chain ~:787-796 focuses `searchRef`; unconditional `Escape → setSidebarOpen(false)` at ~:795.
- `matchesShortcut`/`shortcutKeys`/`ariaShortcut`/`chordFor`: `apps/web/src/keyboard-bindings.ts` + `packages/ui-shell/shell-layout.ts:23`.
- Fixture: `shell` scenario on :4317 reproduces every item.

### DESIGN
1. **Select-on-focus:** in the `search` branch of the global keydown, after `searchRef.current.focus()` also call `searchRef.current.select()` (guard `input instanceof HTMLInputElement`). Existing query is replaced by the first typed character; cursor/focus otherwise unchanged.
2. **Enter opens the top match:** `onKeyDown` on the input — `Enter` when `filteredThreads.length > 0` activates `filteredThreads[0]`'s existing `onClick` path (call the same `selectThread`/`openThread` handler the row button uses; do not duplicate logic). `Enter` with zero results does nothing. `event.preventDefault()` on handled keys.
3. **Arrow navigation into results:** `ArrowDown` moves DOM focus to the first thread row button; `ArrowUp` to the last. Implement roving `tabIndex` on the filtered rows (active row `tabIndex={0}`, others `-1`) with `ArrowDown/ArrowUp` moving an `activeIndex` state that resets to `0` whenever `search` changes. `Enter` on a focused row activates it (native button behavior). `Escape` on a row returns focus to the input. Rows keep their existing classNames/padding; focus-visible uses the existing `--ui-focus-ring` outline already used elsewhere in the sidebar (2px solid, `outline-offset: 1px`).
4. **Escape semantics:** `Escape` in the input — if `search` is non-empty, clear it and keep focus; if empty, blur the input. Either way `event.stopPropagation()` so the global handler (stop-run, sidebar collapse) never sees it. Same stopPropagation for `Escape` on a result row.
5. **Discoverability + clear affordance:**
   - `aria-keyshortcuts={ariaShortcut('search')}` on the input and `title={`Focus (${shortcutKeys('search')})`}`.
   - A clear button rendered only when `search.length > 0`: the existing icon-button pattern (28×28px hit area, `X` glyph 14px, `--muted` → `--text` on hover, `border-radius: 6px`, `aria-label="Clear search"`, positioned absolute right inside the input wrapper, input `padding-right: 32px` when shown — no layout shift since the wrapper is fixed height). Clicking clears `search` and returns focus to the input.
6. **Empty state** unchanged (`No matching threads.`).

### EXECUTION_DAG
- T01 Select-on-focus + `aria-keyshortcuts`/`title` on the input. Deps: none. Owner: single implementer. Handoff: →T02. Done: Ctrl+K retypes over the query; hint tooltip shows the bound chord.
- T02 Input `onKeyDown`: Enter→top result, ArrowDown/ArrowUp→row navigation, Escape→clear/blur with stopPropagation; clear button per DESIGN 5. Deps: T01 (same file, must merge cleanly). Owner: single implementer. Handoff: →T03. Done: every key behaves per DESIGN 2–4 in the fixture.
- T03 Roving focus in the thread list + row Escape→input; verify on :4317 `shell` fixture. Deps: T02 (activeIndex contract). Owner: single implementer. Handoff: →VALIDATION/REVIEW release. Done: full keyboard loop input→list→open works end-to-end.

### VALIDATION
- Fixture on :4317: Ctrl+K → existing query selected; type → replaced. Type `meet` → Enter opens top thread. ArrowDown ×2 → second row focused; Enter opens it. Escape with text → cleared, focus stays; Escape empty → blurred; global stop/sidebar never fires (verify a running thread keeps running).
- Narrow width (~400px): same behaviors; clear button doesn't overflow the input.
- `pnpm typecheck`, `pnpm lint`, existing `tests/keyboard-bindings.test.ts` + `tests/shell-shortcut-roundtrip.test.ts` still green; add vitest coverage for `matchesShortcut` unchanged behavior and a component-level test for the input keydown if a test seam exists (per repo test conventions: vitest only, Playwright for e2e).

### STATE
Researched + designed; nothing implemented. Next: implementer claims the issue, executes T01–T03.

### REFERENCES
- Repro in QA pass 10 (:4317, `shell` fixture); global keydown `apps/web/src/App.tsx` ~:787-796; registry `apps/web/src/keyboard-bindings.ts`; #1371/PR #1437 (overlapping chord change only).
