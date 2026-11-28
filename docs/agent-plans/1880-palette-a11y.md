# Slash-command palette accessibility and keyboard guidance

## META

- Repository: `skytuhua-org/Gen-V1`.
- Plan revision: `2026-11-25-palette-a11y-r2`. This full revision replaces the invalid textarea combobox requirements in rev1 while preserving the original keyboard, popup relationship, cleanup, scope and assistive-technology objectives.
- Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1880. Queue review coordination: https://github.com/skytuhua-org/Gen-V1/issues/2307.
- Original baseline: `main@1cbd02cd78e93771ddca6f0f490c31133919e44a`. Current reviewed baseline: `main@fc1d37a4083c608bb75fcb27b6864a3fd5460bc4`.
- Implementation: PR #1890 at `f6fe477bf6a6d87f3805344192d8f8fbf9e5eab8` merged as `53a18e5f3bd5dac5bdf16144e563fe15f4b0d99c`, which is an ancestor of the reviewed current main. Three focused Chromium cases passed on that implementation. Native screen-reader acceptance remains pending.
- Provenance: original QA pass 22 on the review fixture, the full issue journal, the inline review finding on #1890, the author's correction recorded in comment 7144693039, current source and regression tests, and the W3C specifications listed below. The earlier claim that missing combobox/expanded attributes on a textarea was itself a defect is superseded by the normative host-language rules.

## OBJECTIVE

Keep the multiline message composer a native textbox while exposing its slash-command listbox through valid ARIA relationships. Keyboard users can navigate, select and dismiss the popup without changing the editor's semantics. The visible hint documents every supported key. Native assistive-technology checks must establish what is announced when the popup opens and when the selected option changes; DOM attributes alone do not prove those announcements.

## REQUIREMENTS

1. Scope remains the attribute-wiring effect and hint in `apps/web/src/ComposerCommands.tsx`, its existing regression tests, and these complete plan/status documents. No token, motion, layout, shared overlay or command-dispatch changes are authorized by this plan reconciliation.
2. Retain the native textarea/textbox role. Do not set `role="combobox"` or `aria-expanded` on this textarea in either open or closed states. W3C ARIA in HTML permits only its native textbox semantics; the textbox role does not support expanded state.
3. While the palette is open, set `aria-haspopup="listbox"`, `aria-controls` to the existing popup listbox, `aria-autocomplete="list"`, and `aria-activedescendant` to the selected option when one exists. The popup retains `role="listbox"` and options retain `role="option"` plus their selected/disabled states. Every emitted ID reference must resolve to the matching mounted element.
4. When the palette closes, the effect cleans up `aria-haspopup`, `aria-controls`, `aria-autocomplete` and `aria-activedescendant`. No popup relationship leaks into the closed or never-opened state. Editor focus and multiline input behavior remain intact.
5. The hint text is exactly `↑ ↓ Navigate · Enter/Tab Select · Esc Close`, including both middle-dot separators. It remains `aria-hidden="true"`. Its existing 11px presentation must fit at a 360px viewport; any necessary future font adjustment must use the existing max-width:480px rule and receive normal review. This revision makes no styling change.
6. Preserve arrow navigation, Enter/Tab selection and Escape dismissal, including existing input-composition handling. Escape, blur and selection close paths must not leave stale ARIA references.
7. Native NVDA or VoiceOver verification must check the multiline textbox name, popup relationship, option navigation and close behavior. Do not infer a screen-reader pass from a raw-attribute assertion or substitute a combobox role to force an announcement. If the supported relationships do not convey the required state, record the observed gap and review a narrowly scoped announcement change before implementation.

## REPO_MAP

- `apps/web/src/ComposerCommands.tsx`: the open/selected effect attaches and removes supported textarea attributes; the existing Popover contains the named listbox and selectable options; the hint documents Tab.
- `apps/web/src/composer-commands.css`: existing hint and narrow-layout styling, unchanged.
- `tests/composer-commands-a11y.test.ts`: esbuild plus real Chromium fixture that mounts the production component, checks open/closed/never-opened attributes and the exact hint. Three cases passed during this review.
- Existing palette/token browser tests cover command interaction separately; a passing component harness is not installed desktop or native screen-reader acceptance.
- `scripts/public-source-files.json`: the existing test's missing source entry is addressed separately by PR #2315. This documentation revision must not duplicate or take ownership of that source-manifest change.
- Current full Markdown sources: this file and `docs/agent-plans/review-2026-11-23/issue-1880.md`. The publication journal and canonical body pin the resulting commit.

## DESIGN

The composer remains a native multiline textbox. Its active popup is a separate listbox. The existing React effect owns the four temporary relationships and removes them together during closure or effect cleanup. Selection updates replace the active-descendant ID with the current option, or remove it when none is selected. No new component, storage, native bridge, network request or dependency is introduced.

This decision supersedes rev1's editable-combobox-on-textarea model. That pattern cannot override the host language's textarea role restriction. The author already removed the invalid attributes before merge; the current task reconciles the canonical plan and review description with those verified source changes.

Error/recovery behavior is retained: existing command errors stay in the component's established status/error surfaces, popup dismissal does not dispatch a command, and normal multiline editing remains available after cleanup. Rollback must retain spec-valid textarea semantics; it must not restore the invalid role/expanded requirements.

## EXECUTION_DAG

### T01: Production attribute and hint contract

