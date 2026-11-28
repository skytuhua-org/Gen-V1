# ART05: Verify artifact continuity in Windows and assistive technology

## META

| Field | Value |
| --- | --- |
| Task / revision / date | ART05; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/1115 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | verification; BLOCKED |
| Prerequisites | [ART02 #2259](https://github.com/skytuhua-org/Gen-V1/issues/2259), [ART03 #2260](https://github.com/skytuhua-org/Gen-V1/issues/2260), [ART04 #2261](https://github.com/skytuhua-org/Gen-V1/issues/2261) |
| Original source | BLUMA-ARTIFACT-R1 at cd5860c647507b4b28be51f640bfeae9d447d021 |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

Deliver an independent verdict for Tabs/disclosure/record continuity on the real Windows app and assistive technology, reusing valid component recordings and retaining every broader W3 obligation.

## REQUIREMENTS

Own parent R08/A06/A07 and native portions of A02-A05. Inputs: frozen integrated candidate, baseline SHA, component dispositions/tests and original manifests. Missing integration or evidence blocks the affected gate. No product/CSS/schema/action change, merge or closure.

Check real keyboard/AT selection relationships, retained draft/focus/IME during held effects, truthful disclosure source/retry and typed record review/rejection. Test Full/System/Reduced/Off and supported speeds using actual app settings, not only media emulation. Input/Send/Stop and authoritative state remain immediate.

Before/after films: synthetic, fixed SHAs, 1920x1080, 30fps, H.264, no titles/explanatory overlays. External captions identify fixture, input, policy/speed, zoom and outcome; include hashes/retrieval URLs. Narrow/short and actual app zoom 100/125/150% evidence is additional.

Original eight W3 films, integrated 29-film inventory/24 live-provider trials, physical >=60Hz performance and original 200% browser zoom gate remain #1811. Three supplement clips cannot replace them. Browser fixture success is not native/AT, physical DPI or live-provider acceptance.

## REPO_MAP

Consume ART02 tabs-identity, ART03 task-interface and ART04 interaction-tools outputs. Existing tests/e2e/task-design-recording.spec.ts provides W3 scene context, not permission for new routes.

Proposed output is a dated SHA-qualified report/manifest under docs/verification/artifact-continuity/, following current repo evidence policy and source registration. Product files stay read-only. Required platform is Windows x64 native app with NVDA. Record VoiceOver's actual platform/browser separately when exercising the additional AT comparison.

## DESIGN

Report one row per A02-A07: input SHA, environment, exact action, expectation, actual PASS/FAIL/BLOCKED/NOT_RUN, artifact and next owner. Never average platforms or overwrite failures. Return a minimal defect to its component owner without absorbing implementation.

Tabs: pointer A-B-A, arrows/Home/End, identical/restored selection, wrapped labels, resize and held motion; inspect actual node/ARIA continuity and <=1px final alignment. Disclosure: pending ack, real ready, prior answers, error/retry, repeated open, nested IME and owner hide. Records: readonly values, partial numeric/choice/boolean edits, explicit exact review, rejection and newer edits.

Inspect dark/light, 320/390px narrow examples, short windows and actual 100/125/150% app zoom. Record measured viewport/scale, focus rings/forced colors and actual screen-reader announcements, including hidden panels. Capture synthetic data only. No source tokens/user profiles in artifacts. Missing native access leaves HANDOFF_PENDING, never full acceptance.

## EXECUTION_DAG

1. T01: Retrieve/hash component sources, logs and clips. Establish exact frozen candidate/baseline and verify ART01 dispositions/current owner journal.
2. T02: Replay the three sequences in Windows native with keyboard/IME/NVDA; inspect all motion policies and interruptions. Separate synthetic browser rows from native observations.
3. T03: Audit provided clips for SHA, dimensions/fps/codec, no overlays and retrieval. Reuse valid footage; assign missing/stale evidence back to the exact component owner.
4. T04: Publish full matrix/failures/remaining #1811 gates; obtain frontend review/receiver ACK. Record CI/review/merge/main separately and RELEASE with OWNER=NONE.

## VALIDATION

Re-run only suites needed by a concrete frozen-integration risk: pnpm exec playwright test --config tests/e2e/tabs-identity.playwright.config.ts; pnpm exec playwright test --config tests/e2e/task-interface.playwright.config.ts; pnpm exec playwright test --config tests/e2e/clarity-review-parameters.playwright.config.ts. Record Node/pnpm, OS, native/browser/AT versions and SHAs.

V01 native rows show no input/focus loss. V02 films/hashes meet exact contract. V03 negative cases include duplicate/rejected action, stale owner, hidden panel and live downgrade. V04 original eight/29/24/performance/live gates retain canonical owner/status links. V05 report and immutable source match and exact-head review is recorded. No tests/native observations have been executed for this planning packet.

## STATE

PLANNED; BLOCKED until ART02-ART04 deliver reviewed code or VERIFIED_EXISTING evidence. W3 release 7104926319 and unmet cleanup 7122916244 remain authoritative. Verification owns only its finite evidence window and releases on completion, handoff or blocker. First action T01 after input ACK; implementation fixes return to their component leaves.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-artifact-continuity-supplement.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- Inputs [ART02 #2259](https://github.com/skytuhua-org/Gen-V1/issues/2259), [ART03 #2260](https://github.com/skytuhua-org/Gen-V1/issues/2260), [ART04 #2261](https://github.com/skytuhua-org/Gen-V1/issues/2261), matrix [ART01 #2258](https://github.com/skytuhua-org/Gen-V1/issues/2258).
- [W3 release](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7104926319), [unmet acceptance](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7122916244), [reference index owner](https://github.com/skytuhua-org/Gen-V1/issues/2213).
