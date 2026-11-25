import {createHash, randomBytes} from 'node:crypto';
import type {Session, WebContents} from 'electron';
import type {DesktopSettingsExportResult, DesktopSurface} from '../../packages/desktop-contract/index.ts';
import {parseSettingsFile, SETTINGS_FILE_LIMIT} from '../../packages/contracts/settings-transfer.ts';
import type {DownloadPermit} from './memory-export.ts';

const MAX_PENDING = 4, ADMISSION_MS = 10_000, SAVE_MS = 300_000;
const WORLD = 1702;
type Refusal = 'NO_OWNED_EVENT' | 'CONTENTS_MISMATCH' | 'FRAME_MISMATCH' | 'ORIGIN_MISMATCH' | 'URL_MISMATCH' | 'CHAIN_MISMATCH' | 'FILENAME_MISMATCH';
export interface SettingsExportOwner {
  contents: WebContents;
  surface: DesktopSurface;
  documentUrl: string;
  isCurrent(): boolean;
}
const error = (reason: string) => Error('Settings export: ' + reason);
function prepare(serialized: unknown, filename: unknown) {
  if (typeof serialized !== 'string' || serialized.length > SETTINGS_FILE_LIMIT || Buffer.byteLength(serialized) > SETTINGS_FILE_LIMIT) throw error('the bounded settings file is required.');
  if (typeof filename !== 'string' || !/^gen-settings-\d{4}-\d{2}-\d{2}\.json$/.test(filename)) throw error('the generated settings filename is required.');
  const parsed = parseSettingsFile(serialized);
  if (!parsed.ok) throw error('a valid gen.settings file is required.');
  const content = serialized.endsWith('\n') ? serialized : serialized + '\n', bytes = Buffer.byteLength(content);
  return {content, filename, bytes, sha256: createHash('sha256').update(content).digest('hex')};
}
function current(entry: Pick<DownloadPermit, 'owner' | 'frame'>) {
  try {
    const {owner, frame} = entry, contents = owner.contents;
    return owner.isCurrent() && !contents.isDestroyed() && contents.getURL() === owner.documentUrl && contents.mainFrame === frame && frame.url === owner.documentUrl;
  } catch {return false;}
}

/** Settings export reuses the bounded one-use download policy of project memory. When
 *  the memory policy is passed in, its single `will-download` listener serves both permit
 *  maps — two listeners on one session would each deny the other's owned download. */
export function createSettingsExportDownloads(host?: {guard(session: Session): void; attach(source: Map<WebContents, DownloadPermit>): void}) {
  const pending = new Map<WebContents, DownloadPermit>();
  host?.attach(pending);
  const guarded = new WeakSet<Session>();
  function guard(session: Session) {
    if (guarded.has(session)) return;
    guarded.add(session);
    session.on('will-download', (event, item, contents, frame) => {
      const entry = pending.get(contents);
      if (!entry || entry.admitted) {event.preventDefault(); return;}
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
        item.setSaveDialogOptions({title: 'Export settings', defaultPath: entry.receipt.filename, filters: [{name: 'JSON', extensions: ['json']}], properties: ['showOverwriteConfirmation']});
      } catch {event.preventDefault(); entry.finish(error('native download admission failed.'));}
    });
  }
  async function exportSettings(owner: SettingsExportOwner, serialized: unknown, filename: unknown): Promise<DesktopSettingsExportResult> {
    const prepared = prepare(serialized, filename), frame = owner.contents.mainFrame;
    if (owner.surface.kind !== 'main' || !current({owner, frame})) throw error('the native surface does not own this export.');
    if (pending.has(owner.contents) || pending.size >= MAX_PENDING) throw error('another export must finish before opening this save dialog.');
    (host ? host.guard : guard)(owner.contents.session);
    const origin = new URL(owner.documentUrl).origin;
    if (origin === 'null') throw error('the trusted application origin is unavailable.');
    const url = 'data:application/json;charset=utf-8;harness-settings-export=' + randomBytes(24).toString('hex') + ';base64,' + Buffer.from(prepared.content).toString('base64');
    const script = '(()=>{const link=document.createElement("a");link.href=' + JSON.stringify(url) + ';link.download=' + JSON.stringify(prepared.filename) + ';document.body.append(link);link.click();link.remove();})()';
    return new Promise<DesktopSettingsExportResult>((resolve, reject) => {
      let settled = false;
      const navigation = (details: {isMainFrame?: boolean}, _url?: string, _inPlace?: boolean, mainFrame?: boolean) => {if (details?.isMainFrame ?? mainFrame) entry.finish(error('the owning document navigated.'));};
      const destroyed = () => entry.finish(error('the owning window closed.'));
      const entry: DownloadPermit = {
        owner, frame, origin, url, admitted: false, refusal: 'NO_OWNED_EVENT',
        receipt: {admitted: true, filename: prepared.filename, bytes: prepared.bytes, sha256: prepared.sha256},
        dialog: {title: 'Export settings', filters: [{name: 'JSON', extensions: ['json']}], properties: ['showOverwriteConfirmation']},
        timer: setTimeout(() => entry.finish(error('the native download was not admitted before expiry (refusal=' + entry.refusal + ').')), ADMISSION_MS),
        finish(cause, status) {
          if (settled) return; settled = true;
          clearTimeout(entry.timer); pending.delete(owner.contents); entry.url = '';
          owner.contents.removeListener('did-start-navigation', navigation); owner.contents.removeListener('destroyed', destroyed);
          if (entry.item) {entry.item.removeListener('done', entry.done); if (cause) {try {entry.item.cancel();} catch { /* already closed */ }}}
          if (cause) reject(cause); else resolve({...entry.receipt, status: status!});
        },
        done(_event, state) {
          if (!current(entry)) {entry.finish(error('the owning document changed before save completion.')); return;}
          if (state === 'cancelled') {entry.finish(undefined, 'cancelled'); return;}
          try {
            if (state !== 'completed' || entry.item!.getReceivedBytes() !== prepared.bytes) {entry.finish(error('the native save was interrupted or its byte count changed.')); return;}
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
  return {guard: (session: Session) => (host ? host.guard : guard)(session), export: exportSettings};
}
