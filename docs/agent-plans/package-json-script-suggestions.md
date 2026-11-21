# Plan: Suggest package.json scripts as project scripts

## META
- Feature: The project Scripts panel offers the `scripts` found in the working copy's root `package.json` as one-click "Add" rows, with the runner (pnpm, npm or yarn) the project implies, so `dev`, `test` and `build` become runnable project scripts without typing them in.
- Repo: skytuhua-org/Gen-V1
- Plan revision: r1, 2026-11-21 (UTC)
- Baseline: `main` @ `8fa907f378127bcfc23d71b55c53625ffc43e8da` (verified with `git ls-remote origin refs/heads/main` before writing this plan)
- Size: small. Labels: `feature`, `small`.
- Existing issues/PRs: none match. Searched open and closed issues for "package.json scripts" and screened every `feature` issue through #1610. Closest neighbours, all distinct: #1401 (user hooks that run scripts around tool calls), #1476 (find in terminal output).
- Implementation status: NOT_STARTED. Filed for planning only; implementation needs its own claim on this issue.
- Source provenance: written from the repository at the baseline SHA (files cited in REPO_MAP were read at that SHA) and the external requests listed in REFERENCES.
- Design owner: this plan specifies the visual design and animation itself (there is no separate front-end design pass before implementation). The last task (T07) hands the finished work to the front-end team for review.

