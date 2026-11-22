import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const workflow=readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8').replaceAll('\r\n','\n');
const jobSource=workflow.split(/^jobs:\n/m)[1]??'';
const starts=[...jobSource.matchAll(/^  ([\w-]+):\n/gm)];
const jobs=starts.map((match,index)=>{
  const block=jobSource.slice(match.index,starts[index+1]?.index);
  const shards=/^        shard:\s*(\[[^\]\n]+\])/m.exec(block)?.[1];
  return {id:match[1],condition:/^    if:\s*(.+)$/m.exec(block)?.[1]??'true',shards:shards?JSON.parse(shards) as number[]:null};
});
const requiredJobs=['checks','test/1','test/2','test/3','test/4','browser','installed-memory'];
const pullRequestJobs=['checks','select','selected'];
const types=/^  pull_request:\n    types:\s*\[([^\]\n]+)\]/m.exec(workflow)?.[1].split(',').map(value=>value.trim())??['opened','synchronize','reopened'];
type CiEvent={name:'pull_request'|'push'|'workflow_dispatch'|'merge_group';action?:string;draft?:boolean;ref?:string;selectedShards?:number};
function context(event:CiEvent){return {workflow:'CI',ref:event.ref??'refs/pull/42/merge',event_name:event.name,event:event.name==='pull_request'?{action:event.action,pull_request:{number:42,draft:event.draft}}:{}};}
function evaluate(expression:string,event:CiEvent):unknown {
  // The policy uses boolean/string comparisons and property access, whose
  // JavaScript and Actions semantics agree for these boolean/string fixtures.
  return runInNewContext('('+expression.replace(/^\$\{\{\s*|\s*\}\}$/g,'')+')',{github:context(event),needs:{select:{outputs:{total:String(event.selectedShards??1)}}}},{timeout:100});
}
function scheduledJobs(event:CiEvent):string[]|null {
  if(event.name==='pull_request'&&!types.includes(event.action??''))return null;
  if(event.name==='push'){
    const branches=/^  push:\n    branches:\s*\[([^\]\n]+)\]/m.exec(workflow)?.[1].split(',').map(value=>value.trim())??[];
    if(!branches.includes((event.ref??'').replace(/^refs\/heads\//,'')))return null;
  }
  if(event.name==='workflow_dispatch'&&!/^  workflow_dispatch:/m.test(workflow))return null;
  if(event.name==='merge_group'&&!/^  merge_group:/m.test(workflow))return null;
  return jobs.filter(job=>evaluate(job.condition,event)).flatMap(job=>job.shards?job.shards.map(shard=>job.id+'/'+shard):[job.id]);
}

it.each(['opened','synchronize','reopened'])('keeps draft %s events out of every runner job',action=>{
  expect(scheduledJobs({name:'pull_request',action,draft:true})).toEqual([]);
});
it.each(['opened','synchronize','reopened'])('runs checks and diff-selected tests for reviewable %s events',action=>{
  expect(scheduledJobs({name:'pull_request',action,draft:false})).toEqual(pullRequestJobs);
});
it('starts pull-request feedback when a draft becomes ready without another commit',()=>{
  expect(scheduledJobs({name:'pull_request',action:'opened',draft:true})).toEqual([]);
  expect(scheduledJobs({name:'pull_request',action:'ready_for_review',draft:false})).toEqual(pullRequestJobs);
});
it('cancels the same PR run when reviewable work becomes draft and admits no replacement jobs',()=>{
  const ready:CiEvent={name:'pull_request',action:'ready_for_review',draft:false};
  const draft:CiEvent={...ready,action:'converted_to_draft',draft:true};
  expect(scheduledJobs(ready)).toEqual(pullRequestJobs);
  expect(scheduledJobs(draft)).toEqual([]);
  const concurrency=/^concurrency:\n((?: {2}.*\n)+)/m.exec(workflow)?.[1]??'';
  const group=/^  group:\s*(.+)$/m.exec(concurrency)?.[1];
  const cancel=/^  cancel-in-progress:\s*(.+)$/m.exec(concurrency)?.[1];
  expect(group).toBeDefined();expect(cancel).toBeDefined();
  const groupFor=(event:CiEvent)=>group!.replace(/\$\{\{\s*([\s\S]*?)\s*\}\}/g,(_,expression:string)=>String(evaluate(expression,event)));
  expect(groupFor(draft)).toBe(groupFor(ready));
  expect(groupFor(draft)).not.toBe(groupFor({...draft,ref:'refs/pull/43/merge'}));
  expect(evaluate(cancel!,draft)).toBe(true);
});
it.each(['main','agent/m05-v3'])('preserves every job for pushes to %s without a pull request payload',branch=>{
  expect(scheduledJobs({name:'push',ref:'refs/heads/'+branch})).toEqual(requiredJobs);
});
it('preserves every job for a manual dispatch without a pull request payload',()=>{
  expect(scheduledJobs({name:'workflow_dispatch',ref:'refs/heads/main'})).toEqual(requiredJobs);
});
it('runs every job for a merge queue entry before it reaches main',()=>{
  expect(scheduledJobs({name:'merge_group',ref:'refs/heads/gh-readonly-queue/main/pr-42-'+'a'.repeat(40)})).toEqual(requiredJobs);
});
it('reports every failing check in the folded job instead of stopping at the first',()=>{
  const checks=jobSource.split(/^  checks:\n/m)[1]?.split(/^  test:\n/m)[0]??'';
  const steps=checks.split(/^      - name:/m).slice(1);
  expect(steps.length).toBeGreaterThan(10);
  for(const step of steps.slice(2))expect(step).toMatch(/^        if: \$\{\{ !cancelled\(\) && steps\.(setup|visuals|build)\.outcome == 'success' \}\}$/m);
  for(const step of steps)expect(step).not.toMatch(/continue-on-error|always\(\)/);
  for(const command of ['pnpm lint','pnpm typecheck','pnpm build','pnpm desktop:build','pnpm test:ui-guard','tests/hermes_source_contract.py','tests/hermes_atomic_controls.py','tests/hermes_source_worker.py','tests/memory_native_checkpoint_v3.py','tests/memory_native_checkpoint_worker_v3.py','tests/plugin-api-package.test.mjs'])expect(checks).toContain(command);
});

it('does not let a successful visuals package build mask a failed typecheck',()=>{
  const checks=jobSource.split(/^  checks:\n/m)[1]?.split(/^  test:\n/m)[0]??'';
  const typecheck=checks.split(/^      - name:/m).find(block=>block.includes('pnpm --dir plugins/personal-visuals typecheck'));
  const build=checks.split(/^      - name:/m).find(block=>block.includes('pnpm --dir plugins/personal-visuals build'));
  expect(typecheck).toBeDefined();
  expect(build).toBeDefined();
  expect(typecheck).not.toBe(build);
  expect(typecheck).not.toMatch(/^        continue-on-error:/m);
  expect(build).not.toMatch(/^        continue-on-error:/m);
  // Both gate only on the shared dependency install, never on each other.
  expect(typecheck).not.toMatch(/steps\.(?!visuals\b)\w+\.outcome/);
  expect(build).not.toMatch(/steps\.(?!visuals\b)\w+\.outcome/);
});

const auditWorkflow=readFileSync(new URL('../.github/workflows/m01-m03-audit.yml',import.meta.url),'utf8').replaceAll('\r\n','\n');
const auditTypes=/^  pull_request:\n    types:\s*\[([^\]\n]+)\]/m.exec(auditWorkflow)?.[1].split(',').map(value=>value.trim())??['opened','synchronize','reopened'];
const auditPaths=[...auditWorkflow.matchAll(/^      - '([^'\n]+)'$/gm)].map(match=>match[1]);
const auditCondition=/^    if:\s*(.+)$/m.exec(auditWorkflow.split(/^  integration:\n/m)[1]??'')?.[1]??'true';
function scheduledAudit(event:CiEvent,paths=['.github/workflows/m01-m03-audit.yml']):string[]|null {
  if(event.name==='pull_request'&&(!auditTypes.includes(event.action??'')||!paths.some(path=>auditPaths.includes(path))))return null;
  if(event.name!=='pull_request'&&(event.name!=='workflow_dispatch'||!/^  workflow_dispatch:/m.test(auditWorkflow)))return null;
  return evaluate(auditCondition,event)?['integration']:[];
}
it.each(['opened','synchronize','reopened'])('keeps the Windows audit out of draft %s events',action=>{
  expect(scheduledAudit({name:'pull_request',action,draft:true})).toEqual([]);
});
it.each(['opened','synchronize','reopened'])('runs the Windows audit for reviewable %s events',action=>{
  expect(scheduledAudit({name:'pull_request',action,draft:false})).toEqual(['integration']);
});
it('starts the audit when ready and cancels its same-PR run when converted back to draft',()=>{
  const ready:CiEvent={name:'pull_request',action:'ready_for_review',draft:false};
  const draft:CiEvent={...ready,action:'converted_to_draft',draft:true};
  expect(scheduledAudit(ready)).toEqual(['integration']);expect(scheduledAudit(draft)).toEqual([]);
  const concurrency=/^concurrency:\n((?: {2}.*\n)+)/m.exec(auditWorkflow)?.[1]??'';
  const group=/^  group:\s*(.+)$/m.exec(concurrency)?.[1],cancel=/^  cancel-in-progress:\s*(.+)$/m.exec(concurrency)?.[1];
  expect(group).toBe('m01-m03-audit-${{ github.ref }}');expect(cancel).toBeDefined();
  const groupFor=(event:CiEvent)=>group!.replace(/\$\{\{\s*([\s\S]*?)\s*\}\}/g,(_,expression:string)=>String(evaluate(expression,event)));
  expect(groupFor(draft)).toBe(groupFor(ready));expect(groupFor(draft)).not.toBe(groupFor({...draft,ref:'refs/pull/43/merge'}));
  expect(evaluate(cancel!,draft)).toBe(true);
});
it('retains manual audit dispatch without a PR payload or matching changed paths',()=>{
  expect(scheduledAudit({name:'workflow_dispatch',ref:'refs/heads/main'},[])).toEqual(['integration']);
});
it('keeps all four audit path filters and does not admit unrelated application changes',()=>{
  expect(auditPaths).toEqual(['.github/workflows/m01-m03-audit.yml','scripts/validate-m01-m03-integration.mjs','scripts/validate-m01-m03-integration.test.mjs','docs/implementation/v3/audits/2026-11-17/heads.json']);
  const ready:CiEvent={name:'pull_request',action:'synchronize',draft:false};
  for(const path of auditPaths)expect(scheduledAudit(ready,[path])).toEqual(['integration']);
  expect(scheduledAudit(ready,['apps/web/src/App.tsx'])).toBeNull();
});
it('selects pull-request tests from the merge commit diff and keeps the full suite for the merge queue',()=>{
  const select=jobSource.split(/^  select:\n/m)[1]?.split(/^  selected:\n/m)[0]??'';
  const selected=jobSource.split(/^  selected:\n/m)[1]??'';
  for(const job of [select,selected])expect(job).toMatch(/^          fetch-depth: 2$/m);
  expect(select).toContain('vitest list --changed HEAD^1 --filesOnly');
  expect(selected).toContain('pnpm test --maxWorkers=1 --changed HEAD^1 --shard $env:SHARD');
  expect(selected).toContain('shard: ${{ fromJSON(needs.select.outputs.shards) }}');
  for(const job of [select,selected])expect(job).not.toMatch(/continue-on-error|always\(\)|--passWithNoTests/);
  for(const id of ['test','browser','installed-memory'])expect(jobs.find(job=>job.id===id)?.condition).toBe("github.event_name != 'pull_request'");
});
it('books no Windows test runner when the diff reaches no test',()=>{
  expect(scheduledJobs({name:'pull_request',action:'synchronize',draft:false,selectedShards:0})).toEqual(['checks','select']);
});
it('fails any job that exceeds its time budget',()=>{
  const budgets=Object.fromEntries(starts.map((match,index)=>[match[1],Number(/^    timeout-minutes: (\d+)$/m.exec(jobSource.slice(match.index,starts[index+1]?.index))?.[1])]));
  expect(budgets).toEqual({checks:15,test:22,browser:30,'installed-memory':60,select:5,selected:22});
});
