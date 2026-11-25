import {Fragment,useRef,useState,type CSSProperties} from 'react';
import {AlertTriangle,Download,Upload,Undo2} from 'lucide-react';
import {version} from '../../../package.json';
import type {PreferencePatch,UiPreferences} from '../../../packages/contracts/preferences.ts';
import {SETTINGS_FILE_LIMIT,buildSettingsFile,diffSettings,patchFromChanges,parseSettingsFile,type ImportIssue,type ParsedSettingsFile,type SettingChange,type Theme} from '../../../packages/contracts/settings-transfer.ts';
import {settingLabel,formatSettingValue,isColorValue} from './settings-transfer-labels';
import {useDesktop} from './desktop-context';
import {Modal} from '../../../packages/ui-shell/Modal';
import {toast} from '../../../packages/ui-shell/Toast';

const same = (left: unknown, right: unknown) => left === right || JSON.stringify(left) === JSON.stringify(right);
const issueReason = (issue: ImportIssue) => issue.reason === 'not-portable' ? 'Not a portable setting' : issue.reason === 'unknown' ? 'Unknown setting' : issue.reason === 'invalid' ? 'Invalid value' : `Shortcut conflicts with ${settingLabel('keybindings.' + issue.conflictWith)}`;

interface PendingImport { fileName: string; parsed: Extract<ParsedSettingsFile, { ok: true }>; changes: SettingChange[]; unchanged: number; issues: ImportIssue[] }

