# Plan: "Archived threads" row shows its empty state in place, not orphaned at the section bottom

## META
- Feature: Data & Recovery "Archived threads" empty-state placement and copy
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev1, 2026-11-23
- Baseline: main @ 65801227
- Canonical issue: this issue (rev1 body = this document)
- Status: planned, not implemented
- Source: QA pass 26 (fixture :4317): the "Archived threads" row shows a "0 archived" chip while a detached "No archived threads." sentence renders at the very bottom of the Data & Recovery section, after the "Pair a device" content — reads as a stray fragment, not the row's empty state.

## OBJECTIVE
When there are no archived threads, the Archived threads row itself communicates emptiness: the "0 archived" chip and the orphan "No archived threads." paragraph are replaced by a single in-place empty row directly under the "Archived threads" heading. When threads exist, the list renders exactly where the empty state would.

## REQUIREMENTS
- Scope: `apps/web/src/Settings.tsx` l.171 (`case 'archive'` row control `{data.counts.archivedThreads} archived`) and l.209 (`settings-records` block rendering list or `<p className="settings-empty">`); `settings.css`.
- Behavior:
  - Empty state renders immediately under the "Archived threads" row as a bordered empty card inside the same `settings-records` region: text `No archived threads.` centered, `color: var(--muted)`, font-size 13px, `padding:24px 16px`, `border:1px dashed var(--border)`, `border-radius:8px`, `margin-top:8px`.
  - The row's right-side control no longer shows the `0 archived` chip when the count is 0; when count > 0 it keeps `{count} archived`.
  - When count > 0 but none are in the navigation list, the empty card shows `No archived conversations are available in navigation.` (existing second-string retained); when the total exceeds the listed items, the existing `settings-empty` overflow note keeps rendering above the list (it is a caption, not an orphan).
  - `role="status"` not required on the card (static content); the restore buttons are unchanged.
- States: empty-0 (card + no chip); empty-but-count>0 (card with navigation-unavailable copy + chip); populated (list + chip + optional overflow caption).
- Reduced motion: none added.
- Out of scope: restoring threads, archive list virtualization.

## REPO_MAP
- `apps/web/src/Settings.tsx` l.168–173 `case 'archive'` row; l.209 `settings-records` block: `{data.archivedThreads?.length ? data.archivedThreads.map(...) : <p className="settings-empty">No archived threads.</p>}` — the div is rendered after all rows, so the empty paragraph lands below unrelated content ("Pair a device" rows render in the same `settings-records` flow).
- `settings.css`: `.settings-empty` current styling; `.settings-records` layout (verify in T01 whether records block is section-scoped or flows after later rows — the fix moves the empty card next to its row either way).

## DESIGN
- Restructure: give the archive row its own records region. Render the empty card (or list) inside a `div` placed directly after the "Archived threads" `settings-row`, before subsequent rows. Implementation: move the archived-threads render branch so `matches('archive')` emits `<section className="settings-row">…` + `<div className="settings-records">` adjacent, ahead of paired-devices content rather than inside the trailing shared records container.
- New card markup: `<div className="settings-empty-card"><p>No archived threads.</p></div>` with CSS above (reuse dashed-border pattern from `.file-checkpoints-empty`).
- Keep the `settings-empty` class on the inner `<p>` for muted styling if it already supplies color/size; otherwise the card class supplies all rules.

## EXECUTION_DAG
- T01 — Verify `settings-records` DOM order vs. row order and record exact current DOM on the issue. Deps: none. Owner: implementer A. Done-when: DOM order posted.
- T02 — Move archive empty/list block adjacent to its row; add `settings-empty-card` CSS; drop `0 archived` chip when count is 0; keep populated + overflow behaviors. Deps: T01. Owner: implementer A. vitest render assertions for all three states. Done-when: specs pass.
- T03 — Playwright on fixture: Data & Recovery shows the card directly under the row; nothing orphaned after "Pair a device". Deps: T02. Done-when: verified.

## VALIDATION
- Reproduce: `pnpm build && pnpm build:widgets`, then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"`, open http://127.0.0.1:4317 → Settings → Data & Recovery.
- Acceptance matrix: card adjacent to row (T02/T03); chip hidden at 0 (T02); navigation-unavailable copy retained (T02); populated list unchanged (T03).
- Release gate: all rows verified; no orphan text anywhere in the section.

## STATE
- Researched: orphan empty state confirmed live. Decided: in-place dashed empty card. Pending: DOM-order verification (T01). Next: T01.

## REFERENCES
- Settings.tsx l.168–173, l.209. QA pass 26 fixture walkthrough.
