import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach,expect,it} from 'vitest';
import {runCheck} from '../scripts/verify-readiness.ts';

const dirs:string[]=[];
afterEach(()=>{for(const dir of dirs.splice(0))rmSync(dir,{recursive:true,force:true});});

it('keeps an interleaved stderr line from merging with a partial stdout line',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'gen-readiness-streams-'));dirs.push(dir);
 const logPath=join(dir,'check.log');
 // Synthetic child: a valid partial stdout line, a complete stderr line, then the stdout remainder.
 const result=await runCheck({id:'stream-lines',command:process.execPath,args:['-e',
   `process.stdout.write('stdout-alpha');process.stderr.write('stderr-beta\\n');setTimeout(()=>process.stdout.write('-tail\\n'),40)`],
   cwd:dir,timeoutMs:10000,required:true,logPath});
 expect(result.status).toBe('PASS');
 const lines=readFileSync(logPath,'utf8').split('\n');
 expect(lines).toContain('stdout-alpha-tail');
 expect(lines).toContain('stderr-beta');
});
