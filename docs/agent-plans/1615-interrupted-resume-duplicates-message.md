## UI: Resume after interruption replays the last assistant message and never clears Interrupted

### META
- Repo: skytuhua-org/Gen-V1 — baseline `main` (docs-only plan, rev 1, 2026-11-21)
- Found during interactive QA of the built fixture app on :4317 (scenario `migration`, thread "Add workspaces")
- Status: plan only, not implemented

### OBJECTIVE
Clicking **Resume** on an interrupted session must restart the run without corrupting the transcript and must return the thread to a live state everywhere the interruption is surfaced.

**Observed bug (repro):** In the `migration` fixture thread, click `Resume ›` under "This session was interrupted." → a second identical assistant message ("The local migration is ready for exact review.") is appended to the transcript, the interrupted banner stays rendered, and the sidebar row keeps the `Interrupted` badge. Result: a visibly duplicated reply and a thread that still reads as broken after the user just fixed it.

### REQUIREMENTS
- In scope: interrupted-session resume flow — transcript append logic, interrupted banner, sidebar status, Resume button state.
- Out of scope: server-side resume semantics, model reconnect flow.
- Resume must never append a message that is already the last message in the transcript (dedupe by message id/seq — a resume must not replay the last completed assistant turn).
- While resuming, the Resume button enters a pending state (see DESIGN); on failure the banner stays and an error toast appears; on success the banner is removed and the sidebar badge updates without a refresh.

### REPO_MAP (verified during QA; mark exact files as discovery)
- Interruption UI: `apps/web/src` — conversation interruption banner + `Resume` button (search `"This session was interrupted"` / `Resume`).
- Transcript/message append path: message list reducer/store used by the chat pane (search where assistant messages append on resume/SSE replay).
- Sidebar status badge: `apps/web/src/sidebar-context.css` consumers, thread row status (`Interrupted` chip).
- Fixture evidence: `scripts/review-host.ts` scenario `migration` reproduces on :4317.

### DESIGN
1. **Dedupe on append:** when the resume stream replays history, the client merges by stable message id (or content+seq for id-less frames); a frame equal to the last rendered message is dropped. Acceptance: transcript length is unchanged after Resume in the migration fixture.
2. **State transitions:**
   - `interrupted` → click Resume → `resuming`: button label becomes `Resuming…` with a 12px spinner, `disabled`, `aria-busy="true"`; banner stays.
   - `resuming` → `live`: banner unmounts with `--ui-motion-remove` exit (150 ms, `--ui-ease-enter`), sidebar badge flips to the live status in the same tick.
   - `resuming` → `interrupted` (failure): button restores `Resume ›`, banner stays, error toast `Couldn't resume — try again` with `Retry` action (toast tokens: `--danger` text on `--danger-soft` background, 8px radius, bottom-center, 5 s auto-dismiss).
3. **Spec:** banner = existing interrupted card (unchanged styling); Resume button = existing tertiary button, 11px `Label/M`/`--text`, `›` chevron replaced by spinner only while `resuming`. No new colors or type styles.

### EXECUTION_DAG
- T01 Locate resume click handler + transcript append path; add id/seq dedupe. Done: migration fixture Resume no longer appends a duplicate.
- T02 Add `resuming`/`live`/failure states to banner + button per DESIGN. Done: all four states render per spec.
- T03 Flip sidebar status on resume success without refresh. Done: badge clears.
- T04 Test: unit merge-dedupe test + browser check on :4317 fixture.

### VALIDATION
- Fixture :4317, scenario `migration`: Resume once → no duplicate; banner gone; sidebar shows live status.
- Force resume failure (host down) → toast `Couldn't resume — try again`, banner persists, button re-enabled.
- Both dark and light themes.

### STATE
Researched + designed; nothing implemented. Next: implementer claims issue, implements T01–T04.

### REFERENCES
- Repro recording in QA pass 6 session; fixture `scripts/review-host.ts`.
