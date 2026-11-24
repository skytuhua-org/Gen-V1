[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1676.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1676](https://github.com/skytuhua-org/Gen-V1/issues/1676). The written completion criteria are satisfied through [merged PR #1677](https://github.com/skytuhua-org/Gen-V1/pull/1677); the original scope below is preserved.

| Accepted task | Current evidence |
| --- | --- |
| T01: receipt wait budget | All three `vi.waitFor` calls in `tests/cursor-service-receipt.test.ts` are `60_000` ms on main. Their ordering/assertion checks remain. |
| T02: split-app browser default | Both `page.setDefaultTimeout` calls in `tests/split-app-browser.test.ts` are 20,000 ms on main. Existing behavior assertions remain. |
| T03: default Playwright expectations | The 65 configurations covered by #1677 use a 15,000 ms expectation budget; independently specified configurations retain their own budgets. |
| All three edits in one PR and passing PR CI | #1677 merged at `61035b2387f0564daec8e51d2750e9838ed6d524`, verified as an ancestor of the audited main. [CI run 45109613093](https://github.com/skytuhua-org/Gen-V1/actions/runs/45109613093) completed SUCCESS on exact PR head `57d7ebb99632e95bd3fde94490dca9c4347583bb`. |

The duplicate [#1785](https://github.com/skytuhua-org/Gen-V1/pull/1785) was closed after scope/equivalence review, with its branch preserved and [coverage receipt 7122140731](https://github.com/skytuhua-org/Gen-V1/pull/1785#issuecomment-7122140731). The equivalent or longer main budgets make its older timeout-only delta redundant. This completion concerns the three scoped timeout edits and their PR gate, not the separate CI speed target or a measured absence of all browser flakes. Close after this complete body and its published Markdown mirror have been read back.

---

## Problem

Recurring CI failures across unrelated PR branches, all the same class: fixed short timeouts vs. a loaded Windows runner.

Evidence (last ~100 failed runs, grouped by failing test file):
- `tests/cursor-service-receipt.test.ts` — 7 distinct failed runs. `vi.waitFor` 20s timeout expires before the worker emits `receipt` under shard load.
- `tests/split-app-browser.test.ts` — 5 distinct failed runs. Playwright `locator.*: Timeout 7000ms exceeded` on several different locators.
- ~60 e2e specs (`tests/e2e/*.spec.ts`) — `expect(locator).toBeVisible() ... Timeout: 5000ms`. See the flaky-test report in PR #1668: the 5s `expect` default is the single largest flake class (~60 tests).
- Windows `node-pty@1.0.0` build failure (`PFNCREATEPSEUDOCONSOLE` undeclared) — already fixed on main by the `@lydell/node-pty@1.1.0` prebuilt bump; no action needed.
- `CI queue guard` run churn on main — already covered by open PR #1633.

## Scope (this issue)

T01: `tests/cursor-service-receipt.test.ts` — raise the receipt `vi.waitFor` timeout so a loaded runner can still observe the ordering the test asserts.
T02: `tests/split-app-browser.test.ts` — raise `page.setDefaultTimeout` from 7s.
T03: `tests/e2e/*.playwright.config.ts` — set `expect.timeout` where the config leaves Playwright's 5s default.

Out of scope: per-branch regressions (public-source manifest, keyboard-bindings, ci-draft-policy job list, theme-contrast) — those are each PR's own failures, fixed on those branches. Port-5524 webServer bind flake (#1097 report row 1) — needs a different fix, tracked separately.

## Done when

All three edits land in one PR, CI checks pass on the PR, and the affected files keep their existing assertions (no weakening beyond time budgets).