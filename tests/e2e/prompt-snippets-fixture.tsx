import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { usePromptSnippets, PromptSnippetsTrigger, PromptSnippetsOverlay, PromptSnippetsReceipt } from '../../apps/web/src/PromptSnippets';
import { createSnippet, loadSnippetLibrary } from '../../apps/web/src/prompt-snippets';
import '../../apps/web/src/styles.css';
import '../../apps/web/src/composer-toolbar.css';
import '../../apps/web/src/saved-drafts.css';

const PROFILE = 'e2e-snippets';
const SEED: { name: string; body: string }[] = [
  { name: 'Standup note', body: 'Yesterday: review queue\nToday: ship the fix\nBlockers: none waiting' },
  { name: 'PR checklist', body: '- [ ] unit tests\n- [ ] lint\n- [ ] screenshots attached' },
];
declare global { interface Window { snippetsSeeded?: Promise<void> } }

function Fixture() {
  const input = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState('Check the logs first.');
  const snippets = usePromptSnippets({ input, signature: 'e2e', editable: () => true, onEdit: setDraft, profileId: PROFILE });
  window.snippetsSeeded ??= (async () => {
    const first = await loadSnippetLibrary(PROFILE);
    if (!first.ok || first.library.snippets.length) return;
    let generation = first.generation;
    for (const seed of SEED) { const created = await createSnippet(PROFILE, generation, seed); if (created.ok) generation = created.generation; }
  })();
  useEffect(() => { void window.snippetsSeeded; }, []);
  return <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '12px', background: 'var(--canvas)' }}>
    <form className="composer-form" onSubmit={event => event.preventDefault()}>
      <textarea ref={input} aria-label="Message" value={draft} onChange={event => setDraft(event.target.value)} rows={4} />
      <div className="composer-toolbar">
        <div className="toolbar-group" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          <button type="button" className="quiet saved-drafts-trigger" disabled>Saved drafts</button>
          <PromptSnippetsTrigger snippets={snippets} />
          <button type="button" className="icon-button attach-button" aria-label="Attach files">+</button>
        </div>
      </div>
      <PromptSnippetsReceipt snippets={snippets} />
      <PromptSnippetsOverlay snippets={snippets} />
    </form>
  </div>;
}
createRoot(document.getElementById('root')!).render(<Fixture />);
