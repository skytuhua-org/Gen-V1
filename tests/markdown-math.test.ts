import {describe, expect, it} from 'vitest';
import {admitMath, findDisplayMath, findInlineMath, mathScanAllowed, type MathBudget, type MathSpan} from '../apps/web/src/markdown-math';

const lineStarts=(source:string)=>{
  const starts=[0];
  for(let index=0;index<source.length;index++)if(source[index]==='\n')starts.push(index+1);
  return starts;
};
const display=(source:string,line:number)=>findDisplayMath(source,lineStarts(source),line);
const span=(start:number,end:number,raw:string,tex:string,mode:'inline'|'display'):MathSpan=>({start,end,raw,tex,mode});

describe('markdown math recognition',()=>{
  it('recognizes supported inline forms with exact indices and source slices',()=>{
    for(const delimiter of ['\\(','$','$$']){
      const close=delimiter==='\\('?'\\)':delimiter;
      const text=`Before ${delimiter}a/b${close} after`;
      const found=findInlineMath(text);
      expect(found).toHaveLength(1);
      expect(found[0]).toMatchObject({start:text.indexOf(delimiter),tex:'a/b',mode:'inline'});
      expect(found[0]!.end).toBe(text.indexOf(close,text.indexOf(delimiter)+delimiter.length)+close.length);
      expect(found[0]!.raw).toBe(text.slice(found[0]!.start,found[0]!.end));
    }
  });

  it('keeps currency, empty, partial, mixed and embedded display forms literal',()=>{
    for(const text of ['$5','$5 and $10','$5$10','$ $$x$$','$ $$','\\(\\)','\\(   \\)','\\(open','\\(mixed$','$$mixed\\)','$$$x$$$','embedded \\[x\\] prose','raw \\begin{x} outside'])expect(findInlineMath(text)).toEqual([]);
  });

  it('honors odd escaping backslashes for openers and closers',()=>{
    expect(findInlineMath('\\\\(x\\)')).toEqual([]);
    expect(findInlineMath('\\$x$')).toEqual([]);
    expect(findInlineMath('\\(x \\\\) still open')).toEqual([]);
    expect(findInlineMath('\\(x \\\\y\\)')[0]?.tex).toBe('x \\\\y');
  });

  it('tracks braces and TeX comments while preserving Markdown-looking bodies',()=>{
    const text='**\\(\\text{a ** b}\\)** and \\({x\\)y}\\)';
    const found=findInlineMath(text);
    expect(found.map(item=>item.tex)).toEqual(['\\text{a ** b}','{x\\)y}']);
    expect(findInlineMath('\\({x\\)')).toEqual([]);
    expect(findInlineMath('\\(a % \\) hidden by comment')).toEqual([]);
    expect(findInlineMath('\\(a \\% visible\\)')[0]?.tex).toBe('a \\% visible');
  });

  it('preserves exact CJK emoji and combining-character source units',()=>{
    const text='\\(α|β||🙂|é\\)';
    const found=findInlineMath(text);
    expect(found).toHaveLength(1);
    expect(found[0]!.raw).toBe(text.slice(found[0]!.start,found[0]!.end));
    expect(found[0]!.tex).toBe('α|β||🙂|é');
  });

  it('gives complete inline code and link tokens precedence but still allows math in bold',()=>{
    expect(findInlineMath('`\\(x\\)`')).toEqual([]);
    expect(findInlineMath('[\\(x\\)](https://example.com)')).toEqual([]);
    expect(findInlineMath('[\\(x\\)](#local)')).toEqual([]);
    expect(findInlineMath('**\\(x\\)**')).toHaveLength(1);
    expect(findInlineMath('\\(x\\) `[y]`')).toHaveLength(1);
  });

  it('does not recognize math inside a complete fenced block',()=>{
    expect(findInlineMath('```\n\\(x\\)\n```')).toEqual([]);
    expect(findInlineMath('~~~text\n$x$\n~~~')).toEqual([]);
  });

  it('keeps inline forms on one line while resuming after a newline',()=>{
    const found=findInlineMath('\\(broken\nnext \\(ok\\)');
    expect(found).toHaveLength(1);
    expect(found[0]?.tex).toBe('ok');
  });
});