export function SettingsTransfer({theme, preferences, persist}: {theme: Theme; preferences: UiPreferences; persist: (payload: Record<string, unknown>) => Promise<boolean>}) {
  const desktop = useDesktop(), file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false), [status, setStatus] = useState(''), [error, setError] = useState('');
  const [pending, setPending] = useState<PendingImport | null>(null), [applyError, setApplyError] = useState('');
  const [lastImport, setLastImport] = useState<{before: ReturnType<typeof patchFromChanges>; after: ReturnType<typeof patchFromChanges>; count: number} | null>(null);
  const latest = useRef({theme, preferences}); latest.current = {theme, preferences};
  const lastRef = useRef(lastImport); lastRef.current = lastImport;

  const exportSettings = async () => {
    setBusy(true); setStatus(''); setError('');
    try {
      const now = new Date(), text = buildSettingsFile({theme: latest.current.theme, preferences: latest.current.preferences, now, appVersion: version});
      const filename = `gen-settings-${now.toISOString().slice(0, 10)}.json`;
      if (desktop?.bridge.exportSettings) {
        const result = await desktop.bridge.exportSettings(text, filename);
        if (result.status === 'saved') setStatus('Settings saved to file.');
      } else {
        const url = URL.createObjectURL(new Blob([text], {type: 'application/json'})), link = document.createElement('a');
        link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        setStatus('Settings file downloaded.');
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'The settings file could not be saved.'); }
    finally { setBusy(false); }
  };

  const readFile = async (selected: File) => {
    setStatus(''); setError(''); setApplyError('');
    if (selected.size > SETTINGS_FILE_LIMIT) { setError('Choose a settings file no larger than 64 KB.'); return; }
    let text: string;
    try { text = await selected.text(); } catch { setError('Couldn\'t read this file.'); return; }
    const parsed = parseSettingsFile(text);
    if (!parsed.ok) {
      setError(parsed.error === 'too-large' ? 'Choose a settings file no larger than 64 KB.' : parsed.error === 'unreadable' ? 'Couldn\'t read this file.' : parsed.error === 'newer-version' ? 'This file was made by a newer version of Gen. Update Gen to import it.' : 'This file isn\'t a Gen settings file.');
      return;
    }
    const diff = diffSettings(latest.current, parsed);
    setPending({fileName: selected.name, parsed, ...diff});
  };

  const apply = async () => {
    if (!pending) return;
    const diff = diffSettings(latest.current, pending.parsed);
    if (!same(diff.changes, pending.changes) || !same(diff.issues, pending.issues) || diff.unchanged !== pending.unchanged) {
      setPending({...pending, ...diff});
      setApplyError('Settings changed while this preview was open. Review the updated changes before applying.');
      return;
    }
    const before = patchFromChanges(pending.changes, 'before'), after = patchFromChanges(pending.changes, 'after');
    setBusy(true); setApplyError('');
    const ok = await persist({...(after.theme !== undefined ? {theme: after.theme} : {}), preferences: after.preferences});
    setBusy(false);
    if (!ok) { setApplyError('Couldn\'t apply the imported settings. Nothing was changed.'); return; }
    setLastImport({before, after, count: pending.changes.length}); setPending(null);
    toast(`Imported ${pending.changes.length} ${pending.changes.length === 1 ? 'setting' : 'settings'}`, {action: {label: 'Undo', onClick: () => void undo()}, durationMs: 10000});
  };

  const undo = async () => {
    const record = lastRef.current; if (!record) return;
    const current = latest.current, restore: Record<string, unknown> = {};
    let restored = 0;
    for (const [key, value] of Object.entries(record.after.preferences)) {
      if (key === 'keybindings' && value && typeof value === 'object') {
        const currentKeys = current.preferences.keybindings, afterKeys = value as UiPreferences['keybindings'], beforeKeys = record.before.preferences.keybindings ?? {};
        const members: Record<string, string> = {};
        for (const member of Object.keys(afterKeys)) if (same(currentKeys[member as keyof typeof currentKeys], afterKeys[member as keyof typeof afterKeys])) { members[member] = beforeKeys[member as keyof typeof beforeKeys]!; restored++; }
        if (Object.keys(members).length) restore.keybindings = members;
      } else if (same(current.preferences[key as keyof UiPreferences], value)) { restore[key] = record.before.preferences[key as keyof UiPreferences]; restored++; }
    }
    const themeRestore = record.after.theme !== undefined && same(current.theme, record.after.theme) ? record.before.theme : undefined;
    if (themeRestore !== undefined) restored++;
    const kept = record.count - restored;
    const qualified = diffSettings(current, {ok: true, patch: restore as PreferencePatch, theme: themeRestore, issues: []});
    const after = patchFromChanges(qualified.changes, 'after');
    const conflicts = qualified.issues.filter(issue => issue.reason === 'conflict').length;
    setBusy(true);
    const ok = await persist({...(after.theme !== undefined ? {theme: after.theme} : {}), ...(Object.keys(after.preferences).length ? {preferences: after.preferences} : {})});
    setBusy(false);
    if (!ok) { setError('Couldn\'t undo the import.'); return; }
    setLastImport(null); toast('Import undone');
    setStatus([
      ...(kept > 0 ? [`Kept ${kept} ${kept === 1 ? 'setting' : 'settings'} you changed after importing.`] : []),
      ...(conflicts > 0 ? [`Kept ${conflicts} ${conflicts === 1 ? 'shortcut' : 'shortcuts'} to avoid conflicts with current settings.`] : []),
    ].join(' '));
  };

  const subtitle = pending ? 'From ' + [pending.fileName, pending.parsed.exportedAt ? `exported ${new Date(pending.parsed.exportedAt).toLocaleDateString()}` : '', pending.parsed.appVersion ? `Gen ${pending.parsed.appVersion}` : ''].filter(Boolean).join(' · ') : '';
  const groups = [...new Set(pending?.changes.map(change => change.group) ?? [])];

  return <>
    <div className="settings-row-copy"><h2>Settings file</h2><p>Save your appearance, shortcuts, composer, diff and notification choices to a file, or load them on another PC. Accounts, keys and project paths are never included.</p>
      {status && <p role="status" className="settings-value">{status}</p>}{error && <p role="alert" className="error-text">{error}</p>}</div>
    <div className="settings-row-control settings-transfer-controls">
      <button type="button" className="secondary" disabled={busy} onClick={() => void exportSettings()}><Download size={16} aria-hidden="true"/>Export…</button>
      <button type="button" className="secondary" disabled={busy} onClick={() => file.current?.click()}><Upload size={16} aria-hidden="true"/>Import…</button>
      <input ref={file} hidden type="file" accept="application/json,.json" aria-label="Settings file" onChange={event => { const selected = event.currentTarget.files?.[0]; event.currentTarget.value = ''; if (selected) void readFile(selected); }}/>
      {lastImport && <button type="button" className="quiet settings-transfer-undo" disabled={busy} onClick={() => void undo()}><Undo2 size={16} aria-hidden="true"/>Undo import</button>}
    </div>
    <Modal open={pending !== null} title="Import settings" className="settings-transfer-modal" onClose={() => { setPending(null); setApplyError(''); }}>
      {pending && (pending.changes.length === 0
        ? <><p className="settings-transfer-subtitle">{subtitle}</p><p>Your settings already match this file.</p>
            {pending.issues.length > 0 && <h3>Ignored ({pending.issues.length})</h3>}
            {pending.issues.length > 0 && <ul className="settings-transfer-ignored">{pending.issues.map((issue, index) => <li key={index}><AlertTriangle size={14} aria-hidden="true"/>{settingLabel(issue.key)} — {issueReason(issue)}</li>)}</ul>}
            {applyError && <p role="alert" className="error-text">{applyError}</p>}
            <div className="settings-transfer-footer"><button type="button" className="primary" onClick={() => setPending(null)}>Close</button></div></>
        : <>
            <p className="settings-transfer-subtitle">{subtitle}</p>
            <h3>Will change ({pending.changes.length})</h3>
            <table className="settings-transfer-changes"><thead><tr><th scope="col">Setting</th><th scope="col">Current</th><th scope="col">New</th></tr></thead><tbody>
              {groups.map(group => <Fragment key={group}>{group !== 'Theme' && <tr className="settings-transfer-group"><th scope="colgroup" colSpan={3}>{group}</th></tr>}
                {pending.changes.filter(change => change.group === group).map((change, index) => <tr className="settings-transfer-change" key={change.key} style={{'--stagger': Math.min(index, 9)} as CSSProperties}>
                  <th scope="row">{settingLabel(change.key)}</th>
                  <td>{isColorValue(change.key, change.before) && <span className="settings-transfer-swatch" style={{'--swatch': change.before} as CSSProperties}/>}{formatSettingValue(change.key, change.before)}</td>
                  <td className="settings-transfer-new">{isColorValue(change.key, change.after) && <span className="settings-transfer-swatch" style={{'--swatch': change.after} as CSSProperties}/>}{formatSettingValue(change.key, change.after)}</td>
                </tr>)}</Fragment>)}
            </tbody></table>
            {pending.unchanged > 0 && <details className="settings-transfer-same"><summary>Already the same ({pending.unchanged})</summary></details>}
            {pending.issues.length > 0 && <><h3>Ignored ({pending.issues.length})</h3><ul className="settings-transfer-ignored">{pending.issues.map((issue, index) => <li key={index}><AlertTriangle size={14} aria-hidden="true"/>{settingLabel(issue.key)} — {issueReason(issue)}</li>)}</ul></>}
            {applyError && <p role="alert" className="error-text" title={applyError}>{applyError}</p>}
            <div className="settings-transfer-footer"><button type="button" className="secondary" disabled={busy} onClick={() => setPending(null)}>Cancel</button><button type="button" className="primary" disabled={busy} onClick={() => void apply()}>Apply {pending.changes.length} {pending.changes.length === 1 ? 'change' : 'changes'}</button></div>
          </>)}
    </Modal>
  </>;
}
