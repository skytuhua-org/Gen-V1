# Streaming Markdown adoption disposition

**Decision: DEFER.** Keep the literal Markdown renderer. STR01 established that the current browser and native snapshots lack durable per-message phase authority. Partial and final updates can have the same persisted message shape and source bytes. Native invalidation supplies connectivity and sequence, so it cannot distinguish a same-text final from a provisional message. A run identifier, arrival state or timeout cannot supply the missing authority. [Merged discovery #2381](https://github.com/skytuhua-org/Gen-V1/pull/2381) · [Exact phase baseline](streaming-phase-baseline.md)

The early decision path in [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292) allows this report from the recorded STR01 DEFER. The accepted R2 authority contract and atomic STR03 delivery are prerequisites for STR04, STR05 and STR07. The supported packaged Windows build, invalidation-only native transport and screen-reader measurements remain NOT_RUN. The existing browser probe was a literal-control observation, including two partial tails and final malformed source.

| Acceptance | Disposition |
| --- | --- |
| A01 actual App semantic gain | NOT_RUN for an integrated candidate. STR01 verified the literal control. |
| A02 browser/Windows phase | BLOCKED. Same-text final, stale/wrong owner, terminal and reconnect transitions require accepted message authority. |
| A03 exact source and copy | NOT_RUN for an integrated candidate. |
| A04 flags and certified edits | The isolated STR02 trial is archived. Runtime flag, exclusion and edit-certificate acceptance are NOT_RUN. |
| A05 existing Markdown limits and policy | Cleanup regression PASS for the existing 15 actual-App Markdown cases. Integrated repair policy coverage remains NOT_RUN. |
| A06 source selection and reveal invalidation | NOT_RUN through the trial. The independent SRC01 and STR06 work keeps its own source and review. |
| A07 input and motion parity | NOT_RUN for an integrated candidate. |
| A08 scan and performance budget | No streaming candidate measurement. Static/hidden cost and startup comparison remain NOT_RUN. |
| A09 reading, drafts and retained siblings | NOT_RUN through the trial. No additional scroll writer was introduced. |
| A10 package and ownership | Reviewed historical remend 1.5.1 trial remains retrievable. The unused package, lock, notice and isolated code are removed by the bounded cleanup. |
| A11 native parity and accessibility | NOT_RUN. Requires the accepted native transport, supported Windows build and actual assistive technology. |
| A12 decision and handoff | DEFER. This record, the discovery and the cleanup remain independently reviewable. |

The checked packaging command is `pnpm desktop:package`. Native same-text finality, all twelve transport transition groups, keyboard selection and copy, 100/125/150% zoom, motion and theme parity, and paired native video were not executed. A fresh trial needs the coordinator-reviewed full R2 phase amendment, atomic STR03 persistence and transport, the bounded per-workspace projection, a frozen browser candidate and actual native acceptance. [STR03 #2287](https://github.com/skytuhua-org/Gen-V1/issues/2287) · [STR04 #2288](https://github.com/skytuhua-org/Gen-V1/issues/2288) · [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291)

## Rollback and source custody

The unused dependency cleanup removes the isolated adapter and its tests, the exact package and notice, and the two source-inventory entries. The repository's normal Markdown renderer and live transports continue using their existing paths. The complete tested experiment and its notice remain at [#2382](https://github.com/skytuhua-org/Gen-V1/pull/2382) and [3ef1922448fa7cc15133a37ea8cbae8408bbff66](https://github.com/skytuhua-org/Gen-V1/commit/3ef1922448fa7cc15133a37ea8cbae8408bbff66). A future approved trial can resume review from that source. There is no rollout or persisted-data migration to reverse.

The parent [#2228](https://github.com/skytuhua-org/Gen-V1/issues/2228) retains the complete accepted requirements and receives this execution disposition in its journal. Browser discovery, review acceptance, documentation merge and native verification are separate records.
