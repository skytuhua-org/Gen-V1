import {toast} from '../../../packages/ui-shell/Toast';
import {command} from './api';

export function notifyThreadArchived(threadId: string, title: string, refresh: () => Promise<void>) {
  let restoring = false;
  toast(`Archived "${title}"`, {
    dedupeKey: 'thread-archive:' + threadId,
    action: {
      label: 'Undo',
      onClick: () => {
        if (restoring) return;
        restoring = true;
        void command('thread.restore', {}, threadId).then(
          () => refresh().catch(() => toast('The thread was restored. Refresh to update the conversation list.', {tone: 'error'})),
          () => toast('The thread could not be restored. Restore it from Settings → Archive.', {tone: 'error'}),
        );
      },
    },
  });
}
