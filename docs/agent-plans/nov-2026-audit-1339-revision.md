## Problem
`apps/web/src/App.tsx` is 1,210 lines and has about 120 `useState`/`useEffect` calls. Every UI change touches it: at the time of writing, open PRs #1167, #1174, #1200, #1203, #1253, #1256, #1305 and #1307 all modify it. That causes constant conflicts and makes re-render behavior hard to reason about.

## Scope
- Move cohesive state and effects into custom hooks (for example `useThreadSelection`, `useWorkspaceLayout`, `useComposerState`, `useSnapshotSync`) and presentational sections into components under `apps/web/src/`. Confirm groupings by reading the code and post the plan here first.
- Start after the open App.tsx PRs listed above have merged or closed, or land one small extraction at a time and rebase often. Do not reformat lines you do not move.
- Behavior and DOM output stay the same; Playwright specs must pass unchanged.
- Register new files in `scripts/public-source-files.json` (`source`).
- Out of scope: visual changes, new features, performance work tracked in #1057 (link to it if an extraction also fixes a measured cost).

## Done when
- [ ] Extraction plan posted.
- [ ] `App.tsx` is below 500 lines.
- [ ] `pnpm typecheck`, `pnpm test` and the affected browser suites (`pnpm test:e2e --suite <name>`) pass on each PR.

## Coordination
Follow [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md): claim scope in a comment before editing, one concern per PR, link the PR here, post RELEASE (`OWNER=NONE`) when you stop. Check open PRs that touch the same files before starting.

[Written by Devin](https://app.devin.ai/sessions/a31c7ce24556455b803aede9894b5c7b)

<!-- gen-v1-audit-plan-revision:2026-11-23:1339 -->

## November audit plan revision
**Revision:** `audit-2026-11-23-r1`. **Repository baseline:** `main@a64e9e2d03ce09c843bff0480d81311f2012c812` (GitHub read during triage). **Canonical issue:** #1339.

### Objective and requirements
**App shell ownership and effect decomposition.** 04 architecture observations, 07 §11.7, and 09 §5. Preserve shell identity and the issue's existing staged extraction.
Keep the [current extraction plan and checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/1339#issuecomment-7060416132) and current extraction PR owner. Run these checks when accepting changed behavior.

### Reproduction gate
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

### Execution and validation
- **Baseline — Record real shell behavior.** Exercise thread selection and snapshot refresh, panel detach/dock/close and draft handoff using existing browser and desktop fixture entry points. Confirm the symptoms or the existing branch overlap before an edit.
- **Extraction — Move cohesive state under its existing owner.** Stage one domain at a time. Ensure effects are installed once, release their subscriptions, preserve initial load and cover stale completions after thread change. Confirm keyboard and focus behavior with the existing controls.

### State and handoff
New audit checks are planned. This revision records source and issue triage only. The implementing agent records independent RED, the exact accepted fix or no-repro disposition, GREEN, and any installed or native gate on this issue. Follow the issue's existing dependency and review order.

### References
Audit trackers #1848 and #1946. Follow-up coordination #1860 and #1886.

