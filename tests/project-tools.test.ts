import {afterEach,expect,it} from 'vitest';
import {mkdir,readdir,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {Store} from '../packages/storage/store.ts';
import {ProjectTools,discardUnboundWorktree} from '../packages/workspace/tools.ts';

const cleanup:(()=>Promise<void>)[]=[];
afterEach(async()=>{for(const close of cleanup.splice(0).reverse())await close();});
async function fixture(){const root=await mkdtemp(join(tmpdir(),'gen-project-')),path=join(root,'repo'),{mkdir}=await import('node:fs/promises');await mkdir(path);const store=new Store(join(root,'data'));const tools=new ProjectTools(store,{git:'C:/Program Files/Git/cmd/git.exe'});cleanup.push(async()=>{await tools.dispose();store.close();await rm(root,{recursive:true,force:true,maxRetries:5});});const git=(...args:string[])=>execFileSync('git',['-C',path,...args],{windowsHide:true,encoding:'utf8'}).trim();git('init');git('config','user.name','Fixture');git('config','user.email','fixture@example.invalid');await writeFile(join(path,'one.txt'),'first\n');git('add','.');git('commit','-m','Initial');return{root,path,store,tools,git};}
it('enrolls a local project and assigns new agents separate real branches and working copies',async()=>{
 const{path,store,tools}=await fixture();const project=await tools.connect({id:'connect',type:'workspace.project.connect',payload:{name:'Fixture',path}});
 const projectId=(project.result as {projects:{id:string}[]}).projects[0]!.id;
 const thread=(id:string)=>({id,title:id,projectId,projectName:'Fixture',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'ready' as const,epoch:0,runId:null,modelId:null,sessionPath:null,kind:'main' as const});
 store.internal('fixture',null,()=>{for(const id of ['first','second'])store.put('thread',id,id,thread(id));});
 await Promise.all(['first','second'].map(id=>tools.prepareWorkspace(thread(id))));
 const one=await tools.binding(projectId,'first'),two=await tools.binding(projectId,'second');
 expect(one.path).not.toBe(two.path);expect(one.path).not.toBe(path);
 await writeFile(join(one.path,'one.txt'),'agent one\n');expect(await readFile(join(two.path,'one.txt'),'utf8')).toBe('first\n');expect(await readFile(join(path,'one.txt'),'utf8')).toBe('first\n');
 await tools.prepareWorkspace(store.get('thread','first')!);expect((await tools.binding(projectId,'first')).path).toBe(one.path);
});
it('reports live managed untracked/staged changes and refuses an action against an old revision',async()=>{
 const{path,tools,store}=await fixture(),receipt=await tools.connect({id:'project',type:'workspace.project.connect',payload:{name:'Fixture',path}}),projectId=(receipt.result as {projects:{id:string}[]}).projects[0]!.id;
 const thread={id:'main',title:'Main',projectId,projectName:'Fixture',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'ready' as const,epoch:0,runId:null,modelId:null,sessionPath:null,kind:'main' as const};store.internal('fixture',null,()=>store.put('thread',thread.id,thread.id,thread));await tools.prepareWorkspace(thread);const managed=await tools.binding(projectId,thread.id);
 const before=await tools.gitStatus(projectId,thread.id);await writeFile(join(managed.path,'new.txt'),'new\n');
 const after=await tools.gitStatus(projectId,thread.id);expect(after.files.some(item=>item.path==='new.txt'&&item.untracked)).toBe(true);expect(after.revision).not.toBe(before.revision);
 await expect(tools.gitAction(projectId,thread.id,{type:'stage',paths:['new.txt'],revision:before.revision})).rejects.toThrow(/changed|revision/i);
 await tools.gitAction(projectId,thread.id,{type:'stage',paths:['new.txt'],revision:after.revision});expect((await tools.gitStatus(projectId,thread.id)).files.find(item=>item.path==='new.txt')?.staged).toBe(true);
},60000);
it('rejects a remote company reference and a thread from another project',async()=>{
 const{tools,store}=await fixture();store.internal('fixture',null,()=>{store.put('workspaceProject','remote',null,{id:'remote',name:'Remote',authority:{kind:'company',companyId:'fleet'},rootPath:'C:/',createdAt:new Date().toISOString()});});
 await expect(tools.binding('remote')).rejects.toThrow(/local|authority|company/i);
});
it('keeps Git status inside the enrolled root even when repository config names another worktree',async()=>{
 const{root,path,tools,git}=await fixture(),{mkdir}=await import('node:fs/promises'),other=join(root,'other');await mkdir(other);await writeFile(join(other,'one.txt'),'Other folder contents must not be reviewed.\n');
 const receipt=await tools.connect({id:'scope',type:'workspace.project.connect',payload:{name:'Fixture',path}}),projectId=(receipt.result as {projects:{id:string}[]}).projects[0]!.id;
 git('config','core.worktree',other);const status=await tools.gitStatus(projectId);expect(status.diff).not.toContain('Other folder contents');expect(status.files).toHaveLength(0);
});
it('discards an unbound working copy together with the branch it created',async()=>{
 const root=await mkdtemp(join(tmpdir(),'gen-discard-')),source=join(root,'source'),bare=join(root,'family.git'),worktree=join(root,'staged'),branch='gen/stale-0000';
 const git=(cwd:string,...args:string[])=>execFileSync('git',['-C',cwd,...args],{windowsHide:true,encoding:'utf8'}).trim();
 await mkdir(source);git(source,'init','-q');git(source,'config','user.name','Fixture');git(source,'config','user.email','fixture@example.invalid');
 await writeFile(join(source,'one.txt'),'base\n');git(source,'add','.');git(source,'commit','-qm','base');
 execFileSync('git',['clone','-q','--bare',source,bare],{windowsHide:true});
 execFileSync('git',['--git-dir='+bare,'worktree','add','-b',branch,worktree,'HEAD'],{windowsHide:true});
 expect(execFileSync('git',['--git-dir='+bare,'rev-parse','--verify','refs/heads/'+branch],{windowsHide:true,encoding:'utf8'}).trim()).toMatch(/^[0-9a-f]{40}$/);
 await discardUnboundWorktree('git',bare,worktree,branch);
 expect(await readdir(worktree).catch(()=>[])).toEqual([]);
 expect(()=>execFileSync('git',['--git-dir='+bare,'rev-parse','--verify','refs/heads/'+branch],{windowsHide:true,stdio:'pipe'})).toThrow();
 const listed=execFileSync('git',['--git-dir='+bare,'worktree','list','--porcelain'],{windowsHide:true,encoding:'utf8'});
 expect(listed).not.toContain(worktree);
 await rm(root,{recursive:true,force:true,maxRetries:5});
},60000);
async function managedFixture(){const f=await fixture();const receipt=await f.tools.connect({id:randomUUID(),type:'workspace.project.connect',payload:{name:'Fixture',path:f.path}}),projectId=(receipt.result as {projects:{id:string}[]}).projects[0]!.id;
 const thread={id:'main',title:'Main',projectId,projectName:'Fixture',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'ready' as const,epoch:0,runId:null,modelId:null,sessionPath:null,kind:'main' as const};
 f.store.internal('fixture',null,()=>f.store.put('thread',thread.id,thread.id,thread));await f.tools.prepareWorkspace(thread);
 const binding=await f.tools.binding(projectId,thread.id),wgit=(...args:string[])=>execFileSync('git',['-C',binding.path,...args],{windowsHide:true,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 return{...f,projectId,thread,binding,wgit};
}
const branchError=async(call:Promise<unknown>)=>{try{await call;}catch(error){return error as {code?:string;message:string};}throw Error('Expected a refusal');};
it('lists local and remote branches with occupancy, dirty counts and caps',async()=>{
 const f=await managedFixture();
 f.wgit('branch','older','HEAD');await writeFile(join(f.binding.path,'b.txt'),'x\n');f.wgit('add','b.txt');f.wgit('commit','-qm','later');
 f.wgit('update-ref','refs/remotes/origin/upstream',f.wgit('rev-parse','older'));
 f.wgit('worktree','add',join(f.root,'second'),'older');
 const list=await f.tools.branches(f.projectId,f.thread.id);
 expect(list.canSwitch).toBe(true);expect(list.reason).toBeNull();expect(list.detached).toBe(false);expect(list.current).toBe(f.binding.workspace!.branch);
 const current=list.local.find(e=>e.current);expect(current?.occupiedBy).toBe('this');
 const other=list.local.find(e=>e.name==='older');expect(other?.occupiedBy).toBe('other');
 expect(list.remote.map(e=>e.name)).toContain('origin/upstream');
 expect(list.local.every(e=>e.head.length===40&&e.committedAt.length>0)).toBe(true);
 await writeFile(join(f.binding.path,'dirty.txt'),'d\n');
 const dirty=await f.tools.branches(f.projectId,f.thread.id);
 expect(dirty.dirty.tracked).toBe(0);expect(dirty.dirty.untracked).toBe(1);
 const cap=await managedFixture();
 execFileSync('git',['-C',cap.binding.path,'update-ref','--stdin'],{windowsHide:true,input:Array.from({length:505},(_,i)=>`create refs/heads/b${i} HEAD`).join('\n')});
 const capped=await cap.tools.branches(cap.projectId,cap.thread.id);
 expect(capped.local.length).toBeLessThanOrEqual(500);expect(capped.truncated).toBe(true);
},120000);
it('switches cleanly, carries changes with bringChanges and refuses conflicts byte-identically',async()=>{
 const f=await managedFixture();
 f.wgit('branch','target');
 const status=await f.tools.gitStatus(f.projectId,f.thread.id);
 await f.tools.gitAction(f.projectId,f.thread.id,{type:'switch-branch',revision:status.revision,branch:'target',source:'local',bringChanges:false});
 expect(f.wgit('branch','--show-current')).toBe('target');
 f.wgit('switch',f.binding.workspace!.branch); // back to the workspace branch
  f.wgit('switch','target');await writeFile(join(f.binding.path,'one.txt'),'main edit\n');f.wgit('add','one.txt');f.wgit('commit','-qm','main edit');f.wgit('switch',f.binding.workspace!.branch);
 // dirty non-conflicting edit carries with bringChanges
 await writeFile(join(f.binding.path,'carry.txt'),'carry\n');
 const dirty=await f.tools.gitStatus(f.projectId,f.thread.id);
 const refusal=await branchError(f.tools.gitAction(f.projectId,f.thread.id,{type:'switch-branch',revision:dirty.revision,branch:'target',source:'local',bringChanges:false}));
 expect(refusal.code).toBe('DIRTY_TREE');
 const after=await f.tools.gitStatus(f.projectId,f.thread.id);
 await f.tools.gitAction(f.projectId,f.thread.id,{type:'switch-branch',revision:after.revision,branch:'target',source:'local',bringChanges:true});
 expect(f.wgit('branch','--show-current')).toBe('target');expect(await readFile(join(f.binding.path,'carry.txt'),'utf8')).toBe('carry\n');
 f.wgit('switch',f.binding.workspace!.branch);
 // conflicting edit -> BRANCH_CONFLICT, status byte-identical
 await writeFile(join(f.binding.path,'one.txt'),'conflicting local edit\n');
 const before=await f.tools.gitStatus(f.projectId,f.thread.id),porcelainBefore=f.wgit('status','--porcelain=v2');
 const conflict=await branchError(f.tools.gitAction(f.projectId,f.thread.id,{type:'switch-branch',revision:before.revision,branch:'target',source:'local',bringChanges:true}));
 expect(conflict.code).toBe('BRANCH_CONFLICT');
 expect(f.wgit('status','--porcelain=v2')).toBe(porcelainBefore);expect(f.wgit('rev-parse','HEAD')).toBe(before.head);
},120000);
it('refuses occupied branches, active runs, bad names, existing names and legacy copies',async()=>{
 const f=await managedFixture();
 f.wgit('branch','held');f.wgit('worktree','add',join(f.root,'second'),'held');
 const s0=await f.tools.gitStatus(f.projectId,f.thread.id);
 expect((await branchError(f.tools.gitAction(f.projectId,f.thread.id,{type:'switch-branch',revision:s0.revision,branch:'held',source:'local',bringChanges:false}))).code).toBe('BRANCH_IN_USE');
 f.store.internal('fixture',null,()=>f.store.put('thread',f.thread.id,f.thread.id,{...f.thread,runId:'run-1'}));
 const s1=await f.tools.gitStatus(f.projectId,f.thread.id);
 expect((await branchError(f.tools.gitAction(f.projectId,f.thread.id,{type:'switch-branch',revision:s1.revision,branch:'held',source:'local',bringChanges:false}))).code).toBe('RUN_ACTIVE');
 f.store.internal('fixture',null,()=>f.store.put('thread',f.thread.id,f.thread.id,f.thread));
 for(const name of ['-x','a..b','x.lock','a b','foo/','@{x','@'])
  expect((await branchError(f.tools.gitAction(f.projectId,f.thread.id,{type:'create-branch',revision:s0.revision,name}))).code).toBe('INVALID_BRANCH_NAME');
 expect((await branchError(f.tools.gitAction(f.projectId,f.thread.id,{type:'create-branch',revision:s0.revision,name:'held'}))).code).toBe('BRANCH_EXISTS');
 // create from HEAD carries dirty edits
 await writeFile(join(f.binding.path,'new.txt'),'n\n');
 const s2=await f.tools.gitStatus(f.projectId,f.thread.id);
 await f.tools.gitAction(f.projectId,f.thread.id,{type:'create-branch',revision:s2.revision,name:'feature/new'});
 expect(f.wgit('branch','--show-current')).toBe('feature/new');
 // legacy (non-managed) copy refuses writes
 const receipt=await f.tools.connect({id:'legacy',type:'workspace.project.connect',payload:{name:'Legacy',path:f.path}}),legacyId=(receipt.result as {projects:{id:string}[]}).projects[0]!.id;
 const legacyStatus=await f.tools.gitStatus(legacyId);
 expect((await branchError(f.tools.gitAction(legacyId,undefined,{type:'switch-branch',revision:legacyStatus.revision,branch:'x',source:'local',bringChanges:false}))).code).toBe('CAPABILITY_DENIED');
 // side/delegate threads are rejected
 const side={...f.thread,id:'side',kind:'side' as const,sideParentId:'main',workspaceId:undefined};
 f.store.internal('fixture',null,()=>f.store.put('thread',side.id,side.id,side));
 await expect(f.tools.branches(f.projectId,side.id)).rejects.toMatchObject({code:'CAPABILITY_DENIED'});
},120000);
it('creates a tracking branch from a remote ref and switches to the existing local one',async()=>{
 const f=await managedFixture();
 f.wgit('branch','shared');
 f.wgit('update-ref','refs/remotes/origin/only','HEAD');
 const s=await f.tools.gitStatus(f.projectId,f.thread.id);
 await f.tools.gitAction(f.projectId,f.thread.id,{type:'switch-branch',revision:s.revision,branch:'origin/only',source:'remote',bringChanges:false});
 expect(f.wgit('branch','--show-current')).toBe('only');
 f.wgit('switch',f.binding.workspace!.branch);
 const s2=await f.tools.gitStatus(f.projectId,f.thread.id);
 await f.tools.gitAction(f.projectId,f.thread.id,{type:'switch-branch',revision:s2.revision,branch:'origin/shared',source:'remote',bringChanges:false});
 expect(f.wgit('branch','--show-current')).toBe('shared');
},120000);
