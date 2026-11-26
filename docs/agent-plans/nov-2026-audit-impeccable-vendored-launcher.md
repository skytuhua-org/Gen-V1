<!-- gen-v1-audit-r1-r2:impeccable-vendored-launcher -->
# Use the vendored Impeccable engine from its documented launcher

## META
Repository `skytuhua-org/Gen-V1` · audit-coverage-r4 · 2026-11-24 Pacific time. Source inspected at `main@20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645`. Runtime evidence pending.
02:L910. The installed skill directs users to its bundled launcher. The Windows launcher searches its script-local distribution and configured external paths. The repo vendoring rule writes the pinned engine to a different location. #2159 covers upstream validator and example selection; this issue is the documented, installed executable entry point.

## OBJECTIVE
Use the vendored Impeccable engine from its documented launcher. Confirm the stated failure through the supported entry point and preserve the normal flow.

## REQUIREMENTS
Use an owned disposable fixture and supported platform. Preserve original source, user data, and implementation ownership of neighboring work.

## REPO_MAP
- [third-party/integrations/impeccable/skills/impeccable/scripts/impeccable.cmd line 26](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/third-party/integrations/impeccable/skills/impeccable/scripts/impeccable.cmd#L26)
- [third-party/integrations/impeccable/skills/impeccable/scripts/impeccable.cmd line 116](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/third-party/integrations/impeccable/skills/impeccable/scripts/impeccable.cmd#L116)

## DESIGN
Route the vendored skill entry point to the manifest-pinned engine through the existing app-owned path. Preserve platform and source identity checks and independently test missing and mismatched packaged engines. Preserve the upstream licence and documentation provenance.

## EXECUTION_DAG
1. **T01 — Reproduce.** Use an isolated copy of the shipped Windows layout. Run the documented context command in an ordinary project with network calls disabled in the fixture and observe which executable, if any, was selected. Compare the same app-owned engine path used by the integration health path. Record the pinned fixture and failing result before selecting a design.
2. **T02 — Fix the reproduced cause.** Depends on T01. Route the vendored skill entry point to the manifest-pinned engine through the existing app-owned path. Preserve platform and source identity checks and independently test missing and mismatched packaged engines. Preserve the upstream licence and documentation provenance. Hand the exact patch and test to T03.
3. **T03 — Confirm the final behavior.** Depends on T02. Verify the failing case, known-good control, retry or reopen behavior, and applicable focused checks. Record any hosted or installed gates still due.

## VALIDATION
The implementing agent must independently reproduce the bug before fixing it. Record baseline commit, environment, exact command, expected result and actual RED. Run the same case at the proposed head and record GREEN or a justified non-reproduction disposition.

## STATE
Scope and source reviewed. Runtime validation, implementation and exact-head review remain pending.

## REFERENCES
Audit #1946. [Repository instructions](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

