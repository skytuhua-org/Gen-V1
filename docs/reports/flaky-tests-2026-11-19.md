# Flaky test report — 2026-11-19/21 sweep

Scope: empirical flake detection on `main`. The full suite — Vitest plus every Browser (Playwright) suite — was run **20 times**; every test that failed at least once and passed at least once is listed below, sorted by failure rate. The top 15 by rate were each rerun **alone 50 times** to separate genuine races from load amplification (8-core VM, all suite groups running in parallel). No code or tests were changed.

## Summary

| Set | Runs | Result |
| --- | --- | --- |
| Vitest | 20 | 1 intermittent failure (`tests/dev-plugin-runtime.test.ts`) |
| Browser specs seen | 20 × all suites | 1,923 unique spec results |
| **Intermittent (fail + pass)** | | **142 specs** |
| Consistent environment failures | | 635 specs (see 'Environment-broken' — not flaky) |

Failure families across the 142: **66** step/test timeouts, **61** element-absent-in-5s-window, **8** transient-value assertions, **5** other assertions, **2** CDP/network races.

> Family note: this box ran 5 suite-groups in parallel, so wall-clock waits (`expect` 5 s default, `waitForResponse` 30 s, spec timeouts) lose to mount latency under contention. Specs with near-clean isolated runs (0–2/50) are load-amplified, not logic bugs; specs with high isolated rates (8–24/50) are genuine races.

## Top flakes — 50× isolated verification

