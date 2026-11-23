import {afterEach,expect,it} from 'vitest';
import {mkdir,mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {Store} from '../packages/storage/store.ts';
import {ProjectTools} from '../packages/workspace/tools.ts';
import {gitSyncResultSchema} from '../packages/contracts/workspace-sync.ts';

const cleanup:(()=>Promise<void>)[]=[];
afterEach(async()=>{for(const close of cleanup.splice(0).reverse())await close();});

interface Fixture{root:string;path:string;store:Store;tools:ProjectTools;projectId:string;threadId:string;worktree:string;branch:string;family:string;git:(cwd:string,...args:string[])=>string;pushRemote:(ref:string,oid:string)=>void}
async function fixture(withRemote=true):Promise<Fixture>{
 const root=await mkdtemp(join(tmpdir(),'gen-sync-')),path=join(root,'repo'),store=new Store(join(root,'data'));
 const tools=new ProjectTools(store);cleanup.push(async()=>{await tools.dispose();store.close();await rm(root,{recursive:true,force:true,maxRetries:5});});
 const git=(cwd:string,...args:string[])=>execFileSync('git',['-C',cwd,...args],{windowsHide:true,encoding:'utf8'}).trim();
 await mkdir(path);git(path,'init','-q');git(path,'config','user.name','Fixture');git(path,'config','user.email','fixture@example.invalid');
 await writeFile(join(path,'one.txt'),'first\n');git(path,'add','.');git(path,'commit','-qm','Initial');
 if(withRemote)git(path,'remote','add','origin','https://github.com/owner/repo');
 const receipt=await tools.connect({id:'connect',type:'workspace.project.connect',payload:{name:'Fixture',path}}),projectId=(receipt.result as {projects:{id:string}[]}).projects[0]!.id;
 const thread={id:'main',title:'Main',projectId,projectName:'Fixture',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'ready' as const,epoch:0,runId:null,modelId:null,sessionPath:null,kind:'main' as const};
 store.internal('fixture',null,()=>store.put('thread',thread.id,thread.id,thread));
 await tools.prepareWorkspace(thread);const bound=await tools.binding(projectId,thread.id);
 const family=join(store.dataDir,'git',projectId,'repository.git');
 // Fabricate remote-tracking state the way a real fetch would leave it: push the
 // source repo's objects into the private family under refs/remotes/origin/*.
 const pushRemote=(ref:string,oid:string)=>execFileSync('git',['-C',path,'push',family,oid+':refs/remotes/origin/'+ref],{windowsHide:true,stdio:'pipe'});
 return{root,path,store,tools,projectId,threadId:thread.id,worktree:bound.path,branch:bound.workspace!.branch,family,git,pushRemote};
}
const remoteCommit=async(f:Fixture,name:string,text:string)=>{
 const head=f.git(f.path,'rev-parse','HEAD');await writeFile(join(f.path,name),text);
 f.git(f.path,'add',name);f.git(f.path,'commit','-qm','remote '+name);return{tip:f.git(f.path,'rev-parse','HEAD'),restore:()=>f.git(f.path,'reset','--hard','-q',head)};
};

it('reports no-upstream before the thread branch exists on origin',async()=>{
 const f=await fixture(),sync=await f.tools.gitSync(f.projectId,f.threadId);
 expect(gitSyncResultSchema.safeParse(sync).success).toBe(true);
 expect(sync.state).toBe('no-upstream');expect(sync.remote).toEqual({name:'origin',repo:'owner/repo'});
 expect(sync.upstream).toBeNull();expect(sync.blockers).toContain('NO_UPSTREAM');expect(sync.lastFetchedAt).toBeNull();
},60000);
it('counts ahead and behind against the upstream ref',async()=>{
 const f=await fixture(),head=f.git(f.path,'rev-parse','HEAD');
 f.pushRemote(f.branch,head);
 expect((await f.tools.gitSync(f.projectId,f.threadId)).state).toBe('up-to-date');
 const remote=await remoteCommit(f,'remote.txt','remote side\n');f.pushRemote(f.branch,remote.tip);
 let sync=await f.tools.gitSync(f.projectId,f.threadId);
 expect(sync.state).toBe('behind');expect(sync.behind).toBe(1);expect(sync.ahead).toBe(0);
 f.git(f.worktree,'commit','--allow-empty','-qm','local work');f.pushRemote(f.branch,remote.tip);
 sync=await f.tools.gitSync(f.projectId,f.threadId);
 expect(sync.state).toBe('diverged');expect(sync.blockers).toContain('DIVERGED');
 remote.restore();
},60000);
it('prefers the configured branch upstream over the same-name ref (R2)',async()=>{
 const f=await fixture(),other=await remoteCommit(f,'other.txt','other\n');
 f.pushRemote(f.branch,other.tip);f.pushRemote('feature',other.tip);
 f.git(f.worktree,'config','branch.'+f.branch+'.remote','origin');f.git(f.worktree,'config','branch.'+f.branch+'.merge','refs/heads/feature');
 const sync=await f.tools.gitSync(f.projectId,f.threadId);
 expect(sync.upstream?.ref).toBe('refs/remotes/origin/feature');expect(sync.upstream?.short).toBe('origin/feature');
 other.restore();
},60000);
it('flags DIRTY_OVERLAP only when an uncommitted path changes in the pull range',async()=>{
 const f=await fixture(),remote=await remoteCommit(f,'shared.txt','remote edit\n');f.pushRemote(f.branch,remote.tip);
 await writeFile(join(f.worktree,'unrelated.txt'),'local only\n');
 let sync=await f.tools.gitSync(f.projectId,f.threadId);
 expect(sync.state).toBe('behind');expect(sync.blockers).not.toContain('DIRTY_OVERLAP');
 await writeFile(join(f.worktree,'shared.txt'),'local edit\n');
 sync=await f.tools.gitSync(f.projectId,f.threadId);
 expect(sync.blockers).toContain('DIRTY_OVERLAP');
 remote.restore();
},60000);
it('blocks Pull while the thread has an active run and reports detached/no-remote states',async()=>{
 const f=await fixture(),head=f.git(f.path,'rev-parse','HEAD');f.pushRemote(f.branch,head);
 store_update: {
  const thread=f.store.get<{runId?:string}>('thread',f.threadId)!;
  f.store.internal('fixture',null,()=>f.store.put('thread',f.threadId,f.threadId,{...thread,runId:'run-1'}));
 }
 const busy=await f.tools.gitSync(f.projectId,f.threadId);
 expect(busy.blockers).toContain('RUN_ACTIVE');
 f.git(f.worktree,'checkout','--detach','-q');
 const detached=await f.tools.gitSync(f.projectId,f.threadId);
 expect(detached.state).toBe('detached');expect(detached.blockers).toContain('DETACHED');
 const orphan=await fixture(false);
 expect((await orphan.tools.gitSync(orphan.projectId,orphan.threadId)).state).toBe('no-remote');
},60000);

it('fetch moves only refs/remotes/origin/* and pull fast-forwards a clean behind branch',async()=>{
 const f=await fixture(),{GitHubTools}=await import('../packages/workspace/github.ts');
 const bare=join(f.root,'remote.git');execFileSync('git',['init','--bare','-q',bare],{windowsHide:true});
 const github=new GitHubTools(f.tools,{} as never,'gh',()=>bare);
 const before=f.git(f.worktree,'status','--porcelain=v1','-z'),head=f.git(f.worktree,'rev-parse','HEAD');
 const remote=await remoteCommit(f,'remote.txt','remote side\n');f.git(f.path,'push','-q',bare,'HEAD:refs/heads/'+f.branch);
 let sync=await github.fetch(f.projectId,f.threadId);
 expect(sync.state).toBe('behind');expect(sync.lastFetchedAt).not.toBeNull();
 expect(f.git(f.worktree,'rev-parse','HEAD')).toBe(head);expect(f.git(f.worktree,'status','--porcelain=v1','-z')).toBe(before);
 sync=await github.pull(f.projectId,f.threadId,{revision:sync.revision,expectedHead:sync.head});
 expect(sync.state).toBe('up-to-date');expect(f.git(f.worktree,'rev-parse','HEAD')).toBe(remote.tip);
 remote.restore();
},60000);
it('pull refuses non-behind states and dirty overlap without changing the tree',async()=>{
 const f=await fixture(),{GitHubTools}=await import('../packages/workspace/github.ts');
 const bare=join(f.root,'remote.git');execFileSync('git',['init','--bare','-q',bare],{windowsHide:true});
 const github=new GitHubTools(f.tools,{} as never,'gh',()=>bare),head=f.git(f.worktree,'rev-parse','HEAD');
 f.git(f.path,'push','-q',bare,'HEAD:refs/heads/'+f.branch);
 let sync=await github.fetch(f.projectId,f.threadId);
 // up-to-date → UP_TO_DATE blocker
 await expect(github.pull(f.projectId,f.threadId,{revision:sync.revision,expectedHead:sync.head})).rejects.toMatchObject({code:'PULL_BLOCKED'});
 // stale revision → REVISION_CHANGED
 const remote=await remoteCommit(f,'shared.txt','remote edit\n');f.git(f.path,'push','-q',bare,'HEAD:refs/heads/'+f.branch);
 await github.fetch(f.projectId,f.threadId);
 await expect(github.pull(f.projectId,f.threadId,{revision:'0'.repeat(64),expectedHead:sync.head})).rejects.toMatchObject({code:'REVISION_CHANGED'});
 // overlapping dirty path → PULL_BLOCKED, tree byte-identical
 await writeFile(join(f.worktree,'shared.txt'),'local edit\n');
 const dirty=await github.fetch(f.projectId,f.threadId);
 await expect(github.pull(f.projectId,f.threadId,{revision:dirty.revision,expectedHead:dirty.head})).rejects.toMatchObject({code:'PULL_BLOCKED'});
 expect(f.git(f.worktree,'rev-parse','HEAD')).toBe(head);
 expect(f.git(f.worktree,'status','--porcelain=v1','-z')).toContain('shared.txt');
 // non-overlapping dirty path fast-forwards cleanly
 const {unlink}=await import('node:fs/promises');await unlink(join(f.worktree,'shared.txt'));
 const clean=await github.fetch(f.projectId,f.threadId);
 const out=await github.pull(f.projectId,f.threadId,{revision:clean.revision,expectedHead:clean.head});
 expect(out.state).toBe('up-to-date');expect(f.git(f.worktree,'rev-parse','HEAD')).toBe(remote.tip);
 remote.restore();
},60000);
