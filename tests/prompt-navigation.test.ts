import {describe,expect,it} from 'vitest';
import {matchesShortcut} from '../apps/web/src/shell-layout';
import {promptAnchor,promptContextEligible,promptDestination,promptEventEligible,selectPromptTarget,PROMPT_ANCHOR_OFFSET,PROMPT_ALIGNMENT_TOLERANCE,type PromptTarget} from '../apps/web/src/prompt-navigation';

const rows=(...tops:number[]):PromptTarget[]=>tops.map((top,index)=>({id:`p${index+1}`,top}));

describe('prompt target selection',()=>{
 it('walks an interleaved prompt list by viewport anchor in both directions',()=>{
  const targets=rows(0,300,900,1600),anchor=promptAnchor(800);
  expect(selectPromptTarget(targets,anchor,-1)?.id).toBe('p2');
  expect(selectPromptTarget(targets,anchor,1)?.id).toBe('p3');
 });
 it('treats a row inside the alignment tolerance as current and skips it both ways',()=>{
  const aligned=promptAnchor(500);
  for(const top of [aligned-PROMPT_ALIGNMENT_TOLERANCE,aligned,aligned+PROMPT_ALIGNMENT_TOLERANCE]){
   const targets=rows(100,top,900);
   expect(selectPromptTarget(targets,aligned,-1,undefined)?.id,`top ${top} previous`).toBe('p1');
   expect(selectPromptTarget(targets,aligned,1,undefined)?.id,`top ${top} next`).toBe('p3');
  }
 });
 it('returns to a tall prompt start going up and advances past it going down',()=>{
  const targets=rows(0,2000),anchor=promptAnchor(1000);
  expect(selectPromptTarget(targets,anchor,-1)?.id).toBe('p1');
  expect(selectPromptTarget(targets,anchor,1)?.id).toBe('p2');
 });
 it('steps repeat and reversal by cursor identity, ignoring animation positions',()=>{
  const targets=rows(0,300,900);
  expect(selectPromptTarget(targets,promptAnchor(0),1,'p2')?.id).toBe('p3');
  expect(selectPromptTarget(targets,promptAnchor(0),-1,'p2')?.id).toBe('p1');
  expect(selectPromptTarget(targets,promptAnchor(1200),1,'p1')?.id).toBe('p2');
 });
 it('clamps at the first and last cursor row without wrapping',()=>{
  const targets=rows(0,300,900);
  expect(selectPromptTarget(targets,0,-1,'p1')).toBeNull();
  expect(selectPromptTarget(targets,0,1,'p3')).toBeNull();
  expect(selectPromptTarget(targets,promptAnchor(950),1)).toBeNull();
  expect(selectPromptTarget(targets,promptAnchor(0),-1)?.id).toBe('p1');
  expect(selectPromptTarget(rows(300,600),0,-1)).toBeNull();
 });
 it('handles empty and single-prompt lists without inventing a target',()=>{
  expect(selectPromptTarget([],100,-1)).toBeNull();
  expect(selectPromptTarget([],100,1)).toBeNull();
  const single=rows(0);
  expect(selectPromptTarget(single,promptAnchor(300),1)).toBeNull();
  expect(selectPromptTarget(single,promptAnchor(300),-1)?.id).toBe('p1');
 });
 it('recomputes from the viewport when the cursor row is gone',()=>{
  const targets=rows(0,300,900);
  expect(selectPromptTarget(targets,promptAnchor(500),1,'removed')?.id).toBe('p3');
  expect(selectPromptTarget(targets,promptAnchor(500),-1,'removed')?.id).toBe('p2');
 });
 it('ignores rows whose measured top is not finite',()=>{
  const targets:PromptTarget[]=[{id:'bad',top:Number.NaN},{id:'worse',top:Number.POSITIVE_INFINITY},...rows(300)];
  expect(selectPromptTarget(targets,promptAnchor(0),1)?.id).toBe('p1');
  expect(selectPromptTarget(targets,promptAnchor(500),-1)?.id).toBe('p1');
 });
});

describe('prompt destination',()=>{
 it('aligns the row under the anchor offset and clamps into the scrollable range',()=>{
  expect(promptDestination(500,2000,400)).toBe(500-PROMPT_ANCHOR_OFFSET);
  expect(promptDestination(5,2000,400)).toBe(0);
  expect(promptDestination(5000,2000,400)).toBe(1600);
  expect(promptDestination(500,300,400)).toBe(0);
 });
});

describe('prompt keydown eligibility',()=>{
 const owner={contains:(child:unknown)=>inside.has(child as object)} as HTMLElement;
 const inside=new Set<object>();
 const element=(marks:{outside?:boolean;excluded?:boolean;editable?:boolean}={})=>{
  const self={closest:()=>marks.excluded?self:null,isContentEditable:marks.editable??false};
  if(!marks.outside)inside.add(self);
  return self as unknown as Element;
 };
 it('accepts the owner, a prompt row and a plain transcript descendant',()=>{
  expect(promptContextEligible(owner,owner)).toBe(true);
  expect(promptContextEligible(element(),owner)).toBe(true);
  expect(promptEventEligible({target:element()},owner)).toBe(true);
 });
 it('rejects focus inside inputs, editable regions, widgets, terminals and menus',()=>{
  expect(promptContextEligible(element({excluded:true}),owner)).toBe(false);
  expect(promptContextEligible(element({editable:true}),owner)).toBe(false);
 });
 it('rejects targets outside the owner even when they are not editable',()=>{
  expect(promptContextEligible(element({outside:true}),owner)).toBe(false);
  expect(promptContextEligible(null,owner)).toBe(false);
 });
 it('rejects composing, already-handled and IME events',()=>{
  const target=element();
  expect(promptEventEligible({isComposing:true,target},owner)).toBe(false);
  expect(promptEventEligible({keyCode:229,target},owner)).toBe(false);
  expect(promptEventEligible({defaultPrevented:true,target},owner)).toBe(false);
 });
 it('leaves modifier arbitration to the registry chord comparison',()=>{
  const press={key:'ArrowUp',altKey:true,ctrlKey:false,metaKey:false,shiftKey:false};
  expect(matchesShortcut(press,'Alt+ArrowUp')).toBe(true);
  expect(matchesShortcut({...press,shiftKey:true},'Alt+ArrowUp')).toBe(false);
  expect(matchesShortcut({...press,ctrlKey:true},'Alt+ArrowUp')).toBe(false);
  expect(matchesShortcut({...press,altKey:false},'Alt+ArrowUp')).toBe(false);
 });
});
