# Plan: Agent inbox — failed items get failure copy in the reader footer

## META
- Title: UI: Agent inbox reader footer tells users to "read the result" on failed items
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-23
- Baseline: main @ 65801227c0a5bc1cde9c3afc7eb889c3ceee0b70
- Issue: this issue (filed with this plan)
- Status: researched, not implemented
- Source: manual QA of the built fixture app on 127.0.0.1:4317 plus source audit of `apps/web/src/InboxView.tsx`

## OBJECTIVE
In the agent inbox reader, a failed run ("Needs attention" label, warning-triangle lead icon) shows the footer helper copy "Read the result and its supporting evidence." — copy written for successful results. A user who selected a failure is told to read a result that does not exist; the footer must describe the failure and the recovery action instead.

## REQUIREMENTS
- In scope: the footer helper line of `InboxView.tsx` (`<small>` inside `.agent-inbox-answer`, currently line 51).
- Out of scope: the row label, the `inbox-message-meta` state pill, notifications/toasts, any CSS or layout, the "Open conversation" button.
- Copy contract (exact strings, no deviation):
  - `selected.actionable` → `Answer or review the current request there.` (unchanged)
  - `selected.state === 'resolved'` → `This request has already been resolved.` (unchanged)
  - `selected.state === 'failed'` → `Read what went wrong, then open the conversation to retry.`
  - every other state (`completed`, `needs-input`, `needs-review`) → `Read the result and its supporting evidence.` (unchanged)
- States: the copy updates whenever `selected` changes item or state; no loading/empty state exists because the footer renders only when `selected` is set.
- Keyboard/a11y: unchanged. The line is plain text inside `.agent-inbox-answer`; no live region, no focusable element, no tab-order change.
- Motion: none (no transition or animation added).
- Visual: unchanged — the `<small>` keeps its current styles; only the string changes.

## REPO_MAP
- `apps/web/src/InboxView.tsx:51` — footer: `<small>{selected.actionable?'Answer or review the current request there.':selected.state==='resolved'?'This request has already been resolved.':'Read the result and its supporting evidence.'}</small>`. The ternary has no `failed` branch, so `failed` falls through to the success copy.
- `apps/web/src/InboxView.tsx:12` — `labels` maps `failed:'Needs attention'`; the same header shows a `TriangleAlert` lead icon for `state==='failed'` (line 53 row render), so the copy is the only place the failure is mislabeled.
- `packages/core/attention.ts` — `state:'failed'` is a first-class attention state; `needsYou` includes it (`InboxView.tsx` filter logic), so failed items are prominent in the "Needs you" filter.

## DESIGN
One-expression change in the footer `<small>`, adding a `failed` branch between the `resolved` branch and the fallthrough:

```tsx
<small>{selected.actionable
  ? 'Answer or review the current request there.'
  : selected.state === 'resolved'
    ? 'This request has already been resolved.'
    : selected.state === 'failed'
      ? 'Read what went wrong, then open the conversation to retry.'
      : 'Read the result and its supporting evidence.'}</small>
```

Rationale: failed items already read "Needs attention" in the meta row and carry the warning icon; the new sentence names the content (what went wrong) and the next action (open the conversation to retry), matching the "Open conversation" button it sits under.

## EXECUTION_DAG
- T01 — Add the `failed` branch to the footer copy expression in `apps/web/src/InboxView.tsx`. Owner: implementer. Depends: none. Files: `InboxView.tsx` line 51 only. Done-when: a `state:'failed'` item renders `Read what went wrong, then open the conversation to retry.`; the other three strings render unchanged.
- T02 — Unit coverage in the existing InboxView test file (`apps/web/src/InboxView.test.tsx` or the closest existing spec for this component; if none exists, add `apps/web/src/InboxView.test.tsx`). Owner: implementer. Depends: T01. Cases: failed item shows the new string; completed item still shows `Read the result and its supporting evidence.`; actionable item still shows `Answer or review the current request there.` Done-when: tests pass.

## VALIDATION
- Fixture repro: `cd ~/repos/Gen-V1 && node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` then open `http://127.0.0.1:4317`, Workspace → Agent inbox, select the "Add workspaces" (failed) item: footer reads `Read what went wrong, then open the conversation to retry.`
- Unit: per T02.
- Regression: completed and needs-review items unchanged; no visual diff.
- Acceptance matrix: T01 copy correct per state; T02 tests green.

## STATE
- Researched and decided; pending implementation. Next: T01.

## REFERENCES
- `apps/web/src/InboxView.tsx:51` (footer copy), `InboxView.tsx:12` (state labels), `packages/core/attention.ts` (attention states)