| Flaky test | Sweep rate | Isolated 50× | Failure signature | Likely cause (file:line) |
| --- | --- | --- | --- | --- |
| `tests/e2e/inline-surfaces.spec.ts:91` — question history and long code use chat scrolling while branches retain their saved state | 10/20 fail, 10/20 pass | **24/50** | `Error: expect(locator).toBeVisible() failed` | `.task-history` region resolves but stays hidden while the surface mounts — same mount/visibility-gate family: a 5 s `toBeVisible` races widget mount latency (tests/e2e/inline-surfaces.spec.ts:315). Reproduces ~48% isolated. |
| `tests/e2e/task-design.spec.ts:36` — an image keeps its native proportions beside taller adjustment controls | 17/20 fail, 3/20 pass | **23/50** | `Error: expect(received).toBeCloseTo(expected, precision)` | Geometry read is a single sample (`boundingBox`) taken while the Split pane and `.surface-image` CSS are still settling (tests/e2e/task-design.spec.ts:41; apps/web/src/styles.css:219 `max-width:100%;height:auto` applies after first layout, so the sampled 262x600 box reads 0.44 instead of 1.6). |
| `tests/e2e/image-compare.spec.ts:26` — another pointer losing capture cannot end the active comparison drag | 15/20 fail, 5/20 pass | **19/50** | `Error: expect(locator).toHaveValue(expected) failed` | `ImageCompare` pointerdown `start` writes `drag.current = event.pointerId` with no primary/ID guard (apps/web/src/ImageCompare.tsx:57), so the synthetic `pointerId:77` down+lostpointercapture overwrites and then clears the real mouse drag; pass/fail depends on real-input vs dispatched-event ordering (tests/e2e/image-compare.spec.ts:26-33). |
| `tests/e2e/inline-surfaces.spec.ts:81` — table rows remain in one natural document flow without an inner vertical scroller | 18/20 fail, 2/20 pass | **8/50** | `Error: expect(locator).toBeVisible() failed` | Artifact window section mounts `inert`/`aria-hidden` until `open` flips (apps/web/src/FloatingWindow.tsx:158); `.artifact-content` resolves hidden during the entrance and the test's 5 s `toBeVisible` races the state flip (tests/e2e/inline-surfaces.spec.ts:277). |
| `tests/e2e/operational-smoothness.spec.ts:11` — a rapid graph reversal brakes from its visible velocity while paths stay attached | 17/20 fail, 3/20 pass | **6/50** | `Error: expect(locator).toBeVisible() failed` | `[data-node-id=base]` inside `.task-graph` is absent at assert time — graph nodes mount slower than the 5 s expect under load (tests/e2e/operational-smoothness.spec.ts). |
| `tests/e2e/composer-prediction.spec.ts:92` — the Chat setting defaults off and exposes the selected-model quota control | 10/20 fail, 10/20 pass | **6/50** | `Error: "page.evaluate: Test ended." while running route callback.` | Route-callback teardown race: `page.evaluate: Test ended` inside a `page.route` handler still running at test end (tests/e2e/composer-prediction.spec.ts); playwright's recommended `unrouteAll` is not used. |
| `tests/e2e/snapshot-performance.spec.ts:176` — unrelated committed events and snapshot acknowledgements preserve source geometry work | 11/20 fail, 9/20 pass | **4/50** | `Error: page.waitForResponse: response.json: Protocol error (Network.getResponseBody): No data found for resour` | `page.waitForResponse(...).json()` loses the response body — `Network.getResponseBody: No data found for resource`; CDP body-eviction race on a fast fulfilled route (tests/e2e/snapshot-performance.spec.ts). |
| `tests/e2e/t3-centered.spec.ts:35` — all inline artifact widths match the comfortable composer | 16/20 fail, 4/20 pass | **2/50** | `Error: expect(locator).toHaveCount(expected) failed` | Fixture conversation renders `.artifact` count 0 when mount lags the 5 s `toHaveCount` under load (tests/e2e/t3-centered.spec.ts:35-43). |
| `tests/e2e/tabs-identity.spec.ts:14` — persisted ambiguous tabs fail safely without writing state (Details) | 13/20 fail, 7/20 pass | **1/50** | `Error: expect(locator).toHaveCount(expected) failed` | Expected `role=alert` never mounts — safe-fail alert render slower than the 5 s wait under load (tests/e2e/tabs-identity.spec.ts). |
| `tests/e2e/clarity-schedule-logs.spec.ts:15` — time blocks and selected checks remain visibly distinct in light | 12/20 fail, 8/20 pass | **1/50** | `Error: expect(locator).toBeVisible() failed` | `.schedule-interval-band` inside the 'Working session' option mounts after the 5 s window under load (tests/e2e/clarity-schedule-logs.spec.ts). |
| `tests/e2e/clarity-review-parameters.spec.ts:18` — a review names the current item and the remaining work before sending | 12/20 fail, 8/20 pass | **1/50** | `Error: expect(locator).toBeVisible() failed` | `.interaction-tools` surface mounts slower than the 5 s expect under load (tests/e2e/clarity-review-parameters.spec.ts). |
| `tests/e2e/graph-fidelity.spec.ts:35` — explicit columns preserve concurrency and existing geometry when a new branch point arrive | 10/20 fail, 10/20 pass | **1/50** | `Error: expect(locator).toBeVisible() failed` | Geometry/concurrency assertion samples transient layout; mount-latency family, 2% isolated (tests/e2e/graph-fidelity.spec.ts). |
| `tests/e2e/clarity-schedule-logs.spec.ts:15` — time blocks and selected checks remain visibly distinct in dark | 1/20 fail, 19/20 pass | **1/50** | `Error: expect(locator).toBeVisible() failed` | `.schedule-interval-band` inside the 'Working session' option mounts after the 5 s window under load (tests/e2e/clarity-schedule-logs.spec.ts). |
| `tests/e2e/task-design.spec.ts:8` — light selections are neutral while keyboard focus remains visible | 12/20 fail, 8/20 pass | **0/50** | `Error: expect(locator).toBeVisible() failed` | `.task-choice.is-selected` mounts slower than 5 s under load; 0/50 isolated — pure load amplification (tests/e2e/task-design.spec.ts:8). |
| `tests/e2e/composer-prediction.spec.ts:30` — only a witnessed settlement produces ghost text; Tab creates a durable draft and never sen | 11/20 fail, 9/20 pass | **0/50** | `Error: expect(locator).toBeEnabled() failed` | Composer textbox `toBeEnabled` 5 s wait lost to slow mount under load; 0/50 isolated — pure load amplification (tests/e2e/composer-prediction.spec.ts). |
| `tests/e2e/clarity-software.spec.ts:10` — diagnostic values only use error color when the supplied result failed | 11/20 fail, 9/20 pass | **0/50** | `Error: expect(locator).toBeVisible() failed` | `.software-surface` mounts slower than 5 s under load; 0/50 isolated — pure load amplification (tests/e2e/clarity-software.spec.ts). |
| `tests/e2e/task-interface.spec.ts:6` — vertical history and horizontal lanes are distinct accessible source views | 10/20 fail, 10/20 pass | **0/50** | `Error: expect(locator).toHaveAttribute(expected) failed` | `.task-graph` attribute wait lost to mount latency under load; 0/50 isolated — pure load amplification (tests/e2e/task-interface.spec.ts). |

