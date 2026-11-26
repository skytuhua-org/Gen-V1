# Report stale issue claims without releasing owners

## META

- Repository: `skytuhua-org/Gen-V1`.
- Plan revision: `2026-11-25-claim-audit-r2`.
- Canonical issue: https://github.com/skytuhua-org/Gen-V1/issues/1260.
- Existing implementation PR: https://github.com/skytuhua-org/Gen-V1/pull/1261, original head `e7da50ef392e8d0b324f15aeecc68287bd4b66ac`.
- Verified integration baseline: `main@104217fe3fabfe41e0ea5071ef8398d9c8f8403d`.
- Coordination: https://github.com/skytuhua-org/Gen-V1/issues/2307, revision `queue-readiness-2026-11-25-r1`; bounded assignment recorded in https://github.com/skytuhua-org/Gen-V1/issues/2307#issuecomment-7175508978.
- Source provenance: full current issue, complete journal, original PR workflow and current-main AGENTS.md reviewed. The earlier audit explicitly prohibited enabling silence-based releases. The current maintainer's queued-PR review task and coordinator assignment authorize a report-only correction, preserving explicit ownership release.
- State at publication: policy and design reconciled; implementation and synthetic regression validation pending. The original queued PR is unchanged and must not be treated as ready from its historical checks.

## OBJECTIVE

Make abandoned or overdue claim records visible to coordinators without declaring another worker's scope released. A later release by worker B must not hide worker A's outstanding work, and an old checkpoint from worker A must never remove a fresh worker B's assignment.

Success means scheduled and manual executions produce a readable per-worker, per-scope report and make zero issue, comment, label or assignment changes. The existing earliest-authorized-owner rule continues until explicit release or maintainer reassignment.

## REQUIREMENTS

1. Retain the 15-minute schedule and manual dispatch, using the existing workflow path `.github/workflows/stale-claim-release.yml` for compatibility. Rename the displayed purpose to a stale-claim audit. A retained `dry_run` input is compatibility-only; even `false` is read-only.
2. Use only `issues: read` permissions. Remove every mutation path, including release comments, assignee clearing and label removal. Do not dispatch the live workflow during repair validation.
3. Read all pages of open issues and their comments. Skip pull requests. Read trusted bot/member/collaborator records, but require a live marker header with a worker identifier. Quoted history and fenced examples are not live records.
4. Track each worker independently and preserve distinct scopes. A release can affect only the actor named in its own header and the scopes it explicitly identifies. `OWNER=NONE` counts only as a live field, not a quoted or prose substring. Never infer a different actor's release from a newer issue-wide marker.
5. A scope-specific checkpoint refreshes only that scope. Structured `SCOPE` values and task identifiers in `TASKS` are supported. Scope ranges such as `T01-T02` expand only within a bounded range. Scope-less records may match a sole outstanding scope for that worker; an ambiguous multi-scope record preserves the existing claims and is reported for manual review. Explicit `SCOPE=ALL` can release that worker's recorded scopes. Unmatched scope releases and ownership-field conflicts require review and cannot clear unrelated scopes.
6. Use GitHub comment creation timestamps, with stable chronological ordering, rather than author-provided UTC strings or the issue's latest marker. Report each outstanding scope whose last applicable record is more than 60 minutes old. Invalid or unparseable records are marked for review; they are never a basis for release.
7. Reports are advisory. They do not adjudicate claim authorization, reassign custody, close issues, or interpret inactivity as permission to take over. Summaries must distinguish overdue scopes from ambiguous records and link to the relevant immutable comment evidence. Escape report values from comment or issue text before rendering HTML summaries.
8. Replace only the proposed sweeper paragraph in AGENTS.md with the actual read-only contract. Preserve the mandatory explicit RELEASE rule and every unrelated instruction. Add exact workflow, test and plan paths to the source allowlist; none is a packaged runtime input.
9. Keep the original queued PR ref unchanged in this session. Publish a durable isolated repair branch with the original head and current main in its ancestry. The coordinator owns any normal queue withdrawal, expected-head update and subsequent exact-head CI.

