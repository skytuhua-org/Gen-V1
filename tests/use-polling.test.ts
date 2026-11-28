import {afterEach,expect,it,vi} from 'vitest';
import {createPolling} from '../apps/web/src/usePolling';

function fixture(visible='visible'){
 const page=Object.assign(new EventTarget(),{visibilityState:visible});
 vi.stubGlobal('document',page);
 return page;
}
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});

it('runs immediately then on the interval while visible',async()=>{
 fixture();
 vi.useFakeTimers();
 const task=vi.fn(async()=>{});
 createPolling(task,4000);
 await vi.advanceTimersByTimeAsync(0);
 expect(task).toHaveBeenCalledTimes(1);
 await vi.advanceTimersByTimeAsync(8000);
 expect(task).toHaveBeenCalledTimes(3);
});

it('does not fire while the document is hidden and resumes immediately on visible',async()=>{
 const page=fixture('hidden');
 vi.useFakeTimers();
 const task=vi.fn(async()=>{});
 createPolling(task,4000);
 await vi.advanceTimersByTimeAsync(20000);
 expect(task).not.toHaveBeenCalled();
 page.visibilityState='visible';
 page.dispatchEvent(new Event('visibilitychange'));
 await vi.advanceTimersByTimeAsync(0);
 expect(task).toHaveBeenCalledTimes(1);
 await vi.advanceTimersByTimeAsync(4000);
 expect(task).toHaveBeenCalledTimes(2);
});

it('backs off exponentially up to 60s after consecutive failures and reports through onError',async()=>{
 fixture();
 vi.useFakeTimers();
 const task=vi.fn(async()=>{throw new Error('down');});
 const onError=vi.fn();
 createPolling(task,4000,onError);
 await vi.advanceTimersByTimeAsync(0);
 expect(task).toHaveBeenCalledTimes(1);expect(onError).toHaveBeenCalledTimes(1);
 await vi.advanceTimersByTimeAsync(7999);expect(task).toHaveBeenCalledTimes(1);
 await vi.advanceTimersByTimeAsync(1);expect(task).toHaveBeenCalledTimes(2); // 8s
 await vi.advanceTimersByTimeAsync(16000);expect(task).toHaveBeenCalledTimes(3); // 16s
 await vi.advanceTimersByTimeAsync(32000);expect(task).toHaveBeenCalledTimes(4); // 32s
 await vi.advanceTimersByTimeAsync(60000);expect(task).toHaveBeenCalledTimes(5); // capped at 60s
 await vi.advanceTimersByTimeAsync(60000);expect(task).toHaveBeenCalledTimes(6);
});

it('resets the interval after a successful task',async()=>{
 fixture();
 vi.useFakeTimers();
 let fail=true;
 const task=vi.fn(async()=>{if(fail)throw new Error('down');});
 createPolling(task,4000);
 await vi.advanceTimersByTimeAsync(0);expect(task).toHaveBeenCalledTimes(1);
 fail=false;
 await vi.advanceTimersByTimeAsync(8000);expect(task).toHaveBeenCalledTimes(2); // succeeded at 8s
 await vi.advanceTimersByTimeAsync(4000);expect(task).toHaveBeenCalledTimes(3); // back to 4s
});

it('resets an accumulated back-off when the window becomes visible',async()=>{
 const page=fixture();
 vi.useFakeTimers();
 let fail=true;
 const task=vi.fn(async()=>{if(fail)throw new Error('down');});
 createPolling(task,4000);
 await vi.advanceTimersByTimeAsync(0);expect(task).toHaveBeenCalledTimes(1);
 await vi.advanceTimersByTimeAsync(8000);expect(task).toHaveBeenCalledTimes(2);
 await vi.advanceTimersByTimeAsync(16000);expect(task).toHaveBeenCalledTimes(3); // now in 32s back-off
 page.visibilityState='hidden';
 page.dispatchEvent(new Event('visibilitychange'));
 await vi.advanceTimersByTimeAsync(120000);
 expect(task).toHaveBeenCalledTimes(3); // no polls while hidden, even past the back-off deadline
 fail=false;
 page.visibilityState='visible';
 page.dispatchEvent(new Event('visibilitychange'));
 await vi.advanceTimersByTimeAsync(0);
 expect(task).toHaveBeenCalledTimes(4); // immediate poll, not the remaining back-off wait
 await vi.advanceTimersByTimeAsync(4000);
 expect(task).toHaveBeenCalledTimes(5); // next tick on the normal interval, not 32s+
});

