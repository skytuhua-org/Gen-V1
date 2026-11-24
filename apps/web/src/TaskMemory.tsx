import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import type { Snapshot, TaskMemory as Note } from '../../../packages/contracts';
import { command } from './api';
import { journalRead, journalWrite, journalCompareAndSwap, journalGeneration } from './journal';
import './task-memory.css';

type Draft = { key: string; content: string; baseRevision: number };
const MEMORY_KEY_RE = /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}$/;
/** Route a save failure to its field: INVALID_MEMORY is shared by key and content validation. */
export function memoryErrorField(cause: unknown, key: string): 'key' | 'content' | null {
  if (!(cause instanceof Error)) return null;
  if ((cause as { code?: unknown }).code !== 'INVALID_MEMORY') return null;
  return MEMORY_KEY_RE.test(key) ? 'content' : 'key';
}
function MemoryNote({ note, threadId, fresh = false, expanded = true, onExpandedChange }: { note: Note; threadId: string; fresh?: boolean; expanded?: boolean; onExpandedChange?: (value: boolean) => void }) {
  const [key, setKey] = useState(note.key), [content, setContent] = useState(note.content), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [recovery, setRecovery] = useState<'pending' | 'failed' | 'ready'>('pending'), [attempt, setAttempt] = useState(0);
  const [keyError, setKeyError] = useState(''), [contentError, setContentError] = useState('');
  const generation = useRef(''), dirty = useRef(false), baseRevision = useRef(note.revision), draft = useRef<Draft | null>(null), inFlight = useRef<'save' | 'delete' | null>(null), alive = useRef(false), keyInput = useRef<HTMLInputElement>(null), contentInput = useRef<HTMLTextAreaElement>(null);
  const uid = useId(), keyErrorId = `memory-key-error-${uid}`, contentErrorId = `memory-content-error-${uid}`;
  const journalKey = `memory-draft:${threadId}:${fresh ? 'create' : 'saved:' + note.key}`;
  useEffect(() => {
    let current = true; alive.current = true; setRecovery('pending');
    void journalRead<Draft | null>(journalKey).then(saved => {
      if (!current) return;
      if (saved && !dirty.current) {
        setKey(saved.key); setContent(saved.content);
        baseRevision.current = Number.isSafeInteger(saved.baseRevision) ? saved.baseRevision : -1;
        generation.current = journalGeneration(journalKey) ?? ''; dirty.current = true;
        if (fresh) onExpandedChange?.(true);
      }
      setRecovery('ready');
    }).catch(() => { if (current) setRecovery('failed'); });
    return () => { current = false; alive.current = false; };
  }, [journalKey, attempt, fresh, onExpandedChange]);
  useEffect(() => { if (!dirty.current) { setKey(note.key); setContent(note.content); baseRevision.current = note.revision; } }, [note.key, note.content, note.revision]);
  useEffect(() => { if (fresh && expanded && recovery === 'ready') keyInput.current?.focus(); }, [fresh, expanded, recovery]);
  const blocked = recovery !== 'ready';
  const edit = (nextKey: string, nextContent: string) => {
    if (blocked || inFlight.current === 'delete') return;
    if (fresh && nextKey !== key) baseRevision.current = 0;
    dirty.current = true; setKey(nextKey); setContent(nextContent);
    if (nextKey !== key) setKeyError('');
    if (nextContent !== content) setContentError('');
    draft.current = { key: nextKey, content: nextContent, baseRevision: baseRevision.current };
    const write = journalWrite(journalKey, draft.current);
    generation.current = journalGeneration(journalKey) ?? '';
    const edited = generation.current;
    void write.catch(() => { if (alive.current && generation.current === edited) setError('Draft recovery could not be saved. Save this note before closing.'); });
  };
  const act = async (remove = false) => {
    if (blocked || inFlight.current) return;
    const submitted = generation.current, submittedRevision = baseRevision.current; inFlight.current = remove ? 'delete' : 'save'; setBusy(true); setError(''); setKeyError(''); setContentError('');
    try {
      const receipt = await command(remove ? 'memory.delete' : 'memory.save', remove ? { key: note.key, baseRevision: submittedRevision } : { key, content, baseRevision: submittedRevision }, threadId);
      if (submitted) await journalCompareAndSwap(journalKey, submitted, null);
      if (alive.current && generation.current === submitted) { dirty.current = false; baseRevision.current = fresh ? 0 : (receipt.result as Note)?.revision ?? note.revision; if (fresh) { setKey(''); setContent(''); } }
      else if (alive.current && !remove && draft.current?.key === key && draft.current.baseRevision === submittedRevision) {
        // Keep later edits, but advance only the basis acknowledged for this same note.
        const saved = receipt.result as Note;
        if (saved?.key === key && saved.threadId === threadId && Number.isSafeInteger(saved.revision) && saved.revision > submittedRevision) {
          const edited = generation.current, retained = { ...draft.current, baseRevision: saved.revision };
          baseRevision.current = saved.revision; draft.current = retained;
          if (await journalCompareAndSwap(journalKey, edited, retained) && alive.current && generation.current === edited) generation.current = journalGeneration(journalKey) ?? '';
        }
      }
    } catch (cause) {
      if (alive.current) {
        const message = cause instanceof Error ? cause.message : 'The note could not be saved. Your draft is retained.';
        const field = remove ? null : memoryErrorField(cause, key);
        if (field === 'key') { setKeyError(message); keyInput.current?.focus(); }
        else if (field === 'content') { setContentError(message); contentInput.current?.focus(); }
        else setError(message);
      }
    }
    finally { inFlight.current = null; if (alive.current) setBusy(false); }
  };
  const recoveryMessage = recovery === 'pending' ? <p className="memory-recovery muted" role="status">Checking for an unsaved note…</p> : recovery === 'failed' ? <div className="memory-recovery"><p role="status" className="error-text">Note recovery is unavailable. Retry before editing.</p><button type="button" className="secondary" onClick={() => setAttempt(value => value + 1)}>Retry</button></div> : null;
  if (fresh && !expanded) return <>{recoveryMessage}{dirty.current && <button type="button" className="secondary memory-resume" onClick={() => onExpandedChange?.(true)}>Resume unsaved note</button>}</>;
  return <form className="memory-note" onSubmit={event => { event.preventDefault(); void act(); }} onKeyDown={event => { if (fresh && event.key === 'Escape' && !event.nativeEvent.isComposing) { event.preventDefault(); event.stopPropagation(); onExpandedChange?.(false); } }}>
    {fresh ? <label>Note key<input ref={keyInput} required pattern="[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}" maxLength={64} placeholder="e.g. date-format" value={key} disabled={blocked || inFlight.current === 'delete'} aria-invalid={keyError ? true : undefined} aria-describedby={keyError ? keyErrorId : undefined} onChange={e => edit(e.target.value, content)} />{keyError && <p className="memory-field-error" id={keyErrorId}>{keyError}</p>}</label> : <header><strong>{note.key}</strong><small>{note.author === 'agent' ? 'Agent note' : 'Your note'}</small></header>}
    <label><span className="sr-only">{fresh ? 'New thread note' : `Note ${note.key}`}</span><textarea ref={contentInput} required rows={3} maxLength={768} disabled={blocked || inFlight.current === 'delete'} placeholder="A decision or constraint to remember…" value={content} aria-invalid={contentError ? true : undefined} aria-describedby={contentError ? contentErrorId : undefined} onChange={e => edit(key, e.target.value)} />{contentError && <p className="memory-field-error" id={contentErrorId}>{contentError}</p>}</label>
    {recoveryMessage}
    {error && <p role="alert" className="error-text">{error}</p>}
    {!fresh && dirty.current && note.revision !== baseRevision.current && <details><summary>A newer saved note is available</summary><p>{note.content}</p><button type="button" className="secondary" disabled={blocked || busy} onClick={() => { const version = generation.current; dirty.current = false; baseRevision.current = note.revision; setContent(note.content); setError(''); if (version) void journalCompareAndSwap(journalKey, version, null).catch(() => { if (alive.current) setError('Draft recovery could not be cleared.'); }); }}>Use saved note</button></details>}
    <footer>{!fresh && <button type="button" className="icon-button" aria-label={`Forget ${note.key}`} disabled={blocked || busy} onClick={() => void act(true)}><Trash2 size={14} /></button>}{fresh && <button type="button" className="secondary" onClick={() => onExpandedChange?.(false)}>Cancel</button>}<button className="secondary" disabled={blocked || busy || !content.trim() || !key.trim()}>{busy ? 'Saving…' : fresh ? 'Add note' : 'Save note'}</button></footer>
  </form>;
}
export function TaskMemory({ snapshot, threadId }: { snapshot: Snapshot; threadId?: string }) {
  const [addingThread, setAddingThread] = useState<string>();
  const addButton = useRef<HTMLButtonElement>(null);
  const setExpanded = useCallback((value: boolean) => { setAddingThread(value ? threadId : undefined); if (!value) addButton.current?.focus(); }, [threadId]);
  const adding = Boolean(threadId && addingThread === threadId);
  const notes = (snapshot.memory ?? []).filter(note => note.threadId === threadId);
  return <section className="task-memory" aria-label="Thread memory"><header><BookOpen size={16} /><h3>Thread memory</h3>{notes.length >= 10 && <span>{notes.length}/12</span>}<button ref={addButton} className="icon-button" aria-label="Add memory note" aria-expanded={adding} disabled={!threadId || notes.length >= 12} onClick={() => setExpanded(!adding)}><Plus size={15} /></button></header>{!notes.length && !adding && <p className="muted">No saved notes.</p>}{threadId && notes.map(note => <MemoryNote key={`${threadId}:saved:${note.key}`} note={note} threadId={threadId} />)}{threadId && <MemoryNote key={`${threadId}:create`} fresh expanded={adding} onExpandedChange={setExpanded} threadId={threadId} note={{ id: '', threadId, key: '', content: '', revision: 0, author: 'user', updatedAt: '' }} />}</section>;
}
