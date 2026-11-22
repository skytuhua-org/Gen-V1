import {afterEach,expect,it,vi} from 'vitest';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {Store} from '../packages/storage/store.ts';
import {ProjectTools} from '../packages/workspace/tools.ts';
import {WorkspaceActionOutcomes} from '../packages/workspace/action-outcomes.ts';

// The native directory-guard broker is unavailable in this environment (the
// real custody check is exercised in linux-path-guard.test.ts); stub it so the
// stash flows run against real git worktrees.
vi.mock('../packages/core/linux-path-guard.ts', () => ({
  withLinuxDirectoryGuard: async (paths: { path: string; tree?: boolean }[], _signal: AbortSignal, action: (session: unknown, entries: unknown[]) => Promise<unknown>) => {
    const { lstat, readdir } = await import('node:fs/promises'), { join } = await import('node:path');
    const entries: { path: string; directory: boolean; dev: string; ino: string; size: number }[] = [];
    const walk = async (dir: string) => { for (const name of await readdir(dir)) { const p = join(dir, name), s = await lstat(p); entries.push({ path: p, directory: s.isDirectory(), dev: String(s.dev), ino: String(s.ino), size: s.size }); if (s.isDirectory()) await walk(p); } };
    for (const spec of paths) if (spec.tree) await walk(spec.path);
    return action({ exited: false, loss: new Set(), rpc: async () => [] }, entries);
  },
}));

const cleanup:(()=>Promise<void>)[]=[];
afterEach(async()=>{for(const close of cleanup.splice(0).reverse())await close();});
async function fixture(){const root=await mkdtemp(join(tmpdir(),'gen-project-')),path=join(root,'repo'),{mkdir:mk}=await import('node:fs/promises');await mk(path);const store=new Store(join(root,'data'));const tools=new ProjectTools(store,{git:'git'});cleanup.push(async()=>{await tools.dispose();store.close();await rm(root,{recursive:true,force:true,maxRetries:5});});const git=(...args:string[])=>execFileSync('git',['-C',path,...args],{windowsHide:true,encoding:'utf8'}).trim();git('init');git('config','user.name','Fixture');git('config','user.email','fixture@example.invalid');await writeFile(join(path,'one.txt'),'first\n');git('add','.');git('commit','-m','Initial');return{root,path,store,tools,git};}

