# MTH02: Isolate pinned KaTeX with fixed options and local assets

## META

`skytuhua-org/Gen-V1`; parent [#2229](https://github.com/skytuhua-org/Gen-V1/issues/2229) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/MTH02`, 2026-11-25. Kind: implementation. Start: **READY**. Dependencies: None.

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-MATH-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-math-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Provide one reviewed lazy KaTeX entry that renders into a detached element with fixed app-owned options, preserves source on rejection and ships complete local CSS/font notices. The installed artifact, browser graph and generated output must be audited before any caller opts in.

## REQUIREMENTS

Use exact katex@0.19.1, upstream8000fbd4e29cca2c0cb1e88b745af3ed2f436b66. Verify actual archive version/integrity and refresh advisories. No CDN, private parse API, auto-render extension, model options, dangerouslySetInnerHTML, formula cache or commander CLI in the browser graph. This task alone temporarily reserves its exact package/lock/notice/source-entry hunks; release them after review. It does not own those shared files indefinitely.

Coverage: Math T01 licensing/baseline-resource screen and T03 engine; R05/R06/R08/R10; A05/A06/A09/A10. Inherited requirements remain binding.

## REPO_MAP

math-renderer.ts and its Node test are proposed. Root package/lock/notices and scripts/build.mjs are verified integration paths. Source is MIT with applicable font/stretchy-SVG OFL notices, including Design Science/Khan Academy and reserved names; the installed archive must establish the shipped closure. GHSA-238p-pmpm-9mq7's conditional inherited-options flaw was fixed in0.18.2, not a claimed current Gen exploit.

Existing narrow hunks: `package.json`, `pnpm-lock.yaml`, `apps/web/src/dependency-notices.ts`, `THIRD_PARTY_NOTICES.md`, `scripts/public-source-files.json`.

Proposed outputs: `apps/web/src/math-renderer.ts`, `tests/markdown-math-renderer.test.ts`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Freeze export renderMath(tex:string,mode:'inline'|'display',target:HTMLElement,remainingNodes:number): {kind:'rendered';elements:number}|{kind:'source';reason:'parse'|'budget'|'engine'}. target must be detached. Return no raw error markup; [MTH03 #2280](https://github.com/skytuhua-org/Gen-V1/issues/2280) consumes this exact private contract.

Call public katex.render into the detached target. Every expression receives a newly constructed object:
{displayMode:mode==='display',output:'htmlAndMathml',throwOnError:true,strict:'error',trust:false,maxSize:10,maxExpand:500,globalGroup:false,macros:Object.create(null)}.
No spreading of props/options/prototypes or reuse of macros. Reject generated output above2,048 elements per expression or caller's remaining aggregate budget; [MTH03 #2280](https://github.com/skytuhua-org/Gen-V1/issues/2280) owns the8,192-instance total and connected commit.

This entry imports the KaTeX browser API and distributed CSS. Its caller performs dynamic import only after admission; only the module promise may be shared. All CSS font URLs resolve to packaged local unmodified assets. Preserve MIT plus applicable OFL text and exact source/version/hash inventory. No-math entry, currency and code have no path to this module. Rendering remains synchronous: post-call timeouts do not establish cancellation.

## EXECUTION_DAG

**T01.** Verify the exact0.19.1 archive, license/font metadata, advisory state and public browser exports against the pin. Record baseline entry/resource bytes before addition; stop on an unexplained artifact mismatch.

**T02.** Claim the small package/lock/notices/manifest hunks, add only the exact dependency through the package workflow, retain complete applicable notices and record emitted local asset paths. Do not fabricate lock integrity.

**T03.** Implement the detached public render wrapper, fresh fixed options and per-expression generated-node check. Return fixed error categories and discard rejected nodes without connecting them.

**T04.** Use real renderToString/public engine tests for supported formulas, expansion/global definitions, hostile trust-gated commands and cross-expression isolation. Register the lazy entry without importing it into startup.

**T05.** Build and inspect the real lazy graph/assets; confirm commander and KaTeX are absent from initial entry, and hand the accepted adapter/assets contract to [MTH03 #2280](https://github.com/skytuhua-org/Gen-V1/issues/2280). Release dependency hunks.

**Done when:** Exact artifact/options/notice/local-asset contract is reviewable; the real public engine tests pass; generated output remains detached and app callers remain unchanged. An unavailable archive or unresolved distribution issue blocks integration. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm build:widgets; pnpm exec vitest run tests/markdown-math-renderer.test.ts --maxWorkers=1; pnpm typecheck; pnpm build; pnpm exec vitest run tests/public-source.test.ts --maxWorkers=1. Positive corpus: fraction/sum/integral/matrix and repeated equal formulas with fresh options. Negative corpus: \href, \url, \includegraphics, \htmlClass, \htmlStyle, \htmlData, inherited option properties, \gdef leakage, expansion/size overflow and malformed TeX. Node tests cannot prove browser zero-network or connected DOM; [MTH06 #2283](https://github.com/skytuhua-org/Gen-V1/issues/2283) repeats actual requests/output. Record all JS/CSS/font sizes without calling the150KiB/40KiB/1MiB targets measured passes prematurely.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**READY:** An isolated engine adapter and package audit can proceed before syntax/caller integration; production callers remain absent. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/KaTeX/KaTeX/blob/8000fbd4e29cca2c0cb1e88b745af3ed2f436b66/package.json).
- [Reference 2](https://github.com/KaTeX/KaTeX/blob/8000fbd4e29cca2c0cb1e88b745af3ed2f436b66/docs/options.md).
- [Reference 3](https://github.com/KaTeX/KaTeX/security/advisories/GHSA-238p-pmpm-9mq7).
- [Reference 4](https://github.com/KaTeX/KaTeX/blob/8000fbd4e29cca2c0cb1e88b745af3ed2f436b66/src/stretchy.ts).
