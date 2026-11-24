# M10 → M04 output custody contract (#2014 T02)

Baseline: `origin/main@9ddd536c`. Plan rev `m01-m10-audit-r2-2026-11-23`.
Reproduction evidence: `devin/84d1dd-2014-m10-output-custody` checkpoint 001 on #2014.

## 1. Publication seam

One host-owned seam joins owned command output to canonical M04 custody:

```ts
publishOutput(input: BackgroundOutputPublicationV1) => Promise<ToolResultHandleV1 | null>
```

- `BackgroundOutputPublicationV1` (declared in `packages/contracts/background-work.ts`):
  `workId`, the work's **immutable** `owner` (`threadId`, `workspaceId`, `projectId`,
  `accountBinding`), `effectId`, the **retained window bytes** (`Uint8Array`),
  `startByte` (offset of the first retained byte in original-stream bytes) and
  `omittedBytes`. The coordinator publishes only the bounded trailing window —
  never the whole command history — and passes raw bytes, not decoded text.
- The service-side implementation derives every authority input from Store
  state (`contextResultOwner`/`contextResultInvocation`), never from supplied
  text. It mints `handle = randomUUID()` and writes the canonical
  `ToolResultHandleV1` (`operation: 'read-result-range'`, `mediaType:
  'text/plain'`, `digest = sha256(exact retained bytes)`, `bytes =
  retained.length`, `expiresAtMs`) through `openContextResultCustody`. No
  second disk protocol, no raw path exposure.
- `Service.deliverContextResult` is **not** reused: it returns small values
  inline and requires public/observed lineage for handle admission. The seam
  writes custody directly (`put`), then registers a `contextResultAuthorities`
  proof whose `authorized()` re-checks that the current thread's
  `(workspaceId, projectId, accountId)` binding still equals the record owner.
  No permanently-true authorization callback is installed anywhere.
- Publication is gated on `contextResultsEnabled()` (`context.compilerV1` +
  `tools.deferredV1`) so `context_result_read` can never be offered a handle
  it cannot serve. Authority proofs and records share a 60-minute expiry,
  matching the existing model-access window.

## 2. Two admission contexts (explicit distinction)

| Context | Path | Authorization |
|---|---|---|
| Historical drawer inspection | `GET /api/background/work/:id/output` → `readOutput` | Owner revalidation only (§4). Never requires a live run. |
| Current-run model read | `context_result_read` → `contextResultVault().read` | Unchanged canonical path: UUID schema, `sameOwner` equality, unexpired record, registered authority proof, live-run binding check (`thread.runId` + `working`/`awaiting_input` + invocation prefix bound to the *current* run digest). |

A minted handle is therefore drawer-visible lineage **and** model-readable
only while the mint-time authority is still valid in a live run. A later run
never reads the old handle (its invocation prefix no longer matches); the
host mints a **fresh** handle over retained bytes through the same seam when
a current run is authorized to receive the output. Legacy `bw-result:` rows
keep drawer access only — they are never treated as valid UUID records.

## 3. Cursor unit and versioning decision

**Decision: byte cursors, no legacy adapter retained.** `readOutput`'s
`start`, `cursor` and the `cursor` query parameter become **bytes of the
original stream** (UTF-8 encoded after per-stream decoding — see T03). The
cursor is opaque: the only consumer (`BackgroundWork.tsx` →
`/api/background/work/:id/output`) stores it verbatim and sends it back.
No cursor is persisted, so there is nothing to migrate and no versioned
adapter is kept; the contract documents the unit so a future second
consumer cannot guess wrong. `truncated = cursor < start` is unchanged.

Window semantics: the retained window is bounded in **bytes**
(`outputWindowBytes` = 512 KiB). Trimming advances `startByte` to the next
UTF-8 scalar boundary so the decoded view never begins mid-scalar and no
U+FFFD is invented at the trim edge. `start`/`cursor`/`omittedBytes` are
reported in the same unit.

