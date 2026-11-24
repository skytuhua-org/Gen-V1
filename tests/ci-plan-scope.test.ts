import {afterEach,expect,it} from 'vitest';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,renameSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {isPlanOnlyChange} from '../scripts/ci-plan-scope.mjs';

const roots:string[]=[];
const plan='docs/agent-plans/example.md',manifestPath='scripts/public-source-files.json';
type Manifest={version:number;baseline:string;source:string[];runtime:string[]};
function fixture(change:(context:{root:string;manifest:Manifest;write:(path:string,text:string)=>void})=>void){
  const root=mkdtempSync(join(tmpdir(),'gen-ci-plans-'));roots.push(root);
  const git=(args:string[])=>execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});
  const write=(path:string,text:string)=>{mkdirSync(dirname(join(root,path)),{recursive:true});writeFileSync(join(root,path),text);};
  const manifest:Manifest={version:1,baseline:'a'.repeat(40),source:['apps/example.ts',plan,manifestPath],runtime:['apps/example.ts']};
  write(plan,'# Original plan\n');write('apps/example.ts','export const example=1;\n');
  write(manifestPath,JSON.stringify(manifest));
  git(['init','--quiet']);git(['config','user.name','CI fixture']);git(['config','user.email','ci-fixture@example.invalid']);git(['config','core.autocrlf','false']);
  git(['add','.']);git(['commit','--quiet','-m','base']);
  write(plan,'# Revised plan\n');change({root,manifest,write});write(manifestPath,JSON.stringify(manifest));
  git(['add','-A']);git(['commit','--quiet','--allow-empty','-m','change']);
  return {root,git};
}
afterEach(()=>{for(const root of roots.splice(0))rmSync(root,{recursive:true,force:true});});

it('admits an existing plan edit without a dependency install',()=>{
  expect(isPlanOnlyChange(fixture(()=>{}).root)).toBe(true);
});
it('admits a new plan with only its source registration',()=>{
  const {root}=fixture(({manifest,write})=>{const path='docs/agent-plans/review-2026-11-23/issue-1803.md';write(path,'# Plan\n');manifest.source.push(path);});
  expect(isPlanOnlyChange(root)).toBe(true);
});
it('admits deleting a plan together with its source registration',()=>{
  const {root}=fixture(({root,manifest})=>{rmSync(join(root,plan));manifest.source=manifest.source.filter(path=>path!==plan);});
  expect(isPlanOnlyChange(root)).toBe(true);
});
it.each(['apps/example.ts','.github/workflows/ci.yml','docs/getting-started.md','docs/agent-plans/payload.mjs'])('keeps checks for changes to %s',path=>{
  expect(isPlanOnlyChange(fixture(({write})=>write(path,'changed\n')).root)).toBe(false);
});
it.each(['runtime','baseline','source','duplicate','unrelated-plan'] as const)('keeps checks for a %s manifest change',kind=>{
  const {root}=fixture(({manifest})=>{
    if(kind==='runtime')manifest.runtime=[];
    if(kind==='baseline')manifest.baseline='b'.repeat(40);
    if(kind==='source')manifest.source=manifest.source.filter(path=>path!=='apps/example.ts');
    if(kind==='duplicate')manifest.source.push(plan);
    if(kind==='unrelated-plan')manifest.source.push('docs/agent-plans/unrelated.md');
  });
  expect(isPlanOnlyChange(root)).toBe(false);
});
it('keeps checks when a new plan is not registered',()=>{
  expect(isPlanOnlyChange(fixture(({write})=>write('docs/agent-plans/unregistered.md','# Plan\n')).root)).toBe(false);
});
it('keeps checks when an application file is renamed into the plan directory',()=>{
  const {root}=fixture(({root,manifest})=>{renameSync(join(root,'apps/example.ts'),join(root,'docs/agent-plans/moved.md'));manifest.source.push('docs/agent-plans/moved.md');});
  expect(isPlanOnlyChange(root)).toBe(false);
});
it('keeps checks for a symlink even when its name ends in Markdown',()=>{
  const {root,git}=fixture(()=>{});
  const blob=git(['rev-parse','HEAD:'+plan]).trim();
  git(['update-index','--cacheinfo','120000,'+blob+','+plan]);git(['commit','--quiet','-m','symlink']);
  expect(isPlanOnlyChange(root)).toBe(false);
});
it('keeps checks for an executable Markdown file',()=>{
  const {root,git}=fixture(()=>{});
  git(['update-index','--chmod=+x',plan]);git(['commit','--quiet','-m','mode']);
  expect(isPlanOnlyChange(root)).toBe(false);
});
it('keeps checks for an empty diff or an unavailable comparison',()=>{
  const {root}=fixture(()=>{});
  expect(isPlanOnlyChange(root,'HEAD','HEAD')).toBe(false);
  expect(isPlanOnlyChange(root,'missing-base','HEAD')).toBe(false);
});
it('keeps checks when the source manifest cannot be parsed',()=>{
  const {root,git}=fixture(({write})=>write('docs/agent-plans/new.md','# Plan\n'));
  writeFileSync(join(root,manifestPath),'{');git(['add',manifestPath]);git(['commit','--quiet','-m','invalid manifest']);
  expect(isPlanOnlyChange(root,'HEAD~2','HEAD')).toBe(false);
});
