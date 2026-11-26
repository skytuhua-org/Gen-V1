import {expect,it} from 'vitest';
import {threadRowLabel} from '../apps/web/src/ShellSidebar';
import type {ThreadNavigationRow} from '../packages/contracts/shell-read-models';

const row = (unread:boolean):ThreadNavigationRow =>
  ({id:'t1',title:'Workspace & settings',projectId:undefined,projectName:null,createdAt:'2026-11-20',updatedAt:'2026-11-22',status:'ready',runId:null,presentation:{order:0,unread}});

it('appends " Unread" to the row accessible name only for unread threads',()=>{
  expect(threadRowLabel(row(true))).toBe('Workspace & settings Ready Unread');
  expect(threadRowLabel(row(false))).toBe('Workspace & settings Ready');
});

it('keeps the exact prior label shape for read rows and other statuses',()=>{
  const base = row(false);
  expect(threadRowLabel({...base,status:'awaiting_input'})).toBe('Workspace & settings Your input');
  expect(threadRowLabel({...base,status:'working',runId:'r1'})).toBe('Workspace & settings Working');
  expect(threadRowLabel({...base,presentation:{order:0}})).toBe('Workspace & settings Ready');
});
