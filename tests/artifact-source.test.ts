import { describe, expect, it } from 'vitest';
import { artifactSourceContent } from '../apps/web/src/artifact-source';

describe('artifactSourceContent', () => {
  it('returns null for missing, empty, and whitespace-only sources', () => {
    expect(artifactSourceContent(undefined)).toBeNull();
    expect(artifactSourceContent(null)).toBeNull();
    expect(artifactSourceContent('')).toBeNull();
    expect(artifactSourceContent('   ')).toBeNull();
    expect(artifactSourceContent(' \n\t ')).toBeNull();
  });
  it('trims surrounding whitespace from text sources', () => {
    expect(artifactSourceContent('  Notebook export  ')).toEqual({ kind: 'text', text: 'Notebook export' });
  });
  it('classifies http and https sources as links', () => {
    expect(artifactSourceContent('https://example.com/a')).toEqual({ kind: 'link', text: 'https://example.com/a' });
    expect(artifactSourceContent(' http://example.com ')).toEqual({ kind: 'link', text: 'http://example.com' });
  });
  it('keeps non-URL text as text', () => {
    expect(artifactSourceContent('See https://example.com for details')).toEqual({ kind: 'text', text: 'See https://example.com for details' });
    expect(artifactSourceContent('ftp://example.com')).toEqual({ kind: 'text', text: 'ftp://example.com' });
  });
});
