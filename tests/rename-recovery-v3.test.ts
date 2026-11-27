import {cleanTempDirs,tempDir} from './fixtures/temp-dir.ts';
import {it,expect,afterEach,vi} from 'vitest';
import {writeFileSync,readFileSync,readdirSync,existsSync,mkdirSync,renameSync,symlinkSync,unlinkSync,watch} from 'node:fs';

import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {CodeIntelligence,type LanguageServerAdapter,type LspWorkspaceEdit} from '../packages/core/code-intelligence.ts';
import {renamePlanV1Schema} from '../packages/contracts/code-intelligence.ts';

const sha=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex');
const race=vi.hoisted(()=>({beforeReplace:undefined as undefined|((destination:string)=>void),beforeNative:undefined as undefined|((destination:string)=>void),failReplace:undefined as undefined|((destination:string)=>boolean)}));
vi.mock('../packages/core/file-access.ts',async importActual=>{
 const actual=await importActual<typeof import('../packages/core/file-access.ts')>();
 return {...actual,replaceOwnedFile:async(source:string,destination:string,identity:{dev:bigint;ino:bigint},sha256:string,signal:AbortSignal,expectedDestinationHash?:string,beforeNativeReplace?:(destination:string)=>void|Promise<void>)=>{
  if(race.failReplace?.(destination))throw new Error('injected native replacement failure');
  if(race.beforeReplace){const inject=race.beforeReplace;race.beforeReplace=undefined;inject(destination);}
  const inject=race.beforeNative;race.beforeNative=undefined;
  return actual.replaceOwnedFile(source,destination,identity,sha256,signal,expectedDestinationHash,inject??beforeNativeReplace);
 }};
});
const disposables:{dispose():Promise<void>}[]=[];
afterEach(async()=>{race.beforeReplace=undefined;race.beforeNative=undefined;race.failReplace=undefined;for(const d of disposables.splice(0))await d.dispose();cleanTempDirs();});

const descriptor={language:'typescript',executable:'/approved/tsserver',argv:['--stdio'],configDigest:'a'.repeat(64)};

class RenameAdapter implements LanguageServerAdapter{
 readonly serverIdentity='rename-server-1';
 readonly encoding:'UTF8'|'UTF16'|'UTF32'='UTF16';
 edit:LspWorkspaceEdit={};
 async openDocument(){}
 async changeDocument(){}
 async closeDocument(){}
 async pullDiagnostics(){return[];}
 async navigate(){return null;}
 received:{line:number;character:number}|null=null;
 async rename(_document:unknown,position:{line:number;character:number}){this.received=position;return this.edit;}
 async dispose(){}
}
class Utf8RenameAdapter extends RenameAdapter{
 readonly encoding='UTF8' as const;
}

const file=(root:string,name:string)=>join(root,name);
const uri=(path:string)=>pathToFileURL(path).href;
const signal=()=>new AbortController().signal;

function planInput(root:string,path:string,text:string,overrides:Record<string,unknown>={}){
 return{root,descriptor,profileDigest:'p'.repeat(64),path,language:'typescript',
  position:{line:0,character:7},newName:'beta2',grantedRoots:[root],
  workspaceIdentity:'ws-1',approvalId:'approval-1',signal:signal(),text,afterDigest:sha(text),...overrides};
}

it('rename plan identifiers must have the format issued by the host',()=>{
 expect(renamePlanV1Schema.safeParse({
  version:1,planId:'draft-plan',workspaceIdentity:'ws-1',serverVersion:'rename-server-1',
  sourceVersions:[],textEdits:[],expectedBeforeDigests:[],exactApprovalId:'approval-1',
 }).success).toBe(false);
});

it('rename recovery rejects an invalid plan identifier before journal lookup',async()=>{
 const journal=tempDir('rename-journal-');
 const ci=new CodeIntelligence(()=>new RenameAdapter());
 disposables.push(ci);
 await expect(ci.recoverRename({journalRoot:journal,planId:'draft-plan',grantedRoots:[],signal:signal()}))
  .rejects.toMatchObject({code:'INVALID_INPUT'});
 expect(readdirSync(journal)).toEqual([]);
});

