# Plan — Diff History tab empty state styling + copy split (rev2)

## META
- Feature: Style the "Checkpoint history unavailable" state and split error vs. empty
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev2, 2026-11-22
- Baseline: `main` @ `97efd9ca`
- Status: planned, not implemented
- Source: frontend QA pass on fixture app (:4317) — Diff → History with no checkpoint owner shows a bare left-aligned text line that looks broken next to the centered empty states used elsewhere; the same line serves "no data" and "failed to load" indistinguishably

## OBJECTIVE
Make the History tab's no-owner state match the app empty-state pattern and use distinct copy for "nothing recorded yet" vs. "history could not be loaded". Success: the state reads as intentional, centered, and tells the user which situation they're in.

## REQUIREMENTS
- In scope: `apps/web/src/FileCheckpoints.tsx` ~L28 (`source==='History'` branch with no `owner`) and `file-checkpoints.css`.
- Out of scope: `CheckpointHistory` internals, other surfaces' empty states, #1561's "Current shows Recorded's copy" bug.
- Layout: replace the bare `<p className="file-checkpoints-note">` fallback with a centered empty-state block matching `usage-dialog-empty-state` structure:
  - Container: `display:grid; justify-items:center; gap:8px; padding:32px 16px; text-align:center; color:var(--muted)` (reuse class `.usage-dialog-empty-state` markup shape or extract a shared `.empty-block` — implementer uses the existing `.usage-dialog-empty-state` class names/values verbatim; no new tokens).
  - Title: `<strong>` `color:var(--text); font-size:14px; font-weight:600`.
  - Body: `<p>` `font-size:13px; line-height:1.5; max-width:40ch; margin:0; color:var(--muted)`.
- Copy (exact strings, no placeholders):
  - No owner / nothing recorded: title `No checkpoint history`; body `Snapshots of this file will appear here once a checkpoint is recorded.`
  - Load failure (when the adapter/history fetch rejects or returns an error): title `Checkpoint history unavailable`; body `The checkpoint history could not be loaded. Try reopening this surface.` The failure path must be detected, not inferred — implementer wires the error branch of the existing history load; if `CheckpointHistory` already surfaces load errors internally, this fallback stays empty-state only and the error case is rendered by the component, not this branch.
- Accessibility: the block is plain text inside the `role="tabpanel"`; no live region. Title is a `<strong>`, not a heading, matching other empty states.
- Motion: none (consistent with other empty states).

## REPO_MAP
- `apps/web/src/FileCheckpoints.tsx` L28: fallback `<p>` verified.
- `apps/web/src/file-checkpoints.css` L14, L49: `.file-checkpoints-note` rules (verified).
- `apps/web/src/usage-dialog.css` L30–L32: reference empty-state styling (verified).
- `apps/web/src/styles.css` L100–102: `.empty-state` centered pattern (verified).
- Error source: `CheckpointHistory` load path — discovery step (verify where history fetch failure is surfaced before writing the error branch).
- Tests: vitest + Playwright. Discovery: `rg -l "FileCheckpoints|CheckpointHistory" apps/web --glob '*.test.*' --glob '*.spec.*'`.

## DESIGN
- T01 swaps the fallback markup. T02 adds the error-copy branch only if discovery finds a reachable load-error state at this level; if errors are fully handled inside `CheckpointHistory`, ship T01 only and record the finding on the issue.

## EXECUTION_DAG
- T01 (owner: implementer): replace fallback `<p>` with the two-element empty-state block; use the exact class names/values from `.usage-dialog-empty-state` (apply that class directly if import order allows, else duplicate its three rules as `.file-checkpoints-empty`). Copy exactly as specified. Done-when: History tab in fixture shows centered title+body at 280–720px panel widths in both themes.
- T02 (owner: implementer): discover error path (`rg -n "catch|error" apps/web/src/FileCheckpoints.tsx apps/web/src/*checkpoint*`) and render the failure copy there if reachable; else close T02 with the recorded finding. Done-when: error branch exists or documented unreachable.
- T03 (owner: implementer): vitest render test for the no-owner branch asserting the two strings; Playwright snapshot optional. Done-when: `pnpm vitest run` passes.

## VALIDATION
- Fixture :4317, thread "Explore the component catalog" → Diff → History.
- Matrix: light/dark, 280px min width, 700px breakpoint, no history vs. loaded history.
- Acceptance: strings exact; centered layout; error/empty copy never swapped.

## STATE
- Researched/decided: layout, copy, structure. Unverified: whether a load-error state is reachable at this branch (T02 discovery).
- Next step: T01.

## REFERENCES
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1742 (canonical body = this plan). Related: #1561 (Current/Recorded copy mixup — separate fix).
