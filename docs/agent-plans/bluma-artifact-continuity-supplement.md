# Bluma reference supplement: stable tabs, disclosures and editable records

## META

| Field | Value |
| --- | --- |
| Canonical issue / parent | [#1115](https://github.com/skytuhua-org/Gen-V1/issues/1115) / [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212) |
| Revision / date | `BLUMA-ARTIFACT-R1` / 2026-11-25 |
| Inspected source | `main@96ca4c3bd0664fca53775fbe31915c209641986c` |
| Existing candidates | #1152 at `1da768e7` and stacked #1254 at `215d574a`, both open when inspected; refresh full SHAs before editing |
| Implementation | `NOT_STARTED`; this revision adds reference/acceptance detail to existing scope |
| Source artifact | `docs/agent-plans/bluma-artifact-continuity-supplement.md`; full combined issue body will preserve the earlier body after this supplement |

### Precedence and preservation

This is a bounded 2026-11-25 supplement for Tabs and the original UI14/UI22/UI26 obligations. It does not discard the original 81,526-character Worker-3 plan, its ordered continuation comments, the later acceptance-r2 plan or their pinned sources. The previous body is retained below as historical context. Its old unpushed-branch and DONE statements describe earlier snapshots; current open PRs and fresh evidence govern implementation status. Existing chart, context-inspector, recording and integration requirements remain. The newer pointer-only tab motion contract is retained. This supplement takes precedence only for the explicitly stated Bluma adaptations and current command/path corrections.

## OBJECTIVE

Adopt Bluma's continuity between a selected tab, its content, an expanding answer and an editable record while retaining Gen-V1's actual state and action model. Work through #1115's existing candidates, not a parallel replacement of `registry.tsx`, `TaskDisclosure.tsx` or `InteractionTools.tsx`.

Observed references were [Tab Bar](https://bluma.design/c/tabbar), [Segmented Control](https://bluma.design/c/segmented), [Accordion](https://bluma.design/c/accordion), [Follow-up Questions](https://bluma.design/c/askflow) and [Inline Table](https://bluma.design/c/itable). The review exercised tab selection, follow-up progression with a retained prior-answer chip, and entry into an inline cell editor. These observations establish visual references, not access to Bluma implementation source.

Main already retains visited tab panels, implements interruptible disclosure regions, retains question branches and edits records through explicit submitted changes. The work is integration and targeted refinement of that foundation. A visual reference is not authorization to convert exploration into a one-question wizard or to autosave records.

## REQUIREMENTS

| ID | Required behavior |
| --- | --- |
| R01 | Reconcile #1152/#1254 and #1811 with current main before changing shared files. Reuse current accepted work; identify remaining gaps by evidence, not old issue status. Coordinate registry ownership with #2141 and schema work #1970/#2015. |
| R02 | Tabs keep visible full labels, fixed status slots and current persisted selection. A genuine pointer selection may move the selected indicator in 140ms at base speed. Keyboard/assistive selection, identical selection, restore, resize and wrapped rows settle immediately per acceptance-r2. Text/control dimensions do not stretch, bounce or hide to icons. Off snaps; Reduced uses no geometry/stagger and at most 80ms opacity. |
| R03 | Preserve visited-panel DOM identity, focus, draft, nested disclosure state, scroll and action ownership. Arrow/Home/End behavior remains correct; tab/panel IDs and `aria-controls`/`aria-labelledby` connect each unique pair. Hidden panels cannot receive focus. Duplicate saved labels still fail safely without writing state. |
| R04 | Disclosures retain answered and pending branches, source attribution, source error/retry and deduplicated requests. Use existing measured region/handoff behavior; no replacement spring engine, cloned editor, fake pending duration or disappearance of previous answers. |
| R05 | Editable records preserve typed field controls, immutable read-only source cells, draft/original distinction, validation, changed-cell count and explicit Review changes submission. Adapt local emphasis/selection continuity only where current candidate evidence shows a gap. Never invent per-row Saved state from command acknowledgment or submit on blur. |
| R06 | State changes are immediate and source-authoritative. No animated numeric facts, estimated progress, fixed demo waits, auto-advancing question selection, hidden invalid inputs or per-letter accessible labels. Input/IME/drag remain responsive during held motion. |
| R07 | Preserve compact neutral styling, valid task schemas and existing `Artifact` edit/persistence boundaries. No new component library, external request, catalog prop, production route or broad table/chart redesign. |
| R08 | Provide before/after evidence and required original recordings from frozen SHAs; retain the broader #1115/#1811 acceptance obligations and distinct Windows/live-provider gates. |

Explicitly excluded references: [Dash Tabs](https://bluma.design/c/dashtabs) dust/speed lines/lean/text, expanding icon-only navigation labels, automatic finish celebrations, Bluma's one-question-at-a-time replacement for the existing exploration view, and blur over editable content.

## REPO_MAP

| Path / symbol | Current role and permitted work |
| --- | --- |
| `apps/web/src/registry.tsx`: `Tabs` | Main keeps a `visited` Set and panel `hidden` state, roving selection, source status slots and footer. Compare candidate first; add only missing indicator/ARIA wiring within existing ownership. `Form`/`Button` feedback belongs to #2141. |
| `apps/web/src/styles.css`: `.surface-tabs`, `.task-tab-panel` | Main uses selected border/text styling. Candidate styling may already improve it. Scope new selectors narrowly to the chosen tab primitive. |
| `apps/web/src/TaskDisclosure.tsx`: `Disclosure`, `FollowupBranch` | Existing actual pending/ready/error, retained branches and measured nonsemantic placeholder handoff. Reuse; improve only evidenced gaps. |
| `apps/web/src/task-motion.tsx`: `MotionRegion`, `IncomingAnswer` | Existing continuity owner. Read-only dependency for this supplement unless a separately coordinated defect is demonstrated. Timing issue handles effective duration scaling; do not fork or retune springs here. |
| `apps/web/src/InteractionTools.tsx`: `EditableTable`, `FieldControl` | Existing typed in-cell controls, source/draft comparison, changed-cell validation and explicit `action.run`. Preserve state paths and payload shape. |
| `apps/web/src/interaction-tools.css`, `task-interface.css`, `task-motion.css` | Current component styles; inspect candidate CSS and change only local visual handoffs with a demonstrated need. |
| `apps/web/src/PlanningQuestion.tsx` | Separate explicit-Continue planning flow with explanation/example requests and IME guard. Read-only negative reference; do not replace it with an automatic advance. |
| `apps/web/src/Artifact.tsx`, `ArtifactPresentation.tsx`, `task-context.ts` | Persistence, ownership, presentation/action boundaries. Read only for this supplement; visual continuity must not alter authority or action promises. |
| `tests/e2e/tabs-identity.spec.ts` | Existing unique/duplicate label, persisted selection and mounted-draft coverage. Extend missing ARIA, keyboard and interrupted-indicator checks. |
| `tests/e2e/task-interface.spec.ts` | Actual progressive Q&A branch/edit identity, focus, deduplication, IME, newer-draft and retry cases. Reuse. |
| `tests/e2e/interaction-tools.spec.ts`, `task-design.spec.ts` | Existing review/record/parameter and task design evidence. Read exact cases before extending scoped acceptance. |
| `tests/e2e/table-controls.spec.ts` | Separate table identity/selection regressions. Run only if changed code affects these controls; no broad TaskTable rewrite. |
| `scripts/record-task-design.ts`, `scripts/task-design-scenes.ts` | Existing recording and scene files. Correct location is under `scripts`; old issue paths must not be copied blindly. |

The original plan references branch-only fixtures such as `generative-refinement.spec.ts`. Resolve them on the selected candidate before executing; absence on main is not permission to fabricate a path or skip the original acceptance silently.

## DESIGN

### Tabs

Choose the current accepted #1152/#1254 implementation as the integration starting point after refresh. Retain all labels and the existing 14px source-status slot. The visual target is a quiet neutral indicator under the selected label region, at most 2px thick, with stable tab button geometry. Reuse an already suitable candidate indicator rather than adding a second one. If absent, use one `aria-hidden`/pointer-inert indicator in a nonsemantic wrapper outside the `role=tablist` button sequence, so the existing arrow-key indexing cannot accidentally focus it. Do not insert a decorative direct child that changes button indices.

Read active-tab and track rectangles on selection or an actual resize, not each animation frame. On a genuine pointer selection within one unwrapped row, the indicator may translate and scale along its horizontal axis; text and focus outlines stay unscaled. Retarget from current rendered geometry for interrupted pointer selection. Use the existing 140ms tab token/easing and motion policy, with effective tokens consumed once. Keyboard/assistive input, identical selection, restore, resize and wrapped rows settle immediately as required by the later acceptance-r2 instructions. No overshoot, staged outgoing/incoming panel delay, decorative sweep or all-tab entry stagger. Scrolling, fonts and resize must leave the settled indicator aligned to the selected button; dispose observers on unmount. Preserve a usable native selected state even before measurement or with animation disabled.

Selection and panel visibility update synchronously. Existing visited panels stay mounted and hidden when inactive. Establish instance-unique tab/panel IDs and explicit ARIA linkage without altering persisted label values, catalog schemas or panel keys gratuitously. Use the accepted candidate's identity scheme if correct. Keep duplicate-label failure behavior and long-label overflow handling. Any existing candidate with equal or better behavior is verified, not rewritten for visual similarity.

### Disclosures and question flow

Keep the actual question row, answer and related branches in their current owner. Expansion makes space and retains context; answer text becomes available when real data does. Reuse `MotionRegion` and `FollowupBranch` instead of animating detached clones of editable controls. Their existing spring behavior is not changed by this supplement or by the duration-scaling fix. For a discrete new-answer opacity cue, use the existing arrival token and policy; do not replay it on restore, ordinary source snapshots or every keystroke.

Pending, source-ready and source-error are distinct. An accepted command is not a completed answer. Repeated open/click while pending must not send duplicate commands. Collapse/reopen retains prior answers, notes and expanded descendant state. A new request or rejected source must not erase a newer user draft. Focus remains on the user's current input unless they deliberately navigate. Bluma's answer-chip trail informs continuity; it does not replace Gen-V1's visible branching exploration with an irreversible wizard.

### Editable records

Current records already render actual `FieldControl` inputs per editable cell, with source values, changed markers and an explicit action footer. Preserve this discoverable editing model. Borrow Bluma's local state clarity by keeping cell dimensions and focus stable as a select opens or a validation message appears. Use the shared #1186 Select for menu motion where already applicable; do not implement a second dropdown. Preserve the visible original-value comparison and exact changed-cell payload.

Do not implement click-to-edit merely to hide existing useful controls. Do not set a row to Saved, discard dirty edits, or clear validation because a command resolved. Only the existing accepted source/state flow can change the authoritative record. If before/after inspection finds no remaining record gap, mark this reference `VERIFIED_EXISTING` with evidence and leave code unchanged. This is a valid completion for this reference, not an exemption from original UI14 acceptance.

### Integration, error and rollback

Keep patches small and separate from chart/context work where feasible, while maintaining the canonical #1115 dependency stack. Coordinate shared `registry.tsx` edits with #2141 and exact token/manifest edits with the timing issue. Existing #1970/#2015 contracts on valid Tabs labels and other component schemas are retained. Merge/rebase by intent, not by replacing current files with an older PR copy. Rollback reverts the bounded visual/ARIA change and tests; persisted state and schema require no migration.

## EXECUTION_DAG

Order: **T01 -> T02 -> T03 -> T04**. T02 can finish as verification-only when a candidate already meets the target; no duplicate implementation is required.

### T01: Reconcile the existing worker branch and scope

Inputs/prerequisites: complete #1115 body, original continuation comments/pinned plan, current journal, #1152/#1254 diffs, #1811 handoffs, #2141 and #1970/#2015. Refresh exact full SHAs and claims. Do not treat the old body's unpushed status or earlier release by a different reviewer as current owner disposition.

Steps/ownership: coordinator records accepted candidate stack, fulfilled versus pending original obligations, relevant file ownership, and exact bounded adoption tasks. Obtain explicit release/reassignment or acknowledged split for overlaps before editing. Claim only this supplement's files/tasks with a fresh checkpoint. Compare current main and candidate for each R02-R05 gap.

Outputs/tests: evidence-based gap table and owned branch. Positive: every gap has source and preview rationale. Negative: no duplicate tab implementation, takeover by timeout, discarded branch or falsely completed original requirement. Done when ownership and scope are acknowledged; handoff exact candidate SHA/gaps to T02. Unresolved ownership blocks edits, not documentation publication.

### T02: Integrate the selected-tab and continuity refinements

Inputs: T01 candidate/gap table, DESIGN, current shared controls and timing contracts. One worker owns `registry.tsx`/scoped style changes; no parallel Form editing without agreed split.

Edits: reuse accepted tab implementation, fill missing indicator/ARIA/keyboard behavior, and correct only evidenced disclosure/record continuity gaps in named files. Keep source-driven state and actual controls. If a new source helper is unavoidable, revise full plan with exact path and register it in the source manifest; no speculative new generic animation API.

Outputs/tests: minimal candidate and requirement mapping. Positive: tab alignment, original labels, linked panel, retained drafts/notes and local record focus. Negative: rapid A-B-A cannot strand indicator/panel; hidden panels cannot take focus; no replay on restore; no early ready/saved state; no implicit submit. Done when focused cases pass on the candidate; handoff frozen SHA to T03.

### T03: Validate integrated behavior and record comparisons

Inputs: T02 SHA and #1115's original acceptance, with current fixture paths resolved. Reuse the reference/evidence issue under #2212 rather than building a new gallery.

Edits/tests: extend `tabs-identity.spec.ts` for missing ARIA/interruption/long-label coverage; reuse Q&A and record fixtures for focus/IME/rejection/source-update behavior. Check normal, Reduced, Off and supported speeds, narrow/short windows, dark/light, 100/125/150% app zoom. Hold an effect and type/switch tabs to prove input does not wait. Record before/after UI14/UI22/UI26 and tab sequences; preserve the original remaining eight-video obligation rather than replacing it with a small sample.

Outputs: exact test counts, skips, traces if failures, comparisons at fixed SHAs. Positive: A01-A06. Negative: a screenshot or synthetic pass is not native/live acceptance. Done when this supplement's cases pass and broader pending obligations are explicit; handoff evidence to T04.

### T04: Review and hand off the integrated result

Inputs: T03 evidence and original issue's still-open obligations. Independent reviewer checks semantic/state preservation and exact scope.

Steps/output: publish one focused implementation PR or update the canonical existing candidate with owner approval; link #1115/#2212. Run required CI/review gates, preserve original recordings/checkpoints, and verify source at authorized merge. Release own scope with `OWNER=NONE`; update the full canonical plan and pinned file together. Do not close #1115 or #1811 while their other acceptance remains pending.

Tests/done: A07, all changed controls usable after integration, evidence readable, exact remaining owner/action documented. If merge/native/original recordings are incomplete, state `HANDOFF_PENDING` rather than DONE.

## VALIDATION

| Acceptance | Requirements / tasks | Pass condition |
| --- | --- | --- |
| A01 | R01,R07 / T01 | Current candidates and original requirements reconciled; acknowledged file boundary and no schema/dependency expansion. |
| A02 | R02,R03 / T02,T03 | Full labels remain, fixed status slots, indicator aligned within 1 CSS px after settle, 140ms base token for genuine pointer changes only; keyboard/AT, identical selection, restore, resize and wrapped rows snap. No text scale; all arrow/Home/End and ARIA pairs correct. |
| A03 | R03,R06 / T02,T03 | Unique tabs retain exact control nodes, typed value, focus where appropriate and nested state across A-B-A; duplicate saved labels fail without state writes; hidden panels inert. |
| A04 | R04,R06 / T02,T03 | Pending/open/retry deduplicates, previous branches and newer drafts remain, source error never becomes success, restore does not replay. Existing Q&A IME cases pass. |
| A05 | R05,R06 / T02,T03 | Read-only cells unchanged, edits typed/validated, original values shown, only explicit submit emits exact changed-cell payload, rejection preserves edits. No fake Saved/auto-submit. |
| A06 | R02-R08 / T03 | Reduced/Off and supported speeds, interrupted motion, long text, short/narrow and zoom checks; before/after clips 1920x1080/30fps/H.264 without overlays, with SHAs/hash manifest. |
| A07 | R01,R08 / T04 | Review and required CI honored; merged/main and native status separate; original #1115/#1811 obligations retained and final release posted. |

Use the repository-pinned toolchain and installed browsers. After `pnpm build`, current registered commands include `pnpm test:browser --suite tabs-identity`, `pnpm test:browser --suite task-interface`, `pnpm test:browser --suite task-design`, and `pnpm test:browser --suite clarity-review-parameters` for `interaction-tools.spec.ts` and related review cases. Run `pnpm typecheck`, `pnpm lint:ui --check` and focused affected motion tests. Run the broader existing issue/CI gates as required, not a new unrelated suite. `pnpm check:docs-links` validates tracked plan links. Old branch-only commands must be refreshed in the checkpoint before execution.

Actually executed for this supplement: source, issue and PR-state review; Bluma visual preview review by the parent coordinator. Application unit/browser/build/Windows tests and before/after recordings: `NOT_RUN`. No product source changed by this planning task.

## STATE

Plan `READY_FOR_COORDINATED_IMPLEMENTATION`; product work `NOT_STARTED`; planning owner released on publication, implementation ownership must be refreshed. T01-T04 pending. Existing #1152/#1254 candidates were open at inspection, not merged evidence. Next action: reconcile current #1115/#1811 owner/candidate state and record which reference targets are already fulfilled. This supplement does not itself reopen or erase accepted work.

## REFERENCES

- [#1115](https://github.com/skytuhua-org/Gen-V1/issues/1115), [#1152](https://github.com/skytuhua-org/Gen-V1/pull/1152), [#1254](https://github.com/skytuhua-org/Gen-V1/pull/1254), [#1811](https://github.com/skytuhua-org/Gen-V1/issues/1811)
- [Original full Worker-3 plan](https://github.com/skytuhua-org/Gen-V1/blob/fb0694b911d46afb837bc3dd6e43c5742b450a18/docs/agent-plans/worker-3-forms-charts-shared-motion.md)
- [Later Worker-3 acceptance-r2 plan](https://github.com/skytuhua-org/Gen-V1/blob/8ad7387890cef5f52aeb925fc278ff53f78ac93c/docs/agent-plans/worker-3-forms-charts-shared-motion-acceptance-r2.md), [canonical acceptance-r2 instructions](https://github.com/skytuhua-org/Gen-V1/issues/1115#issuecomment-7088725984)
- [Tabs source at inspected main](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/registry.tsx)
- [Disclosure source](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/TaskDisclosure.tsx)
- [Editable records source](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/apps/web/src/InteractionTools.tsx)
- [DESIGN](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/DESIGN.md)


---

## Preserved earlier issue body

The complete earlier body follows verbatim. Its historical source/status statements describe their named snapshots. The dated supplement above changes only its explicit boundaries; other original requirements and linked continuation plans remain.

<!-- BEGIN PRESERVED ISSUE 1115 -->
## Worker 3 — Shared motion, forms, charts and context

**Canonical execution plan** (SHA-pinned copy of the supplied Markdown): https://github.com/skytuhua-org/Gen-V1/blob/fb0694b911d46afb837bc3dd6e43c5742b450a18/docs/agent-plans/worker-3-forms-charts-shared-motion.md

Plan revision: Worker-3 v1 (supplied 2026-11-20) · Baseline: `26ddf4d16c2fc1196b520d8a46c5441d64d01463` · Branch: `refine/forms-charts-motion`

### Contents manifest
- Shared motion and tabs — `task-motion.tsx`, `registry.tsx` Tabs, `useTaskEffectCause`, tabs-identity + generative-refinement specs
- UI 13 — Item review queue (`13-review-queue.mp4`)
- UI 14 — Editable records (`14-editable-table.mp4`)
- UI 15 — Parameter controls / image export (`15-parameter-controls.mp4`)
- UI 22 — Nested questions and answers (`22-faq-disclosure.mp4`)
- UI 23 — Source tables and migration inspection (`23-source-tables.mp4`)
- UI 24 — Bar, line and scatter charts (`24-chart-variants.mp4`)
- UI 26 — Contextual forms and choices (`26-form-controls.mp4`)
- UI 29 — Context usage inspector (`29-context-inspector.mp4`)
- Recording instructions for eight 1920×1080 30 fps MP4s + packaging/validation

### Publication notes (per AGENTS.md ISSUE PUBLISH)
- GitHub issue bodies are capped at 65536 chars; the plan is 81526 chars. The **complete plan text is published below as ordered continuation comments** `PLAN PART 1/2` and `PLAN PART 2/2`, plus the identical .md at the pinned link above.
- A real GitHub file attachment is not available via the API, so the .md is published as a versioned repo file instead (allowed fallback).

---

## Fix plan (rev 1) — remaining scope only

### META
- Feature: Worker 3 remaining work — UI29 context inspector, then recordings + PR
- Repo: skytuhua-org/Gen-V1 · Plan rev: 1 (2026-11-20) · Baseline: `main` @ `7ef0710c90a479233f8dd9fe484a296f8c3c86d3`; worker branch `refine/forms-charts-motion` based on `26ddf4d16c2fc1196b520d8a46c5441d64d01463`
- Issue: #1115 · Current owner: `devin-a-cloud-9c41e2` (review/planning claim of record). Build worker `devin-cloud-636f3f` RELEASED (checkpoint 007 state). Progress: T13/T14/T15/T22/T23/T24/T26 DONE-VERIFIED at HEAD `c6fdab19`; **remaining: T29 (UI29), T-RECORD (8 MP4s), T-PR (push + PR)**. Branch is UNPUSHED — absent from `git ls-remote`; work lives in the worker's local worktree `/home/ubuntu/worker3/src` on its VM.
- Source provenance: review by devin-a-cloud-9c41e2; spec text quoted from the canonical plan (issue comments PLAN PART 2/2 and the pinned .md).

### OBJECTIVE
Finish the last unimplemented interface (UI29 context inspector) exactly per the canonical plan, then produce the eight required MP4s and land the branch. Success = UI29 browser acceptance green + 8 validated 1920×1080/30fps MP4s + pushed branch + PR.

### REQUIREMENTS (in scope — remaining tasks only)
- T29 UI29 must satisfy the canonical §29 implementation + browser acceptance (full spec in DESIGN).
- T-RECORD must produce `13-review-queue.mp4`, `14-editable-table.mp4`, `15-parameter-controls.mp4`, `22-faq-disclosure.mp4`, `23-source-tables.mp4`, `24-chart-variants.mp4`, `26-form-controls.mp4`, `29-context-inspector.mp4` — 1920×1080, 30 fps, H.264, real-time compositor, decode-clean to EOF, per-file SHA-256 + `manifest.json` + `review.md`.
- T-PR: `pnpm typecheck`, `pnpm lint`, `git diff --check`, stage explicit source/test paths, commit, push `refine/forms-charts-motion`, open PR.
- Out of scope here: T13–T26 (already VERIFIED per checkpoints); any re-design.

### REPO_MAP (verified on baseline; worker's tree extends it)
- `apps/web/src/ContextInspector.tsx` — `ContextSession`, `ownedCompaction`, `acceptedCompaction`, `contextSegments`, `Category`, shared `Popover` (packages/ui-shell/Popover). Confirmed: `acceptedCompaction` reconciles receipt `{beforeTokens, afterTokens, contextWindow}` against measured segments (freed = before−after only when `before<=window`, `after<=before`, `window===measured.total`, `after===measured.used`).
- `apps/web/src/ContextMeter.tsx` — `.context-meter` group + `context-measurement-accepted` marker class (line 69).
- `apps/web/src/context-inspector.css` — line 10 has the offending `transition:width var(--ui-motion-receipt) var(--ui-ease-move)` on `.context-measurement-accepted .context-segment`; line 44 has the reduced-motion overrides block (`.context-category-detail.ui-popover`, `.context-inspector.ui-popover`, `.context-compaction-shimmer`, `.context-measurement-accepted .context-segment`, `.context-receipt-pulse`).
- `tests/e2e/usage-context.spec.ts`, `tests/e2e/usage-context-fixture.tsx`, `tests/e2e/operational-motion.spec.ts`, `tests/e2e/context-compact.spec.ts` — acceptance fixtures/specs; fixture actions `categories`, `request-compaction-many`, `foreign`, `unmeasured`, `accepted`, `restart` (receipt id `receipt-one`, before=8000, after=4000, window=10000).
- Recorder seed: `scripts/record-task-design.ts`, scenes from `tests/e2e/task-design-scenes.ts`; fixture host on :4317 + Vite; `CAPTURE_OUT` env.

### DESIGN (UI29 exact spec — implementer makes zero decisions)

1. **Intrinsic height** — Keep dialog width 328 px, padding 12 px, section gap 12 px, header/body/footer DOM order, two-column category grid. Wrap all body content in one natural-flow inner div; register it via callback ref so measurement starts after the Popover portal mounts. Local numeric `requestedHeight`, initial estimate 200 px; after mount, layout-time measure intrinsic body content + real top/bottom padding, border, visible header/nav/footer and flex gaps in CSS px (offsetHeight or untransformed ResizeObserver border-box) — exclude portal transform/zoom. Round up once; update state only on change. Use inner body's intrinsic height even when the outer scroll body is clamped.
2. **Observers** — ResizeObserver on the inner content and each fixed band; reattach on nav/band changes; content wrap, font load and evidence expansion trigger re-measure; disconnect on close/identity change. Body stays `flex:1; min-height:0; overflow:auto`; header/footer non-shrinking; feed requested size to the existing Popover (it owns clamping/reposition). Baseline six categories ≈ 210–225 px; acceptance: ≤2 CSS px unused body space unconstrained.
3. **Category tooltips** — Replace per-Category 120 ms hover/focus timers with one group-owned active-category state + one cancellable 200 ms dwell timer in ContextMeter. First pointer hover: 200 ms. Pointer transfer to another category inside the same grid: immediate switch. Pointer through grid whitespace retains warm state until pointer leaves the grid. Pointer entry animation: opacity .85→1 over 125 ms. Keyboard focus opens immediately, no entrance. Escape closes the nearest shown tooltip and keeps focus on its button; suppress reopen until next focus or fresh pointer entry. Keep PageUp/PageDown scrolling and tooltip descriptions. Track focused ID and hovered ID separately; keyboard focus has priority until blur. On grid pointer-leave discard hover ID + timer; retain focused tooltip only while a keyboard-focused ID remains; on focus leaving the group clear focused ID; if pointer still inside, continue its hover state. Clear both on owner change/unmount.
4. **Source updates** — Remove the `.context-measurement-accepted .context-segment` width transition (context-inspector.css:10). Every source update renders exact validated absolute values, proportions, unknown fields and partial-breakdown copy together. During compaction hold last valid reported counts until fresh valid data. Restore unknown state on thread/session ownership change, revoked evidence, or explicit invalid source report. No predicted freed count. Keep existing pending/failed/cancelled copy and command gates.
5. **Receipt acknowledgment** — Only a new matching accepted receipt from `acceptedCompaction` triggers one local 160 ms footer opacity/color acknowledgment. Key by receipt ID per owned run/session; establish the initial ID as baseline so reopening never replays. Keep all ID/run/session/epoch checks and numeric reconciliation for `Freed N`. Shorten the existing 600 ms local receipt flag timer to 160 ms; no minimum busy dwell. Reduced/off ends motion and suppresses shimmer/entrance/receipt travel. Do not modify shared Popover.

**Browser acceptance (exact tests):**
- New `six reported categories fit intrinsically and long evidence stays within the viewport` in usage-context.spec.ts: `update(page,'categories')` (6000/10000, six categories) → click `Inspect context`; at 1440×1000 and 390×844 assert `.context-inspector-body.clientHeight` vs inner natural height diff ≤2 CSS px, no vertical clipping; at 390×300 `request-compaction-many` → Compaction tab → open Retained constraint references → `Show 2 more references`; assert `scrollHeight > clientHeight`, shell fits viewport margin, footer fully visible while body scrollTop changes.
- Rename/extend `reported categories reveal token/share/subitems on focus after dwell; IME and nested Escape work` → `reported categories open immediately on focus and after dwell on first pointer hover`: Playwright clock before navigation, freeze after fixture readiness; hover Tools & MCP, advance to 199 ms → tooltip absent; +1 ms → `500 tokens` and `Reported tool instructions` appear; hover adjacent Skills without leaving grid → immediate tooltip; move outside, keyboard-focus Tools & MCP, composing Escape then plain Escape then Escape again; keep existing nested-Escape/restored-focus assertions.
- In the accepted-receipt test use fixture actions `foreign`, `unmeasured`, `accepted`, `restart` for authority coverage; separate fresh fixture with `categories` + `accepted` twice, same ID `receipt-one` (before=8000, after=4000, window=10000): exactly one footer acknowledgment, never a width transition, `Freed 4K tokens` matches receipt data. Update `accepted transition uses reference timing…` test: replace asserted 600 ms segment animation / 0.6 s transition / 0.24 s footer with zero animated factual widths, exact first-frame proportions, 0.16 s footer. Keep `.context-measurement-accepted` marker for the 160 ms window (invalidating-a-receipt test still verifies immediate cancellation). Keep reduced-policy checks; run context-compact smoke unchanged.
- Run commands: `pnpm exec playwright test --config tests/e2e/usage-context.playwright.config.ts tests/e2e/usage-context.spec.ts --grep 'categories|segments|receipt|accepted transition|pending sweep|category|six reported'`; `pnpm exec playwright test --config tests/e2e/frontend-refinement.playwright.config.ts tests/e2e/context-compact.spec.ts`; `pnpm exec playwright test --config playwright.config.ts tests/e2e/operational-motion.spec.ts --grep 'context|token decrease'`.

### EXECUTION_DAG
- T29 — UI29 implement per DESIGN items 1–5; deps: worker's current HEAD `c6fdab19`. Done-when: the three acceptance commands pass + typecheck/lint green.
- T-RECORD — Record the 8 MP4s from the exact branch SHA in a separate capture worktree (full recipe in canonical plan §"Record the review videos": `local-w3-catalog.ts` on port 6213 for the 7 catalog scenes, `local-w3-host.ts` on port 6283 for context-inspector; 500 ms pre-publication hold, chapter actions per film, 900 ms final hold; packaging `PYFILMS` script enforces H.264/1920×1080/30 + SHA-256 + manifest). Done-when: `videos/` + `manifest.json` + `review.md` exist, all 8 decode to EOF.
- T-PR — `pnpm typecheck` && `pnpm lint` && `git diff --check`; stage only listed source/test paths; commit; push `refine/forms-charts-motion`; open PR with changed paths, check results, video links, any unmeasured/skipped items. Done-when: PR exists, CI queued.
- T-COMPLETE — CI green + review + merge; post-merge re-verify of a sample spec on main; completion checkpoint with branch/base/result SHAs, counts, video links. Deps: T-PR.
- Ordering: T29 → T-PR commit/push → T-RECORD (from the pushed SHA) → T-COMPLETE. (Recording may start once the final commit exists; per plan, record videos from the exact committed SHA.)

### VALIDATION
- Executed during planning: checkpoint history read (T13–T26 verified with per-suite pass counts); baseline files exist and contain the spec'd defects (`.context-measurement-accepted` width transition present at context-inspector.css:10; branch unpushed confirmed via `git ls-remote`).
- Planned: §29's three Playwright commands; full typecheck/lint/diff-check; `ffprobe -show_streams -show_format -of json` per film (codec h264, 1920×1080, avg_frame_rate 30); `ffmpeg -v error -xerror -i` decode; watch each film once; per-film chapters present in manifest.
- Acceptance matrix: every §29 browser case green; 8 films validate; PR merged with evidence posted; HANDOFF_COMPLETE only after branch is pushed.

### STATE
- Done (per worker checkpoints): T13 ui13 tests, T14 editable table, T15 Split+ParameterControls @17507a01 (39/39), T22 disclosure @f082392e (6/6), T23 migration tables (op-motion), T24 charts @9e2db649 (21/21), T26 delivery preferences @c6fdab19 (16 pass/2 skip).
- Remaining: T29, T-RECORD, T-PR, T-COMPLETE.
- Blocker: the worker's branch is unpushed — if its session is dead, a new worker must either get the pushed branch or re-implement T13–T26 (context preserved in checkpoints + canonical plan); first action is `git push` by the current worker.
- Next step: T29 (devin-cloud-636f3f released; reassignment required before implementation).

### REFERENCES
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1115 (PLAN PART 1/2 + 2/2 comments = complete canonical plan; checkpoints 001–007)
- Pinned plan file: https://github.com/skytuhua-org/Gen-V1/blob/fb0694b911d46afb837bc3dd6e43c5742b450a18/docs/agent-plans/worker-3-forms-charts-motion.md
- Baseline `26ddf4d1`; latest reported HEAD `c6fdab19` on `refine/forms-charts-motion` (unpushed).


<!-- END PRESERVED ISSUE 1115 -->
