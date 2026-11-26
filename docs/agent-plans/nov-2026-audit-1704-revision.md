Plan file (identical copy, SHA-pinned): https://github.com/skytuhua-org/Gen-V1/blob/46ca0752eefcffc927937a51d8e73bc03feaf1b1/docs/agent-plans/ux-shortcut-rebinding-guards.md

## UX: Shortcut rebinding saves broken bindings silently — no conflict check, bare keys hijack typing, no reset

### META
- Repo: skytuhua-org/Gen-V1 — baseline `main` @2640b897 (docs-only plan, rev 1, 2026-11-22)
- Found during interactive QA of the built fixture app on :4317 (pass 10)
- Related: PR #1437 (#1371 T03) adds a read-only "Also used by <labels>" note on conflicting rows — display only; nothing in it blocks or resolves a conflict, guards bare keys, or offers reset. This plan builds on that note, not overlaps it.
- Status: plan only, not implemented

### OBJECTIVE
The Settings → Shortcuts capture field persists literally any keydown as a binding, immediately, with no validation. Three verified consequences:

**Observed bugs (all repro'd live on :4317):**
1. **Silent conflicts:** rebinding `Search` to Ctrl+B (already `Toggle sidebar`) saves without warning; first-match-wins in `matchesShortcut` means one of the two actions is silently shadowed.
2. **Bare printable keys hijack typing app-wide:** rebinding `Search` to the letter `k` made pressing `k` focus the sidebar search from *anywhere — including inside the composer textarea*. The global keydown handler in `App.tsx` has **no editable-target guard** (`event.defaultPrevented` and `dialog[open]` checks only): the `k` was swallowed, never reached the textarea. Verified live: composer stayed empty.
3. **Hostile capture set + no recovery:** the `ShortcutInput` (`apps/web/src/Settings.tsx` ~:89) accepts `Backspace`, `Enter`, `Escape`, `Tab`, `Space`, modifier-only presses, and single letters identically — and offers no reset-to-default and no unbind. One stray keydown permanently rebinds an action with no way back except hand-editing preferences.

### REQUIREMENTS
- In scope: `ShortcutInput` + the keybindings rows in `apps/web/src/Settings.tsx`; a target-element guard in `apps/web/src/App.tsx` global keydown; `resolveKeyboardBindings`/`chordFor` in `apps/web/src/keyboard-bindings.ts` if the stored shape needs a "cleared" value.
- Out of scope: the command-menu entries being added by PR #1437 (they inherit these guards automatically); changing any default chord.
- A binding that could not have worked must be impossible to save; a conflict must be visible and require an explicit choice; every row must be recoverable to its default.
- Compact UI; reuse Settings' existing row/notice styles and `--danger`/`--muted`/`--border` tokens. No new type styles.

### REPO_MAP (verified)
- `ShortcutInput`: `apps/web/src/Settings.tsx` ~:89 — `readOnly value={value} disabled={busy} onKeyDown={capture}`; saves on every capture. Row title `Focus and press a shortcut`.
- Global dispatch: `apps/web/src/App.tsx` ~:787-796 — `defaultPrevented`/`dialog[open]` gates, then `matchesShortcut` chain; no input/textarea/contenteditable exclusion.
- Matcher: `packages/ui-shell/shell-layout.ts:23` `matchesShortcut` — `ctrl` matches ctrl XOR meta; bare-key chords fire with no modifiers.
- Registry/defaults: `apps/web/src/keyboard-bindings.ts` (`KEYBOARD_BINDINGS`, `preference` subset) and `packages/contracts/preferences.ts` `defaultKeybindings`.
- Conflict note (PR #1437): Settings row renders "Also used by <labels>" when two preference chords are equal — the anchor this plan extends.
- Fixture: Settings opens from sidebar on any :4317 scenario.

### DESIGN
1. **Editable-target guard (global, code not config):** at the top of the `App.tsx` keydown handler, after the existing gates, return early when `event.target` is inside `input, textarea, select, [contenteditable="true"], .xterm-host` *unless* the matched chord contains a modifier (`ctrl`, `alt`, or `shift`+`ctrl`/`meta`) — i.e. bare-key bindings (single letter, F-keys with no modifier, Escape handled separately per its existing `stop` semantics) never fire from editable surfaces; modifier chords (Ctrl+K etc.) keep working everywhere. Mirror the same guard in `WorkspaceHost.tsx`'s handler if it has its own chain.
2. **Capture-time validation in `ShortcutInput`:** on capture, normalize via the existing `chordFor`/`matchesShortcut` representation, then reject (do NOT save; show inline error text under the input for 4s, 11px `--danger`):
   - `Backspace`, `Delete`, `Tab`, `Enter`, `Escape`, `Space` alone → `That key can't be a shortcut.`
   - Modifier-only (Ctrl/Alt/Shift/Meta with no key) → ignored, stay listening.
   - Unmodified printable characters (single letter/digit/punctuation) → `Add a modifier: shortcuts must use Ctrl, Alt or Shift.`
   - Only chords of {modifiers ≥1} + key, or F1–F12 alone, or `Escape` (permitted only for `stop`, its default) save.
3. **Conflict resolution:** when a captured chord equals another *preference-owned* binding's chord, do not save silently. Show an inline confirmation bar under the row (existing Settings notice styling, `--border` border, `--surface` bg, 11px): `Already used by <other label>.` + two buttons — `Replace` (saves new chord here; the other action keeps its chord but shows the PR #1437 "Also used by" note until changed — i.e. duplicates ARE allowed but only after explicit confirmation) and `Keep both` (saves and relies on the existing note) — simpler: save on `Use anyway`, cancel on `Cancel`. Take the simpler form: buttons `Use anyway` (saves) and `Cancel` (discards, input exits capture).
4. **Reset + unbind affordances per row:** when `value !== default`, render a small tertiary button `Reset` (26px height, 11px `--muted` label → `--text` hover, `aria-label={`Reset ${label} to ${defaultChord}`}`) that writes the default back instantly (no confirm) and shows the saved check used elsewhere in Settings. No unbind action (out of scope: every binding must keep a chord).
5. **Persistence:** unchanged `setPreference('keybindings.<id>', chord)` path; errors surface via the existing settings-save error toast.

### EXECUTION_DAG
- T01 Editable-target guard in `App.tsx` (+`WorkspaceHost.tsx` if applicable) with vitest coverage in `tests/shell-shortcut-roundtrip.test.ts` (bare `k` inside a textarea does not fire; Ctrl+K does). Deps: none; independent of T02/T03. Owner: single implementer. Handoff: →T02. Done: bare-key bindings never fire from editable targets.
- T02 `ShortcutInput` validation per DESIGN 2 + inline error styles. Deps: none; Settings-only, no overlap with T01. Owner: single implementer. Handoff: →T03. Done: every rejected chord class shows its specified error and saves nothing.
- T03 Conflict confirm bar per DESIGN 3 + `Reset` button per DESIGN 4; verify on :4317 Settings. Deps: T02 (same component, shares row markup). Owner: single implementer. Handoff: →VALIDATION/REVIEW release. Done: conflict requires explicit choice; non-default rows show Reset that restores the default.

### VALIDATION
- Fixture on :4317: rebind Search→`k` → rejected with modifier message; Search→Ctrl+B → confirm bar, `Cancel` discards, `Use anyway` saves and shows "Also used by". After any non-default value, `Reset` restores Ctrl+K.
- Bare `k` binding (seeded via preferences) inside the composer does not steal focus or swallow the keystroke; outside editable targets it still focuses search.
- `pnpm typecheck`, `pnpm lint`, `pnpm test:ui-guard`; extend `tests/keyboard-bindings.test.ts` / `shell-shortcut-roundtrip.test.ts` (vitest) for the guard matrix.

### STATE
Researched + designed; nothing implemented. Next: implementer claims the issue, executes T01–T03.

### REFERENCES
- Repro in QA pass 10 (:4317); `ShortcutInput` `apps/web/src/Settings.tsx` ~:89; global keydown `apps/web/src/App.tsx` ~:787-796; `matchesShortcut` `packages/ui-shell/shell-layout.ts:23`; conflict note landed in PR #1437.

<!-- gen-v1-audit-plan-revision:2026-11-23:1704 -->

## November audit plan revision
**Revision:** `audit-2026-11-23-r1`. **Repository baseline:** `main@a64e9e2d03ce09c843bff0480d81311f2012c812` (GitHub read during triage). **Canonical issue:** #1704.

### Objective and requirements
**Reproduction and multi-window parity for rebinding.** 07 §5.2. Existing scope is bare keys and conflict handling; #1912 owns the separate browser/OS-reserved chord cases.
Keep the issue's existing scope, requirements and assigned implementation work. Refresh related PRs at the beginning of the reproduction.

### Reproduction gate
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

### Execution and validation
- **RED — Reproduce with ordinary shortcut capture.** Try a printable key in the binding UI, then type in the composer and settings input. Record the dispatch and saved state. Compare an existing binding collision in two fixture windows before editing.
- **GREEN — Verify keyboard acceptance and migration.** Test editable and composition contexts, duplicate assignment precedence, reset and legacy malformed records. Check browser and desktop fixture parity. Keep OS-reserved chords in #1912.

### State and handoff
New audit checks are planned. This revision records source and issue triage only. The implementing agent records independent RED, the exact accepted fix or no-repro disposition, GREEN, and any installed or native gate on this issue. Follow the issue's existing dependency and review order.

### References
Audit trackers #1848 and #1946. Follow-up coordination #1860 and #1886.
[Prior version of the attached Markdown plan](https://github.com/skytuhua-org/Gen-V1/blob/46ca0752eefcffc927937a51d8e73bc03feaf1b1/docs/agent-plans/ux-shortcut-rebinding-guards.md).

