# Repository issue, PR and CI cleanup

## META

- Repository: `skytuhua-org/Gen-V1`; canonical tracker: [#1803](https://github.com/skytuhua-org/Gen-V1/issues/1803).
- PLAN_REV: `cleanup-2026-11-24-r3`, continuing the November 23 cleanup and its append-only checkpoint history.
- Coordinator: `codex-cloud-8ec5a4`. Parallel review scopes: early issues, later issues, and PR/dependency review. Bounded code repairs retain their existing feature and native owners.
- Source baseline: `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`.
- Finite inventory cutoff: 24 November 2026, 04:06:11 PST (12:06:11 UTC). Review covers 377 starting open issues and 495 PR records, including 494 open PRs at the cutoff and the externally withdrawn #2004. Later arrivals are outside this completed audit.
- Full versioned sources and compact per-item evidence are published through existing [PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994). The final journal receipt pins the exact publication, readbacks and RELEASE.

## OBJECTIVE

Complete the authorized repository cleanup by closing verified completed work, correcting incomplete or stale issue plans, preserving unique PRs and dependencies, repairing the bounded existing-branch integration problems, and removing proven obsolete CI work. Publish the disposition of unresolved feature, native, review and CI integration gates so the next owner can continue without repeating this audit.

## REQUIREMENTS

1. Review every starting open issue using its complete body, current journal and linked repository evidence. Treat accepted requirements and demonstrated completion separately from producer status labels.
2. Close an issue only when its own acceptance is complete or a verified canonical disposition applies. A completed audit does not complete its separately tracked product findings.
3. Preserve original substantive requirements, decisions, tests, source-bound evidence and retrievable history. Correct stale source/API facts and make genuine unresolved decisions explicit without inventing product scope.
4. Review PR integration, redundancy, actual target branches and dependent chains. Preserve unique work, active ownership, drafts and retrievable branches. Similar titles or overlapping files are not duplicate proof.
5. Reduce obsolete or duplicate Actions work while preserving the current code's required qualification, normal review/merge protections, manual runs and main/merge-queue coverage.
6. Publish complete versioned Markdown before canonical body mutation; verify exact immutable bytes, freshly guard the old body, read back the complete replacement, and append a source/hash receipt.
7. Publish refreshed counts, per-item dispositions, concrete validation, environmental limits and ownership releases. The original complete user scope and completion criteria remain verbatim below.

## REPO_MAP

| Source | Purpose |
|---|---|
| `AGENTS.md`, `CONTRIBUTING.md`, PR template at the baseline | Publication, ownership, validation and review requirements |
| Issue and PR journals, actual head/base commits | Accepted scope, source custody, integration and completion evidence |
| `docs/agent-plans/review-2026-11-23/` | 177 complete prior reviewed plans |
| `docs/agent-plans/review-2026-11-24/` | Complete continuation plans and identical missing mirrors |
| `docs/review-evidence/cleanup-2026-11-24/README.md` | Continuation report |
| `docs/review-evidence/cleanup-2026-11-24/issue-dispositions.json` and `pr-dispositions.json` | Every issue/PR decision with applicable source pins and evidence |
| `docs/review-evidence/cleanup-2026-11-24/plan-publication.json` and `ci-cancellations.json` | Exact publication provenance and verified cancelled runs |
| #2000; existing #1370, #1448 and #1823 branches | Bounded CI and desktop source changes |

## DESIGN

Three parallel reviewers handled 164 earlier issues, 212 later issues and the PR/dependency audit; the coordinator owns this tracker, final publication and the bounded bookmarks/CI work. Existing full mirrors were compared to current canonical snapshots before targeted revisions. Every closure and branch change has a specific evidence record.

PR checks use real target refs, ancestry, merge-tree results, stable patches and dependency relationships. Four incorrectly closed unique PRs were restored. #2004 remains withdrawn on its author's explicit later release. #2114 remains with its active owner after its newer revision 5 and queue claim arrived; the same newest source is retained in the consolidation to prevent an older plan from overwriting it.

Four published source heads are immutable evidence: #2000 `b8379a96404d58961c0905e3db71a25b1f35488c`; #1370 `1eeb4bd0eb851118fdfed067e466d971f4a9a576`; #1448 `f99990cefac1f81b5c42b35ac6fa9a4ab598b900`; #1823 `d1f8cff83456d1f17e95c5058a8ed9fdd5c68789`. Each used a guarded non-force update and exact tree/source verification. Main and protected integration are not bypassed.

The CI guard proves old revision membership and makes its final authority decision synchronously after all proof reads. Discovery is broader but bounded. The plan-only classifier accepts only its narrow verified path/manifest case and otherwise retains existing coverage. Immediate queue removal is 14 confirmed obsolete M05 runs, 28 matrix jobs. Local tests and queued CI are not timing measurements.

## EXECUTION_DAG

| Task | Dependencies | Disposition and done-when |
|---|---|---|
| C01 Resume and pin scope | None | Complete: uploaded prior transcript, applicable repository instructions, current inventories and existing checkpoints read. |
| C02 Reconcile every issue | C01 | Complete review: 377 dispositions, targeted full plans, 167 additive label corrections. Close #1992 only after its independent audit acceptance and immutable/body readbacks; retain its 39 product gaps. |
| C03 Reconcile every PR | C01 | Complete review through cutoff: 495 records, dependencies and changed heads reconciled; four unique candidates restored; remaining target conflicts and active publication ownership recorded. |
| C04 Reduce obsolete CI work | C01,C03 | Published bounded policy repair and 14 confirmed cancellations. Hosted integration/performance measurement remains in #2000/#1666; no gate waiver. |
| C05 Publish bounded branch repairs | C03 | Complete: current-main integrations and targeted fixes in existing #1370/#1448/#1823, exact readbacks and scoped releases. Original feature/native acceptance stays open. |
| C06 Publish plans, ledgers and closeout | C02-C05 | Complete only after the immutable publication, fresh canonical/readback checks, final count receipt and coordinator RELEASE recorded in this journal. This tracker may then close as the completed cleanup audit. |

## VALIDATION

The full per-scope results and limitations are in the continuation report and issue/PR journals. CI policy tests 136/136, power-focused/manifest 116/116, taskbar-focused/manifest/registry/UI 142/142 and bookmarks-focused 83/83 passed. Each code repair also passed its stated typecheck/lint/build gates. The taskbar wider service run includes two failures independently reproduced on main; these are not counted as passes.

Browser execution for all three desktop repair scopes was blocked before app execution by the executor's Chromium singleton socket restriction. Current supported-Windows, installed-app and frontend acceptance remains unexecuted here. #1643 additionally retains the independently found persistence-failure/rollback gap. Historical producer results remain bound to their original source.

First continuation publication `78253df0c9e3b60a321377e315935104a8608adb` was fetched from GitHub and all 60 changed files compared exactly; source-manifest tests 13/13 and documentation links 0 broken passed. Final publication checks and all canonical/state readbacks are recorded in the closing receipt. Three inherited original-body whitespace diagnostics are disclosed without silently rewriting history. The documentation checker does not test external URLs.

## STATE

The bounded review and source maintenance are complete once C06's closing receipt is posted. #1992's completed audit and this cleanup tracker are distinct from unresolved product work. Eight target conflicts, current native/frontend acceptance, the preserved original feature gaps, normal #1994/#2000 integration and #1666 real-run speed measurement remain explicitly assigned to their existing scopes.

The final RELEASE sets OWNER=NONE for this cleanup coordinator and records the worker releases. No feature/native/active CI owner is replaced. No personal assignee or in-progress label was acquired. A later PR arrival does not silently expand this finite review cutoff.

## REFERENCES

- [Original plan consolidation and byte provenance](https://github.com/skytuhua-org/Gen-V1/blob/b0e28523f0eb1ac4a45c64a6a65beec75084bbf9/docs/review-evidence/cleanup-2026-11-23/plan-consolidation.json)
- [Prior 177 complete plans](https://github.com/skytuhua-org/Gen-V1/commit/f3e947245e1b67916bc3393b934202d93827da64)
- [First continuation 57-plan publication](https://github.com/skytuhua-org/Gen-V1/commit/78253df0c9e3b60a321377e315935104a8608adb)
- [Checkpoint 015 and concurrent-work guard](https://github.com/skytuhua-org/Gen-V1/issues/1803#issuecomment-7131062437)
- [Power maintenance evidence](https://github.com/skytuhua-org/Gen-V1/blob/1eeb4bd0eb851118fdfed067e466d971f4a9a576/docs/review-evidence/2026-11-24-power-keeper-maintenance.md)
- [Taskbar maintenance release](https://github.com/skytuhua-org/Gen-V1/issues/1803#issuecomment-7130723948)
- [Bookmarks maintenance release](https://github.com/skytuhua-org/Gen-V1/issues/1643#issuecomment-7130646650)
- [Active 1666/2114 ownership and revision 5](https://github.com/skytuhua-org/Gen-V1/issues/1666#issuecomment-7130859562)

## Complete preserved original scope

Audit the open GitHub backlog against the actual target branches. Close verified redundant pull requests or completed and duplicate issues, retain unique work and dependent branches, and repair reproducible merge conflicts on existing PR branches. Record evidence for closures and branch changes. Completion requires a refreshed count and a disposition for unresolved cases, with normal review and CI protections in force.

## November 23 follow-up

Review all 333 issues open at the start of this round against current main and linked implementation evidence. Close completed or truly duplicate work with references, correct stale status, fill missing actionable requirements from the existing accepted scope, and check the applicable AGENTS.md publication and handoff requirements. Review every open PR for redundancy and completed work. Reduce obsolete and duplicated GitHub Actions work and improve scheduling within the existing review protections. Preserve the original requirements and retrievable history when revising records.

## Completion criteria

- Every starting open issue has a reviewed disposition backed by the issue body, current journal, linked work and repository evidence.
- Each closure identifies the implementation or canonical issue and verifies the relevant acceptance criteria.
- Revised plans retain substantive requirements and identify remaining work, validation and linked source.
- Every open PR has been checked for redundancy and integration state, with dependent branches accounted for.
- CI queue changes target obsolete or duplicate work and retain required coverage for the current code.
- Final issue and PR counts, queue findings, remaining limitations and the changed records are published here.
