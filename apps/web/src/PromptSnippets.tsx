import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { ChevronDown, Plus, Search } from 'lucide-react';
import { Modal } from '../../../packages/ui-shell/Modal';
import { Popover } from '../../../packages/ui-shell/Popover';
import type { CommandToken } from './composer-commands';
import { createSnippet, deleteSnippet, filterSnippets, loadSnippetLibrary, refreshSnippetLibrary, subscribeSnippetLibrary, updateSnippet, SNIPPET_BODY_LIMIT, SNIPPET_NAME_LIMIT, type PromptSnippet, type SnippetLibrary } from './prompt-snippets.ts';
import { insertSnippet, undoInsertion, type InsertionReceipt, type SnippetCapture } from './snippet-insertion.ts';
import { useSnippetInsertion } from './useSnippetInsertion.ts';
import './prompt-snippets.css';

/** Owner contract for the prompt-snippets feature. `signature` is the custody
 * fence (thread/draft identity + epoch); `onEdit` is the single acceptance
 * channel for every draft write, so scoped composers route through
 * `composers.edit` and the main composer through `updateDraft`. */
export interface PromptSnippetsOwner {
  input: RefObject<HTMLTextAreaElement | null>;
  signature: string;
  editable: () => boolean;
  onEdit: (text: string) => void;
  profileId?: string;
}

interface EditorState { mode: 'new' | 'edit'; id?: string; generation?: string; original: { name: string; body: string }; name: string; body: string; error: string }
interface ConflictState { id?: string; name: string; body: string; latest: PromptSnippet | undefined }
export interface ConfirmState { snippet: PromptSnippet; generation?: string }

const defaultProfileId = () => (typeof window === 'undefined' ? 'default' : window.location.origin);

export interface PromptSnippetsState {
  trigger: RefObject<HTMLButtonElement | null>;
  pickerId: string;
  listId: string;
  open: boolean;
  toggle: () => void;
  close: () => void;
  openForToken: (token: CommandToken) => void;
  invocation: CommandToken | null;
  library: SnippetLibrary | null;
  items: PromptSnippet[];
  search: string;
  setSearch: (value: string) => void;
  active: number;
  move: (delta: number) => void;
  pick: (index: number) => void;
  message: string;
  busyId: string | null;
  selectionCapture: SnippetCapture | null;
  manage: boolean;
  openManage: () => void;
  closeManage: () => void;
  openNew: () => void;
  openSelection: () => void;
  openEdit: (snippet: PromptSnippet) => void;
  setActive: (index: number) => void;
  editor: EditorState | null;
  setEditor: (patch: Partial<EditorState>) => void;
  saveEditor: () => Promise<void>;
  closeEditor: () => void;
  conflict: ConflictState | null;
  conflictUseMine: () => Promise<void>;
  conflictSaveNew: () => Promise<void>;
  conflictCancel: () => void;
  confirm: ConfirmState | null;
  askDelete: (snippet: PromptSnippet) => void;
  doDelete: () => Promise<void>;
  cancelConfirm: () => void;
  discard: boolean;
  confirmDiscard: () => void;
  cancelDiscard: () => void;
  receipt: { receipt: InsertionReceipt; name: string } | null;
  undo: () => void;
}

