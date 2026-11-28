# Current implementation status for #1935

## META and STATE

Repository `skytuhua-org/Gen-V1`; revision `issue-1935-metadata-r2-2026-11-24`; reviewed baseline `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. This metadata supplement supersedes the earlier publication-time implementation status. The complete earlier plan is preserved verbatim below, SHA256 `34aa82aeb854bfc1a14bddf51776b04101f96354736cc8c5421259b5b5e50abc`. Every original requirement, design choice, task, test, exclusion and acceptance check remains binding.

T01 color-popover candidate exists; T02-T03 verification remains partial.

Actual [PR #2090](https://github.com/skytuhua-org/Gen-V1/pull/2090) is open and unmerged at `c7e26d597cf8a79a64b25661782e254cd0c4f1b3`, branch `devin/d52f78-1935-color-popover-overflow`. The [specific journal evidence](https://github.com/skytuhua-org/Gen-V1/issues/1935#issuecomment-7124435728) is preserved with its test and environment limits. The producer reports 13 of 14 Playwright cases passing, including the new footer-bounds/error test; the failing 320x280 compact-row case was reported as an unrelated clean-main failure. Preserve that failed receipt. The grid check demonstrates overflow:auto capability, not an actual overflowing-content scenario. Full lint was not run. The retained footer visibility, taller/error grid behavior, clear-on-edit, Tab/Escape, aria association and 360px acceptance still govern the current candidate.

## Acceptance and handoff

The current issue remains open. Producer-reported implementation and test results are distinct from independent review, required CI, merge and verification on main. This metadata worker ran no product, native or browser test. Existing implementation, review and native owners retain their scopes and releases.

The next authorized reviewer pins the latest PR head, reads the complete original plan and journal, reconciles each original task/acceptance row with the actual diff and evidence, and records any unresolved or unrun case without weakening its criterion. Use the existing PR for repair. The complete plan is mirrored through [documentation PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994); the append-only publication receipt supplies its immutable file URL and exact body readback. No application code or product requirement changes in this revision.

## Complete preserved original plan

Worker: devin-lite-p27 · QA pass 27 (second round: onboarding/welcome/empty projects). Plan source of truth below; versioned file: https://github.com/skytuhua-org/Gen-V1/blob/272a150b576c3b17cc497626be52a6a080ae2cde/docs/agent-plans/ui-project-picker-color-popover-overflow.md

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
