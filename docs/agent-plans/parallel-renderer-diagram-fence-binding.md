# DIA06: Bind canonical fences and completion proof to eligible callers

## META

`skytuhua-org/Gen-V1`; parent [#2230](https://github.com/skytuhua-org/Gen-V1/issues/2230) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/DIA06`, 2026-11-25. Kind: implementation. Start: **BLOCKED**. Dependencies: [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293), [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297), [SRC01 #2277](https://github.com/skytuhua-org/Gen-V1/issues/2277).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-DIAGRAM-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-diagram-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Connect only eligible canonical Mermaid fence bodies to the reviewed leaf, preserving exact CRLF source and truthful newline-versus-EOF completion. No math or remend adoption is required.

## REQUIREMENTS

Pilot only main-conversation assistant Markdown and existing BoundMarkdown artifacts with verified owner/revision. All unassessed callers, Files/user/WorkActivity/decision/canonical panels stay source. Internal trial gate defaults off until DIA08 acceptance, no new public setting/catalog/schema. Preserve ordinary code/Lezer/Files policy, copy/link/no-image/no-HTML, list/table limits and the existing scroll controller.

Coverage: Diagram T05; R03/R04/R07/R08/R09; A01/A04/A05/A08/A11. Inherited requirements remain binding.

## REPO_MAP

Markdown.tsx currently normalizes CRLF and drops fence language; #1530/#1549 owns pending CodeBlock/language/copy, #1583/#1632 owns Files-only policy. Reconcile those exact heads before this short binding reservation. app-panels/App main caller and registry BoundMarkdown deliver app-owned identity/finality from DIA01. SentenceReveal needs only a narrow diagram exclusion; SRC01 owns the sole source observer.

Existing narrow hunks: `apps/web/src/Markdown.tsx`, `apps/web/src/app-panels.tsx`, `apps/web/src/App.tsx`, `apps/web/src/registry.tsx`, `apps/web/src/SentenceReveal.tsx`, `tests/e2e/markdown.spec.ts`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Freeze private Markdown props diagrams?:boolean=false and diagramFinality?:'known-final'|'known-static'|'unknown'='unknown', plus the agreed private renderOwner identity. Reuse an already accepted renderOwner prop from another renderer without making its adoption a dependency. DiagramInput.streaming uses verified current authority if available; otherwise false with finality=unknown, never false as proof. The exact owner derivation is DIA01's reviewed contract, not a model prop or new Message field.

Recognize only an exact eligible Mermaid language at the existing fence branch. Slice its body from original UTF-16 input using original line starts before normalization; preserve CRLF/trailing newline. Do not silently change normal CodeBlock extraction. Classify closure as incomplete, closed-newline when the exact matching delimiter line has its terminating newline, or closed-eof. Newline closure may qualify while later prose streams. EOF requires independently known-final/static and streaming=false. Contradictory true+final/static and unknown native EOF remain source. Final-proof arrival with unchanged text must recompute eligibility; default false, persisted messages and lack of run activity are not authority.

Scope and generation are per owned block/source revision. Changes only to later prose/theme/scroll must not cancel/re-layout an unchanged certified block. A changed body/owner invalidates old output immediately. Request at most4 automatic previews per Markdown owner, in source order; later eligible blocks remain source. Keys/siblings stay stable, one layout per unchanged eligible source, and explicit Source preference survives late completion.

Apply SRC01 app-owned markers with no new observer/offset mapping; test same-text publish/removal/source-mode switch in real workbench paths. Add data-markdown-diagram plus SVG/summary/control exclusion only to SentenceReveal's prose masks, not its all-text selection map. Reserve App caller hunks separately from ANC04 reading-root/onNavigate and ANC05 history-focus. Async preview cannot write scrollTop/focus; release requires ANC04 geometry evidence, not a local compensator.

## EXECUTION_DAG

**T01.** Refresh protected CodeBlock/Files/current callers and claim exact fence, caller and exclusion hunks. Consume DIA01 owner/finality and SRC01 marker contracts; if proof is missing keep that caller source-only.

**T02.** Add original fence-body slicing and explicit closure/finality inputs. Keep the default-off gate and all ordinary-code/parser paths unchanged.

**T03.** Bind only main assistant and assessed BoundMarkdown; preserve per-block generation/memoization so later prose/theme/scroll produce zero extra layouts. Add same-text proof arrival and source-preference behavior.

**T04.** Apply source/reveal markers and extend real Markdown/workbench cases for lazy publication/removal/mode switch, stale selection UI and canonical source.

**T05.** Run regression and ANC04 geometry cases, freeze the off-by-default pilot candidate for [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299) and release shared hunks. Missing geometry blocks adoption, not the independent leaf work.

**Done when:** Exact canonical fence/caller integration passes at a frozen disabled pilot SHA, with truthful completion and source invalidation. Every unassessed/unknown case retains source; final adoption remains DIA07/DIA08. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run policy/client units plus source-selection-v3/dom-v3; pnpm typecheck; pnpm build; micro-motion config markdown.spec.ts; workbench/workbench-app and conversation-scroll configs. Required cases: unclosed/partial delimiter; false+unknown EOF source; newline+unknown eligible; false+verified final/static EOF eligible; true+known-final/static source; final proof without text change; later prose; native unknown/reconnect; owner/source replacement; late Source preference. Copy exact original body, no layout repeats, no forged UTF-16 capture. Existing table24/200/4,096/code/link/HTML/Files/find regressions pass. On accepted ANC04 candidate detached visible anchor moves<=2px after preview; no new scroll writer.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Needs reviewed owner/finality proof, leaf and shared source guards; remend/math adoption is not required. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/issues/1530#issuecomment-7082885847).
- [Reference 2](https://github.com/skytuhua-org/Gen-V1/pull/1632).
- [Reference 3](https://github.com/skytuhua-org/Gen-V1/issues/2218).
