# CI: PR feedback under 1 min p50 / 2 min p95 without checking less — execution plan

## META
- Repo: skytuhua-org/Gen-V1 · Issue: https://github.com/skytuhua-org/Gen-V1/issues/1666
- PLAN_REV: 3 (2026-11-23). History: rev1 2026-11-22 (initial), rev2 2026-11-22 (maintainer: $0 budget, Blacksmith rejected, comment 7071834333), rev3 2026-11-23 (this: adds missing META/REQUIREMENTS/REPO_MAP/DESIGN/VALIDATION sections, records bun-test rejection and actual state; no requirement change).
- Baseline: main@1cbd02cd78e93771ddca6f0f490c31133919e44a (verified 2026-11-23T11:07Z).
- Linked PRs: merged #1667, #1669, #1670; open #1671, #1672, #1673; blocker fix #1898 (tracked on #1227).
- Status: partially implemented; speed target NOT met.
- Provenance: original task brief from the maintainer (session chat), audit in this issue, checkpoints in this issue's comments.

## OBJECTIVE
Make Gen-V1 CI as fast as possible without letting it lie. Target: a PR gets its result in under 1 minute at the median and under 2 minutes at p95, measured from push to final PR check result on real GitHub runs.

## REQUIREMENTS
In scope / rules that outrank speed (maintainer, verbatim intent):
- R1 The full suite runs before anything reaches `main`, in a merge queue. Selection only narrows PR feedback.
- R2 Never hide failures: no retries, wider timeouts, skipped tests, `continue-on-error` or `always()` masking. A check that needs a retry has a bug; find it.
- R3 Never check less: lint rules and required checks only stay or grow.
- R4 $0: no paid runners or services (rev2 decision; Blacksmith rejected). Repo is public, so GitHub-hosted minutes are free; limit is 20 concurrent jobs (Free plan).
- R5 Draft PRs schedule no runner jobs; ready PRs run checks + selected tests; `merge_group`, push to `main`, `workflow_dispatch` run the full suite.
- R6 Required contexts stay exactly: `Windows checks`, `Tests (shard 1/4)`..`(shard 4/4)`, `Browser tests`, `Installed desktop memory retention and opt-in`.
- R7 Timings claimed only from real GitHub runs (queue wait, setup, run, wall clock, runner-minutes); queued CI != pass.
Out of scope: changing test semantics, removing tests, paid infrastructure, self-hosted runners on a public repo (unsafe: untrusted PR code).

