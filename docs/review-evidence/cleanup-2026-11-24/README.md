# Repository cleanup audit, 24 November 2026

Repository: `skytuhua-org/Gen-V1`. Coordinator: `codex-cloud-8ec5a4`. Tracker: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803). The bounded review covers the 377 issues open when this continuation began and 495 PR records through **24 November 2026, 04:06:11 PST (12:06:11 UTC)**. The live inventory at that cutoff contained 494 open PRs; one additional reviewed record, #2004, was already withdrawn. Work arriving after the cutoff is outside this audit.

The review uses main `9ddd536cc84c0f327ddf6133d485f8ab8baf294b`, actual PR target branches, complete issue bodies and journals, prior immutable evidence, and fresh branch deltas. PR-wide review means integration, redundancy, dependency and disposition review. It does not mean that every line of every candidate received a new product acceptance review or test run.

## Results and evidence

| Area | Verified result | Record |
|---|---|---|
| Issue coverage | 377 starting issues have individual dispositions, preserving substantive requirements and ownership. | [Issue ledger](issue-dispositions.json) |
| Metadata | 167 issues received additive label corrections with independent readbacks. | Issue ledger and issue journals |
| Plan publication | 65 complete current plan files, including 37 full canonical revisions and 28 identical mirrors; prior revisions remain in immutable history. | [Publication manifest](plan-publication.json) |
| Audit completion | #1992's audit deliverable meets its own acceptance; its 39 separate product gaps remain open. #1803 closes only after this publication and its final readbacks. | [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992), [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803) |
| PR preservation | Four incorrectly closed, uniquely scoped PRs restored. No source branch deleted or force push used. | [PR ledger](pr-dispositions.json) |
| Branch maintenance | Three existing desktop PRs integrated with current main and received bounded correctness repairs. | Table below |
| Queue cleanup | 14 superseded automatic M05 runs confirmed cancelled, removing 28 obsolete Linux/Windows matrix jobs. | [Cancellation receipts](ci-cancellations.json) |
| CI policy | Expanded, race-safe queue guard and conservative plan-only classification published in #2000; normal protected integration remains pending. | [#2000](https://github.com/skytuhua-org/Gen-V1/pull/2000) |

The documentation-first publication order is deliberate: full files are committed and independently read back before fresh-guarded canonical body writes. Each affected issue journal records its immutable source, exact hash and canonical readback. The coordinator's final #1803 receipt records the completed publication batch and final states. The ledgers retain the source pins and evidence applicable to each audit decision; later commits do not retroactively renew earlier test results.

## Continuity with the interrupted session

