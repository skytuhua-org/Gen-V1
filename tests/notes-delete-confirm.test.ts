import {describe,expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryNote,TaskMemory} from '../apps/web/src/TaskMemory.tsx';
import type {TaskMemory as Note,Snapshot} from '../packages/contracts';

const note:Note={id:'n1',threadId:'t1',key:'date-format',content:'Use ISO dates.',revision:3,author:'user',updatedAt:''};
const saved=(extra:{confirmingDelete?:boolean;onDisarmDelete?:()=>void}={})=>renderToStaticMarkup(createElement(MemoryNote,{note,threadId:'t1',...extra}));

describe('Notes delete confirmation',()=>{
 it('renders the trash icon with the Forget aria-label when not confirming',()=>{
  const html=saved();
  expect(html).toContain('aria-label="Forget date-format"');
  expect(html).toContain('icon-button');
  expect(html).not.toContain('memory-delete-confirm');
 });
 it('swaps in an inline confirm labeled with the note key when armed',()=>{
  const html=saved({confirmingDelete:true,onDisarmDelete:()=>{}});
  expect(html).toContain('class="memory-delete-confirm"');
  expect(html).toContain('aria-label="Confirm forget date-format"');
  expect(html).toContain('Forget “date-format”?');
  expect(html).not.toContain('aria-label="Forget date-format"');
 });
 it('keeps the Save note button unchanged while confirming',()=>{
  const html=saved({confirmingDelete:true});
  expect(html).toContain('Save note');
 });
 it('keeps the trash icon as the delete affordance in the full panel',()=>{
  const snapshot={memory:[note]} as Snapshot;
  const html=renderToStaticMarkup(createElement(TaskMemory,{snapshot,threadId:'t1'}));
  expect(html).toContain('aria-label="Forget date-format"');
 });
});