## REPO_MAP

| Path or artifact | Role |
| --- | --- |
| `.github/workflows/stale-claim-release.yml` | Existing inline github-script implementation; currently mutates issue state from one issue-wide latest marker. |
| `AGENTS.md` | Existing ownership contract and the PR's conflicting proposed sweeper paragraph. |
| `scripts/public-source-files.json` | Exact source allowlist; the original workflow addition is missing. |
| `tests/stale-claim-release.test.ts` | Planned synthetic API harness executing the actual inline workflow script. |
| `tests/ci-queue-guard.test.ts` | Existing precedent for evaluating a workflow script inside a bounded Node VM with mocked GitHub APIs. |
| `tests/public-source.test.ts` | Existing manifest and source-closure verification. |
| `docs/agent-plans/stale-claim-audit-2026-11-25.md` | Complete source of this plan, identical to the canonical issue body. |

## DESIGN

The workflow remains an inline `actions/github-script` job using the existing pinned action. It paginates issue and comment reads, sorts comments by GitHub creation time and identifier, and keeps an issue-local map from worker identifier to independent scope records. Each record retains its last applicable comment and creation time.

Parsing begins at the first live header, not a marker found somewhere inside the body. Extract only unquoted, unfenced metadata fields. An explicit worker/scoped release removes matching records in that worker's map. A release with an unknown scope, an actor/OWNER conflict, or an ambiguous scope-less record leaves existing claims intact and adds a manual-review diagnostic. Generic prose and quoted historical markers cannot release anything. A checkpoint that lacks a matching claim is diagnostic rather than proof of authorization.

After replay, the auditor reports scopes older than 60 minutes and any ambiguous records to logs and the workflow job summary. It performs no GitHub writes, even on scheduled events or legacy `dry_run=false` dispatches. Read failures fail the run rather than presenting an incomplete scan as a complete ownership inventory. No stored ownership state, migration or destructive rollback is needed because every run derives an advisory report from the append-only journal.

## EXECUTION_DAG

| Task | Dependencies | Exact work and observable completion | Owner and handoff |
| --- | --- | --- | --- |
| T01 | None | Publish this full r2 plan and identical Markdown source; preserve the earlier immutable revision and explicitly supersede its mutation proposal. Read back both sources exactly. | `codex-cloud-0b1a19`; then T02. |
| T02 | T01 | Replace issue-wide latest-marker logic with per-worker/per-scope replay; remove every mutation path; set read-only permissions; emit advisory summaries and diagnostics. | Same bounded implementer; then T03. |
| T03 | T02 may begin after fail-first tests are written | Execute the actual inline script against synthetic paginated API fixtures. Prove no writes for schedule and both manual input values, independent workers/scopes, scoped heartbeats/releases, ambiguous/unmatched records, quoted fields, creation-time ordering and stale threshold. Relevant new regressions must fail against the old workflow and pass after T02. | Same implementer; independent coordinator review after green results. |
| T04 | T02 | Correct the single AGENTS.md sweeper paragraph; add exact new source paths to the sorted manifest, preserving all existing entries and runtime classification. | Same implementer; coordinator owns broader queue manifest reconciliation. |
| T05 | T03, T04 | Run the focused workflow suite, relevant source-manifest checks, typecheck/lint and local documentation links. Publish and fetch the immutable repair artifact, compare its tree, and record exact results and remaining gates. No live dispatch or original queued-ref update. | Implementer releases to `codex-cloud-9dc64e`; coordinator owns queue access, original-ref publication and full CI. |

## VALIDATION

Run from the isolated repair clone with the repository-pinned Node 24 and pnpm 10.30.3 dependencies. The initial failure fixtures must use the original inline script from PR #1261 integrated with current main, and must record attempted mutation calls without contacting GitHub.

