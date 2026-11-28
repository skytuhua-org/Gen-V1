export type MathSpan = Readonly<{start:number;end:number;raw:string;tex:string;mode:'inline'|'display'}>;
export type MathBudget = {expressions:number;sourceUnits:number};

const MAX_SCAN_UNITS=100000,MAX_EXPRESSION_UNITS=4096;
const linkToken=/\[[^\]]+\]\((?:https?:\/\/[^\s)]+|#[^\s)]+)\)/y;

export function mathScanAllowed(originalSource:string,enabled:boolean):boolean{
  return enabled&&originalSource.length<=MAX_SCAN_UNITS;
}

function escaping(text:string):Uint8Array{
  const escaped=new Uint8Array(text.length);let slashes=0;
  for(let index=0;index<text.length;index++){
    escaped[index]=slashes%2;
    if(text[index]==='\\')slashes++;else slashes=0;
  }
  return escaped;
}

type ScanResult={end:number;span?:MathSpan};
function scanCandidate(text:string,start:number,open:string,close:string,mode:'inline'|'display',allowNewlines:boolean,escaped:Uint8Array):ScanResult{
  const bodyStart=start+open.length,singleDollar=open==='$',doubleDollar=open==='$$';
  let depth=0,comment=false;
  for(let index=bodyStart;index<text.length;index++){
    const character=text[index]!;
    if(character==='\r'||character==='\n'){
      if(!allowNewlines)return {end:index+1};
      comment=false;
      continue;
    }
    if(comment)continue;
    const closes=text.startsWith(close,index)&&!escaped[index]&&(!singleDollar||text[index-1]!=='$'&&text[index+1]!=='$'&&!/\d/.test(text[index+1]??''))&&(!doubleDollar||text[index-1]!=='$'&&text[index+2]!=='$');
    if(depth===0&&closes){
      const end=index+close.length,tex=text.slice(bodyStart,index);
      if(!tex.trim())return {end};
      if(mode==='inline'&&open[0]==='$'&&/^\s|\s$/.test(tex))return {end};
      return {end,span:{start,end,raw:text.slice(start,end),tex,mode}};
    }
    if(character==='%'&&!escaped[index]){comment=true;continue;}
    if(character==='{'&&!escaped[index]){depth++;continue;}
    if(character==='}'&&!escaped[index]){
      if(depth===0)return {end:index+1};
      depth--;
    }
  }
  return {end:text.length};
}

function lineEnd(text:string,start:number):number{
  let end=start;
  while(end<text.length&&text[end]!=='\n')end++;
  return end<text.length?end+1:end;
}

function fenceEnd(text:string,start:number):number{
  if(start!==0&&text[start-1]!=='\n')return start;
  const opening=/^ {0,3}(`{3,}|~{3,})/.exec(text.slice(start));
  if(!opening)return start;
  const character=opening[1]![0]!,minimum=opening[1]!.length;
  let position=lineEnd(text,start);
  while(position<text.length){
    const end=lineEnd(text,position),line=text.slice(position,end).replace(/\r?\n$/,'');
    if(new RegExp(`^ {0,3}${character}{${minimum},}[ \\t]*$`).test(line))return end;
    position=end;
  }
  return text.length;
}

function inlineCodeEnd(text:string,start:number):number{
  const end=text.indexOf('`',start+1);
  return end>start+1?end+1:start;
}

export function findInlineMath(text:string):readonly MathSpan[]{
  const spans:MathSpan[]=[],escaped=escaping(text);
  let index=0;
  while(index<text.length){
    const fence=fenceEnd(text,index);
    if(fence>index){index=fence;continue;}
    if(text[index]==='`'){
      const end=inlineCodeEnd(text,index);
      if(end>index){index=end;continue;}
    }
    if(text[index]==='['){
      linkToken.lastIndex=index;
      const link=linkToken.exec(text);
      if(link){index+=link[0].length;continue;}
    }
    let open='';
    if(text.startsWith('\\(',index)&&!escaped[index])open='\\(';
    else if(text[index]==='$'&&!escaped[index]){
      let dollars=0;
      while(text[index+dollars]==='$')dollars++;
      if(dollars<=2)open='$'.repeat(dollars);
      else{index+=dollars;continue;}
    }
    if(!open){index++;continue;}
    const close=open==='\\('?'\\)':open;
    const result=scanCandidate(text,index,open,close,'inline',false,escaped);
    if(result.span)spans.push(result.span);
    index=Math.max(result.end,index+1);
  }
  return spans;
}

function physicalLine(source:string,lineStarts:readonly number[],line:number){
  const start=lineStarts[line];
  if(start===undefined)return null;
  let end=lineStarts[line+1]??source.length;
  if(end>start&&source[end-1]==='\n')end--;
  if(end>start&&source[end-1]==='\r')end--;
  return {start,end,text:source.slice(start,end)};
}

function indentation(text:string):number{
  let count=0;
  while(count<text.length&&text[count]===' ')count++;
  return count<=3?count:-1;
}

function wholeLineEnd(source:string,end:number,lineEndIndex:number):boolean{
  for(let index=end;index<lineEndIndex;index++)if(source[index]!==' '&&source[index]!=='\t')return false;
  return true;
}

type PositionsByDepth = Map<number, number[]>;
type DisplayClose = '$$' | '\\]';

function recordPosition(positions: PositionsByDepth, depth: number, index: number) {
  const existing = positions.get(depth);
  if (existing) existing.push(index);
  else positions.set(depth, [index]);
}

function firstAfter(positions: readonly number[] | undefined, start: number): number {
  if (!positions) return Number.POSITIVE_INFINITY;
  let first = 0, last = positions.length;
  while (first < last) {
    const middle = (first + last) >>> 1;
    if (positions[middle]! <= start) first = middle + 1;
    else last = middle;
  }
  return positions[first] ?? Number.POSITIVE_INFINITY;
}

function indexDisplayCloses(source: string, lineStarts: readonly number[], escaped: Uint8Array) {
  const depthAt = new Int32Array(source.length);
  const underflows: PositionsByDepth = new Map();
  let depth = 0, comment = false;
  for (let index = 0; index < source.length; index++) {
    depthAt[index] = depth;
    const character = source[index]!;
    if (character === '\r' || character === '\n') {
      comment = false;
      continue;
    }
    if (comment || escaped[index]) continue;
    if (character === '%') comment = true;
    if (character === '{') depth++;
    if (character === '}') {
      recordPosition(underflows, depth, index);
      depth--;
    }
  }

  const closes: Record<DisplayClose, PositionsByDepth> = {'$$':new Map(), '\\]':new Map()};
  const lineOfClose = new Map<number, number>();
  for (let line = 0; line < lineStarts.length; line++) {
    const current = physicalLine(source, lineStarts, line);
    if (!current) continue;
    const indent = indentation(current.text);
    if (indent < 0) continue;
    const index = current.start + indent;
    const close = source.slice(index, index + 2);
    if ((close !== '$$' && close !== '\\]') || escaped[index] || !wholeLineEnd(source, index + 2, current.end)) continue;
    recordPosition(closes[close], depthAt[index]!, index);
    lineOfClose.set(index, line);
  }

  return (start: number, close: DisplayClose) => {
    // Every opener occupies its own line. Comments reset there and relative
    // brace depth starts at zero, so equal absolute depth yields a matching
    // closer only if the body never drops below the opener's depth first.
    const baseline = depthAt[start]!;
    const end = firstAfter(closes[close].get(baseline), start);
    if (end >= firstAfter(underflows.get(baseline), start)) return null;
    const tex = source.slice(start + close.length, end);
    if (!tex.trim()) return null;
    return {
      span:{start, end:end + close.length, raw:source.slice(start, end + close.length), tex, mode:'display'} as const,
      nextLine:lineOfClose.get(end)! + 1,
    };
  };
}

export function createDisplayMathScanner(source: string, lineStarts: readonly number[]) {
  let escaped: Uint8Array | undefined;
  let findStandalone: ReturnType<typeof indexDisplayCloses> | undefined;
  return (line: number): {span: MathSpan; nextLine: number} | null => {
    const current = physicalLine(source,lineStarts,line);
    if (!current) return null;
    const indent = indentation(current.text);
    if (indent < 0) return null;
    const start = current.start + indent;
    const open = source.startsWith('$$',start) ? '$$' : source.startsWith('\\[',start) ? '\\[' : '';
    if (!open || open === '$$' && source[start + 2] === '$') return null;
    const close = open === '$$' ? '$$' : '\\]';
    escaped ??= escaping(source);
    if (wholeLineEnd(source, start + open.length, current.end)) {
      findStandalone ??= indexDisplayCloses(source, lineStarts, escaped);
      return findStandalone(start, close);
    }
    const result = scanCandidate(source,start,open,close,'display',false,escaped);
    if (!result.span || result.span.end > current.end || !wholeLineEnd(source,result.span.end,current.end)) return null;
    return {span:result.span, nextLine:line + 1};
  };
}

export function findDisplayMath(source: string, lineStarts: readonly number[], line: number) {
  return createDisplayMathScanner(source, lineStarts)(line);
}

export function admitMath(span:MathSpan,budget:MathBudget):boolean{
  if(!span.tex.trim()||span.tex.length>MAX_EXPRESSION_UNITS||budget.expressions<=0||span.tex.length>budget.sourceUnits)return false;
  budget.expressions--;
  budget.sourceUnits-=span.tex.length;
  return true;
}