it('rename plans reject resource operations and ungranted roots',async()=>{
 const root=tempDir('rename-root-');
 writeFileSync(file(root,'a.ts'),'const alpha = 1;\n');
 writeFileSync(file(root,'b.ts'),'const alpha = 2;\n');
 const adapter=new RenameAdapter();
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const text=readFileSync(file(root,'a.ts'),'utf8');
 // Resource operations (create/delete/move) are not a text edit — rejected.
 adapter.edit={documentChanges:[{kind:'create',uri:uri(file(root,'new.ts'))}]};
 await expect(ci.planRename(planInput(root,file(root,'a.ts'),text))).rejects.toThrowError(/resource operations/i);
 adapter.edit={documentChanges:[{kind:'rename',oldUri:uri(file(root,'a.ts')),newUri:uri(file(root,'c.ts'))}]};
 await expect(ci.planRename(planInput(root,file(root,'a.ts'),text))).rejects.toThrowError(/resource operations/i);
 // A URI outside every granted root is refused, not sanitized.
 const outside=tempDir('rename-outside-');
 writeFileSync(file(outside,'o.ts'),'const alpha = 3;\n');
 adapter.edit={changes:{[uri(file(outside,'o.ts'))]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}]}};
 await expect(ci.planRename(planInput(root,file(root,'a.ts'),text))).rejects.toThrowError(/granted roots/i);
});

it('a valid plan binds source versions and exact preimages for every target',async()=>{
 const root=tempDir('rename-root-');
 const a=file(root,'a.ts'),b=file(root,'b.ts');
 const aText='const alpha = 1;\n',bText='const alpha = 2;\n';
 writeFileSync(a,aText);writeFileSync(b,bText);
 const adapter=new RenameAdapter();
 adapter.edit={changes:{
  [uri(a)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}],
  [uri(b)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}],
 }};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const plan=await ci.planRename(planInput(root,a,aText));
 expect(renamePlanV1Schema.parse(plan)).toEqual(plan);
 expect(plan.textEdits).toHaveLength(2);
 expect(plan.expectedBeforeDigests).toEqual([
  {path:a,digest:sha(aText)},{path:b,digest:sha(bText)},
 ]);
 expect(plan.exactApprovalId).toBe('approval-1');
});

it('guarded apply writes a durable journal and backups before the first change',async()=>{
 const root=tempDir('rename-root-');
 const journal=tempDir('rename-journal-');
 const a=file(root,'a.ts'),b=file(root,'b.ts');
 const aText='const alpha = 1;\n',bText='const alpha = 2;\n';
 writeFileSync(a,aText);writeFileSync(b,bText);
 const adapter=new RenameAdapter();
 adapter.edit={changes:{
  [uri(a)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}],
  [uri(b)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}],
 }};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const plan=await ci.planRename(planInput(root,a,aText));
 // Approval must match exactly.
 await expect(ci.applyRename({plan,approvalId:'wrong',journalRoot:journal,grantedRoots:[root],signal:signal()})).rejects.toThrowError(/approval/i);
 const result=await ci.applyRename({plan,approvalId:'approval-1',journalRoot:journal,grantedRoots:[root],signal:signal()});
 expect(result.state).toBe('APPLIED');
 expect(result.entries.map(e=>e.disposition)).toEqual(['Applied','Applied']);
 expect(readFileSync(a,'utf8')).toBe('const beta2 = 1;\n');
 expect(readFileSync(b,'utf8')).toBe('const beta2 = 2;\n');
 // Journal and backups persist on disk.
 const planDir=join(journal,'code-intelligence','rename',plan.planId);
 expect(existsSync(join(planDir,'journal.json'))).toBe(true);
 const backups=readdirSync(planDir).filter(n=>n.startsWith('backup-'));
 expect(backups).toHaveLength(2);
 const recorded=JSON.parse(readFileSync(join(planDir,'journal.json'),'utf8'));
 expect(recorded.resolved).toBe(true);
});

