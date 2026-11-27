# AI harness component libraries: selective reuse and adoption gates

## META

`skytuhua-org/Gen-V1`; `AI-HARNESS-LIBRARIES-R1`, 2026-11-25; parent [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Verified baseline `main@96ca4c3bd0664fca53775fbe31915c209641986c`; branch `docs/ai-harness-library-plans`. Planning/publication only, no implementation/install. Published commit/hash/PR/readback appear in issue metadata/journal.

Adds reusable LLM-component research; complete previous `FRONTEND-REFERENCES-R1` and Bluma predecessor remain verbatim below. Prior [source](https://github.com/skytuhua-org/Gen-V1/blob/0ccda0526baafe343bff33b72c7f103e600cc51e/docs/agent-plans/frontend-reference-continuity-program.md), SHA-256 `a7df98bc137bdb921f16ec496a3ab31d8a5a392cd21c454dd293ea6758dc5b07`. Earlier docs PRs #2215/#2221 remain separate; publication does not imply product acceptance.

## OBJECTIVE

Reuse rendering work where Gen lacks a useful capability. Establish a real improvement against the current application using identical source, hardware, viewport, input method and motion policy. A polished demo or upstream speed claim does not establish superiority. Three bounded tracks are selected; a documented rejection is a valid trial disposition, not successful feature implementation.

| Track | Source-confirmed gap and reuse decision | Complete execution plan |
| --- | --- | --- |
| Streaming Markdown | Incomplete terminal bold/code markers stay literal. Trial `remend`1.5.1 for a narrow display projection; full Streamdown is only a measured alternative. | [Streaming adapter](https://github.com/skytuhua-org/Gen-V1/issues/2228) |
| Math | No math renderer exists. Use direct pinned KaTeX0.19.1 behind a bounded Gen leaf with local assets and accessible output. | [Math rendering](https://github.com/skytuhua-org/Gen-V1/issues/2229) |
| Diagrams | All fences render as escaped code. Trial `beautiful-mermaid`1.1.3 for a fully validated flowchart subset, preserving raw source for unsupported/uncertain input. | [Flowchart rendering](https://github.com/skytuhua-org/Gen-V1/issues/2230) |

## REQUIREMENTS

| ID | Requirement | Tasks/checks |
| --- | --- | --- |
| YR01 | Current primary docs, exact source/version/license pins and actual dependency boundaries; separate inspection, external demos and Gen measurements. | Y01,Y04 / YA01 |
| YR02 | Compare real source and existing issue outcomes; preserve implementation owners. | Y02,Y03 / YA02 |
| YR03 | Local leaf adapters preserve runtime, permission/revision authority, schemas, drafts, source identity, copy and recovery. | Y04-Y06 / YA03,YA05 |
| YR04 | Preserve compact neutral styling, keyboard/selection/scroll, Reduced/Off, rendering bounds and offline/native behavior. | Y04-Y06 / YA04,YA05 |
| YR05 | Each candidate must improve named useful fixtures and pass compatibility, safety and performance gates before adoption; reject excessive or unsuccessful integration. | Y05,Y06 / YA04,YA05 |
| YR06 | Full executable issue bodies and identical UTF-8 Markdown, pinned links, normal PR review, exact readback and preserved prior requirements. | Y04 / YA06 |

No wholesale chat framework, hosted runtime, AI SDK, Tailwind, Shiki, account or gallery CLI installation is approved. Existing [#1530](https://github.com/skytuhua-org/Gen-V1/issues/1530)/[#1549](https://github.com/skytuhua-org/Gen-V1/pull/1549) owns Lezer highlighting. Libraries provide rendering, not invented reasoning/progress, citation authority, approval success or retry permission. Motion uses Gen's current policy; no upstream pulse/shimmer or separate modal stack is needed.

## REPO_MAP

Baseline `apps/web/src/Markdown.tsx` owns safe block/inline rendering, table bounds and code copy. `SentenceReveal.tsx` owns reveal behavior. `App.tsx`/`api.ts` connect browser events and desktop snapshot invalidation. `WorkActivity.tsx` groups actual messages. `SourceSelectionActions.tsx`/`SourceWorkbench.tsx` preserve source/owner authority; existing `packages/ui-shell/Modal.tsx` and web `CopyButton.tsx` provide controls. Each child verifies exact files, contracts, fixtures and proposed new paths.

Outcome boundaries: [#1960](https://github.com/skytuhua-org/Gen-V1/issues/1960)/[#2030](https://github.com/skytuhua-org/Gen-V1/pull/2030) handles server SSE buffering/serialization, not syntax. [#1583](https://github.com/skytuhua-org/Gen-V1/issues/1583)/[#1632](https://github.com/skytuhua-org/Gen-V1/pull/1632) scopes Files MarkdownPolicy/local images, explicitly excluding a new engine/Mermaid while preserving default chat. [#2218](https://github.com/skytuhua-org/Gen-V1/issues/2218) owns reading continuity. Existing #2141/#1115/#1186/#1188 retain action/form/control/composer work. Refresh heads and claims before editing; a released planning claim does not release another product owner.

## DESIGN

Inspected pins are repository snapshots, not claims about latest npm releases.

| Library / exact source pin | Disposition and evidence |
| --- | --- |
| Streamdown2.8.1/remend1.5.1 `4e86b0403b685e5eda142314bb2048a4646219db` | Narrow remend trial. Full defaults exceed Gen's parser/plugin/URL policy; `isAnimating` does not disable healing. Never repair/trim canonical text. |
| shadcn/ui AI Elements | Current copyable patterns. Original Vercel library announces end-November2026 deprecation; no retiring-library install or duplicate trace/composer issue. |
| assistant-ui React0.15.38 `4797ce5da22845dfa0c0d2cbd115f8e6fe42d2a2` | Standalone Elements differ from `.aui` adapters. Diagram trial retained; inspected diff/tool/form/JSON leaves lack required Gen authority, recovery, bounds or accessibility. |
| Prompt Kit site0.1.0 `5a9496635cc0e1bf7679fe2a9e35d9b36b99c08a` | No adoption: Shiki effect lacks stale/error guards; sources request favicons; JSX preview lacks Gen's execution boundary. |
| Tambo React1.4.0/base0.1.12 `6e2c1bff3b68a00c094b6d876788cc8f33f7bb02` | Context-coupled tools and different elicitation, including auto-submit, do not improve Gen's draft/revision/schema handling. |
| CopilotKit core/UI1.90.2 `7f7ba6ff6d1efa0ce83c74c2e28a4d11969daf00` | Current `react-core/v2` UI requires provider/runtime migration disproportionate to leaf reuse. |
| KaTeX0.19.1 `8000fbd4e29cca2c0cb1e88b745af3ed2f436b66` | Direct engine selected over Streamdown math1.0.4's older range/limited option forwarding. |
| beautiful-mermaid1.1.3 `65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b` | Conditional flowchart trial. Six upstream families do not imply six Gen families. Async wrapper is synchronous; font imports and silently omitted syntax require explicit gates. |

Four UI collections' root licenses are MIT; transitive notices differ. Inspected elkjs0.11.0 is EPL-2.0, entities7.0.1 BSD-2-Clause; KaTeX fonts have separate notices. Apply distribution obligations, not an all-MIT assumption or automatic rejection.

Use exact-pinned, bounded local adapters with readable-source failure and rollback. Original text remains authoritative for storage/copy/search/export/references. Rich output executes nothing and requests no external resource. Optional code loads on use; table/link/image/Files policies remain.

Desktop `onWorkspaceChanged` invalidates snapshots instead of delivering browser SSE. A browser-only delta map cannot establish native per-message lifecycle. Prove authoritative metadata on both paths or decline/defer; never infer it from motion or parent-run status. Any minimal metadata extension must specify writers/readers/tests before implementation, without a runtime migration.

Lazy DOM changes require source-selection eligibility invalidation even when text is unchanged. Never invent math/SVG source offsets. Leaves can be prepared independently, but one acknowledged integrator serializes shared Markdown/tests/package/lock/notices/manifest changes. Repair cannot consume math delimiters; open diagram fences remain code with no per-token layout. Earlier polish PRs are not blanket dependencies.

Run discovery in parallel; integrate the shared source-selection seam once under math T04, then reuse it. Math is the first adoption candidate. Streaming waits for native lifecycle proof; diagrams wait for completeness/usefulness and Worker gates. No failed candidate blocks the others.

## EXECUTION_DAG

Every product task is specified fully in its linked child; this parent owns selection, publication and coordination.

| ID | Goal, inputs/outputs, files and ownership | Prerequisites, tests, done-when and handoff |
| --- | --- | --- |
| Y01 | Library assessors read primary docs/licenses/source and live demos; output pinned evidence in program/children. | No dependency. Positive useful behavior; negative deprecated/coupled/unsafe defaults. Done when selection has evidence and limits; hand to Y02/Y04. |
| Y02 | Repo assessor reads actual rendering/source/control contracts and tests; output real gaps, retained strengths and file map. | Y01. Positive exact source evidence; negative no fabricated metadata. Done with reproducible fixtures; hand to Y03/Y04. |
| Y03 | Coordinator reads matching bodies/journals/PRs and refreshes claims; output distinct outcome/ownership allocation. | Y02. Positive distinct new scope; negative duplicate highlighting/control/approval work. Done with documented owners; hand to Y04. |
| Y04 | One drafter per child file; coordinator owns this file, manifest and publication. Write/audit full nine-section plans; create full bodies, identical sources and docs PR. | Y01-Y03. Positive requirement-task-check coverage and whole-byte readback; negative truncation/invented results/conflicts. Done at YA06; future receiver must ACK. |
| Y05 | Claimed child implementers execute T01 discovery and matched bounded trial; output evidence and adopt/reject decision. | Y04 plus ownership ACK. Positive useful capability improvement; negative malformed/large/stale/native failures. Done at child's gate; hand to shared integrator. |
| Y06 | Integrator serializes only passing candidates; output combined compatibility evidence, reviewed implementation and rollback. | Passing Y05, shared-file ACK. Positive all child/combined checks; negative browser-only wins, changed source, external requests, false diagrams or stale renders. Done after required CI/native/review acceptance; release claims. |

## VALIDATION

| Check | Acceptance and evidence |
| --- | --- |
| YA01 | Exact primary pins/licenses and evidence distinctions recorded. Research verified, no install/build. |
| YA02 | Each child has a real gap/distinct outcome. Source/issue review verified; refresh before edits. |
| YA03 | Canonical text/copy/source identity and authority survive adapters. Future child tests. |
| YA04 | Useful matched fixtures improve and bounds, accessibility, keyboard, Reduced/Off, recovery and declared bundle/latency gates pass. Future tests. |
| YA05 | Browser/Windows and combined tables/selection/highlighting/Files/scroll behavior pass. Future tests. |
| YA06 | Four complete sources/full bodies/pinned links, docs PR, whole-byte readback, source-only manifest delta and internal links pass. Verified in final journal. |

Executed research: primary/source/issue/license reads; Streamdown Static/Streaming terminal-marker, math and literal-currency demos; assistant-ui Default/Sequence/Streaming/Incomplete diagrams. Nonterminal unfinished bold stayed literal; no semantic-bold-tag claim. No Gen application tests, install, Windows run, performance benchmark or before/after recording occurred.

Publication checks: `git diff --cached --check`, `node scripts/check-doc-links.mjs`, section/coverage/manifest audits and complete issue/file readback at repo root. Product commands, fixtures, thresholds and regressions are in each complete child. Evidence is synthetic; future videos 1920x1080, without added titles/overlays.

## STATE

Y01-Y03 researched/reviewed; Y04 is complete only after coordinator publication verification. Y05-Y06 and child product tasks are NOT_STARTED. Drafting scopes: `codex-cloud-bluma-bd935d-tooltip-0580` streaming, `codex-cloud-anchor-dcd8eb` math, `codex-cloud-inbox-16eb92` diagrams, `codex-cloud-bluma-bd935d` program/publication. Latest accepted RELEASE/ACK controls current ownership.

Next implementer reads the entire child/program/journal, refreshes main/PRs, claims T01 and obtains shared-file allocation before reproducing baseline. Streaming lifecycle truth, math selection/local assets, and diagram completeness/worker/notices are explicit gates. No candidate ships from appearance alone. All prior requirements and unfinished acceptance below remain intact.

## REFERENCES

- [Streamdown](https://streamdown.ai/docs), [security defaults](https://streamdown.ai/docs/security), [playground](https://streamdown.ai/playground), [pinned source](https://github.com/vercel/streamdown/tree/4e86b0403b685e5eda142314bb2048a4646219db).
- [Current shadcn AI Elements](https://ui.shadcn.com/docs/ai-elements), [migration announcement](https://ui.shadcn.com/docs/changelog/2026-10-ai-elements).
- [assistant-ui Elements](https://www.assistant-ui.com/elements), [diagram leaf/docs](https://www.assistant-ui.com/elements/mermaid-diagram), [Prompt Kit source](https://github.com/ibelick/prompt-kit/tree/5a9496635cc0e1bf7679fe2a9e35d9b36b99c08a), [Tambo elicitation](https://docs.tambo.co/reference/react-ui-base/elicitation), [CopilotKit chat](https://docs.copilotkit.ai/prebuilt-components/chat) and [migration](https://docs.copilotkit.ai/migrate/v2).
- [KaTeX options](https://katex.org/docs/options), [security](https://katex.org/docs/security), [conditional advisory fixed0.18.2](https://github.com/KaTeX/KaTeX/security/advisories/GHSA-238p-pmpm-9mq7). It requires pre-existing prototype pollution/options control; this review establishes no Gen vulnerability. Child plans retain exact source/license pins and substantive findings.
- [Coordinator claim](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7169351635), [research allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7169518087).

## Prior accepted frontend program, preserved verbatim

# Frontend reference review: interaction and reading continuity

## META

| Field | Value |
| --- | --- |
| Repository / parent | `skytuhua-org/Gen-V1` / [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212) |
| Latest program revision / date | `FRONTEND-REFERENCES-R1` / 2026-11-25 |
| Verified baseline | `main@96ca4c3bd0664fca53775fbe31915c209641986c` |
| Documentation branch | `docs/frontend-continuity-plans`; plans only |
| Previous publication | `BLUMA-R1`, [PR #2215](https://github.com/skytuhua-org/Gen-V1/pull/2215), commit `cd5860c647507b4b28be51f640bfeae9d447d021`, still open/unmerged when checked |
| Source provenance | Primary design/engineering publications; previous live Bluma review; pinned Gen-V1 source/tests and current issue/PR journals |
| Implementation / runtime verification | `NOT_STARTED` / `NOT_RUN` for the new work |
| Planning owner | `codex-cloud-bluma-bd935d`; exact claims and final release are in the parent journal |

This is the complete latest parent program. The new requirements and tasks use `XR`, `X` and `XA` identifiers. The complete previous `BLUMA-R1` program is preserved below without changing its bytes. Its requirements, exclusions, child plans and implementation gates remain binding for their original scope. The earlier document's counts and publication status describe that earlier revision. This extension adds two distinct implementation plans and a complete supplement to #2155; it does not restart or replace the earlier seven plans.

## OBJECTIVE

Apply what makes Bluma and well-engineered product interfaces feel coherent: stable spatial relationships, immediate response to intent, readable density, truthful feedback and continuity after content changes. Further visual effects are valuable only when they help a real task.

The previous review already covered anchored menus, action feedback, composer attachments, tabs and disclosures. This extension identifies two remaining source-backed gaps: the main transcript loses the visible reading position when earlier content changes height, and the shared tooltip repeatedly applies its first-hover delay while a person scans related controls. It also strengthens the existing Inbox focus-return work instead of opening a competing issue.

Success is a small, executable and nonduplicated backlog with measurable behavior. This publication does not claim that the proposed changes have been implemented or tested at runtime.

## REQUIREMENTS

| ID | Requirement | Task / acceptance |
| --- | --- | --- |
| XR01 | Record concrete lessons from primary sources, distinguishing observed behavior, published guidance and our proposed implementation decisions. | X01 / XA01 |
| XR02 | Require verified Gen-V1 source evidence and an outcome-level issue/PR overlap check before creating a new task. Preserve owners and prior plans. | X02,X03 / XA02 |
| XR03 | Preserve the visible message and viewport offset during detached transcript reflow, and give keyboard users a valid continuation when the final history button disappears. Explicit navigation and live user input take precedence. | X05 / XA04 |
| XR04 | Introduce bounded shared-tooltip warm transfer within an explicit control group and presentation owner. Preserve cold dwell, current keyboard behavior, title/accessibility ownership and dismissal semantics. | X05 / XA05 |
| XR05 | Complete the existing #2155 keyboard contract with a real fallback when the previously selected Inbox row is absent. Do not resolve #1712's reader-selection contradiction through an unrelated focus change. | X05 / XA06 |
| XR06 | Retain compact neutral styling, readable labels, existing motion policy/tokens, instant semantic actions, input/IME, retained drafts and current authority boundaries. No new runtime dependency is selected. | X04-X06 / XA03-XA07 |
| XR07 | Publish real UTF-8 Markdown, complete canonical issue bodies, immutable identical source files and a focused review PR. Preserve the previous source history and exact older issue text where supplemented. | X04 / XA03 |
| XR08 | Separate source review from runtime proof, planning from implementation, candidate tests from merged-main acceptance, and synthetic recordings from native/live-provider verification. | X04-X06 / XA03-XA08 |
| XR09 | Use paired evidence with matching state/viewport/settings, meaningful negative cases and bounded performance checks. Videos use 1920x1080 without added titles or overlays. | X05,X06 / XA07,XA08 |

New scope is limited to the three child outcomes. Generic virtualization, background polling, global motion retuning, gesture alternatives, responsive panes, sidebar redesign and panel-header standardization are not new tasks in this extension. The screened areas already have owners or lack a demonstrated source defect. The original Bluma source/provenance rules remain unchanged; preview quality does not require importing a component library.

## REPO_MAP

The baseline above is unchanged from the previous review. Child plans contain the detailed source and executable test maps.

| Verified source / existing work | Relevance |
| --- | --- |
| `apps/web/src/conversation-scroll.ts`, `App.tsx`, `styles.css` | Main conversation owns top/tail restoration, history prepend compensation and a scrollport with native anchoring disabled. Detached resize handling does not retain a visible message's viewport offset. |
| `apps/web/src/conversation-workspace/ConversationPane.tsx` | Internal precedent for identity-plus-offset anchoring and history focus continuation; do not create a new library or replace its working behavior. |
| `packages/ui-shell/Tooltip.tsx`, `feedback.css`, `tokens.css` | Shared title adoption, owner portal, lifecycle and timing; every new pointer target currently schedules the full dwell. |
| `apps/web/src/InboxView.tsx`, `third-party/vespin/inbox-columns.ts`, `third-party/vespin/inbox-presentation.tsx` | Selected-row references, unread mutation, reader/list transitions and existing #2155 keyboard contract. |
| #1581 / [#1649](https://github.com/skytuhua-org/Gen-V1/pull/1649) | Explicit prompt navigation; open at `f902801fd0af66ace5b7e34d3df8e8546b80cf59`. Coordinate the same scroll controller. |
| #1473 / [#1509](https://github.com/skytuhua-org/Gen-V1/pull/1509) | Explicit bookmark/history anchors; open at `028090e48d8e55ad4258773e251b09d6629c80bd`. Automatic compensation must not override an explicit destination. |
| #1969 / [#2062](https://github.com/skytuhua-org/Gen-V1/pull/2062) | Rendering work bounds; open at `9c11de3b8e112188adac228a551d83eac8459912`. Preserve coalescing and bounded work; a reading anchor is a distinct outcome. |
| #1976 / merged #2007 / [#2011](https://github.com/skytuhua-org/Gen-V1/pull/2011) | Current tooltip text freshness and pending ARIA ownership follow-up. #2011 remains open at `f672b132e0d6420cdd50b4f9367b083b9ec95bf6`, despite a queue comment. |
| #1712 / [#1752](https://github.com/skytuhua-org/Gen-V1/pull/1752) | Filtered reader-selection policy; open at `d3e59ba0416c7a6006b6ff73e5adfdb5f54c41bc`. Original requirements and later design disagree about reselection; keep that decision under its canonical owner. |
| [#2155](https://github.com/skytuhua-org/Gen-V1/issues/2155) | Existing Inbox aria-current, Escape and focus return task. Supplement it and preserve its original body. |
| #1115 ContextMeter / #1187 ThreadHoverCard | Independent tooltip/hover-card behavior already owned. Excluded from the new shared-tooltip task. |
| `scripts/public-source-files.json` | Coordinator adds exactly these four reviewed Markdown paths to `source`; `runtime` remains unchanged. No product module or dependency changes. |

## DESIGN

### Lessons and dispositions

| Reference | What we can learn | Gen-V1 decision |
| --- | --- | --- |
| [Bluma](https://bluma.design/) and the 22 previously inspected previews | Selected objects, menus, pending actions and disclosures have visible continuity across state changes. | Continue the existing seven plans. Retain semantic controls, real state and neutral density. The full earlier matrix remains below. |
| [Linear's 2026 interface refresh](https://linear.app/now/behind-the-latest-design-refresh) | Predictable action placement and selective visual emphasis make dense interfaces easier to read. Its account describes incremental comparison of old/new behavior. | Keep primary content prominent and navigation quiet; compare complete workflows. A new header redesign needs a concrete inconsistency map first, so no speculative issue is filed. |
| [Emil Kowalski on purposeful animation](https://emilkowal.ski/ui/you-dont-need-animations) | Frequency and intent matter. Repeated operations should not accumulate ceremonial delay; subsequent tooltips can be quicker than the first. | New bounded shared-tooltip warm-transfer task. Preserve the existing keyboard dwell rather than silently changing that separate contract. Existing pointer-only tab and immediate action plans already cover other examples. |
| [Vercel's interface guidelines](https://vercel.com/design/guidelines) | Focus, keyboard paths, interruption, stable geometry and cheap input/rendering are part of visual quality. Its tooltip guidance distinguishes initial dwell from subsequent peers. | Apply the continuity outcomes and measure them. Do not import its minimum-visible loading delay or generic network budget; Gen-V1 retains immediate factual completion. |
| [Atlassian drag accessibility](https://atlassian.design/components/pragmatic-drag-and-drop/accessibility-guidelines/) and [React Aria FocusScope](https://react-aria.adobe.com/FocusScope) | An action needs a meaningful continuation destination. When the initiating element vanishes, choose a valid replacement without losing the user's place. | Apply this principle to history loading and Inbox focus. This is an inference beyond the specific source examples, not a requirement to install their packages or redesign dragging. |
| [CSS scroll anchoring Working Draft](https://www.w3.org/TR/css-scroll-anchoring-1/) | Absolute scroll offset and a stable view are different. Node movement can be compensated while reading. | Preserve message identity plus viewport offset in the existing main controller. The draft informs the principle; it is not a claim of final standard status or current cross-browser behavior. |

### New outcome contracts

**Transcript:** Detached reading has a logical anchor in the active visible conversation. A height change above that anchor compensates immediately, without a decorative animation. Explicit prompt/bookmark/find navigation, tail following, history restore, live user scroll and owner changes have explicit priority. There is one compensation owner; native and custom mechanisms must not both correct the same movement. A final history response may remove Load earlier; focus continuation is permitted only while the originating operation still owns focus. Preserve reader position with `preventScroll`.

**Shared tooltip:** Cold pointer entry retains its current 350ms default dwell. After a tooltip actually appears, moving among explicitly grouped peer controls can show the next tooltip without another dwell or entrance animation. The child plan defines the short grace period as a proposed design value, not a measured external fact. A group must not carry warmth into another dialog, unrelated toolbar, hidden view or unmounted owner. Current 100ms focus dwell is retained. Escape, pointer activation, scrolling, blur and stale timers remain safe. ARIA text ownership from the pending lifecycle repair must survive.

**Inbox:** The current #2155 aria-current and Escape requirements remain part of the complete revision. Add a stable, real focus target when a selected row has left the visible collection, including unread updates and Back/Escape return. Focus follows current intent; a delayed operation cannot move focus back after the user has moved elsewhere. Selection, retained reader content and re-entry semantics remain owned by #1712. Any correction to original source assumptions must be explicit in the full supplement, with the original body retained.

### Routing and integration

| Outcome | Canonical plan | Implementation boundary |
| --- | --- | --- |
| Transcript reading and history focus | [#2218](https://github.com/skytuhua-org/Gen-V1/issues/2218), [full plan](https://github.com/skytuhua-org/Gen-V1/blob/190da16adce4c30b659af892e445b36be7e41e01/docs/agent-plans/frontend-transcript-reading-anchor.md) | One owner for main App/controller edits, coordinated with explicit navigation and performance candidates. |
| Shared-tooltip warm transfer | [#2219](https://github.com/skytuhua-org/Gen-V1/issues/2219), [full plan](https://github.com/skytuhua-org/Gen-V1/blob/190da16adce4c30b659af892e445b36be7e41e01/docs/agent-plans/frontend-tooltip-warm-transfer.md) | Tooltip state machine, presentation marker, minimal real grouped surface and tests; coordinate #2011. |
| Inbox focus continuation | [Full supplement](https://github.com/skytuhua-org/Gen-V1/blob/190da16adce4c30b659af892e445b36be7e41e01/docs/agent-plans/frontend-inbox-focus-continuation.md); #2155 | Existing accessibility task, with prior body preserved and selection-policy ownership unchanged. |

The child plans can be implemented in parallel after their existing owners acknowledge boundaries. Shared manifests and test registrations require one writer or sequenced commits. No database, persistence schema, backend action, authority or account change is required. Roll back an individual focused implementation and its tests together; do not revert adjacent candidate work. The old Bluma visual tracks proceed through their original dependency gates.

## EXECUTION_DAG

### X01: Extract transferable lessons

Prerequisites: the user's extension request and previous live review. Owner: coordinator plus read-only source researcher. Inputs: primary URLs in DESIGN and the earlier decision matrix. Actions: open original publications, distinguish examples from universal requirements, record useful behaviors and rejected imports. Output: reference/disposition table. Positive check: each factual lesson has a working primary source. Negative check: no claim to have exercised another product's signed-in application or acquired gated source. Done: research recorded and reviewed. Handoff: X02/X03.

### X02: Locate concrete remaining gaps

Prerequisite: X01 and pinned main. Owner: read-only source reviewer. Actions: read exact controller, component and test code; map state/identity/intent boundaries; identify existing internal precedents and a reproducible failing scenario. Files: REPO_MAP plus each child's verified fixtures. Output: three bounded continuity contracts and source-derived reproductions. Positive check: name the active production path and measurable outcome. Negative check: no runtime-failure claim from inspection, invented test suite, proposed interface represented as existing, or already-working behavior called absent. Done: evidence sufficient to write each DAG. Handoff: X03/X04.

### X03: Reconcile existing outcomes and owners

Prerequisite: X02. Owner: issue/PR reviewer. Actions: search distinctive outcomes; read complete canonical bodies, latest comments and linked patches; record heads/releases and choose new/reuse/defer. Output: two new children, one #2155 supplement and the overlap ledger. Positive check: preserved explicit-navigation, tooltip lifecycle and selection owners. Negative check: no timeout takeover or generic duplicate redesign/performance issue. Done: all proposed edits have a canonical route. Handoff: X04; future implementers refresh this ledger.

### X04: Publish complete reviewable plans

Prerequisites: X01-X03, exact planning claims, independent review. Owner: coordinator; each contributor owns only its named Markdown draft. Files: these four `frontend-*.md` documents plus their four `source` entries in `scripts/public-source-files.json`; do not change `runtime`. Actions: create real UTF-8 sources; preserve previous parent source and original #2155 body; audit nine fields and requirement/task/acceptance coverage; create two children; publish complete #2212/#2155 revisions; commit identical sources from current main and open a focused docs PR. Add immutable source URLs, revisions, previous SHA history and append-only change comments. The connector does not support a real issue-file attachment, so the committed-file fallback is used.

Positive checks: complete canonical blocks equal local and commit-pinned source bytes; metadata/labels/source links resolve; prior bytes remain intact. Negative checks: no incomplete placeholder, silent requirement deletion, concurrent issue overwrite, stale own claim or false product test result. Output: verified publication and planning RELEASE with `OWNER=NONE`. Done only after readback and actual documentation checks. Handoff: X05; receiver execution ACK remains distinct from completed publication.

### X05: Implement the three bounded continuity tracks

Prerequisite: X04 plus fresh owner/PR reconciliation. Owners: explicit child claimants, no automatic transfer from this publisher. Inputs: full child plan, entire journal, immutable source and current main. Actions: follow each child's T01-T04/T05 DAG; establish real baseline reproduction; integrate existing candidates; add the smallest behavior and meaningful positive/negative tests. Output: separate reviewable candidates and exact evidence. Positive checks: identity/offset and focus assertions, actual grouped-tooltip behavior. Negative checks: no input delay, forced focus, double scroll correction, stale bubble, timer leak or loss of existing accessibility text. Done: child acceptance met on the candidate and pending native/integration gates recorded. Handoff: X06.

### X06: Review, integrate and release

Prerequisite: frozen X05 candidates and matching baseline. Owner: independent reviewer then authorized maintainer. Actions: compare real workflow evidence; verify normal/Reduced/Off, narrow/zoom, keyboard/pointer, interruption and repeated operations; honor normal CI/review/merge protections; verify actual resulting main SHA with focused checks. Output: explicit candidate, integration and main verdicts; current full plans; released claims. Positive check: intended continuity without a functional regression. Negative check: a passing synthetic fixture or queued PR is not native verification or merged acceptance. Done: applicable child gates accepted; broader original issues remain open until all their original work is complete. Otherwise publish exact remaining work and RELEASE.

## VALIDATION

| Acceptance | Required evidence |
| --- | --- |
| XA01 | XR01: primary source table, original URLs, observed versus proposed distinctions and rejected conflicting guidance. |
| XA02 | XR02: exact source maps, gap reproductions, duplicate/ownership dispositions and current PR heads. |
| XA03 | XR06-XR08: four full documents, preserved prior bytes, complete issue/source equality, immutable links, correct labels, focused docs PR and released publication claims. |
| XA04 | XR03: child transcript checks preserve visible identity/offset through reflow/history, respect explicit navigation/input and restore focus only when still owned. |
| XA05 | XR04: cold/warm/cooldown and group/owner cases; stale timer, dismissal, text/accessibility, Reduced/Off and real-toolbar regressions pass. |
| XA06 | XR05: #2155 original acceptance plus missing-row/empty/pending/user-intent cases, with selection policy not silently changed. |
| XA07 | XR06,XR09: identical data/viewport/settings before and after; 1920x1080 unadorned recordings where applicable; motion/input/accessibility checks. |
| XA08 | XR08,XR09: exact executed commands and artifact SHAs, measured bounded work, native/live limits, actual review/merge/main status. |

Planning validation: `git diff --cached --check`; `node scripts/check-doc-links.mjs` from repository root; complete Markdown/requirement/task inventory; byte equality of retained history and all published canonical blocks. The docs checker is offline and does not verify external URLs; primary sources were opened separately. Existing tracked Markdown must be materialized in a sparse clone before the repository-wide checker can run.

Implementation setup and registered suite commands are specified in the child plans. Use the repository-pinned Node/pnpm versions and exact current fixture registration. Do not install or run the application merely to validate a docs-only publication. No unit/browser/build/native checks or Gen-V1 before/after recordings have been executed in this extension. Source arithmetic or inspection is not a runtime result.

## STATE

X01-X03 are researched and reviewed. X04 is complete only when the parent journal records source/body equality, docs checks, the actual documentation commit/PR and final RELEASE. X05-X06 and all new product acceptance remain `NOT_STARTED`. Current planning drafts are not an implementation handoff until publication readback finishes.

Known integration risks: pending explicit-navigation candidates share the transcript controller; #2011 shares the tooltip observer; #1712 contains a separate selection-policy contradiction. Child T01 reconciles those specific concerns. No active product owner is cleared by this planning session. The first implementation action is to read the full child plan and journal, refresh its candidates and obtain an acknowledged scope allocation.

## REFERENCES

- [Pinned product source](https://github.com/skytuhua-org/Gen-V1/tree/96ca4c3bd0664fca53775fbe31915c209641986c), [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/AGENTS.md), [DESIGN.md](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/DESIGN.md).
- [Previous complete program](https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-component-adoption-program.md), SHA-256 `c409e84af192363d5d21526682e88aa2659cb30a96f33b7cf62a1434b8b8c745`.
- [Extension claim](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7167827229), [scope and delegation decision](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7167934777), [#2155 publication claim](https://github.com/skytuhua-org/Gen-V1/issues/2155#issuecomment-7167924372).
- Primary website references and exact related PRs appear in DESIGN and REPO_MAP. Their substantive lessons and integration constraints are included here so implementation does not depend on private chat.

## Preserved previous program

The following is the exact complete `BLUMA-R1` source from commit `cd5860c647507b4b28be51f640bfeae9d447d021`. This section preserves its obligations and dated findings; the extension above supplies the latest publication index and additional work.

<!-- BEGIN PRESERVED BLUMA-R1 -->

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

<!-- END PRESERVED BLUMA-R1 -->
