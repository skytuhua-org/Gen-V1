# Artifact action feedback: Bluma-informed plan for #2141

## META

- Repository/revision: skytuhua-org/Gen-V1, `2026-11-25-bluma-action-r2`.
- Canonical [#2141](https://github.com/skytuhua-org/Gen-V1/issues/2141); parent [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Reuse #2141; no competing issue.
- Baseline: verified `main@96ca4c3bd0664fca53775fbe31915c209641986c`; branch `docs/bluma-component-adoption-plans`.
- Provenance: repository/Git blob reads, journals/PRs, coordinator's Bluma browser observations. Draft: component_sources under codex-cloud-bluma-bd935d.
- Planning only. [2141 release](https://github.com/skytuhua-org/Gen-V1/issues/2141#issuecomment-7134447512): OWNER=NONE; search returned no implementation PR. Refresh before claiming. Coordinator publishes; no delegated remote/product writes or app tests.

**Goal:** stable, truthful action feedback. **Architecture:** existing dispatch plus fixed decorative indicator/local acknowledgment/scoped validation. **Stack:** React 19.2.3/TypeScript/lucide/CSS/Vitest/Playwright, no new dependency. **Spec/constraints:** this revision, [DESIGN](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/DESIGN.md), [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/CONTRIBUTING.md). **Review focus:** truth, validation, focus, ownership. Writing-plans execution uses executing-plans or subagent-driven-development.

## OBJECTIVE

BusyButton conditionally inserts a spinner despite promising stable width. Registry Button/Form replace labels with Submitting…. They already guard duplicates and expose errors but lack local acceptance acknowledgment; the original no-feedback claim is historical. Target <=1 CSS px bounding-box variation across states, immediate single dispatch, required-choice blocking and accessible recovery.

### Explicit amendments to original #2141

Retain original body; publish full revision, identical Markdown and append-only amendment note.

| Original | Revised decision |
| --- | --- |
| Color picker/save-choice repro | Current catalog is Delivery/Save choice, actionId inspect, optional. Add separate required fixture; do not require optional choices. |
| Derive Saving/Working label | Keep full visible/accessibility label; immediate disabled/aria-busy, delayed spinner and Submitting request status. No gerund inference. |
| Resolved means Saved; selected field read-only | Artifact.submit can return approval-required. Catalog defines acceptance, not external completion. **Request submitted** plus captured read-only choice summary; current fields remain editable unless source disables them. |
| Generic Couldn't save | Preserve actionable source error/fallback The request failed. Try again.; explicit Retry. |
| Four-second success/no status animation | Retain 4 s dismissal and instant status text. Only decorative icon gets 160 ms opacity in full motion; reduced/off static. |

Required-field blocking, exact Pick an option first., retry, announcements, submitted-choice visibility, keyboard and theme checks remain binding.

## REQUIREMENTS

| ID | Requirement |
| --- | --- |
| R1 | Own Button/Form feedback, associated required ChoiceList and minimum BusyButton support. Preserve native type/ref/tones/disabled reasons, IME, payload/state/host semantics. No label-based scenario routing. |
| R2 | Fixed 16 px decorative slot; complete static label. Immediate busy/disable/dispatch; only spinner waits 150 ms. No fast-request flash/minimum dwell. Preserve 29 px compact Form and hidden full label. |
| R3 | One current-invocation acknowledgment only after run returns true: neutral Request submitted/status and captured choice summary for 4 s. No inferred Saved/Done/completion receipt. Existing approval flow governs. |
| R4 | Scope to instance/thread/artifact/revision/action/invocation. Clear on owner/inactivity/unmount/new invocation/captured-choice edit. No replay on snapshots/theme/policy; clean timers/listeners. Host work is not cancelled. |
| R5 | One request for pointer/Enter/Space; failure has one source-error alert and quiet Retry. Retry validates current values. Preserve initiating focus unless user/host moved it; no automatic success/Retry focus. |
| R6 | Associated enabled required choice empty: zero dispatch, aria-invalid/described Pick an option first., focus first usable choice/custom input. Correction clears. Optional/disabled/hidden/inert/unrelated/foreign fields don't block; native Input constraints remain. |
| R7 | Preserve submitted capture and compare-and-clear clearOnSuccess; newer drafts survive. Read-only summary uses captured renderer choice labels, never current/raw payloads or persistent locks. |
| R8 | One icon opacity transition via existing 160 ms status/easing/speed tokens in full motion; static app/OS reduced and app off, including toggles. No split letters/bounce/grow/blur/shimmer/width/translation/idle effects or delayed error text. |
| R9 | No Bluma import/login/purchase/MCP, dependency/schema/IPC/server/telemetry change. Preserve grants/approvals. Copy/patch export/composer/Tabs/generic status/tooltips/toasts/broad redesign are out of scope. |
| R10 | Before/after 1920x1080/30fps/H.264 dark/light x normal/reduced/off, no added titles or overlays, plus 560 px/200% zoom; real pointer/keyboard, geometry/counts/live status. Synthetic UI proof does not establish native/provider results. |

## REPO_MAP

Paths verified at baseline, including sparse Git blobs. Proposed interfaces are labeled.

| Existing paths / symbols | Role / scope |
| --- | --- |
| `packages/ui-shell/Feedback.tsx`, `feedback.css`, `tokens.css` | BusyButton/Spinner/ErrorState. Edit busy/indicator only; reuse tokens; preserve standalone Spinner/retry refs. |
| `apps/web/src/registry.tsx` | Button/Form/imports only, not Tabs. Preserve CRLF, IME, payload/compare-and-clear; no whole-file formatting. |
| `apps/web/src/task-context.ts` | ArtifactActions/useTaskAction pending-ref/boolean contract/mapActionPayload/statePath. Add validation context and the optional private presentation-owner parameter described in D2; preserve host dispatch and default callers. |
| `apps/web/src/Artifact.tsx`, `secure-artifact-context.tsx` | Read submit/schema/flush/approval/refresh and useSecureArtifact ownership. No edits. |
| `apps/web/src/ArtifactPresentation.tsx` | Proposed provider around artifact renderer. |
| `apps/web/src/task-interface.tsx`, `task-interface.css` | ChoiceList native radios/custom/required, no inline error. Own validation/action styles; preserve direct 29 px submit. |
| `packages/ui-catalog/index.ts`, `workflow.ts` | Form/Button/payloadFromState/ChoiceList contracts; no successText or schema edits. |
| `apps/web/src/LoadingState.tsx`, `motion-policy.ts`, `appearance.css` | 150 ms convention; loading hook unexported; policy read/reuse. Shared package cannot import app code. |
| `scripts/review-fixtures.ts`, `review-host.ts` | Synthetic Delivery/Save choice/inspect path, no external save proof. |
| `tests/feedback-primitives.test.ts`, `tests/task-interface.test.ts` | Real Chromium feedback fixture/catalog tests. |
| `tests/e2e/task-interface.spec.ts`, `task-interface-fixture.ts`, `task-interface.playwright.config.ts` | Real App/captured commands/deferred callback; IME/duplicates/drafts; port 5188. No root Playwright config. |
| `apps/web/src/CopyButton.tsx`, `tests/copy-button-ownership.test.ts` | Read-only: fulfilled clipboard/check/Copied 1.6 s/static name/generation cleanup already exist. |

### Adjacent ownership, verified 2026-11-25

| Work | Integration boundary |
| --- | --- |
| [#1115](https://github.com/skytuhua-org/Gen-V1/issues/1115), [1152](https://github.com/skytuhua-org/Gen-V1/pull/1152), [1254](https://github.com/skytuhua-org/Gen-V1/pull/1254) | PRs open/unmerged. Broad forms/charts/Tabs; 1152 preserves inspected Button/Form but changes Tabs/line endings. Agree exact registry/ChoiceList/test hunks. |
| [#1191](https://github.com/skytuhua-org/Gen-V1/issues/1191), [1204](https://github.com/skytuhua-org/Gen-V1/pull/1204) | 1204 open/unmerged, 1202 closed/unmerged. Its feedback.css patch adds empty stagger. Leave Status/Steps/empty/toast to owner. |
| [#1976](https://github.com/skytuhua-org/Gen-V1/issues/1976), [2007](https://github.com/skytuhua-org/Gen-V1/pull/2007), [2011](https://github.com/skytuhua-org/Gen-V1/pull/2011) | 2007 merged at `273b3384d533ab9358abde8f4b22a5fc6bd013bb`; 2011 open/unmerged. Preserve tooltip/Select/toast/composer fixes; no overlay focus rewrite. |
| [#1604](https://github.com/skytuhua-org/Gen-V1/issues/1604), [1693](https://github.com/skytuhua-org/Gen-V1/pull/1693) | 1693 open/unmerged at `518bc388167640fd02675be8239946824e20c677`, owns CopyButton async text/onError/spinner. Route Copy findings there; no edit/copy gate here. |
| #2212 Tabs plan | Distinct registry symbols share imports/tests. Serialize shared-file commits and agree hunks. |

## DESIGN

### D1. Stable indicator and native controls

Proposed ActionIndicator export in existing Feedback.tsx: `state: 'idle' | 'busy' | 'acknowledged'`, optional idleIcon: ReactNode and className. Fixed 16x16, aria-hidden, no handlers/live region. Only 150 ms uninterrupted busy reveals a spinner; settle/unmount cancels. Rotate only a visible pending spinner.

Positioned layers transition opacity on state changes, not mount-keyframes that replay after policy changes. Reuse motion tokens; standalone fixture must honor reduced/off. No idle/per-frame work or dispatch delay. BusyButton always reserves slot; optional acknowledged prop defaults false and never derives from busy false. Native props/ref/type/disable preserved.

Form keeps direct native submit, form-submit-label and CornerDownLeft idle glyph. Center slot with zero gap in compact 29 px control; full-label controls use natural width. Never clip text to satisfy measurements.

### D2. Local requests and recovery

Registry feedback uses the proposed internal API `useTaskAction(ownerIdentity?: string | null)`. Undefined preserves existing no-argument behavior; a stable string enables ownership guards; null means inactive and run must reject without dispatch. Scoped callers use null when inactive. Encode thread ID, artifact ID, artifact revision and action ID; component-instance isolation is already provided by the hook instance. Do not use callback identity, field values or state revision as ownership.

On each committed identity/activity change, advance a monotonic generation and reset only pending/busy/error presentation before interaction. Returning A-to-B-to-A gets a new generation. Each invocation captures that generation and a unique request token. Only the current generation/token may publish errors, return true or clear pending/busy in finally. Stale success/failure returns false, with host work continuing unchanged; unmount invalidates the generation. A new owner can dispatch immediately. Keep the Form, fields and controls mounted, without a keyed Form or replacement dispatch API. Captured-choice edits clear acknowledgment separately and never reset an in-flight same-owner duplicate guard. Preserve payload and accepted compare-and-clear semantics.

Test held request A, owner change, then request B; resolve/reject A while B remains pending. A produces no result/error and cannot clear B busy or duplicate guard. Cover inactive/reactivation and A-to-B-to-A.

| Event | Result |
| --- | --- |
| Invalid required choice | Zero dispatch; field error/focus. |
| Valid activation | Capture values/labels, clear status, immediate disabled/aria-busy/Submitting request; call run. |
| Current true | One neutral Request submitted/check/captured choice summary, 4 s dismissal. |
| Current failure | No check/acknowledgment; source-error alert and quiet Retry. |
| Retry | Revalidate/capture current values; one invocation, no automatic/cached replay. |
| Owner/revision/action/inactive/unmount | Clear timers/UI; late completion ignored locally, host untouched. |
| Actual user edit to a captured choice | Remove obsolete summary/acknowledgment, preserve draft. The accepted Form compare-and-clear is not a user edit. |

Track actual ChoiceList edit versions through its registered user-change handlers, not every store-value change. An accepted clearOnSuccess mutation can clear the live field while the captured summary remains for its four-second acknowledgment. A later real user edit clears that acknowledgment. Test this distinction and unchanged newer-draft protection.

Summary uses associated ChoiceList labels only, e.g. Submitted choice: Download; never arbitrary payloads/credentials or disabled live fields. One stable polite status, mutually exclusive alert. Status instant and outside aria-busy suppression; decorative icons; full labels/titles persist. Four seconds delays dismissal, never enabling actions.

Input-origin submit retains input focus. If disabling initiating button drops focus to body, restore only same connected active button after re-enable, with no intervening pointer/key/focus intent or host navigation. Invalidate callbacks on owner change; no focus theft/overlay trap.

### D3. Required ChoiceList validation

Required radios inside forms already get native constraint checks. Current catalog choices are outside Form and mapped by payloadFromState. Proposed provider in task-context.ts, mounted by ArtifactPresentation, registers ChoiceList instanceID/stateKey/fieldsetref/required-enabled state, live validity callback, invalid setter and display-label reader. Scope per artifact; refresh callbacks and unregister on replacement/unmount.

Validate enabled visible registered choices inside the submitting form or mapped by its payloadFromState; standalone Button only mapped choices. Skip disabled/inert/hidden/unrelated/foreign fields. Association uses refs/maps, never labels/proximity or unescaped selectors. Host validation remains authoritative.

Native validation runs before Form onSubmit, so filtering the registry alone is insufficient. ChoiceList owns native participation through its fieldset ref: set fieldset.disabled to props.disabled OR not presentationEligible, while retaining required flags and every stored value. Eligibility combines secure-artifact activity, ancestor hidden/inert/aria-hidden and rendered visibility. Synchronize in a layout effect; observe only the registered fieldset/ancestor activity attributes (hidden, inert, aria-hidden, class, style) and relevant visibility/resize changes, with complete cleanup. The provider exposes syncNativeParticipation(form); Form capture handlers call it before submit-button click or implicit Enter default validation. Keep this private to ChoiceList/Form; do not change Tabs/Steps production behavior, disable the whole form or use noValidate. Unrelated Input constraints remain native.

Add a real-browser case with an empty required ChoiceList retained inside an inactive tab/step panel: it is natively disabled and does not block an otherwise valid active form. Activate it and verify required blocking, the exact inline error, first usable focus and zero dispatch. Select a value, hide/reactivate and verify value retention and restored validation. An unrelated required Input must still block in both visibility states. Include immediate visibility-change followed by click and implicit Enter so stale observation delivery cannot bypass or incorrectly block validation.

Require supported selected option or nonempty custom value respecting native constraints. Link one Pick an option first. message with aria-describedby/invalid; focus first usable invalid input. Integrate native invalid events so browser checks expose the inline error. Valid correction clears without dispatch; preserve Input/IME; no rerender validation.

### D4. Source adaptation and rollback

[Action](https://bluma.design/c/action) showed Save changes/Saving/Saved/Retry with changing-letter motion. [Copy](https://bluma.design/c/copy) showed Copy to Check, Copied, one shimmer and error replay. Adopt continuity/stable geometry/fulfilled acknowledgment; omit split letters, shimmer, inferred Saved and demo error replay. Copy implementation stays #1604.

Exports, even free, required authentication and were unread. [MCP](https://bluma.design/mcp) describes complete minified exports; [terms](https://bluma.design/terms) discuss personal/commercial use of components built for customers, without establishing the exact public-library redistribution grant for unseen files. No code imported; future acquisition requires separate review.

No migration. Rollback reverts this scoped diff/tests, preserving host/adjacent fixes. No new product file planned; if needed, add source manifest entry in scripts/public-source-files.json and runtime only if packaged. Coordinator handles docs manifest.

## EXECUTION_DAG

Implementation tasks are NOT_STARTED. T01 -> T02/T03 -> T04 -> T05 -> T06. Parallel T02/T03 require disjoint symbol claims; shared-file edits with adjacent owners are serialized.

### T01: Reconcile source and claims

**Deps:** none. **Own/read:** REPO_MAP, original #2141/journal, #2212/adjacent PRs. Read current #1115/#1811 Worker-3 journal and pinned acceptance-r2 before accepting shared registry/ChoiceList/test scope. Refresh main/PRs; record amendments and exact registry/ChoiceList/CSS/test claims. Reproduce current catalog; capture baseline using same after-fixture. Route Copy to #1604.

**Positive/negative tests:** confirm existing pending/error and approval-required flow; measure width, not infer a browser failure from source. Missing runtime/conflicting claim explicitly blocks affected work. **Done/handoff:** SHA, hunks, baseline and gates checkpoint to T02/T03.

### T02: Stable shared presentation

**Deps:** T01. **Own:** Feedback.tsx, indicator/busy feedback.css, feedback-primitives.test.ts blocks. Implement D1, preserving native props/ref/ErrorState. Extend real-browser fixture with held/fast states and short/long labels.

**Tests:** A1/A2/A8: <= 1 px/stable name; immediate disable; <150 ms no spinner; held reveal; reset/unmount cleanup; static reduced/off including toggle. Existing toast/tooltip cases remain. **Done/handoff:** focused suite passes, no unrelated diff; API/CSS contract to T04.

### T03: Required-choice acceptance

**Deps:** T01. **Own:** validation context task-context.ts, provider ArtifactPresentation.tsx, ChoiceList task-interface.tsx/styles, coordinated task-interface.spec.ts block. Freeze D3 registration contract, implement scoped associations/errors/native participation/cleanup; T04 consumes it. Only T04 changes the optional presentation-owner mode in useTaskAction; no concurrent edits to that shared module.

**Tests:** A5/A6/A7: required radio/custom blocks/focuses; correction clears; optional/disabled/hidden/unrelated/foreign fields don't block; remount no stale callbacks; Input/IME preserved. **Done/handoff:** contract/fixtures to T04; integrated cases pass before T05. No Steps/Status/Tabs/schema edits.

### T04: Integrate actions and recovery

**Deps:** T02/T03. **Own:** registry Button/Form/local helper, optional ownerIdentity mode in task-context.ts after T03, submit/status CSS and coordinated tests. Implement D2 with validated current values, invocation ownership, captured summary and 4 s cleanup. Preserve compact structure/payload/compare-and-clear; add Retry and guarded focus. Replace Submitting… test selector with original name + busy.

**Tests:** A2-A7: one exact request; duplicate suppression; acceptance only on current true; approval-required never completed; reject no check/retry current values; newer draft survives; held old request then owner/action/revision change permits one new-owner request; late old rejection cannot display error/acknowledgment or clear new busy; no replay/focus theft. A clearOnSuccess choice clear keeps captured acknowledgment, while a later user edit removes it. **Done/handoff:** scoped integration passes; reviewed symbol diff frozen for T05.

### T05: Interaction and visual evidence

**Deps:** T04. **Own:** action blocks in task-interface.spec.ts, fixture extension only if needed, ignored outputs. Hold existing callback for pending. Intercept only action.submit rejection with HTTP 500 `{error:{code:'ACTION_FAILED',message:'Synthetic request failed. Try again.'}}`; fallback other routes. Do not throw and strand a route.

Add opt-in HARNESS_CAPTURE_ACTION_FEEDBACK=1 to existing suite. Execute A1-A9 using real cursor/keys, geometry/counts, before/after matrix and recording; verify no idle/off animation. Run scoped checks on frozen revision plus manual local path.

**Negative gate:** fixtures cannot prove provider/native success. **Done/handoff:** matrix PASS/FAIL/BLOCKED, redacted evidence, browser/SHA/commands and PR to T06.

### T06: Review, publication and release

**Deps:** T05. **Own:** full issue/Markdown, PR and append-only checkpoint. Reconcile original requirements, request front end review through repository workflow, link #2212/owner integration. No unsolicited external message. Publish complete body and identical SHA-pinned file; read back; record CI/skips.

**Gate:** full source equality and normal review/CI. Queued checks/open PR/review request are not approval/merge. **Done/handoff:** RELEASE OWNER=NONE, reviewer/maintainer recipient and exact remaining gates. Separate completed, merged and verified-on-main.

## VALIDATION

### Setup and commands, planned

Use complete checkout, Node >=24.10.0, pinned pnpm 10.30.3 and repository [source setup](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/docs/getting-started.md). Sparse planning checkout is not a runtime test environment. Use supported Playwright browser and optional existing GEN_TEST_CHROMIUM_EXECUTABLE override; port 5188 free.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm exec vitest run tests/feedback-primitives.test.ts tests/task-interface.test.ts --maxWorkers=1
pnpm exec playwright test --config tests/e2e/task-interface.playwright.config.ts task-interface.spec.ts
pnpm test:ui-guard
pnpm typecheck
pnpm lint
pnpm build
pnpm check:docs-links
```

After T05 adds capture, set HARNESS_CAPTURE_ACTION_FEEDBACK=1 using executing shell syntax. Existing capture is reduced-only and insufficient. Follow CONTRIBUTING for full-suite/Windows CI gates; report actual platform blockers. No fabricated command results.

### Requirements / task / acceptance matrix

| Check | Requirements / tasks | Evidence |
| --- | --- | --- |
| A1 Geometry/name | R1/R2; T02/T04/T05 | Idle/pending/accepted/error/retry bounds<= 1 px; long/static name readable; 29 px preserved. |
| A2 Dispatch | R1/R2/R5; T02/T04/T05 | Click/Enter/Space: one exact action/payload; pending duplicate: zero extra; fast: no spinner; no dispatch delay. |
| A3 Truth | R3/R7; T04/T05 | Acknowledgment only current fulfillment; approval-required never completed; summary captured, not newer/raw values. |
| A4 Recovery | R5; T04/T05 | Rejection: one alert/no check/Retry; retry current validated values once; disabled/missing action: no dispatch. |
| A5 Validation | R6; T03/T04/T05 | Required empty: zero calls/linked exact error/focus; correction clears. Inactive mounted ChoiceList is natively disabled, reactivation restores required validation and retained value, and immediate click/Enter uses current participation. Optional/disabled/unrelated/foreign ignored; unrelated Input constraints still block. |
| A6 Ownership | R4/R7; T03/T04/T05 | Late owner/revision/action/unmount: no replacement feedback; newer drafts retained; no snapshot/theme/policy replay; cleanup proven. |
| A7 A11y | R1/R5/R6; T04/T05 | Tab/Shift+Tab/radio Arrows/Enter/Space/IME/Retry, visible focus/no theft; one pending/result/error announcement, decorative icons excluded. |
| A8 Visual | R8/R10; T02/T05 | Before/after 1920x1080 dark/light x normal/reduced/off; static reduced/off; one full-motion icon transition/no idle effects; 560 px/200% zoom no clipping. |
| A9 Integration | R9/R10; T01/T06 | No new third-party import/dependency/schema/host/telemetry; tests/build/lint/CI recorded; owners reconciled; full publication/readback/front end review. |

Capture identical synthetic data/fonts/viewport before/after, idle/pending/result/error in each theme: app full/OS no-preference, app reduced, app off; additionally OS-reduce/app-full and in-flight policy toggle. Proposed ignored output `test-results/bluma-action-feedback/<sha>/`; manifest includes SHA/browser/viewport/theme/policy/case/rectangles/command counts. Inspect/redact; retain media per CONTRIBUTING, never raw traces/profiles.

Manual 1920x1080 cursor/keyboard catalog and required/error paths plus 560 px/real 200% browser zoom. Windows smoke required for installed-app claims; unavailable stays BLOCKED.

### Actually verified in planning

Read instructions/sources/tests, complete #2141/release, adjacent issue/PR states and relevant patches including #1693. Coordinator inspected public Bluma demos. No product tests, app launch, export audit, visual/native acceptance or performance measurements.

## STATE

Design researched; T01-T06 implementation NOT_STARTED/unclaimed. Coordinator codex-cloud-bluma-bd935d on branch above; publication/readback and planning release are recorded in the parent journal. Implementation handoff awaits owner acknowledgment. Risks: shared registry/ChoiceList/Tabs, open #2011 work, sparse runtime, changing ownership and acceptance mistaken for completion. Source access is unnecessary; Copy stays #1604.

Next implementation action: refresh journals and obtain the acknowledged T01 scope. The complete earlier body is preserved below; the dated amendments above govern their stated boundaries.

## REFERENCES

Bluma source links/observations are in D4; issue/PR links above. [Catalog contract](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/packages/ui-catalog/index.ts) explicitly distinguishes submission acceptance from external completion.

- [Worker-3 acceptance-r2 and shared ownership](https://github.com/skytuhua-org/Gen-V1/blob/8ad7387890cef5f52aeb925fc278ff53f78ac93c/docs/agent-plans/worker-3-forms-charts-shared-motion-acceptance-r2.md)


---

## Preserved earlier issue body

The complete earlier body follows verbatim. Its historical source/status statements describe their named snapshots. The dated supplement above changes only its explicit boundaries; other original requirements and linked continuation plans remain.

<!-- BEGIN PRESERVED ISSUE 2141 -->
# Plan: In-conversation widget form submits must show feedback

## META
- Feature: Submission feedback (busy/success/error) for artifact forms
- Repo: skytuhua-org/Gen-V1, baseline `main` @ `9ddd536c`
- Plan revision: 1 (2026-11-24). Status: plan only.
- Fixture repro: `pnpm build:widgets && pnpm exec vite build` then `node --import tsx --input-type=module -e "import {openReviewHost} from './scripts/review-host.ts'; import {mkdtempSync} from 'node:fs'; import {join} from 'node:path'; import {tmpdir} from 'node:os'; await openReviewHost(mkdtempSync(join(tmpdir(),'genv1-')), 4317)"` → http://127.0.0.1:4317, open thread "Component catalog", pick a color in the "Pick a color" ChoiceList and press "Save choice": the button clicks with no busy state, no success message, no error, and no state change — the user cannot tell whether anything happened.

## OBJECTIVE
- Problem: artifact action buttons that dispatch a `form`/action submit render no pending, success, or failure feedback, so users re-click and cannot trust artifact forms.
- Success: every catalog action submit shows a determinate flow: button enters busy (disabled, "Saving…") on click; on success shows an inline confirmation; on failure shows an inline error with retry; keyboard and screen-reader users get the same outcome announcements.

## REQUIREMENTS
- In scope: the widget action-submit path in `apps/web` (Artifact rendering + catalog `Button` actions with `actionId`, e.g. `save-choice`), and the shared toast/inline status primitives in `packages/ui-shell` (Toast exists — `apps/web/src/CopyButton.tsx` uses `toast`).
- Behavior: on submit, set the button `disabled` + `aria-busy="true"`, swap label to "Saving…" for `save-choice` (per-action label: `"<verb>ing…"` derived from the button label minus trailing punctuation; when a label has no obvious gerund use "Working…"); restore on settle.
- Success: inline status line directly under the action row, `role="status"`, text "Saved." (or the action's `successText` if the catalog schema defines one — discovery), `color: var(--success)`, 13px, weight 400, and the widget's submitted state (selected choice) becomes read-only indication.
- Failure: inline `role="alert"` line under the action row, `color: var(--danger)`, 13px, text "Couldn't save. Try again." plus a "Retry" quiet button that re-submits; button returns to idle.
- Validation: if an action requires a selection (ChoiceList `required`), pressing submit with nothing selected does not dispatch; instead the required field shows `aria-invalid="true"` and an inline error "Pick an option first." in `var(--danger)` 13px under the field, focus moves to the field.
- Keyboard/a11y: button reachable by Tab; busy state announced (`aria-busy`); status/alert via live regions; focus stays on the button after success, moves to the error's Retry after failure is presented? — decision: keep focus on the submit button; the `role="alert"` announces the error and Retry is the next Tab stop.
- Motion: no added animation beyond the existing control transitions; status line appears instantly (no slide/fade) so it is identical under `prefers-reduced-motion: reduce` and normal motion.
- Copy: exact strings — busy "Saving…"; success "Saved."; error "Couldn't save. Try again."; retry "Retry"; required "Pick an option first."

## REPO_MAP
- Catalog schema: `packages/ui-catalog/index.ts` (`Button: {label, actionId, disabled?, tone?, payload?, payloadFromState}` ~line 54) and `packages/ui-catalog/workflow.ts` (`ChoiceList` ~line 59: `stateKey`, `required?`, `disabled?`).
- Widget rendering/receiver: `packages/widgets/receiver.ts`, `packages/widgets/policy.ts`; Artifact host: `apps/web/src/App.tsx` (~line 1197 `<Artifact ... refresh={refresh} ...>`) — discovery: locate the component that maps `Button.actionId` to the submit call; verify whether the silent path is intentional fixture stubbing.
- Toast: `packages/ui-shell/Toast` (used by `apps/web/src/CopyButton.tsx`).
- Fixture scenario: `scripts/review-host.ts` "catalog" thread seeds the "Component catalog" artifact with the ChoiceList + "Save choice" action.

## DESIGN
- Track per-action submit state (`idle | busy | success | error`) in the Artifact host component keyed by `actionId`; the Button's `disabled` prop is OR'd with `busy`.
- Dispatch through the existing action path; wrap the promise — on resolve set `success` for 4s then back to `idle` with the state key marked submitted; on reject set `error` until the next attempt.
- Required-field check runs client-side before dispatch using the ChoiceList `required` + `stateKey` contract; failure sets `aria-invalid` on the field group and renders the inline error.
- Status markup: `<p role="status" className="widget-action-status widget-action-status--success">Saved.</p>` / `--error` variant with `role="alert"`, placed as the next sibling after the action row; 13px Inter 400; `margin-top: 6px`.
- No new tokens: reuse `--success`, `--danger`, `--muted`, `--accent` and the existing `.quiet` button style for Retry.

## EXECUTION_DAG
- T01: Locate the Button→dispatch path and wire per-action state machine + busy UI. Done when clicking "Save choice" in the fixture shows "Saving…" and disables the button.
- T02: Add success/error status lines + Retry + required-field validation with the exact copy above. Done when the three outcomes render correctly in the fixture (force error by dispatching an unknown actionId in a local check, or by stubbing the handler in tests).
- T03: e2e spec asserting busy→success flow, error + Retry, and required-field block, in `tests/e2e/` (follow existing spec conventions). Done when specs fail before and pass after.
- T04: Check narrow width (560px) and dark theme for the status lines; check other `Button` actions unchanged.

## VALIDATION
- Fixture command above; manual pass on "Component catalog" thread: success path, forced error path, empty-submit validation; keyboard-only pass; `pnpm test` + Playwright specs.
- Acceptance: busy label swap, success "Saved.", error "Couldn't save. Try again." + Retry, required error "Pick an option first." — all announced, both themes, 560px width, reduced-motion unchanged.

## STATE
- Verified: in the fixture, "Save choice" produces zero observable feedback (no DOM/status change, no toast, no network-visible state flip). Pending: implementation. Risk: the fixture's action handler may intentionally no-op — the real-app path must be confirmed during T01 discovery before choosing where to surface state.

## REFERENCES
- `packages/ui-catalog/index.ts`, `packages/ui-catalog/workflow.ts`, `packages/widgets/receiver.ts`, `apps/web/src/App.tsx`, `apps/web/src/CopyButton.tsx` (Toast usage), `scripts/review-host.ts`.

<!-- END PRESERVED ISSUE 2141 -->
