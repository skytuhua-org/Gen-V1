[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1728.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1728](https://github.com/skytuhua-org/Gen-V1/issues/1728). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Unsaved Appearance navigation protection exists in [#1774](https://github.com/skytuhua-org/Gen-V1/pull/1774). The newer audit revision requires reproducing current behavior and preserving existing ownership; no closure while implementation remains open.

### Reviewed implementation references

- [PR #1774](https://github.com/skytuhua-org/Gen-V1/pull/1774): open; head `af441bd40d920b756cd09f3ba8c0349c60b60d07`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7120945178](https://github.com/skytuhua-org/Gen-V1/issues/1728#issuecomment-7120945178). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

[Current versioned Markdown plan](https://github.com/skytuhua-org/Gen-V1/blob/dad473f59b4c46dad12cf0357e448e090a403a2b/docs/agent-plans/nov-2026-audit-1728-revision.md) · [Plan publication PR](https://github.com/skytuhua-org/Gen-V1/pull/1952)

# Plan: Guard unsaved Appearance settings against silent discard

## META
- Feature: Unsaved-changes guard for the Appearance settings draft
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev1, 2026-11-22
- Baseline: main @ bffae7ff (verified HEAD at write time)
- Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1728 (rev1 body = this document)
- Plan-file PR: https://github.com/skytuhua-org/Gen-V1/pull/1727
- Status: planned, not implemented
- Source: QA pass 13 on the built fixture app (:4317); verified live: editing any Appearance control then switching settings section or closing the dialog discards the draft with no warning.

## OBJECTIVE
A user who tweaks Appearance (theme, accent, font sizes, density, project colors) and then clicks another settings section, presses Escape, or clicks the dialog's close button loses every change silently — the dirty banner "Unsaved changes — Apply to keep them" never warns on exit. Success: leaving the Appearance editor with a dirty draft always requires an explicit keep/discard decision; leaving clean is instant.

## REQUIREMENTS
- In scope: `apps/web/src/AppearanceSettings.tsx`, `apps/web/src/Settings.tsx`, `apps/web/src/settings.css`, `apps/web/src/Modal.tsx` (reuse). New component `DiscardAppearanceDialog` inside AppearanceSettings.tsx.
- Guard fires when `dirty === true` (existing `dirty` computed at AppearanceSettings.tsx:54) and the user attempts to (a) switch settings section via nav button, section `<Select>`, search result, or settings-next/previous/first/last-section chords; (b) close the Settings dialog (X button, Escape, backdrop).
- Confirm dialog (new, reuse `Modal`, className `dialog discard-appearance-dialog`):
  - Title: `Discard appearance changes?` — h2, 14px/550 (`.ui-modal-header h2` style).
  - Body copy: `You have unsaved appearance changes. Apply them before leaving, or discard them.` — 13px, `var(--muted)`, line-height 1.5, max-width 45ch, padding `12px 16px`.
  - Buttons row, right-aligned, gap 8px, padding `0 16px 16px`:
    - `Keep editing` — `.secondary`; focus returns to the Appearance section; default focused button.
    - `Discard changes` — `.secondary` with `color: var(--danger)`; leaves without applying (draft reset to persisted preferences).
    - `Apply changes` — `.primary`; runs the existing Apply path then proceeds with the original navigation.
  - Escape and backdrop click = `Keep editing`. Focus trap per Modal. `aria-label` on dialog comes from title.
- The guard lives in AppearanceSettings via a registration API: it exposes `onRequestLeave(cb)` to the parent. Settings.tsx calls it before `chooseSection`, before its own close handler, and before the four section chords run. Attempting to leave while dirty opens the confirm dialog; navigation proceeds only after `Discard changes` or successful `Apply changes`.
- Keyboard: confirm dialog buttons in normal tab order; Enter activates focused button; Escape = Keep editing.
- Reduced motion: dialog uses Modal's existing enter transition (160ms); under `prefers-reduced-motion: reduce` the transition duration collapses to 0ms (Modal already does this — verify, no new motion added).
- Out of scope: guarding the font-size number inputs' silent revert (separate issue); dirty state for non-Appearance sections (none exist — other sections persist per-control).
- Error handling: if Apply fails (persist error), stay on Appearance, show existing `error` text, do not navigate.

## REPO_MAP
- `apps/web/src/AppearanceSettings.tsx` — draft/Apply model; `dirty` flag l.54; `size()` input l.59; actions row l.85 (Reset/Preview/Cancel/Apply + "Unsaved changes — Apply to keep them" hint).
- `apps/web/src/Settings.tsx` — `chooseSection` l.159 (clears query, sets section); `revealTarget` l.160; nav `<button>` list l.186; chord handling in `onKeyDown` l.180; `settings-section-select` l.182.
- `apps/web/src/Modal.tsx` — generic modal with title/onClose/backdrop + focus trap (verify exact props; used by ProjectPicker.tsx:80, SavedDrafts.tsx:42).
- `apps/web/src/settings.css` — `.settings-*` classes; `.dialog` modal styles in ui.css (verify).
- Tests: `apps/web/` vitest unit tests; `apps/web/e2e` or repo Playwright suite (verify path during T01).

## DESIGN
- AppearanceSettings gains `useImperativeHandle`-free callback registration: parent passes `registerLeaveGuard(fn)` prop; the component calls `fn()` when it mounts and returns an object `{dirty: () => boolean, apply: () => Promise<void>, discard: () => void}`.
- Settings.tsx holds `const [leaveRequest, setLeaveRequest] = useState<null | {proceed: () => void}>(null)`. All section-change and close paths funnel through `requestLeave(proceed)`: if guard absent or `!dirty()` → proceed; else `setLeaveRequest({proceed})` which renders `<DiscardAppearanceDialog>`.
- Dialog actions: Keep editing → `setLeaveRequest(null)`; Discard → `guard.discard(); setLeaveRequest(null); proceed()`; Apply → `await guard.apply(); setLeaveRequest(null); proceed()` (on reject: keep editing, show error).
- The Settings dialog's own `onClose` in App.tsx:141 must route through the same `requestLeave` — lift `requestLeave` to a ref passed up, or have Settings render an invisible blocker: simplest is Settings exposing `requestClose` through a ref prop set by App.tsx. Implementation chooses the ref approach; exact prop names fixed in T01 after reading Modal/App wiring.
- States: idle; confirming (dialog open, Apply button `aria-busy` while persisting); applying-failed (error text under actions, dialog closed, stays on Appearance).

## EXECUTION_DAG
- T01 — Read Modal.tsx props, App.tsx:141 close wiring, Settings.tsx chord/close paths. Produce exact prop signatures in a comment on the issue. No app code. Deps: none. Handoff: findings comment on issue #1728 for T02 owner. Done-when: wiring diagram confirmed.
- T02 — AppearanceSettings: add `registerLeaveGuard` prop returning `{dirty, apply, discard}`; `discard` resets draft+theme to persisted preferences. Deps: T01 (prop signatures). Owner: implementer A (AppearanceSettings). Tests: vitest — dirty true after change, discard resets, guard unregisters on unmount. Done-when: guard registered on mount, unregistered on unmount; handoff to T03 owner via issue comment.
- T03 — Settings.tsx: `requestLeave(proceed)`; route `chooseSection`, `revealTarget`, `settings-section-select` change, four section chords, and dialog-close path through it. Deps: T02 (guard API). Owner: implementer B (Settings.tsx); may be same worker as T02 sequentially. Tests: vitest — section switch with clean draft navigates immediately; with dirty draft sets leaveRequest and does not change section. Done-when: every exit path routes through requestLeave; handoff to T04.
- T04 — `DiscardAppearanceDialog`: markup/copy/buttons per REQUIREMENTS; focus on Keep editing; `aria-busy` during apply. CSS: `.discard-appearance-dialog` width `min(420px, calc(100vw - 32px))`. Deps: T03 (leaveRequest state). Owner: implementer B. Tests: Playwright — open settings → Appearance → change font size → click General → dialog appears with exact copy; Discard → lands on General, returns to Appearance shows persisted values; Apply → navigates and values persisted. Done-when: three buttons verified end-to-end.
- T05 — Escape/backdrop/close-button coverage: Playwright — dirty draft + Escape shows dialog; clean draft + Escape closes instantly. Keyboard-only walkthrough of the confirm dialog (Tab order, Enter). Deps: T04. Owner: implementer B. Done-when: all exit paths verified + a11y tab order recorded.
- T06 — Update issue body plan revision to rev2 if scope shifted; final QA on fixture app. Deps: T05. Owner: implementer B. Done-when: issue #1728 body reflects shipped state; RELEASE posted.

## VALIDATION
- `cd apps/web && npx vitest run` (new unit specs pass; suite green).
- `npx playwright test` fixture-app specs for the flows in T04/T05.
- Manual fixture-app check on :4317: every exit path in REQUIREMENTS (a) and (b).
- Acceptance matrix: dirty+section-click→dialog (T03/T04); dirty+Escape→dialog (T05); dirty+X→dialog (T05); Discard resets draft (T04); Apply persists then navigates (T04); clean→no dialog (T03); reduced-motion→no transition (T04 verify); dialog keyboard operable (T05).
- Release gate: all acceptance rows verified in fixture app; no jsdom/Testing Library introduced.

## Historical STATE
- Researched: dirty flag, section switching, modal reuse. Decided: ref-based requestLeave, three-button confirm. Pending: exact Modal prop names (T01). Next step: T01.

## REFERENCES
- Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1728. Plan-file PR: https://github.com/skytuhua-org/Gen-V1/pull/1727. Fixture host: scripts/review-host.ts :4317. Prior QA finding recorded in recording qa-pass13-settings.


---
Plan file: https://github.com/skytuhua-org/Gen-V1/blob/55705782391c1497ace6f4433b9c54a78feabdb7/docs/agent-plans/appearance-unsaved-guard.md

<!-- gen-v1-audit-plan-revision:2026-11-23:1728 -->

## November audit plan revision
**Revision:** `audit-2026-11-23-r1`. **Repository baseline:** `main@a64e9e2d03ce09c843bff0480d81311f2012c812` (GitHub read during triage). **Canonical issue:** #1728.

### Objective and requirements
**Reproduction and delayed-save proof for Appearance.** 07 §5.4 and 09 #1774. Preserve the existing unsaved-changes design, dialog actions and plan acceptance.
Keep the issue's existing scope, requirements and assigned implementation work. Refresh related PRs at the beginning of the reproduction.

### Reproduction gate
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

### Execution and validation
- **RED — Reproduce from the shipped Appearance flow.** Change one supported preference and leave via section switch and modal close. Record the lost value on the pinned baseline, using the existing fixture and selectors from the canonical plan. Check the current #1774 head before editing.
- **GREEN — Exercise deferred Apply and navigation.** Control the save response with a fixture. Verify the accepted revision survives close/reopen, pending navigation follows the chosen keep/discard semantics, and a failed save retains the draft without reporting success.

### State and handoff
New audit checks are planned. This revision records source and issue triage only. The implementing agent records independent RED, the exact accepted fix or no-repro disposition, GREEN, and any installed or native gate on this issue. Follow the issue's existing dependency and review order.

### References
Audit trackers #1848 and #1946. Follow-up coordination #1860 and #1886.
[Prior version of the attached Markdown plan](https://github.com/skytuhua-org/Gen-V1/blob/55705782391c1497ace6f4433b9c54a78feabdb7/docs/agent-plans/appearance-unsaved-guard.md).
