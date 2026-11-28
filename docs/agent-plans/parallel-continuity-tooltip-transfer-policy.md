# TIP02: Implement pure tooltip group-transfer policy

## META

| Field | Value |
| --- | --- |
| Task / revision / date | TIP02; CONTINUITY-PARALLEL-R1; 2026-11-25 UTC |
| Repository / parent | skytuhua-org/Gen-V1; https://github.com/skytuhua-org/Gen-V1/issues/2219 |
| Baseline | main@defe9884530145e9c109b8ed98f80efac8beeb17; docs/frontend-parallel-work-packets |
| Scope / initial state | implementation; READY |
| Prerequisites | none |
| Original source | FRONTEND-TOOLTIP-R1 at 0ccda0526baafe343bff33b72c7f103e600cc51e |

This is a future executable packet, not an implementation or test result. Read current AGENTS.md, CONTRIBUTING.md, this complete leaf and the current parent ownership/checkpoint journal. Historical parent sources are durable references. Claim only this scope; refresh shared hunks before edits. Post milestone/20-minute checkpoints and final RELEASE with OWNER=NONE. Existing claims require explicit release or allocation.

## OBJECTIVE

Implement the small pure decision layer for pointer tooltip warmth and its 300ms internal-group grace. It can be reviewed and tested independently of Tooltip.tsx's pending ARIA integration.

## REQUIREMENTS

Own pure portions of parent R01-R04/R11 and A01-A03. A group warms only after a valid pointer tooltip actually opens. Pending hover and keyboard opening never warm it. Direct same-group transfer is warm; internal whitespace hides the bubble and retains warmth for less than300ms. At300ms or later a new peer is cold. Leaving group/document/modal, invalid owner or dismissal clears state.

Identity includes the actual group DOM boundary, explicit owner-key string, owner document, current native open dialog and nearest ARIA modal region. Same key on another boundary is different; nested groups resolve at the binding. No DOM, timer, event listener, package, network, persistent state or provider in this module.

Create proposed packages/ui-shell/tooltip-transfer.ts and tests/tooltip-transfer.test.ts. Register their source entries and only the module's packaged runtime entry through a short scripts/public-source-files.json reservation. Do not touch Tooltip.tsx/feedback.css while #1976 integration is unresolved.

## REPO_MAP

Baseline packages/ui-shell/Tooltip.tsx contains document delegation, FOCUS_DWELL_MS=100 and configured --ui-tooltip-dwell (currently350ms). It has no grouped warmth. Its existing lifecycle/freshness repair is TIP03, not this pure leaf.

The new helper/test paths are proposed and absent on inspected baseline. TIP03 maps actual DOM owners to opaque reference tokens and calls this module. No new browser fixture is required to verify its arithmetic/identity contract.

## DESIGN

Export this proposed internal API:

```ts
type TooltipGroup = {
  boundary: object; ownerKey: string; document: object;
  dialog: object | null; modal: object | null;
};
type TooltipWarmth = { group: TooltipGroup; deadline: number | null };
type TooltipOpening = 'pointer-cold' | 'pointer-warm' | 'keyboard';
sameTooltipGroup(a: TooltipGroup, b: TooltipGroup): boolean;
pointerOpening(warm: TooltipWarmth | null, group: TooltipGroup | null, now: number): 'pointer-cold' | 'pointer-warm';
openedTooltipGroup(group: TooltipGroup | null, kind: TooltipOpening): TooltipWarmth | null;
gapTooltipGroup(warm: TooltipWarmth | null, now: number): TooltipWarmth | null;
```

sameTooltipGroup compares all five fields by reference/string equality. pointerOpening returns warm only for matching nonnull group with finite now and either null deadline (still open) or now<deadline; otherwise cold. It does not mutate/extend warmth or open a bubble. Null group is always cold.

openedTooltipGroup returns {group,deadline:null} only for a valid pointer opening with nonnull group; keyboard or ungrouped returns null. The binding must call it only after real target eligibility/current help/deadline validation and actual pointer open, never at scheduling time. This is the distinction between pending and warm.

gapTooltipGroup returns null for absent/expired state or invalid now, sets deadline=now+300 on the first transition from open to internal whitespace, and preserves an already unexpired deadline. Repeated descendant/gap movement must not extend grace. A hard reset is simply null. Opening a valid peer resets to open warmth after position/text commit. Same-target descendant motion is ignored by TIP03, never a new entry/dwell.

All records are immutable and bounded to one group. The binding owns event generations, timers, dismissal suppression, keyboard100/cold350 delays and DOM eligibility; this helper owns no clock source. Return a fresh object where appropriate without mutating supplied records.

## EXECUTION_DAG

1. T01: Refresh parent/current source and confirm new paths. Record the pure helper allocation and exact identity/timing API for TIP03; no Tooltip hunk claim.
2. T02: Implement exports and minimal source/runtime registration, without DOM/timer dependency.
3. T03: Add table-driven tests for identity changes, open vs pending/keyboard,299/300 boundary, nonextending grace, expired/invalid/null state and immutability.
4. T04: Run focused tests/typecheck, publish reviewed exact API/SHA and handoff TIP03. Release inventory reservation.

## VALIDATION

Run pnpm exec vitest run tests/tooltip-transfer.test.ts --maxWorkers=1; pnpm typecheck. Run current source inventory validation when changed, using CONTRIBUTING.md's actual command. No mounted/browser/native behavior is claimed by these tests.

V01 same key/different DOM/document/dialog/modal is cold; nested boundary identity differs. V02 only opened pointer group primes; ungrouped/keyboard remain cold. V03 direct same group and299ms gap are warm;300ms is cold. V04 repeated gap calls never restart grace; open warmth has no expiration until exit. V05 hard reset/null/invalid time cannot revive old state and inputs remain unchanged. Cold349/350 and keyboard99/100 timer tests belong to TIP03 with their owning code.

## STATE

PLANNED; READY. No implementation/test result. TIP03 is BLOCKED on this accepted API plus ARIA overlap disposition; no need to wait for that to implement pure policy. Rollback removes unused helper/test/entries, or its consumer first if already integrated. First action T01.

## REFERENCES

- [Full retained parent source](https://github.com/skytuhua-org/Gen-V1/blob/0ccda0526baafe343bff33b72c7f103e600cc51e/docs/agent-plans/frontend-tooltip-warm-transfer.md) preserves wider requirements; this packet embeds its own executable contract.
- [Coordination checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171334812).
- Consumer [TIP03 #2269](https://github.com/skytuhua-org/Gen-V1/issues/2269), actual pilot [TIP04 #2270](https://github.com/skytuhua-org/Gen-V1/issues/2270), native [TIP05 #2271](https://github.com/skytuhua-org/Gen-V1/issues/2271).
- [Existing Tooltip ownership](https://github.com/skytuhua-org/Gen-V1/issues/1976), [merged freshness PR2007](https://github.com/skytuhua-org/Gen-V1/pull/2007), [pending caller-ARIA PR2011](https://github.com/skytuhua-org/Gen-V1/pull/2011).
