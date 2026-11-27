# Bounded mathematical notation in shared Markdown

## META

| Field | Value |
| --- | --- |
| Repository / parent | `skytuhua-org/Gen-V1` / [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212) |
| Revision / date | `AI-MATH-R1` / 2026-11-25 |
| Product baseline | Verified `main@96ca4c3bd0664fca53775fbe31915c209641986c` |
| Documentation branch | `docs/ai-harness-library-plans`; planning only |
| Dedicated issue / implementation PR | [#2229](https://github.com/skytuhua-org/Gen-V1/issues/2229); no implementation PR exists for this plan |
| Planning owner | `codex-cloud-anchor-dcd8eb`, [Y04-MATH claim](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7169483458); coordinator owns publication |
| Implementation / runtime acceptance | `NOT_STARTED` / `NOT_RUN` |
| Selected reuse candidate | Direct `katex@0.19.1`, exact version; upstream tag commit `8000fbd4e29cca2c0cb1e88b745af3ed2f436b66` |
| Provenance | Pinned Gen source and tests, complete relevant issue/PR outcomes, official KaTeX source/options/security/license/font material; comparative Gen runtime measurements remain pending |

**Goal:** Make supported mathematical expressions readable in replies and existing Markdown surfaces while retaining exact source, safe rendering, bounded work and the current harness contracts.

**Architecture:** A Gen-owned closed-delimiter recognizer feeds a lazy KaTeX leaf. Existing Markdown remains the owner of blocks, tables, links and code. The leaf cannot change messages, authorize actions, fetch document-authored resources or infer source offsets.

The chosen engine is an adoption candidate, not a claim of measured superiority. T01 and T05 compare the actual baseline with the candidate. Failure of a mandatory safety, fidelity or responsiveness gate leaves source rendering in place and records a rejection. No package is installed by this planning publication.

## OBJECTIVE

The baseline `Markdown.tsx` recognizes headings, nested lists, bounded tables, code fences and a small inline grammar. Mathematical notation such as `\(\frac{a}{b}\)` or a closed `$$` equation remains literal text. Its fence renderer also has no special math mode. This is established by source inspection; no local runtime reproduction is claimed here.

A reader should see a fraction, matrix or integral as mathematical notation when the expression is complete and within explicit limits. While it is incomplete, unsupported, oversized or unavailable, the original notation must remain readable and copyable. Single-dollar currency and mathematical-looking code must retain their current meaning. The existing Copy message action continues copying the original message, including delimiters, whitespace and line endings.

Direct KaTeX is narrower than adopting Streamdown or an AI chat framework. The inspected `@streamdown/math@1.0.4` declares `katex:^0.16.27`, `rehype-katex:^7.0.1` and `remark-math:^6.0.0`; its public adapter exposes `errorColor` and `singleDollarTextMath`, without forwarding the resource and trust options this plan requires. KaTeX 0.19.1 provides the documented rendering API and explicit controls directly. Preserve Gen's runtime, model selection, approvals, resource grants and component registry.

## REQUIREMENTS

All numeric limits below are proposed product limits, not measurements of the current application or upstream defaults. T01 records baseline evidence; T05 must verify these limits at the candidate head. Changes to them require a full plan revision and new evidence.

| ID | Requirement and observable outcome | Task / acceptance |
| --- | --- | --- |
| R01 | Reproduce the absence of rendered math in actual main chat and the existing generated Markdown fixture; compare the candidate on the same synthetic input and settings. Record capability, correctness, bytes, responsiveness and remaining limitations. | T01,T05 / A01,A09 |
| R02 | Render only closed `\(...\)` inline math, closed `$$...$$` inline math within a prose line, and standalone display forms described in DESIGN. A single `$` is always literal. Incomplete, empty and malformed candidates remain source. | T02,T04 / A02 |
| R03 | Math is explicit opt-in only for the main AssistantProse, CanvasThread assistant messages and registry BoundMarkdown. Other callers retain literal math by default, including Files, InputDecision and permission prompts. Preserve non-math Markdown, code bytes/copy, link policy, table budgets and all supplied text. Never parse math inside fenced/inline code or a complete existing link token. | T02,T04 / A03 |
| R04 | Keep canonical content and full-source copy exact. Display source/copy use the original delimited substring, including CRLF. Formula indices never become SourceRef offsets. A local presentation epoch invalidates source actions after lazy DOM changes; app-owned controls are excluded from authored-text measurement and rendered math forces canonical-source fallback. | T02,T04 / A04,A07 |
| R05 | Use exact `katex@0.19.1` through a Gen-owned leaf, with `trust:false`, finite `maxSize`/`maxExpand`, fresh macros and fixed options. Retain local package/CSS/font assets and all applicable notices. No CDN, user options object, raw HTML path or document-authored network requests. | T03,T05 / A05,A10 |
| R06 | Bound recognition, admitted expressions, total source, generated nodes and scheduling. No-math documents must not load KaTeX/CSS/fonts. Source stays available during loading; parsing/render failure cannot blank the message or crash its siblings. | T02,T03,T05 / A06,A09 |
| R07 | Late module work, queued renders or generated output cannot commit after source revision, owner replacement or unmount. Repeated unrelated renders reuse an accepted unchanged leaf. No persistent source cache, cross-thread macro state or automatic retry loop. | T03,T04 / A07 |
| R08 | Provide HTML plus MathML, readable neutral light/dark/forced-color presentation, keyboard access to display source/copy and contained horizontal overflow only where necessary. Do not scale text to fit or add vertical nested scrolling. | T03,T04,T05 / A08 |
| R09 | Math is immediate semantic content, without fades, veils, stagger or reveal animation in Full, Reduced or Off. Preserve prose selection and input/IME/Send/Stop responsiveness. A selection intersecting a pending math leaf defers replacement until that selection leaves. | T03,T04,T05 / A07,A08,A09 |
| R10 | One acknowledged integrator owns shared Markdown, SentenceReveal, stylesheet, fixtures, dependency/lock/notice and manifest edits. Preserve existing code-highlighting, Files-preview, rendering-budget and transcript-anchor work. | T01,T04,T05 / A10 |
| R11 | Publish a complete source/issue plan and later report actual implementation, tests, Windows/accessibility evidence and ownership separately. A mock, DOM snapshot or browser screenshot is not native or assistive-technology acceptance. | T01,T05 / A01,A08,A10 |

**User flows.** A completed formula becomes readable without a new card or modal. A streamed opening delimiter stays literal until its matching close arrives; closing a formula does not imply the message or run finished. A display formula has a compact native `details` disclosure named **Formula source**, containing the exact delimited source and the existing `CopyButton` labelled **Copy formula source**. Inline formulas add no repeated buttons or tab stops; original message copy and canonical-source access remain available. A rendering failure retains source with fixed, non-live explanatory text for a display block. It never exposes a raw exception as HTML.

**Excluded.** No single-dollar math, whole-document auto-render extension, new CommonMark/GFM engine, custom TeX packages or model-defined rendering options, global macros, chemistry extension, equation cross-reference registry, image export, equation editor, PDF generation, source-citation invention, Tailwind/AI SDK/runtime migration, syntax-highlighter replacement or parser-repair dependency. Formulas inside existing complete link tokens remain literal label/destination content. Raw `\begin{...}` outside an admitted delimiter is not implicitly math. The approved 48-component catalog is unchanged.

## REPO_MAP

All current-source claims below refer to the baseline SHA. New filenames and APIs are proposals, explicitly marked.

| Existing path / symbol | Verified contract and integration consequence |
| --- | --- |
| `apps/web/src/Markdown.tsx`: `inline`, `tableRow`, `list`, `blocks`, `Markdown` | Inline grammar is complete bold, single-backtick code and HTTP(S)/fragment links. Fences already show unclosed code as code. Tables cap at 24 columns, 200 rows and 4,096 derived cells across a render. There is no math branch. `blocks` normalizes CRLF; exact formula source must be sliced from original input before that normalization is lost. |
| `apps/web/src/markdown.css` | Shared prose/code/table layout. Add scoped math rules; do not restyle all code, tables or messages. |
| `apps/web/src/SentenceReveal.tsx`: `textMap`, `SentenceReveal` | Excludes code, tables, controls, sensitive fields and hidden text from prose veils. Its logical selection restoration is not a mapping from rendered mathematics to canonical source. Add a narrow math-output exclusion for prose masks, retaining its general selection logic. |
| `apps/web/src/app-panels.tsx`: `AssistantProse`; `apps/web/src/App.tsx`: main message rows and `CanvasThread` | Main and canvas assistant content use shared Markdown under SourceMessage. Main animation is `active || initial.current`; it does not identify a message as incomplete. Math must not depend on this value. |
| `apps/web/src/registry.tsx`: `BoundMarkdown`, `Document`; `apps/web/src/task-motion.tsx`: `IncomingAnswer` | These reuse Markdown. Only BoundMarkdown opts in initially; Document and IncomingAnswer retain default literal math. IncomingAnswer has an outer SentenceReveal, so the math marker remains excluded at any future nesting level. No registry-schema change. |
| `apps/web/src/SourceWorkbench.tsx`: `SourceMessage`; `apps/web/src/SourceSelectionActions.tsx`: `mapSelectedText`, selection handling | Canonical selection uses original text. Its current measurement effect depends only on text/enabled; a lazy renderer can change DOM without refreshing exactRendering. Add the single local epoch/recheck contract below; preserve ambiguity, hidden/inert and owner checks. |
| `apps/web/src/CopyButton.tsx` | Existing copy feedback and source input. Reuse for display formula source; do not copy HTML, MathML or inferred plain-text mathematics. |
| `tests/e2e/markdown.spec.ts`; `tests/e2e/task-interface-fixture.ts` | Existing actual-app fixtures cover headings/lists/links/code, hostile HTML, malformed and oversized tables, streaming table updates, source selection and both themes/narrow width. Extend this surface instead of inventing an unrelated demo as proof. |
| `tests/e2e/micro-motion.playwright.config.ts` | Actual scoped config includes `markdown.spec.ts`, Vite on port 5476, one worker. There is no assumed top-level Playwright config. |
| `tests/source-selection-v3.test.ts`, `tests/source-selection-dom-v3.test.ts`; `tests/e2e/workbench.spec.ts`, `tests/e2e/workbench-app.spec.ts` | The named dom-v3 file tests the pure UTF-16 mapper, not real DOM. Actual browser fixtures cover transformed refusal, keyboard selection and delayed action settlement; extend those for lazy DOM invalidation. |
| `package.json`, `pnpm-lock.yaml`, `apps/web/src/dependency-notices.ts`, `THIRD_PARTY_NOTICES.md`, `scripts/public-source-files.json`, `scripts/build.mjs` | Exact dependency and lock pin, distribution notices, new-source inventory and Vite asset/build integration. Actual package/archive contents and packaged asset paths must be verified, not inferred from source license alone. |
| Proposed `apps/web/src/markdown-math.ts` | Pure syntax recognition, original-source spans and deterministic admission budgets; no KaTeX import or DOM work. |
| Proposed `apps/web/src/MarkdownMath.tsx` and `apps/web/src/math-renderer.ts` | Gen-owned leaf/lifecycle and lazy KaTeX API/CSS entry. One dedicated output island; no generic HTML rendering API. |
| Proposed `tests/markdown-math.test.ts`, `tests/markdown-math-renderer.test.ts`, `tests/e2e/markdown-math.spec.ts` | Decision-level parser/security/bounds tests and actual-app lifecycle/visual coverage. Register new browser spec in the verified scoped configuration and suite inventory. |

### Existing work and ownership

| Track / inspected outcome | Required coordination |
| --- | --- |
| [#1530](https://github.com/skytuhua-org/Gen-V1/issues/1530), [PR #1549](https://github.com/skytuhua-org/Gen-V1/pull/1549), open at `796097030fa3c4dfeed65291c602d1268ef2e23d` | CodeMirror/Lezer fenced-code highlighting, explicit no-Shiki policy. Latest inspected checkpoint [7082885847](https://github.com/skytuhua-org/Gen-V1/issues/1530#issuecomment-7082885847) retains `devin-a-cloud-f1a91d` until release. Do not edit overlapping Markdown/package files without fresh release or acknowledged split. |
| [#1583](https://github.com/skytuhua-org/Gen-V1/issues/1583), [PR #1632](https://github.com/skytuhua-org/Gen-V1/pull/1632), open at `ff9e1093ddba30bd20e2040d6b581856df082a59` | Files-only `MarkdownPolicy` for headings/links/authorized PNG/JPEG. Full plan excludes a new Markdown engine and Mermaid. Default parser compatibility is an explicit existing gate. Implementation [7069498493](https://github.com/skytuhua-org/Gen-V1/issues/1583#issuecomment-7069498493) and review [7091784264](https://github.com/skytuhua-org/Gen-V1/issues/1583#issuecomment-7091784264) released their scope; refresh before integration. Windows smoke remains unrun in that journal. |
| [#1960](https://github.com/skytuhua-org/Gen-V1/issues/1960), [PR #2030](https://github.com/skytuhua-org/Gen-V1/pull/2030), open at `30b71cece9959c02c71fdca13ddae14c960d0de8` | Full issue/journal/PR outcome is host SSE live buffering, paged replay and shared serialization. Not a math or Markdown parser implementation. Its [latest release](https://github.com/skytuhua-org/Gen-V1/issues/1960#issuecomment-7130798617) does not allocate any frontend source. |
| [#1969](https://github.com/skytuhua-org/Gen-V1/issues/1969), [PR #2062](https://github.com/skytuhua-org/Gen-V1/pull/2062) | Existing bounded renderer work, find scans, terminal updates and table limits remain intact. No replacement table engine or broad performance rewrite. |
| [#2218](https://github.com/skytuhua-org/Gen-V1/issues/2218) | Reading-position compensation belongs to the transcript controller. Math must not write scrollTop or focus to compensate for its own delayed layout. Shared anchor acceptance is a release dependency if asynchronous math above a detached reader would otherwise move the reading position. |
| [#1115](https://github.com/skytuhua-org/Gen-V1/issues/1115), [PR #1811](https://github.com/skytuhua-org/Gen-V1/pull/1811), [#1546](https://github.com/skytuhua-org/Gen-V1/issues/1546) | Existing shared-motion ownership must be refreshed before touching SentenceReveal/task-motion or shared browser cases. Math needs only an exclusion marker; no policy/timing redesign. |
| Parent Y04-MD and Y04-DIAGRAM | Separate streaming-repair and diagram candidates. They can develop independent leaves, but only one acknowledged worker integrates shared Markdown/CSS/tests/lock/manifest at a time. Math recognizes complete source independently of any proposed `streaming` prop. |

## DESIGN

### 1. Syntax and source fidelity

Add the private presentation prop `math?: boolean = false` to `Markdown({text, animate, initialReveal, math})`. Only AssistantProse, CanvasThread's assistant branch and registry BoundMarkdown pass `math={true}`. User/activity messages, WorkActivity, InputDecision, operation/permission prompts, Files preview, Document, IncomingAnswer and all other callers keep the default. The opt-in is app code, not a model-supplied renderer-options prop. No host/schema change. Non-math behavior stays identical. If a separate trial adds `streaming?: boolean`, math recognizes only closed canonical source and never consumes synthetic delimiters from repaired presentation text.

Include `math` in Markdown's memoized parser inputs. When false, skip math recognition/admission/loading entirely, preserve current table parsing, and invalidate any pending math jobs from an earlier true value.

| Input shape | Result |
| --- | --- |
| `The ratio is \(a/b\).` | Inline math, surrounding prose unchanged. |
| `The ratio is $$a/b$$ today.` | Inline math; one line only. |
| A whole line `$$a/b$$`, allowing at most three leading spaces | Display math. |
| A standalone `$$` opener and matching standalone `$$` closer | Multiline display math; inner CRLF preserved in source. |
| A whole line `\[a/b\]`, or standalone `\[` and `\]` delimiter lines | Display math. Embedded `\[` in prose remains literal. |
| `$5`, `$5 and $10`, escaped openers, empty/whitespace-only expressions, missing close, unmatched braces or mixed delimiters | Original source. No partial expression execution. |
| Any math-looking input inside a fence, complete inline-code token or complete existing link token | Existing code/link behavior; no math parsing. |

Recognition uses a bounded left-to-right scan, not a nested unbounded regex. An odd number of escaping backslashes prevents a delimiter; backslash-delimited forms use a backslash that is not itself escaped. Track TeX brace depth and escaped characters; a closing delimiter inside braces or a TeX `%` comment is not a close. Inline forms cannot cross a line break. A failed opener consumes its bounded candidate as literal rather than repeatedly rescanning every suffix. Do not imply full TeX or CommonMark parsing from this recognizer.

The existing complete code/link tokens take precedence when their opening starts before a math candidate. An accepted math span consumes its body before Markdown sees `*`, `_`, brackets or pipes inside it. Existing bold outside math keeps its current strong semantics; math within a complete bold body may be recognized without extending other nested inline syntax. Test both directions so formula source such as `\text{a ** b}` cannot accidentally create Markdown nodes.

`tableRow` must treat a syntactically closed math span as an opaque cell fragment, as it already does for code-span pipes. A pipe inside such a span is not a new table column. Recognition and render admission are separate: an over-budget admitted-looking span remains exact literal cell content, never discarded. Actual table budgets and malformed-row fallback remain unchanged. Headings/list text/table cells may contain inline math; display math is a top-level block form only in this first version.

Proposed pure contracts in `markdown-math.ts`:

```ts
type MathSpan = Readonly<{
  start: number; end: number; raw: string; tex: string;
  mode: 'inline' | 'display';
}>;
type MathBudget = { expressions: number; sourceUnits: number };
findInlineMath(text: string): readonly MathSpan[];
findDisplayMath(source: string, lineStarts: readonly number[], line: number):
  { span: MathSpan; nextLine: number } | null;
admitMath(span: MathSpan, budget: MathBudget): boolean;
```

These are proposed private APIs, not existing exports. Inline indices are relative to the supplied segment; display indices address the original Markdown string. They are not evidence/citation offsets. Keep an original line-start table before current CRLF normalization so `raw === original.slice(start,end)` for a display expression. Rendered `tex` excludes delimiters; do not trim or normalize `raw`. `admitMath` consumes one document-scoped budget in deterministic source order, including headings, lists and cells. It never changes the original source when rejecting a span.

### 2. Bounded lazy renderer and fixed options

Initial limits are: scan math only when the original Markdown is at most **100,000 UTF-16 code units**; at most **64** admitted expressions and **32,768** total TeX code units per Markdown render; at most **4,096** TeX code units per expression; at most **2,048** generated element nodes per expression and **8,192** across the current Markdown instance. Beyond a bound, retain source. Existing Markdown/table behavior remains available even when the math scan is disabled.

`math-renderer.ts` imports only the pinned KaTeX browser rendering API and its distributed CSS. `MarkdownMath.tsx` loads that module only after at least one closed expression passes admission. CSS/font URLs must resolve to packaged local assets. A document containing only currency, incomplete delimiters or code must fetch no math chunk or fonts. The package's CLI `commander` dependency must not enter the browser entry/chunk graph.

Use the documented public `katex.render(tex, detachedElement, options)` API, not private parse-tree APIs and not `dangerouslySetInnerHTML`. Build output in a detached, leaf-owned element and commit its children only after the generation and node budgets still pass. KaTeX alone owns the contents of this output island; React owns its surrounding leaf, source and controls. Never concatenate model HTML into the island.

Construct a fresh app-owned options object for every expression. Do not spread model props, an options prototype, JSON attributes or a previous formula's macros into it:

```ts
{
  displayMode: span.mode === 'display',
  output: 'htmlAndMathml',
  throwOnError: true,
  strict: 'error',
  trust: false,
  maxSize: 10,
  maxExpand: 500,
  globalGroup: false,
  macros: Object.create(null)
}
```

`strict:'error'` intentionally prefers source fallback for unsupported notation. This is a compatibility policy, not a claim that all Unicode or LaTeX is supported. `trust:false` disables trust-gated URL/image/HTML commands; preserve tests for `\href`, `\url`, `\includegraphics`, `\htmlClass`, `\htmlStyle` and `\htmlData`. Returned error messages may contain source, so only render a fixed Gen message and the original React text, never the exception's HTML or stack.

Use one bounded queue per Markdown instance, processing at most one admitted expression per animation-frame callback. This is work scheduling, not an animation or a wait before input. Source is visible immediately and Send/Stop never await the queue. A single KaTeX call is synchronous and cannot be cancelled mid-call; finite input/expansion/node limits and T05's worst-case main-thread measurement are mandatory. If one admitted expression still violates the long-task gate, lower the admitted grammar/limits in a reviewed revision or reject adoption; a timeout after synchronous work does not prove cancellation.

Only the module-loading promise is shared across instances. No global cache of formula text/output, no persisted source cache and no shared mutable macros. An unchanged accepted leaf is memoized within its current instance/revision. Loading failure keeps exact source and does not trigger periodic retries; reopening/reloading can retry. Per-expression parse/budget failure affects only that expression. Any optional retry control must be separately scoped; none is part of this version.

### 3. Ownership, cancellation and selection

The Markdown instance owns a stable local identity and a monotonically increasing source revision. Each queued job captures instance identity, revision, leaf position, mode and exact raw source. The leaf also has an effect generation. A queue job may commit only if its instance and leaf remain mounted, all captured values match current values and its output target is still that leaf's connected element. Cleanup invalidates queued work and pending import continuations before removing nodes. Do not use a module-global “latest message” or infer an owner from visible text.

Current main/canvas message rows are keyed by message ID; the generated surface retains its own renderer owner. T01 verifies this at every shared caller. If a caller can replace its owner without remounting an otherwise identical Markdown instance, thread an explicit private `renderOwner` identity at that caller and include it in generation invalidation; do not invent a host field or retrofit unrelated surfaces. This is a bounded discovery step with a required owner-switch test, not permission for an unrecorded generic context framework.

A hidden/inert owner must not receive newly generated DOM. Before each queued start and commit, check the leaf's current connected/hidden/inert state and document visibility. If temporarily hidden, retain source and mark the job deferred; resume through one bounded observer/listener owned by that Markdown instance when it becomes eligible. Observe only the rendered owner/leaf set, not the entire application's attributes. Disconnect it when there are no pending jobs or on cleanup. Offscreen work may defer, but cannot strand an expression permanently after it becomes visible.

Before replacing raw source with rendered output, check whether the current selection intersects that leaf. If it does, retain the source until the selection collapses or moves outside. Do not move focus, collapse the selection or manufacture canonical offsets to force rendering. A single owner-scoped selection listener can release deferred leaves and is removed with the queue. Selection in unrelated prose must remain unchanged. Replacing one expression must not rerender accepted siblings.

Mark the whole formula leaf with `data-markdown-math`. Add it to SentenceReveal's **prose-only** exclusion, so any outer wrapper also excludes the leaf. Do not change its all-text selection map or replay surrounding prose on module resolution.

**One shared source-presentation contract, owned by T04.** SourceSelectionActions currently refreshes authored text only on `[text,enabled]`. Add one MutationObserver on its own `.source-selection-text` root for subtree child/character changes and the two app-owned marker attributes below. Coalesce each record batch into one local `presentationEpoch`/existing-revision increment, clear the candidate and recompute exactRendering. Do not observe the whole document or add per-formula observers here. Mutations wholly inside source-control UI do not invalidate authored presentation. Disconnect on disable/unmount and discard stale settlements.

Use `data-source-selection-ui` on Gen's formula source disclosure/copy controls and duplicate raw-source display; exclude those descendants from the **authored-text comparison**, without constructing an offset map. `visible(range,root)` must reject a candidate crossing that UI even when its text is visible. Use `data-source-transformed="true"` on an accepted rendered math/diagram wrapper; its presence immediately makes exactRendering false. Markers are produced by app wrappers, not interpreted from model text or renderer options. Pending/raw fallback is measured as original source; control captions such as Formula source or Copied cannot contaminate the comparison.

Both `read()` and `act()` synchronously recheck current authored text, transformation marker, canonical identity, connected/visible range and current epoch before offering/dispatching an action. The act check also verifies range text and mapped canonical substring still equal the candidate. This closes the gap before the observer callback. Any mismatch clears the candidate and exposes Select canonical source where appropriate, never inferred UTF-16 offsets. Incrementing revision fences old catch/finally/selection clearing; it does not cancel an already-dispatched host action or alter a valid captured receipt. Reuse this exact observer/marker seam for the separately planned diagram and streaming adapters, not competing presentationRevision props. Short-circuit on the transformation marker to avoid rescanning a large generated tree on every queued leaf commit.

Math never calls scroll/focus APIs. Pair delayed formula layout with the shared #2218 reading-anchor contract. Test normal tail following, detached reading, and owner switch/return. If baseline lacks accepted reflow preservation, record the dependency and block shipping the asynchronous integration until that controller work is integrated. Do not add a second compensator inside Markdown.

### 4. Presentation, accessibility and distribution

Use normal inline baseline alignment and the existing prose size. Keep KaTeX's own legible mathematical typography; no CSS transform scaling. Display math occupies normal document flow without another decorative panel. It may have a labelled horizontal overflow region when the expression cannot fit; the conversation remains the vertical scroll owner. The source disclosure uses existing neutral text/borders and `CopyButton`, with visible focus, no absolute overlay over the formula and no content-clipping height cap.

Use `htmlAndMathml` so the engine supplies MathML and its visual HTML layer. Verify that the visual duplicate is hidden from assistive technology and the MathML remains available. Do not replace the formula with an `aria-label` containing raw TeX, add `role=img` around all output or announce every token as a live status. Inline failures stay literal without repeated status announcements. Display failure text is **Math display unavailable. Source shown.** with no untrusted error interpolation. Screen-reader reading and source-disclosure use require an actual recorded manual check, not an accessibility-tree assertion alone.

All math output is static under Full/Reduced/Off, OS reduced motion and every existing speed. Follow current dark/light/forced-colors ink and borders. Test wide expressions at 390px, short windows and app zoom 100/125/150%; browser zoom is not native DPI verification. Font availability and reflow must also be checked in the packaged Windows build with the network unavailable.

Retain KaTeX's MIT notice. Its font/SVG source also contains SIL Open Font License 1.1 notices, including Design Science and Khan Academy copyright and reserved font names. Keep distributed fonts unmodified and preserve their metadata/notices; do not relabel them as only MIT. Verify the installed archive's complete license contents and retain missing required notice text through the existing distribution-notice mechanism, with an explicit source/version/hash inventory. Add the direct dependency to `dependency-notices.ts`; update `THIRD_PARTY_NOTICES.md` with both engine and font attribution. Do not copy unrelated KaTeX development/test fonts into the product.

The official advisory GHSA-238p-pmpm-9mq7 concerns inherited renderer options when the consuming application already has prototype pollution or attacker-controlled option prototypes. It is fixed in 0.18.2; the selected 0.19.1 is later. This screening result is not a finding that Gen currently has that vulnerability. Refresh current advisories before installation and release; never silently downgrade to the older bridge's range.

### 5. Integration and rollback

The shared integrator applies only the small math seam after acknowledging #1530/#1549 and #1583/#1632 integration order. Preserve any landed `MarkdownPolicy`, code-block leaf and raw-copy contracts. Math and diagram code can coexist as independently admitted leaves; neither requires the streaming repair trial or a replacement renderer. If this plan's optional caller owner seam overlaps the streaming plan, agree on one private identity prop rather than inventing competing ones.

There is no data migration. Rollback removes math recognition/leaf imports and returns to existing literal Markdown; canonical messages, drafts, source refs, resources and artifacts remain unchanged. Remove the dependency/lock/notices only when no remaining feature uses them. Failed trials publish evidence and keep raw rendering, without leaving a hidden partial implementation or claiming a completed feature.

## EXECUTION_DAG

`T01 -> T02 -> T03 -> T04 -> T05`. This deliberately serializes the small shared parser seam. T03's isolated renderer tests can be prepared while T02 is reviewed, but package/lock/notice edits require the same integration owner. Every task begins by refreshing the complete child/parent journal; shared-file ownership is never inferred from silence. Future implementation workers use normal issue claims/checkpoints and release on handoff.

### T01. Establish the actual baseline, owner map and adoption gate

**Prerequisites / inputs:** Complete plan, parent journal, current main, current candidate PR heads and licensed KaTeX pin. **Owner:** one implementation lead, read-only until its source scope is acknowledged. **Files:** existing REPO_MAP paths; evidence directory discovered under the repository's established ignored test-output conventions. **Output:** pinned baseline/ownership matrix, fixture corpus and comparative measurement protocol.

- [ ] Refresh main and full #1530/#1549, #1583/#1632, #1969/#2062, #2218 and shared-motion claims. Obtain release or an acknowledged file split before editing overlapping source. Name the shared integrator and record parser/diagram integration order.
- [ ] Inspect all Markdown callsites and their actual React ownership keys. Enumerate any caller needing the private renderOwner seam; record its exact value and reset condition. Verify SourceMessage and outer IncomingAnswer behavior. No new public host contract is permitted.
- [ ] Reproduce literal math in main assistant content and a generated Markdown artifact using `taskFixture`/`serveTaskFixture`, then inspect a native Windows baseline when available. Include fraction, sum, matrix, currency, code/link examples and exact source copy. Record source-derived expectation separately if an environment cannot run.
- [ ] Capture baseline cold/warm bundle/resource requests, normal prose update work and input responsiveness. Fix fixture text, viewport, settings, browser/build versions and performance procedure for T05. Read installed-package licensing/security before adding the exact dependency.

**Tests / done-when:** Existing scoped Markdown cases run or have exact named blockers; baseline math absence and source-copy behavior are recorded on actual app surfaces. Every shared path has an acknowledged owner; each future test has its fixture and expected distinction. **Handoff:** integrator accepts T02; no runtime success is inferred from source reading.

### T02. Implement pure closed-math recognition without changing canonical text

**Prerequisite:** T01. **Files:** new `markdown-math.ts`, `tests/markdown-math.test.ts`; narrowly coordinated parsing changes in `Markdown.tsx`. **Consumes:** original text and existing inline/fence/table rules. **Produces:** DESIGN's MathSpan/MathBudget helpers and deterministic source-only fallback; no KaTeX import yet.

- [ ] Write decision tests for every syntax-table row, escaped delimiters, brace/comment handling, CRLF, formula inside bold, Markdown-looking formula bodies, inline code/fences, full link tokens and table pipes. Assert exact raw slices and complete original-source preservation.
- [ ] Add admission tests at 4,096/4,097 units, 64/65 expressions, 32,768 total units, and 100,000/100,001 document units. Include many failed openers and budget rejection inside a table. Record expected failures before implementing.
- [ ] Implement the bounded scan and original line offsets. Keep existing table count/column/row/cell limits and code newline/copy behavior byte-equivalent on no-math inputs. Recognize complete display blocks after fence detection and before ordinary paragraph parsing.
- [ ] Run focused unit tests and existing Markdown browser regression; inspect semantic DOM for no-math samples rather than approving only snapshots. Register new source/test paths through the integrator's manifest edit.

**Positive / negative tests:** Closed supported syntax is identified; currency, partial source, code and destinations are not. No math content is silently dropped when bounds reject it. **Done-when:** pure helper decisions and unchanged non-math behavior pass; the app may still display all math as source. **Handoff:** T03 receives the exact helper contract and corpus.

### T03. Build the bounded KaTeX leaf and owned work lifecycle

**Prerequisite:** T02; exact dependency/security/license screen accepted. **Files:** new `MarkdownMath.tsx`, `math-renderer.ts`, `tests/markdown-math-renderer.test.ts`; coordinated package/lock/notices/source inventory. **Consumes:** admitted MathSpan and current Markdown owner/revision. **Produces:** source-first output island, bounded queue and cancellation-safe static math. Node Vitest tests cover pure policy/queue decisions and public renderToString output; the repository has no assumed jsdom dependency. Actual DOM, requests and lifecycle acceptance belong to T04 browser tests.

- [ ] Add the exact KaTeX dependency and lazy CSS entry; inspect the actual archive, font notices and browser dependency graph. No-math startup must contain no KaTeX module/CSS/font request. Retain all required licenses and record packaged asset paths.
- [ ] Test fixed options, fresh macros, cross-expression/global-definition isolation, unsupported commands, expansion/size limits and hostile trust-gated commands against the real public engine. Browser tests in T04 additionally inspect DOM and intercept requests; a mock render function is not security proof.
- [ ] Implement the public render API into a detached island, generated-node admission and one-job-per-frame queue. Preserve source until successful owned commit. Exercise import failure, parse failure, budget rejection and an unchanged sibling.
- [ ] Add deterministic controlled-import/queued-job tests for source update, same-position replacement, owner switch, unmount, hidden/inert deferral/resume and selection overlap. Old completions must never replace new content or clear a newer queue state. Verify cleanup of frame callbacks/listeners/observers.

**Positive / negative tests:** Supported bounded formulas render; unsafe/unsupported/oversized input retains source; no external requests and no cross-owner output. **Done-when:** leaf tests pass against real KaTeX plus controlled lifecycle scheduling; lazy module and license evidence are recorded. **Handoff:** integrator accepts the leaf for T04. No full-app acceptance is claimed yet.

### T04. Integrate shared Markdown, source access and accessible presentation

**Prerequisite:** T03 plus refreshed shared-file ACK. **Files:** `Markdown.tsx`, `markdown.css`, narrow `SentenceReveal.tsx` exclusion, `SourceSelectionActions.tsx`; explicit opt-ins in `app-panels.tsx`, `App.tsx`, `registry.tsx`; only T01-verified extra identity edits. New `tests/e2e/markdown-math.spec.ts`, existing micro-motion config/suite inventory and `workbench-fixture.tsx`/`workbench.spec.ts`/`workbench-app.spec.ts`. **Consumes:** source/owner-safe leaf. **Produces:** opt-in main/canvas/generated Markdown math, source controls and the single shared presentation-epoch seam.

- [ ] Wire the leaf to admitted spans and original source revision only at the three explicit opt-ins. Preserve default literal behavior for Files, InputDecision/permission prompts and other callers; preserve current/pending Lezer integration. Never feed repaired presentation text into math or canonical source actions.
- [ ] Add `data-markdown-math` prose-mask exclusion, MathML/visual-layer semantics, neutral typography and display source/copy disclosure. Keep existing Copy message payload exact. Test keyboard use, pointer selection and a surrounding selected prose range while another formula resolves.
- [ ] Use actual app fixtures for main assistant, canvas/split or embedded owner, and generated Markdown. Update a formula while its module is pending, change owner, hide/restore the pane, remove a formula and fail module loading. Assert no stale output, focus theft, source truncation or stranded deferred render.
- [ ] Implement the authored-root observer/epoch, UI exclusion and synchronous read/act guards. Hold canonical text/enabled constant while a module resolves: a previously valid candidate must invalidate immediately, fallback must appear, and late old catch/finally must not clear a newer selection or busy state. Caption changes inside source UI must not change authored equality; selections crossing UI are refused. Repeat with diagram/streaming-shaped DOM changes to prove one shared contract, with no engine dependency between plans.
- [ ] Exercise all existing Markdown safety/table and source-selection browser tests, plus zero math imports for default-off callers. Test no masking and static Full/Reduced/Off behavior without changing timing policies.

**Positive / negative tests:** Formula and exact source are both reachable; code/currency/links unchanged; transformed math cannot forge a source capture. **Done-when:** actual-app browser acceptance A02-A08 passes at a frozen candidate head and ownership-specific regression evidence is recorded. **Handoff:** T05 receives the candidate head, raw baseline evidence and list of unrun platform gates.

### T05. Compare, accept or reject, and hand off the complete implementation

**Prerequisite:** T04. **Files:** focused tests/evidence and the normal PR/issue journal; any fixes remain within the same acknowledged scope. **Consumes:** T01 baseline and frozen candidate. **Produces:** explicit adopt/reject decision, complete evidence and release/handoff record.

- [ ] Run VALIDATION commands and paired corpus. Report correct rendered formulas, correct literal fallbacks, exact copy, requests, per-expression/total work, no-math entry delta, lazy JS/CSS/font sizes and cleanup counts. Do not compare different viewports or motion settings.
- [ ] Verify detached-reader continuity with #2218's accepted controller; test delayed math above the viewport, normal tail mode, explicit navigation and thread switch/return. If the controller is absent or fails, keep the math release gate blocked rather than adding a leaf compensator.
- [ ] Perform packaged Windows offline-font/zoom/light-dark/input/Stop smoke and a real screen-reader MathML/source-disclosure check. Store redacted findings with exact environment. Mark missing access as NOT_RUN and keep that gate pending.
- [ ] Record rejected inputs, known supported-notation limits, dependency/license inventory and rollback. Open a focused implementation PR using the repository template. Freeze edits before final browser verification; any material fix reruns only affected acceptance and required gates.
- [ ] Publish the requirement/acceptance result matrix, candidate head, actual command results, native/a11y outcomes, unresolved failures and next reviewer. Release ownership and request receiver ACK through the existing issue protocol; do not close or merge merely because a draft is complete.

**Done-when:** every mandatory acceptance has PASS evidence or an explicit adoption rejection. An implementation PR with missing native/assistive evidence is REVIEW/PENDING, not verified-on-main. **Recipient:** frontend reviewer, then Windows/accessibility verifier where separate; maintainer retains merge/closure authority.

## VALIDATION

### Commands and environments

Run from repository root after the existing documented Node/pnpm/widget setup. The following are **planned**, not executed by this publication. New filenames are created by the tasks above.

```sh
pnpm build:widgets
pnpm exec vitest run tests/markdown-math.test.ts tests/markdown-math-renderer.test.ts tests/source-selection-v3.test.ts tests/source-selection-dom-v3.test.ts --maxWorkers=1
pnpm exec playwright test --config tests/e2e/micro-motion.playwright.config.ts tests/e2e/markdown.spec.ts tests/e2e/markdown-math.spec.ts
pnpm exec playwright test --config tests/e2e/workbench.playwright.config.ts
pnpm exec playwright test --config tests/e2e/workbench-app.playwright.config.ts
pnpm typecheck
pnpm lint
pnpm build
pnpm check:docs-links
```

T04 registers the new spec in `micro-motion.playwright.config.ts` and the existing browser suite inventory before that command is valid. If #1632 is integrated, also run its exact `files-markdown-policy`/`files-markdown-references` unit files and `tests/e2e/project-search.playwright.config.ts`; verify their current names from the accepted head. If #1549 is integrated, run its `tests/code-highlight.test.ts` and existing code/browser cases. These conditional paths are candidate-PR tests, not files claimed present on baseline.

Use a pinned synthetic corpus: fractions/sums/integrals/matrices; braces/comments; Latin/CJK prose adjacent to math; both inline delimiters and both display forms; CRLF; `$5 and $10`; incomplete and mixed delimiters; literal code/link destinations; table pipes; maximum/adversarial size/expansion/node cases; trust-gated resource/HTML commands; repeated equal formulas in distinct owners; exact full-message/display-source copy. Preserve the same corpus for baseline and candidate.

### Acceptance matrix

| ID | Requirements | Exact acceptance evidence |
| --- | --- | --- |
| A01 | R01,R11 | Baseline main assistant and generated Markdown visibly show literal formula source; candidate renders supported cases correctly. Actual app screenshots/DOM/source-copy checks and environment/commit pins. No source-only observation labelled a runtime reproduction. |
| A02 | R02 | Unit matrix proves only selected complete delimiters render; currency, code-like, empty, escaped, comment-contained closes, incomplete and malformed forms remain exact source. Closing a formula during continued run works without inferred completion state. |
| A03 | R03 | Three app-owned opt-ins render; all default-off callers retain literal math and load no math assets. Existing Markdown/browser tests pass, including hostile HTML/no images, links/lists/code copy and 24/200/4,096 table bounds. Formula pipes do not split cells. Files and Lezer acceptance stays unchanged. |
| A04 | R04 | Message copy equals original input byte-for-byte after UTF-8 encoding; formula source copy equals its original delimited CRLF substring. Lazy DOM replacement with unchanged text/enabled invalidates an old source candidate and updates fallback. UI captions/duplicate disclosure do not enter authored measurement; crossing UI is refused. Canonical capture remains correct; no offset inferred from MathML. |
| A05 | R05 | Actual 0.19.1 renderer with explicit options; unsafe URL/image/HTML commands cause no external request, active anchor or executable node. Error text stays escaped. Macro definitions do not survive another expression/owner. Advisory/package/notice evidence recorded. |
| A06 | R06 | Exact scan/expression/source/node bounds tested just below/at/above; all rejected source remains. No-math/currency/code documents request zero math chunks/CSS/fonts. Import failure preserves readable message and controls without retry churn. |
| A07 | R04,R07,R09 | Deferred jobs cannot commit after revision/owner/unmount; hidden/inert deferral resumes; stable siblings stay mounted. Selection intersecting a pending leaf defers replacement; unrelated prose/input stays intact. Source-action late settlements cannot clear newer UI, and synchronous act guards reject before observer delivery. Zero queue/listener/observer growth across 100 cycles. |
| A08 | R08,R09,R11 | MathML/visual duplicate semantics verified in DOM and actual screen reader; source disclosure/copy works by keyboard. Dark/light/forced colors, 390px/short layout, 100/125/150% app zoom, Full/Reduced/Off and OS reduced motion are readable with zero math animations/veils. Packaged Windows works offline with local fonts. |
| A09 | R01,R06,R09 | Paired measurements show useful rendered notation without a no-math startup resource regression. New lazy math JS gzip target at most 150 KiB; CSS at most 40 KiB gzip; emitted math font assets at most 1 MiB. No math-attributable task over 50ms on the admitted adversarial corpus; one render/frame and input-to-next-paint p95 at most 50ms during the 64-formula case. Report hardware and raw distributions; if a ceiling fails, revise/reject, never relabel an unmeasured assumption. #2218 detached-reader and switch/return tests pass before release. |
| A10 | R05,R10,R11 | Shared-file ACKs and current PR heads recorded, exact dependency/lock/inventory/notices present, no runtime/approval/source schema change, focused PR/CI state honest, complete plan and implementation handoff retrievable. |

Performance numbers in A09 are acceptance targets. They are not KaTeX guarantees or measured current figures. Measure cold and warm runs separately. Collect at least five repeated candidate/baseline runs for input timing, report median/p95 and failures, and retain unmodified samples instead of selecting the fastest run. A font-loading failure is a failure even when fallback text makes a screenshot look acceptable.

Capture paired **1920x1080** before/after clips without added title cards or overlays: completed math, gradual closure, source/copy, delayed owner switch and active typing/Stop while formulas queue. Caption version, synthetic fixture and settings outside the video. Also capture narrow/dark/light and offline native evidence; the wide clip does not replace those tests. Do not publish user messages, local account paths or provider traces.

**Release gate:** all safety/fidelity/ownership and platform/a11y acceptance passes; head-to-head evidence establishes the specific capability gain without violating responsiveness/resource limits; shared reading-anchor integration passes. Dependency freshness and notices are rechecked at release. Otherwise retain exact source rendering and publish the blocked/rejected outcome. Browser pass, PR readiness, merge and verified-on-main remain separate states.

## STATE

**Researched/decided:** baseline parser/source/selection/copy paths and existing tests inspected; full #1960/#1583 outcomes read; existing Lezer/Files-preview ownership protected; direct KaTeX 0.19.1 selected for a bounded trial; official MIT/font notice/options/security/advisory material read. This is a source-backed new capability, independent of a streaming-parser replacement.

**Not implemented or verified:** proposed helpers/leaves/tests, package pin, CSS/fonts/distribution, source-owner seam, parser changes, actual-app baseline reproduction, comparative performance, Windows/offline/screen-reader/visual acceptance. No application tests or benchmarks have been executed for this plan. Product T01-T05 and A01-A10 remain NOT_STARTED/NOT_RUN.

**Current ownership:** Y04-MATH drafting is complete and [released](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7169882450); coordinator owns full-body issue publication, source registration, commit and PR. Latest accepted releases/ACKs in the parent journal control current ownership. Existing product owners retain their claims. No product files or dependency entries are changed by this document.

**Material risks:** parser precedence can change source semantics; synchronous KaTeX can exceed a frame despite bounds; hidden/retained owners can accept stale output; MathML and visual HTML can duplicate reading; local fonts/notices can be omitted from native packaging; late layout can expose the existing detached-reader gap. Each has an explicit test and rejection/dependency gate above. Unsupported notation falls back honestly instead of silently omitting content.

**Next action:** #2229's publication header/journal records the immutable source, documentation PR and exact readback. A separately assigned implementer refreshes claims/main/PR heads and begins T01. Do not start product implementation from publication alone or treat a documentation release as transfer of shared source ownership.

## REFERENCES

Repository evidence is pinned to [main 96ca4c3](https://github.com/skytuhua-org/Gen-V1/tree/96ca4c3bd0664fca53775fbe31915c209641986c). Relevant exact files: [Markdown](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/Markdown.tsx), [SentenceReveal](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/SentenceReveal.tsx), [SourceSelectionActions](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/SourceSelectionActions.tsx), [Markdown browser acceptance](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/tests/e2e/markdown.spec.ts), [visual contract](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/DESIGN.md), [contribution contract](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/CONTRIBUTING.md). Related issue/PR and claim links are recorded in REPO_MAP and META.

| Primary upstream reference | Relevant facts and adoption decision |
| --- | --- |
| [KaTeX 0.19.1 package](https://github.com/KaTeX/KaTeX/blob/8000fbd4e29cca2c0cb1e88b745af3ed2f436b66/package.json), [public API implementation](https://github.com/KaTeX/KaTeX/blob/8000fbd4e29cca2c0cb1e88b745af3ed2f436b66/katex.ts) | Exact version/exported render API; public DOM render is synchronous. Private parse-tree APIs are explicitly unstable and are not used. |
| [Pinned options](https://github.com/KaTeX/KaTeX/blob/8000fbd4e29cca2c0cb1e88b745af3ed2f436b66/docs/options.md), [current options documentation](https://katex.org/docs/options) | `htmlAndMathml`, trust, strict/error, maxSize/maxExpand and mutable macros behavior. Gen supplies stricter finite values and fresh options. |
| [Security guidance](https://katex.org/docs/security), [GHSA-238p-pmpm-9mq7](https://github.com/KaTeX/KaTeX/security/advisories/GHSA-238p-pmpm-9mq7) | Untrusted-input controls and unescaped error-message warning. Conditional inherited-options issue affects versions below 0.18.2; fixed version selected, no claim of a current Gen exploit. |
| [MIT license](https://github.com/KaTeX/KaTeX/blob/8000fbd4e29cca2c0cb1e88b745af3ed2f436b66/LICENSE), [stretchy SVG notices](https://github.com/KaTeX/KaTeX/blob/8000fbd4e29cca2c0cb1e88b745af3ed2f436b66/src/stretchy.ts), [font metadata](https://github.com/KaTeX/KaTeX/blob/8000fbd4e29cca2c0cb1e88b745af3ed2f436b66/src/fonts/lib/Space.ttx), [official OFL 1.1](https://openfontlicense.org/open-font-license-official-text/) | Retain engine copyright/MIT and applicable font/SVG OFL notices and reserved names. Inspect shipped archive and packaging rather than treating all payloads as one license. |
| [Pinned font documentation](https://github.com/KaTeX/KaTeX/blob/8000fbd4e29cca2c0cb1e88b745af3ed2f436b66/docs/font.md) | Fonts ship in TTF/WOFF/WOFF2 and distributed CSS expects local font assets. Actual app bundling and offline native behavior remain implementation tests. |
| [Streamdown source pin](https://github.com/vercel/streamdown/tree/4e86b0403b685e5eda142314bb2048a4646219db), [math package](https://github.com/vercel/streamdown/blob/4e86b0403b685e5eda142314bb2048a4646219db/packages/streamdown-math/package.json), [adapter](https://github.com/vercel/streamdown/blob/4e86b0403b685e5eda142314bb2048a4646219db/packages/streamdown-math/index.ts) | Ecosystem reference for math in LLM text. Its older KaTeX range and narrower adapter controls do not meet this plan's fixed-option boundary. No wholesale Streamdown adoption or measured speed claim follows. |

The primary pages and exact source were inspected on 2026-11-25. Later implementations refresh current advisories, dependency metadata and repository ownership while retaining these immutable evidence pins.
