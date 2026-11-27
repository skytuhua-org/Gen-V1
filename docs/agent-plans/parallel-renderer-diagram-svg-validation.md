# DIA04: Validate static SVG against the flowchart certificate

## META

`skytuhua-org/Gen-V1`; parent [#2230](https://github.com/skytuhua-org/Gen-V1/issues/2230) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/DIA04`, 2026-11-25. Kind: implementation. Start: **BLOCKED**. Dependencies: [DIA02 #2294](https://github.com/skytuhua-org/Gen-V1/issues/2294).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-DIAGRAM-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-diagram-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Admit only a detached, static, resource-free SVG whose semantic and visible content exactly matches the complete flowchart certificate. It must reject a plausible but incomplete or hostile picture before connection.

## REQUIREMENTS

Independent SVG validator and focused browser fixture, no caller/Worker/presentation changes. Output limits before/while parsing:<=256KiB,<=2,048elements,depth<=32, finite positive width/height<=4,096CSS units. No unchecked innerHTML, regex-only sanitizer, executable/HTML/config/resource content, arbitrary CSS or cross-instance IDs. No source-derived requests even during parse/validation.

Coverage: Diagram T04 validation; R02/R05/R06/R08; A03/A07/A09. Inherited requirements remain binding.

## REPO_MAP

diagram-svg.ts and validation fixture/spec/HTML are proposed. Browser DOMParser supplies inert XML parsing; Node Vitest has no assumed jsdom. Use existing Vite fixture pattern and micro-motion config registration through a short reservation. DIA02 supplies certificates; actual DIA03 engine replies must later pass the same validator. Source-backed engine styles/Google font imports and static marker IDs make validation mandatory.

Existing narrow hunks: `tests/e2e/micro-motion.playwright.config.ts`, `scripts/browser-suites.ts`.

Proposed outputs: `apps/web/src/diagram-svg.ts`, `tests/e2e/diagram-svg.spec.ts`, `tests/e2e/diagram-validation-fixture.tsx`, `tests/e2e/diagram-validation.html`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Freeze validateDiagramSvg(svg:string,certificate:FlowCertificate,instancePrefix:string): {kind:'svg';element:SVGSVGElement}|{kind:'source';reason:string}. Success returns a newly built detached trusted SVG, not a string intended for unchecked insertion. Reject DOCTYPE/entity declarations and processing instructions before XML parsing; reject parser errors. Parse only bounded output and admit by explicit element/attribute/value allowlists.

Initial elements are svg,g,defs,marker,rect,polyline,polygon,text,tspan,title,desc. Strip every engine style element and inline style before connection, including encoded imports/URLs; no engine CSS survives. Rebuild styles from fixed Gen CSS/tokens/local Inter/system fonts. Reject script,foreignObject,image,use,a,events,animation,external namespaces,unknown meaningful elements/classes,resource URLs and unknown attributes. Define exact allowed numeric/geometry/semantic/class/reference attributes from the pinned engine output in the validator tests; unknown forms reject wholesale. No adding a permissive pass-through to accommodate output.

Validate finite coordinates, bounded point lists, duplicate IDs, missing targets and reference cycles. Only validated local references are allowed; rewrite all referenced IDs with a caller-supplied unique inline/modal prefix and reject cross-instance references. instancePrefix comes from app identity, never model source. No Google Fonts/CDN/@font-face/images/telemetry. All markup remains detached until successful completion.

Check direction, ordered node data-id/labels, edges data-from/to/label and multiplicity plus visible text against the certificate after style removal/rebuild. Missing/extra/renamed/dropped text/topology rejects the entire preview. A nonempty SVG or engine success is insufficient. If pinned output cannot establish complete faithful semantics within this bounded validator, publish NO_ADOPT rather than inventing a second broad parser or stripping meaningful content.

## EXECUTION_DAG

**T01.** Read pinned renderer/theme source and DIA02 certificate; freeze admitted engine element/attribute/class forms and malicious fixture cases. Register the exact isolated validation HTML/spec with a short config reservation.

**T02.** Implement bounded preflight and inert parse, strict allowlists and trusted-node reconstruction. Strip all styles before any connection and reject unknown meaningful output.

**T03.** Implement local ID/reference rewriting and certificate/visible-label equality, including repeated edges, direction and label Unicode. Keep successful output detached.

**T04.** Run browser request interception before parse against encoded styles/fonts/resources, malformed XML and hostile elements; test duplicate/cyclic/missing/cross-instance IDs, huge geometry/tree and semantic mismatches.

**T05.** Hand the exact detached SVG API and passing synthetic fixtures to [DIA05 #2297](https://github.com/skytuhua-org/Gen-V1/issues/2297). Receive DIA03 real output for acceptance before integration; a fixture-only pass never establishes engine fidelity. Release validator files.

**Done when:** Strict detached validation and request/topology/ID tests pass. Real engine output still must pass this exact policy; inability yields NO_ADOPT, never unchecked SVG publication. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm typecheck; pnpm build; register/run diagram-svg.spec.ts under tests/e2e/micro-motion.playwright.config.ts. Intercept network before XML parsing and require zero diagram-derived requests for encoded @import/url/font payloads, image/use/foreignObject/anchor/event variants and offline reopens. Every forbidden/unrecognized node/attribute, invalid local reference, output limit breach and missing/extra certificate item yields source. Two inline copies and a modal copy must have disjoint IDs with only local references. Observe no forbidden connected DOM or CSS leakage.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Needs the certificate contract; can run fixture validation in parallel with Worker work. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/src/renderer.ts).
- [Reference 2](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/src/theme.ts).
