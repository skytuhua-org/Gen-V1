[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1912.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1912](https://github.com/skytuhua-org/Gen-V1/issues/1912). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Reserved-shortcut capture repair is open in [#1917](https://github.com/skytuhua-org/Gen-V1/pull/1917). Browser/OS interception, valid overrides and final integration remain required.

### Reviewed implementation references

- [PR #1917](https://github.com/skytuhua-org/Gen-V1/pull/1917): open; head `6ba513c7d99d5af760a145dad192877c0acf9166`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7104418711](https://github.com/skytuhua-org/Gen-V1/issues/1912#issuecomment-7104418711). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

Plan file: https://github.com/skytuhua-org/Gen-V1/blob/a4e97b713459f10283fb24c8025ebc0538664cff/docs/agent-plans/ux-shortcut-reserved-chords.md

# UX: Shortcut rebinding accepts browser/OS-reserved chords — Ctrl+W closes the app mid-capture, saved F5 is dead

## META
- Repo: skytuhua-org/Gen-V1 — baseline `main` @1cbd02cd (docs-only plan, rev 1, 2026-11-23)
- Found during interactive QA of the built fixture app on :4317 (pass 23, keyboard shortcuts round 2)
- Related: #1704 (capture validation, conflicts, reset) — that plan's accept-list permits F1–F12 and never addresses chords the browser intercepts before the page. This plan adds a reserved-chord class on top of, not instead of, #1704.
- Status: plan only, not implemented

## OBJECTIVE
`ShortcutInput` (`apps/web/src/Settings.tsx:89`) captures any keydown and saves it as a preference chord. Chords the browser never delivers to the page are saved silently and can never fire:

**Observed bugs (repro'd live on :4317, Chromium):**
1. Focus the "Search threads" capture input and press Ctrl+W — the browser closes the app tab before the page sees the event. Same for Ctrl+T (new tab), Ctrl+N/Ctrl+Shift+N (new window). The user loses the whole app while merely trying to bind a key.
2. Dispatching/capturing F5 saved successfully — the input and the cheat sheet then read `F5` — yet a real F5 reloads the page; the binding is dead forever. Same class: F11, F12, Ctrl+R, Ctrl+Shift+R, Ctrl+L, Ctrl+D, Ctrl+Tab, Ctrl+1–9, Alt+Home, Alt+Left/Right (Linux/Windows; on macOS the Cmd equivalents).

## REQUIREMENTS
- In scope: `ShortcutInput` in `apps/web/src/Settings.tsx`; a shared `RESERVED_CHORDS` table in `apps/web/src/keyboard-bindings.ts`; the row-level inline error pattern already specified by #1704 (11px `--danger` text under the input, shown 4 s, nothing saved).
- Out of scope: the editable-target guard, conflict confirm bar and Reset button (owned by #1704); desktop-native accelerators (the Windows app registers real global accelerators and may honor chords the browser cannot — the reserved check applies to the browser build only, and the desktop path keeps its existing behavior).
- A chord the current host cannot deliver must be rejected at capture with a reason, never saved.
- Compact UI; reuse Settings row/notice styles and `--danger`/`--muted`/`--border` tokens. No new type styles.

## REPO_MAP (verified)
- `ShortcutInput`: `apps/web/src/Settings.tsx:88-90` — `readOnly` input, `onKeyDown` builds `Ctrl+Meta+Alt+Shift+key` and calls `save(action, chord)` immediately; no validation.
- `matchesShortcut`: `packages/ui-shell/shell-layout.ts:23-36` — string matcher; knows nothing about deliverability.
- Registry: `apps/web/src/keyboard-bindings.ts` — `KEYBOARD_BINDINGS`, `bindingChords`, `shortcutKeys` (glyph formatting) — home for the reserved table.
- Fixture repro: review host serves built UI at `http://127.0.0.1:4317` (see VALIDATION).

## DESIGN
1. **Reserved table** in `apps/web/src/keyboard-bindings.ts`:
   `export const RESERVED_CHORDS: readonly string[] = ['Ctrl+W','Ctrl+T','Ctrl+N','Ctrl+Shift+N','Ctrl+Shift+W','Ctrl+R','Ctrl+Shift+R','Ctrl+L','Ctrl+D','Ctrl+Tab','Ctrl+Shift+Tab','F5','F11','F12','Alt+Home','Alt+ArrowLeft','Alt+ArrowRight','Meta+W','Meta+T','Meta+N','Meta+R','Meta+Shift+R','Meta+L','Meta+Q','Meta+Tab','Meta+ArrowLeft','Meta+ArrowRight']` plus the range `Ctrl+1`–`Ctrl+9` and `Meta+1`–`Meta+9` generated (`Array.from({length:9},(_,i)=>['Ctrl','Meta'].map(m=>`${m}+${i+1}`)).flat()`).
   Export `isReservedChord(chord: string): boolean` — normalize via the same lowercased `part.trim()` split `matchesShortcut` uses, sort modifiers, join `Ctrl+Alt+Shift+Meta` order, compare case-insensitively.
2. **Capture-time rejection in `ShortcutInput`:** after building the chord string and before `save`, call `isReservedChord(chord)`; when true, do not save and render the inline error under the input: `Chrome keeps that shortcut — pick another.` (the literal string; 11px `--danger`, row reserve 14px min-height so layout does not jump; cleared on next keydown or after 4 s). The input keeps focus and stays in capture mode.
3. **Cheat-sheet hygiene:** no change to `KeyboardReference` — a reserved chord can never be stored, so nothing new to render.
4. **Note copy for the section intro:** change the input `title`/`aria-describedby` text from `Focus and press a shortcut.` to `Focus and press a shortcut. Browser-reserved keys can't be used.` (sentence added, same 11px `--muted` styling).

## EXECUTION_DAG
- T01 Add `RESERVED_CHORDS` + `isReservedChord` to `apps/web/src/keyboard-bindings.ts` with vitest coverage in `tests/keyboard-bindings.test.ts` (each listed chord true; `Ctrl+K`, `Alt+Enter`, `Shift+F5` false). Deps: none. Owner: single implementer. Handoff: →T02. Done-when: exported helper, matrix green.
- T02 Wire rejection + inline error + intro copy into `ShortcutInput`. Deps: T01. Owner: same implementer. Handoff: →VALIDATION/REVIEW release. Done-when: every reserved chord rejected with the specified copy and nothing persisted.

## VALIDATION
- Fixture command (run in repo root): `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` after `pnpm build`, then open `http://127.0.0.1:4317` → Settings → Keyboard Shortcuts.
- Focus "Search threads", press F5 → input keeps `Ctrl+K`, error text `Chrome keeps that shortcut — pick another.`; press `Ctrl+K` → saves. Repeat for `Ctrl+W` (expect the same error; the tab must not close once rejection lands — verification: the keydown is preventDefaulted in the input only when the browser delivers it; Ctrl+W itself never reaches the page, so the check is that attempted capture of a *delivered* reserved key like F5 rejects).
- `pnpm typecheck`, `pnpm lint`, vitest `tests/keyboard-bindings.test.ts`.
- Reduced-motion: no animation is added; the error text appears instantly (0 ms), consistent with existing settings notices.

## Historical STATE
Researched + designed; nothing implemented. Next: implementer claims the issue, executes T01–T02.

## REFERENCES
- Repro in QA pass 23 (:4317); `ShortcutInput` `apps/web/src/Settings.tsx:88-90`; #1704 reserved-chord gap (`docs/agent-plans/ux-shortcut-rebinding-guards.md`).
