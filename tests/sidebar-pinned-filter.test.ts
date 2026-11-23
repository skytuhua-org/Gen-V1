import {expect,it} from 'vitest';
import {sidebarThreadGroups} from '../apps/web/src/ShellSidebar';
import type {ThreadNavigationRow} from '../packages/contracts/shell-read-models';

const row = (id:string, status:ThreadNavigationRow['status'], opts:{pinned?:boolean;settled?:boolean;runId?:string|null}={}):ThreadNavigationRow =>
  ({id,title:id,projectId:undefined,projectName:null,createdAt:'2026-11-20',updatedAt:'2026-11-22',status,runId:opts.runId??null,presentation:{order:0,pinned:opts.pinned,settled:opts.settled}});

it('keeps pinned threads visible under the status filter and never duplicates them into groups',()=>{
  const pinnedWaiting = row('p1','awaiting_input',{pinned:true});
  const workingRow = row('w1','working');
  const rows = [pinnedWaiting, workingRow];
  const workingFilter = sidebarThreadGroups(rows,'working',true);
  expect(workingFilter.pinned.map(r=>r.id)).toEqual(['p1']);
  expect(workingFilter.working.map(r=>r.id)).toEqual(['w1']);
  expect(workingFilter.remaining.map(r=>r.id)).toEqual([]);
  // pinned thread excluded from every filtered group even though it does not match the filter
  const waitingFilter = sidebarThreadGroups(rows,'waiting',true);
  expect(waitingFilter.pinned.map(r=>r.id)).toEqual(['p1']);
  expect(waitingFilter.working.map(r=>r.id)).toEqual([]);
  expect(waitingFilter.remaining.map(r=>r.id)).toEqual([]);
});

it('leaves the all-filter grouping unchanged',()=>{
  const pinnedReady = row('p1','ready',{pinned:true});
  const settledRow = row('s1','ready',{settled:true});
  const other = row('r1','ready');
  const groups = sidebarThreadGroups([pinnedReady,settledRow,other],'all',true);
  expect(groups.pinned.map(r=>r.id)).toEqual(['p1']);
  expect(groups.settled.map(r=>r.id)).toEqual(['s1']);
  expect(groups.remaining.map(r=>r.id)).toEqual(['r1']);
});

it('treats a pinned working thread as pinned-only under any filter',()=>{
  const pinnedWorking = row('p1','working',{pinned:true});
  const groups = sidebarThreadGroups([pinnedWorking],'working',true);
  expect(groups.pinned.map(r=>r.id)).toEqual(['p1']);
  expect(groups.working).toEqual([]);
  expect(groups.remaining).toEqual([]);
});
