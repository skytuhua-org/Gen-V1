# Plan: Settings "Saved" indicator resets when the section or context changes

## META
- Feature: Stale "Saved" checkmark in the Settings dialog page heading
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev1, 2026-11-23
- Baseline: main @ 65801227
- Canonical issue: this issue (rev1 body = this document)
- Status: planned, not implemented
- Source: QA pass 26 (fixture :4317): after saving any preference, the green "✓ Saved" chip in the page heading stays visible while navigating to unrelated sections (Browser, Keyboard Shortcuts, Data & Recovery, About & Licenses), implying their settings were just saved when nothing happened there.

## OBJECTIVE
The "Saved" confirmation only describes the save the user just performed and only appears where the change was made. Switching settings sections, searching, or receiving a new external preference update clears it.

## REQUIREMENTS
- Scope: `apps/web/src/Settings.tsx` — `saved` state l.105, set-true l.143, rendered l.190 in `settings-save-state`; the `section`/`query` state that drives `heading`.
- Behavior:
  - `setSaved(true)` keeps current behavior: chip shows after a successful `settings.update` + `refresh`.
  - The chip clears (`setSaved(false)`) when: the user picks another nav section, types into or clears the settings search box, or clicks a search result that changes the heading; and when a new `refresh()` payload arrives that was not triggered by the user's own save (external change supersedes the confirmation).
  - The chip also auto-clears after 4000ms so it never lingers indefinitely on the section where the save happened.
  - While `busy`, "Saving…" shows as today; a failed save still routes to `error` and clears `saved`.
- A11y: the `<span className="settings-save-state" role="status">` keeps `role="status"`; clearing removes the node content so screen readers do not re-announce stale success on each section switch.
- States: idle (empty span, `data-state="idle"`); saving; saved (chip, ≤4000ms, current section only).
- Reduced motion: unchanged — the chip already renders without animation; keep no transition.
- Out of scope: toast/notification replacement for the chip; per-field saved indicators.

## REPO_MAP
- `apps/web/src/Settings.tsx`: l.105 state tuple `const [query, setQuery] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState(false);`; l.142–143 save flow; l.190 heading render `<span className="settings-save-state" data-state=... role="status">`; section switching via `nav` button `onClick` and `revealTarget`/search (l.40–72).
- `settings.css`: `.settings-save-state` styles (verify exact selector in T01).

## DESIGN
- Add a `useEffect` keyed on `[section, query]` that calls `setSaved(false)` whenever either changes (run on change only, not mount).
- In the save success path, record the section active at save time (`savedSection = section`) — simpler alternative accepted: rely solely on the `[section, query]` effect; external refresh clearing is handled by clearing `saved` inside `refresh()` only when the call did not originate from `runSave`. Implement via a `fromSave` flag: `refresh()` clears `saved` unless `fromSave === true`.
- Auto-clear: `useEffect` on `saved === true` sets a `setTimeout(() => setSaved(false), 4000)`; cleanup on change/unmount.
- No new copy, colors, or layout; the span keeps `data-state` idle when empty so styling hooks are unchanged.

## EXECUTION_DAG
- T01 — Implement clear-on-section/query-change effect, `fromSave` refresh guard, 4000ms auto-clear. Deps: none. Owner: implementer A. vitest: save → chip visible; switch section → chip gone; external refresh → chip gone; timer clears. Done-when: specs pass.
- T02 — Playwright on fixture: save Appearance change → Saved appears; click Browser → gone; save again → wait 4.1s → gone. Deps: T01. Owner: implementer A. Done-when: verified end-to-end.

## VALIDATION
- Reproduce: `pnpm build && pnpm build:widgets`, then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"`, open http://127.0.0.1:4317 → Settings.
- Acceptance matrix: chip only on the saving section (T01/T02); cleared by section switch, search, external refresh, 4s timeout (T01); aria status does not re-announce (T02).
- Release gate: all rows verified.

## STATE
- Researched: stale chip confirmed across all 12 sections. Decided: clear on context change + 4s timeout. Pending: implementation. Next: T01.

## REFERENCES
- Settings.tsx l.105, l.142–143, l.190. QA pass 26 fixture walkthrough.
