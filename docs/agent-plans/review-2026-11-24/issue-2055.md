# M04: Preserve the specified 8 KiB head and tail within the 16 KiB preview

## META

Repository: `skytuhua-org/Gen-V1` (ID 1442565952). Plan revision: `m0406-audit-r1-readability-r1`, 2026-11-24 UTC. Exact inspected baseline: `9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. Parent audit: [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992). Planning reviewer: `codex-cloud-m0406-e3d038`. This reviewer holds no implementation ownership; existing claims remain authoritative. No branch, worktree, PR or activation was created by this audit. This document is an executable future plan, not permission to run a provider, alter the repository or activate a capability during the read-only audit.

Attachment limitation observed by the parent publisher: GitHub filechooser upload failed. The complete UTF-8 Markdown body is the publication fallback; these actual .md files remain separate review deliverables. No GitHub attachment success is claimed and no repository-docs write or commit is authorized.

The authoritative inputs are the user-supplied *Audited Execution-Controlled Prompts v6* (2026-11-16), its *Completion Followups* appendix (2026-11-18), and *Expanded Source Research UX Memory Performance v3* (2026-11-14). The complete relevant clauses are reproduced below. v6 controls acceptance; the appendix orders remaining work; research §§19-26 explains the experiment/evidence design. An existing helper, merged commit, valid evidence JSON or passing synthetic test is not production/native/live acceptance.

Read [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md) and [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md) before future implementation. Claim only this issue's task IDs, append and read back every checkpoint, retain one concern and one owner per edit set, and RELEASE OWNER=NONE before stopping. User authorization in this audit covers planning/publication only. Future implementation needs its own task scope; do not resurrect retired architecture without an explicit accepted product decision. M12 and M14 belong to other active owners.

Canonical routing: [2055](https://github.com/skytuhua-org/Gen-V1/issues/2055), published after source and duplicate review under #1992.

## OBJECTIVE

Correct the concrete fixed-D04 content-window mismatch in canonical context-results without increasing the 16 KiB preview cap or creating a competing result format/store. Preserve UTF-8 boundaries and exact omitted byte counts.

### Actual baseline finding

packages/core/context-results.ts defines `OMIT` as a 26-byte UTF-8 marker and computes `half = floor((16384 - 26) / 2) = 8179` in both `clipContextResult` and `encodeContextResult`. For oversized ASCII output this retains 8,179 bytes from the head and 8,179 bytes from the tail rather than the fixed first 8,192 bytes plus the last 8,192 bytes. UTF-8 clipping is not the reason: the marker permanently consumes content budget. The existing v6 D03 test computes its expected half using the same marker and only checks each side is at most 8,192 bytes; it therefore does not enforce the original fixed D04. For 20,000 ASCII bytes, the implementation retains 16,358 content bytes and reports 3,642 omitted; specified windows retain 16,384 and omit 3,616. These are static calculations, not an executed product test.

## REQUIREMENTS

**M04-C04.** Fixed pilot limits: 8 explicit context references, 64 KiB combined preview, 16 KiB per tool-result preview, 1 MiB per authorized fetched range and 4 concurrent admitted read-only calls. Enforce UTF-8 byte limits independently of optional token accounting. These are specification defaults, not measured upstream performance.

**M04-S07.** Persist large permitted tool output privately once and return a bounded preview with a handle. Preserve leading/trailing error context and explicit omission counts. Full retrieval rechecks owner, grant, expiry and range bounds. Spill failure returns a clipped preview plus FULL_RESULT_UNAVAILABLE, never a fabricated readable path.

**M04-D03.** UTF-8 preview. Split a multibyte character at each cap boundary; assert valid UTF-8, exact omitted bytes and total preview <=16 KiB.

**M04-C02.** ToolResultHandleV1 already exists in packages/contracts/request-context.ts: handle, owner, sourceInvocationId, digest, bytes, mediaType, expiresAtMs and operation="read-result-range". Reuse it without changing expiresAtMs to expiry. Handle possession is not authorization. Retrieval returns the authorized range, total size and omitted byte count; missing, deleted or expired content returns UNAVAILABLE.

**Fixed M04-D04 original substantive text:** Use at most 16 KiB preview: first 8 KiB plus last 8 KiB, clipped at UTF-8 boundaries without duplication when shorter. Include exact omitted byte count. Expiry comes from host retention policy; no policy means no retained handle and FULL_RESULT_UNAVAILABLE. This plan preserves both the content-window rule and total cap; the label uses existing metadata outside content, with any contract insufficiency explicitly held.

## REPO_MAP

- [`packages/core/context-results.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/context-results.ts)
- [`packages/core/service.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts)
- [`packages/core/context-result-tool.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/context-result-tool.ts)
- [`tests/context-results-v3.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/context-results-v3.test.ts)
- [`tests/context-contract-preservation-v6.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/context-contract-preservation-v6.test.ts)
- [`tests/context-result-host.test.ts`](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/context-result-host.test.ts)

