# Worker 2. Developer tools, data and credentials

**Execution prompt, revision `GUI-ACCEPT-2026-11-22-r2`, November 22, 2026 Pacific.** You own UI 05, 06, 07, 08, 10, 11, 12. Use this file independently. The numbered objects keep the IDs of the original videos. [Canonical parent #1811](https://github.com/skytuhua-org/Gen-V1/issues/1811) · [Worker 2 history #1116](https://github.com/skytuhua-org/Gen-V1/issues/1116)

## Start here

Read the current `AGENTS.md` on `main`, this entire file, the parent journal and your lane's latest checkpoint. Confirm the current refs and record your own scope claim and ACK on #1811. Keep your lane issue linked. An outstanding implementation claim belongs to its current owner until release or reassignment. The publisher's claim covers documentation only. [Agent instructions at the audited base](https://github.com/skytuhua-org/Gen-V1/blob/36fcc56d24cef7558059264a8540d7f0592d93cd/AGENTS.md) · [Contribution rules](https://github.com/skytuhua-org/Gen-V1/blob/36fcc56d24cef7558059264a8540d7f0592d93cd/CONTRIBUTING.md) · [Environment setup](https://github.com/skytuhua-org/Gen-V1/blob/36fcc56d24cef7558059264a8540d7f0592d93cd/docs/getting-started.md)

The first part of this file is the acceptance revision. The final specification preserves the original detailed design, fixture inputs, commands, recorders and acceptance tests. Its old checkout command, original PR order, reported results and past assignments are historical. Start from current main or the existing owner's authorized branch as specified in the acceptance revision. Use its task-specific design and exact evidence recipes. Use the later lane design revision where explicitly applicable. A current matching fix calls for verification. Repair just the reproducible gap in your owned scope.

**Input and output.** Read the published changes before modifying any renderer. Run on Node ≥24.10.0 with pnpm 10.30.3, locked install, bundled Chromium and the branded browser requested by each Playwright config. Run `pnpm build:widgets` before unit checks and `pnpm build` before the built-app browser pass. Use the supported Windows x64 host for desktop-specific acceptance. Record OS, browser/channel, scale, runtime and full Git SHA. Deliver the assigned numbered MP4s, the machine-readable manifest, chapter frames, reviewer findings and exact check results. Set up once per isolated worktree. Worker 1 also delivers 24 real-model trial records. Worker 3 reconciles the four manifests and compares their common SHA to the 24-trial ledger.

## Parallel ownership and integration

| Boundary | Sole editor during this acceptance round |
| --- | --- |
| Documents, graph, map, image compare, editor, question/receipt, composition guidance and held-out eval | W1 owns planning-question semantics and provides the focused hunk when needed in `App.tsx`. W3 lands new shared-file hunks. |
| Diagnostics, changes, endpoints, pipeline, stats, comparison and credential surface styles/tests | W2. Own the software component selectors, including their use of the control-border token. |
| Shared lifecycle/tabs, central registration, generic table/control accessibility, token definitions, shared motion and the evidence ledger | W3. Own new shared hunks in `App.tsx`, `styles.css`, `scripts/task-design-scenes.ts`, browser-suite and source manifests, and global motion/theme tests. Preserve W2’s existing scroll-pill and W1’s planning behavior. W1 can verify table-footer behavior directly. |
| Image annotation, schedules, logs, boards, architecture, traces and plan progress | W4. Own the existing work-object and exploration components, their local CSS and associated test files. |
| Shared shell, server grants, provider services, repo-wide CI and other active feature work | The registered maintainer for the affected subsystem. None of the four takes over unrelated implementation. |

For a shared file needed by another lane, the requesting worker supplies exact path, hunk, fixture ID, expected behavior, failing/passing commands and base SHA on #1811. The sole editor applies or forwards the hunk after checking existing claims. Workers with separate worktrees can run all checks immediately. Isolate temporary recorders and outputs per worker outside the tracked product changes. First finish lane-only work. When the reviewed component changes can run together, W3 is the integration evidence coordinator. W3 collects four PR/commit IDs and retrieves a clean, pushed combined candidate from the integrating maintainer. If no common ref exists, W3 can assemble the already reviewed, in-scope lane revisions on a disposable current-main integration branch under the repo’s normal review rules. On a conflict, stop that merge in the disposable worktree, post the paths and exact two revisions to the owning lane, and continue the independent checks. W3 publishes the full common SHA and four inclusion records on #1811 before declaring the build frozen. A temporary integration ref is distinct from merged main. Reuse the repo's review/merge process. Record a merged PR for squashed changes or show ancestry for merged commits, then verify the included behaviors. The four film sets must come from that same frozen SHA. If code changes, freeze a new SHA and capture on it.

## Reference timing and visual review

The earlier frame audit inspected all 1,019 decodable frames of the 34-second 1280 × 720 reference, and sampled all 29 baseline clips across 443.032 seconds. Baseline clips used the actual renderer with authored data and started after initial publication. These timestamps are prior observations at 30 fps. Use your interface's millisecond values in the retained specification for implementation. [Original renderer](https://github.com/skytuhua-org/Gen-V1/tree/4bcdc82a73a28d27d6ebe413a527389119f35292) · [Design guidance at the revision used by the original audit](https://github.com/emilkowalski/skills/tree/64eb3deb9a5fbfa041faf783e0bc3fd635872e9c)

| Recording time | Frames | Moment | Observed detail |
| --- | --- | --- | --- |
| 2.667–2.967 s | 0080–0089 | Immediate action acknowledgment | Create PR becomes Creating PR with a spinner; the pill grows and carries the adjacent diff pill. A user message appears with a short upward reveal. |
| 3.867–4.267 s | 0116–0128 | Task object materializes | Card shell and commit graph appear through a short soft reveal. Lower history is present first; upper active rows follow. Composer is carried down; internal controls remain arranged. |
| 4.933–5.533 s | 0148–0166 | New commit label resolves | Uncommitted changes becomes Add session refresh tests through visible changing alphanumeric suffixes. SHA and author replace the file count. Footer changes to Pushing 3 commits to origin beginning f148, clear by f152. Existing history stays still. |
| 7.100–8.367 s | 0213–0251 | Main advances within the graph | A slot opens before new content appears. Rotate session keys enters from f220, decoding through f237; Read sessions with the current key enters above it from f228, decoding through f251. Older rows are carried down. Checking it merges cleanly begins f229. |
| 8.733–9.000 s | 0262–0270 | Conflict state becomes actionable | Top intent changes to a gold warning and 3 conflicts; two main commits receive amber text and counts 1 and 2. Footer presents 3 conflicts with main and Resolve conflicts. Composer status mirrors the same state. |
| 11.767–12.000 s | 0353–0360 | Three-conflict evidence appears | A rounded elevated panel fades into place above the footer trigger. File and line hunks are readable as one coherent panel. No surrounding layout reflow. |
| 12.933–13.033 s | 0388–0391 | Evidence exits promptly | Popover fades away over about 100 ms between first change and first absent frame. The graph does not move. |
| 16.133–16.267 s | 0484–0488 | Resolve receives immediate acknowledgment | Resolve conflicts becomes Resolving plus a spinner. Footer reads Merging main into the branch. Action remains anchored at the right as its label width changes. |
| 17.400–18.500 s | 0522–0555 | Resolution commit is inserted | A row slot opens below Merge into main; a blue-highlighted Merge main into feat/session-refresh row appears from f532 and its label decodes through roughly f555. The same graph grows; it is not replaced. |
| 19.767–21.067 s | 0593–0632 | Determinate tests run on the new row | Counter becomes 1/42 at f593 and reaches 42/42 at f628, held through f632. Thin green progress underline advances on the resolution row. Footer reports Running N of 42 tests. Remaining conflict confirmation appears by f595. |
| 21.900–22.600 s | 0657–0678 | Ready state and staggered validations | Ready to merge and Merge appear first. Tests chip begins f660, Lint f663, Types f665, Preview f668; all labels are legible by f671 and confirmation marks settle around f678. The button is visible before optional checkmark motion finishes. |
| 28.300–28.467 s | 0849–0854 | Merge receives immediate acknowledgment | Footer becomes Merging into main; button becomes Merging with a spinner after a brief soft label replacement. No modal takes over the task. |
| 29.400–29.600 s | 0882–0888 | Result replaces the same task state | Validation row disappears and card contracts. Header reads Merged, virtual tip turns purple, footer becomes Merged into main and the right action becomes GitHub. Main branch chip returns to the top result row. |
| 29.400–30.200 s | 0882–0906 | Result label resolves | Merge into main decodes into Merged into main through changing suffix characters. This is a distinct one-shot title effect, not evidence of backend execution or an actual typewriter implementation. |
| 29.700–30.567 s | 0891–0917 | Purple confirmation follows the feature branch | Highlight reaches the resolution commit around f891, Add session refresh tests f893, Refresh sessions near expiry f895 and Read session expiry from token f898. Purple row washes fade by f915-917; unrelated gray main and green analytics rows remain unhighlighted. |
| 30.600–32.233 s | 0918–0967 | Stable completed object | The finished graph and GitHub action hold without further attention-seeking motion. The earlier conflict paragraph remains unchanged, a concrete continuity limitation. |

Watch each new real-time clip once at normal speed and once at 0.25×. Step one frame at a time from the last old state through the first stable new state of each chapter. Record the first useful, first changed and last moving frames and the first actionable frame. In the review sheet name the exact object, neighbor that must stay anchored, visible feedback and what actually caused it. Compare the action's availability against the source receipt. Measure internal empty regions separately from the conversation margins. Check content fit, preserved hit targets, label clipping, controls reachable at 390 × 844, a 640 px content pane and 200% zoom. Repeat at 1280 × 800, 1440 × 1000, 1920 × 1080, light/dark and the motion policies specified for the component. Profile the costliest scene on a real ≥60 Hz display and record hardware, sampled frame intervals and any long frames against the 16.7 ms budget at 60 Hz. Keep sensitive traces private and publish a redacted summary.

Record the independent review as PASS, FAIL or BLOCKED per UI, with the timestamp or frame and evidence URL. The reviewer checks all four questions. Does motion explain the changed task object? Does the first response arrive with actionable data? Do unchanged objects, focus and reading position stay put? Does the layout use the source's shape and fit the task at the specified widths? Fix each failure at its owning surface and retest. The product owner makes the final visual decision against the supplied benchmark after watching the integrated takes.

## Current assignment and source map

Work on Worker 2 only. Deliver seven independently playable clips for UI 05, 06, 07, 08, 10, 11 and 12, plus a browser/CI evidence ledger that another worker can reproduce. Keep the task-specific inspector, diff, API contract, dependency diagram, trend, comparison table and masked credential field distinct. Preserve source values, accessible names, existing operation permissions and receipt semantics. Submit a change only for a reproduced gap. The earlier full implementation prompt and approved compact spec are reproduced in the appendices; their historical branch-install/checkout steps and status claims describe their original snapshots. Use the following baseline and gates for new work.

| Source | Verified at planning time | How to use it |
| --- | --- | --- |
| [main](https://github.com/skytuhua-org/Gen-V1/commit/36fcc56d24cef7558059264a8540d7f0592d93cd) | Current-main audit pin. | Fetch the new main at pickup and record any movement. Never call a stacked result integrated until checked on the coordinator's common SHA. |
| [#1127](https://github.com/skytuhua-org/Gen-V1/pull/1127) | Open, `refine/developer-tools-data@4d2186681ae8ed968a3c06353a5986f5a0ae669f` targeting main. | Primary implementation includes both corrections from the walkthrough: inventory row and scroll pill. |
| [#1142](https://github.com/skytuhua-org/Gen-V1/pull/1142) | Open, `devin/1795159200-w2-compact-design@92d2e1233de899dc001061e9f9698e56ad7792c1`, stacked on #1127. | Preserve compact design. The maintainer had paused this PR. Planning and isolated verification do not authorize merging it or resuming a paused build. |
| [#1258](https://github.com/skytuhua-org/Gen-V1/pull/1258) | Open, `4f1ce8876c17557d361be92c91d8e2f1735f6666`, stacked on #1142; [CI failed](https://github.com/skytuhua-org/Gen-V1/actions/runs/44867987707). | Compare the specific diagnostics geometry test with the candidate. Carry the missing test hunk only. The current PR file list includes unrelated package paths. Do not merge the branch wholesale. |
| [QA walkthrough](https://github.com/skytuhua-org/Gen-V1/issues/1116#issuecomment-7057479055), [repair report](https://github.com/skytuhua-org/Gen-V1/issues/1116#issuecomment-7076539462), [design reconciliation](https://github.com/skytuhua-org/Gen-V1/issues/1116#issuecomment-7076810084) | Reported 45 focused outcomes with four expected-failure declarations, plus two shell tests. | Treat the four publication cases as open positive coverage. The two-row inventory approved in the latest review overrides the compact spec's original one-line row. |
| [CI on #1142](https://github.com/skytuhua-org/Gen-V1/actions/runs/45003253770/job/137149174592) | Browser job succeeded, but this shard failed at `tests/theme-contrast.test.ts:307`: the `.software-blocking-checks button` rule lacks `var(--control-border)`. | The design SHA sets `border:0` on that button. The UI control-token test explicitly checks that selector. Independent of whether Worker 3 has restored the global token definitions. |
| [Old recording manifest](https://github.com/skytuhua-org/Gen-V1/blob/361a3d4440c7720ad467cb337a4fe04d80d91956/videos/manifest.json) and [recorder sources](https://github.com/skytuhua-org/Gen-V1/tree/361a3d4440c7720ad467cb337a4fe04d80d91956/recorder) | Seven fixture films available for the older source `5c8b18eeed718cfd5ab2c696e0b668b14fe81a20`. | Use them for before comparisons; they predate the repairs. |

Owned renderer files live under `apps/web/src/`: `SoftwareDevelopment.tsx` and `software-development.css` (05–08), `EverydayData.tsx` and `everyday-data.css` (10–11), `CredentialEntry.tsx` and `credential-entry.css` (12). Owned browser assertions live in `tests/e2e/{task-software,software-clarity,software-development,everyday-ui}.spec.ts`. The narrow .jump-latest rules in `styles.css` and corresponding button placement in `App.tsx` are an existing W2 change. Verify those hunks intact, route any shared-shell change through the coordinator, and leave lifecycle/registry ownership to Worker 3. Read `tests/theme-contrast.test.ts` as a consumer contract. Use isolated worktrees. Keep shared fixtures, shell tests, theme tests and runtime packages read-only in this lane.

## Execution and acceptance

**W2-T01. Establish a reproducible candidate.** Depends on receipt and acknowledgement of the parent plan. Fetch current main, the three PR heads and the pinned baseline before tests. Record `git rev-parse HEAD`, `git status --short`, `git diff --name-status <base>...<head>` and `git log --oneline --left-right <base>...<head>`. Read outstanding #1127 review threads including the two review flags referenced by the existing issue, and record disposition or unavailable access. If the PRs landed under squash commits compare the landed files and tests. On a private candidate apply only missing Worker 2 behavior and tests. Do not reapply the title fix if the DOM already meets T03. Deliver a ledger row for each PR with live base/head and the included or redundant hunks.

The established UI-11 Comparison redesign already merged through [#1113](https://github.com/skytuhua-org/Gen-V1/pull/1113) at `cae3f27c033867d40f1c5b075b1d081dd68218b7`. Preserve the radio-group option cards, roving selection, compact difference grid, shared selection state and source disclosure when reconciling `EverydayData.tsx` and its CSS. Test the newer radio keyboard semantics on the combined build. [Design owner #1108](https://github.com/skytuhua-org/Gen-V1/issues/1108)

**W2-T02. Repair the actionable blocking-check boundary.** Depends on T01; isolated implementation requires the applicable claim. Run the theme command below on the exact design or combined candidate. In `software-development.css` change the resting `.software-blocking-checks button` from `border:0` to `border:1px solid var(--control-border)` and its `5px 9px` padding to `4px 8px` to retain outer geometry. Keep the subtle fill, 6px radius, gap, label, readable focus outline, and existing action semantics. Apply this scoped exception to the compact spec's quiet-pill styling. Leave the token definitions and the source contract assertion intact. Run the full theme suite, inspect the button in both themes and with keyboard focus, and activate one prerequisite. The selected real prerequisite must open with the same source identity. No extra submissions. Hand the result, exact SHA and both-theme captures to the coordinator. If the candidate already has an equivalent scoped fix verify it and record zero edits.

**W2-T03. Prove the two layout repairs in the built conversation.** Depends on T01. At 1280×800 open the Development fixture, then Diagnostics. Confirm a 220px or wider desktop inventory when the inspector is two-column, a single-line 13px/20px ellipsized name and a separate 11px metadata row. Use the test `diagnostics keep long check names separate from source metadata` from #1258, including `meta.y >= name.y + name.height - 1`; the full name must remain available to assistive technology and in detail. At 390×844 verify stacked content and that only the intended scrolling area scrolls. Open the failing pipeline stage, expand its output, enter reading mode by scrolling up, and bring `src/orders.ts:42` (or the actual first error on a changed fixture) into view. Confirm the `.jump-latest` button is inside `.conversation-scroll`, sticks 12px above its lower edge when applicable, remains reachable, and leaves the target log line visible and hit-testable across mid-scroll, bottom and composer growth. Compare text-range and button bounding rectangles or screenshot evidence at the specific overlap position. Click the pill and confirm return to latest and restored following; scroll away and append another event, confirming no forced jump. A CSS placement assertion alone does not prove non-occlusion.

**W2-T04. Resolve four unverified entrances.** Depends on T01. In `tests/e2e/task-software.spec.ts` find the parameterized `test.fail(true, ...)` for Diagnostics, ChangeSet, ApiExplorer and Pipeline. Instrument an empty live conversation before publication, feed the same supported create/update path as normal generation, collect the ornament's Web Animations start, target, duration and lifecycle events. For each type capture exactly one eligible delayed entrance, no effect on bootstrap/replay, and no additional ornament on an identical update, absent ornament target, keyboard interaction, app off/reduced or OS reduced motion. Sample event starts instead of racing an attribute in its short-lived state. Leave final controls immediately usable. Replace each expected failure only when the positive and negative cases actually pass. If the host omits the first-publication lifecycle, send Worker 3 event sequence, failing test, precise SHA and minimal fixture through the parent; finish T02, T03 and unrelated UI checks in parallel. Never simulate success by adding the host attribute inside the test.

**W2-T05. Exercise each surface against its source.** Depends on T01; T02–T04 supply additional gates on affected UIs. Publish absent → real record → changed source → identical update, then perform the following. Repeat input via keyboard and with app/OS motion opt-out; no ornament may duplicate an action or change the underlying data.

| Deliverable | Positive: film and verify | Negative: prove and log |
| --- | --- | --- |
| `05-diagnostics.mp4` | Select a failing test, expand failure detail; compare file:line, current counts, expected/received, and entity-specific state accent to the input. | Identical status and keyboard reselection are quiet. Long title never covers source/status; single-pane reads correctly. |
| `06-change-set.mp4` | Change files while a selected patch is scrolled, return, publish a changed patch, expose Old/New gutters, changed-hunk cue, rationale and update marker. | Unchanged-only file has no hunk effect; viewing proposed code sends no approval and edits no file. Retain per-file scroll and current focus on fast reversal. |
| `07-api-explorer.mp4` | Select method/path and response, inspect parameters; separately exercise with and without a request example, on either side of 540px container width. | Missing body/request shows accurate empty state; absent executor cannot execute. Switching examples leaves the request and execution state untouched. |
| `08-pipeline.mp4` | Open failed stage/output, inspect real blockers, then insert and rewire a stage; verify rail at 615/616px boundaries and DAG fallback for branches. | No phantom success or shifted endpoint. Endpoint is within 1 CSS px of the intended node on settle. Reversal and motion-off settle to the new graph and preserve reading position. |
| `10-stats.mp4` | Change metric; compare displayed value, unit, change direction, trend and source table; exercise unequal, equal and single-point trends. | Missing trend/values stay explicitly unavailable. No invented scale, trend, direction, or numeric count-up. Rapid metric change ends on latest metric. |
| `11-comparison.mp4` | Select two alternatives in order, use Differences only, open source description, send a preference and verify the authoritative receipt for the current intent. | A late receipt for the earlier intent cannot overwrite the new choice. Equal rows hide only with the filter; focus, horizontal table scroll and selected column remain usable. |
| `12-credential-entry.mp4` | Use solely a synthetic disposable value on an isolated fixture. Show checking, masked input, confirmed saving/removing, keyboard/IME behavior, error and retry. | Record masked view throughout. No literal value in captured requests included in evidence, console, filenames, manifest, captions or exported snapshot. Stale/pending result cannot impersonate “saved.” |

**W2-T06. Run and record gates.** Depends on T02–T05 for final verdict; run suites early for diagnosis. From repository root use the locked pnpm and Node versions in the appendices, then run:

```bash
pnpm install --frozen-lockfile
pnpm build:widgets
pnpm exec playwright install chromium
pnpm exec vitest run tests/theme-contrast.test.ts tests/credential-entry-ime.test.ts tests/credential-slots.test.ts
pnpm exec playwright test --config tests/e2e/clarity-software.playwright.config.ts --list
pnpm exec playwright test --config tests/e2e/clarity-software.playwright.config.ts
pnpm exec playwright test --config tests/e2e/everyday.playwright.config.ts
pnpm exec playwright test --config tests/e2e/shell.playwright.config.ts --grep 'reading|latest'
pnpm typecheck
pnpm lint
git diff --check
```

Run all other checks and full credential regression cases in the appendices. Report real counts for passed, failed, skipped, expected failures and unexpected passes. Recheck on the coordinator's single integrated SHA after all roles land. Run the seven named clips from the appendix recorder with its 500ms pre-publication hold, source changes, interruption and final 900ms hold. Keep product time real, capture H.264 at 1920×1080/30 fps, use ffprobe and decode to EOF, then read back the shared evidence links. Attach SHA-256, lifecycle chapter timestamps, actual source SHA, fixture identity, viewports, light/dark, secondary small/zoom captures, geometry numbers, focus results and any missing visual evidence. The 30 fps video does not measure 60 Hz smoothness; record frame timing separately for that claim.

**W2-T07. Hand off.** Depends on T06. Send the parent the seven individual file links, durable manifest, reviewed diff and test reports, a per-UI verdict with failed frame/time if applicable, latest exact CI job results and the four-entrance outcome. Use the issue's checkpoint/RELEASE protocol. Leave implementation, integration verification and maintainer visual approval as separate fields. The only work performed during this planning audit was source, issue and CI-log inspection; no fresh test, film or acceptance verdict is claimed here.

## Requirement-to-task verification map

| Requirement | Worker-local task IDs | Acceptance evidence | Handoff task |
| --- | --- | --- | --- |
| Usable diagnostic, pipeline and prerequisite controls | T02, T03 | Control outline, text geometry and click hit-test in both themes and the reading-mode host. | T06 |
| Custom motion and compact controls on seven UIs | T04, T05 | Four positive first-publication cases pass with their quiet controls; seven task interactions preserve source state. | T06, T07 |

Use T01 for source reconciliation before editing. Preserve the first failure and its SHA. Roll back a failed local acceptance change by discarding its disposable candidate or reverting its own isolated commit through review. Restore the last known-good candidate and rerun its corresponding positive and negative tests. Preserve all four existing branches and other workers’ pending edits.

## Preserved lane design revision

This is the previously published design and copy specification. Interpret its historical ownership and delivery statements at their recorded date. The acceptance tasks above establish present ownership, tests and integration order. [Design decision on issue #1116](https://github.com/skytuhua-org/Gen-V1/issues/1116#issuecomment-7037143481)

# Design spec — Worker 2 generative UI compact pass (revision 2, fully specified)

Scope: the seven generative UIs on `refine/developer-tools-data` — 05 Diagnostics, 06 Change set, 07 API explorer, 08 Pipeline, 10 Statistics, 11 Comparison, 12 Credential entry. Files: `apps/web/src/{SoftwareDevelopment.tsx,EverydayData.tsx,CredentialEntry.tsx,software-development.css,everyday-data.css,credential-entry.css}` only. No behavior, schema, state, or motion-contract changes. Every value below is normative — the implementer makes no design choices. Implemented as PR #1142 (held open, unmerged).

## 0. Shared rules

**Spacing rhythm.** Sections inside a surface separate by `margin-top:10px`. Heading-to-content gap is `margin-bottom:10px` on the surface header. No full-width `border-top` as a routine divider; `border-top:1px solid var(--border)` only on `.software-detail` and `.software-patch-heading`, `border-bottom:1px solid var(--border)` under tab strips and table heads. Tonal blocks use `background:var(--subtle); border-radius:7px`.

**Type ramp (px, weight):**
- Surface title `h4`/`h3`: 14/600, `letter-spacing:-.012em`.
- Detail heading `h4`: 13/600, `letter-spacing:-.01em`, `line-height:1.5`.
- Stat value: 22/550, `letter-spacing:-.02em`, `font-variant-numeric:tabular-nums`.
- Primary body/list text: 12–13px, `color:var(--text)`.
- Meta/secondary/captions: 11px `var(--muted)`; dense sub-meta 10px `var(--muted)` (this is the floor — nothing below 10px except the 9px `.software-patch-updated` pill and 9px `td small`).
- Mono: `var(--code-font,ui-monospace,SFMono-Regular,Consolas,monospace)`; body code 12px/1.7, sub code 11px, assertion values 13px/1.55.

**Selection language (replaces uniform bordered chips).** Three patterns, applied per context below:
- *Edge accent* (list rows in an inspector): unboxed row, `border-left:2px solid transparent`; selected → `border-left-color:var(--text)`; hover → `background:var(--hover)`; radius `0 4px 4px 0`.
- *Underline tab* (file/method/response strips): unboxed button in a strip with `border-bottom:1px solid var(--border)`; selected → `box-shadow:inset 0 -2px 0 var(--text)` (no fill, no border); radius top `5px 5px 0 0`.
- *Quiet pill* (blocking checks, toggle actions): `background:var(--subtle); border:0; border-radius:6px`; selected uses the same accent as context.

Focus ring everywhere: `outline:2px solid var(--ui-focus-ring,#808080)`. Coarse pointer: raise compact rows to `min-height:36px` via `@media(pointer:coarse)` where the row is < 36px.

## 1. 05 Diagnostics (`software-check-inventory`, `software-detail`)

- `.software-heading`: flex row, `min-height:24px; margin-bottom:10px; gap:8px 16px`. Counts strip stays inside the heading, right side: `.software-counts` — flex, `gap:12px`, 11px `var(--muted)`, tabular-nums; each count `gap:5px` + 4px round dot `background:currentColor`. This is the only status summary — no per-row status duplication.
- Inventory rows (`.software-check-inventory button`): CSS grid `minmax(0,1fr) auto`, `gap:8px`, `align-items:center`, `padding:5px 6px`, `min-height:0` (~28px rendered), edge-accent selection (see §0). Row content: one line — status icon (14px flex, `var(--muted)`) + name `software-item-copy` 12px/500 + `.software-item-meta` 10px `var(--muted)` as trailing inline meta (`padding-left:0`, `gap:10px`).
- `.software-investigation` at `@container software (min-width:640px)`: `grid-template-columns:clamp(220px,calc(100% - 416px),240px) minmax(0,1fr); gap:14px`; inside it `.software-detail` drops its border-top and padding.
- `.software-detail`: `padding:10px 0 0; margin-top:10px; border-top:1px solid var(--border)`.
- `.software-detail-heading h4`: 13/600. Right side `.software-detail-status` (check-state 11px + duration 11px `var(--muted)`, `strong` 600 `var(--text)`).
- `.software-assertion`: grid `minmax(0,1fr) 18px minmax(0,1fr)`, `gap:10px`, `padding:8px 0; margin:0 0 6px`; column labels 11px `var(--muted)`; `pre` 13px/1.55 mono, transparent background, `white-space:pre-wrap`; failed received value `color:var(--danger)`; arrow icon `var(--muted)` 18px.
- `.software-diagnostic-details` (margin 8px top; summary 11px muted) and `.software-diagnostic-message` (12px, pre-wrap, `margin:8px 0`).
- `.software-code` figures: `margin:10px 0 0`; figcaption 11px muted `margin-bottom:7px`; `pre` `padding:12px; border-radius:7px; background:var(--subtle)` 12px/1.7 mono.
- `.software-empty`: 12px muted, `padding:10px 0`. `.software-source`/`.software-log`: `margin-top:10px`, summary 11px muted. `.software-actions`: `margin-top:14px`, `gap:10px`, buttons 11px.
- Narrow (`@container software (max-width:540px)`): inventory rows fall back to single-column grid, meta indents `padding-left:22px`; detail heading `h4` 14px.

## 2. 06 Change set (`software-file-review`)

- File chips → underline tab strip: `.software-file-review .software-list { gap:2px; border-bottom:1px solid var(--border) }`; buttons row-flex `align-items:center; gap:10px; min-height:30px; padding:5px 9px; border:0; border-radius:5px 5px 0 0; transition:none`; selected `box-shadow:inset 0 -2px 0 var(--text)`. Tab content: file name + `.software-item-meta` (10px muted: change counts `.software-diff-counts` with `b` `var(--success)`, `i` `var(--danger)`, weight 500; file-status 10px muted capitalize).
- `.software-file-location`: `margin:0 0 8px`, 11px muted, gap 8px spans tabular-nums.
- `.software-patch-heading`: grid `var(--patch-old,44px) var(--patch-new,44px) minmax(0,1fr)`, `padding:6px 0 5px; margin-top:10px; border-top:1px solid var(--border)`, 11px muted; old/new labels right-aligned `padding-right:9px`; `.software-patch-key` `padding-left:22px`, legend b 14/600 (`--danger` removed / `--success` added).
- `.software-patch`: `padding:8px 0`, 12px/18px mono; row grid `var(--patch-old) var(--patch-new) 20px minmax(max-content,1fr)`, `min-height:18px`, `padding-right:10px`; line-number cells 10px muted `opacity:.8` right-aligned `padding-right:9px`, new-line cell `border-right:1px solid color-mix(in srgb,var(--border) 75%,transparent)`; gutter `patch-gutter` 11/600 centered; hunk row `var(--muted)` on `var(--hover)`; added `color-mix(in srgb,var(--success) 8%,transparent)`, removed `…var(--danger) 8%…`; `.patch-updated` pill 9px/550 `var(--accent-fg)` on `…var(--accent-fg) 12%…`, `margin-left:8px; padding:1px 6px; border-radius:8px`.
- `.software-change-note`: `margin:0 0 18px`, 12px muted, summary 11px.

## 3. 07 API explorer (`software-contract`, `software-api`, `software-api-flow`)

- Method chips (`.software-method`): 10px/1.4 mono, `min-width:44px; padding:3px 5px; border-radius:5px`; GET `var(--hover)` bg + `var(--text)`; POST `var(--success) 9%` bg + `--success`; DELETE `var(--danger) 9%` bg + `--danger`. Unchanged semantics.
- Endpoint tab strip (`.software-contract .software-list`): `gap:0; border-bottom:1px solid var(--border)`; buttons `border:0; border-radius:5px 5px 0 0; padding:6px 10px; min-height:32px`; selected `box-shadow:inset 0 -2px 0 var(--text)`. `.software-contract .software-detail` drops border-top.
- `.software-endpoint-summary` 13px `margin:0 0 15px`. Parameter details: summary 11px muted, table `.software-parameters` 11px, th 10px muted weight 400, `:is(td,th) padding:6px 10px 6px 0; border-bottom:1px solid var(--border)`; `td small` 9px muted `margin-left:5px`; `td p` 10px muted `margin-top:3px`.
- `.software-api-flow`: single subtle block — `display:grid; grid-template-columns:minmax(0,1fr) 18px minmax(0,1fr); gap:12px; align-items:start; margin-top:10px; padding:10px 12px; border-radius:7px; background:var(--subtle)` (no border-top). No request example → `[data-has-request=false]` single column `gap:8px` with `.software-request-note` 11px muted.
- Inside the block: section `header` `min-height:24px` space-between, `h5` 11px/550, header `>span` 10px muted; `.software-code` `margin-top:6px`; nested `pre` transparent, `padding:0; border-radius:0`, 11px mono. `.software-flow-arrow` `var(--muted)`, centered.
- `.software-response-tabs` (`gap:4px`): buttons `min-height:26px; padding:3px 7px; border:0; border-radius:4px`, 11px/1.5 mono `var(--muted)`; selected `color:var(--text); box-shadow:inset 0 -2px 0 var(--text)`. `.software-response-label` inherits body font. `.software-response-description` 11px muted `margin:8px 0 0`.
- `.software-no-body`: `margin:8px 0 0; padding:14px 12px; min-height:56px`, 11px muted (no background).
- `@container software (max-width:540px)`: api-flow → single column `gap:18px`, arrow hidden, nested `pre` `min-height:0`.

## 4. 08 Pipeline (`software-stage-graph`, `software-stage-rail`)

- DAG graph: `grid-template-rows:repeat(var(--stage-rows),56px)`; row chain (`data-chain=row`): `grid-auto-rows:minmax(36px,auto); gap:8px`; column chain: flex column `gap:8px`, stage `min-height:44px`. Connectors unchanged (`--muted` 1px, opacity .7, arrows `--muted` fill).
- `.software-stage-rail button` (stepper step): `min-height:0; padding:6px 8px; border-color:transparent; background:transparent; margin:0 8px` — no card chrome; selected `background:var(--hover)`; hover same. Content: `.software-stage-node` 18px circle (`var(--surface)` bg, `1px var(--border)`; passed `--success 50%/border`, failed `--danger 50%/border`, running `--accent-fg 50%/border`), then `.software-item-copy` 12px name (`gap:7px`, `z-index:1` above connectors), `.software-item-meta` `padding-left:25px` 10px muted, `.software-stage-result` `margin-left:auto` 10px weight 400.
- `.software-dependencies`: 11px muted, `margin:0 0 16px`, `gap:6px`. `.software-blocking-checks`: quiet pills — `gap:6px; margin-bottom:10px`; buttons `gap:7px; padding:5px 9px; border:0; border-radius:6px; background:var(--subtle)` 11px `var(--text)`.
- `.software-stage-description`: `margin:8px 0`, 12px. `.software-command`: `padding:8px 10px; margin-top:10px`, subtle 7px radius, 11px muted, label weight 550. `.software-log` `margin-top:10px`.
- Narrow (≤540px container): graph → flex column `gap:7px`, connectors hidden, step `min-height:54px` full-width.

## 5. 10 Statistics (`everyday-stats`)

- `.everyday-heading`: `margin-bottom:10px`; `h3` 14/550; side `>span` 11px muted.
- `.everyday-metric-nav`: bottom `1px var(--border)`, buttons `padding:6px 12px 8px`, `border-radius:0`, first `padding-left:0`; label `>span` 11px muted (selected `var(--text)`), value `>strong` 15px/550 tabular-nums (unit `small` 10px/400 `margin-left:4px`); indicator `.everyday-metric-indicator` `height:2px; background:var(--text); border-radius:2px` (entrance motion unchanged); hover `background:var(--subtle)`; focus `outline-offset:-3px`.
- `.everyday-selected-stat`: `padding:10px 0 0`. `.everyday-stat-label` 12px muted. `.everyday-stat-value` 22/550 `-0.02em` tabular-nums `line-height:1.35`; adjacent meta `>span` 13px muted `gap:7px` baseline. `.everyday-stat-comparison` `margin-top:6px; gap:6px`, 11px muted, value span 550; favorable `var(--success)`, unfavorable `var(--danger)`.
- `.everyday-trend`: `margin-top:10px; max-height:140px`; scaled → `grid-template-columns:64px minmax(0,1fr); gap:8px`; scale labels `.everyday-trend-scale` 10px muted right-aligned, upper `top:14.58%`, lower `bottom:16.67%` (flat: upper `top:48.96%`). SVG `viewBox="0 0 720 140"`, `max-height:140px`; baseline `d="M18 126H702"` `var(--border)` 1px; line `var(--text)` 2.5px round caps `vector-effect:non-scaling-stroke`; points `r=3` fill `var(--text)`; y-mapping `spread?118-(v-low)/spread*96:72`, x `18+index/(n-1)*684` (n>1) else `18+.5*684`. Empty state: `.everyday-trend-empty` `min-height:96px`, "Trend unavailable" 12px muted centered.
- `.everyday-trend-labels`: 10px muted, space-between, `padding:0 2.5%`; when scaled `margin-left:72px; padding-inline:calc(2.5% - 1.8px)`.
- `.everyday-source-values` / `.everyday-source`: `margin-top:10px`, 11px muted; details summary same style; table `margin-top:10px`, `width:max-content`, `:is(th,td) padding:6px 12px 6px 0; border-bottom:1px var(--border)` 11px, thead muted, `.number` right-aligned nowrap; caption text-left `margin-bottom:6px` `var(--text)`; row hover `var(--hover)`.
- `.everyday-empty` `padding:12px 0`; `.everyday-unavailable` `padding:10px 0` — both 12px muted.
- ≤700px: heading `gap:10px`, side `10px`; nav buttons `flex-basis:120px; padding:8px 10px`; stat value 20px.

## 6. 11 Comparison (`everyday-comparison`)

- `.everyday-comparison-controls`: `grid-template-columns:minmax(0,1fr) auto; gap:8px; margin-bottom:8px`. Current-column block: `>strong` 12px/550; `.everyday-selected-summary` fixed `height:18px`, 11px muted, single-line ellipsis. `.everyday-column-details` `margin-top:8px` 11px muted; p `margin:6px 0 0`.
- `.everyday-difference-toggle`: 10px muted, `gap:7px`; checkbox 13×13px.
- Table `.everyday-comparison-table`: `border-collapse:separate; border-spacing:0; table-layout:fixed; width:100%` 12px/1.5. Head `th` weight 400: `padding:8px 12px 10px; border-bottom:1px var(--border); min-width:135px`; first col `width:21%; min-width:130px`; header button 12px `gap:7px` (`strong` 550, `p` 11px muted `margin-top:8px`). `.everyday-option-selector` 15px radio circle `1px var(--control-border)` on `var(--surface)`; selected `border-color:var(--text)`.
- Body `:is(th,td) padding:8px 12px; border-bottom:1px var(--border); vertical-align:top`; row headers 11px muted (`small` 10px `margin-top:3px`); `.is-unavailable` 11px muted; `td.number` right nowrap; row hover `var(--hover)`.
- Selected column `.is-selected`: `background:color-mix(in srgb,var(--accent-soft) 35%,transparent); box-shadow:inset 1px 0 0 var(--text),inset -1px 0 0 var(--text)` — hairline edges + light tint, no card fill, no per-cell radius. Entrance edge `.everyday-entry-column-edge` 2px top `var(--selection-border)` unchanged.
- `.everyday-comparison-footer`: `margin-top:12px`, space-between wrap `gap:12px`; `p` `gap:8px` 11px (muted span, strong 550); `.primary` button 11px.
- Scroll container `.everyday-comparison-scroll`: `overflow:auto; scrollbar-width:thin; overscroll-behavior:contain`. Min widths: table 570px at ≤700px viewport, 650px at ≤600px; cell padding `8px 10px` at ≤700px.

## 7. 12 Credential entry (`credential-entry`)

- `.credential-entry`: `max-width:580px`, 13px/1.5 `var(--text)`.
- `.credential-heading` one row: `align-items:center; gap:9px; margin-bottom:10px` — `.credential-key` 28px box (`var(--subtle)`, radius 8, `var(--muted)`, `KeyRound size 16`), then `strong` 13/550 service + `p` 11px muted purpose `margin-top:2px`, then `.credential-status` pushed right: `margin:0 0 0 auto; flex-shrink:0; gap:6px; min-height:18px`, 10px muted. States: pending → `LoaderCircle` 12px `.spinning` + label; saved → `SavedStatus` with `--success` check; absent → `.credential-empty-dot` 5px circle `1px var(--muted)` + "No token saved"; unavailable → "Status unavailable".
- `.credential-label`: 12px, `margin-bottom:5px`. `.credential-input input`: `min-height:36px`, 13px, `padding-right:42px`; `.icon-button` absolute `right:6px`.
- `.credential-actions`: `margin-top:10px; gap:8px`; primary `min-inline-size:96px`, buttons 11px. `.credential-lifetime`: `margin-top:10px`, 10px muted `line-height:1.6`. `.credential-error` `margin-top:12px` (`.error-text` shared).
- Reduced motion: `.credential-status .spinning` animation off. ≤520px: purpose 11px, input 14px (iOS zoom guard).

## 8. States & interactions (unchanged by this pass — implementer must not alter)

- Selection, keyboard focus order, aria-selected/tab roles, `role=status`, all IDs/labels.
- Motion machinery: `useSoftwarePanelMotion`, `usePublicationEntrance`, `CheckState`, entry ornaments (`software-entry-accent`, `software-entry-underline`, `everyday-entry-tick`, `everyday-entry-column-edge`, `everyday-metric-indicator`) — same elements, origins, durations (120–150ms range) and reduced-motion fallbacks.
- Status color semantics: `--success`/`--danger`/`--pending`/`--accent-fg`/`--muted` mappings in §1–§7 are the only status colors.
- Touch: `@media(pointer:coarse)` lifts inventory rows and file tabs to `min-height:36px`.

## 9. Validation

`pnpm typecheck`; `pnpm lint`; `git diff --check`; `vitest run tests/credential*`; Playwright suites `clarity-software` (36) and `everyday` (14); fresh screenshots of all seven surfaces at 1440/768/375 widths in light and dark. All existing class/role-based assertions must pass unchanged; only tests pinning obsolete geometry may be updated with a note.

## Receiver handoff and journal

Use a worker-specific monotonically numbered checkpoint on #1811 when starting, after each task or material change, on CI or review results, on handoff and before stopping. After 20 minutes of active work without a milestone, publish a checkpoint per AGENTS.md. Include the previous permalink, plan revision, UTC, owner and recipient, every task and its state, exact command and result counts on the identified SHA, branch/PR/status, changed paths, tracked/untracked and push state, artifacts, failures, assumptions and next executable action. Release only your own scope with `OWNER=NONE` when stopping. A receiver ACK identifies the task IDs and starting SHA. Provide the files and manifest through a durable repository-authorized evidence location. Redact identifying personal content, credentials, private paths, bearer tokens and signed grant URLs. Keep the stable synthetic IDs or aliases and source revisions needed to reproduce the result. A receiver must be able to open and decode each assigned file. Never check private profiles, tokens, raw traces or generated videos into the product source branch.

## Preserved original Worker 2 specification

Original source SHA-256 `9b05d70544fe3506954edc583113f573f8d7136c7e864920c6bd5f147b509cba`. The bytes from the next heading through end of file reproduce the original assignment. Use the current-state instructions above for starting refs and ownership. The original source-only recording route is executable using the checked-in fixtures when the historical review ZIP is unavailable.

# Worker 2. Developer tools, metrics and credentials

Implement the following changes in `skytuhua-org/Gen-V1`. Give a failing assertion, changed file, endpoint, pipeline stage, measured value, plan comparison and credential receipt different working layouts. Keep the selected target under the pointer when its evidence changes.

You own seven interfaces. Return one working branch, one individually playable MP4 for each interface and the verification results. This entire Markdown file is your instruction. Execute it in one worker session from the pinned base.

| UI | Assignment | Review video to return |
| --- | --- | --- |
| 05 | Test diagnostics | `05-diagnostics.mp4` |
| 06 | Multi-file code changes | `06-change-set.mp4` |
| 07 | API contract explorer | `07-api-explorer.mp4` |
| 08 | Pipeline and release checks | `08-pipeline.mp4` |
| 10 | Statistics | `10-stats.mp4` |
| 11 | Option comparison | `11-comparison.mp4` |
| 12 | Private credential entry | `12-credential-entry.mp4` |

## Start from the inspected source

Use the existing authorized checkout of [skytuhua-org/Gen-V1](https://github.com/skytuhua-org/Gen-V1). The common starting commit is `26ddf4d16c2fc1196b520d8a46c5441d64d01463`. Every section below can be implemented against that commit in this branch. Use a full checkout with its workspace packages, fixtures and lockfile. From the repository root, in Bash:

```bash
set -euo pipefail
BASE_SHA=26ddf4d16c2fc1196b520d8a46c5441d64d01463
BRANCH=refine/developer-tools-data
if ! git cat-file -e "$BASE_SHA^{commit}" 2>/dev/null; then git fetch origin "$BASE_SHA"; fi
WORK_RUN=$(mktemp -d "${TMPDIR:-/tmp}/gen-v1-worker-2.XXXXXX")
export WORK_RUN BASE_SHA BRANCH
export EVIDENCE="$WORK_RUN/evidence"
mkdir -p "$EVIDENCE"
git worktree add -b "$BRANCH" "$WORK_RUN/src" "$BASE_SHA"
cd "$WORK_RUN/src"
git rev-parse HEAD > "$EVIDENCE/base-sha.txt"
test "$(git rev-parse HEAD)" = "$BASE_SHA"
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

Use Node 24.10.0 or later with the repository’s pnpm 10.30.3. If resuming, reopen your existing branch/worktree and evidence directory and verify the base is its ancestor. Run the repository setup in `docs/getting-started.md` for native prerequisites. Browser suites that set `channel: 'chrome'` require branded Chrome. In your disposable environment, if launching that channel fails, run `pnpm exec playwright install chrome` and retry. On Windows, suites configured with `msedge` require the Edge channel. Launch that channel once and provision it in the disposable VM if missing. Capture requires `ffmpeg` and `ffprobe` on PATH.

The file lists under the implementation sections are the complete tracked edit scope. Read any other named source or test as needed. Put temporary recording code in a separate disposable checkout and return it with your evidence. Keep review MP4s and generated evidence outside the source tree.

## Interaction rules

Use real component and entity identity. Separate first publication, changed source data, pointer intent, keyboard activation and restored state. Baseline the first committed record. Run a source effect only on the entity and fields that actually changed. An identical snapshot, theme switch, remount of an existing artifact or unrelated revision must preserve the resting state. Compare pending intent with the owner and expected target ID, consume it once and discard it on interruption. Classify native button clicks with `event.detail > 0` as pointer. Treat keyboard and assistive activation as immediate.

Commit the true value, accessible name, action availability and focus in the first applicable frame. Decorate that committed state. Keep text editable and selectable, and preserve field node, caret, selection, scroll, grants and request identity. Direct drawing, dragging and keyboard navigation track input immediately. When reversing a pointer-triggered animation, sample its visible geometry or opacity before cancelling it. Clean up unfinished effects, observers and callbacks when the owner changes, policy changes or the surface unmounts.

At default speed use the repository enter curve `cubic-bezier(.16,1,.3,1)` and move curve `cubic-bezier(.4,0,.2,1)`. The per-interface instructions specify durations, distances, grouping and exceptions. Follow the existing motion-speed token. Use the live effective app and OS policy. Off is immediate. Under reduced motion remove travel and stagger. Where a section explicitly permits opacity feedback, cap it at 80 ms. If full motion is disabled mid-flight, settle to the latest state immediately. Use the existing `animateTask`, `readMotionPolicy` and `observeMotionPolicy` contracts, and a local cancellation subscription where necessary. Use only the helpers already present at the pinned commit. Keep any additional event marker inside the files you own. Keep one geometry owner. Preserve the existing interruptible spring on measured regions that use it. Reserve a final layout slot before animating its contents.

The supplied 30 fps reference shows the source of the design decisions. During frames 522–555 a slot opens for one resolution commit while earlier rows remain recognizable. During frames 593–632 the test count grows on that same row. During frames 657–678 the Merge control is available as the four validation checks finish appearing. During frames 891–917 the completion accent travels along the affected branch. Apply those relationships to the concrete objects below. Keep the camera fixed. The per-interface milliseconds are implementation targets, with no claim that the recording exposes its CSS curves.

Measure compactness inside the artifact. Keep real PDF margins, image aspect ratios, chart domains, focus rings and source gaps. Remove the specific redundant row, unused track or inherited minimum identified in the interface instructions. Keep touch targets at least 44 CSS px where the component presents coarse-pointer controls. Use the current visual language and existing tokens. Add no decorative headings, filler copy, synthetic metrics or simulated production outcomes.

## First visible generation

The original films started after the UI had settled. Implement the following first-publication details in the owned component and verify them in the new opening sequence. The host’s existing `useArtifactEntrance` marks a genuinely new artifact with `[data-entry-phase="entering"]`. In the catalog, gate the one local effect below on that marker and full effective motion. Use the existing enter curve, zero delay and an absolutely positioned, `aria-hidden`, non-interactive ornament for a new rule or tick. Where an existing mark is named, layer the effect on its artwork. Keep controls, factual content and layout immediately available. At most one treatment per numbered interface may run on first publication. Ordinary additions inside an already present artifact use the change rules in their own section.

| UI | Exact first-publication treatment |
| --- | --- |
| 05 | Draw an 18 px vertical accent beside the initially selected failed check, origin top, over 140 ms. Keep expected/actual and the filename immediately readable. With no failed check omit this accent. |
| 06 | Bring the first visible changed hunk’s existing addition or deletion rail from .55 opacity to 1 over 120 ms. Keep the line numbers, +/- glyphs and code steady. An unchanged-only file has no hunk treatment. |
| 07 | Reveal a 12 px underline on the current endpoint’s method badge over 120 ms. Keep the URL and response status readable immediately. A GET without an example gets no empty request-side animation. |
| 08 | Reveal the first declared dependency connector’s accent along its actual direction over 150 ms. Keep a full static connector beneath it. A one-stage or unlinked pipeline has no connector accent. |
| 10 | Emphasize only the selected metric’s baseline tick directly under the numeric value with a 12 px left-to-right reveal over 120 ms. The reported figure, unit, and any missing intervals stay static. |
| 11 | Reveal the top border of the selected option’s column, from its left edge to the right over 150 ms. Keep prices, column widths and check marks readable immediately. Omit when there is no selected option. |
| 12 | Fade in the existing neutral status mark from .65 to 1 over 100 ms. The field is ready for input immediately. Never animate obscuring dots, show a checkmark for an empty slot or indicate a successful save before its receipt. |

Exercise each positive opening with the delayed fixture publication in its assigned browser spec. Test the same record when already present at bootstrap, an identical republish, and app reduced/off. Count one eligible local start for the positive case and zero on the others. For an absent target, assert zero and verify the usable fallback. Cancel on first input, policy downgrade, source replacement or unmount. Clip only the decorative mark. The existing outer artifact entrance keeps its own transform.

## What the original recordings showed

Use these observations to reproduce each issue. The clips used an authored fixture on commit `4bcdc82a73a28d27d6ebe413a527389119f35292`. Each timestamp is relative to its own MP4. Recheck the behavior on the assigned source commit before editing.

| UI | Original video time | What is visible |
| --- | --- | --- |
| 05 | 3.250–3.875 s | Selecting the passing check removes the assertion/source detail and sharply reduces card height. The inventory moves upward after the click. |
| 06 | 3.625–4.000 s | Selecting the test file changes the patch in place and slightly changes the card height. |
| 07 | 3.375–3.875 s | Selecting the retrieval endpoint retains a half-width No request body panel, leaving its response unnecessarily narrow. |
| 08 | 1.620–3.125 s | Four stages are laid out with three in the first row and Publish at the start of the next row, connected by a long wrap edge. |
| 10 | 6.500–7.000 s | Cost becomes Unavailable and the selected region becomes shorter. |
| 11 | 9.125–9.500 s | Save preference is invoked; the recording does not establish a durable saved-preference receipt or any real downstream action. |
| 12 | 3.500–3.750 s | Save clears the input and the interface reports Saved for this host session, with Replace and Remove actions. |

## Verify each interface

1. Before editing, open the named renderer, selector, fixture, and existing tests. Trigger the recorded sequence and save the relevant pre-change screenshot or measured failure. If the pinned version already passes a requirement, record the passing assertion and make only the remaining changes.
2. Run the existing baseline cases using the Playwright configuration stated under the interface. Add the new regression tests in the assigned spec. Repeat the filtered command with `--list` to confirm each new case is collected, run it on pre-fix code, implement the change and run the listed checks again. Repeat your direct interaction. Zero discovered tests, a missing browser or a port error cannot establish a pass. Capture both sides of a decisive transition. When testing mid-flight, wait for the actual active effect or geometry phase, reverse immediately, and assert the final state. Do not rely on an arbitrary sleep to prove causality.
3. Exercise the primary flow at 1440 × 1000 in dark/full motion, at 390 × 844 with light/touch input, at 640 CSS px of measured artifact width, and at native 200% browser zoom. Record the zoomed viewport width and device-pixel ratio. Check the case with keyboard, app reduced, app full with OS reduced, and app off. Interrupt at least one active effect with a policy switch. On a representative long, missing or failed source record, verify wrapping, focus, data identity and continued action access.
4. Run in a separate VM/container so the repository’s fixed browser ports remain isolated. If the four sessions share one POSIX host, put the following function in each worker shell and prefix every browser-test, recorder and browser-based visual-check command with `ui_browser`. It serializes only browser processes that share that host. On native Windows, use an isolated worker VM for browser runs.

```bash
ui_browser() {
  python3 - "$@" <<'PYLOCK'
import fcntl, os, subprocess, sys
with open(f"/tmp/gen-v1-ui-browser-{os.getuid()}.lock", "a") as lock:
    fcntl.flock(lock, fcntl.LOCK_EX)
    raise SystemExit(subprocess.call(sys.argv[1:]))
PYLOCK
}
```

5. Install the required browser and run the targeted commands as written inside your worktree. Reuse a passing full-suite run for sections using that same suite on the same commit. Keep actual exit codes, collected/passed counts, console/page errors, screenshots, and source fixtures. Re-run affected checks after any later change. A baseline failure needs the command, base SHA and original failure signature. Keep distinct evidence for keyboard, restoration, grant revocation, repeated updates and cancellation wherever specified.

## 05. Diagnostics

Keep the check inventory under the pointer when assertion evidence changes height.

### Editable paths

- `apps/web/src/SoftwareDevelopment.tsx`
- `apps/web/src/software-development.css`
- `tests/e2e/task-software.spec.ts`
- `tests/e2e/software-development.spec.ts`

### Observed behavior and source

The audited recording is `05-diagnostics.mp4`. At 3.250 s, selecting the passing check removes the assertion/source detail and sharply reduces card height. The inventory moves upward after the click.

Read `Diagnostics`, `CheckState`, `SelectList`, `useSelected`, and `useDetailMotion` in the TSX and `scripts/software-development-fixtures.ts`. The fixture IDs are quantity, empty, and rounding. They begin failed, passed, and not run. The current diagnostic inventory is after the detail in DOM order.

### Implementation

- [ ] Inside Diagnostics render the one existing .software-check-inventory before the one .software-detail. Keep the same panel id, tab relationships, inventory button keys, source binding and selected object. First valid saved check wins, then the first failed check, then the first check. Empty and malformed data retain their current messages. Set aria-orientation="vertical" on this inventory via an orientation prop on SelectList defaulting to horizontal for its other callers.

- [ ] Use the existing software container. From 640 CSS px of inner container width, set .software-investigation to grid. Use clamp(220px,calc(100% - 416px),240px) minmax(0,1fr), gap 16px and align-items:start. This leaves at least 400px for the evidence. Below 640 px stack inventory then detail with 12 px separation. Inventory margin-top and padding-top are 0. Use compact rows of min-height 38px with 6px 8px padding, a 44px coarse-pointer minimum, wrapping file metadata underneath the title. Allow evidence to shrink naturally. Put supplied duration in the selected header even when filename is absent. Retain the expected/actual labels and selectable source.

- [ ] In `apps/web/src/SoftwareDevelopment.tsx` declare the private type `SoftwareSelectionCause = 'pointer' | 'keyboard'`. Implement `useSoftwarePanelMotion<T extends HTMLElement>(identity: string | undefined, scope: string | undefined, durationMs: number, startOpacity: number)` in this file. Return `{ref, mark}`, with a stable DOM ref and `mark(nextIdentity: string, cause: SoftwareSelectionCause): void`. Each instance owns its own previous committed identity/scope, pending selection, and animation handle. Store `{scope, identity: nextIdentity, cause}` from the handler. A mark for the current identity clears any pending mark. Treat any unmarked change as a source update or restoration. Use the scoped owner in each instance independently.

- [ ] Compare committed identity/scope in a layout effect initialized from the first render. Consume and clear the pending mark on a changed pair. Animate only a matching pointer target within the prior scope when the node is visible and the target identity exists. A scope change always settles both content and pending mark. New keyboard, assistive, source, and restore selections settle immediately. Skip the initial commit and re-renders with unchanged identity/scope. Call the existing `animateTask` in `apps/web/src/task-motion.tsx` for one opacity-only transition from the given start opacity to 1. For a rapid reversal sample the current computed opacity before canceling the active handle and use that as the new start. Keep the final DOM/content at opacity 1. Add no ancestor translation. Pass `{duration: "--software-panel-duration", easing: "--ui-ease-enter"}` to `animateTask`. Define the CSS variable on each target using that target’s specified duration in milliseconds. The enter token in `packages/ui-shell/tokens.css` is `cubic-bezier(.16,1,.3,1)`. Sample `readMotionPolicy()` at start. Reduced uses at most 80 ms opacity, off settles immediately. While running, cancel the animation on element pointerdown or focusin, hidden document, a policy change via `observeMotionPolicy` from `apps/web/src/motion-policy.ts`, or unmount. Remove listeners and subscriptions, and guard old cleanup callbacks from clearing a replacement handle. Retain the pre-existing `useDetailMotion` for any remaining callers.

- [ ] Change `SelectList.select` to `(id: string, cause: SoftwareSelectionCause) => void`. Map native button click `event.detail > 0` to pointer and zero-detail click to keyboard. The arrow, Home, and End handlers explicitly pass keyboard. Preserve wrapping navigation and focus the selected button with `preventScroll: true`. In Diagnostics call `mark(id, cause)` immediately before routing a valid change through the existing selection setter, and attach the hook ref to the stable detail region with 140 ms from .8. On an already selected ID clear the pending mark and skip the write.

- [ ] Extend CheckState with optional props entityId?:string and statusDurationMs?:number defaulting to 120. Only the slot effect uses statusDurationMs. The 90ms check stroke is independent. Supply selected.id from Diagnostics. Compare same-ID prior accepted status to next status. Initialize from the committed selected entity and its status. First mount, a different check selection, equal source values and restore have no result animation. Keep the existing accessible status label and its one decorative icon. For passed status, obtain the current rendered check path from the slot ref and normalize that path. Cancel a prior status/stroke handle when its entity changes. On a same-ID status change run 120ms opacity/color feedback on the status slot. For an actual transition into passed, give the existing check SVG stroke path pathLength=1 and reveal its stroke-dashoffset 1→0 over 90ms. For callers without an entity ID leave the status slot static. Pipeline supplies its selected stage ID and its own duration. Keep text and action availability current on the first frame. Reduced uses opacity only ≤80ms and off is immediate.

### Browser tests

1. In task-software.spec.ts replace “the assertion and source lead an investigation, with other checks below the working evidence” with “diagnostic selection stays anchored when passing evidence replaces a failure”. Preserve its existing source, reload, selected ID, and zero-command assertions. At 1440 × 1000 set .software-surface content width to 700px, assert inventory right edge ≤ detail left edge, record check bounding boxes, click empty then quantity. Assert each inventory button x/y differs by ≤1px after each change, and hit-test the clicked point with elementFromPoint(...).closest('button') at the settled frame. Repeat with 600px inner width and assert inventory bottom ≤ detail top.

2. At 390 × 844 focus the failed tab and press ArrowDown. The passed tab owns focus, the region has the new accessible name, expected/actual content is absent for this check, and the detail has no running animation. Reapply the failing source with the same check selected. Restore the selected check and its source interaction.

3. Extend “accepted check results receive finite feedback without replaying on snapshot or theme updates” in software-development.spec.ts. Use its existing WAAPI tracker and fixture publisher. Verify one same-id failed→passed slot effect, zero additional slot effects from selecting a different already-passed check, equal snapshot, theme change, or reload. Keep the existing inspector/slot identity checks.

### Commands

```bash
pnpm exec playwright test --config tests/e2e/clarity-software.playwright.config.ts -g 'diagnostic|accepted check results|Diagnostics'
```

## 06. Change set

Make file and patch selection readable at the same position through fast changes.

### Editable paths

- `apps/web/src/SoftwareDevelopment.tsx`
- `apps/web/src/software-development.css`
- `tests/e2e/task-software.spec.ts`

### Observed behavior and source

The audited recording is `06-change-set.mp4`. At 3.625 s, selecting the test file changes the patch in place and slightly changes the card height.

Read `ChangeSet`, `patchLines`, `SelectList`, and the local `useSoftwarePanelMotion` described under Diagnostics in the TSX. Read the two-file change set in `scripts/software-development-fixtures.ts` and the existing approval case in `tests/e2e/software-development.spec.ts`. The catalog supplies patch text and a stable file ID but no hunk IDs.

### Implementation

- [ ] Keep the file strip first. Use .software-file-review-specific styles: 6px gaps, filename plus existing counts, min-height 36px for fine pointers and 44px for coarse pointers. Keep each full path as the tab accessible name and the selected path in the panel heading. Retain source-provided status and previousPath. Replace the selected note paragraph with a collapsed native details/summary labeled “Rationale”; render it only for a nonempty note.

- [ ] Compute old/new gutter sizes from the largest displayed line number per side, independently. For 1–3 digits use 28px. For more digits use calc(28px + Nch) where N is digits minus three. Use those same variables for patch header and row grids, followed by a 20px +/- gutter and code. Always render “Old” and “New” in the two narrow header tracks. Include the expanded “Before” and “After” labels as sr-only text inside the matching track. Set code to 12px/18px, preformatted whitespace, scroll-x on the patch, no page-level horizontal overflow. In software-development.css use .software-file-review .software-patch for overflow-x:auto and max-width:100%. On its direct code child set display:block, width:max-content and min-width:100%. On the direct row spans and their .patch-code children override inherited wrapping with white-space:pre, overflow-wrap:normal and word-break:normal. Give the row grid a minmax(max-content,1fr) code track. Check computed values against frontend-fidelity.css in the mounted app. Keep existing 600-line preview and full-patch disclosure.

- [ ] Route new file selection through `mark(id, cause)` before `select(id)`. Bind useSoftwarePanelMotion(selected?.id,undefined,120,.85) to the selected patch container. For pointer selection transition the selected chip’s border/background over 120ms, with no vertical motion. Keyboard and restoration commit instantly. Keep the selected patch element mounted. Store scrollTop/scrollLeft by file id on navigation and restore that file’s offsets clamped to its new range in a layout effect. For same-file source revisions preserve its offsets and its focus.

- [ ] A stable file ID plus different patch bytes for the same previously visible file shows a compact “Patch updated” marker beside that file’s status. The current API has no explicit hunk identity. Do not infer changed hunks from line numbers or array indices. Use one 180ms tint on the marker. Track last observed patch per file in a mounted ref, compare full string equality, prune removed IDs and ignore selection-only changes. Separate file selections never replay a revision. Leave unchanged source rows readable and expose raw before/after text verbatim. Keep prior publication and restored states quiet.

- [ ] Preserve the registered action payload {fileId,path,status}; inspecting the diff or opening Rationale sends nothing. Invalid or absent changes retain the source/unavailable and empty states. Clear all animation handles on disposal. For reduced motion the marker uses ≤80ms opacity; off draws its final state immediately.

### Browser tests

1. Extend “file selection is a compact strip above a full-width, source-preserving patch” in task-software.spec.ts. Start with the supplied total/test files. Assert tab strip is above the patch and width exceeds 90% of the surface; verify old/new gutters for added and removed lines and exact indentation. Open Rationale and read the existing note once. Select tests/total.test.ts then src/total.ts; the clicked tab retains its click-point coordinates and the current text contains item.quantity. Reselect tests/total.test.ts before clicking “Review selected file”. Assert exactly one action.submit carrying fileId test and path tests/total.test.ts.

2. Add “same-file patch refresh preserves selection scroll and emits one revision marker”. Use a long valid synthetic patch with 5-digit offsets and long code. Set a nonzero horizontal scroll, publish one changed patch body, and check offsets within 1px after accounting for max scroll. Publish it again, change theme, switch away and back, then reload. Expect no extra emphasis and no global entrance on the unchanged file. In the same test press ArrowRight twice rapidly in the file strip and check that only the final selected patch is visible and no patch transform exists.

3. At 390 × 844, long path wraps in the selected header, an overlong code line scrolls inside Selected patch, syntax and old/new coordinates remain available and root scrollWidth ≤ innerWidth+1. Run existing software clarity tests retaining added/removed gutter characters and DOM approval ownership.

### Commands

```bash
pnpm exec playwright test --config tests/e2e/clarity-software.playwright.config.ts -g 'patch|file selection|change review|ChangeSet'
```

## 07. API explorer

Let the response use all of the available width when its endpoint lacks a request example.

### Editable paths

- `apps/web/src/SoftwareDevelopment.tsx`
- `apps/web/src/software-development.css`
- `tests/e2e/software-development.spec.ts`
- `tests/e2e/clarity-software.spec.ts`

### Observed behavior and source

The audited recording is `07-api-explorer.mp4`. At 3.375 s, selecting the retrieval endpoint retains a half-width No request body panel, leaving its response unnecessarily narrow.

Read `ApiExplorer`, `responseSelections`, and `SelectList` in `apps/web/src/SoftwareDevelopment.tsx` and the API explorer schema in `packages/ui-catalog/software-development.ts`. Main schema has optional request text, status/body/description for responses and no explicit media type.

### Implementation

- [ ] Define hasRequestExample as typeof selected.request === "string" && selected.request.trim().length > 0. Pass the original untrimmed string to CodeBlock when displayed. Preserve method, path, summary, parameter disclosure and response tab names. Keep GET/POST independent of this condition. Omit media type.

- [ ] Add data-has-request on .software-api-flow. Present paired request/18px arrow/response with existing 12px gaps only when a request example is supplied and container width exceeds 540px. An empty response list uses its existing absence message inside the response column. At ≤540px stack request then response, remove arrow. With absent request, render one .software-request-note containing exact text “No request example supplied” above a single full-width response. Both are in one column. Remove empty request section, arrow, minimum height, and blank background from the note, use margin 0, font 11px and gap 8px. Keep “No response example supplied” for zero responses. When both are absent, both short messages are visible.

- [ ] Attach useSoftwarePanelMotion(selected?.id,undefined,140,.8) to .software-api-flow and call the outer `mark(endpointId, cause)` immediately before an endpoint selection. Attach a separate instance to .software-response-content with identity `response ? String(response.status) + ":" + responseIndex : undefined` and scope `selected?.id`, duration 120ms from .8. On an explicit response change call the inner `mark(String(responses[nextIndex].status) + ":" + nextIndex, cause)` immediately before writing its entry in the per-endpoint selection map. Classify response button clicks by event.detail and pass keyboard for explicit arrow/Home/End changes. Endpoints consume one pane effect and cancel a previous response effect. Enter/Space or arrow keys commit instantly. Retain selection keyed per endpoint with the existing status:index fallback to the first available response. Never copy a previous endpoint response into the new panel.

- [ ] Preserve source action payload {endpointId,method,path}. The request and response blocks are local examples. No real endpoint request is sent. A 200 example and a 404 example differ only in their source content and code labels. Keep the disabled “No API executor connected” explanation when applicable. Under reduced motion cap opacity at 80 ms using `readMotionPolicy()` from `apps/web/src/motion-policy.ts`. Under off commit instantly. Restore a saved endpoint without entry.

### Browser tests

1. Extend the example test in clarity-software.spec.ts. Switch POST /orders → GET /orders/{id} → Response 404 → POST /orders. On GET assert the exact absence note, zero .software-request and zero flow arrow, and response bounding width within 1px of .software-api-flow.clientWidth. On POST assert original request/response text and two columns at 700px content width. With GET carrying a supplied request and POST missing it, assert that the layouts reverse. Empty/whitespace-only request uses the compact note. Existing parameters and 201/409 labels stay accessible.

2. In software-development.spec.ts update “API response transitions retain panel identity and keyboard focus with bounded interruption”. Change the Enter path to expect zero new WAAPI calls, and add a pointer click on a different response expecting precisely one. Rapid reversal leaves ≤1 running animation and the final body text. Endpoint change runs one outer effect and no response effect. Retain the element identity, theme/snapshot quiescence and reduced-motion assertions.

3. At 390 × 844 both supplied examples stack, keyboard ArrowLeft selects the previous response and root horizontal overflow is ≤1px. Run all cases with the existing /orders network counter and zero action.submit for local inspection.

### Commands

```bash
pnpm exec playwright test --config tests/e2e/clarity-software.playwright.config.ts -g 'API|ApiExplorer'
```

## 08. Pipeline

Use a horizontal rail for a short linear workflow and preserve graph topology for actual branches.

### Editable paths

- `apps/web/src/SoftwareDevelopment.tsx`
- `apps/web/src/software-development.css`
- `tests/e2e/task-software.spec.ts`
- `tests/e2e/software-clarity.spec.ts`

### Observed behavior and source

The audited recording is `08-pipeline.mp4`. At 3.250 s, selecting blocked Build shows its dependency on the failing type check.

Read `StageGraph`, `Pipeline`, and `CheckState`. In `scripts/software-development-fixtures.ts` the actual chain is test → types → build → release. The existing graph always caps columns at three. `task-software.spec.ts` separately exercises a true two-parent DAG.

### Implementation

- [ ] Derive a chain only for 1–4 stages with exactly one root, every non-root having one dependency, at most one child per stage, and root traversal visiting every supplied stage exactly once. Build the ordered chain by following IDs, independent of array order. Read available content width with one ResizeObserver on the graph; clean it up on unmount. With N stages the row threshold is N*148 + (N-1)*8 CSS px. Four fit at exactly 616px. If graph content-box width W ≥ N*148 + (N-1)*8, the chain uses a single grid row and N equal columns, gap 8px and no button margins. Below threshold use one vertical column with source dependency labels, min-height 44px. A true DAG uses the existing depth/band algorithm at wide widths and existing narrow stacking. Persist stage IDs to keys.

- [ ] For each visible SVG connection use its actual rendered node center in graph-local CSS pixels for both endpoints and its existing data-from, data-to and marker. Keep arrow direction from prerequisite to dependent. Synchronize nodes and edges on topology changes with one 220ms normalized progress clock using the existing `--ui-ease-move` curve, `cubic-bezier(.4,0,.2,1)`. Cache the last displayed centers keyed by stage ID, commit final CSS layout, interpolate only retained moved centers, derive node position offsets and every affected path from the same center sample. New stage centers begin at their final coordinates. Remove departed edges at commit. If a new topology arrives midflight read current sampled centers before replacing its target. On resize, initial layout, restore, hidden, reduced, off or unmount stop the frame loop, write final centers now and release transforms. Unchanged topology or selection does not start this owner.

- [ ] Set `entityId={selected.id}` on `CheckState` in Pipeline. Pass statusDurationMs={160} from Pipeline to override the accepted status-slot duration, keeping the existing 90ms stroke on same-ID actual pass. Update the label from the supplied status immediately. For a selection from a fine pointer emphasize the selected node border and its incident edge strokes over 120 ms. Coarse pointer and keyboard commit their selected styling immediately. The same stage revisited does not appear to have rerun. Bind the detail ref from `useSoftwarePanelMotion(selected?.id, undefined, 140, .8)` to the mounted detail region. On a valid stage selection call `mark(stageId, cause)` immediately before the selection setter. Pass input cause through StageGraph and prerequisite buttons. Replace aria-orientation for the one-row chain with horizontal and set vertical for the single-column and existing DAG keyboard traversal; set Home/End and arrows to the currently presented order.

- [ ] Keep “Requires”, explicit blocking prerequisite buttons, Command, inspected stage output and action contract. Select “Inspect Typecheck prerequisite” to inspect the failed stage, returning focus to its actual stage tab with preventScroll. Keep the existing failure → running → blocked default priority and selection persistence. Pressing buttons in graph or prerequisite list sends zero execution commands.

### Browser tests

1. In task-software.spec.ts add “a four-stage linear rail responds to its content width”. Set explicit graph container width of 616px, measure Tests/Typecheck/Build/Publish with equal y coordinates within 1px, then set 615px and verify ordered non-overlapping vertical rows. Reorder the incoming array but preserve dependsOn; verify visual order and keyboard Home/End follow the chain. In the DAG fixture assert the two depth-0 nodes keep distinct rows and both parent arrows reach Bundle.

2. Modify software-clarity.spec.ts “the release view opens at its actual blocker…” to expect horizontal orientation at measured wide width and vertical on the phone. Keep exact source log, selected blocker, neutral status semantics, and identical labels. Click Build then Inspect Typecheck prerequisite, check focus and zero action.submit.

3. Add a topology-only publication test using host.setInput/publish. Start a one-parent graph, insert an intermediate stage, interrupt with a second real dependency change, and sample node/edge centers during transition. Transform SVG coordinates with getScreenCTM() and compare incident path start/end to corresponding button centers within 1 CSS px. Select stages and republish identical data; expect no geometry replay. Switch documentElement.dataset.motion to off while moving and assert final aligned positions and no live geometry movement on the next frame.

### Commands

```bash
pnpm exec playwright test --config tests/e2e/clarity-software.playwright.config.ts -g 'pipeline|Pipeline|release view|linear rail|topology'
pnpm exec playwright test --config tests/e2e/clarity-software.playwright.config.ts
pnpm typecheck
pnpm lint
git diff --check
```

## 10. Statistics

Make selection immediate and keep units, null samples, value and plot synchronized.

### Editable paths

- `apps/web/src/EverydayData.tsx`
- `apps/web/src/everyday-data.css`
- `tests/e2e/everyday-ui.spec.ts`

### Observed behavior and source

The audited recording is `10-stats.mp4`. At 3.250 s, latency switches to 184 ms and its own trend.

Read Stats, Trend, metricValue, useSelectionMotion and TableScroll in EverydayData.tsx. Read the Stats input contract in `packages/ui-catalog/everyday.ts`. Existing test fixture metrics are Response time, Requests and Error budget. The numbered review additionally supplies Cost and Availability.

### Implementation

- [ ] Keep the existing statePath(p.stateKey), ID fallback, parsed source bounds and exact metric formatting. Render the selected label, value, unit, and comparison in one metric detail group with display:flex, align-items:baseline, flex-wrap:wrap, gap:4px 8px. Set .everyday-selected-stat padding to 16px 0 4px and .everyday-trend margin-top to 12px. One selector row and one selected plot per component. Keep the source-provided period heading. No new freshness field.

- [ ] Remove the 200ms translateY effect in useSelectionMotion for Stats. Preserve a stable selected-region DOM node. Attach a local cause to the actual select handler. For pointer changes map the selected-tab underline from its old rect to its target rect with 140ms translation/scaleX, transform-origin:left center, 2px height, existing neutral color. Use one absolutely-positioned, aria-hidden indicator in the stable nav track and commit its target layout even if animation is skipped. Query only role=tab buttons inside the track for roving focus. On track scroll/resize settle at the selected button immediately.

- [ ] For pointer changes only, run opacity .85→1 for 120ms on the mounted chart content, after rendering its exact new data. Do not transition the numerical header, scale or point positions. Resolve same-id source changes atomically through existing props. Clear incoming opacity on key input, editing or policy changes. Keyboard and programmatic/restore selection show final geometry instantly. Pointer repeat on current tab has no effect. Focus arrow destinations with preventScroll:true while keeping the active tab visible through native tab-strip scroll if clipped.

- [ ] If there is no supplied series, show the existing “No trend values supplied.” compact line. When every sample is null, replace the empty plot area and SVG with “Trend unavailable”, and keep the source-values table for all reported periods. When a current value is null but historical samples exist, show “Unavailable” for the current value and keep the genuine historical trace, including gaps. Preserve path resets on null, flat-series behavior, table access, null source labels, explicit comparison semantics and currency/percent formatting.

- [ ] Initially populate the render without selection effects. Off or reduced skips underline travel; reduced uses 80ms opacity on the plot for pointer changes. Invalid input shows the existing unavailable message, no previous graph. Retain the same metric on unrelated snapshots. Source absence of selected ID falls back using the existing selector, never animating as a pointer choice.

### Browser tests

1. Add “metric controls keep their position while exact units and trend change” to everyday-ui.spec.ts. Using open(page,'Stats',metrics), start at Response time=184 ms, click Requests then Error budget then use Home. Record selector bounding box before and after each change. Require ≤1px drift, exact Requests/1,280 and Error budget/Unavailable when selected, zero blank SVG for missing history and no intermediate metric value. Enter/Home/End must leave the selected control focused and no traveling animation active.

2. Extend “statistical trends leave gaps…” to publish an all-null series (assert no .everyday-trend SVG, “Trend unavailable” and exact source rows) then publish the original partial series with current value null (assert Unavailable header plus two M path segments and missing Wednesday). Retain the reload and source patch tests for Requests → 1,295.

3. Repeat the statistics recording’s metric actions using Requests=12,480, Response time=184 ms, Cost unavailable, and Availability=99.98%. Use the existing recorded data in the lifecycle recorder for that capture. At 390px ensure selector scroll is local, values remain readable, and rapid alternating pointer/keyboard input leaves only the final metric visible.

### Commands

```bash
pnpm exec playwright test --config tests/e2e/everyday.playwright.config.ts -g 'stat|Stats|metric controls'
```

## 11. Comparison

Keep the existing selected-heading check, give the selected plan a compact local receipt, and preserve all comparison values.

### Editable paths

- `apps/web/src/EverydayData.tsx`
- `apps/web/src/everyday-data.css`
- `tests/e2e/everyday-ui.spec.ts`

### Observed behavior and source

The audited recording is `11-comparison.mp4`. At 3.375 s, selecting Studio immediately changes the selected column shading.

Read Comparison, comparisonValue and TableScroll in EverydayData.tsx. Read useTaskAction.run in `apps/web/src/task-context.ts`, which returns a boolean after the action promise resolves. The fixture in everyday-ui.spec.ts provides Starter, Team and Custom. Comparison stores {selectedId,differencesOnly} and accepts legacy string state.

### Implementation

- [ ] Immediately above the matrix keep a two-column control row with minmax(0,1fr) auto, gap 8px and align-items:start. Put the selected label in the first column as a wrapping bold line, followed by a single 18px-high line containing its supplied option.summary. For summaries alone use overflow:hidden, white-space:nowrap and text-overflow:ellipsis. When absent omit that line. The existing Differences only checkbox stays at the top of the second column on every selection. Keep a distinct supplied title above the controls. In each column header replace its currently always-open summary paragraph with a collapsed native details containing the complete, ordinarily wrapping source summary, with summary text “Details” and accessible name “Details for ” plus that option’s label. Omit the disclosure if the source has no summary. Use stable option IDs for keys and keep disclosures separately operable by pointer and keyboard without selecting the option or moving the checkbox. Thus long summaries take only one preview line until explicitly opened. Do not add concealed sizing copies of summaries.

- [ ] Keep table semantics and TableScroll. Use 12px block padding in data cells instead of 14px; preserve responsive wrapping/overflow. Keep one existing 15px .everyday-option-selector with its existing Check. For a pointer selection crossfade old/new column background and borders across 120ms, reveal only its selected check with a 90ms local stroke. Keyboard activation changes the check, border and shading immediately. Always leave numeric and adjacent text static. Filtering keeps existing Object.is null-aware equality and saved selection; no row entrance or exit.

- [ ] For accepted data patches compare typed option.values by stable option.id plus criterion.id. A changed visible cell gets one local 120ms background emphasis; missing values still read Unavailable. Unchanged values, filtering, restoration and selection of a different column do not replay it. Keep a full previous accepted-value map, including hidden equal criteria so opening a filter cannot replay an old patch. Never infer a winner.

- [ ] Keep the current action payload. In the existing footer button use one noninteractive hidden sizing grid containing actionLabel (or generated Continue with label alternatives), “Submitting…” and “Preference submitted” in the same cell as the one visible label. Only the visible label contributes to the accessible name. Commit busy immediately; on true from await action.run show “Preference submitted” in that slot with 120ms opacity. Use one polite announcement on acknowledgment. A false result preserves the existing error/label and selection. Track submitted stable option ID and a local intent generation changed on selection. Discard late receipts for an older intent, including selecting away then returning. Clear receipt on a changed selected option or new submission. Do not turn this acknowledgment into persisted/applied source state.

- [ ] In reduced motion use immediate check, shading and filter, with ≤80ms receipt opacity. In off mode skip animation. Keep failure and null visible in both themes. Retain the current broker and boolean/null display conversions.

### Browser tests

1. Extend “comparison keeps all options visible…” in everyday-ui.spec.ts. Select Team, enable Differences only, assert the Region row alone disappears and all option headings stay. Preserve the payload {optionId:'large',label:'Team'}. Gate a submit using a page route promise for action.submit on **/api/commands; fulfill with the same commandId, seq and result structure as serveTaskFixture after releasing the gate. Assert button width for enabled, pending, and acknowledged labels differs by ≤1px and exactly one “Preference submitted” status follows success.

2. Add “late preference acknowledgment cannot confirm another option”. Hold the Team command, select Starter before releasing it, and assert Starter stays selected and no Team receipt is attributed to Starter. Reject another submission with HTTP 409 and a fixture error, and assert the error and editable selection are visible. Publish a patch to one criterion value; only that identified cell receives a pulse. Republish identical values and toggle Differences only; no pulse repeats.

3. At 390 and 1440 CSS px run existing “comparison retains complete decision facts at desktop and narrow widths”. Add a 600-character option.summary to one fixture option. Assert the selected preview occupies 18px, the named per-column Details exposes the complete untruncated text, and the checkbox top edge changes by ≤1px on selecting that option or opening its Details. Keyboard activation must preserve control focus, update aria-pressed immediately and leave no transform on any data cell. In the recorded Studio scene, preserve the equal Exports row and its filter behavior and the exact Save preference action semantics.

### Commands

```bash
pnpm exec playwright test --config tests/e2e/everyday.playwright.config.ts -g 'comparison|Comparison|preference acknowledgment'
pnpm exec playwright test --config tests/e2e/everyday.playwright.config.ts
pnpm typecheck
pnpm lint
git diff --check
```

## 12. Credential entry

### Observed behavior and outcome

The audited recording `12-credential-entry.mp4` reports a host-session credential after an acknowledged save. Preserve the accurate scope and the private input boundary while making saving, replacing, removal, expiry and uncertain acknowledgment visually distinct.

### Editable paths

- `apps/web/src/CredentialEntry.tsx`
- `apps/web/src/credential-entry.css`
- `tests/e2e/everyday-ui.spec.ts`

### Source to inspect

- `CredentialEntry` parses its declaration, reads `useSecureArtifact`, and guards GET/PUT/DELETE with `sequence`, `active`, `current` and the captured revision. `apps/web/src/api.ts` owns the dedicated slot endpoints and metadata. Use existing scoped metadata; keep the host protocol and persistence intact.
- The existing `credentials` fixture in the owned spec intercepts dedicated token endpoints and checks journal/commands for a synthetic sentinel. `tests/credential-entry-ime.test.ts` verifies IME submission behavior.

### Implementation

- [ ] **1.** Retain the 580 px maximum form and the existing ≥20 px status slot. Reserve 13 px for a 12 px icon, 6 px gap and a single status string. At narrow widths let text wrap at word boundaries and expand the slot only when the actual text requires it. Keep the input and primary action aligned; use a 96 px min-inline-size for the primary action at the existing 11 px task scale, and allow width growth for zoom/text overrides. Keep the 40 px input minimum. Do not clone the input or render secret characters into decorative content.

- [ ] **2.** Represent the pending kind explicitly as `'checking'|'saving'|'removing'|null` in the existing mutation/refresh lifecycle. Render `Checking private token…`, `Saving token…`, and `Removing token…` respectively. Keep `Status unavailable`, `Saved for this host session` and `No token saved`. Use the existing `role=status` slot. Set the label on the same commit as disabling the operation, without a timer; enable controls only from current metadata. Reuse the existing error messages and lifetime copy.

- [ ] **3.** On save/replace, before issuing the existing dedicated write clear the DOM input and reveal state. Keep bytes only in the transient handler’s existing single request. On removal clear local input and immediately show Removing token…. On a matching successful response commit its metadata atomically. Confirmed positive store gets a single check stroke over 90 ms plus status text opacity .8 → 1 over 120 ms. Apply only after the successful save/replace operation’s owned response with present=true and its new version. Existing metadata on restore, visibility refresh, same-version repeats, identity changes and checking/duplicate responses show their state directly.

- [ ] **4.** On lost acknowledgment, keep the existing readback path. Show current positive or negative presence only from its matching readback and keep the interruption/error explanation. If both mutation and refresh fail, set metadata null and show Status unavailable with Refresh status. Local prior presence cannot stand in for removal confirmation. An expiry timer can trigger checking and disable mutation; only the returned unexpired metadata determines the settled state. Invalidate pending status/feedback synchronously when identity/revision/active changes. Reject stale responses using existing guards.

- [ ] **5.** Use a separate animation target for the decorative check and label with aria-hidden on the icon. Keyboard activation changes state immediately; a real async result can receive the source acknowledgment even after keyboard activation without delaying input. At reduced motion use at most 80 ms label opacity only; off snaps. Cancel effects on policy change, unmount and owner switch. Respect the app preference for a non-spinning static pending icon. Never record typed sample values in evidence metadata or snapshots; browser fixtures use synthetic values and visibly masked inputs.

### Tests

1. Extend `credentials(page)` with a gate for DELETE. First save a synthetic fixture value; capture input position and primary action width. Hold deletion, click Remove token and confirm blank input, Removing token…, disabled actions, and zero settled No token saved. Release a confirmed present=false response and verify the truthful final label. Compare input/primary geometry within 1 px at rest.

2. Simulate lost DELETE acknowledgment with a subsequent GET returning present=true, then both DELETE/readback failing. Verify one DELETE only, first case shows currently saved plus uncertainty, second case shows Status unavailable and Refresh status. Do not weaken existing stale revision, inactive scope, IME or private-byte isolation assertions.

3. Check replace with a new positive version fires one acknowledgment. Repeat the same snapshot three times, change thread, restore and refresh visibility; no repeated success effect. Save, reveal/hide, clear and busy remain keyboard usable. Under reduced/off the final metadata and accessible status remain available.

4. Verify delayed removal and uncertain acknowledgment with only masked input shown. Record the dedicated-endpoint invocation count and the measured input-position delta.

### Commands

```bash
pnpm exec playwright test --config tests/e2e/everyday.playwright.config.ts tests/e2e/everyday-ui.spec.ts
pnpm exec vitest run tests/credential-entry-ime.test.ts tests/credential-slots.test.ts
```

## Record the review videos

Produce seven continuous dark-theme MP4s. After the scoped tests pass, commit your tracked changes on the working branch. Create the capture checkout with the following commands. When repeating a take, use a fresh capture output directory.

```bash
RESULT_SHA=$(git rev-parse HEAD)
git worktree add --detach "$WORK_RUN/capture-src" "$RESULT_SHA"
cd "$WORK_RUN/capture-src"
test "$(git rev-parse HEAD)" = "$RESULT_SHA"
test -z "$(git status --porcelain)"
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
ffmpeg -version
ffprobe -version
```

Record that SHA. Place all temporary recorder sources under its `scripts/` using the prefix `local-w2-`. Return the private recorder copies with the evidence in this project. Keep them untracked.

| Film | Recorder scene ID | Checked-in scene / subtree |
| --- | --- | --- |
| UI-05 | diagnostics | investigation-failure/root |
| UI-06 | change-set | software-release/changes |
| UI-07 | api-explorer | software-release/api |
| UI-08 | pipeline | software-release/pipeline |
| UI-10 | stats | measurements/stats |
| UI-11 | comparison | measurements/comparison |
| UI-12 | credential-entry | private-entry/root |

When available, use `Gen-V1-UI-review/recording-scripts/generative-review-scenes.ts` and `record-generative-review.ts` from the original review archive. Name the private copies `local-w2-scenes.ts` and `local-w2-catalog.ts` and update the relative scenes import. The catalog’s archived recording begins after generation. In its private copy preserve `const initialArtifact=snapshot.artifacts[0]`, set `if (!stills) snapshot.artifacts=[]` before returning the fixture host and keep its existing `publishInitial` helper, wait for the composer textbox named `Message` and assert the page has zero `.artifact` elements, start `recordWindow`, wait 500 ms, then call `host.publishInitial()`. Move artifact, PDF, image, signature and scroll readiness checks after that call. Replace the archived manifest’s hard-coded revision with the measured git SHA. [Original review ZIP](https://chatgpt.com/library?file_id=libfile_e853efaba1cc819188bc47299ccb1228&account_id=personal)

For a source-only session, copy the tracked `scripts/record-task-design.ts` to `scripts/local-w2-catalog.ts`. It already implements publication after capture starts, source-backed controls, PDF/PNG grants, fixture HTTP/SSE and a real Vite App. Replace fixed port 5465 throughout this private copy with 6212. Keep its browser setup, `installFixture`, resource routes and video stop/cleanup. In its scene list clone each mapped entry from `taskDesignScenes()`, set its ID to the recorder scene ID above, and copy only elements reachable recursively through each element’s children from its assigned root (root means scene.spec.root). Replace the full-catalog assertions with per-film checks for the assigned subject. Implement the ordered interactions from this prompt. Preserve fixture action handlers by testing the original source scene ID after the display ID changes. Keep installFixture’s private credential route and synthetic response revisions. Feed the credential from a fixed disposable fixture string. Assertions and metadata record presence and version only. Exercises that require a changed source value use host.setInput(name, next) followed by await host.publish().

Before starting the video, put the insertion point in the visible conversation area. Observe the first nonempty published frame with an IntersectionObserver or a sampled DOMRect. Require it to intersect the viewport when its entrance begins. An offscreen entrance followed by an automatic scroll fails the opening. Scroll only for later chapters where the task requires it.

From the root of the disposable capture worktree, initialize a fresh capture directory after creating your private recorder files.

```bash
export CAPTURE_OUT
CAPTURE_OUT=$(mktemp -d "$EVIDENCE/capture.XXXXXX")
```

For both paths, record exactly 500 ms of the ready host before the first fixture publication. In the source-only path, change the tracked seed’s initial 900 ms hold in its private copy to 500 ms. For the host-scene command, read the output directory from `CAPTURE_OUT`. Use per-scene assertions and guard only optional data. An absent required control, empty clip or missing chapter must cause a failing exit. Discard the old minimum total-length padding in the archive and use the 900 ms hold after the actual final result. For a rapid reversal, use raw Playwright input as soon as the first effect is running, ahead of any reading dwell or chapter screenshot. Do not change product timing to make the recording easier.

Run these commands from that worktree. The archived catalog recorder accepts `--port`. In the source-only catalog recorder, replace the fixed server port and origin as directed above before launching.

```bash
pnpm exec tsx scripts/local-w2-catalog.ts --theme dark --port 6212 --scenes diagnostics,change-set,api-explorer,pipeline,stats,comparison,credential-entry --output "$CAPTURE_OUT/catalog"
```

For either recorder path, update the action sequence to include every implementation section’s film steps. Keep the 1920×1080, 30 fps, real-time compositor recording running through every required action and interruption. Log elapsed event times, wait for observable results, then hold the final stable state for 900 ms. Keep action timing independent of screenshot delays. Package the numbered names below after both the scene assertions and stream validation pass. Save any diagnostic takes separately. Log codec, size, duration, fps, SHA-256 and action timestamps. Decode each complete file with `ffmpeg -v error -i "$film" -f null -`. Inspect opening, changing and settled frames; reject empty or pre-settled openings, element clipping, wrong subject, or a missing action.

### Exact chapters and filenames

| Deliverable | Required action order after the opening |
| --- | --- |
| `05-diagnostics.mp4` | Failed check, passing check, return to failing evidence. Deliver one source pass on selected check. Film the anchored selector. |
| `06-change-set.mp4` | Select the test patch, return to the source patch, and publish changed patch bytes for that same source file ID. Read “Patch updated” and verify the selected file holds. |
| `07-api-explorer.mp4` | Select GET with missing request example, 404 response, then POST with paired examples. Revisit GET by keyboard. |
| `08-pipeline.mp4` | Select blocked Build, open its Typecheck prerequisite, then set stage `types` to `passed` on the same pipeline record and replace its former error log with `Typecheck passed`. Publish the fixture update. Show the four stages and the selected result. Keep Build blocked until its own source state advances. |
| `10-stats.mp4` | Select Response time (184 ms), Cost (unavailable), then Availability (99.98%). On metric `availability` publish Friday changing from 100 to 99.97 and Saturday from 99.98 to null in the same source revision. Preserve the existing null Wednesday and 99.98 Sunday. Show the two gaps and the exact updated values in the accessible source table. |
| `11-comparison.mp4` | Select Studio, enable Differences only, submit preference, capture acknowledged local receipt and stable criteria. |
| `12-credential-entry.mp4` | Type a fake secret into masked field, Save, capture Saved for this host session, Remove, wait for confirmed removal. Use synthetic data and keep the value out of published logs. |

### Produce the final numbered files

The recorder may emit an unnumbered filename or one ending in `-recording.mp4`. Run this from the verified capture worktree on a successful attempt. It reads each recorder's actual output manifest, copies only the 7 assigned files into a new directory for this attempt, decodes them and writes their metadata. Use that directory for the per-file links.

```bash
python3 - "$CAPTURE_OUT" <<'PYFILMS'
import hashlib, json, shutil, subprocess, sys
from fractions import Fraction
from pathlib import Path

root = Path(sys.argv[1]).resolve()
filenames = {
    "diagnostics": "05-diagnostics.mp4",
    "change-set": "06-change-set.mp4",
    "api-explorer": "07-api-explorer.mp4",
    "pipeline": "08-pipeline.mp4",
    "stats": "10-stats.mp4",
    "comparison": "11-comparison.mp4",
    "credential-entry": "12-credential-entry.mp4"
}
rows = {}
for manifest in sorted(root.rglob("manifest*.json")):
    for item in json.loads(manifest.read_text(encoding="utf-8")).get("captures", []):
        scene = item.get("scene")
        if scene not in filenames:
            continue
        if scene in rows or item.get("failed") or item.get("browserErrors"):
            raise SystemExit(f"Duplicate or failed capture for {scene} in {manifest}")
        rows[scene] = (manifest.parent / item["video"], item)
if rows.keys() != filenames.keys():
    raise SystemExit(f"Missing captures: {sorted(filenames.keys() - rows.keys())}")

output = root / "videos"
output.mkdir(exist_ok=False)
sha = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()
records = []
for scene, name in filenames.items():
    source, item = rows[scene]
    if not item.get("chapters"):
        raise SystemExit(f"Missing chapters for {scene}")
    dest = output / name
    shutil.copyfile(source, dest)
    info = json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(dest)
    ]))
    video = next(stream for stream in info["streams"] if stream["codec_type"] == "video")
    if (video["codec_name"], video["width"], video["height"], Fraction(video["avg_frame_rate"])) != ("h264", 1920, 1080, 30):
        raise SystemExit(f"Unexpected stream in {name}")
    subprocess.run(["ffmpeg", "-v", "error", "-xerror", "-i", str(dest), "-f", "null", "-"], check=True)
    with dest.open("rb") as file:
        digest = hashlib.file_digest(file, "sha256").hexdigest()
    records.append(dict(filename=name, scene=scene, source_sha=sha, sha256=digest,
                        bytes=dest.stat().st_size, codec=video["codec_name"], width=video["width"],
                        height=video["height"], fps=30, duration_s=float(info["format"]["duration"]),
                        chapters=item["chapters"], observations=item.get("observations", []),
                        fixture="Real renderer with authored input and simulated host updates"))
(output / "manifest.json").write_text(json.dumps(records, indent=2) + "\n", encoding="utf-8")
print(output)
PYFILMS
```

Use Python 3.11 or later for this snippet. Return links to the final numbered files. Keep the raw manifests and chapter images alongside the video directory so relative evidence references can be resolved.

## Deliver your branch and 7 videos

Run `pnpm typecheck`, `pnpm lint` and `git diff --check`. Compare changed and untracked product paths against the file lists above. Stage explicit source/test paths and commit the verified changes before capturing. On the final branch commit also run `git diff --check "$BASE_SHA" HEAD` and record the full result of `git rev-parse HEAD`. If all required behavior was present at baseline, use the verified existing SHA. Record videos from that exact commit in the separate capture worktree. Preserve every diagnostic retry in a separate evidence directory.

Return the 7 numbered MP4s listed at the top as individual attachments or direct per-file links. In the evidence directory write `review.md` with one row per clip containing its filename, UI, tested SHA, fixture provenance, chapter timestamps, exact verified outcome and any remaining failure. Include `manifest.json` with filename, SHA-256, byte length, codec, resolution, frame rate, duration and visible component names per file. Include the private recorder sources there for reproduction. Use `ffprobe -v error -show_streams -show_format -of json` on every film, verify H.264, 1920 × 1080 and 30 fps, decode each to EOF, then watch each once at normal speed. Reject footage whose new object is already settled on its first visible frame unless its specified behavior is immediate. Fix a missed interaction or unreadable capture and re-record only the affected film.

In your final response give the branch name, base and result SHAs, changed tracked paths, exact executed checks with pass counts, and links to the videos and review. Identify any inaccessible runtime, skipped gate or unmeasured property explicitly. Fixture recordings demonstrate renderer behavior under the stated source inputs. Report live-model outcomes only when exercised on the real host. Link a local patch when the owner cannot access the branch. Your assignment is complete independently. If a combined commit has already landed through the normal repository workflow, you may rerun your own checks and clips there and label them with that new exact SHA. Branch captures always carry their actual branch SHA.
