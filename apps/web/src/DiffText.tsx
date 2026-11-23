import type {ReactNode} from 'react';
import type {IntralineRange} from './intraline-diff';

// Plain-text renderer for intraline diff ranges: escaped text nodes plus
// noninteractive spans. The caller keeps owning line text, numbering and
// controls; a missing or empty range list renders the raw text untouched.
export function DiffText({text,ranges,tone}:{text:string;ranges:IntralineRange[]|undefined;tone:'removed'|'added'}){
  if(!ranges||!ranges.length)return <>{text}</>;
  const out:ReactNode[]=[];let at=0;
  ranges.forEach((range,i)=>{
    if(range.start>at)out.push(text.slice(at,range.start));
    out.push(<span key={i} className={`intraline-mark intraline-mark-${tone}`}>{text.slice(range.start,range.end)}</span>);
    at=range.end;
  });
  if(at<text.length)out.push(text.slice(at));
  return <>{out}</>;
}
