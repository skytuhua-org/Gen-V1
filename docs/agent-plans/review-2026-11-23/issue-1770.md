[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1770.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1770](https://github.com/skytuhua-org/Gen-V1/issues/1770). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Completed: [#1228](https://github.com/skytuhua-org/Gen-V1/pull/1228) merge 1cbd02cd78e93771ddca6f0f490c31133919e44a is an ancestor of successful main run 45318044111. Current source retains both late-registration checks and main Browser job 138189564451 passed both required browser exercises. Closed with evidence, without claiming a measured flake rate.

### Reviewed implementation references

- [PR #1228](https://github.com/skytuhua-org/Gen-V1/pull/1228): merged; merge `1cbd02cd78e93771ddca6f0f490c31133919e44a`.

Latest journal read: [7121739881](https://github.com/skytuhua-org/Gen-V1/issues/1770#issuecomment-7121739881). Earlier claims, tests, review findings and releases remain in the append-only journal.

## REQUIREMENTS

Preserve both shutdown orderings: reject registration after preClose and also reject a registration whose synchronous store callback closes the registry during registration. The deterministic regression must distinguish pre-fix failure from fixed behavior. Completion is the specific #1228 landing plus a reported post-merge main Browser result and its related acceptance-thread handoff; no broader release or statistical flake claim is implied.

## DESIGN AND VERIFIED STATE

T01-T03 code-walk, red/green regression and approval are recorded in [the implementation/review checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/1770#issuecomment-7089931208). T04 is complete: #1228 merged as `1cbd02cd78e93771ddca6f0f490c31133919e44a`. That commit is an ancestor of main run [45318044111](https://github.com/skytuhua-org/Gen-V1/actions/runs/45318044111) at `ea561dd4c0c818feb988244896260ad23ad7b340`. Its [Browser job 138189564451](https://github.com/skytuhua-org/Gen-V1/actions/runs/45318044111/job/138189564451) succeeded, including both split-workspace and project-memory/affected-context exercises. The audited main `event-stream.ts` retains both closed-registry checks. T05's evidence is recorded in [the closure checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/1770#issuecomment-7121739881) and handed to the #993/#1031 reviewer. The old top-main-blocker description below is historical. Issue state is CLOSED/completed.

---

Canonical plan file: [`docs/agent-plans/genv1-handoff-2026-11-22/07-sse-race-1227.md`](https://github.com/skytuhua-org/Gen-V1/blob/d96bca4c/docs/agent-plans/genv1-handoff-2026-11-22/07-sse-race-1227.md) · plans PR: https://github.com/skytuhua-org/Gen-V1/pull/1763

Filed by Chief of Staff at Xian's request (2026-11-22). The full plan follows; the canonical issue body is authoritative; the linked file is the historical published copy.

---

# Plan 07 — SSE shutdown race #1227 / PR #1228 (top main-green blocker)

## META
- Repo: skytuhua-org/Gen-V1 · Plan rev: 2 · 2026-11-22
- Baseline: `main@36fcc56d24cef7558059264a8540d7f0592d93cd`
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1227
- PR: https://github.com/skytuhua-org/Gen-V1/pull/1228 — open, mergeable
  (verified 2026-11-22), branch `fix/m01-sse-shutdown-c47e12` → `main`, head
  `fcf99f0e` + merges (`60ddeb0b` "fix(server): fail closed on late SSE
  reader registration after preClose").
- Related: #993 (Windows browser restart flake), #1031 (M01/M02 acceptance).
- Status: REVIEW — **RT owns the fix**; QA reports the Browser result on main
  after merge. **This is the top main-green blocker for plan 08.**

## OBJECTIVE
Fix the `/api/events` hijack shutdown race: a reader that registers **after**
Fastify's `preClose` has cleared the SSE reader registry survives shutdown's
only cleanup sweep — the server can hang or leak the connection. Success =
#1228 merged and QA's Browser result on main recorded.

## REPO_MAP (verified from branch)
- `apps/server/event-stream.ts` (+11/−1): adds `closedRegistries` (WeakSet of
  registries already swept at preClose), `destroyEventStreams` marks the
  registry closed and drains it, and `registerEventStream` now destroys a
  response that arrives after preClose (`closedRegistries.has(streams) →
  response.destroy()`), plus handles a synchronous store callback that
  initiates shutdown during registration.
- `tests/event-stream-fairness.test.ts` (+29): the race coverage.
- Call sites: `rg "registerEventStream|destroyEventStreams|/api/events"
  apps/server` — `apps/server/server.ts` wires the SSE route and preClose.

## EXECUTION_DAG
- T01 — RT: confirm the fix covers the ordering gap — registration
  during/after `preClose` must be rejected or tracked so the sweeper still
  closes it (the `closedRegistries` check). Verify no path can re-add to a
  closed registry. Done-when: code-walk note on the PR.
- T02 — race test: deterministic repro (register a reader in the
  preClose→close window) asserting the socket is destroyed; the added 29
  lines in `event-stream-fairness.test.ts` should fail on main without the
  fix — verify that. Done-when: fails on `main@36fcc56d`, passes on branch.
- T03 — REV review; SEC not strictly required unless the fix touches auth.
- T04 — merge at gate. **Prioritize over the merge queue** — green main
  unblocks baseline + RC.
- T05 — post-merge: QA reports the Browser test result on main; update
  #993/#1031 threads with the outcome.

## VALIDATION
- `source ~/.nvm/nvm.sh`
- `npx vitest run tests/event-stream-fairness.test.ts` — green on branch.
- New race test fails on main without the fix, passes with it.
- Server shutdown completes promptly with an in-window reader.
- `pnpm typecheck && pnpm lint`
- Done-when: #1228 merged and QA's main-run Browser result recorded.

## Historical STATE / RISKS
- Everything else in the release track waits behind this landing; escalate
  quickly if review stalls.

## REFERENCES
- Issue #1227, PR #1228, plans 08/10, issues #993/#1031.

## NEXT
Gen Runtime owns the fix; QA verifies on main after merge.
