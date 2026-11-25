import {expect,it,vi} from 'vitest';
import {handleDesktopControl} from '../apps/server/desktop-controls.ts';
import {quitDialogOptions} from '../apps/desktop/dev-server-quit.ts';

const token='c'.repeat(64);

it('builds the quit prompt for one server and truncates detail to five lines',()=>{
 const one=quitDialogOptions(1,[{port:5173,label:'dev'}]);
 expect(one.message).toBe('Stop 1 running server and quit Gen?');
 expect(one.detail).toBe('localhost:5173 — dev');
 expect(one.defaultId).toBe(0);expect(one.cancelId).toBe(1);
 expect(one.buttons).toEqual(['Stop and quit','Cancel']);
 const three=quitDialogOptions(3,Array.from({length:7},(_,index)=>({port:3000+index,label:`srv-${index}`})));
 expect(three.message).toBe('Stop 3 running servers and quit Gen?');
 expect(three.detail.split('\n')).toHaveLength(5);
 expect(three.detail).toContain('localhost:3000 — srv-0');
 expect(three.detail).not.toContain('3005');
});

it('falls back to a generic label and no detail for malformed items',()=>{
 const options=quitDialogOptions(2,'not-an-array');
 expect(options.detail).toBe('');
 const sparse=quitDialogOptions(2,[{}]);
 expect(sparse.detail).toBe('localhost:? — Terminal');
});

it('serves the dev server count over the private control channel and rejects extra keys',async()=>{
 const items=[{url:'http://localhost:5173/',port:5173,label:'dev'}];
 const host={devServersCount:vi.fn(async()=>({count:1,items})),stopAll:vi.fn(),saveNativeLayout:vi.fn(),close:vi.fn()},send=vi.fn();
 expect(await handleDesktopControl({type:'harness.devServers.count',token,requestId:'q1'},token,host,send)).toBe(true);
 expect(host.devServersCount).toHaveBeenCalledOnce();
 expect(send).toHaveBeenCalledWith({type:'harness.devServers.count.result',token,requestId:'q1',count:1,items});
 send.mockClear();
 expect(await handleDesktopControl({type:'harness.devServers.count',token,requestId:'q2',extra:true},token,host,send)).toBe(false);
 expect(send).not.toHaveBeenCalled();
});

it('returns an empty count when the host has no dev server tracker',async()=>{
 const host={stopAll:vi.fn(),saveNativeLayout:vi.fn(),close:vi.fn()},send=vi.fn();
 expect(await handleDesktopControl({type:'harness.devServers.count',token,requestId:'q3'},token,host as never,send)).toBe(true);
 expect(send).toHaveBeenCalledWith({type:'harness.devServers.count.result',token,requestId:'q3',count:0,items:[]});
});

it('returns an empty count when the tracker call fails so quitting is never blocked',async()=>{
 const host={devServersCount:vi.fn(async()=>{throw Error('tracker lost');}),stopAll:vi.fn(),saveNativeLayout:vi.fn(),close:vi.fn()},send=vi.fn();
 expect(await handleDesktopControl({type:'harness.devServers.count',token,requestId:'q4'},token,host,send)).toBe(true);
 expect(send).toHaveBeenCalledWith({type:'harness.devServers.count.result',token,requestId:'q4',count:0,items:[]});
});
