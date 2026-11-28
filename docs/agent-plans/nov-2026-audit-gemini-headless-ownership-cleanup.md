<!-- gen-v1-audit-r1-r2:gemini-headless-ownership-cleanup -->
# Drain Gemini headless process resources and owned scratch files

## META
Plan revision `audit-coverage-r4` · 2026-11-24 Pacific time · `skytuhua-org/Gen-V1`.
Main inspected at `20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645`. Source evidence only. Reproduction and implementation remain pending.
02:L216, 04:L163 and 15:48. Headless resume creates app-owned temporary configuration and depends on the child streams. The current close path handles a narrow child-exit wait and has no scratch-file retirement step. Existing provider-readiness and generic runtime repair plans describe different paths.

## OBJECTIVE
Keep the official resume driver responsive after ordinary stream failure or cancellation and retire its temporary files only when app ownership and close state allow it.

## REQUIREMENTS
Use the supported product entry point and a local owned fixture. Preserve existing resource ownership, compatibility and user data. Leave neighboring work with its existing issue and PR owners.

## REPO_MAP
- [`packages/runtime-official/gemini-headless.ts` line 13](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/runtime-official/gemini-headless.ts#L13)
- [`packages/runtime-official/gemini-headless.ts` line 35](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/runtime-official/gemini-headless.ts#L35)
- [`packages/runtime-official/gemini-headless.ts` line 116](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/runtime-official/gemini-headless.ts#L116)

## DESIGN
Centralize exactly-once child/stream failure settlement and defer resource cleanup until owned readers are finished. Remove only scratch files created for that driver. Preserve retained manifests, accepted transcript ownership and unconfirmed-child protection. Report a recoverable cleanup failure rather than silently forgetting ownership.

## EXECUTION_DAG
1. **T01 — Establish RED.** Use a fake child process and sterile task directory. Exercise an ordinary stream error, normal exit, close after a completed turn, and cancellation while the child is still using its temporary input. Record exact terminal outcomes and inspect only app-owned test-file counts. Use dummy configuration without live provider or profile data. Save the pinned result and fixture for the scoped owner.
2. **T02 — Implement a bounded fix.** Depends on T01. Check current issue/PR ownership, then fix the reproduced cause in the scoped component. Preserve normal and recovery paths and hand off the exact patch with its regression.
3. **T03 — Verify and record.** Depends on T02. Verify a stream failure does not terminate the host, the run and queue settle consistently, finished drivers leave no owned staging files, and an uncertain child state cannot cause premature cleanup or release.

## VALIDATION
The implementing agent must independently reproduce the failure before fixing it. Record the baseline SHA, environment, fixture, exact commands, expected result and observed RED. Run the same test on the patch and record GREEN, adjacent checks and any acceptance still pending. If it does not reproduce, record that disposition before editing.

Verify a stream failure does not terminate the host, the run and queue settle consistently, finished drivers leave no owned staging files, and an uncertain child state cannot cause premature cleanup or release.

## STATE
Source-inspected tracking gap. Start with T01 on a refreshed applicable head. No runtime result is claimed.

## REFERENCES
Audit T05 #1946. [Repository instructions](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

