# Generated surfaces: index and verify existing comparison evidence

## META

Repository `skytuhua-org/Gen-V1`; revision `PARALLEL-REF04-R1`, 2026-11-25. Planning baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. Coordination parent [#2213](https://github.com/skytuhua-org/Gen-V1/issues/2213), program [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Original complete specification: [BLUMA-REFERENCE-R1](https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-reference-and-evidence.md); earlier publication PR #2215 remains open/unmerged at inspection. This task only owns the bounded outcome below. Dependencies: [REF01 #2234](https://github.com/skytuhua-org/Gen-V1/issues/2234) ledger; frozen baseline/candidate and applicable existing component-owner evidence from #1115 and #2141. Implementation/evidence execution `NOT_STARTED`; checks below are planned. Issue number, immutable source and publication PR are in the publication header. No product scope is claimed by plan publication.

## OBJECTIVE

Return a verified comparison bundle for REF-ACTION,REF-TABS,REF-DISCLOSURE,REF-RECORDS. Reuse exact applicable videos and tests already supplied by #1115 and #2141; record only a missing comparison. This task reviews evidence and exercises existing components. It does not reimplement them or take their open PR scope.

## REQUIREMENTS

R01: Compare exact source commits using identical synthetic fixtures, steps and settings. R02: Cover the concrete positive/negative sequence below in Full/Reduced/Off, without false completion or changed source/draft. R03: Verify the actual file bytes, format and retrieval. R04: Keep fixture gaps, platform limits and failures explicit and scoped to the pattern. R05: Preserve existing acceptance and owner boundaries.

Use the existing React/CSS components and existing capture tools. Source acquisition is optional: public previews and a paid/free label do not establish redistribution permission. No Bluma login/purchase/MCP installation, new gallery, runtime dependency, external telemetry or copied minified page internals. Preserve all current product/source/permission contracts. Reference evidence does not close #1811's separate 29-interface/24-live-trial acceptance.

Recordings are synthetic, 1920x1080, 30fps, H.264, at real interaction speed, with no added titles, labels, simulated cursor or other overlays. Captions, fixture provenance, settings, source SHAs and hashes belong outside footage. Narrow 390x844/390x300 and zoom 100/125/150% checks are additional; browser zoom does not prove native display DPI. Full/Reduced/Off must remain truthful. Never delay an actual operation to make an animation visible.

## REPO_MAP

Read existing screens `task-interactions,task-table-disclosure` in `scripts/capture-ui/screen-map.ts`, fixtures `scripts/capture-ui/task-data.ts; scripts/capture-ui/task-surfaces.tsx; scripts/task-design-scenes.ts`, `scripts/capture-ui/index.ts`, `scripts/capture-ui/helpers.ts`, `scripts/record-task-design.ts` and `scripts/review-capture.ts`. These capture paths are unchanged between the original research SHA and this planning baseline. Own a new ignored `test-results/bluma-ref04-<sha>/` output and your issue evidence journal. Do not commit videos, profiles or raw traces. Product repairs remain with ART02/ART03/ART04/ACT04. This leaf also owns the original T02 obligation for an accepted missing deterministic capture state: reserve only the task-interactions and task-table-disclosure entries in scripts/capture-ui/screen-map.ts and the matching state/selector hunk in scripts/capture-ui/task-data.ts, scripts/capture-ui/task-surfaces.tsx, scripts/task-design-scenes.ts. Reuse component-provided state first; obtain the existing fixture owner ACK before touching its hunk. No duplicate control or fabricated pending/success implementation. If a new fixture or several independent fixture fixes are required, name and subdivide them in a complete plan revision before editing, register exact source-only entries, and preserve runtime packaging. Do not change the recorder here: [REF06 #2257](https://github.com/skytuhua-org/Gen-V1/issues/2257) owns its no-cursor seam.

## DESIGN

Inputs: REF01 ledger commit; baseline and frozen candidate SHA; fixture SHA and capture entry point; existing recordings if relevant. Verify a candidate actually contains the owned change. The bare existence of a PR or a passing unrelated test is insufficient. Existing reference clips are reused only when they match all inputs. A mismatched historical clip is contextual evidence, not the required comparison.

Concrete interaction recipe: For actions, pending/acknowledged/rejected outcome is truthful and retries retain data. For tabs, selected indicator changes while visited drafts stay mounted. For disclosure, pending answer and nested follow-up retain branches/focus. For records, edit one stable row/cell, keep source versus draft distinct, submit exactly once and reject/restore without losing the draft.

For each pattern produce the REF01 `EvidenceRow` contract. `checks` must contain named positive and negative observations, with PASS/FAIL/NOT_RUN and retrievable evidence. Include light/dark, normal desktop and separate narrow/short/zoom checks. Give each baseline/candidate file an independent SHA-256; never hash only a manifest or a thumbnail. Show trigger, changing state, settled state, immediate reversal, keyboard path and quiet settled interval. Preserve the actual request/receipt boundary. A synthetic delayed request is explicitly labelled in the manifest.

Existing capture command, executed separately from each accepted checkout with a unique fresh output:

```sh
pnpm capture:ui --scope baseline --screens task-interactions,task-table-disclosure --out test-results/bluma-ref04-baseline-<short-sha>
```

Substitute the actual short SHA; the candidate uses a separate `candidate-<short-sha>` directory. This command collects existing screenshot/frame-strip evidence; it is not claimed to create the required MP4. Linux descriptor confinement and `/proc/self/fd` checks remain intact. On a Windows recording host use the component owner's approved existing recorder. For generated task scenes, inspect the actual registry with `pnpm exec tsx scripts/record-task-design.ts --list`, then use its verified `--output` and `--scenes` flags for the corresponding existing scene. `scripts/review-capture.ts` is a helper, not a CLI. Its current synthetic cursor overlay is an identified gap owned by [REF06 #2257](https://github.com/skytuhua-org/Gen-V1/issues/2257). New recordings through that helper must consume the reviewed no-cursor API/CLI from REF06 on a fresh context. The proposed option does not exist at this baseline. Existing matching overlay-free evidence can be reviewed before that patch; no helper edits belong to this leaf.

If the required recipe is missing, this leaf implements only its acknowledged bounded synthetic state above, with the existing focused capture/fixture checks. If its owner ACK or recorder output is unavailable, record the exact path/input and BLOCK only that check, then release. Recorder gaps go to REF06; product gaps go to the component children named above. Do not create a new capture framework, invent CLI flags or mark the pattern complete from screenshots alone.

## EXECUTION_DAG

- [ ] T01, input check: Read ledger and full current #1115 and #2141/#1811 journals. Confirm source inclusion, candidate freeze and fixture route. Output a small input manifest. Positive: exact files/SHAs resolve. Negative: changed candidate or mismatched fixture blocks only affected evidence.
- [ ] T02, exercise/reuse: Watch and check existing matching footage first. Run the bounded sequence above for missing baseline/candidate states, using real production components. Keep the environment/settings identical. For an accepted missing fixture state, first add only the acknowledged recipe/state hunk above, run the applicable existing fixture/capture tests and targeted capture, and publish the fixture SHA. Preserve external-request/output-path guards and truthful skipped states. Unsupported product behavior remains a pending component gap, never simulated success. If the missing work is larger than this bounded state, create further small fixture sub-issues with explicit ownership before implementation.
- [ ] T03, verify: Probe every MP4 with `ffprobe` for 1920x1080, 30/1 frame rate and H.264; decode with `ffmpeg -v error -xerror -i <actual-file> -f null -`; hash actual files and watch each once at normal speed. Inspect meaningful transition frames. Reject titles/labels/cursor overlays and broken decode. Browser screenshots do not certify Windows/AT/live providers.
- [ ] T04, handoff: Publish safe files through existing review channels, read/download the published bytes and verify hashes. Return one EvidenceRow per REF-ACTION,REF-TABS,REF-DISCLOSURE,REF-RECORDS to [REF05 #2238](https://github.com/skytuhua-org/Gen-V1/issues/2238); include all missing/failing checks and component-owner links. Release this leaf with OWNER=NONE. No product issue is closed here.

## VALIDATION

A01 (R01/T01): named baseline/candidate/fixture/environment, exact same-data settings. A02 (R02/T02): all stated interaction cases have evidence and source/draft/focus preservation; negative reversal/rejection/restore recorded. A03 (R03/T03-T04): each required clip passes format, full decode, visual review and uploaded-byte hash. A04 (R04/T01-T04): each missing platform/state has NOT_RUN/BLOCKED plus an owner, not a success inference. A05 (R05/T04): only acknowledged pattern-specific recipe/fixture hunks, focused positive/negative checks and exact source inventory for changes; no product repair, duplicate component or #1811 closure. All commands/checks are future execution, NOT_RUN by this publisher. If recipe/fixture code changes, run pnpm exec vitest run tests/capture-ui/helpers.test.ts tests/capture-ui/task-surfaces.test.ts tests/task-design-recording.test.ts --maxWorkers=1 as applicable to the touched helper/scene, then the exact component-owned fixture suite and targeted capture. Record unchanged suites as not required, not passed. Do not run unrelated full application suites for a read-only evidence bundle.

## STATE

BLOCKED until REF01's relevant rows and exact candidate/fixture inputs exist. Existing matching evidence may satisfy individual checks without new filming. A failed comparison reports the demonstrated defect to its component owner; this task does not broaden into repairs. Next worker claims this leaf, validates T01 and stops holding ownership while waiting for absent inputs.

## REFERENCES

- [Full original specification](https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-reference-and-evidence.md)
- [Main source](https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17)
- [Capture registry](https://github.com/skytuhua-org/Gen-V1/blob/defe9884530145e9c109b8ed98f80efac8beeb17/scripts/capture-ui/screen-map.ts)
- [Existing integrated acceptance](https://github.com/skytuhua-org/Gen-V1/issues/1811)
