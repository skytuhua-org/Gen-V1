<!-- gen-v1-audit-r1-r2:vendored-tooling-inventory -->
# Separate upstream-only validation tools from the installed integration inventory

## META
- Repo `skytuhua-org/Gen-V1`. Plan revision `audit-coverage-r3`, 2026-11-24 Pacific time.
- GitHub main inspected at `fa8f814fd3f8c4b569c7be9932558ed6eff4cc9b`. Source observation only. Implementation and runtime validation are pending.
- Audit source: 04 D13, rows 227–228. The installed Humanizer inventory includes an upstream release validator whose source looks for repository metadata absent from the vendored tree. The separate Superpowers excerpt refers to modules belonging to its original example project.

## OBJECTIVE
Keep the installed tool inventory truthful and preserve traceable upstream source and reusable guidance.

## REQUIREMENTS
Use a pinned fixture and keep current supported behavior and records. Keep existing protected resources and contributor ownership. Document applicability by platform.

## REPO_MAP
- [`scripts/vendor-integrations.ts` line 19](https://github.com/skytuhua-org/Gen-V1/blob/fa8f814fd3f8c4b569c7be9932558ed6eff4cc9b/scripts/vendor-integrations.ts#L19)
- [`third-party/integrations/humanizer/skills/humanizer/scripts/validate-package.py` line 24](https://github.com/skytuhua-org/Gen-V1/blob/fa8f814fd3f8c4b569c7be9932558ed6eff4cc9b/third-party/integrations/humanizer/skills/humanizer/scripts/validate-package.py#L24)
- [`third-party/integrations/superpowers/skills/systematic-debugging/condition-based-waiting-example.ts` line 5](https://github.com/skytuhua-org/Gen-V1/blob/fa8f814fd3f8c4b569c7be9932558ed6eff4cc9b/third-party/integrations/superpowers/skills/systematic-debugging/condition-based-waiting-example.ts#L5)

## DESIGN
Use a narrow selection rule or explicit inventory distinction after confirming callers and retention requirements. Keep upstream notices, pins, and the usable skill. Preserve the original sample and mark its example context if it is intentionally included. Change upstream bytes only through the repository's accepted vendor process.

## EXECUTION_DAG
1. **T01 — Reproduce.** Inventory the pinned integration's selected, installed, and documented entry points. In a disposable copy of the shipped layout run the upstream-only validator with Python if supported, capture the missing-input result, and identify references that would still require it. Classify the separate sample as retained documentation or a supported runnable example based on its real consumer. Hand the recorded evidence and fixture to the scoped owner.
2. **T02 — Repair.** Depends on T01. Compare the current implementation and linked work. Implement only the confirmed failure in the mapped owner paths. Hand off the change and failing baseline test to T03.
3. **T03 — Verify.** Depends on T02. Verify the inventory and its checksum/manifest checks, the normal skill entry points and support files, and that the installed tool listings promote only supported commands. Add a check for the observed packaging regression if the shipping rule changes. Report source counts and exact retained artifacts.

## VALIDATION
The implementing agent must independently reproduce the failure on a pinned baseline before fixing it. Record the SHA, OS, fixture, actual and expected result, and exact failing and passing commands. Treat a non-reproducing case as a finding to reconcile before editing. Preserve the scope of any skipped checks.

Verify the inventory and its checksum/manifest checks, the normal skill entry points and support files, and that the installed tool listings promote only supported commands. Add a check for the observed packaging regression if the shipping rule changes. Report source counts and exact retained artifacts.

## STATE
Current source inspected. Runtime evidence, owner-confirmed changes and acceptance remain pending. Start with T01 on a refreshed main or the applicable linked head.

## REFERENCES
Audit coordination #1946. [Repository instructions](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

