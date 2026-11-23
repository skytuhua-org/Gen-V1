# Quick-ask native acceptance (T08, #1332)

Native Windows acceptance run for the quick-ask hotkey feature. Driven by
`scripts/t08-quick-ask-native.ts`, which builds a temporary fixture (project git
repo + prepared thread + settings store), launches `dist/desktop-app/main.mjs`
through Playwright `_electron`, and exercises the feature with OS-level input
(Notepad focus, `SendKeys('% ')` for Alt+Space, a `RegisterHotKey` holder process
for the conflict check, and `RegisterHotKey` after app exit for the release
check). The run hits the live backend for `thread.create` / `message.send`
before stubbing deterministic retry/current-thread assertions.

Result: **18/18 checks passed**, reproduced across three consecutive clean runs
at HEAD `f5fa8fa6` on branch `devin/1332-t08-native` (stacked on the rebased T07
tip `f2519642`). Full check list is recorded in the issue #1332 checkpoint.

Run: `pnpm build && pnpm desktop:build`, then
`pnpm exec tsx scripts/t08-quick-ask-native.ts` (Windows only; requires
powershell.exe and grabs OS focus while running).

## Screenshots

Screenshots are page captures of the Electron windows from the passing run; they
contain no foreign desktop content.

| Check | Image |
| --- | --- |
| Main window ready, project-bound thread selected | [01-main-ready.png](01-main-ready.png) |
| Settings → General quick-ask rows, toggle on | [02-settings-quick-ask.png](02-settings-quick-ask.png) |
| Quick ask opened via Alt+Space from Notepad | [03-quick-ask-open.png](03-quick-ask-open.png) |
| Unsigned send rejected by live backend, draft retained | [03b-send-error.png](03b-send-error.png) |
| After send: quick-ask hidden, main window focused | [04-after-send.png](04-after-send.png) |
| Reopened after Esc/blur, draft preserved | [05-draft-preserved.png](05-draft-preserved.png) |
| Settings shortcut row showing in-use conflict | [06-in-use-status.png](06-in-use-status.png) |

## Screen recording

A desktop recording was attempted with ffmpeg `gdigrab`, but the shared test
machine's foreign windows intermittently regained the foreground, so no
publishable full-desktop capture was produced. The per-window captures above are
the published visual evidence; the driver remains in `scripts/` for a clean-room
re-record.
