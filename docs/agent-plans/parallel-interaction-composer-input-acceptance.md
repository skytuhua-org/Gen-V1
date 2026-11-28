# Verify composer identity through attachment exits and Send/Stop swaps

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-R1/CMP01, 2026-11-25. Parent: https://github.com/skytuhua-org/Gen-V1/issues/1188; coordination: https://github.com/skytuhua-org/Gen-V1/issues/2212. Verified baseline: main@defe9884530145e9c109b8ed98f80efac8beeb17. Planning branch: docs/frontend-parallel-work-packets. This leaf's implementation/runtime verification: NOT_STARTED/NOT_RUN; existing PR progress is recorded below. Provenance: complete published bluma-composer-supplement.md, current full parent journal, linked PR outcomes and baseline source. The parent is historical context; execute this leaf and its exact dependency outputs.

## OBJECTIVE

Accept the existing composer implementation for stable textarea/attachment/button identity and immediate commands. This packet tests substantial failure paths together because they share the real composer fixture and unreleased PR owner.

## REQUIREMENTS

D3-D6/M11; supplement R01-R04/R06-R08,A01-A04. Row base220/180ms, grid0fr/1fr+opacity, no delay; chip insert180ms/30ms stagger cap150, remove140ms. Same Send/Stop button, current action/name/disabled state immediate; icon80ms opacity+scale.9, Reduced opacity-only. No upload percentage/completion API exists. Preserve20MB validation, real upload error, retry, voice/prediction/references, owner isolation/acknowledgment, IME/caret/selection/draft. Terminal/TerminalExcerpt text never animates.

Preserve neutral themes, readable names, command/revision/grant owners, focus, selection, IME/keyCode229 and drafts. Motion never delays input or held controls. Effective tokens are consumed once; raw bases scale once. Reduced removes travel/stagger/shimmer with opacity<=80ms; Off/panels-disabled settle immediately, including live changes. No new dependencies, acquisition, schema, persistence, backend, telemetry, bounce, blur, permanent will-change or per-frame React geometry loop.

## REPO_MAP

Read-only candidate PR1203@c7428df080bef4d520c067a59aca28847d0dbb97, open/unmerged. devin-a-cloud-f4e3b6 remains unreleased at comment7058630319. Read ComposerAttachments.tsx, ComposerView.tsx, ComposerToolbar.tsx, composer-entry.css/composer-toolbar.css and PR App.tsx SendStopButton. Main factored presentation differs from old PR, so record exact rebased candidate files; do not transplant its App wholesale. #1420 also changes chips. Tests own only CMP01 describe blocks in named existing specs/configs.

## DESIGN

Output ComposerInputAcceptance with B/D row IDs, candidate/base SHA, DOM identity probes, current command payload/count, timing, policy/speed, result and missing-owner gate. Preserve PR1203's correction: arm row closing before a render can unmount the band; the same node stays open while leaving chips finish. States absent->opening->open->chip exit->row closing->absent. Re-add retargets live geometry and invalidates stale completion. Completion must check event target/property/generation; child/old transition events cannot delete re-added contents. Zero duration, cancel, unmount or live policy disable settles without waiting for suppressed events. Project-only resources do not create a band; restored content is settled.

Same button immediately routes current Send/Stop; at most current icon plus one outgoing inert/aria-hidden icon. Old animation completion cannot replace a new state. Hold effects while typing/IME/selection/voice and Send/Stop; dispatch must occur before finishing them. Outgoing interactive content is inert/accessibility-hidden; focus moves safely before hiding, single announcements. Failure preserves usable error/content/draft. Effective tokens already include speed; raw bases scale once. Do not change run ownership or persistence.

Production failures are handed to #1203 owner with exact reproduction and requested narrow fix. Read-only tests may proceed now; source changes require release/reassignment or explicit split ACK, including1420 chip overlap. No duplicate implementation branch.

## EXECUTION_DAG

Dependencies: none. One owner per allocated file/hunk; retain adjacent owners.

