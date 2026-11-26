export type MapSourceContent={kind:'link'|'text';text:string}|null;

export function mapSourceContent(source:string|undefined|null):MapSourceContent{
  const text=source?.trim()??'';
  if(!text)return null;
  return /^https?:\/\//.test(text)?{kind:'link',text}:{kind:'text',text};
}
