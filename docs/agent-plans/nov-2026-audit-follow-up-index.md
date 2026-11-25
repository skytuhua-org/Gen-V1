Second swarm audit, building on #1848 (round 1) and #1886 (remediation). READ-ONLY — reports to .harness-audit/workers/R2-*.md, deliverables to .harness-audit/07..15-*.md. No product-code changes.

# November audit follow-up plan

## META
- Repository `skytuhua-org/Gen-V1`. Follow-up plan revision `audit-index-r4`, 2026-11-24 Pacific time.
- GitHub main at triage: `a64e9e2d03ce09c843bff0480d81311f2012c812`. Original audit coordination #1848 records its planned pinned main baseline. The round-one executive summary describes a separate historical working tree at `fix/audit-r08-chatview@6b9d1b0ba`. Round two used `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`. Compare these baselines before claiming current reachability.
- Sources: reports 00–15. Worker attribution and verification quality are recorded in the reports. Use this issue's workstream links as the public follow-up ledger.
- T05 source reconciliation sampled `main@20da5f2ef7830fbcdee419c3e5f8c8b9cfcc5645`. The publication rules for this revision were checked at `main@ddacaf847fe332a0c6c515770284e0cd99cfd4d0`. The latter is a rules check. Use each finding’s ledger for its underlying source and evidence.
- [Canonical issue #1946](https://github.com/skytuhua-org/Gen-V1/issues/1946) · [Plan publication PR](https://github.com/skytuhua-org/Gen-V1/pull/1952).

## OBJECTIVE
Provide one public tracker per actionable scope across the two audits. Reuse current issues, respect existing claims, and preserve separate evidence for old branches, current main, and open PR heads.

## REQUIREMENTS
- Public plans cover actionable functional, documentation, quality, performance and compatibility work. Report vulnerabilities via [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md).
- Keep existing fixes, refuted claims, positive observations and owner decisions recorded. Verify individual findings on the exact current source before counting them as repair work.

## REPO_MAP AND FOLLOW-UP INDEX
| Audit | Scope | Canonical tracking |
| --- | --- | --- |
| 00 | Executive summary and cross-cutting priorities | See #1860 and #1886 for retained round-one work, with round-two follow-ups below. Rank by reproducible data loss, stalled work, and scaling cost. |
| 01 | Round-one security | Private routing under SECURITY.md. Existing safe remediation references remain on #1860. Public records contain only coordination and defensive acceptance. |
| 02 | Stability and bugs | #1860 and #1886 cover existing runtime and terminal remediation. #1953, #1955, #1956, #1957, #1978 track distinct remaining failure families. The typed error envelope stays in #1063. |
| 03 | Performance | #1958, #1959, #1960, #1961, #1962, #1963 cover durable growth, store reads, streaming updates, workspace cost, widgets, and catalogs. #1860 retains existing perf repairs. |
| 04 | Simplicity and redundancy | #1343, #1338, #1339 and #1886 retain the removal and decomposition scopes. #1974, #1977 catalog deferred decisions and vendored scope. Preserve lazy, persisted and public consumers. |
| 05 | Round-one PR audit | #1126 and #1973. Review each relevant unmerged defect on the PR. Refresh exact base/head and disposition missing/truncated older verdicts before counting them as verified. |
| 06 | Coverage and verification | #1848 and this issue retain provenance. #1974, #1971, #1973 cover current decisions, fixture evidence, and affected PR coverage gaps. |
| 07 | Frontend and UI | #1964, #1965, #1966, #1967, #1968, #1969, #1970, #1975, #1976, #1971 cover state, rendering, API and fixture groups. Reused exact scopes #1704, #1728, #1741, #1833 and #1357. #1860 owns desktop sign-in, navigation, and restart work. Review adjacent QA issues before filing finer follow-ups. |
| 08 | Documentation and claims | #1060 for live guides and commands. #1972, #1974 for source-pinned milestone and product policy decisions. #1860 includes existing specific corrections. |
| 09 | PR graph and remaining diffs | #1126 for ready main-target PRs and #1973 for draft and stacked work. #1803 is historical. Keep PR-only findings at their exact PR; no merge or closure authority is granted by this plan. |
| 10 | Round-two security verification | Private routing under SECURITY.md. Avoid public source locations, abuse steps, credentials, and probe artifacts. Refuted and fixed results require disposition rather than a new issue. |
| 11 | Hermes module inventory | #1860 R04 and #1861 track the missing pinned modules. #1977 tracks wider reachable behavior; #1957 owns durable session history. |
| 12 | Runtime verification | #1860 and #1886 own existing runtime repairs; #1974, #1977, #1978 keep remainder and platform verification distinct. Private security routing applies to boundary findings. |
| 13 | Deletion sweep regression | #1886, #1860 and #1343 for sweep, runtime and persisted compatibility. #1953, #1956, #1972 cover distinct remaining behavior. Confirm which production and fixture call paths still reach each case. |
| 14 | Persistence | #1056 for migrations and WAL-aware backup. #1953, #1954, #1955, #1956, #1957, #1958, #1964 cover the remaining data and recovery groups. Route credential custody findings privately. |
| 15 | Measured performance | #1958, #1959, #1960, #1961, #1962, #1963, #1969, #1977 cover repo, host, renderer and vendored costs. Record reproducible setup and current indexes before using historical numbers. |

## DESIGN
Separate independent failures by the component and behavior that must change. Consolidate cross-round duplicates under the existing issue or affected open PR. Keep historical report findings distinguishable from current observations and uploaded proof.

## EXECUTION_DAG
1. **T01 — Pin and reconcile.** Compare current main and any linked PR with the original baseline. Read the matching issue, plan, latest claims and case-specific acceptance. Record already fixed, nonreproducible, pending decision, live, or private triage.
2. **T02 — Reproduce.** Depends on T01. Run the component-specific baseline test in the matching tracker. Record exact evidence and pass the fixture to the owner of the repair. Use only defensive acceptance criteria in public security coordination.
3. **T03 — Repair and verify.** Depends on T02. Use the existing owner and PR if applicable. Require a failing case before edits, passing regression after, and independent review against the exact head. Record native or installed acceptance separately.
4. **T04 — Reconcile status.** Depends on the relevant child result. Update the matching issue and any open PR with current evidence. Keep outstanding decisions and private reporting status visible at coordination level.

### T05 — Reconcile remaining findings
Depends on T01. For each report keep the stable finding ID or heading, source baseline and current disposition in the ledger. For an existing issue or PR verify its scope and acceptance covers the named behavior, then record that link. For a candidate already fixed, identify the repair and verify its scope. For a stale, refuted, owner-decision, or intentionally deferred item record the exact reason and supporting evidence. Recover missing or truncated verdicts from original reports or current PRs where possible and record any remaining gap. File a scoped issue only for an uncovered actionable outcome. Route sensitive reports privately.

**Completion check:** Each unique finding has a verified disposition, with duplicate report entries tied to the canonical finding. A report link alone does not satisfy this check.

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Each issue maps its scope to a specific baseline case and completion criteria. Preserve historical verification bounds. For an in-flight PR re-read its latest base, head, review and check state before starting changes.

## STATE
All 16 reports have workstream tracking. T05 completed the assigned reconciliation of 707 records and 92 candidate matches. The [current finding-level dispositions](https://github.com/skytuhua-org/Gen-V1/blob/a20434f1e821a5825dfb39694cf1db12fd73e50b/docs/review-evidence/nov-2026-audit-coverage/pass-04-summary.md) give each of those 799 locators an exact disposition, with 12 new issues for missing scopes. The prior census and its original evidence below remain the baseline for this pass.

T01–T04 continue in the applicable child issue or PR. Defects require current reproduction and acceptance as specified. Historical source and PR evidence retain the limits in the ledger. Private reporting is pending wherever a verified private receipt is absent. The next implementer action is to pick up the matching issue, read its current claims and plan, and run its named baseline case.

## REFERENCES
#1848, #1860, #1886. [Repository instructions](https://github.com/skytuhua-org/Gen-V1/blob/main/AGENTS.md).

## Finding-level coverage check
GitHub main rechecked at `50b35412812123f882ec12895585b2612c4d2352`. The original index mapped reports to workstreams. This pass cross-checked individual findings that the workstream plans did not include explicitly. The confirmed items below are source observations and reproduction leads.

| Report and finding | Disposition | Evidence or remaining check |
| --- | --- | --- |
| 02 B11 and 15 install staging | #1979 | Current installer promotes the verified version before publishing its active index. Exact retry behavior needs a failing fixture. |
| 07 §§6.1, 6.4 | #1980 | Checkpoint assembly still reads the latest revision after lease acquisition. Adjacent owner retention and schema-admission PRs address separate cases. |
| 07 §6.2 | #1981 | Current close guard still calls flush before a bridge exists. Verify failed startup separately from connected unsaved work. |
| 02 B10 Git snapshot cleanup | #1982 | The cleanup loop still stops on the first thrown removal. Verify the operation result and owned cleanup separately. |
| 02 B9 model discovery | #1983 | Current main settles each adapter separately. The remaining case is a signing-in provider suppressing healthy providers sharing its adapter. |
| 02 B5 worktree preparation | Source changed. Behavioral check pending. | Current main has a cleanup path for an unbound worktree. A duplicate ticket needs evidence of a remaining failure. |
| 07 §10.1 Project Search | #1974 owner decision, related #1635 and #1779 | The path-filter plan explicitly leaves production activation out of scope. Verify current registration and decide availability, retirement or authorized wiring. |
| 04 D13 retained tools and examples | #2159 | Check current vendor pins, selected files and actual entry points. Preserve vendor provenance and decide keep or remove for each candidate. |
| 05 PR findings with truncated verdicts and 09 historical graph | #1973 and #1126 track reconciliation | A batch tracker does not establish that every individual PR finding has been read back and accepted on its current head. |
| 01 and 10 sensitive security findings | Private reporting pending | Follow SECURITY.md. Public issues retain only eligible non-sensitive coordination and defensive validation. |

[Prior index revision](https://github.com/skytuhua-org/Gen-V1/blob/4d97f729057d4777d5cc756ec68fb653dc7b6cb3/docs/agent-plans/nov-2026-audit-follow-up-index.md).

## T05 prior census and dispositions

Revision date: 2026-11-24 Pacific time. Current GitHub main inspected at `fa8f814fd3f8c4b569c7be9932558ed6eff4cc9b`. The 16 source report fingerprints and explicit rows are preserved in the ledger. The issue/PR census captured 460 issues, including closed issues. A row is an audit record and can represent a supporting, repeated, or composite observation.

- [Finding locators for reports 00–04](https://github.com/skytuhua-org/Gen-V1/blob/fb8680775064cc0e0d69accb8c809799b70e5d71/docs/review-evidence/nov-2026-audit-coverage/reports-00-04.md)
- [Finding locators for reports 05–09](https://github.com/skytuhua-org/Gen-V1/blob/fb8680775064cc0e0d69accb8c809799b70e5d71/docs/review-evidence/nov-2026-audit-coverage/reports-05-09.md)
- [Finding locators for reports 10–15](https://github.com/skytuhua-org/Gen-V1/blob/fb8680775064cc0e0d69accb8c809799b70e5d71/docs/review-evidence/nov-2026-audit-coverage/reports-10-15.md)
- [194 historical PR head and base pins](https://github.com/skytuhua-org/Gen-V1/blob/fb8680775064cc0e0d69accb8c809799b70e5d71/docs/review-evidence/nov-2026-audit-coverage/pr-source-pins.md)

| Disposition | Rows | Meaning |
| --- | ---: | --- |
| Summary reference | 18 | Executive summary pointer. |
| Private routing | 380 | Withheld candidate or sensitive source row. Private receipt is still required. |
| Review remaining at prior census | 707 | Exact scope, reachability or equivalence were pending at this census. See the current reconciliation below. |
| Related scope only at prior census | 92 | Candidate ownership required an exact scope check. See the current reconciliation below. |
| Historical disposition | 3 | Original report records refutation, intended behavior, or earlier fix. |
| Named in issue scope | 220 | An existing issue names this finding or explicitly names its report section. Independent behavior and acceptance are still pending. |
| Source changed | 5 | Current source differs in the relevant mechanism. Replay the exact case. |
| New issue verified | 5 | A new issue body, Markdown plan and labels were read back. |
| PR heads pinned | 168 | Head and base metadata are known. Exact defect review is still pending. |
| PR patch checked | 7 | Relevant current patch/source was examined. Exact behavioral acceptance is still pending. |
| Superseded with evidence | 1 | A closed duplicate has the existing repair and regression receipts linked. |

### Newly filed findings
- [#2159](https://github.com/skytuhua-org/Gen-V1/issues/2159) — 04 D13 tool inventory.
- [#2160](https://github.com/skytuhua-org/Gen-V1/issues/2160) — 03 and 15 temporary evaluation input.
- [#2161](https://github.com/skytuhua-org/Gen-V1/issues/2161) — 14 F1 memory availability recovery.

### Recovered PR review records
- Report 05’s seven truncated findings now have exact dispositions. #1082 was closed as superseded by #1867 in the #1081 record. #1035, #1036, #1069, #1146, #1151 and #1165 were read at their current patches. See their individual rows for scope recovered and acceptance still due.
- Report 09 F1 remains visible in #1907 at `e2b18a6a0de16cfe87720385fbc241ab06a7d5b8` and #1909 at `f880c11420ba8e369becc0db52b03e74dc4f08b8`, on the existing #1626 stack. The local-file-preservation requirement belongs to #1626 T03. Establish a fixture result for ignored local files and preserve the prior PR owners. The inspected main file does not contain the stack's fast-forward implementation.
- The earlier cleanup inventory has the same head for 179 of the 194 pinned PRs; 64 share both the recorded head and configured base. This supports source identity and duplicate checks. Issue acceptance and behavioral checks remain separate.

### Prior evidence limits
For a named issue verify the exact accepted behavior before claiming the finding resolved. For PR findings start from the pinned head and verify applicability to the configured base. Some prose, composite observations and truncated worker evidence still need manual enumeration. Sensitive rows require private handling under repository policy. The prior pass ran source and issue/PR comparisons. Runtime reproduction, protected integration and installed acceptance remain pending.

## T05 current reconciliation

The 707 outstanding records and 92 candidate matches now have 799 individually checked tracking dispositions. All 16 frozen report fingerprints matched. Issue copies, pinned plans and labels were read back, and the 799 locators were checked for completeness and uniqueness. [Current reconciliation and source limits](https://github.com/skytuhua-org/Gen-V1/blob/a20434f1e821a5825dfb39694cf1db12fd73e50b/docs/review-evidence/nov-2026-audit-coverage/pass-04-summary.md).

| Disposition | Records |
| --- | ---: |
| Existing issue scope | 548 |
| Existing PR scope | 44 |
| Covered by new issues | 23 |
| Changed or refuted on current evidence | 10 |
| Historical or repeated evidence | 37 |
| Owner decision or fixture test | 65 |
| Private defensive review | 72 |
| Total | 799 |

The 92 candidates yielded 74 verified scope matches, 10 discovery-only scopes, four records covered by newly filed issues, three private review routes, and one refuted or changed claim. [Candidate-by-candidate check](https://github.com/skytuhua-org/Gen-V1/blob/a20434f1e821a5825dfb39694cf1db12fd73e50b/docs/review-evidence/nov-2026-audit-coverage/pass-04-candidate-checks.md).

T05 filed 12 missing issues with labels, complete plans, and an independent reproduce-before-fixing requirement. [#2166](https://github.com/skytuhua-org/Gen-V1/issues/2166), [#2167](https://github.com/skytuhua-org/Gen-V1/issues/2167), [#2168](https://github.com/skytuhua-org/Gen-V1/issues/2168), [#2169](https://github.com/skytuhua-org/Gen-V1/issues/2169), [#2170](https://github.com/skytuhua-org/Gen-V1/issues/2170), [#2171](https://github.com/skytuhua-org/Gen-V1/issues/2171), [#2172](https://github.com/skytuhua-org/Gen-V1/issues/2172), [#2173](https://github.com/skytuhua-org/Gen-V1/issues/2173), [#2174](https://github.com/skytuhua-org/Gen-V1/issues/2174), [#2175](https://github.com/skytuhua-org/Gen-V1/issues/2175), [#2176](https://github.com/skytuhua-org/Gen-V1/issues/2176), [#2177](https://github.com/skytuhua-org/Gen-V1/issues/2177).

### State and next checks

T05 publication is verified for the assigned 799 records. The supporting files give the known cases, exact trackers and evidence boundaries for each disposition. The 65 decision or fixture cases require their listed owners and evidence before a new issue is justified. The 72 restricted records require private triage and a receipt under [SECURITY.md](https://github.com/skytuhua-org/Gen-V1/blob/main/SECURITY.md). Historical PR tests and recoverable source evidence still have their recorded gates. Source and tracker comparisons were executed. Product tests and runtime reproduction remain pending in the child workstreams.

[Previous canonical revision](https://github.com/skytuhua-org/Gen-V1/blob/a20434f1e821a5825dfb39694cf1db12fd73e50b/docs/agent-plans/nov-2026-audit-follow-up-index.md).

[Prior plan revision](https://github.com/skytuhua-org/Gen-V1/blob/949222a9dbf8dc3095df3c8d5dbbc1bb22838bb5/docs/agent-plans/nov-2026-audit-follow-up-index.md).