it('a changed preimage stops apply before any write; approval is not enough',async()=>{
 const root=tempDir('rename-root-');
 const journal=tempDir('rename-journal-');
 const a=file(root,'a.ts');
 const aText='const alpha = 1;\n';
 writeFileSync(a,aText);
 const adapter=new RenameAdapter();
 adapter.edit={changes:{[uri(a)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}]}};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const plan=await ci.planRename(planInput(root,a,aText));
 writeFileSync(a,'const alpha = 99;\n'); // external change after planning
 await expect(ci.applyRename({plan,approvalId:'approval-1',journalRoot:journal,grantedRoots:[root],signal:signal()})).rejects.toThrowError(/changed before apply|PRECONDITION/i);
 expect(readFileSync(a,'utf8')).toBe('const alpha = 99;\n');
});

it('post-crash reconcile restores only paths still matching the written postimage',async()=>{
 const root=tempDir('rename-root-');
 const journal=tempDir('rename-journal-');
 const a=file(root,'a.ts'),b=file(root,'b.ts');
 const aText='const alpha = 1;\n',bText='const alpha = 2;\n';
 writeFileSync(a,aText);writeFileSync(b,bText);
 const adapter=new RenameAdapter();
 adapter.edit={changes:{
  [uri(a)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}],
  [uri(b)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}],
 }};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const plan=await ci.planRename(planInput(root,a,aText));
 await ci.applyRename({plan,approvalId:'approval-1',journalRoot:journal,grantedRoots:[root],signal:signal()});
 // Simulate a crash after writes but before journal resolution.
 const journalPath=join(journal,'code-intelligence','rename',plan.planId,'journal.json');
 const recorded=JSON.parse(readFileSync(journalPath,'utf8'));
 recorded.resolved=false;
 writeFileSync(journalPath,JSON.stringify(recorded));
 // Recovery restores both files to their preimages (bytes still match postimage).
 const recovered=await ci.recoverRename({journalRoot:journal,planId:plan.planId,grantedRoots:[root],signal:signal()});
 expect(recovered.state).toBe('RECOVERED');
 expect(recovered.entries.map(e=>e.disposition)).toEqual(['Restored','Restored']);
 expect(readFileSync(a,'utf8')).toBe(aText);
 expect(readFileSync(b,'utf8')).toBe(bText);
});

it('an external edit of a renamed file stops recovery with PARTIAL_RECOVERY_REQUIRED',async()=>{
 const root=tempDir('rename-root-');
 const journal=tempDir('rename-journal-');
 const a=file(root,'a.ts'),b=file(root,'b.ts');
 const aText='const alpha = 1;\n',bText='const alpha = 2;\n';
 writeFileSync(a,aText);writeFileSync(b,bText);
 const adapter=new RenameAdapter();
 adapter.edit={changes:{
  [uri(a)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}],
  [uri(b)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}],
 }};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const plan=await ci.planRename(planInput(root,a,aText));
 await ci.applyRename({plan,approvalId:'approval-1',journalRoot:journal,grantedRoots:[root],signal:signal()});
 const journalPath=join(journal,'code-intelligence','rename',plan.planId,'journal.json');
 const recorded=JSON.parse(readFileSync(journalPath,'utf8'));
 recorded.resolved=false;
 writeFileSync(journalPath,JSON.stringify(recorded));
 writeFileSync(a,'const beta2 = 1;\n// external edit\n'); // user changed it post-rename
 const result=await ci.recoverRename({journalRoot:journal,planId:plan.planId,grantedRoots:[root],signal:signal()});
 expect(result.state).toBe('PARTIAL_RECOVERY_REQUIRED');
 const aEntry=result.entries.find(e=>e.path===a)!;
 const bEntry=result.entries.find(e=>e.path===b)!;
 expect(aEntry.disposition).toBe('Conflict');
 expect(bEntry.disposition).toBe('Restored');
 // The external edit is never overwritten.
 expect(readFileSync(a,'utf8')).toBe('const beta2 = 1;\n// external edit\n');
 expect(readFileSync(b,'utf8')).toBe(bText);
 // Backups stay on disk for manual reconciliation.
 expect(readdirSync(join(journal,'code-intelligence','rename',plan.planId)).filter(n=>n.startsWith('backup-')).length).toBe(2);
});

