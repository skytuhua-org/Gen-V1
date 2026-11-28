[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1766.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1766](https://github.com/skytuhua-org/Gen-V1/issues/1766). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Current [#970](https://github.com/skytuhua-org/Gen-V1/pull/970) head 4b4a87adf355ef88416f014623e98333d9beb365 merges cleanly to [#948](https://github.com/skytuhua-org/Gen-V1/pull/948) and main; the old conflict assertion is stale. [#948](https://github.com/skytuhua-org/Gen-V1/pull/948) landing, Security review and authorized merge remain required; no need to replay a private bundle blindly.

### Reviewed implementation references

- [PR #970](https://github.com/skytuhua-org/Gen-V1/pull/970): open; head `4b4a87adf355ef88416f014623e98333d9beb365`; base `devin/1795128376-kimi-entitlement-probe`; not recorded as merged into the audit baseline.

## DESIGN: current-head reconciliation

The reviewed published #970 head is `4b4a87adf355ef88416f014623e98333d9beb365`, based on #948 `1d65e3cd9b0ac07b3a2d229a93ae37ab0b474761`. Git merge analysis succeeds against both that parent and the pinned main. Thus the original conflict/bundle-only description is historical. The current child-only paths are `CHANGELOG.md`, `docs/subscription-connections.md`, `packages/runtime-pi/entitlement.ts`, `packages/runtime/account-auth.ts`, and `tests/account-auth.test.ts`; the broader original map includes parent #948 work.

T01 still records the actual #948 landing. T02 preserves the existing authorization gate. At T03 compare the current public history and tree first; recover the private `afd34865` bundle only for necessary intent absent from those sources, and never overwrite newer repairs with an old replay. T04 produces an authorized head with the accepted probe behavior and current-base proof. T05 requires exact-head unit/check receipts plus Reviewer and Security decisions. No implementation, auth semantics or private authorization decision is invented by this update.

---

Canonical plan file: [`docs/agent-plans/genv1-handoff-2026-11-22/03-entitlement-rebase-pr970.md`](https://github.com/skytuhua-org/Gen-V1/blob/d96bca4c/docs/agent-plans/genv1-handoff-2026-11-22/03-entitlement-rebase-pr970.md) · plans PR: https://github.com/skytuhua-org/Gen-V1/pull/1763

Filed by Chief of Staff at Xian's request (2026-11-22). The full plan follows; the canonical issue body is authoritative; the linked file is the historical published copy.

---

# Plan 03 — Rebase and land PR #970 (Copilot entitlement probe)

## META
- Repo: skytuhua-org/Gen-V1 · Plan rev: 2 · 2026-11-22
- Baseline: `main@36fcc56d24cef7558059264a8540d7f0592d93cd`
- PR: https://github.com/skytuhua-org/Gen-V1/pull/970 — open, **merge conflict
  detected** (verified 2026-11-22), branch
  `devin/1795129068-copilot-entitlement-probe` → base
  `devin/1795128376-kimi-entitlement-probe` (stacked on PR #948).
- Status: BLOCKED — the rebase is already prepared, held in a private bundle
  until normal write access to the PR head is restored.
- Private bundle (auth-gated; never repost): commit
  `afd34865fd7d7e3f30277c54bd7d9217104714b6` on ref
  `devin/1795129068-copilot-entitlement-probe`, prerequisites `1d65e3cd` and
  `19b17c39` → `pr970-afd34865.bundle` in `files/ledger/private-artifacts.json`.

## OBJECTIVE
Publish the prepared rebase so #970 sits cleanly on the updated #948 head,
clearing the conflict, then land it after #948 merges. Success = #970 merged
via authorized push with probe unit tests green and SEC CLEAN.

## REQUIREMENTS
- In scope: verify the bundle's base still matches the post-#948 head, push
  the prepared commits, reviews, merge.
- Out of scope: redesigning the probe; merging before #948.
- #970 is auth/credential-adjacent code → **SEC CLEAN required** at the gate.

## REPO_MAP (diff vs merge-base, verified)
- `packages/runtime-pi/entitlement.ts` (+52): bounded JSON fetch moved
  unchanged out of `plan-keys.ts`, plus `entitlementFailure` (only 401/403
  count as rejected).
- `packages/runtime-pi/plan-keys.ts` (−47/+8): reuses the shared fetch.
- `packages/runtime/account-auth.ts` (+22): probe wiring.
- `packages/contracts/authentication.ts` (+2/−2): contract field.
- `apps/web/src/Connections.tsx`, `apps/web/src/connections.css`,
  `docs/subscription-connections.md`, `CHANGELOG.md`,
  `scripts/public-source-files.json`: UI label mapping + docs.
- Tests: `tests/account-auth.test.ts` (+77), `tests/e2e/compact-settings.spec.ts`
  (+11).

## EXECUTION_DAG
- T01 — land #948 first (plan 04); record its merge/updated-head SHA.
- T02 **BLOCKER** — normal write access to the PR head restored (same
  credential incident as #896/#967; approved token is
  `GEN_V1_ORG_GITHUB_TOKEN`).
- T03 — fetch `pr970-afd34865.bundle`; `git bundle verify`; check
  `git merge-base --is-ancestor <post-948-head> afd34865`. If the base moved
  again, redo the rebase replaying only the #970 commits from the bundle.
  Done-when: `afd34865` (or replayed equivalent) is a fast-forward of the
  current #948 head.
- T04 — push to `devin/1795129068-copilot-entitlement-probe` with the
  authorized identity; confirm the conflict marker on the PR clears.
- T05 — Reviewer + Security review, then merge at the standard gate.
  Done-when: #970 merged.

## VALIDATION
- `source ~/.nvm/nvm.sh`
- `npx vitest run tests/account-auth.test.ts` — all pass, including the new
  Copilot entitlement cases.
- `pnpm typecheck && pnpm lint`
- Conflict cleared on the PR; probe unit tests pass on pushed head.
- Done-when: #970 merged via authorized push.

## Historical STATE / RISKS
- If #948 lands with different code than the bundle expected, the rebase may
  need rework — treat bundle commits as the source of truth for intent and
  resolve conflicts in `entitlement.ts`/`plan-keys.ts` (the overlapping files).
- Stacked PR: if #948 is closed instead of merged, retarget #970's base to
  `main` FIRST, then update the branch (else the diff shows all of trunk).

## REFERENCES
- PR #970, PR #948 (plan 04, prerequisite), AGENTS.md merge rules.

## NEXT
Gen Runtime, after #948 lands and write access is restored.
