# Streaming phase contract decision

## META

- Repository: `skytuhua-org/Gen-V1`
- Plan revision: `PARALLEL-RENDERERS-R1/STR01-contract-R2`
- Date: 2026-11-26
- Baseline: `main@e22e1152d3ac85b13429492b3bbae4be5d02c856`
- Issue: [#2285](https://github.com/skytuhua-org/Gen-V1/issues/2285)
- Parent: [#2228](https://github.com/skytuhua-org/Gen-V1/issues/2228) under journal [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212)
- Evidence source: `docs/review-evidence/parallel-renderers/streaming-phase-baseline.md`
- Decision: **DEFER implementation**
- Implementation status: no runtime, schema, transport, parser, package or adoption change is authorized or implemented by this discovery leaf.

## OBJECTIVE

Determine whether existing authorized browser and native state can truthfully distinguish an individual provisional assistant message before streaming Markdown repair is implemented.

Answer: **No.** Existing browser events carry delta/final type only before projection, while the durable/snapshot `Message` contract and renderer state discard that distinction. Native invalidation supplies only workspace connectivity and sequence. Neither transport currently provides authoritative per-message phase truth after refresh/reconnect.

## REQUIREMENTS AND EXCLUSIONS

Binding constraints retained from the parent plan:

- Do not fabricate `Message.streaming`, completion or revision metadata.
- Animation, active run, arrival order, matching `runId`, false/default streaming state, timeout and text growth do not prove a message is provisional or final.
- Do not add a second native renderer SSE connection, generic event exposure, transport rewrite, persisted phase guess, text mutation or broader authority.
- Browser-only improvement cannot pass adoption.
- Final, stop/error, reconnect, unknown state, stale events and owner changes must not retain speculative formatting.
- This document is a contract/discovery output only. It does not implement schema, host reducers, serializers, bridge code, Markdown rendering or tests beyond discovery evidence.

## REPO MAP VERIFIED AT BASELINE

- `packages/contracts/index.ts`: `Message` has no completion/phase/revision field.
- `packages/core/service.ts`: current-owner runtime events are accepted by `threadId/runId/epoch`; `assistant.delta` is buffered and `assistant.message` replaces content, but both write the same `Message` projection shape.
- `apps/web/src/snapshot-events.ts`: `runtime.assistant.delta`, `runtime.assistant.message` and `runtime.activity` share one message-upsert path.
- `apps/web/src/App.tsx`: patched snapshots are applied without a retained producer event kind.
- `apps/web/src/api.ts`: browser SSE events reach `accept(event)`; native `onWorkspaceChanged` switches to invalidation plus full refresh and does not call `accept(event)`.
- `apps/desktop/workspace-events.ts` and `apps/desktop/preload.ts`: native relay is `{connected,sequence}` only.
- `tests/host-fixture.ts`: real local host fixture can publish owned runtime events through Service. Existing native stubs/mocks do not establish production native semantics.

## CURRENT TRANSITION MATRIX

| Case | Current authoritative result | Can identify provisional? | Required future truth |
|---|---|---:|---|
| 1. Current delta arrives in browser SSE | Message content is appended/upserted; original workspace type is not retained in `Message` | No | exact thread/run/epoch/message owner plus phase=provisional and monotonic source revision |
| 2. Final arrives with changed text | Same message row is replaced/upserted through the same shape | No | same owner with phase=final and final revision |
| 3. Final arrives with unchanged text | Same row remains visually unchanged; no phase transition is observable | No | explicit final transition even when content is identical |
| 4. Duplicate sequence/event | Browser sequence guard can ignore it; no phase meaning is available | No | idempotent phase revision, never revival |
| 5. Older sequence/event | Browser snapshot patch rejects older/equal sequence; full refresh may still expose only final projected content | No | retained authoritative phase in durable projection/snapshot |
| 6. Wrong thread/run/epoch owner | Service rejects before projection | No, but safe | unchanged rejection plus tests |
| 7. Activity event | Shares the same upsert branch with assistant events; role differs but no completion semantics | No | phase semantics limited to assistant messages only |
| 8. Stop/error/terminal after partial output | Delta buffer is flushed before failure handling where applicable; projected partial content remains ordinary message content | No | terminal authority clears provisional eligibility or marks final/aborted state |
| 9. Owner epoch switch | Old owner events are rejected; new owner gets a new run/epoch fence | No | owner-scoped phase keyed by exact thread/run/epoch/message |
| 10. Reconnect/unknown full snapshot | Snapshot contains only projected `Message` rows; event-kind history is absent | No | durable serialized phase or explicit absence means static |
| 11. Hidden/inert/held owner | Visibility/holding does not alter message authority; refresh has the same lossy shape | No | visibility must never create or destroy phase truth |
| 12. Native invalidation with current metadata | Renderer receives `{connected,sequence}` and refetches lossy snapshot | No | native transport and snapshot must expose the same authoritative per-message truth as browser without a second SSE connection |

## DECISION: DEFER

Implementation is deferred because a material prerequisite is missing: **an authoritative, durable, owner-scoped per-message phase contract must exist end-to-end before speculative Markdown repair may use it.**

At minimum that prerequisite must name and implement together:

1. schema/persistence/snapshot fields (or an explicitly versioned equivalent) for exact `threadId`, `runId`, `epoch`, `messageId`, phase and monotonic content revision;
2. the sole host writer and reducer transitions for delta, changed final, unchanged final, terminal/error, reconnect, owner replacement and duplicate/stale events;
3. browser snapshot/event readers;
4. native main/preload/renderer transport with parity semantics and no extra renderer SSE connection;
5. decoder/backward-compatibility behavior in which absent or unknown metadata means static rather than speculative;
6. positive and negative tests for all twelve matrix rows on browser and real native transport.

A partial implementation or a new schema row without its decoder, producer, readers and tests is incomplete and must not unblock STR03/STR04.

## R2 IMPLEMENTATION GATE

Before any implementation leaf starts, the coordinating maintainer must accept a complete R2 amendment that specifies the exact field names/types, writer/readers, migration/backward compatibility, test allocation and atomic landing boundary. That amendment must be reviewed as one contract. This discovery intentionally does not invent those names because no such agreement exists in the canonical parent plan.

## VALIDATION PERFORMED FOR THIS DISCOVERY

See `docs/review-evidence/parallel-renderers/streaming-phase-baseline.md` for exact commands and results.

- Source authority inspection: completed.
- Actual Chromium/App baseline for two partial tails and one final malformed form: PASS, 1/1 probe test.
- Native packaged/desktop evidence: NOT_RUN; existing current native relay was source-inspected and is sequence-only.
- Product implementation tests: NOT_RUN by design; no implementation exists.
- CI/review/merge/verified-on-main: separate later gates; not claimed here.

## ACCEPTANCE STATE

- R01/R02/R10/R11/R12 discovery evidence: documented, with implementation blocked by the missing authoritative phase prerequisite.
- A01/A02/A10/A11/A12: adoption not attempted; this is a completed DEFER discovery outcome, not product acceptance.
- Next owner: maintainer/coordinator review. STR03 and STR04 remain blocked until the R2 prerequisite is authored, reviewed and acknowledged.
