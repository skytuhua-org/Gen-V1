# Current complete event-retention execution revision for #1958

## META

Repository skytuhua-org/Gen-V1; revision `1958-audit-r2-2026-11-24`; reviewed baseline main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b. The complete audit-r1 plan and its original SHA-pinned publication links remain verbatim below. This revision incorporates the later recorded owner decision into the canonical plan, supplies exact implementation/handoff references, and preserves all original reproduction, recovery and measurement requirements. Existing feature and reviewer ownership remain intact. Parent metadata coordination is [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803).

## OBJECTIVE and REQUIREMENTS

Bound event and command-receipt growth while keeping supported replay, recovery, audit and live pinned-outcome semantics. Retain every original report scope and exclusion. The [recorded owner decision](https://github.com/skytuhua-org/Gen-V1/issues/1958#issuecomment-7129784468) selects policy option 1: keep 50,000 events; the deletion cutoff is limited by both headSeq minus 50,000 and the minimum durable planExtension.reportWatermark; receipts expire with their events except receipts pinned by live workspaceAction/workspaceActionOutcome entities; invoke store.retentionSweep() manually only, with no startup automatic sweep. This is the recorded approved policy, not a new choice by the metadata worker.

Keep entity data, task memory, dataVersion and checkpoint blobs outside this sweep. Preserve the original requirements for mixed reconnect/offline consumers, old stores, cancellation, cursor reset, pinned records and equal-cardinality before/after measurements. Existing supported data and product entry points remain unchanged. No migration or automatic destructive sweep is authorized by this revision.

## REPO_MAP and DESIGN

Existing [PR #2112](https://github.com/skytuhua-org/Gen-V1/pull/2112), branch devin/web-aaff45-1958-event-retention, head `b7ca94fe6b2668df48de170a643d7a2c454ade33`, contains the implementation under review. Its source paths are `packages/storage/store.ts` (retentionFloor/retentionSweep and durable consumer cutoff), `apps/server/event-stream.ts` (retention-gap marker), `scripts/measure-event-growth.ts` (deterministic baseline/sweep fixture), `tests/store.test.ts`, `tests/event-stream.test.ts`, `tests/event-stream-fairness.test.ts`, and source-manifest registration.

Source inspection at that head confirms a default keepEvents=50,000, nonnegative cutoff bounded by report watermarks, separate committed delete batches, pinned workspace-action/outcome command receipt exclusion, a completed-sweep audit event, and rejection of a nested command transaction. The SSE candidate announces a replay gap before retained events. These are inspected implementation facts; performance/recovery behavior and complete consumer handling still require the original acceptance matrix. Preserve current SSE shutdown/backpressure semantics when integrating with adjacent work. Changing default policy, automatically invoking sweep, or extending deleted entity kinds requires a new canonical decision, not a progress-comment-only change.

## EXECUTION_DAG

| Task | Dependencies and inputs | Exact work and outputs | Ownership boundary | Positive/negative tests and done-when | Handoff |
| --- | --- | --- | --- | --- | --- |
| T01 | Pinned baseline, original audit references, current Store schema and every durable consumer | Reproduce growth with scripts/measure-event-growth.ts at multiple event volumes; record rows/bytes/times/query plans and enumerate cursor/receipt dependencies | Existing storage feature owner; no unrelated query or migration takeover | Equal inputs produce comparable measurements; inspect slow/offline consumer watermark and pinned receipt cases; establish bounds before deletion | Baseline data and consumer map to T02 reviewer |
| T02 | T01 and the recorded option-1 policy | Review/repair existing #2112 in packages/storage/store.ts and apps/server/event-stream.ts; keep explicit manual trigger, batched resumable deletion and receipt pin preservation | Existing PR owner; coordinate event-stream overlap with its current owner | Ordinary history shrinks under the selected policy; live pinned receipts and all data outside scope survive; nested transaction/invalid configuration refuses; interrupted sweep resumes; startup does not invoke sweep | Exact candidate SHA, policy implementation map and failure evidence to T03 |
| T03 | T02 frozen head and original full acceptance | Run existing store/event-stream/fairness cases and deterministic before/after fixture; verify each consumer's stale-cursor path and unchanged shutdown/backpressure | Independent verifier on fixed head; no feature scope transfer | Mixed reconnect/offline, old database, cancellation, cursor reset, pinned outcomes and equal retained-cardinality comparisons all have explicit outcomes; skipped native/live checks remain named | Reviewer/maintainer receives exact commands, measurements, CI and remaining gates; normal merge then verification on main |

Requirement mapping: growth measurements and query/consumer inventory are T01/T03; option-1 cutoff, receipt policy, manual-only trigger and scoped entity preservation are T02/T03; restart, cancellation, reconnect, cursor reset and pinned-record cases are T03; supported data/entry-point exclusions constrain every task and the full diff review.

## VALIDATION

The producer [release](https://github.com/skytuhua-org/Gen-V1/issues/1958#issuecomment-7129828771) reports TypeScript PASS, Vitest 27/27, UI lint PASS and baseline/sweep fixture PASS, with CI pending and the PR unmerged. Those results remain attributed to that worker and head. This metadata review inspected the exact candidate source, issue decision and journal, and verified complete document preservation; it did not rerun product tests or sweep user data.

For continued verification, use an owned temporary database and the version-pinned dependency graph. Run the focused store/event-stream tests named in the PR with their exact recorded command, `pnpm typecheck`, relevant build, and the deterministic measurement fixture after reading its options. Record source SHA, event volume, consumer cursors, receipt pins, before/after rows/bytes/time, interruption barriers and observed replay outcomes. Preserve all original validation instructions below. No production/user database is a test fixture. A passed deletion test alone is insufficient if a durable consumer's gap recovery is unproven.

## STATE

The policy decision is recorded and incorporated here. T01/T02/T03 have producer implementation/test evidence in #2112; independent review, required CI, merge and main verification remain open. The PR is not equivalent to accepted completion. First action: existing reviewer checks #2112 at its current exact head against the option-1 policy and every original recovery/measurement criterion, preserving adjacent source owners. No issue closure or additional feature implementation is performed by this metadata revision.

## REFERENCES

- [Full issue and original plan history](https://github.com/skytuhua-org/Gen-V1/issues/1958)
- [Recorded policy decision](https://github.com/skytuhua-org/Gen-V1/issues/1958#issuecomment-7129784468)
- [Producer release and verification claim](https://github.com/skytuhua-org/Gen-V1/issues/1958#issuecomment-7129828771)
- [Existing implementation PR](https://github.com/skytuhua-org/Gen-V1/pull/2112)
- [Exact candidate Store](https://github.com/skytuhua-org/Gen-V1/blob/b7ca94fe6b2668df48de170a643d7a2c454ade33/packages/storage/store.ts)
- [Exact candidate event stream](https://github.com/skytuhua-org/Gen-V1/blob/b7ca94fe6b2668df48de170a643d7a2c454ade33/apps/server/event-stream.ts)
- [Deterministic fixture](https://github.com/skytuhua-org/Gen-V1/blob/b7ca94fe6b2668df48de170a643d7a2c454ade33/scripts/measure-event-growth.ts)
- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)

Publication guard: expected previous canonical body SHA256 `2dc837c4db7f933db02473bd1c7a7d75eb708918ad08e77fb148d332935b8e98`. Publish the identical complete file through existing #1994 before any guarded body replacement; reconcile concurrent changes rather than overwriting them.

## Retained complete original plan

[Versioned Markdown plan](https://github.com/skytuhua-org/Gen-V1/blob/dad473f59b4c46dad12cf0357e448e090a403a2b/docs/agent-plans/nov-2026-audit-event-retention.md) · [Plan publication PR](https://github.com/skytuhua-org/Gen-V1/pull/1952)

<!-- gen-v1-audit-r1-r2:event-retention -->
# Bound event and projection growth while preserving replay and audit receipts

## META
- Repository `skytuhua-org/Gen-V1`. Plan revision `audit-r1`, 2026-11-23 Pacific time.
- GitHub main verified at `a64e9e2d03ce09c843bff0480d81311f2012c812` during triage. Refresh before implementation. Historical sources include the round-one working tree and round-two `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`.
- State: audit evidence reviewed. Reproduction and implementation on current main are pending.

## OBJECTIVE
The audit measured growth with every commit and scan costs on old databases. Define a retention policy that lets active clients recover, preserves required receipts and catches legacy rows safely.

## REQUIREMENTS
- Report scope: 03 growth inventory; 14/B4, F4 and C recovery dependencies; 15 §§1, 6; 02 projection retention.
- Reuse matching issues and open fixes. Preserve existing supported data and product entry points. Keep each accepted code change independently scoped and reviewed. Follow [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md) for sensitive evidence.

## REPO_MAP
- Core store event/entity tables, durable projections, retained research records and checkpoint blob references. Separate SQLite migrations (#1056), checkpoint blob integrity and request/query optimizations.

## DESIGN
Document per-kind retention and authority, compaction cutoff, retry, checkpoint safeguards and cursor reset behavior. Make retention transactional or resumable and require explicit owner approval for old data policy.

## EXECUTION_DAG
1. **T01 — Baseline and reproduction.** Generate deterministic local stores at multiple sizes. Measure rows, bytes, runtime and query plans after equal event volumes. Determine the oldest consumer cursor and every durable receipt dependency before proposing expiry. Deliver a recorded baseline and working fixture to the owner of T02.
2. **T02 — Scoped repair or disposition.** Depends on T01. Work in the mapped component with current ownership confirmed. Implement the design for the confirmed case or record its verified existing fix or owner decision. Keep positive and negative fixtures and hand the exact head to T03.
3. **T03 — Verify and hand off.** Depends on T02. Run mixed reconnect and offline consumers across cutoff, old store upgrades, cancellation, cursor reset and pinned record preservation. Report before/after size and time at equal cardinality. Bring evidence and the exact change and unresolved cases back to this issue.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Run mixed reconnect and offline consumers across cutoff, old store upgrades, cancellation, cursor reset and pinned record preservation. Report before/after size and time at equal cardinality.

Use the focused existing unit, host or Playwright suite found in T01. Record actual commands and outcomes separately from planned or skipped checks. Run relevant repository checks and retain exact-head review before completion.

## STATE
Reproduction, change and final verification are open. First action: pin current main, check related heads and run T01. Keep existing implementation and merge ownership on each linked issue or PR.

## REFERENCES
Audit tracking in #1848 and #1946. Related repairs and PRs in #1860 and #1886. Repository instructions in [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).
