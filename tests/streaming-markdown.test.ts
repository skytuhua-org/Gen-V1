import {beforeEach,expect,it,vi} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const engine=vi.hoisted(()=>({calls:[] as {text:string;options:Record<string,unknown>}[],throwError:false,result:null as string|null}));
vi.mock('remend',async()=>{
  const actual=await vi.importActual<typeof import('remend')>('remend');
  return {...actual,default:(text:string,options:Record<string,unknown>)=>{
    engine.calls.push({text,options});
    if(engine.throwError)throw new Error('engine failure fixture');
    if(engine.result!==null)return engine.result;
    return actual.default(text,options);
  }};
});

import {projectStreamingParagraph} from '../apps/web/src/streaming-markdown';
import {Markdown} from '../apps/web/src/Markdown';

beforeEach(()=>{engine.calls=[];engine.throwError=false;engine.result=null;});
const project=(text:string,provisional=true)=>projectStreamingParagraph(text,provisional);
const exact=(text:string,provisional=true)=>expect(project(text,provisional)).toEqual({text,changed:false});
const html=(text:string)=>renderToStaticMarkup(createElement(Markdown,{text}));

it('repairs provisional bold and renders strong semantics',()=>{
  const result=project('Start **bold');
  expect(result).toEqual({text:'Start **bold**',changed:true});
  expect(html(result.text)).toContain('<strong>bold</strong>');
});

it('keeps every prefix of provisional bold exact until a closer is useful',()=>{
  const source='Start **bold';
  for(let end=0;end<'Start **'.length;end++)exact(source.slice(0,end));
  exact('Start **');
  for(let end='Start **b'.length;end<=source.length;end++)expect(project(source.slice(0,end)).text).toBe(source.slice(0,end)+'**');
});

it('repairs a partial bold closer with one asterisk',()=>{
  expect(project('Start **bold*')).toEqual({text:'Start **bold**',changed:true});
});

it('repairs provisional single-backtick code and renders code semantics',()=>{
  const result=project('Use `code');
  expect(result).toEqual({text:'Use `code`',changed:true});
  expect(html(result.text)).toContain('<code>code</code>');
});

it('keeps every prefix of provisional code exact until a closer is useful',()=>{
  const source='Use `code';
  for(let end=0;end<'Use `'.length;end++)exact(source.slice(0,end));
  exact('Use `');
  for(let end='Use `c'.length;end<=source.length;end++)expect(project(source.slice(0,end)).text).toBe(source.slice(0,end)+'`');
});

it('keeps already completed and malformed static input exact without an engine call',()=>{
  exact('Completed **bold** and `code`',false);
  exact('Malformed **static',false);
  expect(engine.calls).toEqual([]);
});

it('restores one trailing space exactly',()=>{
  expect(project('Start **bold ')).toEqual({text:'Start **bold** ',changed:true});
});

it('restores double-space newline and CRLF suffixes exactly',()=>{
  expect(project('Start **bold  ').text).toBe('Start **bold**  ');
  expect(project('Start **bold\n').text).toBe('Start **bold**\n');
  expect(project('Start **bold\r\n').text).toBe('Start **bold**\r\n');
});

it('rejects underscore and snake_case forms exactly',()=>{
  exact('snake_case and __under__ remain');
  exact('__unfinished');
});

it('rejects italic triple-star and nested markup mutations exactly',()=>{
  exact('*italic');
  exact('***triple');
  exact('Nested **bold *italic');
});

it('disables inline-code repair around multiple backticks while retaining guarded bold',()=>{
  exact('Use ``code');
  expect(project('Use ``code and **bold').text).toBe('Use ``code and **bold**');
  expect(engine.calls.at(-1)?.options.inlineCode).toBe(false);
});

it('rejects escaped delimiters and a trailing backslash exactly',()=>{
  exact('Escaped \\**bold');
  exact('Trailing **bold\\');
});

it('rejects incomplete links and images exactly',()=>{
  exact('A [link](https://example.com');
  exact('An ![image](https://example.com/image.png');
});

it('rejects HTML comparison and setext-like text exactly',()=>{
  exact('HTML <custom');
  exact('Compare a > b');
  exact('Setext-ish\n---');
});

it('rejects currency and math forms exactly',()=>{
  exact('Costs $5 and $10');
  exact('Math $x+y');
});

it('preserves emoji combining and ZWJ text exactly',()=>{
  const result=project('Emoji 😀 ékin ‍ **bold');
  expect(result).toEqual({text:'Emoji 😀 ékin ‍ **bold**',changed:true});
  exact('Emoji 😀 ékin ‍ **bold**',false);
});

it('allows exactly 32768 units and rejects cap+1 before calling the engine',()=>{
  const exactCap='x'.repeat(32762)+' **abc';
  expect(exactCap.length).toBe(32768);
  expect(project(exactCap).changed).toBe(true);
  const over='x'.repeat(32763)+' **abc';
  expect(over.length).toBe(32769);
  exact(over);
  expect(engine.calls).toHaveLength(1);
});

it('passes only the fixed public options and never placeholder link handlers',()=>{
  project('Start **bold');
  expect(engine.calls).toHaveLength(1);
  expect(engine.calls[0]?.options).toEqual({bold:true,inlineCode:true,italic:false,boldItalic:false,strikethrough:false,links:false,images:false,katex:false,inlineKatex:false,htmlTags:false,comparisonOperators:false,setextHeadings:false,singleTilde:false});
});

it('permits a certified trailing closer after earlier complete inline markup',()=>{
  expect(project('Done **old** and **new').text).toBe('Done **old** and **new**');
  expect(project('Done `old` and `new').text).toBe('Done `old` and `new`');
  expect(project('Done **old** and `new').text).toBe('Done **old** and `new`');
  expect(project('Done `old` and **new').text).toBe('Done `old` and **new**');
});

it('rejects delimiter-heavy mutation and unsupported engine output exactly',()=>{
  exact('**a*** **b');
  exact('**a** ***b');
  engine.result='mutated output';
  exact('Start **bold');
});

it('returns exact input when the engine throws',()=>{
  engine.throwError=true;
  exact('Start **bold');
});

it('starts each call from canonical input rather than prior healed output',()=>{
  exact('Start **bold**',false);
  expect(project('Start **bold')).toEqual({text:'Start **bold**',changed:true});
});
