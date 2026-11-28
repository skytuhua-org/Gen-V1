import { randomUUID } from 'node:crypto';
import { HarnessError } from '../contracts/index.ts';
import { secretRefV1Schema, type SecretDestinationV1, type SecretRefV1 } from '../contracts/execution-profile.ts';

/** SecretRefV1 custody. A reference exposes only its opaque id, purpose, owner
 * and permitted destination. Resolution happens inside the authorized executor
 * after a single-use, destination-bound, expiring approval. Secret values,
 * raw environment dumps and low-entropy secret hashes never enter model
 * context or public journals; resolvers are host-side only. */

export type SecretResolver = () => string | Promise<string>;
export interface SecretApproval {
  nonce: string;
  refId: string;
  destination: SecretDestinationV1;
  expiresAt: number;
  actor: string | null;
}
export interface SecretResolution {
  env?: Record<string, string>;
  headers?: Record<string, string>;
}
export interface SecretRefMetadata {
  refId: string;
  purpose: string;
  owner: string;
  destination: SecretDestinationV1;
  revoked: boolean;
}

interface Entry { ref: SecretRefV1; resolver: SecretResolver; revoked: boolean }
interface IssuedApproval extends SecretApproval { consumed: boolean }

const MAX_SECRET_BYTES = 8192;
const DEFAULT_APPROVAL_TTL_MS = 60_000;
const MAX_APPROVAL_TTL_MS = 300_000;

function sameDestination(a: SecretDestinationV1, b: SecretDestinationV1): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'process-env' && b.kind === 'process-env') return a.executableSha256 === b.executableSha256 && a.envName === b.envName;
  if (a.kind === 'http-header' && b.kind === 'http-header') return a.origin === b.origin && a.header === b.header;
  return false;
}
const denied = (code: string, message: string) => new HarnessError(code, message);

export class SecretReferenceLedger {
  private readonly entries = new Map<string, Entry>();
  private readonly approvals = new Map<string, IssuedApproval>();
  constructor(private readonly now: () => number = Date.now) {}

  /** Register metadata plus a host-side resolver. The resolver is invoked only
   * inside resolve(), after approval, and its value is never stored here. */
  register(ref: SecretRefV1, resolver: SecretResolver): void {
    const parsed = secretRefV1Schema.parse(ref);
    if (this.entries.has(parsed.refId)) throw denied('SECRET_REF_CONFLICT', 'A secret reference with this id is already registered.');
    if (typeof resolver !== 'function') throw denied('INVALID_INPUT', 'A secret reference requires a host-side resolver.');
    this.entries.set(parsed.refId, { ref: parsed, resolver, revoked: false });
  }

  /** Metadata only — never values, resolvers or digests of values. */
  list(): SecretRefMetadata[] {
    return [...this.entries.values()].map(entry => ({
      refId: entry.ref.refId, purpose: entry.ref.purpose, owner: entry.ref.owner,
      destination: structuredClone(entry.ref.destination), revoked: entry.revoked,
    }));
  }

  /** Issue a single-use approval bound to the exact permitted destination. */
  approve(refId: string, destination: SecretDestinationV1, options?: { ttlMs?: number; actor?: string }): SecretApproval {
    const entry = this.entries.get(refId);
    if (!entry) throw denied('SECRET_REF_UNKNOWN', 'The secret reference is not registered.');
    if (entry.revoked) throw denied('SECRET_REF_REVOKED', 'The secret reference was revoked.');
    const requested = secretRefV1Schema.shape.destination.parse(destination);
    if (!sameDestination(requested, entry.ref.destination)) {
      throw denied('SECRET_REF_DESTINATION', 'Secret resolution requires the exact permitted destination.');
    }
    const requestedTtl = options?.ttlMs ?? DEFAULT_APPROVAL_TTL_MS;
    if (!Number.isSafeInteger(requestedTtl)) throw denied('INVALID_INPUT', 'Secret approval TTL must be a finite safe integer.');
    const ttl = Math.min(Math.max(requestedTtl, 1), MAX_APPROVAL_TTL_MS);
    const approval: IssuedApproval = {
      nonce: randomUUID(), refId, destination: structuredClone(entry.ref.destination),
      expiresAt: this.now() + ttl, actor: options?.actor ?? null, consumed: false,
    };
    this.approvals.set(approval.nonce, approval);
    const { consumed: _consumed, ...publicApproval } = approval;
    return publicApproval;
  }

