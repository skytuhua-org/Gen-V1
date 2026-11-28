# Gen-V1 desktop and renderer audit verification

This record preserves the shareable acceptance evidence for `devin-cli-audit-r1` on [issue #2165](https://github.com/skytuhua-org/Gen-V1/issues/2165). The audited code was [`main@20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645`](https://github.com/skytuhua-org/Gen-V1/commit/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645). The findings, severity ordering, and previous tracking links are recorded in the [final audit](https://github.com/skytuhua-org/Gen-V1/issues/2165#issuecomment-7147187999).

## Completion receipts

- 36 distinct Devin CLI sessions completed successfully with the explicitly resolved model `swe-2-1-max`. The session exports identified SWE-2.1 Max. All 36 structured reports named the audited commit and ended with `OWNER=NONE`.
- The audit ran in waves and peaked at 15 concurrent workers. devin 3000.12.57 (96542e930752) was used. Two incomplete stream prefixes were recovered from complete final JSON objects.
- The public findings comprise 5 P1, 54 P2 and 11 P3 items. Four were independently reconfirmed from prior tracking. Five reproduced in the four focused probes below. Other public findings were established by source tracing or coverage inspection.
- The original release is the immutable chronology for the operational audit. The linked worker document indexes individual receipts and validated source references. Scope limitations remain those recorded on the issue.

## Focused probes

The original executions used Node 24.14.0 and an isolated checkout of the audited commit. The records below describe the fixtures and observed outcomes from that audit.

### Composer change count · A05.2

Ran `node --experimental-strip-types --input-type=module --eval` with the pinned `recordedChangeSummary` helper and synthetic process results. A single replacement generated one addition and one removal. The fixtures reused the same hunk when marking output truncated or cancelled; the nonzero-exit result had empty output.

| Input | Observed count |
| --- | --- |
| Complete output, exit 0 | +1 / −1 |
| Truncated output, exit 0 | +1 / −1 |
| Empty output, exit 1 | +0 / −0 |
| Cancelled result with partial output | +1 / −1 |

[Pinned helper](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/composer-evidence.ts#L5)

### Native attention popup · A10.1

Ran `node --experimental-strip-types --input-type=module --eval` against `createAttentionPopups`. The fixture supplied one synthetic notification, called `poll()` twice and counted window attempts and displayed cards. Native window callbacks were synthetic.

| Fixture behavior | Creation attempts | Alerts displayed |
| --- | --- | --- |
| One-shot delivery, healthy creation | 1 | 1 |
| One-shot delivery, first creation fails | 1 | 0 |
| Delivery repeated after first creation fails | 2 | 1 |

[Pinned controller](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/desktop/attention-popups.ts#L27) · [Claim consumption](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/attention.ts#L76)

### Delegated-input receipts · A09.1 and A09.2

Ran `node --experimental-transform-types --input-type=module --eval` with the real coordinator, agent inbox, and isolated SQLite store. A synthetic child exposed a deferred acknowledgement and delayed factory to establish deterministic cancellation and startup order. Existing Ajv and Zod dependencies supported the fixture.

| Scenario | Final receipt | Calls observed by synthetic child |
| --- | --- | --- |
| Healthy follow-up | `ENTERED_RUNTIME` | `START`, `FOLLOW_UP` |
| Cancel after child send begins, then release acknowledgement | `REJECTED` | `START`, `FOLLOW_UP` |
| Submit follow-up while runtime factory is pending, then release startup | `UNKNOWN` | `START` |

[Pinned dispatch](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/core/agent-work.ts#L414) · [M09 tracking](https://github.com/skytuhua-org/Gen-V1/issues/2042)

### Checkpoint restore parser · A23.1

Ran `node --experimental-transform-types --input-type=module --eval` with `readRestorePlan` and `readRestoreResult`. The controls were valid public-shape synthetic payloads. The service-shaped variants added the exact extra `root` and `results` keys that the pinned service returns. The full Windows fixture reached its 14-second timeout before returning evidence. A strip-only parser attempt could not load a TypeScript parameter property; the transform-types rerun provided the evidence below.

| Payload | Observed result |
| --- | --- |
| Plan without the extra fields | Accepted as `PREVIEW` |
| Service-shaped plan | Rejected with `unrecognized_keys` for `root` and `results` |
| Apply response without the extra fields | Accepted as `APPLIED` |
| Service-shaped apply response | Rejected with `unrecognized_keys` for `root` and `results` |

[Pinned client parsers](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/apps/web/src/file-checkpoint-api.ts#L95) · [Response construction](https://github.com/skytuhua-org/Gen-V1/blob/20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645/packages/workspace/checkpoints.ts#L505) · [Restore tracking](https://github.com/skytuhua-org/Gen-V1/issues/1953)

## Acceptance limits

Source verification establishes the traced behavior or coverage at the pinned commit. The focused fixtures supply the specific observations above. Full browser and native Electron acceptance, physical devices, live providers, and published installer upgrade paths were outside the executed checks. The repository’s private disclosure policy governs the separately held item.

## Published audit records

- [Canonical issue plan and journal](https://github.com/skytuhua-org/Gen-V1/issues/2165)
- [Ranked audit and release](https://github.com/skytuhua-org/Gen-V1/issues/2165#issuecomment-7147187999)
- [Versioned plan](audit-2165-devin-workflow-correctness.md)
- [Individually attributed worker records](audit-2165-worker-records.md)
