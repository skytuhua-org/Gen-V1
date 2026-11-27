# DIA05: Build the accessible source and flowchart preview leaf

## META

`skytuhua-org/Gen-V1`; parent [#2230](https://github.com/skytuhua-org/Gen-V1/issues/2230) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/DIA05`, 2026-11-25. Kind: implementation. Start: **BLOCKED**. Dependencies: [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295), [DIA04 #2296](https://github.com/skytuhua-org/Gen-V1/issues/2296).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-DIAGRAM-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-diagram-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Build a source-first Gen flowchart figure and Modal that exposes exact source, meaningful connections and equivalent keyboard controls without focus theft or decorative motion.

## REQUIREMENTS

Own DiagramPreview.tsx, scoped diagram-preview.css and its focused browser spec. Reuse existing CopyButton and Modal, not assistant-ui's custom trap/skeleton/trimmed source/unchecked SVG. No model-provided explanation, export, editor, auto camera, per-token layout, wheel hijack, whole-text fit scaling, retry loop or scroll compensation.

Coverage: Diagram T04 presentation; R03/R04/R07/R08; A04/A05/A08/A09. Inherited requirements remain binding.

## REPO_MAP

Existing Modal takes open,title,onClose,children,className? and owns dialog focus/IME/Escape behavior. DIA01 records the verified removed-trigger focus fallback. DIA03 supplies cancel/dispose and matched replies; DIA04 supplies a detached validated SVG. The source/preview leaf is independent of Markdown/caller integration and can be tested in a dedicated Vite fixture. Proposed isolated entry /tests/e2e/diagram-preview.html imports diagram-preview-fixture.tsx using the existing generated-selects.html Vite React preamble pattern.

Existing narrow hunks: `tests/e2e/micro-motion.playwright.config.ts`, `scripts/browser-suites.ts`.

Proposed outputs: `apps/web/src/DiagramPreview.tsx`, `apps/web/src/diagram-preview.css`, `tests/e2e/diagram-preview.spec.ts`, `tests/e2e/diagram-preview-fixture.tsx`, `tests/e2e/diagram-preview.html`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Freeze DiagramPreview inputs: input:DiagramInput,certificate:FlowCertificate,renderSource:string,ownerActive:boolean,returnFocus:()=>HTMLElement|null. The latter resolves only DIA01's verified surviving control; never a new owner by guess. Mount with exact source; request work only when eligible and active. Cancel on changed scope/generation/source, hidden/inert/unmounted owner or explicit disposal. Match current identity again before connecting validated output. Keep source-mode preference for the exact source revision so a late completion cannot override it; new source resets preview eligibility and clears old SVG immediately.

States are source/incomplete, eligible/waiting, preview and source/unavailable. Waiting keeps readable/copyable source with a quiet status. Unsupported text is Preview unavailable for this syntax; other failure is Preview unavailable. Source is shown. No raw exception or source telemetry. Exact Copy code uses input.source including CRLF/trailing newline, never SVG/trimmed/summary output. Persistent Show source/Show preview, Copy code and Expand remain reachable.

Use a figure named Flowchart with certificate-derived node/connection counts and ordered connection list, no color-only meaning. Hide decorative duplicate SVG from assistive output. The wrapper uses data-markdown-diagram; accepted preview uses data-source-transformed=true. Controls, summary and duplicate raw disclosure use data-source-selection-ui. Source-mode authored text remains exact; SRC01 will handle invalidation when integrated.

Expand clones only validated SVG through a new instance prefix and reuses Gen Modal. Visible pan/zoom/reset controls match focused-viewport keys: arrows32px, Shift+arrows128px, +/- factor1.25, Home reset, allowed scale0.5..4. Do not consume editable/Ctrl/Meta browser zoom keys; Escape/IME stays Modal-owned. Wheel remains normal scroll. Optional pointer drag is excluded from this first leaf, avoiding an unneeded interaction choice.

Require>=12px effective labels, text contrast>=4.5:1 and meaningful graphics/controls>=3:1. Disable any zoom/fit step that would drop the smallest label below12px; use contained readable overflow/Expand instead. No nested vertical scroller. Static publication/pan/zoom in Full/Reduced/Off; Modal keeps its current policy. Async completion never focuses; missing-trigger fallback runs only when the original Modal restoration target is gone and DIA01's current-owner check still holds.

## EXECUTION_DAG

**T01.** Consume exact Worker/validator/focus contracts and add an isolated diagram-preview fixture using certified inputs and real validated outputs. Claim only leaf/CSS/focused test paths.

**T02.** Implement source/waiting/preview/failure with exact copy, current-owner matching/cancellation and source preference that survives late replies.

**T03.** Implement accessible counts/connections, markers and persistent controls. Build Modal instances with unique validator prefixes and verified removed-trigger restoration.

**T04.** Add keyboard pan/zoom/reset and readability/contrast/overflow rules with all motion modes. Do not add optional drag, wheel capture or auto fit that violates12px labels.

**T05.** Run focused lifecycle, multiple-instance/modal, source preference, keyboard/focus/IME and theme/narrow/zoom tests. Hand the exact leaf props to [DIA06 #2298](https://github.com/skytuhua-org/Gen-V1/issues/2298) and release the files.

**Done when:** The isolated real leaf and Modal pass owned-source/lifecycle/keyboard/readability checks with validated output only. Actual caller, reading-anchor and platform acceptance remain separate. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm typecheck; pnpm build; register/run diagram-preview.spec.ts in the existing micro-motion config. Test two inline diagrams plus modal disjoint IDs; all controls by keyboard; arrows/Shift/+/-/Home; browser zoom; Escape during composition; removed Expand trigger; late completion after Source choice/owner replacement; unreadable-fit graph;320/390px and200/400% zoom; Full/Reduced/Off/light/dark/high contrast. Exact copy includes CRLF/trailing newline. DOM accessible-name checks do not replace DIA08's real screen reader.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Needs matched bounded Worker replies and a trusted detached SVG validator. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/packages/ui-shell/Modal.tsx).
- [Reference 2](https://github.com/assistant-ui/assistant-ui/blob/4797ce5da22845dfa0c0d2cbd115f8e6fe42d2a2/packages/ui/src/components/react/assistant-ui/elements/mermaid-diagram.tsx).