it('stops firing after stop()',async()=>{
 fixture();
 vi.useFakeTimers();
 const task=vi.fn(async()=>{});
 const polling=createPolling(task,4000);
 await vi.advanceTimersByTimeAsync(0);expect(task).toHaveBeenCalledTimes(1);
 polling.stop();
 await vi.advanceTimersByTimeAsync(20000);
 expect(task).toHaveBeenCalledTimes(1);
});

it('uses a single timer after hide and resume between polling ticks', async () => {
 const page = fixture();
 vi.useFakeTimers();
 const task = vi.fn(async () => {});
 const polling = createPolling(task, 4000);
 await vi.advanceTimersByTimeAsync(1000);
 page.visibilityState = 'hidden';
 page.dispatchEvent(new Event('visibilitychange'));
 await vi.advanceTimersByTimeAsync(1000);
 page.visibilityState = 'visible';
 page.dispatchEvent(new Event('visibilitychange'));
 await vi.advanceTimersByTimeAsync(0);
 expect(task).toHaveBeenCalledTimes(2);
 await vi.advanceTimersByTimeAsync(3999);
 expect(task).toHaveBeenCalledTimes(2);
 await vi.advanceTimersByTimeAsync(1);
 expect(task).toHaveBeenCalledTimes(3);
 polling.stop();
});

it('keeps one in-flight request across a hide/restore and cancels its next tick on stop', async () => {
 const page = fixture();
 vi.useFakeTimers();
 let finish!: () => void;
 const task = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
 const polling = createPolling(task, 4000);
 await vi.advanceTimersByTimeAsync(0);
 page.visibilityState = 'hidden';
 page.dispatchEvent(new Event('visibilitychange'));
 await vi.advanceTimersByTimeAsync(8000);
 page.visibilityState = 'visible';
 page.dispatchEvent(new Event('visibilitychange'));
 expect(task).toHaveBeenCalledTimes(1);
 finish();
 await vi.advanceTimersByTimeAsync(0);
 expect(vi.getTimerCount()).toBe(1);
 polling.stop();
 expect(vi.getTimerCount()).toBe(0);
 await vi.advanceTimersByTimeAsync(8000);
 expect(task).toHaveBeenCalledTimes(1);
});

it('reports a synchronous failure and returns to the normal interval after recovery', async () => {
 fixture();
 vi.useFakeTimers();
 const error = new Error('unavailable');
 const task = vi.fn().mockImplementationOnce(() => { throw error; });
 const report = vi.fn();
 const polling = createPolling(task, 1000, report);
 await vi.advanceTimersByTimeAsync(0);
 expect(report).toHaveBeenCalledWith(error);
 await vi.advanceTimersByTimeAsync(1999);
 expect(task).toHaveBeenCalledTimes(1);
 await vi.advanceTimersByTimeAsync(1);
 expect(task).toHaveBeenCalledTimes(2);
 await vi.advanceTimersByTimeAsync(1000);
 expect(task).toHaveBeenCalledTimes(3);
 polling.stop();
});

it('marks an in-flight task disposed by stop and suppresses disposal-time errors', async () => {
 fixture();
 vi.useFakeTimers();
 const error = new Error('late failure');
 let finish!: () => void;
 let observed: boolean | undefined;
 const report = vi.fn();
 const task = vi.fn((state: {disposed: boolean}) => new Promise<void>((_resolve, reject) => {
  finish = () => { observed = state.disposed; reject(error); };
 }));
 const polling = createPolling(task, 4000, report);
 await vi.advanceTimersByTimeAsync(0);
 polling.stop();
 finish();
 await vi.advanceTimersByTimeAsync(0);
 expect(observed).toBe(true);
 expect(report).not.toHaveBeenCalled();
});