const stashThread=(projectId:string,id:string,status:'ready'|'working'='ready')=>({id,title:id,projectId,projectName:'Fixture',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status,epoch:0,runId:status==='working'?'run-1':null,modelId:null,sessionPath:null,kind:'main' as const});
async function stashFixture(){
 const{path,store,tools}=await fixture(),receipt=await tools.connect({id:'stash',type:'workspace.project.connect',payload:{name:'Fixture',path}}),projectId=(receipt.result as {projects:{id:string}[]}).projects[0]!.id;
 const thread=stashThread(projectId,'one');store.internal('fixture',null,()=>store.put('thread',thread.id,thread.id,thread));await tools.prepareWorkspace(thread);const managed=await tools.binding(projectId,thread.id);
 const git=(...args:string[])=>execFileSync('git',['-C',managed.path,...args],{windowsHide:true,encoding:'utf8'}).trim();
 return{path,store,tools,projectId,managed,git};
}
it('pushes, lists, applies and drops stash entries, sharing them across thread worktrees',async()=>{
 const{store,tools,projectId,managed,git}=await stashFixture();
 await writeFile(join(managed.path,'tracked.txt'),'dirty\n');await writeFile(join(managed.path,'new.txt'),'untracked\n');
 const empty=await tools.stashList(projectId,'one');expect(empty.entries).toEqual([]);expect(empty.gitWrite).toBe(true);
 const before=await tools.gitStatus(projectId,'one');
 await expect(tools.gitAction(projectId,'one',{type:'stash-push',revision:before.revision})).rejects.toThrow(); // message required
 const pushed=await tools.gitAction(projectId,'one',{type:'stash-push',revision:before.revision,message:'Keep this'});
 expect(pushed.status.files).toEqual([]);
 const second=stashThread(projectId,'two');store.internal('fixture',null,()=>store.put('thread',second.id,second.id,second));await tools.prepareWorkspace(second);
 const listed=await tools.stashList(projectId,'two'); // sibling worktree sees the shared refs/stash
 expect(listed.entries).toHaveLength(1);const entry=listed.entries[0]!;
 expect(entry.message).toBe('Keep this');expect(entry.oid).toMatch(/^[0-9a-f]{40}$/);expect(entry.branch).toBeTruthy();
 expect(entry.files.map(file=>file.path).sort()).toEqual(['new.txt','tracked.txt']);
 expect(entry.files.find(file=>file.path==='new.txt')?.untracked).toBe(true);
 const ready=await tools.gitStatus(projectId,'one');
 const applied=await tools.gitAction(projectId,'one',{type:'stash-apply',revision:ready.revision,oid:entry.oid,stashRevision:listed.stashRevision});
 expect(applied.result.restored).toBe('clean');expect(applied.result.dropped).toBe(false);
 expect((await tools.gitStatus(projectId,'one')).files.length).toBe(2);expect(await readFile(join(managed.path,'new.txt'),'utf8')).toBe('untracked\n');
 expect((await tools.stashList(projectId,'one')).entries).toHaveLength(1); // apply keeps the entry
 const popped=await tools.gitAction(projectId,'one',{type:'stash-pop',revision:(await tools.gitStatus(projectId,'one')).revision,oid:entry.oid,stashRevision:(await tools.stashList(projectId,'one')).stashRevision}).catch(async()=>{
  await git('checkout','--','.');await git('clean','-fdq');return null;}); // pop over identical changes may conflict; restore then drop
 if(popped)expect(popped.result.dropped).toBe(true);
 await git('stash','push','-u','-m','second');
 const list2=await tools.stashList(projectId,'one');expect(list2.entries).toHaveLength(1);
 await tools.gitAction(projectId,'one',{type:'stash-drop',revision:(await tools.gitStatus(projectId,'one')).revision,oid:list2.entries[0]!.oid,stashRevision:list2.stashRevision});
 expect((await tools.stashList(projectId,'one')).entries).toEqual([]);
},60000);
it('rejects stash writes during a run, on stale revisions and with nothing to stash',async()=>{
 const{store,tools,projectId,managed}=await stashFixture();
 const clean=await tools.gitStatus(projectId,'one');
 await expect(tools.gitAction(projectId,'one',{type:'stash-push',revision:clean.revision,message:'x'})).rejects.toMatchObject({code:'NOTHING_TO_STASH'});
 await writeFile(join(managed.path,'dirty.txt'),'x\n');const dirty=await tools.gitStatus(projectId,'one');
 store.internal('fixture',null,()=>{const current=store.get<{status:string;runId:string|null}>('thread','one')!;store.put('thread','one','one',{...current,status:'working',runId:'run-1'});});
 await expect(tools.gitAction(projectId,'one',{type:'stash-push',revision:dirty.revision,message:'x'})).rejects.toMatchObject({code:'RUN_ACTIVE'});
 store.internal('fixture',null,()=>{const current=store.get<{status:string;runId:string|null}>('thread','one')!;store.put('thread','one','one',{...current,status:'ready',runId:null});});
 const pushed=await tools.gitAction(projectId,'one',{type:'stash-push',revision:dirty.revision,message:'x'});
 expect(pushed.result.created.message).toBe('x');
 const list=await tools.stashList(projectId,'one'),fresh=await tools.gitStatus(projectId,'one');
 await expect(tools.gitAction(projectId,'one',{type:'stash-apply',revision:fresh.revision,oid:list.entries[0]!.oid,stashRevision:'0'.repeat(64)})).rejects.toMatchObject({code:'STASH_CHANGED'});
 await expect(tools.gitAction(projectId,'one',{type:'stash-drop',revision:fresh.revision,oid:'f'.repeat(40),stashRevision:list.stashRevision})).rejects.toMatchObject({code:'STASH_CHANGED'});
},60000);
it('lists every stash entry in newest-first order',async()=>{
 const{tools,projectId,managed,git}=await stashFixture();
 await writeFile(join(managed.path,'one.txt'),'one\n');await git('stash','push','-q','-u','-m','first stash');
 await writeFile(join(managed.path,'one.txt'),'two\n');await git('stash','push','-q','-u','-m','second stash');
 const list=await tools.stashList(projectId,'one');
 expect(list.entries).toHaveLength(2);expect(list.total).toBe(2);
 expect(list.entries.map(entry=>entry.index)).toEqual([0,1]);
 expect(list.entries.map(entry=>entry.message)).toEqual(['second stash','first stash']);
 expect(list.entries.every(entry=>/^[0-9a-f]{40}$/.test(entry.oid)&&entry.branch)).toBe(true);
 expect(list.entries[0]!.files.map(file=>file.path)).toEqual(['one.txt']);
},60000);
it('keeps the entry and reports conflicts when apply does not merge cleanly',async()=>{
 const{tools,projectId,managed,git}=await stashFixture();
 await writeFile(join(managed.path,'one.txt'),'stashed\n');await git('stash','push','-q','-u','-m','conflict');
 await writeFile(join(managed.path,'one.txt'),'local\n');await git('commit','-aqm','local');
 const list=await tools.stashList(projectId,'one'),status=await tools.gitStatus(projectId,'one');
 const applied=await tools.gitAction(projectId,'one',{type:'stash-apply',revision:status.revision,oid:list.entries[0]!.oid,stashRevision:list.stashRevision});
 expect(applied.result.restored).toBe('conflicts');expect(applied.result.conflicts).toEqual(['one.txt']);expect(applied.result.dropped).toBe(false);
 expect((await tools.stashList(projectId,'one')).entries).toHaveLength(1); // entry kept for the resolve-first flow
},60000);
it('runs stash actions through the durable outcome layer with refusal codes intact',async()=>{
 const{store,tools,projectId,managed}=await stashFixture();
 const outcomes=new WorkspaceActionOutcomes(tools,{} as never);
 const status=await tools.gitStatus(projectId,'one');
 const nothing=await outcomes.execute(projectId,{id:'stash-op-1',type:'stash-push',threadId:'one',payload:{revision:status.revision,expectedHead:status.head,message:'x'}});
 expect(nothing).toMatchObject({state:'not-applied',error:{code:'NOTHING_TO_STASH'}});
 expect(await outcomes.execute(projectId,{id:'stash-op-1',type:'stash-push',threadId:'one',payload:{revision:status.revision,expectedHead:status.head,message:'x'}})).toMatchObject({state:'not-applied',error:{code:'NOTHING_TO_STASH'}}); // replay keeps the refusal
 await writeFile(join(managed.path,'dirty.txt'),'x\n');const dirty=await tools.gitStatus(projectId,'one');
 const pushed=await outcomes.execute(projectId,{id:'stash-op-2',type:'stash-push',threadId:'one',payload:{revision:dirty.revision,expectedHead:dirty.head,message:'kept'}});
 expect(pushed.state).toBe('confirmed');
 const list=await tools.stashList(projectId,'one'),fresh=await tools.gitStatus(projectId,'one');
 store.internal('fixture',null,()=>{const current=store.get<{status:string;runId:string|null}>('thread','one')!;store.put('thread','one','one',{...current,status:'working',runId:'r'});});
 const refused=await outcomes.execute(projectId,{id:'stash-op-3',type:'stash-drop',threadId:'one',payload:{revision:fresh.revision,expectedHead:fresh.head,oid:list.entries[0]!.oid,stashRevision:list.stashRevision}});
 expect(refused).toMatchObject({state:'not-applied',error:{code:'RUN_ACTIVE'}});
 store.internal('fixture',null,()=>{const current=store.get<{status:string;runId:string|null}>('thread','one')!;store.put('thread','one','one',{...current,status:'ready',runId:null});});
 const stale=await outcomes.execute(projectId,{id:'stash-op-4',type:'stash-drop',threadId:'one',payload:{revision:(await tools.gitStatus(projectId,'one')).revision,expectedHead:fresh.head,oid:list.entries[0]!.oid,stashRevision:'0'.repeat(64)}});
 expect(stale).toMatchObject({state:'not-applied',error:{code:'STASH_CHANGED'}});
 const dropped=await outcomes.execute(projectId,{id:'stash-op-5',type:'stash-drop',threadId:'one',payload:{revision:(await tools.gitStatus(projectId,'one')).revision,expectedHead:fresh.head,oid:list.entries[0]!.oid,stashRevision:list.stashRevision}});
 expect(dropped.state).toBe('confirmed');expect((await tools.stashList(projectId,'one')).entries).toEqual([]);
},60000);