## REPO_MAP (verified on main@1cbd02cd unless noted)
- `.github/workflows/ci.yml` — CI workflow (folded `Windows checks` from #1667; selection + literal shard jobs on #1671; per-job budgets on #1673).
- `vitest.config.ts` — force-rerun triggers for selection (#1671).
- `tests/ci-draft-policy.test.ts` + CI policy tests — assert triggers, draft guard, required job names.
- `package.json` — `lint` = `tsx scripts/lint-ui.ts --check && bun lint --no-script`; `typecheck` = `bun check --no-script`; devDependency `bun@1.4.5-canary.20261121.1` (#1669/#1670).
- `.oxlintrc.json` — 1,021 explicit rules (533 error, 488 off where the repo currently violates them) (#1669).
- `hk.pkl`, `CONTRIBUTING.md` — opt-in hk hooks (#1672, open).
- Ruleset 27819131 on `main` — merge queue (MERGE, ALLGREEN, build 5, merge 5, check timeout 360 min) + the R6 required contexts; no review rule.

## DESIGN
- PR push books Windows checks + only the test shards the diff reaches (`vitest list --changed HEAD^1 --filesOnly` on a short Linux selection job; shard count sized to the selection; zero selected tests => no Windows test runner). Broad changes (config, CI, docs, scripts, fixtures, e2e) force all tests.
- Full suite (4 literal shard jobs, Browser, installed-memory) skipped on PRs with literal names so required contexts report, and run in `merge_group`.
- Per-job `timeout-minutes` ≈ 1.5× audited p95, never wider than before.
- Fast tooling: `bun lint` (oxlint rules), `bun check` typecheck.
- Known gap: a test that reads source files directly can be missed by PR selection; the merge queue still runs it before `main`.

## EXECUTION_DAG
| Task | Goal | Deps | State | Evidence / done-when |
|---|---|---|---|---|
| T01 | Audit last 150 CI runs | — | DONE | table below |
| T02 | Fold Windows checks/Desktop build/Hermes into one job; `merge_group` trigger | T01 | DONE | #1667 merged |
| T02b | Per-job budgets (no wider timeouts) | T02 | IMPLEMENTED | #1673 open, PR checks passed; queued after #1671 |
| T03 | `bun lint` pinned + `.oxlintrc.json` | — | DONE | #1669 merged via queue |
| T04 | `bun fmt` | T03 | NOT_STARTED | large reformat; sequence last |
| T05 | `bun check` typecheck | T03 | DONE | #1670 merged via queue (run 45112847393 7/7) |
| T06 | `bun test` | — | REJECTED | hundreds of failures/errors under bun test; Vitest kept |
| T07 | install/scripts on bun | T06 | BLOCKED | depends on rejected T06 |
| T08 | PR test selection + hidden-change red check | T02 | IMPLEMENTED | #1671 open; merge-group Browser failed twice from #1227 (runs 45101598407, 45121949413) |
| T09 | hk hooks | T03 | IMPLEMENTED | #1672 in merge queue |
| T10 | ~~Blacksmith~~ REJECTED; free alternatives (Linux selection job, caches, blobless checkout) | T08 | IN_PROGRESS | Linux selection job in #1671; caching/blobless NOT_STARTED |
| T11 | Merge-queue ruleset on `main` | T02 | DONE | ruleset 27819131 active |
| T12 | Two-week failure log; remove change-detector tests | T08 | NOT_STARTED | |
| T13 | Unblock T08: root-cause #1227 remaining host.close socket | — | IMPLEMENTED | #1898 (scope on #1227) |
| T14 | Re-run cancelled runs (211, list `cancelled-2026-11-23.tsv` on worker VM) only if PR open and head SHA unchanged | T08 | NOT_STARTED | automation armed |
| T15 | Measure real PR timings after T08/T02b land | T08,T02b | NOT_STARTED | |

## VALIDATION
- Planned: CI policy tests (`pnpm exec vitest run tests/ci-*.test.ts`), `actionlint .github/workflows/ci.yml`; real PR runs for draft (0 jobs), ready (checks+selected), `merge_group` (7/7 full suite); required names equal ruleset contexts; selection red check (hidden break in a core module fails PR run).
- Executed: policy tests 98/98 PASS on #1671; actionlint PASS; local selection counts empty=0, test-file=1, core module=114, broad=547; merge-group 7/7 PASS for #1669, #1670 (45112847393), #1815 (45117951623), #1228 (45121947837); #1671 merge group Browser FAIL x2 (#1227).
- Measured so far: Windows checks job ≈ 9 min run time with no queue; test selection ≈ 1 min; #1669 4.1 h from enqueue to merge (runner wait).
- Release gate: T08 + T02b merged via queue, then T15 numbers posted. Target p50<1 min / p95<2 min is NOT reachable on free Windows runners while `Windows checks` takes ≈9 min; record as finding, do not claim.

## STATE
- Owner: devin-cloud-37c167 (claim 7096892532). DONE: T01, T02, T03, T05, T11. IMPLEMENTED: T02b, T08, T09, T13. REJECTED: T06. NOT_STARTED: T04, T12, T14, T15. BLOCKED: T07.
- Risks: free-runner queue saturation (20 concurrent jobs shared by ~200 open PRs); #1227 Windows-only shutdown hang.
- Next: enqueue #1898 once its PR checks report, then #1671 behind it; #1673 after #1671; then T14, T15.

## Audit (T01) — last 150 completed `CI` runs (2026-11-21T05:21Z → 2026-11-22T00:21Z)
Run conclusions: 60 success, 57 cancelled, 33 failure. All jobs on GitHub-hosted `windows-2022`; org is on the **Free** plan (20 concurrent hosted jobs, shared across every workflow).

Per job, seconds (waiting = `started_at − created_at`; setup = Set up job + checkout + `.github/actions/setup` + post steps; running = everything else):

| Job | n | wait p50 | wait p95 | setup p50 | setup p95 | run p50 | run p95 |
|---|---|---|---|---|---|---|---|
| Installed desktop memory retention and opt-in | 150 | 32319 | 49512 | 169 | 211 | 1984 | 2361 |
| Browser tests | 150 | 31985 | 49108 | 182 | 214 | 988 | 1245 |
| Tests (4 shards) | 600 | 32724 | 49284 | 169 | 214 | 417 | 657 |
| Hermes contracts | 150 | 32626 | 47742 | 166 | 205 | 163 | 221 |
| Windows checks | 150 | 32337 | 49135 | 160 | 198 | 104 | 140 |
| Desktop build | 150 | 31979 | 48331 | 154 | 194 | 11 | 15 |

Totals over the 150 runs: **waiting 9103 h**, setup 43.6 h, running 145.7 h. Successful-run wall clock (created → last job done): p50 **10.9 h**, p95 **14.9 h**. Each run consumes ~187 runner-minutes across 9 jobs; at ~8 runs/h that needs ~25 concurrent runners against a 20-job cap, so the queue grows without bound (286 runs queued at audit time, ~100 open PRs).

**Biggest bucket: waiting (98% of wall time).** It is a capacity problem: demand exceeds the free 20-job cap. Decision (rev 2, maintainer): **$0 budget — stay on free GitHub-hosted runners**.

Measured locally (8 vCPU Linux) for the tool switch: `tsc --noEmit` 27.6 s vs `bun check` 0.64 s (both 0 errors); `pnpm lint` 21.5 s vs `bun lint` 0.04 s; `bun fmt --check` 0.13 s (3516 files would reformat); `pnpm install` 10.5 s.

## REFERENCES
- Checkpoints: issue #1666 comments (latest worker devin-cloud-37c167).
- #1227 (Browser shutdown hang), #993, #1031.
- AGENTS.md: https://github.com/skytuhua-org/Gen-V1/blob/1cbd02cd78e93771ddca6f0f490c31133919e44a/AGENTS.md
