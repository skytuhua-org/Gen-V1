[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1721.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1721](https://github.com/skytuhua-org/Gen-V1/issues/1721). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Centered-chat restoration exists in open [#1807](https://github.com/skytuhua-org/Gen-V1/pull/1807). Returning from detached layout must be verified and landed before closure.

### Reviewed implementation references

- [PR #1807](https://github.com/skytuhua-org/Gen-V1/pull/1807): open; head `1c97a42da7af92ab23d0a1b284a7f4dca5674087`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7091733815](https://github.com/skytuhua-org/Gen-V1/issues/1721#issuecomment-7091733815). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

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
- Floating chat header gains a "Dock chat" button that restores the centered layout through the same `commit()` path `dock()` uses: `commit({...saved, mode:'full', detached:false}, immediate)` plus `setAnnouncement('Chat docked')`, labelled `aria-label="Dock chat"`, `title="Dock chat"`, `lucide` icon `PanelLeft` 15px, `.icon-button` styling identical to sibling header buttons (28×28px), shown only while floating (`layout.mode!=='full'`), placed between "Move chat panel" and "Dock chat to side drawer".
- Layouts menu gains a "Reset layout" item at the bottom, 13px `var(--text)`, hover `var(--hover)`, full-width row, min-height 32px, `padding:6px 8px`, `border-radius:4px`; activating it clears saved placement (floating + side-drawer + pane arrangement) to the default split and closes the menu. Disabled (opacity .45, `aria-disabled`, `cursor:default`) when the current layout already equals the default.
- Menu order: "Saved layouts" header, saved rows, "Save current layout…", separator (`.project-picker` style divider or 1px `var(--border)` line, margin 4px 0), "Reset layout".
- Keyboard: both controls reachable by Tab; "Dock chat" triggers on Enter/Space; menu item on Enter; Esc unchanged.
- Copy: "Dock chat" and "Reset layout" exactly. No confirmation prompt.
- Motion: menu item uses the shared `var(--ui-motion-hover)` `var(--ui-ease-move)` background transition; no new animation; reduced-motion no-op via existing global rule.
- Out of scope: the z-order occlusion bug (separate issue), saved-layout management (rename/delete).

## REPO_MAP
- `packages/ui-shell/ChatView.tsx` — owns the floating chat: `useState<ChatLayout>` (`mode:'full'|'drawer'|'popup'`, `detached`), `commit()` → `writeChatLayout`; `detach()` ~L40 sets `mode:'popup',detached:true`; `dock()` ~L38 sets `mode:'drawer'`; header buttons ~L123-124 — the new "Dock chat" button goes in this row.
- `packages/ui-shell/chat-layout.ts` — `ChatLayout`, `readChatLayout`/`writeChatLayout` (persisted to storage), rect clamping; the reset writes this record.
- `apps/web/src/App.tsx` or the Layouts menu component — "Save current layout…" menu; discovery: exact component name (search `Save current layout`).
- Scope note: `writePlacementRecord`/`ConversationPlacementRecord`/`dockFloat`/`returnConversation` in `App.tsx` govern split-workspace panes — NOT the chat; do not reuse them for this fix.
- Verified facts: only "Dock chat to side drawer" exists today; no reset; `ChatLayout` survives reload.

## DESIGN SPEC (exact values)
- Button order in floating header: Find, Move chat panel, Dock chat (new), Dock chat to side drawer, Detach — keep existing order of others.
- Reset semantics: `writeChatLayout` receives the pristine record `{mode:'full',detached:false}` (saved rects dropped); saved layouts list is preserved — reset affects the live layout only. If the Layouts menu also controls split-workspace placement, the same item clears `floating`/`mainPaneId` overrides via the existing placement write path — discovery in T02.
- All colors/sizes from existing tokens; no new tokens.

## EXECUTION_DAG
- T01 (owner A): add "Dock chat" header button in `ChatView.tsx` wired to `commit({...saved,mode:'full',detached:false})`. Done-when: clicking it restores `mode:'full'` and the chat renders centered full-width.
- T02 (owner A): add "Reset layout" menu item + disabled state + persistence clear. Done-when: menu shows the item, click restores default layout, disabled when already default.
- T03 (owner A): vitest for the reset reducer/record write (pure state — testable headlessly) + Playwright/manual check of both controls.

## VALIDATION
- Fixture setup: `pnpm build` first, then serve the fixture host — `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` — and browse http://127.0.0.1:4317 (the Vite dev server on :5173 fails API writes on Linux; use the built host only).
- `pnpm exec vitest run <new test>` PASS; `pnpm lint && pnpm typecheck` PASS.
- Manual matrix: detach → Dock chat → centered restored; side-drawer dock → Reset layout → centered restored; reload → default persists; Esc/Tab/Enter paths; narrow width 420px — item readable.
- Acceptance: each requirement maps to T01–T03 done-when above.

## Historical STATE
- Verified: no restore path exists; placement persists. Risks: `dockFloat` currently targets the side drawer — confirm whether return-to-main is `returnConversation` and reuse it; do not duplicate logic.
- Next: implementer runs T01.

## REFERENCES
- Related: detached-chat occlusion issue (this pass); Layouts menu file: discovery.
