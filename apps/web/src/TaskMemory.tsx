import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import type { Snapshot, TaskMemory as Note } from '../../../packages/contracts';
import { command } from './api';
import { journalRead, journalWrite, journalCompareAndSwap, journalGeneration } from './journal';
import './task-memory.css';

type Draft = { key: string; content: string; baseRevision: number };

/** Relative age for a saved-note header (static per render — no ticking).
 * Buckets: <60 s "just now"; <60 min "{m}m ago"; <24 h "{h}h ago";
 * <30 d "{d}d ago"; else the note's local-calendar YYYY-MM-DD. */
export function formatNoteAge(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return 'just now'; // future stamps read as fresh, never negative
  const minutes = Math.floor(seconds / 60); if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24); if (days < 30) return `${days}d ago`;
  const date = new Date(then);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function MemoryNote({ note, threadId, fresh = false, expanded = true, onExpandedChange, onDeleted, forgetRef }: { note: Note; threadId: string; fresh?: boolean; expanded?: boolean; onExpandedChange?: (value: boolean) => void; onDeleted?: (key: string) => void; forgetRef?: (node: HTMLButtonElement | null) => void }) {
  const [key, setKey] = useState(note.key), [content, setContent] = useState(note.content), [busy, setBusy] = useState(false), [busyAction, setBusyAction] = useState<null | 'save' | 'delete'>(null), [error, setError] = useState(''), [focusForget, setFocusForget] = useState(false), [dirtyUi, setDirtyUi] = useState(false);
  const [recovery, setRecovery] = useState<'pending' | 'failed' | 'ready'>('pending'), [attempt, setAttempt] = useState(0), [conflictOpen, setConflictOpen] = useState(false), [armUseSaved, setArmUseSaved] = useState(false);
  const generation = useRef(''), dirty = useRef(false), baseRevision = useRef(note.revision), draft = useRef<Draft | null>(null), inFlight = useRef<'save' | 'delete' | null>(null), alive = useRef(false), keyInput = useRef<HTMLInputElement>(null), bodyInput = useRef<HTMLTextAreaElement>(null), armTimer = useRef<ReturnType<typeof setTimeout> | null>(null), forgetButton = useRef<HTMLButtonElement | null>(null);
  // dirty stays a ref for async generation guards; dirtyUi mirrors it for rendering.
  const markDirty = (value: boolean) => { dirty.current = value; setDirtyUi(value); };
  const journalKey = `memory-draft:${threadId}:${fresh ? 'create' : 'saved:' + note.key}`;
  useEffect(() => {
    let current = true; alive.current = true; setRecovery('pending');
    void journalRead<Draft | null>(journalKey).then(saved => {
      if (!current) return;
      if (saved && !dirty.current) {
        setKey(saved.key); setContent(saved.content);
        baseRevision.current = Number.isSafeInteger(saved.baseRevision) ? saved.baseRevision : -1;
        generation.current = journalGeneration(journalKey) ?? ''; markDirty(true);
        if (fresh) onExpandedChange?.(true);
      }
      setRecovery('ready');
    }).catch(() => { if (current) setRecovery('failed'); });
    return () => { current = false; alive.current = false; };
  }, [journalKey, attempt, fresh, onExpandedChange]);
  useEffect(() => { if (!dirty.current) { setKey(note.key); setContent(note.content); baseRevision.current = note.revision; } }, [note.key, note.content, note.revision]);
  useEffect(() => { if (fresh && expanded && recovery === 'ready') keyInput.current?.focus(); }, [fresh, expanded, recovery]);
  const blocked = recovery !== 'ready';
  const conflicted = !fresh && dirty.current && note.revision !== baseRevision.current;
  useEffect(() => {
    // A confirmation can never authorize overwriting a different saved revision.
    setArmUseSaved(false);
    if (!conflicted) setConflictOpen(false);
    return () => { if (armTimer.current) { clearTimeout(armTimer.current); armTimer.current = null; } };
  }, [conflicted, note.key, note.revision]);
  const edit = (nextKey: string, nextContent: string) => {
    if (blocked || inFlight.current === 'delete') return;
    if (fresh && nextKey !== key) baseRevision.current = 0;
    markDirty(true); setKey(nextKey); setContent(nextContent);
    draft.current = { key: nextKey, content: nextContent, baseRevision: baseRevision.current };
    const write = journalWrite(journalKey, draft.current);
    generation.current = journalGeneration(journalKey) ?? '';
    const edited = generation.current;
    void write.catch(() => { if (alive.current && generation.current === edited) setError('Draft recovery could not be saved. Save this note before closing.'); });
  };
  const act = async (remove = false) => {
    if (blocked || inFlight.current) return;
    const submitted = generation.current, submittedRevision = baseRevision.current; inFlight.current = remove ? 'delete' : 'save'; setBusy(true); setBusyAction(inFlight.current); setError('');
    try {
      const receipt = await command(remove ? 'memory.delete' : 'memory.save', remove ? { key: note.key, baseRevision: submittedRevision } : { key, content, baseRevision: submittedRevision }, threadId);
      if (remove) onDeleted?.(note.key);
      if (submitted) await journalCompareAndSwap(journalKey, submitted, null);
      if (alive.current && generation.current === submitted) { markDirty(false); baseRevision.current = fresh ? 0 : (receipt.result as Note)?.revision ?? note.revision; if (fresh) { setKey(''); setContent(''); } }
      else if (alive.current && !remove && draft.current?.key === key && draft.current.baseRevision === submittedRevision) {
        // Keep later edits, but advance only the basis acknowledged for this same note.
        const saved = receipt.result as Note;
        if (saved?.key === key && saved.threadId === threadId && Number.isSafeInteger(saved.revision) && saved.revision > submittedRevision) {
          const edited = generation.current, retained = { ...draft.current, baseRevision: saved.revision };
          baseRevision.current = saved.revision; draft.current = retained;
          if (await journalCompareAndSwap(journalKey, edited, retained) && alive.current && generation.current === edited) generation.current = journalGeneration(journalKey) ?? '';
        }
      }
    } catch (cause) { if (alive.current) { setError(cause instanceof Error ? cause.message : 'The note could not be saved. Your draft is retained.'); if (remove) setFocusForget(true); } }
    finally { inFlight.current = null; if (alive.current) { setBusy(false); setBusyAction(null); } }
  };
  const revertToSaved = () => {
    const version = generation.current;
    markDirty(false); draft.current = null; baseRevision.current = note.revision;
    setKey(note.key); setContent(note.content); setError(''); setConflictOpen(false); setArmUseSaved(false);
    if (version) void journalCompareAndSwap(journalKey, version, null).then(cleared => { if (!cleared && alive.current) setError('The saved note is restored, but a newer unsaved draft is kept and may reappear on reload.'); }).catch(() => { if (alive.current) setError('Draft recovery could not be cleared.'); });
    bodyInput.current?.focus();
  };
  const useSaved = () => {
    if (!armUseSaved) {
      setArmUseSaved(true);
      if (armTimer.current) clearTimeout(armTimer.current);
      armTimer.current = setTimeout(() => { armTimer.current = null; setArmUseSaved(false); }, 4000);
      return;
    }
    if (armTimer.current) { clearTimeout(armTimer.current); armTimer.current = null; }
    revertToSaved();
  };
  // A failed delete returns focus to Forget once it is re-enabled (Chrome drops focus to body when the focused control is disabled in-flight).
  useEffect(() => { if (focusForget && !busy) { setFocusForget(false); forgetButton.current?.focus(); } }, [focusForget, busy]);
  const discard = () => {
    if (blocked || busy || inFlight.current) return;
    const version = generation.current;
    markDirty(false); draft.current = null; baseRevision.current = note.revision;
    setKey(note.key); setContent(note.content); setError('');
    if (version) void journalCompareAndSwap(journalKey, version, null).then(cleared => { if (!cleared && alive.current) setError('The saved note is restored, but a newer unsaved draft is kept and may reappear on reload.'); }).catch(() => { if (alive.current) setError('The saved note is restored, but the unsaved draft could not be cleared and may reappear on reload.'); });
    bodyInput.current?.focus();
  };
  const recoveryMessage = recovery === 'pending' ? <p className="memory-recovery muted" role="status">Checking for an unsaved note…</p> : recovery === 'failed' ? <div className="memory-recovery"><p role="status" className="error-text">Note recovery is unavailable. Retry before editing.</p><button type="button" className="secondary" onClick={() => setAttempt(value => value + 1)}>Retry</button></div> : null;
  if (fresh && !expanded) return <>{recoveryMessage}{dirtyUi && <button type="button" className="secondary memory-resume" onClick={() => onExpandedChange?.(true)}>Resume unsaved note</button>}</>;
  return <form className="memory-note" onSubmit={event => { event.preventDefault(); void act(); }} onKeyDown={event => { if (fresh && event.key === 'Escape' && !event.nativeEvent.isComposing) { event.preventDefault(); event.stopPropagation(); onExpandedChange?.(false); } }}>
    {fresh ? <label>Note key<input ref={keyInput} required pattern="[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}" maxLength={64} placeholder="e.g. date-format" value={key} disabled={blocked || inFlight.current === 'delete'} onChange={e => edit(e.target.value, content)} /></label> : <header><strong>{note.key}</strong><small>{note.author === 'agent' ? 'Agent note' : 'Your note'}{note.updatedAt && formatNoteAge(note.updatedAt) ? <> · <span title={note.updatedAt}>{formatNoteAge(note.updatedAt)}</span></> : null}</small></header>}
    <label><span className="sr-only">{fresh ? 'New thread note' : `Note ${note.key}`}</span><textarea ref={bodyInput} required rows={3} maxLength={768} disabled={blocked || inFlight.current === 'delete'} placeholder="A decision or constraint to remember…" value={content} onChange={e => edit(key, e.target.value)} /></label>
    {recoveryMessage}
    {error && <p role="status" className="error-text">{error}</p>}
    {conflicted && <div className="memory-conflict" role="status" aria-live="polite"><details open={conflictOpen} onToggle={event => setConflictOpen(event.currentTarget.open)}><summary>A newer saved note is available</summary><p>{note.content}</p><button type="button" className="secondary" style={armUseSaved ? { color: 'var(--danger)' } : undefined} disabled={blocked || busy} onClick={useSaved}>{armUseSaved ? 'Discard my edits and use saved note' : 'Use saved note'}</button></details></div>}
    <footer>{!fresh && dirtyUi && <button type="button" className="secondary" aria-label={`Discard unsaved changes to ${note.key}`} title="Revert to saved" disabled={busy} onClick={discard}>Discard changes</button>}{!fresh && <button ref={node => { forgetButton.current = node; forgetRef?.(node); }} type="button" className="icon-button" aria-busy={busyAction === 'delete' || undefined} aria-label={busyAction === 'delete' ? `Deleting ${note.key}` : `Forget ${note.key}`} disabled={blocked || busy} onClick={() => void act(true)}><Trash2 size={14} /></button>}{fresh && <button type="button" className="secondary" onClick={() => onExpandedChange?.(false)}>Cancel</button>}<button className="secondary" disabled={blocked || busy || !content.trim() || !key.trim()}>{busy ? (busyAction === 'delete' ? 'Deleting…' : fresh ? 'Adding…' : 'Saving…') : fresh ? 'Add note' : 'Save note'}</button></footer>
  </form>;
}
export function TaskMemory({ snapshot, threadId }: { snapshot: Snapshot; threadId?: string }) {
  const [addingThread, setAddingThread] = useState<string>();
  const [focusRequest, setFocusRequest] = useState(0);
  const view = useMemo(() => ({ threadId }), [threadId]), currentView = useRef<typeof view | null>(null);
  // A removed row may acknowledge later; only its committed thread view may hand off focus.
  useLayoutEffect(() => { currentView.current = view; return () => { if (currentView.current === view) currentView.current = null; }; }, [view]);
  const addButton = useRef<HTMLButtonElement>(null);
  const forgetButtons = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = useRef<{ thread: string; deletedKey: string; candidates: string[] } | null>(null);
  const setExpanded = useCallback((value: boolean) => { setAddingThread(value ? threadId : undefined); if (!value) addButton.current?.focus(); }, [threadId]);
  const adding = Boolean(threadId && addingThread === threadId);
  const notes = (snapshot.memory ?? []).filter(note => note.threadId === threadId);
  // Record the fallback focus order from the pre-delete list: next Forget, previous Forget, Add.
  const deleted = (key: string) => { if (currentView.current !== view) return; const order = notes.map(item => item.key); const index = order.indexOf(key); pendingFocus.current = { thread: threadId ?? '', deletedKey: key, candidates: [order[index + 1], order[index - 1], 'add'].filter((item): item is string => Boolean(item)) }; setFocusRequest(value => value + 1); };
  // Apply it once the post-delete snapshot renders; only focus a live node.
  useLayoutEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) return;
    if (pending.thread !== threadId) { pendingFocus.current = null; return; }
    if (notes.some(note => note.key === pending.deletedKey)) return;
    let target: HTMLButtonElement | null = null;
    for (const candidate of pending.candidates) { target = candidate === 'add' ? addButton.current : forgetButtons.current.get(candidate) ?? null; if (target) break; }
    if (target) {
      let current = true;
      const frame = requestAnimationFrame(() => {
        if (!current || pendingFocus.current !== pending || !target?.isConnected) return;
        pendingFocus.current = null; target.focus();
      });
      return () => { current = false; cancelAnimationFrame(frame); };
    }
  }, [notes, threadId, focusRequest]);
  return <section className="task-memory" aria-label="Thread memory"><header><BookOpen size={16} /><h3>Thread memory</h3>{notes.length >= 10 && <span>{notes.length}/12</span>}<button ref={addButton} className="icon-button" aria-label="Add memory note" aria-expanded={adding} disabled={!threadId || notes.length >= 12} onClick={() => setExpanded(!adding)}><Plus size={15} /></button></header>{!notes.length && !adding && <p className="muted">No saved notes.</p>}{threadId && notes.map(note => <MemoryNote key={`${threadId}:saved:${note.key}`} note={note} threadId={threadId} onDeleted={deleted} forgetRef={node => { if (node) forgetButtons.current.set(note.key, node); else forgetButtons.current.delete(note.key); }} />)}{threadId && <MemoryNote key={`${threadId}:create`} fresh expanded={adding} onExpandedChange={setExpanded} threadId={threadId} note={{ id: '', threadId, key: '', content: '', revision: 0, author: 'user', updatedAt: '' }} />}</section>;
}
