# ART04: Preserve editable-record typed drafts and explicit review

## META

| Field | Value |
| --- | --- |
| Task / revision / date | ART04; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/1115 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | implementation; BLOCKED |
| Prerequisites | [ART01 #2258](https://github.com/skytuhua-org/Gen-V1/issues/2258) |
| Original source | BLUMA-ARTIFACT-R1 at cd5860c647507b4b28be51f640bfeae9d447d021 |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

Keep typed drafts, real controls and original source values stable through edits, source refresh and rejection. Explicit Review changes alone submits the exact validated changed cells.

## REQUIREMENTS

Parent R05/R06/R07 and A05 apply only to assigned gaps. Preserve number/range/text/boolean/choice controls, readonly source cells, labels/focus, source/draft distinction, validation and immediate changed count. Controls remain discoverable, not click-to-edit hidden fields.

Only explicit Review changes calls the existing action with {changes:[{rowId,columnId,value}]}. Use typedInteractionValue; omit unchanged/readonly cells, reject invalid values before dispatch and preserve optional null semantics. Rejection leaves latest edits and actionable error. No blur/autosave, per-row Saved or persistence inferred from command acknowledgement.

Keep Artifact edit/persistence/action ownership unchanged. Preserve accepted W3 UI14 64px desktop/67px narrow rows, 120ms dirty/100ms clean emphasis and 80ms Was behavior where integrated. Local emphasis/selection continuity only. Facts/count/error/input update immediately. Off snaps, Reduced has no geometry/stagger; existing policy consumes speed once.

No broad table/chart/ReviewQueue/ParameterControls redesign, schemas, catalog props, dependencies, network/routes/host/storage changes. task-context.ts/useTaskAction receipts/generation belong to #2141.

## REPO_MAP

apps/web/src/InteractionTools.tsx: EditableTable parses bounded data; FieldControl maps typed/native/shared Select controls; edits live under statePath(stateKey). Existing submit iterates source rows/columns, validates and emits typed changes. Local Source details exposes provenance.

Reserve only EditableTable, strictly needed FieldControl continuity and their interaction-tools.css selectors. Tests/e2e/interaction-tools.spec.ts runs through clarity-review-parameters.playwright.config.ts. ReviewQueue/ParameterControls share the module but are not implementation scope; existing regressions run if FieldControl changes affect them.

## DESIGN

Use authoritative row/column IDs, not visual indexes. Draft ownership is artifact/stateKey/rowId/columnId. Emphasis must not replace input nodes, move focus or normalize partial numeric typing. Validate at existing explicit-review boundary.

Readonly cells always render source, never stored draft overrides. Original source stays discoverable beside changed draft; count reflects current typed comparisons. Preserve current-source reconciliation and action receipt semantics during held requests. A new cross-owner receipt rule is an evidenced #2141 blocker, not an implicit addition.

Motion changes emphasis only and cannot gate values/errors, disable fields for presentation or delay review. Keep spinbutton keyboard/IME guards, choice/null mapping, required validation and readonly semantics. Rollback is the narrow continuity diff; no migration.

## EXECUTION_DAG

1. T01: Read ART01 candidate/matrix and current module owners. Reproduce assigned record gaps; reserve EditableTable/FieldControl/CSS/test blocks or return VERIFIED_EXISTING.
2. T02: Make the smallest local identity/emphasis/validation-presentation fix preserving exact source/draft/action APIs.
3. T03: Extend owning tests with partial typed input, boolean/choice/null, readonly override rejection, immediate count, invalid explicit review, exact payload and held/rejected requests retaining newer edits.
4. T04: Run focused checks and inspect source refresh/held motion in actual records. Publish reviewed code/test/film SHAs, handoff ART05 and release the shared hunk.

## VALIDATION

Run pnpm build:widgets; pnpm exec playwright test --config tests/e2e/clarity-review-parameters.playwright.config.ts; pnpm typecheck; pnpm build. Use synthetic record/action ledgers; retain actual errors/counts. Planned only in this document.

V01 controls, node/focus identity and partial drafts persist. V02 readonly source, Was values and count are truthful/immediate. V03 blur/hover/tab/focus recovery emits no action; explicit valid review emits one exact ordered typed payload. V04 invalid review emits none; rejection preserves newer edits and no Saved claim. V05 held motion, live Reduced/Off and IME do not lose input/selection. V06 compact layout/focus remains usable dark/light, narrow/short and app zoom 100/125/150%.

UI14 before/after: fixed SHA, synthetic 1920x1080/30fps/H.264, no embedded titles/overlays, external captions/hashes. ART05 supplies native/assistive evidence; original W3 eight/29/24 gates remain #1811.

## STATE

PLANNED; BLOCKED on ART01. No product/test result. Retain #1152/#1254 and later W3 outcomes rather than reimplement them. Done means focused review/checks/durable handoff, with merged/main/native states separately recorded. First executable step T01 after matrix ACK.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-artifact-continuity-supplement.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- Predecessor [ART01 #2258](https://github.com/skytuhua-org/Gen-V1/issues/2258), native recipient [ART05 #2262](https://github.com/skytuhua-org/Gen-V1/issues/2262).
- [Actions](https://github.com/skytuhua-org/Gen-V1/issues/2141), [W3 milestone](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7092025158), [integrated acceptance](https://github.com/skytuhua-org/Gen-V1/issues/1811).
