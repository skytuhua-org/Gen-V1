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

function closeLines(source:string,lineStarts:readonly number[],firstLine:number,close:string):Map<number,number>{
  const positions=new Map<number,number>();
  for(let line=firstLine;line<lineStarts.length;line++){
    const current=physicalLine(source,lineStarts,line);
    if(!current)continue;
    const indent=indentation(current.text);
    if(indent<0)continue;
    const offset=current.start+indent;
    if(!source.startsWith(close,offset))continue;
    let spaces=true;
    for(let index=offset+close.length;index<current.end;index++)if(source[index]!==' '&&source[index]!=='\t')spaces=false;
    if(spaces)positions.set(offset,line);
  }
  return positions;
}

function scanMultilineDisplay(source:string,start:number,open:string,close:string,openerLine:number,lineStarts:readonly number[],escaped:Uint8Array):{span:MathSpan;nextLine:number}|null{
  const positions=closeLines(source,lineStarts,openerLine+1,close),bodyStart=start+open.length;
  let depth=0,comment=false;
  for(let index=bodyStart;index<source.length;index++){
    const character=source[index]!;
    if(character==='\r'||character==='\n'){comment=false;continue;}
    if(comment)continue;
    const closeLine=positions.get(index);
    if(closeLine!==undefined&&depth===0&&!escaped[index]){
      const end=index+close.length,tex=source.slice(bodyStart,index);
      if(!tex.trim())return null;
      return {span:{start,end,raw:source.slice(start,end),tex,mode:'display'},nextLine:closeLine+1};
    }
    if(character==='%'&&!escaped[index]){comment=true;continue;}
    if(character==='{'&&!escaped[index]){depth++;continue;}
    if(character==='}'&&!escaped[index]){
      if(depth===0)return null;
      depth--;
    }
  }
  return null;
}

export function findDisplayMath(source:string,lineStarts:readonly number[],line:number):{span:MathSpan;nextLine:number}|null{
  const current=physicalLine(source,lineStarts,line);
  if(!current)return null;
  const indent=indentation(current.text);
  if(indent<0)return null;
  const start=current.start+indent;
  const open=source.startsWith('$$',start)?'$$':source.startsWith('\\[',start)?'\\[':'';
  if(!open||open==='$$'&&source[start+2]==='$')return null;
  const close=open==='$$'?'$$':'\\]',escaped=escaping(source);
  const openerLength=current.start+indent+open.length;
  if(openerLength===current.end||/^[ \t]*$/.test(source.slice(openerLength,current.end)))
    return scanMultilineDisplay(source,start,open,close,line,lineStarts,escaped);
  const result=scanCandidate(source,start,open,close,'display',false,escaped);
  if(!result.span||result.span.end>current.end||!wholeLineEnd(source,result.span.end,current.end))return null;
  return {span:result.span,nextLine:line+1};
}

export function admitMath(span:MathSpan,budget:MathBudget):boolean{
  if(!span.tex.trim()||span.tex.length>MAX_EXPRESSION_UNITS||budget.expressions<=0||span.tex.length>budget.sourceUnits)return false;
  budget.expressions--;
  budget.sourceUnits-=span.tex.length;
  return true;
}
