import {createRoot} from 'react-dom/client';
import {DesktopProvider} from '../../apps/web/src/desktop-context';
import {DesktopBrowserDock,DesktopBrowserSurface} from '../../apps/web/src/DesktopBrowser';
import type {DesktopBridge,DesktopBrowserCommand,DesktopContext,DesktopState} from '../../packages/desktop-contract';

declare global {interface Window {findCalls:DesktopBrowserCommand[];pushState:(state:DesktopState)=>void;findDetach:boolean}}
window.findCalls=[];window.findDetach=new URLSearchParams(location.search).has('detached');
let emit:(state:DesktopState)=>void=()=>{};
window.pushState=state=>emit(state);
const stateBase={url:'https://reading.example/page',title:'Synthetic reading page',canGoBack:true,canGoForward:false,loading:false};
const bridge={
 browser:async(command:DesktopBrowserCommand)=>{
  window.findCalls.push(command);
  if(command.type==='find-open'&&!window.findDetach)emit({windows:[],dockedBrowser:{browserId:'owned-browser',state:{...stateBase,find:{open:true,openRequest:1,query:'',ordinal:0,matches:0,searching:false}}}});
  if(command.type==='find-open'&&window.findDetach)emit({windows:[],browser:{...stateBase,find:{open:true,openRequest:1,query:'',ordinal:0,matches:0,searching:false}}});
 },
 onState:(listener:(state:DesktopState)=>void)=>{emit=listener;return()=>{emit=()=>{};};},
 onCloseRequested:()=>()=>{},
} as unknown as DesktopBridge;
const detached={windowId:'browser-window',surface:{kind:'browser',browserId:'owned-browser'},windows:[],browser:stateBase} as DesktopContext;
const docked={windowId:'main-window',surface:{kind:'main'},windows:[],dockedBrowser:{browserId:'owned-browser',state:stateBase}} as DesktopContext;
const context=window.findDetach?detached:docked;
createRoot(document.getElementById('root')!).render(<DesktopProvider bridge={bridge} context={context}>{window.findDetach?<DesktopBrowserSurface/>:<DesktopBrowserDock/>}</DesktopProvider>);
