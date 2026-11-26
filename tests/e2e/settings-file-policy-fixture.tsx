import {createRoot} from 'react-dom/client';
import {StrictMode} from 'react';
import {AgentFileProtection} from '../../apps/web/src/AgentFileProtection';
import '../../apps/web/src/styles.css';
import '../../apps/web/src/settings.css';
import '../../apps/web/src/agent-file-protection.css';

const settings=<AgentFileProtection projects={[{id:'project:alpha',label:'Alpha project'}]} busy={false}/>;
createRoot(document.getElementById('root')!).render(
	new URLSearchParams(location.search).has('strict')?<StrictMode>{settings}</StrictMode>:settings,
);
