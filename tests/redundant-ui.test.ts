import {createElement} from 'react';
import {readFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe,expect,it} from 'vitest';
import type {ProjectContext} from '../packages/contracts/workspace';
import {EMPTY_USAGE} from '../packages/contracts';
import {DEFAULT_PREFERENCES} from '../packages/contracts/preferences';
import {ProjectContextCard} from '../apps/web/src/ProjectContextCard';
import {UsageFooter} from '../apps/web/src/UsageFooter';
import {UsageSummary} from '../apps/web/src/WorkspacePanelBodies';
import {WorkspaceSurfaceBody} from '../apps/web/src/WorkspaceSurfaceBody';
import {runtimeUsageReport} from '../apps/web/src/usage-presentation';
import {taskFixture} from './e2e/task-interface-fixture';
import {PLANNING_PROVENANCE,planDataId} from '../packages/contracts/planning';

const context:ProjectContext={project:{id:'p',name:'Project',rootPath:'C:/Synthetic',authority:{kind:'local'},createdAt:'2026-11-10T00:00:00Z'},threadId:'a',branch:'main',head:'abc',machineName:'Machine',editor:{available:false,label:'Editor'},changes:{added:4,removed:2,files:1},lineage:[],scripts:[],capabilities:{git:true,terminal:false,pullRequests:false}};
const usage={...EMPTY_USAGE,inputTokens:18321,outputTokens:791,cost:0.012345,sessionPercent:23.456,weeklyPercent:67.89,contextTokens:18000,contextWindow:100000};
describe('proven duplicate removals',()=>{
 it('shows explicit picker rows and exposes every project action without a tools disclosure',()=>{
  const value={...context,editor:{available:true,label:'Editor'},scripts:[{id:'test',name:'Run tests',command:'pnpm test'}],capabilities:{...context.capabilities,terminal:true}};
  const html=renderToStaticMarkup(createElement(ProjectContextCard,{picker:true,context:value,onShowChanges:()=>{},composerChangesAvailable:true,onAction:async()=>{}}));
  for(const text of ['Project','C:/Synthetic','Branch','main','Uncommitted changes','+4','−2','Open in Editor','Add script','Run tests','Commit'])expect(html).toContain(text);
  expect(html).not.toContain('Project tools');expect(html).not.toContain('<details class="project-context-tools"');expect(html).not.toContain('aria-label="Plan summary"');
 });
 it.each([{added:0,removed:0,files:0},{added:null,removed:null,files:null}])('distinguishes an empty checkout from unavailable change data: %j',changes=>{
  const html=renderToStaticMarkup(createElement(ProjectContextCard,{picker:true,context:{...context,changes}}));
  expect(html).toContain(changes.files===0?'No changes':'Unavailable');
  expect(html).not.toContain(changes.files===0?'Unavailable':'No changes');
 });
 it('retains picker error recovery without inventing project or plan rows',()=>{
  const html=renderToStaticMarkup(createElement(ProjectContextCard,{picker:true,error:'Context unavailable',onConnect:()=>{}}));
  expect(html).toContain('Context unavailable');expect(html).toContain('Connect project');expect(html).not.toContain('aria-label="Plan summary"');
 });
 it.each([false,true])('shows a labeled picker plan with its exact completed count, including an empty plan: %s',empty=>{
  const snapshot=taskFixture({root:'text',elements:{text:{type:'Text',props:{text:'Synthetic'}}}});
  snapshot.data.push({id:planDataId('task-thread'),threadId:'task-thread',revision:3,provenance:PLANNING_PROVENANCE,createdAt:'2026-11-10T00:00:00Z',value:{version:1,title:'Review changes',agents:[],steps:empty?[]:[{id:'done',title:'Read files',status:'completed',requirements:[]},{id:'now',title:'Check tests',status:'working',requirements:[]}]}});
  const html=renderToStaticMarkup(createElement(ProjectContextCard,{picker:true,context,snapshot,threadId:'task-thread'}));
  expect(html).toContain('>Plan</span>');expect(html).toContain('Review changes');expect(html).toContain(empty?'0 of 0 done':'1 of 2 done');
  expect(html.includes('role="progressbar"')).toBe(!empty);
 });
 it.each([undefined,false])('retains overview Changes when equivalence is %s',composerChangesAvailable=>{
  const html=renderToStaticMarkup(createElement(ProjectContextCard,{context,onShowChanges:()=>{},composerChangesAvailable}));
  expect(html).toContain('1 changed files');expect(html).toContain('>Changes</span>');
 });
 it('hides only the proven equivalent overview shortcut',()=>{
  const html=renderToStaticMarkup(createElement(ProjectContextCard,{context,onShowChanges:()=>{},composerChangesAvailable:true}));
  expect(html).not.toContain('>Changes</span>');expect(html).toContain('>main</span>');expect(html).toContain('Project tools');
 });
 it('removes footer detail rows when an owner and Usage destination exist',()=>{
  const html=renderToStaticMarkup(createElement(UsageFooter,{usage,visible:true,threadId:'a',onOpenUsage:()=>{}}));
  expect(html).not.toContain('<dl>');expect(html).toContain('Open Usage');expect(html).toContain('18,321 input tokens');
 });
 it.each([{threadId:'a'}, {onOpenUsage:()=>{}}, {}])('retains full details without a proven owner destination: %j',props=>{
  const html=renderToStaticMarkup(createElement(UsageFooter,{usage,visible:true,...props}));
  for(const text of ['Input tokens','18,321','Output tokens','791','Reported cost','0.012345','23.5%','67.9%'])expect(html).toContain(text);
 });
 it('keeps all footer values in the same-owner full report',()=>{
  expect(runtimeUsageReport({id:'a',title:'Owner A',modelId:'provider/model'},usage)).toMatchObject({scopeId:'a',scopeLabel:'Owner A',inputTokens:18321,outputTokens:791,cost:{amount:0.012345},limits:[{id:'session',usedPercent:23.456},{id:'weekly',usedPercent:67.89}]});
 });
 it('keeps context capacity separate and retains unknown values',()=>{
  const html=renderToStaticMarkup(createElement(UsageSummary,{usage}));expect(html).toContain('Context window');expect(html).toContain('18.0%');expect(html).toContain('18K of 100K');
  expect(renderToStaticMarkup(createElement(UsageFooter,{visible:true}))).toContain('Not reported');
 });
 it('retains the real Notes route and its explicit owner rather than the active thread',()=>{
  const snapshot=taskFixture({root:'text',elements:{text:{type:'Text',props:{text:'Synthetic'}}}});
  snapshot.threads.push({...snapshot.threads[0],id:'other'});snapshot.activeThreadId='other';
  snapshot.memory=[{id:'n',threadId:'task-thread',key:'decision',content:'Owner note',revision:1,author:'user',updatedAt:'2026-11-10T00:00:00Z'}];
  const html=renderToStaticMarkup(createElement(WorkspaceSurfaceBody,{kind:'notes',binding:{authority:{kind:'local'},threadId:'task-thread'},snapshot,refresh:async()=>{},preferences:DEFAULT_PREFERENCES}));
  expect(html).toContain('Owner note');expect(html.match(/aria-label="Thread memory"/g)).toHaveLength(1);
  const usageHtml=renderToStaticMarkup(createElement(WorkspaceSurfaceBody,{kind:'usage',binding:{authority:{kind:'local'},threadId:'task-thread'},snapshot,refresh:async()=>{},preferences:DEFAULT_PREFERENCES}));
  expect(usageHtml).not.toContain('aria-label="Thread memory"');
  expect(usageHtml).not.toContain('Note decision');
 });
 it('opts each composer picker overview owner into the retained composer Changes route',()=>{
  const app=readFileSync(new URL('../apps/web/src/App.tsx',import.meta.url),'utf8');
  const summaries=app.split('<ProjectContextSurface').slice(1).filter(value=>/key=\{(thread|overviewThread)\?\.id\?\?'new'\}/.test(value));
  expect(summaries).toHaveLength(1);
  for(const summary of summaries)expect(summary.split('/>')[0]).toContain('composerChangesAvailable={composerChangesAvailable}');
  expect(app).toContain('const overviewThread=snapshot.threads.find(value=>value.id===projectPicker?.threadId)');
  expect(app).toContain('overview={projectOverview}');
  expect(app).toContain('ready&&!busy');
  expect(app).toContain('available&&embeddedActive&&!threadHeld');
 });
 it('respects the footer visibility preference',()=>{expect(renderToStaticMarkup(createElement(UsageFooter,{usage,visible:false}))).toBe('');});
});
