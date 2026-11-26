# Bluma reference ledger: six decisions and source provenance

## META

Repository `skytuhua-org/Gen-V1`; revision `PARALLEL-REF01-R1`, 2026-11-25. Planning baseline `main@defe9884530145e9c109b8ed98f80efac8beeb17`. Coordination parent [#2213](https://github.com/skytuhua-org/Gen-V1/issues/2213), program [#2212](https://github.com/skytuhua-org/Gen-V1/issues/2212). Original complete specification: [BLUMA-REFERENCE-R1](https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-reference-and-evidence.md); earlier publication PR #2215 remains open/unmerged at inspection. This task only owns the bounded outcome below. Dependencies: none; refresh existing owners before edits. Implementation/evidence execution `NOT_STARTED`; checks below are planned. Issue number, immutable source and publication PR are in the publication header. No product scope is claimed by plan publication.

## OBJECTIVE

Create the small durable ledger that lets component and evidence workers identify exactly what they are adapting and who owns it. This task ends when six complete, reviewed records and their evidence input contract are available. It does not film or implement controls.

## REQUIREMENTS

R01: Record REF-MENU, REF-ACTION, REF-COMPOSER, REF-TABS, REF-DISCLOSURE and REF-RECORDS. R02: Distinguish observed preview, inspected licensed source and verified Gen runtime. R03: Identify current production/fixture owners and candidate dependencies without taking those scopes. R04: Preserve old evidence and expose missing facts as pending, never a fabricated success.

Use the existing React/CSS components and existing capture tools. Source acquisition is optional: public previews and a paid/free label do not establish redistribution permission. No Bluma login/purchase/MCP installation, new gallery, runtime dependency, external telemetry or copied minified page internals. Preserve all current product/source/permission contracts. Reference evidence does not close #1811's separate 29-interface/24-live-trial acceptance.

Recordings are synthetic, 1920x1080, 30fps, H.264, at real interaction speed, with no added titles, labels, simulated cursor or other overlays. Captions, fixture provenance, settings, source SHAs and hashes belong outside footage. Narrow 390x844/390x300 and zoom 100/125/150% checks are additional; browser zoom does not prove native display DPI. Full/Reduced/Off must remain truthful. Never delay an actual operation to make an animation visible.

## REPO_MAP

Own proposed `docs/design/bluma-reference-ledger.md`. Current main has no equivalent Bluma ledger under `docs/design`; repeat `rg --files docs | rg -i 'bluma|reference'` before creation. Own only this new document and its exact `source` manifest entry. Read `scripts/capture-ui/screen-map.ts`, `scripts/capture-ui/helpers.ts`, `scripts/task-design-scenes.ts`, `scripts/record-task-design.ts`, `DESIGN.md` and current issue journals. No edits to capture runners, fixtures or product source.

## DESIGN

The ledger is Markdown with one row per stable REF ID and these exact fields: `pattern`, `reference_url`, `observed_date`, `observed_behavior`, `chosen_adaptation`, `rejected_defaults`, `access_status`, `source_route`, `license_status`, `owner_issue`, `production_paths`, `fixture_or_scene`, `baseline_sha`, `candidate_sha`, `evidence_url`, `disposition`, `remaining_gate`. Source route is `independent adaptation` unless actual authorized files and applicable terms are inspected; if so add original SHA-256, source/author, license text/permission, dependencies and retained notices. Also audit readable behavior, external requests, browser/global assumptions, React compatibility, cleanup, accessibility and Reduced/Off behavior. Reject an opaque drop-in when these cannot be audited; unresolved source permission leaves the row on independent adaptation. Chosen adaptation and rejected defaults are separate required fields, not substitutes for observed behavior. Disposition is `PENDING`, `PASS`, `FAIL`, or `NOT_APPLICABLE_WITH_REASON`.

| Pattern | Reference | Existing owner |
| --- | --- | --- |
| REF-MENU | https://bluma.design/c/popover and https://bluma.design/c/select | #1186 |
| REF-ACTION | https://bluma.design/c/action | #2141 |
| REF-COMPOSER | https://bluma.design/c/chat and https://bluma.design/c/filedrop | #1188 |
| REF-TABS | https://bluma.design/c/tabbar and https://bluma.design/c/segmented | #1115 |
| REF-DISCLOSURE | https://bluma.design/c/accordion and https://bluma.design/c/askflow | #1115 |
| REF-RECORDS | https://bluma.design/c/itable | #1115 |

The reference behavior was observed on 2026-11-25. The catalog count changed during that inspection; do not encode a timeless count. Record the exact component identity. If a source path moved, read its replacement and record the mapping; do not silently substitute an unrelated renderer.

Evidence workers consume a ledger commit and return one `EvidenceRow` per pattern: `{pattern, baselineSha, candidateSha, fixtureSha, environment, settings, steps, checks, files:[{url,sha256,bytes,format}], disposition, remainingGate}`. Every baseline/candidate pair uses identical source data, viewport, policy, speed and steps. A pair may differ from another pattern's pair; that does not satisfy #1811's separate all-on-one-SHA gate.

Rollback removes only the new ledger/source entry if rejected. Never delete earlier evidence.

## EXECUTION_DAG

- [ ] T01, read: Refresh complete #2213/#2212 and owning component/#1811 journals. Record current candidate heads and exact remaining ownership; stale/silent is not released. Output: six source/owner rows, no product claim.
- [ ] T02, write: Populate the exact table and fields above. Read actual paths/scene IDs. Fill unavailable candidate/evidence with `PENDING` and a named required artifact. Positive: every URL/path resolves at its recorded SHA. Negative: source-gated preview cannot become `licensed source inspected`.
- [ ] T03, validate/publish: Register only the document in `source`; preserve `runtime` and other entries. Run documentation checks, open one focused docs PR and publish the ledger commit to [REF02 #2235](https://github.com/skytuhua-org/Gen-V1/issues/2235), [REF03 #2236](https://github.com/skytuhua-org/Gen-V1/issues/2236), [REF04 #2237](https://github.com/skytuhua-org/Gen-V1/issues/2237). Each receiver ACKs its rows, not the whole evidence program.

Done: all six rows have source status, owner and exact fixture routes; no required field is an unexplained blank. This leaf can finish while candidate videos remain pending.

## VALIDATION

Run `git diff --check` and `node scripts/check-doc-links.mjs` from the repository root after source registration. Manually compare all six rows with their linked source/journal. A01 (R01/T02): six unique REF IDs. A02 (R02/T01-T02): preview/source/runtime states distinguishable and unsupported licenses absent. A03 (R03/T01-T03): exact owner/fixture handoff and no product edits. A04 (R04/T03): immutable ledger link, full issue/source readback and RELEASE. Application tests, captures and native checks are not required for this documentation leaf and must remain NOT_RUN.

## STATE

Plan ready; future owner unassigned. No ledger created or app check run by this plan publisher. First action is T01. The only blocking source fact is an unavailable current owner/candidate for a particular row; record it locally to that row without holding unrelated work. Claim only this leaf/docs path and release before waiting for another worker.

## REFERENCES

- [Original full specification](https://github.com/skytuhua-org/Gen-V1/blob/cd5860c647507b4b28be51f640bfeae9d447d021/docs/agent-plans/bluma-reference-and-evidence.md)
- [Current main](https://github.com/skytuhua-org/Gen-V1/tree/defe9884530145e9c109b8ed98f80efac8beeb17)
- [Current evidence reviewer note](https://github.com/skytuhua-org/Gen-V1/issues/2213#issuecomment-7170805669)
- [Integrated acceptance #1811](https://github.com/skytuhua-org/Gen-V1/issues/1811)
