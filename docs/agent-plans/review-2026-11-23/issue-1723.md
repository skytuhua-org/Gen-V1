[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1723.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1723](https://github.com/skytuhua-org/Gen-V1/issues/1723). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

New-conversation focus repair is open in [#1782](https://github.com/skytuhua-org/Gen-V1/pull/1782); [#1780](https://github.com/skytuhua-org/Gen-V1/pull/1780) was closed as a duplicate. Guarded focus behavior, dialogs and busy/read-only states remain required.

### Reviewed implementation references

- [PR #1782](https://github.com/skytuhua-org/Gen-V1/pull/1782): open; head `f0dc6f8e67abfea080a471c3941f44af3a7c2640`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7091734337](https://github.com/skytuhua-org/Gen-V1/issues/1723#issuecomment-7091734337). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

# UI: Composer is not focused on the new-conversation screen

## META
- Feature: Focus composer textarea on empty conversation mount
- Repo: skytuhua-org/Gen-V1 · Plan rev 1, 2026-11-22
- Baseline: main @ bffae7ff03a16dcc5b9c10abd25b956564059ec2
- Provenance: QA pass 12, fixture :4317 — `document.activeElement` is `BODY` on the welcome screen
- Status: planning complete, implementation NOT started

## OBJECTIVE
On the welcome/empty-project screen ("What are we working on?" + composer) the caret is nowhere; the user must click or Tab ~18 times to type. Success: the composer textarea is focused on mount of a conversation view with no draft content, so typing and Enter work immediately; focus is not stolen when returning to an existing conversation mid-read or when a dialog opened the view.

## REQUIREMENTS
- On mount of `Composer` inside an empty conversation (new thread / zero messages), call `focus()` on the textarea once.
- Do NOT focus when: the conversation has messages (autofocus once on the NEW-conversation mount only, or when the active conversation id changes to an empty one); a modal is open on top; the mount is a restored floating/docked surface that the user did not just activate; `navigator.webdriver`-irrelevant — real behavior only.
- Do not scroll the page (`preventScroll:true` on `focus()` is required so a mid-list mount doesn't jump).
- iOS/mobile: focusing still fine; if the platform ignores programmatic focus without a gesture, behavior degrades gracefully (no error).
- Keyboard: after autofocus, typing inserts text; Esc clears draft via existing behavior; placeholder "Message" visible until input.
- a11y: `aria-label` on textarea unchanged; focus must land ON the textarea (a real, labelled control), not a wrapper — satisfies focus-management expectations.
- Motion: none; reduced-motion unaffected.
- Out of scope: slash-command hint, draft restoration UX.

## REPO_MAP
- `apps/web/src/App.tsx` — `<Composer …>` mounted ~L478; `allMessages`/empty-state gate ~L1176; thread switch `select`.
- Composer component file — discovery: `grep -rn "composer-input" apps/web/src` (textarea ref lives there; existing autofocus hook pattern may exist for dialogs — reuse it).
- Verified: `activeElement===BODY` at load on :4317 welcome screen.

## DESIGN SPEC (exact values)
- Implementation: in the Composer component, a `useEffect` keyed on `[thread.id]` that runs `textareaRef.current?.focus({preventScroll:true})` only when `!messages.length && !busy && !held && !readOnly` and `document.querySelector('[role="dialog"],.ui-modal') === null`.
- Guard against re-focus on every render: effect dep on thread id + `messages.length===0` transition only (store `didFocus` ref reset per thread id).
- No CSS change; no visible focus ring change (the existing `:focus-visible` outline `2px solid var(--ui-focus-ring)` shows only for keyboard users — programmatic focus must NOT show the ring; ensure the existing styles don't paint it for `.focus()` — if they do, no change is acceptable either; state which behavior ships).
- Copy/labels unchanged.

## EXECUTION_DAG
- T01 (owner A): locate Composer textarea ref; add guarded autofocus effect. Done-when: `document.activeElement` is the textarea after loading a new conversation; not after loading a conversation with messages.
- T02 (owner A): vitest or Playwright check on activeElement in both cases + dialog-open case. Done-when: passes locally.

## VALIDATION
- `pnpm exec vitest run <file>` PASS; `pnpm lint && pnpm typecheck` PASS.
- Manual: fresh /new → type immediately (no click) → sends; open existing thread with history → not focused; open Select project dialog, close → focus returns to textarea or composer (existing dialog focus-restore keeps working).
- Acceptance: every requirement → T01/T02.

## Historical STATE
- Verified: no autofocus today. Risks: composer mounts inside the split-workspace panes too — autofocus must apply only to the visible/active pane, not a hidden one (check `visible` flag used by ConversationFind pattern).
- Next: T01.

## REFERENCES
- Welcome screen markup: App.tsx ~L1176 `.empty-state`.
