# Current complete handoff revision for #2111

## META

Repository: skytuhua-org/Gen-V1. Revision: `issue-2111-metadata-r2-2026-11-24`. Baseline verified: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Canonical issue: [#2111](https://github.com/skytuhua-org/Gen-V1/issues/2111). Metadata coordination: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). Source provenance: full prior canonical body SHA256 `263fc7a96dde4dca44eb863533a8b06c9823f76644a4e655d3008eb6bd714663`, retained verbatim below, its complete issue journal, and the pinned repository files in REFERENCES.

This revision supplies executable handoff fields and corrects verified source facts. Every original requirement, exclusion, snippet, task, example and validation instruction is retained below. The current correction section supersedes only the specific erroneous facts or unresolved assertions it names; all other original text remains normative. Historical statements that no implementation exists are superseded by the STATE evidence here. An explicit decision hold is not an invented decision.

## OBJECTIVE and REQUIREMENTS

The full OBJECTIVE and REQUIREMENTS in the retained plan are active, with the bounded corrections below. Success means their observable acceptance criteria pass on the reviewed exact head and, after normal merge review, on main. Publication or an open PR does not satisfy implementation acceptance.

## REPO_MAP and DESIGN corrections

The note payload already supplies updatedAt and the saved-note header contains the author small element. Preserve static render-time timestamps, the exact relative buckets and raw ISO title; this issue does not adopt a ticking timer. The supplied DESIGN fallback `iso.slice(0,10)` is a UTC date prefix and can disagree with the REQUIREMENTS local YYYY-MM-DD near midnight. Resolve the date basis explicitly before selecting helper code. Discover an existing helper only if every bucket and date rule matches.

Verified relevant source: `apps/web/src/TaskMemory.tsx`, `apps/web/src/task-memory.css`. These paths were opened or checked against the pinned tree; guessed locations in the older plan are discovery work unless corrected here. The original UI, compatibility, privacy, accessibility, cancellation and error/recovery constraints are retained. No application code is changed by this revision.

Decision/discovery state: T01 date fallback and T02 date tests are BLOCKED on the local-calendar versus UTC-prefix contradiction. Relative buckets, static updates and raw ISO tooltip remain unchanged.

## EXECUTION_DAG handoff contract

Stable original task IDs are retained. The original task-specific steps below and this table form one task contract. Inputs include the complete issue, current journal, exact source head and any accepted decision recorded in the canonical body. Before any edit, the implementing owner refreshes overlapping claims and related PRs. One worker owns overlapping files at a time; test work may run independently only against a frozen named head.

| ID | Original task wording, subject to explicit source corrections | Dependencies | Inputs | Outputs and files | Ownership boundary | Positive and negative acceptance | Done-when and handoff |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | Owner: frontend implementer. Add helper + render; check for an existing shared relative-time helper first (grep `ago` in apps/web/src) and reuse it only if output matches REQUIREMENTS 2 exactly. Done-when: all fixture notes show timestamps. | None beyond current claim/source refresh | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T01. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Saved notes render author, middle dot and relative age with the exact ISO title; fresh form does not. A later snapshot updates the display; no interval is introduced. | AC-T01 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to T02 owner. |
| T02 | Owner: frontend implementer (same commit). Vitest unit test for `formatNoteAge` boundaries + Playwright header assertion. Done-when: pass. | T01 reviewable output; affected decision gates below also apply | Effective current requirements/DESIGN corrections, pinned source; receive prior task evidence where dependent. | Scoped edits in the verified source set below or the explicit test-discovery procedure, plus exact-head evidence for AC-T02. | Existing feature owner after journal refresh; metadata worker claims no product source. Serialize shared-file edits. | Freeze time for 59s/60s/61s, 59m/60m, 23h/24h, 29d/30d and 40d boundaries. Include UTC/local midnight cases and record chosen date basis, invalid/future input behavior, and saved/create header assertions. | AC-T02 passes with command, fixture and observed result recorded; hand exact SHA, source diff and remaining gate to frontend reviewer and actual-user verifier; maintainer retains merge decision. |

Test-path discovery is explicit: run `rg --files tests tests/e2e` and select the existing fixture/spec and its checked-in configuration for the affected surface; read that configuration before adding the scoped case. If a new source file is needed, register it in `scripts/public-source-files.json` where required by CONTRIBUTING. Do not present a proposed path as an existing test, and do not recreate another owner's implementation when the linked PR already contains it.

## Requirement to acceptance map

The original-wording column records provenance and does not create a second contract. The effective-current-condition column governs execution: inaccurate source claims are explicitly corrected, genuine decisions stay held, and unaffected requirements remain unchanged. All nested examples and exact copy remain available in the complete original plan. The DAG supplies current acceptance checks; the original VALIDATION supplies the fixture only insofar as an explicit correction above does not supersede a false premise. Scope exclusions are enforced by the complete diff review.

| Requirement | Original wording retained for provenance | Effective current condition | Task coverage | Acceptance coverage |
| --- | --- | --- | --- | --- |
| R01 | Render only for saved notes (`!fresh`), appended inside the same `<small>` element: format `{author label} · {relative time}`. | Retained unchanged: Render only for saved notes (`!fresh`), appended inside the same `<small>` element: format `{author label} · {relative time}`. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R02 | Relative formatting: <60 s → "just now"; <60 min → "{m}m ago"; <24 h → "{h}h ago"; <30 d → "{d}d ago"; else local date `YYYY-MM-DD`. Implement in a module-level helper `formatNoteAge(iso: string): string` in TaskMemory.tsx (no new dependency; the repo already formats relative times in inbox components — receiver may reuse an existing exported helper if one exists with identical output; otherwise the local helper). | DECISION HOLD: retain the exact relative-time buckets and static helper behavior. Resolve local-calendar YYYY-MM-DD versus the supplied UTC-prefix snippet before implementing the date fallback; neither contradictory interpretation is silently selected. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R03 | `title` attribute on the `<small>` element shows the raw `updatedAt` ISO string. | Retained unchanged: `title` attribute on the `<small>` element shows the raw `updatedAt` ISO string. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R04 | `aria-label` unchanged on the author badge; timestamp is decorative text inside `<small>`, announced naturally. | Retained unchanged: `aria-label` unchanged on the author badge; timestamp is decorative text inside `<small>`, announced naturally. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R05 | Style unchanged: 11px `--muted` via existing `<small>` rule; add no new CSS unless spacing needed — decision: use a middle dot separator with one space each side, no new CSS. | Retained unchanged: Style unchanged: 11px `--muted` via existing `<small>` rule; add no new CSS unless spacing needed — decision: use a middle dot separator with one space each side, no new CSS. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R06 | Update behavior: timestamp reflects the note data as rendered (snapshot); it does not tick live. Decision: static render is acceptable; the conflict banner path re-renders anyway. | Retained unchanged: Update behavior: timestamp reflects the note data as rendered (snapshot); it does not tick live. Decision: static render is acceptable; the conflict banner path re-renders anyway. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |
| R07 | Reduced motion: none introduced. | Retained unchanged: Reduced motion: none introduced. | T01, T02 | Current AC checks below and original VALIDATION only where not explicitly corrected: AC-T01, AC-T02 |

## VALIDATION and release gate

Use the pinned dependency graph and the package-manager version declared by `package.json`; verify `pnpm --version` before setup. Run from the repository root. For product changes run `pnpm typecheck`, `pnpm build`, the focused unit check where the change has logic, and the discovered scoped Playwright configuration for the actual surface. Preserve and execute the full original fixture instructions below. Record exact commands, platform, browser version, fixture data, head SHA and counts; distinguish expected reproduction failures, passed regressions, skipped checks and owner-reported results. A new test is necessary where it proves the specific behavior or failure path, not merely because a file changed.

For this metadata revision, executed verification is source inspection, complete-body preservation, SHA256 comparison and document structure review only. Product tests, actual screen-reader checks, manual UI walks and main acceptance have not been rerun by this metadata worker. The concrete AC checks above are pending unless a cited implementation journal supplies producer evidence; such evidence is identified in STATE and still requires the appropriate reviewer gate. Retain all original positive, negative, browser and manual acceptance; correct only the explicitly false premise named above.

Release requires: all retained requirements mapped and satisfied; bounded decisions resolved in the full canonical body and identical versioned file; exact-head review and required CI; normal merge; and verification on main appropriate to the changed surface. An unresolved affected task remains BLOCKED, even when other tasks or artifact publication are complete.

## STATE

No implementation PR or executed feature test is established in the current issue journal. Latest recorded source journal: [full checkpoint context](https://github.com/skytuhua-org/Gen-V1/issues/2111#issuecomment-7128867696). This metadata worker has not taken over implementation, native verification or merge ownership. Existing active claims survive publication. The immediate next step is for the existing feature owner/reviewer to apply the source corrections, resolve only the named decision hold where present, and execute the first incomplete original task against the current PR or main. Report task status, exact evidence and remaining criteria on this issue, then RELEASE when stopping.

Canonical body publication is guarded by expected old SHA256 `263fc7a96dde4dca44eb863533a8b06c9823f76644a4e655d3008eb6bd714663`. Publish the complete identical Markdown through existing docs PR #1994 before replacing the body; if the body changes concurrently, stop that mutation and reconcile the new revision. The append-only receipt records the actual committed file URL and independently verified bytes. No closure is requested by this metadata revision.

## REFERENCES

- [Canonical issue and complete journal](https://github.com/skytuhua-org/Gen-V1/issues/2111)
- [Current source journal checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2111#issuecomment-7128867696)
- [Repository coordination](https://github.com/skytuhua-org/Gen-V1/issues/1803)
- [AGENTS.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md at reviewed baseline](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
- [apps/web/src/TaskMemory.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/TaskMemory.tsx)
- [apps/web/src/task-memory.css](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/task-memory.css)

## Retained complete original plan

# Plan: Show last-saved timestamp on saved thread-memory notes

## META
- Feature: `updatedAt` display in the Notes (Thread memory) list
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-24
- Baseline: main @ 9ddd536cc84c0f327ddf6133d485f8ab8baf294b
- Status: plan only, not implemented
- Source: code inspection of TaskMemory.tsx + fixture QA on http://127.0.0.1:4317

## OBJECTIVE
`note.updatedAt` is fetched but never rendered. Each note header shows `<strong>{key}</strong><small>Agent note | Your note</small>` — users cannot tell which note changed recently, which matters precisely when the "newer saved note" conflict banner appears.

**Measurable success:** every saved note header displays a relative timestamp (e.g. "2h ago") in the existing `<small>` line, with the absolute ISO time on hover via `title`.

## REQUIREMENTS
1. Render only for saved notes (`!fresh`), appended inside the same `<small>` element: format `{author label} · {relative time}`.
2. Relative formatting: <60 s → "just now"; <60 min → "{m}m ago"; <24 h → "{h}h ago"; <30 d → "{d}d ago"; else local date `YYYY-MM-DD`. Implement in a module-level helper `formatNoteAge(iso: string): string` in TaskMemory.tsx (no new dependency; the repo already formats relative times in inbox components — receiver may reuse an existing exported helper if one exists with identical output; otherwise the local helper).
3. `title` attribute on the `<small>` element shows the raw `updatedAt` ISO string.
4. `aria-label` unchanged on the author badge; timestamp is decorative text inside `<small>`, announced naturally.
5. Style unchanged: 11px `--muted` via existing `<small>` rule; add no new CSS unless spacing needed — decision: use a middle dot separator with one space each side, no new CSS.
6. Update behavior: timestamp reflects the note data as rendered (snapshot); it does not tick live. Decision: static render is acceptable; the conflict banner path re-renders anyway.
7. Reduced motion: none introduced.

## REPO_MAP
- `apps/web/src/TaskMemory.tsx` — header `<small>{note.author === 'agent' ? 'Agent note' : 'Your note'}</small>`; `note.updatedAt` in the snapshot payload.
- `apps/web/src/task-memory.css` — `.memory-note small` styling (muted, 11px via inherit); verify exact rule.

## DESIGN
```tsx
<small title={note.updatedAt}>
  {note.author === 'agent' ? 'Agent note' : 'Your note'} · {formatNoteAge(note.updatedAt)}
</small>
```
Helper:
```ts
function formatNoteAge(iso: string): string {
  const s = (Date.now() - Date.parse(iso)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
  return iso.slice(0, 10);
}
```

## EXECUTION_DAG
- T01 — Owner: frontend implementer. Add helper + render; check for an existing shared relative-time helper first (grep `ago` in apps/web/src) and reuse it only if output matches REQUIREMENTS 2 exactly. Done-when: all fixture notes show timestamps.
- T02 — Owner: frontend implementer (same commit). Vitest unit test for `formatNoteAge` boundaries + Playwright header assertion. Done-when: pass.

## VALIDATION
- Fixture repro: `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; await openReviewHost('/tmp/genv1-x', 4317)"` → http://127.0.0.1:4317 → thread → Add surface → Notes.
- Unit: boundary table for the helper (59 s → "just now", 61 s → "1m ago", 25 h → "1d ago", 40 d → date).
- Playwright: each saved note's `<small>` contains "·" and a non-empty relative string; hover shows ISO.
- Negative: create form shows no timestamp.

## STATE
Plan complete; no implementation started.

## REFERENCES
- Issue: this issue. Surface file: apps/web/src/TaskMemory.tsx.
