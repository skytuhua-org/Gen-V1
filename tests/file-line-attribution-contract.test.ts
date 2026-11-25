import { describe, expect, it } from 'vitest';
import {
  LINE_ATTRIBUTION_LIMITS,
  lineAttributionIsoUtc,
  lineAttributionLines,
  lineAttributionPreviewSchema,
  lineAttributionRequestSchema,
  lineAttributionResultSchema,
  sanitizeCommitText,
} from '../packages/contracts/file-line-attribution.ts';

const encoder = new TextEncoder();
const validProof = 'v1.' + 'a'.repeat(43);
const validSha256 = 'a'.repeat(64);
const validRequest = { threadId: 'thread-1', path: 'src/example.txt', previewSha256: validSha256, previewProof: validProof, line: 2 };

describe('lineAttributionLines', () => {
  it('accepts LF text with a real empty line and no phantom trailing line', () => {
    expect(lineAttributionLines(encoder.encode('stable\nold\n\n'))).toEqual({ kind: 'eligible', lineCount: 3 });
  });
  it('counts CRLF as one terminator and accepts no final newline', () => {
    expect(lineAttributionLines(encoder.encode('a\r\nb\r\nc'))).toEqual({ kind: 'eligible', lineCount: 3 });
    expect(lineAttributionLines(encoder.encode('a\r\nb'))).toEqual({ kind: 'eligible', lineCount: 2 });
  });
  it('keeps a UTF-8 BOM as part of the first line and counts two empty lines', () => {
    expect(lineAttributionLines(encoder.encode('﻿x\ny'))).toEqual({ kind: 'eligible', lineCount: 2 });
    expect(lineAttributionLines(encoder.encode('\n\n'))).toEqual({ kind: 'eligible', lineCount: 2 });
  });
  it('rejects empty bytes, NUL, invalid UTF-8, and a lone CR', () => {
    expect(lineAttributionLines(new Uint8Array(0))).toEqual({ kind: 'ineligible', reason: 'empty' });
    expect(lineAttributionLines(encoder.encode('a\0b'))).toEqual({ kind: 'ineligible', reason: 'binary' });
    expect(lineAttributionLines(new Uint8Array([0xff, 0xfe]))).toEqual({ kind: 'ineligible', reason: 'unsupported_text' });
    expect(lineAttributionLines(encoder.encode('a\rb'))).toEqual({ kind: 'ineligible', reason: 'unsupported_text' });
    expect(lineAttributionLines(encoder.encode('a\r'))).toEqual({ kind: 'ineligible', reason: 'unsupported_text' });
  });
  it('rejects bytes and lines over the preview limits', () => {
    expect(lineAttributionLines(new Uint8Array(LINE_ATTRIBUTION_LIMITS.previewBytes + 1).fill(0x61))).toEqual({ kind: 'ineligible', reason: 'preview_limit' });
    expect(lineAttributionLines(encoder.encode('x\n'.repeat(LINE_ATTRIBUTION_LIMITS.lines + 1)))).toEqual({ kind: 'ineligible', reason: 'preview_limit' });
    expect(lineAttributionLines(new Uint8Array(LINE_ATTRIBUTION_LIMITS.previewBytes).fill(0x61))).toEqual({ kind: 'eligible', lineCount: 1 });
    expect(lineAttributionLines(encoder.encode('x\n'.repeat(LINE_ATTRIBUTION_LIMITS.lines)))).toEqual({ kind: 'eligible', lineCount: LINE_ATTRIBUTION_LIMITS.lines });
  });
});

describe('lineAttributionRequestSchema', () => {
  it('accepts a valid request with or without a thread', () => {
    expect(lineAttributionRequestSchema.parse(validRequest)).toEqual(validRequest);
    const { threadId, ...rest } = validRequest;
    expect(lineAttributionRequestSchema.parse(rest)).toEqual(rest);
  });
  it('rejects unknown keys, coercion, and out-of-range lines', () => {
    expect(lineAttributionRequestSchema.safeParse({ ...validRequest, authority: 'root' }).success).toBe(false);
    expect(lineAttributionRequestSchema.safeParse({ ...validRequest, line: '2' }).success).toBe(false);
    expect(lineAttributionRequestSchema.safeParse({ ...validRequest, line: 0 }).success).toBe(false);
    expect(lineAttributionRequestSchema.safeParse({ ...validRequest, line: LINE_ATTRIBUTION_LIMITS.lines + 1 }).success).toBe(false);
    expect(lineAttributionRequestSchema.safeParse({ ...validRequest, line: 2.5 }).success).toBe(false);
  });
  it('rejects malformed digests, proofs, and paths', () => {
    expect(lineAttributionRequestSchema.safeParse({ ...validRequest, previewSha256: 'z'.repeat(64) }).success).toBe(false);
    expect(lineAttributionRequestSchema.safeParse({ ...validRequest, previewProof: 'a'.repeat(43) }).success).toBe(false);
    expect(lineAttributionRequestSchema.safeParse({ ...validRequest, previewProof: 'v2.' + 'a'.repeat(43) }).success).toBe(false);
    for (const path of ['', 'a\\b', '../secret', 'a//b', '.git/config', 'x:.txt', 'dir/.harness-directory-guard', 'con/file.txt']) {
      expect(lineAttributionRequestSchema.safeParse({ ...validRequest, path }).success).toBe(false);
    }
    expect(lineAttributionRequestSchema.safeParse({ ...validRequest, path: 'dir with spaces/uniçode .txt' }).success).toBe(true);
  });
});

