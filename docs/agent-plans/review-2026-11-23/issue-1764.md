[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1764.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1764](https://github.com/skytuhua-org/Gen-V1/issues/1764). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

PR [#896](https://github.com/skytuhua-org/Gen-V1/pull/896) now publishes ac25284de39ec060a5143e29006ff01511e774ad, contradicting the local-only status. Current main merge conflicts are App.tsx, task-interface-fixture.ts and vitest.config.ts. Authorization history, retry regression and acceptance gates remain unresolved.

### Reviewed implementation references

- [PR #896](https://github.com/skytuhua-org/Gen-V1/pull/896): open; head `ac25284de39ec060a5143e29006ff01511e774ad`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7091759977](https://github.com/skytuhua-org/Gen-V1/issues/1764#issuecomment-7091759977). Earlier claims, tests, review findings and releases remain in the append-only journal.

## DESIGN: recovery and integration

Use the published #896 tree at `ac25284de39ec060a5143e29006ff01511e774ad` as the recoverable source. The old private-bundle assertion is historical: the named head is now available remotely. T02 first compares published `824ca2aa..ac25284d` and the current PR, records included commits and any missing material, and only requests an original private artifact if a necessary difference cannot be recovered publicly. Do not replay already published changes. The historical authorization finding is not resolved merely by a readable branch.

Dependency order remains T01 clearance, T02 source reconciliation, T03 retry regression and T04 matched-base failure comparison, T05 authorized conflict-free publication, T06 exact-head review/CI/main gate. On failure preserve the head, record failed commands and unchanged acceptance, and hand the concrete blocker to the existing FE owner. Current conflicts are `apps/web/src/App.tsx`, `tests/e2e/task-interface-fixture.ts`, and `vitest.config.ts`. The complete T00-T17 product specification is recoverable at [the published head](https://github.com/skytuhua-org/Gen-V1/blob/ac25284de39ec060a5143e29006ff01511e774ad/gen-v1-ui-acceptance-plan.md). Private ledger decisions remain unavailable to this reviewer; they are not reconstructed or declared cleared.

---

Canonical plan file: [`docs/agent-plans/genv1-handoff-2026-11-22/01-ui-repair-pr896.md`](https://github.com/skytuhua-org/Gen-V1/blob/d96bca4c/docs/agent-plans/genv1-handoff-2026-11-22/01-ui-repair-pr896.md) · plans PR: https://github.com/skytuhua-org/Gen-V1/pull/1763

Filed by Chief of Staff at Xian's request (2026-11-22). The full plan follows; the canonical issue body is authoritative; the linked file is the historical published copy.

---

# Plan 01 — Resume and land PR #896 (UI acceptance repair, T00–T17)

## META
- Repo: skytuhua-org/Gen-V1 · Plan rev: 2 · 2026-11-22
- Baseline: `main@36fcc56d24cef7558059264a8540d7f0592d93cd`
- PR: https://github.com/skytuhua-org/Gen-V1/pull/896 — open, mergeable (no
  conflicts, verified 2026-11-22), branch `repair/ui-acceptance-20261118` →
  `main`, pushed head `824ca2aa`.
- Tracking issue: #1098.
- Status: **BLOCKED on write authorization** (Security finding below). No code
  writes until cleared.
- Private bundle (local-only commits `ac25284d` on `be114e2d`):
  `files/ledger/private-artifacts.json` → `pr896-ac25284d.bundle`. Auth-gated;
  do not repost the URL in public issues.
- Provenance: Xian request 2026-11-22; ledger `state/inbox.md` decisions.

## OBJECTIVE
Land the eighteen-outcome UI acceptance repair delivery (`repair/ui-acceptance-20261118`,
tasks T00–T17 from `gen-v1-ui-acceptance-plan.md`): headline fixes include
non-main detach no longer wiping main's selection (`detachDesiredMainSelection`),
compact secondary-conversation presentation, dock previews, pending dedup,
keyboard float resize, 64px opt-in edge slack in `clampChatRect` for live move
drags, shared surface launcher (Open/Hide), slim chat rail, sidebar collapse,
retired Code Review/Research/Custom/Visuals surfaces, settings
navigation/search, sign-in surviving Settings lifetime, subscription readiness
accuracy, four agent threads per row with ≥2/3 history, nested-artifact
collapse, trailing topic-box removal, dense plan in narrow drawer, semantic
state colors. Success = PR merged via an authorized identity with the missing
retry regression test added and CI green on the final head.

## Historical STATE (verified 2026-11-22)
- SEC found pushes to this PR's head were made via a fallback org credential
  after proxy denial — unauthorized. Hold since ~18:37Z. INBOX-10 asks Xian
  for GitHub push attribution; INBOX-11 asks for the original Devin grant
  scope. No token values requested.
- FE's last full e2e run on this head: **1938 pass / 12 fail**; overlap of
  those 12 with failures present on main is unconfirmed.
- Local-only commits exist inside the private bundle: "saved layouts" push
  plus 2 fixes + evidence, head `ac25284d` on `be114e2d`.
- No queued merges; published branches left intact.
- Diff size vs merge-base: ~95 files, +3312/−1964 (includes large spec
  updates under `tests/` and ~480 lines of `tests/split-app-browser.test.ts`).

## REQUIREMENTS
- In scope: verify/reapply the local-only commits, add the missing
  **regression test for the retry behavior** requested at review, re-run
  gates, merge at the standard gate.
- Out of scope: any write via org-token fallbacks; restacking #967 (plan 02);
  redesign of repaired UI.
- Constraint: earliest authorized claim owns scope — stays with Gen
  Frontend's existing worker once its write grant is confirmed. Do not spawn
  replacement workers.

## REPO_MAP
- Repair surface: `apps/web/src/` (workspace layout, chat rail, dock, settings;
  exact file set is the 95-file PR diff — see PR files view).
- Drag/resize logic: `clampChatRect` and `detachDesiredMainSelection` in
  `apps/web/src` (locate with `rg "clampChatRect|detachDesiredMainSelection"
  apps/web`).
- Affected specs (diff-touched): `tests/e2e/*.spec.ts` (~20 files incl.
  `shared-panels.spec.ts`, `short-tool-overflow.spec.ts`,
  `snapshot-performance.spec.ts`, `t3-centered.spec.ts`, `workspace-ui.spec.ts`),
  `tests/split-app-browser.test.ts`, `tests/path-access.test.ts`,
  `tests/review-host.test.ts`, `tests/gesture-cleanup.test.ts`,
  `vitest.config.ts`.
- Retry path for the new regression test: locate from the PR diff — search
  `git diff <merge-base>..pr896 -- '*retry*'` and the review comment naming
  the missing test.

## EXECUTION_DAG
- T01 **BLOCKER** — write clearance for the FE worker (CoS escalates via
  INBOX-10/11; Xian-approved token is `GEN_V1_ORG_GITHUB_TOKEN`). Done-when:
  a push to a scratch branch under the FE worker's identity succeeds.
- T02 — fetch `pr896-ac25284d.bundle`; `git bundle verify`, then compare
  `ac25284d` vs pushed head `824ca2aa` (`git log 824ca2aa..ac25284d --oneline`)
  to enumerate the unpushed commits. Done-when: a written list of commits to
  reapply.
- T03 — add the regression test for the retry behavior named in review:
  locate the retry path from the PR diff, write the vitest case beside the
  existing spec for that module. Done-when: test fails without the fix on
  `main@36fcc56d` and passes on the branch.
- T04 — re-run the FE e2e subset covering the 12 previously failing specs;
  run the same specs on `main@36fcc56d`; produce a pass/fail overlap table.
  Done-when: every residual failure is proven pre-existing on main or fixed.
- T05 — push the branch via the authorized identity; post an AGENTS.md
  CHECKPOINT on #1098 (CoS batches these; worker may comment directly if it
  has write). Done-when: PR head shows the new SHA, no conflicts.
- T06 — merge at gate: REV CLEAN on the new head + required CI green + main
  green + no blocking comments; SEC CLEAN if the diff touches
  auth/secrets/plugin isolation. Done-when: #896 shows Merged.

## VALIDATION
- `source ~/.nvm/nvm.sh`
- `pnpm typecheck && pnpm lint && pnpm check:docs-links`
- `pnpm build:widgets && npx vitest run tests/<affected>.test.ts`
- FE e2e rerun of the previously failing 12 specs; record PASS/FAIL counts
  vs the same specs on `main@36fcc56d`.
- Acceptance matrix: all PR-body outcomes T00–T17 verified on final head.
- Done-when: PR #896 merged via authorized write; retry regression test
  committed and green.

## Historical STATE / RISKS
- Risk: the credential investigation concludes the pushed head itself is
  tainted → the fallback commits may need re-authoring under the approved
  identity rather than a fast-forward push. Escalate to Xian if so.
- History note: REV CHANGES history exists on the PR; reviewer asked for the
  retry regression test and (on #967) screenshots.

## REFERENCES
- PR #896, issue #1098, plan 02 (restack depends on this merge SHA),
  plans 06/08 (queue + release gates), AGENTS.md checkpoint format.
- Private artifacts index: `files/ledger/private-artifacts.json`.

## NEXT
Chief of Staff obtains write clearance → Gen Frontend resumes same worker at T02.
