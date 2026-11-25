[Current complete Markdown mirror](https://github.com/skytuhua-org/Gen-V1/blob/agent/cleanup-plan-mirrors-r2/docs/agent-plans/review-2026-11-23/issue-1771.md) · [Consolidated publication PR #1994](https://github.com/skytuhua-org/Gen-V1/pull/1994)

## Current execution state

Plan status revision `cleanup-2026-11-23-r2`; reviewed 2026-11-24 against `main@a5f81d8efc5f23d6336c37b2b1eb9115388ed693`. Canonical issue: [#1771](https://github.com/skytuhua-org/Gen-V1/issues/1771). This section supersedes publication-time progress statements below; accepted requirements and acceptance checks remain binding.

The first-green-main blocker is resolved by main run 45318044111, but [#896](https://github.com/skytuhua-org/Gen-V1/pull/896)/#967/#1738 remain open. Internal-baseline artifact, RC candidate, installed v0.6.1 upgrade evidence and authorized unsigned-preview publication remain missing.

### Reviewed implementation references

- [PR #896](https://github.com/skytuhua-org/Gen-V1/pull/896): open; head `ac25284de39ec060a5143e29006ff01511e774ad`; base `main`; not recorded as merged into the audit baseline.
- [PR #967](https://github.com/skytuhua-org/Gen-V1/pull/967): open; head `5d141dfa5e5d6540ca90f06313e9f6f92697d779`; base `repair/ui-acceptance-20261118`; not recorded as merged into the audit baseline.
- [PR #1738](https://github.com/skytuhua-org/Gen-V1/pull/1738): open; head `6a1ce49080563d4d871e4147ee90850a23c9d544`; base `main`; not recorded as merged into the audit baseline.

## REQUIREMENTS

The six existing GATES are binding. Preserve unsigned preview, the authorized internal baseline without the held UI fixes, the requirement to include both UI fixes before RC, the installed v0.6.1 upgrade check, accurate notes and the delegated release decision. The first green-main observation alone authorizes neither a product release nor a claim that the RC exists.

## REPO_MAP

Release automation is `.github/workflows/release.yml`; packaging inputs remain `package.json` and the desktop build scripts. Pending product inputs are #896/#967, notes are #1738, main Browser gate is #1770/#1227, and candidate evidence is #1773. The original release/packaging versions are historical baseline observations and must be refreshed for a candidate. Artifact IDs, installer hashes and upgrade logs are discovery until supplied by the responsible release/QA owner.

## DESIGN AND CURRENT GATES

Gate 1 has an evidenced successful main run [45318044111](https://github.com/skytuhua-org/Gen-V1/actions/runs/45318044111) at `ea561dd4c0c818feb988244896260ad23ad7b340` after #1228, with all seven full-suite required jobs succeeding (selection-only jobs skipped by their conditions). Gate 2 baseline artifact is not established by CI alone. Gates 3/6 remain open because #896/#967/#1738 are open. Gates 4/5 need the exact candidate and installed upgrade evidence. T01 hands an identified baseline to PM/QA/REL; T02 precedes T03; T04 consumes that RC; T05 verifies every gate and the original release authority before T06 publishes. On failure retain the exact candidate evidence and pending gate rather than repurposing an older green run.

---

Canonical plan file: [`docs/agent-plans/genv1-handoff-2026-11-22/08-release-065.md`](https://github.com/skytuhua-org/Gen-V1/blob/d96bca4c/docs/agent-plans/genv1-handoff-2026-11-22/08-release-065.md) · plans PR: https://github.com/skytuhua-org/Gen-V1/pull/1763

Filed by Chief of Staff at Xian's request (2026-11-22). The full plan follows; the canonical issue body is authoritative; the linked file is the historical published copy.

---

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

## Historical STATE / RISKS
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
