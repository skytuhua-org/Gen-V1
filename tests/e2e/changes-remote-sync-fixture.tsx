import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RemoteSync } from '../../apps/web/src/RemoteSync';
import { Toaster } from '../../packages/ui-shell/Toast';
import '../../apps/web/src/styles.css';
import '../../apps/web/src/remote-sync.css';

function Fixture() {
  const params = new URLSearchParams(location.search);
  const [tick, setTick] = useState(0), [reloads, setReloads] = useState(0);
  return <main>
    <nav aria-label="Fixture controls">
      <button type="button" onClick={() => setTick(value => value + 1)}>Refresh</button>
      <input aria-label="Preserved draft" defaultValue="Keep this draft" />
    </nav>
    <div className="live-review">
      <div className="panel-toolbar">
        <strong>Changes</strong>
        <RemoteSync base="/api/projects/project-a" query={new URLSearchParams(params.has('thread') ? { threadId: 'thread-a' } : {})} active={!params.has('inactive')} tick={tick} onChanged={async () => setReloads(value => value + 1)} />
      </div>
    </div>
    <output data-testid="changed-count">{reloads}</output>
    <Toaster />
  </main>;
}
createRoot(document.getElementById('root')!).render(<Fixture />);
