export type ArtifactSourceContent={kind:'link'|'text';text:string}|null;

export function artifactSourceContent(source:string|undefined|null):ArtifactSourceContent{
  const text=source?.trim()??'';
  if(!text)return null;
  return /^https?:\/\//.test(text)?{kind:'link',text}:{kind:'text',text};
}
