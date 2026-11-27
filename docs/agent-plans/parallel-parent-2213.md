# Parallel execution for issue #2213

## META

Repository: skytuhua-org/Gen-V1. Revision: FRONTEND-PARALLEL-PARENT-2213-R1, 2026-11-25. Coordination parent: [#2213](https://github.com/skytuhua-org/Gen-V1/issues/2213). Program and consolidated journal: [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Verified planning base: main@defe9884530145e9c109b8ed98f80efac8beeb17. Previous complete body: 21290 UTF-8 bytes, SHA-256 13479f9143daab6637c08709ea825a58875403249b62f5257ef547195d991b1f, reproduced unchanged below. The publication header supplies this revision's immutable file and reviewed documentation PR. Product implementation, review, merge and verified-on-main remain separate states.

## OBJECTIVE

Replace a broad single-worker assignment with 6 bounded, separately claimable tasks. Independent provenance, a bounded recorder option, three evidence cohorts with exact fixture ownership, and independent acceptance are separate reviewable deliverables. Existing component implementation and separate integrated acceptance remain retained. Success means each worker can complete one explicit outcome from its own full issue, source and input commits, while unrelated workers proceed independently. This parent coordinates coverage and final acceptance; it does not reserve every child or shared file for one agent.

## REQUIREMENTS

R01: Preserve all substantive prior product requirements, exclusions, accepted interfaces, examples, validation and closure criteria. The full prior body is retained below, and the coverage table maps it to the new allocation.

R02: Each child is one coherent outcome with code and its focused tests together, a bounded file scope, explicit input/output contracts, positive and negative checks, observable done-when and next recipient. A discovery child must deliver a reusable reviewed contract or concrete decision, not merely setup notes. If new evidence makes any child too broad for one worker, split it again before implementation and update this full plan.

R03: Existing authorized claims, PRs and completed evidence retain their ownership and meaning. Verify and reuse matching completed work. Do not reimplement it or infer abandonment from silence. A parent claim cannot take another worker's leaf or an entire shared module.

R04: Required task outputs are functional dependencies. Shared-file integration ordering is a separate finite hunk queue. Independent drafts/tests can proceed before another feature is adopted. BLOCKED identifies an exact unavailable input or owner allocation; it does not grant a worker ownership while waiting.

R05: Preserve runtime safety, focus/selection/input, source identity, cancellation/staleness, accessibility, motion policy and native acceptance from the complete prior specification. No new installation, schema, telemetry, source acquisition or feature expansion is authorized by a planning-only publication. Receiver execution follows the applicable accepted child scope and current repository rules.

R06: Full issue bodies and identical SHA-pinned Markdown must be retrievable. Parent closure requires all original required acceptance, not just all plan documents or child PRs being merged. A truthful blocked or rejected trial is not a passing product test.

## REPO_MAP

The exact proposed implementation/review boundaries are below. New paths are proposed until their child creates them. Read each child's full REPO_MAP and current main before changing a file. The source-manifest entry for a new source/test/document travels with that leaf; runtime entries change only when the original accepted runtime contract requires them.

| Child | Exact allowed paths or discovery |
| --- | --- |
| [REF01 #2234](https://github.com/skytuhua-org/Gen-V1/issues/2234) | docs/design/bluma-reference-ledger.md |
| [REF02 #2235](https://github.com/skytuhua-org/Gen-V1/issues/2235) | test-results/bluma-ref02-<sha>/ (ignored evidence only); scripts/capture-ui/screen-map.ts (named pattern entries only); tests/e2e/ui-shell-controls-fixture.tsx; tests/e2e/generated-selects-fixture.tsx |
| [REF03 #2236](https://github.com/skytuhua-org/Gen-V1/issues/2236) | test-results/bluma-ref03-<sha>/ (ignored evidence only); scripts/capture-ui/screen-map.ts (named pattern entries only); tests/e2e/model-composer-refinement-fixture.tsx; tests/e2e/conversation-find-fixture.tsx; tests/e2e/task-interface-fixture.ts |
| [REF04 #2237](https://github.com/skytuhua-org/Gen-V1/issues/2237) | test-results/bluma-ref04-<sha>/ (ignored evidence only); scripts/capture-ui/screen-map.ts (named pattern entries only); scripts/capture-ui/task-data.ts; scripts/capture-ui/task-surfaces.tsx; scripts/task-design-scenes.ts |
| [REF05 #2238](https://github.com/skytuhua-org/Gen-V1/issues/2238) | docs/design/bluma-reference-ledger.md |
| [REF06 #2257](https://github.com/skytuhua-org/Gen-V1/issues/2257) | scripts/review-capture.ts; scripts/record-task-design.ts; tests/capture-ui/recording-cursor.test.ts; tests/capture-ui/recording-teardown.test.ts; tests/capture-ui/recording-failure.test.ts |

Existing work and ownership inspected during planning:

| Existing issue / PR | Inspected head | Current scope and release evidence |
| --- | --- | --- |
| [#2213](https://github.com/skytuhua-org/Gen-V1/issues/2213) / [PR #2215](https://github.com/skytuhua-org/Gen-V1/pull/2215) | cd5860c647507b4b28be51f640bfeae9d447d021 | docs PR open/unmerged; review released; no product claim [Journal](https://github.com/skytuhua-org/Gen-V1/issues/2213#issuecomment-7170805669) |
| [#1811](https://github.com/skytuhua-org/Gen-V1/issues/1811) | dd9cf46b52ecc79b579a0a282948444ed6f7deaa | Separate integrated acceptance unmet; historical W3 release, no new allocation by this plan [Journal](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7104926319) |

## DESIGN

Claim a single child key and its exact paths on this parent, link that claim from the child, and include the canonical program journal when coordinating across parents. Read the entire assigned child, its immutable source and comments, plus the current parent allocation and relevant ownership journals first. Each child embeds its executable contract; the full retained historical parent remains available for provenance, acceptance audit and conflict recovery. A coordinator assigned the parent reads that full parent scope. The child consumes only the dependency output SHA and interface named in its plan. A receiver ACKs that artifact before work; it does not need ownership of the upstream feature.

Pure helpers and their tests can be drafted in parallel. Integration workers reserve only the named shared hunk, refresh current main and owner journals, integrate one bounded commit, publish focused verification and release the reservation. Do not reserve a file for the life of an epic. Current owner ACK is required for overlapping unpublished product work. A failed or rejected optional renderer may release an unchanged baseline slot so other independent renderer work continues.

| Shared files or seam | Participants | Integration rule |
| --- | --- | --- |
| scripts/capture-ui/screen-map.ts | [REF02 #2235](https://github.com/skytuhua-org/Gen-V1/issues/2235), [REF03 #2236](https://github.com/skytuhua-org/Gen-V1/issues/2236), [REF04 #2237](https://github.com/skytuhua-org/Gen-V1/issues/2237) | Reserve only named pattern entries for missing accepted deterministic states; commit and release each finite recipe change. No wholesale registry ownership. |
| scripts/capture-ui/task-data.ts, scripts/capture-ui/task-surfaces.tsx, scripts/task-design-scenes.ts, tests/e2e/task-interface-fixture.ts | [REF03 #2236](https://github.com/skytuhua-org/Gen-V1/issues/2236), [REF04 #2237](https://github.com/skytuhua-org/Gen-V1/issues/2237), [ART02 #2259](https://github.com/skytuhua-org/Gen-V1/issues/2259), [ART03 #2260](https://github.com/skytuhua-org/Gen-V1/issues/2260), [ART04 #2261](https://github.com/skytuhua-org/Gen-V1/issues/2261), [ACT04 #2247](https://github.com/skytuhua-org/Gen-V1/issues/2247) | Reuse component-owner states first. Exact fixture/scene hunk ACK and finite integration; no duplicate components, invented success or takeover of retained PR work. |
| scripts/review-capture.ts, scripts/record-task-design.ts | [REF06 #2257](https://github.com/skytuhua-org/Gen-V1/issues/2257) | REF06 owns only recorder cursor-mode and CLI/help/manifest plumbing; pattern scene/action changes stay with acknowledged evidence/component owners. |

Unanticipated interface/schema changes return to the exact discovery owner for a reviewed full-plan revision. Required schema, writers, readers and decoders land atomically in one compatible PR. Rollback is per leaf and preserves other accepted children; no sweeping source resets or replacement of existing PRs.

## EXECUTION_DAG

The table contains functional dependencies and initial planning readiness. READY means the bounded task may be claimed after normal current-journal checks. It is not permission to bypass an existing owner, failed prerequisite or native release gate. The full executable T01... steps, tests and handoff are in each linked child.

| Task | Bounded deliverable | Kind | Required task outputs | Start state |
| --- | --- | --- | --- | --- |
| [REF01 #2234](https://github.com/skytuhua-org/Gen-V1/issues/2234) | Bluma reference ledger: six decisions and source provenance | discovery | None | READY: Bounded provenance ledger |
| [REF02 #2235](https://github.com/skytuhua-org/Gen-V1/issues/2235) | Shared controls: collect and verify comparable reference evidence | verification | [REF01 #2234](https://github.com/skytuhua-org/Gen-V1/issues/2234) | BLOCKED: Wait for exact ledger/candidate/evidence artifacts; no component ownership transfer |
| [REF03 #2236](https://github.com/skytuhua-org/Gen-V1/issues/2236) | Composer: collect and verify comparable reference evidence | verification | [REF01 #2234](https://github.com/skytuhua-org/Gen-V1/issues/2234) | BLOCKED: Wait for exact ledger/candidate/evidence artifacts; no component ownership transfer |
| [REF04 #2237](https://github.com/skytuhua-org/Gen-V1/issues/2237) | Generated surfaces: index and verify existing comparison evidence | verification | [REF01 #2234](https://github.com/skytuhua-org/Gen-V1/issues/2234) | BLOCKED: Wait for exact ledger/candidate/evidence artifacts; no component ownership transfer |
| [REF05 #2238](https://github.com/skytuhua-org/Gen-V1/issues/2238) | Bluma evidence: review six dispositions and close only the evidence scope | verification | [REF01 #2234](https://github.com/skytuhua-org/Gen-V1/issues/2234), [REF02 #2235](https://github.com/skytuhua-org/Gen-V1/issues/2235), [REF03 #2236](https://github.com/skytuhua-org/Gen-V1/issues/2236), [REF04 #2237](https://github.com/skytuhua-org/Gen-V1/issues/2237), [REF06 #2257](https://github.com/skytuhua-org/Gen-V1/issues/2257) | BLOCKED: Wait for exact ledger/candidate/evidence artifacts; no component ownership transfer |
| [REF06 #2257](https://github.com/skytuhua-org/Gen-V1/issues/2257) | Make the existing review recorder omit synthetic cursor overlays | implementation | None | READY: Bounded current recorder/consumer gap; source confirmed unconditional synthetic cursor injection. |

Parent coordination tasks:

1. T01, verify allocation: refresh all complete child bodies, current candidate heads and latest owner releases. Output one accepted input/version record per claimed leaf. Positive: exact SHA and scope; negative: no silent-owner takeover. Done when the first leaf can ACK its inputs.
2. T02, coordinate independent work: assign only ready leaf keys and exact paths. Keep functional dependencies separate from hunk reservations. Publish each bounded output and its focused checks. Done when ready receivers can consume concrete artifacts.
3. T03, review coverage and integration: use the map below to review every original requirement against actual evidence, including existing completed work. A document/fixture/mock does not prove native behavior. Done when every row has PASS, a permitted reasoned non-adoption disposition, or an explicit blocker.
4. T04, final handoff: publish full status, immutable artifacts, current CI/review/main state, remaining gates and RELEASE OWNER=NONE. Close this parent only after the original accepted closure conditions are met and closure is authorized. Otherwise leave open with the exact remaining owner/input.

## VALIDATION

Requirement-to-task coverage:

| Prior requirement, design, task or acceptance | Current child allocation | Preservation note |
| --- | --- | --- |
| R01-R03; T01; A01 | [REF01 #2234](https://github.com/skytuhua-org/Gen-V1/issues/2234), [REF05 #2238](https://github.com/skytuhua-org/Gen-V1/issues/2238) | Six source/provenance rows and independent verdict |
| R04,R08; T02; A02 | [REF01 #2234](https://github.com/skytuhua-org/Gen-V1/issues/2234), [REF02 #2235](https://github.com/skytuhua-org/Gen-V1/issues/2235), [REF03 #2236](https://github.com/skytuhua-org/Gen-V1/issues/2236), [REF04 #2237](https://github.com/skytuhua-org/Gen-V1/issues/2237), [REF05 #2238](https://github.com/skytuhua-org/Gen-V1/issues/2238), [REF06 #2257](https://github.com/skytuhua-org/Gen-V1/issues/2257) | Exact pattern recipe/fixture edits belong to REF02-REF04 with finite owner ACKs; REF06 owns the missing no-cursor helper/consumer route. New fixture breadth requires another explicit small-task split. |
| R05-R07; T03; A03-A05 | [REF02 #2235](https://github.com/skytuhua-org/Gen-V1/issues/2235), [REF03 #2236](https://github.com/skytuhua-org/Gen-V1/issues/2236), [REF04 #2237](https://github.com/skytuhua-org/Gen-V1/issues/2237), [REF05 #2238](https://github.com/skytuhua-org/Gen-V1/issues/2238), [REF06 #2257](https://github.com/skytuhua-org/Gen-V1/issues/2257) | Independent control/composer/generated evidence bundles preserve all formats and negative cases |
| R01-R08; T04; A06 | [REF05 #2238](https://github.com/skytuhua-org/Gen-V1/issues/2238), [REF06 #2257](https://github.com/skytuhua-org/Gen-V1/issues/2257) | Evidence closure only after accepted rows, not documentation merge; #1811 remains separate |

Publication checks: A01 (R01/T03), every prior substantive row mapped and full prior body retained byte-for-byte; A02 (R02/T01-T02), every child has all nine mandatory plan sections, executable steps and meaningful positive/negative checks; A03 (R03-R04/T01-T02), DAG has no cycles or missing tasks, native GitHub parent/child link completion is verified against this table and any unavailable relationship mutation is explicitly reported in the publication journal, and only exact hunk reservations serialize integration; A04 (R05/T03), product-specific safety/native/motion/evidence gates remain explicit and unexecuted checks are not reported as passing; A05 (R06/T04), final source/body/continuation readback matches exact UTF-8 bytes and published claims are released.

Run git diff --check and node scripts/check-doc-links.mjs for the documentation publication. Product unit/integration/browser/Windows/assistive and capture commands are in the full child/prior plans and run only during their authorized execution. No application tests or footage are executed by this planning revision.

Recordings retain the user's existing requirements: synthetic comparable scenarios, 1920x1080, 30fps, H.264, real interaction speed, no added titles, labels or simulated cursor overlays. Record source SHAs, actual environment/settings, hashes, limitations and verdict outside the footage. Browser zoom and fixtures do not prove native DPI or packaged behavior.

## STATE

Allocation and detailed plans are prepared for publication; immutable body/file verification and native links are recorded in the latest publisher journal. Future leaf execution remains unclaimed unless a current explicit child scope says otherwise. Existing implementation evidence listed above remains valid only for its recorded SHA and acceptance rows.

Next: start with a READY child after full current-journal/input readback; claim that leaf's narrow scope, publish milestones and release before pausing. On each milestone or at most 20 minutes of active work, checkpoint the canonical parent with child key, source SHA, exact checks, gaps and next action. Coordinator consolidates cross-parent handoffs on #2212. No worker receives an exclusive parent-wide implementation assignment.

## REFERENCES

- [Program and full coordination journal](https://github.com/skytuhua-org/Gen-V1/issues/2212)
- [Current parent and complete history](https://github.com/skytuhua-org/Gen-V1/issues/2213)
- [Verified planning base and repository instructions](https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17)
- [Original documentation publication #2215](https://github.com/skytuhua-org/Gen-V1/pull/2215)
- [Continuity documentation publication #2221](https://github.com/skytuhua-org/Gen-V1/pull/2221)
- [Renderer documentation publication #2231](https://github.com/skytuhua-org/Gen-V1/pull/2231)

## Previous accepted canonical body, retained in full

This archive is the complete issue body read before this subdivision. Its product requirements, exclusions, evidence, examples and prior revision history remain binding. Its previous execution grouping is replaced by the child allocation above. Historical status is a snapshot, not a claim that a current PR is merged or that acceptance passed.

<!-- BEGIN PRIOR CANONICAL BODY -->
## Publication record

**Revision:** `BLUMA-REFERENCE-R1`  
**Complete Markdown:** [bluma-reference-and-evidence.md](https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-reference-and-evidence.md)  
**Documentation PR:** [#2215](https://github.com/skytuhua-org/Gen-V1/pull/2215)  
**Program and verification journal:** [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212#issuecomment-7167211508)

**Change record:** Initial complete plan. Optional source provenance and reused comparison fixtures; #1811 acceptance remains separate.

This publication changes planning documents only. Product implementation and its acceptance remain pending. Existing implementation claims and PRs are preserved. The canonical plan below is reproduced completely and matches the committed Markdown; any earlier issue body is retained verbatim within that source.

<!-- BEGIN CANONICAL PLAN -->
# Bluma adoption: provenance and comparable component evidence

## META

| Field | Value |
| --- | --- |
| Revision / date | `BLUMA-REFERENCE-R1` / 2026-11-25 |
| Repository / inspected baseline | `skytuhua-org/Gen-V1` / `main@96ca4c3bd0664fca53775fbe31915c209641986c` |
| Canonical parent | [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212) |
| Canonical issue | [#2213](https://github.com/skytuhua-org/Gen-V1/issues/2213) |
| State | Plan ready; implementation `NOT_STARTED`; `OWNER=NONE` |
| Scope | Reference decisions, source provenance and narrowly reused comparison fixtures |
| Source artifact | `docs/agent-plans/bluma-reference-and-evidence.md`; identical full issue body and SHA-pinned source link supplied at publication |

## OBJECTIVE

Make Bluma-inspired changes reproducible and reviewable against the actual Gen-V1 components. Record exactly which interaction is being adapted, which existing issue owns the change, and whether any third-party source was actually acquired. Use the existing capture/test infrastructure and actual production renderers to show before/after results. This issue does not implement the component improvements or replace the existing #1811 acceptance program.

The 2026-11-25 review opened 22 Bluma component previews and exercised representative interactions. The useful references are continuity between states, compact feedback and anchored spatial relationships. The site supplies Web, React and SwiftUI variants, but source retrieval was account-gated. No component source, dependency graph or license grant for a particular downloaded file was inspected. The observed MCP page says delivered files are minified. A public preview is visual evidence, not proof of redistributable source.

## REQUIREMENTS

| ID | Required result |
| --- | --- |
| R01 | Record one reference decision per adopted pattern: exact URL, observation date, observed behavior, Gen-V1 owner/file, chosen adaptation, rejected defaults and evidence status. Separate observed preview, inspected source and runtime verification. |
| R02 | Default implementation uses existing Gen-V1 React/CSS primitives. If authorized source is acquired later, record original file hash, author/source URL, actual license/permission, notices, dependencies and integration decision before committing it. A paid/free label or public preview does not establish source license. |
| R03 | Source acquisition is optional. When access or redistribution permission cannot be established, independently implement the accepted interaction in existing primitives. Do not make a login, purchase, MCP key, new library or new network service a prerequisite for this program. |
| R04 | Reuse the existing capture registry, fixtures and actual components. Add only missing, bounded deterministic states. No production gallery, duplicate component implementation, new capture engine, new runtime dependency or external telemetry. |
| R05 | Each adopting issue has comparable baseline/candidate evidence at exact source SHAs, using the same synthetic data, viewport, zoom, policy and interaction sequence. Include normal, pending/error where meaningful, interruption and Reduced/Off. |
| R06 | Keep evidence truthful: no fabricated run steps/progress, fake save acknowledgment, simulated upload percentages presented as product behavior or mock-only claims of Windows/live-provider correctness. Synthetic fixtures must be identified as such in the manifest. |
| R07 | Comparison clips are 1920x1080, 30fps, H.264, no added titles/labels/overlays inside the video. The manifest carries labels, SHAs, steps and hashes. Record actual component interaction at real time, including a quiet settled state. |
| R08 | Preserve current capture output confinement, redaction, source manifest and ownership rules. Reconcile #1811 and current capture-file owners before modifying shared evidence infrastructure. No existing acceptance obligation is closed by this issue alone. |

Out of scope: website cloning, buying a component plan, bypassing code access, installing Bluma MCP, bulk copying the catalog, implementing product controls, redesigning the shell, replacing the test runner, and full 29-interface/24-trial completion under #1811.

## REPO_MAP

| Existing path | Responsibility / proposed use |
| --- | --- |
| `DESIGN.md`, `CONTRIBUTING.md`, `AGENTS.md` | Authoritative local design, contribution and coordination gates. |
| `scripts/capture-ui/index.ts` | Existing capture orchestrator. Reuse; do not replace. |
| `scripts/capture-ui/screen-map.ts` | Existing named screens, state recipes and source-file mapping. Change only a missing accepted state/selector after inspecting the current canonical owner. |
| `scripts/capture-ui/helpers.ts` | Flags and safe output paths. `--scope baseline`, `--screens`, `--out` are existing flags. Output must be fresh under tmp/test-results or configured safe roots. Preserve symlink/path checks. |
| `scripts/capture-ui/task-data.ts`, `task-surfaces.tsx` | Synthetic task snapshots rendered with actual `Artifact`; suitable for disclosure, record and generated-control comparisons. Reuse existing data/state boundaries. |
| `scripts/capture-ui/browser-surfaces.tsx`, `browser-data.ts`, `api.ts` | Synthetic shell/browser surfaces and controlled requests. Use existing pending/error routes when applicable. |
| `scripts/capture-ui/reports.ts`, `browser.ts` | Existing browser/evidence helpers. Read before any focused change. No unconditional test/capture loops. |
| `scripts/record-task-design.ts`, `scripts/task-design-scenes.ts` | Existing recording entry point and scene definitions. The scene path is under `scripts`, not the obsolete `tests/e2e/task-design-scenes.ts` path in older issue text. Inspect current CLI and reused scene owner before recording. |
| `tests/e2e/ui-shell-controls-fixture.tsx`, `generated-selects-fixture.tsx` | Actual shared controls and generated-select consumers. |
| `tests/e2e/model-composer-refinement-fixture.tsx`, `conversation-find-fixture.tsx` | Actual composer/find interactions. Attachment/error scenarios may need the existing full-App fixture rather than the synchronous composer fixture. |
| `tests/e2e/task-interface-fixture.ts` | Full-App snapshot/publish fixture for real state transitions through current application boundaries. |
| `scripts/public-source-files.json` | Register any genuinely new source/test fixture path in `source`; do not ship evidence fixtures in `runtime`. |
| Proposed `docs/design/bluma-reference-ledger.md` | Human-readable durable adoption/provenance ledger. Create only after checking current docs for an equivalent canonical ledger. |

Existing capture screen IDs verified: `controls`, `generated-selects`, `composer`, `conversation-find`, `task-interactions`, `task-table-disclosure`. Existing states include default/hover/focus/open/empty/error/loading, with explicit skip reasons where the fixture exposes no such state. A documented skip must not be silently turned into a fabricated success.

## DESIGN

### Reference ledger

Each row has a stable pattern ID, reference URL/date, observed access tier, observed state transition, chosen Gen-V1 adaptation, owning issue, exact production/fixture paths, source route (`independent adaptation` or `licensed source inspected`), license/provenance notes, baseline/candidate SHAs and evidence links. Start with these bounded rows:

| Pattern | Bluma reference | Gen-V1 route |
| --- | --- | --- |
| REF-MENU | [Popover](https://bluma.design/c/popover), [Select](https://bluma.design/c/select) | Existing #1186 shared controls, including current lifecycle fixes. |
| REF-ACTION | [Action Button](https://bluma.design/c/action) | Existing #2141 form/action feedback; truthful request acknowledgment. |
| REF-COMPOSER | [Chat](https://bluma.design/c/chat), [File Drop](https://bluma.design/c/filedrop) | Existing #1188; stable editor, real resource grants and interruptible attachment band. |
| REF-TABS | [Tab Bar](https://bluma.design/c/tabbar), [Segmented](https://bluma.design/c/segmented) | Existing #1115; stable labels, mounted visited panels and local selected indicator. |
| REF-DISCLOSURE | [Accordion](https://bluma.design/c/accordion), [Follow-up Questions](https://bluma.design/c/askflow) | Existing #1115; real pending/ready data and retained question branches. |
| REF-RECORDS | [Inline Table](https://bluma.design/c/itable) | Existing #1115 editable-record obligations; explicit review/submit and source/draft distinction. |

Other reviewed components remain in the parent decision matrix. Do not invent implementation work for a reference marked verify/defer/reject. The Bluma catalog changed during review from 58 to 57 entries while still showing 27 free; use component identity and observation date rather than a timeless catalog count.

### Source decision

The public [terms](https://bluma.design/terms), dated 2026-10-15, discuss use of components Bluma builds for a customer. They do not by themselves establish the precise redistribution terms for every catalog file. The [MCP page](https://bluma.design/mcp) describes minified delivery and account-dependent retrieval. Neither page was evidence that this session had the source.

If source is later lawfully provided through an already authorized channel, inspect the actual files and applicable terms. Record upstream hashes and notices, readable behavior, external requests, browser/global assumptions, React compatibility, cleanup, accessibility, Reduced/Off behavior and transitive dependencies. Reject an opaque drop-in when its behavior cannot be audited. Do not upload user data or credentials to obtain a preview. Preserve original attribution where required. If license scope is unresolved, leave the row on independent adaptation and proceed with existing primitives. Do not copy minified code from page internals.

Additional references inspected were [Base UI Tabs](https://base-ui.com/react/components/tabs), [Motion accessibility](https://motion.dev/docs/react-accessibility), and [Animate UI Tabs](https://animate-ui.com/docs/primitives/base-ui/tabs). These support semantic and motion-policy review; none is selected as a dependency. The inspected [Animate UI license](https://github.com/imskyleen/animate-ui/blob/main/LICENSE.md) includes a Commons Clause condition as well as MIT text, so it must not be labeled plain MIT. Gen-V1 already has React 19, its own overlays and motion policy, and plain CSS; a second framework would add integration work without fixing the ownership/state issues.

### Evidence design

Baseline is the current accepted source when implementation starts, not automatically the old research SHA. Candidate is the frozen implementation commit. Record both and any dependency PR stack. Use identical realistic synthetic text, long labels, editable draft values, empty data and errors. Record 1920x1080 as required and validate narrow/short windows separately; 390x844 and 390x300 are targeted layout checks, not substituted production video sizes. Also inspect dark/light and app zoom 100/125/150%. Browser zoom is not proof of native display DPI.

For each pattern, capture trigger, changing state, settled result, immediate reversal, keyboard action and Reduced/Off. Do not delay real operations to make the animation visible. Hold requests in the fixture only to inspect pending behavior and label that fixture condition in the manifest. Preserve focus, DOM identity, caret and drafts through the sequence. Long-list evidence must show bounded work, not an all-row stagger or recurring observer on every item.

Keep PNGs/frame strips and videos in the existing ignored evidence output, with manifest fields: pattern, issue, baseline/candidate SHA, OS/browser/app versions, fixture/data, viewport/zoom/policy/speed, steps, expected behavior, observed result, skip/blocker, duration, video format and SHA-256. Publish evidence using existing repository review channels and only authorized synthetic captures. Do not commit generated videos into this documentation PR. A rollback removes the narrow fixture/ledger changes; it must not delete other teams' evidence or modify product state.

## EXECUTION_DAG

Order: **T01 -> T02 -> T03 -> T04**. T03 production comparison waits for the corresponding component owner; baseline work need not wait for all implementations.

### T01: Resolve ownership and make the provenance ledger

Prerequisites/inputs: parent #2212, this complete plan, current AGENTS/DESIGN, #1811 and relevant issue/PR journals. Read current `scripts/capture-ui` and recording ownership before editing. Claim the exact docs/fixture scope; a documentation claim does not claim the component source.

Edits: create the proposed ledger or extend its discovered canonical equivalent. Fill the six REF rows from actual observations and current source. Record source status as independent adaptation unless real inspected authorized files prove otherwise. Record current baseline SHA and component issue/PR routes. Preserve previous evidence/version links.

Owner/output: one evidence worker; durable ledger and acknowledged file boundary. Positive test: every row has a real observed URL, owner and existing renderer. Negative test: no unsupported source-license/runtime claim, duplicate gallery or component claim. Done when the ledger is reviewed and each missing fact is explicit. Handoff ledger commit and exact fixture gaps to T02.

### T02: Reuse or extend only missing fixture states

Prerequisites/inputs: T01 ledger and acknowledged ownership; current capture source and existing test fixtures. Check whether the component PR already supplies the needed state before adding it.

Edits: narrowly update `screen-map.ts` recipes and their existing fixtures only for accepted missing states. Reuse full-App publication for real pending/ready/rejection transitions; do not implement alternative control logic in a fixture. If a new fixture is unavoidable, name it in a full plan revision, register it in the existing screen map/source manifest and keep it out of runtime packaging. Preserve safe output handling and truthful skip reasons.

Owner/output: same evidence worker or explicit scoped handoff, never concurrent edits to the same fixture. Positive tests: each recipe reaches the real component state and emits evidence. Negative tests: no unauthorized external requests, user data, invalid output path, fake success or silent ignored state. Done when targeted capture succeeds, skips have justified scope, and any changed runner helper has its existing focused tests run. Handoff fixture SHA and exact commands to component owners.

### T03: Produce paired component comparisons

Prerequisites/inputs: T02 fixtures, accepted baseline SHA and frozen candidate from the component's own issue. No claims of implementation completion before that owner supplies a candidate.

Edits/output: generate the baseline/candidate evidence and manifest in separate fresh safe output directories. Use `pnpm capture:ui --scope baseline --screens controls,generated-selects,composer,conversation-find,task-interactions,task-table-disclosure --out test-results/bluma-baseline-<short-sha>` with an actual substituted SHA and fresh directory. Capture candidate with identical screens/data. Inspect the existing recorder CLI before invoking it; reuse the applicable scene rather than guessing flags. Component owners provide the required clips if the current recorder already does so. Validate files, watch clips, and attach/link evidence to each canonical issue.

Tests: positive comparisons demonstrate state continuity and immediate interaction; negative cases cover rapid reversal, rejection, Reduced/Off, restore and long text. Verify videos with `ffprobe` and decode to EOF using `ffmpeg -v error -xerror -i <clip> -f null -`, substituting the actual path. Done when evidence is retrievable and each result is tied to source. Handoff manifest hashes and unresolved acceptance to T04.

### T04: Review and close only this evidence scope

Prerequisites/inputs: T03 artifacts, requirement matrix and all component owner results. Reviewer checks source provenance, actual renderers, comparable data and absence of misleading status.

Edits/output: focused docs/fixture PR, immutable evidence links and final ledger. Run applicable repository checks. Obtain review and authorized integration; recheck links at the resulting commit. Post a final RELEASE checkpoint with `OWNER=NONE`, exact SHAs, evidence and any downstream pending components. No component, #1811 or native verification issue is closed by association.

Positive test: every accepted REF row has truthful source/evidence disposition. Negative test: no implied live/provider/Windows approval from synthetic clips. Done when the ledger and required bounded evidence are accepted; if a candidate is unavailable, publish `HANDOFF_PENDING` for that row and release only completed work.

## VALIDATION

| Acceptance | Requirements / tasks | Evidence |
| --- | --- | --- |
| A01 | R01-R03 / T01 | Six reference rows have source/access/permission status and exact owning files/issues. No claim of Bluma source ingestion without inspected files. |
| A02 | R04,R08 / T01,T02 | Existing actual-component fixtures reused; acknowledged ownership; source manifest valid if changed; no new runtime dependencies/product routes. |
| A03 | R05,R06 / T02,T03 | Same-data paired captures at exact SHAs; real pending/error and retained focus/draft; unsupported state explicitly skipped, never fabricated. |
| A04 | R07 / T03 | All required clips 1920x1080/30fps/H.264, decode-clean, no added overlays; watched once; hashes and steps in manifest. |
| A05 | R05,R08 / T03,T04 | Reduced/Off, interruption, narrow/short and zoom checks; native/provider limits explicit; links readable at pinned source. |
| A06 | R01-R08 / T04 | Reviewed focused PR, source/evidence readback and RELEASE; component and #1811 gates retained separately. |

Setup for later execution: use the repository-pinned toolchain, `pnpm install --frozen-lockfile`, `pnpm exec playwright install chromium`, then `pnpm build`. The `capture:ui` command above requires Linux directory-descriptor support and `/proc/self/fd`; `requireCaptureDescriptors()` rejects unsupported platforms. Preserve that guard. For Windows recording, reuse the helper `scripts/review-capture.ts` through the existing recording entry script and inspect that entry's CLI; the helper is not itself a CLI. Its current recorder injects a synthetic cursor, which must be omitted for these no-overlay clips. Do not pretend the Linux capture command is portable. Run `pnpm typecheck` when fixture TypeScript changes, `pnpm lint:ui --check`, and `pnpm check:docs-links` for tracked docs. Run only relevant registered browser suites or the existing helper tests affected by the diff; no new full test framework is needed.

Actually executed during planning: public preview interactions, source/docs inspection and issue/PR overlap review. Product changes, captures of the locally running app, unit/browser/build/Windows checks: `NOT_RUN`. The reference observation is not a before/after Gen-V1 runtime result.

## STATE

`PLAN_READY`, `IMPLEMENTATION_NOT_STARTED`, `OWNER=NONE`. T01-T04 remain for the implementing evidence worker. Next action: re-read current claims and create the bounded provenance ledger. Source access is optional, not a blocker to independent adaptation. Existing #1811 evidence ownership and component owners must be coordinated before changing shared files. Publication readback and source SHA are recorded in append-only issue checkpoints.

## REFERENCES

- [Parent #2212](https://github.com/skytuhua-org/Gen-V1/issues/2212)
- [Existing integrated acceptance #1811](https://github.com/skytuhua-org/Gen-V1/issues/1811)
- [AGENTS at inspected baseline](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/AGENTS.md)
- [DESIGN at inspected baseline](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/DESIGN.md)
- [Capture screen map at inspected baseline](https://github.com/skytuhua-org/Gen-V1/blob/96ca4c3bd0664fca53775fbe31915c209641986c/scripts/capture-ui/screen-map.ts)
- [Bluma](https://bluma.design/), [Terms](https://bluma.design/terms), [MCP](https://bluma.design/mcp)
<!-- END CANONICAL PLAN -->

<!-- END PRIOR CANONICAL BODY -->
