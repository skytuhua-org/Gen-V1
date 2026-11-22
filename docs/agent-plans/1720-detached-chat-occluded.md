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
- `apps/web/src/App.tsx` — `renderSplitRoot()` mounts `<WorkspaceSplitLayout … floating=…>`; `detachConversation` (~L986) writes `floating[view.id].rect`.
- `apps/web/src/WorkspaceSplitLayout.tsx` — renders floating surfaces and the `.workspace-tools` area; stacking contexts live here.
- `apps/web/src/workspace-canvas.css` (and `styles.css`) — `.workspace-right` (observed z-index 28), floating `main.workspace.chat-view-surface` (observed `position:fixed; z-index:40` inside a lower stacking context).
- `styles.css` — `--ui-layer-*` token declarations (scrim, drawer, etc.) to reuse for layer ordering.
- Verified facts: workspace panel z=28 wins over floating chat because the chat's z=40 sits inside a different stacking context.

## DESIGN SPEC (exact values — no design choices left)
- In `WorkspaceSplitLayout.tsx`/its CSS, ensure the floating surface container creates its top-level stacking layer ABOVE the right panel: give the floating surface's outer wrapper `z-index: var(--ui-layer-floating)` and add `--ui-layer-floating` to the layer tokens, set one step above the right panel's layer: `--ui-layer-floating: calc(var(--ui-layer-right-panel, 28) + 10)`. If `--ui-layer-right-panel` does not exist, introduce it with value `28` (the observed computed value) on `.workspace-right`.
- The wrapper must NOT create a containing transform/filter on ancestors that would re-nest it under the panel: no `transform`, `filter`, or `backdrop-filter` may be added to `.workspace-tools`, `.shell-workarea`, or their ancestors.
- No visual change otherwise: identical borders, shadows (`box-shadow` on the floating window unchanged), header layout, 28×28px `.icon-button` controls.
- Keyboard: no new shortcuts; focus order unchanged; when the chat overlaps the panel, Tab must still reach the chat's header buttons (verify, since pointer hit-testing and tab order are independent).
- Motion: none added; the existing panel-open transition is unchanged; `prefers-reduced-motion` behavior unchanged.

## EXECUTION_DAG
- T01 (owner: implementer A): locate the stacking rule that lets `.workspace-right`/`.workspace-tools` paint above the floating surface; add `--ui-layer-floating`/`--ui-layer-right-panel` tokens in `styles.css`; apply `--ui-layer-floating` to the floating wrapper in `WorkspaceSplitLayout.tsx` or `workspace-canvas.css`. Done-when: computed z-index of the floating wrapper resolves above the right panel in Chrome DevTools.
- T02 (owner: A): vitest + Playwright check — script `scripts/test-browser.ts` pattern or a new vitest asserting `elementFromPoint` at the floating window's center returns a chat descendant while the right panel is open. Done-when: test passes locally.
- T03 (owner: A): manual verify in fixture: detach chat → open right panel → click Dock, Move, resize handles at overlap region; reload → repeat. Done-when: all controls work at 3 positions (over panel, partially off-panel, fully off-panel).

## VALIDATION
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
