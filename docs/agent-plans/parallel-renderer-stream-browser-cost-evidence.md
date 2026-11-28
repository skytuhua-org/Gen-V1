# STR07: Compare streaming semantics and browser update cost

## META

`skytuhua-org/Gen-V1`; parent [#2228](https://github.com/skytuhua-org/Gen-V1/issues/2228) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/STR07`, 2026-11-25. Kind: verification. Start: **BLOCKED**. Dependencies: [STR05 #2289](https://github.com/skytuhua-org/Gen-V1/issues/2289).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-STREAMING-MARKDOWN-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-streaming-markdown-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Measure whether the two approved partial-tail cases improve semantics in the actual App without harming source/selection, motion, input or startup cost. Produce a finite evidence report for STR08.

## REQUIREMENTS

Same synthetic chunks/settings/control/candidate/machine. Replay20 updates/second for small,8Ki-unit,32,768-unit/cap+1 paragraphs,100 retained messages and adversarial delimiters. Candidate p95 update scripting/render<=baseline+2ms, no new adapter-attributable task>50ms. Record cold/warm distributions, raw samples, heap trend, calls and production compressed bundle/startup delta. Static/oversize has zero repair calls and no hidden/idle work.

Coverage: Streaming T05 browser/comparison; R01/R03-R09/R12; A01/A03-A10 browser portions. Inherited requirements remain binding.

## REPO_MAP

Use STR02's20 adapter decisions, STR04's12 state groups and STR05's10 mounted groups. Registered suites are micro-motion Markdown/motion, runtime-presentation, source workbench and conversation-scroll. This verifier owns report/tests only; implementation fixes return to the relevant STR task. No product measurement instrumentation or broad performance rewrite.

Existing narrow hunks: `tests/e2e/markdown.spec.ts`.

Proposed outputs: `docs/review-evidence/parallel-renderers/streaming-browser.md`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Positive comparison requires actual strong and code semantics for unfinished two-asterisk bold and single-backtick code, then literal malformed text after final/stop/error including unchanged-text final. A screenshot hiding markers does not establish semantic improvement. Negative controls cover earlier/completed paragraphs, headings/lists/tables/fences, static/history/user/artifact/Files/canonical callers and exact whitespace/copy/export/source.

Measure every policy with identical formatting correctness. Verify selection across append/final, unchanged phrase preservation, same-text source fallback and stale UI settlements, no new tab stop/live status/delay, memo recomputation and no mask replay. Capture light/dark, narrow panes, app zoom100/125/150%, Full/Reduced/Off and System OS reduction. Preserve #1655 run eligibility and #2218's existing reading controller; no new writer or sibling remount.

Freeze head before final browser checks. Repeat noisy runs rather than cherry-picking; label browser/native stub evidence accurately. Record concrete startup/bundle tradeoff and useful rejected inputs. Only a specific useful failure of this narrow trial can motivate a separately reviewed Streamdown decision; no automatic fallback, parser upgrade or universal O(delta) claim.

## EXECUTION_DAG

**T01.** Verify baseline/candidate hashes, exact remend artifact and approved R2, then freeze the20/12/10 fixture matrices and named machine/browser/build/settings.

**T02.** Run focused semantic, source/copy/memo/selection, excluded-context, table/code/link/hostile and motion regressions using the real App and typed transport fixtures.

**T03.** Replay the specified20Hz cases and measure cold/warm update distributions, long tasks, input, calls, heap trend and compressed production entry/lazy cost. Record failures and noise.

**T04.** Capture matched1920x1080 before/after with equal cadence/policy, plus narrow/zoom/theme/motion evidence. Keep version/settings captions outside footage and all data synthetic.

**T05.** Publish A01/A03-A10 browser results and exact remaining native/accessibility gates to [STR08 #2292](https://github.com/skytuhua-org/Gen-V1/issues/2292). Return failures to code owners and rerun affected rows only after a frozen fix.

**Done when:** Finite paired report establishes semantic benefit or a reproducible failure, with all cost samples, exact candidate/fixture identity and honest missing-platform rows. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run adapter/state/source-selection/conversation-scroll units, pnpm typecheck, pnpm build; micro-motion config markdown.spec.ts micro-motion.spec.ts; runtime-presentation, conversation-scroll, workbench and workbench-app configs; public-source.test.ts and pnpm check:docs-links. Assert zero extra traffic/storage/content mutation, zero hidden/idle/history-cache work, no focus/scroll takeover and identical semantics across motion modes. Performance thresholds are trial targets, never facts until measured. Native stub success does not pass STR08.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Needs the frozen integrated candidate, authority contract and matching unmodified control. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/issues/1655).
- [Reference 2](https://github.com/skytuhua-org/Gen-V1/issues/2218).
