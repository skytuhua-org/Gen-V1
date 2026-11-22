import {afterEach,expect,it} from 'vitest';
import {mkdir,readdir,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
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
async function managedFixture(){const f=await fixture(),receipt=await f.tools.connect({id:'project',type:'workspace.project.connect',payload:{name:'Fixture',path:f.path}}),projectId=(receipt.result as {projects:{id:string}[]}).projects[0]!.id;
 const thread={id:'main',title:'Main',projectId,projectName:'Fixture',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'ready' as const,epoch:0,runId:null,modelId:null,sessionPath:null,kind:'main' as const};f.store.internal('fixture',null,()=>f.store.put('thread',thread.id,thread.id,thread));await f.tools.prepareWorkspace(thread);const managed=await f.tools.binding(projectId,thread.id);
 const mgit=(...args:string[])=>execFileSync('git',['-C',managed.path,...args],{windowsHide:true,encoding:'utf8'}).trim();mgit('config','user.name','Fixture');mgit('config','user.email','fixture@example.invalid');
 return{...f,projectId,thread,managed,mgit};}
it('undoes the tip commit in a managed copy and stages its changes without touching the worktree',async()=>{
 const{tools,managed,mgit,projectId,thread}=await managedFixture();
 await writeFile(join(managed.path,'one.txt'),'second\n');await writeFile(join(managed.path,'added.txt'),'added\n');mgit('add','.');mgit('commit','-m','Second subject\n\nBody paragraph.');
 const tip=mgit('rev-parse','HEAD'),parent=mgit('rev-parse','HEAD^');
 // Pre-existing edits: a staged file, an unstaged edit and an untracked file.
 await writeFile(join(managed.path,'staged.txt'),'staged\n');mgit('add','staged.txt');
 await writeFile(join(managed.path,'unstaged.txt'),'unstaged\n');mgit('add','unstaged.txt');await writeFile(join(managed.path,'unstaged.txt'),'unstaged edit\n');
 await writeFile(join(managed.path,'loose.txt'),'untracked\n');
 const indexTree=mgit('write-tree'),worktreeBefore=mgit('ls-files','-s');
 const before=await tools.gitStatus(projectId,thread.id);
 const result=await tools.gitAction(projectId,thread.id,{type:'undo',revision:before.revision}) as {head:string;undo:{undoneHead:string;head:string;message:string}};
 expect(result.undo).toEqual({undoneHead:tip,head:parent,message:'Second subject\n\nBody paragraph.'});
 expect(mgit('rev-parse','HEAD')).toBe(parent);expect(result.head).toBe(parent);
 expect(mgit('write-tree')).toBe(indexTree);expect(mgit('ls-files','-s')).toBe(worktreeBefore);
 expect(await readFile(join(managed.path,'one.txt'),'utf8')).toBe('second\n');expect(await readFile(join(managed.path,'loose.txt'),'utf8')).toBe('untracked\n');
 const after=await tools.gitStatus(projectId,thread.id);
 expect(after.files.find(item=>item.path==='added.txt')?.staged).toBe(true);expect(after.files.find(item=>item.path==='one.txt')?.staged).toBe(true);expect(after.files.find(item=>item.path==='loose.txt')?.untracked).toBe(true);
},60000);
it('blocks undo for remote-tracked, root, merge and busy-run states',async()=>{
 const{tools,managed,mgit,projectId,thread,store}=await managedFixture();
 // The managed copy starts on the imported tip; make a local second commit first.
 await writeFile(join(managed.path,'one.txt'),'second\n');mgit('add','.');mgit('commit','-qm','Local tip');
 // Remote-tracking ref containing HEAD blocks undo even without an upstream.
 mgit('update-ref','refs/remotes/origin/main','HEAD');
 const tracked=await tools.gitStatus(projectId,thread.id);
 await expect(tools.gitAction(projectId,thread.id,{type:'undo',revision:tracked.revision})).rejects.toThrow(/remote-tracking/i);
 mgit('update-ref','-d','refs/remotes/origin/main');
 // A merge tip is blocked.
 mgit('checkout','-qb','side','HEAD^');await writeFile(join(managed.path,'side.txt'),'side\n');mgit('add','.');mgit('commit','-qm','Side');mgit('checkout','-q','-');
 mgit('merge','--no-ff','-m','Merge side','side');
 const merged=await tools.gitStatus(projectId,thread.id);
 await expect(tools.gitAction(projectId,thread.id,{type:'undo',revision:merged.revision})).rejects.toThrow(/merge/i);
 mgit('reset','--hard','-q','ORIG_HEAD');
 // An admitted run on the owning thread blocks undo.
 const owner=store.get<{runId:string|null}>('thread',thread.id)!;store.internal('fixture',null,()=>store.put('thread',thread.id,thread.id,{...owner,runId:'run-1'}));
 const busy=await tools.gitStatus(projectId,thread.id);
 await expect(tools.gitAction(projectId,thread.id,{type:'undo',revision:busy.revision})).rejects.toThrow(/run/i);
 store.internal('fixture',null,()=>store.put('thread',thread.id,thread.id,{...owner,runId:null}));
 // A root commit is blocked.
 mgit('checkout','-qb','rooted');await writeFile(join(managed.path,'r.txt'),'r\n');mgit('add','.');mgit('commit','-qm','r');mgit('checkout','-q','--orphan','orphan');mgit('reset','-q');mgit('add','one.txt');mgit('commit','-qm','orphan root');
 const rooted=await tools.gitStatus(projectId,thread.id);
 await expect(tools.gitAction(projectId,thread.id,{type:'undo',revision:rooted.revision})).rejects.toThrow(/first commit/i);
},60000);
it('previews undo eligibility through project context',async()=>{
 const{tools,managed,mgit,projectId,thread}=await managedFixture();
 await writeFile(join(managed.path,'one.txt'),'second\n');mgit('add','.');mgit('commit','-qm','Undoable subject');
 const context=await tools.context(projectId,thread.id);
 expect(context.undo).toMatchObject({eligible:true,subject:'Undoable subject',head:mgit('rev-parse','HEAD')});
 mgit('update-ref','refs/remotes/origin/main','HEAD');
 const blocked=await tools.context(projectId,thread.id);
 expect(blocked.undo).toMatchObject({eligible:false,reason:'This commit is on a remote-tracking branch.'});
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
