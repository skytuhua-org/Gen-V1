// Intraline diff annotation: pure, bounded comparison helpers shared by the
// Recorded, unified-patch, checkpoint History and ChangeSet renderers. All
// ranges are half-open UTF-16 offsets, aligned to grapheme boundaries.

export type IntralineRange={start:number;end:number};
export interface IntralineLine{index:number;ranges:IntralineRange[]}
export interface SnapshotAnnotation{before:IntralineLine[];after:IntralineLine[];beforeKeep:number[]|undefined;afterKeep:number[]|undefined}
// Unified output: row index in patch.split('\n') -> ranges inside the row text
// after its single leading marker character.
export type UnifiedAnnotation=Map<number,IntralineRange[]>;

const MAX_INPUT=40000;
const MAX_LINES=600;
const MAX_LINE=512;
const MAX_REGION_ROWS=16;
const MAX_SPAN_RUNS=160;
const DP_BUDGET=250000;

type Grapheme={text:string;start:number;end:number};
type Segmenter={segment(text:string):Iterable<{segment:string;index:number;isWordLike?:boolean}>};
const wordSegmenter=()=>typeof Intl!=='undefined'&&typeof (Intl as {Segmenter?:new(locale?:string,options?:{granularity:string})=>Segmenter}).Segmenter==='function'?new (Intl as {Segmenter:new(locale?:string,options?:{granularity:string})=>Segmenter}).Segmenter(undefined,{granularity:'word'}):null;
const graphemeSegmenter=()=>typeof Intl!=='undefined'&&typeof (Intl as {Segmenter?:new(locale?:string,options?:{granularity:string})=>Segmenter}).Segmenter==='function'?new (Intl as {Segmenter:new(locale?:string,options?:{granularity:string})=>Segmenter}).Segmenter(undefined,{granularity:'grapheme'}):null;

function graphemes(text:string,segmenter:Segmenter|null):Grapheme[]|null{
  if(!segmenter)return null;
  const out:Grapheme[]=[];
  for(const part of segmenter.segment(text))out.push({text:part.segment,start:part.index,end:part.index+part.segment.length});
  return out;
}

export type DiffToken={text:string;start:number;end:number;space:boolean};
// Word-like segments stay whole; whitespace runs merge; other segments
// (punctuation, symbols) become one token per grapheme.
export function diffTokens(text:string,segmenter?:Segmenter|null):DiffToken[]|null{
  const words=segmenter===undefined?wordSegmenter():segmenter;
  if(!words)return null;
  const out:DiffToken[]=[];
  for(const part of words.segment(text)){
    const space=/^\s+$/.test(part.segment);
    if(space&&out.length&&out[out.length-1].space){out[out.length-1].text+=part.segment;out[out.length-1].end=part.index+part.segment.length;continue;}
    out.push({text:part.segment,start:part.index,end:part.index+part.segment.length,space});
  }
  return out;
}

// Bounded LCS over item indexes with earliest-match ties: returns matched
// index pairs in order, or null when the DP table would exceed `cells`.
function lcs<T>(a:T[],b:T[],eq:(x:T,y:T)=>boolean,cells:number):[number,number][]|null{
  const m=a.length,n=b.length;
  if(m===0||n===0)return [];
  if((m+1)*(n+1)>cells)return null;
  const dp=new Uint32Array((m+1)*(n+1));
  const width=n+1;
  for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--)
    dp[i*width+j]=eq(a[i],b[j])?dp[(i+1)*width+j+1]+1:Math.max(dp[(i+1)*width+j],dp[i*width+j+1]);
  const pairs:[number,number][]=[];
  let i=0,j=0;
  while(i<m&&j<n){
    if(eq(a[i],b[j])&&dp[i*width+j]===dp[(i+1)*width+j+1]+1){pairs.push([i,j]);i++;j++;}
    else if(dp[(i+1)*width+j]>=dp[i*width+j+1])i++;else j++;
  }
  return pairs;
}

