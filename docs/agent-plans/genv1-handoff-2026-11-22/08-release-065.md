# Plan 08 — 0.6.5 unsigned preview release

## META
- Repo: skytuhua-org/Gen-V1 · Plan rev: 2 · 2026-11-22
- Baseline: `main@36fcc56d24cef7558059264a8540d7f0592d93cd`
- Status: BLOCKED on first verified green main (all 8 required checks pending
  on `36fcc56d` at verification; #1228 is the known fix in flight).
- Decision authority: Xian delegated the release call to Chief of Staff
  (2026-11-19): CoS picks the date and tells Gen Release to publish once the
  gates pass. Xian chose **unsigned preview** for 0.6.5 — not a signed RC,
  not a public release announcement.
- Release machinery: `.github/workflows/release.yml` — tag push `v*` or
  `workflow_dispatch` on main, `windows-latest` runner, channel
  `stable|prerelease`; `electron-builder@26.18.0` (root package.json).

## OBJECTIVE
Ship the 0.6.5 **unsigned preview** GitHub release: internal baseline first,
then an RC candidate once the held UI fixes land, plus the installed
**v0.6.1 → 0.6.5 upgrade test** on the candidate before publish.

## GATES (all required before publish)
1. First verified green main — currently blocked by #1228 (plan 07).
2. Internal baseline build on that green main — explicitly **without**
   #896/#967 (authorized: baseline is not the RC).
3. #896 and #967 landed (plans 01–02) — required before the RC candidate.
4. RC candidate build including those fixes.
5. Installed v0.6.1 upgrade test on the RC candidate (QA owns evidence).
6. Merge queue drained — #1738 changelog must land so notes are accurate.

## EXECUTION_DAG
- T01 — RT: on first green main, cut the internal baseline and hand evidence
  to PM, QA, REL (same "freeze candidate evidence" flow as plan 10).
- T02 — FE: land #896 then #967 (plans 01–02; blocked on write clearance).
- T03 — RT/REL: build the RC candidate on post-merge main via the release
  workflow (`workflow_dispatch`, channel `prerelease`).
- T04 — QA: run installed-upgrade test v0.6.1 → candidate on the Windows VM;
  attach evidence.
- T05 — CoS: verify all gates → tell REL to publish the unsigned preview,
  dated the publish day.
- T06 — REL: tag, build unsigned artifacts, publish the GitHub release; post
  links.

## VALIDATION
- Baseline + RC artifacts exist; upgrade test PASS recorded with the run log.
- Release notes from #1738 reflect reality (pending-gates section accurate).
- Done-when: unsigned 0.6.5 preview published on GitHub releases.

## STATE / RISKS
- M16 browser/desktop actions and M17 paired clients stay OUT (default-off,
  draft #836) — already decided.
- RT entitlement default kept: "Saved, not verified" for 8 non-OpenAI
  connections in 0.6.5.
- Risk: credential incident keeps #896/#967 blocked → escalate to Xian; do
  not ship an RC claiming those fixes.
- Risk: gate order violations — baseline without UI fixes is authorized; an
  RC without them is not.

## REFERENCES
- Plans 01, 02, 06, 07, 10; issue #1041; `.github/workflows/release.yml`;
  ledger `state/inbox.md` release decisions.

## NEXT
Blocked on plan 07 (main green) and plans 01–02 (write clearance).
