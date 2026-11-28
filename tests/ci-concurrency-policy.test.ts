import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const workflow=readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
const concurrency=/^concurrency:\n((?: {2}.*\n)+)/m.exec(workflow)?.[1]??'';
const setting=(name:string)=>new RegExp('^ {2}'+name+':\\s*(.+)$','m').exec(concurrency)?.[1]?.trim();

it('cancels superseded pull-request runs but lets post-merge push verification finish',()=>{
 // The push run on a protected branch verifies a commit that already landed.
 // Cancelling it on the next merge meant no main run ever completed, so the
 // value must stay conditional on the event rather than a literal true, and it
 // must name pull_request specifically so an inverted comparison cannot pass.
 expect(setting('cancel-in-progress')).toBe("${{ github.event_name == 'pull_request' }}");
 expect(setting('group')).toContain('github.ref');
 // Removing the push trigger would also stop cancelling those runs, but it
 // would stop verifying merged commits too.
 expect(workflow).toMatch(/^on:\n {2}push:\n {4}branches: \[main[,]/m);
});

it('keeps two landed main revisions in different groups without changing same-PR cancellation',()=>{
 const group=setting('group')!;
 const key=(github:Record<string,string>)=>group.replace(/\$\{\{\s*([\s\S]*?)\s*\}\}/g,(_,expression:string)=>String(runInNewContext('('+expression+')',{github},{timeout:100})));
 const push={workflow:'CI',event_name:'push',ref:'refs/heads/main',sha:'a'.repeat(40)};
 expect(key(push)).not.toBe(key({...push,sha:'b'.repeat(40)}));
 expect(key(push)).not.toBe(key({...push,event_name:'workflow_dispatch'}));
 const pr={...push,event_name:'pull_request',ref:'refs/pull/42/merge'};
 expect(key(pr)).toBe(key({...pr,sha:'b'.repeat(40)}));
 expect(key(pr)).not.toBe(key({...pr,ref:'refs/pull/43/merge'}));
});

const issueLabelWorkflow=readFileSync(new URL('../.github/workflows/issue-labeler.yml',import.meta.url),'utf8').replaceAll('\r\n','\n');
const issueLabelScript=issueLabelWorkflow.split(/\n +script: \|\n/)[1]!;
function executeLabeler(get:()=>Promise<{data:{labels:{name:string}[]}}>,addLabels:(request:{labels:string[]})=>Promise<void>){
 const context={payload:{issue:{number:42,title:'Fix runtime crash',body:'Normal issue about startup.',labels:[]}},repo:{owner:'fixture',repo:'sample'}};
 return runInNewContext('(async()=>{'+issueLabelScript+'\n})()',{context,github:{rest:{issues:{get,addLabels}}}},{timeout:100}) as Promise<void>;
}

it('preserves type and priority labels added while the first-pass job was queued',async()=>{
 const writes:string[][]=[];
 await executeLabeler(async()=>({data:{labels:[{name:'enhancement'},{name:'priority:low'}]}}),async({labels})=>{writes.push(labels);});
 expect(writes).toEqual([['area:runtime','level:medium']]);
});

it('does not add labels from the event snapshot if GitHub cannot return the live labels',async()=>{
 const writes:string[][]=[];
 await expect(executeLabeler(async()=>{throw new Error('live labels not available');},async({labels})=>{writes.push(labels);}))
  .rejects.toThrow('live labels not available');
 expect(writes).toEqual([]);
});
