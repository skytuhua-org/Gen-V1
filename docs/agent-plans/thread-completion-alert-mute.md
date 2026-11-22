# Plan: Mute completion alerts for one thread

## META
- Feature: Mute completion alerts for one thread (medium; proposed labels `feature` + `medium`).
- Repository: `skytuhua-org/Gen-V1`.
- Revision/date: r1, 2026-11-22 UTC.
- Verified baseline: `main` / `origin/main` at `2640b897a42739eba3785fc934af882996c07097`; fresh clone HEAD and remote main SHA matched before research.
- Implementation status: NOT_STARTED. This is a documentation-only plan, not feature code or a claim of feature verification.
- Existing matching issue/PR: none returned by open issue and PR searches for `"Mute completion"`; this narrow search is not proof of absence. Repeat discovery before implementation.
- Related work: [#425](https://github.com/skytuhua-org/Gen-V1/pull/425) is closed/superseded, its body records integration through [#444](https://github.com/skytuhua-org/Gen-V1/pull/444). It governs notification platform scope, not per-thread suppression. Current source, not that historical verification, is the integration baseline.
- Provenance: authoritative feature proposal supplied with this assignment; current main source paths listed below; both external issue bodies read through GitHub API; batch-11 plan examples read from open docs PRs [#1646](https://github.com/skytuhua-org/Gen-V1/pull/1646) and [#1648](https://github.com/skytuhua-org/Gen-V1/pull/1648). Their files are absent on this main; their proposed APIs are not assumed implemented.
- Publication ownership: the user will open the issue and PR. This worker commits/pushes only this full Markdown source and its public-source manifest entry. No issue claim or publication write is authorized by this assignment. For subsequent publication, put this COMPLETE plan in the canonical issue body, not a summary; link the commit-pinned identical file and read back all sections. No Markdown attachment or completed issue handoff is claimed here.

## OBJECTIVE
Silence success banners and sounds from a busy local thread without hiding its Inbox history, failures, or requests for input. A monitor can finish repeatedly without interrupting the user, while another thread's successful completion still follows global notification preferences.

Success means: mute thread A from its row menu, observe no newly eligible completion popup or completion sound for A, find its unchanged unread completion row in Inbox, still receive A's failure/question/approval alerts under normal global policy, and still receive B's completions. Restart preserves A's setting. Unmuting never replays completions consumed while muted; a new completion after unmute is eligible normally.

## REQUIREMENTS
### Agreed scope and flows
- R1: Reversible thread-menu command `Mute completion alerts`, persisted for the exact local thread, default unmuted when the field is absent. Available during a run; no stop/restart or confirmation dialog required.
- R2: Suppress ONLY delivery items whose canonical `kind` is `thread-completed`. Consume their delivery bookkeeping durably, without presenting a banner or sound. Do not classify by status text, title, `state === 'completed'` alone, project, automation source, or active selection.
- R3: Preserve Inbox completion rows, read/unread values, unread count, popup-dismissed value, destination, run identity and history. Mute/unmute is not mark-read, settle, archive, dismiss-popup, or cancel.
- R4: Preserve thread failures (including interrupted-run failure projection), operation failures, approval/review requests and questions. Global Off, focus policy, volume, preview privacy and quiet hours remain authoritative; mute never forces a failure alert through a global suppression rule.
- R5: Other threads, including parent/child/delegate threads in the same project, remain independent. One local host/profile owns the setting, shared by its windows; no project-wide mute, workspace sync, device sync, scheduler policy, schedule classification or bulk controls.
- R6: Unmute does not replay; handle completions observed while muted even if no desktop poll occurs, a delivery exceeds the 30-item batch, the app restarts, or the user rapidly mutes/unmutes. Preserve initial historical Inbox seeding and five-minute delivery freshness rules.
- R7: Implement the complete visual, keyboard, accessible, feedback and reduced-motion design below. No designer dependency is required to begin implementation. The final task sends the finished implementation to the front end team for review.
- R8: Strict boolean validation, transactional persistence, exact target identity, multiwindow consistency, error/retry behavior and race semantics below. Existing unrelated presentation fields and runtime authority are unchanged.

### Decisions and exclusions
- Agreed product scope is above. This plan chooses the new optional name `Thread.presentation.completionAlertsMuted?: boolean`, a stable checked menu label rather than alternating labels, and the existing `thread.presentation` mutation. These are proposed implementation additions, not baseline symbols.
- Delivery claim is the linearization boundary: if mute commits before a completion is claimed, that completion must be consumed silently. If the claim commits first, that already-issued alert may finish presenting once, including its queued/native-window creation path. Mute cannot retract a sound already started. The UI feedback explicitly promises future alerts, not retroactive recall. Tests must exercise both orders; do not silently claim stronger instantaneous cancellation.
- Already-issued desktop cards retain normal expiry/dismiss behavior; v1 does not recall or cancel these cards. Pending host deliveries are not issued cards and MUST be consumed by mute even without a desktop poll. No new desktop cancellation protocol is needed for this defined boundary.
- Muted completion state is local thread metadata, not a global preference and not an OS permission. Preserve #425's browser/Windows delivery explanation. Browser-only builds can edit the setting but do not acquire an OS notification adapter.
- No new browser completion toast, sound player, unread badge type, schedule policy, settings panel or keyboard shortcut. The toggle confirmation toast is explicit user-action feedback, not a completion alert.
- Accessibility/security: no icon-only meaning, no new focusable row subcontrol, no logging of task content, no network service or permission prompts, no new IPC authority for renderers/plugins.
- Performance: use lightweight attention projections and existing entity records; no transcript snapshots or per-thread network queries on notification polls. Retain current delivery/Inbox bounds.

## REPO_MAP
All paths and existing symbols in this table were inspected at the baseline; names marked NEW below are design proposals.

| Area | Verified path / symbol | Relevance |
|---|---|---|
| Thread menu/rows | `apps/web/src/ShellSidebar.tsx`: `ShellSidebar`, local `renderMenu`, `row`, `presentation` prop | Existing pin/unread/settle actions and normal/compact-settled rows. Uses `ActionMenu` and `toast`; do not replace the overlay or nest another button inside a thread button. |
| Mutation caller | `apps/web/src/App.tsx`: `ShellSidebar` `presentation` callback | Calls `command('thread.presentation', patch, item.id)`, schedules `refresh()`, returns boolean; errors set app error and return false rather than necessarily throwing. Extend explicit patch typing where necessary. |
| Contract | `packages/contracts/index.ts`: `Thread.presentation` | Optional pinned/unread/settled/order fields; no completion-mute field yet. |
| Core mutation | `packages/core/service.ts`: `Service`, `thread.presentation` switch case | Strict key/type allowlist, merge-and-put; existing delegate/side restrictions allow this command. No run-busy gate on presentation. |
| Durable projection/delivery | `packages/core/attention.ts`: `AttentionRepository`, private `sync`, `watch`, `read`, `claimDelivery`, `StoredAttention` | `watch` handles runtime.settled/run.failed; `sync` retains history; claims store pending=false and claimedKey before returning delivery. Current claim admits up to 30 fresh items, consumes stale ones. |
| Persistence | `packages/storage/store.ts`: `Store`, `command`, private `commit`, `internal`, `inTransaction`, `attentionProjection` | SQLite `harness.sqlite`, generic JSON `entities`, receipts/events, synchronous BEGIN IMMEDIATE commits. Nested internal/command commits rejected. `attentionProjection` excludes archived threads and avoids transcripts. |
| Delivery types | `packages/contracts/attention.ts`: `AttentionItem`, `attentionItemSchema`, `AttentionDelivery`, `attentionDeliverySchema` | Four canonical kinds: request, operation, thread-completed, thread-failed. No delivery schema expansion needed for the chosen claim boundary. |
| Desktop dispatch | `apps/server/host.ts`: `attentionRead`; `apps/server/desktop-controls.ts`: `handleDesktopControl` | Host attentionRead calls claimDelivery; launch-token parent control message returns it to desktop. Do not expose claims over browser HTTP. |
| Desktop adapter | `apps/desktop/main.ts`: `createAttentionWindow`, `createAttentionPopups` wiring | One main-owned popup coordinator, main-window focus policy, fixed-content BrowserWindow and guarded actions. Not one competing coordinator per renderer window. |
| Popup and sound | `apps/desktop/attention-popups.ts`: `createAttentionPopups`, `isQuietHours`, `attentionPopupHtml` | Poll reads host delivery, deduplicates keys, groups by thread, shows up to three cards, queues bounded cards and renders sound volume. Generated popup script uses AudioContext/createOscillator. Suppression must happen before grouping and sound decisions, in host claims. |
| Browser Inbox | `apps/server/attention-routes.ts`: `registerAttentionRoutes`; `apps/web/src/useAttention.ts`: `useAttention`; `AgentInbox.tsx`, `InboxView.tsx`: `AgentInbox`, `InboxView` | HTTP read/explicit read-unread-dismiss commands, client subscriptions and Inbox display, not raw claims or completion sound/banner production. Leave these rows/unread semantics intact. |
| Global preferences | `packages/contracts/preferences.ts`: `DEFAULT_PREFERENCES`, `getPreferences`, `mergePreferences`; `apps/web/src/Settings.tsx`, `AppearanceSettings.tsx`: `NotificationSettings` | Thread notifications/in-app notifications, volume/privacy/quiet hours; browser scope explanation and explicit Preview sound. Preview remains intentional and audible even if a thread is muted. |
| Shared UX | `packages/ui-shell/ActionMenu.tsx`: `ActionMenu`, `ActionMenuItem`; `Toast.tsx`: `toast`, `Toaster`; `controls.css`, `feedback.css`, `tokens.css` | Checked item already renders menuitemcheckbox, aria-checked and trailing Check. Existing focus navigation, popover placement, toast status/alert and motion tokens. |
| Row style/motion | `apps/web/src/sidebar-context.css`, `appearance.css` | Existing `.thread-pin-icon`, project/title/meta layout, row hover/focus and appearance motion overrides. Add only scoped indicator style; do not change global token definitions. |
| Core tests | `tests/preferences.test.ts`, `attention.test.ts`, `attention-service-lifecycle.test.ts`, `attention-boundaries.test.ts`, `attention-popups.test.ts`, `store.test.ts` | Existing mutation validation/presentation, durable claims, genuine runtime failures, transport authority, popup/privacy/quiet-hours and SQLite coverage to extend/regress. |
| Browser tests | `tests/e2e/sidebar-shared-menu.spec.ts`, `sidebar-shared-menu-fixture.tsx`, `sidebar-shared-menu.playwright.config.ts` | Real sidebar fixture and exact menu inventory assertions; config includes sidebar-compact and caller-handoff projects, Chrome channel, Vite port 5804. Extend existing registered spec, no new config. |
| Global-settings tests | `tests/preferences-presentation.test.ts` | Notification privacy/time inputs; no per-thread mute test yet. |
| Publication | `scripts/public-source-files.json`, `tests/public-source.test.ts` | Add this document in sorted source order; preserve manifest's absent trailing newline. Register any NEW source/test file if later introduced. |

No matching feature implementation was found in the inspected paths. The related docs PRs are open plans, not dependencies. Recheck current main and overlapping notification work in T01; do not assume an open PR's code is integrated.

## DESIGN
### 1. Contract, persistence and mutation
Add `completionAlertsMuted?: boolean` inside `Thread.presentation`; all readers use `=== true` so missing/false are unmuted. Add its exact spelling to the service allowlist; booleans only, rejecting null, strings, numbers, objects and unknown keys before any state/receipt/event write. Preserve empty patch behavior, finite order validation and all unrelated presentation values.

Use the existing `thread.presentation` command and idempotent receipt. Send explicit desired booleans, not a server-side toggle: duplicate command IDs cannot flip twice. New command IDs with the same desired boolean are harmless. Target the menu row's `item.id`, never the selected thread. Presentation changes must not alter updatedAt/order, epoch, status, runId, approval state, runtime model/account or execution custody.

SQLite already stores complete Thread JSON in `entities.body`; additive optional metadata needs no SQL migration, backfill, new table, new settings key or version bump. Old records remain byte-for-byte unchanged until edited. Archive/restore retains the same thread metadata; a genuinely new thread defaults unmuted and does not inherit its parent's preference. Do not propagate to worktrees/projects. Reopening the same profile reloads this value normally. Older builds ignore the extra key; rollback cannot resurrect already consumed delivery keys. Document that rolling back loses the UI/guarantee for future completions, not Inbox history.

### 2. Durable consumption, including short mute intervals
Keep projection and notification eligibility separate. Never filter muted completions out of `sync()`'s returned Inbox items or mutate `item.read`/`popupDismissed`. Consumption writes only `StoredAttention.pending=false` and `claimedKey=item.notificationKey`, using the existing exact delivery key. Failure transition/new failure-key handling is unchanged.

Introduce NEW internal method `AttentionRepository.prepareCompletionMuteChange(threadId)` in `packages/core/attention.ts`; it is not an HTTP API. It synchronizes the current projection then consumes still-pending `thread-completed` records for that exact visible owner before a mute-state transition. Call it from the service mutation within the same command transaction, after payload validation and only when the effective boolean changes, BEFORE replacing the thread's presentation. This fences existing pending successes both when entering mute and when leaving it. Sync must run against the old muted state on unmute, so no pre-unmute success can escape simply because desktop never polled. No-op false on a never-muted thread must not consume its legitimate completions.

Make attention writes transaction-aware: if `store.inTransaction`, execute the put-only writer in that transaction; otherwise use `store.internal` as today. Apply this to sync persistence and the new consumption writer, not by allowing nested commits in Store. Do not call read/claim methods that unconditionally open an internal transaction inside a command. Service may construct an AttentionRepository for this internal operation; no back-reference from attention to Service is required. NEW helper/method names are proposals to implement and test, not existing APIs.

In `sync` after building projected records, mark new or existing pending completions belonging to currently muted visible threads consumed before persisting them. This includes watch-triggered runtime.settled, Inbox reads and startup projection; it prevents completion history recorded while muted from waiting for a later desktop poll. Preserve previous claimed keys and failure records, historical seed behavior, timestamps and identity reconciliation. Since sync currently returns only the newest 1000 Inbox items, transition consumption must cover ALL persisted pending completions of the target owner, not only that returned slice. Do not change the visible Inbox cap.

In `claimDelivery`, keep a defense-in-depth current-thread mute check for every eligible completion. A muted completion enters the consumed writer but never `fresh`; check it BEFORE the fresh.length >= 30 overflow branch, so a batch full of unrelated deliveries cannot defer muted consumption. Preserve stale-item consumption and the 30-item return bound. A missing/deleted/archived owner is never eligible: retain the existing projection visibility boundary and do not reconstruct a delivery from orphaned stored rows. Do not infer thread mute from the global settings snapshot.

The transaction unit is small synchronous local work; do not add awaits or callbacks that return promises inside it. A rejected mutation or write failure rolls back the thread metadata AND pending-key changes, with no success feedback. Add a transaction rollback test to prove this rather than assuming two independent writes suffice.

### 3. Ordering, desktop, multiple windows and errors
| Scenario | Required result |
|---|---|
| Mute commits before claim | Exact thread success consumed durably, no item returned and therefore no card/group/sound. Failures and other owners still returned. |
| Claim commits before mute | Already-issued alert may finish once (including queued or deferred createWindow); existing seen keys and durable claim prevent replay. No recall promise. |
| Complete while muted, no polls, then unmute | sync/watch plus pre-transition synchronization consumes old success; future completion with a new key is eligible. |
| Mute/unmute before any new completion | Pending successes present when mute began stay consumed; unrelated requests remain pending normally. |
| Failure after success or retry | Failure's own kind/key bypasses mute; do not consume a failed operation as a success. New success after unmute can notify once. |
| Crash/reconnect/restart | Consumed keys persist and cannot replay; if mute command never committed, UI must not claim it did. |
| Thread removed/archived between UI and command | Existing ownership/not-found behavior, no resurrected record; refresh row list and show error. Archive/restore uses retained mute flag. |
| Two windows set different states | Same host Store serialization; last committed explicit boolean wins. Every renderer refreshes from canonical state/events. No window-local mute map. Same desired writes are safe. |
| Save response/refresh fails | Do not optimistically claim success before receipt. For receipt failure show error and leave state; for acknowledged write followed by refresh failure show saved-state feedback and reconnect error, reconcile on next refresh rather than blindly toggling back. |

Keep desktop `AttentionDelivery` contract and adapter unchanged unless T01 discovers another real delivery path. Host suppression already precedes `createAttentionPopups`' grouping and `render(sound)`; no duplicated renderer filter. In a mixed batch the sound may play for an unmuted completion, failure or question, never solely because of a muted completion. Empty delivery should create no native window or sound. Keep global quiet-hour rules (including overnight and equal start/end), focus handling, privacy purge, recovery and volume unchanged.

Source inspection found no independent web-side completion banner/toast producer: `useAttention` manages Inbox state, not alerts; explicit global Preview sound is separate. T01 must repeat this search on implementation main. If a new genuine producer exists, route it through the same consumption/eligibility authority, not a localStorage filter. No additional adapter is to be invented for this feature.

### 4. Full visual and animation specification
**Thread menu.** Insert immediately after Pin and before Mark as unread. Use stable visible label `Mute completion alerts`; `checked: item.presentation?.completionAlertsMuted === true`, so ActionMenu supplies role=menuitemcheckbox and aria-checked true/false and its existing 14px trailing Check. Use lucide `BellOff` at 13px as leading decorative icon, with `aria-hidden=true`. Never label it broadly `Mute notifications` (failures/questions still alert). Tooltip/title: `Silence future completion banners and sounds. Failures and requests still follow notification settings.` No shortcut or nested switch. The option stays enabled during active work; temporarily disable only that option while its write is pending. Other thread menus remain usable. Close on activation, preserve shared trigger focus restoration; Arrow/Home/End/typeahead/Enter/Space/Escape continue working through ActionMenu.

**Menu dimensions and colors.** Reuse ActionMenu's 280px anchored popover, viewport clamping, 420px maximum calculated height and scrolling, not a new overlay. `controls.css` supplies 32px minimum (`--ui-row-compact`), 6px vertical/8px horizontal (`--ui-control-inset`) padding, 8px gap (`--ui-space-2`), 4px option radius and 8px popup radius. Inherit menu font, `--text` foreground, `--surface` background, `--border` border, `--selection-bg` checked background and `--hover` hover background. Existing fallbacks are #e6e6e6/#0f0f0f/#282828/#1f1f1f/#262626 respectively; tokens resolve light/dark themes instead of hardcoding these colors. Focus-visible uses 2px `--ui-focus-ring` outline offset -2px; disabled opacity .45. Do not color the muted state red, dim the whole row or hide unread/status markers.

**Muted row indicator.** Add a scoped `.thread-completion-muted-icon` style in `sidebar-context.css`. Render BellOff at 12 by 12 CSS pixels, stroke width 1.5, `flex:0 0 12px`, color `var(--muted)`, with 4px (`--ui-space-1`) logical gap. Place in the normal row's project-chip metadata next to the existing 10px pin; on compact Settled rows place immediately before the title, outside its text-ellipsis span. Do not consume timestamp/status space or overlay the unread dot. Show it persistently, not just on hover; no indicator when unmuted. Keep title truncation and row heights unchanged, including mobile/narrow/sidebar density modes. Both pin and mute may coexist. No standalone icon hit target or tab stop; no new tooltip portal. Add `Completion alerts muted` to the row's accessible label/state text and native title description, with icon aria-hidden=true, so color/icon shape is not the only signal. Do not replace existing status/working/failed text or add repeated announcements on hydration.

**Feedback.** After acknowledged successful save use existing `toast` with tone info and 6000ms lifetime: `Future completion alerts muted for “<title>”. Failures and requests still follow notification settings.` For unmute: `Completion alerts unmuted for “<title>”. Earlier completions will not replay.` No Undo button (menu is reversible; avoids stale inverse actions across windows), no sound, focus steal or modal. On false return or thrown save error, show one error toast `Could not save completion alert preference. Try again.` and no success toast; the App callback currently returns false on failure, so catching alone is insufficient. Avoid duplicate app-error/toast announcements where practical, but preserve canonical error reporting. Use text rendering, never HTML from a thread title. Existing Toaster status/alert roles announce results and pause expiry on hover/focus.

**Motion.** No bell ringing, pulsing, spinner, row displacement or success celebration. Menu keeps existing shared popover motion: `--ui-motion-popup-enter` 180ms and exit 140ms with `--ui-ease-enter`; hover color follows `--ui-motion-hover` 120ms where shared controls animate. New indicator may fade in opacity over `--ui-motion-status` 160ms using `--ui-ease-move`, never scale/slide; removing it is immediate to avoid delayed state semantics and layout remains stable. No entry animation on initial load or cross-window hydration. Toast reuses existing 200ms enter/160ms exit tokens and feedback styles. Respect appearance.css motion speed/reduced/off policies and OS prefers-reduced-motion: new indicator transition duration 0ms for reduced/off or OS reduced motion; no new transform animation. Do not override shared accessibility motion rules or alter global tokens for this feature.

**Visual acceptance.** Verify dark/light, checked/unchecked, hover/keyboard focus/pending/error, normal/compact Settled/pinned/working/failed rows, long titles, 320px narrow viewport and 1280px desktop, compact/touch density, OS reduced and app motion off. Row does not jump; focus ring remains visible and popup never becomes translucent over content. Screen reader announces checked state, row mute state and result once, while failure/unread semantics remain intact.

## EXECUTION_DAG
Execute in order; one implementation owner at a time for shared files. All tasks are NOT_STARTED. Every task consumes this revision and prior task evidence; no feature work is authorized by this planning commit.

### T01 — Rebase and verify integration boundaries
- Prerequisites: maintainer approval, full canonical issue/plan/journal read and ownership claim per AGENTS.md. Input: baseline map and current main.
- Steps/files: verify `Thread`, service presentation validation/transaction wrapper, Store visibility/commit rules, host/desktop claim dispatch, popup sound, global preferences, web Inbox and any additional banner/toast producer. Search for thread.presentation writers and explicit patch typings; inspect current sidebar fixture and motion overrides. Refresh matching issues/PRs and #425 integration before editing.
- Output/ownership: read-only findings plus exact updated SHA, overlapping owner coordination and any material plan revision. No guessed modules. If delivery ownership changed, block T02 until revised design is recorded.
- Tests: positive trace from host read to claim to popup/sound; negative disproof search for a separate browser completion producer; empty legacy presentation record read. No feature pass claimed.
- Done/handoff: each map entry still resolves and scope/race boundary accepted; hand to T02.

### T02 — Add metadata and atomic presentation transition
- Depends T01. Inputs: existing JSON Thread storage and validated mutation; output: additive boolean plus transaction-safe attention transition API.
- Edits: `packages/contracts/index.ts`, `packages/core/service.ts`, `packages/core/attention.ts`; extend `tests/preferences.test.ts`, `tests/store.test.ts` only where persistence regression needs it. Keep Store's transaction API/SQL schema intact.
- Implement optional field, strict boolean validation, merge preservation and NEW prepareCompletionMuteChange with transaction-aware writes per DESIGN 1–2. Validate before projection work. Do not land the contract separately from consumers in another PR.
- Tests: true/false/missing/empty patch; malformed/unknown payload no event/receipt; idempotent command; working/side/delegate ownership; archive/restore; reopen actual Store file; rollback injected write failure preserves both preference and delivery pending state. Pin/unread/order/runtime untouched.
- Done/handoff: focused mutation/store tests pass and no nested transaction workaround exists; hand to T03, same owner retains attention.ts until complete.

### T03 — Enforce durable completion-only suppression
- Depends T02. Input: transaction-safe transition and canonical kinds. Output: silently consumed muted completions with intact history.
- Edits: `packages/core/attention.ts`, `tests/attention.test.ts`, `tests/attention-service-lifecycle.test.ts`; regress `tests/attention-boundaries.test.ts`. Extend actual runtime callbacks fixture rather than only manual completed-thread insertion.
- Implement sync-time consumption, all-persisted-target transition consumption and claim defense before overflow. No HTTP/IPC expansion. Preserve fresh/seed behavior, exact failed-run identities and Inbox read/unread/operation authority.
- Tests: A muted/B unmuted success; mixed failure/question/review; no items; muted before claim vs claim first; muted settle returning ready; no poll then unmute; no watch then unmute completed state; >30 mixed deliveries and >1000 stored history; stale delivery; repeated read/reconnect/repository restart; archive/removal; rapid toggles; failure after success; new completion after unmute. Assert unchanged Inbox fields and unread counts, not just returned items.
- Done/handoff: tests prove R2–R6/R8 and bounded claim behavior, no transcript snapshot; hand to T04.

### T04 — Implement menu, row indicator and acknowledged feedback
- Depends T03. Inputs: persisted boolean and complete visual spec. Output: reversible UI, both row variants and no optimistic false-success.
- Edits: `apps/web/src/ShellSidebar.tsx`, `apps/web/src/App.tsx` if needed for explicit patch typing/receipt reconciliation, `apps/web/src/sidebar-context.css`; extend `tests/e2e/sidebar-shared-menu-fixture.tsx` and registered `sidebar-shared-menu.spec.ts`. Reuse shared ActionMenu/Toast; no global token/shared type churn beyond required Thread field.
- Implement checked item, non-selected owner targeting, pending deduplication, row label/indicator and toasts for boolean false as well as exceptions. Refresh canonical state across windows; use the existing subscription/refresh path, not localStorage. Do not reorder rows or mark read.
- Tests: keyboard/pointer toggle twice, exact owner/payload, checkmark/aria state and row text, missing field, long/empty title fallback matching existing row behavior, compact Settled and pinned variants; failed/deferred write, failed refresh and second-window newer state. Update exact menu inventory assertions to include checkbox separately, not weaken assertions.
- Done/handoff: UI matches DESIGN 4 and old menu actions still work; hand to T05.

### T05 — Adapter, browser and real-user validation
- Depends T04. Input: frozen implementation and unit evidence. Output: regression and visual/accessibility evidence, not product scope expansion.
- Edits/tests: extend `tests/attention-popups.test.ts` with host AttentionRepository-backed read fixture so tests prove muted records never reach sound/grouping; use existing sidebar browser spec/config and run listed regression files. Desktop production adapter needs no change for this design; if changed by discovery, add corresponding tests and update plan.
- Positive: mixed batch permits failure/B sound/card, A success remains in Inbox; subsequent unmuted new A run alerts. Negative: only muted success creates no window and no sound; global Off/quiet hours still suppress failure, preview privacy and recoverable createWindow errors unchanged. Empty delivery and deleted owner are quiet.
- Exercise two renderers attached to same local host with opposing explicit writes; record last committed state in both after refresh. Browser fixture evidence alone is not proof of host multiwindow persistence. Use actual reopened SQLite profile integration tests plus supported Windows desktop source build for audible/focus checks.
- Collect screenshots and screen-reader notes for DESIGN 4 matrix; test real muted/unmuted synthetic completions, failure and input request on Windows with no live provider/private data required. Include race already-claimed-once behavior. Record versions, commands, counts and any unavailable environment; an unavailable Windows check remains pending.
- Done/handoff: all acceptance rows below have evidence, failures resolved, documentation describes local-only scope and claim boundary; hand to T06.

### T06 — Final task: send finished work to the front end team for review
- Depends T05. Input: completed implementation PR, exact plan revision, commit-pinned source, tests and screenshots; this docs-only plan is not that deliverable.
- Send the finished work to the front end team for review through the canonical issue/implementation PR. Include checked/unchecked/error/pending row/menu states, themes/narrow/compact/touch and reduced-motion screenshots, keyboard/screen-reader findings, exact check outputs, supported Windows sound/focus result, race boundary and remaining release gates.
- Ask review against the fully specified DESIGN 4; do not ask them to invent the initial design. No new code scope outside resolving review findings; rerun only affected checks after fixes.
- Positive: explicit receiver acknowledgment and approval after findings resolved. Negative/empty: absent reviewer, no response or rejected state remains HANDOFF_PENDING/BLOCKED, not reviewed. Done when explicit front end acceptance is recorded; recipient front end team, then maintainer for normal merge/release. Do not self-approve, merge or close issue without authority.

## VALIDATION
### Planned implementation commands
Run from repo root; use Node 24 (`.nvmrc`) satisfying package engines and pnpm 10.30.3 (`packageManager`). Chrome is required by the scoped browser config; Playwright Chromium alone does not provide channel chrome. Install prerequisites per CONTRIBUTING/getting-started, never change CI to bypass a missing browser.

```sh
source ~/.nvm/nvm.sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm build:widgets
pnpm exec vitest run tests/preferences.test.ts tests/store.test.ts tests/attention.test.ts tests/attention-service-lifecycle.test.ts tests/attention-boundaries.test.ts tests/attention-popups.test.ts tests/preferences-presentation.test.ts --maxWorkers=1
pnpm typecheck
pnpm build
pnpm exec playwright test --config tests/e2e/sidebar-shared-menu.playwright.config.ts
pnpm lint:ui
pnpm test:ui-guard
pnpm exec vitest run tests/public-source.test.ts
pnpm check:docs-links
```

All test paths above already exist; extend them rather than invent an unregistered e2e command. Config runs sidebar-menu and caller-handoff projects to catch unchanged App integration actions. Fixture-only UI tests cannot prove real sound absence: the host-backed popup test must assert no createWindow/render(sound), and Windows manual validation separately checks audible behavior. Use fake clocks for freshness/quiet hours and deferred promises for claim-before-mute/native-creation races; do not rely on sleeps.

### Acceptance matrix and evidence
| Requirement | Tasks | Check/evidence |
|---|---|---|
| R1 local reversible/default | T02,T04,T05 | Missing field unmuted; exact desired true/false payload and reopened SQLite persistence; same owner across windows. |
| R2 consume without banners/sound | T03,T05 | No returned completion, durable claimedKey, host-backed adapter no window/sound; mixed batch retains other signals. |
| R3 Inbox/unread retained | T03,T05 | Compare item ID/kind/read/popupDismissed/destination and unread before/after; Inbox completion still visible. |
| R4 failures/requests/global rules | T03,T05 | Genuine runtime error, failed operation and pending question/review still eligible; quiet/Off/privacy/focus regressions pass. |
| R5 independent thread/local scope | T01,T02,T03,T05 | A/B and parent-child fixtures; no new global/schedule/workspace-sync behavior; #425 explanation unchanged. |
| R6 no replay/edge ordering | T02,T03,T05 | No poll/rapid unmute, restart, >30 and >1000, archive/delete, fresh/stale/seed and both linearization orders. |
| R7 full UX/a11y/review | T04,T05,T06 | Exact menu checkbox assertions, row states, screenshots, focus/screen reader, reduced/off motion and front end explicit acceptance. |
| R8 validation/error/authority | T02,T03,T04,T05 | Invalid/no-op/duplicate/rollback tests, failed save feedback, canonical multiwindow refresh, no new claim endpoint. |
| Performance/privacy | T01,T03,T05 | Lightweight projection regression remains; no transcript snapshots, no new content logs or permission prompts. |

Release gate: all focused tests/type/build/UI checks and relevant CI pass; supported Windows behavior and visual/accessibility evidence recorded; explicit T06 front end approval; maintainer normal review/merge. Keep implemented, mock-tested, visually verified, reviewed, merged and verified-on-main distinct.

### Documentation-only execution and publication audit
This planning delivery runs only `source ~/.nvm/nvm.sh && pnpm install --frozen-lockfile --ignore-scripts && pnpm exec vitest run tests/public-source.test.ts && pnpm check:docs-links`, plus diff/content/source-reference review. Actual outcomes are in the delivery report, not preclaimed here. No feature tests or UI rendering are executed for planning.

Before commit, ensure every R maps to a task and evidence above; every task has dependencies, files/discovery, output, positive/negative/empty cases, done-when and recipient. Verify UTF-8, no literal backslash-u escapes, two changed files only, sorted manifest insertion with no trailing newline, no implementation or generated evidence committed. At user-owned issue publication, copy the entire file into the issue body, include the SHA-pinned file link, read back body/file section-by-section and mark HANDOFF_COMPLETE only after parity verification. A repo file is not an uploaded attachment; issue publication/readback and PR review remain pending until the user performs them.

## STATE
- Researched/decided: baseline source map; optional per-thread boolean; sync/claim/transition consumption; explicit claim-first race exception; no desktop transport expansion; full visual and motion design; unit/e2e/manual review gates.
- Implemented feature: NONE. Verified feature: NONE. T01–T06 NOT_STARTED. Windows/audio, screenshots, real multiwindow UI, screen reader and front end review NOT_RUN.
- Documentation owner: current planning worker on `devin/1795307141-plan-thread-completion-mute`; implementation owner unassigned. This branch is docs-only, not merged or released.
- Publication: issue/PR creation deliberately left to user. No claim, assignee or in-progress label was created; no release comment is needed for a nonexistent claim. No issue-body readback or Markdown attachment is claimed.
- Risks: nested transaction mistakes; short muted intervals without polls; overflow/history truncation leaving replayable keys; stale UI success feedback; mistaking state for kind; misunderstanding already-issued alert boundary. T02/T03 test these explicitly; T06 reviews the user-facing promise.
- Exact next step: user opens reviewed docs PR and canonical issue with complete plan; implementing agent reads all plan/journal, rechecks current main/ownership in T01 and records any revised paths before editing. If product owner wants recall of pre-mute claimed/queued alerts, revise this plan with a cancellation protocol and new transport tests BEFORE implementation; that stronger guarantee is not silently assumed here.

## REFERENCES
- [Verified baseline](https://github.com/skytuhua-org/Gen-V1/commit/2640b897a42739eba3785fc934af882996c07097).
- [Claude Code #105455](https://github.com/anthropics/claude-code/issues/105455), open when read: long-lived listener re-arms Monitor every 30 minutes, creating repeated task-complete OS banners; asks per-session mute while questions/permissions can still notify. Its optional scheduled-task/tool flag is NOT included in this v1.
- [Codex #27022](https://github.com/openai/codex/issues/27022), open when read: macOS automation completion noise versus useful interactive alerts; requests independent suppression and suggests richer failure/meaningful-change policies. This plan adopts only explicit per-thread completion suppression, not automation detection or a schedule policy. These are user-reported competitor requests, not Gen reproductions.
- [Notification scope #425](https://github.com/skytuhua-org/Gen-V1/pull/425): closed as superseded, records integration via #444; browser controls must not request nonexistent system-notification permissions. Per-thread suppression is orthogonal.
- [Batch-11 bookmarks plan PR #1646](https://github.com/skytuhua-org/Gen-V1/pull/1646), file `docs/agent-plans/browser-bookmarks.md` on its head branch; [viewed-files plan PR #1648](https://github.com/skytuhua-org/Gen-V1/pull/1648), file `docs/agent-plans/changes-viewed-files.md`. Read for structure/depth, not baseline implementation facts.
- Instructions: [AGENTS.md](../../AGENTS.md), [CONTRIBUTING.md](../../CONTRIBUTING.md), [getting started](../getting-started.md), [PR template](../../.github/pull_request_template.md).
- Core sources: [Thread/service contracts](../../packages/contracts/index.ts), [service mutation](../../packages/core/service.ts), [attention](../../packages/core/attention.ts), [delivery schemas](../../packages/contracts/attention.ts), [Store](../../packages/storage/store.ts), [global preferences](../../packages/contracts/preferences.ts).
- Delivery and UI: [desktop popup/sound](../../apps/desktop/attention-popups.ts), [desktop wiring](../../apps/desktop/main.ts), [host](../../apps/server/host.ts), [attention routes](../../apps/server/attention-routes.ts), [sidebar](../../apps/web/src/ShellSidebar.tsx), [App caller](../../apps/web/src/App.tsx), [Inbox hook](../../apps/web/src/useAttention.ts), [Inbox view](../../apps/web/src/InboxView.tsx).
- Design: [ActionMenu](../../packages/ui-shell/ActionMenu.tsx), [controls CSS](../../packages/ui-shell/controls.css), [tokens](../../packages/ui-shell/tokens.css), [Toast](../../packages/ui-shell/Toast.tsx), [feedback CSS](../../packages/ui-shell/feedback.css), [sidebar CSS](../../apps/web/src/sidebar-context.css), [appearance](../../apps/web/src/appearance.css).
- Tests: [preferences](../../tests/preferences.test.ts), [attention](../../tests/attention.test.ts), [runtime lifecycle](../../tests/attention-service-lifecycle.test.ts), [boundaries](../../tests/attention-boundaries.test.ts), [popups](../../tests/attention-popups.test.ts), [sidebar e2e](../../tests/e2e/sidebar-shared-menu.spec.ts), [scoped config](../../tests/e2e/sidebar-shared-menu.playwright.config.ts).
