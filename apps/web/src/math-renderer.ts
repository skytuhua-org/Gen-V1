import katex from 'katex';
import 'katex/dist/katex.min.css';

export type MathRenderResult={kind:'rendered';elements:number}|{kind:'source';reason:'parse'|'budget'|'engine'};

export function renderMath(tex:string,mode:'inline'|'display',target:HTMLElement,remainingNodes:number):MathRenderResult{
 if(target.isConnected)return {kind:'source',reason:'engine'};
 if(!Number.isFinite(remainingNodes)||remainingNodes<1)return {kind:'source',reason:'budget'};
 // trust:false alone still permits these URL/embed commands in katex 0.19.1; the adapter must preserve source for them.
 if(['href','url','includegraphics','htmlClass','htmlStyle','htmlData'].some(name=>tex.includes(String.fromCharCode(92)+name)))return {kind:'source',reason:'parse'};
 const options={
  displayMode:mode==='display',output:'htmlAndMathml' as const,throwOnError:true,strict:'error' as const,trust:false,
  maxSize:10,maxExpand:500,globalGroup:false,macros:Object.create(null) as Record<string,string>,
 };
 try{katex.render(tex,target,options);}
 catch(error){
  target.replaceChildren();
  return {kind:'source',reason:error instanceof Error&&error.name==='ParseError'?'parse':'engine'};
 }
 const elements=target.querySelectorAll('*').length;
 if(elements>Math.min(2048,remainingNodes)){target.replaceChildren();return {kind:'source',reason:'budget'};}
 return {kind:'rendered',elements};
}
