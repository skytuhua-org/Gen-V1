# Resolve the shared-popover candidate and integration contract

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-R1/CTL01, 2026-11-25. Parent: https://github.com/skytuhua-org/Gen-V1/issues/1186; coordination: https://github.com/skytuhua-org/Gen-V1/issues/2212. Verified baseline: main@defe9884530145e9c109b8ed98f80efac8beeb17. Planning branch: docs/frontend-parallel-work-packets. Product implementation and this leaf's runtime verification: NOT_STARTED/NOT_RUN. Provenance: complete published bluma-shared-controls-supplement.md, current full parent journal, linked PR outcomes and baseline source. This leaf is executable with its exact dependency outputs; the parent retains historical context.

## OBJECTIVE

Produce one reproducible, acknowledged integration record for the competing shared-popover PRs and the opening-origin change. This is a real adoption decision: downstream workers need an exact canonical stylesheet, branch and allowed hunks. A preferred review is not authorization to merge or close another PR.

## REQUIREMENTS

Preserve original #1186 A1-A8/T01-T02 and supplement R01-R09/A01-A11. #1199 and #1195 are competing implementations, not two changes to apply. Retain main's current-form reset and natural Tab/Shift+Tab fixes. Resolve #1420 origin/chip overlap before editing Popover. Preserve #2085/#2094 model-picker presence as a separate outcome. An unresolved owner or candidate choice is an explicit BLOCKED output, never an inferred release.

Preserve neutral themes, readable names, command/revision/grant owners, focus, selection, IME/keyCode229 and drafts. Motion never delays input or held controls. Effective tokens are consumed once; raw bases scale once. Reduced removes travel/stagger/shimmer with opacity<=80ms; Off/panels-disabled settle immediately, including live changes. No new dependencies, acquisition, schema, persistence, backend, telemetry, blur, permanent will-change or per-frame React geometry loop. The no-bounce amendment applies only to the ActionMenu/Select pilot; candidate selection must preserve original A7's 200ms model-picker/planning check spring outside that pilot.

## REPO_MAP

Read-only: packages/ui-shell/Popover.tsx, overlay-position.ts, ActionMenu.tsx, Select.tsx, list-navigation.ts, tokens.css, controls.css; apps/web/src/model-picker.css and current consumers; tests/ui-shell-overlay.test.ts, action-menu-tab.test.ts and existing controls/overlay fixtures. popover-motion.css exists only in #1199 at the inspected heads. Verified main is defe9884530145e9c109b8ed98f80efac8beeb17.

## DESIGN

Produce a versioned ControlIntegrationRecord in this leaf's issue journal or committed evidence Markdown with fields baseSha; candidates[{pr,head,status,changedFiles,criterionResults}]; selected{pr,head,stylesheet}|null; origin{pr:1420,head,attribute:'data-motion-origin',values:['pointer','keyboard'],integrationCommit}|null; currentFixes{formResetCommit,tabEvidence}; allocations[{worker,paths,symbols,ackUrl}]; residuals[{originalId,state,ownerIssue,ownerPr,requiredCheck}]. No public product API is added.

At read time #1199 is open at f8cb8c797c75ec963d04bf0027cc2ec33ebc74d9 with explicit opt-in and separate CSS; #1195 is open at bf6fdc26ef3d7f5552cad301ae45014a3ffd7e9f with global Popover opt-in/tokens.css. #1420 is open at cd8ea7d55d4d4b89f88675f4d5e888686754371a with ownerDocument modality/data-motion-origin. #2007 is merged at273b3384d533ab9358abde8f4b22a5fc6bd013bb and its reset change is on main. Refresh all before output.

Freeze the downstream private seam: .ui-control-popup keeps its existing semantic owner; measured --ui-control-origin-x/y are CSS lengths; data-motion-origin is classified once per opening; data-panel-animations=false is copied from the trigger owner. CTL02 owns Popover/origin/canonical surface rules; CTL03 owns ActionMenu/Select row/check rules in controls.css. CTL04 owns review of retained original consumer work. These scopes can proceed concurrently after the record without inventing a global stylesheet owner.

## EXECUTION_DAG

Dependencies: none. One owner per allocated file/hunk; retain adjacent owners.

1. T01 Refresh full current child/parent journals and exact1199/1195/1420 PR diffs/reviews/heads. Input the heads above; output a SHA table. Positive: each reported behavior has a source/test location. Negative: a merge_commit_sha on an open PR is not a completed merge. Done when all states are evidenced.
2. T02 Compare original consumer list, A1-A8 and supplement amendments criterion by criterion. Inspect model-picker missing stagger/check timing and toast/item exit vectors. Output satisfied/missing/regressed, including old form reset versus main. Negative: historical fixture passes do not accept current rebases. Done with no unmapped row.
3. T03 Obtain explicit branch/owner selection or record the exact unresolved decision and responsible maintainer. Allocate shared Popover/origin and CSS hunks with #1302/#1420; no source edit. Positive: ACK permalinks. Negative: silence never grants scope. Done when selected is acknowledged or deliberately null/BLOCKED.
4. T04 Publish/read back the complete record, pinned comparison and criterion matrix, then RELEASE this discovery scope. Hand CTL02/CTL03/CTL04 the exact record. Acceptance is the reproducible decision or blocked disposition, not feature completion or PR closure.

## VALIDATION

Read-only commands: git show <base>:AGENTS.md; git diff <base>...<candidate> -- packages/ui-shell apps/web/src/model-picker.css; rg -n 'data-popover-motion|ui-popover|ui-check-in|ui-toast-out|ui-item-out|button.*active' packages/ui-shell apps/web/src. Use accessible PR APIs for latest states/comments. Check both positive candidate coverage and negative stale-main regressions. No application install/test is needed for this discovery. Runtime and visual acceptance remain in downstream leaves.

Product setup and runtime checks are intentionally NOT_RUN; this leaf validates source/decision evidence only.

Acceptance: complete immutable decision record and requirement coverage; no claim of implementation acceptance.

## STATE

NOT_STARTED product adoption; discovery READY. Existing implementation PRs and independent claims remain. #1186 review favored1199, but no canonical selection/merge authorization was recorded. Original implementer release: comment7048828684; later review release7058857438. No production paths are owned by this leaf. Next: T01, then deliver the exact record; unresolved selection keeps downstream edits blocked.

Checkpoint each milestone or 20 minutes with key/SHA/tests/blockers/next owner. Stop requires read-back RELEASE OWNER=NONE and own-marker cleanup. Unmet gates remain BLOCKED/HANDOFF_PENDING; review, merge and main acceptance are distinct.

## REFERENCES

- Complete original: https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-shared-controls-supplement.md
- Current parent/journal: https://github.com/skytuhua-org/Gen-V1/issues/1186
- Rules/baseline: https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17
- Candidate PRs: https://github.com/skytuhua-org/Gen-V1/pull/1199 , https://github.com/skytuhua-org/Gen-V1/pull/1195 , https://github.com/skytuhua-org/Gen-V1/pull/1420
