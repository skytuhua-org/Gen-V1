# Plan 06 — Merge queue: drain gated PRs + FE contrast follow-up

## META
- Repo: skytuhua-org/Gen-V1 · Plan rev: 2 · 2026-11-22
- Baseline: `main@36fcc56d24cef7558059264a8540d7f0592d93cd`
- Status (verified 2026-11-22): all five PRs open and mergeable; each waits
  on required CI + healthy main. Owning lane merges its own PR; CoS tracks.

## OBJECTIVE
Land the five queued PRs in order as each reaches the standard merge gate
(REV CLEAN + required CI green on the exact head + main green + no blocking
comments; SEC CLEAN additionally where the diff touches auth/secrets/plugin
isolation), and file the leftover #972 contrast follow-up.

## QUEUE (verified 2026-11-22)

| PR | Lane | Branch | Content | Recorded next step |
|---|---|---|---|---|
| [#951](https://github.com/skytuhua-org/Gen-V1/pull/951) | REL | `devin/1795130729-plugin-api-jsdoc` | comment-only change; typecheck/lint/docs-links already green | merge on CI + green main |
| [#1732](https://github.com/skytuhua-org/Gen-V1/pull/1732) | FE | `devin/1795366085-plugin-api-doc-drift` | docs match plugin-frame workspace detachment; check:docs-links clean | verify required gates on exact head |
| [#1733](https://github.com/skytuhua-org/Gen-V1/pull/1733) | FE | `devin/1795366129-switch-contrast` | theme-contrast fix; 36/36 vitest, lint clean; full suite not run | wait for required CI + healthy main |
| [#1738](https://github.com/skytuhua-org/Gen-V1/pull/1738) | REL | `devin/1795371265-changelog-pending-gates` | changelog/release-notes: move #788/#789/#936 from pending to shipped; #589/#896/#782 stay pending | merge after required CI + green main |
| [#1739](https://github.com/skytuhua-org/Gen-V1/pull/1739) | QA | `devin/rc-review-reattach-fix` | rc-review `reattachNotes` fix (swallow "Target closed" only when notes window confirmed closed; poll ≤15s); 16/16 local vitest; Windows installer run pending | QA merges after final review clearance + green required CI + healthy main |

Note: #953 and #959 have MERGED since the ledger snapshot — they are out of
the queue. #788 is closed.

## REPO_MAP
- #1739 touches `scripts/rc-review/upgrade-check.ts` (harness only; no
  product code) + `tests/rc-review.test.ts`.
- #1738 touches `CHANGELOG.md` and `docs/public/release-notes.md` only.
- #1733 touches theme/contrast styles (`rg "contrast|--border" apps/web`).

## EXECUTION_DAG
- T01 — for each PR top-down: re-check required checks on the **exact head
  SHA** (not a stale run); merge when green and main is green. Do not merge
  onto red main; if main is red, Gen QA fixes main first (rule R8).
  Done-when per PR: merge commit on main.
- T02 — after each merge, confirm no conflict cascade on remaining open PRs
  (areas are disjoint; only re-check if GitHub reports conflicts).
- T03 — #1739 only: QA runs the full Windows `rc-review` installer check on
  the Windows VM per QA's own gate (author note: authored on Windows VM;
  Linux run done).
- T04 — #972 follow-up (separate small item): FE files/handles the "switch
  contrast" follow-up noted when #972 merged — a distinct contrast issue,
  not part of this queue; create/confirm its own tracked issue or small PR.

## VALIDATION
- Each PR's recorded checks stay green on the final head; merge commits land
  on main.
- Done-when: queue empty and the #972 follow-up has its own tracked issue.

## NEXT
Lanes merge their own PRs; Chief of Staff only tracks.
