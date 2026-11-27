# DIA02: Certify completely consumed bounded flowchart syntax

## META

`skytuhua-org/Gen-V1`; parent [#2230](https://github.com/skytuhua-org/Gen-V1/issues/2230) under [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Revision `PARALLEL-RENDERERS-R1/DIA02`, 2026-11-25. Kind: implementation. Start: **BLOCKED**. Dependencies: [DIA01 #2293](https://github.com/skytuhua-org/Gen-V1/issues/2293).

Verified baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. [Complete AI-DIAGRAM-R1 source](https://github.com/skytuhua-org/Gen-V1/blob/d03d7155e0dc93b790dad014becccfee4eedc1c0/docs/agent-plans/ai-diagram-rendering-adoption.md), historical baseline `96ca4c3bd0664fca53775fbe31915c209641986c`; [docs PR2231](https://github.com/skytuhua-org/Gen-V1/pull/2231) open/unmerged at `d03d7155e0dc93b790dad014becccfee4eedc1c0`. Product work/tests NOT_STARTED/NOT_RUN; no install by this plan.

## OBJECTIVE

Produce a fully consumed bounded flowchart certificate before any expensive engine work. Unsupported or partially understood source must remain exact source, and a failed usefulness gate stops adoption.

## REQUIREMENTS

New pure policy and tests only, no Markdown/caller/package/Worker changes. Input limits before work:16,384 UTF-8 bytes,256 lines,64 nodes,128 edges,96 Unicode code points per label. Preserve original UTF-16 source/CRLF/trailing newline; only the private rendering copy is normalized. Every unknown suffix/statement rejects the whole preview.

Coverage: Diagram T02; R02/R03/R04/R05/R11; A02/A03/A04/A05. Inherited requirements remain binding.

## REPO_MAP

diagram-policy.ts and test are new. Consume DIA01's frozen corpus/contract; no parser success may be inferred from a nonempty engine SVG. beautiful-mermaid's source parser can skip fragments, so Gen supplies a completeness certificate and later engine/output equality checks. This bounded recognizer is not a broader Mermaid parser.

Proposed outputs: `apps/web/src/diagram-policy.ts`, `tests/diagram-policy.test.ts`.

Refresh claims before edits. Reserve/release only these hunks; no cross-feature adoption dependency or epic-wide owner. Relevant renderer source was unchanged between the baseline SHAs.

## DESIGN

Freeze DiagramInput={scopeKey:string,generation:number,source:string,fenceClosure:'incomplete'|'closed-newline'|'closed-eof',finality:'known-final'|'known-static'|'unknown',streaming:boolean}. FlowCertificate={direction:'TD'|'TB'|'LR'|'RL'|'BT',nodes:readonly{id:string,label:string}[],edges:readonly{from:string,to:string,label:string}[]}. certifyFlowchart(input) returns {kind:'eligible',certificate,renderSource} or {kind:'source',reason:'incomplete'|'unsupported'|'budget'|'invalid'}.

Grammar: one graph/flowchart header and direction; one explicit rectangle ID[Plain label] per line; then one edge per line ID --> ID or ID -->|Plain label| ID; blank lines and whole-line %% comments beginning with the required space. Permit surrounding horizontal whitespace only, no semicolons/chains/shorthand. IDs match [A-Za-z][A-Za-z0-9_]{0,63}, declared once before edges; duplicate/dangling IDs reject. Preserve repeated edges as an ordered multiset. Reserved statement IDs include graph,flowchart,subgraph,end,style,classDef,class,linkStyle,click,direction,accTitle,accDescr; verify pinned parser keywords and record any additional reserved literal before freezing the policy tests.

Labels are nonempty plain Unicode, no controls or backticks, and no []{}()<>|\"*~& or backslash. No entities, escapes or Markdown transformation changes a label. Consume every non-comment character with anchored productions; preserve ordered labels/endpoints/direction exactly. Reject other diagram families, directives/frontmatter, subgraphs, click/links, images/icons, styles/classes/linkStyle, HTML/Markdown labels and mixed/unknown syntax wholesale. Private renderSource may normalize line endings/grammar spacing only after exact certification; canonical source is never rewritten.

Incomplete fences are source. closed-newline qualifies with unknown finality, including while later prose streams. closed-eof requires streaming=false AND independently known-final/known-static. False+unknown EOF stays source; streaming=true with known-final/static is contradictory and rejects. A persisted Message or missing live marker is not final proof.

Run all3 useful and20 frozen held-out admission cases before engine installation. All3 and>=16/20 must qualify unchanged. If not, or a broad second parser is needed, publish NO_ADOPT with every reason; do not tune/replace fixtures or silently expand grammar.

## EXECUTION_DAG

**T01.** Consume DIA01's exact corpus hashes and local input/finality contract; add tests for every production, complete consumption and each limit below/at/above boundary.

**T02.** Implement the bounded recognizer and ordered certificate, preserving exact canonical source and private-only normalization. Reject all unsupported suffixes and declarations.

**T03.** Test CRLF/newline/EOF distinctions, Unicode labels, duplicate/reserved IDs, repeated edges, entities, trailing junk, dangling arrows and mixed families. Include65th node/129th edge and byte/line/code-point boundaries.

**T04.** Run the unchanged corpus admission matrix. Publish qualified certificates for [DIA03 #2295](https://github.com/skytuhua-org/Gen-V1/issues/2295)/[DIA04 #2296](https://github.com/skytuhua-org/Gen-V1/issues/2296), or early NO_ADOPT for [DIA08 #2300](https://github.com/skytuhua-org/Gen-V1/issues/2300). No engine installation before the useful admission gate passes.

**Done when:** Complete pure admission/certificate tests and frozen useful-corpus gate pass, or an exact reproducible NO_ADOPT disposition is issued before installing the engine. Handoff: exact SHA, contract/source, actual tests, remaining gates and recipient/ACK.

## VALIDATION

Run pnpm build:widgets; pnpm exec vitest run tests/diagram-policy.test.ts --maxWorkers=1; pnpm typecheck. Verify exact input consumption and canonical bytes, ordered repeated edges and all4 key finality cases: false+unknown EOF rejects; newline+unknown accepts if syntax/bounds pass; false+authoritative final/static EOF accepts; true+final/static rejects. Every admitted graph has a complete certificate, not a success boolean. Engine/output fidelity remains DIA03/DIA04/DIA07 and is not circularly required for this admission result.

Planned, not executed here. Use documented Node>=24.10.0/pnpm10.30.3 and widget/browser setup at repository root. Record actual results; unit/browser/native/assistive proof and PR/merge/main states remain distinct.

## STATE

**BLOCKED:** Needs the frozen representative/held-out corpus and exact contract. No runtime/adoption claim. Assigned worker reads current full plans/journals, verifies dependencies and claims this leaf before T01. Follow AGENTS milestone/20-minute checkpoints, durable full-source handoff and final read-back RELEASE OWNER=NONE. Clear only own markers.

## REFERENCES

- [AGENTS](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/AGENTS.md), [CONTRIBUTING](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/CONTRIBUTING.md); complete source/history above.
- [D02-C allocation](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7171077850).
- [Reference 1](https://github.com/lukilabs/beautiful-mermaid/blob/65f4e0ab8c289e9691a9e5bc4f9eac7108cf449b/src/parser.ts).
