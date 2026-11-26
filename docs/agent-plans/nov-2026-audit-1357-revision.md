## Problem
Three panels poll the host on a fixed timer, keep polling while the window is minimized or in the background, and drop errors silently:
- `apps/web/src/ControlConsentPanel.tsx`: `setInterval(load, 4000)` → `/api/threads/:id/control`, `.catch(() => {})`.
- `apps/web/src/PairedDevicesPanel.tsx`: `setInterval(() => void load(), 5000)`.
- `apps/web/src/agents-workspace/AgentWorkPanel.tsx`: `setInterval(() => void refresh(), 4000)`.
None of them check `document.visibilityState`. Each open thread or panel adds a request every 4–5 s for as long as the app runs.

## Scope
- Add one small shared hook (for example `usePolling(fn, intervalMs)`) that pauses while `document.hidden`, runs once immediately on `visibilitychange` to visible, and backs off (for example doubling up to 60 s) after consecutive failures.
- Use it in the three panels. Keep the current intervals while visible.
- Where the panel shows nothing on failure today, keep that UI, but report the failure through the existing diagnostics/notice path if there is one (confirm by reading the code; do not invent a new error UI).
- Out of scope: replacing polling with SSE (separate design).
- Register any new file in `scripts/public-source-files.json`.

## Done when
- [ ] With the window hidden, no requests from these panels appear (unit test with a fake timer and a mocked `visibilityState`).
- [ ] Polling resumes immediately when the window becomes visible.
- [ ] Back-off on repeated failures is covered by a test.
- [ ] `pnpm typecheck` and `pnpm test` pass.

## Coordination
Follow [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md): claim scope in a comment before editing, one concern per PR, link the PR here, post RELEASE (`OWNER=NONE`) when you stop. Check open PRs that touch the same files before starting.

[Written by Devin](https://app.devin.ai/sessions/a31c7ce24556455b803aede9894b5c7b)

<!-- gen-v1-audit-plan-revision:2026-11-23:1357 -->

## November audit plan revision
**Revision:** `audit-2026-11-23-r1`. **Repository baseline:** `main@a64e9e2d03ce09c843bff0480d81311f2012c812` (GitHub read during triage). **Canonical issue:** #1357.

### Objective and requirements
**Hidden and collapsed polling panels.** 07 §§8.1, 9.1. The existing issue already owns fixed-interval background panel polling.
PR #1412 is in review. Confirm existing visibility changes on the exact head before proposing additional polling changes.

### Reproduction gate
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

### Execution and validation
- **Request census — Count calls with controlled fake time.** Measure control, paired-device, verification and agent-work panels across visible, document-hidden, collapsed and remounted states. Verify which panels exist on pinned main and which receive native updates.
- **Acceptance — Bound polling to useful UI state.** No recurring requests while inaccessible. On reveal or reconnect refresh once, with no duplicate in-flight refresh or update after disposal. Preserve user actions, running state, errors and existing host event behavior.

### State and handoff
New audit checks are planned. This revision records source and issue triage only. The implementing agent records independent RED, the exact accepted fix or no-repro disposition, GREEN, and any installed or native gate on this issue. Follow the issue's existing dependency and review order.

### References
Audit trackers #1848 and #1946. Follow-up coordination #1860 and #1886.

