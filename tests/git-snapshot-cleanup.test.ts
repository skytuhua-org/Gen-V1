import {afterEach,expect,it,vi} from 'vitest';
import {execFileSync,spawnSync} from 'node:child_process';
import {lstat,mkdir,mkdtemp,readFile,readdir,rm,stat,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {opendir} from 'node:fs/promises';

// The native path guard is unavailable on this platform (CAPABILITY_DENIED),
// so the file-access layer is replaced by an in-process fake that enumerates
// guarded trees and records removal attempts. The repository logic under test
// — snapshot copy, owned cleanup ordering, outcome preservation — is real.
const probe={removed:[] as string[],failFirst:false};
vi.mock('../packages/core/file-access.ts',async importOriginal=>{
 const real=await importOriginal<typeof import('../packages/core/file-access.ts')>();
 const enumerate=async(paths:{path:string;leaf?:boolean;tree?:boolean}[])=>{
  const out:{path:string;directory:boolean;dev:string;ino:string;size:number}[]=[];
  const add=async(path:string)=>{
   const info=await lstat(path,{bigint:true});
   out.push({path,directory:info.isDirectory(),dev:String(info.dev),ino:String(info.ino),size:info.isFile()?Number(info.size):0});
   if(info.isDirectory()){const dir=await opendir(path);for await(const child of dir)await add(join(path,child.name));}
  };
  for(const entry of paths){
   if(entry.tree&&!entry.leaf){const dir=await opendir(entry.path);for await(const child of dir)await add(join(entry.path,child.name));}
   else await add(entry.path);
  }
  return out;
 };
 return{...real,
  withPathGuard:async(paths:{path:string;leaf?:boolean;tree?:boolean}[],_signal:unknown,action:(manifest:unknown)=>unknown)=>action(await enumerate(paths)),
  readBoundFile:(path:string)=>readFile(path),
  removeOwnedFile:async(path:string)=>{
   probe.removed.push(path);
   if(probe.failFirst){probe.failFirst=false;throw new Error('injected removal failure');}
   const info=await stat(path).catch(()=>null);if(info?.isDirectory())await rm(path,{recursive:true,force:true});else await rm(path,{force:true});
  },
 };
});
const {withGitMetadata}=await import('../packages/capabilities/git-access.ts');

const roots:string[]=[];
afterEach(async()=>{vi.restoreAllMocks();for(const root of roots.splice(0))await rm(root,{recursive:true,force:true,maxRetries:5});});
const git=(cwd:string,...args:string[])=>execFileSync('git',['-c','core.hooksPath=NUL','-c','core.fsmonitor=false','-c','user.name=Fixture','-c','user.email=fixture@example.invalid',...args],{cwd,windowsHide:true,encoding:'utf8',env:{...process.env,GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:process.platform==='win32'?'NUL':'/dev/null',GIT_OPTIONAL_LOCKS:'0'}});
async function fixture(){
 const root=await mkdtemp(join(tmpdir(),'harness-git-cleanup-'));roots.push(root);
 const base=join(root,'base');await mkdir(base);git(base,'init','-q');
 await writeFile(join(base,'tracked.txt'),'base\n');git(base,'add','tracked.txt');git(base,'commit','-qm','base');
 return{root,base};
}
const snapshot=<T>(path:string,action:(metadata:string,worktree:string)=>Promise<T>)=>withGitMetadata(path,new AbortController().signal,action);

it('attempts every owned cleanup after a removal failure and preserves the result',async()=>{
 const f=await fixture();probe.removed.length=0;probe.failFirst=true;
 const result=await snapshot(f.base,async()=>'primary-result');
 // A failed removal must not replace the operation's own result.
 expect(result).toBe('primary-result');
 // ... nor stop later owned entries from being attempted.
 expect(probe.removed.length).toBeGreaterThan(1);
});

it('attempts every owned cleanup after a removal failure and preserves an action error',async()=>{
 const f=await fixture();probe.removed.length=0;probe.failFirst=true;
 const failure=new Error('sentinel');
 const outcome=await snapshot(f.base,async()=>{throw failure;}).then(()=>{throw new Error('unreachable')},(error:unknown)=>error);
 expect(outcome).toBe(failure);
 expect(probe.removed.length).toBeGreaterThan(1);
});

it.each([
 ['frozen',()=>Object.freeze(new Error('sentinel'))],
 ['non-writable suppression',()=>Object.defineProperty(new Error('sentinel'),'suppressed',{value:null,writable:false})],
] as const)('preserves a %s action error when cleanup diagnostics cannot be attached',async(_kind,createFailure)=>{
 const f=await fixture();probe.removed.length=0;probe.failFirst=true;
 const diagnostic=vi.spyOn(process.stderr,'write').mockReturnValue(true);
 const failure=createFailure();
 const outcome=await snapshot(f.base,async()=>{throw failure;}).then(()=>{throw new Error('unreachable')},(error:unknown)=>error);
 expect(outcome).toBe(failure);
 expect(probe.removed.length).toBeGreaterThan(1);
 expect(diagnostic).toHaveBeenCalledWith('Gen V1 retained 1 Git snapshot temporary entry because cleanup could not be confirmed.\n');
});

it('preserves the successful result when the cleanup diagnostic sink throws',async()=>{
 const f=await fixture();probe.removed.length=0;probe.failFirst=true;
 vi.spyOn(process.stderr,'write').mockImplementation(()=>{throw new Error('diagnostic sink unavailable');});
 await expect(snapshot(f.base,async()=>'primary-result')).resolves.toBe('primary-result');
 expect(probe.removed.length).toBeGreaterThan(1);
});

it('removes every owned file on the normal path',async()=>{
 const f=await fixture();probe.removed.length=0;
 let worktree='';
 const result=await snapshot(f.base,async(_metadata,worktreePath)=>{worktree=worktreePath;return'ok';});
 expect(result).toBe('ok');expect(worktree).not.toBe('');
 await expect(lstat(worktree)).rejects.toThrow();
});

it('removes the workspace cost benchmark fixture even when Git startup fails',async()=>{
 const root=await mkdtemp(join(tmpdir(),'harness-cost-cleanup-'));roots.push(root);
 const env:NodeJS.ProcessEnv={...process.env,TMPDIR:root,GIT_CONFIG_COUNT:'1'};
 delete env.GIT_CONFIG_KEY_0;
 const result=spawnSync(process.execPath,['--import','tsx','scripts/measure-workspace-costs.ts','5','2','3'],{encoding:'utf8',env,timeout:10000});
 expect(result.error).toBeUndefined();
 expect(result.status).toBe(1);
 expect(result.stderr).toContain('missing config key GIT_CONFIG_KEY_0');
 expect(result.stdout).toBe('');
 expect((await readdir(root)).filter(name=>name.startsWith('gen-costs-'))).toEqual([]);
},15000);

it('still measures a successful workspace fixture and removes it',async()=>{
 const root=await mkdtemp(join(tmpdir(),'harness-cost-cleanup-'));roots.push(root);
 const env={...process.env,TMPDIR:root,GIT_CONFIG_COUNT:'0',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:process.platform==='win32'?'NUL':'/dev/null'};
 const result=spawnSync(process.execPath,['--import','tsx','scripts/measure-workspace-costs.ts','5','2','3'],{encoding:'utf8',env,timeout:10000});
 expect(result.error).toBeUndefined();
 expect(result.status).toBe(0);
 expect(result.stdout).toContain('fixture: 5 tracked, 2 modified (2 staged), 3 untracked');
 expect((await readdir(root)).filter(name=>name.startsWith('gen-costs-'))).toEqual([]);
},15000);
