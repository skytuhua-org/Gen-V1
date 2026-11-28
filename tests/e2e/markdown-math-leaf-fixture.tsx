import {StrictMode, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {MarkdownMath, useMathRenderOwner} from '../../apps/web/src/MarkdownMath';

const root = document.querySelector('#root');
if (!root) throw new Error('Missing fixture root');

function Fixture() {
  const [revision, setRevision] = useState(0);
  const [ownerKey, setOwnerKey] = useState('first');
  const [present, setPresent] = useState(true);
  const [hidden, setHidden] = useState(() => new URLSearchParams(location.search).has('hidden'));
  const [inert, setInert] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const owner = useMathRenderOwner(ownerKey, revision, enabled);
  const inline = revision % 2 === 0 ? 'x+1' : 'y+2';
  const display = revision % 2 === 0 ? 'a^2' : '\\notacommand';
  const rawDisplay = '$$\r\n' + display + '\r\n$$';
  return <>
    <button onClick={() => setRevision(value => value + 1)}>Next revision</button>
    <button onClick={() => setOwnerKey(value => value === 'first' ? 'second' : 'first')}>Change owner</button>
    <button onClick={() => setPresent(value => !value)}>Toggle leaves</button>
    <button onClick={() => setHidden(value => !value)}>Toggle hidden</button>
    <button onClick={() => setInert(value => !value)}>Toggle inert</button>
    <button onClick={() => setEnabled(value => !value)}>Toggle rendering</button>
    <p id="prose">Unrelated selectable prose.</p>
    <section hidden={hidden} inert={inert}>
      {present && <>
        <p><MarkdownMath owner={owner} ownerKey={ownerKey} sourceRevision={revision} leafKey="inline" span={{start:0,end:5,raw:'$' + inline + '$',tex:inline,mode:'inline'}} /></p>
        <p><MarkdownMath owner={owner} ownerKey={ownerKey} sourceRevision={revision} leafKey="sibling" span={{start:20,end:23,raw:'$z$',tex:'z',mode:'inline'}} /></p>
        <MarkdownMath owner={owner} ownerKey={ownerKey} sourceRevision={revision} leafKey="display" span={{start:30,end:30 + rawDisplay.length,raw:rawDisplay,tex:display,mode:'display'}} />
      </>}
    </section>
  </>;
}

createRoot(root).render(<StrictMode><Fixture /></StrictMode>);
