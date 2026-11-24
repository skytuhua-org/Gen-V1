import {describe,expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryNote} from '../apps/web/src/TaskMemory.tsx';
import type {TaskMemory as Note} from '../packages/contracts';

const note:Note={id:'n1',threadId:'t1',key:'date-format',content:'Use ISO dates.',revision:3,author:'user',updatedAt:''};

describe('Notes Save affordance',()=>{
 it('disables Save note on an untouched note',()=>{
  const html=renderToStaticMarkup(createElement(MemoryNote,{note,threadId:'t1'}));
  const save=html.match(/<button[^>]*>Save note<\/button>/)![0];
  expect(save).toContain('disabled');
 });
 it('keeps the live region present but empty before any save',()=>{
  const html=renderToStaticMarkup(createElement(MemoryNote,{note,threadId:'t1'}));
  expect(html).toContain('role="status"');
  expect(html).toContain('aria-live="polite"');
  expect(html).not.toContain('Note “date-format” saved');
 });
});
