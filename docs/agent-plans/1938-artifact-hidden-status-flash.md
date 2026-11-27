# META

- Feature: Artifact-level flash confirmation for Status updates rendered inside hidden tab panels.
- Repo: `skytuhua-org/Gen-V1` (`apps/web`).
- Plan revision: 1, dated 2026-11-23.
- Baseline branch: `main` @ `4445d3ae7963`.
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1938 (canonical issue body = this document).
- Current implementation status: not started; verified against built fixture on `main@4445d3ae7963`.
- Source provenance: deep interactive QA pass 28 on the review fixture at `http://127.0.0.1:4317`.

# OBJECTIVE

When a `Status` node inside an artifact updates while the artifact tab panel that contains it is hidden, the user receives no visible or announced feedback — the confirmation exists only as a `display:none` subtree, so `role="status"` never fires and nothing appears on screen. In the fixture, submitting "Save choice" in the Controls tab produces "Choice saved locally" only inside the hidden Content tab panel.

Success: a status update rendered inside a hidden outer `.task-tab-panel` produces a transient confirmation chip in the artifact header that is both visible and announced by screen readers, regardless of which view tab is active.

# REQUIREMENTS

- In scope: artifacts rendered by `Artifact.tsx` that contain `Status` nodes inside `.task-tab-panel` containers driven by the `Views` tablist; transient flash chip in `.artifact-header`; screen-reader announcement; motion + reduced-motion treatment.
- Out of scope: changing where the plan places `Status` nodes; toasts/global notification system; persistent history of flashes; widget-kind artifacts (they have no `Status` nodes of this kind — the chip logic still applies if a Status ever renders there).
- User flow: user clicks a form action (e.g. "Save choice") in one view tab; the bound `Status` node updates in a sibling hidden panel; within the same paint the artifact header shows a chip "<icon> <status label>" for 4 s, then it fades and is removed; the bound Status node still updates in place when the user opens that tab.
- Multiple flashes: each new hidden-panel status update replaces the chip's content and restarts the 4 s timer (latest wins, never stacked).
- Same-tab updates: when the owning panel is visible, no chip appears (the Status itself is the feedback).
- Tab switch: switching to the tab that owns the flashing status clears the chip immediately.
- Accessibility: the chip element carries `role="status"` (implicit `aria-live="polite"`, `aria-atomic="true"`); no focus moves; no keyboard change; the chip is non-interactive (no button, not in the tab order).
- Compatibility: no API, fixture, or backend change; pure `apps/web` presentation change.
- Error/recovery: no new error paths; an absent label falls back to the status's own text content minus its `<small>` detail.

# REPO_MAP

- `apps/web/src/Artifact.tsx:133` — artifact `<section>` and `.artifact-header`/`.artifact-tools` markup; `section` ref (`section.current`) is the natural listener root and chip mount point. Insert the chip immediately before the `.save-state` (structured) / `.artifact-state` (widget) element inside `.artifact-tools`.
- `apps/web/src/task-interface.tsx:129` — `Status` component renders `.task-status-block > .task-status-stack > .task-status.status-<kind>[role="status"]`; the rendered status view object is `view` with `view.status` and `view.label`/content.
- `apps/web/src/task-motion.css:53-61` — `.task-status-stack`, `.task-status-outgoing`, `task-status-in` keyframes, and the `prefers-reduced-motion` block the chip must join.
- `apps/web/src/task-interface.css:27-37` — `.task-status`, `.status-success` (`color:var(--success)`), `.status-error` (`color:var(--danger)`) color hooks to mirror for the chip's kind classes.
- `apps/web/src/registry.tsx:177` — Views tablist (`aria-label="Views"`, roving tabindex); the tab-panels it toggles carry the `hidden` attribute — the visibility source of truth to test (`panel.hidden`).
- `scripts/review-host.ts:186` — fixture emits `source(input,'operation',{status:'success',label:'Choice saved locally'})`, routed to the Status node inside the hidden Content panel — the exact repro.
- Verified owners: `Artifact.tsx` and `task-interface.tsx` are the only files needing edits; `task-interface.css` + `task-motion.css` for styles.

# DESIGN

Event-driven flash channel, no shared store:

