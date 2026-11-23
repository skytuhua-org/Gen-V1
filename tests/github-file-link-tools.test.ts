import Fastify from 'fastify';
import {afterEach,expect,it,vi} from 'vitest';
import {execFileSync} from 'node:child_process';
import {mkdtemp,mkdir,rm,writeFile,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {ZodError} from 'zod';
import {Store} from '../packages/storage/store.ts';
import {HarnessError} from '../packages/contracts/index.ts';
import type {Service} from '../packages/core/service.ts';
import type {ProjectTools} from '../packages/workspace/tools.ts';
import type {TerminalHost} from '../packages/workspace/terminal.ts';
import type {GitHubTools} from '../packages/workspace/github.ts';
import {ProjectTools as RealProjectTools} from '../packages/workspace/tools.ts';
import type {Thread} from '../packages/contracts/index.ts';
import {registerWorkspaceHost} from '../apps/server/workspace-host.ts';
import {registerWorkspaceRoutes} from '../apps/server/workspace-routes.ts';

const cleanup:(()=>Promise<void>)[]=[];
afterEach(async()=>{for(const close of cleanup.splice(0).reverse())await close();});
const sha256=(data:Buffer|string)=>createHash('sha256').update(data).digest('hex');
async function fixture(origin='https://github.com/acme/widgets.git'){
 const root=await mkdtemp(join(tmpdir(),'gen-github-link-')),path=join(root,'source');await mkdir(path);
 const store=new Store(join(root,'data')),tools=new RealProjectTools(store,{git:process.platform==='win32'?'C:/Program Files/Git/cmd/git.exe':'git'});
 cleanup.push(async()=>{await tools.dispose();store.close();await rm(root,{recursive:true,force:true,maxRetries:5});});
 const git=(...args:string[])=>execFileSync('git',['-C',path,...args],{windowsHide:true,encoding:'utf8'}).trim();
 git('init','-q');git('config','user.name','Fixture');git('config','user.email','fixture@example.invalid');
 if(origin)git('remote','add','origin',origin);
 await writeFile(join(path,'one.txt'),'base\n');git('add','.');git('commit','-qm','base');
 const receipt=await tools.connect({id:'connect',type:'workspace.project.connect',payload:{name:'Fixture',path}}),projectId=(receipt.result as {projects:{id:string}[]}).projects[0]!.id;
 const thread=(id:string):Thread=>({id,title:id,projectId,projectName:'Fixture',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'ready',epoch:0,runId:null,modelId:null,sessionPath:null,kind:'main'});
 const add=async(id:string)=>{const item=thread(id);store.internal('fixture',null,()=>store.put('thread',id,id,item));await tools.prepareWorkspace(item);return tools.binding(projectId,id);};
 return{root,path,store,tools,git,projectId,add};
}
it('returns a ready permalink for a legacy view whose HEAD sits on the admitted origin upstream',async()=>{
 const f=await fixture(),head=f.git('rev-parse','HEAD'),branch=f.git('rev-parse','--abbrev-ref','HEAD');
 f.git('update-ref','refs/remotes/origin/'+branch,head);
 const link=await f.tools.githubFileLink(f.projectId,undefined,'one.txt',sha256('base\n'));
 expect(link).toEqual({state:'ready',url:'https://github.com/acme/widgets/blob/'+head+'/one.txt',commit:head,repository:'acme/widgets',upstream:'origin/'+branch,path:'one.txt'});
},60000);
it('returns a ready permalink from a managed worktree view',async()=>{
 const f=await fixture(),binding=await f.add('worker');
 const managed=(args:string[])=>execFileSync('git',['--git-dir',binding.workspace!.commonDirectory,...args],{windowsHide:true,encoding:'utf8'}).trim();
 const head=managed(['rev-parse','refs/heads/'+binding.workspace!.branch]);
 managed(['update-ref','refs/remotes/origin/'+binding.workspace!.branch,head]);
 const link=await f.tools.githubFileLink(f.projectId,'worker','one.txt',sha256('base\n'));
 expect(link).toMatchObject({state:'ready',commit:head,repository:'acme/widgets',upstream:'origin/'+binding.workspace!.branch,path:'one.txt'});
},60000);
it('reports no-upstream when no remote-tracking ref covers the branch',async()=>{
 const f=await fixture();
 expect(await f.tools.githubFileLink(f.projectId,undefined,'one.txt',sha256('base\n'))).toEqual({state:'unavailable',reason:'no-upstream',detail:{branch:'main'}});
});
it('reports not-on-upstream when HEAD commits ahead of the last fetch',async()=>{
 const f=await fixture(),first=f.git('rev-parse','HEAD'),branch=f.git('rev-parse','--abbrev-ref','HEAD');
 f.git('update-ref','refs/remotes/origin/'+branch,first);
 await writeFile(join(f.path,'one.txt'),'newer\n');f.git('commit','-qam','newer');
 const link=await f.tools.githubFileLink(f.projectId,undefined,'one.txt',sha256('newer\n'));
 expect(link).toMatchObject({state:'unavailable',reason:'not-on-upstream',detail:{branch,commit:f.git('rev-parse','HEAD').slice(0,7),upstream:'origin/'+branch}});
});
it('reports untracked for a path absent from the HEAD tree',async()=>{
 const f=await fixture(),head=f.git('rev-parse','HEAD'),branch=f.git('rev-parse','--abbrev-ref','HEAD');
 f.git('update-ref','refs/remotes/origin/'+branch,head);await writeFile(join(f.path,'scratch.txt'),'scratch\n');
 expect(await f.tools.githubFileLink(f.projectId,undefined,'scratch.txt',sha256('scratch\n'))).toEqual({state:'unavailable',reason:'untracked'});
});
it('reports changed when working bytes differ from the HEAD blob, including autocrlf rewrites',async()=>{
 const f=await fixture(),head=f.git('rev-parse','HEAD'),branch=f.git('rev-parse','--abbrev-ref','HEAD');
 f.git('update-ref','refs/remotes/origin/'+branch,head);f.git('config','core.autocrlf','true');
 await writeFile(join(f.path,'one.txt'),'base\r\n');
 expect(await f.tools.githubFileLink(f.projectId,undefined,'one.txt',sha256('base\r\n'))).toEqual({state:'unavailable',reason:'changed'});
});
it('reports binary for tracked files containing NUL bytes',async()=>{
 const f=await fixture();await writeFile(join(f.path,'blob.bin'),Buffer.from([0,1,2,3]));f.git('add','blob.bin');f.git('commit','-qm','bin');
 const head=f.git('rev-parse','HEAD'),branch=f.git('rev-parse','--abbrev-ref','HEAD');f.git('update-ref','refs/remotes/origin/'+branch,head);
 expect(await f.tools.githubFileLink(f.projectId,undefined,'blob.bin',sha256(Buffer.from([0,1,2,3])))).toEqual({state:'unavailable',reason:'binary'});
});
it('reports not-utf8 for tracked text that does not round-trip',async()=>{
 const f=await fixture();await writeFile(join(f.path,'latin.txt'),Buffer.from([0x68,0x69,0xe9]));f.git('add','latin.txt');f.git('commit','-qm','latin');
 const head=f.git('rev-parse','HEAD'),branch=f.git('rev-parse','--abbrev-ref','HEAD');f.git('update-ref','refs/remotes/origin/'+branch,head);
 expect(await f.tools.githubFileLink(f.projectId,undefined,'latin.txt',sha256(Buffer.from([0x68,0x69,0xe9])))).toEqual({state:'unavailable',reason:'not-utf8'});
});
it('reports preview-stale when the client digest no longer matches current bytes',async()=>{
 const f=await fixture(),head=f.git('rev-parse','HEAD'),branch=f.git('rev-parse','--abbrev-ref','HEAD');f.git('update-ref','refs/remotes/origin/'+branch,head);
 expect(await f.tools.githubFileLink(f.projectId,undefined,'one.txt',sha256('older\n'))).toEqual({state:'unavailable',reason:'preview-stale'});
});
it('reports detached-head when HEAD is not a symbolic ref',async()=>{
 const f=await fixture();f.git('checkout','-q','--detach','HEAD');
 expect(await f.tools.githubFileLink(f.projectId,undefined,'one.txt',sha256('base\n'))).toEqual({state:'unavailable',reason:'detached-head'});
});
it('reports unborn-head before the first commit',async()=>{
 const f=await fixture();f.git('checkout','-q','--orphan','fresh');
 expect(await f.tools.githubFileLink(f.projectId,undefined,'one.txt',sha256('base\n'))).toEqual({state:'unavailable',reason:'unborn-head'});
});
it('reports origin-not-github for non-admitted remotes and no-origin without a remote',async()=>{
 const gitlab=await fixture('https://gitlab.com/acme/widgets.git');
 expect(await gitlab.tools.githubFileLink(gitlab.projectId,undefined,'one.txt',sha256('base\n'))).toEqual({state:'unavailable',reason:'origin-not-github'});
 const none=await fixture('');
 expect(await none.tools.githubFileLink(none.projectId,undefined,'one.txt',sha256('base\n'))).toEqual({state:'unavailable',reason:'no-origin'});
});
it('reports upstream-not-origin when the configured upstream belongs to another remote',async()=>{
 const f=await fixture(),branch=f.git('rev-parse','--abbrev-ref','HEAD');
 f.git('config','branch.'+branch+'.remote','fork');f.git('config','branch.'+branch+'.merge','refs/heads/'+branch);
 expect(await f.tools.githubFileLink(f.projectId,undefined,'one.txt',sha256('base\n'))).toEqual({state:'unavailable',reason:'upstream-not-origin',detail:{branch}});
});
it('resolves a configured origin upstream and reports not-regular-file for symlinks and gitlinks',async()=>{
 const f=await fixture();if(process.platform!=='win32')await symlink('one.txt',join(f.path,'alias.txt'));
 const nested=join(f.root,'nested');await mkdir(nested);execFileSync('git',['-C',nested,'init','-q'],{windowsHide:true});
 execFileSync('git',['-C',nested,'config','user.name','Fixture'],{windowsHide:true});execFileSync('git',['-C',nested,'config','user.email','fixture@example.invalid'],{windowsHide:true});
 execFileSync('git',['-C',nested,'commit','-q','--allow-empty','-m','nested'],{windowsHide:true});
 f.git('-c','protocol.file.allow=always','submodule','-q','add',nested,'vendor/nested');
 if(process.platform!=='win32')f.git('add','alias.txt');f.git('commit','-qm','extra');
 const head=f.git('rev-parse','HEAD'),branch=f.git('rev-parse','--abbrev-ref','HEAD');
 f.git('config','branch.'+branch+'.remote','origin');f.git('config','branch.'+branch+'.merge','refs/heads/release');
 f.git('update-ref','refs/remotes/origin/release',head);
 if(process.platform!=='win32')expect(await f.tools.githubFileLink(f.projectId,undefined,'alias.txt',sha256('one.txt'))).toEqual({state:'unavailable',reason:'not-regular-file'});
 expect(await f.tools.githubFileLink(f.projectId,undefined,'vendor/nested',sha256(''))).toEqual({state:'unavailable',reason:'not-regular-file'});
 const ready=await f.tools.githubFileLink(f.projectId,undefined,'one.txt',sha256('base\n'));
 expect(ready).toMatchObject({state:'ready',upstream:'origin/release',commit:head,repository:'acme/widgets'});
},60000);
it('keeps managed-view upstream state independent of the legacy view',async()=>{
 const f=await fixture(),binding=await f.add('worker');
 const managed=(args:string[])=>execFileSync('git',['--git-dir',binding.workspace!.commonDirectory,...args],{windowsHide:true,encoding:'utf8'}).trim();
 expect(await f.tools.githubFileLink(f.projectId,'worker','one.txt',sha256('base\n'))).toEqual({state:'unavailable',reason:'no-upstream',detail:{branch:binding.workspace!.branch}});
 const head=managed(['rev-parse','refs/heads/'+binding.workspace!.branch]);managed(['update-ref','refs/remotes/origin/'+binding.workspace!.branch,head]);
 expect(await f.tools.githubFileLink(f.projectId,'worker','one.txt',sha256('base\n'))).toMatchObject({state:'ready'});
 expect(await f.tools.githubFileLink(f.projectId,undefined,'one.txt',sha256('base\n'))).toEqual({state:'unavailable',reason:'no-upstream',detail:{branch:'main'}});
},60000);
async function routeFixture(){
 const root=await mkdtemp(join(tmpdir(),'gen-link-route-')),store=new Store(join(root,'data')),service={store} as Service,app=Fastify();
 cleanup.push(async()=>{await app.close();store.close();await rm(root,{recursive:true,force:true,maxRetries:5});});
 const githubFileLink=vi.fn(async(_projectId:string,threadId:string|undefined)=>{if(threadId==='foreign')throw new HarnessError('PROJECT_SCOPE','Project/thread scope denied');return{state:'ready' as const,url:'https://github.com/acme/widgets/blob/'+'a'.repeat(40)+'/one.txt',commit:'a'.repeat(40),repository:'acme/widgets',upstream:'origin/main',path:'one.txt'};});
 const projects={store,githubFileLink,workspace:{migrateProjects:vi.fn()},dispose:async()=>{}} as unknown as ProjectTools,terminals={dispose:async()=>{}} as TerminalHost;
 registerWorkspaceHost(service,{projects,terminals,github:{} as GitHubTools});
 app.setErrorHandler((error,_request,reply)=>reply.code(error instanceof ZodError?400:error instanceof HarnessError?403:500).send({error:{code:error instanceof HarnessError?error.code:'INVALID_INPUT'}}));
 registerWorkspaceRoutes(app,service);
 return{app,githubFileLink};
}
it('rejects malformed sha256 digests at the route layer and scopes denials by thread',async()=>{
 const{app,githubFileLink}=await routeFixture(),digest='a'.repeat(64);
 const bad=await app.inject('/api/projects/project/file/github-link?path=one.txt&sha256=zzz');expect(bad.statusCode).toBe(400);expect(githubFileLink).not.toHaveBeenCalled();
 const short=await app.inject('/api/projects/project/file/github-link?path=one.txt&sha256='+digest.slice(0,40));expect(short.statusCode).toBe(400);
 const denied=await app.inject('/api/projects/project/file/github-link?path=one.txt&sha256='+digest+'&threadId=foreign');expect(denied.statusCode).toBe(403);expect(denied.json().error.code).toBe('PROJECT_SCOPE');
 const ready=await app.inject('/api/projects/project/file/github-link?path=one.txt&sha256='+digest+'&threadId=worker');
 expect(ready.statusCode).toBe(200);expect(ready.headers['cache-control']).toBe('no-store');expect(ready.json().url).toContain('https://github.com/acme/widgets/blob/');
 expect(githubFileLink).toHaveBeenLastCalledWith('project','worker','one.txt',digest);
});
