# UI: Detached chat is hidden under the right workspace panel — move/dock controls unreachable

## META
- Feature: Floating (detached) chat z-order fix
- Repo: skytuhua-org/Gen-V1 · Plan rev 1, 2026-11-22
- Baseline: main @ bffae7ff03a16dcc5b9c10abd25b956564059ec2
- Source provenance: QA pass 12, fixture app on http://127.0.0.1:4317, Chrome/Playwright verification
- Status: planning complete, implementation NOT started

## OBJECTIVE
With the chat detached (header ⤢ "Detach chat"), opening the right workspace panel (e.g. Inspect changes → Diff/Artifact tabs) renders `.workspace-tools`/`.workspace-right` OVER the floating chat: `document.elementFromPoint` at the chat's center returns the workspace tabpanel, the chat is painted beneath the panel, and its Move (⋮⋮) and "Dock chat to side drawer" controls cannot be clicked. The detached placement persists across reload, so the only recovery is keyboard "Move chat panel" or closing the right panel. Success: the floating chat always paints above the right panel and its controls remain clickable wherever it sits.

## REQUIREMENTS
- Floating chat surface must render above `.workspace-right` and `.workspace-tools` (incl. the `role=tablist` "Workspace views" and the "Add surface" + button) in paint order and hit-testing, at every position the window can occupy.
- Applies to every floating conversation window, not only "New conversation".
- No change to drag-move, arrow-key move (Shift for larger steps), resize handles, or "Dock chat to side drawer" behavior.
- Reduced motion and all theme tokens unchanged.
- Out of scope: default detach position, layout reset affordances (tracked in a separate issue).

## REPO_MAP
- `packages/ui-shell/ChatView.tsx` — owns the floating chat: `ChatLayout` state (`mode:'popup'|'drawer'|'full'`, `detached`), `commit()` → `writeChatLayout` (`chat-layout.ts`); header buttons "Move chat panel"/"Detach chat"/"Dock chat to side drawer" ~L123-124.
- `packages/ui-shell/chat-view.css` — `.chat-view-slot { position:relative; isolation:isolate }` (line 1) traps child z-index inside the slot's stacking context — the actual root cause; `.chat-view-surface:not([data-chat-mode=full]) { z-index:40; border-radius:14px }` (line 6) — the floating surface.
- `apps/web/src/workspace-canvas.css` + `styles.css` — `.workspace-right` (observed z-index 28) and `.workspace-tools` (tablist "Workspace views", "Add surface" +) — the layer that wins over the chat.
- `styles.css`/`tokens.css` — `--ui-layer-*` tokens (scrim, drawer) to reuse for layer ordering.
- Verified facts: elementFromPoint at the chat's center returns `.workspace-panel-content`/tablist; the chat's z=40 loses through stacking-context/DOM order, not the number.

## DESIGN SPEC (exact values — no design choices left)
- Root cause: `.chat-view-slot` (the wrapper, `ChatView.tsx` L118) has `isolation:isolate`, so the child's `z-index:40` is trapped inside the slot's own stacking context and can never beat `.workspace-right` (z=28) at the top level. Raising `.chat-view-surface`'s z-index therefore cannot work.
- Fix on the wrapper, not the child: in `packages/ui-shell/chat-view.css` give the slot a layer that wins only while a floating chat lives inside it — `.chat-view-slot:has(> .chat-view-surface:not([data-chat-mode=full])) { z-index: var(--ui-layer-floating) }`. Add `--ui-layer-floating` to the layer tokens, one step above the right panel's layer: `--ui-layer-floating: calc(var(--ui-layer-right-panel, 28) + 10)`. If `--ui-layer-right-panel` does not exist, introduce it with value `28` on `.workspace-right` (the observed computed value) so ordering is expressed in tokens, not literals.
- Keep `isolation:isolate` on the slot (it localizes inner stacking); the wrapper's new z-index is what competes at the top level. When the chat is `data-chat-mode=full` the `:has()` guard does not match and the slot stays at its current layer — centered layout unchanged.
- No `transform`, `filter`, or `backdrop-filter` may be added to `.chat-view-slot`, `.workspace-tools`, `.shell-workarea`, or their ancestors — any of them would create another trapping stacking context.
- Verification is hit-testing, not paint order: `document.elementFromPoint` at the chat's center must return a `.chat-view-surface` descendant while the right panel is open.
- No visual change otherwise: identical borders, shadows (`box-shadow` on the floating window unchanged), header layout, 28×28px `.icon-button` controls.
- Keyboard: no new shortcuts; focus order unchanged; when the chat overlaps the panel, Tab must still reach the chat's header buttons (verify, since pointer hit-testing and tab order are independent).
- Motion: none added; the existing panel-open transition is unchanged; `prefers-reduced-motion` behavior unchanged.

## EXECUTION_DAG
- T01 (owner: implementer A): add `--ui-layer-floating`/`--ui-layer-right-panel` tokens; apply the `:has()` z-index rule on `.chat-view-slot` in `packages/ui-shell/chat-view.css` (wrapper fix — child z-index cannot escape `isolation:isolate`). Done-when: `elementFromPoint` at the floating surface's center returns a chat descendant with the right panel open, and the centered (`full`) chat is unchanged.
- T02 (owner: A): vitest + Playwright check — script `scripts/test-browser.ts` pattern or a new vitest asserting `elementFromPoint` at the floating window's center returns a chat descendant while the right panel is open. Done-when: test passes locally.
- T03 (owner: A): manual verify in fixture: detach chat → open right panel → click Dock, Move, resize handles at overlap region; reload → repeat. Done-when: all controls work at 3 positions (over panel, partially off-panel, fully off-panel).

## VALIDATION
- Fixture setup: `pnpm build` first, then serve the fixture host — `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` — and browse http://127.0.0.1:4317 (the Vite dev server on :5173 fails API writes on Linux; use the built host only).
- `pnpm exec vitest run <new test file>` — PASS required.
- `pnpm lint && pnpm typecheck` — PASS.
- Manual (fixture host :4317 + built web): matrix {panel open × chat over panel, chat half-off right edge, chat on left side} × {click Dock, drag Move handle, arrow-key move, drag resize} — every cell must hit the chat.
- Acceptance matrix: R1 floating above panel (T01,T02,T03); R2 all floating windows (T03); R3 no behavior regressions (T03 + existing tests); R4/reduced-motion no-op (code review).
- Note: file-access/path-guard vitest files fail on Linux; keep tests DOM/logic-only or mark for CI windows-latest.

## STATE
- Verified: occlusion reproduced live (elementFromPoint + pointer-events interception, persisted across reload). Not implemented. Risks: other floating surfaces (document windows) may share the wrapper — the fix must cover them if they use the same layer, otherwise document the exception.
- Next: implementer runs T01.

## REFERENCES
- Issue this plan: https://github.com/skytuhua-org/Gen-V1/issues/1720
- Related UX gap (restore centered layout): separate issue, this pass.
