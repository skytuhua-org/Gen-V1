import remend, {type RemendOptions} from 'remend';

export type StreamingMarkdownProjection={text:string;changed:boolean};

const MAX_PARAGRAPH_UNITS=32768;
const baseOptions:Required<Omit<RemendOptions,'handlers'|'linkMode'>>={
  bold:true,
  inlineCode:true,
  italic:false,
  boldItalic:false,
  strikethrough:false,
  links:false,
  images:false,
  katex:false,
  inlineKatex:false,
  htmlTags:false,
  comparisonOperators:false,
  setextHeadings:false,
  singleTilde:false,
};

const unchanged=(text:string):StreamingMarkdownProjection=>({text,changed:false});
const escaped=(text:string,index:number)=>{let slashes=0;for(let at=index-1;at>=0&&text[at]==='\\';at--)slashes++;return slashes%2===1;};

function completeDelimitedPrefix(prefix:string,delimiter:'`'|'**'):boolean{
  let index=0;
  while(index<prefix.length){
    const at=prefix.indexOf(delimiter,index);
    const stray=delimiter==='`'?prefix.indexOf('`',index):prefix.indexOf('*',index);
    if(stray<0)return true;
    if(stray!==at||escaped(prefix,at))return false;
    const close=prefix.indexOf(delimiter,at+delimiter.length);
    if(close<0)return false;
    const content=prefix.slice(at+delimiter.length,close);
    if(!content||content.includes(delimiter[0]!)||/[\r\n]/.test(content))return false;
    index=close+delimiter.length;
  }
  return true;
}

function certifiedClose(body:string,repaired:string):boolean{
  if(!repaired.startsWith(body))return false;
  const inserted=repaired.slice(body.length);
  if(inserted==='`'){
    const open=repaired.lastIndexOf('`',repaired.length-2);
    if(open<0||escaped(repaired,open))return false;
    const content=repaired.slice(open+1,-1);
    return content.length>0&&!content.includes('`')&&!/[\r\n]/.test(content)&&completeDelimitedPrefix(repaired.slice(0,open),'`');
  }
  if(inserted!=='*'&&inserted!=='**')return false;
  if(!repaired.endsWith('**'))return false;
  const open=repaired.lastIndexOf('**',repaired.length-3);
  if(open<0||escaped(repaired,open))return false;
  const content=repaired.slice(open+2,-2);
  return content.length>0&&!content.includes('*')&&!/[\r\n]/.test(content)&&completeDelimitedPrefix(repaired.slice(0,open),'**');
}

/** Project one already-canonical paragraph without retaining or mutating prior output. */
export function projectStreamingParagraph(canonicalParagraph:string,provisional:boolean):StreamingMarkdownProjection{
  if(!provisional||canonicalParagraph.length>MAX_PARAGRAPH_UNITS)return unchanged(canonicalParagraph);
  const suffix=/[ \t\r\n]*$/.exec(canonicalParagraph)?.[0]??'';
  const body=canonicalParagraph.slice(0,canonicalParagraph.length-suffix.length);
  if(!body.trim()||escaped(body,body.length))return unchanged(canonicalParagraph);
  try{
    const options:RemendOptions={...baseOptions,inlineCode:!/`{2,}/.test(body)};
    const repairedBody=remend(body,options);
    if(typeof repairedBody!=='string'||repairedBody===body)return unchanged(canonicalParagraph);
    if(!certifiedClose(body,repairedBody))return unchanged(canonicalParagraph);
    return {text:repairedBody+suffix,changed:true};
  }catch{
    return unchanged(canonicalParagraph);
  }
}
