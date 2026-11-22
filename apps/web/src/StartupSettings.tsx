import {useEffect,useState} from 'react';
import {ExternalLink} from 'lucide-react';
import {useDesktop} from './desktop-context';
import {toast} from '../../../packages/ui-shell/Toast';
import type {DesktopLoginItemState} from '../../../packages/desktop-contract/index';

// "Start at sign-in" — Windows packaged desktop only. The switch mirrors the real
// OS login-item state, including Windows Startup-apps disablement; the persisted
// "start hidden" choice is applied by the main process at launch.
export function StartupSettings() {
  const desktop = useDesktop();
  const bridge = desktop?.bridge.loginItem && desktop.bridge.setLoginItem ? desktop.bridge : undefined;
  const [state, setState] = useState<DesktopLoginItemState | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!bridge?.loginItem) return;
    let alive = true;
    void bridge.loginItem().then(value => { if (alive) setState(value); }).catch(() => {});
    return () => { alive = false; };
  }, [bridge]);
  const change = async (openAtLogin: boolean, startHidden: boolean) => {
    if (!bridge?.setLoginItem || busy) return;
    setBusy(true);
    try { setState(await bridge.setLoginItem({ openAtLogin, startHidden })); }
    catch {
      toast("Couldn't change the sign-in setting. Windows didn't accept the change.", { tone: 'error' });
      await bridge.loginItem?.().then(setState).catch(() => {});
    } finally { setBusy(false); }
  };
  const available = state?.available === true;
  const effective = available && state.openAtLogin && state.enabledByWindows;
  return <section className="settings-row" data-setting-id="start-at-sign-in" aria-busy={busy || undefined}>
    <div className="settings-row-copy"><h2>Start at sign-in</h2>
      {!available && <p>Available in the installed app.</p>}
      {available && <p>Open Gen V1 when you sign in to Windows.
        {state.openAtLogin && !state.enabledByWindows && <> Windows disabled startup for this app — re-enable it or turn the switch on again. <button type="button" className="quiet" disabled={busy} onClick={() => void bridge!.openStartupApps?.().catch(() => {})}>Open Startup apps<ExternalLink size={12}/></button></>}
      </p>}
    </div>
    {available && <div className="settings-row-control">
      {effective && <span className="settings-inline-controls"><span className="settings-value">Start hidden in tray</span><button type="button" role="switch" className="settings-switch" aria-label="Start hidden in tray" aria-checked={state.startHidden} disabled={busy} onClick={() => void change(true, !state.startHidden)}><span/></button></span>}
      <button type="button" role="switch" className="settings-switch" aria-label="Start at sign-in" aria-checked={effective} disabled={busy} onClick={() => void change(!effective, state.startHidden)}><span/></button>
    </div>}
  </section>;
}
