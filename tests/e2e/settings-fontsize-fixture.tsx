import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {CompactSettings} from '../../apps/web/src/CompactSettings';
import {Modal} from '../../packages/ui-shell/Modal';
import '../../apps/web/src/styles.css';
import '../../apps/web/src/shell.css';

function Fixture() {
  const [open, setOpen] = useState(true);
  return <div className="app-shell"><p>Synthetic font-size fixture</p><Modal open={open} title="Settings" className="settings-dialog" onClose={() => setOpen(false)}><CompactSettings scopeKey="fontsize" close={() => setOpen(false)} addResource={() => {}}/></Modal></div>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);
