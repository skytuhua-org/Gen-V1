import {resolve,join,dirname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {homedir} from 'node:os';
import {Store} from '../../packages/storage/store.ts';
import {Service} from '../../packages/core/service.ts';
import {createRuntime} from '../../packages/runtime/index.ts';
import {accountResolver} from '../../packages/core/accounts.ts';
import {buildServer,buildWidgetServer,type MountRegistry} from './server.ts';
import {acquireProfileLease,type ProfileLease} from './profile-lease.ts';
import {createProtectedHermesService,type EffectServiceOptions} from './effect-service.ts';
import {WorkspaceRepository} from '../../packages/core/workspace-layout.ts';
import {workspaceHost} from './workspace-host.ts';
import {AttentionRepository} from '../../packages/core/attention.ts';
import type {AttentionDelivery} from '../../packages/contracts/attention.ts';
import {parseDesktopLayout,type DesktopLayout} from '../../packages/desktop-contract/index.ts';
import {createHash,randomUUID} from 'node:crypto';
import {lstat,readFile} from 'node:fs/promises';
import {loadInstalledPlugins,type PluginRegistry} from '../../packages/plugins/host.ts';
import {checkInstalledCompatibility} from '../../packages/plugins/installation.ts';
import {IsolatedExtensionHost,createSpawnWorkerLauncher} from '../../packages/plugins/isolated-host.ts';
import {admitIsolatedPackage} from '../../packages/plugins/lifecycle.ts';
import {readPluginIndex} from '../../packages/plugins/installation.ts';
import type {ExecutionBackend} from '../../packages/core/execution-policy.ts';
import {createPersonalSkillCatalog} from '../../packages/skill-catalog/adapters.ts';
import {configureHostCapabilityFlags,readCapabilityFlagOverrides,capabilityEnabled,type CapabilityFlagKey} from '../../packages/core/capability-flags.ts';
import {createSidecarControlDriver,type ControlSidecarChannel} from '../../packages/core/control-sidecar-driver.ts';
import {controlDriverManifestV1Schema,type ControlDriverRegistrationV1} from '../../packages/contracts/interactive-control.ts';
import {HarnessError} from '../../packages/contracts/index.ts';
import {z} from 'zod';

export interface HostOptions {dataDir:string;port:number;widgetPort:number;dev:boolean;pluginDir?:string;launchToken?:string;capabilityFlags?:Readonly<Partial<Record<CapabilityFlagKey,boolean>>>;toolEffectFlags?:EffectServiceOptions['toolEffectFlags'];approvedBackendId?:string;isolationBackends?:readonly ExecutionBackend[];controlChannel?:ControlSidecarChannel}
export interface RunningHost {attentionRead?():Promise<AttentionDelivery>;attentionAction?(type:'open'|'dismiss',eventId:string):Promise<{threadId?:string;dismissed?:boolean}>;origin:string;widgetOrigin:string;pid:number;close():Promise<void>;nativeLayout?:DesktopLayout;stopAll():Promise<{stopped:number;errors?:string[]}>;saveNativeLayout(layout:unknown):Promise<void>;validatePluginSurface?(surface:unknown):Promise<boolean>;pluginCompatibility?(version:string):Promise<{allowed:boolean}>;updateReadiness?():Promise<{idle:boolean}>;prepareUpdateClose?():Promise<{idle:boolean}>;controlAttach?(manifest:unknown):Promise<{registered:boolean}>;devServersCount?():Promise<{count:number;items:{url:string;port:number;label:string}[]}>}
export interface HostFactories {
 acquireProfile:typeof acquireProfileLease;
 createStore(dataDir:string):Store;
 createRuntime:typeof createRuntime;
 createService(store:Store,runtime:ReturnType<typeof createRuntime>,options?:EffectServiceOptions):Service|Promise<Service>;
 buildServer:typeof buildServer;
 buildWidgetServer:typeof buildWidgetServer;
 loadPlugins:typeof loadInstalledPlugins;
 createSkillCatalog:typeof createPersonalSkillCatalog;
}

function port(value:unknown,name:string):number {
 if(typeof value==='string'&&!/^\d{1,5}$/.test(value))throw new Error(`${name} must be a port between 1 and 65535.`);
 const parsed=typeof value==='string'?Number(value):value;
 if(typeof parsed!=='number'||!Number.isSafeInteger(parsed)||parsed<1||parsed>65535)throw new Error(`${name} must be a port between 1 and 65535.`);
 return parsed;
}
export function readHostOptions(env:NodeJS.ProcessEnv=process.env):HostOptions {
 if(env.HARNESS_DATA_DIR!==undefined&&!env.HARNESS_DATA_DIR.trim())throw new Error('HARNESS_DATA_DIR must be a nonempty directory.');
 const capabilityFlags=readCapabilityFlagOverrides(env);
 return {dataDir:resolve(env.HARNESS_DATA_DIR??join(env.LOCALAPPDATA??homedir(),'GenerativeHarness')),port:port(env.HARNESS_PORT??4317,'HARNESS_PORT'),widgetPort:port(env.HARNESS_WIDGET_PORT??4318,'HARNESS_WIDGET_PORT'),dev:env.HARNESS_DEV==='1',launchToken:env.HARNESS_DESKTOP_LAUNCH_TOKEN,...(Object.keys(capabilityFlags).length?{capabilityFlags}:{})};
}

const controlDriverPackageTrustSchema=z.strictObject({
 version:z.literal(1),
 artifactSha256:controlDriverManifestV1Schema.shape.artifactSha256,
 adapterModuleSha256:controlDriverManifestV1Schema.shape.artifactSha256,
});

async function readPackagedFile(path:string,maxBytes=Infinity){
 const info=await lstat(path);
 if(!info.isFile()||info.size>maxBytes)throw new Error('Invalid packaged control driver resource.');
 return readFile(path);
}

/** The packager pins the native output and physical ASAR independently of IPC. */
export async function verifyPackagedControlDriver(hostRoot:string,version:string,manifest:unknown):Promise<ControlDriverRegistrationV1[]>{
 if(basename(hostRoot)!=='host')throw new HarnessError('DRIVER_UNAVAILABLE','No packaged control driver is available.');
 const artifact=join(hostRoot,'packages/core/windows-control-bridge.node');
 const adapterModule=join(dirname(hostRoot),'app.asar');
 const trust=await readPackagedFile(join(hostRoot,'control-driver-trust.json'),1024)
  .then(bytes=>controlDriverPackageTrustSchema.parse(JSON.parse(bytes.toString('utf8'))))
  .catch(()=>{throw new HarnessError('DRIVER_UNAVAILABLE','The packaged control driver trust resource is missing or invalid.');});

 const parsed=controlDriverManifestV1Schema.safeParse(manifest);
 const driverId='gen-v1-windows-control-bridge',backendProofRef=`electron/${version}`;
 const targetIdentityFormat='gen-v1.control-target.v1',stopRoute='HOST_CANCEL';
 const captureBounds={maxWidth:8192,maxHeight:8192,maxBytes:33554432};
 const protocols=['browser-tab','native-window'] as const;
 if(!parsed.success||parsed.data.artifact!==artifact||parsed.data.adapterModule!==adapterModule||
    parsed.data.artifactSha256!==trust.artifactSha256||parsed.data.adapterModuleSha256!==trust.adapterModuleSha256||
    parsed.data.driverId!==driverId||parsed.data.backendProofRef!==backendProofRef||
    parsed.data.targetIdentityFormat!==targetIdentityFormat||parsed.data.stopRoute!==stopRoute||
    parsed.data.captureBounds.maxWidth!==captureBounds.maxWidth||parsed.data.captureBounds.maxHeight!==captureBounds.maxHeight||
    parsed.data.captureBounds.maxBytes!==captureBounds.maxBytes||parsed.data.apiProtocols.length!==protocols.length||
    !protocols.every(protocol=>parsed.data.apiProtocols.includes(protocol))){
  throw new HarnessError('DRIVER_ARTIFACT_MISMATCH','The control driver claim does not match the packaged identity.');
 }

 const [artifactDigest,adapterDigest]=await Promise.all([artifact,adapterModule].map(async path=>
  createHash('sha256').update(await readPackagedFile(path)).digest('hex'),
 )).catch(()=>{throw new HarnessError('DRIVER_ARTIFACT_MISMATCH','The packaged control driver files are missing or unreadable.');});
 if(artifactDigest!==trust.artifactSha256||adapterDigest!==trust.adapterModuleSha256){
  throw new HarnessError('DRIVER_ARTIFACT_MISMATCH','The packaged control driver files do not match the build digests.');
 }
 return protocols.map(apiProtocol=>({driverId:`${driverId}:${apiProtocol}`,packageDigest:trust.artifactSha256,apiProtocol,backendProofRef,targetIdentityFormat,captureBounds,supportsInputCancellation:true,stopRoute}));
}

/** One owned host, reused by the CLI and the desktop's real-Node sidecar. */
export async function launchHost(options:HostOptions,overrides:Partial<HostFactories>={}):Promise<RunningHost> {
 const hostPort=port(options.port,'HARNESS_PORT'),widgetPort=port(options.widgetPort,'HARNESS_WIDGET_PORT');
 if(hostPort===widgetPort)throw new Error('The host and widget ports must be different.');
 if(!options.dataDir.trim())throw new Error('The harness data directory must be nonempty.');
 const make:HostFactories={acquireProfile:acquireProfileLease,createStore:dataDir=>new Store(dataDir),createRuntime,createService:createProtectedHermesService,buildServer,buildWidgetServer,loadPlugins:loadInstalledPlugins,createSkillCatalog:createPersonalSkillCatalog,...overrides};
 let plugins:PluginRegistry|undefined,pluginLoadFailed=false,isolated:IsolatedExtensionHost|undefined;
 let profile:ProfileLease|undefined,store:Store|undefined,runtime:ReturnType<typeof createRuntime>|undefined,service:Service|undefined,app:Awaited<ReturnType<typeof buildServer>>|undefined,widgets:Awaited<ReturnType<typeof buildWidgetServer>>|undefined,closing:Promise<void>|undefined,accepting=false;
 let releaseCapabilities:(()=>void)|undefined;
 const close=()=>closing??= (async()=>{
  accepting=false;
  // Begin revoking task authority immediately, independently of HTTP/SSE close.
  const results=await Promise.allSettled([
   Promise.resolve().then(()=>app?.close()),
   Promise.resolve().then(()=>widgets?.close()),
   Promise.resolve().then(()=>service?service.dispose():runtime?.dispose()),
   Promise.resolve().then(()=>isolated?.close()),
   Promise.resolve().then(()=>plugins?.close()),
  ]);
  const failures:unknown[]=results.filter((result):result is PromiseRejectedResult=>result.status==='rejected').map(result=>result.reason);
  try{store?.close();}catch(error){failures.push(error);}
  if(!failures.length)try{profile?.close();releaseCapabilities?.();}catch(error){failures.push(error);}
  if(failures.length)throw new AggregateError(failures,`Could not close the harness: ${failures[0] instanceof Error?failures[0].message:'resource cleanup failed'}`);
 })();
 try {
  profile=make.acquireProfile(resolve(options.dataDir));
  releaseCapabilities=configureHostCapabilityFlags(options.capabilityFlags);
  store=make.createStore(profile.dataDir);runtime=make.createRuntime({dataDir:store.dataDir,accounts:accountResolver(store)});service=await make.createService(store,runtime,{toolEffectFlags:options.toolEffectFlags});
  const pluginRoot=resolve(options.pluginDir??process.env.HARNESS_PLUGIN_DIR??join(process.env.LOCALAPPDATA??homedir(),'GenV1','plugins'));
  const version=JSON.parse(await readFile(fileURLToPath(new URL('../../package.json',import.meta.url)),'utf8')).version as string;
  try{plugins=await make.loadPlugins(pluginRoot,version);}catch{pluginLoadFailed=true;}
  const pluginFailures=plugins?.failures?.()??[];if(pluginFailures.length)pluginLoadFailed=true;
  const pluginError=pluginLoadFailed?(pluginFailures.length?pluginFailures.map(failure=>failure.message).join(' '):'An installed plug-in could not load. Its saved data is retained.'):undefined;
  // M13 isolated lane: registered beside the trusted lane, never replacing it.
  // With no installed approved backend every activation fails closed and the
  // recorded hold is what the catalog reports.
  isolated=new IsolatedExtensionHost({
   enabled:()=>capabilityEnabled('plugins.isolatedV1'),
   approvedBackendId:()=>options.approvedBackendId,
   backends:()=>options.isolationBackends??[],
   launcher:createSpawnWorkerLauncher({entryPath:fileURLToPath(new URL('../../packages/plugins/worker-entry.ts',import.meta.url)),genVersion:version}),
   // DEP-M13-BACKEND-01: no approved backend-bound worker launcher exists on
   // this host, so production wiring holds activation closed
   // (HOLD_BACKEND_LAUNCH_BINDING) before anything starts — the
   // development/test direct-spawn transport above is never reachable here.
   productionLauncher:()=>undefined,
  });
  if(capabilityEnabled('plugins.isolatedV1')){
   for(const record of await readPluginIndex(pluginRoot).catch(()=>[])){
    try{const admitted=await admitIsolatedPackage(join(pluginRoot,record.id,record.version),record.digest);if(admitted)isolated.register(admitted.manifest,{packageDir:admitted.verified.directory,dataDir:join(pluginRoot,'data',record.id)});}catch{/* an ineligible or invalid declaration stays trusted-only */}
   }
  }
  const mounts:MountRegistry=new Map();
  app=await make.buildServer(service,{port:hostPort,widgetPort,dev:options.dev,mounts,plugins,skillCatalog:make.createSkillCatalog(store,{pluginRoot}),admitPluginRequest:()=>accepting,launchToken:options.launchToken,isolatedExtensions:isolated,...(pluginError?{pluginError}:{})});
  widgets=await make.buildWidgetServer(service,mounts,widgetPort);
  // Own both ports before recovering durable runs. A collision must not alter
  // another live host's task authority, and early clients must wait for recovery.
  app.addHook('onRequest',async(_request,reply)=>{if(!accepting)return reply.code(503).send({error:'The local harness is starting. Try again shortly.'});});
  widgets.addHook('onRequest',async(_request,reply)=>{if(!accepting)return reply.code(503).send({error:'The local harness is starting. Try again shortly.'});});
  await app.listen({host:'127.0.0.1',port:hostPort});
  await widgets.listen({host:'127.0.0.1',port:widgetPort});
  const hostAddress=app.server.address(),widgetAddress=widgets.server.address();
  if(!hostAddress||typeof hostAddress==='string'||!widgetAddress||typeof widgetAddress==='string')throw new Error('The local harness did not establish its loopback listeners.');
  await service.recover();
  accepting=true;
  const workspace=()=>new WorkspaceRepository(store!),attention=new AttentionRepository(store!);
  return {origin:`http://127.0.0.1:${hostAddress.port}`,widgetOrigin:`http://localhost:${widgetAddress.port}`,pid:process.pid,close,
   get nativeLayout(){return store&&typeof store.get==='function'?workspace().read().state.nativeLayout:undefined;},
   async saveNativeLayout(layout){if(!accepting)throw Error('Host is not accepting layout saves.');workspace().command({id:randomUUID(),type:'workspace.native.update',payload:{layout:parseDesktopLayout(layout)}});},
   stopAll:()=>service!.stopAll(),
   async attentionRead(){if(!accepting)throw Error('The host is not accepting attention requests.');return attention.claimDelivery();},
   async attentionAction(type,eventId){if(!accepting)throw Error('The host is not accepting attention requests.');if(type==='open')return attention.markOpen(eventId);attention.command({id:randomUUID(),eventId,type:'dismiss-popup'});return{dismissed:true};},
   validatePluginSurface:async surface=>await plugins?.validateSurface(surface as Parameters<PluginRegistry['validateSurface']>[0])===true,
   async pluginCompatibility(version){
    // Reload the active inventory for this decision; a separately installed
    // plug-in may have changed since download or application startup.
    return {allowed:(await checkInstalledCompatibility(pluginRoot,version)).compatible};
   },
   async updateReadiness(){return {idle:accepting&&!pluginLoadFailed&&!await plugins?.isBusy()&&service!.isUpdateIdle()};},
   async prepareUpdateClose(){accepting=false;const idle=service!.freezeForUpdate();return {idle:idle&&!pluginLoadFailed&&!await plugins?.isBusy()};},
   async devServersCount(){const tracker=workspaceHost(service!).devServers;return {count:tracker?.count()??0,items:(tracker?.all()??[]).map(row=>({url:row.url,port:row.port,label:row.label}))};},
   // Resolve trust from this server's own installed location (D02).
   async controlAttach(manifest){
    if(!accepting)throw new HarnessError('DRIVER_UNAVAILABLE','The host is not accepting control attachments.');
    if(!options.controlChannel)throw new HarnessError('DRIVER_UNAVAILABLE','No control driver transport is available.');
    const registrations=await verifyPackagedControlDriver(fileURLToPath(new URL('../../',import.meta.url)),version,manifest);
    if(!accepting)throw new HarnessError('DRIVER_UNAVAILABLE','The host is not accepting control attachments.');
    service!.attachControlDriver(createSidecarControlDriver(options.controlChannel),registrations);
    return {registered:true};
   },
  };
 }catch(error){await close().catch(()=>{});throw error;}
}
