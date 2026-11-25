# Current complete handoff revision for #2109

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2109-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2109](https://github.com/skytuhua-org/Gen-V1/issues/2109). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `5b71772de3870995a82b7a27d85d3274683ba2beddb2a1ef7a37cacd4f8611a3`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

The existing saved-body preview is a paragraph, not a code block plus diff line. There is no title field. Use the actual memory-draft thread-scoped key and generation-guarded journalCompareAndSwap API described in #2108, preserving newer edits and recovery failures. The original REQUIREMENTS says disclosure defaults closed, while DESIGN says it auto-opens on first conflict; neither silently overrides the other. Preserve the agreed two-step confirmation and four-second disarm. Reset an armed confirmation if the note identity/revision changes so it cannot authorize overwriting a different saved version.

Verified relevant source: `apps/web/src/TaskMemory.tsx`, `apps/web/src/journal.ts`, `apps/web/src/task-memory.css`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: T01/T02 initial disclosure state is BLOCKED until the frontend owner selects default-closed or auto-open-on-first-conflict. The confirmation and journal safety requirements are independent and remain executable.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | Owner: frontend implementer. Add live-region wrapper, `conflictOpen`/`armUseSaved` state, two-step button, journal clear + focus on confirm. Done-when: DOM + behavior verified. | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | A new conflict is announced politely; first click only arms, second within four seconds adopts the intended saved revision and focuses Body; expiry or a changed note/revision disarms. A newer draft generation is never cleared by an older confirmation. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | Owner: frontend implementer (same commit). CSS: `.memory-note .memory-conflict details { margin-bottom:8px; }`; armed color rule via inline style as specified. Done-when: visual check at 320px and default widths. | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Disclosure layout and armed danger-text style work at 320px and default width. Apply only the owner-approved initial-open policy; no animation or new preview format is assumed. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T03 owner. |
| T03 | Owner: frontend implementer. Vitest/Playwright per VALIDATION. Done-when: pass. | T02 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T03. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Verify single-click retention, timeout, changed revision, CAS failure, keyboard confirmation and absence of the conflict region when clean. Record an actual VoiceOver/NVDA announcement separately from DOM tests. | AC-T03 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | Wrap the conflict `<details>` block in a container with `role="status"` `aria-live="polite"` so appearance is announced. | Retained unchanged: Wrap the conflict `<details>` block in a container with `role="status"` `aria-live="polite"` so appearance is announced. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R02 | Keep `<details>`/`<summary>` disclosure (summary text unchanged: "A newer saved note is available"). Default closed. | DECISION HOLD: retain details/summary and its exact summary text; default-closed versus auto-open-first-conflict must be resolved explicitly before this part of T01/T02 acceptance. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R03 | Inside the disclosure, keep the preview `<code>` of the saved body and the diff line unchanged. | SOURCE CORRECTED: preserve the actual paragraph preview of note.content. The old code-block/diff-line description is a false source premise, not an instruction to add a new preview format. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R04 | Replace the single "Use saved note" button with a two-step confirm: first click arms the button and changes its label to "Discard my edits and use saved note"; second click performs the overwrite. Arming reverts after 4 seconds of no second click back to "Use saved note". No new component — inline state `armUseSaved` in `MemoryNote`. | Retained unchanged: Replace the single "Use saved note" button with a two-step confirm: first click arms the button and changes its label to "Discard my edits and use saved note"; second click performs the overwrite. Arming reverts after 4 seconds of no second click back to "Use saved note". No new component — inline state `armUseSaved` in `MemoryNote`. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R05 | On confirmed overwrite: set fields to `note.*`, `baseRevision.current = note.revision`, `dirty.current = false`, clear `note-draft-<key>` journal entry, close the `<details>` (controlled `open` state = false), focus the Body textarea. | SOURCE CORRECTED: after confirmed adoption, restore actual saved key/content/revision; use the real thread-scoped journal key and generation-guarded CAS, preserving newer edits on mismatch/error. Retain closing the disclosure and focusing Body; no invented title or note-draft API. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R06 | Armed state styling: `secondary` button, danger text `color:var(--danger)`; unarmed state plain `secondary`. Min width not reserved; wrap allowed. | Retained unchanged: Armed state styling: `secondary` button, danger text `color:var(--danger)`; unarmed state plain `secondary`. Min width not reserved; wrap allowed. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R07 | Keyboard: buttons are standard; armed confirmation reachable by Tab; Enter/Space activates. | Retained unchanged: Keyboard: buttons are standard; armed confirmation reachable by Tab; Enter/Space activates. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R08 | Reduced motion: no transition added; label swap is instant. | Retained unchanged: Reduced motion: no transition added; label swap is instant. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R09 | Scope: only the conflict block — no change to save/delete flows. | Retained unchanged: Scope: only the conflict block — no change to save/delete flows. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

No implementation PR or executed feature test is established in the current issue journal. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2109#issuecomment-7128866471). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `5b71772de3870995a82b7a27d85d3274683ba2beddb2a1ef7a37cacd4f8611a3`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2109)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2109#issuecomment-7128866471)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/TaskMemory.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/TaskMemory.tsx)
- [apps/web/src/journal.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/journal.ts)
- [apps/web/src/task-memory.css](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/task-memory.css)

## Retained complete original plan

# Plan: Announce the newer-saved-note conflict and guard the draft discard

## META
- Feature: Accessible, two-step conflict resolution in Thread memory (Notes)
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-24
- Baseline: main @ 9ddd536cc84c0f327ddf6133d485f8ab8baf294b
- Status: plan only, not implemented
- Source: code inspection of TaskMemory.tsx lines 54–65 + fixture QA on http://127.0.0.1:4317

## OBJECTIVE
When the saved note's `revision` advances while the user has local edits (e.g., another client saved), the panel renders `<details>` with summary "A newer saved note is available" containing one button "Use saved note" that overwrites every local field in a single click. Problems: the banner appears silently for screen-reader users, and the destructive action has no intermediate step.

**Measurable success:** the conflict region is announced when it appears (`role="status"` polite live region), and discarding the local draft requires an explicit second confirmation inside the disclosure.

## REQUIREMENTS
1. Wrap the conflict `<details>` block in a container with `role="status"` `aria-live="polite"` so appearance is announced.
2. Keep `<details>`/`<summary>` disclosure (summary text unchanged: "A newer saved note is available"). Default closed.
3. Inside the disclosure, keep the preview `<code>` of the saved body and the diff line unchanged.
4. Replace the single "Use saved note" button with a two-step confirm: first click arms the button and changes its label to "Discard my edits and use saved note"; second click performs the overwrite. Arming reverts after 4 seconds of no second click back to "Use saved note". No new component — inline state `armUseSaved` in `MemoryNote`.
5. On confirmed overwrite: set fields to `note.*`, `baseRevision.current = note.revision`, `dirty.current = false`, clear `note-draft-<key>` journal entry, close the `<details>` (controlled `open` state = false), focus the Body textarea.
6. Armed state styling: `secondary` button, danger text `color:var(--danger)`; unarmed state plain `secondary`. Min width not reserved; wrap allowed.
7. Keyboard: buttons are standard; armed confirmation reachable by Tab; Enter/Space activates.
8. Reduced motion: no transition added; label swap is instant.
9. Scope: only the conflict block — no change to save/delete flows.

## REPO_MAP
- `apps/web/src/TaskMemory.tsx` lines 54–65: `!fresh && dirty.current && note.revision !== baseRevision.current` renders the `<details>` block; line 62 button performs the overwrite.
- `apps/web/src/task-memory.css` — add rule `.memory-note .memory-conflict { … }` only for margin; button styles reused.
- Live region precedent exists (`ShellNotice`, `WorkspaceNotifications` use status regions) — reuse `role="status"` only, no new utility.

## DESIGN
```tsx
{!fresh && dirty.current && note.revision !== baseRevision.current && (
  <div role="status" aria-live="polite" className="memory-conflict">
    <details open={conflictOpen} onToggle={…}>
      <summary>A newer saved note is available</summary>
      …preview + diff (unchanged)…
      <button className="secondary" style={armUseSaved ? {color:'var(--danger)'} : undefined}
        onClick={armUseSaved ? confirmOverwrite : () => arm()}
      >{armUseSaved ? 'Discard my edits and use saved note' : 'Use saved note'}</button>
    </details>
  </div>
)}
```
`arm()` sets `armUseSaved=true` and a 4 s `setTimeout` back to false (cleared on unmount and on confirm). `conflictOpen` defaults `false`, set `true` when the conflict first appears so the content is visible without a click — decision: auto-open once on first appearance, then let the user toggle freely (`useEffect` watching the predicate, set once).

## EXECUTION_DAG
- T01 — Owner: frontend implementer. Add live-region wrapper, `conflictOpen`/`armUseSaved` state, two-step button, journal clear + focus on confirm. Done-when: DOM + behavior verified.
- T02 — Owner: frontend implementer (same commit). CSS: `.memory-note .memory-conflict details { margin-bottom:8px; }`; armed color rule via inline style as specified. Done-when: visual check at 320px and default widths.
- T03 — Owner: frontend implementer. Vitest/Playwright per VALIDATION. Done-when: pass.

## VALIDATION
- Fixture repro: `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; await openReviewHost('/tmp/genv1-x', 4317)"` → http://127.0.0.1:4317 → thread → Add surface → Notes; edit a note, then issue a `memory.save` for the same key from a second client (or host CLI) to bump revision.
- Playwright: assert `role="status"` region appears containing the disclosure; single click does NOT overwrite (fields keep local edits, label changed); second click overwrites and returns footer to saved state.
- Screen reader check: VoiceOver/NVDA announces "A newer saved note is available" on appearance.
- Negative: no conflict → no live region in DOM.

## STATE
Plan complete; no implementation started.

## REFERENCES
- Issue: this issue. Surface file: apps/web/src/TaskMemory.tsx.
