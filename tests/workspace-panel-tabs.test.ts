import {expect,it} from 'vitest';
import {closedSurfaceTabs} from '../apps/web/src/WorkspacePanel.tsx';
import type {WorkspaceTab} from '../apps/web/src/workspace-context.tsx';

const tabs = (...ids: WorkspaceTab[]) => ids;

it('keeps the active tab when a non-active tab is closed',()=>{
  const result = closedSurfaceTabs(tabs('artifact','files','diff'),'files','diff');
  expect(result.openTabs).toEqual(['artifact','diff']);
  expect(result.activeTab).toBe('diff');
});

it('selects the last remaining tab when the active tab is closed',()=>{
  const result = closedSurfaceTabs(tabs('artifact','files','diff'),'diff','diff');
  expect(result.openTabs).toEqual(['artifact','files']);
  expect(result.activeTab).toBe('files');
});

it('falls back to artifact and keeps it inside openTabs when the last tab closes',()=>{
  const result = closedSurfaceTabs(tabs('diff'),'diff','diff');
  expect(result.activeTab).toBe('artifact');
  expect(result.openTabs).toEqual(['artifact']);
  expect(result.openTabs).toContain(result.activeTab);
});

it('always keeps activeTab inside openTabs across every close order',()=>{
  let state = {openTabs:tabs('artifact','plan','files','diff','notes'),activeTab:'notes' as WorkspaceTab};
  for(const closed of ['notes','files','plan','artifact'] as WorkspaceTab[]){
    state = closedSurfaceTabs(state.openTabs,closed,state.activeTab);
    expect(state.openTabs).toContain(state.activeTab);
    expect(state.openTabs.length).toBeGreaterThan(0);
  }
});
