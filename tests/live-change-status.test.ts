import {expect, it} from 'vitest';
import {porcelainStatus} from '../apps/web/src/WorkspaceSurfaceBody';

it.each([
  ['?', '?', 'Untracked'], [' ', 'M', 'Modified'], ['A', ' ', 'Added'],
  ['D', ' ', 'Deleted'], ['R', 'M', 'Renamed'], ['C', 'D', 'Copied'],
  [' ', 'T', 'Type changed'], ['U', 'R', 'Unmerged'], ['U', 'U', 'Unmerged'],
  ['A', 'A', 'Unmerged'], ['D', 'D', 'Unmerged'], [' ', ' ', 'Modified'],
])('labels Git status %s %s as %s', (index, worktree, expected) => {
  expect(porcelainStatus(index, worktree)).toBe(expected);
});
