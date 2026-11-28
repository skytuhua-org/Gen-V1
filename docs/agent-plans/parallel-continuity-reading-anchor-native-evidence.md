# ANC06: Verify transcript reading and history focus on Windows

## META

| Field | Value |
| --- | --- |
| Task / revision / date | ANC06; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/2218 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | verification; BLOCKED |
| Prerequisites | [ANC04 #2265](https://github.com/skytuhua-org/Gen-V1/issues/2265), [ANC05 #2266](https://github.com/skytuhua-org/Gen-V1/issues/2266) |
| Original source | FRONTEND-ANCHOR-R1 at 0ccda0526baafe343bff33b72c7f103e600cc51e |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

Verify preserved reading position, physical input priority and guarded final-history focus on the actual Windows app. Provide an independent evidence matrix for transcript growth and renderer-driven reflow.

## REQUIREMENTS

Own parent A01-A10 native/visual gates and R10. Inputs: exact accepted ANC04/ANC05 candidate, baseline, pure/controller/browser results and source/fixture manifests. No product/controller/App/source renderer edits. Missing native access or integrated candidate leaves precise BLOCKED/NOT_RUN rows.

Automatic correction must be immediate under Full/System/Reduced/Off, <=1 CSS px at the reading anchor, and subordinate to wheel/touch/keyboard/native scrollbar/custom rail intent. Real physical/native interactions must be exercised; synthetic DOM events do not establish native scrollbar or physical DPI correctness.

Verify truthful source/selection/draft/Find/history/error behavior and final-page keyboard/AT focus without stealing from a departed user. Existing authorized tail or prompt-navigation motion remains separate. No substitute animated compensation.

Primary before/after clips are synthetic actual-App at fixed SHAs, 1920x1080/30fps/H.264, no embedded titles/explanatory overlays. External captions and hash manifest identify fixture, input, motion, zoom and outcome. Narrow/short windows and actual app zoom100/125/150% are additional. Browser200% zoom and physical display DPI are distinct evidence, never interchangeable.

## REPO_MAP

Inputs from conversation-reading-anchor tests, conversation-scroll tests, actual conversation-find.spec.ts, shell/scoped-conversation suites and component films. Existing actual main scrollport/retained-owner/history fixtures are used; no invented duplicate app.

Proposed report path docs/verification/transcript-reading-anchor/ uses dated SHA-qualified names after checking repo evidence conventions and source registration. Required platform is Windows x64 native app, real scrollbar/rail, keyboard/IME and NVDA; note any separate VoiceOver/platform/browser observation explicitly.

## DESIGN

Matrix columns: A-ID, exact candidate/baseline, OS/build/browser/AT/device/DPI/app zoom, action, expected result, observed PASS/FAIL/BLOCKED/NOT_RUN, evidence and next owner. Record source/test results as reported vs independently rerun.

Sequence a reader detached above tail: grow/shrink earlier message, delayed real Image load, width reflow and equal-total-height swap; confirm anchor offset, next/previous fallback and no drift at clamp. Append below must produce no automatic write. Switch away/back after accepted correction and confirm corrected map restore with no latest/announcement side effect.

Race queued measurement with real wheel/touch/scroll keys, native scrollbar and custom rail drag, foreign pointer release, Find and actually integrated prompt/bookmark navigation, Jump, owner hide and prepend. Validate single prepend correction and disposed callback cleanup. Observe native/window focus transfer.

Use125-message final-page case: keyboard/AT activation, nonfinal page, error, held result followed by composer/Find/other-window departure. Confirm one focus handoff only when control owned focus precommit. Verify no added row tab stops, lost selection/draft or altered Find query/index.

A renderer-induced layout defect belongs to ANC04 for App/controller behavior; renderer leaves still own source presentation. Return minimal evidence to the exact owner, without broader adoption dependency or scope takeover.

## EXECUTION_DAG

1. T01: Retrieve/hash ANC04/ANC05 code, logs and films. Verify one exact integrated candidate, baseline and current ownership; record missing prerequisites.
2. T02: Replay geometry/owner/navigation cases with actual native input and all app motion policies. Measure anchor offset and actual DPI/zoom environment, not screenshots alone.
3. T03: Exercise final-history keyboard/IME/AT cases and departure races. Audit recordings/metadata and reuse valid supplied films.
4. T04: Publish full matrix, minimal failures and exact remaining gates; obtain frontend review/ACK and RELEASE. Fixes go back to ANC03/ANC04/ANC05, not this verifier.

## VALIDATION

When integration changes relevant behavior, reproduce pnpm exec vitest run tests/conversation-scroll.test.ts tests/conversation-find.test.ts --maxWorkers=1; pnpm exec playwright test --config tests/e2e/conversation-scroll.playwright.config.ts; pnpm exec playwright test --config tests/e2e/conversation-find.playwright.config.ts; pnpm exec playwright test --config tests/e2e/scoped-conversation.playwright.config.ts. Preserve config channels, including msedge; log absent environments.

V01-A01 geometry <=1px, A05 ordered fallback/clamp. V02-A02/A04 newer navigation/native intent wins. V03-A03 hidden/stale owner no work. V04-A06 final focus guarded. V05-A07 immediate policy, A08 bounded callbacks/reads. V06-A09 source/selection/drafts/history/Find unchanged. V07-A10 exact versions, valid no-overlay films, review and durable readback. Automated counts never stand in for native/AT observations. All tests are NOT_RUN in this plan.

## STATE

PLANNED; BLOCKED on ANC04/ANC05 handoffs and native access. Verification can report an honest platform blocker but cannot mark the feature accepted while it remains. First action T01; finite evidence ownership ends at report/handoff. Merge/main verification and physical/native gates remain separate from browser passes.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/0ccda0526baafe343bff33b72c7f103e600cc51e/docs/agent-plans/frontend-transcript-reading-anchor.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- Inputs [ANC04 #2265](https://github.com/skytuhua-org/Gen-V1/issues/2265), [ANC05 #2266](https://github.com/skytuhua-org/Gen-V1/issues/2266), controller [ANC03 #2264](https://github.com/skytuhua-org/Gen-V1/issues/2264), geometry [ANC02 #2263](https://github.com/skytuhua-org/Gen-V1/issues/2263).
- [Parent](https://github.com/skytuhua-org/Gen-V1/issues/2218), [existing scroll ownership](https://github.com/skytuhua-org/Gen-V1/issues/1188), [reference evidence index](https://github.com/skytuhua-org/Gen-V1/issues/2213).
