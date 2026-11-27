# Motion timing consistency prerequisite

## META

| Field | Value |
| --- | --- |
| Repository / revision | `skytuhua-org/Gen-V1` / `BLUMA-TIMING-R1`, 2026-11-25 |
| Verified baseline | `main@96ca4c3bd0664fca53775fbe31915c209641986c` |
| Parent / child | [#2212][parent]; child [#2214](https://github.com/skytuhua-org/Gen-V1/issues/2214) |
| Documentation branch | `docs/bluma-component-adoption-plans`; planning/publication only |
| Implementation / runtime verification | `NOT_STARTED` / `NOT_RUN` |
| Provenance | Complete AGENTS.md, CONTRIBUTING.md and DESIGN.md; pinned source/tests; related issue journals and PR patches inspected on 2026-11-25 |
| Related work | [#1192][audit]/[#1546][sweep], [#1186][popover]/[#1199][popover-pr], [#1302][refinement]/[#1420][refinement-pr] |

## OBJECTIVE

Correct speed consistency before further component motion. `applyAppearance` writes panel duration `220 / motionSpeed`; `animateTask` reads that effective token then divides again. At speed 1.25, CSS receives 176ms and imperative motion 140.8ms; at 0.75, approximately 293.33ms and 391.11ms. Speed 1 conceals the defect. Sidebar collapse already consumes tokens as-is. Success is single scaling across real preferences with lifecycle, reduced-motion and immediate input preserved.

## REQUIREMENTS

Proposed implementation decisions; no schema/dependency change.

| ID | Requirement |
| --- | --- |
| R01 | `applyAppearance` remains the effective CSS-token producer. Valid resolved tokens, inherited overrides and zero are consumed as-is by `animateTask`. |
| R02 | Missing/invalid tokens use numeric base duration divided once by positive finite speed, defaulting invalid speed to 1. Never pass negative/nonfinite duration to WAAPI. Preserve easing. |
| R03 | Exercise actual preferences 0.75/1/1.25. New effects use updated preferences; changing speed alone does not restart or retime an existing imperative effect. |
| R04 | Preserve policy precedence and lifecycle. Newly created Reduced effects strip travel/cap opacity at 80ms; Off creates none. Off finishes active effects; Reduced finishes only previously full-policy spatial effects. Existing opacity-only effects retain their duration. Preserve native completion/cleanup. |
| R05 | Retain mounted controls, drafts, selection, focus and geometry. Restore/snapshots do not replay entrances. Typing, Send, Stop, drag and keyboard activation never await animation. Add no timers, observers, frame loops, layout reads or input delays. |
| R06 | Replace contradictory duration assertions; cover panel, artifact and row consumers, with unchanged sidebar collapse as the correct comparison. Inspect effect timing instead of elapsed-time guesses. |
| R07 | Obtain Worker3 coordination on #1115/#1811 for shared helpers/tests; resolve #1192/#1546 scope. Recheck #1199/#1420 overlaps. One writer per file and concern per PR. |
| R08 | Provide reproducible evidence, normal review/CI and merged-main verification. Use synthetic data; change no persistence, authority, account, backend or security boundary. |

Scope: resolver, integration, producer comment, related tests/fixtures and manifest. Exclusions: `MotionRegion`/spring changes, retokenization sweep, new choreography/timings/easing/layout/palette, libraries, Bluma acquisition, telemetry, caller sweep or other adoption tracks. Preserve `animateTask` signature and raw callers.

Flows: each speed with window opening, artifact publication/editing and thread reorder; live speed/policy changes; restore without replay/draft loss.

## REPO_MAP

Existing paths/symbols verified at baseline; additions explicitly proposed.

| Source | Evidence / intended treatment |
| --- | --- |
| `apps/web/src/useAppearance.ts`: `applyAppearance`, `useAppearance` | Parses preferences; writes `data-motion`, `--motion-speed`, and effective `--ui-motion-* = base/speed`, or zero for Off. Keep calculation; document effective-token ownership. |
| `packages/contracts/preferences.ts`: schema, `DEFAULT_PREFERENCES`, `getPreferences` | Speed literal union 0.75/1/1.25; System/Reduced/Off. Read only, no migration. |
| `apps/web/src/task-motion.tsx`: `animateTask` | Resolves inherited token through `getComputedStyle`, then unconditionally divides by root speed. Replace duration calculation only. |
| `apps/web/src/motion-policy.ts`: `readMotionPolicy`, `observeMotionPolicy` | Existing policy/subscription owner. Add proposed pure `resolveMotionDuration`; preserve existing exports/behavior. |
| `apps/web/src/DocumentWindow.tsx`, `FloatingWindow.tsx`, `Artifact.tsx`; `task-motion.tsx`: `useArtifactEntrance` | Token entrances and raw exit/placement calls; read-only consumers. Preserve shell geometry, restoration and cancellation. |
| `apps/web/src/sidebar-thread-move.ts`, `sidebar-collapse.ts` | First calls `animateTask` with insertion token; second already consumes effective tokens as-is. Production read only. |
| `tests/motion-policy.test.ts`, `motion-spring.test.ts` | Existing policy/cleanup and spring checks. Proposed new `tests/motion-timing.test.ts` tests resolver decisions. |
| `tests/e2e/motion-tokens.spec.ts` | `.3s`/speed 1.25 currently expects 240ms; correct 300ms, add real preferences. |
| `tests/e2e/artifact-settle.spec.ts`, `artifact-settle-fixture.tsx` | `.48s`/unsupported speed 2 expects 240ms; use real 1.25, expect480ms, plus ordinary preference cases. |
| `tests/e2e/thread-move.spec.ts`, `thread-move-fixture.tsx` | `.3s`/speed 1.25 expects 240ms; correct 300ms with real preferences. |
| `tests/e2e/sidebar-collapse.spec.ts` | Correctly checks base/speed and unchanged `.3s`/`250ms` overrides; run unchanged. |
| `tests/e2e/shared-motion.spec.ts`, `micro-motion.spec.ts`, `composer-press.spec.ts` | Policy/completion/cleanup, geometry, restore, pointer/keyboard coverage. Extend shared-motion preference gaps only. |
| `tests/e2e/task-interface-fixture.ts`: `taskFixture`, `serveTaskFixture` | Exposes `snapshot`, `publish()`, commands; settings feed production `useAppearance`. Reuse unchanged. |
| `scripts/public-source-files.json`, `scripts/browser-suites.ts`, `package.json` | New test belongs in manifest `source`, not `runtime`; reuse suites/dependencies. |

### Existing work and ownership

| Work / inspected head | Observation and integration requirement |
| --- | --- |
| #1115 / #1811 / [W3 instructions][w3] | Worker3 owns shared helpers/tests under the [pinned acceptance plan][w3-plan]. Read full plan/journal; route failing timing reproduction to W3 or record explicit subtask/hunk allocation before source edits. Publisher release is not shared-source reassignment. |
| #1192 / [original claim][old-claim] | `devin-t3local-7db967` claimed scope on 2026-11-21; no explicit release observed. A later stale-session takeover and that worker's release do not release this original claim under current AGENTS.md. Require explicit release/reassignment or acknowledged nonoverlapping allocation. |
| #1546 / `ad0e2604e5a10ae5ec6bc7682b31455a0150a1c7` | Open canonical retokenization PR, reaffirmed in [reopen comment][sweep-canonical]. Patch changes `model-picker.css` and `sidebar-context.css`, not the defect source. Coordinate #1192/#1546; an acknowledged split permits this fix without waiting for unrelated CSS integration. |
| #1186 / #1199 / `f8cb8c797c75ec963d04bf0027cc2ec33ebc74d9` | Open shared-popover patch changes consumers, tokens and source manifest; no duration-helper fix. Coordinate manifest overlap or rebase after its integration. |
| #1302 / #1420 / `cd8ea7d55d4d4b89f88675f4d5e888686754371a` | Open refinement changes FloatingWindow and browser coverage, not either defect source. Recheck test-file/consumer overlap; preserve its ownership and acceptance scope. |

Dated patch observations, not runtime acceptance. T01 refreshes heads/claims; if already fixed, reuse canonical work for integration/verification.

## DESIGN

### API and duration contract

Preserve existing signatures. Proposed DOM-free export in existing `motion-policy.ts`:

```ts
export function resolveMotionDuration(
  baseDurationMs: number,
  resolvedToken: string | undefined,
  speed: number,
): number;
```

Trim token; accept a single finite nonnegative CSS time with `ms` or `s`, including decimals, signs and numeric exponent notation. Convert seconds to milliseconds and return that effective value without speed scaling. Valid zero stays zero. Reject negatives, nonfinite results, unitless values, partial `parseFloat` matches, time lists and `calc(...)`.

Absent/invalid token: finite nonnegative base or zero, divided by finite positive speed or 1; nonfinite result becomes zero. Retain one computed-style read/easing resolution. Pass root speed, remove unconditional division, then apply existing Reduced cap.

`applyAppearance` scales CSS tokens; resolver scales only raw fallback. Overrides are final effective durations.

| Speed | Panel base 220ms | Insertion base 180ms | Explicit `.3s` |
| --- | ---: | ---: | ---: |
| 0.75 | 293.333333ms | 240ms | 300ms |
| 1 | 220ms | 180ms | 300ms |
| 1.25 | 176ms | 144ms | 300ms |

Assert computed/effect durations within 0.001ms; do not round to whole milliseconds or sleep to infer timing.

### Lifecycle and fixture integration

No lifecycle redesign. New Reduced effects keep opacity/offset only and cap duration at 80ms. On live downgrade, Off finishes active effects; Reduced finishes full-policy effects only when their original frames contain spatial properties. An already-running opacity-only effect retains its duration. Keep native finish/promise, explicit cancel and cleanup. Speed updates retain active Animation/timing; future effects read new speed, with no new observer.

Proposed fixture-only `speed` query parameter accepts `0.75`, `1`, `1.25`, otherwise defaults to 1. In artifact-settle and thread-move fixtures, construct preferences from existing defaults/`getPreferences` and call production `useAppearance` in the component. Await applied root speed/token before measured actions. Full-App tests set `snapshot.settings.preferences` before `serveTaskFixture`; update that snapshot and call returned `publish()` for live changes. Do not forge `--motion-speed` as preference coverage. Apply local token/easing overrides separately after real preference application.

Malformed token coverage must prove fallback does not throw or strand shells. No data migration, network or security change. Roll back the focused PR and its changed assertions together; do not revert adjacent motion work.

## EXECUTION_DAG

Sequence: **T01 -> T02 -> T03 -> T04**. One implementation writer; independent review is read only.

### T01: Refresh evidence and allocate scope

**Prerequisites/inputs:** accepted plan, full canonical issue/Markdown/journal, repo rules and current main/PRs. Documentation claim does not authorize implementation.

**Steps:** Refresh claims/patches/producer/consumer; search `animateTask`, `motionSpeed`, `motion timing`, `double scaling`; record SHAs. Read full W3 acceptance plan and #1115/#1811 journal; obtain shared-helper/test allocation there. Resolve #1192/#1546 and #1199/#1420 overlap. Claim T02-T04 on isolated current-main branch. If already fixed, revise to canonical integration/verification. Reconcile new W3 lifecycle changes without expanding this timing scope.

**Ownership/output:** coordinator produces acknowledged file/claim ledger, refreshed defect evidence and starting SHA; no source edits before allocation.

**Tests:** positive: producer/consumer inspected at same SHA; negative: no duplicate fix or assumed stale-owner expiry.

**Done/handoff:** allocation/evidence accepted and reread; named worker receives T02. Otherwise block implementation, publish unblock action, release scope.

### T02: Specify and fix single scaling

**Prerequisites/inputs:** T01 acknowledgment; duration contract/table; current source and preferences.

**Files/owner:** one worker owns `motion-policy.ts`, `task-motion.tsx`, comment in `useAppearance.ts`, new `tests/motion-timing.test.ts`, manifest entry and initial `motion-tokens.spec.ts` regression.

**Steps:** Test ms/s/zero, speeds, missing/malformed tokens and invalid base/speed. Capture actual-preference panel failure; integrate resolver without policy/frame/cleanup changes. Comment producer contract, register test in manifest `source`; run focused unit/panel checks.

**Outputs/tests:** minimal fix, A01-A03 red/green evidence. Token/raw 220 at 1.25 both176; zero never falls back; malformed values never yield NaN/negative timing; speed 1 unchanged. Missing-export failure alone is not product reproduction.

**Done/handoff:** focused checks pass at recorded commit, no choreography/lifecycle diff; checkpoint remaining cases to T03, same test-file writer.

### T03: Align consumer tests and preserve interactions

**Prerequisites/inputs:** T02 commit; existing native timing recorders; actual preference/override contract.

**Files/owner:** same worker owns `motion-tokens.spec.ts`, artifact-settle spec/fixture, thread-move spec/fixture and necessary `shared-motion.spec.ts` test/fixture changes. Other suites unchanged. Refresh claims before newly overlapping edits.

**Steps:** Parameterize real preferences across panel/artifact/row; correct overrides 300/480/300ms with easing. Probe raw/invalid-token native fallback. Update speed during held effect: retain identity/timing, next effect changes. Publish app Reduced/Off and emulate OS reduction, distinguishing existing opacity-only effects from spatial/new effects. Preserve native cancel/finish/cleanup, restore, geometry, focus and keyboard/pointer checks; sample timeline positions.

**Outputs/tests:** A03-A07: timing, stable identity/draft/caret/input; no restore replay, new Reduced travel, new Off effect, stranded shell/completion/subscription. Sidebar collapse agrees.

**Done/handoff:** scoped checks pass on frozen source or acceptance explicitly blocked; immutable commit/evidence to T04 reviewer.

### T04: Review and verify integration

**Prerequisites/inputs:** T03 evidence, complete acceptance matrix, manifest diff, acknowledged ownership ledger.

**Steps:** Run type/build/lint gates. Perform Windows smoke below, including Send/Stop while an effect is active. Open focused linked PR; record exact commands/counts/skips and versions. Resolve normal review/CI. After authorized merge, fetch exact main SHA and rerun timing unit and affected browser checks there. Update complete plan/status; publish/read back release with `OWNER=NONE` and clear claimed assignment/in-progress labels.

**Ownership/outputs:** worker owns PR/evidence; reviewer read only; maintainer owns merge. Record reviewed PR, evidence, merge/main/Windows states and release.

**Tests:** A08; negative: queued CI, a local Linux pass or ready PR is not merged-main/Windows verification.

**Done/handoff:** A01-A08 accepted at merged SHA and scope released to #2212; otherwise `HANDOFF_PENDING` with remaining checks/role, not closed as fixed.

## VALIDATION

### Setup and commands

Use full checkout at recorded implementation SHA, Node >=24.10.0 and pinned pnpm 10.30.3. Follow CONTRIBUTING/setup guide for Windows x64, pinned Bun and required browser channels. Sparse documentation clone is not a prepared test environment. From repository root:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm build:widgets
pnpm exec vitest run tests/motion-timing.test.ts tests/motion-policy.test.ts tests/motion-spring.test.ts --maxWorkers=1
pnpm typecheck
pnpm build
pnpm lint:ui --check
pnpm test:browser --suite motion-tokens
pnpm test:browser --suite artifact-settle
pnpm test:browser --suite thread-move
pnpm test:browser --suite sidebar-collapse
pnpm exec playwright test --config tests/e2e/micro-motion.playwright.config.ts tests/e2e/shared-motion.spec.ts tests/e2e/micro-motion.spec.ts
pnpm test:browser --suite composer-press
```

`test:browser` reuses build; `test:e2e --suite NAME` builds first. Required CI remains authoritative; add local checks only for uncovered risks. Publication: `pnpm check:docs-links`. Missing tooling/platform checks: `BLOCKED`/`NOT_RUN`.

Full-App setup: preserve settings fields; assign `snapshot.settings.preferences = { motion: 'system', motionSpeed }` before serving. Live update: mutate settings, call `publish()`, await applied tokens. Reuse synthetic fixtures/native recorders.

### Acceptance matrix

| Check | Requirements / tasks | Observable pass condition |
| --- | --- | --- |
| A01 | R01,R06 / T02,T03 | Actual-preference panel timing 293.333333/220/176ms within 0.001ms, equal to effective CSS token. Capture pre-fix 1.25 discrepancy; source predicts 140.8ms. |
| A02 | R01,R02 / T02 | Unit `.3s`=300, `250ms`=250, `0ms`=0 independent of speed. Invalid token -> base/speed; invalid base -> 0; invalid speed -> 1. Native fallback agrees without throwing. |
| A03 | R02,R03,R06 / T02,T03 | Raw 180 -> 240/180/144ms. Artifact/row consumers match effective tokens at every speed. Corrected overrides remain 300/480/300ms with inherited easing. |
| A04 | R03,R04 / T03 | Speed update retains active Animation/timing; next effect uses new value. New Reduced effects have no travel/opacity <=80ms; Off creates none. Live Off finishes active effects; Reduced finishes previously full spatial effects while existing opacity-only effects retain duration. |
| A05 | R04,R05 / T03 | Native finish fulfills and fires finish; explicit cancellation rejects and fires cancel. Cleanup returns listeners/subscriptions to baseline; no stranded shell after finish/cancel/unmount. |
| A06 | R05,R06 / T03,T04 | Existing geometry tolerances, DOM identity, draft/focus/selection and quiet restore remain. Held effects allow typing and pointer/keyboard activation. Windows smoke demonstrates Send/Stop without waiting for effect completion. |
| A07 | R01,R05,R07 / T01,T03 | Unchanged sidebar suite passes; no added per-frame work/observer/delay in diff; exact ownership acknowledgments recorded. |
| A08 | R07,R08 / T04 | Type/build/lint/browser evidence, Windows smoke, required CI/review and main checks tied to immutable commits; canonical plan updated; final release accepted/read back. |

Windows smoke: versions/viewport/actual zoom; dark/light 100/125/150%, keyboard, narrow/short. Exercise speeds, documents, artifact editing, thread moves and live policy/speed. Type/Send/Stop during active effects; record dispatch/state. Browser fixtures do not prove packaging/physical DPI/live providers; those implementations stay out of scope.

Retain timing/frame JSON, geometry/identity assertions, redacted traces, counts and focused visual evidence. Freeze final source. Release: A01-A08 plus normal review/CI; distinguish merged/main/Windows.

**Executed for this revision:** source/document/issue/PR-patch inspection only. Product implementation `NOT_STARTED`. All application unit/browser/type/build/lint/Windows checks `NOT_RUN`. Pre-fix timing values are source arithmetic, not a claimed runtime reproduction; T02 captures actual red/green evidence.

## STATE

Decided: contract/API/matrix, three contradictory assertions and narrow scope. Inspected PR patches do not fix defect. T01-T04 `NOT_STARTED`; A01-A08 `PENDING`.

Owner: #2212 documentation coordinator; implementation `NONE`. Docs branch in META; no product diff/PR or runtime acceptance.

Risks: W3/#1192 shared ownership, changing PRs, fixtures bypassing preferences, misleading assertions. Next: publish complete body/identical file, record child URL, read back/release docs scope. Receiver reads full journal, executes T01 coordination then real-preference regressions. Handoff pending publication and ACK.

## REFERENCES

- [#2212][parent]: adoption program; this is its independent timing prerequisite.
- [Pinned source tree][source]: AGENTS.md, CONTRIBUTING.md, DESIGN.md and exact paths in REPO_MAP. Rules require complete plans, acknowledged claims, scoped verification and release.
- [Producer][producer] and [consumer][consumer]: effective tokens then unconditional second division. The sidebar/test paths in REPO_MAP provide correct comparison and contradictory assertions.
- [W3 shared ownership][w3] and [full pinned plan][w3-plan]: coordinate #1115/#1811 helper/test allocation.
- [#1192][audit]/[claim][old-claim], [#1546][sweep]/[confirmation][sweep-canonical]: silence does not release scope.
- [#1186][popover]/[#1199][popover-pr] and [#1302][refinement]/[#1420][refinement-pr]: conditional integration dependencies; inspected heads recorded above.

[parent]: https://github.com/skytuhua-org/Gen-V1/issues/2212
[source]: https://github.com/skytuhua-org/Gen-V1/tree/96ca4c3bd0664fca53775fbe31915c209641986c
[producer]: https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/useAppearance.ts
[consumer]: https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/task-motion.tsx
[audit]: https://github.com/skytuhua-org/Gen-V1/issues/1192
[old-claim]: https://github.com/skytuhua-org/Gen-V1/issues/1192#issuecomment-7059580213
[sweep]: https://github.com/skytuhua-org/Gen-V1/pull/1546
[sweep-canonical]: https://github.com/skytuhua-org/Gen-V1/pull/1546#issuecomment-7088568412
[popover]: https://github.com/skytuhua-org/Gen-V1/issues/1186
[popover-pr]: https://github.com/skytuhua-org/Gen-V1/pull/1199
[refinement]: https://github.com/skytuhua-org/Gen-V1/issues/1302
[refinement-pr]: https://github.com/skytuhua-org/Gen-V1/pull/1420

[w3]: https://github.com/skytuhua-org/Gen-V1/issues/1115#issuecomment-7088725984
[w3-plan]: https://github.com/skytuhua-org/Gen-V1/blob/8ad7387890cef5f52aeb925fc278ff53f78ac93c/docs/agent-plans/worker-3-forms-charts-shared-motion-acceptance-r2.md
