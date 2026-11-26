# Plan: Align workspace surface names with their in-panel headings, and fix the Terminal "Start unconfirmed" label

## META
- Feature: Naming/copy consistency on three right-panel surfaces
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-23 (design fully specified — implementer makes no design choices)
- Baseline: main @ 19e6c7a789ae85f3314ee652d4dceefaff102999
- Status: plan only, not implemented
- Source: interactive QA of the built fixture app on :4317 (workspace panel tabs)

## OBJECTIVE
Three right-panel surfaces say one name on the tab/launcher and another inside the body, and the Terminal surface shows a developer-phase word as user-facing copy:

1. Surface labeled **Notes** everywhere, but its body heading is `Thread memory` (`apps/web/src/TaskMemory.tsx:77`).
2. Surface labeled **Output** on the tab, but launcher button and body headings say `Executor output` (`apps/web/src/WorkspacePanelBodies.tsx:30,62-63`).
3. Terminal phase label renders `Start unconfirmed` (`apps/web/src/TerminalBody.tsx:126`), a machine term, not user copy.

Users can't reliably match a tab to its content, and "Start unconfirmed" reads as an internal state leak.

**Measurable success:** one canonical name per surface everywhere it appears; the terminal phase is human copy.

## REQUIREMENTS

### Canonical names (decision — no alternatives)
- `notes` surface → **Memory** everywhere (the body's `Thread memory` h3 stays — it's the section title inside the Memory surface; tab, launcher, and `aria-label`s become "Memory").
- `output` surface → **Executor output** everywhere (tab strip shows the longer name; the tab strip scrolls/wraps per existing behavior — verify at 320 px panel width in VALIDATION).
- Terminal phase `unconfirmed` label → `Awaiting confirmation`.

### Exact edits
1. `apps/web/src/WorkspaceControls.tsx:15` (`panelLabels`): `notes:'Notes'` → `notes:'Memory'`; `output:'Output'` → `output:'Executor output'`.
2. `apps/web/src/WorkspacePanel.tsx:70` (`tabLabels`): `notes:'Notes'` → `notes:'Memory'`; `output:'Output'` → `output:'Executor output'`.
3. `apps/web/src/WorkspacePanelBodies.tsx` — the launcher button for `notes`: change its `aria-label`, `<span>` text and `title`/`small` to "Memory" (read the exact current strings at edit time; the button currently reads "Notes"). The `output` launcher already says "Executor output" — no change.
4. `apps/web/src/TerminalBody.tsx:126`: in the phase-label map, `unconfirmed:'Start unconfirmed'` → `unconfirmed:'Awaiting confirmation'`.
5. Grep the whole repo for remaining user-facing `'Notes'`/`'Output'`/`'Start unconfirmed'` strings tied to these surfaces (`rg -n "'Notes'|Start unconfirmed" apps/web/src packages`) and align any that name the surface (menu items, aria-labels, settings). Strings that are not user-facing (keys, class names, test ids, `panelLabels` keys, `Output tokens` metric labels) stay unchanged.

### States / keyboard / a11y / motion
- Pure copy changes; no states, focus, or announcements change. `aria-label`s updated in step 3 keep names consistent for screen readers.
- No motion; reduced-motion unaffected.
- i18n: none in this repo; literal strings only.

## REPO_MAP (verified)
- `apps/web/src/WorkspaceControls.tsx:15` — `panelLabels` (also feeds surface picker/launcher names elsewhere).
- `apps/web/src/WorkspacePanel.tsx:70` — `tabLabels` for the right-panel tab strip.
- `apps/web/src/WorkspacePanelBodies.tsx:30` — output launcher already "Executor output"; notes launcher in the same `openTool` list (lines ~24-33).
- `apps/web/src/TaskMemory.tsx:77` — `h3` "Thread memory" (kept).
- `apps/web/src/TerminalBody.tsx:126` — phase label map.
- Not covered here (already filed): Diff "Current" tab copy → #1561; connect-folder notice → #1560.

## DESIGN
String edits only; no new components, styles, or tokens. Follow with the repo-wide grep in step 5 and update any remaining user-facing matches.

## EXECUTION_DAG
- **T01** — Edits 1-4 plus grep sweep (step 5). Done when: tab, launcher, and body name match per surface, and the terminal badge reads "Awaiting confirmation".
- **T02** — Fixture visual check + narrow-width check at 320 px (VALIDATION).

## VALIDATION
Fixture repro:
```
pnpm --filter @genv1/web build && node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"
```
http://127.0.0.1:4317 → open a thread → workspace panel tabs and the tool launcher.

Planned checks:
- Memory tab + launcher read "Memory"; Executor output reads "Executor output" at default and 320 px panel widths (no truncation/overflow of the tab strip — if the strip scrolls per existing behavior, confirm buttons remain reachable).
- Terminal surface in its unconfirmed phase shows "Awaiting confirmation" (verify via the seeded terminal scenario; if the fixture can't reach that phase, confirm via the label map in code review instead — note which was done).

## STATE
- Researched/decided: this plan. Implemented: nothing.
- Next step: T01.

## REFERENCES
- Copy conventions match #1560/#1561 plans.
