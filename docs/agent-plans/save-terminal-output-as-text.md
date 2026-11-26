# Plan: Save retained terminal output as text

## META

- Feature: batch11 row 5, medium — Save retained terminal output as text.
- Repository: `skytuhua-org/Gen-V1`; revision 1, 2026-11-21.
- Verified baseline: `main` at `8fa907f378127bcfc23d71b55c53625ffc43e8da`.
- Status: researched plan only; no feature implementation or feature verification performed.
- Provenance: user feature brief; [VS Code issue 310387](https://github.com/microsoft/vscode/issues/310387), whose title and body were read through GitHub; baseline files below.
- Canonical feature issue / publication PR: not created, explicitly reserved for the requester. Publish this complete document as the issue body, not just a synopsis, and link the committed Markdown source. No issue claims or comments were posted by this planning session.
- Related open work discovered: [find plan #1476](https://github.com/skytuhua-org/Gen-V1/issues/1476), [find implementation PR #1490](https://github.com/skytuhua-org/Gen-V1/pull/1490), [link plan #1536](https://github.com/skytuhua-org/Gen-V1/issues/1536), [link implementation PR #1553](https://github.com/skytuhua-org/Gen-V1/pull/1553), [shell picker PR #1380](https://github.com/skytuhua-org/Gen-V1/pull/1380). These were listed as open, not treated as merged APIs; their diffs were not reviewed. Reconcile overlapping TerminalBody edits before implementation.

## OBJECTIVE

Let a person preserve output already retained in the current terminal view, including after a command exits, without having anticipated shell redirection. Clicking **Save output…** captures the retained normal (primary) xterm buffer, opens a local review of a frozen plain-text snapshot, and only then permits a user-chosen native save or browser download. Success is byte-for-byte agreement between reviewed text and UTF-8 file, with no escape sequences, soft-wrap artifacts, implicit attachment or network export.

This is a screen-buffer snapshot, not a faithful event transcript: cursor overwrites, carriage-return progress updates, erase commands, and screen clears already changed what xterm retains. Earlier evicted output cannot be recovered by this feature. A shell prompt may be included; output from an agent-run transcript is not included.

## REQUIREMENTS

### Binding scope and flows

- R01: A toolbar action exports the entire retained primary buffer, scrollback plus screen, independent of viewport scroll position and selection. Retain the existing 2,000-line scrollback setting; viewport rows are additional, so do not describe the total as exactly 2,000 rows.
- R02: Running, read-interrupted, and ended views can save while their xterm instance and committed owner are current. A starting/unconfirmed view can save only if it has rendered nonempty output and a current owner; no new host acknowledgement or running-process requirement may block already visible text. Empty snapshots show review but cannot save.
- R03: One capture produces immutable text and timestamp. Output arriving after capture is not silently added. Close and reopen to capture newer output. Review is mandatory before any file chooser, download, or write.
- R04: UTF-8 without BOM, LF hard line breaks, soft wraps rejoined, no ANSI attributes, OSC hyperlinks, titles, or other terminal control sequences. Define whitespace and Unicode behavior precisely below. No truncation without disclosure; v1 refuses oversized snapshots rather than saving a partial one.
- R05: Always warn: “Only output still retained in this terminal view is included. Earlier dropped output cannot be recovered.” Also: “Terminal output may contain passwords, tokens, or other credentials. Review before saving or sharing.” Never imply secret detection, redaction, complete history, or recovery from the server.
- R06: Explicit **Save text…** on desktop or **Download text** on web after review. Native cancellation is not failure. Browser initiation is not proof a file was saved. No automatic upload, prompt attachment, journal/localStorage persistence, clipboard write, or telemetry containing output.
- R07: Primary buffer only. While alternate-screen applications are active, disable capture with “Leave the full-screen terminal application to save primary-buffer output.” Do not export an unrelated full-screen alternate buffer or silently expose hidden normal-buffer contents. Re-enable on return. If a snapshot is already reviewed when the terminal changes buffers, preserve its frozen bytes, subject to owner validity.
- R08: Keyboard-accessible, responsive, token-consistent review, specified motion, focus restoration, useful cancel/error/retry states, and no interference with Stop, Retry, New terminal, selection-to-prompt, or terminal input.
- R09: Separate narrowly authorized desktop save API; memory export is precedent, not a generic endpoint. Web needs no server API. Desktop unavailable/old bridge must fail closed with a clear message rather than silently taking the browser path.
- R10: Tests cover normal, empty, failure, Unicode, wrapping, races, lifecycle and native authority. Visual evidence and front end team review are release gates.

### Non-goals and upstream differences

No shell redirection, retention increase, disk logging, periodic/live export, historical reconstruction, timestamps per output line, ANSI/color option, settings surface, selected-output variant, context-menu/command-palette entry, agent transcript export, automatic sharing, automatic secret redaction, or persistence of review state. The upstream request includes optional ANSI, timestamps, selection and multiple entry points; those are not this v1. Do not add an xterm serialization addon merely to reproduce control sequences that plain text must exclude.

## REPO_MAP

Verified at the baseline, not promises about unmerged branches:

| File / symbol | Current behavior and implementation consequence |
| --- | --- |
| `apps/web/src/TerminalBody.tsx`, `TerminalBody`, effect-local `instance`, `ownerCurrent`, `append`, `poll`, `ownedActions`, cleanup | Dynamically constructs real xterm with `scrollback:2000`; cursor starts at zero; polls at 500ms after an initial 250ms; `append` queues `instance.write`, inserts a visible expired-host-output marker on `start > cursor`, sets phase ended without disposing xterm. Cleanup disposes on ownership/effect changes. Expose capture through this existing owned action boundary, not an unguarded global terminal ref. |
| Same file, `latest` / committed `useLayoutEffect`, `generation`, `actions` | Identity includes project, thread, terminal, active flag and generation plus caller guard. A suspended concurrent render must not lend authority. Use these guards before and after all asynchronous work and close review on committed owner changes. |
| Same file, `canAdd`, `addSelection`, custom key handler | Selection-to-prompt is conditional on matching editable composer, not universal terminal behavior. Export must not require composer presence, capture selection, or call `captureTerminalExcerpt`. |
| `packages/workspace/terminal.ts`, `TerminalHost.result/read/open/command/evictExited` | Host stream window is separately bounded at `512*1024` JavaScript string units (comments call it KiB, but not a UTF-8 byte limit). `result` returns `start`, end `cursor`, substring and exited metadata; cursors are UTF-16 units, not xterm row counts. Up to 48 exited sessions retained in memory by exit order. `read` can read retained exited sessions; `open` rejects ended IDs. Durable metadata does not persist output. No host changes needed. |
| `apps/web/src/project-memory-api.ts`, `downloadProjectMemory` | Browser Blob / download anchor / delayed object-URL revocation precedent. Desktop branch is memory-schema-specific, verifies receipts and does not fall back when bridge is missing. Do not reuse its memory request or JSON serializer. |
| `apps/desktop/memory-export.ts`, `createMemoryExportDownloads` | Trusted session download admission is deny-by-default and restricted to validated, redacted project-memory JSON. Generic renderer Blob downloads will be rejected in guarded desktop sessions. Do not widen this permit or pass arbitrary terminal text to it. |
| `apps/desktop/main.ts`, `secureSessionDownloads`, `registerIpc` local `handle`, `authorize` dispatch | Session guard delegates to memory exporter; IPC dispatch authorizes a window before action. Add a distinct native terminal-save handler here, keep the existing download guard unchanged. |
| `apps/desktop/preload.ts`; `packages/desktop-contract/index.ts`, `DesktopBridge`, `DESKTOP_CHANNELS`, `DesktopSurface` | Existing optional memory export method/channel establishes typed preload pattern; terminal save method/channel are new proposed APIs, not current capabilities. |
| `packages/ui-shell/Modal.tsx`, `Modal`; `controls.css`; `tokens.css` | Native dialog, Escape/backdrop handling, focus retention/restoration and exit lifecycle already exist. Reuse rather than creating a custom overlay; shared styles provide colors, spacing and motion. |
| `apps/web/src/terminal-read.css`, `terminal-excerpts.ts`, `terminal-excerpts.css` | Terminal toolbar focus/disabled styling and separate excerpt limits. Export has its own helper and styles; excerpt schema byte cap and draft persistence are inappropriate. |
| `tests/e2e/terminal-read.spec.ts`, `fixtures/terminal-read.tsx`, `terminal-read.playwright.config.ts`, `terminal-read.vite.config.ts` | Synthetic terminal API, real xterm instances, ownership/suspended-render controls, Chrome on port 5814; strongest existing browser integration harness. Extend this spec and fixture rather than inventing an App boot sequence. |
| `tests/terminal-excerpts.test.ts`; `tests/e2e/terminal-excerpts.spec.ts`, `terminal-excerpts.playwright.config.ts` | Regression coverage for selection/composer behavior. |
| `tests/terminal-host-unit.test.ts`, `terminal-opening-race.test.ts`, `terminal-reopen-ended.test.ts`, `terminal-host.test.ts` | Existing host retention, cursor, ownership and ended-ID coverage; no host implementation change planned. |
| `tests/desktop-memory-export.test.ts`, `memory-export-client-v3.test.ts` | Existing native/client memory admission regressions to keep intact. New terminal-native tests should follow injection/mock style without sharing memory schema. |
| `scripts/public-source-files.json`; `tests/public-source.test.ts` | New files must be source-listed alphabetically; add packaged files to runtime as required by existing manifest rules. |

## DESIGN

### Capture contract and data flow

Proposed new `apps/web/src/terminal-output-export.ts` exports a pure snapshot serializer over the public xterm buffer interfaces, filename builder, size constants, and browser/native save adapter (split the adapter into a sibling file only if necessary for test isolation). Proposed snapshot fields: `text`, UTF-8 `bytes`, `capturedAt`, retained physical `rows`, logical `lines`, `filename`; keep the ownership token outside the serializable payload. No raw stream/cursor field is needed for serialization.

1. Toolbar calls an owned `capture` action. Capture admission checks instance availability, active primary buffer and committed `ownerCurrent()`, not phase ended or selection. Prevent double capture.
2. xterm `write` is asynchronous: enqueue a zero-length write with a callback as a parse barrier, after all earlier queued writes. Inside that callback synchronously recheck ownership and primary-buffer status, read `instance.buffer.normal`, build the text and timestamp, and freeze the snapshot. Do not await unrelated work inside the read loop. Later writes cannot mutate the string. Test the installed xterm version's zero-length callback behavior; if unsupported, use a serialized queue of existing write callbacks, never arbitrary timeouts or an escape sequence that changes the buffer.
3. The output is the buffer as rendered at that barrier, not necessarily all host bytes received by the time the user eventually clicks Save. No host read or flush command is issued. An ended process has no effect on capture availability if this instance survives. Remount/restart may lose the view; do not offer recovery or reopen an ended host ID to export.
4. On success open review; repeated capture clicks while preparing do nothing. Dispose/invalidate cancels pending capture and clears review. Primary-buffer switches during capture produce a local explanation, not stale export.
5. Review confirmation passes the exact frozen text and generated filename to the save adapter. Check current ownership immediately before browser click/native invocation and after awaits. Cancellation and retry reuse the same snapshot; close/reopen intentionally takes a new one.

### Serialization decisions

- Read all retained rows, not `viewportY` onward, not DOM `.xterm-rows`, not `getSelection`, not the host `output` stream. Inspect only public APIs such as `getLine`, `isWrapped`, `translateToString`, `getCell`, `getChars`, `getCode` and `getWidth`; no private xterm internals.
- Include through the greater of the normal buffer's absolute cursor row (`baseY + cursorY`) and last row containing actual non-padding text. Exclude unused blank viewport rows below that. Retain real blank rows before that boundary. Join logical rows with LF; do not append an unconditional newline. A final empty cursor row after a real line feed therefore preserves that line feed. Empty initialized buffer serializes to an empty string, not many newlines.
- `isWrapped` describes continuation of the preceding retained physical row. If the next physical row is wrapped, concatenate without LF; otherwise emit LF between retained rows. If the first retained row has `isWrapped`, keep its visible tail without inventing a missing prefix and rely on the always-visible retention warning.
- Intermediate wrapped rows retain meaningful spaces to avoid joining words. Final physical rows of logical lines remove right-side padding/trailing spaces via `translateToString(true)`. Preserve leading and interior spaces, blank logical rows and tabs as xterm-rendered spaces. This is normalized terminal text, not byte-preserving shell output; state “Trailing spaces at line ends are removed” in review details.
- Wide/CJK glyphs occupy two cells; width-zero continuation cells must not become spaces or duplicate characters. Use xterm's translation semantics, never slice by JavaScript character count or column count. A wide glyph wrapping from the last column can leave a null padding cell: omit only that null wrap-padding cell when public cell metadata and the next row's leading wide glyph demonstrate this case, not an explicitly typed space. Add a real-xterm boundary fixture to lock this behavior before shipping. Preserve combining marks, surrogate-pair emoji and full glyph strings returned by xterm.
- Styling and ANSI/OSC payloads are already consumed by xterm. Still exclude residual C0/C1 controls from serialized cells except LF separators; do not run a regex against raw PTY chunks as the export algorithm. Preserve ordinary Unicode (including combining marks and joiners). Do not strip the host-gap marker because it is meaningful rendered text.
- Encode once with `TextEncoder`, maximum 8 MiB UTF-8 per snapshot. Refuse above cap, no partial file. Check incrementally during serialization before large concatenations, then verify final encoded size. This cap is a new safety bound, not the host's bound; wide screens and future dimensions must not defeat it. Complexity is linear in retained cells, not lifetime output. No buffer-growth setting change, worker, background cache, or persistent export store.

### Filename and save transports

Default: `terminal-output-YYYYMMDD-HHmmssZ.txt` using the capture timestamp in UTC. Use fixed ASCII prefix plus digits only; do not include command, title, cwd, project name, user input or host IDs. Builder tests must cover invalid dates (fail with local capture error), deterministic UTC and same-second captures (same suggestion is acceptable; chooser handles collisions). Native boundary validates basename length at most 120, fixed pattern and `.txt`, rejecting separators, traversal, NUL, device names, trailing spaces/dots and extra fields. User's chosen native path is not subjected to the suggested basename grammar; it comes only from the OS chooser, never from renderer IPC.

Web: construct a `text/plain;charset=utf-8` Blob only on explicit review confirmation, create/click/remove a temporary download anchor, revoke URL on a later task even on click failure. Save adapter returns `started`, not `saved`; announce “Download started. Your browser controls where the file is saved.” Browser settings may use the default download folder; do not promise every browser displays a chooser or add the File System Access API requirement.

Desktop: add proposed `DesktopBridge.saveTerminalOutput?({text,filename})` and a distinct `DESKTOP_CHANNELS.terminalOutputSave`. New `apps/desktop/terminal-output-save.ts` owns validation and native write flow; `preload.ts` exposes only this typed method, `main.ts` registers via authorized `handle`. Use Electron `dialog.showSaveDialog(ownerWindow, {title:'Save terminal output', defaultPath:filename, filters:[{name:'Text',extensions:['txt']}], properties:['showOverwriteConfirmation']})`, then write exact UTF-8 bytes to the path returned by that dialog. No renderer-selected path, backend API, download admission widening, arbitrary URL, shell command or memory endpoint.

Allow main surfaces; thread/plan/workspace surfaces only where the terminal UI is actually hosted (T01 must verify call sites and narrow the allowlist). Deny plugins, browser, artifact, agent, notification and unrelated surfaces by default. The renderer owns the terminal contents: this is permission to save user-reviewed text, not host proof of output provenance. Do not claim session ownership can be cryptographically attested from renderer text.

Capture authorized window/frame/document identity at invocation. Require ready/current/non-destroyed state before chooser and recheck immediately after it resolves before writing. Limit one pending save per window, four globally; clear slots in `finally`, including cancel, navigation and exceptions. Chooser cancellation returns `{status:'cancelled'}` with no write. Resolve successful write as `{status:'saved',bytes}` only after completion; no full path in renderer receipt/logs. A write failure may leave a partial file: say so without exposing its path, retain review for retry, never claim atomic completion or silently retry/overwrite. Navigation during an already-started OS write cannot reliably cancel disk I/O; prevent stale UI success and document this narrow race, do not promise revocation can undo an authorized write.

Validate payload shape/byte bound again in main before opening dialog. Reject residual disallowed controls rather than silently changing reviewed bytes. Keep the global `will-download` guard and memory export untouched. If `window.harnessDesktop` exists without new method, show “This desktop version cannot save terminal output. Update the app and try again.” No browser Blob fallback in that branch.

### State machine, privacy and recovery

States: idle → capturing → reviewing(snapshot) → saving(snapshot) → reviewing with error/cancel receipt, or success → closed. Capture error returns idle with terminal-local alert. Desktop saved closes review and announces saved; native cancelled stays in review with “Save cancelled.” Web started closes and announces initiation only. Close, Escape and backdrop discard review before submission. While awaiting native save, disable repeat confirmation and review dismissal, announce busy, and let the OS chooser own cancellation; owner invalidation still clears renderer state. A native chooser remains OS-owned if navigation occurs; main must refuse a write when the owner is no longer current on return.

Keep export errors separate from existing read/stop errors and never reset terminal phase because saving fails. Store text only in in-memory snapshot until dialog exit completes; Modal retains last children during exit, so ensure an unmounted review component releases those references afterward. No analytics, console output, breadcrumbs, error cause strings, screenshots or traces containing real terminal text. UI warnings are not a security scanner. Review displays literal text with React text/readonly textarea, never HTML or clickable untrusted markup. No automatic prompt attachment or memory mutation. Rollback removes the control/helper/bridge/channel/tests; no storage migration, server change, retention change or compatibility negotiation beyond optional bridge detection.

## VISUAL DESIGN AND ANIMATION SPEC

This is a specified future design, not a claim that it has been rendered or visually verified.

- Toolbar: add a text button **Save output…** after Stop/Retry and before New terminal. Use existing `secondary` styling, height `var(--ui-row-compact)` (32px), 8px inline inset, 8px gap, 12px text; touch density minimum 44px. Keep Terminal title/status readable; allow action row wrapping at narrow widths without overlapping xterm. Visible label and accessible name match. Disabled reason is visible adjacent helper text when alternate buffer is active, not only a tooltip. Do not steal terminal focus on pointer-down merely to preserve selection; export ignores selection.
- Review: use shared `Modal` titled **Save terminal output**, scoped class `terminal-output-review`; width `min(760px, calc(100% - 16px))`, existing 12px radius/border, surface/text tokens and 24px `--ui-dialog-inset`. Respect shared native-titlebar top/max-height treatment; no extra fixed overlay. Use 16px vertical section gaps; at widths below 480px use 16px content inset and full-width stacked footer buttons, Cancel first, confirmation second.
- Layout order: title/close; capture metadata (UTC time, retained physical rows, logical lines, UTF-8 bytes); retention warning; credential warning; whitespace note; readonly preview; suggested filename; save error/status; footer **Cancel** and platform confirmation. Warnings use normal text and `var(--muted)` for explanatory lines, not color alone; do not use danger-red as a substitute for readable copy.
- Preview: labelled **Retained terminal output**, readonly textarea with spelling disabled, tab-focusable, monospace 12px/1.5, `white-space:pre`, horizontal/vertical scrolling, height `clamp(160px, 40vh, 360px)`, minimum width zero, 12px inset, 1px `var(--border)`, 8px radius, `var(--surface)` / `var(--text)`. No syntax highlighting or rendering ANSI escapes. Full snapshot remains reviewable; do not preview only a truncated prefix and save hidden suffix. For empty snapshot show “No retained terminal output to save.” and disable confirmation, with Cancel usable.
- Focus: dialog opening focuses the readonly preview (after mount), with title and warnings associated through accessible descriptions; Tab stays within native modal. Save does not initially receive focus. Escape/backdrop/close obey Modal conventions except busy dismissal guard; guard composing input using existing behavior. On close restore trigger; if trigger vanished, move focus to surviving terminal/workspace heading, never body. Busy disables controls without losing trapped focus via shared retainFocus. Screen-reader status is polite for capturing/cancelled/started/saved; errors use a scoped alert. No repeated announcements per arriving output.
- Motion: reuse `.ui-modal` enter 180ms `--ui-motion-popup-enter` with `--ui-ease-enter` (`cubic-bezier(.16,1,.3,1)`), opacity 0→1 and scale .97→1; exit 140ms `--ui-motion-popup-exit` with `--ui-ease-move` (`cubic-bezier(.4,0,.2,1)`). Scrim follows the shared transition/blur tokens (6px blur, black at .4). Do not add a second animation or animate preview text/height as output arrives. Button hover 120ms `--ui-motion-hover`; press 80ms `--ui-motion-press`; focus ring appears immediately, 2px `--ui-focus-ring`, offset 2px.
- Reduced motion: honor OS `prefers-reduced-motion` and app `data-motion`/panel-animation settings. No scale/translation or spinner rotation; use at most 80ms opacity for reduced mode and no transition for motion off. Inherit shared scrim motion suppression. Use static “Preparing…” / “Saving…” text, no pulsing loop. Verify both global app policy and OS preference; add only scoped overrides if needed, do not alter shared token values.

## EXECUTION_DAG

Task IDs are stable. One implementation owner coordinates the entire feature. Claim via the requester's eventual canonical issue before editing. Every task posts evidence/state there; no parallel edits of shared files. T02 and T03 may run in parallel only after T01 freezes contracts; T04 follows both. All new paths below are proposed, not baseline files.

### T01 — Rebase evidence and freeze public contracts

- Dependencies: none; input is this entire revision and current main. Owner: integration implementer.
- Read `AGENTS.md`, check canonical issue/comments and related open PRs. Compare baseline `TerminalBody`, xterm dependency/types and desktop authorization. Find TerminalBody call sites with `rg 'TerminalBody' apps/web/src` and map native host surfaces; inspect `authorize`, plugin channel policy and desktop tests for new-channel deny-by-default requirements.
- Verify buffer API semantics, parse barrier and CJK wrap padding against installed real xterm. Freeze snapshot/save types, 8 MiB cap, native surface allowlist and lifecycle token. Record any deviation as a complete plan revision before coding.
- Output: agreed contracts and collision map; no retention changes. Positive check: main/thread/workspace terminal hosting supported. Negative check: plugin/browser surfaces cannot gain a text-write API; old bridge remains denied.
- Done when no unknown gate affects native authorization or serialization; hand off contracts to T02/T03 and UI integration owner. If a required surface cannot be authorized with current dispatch, block that scope for review rather than broaden all windows.

### T02 — Implement deterministic bounded snapshot and web adapter

- Depends T01. Owner: serializer implementer; exclusive files `apps/web/src/terminal-output-export.ts`, new `tests/terminal-output-export.test.ts`; do not edit TerminalBody.
- Implement buffer traversal, wrap/Unicode/whitespace/control normalization, row boundary, incremental cap and filename exactly as DESIGN. Browser adapter receives frozen text, filename and current guard; create no Blob before confirmation. Add optional-desktop dispatch with explicit unsupported result/error, not fallback.
- Inputs: public buffer facade and injected timestamp/save bridge for tests. Outputs: immutable snapshot and transport result `started`/`saved`/`cancelled` with no file path. Test deterministic output, no mutation of buffer, URL cleanup, stale guard and adapter errors.
- Positive tests: hard/soft breaks, multiwrap, blank rows, final LF, viewport-independent capture, emoji/CJK/combining and exact UTF-8 bytes. Negative tests: empty, alternate active admission, oversized including multibyte boundary, invalid date, bridge missing, anchor throw, malformed receipt. Test browser result never says saved.
- Done when focused unit tests pass and fixtures encode expected literal text/bytes; hand helper API and fixtures to T04. New files are registered by T05.

### T03 — Implement separate trusted desktop text-save path

- Depends T01. Owner: desktop implementer; exclusive `apps/desktop/terminal-output-save.ts`, `apps/desktop/main.ts`, `apps/desktop/preload.ts`, `packages/desktop-contract/index.ts`, new `tests/desktop-terminal-output-save.test.ts`; touch plugin channel policy only if T01 proves a mandatory explicit denial is needed.
- Implement proposed method/channel, strict payload validation, main authorization, chooser-only path, UTF-8 write and bounded pending slots. Inject chooser/write dependencies into helper for unit testing; return minimal receipts. Keep memory exporter and secure download guard unchanged.
- Inputs: authorized window identity/current callback plus reviewed payload. Outputs: native receipt or content-free failure. Recheck identity after chooser. Do not invoke shell, renderer arbitrary filesystem API, server endpoint or uncontrolled download.
- Positive tests: exact bytes to chooser-returned path, valid surface, cancel no write, completion and pending-slot cleanup. Negative: forged/untrusted frame, wrong surface/thread when applicable, navigation/destroy while chooser open, malformed/extra fields, unsafe suggested filename, size/control violations, concurrent cap, chooser reject, write reject/partial file warning, late completion. Assert no path/output in receipt/errors.
- Done when native unit tests and unchanged memory admission regressions pass; hand native bridge to T04, Windows verification instructions to T05. Do not claim mocked Electron tests verify a real OS dialog.

### T04 — Integrate guarded capture, review and motion

- Depends T02 and T03. Owner: web integration implementer; exclusive `TerminalBody.tsx`, new `TerminalOutputReview.tsx`, new `terminal-output-export.css`; import shared Modal rather than extending its global behavior.
- Add owned capture method using parse barrier; subscribe/dispose buffer-change readiness updates. Keep capture guard separate from `canStop` and `canAdd`. Preserve instance after ended. Add snapshot/review/save states and clear on effect cleanup or committed owner invalidation; do not use speculative render props as authority.
- Implement exact visual spec/copy and focus handling. Close/reopen refreshes snapshot; retry uses same snapshot. Keep preview in memory only and clear after exit. Add `aria-describedby` through child relationships or scoped component wiring without weakening shared Modal accessibility.
- Positive browser tests: running and ended exports; buffer larger than viewport; immutable preview while polling continues; keyboard review/confirm; native mocked saved/cancelled; literal text containing HTML. Negative: alternate-buffer capture, unmount/switch/restart/inactive/stale guard at barrier and confirm, suspended handoff, empty disabled save, capture/size/save failure, double click, no composer, no automatic attachment/upload; host output arriving just before barrier is included once.
- Done when behavior matches snapshot contract and toolbar/selection/stop/retry are unchanged; hand integrated surface to T05. Do not add a backend export route to work around lifecycle bugs.

### T05 — Complete regression, visual and platform verification

- Depends T04. Owner: verification/integration implementer; exclusive extensions to `tests/e2e/terminal-read.spec.ts`, `tests/e2e/fixtures/terminal-read.tsx` and necessary scoped fixture CSS; register all new files in `scripts/public-source-files.json` with existing source/runtime rules. Avoid shared build/CI changes.
- Extend existing real-xterm fixture and API request audit, download interception and native bridge stubs. For web, read the actual Playwright download bytes and compare with reviewed textarea text; count zero export requests and zero prompt writes. Existing polling is allowed and must continue normally. Add real-xterm wrap fixtures, ANSI/OSC, erase/progress and >2,000-row eviction; assert no claim to recover dropped prefix. Exercise resize/reflow before capture and while review open without changing captured bytes.
- Execute commands below once final edits are frozen, record outputs separately for new and existing tests. Inspect large snapshot responsiveness at narrow/wide terminals; capture synthetic-only screenshots at 1280px and 390px in default and reduced motion, running review, ended review, empty/error and alternate-buffer helper. Assert no body focus escape, accessible title/warnings and no clipped confirmation at zoom/touch density.
- Run an actual supported Windows desktop build to verify OS chooser, cancel, overwrite confirmation, chosen path UTF-8 content, unsupported/denied windows and write failure. If unavailable, explicitly leave Windows gate pending for a Windows verifier; Linux mocks are not a substitute. Capture no real logs or personal paths in evidence.
- Done when acceptance matrix passes with command output, redacted screenshots and Windows evidence (or explicit blocked release gate); hand branch/SHA, plan revision, failures and evidence to T06. No feature release while a required platform gate is merely pending.

### T06 — Send finished work to the front end team for review (LAST TASK)

- Depends T05; owner: integration implementer. Inputs: finished branch/PR, exact commit, canonical plan and validation evidence. Files: no feature edits; publish issue/PR handoff according to AGENTS.md, using requester-authorized publication workflow.
- Send the finished work to the **front end team for review**, explicitly requesting review of toolbar placement, warnings, full-text preview, keyboard/focus, responsive layout, reduced motion, and snapshot/save semantics. Include Windows result and privacy/admission tests. Do not self-approve or call review sent an approval.
- Positive check: complete source/evidence links resolve and reviewer can reproduce the focused commands. Negative check: any unavailable screenshot, missing Windows evidence or unresolved failure is labelled, not hidden behind a passing build. Done when delivery is recorded and receiver ACK requested; approval remains a release gate. Recipient: front end team; release issue ownership per repository contract.

## VALIDATION

### Planned implementation commands (NOT executed for this docs-only change)

From repo root with Node/pnpm configured. Install browser prerequisites per `docs/getting-started.md`; the terminal scoped config explicitly uses Google Chrome, not just bundled Chromium.

```sh
source ~/.nvm/nvm.sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm exec vitest run tests/terminal-output-export.test.ts tests/desktop-terminal-output-save.test.ts
pnpm exec vitest run tests/desktop-memory-export.test.ts tests/memory-export-client-v3.test.ts tests/terminal-excerpts.test.ts
pnpm exec vitest run tests/terminal-host-unit.test.ts tests/terminal-opening-race.test.ts tests/terminal-reopen-ended.test.ts
pnpm typecheck
pnpm build
pnpm exec playwright test --config tests/e2e/terminal-read.playwright.config.ts
pnpm exec playwright test --config tests/e2e/terminal-excerpts.playwright.config.ts
pnpm exec vitest run tests/public-source.test.ts
pnpm check:docs-links
```

These new test paths are to be created by T02/T03. No claim they already run. T03 should discover any additional desktop contract/plugin guard tests affected by the new channel and include them in its evidence. `tests/terminal-host.test.ts` includes real PTY/platform-specific coverage; run with supported native dependencies on Windows for T05's platform gate, do not infer live PTY success from ignore-scripts install.

### Acceptance matrix / prepublish audit

| Requirement | Task(s) | Observable acceptance check |
| --- | --- | --- |
| R01 retained primary snapshot, fixed retention | T01,T02,T04,T05 | Scrolled viewport/selection do not change output; >2,000-row fixture drops prefix without host backfill; scrollback option unchanged. |
| R02 ended/read-interrupted and current view only | T04,T05 | Exit/Stop leaves save usable; disposal/owner switch invalidates; no ended-ID reopen; no composer dependency. |
| R03 explicit immutable review | T02,T04,T05 | No chooser/download before confirmation; new incoming output not in reviewed file; reopen refreshes. |
| R04 Unicode/plain text/whitespace/cap | T02,T05 | Exact real-xterm CJK/emoji/wrap/ANSI/OSC/blank-line download bytes; no ANSI/control payloads; oversize refuses with no partial download. |
| R05 warnings and bounded truth | T04,T05 | Both exact warnings always visible and accessible; gap marker preserved; no promise of full history/redaction. |
| R06 intentional local save/privacy | T02,T03,T04,T05 | Request audit has no export/upload/attachment; native cancel writes nothing; web started never claims saved; no persistence/logged text. |
| R07 alternate-buffer policy | T01,T04,T05 | Full-screen active disables with visible reason; race at barrier refuses; return re-enables; reviewed primary snapshot does not morph. |
| R08 UX/motion/focus/errors | T04,T05,T06 | Keyboard trap/restore, narrow/touch/zoom/reduced-motion screenshots; errors retry frozen snapshot; no Stop/Retry/selection regression. |
| R09 desktop trust/compatibility | T01,T03,T05 | Native denied-frame/surface tests and chooser-only path; old bridge shows update error; memory download deny policy unchanged. |
| R10 tests and team review | T02–T06 | Focused suites and docs checks recorded; Windows native evidence; front end team handoff and review before release. |

Release gate: passing implementation checks, actual Windows native verification, synthetic visual evidence, privacy review and front end team approval; missing evidence blocks release, not silently downgraded. Publication checks only validate this plan's source registration/links, not implementation feasibility in a running UI.

### Actually executed for plan publication

Baseline source and upstream issue were read; three neighboring plans were sampled for structure (`thread-publish-pr.md`, `ux-chat-header-status.md`, `ux-composer-crowding.md`). Documentation/source-manifest commands and their actual results are reported with the pushed documentation commit in the delivery message. No application, browser, visual, real PTY or native Windows verification was performed during planning. Those remain T02–T06 obligations.

## STATE

- Researched/decided: baseline map, host-vs-view retention distinction, ended-view constraints, explicit primary-only snapshot, frozen review, normalization, file naming, separate desktop chooser API, visual/motion design and tests.
- Implemented: this plan only; T01–T06 are NOT_STARTED. No host/web/desktop feature files changed by the planning task.
- Verified: source claims against the stated main SHA, upstream issue body and existence/open status of related work. Not verified: related PR diffs, live UI rendering, exact installed xterm padding/barrier semantics, Windows chooser behavior; T01/T05 explicitly resolve these before release.
- Ownership: requester owns issue/PR publication; no feature issue claimed. Next implementation owner must read the complete published issue, all comments and this versioned source, ACK scope, then start T01 from updated main. Planning branch and final SHA are supplied in the delivery report rather than embedding a self-referential commit.
- Risks: shared TerminalBody changes in open PRs; xterm async writes and Unicode boundary padding; native arbitrary-write scope; dialog ownership during navigation; review can contain credentials; renderer disposal destroys view-only history; large preview/layout cost. Mitigations and negative tests are assigned above.
- No known failed feature implementation attempts; none were made. Issue-body readback/attachment publication is intentionally not performed because the requester will open the issue/PR. Document source is ready for that publication, not a claim of HANDOFF_COMPLETE on a nonexistent issue.

## REFERENCES

- [Upstream feature request and optional variants](https://github.com/microsoft/vscode/issues/310387).
- [Baseline terminal UI](https://github.com/skytuhua-org/Gen-V1/blob/8fa907f378127bcfc23d71b55c53625ffc43e8da/apps/web/src/TerminalBody.tsx).
- [Baseline host retention and result metadata](https://github.com/skytuhua-org/Gen-V1/blob/8fa907f378127bcfc23d71b55c53625ffc43e8da/packages/workspace/terminal.ts).
- [Baseline memory client download precedent](https://github.com/skytuhua-org/Gen-V1/blob/8fa907f378127bcfc23d71b55c53625ffc43e8da/apps/web/src/project-memory-api.ts).
- [Baseline restricted native memory export](https://github.com/skytuhua-org/Gen-V1/blob/8fa907f378127bcfc23d71b55c53625ffc43e8da/apps/desktop/memory-export.ts).
- [Repository publication/coordination contract](../../AGENTS.md), [contribution rules](../../CONTRIBUTING.md), [test setup](../getting-started.md), [shared modal](../../packages/ui-shell/Modal.tsx), [motion tokens](../../packages/ui-shell/tokens.css).
