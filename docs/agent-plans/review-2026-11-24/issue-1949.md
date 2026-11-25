# Current implementation status for #1949

## META and STATE

Repository `skytuhua-org/Gen-V1`; revision `issue-1949-metadata-r2-2026-11-24`; reviewed baseline `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. This metadata supplement supersedes the earlier publication-time implementation status. The complete earlier plan is preserved verbatim below, SHA256 `2569716626b1ac335b9f968f731a3eab9f6c7a66beeb5ee33621ef521373bc50`. Every original requirement, design choice, task, test, exclusion and acceptance check remains binding.

T01 purpose/empty-state candidate and T02 focused tests exist for the two PR surfaces.

Actual [PR #2035](https://github.com/skytuhua-org/Gen-V1/pull/2035) is open and unmerged at `0e249c5d9662d03eb1a7c8dafcd3e7515aa29027`, branch `devin/a7f3ab-1949-pr-surfaces`. The [specific journal evidence](https://github.com/skytuhua-org/Gen-V1/issues/1949#issuecomment-7122389940) is preserved with its test and environment limits. The producer reports three Chromium cases and a clean TypeScript check, followed by a manifest-format-only correction to the current head. Full browser coverage and Browser-to-Changes were explicitly left to CI. Preserve both distinct surfaces, unchanged names/forms/notices, linked and unlinked purpose/empty copy, loading behavior and both-theme legibility. Exact-head review, required checks and integration acceptance remain pending.

## Acceptance and handoff

The current issue remains open. Producer-reported implementation and test results are distinct from independent review, required CI, merge and verification on main. This metadata worker ran no product, native or browser test. Existing implementation, review and native owners retain their scopes and releases.

The next authorized reviewer pins the latest PR head, reads the complete original plan and journal, reconciles each original task/acceptance row with the actual diff and evidence, and records any unresolved or unrun case without weakening its criterion. Use the existing PR for repair. The complete plan is mirrored through [documentation PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994); the append-only publication receipt supplies its immutable file URL and exact body readback. No application code or product requirement changes in this revision.

## Complete preserved original plan

# Plan: Disambiguate the "Pull request" and "Linked pull requests" workspace surfaces

## META
- Feature: Make the two near-identical PR surfaces visually distinct (or merge them)
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-23 (design fully specified — implementer makes no design choices)
- Baseline: main @ 19e6c7a789ae85f3314ee652d4dceefaff102999
- Status: plan only, not implemented
- Source: interactive QA of the built fixture app on :4317 (workspace panel, Pull request + Linked pull requests tabs)

## OBJECTIVE
The workspace tool launcher offers both **Pull request** and **Linked pull requests** (`apps/web/src/WorkspacePanelBodies.tsx:27-28`). Both render the same `PullRequestsBody` component (`apps/web/src/WorkspaceSurfaceBody.tsx:74`) with only the `linked` flag differing. To a user, the two tabs look identical — same toolbar, same list shape, same link form — with no on-surface explanation of what "linked" means. Users can't tell them apart or predict which list they'll see.

**Measurable success:** each surface states its own purpose in its own header; the Linked surface explains "linked" in one line; no user confuses them.

## REQUIREMENTS

### In scope
1. A one-line purpose note under the toolbar of each surface, plus distinct list-empty copy on the Linked surface.
2. The tab/launcher names stay as they are (`Pull request`, `Linked pull requests`) — only the in-panel explanation changes.

### Decision (no alternatives — this is the design)
Keep both surfaces (they serve different threads/review scopes); differentiate in the panel body. Do NOT merge into one surface.

### Copy and layout (exact)
- **Pull request** surface: under `.panel-toolbar` add `<p className="panel-note">All open pull requests in this project’s repository.</p>` — rendered only when `linked === false`, before the existing `{value&&<p className="panel-note">{value.repo}</p>}` line (which stays).
- **Linked pull requests** surface: `<p className="panel-note">Pull requests linked to this conversation for review.</p>` — rendered only when `linked === true`, same position.
- **Linked surface empty list:** when `linked && value && value.items.length === 0`, render `<p className="panel-note">No pull requests are linked to this conversation yet. Link one below.</p>` instead of an empty `<ul>` (the `.pr-link-form` stays below it, which is the action the copy points at).
- **Pull request surface empty list:** `No open pull requests.` — same element and position.

### Typography / styling
- Reuse `.panel-note` (existing token set — muted text, panel body size). No new styles, no new tokens.

### States
- Loading (`value === null`): only the purpose note + existing loading state; no empty message.
- `!ready`, `saved.pending`, `git.value && !canWrite`, `reviewRequest` repo mismatch: existing notices render as now; purpose note renders above them always.
- `linked` empty + `!threadId` (unbound thread): the Linked surface still shows its purpose note and empty message; the link form remains (disabled state unchanged).

### Keyboard / a11y / motion
- No interactive elements added; nothing new in the tab order; nothing to announce (`panel-note` is plain text, matching the existing pattern). No motion; reduced-motion unaffected.

## REPO_MAP (verified)
- `apps/web/src/WorkspacePanelBodies.tsx:27-28` — launcher buttons and their `title`/`small` copy ("Project pull requests" / "Connected reviews").
- `apps/web/src/WorkspaceSurfaceBody.tsx:74` — `PullRequestsBody` shared component, `linked` boolean.
- `apps/web/src/WorkspaceSurfaceBody.tsx:152-156` — toolbar (`{linked?'Linked pull requests':'Pull requests'}`) + list render at line 156 (`value?.items.map`).
- `apps/web/src/WorkspaceControls.tsx:15` — `panelLabels` source of the two names.
- Related: #1131 already scoped a different fix inside the Linked PRs panel (per #1560 META) — read it before editing that file region.

## DESIGN
Edit `PullRequestsBody` only: add the conditional purpose `<p>` after `.panel-toolbar`, and replace the bare `<ul>` render with `value && (value.items.length ? <ul …/> : <p className="panel-note">{empty copy}</p>)`.

## EXECUTION_DAG
- **T01** — Add the two purpose notes and the two empty-state messages in `PullRequestsBody`. Done when: each surface shows its own purpose line and the correct empty copy; all existing notices/conditions unchanged.
- **T02** — Snapshot/text assertions in the existing component test setup if one exists for this surface; otherwise a fixture browser check.

## VALIDATION
Fixture repro:
```
pnpm --filter @genv1/web build && node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"
```
http://127.0.0.1:4317 → open a thread → workspace panel → open both Pull request and Linked pull requests tabs.

Planned checks: each tab shows its own purpose note; empty lists show the new copy; both light and dark (fixture seeds pr-dark and pr-light scenarios) render legibly.

## STATE
- Researched/decided: this plan. Implemented: nothing.
- Next step: T01.

## REFERENCES
- Copy tone matches #1560 and #1561 (existing panel-note plans).
