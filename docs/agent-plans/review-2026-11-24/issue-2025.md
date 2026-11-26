# Plan: Derive hunk attribution from proven preimages and postimages

## META

| Field | Value |
|---|---|
| Audit finding | M08-01 |
| Repository | skytuhua-org/Gen-V1 |
| Canonical target | [2025](https://github.com/skytuhua-org/Gen-V1/issues/2025) |
| Parent review | [#1992](https://github.com/skytuhua-org/Gen-V1/issues/1992), T07–T09 |
| Plan revision/date | original-plan-audit-r1, 2026-11-24 UTC |
| Verified baseline | main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b |
| Status | Planning only. Retained implementation exists; the specific gaps below are not verified complete. No code, tests, configuration, branches or PRs changed by this audit. |
| Source precedence | User v6 ledger is authoritative; completion appendix supplies follow-up sequence; research v3 supplies rationale only. Exact relevant original clauses are reproduced below. |
| Ownership | Audit owner codex-cloud-m0709-b197ad releases to codex-cloud-ca7d38 for publication. Existing implementation/review owners retain custody. Future implementing owner must claim this focused scope before editing. |

## OBJECTIVE

The service captures an in-memory beforeDigest and records a proven receipt after a confirmed write, but beforeIdentity is null and boundedBlobRefs is empty. hunkAttribution labels every current HEAD diff hunk proven if the newest whole-file receipt afterDigest equals current bytes. It does not derive the owner’s actual before-to-after patch. Thus an owner changing line 28 after another writer changed line 2 labels both HEAD hunks proven. The current Changes view has no per-hunk provenance. The existing test blesses a receipt with null beforeDigest, which cannot establish authorship.

Deliver derive hunk attribution from proven preimages and postimages through the retained implementation. Success means the exact original requirements mapped below are observable from the supported host path, the named failure cases have deterministic regression evidence, and unsupported capabilities remain unavailable. Contract definitions, test-only injection and historical merged PRs are evidence of retained work, not current live acceptance.

## REQUIREMENTS

### Authoritative original requirements for this focused gap

**M08-C01.** EditReceiptV1: invocationId, owner, workspaceIdentity, repositoryId, path, beforeIdentity, beforeDigest, afterDigest, boundedBlobRefs and attribution STRUCTURED_EDIT_PROVED|PROCESS_WINDOW_ONLY|UNATTRIBUTED. A shell window does not prove which agent authored every changed line.

**M08-S01.** Reuse current project/worktree binding and private Git family checks. Map all writes to their true owner. Before/after blobs are captured only through approved file access; exclude secrets and mark oversized/binary data unsupported instead of storing it silently.

**M08-S02.** Append proven structured-edit receipts after a confirmed write, with a prepared record before it where needed for recovery. Mark arbitrary shell changes as process-window evidence unless the actual write can be attributed. Preserve two agents' conflicting receipts independently.

**M08-S03.** For selective commit, calculate candidate hunks from proven pre/post images and show an exact preview. Do not select a whole file because its name appears in a journal. Mixed staged/unstaged edits or unknown authorship require explicit human selection.

**M08-U02.** Review shows agent attribution per hunk: Proven structured edit, Process window or Unattributed. Unknown attribution cannot be automatically included in Commit my changes.

**M08-T01.** Two agents edit separate files and the same file; selective commit includes only chosen proven hunks and preserves unrelated staged content.

**M08-G01.** Checkpoint read/history and provenance can pass without write-capable delegates. Restore, selective commit and child execution require exact approval and real path/race tests. No cross-filesystem or cross-repository atomicity claim is allowed.

**M08-G02.** Host-owned flags: workspace.provenanceV1, workspace.checkpointsV1, workspace.restoreV1, workspace.writeDelegateV1. Register only these keys in the shared finite registry; default false. Do not add them to strict UI preferences or allow agents/plugins to enable them. Each risky sub-capability needs its own proof; do not use one successful core test to unlock all flags.

**M08-G03.** Rollback: Disable new mutation commands while preserving journals, retained worktrees and checkpoint blobs. Never delete a pre-restore backup while recovery is unresolved. Existing code review remains usable in read-only mode.

### Scope and fixed boundaries

This is a repair or completion of the named gap, not a reimplementation of the milestone. Preserve the original main-thread/read-only paths, historical records and default-false host flag registry. Never place these flags in UI preferences or let an agent/plugin enable them. No dependency, language server, debugger, provider runtime or platform backend download is authorized. M12/M14 belong to other workers and receive no edits. Do not restore retired CodeReviewHost, Research QA or other removed workspaces. UI changes use supported current surfaces only after the explicit API/surface decisions named below.

The source document calls the original milestone MERGED / DO NOT REIMPLEMENT. Its historical instructions are a requirement ledger here, not blanket implementation authorization. Implement only the specific failing requirement shown in OBJECTIVE and DESIGN. A missing accepted API, exact owner or real backend proof blocks that dependent task with a named HOLD; it does not authorize inventing a parallel subsystem.

Compatibility requires old records to remain readable, versioned new metadata rather than changing frozen contracts silently, and explicit migrations when needed. Keep bounded UTF8 payloads, approved path access and existing account custody. Expose loading, unavailable, stale, conflict and partial states honestly. UI controls must have visible labels, keyboard access, focus recovery and an explanatory disabled reason; use current shared components and existing reduced-motion policy. Preserve source text and private data; no secrets in logs/screenshots.

### Follow-up instructions preserved from the supplied completion document

M08 | Managed workspaces, selective commits and checkpoints
START M08 COMPLETION FOLLOW-UP
Start from accepted main at #331 and inspect #336 and the current checkpoint evidence. Use existing workspace provisioning, change receipt, source ownership and checkpoint services. Research v3 §14.1 and §17 P1-1 specify private-index attribution and concurrent HEAD handling.
1. Run current Git/change attribution, file-checkpoints and checkpoint-restore tests. Use an owned scratch fixture with two agents, shared-file edits, untracked/binary paths and a changed HEAD. Select one owner’s allowed hunks only. Assert the other agent’s bytes and caller index are untouched and a moved HEAD refuses the commit.
2. Exercise the real Workspace Changes and checkpoint restore surfaces on the intended desktop/browser lanes. Restore the owned snapshot only under a current binding, preserving unsaved or newer edits through the existing conflict flow. Test deny/stale/missing states, cross-worktree identity and rollback recovery. Record full application results separately from component fixtures.
3. Verify real environment provisioning and cleanup under the current M03 profile on supported platforms. Preserve base-source and dependency receipts, including current M06 proof where consumed. Never clean a developer’s working copy or commit unrelated staging.
4. Without the required native Windows/worktree proof, record HOLD_WORKSPACE_PLATFORM and keep the affected acceptance lane open. Record independent review under the repository’s existing process.
END M08 COMPLETION FOLLOW-UP

Only the clauses owned by this plan are implemented here; related requirements in the same follow-up remain dependencies with their separate owners.

## REPO_MAP

All links below are pinned to the audited source. A listed helper is not claimed to have a production caller unless explicitly stated. T01 refreshes these paths against the latest accepted main and active PRs before implementation.

| File | Verified function, component or evidence |
|---|---|
| [packages/workspace/edit-journal.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/workspace/edit-journal.ts) | prepare, recordProvenEdit, hunkAttribution |
| [packages/workspace/selective-commit.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/workspace/selective-commit.ts) | candidates |
| [packages/core/service.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/core/service.ts) | captureEditPreimage and recordEditReceipt |
| [packages/contracts/workspace-checkpoints.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/packages/contracts/workspace-checkpoints.ts) | EditReceiptV1 |
| [apps/web/src/WorkspaceSurfaceBody.tsx](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/apps/web/src/WorkspaceSurfaceBody.tsx) | DiffBody |
| [tests/selective-commit-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/selective-commit-v3.test.ts) | whole-file provenance fixture |
| [tests/workspace-journal-v3.test.ts](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/tests/workspace-journal-v3.test.ts) | receipt persistence |

Historical bundle evidence: [M08-verification.json](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/implementation/v3/M08-verification.json). It belongs to the historical base recorded inside that document. It is not current main proof. M07 records live LSP/DAP and worker feed gates open; M08/M09 record pending independent review and platform/integration gates. Current [progress ledger](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/docs/progress.md) does not establish these milestones complete.

Dependencies and adjacent owners:

- #1954 blob integrity and reference custody
- M08-05 retention references
- #1235 optional hunk publish is related but excludes M08 qualification
- #1943 Recorded binding
- Merged PR623 fixes porcelain/untracked empty-file/temporary cleanup; retain those changes. It does not establish per-hunk authorship.

## DESIGN

Capture bounded approved pre/post images and true file identity for confirmed structured writes, with prepared markers and durable blob references. Attribute only the exact interval/patch contribution proven by those images and owner. Compose overlapping histories conservatively; conflicting, missing, shell-only or unmappable history is Process window or Unattributed, never auto-selected. Preserve receipts for both owners independently. Reuse checkpoint blob custody only through a reference-aware accepted store API, so GC cannot delete referenced proof. No blanket secret/binary snapshots.

### Concrete implementation and integration boundary

Extend receipt preparation/finalization to preserve exact bounded pre/post references and file identity through restart. Replace path-only hunkAttribution with a conservative per-hunk mapping that receives requested owner and exact preview revision. Change candidates to use the mapping and explicitly surface coverage loss, not just filename matches. Keep actual structured/process-window/unattributed categories.

Show each hunk with Proven structured edit, Process window or Unattributed, owner and exact source revision. Unknown or mixed hunks require explicit selection. The existing Current/Recorded/History surface remains the host; coordinate #1943 binding work and #1235 optional hunk publishing without taking their ownership.

### Failure, persistence, migration and rollback

Validate owner/source/epoch/revision immediately before authority-bearing effects and again when accepting asynchronous results. Preserve uncertain outcomes as explicit unknown/conflict/partial states; retry only after authoritative reconciliation. Writes must be either idempotently replayable from their durable receipt or require a new exact preview/approval. A UI acknowledgment is not an effect receipt. Missing proof remains unavailable, with the successful read-only path preserved.

New records require an explicit schema version, compatibility test against the retained format, and an owner-approved migration plan before T03. Rollback disables new admission at the existing host flag/capability boundary, retains all receipts, journals, blobs and dirty workspaces, and closes only confirmed-owned resources. It never rewrites user bytes or replays an unresolved input automatically. Do not remove historical evidence; label its source and acceptance limit.

## EXECUTION_DAG

Tasks are sequential unless T01 records a narrower nonoverlapping file allocation. Each handoff requires an issue checkpoint and receiver ACK. No task may take another worker's claimed implementation files.

### T01: Refresh custody and baseline

Owner: integration reviewer. Dependencies: complete canonical issue, this full plan, all comments and active related PRs. Inputs: pinned baseline and REPO_MAP. Read AGENTS.md/CONTRIBUTING.md and current issue journal; inspect latest main, related branches and full PR patches. Record which exact fixes are merged, open, withdrawn or owned. For reuse targets, preserve every original issue requirement above and resolve overlapping deliveries with the existing owner. Output: refreshed source map, exact interface owner and nonoverlapping task assignment. Positive check: every path/function and current production caller exists as stated. Negative check: no test-only seam, historical PASS or unmerged PR is called current. Done when this map and claim are read back from GitHub. Handoff: core owner for T02. If accepted API/scope is missing, mark only the affected task BLOCKED and preserve independent read-only work.

### T02: Reproduce and freeze the boundary

Owner: core reviewer, depends T01. Inputs: current source and requirements. Run the companion owned-temp Git primitive fixture: two separated hunks remain in HEAD diff while the current newest-receipt predicate labels the entire path proven. Then add a product test with owners A/B editing separate hunks and overlapping lines, including a foreign edit before A’s first receipt and staged content. Only the chosen proven owner patch may be auto-selected. This is distinct from index preservation in M08-02. Use owned temporary roots/fixtures and explicit barriers; do not alter the working user's data. Inspect the exact API, error taxonomy and versioning owner before proposing changes. Output: a failing focused product regression or a precise unavailable-acceptance gate, plus accepted input/output contracts and current behavior evidence. Positive/negative tests: the named baseline behavior and counterexample must both be asserted. Recovery/cancel: add the deterministic failure points named in VALIDATION. Done when the test fails for the stated cause or a missing proof is explicitly recorded without fabricating a runtime failure. Handoff: T03 implementing owner.

### T03: Repair the core contract and lifecycle

Owner: one host/domain implementer, depends T02 and named upstream proof/API decisions. Inputs: the accepted contract and failing regression. Extend receipt preparation/finalization to preserve exact bounded pre/post references and file identity through restart. Replace path-only hunkAttribution with a conservative per-hunk mapping that receives requested owner and exact preview revision. Change candidates to use the mapping and explicitly surface coverage loss, not just filename matches. Keep actual structured/process-window/unattributed categories. Edit only the verified owning files in REPO_MAP and necessary versioned interfaces; any additional path must be discovered and recorded, not guessed. Output: minimal reviewed implementation with persistent identity/recovery semantics and a green focused regression. Positive check: intended current path works. Negative check: denied/stale inputs have zero unauthorized effects. Recovery/cancel check: durable state stays truthful under the exact failure barriers. Done when the branch records commit SHA, changed paths, test outputs and unresolved platform gates. Handoff: T04 surface/adapter owner after interface commit and ACK.

### T04: Connect the real caller and supported UI

Owner: adapter/UI implementer, depends T03. Inputs: accepted service interface, current supported app surface and source-bound fixtures. Show each hunk with Proven structured edit, Process window or Unattributed, owner and exact source revision. Unknown or mixed hunks require explicit selection. The existing Current/Recorded/History surface remains the host; coordinate #1943 binding work and #1235 optional hunk publishing without taking their ownership. Trace the real start-to-result path and attach owner/revision to every request and response. Do not claim a fixture-only component or a mounted but empty reader is a production integration. Output: working supported entry point and visible blocked/error/recovery states. Positive check: user action reaches exactly one owned operation. Negative check: missing proof, changed context or stale response cannot display success or dispatch. Recovery/cancel check: reload/stop/switch-owner retains authoritative history and does not retry uncertain mutations. Done when a browser trace and exact request/response assertions cover the real caller. Handoff: T05 verifier. If this plan has no UI change, verify the existing affected caller and state instead of introducing a new screen.

### T05: Execute requirement acceptance at the proper level

Owner: independent verifier, depends T04 and the exact approved toolchain/platform. Inputs: pinned implementation head, complete requirement matrix, owned fixtures and approved native inputs. Run the focused commands in VALIDATION, then the specific supported App and native cases. Do not install missing prerequisites or substitute the provisioned wrong pnpm version. Output: source-pinned results with expected/actual outcomes, counts, logs, environment identity and explicit NOT_RUN gates. Positive/negative/recovery/cancel outcomes are all required. Preserve earlier failing attempts and do not call synthetic adapter or guard stubs native proof. Done when every owned matrix row is passed or precisely held with owner and next executable step. Handoff: T06 integration owner, with actionable defects returned to T03/T04.

### T06: Review, evidence and release

Owner: integration owner, depends T05. Inputs: reviewed exact head, test evidence and latest upstream PR state. Rebase only after agreed owner coordination; rerun affected checks after any source change. Update the current qualification record with source identity, actual adapter/backend version, test scope, unavailable phases and independent review outcome. A documentation change follows #1972 ownership. Preserve rollback/recovery records and prepare the focused PR under existing review rules. Positive check: all accepted requirements have evidence. Negative check: no pending CI, mock PASS, historical artifact or unpublished local file is presented as complete. Done when review/CI and actual-on-main acceptance are separately recorded. Final checkpoint releases OWNER=NONE, clears only own assignment/labels and gives the next operator exact source and remaining gates. Publication or merge alone does not close unmet acceptance.

## VALIDATION

### Reproducible setup and planned commands

Run from the repository root with Node meeting package.json (audited runtime 24.22.3) and the pinned pnpm 10.30.3 plus already provisioned locked dependencies. Current audit has pnpm 11.25.0 and no node_modules; offline Corepack cannot supply the pin. Product suites are NOT_RUN/HOLD_TOOLCHAIN. Obtain an approved provisioned environment through the owner; do not download or rewrite the lockfile. Browser fixtures require the already provisioned browser. Real Windows/native proof uses the exact approved backend/profile, not Linux guard stubs.

```sh
python audit-reproduce-git-primitives.py
pnpm exec vitest run tests/workspace-journal-v3.test.ts tests/selective-commit-v3.test.ts --maxWorkers=1
pnpm exec playwright test --config tests/e2e/workspace-host.playwright.config.ts
pnpm typecheck
pnpm exec vitest run tests/public-source.test.ts --maxWorkers=1
pnpm check:docs-links
```

Existing commands above must exist at the refreshed head; proposed PR-only paths are explicitly identified in this plan and run only after their reviewed introduction. New tests added by T02 are registered in scripts/public-source-files.json and named in the implementation checkpoint. A route-mocked browser proves rendering/request behavior only; the same user flow must be repeated through the current actual app for the integration gate. Native process/filesystem tests record exact platform, executable/profile identity and pre/post state.

### Fixtures and expected behavior

Positive: two owners, separate files and separate hunks on one file, yield only selected owner-proven hunks. Negative: foreign prior edit, overlapping patch, absent before blob, stale afterDigest, process-only receipt, binary/oversize/secret file never gain proven status. Recovery: prepared-only receipt after crash cannot prove a write; valid receipts survive restart. Cancel: failed/cancelled writes emit no successful ownership proof.

For all cases, record the input owner/source/revision, expected effect count, actual state/bytes, log or trace path and final outcome. Retry tests must prove at-most-once user/effect semantics rather than merely returning a success response. Screenshots use synthetic data and include unavailable/stale/partial states where the plan owns UI. Keyboard and focus tests verify the existing shared surface at narrow width and reduced motion.

### Acceptance mapping

| Original requirement | Tasks | Acceptance |
|---|---|---|
| M08-C01 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-S01 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-S02 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-S03 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-U02 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-T01 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-G01 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-G02 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |
| M08-G03 | T02 contract/reproducer, T03 core, T04 boundary, T05 acceptance | Preserve the exact quoted requirement above; demonstrate the relevant positive, negative, recovery and cancel behavior below with a source-pinned result. |

### Executed versus pending

This audit executed source reads, repository-wide caller searches and GitHub issue/PR inspections. It did not run product tests, enable features, exercise a live provider, or mutate repository files. The only executed behavioral fixture for M08-01/M08-02 is the dependency-free owned Git/source-predicate reproduction reproduced below; all other runtime acceptance remains NOT_RUN. Historical test results remain attributed to their original PR/base. Product regression and real supported Changes selection remain NOT_RUN; the owned-temp fixture confirms the source counterexample only. Read-only provenance may qualify separately from write delegates; no activation inferred.

### Dependency-free owned fixture

Save the following as `audit-reproduce-git-primitives.py` outside the checkout and run it with Python 3. It creates and removes its own temporary Git repository. It neither imports Gen nor changes the reviewed checkout. The index case executes the decisive Git command; the attribution case deliberately models the inspected predicate and must be followed by the product regression.

```python
"""Owned temporary Git fixtures only; does not import or execute Gen product code."""
import hashlib
import json
import os
import pathlib
import subprocess
import tempfile

def main():
    results = {}
    with tempfile.TemporaryDirectory(prefix='m08-audit-owned-') as temp:
        root = pathlib.Path(temp)
        def git(*args, extra_env=None, input=None):
            env = dict(os.environ)
            env.update(extra_env or {})
            return subprocess.check_output(['git', '-c', 'user.name=Owned audit fixture', '-c', 'user.email=fixture@example.invalid', *args], cwd=root, env=env, input=input, stderr=subprocess.PIPE).decode().strip()
        git('init', '-q')
        (root/'chosen.txt').write_text('base\n')
        (root/'unrelated.txt').write_text('original\n')
        git('add', 'chosen.txt', 'unrelated.txt')
        git('commit', '-qm', 'fixture base')
        old = git('rev-parse', 'HEAD')
        (root/'chosen.txt').write_text('agent selected\n')
        (root/'unrelated.txt').write_text('human staged\n')
        git('add', 'unrelated.txt')
        staged_before = git('diff', '--cached', '--name-only')
        index = str(root/'private.index')
        private = {'GIT_INDEX_FILE': index}
        git('read-tree', old, extra_env=private)
        git('add', 'chosen.txt', extra_env=private)
        tree = git('write-tree', extra_env=private)
        commit = git('commit-tree', tree, '-p', old, input=b'selected change\n')
        ref = git('symbolic-ref', 'HEAD')
        git('update-ref', ref, commit, old)
        git('read-tree', 'HEAD')
        staged_after = git('diff', '--cached', '--name-only')
        assert staged_before == 'unrelated.txt' and staged_after == ''
        assert (root/'unrelated.txt').read_text() == 'human staged\n'
        results['index_reconciliation'] = {'scope':'Git primitive reproduction of selective-commit.ts final read-tree, not a product test', 'staged_before':staged_before, 'staged_after':staged_after, 'working_file_preserved':True, 'unrelated_staging_preserved':False, 'result':'CONFIRMED_PRIMITIVE_BEHAVIOR'}
        base = ''.join(f'line {i}\n' for i in range(1,31))
        (root/'mixed.txt').write_text(base)
        git('add','mixed.txt'); git('commit','-qm','mixed base')
        foreign = base.replace('line 2\n','foreign edit 2\n')
        after = foreign.replace('line 28\n','owner edit 28\n')
        (root/'mixed.txt').write_text(after)
        patch = git('diff','HEAD','--','mixed.txt')
        current_digest = hashlib.sha256(after.encode()).hexdigest()
        latest_receipt = {'beforeDigest':hashlib.sha256(foreign.encode()).hexdigest(),'afterDigest':current_digest,'attribution':'STRUCTURED_EDIT_PROVED'}
        path_label = 'proven' if latest_receipt['afterDigest'] == current_digest else 'unattributed'
        assert patch.count('@@') == 4 and '+foreign edit 2' in patch and '+owner edit 28' in patch and path_label == 'proven'
        results['whole_file_attribution'] = {'scope':'Explicitly models inspected hunkAttribution predicate; not an executed product test', 'diff_hunks':2, 'contains_foreign_and_owner_hunks':True, 'single_path_label':path_label, 'required_foreign_label':'unattributed', 'result':'CONFIRMED_SOURCE_COUNTEREXAMPLE'}
    print(json.dumps(results, indent=2))

if __name__ == '__main__':
    main()
```

Actual audit output:

```json
{
  "index_reconciliation": {
    "scope": "Git primitive reproduction of selective-commit.ts final read-tree, not a product test",
    "staged_before": "unrelated.txt",
    "staged_after": "",
    "working_file_preserved": true,
    "unrelated_staging_preserved": false,
    "result": "CONFIRMED_PRIMITIVE_BEHAVIOR"
  },
  "whole_file_attribution": {
    "scope": "Explicitly models inspected hunkAttribution predicate; not an executed product test",
    "diff_hunks": 2,
    "contains_foreign_and_owner_hunks": true,
    "single_path_label": "proven",
    "required_foreign_label": "unattributed",
    "result": "CONFIRMED_SOURCE_COUNTEREXAMPLE"
  }
}
```

### Mandatory repository gates retained from v6

Before the relevant targeted suites, run the required asset builds in the provisioned matching toolchain. Execute each command separately and retain its real exit code and bounded log hash. A missing native build prerequisite blocks that dependent acceptance lane; test:no-lease is diagnostic only and cannot replace pnpm test. Do not download a toolchain, change browser channels, extend a timeout, skip required cases or use passWithNoTests to obtain green.

```text
pnpm build:credential-lease
pnpm build:widgets
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:browser
```

The focused commands already listed run after asset preparation and before the full gates. Record actual case identities, passed/failed/skipped counts, source SHA and environment for each receipt. Product, native, installed and live checks remain NOT_RUN/HOLD_TOOLCHAIN in this audit. These are prospective implementation acceptance commands, not review results.

### Plan artifact availability

The actual GitHub Markdown file upload failed in this review environment. The full execution plan is published in the canonical issue body, and its .md source is provided separately with the review deliverables. Issue-body text is not represented as an attachment. No repository-docs commit or PR was authorized or created. The publisher reads back the entire body and records its source SHA256 before releasing the publication scope.

## STATE

Researched: all relevant supplied v6 and completion clauses, research context, pinned source and adjacent issue scopes. Decided: preserve retained implementations, frozen interfaces, current supported surfaces, exact authority and independent gates; each concrete design above is a proposed repair of the named requirement, not a new activation decision. Implemented by this audit: no product code or tests. Verified: source existence/caller absence and the explicitly stated owned Git primitive fixture only. Runtime, browser, Windows/native, installed/live and independent acceptance: NOT_RUN unless separately recorded by a future owner at the exact head.

T01–T06 are NOT_STARTED for implementation. Audit drafts are ready for coordinator duplicate/quality review. Existing issue/PR owners and their release checkpoints remain authoritative; do not infer release from silence. Risks: current main can move, pending fixes overlap, APIs may be intentionally unavailable, and mocks cannot prove confinement. Exact next action: root validates this full plan and its duplicate target; the future implementation owner then reads the whole issue/journal, claims the smallest scope, refreshes current source/PR state and executes T01. Product regression and real supported Changes selection remain NOT_RUN; the owned-temp fixture confirms the source counterexample only. Read-only provenance may qualify separately from write delegates; no activation inferred.

## REFERENCES

- [Pinned source tree](https://github.com/skytuhua-org/Gen-V1/tree/9ddd536cc84c0f327ddf6133d485f8ab8baf294b); [AGENTS.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/AGENTS.md); [CONTRIBUTING.md](https://github.com/skytuhua-org/Gen-V1/blob/9ddd536cc84c0f327ddf6133d485f8ab8baf294b/CONTRIBUTING.md).
- [Canonical audit #1992](https://github.com/skytuhua-org/Gen-V1/issues/1992); [audit checkpoint](https://github.com/skytuhua-org/Gen-V1/issues/1992#issuecomment-7121928309).
- Original supplied v6: M07 archive lines 1092–1130, M08 1131–1172, M09 1173–1214; global rules 1–132. Relevant substantive clauses are reproduced in REQUIREMENTS so execution does not depend on private chat.
- Supplied completion followups: common lines 1397–1413 and M08 lines 1470–1477; relevant steps are reproduced above. Global policy: compare base/current source, retain facts, execute only explicit accepted gaps, record precise HOLD inputs, keep unrun phases unrun.
- Supplied research-v3: sections 19–26 and feature rationale M07 F13/F14/F59; M08 F20/F21/F22/F23/F24/F45; M09 F32–F39. These motivate exact edit provenance, independent worktree authority, reversible file recovery, native acknowledgment and evidence-bound progress; they do not override v6 or mandate copying donor implementations.
- Merged source history: [M07 PR335](https://github.com/skytuhua-org/Gen-V1/pull/335), [accepted retirement PR394](https://github.com/skytuhua-org/Gen-V1/pull/394), [M08 PR331](https://github.com/skytuhua-org/Gen-V1/pull/331), [frontend PR336](https://github.com/skytuhua-org/Gen-V1/pull/336), [M09 PR350](https://github.com/skytuhua-org/Gen-V1/pull/350). M07 old dedicated review surface is intentionally retired; acceptance is through a supported current surface only.
