import { z } from 'zod';
import { projectSearchPathSchema, projectSearchIdSchema } from './project-search.ts';

/** Read-only contracts. These identifiers do not authorize Git or file writes. */
export const LINE_ATTRIBUTION_LIMITS = {
  previewBytes: 512 * 1024,
  lines: 20_000,
  authorCodePoints: 120,
  subjectCodePoints: 240,
  requestBodyBytes: 8 * 1024,
  porcelainBytes: 1024 * 1024,
  requestMs: 8_000,
} as const;

export const lineAttributionReasonSchema = z.enum([
  'stale',
  'changed',
  'untracked',
  'binary',
  'unsupported_text',
  'empty',
  'preview_limit',
  'history_unavailable',
  'line_unavailable',
  'busy',
  'timeout',
  'unavailable',
]);
export type LineAttributionReason = z.infer<typeof lineAttributionReasonSchema>;

/** In-process HMAC proof: version prefix plus a base64url SHA-256 tag. Never logged or persisted. */
export const lineAttributionProofSchema = z.string().regex(/^v1\.[A-Za-z0-9_-]{43}$/);
const sha256Hex = z.string().regex(/^[a-f0-9]{64}$/);
const sha1Hex = z.string().regex(/^[0-9a-f]{40}$/);

export const lineAttributionRequestSchema = z.strictObject({
  threadId: projectSearchIdSchema.optional(),
  path: projectSearchPathSchema,
  previewSha256: sha256Hex,
  previewProof: lineAttributionProofSchema,
  line: z.number().int().min(1).max(LINE_ATTRIBUTION_LIMITS.lines),
});
export type LineAttributionRequest = z.infer<typeof lineAttributionRequestSchema>;

/** Additive metadata on the existing /file response. */
export const lineAttributionPreviewSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('eligible'),
    previewProof: lineAttributionProofSchema,
    lineCount: z.number().int().min(1).max(LINE_ATTRIBUTION_LIMITS.lines),
  }),
  z.strictObject({ kind: z.literal('unavailable'), reason: lineAttributionReasonSchema }),
]);
export type LineAttributionPreview = z.infer<typeof lineAttributionPreviewSchema>;

const isoUtc = z.string().refine(value => {
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value;
}, 'Use a UTC ISO-8601 instant.');

const commitText = (max: number) =>
  z.string().refine(value => [...value].length >= 1 && [...value].length <= max && !/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/u.test(value), 'Use bounded plain text.');

export const lineAttributionResultSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('attributed'),
    sha: sha1Hex,
    author: commitText(LINE_ATTRIBUTION_LIMITS.authorCodePoints),
    authorDateUtc: isoUtc,
    subject: commitText(LINE_ATTRIBUTION_LIMITS.subjectCodePoints),
  }),
  z.strictObject({ kind: z.literal('unavailable'), reason: lineAttributionReasonSchema }),
]);
export type LineAttributionResult = z.infer<typeof lineAttributionResultSchema>;

export type LineAttributionLines =
  | { kind: 'eligible'; lineCount: number }
  | { kind: 'ineligible'; reason: 'binary' | 'unsupported_text' | 'empty' | 'preview_limit' };

/**
 * Pure line model shared by the host preview and the browser picker. Eligible
 * text is nonempty, fatal-decoded UTF-8, at most 512 KiB and 20,000 logical
 * lines, with no NUL and no lone CR. LF splits lines; CRLF is one terminator; a
 * trailing LF leaves no phantom line while real empty lines count.
 */
export function lineAttributionLines(bytes: Uint8Array): LineAttributionLines {
  if (bytes.length === 0) return { kind: 'ineligible', reason: 'empty' };
  if (bytes.length > LINE_ATTRIBUTION_LIMITS.previewBytes) return { kind: 'ineligible', reason: 'preview_limit' };
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i]!;
    if (byte === 0) return { kind: 'ineligible', reason: 'binary' };
    if (byte === 0x0d && bytes[i + 1] !== 0x0a) return { kind: 'ineligible', reason: 'unsupported_text' };
  }
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return { kind: 'ineligible', reason: 'unsupported_text' };
  }
  const parts = text.split('\n');
  const lineCount = text.endsWith('\n') ? parts.length - 1 : parts.length;
  if (lineCount > LINE_ATTRIBUTION_LIMITS.lines) return { kind: 'ineligible', reason: 'preview_limit' };
  return { kind: 'eligible', lineCount };
}

const unsafeCommitText = /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/gu;

/** Bound blame text to plain code points; C0/C1 controls and bidi overrides are removed. */
export function sanitizeCommitText(value: string, maxCodePoints: number, fallback: string): string {
  const cleaned = value.replace(unsafeCommitText, '');
  const bounded = [...cleaned].slice(0, maxCodePoints).join('').trim();
  return bounded || fallback;
}

/** Author-time epoch seconds to a validated ISO UTC instant; null when out of range. */
export function lineAttributionIsoUtc(epochSeconds: number): string | null {
  if (!Number.isSafeInteger(epochSeconds) || epochSeconds < -62_135_596_800 || epochSeconds > 253_402_300_799) return null;
  const date = new Date(epochSeconds * 1000);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