## OBJECTIVE
**User problem.** Gen already has project scripts: a stored `projectScript` row (`{id, projectId, name, command}`) that the Project context card lists and runs in a new terminal with one click (`run-script` action). But every script has to be typed by hand in the "Add script" form (`Script name` + `Command`). Nearly every JavaScript project already declares its commands in `package.json` `scripts`, so users retype `pnpm run dev`, `pnpm test` and so on for every project. Codex users ask for the same thing ([openai/codex#22982](https://github.com/openai/codex/issues/22982) Project Scripts panel; [openai/codex#59627](https://github.com/openai/codex/issues/59627) discovered project action buttons).

**Intended behaviour.** When the user expands "Add script" in the Project context card, Gen reads the root `package.json` of the thread's working copy and shows a "From package.json" list above the manual form. Each row shows the script name, the command Gen will save (for example `pnpm run dev`) and the script body from `package.json`, plus an "Add" button. Clicking "Add" creates a normal project script exactly as if the user had typed it, and the row leaves the list. Nothing runs until the user clicks the new script row, as today.

**Measurable success.**
- For a project with a `package.json` that has `dev`, `build`, `test`, adding all three takes 3 clicks after expanding the panel (today: 6 text fields and 3 submits).
- Suggestions never include a script whose command is already saved for the project.
- No command executes as a result of opening the panel or clicking "Add" (verified by test: terminal count unchanged).
- Projects without `package.json` see the panel exactly as today.

## REQUIREMENTS
### In scope
- R1 Read only the root `package.json` of the binding path for `(projectId, threadId)` (the managed working copy when the thread has one, else the project root). Read lazily when the "Add script" panel is expanded, and again each time it is re-expanded. No background polling, no file watcher.
- R2 Bounded, safe read: at most 256 KiB, through the existing path guard (`withPathGuard` + `readBoundFile` from `packages/core/file-access.ts`, as `ProjectTools.file()` already does). A symlinked `package.json` that resolves outside the working copy is refused like `file()` refuses it. Larger, unreadable or invalid-JSON files produce status `unreadable`, never an exception in the card.
- R3 Runner detection, first match wins:
  1. `package.json` `packageManager` field whose name before `@` is `pnpm`, `npm` or `yarn` → that runner (source `packageManager`).
  2. Lockfile in the same directory: `pnpm-lock.yaml` → pnpm; `yarn.lock` → yarn; `package-lock.json` or `npm-shrinkwrap.json` → npm (source `lockfile`). If more than one lockfile exists, use this order and set `multipleLockfiles: true`.
  3. Otherwise npm (source `default`).
  Other managers (bun, deno, corepack shims) are out of scope; a `packageManager` naming one of them falls through to step 2.
- R4 Command format: `<runner> run <name>` for all three runners (`pnpm run dev`, `npm run dev`, `yarn run dev`). Always `run`, never shorthands such as `npm test`, so the saved command is predictable.
- R5 Which scripts are suggested:
  - Only entries whose value is a non-empty string.
  - Only names matching `^[A-Za-z0-9][A-Za-z0-9:._@/+-]{0,99}$` (fits the 100-char name limit of `add-script` and needs no shell quoting in cmd.exe or sh). Others are counted in `skipped`.
  - Excluded lifecycle names: `preinstall`, `install`, `postinstall`, `prepare`, `prepublish`, `prepublishOnly`, `prepack`, `postpack`, `publish`, `postpublish`, `preversion`, `version`, `postversion`, `dependencies`. Also excluded: `pre<X>` and `post<X>` when `<X>` is itself a script (hooks run automatically). These are counted in `skipped`.
  - Hidden when an existing `projectScript` for the same project has the same command after trimming and collapsing whitespace (`pnpm run dev` vs `pnpm  run dev`). Hidden ones are not counted in `skipped`.
  - Keep `package.json` order. Cap at 50 suggestions; extra ones count in `skipped`.
- R6 "Add" reuses the existing `add-script` project action with `{name, command}`; no new write path and no new stored fields. The saved row is indistinguishable from a hand-typed one.
- R7 UI (full spec in DESIGN → Visual design): "From package.json" group above the manual form inside the expanded "Add script" panel, with runner caption, one row per suggestion, per-row "Add", loading, empty, unreadable and error states, and the manual form unchanged below.
- R8 Adding a suggestion keeps the panel open (today any successful action closes it via `setExpanded(null)` in `run`), removes the row, and shows the new script in the script list.
- R9 Panel hidden states: when `context.capabilities.terminal` is false the whole "Add script" row is already hidden (unchanged). When there is no `package.json`, the group is not rendered at all, so the panel looks exactly as today.

### Out of scope
- Workspace packages (`pnpm-workspace.yaml`, `workspaces` field, nested `package.json`), Makefile, `justfile`, `Cargo.toml`, `pyproject.toml` and other task sources.
- Running a suggestion directly from the list (the user adds, then runs the saved row as today).
- "Add all", editing a suggestion before adding, renaming, deleting or reordering saved scripts.
- Auto-adding scripts, re-syncing saved scripts when `package.json` changes, file watching.
- Passing arguments, environment variables or a working directory other than the binding root.
- Any change to `run-script` or terminal behaviour.
- A capability flag: this is a read-only suggestion list that writes only through the existing `add-script` action, so it ships on by default (proposed decision D4; a reviewer may ask for a flag on this issue).

### Decisions
- D1 (agreed in scope check) Read root `package.json` only, on panel open; runner from lockfile; Add creates a normal `projectScript`; already-added scripts hidden; nothing runs without a click.
- D2 (proposed) `packageManager` field outranks lockfiles, since it is the declared intent (the repo itself declares `"packageManager": "pnpm@10.30.3"`).
- D3 (proposed) Dedupe by normalized command, not by name, so a hand-made `dev` with a different command still lets the user add the package.json one.
- D4 (proposed) No capability flag (see Out of scope).
- D5 (proposed) Filtering is done on the server, which already has the stored scripts; the client also removes a row optimistically on a successful Add, then refetches.

### UX, accessibility, errors, security, performance
- Keyboard: every "Add" button is a real `<button>` in tab order. Accessible name: `Add script <name>, runs <command>`. After an Add, focus moves to the next suggestion's "Add"; if it was the last one, to the new saved script row; if that is not found, to the "Add script" toggle.
- A polite live region (`role="status"`) announces `Added <name>` and load failures.
- Errors are plain sentences: unreadable file → "package.json could not be read." with the reason in `title` (too large / invalid JSON / outside the working copy). Load request failure → "Suggestions are unavailable." with a "Retry" text button. Add failure → reuse the card's existing `actionError` line; the row stays.
- Security: the server returns the script body only as display text; the saved command is always `<runner> run <name>` built server-side from a name that passed R5, never the raw body. The client sends the `command` string it received from the server, and `add-script` keeps its own validation (`trim().min(1).max(8000)`). Opening the panel never executes anything. No network access.
- Privacy: script bodies may contain paths; they stay local and are not logged.
- Performance: one bounded file read plus up to four `stat` calls per panel expand; no Git calls. Response is at most 50 rows.
- Compatibility: Windows is the shipped platform (cmd.exe terminals); the name regex guarantees no quoting is needed there or in `/bin/sh` used in tests.

## REPO_MAP (verified at baseline unless marked DISCOVERY)
- `apps/web/src/ProjectContextCard.tsx` (63 lines). Line 24: state `expanded` (`'scripts'|'branch'|'commit'|'lineage'|null`), `busy`, `actionError`, `scriptName`, `scriptCommand`. Line 25: `run(type,payload)` calls `onAction`, then `setExpanded(null)` and `setCommit('')` on success. Line 48: "Add script" toggle row (`Plus` icon, shown when `context.capabilities.terminal`). Line 49: the manual form (`Script name` maxLength 100, `Command` maxLength 4000, submit "Add script" → `run('add-script',{name,command})`). Line 50: saved scripts as `.project-context-row.project-script-row` buttons that call `run('run-script',{scriptId})`.
- `apps/web/src/project-context.css` (35 lines): `.project-context-row`, `.project-context-detail` (label, input, `.secondary` button styles), `.project-script-row{font-size:12px;min-height:30px}`, `.project-plan-expansion` grid-rows expansion using `--ui-motion-panel-enter` / `--ui-ease-enter`.
- `apps/web/src/ProjectContextSurface.tsx` line 17: renders `ProjectContextCard` with `context={project.context}` and `onAction={project.action}`.
- `apps/web/src/project-api.ts` lines 20–26: `action(type,payload)` POSTs `/api/projects/:projectId/actions` with `{id: crypto.randomUUID(), type, payload, threadId?}` and the `x-harness-csrf` header, through `authenticated(...)`, then reloads the context.
- `apps/server/workspace-routes.ts` line 47: `GET /api/projects/:projectId/git` pattern (`z.object({projectId:identifier})`, `querySchema` for `threadId`, calls `projects.gitStatus`). Line 144: `add-script` (validates name 1–100, command 1–8000, stores `projectScript` via `service.store.command`). Line 145: `run-script` (opens a terminal with the stored command).
- `packages/workspace/tools.ts`: `class ProjectTools` (line 47); `binding(projectId,threadId)` (line 71) returns `{project, path, workspace?}`; `context()` (~line 192) lists `projectScript` rows for the project; `file()` (~line 199) shows the guarded read pattern (`realpath`, `inside`, `gitSegment`, `withPathGuard([{path,leaf:true,readOnly:true}],…)`, `readBoundFile(target, 1024*1024)`).
- `packages/core/file-access.ts`: exports `readBoundFile`, `withPathGuard` (imported by `packages/capabilities/git-access.ts` and used in `tools.ts`).
- `packages/contracts/workspace.ts` line 58: `interface ProjectContext` with `scripts:{id;name;command}[]` and `capabilities.terminal`.
- `packages/ui-shell/tokens.css` lines 20–40: easing `--ui-ease-enter`, `--ui-ease-move`; durations `--ui-motion-hover` 120ms, `--ui-motion-press` 80ms, `--ui-motion-insert` 180ms, `--ui-motion-remove` 140ms, `--ui-motion-stagger` 30ms, `--ui-motion-status` 160ms, `--ui-motion-success` 240ms.
- Reduced-motion convention: per-file `@media(prefers-reduced-motion:reduce){…}` blocks (for example `apps/web/src/composer-toolbar.css` line 44, `apps/web/src/connections.css` line 44).
- `apps/web/src/LoadingState.tsx`: `LoadingState`, `PendingStatus` (already imported by the card).
- Tests: `tests/terminal-host.test.ts` line 14 builds `new Store(join(root,'data'))`, `new ProjectTools(store)`, `new TerminalHost(tools)` on a temp dir (pattern for T01/T02 tests). `tests/project-context-committed-action.test.ts`, `tests/project-context-owner.test.ts` (card/API browser-bundle tests). `tests/e2e/workspace-components-fixture.tsx` and `tests/e2e/workspace-components.spec.ts` (Playwright harness that renders the card). `tests/capture-ui/review-coverage.test.ts`, `tests/redundant-ui.test.ts`, `tests/ui-numeric-children.test.ts`, `tests/loading-state.test.ts` reference the card and guard UI rules.
- Reference only (not reused, it is a script with process lookups): `scripts/research-baseline.ts` `resolvePackageManager` reads `packageManager` from `package.json`.
- DISCOVERY: how a project is registered in a temp-dir test (copy the setup from `tests/terminal-host.test.ts` or `tests/github-workspace.test.ts`); whether a server route test harness exists for `workspace-routes.ts` (search `tests/` for `registerWorkspaceRoutes` or `/api/projects/` before writing T02 tests).
- DISCOVERY: user docs that mention project scripts (`grep -rn "project script\|Add script" docs README.md` returned nothing at baseline; recheck in T06).

## DESIGN
### Contract (`packages/contracts/workspace.ts`)
```ts
export type ProjectScriptRunner='pnpm'|'npm'|'yarn';
export interface ProjectScriptSuggestion {name:string;body:string;command:string}
export interface ProjectScriptSuggestions {
 status:'ok'|'missing'|'unreadable';
 reason?:'too-large'|'invalid-json'|'outside-working-copy'|'not-a-file';
 runner:ProjectScriptRunner;
 runnerSource:'packageManager'|'lockfile'|'default';
 multipleLockfiles:boolean;
 suggestions:ProjectScriptSuggestion[]; // <= 50, package.json order, already-added removed
 skipped:number;                        // invalid names, lifecycle/hooks, non-string values, over the cap
}
```
`body` is the raw script value truncated to 500 characters for display. `command` is `${runner} run ${name}`.

### Server
- `ProjectTools.scriptSuggestions(projectId, threadId?)` in `packages/workspace/tools.ts`:
  1. `const {path}=await this.binding(projectId,threadId)`.
  2. Stat `join(path,'package.json')`; missing → `{status:'missing', runner:'npm', runnerSource:'default', multipleLockfiles:false, suggestions:[], skipped:0}`.
  3. `realpath` + `inside(path,resolved)` check; outside → `unreadable/outside-working-copy`. Not a regular file → `unreadable/not-a-file`.
  4. `withPathGuard([{path:target,leaf:true,readOnly:true}], signal, …)` + `readBoundFile(target, 256*1024)`; a size error → `unreadable/too-large`; `JSON.parse` failure or non-object root → `unreadable/invalid-json`. Strip a UTF-8 BOM before parsing.
  5. Runner per R3 (lockfile existence via `stat` on the four names in `path`).
  6. Filter per R5 using `this.store.all('projectScript').filter(s=>s.projectId===projectId)` and `normalize=(c)=>c.trim().replace(/\s+/g,' ')`.
  Pure helpers `detectRunner(pkg, lockfiles)` and `suggestScripts(pkg, runner, savedCommands)` are exported from a new `packages/workspace/script-suggestions.ts` so they can be unit-tested without the filesystem; `ProjectTools` does the I/O.
- Route in `apps/server/workspace-routes.ts`, next to the `/git` GET: `app.get('/api/projects/:projectId/script-suggestions', …)` parsing params and `querySchema` exactly like `/git`, `reply.header('Cache-Control','no-store')`, returning `projects.scriptSuggestions(projectId, threadId)`. Binding errors (`CAPABILITY_DENIED`, `NOT_FOUND`) propagate as they do for `/git`.

### Client
- `apps/web/src/project-api.ts`: `export async function loadScriptSuggestions(projectId:string, threadId?:string, signal?:AbortSignal):Promise<ProjectScriptSuggestions>` using the same `authenticated(()=>fetch(...))` + `read` helpers, `credentials:'same-origin'`, GET with `threadId` query when present.
- `ProjectContextCard` gets one new optional prop `loadSuggestions?:(signal:AbortSignal)=>Promise<ProjectScriptSuggestions>`; `ProjectContextSurface` passes `signal=>loadScriptSuggestions(projectId, thread?.id, signal)` when a project is bound. Without the prop (other hosts, fixtures) the group is not rendered.
- Card state: `suggestions:{state:'idle'|'loading'|'ready'|'error'; data?:ProjectScriptSuggestions}`. Load when `expanded` becomes `'scripts'`; abort on collapse/unmount; ignore stale responses (generation counter, like `project-api.ts`).
- `run` gains an optional third argument `{keepOpen?:boolean}`; suggestion Add calls `run('add-script',{name,command},{keepOpen:true})`, which skips `setExpanded(null)`. On success remove the row locally (D5), announce, move focus (UX rules), then refetch suggestions after the context reload completes.

### Visual design (specified here; T07 sends it to the front-end team for review)
Layout inside the expanded "Add script" panel (`.project-context-detail` column, 9px gap), top to bottom:
1. Group caption row `.project-script-suggestions-caption`: text "From package.json" (11px, weight 550, `var(--muted)`), then a runner pill: lowercase runner name (`pnpm`), 10px, weight 600, `var(--text)`, padding 1px 6px, radius 999px, background `var(--hover)`. When `multipleLockfiles` the pill gets `title="Several lockfiles found; using pnpm-lock.yaml"` (name of the winning source). When `skipped>0`, a trailing muted 10px text "· N hidden" with `title` "Lifecycle hooks and names that need quoting are not suggested."
2. List `ul.project-script-suggestions` (no bullets, margin 0, padding 0, gap 2px). Each `li` is a row, min-height 40px, padding 5px 6px, radius 6px, grid `grid-template-columns: 14px 1fr auto; column-gap: 8px; align-items:center`:
   - `Terminal` lucide icon, 14px, `var(--muted)`.
   - Text column (min-width 0): line 1 script name, 12px, weight 550, `var(--text)`, single line ellipsis; line 2 the command to save in the app's monospace font stack (reuse the token the terminal or diff views use; DISCOVERY in T03, fall back to `ui-monospace, monospace`), 11px, `var(--muted)`, ellipsis, `title` = `body` from package.json so hovering shows what the script really does.
   - "Add" button: existing `.secondary` style at 11px, padding 4px 9px, min-height 26px, with a 12px `Plus` icon before the text.
   - Row hover (pointer devices): background `var(--selection-bg)` with `transition: background var(--ui-motion-hover)`.
   - Busy row (this row's Add pending): Add button `aria-busy="true"`, text stays, opacity .6; other Add buttons stay enabled only if `busy` allows (the card's single `busy` flag disables them, matching current behaviour).
3. A 1px `var(--border)` divider with 4px vertical margin, then the existing manual form unchanged. When suggestions are shown the manual form keeps its labels; no other change.
States:
- Loading: one muted 11px line "Reading package.json…" using `PendingStatus`, shown only after 150ms (avoid a flash on fast reads).
- Empty (`ok`, zero suggestions, `skipped` 0): muted 11px "All package.json scripts are added." If `skipped>0`: "No scripts to suggest. N hidden." with the same title as above.
- Unreadable: muted 11px "package.json could not be read." with `title` from `reason` ("It is larger than 256 KB." / "It is not valid JSON." / "It points outside this working copy." / "It is not a file.").
- Error (request failed): 11px "Suggestions are unavailable." plus a text button "Retry" (`.quiet` style used in the card).
- Missing: render nothing (R9).
Animation (all durations and easings from `packages/ui-shell/tokens.css`):
- List enter: rows fade from opacity 0 and `translateY(-2px)` to 1 / 0 over `--ui-motion-insert` with `--ui-ease-enter`, staggered by `--ui-motion-stagger` per row, stagger capped at the first 8 rows (`--i` custom property set inline as the row index, `animation-delay: calc(min(var(--i), 8) * var(--ui-motion-stagger))`).
- Row remove after Add: the row wraps its content in a grid with `grid-template-rows:1fr` → `0fr` and opacity 1 → 0 over `--ui-motion-remove` with `--ui-ease-move`; remove the element on `transitionend` (and after a 300ms fallback timer).
- New saved script row in the scripts list (line 50 rows): when its id was just added from a suggestion, apply a one-shot class that animates opacity 0 → 1 and background from `var(--selection-bg)` to transparent over `--ui-motion-success` with `--ui-ease-enter`.
- Reduced motion (`@media(prefers-reduced-motion:reduce)`): no transforms and no stagger; enter and remove become opacity-only over `--ui-motion-press`; the success highlight is removed.
All new CSS goes in `apps/web/src/project-context.css` under `.project-context-card` selectors. Use existing tokens only; no new colours.

### Error / cancel / retry
- Collapsing the panel aborts the in-flight load; re-expanding loads again.
- An Add that fails leaves the row and shows the existing `actionError` text; retrying is a new click with a new action id (existing `project-api` behaviour).
- A stale suggestion (the user saved the same command elsewhere meanwhile) still adds a duplicate row only if the user clicks; the post-Add refetch removes it. Acceptable for v1 because `add-script` already allows duplicates.

### Migration / rollback
No stored data changes. Rollback is reverting the PR; saved scripts created from suggestions stay as normal scripts.

## EXECUTION_DAG
T01 → T02 → T03 → T04 → T05 → T06 → T07. T01 and the CSS part of T03 could be split across workers, but the feature is small; one worker in order is recommended.

### T01 Detection helpers and contract
- Goal: pure suggestion logic and its types.
- Depends on: none.
- Edits: `packages/contracts/workspace.ts` (types from DESIGN → Contract); new `packages/workspace/script-suggestions.ts` exporting `detectRunner(pkg:unknown, lockfiles:{pnpm:boolean;yarn:boolean;npm:boolean;count:number})` and `suggestScripts(pkg:unknown, runner, savedCommands:string[])` implementing R3–R5; new `tests/project-script-suggestions.test.ts`.
- Positive tests: `packageManager:"pnpm@10.30.3"` → pnpm/packageManager; only `yarn.lock` → yarn/lockfile; `pnpm-lock.yaml`+`package-lock.json` → pnpm, `multipleLockfiles:true`; nothing → npm/default; `packageManager:"bun@1"` + `yarn.lock` → yarn; commands are `pnpm run dev` etc.; order preserved; names like `test:unit`, `build:widgets`, `@scope/x` accepted.
- Negative tests: non-string values skipped; `postinstall`, `prepare`, `pretest` (when `test` exists) skipped, `prestart` kept when no `start` script; names with spaces, quotes, `&`, `|`, leading `-`, or over 100 chars skipped; `scripts` missing or an array → zero suggestions; already-saved `pnpm  run   dev` hides `dev`; 60 valid scripts → 50 suggestions, `skipped` 10; body truncated to 500 chars.
- Done when: `pnpm exec vitest run tests/project-script-suggestions.test.ts` passes and `pnpm typecheck` passes.
- Handoff: T02.

### T02 Guarded read and route
- Goal: `ProjectTools.scriptSuggestions` and `GET /api/projects/:projectId/script-suggestions`.
- Depends on: T01.
- Edits: `packages/workspace/tools.ts` (method per DESIGN → Server); `apps/server/workspace-routes.ts` (route next to `/git`); `apps/web/src/project-api.ts` (`loadScriptSuggestions`); extend `tests/project-script-suggestions.test.ts` with temp-dir cases using the `tests/terminal-host.test.ts` setup (DISCOVERY: copy its project registration).
- Positive tests: real temp project with `package.json` + `pnpm-lock.yaml` → `ok`, pnpm, expected rows; a stored `projectScript` with the same command hides it; a thread with a managed working copy reads that copy's `package.json` (DISCOVERY: reuse the managed-workspace fixture used by existing ProjectTools tests; if none exists, record the gap on this issue and cover with the unmanaged case only).
- Negative tests: no `package.json` → `missing`; 300 KiB file → `unreadable/too-large`; `{` → `invalid-json`; BOM-prefixed valid file → `ok`; symlinked `package.json` pointing outside the root → `outside-working-copy` (skip on Windows CI if symlinks need admin, with a comment); directory named `package.json` → `not-a-file`; the terminal count from `TerminalHost` is unchanged after the call.
- Route test: if a route harness exists (DISCOVERY in REPO_MAP), assert 200 + `Cache-Control: no-store` and that an unknown project returns the same error as `/git`. Otherwise record "route covered by e2e only" on this issue.
- Done when: the tests above pass, `pnpm typecheck` passes.
- Handoff: T03.

### T03 Card UI and styles
- Goal: the "From package.json" group with all states, animation and focus rules from DESIGN.
- Depends on: T02.
- Edits: `apps/web/src/ProjectContextCard.tsx` (prop `loadSuggestions`, state, `run` `keepOpen` option, group markup before the manual form on line 49, focus management, live region, one-shot class on newly added script rows); `apps/web/src/ProjectContextSurface.tsx` (pass `loadSuggestions`); `apps/web/src/project-context.css` (new selectors, animations, reduced-motion block). DISCOVERY: the monospace token used elsewhere in `apps/web/src/*.css` (`grep -n "monospace" apps/web/src/*.css`).
- Positive checks: the panel shows suggestions; Add keeps the panel open and the row animates out; the new script appears in the list; focus lands per UX rules; manual form still works and still closes the panel on submit (unchanged behaviour).
- Negative checks: without `loadSuggestions` or with `missing` the panel DOM equals today's; `busy` disables every Add; a failed Add keeps the row and shows `actionError`.
- Done when: `pnpm typecheck`, `pnpm lint` and `pnpm test:ui-guard` pass; `tests/project-context-committed-action.test.ts`, `tests/project-context-owner.test.ts`, `tests/loading-state.test.ts`, `tests/redundant-ui.test.ts`, `tests/ui-numeric-children.test.ts` and `tests/capture-ui/review-coverage.test.ts` still pass (update fixtures only where the new optional prop requires it, and say so in the PR).
- Handoff: T04.

### T04 Browser test
- Goal: prove the flow in the Playwright component harness.
- Depends on: T03.
- Edits: `tests/e2e/workspace-components-fixture.tsx` (a card instance with a stub `loadSuggestions` returning three suggestions, one `skipped`, and a stub `onAction` that records calls); `tests/e2e/workspace-components.spec.ts` (new test).
- Positive: expand "Add script" → three rows and "pnpm" pill; click Add on `dev` → `onAction('add-script',{name:'dev',command:'pnpm run dev'})` recorded exactly once, row gone, panel still open, focus on the next Add; keyboard-only path (Tab to Add, Enter) works; `prefers-reduced-motion: reduce` emulation shows no transform on rows.
- Negative: stub returning `unreadable/invalid-json` shows "package.json could not be read."; stub rejecting shows "Suggestions are unavailable." and Retry calls the loader again; `missing` renders no group.
- Done when: `pnpm test:e2e` (or the narrower `pnpm build && node --import tsx scripts/test-browser.ts` filtered to the spec, per that script's options) passes locally.
- Handoff: T05.

### T05 Screenshots and docs
- Goal: visible evidence and any doc update.
- Depends on: T04.
- Edits: capture light and dark screenshots of the expanded panel with suggestions and of the empty state from the e2e harness (use synthetic project names). Recheck docs for project-script mentions (DISCOVERY); if a user doc describes "Add script", add one sentence: "If the project has a package.json, its scripts are listed under From package.json; click Add to save one." Run `pnpm check:docs-links` if docs changed.
- Done when: screenshots are attached to the PR; docs updated or "no doc mentions project scripts" recorded on this issue.
- Handoff: T06.

### T06 Full verification and PR
- Goal: one focused PR.
- Depends on: T05.
- Steps: `source ~/.nvm/nvm.sh` if Node is not on PATH; `pnpm install --frozen-lockfile`; `pnpm typecheck`; `pnpm lint`; `pnpm test:ui-guard`; `pnpm exec vitest run tests/project-script-suggestions.test.ts tests/project-context-committed-action.test.ts tests/project-context-owner.test.ts tests/terminal-host.test.ts`; `pnpm test:e2e` for the new spec. Real-user check on Windows desktop build (`pnpm desktop:dev`) with this repository as the project: expand Add script, see `dev`, `build`, `test`, … with "pnpm", add `typecheck`, run it from the saved row.
- PR follows `.github/pull_request_template.md`, links this issue, lists executed vs skipped checks and includes the T05 screenshots. Post a checkpoint on this issue per AGENTS.md.
- Done when: CI is green and the PR is ready for review.
- Handoff: T07.

### T07 Front-end team review handoff
- Goal: the front-end team reviews the finished visual design and animation.
- Depends on: T06.
- Steps: request review on the PR from the front-end team (or post on this issue addressed to the front-end team if no GitHub team handle exists), with the screenshots, a short screen recording of add/remove animation in normal and reduced motion, and the list of tokens used. Apply their requested changes in the same PR and re-run the T06 checks that the change touches.
- Done when: the front-end team has approved or their requested changes are merged into the PR; post a RELEASE checkpoint on this issue.
- Handoff: maintainer for merge.

## VALIDATION
### Acceptance matrix
| Req | Task | Acceptance check |
|---|---|---|
| R1 root file, lazy read | T02, T03 | temp-dir test reads binding root; e2e loader called on expand and re-expand only |
| R2 bounded guarded read | T02 | too-large, invalid-json, BOM, symlink-outside, not-a-file tests |
| R3 runner detection | T01 | runner unit tests incl. multiple lockfiles and unknown `packageManager` |
| R4 command format | T01, T04 | unit asserts `<runner> run <name>`; e2e asserts recorded `add-script` payload |
| R5 filtering | T01, T02 | lifecycle/hook/name/cap/dedupe unit tests; stored-script dedupe temp-dir test |
| R6 reuse add-script | T03, T04 | e2e recorded action type `add-script`; no new server write route in diff |
| R7 UI states | T03, T04, T05 | e2e state checks; screenshots |
| R8 panel stays open | T03, T04 | e2e: panel open after Add, row removed, focus moved |
| R9 hidden when absent | T03, T04 | e2e `missing` renders no group; DOM unchanged without prop |
| No execution | T02 | terminal count unchanged after suggestions call |
| Design/animation reviewed | T07 | front-end team approval on the PR |

### Executed vs planned
Planned only. Nothing in this plan has been executed; no tests have been run for this feature.

### Release gate
All T06 commands pass, CI green, front-end team approval (T07), maintainer review.

## STATE
- Researched and decided: scope D1; proposed D2–D5.
- Implemented: nothing. Verified: nothing. Owners: none. Branches: none.
- Risks: (1) Windows symlink tests may need skipping; (2) the e2e harness may need a new fixture slot for the optional prop; (3) duplicate names between a saved script and a suggestion may confuse users (mitigated by showing the command line on every row).
- Next step: an implementing worker claims this issue (AGENTS.md step 4) and starts T01.

## REFERENCES
- [openai/codex#22982](https://github.com/openai/codex/issues/22982): request for a Project Scripts panel.
- [openai/codex#59627](https://github.com/openai/codex/issues/59627): request for discovered project action buttons.
- npm lifecycle scripts (why install/publish hooks are excluded): https://docs.npmjs.com/cli/using-npm/scripts#life-cycle-scripts
- Node `packageManager` field (Corepack): https://nodejs.org/api/packages.html#packagemanager
- Baseline source: https://github.com/skytuhua-org/Gen-V1/tree/8fa907f378127bcfc23d71b55c53625ffc43e8da
