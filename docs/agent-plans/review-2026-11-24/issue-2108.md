# Current complete handoff revision for #2108

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2108-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2108](https://github.com/skytuhua-org/Gen-V1/issues/2108). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `a8a502ac8214b2ea87d010532e0a100b27927aac7115c0cdbef4fce7f7b46769`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

TaskMemory has key/content/baseRevision and no note.title or setTitle. The journal key is `memory-draft:${threadId}:${fresh ? 'create' : 'saved:' + note.key}`. Actual APIs are journalRead, journalWrite, journalGeneration and generation-guarded journalCompareAndSwap; journal.draft/take/remove and note-draft-* are nonexistent here. Clear only the captured generation with journalCompareAndSwap(journalKey, generation, null), preserving later edits on CAS mismatch or error. The current footer has no unsaved-changes text indicator, so do not invent one as an existing dependency. Keep the accepted Discard button immediately before Forget, returning focus to Body.

Verified relevant source: `apps/web/src/TaskMemory.tsx`, `apps/web/src/journal.ts`, `apps/web/src/task-memory.css`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: No new product decision is taken by this metadata revision. Execute only the retained accepted scope and the source-corrected contracts below; discoveries outside it return to the issue owner.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | Owner: frontend implementer. Convert `dirty` ref to state; add `contentRef`; insert Discard button with revert handler incl. journal clear. Done-when: clicking reverts all fields, indicator hidden, focus in Body. | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | For a dirty saved note, Discard restores saved key/content and revision, clears only its matching draft generation and focuses Body. Clean and fresh notes show no Discard; busy or recovery-blocked actions remain disabled. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | Owner: frontend implementer (same commit). Add styles only if needed (prefer none; footer flex already lays out). Done-when: footer order verified at 320px width without wrap overflow (wrap allowed). | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | At 320px, the new control precedes Forget with the existing footer flow and no overflow; no new title field or unrelated status indicator is introduced. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T03 owner. |
| T03 | Owner: frontend implementer. Vitest/Playwright per VALIDATION. Done-when: pass. | T02 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T03. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Reload after a successful same-generation discard shows no recovered draft. A later edit or changed generation survives; CAS false/rejection is surfaced without claiming successful clearing or erasing recoverable work. Keyboard Enter/Space and unmount paths are covered. | AC-T03 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | Render only when `!fresh && dirty.current` (same predicate as the "unsaved changes" indicator), so it never appears on the create form or on a clean note. | SOURCE CORRECTED: render Discard only for a dirty saved note, never for fresh or clean notes. The claimed preexisting unsaved-changes text indicator does not exist and is not a dependency or an added requirement. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R02 | On click: `setKey(note.key)`, `setTitle(note.title)`, `setContent(note.content)`, `baseRevision.current = note.revision`, clear the journal entry `draft:<key>` via `journal.remove('note-draft-'+note.key)` (the same key the `journal.draft` call writes), set `dirty.current = false`, and re-render so the "unsaved changes" indicator and Discard button disappear. | SOURCE CORRECTED: restore saved key/content and baseRevision using existing fields; no title field. Clear only the captured generation of the actual thread-scoped memory-draft journal key with journalCompareAndSwap. Preserve later edits and do not claim successful clearing on mismatch/error. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R03 | Focus: focus moves to the Body textarea after reverting so the user can immediately continue editing if desired. Decision: focus Body (`.focus()` on the textarea element). | Retained unchanged: Focus: focus moves to the Body textarea after reverting so the user can immediately continue editing if desired. Decision: focus Body (`.focus()` on the textarea element). | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R04 | Copy: button text "Discard changes"; `aria-label="Discard unsaved changes to <key>"`; tooltip `title="Revert to saved"`. | Retained unchanged: Copy: button text "Discard changes"; `aria-label="Discard unsaved changes to <key>"`; tooltip `title="Revert to saved"`. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R05 | Style: `secondary` class, same 8px gap flow in `.memory-note footer`; placed between "unsaved changes" text and the `Forget` icon (i.e., first action after the muted text, still before `margin-right:auto` so Forget stays right-aligned). To keep Forget right-aligned, order footer children as: unsaved-changes text → Discard button → Forget → Cancel/Submit unchanged. Decision: insert Discard immediately before the Forget button. | SOURCE CORRECTED: retain the accepted secondary Discard button immediately before Forget in the current footer flow. Do not add the nonexistent prior indicator as part of this task; preserve Cancel/Submit and existing styles. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R06 | Disabled while `busy` (in-flight save/delete). | Retained unchanged: Disabled while `busy` (in-flight save/delete). | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R07 | Keyboard: standard button, reachable via Tab; activate with Enter or Space. | Retained unchanged: Keyboard: standard button, reachable via Tab; activate with Enter or Space. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R08 | No animation; reduced motion unaffected. | Retained unchanged: No animation; reduced motion unaffected. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

No implementation PR or executed feature test is established in the current issue journal. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2108#issuecomment-7128866042). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `a8a502ac8214b2ea87d010532e0a100b27927aac7115c0cdbef4fce7f7b46769`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2108)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2108#issuecomment-7128866042)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/TaskMemory.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/TaskMemory.tsx)
- [apps/web/src/journal.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/journal.ts)
- [apps/web/src/task-memory.css](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/task-memory.css)

## Retained complete original plan

# Plan: Add a Discard control to revert unsaved edits on a saved note

## META
- Feature: Discard/revert button for edited saved notes in Thread memory (Notes)
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-24
- Baseline: main @ 9ddd536cc84c0f327ddf6133d485f8ab8baf294b
- Status: plan only, not implemented
- Source: code inspection + fixture QA on http://127.0.0.1:4317

## OBJECTIVE
Once a user edits a saved note's Key/Title/Body, there is no way to abandon the edit: the journal draft persists (by design), "Add memory note" stays open nowhere relevant, and Escape only closes the create form. Reloading the panel re-shows the draft via "Resume unsaved note". Users need a one-click revert to the saved note's contents.

**Measurable success:** a visible "Discard changes" button appears whenever the form is dirty and `!fresh`; clicking it restores every field to the note's saved values, clears the draft journal entry, and removes the "unsaved changes" indicator — identical to a fresh panel load with no draft.

## REQUIREMENTS
1. Render only when `!fresh && dirty.current` (same predicate as the "unsaved changes" indicator), so it never appears on the create form or on a clean note.
2. On click: `setKey(note.key)`, `setTitle(note.title)`, `setContent(note.content)`, `baseRevision.current = note.revision`, clear the journal entry `draft:<key>` via `journal.remove('note-draft-'+note.key)` (the same key the `journal.draft` call writes), set `dirty.current = false`, and re-render so the "unsaved changes" indicator and Discard button disappear.
3. Focus: focus moves to the Body textarea after reverting so the user can immediately continue editing if desired. Decision: focus Body (`.focus()` on the textarea element).
4. Copy: button text "Discard changes"; `aria-label="Discard unsaved changes to <key>"`; tooltip `title="Revert to saved"`.
5. Style: `secondary` class, same 8px gap flow in `.memory-note footer`; placed between "unsaved changes" text and the `Forget` icon (i.e., first action after the muted text, still before `margin-right:auto` so Forget stays right-aligned). To keep Forget right-aligned, order footer children as: unsaved-changes text → Discard button → Forget → Cancel/Submit unchanged. Decision: insert Discard immediately before the Forget button.
6. Disabled while `busy` (in-flight save/delete).
7. Keyboard: standard button, reachable via Tab; activate with Enter or Space.
8. No animation; reduced motion unaffected.

## REPO_MAP
- `apps/web/src/TaskMemory.tsx` lines 41–68: footer JSX; `dirty` ref set on any `input`/`onChange` and on journal restore; journal key `note-draft-${note.key}` written by `journal.draft` (journal.ts). `act(false)` saves.
- `apps/web/src/journal.ts` — `draft`, `take` API; confirm `remove`/`delete` equivalent exists (if not, write an empty `draft` then `take` to clear — receiver verifies the exact journal API name).
- `apps/web/src/task-memory.css` — `.memory-note footer` flex row, `margin-right:auto` on the danger button.

## DESIGN
Add inside `MemoryNote` footer, only when `!fresh && dirty.current`:
```tsx
{!fresh && dirty.current && (
  <button type="button" className="secondary" disabled={busy}
    aria-label={`Discard unsaved changes to ${note.key}`}
    title="Revert to saved"
    onClick={() => {
      setKey(note.key); setTitle(note.title); setContent(note.content);
      baseRevision.current = note.revision; dirty.current = false;
      journal.remove(`note-draft-${note.key}`);
      contentRef.current?.focus();
    }}>Discard changes</button>
)}
```
Add a `contentRef` on the body textarea. Reuse the same "unsaved changes" visibility predicate; extract `isDirty` into state if needed for re-render (convert `dirty` from ref to state — the existing "unsaved changes" text already re-renders because field setters rerender; switching `dirty` to `useState` keeps semantics identical and is the chosen approach so Discard disappearance is reliable).

## EXECUTION_DAG
- T01 — Owner: frontend implementer. Convert `dirty` ref to state; add `contentRef`; insert Discard button with revert handler incl. journal clear. Done-when: clicking reverts all fields, indicator hidden, focus in Body.
- T02 — Owner: frontend implementer (same commit). Add styles only if needed (prefer none; footer flex already lays out). Done-when: footer order verified at 320px width without wrap overflow (wrap allowed).
- T03 — Owner: frontend implementer. Vitest/Playwright per VALIDATION. Done-when: pass.

## VALIDATION
- Fixture repro: `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; await openReviewHost('/tmp/genv1-x', 4317)"` → http://127.0.0.1:4317 → thread → workspace panel → Add surface → Notes.
- Playwright: edit `date-format` body, assert "Discard changes" appears; click it; assert fields equal saved values, indicator gone, draft journal cleared (reload panel → no "Resume unsaved note").
- Keyboard: Tab to Discard, press Enter; assert focus lands in Body textarea.
- Negative: clean (unedited) saved note renders no Discard; fresh create form renders no Discard.

## STATE
Plan complete; no implementation started.

## REFERENCES
- Issue: this issue. Surface file: apps/web/src/TaskMemory.tsx.
