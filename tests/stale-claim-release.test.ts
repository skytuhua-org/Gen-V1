import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {publicSourceAllowed,publicRuntimeSourceAllowed} from '../scripts/public-source.ts';

const workflow=readFileSync(new URL('../.github/workflows/stale-claim-release.yml',import.meta.url),'utf8').replaceAll('\r\n','\n');
const script=(workflow.split('          script: |\n')[1]??'').split('\n').map(line=>line.replace(/^ {12}/,'')).join('\n');
const now=Date.UTC(2026,10,25,22),a='codex-cloud-alpha',b='devin-web-bravo';
type Comment={id:number;body:string;created_at:string;html_url:string;user:{type:string};author_association:string};
const comment=(id:number,body:string,age=120):Comment=>({id,body,created_at:new Date(now-age*60000).toISOString(),html_url:'https://github.com/owner/repo/issues/42#issuecomment-'+id,user:{type:'User'},author_association:'COLLABORATOR'});
const claim=(worker:string,scope:string)=>`[${worker}] CLAIM | SCOPE=${scope} | OWNER=${worker}`;
const release=(worker:string,scope='')=>`[${worker}] RELEASE | ${scope?'SCOPE='+scope+' | ':''}OWNER=NONE`;
type Issue={number:number;title:string;html_url:string;assignees:{login:string}[];labels:string[];pull_request?:object};
const issue=(number=42):Issue=>({number,title:'Shared work',html_url:'https://github.com/owner/repo/issues/'+number,assignees:[{login:'worker-a'},{login:'worker-b'}],labels:['in-progress','active']});
async function execute(comments:Comment[],options:{eventName?:string;dryRun?:boolean|string;issues?:Issue[];readError?:boolean}={}){
  const writes:{method:string;args:unknown}[]=[],reads:number[]=[],logs:string[]=[],tables:string[][][]=[],raw:string[]=[];
  let summaryWrites=0;
  const record=(method:string)=>async(args:unknown)=>{writes.push({method,args});};
  const methods={listForRepo:async()=>{},listComments:async()=>{},removeAssignees:record('removeAssignees'),removeLabel:record('removeLabel'),createComment:record('createComment')};
  const github={rest:{issues:methods},paginate:async(method:unknown,args:{owner:string;repo:string;issue_number?:number;per_page:number;state?:string})=>{
    expect(args.owner).toBe('owner');expect(args.repo).toBe('repo');expect(args.per_page).toBe(100);
    if(method===methods.listForRepo){expect(args.state).toBe('open');return options.issues??[issue()];}
    expect(method).toBe(methods.listComments);reads.push(args.issue_number!);
    if(options.readError)throw Error('comment pagination denied');
    return comments;
  }};
  const summary={addHeading:(_text:string)=>summary,addRaw:(text:string)=>{raw.push(text);return summary;},addTable:(rows:string[][])=>{tables.push(rows);return summary;},write:async()=>{summaryWrites++;}};
  class Clock extends Date{static now(){return now;}}
  await runInNewContext('(async()=>{'+script+'\n})()',{github,context:{repo:{owner:'owner',repo:'repo'},eventName:options.eventName??'schedule',payload:{inputs:{dry_run:options.dryRun??true}}},core:{info:(message:string)=>logs.push(message),summary},Date:Clock},{timeout:1000});
  return {writes,reads,logs,tables,raw,summaryWrites,overdue:tables[0]?.slice(1).map(row=>({worker:row[1],scope:row[2]}))??[],diagnostics:tables[1]?.slice(1).map(row=>row.join(' '))??[]};
}

