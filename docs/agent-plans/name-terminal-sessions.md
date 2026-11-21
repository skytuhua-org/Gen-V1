# Plan: Name terminal sessions

## META

- Feature: Name terminal sessions (small), repository `skytuhua-org/Gen-V1`.
- Revision: 1, 2026-11-21. Planning only; no feature code implemented or behavior verified.
- Verified baseline: `main` at `8fa907f378127bcfc23d71b55c53625ffc43e8da`.
- Publication scope: this plan is published in full as the body of a GitHub plan issue labeled `feature` + `small`, and this file lands through a docs-only PR (reviewed merge, not part of publication). The canonical issue is the one whose body carries this plan; no implementation PR exists.
- Provenance: batch 11 proposal row 4 and scope check 4: rename an open terminal from its toolbar; names belong to an admitted owner-bound PTY session, survive renderer refresh/reparenting, and never alter the shell. The substantive proposal is reproduced below, so private proposal files are not required to execute this plan.
- Related boundary: [shell selection #1284](https://github.com/skytuhua-org/Gen-V1/issues/1284) is excluded. Research inspiration: [VS Code empty terminal rename #333933](https://github.com/microsoft/vscode/issues/333933); Gen's fallback is explicitly the static word “Terminal”, not a dynamic process title.
- Integration status: baseline source and three existing plans inspected; remote open/merged work was not independently searched in this docs-only session. T01 must reconcile concurrent work before implementation, not assume this plan reserves files.

## OBJECTIVE

Users running several shells should distinguish “API”, “Tests”, and “Migration” without reading output. Today every terminal toolbar says “Terminal”. Let users set or reset a short plain-text name in that toolbar. Success is a name visible after a matching host acknowledgment, returned by ordinary session reads and reattachment, with no new PTY, input bytes, output duplication, owner change, or process-title mutation.

## REQUIREMENTS

### Agreed product scope

1. An admitted, live terminal exposes Rename in its own toolbar. Save “API” changes only that session; another terminal remains unnamed.
2. Empty or whitespace-only input resets the name to the visible fallback “Terminal”. New session IDs start unnamed, including New terminal after exit. Reopening the same live ID retains its name.
3. Names are host session metadata, not panel names, localStorage preferences, commands, shell arguments, OSC titles, project labels, or terminal identities. Rendering refresh and native/docked reparenting retain names for the same session.
4. Preserve existing input, resize, Stop, Retry, selection-to-prompt, bounded output and cursor behavior. Do not add shell selection, canvas-wide naming, output export, sync, history, or automated process-derived names.
5. Host restart does not revive PTYs: existing recovery marks old sessions ended. Preserve their stored metadata, but do not promise live reattachment across host restart or transfer names to a replacement session.

### Concrete v1 decisions proposed by this plan

These specify otherwise unspecified implementation details; do not silently broaden them while implementing.

- Use field `name` with canonical wire/storage value `string | null`. Missing legacy name means null. The toolbar alone maps null to “Terminal”; the literal name “Terminal” remains a valid custom name.
- Accept raw strings up to 256 UTF-16 code units, reject forbidden characters before trimming, apply JavaScript `trim()`, then require at most 64 Unicode code points. Empty normalized value becomes null. Do not silently truncate or case-fold. Preserve interior spaces, emoji, punctuation and non-Latin text; no Unicode normalization is needed.
- Reject C0 controls (U+0000 through U+001F), DEL and C1 controls (U+007F through U+009F), line/paragraph separators U+2028 and U+2029, bidi embedding/override controls U+202A through U+202E, and bidi isolate controls U+2066 through U+2069. Reject lone surrogate code units; permit valid surrogate pairs. Tabs/newlines are invalid even at the edges, not trim-to-valid. Test these using generated code points, not embedded control bytes.
- Rename only running, currently admitted sessions; disable during starting, interrupted reads, unconfirmed start, stopping, ended or inactive states. A running session may be read by other attached views; those views receive its latest name through existing polling. No uniqueness restriction.
- Non-optimistic save. Enter saves except during IME composition; Escape cancels without a request. Cancel returns to the latest acknowledged name. Blur does not save or cancel. Save/reset failures leave the draft editable and the old heading intact, with explicit Retry via Save. Never auto-retry a mutation after an ambiguous network failure.
- A reset is entering blank and saving; also offer Reset name while editing a named terminal. Reset only clears the draft; Save commits it. Avoid accidental immediate mutation and a second protocol action.
- Only one pending save per view. Across views, host acceptance order wins, without a distributed lock. Add a monotonic `nameRevision` to prevent old poll responses from reverting a newer acknowledged name in the renderer (details below).

## REPO_MAP — verified baseline evidence

Line references are baseline anchors, not promises after edits. All proposed interfaces are labeled as new below.

| File / real symbol | Verified behavior and change seam |
| --- | --- |
| `apps/web/src/TerminalBody.tsx:8-14` — `TerminalRead`, `post` | Local response interface has identity/output/lifecycle only. `post` uses authenticated fetch and CSRF with a current-owner guard. Extend response metadata here, not the terminal excerpt schema. |
| `apps/web/src/TerminalBody.tsx:16-38` — `TerminalBody`, `ownerCurrent`, `matches`, `command` | Committed `latest` ref fences owner changes; `confirmedId` is effect-local and set only after matching open acknowledgment. Rename must use that ID, never merely a prop/pending localStorage ID. |
| `apps/web/src/TerminalBody.tsx:39-56,88-115` — `append`, `poll`, open path | Reads poll at 500ms (first at 250ms); cursor output is appended once. Open retains IDs, matches owner, then sets acknowledgment. Effect cleanup aborts reads and disposes renderer only. Keep names out of effect dependencies so rename does not remount xterm. |
| `apps/web/src/TerminalBody.tsx:117-127` — `restart`, toolbar | Toolbar hard-codes `<strong>Terminal</strong>`, with lifecycle status/Stop/Retry/New terminal. Add editing here while preserving these controls and the output region. |
| `apps/web/src/WorkspaceSurfaceBody.tsx:54-56,68-74` — `WorkspaceSurfaceBody` | Resolves thread/project binding, rejects nonlocal authority, keys TerminalBody by project/thread/terminal ID, forwards active and openAnother. Do not store name in this key or in panel binding. |
| `apps/server/workspace-routes.ts:155-157` — `registerWorkspaceRoutes` terminal endpoints | POST open is strict with 4096-byte limit; GET uses project/thread/cursor; POST commands is strict, 128 KiB, enum input/resize/stop. Extend commands narrowly; retain existing body limits and owner parameters. |
| `packages/workspace/terminal.ts:9-38` — `Session`, `TerminalHost`, `open` | In-memory owner/path-bound sessions; duplicate opens validate binding and reuse ID; durable used IDs cannot reopen; capacity 12. Spawn and initial command remain untouched. |
| `packages/workspace/terminal.ts:60-72` — `persist`, `result`, `owned`, `read`, `command` | `persist` writes terminalSession via terminal.changed; `result` returns bounded output; `owned` verifies ID, project/thread and current binding path except Stop. Commands disallow non-stop actions on exited sessions. Add metadata only after full owned admission. |
| `packages/workspace/terminal.ts:14-16,49-54,61-66` | Constructor marks unfinished durable records ended with object spread; exit persists session; 48 ended sessions retained. Preserve name/revision through all these writes; do not resurrect an evicted ID. |
| `apps/web/src/terminal-read.css:1-6`, `apps/web/src/workspace-tools.css:1,4-5` | Terminal-scoped focus/disabled styles and wrapping panel toolbar; canvas toolbar has 36px minimum, 8px 12px padding, 8px gap. Scope additions to terminal-read CSS. |
| `packages/ui-shell/tokens.css:1-25` | Existing spacing, row and motion tokens; use these rather than introducing a new design system. |
| `tests/terminal-host-unit.test.ts` — `fixture`, recovery cases | Real Store plus mocked node-pty with write/resize/kill spies; ideal metadata/persistence and failure tests. |
| `tests/terminal-opening-race.test.ts`, `tests/terminal-reopen-ended.test.ts`, `tests/terminal-host.test.ts` | Concurrent open, UTF-16 output cursor, persistence failure, ended IDs and real PTY coverage. Keep existing semantics. Real PTY setup may require native builds. |
| `tests/workspace-layout.test.ts:65-71` | Stable host-owned terminal reference survives profile and placement changes. Extend/assert names via session identity, not a new layout property. |
| `tests/e2e/terminal-read.spec.ts`, `tests/e2e/fixtures/terminal-read.tsx` | Existing isolated real-xterm fixture, request interception, delayed responses, current-owner revocation, output instance checks. Extend this surface rather than mounting a fake toolbar. |
| `tests/e2e/terminal-read.playwright.config.ts` | Scoped Chrome runner on port 5814, Vite fixture server, trace retention. Existing excerpts suite has its own config and remains a regression target. |

No existing shared terminal contract was found in this inspected path: routes parse locally and web defines TerminalRead locally. A small new shared validator under `packages/contracts/terminal-session.ts` is proposed, not an existing file. Add its source manifest entry; export only if repository import conventions require it. Do not refactor all existing terminal commands into a new contract as incidental work.

## DESIGN

### Contract and authority

New shared module exports `terminalNameInputSchema` plus a pure normalization function used by host and web validation. It validates the raw-string limits above and yields string or null. Export the constants for raw 256 / normalized 64 limits. Add tests under new `tests/terminal-session-contract.test.ts`. Do not accept HTML, coerce numbers, or let the client provide revision values.

Extend existing POST `/api/terminals/:terminalId/commands` with exactly:

```json
{"projectId":"project-a","threadId":"thread-a","type":"rename","name":"API"}
```

Use a strict discriminated rename arm, requiring name as a string, forbidding data/cols/rows/revision. Retain the legacy input/resize/stop parser's accepted shape in its other arm to avoid accidental compatibility breakage. Do not add name to the open request. GET and POST responses gain `name: string | null` and `nameRevision: number` alongside existing fields; legacy sessions default to null and zero. Reset submits name as the empty string and returns null. The renderer treats missing fields from legacy fixtures as null/zero, never as an instruction to clear a newer revision.

In `TerminalHost.command`, use `owned` with the normal binding check (never the stopping bypass), reject exited sessions, parse/normalize input even for non-HTTP callers, and apply only metadata. Unknown IDs remain NOT_FOUND, wrong owners/binding remain CAPABILITY_DENIED, ended IDs remain TERMINAL_ENDED; schema violations follow the existing validation-to-HTTP mapping. T02 must inspect that mapping and assert its exact current status/code in endpoint tests rather than invent a new error envelope.

Add `name: string | null` and `nameRevision: number` to Session. New opens initialize null/zero; result always includes them. Durable terminalSession rows gain the same optional fields without a SQL migration: Store's existing record representation is extended, old missing values read as defaults. No output text or name goes into a new global settings record. A host restart still marks old sessions ended, preserving name/revision via existing spread.

For successful rename increment revision once; save identical canonical value returns current metadata without increment or write. To avoid durable/in-memory disagreement, construct candidate metadata, synchronously persist candidate in the existing Store transaction, then publish to the live Session. Refactor persist's argument minimally if needed so a failed write never temporarily exposes candidate metadata; do not change native-exit failure handling. No await between successful persistence and assignment. After `owned` resolves, recheck `exited` before mutation. No rename calls PTY write/resize/kill/spawn or modifies output, offset, path, project/thread, ID, exit code or lifetime.

### Renderer state and ordering

Store acknowledged name/revision, draft, editing, savePending and renameError separately from transport lifecycle/output errors. Reset them on owner/generation changes and effect teardown; late results must not touch a new owner's draft or focus. Expose a rename action through the existing effect-owned actions ref, capturing confirmedId and ownerCurrent; disable until acknowledgment and running phase. Check owner before send, after authentication refresh, after response, and before focus restoration. Run matches on rename responses.

Update metadata from matched open/read/command responses only if revision is at least the last accepted revision for that owner; lower revisions are ignored. Do not overwrite an actively edited draft from polls. Rename responses carry a full output window for protocol consistency but MUST NOT go through append: they must neither change cursor nor phase. The existing read stream owns output delivery. A pending read that predates save may still append its legitimate output, while its old name revision is ignored. Save response cannot remount xterm or restart polling. Other views converge at their next successful read. Retry after ambiguous error is safe/idempotent for the same canonical name; polls remain authoritative.

If exit/owner loss happens during editing, disable Save and close editing on acknowledged end; retain last name for the ended heading. Do not refocus an inactive/unmounted view. Failed save stays in editor, announces error and permits Save again. Poll errors continue to use existing Retry without discarding the name/draft; rename failures do not change terminal phase or block Stop. A successful save closes editor and returns focus to Rename, with a polite “Terminal name updated” or “Terminal name reset” announcement; no shell keystrokes should escape from editor controls.

### Visual design and Animation spec

- Keep toolbar order: name group at left; lifecycle status, Stop, existing Retry/New terminal to the right. The name group takes remaining space (`flex:1; min-width:0`); retain toolbar wrapping. No canvas header, tab or window-title renaming in v1.
- Read mode: existing 13px inherited toolbar typography; strong acknowledged heading, single-line ellipsis, maximum width 240px, `title` with full text. Rename is a visible text button immediately following with an 8px gap (`--ui-space-2`), not a hover-only icon. Accessible name “Rename terminal”. Heading text uses React text content, never HTML or xterm rendering.
- Edit mode: replace name group content in place with a labeled input (“Terminal name”), placeholder “Terminal”, Save, Cancel, and Reset name only when acknowledged name is non-null. Input width 200px, max-width 100%, min-width 96px; controls wrap at narrow widths without horizontal overflow. Name group may occupy its own row at 320px panel width. Do not overlay terminal output or use a modal/popover.
- Input/control minimum height `var(--ui-row-compact)` (32px); gap `var(--ui-space-2)` (8px); editor padding zero inside existing toolbar. Preserve canvas toolbar min-height/padding from workspace-tools.css rather than double-padding. Input background `var(--surface)`, text `var(--text)`, border `1px solid var(--control-border)`, radius `var(--control-radius,8px)`; muted helper uses `var(--muted)`, 12px. Reuse existing button classes and hover `var(--hover)`, disabled opacity .5/cursor default.
- Helper below editor: “Up to 64 characters. Leave blank to use Terminal.” Show normalized code-point count, not raw UTF-16 length. Client validation duplicates authoritative rules and disables invalid Save with specific feedback (“Use 64 characters or fewer”, “Use a single-line name without control characters”). Raw input must allow observing a validation error, not silently truncate pasted text.
- Invalid input: aria-invalid, aria-describedby connecting helper/error, error-text styling and role alert. Saving: button text “Saving…”, aria-busy, disable input/Save/Reset/Cancel until settled to avoid ambiguous local cancel; Stop remains independent. A timeout/failure unlocks editor. Idle unchanged-value Save may close without sending.
- Keyboard: activating Rename selects current custom name (empty draft for fallback), focus input after committed render. Enter saves; composition Enter does not. Escape cancels; Tab follows input → Save → Cancel → Reset → remaining toolbar controls. Prevent editor Enter/Escape propagation to shell/global shortcuts. Pointer blur retains draft. Focus-visible input/buttons use existing terminal rule: 2px solid var(--text), offset 2px. Closing returns to Rename only for current active owner. Escape with no editor retains existing terminal behavior.
- Animation: no mount/exit, width, position, xterm resize animation or save spinner. Only background/border/color hover transitions, `var(--ui-motion-hover)` (120ms) with `var(--ui-ease-move)`, consistent with tokens.css. Honor prefers-reduced-motion by setting these scoped transitions to none; state/focus updates remain immediate. No pulsing, blinking success state or new motion tokens.
- Validate light/dark, 1000px viewport plus 320px constrained panel, 200% zoom, keyboard-only and reduced-motion. Status and Stop must stay reachable, long names must not push controls offscreen, and direction controls must not spoof adjacent status labels.

### Compatibility, privacy, rollback

No shell configuration, terminal profile, identity migration or increased output retention. Names are user-supplied local metadata and may contain sensitive project hints: no analytics, console logging, remote upload, prompt attachment or automatic transcript enrichment. Existing terminal authorization and CSRF remain mandatory. Poll payload increases only by a bounded name and counter; no new polling channel. Rollback can ignore additive fields; existing session IDs/ownership remain valid. Do not delete durable records to reset names. Old builds may discard metadata on later writes; cross-version downgrade preservation is not promised.

## EXECUTION_DAG

One implementing owner should take this small feature end-to-end. T01 → T02 → T03 → T04 → T05 → T06 is sequential; no parallel workers edit shared route/TerminalBody/fixture/manifest files. Each task hands its committed output and checkpoint to the next task's owner; changing owner requires explicit acknowledgment under AGENTS.md. All tasks require the full plan and current repository instructions.

### T01 — Reconcile baseline and establish fixtures

- Prerequisites/inputs: current main, this revision, authorization for implementation and issue coordination.
- Steps/files: search matching open/closed feature work and #1284; inspect terminal files and tests above at current HEAD; verify stable IDs through placement/profile paths; inspect existing route error handler and endpoint fixture patterns in `tests/workspace-action-outcome-routes.test.ts`. Record line drift and exact validation status/code. If concurrent naming work exists, reconcile scope before editing.
- Output: checkpoint with base SHA, agreed scope and test fixture ownership, no product edits.
- Tests: source inspection proves open reuses live ID and ended IDs do not reopen; identify an ownership-negative fixture. Do not infer host restart reconnect support.
- Done when baseline drift and HTTP errors are documented; handoff to T02 with executable fixture setup.

### T02 — Define validated metadata, persist it and expose owner-bound command

- Depends on T01. Own `packages/contracts/terminal-session.ts` (new), `packages/workspace/terminal.ts`, `apps/server/workspace-routes.ts`, contract/host tests, new `tests/terminal-name-routes.test.ts` and manifest source entries.
- Implement shared normalization and limits; add Session/default/result/persist fields, revision/no-op policy, strict rename command arm and host admission. Reuse route-test service/auth/CSRF fixtures with mocked PTY, not an actual shell.
- Inputs/outputs: raw name and admitted session → canonical persisted metadata and existing-shaped response. Preserve all old request bodies and result fields.
- Positive tests: API, trimmed name, blank reset, interior spaces/emoji/CJK, exact 64 boundary, same-name no-op, same-ID reopen/read, actual Store row and exit/recovery metadata.
- Negative tests: 65 code points, raw 257 units, every forbidden range boundary/lone surrogate, missing/null/non-string name, extra rename fields, forbidden name on open; wrong project/thread/path, revoked binding, unknown/ended/evicted IDs; failed persistence leaves read and Store unchanged. Spy that every rename/reset path writes zero PTY bytes and never spawns/resizes/kills.
- Test commands are in VALIDATION; add assertions for exact current route error mapping, auth and CSRF. Done when host/route/contract cases pass and existing terminal host regressions pass; handoff wire examples to T03.

### T03 — Add confirmed-session editor and scoped visual states

- Depends on T02. Own `apps/web/src/TerminalBody.tsx`, `apps/web/src/terminal-read.css`. Read WorkspaceSurfaceBody; edit it only if current binding integration requires it, never add name to its identity/key/layout state.
- Extend TerminalRead/action ref, add fenced metadata reducer/state and revision filtering, draft validation/editor/focus/error semantics from DESIGN. Use confirmed ID and authenticated post. Update metadata without append, cursor edits or effect dependencies. Preserve lifecycle/selection/Stop controls and name on failed read.
- Tests/outputs: extend scoped browser fixture in T04 to cover public behavior; locally inspect type errors after final implementation batch, not fabricated UI verification. Normal: save API; empty: blank reset; error: failed save retains draft/old heading. Done when all design states implemented without remounting terminal and ready for T04's browser assertions.

### T04 — Cover race, API and browser regressions

- Depends on T03. Own extensions to `tests/e2e/terminal-read.spec.ts` and `tests/e2e/fixtures/terminal-read.tsx`; use current scoped runner. Update fixture Read metadata/defaults deliberately, including legacy missing-field tests. Do not weaken existing owner-fencing/output assertions.
- Add stateful mocked name store for remount/reload, two distinct IDs, and delayed GET/rename responses. Assert exact request owner/CSRF/confirmed ID and no type=input request from editing. Test refused pre-ack rename, keyboard/IME, Cancel/blur/reset, overlong/control input, server validation/error, ambiguous failure then read reconciliation, repeated Save suppression, same-value no-op.
- Race cases: stale pre-save GET cannot revert heading; owner/project/thread/ID change, hide, revoke and unmount during save cannot change successor state or focus; read failure/Retry does not erase name; end during save prevents new rename; input/resize/Stop/output retain existing behavior; xterm instance, DOM node and cursor unchanged by rename.
- Persistence cases: same live ID after refresh/reattach retains name; new ID unnamed; host restart remains ended; layout placement/profile keeps ID. Browser fixture proves renderer behavior only; T02's Store tests prove durability, not mocked localStorage.
- Done when scoped Playwright and existing terminal/excerpts/layout tests pass; handoff evidence and remaining real-user checks to T05.

### T05 — Verify acceptance and prepare review evidence

- Depends on T04. Own verification/evidence only unless a failing assertion requires a focused fix in its original task scope.
- Run commands below on frozen edits; exercise a real admitted PTY rename/reset across renderer refresh and native/docked placement in the supported desktop build. On Linux, report native Windows desktop checks as not run and arrange authorized Windows verification rather than claiming equivalence from browser mocks.
- Capture synthetic before/after, editing, invalid and failed-save screenshots in light/dark at normal/narrow widths; keyboard focus and reduced-motion states. Confirm a command continues producing output through rename with no injected bytes. Do not publish raw shell secrets or application profiles.
- Done when acceptance table has evidence or explicit blockers; typecheck/build/unit/API/browser gates green, desktop gap resolved before release. Handoff commit, commands, screenshots and remaining gates to T06; no claiming merged or verified-on-main from local tests.

### T06 — Send finished work to the front end team for review

- Depends on T05. This is the final task. Inputs: finished implementation commit/PR, plan revision, acceptance matrix, test outputs and redacted visual evidence.
- Send the finished work to the front end team for review of layout/tokens, focus, accessibility, failure states, narrow panels and reduced motion. Include exact remaining platform gaps; ask for explicit acknowledgment and record review feedback on the canonical issue. Do not call unreviewed work complete or auto-merge.
- Positive check: reviewer can retrieve commit and evidence and reproduce rename/reset. Negative check: missing screenshot, failed gate or inaccessible artifact blocks release. Done when review handoff is posted and acknowledged; fix feedback through the responsible task, rerun affected checks and request review again. Release the implementing ownership per AGENTS.md when stopping.

## VALIDATION

### Setup and planned implementation commands (not executed for this plan)

Use Node satisfying package.json (at least 24.10), pnpm 10.30.3, Chrome for the existing channel runner, and repository getting-started native prerequisites. On this Linux machine load `source ~/.nvm/nvm.sh`. A docs-only install can use `pnpm install --frozen-lockfile --ignore-scripts`; this does NOT establish native node-pty/SQLite or Windows packaging readiness. Follow [getting started](../getting-started.md) for implementation setup; resolve native prerequisites before real-PTY checks.

```sh
pnpm typecheck
pnpm build
pnpm exec vitest run tests/terminal-session-contract.test.ts tests/terminal-name-routes.test.ts tests/terminal-host-unit.test.ts tests/terminal-opening-race.test.ts tests/terminal-reopen-ended.test.ts tests/terminal-host.test.ts tests/workspace-layout.test.ts tests/terminal-excerpts.test.ts --maxWorkers=1
pnpm exec playwright test --config tests/e2e/terminal-read.playwright.config.ts
pnpm exec playwright test --config tests/e2e/terminal-excerpts.playwright.config.ts
pnpm exec vitest run tests/public-source.test.ts
pnpm check:docs-links
```

New test paths in this command are planned deliverables, not existing files. Preserve the two scoped configs' fixture isolation/ports. Retain traces only in ignored output directories and review/redact before sharing. A browser mock passing is not server authorization or live PTY proof.

### Acceptance matrix and prepublication audit

| Check | Requirement / evidence | Task |
| --- | --- | --- |
| A01 | API/Tests in distinct live terminals; only target heading changes, no new identity or PTY operations | T02–T04 |
| A02 | Trim, valid Unicode, exact limits, forbidden ranges, lone surrogate rejection and blank reset covered by unit/API/editor tests | T02–T04 |
| A03 | Same ID reopens with name/revision; Store persists across writes/recovery, new ID unnamed and restart does not revive shell | T02, T04–T05 |
| A04 | Owner/project/thread/path/auth/CSRF rejection before mutation; late acknowledgment cannot leak name or focus | T01–T04 |
| A05 | Refresh/reparent/profile preserves session identity/name, missing legacy fields render Terminal | T02, T04–T05 |
| A06 | No shell input/title/command/environment changes; output/cursor, Stop/Retry/excerpts still work; no xterm remount on rename | T02–T05 |
| A07 | Pending/error/cancel/reset/IME behavior, same-value save and stale poll ordering verified | T03–T04 |
| A08 | Light/dark/narrow/zoom/focus/reduced-motion screenshots; no toolbar overflow; no canvas-wide naming or shell selection | T03, T05 |
| A09 | Typecheck/build/unit/API/scoped browser green; native supported-platform evidence or explicit release blocker; front end team review acknowledgment | T05–T06 |

Every product requirement maps to A01–A09 and a task. T01 owns discovery; T02 owns authoritative behavior; T03 owns UI; T04 owns browser fixtures; T05 owns release evidence; T06 owns final review handoff. Sequential boundaries avoid overlapping file ownership. No test result in this document is an assertion that the unimplemented feature works.

### Docs-only publication checks

For this plan branch run `pnpm exec vitest run tests/public-source.test.ts` and `pnpm check:docs-links`; record exact results in the publication report. Review source manifest sorted insertion and absence of trailing newline, plan references and docs-only diff. Implementation checks above are intentionally not run against nonexistent feature files. No rendered UI change is part of this deliverable; design remains visually unverified until T05.

## STATE

- Researched: current main source anchors, toolbar/ownership/session persistence, existing tests/fixture runner and design tokens. Read representative earlier plans `ux-chat-header-status.md`, `ux-sidebar-thread-rows.md`, `ux-model-picker-overlap.md` for structure and explicit design depth.
- Decided for v1: metadata-only, canonical nullable name, short bounded plain text, live-only admission, host durability, revision fencing, inline non-optimistic editor and static fallback. These are executable plan decisions, not claims of existing interfaces.
- Implemented: nothing. Feature tests and visuals: not run. Plan published as an issue plus docs-only PR; merging that PR and implementation are not part of publication. No claim/assignee created, so none to release.
- Risks: out-of-order reads, stale owner callbacks, accidental output append from rename result, storage failure, host-restart misunderstanding and native platform verification. Specific mitigation/tests are in T02–T05.
- Next owner: authorized implementing agent, currently unassigned. First action: T01 against then-current main, reconcile issue/PR work and record claim per AGENTS.md. Publication branch ownership ends with docs push, not implementation approval.

## REFERENCES

- [Baseline commit](https://github.com/skytuhua-org/Gen-V1/commit/8fa907f378127bcfc23d71b55c53625ffc43e8da).
- [TerminalBody baseline](https://github.com/skytuhua-org/Gen-V1/blob/8fa907f378127bcfc23d71b55c53625ffc43e8da/apps/web/src/TerminalBody.tsx#L8-L127).
- [WorkspaceSurfaceBody baseline](https://github.com/skytuhua-org/Gen-V1/blob/8fa907f378127bcfc23d71b55c53625ffc43e8da/apps/web/src/WorkspaceSurfaceBody.tsx#L54-L74).
- [Terminal routes baseline](https://github.com/skytuhua-org/Gen-V1/blob/8fa907f378127bcfc23d71b55c53625ffc43e8da/apps/server/workspace-routes.ts#L155-L157).
- [TerminalHost baseline](https://github.com/skytuhua-org/Gen-V1/blob/8fa907f378127bcfc23d71b55c53625ffc43e8da/packages/workspace/terminal.ts#L9-L73).
- [UI tokens](../../packages/ui-shell/tokens.css), [terminal CSS](../../apps/web/src/terminal-read.css), [toolbar CSS](../../apps/web/src/workspace-tools.css).
- [Repository instructions](../../AGENTS.md), [contribution/testing requirements](../../CONTRIBUTING.md).
- External inspiration and excluded shell-selection issue are linked in META. All necessary batch-11 scope is reproduced in REQUIREMENTS; no private memory URL is an implementation prerequisite.
