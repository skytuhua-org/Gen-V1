import {describe,expect,it} from 'vitest';
import {captureReadingAnchor,resolveReadingTop,type ReadingAnchor,type ReadingMetric} from '../apps/web/src/conversation-reading-anchor';

const row=(id:string,top:number,bottom=top+40):ReadingMetric=>({id,top,bottom});
const rows=(entries:readonly [string,number,number?][]):ReadingMetric[]=>entries.map(([id,top,bottom])=>row(id,top,bottom));

describe('captureReadingAnchor',()=>{
 it('captures the first intersecting row and adjacent eligible rows in DOM order',()=>{
  expect(captureReadingAnchor('owner',rows([['before',-100,-40],['primary',-20,30],['next',30,80],['after',100,140]]),100)).toEqual({
   owner:'owner',primary:{id:'primary',offset:-20},next:{id:'next',offset:30},previous:{id:'before',offset:-100},
  });
 });
 it('preserves a negative offset on a tall first row',()=>{
  expect(captureReadingAnchor('owner',[row('tall',-180,420),row('next',420,460)],300)).toMatchObject({primary:{id:'tall',offset:-180},next:{id:'next',offset:420}});
 });
 it.each([
  ['zero',0],['negative',-1],['NaN',Number.NaN],['infinite',Number.POSITIVE_INFINITY],
 ])('returns null for %s height',(_name,height)=>{
  expect(captureReadingAnchor('owner',[row('visible',0,20)],height)).toBeNull();
 });
 it('returns null when no eligible row intersects the viewport',()=>{
  expect(captureReadingAnchor('owner',rows([['above',-100,-10],['below',200,240]]),100)).toBeNull();
 });
 it('filters nonfinite, inverted and duplicate rows without reordering',()=>{
  const input:ReadingMetric[]=[row('first',0,20),row('nan',Number.NaN,20),row('inverted',50,40),row('first',30,60),row('next',60,90)];
  const before=input.map(item=>({...item}));
  expect(captureReadingAnchor('owner',input,100)).toEqual({owner:'owner',primary:{id:'first',offset:0},next:{id:'next',offset:60}});
  expect(input).toEqual(before);
 });
 it('captures a later row when the first eligible row is outside the viewport',()=>{
  expect(captureReadingAnchor('owner',rows([['above',-100,-1],['visible',10,40],['below',150,180]]),100)).toMatchObject({primary:{id:'visible',offset:10},previous:{id:'above',offset:-100},next:{id:'below',offset:150}});
 });
});

describe('resolveReadingTop',()=>{
 const anchor:ReadingAnchor={owner:'owner',primary:{id:'primary',offset:10},next:{id:'next',offset:50},previous:{id:'previous',offset:-30}};
 it('keeps the primary at its saved block-start offset after growth above it',()=>{
  expect(resolveReadingTop(anchor,[row('primary',130),row('next',170)],200,800)).toBe(320);
 });
 it('keeps the primary after shrink above it and after equal-total movement',()=>{
  expect(resolveReadingTop(anchor,[row('primary',-50),row('next',-10)],200,800)).toBe(140);
  expect(resolveReadingTop(anchor,[row('primary',70),row('next',110)],200,800)).toBe(260);
 });
 it('keeps the current top unchanged when growth or an append is below the primary',()=>{
  expect(resolveReadingTop(anchor,[row('primary',10),row('next',50),row('appended',220)],200,800)).toBe(200);
 });
 it('uses the saved next row before the saved previous row when the primary vanishes',()=>{
  expect(resolveReadingTop(anchor,[row('previous',-30),row('next',90)],200,800)).toBe(240);
  expect(resolveReadingTop({...anchor,next:undefined},[row('previous',-30),row('next',90)],200,800)).toBe(200);
 });
 it('returns null when no saved row survives and never substitutes an unsaved neighbor',()=>{
  expect(resolveReadingTop(anchor,[row('unsaved',10)],200,800)).toBeNull();
  expect(resolveReadingTop({owner:'owner',primary:{id:'primary',offset:0}},[row('other',10)],200,800)).toBeNull();
 });
 it.each([
  ['negative scroll',-80,0],['maximum',500,300],
 ])('clamps %s result exactly',(_name,top,expected)=>{
  expect(resolveReadingTop({owner:'owner',primary:{id:'row',offset:20}},[row('row',20)],top,300)).toBe(expected);
 });
 it('recapture after clamping prevents repeated drift',()=>{
  const initial={owner:'owner',primary:{id:'row',offset:20}};
  expect(resolveReadingTop(initial,[row('row',20)],500,300)).toBe(300);
  const recaptured=captureReadingAnchor('owner',[row('row',220,260)],300);
  expect(recaptured?.primary.offset).toBe(220);
  expect(resolveReadingTop(recaptured!,[row('row',220,260)],300,300)).toBe(300);
 });
 it('returns null for invalid numeric inputs',()=>{
  for(const [top,maximum] of [[Number.NaN,100],[Number.POSITIVE_INFINITY,100],[0,-1],[0,Number.NaN]])expect(resolveReadingTop(anchor,[row('primary',10)],top,maximum)).toBeNull();
 });
 it('ignores invalid rows and later duplicates when resolving',()=>{
  const input:ReadingMetric[]=[row('next',Number.NaN,60),row('next',90,130),row('next',140,180)];
  const before=input.map(item=>({...item})),frozen={...anchor,next:anchor.next&&{...anchor.next},previous:anchor.previous&&{...anchor.previous}};
  expect(resolveReadingTop(anchor,input,200,800)).toBe(240);
  expect(input).toEqual(before);expect(anchor).toEqual(frozen);
 });
 it('carries owner only through capture and never mutates inputs',()=>{
  const input=rows([['primary',10,50],['next',50,90]]),before=input.map(item=>({...item}));
  const captured=captureReadingAnchor('unchanged-owner',input,100);
  expect(captured?.owner).toBe('unchanged-owner');
  expect(resolveReadingTop(captured!,input,100,500)).toBe(100);
  expect(input).toEqual(before);
 });
});
