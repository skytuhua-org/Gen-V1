Second swarm audit, building on #1848 (round 1) and #1886 (remediation). READ-ONLY — reports to .harness-audit/workers/R2-*.md, deliverables to .harness-audit/07..15-*.md. No product-code changes.

# November audit follow-up plan

## META
- Repository `skytuhua-org/Gen-V1`. Follow-up plan revision `audit-index-r2`, 2026-11-23 Pacific time.
- GitHub main at triage: `a64e9e2d03ce09c843bff0480d81311f2012c812`. Original audit coordination #1848 records its planned pinned main baseline. The round-one executive summary describes a separate historical working tree at `fix/audit-r08-chatview@6b9d1b0ba`. Round two used `chore/deletion-sweep@152cb5e1bdd652fd7dadf240b167e9ee5d37a578`. Compare these baselines before claiming current reachability.
- Sources: reports 00–15. Worker attribution and verification quality are recorded in the reports. Use this issue's workstream links as the public follow-up ledger.

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

## VALIDATION
The implementing agent must independently reproduce the reported bug on a pinned applicable revision before editing product code. Record the SHA, platform, fixture, exact steps or test command, expected and observed result, and failing assertion. For performance, cleanup, documentation or decision work, independently reproduce the cost, consumer mismatch or claim discrepancy instead. If the case does not reproduce, record what was tried and reconcile existing issue/PR evidence before changing code.

Each issue maps its scope to a specific baseline case and completion criteria. Preserve historical verification bounds. For an in-flight PR re-read its latest base, head, review and check state before starting changes.

## STATE
All 16 reports have workstream tracking. Individual finding coverage is partial and still needs reconciliation. Defects require current reproduction and acceptance as specified. Private reporting remains pending for sensitive findings without a verified private receipt. The next implementer action is T01 on their matching issue.

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
| 04 D13 retained tools and examples | Disposition outstanding | Check current vendor pins, selected files and actual entry points. Preserve vendor provenance and decide keep or remove for each candidate. |
| 05 PR findings with truncated verdicts and 09 historical graph | #1973 and #1126 track reconciliation | A batch tracker does not establish that every individual PR finding has been read back and accepted on its current head. |
| 01 and 10 sensitive security findings | Private reporting pending | Follow SECURITY.md. Public issues retain only eligible non-sensitive coordination and defensive validation. |

### T05 — Reconcile remaining findings
Depends on T01. For each report keep the stable finding ID or heading, source baseline and current disposition in the ledger. For an existing issue or PR verify its scope and acceptance covers the named behavior, then record that link. For a candidate already fixed, identify the repair and verify its scope. For a stale, refuted, owner-decision, or intentionally deferred item record the exact reason and supporting evidence. Recover missing or truncated verdicts from original reports or current PRs where possible and record any remaining gap. File a scoped issue only for an uncovered actionable outcome. Route sensitive reports privately.

**Completion check:** Each unique finding has a verified disposition, with duplicate report entries tied to the canonical finding. A report link alone does not satisfy this check.

[Prior index revision](https://github.com/skytuhua-org/Gen-V1/blob/4d97f729057d4777d5cc756ec68fb653dc7b6cb3/docs/agent-plans/nov-2026-audit-follow-up-index.md).

