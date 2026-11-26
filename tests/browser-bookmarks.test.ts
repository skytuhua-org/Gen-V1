import {describe,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {dirname} from 'node:path';
import ts from 'typescript';
import {parseBrowserCommand} from '../apps/desktop/window-policy.ts';
import {createPersistenceQueue} from '../apps/desktop/persistence.ts';
import {addBookmark,BOOKMARK_LIMIT,normalizeBookmarkUrl,parseBookmarkStore,removeBookmark,restoreBookmark,serializeBookmarkStore,updateBookmark} from '../apps/desktop/browser-bookmarks.ts';
import type {DesktopBrowserBookmark,DesktopBrowserCommand} from '../packages/desktop-contract/index.ts';

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

function deferred(){let release!:()=>void;const promise=new Promise<void>(resolve=>{release=resolve;});return{promise,release};}

/** Executes the registered production callback and store functions, with only
 * filesystem and native window edges replaced by bounded synthetic fixtures. */
function hostFixture(initial:DesktopBrowserBookmark[]=[mark(1)],text=serializeBookmarkStore(initial)){
 const source=ts.createSourceFile('main.ts',readFileSync(new URL('../apps/desktop/main.ts',import.meta.url),'utf8'),ts.ScriptTarget.Latest);
 let callback:ts.Node|undefined;
 const functions=new Map<string,string>();
 const visit=(node:ts.Node)=>{
  if(ts.isFunctionDeclaration(node)&&node.name&&['writeBookmarks','loadBookmarks'].includes(node.name.text))functions.set(node.name.text,node.getText(source));
  if(ts.isCallExpression(node)&&node.expression.getText(source)==='handle'&&node.arguments[0]?.getText(source)==='channels.browser')callback=node.arguments[1];
  ts.forEachChild(node,visit);
 };
 visit(source);
 if(!callback||functions.size!==2)throw Error('Bookmark host functions were not found');
 const io={mkdir:vi.fn(async()=>{}),writeFile:vi.fn(async(_path:string,_body:string,_options:unknown)=>{}),rename:vi.fn(async(_from:string,_to:string)=>{}),readFile:vi.fn(async()=>text),stat:vi.fn(async()=>({size:Buffer.byteLength(text,'utf8')}))};
 const persistence=createPersistenceQueue();
 const bindings={...io,persistence,dirname,existsSync:()=>true,parseBrowserCommand,normalizeBookmarkUrl,parseBookmarkStore,serializeBookmarkStore,addBookmark,updateBookmark,removeBookmark,restoreBookmark,BOOKMARK_LIMIT,BOOKMARK_STORE_MAX_BYTES:256*1024,randomUUID:()=>id(999),initial};
 const script=`let bookmarks=initial,bookmarkRevision=0,bookmarkNotice;const bookmarkFile='/synthetic/browser-bookmarks.json';const broadcasts=[];function broadcast(){broadcasts.push({items:[...bookmarks],revision:bookmarkRevision,notice:bookmarkNotice});}${[...functions.values()].join('\n')}\nconst invoke=${callback.getText(source)};return {invoke,load:loadBookmarks,state:()=>({items:bookmarks,revision:bookmarkRevision,notice:bookmarkNotice}),broadcasts};`;
 const compiled=ts.transpileModule(`function fixture(){${script}}`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
 const actual=new Function(...Object.keys(bindings),compiled+'\nreturn fixture();')(...Object.values(bindings)) as {invoke:(record:unknown,command:DesktopBrowserCommand)=>Promise<void>;load:()=>Promise<void>;state:()=>{items:DesktopBrowserBookmark[];revision:number;notice?:string};broadcasts:{items:DesktopBrowserBookmark[];revision:number;notice?:string}[]};
 let url='https://example.org/new';
 const record={id:'window-a',surface:{kind:'main'},dockedBrowser:{state:{title:'New page'},view:{webContents:{isDestroyed:()=>false,getURL:()=>url}}}};
 return {...actual,io,persistence,invoke:(command:DesktopBrowserCommand)=>actual.invoke(record,command),page:(next:string)=>{url=next;}};
}

describe('bookmark host persistence contract',()=>{
 for(const phase of ['mkdir','writeFile','rename'] as const)it(`rejects ${phase} failure without committing memory or revision`,async()=>{
  const initial=[mark(1)],f=hostFixture(initial);
  f.io[phase].mockRejectedValueOnce(Error('Synthetic write failure'));
  await expect(f.invoke({type:'bookmark-update',id:id(1),title:'Changed'})).rejects.toThrow();
  await f.persistence.flush().catch(()=>{});
  expect(f.state().items).toEqual(initial);expect(f.state().revision).toBe(0);
  expect(f.broadcasts.every(state=>state.revision===0&&state.items[0]?.title==='Page 1')).toBe(true);
 });
 it('keeps the IPC request and visible state pending until rename commits',async()=>{
  const held=deferred(),f=hostFixture();let settled=false;
  f.io.rename.mockImplementationOnce(async()=>held.promise);
  const pending=f.invoke({type:'bookmark-add'}).then(()=>{settled=true;});
  try{
   await vi.waitFor(()=>expect(f.io.rename).toHaveBeenCalledOnce());
   expect(settled).toBe(false);expect(f.state().items).toEqual([mark(1)]);expect(f.state().revision).toBe(0);expect(f.broadcasts).toHaveLength(0);
  }finally{held.release();await pending;}
  expect(f.state().items.map(item=>item.url)).toEqual(['https://example.org/new',mark(1).url]);expect(f.state().revision).toBe(1);
  expect(JSON.parse(f.io.writeFile.mock.calls[0]![1]).bookmarks).toEqual(f.state().items);
  expect(f.io.writeFile.mock.calls[0]![2]).toMatchObject({encoding:'utf8',mode:0o600});
 });
 it('serializes read-modify-write after a failed earlier mutation',async()=>{
  const held=deferred(),f=hostFixture();
  f.io.rename.mockImplementationOnce(async()=>{await held.promise;throw Error('Synthetic rename failure');});
  f.page('https://example.org/first');
  const first=f.invoke({type:'bookmark-add'}).then(()=>true,()=>false);
  await vi.waitFor(()=>expect(f.io.rename).toHaveBeenCalledOnce());
  f.page('https://example.org/second');
  const second=f.invoke({type:'bookmark-add'}).then(()=>true,()=>false);
  held.release();expect(await first).toBe(false);expect(await second).toBe(true);await f.persistence.flush();
  expect(f.state().items.map(item=>item.url)).toEqual(['https://example.org/second',mark(1).url]);expect(f.state().revision).toBe(1);
  expect(JSON.parse(f.io.writeFile.mock.calls.at(-1)![1]).bookmarks).toEqual(f.state().items);
 });
 it('does not replace an unrelated saved URL when keep-query accompanies rename',async()=>{
  const f=hostFixture();f.page('https://unrelated.example/other?q=1#section');
  await f.invoke({type:'bookmark-update',id:id(1),title:'Renamed',keepQuery:true});await f.persistence.flush();
  expect(f.state().items[0]).toMatchObject({title:'Renamed',url:mark(1).url});
 });
 it('never acknowledges a save that would exceed the startup storage bound',async()=>{
  const initial:DesktopBrowserBookmark[]=[];let overflow:DesktopBrowserBookmark|undefined;
  for(let n=1;n<=200;n++){
   const base=`https://example.org/${n}/`,item={...mark(n),url:base+'a'.repeat(2048-base.length),title:'x'.repeat(120),createdAt:'2026-01-01T00:00:00.000Z',updatedAt:'2026-01-01T00:00:00.000Z'};
   if(Buffer.byteLength(serializeBookmarkStore([...initial,item]),'utf8')>256*1024){overflow=item;break;}
   initial.push(item);
  }
  expect(overflow).toBeDefined();expect(initial.length).toBeLessThan(200);
  const f=hostFixture(initial);
  await expect(f.invoke({type:'bookmark-restore',bookmark:overflow!})).rejects.toThrow();
  expect(f.state().items).toEqual(initial);expect(f.state().revision).toBe(0);expect(f.io.writeFile).not.toHaveBeenCalled();
 });
 it('uses query and fragment from the matching current page',async()=>{
  const f=hostFixture();f.page(mark(1).url+'?q=1#section');
  await f.invoke({type:'bookmark-update',id:id(1),keepQuery:true});await f.persistence.flush();
  expect(f.state().items[0]?.url).toBe(mark(1).url+'?q=1#section');
 });
 for(const grew of [false,true])it(`rejects a UTF-8 store above256KiB${grew?' even when it grew after stat':''}`,async()=>{
  const text=JSON.stringify({version:1,bookmarks:[mark(1)],padding:'界'.repeat(90_000)}),f=hostFixture([],text);
  expect(text.length).toBeLessThan(256*1024);expect(Buffer.byteLength(text,'utf8')).toBeGreaterThan(256*1024);
  if(grew)f.io.stat.mockResolvedValueOnce({size:1});
  await f.load();expect(f.state().items).toEqual([]);expect(f.state().notice).toContain('could not be read');
  expect(f.io.rename).toHaveBeenCalledWith('/synthetic/browser-bookmarks.json',expect.stringMatching(/\.invalid-.*\.json$/));
  if(!grew)expect(f.io.readFile).not.toHaveBeenCalled();
 });
});

describe('loaded bookmark invariants',()=>{
 it('retains at most200 valid newest records and reports dropped entries',()=>{
  const records=Array.from({length:201},(_,n)=>({...mark(n),createdAt:new Date(Date.UTC(2026,0,1,0,0,n)).toISOString(),updatedAt:'2026-01-02T00:00:00.000Z'}));
  const parsed=parseBookmarkStore(serializeBookmarkStore(records));
  expect(parsed).toMatchObject({dropped:1});if('invalid' in parsed)throw Error('Unexpected invalid file');
  expect(parsed.items).toHaveLength(200);expect(parsed.items.map(item=>item.id)).toEqual(records.slice(1).reverse().map(item=>item.id));
 });
 it('does not admit duplicate row identities or blank titles from disk',()=>{
  const older=mark(1),newer={...mark(2),id:older.id};
  const parsed=parseBookmarkStore(serializeBookmarkStore([older,newer,{...mark(3),title:'   '}]));
  expect(parsed).toEqual({items:[newer],dropped:2});
 });
});
