import {beforeEach,expect,it,vi} from 'vitest';
import type {Snapshot} from '../packages/contracts/index.ts';
import type {JournalRecord} from '../apps/web/src/journal.ts';
const journal=vi.hoisted(()=>({entries:vi.fn(),read:vi.fn(),save:vi.fn(),saveMany:vi.fn()}));
vi.mock('../apps/web/src/journal',()=>({journalEntries:journal.entries,journalReadRecord:journal.read,journalCompareAndSwap:journal.save,journalCompareAndSwapMany:journal.saveMany}));
vi.mock('../apps/web/src/signature-assets',()=>({hasPendingDocumentAssets:()=>false}));
import {exportDraftTransfer,importDraftTransfer} from '../apps/web/src/draft-transfer.ts';

const snapshot={threads:[],userStates:[],requests:[],skills:[{name:'verify-release',revision:3}]} as unknown as Snapshot;
const draft={content:'Keep this unfinished procedure.',description:'Verify a release.',baseRevision:3};
const entry=(key='skill-draft:verify-release',value:unknown=draft)=>({key,record:{value,generation:'browser-draft',updatedAt:1} satisfies JournalRecord});
const backup=(entries:ReturnType<typeof entry>[])=>JSON.stringify({app:'generative-harness-drafts',version:1,entries});
beforeEach(()=>{vi.clearAllMocks();journal.entries.mockResolvedValue([]);journal.read.mockResolvedValue(undefined);journal.save.mockResolvedValue(true);journal.saveMany.mockResolvedValue(true);});

it('exports skill drafts, including stale drafts, without exporting unrelated journal state',async()=>{
 const rows=[entry(),entry('skill-draft:verify-release',{...draft,baseRevision:2}),entry('private:account-token','private')];journal.entries.mockResolvedValue(rows);
 expect(JSON.parse(await exportDraftTransfer(snapshot)).entries).toEqual(rows.slice(0,2));expect(journal.save).not.toHaveBeenCalled();
});
it('imports a compatible skill draft through the existing compare-and-swap journal',async()=>{
 expect(await importDraftTransfer(backup([entry()]),snapshot)).toEqual([{key:'skill-draft:verify-release',status:'imported'}]);
 expect(journal.save).toHaveBeenCalledWith('skill-draft:verify-release',undefined,draft);
});
it('blocks unknown skills, stale revisions and malformed skill drafts',async()=>{
 const cases=[entry('skill-draft:missing'),entry(undefined,{...draft,baseRevision:2}),entry(undefined,{...draft,baseRevision:-1}),entry(undefined,{...draft,baseRevision:3.5}),entry(undefined,{...draft,content:[]}),entry(undefined,{...draft,description:42})];
 for(const row of cases){const [result]=await importDraftTransfer(backup([row]),snapshot);expect(result.status).toBe('blocked');}
 expect(journal.save).not.toHaveBeenCalled();
});
it('retains local skill drafts and edits arriving during import',async()=>{
 journal.read.mockResolvedValueOnce({value:{...draft,content:'New local edit.'},generation:'new',updatedAt:2});
 expect((await importDraftTransfer(backup([entry()]),snapshot))[0].status).toBe('retained');expect(journal.save).not.toHaveBeenCalled();
 journal.save.mockResolvedValueOnce(false);expect((await importDraftTransfer(backup([entry()]),snapshot))[0]).toMatchObject({status:'retained',reason:'A local edit arrived during import'});
});

it('exports and imports pasted-text drafts beside their conversation draft',async()=>{
 const pastes=[{version:1,id:'11111111-1111-4111-8111-111111111111',createdAt:'2026-01-01T00:00:00.000Z',text:'long pasted body'}];
 const rows=[entry('draft:thread-1','draft text'),entry('draft-pastes:thread-1',pastes)];journal.entries.mockResolvedValue(rows);
 const snap={threads:[{id:'thread-1'}],userStates:[],requests:[],skills:[]} as unknown as Snapshot;
 expect(JSON.parse(await exportDraftTransfer(snap)).entries.map((row:{key:string})=>row.key)).toEqual(['draft:thread-1','draft-pastes:thread-1']);
 expect(await importDraftTransfer(backup(rows),snap)).toEqual([{key:'draft:thread-1',status:'imported'},{key:'draft-pastes:thread-1',status:'imported'}]);
 expect(journal.saveMany).toHaveBeenCalledWith([{key:'draft:thread-1',generation:undefined,value:'draft text'},{key:'draft-pastes:thread-1',generation:undefined,value:pastes}],[]);
});
it('retains backup pasted-text drafts when the local prompt text is kept',async()=>{
 const pastes=[{version:1,id:'11111111-1111-4111-8111-111111111111',createdAt:'2026-01-01T00:00:00.000Z',text:'backup chips'}];
 journal.read.mockImplementation(async (key:string)=>key==='draft:thread-1'?{value:'local draft',generation:'g'}:undefined);
 const snap={threads:[{id:'thread-1'}],userStates:[],requests:[],skills:[]} as unknown as Snapshot;
 const rows=[entry('draft:thread-1','backup draft'),entry('draft-pastes:thread-1',pastes)];
 const results=await importDraftTransfer(backup(rows),snap);
 expect(results).toEqual([{key:'draft:thread-1',status:'retained',reason:'A local entry already exists; it was not replaced'},{key:'draft-pastes:thread-1',status:'retained',reason:'A local entry already exists; it was not replaced'}]);
 expect(journal.save).not.toHaveBeenCalled();expect(journal.saveMany).not.toHaveBeenCalled();
});
it('blocks malformed pasted-text drafts on import and skips ones for unavailable conversations',async()=>{
 const snap={threads:[],userStates:[],requests:[],skills:[]} as unknown as Snapshot;
 expect((await importDraftTransfer(backup([entry('draft-pastes:gone',[{version:1,id:'x',createdAt:'',text:'t'}])]),snap))[0].status).toBe('blocked');
 expect((await importDraftTransfer(backup([entry('draft-pastes:thread-1','not-an-array')]),snap))[0].status).toBe('blocked');
 expect(JSON.parse(await exportDraftTransfer(snap)).entries).toEqual([]);
 journal.entries.mockResolvedValue([entry('draft-pastes:gone',[{version:1,id:'11111111-1111-4111-8111-111111111111',createdAt:'2026-01-01T00:00:00.000Z',text:'t'}])]);
 expect(JSON.parse(await exportDraftTransfer(snap)).entries).toEqual([]);
});

