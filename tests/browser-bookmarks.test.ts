import {describe,expect,it} from 'vitest';
import {addBookmark,BOOKMARK_LIMIT,normalizeBookmarkUrl,parseBookmarkStore,removeBookmark,restoreBookmark,serializeBookmarkStore,updateBookmark} from '../apps/desktop/browser-bookmarks.ts';
import type {DesktopBrowserBookmark} from '../packages/desktop-contract/index.ts';

const id=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const mark=(n:number,url=`https://example.org/p${n}`):DesktopBrowserBookmark=>({id:id(n),url,title:`Page ${n}`,createdAt:`2026-11-21T22:${String(n).padStart(2,'0')}:00.000Z`,updatedAt:`2026-11-21T22:${String(n).padStart(2,'0')}:00.000Z`});

describe('browser bookmark store',()=>{
 it('normalizes saved urls and keeps query/fragment only on request',()=>{
  expect(normalizeBookmarkUrl('https://docs.example.com/guide?tab=api#install',false)).toBe('https://docs.example.com/guide');
  expect(normalizeBookmarkUrl('https://docs.example.com/guide?tab=api#install',true)).toBe('https://docs.example.com/guide?tab=api#install');
  expect(normalizeBookmarkUrl('https://bücher.example.org/x',false)).toContain('xn--');
 });
 it('rejects credentials, private or non-http pages and oversize urls',()=>{
  for(const raw of ['https://user:pw@example.com/','http://127.0.0.1/','http://10.0.0.5/','file:///etc/hosts','javascript:alert(1)','about:blank',`https://example.org/${'a'.repeat(2049)}`])expect(normalizeBookmarkUrl(raw,true)).toBeNull();
 });
 it('adds newest first, detects duplicates and enforces the limit',()=>{
  let items=addBookmark([],{url:'https://example.org/a',title:' A ',now:'2026-11-21T22:00:00.000Z',id:id(1)});
  expect(items).toHaveLength(1);expect((items as DesktopBrowserBookmark[])[0]!.title).toBe('A');
  expect(addBookmark(items as DesktopBrowserBookmark[],{url:'https://example.org/a',title:'A',now:'2026-11-21T22:01:00.000Z',id:id(2)})).toBe('duplicate');
  const full=Array.from({length:BOOKMARK_LIMIT},(_,n)=>mark(n));
  expect(addBookmark(full,{url:'https://example.org/new',title:'New',now:'2026-11-21T23:00:00.000Z',id:id(999)})).toBe('limit');
  expect(addBookmark(items as DesktopBrowserBookmark[],{url:'https://example.org/b',title:'',now:'2026-11-21T22:01:00.000Z',id:id(2)})).toBe('invalid');
 });
 it('updates titles and urls with duplicate protection',()=>{
  const items=[mark(1),mark(2)];
  expect(updateBookmark(items,id(1),{title:' Renamed ',now:'2026-11-21T23:00:00.000Z'})).toMatchObject([{title:'Renamed'},{title:'Page 2'}]);
  expect(updateBookmark(items,id(1),{url:'https://example.org/p2',now:'2026-11-21T23:00:00.000Z'})).toBe('duplicate');
  expect(updateBookmark(items,id(9),{title:'x',now:'2026-11-21T23:00:00.000Z'})).toBe('missing');
  expect(updateBookmark(items,id(1),{title:'  ',now:'2026-11-21T23:00:00.000Z'})).toBe('invalid');
 });
 it('removes and restores records preserving id and createdAt',()=>{
  const items=[mark(1),mark(2)];
  expect(removeBookmark(items,id(1))).toEqual([mark(2)]);
  expect(removeBookmark(items,id(9))).toBe('missing');
  const restored=restoreBookmark([mark(2)],mark(1));
  expect(restored).toEqual([mark(2),mark(1)]);
  expect(restoreBookmark([mark(2)],{...mark(3),url:'http://127.0.0.1/'})).toBe('invalid');
  expect(restoreBookmark(Array.from({length:BOOKMARK_LIMIT},(_,n)=>mark(n+10)),mark(1,'https://other.example.org/'))).toBe('limit');
 });
 it('parses stores, drops invalid entries and keeps the newest duplicate',()=>{
  const older=mark(1,'https://dup.example.org/'),newer={...mark(2,'https://dup.example.org/'),createdAt:'2026-11-22T00:00:00.000Z'};
  const text=JSON.stringify({version:1,bookmarks:[older,newer,{id:'x',url:'bad',title:'',createdAt:'',updatedAt:''},mark(3)]});
  const parsed=parseBookmarkStore(text);
  expect(parsed).toMatchObject({dropped:2});
  expect((parsed as {items:DesktopBrowserBookmark[]}).items.map(item=>item.id)).toEqual([newer.id,id(3)]);
  expect(parseBookmarkStore('not json')).toEqual({invalid:true});
  expect(parseBookmarkStore(JSON.stringify({version:2,bookmarks:[]}))).toEqual({invalid:true});
  expect(parseBookmarkStore(JSON.stringify({version:1,bookmarks:'x'}))).toEqual({invalid:true});
 });
 it('serializes a version-1 store',()=>{
  expect(JSON.parse(serializeBookmarkStore([mark(1)]))).toEqual({version:1,bookmarks:[mark(1)]});
 });
});
