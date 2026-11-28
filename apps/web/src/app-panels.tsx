import { memo, useCallback, useEffect, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from 'react';
import type { Message } from '../../../packages/contracts';
import { getToolEffectObservation, type ToolEffectObservation } from './api';
import { hasPendingDocumentAssets } from './signature-assets';
import { journalFlush } from './journal';
import { useDesktop } from './desktop-context';
import { LoadingState } from './LoadingState';
import { SettingsSkeleton } from './ViewSkeletons';
import { Markdown, ReplyMarkdown, type ReplyHeading } from './Markdown';
import { ReplyContents } from './ReplyContents';
import { Modal } from '../../../packages/ui-shell/Modal';
import { ErrorState } from '../../../packages/ui-shell/Feedback';

export const messageOf = (error: unknown) => error instanceof Error ? error.message : 'The request could not be completed.';

type SettingsComponent = typeof import('./Settings').Settings;
let loadedSettings: SettingsComponent | undefined;

export function Dialog({ title, children, close, initialFocusRef }: { title: string; children: ReactNode; close: () => void; initialFocusRef?: RefObject<HTMLElement | null> }) {
  return <Modal open title={title} onClose={close} className="dialog" initialFocusRef={initialFocusRef}>{children}</Modal>;
}

export function SettingsWindow(props: ComponentProps<SettingsComponent>) {
  const desktop = useDesktop();
  const leaveGuard = useRef<null | {dirty: () => boolean; pending: () => boolean; confirm: (proceed: () => void) => void}>(null);
  const opener = useRef(document.activeElement as HTMLElement | null);
  const [Settings, setSettings] = useState(() => loadedSettings);
  const [error, setError] = useState(''), [reloading, setReloading] = useState(false);
  useEffect(() => () => {
    const invoker = opener.current;
    if (invoker && invoker !== document.body && invoker !== document.documentElement && invoker.isConnected && invoker.getClientRects().length) { invoker.focus({ preventScroll: true }); return; }
    (document.querySelector<HTMLElement>('aside[aria-label="Thread navigation"] button[aria-label="Settings"]') ?? document.querySelector<HTMLElement>('input[aria-label="Search threads"]'))?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    if (Settings) return;
    let active = true;
    void import('./Settings').then(module => { loadedSettings = module.Settings; if (active) setSettings(() => module.Settings); }).catch(() => { if (active) setError('Settings could not load. Try again or close this window.'); });
    return () => { active = false; };
  }, [Settings]);
  const reload = async () => {
    setReloading(true);
    try {
      if (props.snapshot.threads.some(thread => hasPendingDocumentAssets(thread.id))) { setError('Wait for the signature mark to finish saving, or clear it before reloading.'); return; }
      await desktop?.prepareHandoff(); await journalFlush(); window.location.reload();
    } catch (cause) { setError(`Drafts could not be saved. ${messageOf(cause)} Keep this window open and retry.`); }
    finally { setReloading(false); }
  };
  return <Modal open title="Settings" onClose={() => { const g = leaveGuard.current; if (g?.dirty()) { if (!g.pending()) g.confirm(props.close); } else props.close(); }} className="settings-dialog">{Settings ? <Settings {...props} leaveGuard={leaveGuard} /> : <>{error ? <ErrorState message={error} retryLabel="Reload to retry" busy={reloading} onRetry={() => void reload()}/> : <LoadingState pending hasContent={false} label="Opening settings…" skeleton={<SettingsSkeleton/>} className="view-loading-state"/>}</>}</Modal>;
}

export const AssistantProse = memo(function AssistantProse({message,arrivals,active,onJump}:{message:Message;arrivals:Set<string>;active:boolean;onJump?:(top:number)=>void}){
  const initial=useRef(arrivals.has(message.id));useEffect(()=>{arrivals.delete(message.id);},[message.id,arrivals]);
  const renderOutline=useCallback((headings:ReplyHeading[])=>onJump&&headings.length>=3?<ReplyContents headings={headings} onJump={onJump}/>:null,[onJump]);
  if(onJump)return <ReplyMarkdown text={message.content} animate={active||initial.current} initialReveal={initial.current} renderOutline={active?undefined:renderOutline}/>;
  return <Markdown text={message.content} animate={active||initial.current} initialReveal={initial.current}/>;
}, (previous, next) => previous.message === next.message && previous.arrivals === next.arrivals && previous.active === next.active && previous.onJump === next.onJump);

/** M02 action details drawer: ledger view of one invocation. Uncertain states
 * surface as Inspect outcome / View evidence — never a generic Retry — and the
 * coverage note stays visible while native calls are not host-observed. */
export function ActionDetails({ threadId, invocationId, observationKey }: { threadId: string; invocationId: string; observationKey: string }) {
  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ key: string; data?: ToolEffectObservation; error?: true } | null>(null);
  const requestKey = JSON.stringify([threadId, invocationId, observationKey, attempt]);
  useEffect(() => {
    if (!open) return;
    let live = true;
    getToolEffectObservation(threadId, invocationId)
      .then(data => { if (live) setResult({ key: requestKey, data }); })
      .catch(() => { if (live) setResult({ key: requestKey, error: true }); });
    return () => { live = false; };
  }, [threadId, invocationId, requestKey, open]);
  // A previous owner's result must disappear in the same render as its key
  // changes, before the old request's effect cleanup or the new read completes.
  const current = result?.key === requestKey ? result : null;
  const data = current?.data, effect = data?.effect;
  return <details className="action-details" onToggle={event => {
    const next = event.currentTarget.open;
    setOpen(next);
    if (next) setAttempt(value => value + 1);
  }}><summary>Action details</summary>
    {!current && <p role="status" className="muted">Loading execution evidence…</p>}
    {current?.error && <p role="status" className="error-text">Execution evidence could not be loaded.</p>}
    {data && (effect
      ? <pre>{JSON.stringify({ action: effect.publicRedactedSummary, tool: effect.toolId, targets: effect.targetPreconditions, owner: effect.owner, approval: data.approval ? { id: data.approval.approvalId, issuer: data.approval.issuer, expiresAt: data.approval.expiresAt, remainingUses: data.approval.remainingUses } : effect.approvalId, state: effect.state, receipt: effect.providerReceiptRef, freshness: data.freshness, transitions: effect.transitions, outcome: effect.outcome }, null, 2)}</pre>
      : <p className="muted">No execution-ledger record for this action yet.</p>)}
    {effect?.state === 'UNKNOWN_EXTERNAL_OUTCOME' && <p className="muted">Inspect outcome: view evidence before deciding; this effect has no generic retry.</p>}
    {(data?.coverage ?? []).map(note => <p key={note} className="muted coverage-note">{note}</p>)}
    <button type="button" className="quiet" disabled={!current} onClick={() => setAttempt(value => value + 1)}>Reload evidence</button>
  </details>;
}

export function OperationExecutionPolicy({ kind }: { kind: string }) {
  if (kind !== 'repository.test' && kind !== 'integration.context7') return null;
  return <p className="muted" role="note" aria-label="Execution policy"><strong>Unrestricted host</strong>. Uses your local user privileges, including your account's file and network access. This operation has no isolated execution backend.</p>;
}
