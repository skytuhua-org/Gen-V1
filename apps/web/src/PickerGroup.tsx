import type {CSSProperties, KeyboardEvent, ReactNode} from 'react';
import {isComposing} from '../../../packages/ui-shell/list-navigation';

interface PickerOption {
  id: string;
  label: string;
  content: ReactNode;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}

export function nextPickerIndex(key: string, index: number, length: number): number | null {
  if (length < 1) return null;
  if (key === 'Home') return 0;
  if (key === 'End') return length - 1;
  if (key === 'ArrowRight' || key === 'ArrowDown') return (index + 1) % length;
  if (key === 'ArrowLeft' || key === 'ArrowUp') return (index - 1 + length) % length;
  return null;
}

export function PickerGroup({label, options, value, onChange, className, pending = false}: {
  label: string;
  options: readonly PickerOption[];
  value?: string;
  onChange: (id: string) => void;
  className?: string;
  pending?: boolean;
}) {
  const tabStop = (options.find(option => option.id === value && !option.disabled)
    ?? options.find(option => !option.disabled))?.id;
  const navigate = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isComposing(event) || event.altKey || event.ctrlKey || event.metaKey) return;
    const focused = event.target;
    if (!(focused instanceof HTMLButtonElement)) return;
    const enabled = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="radio"]:not(:disabled)')];
    const index = enabled.indexOf(focused);
    if (index < 0) return;
    const next = nextPickerIndex(event.key, index, enabled.length);
    if (next === null) return;
    event.preventDefault();
    if (pending) return;
    const target = enabled[next];
    target.focus();
    if (target.value !== value) onChange(target.value);
  };
  return <div role="radiogroup" aria-label={label} aria-busy={pending || undefined} className={className} onKeyDown={navigate}>
    {options.map(option => <button
      key={option.id} type="button" role="radio" value={option.id} className={option.className} style={option.style}
      aria-label={option.label} aria-checked={option.id === value} aria-disabled={pending || undefined}
      disabled={option.disabled} tabIndex={option.id === tabStop ? 0 : -1}
      onClick={() => { if (!pending) onChange(option.id); }}
    >{option.content}</button>)}
  </div>;
}
