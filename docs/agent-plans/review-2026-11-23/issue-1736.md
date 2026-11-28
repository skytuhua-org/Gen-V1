[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1736.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1736](https://github.com/skytuhua-org/Gen-V1/issues/1736). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

PDF-source error-link styling repair exists in open [#1792](https://github.com/skytuhua-org/Gen-V1/pull/1792). Light/dark screenshot evidence and current-head CI remain unverified in the journal.

### Reviewed implementation references

- [PR #1792](https://github.com/skytuhua-org/Gen-V1/pull/1792): open; head `b7b164bffc9c55249d8513a983b9999943383394`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7091759743](https://github.com/skytuhua-org/Gen-V1/issues/1736#issuecomment-7091759743). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

# Plan: Artifact preview error affordance — style "Open source PDF" as a real action, not a bare link

## META
- Feature: Artifact DocumentPreview failure actions
- Repo: skytuhua-org/Gen-V1, plan revision rev1, 2026-11-22
- Baseline: main @ 97efd9ca
- Issue: this issue. Related: #1617 (failed preview leaves large empty frame — covers the frame, not this link)
- Status: planned, not implemented
- Source: fixture QA pass 14; verified in `apps/web/src/DocumentPreview.tsx:349`

## OBJECTIVE
The failed-preview error block renders "Retry preview" as a button but "Open source PDF" as a bare `<a>` with no class: it inherits the UA stylesheet (native blue, underlined) which fails contrast and pattern consistency in both light and dark themes. Style it as the secondary action of the error state.

## REQUIREMENTS
- In scope: `DocumentPreview.tsx` line ~349, `ErrorState` usage, one CSS rule block.
- Out of scope: error copy, retry logic, frame sizing (#1617), other ErrorState consumers.
- The link must look and behave like the app's secondary button while staying a real `<a href target="_blank" rel="noopener noreferrer">` for open-in-new-tab semantics.
- Keyboard: reachable in tab order (native link, already), `focus-visible` ring `2px solid var(--accent)`, offset `2px`.
- a11y: keep `aria-label`/visible text "Open source PDF"; add `ExternalLink` icon `size={14}` `aria-hidden` to match the header actions at DocumentPreview.tsx:344.
- States: default, hover, focus-visible, active, visited (visited must NOT recolor — force `color:var(--accent-fg)` on `:visited`), dark theme via existing tokens.
- Motion: background-color transition `var(--ui-motion-insert) var(--ui-ease-enter)`; no transform; reduced motion removes the transition.
- No 'e.g.', alternatives or TBD below — values are final.

## REPO_MAP
- `apps/web/src/DocumentPreview.tsx:349` — `{error && <ErrorState className={...} ...>{sourceUrl && <a href={sourceUrl} ...>Open source PDF</a>}</ErrorState>}` — bare anchor, no class.
- `apps/web/src/DocumentPreview.tsx:344` — header actions already use `ExternalLink size={14}` icon buttons; import exists.
- `apps/web/src/styles.css:163` — `.composer-error,.workspace-error` pattern for error rows.
- Tokens: `--accent-fg` #3b5bdb light / #91a7ff dark (styles.css:5-6), `--border`, `--hover`, `--surface`, `--danger`, `--danger-soft`.
- `ErrorState` component file: locate via `rg "function ErrorState|const ErrorState" apps/web/src` (discovery in T01; it renders the retry button already).

## DESIGN
- Add class `error-action` to the anchor and a new `.error-action` rule near the error styles in styles.css (after line ~163).
- Markup: `<a className="error-action" href={sourceUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} aria-hidden="true"/>Open source PDF</a>`.

### Visual spec (exact)
- `.error-action`: `display:inline-flex; align-items:center; gap:6px; height:32px; padding:0 12px; border:1px solid var(--border); border-radius:8px; background:var(--surface); color:var(--accent-fg); font-size:12px; font-weight:500; line-height:1; text-decoration:none;`
- `.error-action:hover`: `background:var(--hover);` `text-decoration:none;`
- `.error-action:focus-visible`: `outline:2px solid var(--accent); outline-offset:2px;`
- `.error-action:visited`, `.error-action:active`: `color:var(--accent-fg);`
- `.error-action svg`: `flex-shrink:0;`
- Layout: the link sits inline after "Retry preview" with `margin-left:8px` via `.document-preview-failure .error-action { margin-left:8px; }`.
- Transition: `background-color var(--ui-motion-insert) var(--ui-ease-enter)`; `@media (prefers-reduced-motion: reduce) { .error-action { transition:none; } }`.

## EXECUTION_DAG
- T01 (owner: implementer): Locate `ErrorState` definition; confirm no existing shared link-button class; post file:line on issue. Done-when: path confirmed.
- T02 (owner: implementer, dep T01): Apply markup + CSS per DESIGN. Files: `apps/web/src/DocumentPreview.tsx`, `apps/web/src/styles.css`.
- T03 (owner: implementer, dep T02): Tests — vitest render: anchor has class `error-action`, `rel="noopener noreferrer"`, icon `aria-hidden`; Playwright: signing scenario failure state, assert computed `border-radius:8px`, `text-decoration-line:none`, focus ring on Tab. Done-when: green.
- T04 (owner: implementer, dep T03): Screenshot light + dark, attach to PR; RELEASE checkpoint.

## VALIDATION
- `pnpm exec vitest run` and `pnpm exec playwright test` — all green.
- Manual: force preview failure (signing scenario ships one), verify both themes.
- Acceptance: (a) link is styled secondary action, not native blue — computed style test; (b) visited color unchanged — test; (c) focus ring visible — keyboard test; (d) opens new tab — existing semantics kept.

## Historical STATE
- Decided: secondary-button pattern, `var(--accent-fg)` text, border `var(--border)`.
- Pending: ErrorState path (T01), implementation, tests.
- Next step: T01.
- Risk: none beyond class-name collision — `error-action` is unused today (grep: zero matches).

## REFERENCES
- DocumentPreview.tsx lines 344, 349 (read 2026-11-22).
- styles.css lines 3-6 tokens, 163 error row pattern.
