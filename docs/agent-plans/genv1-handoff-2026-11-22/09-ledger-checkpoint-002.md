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

## STATE / RISKS
- Some `batch-002.json` records are stale (e.g. #953/#959 have since merged,
  #788 closed) — mark records with their recorded status at collection time;
  corrections belong in the next checkpoint, not edits to history.

## REFERENCES
- Issue #1041, CHECKPOINT 001 permalink, `files/ledger/` JSON state,
  AGENTS.md wire format.

## NEXT
Chief of Staff, on the next sync after comment permission is confirmed.
