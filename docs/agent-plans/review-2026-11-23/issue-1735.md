[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1735.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1735](https://github.com/skytuhua-org/Gen-V1/issues/1735). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

First-paint artifact repair is open in [#1794](https://github.com/skytuhua-org/Gen-V1/pull/1794). Review still records duplicate CSS and a 150ms-delay concern; preserve restoration and rendering acceptance rather than treating review as completion.

### Reviewed implementation references

- [PR #1794](https://github.com/skytuhua-org/Gen-V1/pull/1794): open; head `3d62180315b1ec9dcd4245f1a2025718e88a52b8`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7091759479](https://github.com/skytuhua-org/Gen-V1/issues/1735#issuecomment-7091759479). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

# Plan: Artifact content renders blank on first paint until the conversation scrolls

## META
- Feature: Artifact panel first-paint reliability
- Repo: skytuhua-org/Gen-V1, plan revision rev1, 2026-11-22
- Baseline: main @ 97efd9ca
- Issue: this issue. Related surface work: #1617 (failed preview frame)
- Status: planned, not implemented
- Source: fixture-app QA pass 14 (artifact panels) at 127.0.0.1:4317, scenario `signing`

## OBJECTIVE
When an artifact section first mounts in the conversation, its `.artifact-body` paints as an empty block. The content only appears after the user scrolls the conversation. Every artifact must show either its content or a visible "Restoring" indicator on first paint, with zero interaction.

Success metric: on a cold open of a thread containing an artifact, the artifact region shows non-empty pixels (restoring indicator or content) within one frame of the header painting, verified in a Playwright test with no scroll.

## REQUIREMENTS
- In scope: `Artifact.tsx` mount/ready gating and `.artifact-restoring` styling, both `card` and `canvas` frames, `compact` and `standard` widths, inline / expanded / in-workspace placements.
- Out of scope: widget HTML internals, the `Widget` sandbox, DocumentPreview.
- The artifact header (title, save-state, tools) must never render enabled controls over a body that is still blank — `ready` gating of controls is kept.
- No layout shift: the blank-to-content swap must not move the transcript below by more than 0px after first paint.
- Motion: content entrance uses the existing `translateY(4px) → 0`, opacity `0.5 → 1`, 180ms `var(--ui-ease-enter)` animation; under `prefers-reduced-motion` render with no transform and no opacity animation.
- a11y: `aria-busy` stays `true` while pending; the restoring indicator exposes `role="status"` text `Restoring {artifact title}…`; `aria-hidden`/`inert` must never leave an empty region reachable while invisible.
- States: restoring (pending), content ready, restoring after revision change, archive, detach — each defined below.

## REPO_MAP
- `apps/web/src/Artifact.tsx` line ~159: `.artifact-content` is rendered with `inert={!ready}` and `aria-hidden={!ready}`; `{!ready && <div className="artifact-restoring"><PendingStatus pending label={`Restoring ${artifact.title}…`} /></div>}`.
- `apps/web/src/Artifact.tsx` line ~148: `data-artifact-measuring={!restored}` and `data-artifact-pending={!ready}` already expose the gating phases.
- `apps/web/src/styles.css` line ~183: `.artifact-body { padding:16px; }` — no minimum height, so while the content is `inert`/hidden the body height collapses or shows an unstyled gap.
- `.artifact-restoring` has no dedicated rule in `styles.css` (grep: zero matches) — `PendingStatus` renders with no sizing, so the blank window is unstyled.
- `apps/web/src/task-motion.css`: `animateTask` tokens `--ui-motion-insert`, `--ui-ease-enter` used at Artifact.tsx:92-94.
- Root cause hypothesis (verify in T01): the lazy-render path marks the content subtree offscreen until a scroll/intersection update; the `Restoring` indicator either does not mount during `data-artifact-measuring` or renders without height. Treat as discovery, not fact.

## DESIGN
- Keep the `ready` flag and all `inert`/`aria-hidden` gating.
- Guarantee a visible pending affordance for the whole `!ready` window: render `.artifact-restoring` as an absolutely-free block inside `.artifact-body` (it already mounts there) and give it an explicit minimum height so the panel can never show an empty region.
- After `ready` flips true, play the existing 180ms translateY(4px) entrance on `.artifact-content` once per mount — reuse `entranceBody`/`animateTask` already wired at Artifact.tsx:90-95.
- If T01 finds an IntersectionObserver/viewport gate that defers `ready` until scroll, remove the viewport condition for the pending indicator and content readiness: `ready` must be driven by data availability, never by scroll position.
- Error/cancel/retry: none; purely presentational. The `artifact-restoring` indicator is replaced atomically by content — no intermediate half-rendered states.

### Visual spec (exact)
- `.artifact-restoring` — new rule in `styles.css` after line 205:
  - `min-height:160px` (compact frame) / `min-height:200px` inside `.artifact-frame-canvas`
  - `display:flex; align-items:center; justify-content:center;`
  - label: existing `PendingStatus` spinner + text `Restoring {title}…`, `font-size:12px`, `color:var(--muted)`, gap `8px` between spinner and text.
- `.artifact-body` while `[data-artifact-pending]`: keeps `padding:16px`; background `var(--surface)` (card) / transparent (canvas). No skeleton shimmer — spinner only.
- Content entrance (unchanged values, already in code): `opacity 0.5→1`, `translateY(4px)→0`, `180ms`, `var(--ui-ease-enter)`. Reduced motion: `opacity` snap, no transform.

## EXECUTION_DAG
- T01 (owner: implementer): Reproduce in fixture: `pnpm build:widgets && pnpm exec vite build`, launch review host on :4317, open `signing` scenario cold; confirm which of `data-artifact-measuring` / `data-artifact-pending` stays set while the body is blank and whether an IntersectionObserver gates it. Record findings on the issue. Done-when: root cause named with file/line.
- T02 (owner: implementer, dep T01): Fix gating per DESIGN so pending indicator renders for the whole `!ready` window and readiness is scroll-independent. Files: `apps/web/src/Artifact.tsx`, `apps/web/src/styles.css`.
- T03 (owner: implementer, dep T02): Tests — vitest unit: `!ready` renders `Restoring …` with `role="status"`; Playwright: cold-open `signing` scenario, assert non-empty pixels inside `.artifact` within 500ms of header paint without scrolling; assert reduced-motion path has no transform. Done-when: both pass.
- T04 (owner: implementer, dep T03): Visual check at 700px viewport width (compact) and expanded modal; RELEASE checkpoint.

## VALIDATION
- `pnpm exec vitest run` (new unit test file beside Artifact or existing suite).
- `pnpm exec playwright test` artifact scenario, cold load, viewport 1440×900 and 700×900, `reducedMotion:'reduce'` project — all green.
- Manual: cold-open signing thread, confirm no blank region; expanded modal and workspace dock show same behavior.
- Acceptance matrix: (a) first paint shows indicator or content — browser test; (b) no scroll needed — browser test; (c) zero transcript layout shift after paint — measured via `scrollTop`/`getBoundingClientRect` before/after in test; (d) reduced motion — test project.

## Historical STATE
- Decided: spinner indicator + fixed min-height, scroll-independent readiness.
- Pending: root-cause line (T01), implementation, tests.
- Next step: T01 reproduction.
- Risk: if `ready` is intentionally deferred for lazy mounting, removal could regress performance on long transcripts — mitigate by keeping `data-artifact-measuring` behavior and only fixing the visible affordance if so.

## REFERENCES
- Artifact.tsx (read 2026-11-22): lines 78-95 placement animation, 148-159 body gating.
- styles.css lines 168-205 artifact rules; no `.artifact-restoring` rule exists.
- QA evidence: signing scenario artifact region rendered solid empty until scroll, then populated.
