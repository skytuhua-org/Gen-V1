import {afterEach,describe,it,expect,vi} from 'vitest';
import {EventEmitter} from 'node:events';
import type {ChildProcess,SpawnOptions} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DESKTOP_CHANNELS as channels} from '../packages/desktop-contract/index.ts';
import {nextMessage} from './desktop-host-ipc.ts';

it('fails readiness immediately when the sidecar reports a startup failure',async()=>{
 vi.useFakeTimers();
 try{
  const child=new EventEmitter() as ChildProcess;
  const ready=nextMessage(child,'harness.ready');
  const settled=vi.fn();void ready.then(settled,settled);
  child.emit('message',{type:'harness.error',token:'fixture-token',message:'private fixture data'});
  await Promise.resolve();
  const notified=settled.mock.calls.length;
  // Drain the original timeout as well when exercising the baseline.
  await vi.runAllTimersAsync();
  expect(notified).toBe(1);
  await expect(ready).rejects.toThrow(/^Desktop host reported a startup error before harness.ready$/);
  expect(child.listenerCount('message')).toBe(0);
  expect(child.listenerCount('exit')).toBe(0);
 }finally{vi.useRealTimers();}
});

it('still returns an error event when that event is what the fixture requested',async()=>{
 const child=new EventEmitter() as ChildProcess;
 const startupError=nextMessage(child,'harness.error');
 const event={type:'harness.error',token:'fixture-token',message:'fixture collision'};
 child.emit('message',event);
 await expect(startupError).resolves.toBe(event);
 expect(child.listenerCount('message')).toBe(0);
 expect(child.listenerCount('exit')).toBe(0);
});

const runtime=vi.hoisted(()=>({
 spawn:vi.fn(),openExternal:vi.fn(),handle:vi.fn(),appOn:vi.fn(),appExit:vi.fn(),loaded:vi.fn(),
}));
vi.mock('node:child_process',async original=>({...await original<typeof import('node:child_process')>(),spawn:runtime.spawn}));
vi.mock('../apps/desktop/workspace-events.ts',()=>({workspaceEvents:()=>({close:async()=>{}})}));
vi.mock('../apps/desktop/attention-popups.ts',()=>({createAttentionPopups:()=>({start(){},stop(){}})}));

class TestWindow extends EventEmitter {
 destroyed=false;
 webContents=Object.assign(new EventEmitter(),{
  id:41,mainFrame:{url:''},getURL:()=>this.webContents.mainFrame.url,send:vi.fn(),reload:vi.fn(),
  setWindowOpenHandler:vi.fn(),session:Object.assign(new EventEmitter(),{
   setPermissionRequestHandler:vi.fn(),setPermissionCheckHandler:vi.fn(),
  }),
 });
 async loadURL(url:string){this.webContents.mainFrame.url=url;runtime.loaded(this);}
 isDestroyed(){return this.destroyed;}
 isMinimized(){return false;}
 isMaximized(){return false;}
 isFullScreen(){return false;}
 isAlwaysOnTop(){return false;}
 getNormalBounds(){return {x:0,y:0,width:900,height:700};}
 show(){}
 destroy(){this.destroyed=true;this.emit('closed');}
}
vi.mock('electron',()=>{
 const display={id:1,workArea:{x:0,y:0,width:1024,height:768},scaleFactor:1};
 return {
  app:{setName:vi.fn(),getPath:()=>process.env.HARNESS_DESKTOP_TEST_DATA_DIR,setPath:vi.fn(),commandLine:{appendSwitch:vi.fn()},requestSingleInstanceLock:()=>true,on:runtime.appOn,whenReady:async()=>{},exit:runtime.appExit},
  BrowserWindow:TestWindow,ipcMain:{handle:runtime.handle},powerMonitor:{on:vi.fn()},
  screen:{getAllDisplays:()=>[display],getPrimaryDisplay:()=>display,on:vi.fn()},
  Menu:{setApplicationMenu:vi.fn(),buildFromTemplate:vi.fn()},
  nativeImage:{createFromBitmap:vi.fn(),createFromDataURL:()=>({addRepresentation:vi.fn()})},
  Tray:class {on(){} setToolTip(){} setContextMenu(){} destroy(){}},shell:{openExternal:runtime.openExternal},dialog:{},session:{},WebContentsView:class {},
 };
});

class TestSidecar extends EventEmitter {
 exitCode:number|null=null;
 signalCode=null;
 connected=true;
 readonly saveLayout=vi.fn();
 constructor(readonly pid:number,readonly token:string){super();}
 send(message:{type:string;token:string;requestId?:string}){
  if(message.type==='harness.shutdown'){
   queueMicrotask(()=>{this.emit('message',{type:'harness.stopped',token:this.token});this.stop(0);});
  }else{
   if(message.type==='harness.layout.save')this.saveLayout();
   const type=message.type==='harness.layout.save'?'harness.layout.saved':message.type+'.result';
   queueMicrotask(()=>this.emit('message',{...message,type,idle:true}));
  }
 }
 stop(code:number){this.exitCode=code;this.connected=false;this.emit('exit',code,null);}
}

