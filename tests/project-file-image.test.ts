import Fastify from 'fastify';
import {afterEach,expect,it,vi} from 'vitest';
import {mkdir,mkdtemp,rm,symlink,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {ZodError} from 'zod';
import {Store} from '../packages/storage/store.ts';
import {HarnessError} from '../packages/contracts/index.ts';
import type {Service} from '../packages/core/service.ts';
import {ProjectTools} from '../packages/workspace/tools.ts';
import type {TerminalHost} from '../packages/workspace/terminal.ts';
import type {GitHubTools} from '../packages/workspace/github.ts';
import {registerWorkspaceHost} from '../apps/server/workspace-host.ts';
import {registerWorkspaceRoutes} from '../apps/server/workspace-routes.ts';

// The Linux directory guard needs the packaged supervisor's fd broker; pass the action
// straight through so the real binding/path/signature checks still run.
vi.mock('../packages/core/file-access.ts',async original=>({...await original<typeof import('../packages/core/file-access.ts')>(),withPathGuard:(_paths:unknown,_signal:unknown,action:(manifest:readonly never[])=>Promise<unknown>)=>action([])}));

const cleanup:(()=>Promise<void>)[]=[];
afterEach(async()=>{for(const close of cleanup.splice(0).reverse())await close();});

const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR4nGP8//8/AzGAiShVADwKBP9kTnxFAAAAAElFTkSuQmCC','base64');
const JPEG=Buffer.from([0xff,0xd8,0xff,0xe0,0x00,0x10,0x4a,0x46,0x49,0x46,0x00,0x01,0xff,0xd9]);
const GIF=Buffer.from('GIF89a'+'\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\x00\x00\x00\x21\xf9\x04\x00\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b','binary');
const WEBP=Buffer.concat([Buffer.from('RIFF'),Buffer.from([0x1a,0x00,0x00,0x00]),Buffer.from('WEBPVP8 '),Buffer.alloc(14)]);
const SVG='<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="2" height="2" fill="red"/></svg>';
const sha256=(data:Buffer)=>createHash('sha256').update(data).digest('hex');

async function fixture(){
 const root=await mkdtemp(join(tmpdir(),'gen-file-image-')),path=join(root,'repo'),store=new Store(join(root,'data')),tools=new ProjectTools(store),app=Fastify();
 await mkdir(path);await mkdir(join(path,'.git'));cleanup.push(async()=>{await tools.dispose();await app.close();store.close();await rm(root,{recursive:true,force:true,maxRetries:5});});
 await writeFile(join(path,'.git','config'),'[core]\n\tbare = false\n');await writeFile(join(path,'.git','secret.png'),PNG);
 await writeFile(join(path,'logo.png'),PNG);await writeFile(join(path,'photo.jpg'),JPEG);await writeFile(join(path,'anim.gif'),GIF);await writeFile(join(path,'pixel.webp'),WEBP);await writeFile(join(path,'icon.svg'),SVG);
 await writeFile(join(path,'notes.txt'),'plain text\n');await writeFile(join(path,'fake.png'),JPEG);await writeFile(join(path,'bad.svg'),'<xml>not svg</xml>');await writeFile(join(path,'big.png'),Buffer.concat([PNG,Buffer.alloc(10*1024*1024)]));
 await writeFile(join(root,'outside.png'),PNG);await symlink(join(root,'outside.png'),join(path,'link.png'));
 const receipt=await tools.connect({id:'connect',type:'workspace.project.connect',payload:{name:'Fixture',path}}),projectId=(receipt.result as {projects:{id:string}[]}).projects[0]!.id;
 const terminals={dispose:async()=>{}} as TerminalHost,github={details:vi.fn(),list:vi.fn(),repo:vi.fn(),auth:{start:vi.fn(),poll:vi.fn(),cancel:vi.fn()},comparison:vi.fn(),comparisonFile:vi.fn()} as unknown as GitHubTools;
 registerWorkspaceHost({store} as Service,{projects:tools,terminals,github});
 app.setErrorHandler((error,_request,reply)=>{const known=error instanceof HarnessError,malformed=error instanceof ZodError;const code=known?error.code:malformed?'INVALID_INPUT':'HOST_ERROR';const status=code==='NOT_FOUND'?404:['CAPABILITY_DENIED','AUTH_REQUIRED'].includes(code)?403:known||malformed?400:500;reply.code(status).send({error:{code,message:error instanceof Error?error.message:'error'}});});
 registerWorkspaceRoutes(app,{store} as Service);
 return{app,projectId,store};
}
const image=(app:Awaited<ReturnType<typeof fixture>>['app'],projectId:string,path:string)=>app.inject('/api/projects/'+projectId+'/file/image?path='+encodeURIComponent(path));

it('serves each allowlisted format with exact bytes and safe headers',async()=>{
 const{app,projectId}=await fixture();
 for(const[path,mime,bytes]of[['logo.png','image/png',PNG],['photo.jpg','image/jpeg',JPEG],['anim.gif','image/gif',GIF],['pixel.webp','image/webp',WEBP],['icon.svg','image/svg+xml',Buffer.from(SVG)]]as const){
  const res=await image(app,projectId,path);expect(res.statusCode,path).toBe(200);
  expect(res.headers['content-type'],path).toContain(mime);expect(res.headers['content-security-policy'],path).toBe("sandbox; default-src 'none'");expect(res.headers['x-content-type-options'],path).toBe('nosniff');expect(res.headers['cache-control'],path).toBe('no-store');expect(res.headers['x-file-sha256'],path).toBe(sha256(bytes));
  expect(res.rawPayload.equals(bytes),path).toBe(true);
 }
});

it('rejects non-image extensions and traversal outside the worktree',async()=>{
 const{app,projectId}=await fixture();
 expect((await image(app,projectId,'notes.txt')).json().error.code).toBe('INVALID_INPUT');
 const traversal=await image(app,projectId,'../outside.png');expect(traversal.statusCode).toBe(400);expect(traversal.json().error.code).toBe('INVALID_INPUT');
 const git=await image(app,projectId,'.git/secret.png');expect(git.statusCode).toBe(403);expect(git.json().error.code).toBe('CAPABILITY_DENIED');
 const link=await image(app,projectId,'link.png');expect(link.statusCode).toBe(403);expect(link.json().error.code).toBe('CAPABILITY_DENIED');
 const missing=await image(app,projectId,'missing.png');expect(missing.json().error.code).not.toBe('UNSUPPORTED');
});

it('rejects mismatched magic bytes, invalid SVG and files over 10 MiB',async()=>{
 const{app,projectId}=await fixture();
 const fake=await image(app,projectId,'fake.png');expect(fake.json().error).toMatchObject({code:'UNSUPPORTED',message:'This file is not a valid PNG image.'});
 const bad=await image(app,projectId,'bad.svg');expect(bad.json().error).toMatchObject({code:'UNSUPPORTED',message:'This file is not a valid SVG image.'});
 const big=await image(app,projectId,'big.png');expect(big.json().error.code).toBe('RESOURCE_LIMIT');
});
