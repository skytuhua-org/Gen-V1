# Plan: Select popup wraps and clips option labels

## META
- Title: Select popup wraps and clips option labels
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-22
- Baseline: main @ bffae7ff
- Status: researched, not implemented
- Source: manual QA of the built fixture app (Agent inbox filter Select)

## OBJECTIVE
The shared `Select` popup sizes itself too narrowly, so option labels wrap mid-word (e.g. the Agent inbox filter shows "Needs y / ou", "Complet / ed" on two lines). Options must render on a single line, fully readable, in every Select in the app.

## REQUIREMENTS
- In scope: `packages/ui-shell/Select.tsx` popup width computation and `packages/ui-shell/controls.css` option-label rules.
- Out of scope: restyling the trigger button; changing option ordering or keyboard behavior.
- Accessibility: option labels must never be truncated or wrapped; selected option still shows the 14px check glyph.
- Motion: unchanged (existing Popover behavior).
- Compatibility: no API changes to `SelectOption`/`Select`.

## REPO_MAP
- `packages/ui-shell/Select.tsx` line 40: `popupWidth = Math.max(anchor.current?.offsetWidth ?? 0, Math.min(280, 64 + 7 * Math.max(0, ...options.map(option => option.label.length))))` — 7px/char underestimates the rendered 12px font and ignores popup padding and the 14px check icon, so labels wrap.
- `packages/ui-shell/controls.css` line 39: `.ui-control-option > span { flex: 1; min-width: 0; overflow-wrap: anywhere; }` — `anywhere` breaks words mid-word.
- `packages/ui-shell/controls.css` lines 22, 60, 67: option row is a flex row (`label span` + check icon), padding 8px 10px, min-height 34px, font-size 12px.
- Repro: Agent inbox header filter (`apps/web/src/InboxView.tsx` line 48, `Select aria-label="Inbox filter"`, options: All / Needs you / Unread / Completed).
- Tests: `packages/ui-shell` is covered by vitest + Playwright suites (no jsdom/Testing Library).

## DESIGN
Two coordinated fixes:
1. `packages/ui-shell/controls.css` line 39 — change `.ui-control-option > span` to `{ flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }`. Remove `overflow-wrap: anywhere` so labels never break mid-word. If a label exceeds the popup cap, it truncates with an ellipsis on one line.
2. `packages/ui-shell/Select.tsx` line 40 — replace the width estimate with `Math.max(anchor.current?.offsetWidth ?? 0, Math.min(280, 48 + Math.ceil(7.5 * Math.max(0, ...options.map(option => option.label.length)))))` where 48 = 20px horizontal padding + 14px check icon + 6px gap + 8px breathing room, and 7.5px/char covers the 12px UI font. With this change plus the nowrap rule, no option wraps at any width; long labels (>~33 chars) ellipsize inside the 280px cap.
- No state, API, or behavior changes; `title` tooltips are not added (labels are always fully visible or ellipsized identically to other list rows).

## EXECUTION_DAG
- T01 — controls.css option label rule (owner: implementer). Edit line 39 as above. Tests: visual check that "Needs you" and "Completed" render on one line. Done-when: rule updated, no other selector touched.
- T02 — Select.tsx popupWidth estimate (owner: implementer, depends on T01). Edit line 40 as above. Tests: unit-covered by Playwright select spec; verify popup ≥128px wide for the inbox filter options. Done-when: estimate updated.
- T03 — Verify (owner: implementer, depends on T02). Build `pnpm build:widgets && pnpm exec vite build` from repo root, open fixture host, open inbox filter: all four options on one line; keyboard ↑/↓ and Enter unchanged; repeat on a Select with a long label (settings font pickers) and confirm single-line ellipsis instead of wrap.

## VALIDATION
- Playwright: add/extend a Select spec asserting each option button's `scrollWidth <= clientWidth` for labels "All", "Needs you", "Unread", "Completed" and a 40-char label.
- Manual: fixture app inbox filter at 1024px and at single-column width (<860px); options single-line; check icon aligned right; popup never wider than 280px.
- Regression: open every in-app Select touched by Playwright suite (`tests/e2e`) — no wrap, no layout shift.
- Acceptance matrix: option labels single-line (T01); no mid-word breaks (T01); popup wide enough for longest option up to 280px cap (T02); long labels ellipsize (T01+T02); keyboard navigation unchanged (T03).

## STATE
- Researched and decided; implementation pending; no owners; no risks beyond global Select behavior change (mitigated by T03 sweep). Next step: implement T01+T02 on a branch off main.

## REFERENCES
- `packages/ui-shell/Select.tsx`, `packages/ui-shell/controls.css`, `apps/web/src/InboxView.tsx`