describe('desktop main window lifecycle with a synthetic sidecar and shell',()=>{
 let directory:string|undefined;
 afterEach(async()=>{
  vi.useRealTimers();vi.unstubAllEnvs();vi.resetModules();vi.clearAllMocks();
  if(directory)await rm(directory,{recursive:true,force:true});
 });

 async function launch(){
  directory=await mkdtemp(join(tmpdir(),'gen-r01-desktop-'));
  vi.stubEnv('HARNESS_DESKTOP_TEST_DATA_DIR',directory);
  vi.stubEnv('HARNESS_DESKTOP_NODE_PATH',process.execPath);
  vi.stubEnv('HARNESS_DESKTOP_PORT','4357');
  vi.stubEnv('HARNESS_DESKTOP_WIDGET_PORT','4358');
  vi.useFakeTimers({toFake:['setTimeout','clearTimeout']});
  const children:TestSidecar[]=[];
  runtime.spawn.mockImplementation((_file:string,_args:string[],options:SpawnOptions)=>{
   const child=new TestSidecar(100+children.length,options.env!.HARNESS_DESKTOP_LAUNCH_TOKEN!);
   children.push(child);
   queueMicrotask(()=>child.emit('message',{type:'harness.ready',token:child.token,pid:child.pid,origin:'http://127.0.0.1:4357'}));
   return child;
  });
  await import('../apps/desktop/main.ts');
  await vi.waitFor(()=>expect(runtime.loaded).toHaveBeenCalledOnce());
  const window=runtime.loaded.mock.calls[0]![0] as TestWindow, sender=window.webContents;
  const invoke=(channel:string,value?:unknown,senderFrame=sender.mainFrame)=>{
   const handle=runtime.handle.mock.calls.find(([name])=>name===channel)?.[1];
   if(!handle)throw Error('Fixture could not find the desktop IPC handler.');
   return handle({sender,senderFrame},value) as Promise<unknown>;
  };
  await invoke(channels.ready);
  return {window,invoke,children};
 }

 it('accepts the close acknowledgment from the original window after following a plan anchor',async()=>{
  const {window,invoke}=await launch(), contents=window.webContents;
  const anchor=new URL(contents.getURL());anchor.hash='step-inspect';
  contents.mainFrame.url=anchor.href;
  contents.emit('did-navigate-in-page',{},anchor.href,true,10,1);
  window.emit('close',{preventDefault:vi.fn()});
  const request=contents.send.mock.calls.find(([channel])=>channel===channels.closeRequest)?.[1];
  expect(request).toBeTypeOf('string');
  await expect(invoke(channels.closeAnswer,{requestId:request,allow:true})).resolves.toBeUndefined();
  expect(window.destroyed).toBe(true);
 });

 it.each(['renderer','native'] as const)('reloads an anchored window at its original bootstrap URL after %s reload',async source=>{
  const {window,invoke}=await launch(), contents=window.webContents;
  const originalUrl=contents.getURL(), anchor=new URL(originalUrl);anchor.hash='step-inspect';
  contents.mainFrame.url=anchor.href;
  contents.emit('did-navigate-in-page',{},anchor.href,true,10,1);
  const preventDefault=vi.fn();
  if(source==='renderer'){
   contents.emit('will-navigate',{preventDefault},anchor.href);
   expect(preventDefault).not.toHaveBeenCalled();
  }
  contents.emit('will-navigate',{preventDefault},'http://127.0.0.1:4357/?desktopWindow=other');
  expect(preventDefault).toHaveBeenCalledOnce();
  contents.emit('did-navigate',{},anchor.href,200,'OK');
  await new Promise<void>(resolve=>setImmediate(resolve));
  expect(contents.getURL()===originalUrl).toBe(true);
  expect(runtime.loaded).toHaveBeenCalledTimes(2);
  contents.emit('did-navigate-in-page',{},originalUrl,true,10,1);
  await new Promise<void>(resolve=>setImmediate(resolve));
  expect(contents.reload).toHaveBeenCalledOnce();
  contents.emit('did-navigate',{},originalUrl,200,'OK');
  expect(runtime.loaded).toHaveBeenCalledTimes(2);
  await expect(invoke(channels.context)).resolves.toMatchObject({surface:{kind:'main'}});
 });

 it('reuses the original window bootstrap identity after an automatic sidecar restart',async()=>{
  const {window,invoke,children}=await launch();
  const originalUrl=window.webContents.getURL();
  const launchIdentity=new URLSearchParams(new URL(originalUrl).hash.slice(1)).get('launch');
  expect(launchIdentity).toMatch(/^[a-f0-9]{64}$/);
  expect(children[0]!.token===launchIdentity).toBe(true);
  // Confirm the startup layout write completed before advancing the restart clock.
  await vi.waitFor(()=>expect(children[0]!.saveLayout).toHaveBeenCalledOnce());
  children[0]!.stop(1);
  await vi.advanceTimersByTimeAsync(700);
  expect(children).toHaveLength(2);
  expect(children[1]!.token===launchIdentity).toBe(true);
  expect(window.webContents.getURL()===originalUrl).toBe(true);
  await expect(invoke(channels.context)).resolves.toMatchObject({surface:{kind:'main'}});
 });

 it('opens the fixed GitHub device page only for the originating live main frame with no argument',async()=>{
  const {window,invoke}=await launch(), contents=window.webContents;
  const deviceUrl='https://github.com/login/device',channel='harness-desktop:open-github-device';
  const popup=contents.setWindowOpenHandler.mock.calls[0]![0];
  expect(popup({url:deviceUrl,referrer:{url:''}})).toEqual({action:'deny'});
  expect(runtime.openExternal).not.toHaveBeenCalled();
  await expect(invoke(channel,undefined,{url:contents.getURL()})).rejects.toThrow('Desktop request denied');
  await expect(invoke(channel,{url:'https://example.org/'})).rejects.toThrow('GitHub device action denied');
  expect(runtime.openExternal).not.toHaveBeenCalled();
  await expect(invoke(channel)).resolves.toBeUndefined();
  expect(runtime.openExternal).toHaveBeenCalledExactlyOnceWith(deviceUrl,{activate:true});
 });
});
