import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { diff as diffLines } from "node:util";
import { z } from "zod";
import { HarnessError } from "../contracts/index.ts";
import type { Store } from "../storage/store.ts";
import {
  checkpointScopeSchema,
  editReceiptV1Schema,
  type CheckpointScope,
  type EditReceiptV1,
} from "../contracts/workspace-checkpoints.ts";

// M08 provenance journal. Receipts are append-only Store entities written from
// synchronous Store.internal callbacks — the host stays the sole SQLite writer
// and no receipt writer ever awaits inside a projection callback. A structured
// (approved) edit records a prepared marker before the write and the proven
// receipt only after the write is confirmed; a shell window proves nothing
// about which agent authored a line, so unattributed writes are recorded as
// process-window evidence instead of guessing an author. Two agents editing
// the same path keep independent receipts — the journal never merges them.

const EDIT_JOURNAL_KIND = "workspaceEditReceipt" as const;
const EDIT_JOURNAL_PREPARED_KIND = "workspaceEditPrepared" as const;

export const sha256hex = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");
const splitLines = (bytes: Buffer) => {
  const lines = bytes.toString("utf8").split(/\r?\n/);
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
  return lines;
};

/** Bounded line diff: shared prefix/suffix trimmed before the Myers walk so
 *  a small edit inside a large file costs the middle only, and a middle whose
 *  size product exceeds the bound returns null — the caller treats that as
 *  coverage loss rather than allocating an O(n·m) trace buffer. `delta`
 *  entries carry positions offset by the shared prefix. */
const boundedLineDiff = (before: string[], after: string[]): { delta: [number, string][]; prefix: number; suffix: number } | null => {
  let prefix = 0;
  const min = Math.min(before.length, after.length);
  while (prefix < min && before[prefix] === after[prefix]) prefix++;
  let suffix = 0;
  while (suffix < min - prefix && before[before.length - 1 - suffix] === after[after.length - 1 - suffix]) suffix++;
  const midBefore = before.slice(prefix, before.length - suffix), midAfter = after.slice(prefix, after.length - suffix);
  if (midBefore.length * midAfter.length > 4_000_000) return null;
  if (midBefore.length === 0 && midAfter.length === 0) return { delta: [], prefix, suffix }; // util.diff throws on two empty inputs
  return { delta: diffLines(midBefore, midAfter) as [number, string][], prefix, suffix };
};

interface StoredReceipt extends EditReceiptV1 {
  journalId: string;
}

interface PreparedEdit {
  version: 1;
  invocationId: string;
  owner: CheckpointScope;
  repositoryId: string;
  path: string;
  beforeDigest: string | null;
  createdAt: string;
}

const ownerParse = (owner: CheckpointScope) => checkpointScopeSchema.parse(owner);

/** Stable scope binding: digests the exact worktree/family identity a receipt names. */
export function checkpointScope(input: {
  projectId: string;
  threadId: string | null;
  workingCopyId: string | null;
  binding: unknown;
}): CheckpointScope {
  const scope = {
    projectId: input.projectId,
    threadId: input.threadId,
    workingCopyId: input.workingCopyId,
    binding: sha256hex(JSON.stringify(input.binding)),
  };
  return checkpointScopeSchema.parse(scope);
}

/** Host-computed checkpoint owner for a thread's managed binding. Routes and
 *  the operation pipeline must agree on the digested binding material. */
export function workspaceOwnerScope(
  projectId: string,
  threadId: string | undefined,
  workspace: { id: string; path: string; gitDirectory?: string | null; identity?: unknown } | undefined,
): CheckpointScope {
  return checkpointScope({
    projectId,
    threadId: threadId ?? null,
    workingCopyId: workspace?.id ?? null,
    binding: {
      path: workspace?.path ?? null,
      workingCopyId: workspace?.id ?? null,
      gitDirectory: workspace?.gitDirectory ?? null,
      identity: workspace?.identity ?? null,
    },
  });
}

