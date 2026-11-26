# Current implementation status for #1936

## META and STATE

Repository `skytuhua-org/Gen-V1`; revision `issue-1936-metadata-r2-2026-11-24`; reviewed baseline `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. This metadata supplement supersedes the earlier publication-time implementation status. The complete earlier plan is preserved verbatim below, SHA256 `4d8efa1989e31c2dc9d38436521b1900cf1e84050e718441d99d26eff8aa48de`. Every original requirement, design choice, task, test, exclusion and acceptance check remains binding.

T01 pinned-hint copy and role candidate exists; T02-T03 review and full validation remain open.

Actual [PR #2091](https://github.com/skytuhua-org/Gen-V1/pull/2091) is open and unmerged at `fcefcac100ad64e6667e73725294847d506626c3`, branch `devin/d52f78-1936-pinned-hint`. The [specific journal evidence](https://github.com/skytuhua-org/Gen-V1/issues/1936#issuecomment-7124484722) is preserved with its test and environment limits. The producer reports 33 of 34 browser cases passing, with the new hint/menu case green and an unrelated duplicate-locator failure retained. TypeScript/UI guard were reported clean; full lint was not run. Preserve exact copy, role=note, verified Pin thread menu label, end-to-end keyboard pinning, drag behavior and unchanged styles. The producer release is followed by an explicitly retroactive historical claim note; this metadata review neither takes the product scope nor erases either journal entry.

## Acceptance and handoff

The current issue remains open. Producer-reported implementation and test results are distinct from independent review, required CI, merge and verification on main. This metadata worker ran no product, native or browser test. Existing implementation, review and native owners retain their scopes and releases.

The next authorized reviewer pins the latest PR head, reads the complete original plan and journal, reconciles each original task/acceptance row with the actual diff and evidence, and records any unresolved or unrun case without weakening its criterion. Use the existing PR for repair. The complete plan is mirrored through [documentation PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994); the append-only publication receipt supplies its immutable file URL and exact body readback. No application code or product requirement changes in this revision.

## Complete preserved original plan

Worker: devin-lite-p27 · QA pass 27 (second round: onboarding/welcome/empty projects). Plan source of truth below; versioned file: https://github.com/skytuhua-org/Gen-V1/blob/272a150b576c3b17cc497626be52a6a080ae2cde/docs/agent-plans/ui-pinned-section-keyboard-hint.md

# UI: Pinned section empty state — keyboard-reachable hint copy

## META
- Feature: correct the empty Pinned section hint so keyboard users get a real path
- Repo: skytuhua-org/Gen-V1 · Plan rev 1, 2026-11-23
- Baseline: main @ 65801227 (verify at implementation time)
- Provenance: QA pass 27 (second round: onboarding/welcome/empty projects), fixture :4317
- Status: planning complete, implementation NOT started
- Fixture repro: `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` then `pnpm build`, open http://127.0.0.1:4317 → sidebar "Pinned" group.

## OBJECTIVE
The empty Pinned section shows "Drag a thread here to pin it." — a pointer-only instruction. Keyboard users can pin through a thread row's Options menu (`Pin` item, `apps/web/src/ShellSidebar.tsx` ~line 214), but the hint never says so, and drag-and-drop has no keyboard equivalent in the sidebar. Success: the hint names the keyboard-reachable path while staying accurate for pointer users.

## REQUIREMENTS
- Copy: replace with `Pin a thread from its ⋯ menu, or drag it here.` (exact string; the ⋯ is the menu trigger's visible glyph, U+22EF).
- Same element and styles: `.sidebar-pinned-empty` (sidebar-context.css:608) unchanged — 11.5px/15px, `var(--muted)`, dashed 1px `color-mix(in srgb, var(--border) 85%, transparent)` border, radius 9px, padding `8px 9px`.
- Drag highlight state (`sidebar[data-dragging='true']` variant, :618) unchanged.
- Verify the Options menu's pin item label matches "Pin" at implementation time; if it reads "Pin thread", use that verbatim in the hint instead — confirm exact label in ShellSidebar.tsx before writing copy.
- A11y: the hint container gets `role="note"` so screen readers surface it as informational text; no focusable children added.
- No motion; reduced motion unaffected. Out of scope: keyboard drag-and-drop equivalent for reordering.

## REPO_MAP
- `apps/web/src/ShellSidebar.tsx` line 431: `empty: <div className="sidebar-pinned-empty">Drag a thread here to pin it.</div>` inside `group('pinned', 'Pinned', pinned, …)`.
- `apps/web/src/ShellSidebar.tsx` ~line 214: row Options menu with the pin action (verify exact item label).
- `apps/web/src/sidebar-context.css` 608–618: `.sidebar-pinned-empty` + dragging variant — unchanged.

## DESIGN
ShellSidebar.tsx single edit:
```tsx
empty: <div className="sidebar-pinned-empty" role="note">Pin a thread from its ⋯ menu, or drag it here.</div>,
```
No CSS, type, or component changes. If the menu item label is "Pin thread", the string becomes `Pin a thread from its ⋯ menu, or drag it here.` is kept — the verb is already "Pin"; adjust only if the menu item itself uses a different verb.

## EXECUTION_DAG
- T01 (owner A): string + `role="note"` in ShellSidebar.tsx; verify menu item label. Done-when: `pnpm typecheck` PASS, hint renders new copy on fixture.
- T02 (owner A, dep T01): Playwright spec asserting the hint text and `role=note` inside the Pinned group when empty; and that the row Options menu contains the Pin item (documents the keyboard path the hint names). Done-when: spec green on fixture.
- T03 (owner A, dep T02): `pnpm lint` clean; record outputs.

## VALIDATION
- `pnpm typecheck`, `pnpm lint`, Playwright spec on fixture :4317 (command in META).
- Manual: empty Pinned group copy; keyboard path — focus row → Options → Pin works end to end; drag still works and the accent-highlight state still triggers.
- Acceptance matrix in checkpoint; executed vs planned separated.

## STATE
- Reproduced on :4317 2026-11-23: pointer-only hint; menu pin confirmed present. No implementation.
- Risk: trivial; copy change only. Next: T01.

## REFERENCES
- Issue filed by QA pass 27.
