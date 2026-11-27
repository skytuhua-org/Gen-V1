# Make the existing review recorder omit synthetic cursor overlays

## META

Repository skytuhua-org/Gen-V1. Revision PARALLEL-REF06-R1, 2026-11-25. Parent https://github.com/skytuhua-org/Gen-V1/issues/2213; program https://github.com/skytuhua-org/Gen-V1/issues/2212. Verified baseline main@defe9884530145e9c109b8ed98f80efac8beeb17. Original reference R04-R08/T02/T03 requires existing tools and overlay-free footage. This leaf is READY, future implementation NOT_STARTED and tests NOT_RUN. It owns one recorder option with its actual consumer and focused tests, not a capture framework or component redesign.

## OBJECTIVE

Resolve the capture route by verifying an adequate existing route or adding the bounded option below. Provide a reviewed route to capture the real page at 1920x1080, 30fps and H.264 without injecting a simulated pointer. The current recordWindow helper unconditionally adds review-capture-cursor through both addInitScript and evaluate, so its default recordings cannot meet this program's no-overlay requirement.

## REQUIREMENTS

Accepted outcomes are IMPLEMENTED with the reviewed option below, or VERIFIED_EXISTING with exact source/route/clip evidence covering all required comparisons without modifying the recorder. A public assertion or an unrelated old video is insufficient. If that existing route is proven, skip code edits/tests as NOT_REQUIRED with the precise reason and publish the verified route. R01: When the existing route is inadequate, add an explicit cursor mode to the existing helper while preserving current callers that omit options. R02: The no-cursor path installs no cursor DOM, style, event listener or init script, including after reload/navigation in its fresh capture context. R03: Thread that mode through the existing task-scene recorder CLI and report it outside video pixels. R04: Preserve compositor-only capture, source frame/wall-time sampling, ffmpeg/ffprobe format, fresh-output behavior, theme audit, context/process ownership and all error teardown. R05: Keep component fixtures/recipes with REF02-REF04; no runtime dependency, gallery, app mutation, desktop-wide recording, titles/captions/overlays, interpolation or speedup.

## REPO_MAP

Existing scripts/review-capture.ts exports recordWindow(server,page,filename), returning an idempotent async stop function. Its nested installCursor function currently injects the overlay and mousemove listener. Existing scripts/record-task-design.ts creates a fresh context for each scene, calls recordWindow and emits an external manifest/index. Existing consumers such as scripts/record-review.ts omit a fourth argument and must retain current behavior.

Own only the optional-mode and call-site/manifest/help hunks in those two scripts, a proposed tests/capture-ui/recording-cursor.test.ts, and targeted additions to tests/capture-ui/recording-teardown.test.ts or recording-failure.test.ts when needed. Existing tests use stub CDP/page plus spawned encoder failure and mocked child_process; preserve their meaningful teardown assertions. Register a new test in source only. No capture engine or broad fixture change.

## DESIGN

First inspect existing component recording routes and reusable comparison media. A no-code VERIFIED_EXISTING disposition requires immutable route/source, matching baseline/candidate/fixture and settings, every required state/negative path covered, resolvable exact MP4 hashes and format/decode/no-overlay review. Name which evidence leaves consume it and obtain their ACK. Existing footage may cover the original acceptance without imposing a new recorder patch. Missing coverage keeps the affected route blocked or proceeds to the bounded implementation branch. REF05 accepts either reviewed outcome.

Proposed backward-compatible private API: RecordWindowOptions={cursor?:'synthetic'|'none'} and recordWindow(server,page,filename,options:RecordWindowOptions={}). Default is synthetic, preserving old callers. In none mode, do not call/install the cursor routine. Mode is fixed for the lifetime of a fresh page/context; switching an already instrumented page from synthetic to none is not an advertised capability. Reject an already cursor-instrumented page for none before recording rather than silently filming an overlay; use a new context. Do not remove an application's legitimate native pointer handling.

Add the explicitly proposed --no-cursor boolean flag to record-task-design.ts; it selects cursor:none for that recorder call. Omitted flag preserves its previous behavior. The --list/--dry-run help and generated external README show the new option only after implementation. Include actual cursor mode in the external manifest/probe metadata so consumers can audit the choice. No text is burned into the video. Source scenes, steps, waits and component semantics remain unchanged.

The first frame and all subsequent frames on a fresh none-mode context must have no review-capture-cursor. Passing none must not register a hidden installation that appears on navigation. Keep real input steps, encoder EOF on every stop failure, CDP detach and idempotent stop. Rollback removes the optional flag/argument and new tests without changing prior caller behavior.

