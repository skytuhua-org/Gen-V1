[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1927.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1927](https://github.com/skytuhua-org/Gen-V1/issues/1927). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Plan conflicts with [#1714](https://github.com/skytuhua-org/Gen-V1/issues/1714): it keeps in-app preferences enabled and silently overwrites persisted sound/both, while [#1714](https://github.com/skytuhua-org/Gen-V1/issues/1714) disables controls. Current useAttention handles inbox data but no browser delivery consumer was found; block that policy change pending explicit reconciliation.

Latest journal read: [7110194930](https://github.com/skytuhua-org/Gen-V1/issues/1927#issuecomment-7110194930). Earlier claims, tests, review findings and releases remain in the append-only journal.

### T00: reconcile browser notification authority before T01

[Issue #1714](https://github.com/skytuhua-org/Gen-V1/issues/1714) and open [implementation #1750](https://github.com/skytuhua-org/Gen-V1/pull/1750) require disabling browser notification controls because delivery is Windows-only. This plan instead leaves preview privacy/quiet hours and Off/In-app notices enabled and silently persists `sound`/`both` as `notifications`. Those requirements conflict.

Source review on the pinned audit baseline found inbox refresh/read/dismiss behavior in `apps/web/src/useAttention.ts` and desktop delivery consumption in `apps/desktop/main.ts`; it did not establish an in-browser delivery consumer that makes the proposed settings effective. The current explanatory copy alone is not proof of such a consumer. T00 owner is the existing notification feature owner; inputs are both complete plans, the consumer map and #1750's current head. Output is an explicit accepted policy and persistence rule applied to both canonical plans and mirrors, with a test showing each enabled control affects the actual browser consumer and desktop persisted preferences remain correct. T01/T02 depend on that decision. Preserve the proposals below as the unresolved design record, not authorization to silently coerce stored settings before reconciliation.

---

# Plan: Browser build disables dead notification options instead of offering settings that do nothing

## META
- Feature: Notifications & Usage section in the browser fixture/app build
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev1, 2026-11-23
- Baseline: main @ 65801227
- Canonical issue: this issue (rev1 body = this document)
- Status: planned, not implemented
- Source: QA pass 26 (fixture :4317): the "Task notifications" select still offers "Popups", "Sound" and "Popups and sound" even though the row's own description states "System popups and sound are unavailable in this browser build", and the "Sound volume" slider plus "Preview sound" button stay fully enabled — settings the user can change that can never take effect.

## OBJECTIVE
In a non-desktop build, controls that cannot take effect are visibly disabled with an explanation, and select options that cannot work are removed. In the desktop app, everything works as today.

## REQUIREMENTS
- Scope: `apps/web/src/Settings.tsx` l.51 (`thread-notifications` option list) and l.162 (browser-build description branch); `apps/web/src/AppearanceSettings.tsx` `NotificationSettings` l.97–102 (`{!desktop && ...}` note, volume row l.99).
- Behavior, `desktop === false`:
  - `thread-notifications` options reduce to `['off', 'notifications']` with labels `['Off', 'Popups']` → relabel: since system popups are unavailable and only in-app notices fire, the two options become `['off','notifications']` labeled `Off` / `In-app notices`. Selecting them works and saves.
  - The row description keeps the current sentence: `Task completion, failure, and input requests. System popups and sound are unavailable in this browser build; in-app notices stay active.`
  - `NotificationSettings` (`harness-notification-controls`): keep the existing `<p className="panel-note">System notifications and sound require the Windows app.</p>`; additionally render the "Sound volume" slider, its `<output>`, and the "Preview sound" button with `disabled` and `aria-disabled`, and give the row copy a trailing suffix ` Requires the Windows app.` — exact copy: `Sound volume · Requires the Windows app.`
  - "Preview privacy" and "Quiet hours" stay enabled — they govern in-app behavior that does work.
- Behavior, `desktop === true`: identical to today — all four options, slider, and Preview enabled.
- States: browser-disabled (slider/button/select-options as above); browser-enabled (off / in-app notices); desktop (unchanged).
- Disabled visuals: existing `--muted`/disabled styles already used by `disabled` inputs — `opacity:0.5` pattern used elsewhere; do not remove the controls from the tab order beyond native `disabled` behavior.
- Reduced motion: none added.
- Out of scope: wiring real browser notifications; quiet-hours semantics; Windows desktop changes.

## REPO_MAP
- `apps/web/src/Settings.tsx` l.51: `thread-notifications: { key:'threadNotifications', options:['off','notifications','sound','both'], labels:['Off','Popups','Sound','Popups and sound'] }`; l.162 branches the description on `desktop` but not the options or disabled state.
- `apps/web/src/AppearanceSettings.tsx` l.97–102: `NotificationSettings` receives `desktop` and already gates only the note line.
- `Select` component supports per-item options arrays (verify in T01 whether options can also carry `disabled` flags — if yes, alternative allowed: keep four options but disable `sound`/`both`... NO — decision made: remove the dead options, do not render disabled select items).

## DESIGN
- In `Settings.tsx` `row('thread-notifications',...)` / `PreferenceControl` path, when `!desktop` pass `options:['off','notifications'], labels:['Off','In-app notices']` — implement by branching the `preferenceRows` entry or the `control` JSX at l.162 (the description branch already exists there; extend it to supply a modified `item` object `{...item, options:[...], labels:[...]}`).
- If `preferences.threadNotifications` currently equals `'sound'` or `'both'` while `!desktop`, render the select value as `'notifications'` and immediately persist `update({threadNotifications:'notifications'})` on mount of the section — one-time silent coercion, no extra UI.
- In `AppearanceSettings.tsx` `NotificationSettings`: wrap the volume `AppearanceRow` control's `input` and button with `disabled={busy || !desktop}`; append ` · Requires the Windows app.` to the row label when `!desktop` via the `label` prop string.
- Copy (exact): `Off`, `In-app notices`, `Sound volume · Requires the Windows app.`, existing note unchanged.

## EXECUTION_DAG
- T01 — Implement option-list branch + disabled wiring + coercion on mount. Deps: none. Owner: implementer A. vitest: non-desktop renders 2 options and disabled volume/preview; desktop renders 4 options enabled; stored `both` coerces to `notifications`. Done-when: specs pass.
- T02 — Playwright on fixture :4317 (browser build): confirm two options, disabled slider/preview, persistence of coercion; screenshot states. Deps: T01. Done-when: verified.

## VALIDATION
- Reproduce: `pnpm build && pnpm build:widgets`, then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"`, open http://127.0.0.1:4317 → Settings → Notifications & Usage.
- Acceptance matrix: dead options gone (T01/T02); dead controls disabled+labeled (T01/T02); coercion persists once (T01); desktop unaffected (T1 unit).
- Release gate: all rows verified.

## Historical STATE
- Researched: dead options/controls confirmed live. Decided: remove options, disable sound controls, coerce stored value. Pending: implementation. Next: T01.

## REFERENCES
- Settings.tsx l.51, l.162; AppearanceSettings.tsx l.97–102. QA pass 26 fixture walkthrough.
