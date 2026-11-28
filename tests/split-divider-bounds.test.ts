import {describe,expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createSplitWorkspaceLayout,applySplitWorkspaceCommand,minimumViewSize} from '../packages/core/split-workspace-layout.ts';
import {WorkspaceSplitLayout,splitBounds} from '../apps/web/src/WorkspaceSplitLayout.tsx';
import type {SplitWorkspaceLayout,SplitWorkspaceNode} from '../packages/contracts/split-workspace.ts';
import type {SurfaceRef} from '../packages/contracts/workspace.ts';

const threadView=(id:string)=>({id,kind:'thread' as const,binding:{authority:{kind:'local' as const},threadId:id}});

function splitFixture(axis:'horizontal'|'vertical',firstKind:'thread'|'diff'='thread',secondKind:'thread'|'diff'='thread'):{layout:SplitWorkspaceLayout;node:Extract<SplitWorkspaceNode,{kind:'split'}>}{
 let layout=createSplitWorkspaceLayout('bounds-fixture');
 layout=applySplitWorkspaceCommand(layout,'view.open',{view:threadView('first')});
 layout=applySplitWorkspaceCommand(layout,'pane.split',{paneId:'pane-main',newPaneId:'right',splitId:'s1',axis,view:threadView('second')});
 if(firstKind!=='thread')layout={...layout,views:{...layout.views,first:{...layout.views['first']!,kind:firstKind}}};
 if(secondKind!=='thread')layout={...layout,views:{...layout.views,second:{...layout.views['second']!,kind:secondKind}}};
 const node=layout.root;
 if(node.kind!=='split')throw new Error('fixture did not produce a split root');
 return{layout,node};
}

describe('splitBounds',()=>{
 it('floors the announced range at 5%..95% when pane minimums fit',()=>{
  const{layout,node}=splitFixture('horizontal');
  const bounds=splitBounds(layout,node,10_000);
  expect(bounds).toEqual({low:.05,high:.95});
 });
 it('raises the low bound and lowers the high bound for wide pane minimums',()=>{
  const{layout,node}=splitFixture('horizontal');
  const first=minimumViewSize(threadView('first')).width,span=800;
  const bounds=splitBounds(layout,node,span);
  expect(bounds.low).toBeCloseTo(first/span,10);
  expect(bounds.high).toBeCloseTo(1-first/span,10);
  expect(bounds.low).toBeGreaterThan(.05);
  expect(bounds.high).toBeLessThan(.95);
 });
 it('uses the larger view minimums when panes differ',()=>{
  const{layout,node}=splitFixture('horizontal','thread','diff');
  const bounds=splitBounds(layout,node,800);
  expect(bounds.low).toBeCloseTo(minimumViewSize(threadView('a')).width/800,10);
  expect(bounds.high).toBeCloseTo(1-minimumViewSize({id:'x',kind:'diff',binding:{authority:{kind:'local'},threadId:'x'}}).width/800,10);
 });
 it('measures the vertical axis along height',()=>{
  const{layout,node}=splitFixture('vertical');
  const height=minimumViewSize(threadView('first')).height,span=600;
  const bounds=splitBounds(layout,node,span);
  expect(bounds.low).toBeCloseTo(height/span,10);
  expect(bounds.high).toBeCloseTo(1-height/span,10);
 });
 it('reports low>high when the span cannot fit both minimums',()=>{
  const{layout,node}=splitFixture('horizontal');
  const bounds=splitBounds(layout,node,500);
  expect(bounds.low).toBeGreaterThan(bounds.high);
 });
});

describe('split divider aria',()=>{
 it('omits the aria range on the unmeasured first paint but stays focusable',()=>{
  const{layout}=splitFixture('horizontal');
  const html=renderToStaticMarkup(createElement(WorkspaceSplitLayout,{layout,onCommand:async()=>{},renderView:(view:SurfaceRef)=>createElement('div',null,view.id)}));
  expect(html).toContain('role="separator"');
  expect(html).toContain('aria-valuenow=');
  expect(html).toContain('tabindex="0"');
  expect(html).not.toContain('aria-valuemin');
  expect(html).not.toContain('aria-valuemax');
 });
});
