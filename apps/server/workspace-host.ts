import type {Service} from '../../packages/core/service.ts';
import {ProjectTools} from '../../packages/workspace/tools.ts';
import {TerminalHost} from '../../packages/workspace/terminal.ts';
import {DevServerTracker} from '../../packages/workspace/dev-servers.ts';
import type {IntegrationManager} from '../../packages/integrations/index.ts';
import type {IntegrationSecretReferenceStatus} from '../../packages/contracts/integration-secrets.ts';
import {GitHubTools} from '../../packages/workspace/github.ts';

export interface WorkspaceHost{projects:ProjectTools;terminals:TerminalHost;devServers?:DevServerTracker;github?:GitHubTools;integrations?:IntegrationManager;context7Key?:(key:string)=>Promise<void>;secretReferences?:()=>Promise<IntegrationSecretReferenceStatus>}
export const githubFor=(host:WorkspaceHost)=>host.github??=new GitHubTools(host.projects,host.terminals);
const hosts=new WeakMap<Service,WorkspaceHost>();
export function workspaceHost(service:Service):WorkspaceHost{let host=hosts.get(service);if(!host){host={projects:new ProjectTools(service.store),terminals:null!,devServers:new DevServerTracker()};host.terminals=new TerminalHost(host.projects,host.devServers);hosts.set(service,host);}return host;}
export function registerWorkspaceHost(service:Service,host:WorkspaceHost){if(hosts.has(service))throw Error('Workspace host is already registered.');hosts.set(service,host);}
