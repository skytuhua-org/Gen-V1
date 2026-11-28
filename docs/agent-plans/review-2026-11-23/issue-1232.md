**Full current issue mirror:** [issue-1232.md](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1232.md). The publication checkpoint pins the exact commit.

## Current reconciliation, 2026-11-24

Revision: `2026-11-24-audit-r1`. Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1232. Source audit: `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Coordination: #1803, `cleanup-2026-11-23-r2`. State: **OPEN**.

the historical checkpoint created labels and classified 93 issues, but #1233 taxonomy/automation publication remains open. Its all-done checkbox is stale; historical classification is not proof of present coverage across 333 issues.

Current completion checklist: labels were created and 93 then-open issues were classified in checkpoint 7056840523. Publication of the taxonomy and first-pass automation remains unchecked because #1233 is open and `.github/workflows/issue-labeler.yml` is absent from audited main. Current coverage of all open issues has not been re-certified by this cleanup. The taxonomy itself is preserved below.

This revision corrects progress and evidence status. It preserves the accepted requirements below. Earlier “not started”, “open PR”, owner, and test statements are historical where this reconciliation gives a newer explicit result. Current ownership remains governed by the live append-only journal; this audit does not release another worker’s implementation claim.

### Verification and remaining work

The issue body, complete paged journal and referenced PR states were reconciled. Existing test receipts remain bound to their stated branch/platform. The source inspections explicitly named above were executed in this audit; no local application tests, native installed acceptance or visual capture are newly claimed. Required tests in the retained plan remain planned until a cited result discharges them. Resume the remaining gate named above through the existing candidate PR and owner, preserving its task IDs and review requirements.

### Evidence

- https://github.com/skytuhua-org/Gen-V1/issues/1232#issuecomment-7056840523
- https://github.com/skytuhua-org/Gen-V1/issues/1232#issuecomment-7057863124
- https://github.com/skytuhua-org/Gen-V1/pull/1233

### Plan publication repair

The complete previously authored plan is restored below from [the immutable source](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/docs/agent-plans/1232-issue-label-system-type-area-and-difficulty-taxonomy.md); it had been published as a file while the issue body held only the intake. Its baseline and design remain as authored. Current progress, corrections and remaining gates are stated above. Paths labelled discovery still require source confirmation before edits.

---

# Issue label system: type, area and difficulty taxonomy — execution plan

## META
- Repo: skytuhua-org/Gen-V1 · Plan revision: 1 (2026-11-21)
- Baseline: main @ e883ac0327c834120d89c3697dec7380a342ba4d
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1232
- Status: plan only — no implementation authorized by this document. Source provenance: issue body reproduced verbatim under REQUIREMENTS so nothing is lost.

## OBJECTIVE
Issue label system: type, area and difficulty taxonomy. Success is the issue's own completion criteria met and verified on main.

## REQUIREMENTS

### Current issue intake (preserved)

Documents the label taxonomy now applied across open issues, requested by the maintainer to make the backlog more organized.

## Taxonomy

### Type (what kind of work)
- `bug` — something is broken
- `enhancement` — new feature or improvement
- `documentation` — docs changes
- `type:refactor` — cleanup with no behavior change (casts, dedupe, dead code)
- `type:test` — add/fix tests, verification and acceptance work
- `type:security` — security fixes, hardening, vulnerable dependencies
- `type:tracking` — umbrella issue grouping sub-tasks (sweeps, worker issues, audits)

### Area (where it lives)
- `area:frontend` — web/desktop UI
- `area:runtime` — server, core and runtime packages
- `area:ci` — CI workflows, test infrastructure, scripts
- `area:docs` — documentation

### Level — difficulty (who/what can take it)
- `level:low` — mechanical work, safe for free sessions or smaller models
- `level:medium` — focused change with some design or risk
- `level:high` — design-heavy work for stronger models

### Priority — backlog order
- `priority:high` — blocks the release or other work in flight; do first
- `priority:medium` — normal backlog order
- `priority:low` — nice to have; pick up when free

### Standing labels (unchanged)
`accessibility`, `ci-test`, `deferred`, `good first issue`, `help wanted`, `duplicate`, `invalid`, `question`, `wontfix`

## Conventions
- Every open issue should carry at least one type and one difficulty; area and priority where they apply.
- `type:tracking` issues group sub-tasks and stay open until the children land.
- `deferred` stays the signal for out-of-scope work.
- New issues are first-pass labeled by the `issue-labeler` workflow (PR #1233) and confirmed by agents per AGENTS.md.

## Done when
- [x] New labels created (incl. priority:*)
- [ ] Current open-issue inventory has type/area/level/priority coverage (93-issue historical pass recorded; current coverage not re-certified)
- [ ] Taxonomy + auto-label rule published into AGENTS.md and issue-labeler workflow (PR #1233 remains open)

### Previously published specification
Documents the label taxonomy now applied across open issues, requested by the maintainer to make the backlog more organized.

## Taxonomy

### Type (what kind of work)
- `bug` — something is broken
- `enhancement` — new feature or improvement
- `documentation` — docs changes
- `type:refactor` — cleanup with no behavior change (casts, dedupe, dead code)
- `type:test` — add/fix tests, verification and acceptance work
- `type:security` — security fixes, hardening, vulnerable dependencies
- `type:tracking` — umbrella issue grouping sub-tasks (sweeps, worker issues, audits)

### Area (where it lives)
- `area:frontend` — web/desktop UI
- `area:runtime` — server, core and runtime packages
- `area:ci` — CI workflows, test infrastructure, scripts
- `area:docs` — documentation

### Level — difficulty (who/what can take it)
- `level:low` — mechanical work, safe for free sessions or smaller models
- `level:medium` — focused change with some design or risk
- `level:high` — design-heavy work for stronger models

### Priority — backlog order
- `priority:high` — blocks the release or other work in flight; do first
- `priority:medium` — normal backlog order
- `priority:low` — nice to have; pick up when free

### Standing labels (unchanged)
`accessibility`, `ci-test`, `deferred`, `good first issue`, `help wanted`, `duplicate`, `invalid`, `question`, `wontfix`

## Conventions
- Every open issue should carry at least one type and one difficulty; area and priority where they apply.
- `type:tracking` issues group sub-tasks and stay open until the children land.
- `deferred` stays the signal for out-of-scope work.
- New issues are first-pass labeled by the `issue-labeler` workflow (PR #1233) and confirmed by agents per AGENTS.md.

## Done when
- [x] New labels created (incl. priority:*)
- [ ] Current open-issue inventory classified (historical 93-issue pass retained; current coverage not re-certified)
- [ ] Taxonomy + auto-label rule published into AGENTS.md and issue-labeler workflow (PR #1233 remains open)

## REPO_MAP
Verified at baseline unless marked discovery:
- `docs/` — location for the taxonomy doc (name TBD, e.g. docs/issue-labels.md)
- `AGENTS.md` — may need a pointer to the taxonomy

## DESIGN
Document the label taxonomy already applied across open issues: type, area, level and priority labels, with when to apply each. Docs only.

## EXECUTION_DAG
| Task | Goal | Deps | Done when |
|------|------|------|-----------|
| T01 | Write the taxonomy doc from the issue's taxonomy | NONE | doc covers type/area/level/priority tables |
| T02 | Add a pointer from contributor-facing docs | T01 | discoverable link |

## VALIDATION
- `pnpm lint`, `pnpm typecheck` and `pnpm test` (or the focused suite named in the issue) green on each PR.
- Issue-specific acceptance reproduced and evidenced per the criteria above; browser/Windows-only checks run on a Windows worker or CI.
- Each PR linked to issue #1232; merge only through the normal gate (required CI + independent review).

## STATE
- Researched: issue scope + verified REPO_MAP entries. Not started: all tasks. Owner: unassigned (this plan's author released the claim).
- Exact next step: claim the issue per AGENTS.md, then execute T01.

## REFERENCES
- Issue #1232: https://github.com/skytuhua-org/Gen-V1/issues/1232
- AGENTS.md claim/checkpoint/handoff rules: https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md