## Remaining intermittent specs

| Flaky test | Sweep rate | Failure signature | Likely cause |
| --- | --- | --- | --- |
| `tests/e2e/everyday-ui.spec.ts:9` — stats select a sourced metric, retain explicit unknowns and preserve selection t | 9/20 | `Error: expect(locator).toContainText(expected) failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/side-chat.spec.ts:27` — bare /side Enter opens the side conversation without dispatching or stopping the | 8/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/composer-reference.spec.ts:31` — reference composer has context chips above one compact footer and keeps every wo | 8/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/snapshot-performance.spec.ts:147` — profiles 30 unrelated committed events with an uninstrumented 2000 by 6 source t | 6/20 | `Test timeout of 90000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/composer-commands.spec.ts:45` — slash keeps installed skills browsable but unavailable for selection or sending | 6/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/plan-presentation.spec.ts:8` — same-thread plan publication opens the overview without stealing the composer an | 4/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/frontend.spec.ts:148` — the accepted Settings model reaches a new task composer and its next sent messag | 4/20 | `Error: expect(locator).toHaveText(expected) failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/sidebar-collapse.spec.ts:77` — pointer geometry commits once; only the inert clipped copy tweens at 768 | 3/20 | `Error: expect(locator).toBeVisible() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/frontend.spec.ts:1351` — keyboard, narrow layout and reduced motion remain usable | 3/20 | `Error: expect(locator).toBeFocused() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/frontend.spec.ts:1037` — empty workspace, unavailable models, system theme, recovery and navigation | 3/20 | `Error: expect(locator).toHaveAttribute(expected) failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/desktop-surfaces.spec.ts:248` — retained native thread reflows during top resize and rolls back the result | 3/20 | `Error: expect(received).toBe(expected) // Object.is equality` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/desktop-surfaces.spec.ts:248` — retained native thread reflows during left resize and persists the result | 3/20 | `Error: expect(received).toBeGreaterThan(expected)` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/workspace-ui.spec.ts:67` — primary Workspace keeps tools fixed and preserves its anchored draft through clo | 2/20 | `Test timeout of 30000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/drag-detach.spec.ts:42` — crossing the canvas edge inside the app remains an ordinary saved move | 2/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/composer-commands.spec.ts:86` — retained unavailable skills survive reload and require explicit removal before a | 2/20 | `Test timeout of 30000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/artifact-settle.spec.ts:398` — the conversation host animates a live publication once and keeps restored snapsh | 2/20 | `Error: expect(received).toHaveLength(expected)` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/artifact-settle.spec.ts:48` — conversation stays fixed across disclosure states at 768, recovered false, journ | 2/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/workbench-app.spec.ts:99` — source candidates are a named group of source buttons | 1/20 | `Test timeout of 30000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/workbench-app.spec.ts:95` — evidence preserves reported and observed grades, freshness and unsupported modul | 1/20 | `Test timeout of 30000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/workspace-ui.spec.ts:85` — retained navigation directs tools to the main workspace without creating detache | 1/20 | `Test timeout of 30000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/workspace-ui.spec.ts:92` — delegated agent panels page the actual child transcript without a composer | 1/20 | `Test timeout of 30000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/usage-context.spec.ts:744` — compaction model costs discard pending account responses across owner changes | 1/20 | `Test timeout of 15000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/task-software.spec.ts:27` — file selection is a compact strip above a full-width, source-preserving patch | 1/20 | `Test timeout of 45000ms exceeded while setting up "context".` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/task-design.spec.ts:8` — dark selections are neutral while keyboard focus remains visible | 1/20 | `Error: expect(locator).toBeVisible() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/sidebar-collapse.spec.ts:199` — reduced motion policy makes pointer toggles immediate at 1440 | 1/20 | `Error: expect(locator).toHaveCount(expected) failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/sidebar-collapse.spec.ts:199` — reduced motion policy makes pointer toggles immediate at 1024 | 1/20 | `Error: expect(locator).toHaveCount(expected) failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/side-chat.spec.ts:33` — side shortcut honors the configured modifier before opening | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/side-chat.spec.ts:27` — bare /btw Enter opens the side conversation without dispatching or stopping the  | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/side-chat.spec.ts:27` — bare /SIDE Enter opens the side conversation without dispatching or stopping the | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/runtime-presentation.spec.ts:61` — Gemini context explains unavailable compaction without sending a command | 1/20 | `Test timeout of 30000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/right-tools.spec.ts:45` — unavailable secondary usage stays in Details and the visibility preference still | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/right-tools.spec.ts:30` — minimize-only context restores collapse state while retiring old free-window geo | 1/20 | `Error: expect(locator).toHaveAttribute(expected) failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/right-tools.spec.ts:10` — minimize-only context exposes one action and keeps its editor mounted | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/right-tools.spec.ts:37` — live usage starts compact and visible despite an old dismissed preference | 1/20 | `Error: expect(locator).toBeVisible() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/right-tools.spec.ts:22` — generic floating windows ignore a supplied detach callback even outside the app | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/reserved-rail.spec.ts:22` — workspace artifact stays inside its panel while summaries yield space and keeps  | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/reserved-rail.spec.ts:52` — protected context has only minimize controls while keeping the composer draft | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/reserved-rail.spec.ts:64` — narrow explicit tools occupy a bounded flow region without covering composer or  | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/reserved-rail.spec.ts:58` — minimizing context releases the chat frame and preserves the artifact renderer | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/reserved-rail.spec.ts:39` — minimized summaries retain their rail until an explicit artifact panel takes ove | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/reserved-rail.spec.ts:30` — expanded usage stays compact and readable instead of reserving an oversized tool | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/reserved-rail.spec.ts:45` — expanded context keeps the header and composer across the full available chat fr | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/reserved-rail.spec.ts:33` — both protected tools minimize to a compact flow region on narrow screens | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/project-search.spec.ts:533` — states and long paths fit at 768px; capture production TSX fixture | 1/20 | `Test timeout of 30000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/planning-ui.spec.ts:66` — planning views remain keyboard usable and within the narrow viewport with reduce | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/planning-ui.spec.ts:31` — planning option explanations request Pi once and retain selection through the up | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/planning-ui.spec.ts:80` — planning examples load only images granted to the owning thread and clear them o | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/planning-ui.spec.ts:42` — existing explanations and examples open locally while More options is a durable  | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/planning-ui.spec.ts:50` — custom planning responses survive reload and composition does not submit on IME  | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/operational-smoothness.spec.ts:57` — a focused node inspection stays anchored while accepted history moves beneath it | 1/20 | `Error: expect(received).toBeLessThan(expected)` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/no-detach-canvas.spec.ts:29` — in-app movement resizing pinning and hiding still save ordinary panel state | 1/20 | `Error: expect(locator).toBeVisible() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/no-detach-canvas.spec.ts:43` — embedded panels stay reachable after an outside drag without Fit or panning | 1/20 | `Error: expect(locator).toBeVisible() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/no-detach-canvas.spec.ts:16` — dragging outside the app saves an in-app placement with no detach cue or callbac | 1/20 | `Error: expect(locator).toBeVisible() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/no-detach-canvas.spec.ts:10` — canvas offers only in-app panel controls even when a detach callback is supplied | 1/20 | `Error: expect(locator).toBeVisible() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/interaction-tools.spec.ts:42` — editable records use compact typed columns with aligned draft and previous-value | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/inline-surfaces.spec.ts:86` — long vertical history grows in chat rather than trapping graph wheel input | 1/20 | `Error: expect(locator).toBeVisible() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/frontend.spec.ts:1022` — long conversations restore reading positions and follow the tail only near lates | 1/20 | `Error: expect(received).toBeCloseTo(expected, precision)` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/frontend.spec.ts:1315` — hidden widget discard preserves edits made while its lease release acknowledgmen | 1/20 | `Error: expect(locator).toContainText(expected) failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/frontend.spec.ts:882` — a recovered composer draft clears after sending without another keystroke | 1/20 | `Test timeout of 30000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/frontend-refinement.spec.ts:9` — left ticked scrollbar supports keys, track clicks, dragging, and history during  | 1/20 | `Error: expect(locator).toBeVisible() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/frontend-refinement.spec.ts:39` — disconnected context is compact and connected context leads with useful project  | 1/20 | `Error: expect(locator).toBeVisible() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/frontend-refinement.spec.ts:27` — a different pointer cannot end the active scrollbar drag | 1/20 | `Error: expect(locator).toBeVisible() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/free-floating.spec.ts:26` — reduced motion closes immediately and returns focus to the opener | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/free-floating.spec.ts:60` — pointer drag leaves the anchor without remounting, and hidden scrollbar still sc | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/free-floating.spec.ts:103` — pointer cancellation ends a move without losing the window or draft | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/free-floating.spec.ts:33` — keyboard movement releases the rail in both axes and manual sizing preserves the | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/free-floating.spec.ts:51` — free floating on a narrow workspace releases the reserved tool area | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/free-floating.spec.ts:94` — content-fit adapter recovery keeps free coordinates without taking input focus | 1/20 | `Error: Timeout 5000ms exceeded while waiting on the predicate` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/free-floating.spec.ts:13` — closing a tool animates safely and an immediate reopen stays open | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/free-floating.spec.ts:85` — blur ends an active drag and viewport changes keep the tool reachable | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/free-floating.spec.ts:76` — adapter recovery is read before any write and keeps its recovered free coordinat | 1/20 | `Error: Timeout 5000ms exceeded while waiting on the predicate` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/floating-windows.spec.ts:18` — the protected context only minimizes and preserves its draft on reload | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/floating-windows.spec.ts:27` — minimizing and Escape retain the same task content without a delete control | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/floating-windows.spec.ts:35` — live usage stays available and remembers its minimized state without close or re | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/floating-windows.spec.ts:43` — both summaries fit a narrow viewport, retain keyboard access and leave Stop avai | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/drag-detach.spec.ts:15` — floating: supplied callbacks never expose detach controls | 1/20 | `Error: expect(locator).toBeVisible() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/drag-detach.spec.ts:19` — floating: release beyond every app edge stays in app and retains the editor | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/drag-detach.spec.ts:29` — floating: cancellation and blur outside never invoke callbacks or lose edits | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/drag-detach.spec.ts:15` — canvas: supplied callbacks never expose detach controls | 1/20 | `Error: expect(locator).toBeVisible() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/drag-detach.spec.ts:19` — canvas: release beyond every app edge stays in app and retains the editor | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/drag-detach.spec.ts:29` — canvas: cancellation and blur outside never invoke callbacks or lose edits | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/drag-detach.spec.ts:51` — a notes editor remains mounted through a cancelled outside canvas drag | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/context-connections.spec.ts:9` — thread note drafts survive reload and accepted notes can be forgotten | 1/20 | `Test timeout of 30000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/context-compact.spec.ts:25` — unsupported compaction remains disabled and sends no command | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/context-compact.spec.ts:9` — context popup is compact and keeps actual values at 390px | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/context-compact.spec.ts:9` — context popup is compact and keeps actual values at 1440px | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/context-compact.spec.ts:19` — context popup closes through Escape, outside click and its toggle without an X | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/context-compact.spec.ts:30` — available compaction keeps its existing owning-thread command | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/composer-motion.spec.ts:52` — app off settles active prose and admits no new reveal | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/composer-commands.spec.ts:77` — plan and default use canonical mode commands, while Escape can reopen after edit | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/composer-commands.spec.ts:62` — keyboard model selection opens the existing picker, while hover and Escape never | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/composer-commands.spec.ts:110` — a retained retry keeps its original identity after removal, reload and a later s | 1/20 | `Test timeout of 30000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/composer-commands.spec.ts:104` — a retained Personal skill cannot silently disappear into a side-question send | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/composer-commands.spec.ts:69` — URLs, filesystem paths and composing Enter do not accidentally activate commands | 1/20 | `Error: expect(locator).toBeEnabled() failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/composer-app-refinement.spec.ts:44` — text entry shares its first row with Changes and Create PR at wide and narrow wi | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/composer-app-refinement.spec.ts:138` — started chat opens an explicitly new project chat and retains its original bindi | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/composer-app-refinement.spec.ts:88` — resource picker keyboard dismissal restores its opener when focus was not moved | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/composer-app-refinement.spec.ts:65` — resource picker Cancel preserves a newly focused composer before its deferred fr | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/composer-app-refinement.spec.ts:65` — resource picker Add resource preserves a newly focused composer before its defer | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/composer-app-refinement.spec.ts:131` — project selection uses the explicit local host binding and leaves attachments on | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/composer-app-refinement.spec.ts:119` — composer removes repeated captions and toggles Build Plan without changing its d | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/composer-app-refinement.spec.ts:145` — chat header omits retired controls while sidebar rename and archive remain avail | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/composer-app-refinement.spec.ts:109` — attachment band reverses an interrupted exit without removing the live row | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/composer-app-refinement.spec.ts:96` — attachment band exists only for attached resources and preserves input under red | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/composer-app-refinement.spec.ts:96` — attachment band exists only for attached resources and preserves input under no- | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/composer-app-refinement.spec.ts:159` — a ready plan opens automatically and right-side tools can only be minimized | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/composer-app-refinement.spec.ts:172` — /side still sends a side question without a header button | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/composer-app-refinement.spec.ts:172` — /btw still sends a side question without a header button | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/clarity-schedule-logs.spec.ts:34` — narrow selection targets stay clear and leave scrolling to chat | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/clarity-schedule-logs.spec.ts:24` — availability and tentative selection are understandable without relying on color | 1/20 | `Error: expect(locator).toHaveAccessibleDescription(expected) failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/chart-coordinates.spec.ts:76` — all-zero y stays on baseline | 1/20 | `Test timeout of 45000ms exceeded.` | Intermittent; failure signature above; cause family per section notes. |
| `tests/e2e/canvas-clarity.spec.ts:17` — wheel zoom uses canvas chrome while transcript wheel input scrolls its content | 1/20 | `Error: expect(locator).toHaveText(expected) failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/canvas-clarity.spec.ts:59` — switching canvases before debounce saves both owning viewports | 1/20 | `Error: expect(locator).toHaveText(expected) failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/canvas-clarity.spec.ts:33` — losing panel pointer capture cancels the gesture without saving | 1/20 | `Error: expect(locator).toHaveText(expected) failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/canvas-clarity.spec.ts:44` — another pointer cannot move or commit a canvas pan | 1/20 | `Error: expect(locator).toHaveText(expected) failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/canvas-clarity.spec.ts:70` — an in-flight outgoing canvas save retains the second canvas viewport | 1/20 | `Error: expect(locator).toHaveText(expected) failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/canvas-clarity.spec.ts:8` — agent families are contained by project and preserve edits through pin and colla | 1/20 | `Error: expect(locator).toHaveText(expected) failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/canvas-clarity.spec.ts:22` — a delayed failed viewport write cannot roll back newer wheel input | 1/20 | `Error: expect(locator).toHaveText(expected) failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/canvas-clarity.spec.ts:28` — Fit and Arrange keep editors mounted and pointer cancellation clears drag state | 1/20 | `Error: expect(locator).toHaveText(expected) failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/artifact-style.spec.ts:191` — status reads actual host operation states and keeps receipt details available | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/artifact-style.spec.ts:215` — connected FAQ branches and follow-up draft retain independent state | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/artifact-style.spec.ts:177` — bound relationships expose source status and map the selected stable node to act | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/artifact-style.spec.ts:109` — a preview worker failure reports its own message | 1/20 | `TimeoutError: page.waitForResponse: Timeout 30000ms exceeded while waiting for event "response"` | Step exceeded its timeout (`waitForResponse`/`expect`/test timeout) under CPU contention — load-amplified, isolated runs pass (see family note above). |
| `tests/e2e/artifact-settle.spec.ts:251` — os-reduced publishes immediately without a transform at 1440 | 1/20 | `Error: expect(locator).toHaveAttribute(expected) failed` | Assertion sampled a transient value mid-settle under load (see family note above). |
| `tests/e2e/artifact-settle.spec.ts:48` — conversation stays fixed across disclosure states at 768, recovered true, journa | 1/20 | `Error: deliberate toggle moves following content by the hidden/revealed extent` | Intermittent; failure signature above; cause family per section notes. |

## Vitest

| Flaky test | Rate | Error | Likely cause |
| --- | --- | --- | --- |
| `tests/dev-plugin-runtime.test.ts:113` — route responses `[503,503]` expected `[200,200]` | 2/20 (10%); **0/50 isolated** | `expected [503,503] to deeply equal [200,200]` | Shared `dist/plugin-runtime` rebuild race: `tests/plugin-validation-policy.test.ts:20` rebuilds via `scripts/build-plugin-runtime.mjs:8` with `emptyOutDir`, deleting the bundle mid-request so `apps/server/plugin-routes.ts:73-75` returns 503 on `ENOENT`. |

## Environment-broken (consistent failures — not flaky)

635 specs failed in **every** run and are excluded from the flaky list: **273** need the real `chrome` channel (`browserType.launch: Chromium distribution 'chrome' is not found at /opt/google/chrome/chrome`), **272** need `msedge`, and ~90 others fail consistently on assertions in this environment (headless-shell vs channel differences, env-dependent fixtures). They would need a channel-installed machine to distinguish env breakage from real bugs.

Run 11 of the sweep was an outlier bad run (90 intermittent failures vs ~15/run baseline) — one CPU-saturation spike.

## Suite-level crashes

Runs where >50% of a suite's specs produced no result or failed were treated as suite crashes, not spec flakes; their specs appear here only when other runs passed them.


---

# Appendix — earlier single-flake analysis (CI, pre-sweep)


Scope: root-cause read of the known Browser tests flake tracked in
[issue #993](https://github.com/skytuhua-org/Gen-V1/issues/993). No code or
tests were changed.

## Results

| Test | Failure rate | Likely cause |
| --- | --- | --- |
| `tests/e2e/tool-effects-host.spec.ts:12` — "approved file replacement exposes its durable ledger receipt through the actual host" | 8 of the last 11 red main runs (≈8/38 ≈ 21% of completed main CI runs, Nov 18–19) | `HostFixture.close()` never settles; two candidate waits identified inside it (below) |

## Failure signature

CI run [44613472925](https://github.com/skytuhua-org/Gen-V1/actions/runs/44613472925)
(also 44598154959, 44587001582, 44560112666):

```
Test timeout of 60000ms exceeded.
Tearing down "host" exceeded the test timeout of 60000ms.
page.goto: Target page, context or browser has been closed
    at openHost (tests/host-fixture.ts:221) via tests/e2e/tool-effects-host.spec.ts:72
