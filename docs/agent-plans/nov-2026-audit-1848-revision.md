# Backend audit swarm — coordination issue

## META
- Feature: Read-only swarm audit of the Gen-V1 harness codebase (backend/runtime scope) and backend-relevant open PRs
- Repo: `skytuhua-org/Gen-V1`
- Plan rev: audit-rev1, 2026-11-22 UTC
- Audit base: `origin/main` @ `8f54f406b80f2d7d8ac09cc2a46557c125d681fa` (clean worktree; local checkout is ~80 commits behind)
- Coordinator: `devin-t3-pi-c03c32` (Devin via t3-code, local Raspberry Pi host)
- Source provenance: user request — "spawn a swarm of ai agent worker to audit the entire codebase (including PRs)… 30+ workers … defer front end … read only … compose a complete detailed audit .md"

## OBJECTIVE
Audit the entire non-frontend codebase and backend-relevant open PRs across six dimensions: **performance, code cleanliness/simplicity, redundant/dead code, security, stability, bugs**. Deliverable: one detailed audit report (`.md`) with deduplicated findings, each carrying file:line evidence, severity, impact, and a recommendation. READ-ONLY — no code changes; findings and recommendations only.

## REQUIREMENTS / SCOPE
- IN SCOPE: `apps/desktop` (Electron main/preload), `apps/server`, `packages/core`, `packages/contracts`, `packages/runtime*`, `packages/workspace`, `packages/storage`, `packages/capabilities`, `packages/integrations`, `packages/plugins`, `packages/agent-projection`, `packages/desktop-contract`, `packages/research`, `packages/skill-*`, `scripts/`, `tests/` (quality/coverage), `evals/`, `third-party/` (catalog-level), root configs/CI/patches, `plugins/personal-visuals` (non-visual logic), open PRs with backend-relevant file changes.
- DEFERRED (frontend, per user + tracked separately under #1281): `apps/web` visual/UX audit, `packages/ui-shell`, `packages/ui-catalog`, `packages/widgets` styling/UX, docs-only agent-plan PRs.
- Non-destructive: workers read only; the report identifies deletable code but deletes nothing.

## EXECUTION_DAG (worker tasks; all independent, parallel)
| ID | Scope | Dimensions |
|----|-------|-----------|
| W01–W03 | `packages/core` in 3 slices (~20.4k LOC) | all six |
| W04 | `packages/contracts` (4.3k) | all six |
| W05 | `packages/runtime-hermes` (3.2k) | all six |
| W06 | `packages/workspace` (3k) | all six |
| W07 | `packages/runtime-official` + `runtime-login` | all six |
| W08 | `packages/runtime-pi` + `packages/runtime` | all six |
| W09 | `apps/desktop` Electron main | all six, security-weighted |
| W10 | `apps/server` | all six, security-weighted |
| W11 | `packages/capabilities` + `integrations` + `plugins` | all six |
| W12 | `packages/agent-projection`,`desktop-contract`,`research`,`skill-*`,`storage` | all six |
| W13–W14 | `scripts/` in 2 slices (~11.8k) | all six |
| W15–W16 | `tests/` quality: unit half / e2e+fixtures half | bugs, stability, redundancy |
| W17 | `evals/` + `docs/` + `third-party/` catalog + `plugins/personal-visuals` | redundancy, security |
| W18 | root configs, `patches/`, `.github/` CI workflows | stability, security, perf |
| W19 | secrets/credentials/token sweep | security |
| W20 | command/injection surface (exec/spawn/eval/fs paths) | security, bugs |
| W21 | Electron/IPC/preload security boundary | security |
| W22 | HTTP/network/URL/SSRF/input-validation surface | security, bugs |
| W23 | dependency & supply chain (package.json, lockfile, patches) | security, redundancy |
| W24 | sync I/O + blocking hot paths | performance |
| W25 | async/concurrency correctness (await, races, rejections) | stability, bugs |
| W26 | memory/leaks (listeners, timers, subprocesses, caches) | stability, performance |
| W27 | duplicate utilities/implementations across packages | redundancy, cleanliness |
| W28 | dead code: unused exports/files/flags/fixtures | redundancy, cleanliness |
| W29 | unused deps + redundant config | redundancy |
| W30 | error-handling audit (swallowed catch, missing finally/cleanup) | stability, bugs |
| W31 | data integrity: encoding, JSON, path traversal, TOCTOU | security, bugs |
| W32–W34 | open backend-relevant PR diffs, in ~3 batches | all six |
| W35 | git-ops/credential-store boundary deep-dive | security, stability |
| W36 | test/verify/evidence-script integrity (eval gates, verify-*) | stability, bugs |

## VALIDATION / ACCEPTANCE
- Every worker returns structured findings (`SEV | category | file:line | evidence | impact | recommendation`).
- Coordinator dedupes, cross-references, spot-verifies evidence, and composes the final report.
- DONE-WHEN: ≥30 workers completed, all six dimensions covered, every finding carries file:line evidence, report delivered to the user.

## STATE
- W01–W36: NOT_STARTED → launching
- Final report path: `audit-reports/AUDIT-backend-2026-11-22.md` (local, unpublished unless requested)

## Audit follow-up plan revision

Revision `audit-index-r1`, 2026-11-23 Pacific time. Follow-up review pinned GitHub main at `a64e9e2d03ce09c843bff0480d81311f2012c812`. The historical round-one report and this issue name different checked-out sources. Reconcile that provenance before carrying an observation to current main.

Round-one remediation is tracked in #1860 and #1886. The complete report-by-report index across both rounds is in #1946. Follow-ups preserve the original audit scope and use existing issue and PR owners.

### Reproduction and acceptance

The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

- Start with the canonical work item in #1946. Confirm current source, disposition any previous fix, and keep open-PR-only findings with the relevant PR.
- Before a fix, record a baseline result and the regression that fails. After a fix, record passing evidence and any independent native or installed acceptance still pending.
- Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for private reporting.

