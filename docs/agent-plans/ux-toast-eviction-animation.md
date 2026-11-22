## UX: A 4th toast evicts the oldest instantly — no exit animation, no overflow cue

### META
- Repo: skytuhua-org/Gen-V1 — baseline `main` @2640b897 (docs-only plan, rev 1, 2026-11-22)
- Found during interactive QA of the built fixture app on :4317 (pass 10: toasts)
- Status: plan only, not implemented; small polish fix

### OBJECTIVE
`packages/ui-shell/Toast.tsx` caps the stack at `MAX_VISIBLE = 3`. When a 4th toast is pushed, the oldest item is dropped from the list *in the same frame* — it vanishes with no `ui-toast-out` exit animation, unlike every other dismissal path (timeout, X button, action click all animate out via `leaving → remove`). A toast mid-read disappearing in a single frame is the only abrupt transition in the notification surface.

**Observed (code + live):** `Toast.tsx` trims `items` to the newest 3 synchronously on push; the evicted item never passes through its `data-state="closed"` path, so the 160ms `ui-toast-out` animation never runs. Verified in code and by pushing 4 settle/unsettle toasts on :4317.

### REQUIREMENTS
- In scope: `packages/ui-shell/Toast.tsx` queue handling only.
- Out of scope: copy, tones, timing (`VISIBLE_MS` 6000), dedupe-by-message, hover/focus pause, aria roles — all verified correct in this pass and untouched.
- Eviction must look identical to a manual dismissal; reduced-motion keeps the existing fade substitution; no new tokens or colors.

### REPO_MAP (verified)
- Queue + `MAX_VISIBLE` + `leaving` state machine: `packages/ui-shell/Toast.tsx`.
- Enter/exit keyframes + reduced-motion fade fallback: `packages/ui-shell/feedback.css` `:30-32` and `@media (prefers-reduced-motion: reduce)` ~:120.
- Trigger sites exercising the queue: `apps/web/src` sidebar settle/unsettle, copy failure, pluginCatalog error, "already open", "Drag an existing thread…".

### DESIGN
1. Route overflow eviction through the same `leaving` path as other dismissals: when a push exceeds `MAX_VISIBLE`, mark the oldest *visible* item `leaving` (playing `ui-toast-out`) instead of splicing it immediately; remove it on animation end using the existing removal timer, exactly as a timed-out toast is removed.
2. While an eviction is animating out, the 4th toast is already mounted below it (the stack may transiently show 4 items for ≤160ms — correct, matches dismissal). Do not let an already-`leaving` item be re-counted toward `MAX_VISIBLE`.
3. If items are evicted faster than exits complete (e.g. 6 rapid pushes), each evicted item still plays its exit; hard-remove only if a second eviction would target the same `leaving` item — then remove it immediately (FIFO of exits, no pile-up of timers).
4. Reduced motion: unchanged — the `@media` rule already swaps `ui-toast-out` for `ui-feedback-fade` at `var(--ui-motion-press)`; evicted items inherit it.

### EXECUTION_DAG
- T01 Implement eviction-through-`leaving` per DESIGN in `Toast.tsx`; extend the component's existing test (vitest; follow the repo's current Toast test if present, else a focused unit test on the queue reducer) to assert the evicted item enters `leaving` then unmounts.

### VALIDATION
- On :4317: trigger 4+ toasts quickly (settle/unsettle threads) — oldest animates out identically to a dismissal; stack never jumps.
- `emulateMedia reducedMotion` (Playwright) → evicted item fades at `--ui-motion-press`, no transform.
- `pnpm typecheck`, `pnpm lint`, toast unit test green.

### STATE
Researched + designed; nothing implemented. Next: implementer claims the issue, executes T01.

### REFERENCES
- `packages/ui-shell/Toast.tsx` (`MAX_VISIBLE`, `leaving`); `packages/ui-shell/feedback.css` toast keyframes + reduced-motion block.
