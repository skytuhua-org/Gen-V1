# INB06: Verify Inbox current state and focus continuation with native input

## META

| Field | Value |
| --- | --- |
| Task / revision / date | INB06; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/2155 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | verification; BLOCKED |
| Prerequisites | [INB02 #2272](https://github.com/skytuhua-org/Gen-V1/issues/2272), [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275) |
| Original source | FRONTEND-INBOX-FOCUS-R1 at 0ccda0526baafe343bff33b72c7f103e600cc51e |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

Verify Inbox current-state announcements and focus continuation with actual Windows keyboard/NVDA and the required VoiceOver comparison, keeping native evidence distinct from deterministic browser fixtures.

## REQUIREMENTS

Own IF-R09 and native/visual portions of A01-A09. Inputs: reviewed integrated INB02/INB04/INB05 candidate, baseline, resolver/browser tests, source provenance and film manifests. No Inbox/source/transport/policy edits, merge or closure. Missing exact candidate or platform produces explicit BLOCKED/NOT_RUN, not assumed success.

Current row is announced as current without page; noncurrent has no token. Accepted Back/Escape clears selection, removes reader, expands list and focuses same/fallback real control in both modes. Next explicit j continues from focused row. Search/menu/editable/IME/defaultPrevented ownership remains.

Automatic recovery changes focus only after owned-source loss; it never chooses, marks read/unread, opens canonical thread or changes filter/query. New intent, window/document departure, owner hide/unmount and held completion must not steal focus. #1712 selected/reader behavior is accepted externally, not inferred by this verifier.

Primary films: synthetic fixed-SHA1920x1080/30fps/H.264 without embedded titles/explanatory overlays; captions/hashes outside video identify fixture,input,motion,zoom,results. Additional dark/light,320/390px,short window, measured container860/892 hysteresis and actual app zoom100/125/150% checks retain clear focus/no clipping. Reduced/Off adds no new motion. Browser zoom is not physical DPI/native proof.

## REPO_MAP

Consume inbox-focus unit results, inbox-presentation/provenance checks and inbox-controls actual-component fixture. Tests/e2e/inbox-controls.playwright.config.ts serves127.0.0.1:5802 with Chromium default, one worker/no reuse; fixture is host-free with command/pageerror ledger.

Proposed dated SHA-qualified report/manifest lives under docs/verification/inbox-focus-continuation/ after current repo evidence-policy/source-registration check. Windows x64 native app+NVDA is mandatory; VoiceOver runs on its actual supported platform/browser, recorded separately. No emulated browser speech substitutes for either observation.

## DESIGN

Report one A01-A09 row with candidate/baseline, OS/build/browser/AT versions, actual container width/app zoom/DPI, precise action, expected/observed PASS/FAIL/BLOCKED/NOT_RUN, artifact and next owner. Keep reported component tests separate from independent replay.

Native sequence: current/noncurrent row announcement, wide/narrow selection then Escape, Back, next j, search Escape, open filter listbox, IME input and untouched outer Escape when no chosen. Confirm native focus ring and no extra live announcement.

Remove focused first/middle/last/only row and return from a reader whose prior row is missing. Verify exact next/previous/first/Search/Refresh destination; if canonical narrow reader remains, do not force list merely for the test. Check selected reader unchanged where accepted policy says so. Observe actual owned source removal vs a still-visible source or focus in search/filter/other pane.

Exercise499/500ms/dedup/unread ordering via deterministic tests, then native held success/rejection while moving focus, rapid choose/Back, blur, hide and unmount. Record zero recovery-induced host calls. Inspect local nearest scrolling without document movement.

Compare final local vendored hashes, retained upstream pin/ranges/LICENSE/NOTICE. Do not publish user records/profiles/tokens; all scenes are synthetic. Valid owner films are reused, missing clips return to component owner.

## EXECUTION_DAG

1. T01: Retrieve/hash exact integrated candidate, baseline, source metadata, tests and clips. Record canonical #1712 disposition and any acceptance row still blocked.
2. T02: Run real Windows keyboard/IME/NVDA sequences for token/dismissal/recovery; record actual native geometry and focus results. Run VoiceOver separately with exact platform/build.
3. T03: Inspect themes/motion/width/zoom and film format/hashes; retain every failure and distinguish synthetic timing from native behavior.
4. T04: Publish full A01-A09 matrix, minimal repros and next owners, obtain frontend review/receiver ACK and RELEASE. Product fixes return to their specific leaf.

## VALIDATION

When a concrete integration change warrants replay: pnpm exec vitest run tests/inbox-focus.test.ts tests/inbox-presentation.test.ts --maxWorkers=1; pnpm exec playwright test --config tests/e2e/inbox-controls.playwright.config.ts. Preserve its network guard, no page errors and current selected-policy expectations. Measure .agent-inbox at859/860 before entering narrow and880/892 after, both directions; viewport width alone is insufficient.

V01 A01 ownership/baseline/policy provenance explicit. V02 A02 NVDA/VoiceOver current without page. V03 A03 same-row return/full list/next j and unchanged key ownership. V04 A04 deterministic real eligible fallback. V05 A05 no selection/action/read side effect and truthful rejection. V06 A06 current-intent-only focus, no stale departure theft. V07 A07 visible unclipped focus/policies/container/zoom. V08 A08 format/hash/source provenance evidence. V09 A09 exact-head review/full readback/ACK and separate native/main status. All checks NOT_RUN in this plan.

## STATE

PLANNED; BLOCKED on INB02/INB05 integration and native/AT access. INB05 depends on INB03/INB04, so their reviewed behavior is required too. No implementation/native result. First action T01. Any unresolved #1712 row or unavailable VoiceOver/Windows check stays HANDOFF_PENDING with a named next owner; verification claim ends at report/handoff.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/0ccda0526baafe343bff33b72c7f103e600cc51e/docs/agent-plans/frontend-inbox-focus-continuation.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- Inputs [INB02 #2272](https://github.com/skytuhua-org/Gen-V1/issues/2272), [INB05 #2275](https://github.com/skytuhua-org/Gen-V1/issues/2275), dismissal [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274), resolver [INB03 #2273](https://github.com/skytuhua-org/Gen-V1/issues/2273).
- [Parent](https://github.com/skytuhua-org/Gen-V1/issues/2155), [policy cleanup](https://github.com/skytuhua-org/Gen-V1/issues/1712#issuecomment-7122835450), [reference evidence index](https://github.com/skytuhua-org/Gen-V1/issues/2213).
