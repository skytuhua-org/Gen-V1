# MTH07: Verify packaged math accessibility and publish adoption disposition

## META

`skytuhua-org/Gen-V1`; parent [#2229](https://github.com/skytuhua-org/Gen-V1/issues/2229) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/MTH07`, 2026-11-25. Kind: verification. Start: **BLOCKED**. Dependencies: [MTH06 #2283](https://github.com/skytuhua-org/Gen-V1/issues/2283).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-MATH-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-math-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Resolve the remaining packaged Windows, offline-font and real screen-reader gates for one frozen math candidate, then publish an evidence-based ADOPT or rejected/blocked disposition. This leaf has a finite manual matrix and no code implementation scope.

## REQUIREMENTS

Use the same exact candidate as MTH06, the supported packaged Windows build, named OS/build/hardware and actual installed screen reader/version. Browser zoom is not physical DPI evidence. Missing access is NOT_RUN and blocks adoption. No live model/account messages or personal traces; all input synthetic. Preserve normal review/merge authority and record READY, merged and verified-on-main separately.

Coverage: Math T05 native/adoption/handoff; R05/R08/R09/R10/R11; A08/A09/A10 and complete A01-A10 disposition. Inherited requirements remain binding.

## REPO_MAP

Packaging paths and asset inventory come from MTH02's exact build record. Existing source disclosure, CopyButton, MathML, motion settings and app zoom are the tested product surfaces. ANC04 and ANC06 provide the transcript controller and native reading-position evidence; renderer code does not supply a compensator. The report path is new, not a claim that such evidence already exists.

Proposed outputs: `docs/review-evidence/parallel-renderers/math-windows.md`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Manual matrix: completed fraction/matrix/integral; gradually closed formula during an active run; exact Copy message and Copy formula source including CRLF; keyboard Formula source disclosure; visual duplicate hidden while MathML is announced once; malformed/unsafe formula fallback; delayed import followed by owner/window switch; hidden pane return; sustained typing/IME/Send/Stop while64 admitted formulas queue. Repeat relevant cases light/dark/forced-colors,390px and short window, app zoom100/125/150%, Full/Reduced/Off/System with OS reduction.

Disconnect network after installing the exact package and reopen cold: every math font/CSS asset must load locally, with no external requests or silent missing glyphs. Verify native window ownership, no focus/selection theft, static formulas and detached-reader/switch-return behavior using ANC04/ANC06's accepted candidate. Record exact unsupported notation rather than implying arbitrary LaTeX support.

Capture paired1920x1080 before/after completed math, gradual closure, source/copy, delayed owner switch and typing/Stop. No inserted titles/overlays; captions outside footage pin SHAs, fixture/settings and synthetic/native scope. Narrow/offline/assistive checks have separate evidence. ADOPT requires all original A01-A10 plus current dependency/notice checks. Otherwise retain literal source; rejected trials remove unused dependency/notice through its code owner, preserving shared SRC01 and any independently used metadata.

Early stop path: A documented artifact/safety rejection from MTH01-MTH06 allows decision-only publication; unfinished implementation/platform checks remain NOT_RUN and literal source is retained.

## EXECUTION_DAG

**T01.** Read MTH06 and all owner/review records, verify the exact candidate/package hash and package it on the supported Windows host. Record any unavailable prerequisite before running the remaining matrix.

**T02.** Run offline local-font/network, app zoom/theme/motion, owner/window and input/Stop scenarios; retain redacted raw outcomes and failures.

**T03.** Use the actual screen reader to read inline/display math once and reach source/copy by keyboard. Verify focus, pointer/keyboard selection and failure text without live announcements.

**T04.** Capture matched clips and complete A08/A09 native rows; consolidate MTH01-MTH06 evidence into all ten original acceptance rows. Recheck dependency/advisory/notice state at release.

**T05.** Publish ADOPT only if all rows pass. Otherwise publish exact BLOCKED/REJECT with owner/next step and keep source behavior. Authorized coordinator updates complete parent/body/source, opens the focused PR, records CI/review/merge/main state and rollback, then ACK/RELEASE. No automatic merge or issue closure.

**Done when:** Durable native/AT report and complete A01-A10 disposition with exact candidate, honest pending/failure states and explicit rollback/recipient. Adoption remains off when any mandatory gate is missing. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Manual packaged-Windows and screen-reader matrix above is mandatory. Run packaging smoke through the MTH02 verified script and record its exact command in the report; do not invent an executable. Re-run affected browser checks only if a material fix changes the frozen head. Check current notices/lock/source inventory and pnpm check:docs-links for published evidence. Source safety/copy must remain exact in every mode; offline fonts and real AT are independent of DOM snapshots.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Needs the frozen browser-qualified candidate and supported Windows packaging/assistive environment. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/issues/2218).
- [Reference 2](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md).
