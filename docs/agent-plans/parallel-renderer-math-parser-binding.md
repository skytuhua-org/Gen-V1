# MTH04: Bind closed math into Markdown without changing default parsing

## META

`skytuhua-org/Gen-V1`; parent [#2229](https://github.com/skytuhua-org/Gen-V1/issues/2229) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/MTH04`, 2026-11-25. Kind: implementation. Start: **BLOCKED**. Dependencies: [MTH01 #2278](https://github.com/skytuhua-org/Gen-V1/issues/2278), [MTH03 #2280](https://github.com/skytuhua-org/Gen-V1/issues/2280), [SRC01 #2277](https://github.com/skytuhua-org/Gen-V1/issues/2277).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-MATH-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-math-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Connect the reviewed recognizer and formula leaf at one narrow parser boundary, retaining the literal default and all existing Markdown behavior. This task does not turn on any production caller.

## REQUIREMENTS

Add private math?:boolean=false and renderOwner?:string. Compute mathActive=mathScanAllowed(originalText,math) before any inline/display/table scan. If false, skip recognition, admission and imports, retain ordinary literal parsing, and cancel prior math jobs. The100,000 UTF-16 cap applies to the whole original document, never each segment. Original source remains the only math input, even if streaming projection later changes prose presentation. Preserve keys, all code bytes/copy, links/no-image/no-HTML policy, list depth and table bounds24columns/200rows/4,096derived cells. No general parser migration.

Coverage: Math T02 parser portion/T04 seam; R02/R03/R04/R06/R09/R10; A02/A03/A04/A06/A07. Inherited requirements remain binding.

## REPO_MAP

Markdown.tsx currently normalizes CRLF before blocks and memoizes blocks only by text. tableRow has its own code-span pipe handling; list/heading/table branches call inline. SentenceReveal textMap has separate proseOnly and all-text modes. This task only adds the math marker to proseOnly exclusions. It does not own motion timing or STR06's same-text revision logic.

Existing narrow hunks: `apps/web/src/Markdown.tsx`, `apps/web/src/SentenceReveal.tsx`, `tests/e2e/micro-motion.playwright.config.ts`, `scripts/browser-suites.ts`.

Proposed outputs: `tests/e2e/markdown-math.spec.ts`, `tests/e2e/markdown-math-leaf-fixture.tsx`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Create original line starts before normalization. Display spans slice the original string and are recognized after fence detection and before ordinary paragraphs. Inline math applies inside prose/headings/list text/table cells but never inside fences, complete code/link tokens or model renderer options. Closed formula bodies become opaque before Markdown interprets their *, _, brackets or pipes. Closed but non-admitted spans remain complete literal fragments, still opaque to table splitting. Preserve malformed-row fallback and total table budget.

The Markdown instance owns stable local identity and increasing canonical-source revision, plus one MTH03 queue. renderOwner, when supplied, invalidates pending work on change without making it a public catalog/host field. Include text, math and relevant owner/leaf inputs in parser/leaf memoization. No remount-based fix; keep existing sibling keys. Include math changes even when text is identical.

Create useMathRenderOwner once per Markdown instance and pass MathSpan, sourceRevision, ownerKey, leafKey and its owner object to MarkdownMath. Consume SRC01 markers as specified; do not add a second observer or SourceMessage prop. Add [data-markdown-math] only to SentenceReveal's prose-only exclusion; do not change its full selection map. Outer reveal wrappers must also skip formulas. Recognition requires syntactic closure only, never final-message/run state.

## EXECUTION_DAG

**T01.** Refresh #1530/#1549 and #1583/#1632 before reserving Markdown hunks. Preserve pending CodeBlock/MarkdownPolicy APIs if integrated. Obtain a short SentenceReveal marker-hunk allocation separate from STR06 and #1811 motion work.

**T02.** Add the whole-original-text mathActive guard, original line indexing, math=false/owner props and one instance queue. Pass that same guard to every inline/display/table branch before recognition or lazy import; compose spans in source order.

**T03.** Make closed math opaque to tableRow pipes, including budget rejection; preserve no-math behavior and every table/list/fence fallback. Add the prose-only math exclusion.

**T04.** Create markdown-math.spec.ts and register its exact name in the existing micro-motion config and browser-suites inventory. Extend MTH03's isolated /tests/e2e/markdown-math-leaf.html fixture to mount the actual shared Markdown with explicit math=true/false; reserve only that fixture hunk. Actual App three-caller scenarios are added by MTH05, without a production test flag.

**T05.** Run focused syntax and shared-component browser regressions plus the unchanged real-App Markdown spec. Hand a frozen parser/caller-prop contract to [MTH05 #2282](https://github.com/skytuhua-org/Gen-V1/issues/2282), then release Markdown/SentenceReveal/config/fixture hunks.

**Done when:** The parser binding passes focused source/precedence/component-browser checks, actual-App callers still default to literal math, and shared hunks are released for other renderer tasks. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm build:widgets; pnpm exec vitest run tests/markdown-math.test.ts tests/markdown-math-queue.test.ts --maxWorkers=1; pnpm typecheck; pnpm build; pnpm exec playwright test --config tests/e2e/micro-motion.playwright.config.ts markdown.spec.ts markdown-math.spec.ts. Assert exact CRLF raw copies, complete math closing while a run remains active, \text{a ** b}, math inside complete bold, both pipe directions and budget-rejected cell contents. Default-off/currency/code/link-only inputs make zero math imports. Test99,999/100,000/100,001 original units, including over-cap documents split into many short paragraphs, list items and table cells; over-cap cases keep literal math and fetch zero math assets. Compare existing no-math semantic DOM, keys and Copy code payloads. Run #1549/#1632 focused tests only if those candidate APIs have actually landed. No test-only flag may leak into production.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Requires accepted helper, leaf/queue and shared source-invalidation contracts. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/Markdown.tsx).
- [Reference 2](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/SentenceReveal.tsx).
