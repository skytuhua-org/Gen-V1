# A11y: Closing the Settings dialog drops focus to `body` instead of restoring the invoker

## META
- Repo: skytuhua-org/Gen-V1 — baseline `main` @1cbd02cd (docs-only plan, rev 1, 2026-11-23)
- Found during interactive QA of the built fixture app on :4317 (pass 23, keyboard shortcuts round 2)
- Status: plan only, not implemented

## OBJECTIVE
Opening Settings moves focus into the dialog (the `Close dialog` button), but closing it — by Escape, the × button, or any close path — leaves `document.activeElement` on `<body>`. Verified live: focused the composer textarea, pressed Ctrl+Comma, pressed Escape → `activeElement === document.body`. A keyboard user loses their place on every settings round-trip and must Tab through the entire shell to get back.

## REQUIREMENTS
- In scope: every path that opens the settings dialog — the `openSettings` keyboard chord (`apps/web/src/App.tsx:793`, `WorkspaceHost.tsx:235`), the sidebar Settings button (`apps/web/src/ShellSidebar.tsx` ~:480 `settings={() => ...}`), and any other `setSettingsOpen(true)`/`openSettings()` call sites — plus every close path (native `<dialog>` cancel/Escape, the `Close dialog` button, `closeSettings()` in `WorkspaceHost.tsx`).
- Out of scope: other dialogs get the same fix only where they share the same opener/focus-owner mechanism; this plan does not redesign focus order inside the dialog.
- Focus must return to the element that was focused when Settings opened (the actual invoker or the previously focused control — composer textarea, sidebar button, a thread row), not always to the Settings button.
- If the previously focused element is gone or hidden when the dialog closes, fall back to the sidebar `Settings` button; if that is hidden (collapsed sidebar), the sidebar `Search` input; never `<body>`.
- Compact UI; no new visual elements.

## REPO_MAP (verified)
- Dialog markup: `apps/web/src/Settings.tsx` — root `<dialog>` with `Close dialog` button; native `cancel` event on Escape.
- Open sites: `apps/web/src/App.tsx:793` (`openSettings` chord → `setSettingsSection('general'); setSettingsOpen(true)`); `apps/web/src/WorkspaceHost.tsx` `openSettings` → `setSettingsOpen(true)`; `apps/web/src/ShellSidebar.tsx` Settings button → `settings()`.
- Close sites: `WorkspaceHost.tsx` `closeSettings` (also refreshes settings/navigation); the dialog's own `Close dialog` button; native Escape `cancel`.
- Precedent: `ConversationFind.tsx` keeps `opener.current` and returns focus to the find trigger on Escape-close — the same pattern applies here.
- Fixture repro: review host on `http://127.0.0.1:4317` (see VALIDATION).

## DESIGN
1. **Capture the invoker at open time.** In each `setSettingsOpen(true)` path, store `const invoker = document.activeElement as HTMLElement | null` before opening. Share one helper: `const settingsInvoker = useRef<HTMLElement | null>(null)` on the component that owns `settingsOpen` state (`App.tsx`/`WorkspaceHost.tsx` — the one that renders the `<dialog>`); set it inside a single `openSettings()` function that every caller routes through (chord handler, sidebar button, deep links all funnel to it — route the `initialSection` argument through the same function so there is exactly one open path).
2. **Restore on close.** One `closeSettingsDialog()` beside `closeSettings`: first run the existing `closeSettings()` side effects, then `settingsInvoker.current?.isConnected && settingsInvoker.current.getClientRects().length ? settingsInvoker.current.focus({preventScroll: true}) : fallback()`, where `fallback()` focuses `aside[aria-label="Thread navigation"] button[aria-label="Settings"]`, else `input[aria-label="Search threads"]`. Wire it to: the dialog's `cancel` event (`onCancel={closeSettingsDialog}` — React maps the native cancel), the `Close dialog` button's `onClick`, and `closeSettings` itself.
3. **No motion:** focus change is instant; no scroll animation (`preventScroll: true`), consistent with `ConversationFind`.
4. **a11y:** the `<dialog>` keeps `aria-labelledby` on its `h2`; after restore, a screen-reader announces the regained control's own label — no extra `aria-live` announcement.

## EXECUTION_DAG
- T01 Introduce `openSettings()`/`closeSettingsDialog()` with `settingsInvoker` capture + restore at the component owning `settingsOpen`; route all open/close call sites through it. Deps: none. Owner: single implementer. Handoff: →T02. Done-when: every open path records its invoker and every close path restores it.
- T02 Vitest coverage in `tests/settings-dialog.test.tsx` (or the existing settings test file): mount, focus a control, open via chord, close via cancel, assert `document.activeElement` is the original control; plus the hidden-invoker fallback case. Deps: T01. Owner: same implementer. Handoff: →VALIDATION/REVIEW release. Done-when: both cases asserted green.

## VALIDATION
- Fixture command (run in repo root): `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` after `pnpm build`, then `http://127.0.0.1:4317`.
- Focus the composer → Ctrl+Comma → Escape → `document.activeElement` is the composer textarea. Open via the sidebar Settings button → × → focus is back on that button. Collapse the sidebar (Ctrl+B), open Settings via the chord from the composer, close → focus returns to the composer.
- `pnpm typecheck`, `pnpm lint`, the vitest spec above.

## STATE
Researched + designed; nothing implemented. Next: implementer claims the issue, executes T01–T02.

## REFERENCES
- Repro in QA pass 23 (:4317): `activeElement === body` after Escape-close; `ConversationFind.tsx` opener-ref precedent; open/close sites listed in REPO_MAP.