1. In `task-interface.tsx` `Status` component: after the rendered status `view` changes (inside the existing update effect that swaps `.task-status` nodes), read `const panel = blockRef.current?.closest('.task-tab-panel')`. If `panel?.hidden` is true, dispatch `blockRef.current.dispatchEvent(new CustomEvent('artifact:status-flash', { bubbles: true, composed: true, detail: { status: view.status, label: view.label ?? '' } }))`. No event when `panel` is null, not hidden, or the status did not change.
2. In `Artifact.tsx`: `useEffect` registers `section.current?.addEventListener('artifact:status-flash', onFlash)`; `onFlash` stores `{ status, label, seq }` in state and resets a 4000 ms timer that clears the state. Cleanup clears listener + timer. Also clear the flash state when a `click`/`keydown` on the artifact's `[aria-label="Views"]` activates the tab that now un-hides the owning panel — simplest deterministic rule: clear on any Views tab activation (`role="tab"` click or Arrow/Home/End activation in that tablist), since a tab switch is the only way the hidden panel becomes visible.
3. Render in `.artifact-tools` before the save-state element: `{flash && <span className={`artifact-flash status-${flash.status}`} role="status" aria-atomic="true">{icon(flash.status)}<span>{flash.label}</span></span>}`.
4. Icons, 11 px: `status==='success'` → `Check`, `'error'`/`'failure'` → `TriangleAlert`, `'pending'`/`'running'`/`'working'` → `LoaderCircle` (with `spinning` class), everything else → `Info` (import from lucide-react alongside existing icons).
5. CSS (`task-interface.css`): `.artifact-flash { display:inline-flex; align-items:center; gap:5px; height:23px; padding:0 8px; border-radius:7px; font-size:10px; font-weight:500; white-space:nowrap; overflow:hidden; max-width:180px; }` `.artifact-flash>span { overflow:hidden; text-overflow:ellipsis; }` `.artifact-flash.status-success { color:var(--success-fg); background:var(--success-bg); }` `.artifact-flash.status-error { color:var(--danger-fg); background:var(--danger-bg); }` `.artifact-flash:not(.status-success):not(.status-error) { color:var(--muted); background:var(--hover); }`.
6. Motion (`task-motion.css`): `.artifact-flash { animation:task-status-in var(--ui-motion-status) var(--ui-ease-enter) both; }` for entry; on removal animate out by keeping the node mounted for the `task-status-in` reverse — to keep this simple and deterministic: on timer expiry remove the node directly (no exit animation), and add `.artifact-flash` to the existing `prefers-reduced-motion` list so its entry is 1 ms under reduced motion. Label copy inside the chip truncates with ellipsis at 180 px rather than animating width.
7. The chip is presentational text inside an existing landmark region; no new keyboard path, no focusable element, no aria-controls.

# EXECUTION_DAG

- T01 — Emit `artifact:status-flash` from `Status` in `apps/web/src/task-interface.tsx` when its closest outer `.task-tab-panel` is `hidden`. Owner: web-ui. Deps: none. Done-when: saving the fixture form (Controls tab) produces a `CustomEvent` observable on `.artifact` with `detail.label === 'Choice saved locally'`; no event when the Content tab is active. Tests: vitest render test of `Status` inside a hidden panel asserting the event once.
- T02 — Listen in `Artifact.tsx`, hold `{status,label,seq}` + 4 s clear timer, clear on Views tab activation, render the `.artifact-flash` chip before `.save-state`. Owner: web-ui. Deps: T01. Handoff: chip state name `actionFlash`, event detail contract from T01. Done-when: header chip appears for 4 s with icon + label; replaced on repeat saves; disappears early when the Content tab is activated.
- T03 — Styles in `task-interface.css` + `task-motion.css` exactly as specced in DESIGN 5-6. Owner: web-ui. Deps: T02. Done-when: computed style of the chip matches tokens (23 px height, 10 px/500, token colors per kind) and reduced-motion keeps it instant.
- T04 — Tests: vitest unit for T01 emission + T02 chip lifecycle (fake timers for the 4 s expiry); Playwright repro test driving the fixture flow: launch review-host per VALIDATION, send a message in the catalog thread, submit "Save choice" in Controls, assert `.artifact-flash` visible with "Choice saved locally", assert it clears on Content tab activation, assert no chip when the status's own panel is visible. Owner: web-ui. Deps: T01–T03. Done-when: both suites pass.

# VALIDATION

- Setup: `pnpm install && pnpm build` in repo root, then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` and open `http://127.0.0.1:4317`.
- Manual repro: open "Explore the component catalog", send "show me everything", Controls tab → "Save choice" → expect chip "Choice saved locally" in the artifact header for 4 s; open Content tab during the window → chip clears early; repeat save → chip re-appears.
- Unit: `pnpm vitest run` for the new Status/Artifact specs (added under the existing web test setup).
- Browser: Playwright script asserting the three states above plus `role="status"` presence and computed color tokens.
- Acceptance matrix: chip visible on hidden-panel update (PASS required); chip clears at 4 s (PASS); chip clears on owning-tab activation (PASS); no chip when owning panel visible (PASS); SR announcement via `role="status"` (PASS, verified by axe/voiceover spot check); reduced-motion entry ≤1 ms (PASS); no new console errors (PASS).
- Release gate: all matrix rows PASS in one run on `main` with the patch.

# STATE

- Researched/verified on fixture: hidden-panel status produces zero visible/announced feedback; `.save-state` chip is static persisted-state, unrelated to action feedback; `role="status"` inside `display:none` does not announce.
- Implemented: nothing.
- Pending: T01–T04.
- Risks: none identified beyond the straightforward DOM/event wiring; custom event is additive and does not alter the Status component's own render.
- Next step: T01 in `task-interface.tsx`.

# REFERENCES

- Fixture repro thread: "Explore the component catalog" in the review fixture (`scripts/review-host.ts`, `scripts/review-fixtures.ts`).
- Source anchors: `apps/web/src/Artifact.tsx:133`, `apps/web/src/task-interface.tsx:129`, `apps/web/src/task-interface.css:27-37`, `apps/web/src/task-motion.css:53-61`, `apps/web/src/registry.tsx:177`.
