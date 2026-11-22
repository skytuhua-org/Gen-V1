import {afterEach,expect,it} from 'vitest';
import {mkdir,readdir,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {Store} from '../packages/storage/store.ts';
import {HarnessError} from '../packages/contracts/index.ts';
import {ProjectTools,discardUnboundWorktree} from '../packages/workspace/tools.ts';
import {moveToRecycleBin} from '../packages/workspace/recycle-bin.ts';

const cleanup:(()=>Promise<void>)[]=[];
afterEach(async()=>{for(const close of cleanup.splice(0).reverse())await close();});
async function fixture(){const root=await mkdtemp(join(tmpdir(),'gen-project-')),path=join(root,'repo'),{mkdir}=await import('node:fs/promises');await mkdir(path);const store=new Store(join(root,'data'));const tools=new ProjectTools(store,{git:'C:/Program Files/Git/cmd/git.exe'});cleanup.push(async()=>{await tools.dispose();store.close();await rm(root,{recursive:true,force:true,maxRetries:5});});const git=(...args:string[])=>execFileSync('git',['-C',path,...args],{windowsHide:true,encoding:'utf8'}).trim();git('init');git('config','user.name','Fixture');git('config','user.email','fixture@example.invalid');await writeFile(join(path,'one.txt'),'first\n');git('add','.');git('commit','-m','Initial');return{root,path,store,tools,git};}
async function managed(){const f=await fixture(),receipt=await f.tools.connect({id:'project',type:'workspace.project.connect',payload:{name:'Fixture',path:f.path}}),projectId=(receipt.result as {projects:{id:string}[]}).projects[0]!.id;
 const thread={id:'main',title:'Main',projectId,projectName:'Fixture',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'ready' as const,epoch:0,runId:null,modelId:null,sessionPath:null,kind:'main' as const};
 f.store.internal('fixture',null,()=>f.store.put('thread',thread.id,thread.id,thread));await f.tools.prepareWorkspace(thread);
 const binding=await f.tools.binding(projectId,thread.id),gitm=(...args:string[])=>execFileSync('git',['-C',binding.path,...args],{windowsHide:true,encoding:'utf8'}).trim();
 return{...f,projectId,thread,binding,gitm};}
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
it('discards tracked, index-added, renamed and untracked files through the Recycle Bin',async()=>{
 const{tools,projectId,thread,binding,gitm}=await managed(),trashed:string[]=[];
 tools.options.trash=async(target)=>{trashed.push(target);await rm(target,{force:true});};
 await writeFile(join(binding.path,'one.txt'),'changed\n');
 let status=await tools.gitStatus(projectId,thread.id);
 await tools.gitAction(projectId,thread.id,{type:'discard',paths:['one.txt'],revision:status.revision});
 expect(await readFile(join(binding.path,'one.txt'),'utf8')).toBe('first\n');expect(trashed).toHaveLength(0);
 await rm(join(binding.path,'one.txt'));
 status=await tools.gitStatus(projectId,thread.id);
 await tools.gitAction(projectId,thread.id,{type:'discard',paths:['one.txt'],revision:status.revision});
 expect(await readFile(join(binding.path,'one.txt'),'utf8')).toBe('first\n');
 await writeFile(join(binding.path,'new.txt'),'new\n');gitm('add','new.txt');
 status=await tools.gitStatus(projectId,thread.id);
 await tools.gitAction(projectId,thread.id,{type:'discard',paths:['new.txt'],revision:status.revision});
 expect(trashed).toHaveLength(1);await expect(readFile(join(binding.path,'new.txt'),'utf8')).rejects.toThrow();
 gitm('mv','one.txt','renamed.txt');
 status=await tools.gitStatus(projectId,thread.id);
 await tools.gitAction(projectId,thread.id,{type:'discard',paths:['renamed.txt'],revision:status.revision});
 expect(await readFile(join(binding.path,'one.txt'),'utf8')).toBe('first\n');expect(trashed.some(target=>target.endsWith('renamed.txt'))).toBe(true);
 await writeFile(join(binding.path,'scratch.txt'),'scratch\n');
 status=await tools.gitStatus(projectId,thread.id);
 await tools.gitAction(projectId,thread.id,{type:'discard',paths:['scratch.txt'],revision:status.revision});
 expect(trashed.some(target=>target.endsWith('scratch.txt'))).toBe(true);
 expect((await tools.gitStatus(projectId,thread.id)).files).toHaveLength(0);
},60000);
it('refuses discard for active runs, missing or multi paths, conflicts and trash failures',async()=>{
 const{tools,store,projectId,thread,binding,gitm}=await managed();
 tools.options.trash=async(target)=>rm(target,{force:true});
 await writeFile(join(binding.path,'one.txt'),'changed\n');
 let status=await tools.gitStatus(projectId,thread.id);
 // An admitted run owns the working copy until it settles, including startup before runId lands.
 store.internal('fixture',null,()=>store.put('thread',thread.id,thread.id,{...thread,status:'working',runId:'run-1'}));
 await expect(tools.gitAction(projectId,thread.id,{type:'discard',paths:['one.txt'],revision:status.revision})).rejects.toThrow(/run/i);
 expect(await readFile(join(binding.path,'one.txt'),'utf8')).toBe('changed\n');
 store.internal('fixture',null,()=>store.put('thread',thread.id,thread.id,{...thread,status:'working',runId:null}));
 await expect(tools.gitAction(projectId,thread.id,{type:'discard',paths:['one.txt'],revision:status.revision})).rejects.toThrow(/run/i);
 store.internal('fixture',null,()=>store.put('thread',thread.id,thread.id,thread));
 await expect(tools.gitAction(projectId,thread.id,{type:'discard',paths:['missing.txt'],revision:status.revision})).rejects.toThrow(/REVISION_CHANGED|Refresh/i);
 await expect(tools.gitAction(projectId,thread.id,{type:'discard',paths:['one.txt','second.txt'],revision:status.revision})).rejects.toThrow(/one file/i);
 // A merge conflict is a real git state; discard must refuse before writing.
 gitm('switch','-c','conflict');await writeFile(join(binding.path,'one.txt'),'other side\n');gitm('commit','-qam','other');gitm('switch','-');
 await writeFile(join(binding.path,'one.txt'),'our side\n');gitm('commit','-qam','ours');
 try{gitm('merge','conflict');}catch{/* the conflict is the fixture */}
 status=await tools.gitStatus(projectId,thread.id);
 expect(status.files.find(file=>file.path==='one.txt')).toMatchObject({index:'U',worktree:'U'});
 await expect(tools.gitAction(projectId,thread.id,{type:'discard',paths:['one.txt'],revision:status.revision})).rejects.toThrow(/conflict/i);
 expect(await readFile(join(binding.path,'one.txt'),'utf8')).toContain('<<<');
 gitm('merge','--abort');
 // A failing Recycle Bin leaves the file in place.
 await writeFile(join(binding.path,'scratch.txt'),'scratch\n');
 tools.options.trash=async()=>{throw new HarnessError('TRASH_FAILED','no bin');};
 status=await tools.gitStatus(projectId,thread.id);
 await expect(tools.gitAction(projectId,thread.id,{type:'discard',paths:['scratch.txt'],revision:status.revision})).rejects.toThrow(/TRASH_FAILED/);
 expect(await readFile(join(binding.path,'scratch.txt'),'utf8')).toBe('scratch\n');
},60000);
it('refuses to discard a submodule gitlink entry',async()=>{
 const{root,tools,projectId,thread,binding}=await managed(),sub=join(root,'sub');
 await mkdir(sub);const gits=(...args:string[])=>execFileSync('git',['-C',sub,...args],{windowsHide:true,encoding:'utf8'}).trim();
 gits('init');gits('config','user.name','Fixture');gits('config','user.email','fixture@example.invalid');
 await writeFile(join(sub,'lib.txt'),'lib\n');gits('add','.');gits('commit','-qm','lib');
 const gitm=(...args:string[])=>execFileSync('git',['-C',binding.path,'-c','protocol.file.allow=always',...args],{windowsHide:true,encoding:'utf8'}).trim();
 gitm('submodule','add',sub,'vendor/lib');
 const status=await tools.gitStatus(projectId,thread.id);
 expect(status.files.some(file=>file.path==='vendor/lib')).toBe(true);
 await expect(tools.gitAction(projectId,thread.id,{type:'discard',paths:['vendor/lib'],revision:status.revision})).rejects.toThrow(/Submodule|UNSUPPORTED/i);
},60000);
it('snapshots the discarded paths before the write and aborts when the hook fails',async()=>{
 const{tools,projectId,thread,binding}=await managed(),captured:string[][]=[];
 tools.options.trash=async(target)=>rm(target,{force:true});
 await writeFile(join(binding.path,'one.txt'),'changed\n');
 tools.options.beforeDiscard=async input=>{captured.push([...input.paths]);throw new HarnessError('CAPABILITY_DENIED','snapshot refused');};
 const status=await tools.gitStatus(projectId,thread.id);
 await expect(tools.gitAction(projectId,thread.id,{type:'discard',paths:['one.txt'],revision:status.revision})).rejects.toThrow(/snapshot refused/);
 expect(await readFile(join(binding.path,'one.txt'),'utf8')).toBe('changed\n');
 tools.options.beforeDiscard=async input=>{captured.push([...input.paths]);};
 await tools.gitAction(projectId,thread.id,{type:'discard',paths:['one.txt'],revision:status.revision});
 expect(captured).toEqual([['one.txt'],['one.txt']]);
},60000);
it('keeps the file when no Recycle Bin exists on this host',async()=>{
 if(process.platform==='win32')return;
 await expect(moveToRecycleBin(join(tmpdir(),'gen-trash-check.txt'),new AbortController().signal)).rejects.toThrow(/TRASH_UNAVAILABLE|Windows/);
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