The prior session reviewed the original 333-issue backlog, published 177 complete reviewed plans, and consolidated 117 non-draft plan PRs. All 178 original retained files remain byte-identical at [b0e28523](https://github.com/skytuhua-org/Gen-V1/commit/b0e28523f0eb1ac4a45c64a6a65beec75084bbf9), with [source-to-survivor provenance](https://github.com/skytuhua-org/Gen-V1/blob/b0e28523f0eb1ac4a45c64a6a65beec75084bbf9/docs/review-evidence/cleanup-2026-11-23/plan-consolidation.json). The 177 prior full revisions are at [f3e94724](https://github.com/skytuhua-org/Gen-V1/commit/f3e947245e1b67916bc3393b934202d93827da64). Those closures and publications are prior work, not new actions in this continuation.

Prior completed closures #993, #1139, #1227, #1676 and #1770 were rechecked. The continuation did not blindly close unmerged features, draft chains or issues with outstanding native, visual, review or release criteria. The 51 earlier and 121 later immutable prior mirrors independently compared exactly with their reviewed canonical snapshots before targeted updates.

The first continuation commit, [78253df0](https://github.com/skytuhua-org/Gen-V1/commit/78253df0c9e3b60a321377e315935104a8608adb), contains 57 complete plans. All 60 changed files, including provenance, registration and #2114's original revision-4 file, were fetched from GitHub and compared byte-for-byte. A subsequent owner update to #1666/#2114 was detected before any stale body write or closure. The final publication preserves revision 5 from `1d739e99e34c7a148c9462dc6f27ae0880568444`; #2114 remains open under its active owner. Its earlier revisions remain retrievable.

## Issue corrections

The revisions restore complete executable plans, correct stale task status and PR references, distinguish producer evidence from independent acceptance, and make decision holds explicit. Original requirements and historical bodies remain preserved. Examples include:

- #1326 now points to the actual CI-fix stack rather than unrelated PRs. #1481 retains accepted per-owner reasoning provenance, dismissal reset on owner changes, and existing frontend evidence.
- #2085 corrects the reduced-motion timing premise. #2108/#2109 name the actual TaskMemory APIs and required race/ownership behavior. #2110 uses existing panel opening and section semantics instead of an invented context API.
- #1947 retains unresolved copy/format decisions rather than silently choosing a conflicting requirement. #1958 records the expressly approved retention policy.
- #1654 now identifies the real #2115 implementation and two independently found gaps: missing aggregate request/deadline and output-limit enforcement, and incomplete accepted-read/owner fencing. Candidate tests with mocked native custody or an isolated hook do not satisfy full App or supported-Windows acceptance.
- #1948 recognizes that the production Tab-close behavior already exists, while the required new regression file remains unmerged in #2013. This avoids a redundant product change without incorrectly declaring the task complete.
- #2101/#2102 are reconciled with PRs that arrived before the cutoff. Existing policy decisions and review owners remain intact.

The [bounded source review of #2116/#2118](https://github.com/skytuhua-org/Gen-V1/issues/1803#issuecomment-7131148702) found stale delayed-resize revisions, lost pending Home/End operations, incomplete cancellation, duplicate raw App error banners and changed browser expectations unsupported by the unchanged App placement implementation. It also identified a queue-policy contradiction that requires an explicit accepted decision. These are source and acceptance findings, not claims that new browser tests were executed in this environment.

#1992 is an audit/publication task. Its completion was checked against the full journal, released task ownership, 39 complete open child plans, 297 numbered requirements and six distinct fixed decisions. Required full plan mirrors are now versioned. Private archive integrity remains attributed to the original producer, not represented as rerun here. The 39 product gaps retain their own acceptance. #1886 and #1946 remain open because their separate remediation/reconciliation criteria are incomplete.

## PR decisions

All 495 records have a target-aware disposition. The dependency audit preserves 76 non-main-target PRs and 16 drafts. Four draft plan PRs, #1117, #1559, #1737 and #1952, retain their own custody. #2033 contains unique evidence-index content and is not treated as an empty plan copy.

The [detailed PR findings](pr-review-findings.md) preserve the individual conflict causes, six arrival reviews, five external head changes and five independently recorded acceptance blockers, with immutable source and journal links. The [machine-readable findings](pr-review-findings.json) carry the same evidence for follow-up work.

| PR | Decision and reason |
|---|---|
| #1989 | Reopened: transaction snapshot and attention behavior was not contained in #1993. |
| #1996 | Reopened: retaining the acknowledged transcript while replacement history is pending was not contained in #1995's separate event-ordering change. |
| #2036 | Reopened: required `ACCOUNT_SIGNING_IN` behavior was missing from #2012. |
| #2047 | Reopened: caching static SQL admission statements and its preparation-count regression were absent from #2030's SSE change. |
| #2004 | Remains closed because its author explicitly withdrew it after recognizing #2002's earlier claim. Its alternative cache/reference policy remains available for owner comparison; no content-equivalence or product-completion claim is made. |
| #2114 | Retained under an active owner after revision 5 and approved queue work arrived. The same newest bytes are preserved in #1994 so consolidation cannot restore an older plan. |

No additional blanket PR closures were justified by stable patch, integration or dependency evidence. Similar titles, overlapping files, old timestamps and a closed comparison PR are insufficient evidence of redundancy. The unusual #641/#673/#691 merge-tree overlap does not prove completion: current main deliberately removed the implicated test, and #641 also anchors a stack.

Eight target-branch conflict cases remain for PR-specific integration review: #896, #1196, #1203, #1463, #1576, #1579, #1693 and #1793. Their exact paths and source pins are in the PR ledger. They were not erased by retargeting or by dropping candidate changes.

## Published source repairs and validation

| PR | Published head | Bounded change | Verification |
|---|---|---|---|
| [#2000](https://github.com/skytuhua-org/Gen-V1/pull/2000) | `b8379a96404d58961c0905e3db71a25b1f35488c` | Queue discovery beyond the first page, cached historical commit proof, synchronous final cancellation authority after all proof reads. | 136 focused tests, including 55 guard cases; typecheck/lint, YAML and diff checks. |
| [#1370](https://github.com/skytuhua-org/Gen-V1/pull/1370) | `1eeb4bd0eb851118fdfed067e466d971f4a9a576` | Integrates current main; fences stale power-keeper reads after release/disposal, handles backend exit/disconnect, preserves native confirmation and accurate Settings reasons/copy. | 116 focused/manifest tests; typecheck/lint/UI guard and web/widgets/plugin/desktop builds. |
| [#1448](https://github.com/skytuhua-org/Gen-V1/pull/1448) | `f99990cefac1f81b5c42b35ac6fa9a4ab598b900` | Integrates current main; guards late taskbar results/errors/timers and jump-list effects; renderer uses current data and subscribes before readiness. | 142 focused/manifest/registry/UI tests; typecheck/lint and full builds. |
| [#1823](https://github.com/skytuhua-org/Gen-V1/pull/1823) | `d1f8cff83456d1f17e95c5058a8ed9fdd5c68789` | Integrates current main while preserving bookmarks and desktop custody; removes redundant active-descendant metadata from the nonfocusable listbox. | 83 focused tests; typecheck/lint/UI guard and full builds. |

Every branch update used the expected prior head and a non-force update. Created trees matched the verified local trees; commits, ordered merge parents and relevant blobs were independently read back. Existing PRs and owners were retained.

Meaningful red/green regressions preceded the power and taskbar fixes. Independent CI review reproduced a final-proof race before the final 55/55 guard result. The taskbar wider service run was 101/103: two Linux directory-guard failures reproduced identically on current-main source. They are not counted as passes. The bookmarks initial 82/83 failure came from an unbuilt required widget receiver; after building it, the final 83/83 run passed.

Browser execution for all three desktop repair scopes was blocked before application execution because this executor denied Chromium's singleton socket. No application assertion or source-current native acceptance is claimed from those attempts. Supported Windows, installed-app, frontend and hosted acceptance stays with the existing feature owners. #1643 also has an unresolved original persistence/rollback contract: mutations update memory/revision before queued writes succeed, and write failures cannot reject/restore the operation as required. That gap is recorded in the complete plan and [maintenance release](https://github.com/skytuhua-org/Gen-V1/issues/1643#issuecomment-7130646650).

## CI efficiency and remaining operational limits

The actual immediate reduction is 14 cancelled superseded automatic M05 runs and 28 matrix jobs. Current-head, manual, main, foreign and ambiguous work was preserved. One historical run, [43098118515](https://github.com/skytuhua-org/Gen-V1/actions/runs/43098118515), remains unresolved because GitHub's own cancellation action failed; its logs were not deleted.

#2000's conservative classifier allows only regular Markdown under `docs/agent-plans/` plus exact corresponding source-manifest registrations. Ambiguous or broader changes receive the existing full required checks. Classification precedes Windows allocation. The queue guard examines up to 10 pages per status with a bounded 100-candidate budget; associated PR metadata alone cannot prove an old run's SHA, so historical membership and fresh authority are required. Manual runs retain independent SHA/run identities, and main/merge-queue qualification remains intact.

At the closeout status read, the CI and documentation PRs still had auto-merge enabled and normal checks/queue gates pending. No protections were weakened, and no speed improvement in median or p95 is claimed from local tests or queued runs. The independent #1666 performance task remains open; its published real-run timing and $0 infrastructure policy are preserved. New #2117 header caching is a separately owned candidate, not an achieved speed saving.

## Publication validation and limits

The final source-manifest suite passed 13/13 tests. The documentation checker reported 611 Markdown files and 5,036 links, zero broken links and zero warnings; it skipped external URLs and 39 targets classified as uncommitted. The final 21-file increment passes git diff --cached --check. These checks do not erase the three inherited historical diagnostics in the earlier continuation commit. Exact immutable file verification precedes every canonical write.

The three inherited canonical whitespace diagnostics in #1992/#2104/#2105 remain disclosed because exact historical body preservation takes priority over silent formatting edits. External links are not validated by the local documentation checker. Product tests were run only for the bounded code repairs described above; the metadata review did not independently rerun every producer's platform evidence.

The final coordinator receipt in [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803) pins this publication, confirms guarded body and state readbacks, records final live counts separately from the frozen review cutoff, and releases cleanup ownership. Existing feature, native and CI work keeps its original owners and required gates.
