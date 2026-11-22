
# Plan: Map artifact "Send feedback request" leaves a stale confirmation and allows duplicate sends

## META
- Feature: generative map artifact footer action
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-21 (design fully specified — implementer makes no design choices)
- Baseline: main @ 8cc970fd667fbefebb2a77df2a829f880a132e54
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1651
- Status: planning complete, implementation NOT started
- Source: manual UX audit of built app served by `scripts/review-host.ts` on :4317

## OBJECTIVE
On the "Around Linden Park" map artifact: clicking "Send feedback request" on place A prints "Feedback requested for The Boathouse." After moving the carousel to place B (Lumen Coffee), that line still names the old place — it reads as if feedback was requested for Lumen Coffee. The button also stays enabled, so the user can spam sends for the same or another place with no sent/ack state. Success: the confirmation always names the currently selected place (or is replaced by a per-place sent state), and repeat sends are prevented while one is in flight or already confirmed.

## REQUIREMENTS
- In scope: the confirmation line must track the current selection (either clear it on selection change, or show a per-place sent state). Button: disabled + label "Request sent" for the place already confirmed; re-enabled for places not yet sent.
- Out of scope: backend deduplication, other artifact types.
- Motion: confirmation line fades in 150ms ease-out (match existing quiet-button/card motion); on selection change, a crossfade of the label text 120ms; respect prefers-reduced-motion (instant swap).

## REPO_MAP (verified)
- `apps/web/src/MapView.tsx` (~line 64): footer button calls `action.run(props.feedbackActionId, {...payload, pointId: point.id}).then(accepted => setFeedback('Feedback requested for ' + point.label))`. `setFeedback` stores a string, not keyed by `point.id`, and is never cleared on selection change → stale label + double-send.
- Line ~66: `parsed.data.source` details block (separate issue for the empty case).
- Discovery: confirm `action.run` resolves only on acceptance (see `mapActionPayload`, `artifact-inputs.ts`).

## DESIGN SPEC
- State: `sentFor: Set<point.id>` instead of a free-text `feedback` string. On accepted send, add `point.id`.
- Confirmation line: render "Feedback requested for <current selected label>." only when `sentFor` contains the currently selected `point.id`; hidden otherwise.
- Button: when `sentFor` contains selected id → `disabled`, label "Request sent" (keep `quiet` style, MessageSquare icon). While `action.busy` → "Sending request…" (existing).
- Typography/spacing unchanged: same 13px quiet button, same footer row, confirmation line keeps current style (small muted text under the footer).

## EXECUTION_DAG
- T01 (owner: implementer): Replace `feedback` string state with `sentFor` set in `MapView.tsx`; wire button label/disabled and the confirmation line per spec. Tests: vitest for the sent-state reducer/logic if extracted, else component-level Playwright: send on A → navigate to B → line hidden + button enabled; back to A → line shows A + button disabled. Done when all pass at :4317.

## VALIDATION
- `pnpm build`, review host :4317, fixture recording thread "Find a quiet café"; Playwright scenario above; reduced-motion media query check.
- vitest + Playwright only (repo has no jsdom/Testing Library).

## STATE
Researched + decided; nothing implemented. Next step: T01.
