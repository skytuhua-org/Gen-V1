[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1680.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1680](https://github.com/skytuhua-org/Gen-V1/issues/1680). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Five Source helpers have an open implementation in [#1822](https://github.com/skytuhua-org/Gen-V1/pull/1822), with 17 reported unit/manifest tests. The accepted trim/link/text behavior is not on main; original description also points to [#1681](https://github.com/skytuhua-org/Gen-V1/pull/1681)'s unmerged map helper, now correctly separated in the implementation.

### Reviewed implementation references

- [PR #1822](https://github.com/skytuhua-org/Gen-V1/pull/1822): open; head `1b6fc679144144473d5568530a34f301de2283a7`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7088816607](https://github.com/skytuhua-org/Gen-V1/issues/1680#issuecomment-7088816607). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

Follow-up from #1652, which fixed the identical bug in `MapView.tsx`.

Five generative artifact components share the same `Source({text}:{text?:string})` helper shape: `text ? <details className="...-source"><summary>Source</summary><p>{text}</p></details> : null`. A whitespace-only `text` is truthy, so the disclosure renders and expands to an empty paragraph — a dead control, same as #1652's map artifact.

Affected components:
- `apps/web/src/ExplorationTools.tsx` — `exploration-source`
- `apps/web/src/EverydayData.tsx` — `everyday-source`
- `apps/web/src/SoftwareDevelopment.tsx` — `software-source`
- `apps/web/src/InteractionTools.tsx` — `interaction-source`
- `apps/web/src/WorkObjects.tsx` — `work-object-source`

Fix: trim before render (blank → render nothing); if the trimmed text matches `^https?://`, render as `<a target="_blank" rel="noopener">`, else `<p>` — the same approach as `mapSourceContent` in `apps/web/src/map-source.ts` (see PR for #1652).

## Verification and handoff detail

T01 is the five Source helpers plus `apps/web/src/artifact-source.ts` in #1822; T02 covers blank, trimmed http(s) links and ordinary text in `tests/artifact-source.test.ts` with the public-source manifest check. The journal reports `pnpm vitest run tests/artifact-source.test.ts tests/public-source.test.ts` passing 17/17, typecheck and UI lint passing. Browser coverage was not run. Review the exact current head, preserve `target="_blank" rel="noopener"` for links and existing non-link text behavior, then verify required CI and main integration before closure. The map helper referenced in the original report exists in the separate unmerged #1681 work, so #1822 intentionally uses its own shared helper without assuming #1681 landed.
