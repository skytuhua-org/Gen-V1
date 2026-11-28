[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1562.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1562](https://github.com/skytuhua-org/Gen-V1/issues/1562). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

The note-create form repair exists in [#1569](https://github.com/skytuhua-org/Gen-V1/pull/1569). Actual implementation is in TaskMemory.tsx/MemoryNote, not the originally guessed WorkspacePanelBodies location; browser verification and landing remain distinct.

### Reviewed implementation references

- [PR #1569](https://github.com/skytuhua-org/Gen-V1/pull/1569): open; head `68645c6c952470932cbddc316fe082d7b9a7da26`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7078501497](https://github.com/skytuhua-org/Gen-V1/issues/1562#issuecomment-7078501497). Earlier claims, tests, review findings and releases remain in the append-only journal.

### Verified repository location

The implementation in PR #1569 uses `apps/web/src/TaskMemory.tsx` and its `MemoryNote` flow. Treat the original `WorkspacePanelBodies` location as a planning-time discovery lead, not the edit target. Preserve the accepted create-success close, error retention and subsequent-entry behavior.

---

# Plan: Collapse the Notes "add note" form after a note is added

## META
- Feature: Notes surface add-form behavior
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-21 (design fully specified — implementer makes no design choices)
- Baseline: main @ 4ca1134ae1e4f354064457cb5664b545712da4a9
- Status: planning complete, implementation NOT started
- Source: manual QA of built fixture app on :4317

## OBJECTIVE
On the Notes surface, clicking `+ add note` opens an inline form (textarea + Add/Cancel). After the user submits a note, the form stays open with the submitted text still in the textarea, looking like the note did not save. Success: after a successful add, the form closes, clears, and the new note is visible; reopening the form starts blank.

## REQUIREMENTS
- On successful add: collapse the form back to the `+ add note` button state, clear the textarea, and scroll the new note into view (existing `devin-scrollable` behavior).
- On failed add (fixture: no failure path known — keep the form open and surface the error inline under the textarea as `color:var(--danger)` 12px text).
- `Cancel` keeps current behavior: collapse + clear, note list unchanged.
- Reopening the form always starts with an empty textarea focused.
- No other visual changes: `+ add note` button keeps `.secondary` style, `min-height:var(--settings-row-height)`, font-size 12px; the form keeps its current layout, gap `8px`, textarea `min-height` unchanged.
- Transition: form collapse uses `var(--ui-motion-hover) var(--ui-ease-move)` on height/opacity if a transition already exists; otherwise no animation added (instant swap), consistent with the codebase's other inline forms.

## REPO_MAP
- `apps/web/src/WorkspacePanelBodies.tsx` / `WorkspaceSurfaceBody.tsx` — Notes surface body; the add-note form component and its submit handler (discovery: component name and where submit success is handled).

## DESIGN
- State: keep a boolean `addingNote`; on submit success → `setAddingNote(false)` and clear the draft state; on failure → keep open + error message state rendered under the textarea.
- No new components or tokens.

## EXECUTION_DAG
- T01: In the Notes surface component, close and clear the add form on submit success; render inline error on failure. Done when a submitted note appends to the list and the form returns to the `+ add note` button.
- T02: Fixture verify on :4317: add a note, confirm form collapses and clears; reopen form is blank; Cancel path unchanged. Depends T01.

## VALIDATION
- Serve fixture on :4317; Notes surface; `+ add note` → type → submit → form collapsed, note visible; reopen → blank focused textarea; Cancel → collapses without adding.

## Historical STATE
- Verified: form remains open with submitted text after add on main @ 4ca1134.
- Not implemented.

## REFERENCES
- QA pass 2026-11-21, :4317, Notes surface.