## DESIGN

The existing preview payload already carries `omittedBytes` separately from preview. Keep canonical `ToolResultHandleV1`, range reader, expiry and authorization unchanged. Use a fixed 8,192-byte source head and 8,192-byte source tail, trim only incomplete UTF-8 scalars at those boundaries, and count omitted source bytes independently. Results of at most 16,384 bytes return the complete source once. An omission label must use existing response metadata or presentation outside the bounded content string; it must not reduce either source window or grow the preview above 16,384 bytes. Inspect actual consumers in T01 before selecting display adjustment. If a consumer needs a new split-boundary field that current approved contracts cannot represent, record HOLD_CONTRACT_SHAPE with that exact missing field and request a separately accepted additive specification; do not silently widen `RequestContextV1` or invent a second preview authority.

## EXECUTION_DAG

### T01: Pin representation and prove the exact window mismatch

Depends on: none. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Original fixed D04: the first 8 KiB plus the last 8 KiB, UTF-8-safe, <=16 KiB total, exact omitted source byte count; current payload preview/`omittedBytes`/status/handle.

**Files and concrete edits:** Read `clipContextResult`/`encodeContextResult`, `deliverContextResult` and all preview consumers; extend existing context-results-v3 and context-contract-preservation-v6 tests only after exact toolchain setup.

**Operation and output:** Add an ASCII fixture with decisive sentinels at head bytes 8,180 through 8,192 and start of final 8,192 bytes. Expected source windows are fixed by requirement, not copied from marker arithmetic. Record existing omission rendering and decide whether existing metadata suffices; otherwise hold exact missing contract field.

**Positive, negative, cancellation and recovery checks:** Baseline must fail precise missing sentinel/window assertions, not setup. Complete shorter source is returned once. No new parser, dependency, retention or authority change.

**Done criterion:** Reproduction and approved representation use existing shape or explicit HOLD_CONTRACT_SHAPE; no cap increase.

### T02: Fix canonical bounded preview construction

Depends on: T01. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Exact 8,192-byte source windows, fatal UTF-8 boundary clipping, current inspection/storage caps and `omittedBytes` metadata.

**Files and concrete edits:** Modify only packages/core/context-results.ts preview construction in both the in-memory spill path and the streaming serialization path for results over 16 MiB, plus necessary existing presentation reader if T01 identifies one.

**Operation and output:** Replace marker-derived content bounds with specification bounds. Preserve full-result bytes/digest and storage unchanged. Make omission labeling external to bounded source preview using current metadata; do not count label bytes as retained source. Keep failure/unavailable labels honest and avoid duplicated overlap for short results.

**Positive, negative, cancellation and recovery checks:** ASCII results retain exact 8,192-byte windows; multibyte results clip only incomplete scalars at each boundary. Invalid UTF-8, unsupported accessors or proxies, oversized serialization and disk failure retain honest failure states without a fabricated handle. Cancellation or an owner change during spill returns no late bytes.

**Done criterion:** Both construction paths obey exact content windows and preview byte cap, with correct omitted bytes and no new authority.

### T03: Verify actual host response and compatibility

Depends on: T02. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Actual Service repository_read result, matching canonical range handle, foreign/expired/revoked owner and retained original full bytes.

**Files and concrete edits:** Extend tests/context-result-host.test.ts plus existing result/custody suites; inspect existing presentation assertions and replace only marker-dependent expectations with explicit metadata assertions.

**Operation and output:** Check the actual response preserves decisive first/tail sentinels and reports exact omission; range retrieval still returns original full bytes/digest. Confirm consumers show omission from metadata and never concatenate an unmarked gap as a complete result. If old marker consumers exist, implement a bounded compatible reader transition within accepted shape.

**Positive, negative, cancellation and recovery checks:** Small output is not duplicated, oversized previews stay within the cap, and authorized full retrieval returns exact bytes. Expired or foreign-owner reads remain unavailable. Ownership change during await returns no bytes. Restart/legacy records preserve old immutable bytes; no retained-handle invalidation.

**Done criterion:** Actual host response plus consumers meet fixed D04 without changing range/custody contracts.

### T04: Record focused evidence and rollback

Depends on: T03. Owner: one future implementation worker for the named paths; all other paths are read-only. Handoff: the next dependent task owner, with exact source and test receipts.