describe('lineAttributionPreviewSchema', () => {
  it('accepts the eligible and unavailable shapes and nothing else', () => {
    expect(lineAttributionPreviewSchema.parse({ kind: 'eligible', previewProof: validProof, lineCount: 3 })).toEqual({ kind: 'eligible', previewProof: validProof, lineCount: 3 });
    expect(lineAttributionPreviewSchema.parse({ kind: 'unavailable', reason: 'binary' })).toEqual({ kind: 'unavailable', reason: 'binary' });
    expect(lineAttributionPreviewSchema.safeParse({ kind: 'eligible', previewProof: validProof, lineCount: 0 }).success).toBe(false);
    expect(lineAttributionPreviewSchema.safeParse({ kind: 'unavailable', reason: 'mystery' }).success).toBe(false);
  });
});

describe('lineAttributionResultSchema', () => {
  const attributed = { kind: 'attributed', sha: 'b'.repeat(40), author: 'Ada Fixture', authorDateUtc: '2024-01-02T12:00:00.000Z', subject: 'Initial sample' };
  it('accepts a bounded attributed result', () => {
    expect(lineAttributionResultSchema.parse(attributed)).toEqual(attributed);
    expect(lineAttributionResultSchema.parse({ kind: 'unavailable', reason: 'line_unavailable' })).toEqual({ kind: 'unavailable', reason: 'line_unavailable' });
  });
  it('rejects malformed SHAs, non-UTC dates, controls, and overlong text', () => {
    expect(lineAttributionResultSchema.safeParse({ ...attributed, sha: 'b'.repeat(7) }).success).toBe(false);
    expect(lineAttributionResultSchema.safeParse({ ...attributed, sha: 'B'.repeat(40) }).success).toBe(false);
    expect(lineAttributionResultSchema.safeParse({ ...attributed, authorDateUtc: '2024-01-02T13:00:00+01:00' }).success).toBe(false);
    expect(lineAttributionResultSchema.safeParse({ ...attributed, author: 'Ada\nFixture' }).success).toBe(false);
    expect(lineAttributionResultSchema.safeParse({ ...attributed, subject: 'x'.repeat(LINE_ATTRIBUTION_LIMITS.subjectCodePoints + 1) }).success).toBe(false);
    expect(lineAttributionResultSchema.safeParse({ ...attributed, sha: 'g'.repeat(40) }).success).toBe(false);
  });
});

describe('sanitizeCommitText', () => {
  it('strips controls and bidi overrides, bounds code points, and falls back on blank', () => {
    expect(sanitizeCommitText('Ada\u202e Fixture', 120, 'Unknown author')).toBe('Ada Fixture');
    expect(sanitizeCommitText('a\0b\t', 120, 'Unknown author')).toBe('ab');
    expect(sanitizeCommitText('  \n ', 120, 'No commit subject')).toBe('No commit subject');
    expect(sanitizeCommitText('é'.repeat(200), 120, 'x')).toBe('é'.repeat(120));
  });
});

describe('lineAttributionIsoUtc', () => {
  it('converts a valid epoch and rejects non-integer or out-of-range values', () => {
    expect(lineAttributionIsoUtc(1704196800)).toBe('2024-01-02T12:00:00.000Z');
    expect(lineAttributionIsoUtc(-1)).toBe('1969-12-31T23:59:59.000Z');
    expect(lineAttributionIsoUtc(1.5)).toBeNull();
    expect(lineAttributionIsoUtc(Number.POSITIVE_INFINITY)).toBeNull();
    expect(lineAttributionIsoUtc(253_402_300_800)).toBeNull();
  });
});
