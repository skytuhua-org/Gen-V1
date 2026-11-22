const ANSI_PATTERN=/\x1b\[[0-9;:]*[A-Za-z]|\x1b\(B/g;
const ADDRESS_PATTERN=/https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|\[::1\]|\[::\]|0\.0\.0\.0)(?::(\d{1,5}))?([^\s"'<>()[\]{}]*)/gi;

export interface DetectedAddress{url:string;port:number}

export function stripAnsi(text:string):string{return text.replace(ANSI_PATTERN,'');}

/** Loopback http(s) addresses a dev server might print; deduped by normalized url, in order of appearance. */
export function detectAddresses(text:string):DetectedAddress[]{
 const found=new Map<string,DetectedAddress>();
 for(const match of stripAnsi(text).matchAll(ADDRESS_PATTERN)){
  const port=Number(match[1]);
  if(!Number.isInteger(port)||port<1024||port>65535)continue;
  let parsed:URL;
  try{parsed=new URL(match[0]);}catch{continue;}
  if(parsed.hostname==='0.0.0.0'||parsed.hostname==='[::]')parsed.hostname='localhost';
  const url=parsed.origin+parsed.pathname;
  if(!found.has(url))found.set(url,{url,port});
 }
 return [...found.values()];
}

/** Carries the unterminated tail of terminal output between chunks so an address split across writes still scans once. */
export function createLineCarry(limit=512):{feed(chunk:string):string}{
 let carry='';
 return{
  feed(chunk:string){
   const text=carry+chunk;
   const cut=text.lastIndexOf('\n');
   carry=cut<0?text:text.slice(cut+1);
   if(carry.length>limit)carry=carry.slice(-limit);
   return cut<0?text:text.slice(0,cut+1);
  },
 };
}
