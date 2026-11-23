## UI: Context inspector "Compact now" is enabled with nothing to compact and gives no feedback

### META
- Repo: skytuhua-org/Gen-V1 — baseline `main` (docs-only plan, rev 1, 2026-11-21)
- Found during interactive QA of the built fixture app on :4317 (composer context-inspector popover, `context` scenario)
- Status: plan only, not implemented

### OBJECTIVE
The context-usage inspector's **"Compact now"** control must only be actionable when compaction is actually possible, and every click must produce visible feedback. A dead button erodes trust in the whole inspector.

**Observed bug (repro):** Open the context-inspector popover on a thread reporting `Not reported` usage → the `Compact now` button renders enabled; clicking it produces nothing — no spinner, no toast, no state change, popover stays open with identical content. The popover also stacks two lines (`Context` heading + `Not reported`) that read awkwardly, but the primary defect is the dead control.

### REQUIREMENTS
- In scope: `Compact now` enablement + feedback; inspector empty/`Not reported` copy.
- Out of scope: the compaction engine, other inspector sections.
- A control that can do nothing must be visibly disabled (with a reason) or produce an explicit result on click — never silent.
- Compact popover; no new colors or type styles.

### REPO_MAP (verified; exact files = discovery)
- Context inspector popover: `apps/web/src` composer context button (search `"Compact now"`, `"Inspect context usage"`, `"Not reported"`).
- Disabled-button + tooltip pattern shared with `Saved drafts` disabled control.
- Fixture: `context` scenario reproduces on :4317.

### DESIGN
1. **Enablement:** `Compact now` is enabled iff the client holds context data AND compaction is available for the session. Otherwise `disabled`:
   - Style: existing disabled tertiary — 11px `Label/M` `--muted` on `--surface`, border `--border`, 6px radius, height 26px, `cursor: default`, `aria-disabled="true"`, `title="Nothing to compact"`.
   - When usage is `Not reported`, render the subtitle `Context use isn't reported for this session yet.` (11px `--muted`) and keep the button disabled.
2. **Enabled click flow:** label → `Compacting…` + 12px spinner, `aria-busy="true"`, popover stays open; on success the usage numbers update in place and a toast `Context compacted` (5 s) fires; on failure button restores and toast `Couldn't compact — try again` (`--danger`/`--danger-soft`) fires with the button re-enabled.
3. **Copy fix:** when the only content is `Not reported`, render the single subtitle line instead of duplicated `Context`/`Not reported` lines.

### EXECUTION_DAG
- T01 Gate `Compact now` on data/availability per DESIGN; add disabled tooltip. Done: dead click impossible.
- T02 Wire busy/success/failure feedback per spec.
- T03 Copy fix for `Not reported`; test on :4317 `context` fixture and a reporting thread.

### VALIDATION
- `context` fixture: button disabled, tooltip `Nothing to compact`, subtitle copy per spec.
- Reporting thread: click → busy → toast + updated numbers; forced failure → error toast + re-enabled.
- Dark + light themes; keyboard focus stays on the button.

### STATE
Researched + designed; nothing implemented. Next: implementer claims issue, implements T01–T03.

### REFERENCES
- Repro in QA pass 6; `scripts/review-host.ts` scenario `context`.
