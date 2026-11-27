# STR01: Resolve the authoritative browser and native message-phase contract

## META

`skytuhua-org/Gen-V1`; parent [#2228](https://github.com/skytuhua-org/Gen-V1/issues/2228) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/STR01`, 2026-11-25. Kind: discovery. Start: **READY**. Dependencies: None.

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-STREAMING-MARKDOWN-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-streaming-markdown-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Determine whether existing authorized browser and native state can truthfully distinguish an individual provisional assistant message. Publish the exact reviewed contract and complete R2 amendment before any implementation, or publish DEFER with a named missing prerequisite.

## REQUIREMENTS

No fabricated Message.streaming/completion field. Animate, active run, arrivals, matching runId, false/default streaming, timeout and text growth prove neither provisional nor final. No extra native renderer SSE connection, generic event exposure, transport rewrite, persisted phase guess, text mutation or authority broadening. Browser-only improvement cannot pass adoption.

Coverage: Streaming T01 authority/baseline; R01/R02/R10/R11/R12; A01/A02/A10/A11/A12. Inherited requirements remain binding.

## REPO_MAP

Current snapshot-events.ts upserts runtime.assistant.delta and runtime.assistant.message identically. api.ts subscribe chooses desktop.onWorkspaceChanged invalidation+refresh and does not call accept(event) on that branch. App ConversationWorkspace applies snapshots/sequence checks and owns multiple instances. Message lacks established completion metadata. Host reducers/schema/serialization/bridge writer paths are explicitly discovery, not invented locations. #1960/#2030 is released host SSE buffering work, not this contract.

Proposed outputs: `docs/agent-plans/streaming-phase-contract.md`, `docs/review-evidence/parallel-renderers/streaming-phase-baseline.md`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Trace rg -n 'assistant.delta|assistant.message|onWorkspaceChanged' apps packages tests, then inspect every reached writer, schema/decoder, snapshot producer, browser reader and native bridge. Retrieve sparse tracked omissions by their real paths. Inventory existing ownership IDs, thread/run/message/epoch, ordering/revision, reset/replay/reconnect and terminal cases, quoting exact symbols/paths and pinned source. Inspect every actual main/canvas/embedded owner reset and the generation/finality semantics needed by diagrams without coupling engine adoption.

The output contract must contain exact field names/types/defaults, provenance of provisional/final/static/unknown, writers and all readers/decoders, accepted sequence rules, atomic snapshot publication, duplicate/stale/owner handling, stop/error/reconnect/hidden/held behavior and exact unit/browser/native commands. Decide whether existing fields suffice or a minimal descriptive seam is required. If new metadata is necessary, update the entire #2228 canonical plan and identical versioned source to R2 before STR03; schema with every writer/reader/decoder must land atomically in one PR per CONTRIBUTING. STR04 may own only UI projection on that complete valid contract. If a reader cannot be split safely, STR03 includes it and STR04 contributes a separately reviewed patch to the same integration PR, never a half-contract merge.

If native truth is absent or repair would require broad runtime changes, record DEFER, precise missing authority/owner and current literal behavior. Do not fill unknown names with plausible fields. Isolated STR02 comparison can proceed and cleanly reject; no production dependency or browser-only shipping follows.

Sizing gate: after tracing the exact R2 writer/reader inventory, reassess task size. If it exceeds one bounded worker deliverable, publish narrow implementation subissues with fixed interfaces and contributor/file allocations before assigning code. All required protocol patches still land together in one reviewed integration PR. Broad runtime redesign remains DEFER; do not hand a less-capable agent an unspecified whole authority subsystem.

## EXECUTION_DAG

**T01.** Refresh current main, full #2228/#2212 and relevant authority/owner journals, including #1960 and native bridge work. Claim these documentation/discovery outputs only.

**T02.** Trace and read every actual authority path described above. Reproduce two partial-tail baselines and final malformed forms in actual App; record semantic DOM, canonical copy/source and exact control SHA.

**T03.** Build the contract matrix for current delta, changed/unchanged final, duplicate/older/wrong-owner events, activity, terminal, epoch replacement, reconnect/unknown, hidden/held and native invalidation. Name exact fixture publishers required; existing host.publish emits settings only and old nativeBridge lacks onWorkspaceChanged.

**T04.** Publish either a complete reviewed contract/R2 with exact source/test allocation and atomic landing boundary, or DEFER with a named prerequisite. Review original-source/finality and schema compatibility explicitly.

**T05.** Have the coordinator read back the entire R2 body/source and record acceptance/ACK before [STR03 #2287](https://github.com/skytuhua-org/Gen-V1/issues/2287) or [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288) starts. Hand the concrete contract to those tasks; release discovery ownership.

**Done when:** A durable reviewed exact authority contract plus full R2 readback exists, or a precise DEFER disposition is published. No downstream implementation may start on a suggested field or browser-only heuristic. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

No implementation tests are claimed. Execute bounded source/path inspection and available baseline App reproduction; record exact commands/results or environment blockers. Acceptance is a reviewer-checkable writer-to-reader table with no undefined field, all12 transition cases specified and actual native invalidation behavior represented. A new schema row without its decoder/producer/reader/test makes the output incomplete. DEFER is an acceptable completed discovery outcome and keeps implementation BLOCKED.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**READY:** The current native invalidation/snapshot path lacks established per-message phase truth; this is a bounded contract-or-DEFER decision. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/api.ts).
- [Reference 2](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/snapshot-events.ts).
- [Reference 3](https://github.com/skytuhua-org/Gen-V1/issues/1960#issuecomment-7130798617).
