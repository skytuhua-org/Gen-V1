// One-use guarded download for "Save .patch…" (#1604, plan D5). Mirrors
// memory-export.ts: the download is admitted only for the owning document's
// single matching will-download event, then verified byte-for-byte.
import {createHash, randomBytes} from 'node:crypto';
import type {DownloadItem, Session, WebContents, WebFrameMain} from 'electron';
import type {DesktopPatchSaveRequest, DesktopPatchSaveResult, DesktopSurface} from '../../packages/desktop-contract/index.ts';

const MAX_BYTES = 4 * 1024 * 1024, MAX_PENDING = 4, ADMISSION_MS = 10_000, SAVE_MS = 300_000;
const WORLD = 1702;
const FILENAME = /^[A-Za-z0-9._-]{1,120}\.patch$/;
type Refusal = 'NO_OWNED_EVENT' | 'CONTENTS_MISMATCH' | 'FRAME_MISMATCH' | 'ORIGIN_MISMATCH' | 'URL_MISMATCH' | 'CHAIN_MISMATCH' | 'FILENAME_MISMATCH';
export interface PatchSaveOwner {
  contents: WebContents;
  surface: DesktopSurface;
  documentUrl: string;
  isCurrent(): boolean;
}
interface Pending {
  owner: PatchSaveOwner;
  frame: WebFrameMain;
  origin: string;
  url: string;
  receipt: {filename: string; bytes: number; sha256: string};
  admitted: boolean;
  refusal: Refusal;
  item?: DownloadItem;
  timer: ReturnType<typeof setTimeout>;
  finish(error?: Error, status?: DesktopPatchSaveResult['status']): void;
  done(event: unknown, state: string): void;
}
const error = (reason: string) => Error('Patch save: ' + reason);
function prepare(request: DesktopPatchSaveRequest) {
  if (!request || typeof request.filename !== 'string' || !FILENAME.test(request.filename)) throw error('the filename is not a safe .patch name.');
  const bytes = Buffer.from(String(request.contentBase64 ?? ''), 'base64');
  if (bytes.length > MAX_BYTES) throw error('the patch exceeds its byte bound.');
  if (createHash('sha256').update(bytes).digest('hex') !== request.sha256) throw error('the patch digest does not match.');
  return {bytes, filename: request.filename, sha256: request.sha256};
}
function current(entry: Pick<Pending, 'owner' | 'frame'>) {
  try {
    const {owner, frame} = entry, contents = owner.contents;
    return owner.isCurrent() && !contents.isDestroyed() && contents.getURL() === owner.documentUrl && contents.mainFrame === frame && frame.url === owner.documentUrl;
  } catch {return false;}
}

