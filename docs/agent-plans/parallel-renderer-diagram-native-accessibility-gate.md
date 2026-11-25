# DIA08: Verify packaged flowchart accessibility and adoption gates

## META

`skytuhua-org/Gen-V1`; parent [#2230](https://github.com/skytuhua-org/Gen-V1/issues/2230) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/DIA08`, 2026-11-25. Kind: verification. Start: **BLOCKED**. Dependencies: [DIA07 #2299](https://github.com/skytuhua-org/Gen-V1/issues/2299).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-DIAGRAM-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-diagram-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Resolve packaged Worker/local-font/real-screen-reader acceptance for one frozen candidate and publish ADOPT or NO_ADOPT with complete evidence. A blocked/rejected trial preserves exact source and is a valid research outcome.

## REQUIREMENTS

Use supported packaged Windows, named OS/hardware/build/screen reader and the exact DIA07 candidate. No actual native/AT evidence may be inferred from browser fixtures, screenshots or DOM attributes. No live provider/tool calls or personal data in the synthetic corpus. Production remains off unless every original mandatory gate passes; normal PR/merge/closure authority is unchanged.

Coverage: Diagram T06 native/AT and T07 disposition; R06/R07/R08/R10/R11/R12; A07/A09/A10/A11/A12/A13 and complete A01-A13 disposition. Inherited requirements remain binding.

## REPO_MAP

DIA01 fixes actual Worker/CSP/packaging paths and removed-trigger focus fallback; DIA03 proves browser Worker cancellation and exact dependency closure; DIA07 supplies frozen corpus/cost/usefulness results. Existing Gen Modal, local Inter fonts and motion policy remain authoritative. ANC04/ANC06 supply actual/native transcript anchor evidence. This task only writes the evidence/disposition report.

Proposed outputs: `docs/review-evidence/parallel-renderers/diagram-windows.md`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Packaged matrix: cold Worker startup/import and repeated offline reopen; local Inter/system font availability; no diagram-derived network including encoded styles/fonts; real busy-Worker termination/input progress; multiple owners, hidden retained pane, native window switch and late reply after disposal; exact CRLF/trailing-newline Copy code and persistent Source preference. Failure keeps source and never relaxes CSP or switches to UI-thread layout.

Manual keyboard/AT matrix: named Flowchart figure, counts and ordered connection list; decorative SVG not read twice; persistent source/copy/Expand; Modal pan arrows32/Shift128, zoom factor1.25 within0.5..4 and legibility floor12px, Home reset, close; editable/Ctrl/Meta zoom and IME Escape unaffected; removed Expand trigger returns only to DIA01's verified surviving owner control. Verify no async focus/selection theft. Test light/dark/high contrast,320/390px,200/400% zoom and Full/Reduced/Off; label>=12px, text contrast>=4.5:1, graphics/control contrast>=3:1. Native zoom/DPI mechanism is recorded explicitly.

Pair1920x1080 source/preview clips with no inserted overlay/title, external captions pinning candidate/baseline/fixtures/settings. Separate narrow/zoom/offline/real-screen-reader evidence is mandatory. Verify detached-anchor<=2px and native owner return with accepted ANC04/ANC06; no renderer scroll writer.

Consolidate all A01-A13. ADOPT requires complete fidelity/usefulness/safety/accessibility/cost/license/build/ownership evidence, including all3 and>=16/20 unchanged corpus. Otherwise publish NO_ADOPT or explicit pending blocker, keep production gate off and have DIA03's owner remove unused trial dependency/cache/Worker via focused revert when appropriate. Preserve neighboring math/streaming/highlighting/Files/anchor work. No data migration. Broader Mermaid12.3.0 is a separate amended decision, not a fallback.

Early stop path: a documented NO_ADOPT from DIA01-DIA07 allows decision-only publication now. Unreached product/platform tests remain NOT_RUN; do not wait on nonexistent implementation or invent passing evidence.

## EXECUTION_DAG

**T01.** Verify DIA07 exact candidate and all parent/owner/package records; build using DIA01's verified packaging command on the supported Windows host.

**T02.** Run packaged/offline/network/Worker/owner lifecycle matrix with the unchanged corpus. Record failures and local asset resolution separately from source fallback readability.

**T03.** Perform actual keyboard/screen-reader/Modal/focus/contrast/zoom/motion checks and native anchor cases; capture redacted paired evidence with exact environment.

**T04.** Consolidate every original A01-A13 or early NO_ADOPT row, recheck current advisory/license/notice/distribution closure and list exact remaining blockers/owners.

**T05.** Authorized coordinator publishes full decision/source/body readback, focused implementation or decision-only PR, actual CI/review/merge/main state and rollback. Record receiver ACK and RELEASE; never imply merge/closure permission from passing checks.

**Done when:** Durable complete adoption/NO_ADOPT disposition and real platform/AT evidence or exact blocker, with current head/review/merge distinctions, rollback, recipient and released ownership. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Use exact DIA01 packaging commands and DIA03 real Worker cases, rerun any affected suite only after a material candidate change. Actual Windows offline and supported screen-reader observations are independent mandatory gates. Final report must include13 original acceptance rows, concrete source/preview task benefit, corpus identities,10cold/30warm evidence links, package/notice hashes and named platform failures/skips. Early rejection is complete research only; it is not product adoption.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Needs browser-qualified frozen candidate and supported Windows/offline/assistive evidence. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/issues/2218).
- [Reference 2](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/mermaidAPI.ts).
- [Reference 3](https://github.com/kieler/elkjs/blob/37e798513db6e88b2e205b8239ed4e387d5f24d0/LICENSE.md).
