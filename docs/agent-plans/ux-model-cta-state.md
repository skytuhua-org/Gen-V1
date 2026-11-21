# UI: "Connect a model to start" CTA ignores run state

## META

- Feature: composer footer CTA "Connect a model to start" must reflect thread state — hidden while a run is active and reworded once a conversation exists.
- Repo: `skytuhua-org/Gen-V1`
- Plan revision: r1, 2026-11-21 (UTC)
- Baseline: `main` @ `8fa907f378127bcfc23d71b55c53625ffc43e8da` (verified `git rev-parse HEAD`)
- Size: small. Labels: `bug`, `ui`.
- Related, not duplicates: #1295 (empty workspace hero), #1131 (Linked PRs dead ends), #1132 (composer crowding) — none covers this caption.
- Implementation status: NOT_STARTED. Plan only; no app code changed.
- Provenance: observed live in the fixture app (`openReviewHost`, port 4317): after sending a message the model became `unavailable`; the caption kept reading "Connect a model to start" while the thread showed "Working…" with a Stop button, and it persists after the run completes on a thread that already has replies.

## OBJECTIVE

The composer caption is the thread's state line: it shows prediction controls when a suggestion exists, else the model-unavailable CTA. Today `unavailable` renders "Connect a model to start ›" in **every** state — while a run is active (composer already shows Working/Stop) and on threads with a full reply history where nothing needs "starting". The caption must not contradict the composer state above it, and its copy must fit the thread's lifecycle.

Success: while a run is active the caption shows no model CTA; on a thread with prior replies the CTA reads "Connect a model to reply ›"; on an empty draft thread it keeps "Connect a model to start ›". Keyboard/screen-reader users get the same state through the button's accessible name.

## REQUIREMENTS

| ID | Requirement |
| --- | --- |
| R1 | `unavailable` CTA is suppressed while the thread has an active run (`working` truthy, the same flag that switches the send button to Stop). No CTA flicker during a run that ends in `unavailable`: it may appear once the run settles. |
| R2 | Copy by lifecycle: empty thread (no assistant or user messages) → `Connect a model to start`; thread with ≥1 message → `Connect a model to reply`. Same `setup` click handler and `ChevronRight` 12px icon. |
| R3 | Prediction controls keep precedence: `prediction.candidate` still wins over the CTA (existing order unchanged). |
| R4 | Accessibility: button keeps an explicit accessible name matching its visible text; no `aria-hidden` divergence. Focus outline per existing button styles; focusable only when visible. |
| R5 | Out of scope: changing `unavailable` detection, the `setup` destination, send-button disabled copy ("Connect an available model in Settings to send."), or caption layout/animation. |

## REPO_MAP

| Location | Role |
| --- | --- |
| `apps/web/src/App.tsx` line ~452 | `.composer-caption` renders `prediction.candidate ? … : unavailable ? <button onClick={setup}>Connect a model to start</button> : null`. `working`, `unavailable`, `setup` are already in scope here; `thread`/message list is too. |
| `apps/web/src/App.tsx` line ~449 | `working` flag drives Stop/Queue buttons — reuse it for R1 gating. |
| `apps/web/src/app.css` (or composer css — DISCOVERY) | `.composer-caption` styles; add nothing new if existing classes cover it. |
| `tests/` (DISCOVERY: search `composer-caption` / "Connect a model") | Locate the UI guard tests that snapshot composer captions before editing. |

## DESIGN

Single-condition change, no new components.

- In the caption expression, replace `unavailable` with `unavailable && !working`.
- Button label: `thread` (or `messages`) has length > 0 → `Connect a model to reply`; else `Connect a model to start`. Compute `hasReplies` from the already-loaded conversation list in `App.tsx`; do not add a fetch.
- No new CSS. The button, icon and caption layout are unchanged; reduced-motion unaffected (no animation exists here).

## EXECUTION_DAG

- T01: Edit `apps/web/src/App.tsx` caption expression and label per DESIGN. done-when: with `unavailable && working`, no CTA renders; with `unavailable && !working`, label matches lifecycle. Tests: update/extend the composer caption UI test discovered in REPO_MAP; assert all three states (working, empty thread, replied thread).
- T02: Run `pnpm vitest run` on the touched test file(s) plus `pnpm lint apps/web/src/App.tsx` (or repo's lint script). done-when: green.

## VALIDATION

- Unit/component: three caption states above; regression: prediction.candidate still overrides CTA.
- Manual (fixture): `openReviewHost` on :4317, send a message in a thread whose model goes unavailable → no CTA during Working; after settle on a replied thread → "Connect a model to reply".
- Acceptance matrix: R1↔T01 working state; R2↔T01 label test + manual; R3↔prediction regression test; R4↔test asserting accessible name.

## STATE

- Researched: live DOM/screenshot evidence, `App.tsx` source, plan dedup vs #1295/#1131/#1132.
- Decided: gate on `working`; lifecycle-dependent copy.
- Not implemented; next step T01 (needs its own implementation claim).

## REFERENCES

- Fixture observation this session (built app, port 4317).
- `apps/web/src/App.tsx` at baseline 8fa907f3.