const preparedSchema = z.strictObject({
  version: z.literal(1),
  invocationId: z.string().min(1).max(200),
  owner: checkpointScopeSchema,
  repositoryId: z.string().min(1).max(200),
  path: z.string().min(1).max(1024),
  beforeDigest: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
  createdAt: z.iso.datetime(),
});

const sameScope = (a: CheckpointScope, b: CheckpointScope) =>
  a.projectId === b.projectId && a.threadId === b.threadId && a.workingCopyId === b.workingCopyId && a.binding === b.binding;

export class EditJournal {
  constructor(private readonly store: Store) {}

  private get blobRoot() {
    return join(this.store.dataDir, "journal-blobs");
  }

  /** Persist bounded pre/post image bytes under content-addressed custody.
   *  Receipts reference them through boundedBlobRefs; a digest-equal ref is
   *  idempotent. */
  writeBlob(data: Buffer): string {
    const ref = sha256hex(data);
    mkdirSync(this.blobRoot, { recursive: true });
    const target = join(this.blobRoot, ref);
    try {
      writeFileSync(target, data, { flag: "wx", mode: 0o600 });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      if (!readFileSync(target).equals(data)) throw error;
    }
    return ref;
  }

  /** Fetch a stored blob by ref (its sha256), verifying content on read. */
  readBlob(ref: string): Buffer | null {
    try {
      const bytes = readFileSync(join(this.blobRoot, ref));
      return sha256hex(bytes) === ref ? bytes : null;
    } catch {
      return null;
    }
  }

  /** A prepared marker survives a crash between admission and the confirmed write. */
  prepareStructuredEdit(input: {
    invocationId: string;
    owner: CheckpointScope;
    repositoryId: string;
    path: string;
    beforeDigest: string | null;
  }): PreparedEdit {
    const prepared: PreparedEdit = preparedSchema.parse({
      version: 1,
      invocationId: input.invocationId,
      owner: ownerParse(input.owner),
      repositoryId: input.repositoryId,
      path: input.path,
      beforeDigest: input.beforeDigest,
      createdAt: new Date().toISOString(),
    });
    this.store.internal("workspace.edit.prepare", input.owner.threadId, () => {
      this.store.put(EDIT_JOURNAL_PREPARED_KIND, prepared.invocationId + "|" + prepared.path, prepared.owner.threadId, prepared);
    });
    return prepared;
  }

  /** Append after a confirmed write. before/after bytes are captured only through approved file access upstream. */
  recordProvenEdit(input: {
    invocationId: string;
    owner: CheckpointScope;
    workspaceIdentity: string;
    repositoryId: string;
    path: string;
    beforeIdentity: { dev: string; ino: string } | null;
    beforeDigest: string | null;
    afterDigest: string;
    boundedBlobRefs?: EditReceiptV1["boundedBlobRefs"];
  }): EditReceiptV1 {
    const receipt = this.append({
      version: 1,
      invocationId: input.invocationId,
      owner: ownerParse(input.owner),
      workspaceIdentity: input.workspaceIdentity,
      repositoryId: input.repositoryId,
      path: input.path,
      beforeIdentity: input.beforeIdentity,
      beforeDigest: input.beforeDigest,
      afterDigest: input.afterDigest,
      boundedBlobRefs: input.boundedBlobRefs ?? [],
      attribution: "STRUCTURED_EDIT_PROVED",
      createdAt: new Date().toISOString(),
    });
    this.store.internal("workspace.edit.prepared.consumed", input.owner.threadId, () => {
      const marker = this.store.get<PreparedEdit>(EDIT_JOURNAL_PREPARED_KIND, input.invocationId + "|" + input.path);
      if (marker && marker.invocationId === input.invocationId && marker.path === input.path)
        this.store.put(EDIT_JOURNAL_PREPARED_KIND, marker.invocationId + "|" + marker.path, marker.owner.threadId, { ...marker, consumed: receipt });
    });
    return receipt;
  }

