# Reveal fresh message actions without replaying restored conversation content

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-R1/CMP03, 2026-11-25. Parent: https://github.com/skytuhua-org/Gen-V1/issues/1188; coordination: https://github.com/skytuhua-org/Gen-V1/issues/2212. Verified baseline: main@defe9884530145e9c109b8ed98f80efac8beeb17. Planning branch: docs/frontend-parallel-work-packets. This leaf's implementation/runtime verification: NOT_STARTED/NOT_RUN; existing PR progress is recorded below. Provenance: complete published bluma-composer-supplement.md, current full parent journal, linked PR outcomes and baseline source. The parent is historical context; execute this leaf and its exact dependency outputs.

## OBJECTIVE

Complete S4 fresh-message action feedback while preserving existing D1/D2/D8/D9/D11 behavior, source text, focus and quiet restore. New arrival is an existing owner-provided event, not component mount.

## REQUIREMENTS

Fresh message body180ms, action cluster180ms at+30ms only on data-arrival; hover actions120ms and keyboard-focus visibility immediate. Reduced fade<=80ms/no delay; Off/panels-disabled static. Prediction120ms only new suggestion; SentenceReveal120ms new prose only; pending tail900ms alternate retained/static Reduced; restored history and unchanged snapshots quiet. Never animate copied code or terminal text; no fake progress, new message metadata or runtime authority.

Preserve neutral themes, readable names, command/revision/grant owners, focus, selection, IME/keyCode229 and drafts. Motion never delays input or held controls. Effective tokens are consumed once; raw bases scale once. Reduced removes travel/stagger/shimmer with opacity<=80ms; Off/panels-disabled settle immediately, including live changes. No new dependencies, acquisition, schema, persistence, backend, telemetry, bounce, blur, permanent will-change or per-frame React geometry loop.

## REPO_MAP

Baseline App.tsx liveMessages and messageRows already supply data-arrival; selected-owner changes clear live sets. Main transcript CopyButton is within .message-content; canvas uses a direct child. styles.css owns hover/focus gates. Read AssistantProse/SentenceReveal/task-motion.css only; shared motion helpers and CopyButton stay under their existing owners. Reserve App message markup/bookkeeping only, excluding1203 banner/SendStop and continuity transcript-scroll hunks.

## DESIGN

Keep message IDs, content nodes and CopyButton instance stable. Proposed private presentation wrapper .message-action-cluster contains .message-action-entry around existing action buttons, with no role/tab stop/live region. Outer wrapper owns current hover120ms gate and immediate focus-within/touch visibility; inner wrapper owns the one fresh entry180ms,+30ms,ui-item-in. Move only the existing absolute positioning from direct CopyButton selectors to this wrapper; button contents/copy semantics unchanged. Keyboard focus bypasses any unfinished inner delay/hidden opacity immediately.

A presentation-local consumed-action-arrival set is seeded with existing message IDs on initial/owner restore and updated only from the same accepted fresh-arrival cause already feeding data-arrival. Record current source writer/readers before editing; do not infer fresh state from message count or DOM mount. A newly admitted message can animate once; re-render, theme, policy, filtering, copy state, selection or remount of an already consumed ID cannot replay. If current owner metadata cannot distinguish restored/loaded history from live arrival on a path, that path is BLOCKED until an acknowledged exact source contract exists; it must remain static meanwhile.

No changes to SentenceReveal or global task-motion are needed for this leaf. Their D8/D9/D11 existing behavior is regression evidence. Preserve source selection and parent reading continuity; wrappers add no semantic text. Roll back wrappers/local presentation set without touching message runtime.

## EXECUTION_DAG

Dependencies: none. One owner per allocated file/hunk; retain adjacent owners.

1. T01 Obtain App/message/test hunk ACK from1203 owner and transcript coordinator. Trace existing arrival writer to both browser and desktop snapshots and history load; record exact causal contract. Positive: fresh versus restore distinguished. Negative: mere new-to-component ID cannot establish arrival. Done with explicit path coverage or blocked path.
2. T02 Add the two private wrapper classes and one-shot entry bookkeeping only for proven paths. Positive: new body/action timings180/+30; negative: mounted restored content/static snapshots no effects. Done with per-message native animation counts.
3. T03 Preserve hover120/keyboard immediate/touch visibility and all names/copy/source selection. Positive: focused copy usable before delay. Negative: no hidden focused target, copied-code transform or replacement button. Done with focus/node identity checks.
4. T04 Extend fresh/restored/unchanged/theme/streaming fixtures and D8/D9/D11 regressions, including Reduced/Off/live toggle. Done when existing prose/prediction/pending behavior stays unchanged and no terminal text motion appears.
5. T05 Run scoped gates; publish exact allowed arrival source, candidate and rows to CMP08; RELEASE. Failed identity proof remains an explicit gate, not a widened runtime refactor.

## VALIDATION

pnpm exec playwright test --config tests/e2e/micro-motion.playwright.config.ts tests/e2e/composer-integration.spec.ts tests/e2e/composer-motion.spec.ts; pnpm test:browser --suite composer-prediction. Cases: fresh assistant/user, prepend old history, initial restore, thread A-B-A, background snapshot unchanged, edits to selected prose, code copy, keyboard focus during30ms delay, touch, full/reduced/off and real speeds. Verify no extra host calls or text changes. Original D1/D2/D8/D9/D11 remain independently row-evidenced in CMP08.

Planned, NOT_RUN: full checkout at frozen SHA; Node>=24.10, pnpm10.30.3, pinned Bun; pnpm install --frozen-lockfile and actual browser channels named by config. Never substitute another browser for msedge. Build widgets where required. Run focused commands plus pnpm lint, pnpm typecheck, pnpm build and pnpm check:docs-links for touched scope. Compare failures at the same baseline; required Windows CI/review gates remain.

Visible acceptance uses paired synthetic1920x1080/30fps/H.264 with no added titles/captions/overlays. External manifest: scenario, baseline/candidate SHAs, browser/Windows build, theme, actual zoom, policy/speed, commands/counts, limits and verdict. Close contexts, inspect/redact and publish immutable resolving media, not profiles/raw traces. Check dark/light,narrow/short,actual100/125/150% app zoom, keyboard and live System/Reduced/Off/OS/panels-disabled. Browser zoom is not physical DPI; fixtures do not prove native packaging/provider success.

## STATE

NOT_STARTED/BLOCKED for exact App owner allocation and arrival-source proof. This is missing rev-2 S4, not replacement of1203 B1/D5/D6/D10. Other disjoint tasks can proceed. Next T01; no editing shared task-motion or CopyButton.

Checkpoint each milestone or 20 minutes with key/SHA/tests/blockers/next owner. Stop requires read-back RELEASE OWNER=NONE and own-marker cleanup. Unmet gates remain BLOCKED/HANDOFF_PENDING; review, merge and main acceptance are distinct.

## REFERENCES

- Original complete source: https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-composer-supplement.md
- Parent/journal: https://github.com/skytuhua-org/Gen-V1/issues/1188
- Verified baseline/rules: https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17
- Rev-2 omission review: https://github.com/skytuhua-org/Gen-V1/pull/1203#pullrequestreview-5999946266
- Retained App owner: https://github.com/skytuhua-org/Gen-V1/issues/1188#issuecomment-7058630319
