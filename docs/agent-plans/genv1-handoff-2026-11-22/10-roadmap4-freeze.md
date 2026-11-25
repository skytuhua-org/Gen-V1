# Plan 10 — roadmap#4 freeze candidate evidence

## META
- Repo: skytuhua-org/Gen-V1 · Plan rev: 2 · 2026-11-22
- Baseline: `main@36fcc56d24cef7558059264a8540d7f0592d93cd`
- Status: IN_PROGRESS with Gen Runtime; worker resumed after the quota pause.
- Related to plan 08 (this is the internal-baseline step of 0.6.5).

## OBJECTIVE
RT verifies the freeze candidate — the re-cut on `main@8cc970fd` was
reported; the worker was to collect evidence from GitHub Actions run
`44962242934` and hand it to PM, QA, REL. No replacement sessions are to be
spawned for this.

## EXECUTION_DAG
- T01 — RT: check run `44962242934` (and any successor run on current main):
  `gh run view 44962242934 --repo skytuhua-org/Gen-V1`; collect the per-job
  pass/fail matrix. Done-when: run outcome + job list captured.
- T02 — verify the candidate against the freeze criteria (same green-main
  gate as plan 08 T01: #1228 landed, required checks green on the exact
  SHA). Done-when: verdict per gate line.
- T03 — hand the evidence package (run URL, per-job results, candidate SHA)
  to PM, QA and REL in one batched message; CoS records it in the ledger
  queue (`files/ledger/pending.json`).
- T04 — if the run is red or predates needed merges, mark the candidate
  stale and wait for the next green main rather than patching it.

## VALIDATION
- Evidence package exists and names an exact SHA + Actions run URL.
- Done-when: PM/QA/REL have the evidence and the candidate is either
  confirmed as the 0.6.5 baseline input or marked stale.

## STATE / RISKS
- Current main `36fcc56d` postdates `8cc970fd`; if required merges landed
  after `8cc970fd`, expect T04's stale verdict and retarget the next green
  main.

## REFERENCES
- Plan 08 (release gates), run `44962242934`, ledger `pending.json`.

## NEXT
Gen Runtime continues at T01; no new workers.
