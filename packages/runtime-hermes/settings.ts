import {HarnessError,type StartRun,type Thread,type Snapshot} from '../contracts/index.ts';
import type {Store} from '../storage/store.ts';
import type {SkillSummary} from '../contracts/skills.ts';
import {getPreferences} from '../contracts/preferences.ts';
import {createHostTools,hostSystemPrompt,loadDomainTools} from '../runtime-pi/tool-definitions.ts';
import type {HermesSettings} from './index.ts';
import {z} from 'zod';
import {agentResultSchemaFor,type AgentWorkV1} from '../contracts/agent-work.ts';
import {agentWorkToolNames} from '../core/agent-work.ts';

/** Embedding a standalone schema document inside a larger one breaks its
 * root-local `$ref`s, which would then resolve against the outer document
 * root (and dangle). Rewrite them onto the embedded copy's real location so
 * the advertised contract resolves exactly what the host validates against
 * the standalone schema. A schema carrying its own `$id` is a separate
 * resource whose refs already resolve inside itself, so it — and any
 * `$id`-scoped subtree — passes through unchanged. */
const schemaMaps=new Set(['properties','patternProperties','$defs','definitions','dependentSchemas','dependencies']);
const schemaChildren=new Set([
 'additionalProperties','additionalItems','unevaluatedProperties','propertyNames','items','prefixItems','contains',
 'unevaluatedItems','contentSchema','not','if','then','else','allOf','anyOf','oneOf',
]);
function embedSchema(schema:unknown,prefix:string):unknown{
 function walk(node:unknown):unknown{
  if(Array.isArray(node))return node.map(walk);
  if(!node||typeof node!=='object'||typeof(node as Record<string,unknown>).$id==='string')return node;
  return Object.fromEntries(Object.entries(node).map(([key,value])=>{
   if(key==='$ref'&&typeof value==='string'&&(value==='#'||value.startsWith('#/')))return [key,'#'+prefix+value.slice(1)];
   if(schemaMaps.has(key)&&value&&typeof value==='object'&&!Array.isArray(value))
    return [key,Object.fromEntries(Object.entries(value).map(([name,child])=>[name,walk(child)]))];
   // Other keywords can contain literal data, not schema references.
   return [key,schemaChildren.has(key)?walk(value):value];
  }));
 }
 return walk(schema);
}

/** Capture the app's role and controls; original Hermes owns cadence and tool schemas. */
export async function hermesSettings(store:Store,input?:StartRun):Promise<HermesSettings>{
 const preferences=getPreferences(store.get<Snapshot['settings']>('settings','global')??{}),thread=input?store.get<Thread>('thread',input.threadId):null;
 const work=thread?.kind==='delegate'&&thread.jobId?store.get<AgentWorkV1>('agentWork',thread.jobId):null;
 if(work&&(!input||work.childOwner.threadId!==input.threadId||work.childOwner.runId!==input.runId||work.childOwner.epoch!==input.epoch||thread?.runId!==input.runId||thread.epoch!==input.epoch))throw new HarnessError('CAPABILITY_DENIED','The typed child run owner is stale.');
 const skills=store.all<SkillSummary>('skill'),disabled=skills.filter(skill=>!skill.enabled||skill.state==='archived'||skill.migrationError).map(skill=>skill.name),protectedNames=skills.filter(skill=>skill.protected).map(skill=>skill.name);
 const readOnly=thread?.mode==='plan'||Boolean(thread?.sideParentId)||Boolean(work);
 const tools=createHostTools(await loadDomainTools(),async()=>{throw new HarnessError('CAPABILITY_DENIED','Tool metadata cannot execute a capability.');}).filter(tool=>!['skills_list','skill_view','skill_manage'].includes(tool.name));
 const hostTools:NonNullable<HermesSettings['hostTools']>=tools.map(({name,description,parameters})=>({name:name==='session_search'?'harness_session_search':name,description,parameters:parameters as Record<string,unknown>}));
 const allowed=work?new Set(agentWorkToolNames(work.role)):null;
 const childTools=work?[
  ...hostTools.filter(tool=>allowed!.has(tool.name)),
  {name:'agent_progress',description:'Acknowledge progress on this assigned child work.',parameters:{type:'object',properties:{message:{type:'string',maxLength:2000}},additionalProperties:false}},
  {name:'agent_result',description:'Submit the assigned work result against both its declared output contract and role schema.',parameters:{type:'object',properties:{output:{allOf:[embedSchema(work.expectedOutputSchema,'/properties/output/allOf/0'),embedSchema(z.toJSONSchema(agentResultSchemaFor(work.role)),'/properties/output/allOf/1')]}},required:['output'],additionalProperties:false}},
 ]:hostTools;
 return {
  config:{skills:{creation_nudge_interval:preferences.learningEnabled&&!readOnly?preferences.learningInterval:0,write_approval:preferences.learningApproval,disabled},memory:{memory_enabled:false,user_profile_enabled:false}},
  skillPolicy:{enabled:true,allowWrites:!readOnly,disabledNames:disabled,protectedNames},
  systemPrompt:work?`You are the ${work.role} child assigned to one parent task. Use only the supplied role tools and resource grants. Do not delegate or obtain additional authority. Complete the assignment by calling agent_result with an output matching both schemas in that tool. A prose response does not submit a result. Report INCOMPLETE or BLOCKED honestly when the assignment cannot be completed.`:hostSystemPrompt(input?.memory),
  hostTools:childTools,
 };
}
