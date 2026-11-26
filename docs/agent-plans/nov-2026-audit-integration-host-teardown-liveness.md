<!-- gen-v1-audit-r1-r2:integration-host-teardown-liveness -->
# Keep integration host shutdown recoverable after one close fails

## META
Plan revision `audit-coverage-r4` · 2026-11-24 Pacific time · `skytuhua-org/Gen-V1`.
Main inspected at `20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645`. Source evidence only. Reproduction and implementation remain pending.
02:L776–777, 02:L1143 and 15:42. Current integration-host cleanup can stop before draining retained owners when an earlier await rejects. A rejected owner-release promise is removed only on success. #2160 concerns temporary evaluation files; existing runtime adapters are a distinct teardown owner.

## OBJECTIVE
Attempt the required close work for each independent integration and retain explicit ownership wherever native teardown is unconfirmed.

## REQUIREMENTS
Use the supported product entry point and a local owned fixture. Preserve existing resource ownership, compatibility and user data. Leave neighboring work with its existing issue and PR owners.

## REPO_MAP
- [`apps/server/integration-host.ts` line 115](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/server/integration-host.ts#L115)
- [`apps/server/integration-host.ts` line 189](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/server/integration-host.ts#L189)
- [`packages/integrations/index.ts` line 375](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/integrations/index.ts#L375)

## DESIGN
Use the existing manager/host ownership boundary. Track confirmed versus retryable failed steps and drain unrelated cleanup. Bound waiting through existing teardown semantics. Remove settled bookkeeping when a durable or retryable outcome owns it, and keep unconfirmed native resources tracked until verified.

## EXECUTION_DAG
1. **T01 — Establish RED.** Run a provider-free integration fixture with at least two independent owned runtimes. Inject a recoverable rejection into one release and a bounded pending close into another. Exercise shutdown, retry and retained owner state. Record which cleanup steps run and the final outcomes. Save the pinned result and fixture for the scoped owner.
2. **T02 — Implement a bounded fix.** Depends on T01. Check current issue/PR ownership, then fix the reproduced cause in the scoped component. Preserve normal and recovery paths and hand off the exact patch with its regression.
3. **T03 — Verify and record.** Depends on T02. Verify one failed close does not skip other owners, successful releases retire their bookkeeping, retry and concurrent close avoid double-disposal, and unconfirmed native state stays explicit. Include normal clean shutdown and late completion tests.

## VALIDATION
The implementing agent must independently reproduce the failure before fixing it. Record the baseline SHA, environment, fixture, exact commands, expected result and observed RED. Run the same test on the patch and record GREEN, adjacent checks and any acceptance still pending. If it does not reproduce, record that disposition before editing.

Verify one failed close does not skip other owners, successful releases retire their bookkeeping, retry and concurrent close avoid double-disposal, and unconfirmed native state stays explicit. Include normal clean shutdown and late completion tests.

## STATE
Source-inspected tracking gap. Start with T01 on a refreshed applicable head. No runtime result is claimed.

## REFERENCES
Audit T05 #1946. [Repository instructions](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

