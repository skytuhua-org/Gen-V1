# Plan: Jump to sections in long replies

## META

- Repo: `skytuhua-org/Gen-V1`; plan revision **1**, 2026-11-22 UTC.
- Research baseline: `main` at [`2640b897a42739eba3785fc934af882996c07097`](https://github.com/skytuhua-org/Gen-V1/commit/2640b897a42739eba3785fc934af882996c07097).
- Source: batch 12 proposals, row 1 and scope note 1 (small). The requirements below include the full v1 scope; the proposal file is not needed to implement it.
- Canonical issue and docs-only PR: this revision is prepared before GitHub assigns their URLs. The publisher will link the issue and PR and pin this exact document by commit SHA in the issue. A search for the proposal title found no existing match at plan time. Related, separate open issues: [#1581](https://github.com/skytuhua-org/Gen-V1/issues/1581) and [#1583](https://github.com/skytuhua-org/Gen-V1/issues/1583). Implementation PR: none.
- Status: research and design only; no product code, implementation validation, or visual evidence yet. Labels: `feature` + `small`.

## OBJECTIVE

Let someone reading a long assistant reply go straight to the part they need without guessing a search term or scrolling past the entire answer. In a finished main-conversation reply with three or more rendered headings, open **Contents**, choose a heading, and land on that exact heading in the same conversation, with keyboard focus on it. In a reply with two identical headings, selecting the later occurrence must land on the later heading; opening Contents alone must not move the reader to a section.

## REQUIREMENTS

| ID | Requirement |
| --- | --- |
| R01 | Show one initially collapsed **Contents** disclosure per eligible assistant reply: rendered as main conversation prose, no longer streaming, with at least three actual rendered headings. Do not gate finished historical replies on the current thread's overall status. No control on user prompts, activity, side conversations, delegated/scoped read-only transcripts, or artifact/Files Markdown. |
| R02 | List every heading rendered by the existing Markdown renderer, in its document order with visible inline text and recognizable hierarchy. Heading-like content in backtick or tilde code fences (including an unclosed fence) or any other non-heading rendered block does not count. Distinguish equal labels by position and match each specific heading, never the first text match. |
| R03 | On activation, close the outline and scroll only its owning conversation to the chosen heading, then leave focus on that semantic heading. Do not move the document, another pane, the composer, or location/history. Do not let tail-follow or an asynchronous stale target overwrite the jump. Existing **Jump to latest**, saved reading position, and history prepend remain functional. |
| R04 | Support mouse, touch and keyboard with a native disclosure button, ordinary tab sequence, visible focus, and Escape to dismiss from inside the disclosure. Collapsed entries are not reachable. Navigation leaves focus at the destination, not at the opener or body. |
| R05 | Use the visual and motion specification below in light/dark, narrow/wide and reduced/off motion. Contents is in flow, not a floating overlay, and must not cover Copy message, headings or the composer. Long labels wrap and a long list stays bounded. |
| R06 | Keep all state ephemeral and message/view-local. No new network request, persisted settings, telemetry, URL fragments, share links, transcript-wide index, streaming outline, renderer syntax changes, or artifact/Files changes. Preserve Copy, source selection, Conversation Find and sentence reveal. Render model-supplied labels as inert text only. |

**Scope from the proposal:** the threshold, finished main-reply surface, renderer parity, duplicate identity, and conversation scroll/focus are fixed. The inline disclosure, state resets, instantaneous section movement and visual treatment below are proposed implementation decisions for v1. This is not Conversation Find, prompt-to-prompt jumping, or Files-preview heading navigation. It neither depends on nor implements those projects.

## REPO_MAP

Verified at baseline unless marked **discovery**:

| Path or symbol | Relevance |
| --- | --- |
| [`apps/web/src/Markdown.tsx`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/apps/web/src/Markdown.tsx), `blocks`, `inline`, `Markdown` | One block walk consumes fenced code before its ATX heading branch (`h1`–`h6`); lists, tables and paragraphs follow existing precedence. `inline` handles bold, inline code and admitted links. `Markdown` memoizes the result and passes real DOM children to `SentenceReveal`. |
| [`apps/web/src/App.tsx`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/apps/web/src/App.tsx), `AssistantProse`, main `messageRows`, `renderSplitView`, `CanvasThread` | The main `.conversation-scroll` row dispatches assistant prose via `SourceMessage` and `AssistantProse`, with an explicit active-run match and arrival-based reveal. Split thread views embed an `App`, so scope to the rendered main conversation owner, not to the outermost App. `CanvasThread` has separate direct `Markdown` call sites. Use `threadParent` and `delegatedThread` in [`workspace-canvas-layout.ts`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/apps/web/src/workspace-canvas-layout.ts) for thread roles. |
| [`packages/contracts/index.ts`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/packages/contracts/index.ts), `Message`; [`packages/core/service.ts`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/packages/core/service.ts), `commitRuntimeProjection` | Message has a retained `runId`, not a finished flag. Deltas and full replies upsert messages with the run ID; the settlement projection clears the owning thread's current run ID. The existing reveal flag also covers new arrivals and is not a completion signal. |
| [`apps/web/src/conversation-scroll.ts`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/apps/web/src/conversation-scroll.ts), `createConversationScroll`, `createHistoryAnchor`; App's `conversationMotion`, `readingPositions`, `rememberPosition` | Controller owns tail spring and saved reading intent. Current `scrollTo` is used for ordinary manual movement and can reattach near the tail; a section jump needs explicit reading behavior. App persists position in its existing per-owner map and separately manages **Jump to latest**. |
| [`apps/web/src/ConversationFind.tsx`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/apps/web/src/ConversationFind.tsx), [`conversation-find.ts`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/apps/web/src/conversation-find.ts); [`SourceWorkbench.tsx`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/apps/web/src/SourceWorkbench.tsx), `SourceMessage` | Find collects rendered text and excludes button descendants. `SourceMessage` conditionally wraps prose in selection actions that require unambiguous source text; keep disclosure UI outside that capture root and keep its labels in buttons. |
| [`apps/web/src/markdown.css`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/apps/web/src/markdown.css), [`styles.css`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/apps/web/src/styles.css), [`shell.css`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/apps/web/src/shell.css) | Scoped prose styling, existing top-right Copy message placement, narrative measure, transcript padding and narrow layout. |
| [`packages/ui-shell/SummaryDock.tsx`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/packages/ui-shell/SummaryDock.tsx), [`summary-dock.css`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/packages/ui-shell/summary-dock.css), [`ActionMenu.tsx`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/packages/ui-shell/ActionMenu.tsx), [`tokens.css`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/packages/ui-shell/tokens.css) | `DockedSummary` demonstrates a labeled inline disclosure with `aria-expanded` and a chevron. `ActionMenu`/`Popover` are for overlays and menu keyboard semantics, neither needed here. [`motion-policy.ts`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/apps/web/src/motion-policy.ts) distinguishes full/reduced/off app and OS policy. |
| [`tests/e2e/markdown.spec.ts`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/tests/e2e/markdown.spec.ts), [`task-interface-fixture.ts`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/tests/e2e/task-interface-fixture.ts), [`tests/conversation-scroll.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/tests/conversation-scroll.test.ts), [`tests/e2e/conversation-scroll.spec.ts`](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/tests/e2e/conversation-scroll.spec.ts) | Existing parser/render, streaming and scroll regression suites. The task fixture can publish snapshot updates in place; its current Markdown helper targets an artifact, so add a separate main-reply fixture helper rather than changing those existing fixtures' meaning. |

**Integration discovery (T01):** re-read fresh main and check whether #1581, #1583 or related transcript changes have landed or have overlapping implementation PRs. If a compatible owner-scoped reading jump or renderer extension has landed, reuse it and preserve this plan's behavior; if not, implement only the narrow additions below. Confirm actual desktop/split fixture setup from `renderSplitView` and the existing browser suites; do not infer ownership from global selectors or assume that two panes always render different thread IDs.

## DESIGN

### Eligibility and renderer contract

- At the main message-row dispatch, derive scope from the row owner and surface. Require the visible, interactive main thread for that view (no side parent or delegated kind; no held/inactive transcript). This includes main chat rendered inside a split pane or detached main chat using the same App path; it does not opt other renderers in. Retained hidden panels must not serve a target. Use the same owning-thread active-run comparison used by `AssistantProse`: when the owner has a nonempty `runId` equal to the message's, the reply is not eligible. Historical messages from another run, and legacy snapshots with no message run ID, can be eligible during a subsequent run. Once a reply is no longer being updated by its owning run, its retained rendered text can qualify; this is about settled prose, not the success of the entire task. Do not introduce a host status field or timer; do not reuse `animate` or arrival membership to decide eligibility.
- In `Markdown.tsx`, expose an internal opt-in render result with the existing nodes plus heading descriptors `{ key, level, label }` in emitted order. Collect them in the **same** branch that emits the corresponding heading. Use a position key from the block walk (e.g. normalized source line index) consistently on the descriptor and as local heading identity. No independent regex scan, no slug-by-label, and no global DOM query. Preserve existing order, line normalization, paragraph/table precedence, fence behavior, markup and React keys. Only opt-in mode adds local target markers and `tabIndex={-1}` to eligible headings.
- Derive a descriptor label from the same inline interpretation that produces heading children: plain text, bold contents, code contents, or a link's displayed label, not its URL. Share tokenization with `inline` or use the equivalent already-rendered React text; don't add a second inline grammar. Collapse display whitespace; use **Untitled section** if the heading's visible text is empty. Leave the actual `h1`–`h6` unchanged. Equal display labels receive a visible positional suffix in source order (for example **Results (1 of 2)** and **Results (2 of 2)**); unique labels are unadorned. Expose the same disambiguation to assistive tech. Preserve original heading levels; do not synthesize parent headings when levels are skipped.
- Share the memoized block result between prose and the opt-in controls; avoid parsing a reply twice or collecting metadata on the streaming/generic paths. A dedicated main-reply adapter in `Markdown.tsx` or an adjacent reply component can compose the outline outside the prose wrapper and render the shared result through the same `SentenceReveal`. In App, let `AssistantProse` place `SourceMessage` around **prose alone**, not around the disclosure. Retain arrival bookkeeping, reveal flags and Copy message (which still copies raw `message.content`). Include eligibility/owner inputs in `AssistantProse`'s memo comparison; avoid destabilizing all message rows with a changing callback on every snapshot. Preserve heading DOM identity as a run settles; don't remount the prose merely to add Contents.

### State, scroll and focus

1. **Ineligible → collapsed:** when qualifying, show the trigger with no automatic expansion, selection, focus or announcement. Use native `button type="button"`, an instance-local `aria-controls` ID (e.g. React `useId`) and `aria-expanded`. The ID identifies only the disclosure body, never a document fragment destination.
2. **Collapsed ↔ expanded:** click/tap/Enter/Space toggles; focus stays on the trigger when opening by keyboard. The entries are buttons in an ordered list; natural Tab/Shift+Tab, Enter/Space, no menu roles, roving focus, hover dependency or global shortcuts. Escape from the trigger or an entry when expanded closes and focuses the trigger with `preventScroll`; handle only a locally consumed Escape and do not trap Tab. Outside click does not dismiss inline content. Each reply can expand independently.
3. **Choose → collapsed + jump:** queue the chosen key against the current message and owner, then close the list. Resolve via that reply's Markdown root/ref registry after the collapse commits (in a layout effect before paint); measuring with the list still open is incorrect. Verify identity, connection, visible/non-inert owner, and containment inside both the reply root and its exact scroll element. Compute target top as current `scrollTop + headingRect.top - (scrollerRect.top + scroller.clientTop) - 16px` (use the shared 16px inset). Clamp to `[0, scrollHeight - clientHeight]`; if the end of the transcript prevents top alignment, the heading must still be visible in the reachable viewport. Set focus to the heading with `focus({preventScroll: true})`. No `scrollIntoView`, global scroll, anchor link, text search or forced document selection. Keep the native heading semantics; the next Tab proceeds in reading order from the heading.
4. **Controller handoff:** add a narrow reading-jump entry point to `createConversationScroll` (proposed `jumpToReadingPosition(top)`), rather than changing `scrollTo`/drag semantics or calling `jump()`. Interrupt pending tail motion, write the clamped position as controller-owned, and keep `following=false` even if it lands within the ordinary near-tail threshold. Return `{top, tail:false}` and update App's existing `readingPositions` for that owner, with the usual **Jump to latest** recovery. The subsequent owned scroll event must not reattach tail. A later explicit **Jump to latest** or ordinary user scrolling toward the tail can resume normal behavior. No new animation queue or persisted scroll journal.
5. **Owner loss or target invalidation:** clear local expanded and pending selection on message/view unmount, owner deactivation, or content identity change; never execute a stale jump after switch/archive/paging. When a chosen target disappears but the same disclosure still lives, close and restore focus to its connected trigger if focus fell out of the removed entry; if its owner vanished, do not steal focus from the new surface. Leave current scroll position alone on cancellation. No background retry or new error panel; the user may reopen the still-eligible disclosure. Display states do not survive reload. Preserve normal owner history anchoring and switch/restore behavior.

### Visual design and animation

| Surface/state | Specification |
| --- | --- |
| Placement | Left-align the contents widget with prose at the top of the reply, inside the reply's existing narrative measure. Leave `--ui-space-2` (8px) below it; reserve at least `--ui-row-touch` (44px) on its inline end for existing top-right Copy message. No new header, sticky element, overlay layer or elevation. No footprint for short/ineligible replies. |
| Trigger | Visible text **Contents**, 13px/18px medium, plus 14px chevron, both aligned center with 8px gap. Use a quiet `--surface` control with 1px `--control-border`, `--control-radius` (8px fallback), `--text` label, `--muted` decorative chevron and 8px inline padding. Minimum height `--ui-row-compact` (32px) or `--ui-row-touch` (44px) on coarse pointers. Hover uses `--hover`, press/expanded uses `--subtle`; don't make control visibility depend on hover. Chevron points down collapsed and rotates 180° expanded; mark it `aria-hidden`. |
| Expanded list | In flow below the trigger with 4px gap, left edges aligned, inline size at most 360px and no wider than available reply space. Use `--surface`, 1px `--control-border`, same radius, 4px inner padding, no shadow. Max block size `min(16rem, 40dvh)`, vertical overflow only. Use normal scrolling at the list edge (no wheel/touch trap). Visible list is unnumbered stylistically, retaining ordered-list semantics. All entries remain reachable by scrolling or Tab. |
| Entries | Full-width left-aligned rows, min 32px or 44px on coarse pointers, 8px inline padding, 13px/18px, rounded hover/pressed background matching the trigger. Indent by 8px per level above the lowest rendered heading level, capped at 24px (logical inline-start). Use wrapping, including unbroken strings; no truncation, clipping or horizontal scroll at narrow widths, user text zoom, or RTL. Include duplicate suffixes as text; do not display raw numbers as JSX children without explicit formatting. |
| Focus/landing | 2px `--ui-focus-ring` and 2px offset on trigger, entries and focused target heading; ensure list-row outlines stay inside the scrollable panel. Show the target outline for both keyboard and pointer jumps while the heading retains focus. No flash, permanent tint or active-entry tracking. In forced-colors, keep a visible system-color outline and border. Never override actual heading typography or copyability. |
| Full motion | Expansion occupies its final geometry immediately. Fade list opacity from 0.85 to 1 over `--ui-motion-tab` (140ms), `--ui-ease-enter`; chevron rotates over `--ui-motion-hover` (120ms), `--ui-ease-move`; hover/press color changes use the shared hover/press tokens. Close removes list and its focusables immediately (no exit animation for the list); chevron can rotate back. Do not tween height, move prose with transforms, stagger entries, replay sentence reveal or animate the section scroll. Instant navigation keeps destination and focus in sync and cannot race with tail motion. |
| Reduced/off motion | For either OS reduced motion or app `data-motion="reduced"`/`"off"`, make fade, chevron and color transitions instantaneous, without dropping end-state cues. The jump, focus and disclosure geometry are identical to full motion. Honor live policy changes through CSS; no imperative motion subscription is needed for this widget. |

### Compatibility, security and rollback

No persistence, migration, backend/provider changes, remote fetch, analytics or new dependencies. Use React text output for reply labels; never inject HTML, copy an existing link into a Contents entry or use model-supplied strings as selectors. A shown label is not a new source reference. Scope any CSS to the dedicated reply outline and opt-in target marker; no generic heading or menu styling changes. Revert the focused implementation PR to roll back; historical messages, renderer grammar and stored preferences need no cleanup.

## EXECUTION_DAG

`T01 → T02 → T03 → T04 → T05 → T06`. Single small-feature implementation; each task owns the listed files/behavior, with no parallel writers to the same integration path.

### T01 — Verify the current main-conversation contract

- **Inputs/dependencies:** revision 1 and the canonical issue/journal; start from fresh main. **Owner:** implementing agent, discovery only.
- Read the App row dispatch, active-run gate and split embed, controller/manual-scroll call sites, shared renderer callers and related work in REPO_MAP. Verify where a main reply is rendered vs side/delegate, and trace one assistant delta through settlement and snapshot publication. Inspect available fixtures for a second owner and retained history. Explicitly record whether sibling changes affect the same paths.
- **Check/done:** identify a running reply lacking a completion flag and an older reply with a different run ID that remains eligible; identify a different-surface renderer that cannot opt in by accident. Record verified symbols and any changes to assumptions in the issue; hand baseline/integration decisions to T02. If the active-run comparison no longer fences live writes, stop and reconcile against a verified existing lifecycle signal before implementing.

### T02 — Emit renderer-owned headings without changing prose

- **Inputs:** T01; owns `Markdown.tsx` and renderer-focused cases in `tests/e2e/markdown.spec.ts`.
- Share inline label interpretation and collect an opt-in typed descriptor list, stable keys and matching targets from the emitted heading branch. Keep memoization and generic Markdown/SentenceReveal output unchanged. Expose the render result for T03 to compose a control outside the prose root.
- **Check/done:** headings across levels and formatted text, duplicates and blank labels resolve in source order. CRLF, fenced/unclosed fenced code, table rows and non-heading Markdown do not create phantom entries. Existing Markdown table, code, list, copy and streaming assertions remain intact. Hand the renderer interface and fixtures to T03.

### T03 — Wire disclosure and exact owner-local jump

- **Inputs:** T02 descriptors, T01 lifecycle/surface evidence. Own App integration, proposed local reply control `apps/web/src/ReplyContents.tsx`, the narrow controller entry point and `tests/conversation-scroll.test.ts`.
- Gate opt-in at main assistant rows, position controls outside `SourceMessage`, keep stable prose and local disclosure state, add explicit reading jump and layout-commit focus choreography. Avoid duplicating parsing or global state. Handle cancellation and ineligible/hidden owners per DESIGN.
- **Check/done:** controller unit test jumps from following to reading, including near tail, and does not resume on owned scroll events/content growth; `jump()` still resumes, and existing manual movement/history tests still pass. In main fixture, both duplicated headings focus the intended element and no other scroller/location changes; a vanished target never scrolls a replacement owner. Hand wired control and contract to T04.

### T04 — Apply visual and a11y specification

- **Inputs:** T03 interactive control. Own scoped CSS in `markdown.css` and visual/semantic hooks in the local control.
- Implement placement, theme tokens, sizes, wrapping, bounded list, focus treatment, forced colors and motion policy from DESIGN. Add no portal, manager, global key handler or token definitions.
- **Check/done:** one labeled trigger and valid disclosure relationship, no focusable collapsed rows, normal Tab/Shift+Tab/Enter/Space/Escape operation, no clipping or Copy collision at narrow widths, no animation under app reduced/off or OS reduce. Hand final UI to T05.

### T05 — Verify integrated behavior and capture evidence

- **Inputs:** T02–T04 complete. Own integrated cases in the existing `markdown.spec.ts` and, only when necessary for actual surface coverage, corresponding existing conversation/side/scoped specs; use existing fixtures and runners.
- Run VALIDATION below and exercise the rendered UI in the stated wide/narrow/theme/motion states. Include a live snapshot transition, the false-heading fixtures, duplicates, a sibling owner, settled history, a near-tail jump, unrelated surfaces and Find/copy/source regression. Verify screenshots actually show expanded and landed states, not just the page loading.
- **Check/done:** record each acceptance result, exact commands and outcomes, screenshots and failing traces if any. Report unresolved issues rather than calling fixtures real-provider verification. Hand the implementation PR, pinned commit and evidence to T06.

### T06 — Send finished work to the front end team for review

- **Inputs:** T05 finished implementation and reproducible evidence. **Owner:** implementing agent; no new feature work.
- Send the front end team the implementation PR and pinned commit, acceptance results and wide/narrow, keyboard and reduced-motion evidence. Ask them to review placement, readability, focus, scroll ownership and motion against this plan. Log the recipient, links and review status in the canonical issue. Done when the real handoff is sent and recorded, not when a hypothetical designer is assigned or when the docs PR lands. Keep review pending until acknowledged; do not claim approval.

## VALIDATION

### Setup and planned commands

From the repo root on the implementation branch, use Node per `.nvmrc`, pnpm per `package.json`, and the existing Playwright browser setup. Fixture tests require no model credentials:

```sh
source ~/.nvm/nvm.sh
nvm use
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm typecheck
pnpm test:ui-guard
pnpm exec vitest run tests/conversation-scroll.test.ts tests/conversation-find.test.ts
pnpm test:browser --suite micro-motion
pnpm test:browser --suite conversation-scroll
pnpm test:browser --suite conversation-find
```

Use the applicable existing side/scoped/split browser suite if its fixture is required for an acceptance case (`pnpm test:browser --list` lists registered tests). Keep the actual Markdown tests in their existing registered micro-motion suite. Use the task host fixture with synthetic, easily identifiable texts and explicit run IDs. To prove a real streaming transition, publish a snapshot with a matching active run and at least three complete heading lines, publish an additional chunk for the same reply, then publish settlement with `thread.runId=null` and confirm no artifact/helper was mistaken for the qualifying reply.

### Acceptance matrix

| Requirement | Tasks | Observable pass criteria |
| --- | --- | --- |
| R01 | T01, T02, T03, T05 | Zero/two headings: no Contents. Exactly three in one finished main reply: one collapsed control. At least three plus streaming updates on the same active reply: none until settlement; an older reply still qualifies. Side/delegate/user/activity and artifact/Files paths do not gain a control; main chat in an embedded view behaves like the normal main view. |
| R02 | T02, T05 | Mixed `h1`–`h6`, formatted/link titles, duplicate and whitespace-only headings preserve order and expected visible labels. Both fence types, an unclosed fence, table content and non-heading syntaxes follow existing renderer behavior. Clicking duplicate two focuses the second actual heading in that reply even with duplicates in another reply. |
| R03 | T03, T05 | Use tall filler and a real overflow viewport. Assert after collapse: target is in the owning scrollport (near inset when not clamped), is `document.activeElement`, sibling scroll position and document/Y/URL are unchanged. Exercise both a pending tail spring and a near-tail landing; subsequent streamed growth does not steal reading position. **Jump to latest** then follows; load earlier and thread switch/return retain existing behavior. Switch/deactivate or remove the target during a pending jump and prove no stale scroll or focus. |
| R04 | T03, T04, T05 | Tab reaches the named button; Enter/Space expand, Tab reaches visible entries in order, Shift+Tab works, Escape closes with trigger focus, and activating an entry moves focus to the heading with next Tab in reading order. No hidden focusables or global shortcut change. Spot-check spoken disclosure state and duplicate labels with an available screen reader; record environment and any not-run manual check. |
| R05 | T04, T05 | Wide desktop light and narrow/coarse-pointer dark (e.g. 390px), plus zoomed/narrow long-label and long-list cases: usable rows, wrapped labels, bounding below 40% viewport height/16rem, no horizontal overflow or collision with Copy. Full policy shows the opacity/chevron animation only; reduced and off settings and OS reduced motion have no outline transition and still land correctly. |
| R06 | T02, T03, T05 | Existing Find match count and selected occurrence do not change when Contents opens; it must not find the word Contents unless authored. Copy returns original Markdown; selecting prose for Sources still works where enabled. Model text with markup is inert in outline labels. Existing tables, code, links and streaming reveal tests pass. No new request, history entry, persistent state, or data contract; reopening a view starts collapsed. |

**Evidence and release gate:** Retain Playwright results/traces for failures and capture an expanded wide/light outline, a narrow/dark long-list state with Copy unobstructed, and the focused second duplicate after a jump (include a reduced-motion run). Record actual keyboard and focus checks; screenshots alone cannot prove scrolling or no-motion. Before requesting review, run the acceptance matrix with repeatable synthetic data, perform a manual browser check of the rendered feature, and distinguish any desktop/provider coverage not run. Implementation is review-ready only when passing checks and explicit skips are recorded and T06 handoff is sent. The separate publication PR is docs-only and must remain open/unmerged.

## STATE

- **Researched/decided:** baseline source paths above; renderer-owned entries, main-reply opt-in, inline disclosure, explicit owner-scoped reading jump, light/dark and motion design. No dependency on another feature plan.
- **Implemented/verified:** no product work by the plan author. Implementation commands, browser/visual review, and all acceptance checks are **not run** at plan time.
- **Owners/branches:** plan publisher owns docs-only issue/PR publication. Future implementer owns T01–T05 on a separate feature branch; front end team receives T06. No implementation branch, CI result or review is claimed.
- **Risks to verify:** asynchronous snapshot/scroll updates, duplicated or hidden view owners, near-tail reattachment, and drift with related unmerged work. The baseline has no per-message completion flag; T01 must recheck active-run eligibility rather than infer a streaming state from UI effects.
- **Next:** publish the full plan in one issue with the pinned docs file and open docs PR. The implementing agent then reads the canonical issue, claims T01 and records the current baseline before touching code.

## REFERENCES

- [Baseline commit](https://github.com/skytuhua-org/Gen-V1/commit/2640b897a42739eba3785fc934af882996c07097).
- [Batch 11 plan format: Mark changed files as viewed](https://github.com/skytuhua-org/Gen-V1/blob/30ed02d943b361afa4896f24b7e2ad876ee4add5/docs/agent-plans/changes-viewed-files.md).
- [Conversation prompt navigation #1581](https://github.com/skytuhua-org/Gen-V1/issues/1581) targets user-prompt rows, not headings inside an assistant reply. [Files Markdown previews #1583](https://github.com/skytuhua-org/Gen-V1/issues/1583) concerns heading links in Files, not chat.
- [ChatGPT conversation contents request](https://community.openai.com/t/floating-table-of-contents-and-shareable-heading-links-for-long-chatgpt-conversations/1414131) illustrates long-answer navigation pain; floating controls and share links are deliberately excluded. [VS Code Markdown outline](https://code.visualstudio.com/docs/languages/markdown/#_document-outline) illustrates heading hierarchy and direct navigation; no transcript-wide outline is proposed here.
- [Repository instructions](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/AGENTS.md), [contribution guide](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/CONTRIBUTING.md), [motion refinement](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/docs/motion-refinement.md), and [UI guard policy](https://github.com/skytuhua-org/Gen-V1/blob/2640b897a42739eba3785fc934af882996c07097/scripts/ui-guard-policy.md).

**Final handoff:** Once the implementation and validation are finished, send the work and evidence to the front end team for review (T06).