it.each([['schedule',true],['workflow_dispatch',true],['workflow_dispatch',false],['workflow_dispatch','false']] as const)('never writes for %s with legacy dry_run=%s',async(eventName,dryRun)=>{
  const result=await execute([comment(1,claim(a,'T01'))],{eventName,dryRun});
  expect(result.writes).toEqual([]);expect(result.overdue).toEqual([{worker:a,scope:'T01'}]);expect(result.summaryWrites).toBe(1);
});
it('uses read-only issue permissions and preserves its scheduled/manual inspection path',()=>{
  expect(workflow).toMatch(/permissions:\n  issues: read\n/);expect(workflow).not.toMatch(/issues: write/);
  expect(workflow).toContain('cron: "*/15 * * * *"');expect(workflow).toContain('workflow_dispatch:');
});
it.each(['RESUME CLAIM','SCOPE CLAIM'])('opens qualified %s scopes after an explicit release',async marker=>{
  const body=`[${b}] ${marker} | UTC=2026-11-25T20:00:00Z | PLAN_REV=review-r2 | STATUS=IN_PROGRESS\nPREV=https://github.com/owner/repo/issues/42#issuecomment-3; ISSUE=https://github.com/owner/repo/issues/42; OWNER=${b}; RECIPIENT=lead; ROLE=verifier; SCOPE=T02,T03`;
  const result=await execute([comment(1,claim(a,'T01'),200),comment(2,claim(b,'T01'),180),comment(3,release(b,'T01'),150),comment(4,body),comment(5,release(b,'T03'),90)]);
  expect(result.overdue).toEqual([{worker:a,scope:'T01'},{worker:b,scope:'T02'}]);expect(result.diagnostics).toEqual([]);expect(result.writes).toEqual([]);
});
it('keeps worker A visible after the newer worker B release',async()=>{
  const result=await execute([comment(1,claim(a,'T01')),comment(2,claim(b,'T02'),100),comment(3,release(b,'T02'),10)]);
  expect(result.overdue).toEqual([{worker:a,scope:'T01'}]);expect(result.writes).toEqual([]);
});
it('does not let a fresh worker B checkpoint refresh worker A',async()=>{
  const result=await execute([comment(1,claim(a,'T01')),comment(2,claim(b,'T02'),110),comment(3,`[${b}] CHECKPOINT | SCOPE=T02 | OWNER=${b}`,5)]);
  expect(result.overdue).toEqual([{worker:a,scope:'T01'}]);
});
it.each(['RELEASE','CHECKPOINT'])('applies a scoped %s only to its matching scope',async marker=>{
  const body=`[${a}] ${marker} | SCOPE=T02 | OWNER=${marker==='RELEASE'?'NONE':a}`;
  const result=await execute([comment(1,claim(a,'T01, T02')),comment(2,body,5)]);
  expect(result.overdue).toEqual([{worker:a,scope:'T01'}]);
});
it.each(['RELEASE','CHECKPOINT'])('preserves ambiguous multi-scope %s records for manual review',async marker=>{
  const result=await execute([comment(1,claim(a,'T01, T02')),comment(2,`[${a}] ${marker} | OWNER=${marker==='RELEASE'?'NONE':a}`,5)]);
  expect(result.overdue).toEqual([{worker:a,scope:'T01'},{worker:a,scope:'T02'}]);expect(result.diagnostics.join(' ')).toMatch(/ambiguous/i);
});
it('accepts a sole-scope release and a worker-local explicit ALL release',async()=>{
  expect((await execute([comment(1,claim(a,'T01')),comment(2,release(a),5)])).overdue).toEqual([]);
  const result=await execute([comment(1,claim(a,'T01,T02')),comment(2,claim(b,'T03')),comment(3,release(a,'ALL'),5)]);
  expect(result.overdue).toEqual([{worker:b,scope:'T03'}]);
});
it('preserves claims on OWNER conflicts and unmatched scope releases',async()=>{
  const result=await execute([comment(1,claim(a,'T01')),comment(2,claim(b,'T02')),comment(3,`[${a}] RELEASE | OWNER=${b} | SCOPE=T01`,10),comment(4,release(b,'T99'),5)]);
  expect(result.overdue).toEqual([{worker:a,scope:'T01'},{worker:b,scope:'T02'}]);expect(result.diagnostics.join(' ')).toMatch(/OWNER conflict/i);expect(result.diagnostics.join(' ')).toMatch(/unmatched scope/i);
});
it('ignores quoted and fenced release headers and OWNER fields',async()=>{
  const result=await execute([comment(1,claim(a,'T01')),comment(2,`> ${release(a,'T01')}`,90),comment(3,`\`\`\`text\n${release(a,'T01')}\n\`\`\``,80),comment(4,`[${a}] CHECKPOINT | SCOPE=T01 | OWNER=${a}\n> OWNER=NONE\n\`\`\`\nOWNER=NONE\n\`\`\`\nDELTA=quoted history says OWNER=NONE`,70)]);
  expect(result.overdue).toEqual([{worker:a,scope:'T01'}]);expect(result.writes).toEqual([]);
});
it('does not treat a release mentioned in header prose as a release marker',async()=>{
  const result=await execute([comment(1,claim(a,'T01')),comment(2,`[${a}] CHECKPOINT about an earlier RELEASE | SCOPE=T01 | OWNER=${a}`,90)]);
  expect(result.overdue).toEqual([{worker:a,scope:'T01'}]);
});
it('ignores an untrusted release while accepting an explicit live OWNER=NONE field',async()=>{
  const untrusted={...comment(2,release(a,'T01'),5),author_association:'NONE'};
  expect((await execute([comment(1,claim(a,'T01')),untrusted])).overdue).toEqual([{worker:a,scope:'T01'}]);
  const released=await execute([comment(1,claim(a,'T01')),comment(3,`[${a}] CHECKPOINT | SCOPE=T01\nOWNER=NONE; RECIPIENT=NONE`,5)]);
  expect(released.overdue).toEqual([]);
});
it('replays creation time and comment ID, ignoring author UTC text and input order',async()=>{
  const result=await execute([comment(4,claim(a,'T01'),60.5),comment(2,release(a,'T01'),100),comment(3,claim(b,'T02'),60),comment(1,claim(a,'T01')+' | UTC=2099-01-01T00:00Z',120)]);
  expect(result.overdue).toEqual([{worker:a,scope:'T01'}]);
  expect((await execute([comment(2,release(a,'T01'),90),comment(1,claim(a,'T01'),90)])).overdue).toEqual([]);
});
it('expands bounded task ranges and sends TASKS-only records to manual review without refreshing scopes',async()=>{
  const result=await execute([comment(1,claim(a,'T01-T03')),comment(2,`[${a}] CHECKPOINT | TASKS=T02:ACTIVE, T03:DONE | OWNER=${a}`,5)]);
  expect(result.overdue).toEqual([{worker:a,scope:'T01'},{worker:a,scope:'T02'},{worker:a,scope:'T03'}]);expect(result.diagnostics.join(' ')).toMatch(/TASKS/);
  const invalid=await execute([comment(1,claim(a,'T01')),comment(2,release(a,'T01-T999'),5)]);
  expect(invalid.overdue).toEqual([{worker:a,scope:'T01'}]);expect(invalid.diagnostics.join(' ')).toMatch(/scope/i);
});
it('does not turn unmatched checkpoints or invalid timestamps into ownership decisions',async()=>{
  const result=await execute([comment(1,claim(a,'T01')),{...comment(2,release(a,'T01'),5),created_at:'invalid'},comment(3,`[${b}] CHECKPOINT | SCOPE=T02 | OWNER=${b}`,90)]);
  expect(result.overdue).toEqual([{worker:a,scope:'T01'}]);expect(result.diagnostics.join(' ')).toMatch(/timestamp/i);expect(result.diagnostics.join(' ')).toMatch(/unmatched scope/i);
});
it('paginates every issue history, skips PRs and fails incomplete reads',async()=>{
  const result=await execute(Array.from({length:101},(_,i)=>comment(i+1,claim(a,'T'+i))),{issues:[issue(),{...issue(43),pull_request:{}},issue(44)]});
  expect(result.reads).toEqual([42,44]);expect(result.overdue).toHaveLength(202);
  await expect(execute([comment(1,claim(a,'T01'))],{readError:true})).rejects.toThrow('comment pagination denied');
});
it('escapes issue and scope text in the rendered summary',async()=>{
  const result=await execute([comment(1,claim(a,'<img src=x onerror=alert(1)>'))],{issues:[{...issue(),title:'<script>bad</script>'}]});
  const rendered=JSON.stringify(result.tables);expect(rendered).not.toContain('<script>');expect(rendered).not.toContain('<img');expect(rendered).toContain('&lt;img');expect(rendered).toContain('&lt;script&gt;');
});
it('admits the workflow, regression suite and complete plan as source-only inputs',()=>{
  for(const path of ['.github/workflows/stale-claim-release.yml','tests/stale-claim-release.test.ts','docs/agent-plans/stale-claim-audit-2026-11-25.md']){expect(publicSourceAllowed(path),path).toBe(true);expect(publicRuntimeSourceAllowed(path),path).toBe(false);}
});