/** The normal trusted-session guard remains deny-by-default, including during a save. */
export function createPatchSaveDownloads() {
  const guarded = new WeakSet<Session>(), pending = new Map<WebContents, Pending>();
  function guard(session: Session, ownedElsewhere?: (contents: WebContents) => boolean) {
    if (guarded.has(session)) return;
    guarded.add(session);
    session.on('will-download', (event, item, contents, frame) => {
      const entry = pending.get(contents);
      // Another guarded download service can own this event; never cancel it.
      if (!entry || entry.admitted) {if (!ownedElsewhere?.(contents)) event.preventDefault(); return;}
      if (!current(entry)) {event.preventDefault(); entry.finish(error('the owning document changed.')); return;}
      try {
        const chain = item.getURLChain();
        const refusal: Refusal | undefined = contents !== entry.owner.contents ? 'CONTENTS_MISMATCH'
          : frame !== entry.frame ? 'FRAME_MISMATCH'
          : item.getInitiatorOrigin() !== entry.origin ? 'ORIGIN_MISMATCH'
          : item.getURL() !== entry.url ? 'URL_MISMATCH'
          : chain.length !== 1 || chain[0] !== entry.url ? 'CHAIN_MISMATCH'
          : item.getFilename() !== entry.receipt.filename ? 'FILENAME_MISMATCH' : undefined;
        if (refusal) {entry.refusal = refusal; event.preventDefault(); return;}
        entry.admitted = true; entry.item = item; clearTimeout(entry.timer); entry.url = '';
        item.once('done', entry.done);
        entry.timer = setTimeout(() => entry.finish(error('the native save did not complete within five minutes.')), SAVE_MS);
        item.setSaveDialogOptions({title: 'Save patch', defaultPath: entry.receipt.filename, filters: [{name: 'Patch', extensions: ['patch', 'diff']}, {name: 'All files', extensions: ['*']}], properties: ['showOverwriteConfirmation']});
      } catch {event.preventDefault(); entry.finish(error('native download admission failed.'));}
    });
  }
  async function savePatch(owner: PatchSaveOwner, request: DesktopPatchSaveRequest): Promise<DesktopPatchSaveResult> {
    const prepared = prepare(request), frame = owner.contents.mainFrame;
    if (!current({owner, frame})) throw error('the native surface does not own this save.');
    if (pending.has(owner.contents) || pending.size >= MAX_PENDING) throw error('another save must finish before opening this dialog.');
    guard(owner.contents.session);
    const origin = new URL(owner.documentUrl).origin;
    if (origin === 'null') throw error('the trusted application origin is unavailable.');
    const url = 'data:text/x-diff;charset=utf-8;harness-patch-save=' + randomBytes(24).toString('hex') + ';base64,' + prepared.bytes.toString('base64');
    const script = '(()=>{const link=document.createElement("a");link.href=' + JSON.stringify(url) + ';link.download=' + JSON.stringify(prepared.filename) + ';document.body.append(link);link.click();link.remove();})()';
    return new Promise<DesktopPatchSaveResult>((resolve, reject) => {
      let settled = false;
      const navigation = (details: {isMainFrame?: boolean}, _url?: string, _inPlace?: boolean, mainFrame?: boolean) => {if (details?.isMainFrame ?? mainFrame) entry.finish(error('the owning document navigated.'));};
      const destroyed = () => entry.finish(error('the owning window closed.'));
      const entry: Pending = {
        owner, frame, origin, url, admitted: false, refusal: 'NO_OWNED_EVENT',
        receipt: {filename: prepared.filename, bytes: prepared.bytes.length, sha256: prepared.sha256},
        timer: setTimeout(() => entry.finish(error('the native download was not admitted before expiry (refusal=' + entry.refusal + ').')), ADMISSION_MS),
        finish(cause, status) {
          if (settled) return; settled = true;
          clearTimeout(entry.timer); pending.delete(owner.contents); entry.url = '';
          owner.contents.removeListener('did-start-navigation', navigation); owner.contents.removeListener('destroyed', destroyed);
          if (entry.item) {entry.item.removeListener('done', entry.done); if (cause) {try {entry.item.cancel();} catch { /* already closed */ }}}
          if (cause) reject(cause); else resolve({status: status!, ...(status === 'saved' ? {filename: entry.receipt.filename} : {})});
        },
        done(_event, state) {
          if (!current(entry)) {entry.finish(error('the owning document changed before save completion.')); return;}
          if (state === 'cancelled') {entry.finish(undefined, 'cancelled'); return;}
          try {
            if (state !== 'completed' || entry.item!.getReceivedBytes() !== entry.receipt.bytes) {entry.finish(error('the native save was interrupted or its byte count changed.')); return;}
          } catch {entry.finish(error('native save completion could not be verified.')); return;}
          entry.finish(undefined, 'saved');
        },
      };
      pending.set(owner.contents, entry);
      owner.contents.on('did-start-navigation', navigation); owner.contents.once('destroyed', destroyed);
      try {
        void owner.contents.executeJavaScriptInIsolatedWorld(WORLD, [{code: script}], true).then(() => {
          if (!settled && !current(entry)) entry.finish(error('the owning document changed during export.'));
        }, cause => entry.finish(cause instanceof Error ? cause : error('the download could not start.')));
      } catch (cause) {entry.finish(cause instanceof Error ? cause : error('the download could not start.'));}
    });
  }
  return {guard, save: savePatch, owns: (contents: WebContents) => pending.has(contents)};
}
