import {createRoot} from 'react-dom/client';
import {RunningServers} from '../../../apps/web/src/RunningServers';
import '@fontsource-variable/inter';
import '../../../apps/web/src/styles.css';
import '../../../apps/web/src/project-context.css';

const query=new URLSearchParams(location.search);
if(query.get('theme'))document.documentElement.dataset.theme=query.get('theme')!;
if(query.get('motion'))document.documentElement.dataset.motion=query.get('motion')!;

const fixture={refresh:()=>window.dispatchEvent(new Event('gen:dev-servers-refresh'))};
Object.assign(window,{runningServersFixture:fixture});

function Fixture(){
 return <main className="app-shell" style={{padding:16,maxWidth:520}}>
  <p className="fixture-label">Synthetic API · real RunningServers container</p>
  <div className="project-context-card">
   <RunningServers projectId="project-a" threadId="thread-a"/>
  </div>
 </main>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);

export type RunningServersFixture=typeof fixture;
