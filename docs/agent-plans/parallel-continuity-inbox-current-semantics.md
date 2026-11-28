# INB02: Correct Inbox current-row semantics and retained-source provenance

## META

| Field | Value |
| --- | --- |
| Task / revision / date | INB02; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/2155 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | implementation; READY |
| Prerequisites | none |
| Original source | FRONTEND-INBOX-FOCUS-R1 at 0ccda0526baafe343bff33b72c7f103e600cc51e |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

Correct the Inbox row's current-state announcement from current page to current, while retaining native list/button semantics and complete provenance for the adapted Vespin source.

## REQUIREMENTS

Own parent IF-R02, source-custody portion of IF-R09 and A02. Selected row button renders aria-current='true'; unselected omits the attribute. Preserve data-current, labels/unread text, native button/list roles, tab behavior and existing focus-visible ring. Do not add a live region to compensate for semantics.

Only the current token and its tests/provenance change. No InboxView selection/dismissal, filtering, layout, keyboard mapping, read timer, action, transport or source-state changes. The unresolved #1712/#1752 automatic selection policy is outside scope and does not block this token correction.

Vespin upstream remains ReviewStage/vespin at7f0bfe954a958858235b91d82293043ab5541433, Apache-2.0, Copyright2026 Stage Inc. Retain original source hashes/ranges and unchanged LICENSE/NOTICE. Record the local semantic adaptation and new actual local hash in every affected provenance entry. Acquire no new upstream source.

Refresh parent/candidate/claim state and reproduce the old token before edits. Actual NVDA/VoiceOver announcement is INB06's gate; a markup assertion is not that observation.

## REPO_MAP

third-party/vespin/inbox-presentation.tsx renders InboxItemRow's native button with current ? 'page' : undefined. third-party/vespin/provenance.json has multiple source-range entries pointing to that same local TSX; all localSha256 values must change together. README.md explains the retained adaptation; add the exact local token correction there.

tests/inbox-presentation.test.ts has server-rendered current-row markup without action side effects. tests/e2e/inbox-controls.spec.ts has an existing aria-current='page' assertion in failed canonical navigation coverage; update only that assertion and add the bounded semantics case if needed. Shared spec imports/setup belong to a brief reservation with INB04/INB05.

## DESIGN

Use current ? 'true' : undefined on the existing button. The current row controls a detail reader, not page navigation. Do not replace the native element or add aria-selected/tablist/listbox semantics.

In static tests render current and noncurrent InboxItemRow independently. Assert exactly one current=true attribute for the current button, no aria-current for noncurrent, unchanged meaningful label/unread/native structure and no callback invocation. Browser case confirms selected/current mapping and existing keyboard focus ring remain, without selecting an alternative policy.

After final source bytes, calculate SHA-256 for inbox-presentation.tsx and update every provenance.files entry with that local path, preserving upstream sourceSha256/sourceRanges/source/commit/license/notice exactly. Append precise modification wording, not a replacement generic note. README records why true is used. No source inventory addition is required because these files already exist.

Rollback reverts the single semantic token/test/README/provenance changes consistently, without undoing independent #1712 or transport/error fixes.

## EXECUTION_DAG

1. T01: Read complete parent/current journal and actual vendored source/metadata; record baseline token and source pin. Reserve row token and exact spec assertion, not InboxView.
2. T02: Change the token and add owning positive/noncurrent static assertions; update existing browser page-token expectation while preserving surrounding action/failure assertions.
3. T03: Recompute local hash, update all affected provenance entries and README modification explanation; verify original hashes/ranges/LICENSE/NOTICE unchanged.
4. T04: Run focused checks, publish reviewed code/provenance/evidence to INB06, then release. Native announcements remain pending until observed.

## VALIDATION

Run pnpm exec vitest run tests/inbox-presentation.test.ts --maxWorkers=1; pnpm exec playwright test --config tests/e2e/inbox-controls.playwright.config.ts; pnpm typecheck. The unit file includes browser-backed transport regressions, so report missing browser support as a blocker rather than a fake pass. Run sha256sum third-party/vespin/inbox-presentation.tsx and compare all matching localSha256 fields; inspect git diff for LICENSE/NOTICE and upstream metadata to prove no change.

V01 current button has true, no page; noncurrent omits token. V02 native label/structure/unread text/callback behavior unchanged. V03 browser selection/current correspondence and visible focus survive. V04 every local hash matches final bytes, original source/ranges/license remain. V05 reviewed exact SHA is retrievable and native NVDA/VoiceOver status stays explicit. Tests listed are planned, not executed in this documentation session.

## STATE

PLANNED; READY for bounded token/provenance scope with finite shared-spec reservation. #1712's clear-vs-retain contradiction remains unresolved and unrelated to this change. No implementation/test result. First action T01; INB06 verifies actual assistive announcement on the integrated candidate. Main merge verification remains separate.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/0ccda0526baafe343bff33b72c7f103e600cc51e/docs/agent-plans/frontend-inbox-focus-continuation.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- Native recipient [INB06 #2276](https://github.com/skytuhua-org/Gen-V1/issues/2276); adjacent explicit dismissal [INB04 #2274](https://github.com/skytuhua-org/Gen-V1/issues/2274).
- [Selection-policy issue](https://github.com/skytuhua-org/Gen-V1/issues/1712), [candidate PR1752](https://github.com/skytuhua-org/Gen-V1/pull/1752), [canonical unmet cleanup](https://github.com/skytuhua-org/Gen-V1/issues/1712#issuecomment-7122835450).