it('a redirected target parent is rejected before apply stages content',async()=>{
 const root=tempDir('rename-root-');
 const outside=tempDir('rename-outside-');
 const journal=tempDir('rename-journal-');
 const directory=join(root,'linked');
 mkdirSync(directory);
 const target=join(directory,'a.ts');
 const text='const alpha = 1;\n';
 writeFileSync(target,text);
 const adapter=new RenameAdapter();
 adapter.edit={changes:{[uri(target)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}]}};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const plan=await ci.planRename(planInput(root,target,text));
 renameSync(directory,join(root,'original'));
 writeFileSync(join(outside,'a.ts'),text);
 symlinkSync(outside,directory,process.platform==='win32'?'junction':'dir');
 const staged:string[]=[];
 let watchError:Error|undefined;
 const watcher=watch(outside,(_event,filename)=>{if(filename&&String(filename).startsWith('.gen-rename-'))staged.push(String(filename));});
 watcher.on('error',error=>{watchError=error;});
 try{
  await expect(ci.applyRename({plan,approvalId:'approval-1',journalRoot:journal,grantedRoots:[root],signal:signal()})).rejects.toMatchObject({code:'CAPABILITY_DENIED'});
 }finally{watcher.close();}
 await new Promise(resolve=>setTimeout(resolve,100));
 expect(watchError).toBeUndefined();
 expect(staged).toEqual([]);
 expect(readFileSync(join(outside,'a.ts'),'utf8')).toBe(text);
 expect(readdirSync(journal)).toEqual([]);
});

it('a redirected recovery parent is rejected before restoring content',async()=>{
 const root=tempDir('rename-root-');
 const outside=tempDir('rename-outside-');
 const journal=tempDir('rename-journal-');
 const directory=join(root,'linked');
 mkdirSync(directory);
 const target=join(directory,'a.ts');
 const text='const alpha = 1;\n',postimage='const beta2 = 1;\n';
 writeFileSync(target,text);
 const adapter=new RenameAdapter();
 adapter.edit={changes:{[uri(target)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}]}};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const plan=await ci.planRename(planInput(root,target,text));
 await ci.applyRename({plan,approvalId:'approval-1',journalRoot:journal,grantedRoots:[root],signal:signal()});
 const journalPath=join(journal,'code-intelligence','rename',plan.planId,'journal.json');
 const recorded=JSON.parse(readFileSync(journalPath,'utf8'));
 recorded.resolved=false;
 writeFileSync(journalPath,JSON.stringify(recorded));
 renameSync(directory,join(root,'original'));
 writeFileSync(join(outside,'a.ts'),postimage);
 symlinkSync(outside,directory,process.platform==='win32'?'junction':'dir');
 const staged:string[]=[];
 let watchError:Error|undefined;
 const watcher=watch(outside,(_event,filename)=>{if(filename&&String(filename).startsWith('.gen-rename-'))staged.push(String(filename));});
 watcher.on('error',error=>{watchError=error;});
 try{
  await expect(ci.recoverRename({journalRoot:journal,planId:plan.planId,grantedRoots:[root],signal:signal()})).rejects.toMatchObject({code:'CAPABILITY_DENIED'});
 }finally{watcher.close();}
 await new Promise(resolve=>setTimeout(resolve,100));
 expect(watchError).toBeUndefined();
 expect(staged).toEqual([]);
 expect(readFileSync(join(outside,'a.ts'),'utf8')).toBe(postimage);
});

