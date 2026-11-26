# ART01: Reconcile W3 candidates and remaining artifact continuity gaps

## META

| Field | Value |
| --- | --- |
| Task / revision / date | ART01; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/1115 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | discovery; READY |
| Prerequisites | none |
| Original source | BLUMA-ARTIFACT-R1 at cd5860c647507b4b28be51f640bfeae9d447d021 |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

Produce one reviewed immutable gap matrix identifying which Tabs, disclosure and editable-record supplement behaviors are absent, already satisfied or integration-blocked. Each follow-up receives a reproducible missing outcome at a named commit, not permission to recreate an unmerged PR.

## REQUIREMENTS

Cover parent R01/R07/R08 and A01/A07. Preserve all original W3 and acceptance-r2 obligations. Only a reviewed candidate/gap appendix and its identical issue publication may change. No product fixes, merging, cherry-picking, closure, schema/catalog expansion or takeover.

Current #1152 is open/unmerged at 1da768e7c1ce7ea3e53126bbc208f63bbdf31365; stacked #1254 at 215d574a66288ed22d44cecb66de5db42400404a. Later W3 candidate b0dee7a1998089798fdb57ef3f146da1106492ef incorporates that ancestry and reports r2 T01-T05 complete. The four-lane frozen evidence SHA is dd9cf46b52ecc79b579a0a282948444ed6f7deaa. Historical tests are not current-main verification.

Retain original UI13 review queue, UI14 editable records, UI15 parameter controls, UI22 disclosure, UI23 factual table, UI24 chart, UI26 forms and UI29 context/usage. Their original eight-film and integrated 29-film/24-live-trial obligations stay with issue #1811, whose current canonical acceptance remains unmet. Refresh #2141 registry/action, #1970/#2015 schema, #2214 duration and #1811 lifecycle ownership.

## REPO_MAP

Compare apps/web/src/registry.tsx (Tabs), TaskDisclosure.tsx, InteractionTools.tsx (EditableTable/FieldControl), task-motion.tsx, task-interface.css, task-motion.css and interaction-tools.css. Tests: tests/e2e/tabs-identity.spec.ts, task-interface.spec.ts, interaction-tools.spec.ts and task-design-recording.spec.ts.

Original plan is docs/agent-plans/worker-3-forms-charts-shared-motion.md at fb0694b911d46afb837bc3dd6e43c5742b450a18. Acceptance-r2 is docs/agent-plans/worker-3-forms-charts-shared-motion-acceptance-r2.md at 8ad7387890cef5f52aeb925fc278ff53f78ac93c. The candidate appendix is a future output in the parent source, not an existing baseline file section. Temporary isolated comparisons do not mutate protected branches.

## DESIGN

Output columns: requirement ID, baseline observation, candidate SHA/observation, existing owner/PR, disposition, next leaf, exact reproducer, durable evidence URL. Dispositions: VERIFIED_EXISTING, GAP or BLOCKED. Source inspection alone is SOURCE_ONLY, never behavioral verification. A GAP identifies the smallest missing behavior.

Tabs matrix: full labels/14px status slots; 140ms pointer-only single-row indicator; immediate keyboard/restore/resize/wrap; <=1px alignment; stable unique ARIA pairs; duplicate-label no-write failure; retained control/draft/nested state. Disclosure: real pending/source-ready/error, dedup/retry, previous answers, retained region/followup DOM and IME. Records: typed/readonly controls, source/draft distinction, exact explicit changes payload, rejection retention. Map these to [ART02 #2259](https://github.com/skytuhua-org/Gen-V1/issues/2259), [ART03 #2260](https://github.com/skytuhua-org/Gen-V1/issues/2260), [ART04 #2261](https://github.com/skytuhua-org/Gen-V1/issues/2261).

Keep prior W3 specifics as retained-owner guardrails: effect cause consumed once and immediate lifecycle settle; UI13 drafts/receipt by item; UI14 64px desktop/67px narrow rows, 120/100ms dirty/clean emphasis; UI15 960:600 media and 600px container break; UI22 retained branches/real pending; UI23 immediate facts with 240ms accepted-cell emphasis; UI24 truthful missing/signed data and compact table; UI26 440px peer grid/retained Steps focus; UI29 intrinsic popup/source-bound receipts. Do not reassign these old implementations.

Missing commit/evidence blocks only affected rows with exact retrieval requirements. A follow-up may conclude VERIFIED_EXISTING with no product change. No data migration or rollback is needed.

## EXECUTION_DAG

1. T01: Read complete parent/original continuations/r2/#1811 journal and fresh PR metadata. Record base/candidate/merge/owner states separately. Done when no scope is inferred from issue status or silence.
2. T02: Reproduce Tabs/disclosure/records on pinned main and latest usable candidate in isolated checkouts. Run targeted suites and minimal synthetic cases; keep failures and environment blockers. Do not fix code.
3. T03: Fill every supplement requirement and original retained acceptance row. Attach exact GAP or VERIFIED_EXISTING handoffs and evidence, including the existing owner of eight/29/24 gates.
4. T04: Obtain frontend review of candidate choice and narrow hunk allocations. Publish/read back the complete appendix and immutable source; hand off accepted SHA/matrix to ART02-ART04 and release. This claim ends at the decision.

## VALIDATION

Use Node >=24.10.0, pnpm 10.30.3 and the existing lockfile. From each repo root: pnpm build:widgets; pnpm exec playwright test --config tests/e2e/tabs-identity.playwright.config.ts; pnpm exec playwright test --config tests/e2e/task-interface.playwright.config.ts; pnpm exec playwright test --config tests/e2e/clarity-review-parameters.playwright.config.ts. Record actual projects/counts and blockers, never substitute a missing native/browser channel silently.

V01 every R01-R08/A01-A07 has an owner or gap. V02 original eight surfaces/r2 T01-T06 and 29/24 gates remain mapped. V03 main/candidate/integration/native are distinct. V04 each GAP has a reproducible bounded recipient. V05 publication matches source and recipient ACK is durable. Product tests above are future work; native/live-provider/physical performance are NOT_RUN here.

## STATE

PLANNED; READY for read-only discovery. Existing W3 final release is #1811 comment 7104926319; cleanup 7122916244 keeps integrated acceptance unmet. First action: refresh #1115/#1811/candidate heads then T01. No product outcome was tested in this planning session. A new appendix path, if reviewer requests one, requires its source manifest entry but no runtime entry.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-artifact-continuity-supplement.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- [Candidate milestone](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7092025158), [frozen integration](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7094045078), [final release](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7104926319), [unmet acceptance](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7122916244).
- [PR1152](https://github.com/skytuhua-org/Gen-V1/pull/1152), [PR1254](https://github.com/skytuhua-org/Gen-V1/pull/1254).