export function usePromptSnippets(owner: PromptSnippetsOwner): PromptSnippetsState {
  const profileId = owner.profileId ?? defaultProfileId();
  const signatureRef = useRef(owner.signature);
  signatureRef.current = owner.signature;
  const insertion = useSnippetInsertion(owner);
  const trigger = useRef<HTMLButtonElement>(null);
  const pickerId = useId();
  const listId = `${pickerId}-list`;
  const [open, setOpen] = useState(false);
  const [invocation, setInvocation] = useState<CommandToken | null>(null);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(0);
  const [library, setLibrary] = useState<SnippetLibrary | null>(null);
  const generation = useRef<string | undefined>(undefined);
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [manage, setManage] = useState(false);
  const [editor, setEditorState] = useState<EditorState | null>(null);
  const [conflict, setConflict] = useState<ConflictState | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const invocationText = useRef<string | null>(null);
  const [discard, setDiscard] = useState(false);
  const [receipt, setReceiptState] = useState<{ receipt: InsertionReceipt; name: string } | null>(null);

  // Owner change clears all feature state (capture/receipt fencing lives in T03).
  useEffect(() => {
    setOpen(false); setInvocation(null); invocationText.current = null; setSearch(''); setActive(0); setMessage('');
    setManage(false); setEditorState(null); setConflict(null); setConfirm(null); setDiscard(false); setReceiptState(null);
  }, [owner.signature]);

  const accept = useCallback((result: { ok: true; library: SnippetLibrary; generation: string | undefined }) => {
    generation.current = result.generation;
    setLibrary(result.library);
    return result.library;
  }, []);

  // Load and subscribe only while a surface is open: a mount-time setLibrary
  // re-renders the composer's controlled textarea while a draft is mid-flight
  // through the async acceptance channel, which can visibly clear it.
  useEffect(() => {
    if (!open && !manage) return;
    let alive = true;
    void loadSnippetLibrary(profileId).then(result => {
      if (!alive) return;
      if (result.ok) accept(result);
      else setMessage(result.message);
    });
    const unsubscribe = subscribeSnippetLibrary(profileId, result => {
      if (alive && result.ok) accept(result);
    });
    return () => { alive = false; unsubscribe(); };
  }, [open, manage, profileId, accept]);

  // Re-read persisted state when the picker or manager opens and when the tab
  // regains focus while either surface is up (D07: latest persisted state wins).
  useEffect(() => {
    if (!open && !manage) return;
    const sync = () => { void refreshSnippetLibrary(profileId).then(result => { if (result.ok) accept(result); }); };
    sync();
    const onVisible = () => { if (document.visibilityState === 'visible') sync(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', sync);
    return () => { document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('focus', sync); };
  }, [open, manage, profileId, accept]);

  const items = library ? filterSnippets(library, search) : [];

  const openForToken = useCallback((token: CommandToken) => { invocationText.current = owner.input.current?.value ?? null; setInvocation(token); setOpen(true); setSearch(''); setActive(0); }, [owner]);
  const toggle = useCallback(() => { setOpen(value => { if (!value) { setSearch(''); setActive(0); setInvocation(null); invocationText.current = null; } return !value; }); }, []);
  const close = useCallback(() => { setOpen(false); setInvocation(null); invocationText.current = null; setSearch(''); setActive(0); }, []);

  const insert = useCallback((snippet: PromptSnippet) => {
    const element = owner.input.current;
    const cap: SnippetCapture | null = invocation
      ? (element && invocationText.current !== null ? { signature: signatureRef.current, text: invocationText.current, start: invocation.start, end: invocation.end, direction: 'none' } : null)
      : insertion.capture;
    if (!element || !cap || !owner.editable()) { setMessage('Pick an insertion point in the draft first.'); return; }
    const result = insertSnippet(element, cap, signatureRef.current, snippet.body);
    if (!result.ok) { setMessage(result.error); return; }
    owner.onEdit(result.receipt.result);
    setReceiptState({ receipt: result.receipt, name: snippet.name });
    setMessage('');
    setOpen(false);
    setInvocation(null);
    invocationText.current = null;
    element.focus();
  }, [owner, invocation, insertion]);

  const move = useCallback((delta: number) => setActive(index => {
    const count = items.length || 1;
    return (index + delta + count) % count;
  }), [items.length]);
  const pick = useCallback((index: number) => { const snippet = items[index]; if (snippet) insert(snippet); }, [items, insert]);

  const undo = useCallback(() => {
    const element = owner.input.current;
    if (!element || !receipt) return;
    const result = undoInsertion(element, receipt.receipt, signatureRef.current);
    if (result.ok) owner.onEdit(receipt.receipt.restore.text);
    setReceiptState(null);
  }, [owner, receipt]);

  const openManage = useCallback(() => { setManage(true); setOpen(false); setInvocation(null); setMessage(''); }, []);
  const closeManage = useCallback(() => { setManage(false); setEditorState(null); setConflict(null); setConfirm(null); setDiscard(false); }, []);

  const openNew = useCallback(() => {
    setEditorState({ mode: 'new', generation: generation.current, original: { name: '', body: '' }, name: '', body: '', error: '' });
    setManage(true); setOpen(false); setInvocation(null); invocationText.current = null;
  }, []);
  const openSelection = useCallback(() => {
    const cap = insertion.capture;
    const body = cap && cap.start < cap.end ? cap.text.slice(cap.start, cap.end) : '';
    setEditorState({ mode: 'new', generation: generation.current, original: { name: '', body }, name: '', body, error: '' });
    setManage(true); setOpen(false);
  }, [insertion]);
  const openEdit = useCallback((snippet: PromptSnippet) => setEditorState({ mode: 'edit', id: snippet.id, generation: generation.current, original: { name: snippet.name, body: snippet.body }, name: snippet.name, body: snippet.body, error: '' }), []);
  const setEditor = useCallback((patch: Partial<EditorState>) => setEditorState(current => current ? { ...current, ...patch } : current), []);
  const closeEditor = useCallback(() => {
    setEditorState(current => {
      if (!current) return null;
      if (current.name !== current.original.name || current.body !== current.original.body) { setDiscard(true); return current; }
      return null;
    });
  }, []);
  const confirmDiscard = useCallback(() => { setDiscard(false); setEditorState(null); }, []);
  const cancelDiscard = useCallback(() => setDiscard(false), []);

  const enterConflict = useCallback(async (id: string | undefined, name: string, body: string) => {
    const fresh = await refreshSnippetLibrary(profileId);
    if (fresh.ok) { accept(fresh); setConflict({ id, name, body, latest: fresh.library.snippets.find(item => item.id === id) }); }
    else setConflict({ id, name, body, latest: undefined });
  }, [profileId, accept]);

  const saveEditor = useCallback(async () => {
    const draft = editor;
    if (!draft) return;
    setBusyId('editor');
    setEditorState(current => current ? { ...current, error: '' } : current);
    try {
      const result = draft.mode === 'new'
        ? await createSnippet(profileId, draft.generation, { name: draft.name, body: draft.body })
        : await updateSnippet(profileId, draft.generation, draft.id!, { name: draft.name, body: draft.body });
      if (result.ok) { accept(result); setEditorState(null); return; }
      if (result.error === 'conflict') await enterConflict(draft.id, draft.name, draft.body);
      else setEditorState(current => current ? { ...current, error: result.message } : current);
    } finally { setBusyId(null); }
  }, [editor, profileId, accept, enterConflict]);

  const conflictUseMine = useCallback(async () => {
    const draft = conflict;
    if (!draft) return;
    setBusyId('conflict');
    try {
      const result = draft.id
        ? await updateSnippet(profileId, generation.current, draft.id, { name: draft.name, body: draft.body })
        : await createSnippet(profileId, generation.current, { name: draft.name, body: draft.body });
      if (result.ok) { accept(result); setConflict(null); setEditorState(null); return; }
      if (result.error === 'conflict') await enterConflict(draft.id, draft.name, draft.body);
      else setMessage(result.message);
    } finally { setBusyId(null); }
  }, [conflict, profileId, accept, enterConflict]);

  const conflictSaveNew = useCallback(async () => {
    const draft = conflict;
    if (!draft) return;
    setBusyId('conflict');
    try {
      const result = await createSnippet(profileId, generation.current, { name: draft.name, body: draft.body });
      if (result.ok) { accept(result); setConflict(null); setEditorState(null); return; }
      if (result.error === 'conflict') await enterConflict(undefined, draft.name, draft.body);
      else setMessage(result.message);
    } finally { setBusyId(null); }
  }, [conflict, profileId, accept, enterConflict]);
  const conflictCancel = useCallback(() => {
    // The user reviewed the latest persisted version: rebase the editor's
    // generation so a re-save is a deliberate overwrite, not a repeat conflict.
    setEditorState(current => current ? { ...current, generation: generation.current } : current);
    setConflict(null);
  }, []);

  const askDelete = useCallback((snippet: PromptSnippet) => setConfirm({ snippet, generation: generation.current }), []);
  const cancelConfirm = useCallback(() => setConfirm(null), []);
  const doDelete = useCallback(async () => {
    const pending = confirm;
    if (!pending) return;
    setBusyId(pending.snippet.id);
    try {
      const result = await deleteSnippet(profileId, pending.generation, pending.snippet.id);
      if (result.ok) { accept(result); setConfirm(null); return; }
      if (result.error === 'conflict') { const fresh = await refreshSnippetLibrary(profileId); if (fresh.ok) accept(fresh); }
      setConfirm(null);
      setMessage(result.error === 'conflict' ? 'Snippets changed in another window. Review and try again.' : result.message);
    } finally { setBusyId(null); }
  }, [confirm, profileId, accept, enterConflict]);

  return {
    trigger, pickerId, listId, open, toggle, close, openForToken, invocation,
    library, items, search, setSearch, active, move, pick, message, busyId,
    selectionCapture: insertion.capture,
    manage, openManage, closeManage, openNew,
    openSelection, openEdit, setActive,
    editor, setEditor, saveEditor, closeEditor,
    conflict, conflictUseMine, conflictSaveNew, conflictCancel,
    confirm, askDelete, doDelete, cancelConfirm,
    discard, confirmDiscard, cancelDiscard,
    receipt, undo,
  };
}

export function PromptSnippetsTrigger({ snippets, disabled }: { snippets: PromptSnippetsState; disabled?: boolean }) {
  return <button
    type="button"
    ref={snippets.trigger}
    className="quiet prompt-snippets-trigger"
    aria-haspopup="dialog"
    aria-expanded={snippets.open}
    aria-controls={snippets.pickerId}
    title="Insert reusable text at the cursor"
    disabled={disabled}
    onClick={snippets.toggle}
  >Snippets<ChevronDown size={14} /></button>;
}

export function PromptSnippetsReceipt({ snippets }: { snippets: PromptSnippetsState }) {
  const shown = snippets.receipt;
  return <div className={`prompt-snippets-receipt${shown ? ' visible' : ''}`} role="status" aria-live="polite">
    {shown && <span>Inserted {shown.name} · <button type="button" className="prompt-snippets-undo" onClick={snippets.undo}>Undo insertion</button></span>}
  </div>;
}

export function PromptSnippetsOverlay({ snippets }: { snippets: PromptSnippetsState }) {
  const anchor = snippets.trigger;
  const searchRef = useRef<HTMLInputElement>(null);
  const manageTitle = snippets.conflict ? 'Snippet changed elsewhere'
    : snippets.confirm ? 'Delete snippet?'
    : snippets.discard ? 'Discard changes?'
    : snippets.editor ? (snippets.editor.mode === 'new' ? 'New snippet' : 'Edit snippet')
    : 'Manage snippets';
  const dirty = snippets.editor && (snippets.editor.name !== snippets.editor.original.name || snippets.editor.body !== snippets.editor.original.body);
  const closeManage = () => { if (dirty && !snippets.discard) { snippets.closeEditor(); return; } snippets.closeManage(); };
  return <>
    <Popover
      open={snippets.open}
      anchor={anchor}
      onDismiss={snippets.close}
      className="prompt-snippets"
      preferredSide="above"
      align="start"
      width={400}
      height={420}
      role="dialog"
      aria-label="Snippets"
      initialFocus={searchRef}
      onKeyDown={event => { if (event.key === 'Escape' && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); event.stopPropagation(); snippets.close(); snippets.trigger.current?.focus(); } }}
    >
      <div id={snippets.pickerId} role="dialog" aria-label="Snippets" className="prompt-snippets-picker">
        <h2 className="prompt-snippets-title">Snippets</h2>
        <label className="prompt-snippets-search">
          <Search size={14} aria-hidden="true" />
          <input
            ref={searchRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={snippets.listId}
            placeholder="Search names and text…"
            value={snippets.search}
            onChange={event => { snippets.setSearch(event.target.value); snippets.move(0); }}
            onKeyDown={event => {
              if (event.key === 'ArrowDown') { event.preventDefault(); event.stopPropagation(); snippets.move(1); }
              else if (event.key === 'ArrowUp') { event.preventDefault(); event.stopPropagation(); snippets.move(-1); }
              else if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); snippets.pick(snippets.active); }
            }}
          />
        </label>
        <p className="prompt-snippets-helper">Text only · Local to this profile</p>
        {snippets.message && <p className="prompt-snippets-error" role="alert">{snippets.message}</p>}
        {!snippets.library && <p className="prompt-snippets-empty">Loading snippets…</p>}
        {snippets.library && snippets.items.length === 0 && <p className="prompt-snippets-empty">{snippets.library.snippets.length === 0 ? 'No snippets yet. Save text you reuse across conversations.' : 'No snippets match your search.'}</p>}
        <div id={snippets.listId} role="listbox" aria-label="Snippet choices" className="prompt-snippets-list">
          {snippets.items.map((snippet, index) => (
            <div
              key={snippet.id}
              role="option"
              aria-selected={index === snippets.active}
              className={`prompt-snippets-item${index === snippets.active ? ' active' : ''}`}
              onMouseEnter={() => snippets.setActive(index)}
              onClick={() => snippets.pick(index)}
            >
              <span className="prompt-snippets-name">{snippet.name}</span>
              <span className="prompt-snippets-preview">{snippet.body}</span>
            </div>
          ))}
        </div>
        <div className="prompt-snippets-footer">
          <button type="button" onClick={snippets.openNew}><Plus size={14} />New snippet</button>
          <button type="button" disabled={!snippets.selectionCapture || snippets.selectionCapture.start === snippets.selectionCapture.end} title="Select draft text first" onClick={snippets.openSelection}>Save selection as snippet</button>
          <button type="button" onClick={snippets.openManage}>Manage snippets</button>
          <span className="prompt-snippets-hint">{snippets.invocation ? 'Choose text to replace /snippets' : 'Enter inserts · Esc closes'}</span>
        </div>
      </div>
    </Popover>
    {snippets.manage && <Modal open title={manageTitle} onClose={closeManage} className="prompt-snippets-dialog">
      {snippets.message && <p className="prompt-snippets-error" role="alert">{snippets.message}</p>}
      {snippets.conflict ? <div className="prompt-snippets-conflict">
          <p>Snippets changed in another window. Review and save again.</p>
          {snippets.conflict.latest && <div className="prompt-snippets-latest"><small>Latest saved version</small><strong>{snippets.conflict.latest.name}</strong><pre>{snippets.conflict.latest.body}</pre></div>}
          <div className="prompt-snippets-actions">
            <button type="button" disabled={Boolean(snippets.busyId)} onClick={() => void snippets.conflictUseMine()}>Use my edits</button>
            <button type="button" disabled={Boolean(snippets.busyId)} onClick={() => void snippets.conflictSaveNew()}>Save as new snippet</button>
            <button type="button" className="quiet" onClick={snippets.conflictCancel}>Cancel</button>
          </div>
        </div>
      : snippets.confirm ? <div className="prompt-snippets-delete">
          <p>Delete “{snippets.confirm.snippet.name}”?</p>
          <p className="prompt-snippets-note">This removes it from this profile's snippet library. Text already inserted in drafts is kept.</p>
          <div className="prompt-snippets-actions">
            <button type="button" className="danger" disabled={Boolean(snippets.busyId)} onClick={() => void snippets.doDelete()}>Delete snippet</button>
            <button type="button" className="quiet" onClick={snippets.cancelConfirm}>Cancel</button>
          </div>
        </div>
      : snippets.discard ? <div className="prompt-snippets-discard">
          <p>Discard changes?</p>
          <div className="prompt-snippets-actions">
            <button type="button" className="danger" onClick={snippets.confirmDiscard}>Discard</button>
            <button type="button" className="quiet" onClick={snippets.cancelDiscard}>Keep editing</button>
          </div>
        </div>
      : snippets.editor ? <div className="prompt-snippets-editor">
          <label>Name<input value={snippets.editor.name} maxLength={SNIPPET_NAME_LIMIT} onChange={event => snippets.setEditor({ name: event.target.value })} onKeyDown={event => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); event.stopPropagation(); void snippets.saveEditor(); } }} /></label>
          <span className="prompt-snippets-count">{snippets.editor.name.length}/{SNIPPET_NAME_LIMIT}</span>
          <label>Text<textarea rows={8} value={snippets.editor.body} maxLength={SNIPPET_BODY_LIMIT} onChange={event => snippets.setEditor({ body: event.target.value })} /></label>
          <span className="prompt-snippets-count">{snippets.editor.body.length.toLocaleString()}/{SNIPPET_BODY_LIMIT.toLocaleString()}</span>
          {snippets.editor.error && <p className="prompt-snippets-error" role="alert">{snippets.editor.error}</p>}
          <div className="prompt-snippets-actions">
            <button type="button" disabled={Boolean(snippets.busyId)} onClick={() => void snippets.saveEditor()}>Save snippet</button>
            <button type="button" className="quiet" onClick={snippets.closeEditor}>Cancel</button>
          </div>
        </div>
      : <div className="prompt-snippets-manager">
          {snippets.library && snippets.library.snippets.length === 0 && <p className="prompt-snippets-empty">No snippets yet. Save text you reuse across conversations.</p>}
          <ul>
            {snippets.library?.snippets.map(snippet => <li key={snippet.id}>
              <span className="prompt-snippets-name">{snippet.name}</span>
              <span className="prompt-snippets-preview">{snippet.body}</span>
              <button type="button" disabled={Boolean(snippets.busyId)} onClick={() => snippets.openEdit(snippet)}>Edit</button>
              <button type="button" className="danger" disabled={Boolean(snippets.busyId)} onClick={() => snippets.askDelete(snippet)}>Delete</button>
            </li>)}
          </ul>
          <div className="prompt-snippets-actions">
            <button type="button" onClick={snippets.openNew}><Plus size={14} />New snippet</button>
          </div>
        </div>}
    </Modal>}
  </>;
}
