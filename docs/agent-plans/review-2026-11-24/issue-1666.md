> Plan file (SHA-pinned): https://github.com/skytuhua-org/Gen-V1/blob/1d739e99e34c7a148c9462dc6f27ae0880568444/docs/agent-plans/1666-ci-pr-feedback-under-1-min.md — PLAN_REV 5. Issue body below is the complete plan.

# CI: PR feedback under 1 min p50 / 2 min p95 without checking less — execution plan

## META
- Repo: skytuhua-org/Gen-V1 · Issue: https://github.com/skytuhua-org/Gen-V1/issues/1666
- PLAN_REV: 5 (2026-11-24). History: rev1 2026-11-22 (initial), rev2 2026-11-22 (maintainer: $0 budget, Blacksmith rejected, comment 7071834333), rev3 2026-11-23 (adds missing META/REQUIREMENTS/REPO_MAP/DESIGN/VALIDATION sections, records bun-test rejection; file pinned at 56458042e9183c0d68e197e628229918fc5beb2b on closed, unmerged #1899, whose copy is consolidated in open #1994), rev4 2026-11-24 (state after all PRs merged, T14/T15 results, T09a hook fix, new baseline; no requirement change; file at 71c80cefe4739004be6ea51c5a128a862230aacf on #2114), rev5 2026-11-24 (this: maintainer approved T10 caching and queueing #2113/#2114 on 2026-11-24 11:56 UTC, "approve, but review them on your own again"; T10 narrowed to the measured node-gyp header download, #2117; earlier "~1–2 min per Windows job" estimate corrected to up to ~40 s measured from one log).
- Baseline: main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b (verified 2026-11-24T11:14Z).
- Linked PRs: merged via merge queue #1667, #1669, #1670, #1671, #1672, #1673; #1227 fixes #1228 and #1898 merged; open #2113 (T09a), #2114 (this plan file), #2117 (T10 header cache).
- Status: implemented except T04, T10 caching, T12; speed target NOT met (see VALIDATION).
- Provenance: original task brief from the maintainer (session chat; the rules are restated verbatim in REQUIREMENTS), audit in this issue, checkpoints in this issue's comments.

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

## REPO_MAP (verified on main@9ddd536c unless noted)
- `.github/workflows/ci.yml`: CI workflow. Folded `Windows checks` (#1667), PR diff selection plus literal full-suite shard jobs `test-1`..`test-4` (#1671), per-job `timeout-minutes` budgets (#1673). `select` runs on `ubuntu-latest`; every other job runs on `windows-2022`.
- `vitest.config.ts`: `forceRerunTriggers` that make broad changes select every test (#1671).
- `tests/ci-draft-policy.test.ts` and the other `tests/ci-*.test.ts` policy tests: assert triggers, draft guard, required job names, and literal names on PR-skipped required jobs.
- `package.json`: `lint` = `tsx scripts/lint-ui.ts --check && bun lint --no-script`; `typecheck` = `bun check --no-script`; `test` = `pnpm build:credential-lease && pnpm build:widgets && vitest run`; devDependency `bun@1.4.5-canary.20261121.1` (#1669, #1670).
- `.oxlintrc.json`: 1,021 explicit rules (533 error, 488 off where the repo currently violates them) (#1669).
- `hk.pkl`, `CONTRIBUTING.md`: opt-in hk hooks (#1672 merged). The pre-push `tests` step runs `pnpm exec vitest run` on main and skips the widget build; #2113 (open) changes it to `pnpm test`.
- `apps/server/server.ts`, `tests/host-close-connections.test.ts`: per-socket request accounting that closes idle sockets on `preClose` (#1898, tracked on #1227); `apps/server/event-stream.ts` late-SSE guard (#1228).
- Ruleset 27819131 on `main`: merge queue (MERGE, ALLGREEN, build 5, merge 5, check timeout 360 min) plus the R6 required contexts; no review rule.

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
| T02b | Per-job budgets (no wider timeouts) | T02 | DONE | #1673 merged via queue 2026-11-24T04:03Z |
| T03 | `bun lint` pinned + `.oxlintrc.json` | — | DONE | #1669 merged via queue |
| T04 | `bun fmt` | T03 | NOT_STARTED | large reformat (3516 files); sequence last; needs maintainer go-ahead |
| T05 | `bun check` typecheck | T03 | DONE | #1670 merged via queue (run 45112847393 7/7) |
| T06 | `bun test` | — | REJECTED | hundreds of failures/errors under bun test; Vitest kept |
| T07 | install/scripts on bun | T06 | BLOCKED | depends on rejected T06 |
| T08 | PR test selection + hidden-change red check | T02 | DONE | #1671 merged via queue 2026-11-24T02:37Z, merge group 7/7 |
| T09 | hk hooks | T03 | DONE | #1672 merged via queue |
| T09a | Pre-push `tests` step builds widgets/lease first (`pnpm test --changed <merge-base>`) | T09 | IMPLEMENTED | #2113 open; done when merged via queue |
| T10 | ~~Blacksmith~~ REJECTED; free alternatives (Linux selection job, caches, blobless checkout) | T08 | IN_PROGRESS | Linux selection job DONE (#1671). Caching APPROVED by the maintainer 2026-11-24. Measured in job 138222769095: `Install toolchain` 205 s = setup-node with pnpm-store cache restore 33 s + `pnpm install` 151 s (linking 18 s, node-gyp header download/unpack 40 s, node.lib + Visual Studio discovery 14 s, node-pty compile ~78 s). #2117 caches `~\AppData\Local\node-gyp\Cache` on Windows keyed on OS, arch and exact `node --version`; install and compile still run in every job. Done when #2117 merges via the queue and a Windows run shows a cache hit with lower `Install toolchain` time. Follow-up (not started, needs its own decision): check why pnpm's side-effects cache does not skip the node-pty compile on CI |
| T11 | Merge-queue ruleset on `main` | T02 | DONE | ruleset 27819131 active |
| T12 | Two-week failure log; remove change-detector tests | T08 | NOT_STARTED | log window starts 2026-11-24 |
| T13 | Unblock T08: root-cause #1227 remaining host.close socket | — | DONE | #1898 merged via queue 2026-11-24T02:37Z; #1227 closed `completed` by the maintainer 2026-11-24T05:12Z |
| T14 | Re-run cancelled runs only if PR open and head SHA unchanged | T08 | DONE | 86 of 211 re-run, 126 skipped (PR closed or pushed); comment 7122117459 |
| T15 | Measure real PR timings after T08/T02b land | T08,T02b | DONE | VALIDATION "Measured"; target not met |

## VALIDATION
- Planned: CI policy tests (`pnpm exec vitest run tests/ci-*.test.ts`), `actionlint .github/workflows/ci.yml`; real PR runs for draft (0 jobs), ready (checks+selected), `merge_group` (7/7 full suite); required names equal ruleset contexts; selection red check (hidden break in a core module fails PR run).
- Executed before rev4: policy tests 98/98 PASS on #1671; actionlint PASS; local selection counts empty=0, test-file=1, core module=114, broad=547; merge-group 7/7 PASS for #1669, #1670 (45112847393), #1815 (45117951623), #1228 (45121947837), #1898 and #1671 (Browser `host-loop.spec.ts:389` passed in 5.7 s); #1671 merge-group Browser FAIL x2 before #1898 (runs 45101598407, 45121949413, cause #1227).
- Executed 2026-11-24 review (Linux, Node 24.22.2, main@9ddd536c): `actionlint .github/workflows/ci.yml` PASS; `pnpm exec vitest run tests/ci-draft-policy.test.ts tests/bun-lint-config.test.ts tests/bun-check-typecheck.test.ts tests/host-close-connections.test.ts tests/public-source.test.ts` PASS 5 files / 48 tests; `pnpm lint` PASS (20.4 s); `pnpm typecheck` PASS (0.8 s, 1,511 files). T09a: old pre-push command on a clean worktree FAIL (`Trusted widget receiver is missing`), new command PASS 6/6, `hk validate` PASS.
- Not run: the hk Windows (PowerShell) variant on a Windows host; a two-week flake log (T12).
- Measured (real GitHub runs, first attempts only, `run_attempt == 1`): 3 early samples 12.1, 27.8, 31.2 min wall (comment 7122117459). 19 completed PR runs created 2026-11-24T02:39Z–04:24Z on the new workflow: wall clock p50 57.5 min, p95 399.5 min, max 401.8 min; 18 success, 1 failure. Per run, longest job queue wait p50 45.3 min, p95 376.9 min; longest job run p50 8.8 min; `Windows checks` run p50 8.7 min (5.5–9.4). The 86 T14 re-runs were queued in the same window and added to runner contention.
- Cost: $0. All jobs run on free GitHub-hosted runners (public repo); no paid runner, service or secret was added.
- Release gate: met for T08 and T02b (merged via queue, T15 posted). Target p50<1 min / p95<2 min is NOT met and not reachable on free Windows runners while `Windows checks` runs ≈9 min and the 20-job cap is saturated; recorded as a finding, not claimed.

## STATE
- Owner: devin-cloud-37c167 until its RELEASE checkpoint on this issue. DONE: T01, T02, T02b, T03, T05, T08, T09, T11, T13, T14, T15. IMPLEMENTED: T09a (#2113). IN_PROGRESS: T10 (header cache #2117 open, CI queued). REJECTED: T06. NOT_STARTED: T04, T12. BLOCKED: T07.
- Risks: free-runner queue saturation (20 concurrent jobs shared by ~200 open PRs) dominates wall time; selection can miss a test that reads source files directly (merge queue still runs it).
- Next: queue #2113, #2114 and #2117 once their PR checks pass (maintainer-approved; no self-merge bypass); measure the T10 saving on a Windows cache hit; maintainer decides on T04; T12 log after two weeks.

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
- Checkpoints: issue #1666 comments by devin-cloud-37c167 (latest substantive before rev4: https://github.com/skytuhua-org/Gen-V1/issues/1666#issuecomment-7122117459).
- #1227 (Browser shutdown hang, closed), #993, #1031; plan-mirror consolidation #1994.
- AGENTS.md: https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md
