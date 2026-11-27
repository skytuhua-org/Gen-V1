# Current complete handoff revision for #2024

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2024-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2024](https://github.com/skytuhua-org/Gen-V1/issues/2024). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `44c5c30e36de7429118306914854661168e334406cc5e5096a967cf79afb170d`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

The shared component is packages/ui-shell/Modal.tsx, not an assumed apps/web/src/ui modal. Both App and WorkspaceHost host the rename dialog; preserve both host paths and the shared fallback for every other dialog. The full original focus, selection, Enter/Escape and Archive/Unpin requirements remain active.

Verified relevant source: `packages/ui-shell/Modal.tsx`, `apps/web/src/WorkspaceHost.tsx`, `apps/web/src/App.tsx`, `apps/web/src/ShellSidebar.tsx`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: No new product decision is taken by this metadata revision. Execute only the retained accepted scope and the source-corrected contracts below; discoveries outside it return to the issue owner.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | Add `initialFocusRef` support to shared `Modal` (post-mount `useEffect` focus; falls back to current first-focusable behavior when absent). Depends on: none. done-when: a test dialog with `initialFocusRef` puts `document.activeElement` on the ref'd element; dialogs without it behave as before. | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | A supplied mounted initialFocusRef receives focus; a dialog without the ref retains its existing first-focusable behavior. A missing/unmounted ref falls back safely and never focuses the page body. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | Wire Rename thread modal: ref on the name input, pass `initialFocusRef`, call `select()` after focus. Depends on: T01. done-when: fixture + unit check shows input focused, `selectionStart=0`, `selectionEnd=name.length` on open. | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | On both host paths, opening Rename through the row menu focuses the name input with selectionStart=0 and selectionEnd=value.length. Typing replaces the title; Enter commits once; Escape does not commit. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T03 owner. |
| T03 | Regression test: open rename dialog from the row menu, assert activeElement is the input and the full value is selected; assert Archive/Unpin dialogs unchanged (focus on primary action). Depends on: T02. done-when: test passes in the repo's existing test runner. | T02 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T03. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Run the complete rename regression through the built sidebar and verify focus return, Tab/Shift+Tab, Archive/Unpin defaults and the screen-reader announcement. The author reports two browser checks passing; packaged/manual walkthrough remains unverified. | AC-T03 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | In scope: focus/selection behavior of the Rename thread dialog only; the dialog's label, maxlength, and Enter/Escape commit paths only insofar as they interact with focus. | Retained unchanged: In scope: focus/selection behavior of the Rename thread dialog only; the dialog's label, maxlength, and Enter/Escape commit paths only insofar as they interact with focus. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R02 | Out of scope: the Place/Archive/Unpin dialogs, the field's validation rules, any restyle of the dialog. | Retained unchanged: Out of scope: the Place/Archive/Unpin dialogs, the field's validation rules, any restyle of the dialog. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R03 | Flow to fix: sidebar row → overflow `…` (or `More actions` button) → "Rename thread" → dialog. | Retained unchanged: Flow to fix: sidebar row → overflow `…` (or `More actions` button) → "Rename thread" → dialog. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R04 | Keyboard: on open, focus must be inside the text input with the whole value selected. Tab order from the input must reach Close and the commit control. Escape closes without committing (current behavior, keep). Enter commits (current behavior, keep). | Retained unchanged: Keyboard: on open, focus must be inside the text input with the whole value selected. Tab order from the input must reach Close and the commit control. Escape closes without committing (current behavior, keep). Enter commits (current behavior, keep). | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R05 | Accessibility: focus must never rest on `body` or the Close button while an editable field is the dialog's primary control. The selection must be applied after the input mounts, not on mount of the dialog shell. | Retained unchanged: Accessibility: focus must never rest on `body` or the Close button while an editable field is the dialog's primary control. The selection must be applied after the input mounts, not on mount of the dialog shell. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |
| R06 | Error/recovery: none changed. | Retained unchanged: Error/recovery: none changed. | T01, T02, T03 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02, AC-T03 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

Implementation reported in [PR #2065](https://github.com/skytuhua-org/Gen-V1/pull/2065) at producer-reported `3058c86b`; independent acceptance, merge and verification on main remain open. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2024#issuecomment-7126255582). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `44c5c30e36de7429118306914854661168e334406cc5e5096a967cf79afb170d`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2024)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2024#issuecomment-7126255582)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [packages/ui-shell/Modal.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/ui-shell/Modal.tsx)
- [apps/web/src/WorkspaceHost.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/WorkspaceHost.tsx)
- [apps/web/src/App.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/App.tsx)
- [apps/web/src/ShellSidebar.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/ShellSidebar.tsx)
- [Existing implementation PR #2065](https://github.com/skytuhua-org/Gen-V1/pull/2065)

## Retained complete original plan

# Fix: Rename thread dialog does not focus or select the name field

## META
- Feature: Rename thread dialog — focus and selection on open
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-24
- Baseline: `main` @ `9ddd536cc84c0f327ddf6133d485f8ab8baf294b`
- Issue: this issue (canonical plan in body; identical copy posted as a comment)
- Status: plan only — no implementation in this pass
- Provenance: live QA of built fixture at `http://127.0.0.1:4317` on 2026-11-24 (pass 31, worker `devin-qa31-e71d2f`)

## OBJECTIVE
Opening "Rename thread" from a row's overflow menu shows a dialog whose input contains the current name unselected, while keyboard focus lands on the dialog's Close button. Verified live: after the dialog opened, `document.activeElement` was the Close button and `input.selectionStart === input.selectionEnd` (caret at end). A user who presses Enter commits nothing; a user who starts typing expecting a replace-all field instead inserts text mid-string at the caret position — QA produced `QA-renamedExplore the component XYZcatalog` from `Explore the component catalog`. Success: the dialog opens with the input focused and the full existing name selected, so typing replaces and Enter commits.

## REQUIREMENTS
- In scope: focus/selection behavior of the Rename thread dialog only; the dialog's label, maxlength, and Enter/Escape commit paths only insofar as they interact with focus.
- Out of scope: the Place/Archive/Unpin dialogs, the field's validation rules, any restyle of the dialog.
- Flow to fix: sidebar row → overflow `…` (or `More actions` button) → "Rename thread" → dialog.
- Keyboard: on open, focus must be inside the text input with the whole value selected. Tab order from the input must reach Close and the commit control. Escape closes without committing (current behavior, keep). Enter commits (current behavior, keep).
- Accessibility: focus must never rest on `body` or the Close button while an editable field is the dialog's primary control. The selection must be applied after the input mounts, not on mount of the dialog shell.
- Error/recovery: none changed.

## REPO_MAP
- `apps/web/src/WorkspaceHost.tsx` — hosts the thread dialogs; the rename modal is rendered from the same block as `title="Unpin thread"` (line ~303) and `title="Archive thread"` (line ~302). Verified in tree.
- `apps/web/src/ShellSidebar.tsx` — overflow menu item `Rename thread` at lines 211–220 dispatches the rename intent; verified.
- `apps/web/src/ui/` modal/dialog implementation — discovery: find the shared `Modal` component used by `WorkspaceHost` (`<Modal title="Archive thread">`, `<Modal title="Unpin thread">`) and check whether it accepts an `initialFocus`/`autoFocus` prop or auto-focuses its first focusable child (the Close button).
- Discovery: the exact `Rename thread` modal markup and its `input` element (fixture shows an `input` pre-filled with the current title and a Close button receiving focus first).

## DESIGN
The shared `Modal` component gains deterministic initial-focus handling for dialogs that contain a primary editable field:

1. Add an optional prop `initialFocusRef?: React.RefObject<HTMLElement>` (or `autoFocusSelector?: string` — pick `initialFocusRef` to match existing React conventions in the codebase) to `Modal`. When provided, `Modal` calls `ref.current?.focus()` in a `useEffect` that runs after mount, instead of focusing its first focusable element.
2. In the Rename thread modal, attach the ref to the name `<input>` and pass it as `initialFocusRef`.
3. After focusing, call `input.select()` so the entire current name is selected (selection range `0 → value.length`). Selection is applied in the same effect, after `focus()`.
4. When `initialFocusRef` is absent, keep today's behavior exactly (first focusable element / Close) — the Archive and Unpin confirm dialogs keep focus on their primary action and are unchanged.
5. Input attributes stay as today: `type="text"`, current `maxLength` unchanged, `aria-label`/`aria-labelledby` unchanged.
6. Reduced motion / motion: no visual or timing changes; no new animation.
7. No copy changes.

## EXECUTION_DAG
- T01 — Add `initialFocusRef` support to shared `Modal` (post-mount `useEffect` focus; falls back to current first-focusable behavior when absent). Depends on: none. done-when: a test dialog with `initialFocusRef` puts `document.activeElement` on the ref'd element; dialogs without it behave as before.
- T02 — Wire Rename thread modal: ref on the name input, pass `initialFocusRef`, call `select()` after focus. Depends on: T01. done-when: fixture + unit check shows input focused, `selectionStart=0`, `selectionEnd=name.length` on open.
- T03 — Regression test: open rename dialog from the row menu, assert activeElement is the input and the full value is selected; assert Archive/Unpin dialogs unchanged (focus on primary action). Depends on: T02. done-when: test passes in the repo's existing test runner.

## VALIDATION
- Fixture repro (current broken state): build the UI (`pnpm build:widgets` and `vite build` in `apps/web`), serve via `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` from repo root, open `http://127.0.0.1:4317`, hover a sidebar row → `…` → "Rename thread": focus lands on Close; typing inserts mid-string.
- After fix, same steps: input focused, whole name selected; typing replaces; Enter commits; Escape cancels; Shift+Tab/Tab order unchanged otherwise.
- Screen reader sanity: opening the dialog announces the input label with the current value, not the Close button.
- Regression: Archive and Unpin dialogs still focus their primary confirm action.

## STATE
- Researched/verified: open behavior reproduced live (focus on Close; caret unselected at end); typing inserts mid-string (produced `QA-renamedExplore the component XYZcatalog`).
- Decided: `initialFocusRef` prop on `Modal` + `select()` on open.
- Implemented: nothing. Next step: T01 (discovery inside: locate the shared `Modal` component file under `apps/web/src/`).

## REFERENCES
- `apps/web/src/ShellSidebar.tsx` lines 211–220 (menu), 236–322 (row).
- `apps/web/src/WorkspaceHost.tsx` lines ~262, 302–303 (thread dialogs).
- Related open issues (context, not duplicates): #1913 (focus restore to invoker on close), #1915 (shortcut discoverability).
