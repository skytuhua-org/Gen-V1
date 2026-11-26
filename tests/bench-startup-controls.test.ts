import {afterEach,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

// Execute the actual script controls without launching a native host or benchmark.
const source=ts.createSourceFile('bench-startup.ts',readFileSync(new URL('../scripts/bench-startup.ts',import.meta.url),'utf8'),ts.ScriptTarget.Latest);
const main=source.statements.find((node):node is ts.FunctionDeclaration=>ts.isFunctionDeclaration(node)&&node.name?.text==='main')!;
const declarations=source.statements.flatMap(node=>ts.isVariableStatement(node)?[...node.declarationList.declarations]:[]);
const timeout=declarations.find(node=>node.name.getText(source)==='waitFor')!.initializer!;
const compile=(text:string)=>ts.transpileModule(text,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const controls=compile(main.body!.statements.slice(0,2).map(node=>node.getText(source)).join('\n'));
const runs=(args:(string|undefined)[])=>new Function('process',controls+'\nreturn runs;')({argv:['node','bench',...args]}) as number;
function deadline<T>(promise:Promise<T>,ms:number){
 const factory=new Function('setTimeout','clearTimeout',compile(`const selected=${timeout.getText(source)};`)+'\nreturn selected;');
 return factory(setTimeout,clearTimeout)(promise,ms,'sample') as Promise<T>;
}
afterEach(()=>{vi.clearAllTimers();vi.useRealTimers();});

it('keeps the documented default and positive integer run count',()=>{
 expect(runs([])).toBe(5);expect(runs(['--runs','3'])).toBe(3);
});
it.each(['0','-1','1.5','Infinity','9007199254740992','invalid',undefined])('rejects invalid run count %s before any benchmark work',value=>{
 expect(()=>runs(['--runs',value])).toThrow(/positive integer/i);
});
it('clears the deadline after successful settlement',async()=>{
 vi.useFakeTimers();expect(await deadline(Promise.resolve('done'),1000)).toBe('done');expect(vi.getTimerCount()).toBe(0);
});
it('clears the deadline after rejected settlement',async()=>{
 vi.useFakeTimers();await expect(deadline(Promise.reject(Error('synthetic')),1000)).rejects.toThrow('synthetic');expect(vi.getTimerCount()).toBe(0);
});
it('still rejects work that reaches its deadline',async()=>{
 vi.useFakeTimers();const pending=deadline(new Promise(()=>{}),10),rejected=expect(pending).rejects.toThrow('sample timed out after 10ms');
 await vi.advanceTimersByTimeAsync(10);await rejected;expect(vi.getTimerCount()).toBe(0);
});
