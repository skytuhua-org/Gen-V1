# MTH06: Measure math browser safety, lifecycle and resource cost

## META

`skytuhua-org/Gen-V1`; parent [#2229](https://github.com/skytuhua-org/Gen-V1/issues/2229) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/MTH06`, 2026-11-25. Kind: verification. Start: **BLOCKED**. Dependencies: [MTH05 #2282](https://github.com/skytuhua-org/Gen-V1/issues/2282).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-MATH-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-math-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Produce a finite reproducible browser report for the exact math candidate, covering capability gain, unsafe input, lifecycle cleanup, responsiveness and emitted resource cost. Fixes go back to the owning code task.

## REQUIREMENTS

Use the MTH05 frozen SHA and same corpus/control/build/hardware/settings. At least five repeated baseline/candidate input runs, separated cold/warm; report raw samples, median/p95 and failures. Targets: lazy math JS<=150KiB gzip, CSS<=40KiB gzip, font assets<=1MiB; no math-attributable task>50ms; at most one render/frame and input-to-next-paint p95<=50ms during64 formulas. No-math/currency/code/default-off requests zero math assets. Targets are gates, not current results.

Coverage: Math T05 browser/comparison; R01/R03/R04/R05/R06/R07/R09/R11; A01-A07/A09/A10 browser portions. Inherited requirements remain binding.

## REPO_MAP

Use the registered markdown-math and Markdown specs, both real workbench suites and conversation-scroll suite. New report is a proposed redacted evidence artifact; raw Playwright traces remain ignored and are not committed. ANC04 owns actual-App detached-reading compensation; ANC06 owns native evidence. This task does not edit their controller or add measurement hooks to product code.

Proposed outputs: `tests/e2e/markdown-math.spec.ts`, `docs/review-evidence/parallel-renderers/math-browser.md`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Freeze a comparison table with fractions/sums/integrals/matrices, Latin/CJK text, both inline and display delimiters, comments/braces/CRLF, currency, code/link/table-pipe controls, malformed/partial/mixed source, every size/expansion/node boundary, malicious trust-gated commands and repeated equal formulas in distinct owners. Reuse implementation fixtures unchanged.

Intercept browser requests before rendering hostile formulas and inspect connected DOM for active anchors/executable content. Test inherited options/global macros against real engine output, not a mock. Run controlled delayed import and owner/selection/hidden-state cases from MTH03/MTH05; after100 cycles prove queue/listener/observer counts settle without accumulation. Font-load failure is a failed resource result even if source remains readable.

Measure no-math startup entry delta and lazy JS/CSS/fonts, per-expression and aggregate work, typing/IME/Send/Stop and retained heap after teardown. Test delayed math above a detached reader, tail following, explicit navigation and switch/return only on the accepted ANC04 candidate. Missing ANC04 makes the release row BLOCKED; it does not authorize another scroll writer or prevent unrelated measurements.

## EXECUTION_DAG

**T01.** Read all candidate implementation checkpoints, obtain exact control/candidate commits, package archive/lock hashes and frozen fixtures/settings. Pin the named machine/browser/build before measurements.

**T02.** Run existing and new focused unit/type/lint/build/browser safety/source regressions, capturing actual counts and failure traces. Test zero network and exact message/formula-source copy in the real DOM.

**T03.** Run at least five paired cold/warm measurement repetitions and100 lifecycle cycles. Record distributions, resource sizes and no-math/oversize call counts; do not select fastest runs or move thresholds.

**T04.** Run the actual-App ANC04 detached-reader, tail, navigation and switch/return scenarios. Record a specific blocker if that controller candidate is unavailable; return code defects to their owner.

**T05.** Write the finite acceptance report with A01-A07/A09 and applicable A10 browser rows, immutable evidence links, failures/skips and candidate SHA. Hand it to [MTH07 #2284](https://github.com/skytuhua-org/Gen-V1/issues/2284) without asserting native acceptance.

**Done when:** Every assigned matrix row has a result, exact evidence and environment; cost samples are retained, remaining platform/anchor blockers are named and no browser result is relabelled as Windows/AT. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Planned commands: pnpm build:widgets; pnpm exec vitest run tests/markdown-math.test.ts tests/markdown-math-renderer.test.ts tests/markdown-math-queue.test.ts tests/source-selection-v3.test.ts tests/source-selection-dom-v3.test.ts --maxWorkers=1; pnpm typecheck; pnpm lint; pnpm build; scoped Playwright micro-motion markdown.spec.ts markdown-math.spec.ts; workbench and workbench-app configs; conversation-scroll config on the ANC04 candidate; pnpm exec vitest run tests/public-source.test.ts --maxWorkers=1; pnpm check:docs-links. A browser or timing failure blocks adoption until a focused fix and relevant rerun. Product modification is outside this verification claim.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Needs a frozen actual-app candidate plus its matching literal-source control and test corpus. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/issues/2218).
