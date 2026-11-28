import { createContext, createElement, useContext, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

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

export type ChoiceCapture = { instanceId: string; stateKey: string; label: string; valueLabel: string; userEditVersion: number };
export type ChoiceRegistration = {
  instanceId: string; stateKey: string; fieldset: HTMLFieldSetElement;
  isEligible: () => boolean; isRequired: () => boolean; isValid: () => boolean;
  capture: () => ChoiceCapture; setInvalid: (value: boolean) => void; focusInvalid: () => void;
};
export type ChoiceValidation = {
  register: (entry: ChoiceRegistration) => () => void;
  syncNativeParticipation: (form: HTMLFormElement) => void;
  validate: (input: { form?: HTMLFormElement; mappedKeys: readonly string[] }) => { valid: boolean; captures: ChoiceCapture[] };
  subscribeUserEdit: (listener: (instanceId: string, version: number) => void) => () => void;
  notifyUserEdit: (instanceId: string, version: number) => void;
};
const ChoiceValidationContext = createContext<ChoiceValidation | null>(null);
export const useChoiceValidation = () => useContext(ChoiceValidationContext);

/** Renderer-local choice validation registry. It never reads registrations from another artifact provider. */
export function ChoiceValidationProvider({ children }: { children: ReactNode }) {
  const entries = useRef(new Map<string, ChoiceRegistration>());
  const listeners = useRef(new Set<(instanceId: string, version: number) => void>());
  const api = useRef<ChoiceValidation>({
    register(entry) {
      entries.current.set(entry.instanceId, entry);
      return () => { if (entries.current.get(entry.instanceId) === entry) entries.current.delete(entry.instanceId); };
    },
    syncNativeParticipation(form) {
      for (const entry of entries.current.values()) if (entry.fieldset.closest('form') === form) entry.fieldset.disabled = !entry.isEligible();
    },
    validate({ form, mappedKeys }) {
      const associated = [...entries.current.values()].filter(entry => entry.isEligible() && (form ? entry.fieldset.closest('form') === form || mappedKeys.includes(entry.stateKey) : mappedKeys.includes(entry.stateKey)));
      const invalid = associated.filter(entry => entry.isRequired() && !entry.isValid());
      for (const entry of associated) entry.setInvalid(invalid.includes(entry));
      invalid[0]?.focusInvalid();
      return { valid: invalid.length === 0, captures: invalid.length ? [] : associated.filter(entry => entry.isValid()).map(entry => entry.capture()) };
    },
    subscribeUserEdit(listener) {
      listeners.current.add(listener);
      return () => { listeners.current.delete(listener); };
    },
    notifyUserEdit(instanceId, version) {
      for (const listener of listeners.current) listener(instanceId, version);
    },
  });
  return createElement(ChoiceValidationContext.Provider, { value: api.current }, children);
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
