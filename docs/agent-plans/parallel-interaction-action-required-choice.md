# Validate associated required choices with current native visibility

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-R1/ACT02, 2026-11-25. Parent: https://github.com/skytuhua-org/Gen-V1/issues/2141; coordination: https://github.com/skytuhua-org/Gen-V1/issues/2212. Verified baseline: main@defe9884530145e9c109b8ed98f80efac8beeb17. Planning branch: docs/frontend-parallel-work-packets. This leaf's implementation/runtime verification: NOT_STARTED/NOT_RUN; existing PR progress is recorded below. Provenance: complete published bluma-action-feedback.md, current full parent journal, linked PR outcomes and baseline source. The parent is historical context; execute this leaf and its exact dependency outputs.

## OBJECTIVE

Block an associated enabled required ChoiceList that has no valid choice, with exact inline error and usable focus. Hidden or inactive retained choices must not block unrelated active submissions, while native Input validation stays intact.

## REQUIREMENTS

Own R6 and validation parts R1/R4/R5/R7, A5-A7. Exact error Pick an option first., danger13px, aria-invalid/aria-describedby. Native radio/custom constraints and option.disabled remain. Optional, disabled, hidden, inert, unrelated or foreign choices do not block. No label/proximity routing, whole-form disable, noValidate or Tabs/Steps rewrite. Actual user-edit versions must be distinct from accepted clearOnSuccess store writes. Preserve values across hide/reactivate.

Preserve neutral themes, readable names, command/revision/grant owners, focus, selection, IME/keyCode229 and drafts. Motion never delays input or held controls. Effective tokens are consumed once; raw bases scale once. Reduced removes travel/stagger/shimmer with opacity<=80ms; Off/panels-disabled settle immediately, including live changes. No new dependencies, acquisition, schema, persistence, backend, telemetry, bounce, blur, permanent will-change or per-frame React geometry loop.

## REPO_MAP

Own appended private validation context in task-context.ts, provider mount in ArtifactPresentation.tsx, only ChoiceList in task-interface.tsx, .task-choice error rules in task-interface.css. Four files are one behavior because native eligibility and association require renderer/field/form seam; no helper-only scaffolding issue. ACT03 independently owns useTaskAction; finite TASK_CONTEXT_ACTION queue serializes shared-module integration and imports only. ART02 owns registry Tabs, ART03 disclosure, TIP04 toolbar attribute; reserve distinct task-interface.spec.ts describe blocks/import hunks. SecureArtifactScope is read-only.

## DESIGN

Freeze private types in task-context.ts:
ChoiceCapture={instanceId:string;stateKey:string;label:string;valueLabel:string;userEditVersion:number}; ChoiceRegistration={instanceId:string;stateKey:string;fieldset:HTMLFieldSetElement;isEligible:()=>boolean;isRequired:()=>boolean;isValid:()=>boolean;capture:()=>ChoiceCapture;setInvalid:(value:boolean)=>void;focusInvalid:()=>void}; ChoiceValidation={register:(entry:ChoiceRegistration)=>()=>void;syncNativeParticipation:(form:HTMLFormElement)=>void;validate:(input:{form?:HTMLFormElement;mappedKeys:readonly string[]})=>{valid:boolean;captures:ChoiceCapture[]};subscribeUserEdit:(listener:(instanceId:string,version:number)=>void)=>()=>void;notifyUserEdit:(instanceId:string,version:number)=>void}. Provider is per artifact renderer instance; no global registry. Refresh callbacks and unregister on replacement/unmount.

Associate enabled eligible choices inside the submitting form OR keyed by payloadFromState values; standalone Button uses mappedKeys only. Use refs/maps, never unescaped selector values. Validate all associated choices; first invalid usable field receives focus, correction clears its one error. Capture only renderer-approved choice labels, not arbitrary payloads.

ChoiceList owns fieldset.disabled=props.disabled OR !presentationEligible, retaining required flags and store values. Eligibility uses secure-artifact activity, ancestor hidden/inert/aria-hidden and rendered visibility. Sync in layout effect; observe only fieldset/ancestor hidden,inert,aria-hidden,class,style plus relevant resize/visibility changes; cleanup everything. Form capture handlers in ACT04 call syncNativeParticipation before click/implicit-Enter native validation, because onSubmit is too late. Native invalid events expose the same inline error. Maintain an edit-version ref advanced only by ChoiceList user handlers, including custom entry; each handler then calls notifyUserEdit(instanceId,newVersion). Store subscription updates never advance or notify it. Do not read fields from foreign artifact providers.

