# Plan: Agent inbox — error strip gains a Retry action and clears on recovery

## META
- Title: UI: Agent inbox error strip persists after recovery with no in-strip way to retry
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-23
- Baseline: main @ 65801227c0a5bc1cde9c3afc7eb889c3ceee0b70
- Issue: this issue (filed with this plan). Related: #1715 (changes the strip's role to `alert`; do not re-spec it here)
- Status: researched, not implemented
- Source: manual QA of the built fixture app on 127.0.0.1:4317 — during a server restart the strip showed "Failed to fetch" and stayed red after the server was healthy again; plus source audit of `apps/web/src/useAttention.ts` and `InboxView.tsx`

## OBJECTIVE
When an inbox fetch or action fails, `state.error` (`useAttention.ts:5,11-12`) is set and the strip renders until the next *successful* `refreshAttention()`. Refreshes only run on a subscription change event, a window `focus` event, a command, or the small refresh icon in the header — so a transient failure can leave a red "Failed to fetch" on screen for an unbounded time while the inbox is actually fine. The strip must offer an in-band way to recover.

## REQUIREMENTS
- In scope: the error strip markup in `apps/web/src/InboxView.tsx` (currently line 59) and a new rule in `apps/web/src/agent-inbox.css`.
- Out of scope: `useAttention.ts` fetch/subscribe logic (auto-clear on a successful refresh already exists — keep it); `Artifact.tsx`/`SurfaceBoundary.tsx` notices; any other surface.
- Structure (exact markup):
  ```tsx
  {(attention.error || actionError) && (
    <div className="agent-inbox-error" role="alert">
      <span className="agent-inbox-error-text">{actionError || attention.error}</span>
      <button
        type="button"
        className="agent-inbox-retry"
        onClick={() => { void act(() => attention.refresh()); }}
      >Retry</button>
    </div>
  )}
  ```
  (`role="alert"` follows #1715; if #1715 has not landed yet, `role="alert"` is applied here instead of keeping `role="status"`.)
- Copy (exact): the button label is `Retry`. No other text changes; `actionError || attention.error` precedence is unchanged.
- Behavior: clicking Retry calls `attention.refresh()`; on success the strip unmounts via the existing `error:''` path; on failure the strip stays with the new message. While the retry fetch is in flight the button is disabled: add `disabled` while a retry request is pending — track with `const [retrying,setRetrying]=useState(false)`, set `true` before the call and `false` in `request.finally`-equivalent via `request.then(done,done)`; disabled buttons get `aria-disabled` implicitly and must not be focusable (native `disabled`).
- Keyboard/a11y: the button is a native `<button>` — Tab reaches it, Enter/Space activates, focus outline follows the existing `.secondary`-style focus ring (`:focus-visible` 2px outline, `var(--accent)`). `role="alert"` announces the text on mount only; the button is not announced.
- Visual: strip layout changes from a text `<p>` to a flex row. CSS (new rule, appended to `agent-inbox.css`):
  ```css
  .agent-inbox-error{display:flex;align-items:center;gap:8px;}
  .agent-inbox-error-text{flex:1;min-width:0;}
  .agent-inbox-retry{flex:none;font:inherit;font-size:11px;padding:2px 8px;border-radius:4px;border:1px solid currentColor;background:none;color:inherit;cursor:pointer;}
  .agent-inbox-retry:hover{background:color-mix(in srgb,currentColor 12%,transparent);}
  .agent-inbox-retry:disabled{opacity:0.5;cursor:default;}
  ```
  Existing `.agent-inbox-error` color/padding rules stay; the added `display:flex` merges with them.
- Motion: none. Retry button hover is an instant background change, no transition.
- Reduced motion: identical behavior.

## REPO_MAP
- `apps/web/src/InboxView.tsx:59` — strip: `{(attention.error||actionError)&&<p className="agent-inbox-error" role="status">{actionError||attention.error}</p>}`.
- `apps/web/src/useAttention.ts:5,11-12,16-17` — `state.error` set on fetch failure and disconnect; cleared on successful `refreshAttention`; refresh triggers: subscribe `changed`, window `focus`, `change()`, `attention.refresh()`.
- `apps/web/src/Artifact.tsx:28` / `SurfaceBoundary.tsx:10` — sibling notices already pair an error with a "Retry rendering" button; this strip is the outlier.
- `apps/web/src/agent-inbox.css:61` — existing `.agent-inbox-error` rule (colors/padding) the new block merges with.

## DESIGN
Convert the strip from a bare `<p>` to a flex container with a text span and a retry button; the button reuses the existing `attention.refresh()` path, so no new data flow. No timer or auto-retry is added — recovery stays user- and subscription-driven (deterministic).

## EXECUTION_DAG
- T01 — Replace the strip markup in `InboxView.tsx` per the snippet, add the `retrying` state. Owner: implementer. Files: `InboxView.tsx` lines ~59 and state block ~line 20. Done-when: strip renders text + Retry; Retry disables while the request is in flight.
- T02 — Add the CSS rules to `agent-inbox.css` after the existing `.agent-inbox-error` rule. Owner: implementer. Depends: T01 (selectors must match). Done-when: strip lays out as one row; text truncates (`min-width:0` + `flex:1`) instead of wrapping under the button.
- T03 — Tests (existing InboxView spec file; create `apps/web/src/InboxView.test.tsx` if absent): with `attention.error='Failed to fetch'`, strip has `role="alert"` and a Retry button; clicking Retry calls `attention.refresh` once; button is `disabled` while the promise is unsettled. Owner: implementer. Depends: T01. Done-when: green.

## VALIDATION
- Fixture repro: `cd ~/repos/Gen-V1 && node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"`, open `http://127.0.0.1:4317`, open Agent inbox, stop the host, click Refresh inbox → strip shows "Failed to fetch" with a Retry button; restart the host and click Retry → strip clears.
- Unit per T03.
- Keyboard: Tab to Retry, Enter activates.
- Acceptance: T01 markup, T02 layout, T03 tests.

## STATE
- Researched and decided; pending implementation. Next: T01.

## REFERENCES
- `apps/web/src/InboxView.tsx:20,59`; `apps/web/src/useAttention.ts:5-17`; `apps/web/src/agent-inbox.css:61`; `apps/web/src/SurfaceBoundary.tsx:10`
