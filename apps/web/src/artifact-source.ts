import type {MouseEvent} from 'react';

export type ArtifactSourceContent={kind:'link'|'text';text:string}|null;

export function artifactSourceContent(source:string|undefined|null):ArtifactSourceContent{
  const text=source?.trim()??'';
  if(!text)return null;
  return /^https?:\/\/\S+$/i.test(text)?{kind:'link',text}:{kind:'text',text};
}

export function openArtifactSourceLink(event:MouseEvent<HTMLAnchorElement>,url:string){
  const desktop=window.harnessDesktop;
  if(!desktop)return;
  event.preventDefault();
  void desktop.browser({type:'open'}).then(()=>desktop.browser({type:'navigate',url})).catch(()=>{});
}
