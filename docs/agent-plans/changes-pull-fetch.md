# Pull and fetch from the remote with ahead/behind counts

## META

- **Feature:** the Changes panel toolbar shows how far the thread's branch is ahead of and behind its remote branch ("↑2 ↓5"), a Fetch button refreshes those counts on demand, and a Pull button fast-forwards the branch to the remote without asking the agent.
- **Repository:** [skytuhua-org/Gen-V1](https://github.com/skytuhua-org/Gen-V1) · **Plan revision:** r1 (2026-11-21, UTC) · **Size:** medium · **Labels:** `feature`, `medium`.
- **Verified baseline:** [main at 8fa907f378127bcfc23d71b55c53625ffc43e8da](https://github.com/skytuhua-org/Gen-V1/commit/8fa907f378127bcfc23d71b55c53625ffc43e8da) (`git rev-parse HEAD` of a fresh clone on 2026-11-21). Line numbers below refer to that commit.
- **Existing issues/PRs:** none match. Searched issues for "pull fetch ahead behind" and "upstream" in titles, all `feature` issues through #1610, and the open PR list on 2026-11-21. Related, not overlapping: [#1235 / `thread-publish-pr.md`](https://github.com/skytuhua-org/Gen-V1/blob/8fa907f378127bcfc23d71b55c53625ffc43e8da/docs/agent-plans/thread-publish-pr.md) (commit → push → draft PR; pushes, never fetches or pulls) and [#1610](https://github.com/skytuhua-org/Gen-V1/issues/1610) (composer branch chip; its plan lists "pushing, pulling or fetching branches" as out of scope and reads `refs/remotes/*` as they are).
- **Implementation status:** NOT_STARTED. Planning document only; nothing here is implemented or verified.
- **Provenance:** reading the repository at the baseline SHA (REPO_MAP), plus the public requests in REFERENCES.
- **Design and animation:** there is no separate front end design team for this work. This plan specifies the visual design and motion (DESIGN → Visual design and motion). The last task (T08) sends the finished work to the front end team for review.

## OBJECTIVE

**User problem.** Gen has no way to learn whether the remote moved. The Changes panel toolbar (`apps/web/src/WorkspaceSurfaceBody.tsx` line 44, `DiffBody`) shows only `value?.branch`. `ProjectTools.gitAction` (`packages/workspace/tools.ts` lines 182–191) supports `stage`, `unstage`, `commit` and `branch`; `GitStatus` (line 21) has no upstream field; the only network Git write is the push inside `GitHubTools.create` (`packages/workspace/github.ts` lines 65–68). Remote-tracking refs in the app's private Git family are a frozen copy taken at project import (`packages/workspace/git-storage.ts` `importGitFamily`, which copies `refs/remotes/*`). So a user whose teammate pushed to the branch, or who pushed from another machine, works on stale code until they ask the agent to run Git. Codex users report the same gap (a stale remote counter until a manual fetch, and a request for a safe "Pull latest"), and Claude Code users object to fetches they did not ask for (REFERENCES).

**Intended behaviour.** In a thread with a managed (app-owned, writable) working copy whose project has an admitted github.com origin, the Changes toolbar shows a sync group: a status chip, a Fetch button and a Pull button.
- The chip shows `↑<ahead> ↓<behind>` against the branch's remote branch, computed locally from the last fetch, with "Fetched 3 min ago" in its tooltip; `Up to date` when both are 0; `Not on remote` when the branch has no remote branch; `Never fetched` before the first fetch in this app session.
- Fetch contacts GitHub only when the user clicks it, then recomputes the counts.
- Pull fetches, then fast-forwards the branch when it is only behind. It never merges, rebases or overwrites local work. A diverged branch shows "Diverged — ask the agent or rebase" and Pull stays disabled.
- Pull is refused (button disabled with a reason, and refused again by the server) while the thread runs, when there is no remote branch, when the branch is not behind, and when uncommitted changes touch files the pull would change.

**Measurable success.**
- After a teammate pushes 1 commit to the branch, one Fetch click changes the chip from `Up to date` to `↓1` (today the panel never shows remote state).
- From `↓N` with a clean tree, one Pull click leaves `HEAD` equal to the remote branch tip and the chip at `Up to date`; today this requires asking the agent.
- Gen makes 0 network calls to the remote that the user did not trigger with Fetch or Pull (asserted in T03 and T07 by counting fetch invocations).
- No Pull ever changes a file with uncommitted changes: every refused or failed Pull leaves `git status --porcelain=v1 -z` and `HEAD` byte-identical to before (T03, T07).
- A Pull is never applied while the thread has an active run, enforced on the server, not only by a disabled button.

## REQUIREMENTS

### In scope

| ID | Requirement | Tasks / acceptance |
| --- | --- | --- |
| R1 | Sync read: new `GET /api/projects/:projectId/git/sync?threadId=` returns, for the thread's working copy: `branch`, `head`, `revision`, `remote` (`{name:'origin', repo:'owner/name'}` or null), `upstream` (`{ref:'refs/remotes/origin/<b>', short:'origin/<b>', oid}` or null), `ahead`, `behind` (integers or null), `state` (one of `no-remote`, `no-upstream`, `detached`, `up-to-date`, `ahead`, `behind`, `diverged`), `lastFetchedAt` (ISO string or null), `blockers` for Pull (list of codes, see R5). It runs only local Git commands; it never touches the network. | T02, T04 / A1 |
| R2 | Upstream resolution, decided by this plan: (1) if the private family config has `branch.<b>.remote=origin` and `branch.<b>.merge=refs/heads/<x>`, the upstream is `refs/remotes/origin/<x>`; (2) otherwise, if `refs/remotes/origin/<b>` exists, it is the upstream; (3) otherwise `upstream=null`, `state='no-upstream'`. Detached HEAD → `state='detached'`, counts null. Counts come from `git rev-list --left-right --count <upstream>...HEAD` (left = behind, right = ahead). | T02 / A2 |
| R3 | Fetch: new typed action `fetch` runs `git fetch` from `https://github.com/<repo>.git` into `refs/remotes/origin/*` for the private family, with `--no-tags --prune --no-write-fetch-head --no-recurse-submodules`, terminal prompts disabled, and the GitHub sign-in credential helper when signed in (anonymous otherwise, which works for public repositories). It changes no branch, index or working-tree file. The result is the fresh sync read. | T03, T04, T05 / A3 |
| R4 | Pull: new typed action `pull` = Fetch, then re-resolve the upstream and refuse unless `state==='behind'`, then `git merge --ff-only --no-edit <upstream-oid>`. The payload carries the reviewed `revision` and `expectedHead`; the server refuses with `REVISION_CHANGED` if the working copy changed since the user looked. | T03, T04, T05 / A4 |
| R5 | Pull blockers, checked on the server before any write and shown in the UI: `RUN_ACTIVE` (thread `runId` set or `status` is `working` or `awaiting_input`), `READ_ONLY` (no managed working copy), `NO_REMOTE`, `NO_UPSTREAM`, `DETACHED`, `UP_TO_DATE`, `AHEAD_ONLY`, `DIVERGED`, `DIRTY_OVERLAP` (a changed, staged or untracked path in `status` is also in `git diff --name-only -z HEAD <upstream-oid>`, compared case-insensitively on Windows). Uncommitted changes that do not overlap do not block; Git carries them through the fast-forward. If Git still refuses, nothing changed and the user sees the overlap message. | T02, T03, T06 / A5 |
| R6 | Fetch blockers: `READ_ONLY`, `NO_REMOTE`, `RUN_ACTIVE` is **not** a blocker for Fetch (it only moves remote-tracking refs, which the agent's turn does not depend on). | T03, T06 / A3 |
| R7 | No background network traffic. Opening the panel, focusing the window, a timer, or a finished agent turn never fetches. The chip recomputes locally whenever the existing Changes `load()` runs (Refresh button, after Stage/Unstage/commit). | T04, T06, T07 / A6 |
| R8 | Errors are plain sentences with a next step (DESIGN → Error copy). An authentication failure on a private repository shows the existing `GitHubSignIn` control inline. A fetch that exceeds the 120 s Git timeout shows "Fetch timed out. Check your connection and try again." | T03, T06 / A7 |
| R9 | Legacy (read-only original folder) projects show no sync group; they keep the existing "Original working copy · tracked changes only" note. Projects whose origin is not on github.com (so the private family has no origin, `git-storage.ts` line 123) show the chip as `No GitHub remote` with Fetch and Pull hidden. | T04, T06 / A8 |
| R10 | Visual design and motion as specified in DESIGN, in light and dark themes, with reduced-motion support, full keyboard operation and screen-reader announcements. | T06 / A9 |
| R11 | Durable outcomes: `fetch` and `pull` go through `WorkspaceActionOutcomes.execute` like `stage`/`commit`, so a crash mid-action is recorded as `uncertain` and never auto-retried, and `inspect` answers for them. | T01, T05 / A10 |
| R12 | Front end team review of the finished UI before merge. | T08 / A11 |

### Out of scope (v1)

- Merge pulls, rebase pulls, `pull --rebase`, conflict resolution, "Pull anyway", auto-stash, discarding local changes.
- Pushing from this group (push stays in the Publish / draft PR flow of #1235), force-push, setting upstream config (`branch.<b>.merge` is read if present, never written).
- Background, periodic or on-focus fetch; fetch on app start; a fetch-interval setting.
- Remotes other than the admitted github.com `origin`, GitHub Enterprise hosts, SSH transport (the fetch always uses the `https://github.com/<repo>.git` URL, like the existing push), forks, tags, submodules, LFS objects.
- Showing counts against the default branch (`origin/main`) for thread branches that were never pushed. A thread branch `gen/<thread>-<id>` has no remote branch until it is published, so it shows `Not on remote`.
- Agent tools for fetch or pull; the agent keeps whatever Git access it has today.
- Count badges anywhere outside the Changes panel (sidebar, composer, thread header).

### Decisions

- **Decided by this plan (overridable on this issue):** upstream resolution R2; `merge --ff-only <oid>` instead of `pull --ff-only` (the private family config has no `branch.*` upstream entries, so `git pull` with no arguments cannot work, and an explicit OID cannot race a ref update); Pull always fetches first; `--prune` on fetch (keeps the `Remote` list of #1610 accurate); Fetch allowed during a run, Pull not; non-overlapping dirty files do not block Pull; counts recompute locally on every Changes load, never via network; `lastFetchedAt` is in-memory per working copy (not persisted) so a restart shows `Never fetched` until the next click.
- **Proposed defaults left to discovery (T01):** whether `--no-write-fetch-head` is supported by the Git that Gen runs (`gitExecutable()` in `packages/capabilities/process.ts`; option exists since Git 2.29, the dev VM has 2.56); if not, drop it, since FETCH_HEAD lands in the worktree's private git dir, which `withPrivateGitFamily` already allows writes to. Whether `withPrivateGitFamily`'s path guard permits a fetch to write `refs/remotes/*`, `packed-refs` and `objects/pack/*` under the common directory (it declares `allowChildWrites:true` on the common dir; confirm with the T03 integration test).

### UX, compatibility, performance, security, privacy, accessibility, recovery

- **Compatibility:** no change for legacy projects, projects without git, or threads without a working copy. The legacy untyped `branch` action and its route fallback (`apps/server/workspace-routes.ts` line 146) are untouched. Windows paths: all paths come from Git output with `-z`; overlap comparison uses case-insensitive matching on `win32`.
- **Performance:** the sync read is at most 4 local Git calls (`branch --show-current`, `config --get` ×2, `for-each-ref`/`rev-parse`, `rev-list --count`); target < 150 ms on a 50k-commit repo on the reference Windows machine (measured in T07). It runs inside the existing per-project `exclusive` queue so it never overlaps a write.
- **Security:** all refs and URLs are separate argv entries to `nativeGit` (no shell). The remote URL is built only from the attested `family.origin` repo slug (validated by the existing `repository` regex in `github.ts` line 18). The credential helper is the same `!<bundled gh> auth git-credential` used by push (`github.ts` line 66), scoped to `https://github.com` with `-c credential.https://github.com.helper=…`; `nativeGit` already sets `credential.helper=` empty first so no system helper runs. The token is never placed in argv, URLs, logs or results; error text passes through `createSecretRedactor` before it reaches the client. Hooks stay disabled (`core.hooksPath` is the null file in `nativeGit`). `GIT_TERMINAL_PROMPT=0` and `GCM_INTERACTIVE=never` in the environment so Git never waits for input.
- **Privacy:** Gen contacts github.com only on an explicit click; no telemetry is added.
- **Accessibility:** the sync group is a `role="group"` labelled "Remote sync"; the chip has an accessible name in words ("2 commits ahead, 5 commits behind origin/feature, fetched 3 minutes ago"); results are announced through one `role="status"` live region; disabled buttons expose their reason via `aria-describedby`.
- **Recovery:** a failed Fetch leaves refs as they were (Git updates refs only after objects arrive). A failed Pull leaves `HEAD` and the tree unchanged (`merge --ff-only` is atomic for a fast-forward or refuses). A crash after `started` is shown as uncertain with "Check the branch, then Refresh" and is never retried automatically (existing outcome contract).

## REPO_MAP

Verified at the baseline SHA unless marked DISCOVERY.

| Area | Path | What is there today |
| --- | --- | --- |
| Git status + actions | `packages/workspace/tools.ts` | `GitStatus` (line 21: head, branch, revision, files, diffs, mode, gitWrite); `status()` (lines 142–155); `gitStatus()` (156); `gitAction()` (182–191: stage/unstage/commit/branch, revision check first); `exclusive()` per-project queue (51); `withGitOperation()` managed vs legacy (133–141); `git()` helper that runs in the private family with an `environment` (53); `context()` builds `ProjectContext` (192). |
| Private Git family | `packages/workspace/git-storage.ts` | `nativeGit()` (28–34: fixed safety `-c` prefix incl. empty `credential.helper`, null hooks path, 120 s timeout, 4 MiB output cap, throws `GIT_ERROR` with the process result); `importGitFamily()` (copies refs incl. `refs/remotes/*`, writes bare config with `[remote "origin"] url` + `fetch = +refs/heads/*:refs/remotes/origin/*` only for github.com origins, line 123); `withPrivateGitFamily()` path guard. |
| Thread working copies | `packages/workspace/tools.ts` from line 105 | New thread working copies are `git worktree add -b gen/<thread>-<8 chars> <path> <HEAD>`; no upstream is configured. |
| GitHub tools | `packages/workspace/github.ts` | `GitHubTools.environment()` (28: private gh HOME, `GIT_TERMINAL_PROMPT=0`); `repo()` (58: parses origin, `GITHUB_REMOTE_REQUIRED`); push with the gh credential helper inside `create()` (65–68); `auth: GitHubAuth` (`token()` throws when signed out — DISCOVERY T01: exact error code, likely `GITHUB_AUTH_REQUIRED` per the #1235 plan). |
| Action contracts | `packages/contracts/workspace-action-outcomes.ts` | `workspaceActionTypeSchema` enum (line 10: stage, unstage, commit, review-pr, create-pr); `workspaceActionPayloadSchemas` (`local = {revision, expectedHead}`); operation/inspect schemas. |
| Action execution | `packages/workspace/action-outcomes.ts` | `execute()` (from line 180): fence, `prepared` → `started` → `confirmed` intents, revision/head preflight for non-PR types, calls `projects.gitAction` for local types; `inspect()` read-only recovery; `receiptResult()` returns only a bounded summary except for `create-pr`. |
| Routes | `apps/server/workspace-routes.ts` | `GET /api/projects/:projectId/git` (47), `/git/comparison` (49–53), `POST /api/projects/:projectId/actions` (outcome types go to `actionOutcomes.execute`; 409 + `REVISION_CHANGED` / `ACTION_UNCERTAIN` mapping), `/action-outcomes/inspect` (36–41). |
| Changes UI | `apps/web/src/WorkspaceSurfaceBody.tsx` | `DiffBody` (39–45): `useProjectRequest<GitStatus>(base+'/git?'+query)`, toolbar `<strong>Changes</strong><span>{value?.branch}</span>` + Refresh + Staged checkbox; `apply()` posts stage/unstage to `/actions`. `GitHubSignIn` used in `PullRequestsBody` (line 155 area). |
| Styles | `apps/web/src/workspace-tools.css` (line 1: `.live-review`, `.panel-toolbar`), `apps/web/src/shell.css` (151–153 `.panel-toolbar`; `--success`/`--danger` colours), `packages/ui-shell/tokens.css` (motion tokens `--ui-motion-status`, `--ui-motion-success`, `--ui-motion-press`, `--ui-motion-tooltip-enter`, `--ui-ease-enter`, `--ui-ease-move`; `--ui-focus-ring`). |
| UI primitives | `packages/ui-shell/Tooltip.tsx`, `packages/ui-shell/Toast.tsx` (`toast(message,{tone})`), icons from `lucide-react` (59 imports in `apps/web/src`). |
| Thread run state | `packages/core/service.ts` line 220 uses `thread.runId` / `thread.status==='working'` / `'awaiting_input'` as "busy"; `Thread` from `packages/contracts/index.ts`. |
| Tests to mirror | `tests/project-tools.test.ts` (real temp repos via `execFileSync('git', …)`, `fixture()` line 11), `tests/github-workspace.test.ts` (`new GitHubTools(projects,{} as TerminalHost)` with a mocked `run`), `tests/workspace-action-outcomes.test.ts`, `tests/workspace-action-outcome-routes.test.ts`, `tests/workspace-action-outcome-authority.test.ts`. |
| Browser tests | DISCOVERY (T01): the Playwright spec that covers the Changes panel (`rg -l "live-review\|Changes" tests/*.spec.ts tests/**/*.spec.ts`); if none, T07 adds `tests/changes-remote-sync.spec.ts` following the nearest workspace panel spec. |

## DESIGN

### Data and control flow

```
Changes panel load()  ──GET /git──────────────▶ ProjectTools.gitStatus      (existing)
                      ──GET /git/sync─────────▶ ProjectTools.gitSync        (local only)
Fetch click ──POST /actions {type:'fetch'}──▶ WorkspaceActionOutcomes.execute
                                              └▶ GitHubTools.fetch ─▶ ProjectTools.gitFetch(env, helper) ─▶ gitSync
Pull click  ──POST /actions {type:'pull', revision, expectedHead}──▶ execute (revision/head preflight)
                                              └▶ GitHubTools.pull ─▶ gitFetch ─▶ ProjectTools.gitFastForward ─▶ gitSync
```

### Contracts

`packages/contracts/workspace-action-outcomes.ts`:

```ts
export const workspaceActionTypeSchema = z.enum(['stage','unstage','commit','review-pr','create-pr','fetch','pull']);
// in workspaceActionPayloadSchemas
fetch: z.strictObject({ revision }),               // revision = sync read revision, recorded for inspect only
pull:  z.strictObject({ ...local, upstreamOid: oid }), // upstreamOid = the tip the user saw; informational, server re-resolves
```

New file `packages/contracts/workspace-sync.ts`:

```ts
export const syncStateSchema = z.enum(['no-remote','no-upstream','detached','up-to-date','ahead','behind','diverged']);
export const pullBlockerSchema = z.enum(['RUN_ACTIVE','READ_ONLY','NO_REMOTE','NO_UPSTREAM','DETACHED','UP_TO_DATE','AHEAD_ONLY','DIVERGED','DIRTY_OVERLAP']);
export const gitSyncSchema = z.strictObject({
  branch: z.string().max(1024), head: oid, revision,
  remote: z.strictObject({ name: z.literal('origin'), repo }).nullable(),
  upstream: z.strictObject({ ref: z.string().max(1100), short: z.string().max(1100), oid }).nullable(),
  ahead: z.number().int().nonnegative().nullable(), behind: z.number().int().nonnegative().nullable(),
  state: syncStateSchema, lastFetchedAt: z.string().datetime().nullable(),
  blockers: z.array(pullBlockerSchema).max(9), overlap: z.array(z.string().max(1024)).max(20),
});
export type GitSync = z.infer<typeof gitSyncSchema>;
```

`overlap` lists up to 20 overlapping paths for the `DIRTY_OVERLAP` message. `revision` is the existing `GitStatus.revision`, so a Pull admitted against it is refused if anything changed.

### Backend (`packages/workspace/tools.ts`)

- `private async sync(metadata, path, signal, managed, threadId): Promise<GitSync>`: call `status()`; `branch` empty → `detached`; read `family.origin` via `privateFamilyForBinding` (null → `no-remote`); `git config --get branch.<b>.remote` / `branch.<b>.merge` (non-zero exit = absent, catch `GIT_ERROR`); resolve the upstream per R2 with `git for-each-ref --format=%(objectname) -- refs/remotes/origin/<x>` (empty output = absent); `git rev-list --left-right --count <upstreamOid>...<head>`; state from counts; blockers per R5 (run state from `this.store.get<Thread>('thread',threadId)`); `DIRTY_OVERLAP` only when `behind>0`, from `git diff --name-only -z <head> <upstreamOid>` intersected with `status.files[].path` and `oldPath`. Legacy (`managed===false`) → `blockers` includes `READ_ONLY`.
- `async gitSync(projectId, threadId)`: `exclusive(projectId, () => withGitOperation(..., write=false, sync))`.
- `async gitFetch(projectId, threadId, remoteUrl, credentialConfig: string[], environment)`: `exclusive` + `withGitOperation(write=true)`; run `git [...credentialConfig] fetch --no-tags --prune --no-write-fetch-head --no-recurse-submodules -- <remoteUrl> +refs/heads/*:refs/remotes/origin/*`; on success set `this.lastFetched.set(bindingId, new Date().toISOString())`; return `sync(...)`.
- `async gitFastForward(projectId, threadId, expected:{revision, head})`: `exclusive` + `withGitOperation(write=true)`; recompute `sync`; if `revision`/`head` differ → `REVISION_CHANGED`; if `blockers` non-empty → `HarnessError('PULL_BLOCKED', <copy for first blocker>, {blockers, overlap})`; run `git merge --ff-only --no-edit --no-verify <upstream.oid>` (the `-c core.hooksPath` prefix already disables hooks; `--no-verify` is belt and braces); return fresh `sync`.
- Keep `gitAction` unchanged; `action-outcomes.ts` routes the new types (below).

### Backend (`packages/workspace/github.ts`)

- `private remote(projectId, threadId)`: reuse `repo()` and return `https://github.com/<repo>.git`; `GITHUB_REMOTE_REQUIRED` → `NO_REMOTE`.
- `async fetch(projectId, threadId, beforeWrite?)`: build `credentialConfig = ['-c','credential.https://github.com.helper='+'!'+quote(this.executable)+' auth git-credential']` and `environment = {...this.environment(), GH_TOKEN, GCM_INTERACTIVE:'never'}` only when `this.auth.token()` succeeds; otherwise anonymous (`[]`, `environment()` without token). Call `beforeWrite?.()` then `projects.gitFetch(...)`. Map failures: stderr contains `Authentication failed` / `could not read Username` / HTTP 401/403/404 on a private repo → `HarnessError('GITHUB_AUTH_REQUIRED', 'Sign in to GitHub to fetch from this repository.')`; `timedOut` → `FETCH_TIMEOUT`; other → `FETCH_FAILED` with the redacted first stderr line. Constructor gains an optional `remoteUrl?: (repo:string)=>string` test seam (default builds the github.com URL) so tests can fetch from a local bare repo.
- `async pull(projectId, threadId, payload, beforeWrite?)`: `fetch(...)`, then `projects.gitFastForward(projectId, threadId, {revision: payload.revision, head: payload.expectedHead})`. Because Fetch changes `refs/remotes/*` but not `status().revision` (revision hashes head, branch, porcelain status, diffs and untracked digests only), the reviewed revision still matches after the fetch.

### Action outcomes (`packages/workspace/action-outcomes.ts`)

- In `execute`'s `write()`: for `fetch`, skip the head preflight (payload has only `revision`; check `revision` against `gitStatus`); for `pull`, keep the existing `expectedHead`/`revision` preflight. Route `fetch` → `this.github.fetch(projectId, threadId, beginWrite)` and `pull` → `this.github.pull(projectId, threadId, payload, beginWrite)`, calling `beginWrite` before the network step (like `create-pr`), so a failure before contacting GitHub is `not-applied`.
- `receiptResult` returns the bounded summary for both (no Git output in receipts). The client reloads `/git/sync` after the receipt.
- `inspect`: accept `fetch`/`pull` with `comparison.kind==='local'`, `target.kind==='local'`; for `fetch`, compare `p.revision` with `action.revision` and skip the head check (payload has no head).
- Route-level: `apps/server/workspace-routes.ts` needs no change for `/actions` (outcome types are dispatched by `workspaceActionTypeSchema`); add `app.get('/api/projects/:projectId/git/sync', …)` beside `/git` with `Cache-Control: no-store`, returning `projects.gitSync(projectId, threadId)`. Map `PULL_BLOCKED`, `FETCH_TIMEOUT`, `FETCH_FAILED`, `GITHUB_AUTH_REQUIRED` to 409/401 the same way existing `HarnessError`s are mapped (DISCOVERY T01: the global error handler that turns `HarnessError` into `{error:{code,message,details}}`).

### State machine (client)

`idle` → (Fetch) `fetching` → `idle` with new counts | `error`.
`idle` → (Pull) `pulling` (fetch phase) → `pulling` (fast-forward phase, label unchanged) → `idle` + toast "Pulled 5 commits from origin/feature" | `error`.
While `fetching` or `pulling`, both buttons are disabled and Refresh still works. A component unmount during a request ignores the result (existing `mounted` pattern).

### Visual design and motion

**Placement.** In `DiffBody`'s `.panel-toolbar`, replace `<span>{value?.branch}</span>` with a `RemoteSync` group: `[branch name] [sync chip] [Fetch] [Pull]`, then the existing Refresh and Staged controls. The group wraps as one unit (`flex-wrap: nowrap` inside, the toolbar already wraps). At panel widths < 360 px, Fetch and Pull collapse to icon-only buttons (accessible names unchanged).

**Branch name.** Unchanged text, `max-width: 18ch`, ellipsis, full name in the tooltip.

**Sync chip.** Height 22 px, padding `0 8px`, radius 11 px, `font: 500 12px/22px` with `font-variant-numeric: tabular-nums`, background `color-mix(in srgb, var(--text) 6%, transparent)`, text `var(--muted)`. Content by state:

| State | Content | Accent |
| --- | --- | --- |
| up-to-date | lucide `Check` 12 px + "Up to date" | icon `var(--success)` |
| ahead | lucide `ArrowUp` 12 px + `2` | text `var(--text)` |
| behind | lucide `ArrowDown` 12 px + `5` | text `var(--text)`, 1 px inset ring `color-mix(in srgb, var(--accent, var(--text)) 35%, transparent)` |
| diverged | `ArrowUp 2  ArrowDown 5` + lucide `GitFork` 12 px | icon `var(--danger)`; tooltip "Your branch and origin/feature both have new commits. Ask the agent to merge or rebase." |
| no-upstream | lucide `CloudOff` 12 px + "Not on remote" | muted |
| no-remote | "No GitHub remote" | muted |
| detached | "Detached" | muted |
| never fetched | the computed state from the frozen refs, plus a 6 px dot `var(--muted)` after the text; tooltip "Not fetched in this session. Counts may be out of date." | — |

Tooltip (existing `Tooltip`): first line the upstream short name (`origin/feature`), second "Fetched 3 min ago" (relative, via `apps/web/src/time-format.ts`; DISCOVERY T01 for the exact helper) or "Never fetched in this session".

**Buttons.** Existing toolbar button style. Fetch: lucide `RefreshCw` 14 px + "Fetch". Pull: lucide `ArrowDownToLine` 14 px + "Pull" and, when behind, the count "Pull 5". Pull disabled states show the reason in the tooltip and an `aria-describedby` hidden text: RUN_ACTIVE "Wait for the agent to finish before pulling.", NO_UPSTREAM "This branch is not on origin yet.", UP_TO_DATE "Already up to date.", AHEAD_ONLY "Nothing to pull. Your branch is ahead.", DIVERGED "Diverged — ask the agent or rebase.", DIRTY_OVERLAP "Commit or discard changes to <first path> (+N more) first; the pull changes them.", READ_ONLY hidden group.

**Motion.** All durations from tokens; with `prefers-reduced-motion: reduce`, every transform and spin below is removed and only opacity changes remain (≤ 120 ms).
- Fetch in progress: the `RefreshCw` icon rotates 360° per 900 ms linear, infinite, while `fetching`; label becomes "Fetching…". The chip keeps its old content at 60% opacity.
- Count change: when `ahead` or `behind` changes, the old number slides out 6 px upward and fades while the new one slides in from 6 px below, `var(--ui-motion-status)` with `var(--ui-ease-move)`; numbers that did not change do not move. The chip width animates with the same duration (`transition: width`, measured with a hidden sizer span).
- State to up-to-date after a Pull: the `Check` icon scales 0.6 → 1 with `var(--ui-motion-success)` and `var(--ui-ease-spring)`, the chip background flashes to `color-mix(in srgb, var(--success) 14%, transparent)` and back over 600 ms.
- Pull in progress: label "Pulling…", the `ArrowDownToLine` icon nudges 2 px down and back every 700 ms (ease-in-out), infinite while `pulling`.
- Error: chip and buttons do not shake; the error line under the toolbar fades in with `var(--ui-motion-status)`.
- Button press: existing `var(--ui-motion-press)` scale.

**Feedback copy.** Success toasts via `toast(message, {tone:'success'})`: "Fetched origin. 5 new commits on origin/feature." / "Fetched origin. No new commits." / "Pulled 5 commits from origin/feature." Screen-reader live region repeats the same text.

**Error copy (inline `p.error-text role="status"`, existing pattern).** `GITHUB_AUTH_REQUIRED`: "Sign in to GitHub to fetch from this repository." plus the `GitHubSignIn` control; `FETCH_TIMEOUT`: "Fetch timed out. Check your connection and try again."; `FETCH_FAILED`: "Fetch failed: <redacted git message>. Try again."; `PULL_BLOCKED`: the blocker sentence above; `REVISION_CHANGED`: "Your working copy changed. Refresh, then pull again."; `ACTION_UNCERTAIN`: "We could not confirm the pull finished. Check the branch, then Refresh." Never auto-retry.

**Themes.** Only existing tokens; verify contrast ≥ 4.5:1 for chip text and ≥ 3:1 for icons in light and dark (T06).

## EXECUTION_DAG

| ID | Goal | Depends on | Edits / files | Tests (positive / negative) | Done when | Handoff |
| --- | --- | --- | --- | --- | --- | --- |
| T01 | Discovery and contracts | — | Answer the DISCOVERY items (Git version and `--no-write-fetch-head`; `GitHubAuth.token()` error code; global `HarnessError` → HTTP mapping; time-format helper; existing Changes Playwright spec; path-guard writes for fetch). Record answers as an issue comment. Add `fetch`/`pull` to `workspaceActionTypeSchema` and payload schemas; add `packages/contracts/workspace-sync.ts`. | `tests/workspace-action-outcomes.test.ts` (or a new `tests/workspace-sync-contract.test.ts`): schemas accept valid payloads, reject extra keys, bad OIDs, negative counts. | `pnpm typecheck` passes; contract tests pass; discovery comment posted. | T02, T03 |
| T02 | Local sync read | T01 | `packages/workspace/tools.ts`: `sync()`, `gitSync()`, in-memory `lastFetched` map keyed by working-copy id. | `tests/project-tools.test.ts` with a real temp repo plus a local bare "remote" whose refs are copied into the private family: states up-to-date / ahead / behind / diverged / no-upstream / detached / no-remote; R2 order (config upstream beats same-name ref); `DIRTY_OVERLAP` true for overlapping modified, staged, untracked and renamed paths, false for non-overlapping; `RUN_ACTIVE` when the thread has `runId`; sync read performs no network (spy on `nativeGit` args: no `fetch`). | Tests pass; no network call in any sync test. | T04 |
| T03 | Fetch and fast-forward | T01 | `tools.ts` `gitFetch()`, `gitFastForward()`; `github.ts` `fetch()`, `pull()`, `remoteUrl` seam, error mapping. | `tests/github-workspace.test.ts` (or new `tests/git-remote-sync.test.ts`) with `remoteUrl` → `file://` bare repo: fetch moves `refs/remotes/origin/*` and nothing else (HEAD, index, porcelain unchanged); prune removes a deleted remote branch; anonymous path when signed out; helper argv present and token absent from argv when signed in; auth failure → `GITHUB_AUTH_REQUIRED`; timeout → `FETCH_TIMEOUT`. Pull: behind+clean → HEAD = remote tip; behind+non-overlapping dirty → fast-forward, dirty file intact; overlap → `PULL_BLOCKED` and byte-identical status; diverged/ahead/up-to-date/no-upstream/run active → `PULL_BLOCKED`; stale revision → `REVISION_CHANGED`. | Tests pass on Linux CI and the Windows reference machine. | T05 |
| T04 | Sync route | T02 | `apps/server/workspace-routes.ts`: `GET /api/projects/:projectId/git/sync`. | `tests/workspace-action-outcome-routes.test.ts` (or a new route test): 200 with schema-valid body; `no-store` header; unknown project 4xx; legacy project returns `READ_ONLY`. | Endpoint test passes; `pnpm build` passes. | T06 |
| T05 | Durable outcomes for fetch/pull | T03 | `packages/workspace/action-outcomes.ts`: routing, preflight, `beginWrite` placement, `inspect`. | `tests/workspace-action-outcomes.test.ts` + `-authority.test.ts`: confirmed receipts are bounded summaries; failure before network → `not-applied`; crash after `beginWrite` → `uncertain`; duplicate command id replays; revoked authority → `revoked`; inspect answers for both types. | Tests pass. | T06 |
| T06 | Changes toolbar UI | T04, T05 | New `apps/web/src/RemoteSync.tsx` + `apps/web/src/remote-sync.css` (imported where `workspace-tools.css` is); `WorkspaceSurfaceBody.tsx` `DiffBody` renders it, reloads `/git/sync` in `load()`, posts `fetch`/`pull` to `/actions`, shows `GitHubSignIn` on auth errors. Follow `pnpm lint` UI guard rules (`scripts/lint-ui.ts`). | Component/browser tests per T07; manual light/dark contrast check; reduced-motion check. | DESIGN visuals and copy match; `pnpm typecheck`, `pnpm lint`, `pnpm build` pass. | T07 |
| T07 | Validation | T06 | Playwright spec (existing Changes spec or new `tests/changes-remote-sync.spec.ts`) against a fixture project with a local bare remote via the `remoteUrl` seam; performance measurement script output attached to the issue. | Browser: chip states render; Fetch updates `↓1` after a remote commit; Pull fast-forwards and shows success; Pull disabled with reason during a run and with overlapping dirty file; no fetch request on panel open, focus, or turn completion (count POST `/actions` with `type:'fetch'` = 0); keyboard-only flow; screen-reader names. Real-user: Windows source build, signed-in GitHub, private throwaway repo, push from another clone, Fetch then Pull. | All acceptance rows A1–A10 have evidence posted on the issue. | T08 |
| T08 | Front end team review | T07 | Open the PR, attach screenshots (light/dark, each chip state, narrow width) and a short screen recording of Fetch and Pull, then send the finished work to the front end team for review and address their feedback before merge. | Review comments resolved. | Front end team approves the UI. | Maintainers |

Ownership: T02 and T03 both edit `tools.ts` in disjoint new methods; run them in sequence or coordinate on one branch. T04 and T05 touch different files. T06 owns all web files.

## VALIDATION

Setup: `source ~/.nvm/nvm.sh` (or the Windows Node 24 + pnpm 10 install from `docs/getting-started.md`), `pnpm install --frozen-lockfile`.

Commands (planned, not executed):
- `pnpm typecheck`
- `pnpm exec vitest run tests/project-tools.test.ts tests/github-workspace.test.ts tests/workspace-action-outcomes.test.ts tests/workspace-action-outcome-routes.test.ts tests/workspace-action-outcome-authority.test.ts --maxWorkers=1` (plus any new test files)
- `pnpm lint` and `pnpm test:ui-guard`
- `pnpm build`
- `pnpm test:e2e` scoped to the Changes spec (see `docs/getting-started.md#run-the-checks`)
- `pnpm test --maxWorkers=1` before requesting review

Fixtures: a temp project repo, a local bare repo as the remote (served through the `remoteUrl` seam), a second clone that pushes new commits to the bare repo; a thread with `runId` set for `RUN_ACTIVE`.

### Acceptance matrix

| ID | Criterion | Evidence |
| --- | --- | --- |
| A1 | `/git/sync` returns a schema-valid body with correct state for each case; never fetches. | T02, T04 tests |
| A2 | Upstream resolution follows R2 order. | T02 test |
| A3 | Fetch updates only `refs/remotes/origin/*`; allowed during a run; auth and timeout errors mapped. | T03 test |
| A4 | Pull fast-forwards a behind branch; refuses every non-behind state. | T03 test, T07 browser |
| A5 | Pull blockers enforced server-side; refusal leaves status and HEAD byte-identical. | T03 test |
| A6 | Zero unrequested fetches. | T02/T07 counters |
| A7 | Error copy and inline sign-in shown as specified. | T07 browser, screenshots |
| A8 | Legacy and non-GitHub projects show the specified reduced UI. | T04 test, T07 browser |
| A9 | Visuals, motion, reduced motion, keyboard and screen-reader behaviour match DESIGN in both themes. | T06/T08 screenshots and recording |
| A10 | Outcomes durable: not-applied / uncertain / confirmed / revoked / inspect for both types. | T05 tests |
| A11 | Front end team approved. | T08 review |

Release gate: A1–A11 green, CI green, no regressions in the existing outcome and Changes tests.

## STATE

- Researched/decided: this plan r1. Implemented: none. Verified: none. Tests executed: none (planned only).
- Owners/branches: none yet. This plan's docs PR adds only `docs/agent-plans/changes-pull-fetch.md` and its `scripts/public-source-files.json` entry.
- Risks: the path guard may reject fetch writes into the private family (T01/T03 discovery; fallback is a dedicated guard entry list for `refs/remotes`, `packed-refs`, `objects`); large repositories may exceed the 120 s Git timeout on first fetch (mapped to `FETCH_TIMEOUT`; a longer fetch timeout is a follow-up); SSH-only users with no GitHub sign-in on private repos must sign in through Gen.
- Next step: T01 discovery by the implementing agent after this plan is accepted.

## REFERENCES

- Codex: "Safe Pull latest" request — https://github.com/openai/codex/issues/28424
- Codex: remote ahead/behind counter stays stale until a manual fetch — https://github.com/openai/codex/issues/31534
- Claude Code: objection to unrequested background `git fetch` — https://github.com/anthropics/claude-code/issues/84698
- Related Gen plans: [thread-publish-pr.md (#1235)](https://github.com/skytuhua-org/Gen-V1/blob/8fa907f378127bcfc23d71b55c53625ffc43e8da/docs/agent-plans/thread-publish-pr.md); [composer branch chip #1610](https://github.com/skytuhua-org/Gen-V1/issues/1610).
- Git docs: `git fetch` (`--prune`, `--no-write-fetch-head`) https://git-scm.com/docs/git-fetch ; `git merge --ff-only` https://git-scm.com/docs/git-merge ; `git rev-list --left-right --count` https://git-scm.com/docs/git-rev-list
