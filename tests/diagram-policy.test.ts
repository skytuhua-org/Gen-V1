import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {certifyFlowchart,type DiagramInput} from '../apps/web/src/diagram-policy';

const base='flowchart LR\nStart[Begin]\nFinish[End]\nStart --> Finish\n';
const certify=(source=base,other:Partial<DiagramInput>={})=>certifyFlowchart({
  scopeKey:'fixture',generation:1,source,fenceClosure:'closed-newline',finality:'unknown',streaming:false,...other,
});

describe('flowchart certificate',()=>{
  it('preserves labels, repeated edges and source while normalizing only the rendering copy',()=>{
    const source=' \tgraph\tBT \r\n\r\n\t%% comment\r\n A[Départ 🌱]\r\n B[Fin]\r\n A\t--> |Déjà vu|\tB \r\n A -->|Déjà vu| B\r\n';
    expect(certify(source)).toEqual({
      kind:'eligible',
      renderSource:'flowchart BT\nA[Départ 🌱]\nB[Fin]\nA -->|Déjà vu| B\nA -->|Déjà vu| B\n',
      certificate:{direction:'BT',nodes:[{id:'A',label:'Départ 🌱'},{id:'B',label:'Fin'}],edges:[
        {from:'A',to:'B',label:'Déjà vu'},{from:'A',to:'B',label:'Déjà vu'},
      ]},
    });
    expect(source).toContain('\r\n');
  });

  it.each([
    [{fenceClosure:'incomplete'},'incomplete'],
    [{fenceClosure:'closed-eof'},'incomplete'],
    [{fenceClosure:'closed-eof',finality:'known-final'},'eligible'],
    [{fenceClosure:'closed-eof',finality:'known-static'},'eligible'],
    [{fenceClosure:'closed-newline',streaming:true},'eligible'],
    [{fenceClosure:'closed-newline',finality:'known-static',streaming:true},'invalid'],
    [{fenceClosure:'closed-eof',finality:'known-final',streaming:true},'invalid'],
  ] as const)('honors closure and finality for %j', (options,verdict)=>{
    const result=certify(base,options);
    expect(result.kind==='eligible'?result.kind:result.reason).toBe(verdict);
  });

  it.each([
    'click Start onClick','style Start fill:red','classDef x color:blue','subgraph Group','End[Reserved]',
    'StateDiagram[Reserved]','Start[Duplicate]','Missing --> Finish','Start -->','Start --> Finish --> Start',
    'Start --> Finish;','Start --> Finish %% extra','%%missing space','%%{init}','---','stateDiagram-v2',
    'Finish[Trailing] garbage','Late[Too late]','Start -->| | Finish','Start -->|A &amp; B| Finish',
    'Start -->|**Bold**| Finish','Start -->|a\\b| Finish','Start -->|one`two| Finish',
    'Start -->|bad\u0000| Finish','Start -->|bad\uD800| Finish','Start -->|one\u2028two| Finish',
  ])('rejects the entire diagram for %j',tail=>{
    expect(certify(base+tail+'\n').kind).toBe('source');
  });

  it('requires a single header and at least one declared rectangle',()=>{
    expect(certify('flowchart TD\n').kind).toBe('source');
    expect(certify('flowchart TD\nA[One]\n%% \n').kind).toBe('eligible');
    for(const line of ['End[Reserved]','StateDiagram[Reserved]','A[Duplicate]','A[More];','B[fa:fa-check]']){
      expect(certify('flowchart TD\nA[One]\n'+line+'\n').kind).toBe('source');
    }
    expect(certify('graph LR extra\nA[One]\n').kind).toBe('source');
    expect(certify('stateDiagram-v2\nA[One]\n').kind).toBe('source');
  });

  it('enforces each input budget at and immediately beyond its boundary',()=>{
    const exactBytes=base+'%% '+'x'.repeat(16_384-Buffer.byteLength(base)-4)+'\n';
    const exactLines=base+'%% comment\n'.repeat(252);
    const exactNodes='graph LR\n'+Array.from({length:64},(_,index)=>`N${index}[Node]\n`).join('');
    const exactEdges=base+'Start --> Finish\n'.repeat(127);
    const label='🦋'.repeat(96);
    const cases=[
      [exactBytes,exactBytes+'x'],
      [exactLines,exactLines+'%% comment\n'],
      [exactNodes,exactNodes+'Overflow[Node]\n'],
      [exactEdges,exactEdges+'Start --> Finish\n'],
      [`graph LR\nA[${label}]\n`,`graph LR\nA[${label}🦋]\n`],
      [base+`Start -->|${label}| Finish\n`,base+`Start -->|${label}🦋| Finish\n`],
    ];
    for(const [at,over] of cases){
      expect(certify(at).kind).toBe('eligible');
      expect(certify(over)).toEqual({kind:'source',reason:'budget'});
    }
  });

  it('verifies every frozen corpus hash and reports unchanged admission',()=>{
    const corpus=JSON.parse(readFileSync(new URL('./fixtures/diagram-adoption-corpus.json',import.meta.url),'utf8')) as {
      version:number;
      entries:{id:string;source:string;sourceSha256:string;expected:{
        direction:string;orderedNodes:string[];orderedEdges:{source:string;target:string;label:string}[];
      }}[];
    };
    const admitted:string[]=[];
    const heldOut:Record<string,string>={};
    for(const entry of corpus.entries){
      expect(createHash('sha256').update(entry.source).digest('hex'),entry.id).toBe(entry.sourceSha256);
      const result=certify(entry.source);
      if(entry.id.startsWith('heldout-'))heldOut[entry.id]=result.kind==='eligible'?'eligible':result.reason;
      if(result.kind!=='eligible')continue;
      admitted.push(entry.id);
      expect(result.certificate.direction,entry.id).toBe(entry.expected.direction);
      expect(result.certificate.nodes.map(node=>node.id),entry.id).toEqual(entry.expected.orderedNodes);
      expect(result.certificate.edges,entry.id).toEqual(entry.expected.orderedEdges.map(edge=>({from:edge.source,to:edge.target,label:edge.label})));
    }
    expect(corpus.version).toBe(2);
    expect(corpus.entries).toHaveLength(26);
    expect(admitted.filter(id=>id.startsWith('useful-'))).toHaveLength(6);
    expect(Object.entries(heldOut)).toHaveLength(20);
    expect(Object.values(heldOut).filter(reason=>reason==='eligible')).toHaveLength(0);
    expect(Object.entries(heldOut).filter(([,reason])=>reason==='invalid').map(([id])=>id))
      .toEqual(['heldout-09','heldout-10']);
    expect(Object.values(heldOut).filter(reason=>reason==='unsupported')).toHaveLength(18);
  });
});
