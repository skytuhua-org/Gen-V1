import {it,expect,vi} from 'vitest';
import {createLoginItem,LOGIN_ITEM_ARG,LOGIN_ITEM_NAME,type LoginItemHost} from '../apps/desktop/login-item.ts';
import {parseDesktopLoginItemChange} from '../packages/desktop-contract/index.ts';

function host(overrides:Partial<LoginItemHost>={}){
 const calls:{set?:Record<string,unknown>;external?:string}={};
 const stub:LoginItemHost={isPackaged:true,platform:'win32',execPath:'C:\\Users\\x\\AppData\\Local\\Programs\\Gen V1\\Gen V1.exe',
  getLoginItemSettings:()=>({openAtLogin:false,launchItems:[]}),
  setLoginItemSettings:settings=>{calls.set=settings as Record<string,unknown>;},
  openExternal:async url=>{calls.external=url;},
  ...overrides};
 return {stub,calls};
}

it('reports unavailable without touching the host when the build cannot register',()=>{
 const {stub}=host();const item=createLoginItem(stub,{available:false,readHidden:()=>true,writeHidden:()=>{throw Error('must not persist');}});
 expect(item.read()).toEqual({available:false,openAtLogin:false,enabledByWindows:true,startHidden:true});
 expect(()=>item.set({openAtLogin:true,startHidden:false})).toThrow(/unavailable/);
});

it('re-enables a login item Windows disabled and reports enabledByWindows=false until then',()=>{
 let open=false;
 const {stub,calls}=host({getLoginItemSettings:()=>({openAtLogin:open,launchItems:[{name:LOGIN_ITEM_NAME,enabled:open}]}),setLoginItemSettings:s=>{calls.set=s as Record<string,unknown>;open=s.openAtLogin;}});
 const item=createLoginItem(stub,{available:true,readHidden:()=>false,writeHidden:vi.fn()});
 expect(item.read()).toMatchObject({available:true,openAtLogin:false,enabledByWindows:false});
 item.set({openAtLogin:true,startHidden:false});
 expect(calls.set).toEqual({openAtLogin:true,path:stub.execPath,args:[LOGIN_ITEM_ARG],name:LOGIN_ITEM_NAME,enabled:true});
});

it('persists startHidden through the callback and re-reads the OS state',()=>{
 const writes:boolean[]=[];let open=false;
 const {stub}=host({getLoginItemSettings:()=>({openAtLogin:open,launchItems:[{name:LOGIN_ITEM_NAME,enabled:true}]}),setLoginItemSettings:s=>{open=s.openAtLogin;}});
 const item=createLoginItem(stub,{available:true,readHidden:()=>false,writeHidden:value=>writes.push(value)});
 expect(item.set({openAtLogin:true,startHidden:true})).toEqual({available:true,openAtLogin:true,enabledByWindows:true,startHidden:false});
 expect(writes).toEqual([true]);
});

it('throws when Windows refuses the login-item change',()=>{
 const {stub}=host({getLoginItemSettings:()=>({openAtLogin:false,launchItems:[]})});
 const item=createLoginItem(stub,{available:true,readHidden:()=>false,writeHidden:vi.fn()});
 expect(()=>item.set({openAtLogin:true,startHidden:false})).toThrow(/did not accept/);
});

it('opens the Windows Startup apps settings page',async()=>{
 const {stub,calls}=host();const item=createLoginItem(stub,{available:true,readHidden:()=>false,writeHidden:vi.fn()});
 await item.openStartupApps();
 expect(calls.external).toBe('ms-settings:startupapps');
});

it('uses the shared contract parser for renderer payloads',()=>{
 expect(()=>parseDesktopLoginItemChange({openAtLogin:true})).toThrow();
 expect(parseDesktopLoginItemChange({openAtLogin:true,startHidden:true})).toEqual({openAtLogin:true,startHidden:true});
});
