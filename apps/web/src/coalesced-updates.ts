/** Latest-wins throttle for safe geometry/storage updates: leads immediately
 * after the interval, coalesces bursts to at most one send per interval, and
 * always runs a trailing send so the final state is never dropped. `send`
 * reads the latest value itself, so stale intermediates cost nothing. */
export function throttleLatest(
 intervalMs: number,
 send: () => void,
 now: () => number = Date.now,
 schedule: (cb: () => void, ms: number) => ReturnType<typeof setTimeout> = (cb, ms) => setTimeout(cb, ms),
 cancel: (t: ReturnType<typeof setTimeout>) => void = t => clearTimeout(t),
) {
 let timer: ReturnType<typeof setTimeout> | undefined, last = -Infinity, pending = false;
 const flush = () => {timer = undefined; if (!pending) return; pending = false; last = now(); send();};
 return {
  queue() {
   pending = true;
   const wait = last + intervalMs - now();
   if (wait <= 0) {flush(); return;}
   if (!timer) timer = schedule(flush, wait);
  },
  cancel() {pending = false; if (timer) {cancel(timer); timer = undefined;}},
 };
}