## EXECUTION_DAG

Dependencies: none. One owner per allocated file/hunk; retain adjacent owners.

1. T01 Refresh #1115/#1811 and reserve ChoiceList/context/provider/style/test hunks. Read W3 retained candidate b0dee7a1998089798fdb57ef3f146da1106492ef before applying changes. Positive: preserve existing work. Negative: no broad shared-helper takeover. Done with narrow ACK.
2. T02 Implement private registration/provider and real associated ChoiceList validity/error/focus using the frozen types. Positive: required radio/custom block, correction clears. Negative: optional/foreign/unmapped excluded. Done with focused tests against actual components, not a fake API.
3. T03 Implement native participation/visibility and current callbacks; expose sync method for ACT04. Positive: inactive mounted field natively disabled, active required blocks again, value retained. Negative: immediate hide/show then click/Enter cannot race observer delivery. Done with browser fixture and cleanup.
4. T04 Implement user-edit capture versions without treating clearOnSuccess as user edit. Positive: native constraints and IME unchanged. Negative: replacement/remount cannot leave registration or timer/listener state. Done with capture and foreign-owner tests.
5. T05 Run scoped checks, publish exact type/API/registration tests and committed dependency output to ACT03/ACT04; RELEASE. Full submit integration waits for ACT04; field behavior must already be independently tested.

## VALIDATION

pnpm exec vitest run tests/task-interface.test.ts --maxWorkers=1; pnpm exec playwright test --config tests/e2e/task-interface.playwright.config.ts task-interface.spec.ts. Add a dedicated required-choice describe block: required radio/custom; optional/disabled; hidden/inert/aria-hidden retained tab/step; immediate visibility change plus click and implicit Enter; select-hide-reactivate retention; unrelated required Input still blocks in both states; instance/provider replacement cleanup. Native eligibility must be checked before default browser validation. All form dispatch counts stay zero for invalid attempts. Host validation remains authoritative.

Planned, NOT_RUN: full checkout at frozen SHA; Node>=24.10, pnpm10.30.3, pinned Bun; pnpm install --frozen-lockfile and actual browser channels named by config. Never substitute another browser for msedge. Build widgets where required. Run focused commands plus pnpm lint, pnpm typecheck, pnpm build and pnpm check:docs-links for touched scope. Compare failures at the same baseline; required Windows CI/review gates remain.

Visible acceptance uses paired synthetic1920x1080/30fps/H.264 with no added titles/captions/overlays. External manifest: scenario, baseline/candidate SHAs, browser/Windows build, theme, actual zoom, policy/speed, commands/counts, limits and verdict. Close contexts, inspect/redact and publish immutable resolving media, not profiles/raw traces. Check dark/light,narrow/short,actual100/125/150% app zoom, keyboard and live System/Reduced/Off/OS/panels-disabled. Browser zoom is not physical DPI; fixtures do not prove native packaging/provider success.

## STATE

READY for bounded implementation after hunk acknowledgment, NOT_STARTED. Actual full form submits require ACT04. ACT03 and ACT01 can draft independently; only shared-module integration is serialized in TASK_CONTEXT_ACTION. Current W3 release does not discard its accepted code or acceptance plan. Next T01.

Checkpoint each milestone or 20 minutes with key/SHA/tests/blockers/next owner. Stop requires read-back RELEASE OWNER=NONE and own-marker cleanup. Unmet gates remain BLOCKED/HANDOFF_PENDING; review, merge and main acceptance are distinct.

## REFERENCES

- Original complete source: https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-action-feedback.md
- Parent/journal: https://github.com/skytuhua-org/Gen-V1/issues/2141
- Verified baseline/rules: https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17
- W3 released evidence: https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7104926319
- W3 remaining acceptance: https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7122916244
- W3 retained candidate: https://github.com/skytuhua-org/Gen-V1/tree/b0dee7a1998089798fdb57ef3f146da1106492ef
