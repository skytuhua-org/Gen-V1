[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1940.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1940](https://github.com/skytuhua-org/Gen-V1/issues/1940). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Host-close fix [#1898](https://github.com/skytuhua-org/Gen-V1/pull/1898) is merged and subsequent merge-group/main Browser runs pass, satisfying the tracked Browser gate. Docs repair [#1941](https://github.com/skytuhua-org/Gen-V1/pull/1941) remains open; external Docs-links PASS on main is still required.

### Reviewed implementation references

- [PR #1941](https://github.com/skytuhua-org/Gen-V1/pull/1941): open; head `f85a849da45ee6d76dfc23af297a465fc893e740`; base `main`; not recorded as merged into the audit baseline.
- [PR #1898](https://github.com/skytuhua-org/Gen-V1/pull/1898): merged; merge `ae373ff8d85de56364a97cf8bbff35ec32597a99`.
- [PR #1920](https://github.com/skytuhua-org/Gen-V1/pull/1920): open; head `eec8d20229fc05d86ee01e5fe43d0f504952f464`; base `main`; not recorded as merged into the audit baseline.
- [PR #1937](https://github.com/skytuhua-org/Gen-V1/pull/1937): open; head `8967067e02f0fa311af2835bd9374ffd1ff568bd`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7118749586](https://github.com/skytuhua-org/Gen-V1/issues/1940#issuecomment-7118749586). Earlier claims, tests, review findings and releases remain in the append-only journal.

### Task-state correction

T02's tracked host-close fix [#1898](https://github.com/skytuhua-org/Gen-V1/pull/1898) merged at `ae373ff8d85de56364a97cf8bbff35ec32597a99`. The issue #1227 journal records passing post-fix merge-group Browser runs [45301371690](https://github.com/skytuhua-org/Gen-V1/actions/runs/45301371690) and [45301370020](https://github.com/skytuhua-org/Gen-V1/actions/runs/45301370020). Subsequent main [45318044111 Browser job](https://github.com/skytuhua-org/Gen-V1/actions/runs/45318044111/job/138189564451) passed both split-workspace and project-memory/affected-context exercises. T02's recorded Browser gate is satisfied; this is a bounded run result, not a measured zero-flake rate. T01 remains implemented only in open #1941. Completion still requires its accepted landing and `node scripts/check-doc-links.mjs --external` passing on main.

---

## Requested outcome
Review every recent CI failure on `skytuhua-org/Gen-V1` and fix them, starting with the ones that break `main` and the merge queue.

## Triage (runs created 2026-11-23 UTC, conclusion=failure)
| Failure | Where | Cause | Owner / fix |
|---|---|---|---|
| Browser tests: `tool-effects-host.spec.ts:12` (21 runs), `host-loop.spec.ts:389` (9 runs) | 9 merge-group runs + most PR runs | `host.close` waits on a surviving socket during HostFixture restart (#993, #1227) | Already claimed: PRs #1898 (server preClose), #1920 (fixture preconnect), #1937 (fixture `closeAllConnections`), all green on PR CI, awaiting review/merge |
| Docs links (push + schedule on `main`) | 4 runs on main | 2 dead external URLs: expired artifact link in `docs/agent-plans/1227-fix-runtime-reject-late-sse-registration-after-serve.md:14`; deleted upstream file in `docs/reference/superseded-generative-ui-plan.md:542` | This issue |
| Tests shards, Windows checks (lint/typecheck), Installed desktop memory retention | PR branches only | Branch-specific changes (e.g. Project overview region removed on on-demand-overview branches; manifest entries missing from `scripts/public-source-files.json`) | Each PR's own owner |
| Install toolchain | single PR run 45135895124 | Transient runner/toolchain failure | Rerun |

## Scope of this issue
- T01: fix the 2 dead Markdown links so `Docs links` is green on main.
- T02: track the host-restart Browser-tests flake fix through the existing PRs (no duplicate implementation).

## Completion criteria
- `node scripts/check-doc-links.mjs --external` passes on main.
- Merge-group `Browser tests` passes after the host-close fix merges.
