[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1713.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1713](https://github.com/skytuhua-org/Gen-V1/issues/1713). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Inbox age refresh is open in [#1754](https://github.com/skytuhua-org/Gen-V1/pull/1754), stacked on [#1751](https://github.com/skytuhua-org/Gen-V1/pull/1751). The stack order and interval/cleanup checks must be preserved.

### Reviewed implementation references

- [PR #1754](https://github.com/skytuhua-org/Gen-V1/pull/1754): open; head `06cd51640711ba906000ea4762b8448fb3004b11`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7088450638](https://github.com/skytuhua-org/Gen-V1/issues/1713#issuecomment-7088450638). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

# Plan: Keep inbox row ages and reader timestamps live

## META
- Title: Agent inbox ages never update ("now"/"1m" freeze until re-render)
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-22
- Baseline: main @ bffae7ff
- Status: researched, not implemented
- Source: manual QA of the built fixture app (Agent inbox)

## OBJECTIVE
Row ages are computed once per render (`age()` reads `Date.now()`), so an item that arrived 30s ago still shows "now" hours later until some unrelated re-render. Ages must tick on a minute cadence.

## REQUIREMENTS
- In scope: `apps/web/src/InboxView.tsx` only.
- Out of scope: attention data model, server sync, other panes' timestamps.
- Rendering: ages re-render every 30–60s while the inbox is mounted; no per-row timers.
- Format unchanged: `now`, `Nm`, `Nh`, `Nd` (existing `age()`).
- No visual or layout change; a11y unchanged (time is presentational text).

## REPO_MAP
- `apps/web/src/InboxView.tsx` line 15: `age(value)` = minutes since `Date.parse(value)`, called inline per row and in the reader header.
- Ages only refresh when state changes (items, filter, query, single/columns, actionVersion).
- Timer pattern precedent: `ShellNotice` uses `setInterval`/`setTimeout` cleanup; use a single interval at component scope.

## DESIGN
Add a lightweight re-render tick: `const [, setTick] = useState(0)` with `useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 30_000); return () => clearInterval(id); }, [])`. All `age()` calls recompute on each tick. 30s keeps 'now'→'1m' within one minute of truth and 'Nm' accurate to ≤60s — matching the app's existing minute granularity; no `Intl.RelativeTimeFormat` or shared util needed since `age()` already centralizes the format.
- Interval is cleared on unmount; paused tab timers resume on focus (the existing `focus` listener already refetches, which re-renders anyway).

## EXECUTION_DAG
- T01 — Add tick in InboxView (owner: implementer). Insert the interval effect above `head`. Done-when: a row's label advances from "now" to "1m" within ≤60s with no other interaction.
- T02 — Vitest fake-timers spec (owner: implementer, depends on T01). Mount with an item 90s old, `vi.advanceTimersByTime(61_000)`, assert "2m" rendered. Done-when: spec passes; no leaked interval after unmount.

## VALIDATION
- Unit: fake-timer spec per T02.
- Manual: leave inbox open ≥2 min; ages advance without clicks; no extra renders when inbox is on another hidden view (interval only while mounted).
- Acceptance: ages tick (T01); format unchanged (T01); unmount cleans up (T02).

## Historical STATE
- Researched and decided; pending. Next: T01.

## REFERENCES
- `apps/web/src/InboxView.tsx`, `apps/web/src/ShellNotice.tsx` (timer precedent)
