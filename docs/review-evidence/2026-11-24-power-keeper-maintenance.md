# Power keeper maintenance, 2026-11-24

Scope: bounded maintenance of [PR #1370](https://github.com/skytuhua-org/Gen-V1/pull/1370) under [cleanup #1803](https://github.com/skytuhua-org/Gen-V1/issues/1803), preserving the requirements and outstanding acceptance of [issue #1322](https://github.com/skytuhua-org/Gen-V1/issues/1322).

The starting PR head was `193e17d8488e5c26f5d2d2c25faaf051922a4fca`. The integration parent is current main `9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. The prior unpublished candidate could not be recovered, so this maintenance was reconstructed from those versioned sources and checked again. The claim and prior findings are recorded in [checkpoint 011](https://github.com/skytuhua-org/Gen-V1/issues/1803#issuecomment-7130329676) and [the original desktop review](https://github.com/skytuhua-org/Gen-V1/issues/1803#issuecomment-7123203152).

## Changes

An activity read can no longer acquire a blocker or publish an error after `release()` or `dispose()`. A generation counter invalidates the pending read, release clears queued work, and disposal permanently stops scheduling. A later fresh schedule can still acquire a blocker after ordinary release.

Holding reasons now describe only enabled causes. A blocker is reported as holding only after native `isStarted` confirmation. Unconfirmed handles are stopped even when confirmation throws. These changes retain one blocker, the existing debounce and poll intervals, and the two-consecutive-read-failure policy.

The desktop integration retains main's current quit arbitration, restart ownership, startup guards and native icons. Current backend exit and disconnect release power ownership. Accepted quit disposes the keeper before teardown.

Settings describes idle-sleep prevention accurately: the screen may turn off, and "Sleep, lid-close and power-button actions follow your system settings." Live status is attached to the task setting. The disabled schedules switch points to a visible explanation through `aria-describedby`. The accepted frontend feedback governs this status placement; the original plan's older schedules-row placement is superseded by that feedback. No native or frontend acceptance is claimed by this source change.

## Executed verification

Environment: Linux, Node `24.22.3`, pinned pnpm `10.30.3`, Vitest `4.1.12`. The package manifest, lockfile and workspace file matched current main before reusing its installed dependencies. Heavy checks were serialized.

| Check | Result |
| --- | --- |
| Keeper regressions against the original keeper | 8 failed, 8 passed. The failures proved late success after release/disposal, queued work surviving release, stale failure publication, two disabled-cause reason cases, and two unconfirmed native-start cases. |
| Keeper after the fixes | 16 passed. |
| Focused behavior, contracts, IPC, settings and lifecycle checks | 12 files, 103 tests passed. Includes the real desktop-main module with controlled Electron/sidecar boundaries and assertions for exit/disconnect release and current quit/restart custody. |
| Source manifest | 1 file, 13 tests passed. |
| `bun check --no-script` | No type errors in 1,516 files. |
| `bun lint --no-script` | Passed. |
| `node --import tsx scripts/lint-ui.ts --check` | 635 sources, zero violations. |
| `npm exec --package=pnpm@10.30.3 -- pnpm build` | Passed before the final system-settings copy clarification. Existing large-chunk advisories were emitted. The final wording received fresh typechecking and lint. |
| `node --import tsx scripts/build-desktop.ts` | Passed. This builds the shell; it is not installed Windows qualification. |
| Whitespace check on the maintenance paths | Passed. The complete comparison with main flags preserved CRLF lines in the original desktop contract and Windows verification script; those original files were not reformatted. |

Focused behavior command:

```sh
./node_modules/.bin/vitest run tests/preferences.test.ts tests/desktop-host-controls.test.ts tests/power-activity.test.ts tests/desktop-power-keeper.test.ts tests/desktop-state-broadcast.test.ts tests/settings-registry.test.ts tests/settings-search-filter.test.ts tests/desktop-restart-quit.test.ts tests/desktop-backend-handoff.test.ts tests/update-readiness.test.ts tests/ui-guard.test.ts tests/ui-numeric-children.test.ts --maxWorkers=1
./node_modules/.bin/vitest run tests/public-source.test.ts --maxWorkers=1
```

The first UI-lint attempt used the `tsx` CLI, whose IPC socket was denied by this environment. Running the same script through Node's supported `--import tsx` loader passed without that CLI-only IPC server.

## Browser and native limits

Two new desktop Settings cases were added to `tests/e2e/settings-power.spec.ts`. They exercise the real Settings UI with a controlled desktop bridge in both themes: setting persistence, task-row live status, the disabled control's accessible explanation, release/re-enable, unavailable status, and reduced motion. Their attempted Chromium run failed before page creation because the host denied `socket()` in `process_singleton_posix.cc`. No application assertions or new screenshots ran, and this is not a product-test pass. The existing browser-only exclusion case was not rerun in that filtered attempt.

The normal configured Chrome suite and new Windows installed/native checks remain pending. No full platform-dependent Vitest suite, Windows package build, elevated `powercfg /requests`, sleep-duration qualification or new frontend acceptance was performed in this maintenance.

The [earlier real Windows receipt](https://github.com/skytuhua-org/Gen-V1/issues/1322#issuecomment-7061343812) and its 16 passing built-Electron checks remain valid evidence for their original source and environment. The original screenshots, recording and logs remain preserved under `docs/implementation/issue-1322-power/` at `193e17d8488e5c26f5d2d2c25faaf051922a4fca`. They are not evidence for this revised tree. The original packaged-installer and elevated enumeration limits, frontend review and all protected merge gates remain open.
