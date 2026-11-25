# Sub-plan (optional): Model-drafted commit message and PR body (parent #1235 task T11)

## META
- Feature: Publish — optional model-drafted text for the commit message and PR body.
- Repo: skytuhua-org/Gen-V1. Parent issue: #1235 (plan `docs/agent-plans/thread-publish-pr.md` r1). This task is explicitly optional and last.
- Plan rev: r2 (2026-11-23). r1 → r2: folded the front-end review verdict's 8 pinned UI decisions into REQUIREMENTS/DESIGN (was a single undecided DAG row). Prior rev: `1235-t11-model-draft.md` @ `1f9466ab`.
- Baseline: `main` @ `1f9466ab3fde0713b42430d0e59e08f744637d52`.
- Status: NOT_STARTED. Depends on sub-issue T03–T05 (publish service) and T06 (`PublishReview.tsx`, open PR #1570). Defer implementation until after T10 lands.

## OBJECTIVE
Offer a model-drafted commit message and PR body as a suggestion the user must accept; the deterministic R5 template always runs first and is the default.

## REQUIREMENTS (from parent + review-pinned)
- R11: uses the thread's selected account/model in a tool-free request, like composer predictions. Shown as a suggestion; replaces the template text only after the user accepts it. Off unless the user turns it on.
- Security: no new egress; the request carries only what the review already shows.
- D1 (placement): the suggestion renders inside `PublishReview.tsx`, directly above the field it proposes — one suggestion block per field (Commit message, Pull request description). Not a third state of the sheet, not a toast.
- D2 (block structure): `.publish-suggestion` = `border:1px dashed --border; border-radius:8px; padding:8px 10px; display:grid; gap:6px; font-size:12px`. Header row: `Suggested by <model name>` (12px `--muted`) + right-aligned `Dismiss` ghost button. Body: the suggested text, mono 12px for commit message, 13px for PR body, `max-height:120px; overflow:auto`. Footer: `Use suggestion` (secondary button ≥32px).
- D3 (accept semantics, normative): `Use suggestion` replaces the field's current value and marks the field's border `--ok` for one `--ui-motion-status` (160ms) tick; the user can still edit after accepting. The suggestion NEVER writes into a field on its own — spec invariant the unit test asserts.
- D4 (loading/failure): while the model request is in flight, the block shows one line `Drafting a suggestion…` (12px `--muted`, static, no shimmer); on failure `Couldn't draft a suggestion.` + `Try again`. Timeout 20 s → same failure state.
- D5 (setting): new checkbox row `Suggest commit message and PR body` in Settings → the section that owns compose assistance (match `settings-inventory.ts` tuple registration); default OFF per R11; when off, zero suggestion UI renders (not hidden — absent).
- D6 (motion): suggestion block appears with list-insert 180ms `var(--ui-ease-enter)` opacity + 4px translate; on accept, block collapses opacity+height 140ms `var(--ui-motion-remove)`; reduced/off → instant.
- D7 (security copy): the block's header tooltip text: `Drafted from this thread's content. Nothing is sent until you publish.` (honest about egress — reuses the thread's selected model only).
- D8 (keyboard/SR): block announced via `role="status"` when it arrives; `Use suggestion`/`Dismiss`/`Try again` tabbable ≥32px.

## EXECUTION_DAG
| ID | Goal | Depends | Edits | Tests | Done when |
|---|---|---|---|---|---|
| T11 (optional) | Model-drafted message/body | T05, T06 | DISCOVERY: reuse the composer-prediction session owner (search `prediction` in `packages/core`); suggestion blocks in `apps/web/src/PublishReview.tsx` per D1–D8; setting row per D5 | Unit: the suggestion never enters fields without acceptance (D3); nothing is sent when the setting is off (D5); failure path shows `Couldn't draft a suggestion.` + `Try again` (D4) | spec + unit pass |

## VALIDATION
`pnpm typecheck`; unit tests; Playwright assertion that acceptance is required.

## STATE / HANDOFF
- Optional; safe to skip or defer. Claim on #1235 first; RELEASE checkpoint on stop.
- r2 closes the front-end review NEEDS-CHANGES (verdict UTC=2026-11-23T04:37Z): the previously undecided suggestion UI is now fully specified (D1–D8). Implementation still awaits T06/T10 landing.