1. T01 Refresh complete current1203/1420 journals/heads and record the retained owner. Choose exact current-main plus owner-supplied candidate; reserve CMP01 test blocks. Positive: exact source version. Negative: old14/14 pass is not rebased acceptance. Done with SHA/row ledger.
2. T02 Add first/last/excerpt/project-only, upload failure, removal/re-add and reload/snapshot cases. Hold effects and deliver child/stale completion events. Positive: one live band/no residual gap. Negative: remount, stale removal or animated terminal text fails. Done with identity/geometry assertions.
3. T03 Exercise Send/Stop during held effects, repeated swap, disabled state and IME229; preserve voice/prediction/reference paths. Positive: same button/current label/immediate exact command. Negative: duplicate/delayed action, dropped caret/draft or two semantic buttons fails. Done with commands/identity evidence.
4. T04 Apply real settings speeds.75/1/1.25 and live System/Reduced/Off/OS/panels-disabled through snapshot publish/useAppearance. Positive: row snaps Reduced, icons opacity<=80, Off immediate. Negative: stranded exit/subscription/replay fails. Done with timing and cleanup records.
5. T05 Run gates; route demonstrated failures to original owner and publish PASS/FAIL/BLOCKED by row. RELEASE to CMP08 with exact evidence. Done as review when ledger complete, not as original feature acceptance if failures remain.

## VALIDATION

pnpm exec playwright test --config tests/e2e/frontend-refinement.playwright.config.ts tests/e2e/composer-app-refinement.spec.ts; pnpm exec playwright test --config tests/e2e/micro-motion.playwright.config.ts tests/e2e/composer-integration.spec.ts tests/e2e/composer-motion.spec.ts; pnpm test:browser --suite composer-press; pnpm test:browser --suite composer-prediction. Freeze source; keep synthetic resources/read-only labels, multiple owners and interrupted exits in fixtures. D7 is separately accepted after controls by CMP08, not duplicated here. Type/Send/Stop during active effects is required Windows evidence at final gate.

Planned, NOT_RUN: full checkout at frozen SHA; Node>=24.10, pnpm10.30.3, pinned Bun; pnpm install --frozen-lockfile and actual browser channels named by config. Never substitute another browser for msedge. Build widgets where required. Run focused commands plus pnpm lint, pnpm typecheck, pnpm build and pnpm check:docs-links for touched scope. Compare failures at the same baseline; required Windows CI/review gates remain.

Visible acceptance uses paired synthetic1920x1080/30fps/H.264 with no added titles/captions/overlays. External manifest: scenario, baseline/candidate SHAs, browser/Windows build, theme, actual zoom, policy/speed, commands/counts, limits and verdict. Close contexts, inspect/redact and publish immutable resolving media, not profiles/raw traces. Check dark/light,narrow/short,actual100/125/150% app zoom, keyboard and live System/Reduced/Off/OS/panels-disabled. Browser zoom is not physical DPI; fixtures do not prove native packaging/provider success.

## STATE

READY read-only verification, NOT_STARTED. PR1203 implemented B1/D5/D6/D10 historically and fixed row remount, but remains unmerged with unreleased owner; new gaps may not be implemented by this reviewer without ACK. Next T01. CMP02 can review different cases concurrently; serialize only shared test/import commits.

Checkpoint each milestone or 20 minutes with key/SHA/tests/blockers/next owner. Stop requires read-back RELEASE OWNER=NONE and own-marker cleanup. Unmet gates remain BLOCKED/HANDOFF_PENDING; review, merge and main acceptance are distinct.

## REFERENCES

- Original complete source: https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-composer-supplement.md
- Parent/journal: https://github.com/skytuhua-org/Gen-V1/issues/1188
- Verified baseline/rules: https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17
- Retained source owner: https://github.com/skytuhua-org/Gen-V1/issues/1188#issuecomment-7058630319
- Existing implementation: https://github.com/skytuhua-org/Gen-V1/pull/1203
- Chip overlap: https://github.com/skytuhua-org/Gen-V1/pull/1420
