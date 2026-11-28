import { createContext, useContext, useLayoutEffect, useRef, useState } from 'react';

export const ArtifactTitle = createContext('');
export const ArtifactInline = createContext(false);
export const ArtifactActions = createContext<(actionId: string, payload?: unknown) => Promise<void>>(async () => {});
const escapeKey = (key: string) => key.replace(/~/g, '~0').replace(/\//g, '~1');
export const statePath = (key: unknown) => `/values/${escapeKey(String(key))}`;
export const inputPath = (key: string) => `/inputs/${escapeKey(key)}`;
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
export function mapActionPayload(props: Record<string, unknown>, values: unknown) {
  const state = record(values);
  return Object.fromEntries([...Object.entries(record(props.payload)), ...Object.entries(record(props.payloadFromState)).map(([name, key]) => [name, typeof key === 'string' && Object.hasOwn(state, key) ? state[key] : undefined])]);
}
export function useTaskAction(ownerIdentity?: string | null) {
  const action = useContext(ArtifactActions);
  const pending = useRef(false);
  const owner = useRef(ownerIdentity);
  const generation = useRef(0);
  const request = useRef<object | undefined>(undefined);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const guarded = ownerIdentity !== undefined;
  useLayoutEffect(() => {
    if (!guarded || owner.current === ownerIdentity) return;
    owner.current = ownerIdentity;
    generation.current += 1;
    request.current = undefined;
    pending.current = false;
    setBusy(false);
    setError('');
  }, [guarded, ownerIdentity]);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (!guarded) return;
      generation.current += 1;
      request.current = undefined;
      pending.current = false;
    };
  }, [guarded]);
  const run = async (actionId: string, payload: unknown) => {
    if (ownerIdentity === null || pending.current) return false;
    pending.current = true; setBusy(true); setError('');
    if (!guarded) {
      try { await action(actionId, payload); return true; }
      catch (error) { setError(error instanceof Error ? error.message : 'The request failed. Try again.'); return false; }
      finally { pending.current = false; setBusy(false); }
    }
    const token = {}, generationAtStart = generation.current;
    request.current = token;
    const current = () => mounted.current && owner.current === ownerIdentity && generation.current === generationAtStart && request.current === token;
    try {
      await action(actionId, payload);
      return current();
    } catch (error) {
      if (current()) setError(error instanceof Error ? error.message : 'The request failed. Try again.');
      return false;
    } finally {
      if (current()) { pending.current = false; setBusy(false); }
    }
  };
  return { run, busy, error };
}
