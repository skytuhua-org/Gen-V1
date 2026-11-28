import {expect,it} from 'vitest';
import {resolveMotionDuration} from '../apps/web/src/motion-policy';

it('consumes valid effective CSS time tokens without applying speed again',()=>{
 for(const speed of [.75,1,1.25]){
  expect(resolveMotionDuration(220,'.3s',speed)).toBe(300);
  expect(resolveMotionDuration(220,'250ms',speed)).toBe(250);
  expect(resolveMotionDuration(220,'0ms',speed)).toBe(0);
  expect(resolveMotionDuration(220,'+1e-1s',speed)).toBeCloseTo(100,6);
  expect(resolveMotionDuration(220,' 176.5ms  ',speed)).toBe(176.5);
 }
});

it('scales only missing or invalid fallback durations exactly once',()=>{
 for(const [speed,panel,insert] of [[.75,220/0.75,240],[1,220,180],[1.25,176,144]] as const){
  expect(resolveMotionDuration(220,undefined,speed)).toBeCloseTo(panel,6);
  expect(resolveMotionDuration(180,'not-a-time',speed)).toBeCloseTo(insert,6);
 }
 for(const invalid of ['','300','10px','300ms 300ms','calc(300ms)','1msx','-1ms','NaNms','Infinityms']){
  expect(resolveMotionDuration(220,invalid,1.25),invalid).toBe(176);
 }
});

it('never produces negative or nonfinite durations',()=>{
 for(const speed of [0,-1,NaN,Infinity,-Infinity]) expect(resolveMotionDuration(220,undefined,speed)).toBe(220);
 for(const base of [-1,NaN,Infinity,-Infinity]) expect(resolveMotionDuration(base,undefined,1.25)).toBe(0);
 expect(resolveMotionDuration(Number.MAX_VALUE,undefined,1e-320)).toBe(0);
});
