# UX: Escape does double duty — dismissing a transient card still stops the active run

## META
- Repo: skytuhua-org/Gen-V1 — baseline `main` @1cbd02cd (docs-only plan, rev 1, 2026-11-23)
- Found during interactive QA of the built fixture app on :4317 (pass 23, keyboard shortcuts round 2)
- Status: plan only, not implemented

## OBJECTIVE
Escape is the user-rebindable `stop` chord and also the universal "dismiss whatever is on top" key. When a `ThreadHoverCard` preview is open while a thread runs, the card's document-level Escape listener dismisses the card but does not consume the event — the window `stop` handler in `App.tsx` also fires and stops the running thread. Pressing a key whose contract is "close the popup" cancels real work. Verified in code: `ThreadHoverCard.tsx:55-59` calls `dismiss()` without `preventDefault()`/`stopPropagation()`, and `App.tsx:786` treats `event.defaultPrevented` as the only consumed marker.

## REQUIREMENTS
- In scope: every transient, dismissing surface that listens for Escape — `ThreadHoverCard` (`apps/web/src/thread-hover/ThreadHoverCard.tsx`), `ConversationFind` (`apps/web/src/ConversationFind.tsx`), `KeyboardReference` overlay (`apps/web/src/KeyboardReference.tsx`), the `paletteOpen` command palette (`App.tsx`/`WorkspaceHost.tsx`), context menus, `<details>` disclosure popovers (`ShellSidebar.tsx`) — and the global `stop` handler (`App.tsx`, `WorkspaceHost.tsx`).
- Out of scope: the rebinding UI itself (issue #1704), Escape closing the native Settings `<dialog>` (browser handles it, and the global handler already skips `dialog[open]`).
- Pressing Escape must do exactly one thing per press: dismiss the topmost transient surface; only when nothing transient is open does it reach `stop` and the unconditional `setSidebarOpen(false)` in `App.tsx:794`.
- Order of Escape consumers: (1) open `<details>` disclosure in the sidebar, (2) `ThreadHoverCard`, (3) command palette, (4) `ConversationFind`, (5) `KeyboardReference` overlay, (6) global `stop`/sidebar close.
- Compact UI; no visual changes.

## REPO_MAP (verified)
- Hover card listener: `apps/web/src/thread-hover/ThreadHoverCard.tsx:55-59` — `ownerDocument.addEventListener('keydown', escape)`; `escape` calls `dismiss()` without preventing default.
- Global handlers: `apps/web/src/App.tsx:786-796` and `apps/web/src/WorkspaceHost.tsx:233-242` — window `keydown` with `event.defaultPrevented` guard; `matchesShortcut(event, stopChord)` → `stop()`; plus unconditional `Escape → setSidebarOpen(false)` in `App.tsx`.
- Other transient Escape consumers to wire the same way: `ConversationFind.tsx` (document keydown, returns focus on close), `KeyboardReference.tsx`, palette input `onKeyDown`, `<details>` sidebar menus.
- Fixture repro: review host on `http://127.0.0.1:4317` (see VALIDATION).

## DESIGN
1. **Consume the event when a transient dismisses.** In `ThreadHoverCard`, `ConversationFind`, `KeyboardReference`, the palette handler and the `<details>` close-on-Escape paths, call `event.preventDefault()` (and `stopPropagation()` where the listener sits on `document`) in the same branch that performs the dismiss. This is the established convention already honored by the global handlers' `event.defaultPrevented` guard.
2. **Order is implicit, not a new bus:** listeners register on the same document/window, so mark each dismissal consumed and the existing `defaultPrevented` guard orders them without introducing a z-index stack utility. Do not add a shared dismiss manager (no new abstraction for a boolean each consumer sets).
3. **The unconditional `setSidebarOpen(false)` on Escape in `App.tsx` also moves behind the same guard** — an Escape that dismissed a card must not additionally collapse the sidebar.
4. **No motion changes:** dismiss animations (`animate-pop-in` 120 ms `ease-out` for the hover card, reduced-motion `0.01ms` media query) are unchanged.
5. **a11y:** unchanged labels; behavior now matches the platform "Escape closes the topmost thing" contract a screen-reader user already expects.

## EXECUTION_DAG
- T01 Add `preventDefault`/`stopPropagation` to the dismiss branch of `ThreadHoverCard`, `ConversationFind`, `KeyboardReference`, palette `onKeyDown`, and sidebar `<details>` Escape handling. Deps: none. Owner: single implementer. Handoff: →T02. Done-when: every transient Escape close consumes the event.
- T02 Guard the `App.tsx` unconditional `Escape → setSidebarOpen(false)` behind `!event.defaultPrevented`. Deps: T01. Owner: same implementer. Handoff: →VALIDATION/REVIEW release. Done-when: dismissing a card leaves sidebar state untouched.
- T03 Vitest/Playwright: open a hover-card preview during a fixture run, press Escape, assert the run keeps `running` and the card is gone; second Escape stops the run. Deps: T01, T02. Done-when: the two-press sequence is asserted green.

## VALIDATION
- Fixture command (run in repo root): `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` after `pnpm build`, then `http://127.0.0.1:4317`.
- Start a running thread, hover a thread in the sidebar to open the hover card, press Escape → card closes, run still `running`. Press Escape again → run stops. Repeat with the command palette and find bar open: each Escape removes only the top layer.
- `pnpm typecheck`, `pnpm lint`, the Playwright/vitest case above.
- Reduced motion: dismissal is already instant in the reduced-motion media query; unchanged.

## STATE
Researched + designed; nothing implemented. Next: implementer claims the issue, executes T01–T03.

## REFERENCES
- `ThreadHoverCard.tsx:55-59` dismiss path; `App.tsx:786-796` and `WorkspaceHost.tsx:233-242` global handlers; `ConversationFind.tsx` focus-return close; QA pass 23 (:4317).