  /** A process window observed a change without an attributable structured edit. */
  recordProcessWindow(input: {
    invocationId: string;
    owner: CheckpointScope;
    workspaceIdentity: string;
    repositoryId: string;
    path: string;
    beforeDigest?: string | null;
    afterDigest?: string | null;
  }): EditReceiptV1 {
    return this.append({
      version: 1,
      invocationId: input.invocationId,
      owner: ownerParse(input.owner),
      workspaceIdentity: input.workspaceIdentity,
      repositoryId: input.repositoryId,
      path: input.path,
      beforeIdentity: null,
      beforeDigest: input.beforeDigest ?? null,
      afterDigest: input.afterDigest ?? null,
      boundedBlobRefs: [],
      attribution: "PROCESS_WINDOW_ONLY",
      createdAt: new Date().toISOString(),
    });
  }

  recordUnattributed(input: {
    owner: CheckpointScope;
    workspaceIdentity: string;
    repositoryId: string;
    path: string;
    beforeDigest?: string | null;
    afterDigest?: string | null;
  }): EditReceiptV1 {
    return this.append({
      version: 1,
      invocationId: "process:" + randomUUID(),
      owner: ownerParse(input.owner),
      workspaceIdentity: input.workspaceIdentity,
      repositoryId: input.repositoryId,
      path: input.path,
      beforeIdentity: null,
      beforeDigest: input.beforeDigest ?? null,
      afterDigest: input.afterDigest ?? null,
      boundedBlobRefs: [],
      attribution: "UNATTRIBUTED",
      createdAt: new Date().toISOString(),
    });
  }

  private append(receipt: EditReceiptV1): EditReceiptV1 {
    const stored: StoredReceipt = { ...editReceiptV1Schema.parse(receipt), journalId: "receipt-" + randomUUID() };
    this.store.internal("workspace.edit.receipt", receipt.owner.threadId, () => {
      this.store.put(EDIT_JOURNAL_KIND, stored.journalId, stored.owner.threadId, stored);
    });
    const { journalId: _internal, ...external } = stored;
    void _internal;
    return external;
  }

  /** Conflicting receipts from different invocations stay independent and in order. */
  receipts(owner: CheckpointScope, filter?: { path?: string; repositoryId?: string }): StoredReceipt[] {
    const scope = ownerParse(owner);
    return this.store
      .all<StoredReceipt>(EDIT_JOURNAL_KIND)
      .filter(
        (entry) =>
          sameScope(entry.owner, scope) &&
          (!filter?.path || entry.path === filter.path) &&
          (!filter?.repositoryId || entry.repositoryId === filter.repositoryId),
      );
  }

  /** Prepared markers never consumed by a confirmed write are recovery evidence. */
  pendingPrepared(owner: CheckpointScope): PreparedEdit[] {
    const scope = ownerParse(owner);
    return this.store
      .all<PreparedEdit & { consumed?: unknown }>(EDIT_JOURNAL_PREPARED_KIND)
      .filter((entry) => sameScope(entry.owner, scope) && entry.consumed === undefined);
  }

  /** Best-effort attribution of a path for review: the newest receipt decides. */
  attribution(owner: CheckpointScope, path: string): "proven" | "process-window" | "unattributed" {
    const entries = this.receipts(owner, { path });
    if (!entries.length) return "unattributed";
    const last = entries[entries.length - 1];
    if (last.attribution === "STRUCTURED_EDIT_PROVED") return "proven";
    if (last.attribution === "PROCESS_WINDOW_ONLY") return "process-window";
    return "unattributed";
  }

  /** Resolve a receipt's pre/post image bytes: boundedBlobRefs first, then a
   *  blob stored under the bare digest ref, then the live file for an
   *  afterDigest that still matches. */
  private imageFor(receipt: EditReceiptV1, which: "before" | "after", liveBytes: Buffer | null): Buffer | null {
    const digest = which === "before" ? receipt.beforeDigest : receipt.afterDigest;
    for (const ref of receipt.boundedBlobRefs) if (ref.ref === digest) {
      const bytes = this.readBlob(ref.ref);
      if (bytes) return bytes;
    }
    if (digest) {
      const bytes = this.readBlob(digest);
      if (bytes) return bytes;
      if (which === "after" && liveBytes && sha256hex(liveBytes) === digest) return liveBytes;
    }
    return null;
  }

