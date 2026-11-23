import { describe, expect, it } from 'vitest';
import { searchRequestSchema } from '../packages/contracts/project-search.ts';
import { matchSearchPathFilter, parseSearchPathFilter, SEARCH_PATH_FILTER_LIMITS } from '../packages/contracts/search-path-filter.ts';

const parse = (pattern: string) => {
  const parsed = parseSearchPathFilter(pattern);
  if (!parsed.ok || !parsed.filter) throw new Error(`not a filter: ${pattern}`);
  return parsed.filter;
};
const match = (pattern: string, path: string) => matchSearchPathFilter(parse(pattern), path);

describe('parseSearchPathFilter', () => {
  it('treats blank input as canonically absent', () => {
    expect(parseSearchPathFilter('')).toEqual({ ok: true });
    expect(parseSearchPathFilter('   ')).toEqual({ ok: true });
    // A tab is an ASCII control character: rejected before trimming per grammar.\n    expect(parseSearchPathFilter('\t')).toMatchObject({ ok: false, failure: 'characters' });
  });

  it('trims and keeps a case-sensitive canonical form', () => {
    const parsed = parseSearchPathFilter('  Src/*.Ts ');
    expect(parsed).toEqual({ ok: true, filter: expect.objectContaining({ canonical: 'Src/*.Ts' }) });
  });

  it('rejects invalid Unicode and ASCII control characters', () => {
    for (const raw of ['a\x07b', 'a\x00b', 'a\x1fb', 'a\x7fb', 'a\ud800b']) {
      expect(parseSearchPathFilter(raw).ok).toBe(false);
      expect(parseSearchPathFilter(raw)).toMatchObject({ failure: 'characters' });
    }
  });

  it('enforces raw bytes, code point and segment bounds', () => {
    const bytes = 'x'.repeat(SEARCH_PATH_FILTER_LIMITS.rawBytes + 1);
    const points = '😀'.repeat(SEARCH_PATH_FILTER_LIMITS.codePoints + 1);
    const segments = Array.from({ length: SEARCH_PATH_FILTER_LIMITS.segments + 1 }, () => 'a').join('/');
    for (const raw of [bytes, points, segments]) {
      expect(parseSearchPathFilter(raw)).toMatchObject({ ok: false, failure: 'length' });
    }
    // A boundary value satisfies every bound: <=512 bytes, <=200 code points, <=32 segments.
    expect(parseSearchPathFilter('x'.repeat(SEARCH_PATH_FILTER_LIMITS.codePoints)).ok).toBe(true);
    expect(parseSearchPathFilter('😀'.repeat(100)).ok).toBe(true);
    expect(parseSearchPathFilter(Array.from({ length: SEARCH_PATH_FILTER_LIMITS.segments }, () => 'a').join('/')).ok).toBe(true);
  });

  it.each([
    '/leading', 'trailing/', 'dou//bled', '.', '..', 'a/./b', 'a/../b',
    'back\\slash', 'colo:n', 'lis,t', 'bra[ce', 'bra]ce', 'bra{ce', 'bra}ce',
    'sta**r', '**x', 'x**', 'a/**b/c',
  ])('rejects grammar-invalid %j', (raw) => {
    expect(parseSearchPathFilter(raw)).toMatchObject({ ok: false, failure: 'grammar' });
  });
});

describe('matchSearchPathFilter', () => {
  it.each([
    ['*.ts', 'root.ts', true], ['*.ts', 'src/root.ts', false],
    ['src/**/*.ts', 'src/needle.ts', true], ['src/**/*.ts', 'src/lib/deep/needle.ts', true],
    ['src/**/*.ts', 'other/src/needle.ts', false], ['src/**/*.ts', 'src/Needle.TS', false],
    ['**/*.ts', 'needle.ts', true], ['**/*.ts', 'a/b/needle.ts', true],
    ['**', 'anything/deep/file.txt', true], ['**', 'root.txt', true],
    ['src', 'src/a.ts', false], ['src/**', 'src/a.ts', true],
    ['lib/**/test/*.spec.ts', 'lib/test/x.spec.ts', true],
    ['lib/**/test/*.spec.ts', 'lib/a/b/test/x.spec.ts', true],
    ['lib/**/test/*.spec.ts', 'lib/x.spec.ts', false],
    ['a/**/b/**/c', 'a/b/c', true], ['a/**/b/**/c', 'a/1/b/2/3/c', true],
    ['a/**/b/**/c', 'a/1/b/2/3/x', false],
  ])('match %j against %j → %s', (pattern, path, expected) => {
    expect(match(pattern, path)).toBe(expected);
  });

  it('handles literals and ? over multi-byte code points', () => {
    expect(match('src/?.ts', 'src/😀.ts')).toBe(true);
    expect(match('src/?.ts', 'src/ab.ts')).toBe(false);
    expect(match('résumé.txt', 'résumé.txt')).toBe(true);
    expect(match('file?.txt', 'file1.txt')).toBe(true);
  });
});

describe('searchRequestSchema include/exclude', () => {
  const base = { q: 'needle' };
  it('keeps blank fields absent after normalization', () => {
    expect(searchRequestSchema.parse({ ...base, include: '  ', exclude: ' \u00a0 ' })).toEqual(base);
  });
  it('normalizes to the canonical trimmed glob', () => {
    expect(searchRequestSchema.parse({ ...base, include: ' Src/*.Ts ' }).include).toBe('Src/*.Ts');
  });
  it.each(['a//b', 'a/../b', 'sta**r', 'x'.repeat(513), 'a:b'])('rejects invalid include %j', (include) => {
    expect(searchRequestSchema.safeParse({ ...base, include }).success).toBe(false);
  });
});
