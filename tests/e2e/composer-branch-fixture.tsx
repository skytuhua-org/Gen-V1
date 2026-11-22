import { createRoot } from 'react-dom/client';
import { ComposerToolbar } from '../../apps/web/src/ComposerToolbar';
import { ComposerBranchChip } from '../../apps/web/src/ComposerBranchChip';
import type { ProjectContext } from '../../packages/contracts/workspace';
import '../../apps/web/src/styles.css';
import '../../apps/web/src/shell.css';
import '../../apps/web/src/appearance.css';

const root = createRoot(document.getElementById('root')!);
const calls: string[] = [];
const context = {
  capabilities: { git: true, gitWrite: true, terminal: true, pullRequests: true },
} as unknown as ProjectContext;
function Fixture() {
  Object.assign(window, { composerBranchFixture: { calls, unmount: () => root.unmount() } });
  return <main className="app-shell">
    <section className="composer" style={{ width: 'min(100%,760px)', margin: 'auto', padding: 12 }}>
      <textarea aria-label="Draft" defaultValue="Keep this draft" />
      <ComposerToolbar models={[{ id: 'test/model', provider: 'test', name: 'Fixture model' }]}
        modelId="test/model" thinkingLevel="" onModelChange={() => {}} onThinkingChange={() => {}}
        onProject={() => { calls.push('project'); }} onTranscript={() => {}}
        onChanges={() => { calls.push('changes'); }} onCreatePR={() => { calls.push('pr'); }}
        branchChip={<ComposerBranchChip projectId="fixture-project" threadId="task-thread" context={context} onOpenChanges={() => { calls.push('changes'); }} />} />
    </section>
  </main>;
}
root.render(<Fixture />);
