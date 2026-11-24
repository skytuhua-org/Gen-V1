import {beforeAll,expect,it,vi} from 'vitest';
import type {DesktopBridge} from '../packages/desktop-contract/index.ts';
import {DESKTOP_CHANNELS} from '../packages/desktop-contract/index.ts';
import {runProjectPath,type ProjectPathShell} from '../apps/desktop/project-path.ts';
import {pluginDesktopChannelAllowed} from '../apps/desktop/window-policy.ts';

const ipc=vi.hoisted(()=>({invoke:vi.fn(async(..._args:unknown[])=>{}),expose:vi.fn(),on:vi.fn(),remove:vi.fn()}));
vi.mock('electron',()=>({contextBridge:{exposeInMainWorld:ipc.expose},ipcRenderer:{invoke:ipc.invoke,on:ipc.on,removeListener:ipc.remove}}));
let bridge:DesktopBridge;
beforeAll(async()=>{await import('../apps/desktop/preload.ts');bridge=ipc.expose.mock.calls[0][1] as DesktopBridge;});

it('forwards a parsed project path request through the dedicated channel and denies plugin windows',async()=>{
 expect(DESKTOP_CHANNELS.projectPath).toBe('harness-desktop:project-path');
 expect(pluginDesktopChannelAllowed(DESKTOP_CHANNELS.projectPath)).toBe(false);
 expect(bridge.projectPath).toBeTypeOf('function');
 const request={projectId:'project-a',threadId:'thread-1',path:'docs/readme.md',action:'reveal' as const};
 await bridge.projectPath!(request);
 expect(ipc.invoke).toHaveBeenLastCalledWith(DESKTOP_CHANNELS.projectPath,request);
 expect(()=>bridge.projectPath!({...request,extra:true} as never)).toThrow();
 expect(ipc.invoke).toHaveBeenCalledTimes(1);
});
it('reveals with showItemInFolder and never opens a program or script',async()=>{
 const calls:string[]=[];const shell:ProjectPathShell={showItemInFolder(path){calls.push('reveal:'+path);},openPath:async path=>{calls.push('open:'+path);return '';}};
 const resolve=async()=>({path:'C:/repo/scripts/run.ps1',kind:'file' as const,openable:false});
 await expect(runProjectPath({request:{projectId:'p',path:'scripts/run.ps1',action:'reveal'},resolve,shell})).resolves.toEqual({action:'reveal'});
 expect(calls).toEqual(['reveal:C:/repo/scripts/run.ps1']);
 await expect(runProjectPath({request:{projectId:'p',path:'scripts/run.ps1',action:'open'},resolve,shell})).rejects.toThrow('Open is turned off for programs and scripts.');
 expect(calls).toHaveLength(1);
 await expect(runProjectPath({request:{projectId:'p',path:'scripts/run.ps1',action:'open'},resolve:async()=>({path:'C:/repo/scripts/run.ps1',kind:'file' as const,openable:true}),shell})).rejects.toThrow('Open is turned off for programs and scripts.');
});
it('opens allowed files and surfaces the shell failure reason',async()=>{
 const shell:ProjectPathShell={showItemInFolder(){},openPath:async()=>'No application is registered.'};
 await expect(runProjectPath({request:{projectId:'p',path:'readme.md',action:'open'},resolve:async()=>({path:'/repo/readme.md',kind:'file' as const,openable:true}),shell})).rejects.toThrow('Windows could not open this file. No application is registered.');
 const ok:ProjectPathShell={showItemInFolder(){},openPath:async()=>''};
 await expect(runProjectPath({request:{projectId:'p',path:'readme.md',action:'open'},resolve:async()=>({path:'/repo/readme.md',kind:'file' as const,openable:true}),shell:ok})).resolves.toEqual({action:'open'});
});
it('refuses a non-absolute host path before touching the shell',async()=>{
 let shellCalls=0;const shell:ProjectPathShell={showItemInFolder(){shellCalls++;},openPath:async()=>{shellCalls++;return '';}};
 await expect(runProjectPath({request:{projectId:'p',path:'readme.md',action:'reveal'},resolve:async()=>({path:'relative/out.md',kind:'file' as const,openable:true}),shell})).rejects.toThrow('The project path is unavailable.');
 expect(shellCalls).toBe(0);
});
