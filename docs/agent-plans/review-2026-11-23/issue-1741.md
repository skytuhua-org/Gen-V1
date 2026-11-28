[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1741.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1741](https://github.com/skytuhua-org/Gen-V1/issues/1741). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Tab visibility/keyboard work is retained in open [#1813](https://github.com/skytuhua-org/Gen-V1/pull/1813); [#1826](https://github.com/skytuhua-org/Gen-V1/pull/1826) is a closed duplicate. The fresh audit revision's current-main reproduction and recovery checks remain required.

### Reviewed implementation references

- [PR #1813](https://github.com/skytuhua-org/Gen-V1/pull/1813): open; head `2b75c34840e16424a49393bdbdc0a7386d8881bc`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7120945557](https://github.com/skytuhua-org/Gen-V1/issues/1741#issuecomment-7120945557). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

[Current versioned Markdown plan](https://github.com/skytuhua-org/Gen-V1/blob/dad473f59b4c46dad12cf0357e448e090a403a2b/docs/agent-plans/nov-2026-audit-1741-revision.md) · [Plan publication PR](https://github.com/skytuhua-org/Gen-V1/pull/1952)

# Plan — Workspace tab strip: scroll active tab into view + arrow-key navigation (rev2)

## META
- Feature: Active-tab visibility and APG keyboard navigation for the workspace surface tab strip
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev2, 2026-11-22
- Baseline: `main` @ `97efd9ca`
- Status: planned, not implemented
- Source: frontend QA pass on fixture app (:4317) — opening "Plan" from Add surface while the strip overflows leaves the new tab offscreen; Arrow keys on tabs scroll the strip instead of moving selection

## OBJECTIVE
Two behavior gaps in the same strip (`WorkspacePanel.tsx` header, `role="tablist" "Workspace views"`): (1) a newly opened or programmatically activated tab is not scrolled into view when the strip overflows, so the user sees no response to their action; (2) Left/Right/Home/End do not move between tabs — APG tablist keyboard contract is unmet. Success: activation always reveals the tab, and the full APG key map works.

## REQUIREMENTS
- In scope: `WorkspacePanel.tsx` surface tab strip only.
- Out of scope: inner sub-tabs inside each surface, Add surface menu, close behavior (separate issue/plan `workspace-tab-close`).
- Scroll-into-view:
  - Whenever `workspace.activeTab` changes (user click, `openTab`, `setActiveTab`, deep-link), if the active tab button is not fully visible in the strip, scroll it into view with `scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })` — `behavior: 'instant'` under `prefers-reduced-motion`.
  - Also run once on mount and when the `openTabs` array changes length.
  - Must not scroll the strip when the active tab is already fully visible (no jump).
  - Smooth scroll duration comes from the browser's smooth-scroll behavior; no custom easing/duration.
- Keyboard (APG tabs pattern, activation on selection — automatic activation):
  - `ArrowRight`: move focus+selection to the next tab; wraps from last to first.
  - `ArrowLeft`: previous tab; wraps first to last.
  - `Home`: first tab. `End`: last tab.
  - Roving `tabIndex`: selected tab `tabIndex={0}`, all others `tabIndex={-1}`; `Tab` leaves the strip. Once the companion close-affordance plan (`workspace-tab-close`, #1740) lands, its per-tab close buttons are `tabIndex={-1}` and stay out of the `Tab` order — `Tab` still leaves the strip.
  - The strip container keeps its existing overflow scroll; arrow keys on a focused tab must `preventDefault()` so they never scroll the strip.
  - `Enter`/`Space` on a focused non-selected tab is a no-op beyond native click (automatic activation already selects on arrow move; a focused-but-not-selected state only occurs after pointer click, which selects anyway).
- Screen reader: roles `tablist`/`tab`/`tabpanel` and `aria-selected`/`aria-controls`/`aria-labelledby` already exist and stay unchanged.
- No visual-design changes.

## REPO_MAP
- `apps/web/src/WorkspacePanel.tsx` L61–L79: `tabStrip` ref, overflow `data-overflow-*` markers, `openTabs.map` render of `<button role="tab">` (verified).
- `apps/web/src/App.tsx` L557: `setActiveTab`/`openTab` mutate `layout.openTabs`/`activeTab` (verified).
- Existing overflow-scroll affordance: `data-overflow-start`/`data-overflow-end` on the strip element (verified); styles in `styles.css` (discovery: locate `.workspace-right-header` rules).
- Tests: vitest + Playwright (repo stack; no jsdom/Testing Library). Discovery: `rg -l "WorkspacePanel" apps/web --glob '*.spec.*' --glob '*.test.*'`.

## DESIGN
- `useLayoutEffect` keyed on `workspace.activeTab` and `openTabs.length`: `document.getElementById('workspace-tab-' + activeTab)?.scrollIntoView({ block:'nearest', inline:'nearest', behavior: reducedMotion ? 'instant' : 'smooth' })`; guard by checking `getBoundingClientRect` overlap first (skip when fully visible) to avoid a redundant smooth scroll.
- `onKeyDown` on the strip container (delegation): read `openTabs` order, compute `next = (index + dir + len) % len`, call `workspace.setActiveTab(next)` then focus `#workspace-tab-${id}`.
- Roving tabindex: `tabIndex={workspace.activeTab === id ? 0 : -1}` on each tab button.
- Reduced motion: `matchMedia('(prefers-reduced-motion: reduce)').matches` read at call time (no listener needed — value read per activation).

## EXECUTION_DAG
- T01 (owner: implementer): scroll-into-view effect + visibility guard. Done-when: opening Plan with 6+ tabs open in a 280px-wide panel scrolls the strip so Plan is fully visible; no scroll when already visible; instant under reduced motion.
- T02 (owner: implementer): ArrowLeft/ArrowRight/Home/End delegation + roving tabindex. Done-when: full APG map works, wrap-around at both ends, `Tab` exits strip, no strip scroll on arrows.
- T03 (owner: implementer): Playwright spec covering T01+T02 (open tabs until overflow, assert `scrollLeft` changes on open; arrow nav sequence Artifact→…→wrap). Done-when: spec passes in CI lane.

## VALIDATION
- Manual matrix on fixture :4317: overflow on/off, every key, wrap ends, narrow 280px panel, `prefers-reduced-motion`, mouse+keyboard mixed use, screen reader spot-check (VoiceOver announces tab count/position).
- Acceptance: each requirement line verifiable; overflow edge markers still correct after programmatic scrolls.

## Historical STATE
- Researched/decided: above. Implemented: none. Risk: none identified — additive handlers on existing markup.
- Next step: T01.

## REFERENCES
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1741 (canonical body = this plan). Companion plan: `workspace-tab-close.md` / issue #1740 (close affordance; orthogonal, touch same file — land either first, other rebases).

<!-- gen-v1-audit-plan-revision:2026-11-23:1741 -->

## November audit plan revision
**Revision:** `audit-2026-11-23-r1`. **Repository baseline:** `main@a64e9e2d03ce09c843bff0480d81311f2012c812` (GitHub read during triage). **Canonical issue:** #1741.

### Objective and requirements
**Workspace tabstrip accessibility and focus.** 07 §4.13. Preserve the existing tab visibility and navigation design.
The issue's revision 2 takes precedence over the older attached revision 1. The prior duplicate branch was released in favor of #1813.

### Reproduction gate
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

### Execution and validation
- **RED — Reproduce against current tabs.** Open enough panels to overflow the strip, select the last one, use Arrow/Home/End and inspect active tab and panel ID relationships. Include a closed panel and a detached panel.
- **GREEN — Check tab semantics and existing interactions.** Require visible active tab, one keyboard tab stop, valid panel targets where applicable, correct focus and retained close/reorder actions. Use the existing Playwright suite and browser accessibility inspection.

### State and handoff
New audit checks are planned. This revision records source and issue triage only. The implementing agent records independent RED, the exact accepted fix or no-repro disposition, GREEN, and any installed or native gate on this issue. Follow the issue's existing dependency and review order.

### References
Audit trackers #1848 and #1946. Follow-up coordination #1860 and #1886.
[Prior version of the attached Markdown plan](https://github.com/skytuhua-org/Gen-V1/blob/50a380b19d771724c0cdd55a43f6f87f6a0d9833/docs/agent-plans/workspace-tab-strip-nav.md).