it('an operational replacement failure leaves recovery available for earlier writes',async()=>{
 const root=tempDir('rename-root-');
 const journal=tempDir('rename-journal-');
 const a=file(root,'a.ts'),b=file(root,'b.ts');
 const aText='const alpha = 1;\n',bText='const alpha = 2;\n';
 writeFileSync(a,aText);writeFileSync(b,bText);
 const adapter=new RenameAdapter();
 adapter.edit={changes:{
  [uri(a)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}],
  [uri(b)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}],
 }};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const plan=await ci.planRename(planInput(root,a,aText));
 race.failReplace=destination=>destination===b;
 const applied=await ci.applyRename({plan,approvalId:'approval-1',journalRoot:journal,grantedRoots:[root],signal:signal()});
 expect(applied.state).toBe('PARTIAL_RECOVERY_REQUIRED');
 const journalPath=join(journal,'code-intelligence','rename',plan.planId,'journal.json');
 expect(JSON.parse(readFileSync(journalPath,'utf8')).resolved).toBe(false);
 race.failReplace=undefined;
 const recovered=await ci.recoverRename({journalRoot:journal,planId:plan.planId,grantedRoots:[root],signal:signal()});
 expect(recovered.state).toBe('RECOVERED');
 expect(recovered.entries.map(entry=>entry.disposition)).toEqual(['Restored','Unchanged']);
 expect(readFileSync(a,'utf8')).toBe(aText);
 expect(readFileSync(b,'utf8')).toBe(bText);
});

it('an external write at replacement time survives apply and reconciles as a conflict',async()=>{
 const root=tempDir('rename-root-');
 const journal=tempDir('rename-journal-');
 const a=file(root,'a.ts');
 const aText='const alpha = 1;\n',external='const alpha = 99;\n';
 writeFileSync(a,aText);
 const adapter=new RenameAdapter();
 adapter.edit={changes:{[uri(a)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}]}};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const plan=await ci.planRename(planInput(root,a,aText));
 race.beforeNative=destination=>{expect(destination).toBe(a);writeFileSync(a,external);};
 const applied=await ci.applyRename({plan,approvalId:'approval-1',journalRoot:journal,grantedRoots:[root],signal:signal()});
 expect(applied.state).toBe('PARTIAL_RECOVERY_REQUIRED');
 expect(applied.entries).toEqual([{path:a,disposition:'Conflict',detail:'The file changed while its rename edits were being written.'}]);
 expect(readFileSync(a,'utf8')).toBe(external);
 const recovered=await ci.recoverRename({journalRoot:journal,planId:plan.planId,grantedRoots:[root],signal:signal()});
 expect(recovered.state).toBe('PARTIAL_RECOVERY_REQUIRED');
 expect(recovered.entries[0]!.disposition).toBe('Conflict');
 expect(readFileSync(a,'utf8')).toBe(external);
});

it.each(['atomic-save','symlink'])('an identity-changing %s at replacement time survives apply',async kind=>{
 const root=tempDir('rename-root-');
 const journal=tempDir('rename-journal-');
 const a=file(root,'a.ts');
 const aText='const alpha = 1;\n',external='const alpha = 100;\n';
 writeFileSync(a,aText);
 const adapter=new RenameAdapter();
 adapter.edit={changes:{[uri(a)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}]}};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const plan=await ci.planRename(planInput(root,a,aText));
 race.beforeReplace=()=>{
  if(kind==='atomic-save'){const replacement=file(root,'atomic.tmp');writeFileSync(replacement,external);renameSync(replacement,a);}
  else{const target=file(root,'target.txt');writeFileSync(target,external);renameSync(a,file(root,'original.tmp'));symlinkSync(target,a,'file');}
 };
 const applied=await ci.applyRename({plan,approvalId:'approval-1',journalRoot:journal,grantedRoots:[root],signal:signal()});
 expect(applied.state).toBe('PARTIAL_RECOVERY_REQUIRED');
 expect(applied.entries[0]!.disposition).toBe('Conflict');
 expect(readFileSync(a,'utf8')).toBe(external);
 if(kind==='symlink')unlinkSync(a); // remove the link so temporary-directory cleanup can recurse normally
});

