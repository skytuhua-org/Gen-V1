import {useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {CompactSettings} from '../../apps/web/src/CompactSettings';
import type {LeaveGuardChannel} from '../../apps/web/src/Settings';
import {Modal} from '../../packages/ui-shell/Modal';
import '../../apps/web/src/styles.css';
import '../../apps/web/src/shell.css';

function Fixture() {
  const [open, setOpen] = useState(true);
  const leaveGuard = useRef<LeaveGuardChannel['current']>(null);
  const guardedClose = () => { const g = leaveGuard.current; if (g?.dirty()) { if (!g.pending()) g.confirm(() => setOpen(false)); } else setOpen(false); };
  return <div className="app-shell"><p>Synthetic appearance guard fixture</p><Modal open={open} title="Settings" className="settings-dialog" onClose={guardedClose}><CompactSettings scopeKey="guard" close={guardedClose} addResource={() => {}} leaveGuard={leaveGuard}/></Modal></div>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);
