**Full current issue mirror:** [issue-993.md](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-993.md). The publication checkpoint pins the exact commit.

# Browser restart shutdown repair: verified completion

## OBJECTIVE AND REQUIREMENTS

Identify the close stage that prevented `tool-effects-host` restart, repair or hand off the underlying defect, and verify the real test on subsequent main runs. The Windows diagnostic identified `host.close`, not widgets/store/service disposal. The two runtime fixes preserve streaming, in-flight responses, durable effect receipts, and the original restart assertions. The original issue scope is preserved verbatim under the historical record below.

## EXECUTION_DAG

| Task | Dependency, executable work and files | Done when and handoff | State |
| --- | --- | --- | --- |
| T01 | None. Read the close-stage diagnostics in `tests/host-fixture.ts` and the Windows run; identify host.close separately from service disposal. | The failing stage and observed socket count are recorded and supplied to the runtime fix owner. | DONE; historical Windows finding is retained in #1227. |
| T02 | T01. Review the standard SSE registry and host socket lifecycle, add the negative regressions in the REPO_MAP, and preserve active-response delivery. | Source bug is repaired or handed off, RED/GREEN evidence is retained, and the fixes land through the recorded integration path. | DONE in #1228 and #1898. |
| T03 | T02. Review current main source and the Windows Browser job after merge. | `tool-effects-host` and host-loop restart cases pass on subsequent main runs, with exact SHA/job links and no assertion weakening. | DONE on runs 45318044111 and 45319348309; findings supplied to #1031 and #1770. |

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

## Requested outcome
Main CI **Browser tests** stops failing on root-suite `tests/e2e/tool-effects-host.spec.ts:12` ("approved file replacement exposes its durable ledger receipt through the actual host").

## Evidence
- Fails in 8 of the 11 red main runs among the last 38 completed main CI runs (Nov 18–19), e.g. [44613472925](https://github.com/skytuhua-org/Gen-V1/actions/runs/44613472925), [44598154959](https://github.com/skytuhua-org/Gen-V1/actions/runs/44598154959), [44587001582](https://github.com/skytuhua-org/Gen-V1/actions/runs/44587001582), [44560112666](https://github.com/skytuhua-org/Gen-V1/actions/runs/44560112666).
- Signature: `Test timeout of 60000ms exceeded` → `Tearing down "host" exceeded the test timeout` → `page.goto: Target page, context or browser has been closed` at `tests/host-fixture.ts:221` (openHost, spec line 72).
- Trace (run 44613472925): `about:blank` done at 7.1s, then the test is stuck in `host.restart()` → `HostFixture.close()` until teardown; `host-observations.json` shows only one runtime generation (restarted host never reached `start()`). Which close step hangs (host.close / widgets.close / service.dispose) is not yet known.
- Not #702: no shell-micro-motion/shared-smoothness spec failed in these runs.

## Scope
1. Diagnostics: record close-step timings (PR #950, test-only).
2. Once a Windows failure names the step: fix in tests if fixture-caused; if `host.close` hangs on open sockets in product server shutdown, route to Gen Runtime via Chief of Staff instead.

## Completion criteria
- The hanging close step is identified from a Windows CI artifact/log.
- Root cause fixed (or product bug handed off), and tool-effects-host passes on main across subsequent runs.
