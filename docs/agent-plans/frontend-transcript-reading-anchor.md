# Transcript reading position and keyboard continuity

## META

| Field | Value |
| --- | --- |
| Repository / revision / date | `skytuhua-org/Gen-V1` / `FRONTEND-ANCHOR-R1` / 2026-11-25 |
| Verified baseline | `main@96ca4c3bd0664fca53775fbe31915c209641986c`; refreshed main still matched during research |
| Parent / child | [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212) / [#2218](https://github.com/skytuhua-org/Gen-V1/issues/2218) |
| Documentation branch | `docs/frontend-continuity-plans`, based on the verified main SHA |
| Planning owner | `codex-cloud-anchor-dcd8eb`, X04-anchor docs only, [claim](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7167924677), under [parent extension 006](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7167827229) |
| Implementation status | `NOT_STARTED`; no product edits or product/runtime/native tests executed for this plan |
| Provenance | Pinned source/tests, repository instructions, current issue/PR overlap review, CSSWG and Atlassian primary references. Findings are source-derived until reproduced. |

## OBJECTIVE

Keep a reader's message boundary in place while earlier content changes height, and retain keyboard continuity when the final history-page control disappears. Preserve the existing scroll controller, tail following, explicit navigation and mounted state.

The main chat disables native anchoring. Its controller retains absolute `scrollTop` after leaving the tail; its resize callback only follows the tail. Earlier-message growth can therefore move the message being read without changing that number. Existing browser tests grow one content box and cannot detect this displacement. Exhausting history also removes the focused Load earlier messages button without a handoff. The separate optional `ConversationPane` already demonstrates ID/offset anchoring and guarded history focus recovery.

Success: an eligible message boundary returns within 1 CSS pixel of its prior scrollport offset after reflow, with no animated correction, focus change or tail snap. Below-boundary additions cause no compensating write. A history button that remains keeps focus; a removed final-page button gets one guarded `preventScroll` handoff inside the transcript.

## REQUIREMENTS

| ID | Required outcome |
| --- | --- |
| R01 | Preserve a visible message ID and block-start offset during earlier-message growth/shrink, delayed image sizing and width reflow, including position changes with unchanged total extent. |
| R02 | One controller owns scroll writes. Explicit Find, bookmark/prompt navigation, restore, prepend, manual scrolling and Jump to latest invalidate pending automatic correction first. No native/application double compensation. |
| R03 | Only the current visible main owner supplies anchors. Exclude retained hidden threads, inert/aria-hidden ancestors, disconnected/zero-rect nodes and nested unrelated transcript owners. Stale work cannot affect another view. |
| R04 | Wheel, touch, native/rail drag, scroll keys and newer navigation cancel stale work immediately. Preserve pointer ownership, near-tail rules and duplicate-scroll suppression. Persist accepted correction in the existing per-thread in-memory position map before switching owners. |
| R05 | If the anchor disappears, prefer its saved next neighbor, then previous. If none survive, retain current clamped top and recapture; never jump to an old owner or tail. |
| R06 | Recover final-page keyboard/assistive focus only if the initiating button still owned focus immediately before removal and no newer intent/owner intervened. No stealing on nonfinal pages, failure, Find-triggered paging or user departure. |
| R07 | Automatic correction is immediate under Full/System/Reduced/Off. It uses no motion token/spring; preserve existing authorized tail/explicit-navigation motion and immediate input/Send/Stop. |
| R08 | At most one queued compensation callback per owner; batch reads before a write; no perpetual frame loop, per-message observers, deep-mutation observer rebinding or full message scan per streamed byte. |
| R09 | Preserve DOM keys, drafts, text selection, Find query/index/focus, history cache/authority and error behavior. No host/schema/storage migration, new network access or third-party dependency. |
| R10 | Validate actual main-chat geometry and keyboard behavior; refresh overlapping ownership/PRs, record exact versions and publish factual browser/native evidence. |

Scope: main chat controller and history/navigation integration. Excluded: virtualization, a scrolling framework, Inbox/list selection, motion-system/timing work, new history-fetch semantics, bookmark/prompt features, and word-level restoration inside an independently rewritten message. The contract is message-boundary stability, including a tall message whose top is above the viewport. Scoped conversation behavior is a precedent/regression, not a second implementation target.

## REPO_MAP

All baseline paths were inspected. Proposed APIs in DESIGN do not exist on that baseline.

| Path / symbols | Existing behavior / edit boundary |
| --- | --- |
| `apps/web/src/conversation-scroll.ts`: `ConversationPosition`, `ConversationAnchor`, `createHistoryAnchor`, `createConversationScroll` | `{top,tail}` positions and one-shot `{height,top}` prepend anchors. `follow()`/resize only adjust while following. Keep this owner and compatible existing methods/types. |
| Same: `observeConversationExtent` | Viewport/immediate-child resize and deep child/text mutation scheduling; deep mutations do not rebind observations. Preserve its 500-mutation regression. |
| `apps/web/src/App.tsx`: `readingPositions`, `conversationMotion`, `captureHistoryAnchor`, history button/message rendering | Main effect consumes prepend geometry; rows have `data-message-id`; other dirty-thread wrappers remain mounted `hidden`. Find uses `activeHistoryControl`. Add narrow root/focus/navigation wiring without restructuring App. |
| `apps/web/src/styles.css`: `.conversation-scroll`; `ChatScrollIndicator.tsx` | Native anchoring disabled; App scrollport already focusable/named Conversation. Rail uses manual-scroll methods. Keep existing style/gesture semantics. |
| `apps/web/src/ConversationFind.tsx`: `jump`, `onNavigate` | Direct scroll write precedes after-callback. Add/reuse before-navigation seam; retain highlights/query/index and scan scheduling. Find's history action programmatically clicks the main control, then focuses its own input. |
| `apps/web/src/registry.tsx`: `Image`; `styles.css`: `.surface-image` | Existing artifact image uses lazy loading and auto height; use this real component for delayed intrinsic-size fixtures. Read-only reference, no registry edits. Main Markdown does not render image syntax. |
| `apps/web/src/conversation-workspace/ConversationPane.tsx`: `remember`, `restore`, `focusAfterRead` | Already stores ID/offset and restores on resize; has guarded pagination focus. Reference only; do not copy a second controller into main. |
| `tests/conversation-scroll.test.ts`; `tests/e2e/conversation-scroll.spec.ts` and matching `.playwright.config.ts` | Existing tail/intent/pointer/restore/policy/cleanup tests; browser fixture is one height box. Add multi-message geometry, preserving numeric-top checks for below-anchor growth. |
| `tests/e2e/conversation-find.spec.ts` and matching config; `scripts/capture-ui/shell-api.ts` | Synthetic actual-App fixture, history beyond 100, Find/draft/owner switching. Reuse for integrated reflow/focus cases. |
| `tests/e2e/frontend.spec.ts`; `package.json`; `scripts/browser-suites.ts`; `CONTRIBUTING.md` | Retained dirty-artifact/history tests; actual commands and inventory rules. Prefer existing test files/configs. |

### Integration ledger, observed 2026-11-25

| Work | State / boundary |
| --- | --- |
| [#1581](https://github.com/skytuhua-org/Gen-V1/issues/1581) / [PR #1649](https://github.com/skytuhua-org/Gen-V1/pull/1649) | Open/unmerged at `f902801fd0af66ace5b7e34d3df8e8546b80cf59`; explicit prompt `navigateTo`/focus work. Inspected implementation/reviewer released. Preserve precedence and markers when integrated; absent on main. |
| [#1473](https://github.com/skytuhua-org/Gen-V1/issues/1473) / [PR #1509](https://github.com/skytuhua-org/Gen-V1/pull/1509) | Open/unmerged at `028090e48d8e55ad4258773e251b09d6629c80bd`; bookmark seek/history anchor. Inspected implementation/reviewer released. Automatic work must not undo explicit seek. |
| [#1969](https://github.com/skytuhua-org/Gen-V1/issues/1969) / [PR #2062](https://github.com/skytuhua-org/Gen-V1/pull/2062) | Open/unmerged at `9c11de3b8e112188adac228a551d83eac8459912`; renderer/Find scan/terminal/table costs, not automatic reader anchoring. Preserve scan coalescing/budgets. |
| [#1188](https://github.com/skytuhua-org/Gen-V1/issues/1188) / [PR #1203](https://github.com/skytuhua-org/Gen-V1/pull/1203) | Existing retained composer/activity/scroll-indicator owner. No takeover; overlapping App/controller hunks require allocation or sequencing. |
| [#1712](https://github.com/skytuhua-org/Gen-V1/issues/1712) / [PR #1752](https://github.com/skytuhua-org/Gen-V1/pull/1752), [#2155](https://github.com/skytuhua-org/Gen-V1/issues/2155) | Inbox filtered selection/Escape focus work. Excluded. |

T01 refreshes complete journals/heads before claiming this concern. Historical release is not proof of current availability. Preserve candidate changes through recorded integration order or an acknowledged split; do not treat open-PR APIs as main. The coordinator allocates overlapping App/controller/Find hunks before T02/T03. No whole-file replacement from an older PR.

## DESIGN

### Geometry contract

Keep existing `ConversationPosition={top:number;tail:boolean}` and `ConversationAnchor={height:number;top:number}` compatible. Add these **proposed** testable contracts in `conversation-scroll.ts`; store no geometry in persistent storage:

```ts
type ReadingMetric = {id: string; top: number; bottom: number};
type ReadingPoint = {id: string; offset: number};
type ReadingAnchor = {
  owner: string; primary: ReadingPoint;
  next?: ReadingPoint; previous?: ReadingPoint;
};
captureReadingAnchor(owner: string, rows: readonly ReadingMetric[], height: number): ReadingAnchor | null;
resolveReadingTop(anchor: ReadingAnchor, rows: readonly ReadingMetric[], top: number, maximum: number): number | null;
type ConversationScrollOptions = {
  readingRoot?: (owner: string) => HTMLElement | null;
  onPositionChange?: (owner: string, position: {top: number; tail: false},
    reason: 'reading-compensation') => void;
};
createConversationScroll(element: HTMLElement, options?: ConversationScrollOptions);
```

Metrics are DOM-ordered CSS-pixel offsets relative to the scrollport's inner top (`rect.top + clientTop`). Skip nonfinite/inverted rows and later duplicate IDs. Capture the first row intersecting `(0,height)`, retaining its possibly negative top offset and adjacent eligible next/previous offsets. Resolve primary, then saved next, then previous; return `clamp(top + currentOffset - savedOffset, 0, maximum)`, or null if no candidate/valid input remains. Caller checks owner. After edge clamping recapture the reachable position, preventing accumulated drift.

The optional root resolver defaults to no automatic anchoring, preserving other callers. Main App supplies only its active direct wrapper, using a proposed `data-conversation-owner={historyId}` marker or explicit ref. Compare IDs directly, not through interpolated selectors. Reject hidden/inert/aria-hidden ancestry, disconnected/zero-rect roots and unrelated nested transcript rows.

Retain only the current anchor, its three element references and an intent generation. Genuine user scroll/explicit-navigation completion captures anew. Resize/mutation checks measure retained candidates first; rebuild membership when capturing or when candidates disappear. A recapture may walk mounted rows once, but do not scan all rows for each streamed byte or observe every row.

### One writer and explicit intent

Coalesce geometry invalidation into one callback per active owner, validating owner/generation, presentation and input/navigation state before reads. Batch candidate/viewport reads, then perform at most one immediate write if delta exceeds 1px. Mark owned writes so their scroll events are not mistaken for user intent. Immediately after an accepted correction, call the opt-in `onPositionChange(owner,{top:element.scrollTop,tail:false},'reading-compensation')` with the actual clamped position, still guarded by owner/generation. Main App updates only `readingPositions.current.set(owner,position)`. It must not call `remember()`, set latest/announcement state, emit user intent or dispatch host actions. This callback is necessary because owned scroll events are ignored by `remember()`; without it, switching away and back would restore the old pre-correction number. No recurring frame loop or timeout.

Reuse `observeConversationExtent` and its no-rebind discipline. For the opted-in controller, add an optional third argument `{geometryAttributes?: boolean}` to observe `open`, `hidden`, `class`, `style` changes as well as child/text mutations. Default remains false for current consumers. This covers disclosure/style changes whose opposite height deltas leave total extent unchanged; coalesce notifications and do not observe scrollTop as an attribute. Preserve its existing two-argument API/tests. Attribute noise must not create repeated full-row scans.

Ordering is fixed:

1. Owner restore/explicit prepend invalidates queued work, applies the existing immediate top or height delta once, then captures its result. No second ID-offset compensation for that commit.
2. Tail following uses the existing spring; no reading compensation. Jump clears anchor/pending correction before following.
3. Manual gesture or accepted navigation invalidates pending correction before moving. Suspend automatic writes through native/rail drag, touch gesture and active navigation; recapture actual viewport at release/settlement. Preserve pointer IDs and near-tail rules.
4. Only a detached, active, idle owner compensates reflow. Below-anchor growth resolves to zero delta and writes nothing.

Add **proposed** controller methods `beginNavigation(): number`, `endNavigation(token: number): ConversationPosition | null`, `readingAnchor(): ReadingAnchor | null`. Begin invalidates correction, interrupts tail work and returns an owner/generation token. End accepts only that current token, records actual top with `tail:false`, suppresses its duplicate scroll event and recaptures. New input, owner switch, Jump or disposal invalidates old tokens; stale end returns null. Cancellation keeps actual position. The anchor getter is a read-only snapshot for focus bookkeeping, not another writer.

Current Find gets/reuses optional `onBeforeNavigate?:()=>void`, invoked after match validation but before geometry/scroll. Main begins there and ends through existing `onNavigate`, saving the accepted position while retaining Find UI behavior. Other consumers remain unchanged. When #1649 is integrated, reuse its before-navigation/cancellation seam and suspend correction until its `navigateTo` settles/cancels. Coordinate #1509's actual seek boundary similarly. These are integration contracts, not claims those APIs exist on baseline.

Keep `overflow-anchor:none`. Correction is immediate in every motion mode and never changes selection, focus or announcements. Owner or presentation invalidation must cancel the queued callback and invalidate its navigation generation immediately, not merely reject work when a delayed frame eventually runs. Reuse the document visibility listener. For the opted-in root, observe only its current ancestor chain's `hidden`, `inert`, `aria-hidden`, `class`, `style` and `open` attributes, or a verified synchronous App notification for the same changes, with explicit cleanup on owner replacement. This is bounded owner lifecycle observation, not a document-wide scan or per-message subscription. Hidden/disposed owners perform no visual work; on re-entry use existing explicit restore then capture, without background polling.

### Final-page focus

App holds one transient `{owner, control, messageId, generation, ownedBeforeCommit}` record per current history action. Arm only if the main button is active and click `detail===0` (keyboard/assistive activation). Find's programmatic click is excluded because it owns focus elsewhere. Capture the controller's primary message ID if available. Pointer paging retains existing behavior.

Immediately before synchronous reveal or async page commit, verify same action/owner and `activeElement===control`. New keydown/pointerdown intent, focus movement away, blur, hidden document, owner/presentation change, newer action, failure or unmount invalidates the record. Arm after the accepted click; ignore its originating activation event and trailing keyup, including Enter/Space activation, so that sequence does not cancel its own asynchronous handoff. Keep existing fetch/cache/error semantics; do not assume an older request was cancelled.

After commit and immediate scroll stabilization, consume once. A connected button keeps focus. If removed, require verified prior ownership, unchanged owner/generation, visible active presentation and focus on body/removed control. Focus the saved row only if it already has an approved programmatic focus target from integrated navigation; otherwise use the existing focusable `.conversation-scroll`. A missing row also falls back to the scrollport. Use `focus({preventScroll:true})`; do not add tab stops to every message. Current baseline therefore deterministically uses the scrollport. Never recover after the user moves to composer, another control/owner/window.

### Recovery and rollback

Missing/invalid anchors retain clamped top and recapture. History failure keeps its existing error/focus state. Preserve message/artifact keys and mounted drafts. No migration or new host authority. Rollback removes the main reading-root opt-in and focus/navigation wiring, restoring existing tail/history behavior; do not revert unrelated candidate changes. Existing focus-visible/forced-color styles remain.

## EXECUTION_DAG

`T01 -> T02 -> T03 -> T04 -> T05`. One implementation owner sequences shared-file edits; independent read-only review may proceed separately.

### T01: Fix the baseline and geometry decisions

Prerequisites: full plan/journals read, implementation assignment, claim accepted/read back, main and relevant PR heads refreshed. Inputs: REPO_MAP and existing contracts. Own: pure helper section of `conversation-scroll.ts`, `tests/conversation-scroll.test.ts` and baseline reproduction cases in `tests/e2e/conversation-find.spec.ts`.

- [ ] Record current source allocation/integration order for #1649/#1509/#2062 and protected #1188 hunks. Revise this canonical plan if actual seams differ.
- [ ] Before product edits, reproduce both findings in actual main App: detached message offset after earlier growth and keyboard focus after final history-button removal. Add minimal real-component cases using the existing Find fixture; record baseline SHA and actual failure/output. If either does not reproduce, investigate and revise scope instead of claiming a fix.
- [ ] Add failing pure cases: first intersecting/tall row, invalid/duplicate metrics, primary/next/previous fallback, all missing, zero delta, changed positions with constant total height and clamping. Run the focused unit command and record actual failure.
- [ ] Implement exact proposed geometry functions without DOM/focus effects; rerun focused tests.

Outputs: tested functions/types and recorded source allocation. Positive: +120px earlier growth resolves to top+120 at the same boundary offset. Negative: no candidates returns null without tail-following. Done when pure tests pass, actual main baseline findings are recorded, and contracts are reviewable. Expected baseline regression failures remain explicit. Handoff to T02: exact APIs and permitted hunks/baseline.

### T02: Integrate main-owner compensation

Depends on T01. Inputs: pure functions and existing observation/manual APIs. Own: controller internals, narrow App root resolver and controller tests. Outputs: one immediate writer, intent cancellation and anchor/navigation APIs.

- [ ] Add multiple-row rectangle fixtures with read/write/frame/observer counters. Cover above/below growth, equal-total geometry change, removal, hidden/wrong owner, queued callback then wheel/drag/key, duplicate scroll event and disposal.
- [ ] Implement opt-in root, retained candidates, coalesced extent callback and optional geometry-attribute observation. Preserve default observation behavior and existing public position types/manual methods.
- [ ] Wire active main wrapper and position callback to the existing map, with no latest/announcement side effects; implement restore/prepend/tail/manual/idle ordering. Run focused tests, including original 500 deep mutations plus geometry-attribute batching. Verify policy changes never animate compensation.

Positive: stable boundary, normal tail following. Negative: zero stale writes after owner/input changes, none during drag, none for below-anchor growth, no hidden candidate. Done when new geometry and existing controller cases pass. Handoff to T03: verified resolver, token/getter APIs and cancellation cases.

### T03: Preserve navigation and final-page focus

Depends on T02 and current overlapping-file allocation. Inputs: token/getter APIs, Find/paging and actual integrated navigation contracts. Own: narrow App/ConversationFind integration and corresponding mounted tests. Outputs: explicit-action precedence and guarded focus continuation.

- [ ] Add/reuse Find before/after seam without changing query/highlights/scans. Integrate accepted prompt/bookmark seams through the same lifecycle, without implementing those features here.
- [ ] Add transient history-focus ownership/generation, verify immediately before commit, consume after scroll correction with exact row-or-scrollport fallback. Preserve requests/cache/errors.
- [ ] Extend `tests/e2e/conversation-find.spec.ts`: 125-message actual main fixture initially shows 100; after implementation, keyboard final-page activation reveals 125, removes the main control and focuses the scrollport when based on the current main API. The original baseline must first fail the focus-continuation assertion in T01; an integrated approved message target uses the documented alternative. Cover nonfinal button retention, held async result after typing/tabbing/owner switch, error, newer action and Find-triggered paging that keeps Find input focused. Assert handoff causes no scroll shift.

Positive: one final-page `preventScroll` handoff and explicit navigation with no snapback. Negative: async completion cannot take composer/Find focus. Done when mounted cases pass and integrated prompt/bookmark tests reject later stale correction. Handoff to T04: frozen combined candidate and named pending integrations.

### T04: Validate geometry and keyboard continuity

Depends on T03. Inputs: before/candidate SHAs, synthetic fixtures and acceptance matrix. Own: browser/native verification and evidence; no added behavior. Outputs: factual results/captures.

- [ ] Extend `conversation-scroll.spec.ts` with identified variable-height messages. Measure the same boundary relative to inner scrollport, then grow/shrink above, append below, remove primary, change width and alter two rows with unchanged total extent. Assert <=1px offset error when unclamped, retained focus/selection and immediate correction.
- [ ] Exercise actual main App in the existing Find fixture: delayed earlier artifact `Image` sizing (start its request while visible, scroll to reader, then release the synthetic resource response), earlier activity expansion, width rewrap, prepend followed by late sizing, hidden retained owner, Find during queued correction, tail/Jump/restore and final-page focus. Use real wheel/native/rail input; preserve editable/IME exclusions, dirty-artifact identity and scoped-reader regressions. Add compensate -> switch owner -> return in actual App, asserting corrected per-thread top/boundary is retained without false new-update announcements. Test Full, Reduced, Off and System OS reduction.
- [ ] Run VALIDATION commands and record exact failures/skips. Instrument one-callback/no-idle-work/read-before-write behavior on a representative long loaded transcript; no separate benchmark framework.
- [ ] Capture comparable synthetic before/after 1920x1080, 30fps clips without titles/overlays, plus desktop/narrow-pane/200% browser-zoom screenshots. Caption source SHAs, data and CSS viewport; browser zoom is not native DPI proof.
- [ ] On Windows desktop verify native scrollbar drag, reflow and final-page keyboard continuation. Screen-reader smoke checks correct focus and no repeated announcements. Unavailable native/assistive checks remain explicit pending release gates.

Done when A01-A10 have retrievable evidence or a named blocking failure. Handoff to T05: exact commands/results, artifacts, SHAs and remaining gates. Controller mocks alone do not prove actual App or native behavior.

### T05: Send complete review handoff

Depends on T04. Inputs: candidate/evidence matrix. Own: docs/PR handoff only. Outputs: reviewable implementation PR and durable canonical state.

- [ ] Audit all requirements/diff; update complete plan/source if decisions changed, preserving prior revision. Run manifest checks only if approved new source files were added.
- [ ] Link implementation PR to child/parent with concrete problem/behavior, commands, pending gates and immutable evidence. Send finished work to the front end team for geometry, navigation arbitration and keyboard review.
- [ ] Publish/read back AGENTS checkpoint and RELEASE with `OWNER=NONE`, clearing only this worker's markers. Distinguish receiver ACK, approval, merge and verified-on-main.

Positive: fresh reviewer retrieves every requirement/fixture/result. Negative: no local-only artifacts or unmerged/runtime assumptions marked accepted. Done when handoff is durable and scope released; closure still requires acceptance/authorization.

## VALIDATION

From repository root follow `docs/getting-started.md`: Node >=24.10.0, pnpm 10.30.3, `pnpm install --frozen-lockfile`, bundled Chromium and documented OS dependencies. Use synthetic routes, no live account/model calls; freeze edits before final browser checks. Planned commands, **not executed results**:

```sh
pnpm build:widgets
pnpm exec vitest run tests/conversation-scroll.test.ts tests/conversation-find.test.ts --maxWorkers=1
pnpm typecheck
pnpm build
pnpm exec playwright test --config tests/e2e/conversation-scroll.playwright.config.ts
pnpm exec playwright test --config tests/e2e/conversation-find.playwright.config.ts
pnpm exec playwright test --config tests/e2e/shell.playwright.config.ts --grep "bounded history|work activity keeps the full ordered group"
pnpm exec playwright test --config tests/e2e/scoped-conversation.playwright.config.ts
pnpm check:docs-links
```

The verified scoped-conversation config selects `msedge`, so install Microsoft Edge as required by CONTRIBUTING; bundled Chromium alone does not supply it. Do not silently substitute a browser or report unavailable native coverage as passing. New source files, if approved, require source/runtime manifest entries and `node --import tsx -e "import('./scripts/public-source.ts')"`, then `pnpm exec vitest run tests/public-source.test.ts --maxWorkers=1`. Docs publication itself needs wording/link/format checks, not product-test claims.

| Check | Requirements / tasks | Acceptance |
| --- | --- | --- |
| A01 | R01,R08 / T01,T02,T04 | Above-boundary growth/shrink/image/width and equal-total-height change retain offset within 1px; below append writes nothing. |
| A02 | R02,R04 / T02,T03,T04 | Find/integrated prompt/bookmark/Jump/restore/prepend win pending measurement; prepend compensates once; corrected position survives owner switch/return without announcement side effects. |
| A03 | R03 / T02,T04 | Hidden/inert/wrong-owner rows excluded; switch/hide/removal/dispose reject stale work and clear owned callbacks. |
| A04 | R04 / T02,T04 | Real wheel/touch/keys/native/rail intent wins; foreign release ignored; tail/near-tail/duplicate-event regressions pass. |
| A05 | R05 / T01,T02,T04 | Next then previous fallback preserves its offset; all missing retains clamped top; clamping does not accumulate drift. |
| A06 | R06 / T03,T04 | One guarded final-page handoff; nonfinal/error/Find paging/new input/owner/action never steal; no extra message tab stops. |
| A07 | R07 / T02,T04 | Every policy corrects immediately, creates no new animation and preserves existing tail policy/input responsiveness. |
| A08 | R08 / T02,T04 | One pending callback, reads before single write, no idle loop/per-row observers/full scan per byte; deep mutations do not rebind. |
| A09 | R09 / T03,T04 | Draft/selection/artifact DOM and Find state survive; errors/authority remain unchanged. |
| A10 | R10 / T01,T04,T05 | Current claims/heads, actual main/native/accessibility evidence, fixed-SHA captures and complete canonical handoff retrievable. |

Release requires A01-A09 passing, complete A10 evidence/ownership, native/accessibility gates fulfilled or explicitly dispositioned by the responsible reviewer, and normal CI/review protections. Source inference/mocked geometry alone cannot establish visual acceptance.

## STATE

Decided: one bounded main-chat concern, immediate ID/offset correction, one writer, explicit navigation first, guarded final-page focus. Current controller/scoped-reader strengths and unmerged integrations are mapped. No external component source copied.

This complete `FRONTEND-ANCHOR-R1` plan is published under #2218 and parent X04-anchor. Coordinator `codex-cloud-bluma-bd935d` owns immutable source/issue publication and readback. The canonical issue publication record links the exact documentation source and review PR. Product T01-T05 remains `NOT_STARTED`; unit/browser/type/build/Windows/screen-reader/captures are `NOT_RUN`. No runtime reproduction or performance result is claimed. T01 must reproduce actual main geometry and final-page focus before product edits; T04 then verifies the integrated result.

Risks are input versus pending measurement, async focus ownership, edge clamping, hidden owners and overlapping navigation code; each has guards/tests above. Research access is unblocked. Publication acceptance is recorded by the coordinator's exact body/source readback and RELEASE checkpoint. Next implementation step: T01 journal/head/claim refresh and source allocation, then failing geometry tests. #1188's retained scope remains protected.

## REFERENCES

- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/AGENTS.md), [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/CONTRIBUTING.md), [DESIGN.md](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/DESIGN.md): ownership, complete publication, validation and restrained accessible UI.
- [Controller](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/conversation-scroll.ts), [App](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/App.tsx), [Find](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/ConversationFind.tsx), [scoped precedent](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/conversation-workspace/ConversationPane.tsx): verified main contracts. Test paths in REPO_MAP use this same pinned tree.
- [CSS Scroll Anchoring Module Level 1](https://www.w3.org/TR/css-scroll-anchoring-1/), reviewed 2026-11-25: CSSWG Working Draft, not finalized standard. Describes above-viewport shifts despite unchanged absolute scroll position, anchor/offset correction and `overflow-anchor:none`. Adopt the principle within the existing controller, without native double compensation.
- [Atlassian accessible interaction guidance](https://atlassian.design/components/pragmatic-drag-and-drop/accessibility-guidelines), section 3, reviewed 2026-11-25: continuation restores the original trigger where possible, or a suitable replacement when removed. Its subject is drag alternatives; applying that principle to exhausted chat history is an explicit design inference, not an Atlassian chat specification. No package required.
- Current related issues/PR heads are linked in the integration ledger; [parent #2212](https://github.com/skytuhua-org/Gen-V1/issues/2212) retains prior Bluma scope and extension journals.
