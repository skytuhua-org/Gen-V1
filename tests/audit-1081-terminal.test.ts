import {afterEach,expect,it,vi} from 'vitest';
import {mkdtemp,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Store} from '../packages/storage/store.ts';
import {ProjectTools} from '../packages/workspace/tools.ts';
import {TerminalHost} from '../packages/workspace/terminal.ts';

const cleanup:(()=>Promise<void>)[]=[];afterEach(async()=>{vi.restoreAllMocks();for(const close of cleanup.splice(0).reverse())await close();});

// Issue #1081 defect (a): open() must not leave a live, registered terminal
// when the durable session record cannot be written.
it('releases the spawned terminal when durable registration fails',async()=>{
 const root=await mkdtemp(join(tmpdir(),'gen-pty-persist-'));await mkdir(join(root,'project'));
 const store=new Store(join(root,'data')),tools=new ProjectTools(store),host=new TerminalHost(tools);
 cleanup.push(async()=>{await host.dispose().catch(()=>{});store.close();await rm(root,{recursive:true,force:true,maxRetries:20,retryDelay:250});});
 const receipt=await tools.connect({id:'connect',type:'workspace.project.connect',payload:{name:'Terminal fixture',path:join(root,'project')}});
 const projectId=(receipt.result as {projects:{id:string}[]}).projects[0]!.id;
 const original=store.internal.bind(store);
 store.internal=(type:string,threadId:string|null,apply:()=>unknown)=>{if(type==='terminal.changed')throw new Error('durable write unavailable');return original(type,threadId,apply);};
 await expect(host.open({projectId,terminalId:'doomed',program:process.execPath,args:['-e','setTimeout(()=>{},60000)']})).rejects.toThrow('durable write unavailable');
 expect(store.get('terminalSession','doomed')).toBeNull();
 // The failed open must not leave a reachable live session behind.
 await expect(host.read('doomed',projectId)).rejects.toMatchObject({code:'NOT_FOUND'});
 store.internal=original;
},20000);