it('an external write during recovery replacement is never overwritten',async()=>{
 const root=tempDir('rename-root-');
 const journal=tempDir('rename-journal-');
 const a=file(root,'a.ts');
 const aText='const alpha = 1;\n',external='const beta2 = 1;\n// external edit\n';
 writeFileSync(a,aText);
 const adapter=new RenameAdapter();
 adapter.edit={changes:{[uri(a)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}]}};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const plan=await ci.planRename(planInput(root,a,aText));
 await ci.applyRename({plan,approvalId:'approval-1',journalRoot:journal,grantedRoots:[root],signal:signal()});
 const journalPath=join(journal,'code-intelligence','rename',plan.planId,'journal.json');
 const recorded=JSON.parse(readFileSync(journalPath,'utf8'));
 recorded.resolved=false;
 writeFileSync(journalPath,JSON.stringify(recorded));
 race.beforeNative=destination=>{expect(destination).toBe(a);writeFileSync(a,external);};
 const result=await ci.recoverRename({journalRoot:journal,planId:plan.planId,grantedRoots:[root],signal:signal()});
 expect(result.state).toBe('PARTIAL_RECOVERY_REQUIRED');
 expect(result.entries).toEqual([{path:a,disposition:'Conflict',detail:'The file changed while its recovery was being written.'}]);
 expect(readFileSync(a,'utf8')).toBe(external);
 const persisted=JSON.parse(readFileSync(journalPath,'utf8'));
 expect(persisted.resolved).toBe(true);
 expect(persisted.entries[0].disposition).toBe('Conflict');
});

it('a revoked workspace produces no write: apply re-validates granted roots',async()=>{
 const root=tempDir('rename-root-');
 const journal=tempDir('rename-journal-');
 const a=file(root,'a.ts');
 const aText='const alpha = 1;\n';
 writeFileSync(a,aText);
 const adapter=new RenameAdapter();
 adapter.edit={changes:{[uri(a)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}]}};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const plan=await ci.planRename(planInput(root,a,aText));
 // The workspace grant was revoked between plan and apply: no write, no journal entry beyond the plan.
 const other=tempDir('rename-other-');
 await expect(ci.applyRename({plan,approvalId:'approval-1',journalRoot:journal,grantedRoots:[other],signal:signal()})).rejects.toThrowError(/granted roots|CAPABILITY/i);
 expect(readFileSync(a,'utf8')).toBe('const alpha = 1;\n');
});

it('recovery refuses a journal that targets paths outside the granted roots',async()=>{
 const root=tempDir('rename-root-');
 const journal=tempDir('rename-journal-');
 const a=file(root,'a.ts'),b=file(root,'b.ts');
 const aText='const alpha = 1;\n',bText='const alpha = 2;\n';
 writeFileSync(a,aText);writeFileSync(b,bText);
 const adapter=new RenameAdapter();
 adapter.edit={changes:{
  [uri(a)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}],
  [uri(b)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}],
 }};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const plan=await ci.planRename(planInput(root,a,aText));
 await ci.applyRename({plan,approvalId:'approval-1',journalRoot:journal,grantedRoots:[root],signal:signal()});
 const journalPath=join(journal,'code-intelligence','rename',plan.planId,'journal.json');
 const recorded=JSON.parse(readFileSync(journalPath,'utf8'));
 recorded.resolved=false;
 writeFileSync(journalPath,JSON.stringify(recorded));
 // Another project's recovered grant never reaches this journal's files.
 const other=tempDir('rename-other-');
 await expect(ci.recoverRename({journalRoot:journal,planId:plan.planId,grantedRoots:[other],signal:signal()})).rejects.toThrowError(/granted roots|CAPABILITY/i);
 expect(readFileSync(a,'utf8')).toBe('const beta2 = 1;\n');
});

