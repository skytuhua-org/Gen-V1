# Plan: Disable notification preference controls that do nothing in the browser

## META
- Title: Settings shows live notification controls that are inert in the browser build
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-22
- Baseline: main @ bffae7ff
- Status: researched, not implemented
- Source: code audit + manual QA (web app never consumes `delivery`; comment at `Settings.tsx` notes system popups/sound are Windows-app only)

## OBJECTIVE
In the browser build, the Notification settings render working-looking controls — Task notifications select, Preview privacy select, Sound volume slider + Preview sound button, Quiet hours switch + times, In-app notifications — but no code path in the web app consumes delivery: `dismissPopup`/`attentionRead` are Windows-host-only. Users change prefs that do nothing. Controls must be visibly disabled in the browser build with a one-line explanation.

## REQUIREMENTS
- In scope: `apps/web/src/Settings.tsx` (`thread-notifications` row), `apps/web/src/AppearanceSettings.tsx` `NotificationSettings` (volume/preview-privacy/quiet-hours/in-app controls).
- Out of scope: implementing browser delivery; Windows app behavior (controls stay enabled there).
- In the browser build each affected control renders `disabled` and a single caption line sits under the group: `Desktop notifications and sounds only work in the Windows app.` (12px, `var(--muted)`, 16px line-height).
- Disabled controls use the app's existing disabled pattern (`opacity: .45; cursor: not-allowed` per `controls.css:45`).
- Windows build: zero change — controls enabled, no caption (caption only renders when `!desktop`).
- Keyboard/a11y: disabled controls are skipped in tab order (native `disabled`); the caption is plain text, no live region.

## REPO_MAP
- `apps/web/src/Settings.tsx`: 'thread-notifications' row shows the browser-build description already; but the control stays enabled.
- `apps/web/src/AppearanceSettings.tsx` `NotificationSettings`: renders volume `<input type=range>`, "Preview sound" button (660Hz sine preview — works in-browser but implies delivery), Preview privacy `Select`, Quiet hours `Switch` + time inputs; shows the "requires the Windows app" note only when `!desktop` — keep and extend to the whole group.
- `apps/web/src/useAttention.ts` `change()`: only read/unread/dismiss-popup commands exist; `dismiss-popup` unused in web.
- `ShellNotice` toast is plugin-error only — no notification delivery consumer.

## DESIGN
Gate by the existing desktop detection used for the `!desktop` note in `NotificationSettings`:
1. `AppearanceSettings.tsx`: wrap the volume, preview-sound, preview-privacy, quiet-hours and in-app-controls fieldset in a `<fieldset disabled={!desktop}>` (fieldset disables all descendants and keeps markup flat); keep the existing `!desktop` caption, updating its copy to `Desktop notifications and sounds only work in the Windows app.` Remove `field` spacing changes.
2. `Settings.tsx` 'thread-notifications' row: apply `disabled={!desktop}` to its control and append the same sentence to the row's existing description when `!desktop`.
- No new settings, no delivery plumbing, no dead-state UI besides disabled styling the CSS already gives disabled controls.

## EXECUTION_DAG
- T01 — AppearanceSettings fieldset disable + caption copy (owner: implementer). Edits per DESIGN #1. Done-when: in web build all listed controls are disabled and the caption shows; in a mocked `desktop=true` render they are enabled.
- T02 — Settings.tsx row disable + description copy (owner: implementer, independent of T01). Per DESIGN #2. Done-when: control disabled with updated description in web build.
- T03 — Vitest render spec (owner: implementer, depends on T01,T02). Render NotificationSettings with `desktop=false`: every control `disabled`; caption present. With `desktop=true`: none disabled, no caption. Done-when: spec passes.

## VALIDATION
- Unit spec per T03 (vitest + Playwright stack, no jsdom/Testing Library additions).
- Manual: fixture host Settings → Notifications in browser: controls greyed (opacity .45), not focusable, caption readable at 420px and 1024px widths; tab order skips them.
- Acceptance matrix: controls disabled in web (T01,T02); enabled in Windows build path (T01,T02,T03); caption copy exact (T01,T02); existing enabled styling unchanged (T03).

## STATE
- Researched and decided; pending. Risk: `desktop` flag name differs — verify its exact prop in `NotificationSettings` before T01 (discovery, not a decision). Next: T01.

## REFERENCES
- `apps/web/src/Settings.tsx`, `apps/web/src/AppearanceSettings.tsx`, `apps/web/src/useAttention.ts`, `packages/ui-shell/controls.css:45`