const stripWhitespace=(text:string)=>text.replace(/\s/g,'');

function tokenDice(a:DiffToken[],b:DiffToken[]){
  const count=(tokens:DiffToken[])=>{const map=new Map<string,number>();for(const t of tokens)if(!t.space)map.set(t.text,(map.get(t.text)??0)+1);return map;};
  const am=count(a),bm=count(b);let shared=0,size=0;
  for(const [text,n] of am){shared+=Math.min(n,bm.get(text)??0);size+=n;}
  for(const [,n] of bm)size+=n;
  return size===0?0:(2*shared)/size;
}

function prefixSuffixScore(a:Grapheme[],b:Grapheme[]){
  let head=0;while(head<a.length&&head<b.length&&a[head].text===b[head].text)head++;
  let tail=0;while(tail<a.length-head&&tail<b.length-head&&a[a.length-1-tail].text===b[b.length-1-tail].text)tail++;
  const size=a.length+b.length;
  return size===0?0:(2*(head+tail))/size;
}

interface PairScore{oldIndex:number;newIndex:number;score:number}
// Unique, non-crossing best matches inside one replacement region.
function pairRegion(oldLines:{index:number;text:string}[],newLines:{index:number;text:string}[],segmenter:Segmenter|null):PairScore[]{
  const oldCandidates=oldLines.filter(line=>line.text.trim()&&line.text.length<=MAX_LINE).slice(0,MAX_REGION_ROWS);
  const newCandidates=newLines.filter(line=>line.text.trim()&&line.text.length<=MAX_LINE).slice(0,MAX_REGION_ROWS);
  if(!oldCandidates.length||!newCandidates.length)return [];
  const gs=graphemeSegmenter();
  const oldTokens=oldCandidates.map(line=>diffTokens(line.text,segmenter)),newTokens=newCandidates.map(line=>diffTokens(line.text,segmenter));
  const oldGraphemes=oldCandidates.map(line=>graphemes(line.text,gs)),newGraphemes=newCandidates.map(line=>graphemes(line.text,gs));
  if(oldTokens.some(t=>!t)||newTokens.some(t=>!t)||oldGraphemes.some(g=>!g)||newGraphemes.some(g=>!g))return [];
  const matrix:number[][]=oldCandidates.map((_,i)=>newCandidates.map((_,j)=>{
    const dice=tokenDice(oldTokens[i]!,newTokens[j]!);
    const affix=prefixSuffixScore(oldGraphemes[i]!,newGraphemes[j]!);
    return Math.max(dice,affix);
  }));
  const picked:PairScore[]=[];
  const takenOld=new Set<number>(),takenNew=new Set<number>();
  // Greedy global-best pairing; every accepted pair must be each side's
  // unique best above the threshold.
  for(;;){
    let best:PairScore|null=null,secondBest=0;
    for(let i=0;i<oldCandidates.length;i++){
      if(takenOld.has(i))continue;
      for(let j=0;j<newCandidates.length;j++){
        if(takenNew.has(j))continue;
        const score=matrix[i]![j]!;
        if(score<0.5)continue;
        if(!best||score>best.score){secondBest=best?.score??0;best={oldIndex:i,newIndex:j,score};}
        else if(score>secondBest&&score<best.score)secondBest=score;
      }
    }
    if(!best)break;
    // Unique best on both sides: no equal-scoring alternative for either row.
    let tied=secondBest>=best.score;
    if(!tied)for(let j=0;j<newCandidates.length;j++){if(j!==best.newIndex&&!takenNew.has(j)&&matrix[best.oldIndex]![j]!>=best.score){tied=true;break;}}
    if(!tied)for(let i=0;i<oldCandidates.length;i++){if(i!==best.oldIndex&&!takenOld.has(i)&&matrix[i]![best.newIndex]!>=best.score){tied=true;break;}}
    if(tied){takenOld.add(best.oldIndex);takenNew.add(best.newIndex);continue;}
    takenOld.add(best.oldIndex);takenNew.add(best.newIndex);
    // Report the caller-supplied row indexes, not candidate positions.
    picked.push({oldIndex:oldCandidates[best.oldIndex]!.index,newIndex:newCandidates[best.newIndex]!.index,score:best.score});
  }
  // Discard crossings: a pair that inverts source order against another pair.
  return picked.filter((pair,_,all)=>!all.some(other=>other!==pair&&((other.oldIndex<pair.oldIndex&&other.newIndex>pair.newIndex)||(other.oldIndex>pair.oldIndex&&other.newIndex<pair.newIndex))));
}

