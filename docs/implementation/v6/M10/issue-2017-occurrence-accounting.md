# #2017 interval occurrence accounting

Source base `62c76c432084d82005dae0bf876aeddd57d80ed7`. Verified code and fixture cut `f239840adf0b6a3dc0d923ec52b2f2df75ffc981`. Linux x64, Node v24.22.3, pnpm 10.30.3. The four targeted suites use temporary stores, injected clocks, and controlled boundary doubles.

## A01–A05 durable accounting

| Scenario | Previous behavior | Candidate observation |
| --- | --- | --- |
| Clock jumps by 100,002 and 100,005 one-millisecond slots | 100,000 skipped rows each, with the first intended IDs missing. Each selected fixture recorded 100,006 projection writes before the first tick completed. | 100,001 and 100,004 distinct skipped rows respectively, each exact key checked. Exactly one latest admission and delivery per schedule. |
| Large jump write budget | One transaction materialized up to 100,000 skipped rows. | Up to 64 skips in the claim, with one range cursor, one latest occurrence, and one wakeup write. One background batch per tick writes up to 256 skipped rows and advances or removes one cursor, for at most 257 projection writes. The test instruments both put and remove inside each transaction. |
| Transaction failure and restart | Omitted history had no durable cursor. | A forced exception after writing two rows rolls back both rows and progress. After close and reopen, cancellation and a backward clock do not prevent completion of all 699 historical rows or introduce another admission. |
| Stale and concurrent scheduler decisions | Review of the prior branch depended on materialized occurrence keys. | A stale candidate within an outstanding range cannot claim a skipped key. Live admission precedes backfill and two pending ranges alternate. Expired-lease reads remain bounded and exclude paused schedules. |
| Safe integer arithmetic | Large elapsed differences were rounded in floating point before selecting the anchored slot. | The wide-elapsed fixture selects the exact literal key `["wide-elapsed",1,8000000000000001]`. Arithmetic outside the supported persisted count can block a schedule without rounding or advancing its cadence. |

Claim and cursor commit together. Pending work records the schedule revision, first and last intended UTC slot, interval, next cursor, original stamp, and turn. Later batches preserve the original stamp and never admit skipped work. Cancellation and pause suspend execution while leaving committed historical accounting eligible for materialization. Shutdown stops the tick and retains the same cursor. Live work and lease recovery run before an accounting batch.

The scale cases took 5.23 s on the old implementation through their failing assertions and 5.00 s on the candidate through full backfill and exact-key comparison. These are observed focused test elapsed times for matching fixture sizes. Work performed before the end of each measurement differs.

### Legacy skipped-count gaps

The old persisted count remains intact. Compare it with the number of existing `SKIPPED` rows for the wakeup and the size of its pending ranges. On a read-only store snapshot, a positive difference after subtracting both counts identifies a legacy accounting gap. The retained data cannot identify which historical timestamps were omitted. Preserve all known rows and receipts, report the shortfall, and leave those unidentified times ineligible for dispatch. The upgrade test seeds an abbreviated legacy projection, closes and reopens the store, verifies the shortfall remains visible, and then admits the next new literal slot exactly once.

## A06 and A07 parser and clock

| Service registration or emission | Expected and observed |
| --- | --- |
| CRON, local wall clock, unknown discriminator, arbitrary host event, malformed timestamps or interval, extra fields | `SCHEDULE_KIND_UNSUPPORTED`; no command receipt or sequence change, zero changed wakeup, occurrence, admission, work or outbox records and zero runtime calls. |
| UTC one-shot and interval with null, UTC, America/New_York, or Europe/Berlin display zone | Registration succeeds and stores identical UTC instants across display zones. Future schedules perform no execution. |
| Both allowlisted host-event kinds | Wrong correlation creates zero claims. Matching correlation creates the literal event key for the returned wakeup identity. Repeated event ID creates zero extra admissions. |

For each display timezone, the independent clock test uses anchor `1735689600123` and interval `2500`. Expected and observed timestamps embedded in `["anchored-fixed",1,<timestamp>]` are `1735689600123`, `1735689602623`, `1735689605123`, `1735689607623`, `1735689610123`, `1735689612623`, and `1735689615123`. At k0 there is one admission. Jumping to 1735689612999 produces four skipped rows (k1–k4) and the second admission at k5. Backward and repeated reads plus a real store reopen leave the identities and admission count intact. At k6 there is a third admission. A separate registration between slots chooses `["between-fixed",1,1735689605123]` and has no historical admission.

## A08 composed delivery custody

| Boundary | Before recovery | After recovery or observation |
| --- | --- | --- |
| COMMAND, scoped process double returns no PID | Occurrence `["command-custody",1,1735689600123]`, one captured admission UUID, original work UUID, effect `fixture-command-effect`, one spawn invocation, no process identity. | Same occurrence, admission, work, and effect after clock expiry and replacement Service. DELIVERED updates only the occurrence. Work remains UNKNOWN, zero exit receipts, still one spawn invocation. |
| COMMAND, locally observed no submission | The controlled gate fails before spawn. A forced exception leaves the dispatch intent before its failure record. Zero spawn invocations. | Service NOT_DISPATCHED permits a retry under the same original work, effect, occurrence and admission. The second gate call reaches the mock spawn once. A separate shared-gate fixture changes owner project while waiting. It yields one gate call and zero spawn. |
| Approved EXTERNAL_TASK, persistence cut | Occurrence `["external-custody",1,1735689600123]`, one captured admission UUID, original work UUID, effect `fixture-external-effect`, and one actual outbox record under `external:<workId>`. A controlled exception occurs before the scheduler receipt commits. | Replacement Service observes the same IDs and byte-identical outbox payload. Cancellation is retained through late DELIVERED. Zero runtime calls on this no-model fixture, one input row, one admission. |
| Approved EXTERNAL_TASK, model-bound positive control | The real scheduled enqueue callback persists the accepted input in a Store transaction and schedules the production outbox consumer. | One counted RuntimeAdapter.start has the same `inputId` and singleton `inputIds`, with zero follow-up calls. The actual runtime provider and native acknowledgement are outside this fixture. |

The production path exercised is scheduler dispatch intent → coordinator owner/work revalidation → COMMAND gate and imported spawn or Service enqueue and deliverOutbox → counted RuntimeAdapter. Recovery fixtures quiesce old callbacks and reopen the same store path in a replacement Service. The gated spawn double starts no native process. Existing late old/newer lease tests also exercise DELIVERED and NOT_DISPATCHED for historical occurrences without reverting the newer claim.

Independent native execution/profile qualification (#2048) and native accepted-input acknowledgement (#2042) remain NOT_RUN in this evidence. Authenticated intake, installed supervisor, and complete target-platform gates belong to their separate owners. All feature flags and reviewer approval in the strict manifest remain disabled.

## Verification results

`pnpm build:widgets`, `pnpm typecheck`, `pnpm lint`, and `pnpm build` passed on the candidate. The four targeted Vitest suites passed 122 cases. The shipped `pnpm test:browser --suite background-work` matrix gave 9 passes and the same 3 failures on both the source base and candidate. Those failures concern external inbox model approval, loading/empty/offline state, and keyboard action focus. The schedule next-run and pause-custody browser case passed on both. The repository's protected merge workflow supplies independent target-platform checks.
