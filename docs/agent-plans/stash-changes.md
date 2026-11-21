# Plan: Stash and restore changes from the Changes panel

## META
- Feature: "Stash…" in the Changes panel parks all uncommitted work (tracked and untracked, ignored files excluded) under a name. A Stashes list shows each entry with its files and offers Apply, Pop and Drop, so the user (not the agent) controls stashing.
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-21 (UTC)
- Baseline: `main` @ `8fa907f378127bcfc23d71b55c53625ffc43e8da` (verified with `git rev-parse HEAD` on a fresh clone of `origin/main`).
- Labels: `feature`, `small`.
- Existing issues/PRs: no matching issue or PR. `gh api search/issues -f q='repo:skytuhua-org/Gen-V1 stash'` returned 28 open/closed issues and PRs; none proposes or implements stashing (all incidental body matches). Related plans: [#1601 Discard changes to one file](https://github.com/skytuhua-org/Gen-V1/issues/1601) (plan only, docs PR #1600, not implemented; shares the Changes row and Modal pattern), [#1610 Show and switch the git branch from the composer](https://github.com/skytuhua-org/Gen-V1/issues/1610) (plan only), [#1235 commit → push → PR](https://github.com/skytuhua-org/Gen-V1/issues/1235) (shares the workspace action contracts).
- Implementation status: NOT_STARTED. Researched and specified only. Nothing in this plan is implemented or tested.
- Source provenance: reading the repository at the baseline SHA, plus the public competitor issues in REFERENCES. Owner direction (Leonardo): file the plan directly with no approval step; there is no front end design team, so this plan specifies its own visual design and animation, and the final task sends the finished work to the front end team for review.

## OBJECTIVE
**User problem.** Gen's Changes panel can stage, unstage and (via the Project context card) commit, but there is no way to set uncommitted work aside and bring it back. Users who want to try something else, pull in another agent's change, or keep a half-finished idea must either commit junk or ask the agent to run `git stash`, which competitor tools show is risky: agents stash without asking, pop into conflicts and hide them, or drop work ([Claude Code #102465](https://github.com/anthropics/claude-code/issues/102465), [#95355](https://github.com/anthropics/claude-code/issues/95355); [Codex #40877](https://github.com/openai/codex/issues/40877), [#38541](https://github.com/openai/codex/issues/38541)).

**Intended behavior.** The user, not the agent, stashes from the Changes panel:
1. "Stash…" in the Changes toolbar opens a small popover with a name field (prefilled) and a "Stash changes" button. All uncommitted changes, including untracked files and excluding ignored files, are saved and the working tree becomes clean.
2. A collapsible "Stashes (N)" section below the changed-file list shows each entry: name, branch it was made on, relative time, file count; expanding an entry lists its files with status letters.
3. Each entry has Apply (restore, keep the entry), Pop (restore, then remove the entry only if the restore had no conflicts) and Drop (delete, after a confirmation dialog).
4. If Pop or Apply conflicts, the stash is always kept and the panel shows the conflicted files and what to do next. Nothing is lost silently.
5. All stash actions are disabled while the thread's agent run is active, and the server refuses them too.

**Measurable success.**
- Stash → Pop round trip on a tree with modified, added, deleted, renamed and untracked files restores byte-identical content (verified by test hash comparison) and leaves zero stash entries.
- A conflicting Pop leaves the stash entry in the list (count unchanged) and lists every conflicted path in the panel.
- No stash action runs while the thread run is active (client buttons disabled; server returns `RUN_ACTIVE`, no git command executed — verified with a spy).
- Drop only deletes the entry the user saw (immutable commit id check); a stale list never deletes a different entry.

## REQUIREMENTS

### In scope (v1)
- R1 Stash push: `git stash push --include-untracked -m <name>`; ignored files excluded. Name optional in UI, prefilled `WIP on <branch>` (or `WIP` when detached); trimmed, 1–200 chars, no NUL, valid Unicode.
- R2 Refuse push when there is nothing to stash (status has zero files): `NOTHING_TO_STASH`, no git command.
- R3 List: every entry of the private metadata's `refs/stash` reflog, newest first, with: commit id (full OID), index position, message/name, branch (parsed from the `On <branch>:` / `WIP on <branch>:` prefix git writes), created time (committer date, ISO), and files (path, oldPath for renames, status letter A/M/D/R, untracked flag).
- R4 Apply: restore entry into the working tree, keep entry. Pop: restore, then drop that same entry only when the restore completed with no conflicts. Drop: delete entry after a confirm dialog.
- R5 Immutable identity: Apply/Pop/Drop send the entry's OID and the `stashRevision` the client saw. The server resolves OID → current `stash@{n}` inside the exclusive project lock and refuses with `STASH_CHANGED` if the OID is not in the list or `stashRevision` differs. Never act on a client-supplied index.
- R6 Conflict handling: a restore that produces unmerged paths returns a structured result `{ restored: 'conflicts', conflicts: string[] }` (a confirmed outcome, not an error and not `uncertain`); the entry is kept. A restore refused by git because local changes would be overwritten returns `STASH_WOULD_OVERWRITE` with the paths git names, nothing written.
- R7 Run-active guard: buttons disabled when the bound thread `status === 'working'` or `runId !== null` (exact predicate confirmed in T01); server-side refusal `RUN_ACTIVE` before any git command.
- R8 Permissions: stash actions require `gitWrite === true` (managed private Git family); legacy read-only views show the Stashes list read-only (no buttons) or hide it if listing is not possible there (T01 decides from evidence; default: hide on legacy).
- R9 All stash mutations go through the existing durable workspace action layer (`POST /api/projects/:projectId/actions`, `actionOutcomes.execute`), with replay protection, owner fencing and recovery.
- R10 Visual design, animation and accessibility as specified in DESIGN §5.

### Out of scope (v1)
- Partial stashes (selected files, `--patch`, `--staged`, `--keep-index`), stashing ignored files (`--all`).
- Restoring the index (`--index`); v1 restores working-tree changes only, so staged state is not preserved (stated in the popover help text).
- Renaming entries, creating a branch from a stash, showing a stash's full diff (file list only; diff viewer integration is a follow-up).
- Agent-facing stash tools. The agent gets no new tool; this is a user control.
- Automatic stashing by any other Gen flow.

### Decisions (agreed) vs options
- Decided: untracked included, ignored excluded; confirm only on Drop; Pop conflicts keep the stash and show conflicted files; disabled while a run is active (from the batch 10 scope check).
- Decided in this plan: OID identity + `stashRevision`; conflict result is a confirmed outcome; Pop is apply-then-drop in one locked operation, not `git stash pop`, so the drop step can be skipped on conflict with certainty.
- Discovery (T01): whether `refs/stash` in a managed private Git family is shared by sibling thread worktrees. Default if shared: list all entries but show the branch label, and show "Made in another thread" when the entry's branch differs from the current one; Apply into the current worktree is still allowed (this is how git behaves).

### UX flows
1. Stash: Changes toolbar → "Stash…" → popover, name field focused with prefilled text selected → Enter or "Stash changes" → button shows spinner text "Stashing…" → popover closes, file list empties, new entry inserts at top of Stashes, status line "Stashed 7 files as “WIP on main”." (role=status).
2. Apply: entry row → Apply → row busy → on success status "Applied “name”. The stash is kept." → file list refreshes.
3. Pop success: status "Restored “name” and removed it from stashes." → row exits; focus moves to the next row's Pop button, else the previous row's, else the "Stash…" button.
4. Pop/Apply conflict: inline warning block above the Stashes list: title "Restored with conflicts", text "“name” is still in your stashes. Resolve these files, then drop the stash.", list of conflicted paths (each a button that selects the file in the change list/diff), dismiss button "Dismiss".
5. Drop: Drop → Modal titled "Drop stash", body "“name” (N files, made on <branch>, <relative time>) will be deleted. This cannot be undone.", buttons Cancel (initial focus) and Drop (danger). While pending both disabled and Escape/backdrop does nothing.
6. Would overwrite: status error "Can't restore “name”: these files have uncommitted changes: a.ts, b.ts. Stash or commit them first."
7. Run active: buttons disabled with tooltip "Available when the agent is not running."; if the run starts while the Stash popover or Drop dialog is open, the submit button disables and a line "The agent started running." appears; a server `RUN_ACTIVE` shows the same text.

### Non-functional
- Security: argument arrays through `nativeGit` only (no shell); name validated as in R1; OIDs validated as 40/64-hex; hooks, filters and credential helper stay disabled by the existing `nativeGit` prefix. No new network egress.
- Performance: list = one `stash list` plus one `stash show`-equivalent per entry; cap at 50 entries (show "Showing 50 of N" if more) and 1000 files per entry; must stay under the 4 MiB `nativeGit` output cap (else `RESOURCE_LIMIT` shown in the section).
- Compatibility: same platforms as current Changes; the bundled Git version must support `git stash show --include-untracked` (≥ 2.32) or the fallback in DESIGN §2 is used (T01 checks).
- Accessibility: all controls are native buttons; Stashes section is a disclosure (`aria-expanded`); entries are a list with accessible names "Apply stash “name”"; status messages via existing `role="status"`; conflict block uses `role="alert"` once; focus never drops to `body` (use `retainFocus` fallback target).
- Error/recovery: `REVISION_CHANGED`, `STASH_CHANGED` → "Your stashes changed. Refreshed the list." and auto reload; `ACTION_UNCERTAIN` → existing uncertain message plus reload; `GIT_ERROR` → "Git couldn't complete the stash action." with retry.

## REPO_MAP (verified at baseline unless marked DISCOVERY)
- `packages/workspace/tools.ts:182–192` — `ProjectTools.gitAction(projectId, threadId, input:{type; revision; paths?; message?; name?})`: runs under `this.exclusive(projectId, …)` and `withGitOperation(…, true, …)`, re-computes `status` and throws `REVISION_CHANGED` on mismatch, dispatches `stage` (`add --`), `unstage` (`restore --staged --`), `commit` (`-c commit.gpgsign=false commit -m`), `branch` (`switch -c`), else `INVALID_INPUT`; returns fresh `GitStatus`. It does not catch git failures.
- `packages/workspace/tools.ts:142–156` — `status`: porcelain v1 `-z`, `--untracked-files=all` for managed copies; `revision` is a SHA-256 of head, branch, porcelain, both diffs and untracked digests. **Stash list is not part of `revision`.** `GitFile` keeps index/worktree codes and `oldPath`; no explicit conflicts list.
- `packages/workspace/tools.ts:52,58` — `gitExecutable()`; `withPrivateGitFamily(family, signal, (metadata, worktree, active) => nativeGit(…))`.
- `packages/workspace/git-storage.ts:28–34` — `nativeGit(executable, metadata, worktree, args, signal, environment)`: fixed safety prefix (`--git-dir`, `--work-tree`, `core.hooksPath=<null>`, no fsmonitor, no external diff, no credential helper, `gc.auto=0`), 120 s timeout, 4 MiB cap (`RESOURCE_LIMIT`), throws `HarnessError('GIT_ERROR', …, result)` on non-zero exit. `git-storage.ts:43` `withPrivateGitFamily`.
- `packages/contracts/workspace-action-outcomes.ts:10–18` — `workspaceActionTypeSchema = z.enum(['stage','unstage','commit','review-pr','create-pr'])`, `workspaceActionEnvelopeSchema {id, type, payload, threadId?}`; `:24–37` `workspaceActionPayloadSchemas` with `local = {revision, expectedHead}` and `text(max)`; `:64–107` operation journal scope `'staged' | 'worktree'`; `:113–114` `WorkspaceActionOutcome`/`WorkspaceActionExecution` (`confirmed` with `CommandReceipt` | `not-applied` | `uncertain` | `revoked`).
- `packages/contracts/index.ts:1,3,30` — `TaskStatus` (`ready|working|awaiting_input|stopped|interrupted|completed|failed`), `Thread {status, runId, …}`, `CommandReceipt {commandId, eventSeq, result}`.
- `packages/workspace/action-outcomes.ts` — `execute(projectId, raw)` at 180: validates envelope + payload (181–205), checks owner fence and existing intent/receipt, checks `expectedHead`/`revision` against fresh status (230–233), marks started then calls `this.projects.gitAction(projectId, input.threadId, {type, ...payload})` for local types (234–249), persists receipt (250–269), catch maps pre-start errors to `not-applied` and post-start to `uncertain` (272–286); `recover()` handles restart replay.
- `apps/server/workspace-routes.ts:47` — `GET /api/projects/:projectId/git` → `projects.gitStatus(projectId, threadId)`. `:129–139` — `POST /api/projects/:projectId/actions` routes `workspaceActionTypeSchema` types to `actionOutcomes.execute` and maps outcomes to 403/409 with codes `CAPABILITY_DENIED`, `REVISION_CHANGED`, `ACTION_UNCERTAIN`.
- `apps/web/src/WorkspaceSurfaceBody.tsx:39–45` — `DiffBody({base, query, active, fallback})`: `useProjectRequest<GitStatus>(base+'/git?'+query, active)`, `apply(type, path)` posts `{id: crypto.randomUUID(), type, payload:{paths, revision, expectedHead}, threadId?}` via `post` (`:27`, CSRF header) then `load()`. Toolbar: `<div className="panel-toolbar"><strong>Changes</strong><span>{value?.branch}</span><button>Refresh</button><label>…Staged</label></div>`. Row action `disabled={pending||value.gitWrite!==true}`. `:46–51` `ChangesBody` wraps `DiffBody` in `FileCheckpoints`. `:55` resolves `thread` from `snapshot` but does not pass run state into `ChangesBody`/`DiffBody`. `active` = request activity, not run activity.
- `apps/web/src/ProjectContextCard.tsx:52–53` — commit form (not in Changes).
- `apps/web/src/SavedLayoutChooser.tsx:68–74` — implemented destructive confirmation using shared `Modal` ("Delete layout"): close blocked while pending, consequence paragraph, Cancel then Delete, error kept in dialog. Pattern to copy for Drop.
- `packages/ui-shell/Modal.tsx:7–9` — `Modal({open, title, onClose, children, className})`, native `showModal`, `retainFocus`, restores the trigger only if still connected. `packages/ui-shell/Popover.tsx:7–25` — `Popover({anchor, contentRef, initialFocus, open, present, width, height, preferredSide, align, onDismiss, onReady, children, …})`.
- `packages/ui-shell/focus-retention.ts:6,17,32` — `usableFocusable`, `refocusWithin`, `retainFocus(document, getRoot, schedule)`.
- `packages/ui-shell/tokens.css:23–37` — `--ui-motion-hover 120ms`, `press 80ms`, `panel-enter 220ms`, `panel-exit 180ms`, `insert 180ms`, `remove 140ms`, `status 160ms`, easing tokens (`--ui-ease-enter`, `--ui-ease-move`). `controls.css:91–106` popup enter/exit + reduced motion.
- `apps/web/src/workspace-tools.css:1` — `.live-review`, `.panel-toolbar` (flex, gap 8px), `.live-change-list` (padding 8px, max-height 34%, rows gap 8px, padding 6px, `border-bottom: 1px solid var(--border)`), `small`/`.review-revision` (`var(--muted)`, 11px), `.live-diff`. No animation defined.
- `docs/motion-refinement.md:7–11,21` — input never waits for animation; no per-frame layout reads or idle loops; reduced motion keeps brief opacity only.
- `scripts/ui-guard-policy.md:3–17`, `scripts/ui-overlay-legacy.json` — no bespoke dialog/popover/portal/fixed overlay outside shared primitives; legacy inventory is not permission. Commands `pnpm test:ui-guard`, `pnpm lint:ui`.
- Tests: `tests/project-tools.test.ts` (Vitest, real temp git repos; note fixture passes a Windows Git path via `ProjectTools` options — adjust for Linux runners), `tests/workspace-action-outcomes.test.ts`, `tests/workspace-action-outcome-routes.test.ts` (Fastify `app.inject`), `tests/workspace-action-outcome-authority.test.ts`, `tests/e2e/shared-panels.spec.ts:155` (Playwright `pullRequestFixture(page,{kind:'diff',dirty:true,gitWrite:true})`), shared regressions `tests/ui-focus-retention.test.ts`, `tests/ui-guard.test.ts`, `tests/overlay-motion.test.ts`, `tests/reduced-motion-coverage.test.ts`, `tests/e2e/motion-tokens.spec.ts`.
- Stash search: `git grep -in stash -- apps packages tests` → 0 matches. Whole-repo grep has 177 lines (docs, `@upstash` dependency, vendored Hermes/impeccable code), none a workspace stash feature.
- DISCOVERY: whether `refs/stash` lives in a per-thread or family-shared metadata dir; exact server-side source of thread run state available to `ProjectTools`/`action-outcomes`; bundled Git version; how `recover()` compares local operations (journal scope only knows `staged|worktree`).

## DESIGN

### 1. Contracts (`packages/contracts/workspace-action-outcomes.ts`, plus a new type in the same file or `packages/contracts/index.ts` next to `GitStatus` — T02 picks the file that already exports `GitStatus`)
```ts
export const workspaceActionTypeSchema = z.enum(['stage','unstage','commit','review-pr','create-pr','stash-push','stash-apply','stash-pop','stash-drop']);
const stashOid = z.string().regex(/^[0-9a-f]{40}([0-9a-f]{24})?$/);
const stashTarget = { ...local, oid: stashOid, stashRevision: z.string().regex(/^[0-9a-f]{64}$/) };
// in workspaceActionPayloadSchemas:
'stash-push':  z.strictObject({ ...local, message: text(200).refine(v => v.trim().length > 0) }),
'stash-apply': z.strictObject(stashTarget),
'stash-pop':   z.strictObject(stashTarget),
'stash-drop':  z.strictObject(stashTarget),

export interface StashFile { path: string; oldPath?: string; status: 'A'|'M'|'D'|'R'; untracked: boolean }
export interface StashEntry { oid: string; index: number; message: string; branch: string | null; createdAt: string; files: StashFile[]; filesTruncated: boolean }
export interface StashList { stashRevision: string; entries: StashEntry[]; total: number; gitWrite: boolean }
export type StashActionResult = { restored: 'clean' | 'conflicts'; conflicts: string[]; dropped: boolean } // returned for apply/pop; push/drop return { dropped } / { created: StashEntry }
```
`stashRevision` = SHA-256 hex of the newline-joined OIDs from `stash list --format=%H` (empty string hashed when none).

### 2. Backend (`packages/workspace/tools.ts`)
- New `ProjectTools.stashList(projectId, threadId)`: under `withGitOperation(…, false, …)` (read), run `git stash list -z --format=%H%x00%gs%x00%cI` (fields separated by NUL; T03 confirms `-z` behaviour, else use `%x1e` record separator), parse up to 50 entries. For each: `git stash show --name-status -z --include-untracked <oid>`; if T01 finds Git < 2.32, use `git diff --name-status -z <oid>^1 <oid>` for tracked plus `git ls-tree -r -z --name-only <oid>^3` (only when `<oid>^3` exists, checked with `rev-parse --verify --quiet <oid>^3`) for untracked. Parse `branch` from `%gs` with `/^(?:WIP on|On) ([^:]+):/`.
- Extend `gitAction` with the four types, all inside the existing `exclusive` + `withGitOperation(…, true, …)` and after the existing `revision` check:
  - Run guard first: `RUN_ACTIVE` if the thread is running (source from T01).
  - `stash-push`: `NOTHING_TO_STASH` if `current.files.length === 0`; `git(['stash','push','--include-untracked','-m',message])`; return status plus the new top entry.
  - Resolve target: re-read `stash list --format=%H`, compute `stashRevision`; mismatch → `STASH_CHANGED`; `n = oids.indexOf(oid)`; `n < 0` → `STASH_CHANGED`. Ref used = `stash@{n}` (computed now, under lock).
  - `stash-apply`/`stash-pop`: run `git stash apply stash@{n}` through a non-throwing variant (add `nativeGitResult` in `git-storage.ts` that returns `{exitCode, stdout, stderr}` with the same prefix/caps; `nativeGit` stays unchanged). Then classify:
    - exit 0 → `restored:'clean'`.
    - non-zero and fresh status has unmerged entries (`UU`, `AA`, `DD`, `AU`, `UA`, `DU`, `UD`) → `restored:'conflicts'`, `conflicts` = those paths.
    - non-zero, stderr contains `would be overwritten` or `already exists, no checkout`, and fresh `revision` equals the pre-apply revision → throw `HarnessError('STASH_WOULD_OVERWRITE', …, {paths})` (paths parsed from the tab-indented lines git prints). Because nothing was written, `action-outcomes.ts` must map this code to `not-applied` (T04).
    - anything else → throw `GIT_ERROR` (→ `uncertain`, existing behaviour).
    - Pop only: if `restored === 'clean'`, re-verify `rev-parse stash@{n}` === `oid`, then `git stash drop stash@{n}`; `dropped:true`. On conflicts never drop.
  - `stash-drop`: verify `rev-parse stash@{n}` === `oid`, then `git stash drop stash@{n}`.
- New route `GET /api/projects/:projectId/git/stashes?threadId=` in `apps/server/workspace-routes.ts` next to `:47`, returning `StashList`.

### 3. Durable action layer (`packages/workspace/action-outcomes.ts`)
- New types flow through the existing path; `expectedHead`/`revision` checks stay. `stashRevision` is checked inside `gitAction` (under the project lock), so a race between check and act is impossible.
- Error mapping: `RUN_ACTIVE`, `NOTHING_TO_STASH`, `STASH_CHANGED`, `STASH_WOULD_OVERWRITE` are pre-write refusals → `not-applied`, and the route must return their own code and message instead of the generic `REVISION_CHANGED` (extend `apps/server/workspace-routes.ts:129–139` mapping: carry `error.code` from the outcome when present).
- Receipt `result` = `StashActionResult` (plus fresh `GitStatus`) so the client can show conflicts.
- Recovery (`recover()`): for an intent left `started`, classify by readback — push: confirmed if a new top entry with the same message exists and was absent in the intent's recorded `stashRevision` (record pre-op OID list hash in the intent); drop: confirmed if `oid` absent; pop: confirmed-clean if `oid` absent and no unmerged paths, confirmed-conflicts if `oid` present and unmerged paths exist, else `uncertain`; apply: `uncertain` unless unmerged paths prove a conflict result. T04 confirms how the journal stores per-type readback data and whether the `scope` union needs a `'stash'` member.

### 4. Client (`apps/web/src/WorkspaceSurfaceBody.tsx`, new `apps/web/src/StashPanel.tsx`)
- Pass `runActive` from `WorkspaceSurfaceBody:55` (`thread?.status === 'working' || thread?.runId != null`, confirmed by T01) into `ChangesBody` → `DiffBody` → `StashPanel`.
- `DiffBody` toolbar: add `<button ref={stashTrigger} aria-haspopup="dialog" disabled={!canStash}>Stash…</button>` after Refresh; `canStash = value?.gitWrite===true && !runActive && !pending && value.files.length>0`; tooltip via shared `Tooltip` when disabled for run activity.
- `StashPanel` (rendered below `.live-change-list`): `useProjectRequest<StashList>(base+'/git/stashes?'+query, active)`, reloaded after every stash action and after `DiffBody`'s `load()`.
- Stash popover: shared `Popover` anchored to the trigger, `width 280`, `height 132`, `preferredSide 'bottom'`, `align 'end'`, `initialFocus` = name input (text selected on open). Contents: label "Name", input (maxLength 200), help `small` "Includes untracked files. Staged changes come back unstaged.", primary button "Stash changes". Enter submits; Escape closes and returns focus to the trigger.
- Drop: shared `Modal` per `SavedLayoutChooser.tsx:68–74`; Cancel gets initial focus via `autoFocus`/ref; onClose ignored while pending.
- Posting: same envelope as `apply()` with payload from §1; on `STASH_CHANGED`/`REVISION_CHANGED` reload both lists and show message.
- Focus: wrap the section with `retainFocus(document, () => sectionRef.current)`; after Pop/Drop removes a row, move focus to next row's same action → previous row's → `stashTrigger`.

### 5. Visual design and animation (owned by this plan; front end team reviews in T08)
- Layout: Stashes section header row uses `.panel-toolbar` spacing (gap 8px): disclosure button with a 12px chevron (lucide `ChevronRight`, rotates 90° when open), text "Stashes", count in `small` muted style `(3)`. Collapsed by default when 0 entries (header hidden entirely when 0 and no conflict block), expanded by default when ≥1.
- Entry row: reuse `.live-change-list li` geometry (padding 6px, gap 8px, bottom border `var(--border)`). Left: lucide `Archive` 14px in `var(--muted)`; name (13px, ellipsis, `title` = full name); below it in `small` (11px, `var(--muted)`): `main · 12 min ago · 7 files` (uses `apps/web/src/time-format.ts` if it exports a relative formatter; else T06 adds one there). "Made in another thread" appended in the same muted line when applicable. Right: three compact secondary buttons Apply, Pop, Drop (Drop uses the existing danger/destructive button class if one exists in `packages/ui-shell/controls.css`; T06 discovers; else `secondary` with `color: var(--danger)` token if defined). Expanding the entry (click name) shows files as an indented list (padding-left 22px) with status letter in a 16px monospace column (`var(--font-mono)`) and path, max 8 visible then "+N more" toggle.
- Conflict block: bordered box `1px solid var(--warning, var(--border))`, radius matches existing panel notes, padding 8px 12px, lucide `TriangleAlert` 14px, title 13px semibold, body 12px, path buttons styled as links in monospace.
- Animation (tokens only, no new durations):
  - Popover and Modal: existing shared enter/exit (`controls.css:91–106`), unchanged.
  - Disclosure chevron rotate: `transform` over `var(--ui-motion-hover)` with `var(--ui-ease-move)`.
  - Section/file-list expand: opacity 0→1 and `translateY(-4px)`→0 over `var(--ui-motion-panel-enter)` with `var(--ui-ease-enter)`; collapse opacity only over `var(--ui-motion-panel-exit)`. No height animation (avoids layout reads per frame).
  - New entry insert: opacity 0→1 + `translateY(-4px)`→0 over `var(--ui-motion-insert)`; only the newly created OID animates (not on first load or refresh, per motion-refinement "unchanged snapshots quiet").
  - Entry removal (Pop/Drop): opacity 1→0 over `var(--ui-motion-remove)`, then removed; focus moves immediately (input never waits for animation).
  - Status and conflict block: fade in over `var(--ui-motion-status)`.
  - Busy state: button text swap ("Applying…", "Popping…", "Dropping…", "Stashing…") with `aria-busy`, no spinner animation loop.
  - `prefers-reduced-motion: reduce`: remove all transforms; keep opacity fades at ≤ `var(--ui-motion-press)`; chevron rotates instantly.
- Light/dark: only existing color tokens; verify both themes and a 360px-wide panel (buttons wrap under the name via `flex-wrap`).

### 6. Security, rollback
- No new privileges: same `gitWrite` gate and owner fencing. Server is authoritative for run state and identity.
- Rollback: feature is additive; reverting the PR removes UI and action types. Existing stash entries created by users remain ordinary git stash entries usable from the CLI.

## EXECUTION_DAG
| ID | Goal | Depends | Owner boundary |
|---|---|---|---|
| T01 | Discovery: stash ref location, run-state source, Git version, recovery journal shape | — | read-only + checkpoint comment |
| T02 | Contracts: action types, payload schemas, stash types | T01 | `packages/contracts/*` |
| T03 | Backend: `stashList`, `nativeGitResult`, gitAction stash types | T02 | `packages/workspace/tools.ts`, `git-storage.ts`, `tests/project-tools.test.ts` |
| T04 | Durable layer + routes: error mapping, receipt, recovery, `GET /git/stashes` | T03 | `packages/workspace/action-outcomes.ts`, `apps/server/workspace-routes.ts`, outcome tests |
| T05 | Client Stash popover + toolbar + run state plumbing | T04 | `WorkspaceSurfaceBody.tsx`, `StashPanel.tsx` |
| T06 | Stashes list, Apply/Pop/Drop, conflict block, styling, animation | T05 | `StashPanel.tsx`, `workspace-tools.css` |
| T07 | Browser tests, UI guard, motion and docs | T06 | `tests/e2e/*`, docs |
| T08 | Hand off to the front end team for review | T07 | issue comment / PR |

**T01 Discovery.** Steps: (a) in a managed project, find the metadata dir passed to `nativeGit` for two threads of the same family (log `metadata` in a scratch test or read `privateFamilyForBinding` in `git-storage.ts`); create a stash in one, run `stash list` in the other; record shared/not shared. (b) Find where the server knows a thread's run (`grep -rn "runId" packages/core apps/server | grep -i thread`), and whether `ProjectTools` or `ActionOutcomes` can query it (constructor deps); choose the lookup. Confirm the client predicate `status==='working' || runId!=null` against how `runId` is cleared on stop/complete. (c) `git --version` of `gitExecutable()` on Windows and Linux CI. (d) Read `action-outcomes.ts` `recover()` and the journal `scope` type; write down what per-type data can be stored in the intent. (e) Confirm `stash list -z` output format on the bundled Git. Output: one issue comment listing each answer with file:line. Tests: none (read-only). Done when every DISCOVERY item in REPO_MAP has an answer or an explicit block. Handoff: T02 worker.

**T02 Contracts.** Edits per DESIGN §1. Tests: extend contract unit tests (find the file testing `workspaceActionPayloadSchemas` with `grep -rln workspaceActionPayloadSchemas tests`): accept valid payloads; reject empty/whitespace/201-char/NUL message, non-hex/short oid, missing `stashRevision`, extra keys (strict). Done when `pnpm exec vitest run <that test>` passes and `pnpm typecheck` (or the repo's TS check script) is clean. Handoff: T03.

**T03 Backend.** Edits per DESIGN §2. Tests in `tests/project-tools.test.ts` (real temp repos; make the Git path fixture work on Linux): push with modified+added+deleted+renamed+untracked files → clean tree, 1 entry with all files listed, ignored file untouched; push on clean tree → `NOTHING_TO_STASH`, no entry; push with stale `revision` → `REVISION_CHANGED`; apply clean → files restored byte-identical, entry kept; pop clean → restored, entry gone; pop with conflicting edit → `restored:'conflicts'`, conflicts list exact, entry kept, count unchanged; apply with an overlapping dirty file → `STASH_WOULD_OVERWRITE`, tree unchanged; drop with OID of entry 2 after entry 1 dropped by another call → drops the right one; drop with stale `stashRevision` → `STASH_CHANGED`, nothing dropped; unknown OID → `STASH_CHANGED`; run active → `RUN_ACTIVE` and spy shows no git call; list with 0 entries, >50 entries (`total` correct), untracked-only entry. Done when these pass. Handoff: T04.

**T04 Durable layer and routes.** Edits per DESIGN §3 and the GET route. Tests: `tests/workspace-action-outcomes.test.ts` — replay of the same action id does not stash twice; `STASH_WOULD_OVERWRITE`/`STASH_CHANGED`/`RUN_ACTIVE`/`NOTHING_TO_STASH` are `not-applied`; generic git failure after start is `uncertain`; recovery classifications from DESIGN §3 for push, drop, pop (clean and conflict). `tests/workspace-action-outcome-routes.test.ts` — 409 bodies carry the specific code; `GET /git/stashes` returns `StashList`; legacy (gitWrite false) → stash actions `CAPABILITY_DENIED`/403 as existing types do. `tests/workspace-action-outcome-authority.test.ts` — owner fencing applies to stash types. Done when all pass. Handoff: T05.

**T05 Client popover and plumbing.** Edits per DESIGN §4 (toolbar button, popover, run state prop, posting, error messages). Tests: component/unit test if the repo has React unit tests for `WorkspaceSurfaceBody` (discover with `grep -rln DiffBody tests`), else covered in T07. Done when Stash creates an entry against a running dev server and the button disables while a thread is working. Handoff: T06.

**T06 List, actions, styling, animation.** Edits per DESIGN §4–§5 in `StashPanel.tsx` and `workspace-tools.css`. Discover danger button class and relative-time helper first. Done when all UX flows 1–7 work manually in light and dark, at 360px width, and with reduced motion. Handoff: T07.

**T07 Tests, guard, docs.** Add to `tests/e2e/shared-panels.spec.ts` (fixture `pullRequestFixture(page,{kind:'diff',dirty:true,gitWrite:true})` extended with stash list responses): Stash… disabled with `gitWrite:false`, with a working thread, with no files; popover focuses name, Escape returns focus; submit posts `stash-push` with `revision`, `expectedHead`, `message`; list renders entries/files; Apply/Pop post the OID and `stashRevision`; Pop conflict shows the alert with paths and the entry remains; Drop opens Modal with Cancel focused, Cancel posts nothing, Drop posts `stash-drop`; focus after row removal lands on the next row, never `body`; `STASH_CHANGED` triggers reload. Run `pnpm test:ui-guard`, `pnpm lint:ui`, `tests/ui-focus-retention.test.ts`, `tests/overlay-motion.test.ts`, `tests/reduced-motion-coverage.test.ts`, `tests/e2e/motion-tokens.spec.ts`. Update user docs where Changes panel actions are documented (discover with `grep -rln "Unstage" docs`) and add any new source files to `scripts/public-source-files.json`. Done when all pass and screenshots (light, dark, conflict, narrow) are attached to the PR. Handoff: T08.

**T08 Front end team review.** Post on this issue and the implementation PR: screenshots and a short recording of flows 1–7, list of tokens/animations used (DESIGN §5), and request review from the front end team. Done when the front end team has reviewed and any requested visual changes are applied or filed. Handoff: maintainer for merge.

## VALIDATION
- Setup: `source ~/.nvm/nvm.sh` if needed, `pnpm install --frozen-lockfile`, build steps from `CONTRIBUTING.md:53–73` (credential lease + widget assets) before focused Vitest.
- Unit/integration: `pnpm exec vitest run tests/project-tools.test.ts tests/workspace-action-outcomes.test.ts tests/workspace-action-outcome-routes.test.ts tests/workspace-action-outcome-authority.test.ts` plus the contracts test from T02.
- Browser: `pnpm exec playwright test --config tests/e2e/shared-panels.playwright.config.ts tests/e2e/shared-panels.spec.ts`; motion: `tests/e2e/motion-tokens.spec.ts`.
- Guards: `pnpm test:ui-guard`, `pnpm lint:ui`, the repo's typecheck and lint scripts.
- Real-user check: in the desktop app with a managed project: stash 5+ files incl. untracked, pop; create conflict and pop; drop with confirm; try during an agent run.
- Acceptance matrix:

| Req | Task | Check |
|---|---|---|
| R1 | T02, T03 | push test, schema tests |
| R2 | T03 | clean-tree push test |
| R3 | T03, T06 | list tests, e2e list render |
| R4 | T03, T06 | apply/pop/drop tests, e2e |
| R5 | T03, T04 | stale stashRevision / reordered drop tests |
| R6 | T03, T04, T06 | conflict + overwrite tests, e2e alert |
| R7 | T01, T03, T05 | RUN_ACTIVE spy test, e2e disabled |
| R8 | T04, T07 | legacy 403 test, e2e gitWrite false |
| R9 | T04 | replay + recovery tests |
| R10 | T06, T07, T08 | guard/motion tests, screenshots, front end review |

- Release gate: all checks above green in CI, front end team review done, no new `scripts/ui-overlay-legacy.json` entries.
- Executed so far: none. All tests above are planned.

## STATE
- Researched/decided: everything above. Implemented: nothing. Verified: nothing.
- Owners/branches: none. Plan docs PR adds `docs/agent-plans/stash-changes.md` only.
- Risks: family-shared `refs/stash` across thread worktrees (T01); classifying git output text is locale-sensitive — `nativeGit` should run with `LC_ALL=C` for stash commands (T03 passes it via the `environment` argument); conflict classification must rely on unmerged status, not only stderr text; recovery of `stash-apply` after a crash may remain `uncertain`.
- Next step: T01 discovery by the implementing agent.

## REFERENCES
- Batch 10 research baseline: Gen-V1 main [`8fa907f`](https://github.com/skytuhua-org/Gen-V1/commit/8fa907f378127bcfc23d71b55c53625ffc43e8da).
- [Codex #40877 worktree handoff stash fails and hides conflict](https://github.com/openai/codex/issues/40877) — why conflicts must be shown and the stash kept.
- [Codex #38541 uncommitted changes overwritten](https://github.com/openai/codex/issues/38541) — why restore refuses to overwrite local edits.
- [Claude Code #102465 destructive stash](https://github.com/anthropics/claude-code/issues/102465) — why stashing is a user control, not agent-initiated.
- [Claude Code #95355 stash pop lost code](https://github.com/anthropics/claude-code/issues/95355) — why Pop is apply-then-drop and drops only on a clean restore.
- Related Gen plans: [#1601](https://github.com/skytuhua-org/Gen-V1/issues/1601), [#1610](https://github.com/skytuhua-org/Gen-V1/issues/1610), [#1235](https://github.com/skytuhua-org/Gen-V1/issues/1235).
- Git docs: `git stash` (push `--include-untracked`, `apply`, `drop`, `show --include-untracked` since Git 2.32).
