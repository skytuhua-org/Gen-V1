import {describe,expect,it} from 'vitest';
import {statusBranch} from '../packages/workspace/git-storage.ts';

describe('statusBranch',()=>{
 it('reads the branch from a porcelain -b header',()=>{
  expect(statusBranch('## main')).toBe('main');
  expect(statusBranch('## feature/topic')).toBe('feature/topic');
 });
 it('drops upstream and ahead/behind suffixes',()=>{
  expect(statusBranch('## main...origin/main')).toBe('main');
  expect(statusBranch('## main...origin/main [ahead 2, behind 1]')).toBe('main');
 });
 it('reports an empty branch on a detached HEAD',()=>{
  expect(statusBranch('## HEAD (no branch)')).toBe('');
 });
 it('reads the unborn-branch header',()=>{
  expect(statusBranch('## No commits yet on trunk')).toBe('trunk');
 });
 it('rejects output without a branch header',()=>{
  expect(()=>statusBranch(' M file.txt')).toThrowError(/branch header/);
 });
});