// Ranges for one accepted line pair. hideWhitespace drops whitespace tokens
// from the alignment entirely and never emits whitespace ranges.
function lineRanges(oldText:string,newText:string,hideWhitespace:boolean,budget:{cells:number}):{before:IntralineRange[];after:IntralineRange[]}|null{
  const segmenter=wordSegmenter();
  if(!segmenter)return null;
  const oldTokens=diffTokens(oldText,segmenter),newTokens=diffTokens(newText,segmenter);
  if(!oldTokens||!newTokens)return null;
  const align=(tokens:DiffToken[])=>hideWhitespace?tokens.filter(t=>!t.space):tokens;
  const a=align(oldTokens),b=align(newTokens);
  const pairs=lcs(a,b,(x,y)=>x.text===y.text,budget.cells);
  if(pairs===null)return null;
  budget.cells-=(a.length+1)*(b.length+1);
  const matchedOld=new Set(pairs.map(p=>p[0])),matchedNew=new Set(pairs.map(p=>p[1]));
  const unmatchedOld=a.filter((_,i)=>!matchedOld.has(i)),unmatchedNew=b.filter((_,i)=>!matchedNew.has(i));
  let before=unmatchedOld.map(t=>({start:t.start,end:t.end})),after=unmatchedNew.map(t=>({start:t.start,end:t.end}));
  // A single contiguous changed run on each side refines to grapheme
  // precision ('a.b' -> 'a,b' marks only the punctuation).
  const contiguous=(un:DiffToken[])=>un.length>0&&un.every((t,i)=>i===0||t.start===un[i-1]!.end);
  if(unmatchedOld.length&&unmatchedNew.length&&contiguous(unmatchedOld)&&contiguous(unmatchedNew)){
    const gs=graphemeSegmenter();if(!gs)return null;
    const oBase=unmatchedOld[0]!.start,oEnd=unmatchedOld[unmatchedOld.length-1]!.end;
    const nBase=unmatchedNew[0]!.start,nEnd=unmatchedNew[unmatchedNew.length-1]!.end;
    const ga=graphemes(oldText.slice(oBase,oEnd),gs),gb=graphemes(newText.slice(nBase,nEnd),gs);
    if(!ga||!gb)return null;
    const gp=lcs(ga,gb,(x,y)=>x.text===y.text,budget.cells);
    if(gp!==null){
      budget.cells-=(ga.length+1)*(gb.length+1);
      const go=new Set(gp.map(p=>p[0])),gn=new Set(gp.map(p=>p[1]));
      const runs=(items:Grapheme[],hit:Set<number>,offset:number)=>{const out:IntralineRange[]=[];let run:IntralineRange|null=null;items.forEach((g,i)=>{if(hit.has(i)){if(run)out.push(run),run=null;return;}if(!run)run={start:g.start+offset,end:g.end+offset};else run.end=g.end+offset;});if(run)out.push(run);return out;};
      before=runs(ga,go,oBase);after=runs(gb,gn,nBase);
    }
  }
  return{before,after};
}

export interface AnnotateOptions{hideWhitespace:boolean}
const eligible=(before:string,after:string)=>before.length+after.length+2<=MAX_INPUT&&before.split('\n').length+after.split('\n').length<=MAX_LINES;

