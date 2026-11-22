import {expect,it,vi} from 'vitest';
import {handleDesktopControl} from '../apps/server/desktop-controls.ts';
import type {DesktopProjectPathRequest} from '../packages/desktop-contract/index.ts';

const token='a'.repeat(64);
const request:DesktopProjectPathRequest={projectId:'project-a',threadId:'thread-1',path:'docs/readme.md',action:'reveal'};
const message=(extra:Record<string,unknown>={})=>({type:'harness.project.path',token,requestId:'req-1',projectId:request.projectId,threadId:request.threadId,path:request.path,action:request.action,...extra});

it('accepts only launch-token-bound project path requests and returns the resolved entry',async()=>{
 const projectPath=vi.fn(async(_input:DesktopProjectPathRequest)=>({path:'/repo/docs/readme.md',kind:'file' as const,openable:true}));
 const host={stopAll:vi.fn(),saveNativeLayout:vi.fn(),projectPath},send=vi.fn();
 expect(await handleDesktopControl(message({token:'b'.repeat(64)}),token,host,send)).toBe(false);
 expect(await handleDesktopControl(message({extra:true}),token,host,send)).toBe(false);
 expect(await handleDesktopControl({type:'harness.project.path',token,requestId:'req-1',projectId:request.projectId,path:request.path,action:request.action},token,host,send)).toBe(false);
 expect(projectPath).not.toHaveBeenCalled();
 expect(await handleDesktopControl(message(),token,host,send)).toBe(true);
 expect(projectPath).toHaveBeenCalledWith(request);
 expect(send).toHaveBeenCalledWith({type:'harness.project.path.result',token,requestId:'req-1',path:'/repo/docs/readme.md',kind:'file',openable:true});
});
it('passes a null thread through as a project-scoped request',async()=>{
 const projectPath=vi.fn(async()=>({path:'/repo/scripts',kind:'directory' as const,openable:true}));
 const host={stopAll:vi.fn(),saveNativeLayout:vi.fn(),projectPath},send=vi.fn();
 expect(await handleDesktopControl(message({threadId:null}),token,host,send)).toBe(true);
 expect(projectPath).toHaveBeenCalledWith({projectId:'project-a',path:'docs/readme.md',action:'reveal'});
});
it('returns a correlated error reply instead of resolving foreign input',async()=>{
 const projectPath=vi.fn(async()=>{throw Error('Choose a file or folder inside this project.');});
 const host={stopAll:vi.fn(),saveNativeLayout:vi.fn(),projectPath},send=vi.fn();
 expect(await handleDesktopControl(message(),token,host,send)).toBe(true);
 expect(send).toHaveBeenCalledWith({type:'harness.project.path.result',token,requestId:'req-1',error:'Choose a file or folder inside this project.'});
 const malformed=vi.fn(async()=>({path:'/x',kind:'file' as const,openable:true}));const bad={stopAll:vi.fn(),saveNativeLayout:vi.fn(),projectPath:malformed};
 expect(await handleDesktopControl(message({path:1025}),token,bad,send)).toBe(true);
 expect(malformed).not.toHaveBeenCalled();
 expect(send).toHaveBeenLastCalledWith({type:'harness.project.path.result',token,requestId:'req-1',error:'Invalid project path'});
});
