<!-- gen-v1-audit-r1-r2:project-memory-deletion-recovery -->
# Restore project-memory availability after deletion ledger damage

## META
- Repo `skytuhua-org/Gen-V1`. Plan revision `audit-coverage-r3`, 2026-11-24 Pacific time.
- GitHub main inspected at `fa8f814fd3f8c4b569c7be9932558ed6eff4cc9b`. Source observation only. Implementation and runtime validation are pending.
- Audit source: 14 F1. At the inspected main SHA a malformed ledger record raises the recovery error before the load can complete. #1026 covers installed memory qualification and proof of retention/purge; this repair concerns recovery from damaged on-disk state.

## OBJECTIVE
Provide conservative recovery when one copy of the deletion history is damaged while ensuring acknowledged deletions and source exclusions remain enforced.

## REQUIREMENTS
Use a pinned fixture and keep current supported behavior and records. Keep existing protected resources and contributor ownership. Document applicability by platform.

## REPO_MAP
- [`packages/core/project-memory.ts` line 132](https://github.com/skytuhua-org/Gen-V1/blob/fa8f814fd3f8c4b569c7be9932558ed6eff4cc9b/packages/core/project-memory.ts#L132)
- [`packages/core/project-memory.ts` line 152](https://github.com/skytuhua-org/Gen-V1/blob/fa8f814fd3f8c4b569c7be9932558ed6eff4cc9b/packages/core/project-memory.ts#L152)

## DESIGN
Preserve damaged bytes for recovery and apply only history whose current owner and completeness can be established. Keep memory disabled with an actionable recovery outcome if deletion history is uncertain. Preserve every acknowledged deletion and its exclusions. Do not relax existing admission, identity, or privacy boundaries.

## EXECUTION_DAG
1. **T01 — Reproduce.** Use a disposable profile with synthetic memory and an acknowledged deletion. Introduce ordinary read corruption through a local fixture and open memory through the normal host path. Record the typed recovery state and prove the acknowledged deletion is still enforced. Check the known-good case as a control. Hand the recorded evidence and fixture to the scoped owner.
2. **T02 — Repair.** Depends on T01. Compare the current implementation and linked work. Implement only the confirmed failure in the mapped owner paths. Hand off the change and failing baseline test to T03.
3. **T03 — Verify.** Depends on T02. Exercise a healthy profile, a recoverable case with complete authoritative history, and a case where confidence cannot be established. Verify no acknowledged deletion or excluded source becomes reachable before, during, or after recovery. Validate restart and provider-free fixture evidence.

## VALIDATION
The implementing agent must independently reproduce the failure on a pinned baseline before fixing it. Record the SHA, OS, fixture, actual and expected result, and exact failing and passing commands. Treat a non-reproducing case as a finding to reconcile before editing. Preserve the scope of any skipped checks.

Exercise a healthy profile, a recoverable case with complete authoritative history, and a case where confidence cannot be established. Verify no acknowledged deletion or excluded source becomes reachable before, during, or after recovery. Validate restart and provider-free fixture evidence.

## STATE
Current source inspected. Runtime evidence, owner-confirmed changes and acceptance remain pending. Start with T01 on a refreshed main or the applicable linked head.

## REFERENCES
Audit coordination #1946. [Repository instructions](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

