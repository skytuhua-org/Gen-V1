import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {SettingsTransfer} from '../../apps/web/src/SettingsTransfer';
import {Toaster} from '../../packages/ui-shell/Toast';
import {DEFAULT_PREFERENCES, type UiPreferences} from '../../packages/contracts/preferences';
import type {Theme} from '../../packages/contracts';

declare global {
  interface Window { commands?: {type: string; payload: Record<string, unknown>}[] }
}
window.commands = [];

function Fixture() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [preferences, setPreferences] = useState<UiPreferences>({...DEFAULT_PREFERENCES});
  const persist = async (payload: Record<string, unknown>) => {
    window.commands!.push({type: 'settings.update', payload});
    const patch = (payload.preferences ?? {}) as Partial<UiPreferences>;
    setPreferences(prev => ({...prev, ...patch, keybindings: {...prev.keybindings, ...(patch.keybindings ?? {})}}));
    if (typeof payload.theme === 'string') setTheme(payload.theme as Theme);
    return true;
  };
  return <div className="app-shell" data-theme={theme}>
    <p>Synthetic Settings file fixture</p>
    <output data-testid="send-shortcut">{preferences.sendShortcut}</output>
    <output data-testid="working-section">{String(preferences.showWorkingSection)}</output>
    <output data-testid="theme">{theme}</output>
    <section className="settings-row" data-setting-id="settings-transfer">
      <SettingsTransfer theme={theme} preferences={preferences} persist={persist}/>
    </section>
    <Toaster/>
  </div>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);