// Annotate a recorded before/after snapshot pair. Returns null when the
// inputs are over capacity — the caller falls back to its existing view.
export function annotateSnapshot(before:string,after:string,options:AnnotateOptions):SnapshotAnnotation|null{
  if(!eligible(before,after))return null;
  const oldLines=before.split('\n'),newLines=after.split('\n');
  const normalize=(text:string)=>options.hideWhitespace?stripWhitespace(text):text;
  const budget={cells:DP_BUDGET};
  const anchors=lcs(oldLines.map(normalize),newLines.map(normalize),(x,y)=>x===y,budget.cells);
  if(anchors===null)return null;
  budget.cells-=(oldLines.length+1)*(newLines.length+1);
  const anchorOld=new Set(anchors.map(p=>p[0])),anchorNew=new Set(anchors.map(p=>p[1]));
  const beforeMarks:IntralineLine[]=[],afterMarks:IntralineLine[]=[];
  const hiddenOld=new Set(anchorOld),hiddenNew=new Set(anchorNew);
  let runsBefore=0,runsAfter=0;
  // Replacement regions between consecutive anchors.
  let oi=0,ni=0;
  for(let k=0;k<=anchors.length;k++){
    const [ao,an]=k<anchors.length?anchors[k]!:[oldLines.length,newLines.length];
    const regionOld=rangeIndexes(oldLines,oi,ao),regionNew=rangeIndexes(newLines,ni,an);
    const pairs=pairRegion(regionOld.map(index=>({index,text:oldLines[index]!})),regionNew.map(index=>({index,text:newLines[index]!})),wordSegmenter());
    for(const pair of pairs){
      const oi2=pair.oldIndex,ni2=pair.newIndex;
      if(normalize(oldLines[oi2]!)===normalize(newLines[ni2]!)){
        // Whitespace-equal: reserved (cannot attach elsewhere) and hidden
        // under Hide whitespace, never marked.
        hiddenOld.add(oi2);hiddenNew.add(ni2);continue;
      }
      if(runsBefore>=MAX_SPAN_RUNS&&runsAfter>=MAX_SPAN_RUNS)break;
      const marks=lineRanges(oldLines[oi2]!,newLines[ni2]!,options.hideWhitespace,budget);
      if(!marks)continue;
      if(marks.before.length&&runsBefore<MAX_SPAN_RUNS){beforeMarks.push({index:oi2,ranges:marks.before});runsBefore+=marks.before.length;}
      if(marks.after.length&&runsAfter<MAX_SPAN_RUNS){afterMarks.push({index:ni2,ranges:marks.after});runsAfter+=marks.after.length;}
    }
    oi=ao+1;ni=an+1;
  }
  return{before:beforeMarks,after:afterMarks,
    beforeKeep:options.hideWhitespace?oldLines.map((_,i)=>i).filter(i=>!hiddenOld.has(i)):undefined,
    afterKeep:options.hideWhitespace?newLines.map((_,i)=>i).filter(i=>!hiddenNew.has(i)):undefined};
}
const rangeIndexes=(_lines:string[],from:number,to:number)=>{const out:number[]=[];for(let i=from;i<to;i++)out.push(i);return out;};