it('a resolved journal with conflicts reports PARTIAL_RECOVERY_REQUIRED',async()=>{
 const root=tempDir('rename-root-');
 const journal=tempDir('rename-journal-');
 const a=file(root,'a.ts');
 const aText='const alpha = 1;\n';
 writeFileSync(a,aText);
 const adapter=new RenameAdapter();
 adapter.edit={changes:{[uri(a)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}]}};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const plan=await ci.planRename(planInput(root,a,aText));
 await ci.applyRename({plan,approvalId:'approval-1',journalRoot:journal,grantedRoots:[root],signal:signal()});
 const journalPath=join(journal,'code-intelligence','rename',plan.planId,'journal.json');
 const recorded=JSON.parse(readFileSync(journalPath,'utf8'));
 recorded.entries[0].disposition='Conflict';
 writeFileSync(journalPath,JSON.stringify(recorded));
 const result=await ci.recoverRename({journalRoot:journal,planId:plan.planId,grantedRoots:[root],signal:signal()});
 expect(result.state).toBe('PARTIAL_RECOVERY_REQUIRED');
});

it('a crash between postimage journal and apply completion still recovers the write',async()=>{
 const root=tempDir('rename-root-');
 const journal=tempDir('rename-journal-');
 const a=file(root,'a.ts');
 const aText='const alpha = 1;\n';
 writeFileSync(a,aText);
 const adapter=new RenameAdapter();
 adapter.edit={changes:{[uri(a)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}]}};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const plan=await ci.planRename(planInput(root,a,aText));
 await ci.applyRename({plan,approvalId:'approval-1',journalRoot:journal,grantedRoots:[root],signal:signal()});
 // Simulate the crash window: postimage durable, write landed, disposition never finalized.
 const journalPath=join(journal,'code-intelligence','rename',plan.planId,'journal.json');
 const recorded=JSON.parse(readFileSync(journalPath,'utf8'));
 recorded.resolved=false;
 recorded.entries[0].disposition='Unchanged';
 writeFileSync(journalPath,JSON.stringify(recorded));
 const recovered=await ci.recoverRename({journalRoot:journal,planId:plan.planId,grantedRoots:[root],signal:signal()});
 expect(recovered.entries).toEqual([{path:a,disposition:'Restored'}]);
 expect(readFileSync(a,'utf8')).toBe(aText);
});

it('a plan is refused when the synced text and the file on disk differ',async()=>{
 const root=tempDir('rename-root-');
 const a=file(root,'a.ts');
 writeFileSync(a,'const alpha = 1;\n');
 const adapter=new RenameAdapter();
 adapter.edit={changes:{[uri(a)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}]}};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 // The caller supplies a stale buffer: ranges would apply against the wrong basis.
 await expect(ci.planRename(planInput(root,a,'const alpha = 9;\n'))).rejects.toThrowError(/differs from the synced text|PRECONDITION/i);
});

it('rename exchanges positions in the negotiated encoding and canonicalizes ranges',async()=>{
 const root=tempDir('rename-root-');
 const a=file(root,'a.ts');
 // The emoji is one UTF32 unit, two UTF16 units and four UTF8 bytes.
 const text='const \ud83d\ude00alpha = 1;\n';
 writeFileSync(a,text);
 const adapter=new Utf8RenameAdapter();
 adapter.edit={changes:{[uri(a)]:[{range:{start:{line:0,character:10},end:{line:0,character:15}},newText:'beta2'}]}};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 // The caller position is canonical UTF16: 'a' of alpha sits at unit 8.
 const plan=await ci.planRename(planInput(root,a,text,{position:{line:0,character:8}}));
 // The server saw the UTF8 byte offset ('const ' + 4-byte emoji = 10).
 expect(adapter.received).toEqual({line:0,character:10});
 // The returned UTF8 range is stored in the plan as UTF16 (8..13).
 expect(plan.textEdits[0]!.edits[0]!.range).toEqual({start:{line:0,character:8},end:{line:0,character:13}});
});

