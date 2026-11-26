# STR02: Implement the bounded remend paragraph projection

## META

`skytuhua-org/Gen-V1`; parent [#2228](https://github.com/skytuhua-org/Gen-V1/issues/2228) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/STR02`, 2026-11-25. Kind: implementation. Start: **READY**. Dependencies: None.

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-STREAMING-MARKDOWN-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-streaming-markdown-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Trial remend1.5.1 as a pure canonical-paragraph projection, admitting only a narrowly certified bold or single-backtick closer and preserving exact trailing whitespace. This is an isolated capability test, not renderer replacement.

## REQUIREMENTS

Pin remend1.5.1 at upstream4e86b0403b685e5eda142314bb2048a4646219db, verify registry tarball/integrity/public exports/dependency graph and Apache-2.0 notices before install. The prior registry endpoint failed, so artifact identity is not already verified. No Streamdown/AI SDK/Tailwind/Shiki, private import, custom handler, second parser, persistent cache or input mutation. Check32,768 UTF-16-unit cap before calling the engine; static/unknown/oversize makes zero repair calls.

Coverage: Streaming T01 artifact screen/T02; R01/R03/R04/R05/R09; A01/A03/A04/A08/A10. Inherited requirements remain binding.

## REPO_MAP

streaming-markdown.ts and unit file are proposed. Markdown.tsx's existing inline renderer can verify projected strong/code semantics without changing its parser. remend source declares no runtime dependencies; this must be checked against the actual artifact. Upstream unconditionally trims one trailing space even when handlers are disabled; upstream property tests allow edits that this adapter must reject.

Existing narrow hunks: `package.json`, `pnpm-lock.yaml`, `THIRD_PARTY_NOTICES.md`, `apps/web/src/dependency-notices.ts`, `scripts/public-source-files.json`.

Proposed outputs: `apps/web/src/streaming-markdown.ts`, `tests/streaming-markdown.test.ts`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Freeze:
```ts
type StreamingMarkdownProjection={text:string;changed:boolean};
projectStreamingParagraph(canonicalParagraph:string,provisional:boolean):StreamingMarkdownProjection;
```
Every call starts with canonical input, never previous healed output. False/unknown, cap failure, no change, unsupported edit or exception returns the original string and changed=false. Restore the exact original whitespace suffix before certifying output. Accept only one insertion immediately before that suffix: one/two asterisks completing two-asterisk bold or one backtick completing single-backtick code. Reject deletion/replacement/new escapes, mixed closers, added lines, unsupported nesting and every unrecognized difference.

Fixed options: bold:true,inlineCode:true,italic:false,boldItalic:false,strikethrough:false,links:false,images:false,katex:false,inlineKatex:false,htmlTags:false,comparisonOperators:false,setextHeadings:false,singleTilde:false. Both links and images must be false because they share a handler. A paragraph with any run of two or more backticks uses a stable inlineCode:false variant while retaining guarded bold. Underscore forms are not the selected bold handler. No sentinel URLs.

The adapter does not decide block eligibility. STR05 calls it only for the final ordinary paragraph after canonical block classification, with the original trailing boundary retained. Never repair code, lists, headings, tables, earlier paragraphs or a paragraph completed by a blank-line boundary. Safe rejection stays literal silently. Requiring a second parser or broader rewrites is REJECT, not permission to expand.

## EXECUTION_DAG

**T01.** Verify exact package/archive/integrity/license and freeze the20-case corpus below. Record actual-App baseline tails from STR01 when available, but do not block pure work on native discovery.

**T02.** Reserve only remend package/lock/notice/source-entry hunks, add the exact artifact through the normal workflow and release them when reviewed. No production caller is enabled.

**T03.** Implement explicit flags, cap, suffix restoration and closer-only certification using public exports. Catch library errors and return exact canonical input without retries.

**T04.** Run pure cases and strong/code semantic checks using the existing Markdown renderer. Record useful rejected inputs and zero-call static/oversize controls.

**T05.** Hand function/options/artifact evidence to [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289) or publish a reproducible REJECT. Remove an unused trial package through the same bounded dependency task if rejected.

**Done when:** All certified projection cases and exact fallback/whitespace/call-count tests pass with an audited artifact, or a durable REJECT is recorded. No app/native acceptance or O(delta) performance claim follows. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm build:widgets; pnpm exec vitest run tests/streaming-markdown.test.ts --maxWorkers=1; pnpm typecheck; pnpm build; public-source.test.ts. The20 planned decisions are: provisional bold; all its prefixes; partial bold closer; provisional single-backtick code; all its prefixes; completed unchanged; malformed static; one trailing space; double-space/newline/CRLF suffix; underscores/snake_case; italic/triple/nesting; multiple backticks; escape/trailing backslash; incomplete link; incomplete image; HTML/comparison/setext-like text; currency/math; emoji/combining/ZWJ; cap/cap+1; delimiter-heavy/rejected mutation/thrown-engine. Assert exact canonical output on every rejected case. Unit totals may exceed20 through parameterization; report actual counts. Browser semantics and cost remain STR07.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**READY:** Pure opt-in adapter research can proceed independently of native authority; adoption cannot. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/vercel/streamdown/blob/4e86b0403b685e5eda142314bb2048a4646219db/packages/remend/src/index.ts).
- [Reference 2](https://github.com/vercel/streamdown/blob/4e86b0403b685e5eda142314bb2048a4646219db/packages/remend/src/link-image-handler.ts).
- [Reference 3](https://github.com/vercel/streamdown/blob/4e86b0403b685e5eda142314bb2048a4646219db/packages/remend/__tests__/streaming-properties.test.ts).
