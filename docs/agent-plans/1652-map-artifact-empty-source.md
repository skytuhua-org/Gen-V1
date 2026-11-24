
# Plan: Map artifact "Source" disclosure expands to empty content

## META
- Feature: generative map artifact source citation
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-21 (design fully specified — implementer makes no design choices)
- Baseline: main @ 8cc970fd667fbefebb2a77df2a829f880a132e54
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1652
- Status: planning complete, implementation NOT started
- Source: manual UX audit of built app served by `scripts/review-host.ts` on :4317

## OBJECTIVE
The map artifact renders a "Source" `<details>` row that expands to an empty paragraph. A real user clicks it expecting a citation and gets a blank expansion — a dead control. Success: the disclosure appears only when there is real source text, and when present it shows the citation.

## REQUIREMENTS
- In scope: guard the details block on non-blank source content; trim the text before render. If `parsed.data.source` is whitespace/empty, render nothing.
- If the source may be a URL, render it as a link (`<a>` with the raw URL text, `rel="noopener" target="_blank"`); otherwise render as plain `<p>`.
- Out of scope: other artifact types' source blocks (audit and file separately if the same pattern exists elsewhere).
- Motion: native `<details>` disclosure; no custom animation needed.

## REPO_MAP (verified)
- `apps/web/src/MapView.tsx` (~line 66): `{parsed.data.source && <details className="task-map-source"><summary>Source</summary><p>{parsed.data.source}</p></details>}` — truthy-but-blank source renders an empty `<p>`; observed on the fixture "Around Linden Park" card at :4317.
- `apps/web/src/artifact-inputs.ts`: `mapActionPayload`/parsed map data shape — confirm `source` type (string vs structured {url,label}) before choosing plain-vs-link render.
- Discovery: check other generative cards for the same `source && <details>` pattern (rg "task-map-source\|>Source<" in apps/web/src).

## DESIGN SPEC
- Condition: `const source = parsed.data.source?.trim()`; render only when `source` non-empty.
- Content: if `source` matches `^https?://`, render `<a href={source} className="task-map-source-link" target="_blank" rel="noopener">{source}</a>`; else `<p>{source}</p>`.
- Link styling: inherit, `color: var(--accent)` if that token exists in styles.css, otherwise the same link style used elsewhere in artifact cards (discovery: find existing artifact link class). No layout change; summary row keeps current style.

## EXECUTION_DAG
- T01 (owner: implementer): Apply the guard + link render in `MapView.tsx` only; grep other generative components for the identical `>Source<`/blank-source pattern and file one follow-up issue per affected component (do not edit them in this task). Tests: vitest for the blank/URL normalization helper; Playwright: fixture card shows no Source row when source blank, shows link when URL. Done when verified at :4317.

## VALIDATION
- `pnpm build`, review host :4317; Playwright both states; vitest for helper.

## STATE
Researched + decided; nothing implemented. Next step: T01.
