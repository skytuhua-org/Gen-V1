# fix(runtime): reject late SSE registration after server shutdown begins — execution plan

## META
- Repo: skytuhua-org/Gen-V1 · Plan revision: 2 (2026-11-23; rev1 2026-11-21 at main@e883ac03). rev2 adds T03 (remaining host.close socket) after the Windows browser failure recurred with #1228 merged.
- Baseline: main @ e883ac0327c834120d89c3697dec7380a342ba4d
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1227
- Status: T01–T02 merged as #1228 (2026-11-23T10:01:20Z). T03 implemented in #1898 (open). Original rev1 status: plan only — no implementation authorized by this document. Source provenance: issue body reproduced verbatim under REQUIREMENTS so nothing is lost.

## OBJECTIVE
fix(runtime): reject late SSE registration after server shutdown begins. Success is the issue's own completion criteria met and verified on main.

## REQUIREMENTS

Historical evidence note (2026-11-23 cleanup): the artifact URL now returns HTTP 404. The measurements below preserve the original recorded investigation; the artifact is not currently downloadable. The current acceptance record is maintained in [issue #1227](https://github.com/skytuhua-org/Gen-V1/issues/1227).

## Verified defect and provenance
A Windows browser run on PR #1181 (head `93bf0978e64fd42b1c0157a16da0df7982af3b7c`) timed out at `tests/e2e/host-loop.spec.ts:389`. The issue's original inspection of artifact `14675169910` from [CI run 44772769037](https://github.com/skytuhua-org/Gen-V1/actions/runs/44772769037) reported `HostFixture.closeStages`: `host.close` took **115,488.649 ms**, with **one HTTP socket** still connected at its 10-second diagnostic; `widgets.close` 0.929 ms, `service.dispose` 15.833 ms, `store.close` 13.667 ms. The real scripted operation was already successfully settled; its required post-restart no-duplicate-effect assertions were never completed. The later `page.goto` "target closed" is downstream of the server close hang. A pre-existing [investigation report](https://github.com/skytuhua-org/Gen-V1/blob/f1c4db4c9a8abe602b908fc21f86c1abb7ba737a/docs/reports/flaky-tests-2026-11-19.md) predicted a late-SSE registration race but could not identify the close step; this artifact now separates host.close from service.dispose.

**Independent exact-source defect:** `apps/server/server.ts` calls `destroyEventStreams(streams)` in Fastify `preClose`. `apps/server/event-stream.ts` clears active streams but `registerEventStream` accepts a new response into that same map afterward, without a closed-registry guard. This leaves a newly registered hijacked SSE response outside shutdown's sweep. A deterministic isolated Node reproduction of the admission ordering yields `registrySize=1, destroy=0, subscribe=1` after shutdown, whereas expected is `0,1,0`. This establishes a shutdown-admission **source bug**, but does **not** prove the observed lone Windows socket was this specific late registration. The test artifact contains two earlier `/api/events` requests and does not identify the remaining socket's owner.

## Scope and acceptance
Focused Gen Runtime repair of late registration for the standard `/api/events` reader. Preserve all event order, active-reader cleanup and existing normal streaming. Add a negative unit regression showing that registration after shutdown destroys the response immediately, does not subscribe or retain the stream, and cannot delay close. Do not change approval/authority, production flags, backend choice or native confinement. This is **not** an M02 native security PASS.

Current verified baseline: `main@f1c4db4c9a8abe602b908fc21f86c1abb7ba737a`, `apps/server/event-stream.ts` blob `a2c7ec8a7e3e2c5b52065b6db83862c2b2d1169c`; tests `tests/event-stream-fairness.test.ts` blob `f9685485d50c992e381533c15e787628cb020e47`. Compare existing event-stream fix #1046 (fatal-error cleanup) and QA issue #993 (restart hang) without duplicating its earlier work.

## Gates
Focused test RED before fix / GREEN after fix, then typecheck, full required exact-head CI and independent review, and a later Windows browser re-run on actual merged source. Treat remaining Fastify socket root cause as unproven until the test/exact-host evidence identifies the socket. No merge before all required head checks and independent approval; no automatic CI rerun. Link checkpoints to #993 and #1031.

## REQUIREMENTS ADDENDUM (rev2)
Observed after #1228 merged: merge-group run 45121949413 (PR #1671, base includes #1228) failed `Browser tests` with `HOST_FIXTURE_CLOSE_PENDING {"phase":"host.close","elapsedMs":10006.8,"generation":1,"sockets":1}`; `host.close` 115,748 ms; widgets/service/store close 1/15/10 ms. So the late-SSE race was not the only cause. Gate "treat remaining Fastify socket root cause as unproven" now drives T03. Same constraints as rev1: no wider timeouts, no retries, no approval/authority/flag/backend/confinement changes; preserve in-flight responses.

## REPO_MAP
Verified at baseline unless marked discovery:
- `apps/server/server.ts` — SSE registration + shutdown paths (verify exact site)
- `apps/server` — host close path that held one HTTP socket 10s+ in CI artifact
- `tests/e2e/host-loop.spec.ts` — the timed-out spec (line 389)

## DESIGN
Reject SSE registration once server shutdown begins so a late registration cannot pin an HTTP socket open and stall host.close. Report predicted a late-SSE cause; confirm, then gate registration on shutdown state.

## EXECUTION_DAG
| Task | Goal | Deps | Done when |
|------|------|------|-----------|
| T01 | Reproduce: register an SSE stream after close starts; show socket kept open | NONE | red test / harness evidence |
| T02 | Fail-closed registration during shutdown; verify HostFixture.close stages complete | T01 | host.close bounded; spec teardown passes |
| T03 | End sockets that keep Node `server.close()` pending: no request yet (preconnect), incomplete header, keep-alive socket whose in-flight response finishes during close. Destroy sockets with zero in-flight requests at `preClose`; `socket.end()` when the last response closes during shutdown. Do not use `forceCloseConnections` (aborts in-flight responses). Files: `apps/server/server.ts`, new `tests/host-close-connections.test.ts`, `scripts/public-source-files.json`. | T02 | RED on main (3/4 fail) + GREEN with fix (4/4); Windows `Browser tests` pass in merge group for the fix and for #1671 |

## VALIDATION
- `pnpm lint`, `pnpm typecheck` and `pnpm test` (or the focused suite named in the issue) green on each PR.
- Issue-specific acceptance reproduced and evidenced per the criteria above; browser/Windows-only checks run on a Windows worker or CI.
- Each PR linked to issue #1227; merge only through the normal gate (required CI + independent review).

## STATE (rev2)
- T01–T02: DONE in #1228 (merged; its merge-group run 45121947837 7/7 PASS). Not sufficient: run 45121949413 failed as above.
- T03: IMPLEMENTED in #1898 at 30bf1915 by devin-cloud-37c167 (claim on this issue). Executed: focused RED/GREEN, event-stream suites 17/17, public-source 13/13, `bun check` 0 errors. NOT_RUN: Windows Browser on this change (PR + merge-group checks queued). Which of the three socket states hit Windows is not proven; T03 covers all three.
- Next: maintainer-approved merge-queue entry for #1898, then #1671 behind it; verify Browser tests in both merge groups.

## STATE (rev1)
- Researched: issue scope + verified REPO_MAP entries. Not started: all tasks. Owner: unassigned (this plan's author released the claim).
- Exact next step: claim the issue per AGENTS.md, then execute T01.

## REFERENCES
- Issue #1227: https://github.com/skytuhua-org/Gen-V1/issues/1227
- AGENTS.md claim/checkpoint/handoff rules: https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md
