import {EventEmitter} from 'node:events';
import {PassThrough} from 'node:stream';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createInterface} from 'node:readline';
import {query as pinnedQuery} from '@anthropic-ai/claude-agent-sdk';
import {afterEach,expect,it,vi} from 'vitest';
import {createOfficialRuntime} from '../packages/runtime-official/index.ts';
import type {RuntimeEvent} from '../packages/contracts/index.ts';
import {openClaude} from '../packages/runtime-official/claude.ts';
import {openManifest} from '../packages/runtime-official/manifest.ts';
import type {DriverContext} from '../packages/runtime-official/internal.ts';

vi.mock('node:child_process',async importOriginal=>({...await importOriginal<typeof import('node:child_process')>(),spawn:vi.fn()}));
import {spawn} from 'node:child_process';
const directories:string[]=[];
afterEach(async()=>{vi.restoreAllMocks();for(const path of directories.splice(0))await rm(path,{recursive:true,force:true});});

it.each([
  { args: ['--strict-mcp-config', '--mcp-config', '{}'] },
  { args: ['--strict-mcp-config', '--mcp-config={}'] },
  { args: [] },
])('refuses unexpected MCP launch arguments before spawning ($args)', async ({args}) => {
  const directory = await mkdtemp(join(tmpdir(), 'official-mcp-launch-')); directories.push(directory);
  const child = Object.assign(new EventEmitter(), {stdin: new PassThrough(), stdout: new PassThrough(), stderr: new PassThrough()});
  vi.mocked(spawn).mockClear().mockReturnValue(child as unknown as ReturnType<typeof spawn>);
  const context: DriverContext = {
    dataDir: directory, taskDir: directory, manifest: await openManifest(directory, 'claude-code', 'thread', null),
    mcp: { url: 'http://127.0.0.1:1/mcp', headers: {}, names: new Set(), close: async () => {} },
    current: () => true, event() {}, observed: async () => [], inputIds: () => [], own() {}, ready() {},
  };
  const opening = openClaude(context, { query({options}) {
    options!.spawnClaudeCodeProcess!({command: 'synthetic-native', args, cwd: directory, env: {}, signal: new AbortController().signal});
    throw new Error('Synthetic callback reached spawn');
  } });
  await expect(opening).rejects.toMatchObject({code: 'OFFICIAL_MCP_CONFIG_REJECTED'});
  expect(spawn).not.toHaveBeenCalled();
});

it('keeps the host MCP header out of pinned SDK launch arguments and environment', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'official-mcp-custody-')); directories.push(directory);
  const placeholder = 'Bearer fabricated-test-placeholder';
  const host = { type: 'http', url: 'http://127.0.0.1:1/mcp', headers: { Authorization: placeholder } };
  const child = Object.assign(new EventEmitter(), {
    stdin: new PassThrough(), stdout: new PassThrough(), stderr: new PassThrough(), exitCode: null,
    kill: () => { child.stdout.end(); child.emit('exit', 0, null); return true; },
  });
  vi.mocked(spawn).mockClear().mockReturnValue(child as unknown as ReturnType<typeof spawn>);
  const requests: { subtype: string; servers?: unknown }[] = [];
  const reader = createInterface({ input: child.stdin });
  reader.on('line', line => {
    const frame = JSON.parse(line);
    if (frame.type !== 'control_request') return;
    requests.push(frame.request);
    const response = frame.request.subtype === 'initialize'
      ? { commands: [], models: [], account: { apiProvider: 'firstParty', subscriptionType: 'Claude Max', apiKeySource: 'none' } }
      : frame.request.subtype === 'mcp_set_servers' ? { added: ['host'], removed: [], errors: {} } : {};
    child.stdout.write(JSON.stringify({ type: 'control_response', response: { subtype: 'success', request_id: frame.request_id, response } }) + '\n');
  });
  const own = vi.fn();
  const context: DriverContext = {
    dataDir: directory, taskDir: directory, manifest: await openManifest(directory, 'claude-code', 'thread', null),
    mcp: { url: host.url, headers: host.headers, names: new Set(['fixture']), close: async () => {} },
    current: () => true, event() {}, observed: async () => [], inputIds: () => [], own, ready() {},
  };
  try {
    const driver = await openClaude(context, { query: pinnedQuery });
    try {
      expect(own).toHaveBeenCalledExactlyOnceWith(child);
      const [, args, options] = vi.mocked(spawn).mock.calls[0] as unknown as [string, string[], { env: NodeJS.ProcessEnv }];
      expect(args.some(arg => arg.includes(placeholder)), 'the fabricated header must stay out of argv').toBe(false);
      expect(args).toContain('--strict-mcp-config');
      expect(Object.values(options.env).some(value => value?.includes(placeholder))).toBe(false);
      expect(requests.filter(request => request.subtype === 'mcp_set_servers')).toEqual([
        expect.objectContaining({ servers: { host } }),
      ]);
    } finally { await driver.close(); }
  } finally { reader.close(); }
});

