[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1725.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1725](https://github.com/skytuhua-org/Gen-V1/issues/1725). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Welcome entrance motion exists in open [#1762](https://github.com/skytuhua-org/Gen-V1/pull/1762). Reduced motion and expected entrance behavior remain pending main integration.

### Reviewed implementation references

- [PR #1762](https://github.com/skytuhua-org/Gen-V1/pull/1762): open; head `ca749078497a19aa41c3f5cb6a001616286990bf`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7088448501](https://github.com/skytuhua-org/Gen-V1/issues/1725#issuecomment-7088448501). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

# UI: Welcome empty state appears with no entrance motion

## META
- Feature: Fade+rise entrance for `.empty-state`
- Repo: skytuhua-org/Gen-V1 · Plan rev 1, 2026-11-22
- Baseline: main @ bffae7ff03a16dcc5b9c10abd25b956564059ec2
- Provenance: QA pass 12 + `transient-reveal` skill conventions (ui-item-in)
- Status: planning complete, implementation NOT started

## OBJECTIVE
The whole app animates in pieces (`.thread-item`, `[role=tabpanel]`, messages via `ui-item-in`) but the welcome empty state pops in statically, which reads flat next to the rest. Success: `.empty-state` plays the same subtle fade+rise entrance once on mount, and is still under `prefers-reduced-motion`.

## REQUIREMENTS
- On mount (including switching to a new empty conversation), `.empty-state` animates `opacity 0→1` + `translateY(8px)→0` over `var(--ui-motion-insert)` `var(--ui-ease-enter)` — the exact `ui-item-in` keyframes already used by thread items; reuse the keyframes, don't duplicate them.
- The three children keep DOM order; the single block animates (no stagger — compact UI preference).
- `data-motion="reduced"`/`off` and `prefers-reduced-motion`: no animation (the global reduced-motion rule already kills animations; verify it covers this class — if not, add `.empty-state` to the reduced-motion override list).
- Replays when a different conversation id mounts the empty state (keyed by thread), not on every re-render.
- Layout/paint: animation must not change layout or leave `opacity` stuck — `animation-fill-mode:both` or the existing `ui-item-in` convention.
- Copy, sizes, colors unchanged: h1 30px desktop/24px ≤700px, p 14px/13px `var(--muted)` line-height 1.8, symbol 34px, `.setup-inline` 12px pill.
- Out of scope: changing the copy or adding illustrations.

## REPO_MAP
- `apps/web/src/styles.css` — `@keyframes ui-item-in` + its consumers (`.thread-item`, `[role=tabpanel]`, `.message[data-arrival]` ~L355-358); `.empty-state` block ~L100.
- `apps/web/src/App.tsx` ~L1176 — the `{loaded && !allMessages.length && !artifacts.length && <div className="empty-state">…}` gate.
- Verified: no animation class on `.empty-state` today.

## DESIGN SPEC (exact values)
- Add `.empty-state { animation: ui-item-in var(--ui-motion-insert) var(--ui-ease-enter); animation-fill-mode: both; }` — i.e. `:where(.empty-state)` joined to the existing `:where(.thread-item)` rule at styles.css ~L355 is the minimal diff; choose that join over a new rule.
- Mount-scoped replay: ensure the `.empty-state` div carries `key={thread.id}` (or the view's existing reset key) so navigation re-runs the animation once.
- Reduced motion: confirm `data-motion=reduced|off` strips animations globally; if the override enumerates classes, append `.empty-state`.

## EXECUTION_DAG
- T01 (owner A): join `.empty-state` to the `ui-item-in` rule + verify mount keying + reduced-motion coverage. Done-when: animation plays once per mount.
- T02 (owner A): Playwright/vitest asserting computed `animation-name` is `ui-item-in` under normal motion and `none` under `data-motion="reduced"`. Done-when: passes.

## VALIDATION
- vitest/Playwright PASS; `pnpm lint` PASS.
- Manual: load /new (animation plays once), switch to a thread and back (plays again once), toggle reduced motion (instant), dark + light themes, 420px width.
- Acceptance: requirements ↔ T01/T02.

## Historical STATE
- Verified: static today. Risk: near-zero — same keyframes already in production.
- Next: T01.

## REFERENCES
- Motion token usage: styles.css L355-358.
