# Bluma component adoption review and execution program

## META

| Field | Value |
| --- | --- |
| Repository / canonical issue | `skytuhua-org/Gen-V1` / [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212) |
| Revision / date | `BLUMA-R1` / 2026-11-25 |
| Verified research baseline | `main@96ca4c3bd0664fca53775fbe31915c209641986c` |
| Planning branch | `docs/bluma-component-adoption-plans` |
| Scope | Reference review, source/overlap analysis, complete executable issue plans and versioned Markdown |
| State | Research complete; publication complete only after body/source readback; product implementation `NOT_STARTED` |
| Publication owner | `codex-cloud-bluma-bd935d`, planning only; final RELEASE in this issue journal |
| Provenance | Live Bluma previews/terms/MCP; pinned repository rules, design, source/tests; existing issue bodies, journals and linked PR patches |

## OBJECTIVE

Improve Gen-V1 using Bluma's strongest patterns: anchored menus, stable action feedback, coherent attachment changes, selected-tab movement, expanding answers and local edit-state clarity. Use these patterns as extensively as useful within actual workflows, through existing primitives and active work.

The review opened 22 component previews and exercised representative controls. Gen-V1 already has substantial state-preserving motion, overlays, composer behavior and task surfaces. Several improvements absent from main are present in open PRs. This program adds two scoped implementation issues and four complete supplements to existing issues, coordinated by this parent.

This revision replaces research plan `BLUMA-R0`. Research tasks T01-T03 are complete. T04 publication is complete only after exact issue/file comparisons and immutable source links are recorded. Implementation tasks T05-T08 remain unstarted.

## REQUIREMENTS

| ID | Program requirement |
| --- | --- |
| R01 | Every adopted reference has live observations, verified Gen-V1 consumers and explicit observed-versus-proposed behavior. |
| R02 | Reuse matching issues; preserve earlier plans, continuation comments, PRs and owners. Elapsed time does not release a claim. |
| R03 | Preserve neutral compact design, visible labels, immediate input/Send/Stop, keyboard/IME, focus, drafts, scroll, persistence and action/approval boundaries. |
| R04 | Reuse tokens and System/Reduced/Off. Fix effective-token double scaling before final dependent timing acceptance. No routine bounce, editable-text blur, idle decoration, fake waits or unbounded stagger. |
| R05 | Adapt existing architecture by default. Third-party source is optional and requires actual file/license/provenance review. No login, purchase, MCP or new library is needed for the proposed work. |
| R06 | Status is factual: command acceptance is not Saved; messages are not verified run steps; resource grants are not measured uploads. No fabricated progress, elapsed time, success or Undo. |
| R07 | Publish full plans in issue bodies, appropriate labels and identical UTF-8 Markdown in a focused docs PR. Read back every body and pinned source before reporting completion. |
| R08 | Use bounded owned tracks with precise dependencies and positive/negative acceptance. Comparable before/after evidence uses fixed SHAs/data; videos are 1920x1080/30fps without added titles or overlays. |
| R09 | Distinguish source findings from runtime tests, synthetic fixtures from native/live verification, and planning from implementation/merge acceptance. |

This session changes plans only. It does not purchase access, acquire gated source, install a framework, implement product changes or merge existing work.

## REPO_MAP

