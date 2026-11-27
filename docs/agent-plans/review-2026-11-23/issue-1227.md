**Full current issue mirror:** [issue-1227.md](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1227.md). The publication checkpoint pins the exact commit.

# Runtime shutdown admission and socket cleanup: verified completion

## OBJECTIVE AND REQUIREMENTS

Repair the proven late-SSE-registration source bug and the rev-2 remaining socket-close cases without changing event order, active-reader cleanup, approval authority, production flags, backend choice, native confinement, or active HTTP response delivery. Preserve the original negative tests, historical failed Windows observations, and review exception. The complete original requirements and rev-2 task are retained under the historical record below.

## EXECUTION_DAG

| Task | Dependency, executable work and files | Positive/negative acceptance and handoff | State |
| --- | --- | --- | --- |
| T01 | None. Inspect `event-stream.ts` and reproduce registration after `destroyEventStreams`. | Late registration retains no stream, allocates no subscription, and destroys its response; supply failing reproduction to T02. | DONE; original RED/GREEN journal retained. |
| T02 | T01. Add permanent registry shutdown and the reentrant registration guard; retain ordinary order/reader cleanup tests. | Seven fairness cases pass; merged fix does not turn this into a native security PASS. | DONE in #1228; independent current-main source review and hosted 7/7 verified. |
| T03 | T02. Count active requests in `server.ts`, destroy zero-request sockets in preClose, end a socket after its last response finishes, and test the four real socket states. | Four socket tests pass; active response is delivered; actual Windows Browser restart cases pass after merge for the fix and following integrated changes. | DONE in #1898; two subsequent main push runs verified. |

## META

