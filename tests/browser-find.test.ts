import {describe,expect,it} from 'vitest';
import {createBrowserFind,type BrowserFindNative} from '../apps/desktop/browser-find.ts';
import {parseBrowserCommand} from '../apps/desktop/window-policy.ts';
import {DESKTOP_BROWSER_FIND_QUERY_LIMIT,type DesktopBrowserFindState} from '../packages/desktop-contract/index.ts';

const harness=()=>{
 const calls:{text:string;findNext:boolean;forward:boolean}[]=[],stops:string[]=[];
 let nextId=-1,throwOn=false,live=true;
 const states:DesktopBrowserFindState[]=[];
 const native:BrowserFindNative={
  findInPage(text,options){if(throwOn)throw Error('synthetic find failure');calls.push({text,...options});return ++nextId;},
  stopFindInPage(action){stops.push(action);},
 };
 const find=createBrowserFind(native,()=>live,state=>states.push(state));
 const last=()=>states.at(-1)!;
 return{calls,stops,states,last,find,setThrow:(value:boolean)=>{throwOn=value;},kill:()=>{live=false;},request:()=>nextId};
};

describe('browser find contract parsing',()=>{
 it('admits each find command and rejects malformed or oversized payloads',()=>{
  expect(parseBrowserCommand({type:'find-open'})).toEqual({type:'find-open'});
  expect(parseBrowserCommand({type:'find-next'})).toEqual({type:'find-next'});
  expect(parseBrowserCommand({type:'find-prev'})).toEqual({type:'find-prev'});
  expect(parseBrowserCommand({type:'find-close'})).toEqual({type:'find-close'});
  expect(parseBrowserCommand({type:'find-query',query:'needle'})).toEqual({type:'find-query',query:'needle'});
  expect(parseBrowserCommand({type:'find-query',query:'x'.repeat(DESKTOP_BROWSER_FIND_QUERY_LIMIT)})).toEqual({type:'find-query',query:'x'.repeat(DESKTOP_BROWSER_FIND_QUERY_LIMIT)});
  for(const value of [
   {type:'find-query'},
   {type:'find-query',query:7},
   {type:'find-query',query:'x'.repeat(DESKTOP_BROWSER_FIND_QUERY_LIMIT+1)},
   {type:'find-query',query:'a',extra:true},
   {type:'find-open',query:'a'},
   {type:'find-next',forward:true},
   {type:'executeJavaScript',code:'findInPage("x")'},
  ])expect(()=>parseBrowserCommand(value)).toThrow();
 });
});

describe('browser find controller',()=>{
 it('opens, keeps the prior query and requests selection again on reopen',()=>{
  const{find,last}=harness();
  find.open();
  expect(last().open).toBe(true);expect(last().openRequest).toBe(1);
  find.query('alpha');find.close();find.open();
  expect(last().query).toBe('alpha');expect(last().openRequest).toBe(2);
 });
 it('restores the retained query results on reopen instead of showing cleared counts',()=>{
  const{find,calls,last,request}=harness();
  find.query('needle');find.found(request(),{matches:3,activeMatchOrdinal:1,finalUpdate:true});
  find.close();find.open();
  expect(calls.at(-1)).toEqual({text:'needle',findNext:false,forward:true});
  find.found(request(),{matches:3,activeMatchOrdinal:1,finalUpdate:true});
  expect(last().matches).toBe(3);expect(last().searching).toBe(false);
 });
 it('issues a fenced literal query and reports the ordinal and total from the matching request',()=>{
  const{find,calls,last,request}=harness();
  find.query('needle');
  expect(calls).toEqual([{text:'needle',findNext:false,forward:true}]);
  find.found(999999,{matches:5,activeMatchOrdinal:5,finalUpdate:true});
  expect(last().searching).toBe(true);
  find.found(request(),{matches:3,activeMatchOrdinal:1,finalUpdate:false});
  expect(last().matches).toBe(3);expect(last().ordinal).toBe(1);expect(last().searching).toBe(true);
  find.found(request(),{matches:3,activeMatchOrdinal:1,finalUpdate:true});
  expect(last().searching).toBe(false);expect(last().matches).toBe(3);
 });
 it('cycles with findNext in both directions for the same query',()=>{
  const{find,calls}=harness();
  find.query('needle');find.next();find.previous();
  expect(calls).toEqual([{text:'needle',findNext:false,forward:true},{text:'needle',findNext:true,forward:true},{text:'needle',findNext:true,forward:false}]);
 });
 it('clears highlights and counts on an empty query without issuing a native find',()=>{
  const{find,calls,stops,last,request}=harness();
  find.query('needle');find.found(request(),{matches:2,activeMatchOrdinal:1,finalUpdate:true});
  calls.length=0;find.query('');
  expect(calls).toEqual([]);expect(stops).toEqual(['clearSelection']);
  expect(last().matches).toBe(0);expect(last().ordinal).toBe(0);expect(last().searching).toBe(false);
 });
 it('applies results for Electron request id zero, the first real request id',()=>{
  const{find,last,request}=harness();
  find.query('needle');
  expect(request()).toBe(0);
  find.found(0,{matches:4,activeMatchOrdinal:1,finalUpdate:true});
  expect(last().matches).toBe(4);expect(last().ordinal).toBe(1);expect(last().searching).toBe(false);
 });
 it('drops stale results after a newer query or a reset',()=>{
  const{find,last,request}=harness();
  find.query('one');const first=request();find.query('two');
  find.found(first,{matches:9,activeMatchOrdinal:9,finalUpdate:true});
  expect(last().searching).toBe(true);
  find.found(request(),{matches:1,activeMatchOrdinal:1,finalUpdate:true});
  expect(last().matches).toBe(1);
  find.reset();find.found(request(),{matches:4,activeMatchOrdinal:2,finalUpdate:true});
  expect(last().matches).toBe(0);expect(last().open).toBe(false);
 });
 it('clears selection and keeps the query on close, fully clearing on reset',()=>{
  const{find,stops,last,request}=harness();
  find.query('needle');find.found(request(),{matches:2,activeMatchOrdinal:1,finalUpdate:true});
  find.close();
  expect(stops).toEqual(['clearSelection']);expect(last().open).toBe(false);expect(last().query).toBe('needle');
  find.reset();
  expect(last().query).toBe('');expect(last().matches).toBe(0);
 });
 it('surfaces a recoverable error and only recovers through a new query',()=>{
  const{find,last,setThrow}=harness();
  setThrow(true);find.query('needle');
  expect(last().error).toBe('synthetic find failure');expect(last().searching).toBe(false);
  find.next();
  expect(last().error).toBe('synthetic find failure');
  setThrow(false);find.query('other');
  expect(last().error).toBeUndefined();expect(last().searching).toBe(true);
 });
 it('never activates the selection and ignores everything once the view is gone',()=>{
  const{find,calls,stops,kill,last}=harness();
  find.query('needle');kill();find.query('other');find.next();
  expect(calls.length).toBe(1);
  expect(stops.every(action=>action!=='activateSelection')).toBe(true);
  find.reset();
  expect(last().query).toBe('');
 });
});
