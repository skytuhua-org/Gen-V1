[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1849.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1849](https://github.com/skytuhua-org/Gen-V1/issues/1849). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Composer attachment removal exists in open [#1853](https://github.com/skytuhua-org/Gen-V1/pull/1853). T04 browser behavior remains pending in the journal.

### Reviewed implementation references

- [PR #1853](https://github.com/skytuhua-org/Gen-V1/pull/1853): open; head `0c630a983a4a5225f5f4ce2096bb0296522cf795`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7104425698](https://github.com/skytuhua-org/Gen-V1/issues/1849#issuecomment-7104425698). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

Plan file: https://github.com/skytuhua-org/Gen-V1/blob/62be976379b18b9680f742733eff19ab399f09dc/docs/agent-plans/1849-composer-chip-remove.md

# Plan: Remove control on composer resource chips

## META
- Feature: Per-chip remove affordance on composer attachment chips
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-23
- Baseline: main @ 8f54f406b80f2d7d8ac09cc2a46557c125d681fa
- Status: planning complete, implementation NOT started
- Source provenance: QA pass 20, fixture on http://127.0.0.1:4317 — `.resource-chip` spans in `ComposerAttachments.tsx` render a File icon, name, and optional Lock glyph only; no remove control, no `onClick`, no keyboard affordance. `App.tsx` exposes `resource.grant` but no removal path (only `onRemoveExcerpt` for terminal excerpts and `onRemove` for skill chips exist).
- Related (non-overlapping): https://github.com/skytuhua-org/Gen-V1/issues/1730 adds a revoke control to the Settings "Granted resources" list. This plan covers the composer chip surface only.

## OBJECTIVE
A user who granted the wrong file, or no longer wants a resource attached to the thread, removes it directly from the chip in the composer. Success: every rendered `.resource-chip` carries a working remove control that is reachable by pointer and keyboard, revokes the grant, and updates the strip without a reload.

## REQUIREMENTS
- Scope: `apps/web/src/ComposerAttachments.tsx` (chip rendering), `apps/web/src/styles.css` (`.resource-chip` rules), `apps/web/src/App.tsx` (command wiring), host command layer where `resource.grant` is handled.
- The remove control is a real `<button type="button">` inside each chip, class `resource-chip-remove`, `aria-label="Remove resource <basename>"`, `title="Remove resource"`, containing an `X` icon at 10px (`lucide` X, matching the existing File/Lock icon usage).
- Placement: trailing slot inside the chip, after the name text and Lock icon. `.resource-chip` keeps `display:flex; align-items:center; gap:5px; padding:4px 7px;` — the button adds no new padding on the chip.
- Button chrome: `width:16px; height:16px; padding:0; border:0; border-radius:4px; display:grid; place-items:center; flex:none; background:transparent; color:var(--muted); cursor:pointer`.
- Hover/focus: `:hover` sets `color:var(--text); background:var(--subtle)`; `:focus-visible` sets `outline:2px solid var(--accent); outline-offset:-2px` (global focus styles may already cover this — keep the explicit rule so the affordance is guaranteed inside the tiny hit area).
- Behavior: activating the button calls host command `resource.revoke` with `{ threadId, resourceId }`, then `refresh()` — mirroring the `resource.grant` + `refresh()` flow in `App.tsx` Add-a-resource dialog.
- Backend: add host command `resource.revoke` in the same command registry that implements `resource.grant`: payload `{ resourceId }`, effect `store.remove('resource', resourceId)` scoped to the command's threadId, returning the removed grant id. Discovery first: if `resource.revoke` already exists in the command layer when this lands (it may arrive via #1730), reuse it and skip the registry edit.
- Error handling: on command rejection, keep the chip mounted and surface the message through the composer's existing `role="status"` error row mechanism used by `ComposerToolbar` (text: `Could not remove <basename>: <error>`).
- While removing: set the chip's `data-leaving` attribute when the command resolves, letting the existing `ui-item-out` exit animation (`--ui-motion-remove`, `--ui-ease-move`, `both`) play; the store update removes the chip after. Reduced-motion path is inherited unchanged (`ui-popover-fade` fallback at `--ui-motion-press` already applies to `.resource-chip`).
- Keyboard/a11y: the button is in the tab order (default); Enter and Space activate (native button); chips with `Lock` (read-only/writable=false grants) keep their Lock icon and still get a remove control — revoking a read-only grant is allowed; disabled only when the thread context is `readOnly` or `archived`, in which case the button renders with `disabled` and `aria-disabled` and its `title` reads `Removal unavailable — thread is read-only` or `Removal unavailable — thread is archived`.
- Live region: on successful removal announce `Removed <basename>` in a visually-hidden `role="status"` element (reuse the live-region pattern in `ComposerToolbar` error rows; if a shared polite live region exists in the composer tree, use that instead of adding a node — discovery).
- Out of scope: the Settings granted-resources list (#1730), TerminalExcerpt removal (exists), skill-chip removal (exists), any rename or re-grant flow.

## REPO_MAP
- `apps/web/src/ComposerAttachments.tsx` — renders `.resource-strip` of `.resource-chip` spans (File icon, name, Lock when `!writable`); exit animations via `data-leaving` honoring `reducedMotion()` and `data-panel-animations`.
- `apps/web/src/styles.css` lines ~162, 358–369 — `.resource-chip` layout, `ui-item-in`/`ui-item-out` chip animations, reduced-motion fallback.
- `apps/web/src/App.tsx` — `preparePR`, `command('resource.grant', { path, kind, writable }, threadId)` + `refresh()` in the Add-a-resource dialog; wires `ComposerAttachments` props.
- Host command layer — search `resource.grant` for the registry handler; `resource.revoke` handler colocates there (`store.remove('resource', id)` is the store primitive — verified used in `tests/repository-map-custody.test.ts` and memory fixtures).
- `apps/web/src/ComposerToolbar.tsx` — existing `role="status"` error row + dismiss pattern to reuse for failure surface.
- Tests: `tests/e2e/` Playwright specs pattern; `tests/` vitest for command layer (`tests/review-regressions.test.ts` exercises `resource.grant`).

## DESIGN
1. `ComposerAttachments` gains prop `onRemoveResource: (resource) => void` (and `disabled?: boolean` from the held/readOnly context already computed in `ScopedConversationComposer`).
2. Each chip renders: `[File icon][name span][Lock icon if !writable][resource-chip-remove button]`. The span stays a span (not a button) — nested interactive content stays out of the name text.
3. App wires `onRemoveResource` to `command('resource.revoke', { resourceId }, threadId).then(refresh).catch(err => setComposerStatus(...))` using the existing status-row mechanism.
4. Server/registry: `resource.revoke` validates the resource belongs to `command.threadId`, calls `store.remove('resource', resourceId)`, bumps seq, returns `{ removed: resourceId }`. Rejects with `CAPABILITY_DENIED` for cross-thread ids.
5. The chip marks `data-leaving` on resolve so the existing exit animation runs before the refresh re-renders without it.

## EXECUTION_DAG
- T01 (backend): add `resource.revoke` command in the host command registry (or verify presence if #1730 landed it): validate `resourceId` ownership by `threadId`; `store.remove`; return `{ removed }`. Deps: none. Owner: backend worker. Tests: vitest — grant then revoke removes from `store.all('resource', threadId)`; cross-thread id rejects. Done-when: command round-trips in review-host. Handoff → T02.
- T02 (UI): `ComposerAttachments` renders `resource-chip-remove` per chip with the exact chrome/aria/title/disabled spec above; wire `onRemoveResource`. Deps: T01. Owner: web worker. Tests: vitest render — chip shows button, disabled under readOnly context. Done-when: clicking removes chip after refresh. Handoff → T03.
- T03 (App wiring): `App.tsx`/`ScopedConversationComposer` passes `onRemoveResource` invoking the command + refresh + status-row error path. Deps: T01,T02. Owner: same web worker. Tests: Playwright e2e — grant via review-host fixture, click remove, chip exits and stays gone. Done-when: e2e green. Handoff → T04.
- T04 (a11y/motion): verify tab order, Enter/Space activation, focus-visible outline, live-region announcement, `data-leaving` exit and reduced-motion fallback. Deps: T03. Owner: web worker. Tests: Playwright keyboard sweep + `emulateMedia({ reducedMotion: 'reduce' })`. Done-when: checks pass.

## VALIDATION
- Fixture (reproduces current gap): `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` then open a thread with granted resources — chips show no remove control today.
- Vitest: `resource.revoke` ownership + removal; chip render/disabled states.
- Playwright (`tests/e2e/`): remove flow end-to-end; keyboard activation; reduced-motion run.
- Acceptance matrix: every REQUIREMENTS bullet maps to T01–T04; PASS when chip removal works by mouse and keyboard, failure shows the status row, and reduced motion keeps the fade-only exit.

## Historical STATE
- Researched/decided: full plan (this document). Implemented: nothing. Verified: gap confirmed on built fixture :4317 and in source.
- Risks: backend command may already exist after #1730 merges — T01 discovery handles it. Unpushed: none.
- Next step: implement T01.

## REFERENCES
- Issue family: #1730 (settings revoke), #1237 (paste images into composer), #1484 (prompt snippets).
- `scripts/review-host.ts` grants 8 fixture resources (`agreement.pdf` shared across threads) — enough chips to exercise the strip.
