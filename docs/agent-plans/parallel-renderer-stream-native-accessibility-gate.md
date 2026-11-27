# STR08: Verify native streaming parity and publish adoption disposition

## META

`skytuhua-org/Gen-V1`; parent [#2228](https://github.com/skytuhua-org/Gen-V1/issues/2228) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/STR08`, 2026-11-25. Kind: verification. Start: **BLOCKED**. Dependencies: [STR07 #2291](https://github.com/skytuhua-org/Gen-V1/issues/2291).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-STREAMING-MARKDOWN-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-streaming-markdown-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Verify the native path uses the same authoritative message semantics as browser rendering and resolve the manual accessibility gate. Publish ADOPT, DEFER or REJECT based on complete original acceptance, without treating stub coverage as native proof.

## REQUIREMENTS

Actual packaged Windows build, named OS/hardware/build and screen reader/version; same synthetic baseline/candidate/cadence. Native onWorkspaceChanged invalidation/snapshot delivery must be observed, with zero extra renderer SSE. Missing native/AT access blocks adoption. No credentials, provider calls, personal messages or private traces. Normal CI/review/merge authority remains separate.

Coverage: Streaming T05 native/accessibility/T06 decision; R02/R05/R10/R11/R12; A02/A10/A11/A12 and all A01-A12 disposition. Inherited requirements remain binding.

## REPO_MAP

STR01 reviewed R2 specifies the native writer/bridge/snapshot readers; STR03 implements them atomically. STR04's native stub and STR07 browser evidence are prerequisites, not substitutes. Existing main/canvas/embedded owner isolation, SourceWorkbench and SentenceReveal are the tested product boundaries. This task owns a report, no host/UI code.

Proposed outputs: `docs/review-evidence/parallel-renderers/streaming-windows.md`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Manual transport matrix: current partial delta; final changed text; final identical text; stop/error; reconnect/full refresh; wrong/stale sequence; native owner/window change; hidden/inert/held pane and return. Check provisional strong/code becomes literal on final malformed text, exact canonical Copy message/Copy code/source/export strings, focus and pointer/keyboard selection, unchanged sibling/draft state and no extra transport. Restore authority only from reviewed current metadata; runId/animation/default false cannot fill a gap.

Accessibility matrix: read live and finalized supported prose, navigate/copy/select with keyboard, inspect source fallback after same-text mode change and verify no extra tab stops, announcements, delay or motion. Full/Reduced/Off/System have equal semantics. Test native app zoom100/125/150%, light/dark/narrow pane and actual OS reduction; browser zoom does not prove native DPI. Capture matched1920x1080 baseline/candidate clips with equal cadence and no inserted overlays, plus distinct native/AT notes.

ADOPT requires original A01-A11 all PASS and A12 complete. Native truth/access missing means DEFER with exact prerequisite/owner; unsafe adaptation, unacceptable cost or a needed second parser means REJECT. Keep literal baseline and remove unused remend package/notices through its bounded owner. Preserve shared SRC01/STR06 and any approved metadata independently used by other features. A broader Streamdown migration requires a separate full amended decision.

Early stop path: A documented DEFER from STR01 or REJECT from STR02 allows a decision-only invocation; dependent implementation/native checks remain NOT_RUN and baseline is retained.

## EXECUTION_DAG

**T01.** Read STR07 and the complete accepted authority/source journals; verify the exact candidate/package/fixture hashes and supported Windows packaging command from the repository.

**T02.** Execute the native transport matrix, observing true invalidation-only delivery and absence of an extra renderer event stream; record any failure with exact owner/sequence transition.

**T03.** Perform real screen-reader, selection/focus/copy/source, motion/theme/zoom checks and paired native captures. Mark unavailable rows NOT_RUN, never inferred from browser output.

**T04.** Consolidate every original A01-A12 with immutable evidence; recheck artifact/license/notices and no unintended dependency/runtime expansion. Assign ADOPT/DEFER/REJECT by the stated gates.

**T05.** Authorized coordinator publishes the complete decision/source/body readback, focused implementation or decision-only PR, exact CI/review/merge/main status and rollback. Record recipient ACK/remaining work and RELEASE; no automatic closure or merge.

**Done when:** Complete durable adoption disposition with actual native/AT results or precise DEFER/REJECT, exact remaining owner/gates and no stale claim. Browser-only shipping is impossible under this task. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Use the STR01 exact native contract commands and repository verified packaging smoke, recording executable names rather than inventing them. Replay all12 state groups on real native transport where applicable and confirm same-text final parity. Supported Windows screen-reader smoke and exact copy/source checks are mandatory. Run only affected browser regressions after material fixes; rerun native evidence on a changed head. Publish full raw outcome matrix with redacted evidence.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Requires frozen browser candidate plus real supported Windows invalidation transport and screen-reader access. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/api.ts).
- [Reference 2](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md).