  /** The postimage line numbers (added) and HEAD preimage line numbers
   *  (removed) a receipt's write actually changed. Added positions come from
   *  diffing the receipt's bounded pre/post images; removed positions are
   *  then translated back into HEAD space through the foreign delta
   *  diff(HEAD image, receipt preimage), keyed to their line content so
   *  duplicate lines can be matched by occurrence. `removed` is null when
   *  no HEAD image was supplied or the foreign delta is unbounded — coverage
   *  of any removal is then unverifiable. "wholesale" when the receipt recorded no
   *  preimage at all — it asserts whole-postimage authorship and covers any
   *  hunk of the path. Null when recorded images cannot bound the delta: the
   *  caller must then treat coverage as unverifiable (coverage loss). */
  private coverageOf(receipt: EditReceiptV1, liveBytes: Buffer | null, headBytes: Buffer | null): { added: Set<number>; removed: Map<number, string> | null } | "wholesale" | null {
    const after = this.imageFor(receipt, "after", liveBytes);
    if (!after) return null;
    const before = this.imageFor(receipt, "before", liveBytes);
    if (!before) return receipt.beforeDigest === null ? "wholesale" : null;
    const beforeLines = splitLines(before), afterLines = splitLines(after);
    const own = boundedLineDiff(beforeLines, afterLines);
    if (!own) return null; // delta too large to bound: coverage loss, never a full-trace diff
    const added = new Set<number>(), removedBefore = new Map<number, string>();
    let beforeLine = own.prefix + 1, afterLine = own.prefix + 1;
    for (const [kind, value] of own.delta) {
      if (kind === 1) removedBefore.set(beforeLine++, value);
      else if (kind === -1) added.add(afterLine++);
      else { beforeLine++; afterLine++; }
    }
    // A write that only changes line terminators leaves an empty line delta:
    // credit exactly the lines whose terminator changed, no others.
    if (added.size === 0 && removedBefore.size === 0 && !before.equals(after)) {
      const rawBefore = before.toString("utf8").split(/(?<=\n)/), rawAfter = after.toString("utf8").split(/(?<=\n)/);
      if (rawBefore.length === rawAfter.length)
        for (let i = 0; i < rawBefore.length; i++)
          if (rawBefore[i] !== rawAfter[i]) { removedBefore.set(i + 1, beforeLines[i] ?? ""); added.add(i + 1); }
    }
    if (!headBytes) return { added, removed: null };
    const headLines = splitLines(headBytes);
    const foreign = boundedLineDiff(headLines, beforeLines);
    if (!foreign) return { added, removed: null };
    const removed = new Map<number, string>(), beforeToHead = new Map<number, number>();
    for (let i = 0; i < foreign.prefix; i++) beforeToHead.set(i + 1, i + 1);
    for (let i = 0; i < foreign.suffix; i++)
      beforeToHead.set(beforeLines.length - foreign.suffix + i + 1, headLines.length - foreign.suffix + i + 1);
    let headLine = foreign.prefix + 1;
    beforeLine = foreign.prefix + 1;
    for (const [kind] of foreign.delta) {
      if (kind === 1) headLine++; // foreign-removed: outside the receipt's coverage
      else if (kind === -1) beforeLine++; // foreign-added into the receipt's preimage
      else { beforeToHead.set(beforeLine, headLine); beforeLine++; headLine++; }
    }
    for (const [line, content] of removedBefore) {
      const head = beforeToHead.get(line);
      if (head !== undefined) removed.set(head, content);
    }
    return { added, removed };
  }

