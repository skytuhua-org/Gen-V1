## Outcome
`README.md` and `docs/` have no broken links, outdated commands or typos.

## Scope
- Check every link with `pnpm check:docs-links` and by hand, and run every documented command to confirm it still works. Docs only, except fixing a script whose documented behavior is clearly the intended one.
- Fix what you find in the source when it is a clear bug. Keep public behavior unless a fix needs it to change, and say so in the PR body.
- One concern per PR, each under 400 lines, linked to this issue. Skip any file changed by an open PR.

## Done when
- `pnpm check:docs-links` reports 0 broken and every documented command was run, with the results in the PR body.
- `pnpm lint`, `pnpm typecheck` and `pnpm test` pass on each PR, and the PRs merge through the normal gate.

Mechanical work for a free session or smaller model. Coordinate on this issue per AGENTS.md.

[Written by Devin](https://app.devin.ai/sessions/3ec16cd8dc2e450da822fc30c43dd218)

---

# Fix plan (rev 1) — Docs: broken links and stale commands

## META
- Feature: Fix broken links and stale commands in docs
- Repo: github.com/skytuhua-org/Gen-V1
- Plan revision: 1 — 2026-11-20
- Baseline: branch `main` @ `7ef0710c90a479233f8dd9fe484a296f8c3c86d3` (verified `git rev-parse HEAD`)
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1060
- Current status: reviewed; findings enumerated below from commands executed on the baseline
- Source provenance: plan authored by devin-a-cloud-b7d3e9 (review/planning role) from live repo inspection

## OBJECTIVE
`README.md` and `docs/` report 0 broken links under `pnpm check:docs-links` and every documented command still runs. Measurable success: `pnpm check:docs-links` exits 0; every command in the verification matrix (T03) was executed and its result recorded in the PR body.

## REQUIREMENTS
- In scope: Markdown link repair in `docs/` (and `README.md` if new defects appear there); verification of documented commands; source fixes only where a documented behavior is clearly a bug (none found on this baseline).
- Out of scope: `README.md` is already changed by open PR #952 (docs fix) — do not touch it in this issue's PRs; do not rewrite historical ledger entries in `docs/implementation/` whose references record a past CI run (see F2); external URLs (checker skips them; `pnpm check:docs-links --external` may be run but failures there are advisory only); no behavior changes.
- Decisions (agreed): single docs-only PR, one concern; all findings fixed in that one PR.
- Error/recovery: if a new breakage appears between baseline and PR open, fix forward in the same PR only if it is docs; otherwise report on the issue.

## REPO_MAP (verified on baseline)
- `docs/progress.md:5` — broken anchor link `../CHANGELOG.md#unreleased--065-visual-workspace-preview`. `pnpm check:docs-links` output: `no heading or anchor "#unreleased--065-visual-workspace-preview" in CHANGELOG.md`. Checker totals: 94 Markdown files, 784 links, 1 broken, 0 warnings, 39 skipped as uncommitted.
- `CHANGELOG.md:5` — current heading is `## 0.6.5 — YYYY-MM-DD`; the section describes 0.6.5 as a "Source preview covering changes since v0.6.1". GitHub-style slug for that heading is `065--yyyy-mm-dd` (em dash and periods dropped, spaces → hyphens).
- `docs/implementation/v6/M15/handoff-postmerge.md:91` — references `scripts/installed-workbench-custody.ts`, which does not exist on main. It is a historical CI-failure record inside a dated handoff ledger, not live documentation. Decision: leave unchanged; do not "fix" history. If the implementer wants belt-and-braces, annotate with a parenthetical `(file existed only on the verification branch; never merged to main)` — optional, same PR.
- `package.json` scripts (verified present): `capture:ui dev start build build:widgets typecheck lint:ui lint check:docs-links test:ui-guard test test:no-lease build:credential-lease test:browser test:e2e agent:login fixtures:create eval desktop:dev desktop:build desktop:package build:plugin-runtime build:plugin-api plugin`. Every `pnpm <name>` script referenced in README/docs matches one of these.
- Referenced script files (verified present): `scripts/test-browser.ts`, `scripts/build-review-index.ts`, `scripts/verify-installed-desktop.ts`, `scripts/verify-readiness.ts`, `scripts/research-baseline.ts`, `scripts/build-desktop.ts`, `scripts/m15-record.mjs`, `node_modules/vitest/vitest.mjs`.
- Files changed by open PRs to skip: `README.md` (#952), `packages/plugins/*.ts` + `docs/plugin-api.md` (#951/#953), `packages/widgets` (#1111/#1122/#1123), `tests/` typing PRs (#982/#1008/#1035/#1036), `scripts/verify-subscription-accounts` (#1039), `evals` (#968), plus any files in PRs #1141/#1143 (docs plan publications — check overlap before editing `docs/` plans directories).

## DESIGN
Single mechanical PR. Exact edit:

F1 — `docs/progress.md` line 5. Current:
```md
The root `package.json` is version `0.6.5`; [CHANGELOG.md](../CHANGELOG.md#unreleased--065-visual-workspace-preview) identifies it as an unreleased visual workspace preview, not a published stable installer.
```
Replace the link target and align the claim with the CHANGELOG's own wording:
```md
The root `package.json` is version `0.6.5`; [CHANGELOG.md](../CHANGELOG.md#065--yyyy-mm-dd) identifies it as a source preview, not a published stable installer.
```
Done-when: `pnpm check:docs-links` prints `0 broken`. If the anchor slug is rejected by the checker (slug rules differ), fall back to removing the `#…` fragment entirely and link to `../CHANGELOG.md`; that is guaranteed valid and loses only scroll-position precision.

F2 — no code change; see REPO_MAP for rationale.

Command-verification matrix (the documented commands that must be executed and recorded):
| Command | Expected result |
|---|---|
| `pnpm install` | exits 0 |
| `pnpm typecheck` | exits 0 |
| `pnpm lint` | exits 0 |
| `pnpm check:docs-links` | exits 0 after F1 |
| `pnpm test` | exits 0 (record pass count; file-access/path-guard failures on Linux are documented env limits — if they appear, note them and rerun the suite's stable subset, or verify on Windows CI) |
| `pnpm build` | exits 0 |
| `pnpm lint:ui` | exits 0 |
| `pnpm test:ui-guard` | exits 0 |
| `pnpm check:docs-links --external` | report only; external flakes are not a blocker |

Spot-check `tsx scripts/test-browser.ts --help`-style invocations only if docs claim a specific output; do not run the full browser harness unless the doc's claim is about it.

## EXECUTION_DAG
- T01 — Edit `docs/progress.md` per DESIGN F1. Deps: none. Tests: `pnpm check:docs-links` → 0 broken. Done-when: link resolves.
- T02 — Optional annotation of `docs/implementation/v6/M15/handoff-postmerge.md:91` (see REPO_MAP decision; skip is acceptable). Deps: none.
- T03 — Run the command-verification matrix; paste the table with PASS/FAIL per command into the PR body. Deps: T01 (for check:docs-links row). Done-when: every row has an executed result.
- T04 — Open one docs-only PR linked to this issue. Deps: T01–T03. Done-when: `pnpm lint`, `pnpm typecheck`, `pnpm test` green on the PR; merge through normal gate.

## VALIDATION
- Setup: `pnpm install` on a clean main checkout.
- Executed at planning time (results, baseline): `pnpm check:docs-links` → 1 broken (F1); script existence check → all present; `package.json` script names → all doc-referenced names exist.
- Planned (implementer): T03 matrix; `pnpm lint && pnpm typecheck && pnpm test` on the PR branch; `pnpm check:docs-links` must exit 0.
- Acceptance matrix: each "Done when" criterion ↔ check: 0 broken links → check:docs-links; commands verified → T03 table in PR body; gates → CI.
- Release gate: normal PR review + CI; docs-only.

## STATE
- Researched/verified: findings F1–F2, script inventory, open-PR skip list.
- Implemented: nothing (planning only).
- Pending: T01–T04.
- Risks: `pnpm test` may show unrelated flaky Browser tests failures on Linux (#993 teardown timeout, latency p95) — record, do not fix here.
- Next step: implementer claims the issue, runs T01.

## REFERENCES
- Issue #1060; AGENTS.md plan contract; `scripts/check-doc-links.mjs` (checker implementation); `docs/progress.md`, `CHANGELOG.md`, `docs/implementation/v6/M15/handoff-postmerge.md` on baseline `7ef0710`.

<!-- gen-v1-audit-plan-revision:2026-11-23:1060 -->

## November audit plan revision
**Revision:** `audit-2026-11-23-r1`. **Repository baseline:** `main@a64e9e2d03ce09c843bff0480d81311f2012c812` (GitHub read during triage). **Canonical issue:** #1060.

### Objective and requirements
**Current guides and stale commands from both audit rounds.** 08 Themes B–C, 12 §8.3 and 13 §6.1. The existing issue owns live guides and command/link corrections.
Keep the issue's existing scope, requirements and assigned implementation work. Refresh related PRs at the beginning of the reproduction.

### Reproduction gate
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

### Execution and validation
- **Guide evidence — Re-run each live command or link.** Verify the command and linked source at pinned main, capture the actual failure or changed behavior, and record the supported replacement or remove the instruction if the capability was retired.
- **Release claims — Check owner-approved capability policy.** Trace generated-app wording and platform descriptors to current source and acceptance. Get the product decision before presenting behavior as an enabled release guarantee. Keep archived qualification receipts pinned to their original SHA.
- **Validation — Run the repository docs checks.** Run `pnpm check:docs-links` and verify touched commands in a disposable test context. Require each edited claim to name the version, platform or enabled state when it matters.

### State and handoff
New audit checks are planned. This revision records source and issue triage only. The implementing agent records independent RED, the exact accepted fix or no-repro disposition, GREEN, and any installed or native gate on this issue. Follow the issue's existing dependency and review order.

### References
Audit trackers #1848 and #1946. Follow-up coordination #1860 and #1886.
[Prior version of the attached Markdown plan](https://github.com/skytuhua-org/Gen-V1/blob/40720a98c878175e6b475d8e69cc1ab2b0c5731d/docs/agent-plans/1060-fix-broken-links-and-stale-commands-in-docs.md).

