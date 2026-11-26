# Plan: Bind the Changes surface Recorded tab to the selected conversation

## META
- Feature: Changes (diff) surface — Recorded tab always empty in chat mode.
- Repo: skytuhua-org/Gen-V1
- Plan revision: 1, 2026-11-23
- Baseline branch: main @ 7ebe108dfa375ee018e64ba8b3dd6998088ae314
- Fixture repro: `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"`, then open http://127.0.0.1:4317, select the thread "Explore the component catalog", click the composer chip "Changes" (aria-label "Inspect changes"), open the "Recorded" tab. The thread's active artifact `a6f314fb` contains a `Diff` element (`before: 'const value = 1;'`, `after: 'const value = 2;'`), yet the tab renders "No recorded diffs".
- Current status: bug verified against built fixture and source.
- Source: this deep QA pass (pass 29, diff view round 2).

## OBJECTIVE
The Recorded tab must show the recorded/artifact diffs of the conversation the user is looking at. Success: with the catalog thread selected, the Recorded tab lists one diff titled "Component catalog" with before/after sections; with a thread that has no diffs it shows the empty state.

## REQUIREMENTS
- In scope: the chat-mode Changes surface (right-panel `diff` tab opened via the composer's "Inspect changes" chip and via `ProjectContextSurface` "Show changes"), its owner label, its empty state.
- Out of scope: the canvas-mode `addCanvasPanel('diff', {...binding})` path (already bound), the Current (live git) tab internals covered by issue #1561, the History tab covered by #1742.
- Agreed decisions (fully specified, nothing left to decide):
  1. Resolve the effective conversation as `binding.threadId ?? snapshot.activeThreadId ?? <selected thread id>`; the chat-mode diff tab must be bound at open time: `revealWorkspaceTool('diff')` stores `{ threadId: <current thread id> }` in the right-panel tab binding so switching conversations re-binds on next open.
  2. When the resolved thread id is still undefined, the Recorded tab renders the empty state plus a caption line; it never silently filters.
  3. Add an owner line so users can tell which conversation a bound surface covers.
- UX spec (exact values, all in `apps/web/src`):
  - Owner line: a `<p className="panel-note">` rendered directly under the tab strip in `RecordedDiffPanel` when the surface is bound to a thread, text: `Changes recorded for “<thread title>”.` (curly quotes, thread title verbatim, truncation via existing `.panel-note` wrapping; no new tokens). 13px context — inherits `font-size:12px`, `color:var(--muted)`, `line-height:1.5`, `margin:0`; add `padding:8px 12px 0` to sit under the tab bar without a border.
  - Fallback caption (unbound): keep `<strong>No recorded diffs</strong>` in `.panel-empty`; append a second line `<span>Recorded diffs appear here when a conversation is open.</span>` rendered as a `<p className="panel-note">` inside the same `.panel-empty` (margin-top:4px).
  - Error/loading states unchanged.
- Accessibility: tab strip keeps roving `tabIndex` (already ArrowLeft/ArrowRight wrap, Home, End); owner line is plain text, no interactive element; `role="tabpanel"` keeps `tabIndex=0`; empty state remains a plain `<div>` (no role=status needed since content is static).
- Keyboard: unchanged; focus order is tab strip → tabpanel → `<summary>` of each diff.
- Motion: none added; tab switch and panel render keep current behavior (no transition on tabpanel mount). `prefers-reduced-motion` unaffected.
- Compatibility: no API/schema change; snapshot shape unchanged.
- Error/recovery: if `snapshot.threads` lacks the bound id (deleted thread), owner line renders `Changes recorded for an unavailable conversation.` instead of the title.

## REPO_MAP
- `apps/web/src/WorkspacePanelBodies.tsx` — `snapshotDiffs` (line ~37) filters by `item.threadId === threadId`; `RecordedDiffPanel`/`RecordedDiffs` (line ~49) render.
- `apps/web/src/WorkspaceSurfaceBody.tsx` — line ~55 `const threadId=binding.threadId??snapshot.activeThreadId??undefined`; line ~65 builds `recordedDiff`; line ~67 `if(!projectId&&kind==='diff')return recordedDiff;`.
- `apps/web/src/App.tsx` — `revealWorkspaceTool` (line ~1065) opens the chat-mode tab with no binding; `addCanvasPanel('diff', {...binding})` (line ~914) is the bound canvas path; Composer `inspectChanges={()=>revealWorkspaceTool('diff')}` (line ~1186).
- Fixture: `scripts/review-fixtures.ts` `catalogSpec` seeds `node('Diff', { before:'const value = 1;', after:'const value = 2;' })`.
- Verified facts: fixture snapshot reports `activeThreadId: null` in chat mode; artifact `a6f314fb` on thread `f4c07927` is `lifecycle:'active'`.

## DESIGN
- `revealWorkspaceTool('diff')` persists a per-tab binding: extend the layout's tab state so `openTabs` entries may carry `{ threadId }`; on open, write `{ threadId: thread?.id }`; on select-thread, update any open `diff` tab binding to the new thread id. Wherever the tab binding is resolved (`resolvePanelBinding`/right-panel body), pass it into `WorkspaceSurfaceBody` as `binding`.
- `RecordedDiffPanel` accepts `thread` (resolved `SnapshotThread | undefined`) in addition to `threadId`; renders the owner line only when `thread` exists, else the unavailable-conversation copy when `threadId` exists but no thread resolves.
- `snapshotDiffs` unchanged.
- State transitions: none.
- Security: none (read-only rendering of existing snapshot data).

## EXECUTION_DAG
- T01: Thread the right-panel tab binding through `revealWorkspaceTool` and the right-panel `WorkspaceSurfaceBody` call so `binding.threadId` is the selected thread id at open; re-bind on conversation switch. Done when: selecting catalog → open Changes → Recorded lists the artifact diff.
- T02: In `RecordedDiffPanel`, resolve `thread` from `snapshot.threads` and render the owner line with the exact copy above (both bound and unavailable cases). Depends on T01.
- T03: Update the empty state with the second-line caption (exact copy above). Independent of T01.
- T04: Guard the unbound fallback: when no thread id resolves, `snapshotDiffs` is skipped and the empty state renders directly (avoids a useless full scan). Depends on T01.
- Each task: positive test = catalog thread shows the diff; negative test = "Workspace & settings" thread (no artifact) shows empty state + caption.

## VALIDATION
- Fixture: run the repro command above; select "Explore the component catalog" → composer chip "Changes" → Recorded tab shows one `<details class="workspace-diff">` titled "Component catalog", `<summary>` then provenance note then Before/After pair with the two seeded lines; owner line reads `Changes recorded for “Explore the component catalog”.`
- Negative: select "Sign the service agreement" → Recorded shows `No recorded diffs` + `Recorded diffs appear here when a conversation is open.` Wait — bound thread exists but has no diffs, so copy should be the plain empty state without the unbound caption. Resolve: the caption second line shows only when the surface is unbound; a bound-but-empty thread shows just `No recorded diffs`. Final copy rule: unbound → `No recorded diffs` + `Recorded diffs appear here when a conversation is open.`; bound-and-empty → `No recorded diffs` + `Nothing recorded for “<thread title>” yet.`
- Keyboard: Tab into tab strip → ArrowRight cycles Current/Recorded/History → Enter activates → focus reaches first `<summary>`.
- Narrow width 360px panel: owner line wraps, no horizontal scroll.
- Both themes: owner line uses `var(--muted)`; verified in light + dark.
- Reduced motion (`prefers-reduced-motion`): no animation introduced; verify nothing animates on tab switch.

## STATE
- Researched/decided: all of the above. Implemented: nothing (plan only). Verified: bug reproduction.
- Next step: implement T01–T04 in a single small PR.

## REFERENCES
- Related issues: #1561 (Current tab fallback copy), #1742 (History empty state), #1620 (commit diffs), #1582, #1288, #1604, #1647 — none cover this binding bug.
- Code anchors: `apps/web/src/WorkspaceSurfaceBody.tsx:55`, `apps/web/src/WorkspacePanelBodies.tsx:37`, `apps/web/src/App.tsx:1065`, `apps/web/src/App.tsx:1186`.
