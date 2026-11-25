# MTH06: Measure math browser safety, lifecycle and resource cost

## META

`skytuhua-org/Gen-V1`; parent [#2229](https://github.com/skytuhua-org/Gen-V1/issues/2229) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R2/MTH06`, 2026-11-25. Kind: verification. Start: **BLOCKED**. Dependencies: [MTH05 #2282](https://github.com/skytuhua-org/Gen-V1/issues/2282).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-MATH-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-math-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

Revision history: [complete R1/MTH06](https://github.com/skytuhua-org/Gen-V1/blob/cdb703b94d73fd41abbe2d26aa5e88010700d976/docs/agent-plans/parallel-renderer-math-browser-cost-evidence.md), SHA-256 `4f3192786ed3b2b1a7522bf86e3baad111efbe847ee9b1a8c2820be2acf08568`. R2 resolves [R-F01](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7174211589): [MTH02 #2279](https://github.com/skytuhua-org/Gen-V1/issues/2279) supplies the installed-package/source-asset audit; this task proves emitted production assets and loading after MTH05 supplies real consumers. Original acceptance, resource limits, dependencies and product scope are retained.

## OBJECTIVE

Produce a finite reproducible browser report for the exact integrated math candidate, covering capability gain, unsafe input, lifecycle cleanup, responsiveness, the real production import graph and emitted resource cost. Positively prove local CSS/font loading through MTH05's three consumers. Fixes go back to the owning code task.

## REQUIREMENTS

Use the MTH05 frozen SHA and same corpus/control/build/hardware/settings. At least five repeated baseline/candidate input runs, separated cold/warm; report raw samples, median/p95 and failures. Targets: lazy math JS<=150KiB gzip, CSS<=40KiB gzip, font assets<=1MiB; no math-attributable task>50ms; at most one render/frame and input-to-next-paint p95<=50ms during64 formulas. No-math/currency/code/default-off requests zero math assets. Targets are gates, not current results.

Consume MTH02's exact installed browser-entry/CSS/font mapping, integrity and applicable MIT/OFL notices. Prove both a positive admitted-formula path and zero-load controls in the actual production build, retaining existing CSP and using only local bundled assets. An unreferenced build, isolated leaf fixture, development server or package-source inventory cannot substitute for this production graph. Commander must be absent from every browser chunk; KaTeX/CSS/fonts must remain outside no-math startup loading. Missing assets, fallback-font substitution or unexplained emission/loading failure blocks adoption. Native Windows offline and manual assistive proof remain MTH07.

Coverage: Math T05 browser/comparison; R01/R03/R04/R05/R06/R07/R08/R09/R11; A01-A07/A08 browser font-loading portion/A09/A10 browser portions. Inherited requirements remain binding.

## REPO_MAP

Use the registered markdown-math and Markdown specs, both real workbench suites and conversation-scroll suite. New report is a proposed redacted evidence artifact; raw Playwright traces remain ignored and are not committed. ANC04 owns actual-App detached-reading compensation; ANC06 owns native evidence. This task does not edit their controller or add measurement hooks to product code.

Read the accepted candidate's normal [scripts/build.mjs](https://github.com/skytuhua-org/Gen-V1/blob/cdb703b94d73fd41abbe2d26aa5e88010700d976/scripts/build.mjs) and [vite.config.ts](https://github.com/skytuhua-org/Gen-V1/blob/cdb703b94d73fd41abbe2d26aa5e88010700d976/vite.config.ts) before running `pnpm build`; the reviewed normal application path is `apps/web` to `dist/web`. Existing [tests/host-fixture.ts](https://github.com/skytuhua-org/Gen-V1/blob/cdb703b94d73fd41abbe2d26aa5e88010700d976/tests/host-fixture.ts) exports `test`, `HOST_URL` and `HostFixture`: its `host` fixture runs `buildServer(...,{dev:false})` on exclusive4337/4338 ports and closes its own host. Reuse that fixture inside the allocated markdown-math spec to inspect the real built application and server CSP. No new fixture, entry, build configuration or product change is allocated.

Proposed outputs: `tests/e2e/markdown-math.spec.ts`, `docs/review-evidence/parallel-renderers/math-browser.md`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Freeze a comparison table with fractions/sums/integrals/matrices, Latin/CJK text, both inline and display delimiters, comments/braces/CRLF, currency, code/link/table-pipe controls, malformed/partial/mixed source, every size/expansion/node boundary, malicious trust-gated commands and repeated equal formulas in distinct owners. Reuse implementation fixtures unchanged.

Intercept browser requests before rendering hostile formulas and inspect connected DOM for active anchors/executable content. Test inherited options/global macros against real engine output, not a mock. Run controlled delayed import and owner/selection/hidden-state cases from MTH03/MTH05; after100 cycles prove queue/listener/observer counts settle without accumulation. Font-load failure is a failed resource result even if source remains readable.

Follow the production import edge from each MTH05 caller through Markdown/MarkdownMath's admitted dynamic import to math-renderer and the exact KaTeX browser export. Record emitted lazy JS/CSS paths and hashes, every emitted font path/size, the CSS URL-to-local-file mapping and the matching source/package/notice inventory from MTH02. Record initial-entry and complete browser-chunk inspection separately: no KaTeX in the initial loading graph, no commander anywhere in the browser graph, and a real math chunk/CSS/font path for the positive case. A missing positive import or empty math emission is a failed or blocked integration result, never a zero-cost pass.

With requests observed before navigation, verify no-math/currency/code/default-off controls fetch no math JS/CSS/fonts; then load admitted formulas through all three actual opt-ins and establish successful local CSS/font responses and loaded fonts. Repeat while external network access is disabled but the built local application remains served, under the unchanged application CSP. Record any blocked request, absent font or substitute-font rendering as failure. This browser local-asset/offline-origin check does not establish packaged Windows offline behavior; pass the exact emitted inventory and remaining native rows to MTH07. Do not add a CDN, relax CSP or replace missing assets with screenshots of readable fallback text.

In `tests/e2e/markdown-math.spec.ts`, add a `production math assets` group using the existing host fixture's exported test and its `host` parameter, reusing MTH05's unchanged `taskFixture`/`serveTaskFixture` synthetic data. Navigate to absolute `HOST_URL` before exercising the three callers; do not inherit the micro-motion config's Vite baseURL for this group. Keep the request observer and external-origin blocking outside the existing fixture's API-route substitutions; record that the data is synthetic while static JS/CSS/fonts and response CSP come from the actual production host. Preserve the fixture's exclusive-port failure and teardown rather than reusing another worker's server. No fixture implementation or shared Playwright configuration edit is required.

Measure no-math startup entry delta and lazy JS/CSS/fonts, per-expression and aggregate work, typing/IME/Send/Stop and retained heap after teardown. Test delayed math above a detached reader, tail following, explicit navigation and switch/return only on the accepted ANC04 candidate. Missing ANC04 makes the release row BLOCKED; it does not authorize another scroll writer or prevent unrelated measurements.

## EXECUTION_DAG

**T01.** Read all candidate implementation checkpoints; accept MTH05's real three-consumer SHA plus MTH02's exact source-asset/notice mapping, archive/lock hashes and frozen fixtures/settings. Pin control/candidate commits and named machine/browser/build. Confirm the production import edge exists before claiming emitted-resource evidence.

**T02.** Run existing and new focused unit/type/lint/build/browser safety/source regressions, capturing actual counts and failure traces. Inspect the actual normal-build import graph and emitted JS/CSS/font inventory; serve that production output and prove positive local loading, zero-load controls and external-network-disabled operation under existing CSP. Test zero document-authored requests and exact message/formula-source copy in the real DOM.

**T03.** Run at least five paired cold/warm measurement repetitions and100 lifecycle cycles. Record distributions, emitted compressed JS/CSS and total font sizes, no-math startup delta and no-math/oversize call counts. Compare the unchanged thresholds against these production artifacts, not package-source sizes; do not select fastest runs or move thresholds.

**T04.** Run the actual-App ANC04 detached-reader, tail, navigation and switch/return scenarios. Record a specific blocker if that controller candidate is unavailable; return code defects to their owner.

**T05.** Write the finite acceptance report with A01-A07/A08 browser font-loading/A09 and applicable A10 browser rows, immutable graph/asset/notice evidence, raw measurements, failures/skips and candidate SHA. Hand the complete emitted inventory and pending packaged/offline/assistive gates to [MTH07 #2284](https://github.com/skytuhua-org/Gen-V1/issues/2284) without asserting native acceptance.

**Done when:** Every assigned matrix row has a result, exact evidence and environment; the positive real-consumer production graph and local-asset loading are recorded alongside zero-load controls; cost samples are retained, remaining platform/anchor blockers are named and no browser result is relabelled as Windows/AT. An absent production import or emitted asset stays failed/blocked. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Planned commands: pnpm build:widgets; pnpm exec vitest run tests/markdown-math.test.ts tests/markdown-math-renderer.test.ts tests/markdown-math-queue.test.ts tests/source-selection-v3.test.ts tests/source-selection-dom-v3.test.ts --maxWorkers=1; pnpm typecheck; pnpm lint; pnpm build; scoped Playwright micro-motion markdown.spec.ts markdown-math.spec.ts; workbench and workbench-app configs; conversation-scroll config on the ANC04 candidate; pnpm exec vitest run tests/public-source.test.ts --maxWorkers=1; pnpm check:docs-links. A browser or timing failure blocks adoption until a focused fix and relevant rerun. Product modification is outside this verification claim.

After `pnpm build`, run `pnpm exec playwright test --config tests/e2e/micro-motion.playwright.config.ts markdown-math.spec.ts --grep 'production math assets'`. The named group explicitly consumes the existing `host` fixture and navigates to `HOST_URL` (`http://127.0.0.1:4337`); the config's separately launched Vite server is not production evidence. Record the exact control/candidate build hashes, actual URL and production response CSP. Reuse MTH05's existing synthetic actual-App fixture data; introduce no product test flag. Positive evidence includes the actual emitted math JS/CSS/local-font files and successful formula/font loading in main AssistantProse, CanvasThread assistant and BoundMarkdown. Negative evidence includes no-math/currency/code/default-off zero requests, zero commander in the complete browser graph, failed/blocked resource behavior preserving source, and no external requests or CSP relaxation. Retain MIT/OFL attribution reconciliation and all unchanged150KiB/40KiB/1MiB,50ms,one-render/frame and five-run gates. If the current accepted host-fixture contract changed, record the exact blocker and return it to the coordinator; do not infer a pass or silently add another fixture/build entry.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Needs MTH05's frozen actual-app candidate with a real production import path, matching literal-source control/test corpus and MTH02's exact installed-source asset/notice mapping. This task owns positive emitted-graph/local-font/browser offline-origin proof; MTH07 owns packaged Windows/offline/assistive acceptance. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/issues/2218).
