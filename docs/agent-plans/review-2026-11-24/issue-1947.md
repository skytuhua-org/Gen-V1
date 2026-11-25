# Current complete execution revision for #1947

## META

Repository skytuhua-org/Gen-V1; revision `1947-metadata-r2-2026-11-24`; current reviewed baseline main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b. The complete earlier rev1 plan is retained verbatim below. This revision corrects its obsolete implementation status and makes its unresolved contradictions explicit without accepting an implementation choice on the owner's behalf. Product ownership remains with the existing issue/PR owner. Parent metadata coordination is [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803).

## OBJECTIVE and REQUIREMENTS

Keep the full original objective, input bounds, submit/blur behavior, exact error/success accessibility, five-second confirmation, server authority and scope exclusions. Client validation must prevent invalid network submissions and truthfully report successful linking. No server or unrelated workspace changes are authorized by this revision.

Two requirements need owner resolution before affected acceptance can pass. The original validation table and unit cases reject whitespace-padded ` 12 `, while the DESIGN helper trims it and accepts 12. The table also describes an overflow-specific “number too large” message while the exact-copy section requires the same generic sentence for every invalid value, including overflow. These are contradictory inputs, not evidence that one may be silently discarded. Preserve both alternatives in this complete record; the owner records the selected behavior in the full plan and mirrored file before T01/T03 acceptance is closed.

## REPO_MAP and DESIGN

Verified source owners are `apps/web/src/WorkspaceSurfaceBody.tsx` (PullRequestsBody form and perform boundary) and `apps/server/workspace-routes.ts` (unchanged server authority). Existing [PR #2092](https://github.com/skytuhua-org/Gen-V1/pull/2092) adds `tests/workspace-link-validation.test.ts` and the frontend helper. The producer [checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/1947#issuecomment-7124551745) reports trim-first behavior and two passing unit tests. That proves which option the candidate chose, not acceptance of the conflicting requirement. The current PR audit records head `a5c6c3551c9be46053afc1849f06de93e6408166`; the producer's earlier test receipt belongs to `09eeaf5a` and is not automatically transferred to a later head.

Keep the existing draft recovery/generation checks, disabled readiness/busy states, server error path and no-focus-move behavior. Resolve the two policy choices above before rewriting the helper or expected table. A browser number input may normalize user text; inspect both direct helper values and actual input behavior so a passing helper test does not overclaim the user path.

## EXECUTION_DAG

| Task | Dependencies and inputs | Exact work and outputs | Owner boundary | Positive/negative tests and done-when | Handoff |
| --- | --- | --- | --- | --- | --- |
| T01 | Current full plan, source and #2092; owner decision for padded digits and overflow copy | Reconcile the existing helper, submit/change/blur paths and all accepted rule rows in WorkspaceSurfaceBody; no duplicate implementation branch | Existing frontend owner; server validation remains outside scope | Each invalid class makes zero perform/network calls; valid 1, 12 and maximum submit; boundary overflow fails; padded input follows the recorded decision; blocked/busy/recovery gates survive | Exact source SHA and decision/table diff to T02/T03 owner |
| T02 | T01 contract, existing success path and reload result | Retain or correct five-second role=status confirmation and timer cleanup in the same component | Same frontend owner, serialized with T01 | Successful load announces the linked number once; failure does not announce success; retrigger/unmount cancels old timers; no focus move | Frozen candidate and timer evidence to T03 |
| T03 | T01/T02 candidate and resolved policy | Extend the existing unit file plus the actual supported scoped browser fixture found by reading tests/e2e configurations | Verifier may inspect in parallel only on a fixed head; original author retains source custody | Replay every exact original validation value, both numeric bounds, blur/change behavior, alert/status roles, request suppression and existing server error. Record actual browser behavior separately from unit evidence | Reviewer receives exact-head results, remaining platform checks and canonical accepted table; normal CI/review/merge followed by main verification |

Requirement mapping: all original validation-rule rows and copy/state/keyboard requirements map to T01 + T03; success confirmation/timing maps to T02 + T03; scope, motion and unchanged server behavior apply to every task and the full diff review. Original examples, commands and exclusions remain below.

## VALIDATION

Producer reports `npx vitest run tests/workspace-link-validation.test.ts` 2/2, TypeScript and UI-lint passes at its named checkpoint; optional browser and local bun checks were not run there. This metadata review executed source/journal/PR inspection and document checks only. Re-run the focused unit test and relevant `pnpm typecheck`, `pnpm build` and scoped browser checks on the reviewed exact candidate where needed. Preserve the original fixture instructions. Capture platform, dependency versions, fixture, head and each outcome. CI queued, open PR and producer claims remain distinct from verified acceptance on main.

## STATE

T01 implementation exists but whitespace/overflow-copy acceptance is BLOCKED on the explicit owner choices. T02 is reported implemented, review pending. T03 has producer unit evidence; conflicting criteria and exact-head/browser evidence remain open. First action: reviewer/owner reads #2092 and the two contradictory original rule sets, records accepted resolutions without changing other requirements, then checks the existing branch. No issue closure is justified. No feature claim is transferred by this metadata revision.

## REFERENCES

- [Full issue/journal](https://github.com/skytuhua-org/Gen-V1/issues/1947)
- [Producer checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/1947#issuecomment-7124551745)
- [Existing PR](https://github.com/skytuhua-org/Gen-V1/pull/2092)
- [Pinned form source](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/WorkspaceSurfaceBody.tsx)
- [Pinned server authority](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/server/workspace-routes.ts)
- [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md)

Publication guard: expected previous canonical body SHA256 `b3571929cf93384949e39a3425118b9030a5c7ca778e93ba343db5cd8f812b5b`. Publish the identical complete file through existing #1994 before any guarded body replacement; reconcile concurrent changes rather than overwriting them.

## Retained complete original plan

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