it.each(['stdin','stdout','stderr','process'] as const)('contains a native Claude %s error during discovery without losing the host',async stream=>{
 const directory=await mkdtemp(join(tmpdir(),'official-stdio-'));directories.push(directory);
 const child=Object.assign(new EventEmitter(),{stdin:new PassThrough(),stdout:new PassThrough(),stderr:new PassThrough(),exitCode:null,signalCode:null,pid:undefined});
 vi.mocked(spawn).mockReturnValue(child as unknown as ReturnType<typeof spawn>);
 let opened=false,closed=false,rejectAccount!:(error:Error)=>void,wake!:()=>void;
 const messages=new Promise<void>(done=>{wake=done;});
 const query=vi.fn(({options}:{options?:import('@anthropic-ai/claude-agent-sdk').Options})=>{
  options!.spawnClaudeCodeProcess!({command:'synthetic-native',args:['--strict-mcp-config'],cwd:directory,env:{}} as unknown as import('@anthropic-ai/claude-agent-sdk').SpawnOptions);opened=true;
  return {
   async *[Symbol.asyncIterator](){await messages;},
   accountInfo:()=>new Promise((_,reject)=>{rejectAccount=reject;}),supportedModels:async()=>[],
   interrupt:async()=>{},close(){closed=true;rejectAccount?.(Error('Synthetic native query closed'));wake();},
  } as never;
 });
 const runtime=createOfficialRuntime({dataDir:directory},{claudeSdk:{query}}),events:RuntimeEvent[]=[];
 runtime.configure({onEvent:event=>events.push(event),onTool:async()=>null});
 const discovery=runtime.models();
 try{
  await vi.waitFor(()=>expect(opened).toBe(true));
  expect(()=>(stream==='process'?child:child[stream]).emit('error',Object.assign(Error('Synthetic disconnected pipe'),{code:'ENOTCONN'}))).not.toThrow();
  await expect(discovery).resolves.toEqual([]);
  expect(closed).toBe(true);
  expect(events.some(event=>event.type==='input.processing')).toBe(false);
 }finally{await runtime.dispose();await discovery.catch(()=>{});}
});

it('preserves safe failure and settlement when the error notification observer throws',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'official-stdio-observer-'));directories.push(directory);
 const child=Object.assign(new EventEmitter(),{stdin:new PassThrough(),stdout:new PassThrough(),stderr:new PassThrough()});vi.mocked(spawn).mockReturnValue(child as unknown as ReturnType<typeof spawn>);
 let opened=false,rejectAccount!:(error:Error)=>void,wake!:()=>void;
 const messages=new Promise<void>(done=>{wake=done;});
 const event=vi.fn((type:string)=>{if(type==='error')throw Error('Synthetic observer failure');});
 const context:DriverContext={dataDir:directory,taskDir:directory,manifest:await openManifest(directory,'claude-code','thread',null),mcp:{names:[],url:'http://127.0.0.1/synthetic',headers:{}} as unknown as DriverContext['mcp'],current:()=>true,event,observed:async()=>[],inputIds:()=>[],own(){},ready(){}};
 const opening=openClaude(context,{query:({options}:{options?:import('@anthropic-ai/claude-agent-sdk').Options})=>{options!.spawnClaudeCodeProcess!({command:'synthetic-native',args:['--strict-mcp-config'],cwd:directory,env:{}} as unknown as import('@anthropic-ai/claude-agent-sdk').SpawnOptions);opened=true;return {async *[Symbol.asyncIterator](){await messages;},accountInfo:()=>new Promise((_,reject)=>{rejectAccount=reject;}),supportedModels:async()=>[],interrupt:async()=>{},close(){rejectAccount?.(Error('Synthetic closed'));wake();}} as never;}});
 try{
  await vi.waitFor(()=>expect(opened).toBe(true));
  expect(()=>child.stdout.emit('error',Error('Synthetic native error with private diagnostic'))).not.toThrow();
  await expect(opening).rejects.toMatchObject({code:'OFFICIAL_PROCESS_IO_FAILED',message:'The native Claude connection closed unexpectedly. Reconnect the provider and refresh models.'});
  expect(event.mock.calls.some(([type])=>type==='settled')).toBe(true);
 }finally{await opening.catch(()=>{});}
});