const sourceEntry=()=>entry('source-context:thread-1::',{draftId:'draft-1',logicalOwner:{threadId:'thread-1',projectId:null,workspaceId:null},revision:0,sourceRefs:[],sendMode:'NOW',conflictState:'NONE'});
const pasteEntry=()=>entry('draft-pastes:thread-1',[{version:1,id:'11111111-1111-4111-8111-111111111111',createdAt:'2026-01-01T00:00:00.000Z',text:'retained pasted body'}]);
const threadRefs={threads:[{id:'thread-1'}],userStates:[],requests:[],skills:[]};
function memoryJournal(initial:ReturnType<typeof entry>[]=[]){
 const values=new Map(initial.map(row=>[row.key,row.record]));
 journal.entries.mockImplementation(async()=>[...values].map(([key,record])=>({key,record})));
 journal.read.mockImplementation(async(key:string)=>values.get(key));
 journal.saveMany.mockImplementation(async(writes:{key:string;generation?:string;value:unknown}[],guards:{key:string;generation?:string}[])=>{
  if([...writes,...guards].some(row=>values.get(row.key)?.generation!==row.generation))return false;
  for(const row of writes)values.set(row.key,{value:row.value,generation:'written-'+row.key,updatedAt:2});
  return true;
 });
 return values;
}
it('imports source context, prompt and pasted text as one complete draft',async()=>{
 const values=memoryJournal(),rows=[entry('draft:thread-1','prompt'),sourceEntry(),pasteEntry()];
 const result=await importDraftTransfer(backup(rows),threadRefs);
 expect(result.map(row=>row.status)).toEqual(['imported','imported','imported']);
 expect(values.get('draft-pastes:thread-1')?.value).toEqual(pasteEntry().record.value);
 expect(journal.saveMany).toHaveBeenCalledTimes(1);
 expect(journal.saveMany.mock.calls[0][0].map((row:{key:string})=>row.key).sort()).toEqual(rows.map(row=>row.key).sort());
});
it('does not partially import a source bundle with an invalid pasted-text companion',async()=>{
 const values=memoryJournal(),rows=[entry('draft:thread-1','prompt'),sourceEntry(),entry('draft-pastes:thread-1','invalid')];
 const result=await importDraftTransfer(backup(rows),threadRefs);
 expect(result.every(row=>row.status==='blocked')).toBe(true);
 expect(values.size).toBe(0);
 expect(journal.saveMany).not.toHaveBeenCalled();
});
it.each([false,true])('retains a local paste-only draft when importing text (with source context: %s)',async(withSource)=>{
 const local=pasteEntry(),values=memoryJournal([local]);
 const rows=[entry('draft:thread-1','backup prompt'),...(withSource?[sourceEntry()]:[])];
 const result=await importDraftTransfer(backup(rows),threadRefs);
 expect(result.every(row=>row.status==='retained')).toBe(true);
 expect(values.get(local.key)).toEqual(local.record);
 expect(values.has('draft:thread-1')).toBe(false);
 expect(journal.save).not.toHaveBeenCalled();
 expect(journal.saveMany).not.toHaveBeenCalled();
});
it('retains a local text-only draft when importing pasted text',async()=>{
 const local=entry('draft:thread-1','local prompt'),values=memoryJournal([local]);
 expect((await importDraftTransfer(backup([pasteEntry()]),threadRefs))[0].status).toBe('retained');
 expect(values.get(local.key)).toEqual(local.record);
 expect(values.has('draft-pastes:thread-1')).toBe(false);
 expect(journal.saveMany).not.toHaveBeenCalled();
});
it.each([false,true])('retains the whole import when an omitted paste companion arrives during CAS (source context: %s)',async(withSource)=>{
 const values=memoryJournal(),commit=journal.saveMany.getMockImplementation()!;
 journal.saveMany.mockImplementationOnce(async(writes,guards)=>{
  const local=pasteEntry();values.set(local.key,local.record);
  return commit(writes,guards);
 });
 const rows=[entry('draft:thread-1','backup prompt'),...(withSource?[sourceEntry()]:[])];
 expect((await importDraftTransfer(backup(rows),threadRefs)).every(row=>row.status==='retained')).toBe(true);
 expect(values.has('draft:thread-1')).toBe(false);
 expect(values.has(sourceEntry().key)).toBe(false);
 expect(values.get(pasteEntry().key)).toEqual(pasteEntry().record);
});
it('blocks pasted text alongside an invalid source companion without importing any part',async()=>{
 const values=memoryJournal();
 const rows=[entry('draft:thread-1','prompt'),entry(sourceEntry().key,{invalid:true}),pasteEntry()];
 expect((await importDraftTransfer(backup(rows),threadRefs)).every(row=>row.status==='blocked')).toBe(true);
 expect(values.size).toBe(0);
 expect(journal.saveMany).not.toHaveBeenCalled();
});
