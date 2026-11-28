import {useId} from 'react';

export function GenMark({size=16}:{size?:number}){
 const maskId=`gen-mark-${useId().replace(/[^a-zA-Z0-9_-]/g,'')}`;
 return <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 120 120"><mask id={maskId}><circle cx="60" cy="60" r="47" fill="#fff"/><circle cx="60" cy="60" r="25" fill="#000"/><path d="M60 60L130 2V60Z" fill="#000"/><rect x="61" y="59" width="46" height="20" fill="#fff"/></mask><rect width="120" height="120" fill="#7C4DFF" mask={`url(#${maskId})`}/></svg>;
}
