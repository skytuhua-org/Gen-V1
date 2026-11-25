# MTH02: Isolate pinned KaTeX with fixed options and local assets

## META

`skytuhua-org/Gen-V1`; parent [#2229](https://github.com/skytuhua-org/Gen-V1/issues/2229) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R2/MTH02`, 2026-11-25. Kind: implementation. Start: **READY**. Dependencies: None.

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-MATH-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-math-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

Revision history: [complete R1/MTH02](https://github.com/skytuhua-org/Gen-V1/blob/cdb703b94d73fd41abbe2d26aa5e88010700d976/docs/agent-plans/parallel-renderer-math-engine-assets.md), SHA-256 `a457a0a71b81eeaa7554d2af3b7fb9fb11de970d0cb92b046f2708751cf07fc1`. R2 resolves [R-F01](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7174211589): this independent task audits installed-package/source assets; [MTH06 #2283](https://github.com/skytuhua-org/Gen-V1/issues/2283), after the MTH05 production consumers exist, proves emitted production assets and loading. No code scope, dependency, option, resource limit or adoption gate is relaxed.

## OBJECTIVE

Provide one reviewed KaTeX entry for later lazy loading that renders into a detached element with fixed app-owned options, preserves source on rejection and records complete installed CSS/font assets and notices. Audit the installed artifact, source import boundary and real public engine before caller integration. Production emission and request behavior are verified by MTH06 after MTH05 supplies real consumers.

## REQUIREMENTS

Use exact katex@0.19.1, upstream8000fbd4e29cca2c0cb1e88b745af3ed2f436b66. Verify actual archive version/integrity and refresh advisories. No CDN, private parse API, auto-render extension, model options, dangerouslySetInnerHTML, formula cache or commander CLI in the browser graph. This task alone temporarily reserves its exact package/lock/notice/source-entry hunks; release them after review. It does not own those shared files indefinitely.

The package audit must map the exact installed browser entry, distributed CSS and each CSS-referenced local font to archive-relative path, integrity/hash, size and applicable notices. These are package/source assets, not emitted application paths or measured bundle sizes. MTH02 adds no production import, standalone build entry or fixture. Ordinary build success and absence of math in an unreferenced entry cannot pass the emitted-asset, lazy-loading or zero-request gates. Those gates remain mandatory in MTH06; packaged Windows/offline distribution and assistive acceptance remain MTH07.

Coverage: Math T01 licensing/baseline-resource screen and T03 engine; R05/R06/R08/R10; A05/A06/A09/A10. Inherited requirements remain binding.

## REPO_MAP

math-renderer.ts and its Node test are proposed. Root package/lock/notices and scripts/build.mjs are verified integration paths. Source is MIT with applicable font/stretchy-SVG OFL notices, including Design Science/Khan Academy and reserved names; the installed archive must establish the shipped closure. GHSA-238p-pmpm-9mq7's conditional inherited-options flaw was fixed in0.18.2, not a claimed current Gen exploit.

At [cdb703b vite.config.ts](https://github.com/skytuhua-org/Gen-V1/blob/cdb703b94d73fd41abbe2d26aa5e88010700d976/vite.config.ts), the normal application build uses `apps/web` and emits `dist/web`; [scripts/build.mjs](https://github.com/skytuhua-org/Gen-V1/blob/cdb703b94d73fd41abbe2d26aa5e88010700d976/scripts/build.mjs) invokes that Vite build. An unreferenced new renderer does not establish a production asset graph. These are read-only evidence paths; no build configuration change is allocated here.

Existing narrow hunks: `package.json`, `pnpm-lock.yaml`, `apps/web/src/dependency-notices.ts`, `THIRD_PARTY_NOTICES.md`, `scripts/public-source-files.json`.

Proposed outputs: `apps/web/src/math-renderer.ts`, `tests/markdown-math-renderer.test.ts`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Freeze export renderMath(tex:string,mode:'inline'|'display',target:HTMLElement,remainingNodes:number): {kind:'rendered';elements:number}|{kind:'source';reason:'parse'|'budget'|'engine'}. target must be detached. Return no raw error markup; [MTH03 #2280](https://github.com/skytuhua-org/Gen-V1/issues/2280) consumes this exact private contract.

Call public katex.render into the detached target. Every expression receives a newly constructed object:
{displayMode:mode==='display',output:'htmlAndMathml',throwOnError:true,strict:'error',trust:false,maxSize:10,maxExpand:500,globalGroup:false,macros:Object.create(null)}.
No spreading of props/options/prototypes or reuse of macros. Reject generated output above2,048 elements per expression or caller's remaining aggregate budget; [MTH03 #2280](https://github.com/skytuhua-org/Gen-V1/issues/2280) owns the8,192-instance total and connected commit.

This entry imports the KaTeX browser API and distributed CSS. Its caller performs dynamic import only after admission; only the module promise may be shared. All CSS font URLs resolve to packaged local unmodified assets. Preserve MIT plus applicable OFL text and exact source/version/hash inventory. No-math entry, currency and code have no path to this module. Rendering remains synchronous: post-call timeouts do not establish cancellation.

Before consumers exist, verify that every distributed CSS URL maps to an actual unmodified file in the exact installed package and that the proposed import uses the public browser export without the commander CLI. Record this source mapping with the archive and notice evidence. MTH03 consumes the adapter through its isolated leaf harness; MTH04 binds the parser and MTH05 enables the three app callers. Only then can MTH06 follow the real production import edge, measure emitted JS/CSS/font bytes and verify local requests under the existing CSP. A zero-asset build at MTH02 is a regression observation only; keep those downstream rows NOT_RUN.

## EXECUTION_DAG

**T01.** Verify the exact0.19.1 archive, license/font metadata, advisory state and public browser exports against the pin. Record baseline entry/resource bytes before addition; stop on an unexplained artifact mismatch.

**T02.** Claim the small package/lock/notices/manifest hunks, add only the exact dependency through the package workflow and retain complete applicable notices. Record installed browser-entry/CSS/font paths, each CSS URL's local target, archive/file hashes, source sizes and applicable notices. Do not fabricate lock integrity or label package paths as emitted paths.

**T03.** Implement the detached public render wrapper, fresh fixed options and per-expression generated-node check. Return fixed error categories and discard rejected nodes without connecting them.

**T04.** Use real renderToString/public engine tests for supported formulas, expansion/global definitions, hostile trust-gated commands and cross-expression isolation. Register the new source in the existing inventory without adding any production import or new build/test entry.

**T05.** Run the ordinary build as a regression check and inspect the adapter's source imports against the package audit. Hand the accepted adapter and complete source-asset/license mapping to [MTH03 #2280](https://github.com/skytuhua-org/Gen-V1/issues/2280), with explicit pending emitted-graph/local-font/request rows owned by [MTH06 #2283](https://github.com/skytuhua-org/Gen-V1/issues/2283) after MTH05. Do not claim production emission or startup/lazy exclusion from an unreferenced build. Release dependency hunks.

**Done when:** Exact artifact/options/notice/source-asset contract is reviewable; the real public engine tests pass; generated output remains detached and app callers remain unchanged. An unavailable archive or unresolved source-asset/notice issue blocks integration. Emitted production assets and request/size gates remain explicitly NOT_RUN for MTH06, with packaged distribution remaining MTH07. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm build:widgets; pnpm exec vitest run tests/markdown-math-renderer.test.ts --maxWorkers=1; pnpm typecheck; pnpm build; pnpm exec vitest run tests/public-source.test.ts --maxWorkers=1. Positive corpus: fraction/sum/integral/matrix and repeated equal formulas with fresh options. Negative corpus: \href, \url, \includegraphics, \htmlClass, \htmlStyle, \htmlData, inherited option properties, \gdef leakage, expansion/size overflow and malformed TeX. Node tests cannot prove browser zero-network or connected DOM; [MTH06 #2283](https://github.com/skytuhua-org/Gen-V1/issues/2283) repeats actual requests/output. Record installed JS/CSS/font source sizes and exact CSS-to-local-file mappings here. Record ordinary build outcome separately as a regression check. The emitted lazy JS<=150KiB gzip, CSS<=40KiB gzip and font assets<=1MiB targets remain unchanged and NOT_RUN until MTH06 measures the integrated production build; source-package sizes cannot pass them.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**READY:** An isolated engine adapter and package/source-asset audit can proceed before syntax/caller integration; production callers remain absent. MTH06 after MTH05 owns emitted production graph, local loading and resource-cost proof; MTH07 retains packaged Windows/offline and assistive gates. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/KaTeX/KaTeX/blob/8000fbd4e29cca2c0cb1e88b745af3ed2f436b66/package.json).
- [Reference 2](https://github.com/KaTeX/KaTeX/blob/8000fbd4e29cca2c0cb1e88b745af3ed2f436b66/docs/options.md).
- [Reference 3](https://github.com/KaTeX/KaTeX/security/advisories/GHSA-238p-pmpm-9mq7).
- [Reference 4](https://github.com/KaTeX/KaTeX/blob/8000fbd4e29cca2c0cb1e88b745af3ed2f436b66/src/stretchy.ts).
