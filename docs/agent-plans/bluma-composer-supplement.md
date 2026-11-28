# Bluma composer supplement to #1188

## META

| Field | Value |
| --- | --- |
| Repository / revision | `skytuhua-org/Gen-V1` / `BLUMA-COMPOSER-R1`, 2026-11-25 |
| Canonical issue / parents | [#1188][issue]; original [#1182][motion-parent]; adoption coordination [#2212][program] |
| Verified baseline | `main@96ca4c3bd0664fca53775fbe31915c209641986c` |
| Existing PR | [#1203][pr], open/unmerged; inspected head `c7428df080bef4d520c067a59aca28847d0dbb97` |
| Planning branch / implementation | `docs/bluma-component-adoption-plans` / supplement `NOT_STARTED`, runtime tests `NOT_RUN` |
| Provenance | Entire original body/journal, PR patch, pinned source/tests and repository rules; reference URLs from #2212 research |

Retain the complete original body after this supplement. Scope/PR/ownership remain; explicit timing/API clarifications govern conflicts. IDs use `BLUMA-COMPOSER-R1/T01` namespace, preserving original T04/T07.

## OBJECTIVE

Integrate #1203 with stable editing and truthful feedback. Success: original rows individually accepted, IME/drafts/focus retained, commands immediate and paired 1920x1080 clips. Keep incomplete rev-2 rows visible.

## REQUIREMENTS

| ID | Contract |
| --- | --- |
| R01 | Reuse #1188/#1203. Source edits need `devin-a-cloud-f4e3b6` release/reassignment or acknowledged split; coordinate #1420/#1199 overlaps. |
| R02 | Row base 220/180ms, grid 0fr/1fr+opacity, no delay. First/last/excerpt/re-add/restore preserve textarea/control identity without residual gap. |
| R03 | Same Send/Stop button; icon 80ms opacity/scale .9, Reduced opacity only. Current label/action/disabled state and dispatch never await motion. |
| R04 | Preserve IME/caret/draft/retry/voice/prediction/references and owner isolation/acknowledgment. No flying textarea, fake upload percentage/completion or delayed Stop. |
| R05 | Retain original rows and main/PR/missing/API-gated distinction. Restore/snapshots never replay entrances. |
| R06 | Effective tokens already include speed; consume as-is. Scale raw bases once. Test actual .75/1/1.25 preferences and live System/Reduced/Off/OS/panels-disabled changes. |
| R07 | Preserve keyboard/focus/names, single announcements, read-only labels, hidden inertness, retry/cancel. Reduced no travel/stagger, opacity <=80ms; Off/panels-disabled immediate. |
| R08 | Immutable evidence, normal review/CI, separate main/Windows acceptance. Synthetic data only; no new persistence, permission, runtime or dependency system. |

### Reference mapping

| Reference | Proposed adaptation, using existing owners |
| --- | --- |
| [Chat][chat] | Compact icon/chrome state transitions; retain draft/command authority. |
| [File Drop][filedrop] | Real resource-grant/chip continuity and actual request errors; inspected upload has no percentage API. |
| [Undo][undo] | Reversible feedback only after real deletion-undo contract exists; text restore is not deletion undo. |
| [Search][search] | Find-bar/result feedback with existing scope/match/focus behavior. |
| [Agent Run][agentrun] | Conditional: WorkActivity accepts `Message[]`, no verified step/duration/status API. Never infer progress from message count. |

Proposed mappings only; visual/source/license findings stay in #2212. No Bluma source copied.

### Original scope ledger

All values are base milliseconds; entrance/move easing remains existing `.16,1,.3,1` / `.4,0,.2,1` tokens.

| Rows | Retained behavior / status |
| --- | --- |
| B1 | Banner insert 180/remove 140; stacked existing banners move 160. #1203 implementation needs simultaneous-error/interruption tests. |
| D1/D2/S4 | Fresh message180; hover actions120, keyboard visible. S4 action cluster +30 only for fresh arrivals. Reduced fade/no delay; restored history quiet. S4 separately verified. |
| D3/D4 | Chip insert 180, stagger 30 capped150; remove 140. Reduced fade/no travel/stagger; preserve identity/read-only authority. |
| D5/D6 | Row220/180; icon 80. Integrate #1203 implementation. |
| D7 | Verify A1-A4 after #1186 integration; no duplicate overlay. Above caret, bottom origin. |
| D8/D9/D11 | Prediction fade 120; SentenceReveal chunk 120 for new prose only; retain existing pending tail 900 alternate, static Reduced fallback. |
| D10 | Scroll indicator enter 160/exit 120, opacity + translateY4; hidden pointer events off, deferred exit visibility. Never tween held thumb. |
| M1/M2 | Find-bar grid/opacity180/140; match-color 120 without spatial travel. |
| M5 | Saved-draft delete140/real undo insert 180 retained. No deletion-undo API at baseline: block undo until approved persistence contract; preserve confirmation/text restore. |
| M6 | Newly arriving items180 while mounted only. WorkActivity identifies messages; TaskHistory wraps children/scroll; UpdateControl is desktop updater. No generic feed schema. |
| M11 | Terminal/TerminalExcerpt output unanimated, including during surrounding attachment-row geometry changes. |

Keep delayed loading feedback 150ms. Only measured row/find handoffs animate layout, otherwise opacity/transform. No new waits, `will-change`, frame measurements, redesign, library, acquisition or command/persistence refactor.

## REPO_MAP

Production paths are under `apps/web/src/`. Baseline symbols verified; PR-only helpers marked.

| File / symbol | Verified boundary |
| --- | --- |
| `App.tsx`: `Composer`, `send`, `upload` | IME/draft guards; `message.send`, `resource.upload`, `run.stop`/shared owner. Upload validates 20MB then dispatches, no progress API. |
| `ComposerView.tsx`, `ComposerToolbar.tsx`, `composer-entry.css`, `composer-toolbar.css` | Main row block/Send-Stop branches; PR adds grid row/icon wrappers. |
| `ComposerAttachments.tsx` | Cache/leaving resources/excerpts, project excluded. PR `seenEmpty`/`rowClosing` retains band during exit. |
| PR `App.tsx`: `DeferredUnmount`, `SendStopButton` | PR-only APIs. Test policy/cancel/stale-event cleanup of banner/icon exits. |
| `styles.css`, `chat-scroll-indicator.css`, `ChatScrollIndicator.tsx` | Arrival selectors and indicator geometry/input. Preserve held scrolling. |
| `ConversationFind.tsx`, `conversation-find.ts`, `conversation-find.css` | Scoped ranges/matches/IME/focus; grid motion absent. |
| `SavedDrafts.tsx`, `saved-drafts.ts`, `saved-drafts.css` | `deleteSavedDraft`, `planDraftRestore`, `restoreSavedDraftText`: local CAS/text restore, no delete undo. |
| `WorkActivity.tsx`, `TaskHistory.tsx`, `UpdateControl.tsx`, `TerminalExcerpt.tsx` | Message disclosure (large content delegates WorkbenchActivity), scroll wrapper, updater, excerpt. No shared agent-step contract. |
| `useAppearance.ts`, `task-motion.tsx`, `motion-policy.ts` | Existing preference/policy ownership; shared double-speed correction belongs to #2212 timing prerequisite. |
| Existing test paths in VALIDATION | Composer attachment/IME/draft/commands; find scope/focus; saved-draft CAS/restore/quota/conflict/abort. Extend assertions. |

#1203 changes `scripts/ui-overlay-legacy.json`, adds no browser tests in inspected patch. Preserve legitimate guard updates. [Owner checkpoint][owner-checkpoint] retains scope; [review][rev2-review] notes rev-2 omissions. Prior passes are historical, not retested here.

## DESIGN

Keep state in current owners. Seed seen IDs at mount/restore; only new IDs while mounted animate. Snapshot/thread first render is not arrival.

Attachment: absent -> opening -> open -> chip exit -> row closing -> absent. Retain row through exit; re-add retargets current geometry/clears stale state. Excerpts use same flow. Completion checks target/property/generation, preventing old/child events removing re-added content. Cancel, policy disable, zero duration/unmount settle without waiting for disabled CSS events. Restore settled.

One button renders current action immediately, plus at most one outgoing `aria-hidden`, inert icon. Ignore stale completion. Stop dispatches existing route during held effects; preserve Enter/disabled semantics.

Outgoing copies are inert/accessibility-hidden; move focus before hiding and announce once. Failure retains content/error. Find preserves match/reading position/opener; draft restore remains text-only/CAS, never restores authority.

Follow #2212 `bluma-motion-timing-consistency.md`: effective tokens as-is, raw bases scaled once, overriding old unconditional-division wording. Set real `snapshot.settings.preferences`, publish/await appearance. Reduced row snaps/no travel or stagger/opacity <=80ms; Off/panels-disabled clean exits; System never replays.

T01 records approved M5/M6 API/owner or blocks subrow with contract/recipient. No guessed API, local record resurrection or fake fields. Independent allocated work proceeds; requirements stay visible. No migration; revert focused commits only.

## EXECUTION_DAG

### T01: Reconcile PR, contracts and ownership

**Inputs/prerequisites:** whole issue/journal/revision and current main/PRs; planning only.

**Steps/files:** Refresh heads/claims; secure current owner allocation. Map original rows to main/PR/missing/gated; coordinate #1420/#1199/timing. Inspect M5/M6 APIs, record blocked subrows/owners and revise complete plan.

**Owner/output:** read-only coordinator; acknowledged ledger. **Tests:** verified APIs/no duplicate claim/fix. **Done/handoff:** read-back allocation to T02 worker, otherwise block/release with unblock action.

### T02: Integrate composer lifecycle fixes

**Inputs/prerequisites:** T01, owner-integrated #1203 head, timing contract; shared-helper edits wait for its owner.

**Files/owner:** one worker, `App.tsx`, `ComposerAttachments.tsx`, entry/toolbar CSS and existing composer-app-refinement/integration specs.

**Steps:** Retain PR design, fix demonstrated failures. Test first/last/excerpt/project-only, rapid re-add, upload failure, restore/reload/snapshot. Hold effects; change preferences and exercise IME/selection/focus/draft/commands before finishing. No fake progress or moving textarea.

**Outputs/tests:** A02-A04 evidence; no gap/duplicate/stale completion/lost IME/delayed command. **Done/handoff:** passing commit and remaining row ledger to T03.

### T03: Verify chrome and rev-2 work

**Inputs/prerequisites:** T02; D7 after #1186; approved gated APIs.

**Files/owner:** same writer for App/banner/scroll CSS; separately allocated Find and SavedDrafts presentation; verified M6 item-owner paths. T01 must record exact paths before edits. Reuse existing tests, no overlapping App writer.

**Steps:** Test simultaneous banners/dismiss/retry, indicator/held drag, fresh/restored messages, prediction and terminal quietness. Add M1/M2 wrapper preserving scope/match/focus. M5 only uses approved delete/undo transitions; missing contracts stay blocked. Verify canonical D7, preserve adjacent work.

**Outputs/tests:** A05-A07; no duplicate alert/replay/restored authority/fake step/terminal motion. **Done/handoff:** passing rows and precise blocked prerequisites/owners to T04.

### T04: Capture, review and release

**Inputs/prerequisites:** frozen T02/T03 commits/row ledger.

**Steps:** Run scoped gates; capture identical synthetic before/after flows at 1920x1080/30fps/H.264 without added titles or overlays. Put source/theme/speed labels in an external manifest, never captions inside the video. Complete Windows keyboard/zoom checks, normal PR/CI review and authorized merge; rerun affected checks at exact main SHA. Update complete plan/body; post/read back RELEASE `OWNER=NONE`, clear claimed assignment/in-progress labels.

**Owner/output:** worker PR/evidence; reviewer read-only, maintainer merges. **Tests:** A08, no old/pending/mock acceptance. **Done/handoff:** all rows/main/Windows accepted or `HANDOFF_PENDING` with missing rows/role; no closure with D7/M5/M6 unresolved.

## VALIDATION

Full setup: Node >=24.10, pinned pnpm 10.30.3/Bun, Windows x64; Chromium plus Edge for frontend config on Windows. From repository root:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm build:widgets
pnpm exec vitest run tests/conversation-find.test.ts tests/saved-drafts.test.ts tests/update-control-a11y.test.ts --maxWorkers=1
pnpm lint
pnpm typecheck
pnpm build
pnpm exec playwright test --config tests/e2e/frontend-refinement.playwright.config.ts tests/e2e/composer-app-refinement.spec.ts
pnpm exec playwright test --config tests/e2e/micro-motion.playwright.config.ts tests/e2e/composer-integration.spec.ts tests/e2e/composer-motion.spec.ts tests/e2e/shared-motion.spec.ts
pnpm test:browser --suite composer-press
pnpm test:browser --suite composer-commands
pnpm test:browser --suite composer-prediction
pnpm test:browser --suite conversation-find
pnpm test:browser --suite saved-drafts
```

Run task subsets, listed set at T04. Register new files in source manifest; publication: `pnpm check:docs-links`. Missing checks: `BLOCKED`/`NOT_RUN`.

| Check | Requirements / tasks | Pass condition |
| --- | --- | --- |
| A01 | R01 / T01 | Current acknowledgment, exact file/row allocation, #1203 reuse, dependency SHAs. |
| A02 | R02,R04 / T02 | First/last/excerpt flows settle; project-only absent; same live row on re-add; no gap/duplicate/textarea remount. |
| A03 | R03,R04 / T02 | Same button, current accessible label, max two icons; send/stop commands dispatch during held effect; IME does not submit. |
| A04 | R04,R06,R07 / T02 | Actual .75/1/1.25 timing and live policy matrix; retained draft/caret/focus/selection; no orphan effect/listener/replay. |
| A05 | R05,R07 / T03 | B1/D1-D11 each evidenced, including simultaneous stack, hidden indicator, held drag, keyboard hover actions and D7 dependency. |
| A06 | R04,R05,R07 / T03 | Find scope/match/reading position/focus and draft CAS/text-only restore retained; absent undo blocked, no pretend success. |
| A07 | R05,R07 / T03 | S4/M1/M2/M5/M6/M11 pass or explicitly blocked; no restored feed replay, fabricated state or terminal text motion. |
| A08 | R08 / T04 | Paired clips/logs/row matrix at immutable commits; review/CI/main/Windows distinct; scope released. |

Clips: identical 1920x1080 synthetic fixture/actions: first/last/re-add, IME, Send/Stop/policy change; retain timing JSON. Check dark/light, narrow/short, actual 100/125/150% app zoom, keyboard/screen-reader names/statuses. Browser zoom is not physical DPI; mocks do not verify live provider/package.

**Executed:** inspection only, no application tests/clips. Runtime acceptance pending; prior reports are historical.

## STATE

Plan ready; T01-T04 `NOT_STARTED`, A01-A08 pending. Existing #1203 ownership retained. M5 undo/generic M6 APIs absent; D7 depends on #1186. Earlier B1/D5/D6/D10 reports do not complete rev-2.

Publication/source verification and planning release are recorded in #2212. Receiver acknowledges the whole journal/revision, then T01 before editing; missing-contract rows remain blocked.

## REFERENCES

[issue]: https://github.com/skytuhua-org/Gen-V1/issues/1188
[motion-parent]: https://github.com/skytuhua-org/Gen-V1/issues/1182
[program]: https://github.com/skytuhua-org/Gen-V1/issues/2212
[pr]: https://github.com/skytuhua-org/Gen-V1/pull/1203
[owner-checkpoint]: https://github.com/skytuhua-org/Gen-V1/issues/1188#issuecomment-7058630319
[rev2-review]: https://github.com/skytuhua-org/Gen-V1/issues/1188#issuecomment-7051612974
[chat]: https://bluma.design/c/chat
[filedrop]: https://bluma.design/c/filedrop
[undo]: https://bluma.design/c/undo
[search]: https://bluma.design/c/search
[agentrun]: https://bluma.design/c/agentrun

- [Pinned baseline](https://github.com/skytuhua-org/Gen-V1/tree/96ca4c3bd0664fca53775fbe31915c209641986c): exact REPO_MAP files and complete AGENTS/CONTRIBUTING/DESIGN rules.
- [PR commit](https://github.com/skytuhua-org/Gen-V1/commit/c7428df080bef4d520c067a59aca28847d0dbb97): existing row-remount correction.
- [#1186](https://github.com/skytuhua-org/Gen-V1/issues/1186)/[#1199](https://github.com/skytuhua-org/Gen-V1/pull/1199), [#1302](https://github.com/skytuhua-org/Gen-V1/issues/1302)/[#1420](https://github.com/skytuhua-org/Gen-V1/pull/1420): refresh integration/ownership before changes.


---

## Preserved earlier issue body

The complete earlier body follows verbatim. Its historical source/status statements describe their named snapshots. The dated supplement above changes only its explicit boundaries; other original requirements and linked continuation plans remain.

<!-- BEGIN PRESERVED ISSUE 1188 -->
Part of the workspace animation coverage plan.
Parent issue: https://github.com/skytuhua-org/Gen-V1/issues/1182
Plan file (full spec, all sections): `docs/agent-plans/1182-workspace-animation-coverage.md` on branch `devin/1795198505-workspace-animation-plan` (PR #1183).

**Normative values.** Every animation below is fully specified: trigger, properties, duration token, easing, delay/stagger, states, reduced-motion (RM) fallback. The implementer makes zero design choices. Global rules that apply to every row:

(applies to every row below)

| Rule | Value |
| --- | --- |
| Entrance easing | `var(--ui-ease-enter)` = cubic-bezier(.16,1,.3,1) |
| Move/exit easing | `var(--ui-ease-move)` = cubic-bezier(.4,0,.2,1) |
| Exits | ~20% shorter than the matching enter; return toward the trigger |
| Interruptibility | Every transition/animation must be interruptible: retarget from current geometry (CSS transitions do this natively; WAAPI calls must `cancel()` cleanly — see `animateTask`). Never tween a control while held or dragged. |
| Keyboard-driven changes | Selection/highlight moves still animate; *content* entrances triggered purely by typing do not replay. |
| `prefers-reduced-motion` / `data-motion=reduced` | No spatial transforms, stagger, or shimmer. Opacity-only fallback at `var(--ui-motion-press)` (80ms) or less. The global reduce block in `styles.css:351` covers any missed case but each component must also declare its own. |
| `data-motion=off` / `data-panel-animations=false` | No animation at all (`appearance.css:17` already enforces). |
| Motion speed scalar | WAAPI durations divide by `--motion-speed` exactly as `animateTask` does; CSS animations honor it via the existing speed hook (settings already exposes it). |
| Compositing | Animate only `opacity` and `transform` for anything that moves per-frame or staggers; `height`/`width`/`grid-template-rows` only for measured layout handoffs (artifact, attachment row, disclosure) where a transform cannot express the change. No `will-change` except on `task-answer-reveal` (already present). |
| Delayed feedback | Loading indicators appear only after 150ms of pending time (existing rule, kept). |


**Repository conventions to reuse:** `animateTask` in `apps/web/src/task-motion.tsx` for any WAAPI/FLIP work (it already honors `readMotionPolicy`, `--motion-speed`, and interruptibility); `Popover.tsx:34-42`'s `getAnimations()`-wait pattern for any deferred unmount; `::details-content` opt-in pattern at `styles.css:361-364` for height tweens.

**Validation for this slice:** `pnpm lint && pnpm typecheck`; browser walkthrough of every spec row below in slow motion (fixture host on :4317, see plan VALIDATION); reduced-motion re-check per row's RM column; interrupt check by spamming the trigger mid-animation.

---
## Scope
Attachment row height tween, attachment chip insert/remove (exists — verify), send→stop swap, command menu (covered by A1–A4, verify only), prediction text, scroll indicator, typing indicator, `.workspace-error` banner insert/remove/stack. Files: `composer-entry.css`, `composer-toolbar.css`, `ComposerAttachments.tsx`, `chat-scroll-indicator.css`, `styles.css`, `App.tsx`. Execution DAG tasks T04+T07.

## Spec

Already specified and implemented (tokens correct). **Changes:** none, except B1.

| # | Element | Change | RM |
| --- | --- | --- | --- |
| B1 | `.workspace-error` banner(s) | Treat as list inserts: on mount `ui-item-in` (`--ui-motion-insert` 180ms, translateY(4px)+opacity); on dismiss `ui-item-out` (`--ui-motion-remove` 140ms). When a second error stacks, existing banners translate down with `--ui-motion-status` move easing — no overlap pop. | opacity only |

| # | Element | Trigger | Props | Duration | Delay | States | RM |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D1 | Message arrival | `data-arrival=true` | `ui-item-in` | 180ms | 0 | exists | fade |
| D2 | Message hover actions (copy, react) | pointer enter/leave | `opacity` 0→1 (exists `styles.css:375`) | `--ui-motion-hover` (120ms) | 0 | keep; keyboard focus also reveals | none |
| D3 | Attachment chip insert | file added | `ui-item-in` on `.resource-chip` | 180ms | nth×30ms cap 150ms | exists | fade |
| D4 | Attachment chip remove | remove click | `ui-item-out` (exists, `data-leaving`) | 140ms | 0 | exists | fade |
| D5 | Attachment **row** expand/collapse | first chip added / last removed | `grid-template-rows: 0fr→1fr` + `opacity` on a wrapper (row exists only with attachments per DESIGN) | `--ui-motion-panel-enter` 220ms in / `--ui-motion-panel-exit` 180ms out | 0 | **New.** Grid-wrapper, not `height:auto` tween | row snaps, chips fade |
| D6 | Send → Stop state swap | run starts/stops | crossfade: outgoing `opacity`→0 `scale(.9)`, incoming reverse | `--ui-motion-press` (80ms) | 0 | Same-button swap, not a size change; disabled state transitions `opacity`+`color` 120ms | opacity only |
| D7 | Composer command menu | see A1–A4 | — | — | — | opens above caret; origin = bottom edge | — |
| D8 | Prediction/ghost text | new suggestion | `composer-prediction-in` opacity (exists, `styles.css:135-141`) | `--ui-motion-hover` (120ms) | 0 | keep | none (already off) |
| D9 | Sentence reveal (streaming prose) | grapheme batches | existing `SentenceReveal` | per `task-motion` chunk 120ms | — | keep; restored history never re-reveals | shows immediately |
| D10 | Chat scroll indicator ("scroll to bottom") | becomes scrollable-away / reaches bottom | `opacity` + `translateY(4px)` | enter `--ui-motion-status` (160ms), exit `--ui-motion-hover` (120ms) | 0 | `pointer-events:none` while hidden (visibility flip after exit) | opacity only |
| D11 | Typing/queued indicator | pending | existing tail-fallback pulse 900ms alternate (task-motion.css) — keep as-is | — | — | — | static dot |

## Rev-2 additions
- S4 message arrival: message body `ui-item-in` 180ms; hover-action cluster `ui-item-in` at +30ms delay, on `data-arrival` only (restored history never replays). RM: opacity only, no delay.
- M1/M2: ConversationFind bar open/close `grid-template-rows 0fr→1fr` + opacity 180/140ms; match-highlight moves swap `background-color` at `--ui-motion-hover`, no spatial travel.
- M5: SavedDrafts delete plays `ui-item-out` 140ms; undo restores `ui-item-in`.
- M6: TaskHistory/UpdateControl/WorkActivity feed items `ui-item-in` only when arriving while mounted.
- M11: Terminal/TerminalExcerpt output — explicitly NO animation.

<!-- END PRESERVED ISSUE 1188 -->