it('recovery persists its dispositions: a resolved journal reconciles without re-processing',async()=>{
 const root=tempDir('rename-root-');
 const journal=tempDir('rename-journal-');
 const a=file(root,'a.ts'),b=file(root,'b.ts');
 const aText='const alpha = 1;\n',bText='const alpha = 2;\n';
 writeFileSync(a,aText);writeFileSync(b,bText);
 const adapter=new RenameAdapter();
 adapter.edit={changes:{
  [uri(a)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}],
  [uri(b)]:[{range:{start:{line:0,character:6},end:{line:0,character:11}},newText:'beta2'}],
 }};
 const ci=new CodeIntelligence(()=>adapter);
 disposables.push(ci);
 const plan=await ci.planRename(planInput(root,a,aText));
 await ci.applyRename({plan,approvalId:'approval-1',journalRoot:journal,grantedRoots:[root],signal:signal()});
 const journalPath=join(journal,'code-intelligence','rename',plan.planId,'journal.json');
 const recorded=JSON.parse(readFileSync(journalPath,'utf8'));
 recorded.resolved=false;
 writeFileSync(journalPath,JSON.stringify(recorded));
 const recovered=await ci.recoverRename({journalRoot:journal,planId:plan.planId,grantedRoots:[root],signal:signal()});
 expect(recovered.state).toBe('RECOVERED');
 // The recovery outcome is durable on disk, not only returned.
 const persisted=JSON.parse(readFileSync(journalPath,'utf8'));
 expect(persisted.resolved).toBe(true);
 expect(persisted.entries.map((e:{disposition:string})=>e.disposition)).toEqual(['Restored','Restored']);
 // A second recovery reconciles the recorded outcome instead of re-restoring:
 // an external edit made after recovery is never mistaken for a rename target.
 writeFileSync(a,'const alpha = 1;\n// post-recovery edit\n');
 const again=await ci.recoverRename({journalRoot:journal,planId:plan.planId,grantedRoots:[root],signal:signal()});
 expect(again.entries.find(e=>e.path===a)!.disposition).toBe('Restored');
 expect(readFileSync(a,'utf8')).toBe('const alpha = 1;\n// post-recovery edit\n');
});

it('recovery reconciles durable dispositions without rewriting unchanged files',async()=>{
 const root=tempDir('rename-root-');
 const journal=tempDir('rename-journal-');
 const a=file(root,'a.ts');
 const aText='const alpha = 1;\n';
 writeFileSync(a,aText);
 const {randomUUID}=await import('node:crypto');
 const planId=randomUUID();
 const dir=join(journal,'code-intelligence','rename',planId);
 mkdirSync(dir,{recursive:true});
 const preimage=createHash('sha256').update(aText).digest('hex');
 // A journal whose apply never reached a write: every path still holds its preimage.
 writeFileSync(join(dir,'journal.json'),JSON.stringify({planId,workspaceIdentity:'w-test',resolved:false,
  entries:[{path:a,preimage,postimage:null,backup:join(dir,'backup-none'),disposition:'Unchanged'}]}));
 const ci=new CodeIntelligence(()=>new RenameAdapter());
 disposables.push(ci);
 const first=await ci.recoverRename({journalRoot:journal,planId,grantedRoots:[root],signal:signal()});
 expect(first.state).toBe('APPLIED');
 expect(first.entries).toEqual([{path:a,disposition:'Unchanged'}]);
 // The reconciled outcome is durable: the journal is resolved with per-path dispositions.
 const persisted=JSON.parse(readFileSync(join(dir,'journal.json'),'utf8'));
 expect(persisted.resolved).toBe(true);
 expect(persisted.entries[0].disposition).toBe('Unchanged');
 // A second recovery reports the recorded outcome — it does not re-scan the leaf.
 writeFileSync(a,'const alpha = 1;\n// post-recovery edit\n');
 const again=await ci.recoverRename({journalRoot:journal,planId,grantedRoots:[root],signal:signal()});
 expect(again.entries[0].disposition).toBe('Unchanged');
});
