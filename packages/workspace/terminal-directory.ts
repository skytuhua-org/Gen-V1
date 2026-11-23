import {createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
import {HarnessError} from '../contracts/index.ts';

/** Forward-slash relative directory selection for an integrated terminal
 * launch. Empty means the bound checkout root. Client-supplied paths are
 * decoded once as JSON strings — never URL-decoded again. */
const reserved=/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
const control=/[\u0000-\u001f\u007f\u0080-\u009f\u202a-\u202e\u2066-\u2069\u200e\u200f]/;
const segment=z.string().min(1).max(255).refine(value=>{
 if(value==='.'||value==='..')return false;
 if(control.test(value))return false;
 for(let i=0;i<value.length;i++){const code=value.charCodeAt(i);if(code>=0xd800&&code<=0xdbff){if(++i>=value.length)return false;const next=value.charCodeAt(i);if(next<0xdc00||next>0xdfff)return false;}else if(code>=0xdc00&&code<=0xdfff)return false;}
 if(/[\\/<>:"|?*]/.test(value))return false;
 const trimmed=value.replace(/^[. ]+|[. ]+$/g,'');if(!trimmed||trimmed!==value||reserved.test(trimmed))return false;
 return true;
});
export const terminalDirectoryPathSchema=z.string().max(1024).refine(path=>{
 if(Buffer.byteLength(path,'utf8')>1024)return false;
 if(!path)return true;
 if(containsGuardMarker(path))return false;
 return path.split('/').every(part=>segment.safeParse(part).success);
},'Choose an ordinary folder inside the project.');
export const containsGuardMarker=(path:string)=>path.split('/').some(part=>{const lower=part.toLowerCase();return lower==='.git'||lower==='.harness-directory-guard';});
export const terminalDirectorySelectionSchema=z.strictObject({path:terminalDirectoryPathSchema,proof:z.string().regex(/^[A-Za-z0-9._-]{1,128}$/)});
export type TerminalDirectorySelection=z.infer<typeof terminalDirectorySelectionSchema>;

export interface DirectoryProofSubject{projectId:string;threadId:string|undefined;bindingStamp:string;path:string;dev:string;ino:string}
const VERSION='v1',EXPIRY_MS=10*60*1000,MAX_PROOF=128;
/** Process-local signer for directory-listing proofs. A proof only means "this
 * eligible directory was listed for this owner and binding"; it is never an
 * authority token and cannot authorize anything by itself. */
class TerminalDirectoryProofs{
 private readonly key=randomBytes(32);
 private payload(subject:DirectoryProofSubject,expires:number){return JSON.stringify([VERSION,subject.projectId,subject.threadId??null,subject.bindingStamp,subject.path,subject.dev,subject.ino,expires]);}
 mint(subject:DirectoryProofSubject,now=Date.now()):string{
  const expires=now+EXPIRY_MS,mac=createHmac('sha256',this.key).update(this.payload(subject,expires)).digest('base64url');
  const proof=`${VERSION}.${expires.toString(36)}.${mac}`;
  if(proof.length>MAX_PROOF)throw new HarnessError('INVALID_INPUT','Directory proof exceeds the wire limit.');
  return proof;
 }
 verify(proof:string,subject:DirectoryProofSubject,now=Date.now()):boolean{
  const match=/^(v1)\.([0-9a-z]+)\.([A-Za-z0-9_-]{43})$/.exec(proof);if(!match)return false;
  const expires=Number.parseInt(match[2]!,36);if(!Number.isSafeInteger(expires)||now>expires)return false;
  const expected=createHmac('sha256',this.key).update(this.payload(subject,expires)).digest();
  const supplied=Buffer.from(match[3]!,'base64url');
  return expected.length===supplied.length&&timingSafeEqual(expected,supplied);
 }
}
let proofs:TerminalDirectoryProofs|undefined;
/** One process-local key shared by the listing minter and the host verifier.
 * Host restart invalidates every outstanding proof, as required. */
export function terminalDirectoryProofs(){return(proofs??=new TerminalDirectoryProofs());}
