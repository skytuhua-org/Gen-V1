// T01 baseline for issue #1961: count Git subprocess invocations, wall time and
// output bytes for the workspace status, listing (comparison snapshot) and
// file-comparison paths on a large working copy.
//
// The kernel path-guard broker only exists on managed installs (Windows CI), so
// this measures the identical `nativeGit` argv sequences that
// ProjectTools.status (packages/workspace/tools.ts) and localSnapshot
// (packages/workspace/code-review.ts) issue. Guard acquisitions are reported
// analytically from the batching rule in untrackedDigests: one acquisition per
// batch of at most 256 untracked leaves.
//
// Usage: pnpm exec tsx scripts/measure-workspace-costs.ts [trackedFiles] [changedFiles] [untrackedFiles]
import {execFileSync} from 'node:child_process';
import {mkdir,mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {performance} from 'node:perf_hooks';
import {gitExecutable} from '../packages/capabilities/process.ts';
import {nativeGit} from '../packages/workspace/git-storage.ts';

const tracked=Number(process.argv[2]??2000),changed=Number(process.argv[3]??40),untracked=Number(process.argv[4]??300);
const root=await mkdtemp(join(tmpdir(),'gen-costs-'));
try { await benchmark(root); }
catch(error){
  try { await cleanup(root); }
  catch(cleanupError){throw new AggregateError([error,cleanupError],'Workspace cost benchmark and fixture cleanup failed.',{cause:error});}
  throw error;
}
await cleanup(root);

function cleanup(directory:string){
  return rm(directory,{recursive:true,force:true,maxRetries:3});
}

async function benchmark(root:string){
  const executable=gitExecutable();
  const git=(cwd:string,...args:string[])=>execFileSync(executable,['-C',cwd,...args],{encoding:'utf8',windowsHide:true});
  const path=join(root,'repo'),metadata=join(path,'.git');
  await mkdir(path,{recursive:true});
  git(path,'init','-q','-b','main');git(path,'config','user.name','Fixture');git(path,'config','user.email','fixture@example.invalid');git(path,'config','core.autocrlf','false');
  await writeFile(join(path,'.gitignore'),'ignored/\n');
  for(let i=0;i<tracked;i++){const dir=join(path,'src',`d${i%50}`);await mkdir(dir,{recursive:true});await writeFile(join(dir,`f${i}.txt`),`line one\nline two\nfile ${i}\n`);}
  git(path,'add','.');git(path,'commit','-qm','Initial');
  for(let i=0;i<changed;i++)await writeFile(join(path,'src',`d${i%50}`,`f${i}.txt`),`line one\nline two\nfile ${i}\nedited\n`);
  for(let i=0;i<Math.min(10,changed);i++)git(path,'add',`src/d${i%50}/f${i}.txt`);
  // Keep the sampled comparison file genuinely dirty in the worktree after it
  // is also staged, so the one-process numstat+patch measurement reads a real patch.
  if(changed)await writeFile(join(path,'src','d0','f0.txt'),'line one\nline two\nfile 0\nedited\nunstaged edit\n');
  for(let i=0;i<untracked;i++)await writeFile(join(path,`new-${i}.txt`),`untracked ${i}\n`);
  await mkdir(join(path,'ignored'),{recursive:true});for(let i=0;i<200;i++)await writeFile(join(path,'ignored',`g${i}.log`),`ignored ${i}\n`);

  const signal=new AbortController().signal,run=(args:string[])=>nativeGit(executable,metadata,path,args,signal);
  async function measure(label:string,runCalls:string[][]){
    let totalMs=0,bytes=0;
    const started=Date.now();
    for(const args of runCalls){
      const callStarted=performance.now();
      const output=await run(args);
      totalMs+=performance.now()-callStarted;
      bytes+=Buffer.byteLength(output);
    }
    console.log(`${label}: ${runCalls.length} git subprocesses, ${totalMs.toFixed(0)}ms git wall time, ${(bytes/1024).toFixed(0)} KiB output, ${Date.now()-started}ms end-to-end`);
    for(const args of runCalls)console.log(`  ${args.slice(0,4).join(' ')}${args.length>4?' …':''}`);
  }
  // ProjectTools.status — tools.ts status() (one status call, managed working copy)
  await measure('gitStatus',[
   ['rev-parse','HEAD'],
   ['status','--porcelain=v1','-b','-z','--untracked-files=all'],
   ['diff','--full-index','--no-ext-diff','--no-textconv'],
   ['diff','--cached','--full-index','--no-ext-diff','--no-textconv'],
   ['diff','--numstat','-z','--no-ext-diff','--no-textconv','HEAD'],
  ]);
  // localSnapshot — code-review.ts readLocalComparison snapshot read.
  await measure('localSnapshot (gitComparison)',[
   ['rev-parse','HEAD'],
   ['ls-files','--stage','-z'],
   ['status','--porcelain=v1','-b','-z','--untracked-files=all'],
  ]);
  // readLocalComparisonFile — one subprocess per tracked change after #1961
  const sample=`src/d0/f0.txt`;
  await measure(`gitComparisonFile ${sample}`,[
   ['diff','--numstat','-z','--patch','--full-index','--no-color','--no-ext-diff','--no-textconv','--find-renames','--',`:(literal)${sample}`],
  ]);
  console.log(`\nGuard-call cost after #1961: gitStatus = ceil(${untracked}/256)=${Math.ceil(untracked/256)} withPathGuard acquisitions (was ${untracked}) + ${untracked} file reads; localSnapshot = ${changed} guarded file reads + ${changed} file diffs (was ${changed}x2); gitComparisonFile = 1 guarded read.`);
  console.log(`fixture: ${tracked} tracked, ${changed} modified (${Math.min(10,changed)} staged), ${untracked} untracked, 200 ignored; nativeGit 4 MiB cap=${4*1024*1024}B`);
}
