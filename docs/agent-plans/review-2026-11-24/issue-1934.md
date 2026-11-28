# Current implementation status for #1934

## META and STATE

Repository `skytuhua-org/Gen-V1`; revision `issue-1934-metadata-r2-2026-11-24`; reviewed baseline `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`. This metadata supplement supersedes the earlier publication-time implementation status. The complete earlier plan is preserved verbatim below, SHA256 `df164540b8103311a5671948fa8fab67c6a9e084c70cd50a77f7a72e626a0e36`. Every original requirement, design choice, task, test, exclusion and acceptance check remains binding.

T01-T02 Connect project copy, hint and error-state candidate exists; T03 full required checks are incomplete.

Actual [PR #2089](https://github.com/skytuhua-org/Gen-V1/pull/2089) is open and unmerged at `1b8e72b7810b697147e6ffc664f5764a1129c185`, branch `devin/d52f78-1934-connect-project-dialog`. The [specific journal evidence](https://github.com/skytuhua-org/Gen-V1/issues/1934#issuecomment-7124304619) is preserved with its test and environment limits. The producer checkpoint reports three passing Playwright cases, clean tsc and zero UI-guard violations at b82cad55. The current PR head has since advanced to 1b8e72b7810b697147e6ffc664f5764a1129c185, so those counts remain evidence at their stated tested revision. Full required lint/check execution, packaged visual review, the Windows conditional placeholder branch and the retained manual empty/valid/error/Escape/narrow matrix remain to be verified. The candidate uses the DESIGN hint IDs; retain the actual accessible association requirement and all original copy.

## Acceptance and handoff

The current issue remains open. Producer-reported implementation and test results are distinct from independent review, required CI, merge and verification on main. This metadata worker ran no product, native or browser test. Existing implementation, review and native owners retain their scopes and releases.

The next authorized reviewer pins the latest PR head, reads the complete original plan and journal, reconciles each original task/acceptance row with the actual diff and evidence, and records any unresolved or unrun case without weakening its criterion. Use the existing PR for repair. The complete plan is mirrored through [documentation PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994); the append-only publication receipt supplies its immutable file URL and exact body readback. No application code or product requirement changes in this revision.

## Complete preserved original plan

Worker: devin-lite-p27 · QA pass 27 (second round: onboarding/welcome/empty projects). Plan source of truth below; versioned file: https://github.com/skytuhua-org/Gen-V1/blob/272a150b576c3b17cc497626be52a6a080ae2cde/docs/agent-plans/ui-connect-project-dialog-copy-validation.md

# UI: Connect project dialog — platform-aware path hint, real validation errors, visible length cap

## META
- Feature: polish the Connect project dialog's copy and validation
- Repo: skytuhua-org/Gen-V1 · Plan rev 1, 2026-11-23
- Baseline: main @ 65801227 (verify at implementation time)
- Provenance: QA pass 27 (second round: onboarding/welcome/empty projects), fixture :4317
- Status: planning complete, implementation NOT started
- Fixture repro: `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` then build (`pnpm build`) and open http://127.0.0.1:4317 → expand "Project overview" → Connect project.

## OBJECTIVE
The Connect project dialog (the only project-creation surface in the onboarding path) ships three defects: a Windows-only folder placeholder on every platform, a raw host error ("The selected path is unavailable") that explains nothing, and a silent `maxLength={100}` truncation on the name field. Success: every platform sees a path hint that matches its filesystem, validation failures say what is wrong and how to fix it, and the length cap is visible before the user hits it.

## REQUIREMENTS
- Placeholder: browser/macOS/Linux builds show `/Users/you/Projects/my-project`; Windows desktop shows `C:\Projects\My project`. Detect via `useDesktop()` from `apps/web/src/desktop-context`: desktop AND `navigator.platform.startsWith('Win')` → Windows string; otherwise POSIX string.
- Name field: add `aria-describedby` to a hint element `dialog-project-name-hint` placed directly under the input: `Shown in the project picker · up to 100 characters` (12px, `var(--muted)`). Keep `maxLength={100}`; the hint is the whole affordance — no live counter.
- Folder field: add placeholder `aria-describedby` only when a validation error is shown. Error copy rule: when the host rejects the connect call, prefix the raw message — `Couldn't connect that folder: <message>` — rendered by the existing `<p role="alert" className="error-text">`. Associate it to the folder input with `aria-describedby` + `aria-invalid="true"` while present; both clear on the next edit or submit attempt.
- Submit stays disabled while either field trims to empty (current rule, unchanged). Enter still submits; Escape still closes; focus trap unchanged.
- Out of scope: folder-pick UI, recent-path suggestions, backend path validation.
- Motion: none; reduced motion unaffected.
- A11y: `aria-invalid` only while the error is visible; `role="alert"` already announces it; hint must be read on focus (verify `aria-describedby` wiring).

## REPO_MAP
- `apps/web/src/App.tsx` (~line 1205): the `projectConnectOpen` `<Dialog title="Connect project">` form — `projectName`, `projectPath`, `projectConnectError`, the `<label className="field">` pair, `maxLength={100}`, the `<p role="alert" className="error-text">`, footer `disabled={!projectName.trim()||!projectPath.trim()}`.
- `apps/web/src/desktop-context.tsx`: `useDesktop()` gate (verify export name at implementation time).
- `apps/web/src/styles.css` / dialog field styles: `.field`, `.error-text`, `.dialog-actions` — reuse, no new tokens.
- `apps/web/src/ProjectContextCard.tsx` line 36: `onConnect` row that opens the dialog — no change.

## DESIGN
All edits inside the single `<form>` block in App.tsx:

```tsx
const projectPathPlaceholder = desktop && typeof navigator !== 'undefined' && navigator.platform.startsWith('Win')
  ? 'C:\\Projects\\My project' : '/Users/you/Projects/my-project';
...
<label className="field">Project name
  <input required maxLength={100} value={projectName} aria-describedby="connect-project-name-hint"
    onChange={event => setProjectName(event.target.value)} />
  <small id="connect-project-name-hint" className="field-hint">Shown in the project picker · up to 100 characters</small>
</label>
<label className="field">Local folder
  <input required value={projectPath} placeholder={projectPathPlaceholder}
    aria-invalid={Boolean(projectConnectError)} aria-describedby={projectConnectError ? 'connect-project-path-error' : undefined}
    onChange={event => { setProjectPath(event.target.value); setProjectConnectError(''); }} />
</label>
{projectConnectError && <p role="alert" id="connect-project-path-error" className="error-text">{`Couldn't connect that folder: ${projectConnectError}`}</p>}
```
- `.field-hint { display:block; margin-top:4px; font-size:12px; line-height:16px; color:var(--muted); }` added next to `.error-text` styles.
- Clearing `projectConnectError` on folder edit replaces today's clear-on-submit behavior; name edits do not clear it.

## EXECUTION_DAG
- T01 (owner A): App.tsx form edits + `.field-hint` rule. Deps: none. Done-when: placeholders/copy/aria wiring match DESIGN; `pnpm typecheck` PASS.
- T02 (owner A, dep T01): Playwright spec `tests/e2e/connect-project.spec.ts` (new): dialog opens from Project overview → Connect project; POSIX placeholder on the fixture build; typing 120 chars into name leaves 100; a failed connect renders `Couldn't connect that folder:` + `aria-invalid`. Done-when: spec green on fixture :4317.
- T03 (owner A, dep T01,T02): `pnpm lint` + full typecheck; record PASS output.

## VALIDATION
- `pnpm typecheck` PASS; `pnpm lint` PASS; Playwright spec PASS on the fixture command in META.
- Manual matrix: name empty/non-empty/120-char paste; path empty, `/definitely/missing` (error), valid; Escape; narrow 360px.
- Acceptance: each requirement maps to T01–T03 checks above. Executed tests recorded in checkpoint; planned vs run separated.

## STATE
- Verified live on :4317 (dialog opened, placeholder + error + cap reproduced 2026-11-23). No implementation yet.
- Risk: `useDesktop` already imported in App.tsx — verify import name before editing. Next: T01.

## REFERENCES
- Issue filed by QA pass 27; sibling issues this pass: pinned-section keyboard hint, project-picker color popover overflow.
