import {describe,expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryNote,TaskMemory} from '../apps/web/src/TaskMemory.tsx';
import type {TaskMemory as Note,Snapshot} from '../packages/contracts';

const note:Note={id:'n1',threadId:'t1',key:'date-format',content:'Use ISO dates.',revision:3,author:'user',updatedAt:''};
const blank:Note={id:'',threadId:'t1',key:'',content:'',revision:0,author:'user',updatedAt:''};
const panel=(memory:Note[],threadId='t1')=>renderToStaticMarkup(createElement(TaskMemory,{snapshot:{memory} as Snapshot,threadId}));

describe('Notes field counters',()=>{
 it('shows a live 0/64 counter and hidden maximum hint on the create key field',()=>{
  const html=renderToStaticMarkup(createElement(MemoryNote,{note:blank,threadId:'t1',fresh:true}));
  expect(html).toContain('0/64');
  expect(html).toContain('Maximum 64 characters');
  const keyField=html.match(/<input[^>]*aria-describedby="([^"]+)"[^>]*>/)!;
  expect(html).toContain(`id="${keyField[1]}"`);
 });
 it('shows a content counter and hidden maximum hint in the saved-note form',()=>{
  const html=renderToStaticMarkup(createElement(MemoryNote,{note,threadId:'t1'}));
  expect(html).toContain(`${note.content.length}/768`);
  expect(html).toContain('Maximum 768 characters');
  const field=html.match(/<textarea[^>]*aria-describedby="([^"]+)"[^>]*>/)!;
  expect(html).toContain(`id="${field[1]}"`);
 });
 it('keeps the counter aria-hidden and flags it full exactly at the cap',()=>{
  const html=renderToStaticMarkup(createElement(MemoryNote,{note:{...note,content:'x'.repeat(768)},threadId:'t1'}));
  expect(html).toContain('memory-count is-full');
  expect(html).toContain('aria-hidden="true">768/768');
 });
});

describe('Notes header counter and cap',()=>{
 it('always renders the n/12 counter once a conversation exists',()=>{
  expect(panel([])).toContain('0/12');
  expect(panel([note])).toContain('1/12');
 });
 it('explains the cap only at 12 notes',()=>{
  const notes=Array.from({length:12},(_,i)=>({...note,id:`n${i}`,key:`k-${i}`}));
  expect(panel(notes)).toContain('12 notes saved — remove a note to add another.');
  expect(panel([note])).not.toContain('remove a note to add another');
 });
 it('explains the disabled + button when no conversation is chosen',()=>{
  const html=renderToStaticMarkup(createElement(TaskMemory,{snapshot:{memory:[note]} as Snapshot,threadId:undefined}));
  expect(html).toContain('title="Choose a conversation first"');
  expect(html).toContain('aria-describedby="memory-add-disabled-hint"');
  expect(html).toContain('id="memory-add-disabled-hint"');
 });
});
