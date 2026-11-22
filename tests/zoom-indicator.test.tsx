import {afterEach,describe,expect,it,vi} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {ZOOM_INDICATOR_TIMING,ZoomIndicator,ZoomIndicatorView,createZoomIndicatorClock,zoomIndicatorUpdate} from '../apps/web/src/ZoomIndicator';

const view=(factor:number,leaving=false)=>renderToStaticMarkup(<ZoomIndicatorView factor={factor} sequence={7} leaving={leaving} onCommand={()=>{}} onHold={()=>{}}/>);

describe('zoomIndicatorUpdate',()=>{
 it('ignores the first state and any state without a new sequence',()=>{
  expect(zoomIndicatorUpdate(3,{factor:1.1,sequence:3,origin:'w1'},'w1').show).toBeNull();
  expect(zoomIndicatorUpdate(0,undefined,'w1').show).toBeNull();
  expect(zoomIndicatorUpdate(0,{factor:1,sequence:0},'w1').show).toBeNull();
 });
 it('shows a new sequence only when the origin is this window',()=>{
  expect(zoomIndicatorUpdate(3,{factor:1.1,sequence:4,origin:'w1'},'w1')).toEqual({seen:4,show:{factor:1.1,sequence:4}});
  expect(zoomIndicatorUpdate(3,{factor:1.1,sequence:4,origin:'w2'},'w1')).toEqual({seen:4,show:null});
  expect(zoomIndicatorUpdate(3,{factor:1.1,sequence:4},'w1')).toEqual({seen:4,show:null});
 });
});

describe('ZoomIndicatorView markup',()=>{
 it('announces the level in a polite status region',()=>{
  const html=view(1.1);
  expect(html).toContain('role="status"');expect(html).toContain('aria-live="polite"');expect(html).toContain('Zoom');expect(html).toContain('110%');
 });
 it('hides Reset at 100% and shows it at other levels',()=>{
  expect(view(1)).not.toContain('Reset');expect(view(1.1)).toContain('Reset');
 });
 it('disables Zoom in at 200% and Zoom out at 50%',()=>{
  const top=view(2),bottom=view(0.5);
  expect(top).toMatch(/aria-label="Zoom in"[^>]*disabled/);expect(top).not.toMatch(/aria-label="Zoom out"[^>]*disabled/);
  expect(bottom).toMatch(/aria-label="Zoom out"[^>]*disabled/);expect(bottom).not.toMatch(/aria-label="Zoom in"[^>]*disabled/);
 });
 it('marks the exit animation state',()=>{expect(view(1.1,true)).toContain('data-leaving="true"');});
 it('renders nothing without a desktop bridge',()=>{expect(renderToStaticMarkup(<ZoomIndicator/>)).toBe('');});
});

describe('zoom indicator clock',()=>{
 afterEach(()=>vi.useRealTimers());
 const setup=()=>{vi.useFakeTimers();const calls:string[]=[],clock=createZoomIndicatorClock({show:()=>calls.push('show'),leave:()=>calls.push('leave'),hide:()=>calls.push('hide')});return {calls,clock};};
 it('auto-hides after the visible window plus the exit window',()=>{
  const {calls,clock}=setup();clock.show(1.1,4);expect(calls).toEqual(['show']);
  vi.advanceTimersByTime(ZOOM_INDICATOR_TIMING.visible-1);expect(calls).toEqual(['show']);
  vi.advanceTimersByTime(1);expect(calls).toEqual(['show','leave']);
  vi.advanceTimersByTime(ZOOM_INDICATOR_TIMING.exit);expect(calls).toEqual(['show','leave','hide']);
 });
 it('re-arms on a later change and cancels a pending exit',()=>{
  const {calls,clock}=setup();clock.show(1.1,4);vi.advanceTimersByTime(1200);clock.show(1.25,5);vi.advanceTimersByTime(1599);expect(calls).toEqual(['show','show']);
  vi.advanceTimersByTime(1);expect(calls).toEqual(['show','show','leave']);clock.show(1.1,6);vi.advanceTimersByTime(2000);expect(calls).toEqual(['show','show','leave','show','leave','hide']);
 });
 it('pauses while held and resumes with at least the resume floor',()=>{
  const {calls,clock}=setup();clock.show(1.1,4);vi.advanceTimersByTime(1000);clock.hold(true);vi.advanceTimersByTime(5000);expect(calls).toEqual(['show']);
  clock.hold(false);vi.advanceTimersByTime(599);expect(calls).toEqual(['show']);vi.advanceTimersByTime(1);expect(calls).toEqual(['show','leave']);
 });
 it('enforces the resume floor when almost expired',()=>{
  const {calls,clock}=setup();clock.show(1.1,4);vi.advanceTimersByTime(1590);clock.hold(true);clock.hold(false);
  vi.advanceTimersByTime(399);expect(calls).toEqual(['show']);vi.advanceTimersByTime(1);expect(calls).toEqual(['show','leave']);
 });
});
