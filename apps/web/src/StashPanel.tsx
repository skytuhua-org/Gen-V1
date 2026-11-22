import { useEffect, useRef, useState, type RefObject } from 'react';
import { Archive, ChevronRight, TriangleAlert } from 'lucide-react';
import { Popover } from '../../../packages/ui-shell/Popover';
import { Modal } from '../../../packages/ui-shell/Modal';
import { retainFocus } from '../../../packages/ui-shell/focus-retention';
import type { StashEntry, StashList } from '../../../packages/contracts/workspace-action-outcomes';
import type { GitStatus } from '../../../packages/workspace/tools.ts';
import { ApiError, authenticated, csrfToken, read } from './api.ts';
import { formatRelative } from './time-format.ts';

const get = <T,>(url: string, signal?: AbortSignal) => authenticated(() => fetch(url, { credentials: 'same-origin', cache: 'no-store', signal })).then(read<T>);
const post = <T,>(url: string, body: unknown) => authenticated(() => fetch(url, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'x-harness-csrf': csrfToken }, body: JSON.stringify(body) })).then(read<T>);
const message = (error: unknown) => error instanceof Error ? error.message : 'The project tool could not complete this request.';
const FILE_CAP = 8;

type StashAction = 'stash-apply' | 'stash-pop' | 'stash-drop';

/** Stash list + actions for the Changes panel; shares refs/stash across the
 * project's thread worktrees, so entries may have been made in another thread. */
