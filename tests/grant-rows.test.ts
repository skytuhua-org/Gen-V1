import {describe, expect, it} from 'vitest';
import {groupGrantRows} from '../apps/web/src/settings-data';

const grant=(id:string,path:string,label:string,threadId:string,threadTitle:string,writable=false)=>({id,threadId,kind:'file' as const,label,writable,path,threadTitle});

describe('groupGrantRows',()=>{
 it('merges identical resource grants across threads into one row',()=>{
  const rows=groupGrantRows([
   grant('g1','/files/agreement.pdf','agreement.pdf','t1','Sign the service agreement'),
   grant('g2','/files/agreement.pdf','agreement.pdf','t2','Catalog import'),
   grant('g3','/files/agreement.pdf','agreement.pdf','t3','Shell review'),
  ]);
  expect(rows).toHaveLength(1);
  expect(rows[0].name).toBe('agreement.pdf');
  expect(rows[0].grants.map(grant=>grant.id)).toEqual(['g1','g2','g3']);
 });
 it('keeps distinct paths as separate rows, alphabetical case-insensitive',()=>{
  const rows=groupGrantRows([
   grant('g1','/files/b.pdf','b.pdf','t1','T1'),
   grant('g2','/files/A.pdf','A.pdf','t1','T1'),
  ]);
  expect(rows.map(row=>row.name)).toEqual(['A.pdf','b.pdf']);
 });
 it('inherits writable and the first thread title for single-grant copy',()=>{
  const rows=groupGrantRows([grant('g1','/db/app.db','app.db','t9','My thread',true)]);
  expect(rows[0].writable).toBe(true);
  expect(rows[0].title).toBe('My thread');
 });
});
