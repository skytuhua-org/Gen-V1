[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1855.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1855](https://github.com/skytuhua-org/Gen-V1/issues/1855). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Send-timeout/cancel/error work exists in open [#1858](https://github.com/skytuhua-org/Gen-V1/pull/1858). T03 browser validation remains pending; promise-race tests do not prove the real transport UI path.

### Reviewed implementation references

- [PR #1858](https://github.com/skytuhua-org/Gen-V1/pull/1858): open; head `df655bdc23a8a5c640a1febc280ca8f07a03ca38`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7104426821](https://github.com/skytuhua-org/Gen-V1/issues/1855#issuecomment-7104426821). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

# Plan: Send timeout and cancel for the conversation composer

## META
- Feature: Add a 120-second send timeout and a user-cancel to the scoped conversation composer send path.
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev1, 2026-11-23
- Baseline branch: main @ 8f54f406b80f2d7d8ac09cc2a46557c125d681fa
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1855
- Current status: not implemented; planning only.
- Provenance: QA pass 21 on the review fixture host. In thread "Explore the component catalog" the send spinner ran >90 s with no stop control, no error, and the draft stayed locked in the composer; Escape did not cancel. Root cause: `ComposerStore.submit` awaits `actions.sendParent(...)` with no timeout; the UI Stop button renders only when `agent.working`, not during `state.busy`.

## OBJECTIVE
A send whose transport stalls must not wedge the composer. Success: any send that does not complete within 120 s surfaces a retryable error and frees the draft; the user can also cancel a send in flight from the composer with one click or Escape, keeping the draft.

## REQUIREMENTS
- In scope: the scoped thread composer (`ScopedConversationComposer` + `ComposerStore.submit` send path) and its send button in `ComposerView`.
- Out of scope: side-conversation composer, follow-up sends to inventory agents (the `followUp.send` branch), server-side timeouts, model run stopping (existing `stop()`).
- Behavior:
  1. While `state.busy` is true during a send, the send button becomes a "Cancel send" control (CircleStop icon, `aria-label="Cancel send"`), enabled unless `state.stopping` or `held`.
  2. Clicking it aborts the in-flight `sendParent` promise, sets `busy:false`, shows error text `Send canceled. Your draft was kept.` and `retry:true`.
  3. Pressing Escape while the message textarea is focused and a send is in flight performs the same cancel.
  4. If no cancel happens, a 120 s `AbortSignal.timeout(120000)` on the transport aborts the send, sets `busy:false`, error `Send timed out after 2 minutes. Retry this message.`, `retry:true`.
  5. Draft text is never lost on cancel or timeout (existing journal retry path already preserves it).
  6. The pending journal record stays until a later send succeeds (existing behavior); cancel must not clear `value.pending`.
- Compatibility: unchanged when a send completes normally; no API changes.
- Accessibility: cancel button is a real `<button>` in the same slot as the send button, focusable in the normal tab order; error text renders into the existing composer error element which is announced by the existing live region.
- Error/recovery: any transport abort (timeout or cancel) reuses the existing `retry:true` error path; a rejected send still clears `value.pending` per existing logic.

## REPO_MAP
- `apps/web/src/agents-workspace/composer.ts` — `ComposerStore.submit` (lines ~138-218): emits `busy:true`, awaits `actions.sendParent`/`followUp.send`, then `finally emit(busy:false)`. No timeout, no abort handle. Owner of this change (file owned by task T01).
- `apps/web/src/ScopedConversationComposer.tsx` — send/stop buttons at line ~54: `working ? <CircleStop Stop agent> : <ArrowUp Send/Retry>`; `held` gates everything; `send()` calls `composers.submit(target)`.
- `packages/contracts/agent-work.ts` / `apps/web/src/agent-work-api.ts` — `sendParent` implementation (HTTP POST); accepts no AbortSignal today.
- `apps/web/src/conversation-workspace/ConversationPane.tsx` — renders composer via `renderComposer`; not modified.
- Tests: `tests/` vitest; Playwright suites exist for UI flows (see CONTRIBUTING.md).

## DESIGN
- Add an `AbortController` field `sendAbort` on the composer store entry (`entries` map value in `composer.ts`).
- In `submit`, before calling `actions.sendParent`/`followUp.send`, create `ctrl = new AbortController()`, store it on the entry, and race the transport against `AbortSignal.timeout(120000)` and `ctrl.signal`. Implementation: wrap the awaited call in `Promise.race([transport, new Promise((_,rej)=>{ctrl.signal.addEventListener('abort',()=>rej(new DOMException('canceled','AbortError'))); setTimeoutId=setTimeout(()=>ctrl.abort(),120000)})])`; pass `ctrl.signal` through to the API layer so the fetch aborts too (add optional `signal` param to `sendParent` and `followUp.send`, forwarded to `fetch`).
- On `AbortError` from `ctrl`: distinguish cancel vs timeout via `ctrl.signal.aborted && timedOut` flag; emit the matching error copy above with `retry:true`.
- `ComposerStore.cancel(agent)` (new method): calls `entry.sendAbort?.abort('user')`.
- In `ScopedConversationComposer.tsx`: when `state.busy` render `<button className="send-button stop-button" aria-label="Cancel send" disabled={held||state.stopping} onClick={()=>composers.cancel(target)}><CircleStop size={18}/></button>` before the working/not-working send/stop buttons; on textarea `onKeyDown`, when `state.busy && event.key==='Escape'`, call `composers.cancel(target)`.
- Clear the timeout in `finally` of the send race and reset `sendAbort` to undefined.
- Motion: none new; button swap is instant, no transition.

## EXECUTION_DAG
- T01 (Owner: composer.ts file) — Add `sendAbort` plumbing, timeout race, `cancel()` method, `signal` passthrough. Deps: none. Edits: `composer.ts`, `agent-work-api.ts`, `follow-up.ts` (signal param only). Done-when: a stubbed `sendParent` that never resolves triggers `retry` error after 120 s; `cancel()` triggers cancel error immediately. Handoff: none.
- T02 (Owner: ScopedConversationComposer.tsx) — Render Cancel send button during `busy`, Escape cancel, correct disabled states. Deps: T01. Done-when: UI shows cancel control while busy; click and Escape both cancel. Handoff: none.
- T03 (Owner: tests) — Vitest unit test with fake timer: assert timeout error at 120 s and cancel path; Playwright test on fixture host: block the send POST, click Cancel send, assert draft retained and error text. Deps: T01,T02. Done-when: tests pass in `pnpm exec vitest run` and Playwright run. Handoff: PR review.

## VALIDATION
- Fixture launch (reproduces environment): build the UI (`pnpm build`) then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)" &` and open http://127.0.0.1:4317/.
- Manual check: throttle/block the send request (Playwright `page.route`) on the "Explore the component catalog" thread; send; assert Cancel send button appears, Escape and click both cancel, draft retained, error text shown; unblocked send still works.
- Unit: `pnpm exec vitest run tests/composer-send-timeout.test.ts` (new).
- Lint/typecheck: `pnpm lint && pnpm typecheck`.
- Acceptance matrix: cancel click = error shown + draft kept; Escape = same; timeout = error at 120 s; normal send unchanged; `held` disables cancel.

## Historical STATE
- Researched: repro confirmed on fixture (send spinner >90 s, no cancel affordance, Escape inert).
- Implemented: nothing. Verified: nothing. Pending: T01-T03.
- Risks: `sendParent` may buffer the command server-side even after client abort — acceptable, the pending journal path already covers server-accepted sends (existing `rejected`/uncertain logic untouched).
- Next step: implement T01.

## REFERENCES
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1855
- Baseline: main@8f54f40
- Fixture script: scripts/review-host.ts (`openReviewHost`)