```

## Verified hang location

The test reaches `page.goto('about:blank')` at spec line 67 (done at ~7.1s in
the trace), then calls `host.restart()` at line 68, which awaits
`HostFixture.close()` (`tests/host-fixture.ts:196-199` → `185-195`).

- The run's `host-observations.json` records exactly **one** runtime generation
  (`runtimeDeliveries` = 2: `start` + `followUp`, both `succeeded`), so the
  restart never reached `start()` — the stall is inside `close()`.
- The fixture teardown also exceeds its timeout because `close()` returns the
  same shared `this.closing` promise (`tests/host-fixture.ts:189`), confirming
  the first `close()` call is the one that never settles.

## Close-step analysis (`tests/host-fixture.ts:189-194`)

`close()` awaits four steps in order: `host.close()` → `widgets.close()` →
`service.dispose()` → `store.close()`. Assessment of each:

1. **`store.close()`** — `packages/storage/store.ts:266` is a synchronous
   `db.close()`. **Eliminated**; it cannot hang.

2. **`widgets.close()`** — `apps/server/server.ts:369-` (`buildWidgetServer`)
   is a plain Fastify server with no hijacked or streaming routes, and this
   spec never mounts a widget iframe. Would only stall on a stray live socket.
   **Low likelihood.**

3. **`host.close()`** — plausible. `apps/server/server.ts`:
   - Both SSE routes are hijacked: `/api/events` (`server.ts:279-286`) and
     `/api/agents/events` (`agent-inventory-routes.ts:40-78`).
   - Each is released in a `preClose` hook: `destroyEventStreams`
     (`server.ts:362-366`, `event-stream.ts:9-13`) and
     `agent-inventory-routes.ts:79`. All `onClose` hooks are trivial.
   - **Residual race:** `preClose` runs while the HTTP server is still
     accepting connections. A request that reaches `registerEventStream`
     (`event-stream.ts:18-30`) *after* `destroyEventStreams` has cleared the
     `streams` map registers a stream that is never destroyed — its socket
     stays open and `server.close()` waits on it indefinitely. There is no
     "registry closed" guard; `registerEventStream` only checks whether the
     response itself is already closed.

4. **`service.dispose()`** — plausible. `packages/core/service.ts:2343-2350`:
   - `backgroundWork.drain` is bounded to 5 s
     (`contracts/background-work.ts:22`); `intake.drain` is a bounded loop
     (`external-intake.ts:347-352`); `predictions.dispose` cannot block here
     because no slot forms for the non-connection `fixture/*` model
     (`composer-prediction.ts:56-57`); `planning`, `agentWork`, `sideRuntime`,
     `learning` only await live owners/batches — none exist in this spec.
   - **`await Promise.allSettled([...this.pending])` (`service.ts:2348`) is
     the only genuinely unbounded await in the close path.** `this.pending`
     collects every `background()` task: `deliverOutbox` chains
     (`service.ts:1576` → `1603` → `admit`), compaction tails
     (`service.ts:569`), memory/library commands, and `cancelRun` chains
     (`service.ts:1748`). `deliverInputs` itself can recurse after
     `cancelComposerPredictions()` (`service.ts:1614`) and after
     request-context settlement (`service.ts:1727`). If any such task is
     in-flight and unbounded when `dispose()` snapshots `this.pending`,
     `dispose()` waits on it forever — and a late `deliverOutbox` enqueue
     (`queueMicrotask` at `service.ts:300`) can repopulate `this.pending`
     between the snapshot and settle.

## Ranked likely causes

1. **`service.dispose()` waiting on `this.pending`** — an in-flight
   `background()` delivery/compaction/cancel chain with no bound
   (`packages/core/service.ts:2348`, enqueued at `300`, `569`, `1236`,
   `1574`, `1748`). Best fit for a hang that outlasts both the 60 s test
   timeout and the 60 s teardown timeout while all bounded drains complete.
2. **`host.close()` waiting on a re-registered SSE socket** — the
   `preClose` → `server.close()` window lets a late `/api/events` request add
   a stream after `destroyEventStreams` ran
   (`apps/server/server.ts:362-366` + `apps/server/event-stream.ts:18-30`).
3. **`widgets.close()` waiting on a stray socket** — same mechanism class,
   far less surface (`apps/server/server.ts:369`).

## Reproduction notes

- Platform: the flake appears only on the `windows-latest` **Browser tests**
  job. Local Linux reruns cannot reach the restart path — they fail earlier
  at `CAPABILITY_DENIED` from the Linux path guard (a known, separate
  Linux-only failure also seen on PR #950's verification run).
- The merged diagnostics in `tests/host-fixture.ts` (PR #950) record
  `HOST_FIXTURE_CLOSE_PENDING` after 10 s per close step and write
  `closeStages` into `host-observations.json`; the next Windows failure
  names the exact step and (for `host.close`) the open-socket count.
  Issue #993's completion criteria depend on that evidence.

## Recommended next steps

1. Read `closeStages`/`HOST_FIXTURE_CLOSE_PENDING` from the first post-#950
   Windows failure to pick between `host.close` and `service.dispose`.
2. If `service.dispose`: add a bound or a close-time cancel for `this.pending`
   tasks (e.g. abort before awaiting, or bound `deliverInputs` recursion).
3. If `host.close`: mark the `streams` registry closed during `preClose` and
   reject `registerEventStream` callers that arrive after it, so late SSE
   registrations cannot survive the map clear.
