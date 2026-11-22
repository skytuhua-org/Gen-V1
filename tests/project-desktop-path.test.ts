import {afterEach,expect,it,vi} from 'vitest';
// The kernel sandboxed guard needs a bubblewrap-capable host; substitute only
// the guard wrapper so the resolver logic runs everywhere (mirrors
// context-result-host.test.ts). The guard itself is covered by path-access tests.
vi.mock('../packages/core/file-access.ts',async original=>{
 const module=await original<typeof import('../packages/core/file-access.ts')>();
 return{...module,withPathGuard:<T>(_paths:unknown,_signal:AbortSignal,action:(manifest:readonly unknown[])=>Promise<T>)=>action([])};
});
import {mkdir,mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Store} from '../packages/storage/store.ts';
import {ProjectTools} from '../packages/workspace/tools.ts';
import {desktopOpenBlocked,parseDesktopProjectPathRequest} from '../packages/desktop-contract/index.ts';

const cleanup:(()=>Promise<void>)[]=[];
afterEach(async()=>{for(const close of cleanup.splice(0).reverse())await close();});
async function fixture(){const root=await mkdtemp(join(tmpdir(),'gen-desktop-path-')),path=join(root,'repo');await mkdir(path);const store=new Store(join(root,'data'));const tools=new ProjectTools(store,{git:'git'});cleanup.push(async()=>{await tools.dispose();store.close();await rm(root,{recursive:true,force:true,maxRetries:5});});
 await writeFile(join(path,'readme.md'),'hello\n');await mkdir(join(path,'scripts'));await writeFile(join(path,'scripts','run.ps1'),'echo hi\n');await mkdir(join(path,'.git'));await writeFile(join(path,'.git','config'),'x\n');
 return{root,path,store,tools};}
async function bound(tools:ProjectTools,path:string){const receipt=await tools.connect({id:'connect',type:'workspace.project.connect',payload:{name:'Fixture',path}});return(receipt.result as {projects:{id:string}[]}).projects[0]!.id;}

it('blocks the R05 extension list case-insensitively on the last extension',()=>{
 for(const name of ['run.ps1','RUN.EXE','script.Js','tool.sh','a.com','x.jar','setup.msi','link.lnk','r.reg','s.scr','w.wsf','h.hta','c.cpl','d.dll','i.inf','sy.sys','ap.application','ar.appref-ms','m.msc','sc.scf','v.vbs','vb.vbe','ms.msp','mx.msix','ax.appx','ab.appxbundle','p.pif','u.url','pd.psd1','pm.psm1','c.cmd','b.bat','j.jse','wh.wsh'])expect(desktopOpenBlocked(name),name).toBe(true);
 for(const name of ['readme.md','notes.txt','archive.tar.gz','Makefile','report','.gitignore','a.PS2','data.json','code.jsx','component.tsx','run.sh.txt'])expect(desktopOpenBlocked(name),name).toBe(false);
});
it('parses a strict desktop project path request and rejects malformed input',()=>{
 expect(parseDesktopProjectPathRequest({projectId:'p1',threadId:'t1',path:'a/b.txt',action:'reveal'})).toEqual({projectId:'p1',threadId:'t1',path:'a/b.txt',action:'reveal'});
 expect(parseDesktopProjectPathRequest({projectId:'p1',path:'a.txt',action:'open'})).toEqual({projectId:'p1',path:'a.txt',action:'open'});
 for(const value of [null,5,[],{projectId:'p1',path:'a',action:'reveal',extra:1},{projectId:'',path:'a',action:'reveal'},{projectId:'p1',path:'',action:'reveal'},{projectId:'p1',path:'a',action:'copy'},{projectId:'p1',threadId:'x'.repeat(201),path:'a',action:'open'},{projectId:'p1',path:'x'.repeat(1025),action:'open'}])
  expect(()=>parseDesktopProjectPathRequest(value)).toThrow();
});
it('resolves real files and directories with the openable flag',async()=>{
 const{path,tools}=await fixture(),projectId=await bound(tools,path);
 const file=await tools.desktopPath(projectId,undefined,'readme.md');
 expect(file.kind).toBe('file');expect(file.openable).toBe(true);expect(file.path).toContain('readme.md');
 const dir=await tools.desktopPath(projectId,undefined,'scripts');
 expect(dir.kind).toBe('directory');expect(dir.openable).toBe(true);
 const script=await tools.desktopPath(projectId,undefined,'scripts/run.ps1');
 expect(script.kind).toBe('file');expect(script.openable).toBe(false);
});
it('denies traversal, git metadata and missing entries',async()=>{
 const{path,tools}=await fixture(),projectId=await bound(tools,path);
 await expect(tools.desktopPath(projectId,undefined,'../outside.txt')).rejects.toMatchObject({code:'CAPABILITY_DENIED',message:'Choose a file or folder inside this project.'});
 await expect(tools.desktopPath(projectId,undefined,'.git/config')).rejects.toMatchObject({code:'CAPABILITY_DENIED'});
 await expect(tools.desktopPath(projectId,undefined,'absent.txt')).rejects.toMatchObject({code:'NOT_FOUND',message:'This file is no longer in the project. Refresh Files.'});
 await expect(tools.desktopPath(projectId,undefined,'a:b')).rejects.toMatchObject({code:'CAPABILITY_DENIED'});
 await expect(tools.desktopPath('project-z',undefined,'readme.md')).rejects.toMatchObject({code:'NOT_FOUND'});
});
