# UI: Project picker color popover — keep "Use automatic color" reachable in error state

## META
- Feature: fix clipped submit/reset controls in the project color popover
- Repo: skytuhua-org/Gen-V1 · Plan rev 1, 2026-11-23
- Baseline: main @ 65801227 (verify at implementation time)
- Provenance: QA pass 27 (second round: onboarding/welcome/empty projects), fixture :4317
- Status: planning complete, implementation NOT started
- Fixture repro: `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` then `pnpm build`, open http://127.0.0.1:4317 → Select project (sidebar footer) → arrow to "No project" → Color → pick an invalid hex.

## OBJECTIVE
The color popover renders at a fixed 280×230px (`<Popover width={280} height={230}>` in `apps/web/src/ProjectPicker.tsx:106`). When the user enters a color that fails validation, `colorError` is rendered as a new block inside the same fixed box, pushing "Use automatic color" (and the reset/apply row) below the bottom edge — reachable only by an unadvertised scroll inside `.ui-control-popup`. Success: every control in the popover stays inside the visible 280×230 region in both normal and error states; no scrollbar needed for the primary actions.

## REQUIREMENTS
- Error layout: `colorError` renders as an inline chip pinned to the bottom-left of the popover body, `font-size:11px; line-height:14px; color:var(--danger)` with a `role="alert"`, positioned so the reset row never moves: give the popover body `display:flex; flex-direction:column` and make the swatch grid `flex:1; min-height:0` — on error the grid scrolls, not the footer.
- Footer row ("Use automatic color", reset, Apply) is a `flex:none` footer pinned at the popover bottom with `padding-top:8px; border-top:1px solid var(--border)` only when the error is present (no border otherwise).
- Copy unchanged: existing error text verbatim; "Use automatic color" label unchanged.
- Error clears on: any swatch/hex edit, successful apply, popover close (current behavior preserved; error already clears — verify at implementation time).
- Keyboard: Tab order unchanged (grid → footer); the inline chip must not steal focus; Escape still closes via the existing popover handler.
- A11y: `role="alert"` announces the error once; input gets `aria-invalid="true"` and `aria-describedby` pointing at the chip's id while visible.
- Reduced motion: no motion involved.
- Out of scope: color validation rules themselves, custom-hex autocomplete.

## REPO_MAP
- `apps/web/src/ProjectPicker.tsx` (~line 90–110): `{showColor && <Popover ... width={280} height={230}>}` — `colorError` currently renders as a plain block after the color form inside `.ui-control-popup`.
- `packages/ui-shell/controls.css` `.ui-control-popup` (lines 3–22): fixed box, scrollable via `overflow` + 6px scrollbar — reason the clipped content technically scrolls.
- `apps/web/src/project-picker.css`: `.project-picker-*` styles including the color form/footer — new rules live here.

## DESIGN
ProjectPicker.tsx (single owner file):
```tsx
<Popover ... width={280} height={230}>
  <div className="project-picker-colors">
    <div className="project-picker-color-grid">{/* existing swatch grid + hex input */}</div>
    {colorError && <p role="alert" id="project-color-error" className="project-picker-color-error">{colorError}</p>}
    <div className="project-picker-color-footer" data-has-error={Boolean(colorError)||undefined}>
      {/* existing Use automatic color / reset / Apply controls */}
    </div>
  </div>
</Popover>
```
project-picker.css:
```css
.project-picker-colors{display:flex;flex-direction:column;height:100%;box-sizing:border-box}
.project-picker-color-grid{flex:1;min-height:0;overflow:auto}
.project-picker-color-error{margin:6px 0 0;font-size:11px;line-height:14px;color:var(--danger)}
.project-picker-color-footer{flex:none;margin-top:8px}
.project-picker-color-footer[data-has-error]{padding-top:8px;border-top:1px solid var(--border)}
```
Hex input gains `aria-invalid={Boolean(colorError)}` and `aria-describedby={colorError?'project-color-error':undefined}`.

## EXECUTION_DAG
- T01 (owner A): ProjectPicker.tsx markup move + aria wiring + four CSS rules. Deps: none. Done-when: error state fits inside 280×230 with footer visible; `pnpm typecheck` PASS.
- T02 (owner A, dep T01): Playwright spec asserting, after an invalid hex: footer row bounding box is within the popover's, `.project-picker-color-grid` scrolls (scrollHeight > clientHeight only on error), `role=alert` present, `aria-invalid` true. Done-when: spec green on fixture.
- T03 (owner A, dep T02): `pnpm lint` clean; record outputs.

## VALIDATION
- `pnpm typecheck`, `pnpm lint`, Playwright spec on fixture :4317 (command in META).
- Manual: invalid hex → footer visible, chip pinned; edit clears chip and restores no-border footer; Tab order; Escape; 360px viewport.
- Acceptance matrix: each requirement ↔ T01/T02 checks; executed vs planned recorded at checkpoint.

## STATE
- Reproduced live on :4317 2026-11-23 (recording `qa-pass27-welcome`): error pushed "Use automatic color" below the popover edge. No implementation.
- Risk: Popover positions by fixed height; content must never exceed it — the flex layout enforces that. Next: T01.

## REFERENCES
- Issue filed by QA pass 27; unrelated to #1722 (modal height) — distinct defect.
