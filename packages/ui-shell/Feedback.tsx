import { AlertCircle, Check, LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import './tokens.css';
import './feedback.css';

/** A retry button already says what to do, so the sentence should not repeat it. */
const withoutRetryHint = (message: string) => message.replace(/([.!?])\s*(?:Retry|Try again|Please try again)\.?\s*$/i, '$1').trim() || message;

export function Spinner({ size = 14 }: { size?: number }) { return <LoaderCircle className="ui-spinner" size={size} aria-hidden="true" />; }

/** Decorative fixed-size state indicator. Acknowledgment is supplied by the owner; it is never inferred here. */
export function ActionIndicator({ state, idleIcon, className = '' }: { state: 'idle' | 'busy' | 'acknowledged'; idleIcon?: ReactNode; className?: string }) {
  const [spinnerVisible, setSpinnerVisible] = useState(false);
  const epoch = useRef(0);
  useEffect(() => {
    const current = ++epoch.current;
    setSpinnerVisible(false);
    if (state !== 'busy') return;
    const timer = setTimeout(() => { if (epoch.current === current) setSpinnerVisible(true); }, 150);
    return () => clearTimeout(timer);
  }, [state]);
  return <span className={`ui-action-indicator ${className}`.trim()} data-state={state} data-spinner-visible={spinnerVisible || undefined} aria-hidden="true">
    <span className="ui-action-indicator-layer ui-action-indicator-idle" data-current={state === 'idle' ? 'true' : undefined}>{idleIcon}</span>
    <span className="ui-action-indicator-layer ui-action-indicator-busy" data-current={state === 'busy' && spinnerVisible ? 'true' : undefined}><Spinner /></span>
    <span className="ui-action-indicator-layer ui-action-indicator-acknowledged" data-current={state === 'acknowledged' ? 'true' : undefined}><Check size={14} /></span>
  </span>;
}


export function ErrorState({ message, onRetry, retryLabel = 'Retry', busy, live = 'alert', className = '', children, retryRef }: {
  message: string; onRetry?: () => void; retryLabel?: string; busy?: boolean; live?: 'alert' | 'status'; className?: string; children?: ReactNode; retryRef?: Ref<HTMLButtonElement>;
}) {
  return <div className={`ui-error ${className}`.trim()} role={live}>
    <AlertCircle size={14} aria-hidden="true" /><p>{onRetry ? withoutRetryHint(message) : message}</p>
    {onRetry && <BusyButton ref={retryRef} className="ui-error-retry" busy={busy} onClick={onRetry}>{retryLabel}</BusyButton>}{children}
  </div>;
}

/** Keeps its label and width while busy; the spinner replaces nothing the user needs to read. */
export function BusyButton({ busy, acknowledged = false, disabled, children, className = '', type = 'button', ref, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean; acknowledged?: boolean; ref?: Ref<HTMLButtonElement> }) {
  const state = busy ? 'busy' : acknowledged ? 'acknowledged' : 'idle';
  return <button {...rest} ref={ref} type={type} className={`ui-busy-button ${className}`.trim()} disabled={disabled || busy} aria-busy={busy || undefined} data-busy={busy || undefined}>
    <ActionIndicator state={state} /><span>{children}</span>
  </button>;
}
