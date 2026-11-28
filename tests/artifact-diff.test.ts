import {expect, it} from 'vitest';
import {splitDiffLines} from '../apps/web/src/diff-line-kind';
import {validateSurface} from '../packages/ui-catalog';
import {catalogSpec} from '../scripts/review-fixtures';

it('separates file headers from header-shaped content and resets across files', () => {
  const lines = [
    'diff --git a/a b/a', 'new file mode 100644', '--- a/a', '+++ b/a', '@@ -12 +12 @@ title',
    '--- literal content', '+++ literal content', '\\ No newline at end of file',
    '--- a/b', '+++ b/b', '@@ -1,2 +1,2 @@', ' shared context', '+added', '-removed', '',
  ];
  const result = splitDiffLines(lines.join('\r\n'));
  expect(result.map(line => line.text)).toEqual(lines);
  expect(result.map(line => line.kind)).toEqual([
    'header', 'header', 'header', 'header', 'hunk',
    'remove', 'add', 'hunk', 'header', 'header', 'hunk',
    'context', 'add', 'remove', 'context',
  ]);
});

it('retains ordinary prefixes and accepts both direct unified inputs in the catalog', () => {
  expect(splitDiffLines('- prior\n+ current').map(line => line.kind)).toEqual(['remove', 'add']);
  for (const field of ['diff','content']) {
    expect(() => validateSurface({root:'view',elements:{view:{type:'Diff',props:{[field]:'--- a/a\n+++ b/a'}}}})).not.toThrow();
  }
  expect(() => validateSurface(catalogSpec('fixture-pdf','fixture-image'))).not.toThrow();
});
