[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1767.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1767](https://github.com/skytuhua-org/Gen-V1/issues/1767). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Entitlement probe [#948](https://github.com/skytuhua-org/Gen-V1/pull/948) remains open at 1d65e3cd9b0ac07b3a2d229a93ae37ab0b474761. Receipt-shard stability, exact-head review/Security and landing remain required; inactive appearance is not a release of Gen Runtime ownership.

### Reviewed implementation references

- [PR #948](https://github.com/skytuhua-org/Gen-V1/pull/948): open; head `1d65e3cd9b0ac07b3a2d229a93ae37ab0b474761`; base `main`; not recorded as merged into the audit baseline.

## REQUIREMENTS

Retain the bounded shared JSON fetch, only-401/403 rejection classification, existing plan-key reuse, probe/UI mapping and the receipt-shard fix already stated in OBJECTIVE/REPO_MAP. Preserve all assertions and credential boundaries. Success requires the original at-least-three consecutive passing reproductions, not a skipped shard. Probe redesign and unrelated test weakening are outside this landing task.

## DESIGN

T01 pins the current main and #948 head, reproduces the same receipt shard and records a paired classification. T02 applies only the proven fix and supplies three consecutive run receipts. T03 consumes those receipts and the exact diff for Reviewer and Security review. T04 lands through the standard gate, verifies main integration and hands the merge SHA to #1766/#970. Existing Gen Runtime ownership is not released by this audit. The historical 36fcc56d reproduction remains provenance; a current comparison must identify its new baseline explicitly.

---

Canonical plan file: [`docs/agent-plans/genv1-handoff-2026-11-22/04-entitlement-probe-pr948.md`](https://github.com/skytuhua-org/Gen-V1/blob/d96bca4c/docs/agent-plans/genv1-handoff-2026-11-22/04-entitlement-probe-pr948.md) · plans PR: https://github.com/skytuhua-org/Gen-V1/pull/1763

Filed by Chief of Staff at Xian's request (2026-11-22). The full plan follows; the canonical issue body is authoritative; the linked file is the historical published copy.

---

# Plan 04 — Land PR #948 (Kimi entitlement probe / Cursor receipt shard flake)

## META
- Repo: skytuhua-org/Gen-V1 · Plan rev: 2 · 2026-11-22
- Baseline: `main@36fcc56d24cef7558059264a8540d7f0592d93cd`
- PR: https://github.com/skytuhua-org/Gen-V1/pull/948 — open, mergeable (no
  conflicts, verified 2026-11-22), branch
  `devin/1795128376-kimi-entitlement-probe` → `main`.
- Status: IN_PROGRESS with Gen Runtime; last recorded next step: "fix and
  seek review from Reviewer and Security". Known flake: **Cursor receipt
  shard**.
- Blocks: plan 03 (#970 is stacked on this branch).

## OBJECTIVE
Finish and land the Kimi/Cursor entitlement probe. `packages/runtime-pi/
entitlement.ts` gains the bounded JSON fetch moved unchanged out of
`plan-keys.ts` plus `entitlementFailure` (only 401/403 count as rejected);
`plan-keys.ts` reuses the same request; probe results map to UI labels.
Success = #948 merged with the receipt-shard flake resolved (fixed, not
skipped).

## REPO_MAP (diff vs merge-base, verified)
- `packages/runtime-pi/entitlement.ts` (+40): new bounded fetch +
  `entitlementFailure`.
- `packages/runtime-pi/plan-keys.ts` (−47/+8): deduplicated onto shared fetch.
- `packages/runtime/account-auth.ts` (+21): probe wiring.
- `packages/contracts/authentication.ts` (+2/−2).
- `apps/web/src/Connections.tsx`, `apps/web/src/connections.css`,
  `docs/subscription-connections.md`, `CHANGELOG.md`,
  `scripts/public-source-files.json`.
- Tests: `tests/account-auth.test.ts` (+46), `tests/e2e/compact-settings.spec.ts`
  (+11).

## EXECUTION_DAG
- T01 — reproduce/identify the Cursor receipt shard flake: rerun the failing
  shard 3–5×; run the same spec on `main@36fcc56d` to compare. Classify:
  real entitlement-path regression vs test flakiness. Done-when: written
  classification with run links.
- T02 — fix: if flake, stabilize the test (deterministic mock of the fetch /
  shard boundary); if real, fix `entitlement.ts`/`plan-keys.ts`. Done-when:
  the spec passes ≥3 consecutive runs.
- T03 — Reviewer review, then Security review (auth/credential-adjacent —
  SEC CLEAN required at the gate).
- T04 — merge at standard gate; confirm #970's base still matches (plan 03
  T01).

## VALIDATION
- `source ~/.nvm/nvm.sh`
- `npx vitest run tests/account-auth.test.ts` (and the receipt-shard spec) —
  green and stable across ≥3 consecutive runs.
- `pnpm typecheck && pnpm lint`
- Done-when: #948 merged, flake resolved (not skipped).

## Historical STATE / RISKS
- The merge gate for auth-adjacent code includes Security; do not merge on
  REV CLEAN alone.
- If the flake is a pre-existing main issue, still fix or file it — a red
  shard on the PR blocks the gate regardless.

## REFERENCES
- PR #948, plan 03 (#970 stack), issue ledger #1041.

## NEXT
Gen Runtime continues at T01; no handoff needed unless the worker is gone —
then any RT session picks up from T01.
