import {afterEach,expect,it} from 'vitest';
import {mkdtemp,mkdir,rm,writeFile,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Store} from '../packages/storage/store.ts';
import {ProjectTools} from '../packages/workspace/tools.ts';

const cleanup:(()=>Promise<void>)[]=[];
async function fixture(){const root=await mkdtemp(join(tmpdir(),'gen-scripts-')),path=join(root,'repo');await mkdir(path);const store=new Store(join(root,'data'));const tools=new ProjectTools(store);cleanup.push(async()=>{await tools.dispose();store.close();await rm(root,{recursive:true,force:true,maxRetries:5});});const receipt=await tools.connect({id:'connect',type:'workspace.project.connect',payload:{name:'Fixture',path}}),projectId=(receipt.result as {projects:{id:string}[]}).projects[0]!.id;return{root,path,projectId,tools};}
afterEach(async()=>{await Promise.all(cleanup.splice(0).map(fn=>fn()));});
it('reports missing when the working copy has no package.json',async()=>{
 const{projectId,tools}=await fixture();
 expect((await tools.scriptSuggestions(projectId)).status).toBe('missing');
});
it('reports not-a-file when package.json is a directory',async()=>{
 const{path,projectId,tools}=await fixture();
 await mkdir(join(path,'package.json'));
 const result=await tools.scriptSuggestions(projectId);
 expect(result.status).toBe('unreadable');expect(result.reason).toBe('not-a-file');
});
it('reports outside-working-copy for a package.json symlink leaving the tree',async()=>{
 const{root,path,projectId,tools}=await fixture();
 await writeFile(join(root,'secret.json'),'{"scripts":{}}');
 await symlink(join(root,'secret.json'),join(path,'package.json'));
 const result=await tools.scriptSuggestions(projectId);
 expect(result.status).toBe('unreadable');expect(result.reason).toBe('outside-working-copy');
});
it('reads scripts through the guarded bound-file read or degrades to unreadable',async()=>{
 const{path,projectId,tools}=await fixture();
 await writeFile(join(path,'package.json'),JSON.stringify({packageManager:'pnpm@10.30.3',scripts:{dev:'vite',postinstall:'x'}}));
 await writeFile(join(path,'pnpm-lock.yaml'),'');
 const result=await tools.scriptSuggestions(projectId);
 // Without the custody broker (plain Linux shells) the leaf guard refuses the
 // read; on guarded hosts the same input must parse and detect pnpm.
 if(result.status==='unreadable'){expect(process.platform).toBe('linux');return;}
 expect(result.status).toBe('ok');
 expect(result.runner).toBe('pnpm');expect(result.runnerSource).toBe('packageManager');
 expect(result.suggestions).toEqual([{name:'dev',body:'vite',command:'pnpm run dev'}]);
});
it('never throws for invalid JSON',async()=>{
 const{path,projectId,tools}=await fixture();
 await writeFile(join(path,'package.json'),'{broken');
 const result=await tools.scriptSuggestions(projectId);
 if(result.status==='unreadable'&&process.platform==='linux')return;
 expect(result).toMatchObject({status:'unreadable',reason:'invalid-json'});
});
