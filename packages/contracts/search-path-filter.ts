// Shared include/exclude path-glob grammar for Project Search filters (#1635).
// Browser-safe: no Node imports. Matching is case-sensitive over forward-slash
// project-relative paths; exclude wins where both patterns apply (host side).
export const SEARCH_PATH_FILTER_LIMITS = Object.freeze({ rawBytes: 512, codePoints: 200, segments: 32 });
export const SEARCH_PATH_FILTER_MESSAGE =
  'Use one path glob, relative to this project: * and ? match inside a segment, and a whole ** segment matches any number of folders.';
export const SEARCH_PATH_FILTER_LENGTH_MESSAGE = 'Use 200 characters or fewer and at most 32 segments per path filter.';

export type SearchPathFilterFailure = 'characters' | 'length' | 'grammar';
export type SearchPathFilterParse = { ok: true; filter?: SearchPathFilter } | { ok: false; failure: SearchPathFilterFailure };
export type SearchPathFilter = { canonical: string; segments: ({ globstar: true } | { globstar: false; pattern: string[] })[] };

// ASCII control characters and *lone* surrogates only: valid supplementary
// characters arrive as high+low surrogate pairs and must not be rejected.
const INVALID_CHARACTER = new RegExp('[\\x00-\\x1f\\x7f]|[\\ud800-\\udbff](?![\\udc00-\\udfff])|(?<![\\ud800-\\udbff])[\\udc00-\\udfff]');
const INVALID_SEGMENT_CHARACTER = /[\\:,\[\]{}]/;

/**
 * Parse and normalize one optional glob. Blank input (missing or whitespace-only)
 * is canonically absent. Anything else is strict: invalid input is an error,
 * never silently blanked or truncated.
 */
export function parseSearchPathFilter(raw: string): SearchPathFilterParse {
  // Invalid Unicode and ASCII control characters are rejected before trimming.
  if (INVALID_CHARACTER.test(raw)) return { ok: false, failure: 'characters' };
  if (new TextEncoder().encode(raw).byteLength > SEARCH_PATH_FILTER_LIMITS.rawBytes) return { ok: false, failure: 'length' };
  const canonical = raw.trim();
  if (!canonical) return { ok: true };
  if ([...canonical].length > SEARCH_PATH_FILTER_LIMITS.codePoints) return { ok: false, failure: 'length' };
  const names = canonical.split('/');
  if (names.length > SEARCH_PATH_FILTER_LIMITS.segments) return { ok: false, failure: 'length' };
  const segments: SearchPathFilter['segments'] = [];
  for (const name of names) {
    if (!name || name === '.' || name === '..') return { ok: false, failure: 'grammar' };
    if (name === '**') { segments.push({ globstar: true }); continue; }
    if (INVALID_SEGMENT_CHARACTER.test(name) || /\*\*/.test(name)) return { ok: false, failure: 'grammar' };
    segments.push({ globstar: false, pattern: [...name] });
  }
  return { ok: true, filter: { canonical, segments } };
}

/** Roll a wildcard comparison over Unicode code points with rolling rows. */
function matchSegment(pattern: string[], text: string): boolean {
  const points = [...text];
  let previous = new Array<boolean>(points.length + 1).fill(false);
  previous[0] = true;
  for (const point of pattern) {
    const next = new Array<boolean>(points.length + 1).fill(false);
    if (point === '*') {
      let reachable = false;
      for (let index = 0; index <= points.length; index++) { reachable = reachable || previous[index]!; next[index] = reachable; }
    } else {
      for (let index = 1; index <= points.length; index++) next[index] = previous[index - 1]! && (point === '?' || point === points[index - 1]);
    }
    previous = next;
  }
  return previous[points.length]!;
}

/** Root-to-full-path match: `**` consumes zero or more complete segments. */
export function matchSearchPathFilter(filter: SearchPathFilter, path: string): boolean {
  const names = path.split('/');
  let row = new Array<boolean>(names.length + 1).fill(false);
  row[0] = true;
  for (const segment of filter.segments) {
    const next = new Array<boolean>(names.length + 1).fill(false);
    if (segment.globstar) {
      let reachable = false;
      for (let index = 0; index <= names.length; index++) { reachable = reachable || row[index]!; next[index] = reachable; }
    } else {
      for (let index = 1; index <= names.length; index++) next[index] = row[index - 1]! && matchSegment(segment.pattern, names[index - 1]!);
    }
    row = next;
  }
  return row[names.length]!;
}
