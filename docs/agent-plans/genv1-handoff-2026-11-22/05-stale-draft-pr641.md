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

## STATE / RISKS
- The diff may have become trivial (1 line) if main absorbed the rest —
  likely outcome is close; confirm via T01 rather than assuming.

## REFERENCES
- PR #641, ledger `state/inbox.md`, AGENTS.md.

## NEXT
Gen Runtime produces the coverage table → Gen PM decides.
