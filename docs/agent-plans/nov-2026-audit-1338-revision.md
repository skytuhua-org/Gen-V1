## Problem
`packages/core/service.ts` is the largest source file in the repo: one `export class Service` of 2,352 lines. It mixes many domains: operation preparation, context results, project memory, background controllers and run cancellation, composer prediction, skills/learning, compaction, request context and inference, resource/artifact data, and more. That makes it hard to review and puts it at the center of merge conflicts (feature plans #1235, #1242 and #1288 all touch it).

## Scope
- Keep the public `Service` API exactly the same (callers in `apps/server` and tests must not change).
- Move cohesive private method groups into collaborators in `packages/core/` (for example `service-memory.ts`, `service-compaction.ts`, `service-request-context.ts`, `service-skills.ts`) that `Service` delegates to. Confirm the boundaries by reading the code; post the proposed split on this issue before the first PR.
- One domain per PR, each under about 400 changed lines; pure moves only, no behavior changes.
- Register new files in `scripts/public-source-files.json` (`source`, and `runtime` because the server imports them).
- Out of scope: renaming public methods, changing behavior or contracts.

## Done when
- [ ] Split proposal posted here.
- [ ] `service.ts` is below 800 lines.
- [ ] `pnpm typecheck` and `pnpm test` pass on each PR; no test changes other than import paths.

## Coordination
Follow [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md): claim scope in a comment before editing, one concern per PR, link the PR here, post RELEASE (`OWNER=NONE`) when you stop. Check open PRs that touch the same files before starting.

[Written by Devin](https://app.devin.ai/sessions/a31c7ce24556455b803aede9894b5c7b)

<!-- gen-v1-audit-plan-revision:2026-11-23:1338 -->

## November audit plan revision
**Revision:** `audit-2026-11-23-r1`. **Repository baseline:** `main@a64e9e2d03ce09c843bff0480d81311f2012c812` (GitHub read during triage). **Canonical issue:** #1338.

### Objective and requirements
**Service decomposition and overlapping extraction PRs.** 04 architecture observations, 09 §5. Preserve the issue's existing domain breakdown and staged migration.
Keep the issue's existing scope, requirements and assigned implementation work. Refresh related PRs at the beginning of the reproduction.

### Reproduction gate
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

### Execution and validation
- **Conflict check — Refresh all Service extraction branches.** Compare `packages/core/service.ts` import, disposal, store command and domain API changes against current main and each other. Select dependencies and one integration order; shared hunks need an explicit owner.
- **Proof — Capture behavior before moving code.** Exercise representative task, cancellation, save and recovery flows in a host fixture. Use the same assertions after each extraction. Preserve handler identity, state custody and ordering.

### State and handoff
New audit checks are planned. This revision records source and issue triage only. The implementing agent records independent RED, the exact accepted fix or no-repro disposition, GREEN, and any installed or native gate on this issue. Follow the issue's existing dependency and review order.

### References
Audit trackers #1848 and #1946. Follow-up coordination #1860 and #1886.

