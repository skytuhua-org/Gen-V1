import {expect,it} from 'vitest';
import {execFile} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {createServer} from 'node:http';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

type Run={id:number;event:string;head_sha:string;path:string;status:string;conclusion:string|null;head_branch:string;html_url:string;repository:{full_name:string};head_repository:{full_name:string}};
type Job={name:string;head_sha:string;status:string;conclusion:string|null};
type Proof={verified:boolean;reason:string;run?:string};
const script=resolve('scripts/ci-queue-verified.mjs');
const {findQueueProof,requiredJobs}=await import(pathToFileURL(script).href) as {requiredJobs:string[];findQueueProof(input:{api?:string;repository?:string;sha?:string;token?:string;request?:(url:string,init:{headers:Record<string,string>})=>Promise<{ok:boolean;status:number;json():Promise<unknown>}>}):Promise<Proof>};
const repository='skytuhua-org/Gen-V1',sha='a'.repeat(40);
const run=(change:Partial<Run>={}):Run=>({id:7,event:'merge_group',head_sha:sha,path:'.github/workflows/ci.yml',status:'completed',conclusion:'success',head_branch:'gh-readonly-queue/main/pr-42-'+'b'.repeat(40),html_url:'https://github.example/runs/7',repository:{full_name:repository},head_repository:{full_name:repository},...change});
const passed=():Job[]=>[...requiredJobs.map(name=>({name,head_sha:sha,status:'completed',conclusion:'success'})),{name:'Select tests reachable from the diff',head_sha:sha,status:'completed',conclusion:'skipped'}];
function api(runs:Run[],jobs:Job[]|((id:number)=>Job[]),seen:string[]=[]){
  return async(url:string,init:{headers:Record<string,string>})=>{
    seen.push(url+' '+(init.headers.authorization??''));
    const id=/\/actions\/runs\/(\d+)\/jobs\?filter=latest&per_page=100$/.exec(url)?.[1];
    const listed=id?typeof jobs==='function'?jobs(Number(id)):jobs:[];
    return {ok:true,status:200,json:async()=>id?{total_count:listed.length,jobs:listed}:{workflow_runs:runs}};
  };
}
const prove=(runs:Run[],jobs:Job[]|((id:number)=>Job[])=passed())=>findQueueProof({repository,sha,token:'t',request:api(runs,jobs)});