| Acceptance | Planned verification |
| --- | --- |
| Schedule and manual runs cannot mutate any issue | Mock mutation endpoints record every call; assert zero calls for schedule, manual `dry_run=true` and manual `dry_run=false`; assert `issues: read`. |
| Another worker's release does not erase a claim | Worker A remains overdue after worker B claims and releases a different scope. |
| Fresh work does not hide old work | A fresh B checkpoint cannot suppress A's overdue scope. |
| Same-worker scopes remain independent | Releasing or checkpointing T02 does not release or refresh T01. |
| Ambiguity preserves custody | Multiple active scopes plus an unscoped release remain reported; unmatched releases and OWNER conflicts produce diagnostics without clearing claims. |
| Ordinary explicit release works | Sole-scope release and explicit worker-local `SCOPE=ALL` clear only that worker's matching records. |
| History and outsider input are not live metadata | Quoted or fenced RELEASE/OWNER text and untrusted author records cannot erase a trusted live claim. |
| Pagination and time are coherent | The mock paginate API returns complete histories, including out-of-order records; decisions use creation timestamps and the strict older-than-60-minute threshold. |
| Source and policy remain consistent | Exact manifest entries, unchanged explicit ownership rule, read-only AGENTS paragraph, full plan/body byte equality and immutable artifact tree readback. |

Planned commands: `pnpm exec vitest run tests/stale-claim-release.test.ts tests/ci-queue-guard.test.ts --maxWorkers=1`; focused `tests/public-source.test.ts` checks for manifest uniqueness/classification and local source closure; `pnpm typecheck`; `pnpm lint`; `pnpm check:docs-links`. Publish actual receipts separately in append-only checkpoints. No test result is claimed by this publication-time plan.

Remaining release gates are coordinator review, application of the verified artifact to the original PR through normal queue controls, and fresh required CI. The original auto-release acceptance is superseded and must not be enabled.

## STATE

The original author explicitly released implementation custody in comment7057832199. The 2026-11-24 audit correctly left the proposal open because its writes contradicted AGENTS.md. This r2 revision resolves that conflict in favor of the existing explicit-release contract and the coordinator-approved report-only behavior. `codex-cloud-0b1a19` owns only the scoped repair and plan publication recorded on #2307/#1260. No other worker's live claims, labels or assignments change.

At publication, source changes and tests are planned, not yet verified. The original PR remains queued and unchanged. The current session lacks a normal authenticated queue-removal route; that access gate remains with the coordinator. The next executable action after plan readback is to add synthetic regression fixtures against the old inline script, then implement T02.

## HISTORICAL REQUIREMENTS AND SUPERSESSION

The original proposal was a scheduled workflow that posted RELEASE/OWNER=NONE and cleared assignees and in-progress labels after 60 minutes. Its original acceptance required a schedule and manual dry-run, a release comment in the AGENTS wire format, an AGENTS paragraph and visible dry-run output. The 2026-11-24 audit prohibited enabling that behavior because silence does not release an owner.

This r2 plan preserves the cadence, manual inspection path, AGENTS documentation and reviewable output. It explicitly replaces release comments and assignment/label mutations with a read-only advisory report. Historical dry-run output and checks remain bound to the old implementation and do not establish correctness of this revision. The complete earlier body is preserved at the immutable source below, and its journal is append-only.

## REFERENCES

- Prior complete issue body: https://github.com/skytuhua-org/Gen-V1/blob/f3e947245e1b67916bc3393b934202d93827da64/docs/agent-plans/review-2026-11-23/issue-1260.md.
- Original claim: https://github.com/skytuhua-org/Gen-V1/issues/1260#issuecomment-7057818214.
- Original release: https://github.com/skytuhua-org/Gen-V1/issues/1260#issuecomment-7057832199.
- Prior policy reconciliation: https://github.com/skytuhua-org/Gen-V1/issues/1260#issuecomment-7122862665.
- Bounded repair claim: https://github.com/skytuhua-org/Gen-V1/issues/1260#issuecomment-7175509410.
- Current ownership rules: https://github.com/skytuhua-org/Gen-V1/blob/104217fe3fabfe41e0ea5071ef8398d9c8f8403d/AGENTS.md.