- Repository: `skytuhua-org/Gen-V1`.
- Reconciliation revision: `2026-11-24-audit-r1`; source reviewed at `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`.
- Provenance: the original issue requirements and full journal, merged PRs [#1228](https://github.com/skytuhua-org/Gen-V1/pull/1228) and [#1898](https://github.com/skytuhua-org/Gen-V1/pull/1898), independent post-merge source review, and the exact Windows CI logs below.
- Implementation status: merged and verified on two subsequent main push runs. This update preserves the historical findings and failed attempts below.
- Audit worker: `codex-cloud-issue-early-6ab2f9`; coordination [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). No implementation scope is claimed.

## REPO_MAP

- [`apps/server/event-stream.ts`](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/apps/server/event-stream.ts): `closedRegistries`, `destroyEventStreams`, and both late/reentrant registration guards.
- [`apps/server/server.ts`](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/apps/server/server.ts): per-socket active-request accounting and `preClose` cleanup.
- [`tests/event-stream-fairness.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/tests/event-stream-fairness.test.ts): seven cases, including late registration without subscription, synchronous shutdown during registration, delivery order, and active-reader cleanup.
- [`tests/host-close-connections.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/tests/host-close-connections.test.ts): four real HTTP/socket cases for preconnect, incomplete headers, in-flight response drainage, and completed keep-alive requests.
- [`tests/e2e/tool-effects-host.spec.ts`](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/tests/e2e/tool-effects-host.spec.ts) and [`tests/e2e/host-loop.spec.ts`](https://github.com/skytuhua-org/Gen-V1/blob/a5f81d8efc5f23d6336c37b2b1eb9115388ed693/tests/e2e/host-loop.spec.ts): actual host restart and durable no-duplicate-effect acceptance.

## DESIGN AND BOUNDARIES

Shutdown permanently marks the SSE registry closed before sweeping current readers. Registration after that point destroys the response before subscribing; a synchronous shutdown during subscription is detected before registry insertion. The host separately counts active requests on each socket. `preClose` destroys sockets with no active request, including preconnect and incomplete-header sockets. A response that finishes during shutdown decrements its socket count and ends the socket only after its last active response closes. The regression verifies that an in-flight response still arrives intact. No timeout widening, automatic retry, force-close of active responses, approval change, capability activation, or native confinement claim is part of this repair.

## VALIDATION

Historical RED/GREEN receipts remain in the journal. This audit executed source/ancestry comparisons and read actual hosted logs; it did not execute local Vitest because the audit checkout has no installed dependencies.

| Acceptance check | Result and exact evidence |
| --- | --- |
| Late/reentrant SSE registration rejected, ordinary fairness and cleanup preserved | PASS, 7/7 in [main unit shard 3](https://github.com/skytuhua-org/Gen-V1/actions/runs/45318044111/job/138189564276), including the two negative guards. |
| Idle/preconnect and incomplete-header sockets close; active response drains before close | PASS, 4/4 in [main unit shard 1](https://github.com/skytuhua-org/Gen-V1/actions/runs/45318044111/job/138189564373). |
| Actual-host approved file replacement survives restart with its durable receipt | PASS, 7.3 s in [main Browser run A](https://github.com/skytuhua-org/Gen-V1/actions/runs/45318044111/job/138189564451), then 7.9 s in [main Browser run B](https://github.com/skytuhua-org/Gen-V1/actions/runs/45319348309/job/138193832567). |
| Restart restores a generated operation without repeating external effects | PASS, host-loop case at line 389: 5.3 s in run A, then 5.7 s in run B. |
| Required checks on the tested main revisions | Both main push runs [45318044111](https://github.com/skytuhua-org/Gen-V1/actions/runs/45318044111) at `ea561dd4c0c818feb988244896260ad23ad7b340` and [45319348309](https://github.com/skytuhua-org/Gen-V1/actions/runs/45319348309) at `c7cf6e60ac5291e7004482efa1bcd06d535b20bb` completed successfully. Seven required jobs passed; selected-test lanes were skipped and are not counted as passing. |
| Source binding | `git merge-base --is-ancestor ae373ff8 <each-tested-main-SHA>` returned 0. `git diff` of the four repair/test paths between both tested revisions and `a5f81d8efc5f23d6336c37b2b1eb9115388ed693` is empty. |

Reproduction commands from a prepared repository checkout: `pnpm exec vitest run tests/event-stream-fairness.test.ts tests/host-close-connections.test.ts --maxWorkers=1`; `pnpm typecheck`; then the Windows Browser CI job for the actual-host restart cases. A future failure must retain its exact source, socket/close-stage diagnostics, and no-duplicate-effect assertions. Two subsequent main runs are observed evidence, not a statistical flake-rate estimate.

## STATE AND REVIEW RECORD

- Implemented: #1228 and #1898, both merged; #1898 merge `ae373ff8` is an ancestor of both tested main revisions.
- Verified: independent post-merge review of the four source/test files and the exact two Windows main push runs above. No finding within this repair's stated boundary.
- Historical exception: #1898 was queued with maintainer authorization but without the independent pre-merge code approval required by the original issue. The [author's record](https://github.com/skytuhua-org/Gen-V1/issues/1227#issuecomment-7120363399) remains authoritative. This audit is post-merge review and does not claim that pre-merge approval existed.
- Remaining uncertainty: the original Windows artifact did not identify which of the three now-covered socket states caused its lone socket. This does not erase the demonstrated shutdown defect or the subsequent passing actual-host behavior. Native M01/M02/M03 release acceptance remains separately tracked in [#1031](https://github.com/skytuhua-org/Gen-V1/issues/1031) and [#774](https://github.com/skytuhua-org/Gen-V1/issues/774).
- Next action: close this bounded completed issue after publishing this reconciliation and its versioned Markdown source. No feature or platform activation is authorized.

## REFERENCES

- Fixes: [#1228](https://github.com/skytuhua-org/Gen-V1/pull/1228), [#1898](https://github.com/skytuhua-org/Gen-V1/pull/1898).
- Latest implementation receipt: [#1227 journal](https://github.com/skytuhua-org/Gen-V1/issues/1227#issuecomment-7120363399).
- Related acceptance coordination: [#993](https://github.com/skytuhua-org/Gen-V1/issues/993), [#1031](https://github.com/skytuhua-org/Gen-V1/issues/1031), [#1770](https://github.com/skytuhua-org/Gen-V1/issues/1770).

## HISTORICAL REQUIREMENTS AND STATUS RECORD

The following is the original opening scope and previously accepted plan. Historical tense and old pending statuses are retained for provenance; the current state is the reconciliation above.

## Verified defect and provenance
A Windows browser run on PR #1181 (head `93bf0978e64fd42b1c0157a16da0df7982af3b7c`) timed out at `tests/e2e/host-loop.spec.ts:389`. The [historical CI run](https://github.com/skytuhua-org/Gen-V1/actions/runs/44772769037) (artifact `14675169910` is expired/unavailable; the recorded observation below is retained, not revalidated from that expired download) records `HostFixture.closeStages`: `host.close` took **115,488.649 ms**, with **one HTTP socket** still connected at its 10-second diagnostic; `widgets.close` 0.929 ms, `service.dispose` 15.833 ms, `store.close` 13.667 ms. The real scripted operation was already successfully settled; its required post-restart no-duplicate-effect assertions were never completed. The later `page.goto` "target closed" is downstream of the server close hang. A pre-existing [investigation report](https://github.com/skytuhua-org/Gen-V1/blob/f1c4db4c9a8abe602b908fc21f86c1abb7ba737a/docs/reports/flaky-tests-2026-11-19.md) predicted a late-SSE registration race but could not identify the close step; this artifact now separates host.close from service.dispose.

**Independent exact-source defect:** `apps/server/server.ts` calls `destroyEventStreams(streams)` in Fastify `preClose`. `apps/server/event-stream.ts` clears active streams but `registerEventStream` accepts a new response into that same map afterward, without a closed-registry guard. This leaves a newly registered hijacked SSE response outside shutdown's sweep. A deterministic isolated Node reproduction of the admission ordering yields `registrySize=1, destroy=0, subscribe=1` after shutdown, whereas expected is `0,1,0`. This establishes a shutdown-admission **source bug**, but does **not** prove the observed lone Windows socket was this specific late registration. The test artifact contains two earlier `/api/events` requests and does not identify the remaining socket's owner.

## Scope and acceptance
Focused Gen Runtime repair of late registration for the standard `/api/events` reader. Preserve all event order, active-reader cleanup and existing normal streaming. Add a negative unit regression showing that registration after shutdown destroys the response immediately, does not subscribe or retain the stream, and cannot delay close. Do not change approval/authority, production flags, backend choice or native confinement. This is **not** an M02 native security PASS.

Current verified baseline: `main@f1c4db4c9a8abe602b908fc21f86c1abb7ba737a`, `apps/server/event-stream.ts` blob `a2c7ec8a7e3e2c5b52065b6db83862c2b2d1169c`; tests `tests/event-stream-fairness.test.ts` blob `f9685485d50c992e381533c15e787628cb020e47`. Compare existing event-stream fix #1046 (fatal-error cleanup) and QA issue #993 (restart hang) without duplicating its earlier work.

## Gates
Focused test RED before fix / GREEN after fix, then typecheck, full required exact-head CI and independent review, and a later Windows browser re-run on actual merged source. Treat remaining Fastify socket root cause as unproven until the test/exact-host evidence identifies the socket. No merge before all required head checks and independent approval; no automatic CI rerun. Link checkpoints to #993 and #1031.

## Rev 2 addendum (2026-11-23) — T03

Plan file rev 2 (SHA-pinned): https://github.com/skytuhua-org/Gen-V1/blob/58148541d4fb5dcfd252369fccce19caf6db8c7c/docs/agent-plans/1227-fix-runtime-reject-late-sse-registration-after-serve.md

## REQUIREMENTS ADDENDUM (rev2)
Observed after #1228 merged: merge-group run 45121949413 (PR #1671, base includes #1228) failed `Browser tests` with `HOST_FIXTURE_CLOSE_PENDING {"phase":"host.close","elapsedMs":10006.8,"generation":1,"sockets":1}`; `host.close` 115,748 ms; widgets/service/store close 1/15/10 ms. So the late-SSE race was not the only cause. Gate "treat remaining Fastify socket root cause as unproven" now drives T03. Same constraints as rev1: no wider timeouts, no retries, no approval/authority/flag/backend/confinement changes; preserve in-flight responses.

Task: | T03 | End sockets that keep Node `server.close()` pending: no request yet (preconnect), incomplete header, keep-alive socket whose in-flight response finishes during close. Destroy sockets with zero in-flight requests at `preClose`; `socket.end()` when the last response closes during shutdown. Do not use `forceCloseConnections` (aborts in-flight responses). Files: `apps/server/server.ts`, new `tests/host-close-connections.test.ts`, `scripts/public-source-files.json`. | T02 | RED on main (3/4 fail) + GREEN with fix (4/4); Windows `Browser tests` pass in merge group for the fix and for #1671 |

## STATE (rev2)
- T01–T02: DONE in #1228 (merged; its merge-group run 45121947837 7/7 PASS). Not sufficient: run 45121949413 failed as above.
- T03: IMPLEMENTED in #1898 at 30bf1915 by devin-cloud-37c167 (claim on this issue). Executed: focused RED/GREEN, event-stream suites 17/17, public-source 13/13, `bun check` 0 errors. NOT_RUN: Windows Browser on this change (PR + merge-group checks queued). Which of the three socket states hit Windows is not proven; T03 covers all three.
- Next: maintainer-approved merge-queue entry for #1898, then #1671 behind it; verify Browser tests in both merge groups.
