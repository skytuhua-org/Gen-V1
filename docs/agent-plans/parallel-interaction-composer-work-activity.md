# Animate only proven fresh WorkActivity items within their presentation owner

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-R1/CMP07, 2026-11-25. Parent: https://github.com/skytuhua-org/Gen-V1/issues/1188; coordination: https://github.com/skytuhua-org/Gen-V1/issues/2212. Verified baseline: main@defe9884530145e9c109b8ed98f80efac8beeb17. Planning branch: docs/frontend-parallel-work-packets. This leaf's implementation/runtime verification: NOT_STARTED/NOT_RUN; existing PR progress is recorded below. Provenance: complete published bluma-composer-supplement.md, current full parent journal, linked PR outcomes and baseline source. The parent is historical context; execute this leaf and its exact dependency outputs.

## OBJECTIVE

Implement the bounded WorkActivity portion of M6 using existing Message identities and proven fresh-arrival metadata. Restored, hidden, repeated or virtualized content must remain quiet.

## REQUIREMENTS

New proven items180ms/ui-item-in only while mounted; preserve stable Message.id keys and source text/copy. First render, restored data, owner change, inactive->active, snapshot/theme/policy and refreshed content do not replay. Reduced opacity<=80/no travel/delay; Off/panels-disabled none. No step count/progress inference, fake duration or runtime metadata. TaskHistory/UpdateControl unresolved M6 rows remain with CMP06 and cannot be declared completed by this leaf.

Preserve neutral themes, readable names, command/revision/grant owners, focus, selection, IME/keyCode229 and drafts. Motion never delays input or held controls. Effective tokens are consumed once; raw bases scale once. Reduced removes travel/stagger/shimmer with opacity<=80ms; Off/panels-disabled settle immediately, including live changes. No new dependencies, acquisition, schema, persistence, backend, telemetry, bounce, blur, permanent will-change or per-frame React geometry loop.

## REPO_MAP

Production scope: WorkActivity.tsx, .activity arrival selectors in styles.css and exact WorkActivity caller prop in App.tsx approved by CMP06. WorkbenchActivity/WorkbenchOutput/windowing and source-revision authority are read-only. Existing ordinary WorkActivity renders updates.map with Message.id. Retained output at>60updates or>300lines is a separate authoritative source view. Tests own only CMP07 activity cases in existing composer integration spec; App/CSS imports integrate through finite hunk queue.

## DESIGN

Consume CMP06 frozen optional arrival?:{ownerKey:string;active:boolean;freshIds:ReadonlySet<string>} and exact permitted caller. Undefined or unproven metadata means static. Existing updates:Message[] signature remains compatible. Seed a presentation-local seen set with current IDs at mount/owner change; on committed active updates, an unseen ID is eligible only when freshIds also contains it. Record it consumed before running an effect. Returning to an owner or reactivating a hidden surface reseeds existing IDs without replay. Never derive eligibility from array length or content changes.

Add a private data-activity-arrival token on newly eligible existing li nodes, once per actual message, preserving keys, Markdown and CopyButton. Duration180ms/ease-enter uses existing effective tokens; no stagger is added because M6 did not require it. Initial styles remain immediately readable under Reduced/Off; keyboard focus bypasses any hidden entrance. Cleanup or policy changes remove any local running effect/marker without replay, with no permanent will-change.

Do not animate each virtualized WorkbenchOutput row or recreate a source renderer. If CMP06 cannot prove safe same-owner transfer into/out of that retained view, keep that path static and M6 subset BLOCKED. Global status/progress and terminal output remain unchanged. Rollback removes only optional prop/presentation marker/CSS; no data migration.

## EXECUTION_DAG

Dependencies: [CMP06 #2254](https://github.com/skytuhua-org/Gen-V1/issues/2254). One owner per allocated file/hunk; retain adjacent owners.

1. T01 Verify CMP06 exact owner/arrival contract and App/test/CSS ACK. Positive: each fresh ID has proven source cause. Negative: null/unapproved contract blocks implementation rather than inferred local metadata. Done with immutable input.
2. T02 Add optional prop and local consume-once markers without changing Message keys/content. Positive: one new active Message180ms. Negative: first mount, same-ID edit, history prepend, rerender and A-B-A no animation. Done with native animation count.
3. T03 Preserve visibility/owner boundaries and static retained-output path. Positive: owner-thread copy/source identities unchanged. Negative: hidden->active or>60/>300 threshold switch cannot replay all rows. Done with owner/DOM/content tests.
4. T04 Cover real speeds/policies, focus and cleanup on update/unmount. Positive: Reduced short opacity, Off none. Negative: no hidden focused action, stale animation or terminal text motion. Run focused checks.
5. T05 Publish exact subset acceptance and unresolved M6 paths to CMP08; RELEASE. Do not mark TaskHistory/UpdateControl or generic M6 accepted without their separate contract.

## VALIDATION

pnpm exec playwright test --config tests/e2e/micro-motion.playwright.config.ts tests/e2e/composer-integration.spec.ts; pnpm exec vitest run tests/task-interface.test.ts --maxWorkers=1. Extend the existing synthetic App host with authoritative recorded metadata, no new product actions. Cases: baseline restored updates, one fresh item, identical snapshot, content replacement, earlier history, reorder, inactive/owner switch, visible selection/copy, threshold crossing into retained output and policy toggle mid-effect. Native snapshot equivalence from CMP06 is required; browser-only inference is insufficient.

Planned, NOT_RUN: full checkout at frozen SHA; Node>=24.10, pnpm10.30.3, pinned Bun; pnpm install --frozen-lockfile and actual browser channels named by config. Never substitute another browser for msedge. Build widgets where required. Run focused commands plus pnpm lint, pnpm typecheck, pnpm build and pnpm check:docs-links for touched scope. Compare failures at the same baseline; required Windows CI/review gates remain.

Visible acceptance uses paired synthetic1920x1080/30fps/H.264 with no added titles/captions/overlays. External manifest: scenario, baseline/candidate SHAs, browser/Windows build, theme, actual zoom, policy/speed, commands/counts, limits and verdict. Close contexts, inspect/redact and publish immutable resolving media, not profiles/raw traces. Check dark/light,narrow/short,actual100/125/150% app zoom, keyboard and live System/Reduced/Off/OS/panels-disabled. Browser zoom is not physical DPI; fixtures do not prove native packaging/provider success.

## STATE

NOT_STARTED/BLOCKED on CMP06 exact input contract. Only a proven subset can be implemented; missing item semantics elsewhere remain visible and prevent broad parent acceptance. No current product scope is taken from1203 without the acknowledged App hunk. Next T01.

Checkpoint each milestone or 20 minutes with key/SHA/tests/blockers/next owner. Stop requires read-back RELEASE OWNER=NONE and own-marker cleanup. Unmet gates remain BLOCKED/HANDOFF_PENDING; review, merge and main acceptance are distinct.

## REFERENCES

- Original complete source: https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-composer-supplement.md
- Parent/journal: https://github.com/skytuhua-org/Gen-V1/issues/1188
- Verified baseline/rules: https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17
- Ordinary activity source: https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/WorkActivity.tsx
- Retained output boundary: https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/WorkbenchActivity.tsx
