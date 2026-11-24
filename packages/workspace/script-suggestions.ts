import type {ProjectScriptRunner,ProjectScriptSuggestion} from '../contracts/workspace.ts';

export interface DetectedRunner {runner:ProjectScriptRunner;runnerSource:'packageManager'|'lockfile'|'default';multipleLockfiles:boolean}
export interface SuggestionResult {suggestions:ProjectScriptSuggestion[];skipped:number}

const RUNNERS:readonly ProjectScriptRunner[]=['pnpm','npm','yarn'];
const LIFECYCLE=new Set(['preinstall','install','postinstall','prepare','prepublish','prepublishOnly','prepack','postpack','publish','postpublish','preversion','version','postversion','dependencies']);
// No shell quoting needed on cmd.exe or /bin/sh; fits the 100-char add-script name limit.
const NAME=/^[@A-Za-z0-9][A-Za-z0-9:._@/+-]{0,99}$/;
const CAP=50,BODY_MAX=500;

const packageName=(pkg:unknown)=>typeof pkg==='object'&&pkg!==null?pkg as Record<string,unknown>:undefined;

export function detectRunner(pkg:unknown,lockfiles:{pnpm:boolean;yarn:boolean;npm:boolean;count:number}):DetectedRunner{
 const manager=packageName(pkg)?.packageManager;
 if(typeof manager==='string'){
  const name=manager.split('@')[0];
  if((RUNNERS as readonly string[]).includes(name))return{runner:name as ProjectScriptRunner,runnerSource:'packageManager',multipleLockfiles:lockfiles.count>1};
 }
 if(lockfiles.pnpm)return{runner:'pnpm',runnerSource:'lockfile',multipleLockfiles:lockfiles.count>1};
 if(lockfiles.yarn)return{runner:'yarn',runnerSource:'lockfile',multipleLockfiles:lockfiles.count>1};
 if(lockfiles.npm)return{runner:'npm',runnerSource:'lockfile',multipleLockfiles:lockfiles.count>1};
 return{runner:'npm',runnerSource:'default',multipleLockfiles:lockfiles.count>1};
}

export function suggestScripts(pkg:unknown,runner:ProjectScriptRunner,savedCommands:string[]):SuggestionResult{
 const scripts=packageName(pkg)?.scripts;
 if(typeof scripts!=='object'||scripts===null||Array.isArray(scripts))return{suggestions:[],skipped:0};
 const saved=new Set(savedCommands.map(command=>command.trim().replace(/\s+/g,' '))),names=Object.keys(scripts as Record<string,unknown>);
 const hook=(name:string)=>(name.startsWith('pre')||name.startsWith('post'))&&names.includes(name.replace(/^pre|^post/,''));
 const suggestions:ProjectScriptSuggestion[]=[];let skipped=0;
 for(const name of names){
  const value=(scripts as Record<string,unknown>)[name];
  if(typeof value!=='string'||value.trim()===''||!NAME.test(name)||LIFECYCLE.has(name)||hook(name)){skipped++;continue;}
  const command=`${runner} run ${name}`;
  if(saved.has(command))continue; // already added: hidden, not counted
  if(suggestions.length>=CAP){skipped++;continue;}
  suggestions.push({name,body:value.length>BODY_MAX?value.slice(0,BODY_MAX):value,command});
 }
 return{suggestions,skipped};
}
