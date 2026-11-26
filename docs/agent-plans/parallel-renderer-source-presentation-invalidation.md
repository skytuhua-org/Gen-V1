# SRC01: Invalidate source actions when authored presentation changes

## META

`skytuhua-org/Gen-V1`; parent [#2229](https://github.com/skytuhua-org/Gen-V1/issues/2229) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/SRC01`, 2026-11-25. Kind: implementation. Start: **READY**. Dependencies: None.

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-MATH-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-math-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

A lazy renderer can replace authored DOM while canonical text and enabled stay unchanged. Make inline source capture fail closed immediately, expose canonical source when needed, and prevent an older action settlement from clearing a newer selection or busy state. This is reusable infrastructure with engine-free acceptance.

## REQUIREMENTS

Own only SourceSelectionActions and narrowly named browser fixtures/cases. Preserve mapSelectedText's unique UTF-16 equality, range visibility, current-owner checks in SourceWorkbench, focus, keyboard selection and existing host action authority. Add no source-offset synthesis, substring shortcut, new SourceMessage presentation prop, global observer or engine dependency. Already-dispatched host actions and valid receipts are unchanged.

Coverage: Math R04/R07/R10 and A04/A07/A10; streaming R07 and A06; diagram R03/R09 and A08. Inherited requirements remain binding.

## REPO_MAP

SourceSelectionActions currently measures root.textContent in a layout effect keyed by [text,enabled], stores authored/current revision and captures a DOM Range. Its read/act paths use text equality and visible(). SourceMessage in SourceWorkbench supplies canonical text and current context callbacks. The dom-v3 unit file exercises the pure mapper; real DOM coverage is in the two workbench suites.

Existing narrow hunks: `apps/web/src/SourceSelectionActions.tsx`, `tests/e2e/workbench-fixture.tsx`, `tests/e2e/workbench.spec.ts`, `tests/e2e/workbench-app.spec.ts`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

One MutationObserver belongs to each enabled .source-selection-text root. Observe subtree childList, characterData and attributes restricted to data-source-selection-ui and data-source-transformed. Coalesce one delivered record batch into one local presentationEpoch increment and existing revision increment; synchronously invalidate candidateRef and state, clear obsolete UI, then recompute exactRendering. Disconnect on disable/unmount. Ignore mutations wholly inside already app-owned source UI; adding/removing/changing either marker must still trigger correct authored remeasurement.

Authored measurement excludes descendants marked data-source-selection-ui, including copy controls and duplicate raw disclosures. Any accepted wrapper with data-source-transformed="true" short-circuits exactRendering=false before walking its generated descendants. Only Gen wrappers create these markers. Unmarked pending/raw fallback remains measured against canonical text. visible(range,root) rejects ranges crossing source UI, including interior descendants.

Both read() and act() must synchronously remeasure authored content and markers before offering or dispatching. Check connected root/range, visibility, latest enabled/canonical text, the current local revision and upstream current-owner boundary. act additionally compares Range.toString(), the captured selected string and canonical.slice(start,end). A mismatch invalidates the candidate before dispatch and shows canonical access when appropriate. Preserve existing current-owner callbacks; do not invent a host identity or mapping API.

The same revision fences successful selection clearing, catch/finally and canonical-open settlements. A late old result cannot clear a new candidate, error or busy state. A presentation mutation does not cancel an already dispatched operation. No scrolling, focus movement or new live announcement is added.

## EXECUTION_DAG

**T01.** Read the complete parent plans and current workbench paths; claim only the four listed files/hunks. Freeze engine-free fixtures for same-text replacement, marker toggles, source UI caption mutation and delayed action settlement.

**T02.** Add authored measurement and the root-local observer/epoch to SourceSelectionActions. Preserve the pure mapper and existing upstream owner fences. Make marker detection short-circuit generated trees.

**T03.** Add synchronous read/act guards and immediate candidateRef invalidation. Fence all async UI settlements with the current revision, including canonical-source opening.

**T04.** Extend existing workbench fixtures and both registered browser specs. Keep text/enabled constant while publishing, removing and switching math/diagram-shaped transformed DOM and remend-shaped ordinary prose; do not import any trial engine.

**T05.** Run the focused browser/unit commands below, record exact results and commit the seam independently. Release these hunks and hand the marker/epoch contract to [MTH04 #2281](https://github.com/skytuhua-org/Gen-V1/issues/2281), [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289) and [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298).

**Done when:** Pass engine-free same-text DOM, synchronous-action and stale-settlement tests in both real browser suites. Publish the exact marker contract, current candidate SHA and remaining platform checks; downstream renderers may reuse this independently. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm build:widgets; pnpm exec vitest run tests/source-selection-v3.test.ts tests/source-selection-dom-v3.test.ts --maxWorkers=1; pnpm typecheck; pnpm build; pnpm exec playwright test --config tests/e2e/workbench.playwright.config.ts; pnpm exec playwright test --config tests/e2e/workbench-app.playwright.config.ts.

Positive: unchanged literal text remains selectable; app UI caption/Copy feedback does not contaminate authored equality; removing a transformation restores canonical equality. Negative: a previously valid candidate cannot dispatch in the same turn before observer delivery after DOM replacement; crossing UI/hidden/clipped/ambiguous text is refused; late catch/finally and success after a newer selection leave the newer UI intact. Repeat enable/unmount/owner replacement 100 times with no observer/listener growth. A pure mapper pass alone is insufficient.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**READY:** Independent source-safety seam; uses synthetic DOM changes and requires no KaTeX, remend or diagram adoption. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/SourceSelectionActions.tsx).
- [Reference 2](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/SourceWorkbench.tsx).
