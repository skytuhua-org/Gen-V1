**Full current issue mirror:** [issue-1137.md](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1137.md). The publication checkpoint pins the exact commit.

## Current reconciliation, 2026-11-24

Revision: `2026-11-24-audit-r1`. Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1137. Source audit: `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Coordination: #1803, `cleanup-2026-11-23-r2`. State: **OPEN**.

canonical refresh fix #1427 is open; #1158/#1224/#1596 are closed duplicate work. The latest reference to reopening #1596 is stale and must point to #1427.



This revision corrects progress and evidence status. It preserves the accepted requirements below. Earlier “not started”, “open PR”, owner, and test statements are historical where this reconciliation gives a newer explicit result. Current ownership remains governed by the live append-only journal; this audit does not release another worker’s implementation claim.

### Verification and remaining work

The issue body, complete paged journal and referenced PR states were reconciled. Existing test receipts remain bound to their stated branch/platform. The source inspections explicitly named above were executed in this audit; no local application tests, native installed acceptance or visual capture are newly claimed. Required tests in the retained plan remain planned until a cited result discharges them. Resume the remaining gate named above through the existing candidate PR and owner, preserving its task IDs and review requirements.

### Evidence

- https://github.com/skytuhua-org/Gen-V1/issues/1137#issuecomment-7067000278
- https://github.com/skytuhua-org/Gen-V1/issues/1137#issuecomment-7067173775
- https://github.com/skytuhua-org/Gen-V1/issues/1137#issuecomment-7091802252
- https://github.com/skytuhua-org/Gen-V1/pull/1158
- https://github.com/skytuhua-org/Gen-V1/pull/1224
- https://github.com/skytuhua-org/Gen-V1/pull/1427
- https://github.com/skytuhua-org/Gen-V1/pull/1596

---

Plan file: https://github.com/skytuhua-org/Gen-V1/blob/6a5fc6ac6ad75dcb45001b24ed7b772596c594df/docs/agent-plans/ux-usage-dialog-duplicate-refresh.md

# Plan: Remove duplicate Refresh buttons in Usage dialog empty state

## META
- Feature: Usage dialog empty state
- Repo: skytuhua-org/Gen-V1 — plan rev 2, 2026-11-20 (design fully specified — implementer makes no design choices)
- Baseline: main @ f8e9a8314fea0dc7bb1ab5d59bfe741f7083273e
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1137
- Parent audit issue: https://github.com/skytuhua-org/Gen-V1/issues/1140
- Status: planning complete, implementation NOT started
- Source: manual UX audit of built app on :4317

## OBJECTIVE
The Usage dialog renders a "Refresh" button in its header and a second identical "Refresh" inside the empty-state body. Two same-labeled controls in one dialog is confusing and redundant. Success: exactly one refresh affordance per dialog state.

## REQUIREMENTS
- Keep a single Refresh action: header Refresh while content is present; empty state may keep its inline Refresh only if the header one is hidden when empty (pick one consistent rule).
- No behavior change to what Refresh does.
- Match the codebase's existing dialog-empty-state conventions.

## REPO_MAP
- `apps/web/src/UsageDialog.tsx` — verified: contains the dialog, header Refresh, and empty-state markup with a second Refresh.
- Discovery: shared EmptyState component if present (`rg "Empty" apps/web/src -g '*.tsx'`).

## DESIGN SPEC (exact values — no design choices left)

**Decision:** the header `Refresh` is the single refresh control in every state; the empty-state copy contains no second button.

- Header Refresh: `.secondary` button, `min-height:var(--settings-row-height)`, `border-radius:var(--control-radius)`, font-size 12px, right-aligned in the dialog header. States: hover `background:var(--hover)`; `:focus-visible` 2px `var(--ui-focus-ring)` outline; `:disabled` (while fetching) `opacity:.5`.
- Empty state (replaces the second Refresh): centered block — `.empty-symbol` 34×34px `var(--muted)` icon + `<p>` 14px `var(--muted)` `margin-top:12px;line-height:1.8` text: `No usage recorded yet.`; below it a `var(--muted)` 12px hint `Usage appears after the first model request.`
- Populated state unchanged except the single header Refresh stays.
- Dialog chrome unchanged: `.dialog` width 440px, `max-width:calc(100vw - 32px)`, padding 22px, `border:1px solid var(--border)`, `border-radius:16px`, `background:var(--surface)`, `box-shadow:var(--elevation)`.

## DESIGN
Implement exactly the DESIGN SPEC decision: header Refresh is the single control in every state; the empty state shows icon + message + hint only. One-line conditional on the empty-state body; no new components unless an EmptyState helper already exists — then use it.

## EXECUTION_DAG
- T01: Conditional-render so only one Refresh shows in empty state. done-when: DOM contains one button named Refresh in empty state and one in populated state.
- T02: Screenshot empty + populated states.


**Task contract (applies to every task above):** OWNER = one implementing agent claims this issue end-to-end. PREREQ = read this plan plus files in REPO_MAP; a task also depends on the earlier task it edits the same files as (sequential by ID). HANDOFF = implement on a `devin/*` branch off current main (pull latest main before branching), open a PR linking this issue, attach before/after screenshots and the VALIDATION results; post an AGENTS.md checkpoint on this issue at each milestone.

## VALIDATION
- Fixture: open Usage from sidebar; confirm one Refresh in empty state.
- If a fixture path exists for populated usage, check there too; otherwise unit/DOM check.

## STATE
- rev 2: full design spec added.
- Researched: ss_a0a27405.png. Implemented: nothing. Next: T01.

## REFERENCES
- Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1137 ; audit evidence (screenshots, DOM dumps) is recorded in the audit session https://app.devin.ai/sessions/fdeae51a36244c48af3f43ff6dc04059 and summarized in parent issue #1140.
- Audit screenshot: ss_a0a27405.png (Usage dialog with two Refresh buttons).
