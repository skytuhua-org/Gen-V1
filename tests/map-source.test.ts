import { describe, expect, it } from 'vitest';
import { mapSourceContent } from '../apps/web/src/map-source';

describe('map artifact source disclosure content', () => {
  it('hides the disclosure for missing or blank source text', () => {
    expect(mapSourceContent(undefined)).toBeNull();
    expect(mapSourceContent(null)).toBeNull();
    expect(mapSourceContent('')).toBeNull();
    expect(mapSourceContent('   \n\t  ')).toBeNull();
  });
  it('renders http(s) sources as links with trimmed text', () => {
    expect(mapSourceContent('  https://example.com/places  ')).toEqual({ kind: 'link', text: 'https://example.com/places' });
    expect(mapSourceContent('http://example.com')).toEqual({ kind: 'link', text: 'http://example.com' });
  });
  it('renders other sources as plain text', () => {
    expect(mapSourceContent('Field survey, March')).toEqual({ kind: 'text', text: 'Field survey, March' });
    expect(mapSourceContent('ftp://example.com/x')).toEqual({ kind: 'text', text: 'ftp://example.com/x' });
  });
});
