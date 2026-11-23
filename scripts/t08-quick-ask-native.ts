// T08 native Windows acceptance driver for #1332 quick-ask.
// Run on Windows: `pnpm build && pnpm desktop:build`, then `pnpm exec tsx scripts/t08-quick-ask-native.ts`.
// Requires powershell.exe; grabs OS focus while running. Evidence: docs/evidence/quick-ask-t08/.
import {_electron,expect,type ElectronApplication,type Page} from '@playwright/test';
import {mkdtemp,mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync,spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {Store} from '../packages/storage/store.ts';
import {ProjectTools} from '../packages/workspace/tools.ts';
import {verificationPorts} from './portable-verification.ts';

const root=resolve('.'),directory=await mkdtemp(join(tmpdir(),'gen-qa-'));
const evidence=join(directory,'evidence');await mkdir(evidence,{recursive:true});
const [hostPort,widgetPort]=await verificationPorts();
const stamp=new Date().toISOString();
const store=new Store(join(directory,'host')),tools=new ProjectTools(store);
const git=(path:string,...args:string[])=>execFileSync('git',['-c','core.hooksPath='+join(directory,'empty-hooks'),'-c','commit.gpgsign=false','-C',path,...args],{windowsHide:true,encoding:'utf8'}).trim();
const source=join(directory,'projects','Alpha');await mkdir(source,{recursive:true});
git(source,'init');git(source,'config','user.name','QA fixture');git(source,'config','user.email','qa@example.invalid');
await writeFile(join(source,'README.md'),'alpha\n');git(source,'add','README.md');git(source,'commit','-m','baseline');
const threadId='qa-thread',thread={id:threadId,title:'QA prepared agent',projectName:null,createdAt:stamp,updatedAt:stamp,status:'ready',epoch:0,runId:null,modelId:null,sessionPath:null,kind:'main',presentation:{pinned:true}};
store.internal('qa.prepared-thread',threadId,()=>store.put('thread',threadId,threadId,thread));
await tools.connect({id:randomUUID(),type:'workspace.project.connect',payload:{name:'Alpha checkpoint',path:source,threadId}});
const projectId=store.get<any>('thread',threadId)!.projectId!;
store.internal('qa.settings',null,()=>store.put('settings','global',null,{theme:'dark',modelId:'test/model'}));
await tools.dispose();store.close();
console.log('FIXTURE projectId='+projectId+' dir='+directory);

const profile=join(directory,'profile');await mkdir(profile,{recursive:true});
const keep=/^(path|pathext|comspec|systemroot|windir|systemdrive|temp|tmp|processor_architecture|number_of_processors|lang|lc_all|psmodulepath|os)$/i;
const env=Object.fromEntries(Object.entries(process.env).filter(([k])=>keep.test(k))) as Record<string,string>;
Object.assign(env,{HOME:profile,USERPROFILE:profile,APPDATA:join(profile,'Roaming'),LOCALAPPDATA:join(profile,'Local'),HARNESS_DESKTOP_TEST_DATA_DIR:directory,HARNESS_DESKTOP_NODE_PATH:process.execPath,HARNESS_DESKTOP_HOST_ROOT:root,HARNESS_DESKTOP_PORT:String(hostPort),HARNESS_DESKTOP_WIDGET_PORT:String(widgetPort)});
delete env.ELECTRON_RUN_AS_NODE;delete env.NODE_OPTIONS;

const results:{name:string;passed:boolean;details?:string}[]=[];
const step=(name:string,passed:boolean,details?:string)=>{results.push({name,passed,details});console.log((passed?'PASS ':'FAIL ')+name+(details?' | '+details:''));};
const ps=(script:string)=>execFileSync('powershell.exe',['-NoProfile','-Command',script],{encoding:'utf8',windowsHide:true});
const FOREIGN_FOCUS=`$sig='using System;using System.Runtime.InteropServices;public class FG{[DllImport("user32.dll")]public static extern bool SetForegroundWindow(IntPtr h);}';Add-Type -TypeDefinition $sig;$p=Get-Process notepad -ErrorAction SilentlyContinue|Where-Object{$_.MainWindowHandle -ne 0}|Select-Object -First 1;if($p){[FG]::SetForegroundWindow($p.MainWindowHandle)|Out-Null;Write-Output 'FOCUSED'}else{Write-Output 'NO-NOTEPAD'}`;
const FG_TITLE=`$sig='using System;using System.Runtime.InteropServices;using System.Text;public class FW{[DllImport("user32.dll")]public static extern IntPtr GetForegroundWindow();[DllImport("user32.dll")]public static extern int GetWindowText(IntPtr h,StringBuilder s,int n);}';Add-Type -TypeDefinition $sig;$h=[FW]::GetForegroundWindow();$sb=New-Object System.Text.StringBuilder 256;[void][FW]::GetWindowText($h,$sb,256);Write-Output ($h.ToInt64().ToString()+'|'+$sb.ToString())`;
const ALT_SPACE=`Add-Type -AssemblyName System.Windows.Forms;[System.Windows.Forms.SendKeys]::SendWait('% ')`;
const HOTKEY_HOLDER=`$sig='using System;using System.Runtime.InteropServices;public class HK{[DllImport("user32.dll")]public static extern bool RegisterHotKey(IntPtr h,int id,uint m,uint k);[DllImport("user32.dll")]public static extern int GetMessageW(out MSG m,IntPtr w,uint a,uint b);public struct MSG{public IntPtr hwnd;public uint message;public IntPtr wParam;public IntPtr lParam;public uint time;public int x;public int y;}}';Add-Type -TypeDefinition $sig;if([HK]::RegisterHotKey([IntPtr]::Zero,1,1,0x20)){Write-Output 'HELD'}else{Write-Output 'FAILED'};[Console]::Out.Flush();$m=New-Object HK+MSG;while($true){[HK]::GetMessageW([ref]$m,[IntPtr]::Zero,0,0)|Out-Null;Start-Sleep -Milliseconds 30}`;

let app:ElectronApplication;let appLog='';
const qaInput=(p:Page)=>p.getByRole('textbox',{name:'Ask Gen V1',exact:true});
const surfaceOf=async(p:Page)=>{try{const r=await p.evaluate(()=>window.harnessDesktop?window.harnessDesktop.getContext().then(c=>c.surface.kind).catch(e=>'CTX:'+e.message):'NO-BRIDGE').catch(e=>'EVAL:'+e.message);if(r!=='quick-ask'&&r!=='main')console.log('surfaceOf',p.url().slice(0,90),'->',r);return r;}catch(e){return 'THROW:'+(e as Error).message;}};
const findQa=async()=>{for(const p of app.windows())if(await surfaceOf(p)==='quick-ask')return p;return undefined;};
const shot=async(p:Page,name:string)=>{try{await p.screenshot({path:join(evidence,name+'.png')});}catch(e){console.log('shot-fail',name,(e as Error).message);}};

try{
 let main!:Page;
 for(let attempt=1;;attempt++){
  app=await _electron.launch({args:[resolve('dist/desktop-app/main.mjs')],env,timeout:90000});
  const proc=app.process();
  proc.stderr?.on('data',b=>{appLog=(appLog+String(b)).slice(-8000);});proc.stdout?.on('data',b=>{appLog=(appLog+String(b)).slice(-8000);});
  proc.on('exit',c=>console.log('APP EXIT code='+c+' LOG='+appLog.slice(-2000)));
  try{main=await new Promise<Page>((ok,fail)=>{const t=setInterval(()=>{const m=app.windows().find(p=>p.url().startsWith('http://127.0.0.1:'+hostPort+'/'));if(m){clearInterval(t);ok(m);}},500);setTimeout(()=>{clearInterval(t);fail(Error('main window timeout; urls='+app.windows().map(p=>p.url())));},90000);});break;}
  catch(e){if(attempt>=3)throw e;console.log('boot attempt '+attempt+' failed, retrying: '+(e as Error).message.slice(0,200));try{await app.close();}catch{}}}
 app.on('window',p=>console.log('NEW-WINDOW',p.url().slice(0,110)));
 await expect(main.getByRole('textbox',{name:'Message',exact:true}).first()).toBeEnabled({timeout:60000});
 // Select the project-bound thread so quick-ask context has a project.
 await main.locator('.thread-item').filter({hasText:'QA prepared agent'}).click();
 await expect(main.locator('.workspace-header .breadcrumb strong')).toHaveText('QA prepared agent',{timeout:20000});
 await shot(main,'01-main-ready');
 step('app boots; project-bound thread selected',true);

 // C1: Settings -> Quick ask row, real UI toggle ON (R03/R04).
 await main.getByRole('button',{name:/Settings/i}).first().click();
 const qaRow=main.locator('[data-setting-id="quick-ask-enabled"]');
 await expect(qaRow).toBeVisible({timeout:20000});
 await qaRow.getByRole('switch').click();
 await expect(qaRow.getByRole('switch')).toHaveAttribute('aria-checked','true',{timeout:15000});
 const shortcutRow=main.locator('[data-setting-id="quick-ask-shortcut"]');
 await expect(shortcutRow).toBeVisible();
 await shot(main,'02-settings-quick-ask');
 step('Settings General: Quick ask rows render; toggle ON',true);
 await main.keyboard.press('Escape');
 const regState=await main.evaluate(()=>window.harnessDesktop!.setQuickAskConfig!({enabled:true,shortcut:'Alt+Space'}));
 step('setQuickAskConfig(Alt+Space) registration = ready',regState==='ready',String(regState));

 // C2: OS-level Alt+Space from a foreign window (Notepad).
 const notepad=spawn('notepad.exe',[],{stdio:'ignore'});
 let focus='';
 for(let i=0;i<6;i++){await new Promise(r=>setTimeout(r,1500));focus=ps(FOREIGN_FOCUS).trim();if(focus==='FOCUSED')break;}
 console.log('focus:',focus);
 ps(ALT_SPACE);
 const qa=await expect.poll(async()=>await findQa(),{timeout:30000}).toBeTruthy().then(()=>findQa()).catch(()=>undefined);
 if(!qa)throw Error('quick-ask window did not open on Alt+Space; windows='+app.windows().map(p=>p.url()));
 qa.on('console',m=>console.log('QA-CON',m.type(),m.text().slice(0,300)));qa.on('pageerror',e=>console.log('QA-ERR',e.message));
 try{await expect(qaInput(qa)).toBeVisible({timeout:20000});}catch(e){console.log('QA-BODY',await qa.locator('body').innerText().catch(()=>'<closed>'));throw e;}
 const qaWhere=await qa.locator('.quick-ask-where').textContent().catch(()=>null);
 await shot(qa,'03-quick-ask-open');
 step('Alt+Space from Notepad opens quick-ask (foreign focus)',/Alpha/.test(qaWhere??''),'where='+qaWhere);

 // C3a: REAL send attempt to a new thread against the live backend. No signed-in
 // subscription exists in the fixture, so the host must reject message.send —
 // this proves quick-ask reaches the real backend admission path (not a mock)
 // and that a failed send keeps the draft (error boundary, real code path).
 const commands:any[]=[];qa.on('request',req=>{if(req.url().includes('/api/commands')){try{commands.push(req.postDataJSON());}catch{}}});
 const qaWin=await app.browserWindow(qa);
 const qaVisible=async()=>{try{return await qaWin.evaluate(w=>w.isVisible());}catch{return false;}};
 const qaFocused=async()=>{try{return await qaWin.evaluate(w=>w.isFocused());}catch{return false;}};
 const qaHwnd=await qaWin.evaluate(w=>String(w.getNativeWindowHandle().readUInt32LE(0))).catch(()=>'?');
 console.log('qa HWND low32 =',qaHwnd);
 console.log('qa window focused at first open:',await qaFocused());
 await qaInput(qa).fill('Native QA: quick-ask send to new thread');
 await qa.keyboard.press('Enter');
 await expect.poll(()=>commands.length,{timeout:20000}).toBe(2);
 const alertText=await qa.locator('[role=alert]').textContent().catch(()=>null);
 await shot(qa,'03b-send-error');
 step('real send reaches live backend (thread.create + message.send)',commands.map(c=>c?.type).join(',')==='thread.create,message.send',JSON.stringify(commands.map(c=>({type:c?.type,threadId:c?.threadId,payload:c?.payload}))));
 step('unsigned send rejected by real backend; draft retained',/available|required|connect|Choose/i.test(alertText??'')&&(await qaInput(qa).inputValue())==='Native QA: quick-ask send to new thread','alert='+alertText);
 await qa.keyboard.press('Escape');
 await expect.poll(qaVisible,{timeout:10000}).toBe(false);

 // Lab stubs (no subscription credentials exist on this host): /api/models on
 // the main window so currentThreadSendable becomes true, and /api/commands on
 // the quick-ask window so the send completes. Everything else — global hotkey,
 // window lifecycle, focus handoff, IPC, error path — is real native code.
 await main.route('**/api/models*',route=>{void route.fulfill({json:{models:[{id:'test/model',provider:'test',name:'Lab fixture model'}]}});});
 const stubbed:any[]=[];
 await qa.route('**/api/commands',route=>{const c=route.request().postDataJSON();stubbed.push(c);void route.fulfill({json:{commandId:c.id,seq:900+stubbed.length,result:c.type==='thread.create'?{id:'native-thread-1'}:{}}});});
 await main.reload();
 await expect(main.getByRole('textbox',{name:'Message',exact:true}).first()).toBeEnabled({timeout:60000});
 await main.locator('.thread-item').filter({hasText:'QA prepared agent'}).click();
 await expect(main.locator('.workspace-header .breadcrumb strong')).toHaveText('QA prepared agent',{timeout:20000});
 await main.waitForTimeout(1500);

 // C3b: send to a NEW thread -> thread.create + message.send; quick-ask hides;
 // main window focused.
 ps(FOREIGN_FOCUS);ps(ALT_SPACE);
 await expect.poll(qaVisible,{timeout:15000}).toBe(true);
 await expect(qaInput(qa)).toBeVisible({timeout:15000});
 await qaInput(qa).fill('Native QA: quick-ask send to new thread');
 await qa.keyboard.press('Enter');
 await expect.poll(qaVisible,{timeout:15000}).toBe(false);
 step('send to new thread -> quick-ask hides (receipt stubbed; IPC/native path real)',stubbed.map(c=>c?.type).join(',')==='thread.create,message.send',JSON.stringify(stubbed.map(c=>c?.type)));
 await expect.poll(()=>app.evaluate(({BrowserWindow})=>BrowserWindow.getFocusedWindow()?.getTitle()??'none'),{timeout:15000}).toBe('Gen V1');
 await shot(main,'04-after-send');
 step('main window focused after send',true);

 // C3c: send to the CURRENT thread (prepared thread is selected in main).
 await main.locator('.thread-item').filter({hasText:'QA prepared agent'}).click().catch(()=>{});
 await main.waitForTimeout(800);
 ps(FOREIGN_FOCUS);ps(ALT_SPACE);
 await expect.poll(qaVisible,{timeout:15000}).toBe(true);
 await expect(qaInput(qa)).toBeVisible({timeout:15000});
 const currentRadio=qa.getByRole('radio',{name:'Current thread',exact:true});
 let sendable=false;
 for(let i=0;i<10&&!sendable;i++){
  if(await currentRadio.isEnabled().catch(()=>false)){try{await currentRadio.click({timeout:4000});sendable=true;}catch{await qa.waitForTimeout(800);}}
  else await qa.waitForTimeout(800);
 }
 if(sendable){
  await qaInput(qa).fill('Native QA: quick-ask send to current thread');
  stubbed.length=0;
  await qa.keyboard.press('Enter');
  await expect.poll(qaVisible,{timeout:15000}).toBe(false);
  step('send to current thread -> single message.send bound to current thread',stubbed.length===1&&stubbed[0]?.type==='message.send'&&stubbed[0]?.threadId===threadId,JSON.stringify(stubbed.map(c=>({type:c?.type,threadId:c?.threadId}))));
 }else step('send to current thread -> single message.send bound to current thread',false,'current-thread radio not sendable (thread busy or no current context)');
 await expect.poll(()=>app.evaluate(({BrowserWindow})=>BrowserWindow.getFocusedWindow()?.getTitle()??'none'),{timeout:15000}).toBe('Gen V1');
 step('main window focused after current-thread send',true);

 // C4: draft survives hide-by-Escape and hide-by-blur; reopen restores it.
 console.log('c4-focus-1:',ps(FOREIGN_FOCUS).trim());ps(ALT_SPACE);
 await expect.poll(qaVisible,{timeout:15000}).toBe(true);
 await expect(qaInput(qa)).toBeVisible({timeout:15000});
 await qaInput(qa).fill('draft that must survive');
 await qa.keyboard.press('Escape');
 await expect.poll(qaVisible,{timeout:10000}).toBe(false);
 step('Escape hides quick-ask',true);
 ps(FOREIGN_FOCUS);ps(ALT_SPACE);
 await expect.poll(qaVisible,{timeout:10000}).toBe(true);
 console.log('qa window focused at reopen:',await qaFocused(),'osForeground='+ps(FG_TITLE).trim()+' qaHwnd='+qaHwnd);
 const draftVal=await qaInput(qa).inputValue();
 await shot(qa,'05-draft-preserved');
 console.log('c4-focus-2:',ps(FOREIGN_FOCUS).trim());
 step('reopen preserves draft after Escape',draftVal==='draft that must survive',draftVal);
 // Real user blur: move OS focus to the main Gen V1 window via the Electron
 // API — a genuine OS focus change that drops DOM focus on the quick-ask
 // surface. (Alt+Tab from a background helper is nondeterministic: it restores
 // whichever window is next in the MRU order, including unrelated apps.)
 const mainBrowserWin=await app.browserWindow(main);
 await mainBrowserWin.evaluate(w=>{if(w.isMinimized())w.restore();w.show();w.focus();});
 await main.waitForTimeout(800);
 console.log('blur-diag: qaFocused='+await qaFocused()+' domFocus='+await qa.evaluate(()=>document.hasFocus()).catch(()=>'?')+' osForeground='+ps(FG_TITLE).trim()+' qaHwnd='+qaHwnd);
 const blurred=await expect.poll(qaVisible,{timeout:8000}).toBe(false).then(()=>true).catch(()=>false);
 step('focus loss (Alt+Tab blur) hides quick-ask',blurred);
 console.log('c4-focus-3:',ps(FOREIGN_FOCUS).trim());ps(ALT_SPACE);
 await expect.poll(qaVisible,{timeout:10000}).toBe(true);
 const draftVal2=await qaInput(qa).inputValue();
 step('reopen preserves draft after blur-hide',draftVal2==='draft that must survive',draftVal2);
 await qa.keyboard.press('Escape');
 await expect.poll(qaVisible,{timeout:10000}).toBe(false);

 // C5: chord held by another process -> registration 'in-use'. Gen must release
 // its own registration first: RegisterHotKey in the holder fails outright while
 // Electron owns the chord, which produced a false 'ready' on the first run.
 await main.evaluate(()=>window.harnessDesktop!.setQuickAskConfig!({enabled:false,shortcut:'Alt+Space'}));
 await new Promise(r=>setTimeout(r,500));
 const holder=spawn('powershell.exe',['-NoProfile','-Command',HOTKEY_HOLDER],{stdio:['ignore','pipe','pipe'],windowsHide:true});
 const held=await new Promise<string>(ok=>{let out='';holder.stdout!.on('data',d=>{out+=d;if(/HELD|FAILED/.test(out))ok(out.trim());});setTimeout(()=>ok(out.trim()||'timeout'),6000);});
 console.log('hotkey-holder:',held);
 const conflict=await main.evaluate(()=>window.harnessDesktop!.setQuickAskConfig!({enabled:true,shortcut:'Alt+Space'}));
 step('chord held by other app -> setQuickAskConfig returns in-use',conflict==='in-use','holder='+held+' result='+String(conflict));
 await main.getByRole('button',{name:/Settings/i}).first().click();
 await expect(shortcutRow).toBeVisible({timeout:20000});
 const statusText=await shortcutRow.textContent().catch(()=>null);
 await shot(main,'06-in-use-status');
 step('settings shortcut row shows in-use status',/use|conflict|another|available/i.test(statusText??''),statusText?.slice(0,160));
 await main.keyboard.press('Escape');
 holder.kill('SIGKILL');
 await new Promise(r=>setTimeout(r,1000));
 const recovered=await main.evaluate(()=>window.harnessDesktop!.setQuickAskConfig!({enabled:true,shortcut:'Alt+Space'}));
 step('chord re-registers after foreign holder exits',recovered==='ready',String(recovered));

 // C6: quit -> chord released (another process can register it).
 await app.close();
 await new Promise(r=>setTimeout(r,1500));
 const probe=spawn('powershell.exe',['-NoProfile','-Command',`$sig='using System;using System.Runtime.InteropServices;public class HK2{[DllImport("user32.dll")]public static extern bool RegisterHotKey(IntPtr h,int id,uint m,uint k);}';Add-Type -TypeDefinition $sig;if([HK2]::RegisterHotKey([IntPtr]::Zero,1,1,0x20)){Write-Output 'FREE'}else{Write-Output 'STILL-HELD'}`],{stdio:['ignore','pipe','pipe'],windowsHide:true});
 const freed=await new Promise<string>(ok=>{let out='';probe.stdout!.on('data',d=>out+=d);probe.on('exit',()=>ok(out.trim()));setTimeout(()=>ok('timeout'),6000);});
 step('quit releases chord (other app registers)',freed.includes('FREE'),freed);
 notepad.kill();
 console.log('RESULTS '+JSON.stringify(results));
 console.log('EVIDENCE '+evidence);
 process.exit(results.every(r=>r.passed)?0:1);
}catch(e){
 console.error('DRIVER-FAIL',e,'\nAPPLOG='+appLog.slice(-3000));
 try{await app!?.close();}catch{}
 console.log('RESULTS '+JSON.stringify(results));
 console.log('EVIDENCE '+evidence);
 process.exit(2);
}
