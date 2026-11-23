## UI: Artifact picker opens an empty popover when the thread has no artifacts

### META
- Repo: skytuhua-org/Gen-V1 — baseline `main` (docs-only plan, rev 1, 2026-11-21)
- Found during interactive QA of the built fixture app on :4317 (workspace panel, `Artifact` tab)
- Status: plan only, not implemented

### OBJECTIVE
The workspace-panel Artifact surface's **"Choose an artifact"** dropdown must never open an empty popover. When the thread/project has no artifacts the control must communicate that directly.

**Observed bug (repro):** Open the Artifact tab in a thread with no artifact grants → the picker row shows a "Choose an artifact" trigger that looks identical to a populated select; opening it renders a popover containing only a duplicate of the trigger/label and zero options — no options list, no empty-state copy. The popover is a blank box.

### REQUIREMENTS
- In scope: artifact picker trigger, popover, empty state in the workspace Artifact surface.
- Out of scope: artifact rendering itself, artifact creation.
- A picker with zero options must either be disabled with an explanatory tooltip or open a popover with a designed empty state — never a blank box.
- Keep S's compact-UI preference: empty state ≤ 96 px tall.

### REPO_MAP (verified; exact files = discovery)
- Artifact surface: `apps/web/src` workspace panel `Artifact` tab (search `"Choose an artifact"`, `"artifact"`).
- Popover/select primitive shared with other pickers (model picker styles live in `apps/web/src/model-picker.css` — reuse its empty-state pattern if one exists).
- Fixture: threads without artifact grants reproduce on :4317.

### DESIGN
**Option A (preferred — disabled trigger):** when `artifacts.length === 0`:
- Trigger stays rendered but `disabled`: 11px `Label/M` text `--muted`, chevron `--subtle`, background `--surface`, border 1px `--border`, 6px radius, height 28px, padding `0 10px`, cursor `default`, `aria-disabled="true"`, `title="No artifacts yet"`.
- Above/below the trigger (existing help-text slot), 11px `--muted`: `Artifacts the agent creates appear here.` (keeps the panel self-explanatory without a click).
**Option B (popover empty state):** if the trigger must stay enabled (e.g. to allow refresh), the popover shows: centered 16px file icon `--subtle`; 12px `--text` `No artifacts yet`; 11px `--muted` `Artifacts the agent creates appear here.`; padding `16px`; min-width = trigger width; no options list.
- With ≥1 artifact: unchanged current behavior.
- Motion: popover uses existing `--ui-motion-panel-enter` (120 ms, `--ui-ease-enter`); disabled state has no popover.

### EXECUTION_DAG
- T01 Find picker component + data source; implement Option A (or B if refresh-in-popover exists). Done: no blank popover anywhere.
- T02 Add empty-state copy + `aria-disabled`/tooltip per spec.
- T03 Test: zero-artifact and 1+ artifact threads on :4317; keyboard + screen-reader labels.

### VALIDATION
- :4317 thread with no artifacts → trigger disabled with `No artifacts yet` tooltip + help line.
- Thread with artifacts (signing scenario `image`/`pdf`/`svg`) → picker lists them as today.
- Dark and light themes; tab order unchanged.

### STATE
Researched + designed; nothing implemented. Next: implementer claims issue, implements T01–T03.

### REFERENCES
- Repro in QA pass 6; `scripts/review-host.ts` artifact-grant scenarios.
