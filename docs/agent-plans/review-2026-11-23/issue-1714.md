[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1714.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1714](https://github.com/skytuhua-org/Gen-V1/issues/1714). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Browser notification-control repair is open in [#1750](https://github.com/skytuhua-org/Gen-V1/pull/1750). Its disable-all policy conflicts with later [#1927](https://github.com/skytuhua-org/Gen-V1/issues/1927)'s enabled in-app preferences and stored-value coercion; reconcile the actual browser delivery consumer before changing either accepted policy.

### Reviewed implementation references

- [PR #1750](https://github.com/skytuhua-org/Gen-V1/pull/1750): open; head `53132b9ccb51d66d710d67fa66e04a10f28a0586`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7088449306](https://github.com/skytuhua-org/Gen-V1/issues/1714#issuecomment-7088449306). Earlier claims, tests, review findings and releases remain in the append-only journal.

### Cross-plan prerequisite

[Issue #1927](https://github.com/skytuhua-org/Gen-V1/issues/1927) prescribes enabled in-app notification preferences and a silent persisted-value change, while this plan disables browser controls. Current `apps/web/src/useAttention.ts` manages inbox data and refresh/read state; desktop delivery is consumed in `apps/desktop/main.ts`. A browser delivery consumer supporting #1927's policy has not been established. Before either policy is accepted, the existing owners must map the consumers and record one reconciled behavior in both complete plans. Keep this issue's requirements and #1750 intact until that decision; a stored preference must not be rewritten merely to hide a UI mismatch.

---

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

## Historical STATE
- Researched and decided; pending. Risk: `desktop` flag name differs — verify its exact prop in `NotificationSettings` before T01 (discovery, not a decision). Next: T01.

## REFERENCES
- `apps/web/src/Settings.tsx`, `apps/web/src/AppearanceSettings.tsx`, `apps/web/src/useAttention.ts`, `packages/ui-shell/controls.css:45`
