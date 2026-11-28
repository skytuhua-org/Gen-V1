# STR06: Settle SentenceReveal after same-text presentation revisions

## META

`skytuhua-org/Gen-V1`; parent [#2228](https://github.com/skytuhua-org/Gen-V1/issues/2228) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/STR06`, 2026-11-25. Kind: implementation. Start: **READY**. Dependencies: None.

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-STREAMING-MARKDOWN-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-streaming-markdown-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Allow an authored presentation to change without changing canonical text while retiring masks and refreshing conservative selection bookkeeping. It must not replay prose reveal or alter motion timing.

## REQUIREMENTS

Add only SentenceRevealProps.renderRevision?:string default ''. This is not a SourceMessage prop or source-offset contract. No new animation, timer, character split, delay, focus/scroll, policy/speed change or broad W3 rewrite. Preserve existing Full/Reduced/Off/System behavior and pointer/focus/keyboard cancellation. Math/diagram marker exclusions are different narrow hunks owned by their integration leaves.

Coverage: Streaming T04 reveal seam; R07/R08/R11; A06/A07/A09. Inherited requirements remain binding.

## REPO_MAP

SentenceReveal stores previous rendered prose, conservative selected logical offsets and in-flight masks, with a layout effect keyed by text/animate/initialReveal/revealClassName/publication. It already separates proseOnly and all-text maps. #1811 is the integrated-acceptance ISSUE, not PR1811; W3 is released with acceptance unmet. Coordinate exact revision hunk with current #1115/#1811 and duration-only #2214 owners.

Existing narrow hunks: `apps/web/src/SentenceReveal.tsx`, `tests/e2e/micro-motion.spec.ts`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Add renderRevision to the layout-effect dependencies and remember the previous canonical text and previous revision separately from rendered prose. On revision change with identical canonical text, retire old masks/callbacks, re-evaluate only the existing conservative all-text selection restoration when a selection exists, update remembered DOM prose, and return before scheduling a reveal. Do not fake a text append or set previous=null to trigger entrance replay. With simultaneous canonical text change, retain the current append/replacement reveal policy.

When remapping a selected phrase, keep the existing unchanged-outside-diff test and exact selected-string equality. An intersecting edit invalidates bookkeeping without creating a different range or canonical offset. Unselected same-text revisions do not need the expensive full map. All other props/default callers stay behaviorally unchanged. renderRevision is a private explicit presentation signal; SRC01 independently owns source-action invalidation and there is no second observer here.

STR05 will pass exactly provisional/static. The fixture used here can toggle two child presentations for unchanged canonical text without installing remend, so this task has no functional dependency on native phase or math. A short reservation serializes shared SentenceReveal lines but does not wait on unrelated feature adoption.

## EXECUTION_DAG

**T01.** Read current SentenceReveal and latest #1115/#1811/#2214 journals; claim only the new prop/same-text bookkeeping hunk and its existing micro-motion cases.

**T02.** Add the optional default-empty prop, previous canonical/revision bookkeeping and the same-text revision branch. Preserve ordinary text-change reveal and all policy/timing paths.

**T03.** Extend micro-motion.spec.ts with synthetic unchanged-text child replacement and phase toggles, stable selected phrase and intersecting selection cases; do not add a trial engine.

**T04.** Run full/reduced/off/System, pointer/focus/keyboard cancellation and simultaneous text+revision cases. Confirm zero new masks/replay on same-text change and updated remembered DOM.

**T05.** Publish the tested prop contract for [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289), release the exact hunk and preserve math/diagram exclusion slots for their owners.

**Done when:** Default-compatible renderRevision contract and focused real-browser evidence are reviewable independently. Existing motion timings/ownership and source APIs remain unchanged. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm typecheck; pnpm build; pnpm exec playwright test --config tests/e2e/micro-motion.playwright.config.ts micro-motion.spec.ts markdown.spec.ts. Positive: canonical append still follows existing policy; an unchanged selected phrase survives a safe DOM-only revision. Negative: same-text revision schedules zero new reveal, obsolete masks/callbacks are gone and intersecting changes cannot produce a different selection. Same-text revisions remain static in every mode; ordinary text changes retain System's effective OS policy. Repeat toggles with retained siblings to prove no remount or stale mask. This does not satisfy #1811's broader live acceptance.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**READY:** Independent bounded reveal bookkeeping API; tested with synthetic same-text child replacement before streaming adoption. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/SentenceReveal.tsx).
- [Reference 2](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7104926319).
- [Reference 3](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7122916244).
- [Reference 4](https://github.com/skytuhua-org/Gen-V1/issues/2214).
