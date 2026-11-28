[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1765.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1765](https://github.com/skytuhua-org/Gen-V1/issues/1765). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

PR [#967](https://github.com/skytuhua-org/Gen-V1/pull/967) now publishes 5d141dfa5e5d6540ca90f06313e9f6f92697d779 and merges cleanly to parent [#896](https://github.com/skytuhua-org/Gen-V1/pull/896); it conflicts when considered directly against main through its parent. The 4-shard/300px/PNG evidence and original clearance gate remain pending.

### Reviewed implementation references

- [PR #967](https://github.com/skytuhua-org/Gen-V1/pull/967): open; head `5d141dfa5e5d6540ca90f06313e9f6f92697d779`; base `repair/ui-acceptance-20261118`; not recorded as merged into the audit baseline.

Latest journal read: [7091760207](https://github.com/skytuhua-org/Gen-V1/issues/1765#issuecomment-7091760207). Earlier claims, tests, review findings and releases remain in the append-only journal.

## DESIGN: preserve the stack and visual acceptance

T01 clearance and T02 #896 merge precede restacking. The current #967 head is `5d141dfa5e5d6540ca90f06313e9f6f92697d779` and its parent head is #896 `ac25284de39ec060a5143e29006ff01511e774ad`. The direct child delta has five paths: `WorkspaceSplitLayout.tsx`, `scripts/browser-suites.ts`, `scripts/public-source-files.json`, and the two `tests/e2e/visual-matrix` files. Parent overlap is not additional child-only feature scope. Current merge to the parent succeeds; direct main integration inherits the parent's conflicts.

T03 must compare the current public layout fix with the historical `22c5eeae` requirement before applying anything; that private commit is not available in this review. Record any unrecovered difference as HANDOFF_INCOMPLETE. T04 retains all four shards, the 300px divider probe and PNGs mapped to matrix cells. A historical local fix or clean merge cannot replace those results. T05 consumes the exact post-restack SHA, all shard receipts, screenshot links and PM/reviewer decision.

---

Canonical plan file: [`docs/agent-plans/genv1-handoff-2026-11-22/02-split-view-pr967.md`](https://github.com/skytuhua-org/Gen-V1/blob/d96bca4c/docs/agent-plans/genv1-handoff-2026-11-22/02-split-view-pr967.md) · plans PR: https://github.com/skytuhua-org/Gen-V1/pull/1763

Filed by Chief of Staff at Xian's request (2026-11-22). The full plan follows; the canonical issue body is authoritative; the linked file is the historical published copy.

---

# Plan 02 — Resume and land PR #967 (split-workspace visual acceptance matrix)

## META
- Repo: skytuhua-org/Gen-V1 · Plan rev: 2 · 2026-11-22
- Baseline: `main@36fcc56d24cef7558059264a8540d7f0592d93cd`
- PR: https://github.com/skytuhua-org/Gen-V1/pull/967 — open, mergeable (no
  conflicts, verified 2026-11-22), branch `devin/1795128437-split-visual-matrix`
  → base `repair/ui-acceptance-20261118` (i.e. **stacked on PR #896**), head
  `90c7428`.
- Status: BLOCKED — same unauthorized-fallback-push finding as #896 — and
  sequenced after #896 (plan 01). Do not restack early.
- Private bundles (auth-gated; never repost in public):
  - branch head `f4b7c925` → `pr967-f4b7c925.bundle`
  - unpushed split-fix `22c5eeae` (pushed: false) → `pr967-fix.bundle`
  Both indexed in `files/ledger/private-artifacts.json`.

## OBJECTIVE
Land the split-workspace visual acceptance matrix for 0.6.5: each matrix cell
checks first-visible geometry and padding, keyboard focus-visible, every
button reachable, and saves a PNG artifact. Success = #967 merged on the
post-#896 base with 4/4 visual-matrix shards green including the 300px
divider case, and reviewer-requested PNG screenshots attached to the PR.

## Historical STATE (verified 2026-11-22)
- Last shard run: **shard 1/4 failed at the 300px divider**; fix `22c5eeae`
  addresses the narrow-width/left-right split, verified locally, never pushed.
- Held with #896 after Security's unauthorized-push finding; FE confirmed no
  further writes.
- Ledger note: "verify exact base before restack and narrow-width fix" — the
  base changes when #896 merges, so restacking before that wastes work.
- Reviewer asked for the matrix PNG screenshots to be attached to the PR.

## REQUIREMENTS
- In scope: restack on the exact merged #896 head, apply `22c5eeae`, re-run
  all 4 shards, attach PNGs, PM third-head call per rule R12b, merge at gate.
- Out of scope: changes to the matrix's acceptance semantics; landing before
  #896; any fallback-credential writes.

## REPO_MAP
- New files (from diff vs merge-base): `tests/e2e/visual-matrix.spec.ts`
  (~147 lines, the matrix) and `tests/e2e/visual-matrix.playwright.config.ts`
  (9 lines, shard config).
- Touched shared specs: same ~95-file overlap as #896 (it is stacked on it):
  `tests/e2e/*.spec.ts`, `tests/split-app-browser.test.ts`,
  `vitest.config.ts`.
- Split layout under test: `apps/web/src/WorkspaceSplitLayout.tsx`.

## EXECUTION_DAG
- T01 **BLOCKER** — same write clearance as plan 01 T01.
- T02 — wait for PR #896 merged; record its merge SHA
  (`gh pr view 896 --json mergeCommit`). Done-when: merge SHA recorded.
- T03 — fetch both bundles; `git bundle verify`; restack
  `devin/1795128437-split-visual-matrix` onto the merged #896 head (or main
  post-merge); apply `22c5eeae`; confirm `git log` shows it on top.
  Done-when: branch head = restack + `22c5eeae`, `git diff` vs the bundle's
  expected tree is empty.
- T04 — re-run all 4 visual-matrix shards:
  `npx playwright test --config tests/e2e/visual-matrix.playwright.config.ts
  --shard=<n>/4`; confirm the 300px-divider case passes; collect the PNGs and
  attach them to the PR. Done-when: 4/4 green, PNGs on the PR.
- T05 — PM third-head call per R12b, then merge at gate: REV CLEAN on the
  restacked head + required CI + main green. Done-when: #967 merged.

## VALIDATION
- `source ~/.nvm/nvm.sh`
- `pnpm typecheck && pnpm lint`
- `npx playwright test --config tests/e2e/visual-matrix.playwright.config.ts`
  — all shards green; PNG artifacts produced under the Playwright output dir.
- Done-when: #967 merged and `git log origin/devin/1795128437-split-visual-matrix..<local>` is empty (no leftover unpushed commits) or the branch is deleted.

## Historical STATE / RISKS
- Risk: restack conflict if #896's final head differs from the local base —
  resolve by replaying only the matrix commit(s) + `22c5eeae` onto the merged
  head rather than a whole-branch rebase.
- If write clearance is denied entirely, escalate to Xian; do not bypass.

## REFERENCES
- PR #967, PR #896 (dependency), plan 01, plans 06/08, R12b third-head rule.

## NEXT
Chief of Staff → Gen Frontend, after plan 01 completes.