interface UnifiedHunk{header:number;oldCount:number;newCount:number;rows:{index:number;kind:'context'|'removed'|'added'|'meta';content:string}[];valid:boolean}
function parseUnified(patch:string):UnifiedHunk[]{
  const lines=patch.split('\n'),hunks:UnifiedHunk[]=[];
  let current:UnifiedHunk|null=null;
  const flush=()=>{if(!current)return;
    let o=0,n=0;
    for(const row of current.rows){if(row.kind==='meta')continue;if(row.kind!=='added')o++;if(row.kind!=='removed')n++;}
    current.valid=o===current.oldCount&&n===current.newCount;
    hunks.push(current);current=null;};
  let o=0,n=0;
  for(let i=0;i<lines.length;i++){
    const text=lines[i]!;
    const hunk=/^@@ -\d+(?:,(\d+))? \+\d+(?:,(\d+))? @@/.exec(text);
    if(hunk){flush();o=0;n=0;current={header:i,oldCount:hunk[1]===undefined?1:Number(hunk[1]),newCount:hunk[2]===undefined?1:Number(hunk[2]),rows:[],valid:false};continue;}
    if(!current)continue;
    // Inside a hunk every '-'/'+' row is content: only a new 'diff ' header
    // ends it. A stray empty line ends it only once the hunk's declared counts
    // are satisfied (e.g. the patch's terminating newline); earlier it is a
    // blank context row missing its space. This keeps removed '-- ' SQL
    // comments and added '++ ' lines in the hunk.
    if(text.startsWith('diff ')||(text===''&&o>=current.oldCount&&n>=current.newCount)){flush();continue;}
    if(text===''){current.rows.push({index:i,kind:'context',content:''});o++;n++;continue;}
    if(text.startsWith('\\')){current.rows.push({index:i,kind:'meta',content:text});continue;}
    if(text.startsWith('-')){current.rows.push({index:i,kind:'removed',content:text.slice(1)});o++;continue;}
    if(text.startsWith('+')){current.rows.push({index:i,kind:'added',content:text.slice(1)});n++;continue;}
    current.rows.push({index:i,kind:'context',content:text.startsWith(' ')?text.slice(1):text});o++;n++;
  }
  flush();
  return hunks;
}

// Annotate a unified patch. Only complete, count-valid `@@` hunks produce
// ranges; everything else renders untouched. `maxRows` bounds annotation to
// the first N displayed rows (ChangeSet inline view).
export function annotateUnified(patch:string,options:AnnotateOptions&{maxRows?:number}={hideWhitespace:false}):UnifiedAnnotation|null{
  const total=patch.length;
  const lineCount=patch.split('\n').length;
  if(total>MAX_INPUT||lineCount>MAX_LINES)return null;
  const segmenter=wordSegmenter();
  const budget={cells:DP_BUDGET},out:UnifiedAnnotation=new Map();
  let runsBefore=0,runsAfter=0;
  for(const hunk of parseUnified(patch)){
    if(!hunk.valid)continue;
    // Regions: contiguous +/- runs bounded by context or hunk edges.
    let region:{index:number;kind:'removed'|'added';content:string}[]=[];
    const close=()=>{
      if(!region.length)return;
      const removed=region.filter(r=>r.kind==='removed'),added=region.filter(r=>r.kind==='added');
      region=[];
      const pairs=pairRegion(removed.map((r,i)=>({index:i,text:r.content})),added.map((r,i)=>({index:i,text:r.content})),segmenter);
      for(const pair of pairs){
        const oldRow=removed[pair.oldIndex]!,newRow=added[pair.newIndex]!;
        if(options.hideWhitespace&&stripWhitespace(oldRow.content)===stripWhitespace(newRow.content))continue;
        if(options.maxRows!==undefined&&(oldRow.index>=options.maxRows||newRow.index>=options.maxRows))continue;
        if(runsBefore>=MAX_SPAN_RUNS&&runsAfter>=MAX_SPAN_RUNS)return;
        const marks=lineRanges(oldRow.content,newRow.content,options.hideWhitespace,budget);
        if(!marks)continue;
        if(marks.before.length&&runsBefore<MAX_SPAN_RUNS){out.set(oldRow.index,marks.before);runsBefore+=marks.before.length;}
        if(marks.after.length&&runsAfter<MAX_SPAN_RUNS){out.set(newRow.index,marks.after);runsAfter+=marks.after.length;}
      }
    };
    for(const row of hunk.rows){
      if(row.kind==='meta')continue;
      if(row.kind==='removed'||row.kind==='added'){region.push({index:row.index,kind:row.kind,content:row.content});continue;}
      close();
    }
    close();
  }
  return out;
}