## 4. Output-read owner revalidation

- **Live session** (process still owned): full `revalidateOwner`
  (runId/epoch, project, accountBinding, authority) → `CAPABILITY_DENIED`
  on `OWNER_REVOKED`/`ACCOUNT_MISMATCH`/`SCOPE_CHANGED`. A run that moved on
  cannot peek at another epoch's in-flight command.
- **Settled/retained output**: owner-identity continuity — thread exists,
  not archived, `accountBinding`/`workspaceId`/`projectId` unchanged →
  `CAPABILITY_DENIED` on mismatch. Run completion alone does not revoke
  history (inspectable history for an authorized current owner).

## 5. Finalization order

Publication happens only after **stream close**, not process `exit`:

1. `exit` records the exit receipt and interim output snapshot (unchanged).
2. `close` (all stdio drained) persists the tail and then invokes the seam
   once: immutable bytes + digest are fixed at that point. Late bytes
   arriving after publication cannot exist — `close` is the last stream
   event — so no published digest can ever lag retained content.
3. `resolveProcessExit` (post-loss reconciliation) mints the handle after
   the same close-flush has already run; if output was already published at
   exit it is not re-minted.
4. A work that ends with `close` never observed publishes nothing: the
   `backgroundOutput` row stays as partial/unknown evidence and `outputRef`
   stays `null` rather than publishing a false "final" digest.

## 6. Compatibility table

| Case | Contract |
|---|---|
| Owner drift (run/epoch on live work) | `readOutput` → `CAPABILITY_DENIED` (§4a); model read → `UNAVAILABLE` via `sameOwner`/prefix. |
| Root/workspace/project replacement | `SCOPE_CHANGED` on live read; `sameOwner` fails on model read (binding encodes workspace+project). |
| Account change | `ACCOUNT_MISMATCH` on live read; settled read denied; model read `UNAVAILABLE`. |
| Expiry | Custody `pruneExpired` collects; authority proof deleted; `context_result_read` → `UNAVAILABLE`. Drawer keeps `backgroundOutput` row. |
| Digest mismatch (tampered bytes) | `vault.read` recomputes `sha256(data)` vs record → `UNAVAILABLE`; custody `read` revalidates file identity/size. |
| Missing bytes | Storage `get` returns undefined or file absent → `UNAVAILABLE`; drawer falls back to `backgroundOutput`/`(no output yet)`. |
| Old `bw-result:` rows | Schema `z.uuid()` + custody `handlePattern` reject → `UNAVAILABLE`; drawer reads legacy `backgroundOutput` row unchanged; rows are **not** rewritten or deleted; a reissue mints only from verified retained bytes under current authority. |
| New run after settle | Old handle `UNAVAILABLE` (prefix/authority); fresh handle minted through the seam under the new run's authority. |
| Pending close | `exited:false`, `close` pending → `outputRef` stays `null`; interim `backgroundOutput` snapshots keep serving the drawer; nothing is published as final. |
| Oversized ranges | `context_result_read` enforces `length ≤ 1 MiB` (`INVALID_RANGE`); total retained ≤ `RESULT_CAP_BYTES`; authority map capped at `MAX_TRACKED_RESULTS`. |

## 7. Rollback

Disabling the seam (flags off, or the publication call disabled) leaves
`outputRef` `null` and keeps every retained receipt (`backgroundOutput`,
`backgroundExitReceipt`, `backgroundResultHandle`) untouched; drawer access
is unchanged and no legacy path is widened.

## 8. T03 handoff surface

`packages/core/background-work.ts`: per-stream streaming `TextDecoder`
(or per-stream byte buffers with ordered merge), byte-bounded window with
scalar-boundary trim, `start`/`cursor` in bytes, close-time single
publication, `readOutput` revalidation per §4, `bw-result:` row retained.
`apps/server/background-routes.ts` and `BackgroundWork.tsx` need no cursor
change (opaque), only doc/types touch-ups if field names change.
