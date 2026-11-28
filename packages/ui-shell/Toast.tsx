import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { topModal, subscribeTopModal } from './Modal';
import { isComposing } from './list-navigation';
import { refocusWithin } from './focus-retention';
import './tokens.css';
import './feedback.css';

type ToastTone = 'info' | 'success' | 'error';
export interface ToastOptions { tone?: ToastTone; dedupeKey?: string; action?: { label: string; onClick: () => void }; durationMs?: number; announce?: boolean }
interface ToastEntry extends ToastOptions { id: number; message: string; leaving: boolean }

const VISIBLE_MS = 6000, MAX_VISIBLE = 3;
let entries: ToastEntry[] = [], nextId = 1;
const listeners = new Set<() => void>();
const publish = (next: ToastEntry[]) => { entries = next; for (const listener of listeners) listener(); };
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };

/** Shows a transient notification; repeating a message or explicit key restarts it instead of stacking. */
export function toast(message: string, options: ToastOptions = {}) {
  const text = message.trim();
  if (!text) return 0;
  const id = nextId++;
  const distinct = entries.filter(entry => options.dedupeKey === undefined
    ? entry.dedupeKey !== undefined || entry.message !== text
    : entry.dedupeKey !== options.dedupeKey);
  const next = [...distinct, { ...options, id, message: text, leaving: false }];
  let visible = next.filter(entry => !entry.leaving).length;
  publish(next.map(entry => (visible > MAX_VISIBLE && !entry.leaving ? (visible--, { ...entry, leaving: true }) : entry)));
  return id;
}
export function dismissToast(id: number) { publish(entries.map(entry => entry.id === id ? { ...entry, leaving: true } : entry)); }
const remove = (id: number) => publish(entries.filter(entry => entry.id !== id));

const icons = { info: Info, success: CheckCircle2, error: AlertCircle };

function ToastItem({ entry, paused }: { entry: ToastEntry; paused: boolean }) {
  const element = useRef<HTMLDivElement>(null), remaining = useRef(entry.durationMs ?? (entry.tone === 'error' ? Infinity : VISIBLE_MS));
  useEffect(() => {
    if (paused || entry.leaving || remaining.current === Infinity) return;
    const started = Date.now(), timer = setTimeout(() => dismissToast(entry.id), remaining.current);
    return () => { clearTimeout(timer); remaining.current = Math.max(0, remaining.current - (Date.now() - started)); };
  }, [paused, entry.leaving, entry.id]);
  useEffect(() => {
    if (!entry.leaving) return;
    const running = element.current?.getAnimations?.() ?? [];
    if (!running.length) { remove(entry.id); return; }
    let cancelled = false;
    void Promise.allSettled(running.map(animation => animation.finished)).then(() => { if (!cancelled) remove(entry.id); });
    return () => { cancelled = true; };
  }, [entry.leaving, entry.id]);
  const tone = entry.tone ?? 'info', Icon = icons[tone];
  return <div ref={element} className="ui-toast" data-toast-id={entry.id} data-tone={tone} data-state={entry.leaving ? 'closed' : 'open'} role={entry.announce === false ? undefined : tone === 'error' ? 'alert' : 'status'}>
    <Icon size={15} aria-hidden="true" /><span>{entry.message}</span>
    {entry.action && <button type="button" className="ui-toast-action" onClick={() => { entry.action?.onClick(); dismissToast(entry.id); }}>{entry.action.label}</button>}
    <button type="button" className="ui-toast-close" aria-label="Dismiss notification" onClick={() => dismissToast(entry.id)}><X size={14} /></button>
  </div>;
}

/** Mount once per window. Timers pause while the stack is hovered or holds focus. */
export function Toaster() {
  const list = useSyncExternalStore(subscribe, () => entries, () => entries);
  const modal = useSyncExternalStore(subscribeTopModal, topModal, () => null);
  const [portal, setPortal] = useState<HTMLDivElement>();
  useLayoutEffect(() => {
    const container = document.createElement('div');
    setPortal(container);
    return () => container.remove();
  }, []);
  const [hovered, setHovered] = useState(false), [focused, setFocused] = useState(false);
  const stack = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!portal) return;
    const host = modal ?? portal.ownerDocument.body;
    if (portal.parentElement === host) return;
    host.append(portal);
    setHovered(false);
    setFocused(portal.contains(portal.ownerDocument.activeElement));
  }, [modal, portal]);
  useEffect(() => { if (!list.length) setHovered(false); }, [list.length]);
  useLayoutEffect(() => {
    // Removing or replacing a focused toast can happen without a blur event.
    const root = stack.current;
    if (!root) return;
    const active = root.ownerDocument.activeElement;
    if (!root.contains(active)) {
      setFocused(false);
      // Focus was inside and its node vanished: land on the newest remaining
      // toast's close button instead of dropping to body.
      if (root.dataset.prevHadFocus === 'true' && active === root.ownerDocument.body) {
        const buttons = root.querySelectorAll<HTMLElement>('.ui-toast:not([data-state="closed"]) .ui-toast-close');
        const next = buttons[buttons.length - 1];
        if (next) next.focus({ preventScroll: true });
        else if (modal) refocusWithin(modal);
      }
    }
  }, [list, modal]);
  if (!portal) return null;
  return createPortal(<div ref={stack} className="ui-toaster" role="region" aria-label="Notifications" onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}
    onFocus={() => { setFocused(true); if (stack.current) stack.current.dataset.prevHadFocus = 'true'; }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) { setFocused(false); event.currentTarget.dataset.prevHadFocus = 'false'; } }}
    onKeyDown={event => {
      if (event.key !== 'Escape') return;
      const target = event.target as HTMLElement;
      const item = target.closest<HTMLElement>('.ui-toast');
      if (item) {
        if (modal) { event.preventDefault(); event.stopPropagation(); }
        if (!isComposing(event)) {
          const id = Number(item.dataset.toastId);
          if (id) dismissToast(id);
        }
        return;
      }
      if (target === event.currentTarget) {
        const newest = [...list].reverse().find(entry => !entry.leaving);
        if (newest) dismissToast(newest.id);
      }
    }}>
    {list.map(entry => <ToastItem key={entry.id} entry={entry} paused={hovered || focused} />)}
  </div>, portal);
}