REF02/REF03 use the helper through their acknowledged component recording route after this API is reviewed. REF04 can use the task-scene recorder's --no-cursor flag for existing matching scenes. Capture:ui remains screenshot/frame-strip tooling and is never called MP4 evidence. A different proven overlay-free existing recording can be reused without waiting for this leaf.

## EXECUTION_DAG

1. T01: Refresh parent/current capture owners; reserve the exact helper, CLI/help/manifest and test hunks. Read all recordWindow callers with rg and record current signatures. Check the existing-route disposition above first. If sufficient, publish its proof through T04/T05 without code; otherwise reproduce the overlay in one bounded synthetic scene before editing. No product or fixture claim.
2. T02: Add optional cursor mode and the actual task-scene consumer flag/metadata. Preserve default behavior and fresh-context precondition. Add focused assertions for default installation, none-mode zero installation and rejection of an already instrumented none-mode page.
3. T03: Run existing teardown and missing-encoder regressions in both modes where applicable. Assert stopScreencast, detach and encoder EOF still happen when the browser or encoder fails; stop remains idempotent. New tests must observe calls/DOM behavior, not grep source strings.
4. T04: For VERIFIED_EXISTING, retrieve and verify all route/source/clip proof above, recording implementation tests NOT_REQUIRED. For the implementation branch, on a fresh real Chromium context record one existing small scene in none mode, exercise reload/navigation and inspect the start, movement and later frames. Verify no overlay element/listener appears, requested scene state still occurs, and ffprobe/full decode reports the required format. Record external hashes and exact command at the candidate SHA.
5. T05: Publish either the reviewed VERIFIED_EXISTING route disposition or the implemented helper/CLI contract and evidence to REF02-REF04, register only the new test source entry, then RELEASE. This does not prove any component's visual acceptance or native UI quality.

## VALIDATION

Run pnpm exec vitest run tests/capture-ui/recording-cursor.test.ts tests/capture-ui/recording-teardown.test.ts tests/capture-ui/recording-failure.test.ts tests/capture-ui/browser-cleanup.test.ts --maxWorkers=1 and pnpm typecheck. After the new flag exists, list actual scenes with pnpm exec tsx scripts/record-task-design.ts --list, then run one selected existing scene with --output <fresh-test-results-directory> --scenes <verified-id> --no-cursor. ffmpeg and ffprobe must be available; unavailable tools are BLOCKED, not a skip converted to PASS.

A01 (R01/T01-T02): all existing callers compile unchanged and default synthetic mode remains as before. A02 (R02/T02-T04): none produces no injected cursor before first frame or after movement/reload, and never promises mixed modes on one instrumented page. A03 (R03/T02-T04): CLI flag reaches the actual helper, external manifest records its actual mode, no video titles/captions. A04 (R04/T03-T04): failure cleanup and idempotency pass; 1920x1080,30/1,H.264; ffmpeg -v error -xerror -i <actual-file> -f null - succeeds; normal-speed visual review passes. A05 (R05/T05): source-only test registration and bounded scripts diff, immutable output/contract handoff.

For VERIFIED_EXISTING, acceptance is the complete route/source/state/format/hash/no-overlay proof and consumer ACK above; implementation-specific tests are NOT_REQUIRED, never reported as passed. All checks are planned. Fixtures do not establish packaged Windows, source privacy or product behavior beyond what was actually observed. Do not upload private profiles or raw traces.

## STATE

READY for this bounded recorder change after current-hunk ownership check. No code or test run by this plan publisher. The known overlay failure is established by inspected source, not a claimed new live reproduction. First action T01. Record milestones and at most20-minute active checkpoints on #2213, cross-parent handoff on #2212, and final RELEASE OWNER=NONE. No assignee or implementation claim is created by this document.

## REFERENCES

- Original complete plan: https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-reference-and-evidence.md
- Recorder source: https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/scripts/review-capture.ts
- Actual consumer: https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/scripts/record-task-design.ts
- Teardown test: https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/tests/capture-ui/recording-teardown.test.ts
- Consumers: [REF02 #2235](https://github.com/skytuhua-org/Gen-V1/issues/2235), [REF03 #2236](https://github.com/skytuhua-org/Gen-V1/issues/2236), [REF04 #2237](https://github.com/skytuhua-org/Gen-V1/issues/2237); independent acceptance [REF05 #2238](https://github.com/skytuhua-org/Gen-V1/issues/2238).