  /** A hunk can auto-enter a selective commit only when a proven receipt's
   *  recorded bounded delta covers every line it changes and the live bytes
   *  still equal that receipt's postimage. Receipts are scanned newest-first;
   *  the newest receipt whose delta covers the hunk assigns its class, so a
   *  foreign same-scope receipt downgrades only its own region and a later
   *  foreign write takes precedence over an earlier proof. Regions with no
   *  covering receipt surface coverage loss ("unattributed"), never
   *  inheriting a path-level label. A receipt whose bounded images cannot be
   *  resolved cannot bound a region: proven receipts then prove nothing,
   *  coarser classes stay path-wide conservative. `change` carries the
   *  hunk's removed HEAD-preimage and added postimage line numbers; a null
   *  change is the legacy whole-path check. */
  hunkAttribution(owner: CheckpointScope, path: string, liveBytes: Buffer | null, headBytes: Buffer | null, change: { removed: Map<number, string>; added: Set<number> } | null = null, claims: Map<string, Set<number>> = new Map()): "proven" | "process-window" | "unattributed" {
    const entries = this.receipts(owner, { path });
    if (!entries.length) return "unattributed";
    const classOf = (attribution: string) =>
      attribution === "STRUCTURED_EDIT_PROVED" ? "proven" : attribution === "PROCESS_WINDOW_ONLY" ? "process-window" : "unattributed";
    if (change === null) {
      if (entries.some((entry) => entry.attribution === "UNATTRIBUTED")) return "unattributed";
      if (entries.some((entry) => entry.attribution === "PROCESS_WINDOW_ONLY")) return "process-window";
      const newest = entries[entries.length - 1]!;
      return newest.attribution === "STRUCTURED_EDIT_PROVED" && liveBytes && newest.afterDigest === sha256hex(liveBytes) ? "proven" : "unattributed";
    }
    // Both sides match by position: added lines in postimage space (both
    // sides number the live file), removed lines in HEAD space, translated
    // per receipt through the foreign delta. Covered positions are consumed
    // through the caller's per-file `claims` ledger: a removed line takes its
    // exact mapped position first, then an unclaimed same-content position —
    // diff engines legitimately pick different copies among identical lines,
    // but joint over-claim (a foreign deletion of content the receipt also
    // deleted) can never be credited because every coverage position is
    // consumed at most once.
    const covers = (entry: StoredReceipt, coverage: { added: Set<number>; removed: Map<number, string> | null }) => {
      const claim = (kind: "r" | "a", position: number): boolean => {
        const key = entry.journalId + ":" + kind;
        const claimed = claims.get(key) ?? new Set<number>();
        if (claimed.has(position)) return false;
        claimed.add(position);
        claims.set(key, claimed);
        return true;
      };
      for (const [position, content] of change.removed) {
        if (coverage.removed === null) return false;
        if (coverage.removed.get(position) === content ? claim("r", position)
            : [...coverage.removed].some(([held, heldContent]) => heldContent === content && claim("r", held))) continue;
        return false;
      }
      for (const line of change.added) if (!coverage.added.has(line) || !claim("a", line)) return false;
      return true;
    };
    for (const entry of [...entries].reverse()) {
      const coverage = this.coverageOf(entry, liveBytes, headBytes);
      if (coverage !== null) {
        if (coverage === "wholesale" || covers(entry, coverage)) {
          if (entry.attribution === "STRUCTURED_EDIT_PROVED" && liveBytes && entry.afterDigest === sha256hex(liveBytes)) return "proven";
          return classOf(entry.attribution) === "proven" ? "unattributed" : classOf(entry.attribution);
        }
        continue;
      }
      // Coverage unverifiable: coarser evidence downgrades the whole path;
      // an unverifiable proof proves nothing.
      if (entry.attribution !== "STRUCTURED_EDIT_PROVED") return classOf(entry.attribution);
    }
    return "unattributed";
  }

  requireOwned(owner: CheckpointScope, scope: CheckpointScope): void {
    if (!sameScope(owner, scope)) throw new HarnessError("CAPABILITY_DENIED", "The journal scope does not match the admitted owner.");
  }
}
