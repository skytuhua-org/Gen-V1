# UI: No way to restore the centered chat layout after detaching

## META
- Feature: "Dock chat" restore-to-center affordance + Layouts reset
- Repo: skytuhua-org/Gen-V1 · Plan rev 1, 2026-11-22
- Baseline: main @ bffae7ff03a16dcc5b9c10abd25b956564059ec2
- Source provenance: QA pass 12, fixture on :4317
- Status: planning complete, implementation NOT started

## OBJECTIVE
Detaching the chat offers only "Dock chat to side drawer" — the user cannot return the conversation to its original centered main-pane position. The floating/side-drawer placement persists across reload, and the Layouts menu ("Saved layouts / Save current layout…") has no reset. Success: one obvious control puts the chat back in the main pane, and Layouts gains a reset to the default layout.

## REQUIREMENTS
- Floating chat header gains a "Dock chat" button that removes the floating placement and restores the conversation into the main pane (existing `returnConversation`/`dockFloat` path in `App.tsx`), labelled `aria-label="Dock chat"`, `title="Dock chat"`, `lucide` icon `PanelLeft` 15px, `.icon-button` styling identical to sibling header buttons (28×28px).
- Layouts menu gains a "Reset layout" item at the bottom, 13px `var(--text)`, hover `var(--hover)`, full-width row, min-height 32px, `padding:6px 8px`, `border-radius:4px`; activating it clears saved placement (floating + side-drawer + pane arrangement) to the default split and closes the menu. Disabled (opacity .45, `aria-disabled`, `cursor:default`) when the current layout already equals the default.
- Menu order: "Saved layouts" header, saved rows, "Save current layout…", separator (`.project-picker` style divider or 1px `var(--border)` line, margin 4px 0), "Reset layout".
- Keyboard: both controls reachable by Tab; "Dock chat" triggers on Enter/Space; menu item on Enter; Esc unchanged.
- Copy: "Dock chat" and "Reset layout" exactly. No confirmation prompt.
- Motion: menu item uses the shared `var(--ui-motion-hover)` `var(--ui-ease-move)` background transition; no new animation; reduced-motion no-op via existing global rule.
- Out of scope: the z-order occlusion bug (separate issue), saved-layout management (rename/delete).

## REPO_MAP
- `apps/web/src/App.tsx` — `returnConversation` (~L999 "Return replaces the main pane"), `dockFloat` (~L1021), `moveFloat`, `writePlacementRecord`; passes `onReturnFloat`/`onDockFloat` to `WorkspaceSplitLayout`.
- `apps/web/src/WorkspaceSplitLayout.tsx` — floating window header buttons ("Move chat panel", "Detach chat", "Dock chat to side drawer"); add the new button next to them.
- `apps/web/src/App.tsx` or the Layouts menu component — "Save current layout…" menu; discovery: exact component name (search `Save current layout`).
- Placement persistence: `writePlacementRecord`/`ConversationPlacementRecord` (~L974); the reset clears `floating` and restores `mainSelection`/`mainPaneId` to the initial layout.
- Verified facts: only "Dock chat to side drawer" exists today; no reset; placement survives reload.

## DESIGN SPEC (exact values)
- Button order in floating header: Find, Move chat panel, Dock chat (new), Dock chat to side drawer, Detach — keep existing order of others.
- Reset semantics: `writePlacementRecord` receives the pristine record (`floating:{}`, `mainSelection` = current thread or `{kind:'new'}` when none, default `mainPaneId`); saved layouts list is preserved (reset affects the live layout only).
- All colors/sizes from existing tokens; no new tokens.

## EXECUTION_DAG
- T01 (owner A): add "Dock chat" header button wired to the existing return/dock path. Done-when: clicking it removes `floating[viewId]` and the conversation renders in the main pane.
- T02 (owner A): add "Reset layout" menu item + disabled state + persistence clear. Done-when: menu shows the item, click restores default layout, disabled when already default.
- T03 (owner A): vitest for the reset reducer/record write (pure state — testable headlessly) + Playwright/manual check of both controls.

## VALIDATION
- `pnpm exec vitest run <new test>` PASS; `pnpm lint && pnpm typecheck` PASS.
- Manual matrix: detach → Dock chat → centered restored; side-drawer dock → Reset layout → centered restored; reload → default persists; Esc/Tab/Enter paths; narrow width 420px — item readable.
- Acceptance: each requirement maps to T01–T03 done-when above.

## STATE
- Verified: no restore path exists; placement persists. Risks: `dockFloat` currently targets the side drawer — confirm whether return-to-main is `returnConversation` and reuse it; do not duplicate logic.
- Next: implementer runs T01.

## REFERENCES
- Related: detached-chat occlusion issue (this pass); Layouts menu file: discovery.
