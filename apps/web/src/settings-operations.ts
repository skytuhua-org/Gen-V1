/** Settings writes retain their owning view until the accepted metadata is read. */
const pending = new Set<Promise<unknown>>();

export function settingsOperation<T>(operation: () => Promise<T>): Promise<T> {
 const request = operation();
 pending.add(request);
 void request.then(() => pending.delete(request), () => pending.delete(request));
 return request;
}

export async function settleSettingsOperations(): Promise<void> {
 // Individual write failures surface through their own callers; the handoff
 // guard only needs every pending write to reach a settled state.
 while (pending.size) await Promise.allSettled([...pending]);
}

/** A settled write whose post-save view refresh failed — the value persisted. */
export class SettingsRefreshError extends Error {
 constructor(readonly cause: unknown) { super('The setting was saved, but the settings view could not refresh.'); this.name = 'SettingsRefreshError'; }
}

/** The write is the save acknowledgment: it alone holds the handoff guard and
 * alone decides failure. A pending or failed refresh neither reports a saved
 * value as failed nor keeps navigation/close waiting. */
export async function persistSettingsChange(write: () => Promise<unknown>, refresh: () => Promise<unknown>): Promise<void> {
 await settingsOperation(write);
 try { await refresh(); }
 catch (cause) { throw new SettingsRefreshError(cause); }
}
