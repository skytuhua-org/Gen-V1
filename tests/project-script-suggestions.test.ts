import {expect,it} from 'vitest';
import {detectRunner,suggestScripts} from '../packages/workspace/script-suggestions.ts';

const none={pnpm:false,yarn:false,npm:false,count:0};
it('detects the runner from packageManager, then lockfiles in order, then npm',()=>{
 expect(detectRunner({packageManager:'pnpm@10.30.3'},none)).toEqual({runner:'pnpm',runnerSource:'packageManager',multipleLockfiles:false});
 expect(detectRunner({packageManager:'npm@10'},none).runner).toBe('npm');
 expect(detectRunner({packageManager:'yarn@4.1.0'},none).runner).toBe('yarn');
 expect(detectRunner({},{pnpm:false,yarn:true,npm:false,count:1})).toEqual({runner:'yarn',runnerSource:'lockfile',multipleLockfiles:false});
 expect(detectRunner({},{pnpm:true,yarn:false,npm:true,count:2})).toEqual({runner:'pnpm',runnerSource:'lockfile',multipleLockfiles:true});
 expect(detectRunner({},{pnpm:false,yarn:true,npm:true,count:2}).runner).toBe('yarn');
 expect(detectRunner({},none)).toEqual({runner:'npm',runnerSource:'default',multipleLockfiles:false});
 // A manager outside the supported set falls through to lockfiles.
 expect(detectRunner({packageManager:'bun@1'},{pnpm:false,yarn:true,npm:false,count:1})).toEqual({runner:'yarn',runnerSource:'lockfile',multipleLockfiles:false});
 expect(detectRunner({packageManager:'bun@1'},none).runnerSource).toBe('default');
 expect(detectRunner('not-an-object',none).runner).toBe('npm');
});
it('suggests <runner> run <name> in package.json order',()=>{
 const pkg={scripts:{dev:'vite',build:'vite build','test:unit':'vitest','build:widgets':'x','@scope/x':'y'}};
 expect(suggestScripts(pkg,'pnpm',[])).toEqual({suggestions:[
  {name:'dev',body:'vite',command:'pnpm run dev'},
  {name:'build',body:'vite build',command:'pnpm run build'},
  {name:'test:unit',body:'vitest',command:'pnpm run test:unit'},
  {name:'build:widgets',body:'x',command:'pnpm run build:widgets'},
  {name:'@scope/x',body:'y',command:'pnpm run @scope/x'},
 ],skipped:0});
 expect(suggestScripts(pkg,'npm',[]).suggestions[0]!.command).toBe('npm run dev');
 expect(suggestScripts(pkg,'yarn',[]).suggestions[0]!.command).toBe('yarn run dev');
});
it('skips non-string values, lifecycle hooks, pre/post hooks and unsafe names',()=>{
 const pkg={scripts:{dev:'vite',postinstall:'x',prepare:'x',pretest:'x',prestart:'x',compile:42,'bad name':'x','quo"te':'x','a&b':'x','a|b':'x','-lead':'x',['n'.repeat(101)]:'x','':'x',empty:'   '}};
 const{suggestions}=suggestScripts(pkg,'npm',[]);
 // Kept: dev, pretest (no 'test' script to hook) and prestart (no 'start').
 expect(suggestions.map(s=>s.name)).toEqual(['dev','pretest','prestart']);
});
it('skips pre/post hooks only when the base script exists',()=>{
 const pkg={scripts:{test:'vitest',pretest:'lint',posttest:'cleanup',prestart:'x'}};
 const{suggestions,skipped}=suggestScripts(pkg,'npm',[]);
 expect(suggestions.map(s=>s.name)).toEqual(['test','prestart']);
 expect(skipped).toBe(2);
});
it('hides commands already saved and caps the list at 50',()=>{
 const{suggestions}=suggestScripts({scripts:{dev:'vite'}},'pnpm',['  pnpm   run   dev ']);
 expect(suggestions).toHaveLength(0);
 const scripts:Record<string,string>={};for(let i=0;i<60;i++)scripts['s'+i]='x';
 const big=suggestScripts({scripts},'npm',[]);
 expect(big.suggestions).toHaveLength(50);expect(big.skipped).toBe(10);
});
it('truncates long bodies and treats missing or array scripts as none',()=>{
 const long='x'.repeat(600);
 const{suggestions}=suggestScripts({scripts:{long}},'npm',[]);
 expect(suggestions[0]!.body).toHaveLength(500);
 expect(suggestScripts({},'npm',[])).toEqual({suggestions:[],skipped:0});
 expect(suggestScripts({scripts:['dev']},'npm',[])).toEqual({suggestions:[],skipped:0});
 expect(suggestScripts('str','npm',[])).toEqual({suggestions:[],skipped:0});
});
