import {useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {App} from '../../apps/web/src/App';
import {SavedDrafts} from '../../apps/web/src/SavedDrafts';
import '@fontsource-variable/inter';
import '../../apps/web/src/styles.css';
import '../../apps/web/src/frontend-fidelity.css';
import './pasted-text-fixture.css';
function Fixture(){
 const input=useRef<HTMLTextAreaElement>(null);
 return <><App/><div data-saved-drafts-fixture hidden={!new URLSearchParams(location.search).has('saved')}><textarea ref={input} hidden aria-label="Restore target"/><SavedDrafts owner={{profileId:'capture',accountId:null,threadId:'new',projectId:null,workingCopyId:null}} input={input}/></div></>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);
