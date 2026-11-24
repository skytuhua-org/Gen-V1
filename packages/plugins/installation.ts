import {createHash,randomUUID} from 'node:crypto';
import {lstat,mkdir,open,readFile,readdir,rename,rm,unlink,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {existsSync} from 'node:fs';
import {dirname,isAbsolute,join,parse,relative,resolve,sep} from 'node:path';
import {z} from 'zod';
import {pluginIdSchema,pluginManifestSchema,pluginPathSchema,pluginVersionSchema,type PluginManifest,type PluginCompatibility} from './contracts.ts';
import {hostFlagEnabled} from '../core/host-flags.ts';
import {screenPackage,screeningGate,type AdvisoryDatabase,type OperatorException,type ScreeningRecordCache} from '../core/package-screening.ts';
import type {PackageScreeningV1} from '../contracts/execution-profile.ts';

// The Electron shell has no private copy of runtime dependencies in ASAR.
// Resolve the same locked production dependency staged in its public host.
const resources=(process as NodeJS.Process&{resourcesPath?:string}).resourcesPath;
const packagedManifest=resources?join(resources,'host','package.json'):undefined;
const dependencyManifest=process.versions.electron?(process.env.HARNESS_DESKTOP_HOST_ROOT?join(process.env.HARNESS_DESKTOP_HOST_ROOT,'package.json'):packagedManifest&&existsSync(packagedManifest)?packagedManifest:resolve('package.json')):import.meta.url;
const semver=createRequire(dependencyManifest)('semver') as {valid:(version:string)=>string|null;validRange:(range:string)=>string|null;satisfies:(version:string,range:string)=>boolean};
const MAX_FILE_BYTES=16*1024*1024,VERIFY_CHUNK_BYTES=64*1024;
const digestSchema=z.string().regex(/^[a-f0-9]{64}$/);
const inventorySchema=z.strictObject({version:z.literal(1),files:z.array(z.strictObject({path:pluginPathSchema,bytes:z.number().int().min(0).max(MAX_FILE_BYTES),sha256:digestSchema})).min(3).max(4096)});
const indexSchema=z.strictObject({version:z.literal(1),plugins:z.array(z.strictObject({id:pluginIdSchema,version:pluginVersionSchema,digest:digestSchema})).max(100)});
export type ActivePlugin=z.infer<typeof indexSchema>['plugins'][number];
export interface VerifiedPackage {manifest:PluginManifest;digest:string;directory:string;files:Map<string,Buffer>}
const hash=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
const missing=(error:unknown)=>(error as NodeJS.ErrnoException).code==='ENOENT';
const inside=(root:string,path:string)=>{const part=relative(root,path);return part!==''&&!isAbsolute(part)&&part!=='..'&&!part.startsWith('..'+sep);};
const denied=()=>Error('Plug-in integrity verification failed.');

export function versionCompatible(manifest:PluginManifest,genVersion:string){return Boolean(semver.valid(genVersion)&&semver.valid(manifest.version)&&semver.validRange(manifest.compatibleGenVersions)&&semver.satisfies(genVersion,manifest.compatibleGenVersions));}
export function validGenVersion(version:string){return Boolean(semver.valid(version));}

/** Reject junctions/symlinks in every existing ancestor before creating children. */
export async function safeDirectory(path:string,create=false):Promise<string>{
 const absolute=resolve(path),root=parse(absolute).root;let cursor=root;
 for(const segment of absolute.slice(root.length).split(sep).filter(Boolean)){
  cursor=join(cursor,segment);
  try{const info=await lstat(cursor);if(info.isSymbolicLink()||!info.isDirectory())throw Error('Plug-in directory links and non-directory ancestors are forbidden.');}
  catch(error){if(!missing(error))throw error;if(!create)throw error;await mkdir(cursor,{mode:0o700});}
 }
 return absolute;
}
async function boundedFileSize(path:string,limit:number):Promise<number>{
 const info=await lstat(path);if(info.isSymbolicLink())throw Error('Plug-in package links are forbidden.');if(!info.isFile()||info.size>limit)throw denied();return info.size;
}
async function boundedFile(path:string,limit:number):Promise<Buffer>{const size=await boundedFileSize(path,limit);const bytes=await readFile(path);if(bytes.length!==size||bytes.length>limit)throw denied();return bytes;}

async function verifyPayloadFile(path:string,file:{bytes:number;sha256:string},buffer:Buffer):Promise<void>{
 if(await boundedFileSize(path,MAX_FILE_BYTES)!==file.bytes)throw denied();
 const handle=await open(path,'r');
 try{
  const info=await handle.stat();if(!info.isFile()||info.size!==file.bytes)throw denied();
  const digest=createHash('sha256');let remaining=file.bytes;
  while(remaining>0){
   const {bytesRead}=await handle.read(buffer,0,Math.min(buffer.length,remaining),null);
   if(bytesRead===0)throw denied();
   digest.update(buffer.subarray(0,bytesRead));remaining-=bytesRead;
  }
  // Confirm EOF on the same handle in case the file grew during the read.
  if((await handle.read(buffer,0,1,null)).bytesRead!==0||digest.digest('hex')!==file.sha256)throw denied();
 }finally{await handle.close();}
}

async function verifyPackage(directory:string,expectedDigest:string,files?:Map<string,Buffer>):Promise<PluginManifest>{
 digestSchema.parse(expectedDigest);await safeDirectory(directory);
 const raw=await boundedFile(join(directory,'plugin-files.json'),1024*1024);if(hash(raw)!==expectedDigest)throw Error('The trusted plug-in inventory digest does not match.');
 const inventory=inventorySchema.parse(JSON.parse(raw.toString('utf8'))),names=new Set<string>(),folded=new Set<string>();let total=0,largestPayload=1;
 for(const file of inventory.files){
  if(file.path==='plugin-files.json'||names.has(file.path)||folded.has(file.path.toLowerCase()))throw denied();
  names.add(file.path);folded.add(file.path.toLowerCase());total+=file.bytes;
  if(file.path!=='plugin.json')largestPayload=Math.max(largestPayload,file.bytes);
 }
 if(total>128*1024*1024||!names.has('plugin.json'))throw denied();
 const found=new Set<string>();
 async function walk(folder:string,prefix=''):Promise<void>{for(const entry of await readdir(folder,{withFileTypes:true})){
  const path=prefix+entry.name,absolute=join(folder,entry.name),info=await lstat(absolute);if(info.isSymbolicLink())throw Error('Plug-in package links are forbidden.');
  if(info.isDirectory()){pluginPathSchema.parse(path);if(![...names].some(name=>name.startsWith(path+'/')))throw Error('The plug-in package contains an undeclared directory.');await walk(absolute,path+'/');}
  else if(info.isFile()){if(path!=='plugin-files.json'&&!names.has(path))throw Error('The plug-in package contains an undeclared file.');found.add(path);}
  else throw denied();
 }}
 await walk(directory);if(found.size!==names.size+1)throw denied();
 const scratch=files?undefined:Buffer.allocUnsafe(Math.min(largestPayload,VERIFY_CHUNK_BYTES));
 let manifestBytes:Buffer|undefined;
 for(const file of inventory.files){
  const path=join(directory,file.path);
  if(scratch&&file.path!=='plugin.json'){await verifyPayloadFile(path,file,scratch);continue;}
  const bytes=await boundedFile(path,MAX_FILE_BYTES);if(bytes.length!==file.bytes||hash(bytes)!==file.sha256)throw denied();
  if(file.path==='plugin.json')manifestBytes=bytes;
  files?.set(file.path,bytes);
 }
 const manifest=pluginManifestSchema.parse(JSON.parse(manifestBytes!.toString('utf8')));
 if(!semver.valid(manifest.version)||!semver.validRange(manifest.compatibleGenVersions)||!names.has(manifest.hostEntry)||!names.has(manifest.frontendEntry))throw denied();
 files?.set('plugin-files.json',raw);return manifest;
}

export async function verifyPluginPackage(directory:string,expectedDigest:string):Promise<VerifiedPackage>{
 const files=new Map<string,Buffer>(),manifest=await verifyPackage(directory,expectedDigest,files);
 return {manifest,digest:expectedDigest,directory:resolve(directory),files};
}

/** Verify the package without retaining its payload bytes. */
export function validatePluginPackage(directory:string,expectedDigest:string):Promise<PluginManifest>{
 return verifyPackage(directory,expectedDigest);
}

export async function readPluginIndex(root:string):Promise<ActivePlugin[]>{
 try{await safeDirectory(root);const bytes=await boundedFile(join(root,'active.json'),128*1024),value=indexSchema.parse(JSON.parse(bytes.toString('utf8')));if(new Set(value.plugins.map(row=>row.id)).size!==value.plugins.length)throw denied();return value.plugins;}
 catch(error){if(missing(error))return [];throw error;}
}
/** Reverify the live inventory without activating another host or runtime. */
export async function checkInstalledCompatibility(root:string,version:string):Promise<PluginCompatibility>{
 const blockers:PluginCompatibility['blockers']=[];
 if(!validGenVersion(version))return {compatible:false,blockers:[{pluginId:'gen',reason:'The offered Gen version is invalid.'}]};
 const before=await readPluginIndex(root);
 for(const record of before){
  const manifest=await validatePluginPackage(join(root,record.id,record.version),record.digest);
  if(manifest.id!==record.id||manifest.version!==record.version)throw denied();
  if(!versionCompatible(manifest,version))blockers.push({pluginId:record.id,reason:'Update this plug-in before installing that Gen version.'});
 }
 if(JSON.stringify(before)!==JSON.stringify(await readPluginIndex(root)))throw Error('The installed plug-in inventory changed. Retry the compatibility check.');
 return {compatible:blockers.length===0,blockers};
}
const LOCK_STALE_MS=10*60*1000,LOCK_UNVERIFIED_MS=60*1000;
const pidAlive=(pid:number)=>{try{process.kill(pid,0);return true;}catch(error){return (error as NodeJS.ErrnoException).code==='EPERM';}};
/** A crashed installer leaves .registry-lock behind forever; reclaim it when the claim is unverifiable and old, its owner is gone, or it is ancient. */
async function reclaimableLock(path:string):Promise<boolean>{
 try{
  const info=await lstat(path),age=Date.now()-info.mtimeMs;if(age>LOCK_STALE_MS)return true;
  let claim:{pid?:unknown}|undefined;try{claim=JSON.parse(await readFile(path,'utf8')) as {pid?:unknown};}catch{claim=undefined;}
  if(typeof claim?.pid!=='number'||!Number.isInteger(claim.pid)||claim.pid<=0)return age>LOCK_UNVERIFIED_MS;
  return !pidAlive(claim.pid);
 }catch(error){return missing(error);}
}
async function withIndexLock<T>(root:string,action:()=>Promise<T>):Promise<T>{
 await safeDirectory(root,true);const path=join(root,'.registry-lock');let lock;
 for(let attempt=0;attempt<2;attempt++){
  try{lock=await open(path,'wx',0o600);break;}
  catch{
   if(attempt===0&&await reclaimableLock(path)){await unlink(path).catch(()=>{});continue;}
   throw Error('The plug-in registry is busy. Retry after the current installation finishes.');
  }
 }
 try{await lock!.writeFile(JSON.stringify({pid:process.pid,at:Date.now()}));return await action();}finally{await lock!.close().catch(()=>{});await unlink(path).catch(()=>{});}
}
async function saveIndex(root:string,plugins:ActivePlugin[]){const temporary=join(root,'.active-'+randomUUID()+'.json');await writeFile(temporary,JSON.stringify({version:1,plugins}),{flag:'wx',mode:0o600});await rename(temporary,join(root,'active.json'));}

export interface PluginScreeningOptions {
 advisory?:AdvisoryDatabase;
 exception?:OperatorException;
 cache?:ScreeningRecordCache;
 maxCacheAgeMs?:number;
}
/** expectedDigest is SHA-256 of raw plugin-files.json, supplied by a trusted
 * local installer. Inventory: {version:1, files:[{path,bytes,sha256}]}; every
 * package file except plugin-files.json is declared, including plugin.json.
 * When security.executionProfilesV1 is enabled, activation additionally
 * requires an advisory preflight: exact package/version/digest against the
 * composed advisory database. UNAVAILABLE blocks unless the operator recorded
 * a documented exception; KNOWN_BAD always denies; NO_KNOWN_MATCH never
 * grants trust by itself. The pure screening helper can record a proposed
 * exception, but this installer cannot verify an authenticated operator or
 * durably audit that exception, so it must not use one to activate a package.
 * With the flag off and no advisory composed, the legacy path is unchanged. */
export async function installPluginPackage(source:string,root:string,expectedDigest:string,genVersion:string,options?:{screening?:PluginScreeningOptions}):Promise<{manifest:PluginManifest;digest:string;directory:string;screening?:PackageScreeningV1}>{
 const sourcePath=resolve(source),rootPath=resolve(root);if(sourcePath===rootPath||inside(sourcePath,rootPath)||inside(rootPath,sourcePath))throw Error('The plug-in source and installed package directories must be separate.');
 const verified=await verifyPluginPackage(sourcePath,expectedDigest);if(!versionCompatible(verified.manifest,genVersion))throw Error('The plug-in is not compatible with this Gen version.');
 let screening:PackageScreeningV1|undefined;
 if(options?.screening?.advisory||hostFlagEnabled('security.executionProfilesV1')){
  const advisory=options?.screening?.advisory;
  if(!advisory)throw Error('Package screening is required but no advisory database is configured.');
  const computation=await screenPackage({name:verified.manifest.id,version:verified.manifest.version,digest:expectedDigest},advisory,{cache:options?.screening?.cache,maxCacheAgeMs:options?.screening?.maxCacheAgeMs,exception:options?.screening?.exception});
  screening=computation.record;
  const gate=screeningGate(computation.record);
  // A caller-provided actor/reason is not authenticated operator approval.
  // Until that authority and a durable separate exception receipt are wired,
  // refuse exceptional activation rather than laundering it through screening.
  if(gate==='EXCEPTION_RECORDED')throw Error('Package screening exception requires authenticated approval and durable audit evidence.');
  if(gate==='BLOCK')throw Error(`Package screening denied activation: ${computation.record.reason}`);
 }
 return withIndexLock(rootPath,async()=>{
  const index=await readPluginIndex(rootPath),parent=join(rootPath,verified.manifest.id),directory=join(parent,verified.manifest.version);await safeDirectory(parent,true);
  // An interrupted install can leave staging behind or promote the version
  // directory without publishing the index. The lock guarantees every
  // `.install-<uuid>` or `.active-<uuid>.json` still present is abandoned;
  const uuid='[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',abandoned=new RegExp(`^(\\.install-${uuid}|\\.active-${uuid}\\.json)$`);
  for(const entry of await readdir(rootPath))if(abandoned.test(entry))await rm(join(rootPath,entry),{recursive:true,force:true});
  const existing=await lstat(directory).then(()=>true).catch((error:unknown)=>missing(error)?false:Promise.reject(error));
  if(existing){
    if(index.some(row=>row.id===verified.manifest.id&&row.version===verified.manifest.version))throw Error('This immutable plug-in version already exists.');
    // Promotion completed but activation did not; recover it when the bytes verify.
    try{await validatePluginPackage(directory,expectedDigest);}catch{throw Error('A conflicting plug-in version directory exists without an active entry. Remove it before installing this version.');}
    await saveIndex(rootPath,[...index.filter(row=>row.id!==verified.manifest.id),{id:verified.manifest.id,version:verified.manifest.version,digest:expectedDigest}]);
    return {manifest:verified.manifest,digest:expectedDigest,directory,...(screening?{screening}:{})};
  }
  const stage=join(rootPath,'.install-'+randomUUID());await mkdir(stage,{mode:0o700});
  for(const [path,bytes]of verified.files){const target=join(stage,path);await mkdir(dirname(target),{recursive:true});await writeFile(target,bytes,{flag:'wx',mode:0o600});}
  await validatePluginPackage(stage,expectedDigest);await rename(stage,directory);
  await saveIndex(rootPath,[...index.filter(row=>row.id!==verified.manifest.id),{id:verified.manifest.id,version:verified.manifest.version,digest:expectedDigest}]);
  return {manifest:verified.manifest,digest:expectedDigest,directory,...(screening?{screening}:{})};
 });
}

/** Deactivate only. Installed versions, private configuration and data remain. */
export async function removePlugin(root:string,id:string):Promise<void>{pluginIdSchema.parse(id);await withIndexLock(resolve(root),async()=>saveIndex(resolve(root),(await readPluginIndex(root)).filter(row=>row.id!==id)));}