Inputs: this complete revision, the immutable merged source and the current palette component. One source owner may alter the attribute effect or hint after a fresh claim; the present reconciliation makes no production edit. Inspect the effect and ensure REQUIREMENTS 2-6 hold across open, changing selection, Escape, blur and successful selection. Preserve all command and layout behavior.

Output: a focused, reviewable source change only if an observed mismatch remains; otherwise a verified existing-implementation disposition pinned to the merged commit. Positive checks assert valid popup relationships and the exact hint. Negative checks forbid textarea combobox/expanded attributes and stale references after closure. Done when source and focused tests agree, with remaining native checks explicitly handed to T02. Current state: implemented and merged; source inspection plus the three current browser tests passed.

### T02: Verification, publication and accessibility handoff

Depends on T01's exact source revision. Read the complete issue journal and latest source, run the existing three-case browser harness and relevant type/UI checks, and preserve original failures and corrections in append-only checkpoints. The tests must use the production component and distinguish the native textbox role from a forced role override.

Publish this entire revised plan in the canonical issue body and identical complete Markdown files on a focused reviewed PR. Preserve the immutable original plan/status history, record changed requirements 2-4 and affected tasks T01/T02, and compare the full body and versioned Markdown after readback. Correct #1890's stale description; resolve only the outdated attribute finding after the source and plan agree. This is not a review approval for unrelated work.

Finally run or hand off the native screen-reader and narrow-viewport checks below. Done when every acceptance row has actual evidence; otherwise leave the issue open with exact remaining checks and a released owner. Current state: three Chromium regressions passed; full plan publication is in progress; native screen-reader and narrow-viewport manual acceptance are not newly verified.

## VALIDATION

Use the repository's pinned pnpm version and existing dependencies. Focused command: `pnpm exec vitest run tests/composer-commands-a11y.test.ts --maxWorkers=1`. Existing equivalent execution through the installed Vitest binary passed 3/3 during this review. The component uses the real Chromium harness, not a DOM stub. Earlier original tests that asserted invalid combobox/expanded attributes are historical evidence and do not discharge revision 2.

Run `pnpm typecheck`, `pnpm lint` and the relevant documentation/source checks for any changed candidate. Historical tsc-only receipts remain historical; do not silently replace unrun checks with them. For this documentation-only follow-up, run documentation links and public-source checks. Fresh required GitHub CI, reviewed merge and verification on main are separate states.

| Acceptance | Evidence required | Current result |
|---|---|---|
| Native multiline textbox before opening | No role override or expanded attribute; native editor remains usable | Current focused browser test passed |
| Open popup relationship | Existing listbox/selected-option IDs, haspopup=listbox, autocomplete=list and matching controls/active descendant | Current focused browser test passed |
| Escape cleanup | Popup detaches; all four temporary attributes are absent | Current focused browser test passed |
| Blur and successful selection cleanup | Existing command interaction tests plus production effect inspection; no stale IDs | Source reviewed; additional interaction receipts must retain their exact test scope |
| Keyboard hint | Exact text including Tab and both separators, aria-hidden retained | Current focused browser test passed |
| Narrow layout | Render at360px and inspect the unchanged hint without clipping | Not newly verified in this reconciliation |
| Screen-reader behavior | NVDA or VoiceOver: textbox name, popup/option announcements and close behavior | NOT_RUN; native environment unavailable |
| Publication | Full canonical body, complete versioned Markdown, readback comparison and reviewable PR | In progress until publication receipt |

The original fixture path used `pnpm build` and the review host on port4317. Use current documented fixture setup if that command changes, recording the exact setup rather than inventing a server entry point. The desired accessible behavior must be tested with the production composer as well as the bounded component fixture before final accessibility closure.

## STATE

T01 is implemented and merged at the exact commit above. This review independently confirmed the corrected source and reran the three focused Chromium cases. T02 plan/description reconciliation is in progress. Native screen-reader and manual narrow-viewport acceptance remain open. PR #2315 independently carries the missing source inventory entry. No dependency on a future candidate is treated as merged.

The next reviewer should read this complete plan, the publication checkpoint and the immutable source, then run the remaining acceptance rows. Retain all prior tests, escalation history and the fact that the author corrected the source before the canonical plan was revised. Do not close #1880 solely because #1890 merged.

## REFERENCES AND PRESERVED HISTORY

- [Canonical issue and full journal](https://github.com/skytuhua-org/Gen-V1/issues/1880).
- [Merged implementation PR #1890](https://github.com/skytuhua-org/Gen-V1/pull/1890).
- [Original full rev1 plan](https://github.com/skytuhua-org/Gen-V1/blob/d8ed3cc4a22de3547c08388bca64171b55bf33fc/docs/agent-plans/1880-palette-a11y.md).
- [Complete prior status reconciliation and retained rev1 body](https://github.com/skytuhua-org/Gen-V1/blob/f3e947245e1b67916bc3393b934202d93827da64/docs/agent-plans/review-2026-11-23/issue-1880.md).
- [Author's correction receipt](https://github.com/skytuhua-org/Gen-V1/issues/1880#issuecomment-7144693039).
- [ARIA in HTML: textarea authoring requirements](https://www.w3.org/TR/html-aria/#el-textarea).
- [WAI-ARIA1.2: textbox supported and inherited properties](https://www.w3.org/TR/wai-aria-1.2/#textbox).
- [APG combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), retained as the original reference; it does not override textarea host-language restrictions.
