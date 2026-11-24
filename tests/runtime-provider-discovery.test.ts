import {afterEach,expect,it} from 'vitest';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import type {ModelInfo,RuntimeAdapter} from '../packages/contracts/index.ts';
import type {ConnectionProviderId} from '../packages/contracts/connections.ts';
import {createRuntime} from '../packages/runtime/index.ts';

const roots:string[]=[];
afterEach(()=>{for(const root of roots.splice(0))rmSync(root,{recursive:true,force:true});});

function fakeAdapter(models:ModelInfo[]):RuntimeAdapter{
 return{configure(){},models:async()=>structuredClone(models),start:async()=>{},followUp:async()=>{},cancel:async()=>{},compact:async()=>{},history:async()=>[],dispose:async()=>{}};
}
function fixture(signingIn:ConnectionProviderId[]){
 const root=mkdtempSync(join(tmpdir(),'harness-provider-discovery-'));roots.push(root);
 const busy=new Set<string>(signingIn),claimed:string[]=[],released:string[]=[];
 const runtime=createRuntime({dataDir:root,accounts:{
  get:()=>null,
  isSigningIn:providerId=>busy.has(providerId),
  claimUse:providerId=>{const lease={id:'lease-'+providerId,nonce:'n'};claimed.push(lease.id);return lease;},
  releaseUse:lease=>{released.push(lease.id);},
 }},{
  pi:()=>fakeAdapter([{id:'openai/a',provider:'openai',name:'Busy model'},{id:'github-copilot/b',provider:'github-copilot',name:'Healthy model'}]),
  official:()=>fakeAdapter([]),
 });
 return{runtime,claimed,released};
}

it('keeps healthy sibling providers on a shared adapter while another signs in',async()=>{
 const f=fixture(['openai']);
 const models=await f.runtime.models();
 expect(models.map(model=>model.id)).toEqual(['github-copilot/b']);
 expect(f.claimed.length).toBeGreaterThan(0);
 // Every claimed probe permit is released once discovery finishes.
 expect([...f.released].sort()).toEqual([...f.claimed].sort());
});

it('rejects an explicit query for the provider that is signing in distinctly',async()=>{
 const f=fixture(['openai']);
 await expect(f.runtime.models({providerId:'openai'})).rejects.toMatchObject({code:'ACCOUNT_SIGNING_IN'});
});

it('still lists every healthy provider when none is signing in',async()=>{
 const f=fixture([]);
 const models=await f.runtime.models();
 expect(models.map(model=>model.id).sort()).toEqual(['github-copilot/b','openai/a']);
});
