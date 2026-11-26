# Plan: Agent inbox — mark-read must not dead-end on a hanging request

## META
- Title: UI: A hanging mark-read request permanently dead-ends an inbox row
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-23
- Baseline: main @ 65801227c0a5bc1cde9c3afc7eb889c3ceee0b70
- Issue: this issue (filed with this plan)
- Status: researched, not implemented
- Source: source audit of `apps/web/src/InboxView.tsx` and `apps/web/src/useAttention.ts`; during fixture QA on 127.0.0.1:4317 a mark-read POST was observed to never receive a response, after which the row could never be marked read and no error appeared

## OBJECTIVE
`recordRead` caches the in-flight POST in `activeReads` (`InboxView.tsx:25,32-34`) and returns the same promise for every later read of that row. `useAttention.change()` has no timeout (`useAttention.ts:17`): if the POST never settles, the promise stays pending forever, every later selection of the row silently does nothing (the dot, header count and reader stay "unread"), and `setActionError` never runs because `act()` only fires on settle. A failed POST is fine (`finish` clears the entry and `act` surfaces the error) — only a *hung* request dead-ends the row. Add a bounded wait so a hang degrades into a surfaced, retryable error.

## REQUIREMENTS
- In scope: `useAttention.ts` `change()` (line 17) only. `InboxView.tsx` needs no change — `finish` already removes `activeReads` entries on settle and `act` already surfaces rejection.
- Out of scope: server-side timeout, subscription reconnect logic, GET `/api/attention` (a hung list fetch fails the same way but is covered by a separate defect class — the strip already shows `error` once the fetch rejects; adding a timeout there is acceptable and specified below as one shared helper).
- Design — one shared timeout wrapper in `useAttention.ts`:
  ```ts
  async function bounded<T>(work:Promise<T>):Promise<T>{
    return await Promise.race([
      work,
      new Promise<never>((_,reject)=>setTimeout(()=>reject(Error('The inbox is not responding. Try again.')),15000)),
    ]);
  }
  ```
  Apply it in `change()`: `await bounded(authenticated(()=>fetch(...)).then(read));` and in the GET inside `refreshAttention()`: `const value=await bounded(authenticated(()=>fetch('/api/attention',...)).then(read<AttentionEnvelope>));`.
- Timeout: 15000 ms (15 s). Copy (exact): `The inbox is not responding. Try again.`
- Resulting behavior: a hung mark-read rejects at 15 s → `act()` sets `actionError` to that string → the error strip shows it (and, per #1715 / the error-strip plan, offers Retry); `finish` deletes the `activeReads` entry so selecting the row again issues a fresh POST; `markUnread`'s `await read?.catch(()=>{})` is unaffected.
- States: no new UI states. While the POST is pending the row behaves exactly as today (unread styling until the server confirms).
- Keyboard/a11y: unchanged — the failure surfaces through the existing error strip.
- Motion: none. Reduced motion: unchanged.

## REPO_MAP
- `apps/web/src/useAttention.ts:17` — `change()` POSTs then `refreshAttention()`; no timeout.
- `apps/web/src/useAttention.ts:11` — GET `/api/attention` inside `refreshAttention()`; same unbounded wait.
- `apps/web/src/InboxView.tsx:25` — `activeReads` map; `:32-34` `recordRead` reuses `pending`, clears via `finish` on settle; `:43` `choose` starts the 500 ms `markTimer`; `:39` `markUnread` awaits the in-flight read.
- `packages/core/attention.ts` — server side is out of scope; this is a client resilience fix.

## DESIGN
`Promise.race` against a 15 s rejector, applied in the two fetch paths of `useAttention.ts`. No AbortController is required (a dangling fetch is harmless — the race already settled). The rejection message reaches `setActionError` / `state.error` through the existing catch paths.

## EXECUTION_DAG
- T01 — Add `bounded()` to `useAttention.ts` and wrap the POST in `change()` and the GET in `refreshAttention()`. Owner: implementer. Files: `useAttention.ts` lines ~11 and ~17. Done-when: both fetches reject with `The inbox is not responding. Try again.` after 15 s without a response.
- T02 — Unit test in the existing useAttention spec file (or `apps/web/src/useAttention.test.ts` if absent): fake `fetch` that never resolves + fake timers → `markRead` rejects with the exact string after advancing 15000 ms; a second `markRead` for the same id issues a second fetch (not a shared promise). Owner: implementer. Depends: T01. Done-when: green.

## VALIDATION
- Fixture repro: `cd ~/repos/Gen-V1 && node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"`, open `http://127.0.0.1:4317` → Agent inbox, select an unread item; with the POST path blocked (server stopped mid-flight or `fetch` stubbed), the row surfaces `The inbox is not responding. Try again.` within 15 s and re-selecting it retries instead of going silent.
- Unit per T02.
- Regression: normal mark-read still completes in <1 s with no visible change.
- Acceptance: T01 behavior, T02 tests.

## STATE
- Researched and decided; pending implementation. Next: T01.

## REFERENCES
- `apps/web/src/useAttention.ts:11,17`; `apps/web/src/InboxView.tsx:25,32-34,39,43`; `packages/core/attention.ts`
