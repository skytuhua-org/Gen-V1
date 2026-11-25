# Plan: Agent inbox accessibility fixes — labelled unread count, assertive error

## META
- Title: Agent inbox a11y — unread count is a bare number and the error strip is not announced assertively
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-22
- Baseline: main @ bffae7ff
- Status: researched, not implemented
- Source: manual QA + DOM audit of the built fixture app

## OBJECTIVE
Two small a11y defects in `apps/web/src/InboxView.tsx`: (1) the header badge `<span className="inbox-unread-count">1</span>` is a bare number with no accessible name — screen readers announce "1" with no meaning; (2) the error strip uses `role="status"` (polite), so an action failure can be missed — errors need `role="alert"`.

## REQUIREMENTS
- In scope: `apps/web/src/InboxView.tsx` lines 48 and 59.
- Badge: `<span className="inbox-unread-count" aria-label="{n} unread">{n}</span>` — visual unchanged (11px, `var(--muted)`, tabular-nums).
- Error strip: `role="alert"` instead of `role="status"`; keep `aria-live` implicit alert semantics. No visual change (`agent-inbox.css` line 61 unchanged).
- No new elements, no layout or motion changes.

## REPO_MAP
- `InboxView.tsx:48`: `{attention.unread>0&&<span className="inbox-unread-count">{attention.unread}</span>}` inside `.inbox-list-head` next to `<h2>Inbox</h2>`.
- `InboxView.tsx:59`: `{(attention.error||actionError)&&<p className="agent-inbox-error" role="status">{actionError||attention.error}</p>}`.
- Comparable pattern: `aria-label` is used on icon buttons in the same header (Refresh inbox, Filter).

## DESIGN
Edit two lines in `InboxView.tsx`:
1. Badge → `<span className="inbox-unread-count" aria-label={attention.unread===1?'1 unread':`${attention.unread} unread`}>{attention.unread}</span>` (pluralization: use `'unread items'` always — simpler: `aria-label={attention.unread+' unread items'}`; chosen: `aria-label={attention.unread + ' unread'}` for "1 unread"/"3 unread").
2. Error strip → `role="alert"`.
No CSS or test-config changes.

## EXECUTION_DAG
- T01 — Both InboxView edits (owner: implementer). Done-when: DOM shows labelled badge and `role="alert"` strip.
- T02 — Vitest spec (owner: implementer, depends on T01). Mount with `unread=2`: badge exposes name "2 unread". Trigger `attention.error`: strip has `role="alert"`. Done-when: spec passes.

## VALIDATION
- Unit per T02.
- Manual: NVDA/VoiceOver spot-check or `getComputedAccessibleNode`-style devtools check; visuals pixel-identical.
- Acceptance: badge named (T01); strip assertive (T01); no visual regression (T02).

## STATE
- Researched and decided; pending. Next: T01.

## REFERENCES
- `apps/web/src/InboxView.tsx:48,59`, `apps/web/src/agent-inbox.css:16,61`