| Existing source | Verified role / implication |
| --- | --- |
| `AGENTS.md`, `CONTRIBUTING.md`, `DESIGN.md` | Full files read: publication/claim rules, scoped PRs/source manifest, neutral compact design and motion/accessibility. |
| `packages/ui-shell/Popover.tsx`, `ActionMenu.tsx`, `Select.tsx`, `Tooltip.tsx`, `Toast.tsx` | Shared semantic/portal/focus/lifecycle owners already exist. Extend canonical work. |
| `packages/ui-shell/Feedback.tsx`, `feedback.css`, `tokens.css`, `controls.css` | Existing feedback, timing and control styling; avoid a second vocabulary or library. |
| `apps/web/src/useAppearance.ts`, `motion-policy.ts`, `task-motion.tsx`, `motion-spring.ts` | Effective duration producer/consumer discrepancy; keep existing policy/lifecycle/spring responsibilities. |
| `apps/web/src/ComposerView.tsx`, `ComposerToolbar.tsx`, `ComposerAttachments.tsx`, `composer-entry.css` | Editor/action/resource owners. #1203 already implements several main-branch gaps. |
| `apps/web/src/ConversationFind.tsx`, `SavedDrafts.tsx`, `WorkActivity.tsx` | Search/draft/activity consumers. Activity receives messages, not verified step/time data; delete Undo lacks a proven baseline contract. |
| `apps/web/src/registry.tsx` | Visited tab panels and generated Button/Form actions. #1115 and #2141 edits require coordination. |
| `apps/web/src/TaskDisclosure.tsx`, `InteractionTools.tsx`, `PlanningQuestion.tsx` | Branching answers, typed explicit record edits and separate explicit-Continue planning choices. |
| `apps/web/src/Artifact.tsx`, `ArtifactPresentation.tsx`, `task-context.ts` | Action, persisted state and presentation boundaries. Visual changes do not move authority. |
| `apps/web/src/PlanStatus.tsx`, `TaskTable.tsx`, `ViewSkeletons.tsx`, `CopyButton.tsx` | Existing source-driven plans, bounded table motion, matching loading structure and copy behavior. Verify or route existing work. |
| `tests/e2e`, `scripts/browser-suites.ts`, `scripts/capture-ui`, `scripts/record-task-design.ts`, `scripts/task-design-scenes.ts` | Existing real-component fixtures, registered suites and evidence tooling. Child plans specify paths/commands. |

## DESIGN

### Component decisions

Access labels are observations on 2026-11-25. The visible catalog changed from 58 to 57 entries during review while showing 27 free. Use identities and dates, not a timeless catalog count. Each URL below was opened; this does not claim exhaustive testing of every mode.

