[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1743.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1743](https://github.com/skytuhua-org/Gen-V1/issues/1743). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Panel-error spacing is retained in open [#1819](https://github.com/skytuhua-org/Gen-V1/pull/1819); [#1812](https://github.com/skytuhua-org/Gen-V1/pull/1812)/#1828 are closed duplicates. Prior eight-case browser evidence does not establish integration while the retained PR is unmerged.

### Reviewed implementation references

- [PR #1819](https://github.com/skytuhua-org/Gen-V1/pull/1819): open; head `9ea88e689da5b13db143177c2974347e1969e21c`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7110202931](https://github.com/skytuhua-org/Gen-V1/issues/1743#issuecomment-7110202931). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

# Plan — Pad error text inside the workspace panel (rev2)

## META
- Feature: Inset/padding for `.error-text` rendered inside the workspace right panel
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev2, 2026-11-22
- Baseline: `main` @ `97efd9ca`
- Status: planned, not implemented
- Source: frontend QA pass on fixture app (:4317) — the Files surface shows "File access check failed — the folder could not be opened safely for this action" flush against the panel's left/right edges, clipped by the panel boundary

## OBJECTIVE
Error text inside the workspace panel must have the same breathing room as every other panel element instead of touching the edges. Success: the message wraps inside a padded block, fully readable at the panel's minimum width (280px) and in both themes.

## REQUIREMENTS
- In scope: `.error-text` elements rendered directly inside `.workspace-panel-content` and as direct children of `.workspace-right` (covers `handoffError` at `WorkspacePanel.tsx` L78 and surface-level errors such as the Files access error).
- Out of scope: the error copy itself (message text stays exactly as thrown), toast errors, `.workspace-error` banners (already padded), errors inside canvas panels (already padded by `workspace-canvas.css` L34).
- CSS (exact values, mirroring `workspace-tools.css` L5 which already pads canvas errors):
  - Selector: `.workspace-right > .error-text, .workspace-panel-content > .error-text`
  - `padding: 8px 12px; line-height: 1.5;`
  - Inherits existing `.error-text` base: `color:var(--danger); font-size:12px; overflow-wrap:anywhere` (styles.css L46) — unchanged.
  - `margin: 0` to neutralize stray alignment.
- Add the rule to `apps/web/src/workspace-tools.css` next to the existing `.canvas-panel` error rule (same file, same pattern — no new file).
- No layout shift elsewhere: padding applies only when the element is a direct child; nested `.error-text` inside toolbars/dialogs unaffected.
- Motion: none. States: none beyond existing.

## REPO_MAP
- `apps/web/src/WorkspacePanel.tsx` L78: `{handoffError&&<p role="status" className="error-text">…}` verified — direct child of `.workspace-right`.
- `apps/web/src/styles.css` L46: `.error-text` base, no padding (verified).
- `apps/web/src/styles.css` L163–166: `.workspace-error` padded banner pattern (verified).
- `apps/web/src/workspace-tools.css` L5: precedent rule padding `.canvas-panel` errors `8px 12px` (verified).
- Error source: `packages/core/file-access.ts` L14 / `linux-path-guard.ts` L11 — message is thrown as `HarnessError('CAPABILITY_DENIED', …)`; display-only fix, message unchanged.
- Tests: vitest + Playwright. Discovery: `rg -l "error-text|workspace-error" apps/web --glob '*.test.*' --glob '*.spec.*'`.

## DESIGN
- Single CSS rule; no markup change. If the Files surface's error renders inside a deeper wrapper (not a direct child), the implementer adds the intermediate container to the selector list — discovery step: reproduce the error in the fixture Files surface and confirm the DOM path before writing the selector.

## EXECUTION_DAG
- T01 (owner: implementer): reproduce the Files access error in fixture, confirm the error element's DOM path; add the padding rule (with the discovered selector) in `workspace-tools.css`. Done-when: error fully inside panel bounds at 280px/520px/720px widths, both themes.
- T02 (owner: implementer): Playwright assertion or CSS unit check that `.workspace-right > .error-text` computed `padding-left` is `12px`. Done-when: check passes.

## VALIDATION
- Fixture :4317 → open Files surface on a scenario that throws CAPABILITY_DENIED (e.g. revoked folder grant).
- Matrix: 280px min width, 700px viewport breakpoint, dark/light, long unbroken error strings (overflow-wrap).
- Acceptance: no glyph touches the panel edge; wrap behavior unchanged.

## Historical STATE
- Researched/decided: values + files. Unverified: exact DOM depth of the Files-surface error element (T01 discovery).
- Next step: T01.

## REFERENCES
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1743 (canonical body = this plan). Related: #1560 covers the red "Connect this project to a local folder." dead-end copy — different issue, that one is about copy/UX, this one about layout.
