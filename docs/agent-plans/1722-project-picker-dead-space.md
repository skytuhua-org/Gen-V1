# UI: Select project dialog wastes ~230px of empty space

## META
- Feature: Fit project picker modal height to content
- Repo: skytuhua-org/Gen-V1 · Plan rev 1, 2026-11-22
- Baseline: main @ bffae7ff03a16dcc5b9c10abd25b956564059ec2
- Provenance: QA pass 12, fixture :4317
- Status: planning complete, implementation NOT started

## OBJECTIVE
`.ui-modal.project-picker` is `height:min(520px, calc(100dvh - 58px))` — a fixed floor. With two rows (No project + one project), ~230px of empty `.project-picker-list` sits between the options and the footer. Success: the dialog shrinks to fit its rows; it still grows to 520px when the list is long and scrolls.

## REQUIREMENTS
- Empty-ish lists: modal height = header + search + rows + footer + padding, no blank gap. Each `.project-picker-option` row stays min-height 32px.
- Long lists: unchanged — the list scrolls within a max height of `min(520px, calc(100dvh - 58px))`.
- The color-picker sub-panel (swatch grid) unaffected.
- Keyboard, search filtering, aria roles unchanged; list keeps `min-height:32px` so 0-result state ("No projects found") still renders at one row height.
- Motion: none; height change may animate with `height` transition `var(--ui-motion-panel-enter)` `var(--ui-ease-enter)` — the simplest correct change is no animation; reduced-motion unaffected.
- Out of scope: selection marker/title ambiguity (covered by #1136's plan).

## REPO_MAP
- `apps/web/src/project-picker.css` — `.ui-modal.project-picker { height: min(520px, calc(100dvh - 58px)) }` (line ~1) and the `html[data-native-titlebar]` override (line ~9); `.project-picker-list { flex:1 1 auto; min-height:32px }` (line 13).
- `apps/web/src/ProjectPicker.tsx` — dialog markup; `.project-picker-footer`, `.project-picker-hint`.
- Verified: 520px modal rendered with ~290px of dead list area at 2 rows.

## DESIGN SPEC (exact values)
- `.ui-modal.project-picker { height:auto; max-height:min(520px, calc(100dvh - 58px)); }` — both rules (default and `data-native-titlebar` variant) get the same change.
- `.project-picker-list` keeps `flex:1 1 auto` and adds `max-height:384px` (= 12 rows × 32px) so the modal's chrome always fits inside the 520px cap: header (24px title + 16px margin) + search (32px) + list + footer (32px) + padding (2×22px) ≈ 148px chrome; 520 − 148 ≈ 372, round to 384 (12 rows).
- When the content is the color editor (`.project-picker-colors`), the same `max-height` applies; its swatch grid already scrolls internally if needed — verify it does not double-scroll; if it does, let `.project-picker-colors` consume the list's `flex:1` and give it `overflow-y:auto` directly.
- All other values unchanged (row 32px, gap 4px, radius 4px, footer hint 12px `var(--muted)`).

## EXECUTION_DAG
- T01 (owner A): edit the two `height:` rules + `.project-picker-list`/`colors` overflow in `project-picker.css`. Done-when: modal hugs 2-row content and caps at long lists.
- T02 (owner A): Playwright/vitest measuring `.ui-modal.project-picker` clientHeight at 0, 2 and 40 rows. Done-when: ≤ chrome+rows+4px at small counts, ≤520px at large.

## VALIDATION
- vitest/Playwright PASS; `pnpm lint` PASS.
- Manual: counts {0 (No projects found), 2, 12, 40} at viewport heights 900px and 500px; colors editor open; search filtering shrinking the list live.
- Acceptance: each requirement → T01/T02 checks above.

## STATE
- Verified live. Risk: the `data-native-titlebar` desktop build variant must get the identical rule — do not fix only the default selector.
- Next: T01.

## REFERENCES
- Adjacent: #1136 plan (markers/title) — different defect, no overlap.
