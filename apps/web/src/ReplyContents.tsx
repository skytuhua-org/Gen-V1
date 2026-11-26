import { useId, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ReplyHeading } from './Markdown';

/** Inline per-reply section outline (S07-style contents disclosure). Choosing a
 * heading closes the list, jumps the owning conversation scroller to the exact
 * heading, and leaves focus on it. All state is ephemeral and view-local. */
export function ReplyContents({ headings, onJump }: { headings: ReplyHeading[]; onJump: (top: number) => void }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const minimumLevel = Math.min(...headings.map(heading => heading.level));

  // Resolve the jump only after the collapse commits: measuring with the list
  // open would target a moving layout. A vanished target or owner cancels.
  useLayoutEffect(() => {
    if (pending === null) return;
    setPending(null);
    const scope = root.current?.closest('.message-content') ?? root.current?.parentElement;
    const heading = scope?.querySelector<HTMLElement>(`[data-outline-key="${pending}"]`);
    if (!heading?.isConnected) return;
    const scroller = heading.closest<HTMLElement>('.conversation-scroll');
    if (!scroller?.getClientRects().length) return;
    const top = scroller.scrollTop + heading.getBoundingClientRect().top - scroller.getBoundingClientRect().top - scroller.clientTop - 16;
    onJump(top);
    heading.focus({ preventScroll: true });
  }, [pending, onJump]);

  return (
    <div
      ref={root}
      className="reply-contents"
      onKeyDown={event => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus({ preventScroll: true });
        }
      }}
    >
      <button
        type="button"
        ref={trigger}
        className="reply-contents-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(value => !value)}
      >
        <ChevronDown className="reply-contents-chevron" size={14} aria-hidden />
        Contents
      </button>
      {open && (
        <ol id={id} className="reply-contents-list">
          {headings.map(heading => (
            <li key={heading.key}>
              <button
                type="button"
                className="reply-contents-entry"
                style={{ paddingInlineStart: `${8 + Math.min(24, (heading.level - minimumLevel) * 8)}px` }}
                onClick={() => { setOpen(false); setPending(heading.key); }}
              >
                {heading.label}
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
