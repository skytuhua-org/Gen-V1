# Flowchart preview adoption decision

**NO_ADOPT for the frozen flowchart trial.** The source admission policy qualified all three useful examples and their three CRLF variants. It qualified zero of the 20 frozen held-out examples against a required minimum of 16. The decision follows DIA08's early-stop path. [DIA08 issue](https://github.com/skytuhua-org/Gen-V1/issues/2300)

The exact version-2 corpus is pinned at `c7093f9b6777066e4dbedd5c509cc06ff2bc4540` and has SHA-256 `4e4863e59b046ab68f897f34a7d9c7adebf224e10b5bcd43487ea8ba324e438a`. The policy and the case-by-case hash and admission assertions are pinned at `8beb342a7fa60aadffb319f524346365b65b6f0d`. The inputs were unchanged. Cases 09 and 10 contain non-plain labels, and the other 18 use unsupported statements or grammar. [Frozen corpus and contract](https://github.com/skytuhua-org/Gen-V1/pull/2333) · [Policy and verification](https://github.com/skytuhua-org/Gen-V1/pull/2629)

| Gate | Observed disposition |
| --- | --- |
| A01 · Pinned inputs and allocation | Decision inputs and ownership verified in the published DIA01 and DIA02 checkpoints. Actual app baseline and integration review were not run. |
| A02 · Bounds and complete consumption | Pure policy verified. The 37-case suite exercises byte, line, node, edge and Unicode label limits and rejects unsupported statements and suffixes as a whole. |
| A03 · Fidelity and usefulness | **Failed** at 0/20 held out. The 3/3 useful and CRLF cases matched their frozen topology. No engine output was produced or compared. |
| A04 · Canonical source and Copy | The policy preserves the supplied source and normalizes its separate rendering copy. Product Copy and ordinary code regression tests were not run. |
| A05 · Finality and layout triggers | Newline and EOF decisions and contradictory finality were checked in pure policy. Native app finality, layout lifecycle and source preference were not run. |
| A06 · Bounded Worker and cancellation | Not run. The trial stopped before adding a Worker, queue or cache. |
| A07 · Offline/network and SVG | Not run. The trial produced no SVG or preview. |
| A08 · Lazy DOM and source ownership | Not run. The trial added no presentation or caller binding. |
| A09 · Native accessibility, keyboard and legibility | Not run. No packaged Windows preview, screen-reader session, zoom, contrast, focus-return test or paired recording exists. |
| A10 · Task benefit and cost | Not run. No preview benefit, bundle cost, typing comparison, 10 cold or 30 warm measurements are claimed. |
| A11 · Related rendering and transcript anchor | Not run. The trial added no renderer consumer or scroll writer. |
| A12 · Package and distribution closure | Not run. The staged changes introduced no diagram dependency, lockfile edit, distribution payload or CSP change. |
| A13 · Publication and rollback | The decision records exact inputs, product test status and handoff. Protected merge and main verification are separate. No runtime rollback or data migration is required because the preview was never enabled. |

Reproduce the decision with `pnpm exec vitest run tests/diagram-policy.test.ts --maxWorkers=1` on the exact policy head. The local Linux run passed 37 cases. The policy PR also passed local widget build, typecheck and lint. Any broader parser or different candidate needs its own reviewed plan and gates. This decision leaves the existing Markdown source path in use. [Policy checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2294#issuecomment-7231098434)
