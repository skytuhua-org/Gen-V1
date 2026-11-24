// Plan mirrors are documentation. Admit only regular Markdown files in their
// dedicated directory and the exact source-manifest entries for those files.
// Any uncertainty keeps the normal application checks enabled.
import {execFileSync} from 'node:child_process';
import {appendFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import {pathToFileURL} from 'node:url';

const manifestPath='scripts/public-source-files.json';
const planPath=path=>typeof path==='string'&&/^docs\/agent-plans\/(?:[A-Za-z0-9_-][A-Za-z0-9_.-]*\/)*[A-Za-z0-9_-][A-Za-z0-9_.-]*\.md$/.test(path)&&!path.split('/').some(part=>part.endsWith('.'));

export function isPlanOnlyChange(cwd=process.cwd(),base='HEAD^1',head='HEAD') {
  const git=args=>execFileSync('git',args,{cwd,encoding:'utf8',maxBuffer:16*1024*1024,stdio:['ignore','pipe','pipe']});
  try {
    // Disable rename detection so moving source into the plan directory still
    // exposes the deleted source path. Raw records also expose symlinks/modes.
    const raw=git(['diff','--raw','--no-abbrev','--no-renames','--no-ext-diff','-z',base,head,'--']);
    const fields=raw.split('\0');
    if(fields.pop()!==''||fields.length===0||fields.length%2!==0)return false;
    const plans=new Map();
    for(let index=0;index<fields.length;index+=2){
      const match=/^:(\d{6}) (\d{6}) [0-9a-f]{40} [0-9a-f]{40} ([AMD])$/.exec(fields[index]);
      const path=fields[index+1];
      if(!match||![match[1],match[2]].every(mode=>mode==='100644'||mode==='000000'))return false;
      if(path===manifestPath){if(match[1]!=='100644'||match[2]!=='100644')return false;}
      else if(planPath(path))plans.set(path,match[2]!=='000000');
      else return false;
    }
    if(plans.size===0)return false;
    const before=JSON.parse(git(['show',base+':'+manifestPath]));
    const after=JSON.parse(git(['show',head+':'+manifestPath]));
    for(const manifest of [before,after]){
      if(!manifest||Array.isArray(manifest)||!Array.isArray(manifest.source)||manifest.source.some(path=>typeof path!=='string')||new Set(manifest.source).size!==manifest.source.length)return false;
    }
    // Version, baseline, runtime, and every non-plan source entry are unchanged.
    if(!isDeepStrictEqual({...before,source:before.source.filter(path=>!planPath(path))},{...after,source:after.source.filter(path=>!planPath(path))}))return false;
    const oldSource=new Set(before.source),newSource=new Set(after.source);
    for(const path of new Set([...oldSource,...newSource])){
      if(oldSource.has(path)!==newSource.has(path)&&(!planPath(path)||!plans.has(path)))return false;
    }
    for(const [path,present] of plans)if(newSource.has(path)!==present)return false;
    return true;
  } catch {
    return false;
  }
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const plansOnly=isPlanOnlyChange();
  console.log(plansOnly?'Only plan Markdown and its source registrations changed.':'Application checks remain enabled.');
  if(process.env.GITHUB_OUTPUT)appendFileSync(process.env.GITHUB_OUTPUT,'plans_only='+plansOnly+'\n');
}
