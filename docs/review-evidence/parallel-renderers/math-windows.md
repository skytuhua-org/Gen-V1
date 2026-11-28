# Markdown math adoption disposition

**Decision: NO_ADOPT for the measured trial.** Keep production Markdown literal. The corrected browser candidate exceeded the required A09 responsiveness limits. Its cold and warm input-to-next-paint p95 values were 121.5 ms and 118.4 ms against a 50 ms limit. The longest observed tasks were 693 ms and 563 ms. This is the decision-only rejection path allocated to MTH07. [Native gate #2284](https://github.com/skytuhua-org/Gen-V1/issues/2284) · [Production browser report](math-browser.md)

The corrected trial [6f3fd5cd498e844ee9f673a06a40ef67441d9de3](https://github.com/skytuhua-org/Gen-V1/commit/6f3fd5cd498e844ee9f673a06a40ef67441d9de3) retains the successful local-font correction and three App caller proofs for future review. The f7bd12b3 caller trial is frozen in draft [#2639](https://github.com/skytuhua-org/Gen-V1/pull/2639). The corrected trial emitted 562,908 font bytes, and the production host served the affected local resources under its existing CSP. Those checks establish browser behavior on Linux with Chromium 141.0.7390.37.

| Original acceptance | Disposition |
| --- | --- |
| A01 Capability | Trial browser PASS for main assistant, retained Canvas and owned generated Markdown against the literal control. |
| A02 Syntax and active runs | Trial PASS for the scoped recognizer and synthetic App streaming closure. |
| A03 Surface scope | Trial PASS on the measured routes. The three opt-in callers and default-off user and Document views followed their expected behavior. |
| A04 Canonical source | Trial browser PASS for the original message, exact CRLF display source, stale owner and copy behavior. |
| A05 Trust and inventory | Trial PASS for the measured reject cases, isolated macro state, installed package and linked notices. |
| A06 Resources and bounds | Trial PASS after the production font correction, including zero-load controls and readable fallback on blocked stylesheet. |
| A07 Ownership | Trial browser PASS for the tested stale, hidden, held and selection routes, one accepted leaf per browser frame and 100 teardown cycles. |
| A08 Native presentation and accessibility | NOT_RUN. Requires the supported packaged Windows build and screen reader. |
| A09 Responsiveness and reading | FAIL for measured production input and long tasks. Detached reading, explicit navigation and switch/return on accepted ANC04 and ANC06 paths remain NOT_RUN. |
| A10 Handoff | Exact source and evidence are archived. Product adoption is rejected on the measured trial. |

The packaging command is `pnpm desktop:package`. Packaging, offline cold start on Windows, native DPI and app zoom, nested windows, theme and motion settings, IME and physical input, paired 1920×1080 clips, screen-reader speech and keyboard source disclosure remain NOT_RUN. The Linux executor and early browser rejection prevented native acceptance. A future adoption trial requires a build that clears A09 and a supported Windows executor with installed assistive technology. [Packaged app script](https://github.com/skytuhua-org/Gen-V1/blob/6f3fd5cd498e844ee9f673a06a40ef67441d9de3/package.json) · [Reading-position parent #2218](https://github.com/skytuhua-org/Gen-V1/issues/2218)

## Retained source and release state

The exact reviewed queue requests for the parser binding [#2638](https://github.com/skytuhua-org/Gen-V1/pull/2638), isolated leaf [#2637](https://github.com/skytuhua-org/Gen-V1/pull/2637), and adapter/dependency [#2542](https://github.com/skytuhua-org/Gen-V1/pull/2542) were withdrawn before merge. Each exact head remains available, with no branch deletion. The caller draft has no queue request. Main already keeps literal Markdown and has no KaTeX dependency or notice to remove. The independently merged pure recognizer [#2379](https://github.com/skytuhua-org/Gen-V1/pull/2379) and shared source-selection correction [#2531](https://github.com/skytuhua-org/Gen-V1/pull/2531) are independent of this adoption decision.

The parent [#2229](https://github.com/skytuhua-org/Gen-V1/issues/2229) retains the complete accepted requirements and receives this result in its execution journal. The browser and native-disposition documents use normal protected review. Record the document merge and any future product decision separately.
