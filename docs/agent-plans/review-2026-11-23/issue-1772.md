[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1772.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1772](https://github.com/skytuhua-org/Gen-V1/issues/1772). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

[#1041](https://github.com/skytuhua-org/Gen-V1/issues/1041)'s private ledger batches 002/003 cannot be reconstructed from public summaries. Preserve the frozen 48+25-record requirement and original owner; this connection working is not evidence that the original ledger identity or batch publication succeeded.

## REQUIREMENTS

Publish the original frozen 48-record batch as 002 and the original 25 subsequent records as 003, once each, preserving collection-time statuses and append-only corrections. Keep unconfirmed records intact. Use only an authorized available identity; a successful audit comment from another identity does not verify the original worker's credential. Do not publish private artifact URLs, credentials or invented replacement records.

## REPO_MAP

Durable public ledger: issue #1041 and CHECKPOINT 001 permalink retained below. The private `state.json`, `batch-002.json` and `pending.json` paths are supplied source locations, not artifacts available to this reviewer. The complete public #1041 journal inspected here contains no 002/003 batch publication. Their original bytes and local sequence state are HANDOFF_INCOMPLETE until the original ledger owner recovers them.

## DESIGN

T01 verifies authorized write capability without substituting an unapproved fallback. T02 rereads the full public journal and compares frozen batch IDs/refs to prevent duplicates. T03 posts exactly batch 002 and records the accepted/read-back permalink before mutating local publication state. T04 does the same for the 25 newer records as 003 and trims only confirmed records. T05 resumes the existing cadence after both batches are accounted for. On an API timeout, reread before retry; on failure leave the queue intact. Existing historical records stay historical and corrections go into later checkpoints.

---

Canonical plan file: [`docs/agent-plans/genv1-handoff-2026-11-22/09-ledger-checkpoint-002.md`](https://github.com/skytuhua-org/Gen-V1/blob/d96bca4c/docs/agent-plans/genv1-handoff-2026-11-22/09-ledger-checkpoint-002.md) · plans PR: https://github.com/skytuhua-org/Gen-V1/pull/1763

Filed by Chief of Staff at Xian's request (2026-11-22). The full plan follows; the canonical issue body is authoritative; the linked file is the historical published copy.

---

# Plan 09 — Post ledger checkpoint 002+ to issue #1041

## META
- Repo: skytuhua-org/Gen-V1 · Plan rev: 2 · 2026-11-22
- Issue: https://github.com/skytuhua-org/Gen-V1/issues/1041 (team status
  ledger, created by CoS).
- Status: BLOCKED historically — issue-comment writes failed for the
  configured identity (`Resource not accessible by personal access token`).
  **Rev-2 note:** Xian's `GEN_V1_ORG_GITHUB_TOKEN` is now approved and saved;
  T01 becomes "verify comment write works under the new identity", not a
  blocker.
- State files (memory, mounted on every Chief of Staff session):
  `~/memory/chief_3033f8/files/ledger/{state.json, batch-002.json,
  pending.json}`.

## OBJECTIVE
Publish the queued team-status checkpoints. Last confirmed publication is
CHECKPOINT 001 (`seq 1`, permalink
https://github.com/skytuhua-org/Gen-V1/issues/1041#issuecomment-7027267190).
`batch-002.json` holds the frozen 48-record snapshot intended as seq 2;
`pending.json` holds all 73 records including the 25 collected since.

## EXECUTION_DAG
- T01 — verify comment write works under `GEN_V1_ORG_GITHUB_TOKEN`: post (or
  dry-run) a single small comment on #1041. If it still 403s, stop and report
  — never fall back to the other org tokens.
- T02 — dedupe: re-read #1041's comments and verify no checkpoint 002 was
  already posted by another route (`state.json` says seq 2 never posted).
- T03 — post CHECKPOINT 002: `seq=2`, `PREV=` the 001 permalink, records from
  `batch-002.json` in AGENTS.md compact wire format (per record: `from, utc,
  ref, st, br, tests, next`). On success, capture the permalink into
  `state.json` (`seq: 2`, `per_issue.1041.seq`) and mark batch-002 published.
- T04 — post the 25 newer `pending.json` records as CHECKPOINT 003 (same
  batch format), update state, then trim `pending.json` to
  confirmed-published refs / reset for the next sync window.
- T05 — resume normal cadence: one batched checkpoint per team sync (09:13,
  13:13, 17:13).

## VALIDATION
- Re-read each posted comment; permalinks stored in `state.json`.
- Done-when: #1041 shows checkpoints 002 (and 003) with permalinks recorded
  locally. If writes still fail, keep the pending queue intact and report —
  never drop unpublished records.

## Historical STATE / RISKS
- Some `batch-002.json` records are stale (e.g. #953/#959 have since merged,
  #788 closed) — mark records with their recorded status at collection time;
  corrections belong in the next checkpoint, not edits to history.

## REFERENCES
- Issue #1041, CHECKPOINT 001 permalink, `files/ledger/` JSON state,
  AGENTS.md wire format.

## NEXT
Chief of Staff, on the next sync after comment permission is confirmed.
