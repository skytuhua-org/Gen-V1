# DIA09: Audit the exact engine and build its certified Worker entry

## META

`skytuhua-org/Gen-V1`; parent [#2230](https://github.com/skytuhua-org/Gen-V1/issues/2230) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/DIA09`, 2026-11-25. Kind: implementation. Start: **BLOCKED**. Dependencies: [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293), [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-DIAGRAM-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-diagram-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Provide a small Worker-only engine adapter that verifies the complete graph before layout, emits bounded replies and retains the exact tested dependency/license closure. Client queue/cache/cancellation belongs to DIA03.

## REQUIREMENTS

Pin beautiful-mermaid1.1.3@65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b; verify actual artifact/integrity/current advisories/closure before install. Source ranges include elkjs^0.11.0 and entities^7.0.1, inspected exact0.11.0 EPL-2.0 and7.0.1 BSD-2-Clause with engine MIT. Do not claim whole closure MIT, automatic incompatibility or a changed version. No main-entry import, DOM, host bridge, credential/file/tool authority or diagram-derived network.

Coverage: Diagram T03 engine/package portion; R02/R05/R06/R10; A02/A03/A07/A12. Inherited requirements remain binding.

## REPO_MAP

New diagram-engine.ts isolates public parseMermaid/renderMermaidSVG use; new diagram-worker.ts imports it as a real module Worker. Node tests cover the real adapter; DIA01 supplies an entry-only Worker build command. DIA01 gives actual Vite/CSP/package paths and DIA02 the complete certificate. Shared package/lock/notices/manifest hunks are short reservations, preserving #1530's unreleased overlapping claim.

Existing narrow hunks: `package.json`, `pnpm-lock.yaml`, `THIRD_PARTY_NOTICES.md`, `apps/web/src/dependency-notices.ts`, `scripts/public-source-files.json`.

Proposed outputs: `apps/web/src/diagram-engine.ts`, `apps/web/src/diagram-worker.ts`, `tests/diagram-engine.test.ts`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Freeze DiagramJob=DiagramInput & {requestId:number,certificate:FlowCertificate,renderSource:string}; DiagramReply={requestId,scopeKey,generation} & ({kind:'rendered',svg:string}|{kind:'source',reason:string}). Worker sends {kind:'ready'} only after engine import, then one matched DiagramReply per job. Keep these readonly shared types with DIA02's policy contract through a narrow acknowledged type-only hunk, not duplicated drifting interfaces.

Export renderCertifiedDiagram(job:DiagramJob):DiagramReply from diagram-engine.ts. Recheck source16,384UTF-8bytes/256lines/64nodes/128edges/96label points and certificate/input identity before work. Compare parseMermaid's logical direction, ordered IDs/labels, endpoints and repeated-edge multiset with the full Gen certificate before calling renderMermaidSVG. Any missing/extra/renamed/dropped semantic item returns source; no success from nonempty SVG. If public engine output cannot establish equality, reject adoption rather than patching unknown semantics.

Render with trusted app constants only, never model config/styles/options. Output cap256KiB applies before posting; DIA03 rechecks on receipt and DIA04 validates nodes/depth/dimensions/styles/resources before connection. Catch exceptions as fixed reason strings with no raw source/error telemetry. The async alias is not offloading; only this real Worker execution counts. DIA03 owns2,000ms startup/750ms layout termination externally, not a timeout after synchronous work.

Audit installed package files/license/font/style imports and add exact dependency/lock/notices/source entries through the package workflow. Retain required EPL/BSD/MIT distribution notices and source handling as reviewed; no fabricated integrity. Build path is same-origin packaged Worker chunks, engine absent from initial entry. CSP or production loading failure stays source. Real packaged behavior is verified later; no relaxation.

## EXECUTION_DAG

**T01.** Verify DIA01's reviewed feasibility/license contract and DIA02's all3/>=16of20 unchanged admission gate. Reserve exact package/lock/notices/source entries and record real archive/closure hashes.

**T02.** Implement diagram-engine.ts certificate-before-layout checks and bounded fixed-error reply using only public pinned exports. Add real-engine positive and mismatch/output-limit tests.

**T03.** Implement the minimal module Worker entry and ready/job/reply protocol without host authority or main-thread fallback. Register source paths and compile the entry using DIA01's explicit entry-only build.

**T04.** Inspect the built Worker entry and local dependency graph, retain complete notices and hand exact protocol/output fixtures to [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295)/[DIA04 #2296](https://github.com/skytuhua-org/Gen-V1/issues/2296). Release dependency and Worker-entry hunks.

**Done when:** Exact reviewed artifact/closure/notices and a minimal certified Worker entry are independently reviewable; public protocol and real output fixtures are frozen for client/validator workers. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm build:widgets; pnpm exec vitest run tests/diagram-policy.test.ts tests/diagram-engine.test.ts --maxWorkers=1; pnpm typecheck; pnpm build; public-source.test.ts. Positive real-engine fixtures must match complete certificates. Negative: valid-prefix/junk, missing/extra/renamed node or edge, repeated-edge count/direction/label mismatch, oversize source/output and exceptions return source with bounded fixed errors. Compile the Worker entry with DIA01's command. DIA03 proves the integrated production import graph, initial-entry exclusion and interruption; DIA08 proves packaged/offline behavior.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Engine installation requires DIA01 feasibility and DIA02 unchanged-corpus admission before work. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/src/index.ts).
- [Reference 2](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/src/elk-instance.ts).
- [Reference 3](https://github.com/kieler/elkjs/blob/37e798513db6e88b2e205b8239ed4e387d5f24d0/LICENSE.md).
- [Reference 4](https://github.com/fb55/entities/blob/994259f32eba1c822c16da075656f745c493c560/LICENSE).