  /** Resolve for the smallest authorized destination only, inside the executor.
   * The approval is single-use, expiring and bound to refId + exact destination. */
  async resolve(refId: string, destination: SecretDestinationV1, approval?: SecretApproval): Promise<SecretResolution> {
    const entry = this.entries.get(refId);
    if (!entry) throw denied('SECRET_REF_UNKNOWN', 'The secret reference is not registered.');
    if (entry.revoked) throw denied('SECRET_REF_REVOKED', 'The secret reference was revoked.');
    const requested = secretRefV1Schema.shape.destination.parse(destination);
    const issued = approval ? this.approvals.get(approval.nonce) : undefined;
    if (!approval || !issued || issued.consumed) throw denied('SECRET_REF_APPROVAL', 'Secret resolution requires a current approval.');
    if (issued.expiresAt <= this.now()) throw denied('SECRET_REF_APPROVAL', 'The secret approval expired.');
    if (issued.refId !== refId || !sameDestination(issued.destination, entry.ref.destination) || !sameDestination(requested, entry.ref.destination)) {
      throw denied('SECRET_REF_DESTINATION', 'Secret resolution requires the exact permitted destination.');
    }
    issued.consumed = true;
    const value = await entry.resolver();
    // The host can revoke the reference, or the approval can expire, while
    // asynchronous credential lookup is pending. No value has been delivered
    // yet, so recheck before releasing it to the authorized destination.
    if (entry.revoked) throw denied('SECRET_REF_REVOKED', 'The secret reference was revoked.');
    if (issued.expiresAt <= this.now()) throw denied('SECRET_REF_APPROVAL', 'The secret approval expired.');
    if (typeof value !== 'string' || !value || Buffer.byteLength(value, 'utf8') > MAX_SECRET_BYTES || value.includes('\0')) {
      throw denied('SECRET_REF_INVALID', 'The secret resolver returned an invalid value.');
    }
    if (entry.ref.destination.kind === 'process-env') {
      return Object.freeze({ env: Object.freeze({ [entry.ref.destination.envName]: value }) });
    }
    return Object.freeze({ headers: Object.freeze({ [entry.ref.destination.header]: value }) });
  }

  /** Revocation prevents subsequent use. Values already delivered to an
   * external destination cannot be retroactively undisclosed. */
  revoke(refId: string): boolean {
    const entry = this.entries.get(refId);
    if (!entry || entry.revoked) return false;
    entry.revoked = true;
    for (const approval of this.approvals.values()) if (approval.refId === refId) approval.consumed = true;
    return true;
  }
}

/** Children start from an explicit environment allowlist, never a copy of
 * process.env. Injected secrets appear only under their approved names. */
export function buildChildEnvironment(
  base: Readonly<Record<string, string | undefined>>,
  allowlist: readonly string[],
  injections: readonly { name: string; value: string }[] = [],
): Record<string, string> {
  const env: Record<string, string> = {};
  for (const name of allowlist) {
    const value = base[name];
    if (typeof value === 'string') env[name] = value;
  }
  for (const injection of injections) env[injection.name] = injection.value;
  return env;
}

/* ------------------------------------------------------------------ */
/* Structured redaction. Best-effort, declared-scope only: it covers   */
/* registered known values (raw, JSON-escaped, percent/base64 encoded,  */
/* ANSI-split, multiline) plus explicitly declared secret field names.  */
/* It is not a universal scrubber and never claims to be.               */
/* ------------------------------------------------------------------ */

