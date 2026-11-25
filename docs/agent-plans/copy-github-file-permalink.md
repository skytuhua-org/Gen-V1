# Plan: Copy a permanent GitHub link to a project file

## META
- Feature: Copy a permanent GitHub link to a project file (medium). From a Project Files preview, copy an HTTPS `github.com` blob URL pinned to the exact commit, so a teammate sees the same version after the branch moves.
- Repo: skytuhua-org/Gen-V1.
- Plan revision: r1, 2026-11-22 (UTC).
- Baseline: `main` @ `2640b897a42739eba3785fc934af882996c07097`, verified with `git log -1` on a fresh clone and `GET /repos/skytuhua-org/Gen-V1/commits/main`. The documentation branch starts at this SHA.
- Existing issues/PRs: no permalink issue or PR found (title searches for `permalink` and `github link`). Related but separate work: [#1471](https://github.com/skytuhua-org/Gen-V1/issues/1471) “Copy a project-relative file reference” (open; plan PR [#1472](https://github.com/skytuhua-org/Gen-V1/pull/1472) open and unmerged; no copy control in `FilesView.tsx` or `ProjectFiles.tsx` at baseline); [#1654](https://github.com/skytuhua-org/Gen-V1/issues/1654) “Show who last changed a line in Files” (open plan; it also touches the preview header and guarded HEAD reads); line numbers plan PR [#1603](https://github.com/skytuhua-org/Gen-V1/pull/1603) (open). None of these is a dependency, and none has landed.
- Implementation status: NOT_STARTED. This delivery is documentation only, plus the required `scripts/public-source-files.json` entry. No application code, tests, or UI changed.
- Provenance: Bot feature research batch 12, row 6, and its scope note; baseline source inspection (REPO_MAP); GitHub docs and VS Code extension precedent (REFERENCES). The visual and motion specification below is part of this plan. It is not deferred to a designer.
- Publication: the canonical GitHub issue (labels `feature` + `medium`) carries this complete plan in its body. This identical file lands at `docs/agent-plans/copy-github-file-permalink.md` through a docs-only PR that the planning worker does not merge. The issue links the file by commit SHA.

## OBJECTIVE
**User problem.** A user reading a file in Project Files wants to point a teammate at it on GitHub. Today they must open GitHub, find the repository, switch to the right commit, browse to the path and press `y`. Copying a branch URL is wrong: when the branch moves, the teammate sees different code, or a 404.

**Intended behavior.** With a tracked text file open in the Project Files preview, one click on **Copy GitHub permalink** writes a URL such as `https://github.com/acme/widgets/blob/4f2c9e1d7a0b3c5e8f9a1b2c3d4e5f60718293a4/src/reader.ts` to the clipboard. The URL uses the full 40-hex commit SHA and encoded path segments. Gen offers the link only when it can prove from local Git state that:
1. the displayed bytes are exactly the file's blob at `HEAD`, and
2. `HEAD` is contained in the last-fetched upstream ref on the admitted GitHub `origin`.
Otherwise the control explains why no link is available. Gen never falls back to a branch URL. Generating the link makes no network request.

**Measurable success.** In a fixture repository whose `origin` is `https://github.com/acme/widgets.git` and whose `refs/remotes/origin/main` contains `HEAD`:
- opening `src/reader.ts` and activating the control copies exactly `https://github.com/acme/widgets/blob/<HEAD full SHA>/src/reader.ts`;
- `docs/My Notes #1.md` copies `.../blob/<sha>/docs/My%20Notes%20%231.md`;
- after one local commit not on `origin/main`, editing the file without committing, or opening an untracked file, the control does not copy and shows the matching reason from the DESIGN table;
- across all cases, zero requests reach `github.com` or any other network host.

## REQUIREMENTS

### In scope (v1)
| ID | Requirement |
| --- | --- |
| R1 | One **Copy GitHub permalink** action in the Project Files preview header for the selected file. Not offered in Granted Files, search-result rows, breadcrumbs, the tree, or the composer. |
| R2 | The URL form is `https://github.com/<owner>/<repo>/blob/<full commit SHA>/<path>`. `<owner>/<repo>` comes from the sanitized admitted `origin` with a trailing `.git` removed. The SHA is the full 40-hex `HEAD` object ID. Never use a short SHA, branch name, tag or `HEAD`. `<path>` is the project-root-relative path split on `/`, with each segment encoded by `encodeURIComponent`. No query, fragment, line anchor, `?raw` or `plain=1`. |
| R3 | Eligibility, all required, decided server-side under the existing project binding and guarded Git boundary: (a) the client's accepted preview SHA-256 equals the SHA-256 of the bytes the server reads now; (b) those bytes are text (no NUL) and valid UTF-8 that round-trips exactly; (c) `HEAD` is on a local branch (not detached, not unborn); (d) the file is tracked at `HEAD` as a regular blob (mode `100644` or `100755`), not a symlink (`120000`) or submodule (`160000`); (e) the Git blob ID of the exact read bytes, computed with no filters, equals the `HEAD` tree entry's object ID; (f) the branch's upstream resolves to a remote-tracking ref under `refs/remotes/origin/`, and `HEAD` is reachable from that ref; (g) `origin` is an admitted `https://github.com/owner/repo(.git)` or `git@github.com:owner/repo(.git)` URL. |
| R4 | “Upstream” is the bound branch's configured upstream when `branch.<name>.remote` is `origin` and `branch.<name>.merge` is `refs/heads/<x>`, which maps to `refs/remotes/origin/<x>`. If no upstream is configured, it is `refs/remotes/origin/<same branch name>`. A configured upstream on any other remote means unavailable (`upstream-not-origin`). Managed import does not copy `branch.*` config (REPO_MAP), so the fallback is expected there. T01 verifies both paths. |
| R5 | The basis is shown as last-fetched local state. Success feedback names the short SHA and upstream ref and says the link is based on the last fetch, and that people need access to `<owner>/<repo>` to open it. Gen does not check GitHub visibility or permissions. |
| R6 | No network I/O while checking or copying: no `fetch`, `ls-remote`, `gh`, GitHub API, lazy partial-clone fetch, or credential prompt. No Git writes: no `hash-object -w`, no ref, index or config changes, no `push`. |
| R7 | Clipboard writes happen only on explicit activation, with the existing renderer Clipboard API path. Success says “Copied GitHub link”. Rejection or an unavailable clipboard announces “Copy failed. Try again.” with no success state, and the action stays retryable. |
| R8 | Stale-safety: a result applies only to the preview (project, thread, path, SHA-256, refresh generation) it was requested for. Changing file, folder, project or thread, or a manual Refresh, discards in-flight results. While the preview read is pending, refreshing, or failed, no link is offered, even if old content stays visible. |
| R9 | Accessibility and visuals follow DESIGN §5: keyboard and touch operable, named states, one polite status per activation, both themes, a 360px-wide panel, forced colors, and reduced motion. |
| R10 | Errors are contained. Binding or authority failures keep the existing HarnessError behavior. Unexpected Git failures show `unavailable: check-failed` with Retry, never a guessed URL. |

### Out of scope (v1)
- Line or line-range anchors (`#L10-L20`), selection-based links, blame (#1654), and the line-number UI (#1603).
- Fetching, pushing, or offering to push or publish; GitHub permission or visibility checks; Enterprise or other hosts (GitLab, Bitbucket); remotes other than `origin`.
- Branch or tag URLs, and “latest on branch” links.
- Copying the relative path or `path:line`. That is #1471; this plan must coexist with it in the same header (DESIGN §4).
- Granted Files, binary files, files over the existing 1 MiB preview limit (the preview read fails first), directories, SHA-256 object-format repositories (GitHub does not host them, and the managed config guard already rejects `[extensions]`).
- New settings, capability flags, telemetry, persistence, or dependencies.

### Decisions (agreed) vs choices made in this plan
- Agreed in the batch 12 scope note: HTTPS `github.com` blob URL; tracked text preview only; exact displayed bytes must match HEAD; HEAD must be reachable from the bound last-known upstream on admitted `origin`; label the basis as last-fetched; say recipients need access; sanitized repo identity, full SHA, encoded segments; decline ambiguous origins, changed files and unverified commits; never silently copy a branch URL; no ranges, fetch, push, permission changes or network.
- Decided here: eligibility is computed server-side in one read-only GET route, not from client-side Git knowledge. The client prefetches eligibility when a preview settles, so a click copies synchronously inside the user gesture. A click does not wait on a network round trip, so browser user-activation rules cannot reject the clipboard write. The blob ID is computed in Node from the same bytes whose SHA-256 the preview showed, not with `git hash-object`, so no filters run and nothing is written. Ancestry uses `git rev-list --max-count=1 <upstream>..<head>`: empty output means reachable, and it exits 0 either way, unlike `merge-base --is-ancestor`, whose exit 1 `nativeGit` treats as an error.
- Options rejected: building the URL in the renderer from `/git` status (status has no upstream or blob identity); `git hash-object --stdin` (runs filters unless `--no-filters`, and adds a subprocess); prompting to push when unpublished (a write and out of scope); copying a branch URL with a warning (explicitly forbidden).

### UX, compatibility, performance, security, privacy
- Compatibility: additive route and contract; old clients ignore it; a new client against an old server gets 404 and hides the control.
- Performance: one eligibility request per settled preview. It runs at most 5 small Git subprocesses, reuses the 1 MiB bounded read, and must finish in ≤150 ms median on a 10k-commit fixture (T06 measures this). No polling.
- Security: path validation and binding reuse `ProjectTools.file` rules (inside worktree, no `.git` segment). Git runs through `nativeGit` with its hardening and `--literal-pathspecs`. Arguments are fixed verbs plus resolved object IDs and a literal path after `--`, never a user-supplied ref string. A credential-bearing origin URL fails the anchored regex and is never echoed.
- Privacy: the URL contains only the public-form repository identity, SHA and relative path. No absolute local path, user name or token reaches the clipboard or logs.

## REPO_MAP
All locations were verified at baseline `2640b897` unless marked DISCOVERY.

| Surface | Evidence and use |
| --- | --- |
| `apps/web/src/files/ProjectFiles.tsx` | `interface ProjectFile {text:string\|null; binary:boolean; sha256:string}` (l.19–23). Selection state holds folder, selected entry and selected search match (l.41–46). Reads go through `authenticated(() => fetch(base + "/file?" + params, {credentials:"same-origin", cache:"no-store", signal})).then(read<ProjectFile>)` (l.52–85) with `threadId` preserved. Preview body, binary and empty notices, match highlight and SHA-256 at l.147–188. Refresh at l.195–211. The response has no path, size, HEAD or repository identity; the path comes from selection state. |
| `apps/web/src/files/FilesView.tsx` | `displayFilePath(path)` (l.24–34) escapes control characters for display only. `FilesEntry {name; path; kind; bytes?}` (l.36–41). `FilesView({...})` (l.42–77) has no preview-action slot. The preview header (l.307–317) renders `<strong title=...>{displayFilePath(selected.name)}</strong>` and an optional `<a download>Download</a>`. |
| `apps/web/src/files/useFilesRead.ts` | `useFilesRead<T>(key, enabled, read)` (l.12–78) aborts obsolete requests and drops late ones. A same-key refresh retains old accepted content while pending or failed, so R8 must check pending/error explicitly. |
| `apps/web/src/files/files.css` | `.files-actions` (l.28–49), shared Files button sizing (min-height 32px, radius 6px, hover `var(--hover)`, focus 2px `var(--ui-focus-ring)` offset −2px). Preview header (l.166–185): flex, `gap:12px`, `padding:12px var(--files-inset)`, bottom border, 13px. The filename is ellipsized, and the Download link is 12px. |
| `apps/web/src/CopyButton.tsx` | `CopyButton({text, label='Copy'})`: `navigator.clipboard.writeText`, a generation guard against stale completion, `Copy`→`Check` (lucide, 14px) for 1600 ms, sr-only `role=status` “Copied”, and failure toast `'Copy failed. Select the text and copy manually.'`. Class `icon-button copy-button`. No icon, message or disabled props. Covered by `tests/copy-button-ownership.test.ts`. |
| `apps/web/src/styles.css` | Theme colors (l.3–4: `--text`, `--muted`, `--border`, `--hover`, `--accent-fg`, `--success-fg`, `--warning-fg`, `--danger-fg` with dark overrides). `.icon-button` 32×32, radius 7px, muted to text on hover (l.53–55). Reduced-motion block at l.351. |
| `packages/ui-shell/tokens.css` | Motion tokens: `--ui-motion-hover:120ms`, `--ui-motion-press:80ms`, `--ui-motion-status:160ms`, `--ui-motion-success:240ms`, `--ui-motion-remove:140ms`; easings `--ui-ease-enter: cubic-bezier(.16,1,.3,1)`, `--ui-ease-move: cubic-bezier(.4,0,.2,1)`, `--ui-ease-spring: cubic-bezier(.2,.9,.2,1.1)`; spacing `--ui-space-1..6`; `--ui-focus-ring`. |
| `apps/server/workspace-routes.ts` | `registerWorkspaceRoutes(app, service)` (l.27). Local `querySchema` (l.22): optional `threadId`, path ≤1024. `GET /api/projects/:projectId/file` (l.70) calls `projects.file(projectId, threadId, path)`. The git status and comparison routes at l.47–58 are the pattern for a new GET. Routes sit behind the Host/Origin and session-cookie hooks in `apps/server/server.ts:79–93`. |
| `packages/workspace/tools.ts` | `binding(projectId, threadId?)` (l.71–78) handles authority, thread ownership and the dev/ino identity check. `git(path, args, signal?, env?)` (l.53). The managed config guard (l.98) denies `include`, `filter` and `extensions` sections. `gitStatus` uses `exclusive` plus managed/legacy guarded views (l.133–156). `gitReviewOrigin(projectId, threadId?)` (l.158–166) returns the managed origin, or the Store-attested `family.origin` for legacy. `file(...)` (l.204) uses `realpath`, an inside-worktree check, rejection of `.git` segments, and `readBoundFile(target, 1 MiB)`, then returns `{text, binary (NUL), sha256}`. Note that `realpath` means a tracked symlink previews its target's bytes. |
| `packages/workspace/git-storage.ts` | `PrivateGitFamily {projectId, commonDirectory, commonDirectoryIdentity, origin?}` (l.11). `nativeGit(executable, metadata, worktree, args, signal, env)` (l.28–34) disables hooks, replace objects, external diff, credential helper and fsmonitor, with a 120 s timeout and 4 MiB output cap; any nonzero exit throws. `importGitFamily` (l.100–131) admits only an anchored GitHub origin, writes `[remote "origin"] url=… fetch=+refs/heads/*:refs/remotes/origin/*`, and **does not copy `branch.*` config**. `withLegacyGitView` (l.132+) is a temporary tracked-file projection. |
| `packages/capabilities/process.ts` | Env allowlist with `GIT_CONFIG_NOSYSTEM=1`, null global config, no prompts and `GIT_NO_LAZY_FETCH=1`; `shell:false` (l.14–21). |
| `packages/workspace/github.ts` | `repo()` (l.58) and `comparisonRepository()` (l.80–83) parse the origin with `/^(?:https:\/\/github\.com\/\|git@github\.com:)([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?)(?:\.git)?$/`. This is the precedent for repo identity. No shared exported parser exists. |
| `packages/workspace/code-review.ts` | `readLocalComparisonFile` (l.213–277) produces diffs, not HEAD blob reads. It is not reusable for R3(e). |
| `packages/contracts/code-review.ts` | Precedent for zod contracts shared by server and web. |
| Tests | `tests/private-git-family.test.ts` (l.17 portable real-Git `fixture()` with `ProjectTools`), `tests/managed-git-family.test.ts`, `tests/git-metadata-guard.test.ts`, `tests/workspace-linked-pr.test.ts` (routes plus real auth hooks), `tests/files-read-commit-owner.test.ts`, `tests/copy-button-ownership.test.ts`, browser `tests/e2e/files-reading.spec.ts` with `files-reading-fixture.tsx`, `files-reading.playwright.config.ts` and `files-reading.vite.config.ts`. `tests/project-tools.test.ts:11` hardcodes a Windows Git path; do not copy it. |
| `scripts/public-source-files.json` | New source and test files must be added in sorted order (`tests/public-source.test.ts`). |
| DISCOVERY (T01) | Whether managed families and legacy views expose `refs/remotes/origin/*` from the original checkout (import copies refs entries, but this is unverified) and whether legacy views carry `branch.*` config. Whether `ProjectTools.git` accepts the global `--literal-pathspecs` option before the verb. Exact error-to-HTTP mapping for HarnessError in routes. Whether #1471 or #1654 has landed header actions by implementation time. |

## DESIGN

### 1. Contract (new, proposed): `packages/contracts/github-file-link.ts`
```ts
import {z} from 'zod';
export const GitHubFileLinkReasonSchema = z.enum([
  'no-origin','origin-not-github','detached-head','unborn-head',
  'no-upstream','upstream-not-origin','not-on-upstream',
  'untracked','not-regular-file','changed','binary','not-utf8',
  'preview-stale','changed-during-check','check-failed']);
export const GitHubFileLinkSchema = z.discriminatedUnion('state',[
  z.object({state:z.literal('ready'), url:z.string().url().startsWith('https://github.com/'),
    commit:z.string().regex(/^[0-9a-f]{40}$/), repository:z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/),
    upstream:z.string().max(300), path:z.string().min(1).max(1024)}),
  z.object({state:z.literal('unavailable'), reason:GitHubFileLinkReasonSchema})]);
export type GitHubFileLink = z.infer<typeof GitHubFileLinkSchema>;
```
`upstream` is the display form `origin/<x>`. The web client validates the response with this schema and treats a parse failure as `check-failed`.

### 2. Route (new): `GET /api/projects/:projectId/file/github-link?path=&sha256=&threadId=`
Register it in `workspace-routes.ts` next to `/file`. The query extends the local `querySchema` with a required nonempty `path` and `sha256: /^[0-9a-f]{64}$/i`. It calls `projects.githubFileLink(projectId, threadId, path, sha256)` and returns `GitHubFileLink`. Binding or authority errors propagate as the existing HarnessError responses. It is GET and read-only, so no CSRF change.

### 3. Server algorithm: `ProjectTools.githubFileLink` (in `tools.ts`), helpers in new `packages/workspace/github-file-link.ts`
Pure helpers, unit-testable:
- `parseGitHubOrigin(url): {owner, repo} | null`: the same anchored regex as `github.ts`, strip `.git`, reject a `.` or `..` repo name. Optionally refactor `github.ts` to reuse it in a separate follow-up, not in this PR.
- `gitBlobId(bytes)`: `sha1('blob ' + bytes.length + '\0' + bytes)` as lowercase hex.
- `githubBlobUrl(owner, repo, commit, path)`: `'https://github.com/' + owner + '/' + repo + '/blob/' + commit + '/' + path.split('/').map(encodeURIComponent).join('/')`.
- `upstreamRef(branch, config)`: implements R4 and returns `refs/remotes/origin/<x>`, or a reason.

Steps (inside `this.exclusive(projectId, …)` and the same managed/legacy guarded read used by `gitStatus`; abort signal from the request):
1. `binding()` and path validation exactly as `file()`: `pathName`, `realpath` inside the root, no `.git` segment, and a path that is single-line relative with no empty, `.` or `..` segments, backslash, or control characters. A failing path gets the same CAPABILITY_DENIED as `file()`.
2. Origin: `gitReviewOrigin` → `parseGitHubOrigin`. A missing origin, or a thrown GITHUB_REMOTE_REQUIRED, maps to `no-origin`; a mismatch maps to `origin-not-github`.
3. `rev-parse --symbolic-full-name HEAD`: the output `HEAD` means `detached-head`. Then `rev-parse --verify --quiet HEAD^{commit}`, wrapped: a throw on an existing branch means `unborn-head`. Record `head` (40 hex).
4. Upstream: read `config --get branch.<b>.remote` and `branch.<b>.merge` via `config --get-regexp ^branch\.<escaped b>\.(remote|merge)$`. Wrap the exit-1 “no match” case: treat a throw with empty stderr as absent. T02 confirms how `nativeGit` surfaces this, or uses `config --list --null` and filters in Node to stay zero-exit; the second option is preferred. Map with `upstreamRef`. Then `for-each-ref --format=%(refname)%00%(objectname) refs/remotes/origin/` and pick the exact refname in Node. If absent: `no-upstream`.
5. Ancestry: `rev-list --max-count=1 <upstreamOid>..<head>`. Nonempty output means `not-on-upstream`.
6. Tree entry: `--literal-pathspecs ls-tree -z --full-tree <head> -- <path>`. Parse exactly one `<mode> <type> <oid>\t<path>\0` entry whose path byte-equals the request. None: `untracked`. Mode `120000`, `160000`, or type not `blob`: `not-regular-file`.
7. Bytes: `withPathGuard` plus `readBoundFile(target, 1 MiB)`, as `file()` does. If `sha256(bytes) !== request.sha256`: `preview-stale`. If it contains NUL: `binary`. If `Buffer.from(bytes.toString('utf8'),'utf8')` is not byte-equal: `not-utf8`. If `gitBlobId(bytes) !== oid`: `changed`. This covers uncommitted edits and checkout filters (CRLF or eol conversion), which correctly decline.
8. Re-read `HEAD^{commit}` and the upstream ref object. If either changed: `changed-during-check`.
9. Return `ready` with `githubBlobUrl(...)`, `commit:head`, `repository:'owner/repo'`, `upstream:'origin/<x>'`, and `path`.

Any unexpected throw inside steps 2–8 that is not an authority error returns `{state:'unavailable', reason:'check-failed'}`. The server logs only the reason code, never the path or origin.

### 4. Client: `ProjectFiles.tsx`, `FilesView.tsx`, `CopyButton.tsx`
- `FilesView` gains an optional `previewActions?: ReactNode`, rendered in a new `<div className="files-preview-actions">` in the header before Download. Granted Files does not pass it. If #1471 has landed its own slot or copy target, reuse it and place the permalink button immediately after the relative-path button. Order: Copy relative path, Copy GitHub permalink, Download.
- `ProjectFilesReader` derives `linkKey = accepted ? [projectId, threadId, path, sha256, refreshGeneration] : null`. Accepted means a selected project file whose read has settled with no pending or error state and `binary === false`. A new `useGitHubFileLink(base, linkKey)` hook, built on `useFilesRead` or the same abort/generation pattern, fetches `base + '/file/github-link?' + params` with `authenticated`, `credentials:'same-origin'` and `cache:'no-store'`, then parses it with `GitHubFileLinkSchema`. A 404 hides the control for the session (old server).
- States: `hidden` (no accepted text preview, `no-origin`, `origin-not-github`, or 404); `checking`; `ready`; `unavailable(reason)`.
- `CopyButton` gets backward-compatible optional props: `icon?: LucideIcon` (default `Copy`), `copiedLabel?: string` (default `'Copied'`), `failureMessage?: string` (default unchanged), `onCopied?: () => void`, `disabled?: boolean`, `describedBy?: string`. Other call sites stay unchanged; `tests/copy-button-ownership.test.ts` must still pass.
- Click on `ready`: synchronous `writeText(url)` through CopyButton. On success, show the success note (§5). On `unavailable`, the button is `aria-disabled="true"` rather than `disabled`, so it stays focusable and explains itself. Activating it shows the reason note and does not touch the clipboard. On `check-failed` the note includes a **Retry** text button that bumps the generation.

| Reason | Note text (exact) |
| --- | --- |
| checking | `Checking GitHub link…` (tooltip only; no note) |
| detached-head | `No GitHub link: HEAD is detached. Check out a branch.` |
| unborn-head | `No GitHub link: this branch has no commits yet.` |
| no-upstream | `No GitHub link: no fetched origin branch for <branch>.` |
| upstream-not-origin | `No GitHub link: this branch tracks a remote other than origin.` |
| not-on-upstream | `No GitHub link: commit <short> isn’t on origin/<x> yet. Push, then fetch.` |
| untracked | `No GitHub link: this file isn’t committed.` |
| not-regular-file | `No GitHub link: links are only available for regular files.` |
| changed | `No GitHub link: this file differs from the committed version.` |
| binary / not-utf8 | `No GitHub link: only text files can be linked.` |
| preview-stale / changed-during-check | `No GitHub link: the file changed. Refresh and try again.` |
| check-failed | `Couldn’t check the GitHub link.` + `Retry` |
| success | `Copied link to <short sha> on origin/<x> (last fetch). People need access to <owner>/<repo> to open it.` |

For `no-upstream` and `not-on-upstream`, the server returns the branch, short SHA and upstream in an optional `detail` object added to the unavailable variant, `{branch?: string, commit?: string, upstream?: string}`, all validated. The `<x>`, `<branch>` and `<owner>/<repo>` values render as text, never HTML.

### 5. Visual design and animation (complete; no external design step)
- **Placement.** The header row stays `filename … actions`. `.files-preview-actions { display:flex; align-items:center; gap:var(--ui-space-1); flex-shrink:0; }`. The filename keeps its ellipsis and `min-width:0`. Actions never wrap. At ≤360px panel width, Download collapses to its icon (lucide `Download`, 14px, accessible name “Download <name>”). This applies only if the header would otherwise overflow; T05 implements it with a container query on `.files-preview`.
- **Button.** `.icon-button` 32×32, radius 7px, 14px lucide `Link2` icon, color `var(--muted)`; hover background `var(--hover)` and color `var(--text)`. Accessible name and tooltip `Copy GitHub permalink`. Focus-visible: 2px `var(--ui-focus-ring)` outline, offset −2px, matching Files. Touch: hit area of at least 32×32 with 4px spacing to neighbors.
- **States.** *Checking:* icon at 50% opacity, `aria-disabled="true"`, `aria-busy="true"`, tooltip `Checking GitHub link…`, no spinner. *Ready:* normal. *Unavailable:* icon `var(--muted)` at 60% opacity, `aria-disabled="true"`, tooltip is the reason text, cursor `default`, and the hover background still shows so it reads as interactive. *Copied:* icon swaps to `Check` in `var(--success-fg)` for 1600 ms, tooltip `Copied GitHub link`. *Failure:* no check; the note shows `Copy failed. Try again.` in `var(--danger-fg)`.
- **Note line.** `.files-permalink-note` is a full-width row directly under the header and above the preview content, inside `.files-preview`. It has `padding: var(--ui-space-1) var(--files-inset) var(--ui-space-2)`, 12px text, line-height 16px, color `var(--muted)` (success and unavailable) or `var(--danger-fg)` (failure and check-failed), and a bottom border `1px solid var(--border)`. Text wraps, with no truncation. The short SHA, `origin/<x>` and `<owner>/<repo>` use the monospace stack at 11.5px. The Retry button is a text button, 12px, `var(--accent-fg)`, underline on hover. Only one note shows at a time, and a new activation replaces it. It auto-dismisses after 6 s (success) or stays until the selection changes (unavailable, failures). It has `role="status"` and `aria-live="polite"` and is the button's `aria-describedby`. CopyButton's own sr-only “Copied” is suppressed (via `copiedLabel` plus the note) so only one announcement is made.
- **Motion.** Icon swap to Check: scale .85→1 and opacity 0→1 over `--ui-motion-success` (240ms) with `--ui-ease-spring`. Revert to Link2: opacity only, `--ui-motion-status` (160ms), `--ui-ease-move`. Note enter: opacity 0→1 and `translateY(-2px)`→0 over `--ui-motion-status` with `--ui-ease-enter`; its height appears immediately, so no layout animation and the content does not slide. Note exit: opacity 1→0 over `--ui-motion-remove` (140ms) with `--ui-ease-move`, then removal. Hover color and background: `--ui-motion-hover`. Press: `scale(.96)` over `--ui-motion-press`. Checking→ready: icon opacity transition, `--ui-motion-status`.
- **Reduced motion** (`prefers-reduced-motion: reduce`, and the app's existing reduced-motion selector at `styles.css:351`): all of the above transitions become 0ms with no transform; state, text and focus are unchanged.
- **Themes and forced colors.** Use tokens only, no new colors. Verify contrast of `--muted` and `--danger-fg` on `--surface` in light and dark (≥4.5:1 for 12px text). In `forced-colors: active`, the icon uses `ButtonText`, aria-disabled uses `GrayText`, the focus outline uses `Highlight`, and the note border uses `CanvasText`.
- **Focus.** Activation never moves focus. If the selection changes while the button has focus, focus stays on the header (React keeps the same button element). If the button unmounts because the state became hidden, focus goes to the preview `File content` region, following the existing focus-retention rule (`tests/ui-focus-retention.test.ts`).

### 6. Errors, cancellation, races
- Aborting on key change cancels the HTTP request. The server's `exclusive` queue completes, but its result is dropped client-side.
- A stale success (the generation changed after `writeText` resolved) shows no note. This is the CopyButton generation guard. The OS write the user started cannot be undone, and that is acceptable.
- No retries happen automatically. Retry is user-initiated only.

### 7. Security, compatibility, rollback
- Read-only, behind existing auth and binding. No new capability. Git args contain no user ref strings. The path goes after `--` with `--literal-pathspecs`, so pathspec magic like `:(glob)` is literal.
- Rollback is a revert of the implementation PR. There is no persisted state or migration.

## EXECUTION_DAG
| ID | Goal | Depends | Owner boundary |
| --- | --- | --- | --- |
| T01 | Discovery: verify remote-tracking refs, branch config, git option passing, error mapping, overlap with #1471/#1654 | — | read-only; checkpoint on canonical issue |
| T02 | Pure helpers and contract | T01 | `packages/workspace/github-file-link.ts`, `packages/contracts/github-file-link.ts`, unit tests |
| T03 | Server eligibility method and route | T02 | `tools.ts` (new method only), `workspace-routes.ts` (one route), real-Git tests |
| T04 | Client hook, header slot, CopyButton props | T02 (contract), T03 for integration | `ProjectFiles.tsx`, `FilesView.tsx`, `CopyButton.tsx`, new hook file |
| T05 | Visual states, note line, motion, reduced motion, forced colors, narrow layout | T04 | `files.css`, markup in `FilesView.tsx` |
| T06 | Adversarial, no-network, performance tests | T03, T05 | tests only; coordinate fixes with T03/T04 owners |
| T07 | Browser end-to-end and real-repo evidence | T06 | files-reading e2e fixture/spec, evidence on issue |
| T08 | Send finished work to the front end team for review | T07 | implementation PR + canonical issue handoff |

**T01 Discovery.** Read this whole issue and its comments. Search open PRs for `FilesView`/`files.css` changes (#1471/#1472, #1654, #1603) and claim scope per AGENTS.md. Verify with a managed and a legacy project fixture:
- that `refs/remotes/origin/*` from the source checkout exist in the private family and are readable through the legacy view;
- whether `branch.<b>.merge` survives (expected: not in managed);
- that `ProjectTools.git` and `nativeGit` pass `--literal-pathspecs` before the verb, and that `config --list --null` works under the null global config;
- how a HarnessError maps to HTTP status in `workspace-routes.ts`.
Record the findings in a checkpoint. *Done when:* each REPO_MAP DISCOVERY item has a verified answer or a recorded fallback. If remote-tracking refs are not available in managed families, BLOCK T03 and post the gap. Do not substitute a network fetch.

**T02 Helpers and contract.** Create the contract (DESIGN §1, plus the optional `detail`) and the helpers (§3). Add both files and `tests/github-file-link.test.ts` to the manifest in sorted order. *Positive:* parse `https://github.com/acme/widgets.git`, `git@github.com:acme/widgets`, and `acme/my.repo`; blob ID of the empty file is `e69de29bb2d1d6434b8b29ae775ad8c2e48c5391` and of `hello\n` is `ce013625030ba8dba906f756967f9e9ca394464a`; URL encoding for spaces, `#`, `%`, `?`, Unicode `é`, and a leading-dot file. *Negative:* reject `http://`, `https://user:tok@github.com/...`, `github.com.evil.com`, `ssh://...`, a trailing slash, an extra path segment, `..` as the repo, and an empty path. *Done when:* `pnpm exec vitest run tests/github-file-link.test.ts` passes.

**T03 Server.** Add `ProjectTools.githubFileLink` per DESIGN §3 and the route per §2. Add real-Git cases to new `tests/github-file-link-tools.test.ts`, reusing the portable fixture pattern from `tests/private-git-family.test.ts:17`. Simulate “last fetched” with `git update-ref refs/remotes/origin/main <sha>`; never use network. Cases:
- ready;
- configured upstream to `origin/release`;
- `upstream-not-origin`;
- `no-upstream`;
- `not-on-upstream` (one local commit);
- `untracked`;
- `changed` (edit);
- `changed` with `core.autocrlf=true` on CRLF checkout;
- symlink (`not-regular-file`);
- submodule gitlink;
- `binary`, `not-utf8`;
- `preview-stale` (wrong sha256);
- `detached-head`, `unborn-head`;
- `origin-not-github`, `no-origin`;
- managed and legacy views both.
Add route coverage to `tests/workspace-linked-pr.test.ts` or a sibling: auth hook required, cross-thread binding denied, bad sha256 rejected (400). *Done when:* these tests and `pnpm typecheck` pass.

**T04 Client.** Add `useGitHubFileLink` (new `apps/web/src/files/useGitHubFileLink.ts`, in the manifest), the `previewActions` slot, the CopyButton props, and the state machine (§4). Granted Files is unchanged. *Positive:* ready copies the exact URL. *Negative:* a pending refresh, failed refresh, binary preview, directory change or thread change shows no ready state, and a late response for an old key is ignored. *Done when:* the unit tests (CopyButton ownership plus new hook tests with a mocked fetch) pass.

**T05 Design.** Implement §5 in `files.css` and the markup. Use no new tokens or colors, and no overlay or popover (the note is in flow). Run `pnpm lint:ui`, `pnpm test:ui-guard`, and `pnpm exec vitest run tests/ui-focus-retention.test.ts tests/overlay-motion.test.ts tests/reduced-motion-coverage.test.ts`. *Done when:* these pass and screenshots exist for every state in light, dark, 360px, forced colors and reduced motion.

**T06 Adversarial, no-network and performance tests.** Spy on `nativeGit` args in the tools tests. Assert that no `fetch`, `ls-remote`, `push`, `hash-object` or `update-ref` appears across all cases, and that every arg after the verb is a fixed flag, a 40-hex OID, `--` or the literal path. Race test: move HEAD between steps 5 and 8, which returns `changed-during-check`. Pathspec magic path `:(glob)*` resolves literally. Benchmark ≤150 ms median on a 10k-commit synthetic repo; record the numbers. *Done when:* all pass and the numbers are posted.

**T07 End-to-end.** Extend `tests/e2e/files-reading-fixture.tsx` with a synthetic `/file/github-link` adapter and add specs to `files-reading.spec.ts`:
- ready copy, with clipboard permission granted and `navigator.clipboard.readText()` equal to the expected URL;
- each reason's exact note text;
- hidden for no-origin;
- stale switch (respond slowly for file A, open B, and confirm that no A link is copied);
- Refresh triggers a re-check;
- clipboard rejection shows the failure note;
- keyboard only (Tab to button, Enter);
- reduced motion with zero transition durations;
- a 360px viewport.
Fail the test on any request to a host other than the Vite origin (`page.route('**', …)` guard). Run `pnpm exec playwright test --config tests/e2e/files-reading.playwright.config.ts`. Then, manually, against a real local clone of a public GitHub repo opened in the desktop app: copy a link, open it in a browser, and confirm the same bytes appear (record the URL and a screenshot). *Done when:* all pass and the evidence is on the issue.

**T08 Final task: send finished work to the front end team for review.** Input: the finished implementation and evidence from T07, not this plan. Post a handoff on the canonical issue and implementation PR addressed to the front end team. Include:
- the commit-pinned source and this plan's revision;
- screenshots of every state (checking, ready, copied, each unavailable note, failure, Retry) in both themes, at 360px, in forced colors and with reduced motion;
- a short screen recording of the motion;
- the exact checks run and their results, keyboard and screen-reader notes, the performance numbers, and known limits.
Ask them to review the placement next to #1471's control, the note-line copy and tone, the icon choice (`Link2`), motion timing, and accessibility against DESIGN §5. *Done when:* the front end team acknowledges and their requested changes are resolved or explicitly deferred, before the maintainer merges.

## VALIDATION
### Setup
From the repo root: `source ~/.nvm/nvm.sh` (Node 24, pnpm 10), then `pnpm install --frozen-lockfile --ignore-scripts`. For browser tests, also run `pnpm exec playwright install chromium`. Git fixtures are disposable temp repos with a fake `origin` URL and `update-ref`-simulated remote-tracking refs. Never use network.
```sh
pnpm exec vitest run tests/github-file-link.test.ts tests/github-file-link-tools.test.ts tests/workspace-linked-pr.test.ts tests/copy-button-ownership.test.ts tests/files-read-commit-owner.test.ts tests/private-git-family.test.ts
pnpm typecheck
pnpm lint:ui
pnpm test:ui-guard
pnpm exec vitest run tests/ui-focus-retention.test.ts tests/overlay-motion.test.ts tests/reduced-motion-coverage.test.ts
pnpm build
pnpm exec playwright test --config tests/e2e/files-reading.playwright.config.ts
pnpm exec vitest run tests/public-source.test.ts
pnpm check:docs-links
```
The `github-file-link*` tests do not exist at baseline; T02 and T03 create them.

### Acceptance matrix
| Criterion | Tasks | Evidence |
| --- | --- | --- |
| R1 placement, Project Files only | T04, T05, T07 | e2e: present in project preview, absent in Granted Files |
| R2 exact URL form | T02, T03, T07 | unit encoding cases; e2e clipboard equality; manual open on GitHub |
| R3 eligibility (a–g) | T03, T06 | one real-Git case per reason, managed and legacy |
| R4 upstream rule | T01, T03 | configured `origin/release`, fallback same-name, other-remote cases |
| R5 basis and access note | T04, T05, T07 | exact success note text in e2e |
| R6 no network or writes | T06, T07 | nativeGit arg spy; Playwright host guard |
| R7 clipboard behavior | T04, T07 | success and rejection specs; ownership test |
| R8 stale safety | T04, T07 | slow-response switch and refresh specs |
| R9 design and accessibility | T05, T07, T08 | screenshots, keyboard and SR notes, reduced motion, front end acceptance |
| R10 error containment | T03, T06 | `check-failed` with Retry on injected Git failure |
| Performance | T06 | ≤150 ms median recorded |

**Release gate:** every row above passes; CI green on the implementation PR; no new legacy overlay exemptions; front end review completed (T08); maintainer merges through normal review. “Implemented”, “tested”, “reviewed”, “merged” and “verified on main” are separate states.

**Executed during planning:** documentation checks only (public-source test and docs-links, run on the docs PR). No feature tests were executed and no UI was rendered.

## STATE
- Researched and decided: baseline Files preview, CopyButton, routes, binding, guarded Git, import behavior (origin kept, `branch.*` dropped), and the GitHub origin regex precedent. Server-side eligibility, a prefetch-then-synchronous copy, a no-filter Node blob ID, and the zero-exit ancestry check are all decided. The full UX and motion spec is above.
- Implemented / verified: nothing. T01–T08 NOT_STARTED. Implementation owner unassigned. Docs owner: planning worker, docs-only PR (unmerged).
- Risks: (1) remote-tracking refs may be missing or stale in managed families, which T01 can BLOCK on; the fallback is to show `no-upstream`, never a fetch. (2) Header crowding with #1471 and #1654; mitigated by the shared slot and the 360px rule. (3) Users with filters or autocrlf will see `changed` for committed files; this is acceptable and documented in the note text. (4) Case differences in GitHub owner/repo are harmless because GitHub is case-insensitive for them.
- Next step: T01 discovery on current main.

## REFERENCES
- [Baseline commit 2640b897](https://github.com/skytuhua-org/Gen-V1/commit/2640b897a42739eba3785fc934af882996c07097).
- [GitHub Docs: Getting permanent links to files](https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files): a permalink is a blob URL with a specific commit SHA instead of a branch name, so it keeps pointing at the same version.
- [VS Code Marketplace: Copy GitHub Permalink](https://marketplace.visualstudio.com/items?itemName=hogashi.vscode-copy-github-permalink): editor precedent for copying a commit-pinned GitHub URL for the current file.
- [Git docs: git-ls-tree](https://git-scm.com/docs/git-ls-tree), [git-rev-list](https://git-scm.com/docs/git-rev-list) (`A..B` range), and [git-hash-object](https://git-scm.com/docs/git-hash-object) (blob ID is the hash of `blob <size>\0<content>`).
- Related: [#1471](https://github.com/skytuhua-org/Gen-V1/issues/1471) / [PR #1472](https://github.com/skytuhua-org/Gen-V1/pull/1472) (relative path copy), [#1654](https://github.com/skytuhua-org/Gen-V1/issues/1654) (line attribution), [PR #1603](https://github.com/skytuhua-org/Gen-V1/pull/1603) (line numbers).
- Repository rules: [AGENTS.md](../../AGENTS.md), [CONTRIBUTING.md](../../CONTRIBUTING.md), [PR template](../../.github/pull_request_template.md), [UI guard policy](../../scripts/ui-guard-policy.md).
- Source: [ProjectFiles.tsx](../../apps/web/src/files/ProjectFiles.tsx), [FilesView.tsx](../../apps/web/src/files/FilesView.tsx), [useFilesRead.ts](../../apps/web/src/files/useFilesRead.ts), [files.css](../../apps/web/src/files/files.css), [CopyButton.tsx](../../apps/web/src/CopyButton.tsx), [workspace-routes.ts](../../apps/server/workspace-routes.ts), [tools.ts](../../packages/workspace/tools.ts), [git-storage.ts](../../packages/workspace/git-storage.ts), [github.ts](../../packages/workspace/github.ts), [tokens.css](../../packages/ui-shell/tokens.css).
