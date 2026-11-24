import { useEffect, useRef } from 'react';
import { Circle } from 'lucide-react';
import { Modal } from '../../../packages/ui-shell/Modal';
import './thread-switcher.css';

export interface ThreadSwitcherRow {
  id: string;
  title: string;
  statusLabel: string;
  unread: boolean;
  active: boolean;
}

/**
 * Hold-to-preview thread switcher (Ctrl+Tab): move with ↑/↓ or the chord,
 * release the modifier or press Enter to open, Esc cancels. Rendered through
 * the shared Modal primitive; the .ui-thread-switcher class is whitelisted in
 * the global keydown dispatcher so its chords keep firing while this is open.
 */
export function ThreadSwitcher({ rows, index, onPick, onCancel }: {
  rows: ThreadSwitcherRow[];
  index: number;
  onPick: (index: number) => void;
  onCancel: () => void;
}) {
  const list = useRef<HTMLDivElement>(null);
  const active = rows[index];
  useEffect(() => {
    list.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [index]);
  return (
    <Modal open title="Switch thread" onClose={onCancel} className="thread-switcher-dialog">
      <div className="thread-switcher-list" ref={list} aria-label="Open threads">
        {rows.map((row, i) => (
          <button key={row.id} type="button"
            className="thread-switcher-row"
            data-active={i === index || undefined}
            aria-current={i === index ? 'true' : undefined}
            onMouseDown={event => event.preventDefault()}
            onClick={() => onPick(i)}>
            <span className="thread-switcher-title">{row.title}</span>
            {row.unread && <Circle size={8} className="thread-switcher-unread" aria-label="Unread" />}
            <span className="thread-switcher-status">{row.statusLabel}</span>
          </button>
        ))}
      </div>
      <div className="thread-switcher-footer">↑/↓ Move · Release modifier to open · Esc Cancel</div>
      <span role="status" className="thread-switcher-live">{active?.title}</span>
    </Modal>
  );
}
