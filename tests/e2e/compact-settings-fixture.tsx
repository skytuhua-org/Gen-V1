import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {CompactSettings} from '../../apps/web/src/CompactSettings';
import {SettingsView} from '../../apps/web/src/Settings';
import {DesktopProvider} from '../../apps/web/src/desktop-context';
import type {DesktopBridge, DesktopContext} from '../../packages/desktop-contract';
import type {SettingsData} from '../../apps/web/src/settings-data';
import {Modal} from '../../packages/ui-shell/Modal';
import '../../apps/web/src/styles.css';
import '../../apps/web/src/shell.css';

function Fixture() {
  const [scope, setScope] = useState('personal-one'), [open, setOpen] = useState(true);
  const unlisted=Number(new URLSearchParams(location.search).get('unlisted'));
  const close=()=>setOpen(false);
  if(unlisted>0){
    // Exercise the presentation fallback independently from complete-page ingestion.
    const data:SettingsData={sequence:1,settings:{theme:'dark',modelId:null},accounts:[],skills:[],skillProposals:[],projects:[],resources:[],archivedThreads:[],
      counts:{threads:0,archivedThreads:unlisted,artifacts:0,resources:0,uncertainOperations:0}};
    return <Modal open={open} title="Settings" className="settings-dialog" onClose={close}>
      <SettingsView data={data} modelError="" draftReferences={async()=>({threads:[],skills:[],userStates:[],requests:[]})}
        refresh={async()=>{}} loadModels={async()=>{}} close={close} addResource={()=>{}} />
    </Modal>;
  }
  return <div className="app-shell"><p>Synthetic compact Settings consumer fixture</p><button onClick={() => setScope('personal-two')}>Change scope</button><Modal open={open} title="Settings" className="settings-dialog" onClose={() => setOpen(false)}><CompactSettings scopeKey={scope} close={() => setOpen(false)} addResource={() => {}} openBrowser={async url => {Object.assign(window, {openedUrl: url});}}/></Modal></div>;
}
const desktop = new URLSearchParams(location.search).has('desktop');
const context: DesktopContext = {windowId: 'settings-fixture', surface: {kind: 'main'}, windows: [], update: {state: 'idle', message: 'Up to date'}};
const bridge = {onState: () => () => {}, onCloseRequested: () => () => {}} as unknown as DesktopBridge;
createRoot(document.getElementById('root')!).render(desktop ? <DesktopProvider bridge={bridge} context={context}><Fixture/></DesktopProvider> : <Fixture/>);
