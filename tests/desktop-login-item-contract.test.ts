import {it,expect} from 'vitest';
import {DESKTOP_CHANNELS,parseDesktopLoginItemChange,type DesktopBridge} from '../packages/desktop-contract/index.ts';

it('accepts the full login-item change shape',()=>{
 expect(parseDesktopLoginItemChange({openAtLogin:true,startHidden:false})).toEqual({openAtLogin:true,startHidden:false});
 expect(parseDesktopLoginItemChange({openAtLogin:false,startHidden:true})).toEqual({openAtLogin:false,startHidden:true});
});

it('rejects malformed, partial, and noisy login-item payloads',()=>{
 for(const value of [undefined,null,42,'on',[],{},{openAtLogin:true},{startHidden:false},{openAtLogin:'yes',startHidden:false},{openAtLogin:true,startHidden:0},{openAtLogin:true,startHidden:false,extra:1},{openAtLogin:true,startHidden:false,__proto__:{polluted:true}}])expect(()=>parseDesktopLoginItemChange(value)).toThrow();
});

it('exposes the three login-item channels as harness-desktop channels',()=>{
 expect(DESKTOP_CHANNELS.loginItem).toBe('harness-desktop:login-item');
 expect(DESKTOP_CHANNELS.setLoginItem).toBe('harness-desktop:set-login-item');
 expect(DESKTOP_CHANNELS.openStartupApps).toBe('harness-desktop:open-startup-apps');
});

it('keeps the login-item bridge methods optional on DesktopBridge',()=>{
 const bridge:DesktopBridge={getContext:async()=>({windowId:'w',surface:{kind:'main'},windows:[]}),ready:async()=>({windowId:'w',surface:{kind:'main'},windows:[]}),detach:async()=>({id:'w',surface:{kind:'main'},ready:true,minimized:false}),reattach:async()=>{},minimize:async()=>{},resetBounds:async()=>{},focus:async()=>{},list:async()=>[],browser:async()=>{},signIn:async()=>{},onState:()=>()=>{},onCloseRequested:()=>()=>{}};
 expect(bridge.loginItem).toBeUndefined();
 expect(bridge.setLoginItem).toBeUndefined();
 expect(bridge.openStartupApps).toBeUndefined();
});