| Bluma component | Observed behavior / access | Decision and Gen-V1 route |
| --- | --- | --- |
| [Popover Menu](https://bluma.design/c/popover) | Trigger grows menu, rows arrive; Free. Menu opened. | **Adapt #1186:** anchored nonsemantic surface and bounded rows, same semantic owner. |
| [Select](https://bluma.design/c/select) | Anchored current value and expanding choices; Free. | **Adapt #1186:** committed label, form/keyboard/reset behavior and restrained selected mark. |
| [Action Button](https://bluma.design/c/action) | Save/Saving/Saved, failure/retry, changing letters move; Free. Pending exercised. | **Adapt #2141:** stable label/indicator footprint and truthful request acknowledgment; no per-letter accessible text. |
| [Copy Button](https://bluma.design/c/copy) | Copy/Copied swap, shimmer, error variant; Free. Source account-gated. | **Route #1604/#1693:** actual clipboard result/async text semantics; no duplicate in #2141. |
| [Chat Composer](https://bluma.design/c/chat) | Multiline growth, send transition, simulated reply; Pro. Multiline exercised. | **Adapt #1188:** surrounding continuity; retain textarea/caret/IME and omit flying editable text/fake replies. |
| [File Drop](https://bluma.design/c/filedrop) | Expanding dropzone, file rows, simulated progress; Pro. | **Adapt #1188:** real resource-grant band/chips; no upload percentage without transfer data. |
| [Tab Bar](https://bluma.design/c/tabbar) | Selected label expands, other icons tuck, indicator moves; Free. Selection exercised. | **Adapt #1115:** retain all labels/panels; pointer-only restrained indicator with existing immediate keyboard/restore behavior. |
| [Segmented Control](https://bluma.design/c/segmented) | Leading/trailing indicator stretch; Free. | **Adapt #1115:** neutral 140ms pointer selection, unscaled text, immediate state. |
| [Accordion](https://bluma.design/c/accordion) | Row makes space, answer settles; Free. | **Adapt/verify #1115:** existing measured disclosure and retained branches. |
| [Follow-up Questions](https://bluma.design/c/askflow) | One question, prior-answer chips, custom/multiple paths; Pro. Advance/retained chip exercised. | **Adapt continuity #1115:** preserve visible branching exploration, explicit submission and real pending state. |
| [Inline Table](https://bluma.design/c/itable) | In-place editor/status tray; Pro. Cell editor entered. | **Verify/refine #1115 UI14:** typed controls, source/draft comparison and explicit Review changes. No inferred Saved. |
| [Agent Run](https://bluma.design/c/agentrun) | Compact latest-step/elapsed pill, expanded log, demo approval/stopped/failed; Pro. Log expanded. | **Conditional #1188/#1811:** compact activity/history only. Defer step/time/progress without authoritative source. |
| [Steps](https://bluma.design/c/steps) | Current label, prior checks, future steps, completion; Pro. | **Verify PlanStatus:** actual validated vertical plan. No duplicate tracker or fabricated completion. |
| [Status Pill](https://bluma.design/c/status) | Sync count/ring, retry/success; Free. | **Verify #1191:** source-driven local change, no animated factual count. |
| [Toast](https://bluma.design/c/toast) | Dot expands, repeated count, Undo presentation; Free. | **Verify #1191/#1976:** preserve lifecycle/focus pause and legitimate action. #2011 pending. |
| [Progress Button](https://bluma.design/c/progress) | Progress capsule, cancel, complete/Open; Free. | **Defer:** requires actual measurable transfer. Existing action feedback for unmeasured work. |
| [Skeleton List](https://bluma.design/c/skeleton) | Matching placeholders, shimmer/blur, retry; Pro. | **Verify #1191:** keep matching structure; omit blur and artificial reveal waits. |
| [Switch + Disclosure](https://bluma.design/c/switch) | Toggle reveals dependent options/count; Free. | **Verify settings/disclosure:** only real dependent controls, retain stored values. |
| [Kanban Board](https://bluma.design/c/kanban) | Drag gap/lean, counts, Done acknowledgment; Pro. | **Defer choreography:** existing WorkflowBoard/#1811 own work. Direct drag; lane move is not proof of completion. |
| [Expanding Search](https://bluma.design/c/search) | Trigger to input/results, matches/keyboard; Free. | **Adapt bounded #1188:** discoverable ConversationFind with retained query and actual matches. |
| [Undo Window](https://bluma.design/c/undo) | Delete becomes timed undo/restores demo files; Free. Replay exercised. | **Conditional #1188 M5:** no Undo affordance until real deletion restoration contract is agreed. Preserve unresolved prior requirement. |
| [Dash Tabs](https://bluma.design/c/dashtabs) | Dust, speed lines, leaning text/glyphs; Pro. | **Reject:** conflicts with neutral compact design and restrained legible motion. |

Other catalog groups were inventoried but not promoted merely because they looked polished. Payment, invite, voice, orb and hold controls require an actual workflow/authority contract. Stop remains immediate.

### Concrete gaps and decisions

**Timing:** `applyAppearance` produces panel-enter as `220 / speed`; `animateTask` divides the effective token again. At supported speed 1.25, CSS derives 176ms while the imperative path derives 140.8ms; at 0.75 they derive about 293.33ms and 391.11ms. These are source calculations, not runtime measurements. Three tests encode the second division for overrides. The focused issue fixes duration resolution and real-preference regressions without retuning springs or changing policy lifecycle.

**Controls:** #1195/#1199 already implement popover contracts. The supplement adds origin/value continuity for ActionMenu/Select, .95 on the nonsemantic surface only, unscaled text and no bouncing marker. Preserve merged #2007 current-form reset, #1948 Tab behavior and coordinated #1420 input-origin work. Do not replace newer files with old PR versions.

**Composer:** #1203 already implements several absent-on-main improvements including attachment row, send/stop swap and scroll indicator. Rebase/finish/review that candidate. Rev-2 find/activity/draft rows need separate verification. Resource grants are not uploads; a visual Undo demo does not establish persistence support.

**Actions:** #2141 already owns missing form feedback. Request acceptance may precede approval/execution, so use Request submitted at that boundary. Saved requires actual persisted success. Preserve optional choices and add a distinct required fixture for validation. Copy behavior stays under #1604/#1693.

**Task surfaces:** #1115/#1152/#1254 and #1811 own tabs/forms/disclosures/records. Retain full labels, visited panels, draft identity and explicit record submission. Later acceptance-r2 requires indicator motion only for genuine pointer changes; keyboard/AT, identical selection, restore, resize and wrapped rows settle immediately. Verify suitable existing implementations rather than rewrite them for superficial similarity.

### Architecture and source

Retain React/plain CSS, UI-shell primitives, `animateTask`, `MotionRegion` and current authoritative surfaces. Use existing 180/140ms popover, 220/180ms panel, 140ms tab, 180/140ms item and 80ms press tokens with bounded stagger. Effective tokens scale once at the producer; raw durations scale once at fallback. Reduced removes new spatial/stagger/shimmer effects, any new opacity effect at most 80ms; Off creates none. Preserve existing active-effect settlement semantics documented by the timing plan. Actions do not wait for animation.

[Bluma terms](https://bluma.design/terms), dated 2026-10-15, discuss components built for customers. [MCP documentation](https://bluma.design/mcp) describes account-dependent access and minified delivered files. No source was acquired. Initial work uses independent adaptation within existing owners. Authorized source can be considered after actual file/permission/dependency/maintainability review. Preview access or a Free label does not establish redistribution rights.

Additional primary references reviewed: [Base UI Tabs](https://base-ui.com/react/components/tabs), [Motion accessibility](https://motion.dev/docs/react-accessibility), [Animate UI Tabs](https://animate-ui.com/docs/primitives/base-ui/tabs). No dependency is selected. Animate UI's inspected [license](https://github.com/imskyleen/animate-ui/blob/main/LICENSE.md) includes a Commons Clause condition, so it is not described as plain MIT.

### Issue map and order

| Track | Canonical issue | Deliverable / dependency |
| --- | --- | --- |
| Program | [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212) | Review, issue map, ownership and acceptance coordination. |
| Provenance/evidence | [#2213](https://github.com/skytuhua-org/Gen-V1/issues/2213) | Source disposition and reused comparable fixtures. Baseline work after capture-owner reconciliation. |
| Duration consistency | [#2214](https://github.com/skytuhua-org/Gen-V1/issues/2214) | Correct double scaling/tests; coordinate #1192/#1546 and #1115/#1811 shared-file ownership. |
| Controls | [#1186](https://github.com/skytuhua-org/Gen-V1/issues/1186) | Full supplement to #1195/#1199; coordinate #1420, preserve #2007. |
| Composer | [#1188](https://github.com/skytuhua-org/Gen-V1/issues/1188) | Full supplement; retained owner/#1203; no fake Upload/Undo. |
| Tabs/disclosures/records | [#1115](https://github.com/skytuhua-org/Gen-V1/issues/1115) | Full supplement to #1152/#1254, preserving original and acceptance-r2 plans and #1811. |
| Action feedback | [#2141](https://github.com/skytuhua-org/Gen-V1/issues/2141) | Full supplement: truthful acknowledgment, stable geometry, required-choice validation. |

Prepare reference baselines and timing first. Controls and composer can progress independently after ownership agreement. Tabs and actions share `registry.tsx`, requiring sequenced edits or an explicit split. Final timing checks follow the fix; comparison evidence uses frozen integrated candidates. Original broad/native/live acceptance remains separate.

### Dated overlap/ownership ledger

Every implementer refreshes journals/full heads before code. An open PR is not merged acceptance; a reviewer's release does not release another worker.

| Existing work | Observed state / handling |
| --- | --- |
| #1182/#1186, #1195/#1199 | Canonical motion/control work open; compare both candidates. Inspected original owner/reviewers released; refresh later claims. |
| #1187/#1196, #1188/#1203, #1189/#1200 | Open sidebar/composer/chrome. `devin-a-cloud-f4e3b6` retains scope. #1203 head `c7428df080bef4d520c067a59aca28847d0dbb97`. No takeover. |
| #1190/#1194 | Open window work; refresh ambiguous ownership. No duplicate window issue. |
| #1191/#1204 | Open lists/status/settings; #1202 closed unmerged/consolidated. Reuse for status/toast/skeleton. |
| #1192/#1546 | Open token sweep at `ad0e2604e5a10ae5ec6bc7682b31455a0150a1c7`; original `devin-t3local-7db967` claim has no observed explicit release. Later timeout takeover does not release it. |
| #1302/#1420 | Open refinement at `cd8ea7d55d4d4b89f88675f4d5e888686754371a`; inspected release. Reuse input-origin/focus work, refresh claims. |
| #1303/#1454 | Open decorative refinement; maintainer excludes backgrounds/grain/tints. Preserve functional status colors. |
| #1976/#2007/#2011 | #2007 merged reset/tooltip/palette fixes; #2011 follow-up open. Preserve current fixes and pending toast focus work. |
| #1970/#2015 | Open schema consistency. No new freeform animation props or changed tab-label contract. |
| #1115/#1152/#1254 | Existing task stack open. Older body status is historical; original and acceptance-r2 plans remain authoritative for their scope. |
| #1811 | Integrated 29-interface/24-trial acceptance open with partial failures/pending work. Keep Worker-1 film handoff and Worker-3 integration gates distinct. |
| #2141 | Existing form-feedback issue, explicit release observed; no linked implementation PR returned in search. Reuse with complete corrected plan. |
| #1604/#1693 | Async copy/patch-export candidate open at `518bc388167640fd02675be8239946824e20c677`. Keep its scope separate. |
| #2085/#2094, #2204, #2211 | Existing model-picker exit, sidebar reduced states and notes entrances; no duplicate work. |

## EXECUTION_DAG

### T01: Review the reference

Inputs/prerequisite: user request/public site. Owner: coordinator plus read-only researcher. Actions: inventory, open previews, exercise representative states, inspect terms/MCP/primary alternatives. Output: decision matrix/source limits. Positive: actual URLs/observations; negative: no source/license/runtime claim from a preview. Done: completed in this review. Handoff T02/T03.

### T02: Compare source and tests

Inputs: T01, pinned main and full rules/design. Owner: read-only source worker. Actions: inspect components, state/authority/motion boundaries and registered checks; distinguish main from pending candidates. Output: REPO_MAP, timing discrepancy, preservation contracts. Positive: source-confirmed gap; negative: no invented existing path/API or already-implemented capability called absent. Done: completed as inspection, no runtime tests. Handoff T03/T04.

### T03: Reconcile overlap

Inputs: source map and distinctive searches. Owner: read-only issue worker. Actions: read full bodies/comments/PRs and claims; record reuse/supplement/new decisions and labels. Output: seven-issue program/ownership ledger. Positive: #2141 found and reused; negative: no duplicate or timeout takeover/lost plan. Done: completed as dated observation. Handoff T04; refresh in T05.

### T04: Publish plans and identical sources

Inputs: T01-T03, independent review and real UTF-8 files. Owner: `codex-cloud-bluma-bd935d`, docs/publication only. Files: seven `docs/agent-plans/bluma-*.md` sources. Steps: claim exact planning amendment scope; refresh old bodies; prepend supplements with explicit precedence and retain earlier bodies unchanged; create two child issues; update parent; apply existing labels; commit identical Markdown and open focused docs PR. Connector attachments are unavailable, so use versioned-file fallback. Add immutable source metadata outside a marked canonical-plan block and read every issue/file back; the complete block must equal its Markdown file byte-for-byte. Append change/checkpoint comments. If new comment creation fails, retain its exact failure and append status to the existing parent journal without removing earlier text; put each amendment/source link in its issue publication header.

Positive tests: full required sections/mappings, exact canonical-plan block/source equality and actual labels/links. Negative: no truncated body, unresolved placeholder, overwritten concurrent change, false attachment/test claim or product edits. Output: complete reviewable publication. Done only when equality and final RELEASE OWNER=NONE are recorded. Handoff T05; no implementation ownership is transferred from other workers.

### T05: Reconcile owners and establish the foundation

Inputs: T04/current main/journals/candidates. Owners: explicitly claimed coordinator and bounded reference/timing workers. Steps: refresh SHAs/claims, get acknowledged nonoverlapping allocations, record candidate coverage, execute reference T01/T02 plus baseline capture, and the timing DAG. Reference T03 candidate comparisons and T04 final review wait until parent T07, after component candidates exist. Do not infer allocation from silence/age. Outputs: owned tracks, baseline and verified timing correction.

Positive: current ledger and real-preference checks. Negative: no duplicate patch/double scaling/false source status/lost main fix. Done: necessary ownership and foundation accepted. Handoff exact dependency SHAs to T06. Unavailable owners block their editing slice, not independent evidence work.

### T06: Integrate component tracks

Inputs: T05 owned scopes/dependencies. Owners: canonical #1186/#1188/#1115/#2141 workers. Steps: follow each full DAG, reuse candidates and fill evidenced gaps; coordinate registry/token/manifest edits. Outputs: focused candidates. Positive: improved continuity with stable input/state; negative: no text distortion, fake progress/success, delayed Stop, hidden invalid field or restore replay. Done: child acceptance passes on candidate with original remaining work explicit. Handoff frozen SHAs to T07.

### T07: Compare integrated quality

Inputs: T06 frozen candidates/matched baseline. Owner: independent reviewer/evidence worker; no edits during capture. Steps: scoped tests, paired videos, normal/Reduced/Off, supported speeds, interruptions, keyboard/IME, long labels, narrow/short and zoom. Manifest carries SHAs/data/settings/steps/hashes. Preserve #1115/#1811 original recordings and native/live gates.

Positive: visual improvement without functional regression. Negative: fixtures cannot approve Windows packaging, display DPI or live-provider effects. Output: track verdicts/failures/skips and retrievable evidence. Done: applicable gates accepted. Handoff T08.

### T08: Integrate and release

Inputs: T07 review and authorized repository process. Owner: implementation coordinator/maintainer. Steps: honor CI/reviews; verify resulting main SHA and focused regressions; update full bodies/files together; append lossless RELEASE and clear own markers. No broader issue closes while original requirements remain.

Positive: exact integrated evidence and preserved obligations. Negative: local pass/ready PR/queued CI is not merged completion. Done: accepted tracks with released ownership, otherwise HANDOFF_PENDING with exact next role/action. Parent implementation completion is separate from issue publication.

## VALIDATION

| Acceptance | Requirements / tasks | Required evidence |
| --- | --- | --- |
| A01 | R01,R05 / T01,T02 | Exact references, observed/proposed matrix, source limits and actual source map. |
| A02 | R02 / T03-T05 | Existing plans/comments/PRs read, canonical routes, preserved histories and acknowledged editing ownership. |
| A03 | R07,R09 / T04 | Seven full plan sources, labels, docs PR, immutable links, exact published equality and planning RELEASE. |
| A04 | R04,R09 / T05 | Real 0.75/1/1.25 preference reproduction/fix, corrected override tests, preserved policy/lifecycle. |
| A05 | R03,R04,R06 / T06 | Full child acceptance, immediate actions, focus/draft/identity/IME, truthful source/request status. |
| A06 | R03,R08,R09 / T07 | Comparable clips/scoped tests, Reduced/Off/interruption/layout checks; native/live limits explicit. |
| A07 | R02,R07-R09 / T08 | Review/CI, actual integration verification, current full plans, released owners and retained broader scope. |

Planning checks: all files/sections/IDs, existing paths, preserved old bytes, `git diff --check`, tracked `pnpm check:docs-links`, GitHub source/body readback. Actual results go in checkpoints/PR. No application install is needed to validate documentation publication.

Later implementation uses pinned setup and focused child commands. Existing guards/CI remain. `capture:ui` is Linux-only because of safe directory-descriptor handling; use the existing supported recording route for Windows. Browser zoom is not physical-DPI verification. Run broader suites only for a concrete risk or repository gate.

Executed in this review: live reference interactions, primary alternatives, source/tests inspection, issue/comment/PR review and document checks. Application unit/browser/build/Windows tests and Gen-V1 before/after videos: NOT_RUN. The docs PR contains plans only.

## STATE

T01-T03 complete as research. T04 publication/readback status and exact docs SHA are in checkpoints. T05-T08 NOT_STARTED. Product files changed, source acquired and dependencies installed: none.

Known constraints: older unreleased claims, multiple control candidates, registry overlap, source semantics and incomplete original acceptance. Next implementation step: T05, then each canonical DAG. Planning RELEASE never clears someone else's product claim.

## REFERENCES

- [Inspected repository](https://github.com/skytuhua-org/Gen-V1/tree/96ca4c3bd0664fca53775fbe31915c209641986c)
- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/AGENTS.md), [DESIGN](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/DESIGN.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/CONTRIBUTING.md)
- [Bluma](https://bluma.design/), [terms](https://bluma.design/terms), [MCP](https://bluma.design/mcp); component links in matrix
- [Original motion #1182](https://github.com/skytuhua-org/Gen-V1/issues/1182), [integrated acceptance #1811](https://github.com/skytuhua-org/Gen-V1/issues/1811)
- [Original Worker-3 plan](https://github.com/skytuhua-org/Gen-V1/blob/fb0694b911d46afb837bc3dd6e43c5742b450a18/docs/agent-plans/worker-3-forms-charts-shared-motion.md), [later acceptance-r2](https://github.com/skytuhua-org/Gen-V1/blob/8ad7387890cef5f52aeb925fc278ff53f78ac93c/docs/agent-plans/worker-3-forms-charts-shared-motion-acceptance-r2.md)
