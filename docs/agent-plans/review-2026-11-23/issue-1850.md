[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1850.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1850](https://github.com/skytuhua-org/Gen-V1/issues/1850). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Held-model label and zero-change chip repair exists in open [#1854](https://github.com/skytuhua-org/Gen-V1/pull/1854). T03 browser validation remains pending.

### Reviewed implementation references

- [PR #1854](https://github.com/skytuhua-org/Gen-V1/pull/1854): open; head `0b53b89b120d4ee6666511618daba55c02d9b8a5`; base `main`; not recorded as merged into the audit baseline.

Latest journal read: [7104426205](https://github.com/skytuhua-org/Gen-V1/issues/1850#issuecomment-7104426205). Earlier claims, tests, review findings and releases remain in the append-only journal.

---

Plan file: https://github.com/skytuhua-org/Gen-V1/blob/62be976379b18b9680f742733eff19ab399f09dc/docs/agent-plans/1850-composer-polish.md

# Plan: Composer polish — held model picker label and empty Changes counts

## META
- Feature: Two composer polish fixes — (1) disabled model picker shows an unexplained raw model id; (2) Changes chip renders "+0 −0" for an empty change summary
- Repo: skytuhua-org/Gen-V1 — plan rev 1, 2026-11-23
- Baseline: main @ 8f54f406b80f2d7d8ac09cc2a46557c125d681fa
- Status: planning complete, implementation NOT started
- Source provenance: QA pass 20, fixture :4317 — the thread composer's model picker renders disabled with `title="review/local-fixture"` and no visible reason; `ComposerToolbar`'s `ComposerTaskActions` renders the counts chip whenever `changeSummary` is truthy, so `{added:0,removed:0}` shows "+0 −0".

## OBJECTIVE
A disabled model picker always says why it is disabled, and the Changes chip never shows meaningless "+0 −0" counts. Success: screen-reader and sighted users get a reason for the disabled picker, and the counts badge appears only when there is at least one changed line.

## REQUIREMENTS
- Scope: `apps/web/src/ScopedConversationComposer.tsx` (model picker props), `apps/web/src/ComposerToolbar.tsx` (`ComposerTaskActions`), `apps/web/src/ModelPicker.tsx` (trigger label/title).
- P1 — held model picker reason. When the picker is disabled because no model is available (`models` empty): trigger label renders `No model` (existing 11px/`var(--muted)` trigger styling unchanged), `title="No model connected — open Settings › Models to connect one"`, `aria-label` identical. When the picker is disabled because the composer is held, it keeps the model name label and sets `title`/`aria-label` to `Model selection is locked — thread is <state>` with `<state>` mapped from the held source exactly: `context.readOnly` → `read-only`; `context.archived` → `archived`; `pending` → `waiting for a pending action`; `detached` → `detached`; `desktop.closing` → `closing`. Enabled states are unchanged (existing scopeHint path in the new-task composer is the reference).
- P2 — Changes counts. In `ComposerTaskActions`, render the `+A −R` span only when `changeSummary.added + changeSummary.removed > 0`. With a zero summary the chip renders just its `Changes` label and still opens the Diff panel on activation.
- No other visual, layout, motion, or copy changes. Reduced-motion and keyboard behavior untouched (both controls already follow the global press/focus rules).
- Out of scope: model picker popover content, Ctrl+1–9 shortcut display (#1788), picker empty-state placement (#1787), Diff panel content.

## REPO_MAP
- `apps/web/src/ScopedConversationComposer.tsx` — computes `held = Boolean(context.readOnly || context.archived || detached || pending || desktop?.closing)`; mounts `ModelPicker`. The held reason must be decomposed here for the title copy — pass it down as a prop.
- `apps/web/src/ModelPicker.tsx` — trigger button: verify where `title` is set today (fixture shows the raw model id `review/local-fixture` as title when disabled).
- `apps/web/src/ComposerToolbar.tsx` — `ComposerTaskActions`: `counts?` truthy check gates the `+A −R` span; change it to the `>0` sum gate.
- Tests: `tests/e2e/` Playwright; vitest for `ComposerTaskActions` count gating.

## DESIGN
1. Compute `heldReason` in `ScopedConversationComposer` via a small map from the first matching held condition (priority order: `readOnly`, `archived`, `pending`, `detached`, `desktop.closing`) to its copy string, and pass `heldReason` into `ModelPicker`.
2. `ModelPicker` trigger: when `disabled` and `models.length === 0` → label `No model`, title/aria per P1; when `disabled` and `heldReason` set → title/aria per P1; otherwise unchanged.
3. `ComposerTaskActions`: replace the truthy `changeSummary` gate on the counts span with `changeSummary.added + changeSummary.removed > 0`.

## EXECUTION_DAG
- T01: `heldReason` computation + `ModelPicker` disabled label/title/aria spec. Owner: web worker. Tests: vitest — trigger renders `No model` title when disabled with no models; `locked — thread is archived` when heldReason=archived. Done-when: all five held sources produce the mapped copy.
- T02: `ComposerTaskActions` zero-sum gate. Owner: same web worker. Tests: vitest — `{added:0,removed:0}` renders no counts text; `{added:2,removed:0}` renders `+2 −0`. Done-when: chip label-only for zero sums.
- T03: e2e on the fixture — thread composer picker shows the new title; Changes chip hides counts on a clean thread. Owner: same web worker. Deps: T01,T02.

## VALIDATION
- Fixture: `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` — the thread composer picker is disabled in the fixture and the Changes chip shows `+0 −0` today.
- Vitest for both gates; Playwright sweep for the fixture states. Acceptance: all REQUIREMENTS bullets green, no regressions to enabled states.

## Historical STATE
- Researched/decided: full plan. Implemented: nothing. Verified: both behaviors confirmed on built fixture :4317 and in source.
- Next step: implement T01.

## REFERENCES
- Related: #1787 (picker empty-state placement), #1788 (dead Ctrl+1–9 shortcuts), #1132 (composer crowding).