export const MIN_TRACKED_SECRET_LENGTH = 8;
const REDACTED = '[REDACTED]';
const ANSI_PATTERN = /\x1b\[[0-9;?]*[ -/]*[@-~]|\x1b[\]P^X_][\s\S]*?(?:\x07|\x1b\\)|\x1b[\]P^X_]|\x1b[()#][0-9A-Za-z]|\x1b[=>78cDEM]|[\x80-\x9f]/g;

export interface SecretRedactor {
  redact(text: string): { text: string; redactions: number };
  redactTruncatedSuffix(text: string): { text: string; redactions: number };
  containsTracked(text: string): boolean;
  readonly tracked: number;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wrapBase64 = (value: string, width: number) => value.replace(new RegExp(`(.{${width}})`, 'g'), '$1\n');
const jsonKeyPattern = (field: string) => [...field].map(ch => {
  const hex = ch.codePointAt(0)!.toString(16).padStart(4, '0');
  return `(?:${escapeRegExp(ch)}|\\u${hex})`;
}).join('');
const percentInsensitiveMatcher = (variant: string) => {
  let source = '';
  for (let index = 0; index < variant.length; index++) {
    const hex = /^[0-9a-fA-F]{2}$/.test(variant.slice(index + 1, index + 3));
    if (variant[index] === '%' && hex) {
      source += '%';
      for (const ch of variant.slice(index + 1, index + 3))
        source += /[a-fA-F]/.test(ch) ? `[${ch.toLowerCase()}${ch.toUpperCase()}]` : ch;
      index += 2;
    } else source += escapeRegExp(variant[index]!);
  }
  return new RegExp(source, 'g');
};

export function createSecretRedactor(secrets: Iterable<string>, options?: { fields?: readonly string[]; structuredText?: boolean }): SecretRedactor {
  const variants = new Set<string>();
  for (const secret of secrets) {
    if (typeof secret !== 'string' || secret.length < MIN_TRACKED_SECRET_LENGTH) continue;
    const percent = encodeURIComponent(secret);
    const base64 = Buffer.from(secret, 'utf8').toString('base64');
    variants.add(secret);
    variants.add(JSON.stringify(secret).slice(1, -1));
    variants.add(percent);
    variants.add(percent.replace(/%20/g, '+'));
    variants.add(base64);
    variants.add(wrapBase64(base64, 64));
    variants.add(wrapBase64(base64, 76));
    variants.add(base64.replace(/\+/g, '-').replace(/\//g, '_'));
    variants.add(base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''));
  }
  const variantMatchers = [...variants].filter(Boolean).map(variant => ({ variant, pattern: percentInsensitiveMatcher(variant) }));
  // Match complete JSON string values, including escaped quotes and backslashes.
  // Key characters may themselves be validly JSON-escaped as \u00xx.
  const fieldPatterns = (options?.fields ?? []).map(field =>
    new RegExp(`("${jsonKeyPattern(field)}"\\s*:\\s*")((?:\\\\.|[^"\\\\])*)(")`, 'g'));
  const structuredFieldPatterns = options?.structuredText ? (options?.fields ?? []).map(field =>
    new RegExp(`(^|[^A-Za-z0-9_])(["']?${jsonKeyPattern(field)}["']?\\s*[:=]\\s*)(?:"((?:\\\\.|[^"\\\\])*)"|'((?:\\\\.|[^'\\\\])*)'|([^\\s]+))`, 'gi')) : [];
  const bearerPattern = options?.structuredText ? /\b(Bearer\s+)([^\s"',;\]}]{8,})/gi : null;
  // An unquoted Authorization header is credential-bearing as a whole: its
  // scheme does not end at the first whitespace. Quoted/JSON forms remain
  // covered by the structured field matcher so their syntax is not consumed.
  const authorizationHeaderPattern = options?.structuredText ? /\b(authorization[ \t]*:[ \t]*)(?!["'])([^\r\n]+)/gi : null;
  const credentialUrlPattern = options?.structuredText ? /\b([a-z][a-z0-9+.-]*:\/\/[^\s/?#@:]*:)([^\s@/?#]+)(?=@)/gi : null;
  const privateKeyPattern = options?.structuredText ? /-----BEGIN [A-Z0-9 ]{0,32}PRIVATE KEY(?: BLOCK)?-----[\s\S]*?(?:-----END [A-Z0-9 ]{0,32}PRIVATE KEY(?: BLOCK)?-----|$)/gi : null;

  function normalizedView(text: string): { cleanText: string; origin: number[] } {
    const clean: string[] = [];
    const origin: number[] = [];
    let cursor = 0;
    for (const match of text.matchAll(ANSI_PATTERN)) {
      const index = match.index ?? 0;
      for (let i = cursor; i < index; i++) { clean.push(text[i]!); origin.push(i); }
      cursor = index + match[0].length;
    }
    for (let i = cursor; i < text.length; i++) { clean.push(text[i]!); origin.push(i); }
    return { cleanText: clean.join(''), origin };
  }

  function redact(text: string): { text: string; redactions: number } {
    // Match on an ANSI-stripped view so escape-split secrets still redact,
    // then map every match range back onto the original text.
    const { cleanText, origin } = normalizedView(text);

    const ranges: [number, number][] = [];
    for (const { pattern } of variantMatchers) {
      pattern.lastIndex = 0;
      for (const match of cleanText.matchAll(pattern)) ranges.push([match.index, match.index + match[0].length]);
    }
    for (const pattern of fieldPatterns) {
      pattern.lastIndex = 0;
      for (const match of cleanText.matchAll(pattern)) {
        const start = match.index + match[1]!.length;
        ranges.push([start, start + match[2]!.length]);
      }
    }
    for (const pattern of structuredFieldPatterns) {
      pattern.lastIndex = 0;
      for (const match of cleanText.matchAll(pattern)) {
        const value = match[3] ?? match[4] ?? match[5] ?? '';
        const quoted = match[3] !== undefined || match[4] !== undefined ? 1 : 0;
        const start = match.index + match[1]!.length + match[2]!.length + quoted;
        ranges.push([start, start + value.length]);
      }
    }
    for (const pattern of [bearerPattern, authorizationHeaderPattern, credentialUrlPattern]) {
      if (!pattern) continue;
      pattern.lastIndex = 0;
      for (const match of cleanText.matchAll(pattern)) {
        const start = match.index + match[1]!.length;
        ranges.push([start, start + match[2]!.length]);
      }
    }
    if (privateKeyPattern) {
      privateKeyPattern.lastIndex = 0;
      for (const match of cleanText.matchAll(privateKeyPattern)) {
        ranges.push([match.index, match.index + match[0].length]);
      }
    }
    ranges.sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [];
    for (const [start, end] of ranges) {
      const last = merged[merged.length - 1];
      if (last && start <= last[1]) last[1] = Math.max(last[1], end);
      else merged.push([start, end]);
    }
    if (!merged.length) return { text, redactions: 0 };
    let out = '', at = 0, redactions = 0;
    for (const [start, end] of merged) {
      const from = origin[start] ?? text.length;
      const to = (origin[end - 1] ?? text.length - 1) + 1;
      out += text.slice(at, from) + REDACTED;
      at = to; redactions++;
    }
    return { text: out + text.slice(at), redactions };
  }

  function redactTruncatedSuffix(text: string): { text: string; redactions: number } {
    const { cleanText, origin } = normalizedView(text);
    let bestStart = -1, bestLength = 0;
    for (const variant of variants) {
      if (!variant) continue;
      for (let length = Math.min(variant.length - 1, cleanText.length); length > 0; length--) {
        if (!cleanText.endsWith(variant.slice(0, length))) continue;
        const start = cleanText.length - length;
        if (bestStart === -1 || start < bestStart || (start === bestStart && length > bestLength)) {
          bestStart = start; bestLength = length;
        }
        break;
      }
    }
    if (bestStart === -1) return { text, redactions: 0 };
    const from = origin[bestStart] ?? text.length;
    return { text: text.slice(0, from) + REDACTED, redactions: 1 };
  }

  function containsTracked(text: string): boolean {
    const { cleanText } = normalizedView(text);
    for (const { pattern } of variantMatchers) {
      pattern.lastIndex = 0;
      if (pattern.test(cleanText)) return true;
    }
    return false;
  }

  return Object.freeze({ redact, redactTruncatedSuffix, containsTracked, tracked: variants.size });
}
