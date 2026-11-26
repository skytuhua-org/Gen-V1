# MTH05: Enable math only in the three approved app callers

## META

`skytuhua-org/Gen-V1`; parent [#2229](https://github.com/skytuhua-org/Gen-V1/issues/2229) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/MTH05`, 2026-11-25. Kind: implementation. Start: **BLOCKED**. Dependencies: [MTH04 #2281](https://github.com/skytuhua-org/Gen-V1/issues/2281).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-MATH-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-math-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Turn on the reviewed renderer only for main AssistantProse, CanvasThread assistant content and registry BoundMarkdown. Prove each real app path keeps canonical copy, stable ownership and safe lazy behavior.

## REQUIREMENTS

Use explicit app code math={true}, never model/catalog options. User/activity messages, WorkActivity, InputDecision, permission/operation prompts, Files, Document, IncomingAnswer and every other caller remain default false and load no math assets. Do not change approvals, storage, runtime, catalog, scroll policy or SourceMessage identity. Retain source/copy even when output fails.

Coverage: Math T01 caller identity and T04 opt-ins; R01/R03/R04/R07/R08/R09/R10; A01/A03/A04/A07/A08. Inherited requirements remain binding.

## REPO_MAP

Current main and CanvasThread map message rows with key=message.id; main wraps a thread-keyed view. app-panels AssistantProse has a custom memo comparator. registry BoundMarkdown reads props/data and uses Markdown; Document also uses Markdown but stays excluded. Artifact.tsx supplies verified SecureArtifactScope={artifactId,threadId,revision,active?,editable?,saveStatus?} through useSecureArtifact in secure-artifact-context.tsx.

Existing narrow hunks: `apps/web/src/app-panels.tsx`, `apps/web/src/App.tsx`, `apps/web/src/registry.tsx`, `tests/e2e/task-interface-fixture.ts`.

Proposed outputs: `tests/e2e/markdown-math.spec.ts`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Use the private renderOwner input from MTH04 to invalidate work across genuine caller replacement. Main and canvas derive an app-local identity from the verified thread.id, thread.epoch, accountId/modelId and message.id values; use JSON encoding rather than ambiguous concatenation. Main passes that identity into AssistantProse and includes it in memo equality. BoundMarkdown uses useSecureArtifact's threadId/artifactId/revision together with its stable local React instance identity. A missing real artifact owner keeps literal source until its ownership can be proven; do not invent a host field. These are private presentation identities, not canonical SourceRef offsets.

Capture actual baseline and candidate with the same synthetic fraction/sum/matrix/currency/code/link corpus. Main and generated Markdown must show a visible capability difference; canvas receives the same rules. Continued streaming may close a formula without finalizing the run. Hidden/inert/held retained owners keep source and cancel/defer correctly; re-entry resumes eligible queued work. A failed formula does not remount or blank siblings.

This is a small caller binding reservation. App's message-row/CanvasThread math props are distinct from ANC04's reading-root/onNavigate hunks and ANC05 history-focus hunks; registry BoundMarkdown is distinct from Form feedback work. Release each reservation after the focused candidate is committed.

## EXECUTION_DAG

**T01.** Freeze actual-app baseline screenshots/DOM/copy of main assistant and generated Markdown at the pinned control SHA, with exact fixture text/settings. Inspect the three current React ownership paths and record the verified identity values above.

**T02.** Add the three explicit math opt-ins and private renderOwner delivery; include owner changes in AssistantProse's memo comparator. Preserve all other Markdown calls verbatim.

**T03.** Extend the real App fixture/spec for main, canvas/split or embedded and BoundMarkdown. Delay module import, replace same-position formula/source/owner, hide/restore and remove the leaf; assert no stale commit or stranded source.

**T04.** Check display disclosure/copy and original Copy message payload with CRLF, pointer/keyboard selection around another resolving formula, all excluded callers and no-math import counts.

**T05.** Run scoped checks, freeze the candidate SHA and release caller/fixture hunks to [MTH06 #2283](https://github.com/skytuhua-org/Gen-V1/issues/2283) and [MTH07 #2284](https://github.com/skytuhua-org/Gen-V1/issues/2284). Report unresolved native/anchor gates without implementing a local compensator.

**Done when:** Three real caller paths and their ownership/copy behavior pass at a frozen candidate. No default consumer expansion or catalog/schema change exists. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm typecheck; pnpm build; pnpm exec playwright test --config tests/e2e/micro-motion.playwright.config.ts markdown.spec.ts markdown-math.spec.ts; pnpm exec playwright test --config tests/e2e/workbench-app.playwright.config.ts. Positive: all three approved app surfaces render complete admitted formulas and preserve exact copy. Negative: all listed default-off surfaces remain literal with zero math JS/CSS/font requests; old owner/import results cannot publish; selection/focus/IME/Send/Stop stay intact. Source marker behavior consumes SRC01, not a new invalidation mechanism. Actual Windows and screen reader remain MTH07.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Needs an accepted default-off Markdown math seam and its owner-safe leaf. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/app-panels.tsx).
- [Reference 2](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/apps/web/src/secure-artifact-context.tsx).
