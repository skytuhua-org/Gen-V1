[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1768.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1768](https://github.com/skytuhua-org/Gen-V1/issues/1768). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Draft [#641](https://github.com/skytuhua-org/Gen-V1/pull/641) contains three changed paths (.github/workflows/ci.yml, WorkspaceSplitLayout.tsx, project-memory-host.spec.ts), has child [#670](https://github.com/skytuhua-org/Gen-V1/pull/670) and is not integrated into main. The one-line-only and likely-close claims are unsupported; retain until coverage and PM disposition.

### Reviewed implementation references

- [PR #641](https://github.com/skytuhua-org/Gen-V1/pull/641): open, draft; head `fcf99f0e56d4195b750fc9652caaca0cd9262ab2`; base `complete/m05-study-host-protocol-20261117`; not recorded as merged into the audit baseline.

Latest journal read: [7091760461](https://github.com/skytuhua-org/Gen-V1/issues/1768#issuecomment-7091760461). Earlier claims, tests, review findings and releases remain in the append-only journal.

## REQUIREMENTS

Preserve every unique assertion/change and the current child-stack dependency before any disposition. Closing is allowed only with explicit covering work and the PM decision required by T02. Do not delete unrelated refs or retarget a parent while ignoring children. No age-based or title-based duplicate determination is accepted.

## REPO_MAP

Verified #641 head `fcf99f0e56d4195b750fc9652caaca0cd9262ab2` against base `complete/m05-study-host-protocol-20261117@4a1ca25f3760efb36b8273bc04a11e1b5596f09c` changes `.github/workflows/ci.yml`, `apps/web/src/WorkspaceSplitLayout.tsx`, and `tests/e2e/project-memory-host.spec.ts`. It has open child #670 and is not an ancestor of the audited main. The original single-line-only statement is superseded by this verified inventory.

## DESIGN

T01 compares each of the three path deltas against the declared base and main, then records covering commits/specs or unique work and child effects. T02 gives that complete table to the existing PM role. T03 follows the recorded keep/close decision, preserving the child chain. A mergeable tree is only merge feasibility; it does not prove equivalent coverage. Failure to establish coverage keeps the draft open with an explicit gap.

---

Canonical plan file: [`docs/agent-plans/genv1-handoff-2026-11-22/05-stale-draft-pr641.md`](https://github.com/skytuhua-org/Gen-V1/blob/d96bca4c/docs/agent-plans/genv1-handoff-2026-11-22/05-stale-draft-pr641.md) · plans PR: https://github.com/skytuhua-org/Gen-V1/pull/1763

Filed by Chief of Staff at Xian's request (2026-11-22). The full plan follows; the canonical issue body is authoritative; the linked file is the historical published copy.

---

# Plan 05 — Reconcile stale draft PR #641

## META
- Repo: skytuhua-org/Gen-V1 · Plan rev: 2 · 2026-11-22
- Baseline: `main@36fcc56d24cef7558059264a8540d7f0592d93cd`
- PR: https://github.com/skytuhua-org/Gen-V1/pull/641 — **open draft**,
  mergeable (verified 2026-11-22), branch
  `review/m05-reject-host-restart-20261117` → base
  `complete/m05-study-host-protocol-20261117`.
- Status: on hold per RT: "hold; compare coverage on main, then route
  evidence to PM".
- **Rev-2 correction:** the rev-1 plan described a `project-memory-host.spec.ts`
  e2e test; the current head diff vs merge-base is a **single 1-line change**
  in `apps/web/src/WorkspaceSplitLayout.tsx` (head `fcf99f0e`, "fix: resolve
  stale CI regressions (verification dispatch re-raise, split drop edge)").
  T01 below must first determine what the draft actually still contains.

## OBJECTIVE
Decide the draft's fate: either merge it through the normal gate or close it
with a documented reason. Success = the draft is no longer an unowned open
draft — merged, or closed with a comment naming the covering work.

## EXECUTION_DAG
- T01 — inventory what the head actually changes vs its base and vs main:
  `git fetch origin pull/641/head:pr641; git diff $(git merge-base main pr641)..pr641`.
  Also read the PR's full history (the project-memory-host spec may have been
  dropped or superseded). Produce a coverage map: each remaining
  assertion/change → covered on main? by which PR/spec? Done-when: written
  coverage table.
- T02 — route the coverage table to Gen PM for the keep/close call (PM owns
  issue/test acceptance routing per ledger). Done-when: PM decision recorded.
- T03 — If PM says keep: undraft, retarget base to `main` (current base is a
  merged side-branch), refresh, REV review, merge at gate. If close: close
  the draft with a comment linking the covering specs/PRs; delete nothing
  else.

## VALIDATION
- Evidence = the coverage table itself (posted on the PR or its issue).
- If kept: the change runs green on the refreshed branch
  (`pnpm typecheck && pnpm lint`, affected specs).
- Done-when: draft is either merged or closed with a documented reason.

## Historical STATE / RISKS
- The diff may have become trivial (1 line) if main absorbed the rest —
  likely outcome is close; confirm via T01 rather than assuming.

## REFERENCES
- PR #641, ledger `state/inbox.md`, AGENTS.md.

## NEXT
Gen Runtime produces the coverage table → Gen PM decides.
