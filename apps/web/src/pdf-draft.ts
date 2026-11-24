import type { DocumentPreviewProps } from '../../../packages/ui-catalog/documents';
import type { VisualSignature } from '../../../packages/ui-catalog/signature-data';
import { draftInput, isPdfDraft, type PdfDraft } from './pdf-draft-protocol';

type Pending = { finish(error?: unknown, draft?: PdfDraft): void };
/** One worker serves every draft request tagged by id; drafts during a busy
 * editing session no longer pay a worker startup each. Idle teardown keeps no
 * renderer around once previews stop requesting work. */
const IDLE_TEARDOWN_MS = 30_000;
const pending = new Map<string, Pending>();
let worker: Worker | undefined, idleTimer: ReturnType<typeof setTimeout> | undefined;

const finishRequest = (id: string, error?: unknown, draft?: PdfDraft) => {
  const entry = pending.get(id);
  if (!entry) return;
  pending.delete(id);
  entry.finish(error, draft);
  if (!pending.size) { clearTimeout(idleTimer); idleTimer = setTimeout(teardown, IDLE_TEARDOWN_MS); }
};
const rejectAll = (error: unknown) => { for (const id of [...pending.keys()]) finishRequest(id, error); };
function teardown() {
  if (!worker) return;
  const doomed = worker; worker = undefined;
  doomed.onmessage = null; doomed.onerror = null; doomed.onmessageerror = null;
  doomed.terminate();
  rejectAll(new Error('The PDF draft worker closed before responding.'));
}
function shared(): Worker {
  clearTimeout(idleTimer);
  if (worker) return worker;
  const created = new Worker(new URL('./pdf-draft.worker.ts', import.meta.url), { type: 'module', name: 'pdf-draft' });
  created.onerror = event => {
    event.preventDefault();
    const detail = String(event.message ?? '').slice(0, 1_000);
    rejectAll(new Error(`The PDF draft worker could not process this document.${detail ? ` ${detail}` : ''}`));
    teardown();
  };
  created.onmessageerror = () => rejectAll(new Error('Invalid PDF draft worker response.'));
  created.onmessage = ({ data }: MessageEvent<unknown>) => {
    if (!data || typeof data !== 'object' || !('id' in data) || typeof data.id !== 'string') { rejectAll(new Error('Invalid PDF draft worker response.')); teardown(); return; }
    // A reply for an aborted or timed-out request arrives after its entry is
    // gone: ignore it instead of fencing the shared worker for the siblings.
    if (!pending.has(data.id)) return;
    if ('error' in data && typeof data.error === 'string' && data.error.length > 0 && data.error.length <= 1000) finishRequest(data.id, new Error(data.error));
    else if ('draft' in data && isPdfDraft(data.draft)) finishRequest(data.id, undefined, data.draft);
    else finishRequest(data.id, new Error('Invalid PDF draft worker response.'));
  };
  worker = created;
  return created;
}

/** Each draft shares the module worker but keeps its own deadline and terminal cleanup. */
export async function createPdfDraft(source: Uint8Array, values: Record<string, unknown> = {}, signature: VisualSignature | null = null, box?: DocumentPreviewProps['signatureBox'], signal?: AbortSignal, signaturePng?: Uint8Array): Promise<PdfDraft> {
  signal?.throwIfAborted();
  const input = draftInput(source, values, signature, box, signaturePng);
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const finish = (error?: unknown, draft?: PdfDraft) => {
      clearTimeout(timer); signal?.removeEventListener('abort', abort);
      if (error !== undefined) reject(error); else resolve(draft!);
    };
    const abort = () => finishRequest(id, signal?.reason ?? new DOMException('PDF draft aborted.', 'AbortError'));
    const timer = setTimeout(() => finishRequest(id, new Error('PDF draft processing exceeded the preview time limit. Try again or open the source.')), 15_000);
    signal?.addEventListener('abort', abort, { once: true });
    pending.set(id, { finish });
    try {
      signal?.throwIfAborted();
      // Slice the view, not its backing allocation; keep original source bytes attached and immutable.
      const bytes = source.slice(); shared().postMessage({ ...input, source: bytes, id }, [bytes.buffer]);
    } catch (error) { finishRequest(id, error); }
  });
}
