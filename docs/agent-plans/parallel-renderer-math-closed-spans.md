# MTH01: Recognize closed math spans with exact source and fixed budgets

## META

`skytuhua-org/Gen-V1`; parent [#2229](https://github.com/skytuhua-org/Gen-V1/issues/2229) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/MTH01`, 2026-11-25. Kind: implementation. Start: **READY**. Dependencies: None.

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-MATH-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-math-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Produce a small deterministic recognizer that identifies complete supported formulas without altering the input. It must keep canonical CRLF slices exact, treat rejected formulas as literal, and provide the admission decisions needed by parser and leaf workers.

## REQUIREMENTS

No KaTeX import, DOM, parser rewrite, persistent cache or Message/schema change. Scan only documents at most 100,000 UTF-16 units; admit at most 64 expressions, 32,768 total TeX units and 4,096 TeX units per expression in source order. The scan limit disables math scanning only, never content rendering. Recognition and render admission remain separate so an over-budget formula still protects its interior pipes from table splitting.

Coverage: Math T02; R02/R03/R04/R06; A02/A03/A04/A06. Inherited requirements remain binding.

## REPO_MAP

Proposed markdown-math.ts and its unit file do not exist at current main. Markdown.tsx owns inline code/link precedence, tableRow and normalized block lines; this task does not edit that file. Its consumer [MTH04 #2281](https://github.com/skytuhua-org/Gen-V1/issues/2281) must keep an original line-start table before CRLF normalization. All indices are JavaScript UTF-16 local source positions, never citation offsets.

Proposed outputs: `apps/web/src/markdown-math.ts`, `tests/markdown-math.test.ts`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Freeze these private interfaces:
```ts
type MathSpan = Readonly<{start:number;end:number;raw:string;tex:string;mode:'inline'|'display'}>;
type MathBudget = {expressions:number;sourceUnits:number};
mathScanAllowed(originalSource:string,enabled:boolean):boolean;
findInlineMath(text:string):readonly MathSpan[];
findDisplayMath(source:string,lineStarts:readonly number[],line:number):
  {span:MathSpan;nextLine:number}|null;
admitMath(span:MathSpan,budget:MathBudget):boolean;
```
mathScanAllowed returns enabled && originalSource.length<=100000. MTH04 calls it once on the whole original document before any segmented scan. findInlineMath receives local segments and cannot independently enforce a document-wide bound.

Recognize \(...\) inline and $...$ inline only within one prose line. A complete whole line $$...$$ with at most three leading spaces is display; standalone $$ opener/closer allows a multiline display. Whole-line \[...\] and standalone \[/\] lines are display. Embedded \[ in prose, a single $, raw \begin outside delimiters, empty/whitespace-only and mixed/incomplete forms remain source.

Use a bounded left-to-right scan, tracking odd escaping backslashes, escaped characters, brace depth and TeX % comments. A closer inside braces/comments does not close. Reject unmatched braces; failed candidates are consumed as a bounded literal region rather than repeatedly rescanning suffixes. Return raw===source.slice(start,end); never trim or normalize raw. tex excludes delimiters. Inline indices are relative to the supplied segment; display indices refer to the original Markdown string.

Existing complete code/link tokens that begin before a candidate take precedence. Accepted math consumes its body before Markdown sees *, _, brackets or pipes. Complete bold outside math preserves strong semantics; math may be recognized inside its complete bold body without adding general nested Markdown. The helper returns syntax decisions; parser composition is [MTH04 #2281](https://github.com/skytuhua-org/Gen-V1/issues/2281).

## EXECUTION_DAG

**T01.** Freeze named tests for every delimiter form and literal exclusion, original CRLF offsets, TeX comments/braces, escapes, CJK/emoji/combining text, code/link precedence, formula-in-bold and Markdown-looking math bodies.

**T02.** Implement only the private MathSpan scanning functions and original line boundary support. Return exact source on all failures, with no engine call or speculative closer.

**T03.** Implement deterministic admission counters and tests at below/at/above 4,096 units, 64 expressions, 32,768 total units and 100,000 document units. Include many failed openers and an over-budget closed formula containing table pipes.

**T04.** Run focused tests/typecheck, inspect rejection decisions and preserve the corpus unchanged. Register only these new paths in a short manifest reservation through the implementation coordinator, then release the helper for [MTH03 #2280](https://github.com/skytuhua-org/Gen-V1/issues/2280) and [MTH04 #2281](https://github.com/skytuhua-org/Gen-V1/issues/2281).

**Done when:** Reviewed helper signatures and all boundary/precedence/source tests pass. The result can be merged while every application surface still renders literal math. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm build:widgets; pnpm exec vitest run tests/markdown-math.test.ts --maxWorkers=1; pnpm typecheck. Assert exact raw slices after UTF-8 encoding, deterministic counts/order, preserved full rejected source and bounded scans on adversarial delimiters. Currency '$5 and $10', fenced/inline code, complete links, empty/partial/escaped/mixed math must never become an admitted render. Pure helper success is not app or TeX correctness.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**READY:** Pure new helper and tests are independent of package loading, native phase and shared parser edits. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/Markdown.tsx).
