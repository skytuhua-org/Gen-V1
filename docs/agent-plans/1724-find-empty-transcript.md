# UI: Find in conversation is enabled on an empty transcript

## META
- Feature: Disable conversation find when there is nothing to search
- Repo: skytuhua-org/Gen-V1 · Plan rev 1, 2026-11-22
- Baseline: main @ bffae7ff03a16dcc5b9c10abd25b956564059ec2
- Provenance: QA pass 12, fixture :4317 — 🔍 opens on an empty transcript and shows a ~8px-wide input
- Status: planning complete, implementation NOT started

## OBJECTIVE
The find-in-conversation button is active on a brand-new conversation with zero messages; opening it reveals a cramped input (~8px wide) with nothing to search. Success: the control is disabled with a tooltip when the transcript is empty; Ctrl+F/Cmd+F is a no-op then too.

## REQUIREMENTS
- 🔍 button `disabled` + `aria-disabled` + `title="No messages to search"` when transcript has 0 messages; styled `opacity:.45; cursor:default` (match existing disabled icon-button convention).
- The header-shortcut path (Ctrl+F / Cmd+F listener, wherever bound) must also no-op while empty — it must not open the bar.
- Re-enables the moment the transcript has ≥1 message; if the bar is open and the last message is deleted/cleared, close the bar and disable.
- Button remains in the same header position/toolbar order; `aria-label="Find in conversation"` retained (existing label — keep whatever the code uses).
- Keyboard: disabled control is skipped in tab order per native `disabled`; with messages present, Enter opens as today.
- Motion: the find-bar open/close transition unchanged; reduced-motion unaffected.
- Related: #1612 fixes the find bar's own layout (input too narrow ~8px). This issue covers only the empty-transcript gate; if #1612 lands first, rebase — no conflict expected (different change).
- Out of scope: the 8px input width itself (that is #1612), match highlighting.

## REPO_MAP
- `apps/web/src/App.tsx` L478 — `<ConversationFind ownerKey transcript={findTranscript} …/>`; `findTranscript` is a ref to `.canvas-thread-transcript`; message count = `messages.length` in the same component.
- `apps/web/src/ConversationFind.tsx` (name discovery) — the bar/button + Ctrl+F listener.
- Verified: button enabled + bar opens at zero messages on :4317.

## DESIGN SPEC (exact values)
- Pass `empty={messages.length===0}` (or compute inside via existing transcript prop) → render the find trigger `disabled` with `title="No messages to search"`.
- Inside `ConversationFind`, gate the keyboard shortcut handler: `if(!hasMessages) return;` before opening; gate any programmatic `open()` call the same way.
- If bar open and count drops to 0: call the existing close path and focus returns to the previously focused element (reuse existing restore behavior).
- Disabled styling: `opacity:.45` (existing disabled pattern); no new tokens.

## EXECUTION_DAG
- T01 (owner A): add empty gate to trigger + shortcut + auto-close on zero. Done-when: all three paths verified.
- T02 (owner A): vitest on the gate logic + Playwright click/Ctrl+F on empty vs non-empty. Done-when: passes.

## VALIDATION
- vitest PASS; `pnpm lint && pnpm typecheck` PASS.
- Manual matrix: empty transcript {click 🔍, Ctrl+F} → nothing; one message sent → button enabled, bar opens, search works; delete/clear → disabled again. 420px width recheck.
- Acceptance: requirements ↔ T01/T02 mapping above.

## STATE
- Verified live. Risk: `findTranscript` is a DOM ref — derive emptiness from `messages.length` (React state), not DOM text.
- Next: T01.

## REFERENCES
- #1612 (find input width) — companion fix, land either order.
