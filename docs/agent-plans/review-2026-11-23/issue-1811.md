[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/ae54c94b4efa6defb01171f2302acad73d143829/docs/agent-plans/review-2026-11-23/issue-1811.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1811](https://github.com/skytuhua-org/Gen-V1/issues/1811). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

Integrated acceptance is explicitly unmet. Frozen dd9cf46b52ecc79b579a0a282948444ed6f7deaa ledger executed 16/24 trials with only four all-PASS rows and eight pending; owner visual verdict and full acceptance still outstanding despite recordings/index work.

### Reviewed implementation references

- [PR #1256](https://github.com/skytuhua-org/Gen-V1/pull/1256): open, draft; head `2cbd3647e6d45fa34bed4655f289985c6f95c93d`; base `main`; not recorded as merged into the audit baseline.
- [PR #1255](https://github.com/skytuhua-org/Gen-V1/pull/1255): open; head `84c768388f7484606b85ce5141bd3e7465be38f8`; base `refine/documents-graph-decisions`; not recorded as merged into the audit baseline.
- [PR #1127](https://github.com/skytuhua-org/Gen-V1/pull/1127): open; head `2aaeda2379e27cc25e5c80461718e5b52adfe3a1`; base `main`; not recorded as merged into the audit baseline.
- [PR #1142](https://github.com/skytuhua-org/Gen-V1/pull/1142): open; head `280b91e7ea85038dddd95ae8ed64216dcbb2b219`; base `refine/developer-tools-data`; not recorded as merged into the audit baseline.
- [PR #1152](https://github.com/skytuhua-org/Gen-V1/pull/1152): open; head `1da768e7c1ce7ea3e53126bbc208f63bbdf31365`; base `main`; not recorded as merged into the audit baseline.
- [PR #1254](https://github.com/skytuhua-org/Gen-V1/pull/1254): open; head `215d574a66288ed22d44cecb66de5db42400404a`; base `refine/forms-charts-motion`; not recorded as merged into the audit baseline.
- [PR #1143](https://github.com/skytuhua-org/Gen-V1/pull/1143): open; head `dd85b8cd91302dec4fb229295ec309bc6d613c7b`; base `main`; not recorded as merged into the audit baseline.
- [PR #1175](https://github.com/skytuhua-org/Gen-V1/pull/1175): open; head `a55cf4fccc3361e11b50045bfc988814c1666256`; base `refine/exploration-workflows`; not recorded as merged into the audit baseline.
- [PR #1257](https://github.com/skytuhua-org/Gen-V1/pull/1257): open; head `a4c0cde7e01147dde62403cf948e1c3c2cab708f`; base `refine/ux-1125-clarity`; not recorded as merged into the audit baseline.

Latest journal read: [7104926319](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7104926319). Earlier claims, tests, review findings and releases remain in the append-only journal.

### Integrated acceptance ledger

[W1 checkpoint 007](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7097502259) and [W3 checkpoint 020](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7104926319) use frozen product `dd9cf46b52ecc79b579a0a282948444ed6f7deaa`. The 24-row ledger has 16 attempted rows, four all-PASS rows and eight PENDING rows after repeated provider/first-turn failures; judgments total 55 PASS, 25 FAIL and 40 PENDING. Comparisons R/P failed and T/I/D/G are incomplete. The same-SHA requirement for the attempted ledger is evidenced, but the full live-trial acceptance is not. The original four complete plans and all 14 continuation parts remain authoritative requirements. Owner visual verdict, pending/failed rows and recorded product defects still need disposition on an accepted integration candidate.

---

# Integrated generative UI acceptance

**Revision `GUI-ACCEPT-2026-11-22-r2`, November 22, 2026 Pacific.** Use this issue as the canonical journal for the four existing workstreams. The previous acceptance review identified incomplete integration, task-specific polish, accessibility and recording evidence. The desired outcome is 29 compact, task-specific interfaces, each with microanimations tied to actual events, one independently playable MP4 per interface, and a separate demonstration that the real model selects an appropriate working surface for the user’s task.

**Plan publication: HANDOFF_COMPLETE. Worker execution: pending pickup by authorized owners. Product acceptance: open.** The plan was researched against `main@36fcc56d24cef7558059264a8540d7f0592d93cd`. The original design starts at `26ddf4d16c2fc1196b520d8a46c5441d64d01463`; prior reviewer recordings and historical branch CI do not establish acceptance on the combined build. Read current [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/36fcc56d24cef7558059264a8540d7f0592d93cd/AGENTS.md), the complete worker assignment, all continuation parts for that assignment and the latest journal before claiming work.

## Four complete Markdown execution plans

The combined plans exceed the issue body limit. Per the repository publication contract, the manifest below pins every file from [documentation PR #1816](https://github.com/skytuhua-org/Gen-V1/pull/1816) at `8ad7387890cef5f52aeb925fc278ff53f78ac93c`. The ordered comments reproduce **all four documents in full**. Concatenating the contents between the markers in each worker’s numbered comments yields that exact UTF-8 file, including its terminal newline. The file and comment copies have been read back and compared with each other. Native upload of a Markdown issue attachment is unavailable through this client. The repository files are the durable downloadable copies.

| Worker | Original issue | Commit-pinned source | Bytes | SHA-256 | Parts |
| --- | --- | --- | ---: | --- | ---: |
| W1 | #1118 | [Full Worker 1 Markdown](https://github.com/skytuhua-org/Gen-V1/blob/8ad7387890cef5f52aeb925fc278ff53f78ac93c/docs/agent-plans/worker-1-documents-graph-decisions-acceptance-r2.md) | 125,908 | `d2a268e4f43e20e872a108b03fb3da26afdbed7d99f01ed8f959f17039babbb0` | 4 |
| W2 | #1116 | [Full Worker 2 Markdown](https://github.com/skytuhua-org/Gen-V1/blob/8ad7387890cef5f52aeb925fc278ff53f78ac93c/docs/agent-plans/worker-2-developer-tools-data-acceptance-r2.md) | 111,014 | `94befd88e529f7e4ff964cbd609f4c43765238f7b0961894eb7b37c67f36df3e` | 3 |
| W3 | #1115 | [Full Worker 3 Markdown](https://github.com/skytuhua-org/Gen-V1/blob/8ad7387890cef5f52aeb925fc278ff53f78ac93c/docs/agent-plans/worker-3-forms-charts-shared-motion-acceptance-r2.md) | 116,957 | `ebc68907eba595330d9feb8f4a49ef75ce1833610447c7ca840e2b3cfbbc7467` | 4 |
| W4 | #1125 | [Full Worker 4 Markdown](https://github.com/skytuhua-org/Gen-V1/blob/8ad7387890cef5f52aeb925fc278ff53f78ac93c/docs/agent-plans/worker-4-exploration-workflows-acceptance-r2.md) | 97,678 | `3c3701e7230a1007fcf0d90e5aba2b397eaaabe767b43c8b20c4c34b53946ae0` | 3 |

| Owner and tasks | Work sequence | Complete issue text in order |
| --- | --- | --- |
| W1 T01–T05 | Source reconciliation; pointer-only ink and IME dismissal; seven task journeys and PDF grant handling; 12 real tasks × two wordings; seven recordings and the linked 24-row ledger. | [Part 1](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7088705252) · [Part 2](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7088705466) · [Part 3](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7088705695) · [Part 4](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7088705880) |
| W2 T01–T07 | Reconcile the stacked design and merged comparison redesign; blocking-button outline; diagnostics row and jump-to-latest geometry; four genuine first-publication cases; seven surface journeys; browser, CI and capture; handoff. | [Part 1](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7088706092) · [Part 2](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7088706313) · [Part 3](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7088706636) |
| W3 T01–T06 | Reconcile shared changes; cause-specific entrances and tabs; computed contrast and reduced motion; distinct scene/catalog counts; eight UI-specific marks and interactions; eight recordings and reconciliation of all 29 assets. | [Part 1](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7088706930) · [Part 2](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7088707173) · [Part 3](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7088707410) · [Part 4](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7088707680) |
| W4 T01–T06 | Reconcile main and stacked clarity changes; unclipped board headers and visible detail font floor; paired CI triage; seven causal interactions; seven recordings with responsive verification; handoff. | [Part 1](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7088707916) · [Part 2](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7088708135) · [Part 3](https://github.com/skytuhua-org/Gen-V1/issues/1811#issuecomment-7088708340) |

## Coverage and starting evidence

| Worker | Unique UI IDs | Observed starting point and next check |
| --- | --- | --- |
| W1 | 01, 02, 03, 04, 09, 25, 27 | [#1256](https://github.com/skytuhua-org/Gen-V1/pull/1256) and [#1255](https://github.com/skytuhua-org/Gen-V1/pull/1255) overlap. Reconcile the primary repairs, test pointer-only ink and editable-document dismissal, prove a permitted PDF renders and run all 24 real model trials. |
| W2 | 05, 06, 07, 08, 10, 11, 12 | [#1127](https://github.com/skytuhua-org/Gen-V1/pull/1127) contains both reported layout repairs. [#1142](https://github.com/skytuhua-org/Gen-V1/pull/1142) has a failed component-border assertion; four expected-failure entrance cases still need real positive evidence. Preserve the documented pause on the existing design PR. |
| W3 | 13, 14, 15, 22, 23, 24, 26, 29 | [#1152](https://github.com/skytuhua-org/Gen-V1/pull/1152) and [#1254](https://github.com/skytuhua-org/Gen-V1/pull/1254) are open. Resolve first publication, computed contrast and catalog fixture tests; independently exercise reduced motion. Nineteen scenes and 48 advertised types on the W3 snapshot have a different counting unit from the 29 deliverable films. |
| W4 | 16, 17, 18, 19, 20, 21, 28 | [#1143](https://github.com/skytuhua-org/Gen-V1/pull/1143), [#1175](https://github.com/skytuhua-org/Gen-V1/pull/1175) and [#1257](https://github.com/skytuhua-org/Gen-V1/pull/1257) overlap. Reuse the 8px board fix and effective regression; measure expanded detail labels and compare the host/receipt CI failures against the same base. |

## Design and execution contract

Each prompt contains the full component-by-component specification, the original baseline observations and the reference timeline. The previous reference audit inspected all 1,019 decodable frames of the supplied 30 fps recording. Its frame ranges are observations, not reconstructed easing parameters. Each worker’s prompt pins the approved durations, distances, selector/fixture coverage, keyboard, cancellation, reduced-motion, state and layout behavior. Use the task’s object for feedback: a changed graph branch, a failing assertion, one edited cell or a moved card. Keep final values and real actions immediately usable; preserve reading position, draft, caret, source identity and permissions. A repeated snapshot, restoration or unrelated update must never fake new work.

1. All four workers may begin source comparison, reproduction and isolated checks immediately after claim and ACK. Preserve existing claims, branches and maintainer pauses. W3 is editor of new shared host/registry/theme/fixture hunks. W1 and W2 supply narrowly evidenced changes to shared files; W4 retains its own renderer and recording ownership.
2. Before final filming, W3 records a retrievable, reviewed integration candidate with full SHA and inclusion proof for all four lanes. Retain actual merge/PR records when commits were squashed. Verify the state of each exact head and fix only demonstrated owned regressions. No merge or product-release authorization is implied by this plan.
3. Each lane captures **its own** individual H.264 1920 × 1080, 30 fps MP4s on the same frozen product SHA. Show the pre-generation state, first useful publication, source update, interruption or reversal, and durable outcome. Use the per-interface chapter recipes. Run full decode, calculate SHA-256, verify the uploaded bytes, record test matrix and chapter/frame metadata. W3 checks all 29 IDs once and the 7/7/8/7 partition. All 24 live trials also run on that exact product SHA. Mark a missing, failing or inaccessible result explicitly.
4. Independent visual review covers all clips at normal speed, quarter speed and frame-by-frame across meaningful transitions. Record geometry/interaction verdicts at desktop, 640 px content width, 390 × 844 and 200% zoom, with two themes, keyboard, OS reduction and app reduced/off. Use a separate real-display performance profile for frame pacing. W1 hands over a 24-row ledger covering 12 use cases with two wordings and paired task comparisons. Record the owner’s visual verdict, including any rejected IDs. Both evidence streams and human acceptance must be complete before a release determination.

## Acceptance checklist and next checkpoint

- [ ] W1 produced seven verified films, its focused regressions passed, and all 24 real-model rows have the five evidenced judgments on the frozen commit.
- [ ] W2 produced seven verified films; both layout defects, the control outline and four genuine entrances have reproducible, positive and negative results.
- [ ] W3 produced eight verified films; shared lifecycle, tab geometry, contrast, reduced motion and recorder inventory pass on the identified build.
- [ ] W4 produced seven verified films; board geometry, text-size floor and causal state transitions are established, with accurate same-base CI disposition.
- [ ] All 29 linked MP4s open individually, decode to EOF, match producer hashes and share the live ledger's product SHA. The reference review includes each UI's motion, task fit and density verdict. The owner’s decision and exact CI/merge/main-verification state are recorded.

Each receiver's first action is to read the complete prompt, verify open PR heads and existing ownership, then post its worker ID, exact scope, revision and starting SHA on this parent and cross-link the historical lane journal. Post milestones, failures, changed decisions and RELEASE per the repository instructions. No application changes, new captures, real generations or owner sign-off were performed by this plan publisher.