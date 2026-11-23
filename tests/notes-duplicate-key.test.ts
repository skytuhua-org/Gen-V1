import {expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {NoteKeyTaken,noteKeyTaken} from '../apps/web/src/TaskMemory.tsx';

it('flags an existing key and ignores new or empty keys',()=>{
  const keys=new Set(['date-format','release']);
  expect(noteKeyTaken('date-format',keys)).toBe(true);
  expect(noteKeyTaken('release',keys)).toBe(true);
  expect(noteKeyTaken('new-key',keys)).toBe(false);
  expect(noteKeyTaken('',keys)).toBe(false);
  expect(noteKeyTaken('Date-format',keys)).toBe(false);
});

it('renders the key-specific alert and the Edit existing note recovery action',()=>{
  const markup=renderToStaticMarkup(createElement(NoteKeyTaken,{id:'taken',noteKey:'date-format',onEdit:()=>{}}));
  expect(markup).toContain('role="alert"');
  expect(markup).toContain('id="taken"');
  expect(markup).toContain('A note named “date-format” already exists.');
  expect(markup).toContain('Edit existing note');
  expect(markup).toContain('class="secondary"');
});
