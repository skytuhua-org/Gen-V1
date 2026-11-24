## UI: Failed artifact preview leaves a large empty frame instead of a compact error state

### META
- Repo: skytuhua-org/Gen-V1 — baseline `main` (docs-only plan, rev 1, 2026-11-21)
- Found during interactive QA of the built fixture app on :4317 (workspace `Artifact` tab, `pdf` artifact whose preview cannot load)
- Status: plan only, not implemented

### OBJECTIVE
When an artifact preview fails or is unavailable, the surface must collapse to a compact, actionable error row — not hold a large dead frame with disabled chrome.

**Observed bug (repro):** Artifact `report.pdf` fails preview → the surface renders a ~300px-tall empty preview well containing only centered `Preview unavailable`, with a disabled toolbar/pagination strip above it and a `Retry preview` action that re-renders the identical failed state. Most of the panel is dead space; the pagination that can't page anything stays visible.

### REQUIREMENTS
- In scope: artifact preview failure/empty layout — preview well, toolbar/pagination visibility, retry affordance.
- Out of scope: the preview renderers themselves, error telemetry.
- Failure must not leave a large empty frame; the visible affordances must all be functional (hide or disable-with-reason the ones that aren't).
- Compact per S's preference: failed state ≤ 96px tall; never show disabled pagination over content that cannot page.

### REPO_MAP (verified; exact files = discovery)
- Artifact preview surface: `apps/web/src` workspace Artifact tab (search `"Preview unavailable"`, `"Retry preview"`, pagination component).
- Error/empty patterns elsewhere: `--danger-soft`/`--danger` tokens in `apps/web/src/styles.css`; compact error rows in other surfaces.
- Fixture: `pdf` artifact grant reproduces on :4317.

### DESIGN
1. **Layout on failure:** header row unchanged (artifact name/type chip). The preview well collapses to an error row:
   - Height 64px, full width, background `--danger-soft`, border 1px `--danger` at 20% (or `--border` if no tinted border token), 8px radius, padding `12px 16px`.
   - Left: 14px warning icon `--danger`. Beside it: 12px `--text` `Preview unavailable` + 11px `--muted` second line with the reason when known, else `This file can't be previewed here.`
   - Right-aligned actions, 26px-high tertiary buttons, 11px `Label/M`: `Retry preview` (primary-styled if retries can succeed) and `Open file`/`Download` when available.
2. **Toolbar/pagination:** hidden entirely when there is no renderable document (not merely disabled). Shown only when `pages ≥ 1`.
3. **Retry behavior:** `Retry preview` shows an inline spinner inside the button (label → `Retrying…`, `aria-busy`), and on failure keeps the error row and shows toast `Preview still unavailable` — never re-renders the giant empty well.
4. **States:** loading skeleton (existing) → success (preview + pagination) / failure (error row per spec). Exit/enter via `--ui-motion-panel-enter` 120ms `--ui-ease-enter`; row height animates with `--ui-motion-insert`.

### EXECUTION_DAG
- T01 Locate preview failure branch + pagination gating; hide pagination when `pages===0`. Done: no disabled chrome on failure.
- T02 Implement compact error row + retry/toast per spec. Done: failed preview is ≤96px and actionable.
- T03 Test: :4317 pdf artifact failure state in dark + light; successful pdf still previews.

### VALIDATION
- :4317 `pdf` artifact → compact error row, working `Retry preview`, no empty frame, no pagination.
- Successful artifacts unchanged. Light + dark themes.

### STATE
Researched + designed; nothing implemented. Next: implementer claims issue, implements T01–T03.

### REFERENCES
- Repro in QA pass 6; `scripts/review-host.ts` artifact grants.
