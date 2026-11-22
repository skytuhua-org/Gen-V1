import {describe,it,expect} from 'vitest';
import {ZOOM_STEPS,nextZoom,parseSavedZoom,zoomCommandFor,type ZoomKey} from '../apps/desktop/app-zoom.ts';

const key=(partial:Partial<ZoomKey>):ZoomKey=>({type:'keyDown',key:'',code:'',ctrlKey:false,metaKey:false,altKey:false,shiftKey:false,...partial});

describe('app zoom steps',()=>{
 it('keeps the fixed Chromium step list',()=>expect(ZOOM_STEPS).toEqual([0.5,0.67,0.75,0.8,0.9,1,1.1,1.25,1.5,1.75,2]));
 it('steps through the whole list in both directions',()=>{
  for(let index=0;index<ZOOM_STEPS.length-1;index++)expect(nextZoom(ZOOM_STEPS[index],'in')).toBe(ZOOM_STEPS[index+1]);
  for(let index=ZOOM_STEPS.length-1;index>0;index--)expect(nextZoom(ZOOM_STEPS[index],'out')).toBe(ZOOM_STEPS[index-1]);
 });
 it('clamps at 50% and 200%',()=>{expect(nextZoom(0.5,'out')).toBe(0.5);expect(nextZoom(2,'in')).toBe(2);});
 it('snaps an off-list factor in the command direction',()=>{expect(nextZoom(1.05,'in')).toBe(1.1);expect(nextZoom(1.05,'out')).toBe(1);});
 it('resets to 100% from any factor',()=>expect(nextZoom(1.75,'reset')).toBe(1));
});

describe('saved zoom parsing',()=>{
 it('accepts list values',()=>expect(parseSavedZoom(1.25)).toBe(1.25));
 for(const value of ['1.25',3,NaN,null,undefined,{},'big'])it(`loads ${String(value)} as 1`,()=>expect(parseSavedZoom(value)).toBe(1));
});

describe('zoom chord matching',()=>{
 for(const modifier of [{ctrlKey:true},{metaKey:true}])describe(`with ${modifier.ctrlKey?'Ctrl':'Cmd'}`,()=>{
  for(const chord of [{key:'='},{key:'+',shiftKey:true},{code:'NumpadAdd'}])it(`zooms in for ${JSON.stringify(chord)}`,()=>expect(zoomCommandFor(key({...modifier,...chord}))).toBe('in'));
  for(const chord of [{key:'-'},{code:'NumpadSubtract'}])it(`zooms out for ${JSON.stringify(chord)}`,()=>expect(zoomCommandFor(key({...modifier,...chord}))).toBe('out'));
  for(const chord of [{key:'0'},{code:'Numpad0'}])it(`resets for ${JSON.stringify(chord)}`,()=>expect(zoomCommandFor(key({...modifier,...chord}))).toBe('reset'));
 });
 for(const negative of [
  key({key:'='}),
  key({key:'=',ctrlKey:true,altKey:true}),
  key({type:'keyUp',key:'=',ctrlKey:true}),
  key({key:'-',ctrlKey:true,shiftKey:true}),
  key({key:'9',ctrlKey:true}),
  key({key:'=',code:'',ctrlKey:false,metaKey:false}),
 ])it(`ignores ${JSON.stringify(negative)}`,()=>expect(zoomCommandFor(negative)).toBeNull());
});
