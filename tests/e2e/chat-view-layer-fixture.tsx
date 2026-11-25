import {createRoot} from 'react-dom/client';
import {ChatView} from '../../packages/ui-shell/ChatView';
import '../../apps/web/src/styles.css';
import '../../apps/web/src/shell.css';

// Minimal reproduction of the app shell's stacking fight: the chat slot and the
// right workspace panel are siblings, so the slot's `isolation:isolate` traps
// the floating surface's z-index and the panel (z-index 28) wins hit-testing.
createRoot(document.getElementById('root')!).render(<div style={{display:'flex',height:'100dvh',minWidth:0,position:'relative'}}>
 <ChatView header={<strong>Floating chat layer fixture</strong>}>
  <div className="conversation-scroll" tabIndex={0}><p>The detached chat must stay clickable above the right panel.</p></div>
  <div className="composer-dock"><form className="composer" onSubmit={event=>event.preventDefault()}><textarea aria-label="Message" defaultValue="Keep this draft"/></form></div>
 </ChatView>
 <aside className="workspace-right" aria-label="Workspace panel" style={{position:'absolute',top:80,right:0,bottom:0,width:360}}>
  <header className="workspace-right-header"><div role="tablist" aria-label="Workspace views"><button role="tab" aria-selected="true">Inspect</button></div></header>
  <p className="workspace-panel-content">Panel content that used to swallow the floating chat's pointer events.</p>
 </aside>
</div>);
