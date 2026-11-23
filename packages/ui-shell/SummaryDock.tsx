import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { ChevronDown } from 'lucide-react';
import { Popover } from './Popover';
import './summary-dock.css';

interface SummaryStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }
const keyFor = (id: string) => `harness:summary:${id}:v1`;
function browserStorage(): SummaryStorage | undefined {
  try { return typeof localStorage === 'undefined' ? undefined : localStorage; } catch { return undefined; }
}
export function readSummaryCollapsed(id: string, fallback: boolean, storage = browserStorage()): boolean {
  try {
    for (const key of [keyFor(id), `harness:floating:${id}:v1`]) {
      const raw = storage?.getItem(key);
      if (!raw || raw.length > 1024) continue;
      let value: unknown;
      try { value = JSON.parse(raw); } catch { continue; }
      if (value && typeof value === 'object' && !Array.isArray(value) && 'collapsed' in value && typeof value.collapsed === 'boolean') return value.collapsed;
    }
  } catch { /* Collapse remains usable when local preference storage is blocked. */ }
  return fallback;
}
export function writeSummaryCollapsed(id: string, collapsed: boolean, storage = browserStorage()): void {
  try { storage?.setItem(keyFor(id), JSON.stringify({ collapsed })); } catch { /* Keep the current disclosure state in memory. */ }
}

