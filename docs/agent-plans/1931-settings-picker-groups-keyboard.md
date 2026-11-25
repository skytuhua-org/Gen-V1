# Plan: Settings button-set pickers get radio-group semantics and arrow-key navigation

## META
- Feature: Keyboard + semantics for exclusive-choice button groups in Settings
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev1, 2026-11-23
- Baseline: main @ 65801227
- Canonical issue: this issue (rev1 body = this document)
- Status: planned, not implemented
- Source: QA pass 26 (fixture :4317): every option in a picker group is a separate Tab stop — the Models & Accounts provider nav alone costs 11 Tab presses; Appearance's accent row adds 8 more, and each per-project color group again. No group offers arrow-key movement, violating the APG radio-group pattern for single-select controls.

## OBJECTIVE
Each exclusive-choice picker group behaves as one control: one Tab stop, arrow keys move selection, `role="radiogroup"` + `role="radio"` semantics, `aria-checked` on the selected option. Non-exclusive toggle groups keep current behavior.

## REQUIREMENTS
- Scope:
  - `apps/web/src/Connections.tsx`: `.connection-providers` nav (≈l.127) — buttons with `aria-pressed` selecting the visible provider.
  - `apps/web/src/AppearanceSettings.tsx`: accent swatch group (`role="group"`, `aria-pressed` buttons) and each per-project color swatch group (same markup in the project-colors loop).
  - `apps/web/src/settings.css` (focus + checked visuals if needed).
- Behavior per group:
  - Container: `role="radiogroup"` with `aria-label` equal to the current group label (`Providers`, `Accent`, project name for per-project groups — reuse the existing visible label text verbatim).
  - Each option: `role="radio"`, `aria-checked="true|false"`, `tabIndex` 0 on the checked option, -1 otherwise (roving tabindex). `aria-pressed` is removed.
  - Keys: `ArrowRight`/`ArrowDown` next option (wraps), `ArrowLeft`/`ArrowUp` previous (wraps), `Home` first, `End` last — each `preventDefault()`, moves focus and applies selection immediately (automatic activation), Space/Enter also select the focused option.
  - Selection applies the existing click handler — no change to what a choice does.
- A11y: screen reader announces `radio, N of M, checked`; focus ring uses the existing `:focus-visible` style (verify token in T01).
- States: unchecked (default swatch/button); checked (existing selected visuals unchanged); focused-checked; disabled options keep `disabled` and are skipped by arrow keys.
- Reduced motion: none added.
- Out of scope: multi-select groups, the settings section nav (vertical listbox — separate pattern), the workspace tab strip (already handled by #1741).

## REPO_MAP
- `apps/web/src/Connections.tsx` ~l.127: `<nav className="connection-providers">` mapping providers to `<button aria-pressed=...>`.
- `apps/web/src/AppearanceSettings.tsx`: `APPEARANCE_FIELDS` accent swatch `role="group"` block and the project-colors per-project swatch loop (same button pattern).
- Tests: vitest keyboard-handler specs + Playwright tab-order count (paths confirmed in T01).

## DESIGN
- Extract a small shared component `PickerGroup` in `apps/web/src/` (new file `PickerGroup.tsx`): props `{label: string, options: {id:string, label:ReactNode, disabled?:boolean, content:ReactNode}[], value: string, onChange(id), className?: string}` implementing the radiogroup + roving tabindex + key handling above; renders `<div role="radiogroup" aria-label=...>` wrapping `<button role="radio" type="button" aria-checked tabIndex>`.
- Migrate the three call sites to `PickerGroup`, preserving each site's existing inner content and classes (provider buttons keep their classes; swatches keep swatch markup) — visuals pixel-identical.
- If a shared abstraction fights the three sites' markup differences, implement the same roving-tabindex handler inline per site instead — the decision is the implementer's ONLY on structure, never on behavior, which is fixed above.

## EXECUTION_DAG
- T01 — Confirm group label sources and the focus-ring token; post findings. Deps: none. Owner: implementer A. Done-when: facts posted.
- T02 — Implement `PickerGroup` + migrate Connections provider nav. Deps: T01. Owner: implementer A. vitest: arrows wrap, Home/End, roving tabindex, aria-checked. Done-when: specs pass.
- T03 — Migrate accent + per-project swatch groups. Deps: T02. Owner: implementer A. vitest: same handler assertions via the shared component. Done-when: specs pass.
- T04 — Playwright on fixture: Tab through Models & Accounts = 1 stop; arrow keys move selection; same on Appearance. Deps: T03. Done-when: verified.

## VALIDATION
- Reproduce: `pnpm build && pnpm build:widgets`, then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"`, open http://127.0.0.1:4317 → Settings → Models & Accounts / Appearance.
- Acceptance matrix: one Tab stop per group (T04); arrow/Home/End with wrap (T02); radiogroup/radio/aria-checked (T02); identical visuals (T04 screenshot diff vs baseline).
- Release gate: all rows verified.

## STATE
- Researched: 11-stop provider nav and per-group tab stops confirmed live. Decided: radiogroup + roving tabindex + automatic activation. Pending: label-source check (T01). Next: T01.

## REFERENCES
- Connections.tsx ~l.127; AppearanceSettings.tsx accent + project-color groups. APG radio-group pattern. QA pass 26 fixture walkthrough.
