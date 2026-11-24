import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Ephemeral preview proofs for file line attribution (#1654). The secret lives
 * only in this process: a restart or different identity invalidates issued
 * proofs and the client refreshes its preview. Proofs are never logged or
 * persisted and authorize nothing by themselves.
 */
export interface LineAttributionProofInput {
  projectId: string;
  threadId: string | null;
  workspaceId: string | null;
  rootDev: string;
  rootIno: string;
  fileDev: string;
  fileIno: string;
  fileSize: number;
  path: string;
  previewSha256: string;
}

export function mintLineAttributionSecret(): Buffer {
  return randomBytes(32);
}

const proofDigest = (secret: Buffer, input: LineAttributionProofInput) =>
  createHmac('sha256', secret)
    .update(
      JSON.stringify([
        'file-line-attribution',
        input.projectId,
        input.threadId,
        input.workspaceId,
        input.rootDev,
        input.rootIno,
        input.fileDev,
        input.fileIno,
        input.fileSize,
        input.path,
        input.previewSha256,
      ]),
    )
    .digest();

export function mintLineAttributionProof(secret: Buffer, input: LineAttributionProofInput): string {
  return 'v1.' + proofDigest(secret, input).toString('base64url');
}

/** Constant-time comparison after recomputing the proof from the current read. */
export function verifyLineAttributionProof(secret: Buffer, proof: string, input: LineAttributionProofInput): boolean {
  const expected = proofDigest(secret, input);
  const presented = /^v1\.[A-Za-z0-9_-]{43}$/.test(proof) ? Buffer.from(proof.slice(3), 'base64url') : null;
  return presented !== null && presented.length === expected.length && timingSafeEqual(presented, expected);
}

/** Exactly one exact-path `ls-tree --full-tree -z` regular-blob entry, or null. */
export function parseLsTreeEntry(output: string, path: string): { mode: string; oid: string } | null {
  const rows = output.split('\0').filter(Boolean);
  if (rows.length !== 1) return null;
  const match = /^(\d+) blob ([0-9a-f]{40})\t(.+)$/.exec(rows[0]!);
  if (!match || match[3] !== path || (match[1] !== '100644' && match[1] !== '100755')) return null;
  return { mode: match[1], oid: match[2] };
}

export interface LinePorcelainResult {
  sha: string;
  author: string;
  authorTime: number;
  subject: string;
}

/**
 * Parse one `blame --root --line-porcelain -L N,N` group: exactly one header
 * whose final line and group size match the request, followed by one
 * tab-prefixed source record. Returns null on malformed or truncated output.
 */
export function parseLinePorcelain(output: string, line: number): LinePorcelainResult | null {
  const rows = output.split('\n');
  const header = /^([0-9a-f]{40}) (\d+) (\d+) (\d+)$/.exec(rows[0] ?? '');
  if (!header || Number(header[3]) !== line || Number(header[4]) !== 1) return null;
  let author: string | undefined, authorTime: number | undefined, subject: string | undefined;
  let sawSource = false;
  for (const row of rows.slice(1)) {
    if (row.startsWith('\t')) {
      if (sawSource) return null;
      sawSource = true;
      continue;
    }
    const [key, ...rest] = row.split(' ');
    const value = rest.join(' ');
    if (key === 'author') author = value;
    else if (key === 'author-time') authorTime = Number(value);
    else if (key === 'summary') subject = value;
  }
  if (!sawSource || author === undefined || authorTime === undefined || subject === undefined) return null;
  if (!Number.isSafeInteger(authorTime)) return null;
  return { sha: header[1]!, author, authorTime, subject };
}
