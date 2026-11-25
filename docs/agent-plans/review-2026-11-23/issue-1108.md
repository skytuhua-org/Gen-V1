**Full current issue mirror:** [issue-1108.md](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1108.md). The publication checkpoint pins the exact commit.

## Current reconciliation, 2026-11-24

Revision: `2026-11-24-audit-r1`. Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1108. Source audit: `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Coordination: #1803, `cleanup-2026-11-23-r2`. State: **OPEN**.

#1113 merged and the approved comparison design is present, but the explicit T02 current-main dark/light capture and light-theme confirmation are not evidenced. Preserve author DONE and frontend review as historical evidence without claiming the unrecorded main check.

T01 merge is complete: #1113 merged at cae3f27c033867d40f1c5b075b1d081dd68218b7. The final author checkpoint and pass-23 frontend review are retained. Remaining T02 is the plan’s explicit current-main dark/light verification and capture receipt; no fresh visual session or capture was run during this repository audit.

This revision corrects progress and evidence status. It preserves the accepted requirements below. Earlier “not started”, “open PR”, owner, and test statements are historical where this reconciliation gives a newer explicit result. Current ownership remains governed by the live append-only journal; this audit does not release another worker’s implementation claim.

### Verification and remaining work

The issue body, complete paged journal and referenced PR states were reconciled. Existing test receipts remain bound to their stated branch/platform. The source inspections explicitly named above were executed in this audit; no local application tests, native installed acceptance or visual capture are newly claimed. Required tests in the retained plan remain planned until a cited result discharges them. Resume the remaining gate named above through the existing candidate PR and owner, preserving its task IDs and review requirements.

### Evidence

- https://github.com/skytuhua-org/Gen-V1/issues/1108#issuecomment-7061810390
- https://github.com/skytuhua-org/Gen-V1/issues/1108#issuecomment-7071485019
- https://github.com/skytuhua-org/Gen-V1/issues/1108#issuecomment-7101118094
- https://github.com/skytuhua-org/Gen-V1/pull/1113

---

## Objective
Owner S reviewed the captured investigation card (Stack: TraceWaterfall + Comparison table) and dislikes the design. Redesign the generative UI card so it reads as one compact, coherent artifact.

## Scope
- apps/web/src composition surface: Stack artifact container, TraceWaterfall, Comparison (everyday-comparison table + option selector header), source disclosures.
- Design-first: 2-3 mockup screenshots approved before implementation.

## Out of scope
- Data schemas, state keys, action semantics.
- Toast/notification stack on the right edge.

## Acceptance criteria
- Approved mockup choice implemented in components + CSS.
- Card reads as a single artifact: clear hierarchy, compact spacing per DESIGN.md, one visible outer container and compact header, no overlapping/absolutely-positioned fragments.
- Dark + light themes verified.

---

## Fix plan (rev 1)

### META
- Feature: investigation card Comparison redesign (option cards + diff grid)
- Repo: skytuhua-org/Gen-V1 · Plan rev: 1 (2026-11-20)
- Baseline: `main` @ `7ef0710c90a479233f8dd9fe484a296f8c3c86d3`
- Issue: #1108 · Implemented by `devin-a-cloud-7ff3a7` on `devin/1795160811-comparison-option-cards@e77335a` (approved variant A; claim RELEASED) — PR #1113 open, mergeable, CI pending. Current owner: `devin-a-cloud-9c41e2` (review/planning claim of record). Independent QA by `devin-a-cloud-8b2b16`: all checks PASS on fixture host.
- Source provenance: review by devin-a-cloud-9c41e2.

### OBJECTIVE
The redesigned Comparison already exists and passed QA: radiogroup of `.everyday-option-card` (role=radio, roving tabindex) above a slim `.everyday-diff` grid (role=table), `.everyday-comparison` top margin separating it from the preceding Source toggle, hook-order fix. Remaining scope is PR #1113's merge gates and post-merge verification on main.

### REQUIREMENTS
- Implemented design (already shipped in PR #1113): option cards as radio inputs in a radiogroup; diff grid of subgrid rows, selected column tinted `--accent-soft`; heading clears the Source disclosure via `margin-top` on `.everyday-comparison`; keyboard ArrowLeft/Right/Home/End; state in shared store (`selectedId`, `differencesOnly`); footer action and source disclosure unchanged.
- Remaining: CI green, independent review, merge, verify on main in dark + light.

### REPO_MAP (verified)
- `apps/web/src/EverydayData.tsx`, `apps/web/src/everyday-data.css` — Comparison render + styles.
- `tests/e2e/everyday-ui.spec.ts`, `tests/e2e/task-design.spec.ts`, `tests/e2e/wo8.spec.ts` — updated selectors (radio/`aria-checked`).
- `scripts/capture-ui/screen-map.ts`, `scripts/record-task-design.ts` — capture recipe fix (`.error-text` wait, new classes).
- PR: https://github.com/skytuhua-org/Gen-V1/pull/1113 (head `e77335af738c387b9d488f36b6ac4a4c4d4b8920`, open, mergeable).

### DESIGN
Already implemented — no further design decisions. Acceptance restated: single outer artifact container, compact header, option cards above diff grid, no absolute/floating fragments; dark + light verified (QA covered 1440/768/375 default/narrow/focus/hover/empty/error/loading in dark; light theme still to be confirmed on merged main or via capture suite).

### EXECUTION_DAG
- T01 — Merge-gate PR #1113: all required CI checks pass, review recorded, merge to main. Deps: none.
- T02 — Post-merge verify on current `main`: run `pnpm typecheck`, `pnpm lint`, `pnpm exec playwright test --config tests/e2e/everyday.playwright.config.ts`, and `pnpm capture:ui --screens task-everyday`; view the catalog scene in dark and light themes to confirm the single-artifact composition and no regression vs. PR screenshots. Deps: T01.
- T03 — Completion checkpoint on #1108 + close when authorized. Deps: T02.

### VALIDATION
- Executed (author): typecheck/lint PASS; vitest task-surfaces 13/13; Playwright everyday suite 11/11; capture at 1440/1024/768/375. QA (independent): radiogroup semantics, diff grid, mouse/keyboard, differences-only, source toggle, spacing, narrow widths — all PASS.
- Planned: PR CI; post-merge re-runs per T02 incl. light-theme screenshot.
- Acceptance: CI green; merged; main verification shows the card as one artifact in both themes.

### STATE
- Decided: variant A approved; implemented + QA'd; PR open.
- Verified: everything except CI and on-main/light-theme confirmation.
- Risks: none known.
- Next step: watch #1113 CI; merge when green and reviewed; run T02.

### REFERENCES
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1108 · PR: https://github.com/skytuhua-org/Gen-V1/pull/1113
- Worker checkpoint 002 + QA checkpoint 001 on the issue (full test matrix and evidence).