**Inputs and interfaces:** Exact failing baseline and passing candidate receipts and byte counts.

**Files and concrete edits:** M04 v6 requirements evidence under future authorized implementation; coordinate #1028 pure test matrix and M10 consumer owner.

**Operation and output:** Update fixed D04/D03 mapping, preserve historical tests and results, and keep the default flags false. Rollback affects preview formatting only and retains all full result artifacts and their original expiry/authority.

**Positive, negative, cancellation and recovery checks:** No consumer can read expired/foreign result after formatting change; rollback does not delete artifacts or enable experimental lanes.

**Done criterion:** Every mapped assertion has an observed result on the current source cut or an explicit hold; no broad M04 completion claim.

## VALIDATION

### Setup and command discipline

Observed audit environment: Node 24.22.3 satisfies `>=24.10.0`; provisioned pnpm 11.25.0 does not match required 10.30.3; there is no node_modules tree. `COREPACK_ENABLE_NETWORK=0 corepack pnpm --version` cannot resolve an already-provisioned 10.30.3. All current product test commands are NOT_RUN, reason HOLD_TOOLCHAIN. No package, toolchain or browser was downloaded and no repository file was modified. A missing dependency is an infrastructure hold, not an expected failing assertion.

Future executor must first record `git rev-parse --show-toplevel`, `git remote get-url origin`, `git status --porcelain=v1 --untracked-files=all`, `git branch --show-current`, `git worktree list --porcelain`, `git rev-parse HEAD`, `node --version` and `pnpm --version` separately. Read the then-current package.json, lockfile, consumed contracts and owner journal. Use installed matching pnpm or an already provisioned matching Corepack resolution. If neither exists, keep HOLD_TOOLCHAIN; no download is authorized by v6. Frozen existing-lockfile dependency setup is allowed only under the future implementation's setup authorization. Never substitute a different version or use --passWithNoTests.

Run required asset steps as separate observed commands before targeted tests: `pnpm build:credential-lease` and `pnpm build:widgets`. A platform incapable of the native build may execute a separately labeled pure targeted diagnostic but cannot substitute `test:no-lease` for the required `pnpm test` gate. After focused tests run, retain individual receipts for `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:browser`. Do not change timeout, skip, browser channel or expected assertion to hide a failure. Planned commands below were not executed in this audit.

Receipts name the immutable source SHA/tree, source and dependency blob hashes, Node/pnpm/OS/architecture/browser/native adapter, flag injection, exact command, start/end UTC, exit or cancellation, actual test case identities, passed/failed/skipped counts, and bounded artifact SHA-256. Preserve every baseline failure, cancellation, unknown settlement and unavailable cost. Platform-specific skips are declared individually and never fulfill required gates. Evidence integrity validation is separate from product acceptance.

### Focused commands

```sh
pnpm exec vitest run tests/context-results-v3.test.ts tests/context-contract-preservation-v6.test.ts tests/context-result-host.test.ts tests/context-result-custody.test.ts
pnpm typecheck
pnpm lint
```

### Acceptance matrix

| Requirement | Tasks | Required observable result |
|---|---|---|
| Fixed M04-D04, C04, D03 | T01, T02, T03 | Exact first and last 8,192-byte source windows; only UTF-8 clipping reduces content; preview at most 16,384 bytes; no short overlap. |
| S07, C02 | T02, T03 | Explicit exact omitted metadata; full bytes unchanged; spill failure honest; authority/expiry/range unchanged. |

### Release gates and rollback

HOLD_TOOLCHAIN now. If the existing consumers cannot represent a labeled gap without new fields, HOLD_CONTRACT_SHAPE applies only to that missing representation pending explicit additive specification. Never solve this by exceeding 16 KiB, reducing head/tail beyond UTF-8 boundary necessity, relaxing handle authority or copying a new result service.

## STATE

All T01 and later implementation tasks are NOT_STARTED. This audit performed source tracing, original-clause extraction, issue/PR body and discussion comparison, path/reference verification and clean-tree checks only. Product tests, Windows installed tests, live model calls and activation are NOT_RUN. Implementation scope and execution owners must be claimed in the canonical issue before future changes. Next step is T01 after coordinator publishes this complete plan and confirms current owner/source; blocked inputs are not guessed. Preserve ordinary working code, all native histories, accepted memory, tombstones and prior failed observations across rollback.

## REFERENCES

- [Pinned source](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b)
- [Parent audit and read-only scope](https://github.com/skytuhua-org/Gen-V1/issues/1992)
- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)
- [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md)