it('proves a pushed commit whose merge-queue run passed every required job',async()=>{
  const seen:string[]=[];
  const proof=await findQueueProof({api:'https://api.example',repository,sha,token:'t',request:api([run()],passed(),seen)});
  expect(proof).toEqual({verified:true,run:'https://github.example/runs/7',reason:expect.stringContaining('passed all 7 required jobs')});
  expect(seen).toEqual(['https://api.example/repos/'+repository+'/actions/runs?event=merge_group&head_sha='+sha+'&per_page=100 Bearer t','https://api.example/repos/'+repository+'/actions/runs/7/jobs?filter=latest&per_page=100 Bearer t']);
});
it('names the seven required checks of the main ruleset',()=>{
  expect(requiredJobs).toEqual(['Windows checks','Tests (shard 1/4)','Tests (shard 2/4)','Tests (shard 3/4)','Tests (shard 4/4)','Browser tests','Installed desktop memory retention and opt-in']);
});
it.each<[string,Partial<Run>]>([
  ['another event',{event:'push'}],
  ['another commit',{head_sha:'c'.repeat(40)}],
  ['another workflow',{path:'.github/workflows/docs-links.yml'}],
  ['a branch outside the main queue',{head_branch:'gh-readonly-queue/agent/m05-v3/pr-1-'+'b'.repeat(40)}],
  ['a fork',{head_repository:{full_name:'someone/Gen-V1'}}],
  ['a run still in progress',{status:'in_progress',conclusion:null}],
  ['a failed run',{conclusion:'failure'}],
  ['a cancelled run',{conclusion:'cancelled'}],
])('finds no proof in %s',async(_,change)=>{
  expect((await prove([run(change)])).verified).toBe(false);
});
it('finds no proof when no merge-queue run exists, as for a direct push',async()=>{
  expect(await prove([])).toEqual({verified:false,reason:expect.stringContaining('no successful merge-queue run')});
});
it.each<[string,(jobs:Job[])=>Job[]]>([
  ['a required job was skipped',jobs=>jobs.map(job=>job.name==='Browser tests'?{...job,conclusion:'skipped'}:job)],
  ['a required job is missing',jobs=>jobs.filter(job=>job.name!=='Tests (shard 3/4)')],
  ['a required job appears twice',jobs=>[...jobs,jobs[0]]],
  ['a required job failed',jobs=>jobs.map(job=>job.name==='Windows checks'?{...job,conclusion:'failure'}:job)],
  ['another job failed',jobs=>[...jobs,{name:'Extra',head_sha:sha,status:'completed',conclusion:'failure'}]],
  ['a job is still running',jobs=>[...jobs,{name:'Extra',head_sha:sha,status:'in_progress',conclusion:null}]],
  ['a job ran another commit',jobs=>jobs.map(job=>job.name==='Browser tests'?{...job,head_sha:'c'.repeat(40)}:job)],
])('finds no proof when %s',async(_,change)=>{
  expect((await prove([run()],change(passed()))).verified).toBe(false);
});
it('finds no proof when the job list is truncated',async()=>{
  const request=async(url:string)=>({ok:true,status:200,json:async()=>url.includes('/jobs?')?{total_count:101,jobs:passed()}:{workflow_runs:[run()]}});
  expect((await findQueueProof({repository,sha,request})).verified).toBe(false);
});
it('accepts a later passing run after an unusable one for the same commit',async()=>{
  const proof=await prove([run({id:1}),run({id:2,html_url:'https://github.example/runs/2'})],id=>id===1?passed().slice(1):passed());
  expect(proof).toMatchObject({verified:true,run:'https://github.example/runs/2'});
});
it.each([['',sha],[repository,'main'],[repository,sha.toUpperCase()],['../evil',sha]])('makes no request for repository %j and commit %j',async(repo,commit)=>{
  const seen:string[]=[];
  expect((await findQueueProof({repository:repo,sha:commit,request:api([run()],passed(),seen)})).verified).toBe(false);
  expect(seen).toEqual([]);
});
it('surfaces a failed request to the caller instead of treating it as proof',async()=>{
  await expect(findQueueProof({repository,sha,request:async()=>({ok:false,status:503,json:async()=>({})})})).rejects.toThrow('GitHub answered 503');
});

function cli(handler:(url:string)=>{status:number;body:unknown}){
  return new Promise<{code:number|null;output:string;summary:string}>((done,fail)=>{
    const directory=mkdtempSync(join(tmpdir(),'queue-proof-'));
    const server=createServer((request,response)=>{const {status,body}=handler(request.url??'');response.writeHead(status,{'content-type':'application/json'}).end(JSON.stringify(body));});
    server.listen(0,'127.0.0.1',()=>{
      const address=server.address();
      const port=typeof address==='object'&&address?address.port:0;
      const output=join(directory,'output'),summary=join(directory,'summary');
      execFile(process.execPath,[script],{env:{...process.env,GITHUB_API_URL:'http://127.0.0.1:'+port,GITHUB_REPOSITORY:repository,GITHUB_SHA:sha,GITHUB_TOKEN:'t',GITHUB_OUTPUT:output,GITHUB_STEP_SUMMARY:summary}},error=>{
        server.close();
        try{done({code:error?Number(error.code):0,output:readFileSync(output,'utf8'),summary:readFileSync(summary,'utf8')});}catch(reason){fail(reason);}finally{rmSync(directory,{recursive:true,force:true});}
      });
    });
  });
}
it('writes verified=true and names the run when the workflow step finds proof',async()=>{
  const result=await cli(url=>({status:200,body:url.includes('/jobs?')?{total_count:passed().length,jobs:passed()}:{workflow_runs:[run()]}}));
  expect(result).toMatchObject({code:0,output:'verified=true\n'});
  expect(result.summary).toBe('Full suite skipped: merge-queue run 7 passed all 7 required jobs on '+sha+' (https://github.example/runs/7).\n');
});
it('writes verified=false and still exits 0 when the lookup fails, so the full suite runs',async()=>{
  const result=await cli(()=>({status:500,body:{}}));
  expect(result).toMatchObject({code:0,output:'verified=false\n'});
  expect(result.summary).toMatch(/^Full suite runs: lookup failed: GitHub answered 500 /);
});
