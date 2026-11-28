<!-- gen-v1-audit-r1-r2:evaluation-config-lifetime -->
# Bound temporary evaluation configuration lifetime

## META
- Repo `skytuhua-org/Gen-V1`. Plan revision `audit-coverage-r3`, 2026-11-24 Pacific time.
- GitHub main inspected at `fa8f814fd3f8c4b569c7be9932558ed6eff4cc9b`. Source observation only. Implementation and runtime validation are pending.
- Audit source: 15 item 39 and 03 late growth. Current `prepareEvaluation` writes a normalized configuration for each evaluation request and forwards the path to the evaluator. The adjacent invocation code has no per-request cleanup step. #1958 covers durable events and receipts; the lifetime here is a temporary input file.

## OBJECTIVE
Keep evaluator inputs available for as long as an admitted child needs them, and keep expired temporary configurations from accumulating in the host data directory.

## REQUIREMENTS
Use a pinned fixture and keep current supported behavior and records. Keep existing protected resources and contributor ownership. Document applicability by platform.

## REPO_MAP
- [`packages/integrations/index.ts` line 314](https://github.com/skytuhua-org/Gen-V1/blob/fa8f814fd3f8c4b569c7be9932558ed6eff4cc9b/packages/integrations/index.ts#L314)
- [`packages/integrations/index.ts` line 326](https://github.com/skytuhua-org/Gen-V1/blob/fa8f814fd3f8c4b569c7be9932558ed6eff4cc9b/packages/integrations/index.ts#L326)
- [`packages/integrations/index.ts` line 329](https://github.com/skytuhua-org/Gen-V1/blob/fa8f814fd3f8c4b569c7be9932558ed6eff4cc9b/packages/integrations/index.ts#L329)

## DESIGN
Give the staged input a lifetime owned by the admitted invocation. Remove it after the current consumer is done, with bounded crash recovery for definitely abandoned staged inputs if necessary. Preserve required results and durable receipts. Keep a still-running invocation's input and never clean unowned directories or project files.

## EXECUTION_DAG
1. **T01 — Reproduce.** Use the existing integration fixture with a fake evaluator and a temporary application root. Observe a successful call, an ordinary call failure, and a call interrupted during its read. Record owned staged-file counts and verify whether a subsequent result read depends on the path. Hand the recorded evidence and fixture to the scoped owner.
2. **T02 — Repair.** Depends on T01. Compare the current implementation and linked work. Implement only the confirmed failure in the mapped owner paths. Hand off the change and failing baseline test to T03.
3. **T03 — Verify.** Depends on T02. Assert repeat calls leave bounded temporary state, errors preserve the original result, result details remain available, and an in-flight read still sees its file. Run focused integration fixtures without a provider account or live model execution.

## VALIDATION
The implementing agent must independently reproduce the failure on a pinned baseline before fixing it. Record the SHA, OS, fixture, actual and expected result, and exact failing and passing commands. Treat a non-reproducing case as a finding to reconcile before editing. Preserve the scope of any skipped checks.

Assert repeat calls leave bounded temporary state, errors preserve the original result, result details remain available, and an in-flight read still sees its file. Run focused integration fixtures without a provider account or live model execution.

## STATE
Current source inspected. Runtime evidence, owner-confirmed changes and acceptance remain pending. Start with T01 on a refreshed main or the applicable linked head.

## REFERENCES
Audit coordination #1946. [Repository instructions](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

