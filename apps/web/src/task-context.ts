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
  const generation = useRef(0);
  const requestToken = useRef(0);
  const activeOwner = useRef(ownerIdentity);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current += 1;
      requestToken.current += 1;
      pending.current = false;
    };
  }, []);
  useLayoutEffect(() => {
    if (ownerIdentity === undefined || activeOwner.current === ownerIdentity) return;
    activeOwner.current = ownerIdentity;
    generation.current += 1;
    requestToken.current += 1;
    pending.current = false;
    setBusy(false);
    setError('');
  }, [ownerIdentity]);
  const run = async (actionId: string, payload: unknown) => {
    if (ownerIdentity !== undefined) {
      if (ownerIdentity === null || pending.current) return false;
      const runGeneration = generation.current;
      const token = ++requestToken.current;
      const current = () => mounted.current && generation.current === runGeneration && requestToken.current === token;
      pending.current = true; setBusy(true); setError('');
      try {
        await action(actionId, payload);
        return current();
      } catch (error) {
        if (current()) setError(error instanceof Error ? error.message : 'The request failed. Try again.');
        return false;
      } finally {
        if (current()) { pending.current = false; setBusy(false); }
      }
    }
    if (pending.current) return false;
    pending.current = true; setBusy(true); setError('');
    try { await action(actionId, payload); return true; }
    catch (error) { setError(error instanceof Error ? error.message : 'The request failed. Try again.'); return false; }
    finally { pending.current = false; setBusy(false); }
  };
  return { run, busy, error };
}