describe('markdown display math recognition',()=>{
  it('recognizes whole-line dollar display math with exact CRLF slices',()=>{
    const source='intro\r\n  $$a|b$$\r\nafter';
    const found=display(source,1);
    expect(found?.nextLine).toBe(2);
    expect(found?.span.mode).toBe('display');
    expect(found?.span.tex).toBe('a|b');
    expect(found?.span.start).toBe(source.indexOf('$$'));
    expect(found?.span.raw).toBe(source.slice(found!.span.start,found!.span.end));
    expect(found?.span.raw).toBe('$$a|b$$');
    expect(display('$$ a/b $$',0)?.span.tex).toBe(' a/b ');
  });

  it('recognizes standalone multiline dollar display math and preserves inner CRLF',()=>{
    const source='before\r\n$$\r\na/b\r\n%c \\) not relevant\r\n$$\r\nafter';
    const found=display(source,1);
    expect(found?.span.tex).toBe('\r\na/b\r\n%c \\) not relevant\r\n');
    expect(found?.nextLine).toBe(5);
    expect(found?.span.raw).toBe(source.slice(found!.span.start,found!.span.end));
  });

  it('recognizes whole-line and multiline bracket display math only at line start',()=>{
    const one='\\[a/b\\]';
    expect(display(one,0)?.span.tex).toBe('a/b');
    const source='before\n\\[\na/b\n\\]\nafter';
    const found=display(source,1);
    expect(found?.span.tex).toBe('\na/b\n');
    expect(found?.nextLine).toBe(4);
    expect(display('embedded \\[a/b\\] prose',0)).toBeNull();
  });

  it('rejects empty incomplete mixed escaped or overindented display candidates',()=>{
    for(const source of ['$$$$','$$  $$','$$open','$$open\r\nclose','\\[\\]','\\[open','    $$x$$','\\$$x$$','$$$x$$$'])expect(display(source,0)).toBeNull();
  });

  it('ignores closers inside braces and comments',()=>{
    const source='$$\n{x $$ y}\n% $$ hidden\nz\n$$';
    expect(display(source,0)?.span.tex).toBe('\n{x $$ y}\n% $$ hidden\nz\n');
    expect(display('$$\n{x\n$$',0)).toBeNull();
    expect(display('$$\n{\n$$\n}\n$$',0)?.span.tex).toBe('\n{\n$$\n}\n');
  });
});

describe('markdown math admission and scan budgets',()=>{
  it('allows scanning only at or below the document bound when enabled',()=>{
    expect(mathScanAllowed('x'.repeat(100000),true)).toBe(true);
    expect(mathScanAllowed('x'.repeat(100001),true)).toBe(false);
    expect(mathScanAllowed('x',false)).toBe(false);
  });

  it('admits expressions deterministically at exact expression and total bounds',()=>{
    const budget:MathBudget={expressions:2,sourceUnits:5};
    expect(admitMath(span(0,5,'$abc$','abc','inline'),budget)).toBe(true);
    expect(budget).toEqual({expressions:1,sourceUnits:2});
    expect(admitMath(span(5,10,'$de$','de','inline'),budget)).toBe(true);
    expect(budget).toEqual({expressions:0,sourceUnits:0});
    expect(admitMath(span(10,13,'$f$','f','inline'),budget)).toBe(false);
  });

  it('admits below and at expression-count and total-source boundaries then rejects the next expression',()=>{
    const one=span(0,3,'$x$','x','inline'),countBudget:MathBudget={expressions:64,sourceUnits:64};
    for(let index=0;index<64;index++)expect(admitMath(one,countBudget)).toBe(true);
    expect(countBudget).toEqual({expressions:0,sourceUnits:0});
    expect(admitMath(one,countBudget)).toBe(false);
    const exact='x'.repeat(4096),totalBudget:MathBudget={expressions:9,sourceUnits:32768};
    for(let index=0;index<8;index++)expect(admitMath(span(0,4100,'$'+exact+'$',exact,'inline'),totalBudget)).toBe(true);
    expect(totalBudget).toEqual({expressions:1,sourceUnits:0});
    expect(admitMath(span(0,4100,'$'+exact+'$',exact,'inline'),totalBudget)).toBe(false);
  });

  it('rejects at the per-expression boundary without consuming budget or source',()=>{
    const exact='x'.repeat(4096),over='x'.repeat(4097),budget:MathBudget={expressions:64,sourceUnits:32768};
    expect(admitMath(span(0,4100,'$'+exact+'$',exact,'inline'),budget)).toBe(true);
    expect(budget).toEqual({expressions:63,sourceUnits:32768-4096});
    const before={...budget};
    expect(admitMath(span(0,4101,'$'+over+'$',over,'inline'),budget)).toBe(false);
    expect(budget).toEqual(before);
  });

  it('keeps an over-budget closed formula containing table pipes as exact source',()=>{
    const tex='a|b'.padEnd(4097,'x');
    const raw=`$${tex}$`,budget:MathBudget={expressions:1,sourceUnits:32768};
    expect(admitMath(span(0,raw.length,raw,tex,'inline'),budget)).toBe(false);
    expect(raw).toBe(`$${tex}$`);
    expect(budget).toEqual({expressions:1,sourceUnits:32768});
  });

  it('handles many failed openers once in source order',()=>{
    const text=Array.from({length:200},(_,index)=>`$open${index} `).join('')+'\\(x\\)';
    const found=findInlineMath(text);
    expect(found.at(-1)?.tex).toBe('x');
  });
});