export function StashPanel({ base, query, active, status, runActive, reload, trigger, open, setOpen }: {
  base: string; query: URLSearchParams; active: boolean; status: GitStatus | null; runActive: boolean;
  reload: () => Promise<void>; trigger: RefObject<HTMLButtonElement | null>; open: boolean; setOpen: (open: boolean) => void;
}) {
  const [stashes, setStashes] = useState<StashList | null>(null), [error, setError] = useState(''), generation = useRef(0);
  const [expanded, setExpanded] = useState<boolean | null>(null), [shown, setShown] = useState<string | null>(null), [showAll, setShowAll] = useState<string | null>(null);
  const [busy, setBusy] = useState(''), [arm, setArm] = useState(''), [conflicts, setConflicts] = useState<string[]>([]), [dropping, setDropping] = useState<StashEntry | null>(null);
  const [name, setName] = useState('');
  const section = useRef<HTMLElement>(null), input = useRef<HTMLInputElement>(null), rows = useRef(new Map<string, HTMLButtonElement>()), created = useRef(new Set<string>());
  const threadId = query.get('threadId') ?? undefined;

  const loadStashes = async (): Promise<void> => {
    const captured = ++generation.current;
    try { const next = await get<StashList>(base + '/git/stashes?' + query); if (captured === generation.current) setStashes(next); }
    catch (cause) { if (captured === generation.current) setError(message(cause)); }
  };
  useEffect(() => { if (active) void loadStashes(); return () => { generation.current++; }; });
  useEffect(() => { if (expanded === null && stashes) setExpanded(stashes.entries.length > 0); }, [expanded, stashes]);
  // Two-step confirm disarms on a timer and whenever the list it guards changes.
  useEffect(() => { setArm(''); }, [stashes?.stashRevision]);
  useEffect(() => { if (!arm) return; const timer = setTimeout(() => setArm(''), 5000); return () => clearTimeout(timer); }, [arm]);
  // Keep keyboard focus inside the section while rows appear/disappear.
  useEffect(() => { const document = section.current?.ownerDocument; if (!document) return; return retainFocus(document, () => section.current); }, [stashes]);

  const refresh = async () => { await reload(); await loadStashes(); };
  const postAction = async (type: string, payload: Record<string, unknown>) =>
    post<{ result: { status: GitStatus; result: { restored?: 'clean' | 'conflicts'; conflicts?: string[]; dropped?: boolean; created?: StashEntry } } }>(
      base + '/actions', { id: crypto.randomUUID(), type, payload, ...(threadId ? { threadId } : {}) });

  const create = async () => {
    if (!status || status.gitWrite !== true || busy) return;
    setBusy('stash-push'); setError('');
    try {
      const outcome = await postAction('stash-push', { revision: status.revision, expectedHead: status.head, message: name.trim() });
      if (outcome.result.result.created) created.current.add(outcome.result.result.created.oid);
      setOpen(false); setName(''); await refresh();
    } catch (cause) {
      setError(message(cause));
      if (cause instanceof ApiError && (cause.code === 'STASH_CHANGED' || cause.code === 'REVISION_CHANGED')) await refresh();
    } finally { setBusy(''); }
  };

  const focusAfterRemove = (oid: string) => {
    const entries = stashes?.entries ?? [], index = entries.findIndex(entry => entry.oid === oid);
    for (const entry of [...entries.slice(index + 1), ...entries.slice(0, index).reverse()]) {
      const button = rows.current.get(entry.oid); if (button) { button.focus(); return; }
    }
    trigger.current?.focus();
  };

  const act = async (entry: StashEntry, type: StashAction, armed = false) => {
    if (!status || status.gitWrite !== true || !stashes || busy) return;
    const key = type + ':' + entry.oid;
    if (!armed && arm !== key) { setArm(key); return; }
    setArm(''); setBusy(key); setError('');
    try {
      const outcome = await postAction(type, { revision: status.revision, expectedHead: status.head, oid: entry.oid, stashRevision: stashes.stashRevision });
      const result = outcome.result.result;
      setConflicts(result.restored === 'conflicts' ? result.conflicts ?? [] : []);
      if (type !== 'stash-apply') focusAfterRemove(entry.oid);
      await refresh();
    } catch (cause) {
      setError(message(cause));
      if (cause instanceof ApiError && (cause.code === 'STASH_CHANGED' || cause.code === 'REVISION_CHANGED')) await refresh();
    } finally { setBusy(''); }
  };

  if (!active || !stashes || (stashes.entries.length === 0 && conflicts.length === 0) || stashes.gitWrite === false) {
    return <>
      {open && status?.gitWrite === true && <StashCreate anchor={trigger} open={open} setOpen={setOpen} input={input} name={name} setName={setName} busy={busy === 'stash-push'} onSubmit={async () => { await create(); }} />}
    </>;
  }

  const entries = stashes?.entries ?? [];
  const labels: Record<StashAction, [string, string]> = { 'stash-apply': ['Apply', 'Applying'], 'stash-pop': ['Pop', 'Popping'], 'stash-drop': ['Drop', 'Dropping'] };
  const actionLabel = (entry: StashEntry, type: StashAction) =>
    busy === type + ':' + entry.oid ? labels[type][1] + '…' : arm === type + ':' + entry.oid ? labels[type][0] + '?' : labels[type][0];

  return <section className="stash-panel" ref={section} aria-label="Stashes">
    <div className="panel-toolbar stash-toolbar">
      <button type="button" className="stash-disclosure" aria-expanded={expanded === true} onClick={() => setExpanded(!(expanded === true))}>
        <ChevronRight size={12} className="stash-chevron" aria-hidden />Stashes{stashes ? <small> ({stashes.total})</small> : null}
      </button>
    </div>
    {error && <p role="status" className="error-text">{error}</p>}
    {conflicts.length > 0 && <div className="stash-conflict" role="status">
      <p><TriangleAlert size={14} aria-hidden /> <strong>Stash applied with conflicts</strong></p>
      <p><small>Resolve the marked paths, then stage or drop the stash entry.</small></p>
      <ul>{conflicts.map(path => <li key={path}><button type="button" onClick={() => setShown(null)}>{path}</button></li>)}</ul>
    </div>}
    {expanded === true && entries.length > 0 && <ul className="live-change-list stash-list">
      {entries.map(entry => <li key={entry.oid} data-inserted={created.current.has(entry.oid) || undefined}>
        <Archive size={14} className="stash-icon" aria-hidden />
        <span className="stash-name">
          <button type="button" className="stash-name-button" title={entry.message} aria-expanded={shown === entry.oid} onClick={() => setShown(shown === entry.oid ? null : entry.oid)}>{entry.message}</button>
          <small>{[entry.branch, formatRelative(entry.createdAt), entry.files.length + ' file' + (entry.files.length === 1 ? '' : 's')].filter(Boolean).join(' · ')}{entry.branch && entry.branch !== status?.branch ? ' · Made in another thread' : ''}</small>
        </span>
        <span className="stash-actions">
          <button type="button" disabled={Boolean(busy) || runActive || status?.gitWrite !== true} onClick={() => void act(entry, 'stash-apply')} ref={node => { if (node) rows.current.set(entry.oid, node); else rows.current.delete(entry.oid); }}>{actionLabel(entry, 'stash-apply')}</button>
          <button type="button" disabled={Boolean(busy) || runActive || status?.gitWrite !== true} onClick={() => void act(entry, 'stash-pop')}>{actionLabel(entry, 'stash-pop')}</button>
          <button type="button" className="stash-drop" disabled={Boolean(busy) || runActive || status?.gitWrite !== true} onClick={() => setDropping(entry)}>{'Drop'}</button>
        </span>
        {shown === entry.oid && <ul className="stash-files">
          {(showAll === entry.oid ? entry.files : entry.files.slice(0, FILE_CAP)).map(file => <li key={file.path}><code className="stash-file-status">{file.status}</code><span>{file.oldPath ? file.oldPath + ' → ' : ''}{file.path}</span>{file.untracked && <small>untracked</small>}</li>)}
          {entry.files.length > FILE_CAP && showAll !== entry.oid && <li><button type="button" onClick={() => setShowAll(entry.oid)}>+{entry.files.length - FILE_CAP} more</button></li>}
        </ul>}
      </li>)}
    </ul>}
    {open && status?.gitWrite === true && <StashCreate anchor={trigger} open={open} setOpen={setOpen} input={input} name={name} setName={setName} busy={busy === 'stash-push'} onSubmit={create} />}
    <Modal open={dropping !== null} title="Drop stash entry?" className="stash-drop-dialog" onClose={() => { if (!busy) setDropping(null); }}>
      {dropping && <form onSubmit={event => { event.preventDefault(); const entry = dropping; setDropping(null); void act(entry, 'stash-drop', true); }}>
        <p>Drop “{dropping.message}”? The stashed changes will not be recoverable.</p>
        <div className="stash-drop-actions"><button type="button" autoFocus disabled={Boolean(busy)} onClick={() => setDropping(null)}>Cancel</button><button type="submit" disabled={Boolean(busy)}>Drop</button></div>
      </form>}
    </Modal>
  </section>;
}

function StashCreate({ anchor, open, setOpen, input, name, setName, busy, onSubmit }: {
  anchor: RefObject<HTMLButtonElement | null>; open: boolean; setOpen: (open: boolean) => void;
  input: RefObject<HTMLInputElement | null>; name: string; setName: (name: string) => void; busy: boolean; onSubmit: () => Promise<void>;
}) {
  return <Popover anchor={anchor} open={open} width={280} height={132} preferredSide="below" align="end" initialFocus={input} onDismiss={() => { if (!busy) { setOpen(false); setName(''); } }} className="stash-create-popover">
    <form onSubmit={event => { event.preventDefault(); if (name.trim()) void onSubmit(); }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); setOpen(false); } }}>
      <label>Name<input ref={input} value={name} maxLength={200} required disabled={busy} onChange={event => setName(event.target.value)} placeholder="Describe the stash" /></label>
      <small>Includes untracked files. Staged changes come back unstaged.</small>
      <button type="submit" disabled={busy || !name.trim()}>{busy ? 'Stashing…' : 'Stash changes'}</button>
    </form>
  </Popover>;
}
