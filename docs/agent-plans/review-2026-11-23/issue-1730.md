[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1730.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1730](https://github.com/skytuhua-org/Gen-V1/issues/1730). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Granted-resource deduplication/revoke work is retained in [#1810](https://github.com/skytuhua-org/Gen-V1/pull/1810); [#1805](https://github.com/skytuhua-org/Gen-V1/pull/1805) is a closed duplicate. Authority and revoke behavior remain pending integration.

### Reviewed implementation references

- [PR #1810](https://github.com/skytuhua-org/Gen-V1/pull/1810): open; head `1d97e2c27338f7f49d33b3e3cf419028efd43fc6`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7091759231](https://github.com/skytuhua-org/Gen-V1/issues/1730#issuecomment-7091759231). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

# Plan: Deduplicate granted resources and add a revoke control

## META
- Feature: Granted resources list — dedupe identical grants and add per-item Revoke
- Repo: skytuhua-org/Gen-V1
- Plan revision: rev1, 2026-11-22
- Baseline: main @ bffae7ff
- Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1730 (rev1 body = this document)
- Plan-file PR: https://github.com/skytuhua-org/Gen-V1/pull/1727
- Status: planned, not implemented
- Source: QA pass 13 (fixture :4317): Settings → General → Granted resources shows `agreement.pdf` three times (once per thread sharing the grant) with identical rows and no way to revoke any of them.

## OBJECTIVE
The Granted resources list shows each granted resource once, labeled with the threads it applies to, and gives the user a working Revoke affordance per resource. Success: no two rows describe the same resource, and Revoke removes the grant and updates the list without a reload.

## REQUIREMENTS
- Scope: the "Granted resources" settings-card in the General section (component rendering `grants` — find it in T01; the fixture grants 8 items, `agreement.pdf` appearing for threads signing/catalog/shell per scripts/review-host.ts); backend revoke command if missing.
- List rendering: group grants by resource identity (path/URI). One row per unique resource: name (`agreement.pdf`) 14px/500 `var(--text)`; meta line 13px `var(--muted)`: `Granted to 3 threads` when count > 1, `Granted to Sign the service agreement` when 1 (thread title, truncated with ellipsis at 40ch). Scope chip (existing pattern) retained.
- Revoke control: each row gets a trailing `Revoke` button, `.secondary` class, 12px, min-height 32px, padding `4px 10px`. Click → optimistic row removal with `aria-busy` while the revoke command runs; failure → row returns and inline error text `Could not revoke — try again.` 12px `var(--danger)` replaces the meta line.
- Empty state after revoking all: `No granted resources.` 13px `var(--muted)` (reuse existing empty-state pattern).
- Keyboard: Revoke is a normal `<button>` in tab order; focus moves to the next row's Revoke (or the section heading if list empties) after removal.
- Screen reader: row removal announced via the existing live region pattern (`role="status"`); Revoke button `aria-label="Revoke {resource name}"`.
- Motion: removed row fades + collapses over 160ms ease-out (`opacity`, `max-height`); under `prefers-reduced-motion: reduce` removal is instant. No other animation.
- Out of scope: re-granting UI, bulk revoke, editing scopes.
- Ordering: alphabetical by resource name, case-insensitive (stable, deterministic).

## REPO_MAP
- `scripts/review-host.ts` — fixture grants (`agreement.pdf` shared by signing/catalog/shell threads; 8 grants total, diagnostics line "8 grants").
- Grant list component: search `Granted resources` / `grants` in `apps/web/src/` (T01 identifies exact file — likely Settings general section or EverydayData.tsx).
- Grant commands: `command('thread.presentation', ...)` pattern in App.tsx:1150; check `/api` surface for a revoke/delete grant command in T01 — if none exists, add `settings.update`-style command `grant.revoke` with payload `{grantId}` (server-side task T05).
- Tests: vitest + Playwright.

## DESIGN
- Client: `groupBy(grants, resourceKey)` producing `{key, name, threadTitles[], grantIds[]}`. Row keyed by resource key. Revoke calls the revoke command once per underlying grant id (sequential; same optimistic state).
- If the API lacks revoke: T05 adds it server-side following the existing command pattern; contract `{type:'grant.revoke', payload:{grantId}}` returning the updated grant list. T03's client call uses the identical payload key `grantId`.
- States: normal; revoking (`aria-busy`, button disabled); revoke-failed (error meta line); empty.

## EXECUTION_DAG
- T01 — Locate grant list component + grant data shape + whether a revoke command exists; post findings on issue #1730. Deps: none. Handoff: findings comment names the component file + contract for T02/T03/T05 owners. Done-when: file + contract confirmed.
- T05 — (only if T01 shows no revoke API) add `grant.revoke` command server-side, payload `{grantId}`, returning updated grant list, with a vitest contract test. Deps: T01. Owner: server implementer. Done-when: command responds per contract; handoff ACK to T03 owner.
- T02 — Dedupe/group render + copy exactly as specified. Deps: T01 (component location + data shape). Owner: web implementer. Tests: vitest — 3 identical grants → 1 row with "Granted to 3 threads". Done-when: grouping + copy specs pass; handoff to T03.
- T03 — Revoke button wiring, optimistic removal, error path, focus management, live-region announcement; calls `grant.revoke` with `{grantId}` per grant in the group. Deps: T02 (row markup) and T05 when it runs (API contract; sequential — T05 lands first if needed). Owner: web implementer. Tests: Playwright — revoke one resource → row collapses, list updates; failure path shows error text. Done-when: both paths verified.
- T04 — Reduced-motion + keyboard-only verification; axe pass on row + button labels. Deps: T03. Owner: web implementer. Done-when: a11y + motion assertions pass.
- T06 — Fixture-app verification: list shows 6 unique resources (8 grants minus dupes), revoke works, plan revision bump if scope changed. Deps: T04. Owner: web implementer. Done-when: verified on :4317; issue #1730 updated; RELEASE posted.

## VALIDATION
- `npx vitest run`; `npx playwright test` on fixture flows.
- Acceptance matrix: no duplicate resource rows (T02); thread-count copy exact (T02); Revoke removes + announces (T03); error path restores row + error copy (T03); empty state copy (T03); instant removal under reduced motion (T04); alphabetical order (T02).
- Release gate: all rows verified in fixture app.

## Historical STATE
- Researched: fixture duplicates confirmed visually. Decided: group-by-resource rows, sequential per-grant revoke. Pending: exact component + API (T01). Next: T01.

## REFERENCES
- Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1730. Plan-file PR: https://github.com/skytuhua-org/Gen-V1/pull/1727. scripts/review-host.ts grant fixtures; QA pass 13.


---
Plan file: https://github.com/skytuhua-org/Gen-V1/blob/55705782391c1497ace6f4433b9c54a78feabdb7/docs/agent-plans/granted-resources-dedupe-revoke.md
