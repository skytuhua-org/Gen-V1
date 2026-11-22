import {parseDesktopLoginItemChange,type DesktopLoginItemChange,type DesktopLoginItemState} from '../../packages/desktop-contract/index.ts';

export const LOGIN_ITEM_ARG='--gen-launched-at-login';
export const LOGIN_ITEM_NAME='Gen V1';

export interface LoginItemHost {
 isPackaged:boolean;
 platform:string;
 execPath:string;
 getLoginItemSettings(options:{path:string;args:string[]}):{openAtLogin?:boolean;launchItems?:{name:string;enabled?:boolean}[]};
 setLoginItemSettings(settings:{openAtLogin:boolean;path:string;args:string[];name:string;enabled:boolean}):void;
 openExternal(url:string):Promise<unknown>;
}

/** Windows sign-in state owned by the main process; testable with a stubbed host. */
export function createLoginItem(host:LoginItemHost,options:{available:boolean;readHidden:()=>boolean;writeHidden:(value:boolean)=>void}){
 const available=options.available;
 function read():DesktopLoginItemState{
  const startHidden=options.readHidden();
  if(!available)return {available:false,openAtLogin:false,enabledByWindows:true,startHidden};
  const settings=host.getLoginItemSettings({path:host.execPath,args:[LOGIN_ITEM_ARG]});
  const item=settings.launchItems?.find(entry=>entry.name===LOGIN_ITEM_NAME);
  return {available:true,openAtLogin:settings.openAtLogin===true,enabledByWindows:item?.enabled??true,startHidden};
 }
 return {
  read,
  set(change:DesktopLoginItemChange):DesktopLoginItemState{
   if(!available)throw Error('Start at sign-in is unavailable in this build.');
   host.setLoginItemSettings({openAtLogin:change.openAtLogin,path:host.execPath,args:[LOGIN_ITEM_ARG],name:LOGIN_ITEM_NAME,enabled:true});
   options.writeHidden(change.startHidden);
   const state=read();
   if(state.openAtLogin!==change.openAtLogin)throw Error('Windows did not accept the change.');
   return state;
  },
  parse:parseDesktopLoginItemChange,
  openStartupApps():Promise<unknown>{return host.openExternal('ms-settings:startupapps');},
 };
}