/** Disclosure state owned outside the dock, so a collapsed summary can release all of its space. */
export interface SummaryDisclosure {
  collapsed: boolean; updatePending: boolean; toggle: RefObject<HTMLButtonElement | null>;
  change(collapsed: boolean): void; setUpdatePending(pending: boolean): void;
}
export function useSummaryDisclosure(id: string, defaultCollapsed = true, persist = true): SummaryDisclosure {
  const [collapsed, setCollapsed] = useState(() => readSummaryCollapsed(id, defaultCollapsed));
  const [updatePending, setUpdatePending] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!persist) return;
    const timer = setTimeout(() => writeSummaryCollapsed(id, collapsed), 120);
    return () => clearTimeout(timer);
  }, [id, collapsed, persist]);
  const change = (next: boolean) => { setUpdatePending(false); setCollapsed(next); if (persist) writeSummaryCollapsed(id, next); };
  return { collapsed, updatePending, toggle, change, setUpdatePending };
}
export function SummaryToggle({ title, disclosure, children, className = '' }: { title: string; disclosure: SummaryDisclosure; children: ReactNode; className?: string }) {
  const { collapsed, updatePending } = disclosure, statusId = useId();
  return <button ref={disclosure.toggle} type="button" className={`icon-button summary-toggle ${collapsed ? '' : 'selected'} ${className}`}
    aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`} aria-expanded={!collapsed} title={title}
    aria-describedby={updatePending ? statusId : undefined} onKeyDown={event => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229 || collapsed) return;
      event.preventDefault(); event.stopPropagation(); disclosure.change(true);
    }} onClick={() => disclosure.change(!collapsed)}>
    {children}{updatePending && <span id={statusId} className="summary-toggle-update" role="status">Update available</span>}
  </button>;
}

export interface DockedSummaryProps {
  id: string; title: string; children: ReactNode; open?: boolean; defaultCollapsed?: boolean;
  summary?: ReactNode; collapsedLabel?: string; minimizeLabel?: string; ariaLabel?: string;
  className?: string; focusOnOpen?: boolean; expandRequest?: number; disclosure?: SummaryDisclosure;
}
export function DockedSummary({ id, title, children, open = true, defaultCollapsed = true, summary, collapsedLabel,
  minimizeLabel, ariaLabel, className = '', focusOnOpen = false, expandRequest, disclosure: external }: DockedSummaryProps) {
  const own = useSummaryDisclosure(id, defaultCollapsed, !external), state = external ?? own;
  const { collapsed, updatePending: expansionPending, setUpdatePending: setExpansionPending, change, toggle: disclosure } = state;
  const panel = useRef<HTMLElement>(null), popoverPanel = useRef<HTMLDivElement>(null), opener = useRef<HTMLElement | null>(null);
  const previousOpen = useRef<boolean | undefined>(undefined), bodyId = useId();
  const appliedExpansion = useRef<number | undefined>(undefined);
  const externalPresentation = Boolean(external), presentationOpen = open && !(externalPresentation && collapsed);
  useLayoutEffect(() => {
    const previous = previousOpen.current; previousOpen.current = presentationOpen;
    const content = externalPresentation ? popoverPanel.current : panel.current;
    if (!presentationOpen) {
      if (previous && content?.contains(document.activeElement) && opener.current?.isConnected) opener.current.focus({ preventScroll: true });
      return;
    }
    if (previous === false) {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (focusOnOpen) disclosure.current?.focus({ preventScroll: true });
    }
  }, [presentationOpen, focusOnOpen, externalPresentation]);
  useLayoutEffect(() => {
    // Consume each publication once, so hide/reveal cannot undo a later manual collapse.
    if (expandRequest === undefined || !open || appliedExpansion.current === expandRequest) return;
    appliedExpansion.current = expandRequest;
    const dock = panel.current?.closest('.summary-dock');
    if (!focusOnOpen && collapsed && (externalPresentation || dock && getComputedStyle(dock).flexDirection === 'row')) {
      // Keep collapsed summaries closed until explicit expansion.
      setExpansionPending(true); return;
    }
    change(false);
  }, [expandRequest, open, focusOnOpen, collapsed, externalPresentation]);
  if (external) {
    const viewportHeight = typeof window === 'undefined' ? 536 : (window.visualViewport?.height ?? window.innerHeight);
    return <Popover anchor={disclosure} contentRef={popoverPanel} open={presentationOpen} present width={320}
      height={Math.max(1, Math.min(520, viewportHeight - 16))} preferredSide="below" align="end"
      onDismiss={() => change(true)} className={`summary-overview ${className}`} role="region"
      aria-label={ariaLabel ?? `${title} window`} data-presentation="popover" data-summary-id={id} data-collapsed={collapsed}>
      <strong className="docked-summary-title">{title}</strong>
      <div id={bodyId} className="docked-summary-content">{children}</div>
    </Popover>;
  }
  return <section ref={panel} className={`docked-summary ${className}`} aria-label={ariaLabel ?? `${title} window`}
    hidden={!open} data-collapsed={collapsed} data-summary-id={id} onKeyDown={event => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229 || collapsed) return;
      event.preventDefault(); event.stopPropagation(); change(true); disclosure.current?.focus({ preventScroll: true });
    }}>
    <header className="docked-summary-header"><button ref={disclosure} type="button" className="docked-summary-toggle"
      aria-label={collapsed ? collapsedLabel ?? `Expand ${title}` : minimizeLabel ?? `Collapse ${title}`}
      aria-expanded={!collapsed} aria-controls={bodyId} aria-describedby={expansionPending ? `${bodyId}-update` : undefined} onClick={() => change(!collapsed)}>
      <strong>{title}</strong>{collapsed && (expansionPending
        ? <span id={`${bodyId}-update`} className="docked-summary-caption" role="status">Update available</span>
        : summary != null && <span className="docked-summary-caption" aria-hidden="true">{summary}</span>)}
      <ChevronDown size={14} aria-hidden="true" />
    </button></header>
    <div id={bodyId} className="docked-summary-content" hidden={collapsed} inert={collapsed || !open} aria-hidden={collapsed || !open}>{children}</div>
  </section>;
}

export function SummaryDock({ children }: { children: ReactNode }) {
  return <aside className="summary-dock" aria-label="Conversation summaries">{children}</aside>;
}
export function SummaryLayout({ children, summaries, active }: { children: ReactNode; summaries: ReactNode; active: boolean }) {
  return <div className="summary-layout-owner"><div className="summary-layout" data-summaries={active}>{children}{summaries}</div></div>;
}
