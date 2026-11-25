# V3 milestone evidence index

Every `M<NN>-verification.json` and `M<NN>-source-lock.json` in this directory is a
SHA-pinned historical record: it proves the named checks passed on its recorded
`baseSha`, not that they pass on current `main`. File names inside `changedFiles`
and `evidence` fields describe the tree at that SHA and may reference paths that
have since moved or been renamed.

## Path claims verified against current main

Cross-checked 2026-11-24 against `main@9ddd536cc84c0f327ddf6133d485f8ab8baf294b`
(all repository paths named in M03, M05, M08, M09 and M11 verification records):

- M03, M08, M09, M11: every referenced repository path resolves on current main.
- M05: `tests/public-source-package.test.ts` was renamed to
  `tests/public-source.test.ts` (present at least since `f6fba81b`). The
  historical record is preserved unchanged.

## Current qualification

These v3 records remain evidence for their own milestone scopes. Active
qualification state is tracked per milestone under `docs/implementation/v6/` and
in `docs/acceptance.md`; do not read a v3 PASS as a current-main gate.
