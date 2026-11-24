**Full current issue mirror:** [issue-1297.md](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1297.md). The publication checkpoint pins the exact commit.

## Current reconciliation, 2026-11-24

Revision: `2026-11-24-audit-r1`. Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1297. Source audit: `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Coordination: #1803, `cleanup-2026-11-23-r2`. State: **OPEN**.

#1307 remains open. Maintainer-directed placement moved from a header popover to the composer project picker, as recorded in two author checkpoints and frontend review; the body still specifies the superseded header location and needs correction while preserving dismiss/focus and narrow-width non-overlap acceptance.

Current approved direction is the composer project picker, not a new header button. Author checkpoints [7072081100](https://github.com/skytuhua-org/Gen-V1/issues/1297#issuecomment-7072081100) and [7072416586](https://github.com/skytuhua-org/Gen-V1/issues/1297#issuecomment-7072416586) record the maintainer-directed change and Current project/Switch project sections; frontend review [7072880203](https://github.com/skytuhua-org/Gen-V1/issues/1297#issuecomment-7072880203) confirms that direction. Keep the original outcome of removing the floating pill, dismiss/focus behavior, and the reviewed <=600px composer non-overlap check. #1307 is open, so none is claimed verified on main.

This revision corrects progress and evidence status. It preserves the accepted requirements below. Earlier “not started”, “open PR”, owner, and test statements are historical where this reconciliation gives a newer explicit result. Current ownership remains governed by the live append-only journal; this audit does not release another worker’s implementation claim.

### Verification and remaining work

The issue body, complete paged journal and referenced PR states were reconciled. Existing test receipts remain bound to their stated branch/platform. The source inspections explicitly named above were executed in this audit; no local application tests, native installed acceptance or visual capture are newly claimed. Required tests in the retained plan remain planned until a cited result discharges them. Resume the remaining gate named above through the existing candidate PR and owner, preserving its task IDs and review requirements.

### Evidence

- https://github.com/skytuhua-org/Gen-V1/issues/1297#issuecomment-7072416586
- https://github.com/skytuhua-org/Gen-V1/issues/1297#issuecomment-7072878794
- https://github.com/skytuhua-org/Gen-V1/issues/1297#issuecomment-7072880203
- https://github.com/skytuhua-org/Gen-V1/pull/1307

---

Remove the floating bottom-right Project overview pill; open the same content from the composer project picker, using the maintainer-directed Current project / Switch project layout recorded in the journal.

**Done when:** pill gone; the project picker opens/closes the overview content; Escape/outside click dismiss; focus returns to the invoking control; at widths <=600px no overview control covers either composer footer row.

Parent: #1281

[Written by Devin](https://app.devin.ai/sessions/4a07805aa5f74ebdb40a2ecb4075b821)
