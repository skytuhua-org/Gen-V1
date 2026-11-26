# Worker 4. Exploration and workflows

**Execution prompt, revision `GUI-ACCEPT-2026-11-22-r2`, November 22, 2026 Pacific.** You own UI 16, 17, 18, 19, 20, 21, 28. Use this file independently. The numbered objects keep the IDs of the original videos. [Canonical parent #1811](https://github.com/skytuhua-org/Gen-V1/issues/1811) · [Worker 4 history #1125](https://github.com/skytuhua-org/Gen-V1/issues/1125)

## Start here

Read the current `AGENTS.md` on `main`, this entire file, the parent journal and your lane's latest checkpoint. Confirm the current refs and record your own scope claim and ACK on #1811. Keep your lane issue linked. An outstanding implementation claim belongs to its current owner until release or reassignment. The publisher's claim covers documentation only. [Agent instructions at the audited base](https://github.com/skytuhua-org/Gen-V1/blob/36fcc56d24cef7558059264a8540d7f0592d93cd/AGENTS.md) · [Contribution rules](https://github.com/skytuhua-org/Gen-V1/blob/36fcc56d24cef7558059264a8540d7f0592d93cd/CONTRIBUTING.md) · [Environment setup](https://github.com/skytuhua-org/Gen-V1/blob/36fcc56d24cef7558059264a8540d7f0592d93cd/docs/getting-started.md)

The first part of this file is the acceptance revision. The final specification preserves the original detailed design, fixture inputs, commands, recorders and acceptance tests. Its old checkout command, original PR order, reported results and past assignments are historical. Start from current main or the existing owner's authorized branch as specified in the acceptance revision. Use its task-specific design and exact evidence recipes. Use the later lane design revision where explicitly applicable. A current matching fix calls for verification. Repair just the reproducible gap in your owned scope.

**Input and output.** Read the published changes before modifying any renderer. Run on Node ≥24.10.0 with pnpm 10.30.3, locked install, bundled Chromium and the branded browser requested by each Playwright config. Run `pnpm build:widgets` before unit checks and `pnpm build` before the built-app browser pass. Use the supported Windows x64 host for desktop-specific acceptance. Record OS, browser/channel, scale, runtime and full Git SHA. Deliver the assigned numbered MP4s, the machine-readable manifest, chapter frames, reviewer findings and exact check results. Set up once per isolated worktree. Worker 1 also delivers 24 real-model trial records. Worker 3 reconciles the four manifests and compares their common SHA to the 24-trial ledger.

## Parallel ownership and integration

| Boundary | Sole editor during this acceptance round |
| --- | --- |
| Documents, graph, map, image compare, editor, question/receipt, composition guidance and held-out eval | W1 owns planning-question semantics and provides the focused hunk when needed in `App.tsx`. W3 lands new shared-file hunks. |
| Diagnostics, changes, endpoints, pipeline, stats, comparison and credential surface styles/tests | W2. Own the software component selectors, including their use of the control-border token. |
| Shared lifecycle/tabs, central registration, generic table/control accessibility, token definitions, shared motion and the evidence ledger | W3. Own new shared hunks in `App.tsx`, `styles.css`, `scripts/task-design-scenes.ts`, browser-suite and source manifests, and global motion/theme tests. Preserve W2’s existing scroll-pill and W1’s planning behavior. W1 can verify table-footer behavior directly. |
| Image annotation, schedules, logs, boards, architecture, traces and plan progress | W4. Own the existing work-object and exploration components, their local CSS and associated test files. |
| Shared shell, server grants, provider services, repo-wide CI and other active feature work | The registered maintainer for the affected subsystem. None of the four takes over unrelated implementation. |

For a shared file needed by another lane, the requesting worker supplies exact path, hunk, fixture ID, expected behavior, failing/passing commands and base SHA on #1811. The sole editor applies or forwards the hunk after checking existing claims. Workers with separate worktrees can run all checks immediately. Isolate temporary recorders and outputs per worker outside the tracked product changes. First finish lane-only work. When the reviewed component changes can run together, W3 is the integration evidence coordinator. W3 collects four PR/commit IDs and retrieves a clean, pushed combined candidate from the integrating maintainer. If no common ref exists, W3 can assemble the already reviewed, in-scope lane revisions on a disposable current-main integration branch under the repo’s normal review rules. On a conflict, stop that merge in the disposable worktree, post the paths and exact two revisions to the owning lane, and continue the independent checks. W3 publishes the full common SHA and four inclusion records on #1811 before declaring the build frozen. A temporary integration ref is distinct from merged main. Reuse the repo's review/merge process. Record a merged PR for squashed changes or show ancestry for merged commits, then verify the included behaviors. The four film sets must come from that same frozen SHA. If code changes, freeze a new SHA and capture on it.

## Reference timing and visual review

The earlier frame audit inspected all 1,019 decodable frames of the 34-second 1280 × 720 reference, and sampled all 29 baseline clips across 443.032 seconds. Baseline clips used the actual renderer with authored data and started after initial publication. These timestamps are prior observations at 30 fps. Use your interface's millisecond values in the retained specification for implementation. [Original renderer](https://github.com/skytuhua-org/Gen-V1/tree/4bcdc82a73a28d27d6ebe413a527389119f35292) · [Design guidance at the revision used by the original audit](https://github.com/emilkowalski/skills/tree/64eb3deb9a5fbfa041faf783e0bc3fd635872e9c)

| Recording time | Frames | Moment | Observed detail |
| --- | --- | --- | --- |
| 2.667–2.967 s | 0080–0089 | Immediate action acknowledgment | Create PR becomes Creating PR with a spinner; the pill grows and carries the adjacent diff pill. A user message appears with a short upward reveal. |
| 3.867–4.267 s | 0116–0128 | Task object materializes | Card shell and commit graph appear through a short soft reveal. Lower history is present first; upper active rows follow. Composer is carried down; internal controls remain arranged. |
| 4.933–5.533 s | 0148–0166 | New commit label resolves | Uncommitted changes becomes Add session refresh tests through visible changing alphanumeric suffixes. SHA and author replace the file count. Footer changes to Pushing 3 commits to origin beginning f148, clear by f152. Existing history stays still. |
| 7.100–8.367 s | 0213–0251 | Main advances within the graph | A slot opens before new content appears. Rotate session keys enters from f220, decoding through f237; Read sessions with the current key enters above it from f228, decoding through f251. Older rows are carried down. Checking it merges cleanly begins f229. |
| 8.733–9.000 s | 0262–0270 | Conflict state becomes actionable | Top intent changes to a gold warning and 3 conflicts; two main commits receive amber text and counts 1 and 2. Footer presents 3 conflicts with main and Resolve conflicts. Composer status mirrors the same state. |
| 11.767–12.000 s | 0353–0360 | Three-conflict evidence appears | A rounded elevated panel fades into place above the footer trigger. File and line hunks are readable as one coherent panel. No surrounding layout reflow. |
| 12.933–13.033 s | 0388–0391 | Evidence exits promptly | Popover fades away over about 100 ms between first change and first absent frame. The graph does not move. |
| 16.133–16.267 s | 0484–0488 | Resolve receives immediate acknowledgment | Resolve conflicts becomes Resolving plus a spinner. Footer reads Merging main into the branch. Action remains anchored at the right as its label width changes. |
| 17.400–18.500 s | 0522–0555 | Resolution commit is inserted | A row slot opens below Merge into main; a blue-highlighted Merge main into feat/session-refresh row appears from f532 and its label decodes through roughly f555. The same graph grows; it is not replaced. |
| 19.767–21.067 s | 0593–0632 | Determinate tests run on the new row | Counter becomes 1/42 at f593 and reaches 42/42 at f628, held through f632. Thin green progress underline advances on the resolution row. Footer reports Running N of 42 tests. Remaining conflict confirmation appears by f595. |
| 21.900–22.600 s | 0657–0678 | Ready state and staggered validations | Ready to merge and Merge appear first. Tests chip begins f660, Lint f663, Types f665, Preview f668; all labels are legible by f671 and confirmation marks settle around f678. The button is visible before optional checkmark motion finishes. |
| 28.300–28.467 s | 0849–0854 | Merge receives immediate acknowledgment | Footer becomes Merging into main; button becomes Merging with a spinner after a brief soft label replacement. No modal takes over the task. |
| 29.400–29.600 s | 0882–0888 | Result replaces the same task state | Validation row disappears and card contracts. Header reads Merged, virtual tip turns purple, footer becomes Merged into main and the right action becomes GitHub. Main branch chip returns to the top result row. |
| 29.400–30.200 s | 0882–0906 | Result label resolves | Merge into main decodes into Merged into main through changing suffix characters. This is a distinct one-shot title effect, not evidence of backend execution or an actual typewriter implementation. |
| 29.700–30.567 s | 0891–0917 | Purple confirmation follows the feature branch | Highlight reaches the resolution commit around f891, Add session refresh tests f893, Refresh sessions near expiry f895 and Read session expiry from token f898. Purple row washes fade by f915-917; unrelated gray main and green analytics rows remain unhighlighted. |
| 30.600–32.233 s | 0918–0967 | Stable completed object | The finished graph and GitHub action hold without further attention-seeking motion. The earlier conflict paragraph remains unchanged, a concrete continuity limitation. |

Watch each new real-time clip once at normal speed and once at 0.25×. Step one frame at a time from the last old state through the first stable new state of each chapter. Record the first useful, first changed and last moving frames and the first actionable frame. In the review sheet name the exact object, neighbor that must stay anchored, visible feedback and what actually caused it. Compare the action's availability against the source receipt. Measure internal empty regions separately from the conversation margins. Check content fit, preserved hit targets, label clipping, controls reachable at 390 × 844, a 640 px content pane and 200% zoom. Repeat at 1280 × 800, 1440 × 1000, 1920 × 1080, light/dark and the motion policies specified for the component. Profile the costliest scene on a real ≥60 Hz display and record hardware, sampled frame intervals and any long frames against the 16.7 ms budget at 60 Hz. Keep sensitive traces private and publish a redacted summary.

Record the independent review as PASS, FAIL or BLOCKED per UI, with the timestamp or frame and evidence URL. The reviewer checks all four questions. Does motion explain the changed task object? Does the first response arrive with actionable data? Do unchanged objects, focus and reading position stay put? Does the layout use the source's shape and fit the task at the specified widths? Fix each failure at its owning surface and retest. The product owner makes the final visual decision against the supplied benchmark after watching the integrated takes.

## Current assignment and source map

Work on Worker 4 only. Produce seven individually playable films and the evidence for an independent reviewer to decide whether a user can annotate an image, offer one time, follow a log, propose a card move, inspect an architecture, read a trace and follow a task plan. Motion must identify the entity that actually changed. Pin the final evidence to the same product build used by the other three workers. The original implementation and approved clarity specification follow in the appendices. The original checkout, branch heads and “next step” statements there are historical.

| Source | Verified at planning time | How to use it |
| --- | --- | --- |
| [main](https://github.com/skytuhua-org/Gen-V1/commit/36fcc56d24cef7558059264a8540d7f0592d93cd) | Current-main audit pin. | At pickup resolve current main, current PR heads and the coordinator's common test SHA separately. |
| [#1143](https://github.com/skytuhua-org/Gen-V1/pull/1143) | Open `refine/exploration-workflows@dd85b8cd91302dec4fb229295ec309bc6d613c7b`; [branch CI passed](https://github.com/skytuhua-org/Gen-V1/actions/runs/44847266943). | Seven behavior implementations and regressions. Branch CI predates combined visual review. |
| [#1175](https://github.com/skytuhua-org/Gen-V1/pull/1175) | Open `refine/ux-1125-clarity@a55cf4fccc3361e11b50045bfc988814c1666256`, stacked on #1143. | Preserves subsequent UX vocabulary, proximity, control legends and 8px lane top clearance. [CI failed](https://github.com/skytuhua-org/Gen-V1/actions/runs/44868269136). |
| [#1257](https://github.com/skytuhua-org/Gen-V1/pull/1257) | Open `review/w4-board-header-clearance-20261120@a4c0cde7e01147dde62403cf948e1c3c2cab708f`; [its CI passed](https://github.com/skytuhua-org/Gen-V1/actions/runs/44867949271). | Compare `workflow lane headers remain fully below the scroll viewport edge`. Its CSS result also exists on the latest #1175. Reuse the missing geometry test only if absent. |
| [QA walkthrough](https://github.com/skytuhua-org/Gen-V1/issues/1125#issuecomment-7057479270), [repair report](https://github.com/skytuhua-org/Gen-V1/issues/1125#issuecomment-7057550112), [release and evidence status](https://github.com/skytuhua-org/Gen-V1/issues/1125#issuecomment-7056492549) | Independent reviewer found clipped board headers. Worker reports 27 work-object tests passing after the CSS repair. Some evidence existed only on the prior worker's VM. | Make fresh durable clips; local worker paths or session attachments with no verified access do not satisfy delivery. |

Owned paths under `apps/web/src/`: `ExplorationTools.tsx` and `exploration-tools.css` for UI 16–18; `WorkObjects.tsx` and `work-objects.css` for UI 19–21; `PlanStatus.tsx`, `plan-timeline/TimelineRows.tsx`, `plan-timeline/timeline.css` for UI 28. Owned tests under `tests/e2e/`: `exploration-ui.spec.ts`, `clarity-schedule-logs.spec.ts`, `task-scheduling.spec.ts`, `work-objects.spec.ts`, `plan-timeline.spec.ts`. Read-only cross-checks include the theme suite, shell lifecycle, Cursor receipt and tool-effects host suites. Actual current #1175 comparison also lists files under packages/contracts, packages/core and packages/ui-catalog. Do not import unrelated merge-history hunks into a Worker 4 correction. Use the existing grants, state machines, stable entity IDs and existing controlled-action entry points.

## Execution and acceptance

**W4-T01. Reconcile stack and latest design.** Depends on receipt and acknowledgement of the parent plan. Fetch origin main and PR heads 1143, 1175 and 1257 into private refs. Record full SHAs, merge-base, diff name-status, ownership, outstanding reviews and exact CI job states. Compare per-file changes on a clean disposable candidate. The later approved clarity pass in #1125 comment 7037371129 governs final copy and compact geometry: the schedule ruler is 16px in that pass, lane/card empty-region minima are 96/72px, and the UI calls trace spans “steps.” Preserve underlying supplied identities and timings. Lane indicators must describe the actual implemented state (some versus all cards moved locally); a new source revision or receipt alone cannot mark a lane “reviewed.” Never accept an old report that the branch conflicts as proof of a present conflict. In real CSS conflicts preserve intended geometry together with main's stronger interactive border and selected-state tokens. Record which behavior/test hunks are already represented before editing.

**W4-T02. Verify repair and readability.** Depends on T01. At 1280×800 use the board fixture in `work-objects.spec.ts`; show Ready, In review and Prepared including counts. Inspect `.workflow-lanes-scroll`: computed top padding 8px. Bound the full header text range against its scrollport at the leftmost and rightmost horizontal viewport positions and with mid-page scroll bringing the board back into view. Check all visible header glyphs, count, focus outline and drag destination; use #1257's current positive test as the starting point. Repeat at 390×844, 640px actual artifact width and 200% browser zoom. On the #1175 SHA the source still contains `.architecture-detail dt,.trace-detail dt{font-size:10px…}` despite the 11px meta floor. Inspect visible computed size in selected-node and selected-step details, across both themes. If a visible term computes to 10px, change only the shared local rule to 11px and add a computed-size assertion in the owned spec. Open details before measuring; counting only initially visible text will miss the regression. Apply the published 11px metadata floor to any other visibly failing owned selector, using the narrowest rule and an observed target. Check 12.5px base where the clarity spec sets it, label-to-value proximity (≤120px for related inline metadata), no clipped text/controls at 200%, no page-wide overflow and no fixed blank placeholder when the corresponding data is absent.

**W4-T03. Triage the two failing CI jobs as separate investigations.** Depends on T01; parallel with T02. [Browser evidence](https://github.com/skytuhua-org/Gen-V1/actions/runs/44868269136/job/136736769675) shows `tests/e2e/tool-effects-host.spec.ts:12` failed around `openHost` with a closed page/context during navigation, and teardown timeout. [Shard evidence](https://github.com/skytuhua-org/Gen-V1/actions/runs/44868269136/job/136736769612) shows `tests/cursor-service-receipt.test.ts:44` expected true and received false. Run each individually on the PR candidate and actual merge-base in separate clean worktrees, same pinned toolchain, runner OS where available and commands below. Preserve initial failure, trace and rerun. If candidate alone fails, inspect its trace and the files changed by the stack, fix only an evidenced in-scope cause or route to owner. If both fail identically, report both links and hand to the host/receipt owner via the parent. If neither reproduces, report observed counts and original CI failure; a local pass does not erase that red job. No changes to general timeout, retry budget, test expectations or runtime behavior in this lane. Only count actual required current-head checks green.

**W4-T04. Exercise the seven user journeys.** Depends on T01. All scenes begin with a usable empty host, then actual publication. Capture source update, deliberate input, interrupted/rapid change, durable outcome or explicit unsent state, and restoration. No fake write/receipt or pre-rendered already-complete opening. Use owned positive and negative fixtures from the appended prompt.

| Deliverable | Positive: film and verify | Negative: prove and log |
| --- | --- | --- |
| `16-image-annotator.mp4` | Place a pin at a known normalized coordinate, select another, type a note, delete the selected pin and recover focus. Submit exact pins/notes through the fixture. Preserve the 26px pin face and coarse 44px target; pointer placement uses the specified 160ms accent. | Empty/denied image has truthful fallback. Typing and keyboard focus do not replay the pointer accent. Restore against the same revision and retain the note and coordinates. |
| `17-schedule-picker.mp4` | Display source slots and timezone, choose an offered slot, switch by keyboard, then send the exact supplied `{slotId,start,end,timeZone}`. Compare ruler against the actual time window and verify the action caption. | Not-offered slots cannot submit. Changing local selection does not book a meeting; a changed source cannot submit the stale slot. Keyboard/reduced mode stays quiet. |
| `18-log-explorer.mp4` | Expand view, enable Follow, append an event, then manually scroll away and append again. Record the same visible row ID/offset before and after append with Follow off. Filter by correlation and show the selected event detail. | Wheel/touch/navigation cancel following. Filtered selection and removed event have distinct, truthful status; no implicit focus jump or fabricated event. |
| `19-workflow-board.mp4` | Pointer-drop a source card with the single 220ms transfer, reverse it mid-flight, then use Alt+Arrow or Change lane and show the unsent count. Send and inspect the exact source revision and moves payload. | Same-lane drop and keyboard movement do not replay pointer transfer. Incoming source revision invalidates stale proposal; verify recoverable reset, focused card and unclipped headings. |
| `20-architecture-canvas.mp4` | Inspect a node with real incoming/outgoing connections, toggle Focus neighbors, select the adjacent node, then publish a newly inserted node. Preserve selected ID, directed labels and final positions. 140ms halo on eligible pointer selection. | Keyboard focus/reselection does not start halo. Missing edges stay absent, and stale selection/revision cannot send a valid inspect request. |
| `21-trace-waterfall.mp4` | Show timed, zero-duration and missing-timing records together; zoom, filter and navigate the visible tree with arrows. Compare origin/ruler and actual extents. Zero duration gets a 2px marker at its exact start; missing time gets “No timing in this record.” | No minimum fake duration for zero, no fill for unknown. Source revision makes stale action invalid even after changing a local filter. No inaccessible selected tree branch. |
| `28-task-plan.mp4` | Publish same-thread/run/epoch increasing revisions; show a genuine accepted transition (160ms progress interpolation, 120ms node accent), then a correcting snapshot during motion. Reopen expanded details and use Jump to running step. | Restore, obsolete revision, duplicate state, reduction and owner/epoch change do not animate completion. Corrected progress and accessible value are immediate and source-authored. No copy implying completion before evidence. |

**W4-T05. Validate, record and publish evidence.** Depends on T02–T04 for the final report. From repository root install with the locked pnpm and Node versions specified in the original appendix, then run each command below. Use the per-worker capture ports and fixtures from the appendix. Maintain one execution at a time for configs that share a server port. Obtain a real runner matching CI if a local result differs by OS.

```bash
pnpm install --frozen-lockfile
pnpm build:widgets
pnpm exec playwright install chromium
pnpm exec playwright test --config tests/e2e/clarity-schedule-logs.playwright.config.ts
pnpm exec playwright test --config tests/e2e/generated-selects.playwright.config.ts --project=generated-controls tests/e2e/work-objects.spec.ts
pnpm exec playwright test --config playwright.config.ts tests/e2e/plan-timeline.spec.ts
pnpm exec vitest run tests/theme-contrast.test.ts
pnpm exec vitest run tests/cursor-service-receipt.test.ts
pnpm exec playwright test --config playwright.config.ts tests/e2e/tool-effects-host.spec.ts
pnpm typecheck
pnpm lint
git diff --check
```

Use each config's `--list` to verify collection; record actual operating system, browser/channel, fixtures, pass/fail/expected-failure/skip counts and SHA. Test mouse, keyboard, coarse pointer, light/dark, application reduced/off and operating-system reduced motion. For all seven renderers capture the 1920×1080, 390×844, 640px container and 200% stills per the clarity appendix, with visible task details open. Use genuine 200% browser zoom and note measured CSS pixels; viewport emulation alone is insufficient. Re-record the seven named 1920×1080/30fps H.264 files on the coordinator's common SHA, with its actual data path, 500ms pre-publication, recorded interaction chapter times and 900ms final hold per appendix. Run ffprobe, decode through EOF, SHA-256 each individual file, check cold download/playback, and provide the final versioned evidence link and manifest per UI. Measure 60 Hz frame pacing separately wherever claimed.

**W4-T06. Handoff and release.** Depends on T05. Post the lane-to-parent checkpoint with seven playback links, the viewport/zoom matrix, board geometry and text-size measurements, both CI control comparisons, exact remaining failed/blocked criteria, and a one-sentence answer for each surface explaining what the user can do, derived from the visible UI. Record metadata under the shared release SHA; prior session-only video links cannot satisfy final distribution. The maintainer performs final reference-quality judgment and merge review. No test, video replay, integrated release or merge was executed as part of this planning pass.

## Requirement-to-task verification map

| Requirement | Worker-local task IDs | Acceptance evidence | Handoff task |
| --- | --- | --- | --- |
| Board clearance, text-size floor and CI attribution | T02, T03 | Scrollport/header rectangles, measured visible labels and same-base control results for both historical red jobs. | T05 |
| Custom task interactions and durable evidence across seven UIs | T04 | Seven changing entities with a verified source-safe outcome and a negative case, including correction/restoration. | T05, T06 |

Use T01 for source reconciliation before editing. Preserve the first failure and its SHA. Roll back a failed local acceptance change by discarding its disposable candidate or reverting its own isolated commit through review. Restore the last known-good candidate and rerun its corresponding positive and negative tests. Preserve all four existing branches and other workers’ pending edits.

For the design record below, 11 CSS px is the project’s chosen minimum for the specified metadata. WCAG does not prescribe that font-size threshold. Check text resizing, contrast and visible focus separately.

## Preserved lane design revision

This is the previously published design and copy specification. Interpret its historical ownership and delivery statements at their recorded date. The acceptance tasks above establish present ownership, tests and integration order. [Design decision on issue #1125](https://github.com/skytuhua-org/Gen-V1/issues/1125#issuecomment-7037371129)

[design-review-w4] UX REVIEW + NEXT-STEP SPEC | PLAN_REV=ux-1125-v1 | scope: UI-16,17,18,19,20,21,28 as shipped on `refine/exploration-workflows`@a76e6383 (PR #1143) | reviewed via recorder stills at 1920×1080 dark, 390×844, 640px + source CSS. No code changed; plans only.

# UX review — issue #1125 generative interfaces

## What is broken for the user

**P0 — Text is unreadably small.** Content type sits at 11–12px and metadata at 9–10px (`work-objects.css` `.work-object` 12px base; `.log-event-level`, `.log-event time`, `.workflow-card-tag`, `.workflow-card-owner` all 9px; `.workflow-lane` counts, `.schedule-time-axis`, `.log-levels` 10px). 9–10px fails WCAG readability for sustained reading and is illegible at 200% browser zoom when combined with `var(--muted)` low contrast.

**P0 — Copy describes the system, not the user's task.** Every surface speaks in pipeline jargon instead of user language: "5 supplied spans", "3 cards · local draft", "Moved locally", "Timing unavailable" (rendered as a hatched bar that looks like data), "Send move proposal", "Ask about node", "Ask about span", "Send image feedback", "The supplied record reports a page limit failure", "Times come from the supplied trace". A user cannot tell what these interfaces are for, what a click does, or what will be sent. This is the root of "I can't understand anything."

**P0 — No purpose statement anywhere.** Each artifact header carries only a title ("Prepare the document workflow") and a tab row. Nothing says what the object is, what decision the user is asked to make, or what the primary button does with their answer.

**P1 — Rows are stretched edge-to-edge ("everything is so wide").** The artifact fills the full conversation column (`max-width:1040px`, expanded `1280px`) and every inner row spans its whole width: `.log-event` is `10px 46px 1fr 64px 13px`, pinning the timestamp ~500–900px away from its message; `.schedule-slot-heading` uses `justify-content:space-between`, pushing "Available" to the far right edge; `.schedule-interval` is `142px 1fr` so each option's ruler bar is a full-width strip; the trace span-name column and its bar sit at opposite sides of a 1fr gap. Related facts are separated by hundreds of px of dead space — the eye must travel the full row to connect a label to its value.

**P1 — Detail/metadata scattered to extremes.** `.exploration-heading`, `.work-object-heading`, `.workflow-selected`, `.log-selected-heading`, `.trace` header stats all use `justify-content:space-between`, so count/availability/status float at the right margin unrelated to what they describe.

**P1 — Cryptic status vocabulary.** Lane dots (`.workflow-lane-mark.mark-1` half-filled ring, `.mark-2` filled) encode state with no legend; the hatched "Timing unavailable" track reads as a real bar; `data-drop-target` lane highlight is the only affordance that lanes are drop targets ("Drop a card here" exists only in empty lanes); severity dots in the log are 5px.

**P2 — Controls lack discoverability and affordance consistency.** Correlation IDs render as plain text that is secretly a button; "Move to" hides behind a generic select; "Focus neighbors" is a pressed-toggle with no explanation of what focus means; `Jump to latest` floats over content.

**P2 — Mobile/narrow regressions.** At 390×844 the trace bar region still reserves its full grid while rows stack awkwardly; the schedule ruler keeps a fixed 166px left indent (`.schedule-time-axis margin-left:166px`) that no longer aligns with stacked options.

## Next-step plan (design spec for the implementing worker)

Goal: make each artifact instantly explain itself, keep related facts within one gaze, and raise the minimum text size to 11px for meta / 12.5px for content. Compact, not smaller overall — the savings come from proximity, not shrinkage.

### Global changes (applies to all 7 interfaces)

| # | Change | Exact value |
|---|--------|-------------|
| G1 | Base content size | `.work-object` and `.exploration-tools` `font-size:12px→12.5px` |
| G2 | Metadata floor | Every `font-size:9px` or `10px` in the seven surfaces → `11px` (`.log-event-level`, `.log-event time`, `.workflow-card-tag`, `.workflow-card-owner`, `.workflow-lane>header>span`, `.workflow-lane-description`, `.workflow-local`, `.schedule-time-axis`, `.schedule-availability`, `.log-levels`, `.work-object-heading>span`, `.work-object-eyebrow`, `.exploration-heading>span`, `.exploration-hint`, `.annotation-toolbar>span`, `.exploration-source`, `.workflow-stale p`, `.workflow-selected p`, `.log-selection dt/dd`, `.log-event-details pre`, `.plan-fact>strong`, `.plan-subsection-label`, `.plan-step-copy>span`, `.plan-dependencies`, `.plan-requirements small`, `.plan-check-details`, `.plan-muted`-adjacent smalls) |
| G3 | Purpose caption under every artifact header | Insert one `<p class="surface-purpose">` directly under the `h3`: `font-size:12px;color:var(--muted);line-height:1.5;margin:-8px 0 14px;max-width:62ch`. Copy per interface in §Copy table |
| G4 | Kill space-between scatter | `.exploration-heading`, `.work-object-heading`, `.log-selected-heading`, `.workflow-selected`, `.trace` stat row: replace `justify-content:space-between` with `justify-content:flex-start;gap:16px`; move count/availability text to sit immediately after the element it describes |
| G5 | Timestamp proximity | `.log-event` grid → `10px 46px minmax(0,1fr) auto 13px` with `time` moved into a `.log-event-meta` cluster: message and time separated by `gap:8px`, `time{flex:0 0 auto;text-align:left}` (no right-edge pin) |
| G6 | Primary-action caption | Every primary submit button gets a preceding `12px var(--muted)` line stating what is sent, e.g. "Sends your selected window to the agent." Layout: footer becomes `display:flex;align-items:center;gap:14px;flex-wrap:wrap` with the caption first, button last |
| G7 | Legend for encodings | Wherever a visual encoding exists (lane marks, severity dots, halo, hatched bars), add a `11px var(--muted)` legend line inside the same container, e.g. "Half-filled = some cards reviewed · filled = all reviewed", placed under the toolbar, `margin-bottom:10px` |
| G8 | Unavailable ≠ data | Replace hatched `Timing unavailable` track with a 1px dashed `var(--border)` baseline plus `11px var(--muted)` text "No timing in this record" left-aligned at `padding:0 8px`; no patterned fill |

### Per-interface spec

**UI-16 Image annotator** (`.annotation-*`)
- `.annotation-layout` rail column `minmax(200px,28%)` → `minmax(240px,32%)`; image stays intrinsic.
- Purpose caption: "Click the image to drop a pin, then write what should change at that spot."
- `.annotation-list button` font 11→12px; row padding `7px 8px→8px 9px`.
- Footer caption: "Sends every pin and its note to the agent." Keep `Send image feedback` label → rename to `Send feedback (1 pin)` — dynamic count in label.
- Pin face keeps 26px; hit area unchanged (32/44px).

**UI-17 Schedule picker** (`.schedule-*`)
- `.schedule-interval` grid `142px 1fr` → `minmax(0,1fr) auto`; move availability text into the heading cluster: `[radio] Title · Available` then time line; the ruler keeps full row width but shrinks `height:24px→16px`, band `top:2px;height:20px` → `top:0;height:16px`.
- `.schedule-time-axis` `margin-left:166px` → align to ruler track only: keep `margin:0 12px 6px 0`, `display:flex;justify-content:space-between` inside the right grid column only (it already only spans the ruler column — ensure it does not indent past the label column when grid becomes 1-column).
- Purpose caption: "Pick one offered slot; the agent is told your choice."
- Copy: unavailable option gets `Not offered` (not "Unavailable"); tentative gets `Awaiting confirmation`; footer caption "Sends this window to the agent." Button `Propose time` → `Send this time`.
- States: disabled option `opacity:.55`, text "Not offered" right-aligned after label with `gap:8px` not space-between.

**UI-18 Log explorer** (`.log-*`)
- Purpose caption: "Read the record's events. Pick one to inspect or filter."
- `.log-event` grid per G5; severity column `46px→52px` to fit `UNKNOWN` at 11px.
- `.log-event time` moves adjacent to message (see G5) — right-edge time column removed.
- Correlation value: render as a real link-style button `color:var(--accent);text-decoration:underline;text-underline-offset:3px` with `aria-label="Filter by correlation <id>"`; sighted users must see it is clickable.
- Selected detail block `.log-selection` margin-left `28px→34px` keeps rail alignment at new dot position; border-left `1px var(--border)` added so it reads as a child of the row.
- Toolbar: "Levels" label removed; the 5 checkboxes get a `11px var(--muted)` prefix "Show:".
- Empty/filtered states keep existing copy but size 12px.

**UI-19 Workflow board** (`.workflow-*`)
- Purpose caption: "These are the source's cards. Move a card to propose a change — nothing moves until you send it."
- `.workflow-lane` min-height `128px→96px`; `.workflow-lane-cards` `82px→72px`.
- Lane header: `h4` 11→12px; count sits at `margin-left:6px` after the name, `11px var(--muted)` — not at the row's right edge.
- Add legend under toolbar (G7): "Half-filled dot = lane has a local move pending · filled = move proposed".
- `.workflow-card-tag`, `.workflow-card-owner` 9→11px.
- Selected detail: "Move to" select gets a visible `11px var(--muted)` label above it ("Change lane"); stale-source banner copy → "The source moved on — your local move is out of date. Reset to the source or re-do the move."
- Footer caption: "Sends your local moves to the agent as a proposal." Button stays `Send move proposal` → rename `Send move (1 card)` with count.
- "Drag cards or use Alt + Left / Right" hint moves to an `aria-describedby` on the board + `11px var(--muted)` line under lanes.

**UI-20 Architecture canvas** (`.architecture-*`)
- Purpose caption: "The supplied map of components. Select a node to inspect its connections; the agent is told which node."
- `.architecture-layer-label` 11px→11px keep (canvas art exempt); node label 12px.
- `Focus neighbors` button gains `11px var(--muted)` inline explainer after it: "Dims everything except the selected node's direct connections."
- Connected-nodes list: replace `Outgoing · <label>`/`Incoming · <label>` second line with arrow glyphs `→ <label>` / `← <label>` plus edge label, 11px; each row shows `[icon] NodeName — <edge label>` single pattern.
- `Ask about node` → `Ask about this node` + caption "Sends the selected node to the agent with your question" — actually the button submits selection; caption: "Tells the agent you want to discuss the selected node."
- `No supplied connections.` → `No connections in the supplied map.`

**UI-21 Trace waterfall** (`.trace-*`)
- Purpose caption: "Timing for each step of the record. Bars show real durations; nothing is estimated."
- Header caption `<n> of <m> spans` → `<n> of <m> steps` (user vocabulary); "supplied spans" → "steps in this trace".
- `.trace-track` min-height stays 40px; label column `minmax(0,1fr)` capped at `220px` so bars start closer to names: grid → `minmax(140px,220px) 1fr` (currently effectively wider via 1fr label+track split — verify with `traceLayout` width calc and set explicit `grid-template-columns:minmax(140px,200px) minmax(0,1fr)`).
- Zero-duration marker: keep 2px bar + `11px` label "0 ms at <start>".
- "Timing unavailable" → G8 treatment + copy "No timing in this record".
- `Ask about span` → `Ask about this step` with caption "Tells the agent you want to discuss the selected step."
- Status column in detail: `Error` gets `var(--danger)` at 12px not 10px.

**UI-28 Task plan / agent progress** (`.plan-*`)
- Purpose caption under plan title: "Live status of the running plan. Expand a step or agent to see its work."
- `.plan-step-copy>span`, `.plan-dependencies`, `.plan-fact>strong`, `.plan-requirements small` 11–11.5→12px; `.plan-check-details` 11.5→12px.
- `.plan-branches>.plan-agents` gap `10px→12px`; `.plan-agent` padding `10px→12px`.
- "Jump to current" button gets `aria-label="Scroll to the step currently running"` and `11px` caption on hover-target zone is unnecessary — keep single label "Jump to running step".
- Blocker panel keeps style; add `11px` label "What is blocking this plan" above `.plan-blockers` content.

### Copy table (exact strings)

| Current | New |
|---|---|
| `5 supplied spans` / `2 of 5 spans` | `5 steps in this trace` / `2 of 5 steps` |
| `3 cards · local draft` | `3 cards · unsent changes` |
| `Moved locally` | `Moved — not sent` |
| `Send move proposal` | `Send move (N cards)` |
| `Timing unavailable` | `No timing in this record` |
| `Ask about node` | `Ask about this node` |
| `Ask about span` | `Ask about this step` |
| `The supplied record reports a page limit failure.` | keep (factual) |
| `Times come from the supplied trace.` | `Times come from the trace record.` |
| `Unavailable` | `Not offered` |
| `Tentative` | `Awaiting confirmation` |
| `Select a time above` | `No time selected yet` |
| `The supplied source count is distinct from progress.` (observations) | remove decorative captions; keep factual footnotes only |

### States & interaction invariants (do not regress)

- All Worker-4 motion rules stand: pointer-only 120–140ms accents, immediate keyboard/restore/reduced-motion states, `cubic-bezier(.16,1,.3,1)` enter / `(.4,0,.2,1)` move. No new animation is added by this spec.
- Every change above is CSS-only or copy-only; no component logic, state machine, store write, action payload, focus order, keyboard map, or grant/validation behavior changes.
- Touch targets stay ≥44px on coarse pointers; the type-size increase must not shrink hit areas.
- No row may exceed the artifact's inline width; narrow container queries (<650px, <420px) keep working — re-verify `.log-event` grid collapse at <420px drops `time` onto line 2 (`grid-row:2`) rather than clipping.
- No new colors, fonts, icons, or decorative elements; existing tokens only (`--text`, `--muted`, `--border`, `--subtle`, `--accent`, `--selection-*`, `--danger`, `--pending`).

### Verification

- Re-record stills at 1920×1080 dark / 390×844 / 640px container / 200% zoom for all 7 scenes; confirm: smallest rendered text ≥11px, no label→value gap >120px between related facts, purpose caption present under each h3.
- Re-run the three touched spec files: `tests/e2e/exploration-ui.spec.ts`, `tests/e2e/work-objects.spec.ts`, `tests/e2e/plan-timeline.spec.ts` — expect selector/text updates only where tests assert old copy strings; update assertions to the Copy table, no test deletion.
- Manual: with fresh eyes, one sentence answer to "what is this screen and what do I do" must be readable from header+caption for each of the 7 UIs.

NEXT=dispatch one implementer on branch `refine/ux-1125-clarity`, base `refine/exploration-workflows` tip; deliverable = same 7 review stills + spec test updates; then this plan's VERIFY section.

## Receiver handoff and journal

Use a worker-specific monotonically numbered checkpoint on #1811 when starting, after each task or material change, on CI or review results, on handoff and before stopping. After 20 minutes of active work without a milestone, publish a checkpoint per AGENTS.md. Include the previous permalink, plan revision, UTC, owner and recipient, every task and its state, exact command and result counts on the identified SHA, branch/PR/status, changed paths, tracked/untracked and push state, artifacts, failures, assumptions and next executable action. Release only your own scope with `OWNER=NONE` when stopping. A receiver ACK identifies the task IDs and starting SHA. Provide the files and manifest through a durable repository-authorized evidence location. Redact identifying personal content, credentials, private paths, bearer tokens and signed grant URLs. Keep the stable synthetic IDs or aliases and source revisions needed to reproduce the result. A receiver must be able to open and decode each assigned file. Never check private profiles, tokens, raw traces or generated videos into the product source branch.

## Preserved original Worker 4 specification

Original source SHA-256 `e14de8c806770cd33cf34fb82830027309df9e516627f7d29ca3a3bed34731fc`. The bytes from the next heading through end of file reproduce the original assignment. Use the current-state instructions above for starting refs and ownership. The original source-only recording route is executable using the checked-in fixtures when the historical review ZIP is unavailable.

# Worker 4. Image annotation, schedules, logs and workflows

Implement the following changes in `skytuhua-org/Gen-V1`. Refine how a user places a pin, proposes a meeting, reads a log, moves a card, explores an architecture diagram, inspects a trace and follows a running plan. Make the selected object easy to follow without losing its position, source or draft.

You own seven interfaces. Return one working branch, one individually playable MP4 for each interface and the verification results. This entire Markdown file is your instruction. Execute it in one worker session from the pinned base.

| UI | Assignment | Review video to return |
| --- | --- | --- |
| 16 | Image annotations | `16-image-annotator.mp4` |
| 17 | Schedule picker | `17-schedule-picker.mp4` |
| 18 | Log explorer | `18-log-explorer.mp4` |
| 19 | Workflow board | `19-workflow-board.mp4` |
| 20 | Architecture canvas | `20-architecture-canvas.mp4` |
| 21 | Trace waterfall | `21-trace-waterfall.mp4` |
| 28 | Task plan and progress | `28-task-plan.mp4` |

## Start from the inspected source

Use the existing authorized checkout of [skytuhua-org/Gen-V1](https://github.com/skytuhua-org/Gen-V1). The common starting commit is `26ddf4d16c2fc1196b520d8a46c5441d64d01463`. Every section below can be implemented against that commit in this branch. Use a full checkout with its workspace packages, fixtures and lockfile. From the repository root, in Bash:

```bash
set -euo pipefail
BASE_SHA=26ddf4d16c2fc1196b520d8a46c5441d64d01463
BRANCH=refine/exploration-workflows
if ! git cat-file -e "$BASE_SHA^{commit}" 2>/dev/null; then git fetch origin "$BASE_SHA"; fi
WORK_RUN=$(mktemp -d "${TMPDIR:-/tmp}/gen-v1-worker-4.XXXXXX")
export WORK_RUN BASE_SHA BRANCH
export EVIDENCE="$WORK_RUN/evidence"
mkdir -p "$EVIDENCE"
git worktree add -b "$BRANCH" "$WORK_RUN/src" "$BASE_SHA"
cd "$WORK_RUN/src"
git rev-parse HEAD > "$EVIDENCE/base-sha.txt"
test "$(git rev-parse HEAD)" = "$BASE_SHA"
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

Use Node 24.10.0 or later with the repository’s pnpm 10.30.3. If resuming, reopen your existing branch/worktree and evidence directory and verify the base is its ancestor. Run the repository setup in `docs/getting-started.md` for native prerequisites. Browser suites that set `channel: 'chrome'` require branded Chrome. In your disposable environment, if launching that channel fails, run `pnpm exec playwright install chrome` and retry. On Windows, suites configured with `msedge` require the Edge channel. Launch that channel once and provision it in the disposable VM if missing. Capture requires `ffmpeg` and `ffprobe` on PATH.

The file lists under the implementation sections are the complete tracked edit scope. Read any other named source or test as needed. Put temporary recording code in a separate disposable checkout and return it with your evidence. Keep review MP4s and generated evidence outside the source tree.

## Interaction rules

Use real component and entity identity. Separate first publication, changed source data, pointer intent, keyboard activation and restored state. Baseline the first committed record. Run a source effect only on the entity and fields that actually changed. An identical snapshot, theme switch, remount of an existing artifact or unrelated revision must preserve the resting state. Compare pending intent with the owner and expected target ID, consume it once and discard it on interruption. Classify native button clicks with `event.detail > 0` as pointer. Treat keyboard and assistive activation as immediate.

Commit the true value, accessible name, action availability and focus in the first applicable frame. Decorate that committed state. Keep text editable and selectable, and preserve field node, caret, selection, scroll, grants and request identity. Direct drawing, dragging and keyboard navigation track input immediately. When reversing a pointer-triggered animation, sample its visible geometry or opacity before cancelling it. Clean up unfinished effects, observers and callbacks when the owner changes, policy changes or the surface unmounts.

At default speed use the repository enter curve `cubic-bezier(.16,1,.3,1)` and move curve `cubic-bezier(.4,0,.2,1)`. The per-interface instructions specify durations, distances, grouping and exceptions. Follow the existing motion-speed token. Use the live effective app and OS policy. Off is immediate. Under reduced motion remove travel and stagger. Where a section explicitly permits opacity feedback, cap it at 80 ms. If full motion is disabled mid-flight, settle to the latest state immediately. Use the existing `animateTask`, `readMotionPolicy` and `observeMotionPolicy` contracts, and a local cancellation subscription where necessary. Use only the helpers already present at the pinned commit. Keep any additional event marker inside the files you own. Keep one geometry owner. Preserve the existing interruptible spring on measured regions that use it. Reserve a final layout slot before animating its contents.

The supplied 30 fps reference shows the source of the design decisions. During frames 522–555 a slot opens for one resolution commit while earlier rows remain recognizable. During frames 593–632 the test count grows on that same row. During frames 657–678 the Merge control is available as the four validation checks finish appearing. During frames 891–917 the completion accent travels along the affected branch. Apply those relationships to the concrete objects below. Keep the camera fixed. The per-interface milliseconds are implementation targets, with no claim that the recording exposes its CSS curves.

Measure compactness inside the artifact. Keep real PDF margins, image aspect ratios, chart domains, focus rings and source gaps. Remove the specific redundant row, unused track or inherited minimum identified in the interface instructions. Keep touch targets at least 44 CSS px where the component presents coarse-pointer controls. Use the current visual language and existing tokens. Add no decorative headings, filler copy, synthetic metrics or simulated production outcomes.

## First visible generation

The original films started after the UI had settled. Implement the following first-publication details in the owned component and verify them in the new opening sequence. The host’s existing `useArtifactEntrance` marks a genuinely new artifact with `[data-entry-phase="entering"]`. In the catalog, gate the one local effect below on that marker and full effective motion. Use the existing enter curve, zero delay and an absolutely positioned, `aria-hidden`, non-interactive ornament for a new rule or tick. Where an existing mark is named, layer the effect on its artwork. Keep controls, factual content and layout immediately available. At most one treatment per numbered interface may run on first publication. Ordinary additions inside an already present artifact use the change rules in their own section.
For the host surface without an artifact ancestor, use its own event. Baseline the first loaded snapshot, then distinguish a newly published request/plan by its thread and ID, or an explicit inspector-open action. Skip the decoration when restoring the same object.

| UI | Exact first-publication treatment |
| --- | --- |
| 16 | Trace one 8 × 8 px top-left corner of the image frame over 140 ms. Use a decorative 1 px line layered on the existing edge. Place no illustrative pin on the image. A late-loading or revoked image stays on its ordinary immediate path. |
| 17 | Emphasize the first available slot’s existing time-axis mark from opacity .55 to 1 over 120 ms. Slot endpoints and durations are exact on first paint. With no available slot, leave the supplied availability message steady. |
| 18 | Reveal a 12 px segment of the first visible event’s severity rail from top to bottom over 100 ms. Keep timestamp and message anchored. Do not change the selected event or scroll position. |
| 19 | Reveal a 16 px underline beneath the first nonempty lane’s real count over 120 ms. Cards mount at their final positions. Keep card transfer motion for explicit moves. |
| 20 | Emphasize the static first in-source-order edge’s destination arrowhead from .55 to 1 opacity over 140 ms. Keep nodes and connection endpoints fixed. If no directed edge is supplied, omit the treatment. |
| 21 | Reveal the first measured span’s start tick on the time axis over 120 ms. Its bar has the true width from the first frame. Spans with unknown timing receive no invented tick. |
| 28 | On the first published plan for this thread/run, fade just the narrow joining line below the parallel branches from .55 to 1 over 140 ms if that line exists. Existing or restored plans paint directly. A check on a step remains tied to an actual change in accepted status. |

Exercise each positive opening with the delayed fixture publication in its assigned browser spec. Test the same record when already present at bootstrap, an identical republish, and app reduced/off. Count one eligible local start for the positive case and zero on the others. For an absent target, assert zero and verify the usable fallback. Cancel on first input, policy downgrade, source replacement or unmount. Clip only the decorative mark. The existing outer artifact entrance keeps its own transform.

## What the original recordings showed

Use these observations to reproduce each issue. The clips used an authored fixture on commit `4bcdc82a73a28d27d6ebe413a527389119f35292`. Each timestamp is relative to its own MP4. Recheck the behavior on the assigned source commit before editing.

| UI | Original video time | What is visible |
| --- | --- | --- |
| 16 | 00:03.3–00:03.9 | Adding a pin places a numbered marker at the image center and reveals the note editor in the adjacent rail. |
| 17 | 00:03.3–00:03.7 | The 90-minute working session is selected; selection and footer summary update in place. |
| 18 | 00:07.3–00:07.7 | Filtering for checkout-17 reduces the list while the selected error/detail remains visible. |
| 19 | 00:06.2–00:06.7 | The card moves continuously from Ready to In review and neighboring cards make room. A local-move marker and count appear. |
| 20 | 00:06.4–00:06.8 | Focus neighbors dims unrelated content while all node coordinates remain fixed. |
| 21 | 00:13.8–00:15.1 | The legacy adapter selection explicitly says timing is unavailable rather than fabricating a duration bar. |
| 28 | 00:09.4–00:10.0 | A source update changes agent/check progress while the expanded accepted step and reading position remain stable. |

## Verify each interface

1. Before editing, open the named renderer, selector, fixture, and existing tests. Trigger the recorded sequence and save the relevant pre-change screenshot or measured failure. If the pinned version already passes a requirement, record the passing assertion and make only the remaining changes.
2. Run the existing baseline cases using the Playwright configuration stated under the interface. Add the new regression tests in the assigned spec. Repeat the filtered command with `--list` to confirm each new case is collected, run it on pre-fix code, implement the change and run the listed checks again. Repeat your direct interaction. Zero discovered tests, a missing browser or a port error cannot establish a pass. Capture both sides of a decisive transition. When testing mid-flight, wait for the actual active effect or geometry phase, reverse immediately, and assert the final state. Do not rely on an arbitrary sleep to prove causality.
3. Exercise the primary flow at 1440 × 1000 in dark/full motion, at 390 × 844 with light/touch input, at 640 CSS px of measured artifact width, and at native 200% browser zoom. Record the zoomed viewport width and device-pixel ratio. Check the case with keyboard, app reduced, app full with OS reduced, and app off. Interrupt at least one active effect with a policy switch. On a representative long, missing or failed source record, verify wrapping, focus, data identity and continued action access.
4. Run in a separate VM/container so the repository’s fixed browser ports remain isolated. If the four sessions share one POSIX host, put the following function in each worker shell and prefix every browser-test, recorder and browser-based visual-check command with `ui_browser`. It serializes only browser processes that share that host. On native Windows, use an isolated worker VM for browser runs.

```bash
ui_browser() {
  python3 - "$@" <<'PYLOCK'
import fcntl, os, subprocess, sys
with open(f"/tmp/gen-v1-ui-browser-{os.getuid()}.lock", "a") as lock:
    fcntl.flock(lock, fcntl.LOCK_EX)
    raise SystemExit(subprocess.call(sys.argv[1:]))
PYLOCK
}
```

5. Install the required browser and run the targeted commands as written inside your worktree. Reuse a passing full-suite run for sections using that same suite on the same commit. Keep actual exit codes, collected/passed counts, console/page errors, screenshots, and source fixtures. Re-run affected checks after any later change. A baseline failure needs the command, base SHA and original failure signature. Keep distinct evidence for keyboard, restoration, grant revocation, repeated updates and cancellation wherever specified.

## 16. Image annotation

### Files and existing behavior

- `apps/web/src/ExplorationTools.tsx`
- `apps/web/src/exploration-tools.css`
- `tests/e2e/exploration-ui.spec.ts`

Open `ImageAnnotator`, `AnnotationCanvas`, the `.annotation-*` rules and the existing `image pointer coordinates describe the rendered image` test. The source identity already combines grant, thread and resource ownership. The existing rail rises on selection and the empty rail includes a decorative pin icon.

### Implement

1. Keep both existing grid tracks above the existing 650 px container breakpoint. Set the gap to 12 px. Below that breakpoint put the note immediately below the image. Keep the same image wrapper, coordinate reference, intrinsic image sizing and `data-ready` gate. Replace the empty icon block with the single existing sentence `Click the image or add a pin.` in the rail, padding 4 px 0. Keep the rail present in both empty and selected states.

2. Keep the marker hit box at least 32×32 CSS px on pointer and 44×44 on coarse pointer while its visual face stays 26×26. Set the Feedback textarea to three rows, 72 px minimum height, vertical resize and full available width. Align the existing `Pin N` heading and delete button on one row. Grow the textarea from its actual content using `field-sizing:content` where supported and the three intrinsic rows as fallback. Pin creation must leave the measured image rectangle within 1 CSS px of its pre-click rectangle at a fixed viewport.

3. Carry the exact generated pin ID and input cause through the existing local `add` handler. Blank-image click uses the existing normalized, clamped coordinates. Add pin uses the existing center coordinates. Record a one-shot pointer claim before writing the store. On the first render containing that ID, animate only the new marker artwork from scale .92 to 1 for 160 ms, center origin. Remove the present `.annotation-pin[aria-pressed=true]` scale(1.14) transform. Keep the positioned button's `translate(-50%,-50%)` fixed and render its numbered face on a separate inner span. No effect for hydration, keyboard Add pin, reselection, or restored IDs. Consume and clear the claim once.

4. Replace this component’s `useSelectionMotion(value.selectedId)` call. Pointer selection changes `aria-pressed`, title and note immediately. Use 120 ms color on the selected pin and 120 ms opacity .85 to 1 on note content, leaving the textarea mounted across note typing. Retain one textarea and its selection range through unrelated renders. Keep Arrow increments .01 and Shift+Arrow increments .05. Neither causes travel or replay.

5. Delete immediately using a fresh `read()`. Focus the first remaining pin in source order, otherwise Add pin, with `preventScroll:true` after commit. Keep the limit of 32, blank-note validation, 800-character note limit, bounded payload and grant-revocation behavior. Cancel local decoration on deletion, source identity change, unmount or policy change. Reduced/off creation and selection settle immediately.

### Verify

- [ ] Extend the existing image-coordinate test. Capture image and stage DOMRects, click at 25% width and 75% height, type `Move caption`, press Shift+Right on the selected pin and compare stored ≈.30/.75 within pointer rounding. Assert width/height and page scroll stay within 1 CSS px. Verify `Pin feedback` keeps the same DOM identity/caret through an unrelated host publish.

- [ ] Create a second pin, delete it and then delete the survivor. Assert focus returns first to Pin 1 and then Add pin. Reload before removal in a separate fixture and assert restored pins have no running scale animation. Retain the existing revoke/renew/cross-thread cases. At 390×844 assert the note is below the image and neither clips.

```bash
pnpm exec playwright test --config tests/e2e/clarity-schedule-logs.playwright.config.ts tests/e2e/exploration-ui.spec.ts --grep 'image|Image|pin|Pin'
```


## 17. Schedule picker

### Files and existing behavior

- `apps/web/src/ExplorationTools.tsx`
- `apps/web/src/exploration-tools.css`
- `tests/e2e/exploration-ui.spec.ts`

Open `SchedulePicker`, `scheduleLayout`, `slotTime`, `slotDuration` and the existing exact-window/reload and unavailable-slot tests. The interval band currently applies a geometry transition. The row is a native button with option semantics and roving keyboard focus.

### Implement

1. Keep day grouping from the supplied timezone and sort order. Set `.schedule-day` top spacing to 16 px except first (0). Set option padding to 8 px and internal gap to 6 px. Keep title and availability on the first line, and time range plus duration on one flex row with wrap. The `.schedule-interval-ruler` is 24 px tall. Set the absolute band top to 2 px, height 20 px. Use 44 px minimum button height on coarse pointers. Keep the existing narrow single-column fallback.

2. Use the same exact start/end/span computation for labels, inclusive group ruler and band. Set percentage left and width from supplied timestamps in the same render. Remove CSS left/width/min-width decoration that can overstate short intervals. Use no positional animation on initial load, source change, filter or selection. Keep pointer hit area on the option, independent of bar width.

3. Pass explicit cause through `choose`. For a pointer activation on a different available ID, set selection and visible date first. Run a 120 ms border/background response on that option and 100 ms opacity reveal on its single heading check. Keep any selected band glyph static. A keyboard-activated click (detail zero), navigation key, restore or identical re-selection renders final state immediately. Leave unavailable options disabled.

4. Preserve latest-store validation in `submit`. If the selected ID disappears, keep the existing `The selected window is no longer supplied. Choose another.` notice. If it becomes unavailable, keep the distinct unavailable notice, disable proposal in that commit and do not pick a replacement automatically. Keep exact UTC offsets, timezone and user-chosen ID in the existing proposal. Cancel transient effects on retraction, unmount, reduced/off or theme change.

### Verify

- [ ] Extend the existing Design review fixture. Choose the option, reload, submit and assert exactly the existing four-field {slotId,start,end,timeZone} payload. Publish a change to both endpoints and read rendered bar and ruler on the next committed frame. Width and left must equal timestamp-derived ratios within 1 CSS px, with no geometry animations.

- [ ] Exercise Home, End and arrows across the disabled Already occupied option. Assert one focused selectable option, immediate final check and no pointer accent. Make the selected slot unavailable, then remove it. Confirm proposal is disabled and no new action was sent. Use 390×844 for wrapped subject and duration. The option hit height must remain at least 44 CSS px with touch emulation.

```bash
pnpm exec playwright test --config tests/e2e/clarity-schedule-logs.playwright.config.ts tests/e2e/exploration-ui.spec.ts --grep 'schedule|slot|window|narrow reduced'
```


## 18. Log explorer

### Files and existing behavior

- `apps/web/src/ExplorationTools.tsx`
- `apps/web/src/exploration-tools.css`
- `tests/e2e/exploration-ui.spec.ts`

Open `LogExplorer` and its call to `useSelectionMotion(selected?.id)`. The selected payload is mounted conditionally in its keyed event row. `scroll` owns the local event list and Follow is available only in an expanded artifact. Read the existing suppliedLogs fixture and log filter/append tests.

### Implement

1. Keep one toolbar grouping search, level filters and expanded-mode Follow control. Use flex-wrap with an 8 px gap on narrow containers. Keep a single listbox. Set `.log-event` min-height 36 px, 44 px for coarse pointers, with height auto for multiline messages. Respect the existing narrow severity/message column gap. Use existing count heading. Retain readable second-line stream and correlation metadata inside the selected event.

2. Replace the application of `useSelectionMotion` in LogExplorer with immediate conditional detail rendering. Remove the 190 ms rising effect from the payload. For a pointer change to a different valid event only, apply 120 ms selected-row border/background emphasis. Keyboard selection, filter changes, append, restore and repeated selection produce no decoration. Keep event elements keyed by supplied ID.

3. Make the existing correlation value in the selected detail a button when a correlationId exists. Its accessible name is `Filter by correlation <id>` where `<id>` is the supplied correlation ID. Activation sets the existing query field to that exact ID using `save` and immediately recomputes the existing search predicate. Keep the entire raw payload behind the native Event details disclosure. Do not fetch related events.

4. If saved.selectedId exists and is absent from the accepted filtered set, render one local role=status message. Use `Selected event is hidden by the current filters.` if the source still contains it, otherwise `This event is no longer supplied. Select another event.` Keep the action disabled. In submit, re-read source, query, levels and selected ID from the store and reapply the same filtering predicate to that latest event. Dispatch only if it is still visible and belongs to that source. Preserve automatic first selection only when no explicit ID was saved.

5. Retain Follow scroll-to-bottom only when explicitly enabled in expanded mode. Preserve manual cancellation on wheel, touch, scrolling away or keyboard navigation. Appending new events with Follow inactive preserves the reader’s current visible row and offset. Mark cause only on event selection. Unmount, source removal or effective motion-policy change cancels its decoration.

### Verify

- [ ] Extend the suppliedLogs tests. Select `error: The payment worker exited`, open Event details and assert checkout.mjs:42, apply its correlation filter and compare the query and filtered count to source. Change filters until chosen ID is excluded and assert disabled action plus the hidden explanation. Remove that event and assert the separate source-removal explanation.

- [ ] Append ten uniquely identified events at the end while reading an older selected event with Follow off. Assert the selected ID is unchanged, its bounding-box top shifts by ≤1 CSS px and one detail exists. Test 20 ArrowDown/ArrowUp selections and assert no detail travel or delayed selection. Activate Follow, then wheel away and repeat the append. Restore filters and selection through reload.

```bash
pnpm exec playwright test --config tests/e2e/clarity-schedule-logs.playwright.config.ts tests/e2e/exploration-ui.spec.ts --grep 'log|Log'
```


## 19. Workflow board

### Files and existing behavior

- `apps/web/src/WorkObjects.tsx`
- `apps/web/src/work-objects.css`
- `tests/e2e/work-objects.spec.ts`

Open `WorkflowBoard`, `useBoardMotion`, `boardDraftMatchesSource`, `boardProposal` and the board test cases. At the pinned source, a revision or placement change reruns the same spring logic. The presented position can come from an editable draft or from the newly supplied source.

### Implement

1. Set `.workflow-lane` min-height to 128 px, `.workflow-lane-cards` min-height to 82 px and selected detail padding to 12 px. Keep the 82 px empty drop area, existing 170 px minimum inline lane track, source lane ordering and overflow/stack handling. Put title and Move to on one wrapping row, detail below. The footer continues reporting local proposals.

2. Change the local `move` signature to receive `(cardId, laneId, cause)`. Return before effects/store writes when the target lane already contains the card or the source is stale. Use `pointer` for a validated native drop and `keyboard` for Alt+Arrow. For the shared Select, capture pointer down and key down in its local wrapper, including portal-bubbled activation. Consume the last local cause at onValueChange. An unmatched or programmatic cause settles immediately. Do not change the shared Select.

3. Replace the accumulating board spring array with one local transfer owner keyed by card ID and one pending move record containing revision, expected destination and old on-screen rectangles. Capture visual rectangles of visible keyed cards immediately before committing the local pointer move, including transforms still on screen. Cancel active board effects and clear their transforms. After commit remeasure destination rectangles without transforms. If sourceRevision and requested placement match, animate each surviving, visible moved card/sibling from old−new x/y to zero for 220 ms using cubic-bezier(.4,0,.2,1). Skip deltas ≤1 px, offscreen rectangles and identical IDs/positions. Pointer dragging itself stays native. On rapid reversal start from the current visible rectangle.

4. Keyboard move, initial paint, source reload, stale-source detection, reset and remote revision all settle effects immediately. Inflight policy or visibility change must cancel animations and clear transforms even if there is no next move. Restore selected card focus with preventScroll. Integrate only the existing board draft, previous checkpoint and latest-source proposal. Keep `Moved locally` and exact `Send move proposal` copy and never acknowledge a source move from a local drop.

### Verify

- [ ] Extend the existing real pointer drop and keyboard move cases. Use the supplied `Keep retries ordered` card. Compare its first and last rendered rectangles on a pointer transfer. Verify the destination parent and the previous position on the first moving frame. Reverse during active motion. The first position after reversal must be within 1 CSS px of the sampled interrupted position. Its end transform is identity.

- [ ] Perform Alt+Right and inspect the first committed frame. The selected card has focus, no card transform is active, exactly one local move is shown, and the explicit submit payload contains `sourceRevision:'board-7'`, card `retry`, `ready` → `review`. Publish `board-8` while a pointer transfer is moving. Check cancellation, unchanged source, disabled stale submission and recoverable Reset to source. In both policy cases named `app … settles active board motion and preserves keyboard focus`, press Alt+Right and assert no running transform on the first committed frame. Start the in-flight cancellation test with a real pointer drop under full motion, pause the transfer via its Animation handle and sample computed transform. Change app policy to reduced/off, then assert identity and zero active transfers plus focus preservation. Returning to full must not replay it. Replace the existing inline-style nonempty assertion because a WAAPI transform is not an inline style.

```bash
pnpm exec playwright test --config tests/e2e/generated-selects.playwright.config.ts --project=generated-controls tests/e2e/work-objects.spec.ts --grep 'board|Board'
```


## 20. Architecture canvas

### Files and existing behavior

- `apps/web/src/WorkObjects.tsx`
- `apps/web/src/work-objects.css`
- `tests/e2e/work-objects.spec.ts`

Open `ArchitectureCanvas`, `architectureLayout`, `useSelectionHalo` and the finite-perimeter/replacement policy browser tests. Keep this local helper in WorkObjects.tsx. Apply the same backward-compatible signature to the trace caller in section 21 of this prompt.

### Implement

1. Extend local `useSelectionHalo`’s returned handler with `durationMs: number = 360` as its second argument. Keep current per-owner cancellation, theme/policy observer, one disposable inert perimeter element and cleanup. Use 140 ms for architecture, 120 ms for the trace caller and the 360 ms default for every caller that omits the duration. Keep the same 1 px perimeter and token color. Changing duration must not change node dimensions. Use opacity 0 to .65 at 35% then zero on this outline.

2. Route architecture node and connected-node button activation through one local selection function taking node ID and explicit pointer/keyboard cause. Commit source selection and revision using the existing save path. Only a different ID chosen by pointer gets the 140 ms perimeter response. On reselect, still refresh explicit inspection revision after a source update, without replaying the pulse. Remove halo calls from arrow/Home/End navigation. Keyboard activation and neighbor focus update instantly. For keyboard detail opening pass animate=false to the existing MotionRegion. Keep one measured detail region.

3. Leave layout input dependent only on topology and available width. At wide widths retain the connection list beside the selected description. Use a 16 px detail gap and 12 px top padding. Stack copy then connections under the existing narrow container breakpoint. Render the current opposite node label as button text. In its second line use `Outgoing · <edge label>` or `Incoming · <edge label>`. With no label use `Outgoing connection` or `Incoming connection`. Use the edge’s real from/to values. Render `No supplied connections.` when empty.

4. Keep the Focus neighbors mode and the real directed SVG paths with marker endpoints. Preserve state on theme changes. If the selected node disappears hide its detail. If only revision changes keep the detail readable and submitted action disabled until deliberate re-selection of a current node. Clearing or toggling neighbor focus cannot authorize submission. Reduced/off skips the perimeter and conditional CSS transitions.

### Verify

- [ ] Select `Bounded parser` in the existing architecture fixture. Snapshot all node rectangles before/after selecting and after Focus neighbors. An unchanged viewport/topology means maximum difference 1 CSS px per coordinate. For every connected button, compute expected label and direction from suppliedGraph.edges. Click one and verify selected node/pressed state and its different list.

- [ ] Retain the existing shared perimeter disposal tests and update the architecture expectation for 140 ms. Update the current replacement test that calls element.click() on the same node after pausing a halo. This detail-zero activation is a programmatic/keyboard-like reselect. Expect no new halo. For the replacement case use real pointer clicks on Bounded parser then Draft queue, pause the first a fraction into its effect, assert the first Animation.playState becomes idle and only the newest perimeter remains. Retain the unmount disposal check. Keyboard navigate, restore/reload, switch policy mid-play and unmount. No stale overlay is left. Publish a newer revision with the same IDs, verify disabled submit until inspecting a node again, then verify existing exact sourceRevision/nodeId payload.

```bash
pnpm exec playwright test --config tests/e2e/generated-selects.playwright.config.ts --project=generated-controls tests/e2e/work-objects.spec.ts --grep 'architecture|halo|perimeter'
```


## 21. Trace waterfall

### Files and existing behavior

- `apps/web/src/WorkObjects.tsx`
- `apps/web/src/work-objects.css`
- `tests/e2e/work-objects.spec.ts`

Open `TraceWaterfall`, `traceLayout` and `useSelectionHalo` in WorkObjects. The same layout model supplies the ruler and span tracks. Keyboard selection currently routes through the shared halo. Use the same local duration argument implemented in section 20 of this prompt.

### Implement

1. Set pointer row min-height to 40 px and coarse pointer min-height to 44 px on the row, actual treeitem and `.trace-track`. Replace the existing 47 px `.trace-track` minimum so the grid child cannot enlarge its parent. Set detail top gap to 12 px. Keep tabular durations. With an active query or status filter set heading caption to `<visible-count> of <source-total> spans`, counting included ancestors. With neither filter keep `<total> supplied spans`. Preserve unknown-timing rows and the existing patterned `Timing unavailable` label.

2. Keep the existing traceLayout range, zoom, row set and shared label/track-width calculation. Render start, duration, position, precision labels and ruler atomically from each source snapshot. Never tween their left/width or numeric text. Use a marker at the exact supplied start for an actual zero-duration span. Keep its timing label zero and make the marker 2 px wide. For a positive supplied duration use its computed track width, including fractions below 2 px. Remove the two 1 px side borders from positive spans. Draw their outline with an inset box shadow so it cannot impose a 2 px minimum. If either required time is absent, show the existing unavailable treatment.

3. Separate pointer versus keyboard activation in the local select path. Apply the local useSelectionHalo perimeter helper to the selected bar with 120 ms duration for a new ID on pointer activation. A span with no bar gets equivalent local status-color emphasis on its status dot. Remove the pulse from arrows, Home, End, zoom, filter, restore and reselect. Use the existing MotionRegion as the sole detail-height owner, animate=false for keyboard/restore. Preserve the single tree Tab entry, parent-child arrows and explicit pointer collapse semantics.

4. When the same source span changes status, compare old and new status by span ID. Give its label a single 120 ms opacity accent only if it is visible and its status actually changed. Do not render any authority from a local filter. Retain stored revision validation in `submit`. On policy change cancel selection and status effects. Use immediate updates for reduced/off.

5. Retain the current reader anchor on source appends. With the same active tree and existing selected span, preserve focus and its viewport y offset when source data changes before it. Adjust the closest actual scroll owner by the measured offset delta immediately after render, only if native anchoring did not already restore it. Manual filter, collapse, zoom and keyboard traversal use their own intended focus/scroll behavior.

### Verify

- [ ] Run the existing exact-origin and fractional timing cases. Add one zero-duration and one unknown-duration span to the fixture in the test. For a single-line fixture row measure the row, treeitem and track with `getBoundingClientRect().height`. Each must be 40 ± 1 CSS px on desktop and 44 ± 1 CSS px with a coarse pointer. Supply an additional positive duration whose computed bar is between 0 and 2 px. Assert that its width matches the shared scale within 0.1 CSS px. Verify the zero-duration fixture represents 0 ms at exact start, second displays Timing unavailable and no numeric bar. With the recorded five-span scene and Error filter assert `2 of 5 spans` when only one error and its ancestor remain.

- [ ] Extend the filtered descendants case. Select the child, append a different span in a new source revision and assert focus/ID and y offset within 1 CSS px after commit. The selection cannot submit against the newer revision without reselecting. Test pointer pulse, instant arrow traversal and 390 px/44 px coarse-pointer interaction. Preserve the validated numeric zoom and exact ruler/track alignment.

```bash
pnpm exec playwright test --config tests/e2e/generated-selects.playwright.config.ts --project=generated-controls tests/e2e/work-objects.spec.ts --grep 'trace|Trace|halo|perimeter'
```


## 28. Task plan and agent progress

### Files and existing behavior

- `apps/web/src/PlanStatus.tsx`
- `apps/web/src/plan-timeline/TimelineRows.tsx`
- `apps/web/src/plan-timeline/timeline.css`
- `tests/e2e/plan-timeline.spec.ts`

Read the live owner/revision fences in PlanStatus, TimelineStep/AgentLane and the `ReadingPosition` class. `plan-status.css` imports the timeline stylesheet. The existing plan intentionally uses `MotionRegion animate={false}` for agent and step details. Plan counts come from accepted normalized plan data.

### Implement

1. Set `.plan-branches>.plan-agents` to `align-items:start`. Keep its current auto-fit/minmax tracks, agent ordering, border spanning the whole branch group and join after the grid. In the existing ≤520 px container rule set .plan-fact margin-bottom to 8 px and .plan-steps gap to 14 px. Leave each row’s available width, text size and focus targets intact. Allow height to grow with source text. No equal-height cards.

2. Keep the existing normalized completed/accepted count and aria-valuenow/valuetext. Replace width interpolation with a full-width fill using transform-origin:left center and scaleX(percent/100). Apply the final transform immediately on mount/restore/revision correction/thread change. For a new accepted status transition within the same owner, begin a single 160 ms decorative scale interpolation from the current visible progress to the new value. Preserve the exact textual count from the first committed frame. Reversal samples the computed current scale before canceling the previous effect. Reduced/off commits scale and text together immediately.

3. In the keyed step row keep its previous owner/step ID and accepted-or-completed classification. On the first committed render establish a baseline. On pending/running/review/blocked → accepted/completed for the same step, show a single 120 ms local check opacity .6 to 1 on the existing .plan-step-node. A second snapshot, a re-render with new facts, an accepted→completed label change and initial mount already completed all stay quiet. Do not add status effects to every subagent card. Clear on owner change, unmount, reduced/off or visibility loss.

4. Preserve `props.open('step',step.id,step.status)`, manual collapse state and existing stable step/agent keys. Do not derive expanded state from the animation. Keep `ReadingPosition` before/after capture and its updateKey. Jump to current is an explicit user command with immediate scroll/focus and no decoration delay. Preserve last valid plan when the next plan is malformed.

### Verify

- [ ] Extend existing `desktop parallel branches and join`. Use one agent with a short description and a second agent with enough task/facts to span at least three more lines. When the agents share a row, their tops must match within 1 CSS px and shorter bottom is above the taller bottom by at least one full text line. Join top is ≥ tallest bottom. At 280 px pane and 200% zoom assert both source agent IDs remain readable in source order, no horizontal page overflow, no clipped transcript operations.

- [ ] Using `window.planFixture.update` and timelineSnapshot, capture .plan-completion, one step DOM handle, its focus, expanded state and visible anchor y. Publish a newer step completion, repeated snapshot, stale revision, then switch threads and restore. Expect the exact current count each time, at most one accent for a newly completed transition, the earlier expanded choice preserved and anchor displacement ≤1 CSS px. Exercise Jump to current with keyboard. Keep existing invalid-plan, nested-agent, active-thread and replan regressions.

```bash
pnpm exec playwright test --config playwright.config.ts tests/e2e/plan-timeline.spec.ts
```


## Record the review videos

Produce seven continuous dark-theme MP4s. After the scoped tests pass, commit your tracked changes on the working branch. Create the capture checkout with the following commands. When repeating a take, use a fresh capture output directory.

```bash
RESULT_SHA=$(git rev-parse HEAD)
git worktree add --detach "$WORK_RUN/capture-src" "$RESULT_SHA"
cd "$WORK_RUN/capture-src"
test "$(git rev-parse HEAD)" = "$RESULT_SHA"
test -z "$(git status --porcelain)"
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
ffmpeg -version
ffprobe -version
```

Record that SHA. Place all temporary recorder sources under its `scripts/` using the prefix `local-w4-`. Return the private recorder copies with the evidence in this project. Keep them untracked.

| Film | Recorder scene ID | Checked-in scene / subtree |
| --- | --- | --- |
| UI-16 | image-annotator | image-work/annotate |
| UI-17 | schedule-picker | time-offered/root |
| UI-18 | log-explorer | investigation-latency/logs |
| UI-19 | workflow-board | work-objects/board |
| UI-20 | architecture-canvas | work-objects/architecture |
| UI-21 | trace-waterfall | work-objects/trace |
| UI-28 | task-plan | host |

When the original archive is available, use the three TypeScript sources in `Gen-V1-UI-review/recording-scripts/` from the review ZIP. Map generative-review-scenes.ts, record-generative-review.ts and record-generative-adjacent.ts to `local-w4-scenes.ts`, `local-w4-catalog.ts` and `local-w4-host.ts`; fix the relative scenes import. The catalog’s archived recording begins after generation. In its private copy preserve `const initialArtifact=snapshot.artifacts[0]`, set `if (!stills) snapshot.artifacts=[]` before returning the fixture host and keep its existing `publishInitial` helper, wait for the composer textbox named `Message` and assert the page has zero `.artifact` elements, start `recordWindow`, wait 500 ms, then call `host.publishInitial()`. Move artifact, PDF, image, signature and scroll readiness checks after that call. For task-plan, hold back its plan data row at startup; restore and publish it 500 ms after recordWindow starts. For the host copy read OUTPUT from process.env.CAPTURE_OUT and set PORT to 6284; remove the legacy machine path, and stamp the measured git SHA in both manifests. [Original review ZIP](https://chatgpt.com/library?file_id=libfile_e853efaba1cc819188bc47299ccb1228&account_id=personal)

For a source-only session, copy the tracked `scripts/record-task-design.ts` to `scripts/local-w4-catalog.ts`. It already implements publication after capture starts, source-backed controls, PDF/PNG grants, fixture HTTP/SSE and a real Vite App. Replace fixed port 5465 throughout this private copy with 6214. Keep its browser setup, `installFixture`, resource routes and video stop/cleanup. In its scene list clone each mapped entry from `taskDesignScenes()`, set its ID to the recorder scene ID above, and copy only elements reachable recursively through each element’s children from its assigned root (root means scene.spec.root). Replace the full-catalog assertions with per-film checks for the assigned subject. Implement the ordered interactions from this prompt. Preserve fixture action handlers by testing the original source scene ID after the display ID changes. For task-plan import timelinePlan from tests/e2e/plan-timeline-fixture.ts. Set a working task-thread with runId “run-a” and epoch 1. Publish a plan:task-thread data record of provenance harness:plan and revision 1 after recording starts, then in the next revision update the same `build` step from status `working`, state `running` to status `completed`, state `accepted`. Publish and replay the unchanged step once. Keep the owner, run, step and epoch stable. Use the real App region named “Task plan: Improve the workspace”. In the source-only route copy the Vite/browser setup and capture loop into `scripts/local-w4-host.ts`, read `CAPTURE_OUT`, and serve the selected host scene at port 6284.

Before starting the video, put the insertion point in the visible conversation area. Observe the first nonempty published frame with an IntersectionObserver or a sampled DOMRect. Require it to intersect the viewport when its entrance begins. An offscreen entrance followed by an automatic scroll fails the opening. Scroll only for later chapters where the task requires it.

From the root of the disposable capture worktree, initialize a fresh capture directory after creating your private recorder files.

```bash
export CAPTURE_OUT
CAPTURE_OUT=$(mktemp -d "$EVIDENCE/capture.XXXXXX")
```

For both paths, record exactly 500 ms of the ready host before the first fixture publication. In the source-only path, change the tracked seed’s initial 900 ms hold in its private copy to 500 ms. For the host-scene command, read the output directory from `CAPTURE_OUT`. Use per-scene assertions and guard only optional data. An absent required control, empty clip or missing chapter must cause a failing exit. Discard the old minimum total-length padding in the archive and use the 900 ms hold after the actual final result. For a rapid reversal, use raw Playwright input as soon as the first effect is running, ahead of any reading dwell or chapter screenshot. Do not change product timing to make the recording easier.

Run these commands from that worktree. The archived catalog recorder accepts `--port`. In the source-only catalog recorder, replace the fixed server port and origin as directed above before launching.

```bash
pnpm exec tsx scripts/local-w4-catalog.ts --theme dark --port 6214 --scenes image-annotator,schedule-picker,log-explorer,workflow-board,architecture-canvas,trace-waterfall --output "$CAPTURE_OUT/catalog"
pnpm exec tsx scripts/local-w4-host.ts --scene task-plan
```

For either recorder path, update the action sequence to include every implementation section’s film steps. Keep the 1920×1080, 30 fps, real-time compositor recording running through every required action and interruption. Log elapsed event times, wait for observable results, then hold the final stable state for 900 ms. Keep action timing independent of screenshot delays. Package the numbered names below after both the scene assertions and stream validation pass. Save any diagnostic takes separately. Log codec, size, duration, fps, SHA-256 and action timestamps. Decode each complete file with `ffmpeg -v error -i "$film" -f null -`. Inspect opening, changing and settled frames; reject empty or pre-settled openings, element clipping, wrong subject, or a missing action.

### Exact chapters and filenames

| Deliverable | Required action order after the opening |
| --- | --- |
| `16-image-annotator.mp4` | Click at 25% width, 75% height. Type “Move caption”, press Shift+ArrowRight, add a second pin and delete only that pin. Submit Pin 1’s feedback and confirm the fixture received its coordinates and note. Then delete Pin 1 and show focus returning to Add pin. |
| `17-schedule-picker.mp4` | Select the 90-minute Working session, select a different available slot and return. Submit its exact interval. Publish changed endpoints for the same slot ID, show the new interval, then publish that it is unavailable and verify the disabled proposal. |
| `18-log-explorer.mp4` | Select Quantity assertion failed, inspect Event details and filter by checkout-17. While reading that older row append a matching event and confirm the original row stays put. In expanded view enable Follow, append, then wheel away. Verify Follow turns off. |
| `19-workflow-board.mp4` | Move the selected card to In review, reverse it, propose the move again and submit. Publish source acceptance as a separate event. Keep the same card ID. |
| `20-architecture-canvas.mp4` | Select Bounded parser, focus neighbors, restore all, inspect Resource store. Show supplied connection and direction without moving nodes. |
| `21-trace-waterfall.mp4` | Select Parse document, filter Error, restore all, select Legacy adapter. Show source duration, visible ancestor and unknown timing. |
| `28-task-plan.mp4` | Open parallel details, focus an expanded branch, and publish the same build step moving from working/running to completed/accepted. Replay identical values. Keep details and reading position, then explicitly invoke Jump to current by keyboard. |

### Produce the final numbered files

The recorder may emit an unnumbered filename or one ending in `-recording.mp4`. Run this from the verified capture worktree on a successful attempt. It reads each recorder's actual output manifest, copies only the 7 assigned files into a new directory for this attempt, decodes them and writes their metadata. Use that directory for the per-file links.

```bash
python3 - "$CAPTURE_OUT" <<'PYFILMS'
import hashlib, json, shutil, subprocess, sys
from fractions import Fraction
from pathlib import Path

root = Path(sys.argv[1]).resolve()
filenames = {
    "image-annotator": "16-image-annotator.mp4",
    "schedule-picker": "17-schedule-picker.mp4",
    "log-explorer": "18-log-explorer.mp4",
    "workflow-board": "19-workflow-board.mp4",
    "architecture-canvas": "20-architecture-canvas.mp4",
    "trace-waterfall": "21-trace-waterfall.mp4",
    "task-plan": "28-task-plan.mp4"
}
rows = {}
for manifest in sorted(root.rglob("manifest*.json")):
    for item in json.loads(manifest.read_text(encoding="utf-8")).get("captures", []):
        scene = item.get("scene")
        if scene not in filenames:
            continue
        if scene in rows or item.get("failed") or item.get("browserErrors"):
            raise SystemExit(f"Duplicate or failed capture for {scene} in {manifest}")
        rows[scene] = (manifest.parent / item["video"], item)
if rows.keys() != filenames.keys():
    raise SystemExit(f"Missing captures: {sorted(filenames.keys() - rows.keys())}")

output = root / "videos"
output.mkdir(exist_ok=False)
sha = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()
records = []
for scene, name in filenames.items():
    source, item = rows[scene]
    if not item.get("chapters"):
        raise SystemExit(f"Missing chapters for {scene}")
    dest = output / name
    shutil.copyfile(source, dest)
    info = json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(dest)
    ]))
    video = next(stream for stream in info["streams"] if stream["codec_type"] == "video")
    if (video["codec_name"], video["width"], video["height"], Fraction(video["avg_frame_rate"])) != ("h264", 1920, 1080, 30):
        raise SystemExit(f"Unexpected stream in {name}")
    subprocess.run(["ffmpeg", "-v", "error", "-xerror", "-i", str(dest), "-f", "null", "-"], check=True)
    with dest.open("rb") as file:
        digest = hashlib.file_digest(file, "sha256").hexdigest()
    records.append(dict(filename=name, scene=scene, source_sha=sha, sha256=digest,
                        bytes=dest.stat().st_size, codec=video["codec_name"], width=video["width"],
                        height=video["height"], fps=30, duration_s=float(info["format"]["duration"]),
                        chapters=item["chapters"], observations=item.get("observations", []),
                        fixture="Real renderer with authored input and simulated host updates"))
(output / "manifest.json").write_text(json.dumps(records, indent=2) + "\n", encoding="utf-8")
print(output)
PYFILMS
```

Use Python 3.11 or later for this snippet. Return links to the final numbered files. Keep the raw manifests and chapter images alongside the video directory so relative evidence references can be resolved.

## Deliver your branch and 7 videos

Run `pnpm typecheck`, `pnpm lint` and `git diff --check`. Compare changed and untracked product paths against the file lists above. Stage explicit source/test paths and commit the verified changes before capturing. On the final branch commit also run `git diff --check "$BASE_SHA" HEAD` and record the full result of `git rev-parse HEAD`. If all required behavior was present at baseline, use the verified existing SHA. Record videos from that exact commit in the separate capture worktree. Preserve every diagnostic retry in a separate evidence directory.

Return the 7 numbered MP4s listed at the top as individual attachments or direct per-file links. In the evidence directory write `review.md` with one row per clip containing its filename, UI, tested SHA, fixture provenance, chapter timestamps, exact verified outcome and any remaining failure. Include `manifest.json` with filename, SHA-256, byte length, codec, resolution, frame rate, duration and visible component names per file. Include the private recorder sources there for reproduction. Use `ffprobe -v error -show_streams -show_format -of json` on every film, verify H.264, 1920 × 1080 and 30 fps, decode each to EOF, then watch each once at normal speed. Reject footage whose new object is already settled on its first visible frame unless its specified behavior is immediate. Fix a missed interaction or unreadable capture and re-record only the affected film.

In your final response give the branch name, base and result SHAs, changed tracked paths, exact executed checks with pass counts, and links to the videos and review. Identify any inaccessible runtime, skipped gate or unmeasured property explicitly. Fixture recordings demonstrate renderer behavior under the stated source inputs. Report live-model outcomes only when exercised on the real host. Link a local patch when the owner cannot access the branch. Your assignment is complete independently. If a combined commit has already landed through the normal repository workflow, you may rerun your own checks and clips there and label them with that new exact SHA. Branch captures always carry their actual branch SHA.
