import {expect,it} from 'vitest';
import {PIN_LIMIT,emptySlots,slotLabels,transitionSlots,type PreviewSlots} from '../apps/web/src/files/pinned-previews.ts';

const entry=(path:string,kind='file')=>({name:path.split('/').pop()!,path,kind});
const open=(state:PreviewSlots,path:string)=>transitionSlots(state,{kind:'open',entry:entry(path)}).state;

it('open: pinned activates without duplicating, unpinned replaces transient, same active refreshes',()=>{
 let state=open(emptySlots(),'a.ts');
 expect(state).toEqual({pins:[],transient:entry('a.ts'),activePath:'a.ts'});
 state=transitionSlots(state,{kind:'pin',entry:entry('a.ts')}).state;
 state=open(state,'b.ts');
 expect(state.pins).toEqual([entry('a.ts')]);expect(state.transient).toEqual(entry('b.ts'));
 const again=open(state,'a.ts');
 expect(again.activePath).toBe('a.ts');expect(again.pins).toHaveLength(1);
 expect(transitionSlots(again,{kind:'open',entry:entry('a.ts')}).refresh).toBe(true);
});

it('pin: appends in order, clears transient slot, rejects the seventh without eviction',()=>{
 let state=emptySlots();
 for(const path of ['1','2','3','4','5','6']){state=open(state,path+'.ts');state=transitionSlots(state,{kind:'pin',entry:entry(path+'.ts')}).state;}
 expect(state.pins).toHaveLength(PIN_LIMIT);
 state=open(state,'seven.ts');
 const seventh=transitionSlots(state,{kind:'pin',entry:entry('seven.ts')});
 expect(seventh.capped).toBe(true);expect(seventh.state.pins).toHaveLength(PIN_LIMIT);expect(seventh.state.transient).toEqual(entry('seven.ts'));
 const duplicate=transitionSlots(seventh.state,{kind:'pin',entry:entry('1.ts')});
 expect(duplicate.capped).toBe(false);expect(duplicate.state.pins).toHaveLength(PIN_LIMIT);
});

it('unpin: inactive keeps active; active demotes to transient and stays active',()=>{
 let state=open(emptySlots(),'a.ts');state=transitionSlots(state,{kind:'pin',entry:entry('a.ts')}).state;
 state=open(state,'b.ts');state=transitionSlots(state,{kind:'pin',entry:entry('b.ts')}).state;
 const inactive=transitionSlots(state,{kind:'unpin',path:'a.ts'});
 expect(inactive.state.activePath).toBe('b.ts');expect(inactive.state.transient).toBeNull();expect(inactive.state.pins).toEqual([entry('b.ts')]);
 const active=transitionSlots(state,{kind:'unpin',path:'b.ts'});
 expect(active.state.activePath).toBe('b.ts');expect(active.state.transient).toEqual(entry('b.ts'));
 expect(active.refresh).toBe(false);expect(inactive.refresh).toBe(false);
});

it('close: inactive preserves active; active pin picks next, then previous, then transient',()=>{
 let state=emptySlots();
 for(const path of ['a','b','c']){state=open(state,path+'.ts');state=transitionSlots(state,{kind:'pin',entry:entry(path+'.ts')}).state;}
 state=open(state,'t.ts');
 // close inactive transient keeps active
 state=open(state,'a.ts');
 const inactive=transitionSlots(state,{kind:'close',path:'t.ts'});
 expect(inactive.state.activePath).toBe('a.ts');expect(inactive.state.transient).toBeNull();
 // close active a.ts (index 0) → next pin b.ts
 const next=transitionSlots(state,{kind:'close',path:'a.ts'});
 expect(next.state.activePath).toBe('b.ts');expect(next.refresh).toBe(true);
 // close active b.ts (index 0 of remaining) → next c.ts
 const again=transitionSlots(next.state,{kind:'close',path:'b.ts'});
 expect(again.state.activePath).toBe('c.ts');
 // close active c.ts (last) → transient t2.ts
 const withT=open(again.state,'t2.ts'),last=transitionSlots(withT,{kind:'close',path:'c.ts'});
 expect(last.state.activePath).toBe('t2.ts');
 // close active transient → last pin
 const pinsOnly=transitionSlots(withT,{kind:'close',path:'t2.ts'});
 expect(pinsOnly.state.activePath).toBe('c.ts');
 // closing final item empties state
 const finalOne=transitionSlots({pins:[],transient:entry('x.ts'),activePath:'x.ts'},{kind:'close',path:'x.ts'});
 expect(finalOne.state).toEqual(emptySlots());expect(finalOne.focus).toEqual({kind:'empty'});
});

it('directory clears transient and active but keeps pins; reset empties everything',()=>{
 let state=open(emptySlots(),'a.ts');state=transitionSlots(state,{kind:'pin',entry:entry('a.ts')}).state;state=open(state,'b.ts');
 const dir=transitionSlots(state,{kind:'directory'});
 expect(dir.state).toEqual({pins:[entry('a.ts')],transient:null,activePath:null});
 expect(transitionSlots(state,{kind:'reset'}).state).toEqual(emptySlots());
});

it('close focuses the surviving slot at the same index, else previous, else empty',()=>{
 let state=emptySlots();
 for(const path of ['a','b','c']){state=open(state,path+'.ts');state=transitionSlots(state,{kind:'pin',entry:entry(path+'.ts')}).state;}
 expect(transitionSlots(state,{kind:'close',path:'a.ts'}).focus).toEqual({kind:'select',index:0});
 expect(transitionSlots(state,{kind:'close',path:'c.ts'}).focus).toEqual({kind:'select',index:1});
 const middle=transitionSlots(state,{kind:'close',path:'b.ts'});
 expect(middle.focus).toEqual({kind:'select',index:1});
});

it('labels: duplicate basenames gain parent path, root parent is ".", raw path stays the key',()=>{
 const items:{entry:ReturnType<typeof entry>;pinned:boolean}[]=[];
 let state=emptySlots();
 for(const path of ['src/a.ts','lib/a.ts','b.ts']){state=open(state,path);state=transitionSlots(state,{kind:'pin',entry:entry(path)}).state;items.length;}
 const labels=slotLabels(state);
 expect(labels.get('src/a.ts')).toEqual({primary:'a.ts',parent:'src',full:'a.ts · src'});
 expect(labels.get('lib/a.ts')).toEqual({primary:'a.ts',parent:'lib',full:'a.ts · lib'});
 expect(labels.get('b.ts')).toEqual({primary:'b.ts',parent:null,full:'b.ts'});
 const rootDup=transitionSlots(state,{kind:'open',entry:entry('a.ts')}).state;
 expect(slotLabels(rootDup).get('a.ts')?.parent).toBe('.');
});

it('unknown or malformed targets no-op safely',()=>{
 const state=open(emptySlots(),'a.ts');
 expect(transitionSlots(state,{kind:'unpin',path:'missing.ts'}).state).toBe(state);
 expect(transitionSlots(state,{kind:'close',path:'missing.ts'}).state).toBe(state);
 expect(transitionSlots(state,{kind:'pin',entry:entry('other.ts')}).state).toBe(state);
});
