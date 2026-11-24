# Plan: Make Escape dismissal of the slash-command palette stick while editing the token

## META
- Feature: Sticky Escape dismissal for the composer slash-command palette
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-23
- Baseline: main @ 1cbd02cd78e93771ddca6f0f490c31133919e44a
- Status: planning complete, implementation NOT started
- Source provenance: QA pass 22, fixture on http://127.0.0.1:4317 — with the palette open on `/xyz`, pressing Escape closes it, but typing one more character (`/xyza`) reopens it immediately. Escape can never be used to finish typing a literal slash token.

## OBJECTIVE
Escape dismisses the palette for the remainder of the token being edited. Success: after Esc, continued typing, deleting, or caret movement inside the same token does not reopen the palette; deleting the whole token, moving the caret outside it, or starting a new `/` token does.

## REQUIREMENTS
- Scope: `apps/web/src/ComposerCommands.tsx` state logic only.
- Current dismissal key: `const signature = token ? `${threadId ?? ''}:${projectId ?? ''}:${token.start}:${token.end}:${token.query}` : ''` — every keystroke changes `end`/`query`, so `signature !== dismissed` and the palette reopens.
- Required: key the dismissal on token identity, not contents. New signature: `` `${threadId ?? ''}:${projectId ?? ''}:${token.start}` ``. The `dismissed` value stores this string; `open` stays `Boolean(token && signature !== dismissed)`.
- The existing reset effect (`useEffect` clearing `dismissed` when it no longer equals `signature`) stays: moving to a different token start, deleting the token, or focusing a different draft clears the dismissal automatically.
- Refocus behavior: the `focus` listener currently calls `setDismissed('')`. Change it to re-dismiss on refocus when the caret is already inside a dismissed token: replace `setDismissed('')` with logic that recomputes the current token signature and sets `dismissed` to it — i.e. blurring and refocusing the textarea does NOT resurrect the palette. Reopening after refocus requires caret movement to a different token or fresh input that changes `token.start`.
- Everything else (debounced fetch, selection, Enter/Tab, aria wiring) is unchanged.
- Motion: none.

## REPO_MAP
- `apps/web/src/ComposerCommands.tsx` — `signature`, `dismissed`, `open`, the reset `useEffect`, and the `focus` listener in the position-tracking `useLayoutEffect`.
- `apps/web/src/composer-commands.ts` — `commandToken` already returns `start`; unchanged.

## DESIGN
Dismissal is per-token: `token.start` uniquely identifies the `/` token instance in the text. Holding `dismissed` equal to the current token's key keeps the palette closed across edits inside that token; any action that produces a different `token.start` (deletion and retype, new token elsewhere, caret into another token) re-arms it.

## EXECUTION_DAG
- T01: Change `signature` to `${threadId}:${projectId}:${token.start}` and update the `focus` listener to re-dismiss the current token on refocus instead of clearing the dismissal. Owner: one implementer. Done-when: `pnpm typecheck` passes; manual repro below holds.
- T02: Extend the palette unit tests: (a) open on `/`, Escape, type `x` — palette stays closed; (b) delete back past `/` — next `/` reopens; (c) Escape on `hello /mod`, click outside, refocus — palette stays closed. Done-when: tests fail before T01 and pass after.

## VALIDATION
- Fixture repro: `pnpm build` + review-host on :4317 (command in plan 1 / VALIDATION of issue body). Type `/`, press Escape, type `abc` — palette stays closed. Delete the token and type `/` again — palette reopens.
- Keyboard: verify Escape still calls `close()` and prevents propagation.
- Acceptance matrix: (a) Esc+type → closed; (b) Esc+refocus → closed; (c) new token after delete → open; (d) Esc with no token → no-op.

## STATE
Researched and decided; not implemented; not verified. Next step: T01 then T02.

## REFERENCES
- Component: apps/web/src/ComposerCommands.tsx
- Sibling finding this pass: palette empty-state suppression (separate issue).
