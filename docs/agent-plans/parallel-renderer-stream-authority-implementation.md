# STR03: Implement the reviewed message-phase authority atomically

## META

`skytuhua-org/Gen-V1`; parent [#2228](https://github.com/skytuhua-org/Gen-V1/issues/2228) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/STR03`, 2026-11-25. Kind: implementation. Start: **BLOCKED**. Dependencies: [STR01 #2285](https://github.com/skytuhua-org/Gen-V1/issues/2285).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-STREAMING-MARKDOWN-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-streaming-markdown-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Implement only the exact descriptive authority seam accepted by STR01, with every schema writer, reader and decoder in one complete change. This task does not infer field names or spread an incomplete protocol over sequential PRs.

## REQUIREMENTS

The approved STR01 inventory is the only permitted file/schema list. There are intentionally no invented implementation paths here. Before editing, attach that inventory and exact R2 revision to this task's complete canonical body/source. If STR01 chooses existing authority with no producer change, deliver reviewed no-change evidence and release this slot. If STR01 says DEFER, do not implement.

Coverage: Streaming T03 authority; R02/R10/R11; A02/A10/A11. Inherited requirements remain binding.

## REPO_MAP

Known discovery roots are packages/contracts/index.ts, apps/web/src/snapshot-events.ts, apps/web/src/api.ts and the actual host/desktop writer paths found by STR01. The current Message completion gap is not an existing API. CONTRIBUTING requires schema changes with all readers/writers in one PR. #1960/#2030 already concerns SSE push buffering/serialization; preserve its accepted bounds and ordering rather than reimplementing that track.

Exact real implementation paths must be frozen by STR01 before this task starts.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Consume the exact reviewed R2 field types/defaults, identity/revision and transition table. Keep canonical content, source descriptors, permissions, persistence semantics and runtime scheduling unchanged except the narrowly approved descriptive metadata. Every default, missing/older snapshot, replay/reconnect/stop/error and owner/epoch transition must have an authoritative safe result. No additional renderer socket, per-message subscription, generic event exposure or persisted heuristic is allowed.

All affected schema definitions, producer updates, decoders and already-existing readers land together in one PR. STR04 is separately executable only for UI projection after the contract is valid. If R2 determines its reader change is inseparable, STR04 supplies a narrow reviewed patch to this same integration PR before merge; it is never landed afterward as a repair to a broken contract. Record exact patch ownership in the parent journal and release it after integration. There is no epic-wide source owner.

Do not optimize unrelated host paths. Unknown native cases yield unknown/static fallback according to R2; a field populated from active/runId/animate/text growth is a rejected design. Review artifacts distinguish new protocol implementation, unit proof, browser stub proof and actual native proof.

Sizing gate: after tracing the exact R2 writer/reader inventory, reassess task size. If it exceeds one bounded worker deliverable, publish narrow implementation subissues with fixed interfaces and contributor/file allocations before assigning code. All required protocol patches still land together in one reviewed integration PR. Broad runtime redesign remains DEFER; do not hand a less-capable agent an unspecified whole authority subsystem.

## EXECUTION_DAG

**T01.** Read the accepted full R2 and STR01 reviewer ACK. Copy its exact implementation/test inventory into this complete task revision and claim only those hunks. Stop if any field/default/producer/decoder remains unspecified.

**T02.** Add the exact contract transition tests, especially changed and unchanged final, missing/old snapshots, replay/ordering, stop/error and owner replacement. Name positive and fail-closed expected values from R2.

**T03.** Implement the smallest approved authority changes with every required writer/reader/decoder included atomically. Preserve text/permission/schema semantics outside that approved seam.

**T04.** Run the contract's exact host/browser/native-stub commands plus typecheck/build. Compare the writer-reader inventory against the diff and fail review on any omitted consumer.

**T05.** Publish the complete authority candidate and tests to [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288), distinguishing actual native acceptance still required by STR08. Release the contract hunks only after the full atomic patch is durable.

**Done when:** A complete reviewed authority contract is implemented and tested atomically, or the valid existing-authority/no-change outcome is documented. An incomplete R2 or missing reader leaves this task BLOCKED. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Execute the exact R2 test commands and focused contract file from STR01, pnpm typecheck and pnpm build. No guessed test filename is supplied before discovery. Required negative evidence: duplicate/old/wrong thread/run/message/epoch input cannot revive provisional state, reconnect/unknown cannot retain a guess, unchanged-text final clears authority, desktop uses existing authorized snapshot delivery and zero extra SSE. The inventory must prove all writers/readers/decoders shipped together. Actual Windows behavior remains STR08.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** No accepted exact native authority contract exists. STR01 must publish/review complete R2 or this task remains blocked. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md).
- [Reference 2](https://github.com/skytuhua-org/Gen-V1/issues/1960).
