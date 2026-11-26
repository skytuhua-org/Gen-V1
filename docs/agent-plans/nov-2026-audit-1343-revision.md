## Problem
An earlier pass removed unused exports by hand (#969, #971, #973), and `tsconfig.json` sets `noUnusedLocals`/`noUnusedParameters`, but nothing catches unused **files**, unused **exports** added since then, or unused **dependencies** in `package.json`. The repo has about 25k lines in `apps/`, 39k in `packages/` and 11k in `scripts/`.

## Scope
1. Run [knip](https://knip.dev) once (`pnpm dlx knip`) with a config that knows the real entry points: `apps/server/main.ts`, `apps/web/src/main.tsx`, `apps/desktop/main.ts`/`preload.ts`, `scripts/*.ts` used by `package.json` scripts and workflows, `tests/**`, plugin entry points, and files loaded dynamically (workers, `registry.tsx` lazy imports, `scripts/public-source-files.json` runtime list). Post the raw findings here.
2. Check each finding by hand. Many integrations are loaded by path or are runtime-vendored (`promptfoo`, `@biomejs/*`, Python workers), so they are **not** unused just because no TS file imports them.
3. Remove confirmed dead code in small PRs grouped by package; update `scripts/public-source-files.json` for removed files.
- Decide with the maintainer whether to add knip to CI; not required for this issue.

## Done when
- [ ] Findings posted with a keep/remove decision per item.
- [ ] Removal PRs merged with net line counts in each PR description.
- [ ] `pnpm typecheck`, `pnpm build` and `pnpm test` pass.

## Coordination
Follow [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md): claim scope in a comment before editing, one concern per PR, link the PR here, post RELEASE (`OWNER=NONE`) when you stop. Check open PRs that touch the same files before starting.

[Written by Devin](https://app.devin.ai/sessions/a31c7ce24556455b803aede9894b5c7b)

<!-- gen-v1-audit-plan-revision:2026-11-23:1343 -->

## November audit plan revision
**Revision:** `audit-2026-11-23-r1`. **Repository baseline:** `main@a64e9e2d03ce09c843bff0480d81311f2012c812` (GitHub read during triage). **Canonical issue:** #1343.

### Objective and requirements
**First-party dead code and exports inventory.** 04 deletion/duplication sections, 07 deletion inventory and 13 §6; overlap with the already-executed sweep in #1886.
Keep the issue's existing scope, requirements and assigned implementation work. Refresh related PRs at the beginning of the reproduction.

### Reproduction gate
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

### Execution and validation
- **Inventory — Match candidates to current source.** Check each candidate against source, dynamic/native entry points, contracts, older persisted records, scripts/tests, public exports and in-flight PRs. Record already removed, keep with consumer, delete with evidence, or owner decision.
- **Patch — Prove dead or redundant before removal.** Reproduce the unused status with a tracked consumer walk or show two implementations of the same contract. Split backend, frontend and tooling changes into independently reviewable PRs. Preserve protected bytes and generation boundaries.
- **Acceptance — Confirm real entry points after removal.** Run typecheck, affected unit/host/browser suites and production build or bundle checks for changed entry points. Verify old persisted data still opens where the format is supported. No runtime behavior or feature removal without explicit disposition.

### State and handoff
New audit checks are planned. This revision records source and issue triage only. The implementing agent records independent RED, the exact accepted fix or no-repro disposition, GREEN, and any installed or native gate on this issue. Follow the issue's existing dependency and review order.

### References
Audit trackers #1848 and #1946. Follow-up coordination #1860 and #1886.

