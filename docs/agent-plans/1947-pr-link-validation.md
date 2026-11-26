# Plan: Validate the "Link a pull request by number" form in the workspace panel

## META
- Feature: Client-side validation + confirmed feedback for the link-PR form
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-23 (design fully specified — implementer makes no design choices)
- Baseline: main @ 19e6c7a789ae85f3314ee652d4dceefaff102999
- Status: plan only, not implemented
- Source: interactive QA of the built fixture app on :4317 (workspace panel, "Pull request" surface)

## OBJECTIVE
The link-PR form in `apps/web/src/WorkspaceSurfaceBody.tsx` (the `.pr-link-form` inside `PullRequestsBody`) submits raw text through `Number(captured.link)` with no client-side validation. `type="number"` inputs accept characters like `e`, `+`, `-`, and `.`, so `Number('e')` produces `NaN`, which reaches the server (`apps/server/workspace-routes.ts`, `link-pr` handler) and fails with a raw API error instead of a purposeful message. On success the field clears silently — nothing confirms which PR was linked.

**Measurable success:** an invalid entry can never produce a network request or a raw error; the user sees a precise inline message. A successful link produces a visible, announced confirmation.

## REQUIREMENTS

### In scope
1. Reject non-integer, non-positive, empty, and out-of-range input **before** `perform` is called, with an inline message under the input.
2. Announce success after a link completes.
3. Keep server-side validation as the final authority; the client message is a first-pass filter.

### Out of scope
- Changes to the server `link-pr` handler or its schema.
- The draft-PR form, review form, or any other workspace surface.

### Validation rules (exact)
The only valid submission is a base-10 integer in `[1, 2_147_483_647]` (Postgres int4 range). Validation runs on submit and on `blur` when the field is non-empty:

| Input | Result |
|---|---|
| `''` | Button already disabled; on submit do nothing (current behavior). |
| `'abc'`, `'1e5'`, `'1.5'`, `'-3'`, `'0'`, `' 12 '`, `'12x'` | Inline error, no request. |
| `'2147483648'` | Inline error "number too large", no request. |
| `'12'` | Submit. |

### Copy (exact, no alternatives)
- Invalid entry message, `role="alert"` in a `<p className="error-text">` placed directly under the form: `Enter a pull request number, for example 12.` — same sentence for every invalid value, including overflow.
- Success confirmation: after `load()` resolves, render `<p className="panel-note" role="status">Linked pull request #N.</p>` for 5 s, then remove it (timer, no fade needed — this app uses instant note dismissal elsewhere).
- Server-failure path unchanged: the existing `{error}` `<p className="error-text" role="status">` shows the server message.

### States
- `ready=false`: input and button already `disabled`; no change.
- `busy`: button disabled; validation error stays visible while busy.
- `saved.pending` truthy: unchanged (existing recovery notice takes precedence).
- Validation error clears the moment `onChange` produces a value that parses as a valid integer — validate on input-change only to *clear*, never to *show*.

### Keyboard / a11y
- Error `<p role="alert">` is announced on appearance (assertive) — no focus move.
- Success `<p role="status">` is politely announced — no focus move.
- Keep `required` and `min="1"` on the input (harmless hints); do not add `pattern` (incompatible with type=number).
- Label text unchanged: `Link a pull request by number`.

### Motion
- No animation on the error or success note (matches existing instant `.error-text`/`.panel-note` appearance). `prefers-reduced-motion`: no special handling needed since nothing animates.

## REPO_MAP (verified)
- `apps/web/src/WorkspaceSurfaceBody.tsx:156` — the `.pr-link-form`: `<input type="number" min="1" required placeholder="e.g. 12">` + `<button>Link</button>`; submit calls `perform(async()=>{ await action('link-pr',{number:Number(captured.link)}); await journalCompareAndSwap(...); await load(); })`.
- `apps/web/src/WorkspaceSurfaceBody.tsx:143` — `perform(work)` wraps errors into `setError` (renders at line 153 as `<p className="error-text" role="status">`).
- `apps/server/workspace-routes.ts:143` — `link-pr` handler: `z.number().int().positive().parse(p.number)` then `github.details(...)`; NaN or non-integer throws ZodError → raw API error text.
- `apps/web/src/WorkspaceSurfaceBody.tsx:28` — `message(error)` fallback copy.

## DESIGN
1. Add local state `linkError: string` (default `''`) and `linkConfirmed: number | null` (default `null`) in `PullRequestsBody`.
2. Helper `validateLink(raw: string): number | null`: `const trimmed = raw.trim(); if (!/^\d{1,10}$/.test(trimmed)) return null; const n = Number(trimmed); return n >= 1 && n <= 2147483647 ? n : null;`
3. Submit handler: `const n = validateLink(latest.current.link); if (n === null) { setLinkError('Enter a pull request number, for example 12.'); return; } setLinkError(''); void perform(async()=>{ await action('link-pr',{number:n}); ...; setLinkConfirmed(n); })`.
4. `onChange`: `update({link:event.target.value}); if (linkError && validateLink(event.target.value) !== null) setLinkError('');`
5. `onBlur`: if `saved.link.trim()` non-empty and `validateLink` returns null, show the same message.
6. Success timer: `useEffect` on `linkConfirmed` sets a `setTimeout(() => setLinkConfirmed(null), 5000)`; cleanup on unmount/re-trigger.
7. Render `{linkError && <p className="error-text" role="alert">{linkError}</p>}` and `{linkConfirmed !== null && <p className="panel-note" role="status">{`Linked pull request #${linkConfirmed}.`}</p>}` directly after the `</form>`.

## EXECUTION_DAG
- **T01** — Add `linkError`/`linkConfirmed` state, `validateLink` helper, and wire submit/change/blur in `PullRequestsBody` (`apps/web/src/WorkspaceSurfaceBody.tsx`). Done when: invalid inputs show the exact message without a request; valid submits proceed.
- **T02** — Render the success note with the 5 s timeout. Done when: after a successful link the note announces once and disappears.
- **T03** — Tests (see VALIDATION). Done when: new vitest cases pass.

## VALIDATION
Fixture repro (run before and after):
```
pnpm --filter @genv1/web build && node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"
```
Then open http://127.0.0.1:4317 → a thread with a connected project → workspace "Pull request" surface → link form.

Planned tests (vitest, existing conventions — no jsdom/Testing Library; unit-test `validateLink` plus a Playwright check if a browser test harness for this surface exists):
- `validateLink('12') === 12`; `('1e5'), ('1.5'), ('-3'), ('0'), ('abc'), ('2147483648'), (' 12 ')` → `null`.
- Browser check: type `99999` → Link → server error displays (existing behavior, unchanged); type `1e5` → Link → inline message, no request (assert no POST by watching network or by the absence of a busy state).

## STATE
- Researched/decided: this plan. Implemented: nothing. Verified: none.
- Next step: T01 by the implementing worker; read the full issue body before starting.

## REFERENCES
- Existing related fix for the same "dead-end" copy family: #1560 (connect-folder notice) — copy tone (`panel-note`/`error-text`, imperative sentence) must match it.
- APG: input error announcements use `role="alert"`.
