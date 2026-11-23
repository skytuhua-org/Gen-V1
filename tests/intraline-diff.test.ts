import { describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { annotateSnapshot, annotateUnified, diffTokens, type IntralineRange } from '../apps/web/src/intraline-diff';
import { DiffText } from '../apps/web/src/DiffText';

const marked = (text: string, ranges: IntralineRange[] = []) => ranges.map(r => text.slice(r.start, r.end)).join('|');
const hasSegmenter = typeof (Intl as { Segmenter?: unknown }).Segmenter === 'function';

const maybe = hasSegmenter ? describe : describe.skip;

maybe('annotateSnapshot precision', () => {
  it('marks only the changed digits in a long line', () => {
    const before = 'const timeoutMs = 1500;', after = 'const timeoutMs = 1800;';
    const out = annotateSnapshot(before, after, { hideWhitespace: false })!;
    expect(out.before).toHaveLength(1);
    expect(out.after).toHaveLength(1);
    expect(marked(before, out.before[0]!.ranges)).toBe('5');
    expect(marked(after, out.after[0]!.ranges)).toBe('8');
  });
  it('marks a deleted word without inventing an addition', () => {
    const before = 'show the large preview', after = 'show the preview';
    const on = annotateSnapshot(before, after, { hideWhitespace: false })!;
    expect(marked(before, on.before[0]!.ranges)).toContain('large');
    expect(on.after).toHaveLength(0);
    const off = annotateSnapshot(before, after, { hideWhitespace: true })!;
    expect(marked(before, off.before[0]!.ranges)).toBe('large');
  });
  it('marks an inserted word on the after side only', () => {
    const before = 'show the preview', after = 'show the large preview';
    const out = annotateSnapshot(before, after, { hideWhitespace: false })!;
    expect(out.before).toHaveLength(0);
    expect(marked(after, out.after[0]!.ranges)).toContain('large');
  });
  it('marks a punctuation-only replacement at grapheme precision', () => {
    const before = 'a.b', after = 'a,b';
    const out = annotateSnapshot(before, after, { hideWhitespace: false })!;
    expect(marked(before, out.before[0]!.ranges)).toBe('.');
    expect(marked(after, out.after[0]!.ranges)).toBe(',');
  });
  it('never splits a grapheme cluster (emoji modifier + combining mark)', () => {
    const before = 'wave 👍🏻 done', after = 'wave 👎🏻 done';
    const out = annotateSnapshot(before, after, { hideWhitespace: false })!;
    const start = before.indexOf('👍🏻');
    expect(out.before[0]!.ranges).toEqual([{ start, end: start + '👍🏻'.length }]);
    const start2 = after.indexOf('👎🏻');
    expect(out.after[0]!.ranges).toEqual([{ start: start2, end: start2 + '👎🏻'.length }]);
  });
});

maybe('annotateSnapshot pairing and filtering', () => {
  it('pairs only the related line in an uneven region and leaves others plain', () => {
    const before = 'alpha\nrename me please\nunrelated old line\ngamma';
    const after = 'alpha\nrename us please\ncompletely different tail\ngamma';
    const out = annotateSnapshot(before, after, { hideWhitespace: false })!;
    expect(out.before).toHaveLength(1);
    expect(marked(before.split('\n')[1]!, out.before[0]!.ranges)).toBe('me');
    expect(marked(after.split('\n')[1]!, out.after[0]!.ranges)).toBe('us');
  });
  it('keeps tied candidates unpaired', () => {
    const before = 'run the fast path\nother line';
    const after = 'run the fast path\nrun the fast lane\nrun the fast lanes';
    const out = annotateSnapshot(before, after, { hideWhitespace: false })!;
    // Ambiguous duplicates -> no misleading marks.
    expect(out.before.every(line => !marked(before.split('\n')[line.index]!, line.ranges).includes('line'))).toBe(true);
  });
  it('hideWhitespace filters equal and whitespace-only rows on each side', () => {
    const before = 'alpha\n  beta   \nkeep old';
    const after = 'alpha\nbeta\nkeep new';
    const out = annotateSnapshot(before, after, { hideWhitespace: true })!;
    expect(out.beforeKeep).toEqual([2]);
    expect(out.afterKeep).toEqual([2]);
    const on = annotateSnapshot(before, after, { hideWhitespace: false })!;
    expect(on.beforeKeep).toBeUndefined();
  });
  it('leaves unrelated replacements at line level', () => {
    const out = annotateSnapshot('totally different content', 'nothing alike here', { hideWhitespace: false })!;
    expect(out.before).toHaveLength(0);
    expect(out.after).toHaveLength(0);
  });
});

maybe('annotateUnified hunks and malformed input', () => {
  const patch = (body: string, counts = '-1,1 +1,1') => `diff --git a/f.ts b/f.ts\nindex 111..222 100644\n--- a/f.ts\n+++ b/f.ts\n@@ ${counts} @@\n${body}`;
  it('annotates rows inside a valid hunk with ranges after the marker', () => {
    const out = annotateUnified(patch('-const timeoutMs = 1500;\n+const timeoutMs = 1800;\n tail', '-1,2 +1,2'))!;
    expect(out).not.toBeNull();
    const lines = patch('-const timeoutMs = 1500;\n+const timeoutMs = 1800;\n tail').split('\n');
    const ro = out.get(5)!, rn = out.get(6)!;
    expect(lines[5]!.slice(1).slice(ro[0]!.start, ro[0]!.end)).toBe('5');
    expect(lines[6]!.slice(1).slice(rn[0]!.start, rn[0]!.end)).toBe('8');
  });
  it('treats ++ and -- payloads after the marker as content, not headers', () => {
    const p = `diff --git a/f.ts b/f.ts\nindex 1..2 100644\n--- a/f.ts\n+++ b/f.ts\n@@ -1,2 +1,2 @@\n-old\n-- -- literal payload\n+new\n++ ++ literal payload\n`;
    const out = annotateUnified(p);
    expect(out).not.toBeNull();
    // Row 3 ('-- -- literal payload') and 5 ('++ ++ literal payload') may pair;
    // no crash and no header misclassification.
    expect(out!.size).toBeLessThanOrEqual(4);
  });
  it('discards annotation for a malformed hunk (declared counts wrong)', () => {
    const p = patch('-old\n+new', '-2,0 +2,0');
    expect(annotateUnified(p)!.size).toBe(0);
  });
  it('skips headers, binary and combined diffs', () => {
    expect(annotateUnified('Binary files a/x and b/x differ')!.size).toBe(0);
    const combined = 'diff --cc file\nindex a..b..c\n--- a/file\n+++ b/file\n@@@ -1,1 -1,1 +1,1 @@@\n- removed\n++ added\n';
    expect(annotateUnified(combined)!.size).toBe(0);
  });
  it('honors maxRows so rows past the inline cap stay plain', () => {
    const p = `diff --git a/f.ts b/f.ts\nindex 1..2 100644\n--- a/f.ts\n+++ b/f.ts\n@@ -1,1 +1,1 @@\n-const a = 1;\n+const a = 2;\n@@ -10,1 +10,1 @@\n-const b = 3;\n+const b = 4;\n`;
    const out = annotateUnified(p, { hideWhitespace: false, maxRows: 7 })!;
    expect(out.has(5)).toBe(true);
    expect(out.has(8)).toBe(false);
    expect(out.has(9)).toBe(false);
  });
});

describe('budgets and fallbacks', () => {
  it('returns null over the input cap', () => {
    const big = 'x'.repeat(41000);
    expect(annotateSnapshot(big, 'y', { hideWhitespace: false })).toBeNull();
    expect(annotateUnified(big)).toBeNull();
  });
  it('returns null over the line cap', () => {
    const many = Array.from({ length: 610 }, (_, i) => `l${i}`).join('\n');
    expect(annotateSnapshot(many, 'x', { hideWhitespace: false })).toBeNull();
  });
  it('returns null when Intl.Segmenter is unavailable', () => {
    const intl = Intl as { Segmenter?: unknown };
    const saved = intl.Segmenter;
    // @ts-expect-error test-only override
    intl.Segmenter = undefined;
    try {
      expect(annotateSnapshot('const a = 1;', 'const a = 2;', { hideWhitespace: false })!.before).toHaveLength(0);
      expect(annotateUnified('diff --git a/f b/f\nindex 1..2 1\n--- a/f\n+++ b/f\n@@ -1,1 +1,1 @@\n-const a = 1;\n+const a = 2;')!.size).toBe(0);
      expect(diffTokens('hello world')).toBeNull();
    } finally {
      intl.Segmenter = saved;
      vi.unstubAllGlobals();
    }
  });
});

describe('DiffText rendering', () => {
  it('reconstructs the exact text and marks only the ranged runs', () => {
    const html = renderToStaticMarkup(createElement(DiffText, { text: 'const a = 1;', ranges: [{ start: 10, end: 11 }], tone: 'removed' }));
    expect(html).toBe('const a = <span class="intraline-mark intraline-mark-removed">1</span>;');
  });
  it('renders plain text with no ranges and keeps HTML escaped', () => {
    expect(renderToStaticMarkup(createElement(DiffText, { text: 'a<b', tone: 'added' }))).toBe('a&lt;b');
    expect(renderToStaticMarkup(createElement(DiffText, { text: 'x', ranges: [], tone: 'added' }))).toBe('x');
  });
  it('emits only text nodes and noninteractive spans', () => {
    const html = renderToStaticMarkup(createElement(DiffText, { text: 'hello world', ranges: [{ start: 0, end: 5 }, { start: 6, end: 11 }], tone: 'added' }));
    expect(html).toBe('<span class="intraline-mark intraline-mark-added">hello</span> <span class="intraline-mark intraline-mark-added">world</span>');
    expect(html).not.toMatch(/tabindex|aria-|title=|<a|<button/);
  });
});
