# UX: Keyboard shortcuts are undiscoverable — no hints on controls, no open-cheat-sheet chord, inconsistent glyph labels

## META
- Repo: skytuhua-org/Gen-V1 — baseline `main` @1cbd02cd (docs-only plan, rev 1, 2026-11-23)
- Found during interactive QA of the built fixture app on :4317 (pass 23, keyboard shortcuts round 2)
- Status: plan only, not implemented

## OBJECTIVE
The app ships a full `KEYBOARD_BINDINGS` registry and a `KeyboardReference` cheat sheet, yet almost nothing on screen advertises the chords:

1. Only the sidebar "New thread" button shows its chord (`ShellSidebar.tsx:422` title `New thread (Ctrl+Shift+O)`). The Search input, Settings button, left/right sidebar toggles and the command palette show none — the five most-used chords are invisible until the user opens the cheat sheet.
2. There is no shortcut to open the cheat sheet itself — `KeyboardReference` exists only behind a button/entry point; nothing like `?` / `Ctrl+/` opens it. The palette lists it, so `Ctrl+K` → "Shortcuts" works, but nothing teaches that path.
3. `aria-keyshortcuts` is set only on the thread-nav Next/Prev buttons (`ShellSidebar.tsx:251`); every other chorded control lacks it, so assistive tech cannot enumerate available shortcuts.
4. Label formatting is inconsistent: `ShortcutInput` shows the raw preference string `Ctrl+Comma` while `KeyboardReference` renders the glyph `Ctrl+,` via `shortcutKeys`; tooltips use `Ctrl+Shift+O` but the cheat sheet shows `Ctrl+⇧+O`-style glyphs per platform.

## REQUIREMENTS
- In scope: tooltip/title hints on chorded controls (`ShellSidebar`, `App.tsx` new-thread button, sidebar toggle buttons, the settings button), `aria-keyshortcuts` on those same controls, a `?` binding that opens `KeyboardReference`, and unified glyph rendering via the existing `shortcutKeys()` helper.
- Out of scope: the `KeyboardReference` overlay's visual design (open issue #1128 owns its presentation), remapping any default chord, and the `?` binding remapping via preferences (it is a fixed chord like the rest of the non-preference registry).
- All hints pull the chord from `preferences.keybindings` where the action is remappable (search, newThread, toggleSidebar, toggleRightPanel, openSettings) so rebound chords stay truthful — same pattern as `ShellSidebar.tsx:422`.
- Compact UI; hints live in existing `title` tooltips and `aria-keyshortcuts` — zero new chrome, zero new type styles.

## REPO_MAP (verified)
- Registry + glyph formatter: `apps/web/src/keyboard-bindings.ts` — `KEYBOARD_BINDINGS`, `shortcutKeys(chord)` → platform glyphs.
- Cheat sheet: `apps/web/src/KeyboardReference.tsx` — rendered from the registry; opened via `paletteOpen`-adjacent UI (search "Shortcuts" in the palette).
- Existing hint: `apps/web/src/ShellSidebar.tsx:422` `New thread (…)` title; `:251` `aria-keyshortcuts` on Prev/Next.
- Controls lacking hints: sidebar search input (`ShellSidebar.tsx` search row), sidebar left toggle button, right-panel toggle (workspace header), Settings button (`ShellSidebar.tsx` ~:480), New thread button on the workspace empty state (`App.tsx`).
- Fixture repro: review host on `http://127.0.0.1:4317` (see VALIDATION).

## DESIGN
1. **Tooltip hints** — append ` (${preferences.keybindings.X})` to the `title` of every control whose action is chorded, matching `ShellSidebar.tsx:422`:
   - Search input: `title="Search threads (Ctrl+K)"` — dynamic from `preferences.keybindings.search`.
   - Sidebar toggle: `title="Toggle sidebar (Ctrl+B)"` — dynamic.
   - Right-panel toggle: `title="Toggle right panel (Ctrl+Shift+B)"` — dynamic.
   - Settings button: `title="Settings (Ctrl+,)"` — dynamic, rendered via `shortcutKeys` so it shows `Ctrl+,` not `Ctrl+Comma`.
   - New thread empty-state button: same ` (Ctrl+Shift+O)` suffix.
2. **`aria-keyshortcuts`** — set the same dynamic chord on each of the above controls, in the raw registry format (`Ctrl+K` etc., space-separated alts allowed by the ARIA spec); keep the existing nav buttons unchanged.
3. **`?` opens the cheat sheet** — add a fixed binding `showShortcuts` to `KEYBOARD_BINDINGS` (scope: Global, chord `Shift+Slash`, glyph `?`, description `Show keyboard shortcuts`), matched in the `App.tsx` window-keydown chain before `stop` — guarded identically (`event.defaultPrevented`, `dialog[open]`, and the editable-target guard `isEditableTarget` from #1704's plan so `?` typed in an input doesn't fire — if #1704 has not landed, inline the same `isEditableTarget` check here). On match: `setShowShortcuts(prev => !prev)` (or whatever state `KeyboardReference` consumes).
4. **Glyph unification** — render every chord label in tooltips via `shortcutKeys(chord)` so UI always shows `Ctrl+,`/`Ctrl+⇧+O` style glyphs; `ShortcutInput` display value stays the raw stored string (it is the stored format, and #1704 owns its capture UX).

## EXECUTION_DAG
- T01 Add `showShortcuts` binding to the registry and wire `?` in `App.tsx`'s keydown chain to toggle `KeyboardReference`. Deps: none (carries the editable-target check inline). Owner: single implementer. Handoff: →T02. Done-when: `?` opens/closes the cheat sheet globally, works at every app state, and is listed in the cheat sheet itself.
- T02 Dynamic chord tooltips + `aria-keyshortcuts` on the five chorded controls in `ShellSidebar.tsx`/`App.tsx`/workspace header. Deps: none. Owner: same implementer (same files, keep one worker). Handoff: →VALIDATION/REVIEW release. Done-when: every listed control exposes title + aria-keyshortcuts derived from `preferences.keybindings`.
- T03 Vitest/Playwright: press `?` → cheat sheet visible; rebind `search` to `Ctrl+L` in Settings → sidebar search tooltip reads `(Ctrl+L)`. Deps: T01, T02. Done-when: both asserted green.

## VALIDATION
- Fixture command (run in repo root): `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` after `pnpm build`, then `http://127.0.0.1:4317`.
- Hover the sidebar search input → tooltip `Search threads (Ctrl+K)`; hover Settings → `Settings (Ctrl+,)`; press `?` on any screen → cheat sheet opens; press `?` again (or Escape) → closes. Rebind a chord → tooltip updates without reload.
- `pnpm typecheck`, `pnpm lint`, the T03 test.
- Reduced motion: no animation added; cheat sheet open/close keeps its current behavior.

## STATE
Researched + designed; nothing implemented. Next: implementer claims the issue, executes T01–T03.

## REFERENCES
- `keyboard-bindings.ts` registry/`shortcutKeys`; `KeyboardReference.tsx`; `ShellSidebar.tsx:251,422,~480`; `App.tsx:786-796` keydown chain; QA pass 23 (:4317).
