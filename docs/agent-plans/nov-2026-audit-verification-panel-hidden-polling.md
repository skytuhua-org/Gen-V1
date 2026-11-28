<!-- gen-v1-audit-r1-r2:verification-panel-hidden-polling -->
# Pause verification panel polling while its document is hidden

## META
Repository `skytuhua-org/Gen-V1` · revision audit-coverage-r4 · 2026-11-24 Pacific time. Source inspected at `main@20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645`. Runtime evidence pending.
07:8.1. The current VerificationReadPanel schedules successive reads while it remains mounted, with cleanup on unmount or thread change. #1357 enumerates control consent, paired devices, and agent work. It omits this verification panel.

## OBJECTIVE
Refresh verification data while its owner is visible, and preserve the last coherent result while the owner is unavailable.

## REQUIREMENTS
Use the supported entry point with an owned fixture. Preserve current evidence or response semantics and existing ownership boundaries.

## REPO_MAP
[apps/web/src/VerificationPanel.tsx line 75](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/VerificationPanel.tsx#L75).

## DESIGN
Use the existing visibility and owner lifecycle. Abort or fence requests that lose ownership, suppress repeated hidden reads, and resume with one fresh current-owner request when visible. Preserve current refresh pacing and unavailable state.

## EXECUTION_DAG
1. **T01 — Reproduce.** In the browser fixture mount VerificationPanel using the normal thread view. Move the document into a hidden state while keeping the view mounted, then restore visibility. Use controlled timers and record requests during the hidden interval and after return. Record the pinned failing case before code edits.
2. **T02 — Fix.** Depends on T01. Use the existing visibility and owner lifecycle. Abort or fence requests that lose ownership, suppress repeated hidden reads, and resume with one fresh current-owner request when visible. Preserve current refresh pacing and unavailable state. Hand the precise change and regression to T03.
3. **T03 — Verify.** Depends on T02. Verify no hidden polling, one prompt visible refresh, a fenced in-flight old result, normal visible pacing, and orderly unmount or thread-change cleanup.

## VALIDATION
The implementing agent must independently reproduce the issue before fixing it. Record baseline SHA, fixture, environment, exact expected and observed RED, and the same case GREEN. Record any non-reproduction with evidence before editing.
Verify no hidden polling, one prompt visible refresh, a fenced in-flight old result, normal visible pacing, and orderly unmount or thread-change cleanup.

## STATE
Current source and overlapping issue scope checked. Implementation and runtime acceptance are pending. Begin with T01.

## REFERENCES
Audit #1946. [Repository instructions](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

