import {expect, it} from 'vitest';
import {classifyArtifactDiff} from '../apps/web/src/artifact-diff';
import {validateSurface} from '../packages/ui-catalog';
import {catalogSpec} from '../scripts/review-fixtures';

it('separates file headers from header-shaped content and resets across files', () => {
  const lines = [
    'diff --git a/a b/a', 'new file mode 100644', '--- a/a', '+++ b/a', '@@ -12 +12 @@ title',
    '--- literal content', '+++ literal content', '\\ No newline at end of file',
    '--- a/b', '+++ b/b', '@@ -1,2 +1,2 @@', ' shared context', '+added', '-removed', '',
  ];
  const result = classifyArtifactDiff(lines.join('\r\n'));
  expect(result.map(line => line.text)).toEqual(lines);
  expect(result.map(line => line.className)).toEqual([
    'diff-header', 'diff-header', 'diff-header', 'diff-header', 'diff-hunk',
    'removed', 'added', 'diff-hunk', 'diff-header', 'diff-header', 'diff-hunk',
    '', 'added', 'removed', '',
  ]);
});

it('retains ordinary prefixes and accepts both direct unified inputs in the catalog', () => {
  expect(classifyArtifactDiff('- prior\n+ current').map(line => line.className)).toEqual(['removed', 'added']);
  for (const field of ['diff','content']) {
    expect(() => validateSurface({root:'view',elements:{view:{type:'Diff',props:{[field]:'--- a/a\n+++ b/a'}}}})).not.toThrow();
  }
  expect(() => validateSurface(catalogSpec('fixture-pdf','fixture-image'))).not.toThrow();
});
