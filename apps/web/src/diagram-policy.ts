export interface DiagramInput {
  scopeKey:string;
  generation:number;
  source:string;
  fenceClosure:'incomplete'|'closed-newline'|'closed-eof';
  finality:'known-final'|'known-static'|'unknown';
  streaming:boolean;
}

export interface FlowCertificate {
  direction:'TD'|'TB'|'LR'|'RL'|'BT';
  nodes:readonly {id:string;label:string}[];
  edges:readonly {from:string;to:string;label:string}[];
}

type SourceReason='incomplete'|'unsupported'|'budget'|'invalid';
type FlowDecision=
  | {kind:'eligible';certificate:FlowCertificate;renderSource:string}
  | {kind:'source';reason:SourceReason};

const maxBytes=16_384;
const maxLines=256;
const maxNodes=64;
const maxEdges=128;
const maxLabelPoints=96;

const id='[A-Za-z][A-Za-z0-9_]{0,63}';
const rectangle=new RegExp(`^(${id})\\[([^\\]]*)\\]$`,'u');
const arrow=new RegExp(`^(${id})[ \\t]+-->(?:[ \\t]*\\|([^|]*)\\|)?[ \\t]+(${id})$`,'u');
const header=/^(?:graph|flowchart)[ \t]+(TD|TB|LR|RL|BT)$/u;
// The pinned parser also dispatches stateDiagram as a distinct diagram family.
const reserved=new Set(['graph','flowchart','subgraph','end','style','classdef','class','linkstyle',
  'click','direction','acctitle','accdescr','statediagram']);
const forbiddenLabel=/[\p{Cc}\p{Cs}\p{Zl}\p{Zp}\u0060\[\]{}()<>|"*~&\\;]/u;

const iconLabel=/\b(?:fa|fab|fal|far|fas|fat|fad):fa-[\w-]+/iu;

function labelIssue(label:string):SourceReason|undefined {
  if(!label.trim()||forbiddenLabel.test(label)||iconLabel.test(label))return 'invalid';
  let points=0;
  for(const _point of label){
    if(++points>maxLabelPoints)return 'budget';
  }
}

const keepSource=(reason:SourceReason):FlowDecision=>({kind:'source',reason});

/** Admit only a completely consumed graph in the selected flowchart subset. */
export function certifyFlowchart(input:DiagramInput):FlowDecision {
  if(input.streaming&&input.finality!=='unknown')return keepSource('invalid');
  if(input.fenceClosure==='incomplete'||(input.fenceClosure==='closed-eof'&&input.finality==='unknown')){
    return keepSource('incomplete');
  }

  const {source}=input;
  if(source.length>maxBytes||new TextEncoder().encode(source).length>maxBytes)return keepSource('budget');
  const normalized=source.replaceAll('\r\n','\n');
  if(/[\r\u2028\u2029]/u.test(normalized))return keepSource('invalid');
  const lines=normalized.split('\n');
  if(lines.at(-1)==='')lines.pop();
  if(lines.length>maxLines)return keepSource('budget');

  let direction:FlowCertificate['direction']|undefined;
  const ids=new Set<string>();
  const nodes:{id:string;label:string}[]=[];
  const edges:{from:string;to:string;label:string}[]=[];
  const renderLines:string[]=[];
  for(const rawLine of lines){
    const content=rawLine.replace(/^[ \t]+/u,'');
    if(!content||content.startsWith('%% '))continue;
    const line=content.replace(/[ \t]+$/u,'');
    if(!direction){
      const match=header.exec(line);
      if(!match)return keepSource('unsupported');
      direction=match[1] as FlowCertificate['direction'];
      renderLines.push(`flowchart ${direction}`);
      continue;
    }
    const node=rectangle.exec(line);
    if(node){
      const [,name,label]=node;
      if(edges.length||ids.has(name)||reserved.has(name.toLowerCase()))return keepSource('invalid');
      if(nodes.length===maxNodes)return keepSource('budget');
      const reason=labelIssue(label);
      if(reason)return keepSource(reason);
      ids.add(name);
      nodes.push({id:name,label});
      renderLines.push(`${name}[${label}]`);
      continue;
    }
    const edge=arrow.exec(line);
    if(!edge)return keepSource('unsupported');
    const [,from,label,to]=edge;
    if(!ids.has(from)||!ids.has(to))return keepSource('invalid');
    if(edges.length===maxEdges)return keepSource('budget');
    if(label!==undefined){
      const reason=labelIssue(label);
      if(reason)return keepSource(reason);
    }
    edges.push({from,to,label:label??''});
    renderLines.push(label===undefined?`${from} --> ${to}`:`${from} -->|${label}| ${to}`);
  }

  if(!direction||!nodes.length)return keepSource('invalid');
  return {kind:'eligible',certificate:{direction,nodes,edges},renderSource:renderLines.join('\n')+'\n'};
}
