# ART02: Complete Tabs identity, ARIA pairs and pointer indicator

## META

| Field | Value |
| --- | --- |
| Task / revision / date | ART02; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/1115 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | implementation; BLOCKED |
| Prerequisites | [ART01 #2258](https://github.com/skytuhua-org/Gen-V1/issues/2258) |
| Original source | BLUMA-ARTIFACT-R1 at cd5860c647507b4b28be51f640bfeae9d447d021 |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

Preserve the real editor and focus ownership across tab changes while a restrained indicator shows genuine pointer selection. Success is exact A-B-A control identity, valid tab/panel relationships and <=1 CSS px settled alignment with immediate selection.

## REQUIREMENTS

Implement only ART01's evidenced gaps. Parent R02/R03/R06/R07 and A02/A03 apply. Keep persisted selected label, full visible text and fixed 14px status slot. The indicator is quiet neutral, under the selected label region and at most2px thick; reuse a suitable existing indicator rather than adding a second. No icon-only labels, text scaling, bounce, per-letter accessible names, staged panels or entry stagger.

A genuine pointer change in one unwrapped row may use the existing 140ms base token/easing, consumed once. Keyboard/AT, identical selection, restore, resize and wrapped rows snap. Off is immediate; Reduced has no geometry/stagger and at most 80ms opacity. Selection/interactivity update immediately while an animation is held.

Retain visited DOM, values, focus where applicable, nested disclosure state, scroll and action ownership. Hidden panels are inaccessible to focus/AT. Preserve ArrowLeft/Right wrap, Home/End and one selected tab stop. Stable unique tab/panel IDs connect aria-controls/aria-labelledby. Duplicate saved labels show the existing alert without writing state.

No Form/Button/ChoiceList, schema, dependency, network, route, storage or general motion-helper change. ACT02/ACT04 under #2141 own validation/action controls; #2214 owns duration resolution. Original W3 outcomes stay intact.

## REPO_MAP

registry.tsx local Tabs already retains visited wrappers and rejects duplicate labels. At baseline IDs are missing and arrow focus uses parent.children[index], which a new decorative child can break. Reserve only Tabs and required imports.

task-interface.css reservation: .surface-tabs/.task-tab-panel selectors. Tests: tests/e2e/tabs-identity.spec.ts with existing tabs-identity.playwright.config.ts. No new route. Coordinate imports briefly with ACT04; ART03 owns Disclosure and TIP04 owns a separate Artifact toolbar attribute.

## DESIGN

Use one useId prefix per Tabs instance and deterministic index suffixes, never unsanitized labels. Preserve stable panel keys and existing semantic hidden behavior. Verify hidden descendants cannot be focused while DOM identity remains.

The indicator is aria-hidden/pointer-inert, outside indexed tab buttons or accompanied by exact role=tab lookup. Keep a native selected border before measurement and with motion disabled. Read selected/track rectangles on selection or actual resize/font/layout change, not every frame. Detect actual wrapped rects and snap. Retarget an interrupted pointer effect from its painted pose; clean observers/listeners/animation on unmount, owner hide and policy downgrade.

Reuse candidate pointer-cause tracking. If absent, distinguish real pointer activation from detail=0 keyboard/AT without creating a shared framework. Same selection is not a new effect. Animation completion and resize never write selection. Held motion cannot delay typing, IME or newer keyboard selection. Rollback reverts only this Tabs diff.

## EXECUTION_DAG

1. T01: Read ART01's candidate/matrix and current registry claims. Reserve Tabs/import/style/test hunks and reproduce assigned failures. Return VERIFIED_EXISTING with checks if no gap remains.
2. T02: Add only missing IDs/ARIA/indicator behavior and scoped CSS. Keep state synchronous, hidden content inaccessible and cleanup explicit.
3. T03: Extend tabs-identity tests for A-B-A exact nodes/draft/scroll/nested state, two instances, duplicate labels/no writes, wrapped labels, arrow/Home/End and pointer interruption.
4. T04: Run checks and inspect actual Artifact policies/speeds. Publish exact reviewed code/test/film SHAs; hand off ART05 and release shared hunks.

## VALIDATION

Run pnpm build:widgets; pnpm exec playwright test --config tests/e2e/tabs-identity.playwright.config.ts; pnpm typecheck; pnpm build. Expand to task-interface only for a concrete shared regression. All commands are planned, not run here.

V01 140ms pointer base/one policy consumption and <=1px settled alignment; keyboard/same/restore/resize/wrap immediate. V02 correct unique ARIA/roving focus and hidden exclusion after indicator insertion. V03 exact retained nodes/values and duplicate-label no-write failure. V04 held motion plus typing/IME/new choice remains responsive; live Reduced/Off leaves no geometry animation. V05 dark/light, long text, narrow/short and actual app zoom 100/125/150% preserve labels/focus.

Synthetic before/after films: fixed SHAs, 1920x1080, 30fps, H.264, no embedded titles/overlays; external caption/hash manifest. ART05 owns native/AT evidence, not discharged by browser success.

## STATE

PLANNED; BLOCKED on ART01 and current hunk allocation. No product implementation or tests claimed. Keep VERIFIED_EXISTING regressions without recreating code. Done requires focused review/checks/durable handoff; merged/main/native acceptance remain separate. Next step T01 after predecessor ACK.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-artifact-continuity-supplement.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- Predecessor [ART01 #2258](https://github.com/skytuhua-org/Gen-V1/issues/2258), verifier [ART05 #2262](https://github.com/skytuhua-org/Gen-V1/issues/2262).
- [Actions](https://github.com/skytuhua-org/Gen-V1/issues/2141), [schemas](https://github.com/skytuhua-org/Gen-V1/issues/1970), [duration](https://github.com/skytuhua-org/Gen-V1/issues/2214), [W3 acceptance](https://github.com/skytuhua-org/Gen-V1/issues/1811).
