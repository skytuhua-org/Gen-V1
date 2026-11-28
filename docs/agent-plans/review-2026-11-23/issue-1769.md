[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1769.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1769](https://github.com/skytuhua-org/Gen-V1/issues/1769). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

All five listed queue PRs remain open and unintegrated. The installed Windows rc-review gate and [#972](https://github.com/skytuhua-org/Gen-V1/issues/972) contrast follow-up tracking remain part of completion; a healthy main alone does not drain this queue.

### Reviewed implementation references

- [PR #951](https://github.com/skytuhua-org/Gen-V1/pull/951): open; head `3710ac68847d713c3d3adcbe2b271d8765620d60`; base `main`; not recorded as merged into the audit baseline.
- [PR #1732](https://github.com/skytuhua-org/Gen-V1/pull/1732): open; head `7157e64c86e62ccfcd77e615d7008ac5a9f82c24`; base `main`; not recorded as merged into the audit baseline.
- [PR #1733](https://github.com/skytuhua-org/Gen-V1/pull/1733): open; head `be93acd1f540079745cf77cfe02e48759341e68b`; base `main`; not recorded as merged into the audit baseline.
- [PR #1738](https://github.com/skytuhua-org/Gen-V1/pull/1738): open; head `6a1ce49080563d4d871e4147ee90850a23c9d544`; base `main`; not recorded as merged into the audit baseline.
- [PR #1739](https://github.com/skytuhua-org/Gen-V1/pull/1739): open; head `86cd86e1c9626e2fc7e9fc58d96559cc7ae4ef5f`; base `main`; not recorded as merged into the audit baseline.

## REQUIREMENTS

Keep the five exact PR concerns and the original lane ownership. Each landing needs current-head checks, required review, healthy main and any stated Security gate. #1739 also retains the full installed Windows rc-review evidence, and T04 must identify a concrete owner/issue or PR for the #972 contrast follow-up. Do not count a queued run as passing or a Linux harness run as installed Windows evidence.

## DESIGN

T01 processes only a gate-ready PR, records its merge SHA and then T02 checks any resulting conflict cascade. T03 is the independent #1739 installed validation; T04 tracks the contrast follow-up independently. Failure in a required gate keeps that PR pending and does not authorize bypassing it. #951 edits seven plugin contract/host files; #1732 edits `docs/feature-map.md` and `docs/plugin-api.md`; #1733 edits `settings.css` and `theme-contrast.test.ts`; the #1738/#1739 maps below remain valid. All five were still open and unintegrated in the audited snapshot.

## REFERENCES

Canonical queue: https://github.com/skytuhua-org/Gen-V1/issues/1769. Coordination: https://github.com/skytuhua-org/Gen-V1/issues/1041. Required PR links are retained in the queue table; issue #1771 consumes the completed changelog/queue evidence.

---

Canonical plan file: [`docs/agent-plans/genv1-handoff-2026-11-22/06-merge-queue.md`](https://github.com/skytuhua-org/Gen-V1/blob/d96bca4c/docs/agent-plans/genv1-handoff-2026-11-22/06-merge-queue.md) · plans PR: https://github.com/skytuhua-org/Gen-V1/pull/1763

Filed by Chief of Staff at Xian's request (2026-11-22). The full plan follows; the canonical issue body is authoritative; the linked file is the historical published copy.

---

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
