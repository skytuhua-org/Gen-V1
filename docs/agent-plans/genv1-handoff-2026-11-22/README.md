# GenV1 work handoff — 2026-11-22 (revision 2, detailed)

Plans for every open work thread, one file each, so any agent can pick up a
thread without prior chat context. Filed by Chief of Staff child session
`devin-e08f941fc9094b26b6e0ebf96929c9a7` at Xian's request ("read the agent.md
file on main … create issues for all your work in very detail. Provide detailed
plan files for other agent to continue. after that STOP all work"). Revision 1
of these files was written by `devin-078a9222d41d4789aa019d69d8806864`; Xian
found them not detailed enough, so rev 2 expands each to the full AGENTS.md
plan contract and verifies live GitHub state on 2026-11-22 ~16:20 PST.

Baseline: `main@36fcc56d24cef7558059264a8540d7f0592d93cd` (HEAD of origin/main;
8 required CI checks were PENDING on it at verification time: `guard`,
`Windows checks`, `Tests (shard 1/4)`–`Tests (shard 4/4)`, `Browser tests`,
`Installed desktop memory retention and opt-in`).

## Global constraints (apply to every plan)

- **Credentials:** writes go through `GEN_V1_ORG_GITHUB_TOKEN` (Xian's org
  token, approved by him for this work on 2026-11-22). Never use
  `GEN_V1_GITHUB_PAT`, `GEN_V1_GITHUB_TOKEN`, or the shared `GITHUB_TOKEN`
  secret — Security found the earlier fallback pushes to PR #896/#967 were
  unauthorized and they stay held pending attribution (INBOX-10/11).
- **Never put private bundle URLs or tokens in public issues/comments.** The
  `https://app.devin.ai/attachments/...` bundle links below are auth-gated and
  must appear only inside these repo plan files and internal notes, never in
  issue bodies. Issue bodies reference plan files by path and by SHA-pinned
  blob URL only.
- **Merge gate (Xian-approved auto-merge, rules v1.3):** Reviewer CLEAN +
  required CI green on the exact head + main not red + no open blocking
  comments; Security CLEAN additionally for auth/secrets/plugin-isolation
  changes. Releases, publishing, credential changes and destructive actions
  still need Xian or his delegate (Chief of Staff for the 0.6.5 release call).
- **AGENTS.md applies to Chief of Staff and its children only.** Other GenV1
  Bots work under R1–R13; CoS posts the batched GitHub checkpoints at each
  team sync (issue #1041). If you are a non-CoS agent, still honor the plan's
  task IDs and done-when criteria.
- **Private fix bundles** (the only copies of some commits) are indexed in
  `~/memory/chief_3033f8/files/ledger/private-artifacts.json` on the Chief of
  Staff memory drive. A non-CoS worker cannot reach that drive: ask Chief of
  Staff (bot `bot-6c4c2beb373e4fd3ae62c88478da394a`) for the bundle you need.
- Team state ledger: issue #1041; pending queue
  `files/ledger/pending.json` (73 records, 25 unpublished).
- GitHub API quota is shared by all GenV1 Bots: batch reads, no polling loops.

## Plans

| File | Thread | Live state 2026-11-22 | Owner (lane) |
|---|---|---|---|
| [01-ui-repair-pr896.md](01-ui-repair-pr896.md) | Resume & land PR #896 UI acceptance repair | open, mergeable, head `824ca2aa`; held | Gen Frontend |
| [02-split-view-pr967.md](02-split-view-pr967.md) | Resume & land PR #967 split view | open, mergeable, stacked on #896 | Gen Frontend |
| [03-entitlement-rebase-pr970.md](03-entitlement-rebase-pr970.md) | Rebase & land PR #970 Copilot probe | open, MERGE CONFLICT, stacked on #948 | Gen Runtime |
| [04-entitlement-probe-pr948.md](04-entitlement-probe-pr948.md) | Land PR #948 Kimi probe (receipt shard flake) | open, mergeable | Gen Runtime |
| [05-stale-draft-pr641.md](05-stale-draft-pr641.md) | Reconcile stale draft PR #641 | open draft, mergeable, now 1-line diff | Gen Runtime → PM |
| [06-merge-queue.md](06-merge-queue.md) | Merge queue: #951 #1732 #1733 #1738 #1739 + #972 follow-up | all open, mergeable | owning lanes |
| [07-sse-race-1227.md](07-sse-race-1227.md) | SSE shutdown race #1227 / PR #1228 | open, mergeable, `fix/m01-sse-shutdown-c47e12` | Gen Runtime |
| [08-release-065.md](08-release-065.md) | 0.6.5 unsigned preview | blocked on main green | Chief of Staff / REL |
| [09-ledger-checkpoint-002.md](09-ledger-checkpoint-002.md) | Post ledger checkpoint 002+ to #1041 | comment writes were 403; retest under new token | Chief of Staff |
| [10-roadmap4-freeze.md](10-roadmap4-freeze.md) | roadmap#4 freeze candidate evidence | run 44962242934 evidence pending | Gen Runtime |

## Order of operations

1. **#1228 (SSE race) lands first** — it is the top main-green blocker (plan 07).
2. **Runtime chain:** land #948 → verify/push the prepared #970 rebase → land
   #970 (plans 04 → 03). Both need SEC CLEAN (auth-probe code).
3. **FE chain:** confirm the FE write grant → #896 (+missing regression test)
   → restack #967 on the exact merged #896 head, push fix `22c5eeae` (plans
   01 → 02). The write-grant blocker itself is INBOX-10/11 with Xian.
4. **Release track (plan 08):** first verified green main → internal baseline
   (without #896/#967 — authorized) → merge queue drains (plan 06) → #896/#967
   land → RC candidate → installed v0.6.1 upgrade test → unsigned preview
   publish (delegated call by Chief of Staff).
5. **Independent anytime:** #641 reconcile (plan 05), #1041 checkpoint backlog
   (plan 09), roadmap#4 evidence (plan 10), #972 contrast follow-up (plan 06 T04).

## Housekeeping for the filing session

- Push this branch, open one docs PR, and file one GitHub issue per plan
  (01–10) with the full plan in the issue body per AGENTS.md's publish
  contract. Link the PR and each issue cross-wise.
- After the issues exist: STOP. Do not start implementation work.
