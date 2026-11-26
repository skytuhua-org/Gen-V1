[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1856.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1856](https://github.com/skytuhua-org/Gen-V1/issues/1856). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

[#1859](https://github.com/skytuhua-org/Gen-V1/pull/1859) is open and includes send-timeout paths from [#1855](https://github.com/skytuhua-org/Gen-V1/issues/1855). More importantly [#1282](https://github.com/skytuhua-org/Gen-V1/issues/1282) already covers scoped ConversationPane and explicitly excludes relative times, conflicting with this plan's relative-under-24h rule. Resolve the accepted-plan conflict and PR isolation before acceptance.

### Reviewed implementation references

- [PR #1859](https://github.com/skytuhua-org/Gen-V1/pull/1859): open; head `8e4e6de044f7041fcb0a01a496116bc301cd5673`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7104427508](https://github.com/skytuhua-org/Gen-V1/issues/1856#issuecomment-7104427508). Earlier claims, tests, review findings and releases remain in the append-only journal.

### T00: reconcile the overlapping accepted timestamp plans

[Issue #1282](https://github.com/skytuhua-org/Gen-V1/issues/1282) R01/T05 already cover the main transcript, SideChat and this scoped `ConversationPane`; R02/D2 require local absolute minute-precision time with system/12h/24h formatting, explicitly exclude relative time, and T08 requires an accepted revision for a relative-time change. This issue instead requires relative labels below 24 hours, fixed English/24-hour formatting and excludes SideChat. These are conflicting requirements, not a duplicate with identical acceptance.

T00 precedes further acceptance of T01/T02. Inputs are both full issue plans, #1430 and #1859 at their current heads. The existing feature owners record a shared timestamp policy or a deliberately distinct scoped-conversation policy, update both canonical plans and full Markdown mirrors without dropping either feature's unique requirements, and map each retained acceptance check to the chosen implementation. Until then, preserve both proposals and do not silently choose one. Independently, isolate #1859's timestamp changes from #1855's send-timeout paths or declare and review the explicit stack dependency. The unit and browser checks in T02 remain required after the decision.

---

# Plan: Timestamps on conversation messages

## META
- Feature: Show when each message was sent, next to its role label, in the scoped conversation transcript.
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev1, 2026-11-23
- Baseline branch: main @ 8f54f406b80f2d7d8ac09cc2a46557c125d681fa
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1856
- Current status: not implemented; planning only.
- Provenance: QA pass 21 on the review fixture host — message rows render only "You" / "Assistant" + text; no time anywhere, so message recency is unknowable. `message.head.createdAt` already exists on every `ConversationMessage` (conversation-read-models.ts).

## OBJECTIVE
Every message row shows its send time so a reader can tell message age at a glance. Success: each rendered message shows relative age (<24h) or absolute time (>=24h), updates every 60 s, and is announced to screen readers.

## REQUIREMENTS
- In scope: the scoped conversation transcript message rows in `apps/web/src/conversation-workspace/ConversationPane.tsx` and `conversation-pane.css`.
- Out of scope: side-conversation transcript (`SideChat.tsx` renders its own rows — unchanged), artifact cards, agent inbox items (existing relative ages elsewhere are untouched).
- Behavior:
  1. Each `<article className="scoped-conversation-message">` renders `<span className="scoped-conversation-role">` as `{role} · {time}`.
  2. Time rule, computed in the render with the local timezone: age < 24 h → relative `"42m ago"` (under 1 h use minutes `"5m ago"`, under 1 min `"now"`); age >= 24 h → `"Nov 21, 14:32"` (format `MMM D, HH:mm`, 24-hour, local TZ).
  3. `createdAt` missing or unparseable → render only the role label, no separator.
  4. A `setInterval(60000)` inside `ConversationPane` forces re-render every 60 s while the pane is mounted (clear on unmount). No timer when tab hidden is required; leave the interval running.
  5. Article `aria-label` becomes `{role}, {absolute time}` — e.g. `Assistant, Nov 23, 00:41` for screen readers; the visible separator `·` stays plain text.
- Accessibility: time is plain text inside the role label, so keyboard focus on the article reads role + absolute time via aria-label.
- Visual: time inherits `.scoped-conversation-role` styling (muted, same size); no new color, weight, or hover treatment. Layout unchanged — the label is a single line and must not wrap (add `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` on `.scoped-conversation-role`).
- Motion: none.

## REPO_MAP
- `apps/web/src/conversation-workspace/ConversationPane.tsx` — message `<article>` render at lines ~82-85 (`scoped-conversation-role` span). Owner of the JSX change (T01).
- `apps/web/src/conversation-workspace/conversation-pane.css` — `.scoped-conversation-role` at line 8. Owner of the nowrap rule (T01).
- `packages/contracts/conversation-read-models.ts` — `conversationMessageSchema.createdAt: z.string().max(100)` at line 26; no schema change needed.
- `apps/web/src/conversation-workspace/reader.ts`, `useScopedConversation.ts` — message pipeline; unchanged.
- Tests: vitest for the format helper; Playwright fixture check for rendered times.

## DESIGN
- New helper `formatMessageTime(iso: string, now: number): string` next to ConversationPane (same file, top-level function): returns `"now"`, `"{m}m ago"`, `"{h}h ago"`, or `"MMM D, HH:mm"`; returns `''` on parse failure. Month names: fixed English array `['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']`, no Intl dependency.
- New helper `formatAbsoluteTime(iso: string): string` → `"{Mon} {D}, {HH}:{MM}"` padded, for aria-labels.
- In the `state.messages.map` render: `const t = formatMessageTime(message.head.createdAt, now)`; render `{roleLabel}{t ? ' · ' + t : ''}`; aria-label `{roleLabel}, {formatAbsoluteTime(message.head.createdAt) || 'time unknown'}`.
- `const [now, setNow] = useState(() => Date.now()); useEffect(() => {const i = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(i);}, []);` inside ConversationPane.
- No backend or schema changes; `createdAt` is already populated for every row.

## EXECUTION_DAG
- T01 (Owner: ConversationPane.tsx + conversation-pane.css) — Add helpers, interval, render changes, nowrap CSS. Deps: none. Done-when: rows show `You · 3m ago` style labels and aria-labels carry absolute time. Handoff: T02.
- T02 (Owner: tests) — Vitest: `formatMessageTime` boundaries (0 s→now, 59 s→now, 1 m→"1m ago", 59 m, 1 h→"1h ago", 23 h→"23h ago", 24 h→absolute, invalid→''). Playwright on fixture: send in "Review session refresh" thread, assert `You · now` appears. Deps: T01. Done-when: tests pass. Handoff: PR review.

## VALIDATION
- Fixture launch: `pnpm build` then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)" &` → http://127.0.0.1:4317/.
- Manual: send a message, confirm `You · now`, assistant rows show `Assistant · Nm ago`; scroll, narrow width 520 px — label stays one line.
- Unit: `pnpm exec vitest run tests/conversation-message-time.test.ts` (new).
- Lint/typecheck: `pnpm lint && pnpm typecheck`.
- Acceptance matrix: relative under 24 h; absolute beyond; interval refresh changes `1m ago`→`2m ago` within 70 s; missing createdAt falls back to role only; aria-label has absolute time.

## Historical STATE
- Researched: `createdAt` present on `ConversationMessage`; rendering point identified.
- Implemented: nothing. Verified: nothing. Pending: T01-T02.
- Risks: recorded fixture messages may share a `createdAt` — fine, all show same age.
- Next step: implement T01.

## REFERENCES
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1856
- Baseline: main@8f54f40
- Related non-overlap: #1543 (turn duration) is a different UI element and stays unchanged.
