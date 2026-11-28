# STR05: Bind streaming repair only to the terminal assistant paragraph

## META

`skytuhua-org/Gen-V1`; parent [#2228](https://github.com/skytuhua-org/Gen-V1/issues/2228) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/STR05`, 2026-11-25. Kind: implementation. Start: **BLOCKED**. Dependencies: [STR02 #2286](https://github.com/skytuhua-org/Gen-V1/issues/2286), [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288), [STR06 #2290](https://github.com/skytuhua-org/Gen-V1/issues/2290), [SRC01 #2277](https://github.com/skytuhua-org/Gen-V1/issues/2277).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-STREAMING-MARKDOWN-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-streaming-markdown-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Apply the pure projection at the only approved Markdown boundary and explicitly wire it from verified assistant state. Finalization with identical text must immediately restore literal malformed source and retire stale reveal/source bookkeeping.

## REQUIREMENTS

Private Markdown.streaming?:boolean=false and a separate AssistantProse streaming input. Main and CanvasThread assistant prose only, each instance with STR04 state. User/activity/history/static artifact/Files/canonical/foreign/hidden/inert/held callers keep original behavior. Preserve exact Message.content, persistence/exports/Copy message/Copy code/source descriptors and UTF-16 mapping. No new image/HTML/highlighter/control/tab stop/live announcement, motion/delay, parser grammar or scroll writer.

Coverage: Streaming T04; R01-R04/R06-R08/R11; A01-A07/A09. Inherited requirements remain binding.

## REPO_MAP

Markdown's canonical blocks/classifiers own final paragraph, tables/fences/lists/headings and stable line keys. Its useMemo currently depends on text; app-panels AssistantProse has a custom comparator. The current final paragraph builder loses original line-boundary context if naively trimmed. SRC01 owns authored-root invalidation; STR06 owns renderRevision. Preserve optional math/Files/highlighter/Contents integrations already accepted at execution time.

Existing narrow hunks: `apps/web/src/Markdown.tsx`, `apps/web/src/app-panels.tsx`, `apps/web/src/App.tsx`, `tests/e2e/markdown.spec.ts`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Parse canonical blocks first and identify the final nonempty ordinary paragraph that still owns the current trailing inline block. A later block or completed blank-line boundary ends eligibility. Carry original trailing whitespace/boundary evidence through the classifier; never arbitrary-slice or heal an earlier paragraph. Only this paragraph calls projectStreamingParagraph. All other branches and ordinary code extraction/keys remain unchanged. If math is independently enabled, its recognizer still receives canonical source and cannot consume remend's synthetic delimiters.

Include streaming in Markdown parser useMemo and AssistantProse memo equality even when message object/content is unchanged. Do not derive it from animate/active/arrivals or reuse it for #1655 whole-run Contents eligibility. Supply STR04's current boolean explicitly only at approved assistant paths; absent/unknown remains false. Inactive/held owners cannot retain speculative formatting.

Pass SentenceReveal renderRevision='provisional' or 'static' from that verified state. This prop belongs only to reveal bookkeeping, never SourceMessage. Source DOM changes use SRC01's observer and synchronous guards; ordinary repaired prose does not acquire data-source-transformed merely to bypass exact mapping. Canonical access remains available, stable selected phrases/focus remain intact and intersecting edits cannot manufacture a selection. No remount-based repair.

## EXECUTION_DAG

**T01.** Refresh overlapping #1530/#1583/#1655 and current renderer integration heads; reserve the listed parser/caller hunks for this task only. Consume accepted STR04/SRC01/STR06 contracts.

**T02.** Add explicit streaming=false props, include them in both memo boundaries and wire only current main/canvas assistants. Preserve sibling keys and active/arrival motion semantics.

**T03.** Carry original canonical trailing-boundary metadata into the final paragraph decision and invoke STR02 only there. Keep all excluded block/caller branches literal and unchanged.

**T04.** Pass the reveal-only phase revision and verify shared source invalidation with same-text finalization, pointer/keyboard selection and canonical fallback. Add no competing observer or offsets.

**T05.** Extend existing real-App Markdown tests for all ten mounted groups below, run focused regressions and freeze the candidate for [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291). Release shared files.

**Done when:** A frozen actual-App candidate improves supported provisional strong/code semantics, final same-text immediately restores source, and all scoped regression/selection/memo checks pass. Native/cost release gates remain STR07/STR08. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm build:widgets; streaming adapter/state unit tests; source-selection unit tests; conversation-scroll.test.ts; pnpm typecheck; pnpm build; micro-motion config markdown.spec.ts micro-motion.spec.ts; runtime-presentation, conversation-scroll, workbench and workbench-app configs. Ten mounted groups: main live/final; CanvasThread/embedded isolation; original copy; pointer/keyboard selection across append/final; source fallback/no forged capture; static/history/user/artifact/Files exclusion; table/fence/list/heading/hostile regression; policy/theme/zoom/narrow layout; true event/native invalidation parity; long transcript/detached reading. Check24/200/4,096 table budgets/full fallback and numeric alignment. Actual App scenarios cannot be replaced by a standalone component mount.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Needs audited projection, valid browser/native authority, same-text reveal handling and shared source guards. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/issues/1655).
- [Reference 2](https://github.com/skytuhua-org/Gen-V1/pull/1697).
- [Reference 3](https://github.com/skytuhua-org/Gen-V1/issues/1530#issuecomment-7082885847).
